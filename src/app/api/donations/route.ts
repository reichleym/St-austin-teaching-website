import { randomUUID } from "node:crypto";
import type { NextRequest } from "next/server";
import { getSql } from "@/lib/postgres";
import { createCheckoutSession } from "@/lib/payment-gateway";

type PaymentMethod =
    | "credit_card"
    | "bank_transfer"
    | "cash"
    | "mtn_mobile_money"
    | "orange_money";
type DonationFrequency = "one_time" | "monthly";

type DonationRow = {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    amount_cents: number;
    frequency: DonationFrequency;
    designation: string | null;
    payment_method: PaymentMethod;
    payment_status: string;
    payment_provider: string | null;
    payment_reference: string | null;
    created_at: Date;
};

function isValidEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidPaymentMethod(value: string): value is PaymentMethod {
    return (
        value === "credit_card" ||
        value === "bank_transfer" ||
        value === "cash" ||
        value === "mtn_mobile_money" ||
        value === "orange_money"
    );
}

function isValidFrequency(value: string): value is DonationFrequency {
    return value === "one_time" || value === "monthly";
}

function getBaseUrl(request: NextRequest): string {
    return process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
}

async function ensureDonationsTable(): Promise<void> {
    const sql = getSql();
    await sql`
        create table if not exists donations (
            id text primary key,
            first_name text not null,
            last_name text not null,
            email text not null,
            amount_cents integer not null,
            frequency text not null,
            designation text,
            payment_method text not null,
            payment_status text not null default 'submitted',
            payment_provider text,
            payment_reference text,
            created_at timestamptz not null default now()
        )
    `;
}

export async function POST(request: NextRequest) {
    try {
        const body = (await request.json()) as {
            firstName?: string;
            lastName?: string;
            email?: string;
            phoneNumber?: string;
            amountCents?: number;
            frequency?: DonationFrequency;
            designation?: string;
            paymentMethod?: PaymentMethod;
        };

        const firstName = body.firstName?.trim() || "";
        const lastName = body.lastName?.trim() || "";
        const email = body.email?.trim().toLowerCase() || "";
        const phoneNumber = body.phoneNumber?.trim() || "";
        const frequency = body.frequency || "one_time";
        const designation = body.designation?.trim() || null;
        const paymentMethod = body.paymentMethod || "credit_card";
        const useGatewayCheckout =
            paymentMethod === "credit_card" ||
            paymentMethod === "bank_transfer" ||
            paymentMethod === "mtn_mobile_money" ||
            paymentMethod === "orange_money";

        if (!firstName || !lastName || !email) {
            return Response.json(
                { ok: false, error: "firstName, lastName, and email are required." },
                { status: 400 }
            );
        }

        if (!isValidEmail(email)) {
            return Response.json({ ok: false, error: "Invalid email address." }, { status: 400 });
        }

        if (
            typeof body.amountCents !== "number" ||
            !Number.isFinite(body.amountCents) ||
            body.amountCents <= 0
        ) {
            return Response.json(
                { ok: false, error: "amountCents must be a positive number." },
                { status: 400 }
            );
        }

        if (!isValidFrequency(frequency)) {
            return Response.json({ ok: false, error: "Invalid donation frequency." }, { status: 400 });
        }

        if (!isValidPaymentMethod(paymentMethod)) {
            return Response.json({ ok: false, error: "Invalid payment method." }, { status: 400 });
        }

        if (
            (paymentMethod === "mtn_mobile_money" || paymentMethod === "orange_money") &&
            phoneNumber.length === 0
        ) {
            return Response.json(
                { ok: false, error: "phoneNumber is required for mobile money payments." },
                { status: 400 }
            );
        }

        await ensureDonationsTable();
        const sql = getSql();
        const donationId = `donation_${randomUUID().replace(/-/g, "")}`;
        const amountCents = Math.round(body.amountCents);

        const insertRows = await sql<DonationRow[]>`
            insert into donations (
                id,
                first_name,
                last_name,
                email,
                amount_cents,
                frequency,
                designation,
                payment_method,
                payment_status
            )
            values (
                ${donationId},
                ${firstName},
                ${lastName},
                ${email},
                ${amountCents},
                ${frequency},
                ${designation},
                ${paymentMethod},
                ${useGatewayCheckout ? "checkout_pending" : "submitted"}
            )
            returning
                id,
                first_name,
                last_name,
                email,
                amount_cents,
                frequency,
                designation,
                payment_method,
                payment_status,
                payment_provider,
                payment_reference,
                created_at
        `;

        const donation = insertRows[0];

        if (!useGatewayCheckout) {
            return Response.json({
                ok: true,
                donation,
                message:
                    "Donation recorded successfully. Your selected payment method will be verified by the team.",
            });
        }

        const baseUrl = getBaseUrl(request);
        const checkout = await createCheckoutSession({
            amountCents,
            currency: "usd",
            description: "St. Austin Donation",
            customerEmail: email,
            customerPhone: phoneNumber || undefined,
            metadata: {
                donationId,
                frequency,
                paymentMethod,
            },
            successUrl: `${baseUrl}/donations?status=success`,
            cancelUrl: `${baseUrl}/donations?status=cancelled`,
            paymentMethodTypes:
                paymentMethod === "mtn_mobile_money"
                    ? ["mtn_mobile_money"]
                    : paymentMethod === "orange_money"
                      ? ["orange_money"]
                      : paymentMethod === "bank_transfer"
                        ? ["us_bank_account"]
                        : ["card"],
        });

        if (!checkout) {
            return Response.json(
                {
                    ok: false,
                    donation,
                    error:
                        "No payment gateway configured. Set JENGUPAY_* for Cameroon payments or STRIPE_SECRET_KEY for Stripe.",
                },
                { status: 503 }
            );
        }

        await sql`
            update donations
            set
                payment_provider = ${checkout.provider},
                payment_reference = ${checkout.reference}
            where id = ${donationId}
        `;

        return Response.json({
            ok: true,
            donation,
            checkoutUrl: checkout.checkoutUrl,
            provider: checkout.provider,
            reference: checkout.reference,
        });
    } catch (error) {
        console.error("[api/donations] failed", error);
        return Response.json({ ok: false, error: "Failed to submit donation." }, { status: 500 });
    }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
