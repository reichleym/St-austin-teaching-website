'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import en from '@/lib/translations/en.json';
import fr from '@/lib/translations/fr.json';

type Language = 'en' | 'fr';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  translations: Record<string, any>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

const translationsMap: Record<Language, Record<string, any>> = {
  en,
  fr,
};

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [lang, setLangState] = useState<Language>('en');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const translations = translationsMap[lang];

  const setLang = (newLang: Language) => {
    // Update URL
    const params = new URLSearchParams(searchParams.toString());
    params.set('lang', newLang);
    router.replace(`${pathname}?${params.toString()}`);

    // Update localStorage
    localStorage.setItem('lang', newLang);

    setLangState(newLang);
  };

  useEffect(() => {
    const storedLang = localStorage.getItem('lang') as Language | null;
    const urlLang = (searchParams.get('lang') as Language) || null;

    const nextLang = (urlLang || storedLang || 'en') as Language;
    setLangState(nextLang);
  }, [searchParams]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, translations }}>
      {children}
    </LanguageContext.Provider>
  );
}

export { LanguageContext };

