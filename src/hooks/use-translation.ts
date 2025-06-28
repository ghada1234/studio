'use client';

import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
} from 'react';
import en from '@/locales/en.json';
import ar from '@/locales/ar.json';

type Language = 'en' | 'ar';

const translations: Record<Language, any> = { en, ar };

interface TranslationContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, values?: Record<string, string | number>) => string;
  dir: 'ltr' | 'rtl';
}

const TranslationContext = createContext<TranslationContextType | undefined>(
  undefined
);

export function TranslationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [language, setLanguageState] = useState<Language>('ar');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language | null;
    if (savedLanguage && ['en', 'ar'].includes(savedLanguage)) {
      setLanguageState(savedLanguage);
      document.documentElement.lang = savedLanguage;
      document.documentElement.dir = savedLanguage === 'ar' ? 'rtl' : 'ltr';
    } else {
      // Set initial lang/dir if nothing is saved
      document.documentElement.lang = language;
      document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  };

  const dir = language === 'ar' ? 'rtl' : 'ltr';

  const t = (
    key: string,
    values?: Record<string, string | number>
  ): string => {
    const keys = key.split('.');
    let result: any = translations[language];
    for (const k of keys) {
      result = result?.[k];
      if (result === undefined) {
        // Fallback to English if translation is missing in the current language
        let fallbackResult: any = translations['en'];
        for (const fbKey of keys) {
          fallbackResult = fallbackResult?.[fbKey];
          if (fallbackResult === undefined) {
            return key; // Return the key if not found in English either
          }
        }
        result = fallbackResult;
        break;
      }
    }

    let strResult = (result as string) || key;

    if (values) {
      Object.entries(values).forEach(([k, v]) => {
        strResult = strResult.replace(new RegExp(`{{${k}}}`, 'g'), String(v));
      });
    }

    return strResult;
  };

  const contextValue = useMemo(
    () => ({
      language,
      setLanguage,
      t,
      dir,
    }),
    [language]
  );

  return React.createElement(
    TranslationContext.Provider,
    { value: contextValue },
    children
  );
}

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};
