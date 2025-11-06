export type LanguageCode = string;

// Re-export UILanguageCode from i18n for convenience
export type { UILanguageCode } from './i18n';

export interface TranslationStep {
  text: string;
  language: LanguageCode;
  languageName: string;
  step: number;
  backTranslation: string;
  divergence: number; // 0-100, percentage of how much it differs from original
}

export interface TranslationChainResult {
  original: string;
  originalLanguage: LanguageCode;
  originalLanguageName: string;
  steps: TranslationStep[];
  finalText: string;
  totalSteps: number;
}

export interface TranslationProgress {
  type: 'progress' | 'complete' | 'error';
  currentStep?: number;
  totalSteps?: number;
  step?: TranslationStep;
  result?: TranslationChainResult;
  error?: string;
}

export const SUPPORTED_LANGUAGES = [
  { code: 'EN-US', name: 'English (US)' },
  { code: 'EN-GB', name: 'English (UK)' },
  { code: 'DE', name: 'German' },
  { code: 'FR', name: 'French' },
  { code: 'ES', name: 'Spanish' },
  { code: 'IT', name: 'Italian' },
  { code: 'PT-PT', name: 'Portuguese (European)' },
  { code: 'PT-BR', name: 'Portuguese (Brazilian)' },
  { code: 'NL', name: 'Dutch' },
  { code: 'PL', name: 'Polish' },
  { code: 'RU', name: 'Russian' },
  { code: 'JA', name: 'Japanese' },
  { code: 'ZH-HANS', name: 'Chinese (Simplified)' },
  { code: 'KO', name: 'Korean' },
  { code: 'SV', name: 'Swedish' },
  { code: 'DA', name: 'Danish' },
  { code: 'FI', name: 'Finnish' },
  { code: 'NB', name: 'Norwegian (Bokmål)' },
  { code: 'CS', name: 'Czech' },
  { code: 'EL', name: 'Greek' },
  { code: 'HU', name: 'Hungarian' },
  { code: 'RO', name: 'Romanian' },
  { code: 'TR', name: 'Turkish' },
  { code: 'ID', name: 'Indonesian' },
  { code: 'BG', name: 'Bulgarian' },
  { code: 'SK', name: 'Slovak' },
  { code: 'LT', name: 'Lithuanian' },
  { code: 'LV', name: 'Latvian' },
  { code: 'ET', name: 'Estonian' },
  { code: 'SL', name: 'Slovenian' },
  { code: 'UK', name: 'Ukrainian' },
  { code: 'AR', name: 'Arabic' },
] as const;
