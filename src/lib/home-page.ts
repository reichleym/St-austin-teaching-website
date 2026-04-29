import { getSql } from "@/lib/postgres";
import { toLanguage, type Language } from "@/lib/i18n/catalog";

export type HeroSectionType = {
  title?: string;
  description?: string;
  bgImg?: string;
};

export type WhyAustinItem = {
  icon?: string;
  title?: string;
  description?: string;
};

export type WhyAustinType = {
  title?: string;
  whyAustinDesc?: string;
  button?: {
    href?: string;
    label?: string;
  };
  whiteCards?: WhyAustinItem[];
};

export type LearnSomethingCard = {
  title?: string;
  desc?: string;
};

export type LearnSomethingSection = {
  title?: string;
  desc?: string;
  cards?: LearnSomethingCard[];
};

export type LearningExpCard = {
  title?: string;
  desc?: string;
  image?: string;
  icon?: string;
};

export type LearningExpSection = {
  title?: string;
  desc?: string;
  image?: string;
  cards?: LearningExpCard[];
};

export type NewsItem = {
  tag?: string;
  date?: string;
  image?: string;
  icon?: string;
  title?: string;
  excerpt?: string;
};

export type NewsAnnouncementsType = {
  title?: string;
  items?: NewsItem[];
};

export type CtaType = {
  title?: string;
  description?: string;
  button?: {
    href?: string;
    label?: string;
  };
};

export type TestimonialItem = {
  image?: string;
  quote?: string;
  author?: string;
  authorRole?: string;
};

export type TestimonialType = {
  title?: string;
  description?: string;
  testimonials?: TestimonialItem[];
};

export type GenericSection = Record<string, unknown>;

export type HomePayload = {
  hero?: HeroSectionType;
  whyAustin?: WhyAustinType;
  testimonial?: TestimonialType;
  learnSomething?: LearnSomethingSection;
  learningExp?: LearningExpSection;
  newsAnnouncements?: NewsAnnouncementsType;
  explorePrograms?: GenericSection;
  featuredPrograms?: GenericSection;
  cta?: CtaType;
};

const SECTION_COMPONENT_MAP: Record<string, keyof HomePayload> = {
  HeroSection: "hero",
  WhyAustin: "whyAustin",
  Testimonial: "testimonial",
  LearnSomething: "learnSomething",
  LearningExp: "learningExp",
  NewsAnnouncements: "newsAnnouncements",
  ExplorePrograms: "explorePrograms",
  FeaturedPrograms: "featuredPrograms",
  CtaSection: "cta",
};

type RawRow = { componentType: string; content: unknown };

type SectionValueMap = {
  hero: HeroSectionType;
  whyAustin: WhyAustinType;
  testimonial: TestimonialType;
  learnSomething: LearnSomethingSection;
  learningExp: LearningExpSection;
  newsAnnouncements: NewsAnnouncementsType;
  explorePrograms: GenericSection;
  featuredPrograms: GenericSection;
  cta: CtaType;
};

type TranslationObject = {
  [key in Language]?: string;
} & {
  en?: string;
};

async function fetchRows(): Promise<RawRow[]> {
  const sql = getSql();

  return await sql<RawRow[]>`
    SELECT 
      coalesce("componentType", "content"->>'componentType') as "componentType",
      "content"
    FROM "HomeSection"
    WHERE coalesce("componentType", "content"->>'componentType') IN (
      'HeroSection',
      'WhyAustin',
      'Testimonial',
      'LearnSomething',
      'LearningExp',
      'NewsAnnouncements',
      'ExplorePrograms',
      'FeaturedPrograms',
      'CtaSection'
    )
    ORDER BY CASE
      WHEN coalesce("componentType", "content"->>'componentType') = 'HeroSection' THEN 0
      WHEN coalesce("componentType", "content"->>'componentType') = 'ExplorePrograms' THEN 1
      WHEN coalesce("componentType", "content"->>'componentType') = 'FeaturedPrograms' THEN 2
      WHEN coalesce("componentType", "content"->>'componentType') = 'WhyAustin' THEN 3
      WHEN coalesce("componentType", "content"->>'componentType') = 'LearnSomething' THEN 4
      WHEN coalesce("componentType", "content"->>'componentType') = 'Testimonial' THEN 5
      WHEN coalesce("componentType", "content"->>'componentType') = 'LearningExp' THEN 6
      WHEN coalesce("componentType", "content"->>'componentType') = 'NewsAnnouncements' THEN 7
      WHEN coalesce("componentType", "content"->>'componentType') = 'CtaSection' THEN 8
      ELSE 99
    END
  `;
}

function normalizeObject(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function isTranslationObject(value: unknown): value is TranslationObject {
  return (
    typeof value === "object" &&
    value !== null &&
    ("en" in value || "fr" in value)
  );
}

function deepTranslate<T>(obj: T, lang: Language): T {
  // Array
  if (Array.isArray(obj)) {
    return obj.map((item) => deepTranslate(item, lang)) as T;
  }

  // Translation object
  if (isTranslationObject(obj)) {
    return (obj[lang] ?? obj.en ?? "") as T;
  }

  // Object
  if (typeof obj === "object" && obj !== null) {
    const result: { [K in keyof T]?: T[K] } = {};

    for (const key in obj) {
      result[key] = deepTranslate(obj[key], lang);
    }

    return result as T;
  }

  // Primitive
  return obj;
}

export async function getHomePageContent(
  langValue: string | null,
): Promise<HomePayload> {
  const lang = toLanguage(langValue) ?? "en";
  const rows = await fetchRows();

  const payload: Partial<SectionValueMap> = {};

  for (const row of rows) {
    const key = SECTION_COMPONENT_MAP[row.componentType];
    if (!key) continue;

    const base = normalizeObject(row.content);
    if (!base) continue;

    const translated = deepTranslate(base, lang);
    if (!translated) continue;

    payload[key] = translated as SectionValueMap[typeof key];
  }

  return payload;
}
