import "server-only";
import { createCampayPaymentLink, hasCampayCredentials } from "@/lib/campay";

type CreateCheckoutInput = {
    amountCents: number;
    currency: string;
    description: string;
    successUrl: string;
    cancelUrl: string;
    customerEmail?: string;
    customerPhone?: string;
    metadata?: Record<string, string>;
    paymentMethodTypes?: Array<"card" | "us_bank_account" | "mtn_mobile_money" | "orange_money">;
};

export type CheckoutSessionResult = {
    provider: "stripe" | "jengupay" | "campay";
    checkoutUrl: string;
    reference: string;
};

type StripeCheckoutResponse = {
    id?: string;
    url?: string;
    error?: {
        message?: string;
    };
};

type JengupayCheckoutResponse = {
    id?: string;
    reference?: string;
    checkout_url?: string;
    payment_url?: string;
    url?: string;
    link?: string;
    message?: string;
    data?: {
        id?: string;
        reference?: string;
        checkout_url?: string;
        payment_url?: string;
        url?: string;
        link?: string;
    };
};

function hasJengupayCredentials(): boolean {
    return Boolean(process.env.JENGUPAY_SECRET_KEY || process.env.JENGUPAY_API_KEY);
}

function resolveCampayPaymentOptions(
    paymentMethodTypes: CreateCheckoutInput["paymentMethodTypes"]
): "MOMO" | "CARD" | "MOMO,CARD" {
    const method = paymentMethodTypes?.[0];
    if (method === "mtn_mobile_money" || method === "orange_money") {
        return "MOMO";
    }
    if (method === "card") {
        return "CARD";
    }
    return "MOMO,CARD";
}

function getFirstAndLastNameFromEmail(email?: string): { firstName: string; lastName: string } {
    if (!email || !email.includes("@")) {
        return { firstName: "Applicant", lastName: "" };
    }

    const local = email.split("@")[0]?.trim() || "";
    if (!local) {
        return { firstName: "Applicant", lastName: "" };
    }

    const rawParts = local.split(/[._-]+/).filter(Boolean);
    const firstName = rawParts[0] || "Applicant";
    const lastName = rawParts.length > 1 ? rawParts.slice(1).join(" ") : "";

    return { firstName, lastName };
}

async function createCampayCheckoutSession(input: CreateCheckoutInput): Promise<CheckoutSessionResult> {
    const paymentOptions = resolveCampayPaymentOptions(input.paymentMethodTypes);
    const referenceFallback =
        input.metadata?.reference ||
        input.metadata?.applicationId ||
        input.metadata?.donationId ||
        "campay-payment";
    const firstAndLast = getFirstAndLastNameFromEmail(input.customerEmail);

    const paymentLink = await createCampayPaymentLink({
        amountCents: input.amountCents,
        currency: input.currency,
        description: input.description,
        successUrl: input.successUrl,
        cancelUrl: input.cancelUrl,
        externalReference: referenceFallback,
        paymentOptions,
        customerPhone: input.customerPhone,
        customerEmail: input.customerEmail,
        customerFirstName: firstAndLast.firstName,
        customerLastName: firstAndLast.lastName,
    });

    return {
        provider: "campay",
        checkoutUrl: paymentLink.link,
        reference: paymentLink.reference,
    };
}

function resolveJengupayMethod(
    paymentMethodTypes: CreateCheckoutInput["paymentMethodTypes"]
): "card" | "mtn_mobile_money" | "orange_money" | "bank_transfer" {
    const method = paymentMethodTypes?.[0];
    if (method === "mtn_mobile_money") {
        return "mtn_mobile_money";
    }
    if (method === "orange_money") {
        return "orange_money";
    }
    if (method === "us_bank_account") {
        return "bank_transfer";
    }
    return "card";
}

function extractJengupayCheckoutFields(payload: JengupayCheckoutResponse): {
    checkoutUrl?: string;
    reference?: string;
} {
    const checkoutUrl =
        payload.checkout_url ||
        payload.payment_url ||
        payload.url ||
        payload.link ||
        payload.data?.checkout_url ||
        payload.data?.payment_url ||
        payload.data?.url ||
        payload.data?.link;

    const reference = payload.reference || payload.id || payload.data?.reference || payload.data?.id;

    return {
        checkoutUrl,
        reference,
    };
}

async function createStripeCheckoutSession(input: CreateCheckoutInput): Promise<CheckoutSessionResult> {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
        throw new Error("STRIPE_SECRET_KEY is not configured.");
    }

    const params = new URLSearchParams();
    params.set("mode", "payment");
    params.set("success_url", input.successUrl);
    params.set("cancel_url", input.cancelUrl);
    params.set("line_items[0][quantity]", "1");
    params.set("line_items[0][price_data][currency]", input.currency.toLowerCase());
    params.set("line_items[0][price_data][unit_amount]", String(input.amountCents));
    params.set("line_items[0][price_data][product_data][name]", input.description);

    const paymentMethodTypes =
        input.paymentMethodTypes && input.paymentMethodTypes.length > 0
            ? input.paymentMethodTypes
            : ["card"];

    paymentMethodTypes.forEach((method, index) => {
        params.set(`payment_method_types[${index}]`, method);
    });

    if (paymentMethodTypes.includes("us_bank_account")) {
        params.set(
            "payment_method_options[us_bank_account][financial_connections][permissions][0]",
            "payment_method"
        );
        params.set("payment_method_options[us_bank_account][verification_method]", "automatic");
    }

    if (input.customerEmail) {
        params.set("customer_email", input.customerEmail);
    }

    if (input.metadata) {
        for (const [key, value] of Object.entries(input.metadata)) {
            params.set(`metadata[${key}]`, value);
            params.set(`payment_intent_data[metadata][${key}]`, value);
        }
    }

    const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${secretKey}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
    });

    const data = (await response.json()) as StripeCheckoutResponse;
    if (!response.ok || !data.id || !data.url) {
        throw new Error(data.error?.message || "Failed to create Stripe checkout session.");
    }

    return {
        provider: "stripe",
        checkoutUrl: data.url,
        reference: data.id,
    };
}

async function createJengupayCheckoutSession(input: CreateCheckoutInput): Promise<CheckoutSessionResult> {
    const baseUrl = process.env.JENGUPAY_API_URL || "https://api.jengupay.com/v1/payments/checkout";
    const secretKey = process.env.JENGUPAY_SECRET_KEY;
    const apiKey = process.env.JENGUPAY_API_KEY;

    if (!secretKey && !apiKey) {
        throw new Error("Jengupay credentials are missing.");
    }

    const paymentMethod = resolveJengupayMethod(input.paymentMethodTypes);
    const payload = {
        amount: input.amountCents / 100,
        currency: input.currency.toUpperCase(),
        description: input.description,
        payment_method: paymentMethod,
        customer: {
            email: input.customerEmail || "",
            phone: input.customerPhone || "",
        },
        return_url: input.successUrl,
        cancel_url: input.cancelUrl,
        metadata: input.metadata || {},
    };

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };

    if (secretKey) {
        headers.Authorization = `Bearer ${secretKey}`;
    }
    if (apiKey) {
        headers["X-API-Key"] = apiKey;
    }

    const response = await fetch(baseUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
    });

    const data = (await response.json()) as JengupayCheckoutResponse;
    const checkoutFields = extractJengupayCheckoutFields(data);

    if (!response.ok || !checkoutFields.checkoutUrl || !checkoutFields.reference) {
        throw new Error(data.message || "Failed to create Jengupay checkout session.");
    }

    return {
        provider: "jengupay",
        checkoutUrl: checkoutFields.checkoutUrl,
        reference: checkoutFields.reference,
    };
}

export async function createCheckoutSession(input: CreateCheckoutInput): Promise<CheckoutSessionResult | null> {
    if (
        hasCampayCredentials() &&
        !input.paymentMethodTypes?.includes("us_bank_account") &&
        input.currency.toUpperCase() === "XAF"
    ) {
        return createCampayCheckoutSession(input);
    }

    const needsJengupay =
        input.paymentMethodTypes?.includes("mtn_mobile_money") ||
        input.paymentMethodTypes?.includes("orange_money");

    if (hasJengupayCredentials()) {
        return createJengupayCheckoutSession(input);
    }

    if (needsJengupay) {
        throw new Error(
            "Jengupay credentials are required for MTN Mobile Money and Orange Money checkout."
        );
    }

    if (process.env.STRIPE_SECRET_KEY) {
        return createStripeCheckoutSession(input);
    }

    return null;
}
