import "server-only";
import { getSql, isDatabaseConfigured } from "@/lib/postgres";
import { toLanguage, type Language } from "@/lib/i18n/catalog";

export type AdmissionsBanner = {
  title?: string;
  description?: string;
  bgImg?: string;
};

export type AdmissionsStepsItem = {
  cardTitle?: string;
  cardDescription?: string;
  stepNum?: string;
};

export type AdmissionsRequirements = {
  title?: string;
  requirementsDesc?: string;
  listContent?: string[];
  image?: string;
};

export type AdmissionsDeadlineItem = {
  title?: string;
  headingOne?: string;
  headingTwo?: string;
  dateOne?: string;
  dateTwo?: string;
};

export type AdmissionsFaqAccordion = {
  title?: string;
  description?: string;
};

export type AdmissionsCta = {
  title?: string;
  desc?: string;
};

export type AdmissionsPayload = {
  banner?: AdmissionsBanner;
  steps?: { title?: string; stepsContent?: AdmissionsStepsItem[] };
  requirements?: AdmissionsRequirements;
  deadlines?: { title?: string; deadlineItem?: AdmissionsDeadlineItem[] };
  faq?: { title?: string; accordionsContent?: AdmissionsFaqAccordion[] };
  cta?: AdmissionsCta;
};

const SECTION_COMPONENT_MAP: Record<string, keyof AdmissionsPayload> = {
  BannerSection: "banner",
  StepsSection: "steps",
  RequirementsSection: "requirements",
  DeadlinesSection: "deadlines",
  FaqSection: "faq",
  CtaSection: "cta",
};

type RawRow = { componentType: string; content: unknown };

function normalizeObject(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function getTranslationForLang(value: unknown, lang: Language): Record<string, unknown> | null {
  const content = normalizeObject(value);
  if (!content) return null;

  const translations = normalizeObject(content.translations);
  if (!translations) return normalizeObject(content);

  const languageContent = normalizeObject(translations[lang]);
  if (languageContent) return languageContent;

  return normalizeObject(translations.en);
}

async function fetchRows(): Promise<RawRow[]> {
  if (!isDatabaseConfigured) {
    console.warn("[admissions-page] database not configured — skipping query");
    return [];
  }

  const sql = getSql();

  const queryAdmissionsSection = async () =>
    sql<RawRow[]>`
      select coalesce("componentType", "content"->>'componentType') as "componentType", "content"
      from "AdmissionsSection"
      where coalesce("componentType", "content"->>'componentType') in (
        'BannerSection',
        'StepsSection',
        'RequirementsSection',
        'DeadlinesSection',
        'FaqSection',
        'CtaSection'
      )
      order by case
        when coalesce("componentType", "content"->>'componentType') = 'BannerSection' then 0
        when coalesce("componentType", "content"->>'componentType') = 'StepsSection' then 1
        when coalesce("componentType", "content"->>'componentType') = 'RequirementsSection' then 2
        when coalesce("componentType", "content"->>'componentType') = 'DeadlinesSection' then 3
        when coalesce("componentType", "content"->>'componentType') = 'FaqSection' then 4
        when coalesce("componentType", "content"->>'componentType') = 'CtaSection' then 5
        else 99
      end
    `;

  const queryAdmissionsPage = async () =>
    sql<RawRow[]>`
      select coalesce("componentType", "content"->>'componentType') as "componentType", "content"
      from "AdmissionsPage"
      where coalesce("componentType", "content"->>'componentType') in (
        'BannerSection',
        'StepsSection',
        'RequirementsSection',
        'DeadlinesSection',
        'FaqSection',
        'CtaSection'
      )
      order by case
        when coalesce("componentType", "content"->>'componentType') = 'BannerSection' then 0
        when coalesce("componentType", "content"->>'componentType') = 'StepsSection' then 1
        when coalesce("componentType", "content"->>'componentType') = 'RequirementsSection' then 2
        when coalesce("componentType", "content"->>'componentType') = 'DeadlinesSection' then 3
        when coalesce("componentType", "content"->>'componentType') = 'FaqSection' then 4
        when coalesce("componentType", "content"->>'componentType') = 'CtaSection' then 5
        else 99
      end
    `;

  try {
    return await queryAdmissionsSection();
  } catch (err) {
    console.warn("[admissions-page] failed querying AdmissionsSection, falling back to AdmissionsPage", err);
  }

  try {
    return await queryAdmissionsPage();
  } catch (err) {
    console.error("[admissions-page] failed querying AdmissionsPage", err);
    return [];
  }
}

export async function getAdmissionsContent(langValue: string | null): Promise<AdmissionsPayload> {
  const lang = toLanguage(langValue) ?? "en";
  const rows = await fetchRows();

  const payload: AdmissionsPayload = {};
  type AdmissionsSectionValue = AdmissionsPayload[keyof AdmissionsPayload];

  for (const row of rows) {
    const sectionKey = SECTION_COMPONENT_MAP[row.componentType];
    if (!sectionKey) continue;

    const translated = getTranslationForLang(row.content, lang);
    if (!translated) continue;

    payload[sectionKey] = translated as AdmissionsSectionValue;
  }

  return payload;
}

export async function getAdmissionsSections(langValue: string | null) {
  const lang = toLanguage(langValue) ?? "en";
  const rows = await fetchRows();
  const sections: Array<{ componentType: string; content: Record<string, unknown> | null }> = [];
  for (const row of rows) {
    const translated = getTranslationForLang(row.content, lang);
    sections.push({ componentType: row.componentType, content: translated });
  }
  return sections;
}
