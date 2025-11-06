'use client';

import { useState, useEffect } from 'react';
import { useUILanguage } from './UILanguageProvider';
import { UI_LANGUAGES, type UILanguageCode } from '@/lib/i18n';

interface SupportedLanguage {
  code: string;
  name: string;
  deeplCode: string;
}

interface UILanguageSelectorProps {
  apiKey?: string;
}

export default function UILanguageSelector({ apiKey }: UILanguageSelectorProps) {
  const { language, setLanguage, t } = useUILanguage();
  const [languages, setLanguages] = useState<SupportedLanguage[]>([
    { code: 'en', name: 'English', deeplCode: 'EN-GB' }
  ]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch supported languages from DeepL using user's API key
    async function fetchLanguages() {
      try {
        // If no API key, just show English
        if (!apiKey) {
          setLanguages([{ code: 'en', name: 'English', deeplCode: 'EN-GB' }]);
          setIsLoading(false);
          return;
        }

        const response = await fetch(`/api/supported-languages?apiKey=${encodeURIComponent(apiKey)}`);
        if (response.ok) {
          const data = await response.json();
          setLanguages(data.languages);
        } else {
          // Fallback to English only
          setLanguages([{ code: 'en', name: 'English', deeplCode: 'EN-GB' }]);
        }
      } catch (error) {
        console.error('Failed to fetch languages:', error);
        // Fallback to English only
        setLanguages([{ code: 'en', name: 'English', deeplCode: 'EN-GB' }]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchLanguages();
  }, [apiKey]);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCode = e.target.value as UILanguageCode;
    const selectedLang = languages.find(l => l.code === selectedCode);
    setLanguage(selectedCode, selectedLang?.deeplCode);
  };

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="ui-language" className="text-sm font-medium text-gray-700">
        {t.uiLanguage}:
      </label>
      <select
        id="ui-language"
        value={language}
        onChange={handleLanguageChange}
        className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
        disabled={isLoading}
      >
        {isLoading ? (
          <option>Loading...</option>
        ) : (
          languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))
        )}
      </select>
    </div>
  );
}
