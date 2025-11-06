'use client';

import { useState, useEffect } from 'react';
import { UI_STRINGS, UI_STRINGS_VERSION, type UIStringKey } from './ui-strings';
import type { UILanguageCode } from './types';

// Import prebuilt translations
let prebuiltTranslations: Record<string, any> = {};
try {
  prebuiltTranslations = require('./prebuilt-translations.json');
} catch {
  // Prebuilt translations not available yet
  prebuiltTranslations = { version: UI_STRINGS_VERSION, en: UI_STRINGS };
}

const CACHE_KEY_PREFIX = 'translation_cache_';
const CACHE_VERSION_KEY = 'translation_cache_version';

interface TranslationCache {
  [key: string]: string;
}

interface TranslationState {
  translations: Record<UIStringKey, string>;
  isLoading: boolean;
  error: string | null;
}

/**
 * Get cached translations for a language
 */
function getCachedTranslations(langCode: string): TranslationCache | null {
  try {
    const cachedVersion = localStorage.getItem(CACHE_VERSION_KEY);
    if (cachedVersion !== UI_STRINGS_VERSION) {
      // Version mismatch, clear all caches
      clearAllCaches();
      return null;
    }

    const cached = localStorage.getItem(`${CACHE_KEY_PREFIX}${langCode}`);
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
}

/**
 * Save translations to cache
 */
function saveToCache(langCode: string, translations: TranslationCache) {
  try {
    localStorage.setItem(CACHE_VERSION_KEY, UI_STRINGS_VERSION);
    localStorage.setItem(`${CACHE_KEY_PREFIX}${langCode}`, JSON.stringify(translations));
  } catch (error) {
    console.warn('Failed to cache translations:', error);
  }
}

/**
 * Clear all translation caches
 */
function clearAllCaches() {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(CACHE_KEY_PREFIX) || key === CACHE_VERSION_KEY) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.warn('Failed to clear caches:', error);
  }
}

/**
 * Translate all UI strings using DeepL API (batched into one request)
 */
async function translateStrings(
  langCode: string,
  apiKey: string,
  deeplCode?: string,
  onProgress?: (current: number, total: number) => void
): Promise<TranslationCache> {
  const translations: TranslationCache = {};
  const keys = Object.keys(UI_STRINGS) as UIStringKey[];
  const texts = keys.map(key => UI_STRINGS[key]);

  if (onProgress) {
    onProgress(1, 1); // Show progress during the single batch request
  }

  try {
    // Batch translate all strings in a single API call
    const response = await fetch('/api/translate-strings-batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        texts,
        targetLang: langCode,
        deeplCode,
        apiKey,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      // Map translated texts back to keys
      keys.forEach((key, index) => {
        translations[key] = data.translations[index] || UI_STRINGS[key];
      });
    } else {
      // Get error details
      const errorText = await response.text();
      console.error('Translation API error:', response.status, errorText);
      throw new Error(`Translation failed: ${response.status} ${errorText}`);
    }
  } catch (error) {
    console.error('Failed to translate UI strings:', error);
    throw error; // Re-throw so caller knows translation failed
  }

  return translations;
}

/**
 * Hook to get translations for the current UI language
 */
export function useTranslation(
  langCode: UILanguageCode,
  apiKey?: string,
  deeplCode?: string
): TranslationState {
  const [state, setState] = useState<TranslationState>({
    translations: UI_STRINGS,
    isLoading: false,
    error: null,
  });

  useEffect(() => {
    async function loadTranslations() {
      // English is always available
      if (langCode === 'en') {
        setState({
          translations: UI_STRINGS,
          isLoading: false,
          error: null,
        });
        return;
      }

      // Check prebuilt translations first
      if (prebuiltTranslations[langCode]) {
        setState({
          translations: prebuiltTranslations[langCode],
          isLoading: false,
          error: null,
        });
        return;
      }

      // Check cache - but verify it's actually translated (not just English fallback)
      const cached = getCachedTranslations(langCode);
      if (cached && Object.keys(cached).length === Object.keys(UI_STRINGS).length) {
        // Verify cache contains actual translations by checking if at least one string differs from English
        const hasDifferentTranslations = Object.keys(cached).some(
          key => cached[key] !== UI_STRINGS[key as UIStringKey]
        );

        if (hasDifferentTranslations) {
          setState({
            translations: cached as Record<UIStringKey, string>,
            isLoading: false,
            error: null,
          });
          return;
        } else {
          // Cache contains English fallback, clear it and re-translate
          console.log('Cache contains English fallback, clearing and re-translating...');
          localStorage.removeItem(`${CACHE_KEY_PREFIX}${langCode}`);
        }
      }

      // Need to translate on-demand
      if (!apiKey) {
        // No API key, fallback to English
        setState({
          translations: UI_STRINGS,
          isLoading: false,
          error: 'No API key available for translation',
        });
        return;
      }

      // Translate
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const translations = await translateStrings(langCode, apiKey, deeplCode);

        // Only cache if we got actual translations (not English fallback)
        const hasTranslations = Object.keys(translations).some(
          key => translations[key] !== UI_STRINGS[key as UIStringKey]
        );

        if (hasTranslations) {
          saveToCache(langCode, translations);
          setState({
            translations: translations as Record<UIStringKey, string>,
            isLoading: false,
            error: null,
          });
        } else {
          // Got English fallback, don't cache it
          throw new Error('Translation returned English text - API may have failed');
        }
      } catch (error) {
        console.error('Translation failed:', error);
        setState({
          translations: UI_STRINGS,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Translation failed',
        });
      }
    }

    loadTranslations();
  }, [langCode, apiKey, deeplCode]);

  return state;
}
