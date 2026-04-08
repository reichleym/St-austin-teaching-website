import { NextResponse } from "next/server";
import { databaseEnvKeys, isDatabaseConfigured } from "@/lib/postgres";
import {
    getCurrentSessionUser,
    getCurrentUserGovernmentBenefit,
    setCurrentUserGovernmentBenefit,
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
        const user = await getCurrentSessionUser();
        if (!user) {
            return NextResponse.json({
                ok: true,
                isLoggedIn: false,
                benefit: {
                    isGovernmentEmployee: false,
                    governmentEmployeeGroup: null,
                    governmentDiscountPercent: 0,
                },
            });
        }

        const benefit = await getCurrentUserGovernmentBenefit();
        return NextResponse.json({ ok: true, isLoggedIn: true, benefit });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to fetch government employee discount.";
        const statusCode = message === "Unauthorized." ? 401 : 400;
        return NextResponse.json({ ok: false, error: message }, { status: statusCode });
    }
}

export async function POST(request: Request) {
    if (!isDatabaseConfigured) {
        return serviceUnavailableResponse();
    }

    try {
        const user = await getCurrentSessionUser();
        if (!user) {
            return NextResponse.json(
                {
                    ok: false,
                    error: "Please sign in to claim government employee benefits.",
                },
                { status: 401 }
            );
        }

        const body = await request.json().catch(() => ({}));
        const isGovernmentEmployee = Boolean(body?.isGovernmentEmployee);
        const governmentEmployeeGroup =
            typeof body?.governmentEmployeeGroup === "string" ? body.governmentEmployeeGroup : null;

        const benefit = await setCurrentUserGovernmentBenefit({
            isGovernmentEmployee,
            governmentEmployeeGroup,
        });

        return NextResponse.json({
            ok: true,
            benefit,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to update government employee discount.";
        const statusCode = message === "Unauthorized." ? 401 : 400;
        return NextResponse.json({ ok: false, error: message }, { status: statusCode });
    }
}
