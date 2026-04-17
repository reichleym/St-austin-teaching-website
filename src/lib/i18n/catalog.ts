import en from '@/lib/translations/en.json';
import fr from '@/lib/translations/fr.json';
import portalEn from '@/lib/translations/portal.json';
import portalFr from '@/lib/translations/portal.fr.json';
import tuitionEn from '@/lib/translations/tuition-scholarships.json';
import tuitionFr from '@/lib/translations/tuition-scholarships.fr.json';

export type Language = 'en' | 'fr';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asRecord(value: unknown): Record<string, unknown> {
  return isRecord(value) ? value : {};
}

export function toLanguage(value: string | null): Language | null {
  if (value === 'en' || value === 'fr') {
    return value;
  }
  return null;
}

const enRecord = asRecord(en);
const frRecord = asRecord(fr);

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
};

export function getNestedValue(source: unknown, key: string): unknown {
  return key.split('.').reduce<unknown>((current, segment) => {
    if (typeof current !== 'object' || current === null) {
      return undefined;
    }

    return (current as Record<string, unknown>)[segment];
  }, source);
}

