'use client';

import { diffWords, Change } from 'diff';
import { TranslationChainResult } from '@/lib/types';
import { useUILanguage } from './UILanguageProvider';

interface ResultsDisplayProps {
  result: TranslationChainResult | null;
  onNewTranslation?: () => void;
}

export default function ResultsDisplay({ result, onNewTranslation }: ResultsDisplayProps) {
  const { t } = useUILanguage();

  if (!result) {
    return null;
  }

  const calculateSimilarity = (original: string, translated: string): number => {
    const diff = diffWords(original.toLowerCase(), translated.toLowerCase());
    let totalChars = 0;
    let unchangedChars = 0;

    diff.forEach((part) => {
      const length = part.value.length;
      totalChars += length;
      if (!part.added && !part.removed) {
        unchangedChars += length;
      }
    });

    return totalChars > 0 ? Math.round((unchangedChars / totalChars) * 100) : 0;
  };

  const renderDiff = (original: string, translated: string) => {
    const diff = diffWords(original, translated);

    return (
      <div className="flex flex-wrap gap-1 text-sm leading-relaxed">
        {diff.map((part: Change, index: number) => {
          let className = '';
          let title = '';

          if (part.added) {
            className = 'bg-blue-200 text-blue-900 px-1 rounded';
            title = 'Added';
          } else if (part.removed) {
            className = 'bg-red-200 text-red-900 px-1 rounded line-through';
            title = 'Removed';
          } else {
            className = 'bg-green-100 text-green-900 px-1 rounded';
            title = 'Preserved';
          }

          return (
            <span key={index} className={className} title={title}>
              {part.value}
            </span>
          );
        })}
      </div>
    );
  };

  const finalDivergence = result.steps[result.steps.length - 1]?.divergence || 0;

  return (
    <div className="space-y-6">
      {/* Original vs Final Comparison with Results Header */}
      <div className="bg-blue-50 border border-blue-200 p-6 rounded-2xl">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Results</h2>
          <p className="text-gray-700 text-sm">
            {t.detectedLanguage}: {result.originalLanguageName} • {result.totalSteps} translation{result.totalSteps !== 1 ? 's' : ''}, {t.measuredAtEachStep}
          </p>
        </div>

        <div className="flex items-center justify-between mb-4 pt-4 border-t border-blue-300">
          <h3 className="text-lg font-semibold text-gray-900">{t.finalResult}</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">{t.divergence}:</span>
            <span
              className={`px-3 py-1 rounded-full font-bold text-sm ${
                finalDivergence <= 20
                  ? 'bg-green-200 text-green-800'
                  : finalDivergence <= 50
                  ? 'bg-yellow-200 text-yellow-800'
                  : 'bg-red-200 text-red-800'
              }`}
            >
              {finalDivergence}%
            </span>
          </div>
        </div>

        {/* Side-by-side comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col">
            <p className="text-sm font-medium text-gray-600 mb-2">
              {t.originalText}:
            </p>
            <div className="text-lg text-gray-900 bg-white p-4 rounded-lg border border-blue-200 flex-1">
              {result.original}
            </div>
          </div>
          <div className="flex flex-col">
            <p className="text-sm font-medium text-gray-600 mb-2">
              {t.finalBackTranslation}:
            </p>
            <div className="text-lg text-gray-900 bg-white p-4 rounded-lg border border-blue-200 flex-1">
              {result.finalText}
            </div>
          </div>
        </div>

        {/* Visual Diff */}
        <div>
          <p className="text-sm font-medium text-gray-600 mb-2">
            {t.visualDiff}:
          </p>
          <div className="bg-white p-4 rounded-lg border border-blue-200">
            {renderDiff(result.original, result.finalText)}
          </div>
          <div className="flex gap-4 mt-2 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 bg-green-100 border border-green-300 rounded"></span>
              <span>{t.preserved}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 bg-red-200 border border-red-300 rounded"></span>
              <span>{t.removed}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 bg-blue-200 border border-blue-300 rounded"></span>
              <span>{t.added}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Translation Steps */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">{t.translationJourney}</h3>
        {result.steps.map((step) => {
          return (
            <div
              key={step.step}
              className="bg-white border border-gray-200 p-5 rounded-2xl hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 bg-[#0177A9] text-white font-bold rounded-full text-sm">
                    {step.step}
                  </span>
                  <span className="font-medium text-gray-900">{step.languageName}</span>
                  <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
                    {step.language}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">{t.divergence}:</span>
                  <span
                    className={`px-3 py-1 rounded-full font-bold text-xs ${
                      step.divergence <= 20
                        ? 'bg-green-200 text-green-800'
                        : step.divergence <= 50
                        ? 'bg-yellow-200 text-yellow-800'
                        : 'bg-red-200 text-red-800'
                    }`}
                  >
                    {step.divergence}%
                  </span>
                </div>
              </div>

              {/* Current translation */}
              <div className="mb-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  {t.in} {step.languageName}:
                </p>
                <p className="text-gray-700 leading-relaxed">{step.text}</p>
              </div>

              {/* Back-translation */}
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  {t.backTranslatedTo} {result.originalLanguageName}:
                </p>
                <p className="text-gray-600 leading-relaxed italic">{step.backTranslation}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Semantic Drift Analysis */}
      <div className="bg-white border border-gray-200 p-5 rounded-2xl">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">{t.semanticDriftAnalysis}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-[#0177A9]">{result.totalSteps}</p>
            <p className="text-xs text-gray-600">{t.translationHops}</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-[#1B1E25]">{finalDivergence}%</p>
            <p className="text-xs text-gray-600">{t.finalDivergence}</p>
          </div>
        </div>
      </div>

      {/* Divergence Graph - Moved to bottom */}
      <div className="bg-white border border-gray-200 p-6 rounded-2xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Semantic Drift Over Time</h3>
        <div className="relative" style={{ height: '280px' }}>
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 w-12 flex flex-col justify-between text-xs text-gray-500 text-right pr-2" style={{ height: '240px' }}>
            <span>100%</span>
            <span>75%</span>
            <span>50%</span>
            <span>25%</span>
            <span>0%</span>
          </div>

          {/* Graph area */}
          <div className="ml-12 border-l-2 border-b-2 border-gray-300 relative" style={{ height: '240px' }}>
            {/* Grid lines */}
            <div className="absolute inset-0 pointer-events-none">
              {[0, 25, 50, 75, 100].map((value) => (
                <div
                  key={value}
                  className="absolute w-full border-t border-gray-200"
                  style={{ bottom: `${value}%` }}
                ></div>
              ))}
            </div>

            {/* Data points and line - with padding */}
            <div className="absolute inset-0" style={{ padding: '8px' }}>
              <svg className="w-full h-full" style={{ overflow: 'visible' }}>
                {/* Line connecting points */}
                <polyline
                  points={result.steps
                    .map((step, index) => {
                      const x = result.steps.length === 1
                        ? 50
                        : (index / (result.steps.length - 1)) * 100;
                      const y = 100 - step.divergence;
                      return `${x}%,${y}%`;
                    })
                    .join(' ')}
                  fill="none"
                  stroke="#0177A9"
                  strokeWidth="3"
                  vectorEffect="non-scaling-stroke"
                />

                {/* Points */}
                {result.steps.map((step, index) => {
                  const x = result.steps.length === 1
                    ? 50
                    : (index / (result.steps.length - 1)) * 100;
                  const y = 100 - step.divergence;
                  return (
                    <circle
                      key={step.step}
                      cx={`${x}%`}
                      cy={`${y}%`}
                      r="5"
                      fill="#0177A9"
                      stroke="white"
                      strokeWidth="3"
                    />
                  );
                })}
              </svg>
            </div>

            {/* Hover tooltips */}
            <div className="absolute inset-0" style={{ padding: '8px' }}>
              {result.steps.map((step, index) => {
                const x = result.steps.length === 1
                  ? 50
                  : (index / (result.steps.length - 1)) * 100;
                const y = 100 - step.divergence;
                return (
                  <div
                    key={step.step}
                    className="absolute group"
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    <div className="w-8 h-8 cursor-pointer"></div>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 hidden group-hover:block z-10">
                      <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap shadow-lg">
                        <div className="font-semibold">{step.languageName}</div>
                        <div>Divergence: {step.divergence}%</div>
                        <div className="text-gray-300 mt-1 max-w-xs truncate">{step.text}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* X-axis labels */}
          <div className="ml-12 flex justify-between text-xs text-gray-500 mt-1">
            {result.steps.map((step) => (
              <span key={step.step} className="text-center" style={{ flex: 1 }}>
                {step.step}
              </span>
            ))}
          </div>

          {/* X-axis title */}
          <p className="text-center text-xs text-gray-500 mt-3">Translation Step</p>
        </div>
      </div>

      {/* Start Another Translation Button */}
      {onNewTranslation && (
        <div className="flex justify-start pt-4">
          <button
            onClick={onNewTranslation}
            className="px-6 py-3 bg-[#0177A9] text-white font-medium rounded-full hover:bg-[#015F8A] transition-all shadow-md hover:shadow-lg flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {t.startAnother}
          </button>
        </div>
      )}
    </div>
  );
}
