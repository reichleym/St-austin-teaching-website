import "server-only";
import { getSql } from "@/lib/postgres";
import { toLanguage, type Language } from "@/lib/i18n/catalog";

export type StudentExperienceBanner = {
  title?: string;
  description?: string;
  bgImg?: string;
};

export type StudentExperienceIconCard = {
  title?: string;
  description?: string;
  blockContent?: Array<{
    cardTitle: string;
    cardDescription: string;
    icon: string;
  }>;
};

export type StudentExperienceLearnSchedule = {
  title?: string;
  list?: string[];
  image?: string;
};

export type StudentExperienceLearningDashboardCta = {
  title?: string;
  description?: string;
  image?: string;
  button?: {
    label?: string;
    href?: string;
  };
};

export type StudentExperienceCta = {
  title?: string;
  desc?: string;
};

export type StudentExperiencePayload = {
  banner?: StudentExperienceBanner;
  iconCard?: StudentExperienceIconCard;
  learnSchedule?: StudentExperienceLearnSchedule;
  learningDashboardCta?: StudentExperienceLearningDashboardCta;
  cta?: StudentExperienceCta;
};

const SECTION_COMPONENT_MAP: Record<string, keyof StudentExperiencePayload> = {
  BannerSection: "banner",
  IconCard: "iconCard",
  LearnSchedule: "learnSchedule",
  LearningDashboardCta: "learningDashboardCta",
  CtaSection: "cta",
};

type RawRow = {
  componentType: string;
  content: unknown;
};

function normalizeObject(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function getTranslationForLang(
  value: unknown,
  lang: Language,
): Record<string, unknown> | null {
  const content = normalizeObject(value);
  if (!content) {
    return null;
  }

  const translations = normalizeObject(content.translations);
  if (!translations) {
    return normalizeObject(content);
  }

  const languageContent = normalizeObject(translations[lang]);
  if (languageContent) {
    return languageContent;
  }

  return normalizeObject(translations.en);
}

async function fetchRows(): Promise<RawRow[]> {
  const sql = getSql();

  return await sql<RawRow[]>`
    select "componentType", "content"
    from "StudentExperience"
    where "componentType" in (
      'BannerSection',
      'IconCard',
      'LearnSchedule',
      'LearningDashboardCta',
      'CtaSection'
    )
    order by case
      when "componentType" = 'BannerSection' then 0
      when "componentType" = 'IconCard' then 1
      when "componentType" = 'LearnSchedule' then 2
      when "componentType" = 'LearningDashboardCta' then 3
      when "componentType" = 'CtaSection' then 4
      else 99
    end
  `;
}

export async function getStudentExperienceContent(
  langValue: string | null,
): Promise<StudentExperiencePayload> {
  const lang = toLanguage(langValue) ?? "en";
  const rows = await fetchRows();

  const payload: StudentExperiencePayload = {};
  type StudentExperienceSectionValue =
    StudentExperiencePayload[keyof StudentExperiencePayload];

  for (const row of rows) {
    const sectionKey = SECTION_COMPONENT_MAP[row.componentType];
    if (!sectionKey) continue;

    const translated = getTranslationForLang(row.content, lang);
    if (!translated) continue;

    payload[sectionKey] = translated as StudentExperienceSectionValue;
  }

  return payload;
}

export async function getStudentExperienceSections(langValue: string | null) {
  const lang = toLanguage(langValue) ?? "en";
  const rows = await fetchRows();
  const sections: Array<{
    componentType: string;
    content: Record<string, unknown> | null;
  }> = [];
  for (const row of rows) {
    const translated = getTranslationForLang(row.content, lang);
    sections.push({ componentType: row.componentType, content: translated });
  }
  return sections;
}
