import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getStudentExperienceContent } from "@/lib/student-experience-page";
import { toLanguage } from "@/lib/i18n/catalog";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const queryLang = url.searchParams.get("lang");
  const cookieStore = await cookies();
  const cookieLang = cookieStore.get("lang")?.value ?? null;
  const lang = toLanguage(queryLang ?? cookieLang) ?? "en";

  const studentExperience = await getStudentExperienceContent(lang);
  return NextResponse.json({ lang, studentExperience });
}
