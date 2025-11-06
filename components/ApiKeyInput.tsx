'use client';

import { useState, useEffect, useRef } from 'react';
import { useUILanguage } from './UILanguageProvider';

interface ApiKeyInputProps {
  onApiKeyChange: (key: string, isFree: boolean) => void;
}

export default function ApiKeyInput({ onApiKeyChange }: ApiKeyInputProps) {
  const { t } = useUILanguage();
  const [apiKey, setApiKey] = useState('');
  const [isFree, setIsFree] = useState(true); // Default to Free
  const [showModal, setShowModal] = useState(false);
  const [inputType, setInputType] = useState<'password' | 'text'>('password');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load API key and type from localStorage on mount
    const savedKey = localStorage.getItem('deepl_api_key');
    const savedType = localStorage.getItem('deepl_api_type');
    if (savedKey) {
      setApiKey(savedKey);
      const savedIsFree = savedType === 'free';
      setIsFree(savedIsFree);
      onApiKeyChange(savedKey, savedIsFree);
    } else {
      // Show modal if no key saved
      setShowModal(true);
    }
  }, [onApiKeyChange]);

  const handleSaveKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem('deepl_api_key', apiKey.trim());
      localStorage.setItem('deepl_api_type', isFree ? 'free' : 'pro');
      onApiKeyChange(apiKey.trim(), isFree);
      setShowModal(false);
      setInputType('password');
    }
  };

  const handleClearKey = () => {
    localStorage.removeItem('deepl_api_key');
    localStorage.removeItem('deepl_api_type');
    setApiKey('');
    setIsFree(true);
    onApiKeyChange('', true);
    setShowModal(true);
  };

  const handleOpenModal = () => {
    setShowModal(true);
    // Focus input after modal opens
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleCloseModal = () => {
    if (apiKey.trim()) {
      setShowModal(false);
      setInputType('password');
    }
  };

  return (
    <>
      {/* Always show the button */}
      <button
        onClick={handleOpenModal}
        className="text-sm text-gray-700 hover:text-[#0177A9] transition-colors"
      >
        {t.changeAPIKey}
      </button>

      {/* Modal Backdrop - semi-transparent overlay */}
      {showModal && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.05)' }}
          onClick={handleCloseModal}
        >
          {/* Modal Content */}
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-300 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex items-start gap-3 mb-4">
              <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              <div className="flex-1 pr-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t.enterYourDeepLAPIKey}</h3>
                <p className="text-sm text-gray-700 mb-4">
                  {t.getFreeAPIKeyAt}{' '}
                  <a
                    href="https://www.deepl.com/pro-api"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline font-medium"
                  >
                    deepl.com/pro-api
                  </a>
                  {' '}{t.keyStoredLocally}
                </p>

                {/* API Type Selector */}
                <div className="mb-3 flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="apiType"
                      checked={isFree}
                      onChange={() => setIsFree(true)}
                      className="w-4 h-4 text-[#0177A9] focus:ring-[#0177A9]"
                    />
                    <span className="text-sm text-gray-700">DeepL Free</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="apiType"
                      checked={!isFree}
                      onChange={() => setIsFree(false)}
                      className="w-4 h-4 text-[#0177A9] focus:ring-[#0177A9]"
                    />
                    <span className="text-sm text-gray-700">DeepL Pro</span>
                  </label>
                </div>

                <div className="flex gap-2 mb-2">
                  <input
                    ref={inputRef}
                    type={inputType}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    onFocus={() => setInputType('text')}
                    onBlur={() => setInputType('password')}
                    placeholder="Enter your DeepL API key..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0177A9] focus:border-[#0177A9] text-gray-900"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSaveKey();
                      } else if (e.key === 'Escape') {
                        handleCloseModal();
                      }
                    }}
                  />
                  <button
                    onClick={handleSaveKey}
                    disabled={!apiKey.trim()}
                    className="px-6 py-2 bg-[#0177A9] text-white font-medium rounded-lg hover:bg-[#015F8A] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {t.save}
                  </button>
                </div>
                {apiKey && (
                  <button
                    onClick={handleClearKey}
                    className="text-sm text-gray-600 hover:text-gray-800 underline"
                  >
                    {t.clearSavedKey}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
