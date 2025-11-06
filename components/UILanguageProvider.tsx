'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, type UILanguageCode, type Translations } from '@/lib/i18n';

interface UILanguageContextType {
  language: UILanguageCode;
  setLanguage: (lang: UILanguageCode) => void;
  t: Translations;
}

const UILanguageContext = createContext<UILanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'translation-telephone-ui-lang';

export function UILanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<UILanguageCode>('en');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved language from localStorage on mount
  useEffect(() => {
    const savedLang = localStorage.getItem(STORAGE_KEY) as UILanguageCode;
    if (savedLang && translations[savedLang]) {
      setLanguage(savedLang);
    }
    setIsLoaded(true);
  }, []);

  // Save language to localStorage when it changes
  const handleSetLanguage = (lang: UILanguageCode) => {
    setLanguage(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  };

  const value = {
    language,
    setLanguage: handleSetLanguage,
    t: translations[language],
  };

  // Don't render children until we've loaded the saved language
  // This prevents a flash of the default language
  if (!isLoaded) {
    return null;
  }

  return (
    <UILanguageContext.Provider value={value}>
      {children}
    </UILanguageContext.Provider>
  );
}

export function useUILanguage() {
  const context = useContext(UILanguageContext);
  if (context === undefined) {
    throw new Error('useUILanguage must be used within a UILanguageProvider');
  }
  return context;
}
