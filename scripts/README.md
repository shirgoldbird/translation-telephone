# Translation Scripts

## translate_i18n.py

Script to translate missing i18n keys using the DeepL API.

### Prerequisites

1. Install required Python package:
   ```bash
   pip install requests
   ```

2. Get a DeepL API key (free tier: 500k characters/month) from https://www.deepl.com/pro-api

3. Set the API key as an environment variable:
   ```bash
   export DEEPL_API_KEY='your-api-key-here'
   ```

### Usage

#### Translate a specific language

To translate missing keys for a specific language:

```bash
python scripts/translate_i18n.py es
```

This will output the TypeScript object that you can copy-paste into `/lib/i18n.ts`.

#### Translate all languages

To translate all missing translations at once:

```bash
python scripts/translate_i18n.py
```

This will:
1. Show an estimated number of API calls
2. Ask for confirmation
3. Generate translations for all languages that need them

### Languages Status

**Need partial translations (missing 9 new keys):**
- es (Spanish)
- fr (French)
- de (German)
- it (Italian)
- pt (Portuguese)
- ja (Japanese)
- zh (Chinese)
- ko (Korean)
- ru (Russian)
- ar (Arabic)

**Need complete translations (currently using English fallback):**
- bg (Bulgarian)
- cs (Czech)
- da (Danish)
- el (Greek)
- et (Estonian)
- fi (Finnish)
- hu (Hungarian)
- id (Indonesian)
- lt (Lithuanian)
- lv (Latvian)
- nb (Norwegian)
- nl (Dutch)
- pl (Polish)
- ro (Romanian)
- sk (Slovak)
- sl (Slovenian)
- sv (Swedish)
- tr (Turkish)
- uk (Ukrainian)

### Missing Keys

The following keys need to be translated:
- `subtitleQuestion`: "How similar will it be on the other side?"
- `getYourFreeAPIKey`: "Get your"
- `builtWith`: "Built with"
- `enterYourDeepLAPIKey`: "Enter Your DeepL API Key"
- `getFreeAPIKeyAt`: "Get a free API key at"
- `keyStoredLocally`: "(500k characters/month free). Your key is stored locally in your browser only."
- `save`: "Save"
- `clearSavedKey`: "Clear saved key"
- `changeAPIKey`: "Change API Key"
