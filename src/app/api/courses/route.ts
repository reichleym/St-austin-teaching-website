import type { NextRequest } from "next/server";
import { getCourseFilters, getCourses } from "@/lib/course-catalog";
import { toLanguage } from "@/lib/i18n/catalog";
import { databaseConfigSource, databaseEnvKeys, isDatabaseConfigured } from "@/lib/postgres";

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
    const startedAt = Date.now();
    if (!isDatabaseConfigured) {
        console.warn("[api/courses] Request rejected. Database is not configured.", {
            expectedEnvKeys: databaseEnvKeys,
        });

        return Response.json(
            {
                ok: false,
                error: "Database is not configured.",
                expectedEnvKeys: databaseEnvKeys,
            },
            { status: 503 }
        );
    }

    const requestLang = toLanguage(request.cookies.get("lang")?.value ?? null) ?? "en";
    const degreeLevel = parseQueryParam(request.nextUrl.searchParams.get("degreeLevel"));
    const fieldOfStudy = parseQueryParam(request.nextUrl.searchParams.get("fieldOfStudy"));
    const includeFilters = parseBoolean(request.nextUrl.searchParams.get("includeFilters"));

    console.info("[api/courses] Incoming request", {
        lang: requestLang,
        degreeLevel: degreeLevel ?? null,
        fieldOfStudy: fieldOfStudy ?? null,
        includeFilters,
        dbSource: databaseConfigSource,
    });

    try {
        const [courses, filters] = await Promise.all([
            getCourses({ degreeLevel, fieldOfStudy, language: requestLang }),
            includeFilters ? getCourseFilters() : Promise.resolve(undefined),
        ]);

        console.info("[api/courses] Request completed", {
            count: courses.length,
            durationMs: Date.now() - startedAt,
        });

        return Response.json({
            ok: true,
            data: courses,
            filters,
            meta: {
                count: courses.length,
                appliedFilters: {
                    degreeLevel: degreeLevel ?? null,
                    fieldOfStudy: fieldOfStudy ?? null,
                },
            },
        });
    } catch (error) {
        console.error("[api/courses] Failed to fetch courses", {
            durationMs: Date.now() - startedAt,
            error,
        });
        return Response.json(
            {
                ok: false,
                error: "Failed to fetch courses.",
            },
            { status: 500 }
        );
    }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
