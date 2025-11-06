import { NextRequest } from 'next/server';
import { generateRandomChain, detectLanguage, translateText, calculateDivergence, getLanguageName } from '@/lib/deepl';
import { type LanguageCode, type TranslationStep, type TranslationProgress } from '@/lib/types';

export interface TranslateChainRequest {
  text: string;
  languageChain?: LanguageCode[];
  randomChainLength?: number;
  startLanguage?: LanguageCode;
  apiKey?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: TranslateChainRequest = await request.json();
    const { text, languageChain, randomChainLength, startLanguage, apiKey } = body;

    // Require API key
    if (!apiKey || !apiKey.trim()) {
      return new Response(
        JSON.stringify({ error: 'API key is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validation
    if (!text || text.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Text is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Auto-detect language if not provided
    const detectedLanguage = startLanguage || await detectLanguage(text, apiKey);

    // Determine the language chain
    let chain: LanguageCode[];

    if (languageChain && languageChain.length > 0) {
      chain = languageChain;
    } else if (randomChainLength) {
      if (randomChainLength < 3 || randomChainLength > 15) {
        return new Response(
          JSON.stringify({ error: 'Random chain length must be between 3 and 15' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
      chain = generateRandomChain(randomChainLength, detectedLanguage);
    } else {
      return new Response(
        JSON.stringify({ error: 'Either languageChain or randomChainLength must be provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create a stream for Server-Sent Events
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const steps: TranslationStep[] = [];
        let currentText = text;
        let finalBackTranslation = text;

        try {
          for (let i = 0; i < chain.length; i++) {
            const targetLang = chain[i];

            // Translate to the target language
            currentText = await translateText(currentText, targetLang, apiKey);

            // Back-translate to original language to measure divergence
            const backTranslated = await translateText(currentText, detectedLanguage, apiKey);

            // Calculate divergence from original
            const divergence = calculateDivergence(text, backTranslated);

            const step: TranslationStep = {
              text: currentText,
              language: targetLang,
              languageName: getLanguageName(targetLang),
              step: i + 1,
              backTranslation: backTranslated,
              divergence,
            };

            steps.push(step);
            finalBackTranslation = backTranslated;

            // Send progress update
            const progressUpdate: TranslationProgress = {
              type: 'progress',
              currentStep: i + 1,
              totalSteps: chain.length,
              step,
            };

            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(progressUpdate)}\n\n`)
            );
          }

          // Send completion
          const completeUpdate: TranslationProgress = {
            type: 'complete',
            result: {
              original: text,
              originalLanguage: detectedLanguage,
              originalLanguageName: getLanguageName(detectedLanguage),
              steps,
              finalText: finalBackTranslation,
              totalSteps: chain.length,
            },
          };

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(completeUpdate)}\n\n`)
          );
          controller.close();
        } catch (error) {
          const errorUpdate: TranslationProgress = {
            type: 'error',
            error: error instanceof Error ? error.message : 'Unknown error occurred',
          };

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(errorUpdate)}\n\n`)
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Translation chain error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
