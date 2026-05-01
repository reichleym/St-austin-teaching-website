import "server-only";
import { getSql, isDatabaseConfigured } from "@/lib/postgres";
import { toLanguage, type Language } from "@/lib/i18n/catalog";

export type TuitionBanner = { title?: string; description?: string; bgImg?: string };
export type TuitionTableRow = { program?: string; perYear?: string; perCredit?: string };
export type TuitionWhyGive = { secTitle?: string; whiteCards?: Array<{ icon?: string; title?: string; description?: string }> };
export type TuitionPaymentPlans = { title?: string; listContent?: string[]; buttonText?: string };
export type TuitionCta = { title?: string; desc?: string };

export type TuitionPayload = {
  banner?: TuitionBanner;
  tuitionTable?: { title?: string; tableHeadings?: string[]; tableData?: TuitionTableRow[] };
  scholarships?: TuitionWhyGive;
  paymentPlans?: TuitionPaymentPlans;
  cta?: TuitionCta;
};

const COMPONENT_TYPE_ALIASES: Record<string, string> = {
  WhyAustin: "ScholarshipsGrantsSection",
};

const SECTION_COMPONENT_MAP: Record<string, keyof TuitionPayload> = {
  BannerSection: "banner",
  TuitionTableSection: "tuitionTable",
  ScholarshipsGrantsSection: "scholarships",
  WhyAustin: "scholarships", // backwards-compat for existing DB content
  PaymentPlansSection: "paymentPlans",
  CtaSection: "cta",
};

type RawRow = { componentType: string; content: unknown };

function normalizeObject(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) return value as Record<string, unknown>;
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
    console.warn("[tuition-page] database not configured — skipping query");
    return [];
  }

  const sql = getSql();

  const queryTuitionSection = async () =>
    sql<RawRow[]>`
      select coalesce("componentType", "content"->>'componentType') as "componentType", "content"
      from "TuitionSection"
      where coalesce("componentType", "content"->>'componentType') in ('BannerSection','TuitionTableSection','ScholarshipsGrantsSection','WhyAustin','PaymentPlansSection','CtaSection')
      order by case
        when coalesce("componentType", "content"->>'componentType') = 'BannerSection' then 0
        when coalesce("componentType", "content"->>'componentType') = 'TuitionTableSection' then 1
        when coalesce("componentType", "content"->>'componentType') = 'ScholarshipsGrantsSection' then 2
        when coalesce("componentType", "content"->>'componentType') = 'WhyAustin' then 2
        when coalesce("componentType", "content"->>'componentType') = 'PaymentPlansSection' then 3
        when coalesce("componentType", "content"->>'componentType') = 'CtaSection' then 4
        else 99
      end
    `;

  const queryTuitionPage = async () =>
    sql<RawRow[]>`
      select coalesce("componentType", "content"->>'componentType') as "componentType", "content"
      from "TuitionPage"
      where coalesce("componentType", "content"->>'componentType') in ('BannerSection','TuitionTableSection','ScholarshipsGrantsSection','WhyAustin','PaymentPlansSection','CtaSection')
      order by case
        when coalesce("componentType", "content"->>'componentType') = 'BannerSection' then 0
        when coalesce("componentType", "content"->>'componentType') = 'TuitionTableSection' then 1
        when coalesce("componentType", "content"->>'componentType') = 'ScholarshipsGrantsSection' then 2
        when coalesce("componentType", "content"->>'componentType') = 'WhyAustin' then 2
        when coalesce("componentType", "content"->>'componentType') = 'PaymentPlansSection' then 3
        when coalesce("componentType", "content"->>'componentType') = 'CtaSection' then 4
        else 99
      end
    `;

  try {
    return await queryTuitionSection();
  } catch (err) {
    console.warn("[tuition-page] failed querying TuitionSection, falling back to TuitionPage", err);
  }

  try {
    return await queryTuitionPage();
  } catch (err) {
    console.error("[tuition-page] failed querying TuitionPage", err);
    return [];
  }
}

export async function getTuitionContent(langValue: string | null): Promise<TuitionPayload> {
  const lang = toLanguage(langValue) ?? "en";
  const rows = await fetchRows();
  const payload: TuitionPayload = {};
  type TuitionSectionValue = TuitionPayload[keyof TuitionPayload];
  for (const row of rows) {
    const sectionKey = SECTION_COMPONENT_MAP[row.componentType];
    if (!sectionKey) continue;
    const translated = getTranslationForLang(row.content, lang);
    if (!translated) continue;
    payload[sectionKey] = translated as TuitionSectionValue;
  }
  return payload;
}

export async function getTuitionSections(langValue: string | null) {
  const lang = toLanguage(langValue) ?? "en";
  const rows = await fetchRows();
  const sections: Array<{ componentType: string; content: Record<string, unknown> | null }> = [];
  for (const row of rows) {
    const translated = getTranslationForLang(row.content, lang);
    const componentType = COMPONENT_TYPE_ALIASES[row.componentType] ?? row.componentType;
    sections.push({ componentType, content: translated });
  }
  return sections;
}
