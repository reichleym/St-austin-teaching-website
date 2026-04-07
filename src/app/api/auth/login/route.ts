import { NextResponse } from "next/server";
import { databaseEnvKeys, isDatabaseConfigured } from "@/lib/postgres";
import { loginUser } from "@/lib/auth/server";

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

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
    if (!isDatabaseConfigured) {
        return serviceUnavailableResponse();
    }

    try {
        const body = await request.json();
        const user = await loginUser({
            email: typeof body?.email === "string" ? body.email : "",
            password: typeof body?.password === "string" ? body.password : "",
        });

        return NextResponse.json({ ok: true, user });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to log in.";
        const status = message === "Invalid email or password." ? 401 : 400;

        return NextResponse.json(
            {
                ok: false,
                error: message,
            },
            { status }
        );
    }
}
