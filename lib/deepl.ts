import 'server-only';
import * as deepl from 'deepl-node';
import {
  type LanguageCode,
  type TranslationStep,
  type TranslationChainResult,
  SUPPORTED_LANGUAGES,
} from './types';

// Create translator instance with provided API key
export function getTranslator(apiKey?: string): deepl.Translator {
  const key = apiKey || process.env.DEEPL_API_KEY;
  if (!key) {
    throw new Error('DeepL API key is required');
  }
  return new deepl.Translator(key);
}

export function getLanguageName(code: LanguageCode): string {
  const lang = SUPPORTED_LANGUAGES.find(l => l.code === code);
  return lang?.name || code;
}

export async function detectLanguage(text: string, apiKey?: string): Promise<LanguageCode> {
  const translator = getTranslator(apiKey);
  const result = await translator.translateText(text, null, 'EN-US' as deepl.TargetLanguageCode);

  // Get detected source language from the result
  const detectedLang = result.detectedSourceLang;

  // Map to our target language codes (convert source codes to target codes)
  // DeepL returns source codes like 'en', 'de', etc.
  // We need to map to target codes like 'EN-US', 'DE', etc.
  const langStr = String(detectedLang).toUpperCase();

  if (langStr === 'EN') {
    return 'EN-US';
  } else if (langStr === 'PT') {
    return 'PT-BR';
  } else if (langStr === 'ZH') {
    return 'ZH-HANS';
  }

  return langStr as LanguageCode;
}

export async function translateText(
  text: string,
  targetLang: LanguageCode,
  apiKey?: string
): Promise<string> {
  const translator = getTranslator(apiKey);
  const result = await translator.translateText(text, null, targetLang as deepl.TargetLanguageCode);
  return result.text;
}

export function calculateDivergence(original: string, backTranslated: string): number {
  // Very minimal stop words - only the most meaningless words (English)
  const englishStopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'of'
  ]);

  // Hebrew stop words
  const hebrewStopWords = new Set([
    'של', 'את', 'על', 'עם', 'אל', 'זה', 'זאת', 'כל', 'יש'
  ]);

  // Arabic stop words
  const arabicStopWords = new Set([
    'من', 'في', 'على', 'إلى', 'هذا', 'هذه', 'كل', 'مع'
  ]);

  const allStopWords = new Set([...englishStopWords, ...hebrewStopWords, ...arabicStopWords]);

  // Normalize text - handle Unicode properly
  const normalize = (text: string) => {
    return text
      .toLowerCase()
      // Normalize Unicode (handle different representations of same character)
      .normalize('NFKC')
      // Remove punctuation but preserve word characters from all scripts
      .replace(/[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,\-./:;<=>?@[\]^_`{|}~]/g, ' ')
      // Normalize whitespace
      .replace(/\s+/g, ' ')
      .trim();
  };

  // Extract all words, filtering stop words
  const getWords = (text: string): string[] => {
    const words = normalize(text)
      .split(' ')
      .filter(w => w.length > 0 && !allStopWords.has(w));
    return words;
  };

  const words1 = getWords(original);
  const words2 = getWords(backTranslated);

  // Debug logging for non-Latin scripts
  const hasNonLatin = /[^\u0000-\u007F]/.test(original);
  if (hasNonLatin) {
    console.log('Divergence calculation for non-Latin text:');
    console.log('  Original words:', words1.slice(0, 5), `(${words1.length} total)`);
    console.log('  Back-translated words:', words2.slice(0, 5), `(${words2.length} total)`);
  }

  // If no words in either, consider them identical
  if (words1.length === 0 && words2.length === 0) {
    return 0;
  }

  // If only one has words, 100% divergence
  if (words1.length === 0 || words2.length === 0) {
    return 100;
  }

  // Calculate Jaccard similarity
  const set1 = new Set(words1);
  const set2 = new Set(words2);
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);

  const similarity = intersection.size / union.size;
  const divergence = Math.round((1 - similarity) * 100);

  if (hasNonLatin) {
    console.log('  Intersection size:', intersection.size);
    console.log('  Union size:', union.size);
    console.log('  Similarity:', similarity);
    console.log('  Divergence:', divergence, '%');
  }

  return Math.max(0, Math.min(100, divergence));
}

// Generate a random language chain
export function generateRandomChain(
  length: number,
  startLanguage?: LanguageCode
): LanguageCode[] {
  const availableLanguages = SUPPORTED_LANGUAGES.map(l => l.code);
  const chain: LanguageCode[] = [];

  // Remove start language from options if provided
  let options = startLanguage
    ? availableLanguages.filter(l => l !== startLanguage)
    : availableLanguages;

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * options.length);
    const selectedLang = options[randomIndex];
    chain.push(selectedLang);

    // Remove the just-selected language to avoid consecutive duplicates
    options = availableLanguages.filter(l => l !== selectedLang);
  }

  return chain;
}
