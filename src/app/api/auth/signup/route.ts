import { NextResponse } from "next/server";
import { databaseEnvKeys, isDatabaseConfigured } from "@/lib/postgres";
import { signupUser } from "@/lib/auth/server";

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

    console.log("signup", )

    try {
        const body = await request.json();
        console.log(body, 'user')
        const user = await signupUser({
            fullName: typeof body?.fullName === "string" ? body.fullName : "",
            email: typeof body?.email === "string" ? body.email : "",
            password: typeof body?.password === "string" ? body.password : "",
        });

         console.log(user, 'user')

        return NextResponse.json({ ok: true, user });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to create account.";
        const status = message === "An account with this email already exists." ? 409 : 400;

        return NextResponse.json(
            {
                ok: false,
                error: message,
            },
            { status }
        );
    }
}
