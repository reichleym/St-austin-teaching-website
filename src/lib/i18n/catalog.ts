import en from '@/lib/translations/en.json';
import fr from '@/lib/translations/fr.json';
import es from '@/lib/translations/es.json';
import portalEn from '@/lib/translations/portal.json';
import portalFr from '@/lib/translations/portal.fr.json';
import portalEs from '@/lib/translations/portal.es.json';
import tuitionEn from '@/lib/translations/tuition-scholarships.json';
import tuitionFr from '@/lib/translations/tuition-scholarships.fr.json';
import tuitionEs from '@/lib/translations/tuition-scholarships.es.json';

export type Language = 'en' | 'fr' | 'es';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asRecord(value: unknown): Record<string, unknown> {
  return isRecord(value) ? value : {};
}

export function toLanguage(value: string | null): Language | null {
  if (!value) return null;

  const normalized = value.trim().toLowerCase();
  if (normalized === 'en' || normalized === 'fr' || normalized === 'es') {
    return normalized;
  }

  const base = normalized.split(/[-_]/)[0];
  if (base === 'en' || base === 'fr' || base === 'es') {
    return base;
  }

  // Common alias seen in CMS / spreadsheets
  if (base === 'sp') {
    return 'es';
  }

  return null;
}

const enRecord = asRecord(en);
const frRecord = asRecord(fr);
const esRecord = asRecord(es);

export const translationsMap: Record<Language, Record<string, unknown>> = {
  en: {
    ...enRecord,
    portal: portalEn as unknown as Record<string, unknown>,
    tuition: {
      ...asRecord(enRecord['tuition']),
      scholarships: tuitionEn as unknown as Record<string, unknown>,
    },
  },
  fr: {
    ...frRecord,
    portal: portalFr as unknown as Record<string, unknown>,
    tuition: {
      ...asRecord(frRecord['tuition']),
      scholarships: tuitionFr as unknown as Record<string, unknown>,
    },
  },
  es: {
    ...esRecord,
    portal: portalEs as unknown as Record<string, unknown>,
    tuition: {
      ...asRecord(esRecord['tuition']),
      scholarships: tuitionEs as unknown as Record<string, unknown>,
    },
  },
};

export function getNestedValue(source: unknown, key: string): unknown {
  return key.split('.').reduce<unknown>((current, segment) => {
    if (typeof current !== 'object' || current === null) {
      return undefined;
    }

    return (current as Record<string, unknown>)[segment];
  }, source);
}
