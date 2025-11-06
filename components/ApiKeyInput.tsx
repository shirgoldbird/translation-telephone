'use client';

import { useState, useEffect, useRef } from 'react';
import { useUILanguage } from './UILanguageProvider';

interface ApiKeyInputProps {
  onApiKeyChange: (key: string) => void;
}

export default function ApiKeyInput({ onApiKeyChange }: ApiKeyInputProps) {
  const { t } = useUILanguage();
  const [apiKey, setApiKey] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [inputType, setInputType] = useState<'password' | 'text'>('password');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load API key from localStorage on mount
    const savedKey = localStorage.getItem('deepl_api_key');
    if (savedKey) {
      setApiKey(savedKey);
      onApiKeyChange(savedKey);
    } else {
      // Show modal if no key saved
      setShowModal(true);
    }
  }, [onApiKeyChange]);

  const handleSaveKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem('deepl_api_key', apiKey.trim());
      onApiKeyChange(apiKey.trim());
      setShowModal(false);
      setInputType('password');
    }
  };

  const handleClearKey = () => {
    localStorage.removeItem('deepl_api_key');
    setApiKey('');
    onApiKeyChange('');
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

  if (!showModal && apiKey) {
    return (
      <button
        onClick={handleOpenModal}
        className="text-sm text-gray-700 hover:text-[#0177A9] transition-colors"
      >
        Change API Key
      </button>
    );
  }

  return (
    <>
      {/* Modal Backdrop */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={handleCloseModal}
        >
          {/* Modal Content */}
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3 mb-4">
              <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Enter Your DeepL API Key</h3>
                <p className="text-sm text-gray-700 mb-4">
                  Get a free API key at{' '}
                  <a
                    href="https://www.deepl.com/pro-api"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline font-medium"
                  >
                    deepl.com/pro-api
                  </a>
                  {' '}(500k characters/month free). Your key is stored locally in your browser only.
                </p>
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
                    Save
                  </button>
                </div>
                {apiKey && (
                  <button
                    onClick={handleClearKey}
                    className="text-sm text-gray-600 hover:text-gray-800 underline"
                  >
                    Clear saved key
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
