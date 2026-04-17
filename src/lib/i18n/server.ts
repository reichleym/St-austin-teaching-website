import { cookies } from 'next/headers';
import { getNestedValue, toLanguage, translationsMap, type Language } from './catalog';

export async function getServerLanguage(): Promise<Language> {
  const cookieStore = await cookies();
  const cookieLang = cookieStore.get('lang')?.value ?? null;
  return toLanguage(cookieLang) ?? 'en';
}

export async function getServerTranslations() {
  const lang = await getServerLanguage();
  const translations = translationsMap[lang];
  const fallbackTranslations = translationsMap.en;

  function t(key: string): string {
    const value = getNestedValue(translations, key);
    if (typeof value === 'string') {
      return value;
    }

    const fallbackValue = getNestedValue(fallbackTranslations, key);
    if (typeof fallbackValue === 'string') {
      return fallbackValue;
    }

    return key;
  }

  return { lang, translations, t };
}

