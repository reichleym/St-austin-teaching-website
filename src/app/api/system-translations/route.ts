import type { NextRequest } from "next/server";
import { getSql, databaseEnvKeys, isDatabaseConfigured } from "@/lib/postgres";

function safeParseJson(value: unknown): unknown {
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return undefined;
    }
  }

  if (value && typeof value === "object") {
    return value;
  }

  return undefined;
}

export async function GET(request: NextRequest) {
  if (!isDatabaseConfigured) {
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
      return Response.json({ ok: true, data: { careers: [], translations: {} } }, { status: 200 });
    }

    const translations: Record<string, unknown> = {};

    (careers as any[]).forEach((item, idx) => {
      const key = String(item?.id ?? item?.title ?? `career_${idx}`);
      const raw = item?.translations ?? item?.translation ?? item?.i18n ?? item?.localized_content;
      const parsed = safeParseJson(raw);
      if (parsed && typeof parsed === "object") {
        translations[key] = parsed;
      }
    });

    return Response.json(
      {
        ok: true,
        data: {
          careers: careers,
          translations,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[api/system-translations] Failed to fetch system translations", error);
    return Response.json(
      {
        ok: false,
        error: "Failed to fetch system translations.",
      },
      { status: 500 }
    );
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
