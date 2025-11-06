/**
 * Script to pre-generate translations for major languages using DeepL API
 * Run with: npx tsx scripts/generate-translations.ts
 */

import * as deepl from 'deepl-node';
import * as fs from 'fs';
import * as path from 'path';
import { UI_STRINGS, UI_STRINGS_VERSION } from '../lib/ui-strings';

// Read API key from .env.local manually
function loadEnvFile(): string | undefined {
  try {
    const envPath = path.join(__dirname, '../.env.local');
    const envFile = fs.readFileSync(envPath, 'utf-8');
    const match = envFile.match(/DEEPL_API_KEY=(.+)/);
    return match ? match[1].trim() : undefined;
  } catch {
    return undefined;
  }
}

const MAJOR_LANGUAGES = [
  { code: 'es', deeplCode: 'ES' as deepl.TargetLanguageCode },
  { code: 'fr', deeplCode: 'FR' as deepl.TargetLanguageCode },
  { code: 'de', deeplCode: 'DE' as deepl.TargetLanguageCode },
  { code: 'it', deeplCode: 'IT' as deepl.TargetLanguageCode },
  { code: 'pt', deeplCode: 'PT-BR' as deepl.TargetLanguageCode },
  { code: 'ja', deeplCode: 'JA' as deepl.TargetLanguageCode },
  { code: 'zh', deeplCode: 'ZH' as deepl.TargetLanguageCode },
  { code: 'ko', deeplCode: 'KO' as deepl.TargetLanguageCode },
  { code: 'ru', deeplCode: 'RU' as deepl.TargetLanguageCode },
  { code: 'ar', deeplCode: 'AR' as deepl.TargetLanguageCode },
];

async function translateLanguage(translator: deepl.Translator, langCode: string, deeplCode: deepl.TargetLanguageCode) {
  console.log(`\nTranslating to ${langCode}...`);

  const translations: Record<string, string> = {};
  const keys = Object.keys(UI_STRINGS) as Array<keyof typeof UI_STRINGS>;

  for (const key of keys) {
    const text = UI_STRINGS[key];
    process.stdout.write(`  ${key}: `);

    try {
      const result = await translator.translateText(text, null, deeplCode);
      translations[key] = result.text;
      console.log(`✓`);
    } catch (error) {
      console.log(`✗ (${error})`);
      translations[key] = text; // Fallback to English
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return translations;
}

async function main() {
  const apiKey = loadEnvFile() || process.env.DEEPL_API_KEY;

  if (!apiKey) {
    console.error('Error: DEEPL_API_KEY not found in .env.local or environment');
    process.exit(1);
  }

  const translator = new deepl.Translator(apiKey);

  console.log('Pre-generating translations for major languages...');
  console.log(`Source version: ${UI_STRINGS_VERSION}`);
  console.log(`Total strings: ${Object.keys(UI_STRINGS).length}`);

  const allTranslations: Record<string, any> = {
    version: UI_STRINGS_VERSION,
    en: UI_STRINGS,
  };

  for (const lang of MAJOR_LANGUAGES) {
    const translations = await translateLanguage(translator, lang.code, lang.deeplCode);
    allTranslations[lang.code] = translations;
  }

  // Write to file
  const outputPath = path.join(__dirname, '../lib/prebuilt-translations.json');
  fs.writeFileSync(outputPath, JSON.stringify(allTranslations, null, 2), 'utf-8');

  console.log(`\n✓ Translations saved to ${outputPath}`);
  console.log(`  Languages: ${Object.keys(allTranslations).filter(k => k !== 'version').join(', ')}`);
}

main().catch(console.error);
