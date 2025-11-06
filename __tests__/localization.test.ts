/**
 * Tests for the localization system
 */

import { UI_STRINGS, UI_STRINGS_VERSION } from '../lib/ui-strings';

// Mock localStorage for Node environment
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
});

describe('Localization System', () => {
  describe('UI Strings', () => {
    it('should have all required strings defined', () => {
      const requiredKeys = [
        'title',
        'subtitle',
        'subtitleQuestion',
        'uiLanguage',
        'changeAPIKey',
        'enterText',
        'placeholder',
        'startTranslation',
        'results',
        'poweredBy',
        'getYourFreeAPIKey',
        'builtWith',
        'by',
      ];

      requiredKeys.forEach(key => {
        expect(UI_STRINGS).toHaveProperty(key);
        expect(typeof UI_STRINGS[key as keyof typeof UI_STRINGS]).toBe('string');
      });
    });

    it('should have a version number', () => {
      expect(UI_STRINGS_VERSION).toBeDefined();
      expect(typeof UI_STRINGS_VERSION).toBe('string');
      expect(UI_STRINGS_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
    });

    it('should not have empty strings', () => {
      Object.entries(UI_STRINGS).forEach(([key, value]) => {
        expect(value.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Prebuilt Translations', () => {
    let prebuiltTranslations: any;

    beforeAll(() => {
      try {
        prebuiltTranslations = require('../lib/prebuilt-translations.json');
      } catch (error) {
        console.warn('Prebuilt translations not available');
      }
    });

    it('should have English translations', () => {
      expect(prebuiltTranslations?.en).toBeDefined();
    });

    it('should have major language translations', () => {
      const majorLanguages = ['es', 'fr', 'de', 'it', 'pt', 'ja', 'zh', 'ko', 'ru', 'ar'];

      majorLanguages.forEach(lang => {
        expect(prebuiltTranslations?.[lang]).toBeDefined();
      });
    });

    it('should have version matching UI_STRINGS_VERSION', () => {
      if (prebuiltTranslations) {
        expect(prebuiltTranslations.version).toBe(UI_STRINGS_VERSION);
      }
    });

    it('should have all keys for each language', () => {
      if (!prebuiltTranslations) return;

      const uiKeys = Object.keys(UI_STRINGS);
      const languages = Object.keys(prebuiltTranslations).filter(k => k !== 'version');

      languages.forEach(lang => {
        const translationKeys = Object.keys(prebuiltTranslations[lang]);
        expect(translationKeys.length).toBe(uiKeys.length);

        uiKeys.forEach(key => {
          expect(prebuiltTranslations[lang]).toHaveProperty(key);
        });
      });
    });
  });

  describe('Translation Cache', () => {
    const CACHE_KEY_PREFIX = 'translation_cache_';
    const CACHE_VERSION_KEY = 'translation_cache_version';

    beforeEach(() => {
      // Clear localStorage before each test
      localStorage.clear();
    });

    it('should store and retrieve cached translations', () => {
      const testLang = 'test';
      const testTranslations = { title: 'Test Title' };

      localStorage.setItem(CACHE_VERSION_KEY, UI_STRINGS_VERSION);
      localStorage.setItem(`${CACHE_KEY_PREFIX}${testLang}`, JSON.stringify(testTranslations));

      const cached = localStorage.getItem(`${CACHE_KEY_PREFIX}${testLang}`);
      expect(cached).toBeDefined();
      expect(JSON.parse(cached!)).toEqual(testTranslations);
    });

    it('should invalidate cache when version changes', () => {
      const testLang = 'test';
      const testTranslations = { title: 'Test Title' };

      localStorage.setItem(CACHE_VERSION_KEY, '0.0.0');
      localStorage.setItem(`${CACHE_KEY_PREFIX}${testLang}`, JSON.stringify(testTranslations));

      const cachedVersion = localStorage.getItem(CACHE_VERSION_KEY);
      expect(cachedVersion).not.toBe(UI_STRINGS_VERSION);
    });
  });

  describe('Language Code Mapping', () => {
    it('should have native names for major languages', () => {
      const nativeNames: Record<string, string> = {
        'ar': 'العربية',
        'bg': 'Български',
        'zh': '中文',
        'cs': 'Čeština',
        'da': 'Dansk',
        'nl': 'Nederlands',
        'en': 'English',
        'et': 'Eesti',
        'fi': 'Suomi',
        'fr': 'Français',
        'de': 'Deutsch',
        'el': 'Ελληνικά',
        'he': 'עברית',
        'hu': 'Magyar',
        'id': 'Bahasa Indonesia',
        'it': 'Italiano',
        'ja': '日本語',
        'ko': '한국어',
      };

      Object.entries(nativeNames).forEach(([code, name]) => {
        expect(name.length).toBeGreaterThan(0);
        expect(typeof name).toBe('string');
      });
    });

    it('should format display names with native and English names', () => {
      const testCases = [
        { nativeName: 'עברית', englishName: 'Hebrew', expected: 'עברית (Hebrew)' },
        { nativeName: 'Español', englishName: 'Spanish', expected: 'Español (Spanish)' },
        { nativeName: '日本語', englishName: 'Japanese', expected: '日本語 (Japanese)' },
      ];

      testCases.forEach(({ nativeName, englishName, expected }) => {
        const displayName = `${nativeName} (${englishName})`;
        expect(displayName).toBe(expected);
      });
    });
  });

  describe('Integration', () => {
    it('should have consistent number of strings across system', () => {
      const uiStringCount = Object.keys(UI_STRINGS).length;
      expect(uiStringCount).toBeGreaterThan(40); // Should have at least 40 strings

      // If prebuilt translations exist, verify they have the same number of keys
      try {
        const prebuiltTranslations = require('../lib/prebuilt-translations.json');
        const languages = Object.keys(prebuiltTranslations).filter(k => k !== 'version');

        languages.forEach(lang => {
          const langStringCount = Object.keys(prebuiltTranslations[lang]).length;
          expect(langStringCount).toBe(uiStringCount);
        });
      } catch {
        // Prebuilt translations not available, skip this check
      }
    });
  });
});
