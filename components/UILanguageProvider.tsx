'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { type UILanguageCode } from '@/lib/types';
import { useTranslation } from '@/lib/useTranslation';
import { type UIStringKey } from '@/lib/ui-strings';

interface UILanguageContextType {
  language: UILanguageCode;
  setLanguage: (lang: UILanguageCode, deeplCode?: string) => void;
  t: Record<UIStringKey, string>;
  isLoadingTranslations: boolean;
  translationError: string | null;
}

const UILanguageContext = createContext<UILanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'translation-telephone-ui-lang';
const DEEPL_CODE_STORAGE_KEY = 'translation-telephone-ui-lang-deepl-code';

interface UILanguageProviderProps {
  children: ReactNode;
  apiKey?: string;
}

export function UILanguageProvider({ children, apiKey }: UILanguageProviderProps) {
  const [language, setLanguageState] = useState<UILanguageCode>('en');
  const [deeplCode, setDeeplCodeState] = useState<string | undefined>(undefined);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved language from localStorage on mount
  useEffect(() => {
    const savedLang = localStorage.getItem(STORAGE_KEY) as UILanguageCode;
    const savedDeeplCode = localStorage.getItem(DEEPL_CODE_STORAGE_KEY) || undefined;
    if (savedLang) {
      setLanguageState(savedLang);
      setDeeplCodeState(savedDeeplCode);
    }
    setIsLoaded(true);
  }, []);

  // Get translations for current language
  const { translations, isLoading, error } = useTranslation(language, apiKey, deeplCode);

  // RTL languages
  const RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur'];
  const isRTL = RTL_LANGUAGES.includes(language);

  // Update document direction when language changes
  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language, isRTL]);

  // Save language to localStorage when it changes
  const setLanguage = (lang: UILanguageCode, newDeeplCode?: string) => {
    setLanguageState(lang);
    setDeeplCodeState(newDeeplCode);
    localStorage.setItem(STORAGE_KEY, lang);
    if (newDeeplCode) {
      localStorage.setItem(DEEPL_CODE_STORAGE_KEY, newDeeplCode);
    } else {
      localStorage.removeItem(DEEPL_CODE_STORAGE_KEY);
    }
  };

  const value = {
    language,
    setLanguage,
    t: translations,
    isLoadingTranslations: isLoading,
    translationError: error,
  };

  // Don't render children until we've loaded the saved language
  // This prevents a flash of the default language
  if (!isLoaded) {
    return null;
  }

  return (
    <UILanguageContext.Provider value={value}>
      {children}

      {/* Loading overlay when translating */}
      {isLoading && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.05)' }}
        >
          <div className="bg-white rounded-lg p-6 shadow-2xl max-w-sm mx-4 border border-gray-300">
            <div className="flex items-center gap-4">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#0177A9] border-t-transparent"></div>
              <div>
                <p className="font-semibold text-gray-900">Translating UI...</p>
                <p className="text-sm text-gray-600">This may take a moment</p>
              </div>
            </div>
          </div>
        </div>
      )}
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
