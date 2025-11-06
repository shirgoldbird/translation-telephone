'use client';

import { useState } from 'react';
import { SUPPORTED_LANGUAGES, type LanguageCode } from '@/lib/types';
import { useUILanguage } from './UILanguageProvider';

interface TranslationInputProps {
  onSubmit: (text: string, languageChain: LanguageCode[]) => void;
  onRandomSubmit: (text: string, chainLength: number) => void;
  isLoading: boolean;
}

export default function TranslationInput({
  onSubmit,
  onRandomSubmit,
  isLoading,
}: TranslationInputProps) {
  const { t } = useUILanguage();
  const [text, setText] = useState('');
  const [chainLength, setChainLength] = useState(5);
  const [languageChain, setLanguageChain] = useState<LanguageCode[]>([]);
  const [useRandom, setUseRandom] = useState(true);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    // Auto-resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
  };

  const handleAddLanguage = (langCode: LanguageCode) => {
    if (languageChain.length < 15) {
      setLanguageChain([...languageChain, langCode]);
    }
  };

  const handleRemoveLanguage = (index: number) => {
    setLanguageChain(languageChain.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    if (useRandom) {
      onRandomSubmit(text, chainLength);
    } else {
      if (languageChain.length < 3) {
        alert('Please add at least 3 languages to the chain');
        return;
      }
      onSubmit(text, languageChain);
    }
  };

  const getLanguageName = (code: LanguageCode) => {
    return SUPPORTED_LANGUAGES.find(l => l.code === code)?.name || code;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Input Text */}
      <div>
        <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-2">
          {t.enterText}
        </label>
        <textarea
          id="text"
          value={text}
          onChange={handleTextChange}
          onKeyDown={(e) => {
            // Submit on Cmd+Enter (Mac) or Ctrl+Enter (Windows/Linux)
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
              e.preventDefault();
              handleSubmit(e as any);
            }
          }}
          placeholder={t.placeholder}
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0177A9] focus:border-[#0177A9] resize-none text-gray-900 placeholder-gray-400 transition-all overflow-hidden"
          style={{ minHeight: '80px', maxHeight: '400px' }}
          disabled={isLoading}
        />
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setUseRandom(true)}
          className={`flex-1 px-6 py-3 rounded-full font-medium transition-all ${
            useRandom
              ? 'bg-[#0177A9] text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          disabled={isLoading}
        >
          {t.randomChain}
        </button>
        <button
          type="button"
          onClick={() => setUseRandom(false)}
          className={`flex-1 px-6 py-3 rounded-full font-medium transition-all ${
            !useRandom
              ? 'bg-[#0177A9] text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          disabled={isLoading}
        >
          {t.customChain}
        </button>
      </div>

      {/* Random Chain Length Slider */}
      {useRandom && (
        <div>
          <label htmlFor="chainLength" className="block text-sm font-medium text-gray-700 mb-2">
            {t.chainLength}: {chainLength} {t.hops}
          </label>
          <input
            id="chainLength"
            type="range"
            min="5"
            max="15"
            value={chainLength}
            onChange={(e) => setChainLength(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#0177A9]"
            disabled={isLoading}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>5</span>
            <span>10</span>
            <span>15</span>
          </div>
        </div>
      )}

      {/* Custom Language Chain Builder */}
      {!useRandom && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t.buildLanguageChain} ({languageChain.length}/15)
          </label>

          {/* Selected Languages */}
          {languageChain.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3 p-3 bg-gray-50 rounded-lg">
              {languageChain.map((lang, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  <span>{index + 1}. {getLanguageName(lang)}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveLanguage(index)}
                    className="hover:text-blue-600 font-bold"
                    disabled={isLoading}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Language Selector */}
          <select
            onChange={(e) => {
              if (e.target.value) {
                handleAddLanguage(e.target.value as LanguageCode);
                e.target.value = '';
              }
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0177A9] focus:border-blue-500"
            disabled={isLoading || languageChain.length >= 15}
          >
            <option value="">{t.addLanguage}</option>
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || !text.trim() || (!useRandom && languageChain.length < 3)}
        className="w-full px-6 py-3 bg-[#0177A9] text-white font-medium rounded-full hover:bg-[#015F8A] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
      >
        {isLoading ? t.translating : t.startTranslation}
      </button>
    </form>
  );
}
