import { NextRequest, NextResponse } from 'next/server';
import * as deepl from 'deepl-node';

export async function GET(request: NextRequest) {
  try {
    // Get API key from query params (user's key) or env (fallback)
    const { searchParams } = new URL(request.url);
    const apiKey = searchParams.get('apiKey') || process.env.DEEPL_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key required' },
        { status: 400 }
      );
    }

    const translator = new deepl.Translator(apiKey);

    // Get target languages (what we can translate TO)
    const targetLanguages = await translator.getTargetLanguages();

    // Native language names mapping
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
      'lv': 'Latviešu',
      'lt': 'Lietuvių',
      'nb': 'Norsk',
      'pl': 'Polski',
      'pt': 'Português',
      'ro': 'Română',
      'ru': 'Русский',
      'sk': 'Slovenčina',
      'sl': 'Slovenščina',
      'es': 'Español',
      'sv': 'Svenska',
      'th': 'ไทย',
      'tr': 'Türkçe',
      'uk': 'Українська',
      'vi': 'Tiếng Việt',
    };

    // Map to our UI language format
    const uiLanguages = targetLanguages.map(lang => {
      // Convert DeepL codes to our simplified codes
      let code = lang.code.toLowerCase();

      // Simplify variant codes
      if (code.startsWith('en-')) code = 'en';
      if (code.startsWith('pt-')) code = 'pt';
      if (code.startsWith('zh-')) code = 'zh';

      const nativeName = nativeNames[code];
      const displayName = nativeName ? `${nativeName} (${lang.name})` : lang.name;

      return {
        code,
        name: displayName,
        deeplCode: lang.code, // Keep original for translation
      };
    });

    // Deduplicate by code (take first variant)
    const seen = new Set<string>();
    const uniqueLanguages = uiLanguages.filter(lang => {
      if (seen.has(lang.code)) return false;
      seen.add(lang.code);
      return true;
    });

    // Sort by name
    uniqueLanguages.sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({ languages: uniqueLanguages });
  } catch (error) {
    console.error('Error fetching supported languages:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch languages' },
      { status: 500 }
    );
  }
}
