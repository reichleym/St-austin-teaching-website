import { NextResponse } from "next/server";
import { databaseEnvKeys, isDatabaseConfigured } from "@/lib/postgres";
import { requestPasswordReset } from "@/lib/auth/server";
import { isSmtpConfigured, sendPasswordResetEmail } from "@/lib/mail";

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

        let message = "If an account exists, a password reset link has been sent to your email.";

        if (result.resetToken && result.userEmail) {
            try {
                if (!isSmtpConfigured()) {
                    message =
                        "Password reset is currently unavailable by email. Please contact support.";
                } else {
                    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
                    const resetUrl = new URL("/reset-password", baseUrl);
                    resetUrl.searchParams.set("email", result.userEmail);
                    resetUrl.searchParams.set("token", result.resetToken);

                    await sendPasswordResetEmail({
                        toEmail: result.userEmail,
                        fullName: result.userFullName,
                        resetLink: resetUrl.toString(),
                    });
                }
            } catch (emailError) {
                console.error("[api/auth/password-reset/request] email send failed", emailError);
                message =
                    "We received your request, but could not send the reset email right now. Please try again shortly.";
            }
        }

        return NextResponse.json({
            ok: true,
            message,
            ...(result.devResetToken ? { devResetToken: result.devResetToken } : {}),
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
