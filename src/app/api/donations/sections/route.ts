import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { getDonationsSections } from "@/lib/donations-page";
import { toLanguage } from "@/lib/i18n/catalog";

export async function GET(request: NextRequest) {
  const queryLang = request.nextUrl.searchParams.get("lang");
  const cookieStore = await cookies();
  const cookieLang = cookieStore.get("lang")?.value ?? null;
  const lang = toLanguage(queryLang ?? cookieLang) ?? "en";

  try {
    const sections = await getDonationsSections(lang);
    return Response.json({ ok: true, lang, sections }, { status: 200 });
  } catch (err) {
    console.error("[api/donations/sections] error", err);
    return Response.json({ ok: false, error: "Failed to fetch donations sections." }, { status: 500 });
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
