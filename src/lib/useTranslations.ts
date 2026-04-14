import { useContext } from 'react';
import { LanguageContext } from '@/contexts/LanguageProvider';

export function useTranslations() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslations must be used within LanguageProvider');
  }

  const { translations } = context;

  function t(key: string): string {
    return key.split('.').reduce((obj: any, k: string) => obj?.[k] ?? key, translations) as string;
  }


  return { t };
}

