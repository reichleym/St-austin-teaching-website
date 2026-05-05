import "server-only";
import { getSql, isDatabaseConfigured } from "@/lib/postgres";
import { toLanguage, type Language } from "@/lib/i18n/catalog";

export type FooterSocial = {
  label?: string;
  url?: string;
  icon?: string;
};

export type FooterPayload = {
  description?: string;
  address?: string;
  socials?: FooterSocial[];
};
type RawRow = {
  componentType: string;
  content: unknown;
};

function asString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function normalizeObject(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function getTranslation(value: unknown, lang: Language) {
  const obj = normalizeObject(value);
  if (!obj) return null;

  if (typeof obj[lang] === "string") return obj[lang];
  if (typeof obj.en === "string") return obj.en;

  return null;
}

function normalizeSocials(value: unknown): FooterSocial[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const socials: FooterSocial[] = [];
  for (const item of value) {
    const obj = normalizeObject(item);
    if (!obj) continue;

    const label = asString(obj.label);
    const url = asString(obj.url);
    const icon = asString(obj.icon);

    if (!label && !url && !icon) continue;
    socials.push({ label, url, icon });
  }

  return socials;
}

async function fetchFooterFromDatabase(lang: Language): Promise<FooterPayload> {
  const sql = getSql();
  const rows = await sql<RawRow[]>`
    SELECT
      coalesce("componentType", "content"->>'componentType') as "componentType",
      "content"
    FROM "HomeSection"
    WHERE coalesce("componentType", "content"->>'componentType') = 'Footer'
    LIMIT 1
  `;

  const row = rows[0];
  const content = normalizeObject(row?.content);
  if (!content) return {};

  return {
    description: getTranslation(content.description, lang) ?? "",
    address: getTranslation(content.address, lang) ?? "",
    socials: normalizeSocials(content.socials) ?? [],
  };
}

async function fetchFooterFromLegacyApi(lang: Language): Promise<FooterPayload> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (!baseUrl) return {};

  const res = await fetch(`${baseUrl}/api/admin/pages/home`, {
    cache: "no-store",
  });

  if (!res.ok) return {};

  const data = (await res.json()) as unknown;
  const dataObj = normalizeObject(data);
  const sectionsValue = dataObj?.sections;
  const sections = Array.isArray(sectionsValue) ? sectionsValue : [];

  const footerSectionValue = sections.find((section) => {
    const sectionObj = normalizeObject(section);
    return sectionObj?.sectionKey === "footer";
  });

  const footerSection = normalizeObject(footerSectionValue);
  const content = normalizeObject(footerSection?.content) ?? {};
  return {
    description: getTranslation(content.description, lang) ?? "",
    address: getTranslation(content.address, lang) ?? "",
    socials: normalizeSocials(content.socials) ?? [],
  };
}

export async function getFooterContent(langValue: string | null) {
  const lang = toLanguage(langValue) ?? "en";

  if (isDatabaseConfigured) {
    try {
      return await fetchFooterFromDatabase(lang);
    } catch (e) {
      console.error("[footer] database fetch error", e);
    }
  }

  try {
    return await fetchFooterFromLegacyApi(lang);
  } catch (e) {
    console.error("[footer] legacy API fetch error", e);
    return {};
  }
}
