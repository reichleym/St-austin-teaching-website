import "server-only";
import { getSql, isDatabaseConfigured } from "@/lib/postgres";
import { toLanguage, type Language } from "@/lib/i18n/catalog";

export type DonationsBanner = { title?: string; description?: string; bgImg?: string };
export type DonationFormSection = {
  title?: string;
  description?: string;
  oneTimeAmounts?: string[];
  designationOptions?: string[];
  paymentMethods?: Array<{ value: string; label: string }>;
};
export type WhyGiveSection = {
  title?: string;
  stats?: Record<string, string>;
  labels?: { raised?: string; students?: string };
  description?: string;
};
export type OtherWaysSection = { title?: string; items?: string[] };
export type ImpactSection = { title?: string; blockContent?: Array<{ cardTitle?: string; cardDescription?: string; icon?: string }> };
export type MatchingGiftSectionContent = {
  title?: string;
  description?: string;
  searchLabel?: string;
  searchPlaceholder?: string;
  searchButton?: string;
};
export type DonationsPayload = {
  banner?: DonationsBanner;
  donationForm?: DonationFormSection;
  whyGive?: WhyGiveSection;
  otherWays?: OtherWaysSection;
  impact?: ImpactSection;
  matchingGift?: MatchingGiftSectionContent;
  cta?: { title?: string; desc?: string };
};

const SECTION_COMPONENT_MAP: Record<string, keyof DonationsPayload> = {
  BannerSection: "banner",
  DonationFormSection: "donationForm",
  WhyGiveSection: "whyGive",
  OtherWaysSection: "otherWays",
  Accreditation: "impact",
  MatchingGiftSection: "matchingGift",
  CtaSection: "cta",
};

type RawRow = { componentType: string; content: unknown };
export type DonationsSection = { componentType: string; content: Record<string, unknown> | null };

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
    console.warn("[donations-page] database not configured — skipping query");
    return [];
  }

  const sql = getSql();

  const queryDonationsSection = async () =>
    sql<RawRow[]>`
        select coalesce("componentType", "content"->>'componentType') as "componentType", "content"
        from "DonationsSection"
        where coalesce("componentType", "content"->>'componentType') in (
          'BannerSection',
          'DonationFormSection',
          'WhyGiveSection',
          'OtherWaysSection',
          'Accreditation',
          'MatchingGiftSection',
          'CtaSection'
        )
        order by case
          when coalesce("componentType", "content"->>'componentType') = 'BannerSection' then 0
          when coalesce("componentType", "content"->>'componentType') = 'DonationFormSection' then 1
          when coalesce("componentType", "content"->>'componentType') = 'WhyGiveSection' then 2
          when coalesce("componentType", "content"->>'componentType') = 'OtherWaysSection' then 3
          when coalesce("componentType", "content"->>'componentType') = 'Accreditation' then 4
          when coalesce("componentType", "content"->>'componentType') = 'MatchingGiftSection' then 5
          when coalesce("componentType", "content"->>'componentType') = 'CtaSection' then 6
          else 99
        end
      `;

  const queryDonationsPage = async () =>
    sql<RawRow[]>`
        select coalesce("componentType", "content"->>'componentType') as "componentType", "content"
        from "DonationsPage"
        where coalesce("componentType", "content"->>'componentType') in (
          'BannerSection',
          'DonationFormSection',
          'WhyGiveSection',
          'OtherWaysSection',
          'Accreditation',
          'MatchingGiftSection',
          'CtaSection'
        )
        order by case
          when coalesce("componentType", "content"->>'componentType') = 'BannerSection' then 0
          when coalesce("componentType", "content"->>'componentType') = 'DonationFormSection' then 1
          when coalesce("componentType", "content"->>'componentType') = 'WhyGiveSection' then 2
          when coalesce("componentType", "content"->>'componentType') = 'OtherWaysSection' then 3
          when coalesce("componentType", "content"->>'componentType') = 'Accreditation' then 4
          when coalesce("componentType", "content"->>'componentType') = 'MatchingGiftSection' then 5
          when coalesce("componentType", "content"->>'componentType') = 'CtaSection' then 6
          else 99
        end
      `;

  try {
    return await queryDonationsSection();
  } catch (err) {
    console.warn("[donations-page] failed querying DonationsSection, falling back to DonationsPage", err);
  }

  try {
    return await queryDonationsPage();
  } catch (err) {
    console.error("[donations-page] failed querying DonationsPage", err);
    return [];
  }
}

export async function getDonationsContent(langValue: string | null): Promise<DonationsPayload> {
  const { payload } = await getDonationsPageData(langValue);
  return payload;
}

export async function getDonationsSections(langValue: string | null) {
  const { sections } = await getDonationsPageData(langValue);
  return sections;
}

export async function getDonationsPageData(langValue: string | null): Promise<{
  lang: Language;
  payload: DonationsPayload;
  sections: DonationsSection[];
}> {
  const lang = toLanguage(langValue) ?? "en";
  const rows = await fetchRows();

  const payload: DonationsPayload = {};
  const sections: DonationsSection[] = [];
  type DonationsSectionValue = DonationsPayload[keyof DonationsPayload];

  for (const row of rows) {
    const translated = getTranslationForLang(row.content, lang);
    sections.push({ componentType: row.componentType, content: translated });

    const sectionKey = SECTION_COMPONENT_MAP[row.componentType];
    if (!sectionKey || !translated) continue;
    payload[sectionKey] = translated as DonationsSectionValue;
  }

  return { lang, payload, sections };
}
