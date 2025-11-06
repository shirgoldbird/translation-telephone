'use client';

import { useUILanguage } from './UILanguageProvider';
import { UI_LANGUAGES, type UILanguageCode } from '@/lib/i18n';

export default function UILanguageSelector() {
  const { language, setLanguage, t } = useUILanguage();

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="ui-language" className="text-sm font-medium text-gray-700">
        {t.uiLanguage}:
      </label>
      <select
        id="ui-language"
        value={language}
        onChange={(e) => setLanguage(e.target.value as UILanguageCode)}
        className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
      >
        {UI_LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
}
