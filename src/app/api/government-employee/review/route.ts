import { NextResponse } from "next/server";
import { databaseEnvKeys, isDatabaseConfigured } from "@/lib/postgres";
import { reviewGovernmentBenefitByEmail } from "@/lib/auth/server";

type ReviewBody = {
    email?: string;
    decision?: "approve" | "reject";
};

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

function isAllowedDecision(value: unknown): value is "approve" | "reject" {
    return value === "approve" || value === "reject";
}

function hasAdminAccess(request: Request): boolean {
    const configuredToken = process.env.GOVERNMENT_DISCOUNT_ADMIN_TOKEN?.trim();
    if (!configuredToken) {
        return false;
    }

    const providedToken = request.headers.get("x-government-admin-token")?.trim() ?? "";
    return providedToken.length > 0 && providedToken === configuredToken;
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
    if (!isDatabaseConfigured) {
        return serviceUnavailableResponse();
    }

    const isAdminTokenConfigured = Boolean(
        process.env.GOVERNMENT_DISCOUNT_ADMIN_TOKEN &&
            process.env.GOVERNMENT_DISCOUNT_ADMIN_TOKEN.trim().length > 0
    );

    if (!isAdminTokenConfigured) {
        return NextResponse.json(
            {
                ok: false,
                error: "GOVERNMENT_DISCOUNT_ADMIN_TOKEN is not configured.",
            },
            { status: 500 }
        );
    }

    if (!hasAdminAccess(request)) {
        return NextResponse.json(
            {
                ok: false,
                error: "Unauthorized admin request.",
            },
            { status: 401 }
        );
    }

    try {
        const body = (await request.json().catch(() => ({}))) as ReviewBody;
        const email = typeof body.email === "string" ? body.email : "";
        const decision = body.decision;

        if (!email.trim()) {
            return NextResponse.json(
                {
                    ok: false,
                    error: "Email is required.",
                },
                { status: 400 }
            );
        }

        if (!isAllowedDecision(decision)) {
            return NextResponse.json(
                {
                    ok: false,
                    error: "Decision must be either 'approve' or 'reject'.",
                },
                { status: 400 }
            );
        }

        const benefit = await reviewGovernmentBenefitByEmail({
            email,
            decision,
        });

        return NextResponse.json({
            ok: true,
            benefit,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to review government discount request.";
        return NextResponse.json({ ok: false, error: message }, { status: 400 });
    }
}
