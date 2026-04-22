import "server-only";
import { getSql, isDatabaseConfigured } from "@/lib/postgres";
import { toLanguage, type Language } from "@/lib/i18n/catalog";

export type AboutPageBanner = {
  title?: string;
  description?: string;
  bgImg?: string;
};

export type AboutPageHistory = {
  title?: string;
  description?: string;
  image?: string;
};

export type AboutPageMissionVision = {
  mission?: {
    title?: string;
    desc?: string;
  };
  vision?: {
    title?: string;
    desc?: string;
  };
  title?: string;
  description?: string;
  missionTitle?: string;
  missionDesc?: string;
  visionTitle?: string;
  visionDesc?: string;
};

export type AboutPageIconCard = {
  title?: string;
  description?: string;
  blockContent?: Array<{
    cardTitle: string;
    cardDescription: string;
    icon: string;
  }>;
};

export type AboutPageTeamGrid = {
  title?: string;
  teamMembers?: Array<{
    name: string;
    role: string;
    image: string;
    description: string;
  }>;
};

export type AboutPageCta = {
  title?: string;
  desc?: string;
};

export type AboutPagePayload = {
  banner?: AboutPageBanner;
  history?: AboutPageHistory;
  missionVision?: AboutPageMissionVision;
  iconCard?: AboutPageIconCard;
  teamGrid?: AboutPageTeamGrid;
  cta?: AboutPageCta;
};

const SECTION_COMPONENT_MAP: Record<string, keyof AboutPagePayload> = {
  BannerSection: "banner",
  HistorySection: "history",
  MissionVisionSection: "missionVision",
  IconCard: "iconCard",
  TeamGridSection: "teamGrid",
  CtaSection: "cta",
};

type RawAboutPageRow = {
  componentType: string;
  content: unknown;
};

function normalizeObject(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function getTranslationForLang(value: unknown, lang: Language): Record<string, unknown> | null {
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

async function fetchAboutPageRows(): Promise<RawAboutPageRow[]> {
  if (!isDatabaseConfigured) {
    console.warn("[about-page] database not configured — skipping AboutPage query");
    return [];
  }

  try {
    const sql = getSql();

    return await sql<RawAboutPageRow[]>`
      select "componentType", "content"
      from "AboutPage"
      where "componentType" in (
        'BannerSection',
        'HistorySection',
        'MissionVisionSection',
        'IconCard',
        'TeamGridSection',
        'CtaSection'
      )
      order by case
        when "componentType" = 'BannerSection' then 0
        when "componentType" = 'HistorySection' then 1
        when "componentType" = 'MissionVisionSection' then 2
        when "componentType" = 'IconCard' then 3
        when "componentType" = 'TeamGridSection' then 4
        when "componentType" = 'CtaSection' then 5
        else 99
      end
    `;
  } catch (err) {
    console.error("[about-page] error fetching AboutPage rows:", err);
    return [];
  }
}

export async function getAboutPageContent(langValue: string | null): Promise<AboutPagePayload> {
  const lang = toLanguage(langValue) ?? "en";
  const rows = await fetchAboutPageRows();

  const payload: AboutPagePayload = {};
  type AboutSectionValue = AboutPagePayload[keyof AboutPagePayload];

  for (const row of rows) {
    const sectionKey = SECTION_COMPONENT_MAP[row.componentType];
    if (!sectionKey) {
      continue;
    }

    const translated = getTranslationForLang(row.content, lang);
    if (!translated) {
      continue;
    }

    payload[sectionKey] = translated as AboutSectionValue;
  }

  return payload;
}

export async function getAboutSections(langValue: string | null) {
  const lang = toLanguage(langValue) ?? "en";
  const rows = await fetchAboutPageRows();
  const sections: Array<{ componentType: string; content: Record<string, unknown> | null }> = [];
  for (const row of rows) {
    const translated = getTranslationForLang(row.content, lang);
    sections.push({ componentType: row.componentType, content: translated });
  }
  return sections;
}
