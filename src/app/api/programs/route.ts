import type { NextRequest } from "next/server";
import { getCourseFilters, getCourses } from "@/lib/course-catalog";
import { isDatabaseConfigured } from "@/lib/postgres";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function parseBoolean(value: string | null): boolean {
    if (!value) {
        return false;
    }

    const normalized = value.trim().toLowerCase();
    return normalized === "1" || normalized === "true" || normalized === "yes";
}

function parseQueryParam(value: string | null): string | undefined {
    if (!value) {
        return undefined;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
}

export async function GET(request: NextRequest) {
    if (!isDatabaseConfigured) {
        return Response.json(
            {
                ok: false,
                error: "Database is not configured.",
            },
            { status: 503 }
        );
    }

    const degreeLevel = parseQueryParam(request.nextUrl.searchParams.get("degreeLevel"));
    const fieldOfStudy = parseQueryParam(request.nextUrl.searchParams.get("fieldOfStudy"));
    const includeFilters = parseBoolean(request.nextUrl.searchParams.get("includeFilters"));

    try {
        const [programs, filters] = await Promise.all([
            getCourses({ degreeLevel, fieldOfStudy }),
            includeFilters ? getCourseFilters() : Promise.resolve(undefined),
        ]);

        return Response.json({
            ok: true,
            data: programs,
            filters,
            meta: {
                count: programs.length,
                appliedFilters: {
                    degreeLevel: degreeLevel ?? null,
                    fieldOfStudy: fieldOfStudy ?? null,
                },
            },
        });
    } catch (error) {
        console.error("Failed to fetch programs:", error);
        return Response.json(
            {
                ok: false,
                error: "Failed to fetch programs.",
            },
            { status: 500 }
        );
    }
}
