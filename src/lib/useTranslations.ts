'use client';

import { useContext } from 'react';
import { LanguageContext } from '@/contexts/LanguageProvider';
import { getNestedValue } from '@/lib/i18n/catalog';

export function useTranslations() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslations must be used within LanguageProvider');
  }

  const { translations, fallbackTranslations, lang, setLang } = context;

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

  return { t, lang, setLang };
}
