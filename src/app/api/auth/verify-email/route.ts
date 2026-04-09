import { NextResponse } from "next/server";
import { databaseEnvKeys, isDatabaseConfigured } from "@/lib/postgres";
import { verifyEmailAddress } from "@/lib/auth/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function escapeHtml(value: string): string {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll("\"", "&quot;")
        .replaceAll("'", "&#39;");
}

function renderVerificationPage(input: {
    title: string;
    message: string;
    success: boolean;
}): Response {
    const accentColor = input.success ? "#1E73BE" : "#B92A2A";
    const title = escapeHtml(input.title);
    const message = escapeHtml(input.message);
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
</head>
<body style="font-family: Arial, sans-serif; margin: 0; padding: 24px; background: #f5f7fb;">
  <div style="max-width: 560px; margin: 60px auto; background: #ffffff; border: 1px solid #e6e6e6; border-radius: 8px; padding: 24px;">
    <h1 style="margin-top: 0; color: ${accentColor}; font-size: 24px;">${title}</h1>
    <p style="font-size: 16px; line-height: 1.5; color: #303030;">${message}</p>
    <p style="margin-top: 20px; font-size: 14px;"><a href="/portal" style="color: #1E73BE;">Go to Portal</a></p>
  </div>
</body>
</html>`;

    return new Response(html, {
        status: input.success ? 200 : 400,
        headers: {
            "Content-Type": "text/html; charset=utf-8",
        },
    });
}

export async function GET(request: Request) {
    if (!isDatabaseConfigured) {
        return renderVerificationPage({
            title: "Email verification unavailable",
            message: `Database is not configured. Expected one of: ${databaseEnvKeys.join(", ")}`,
            success: false,
        });
    }

    const url = new URL(request.url);
    const email = url.searchParams.get("email")?.trim() || "";
    const token = url.searchParams.get("token")?.trim() || "";

    if (!email || !token) {
        return renderVerificationPage({
            title: "Verification failed",
            message: "This verification link is incomplete. Please request a new verification email.",
            success: false,
        });
    }

    try {
        await verifyEmailAddress({ email, token });
        return renderVerificationPage({
            title: "Email verified",
            message: "Your email has been verified successfully. You can now continue in the portal.",
            success: true,
        });
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Unable to verify your email with this link.";

        return renderVerificationPage({
            title: "Verification failed",
            message,
            success: false,
        });
    }
}

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
        const body = (await request.json().catch(() => ({}))) as { email?: string; token?: string };
        await verifyEmailAddress({
            email: typeof body.email === "string" ? body.email : "",
            token: typeof body.token === "string" ? body.token : "",
        });

        return NextResponse.json({ ok: true, message: "Email verified successfully." });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to verify email.";
        return NextResponse.json({ ok: false, error: message }, { status: 400 });
    }
}
