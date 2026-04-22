import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getTuitionContent } from "@/lib/tuition-page";
import { toLanguage } from "@/lib/i18n/catalog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const queryLang = url.searchParams.get("lang");
  const cookieStore = await cookies();
  const cookieLang = cookieStore.get("lang")?.value ?? null;
  const lang = toLanguage(queryLang ?? cookieLang) ?? "en";

  const tuitionPage = await getTuitionContent(lang);
  return NextResponse.json({ lang, tuitionPage });
}

