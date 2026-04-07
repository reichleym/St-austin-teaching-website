import { NextResponse } from "next/server";
import { databaseEnvKeys, isDatabaseConfigured } from "@/lib/postgres";
import { confirmPasswordReset } from "@/lib/auth/server";

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
        await confirmPasswordReset({
            email: typeof body?.email === "string" ? body.email : "",
            token: typeof body?.token === "string" ? body.token : "",
            newPassword: typeof body?.newPassword === "string" ? body.newPassword : "",
        });

        return NextResponse.json({
            ok: true,
            message: "Password reset successful.",
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to reset password.";
        return NextResponse.json(
            {
                ok: false,
                error: message,
            },
            { status: 400 }
        );
    }
}
