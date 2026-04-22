'use client';

import { createContext, useEffect, ReactNode, useCallback, useState } from 'react';
import { useMemo } from 'react';
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

  const [systemTranslations, setSystemTranslations] = useState<Record<string, unknown> | null>(null);

  const baseTranslations = translationsMap[lang] ?? {};

  const translations = useMemo(() => {
    if (!systemTranslations) return baseTranslations;
    return { ...baseTranslations, ...systemTranslations };
  }, [baseTranslations, systemTranslations]);

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

  // Load or fetch system translations when language changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const storageKey = `system_translations_${lang}`;

    try {
      const cached = localStorage.getItem(storageKey);
      if (cached) {
        setSystemTranslations(JSON.parse(cached));
        return;
      }
    } catch {
      // ignore
    }

    // Only fetch for non-en languages to avoid redundant data
    if (lang === 'en') {
      setSystemTranslations(null);
      return;
    }

    let mounted = true;

    (async () => {
      try {
        const res = await fetch('/api/system-translations');
        if (!res.ok) return;
        const json = await res.json();
        const rawMap = json?.data?.translations ?? {};

        // Flatten rawMap into translation keys under `system.universityCareers.{key}.{field}`
        const flattened: Record<string, unknown> = {};
        for (const itemKey of Object.keys(rawMap)) {
          const item = rawMap[itemKey];
          const langBlock = item?.[lang];
          if (langBlock && typeof langBlock === 'object') {
            for (const field of Object.keys(langBlock)) {
              const value = langBlock[field];
              if (typeof value === 'string') {
                flattened[`system.universityCareers.${itemKey}.${field}`] = value;
              }
            }
          }
        }

        if (!mounted) return;
        setSystemTranslations(flattened);

        try {
          localStorage.setItem(storageKey, JSON.stringify(flattened));
        } catch {
          // ignore
        }
      } catch (e) {
        console.error('[LanguageProvider] Failed to load system translations', e);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [lang]);

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
