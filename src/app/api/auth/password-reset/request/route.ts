import { NextResponse } from "next/server";
import { databaseEnvKeys, isDatabaseConfigured } from "@/lib/postgres";
import { requestPasswordReset } from "@/lib/auth/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
    if (!isDatabaseConfigured) {
        return NextResponse.json(
            {
                ok: false,
                error: "Database is not configured.",
                expectedEnvKeys: databaseEnvKeys,
            },
            { status: 503 }
        );
    }

    try {
        const body = await request.json();
        const result = await requestPasswordReset(typeof body?.email === "string" ? body.email : "");

        return NextResponse.json({
            ok: true,
            message: "If an account exists, a reset link has been sent.",
            ...result,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to process password reset.";
        return NextResponse.json(
            {
                ok: false,
                error: message,
            },
            { status: 400 }
        );
    }
}
