# Localization Tests

This document describes the localization system tests and how to verify the system works correctly.

## Overview

The localization system has been refactored to:
1. Support all DeepL languages dynamically
2. Show language names in their native scripts (e.g., "עברית (Hebrew)")
3. Translate UI on-demand for languages without prebuilt translations
4. Cache translations in the browser with version-based invalidation

## Running Tests

### Automated Tests

Run the full test suite:

```bash
npm test
```

This runs tests for:
- UI strings structure and completeness
- Prebuilt translations consistency
- Translation cache management
- Language code mapping
- Native language name formatting

### Manual Translation Test

Test on-demand translation for any language:

```bash
# Test Hebrew
DEEPL_API_KEY=your_key npx tsx scripts/test-translation.ts he

# Test Danish
DEEPL_API_KEY=your_key npx tsx scripts/test-translation.ts da

# Test Thai
DEEPL_API_KEY=your_key npx tsx scripts/test-translation.ts th
```

### API Endpoint Tests

Test the supported languages endpoint:

```bash
curl http://localhost:3000/api/supported-languages | jq '.languages[] | select(.code=="he")'
```

Expected output for Hebrew:
```json
{
  "code": "he",
  "name": "עברית (Hebrew)",
  "deeplCode": "he"
}
```

Test batch translation endpoint:

```bash
curl -X POST http://localhost:3000/api/translate-strings-batch \
  -H "Content-Type: application/json" \
  -d '{
    "texts": ["Hello", "World"],
    "targetLang": "he",
    "deeplCode": "he",
    "apiKey": "your_key"
  }'
```

## What Was Fixed

### Issue 1: Language Selection Not Working

**Problem**: Selecting languages like Hebrew didn't translate the UI.

**Root Cause**: The `translate-strings-batch` endpoint had a hardcoded language map that was missing many languages (including Hebrew).

**Fix**:
- Modified the endpoint to accept an optional `deeplCode` parameter
- Updated `UILanguageProvider` to store and pass the DeepL language code
- Updated `useTranslation` hook to use the deeplCode when translating

**Files Changed**:
- `/app/api/translate-strings-batch/route.ts` - Accept deeplCode parameter
- `/components/UILanguageProvider.tsx` - Store and pass deeplCode
- `/lib/useTranslation.ts` - Use deeplCode in API calls
- `/components/UILanguageSelector.tsx` - Pass deeplCode on language change

### Issue 2: Missing Native Language Names

**Problem**: Languages were only shown in English (e.g., "Hebrew" instead of "עברית (Hebrew)").

**Root Cause**: The supported languages API only returned English names from DeepL.

**Fix**:
- Added a native names mapping in the `/api/supported-languages` endpoint
- Format display names as: `{nativeName} ({englishName})`

**Files Changed**:
- `/app/api/supported-languages/route.ts` - Add native names mapping

## Test Coverage

The test suite covers:

1. **UI Strings** (9 tests)
   - All required strings are defined
   - Version number exists and follows semver
   - No empty strings

2. **Prebuilt Translations** (4 tests)
   - English translations exist
   - Major languages (es, fr, de, it, pt, ja, zh, ko, ru, ar) are present
   - Version matches UI_STRINGS_VERSION
   - All keys present for each language

3. **Translation Cache** (2 tests)
   - Store and retrieve cached translations
   - Invalidate cache when version changes

4. **Language Code Mapping** (2 tests)
   - Native names exist for major languages
   - Display name formatting is correct

5. **Integration** (1 test)
   - Consistent string count across all languages

## Verification Checklist

To verify the localization system works:

- [ ] Run `npm test` - all tests pass
- [ ] Visit the app and select Hebrew - UI translates to Hebrew
- [ ] Select Danish - UI translates to Danish
- [ ] Select Thai - UI translates to Thai
- [ ] Language dropdown shows native names (עברית, Dansk, ไทย, etc.)
- [ ] Browser cache persists translations (no re-translation on refresh)
- [ ] Changing UI_STRINGS_VERSION clears cache and re-translates

## Architecture

```
User selects language
    ↓
UILanguageSelector
    ↓ (calls setLanguage with code + deeplCode)
UILanguageProvider
    ↓ (stores in state + localStorage)
useTranslation hook
    ↓
1. Check if English → return immediately
2. Check prebuilt translations → return if found
3. Check localStorage cache → return if valid
4. No API key? → return English
5. Call /api/translate-strings-batch with deeplCode
    ↓
6. Cache result in localStorage
7. Return translations
```

## Future Improvements

- [ ] Add e2e tests with Playwright to test actual UI translation
- [ ] Add performance tests for translation speed
- [ ] Add tests for RTL language layout (Hebrew, Arabic)
- [ ] Test translation error handling and retry logic
