import { NextRequest, NextResponse } from 'next/server';
import * as deepl from 'deepl-node';
import { type LanguageCode } from '@/lib/types';

export interface TranslateStringsBatchRequest {
  texts: string[];
  targetLang: string;
  deeplCode?: string; // Optional DeepL code for the language
  apiKey: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: TranslateStringsBatchRequest = await request.json();
    const { texts, targetLang, deeplCode, apiKey } = body;

    if (!texts || !Array.isArray(texts) || texts.length === 0 || !targetLang || !apiKey) {
      return NextResponse.json(
        { error: 'Missing required fields: texts (array), targetLang, apiKey' },
        { status: 400 }
      );
    }

    // Use provided deeplCode or uppercase the targetLang as fallback
    const deeplLang = deeplCode || targetLang.toUpperCase();

    // Create translator and batch translate all texts
    const translator = new deepl.Translator(apiKey);
    const results = await translator.translateText(
      texts,
      null,
      deeplLang as deepl.TargetLanguageCode
    );

    // Extract translated texts - results is always an array when input is an array
    const translations = (Array.isArray(results) ? results : [results]).map(r => r.text);

    return NextResponse.json({ translations });
  } catch (error) {
    console.error('Batch translation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Translation failed' },
      { status: 500 }
    );
  }
}
