import { NextResponse } from "next/server";
import { databaseEnvKeys, isDatabaseConfigured } from "@/lib/postgres";
import { getCurrentSessionUser } from "@/lib/auth/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
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
        const user = await getCurrentSessionUser();
        return NextResponse.json({ ok: true, user });
    } catch (error) {
        console.error("[api/auth/session] failed", error);
        return NextResponse.json(
            {
                ok: false,
                error: "Unable to load your session right now. Please refresh and try again.",
            },
            { status: 500 }
        );
    }
}
