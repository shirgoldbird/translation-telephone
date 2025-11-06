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
  // Common stop words to ignore - these don't carry semantic meaning
  const stopWords = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
    'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
    'to', 'was', 'will', 'with', 'this', 'but', 'they', 'have', 'had',
    'what', 'when', 'where', 'who', 'which', 'why', 'how', 'or', 'can',
    'could', 'would', 'should', 'may', 'might', 'must', 'shall', 'i', 'you',
    'we', 'my', 'your', 'our', 'me', 'him', 'her', 'us', 'them'
  ]);

  // Aggressive normalization: remove ALL punctuation and special characters
  const normalize = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')  // Replace all punctuation with spaces
      .replace(/\s+/g, ' ')       // Normalize whitespace
      .trim();
  };

  // Extract meaningful words (content words > 2 chars, no stop words)
  const getMeaningfulWords = (text: string): Set<string> => {
    const words = normalize(text)
      .split(' ')
      .filter(w => w.length > 2 && !stopWords.has(w));
    return new Set(words);
  };

  const words1 = getMeaningfulWords(original);
  const words2 = getMeaningfulWords(backTranslated);

  // If no meaningful words in either, consider them identical
  if (words1.size === 0 && words2.size === 0) {
    return 0;
  }

  // If only one has meaningful words, 100% divergence
  if (words1.size === 0 || words2.size === 0) {
    return 100;
  }

  // Calculate Jaccard similarity on meaningful words
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);

  const similarity = intersection.size / union.size;
  const divergence = Math.round((1 - similarity) * 100);

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
