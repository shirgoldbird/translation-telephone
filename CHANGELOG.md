# Changelog

## 2025-11-06 - Major Improvements

### Added Interactive Divergence Graph
**Feature**: Visual chart showing semantic drift progression across all translation steps.

**What it shows**:
- Line graph with divergence percentage (0-100%) on Y-axis
- Translation steps (1, 2, 3...) on X-axis
- DeepL blue line connecting data points
- Interactive hover tooltips showing:
  - Language name
  - Exact divergence percentage
  - Translated text preview

**Visual Design**:
- Clean grid lines at 25%, 50%, 75% marks
- Fixed height (280px total: 240px graph + 40px labels)
- White circles with blue fill for each data point
- 8px padding inside graph area prevents line cutoff
- X-axis labels positioned with proper spacing below graph
- Positioned at top of results for immediate visibility

**User Benefit**: Instantly see how meaning drifts over the translation chain - steep climbs show major semantic shifts, flat sections show stable translations.

---

### Added Keyboard Shortcut for Quick Submit
**Feature**: Press Cmd+Enter (Mac) or Ctrl+Enter (Windows/Linux) to submit translation instantly.

**Implementation**:
- Added `onKeyDown` handler to textarea in TranslationInput component
- Detects both `metaKey` (Mac) and `ctrlKey` (Windows/Linux)
- Prevents default textarea behavior and triggers form submission

**User Benefit**: Faster workflow - no need to click the submit button!

---

### Improved Results Page UX
**Feature**: "New Translation" button moved to top-right of results for easier access.

**Changes**:
- Button now appears at top of results page with + icon
- More compact design with right alignment
- Removed button from bottom of page (was too far to scroll)

---

### Added Real-Time Progress with Live Translation Display
**Feature**: Live progress updates showing translation completion as it happens, with completed translations visible immediately.

**Implementation**:
- Created streaming API endpoint (`/api/translate-chain-stream`) using Server-Sent Events (SSE)
- Progress updates sent after each translation step completes
- Real-time progress bar shows current step and percentage complete
- Completed translations appear below progress bar as they finish

**User Experience**:
```
🔄 Translating...
   Step 3 of 5

   [████████████░░░░░░] 60%
   0%           60%           100%

   ✓ 3  Spanish (ES)
        Hola el mundo
```

(Shows only the currently completed translation, not a scrolling stack)

**Technical Details**:
- Server streams progress updates using SSE
- Client uses ReadableStream to consume updates in real-time
- Completed steps stored in state and displayed with fade-in animation
- Compact horizontal layout with spinner on left, progress on right
- Max height with scroll to ensure it fits above the fold on MacBook Pro (13"/14")
- Smooth animations with CSS transitions
- No page refresh needed

---

### Fixed Critical Bug: Final Result Display
**Issue**: The "Final Result" was showing text in the last target language instead of the back-translation to the source language, making divergence calculations meaningless.

**Fix**: Modified `translateChain()` in `lib/deepl.ts` to store and return the final back-translation instead of the text in the last language.

```typescript
// Before (WRONG):
finalText: currentText // Text in last language (e.g., French)

// After (CORRECT):
finalText: finalBackTranslation // Back-translation to original language
```

**Impact**: Divergence percentages are now accurate and meaningful.

---

### Improved Divergence Calculation Algorithm
**Issue**: Previous Jaccard distance algorithm over-penalized punctuation changes and didn't capture semantic similarity well.

**Changes**:
1. **Text normalization**: Removes punctuation, normalizes whitespace, converts to lowercase
2. **Levenshtein distance ratio**: Measures character-level edit distance normalized by string length
3. **Focus on meaning**: Punctuation changes don't affect divergence score

**Examples**:
- `"Hello, world!"` vs `"Hello world"` → 0% divergence (same meaning)
- `"Hello world"` vs `"Hello there"` → ~42% divergence (meaningful change)
- `"The cat sat"` vs `"The dog sat"` → ~27% divergence (one word changed)

**Benefits**:
- More accurate semantic drift measurement
- Better user experience (not confused by high divergence from punctuation)
- Aligns with actual translation quality perception

---

### UI Improvement: Side-by-Side Comparison
**Change**: Moved original text to be displayed side-by-side with final result for easier comparison.

**Before**:
```
Final Result: [back-translation]
Visual Diff: [...]

Original Text: [original]
```

**After**:
```
Final Result
┌────────────────────┬────────────────────┐
│ Original Text      │ Final Translation  │
│ "Hello world"      │ "Hello the world"  │
└────────────────────┴────────────────────┘
Visual Diff: [...]
```

**Benefits**:
- Immediate visual comparison
- Easier to spot changes
- Responsive: stacks vertically on mobile

---

### Added Comprehensive Test Suite
Created 22 tests covering all critical functionality:

**Test Coverage**:
- ✅ Divergence calculation (5 tests)
- ✅ Random chain generation (6 tests)
- ✅ Language name lookup (4 tests)
- ✅ Translation result structure (4 tests)
- ✅ Translation flow validation (3 tests)

**Run tests**: `npm test`

**Documentation**: See `TESTING.md` for detailed test documentation.

---

### Brand Consistency: DeepL Official Assets
- ✅ Using DeepL's official favicon and logo
- ✅ Official brand colors: #0177A9 (Deep Cerulean), #1B1E25 (Shark)
- ✅ Clean, minimal design matching DeepL's aesthetic

---

## Technical Details

### Files Modified
- `lib/deepl.ts`: Fixed finalText bug, improved divergence calculation
- `components/ResultsDisplay.tsx`: Side-by-side layout
- `__tests__/lib/deepl.test.ts`: New test suite (22 tests)
- `TESTING.md`: Comprehensive test documentation
- Multiple UI files: DeepL branding updates

### Dependencies Added
- `jest`, `@testing-library/react`, `@testing-library/jest-dom`: Testing framework
- `ts-node`, `@types/jest`: TypeScript support for tests

### Build Status
✅ All tests passing (22/22)
✅ Build succeeds with no errors
✅ TypeScript compilation clean
