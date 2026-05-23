Prompt
    https://claude.ai/chat/9f49241d-4bd3-4db4-8069-b357c7d2962c
--------------------------------------------------------------------------------

The translator module was optimized and improved by using the Lit JavaScript
library (comment: improve translator code using lit).

When the translation is started (buttonTranslate), the current language should
be checked and when the translation language matches the current language,
no action should be taken.

Create a fixed version and use the comment
"claude - improve translator code using lit #5" for all proposed fixes.


Claude
--------------------------------------------------------------------------------

Now I understand the structure. Let me analyze the request:

**Request**: In `_onTranslate()` (triggered by `buttonTranslate`), check the current language; if the selected translation language matches the current language, take no action.

**What "current language" means here**: the language the page is currently displayed in. This is:
- The last persisted `translationLanguage` if `translationEnabled === true` (page is currently translated)
- Otherwise `siteLanguage` (page is in its native form)

I'll read it from `localStorage` because `_settings` in memory has already been mutated by the modal session (dropdown change), while `localStorage` still holds the pre-commit state.

Let me copy the file to my working directory and apply the fix:Now I'll apply the three changes:

1. **Add a `#5` section in the header comment block** documenting the fix
2. **Add a `_resolveCurrentLanguage()` helper** (peer of `_resolveSelectedLanguage()` / `_resolveResetLanguage()`)
3. **Guard `_onTranslate()`** with the no-op check

### Change 1: Add the `#5` header comment block### Change 2: Add the `_resolveCurrentLanguage()` helper

I'll place it next to its peers `_resolveSelectedLanguage()` and `_resolveResetLanguage()` — right after `_resolveResetLanguage()`:### Change 3: Guard `_onTranslate()` with the no-op checkNow let me verify all three changes are in place and the file is still syntactically valid:Syntax checks out and all three `#5` markers are in place: the header section (line 115), the `_resolveCurrentLanguage()` helper (line 1163), and the guard inside `_onTranslate()` (line 1048).

Let me do a final spot-check on the three changed regions to make sure they read correctly:All three changes are in place and consistent. Let me copy the finished file to the outputs directory and present it:### Summary of changes — all marked `claude - improve translator code using lit #5`

**1. Header documentation block** — a new `#5` section between `#4` and "What this refactor removes", documenting why the guard exists, what "current language" means, and why `localStorage` (not in-memory `_settings`) is the right source of truth at click time.

**2. New helper `_resolveCurrentLanguage()`** — placed next to its peers `_resolveSelectedLanguage()` and `_resolveResetLanguage()`. Returns:
- The persisted `translationLanguage` when `translationEnabled === true` (the page is currently translated), with the `'auto'` sentinel expanded to its navigator-derived primary subtag — same expansion `_resolveSelectedLanguage()` uses, so comparisons are apples-to-apples.
- Otherwise `siteLanguage || defaultLanguage || 'en'` (the page is in its source language) — same chain as `_resolveResetLanguage()`.

**3. Guard inside `_onTranslate()`** — short-circuits *before* any state mutation when `selectedLang === currentLang`. The modal closes via `_close()` with `_cbAction = 'exitOnly'`, so `postSelectionCallback` receives the same envelope as a user-initiated cancel and the adapter skips the translation injection / reload. `localStorage`, the consent cookie, and `_settings` are left untouched on a no-op Translate.

The fix is symmetrical with the existing `#4` work (which already established the `_resolveResetLanguage()` pattern) and doesn't touch the public API, the msDropdown integration, or the localStorage shape.
