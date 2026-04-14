import type { NextRequest } from "next/server";
import { getSql, databaseConfigSource, databaseEnvKeys, isDatabaseConfigured } from "@/lib/postgres";

export async function GET(request: NextRequest) {
  if (!isDatabaseConfigured) {
    console.warn("[api/careers] Request rejected. Database is not configured.", {
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

  try {
    const sql = getSql();
    const settings = await sql`
      SELECT
        "universityCareers" AS "universityCareers"
      FROM
        "SystemSettings"
      ORDER BY
        "updatedAt" DESC
      LIMIT 1
    `;

    const rawCareers = Array.isArray(settings) && settings.length > 0 ? settings[0].universityCareers ?? settings[0].universitycareers : undefined;
    let careers: unknown = rawCareers;

    if (typeof rawCareers === "string") {
      try {
        careers = JSON.parse(rawCareers);
      } catch {
        careers = undefined;
      }
    }

    if (!careers || !Array.isArray(careers)) {
      return Response.json(
        {
          ok: true,
          data: [],
        },
        { status: 200 }
      );
    }

    const activeCareers = careers.filter((career: unknown) => {
      return typeof career === "object" && career !== null && "isActive" in career ? Boolean((career as any).isActive) : true;
    });

    return Response.json(
      {
        ok: true,
        data: activeCareers,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[api/careers] Failed to fetch careers", error);
    return Response.json(
      {
        ok: false,
        error: "Failed to fetch career opportunities.",
      },
      { status: 500 }
    );
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
