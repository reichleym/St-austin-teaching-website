import { NextResponse } from "next/server";
import { databaseEnvKeys, isDatabaseConfigured } from "@/lib/postgres";
import {
    getCurrentUserApplicationStatus,
    setCurrentUserApplicationStatus,
    type ApplicationStatus,
} from "@/lib/auth/server";

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

export async function GET() {
    if (!isDatabaseConfigured) {
        return serviceUnavailableResponse();
    }

    try {
        const status = await getCurrentUserApplicationStatus();
        return NextResponse.json({ ok: true, status });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to fetch application status.";
        const statusCode = message === "Unauthorized." ? 401 : 400;
        return NextResponse.json({ ok: false, error: message }, { status: statusCode });
    }
}

export async function POST(request: Request) {
    if (!isDatabaseConfigured) {
        return serviceUnavailableResponse();
    }

    try {
        const body = await request.json().catch(() => ({}));
        const incomingStatus = body?.status;
        const status: ApplicationStatus = incomingStatus === "under_review" ? "under_review" : "not_started";

        await setCurrentUserApplicationStatus(status);
        return NextResponse.json({ ok: true, status });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to update application status.";
        const statusCode = message === "Unauthorized." ? 401 : 400;
        return NextResponse.json({ ok: false, error: message }, { status: statusCode });
    }
}
