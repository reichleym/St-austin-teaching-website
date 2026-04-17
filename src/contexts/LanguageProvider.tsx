'use client';

import { createContext, useEffect, ReactNode, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toLanguage, translationsMap, type Language } from '@/lib/i18n/catalog';

function getCookieValue(name: string): string | null {
  if (typeof document === 'undefined') {
    return null;
  }

  const cookies = document.cookie ? document.cookie.split('; ') : [];
  for (const cookie of cookies) {
    const [key, ...rest] = cookie.split('=');
    if (key === name) {
      return rest.join('=');
    }
  }

  return null;
}

function decodeCookieValue(value: string | null): string | null {
  if (!value) {
    return null;
  }

  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function getClientLanguage(): Language {
  if (typeof document === 'undefined') {
    return 'en';
  }

  const cookieLang = toLanguage(decodeCookieValue(getCookieValue('lang')));
  let storedLang: Language | null = null;
  try {
    storedLang = toLanguage(localStorage.getItem('lang'));
  } catch {
    storedLang = null;
  }

  return cookieLang ?? storedLang ?? 'en';
}

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  translations: Record<string, unknown>;
  fallbackTranslations: Record<string, unknown>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
  suppressHydrationWarning?: boolean;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const router = useRouter();
  const [lang, setLangState] = useState<Language>(() => getClientLanguage());

  const translations = translationsMap[lang];

  const setLang = useCallback((newLang: Language) => {
    const maxAgeSeconds = 60 * 60 * 24 * 365; // 1 year

    try {
      localStorage.setItem('lang', newLang);
    } catch {
      // ignore storage failures
    }

    if (typeof document !== 'undefined') {
      document.cookie = `lang=${encodeURIComponent(newLang)}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax`;
      document.documentElement.lang = newLang;
    }

    setLangState(newLang);
    router.refresh();
  }, [router]);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    document.documentElement.lang = lang;

    const maxAgeSeconds = 60 * 60 * 24 * 365; // 1 year
    const cookieLang = toLanguage(decodeCookieValue(getCookieValue('lang')));
    if (!cookieLang) {
      document.cookie = `lang=${encodeURIComponent(lang)}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax`;
      if (lang !== 'en') {
        router.refresh();
      }
    }

    try {
      const storedLang = toLanguage(localStorage.getItem('lang'));
      if (!storedLang) {
        localStorage.setItem('lang', lang);
      }
    } catch {
      // ignore storage failures
    }
  }, [lang, router]);

  return (
    <LanguageContext.Provider
      value={{
        lang,
        setLang,
        translations,
        fallbackTranslations: translationsMap.en,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export { LanguageContext };
