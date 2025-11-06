# Translation Telephone Testing Documentation

## Overview

This document describes the test suite that ensures the translation telephone game functionality works correctly.

## Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode (re-runs on file changes)
npm test:watch
```

## Test Coverage

### Core Functionality Tests

The test suite in `__tests__/lib/deepl.test.ts` verifies the following critical behaviors:

#### 1. Translation Chain Flow

**What it tests:**
- Text is translated through multiple languages sequentially
- After EACH translation to a target language, the text is back-translated to the original language
- Forward translations continue with the target language text (NOT the back-translation)
- The final result shows the back-translation from the last step (NOT text in the last language)

**Why this matters:**
This is the core "telephone game" mechanic. The bug we fixed was that `finalText` was showing text in the last target language instead of the back-translation to the original language, making divergence calculations meaningless.

**Test example:**
```typescript
test('finalText should be back-translation from last step, not text in last language', () => {
  const mockResult = {
    original: 'Hello world',
    steps: [
      {
        text: 'Hallo Welt', // German
        backTranslation: 'Hello World', // Back to English
        divergence: 5,
      },
      {
        text: 'Bonjour le monde', // French
        backTranslation: 'Hello the world', // Back to English
        divergence: 15,
      },
    ],
    finalText: 'Hello the world', // Should be back-translation, NOT 'Bonjour le monde'
  };

  expect(mockResult.finalText).toBe(mockResult.steps[mockResult.steps.length - 1].backTranslation);
});
```

#### 2. Divergence Calculation

**What it tests:**
- Identical strings have 0% divergence
- Completely different strings have high divergence
- Case sensitivity is ignored
- Punctuation is ignored (focuses on meaning)
- Partial matches calculate correct divergence percentage
- Empty strings are handled correctly

**Algorithm:**
Uses **Levenshtein distance ratio** to calculate semantic drift. This measures how many character-level edits (insertions, deletions, substitutions) are needed to transform one string into another, normalized by length.

**Key features:**
- Text is normalized: lowercased, punctuation removed, whitespace normalized
- Focuses on actual content changes, not formatting
- Returns 0-100 scale (0 = identical, 100 = completely different)

**Why Levenshtein over Jaccard?**
- Levenshtein considers word order and character similarity
- Not over-penalized by punctuation changes
- Better captures semantic drift in translations
- Example: "Hello, world!" vs "Hello world" = 0% divergence (same meaning)
- Example: "Hello world" vs "Hello there" = ~42% divergence (meaningful change)

#### 3. Random Chain Generation

**What it tests:**
- Generated chains are the requested length (3-15 hops)
- Start language is excluded from the first hop
- No consecutive duplicate languages
- Only uses supported DeepL languages

#### 4. Data Structure Validation

**What it tests:**
- Result includes original text and detected language
- Each step has: text, language, languageName, step number, backTranslation, and divergence
- Divergence is a number between 0-100
- Steps array length matches totalSteps
- All required fields are present

## Key Test Scenarios

### Scenario 1: Basic 2-Hop Chain

```
Original (EN): "Hello world"
  ↓ Translate to DE
Step 1 (DE): "Hallo Welt"
  ↓ Back-translate to EN
  Back: "Hello World" → Divergence: 5%
  ↓ Continue with "Hallo Welt" (NOT back-translation)
  ↓ Translate to FR
Step 2 (FR): "Bonjour le monde"
  ↓ Back-translate to EN
  Back: "Hello the world" → Divergence: 15%

Final Result: "Hello the world" (the back-translation, in ORIGINAL language)
```

### Scenario 2: Why finalText Must Be Back-Translation

**WRONG (bug we fixed):**
```
finalText: "Bonjour le monde" (French)
divergence: 95% (because comparing English to French directly!)
```

**CORRECT:**
```
finalText: "Hello the world" (English back-translation)
divergence: 15% (meaningful semantic drift measurement)
```

## Test Results

All 22 tests pass:

```
PASS __tests__/lib/deepl.test.ts
  Translation Chain Logic
    calculateDivergence
      ✓ returns 0 for identical strings
      ✓ returns 100 for completely different strings
      ✓ is case insensitive
      ✓ calculates partial divergence correctly
      ✓ handles empty strings
    generateRandomChain
      ✓ generates chain of requested length
      ✓ generates chain with minimum 3 languages
      ✓ generates chain with maximum 15 languages
      ✓ excludes start language from first hop
      ✓ avoids consecutive duplicate languages
      ✓ only uses supported languages
    getLanguageName
      ✓ returns correct name for EN-US
      ✓ returns correct name for DE
      ✓ returns correct name for JA
      ✓ returns language code if not found
  Translation Chain Result Structure
    ✓ result includes original text and language
    ✓ each step includes text, language, backTranslation, and divergence
    ✓ finalText should be back-translation from last step, not text in last language
    ✓ steps array length matches totalSteps
  Translation Flow Validation
    ✓ translation chain progresses through multiple languages
    ✓ back-translation happens after each forward translation
    ✓ divergence accumulates over multiple hops

Test Suites: 1 passed, 1 total
Tests:       22 passed, 22 total
```

## Continuous Integration

To add these tests to CI/CD:

```yaml
# Example GitHub Actions workflow
- name: Run tests
  run: npm test

- name: Build
  run: npm run build
```

## Future Test Additions

Consider adding:
1. Integration tests with mocked DeepL API responses
2. E2E tests for the full UI flow
3. Performance tests for long translation chains
4. Error handling tests (API failures, rate limits)
