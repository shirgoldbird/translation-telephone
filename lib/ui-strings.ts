/**
 * Single source of truth for all UI strings in English.
 * DO NOT duplicate these strings elsewhere - always reference from here.
 *
 * Version is used to invalidate cached translations when strings change.
 */

export const UI_STRINGS_VERSION = '1.0.1';

export const UI_STRINGS = {
  // Header & Navigation
  title: 'Translation Telephone',
  subtitle: 'Watch your text transform as it journeys through multiple languages',
  subtitleQuestion: 'How similar will it be on the other side?',
  uiLanguage: 'UI Language',
  changeAPIKey: 'Change API Key',

  // Input Form
  enterText: 'Enter your text',
  placeholder: 'Type something to translate...',
  randomChain: 'Random Chain',
  customChain: 'Custom Chain',
  chainLength: 'Chain Length',
  hops: 'hops',
  buildLanguageChain: 'Build Language Chain',
  addLanguage: 'Add a language...',
  startTranslation: 'Start Translation Telephone',

  // Translation Progress
  translating: 'Translating through multiple languages...',

  // Results
  results: 'Translation Telephone Results',
  detectedLanguage: 'Detected language',
  measuredAtEachStep: 'with divergence measured at each step',
  finalResult: 'Final Result',
  divergence: 'Divergence',
  originalText: 'Original Text',
  finalBackTranslation: 'Final back-translation to',
  visualDiff: 'Visual Diff (comparing with original)',
  preserved: 'Preserved',
  removed: 'Removed',
  added: 'Added',
  translationJourney: 'Translation Journey with Divergence Tracking',
  backTranslatedTo: 'Back-translated to',
  in: 'In',
  semanticDriftAnalysis: 'Semantic Drift Analysis',
  translationHops: 'Translation Hops',
  finalDivergence: 'Final Divergence',
  startAnother: 'Start Another Translation',

  // Errors
  translationError: 'Translation Error',
  tryAgain: 'Try Again',

  // Footer
  poweredBy: 'Powered by',
  getAPIKey: 'free API key (500k characters/month)',
  getYourFreeAPIKey: 'Get your',
  builtWith: 'Built with',
  by: 'by',

  // API Key Modal
  enterYourDeepLAPIKey: 'Enter Your DeepL API Key',
  getFreeAPIKeyAt: 'Get a free API key at',
  keyStoredLocally: '(500k characters/month free). Your key is stored locally in your browser only.',
  save: 'Save',
  clearSavedKey: 'Clear saved key',
} as const;

export type UIStringKey = keyof typeof UI_STRINGS;
