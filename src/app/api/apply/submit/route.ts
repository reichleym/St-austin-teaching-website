import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { databaseEnvKeys, isDatabaseConfigured } from "@/lib/postgres";
import { createCheckoutSession } from "@/lib/payment-gateway";
import {
    getCurrentSessionUser,
    getCurrentUserGovernmentBenefit,
    setCurrentUserApplicationStatus,
} from "@/lib/auth/server";
import { isSmtpConfigured, sendAdminApplicationSubmittedEmail } from "@/lib/mail";

type FeePaymentMethod = "card" | "mtn_mobile_money" | "orange_money";

type SubmitApplicationBody = {
    program?: string;
    batchStart?: string;
    studentType?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
    highestEducation?: string;
    interestLevel?: string;
    interestArea?: string;
    payment?: {
        method?: FeePaymentMethod;
        amountXaf?: number;
        phoneNumber?: string;
    };
};

const ALLOWED_BATCHES = new Set(["September", "January", "May"]);
const BASE_APPLICATION_FEE_XAF = 25;
// Temporarily disable application fee payments / checkout flow.
const APPLY_PAYMENTS_ENABLED = false;
const APPLY_ADMIN_NOTIFICATION_EMAIL = (process.env.APPLY_ADMIN_NOTIFICATION_EMAIL || "").trim();

function serviceUnavailableResponse() {
    return NextResponse.json(
        {
            ok: false,
            error: "Database is not configured.",
            expectedEnvKeys: databaseEnvKeys,
        },
        { status: 503 }
    );
}

function hasRequiredString(value: unknown): value is string {
    return typeof value === "string" && value.trim().length > 0;
}

function isValidEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function getBaseUrl(request: NextRequest): string {
    return process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
}

function isValidPaymentMethod(value: string): value is FeePaymentMethod {
    return value === "card" || value === "mtn_mobile_money" || value === "orange_money";
}

function normalizeDiscountPercent(value: number): number {
    if (!Number.isFinite(value) || Number.isNaN(value) || value <= 0) {
        return 0;
    }

    return Math.max(0, Math.min(100, Math.round(value)));
}

function splitFullName(fullName: string): { firstName: string; lastName: string } {
    const parts = fullName
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (parts.length === 0) {
        return { firstName: "", lastName: "" };
    }

    if (parts.length === 1) {
        return { firstName: parts[0], lastName: "" };
    }

    return {
        firstName: parts[0],
        lastName: parts.slice(1).join(" "),
    };
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
    if (!isDatabaseConfigured) {
        return serviceUnavailableResponse();
    }

    try {
        const body = (await request.json().catch(() => ({}))) as SubmitApplicationBody;
        const {
            program,
            batchStart,
            studentType,
            firstName,
            lastName,
            email,
            phoneNumber,
            highestEducation,
            interestLevel,
            interestArea,
            payment = {},
        } = body;

        const sessionUser = await getCurrentSessionUser().catch(() => null);
        const sessionUserName = splitFullName(sessionUser?.fullName || "");
        const normalizedFirstName = hasRequiredString(firstName)
            ? firstName.trim()
            : sessionUserName.firstName.trim();
        const normalizedLastName = hasRequiredString(lastName)
            ? lastName.trim()
            : sessionUserName.lastName.trim();
        const normalizedEmail = (sessionUser?.email?.trim() || email?.trim() || "").toLowerCase();

        if (
            !hasRequiredString(program) ||
            !hasRequiredString(batchStart) ||
            !hasRequiredString(studentType) ||
            !hasRequiredString(phoneNumber) ||
            !hasRequiredString(highestEducation) ||
            !hasRequiredString(interestLevel) ||
            !hasRequiredString(interestArea) ||
            !normalizedFirstName ||
            !normalizedLastName ||
            !normalizedEmail
        ) {
            return NextResponse.json(
                { ok: false, error: "Missing required application fields." },
                { status: 400 }
            );
        }

        if (!ALLOWED_BATCHES.has(batchStart.trim())) {
            return NextResponse.json(
                { ok: false, error: "Invalid batch start selection." },
                { status: 400 }
            );
        }

        if (!isValidEmail(normalizedEmail)) {
            return NextResponse.json(
                { ok: false, error: "Invalid email address." },
                { status: 400 }
            );
        }

	        if (!APPLY_PAYMENTS_ENABLED) {
	            await setCurrentUserApplicationStatus("under_review");
	            try {
	                if (
	                    isSmtpConfigured() &&
	                    APPLY_ADMIN_NOTIFICATION_EMAIL &&
	                    isValidEmail(APPLY_ADMIN_NOTIFICATION_EMAIL)
	                ) {
	                    await sendAdminApplicationSubmittedEmail({
	                        toEmail: APPLY_ADMIN_NOTIFICATION_EMAIL,
	                        applicantName: `${normalizedFirstName} ${normalizedLastName}`.trim(),
	                        applicantEmail: normalizedEmail,
	                        phoneNumber: phoneNumber.trim(),
                        program: program.trim(),
                        batchStart: batchStart.trim(),
                        studentType: studentType.trim(),
                        highestEducation: highestEducation.trim(),
                        interestLevel: interestLevel.trim(),
                        interestArea: interestArea.trim(),
                    });
                }
            } catch (emailError) {
                console.error("[api/apply/submit] admin notification email failed", emailError);
            }
            return NextResponse.json({
                ok: true,
                status: "under_review",
            });
        }

        if (!payment?.method || !isValidPaymentMethod(payment.method)) {
            return NextResponse.json(
                { ok: false, error: "Please choose a valid payment method." },
                { status: 400 }
            );
        }

        let approvedDiscountPercent = 0;
        try {
            const governmentBenefit = await getCurrentUserGovernmentBenefit();
            approvedDiscountPercent = normalizeDiscountPercent(
                Number(governmentBenefit.governmentDiscountPercent || 0)
            );
        } catch {
            approvedDiscountPercent = 0;
        }

        const expectedDiscountAmount = Math.round((BASE_APPLICATION_FEE_XAF * approvedDiscountPercent) / 100);
        const expectedAmountXaf = Math.max(0, BASE_APPLICATION_FEE_XAF - expectedDiscountAmount);

        const submittedAmountXaf =
            typeof payment.amountXaf === "number" && Number.isFinite(payment.amountXaf) && payment.amountXaf > 0
                ? Math.round(payment.amountXaf)
                : null;

        if (submittedAmountXaf !== null && submittedAmountXaf !== expectedAmountXaf) {
            console.warn("[api/apply/submit] Ignoring stale client fee amount.", {
                submittedAmountXaf,
                expectedAmountXaf,
                sessionUserId: sessionUser?.id ?? null,
            });
        }

        const paymentPhone = (payment.phoneNumber || phoneNumber).trim();
        if ((payment.method === "mtn_mobile_money" || payment.method === "orange_money") && !paymentPhone) {
            return NextResponse.json(
                { ok: false, error: "Phone number is required for mobile money payments." },
                { status: 400 }
            );
        }

        const paymentMethodTypes =
            payment.method === "mtn_mobile_money"
                ? (["mtn_mobile_money"] as const)
                : payment.method === "orange_money"
                  ? (["orange_money"] as const)
                  : (["card"] as const);

        const applicationReference = `apply_${randomUUID().replace(/-/g, "")}`;
        const baseUrl = getBaseUrl(request);
        const checkout = await createCheckoutSession({
            amountCents: Math.round(expectedAmountXaf * 100),
            currency: "XAF",
            description: `St. Austin Application Fee - ${program.trim()}`,
            customerEmail: normalizedEmail,
            customerPhone: paymentPhone || undefined,
            successUrl: `${baseUrl}/apply?payment=success`,
            cancelUrl: `${baseUrl}/apply?payment=cancelled`,
            metadata: {
                applicationReference,
                program: program.trim(),
                batchStart: batchStart.trim(),
                studentType: studentType.trim(),
                email: normalizedEmail,
                firstName: normalizedFirstName,
                lastName: normalizedLastName,
                paymentMethod: payment.method,
            },
            paymentMethodTypes: [...paymentMethodTypes],
        });

        /*
        // Campay integration temporarily commented out for apply-now flow.
        if (!checkout) {
            return NextResponse.json(
                {
                    ok: false,
                    error: "Payment gateway is not configured. Please configure CamPay credentials.",
                },
                { status: 500 }
            );
        }

        if (checkout.provider !== "campay") {
            return NextResponse.json(
                {
                    ok: false,
                    error: "CamPay is required for application fee payments. Please configure CAMPAY_APP_USERNAME and CAMPAY_APP_PASSWORD.",
                },
                { status: 500 }
            );
        }
        */

        return NextResponse.json({
            ok: true,
            payment: {
                provider: checkout.provider,
                reference: checkout.reference,
                checkoutUrl: checkout.checkoutUrl,
                applicationReference,
                amountXaf: expectedAmountXaf,
            },
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to initiate payment.";
        if (message === "Unauthorized.") {
            return NextResponse.json({ ok: false, error: message }, { status: 401 });
        }
        const isCampayCredentialError =
            /CamPay authentication failed/i.test(message) ||
            /Unable to log in with provided credentials/i.test(message) ||
            /CamPay authentication request failed/i.test(message);

        /*
        // CamPay-specific credential errors are temporarily ignored for apply-now flow.
        if (isCampayCredentialError) {
            return NextResponse.json(
                {
                    ok: false,
                    error: "Payment service is unavailable due to CamPay credential configuration. Please contact support.",
                },
                { status: 502 }
            );
        }
        */

        return NextResponse.json({ ok: false, error: message }, { status: 400 });
    }
}
