import "server-only";
import { getSql, isDatabaseConfigured } from "@/lib/postgres";
import { toLanguage, type Language } from "@/lib/i18n/catalog";

export type GovBanner = {
  title?: string;
  description?: string;
  bgImg?: string;
};

export type GovDiscountCard = {
  discountPercent?: number;
  contactEmail?: string;
  phoneNumber?: string;
};

export type GovHowItWorks = {
  title?: string;
  steps?: string[];
};

export type GovSupportGroup = {
  title?: string;
  summary?: string;
  support?: string[];
};

export type GovSupportGroupsSection = {
  title?: string;
  description?: string;
  groups?: GovSupportGroup[];
};

export type GovCta = {
  title?: string;
  buttons?: Array<{ text?: string; href?: string }>;
};

export type GovQuickLinkItem = {
  title?: string;
  href?: string;
};

export type GovQuickLinks = {
  title?: string;
  subtitle?: string;
  links?: GovQuickLinkItem[];
};

export type GovernmentEmployeesPayload = {
  banner?: GovBanner;
  discountCard?: GovDiscountCard;
  howItWorks?: GovHowItWorks;
  supportGroups?: GovSupportGroupsSection;
  cta?: GovCta;
  quickLinks?: GovQuickLinks;
};

const SECTION_COMPONENT_MAP: Record<string, keyof GovernmentEmployeesPayload> =
  {
    BannerSection: "banner",
    GovernmentEmployeeDiscountCard: "discountCard",
    HowItWorksSection: "howItWorks",
    SupportGroupsSection: "supportGroups",
    CtaSection: "cta",
    QuickLinksSection: "quickLinks",
  };

type RawRow = { componentType: string; content: unknown };

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
  if (!content) return null;

  const translations = normalizeObject(content.translations);
  if (!translations) return normalizeObject(content);

  const languageContent = normalizeObject(translations[lang]);
  if (languageContent) return languageContent;

  return normalizeObject(translations.en);
}

async function fetchRows(): Promise<RawRow[]> {
  if (!isDatabaseConfigured) {
    console.warn("[gov-page] database not configured — skipping query");
    return [];
  }

  try {
    const sql = getSql();
    return await sql<RawRow[]>`
      select coalesce("componentType", "content"->>'componentType') as "componentType", "content"
      from "GovernmentEmployeesSection"
      where coalesce("componentType", "content"->>'componentType') in (
        'BannerSection',
        'GovernmentEmployeeDiscountCard',
        'HowItWorksSection',
        'SupportGroupsSection',
        'CtaSection',
        'QuickLinksSection'
      )
      order by case
        when coalesce("componentType", "content"->>'componentType') = 'BannerSection' then 0
        when coalesce("componentType", "content"->>'componentType') = 'GovernmentEmployeeDiscountCard' then 1
        when coalesce("componentType", "content"->>'componentType') = 'HowItWorksSection' then 2
        when coalesce("componentType", "content"->>'componentType') = 'SupportGroupsSection' then 3
        when coalesce("componentType", "content"->>'componentType') = 'CtaSection' then 4
        when coalesce("componentType", "content"->>'componentType') = 'QuickLinksSection' then 5
        else 99
      end
    `;
  } catch (err) {
    console.warn(
      "[gov-page] failed querying GovernmentEmployeesSection, falling back to GovernmentEmployeesPage",
      err,
    );
  }

  try {
    const sql = getSql();
    return await sql<RawRow[]>`
      select coalesce("componentType", "content"->>'componentType') as "componentType", "content"
      from "GovernmentEmployeesPage"
      where coalesce("componentType", "content"->>'componentType') in (
        'BannerSection',
        'GovernmentEmployeeDiscountCard',
        'HowItWorksSection',
        'SupportGroupsSection',
        'CtaSection',
        'QuickLinksSection'
      )
      order by case
        when coalesce("componentType", "content"->>'componentType') = 'BannerSection' then 0
        when coalesce("componentType", "content"->>'componentType') = 'GovernmentEmployeeDiscountCard' then 1
        when coalesce("componentType", "content"->>'componentType') = 'HowItWorksSection' then 2
        when coalesce("componentType", "content"->>'componentType') = 'SupportGroupsSection' then 3
        when coalesce("componentType", "content"->>'componentType') = 'CtaSection' then 4
        when coalesce("componentType", "content"->>'componentType') = 'QuickLinksSection' then 5
        else 99
      end
    `;
  } catch (err) {
    console.error("[gov-page] error fetching rows:", err);
    return [];
  }
}

export async function getGovernmentEmployeesContent(
  langValue: string | null,
): Promise<GovernmentEmployeesPayload> {
  const lang = toLanguage(langValue) ?? "en";
  const rows = await fetchRows();

  const payload: GovernmentEmployeesPayload = {};
  type GovernmentEmployeesSectionValue =
    GovernmentEmployeesPayload[keyof GovernmentEmployeesPayload];

  for (const row of rows) {
    const sectionKey = SECTION_COMPONENT_MAP[row.componentType];
    if (!sectionKey) continue;

    const translated = getTranslationForLang(row.content, lang);
    if (!translated) continue;

    payload[sectionKey] = translated as GovernmentEmployeesSectionValue;
  }

  return payload;
}

export async function getGovernmentEmployeesSections(langValue: string | null) {
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
