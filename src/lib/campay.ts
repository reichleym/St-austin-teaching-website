import "server-only";

export type CampayEnvironment = "DEV" | "PROD";
type CampayTokenSource = "permanent" | "session";

type CreateCampayPaymentLinkInput = {
    amountCents: number;
    currency: string;
    description: string;
    successUrl: string;
    cancelUrl: string;
    externalReference: string;
    paymentOptions: "MOMO" | "CARD" | "MOMO,CARD";
    customerPhone?: string;
    customerEmail?: string;
    customerFirstName?: string;
    customerLastName?: string;
};

type CampayTokenResponse = {
    token?: string;
    message?: string;
    detail?: string;
    non_field_errors?: unknown;
    [key: string]: unknown;
};

type CampayPaymentLinkResponse = {
    status?: string;
    link?: string;
    reference?: string;
    message?: string;
    detail?: string;
    [key: string]: unknown;
};

type CampayTransactionResponse = {
    status?: string;
    reference?: string;
    message?: string;
    [key: string]: unknown;
};

function getCampayEnvironment(): CampayEnvironment {
    const rawEnv = (process.env.CAMPAY_ENVIRONMENT || process.env.CAMPAY_ENV || "DEV").toUpperCase();
    return rawEnv === "PROD" ? "PROD" : "DEV";
}

function getCampayHost(): string {
    return getCampayEnvironment() === "PROD" ? "https://www.campay.net" : "https://demo.campay.net";
}

function formatCampayErrorMessage(
    action: string,
    response: Response,
    payload: { message?: unknown; detail?: unknown; [key: string]: unknown }
): string {
    const messageParts: string[] = [];
    const payloadMessage = getCampayPayloadMessage(payload);

    if (
        action === "authentication" &&
        response.status === 400 &&
        payloadMessage.toLowerCase().includes("unable to log in with provided credentials")
    ) {
        return [
            "CamPay authentication failed: invalid APP credentials for the selected environment.",
            `HTTP ${response.status} ${response.statusText} (${getCampayEnvironment()} environment).`,
            "Use CAMPAY_APP_USERNAME and CAMPAY_APP_PASSWORD from your CamPay app settings (not account email/password).",
        ].join(" ");
    }

    if (payloadMessage) {
        messageParts.push(payloadMessage);
    } else {
        messageParts.push(`CamPay ${action} request failed.`);
    }

    messageParts.push(
        `HTTP ${response.status} ${response.statusText} (${getCampayEnvironment()} environment)`
    );

    if (!payloadMessage && payload && typeof payload === "object") {
        const payloadKeys = Object.keys(payload);
        if (payloadKeys.length > 0) {
            try {
                messageParts.push(`Response: ${JSON.stringify(payload)}`);
            } catch {
                // Ignore serialization issues and keep a concise fallback message.
            }
        }
    }

    if (response.status === 401) {
        messageParts.push(
            "Check token validity and ensure CAMPAY_ENVIRONMENT matches your CamPay credential environment."
        );
    }

    return messageParts.join(" ");
}

function hasCampayUsernamePasswordCredentials(): boolean {
    return Boolean(process.env.CAMPAY_APP_USERNAME?.trim() && process.env.CAMPAY_APP_PASSWORD?.trim());
}

function getCampayCredentials(): { username: string; password: string } {
    const username = process.env.CAMPAY_APP_USERNAME?.trim() || process.env.CAMPAY_USERNAME?.trim() || "";
    const password = process.env.CAMPAY_APP_PASSWORD?.trim() || process.env.CAMPAY_PASSWORD?.trim() || "";

    if (!username || !password) {
        throw new Error(
            "CamPay credentials are missing. Please set CAMPAY_PERMANENT_ACCESS_TOKEN or CAMPAY_APP_USERNAME and CAMPAY_APP_PASSWORD."
        );
    }

    return { username, password };
}

function getCampayPayloadMessage(payload: {
    message?: unknown;
    detail?: unknown;
    non_field_errors?: unknown;
    [key: string]: unknown;
}): string {
    const nonFieldErrors = payload.non_field_errors;
    if (Array.isArray(nonFieldErrors)) {
        const first = nonFieldErrors.find((item) => typeof item === "string" && item.trim());
        if (typeof first === "string") {
            return first.trim();
        }
    }

    if (typeof payload.message === "string" && payload.message.trim()) {
        return payload.message.trim();
    }

    if (typeof payload.detail === "string" && payload.detail.trim()) {
        return payload.detail.trim();
    }

    return "";
}

function sanitizePhoneNumber(phone?: string): string {
    if (!phone) {
        return "";
    }

    const digitsOnly = phone.replace(/\D+/g, "");
    if (!digitsOnly) {
        return "";
    }

    return digitsOnly.startsWith("237") ? digitsOnly : `237${digitsOnly}`;
}

function normalizeAmountForCampay(amountCents: number): string {
    const amount = amountCents / 100;
    return Number.isInteger(amount) ? String(amount) : amount.toFixed(2);
}

export function hasCampayCredentials(): boolean {
    return Boolean(
        process.env.CAMPAY_PERMANENT_ACCESS_TOKEN ||
        hasCampayUsernamePasswordCredentials()
    );
}

async function requestCampaySessionToken(): Promise<string> {
    const { username, password } = getCampayCredentials();
    const host = getCampayHost();

    const response = await fetch(`${host}/api/token/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            username,
            password,
        }),
    });

    const payload = (await response.json().catch(() => ({}))) as CampayTokenResponse;
    if (!response.ok || !payload.token) {
        throw new Error(formatCampayErrorMessage("authentication", response, payload));
    }

    return payload.token;
}

async function getCampayToken(): Promise<{ token: string; source: CampayTokenSource }> {
    const permanentAccessToken = process.env.CAMPAY_PERMANENT_ACCESS_TOKEN?.trim();
    if (permanentAccessToken) {
        return {
            token: permanentAccessToken,
            source: "permanent",
        };
    }

    return {
        token: await requestCampaySessionToken(),
        source: "session",
    };
}

export async function createCampayPaymentLink(
    input: CreateCampayPaymentLinkInput
): Promise<{ link: string; reference: string }> {
    const auth = await getCampayToken();
    const host = getCampayHost();
    const sanitizedPhone = sanitizePhoneNumber(input.customerPhone);

    const payload: Record<string, string> = {
        amount: normalizeAmountForCampay(input.amountCents),
        currency: input.currency.toUpperCase(),
        description: input.description,
        external_reference: input.externalReference,
        redirect_url: input.successUrl,
        failure_redirect_url: input.cancelUrl,
        payment_options: input.paymentOptions,
        first_name: input.customerFirstName || "Applicant",
        last_name: input.customerLastName || "",
        email: input.customerEmail || "",
    };
    if (sanitizedPhone) {
        payload.from = sanitizedPhone;
    }

    const callCreatePaymentLink = async (token: string) =>
        fetch(`${host}/api/get_payment_link/`, {
            method: "POST",
            headers: {
                Authorization: `Token ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

    let response = await callCreatePaymentLink(auth.token);
    if (
        response.status === 401 &&
        auth.source === "permanent" &&
        hasCampayUsernamePasswordCredentials()
    ) {
        const fallbackSessionToken = await requestCampaySessionToken();
        response = await callCreatePaymentLink(fallbackSessionToken);
    }

    const data = (await response.json().catch(() => ({}))) as CampayPaymentLinkResponse;
    if (!response.ok || !data.link || !data.reference) {
        throw new Error(formatCampayErrorMessage("payment link", response, data));
    }

    return {
        link: data.link,
        reference: data.reference,
    };
}

export async function getCampayTransactionStatus(reference: string): Promise<CampayTransactionResponse> {
    const auth = await getCampayToken();
    const host = getCampayHost();
    const safeReference = reference.trim();

    if (!safeReference) {
        throw new Error("Transaction reference is required.");
    }

    const fetchTransactionStatus = async (token: string) =>
        fetch(`${host}/api/transaction/${encodeURIComponent(safeReference)}/`, {
            method: "GET",
            headers: {
                Authorization: `Token ${token}`,
                "Content-Type": "application/json",
            },
        });

    let response = await fetchTransactionStatus(auth.token);
    if (
        response.status === 401 &&
        auth.source === "permanent" &&
        hasCampayUsernamePasswordCredentials()
    ) {
        const fallbackSessionToken = await requestCampaySessionToken();
        response = await fetchTransactionStatus(fallbackSessionToken);
    }

    const data = (await response.json().catch(() => ({}))) as CampayTransactionResponse;
    if (!response.ok) {
        throw new Error(formatCampayErrorMessage("transaction status", response, data));
    }

    return data;
}
