import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAboutPageContent } from "@/lib/about-page";
import { toLanguage } from "@/lib/i18n/catalog";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const queryLang = url.searchParams.get("lang");
  const cookieLang = cookies().get("lang")?.value ?? null;
  const lang = toLanguage(queryLang ?? cookieLang) ?? "en";

  const aboutPage = await getAboutPageContent(lang);
  return NextResponse.json({ lang, aboutPage });
}
