/**
 * Manual test script to verify translation functionality
 * Usage: DEEPL_API_KEY=your_key npx tsx scripts/test-translation.ts [language-code]
 */

import * as deepl from 'deepl-node';
import { UI_STRINGS } from '../lib/ui-strings';

const apiKey = process.env.DEEPL_API_KEY;

if (!apiKey) {
  console.error('Error: DEEPL_API_KEY not found in .env.local');
  process.exit(1);
}

async function testTranslation(targetLang: string) {
  console.log(`\nTesting translation to ${targetLang}...\n`);

  const translator = new deepl.Translator(apiKey!);

  // Test a few sample strings
  const testStrings = {
    title: UI_STRINGS.title,
    subtitle: UI_STRINGS.subtitle,
    poweredBy: UI_STRINGS.poweredBy,
    by: UI_STRINGS.by,
  };

  console.log('Original strings:');
  Object.entries(testStrings).forEach(([key, value]) => {
    console.log(`  ${key}: "${value}"`);
  });

  console.log('\nTranslating...');

  try {
    const texts = Object.values(testStrings);
    const results = await translator.translateText(
      texts,
      null,
      targetLang.toUpperCase() as deepl.TargetLanguageCode
    );

    const translations = Array.isArray(results) ? results : [results];

    console.log('\nTranslated strings:');
    Object.keys(testStrings).forEach((key, index) => {
      console.log(`  ${key}: "${translations[index].text}"`);
    });

    console.log('\n✓ Translation successful!');
  } catch (error) {
    console.error('\n✗ Translation failed:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Get target language from command line or default to Hebrew
const targetLang = process.argv[2] || 'he';

testTranslation(targetLang);
