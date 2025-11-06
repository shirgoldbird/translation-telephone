'use client';

import { useState } from 'react';
import TranslationInput from '@/components/TranslationInput';
import ResultsDisplay from '@/components/ResultsDisplay';
import UILanguageSelector from '@/components/UILanguageSelector';
import ApiKeyInput from '@/components/ApiKeyInput';
import { UILanguageProvider, useUILanguage } from '@/components/UILanguageProvider';
import { TranslationChainResult, type LanguageCode } from '@/lib/types';

interface TranslationTelephoneAppInnerProps {
  apiKey: string;
  isFreeApi: boolean;
  setApiKey: (key: string) => void;
  setIsFreeApi: (isFree: boolean) => void;
}

function TranslationTelephoneAppInner({ apiKey, isFreeApi, setApiKey, setIsFreeApi }: TranslationTelephoneAppInnerProps) {
  const { t } = useUILanguage();
  const [result, setResult] = useState<TranslationChainResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [currentStep, setCurrentStep] = useState<TranslationChainResult['steps'][0] | null>(null);

  const handleTranslate = async (text: string, languageChain: LanguageCode[]) => {
    if (!apiKey) {
      setError('Please enter your DeepL API key first');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);
    setProgress(null);
    setCurrentStep(null);

    try {
      const response = await fetch('/api/translate-chain-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          languageChain,
          apiKey,
          isFree: isFreeApi,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Translation failed');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('Failed to read response');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));

            if (data.type === 'progress') {
              setProgress({ current: data.currentStep, total: data.totalSteps });
              if (data.step) {
                setCurrentStep(data.step);
              }
            } else if (data.type === 'complete') {
              setResult(data.result);
              setProgress(null);
              setCurrentStep(null);
            } else if (data.type === 'error') {
              throw new Error(data.error);
            }
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setProgress(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRandomTranslate = async (text: string, chainLength: number) => {
    if (!apiKey) {
      setError('Please enter your DeepL API key first');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);
    setProgress(null);
    setCurrentStep(null);

    try {
      const response = await fetch('/api/translate-chain-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          randomChainLength: chainLength,
          apiKey,
          isFree: isFreeApi,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Translation failed');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('Failed to read response');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));

            if (data.type === 'progress') {
              setProgress({ current: data.currentStep, total: data.totalSteps });
              if (data.step) {
                setCurrentStep(data.step);
              }
            } else if (data.type === 'complete') {
              setResult(data.result);
              setProgress(null);
              setCurrentStep(null);
            } else if (data.type === 'error') {
              throw new Error(data.error);
            }
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setProgress(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setProgress(null);
    setCurrentStep(null);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header with Settings */}
        <div className="flex justify-end items-center gap-4 mb-6">
          <ApiKeyInput onApiKeyChange={(key, isFree) => {
            setApiKey(key);
            setIsFreeApi(isFree);
          }} />
          <UILanguageSelector apiKey={apiKey} isFreeApi={isFreeApi} />
        </div>

        {/* Title and Subtitle */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-4xl">☎️</span>
            <h1 className="text-4xl font-light text-[#1B1E25] tracking-tight">
              <button
                onClick={handleReset}
                className="hover:text-[#0177A9] transition-colors"
              >
                {t.title}
              </button>
            </h1>
          </div>
          <p className="text-gray-600 text-base">
            {t.subtitle}. {t.subtitleQuestion} 🤔
          </p>
        </div>

        {/* Input Section */}
        {!result && apiKey && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
            <TranslationInput
              onSubmit={handleTranslate}
              onRandomSubmit={handleRandomTranslate}
              isLoading={isLoading}
            />
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start gap-6">
              {/* Left: Spinner and Progress */}
              <div className="flex-shrink-0">
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-[#0177A9] border-t-transparent"></div>
              </div>

              {/* Right: Progress Info */}
              <div className="flex-1 min-w-0">
                <p className="text-gray-600 font-medium mb-1">
                  {t.translating}
                </p>
                {progress && (
                  <p className="text-gray-500 text-sm mb-3">
                    Step {progress.current} of {progress.total}
                  </p>
                )}
                {!progress && (
                  <p className="text-gray-400 text-sm mb-3">Preparing...</p>
                )}

                {/* Progress Bar */}
                {progress && (
                  <div className="mb-4">
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-[#0177A9] h-2 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${(progress.current / progress.total) * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-gray-500">
                      <span>0%</span>
                      <span>{Math.round((progress.current / progress.total) * 100)}%</span>
                      <span>100%</span>
                    </div>
                  </div>
                )}

                {/* Current Translation */}
                {currentStep && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm animate-fade-in">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="flex items-center justify-center w-6 h-6 bg-[#0177A9] text-white font-bold rounded-full text-xs">
                        {currentStep.step}
                      </span>
                      <span className="font-medium text-gray-700">{currentStep.languageName}</span>
                      <span className="text-xs text-gray-500">({currentStep.language})</span>
                    </div>
                    <p className="text-gray-800 leading-relaxed">{currentStep.text}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border-0 rounded-xl p-8 mb-8 shadow-md">
            <div className="flex items-start gap-3">
              <svg
                className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="flex-1">
                <h3 className="font-semibold text-red-900 mb-1">{t.translationError}</h3>
                <p className="text-red-700">{error}</p>
                {error.includes('DEEPL_API_KEY') && (
                  <p className="text-red-600 text-sm mt-2">
                    Make sure to set your DeepL API key in the .env.local file
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={handleReset}
              className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-medium transition-colors"
            >
              {t.tryAgain}
            </button>
          </div>
        )}

        {/* Results Section */}
        {result && (
          <div>
            {/* New Translation Button at Top */}
            <div className="mb-6 flex justify-start">
              <button
                onClick={handleReset}
                className="px-6 py-2 bg-[#0177A9] text-white font-medium rounded-full hover:bg-[#015F8A] transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {t.startAnother}
              </button>
            </div>

            <ResultsDisplay result={result} onNewTranslation={handleReset} />
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="text-center space-y-1.5">
            <p className="text-gray-600 text-base">
              ⚡ {t.poweredBy}{' '}
              <a
                href="https://www.deepl.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#0177A9] hover:text-[#015F8A] font-semibold transition-colors"
              >
                DeepL
              </a>
            </p>
            <p className="text-gray-500 text-sm">
              {t.getYourFreeAPIKey}{' '}
              <a
                href="https://www.deepl.com/pro-api"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#0177A9] hover:text-[#015F8A] underline transition-colors"
              >
                {t.getAPIKey}
              </a>
            </p>
            <p className="text-gray-500 text-sm flex items-center justify-center gap-1">
              {t.builtWith}{' '}
              <img
                src="/claude-logo.png"
                alt="Claude"
                className="w-4 h-4 inline-block"
              />
              {' '}{t.by}{' '}
              <a
                href="https://shirgoldberg.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#0177A9] hover:text-[#015F8A] font-medium transition-colors"
              >
                Shir
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TranslationTelephoneApp() {
  const [apiKey, setApiKey] = useState<string>('');
  const [isFreeApi, setIsFreeApi] = useState<boolean>(true);

  return (
    <UILanguageProvider apiKey={apiKey} isFreeApi={isFreeApi}>
      <TranslationTelephoneAppInner
        apiKey={apiKey}
        isFreeApi={isFreeApi}
        setApiKey={setApiKey}
        setIsFreeApi={setIsFreeApi}
      />
    </UILanguageProvider>
  );
}
