import "server-only";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getGovernmentEmployeesContent } from "@/lib/government-employees-page";
import { toLanguage } from "@/lib/i18n/catalog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const queryLang = url.searchParams.get("lang");
    const cookieStore = await cookies();
    const cookieLang = cookieStore.get("lang")?.value ?? null;
    const acceptLang = req.headers.get("accept-language");
    const lang = toLanguage(queryLang ?? cookieLang ?? acceptLang) ?? "en";

    const content = await getGovernmentEmployeesContent(lang);
    return NextResponse.json({ lang, governmentEmployeesPage: content, data: content });
  } catch (err) {
    console.error("[api/government-employees] error:", err);
    return NextResponse.json({ data: {}, governmentEmployeesPage: {} }, { status: 500 });
  }
}
