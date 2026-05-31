Prompt
    https://claude.ai/chat/474783ea-dcf8-4fa9-83ac-09cad20050c6
--------------------------------------------------------------------------------

The translator module was optimized and improved by using the Lit JavaScript
library (comment: improve translator code using lit).

When the translation is canceled (buttonDisableTranslation), in the
<div id="dropdownJSON"> ... </div> the language remains at the last
translation language. When translation is canceled, the language should
be reset to (const) siteLanguage.

Create a fixed version and use the comment
"claude - improve translator code using lit #4" for all proposed fixes.


Claude
--------------------------------------------------------------------------------

Now let me look at the legacy translator.js to find the `siteLanguage` reference:Let me check the adapter's Translator instantiation:Now I have a complete understanding. The bug is:

1. User picks "Spanish" → clicks Translate → page reloads in Spanish.
2. User opens dialog → clicks "Don't translate" → page reloads, but `localStorage.translationLanguage` is still `'es'`.
3. User reopens dialog → dropdown still shows Spanish (should show the site's native language).

The fix needs to:
- Reset `translationLanguage` to `siteLanguage` in `localStorage` inside `_onDisableTranslation()`.
- Add a `siteLanguage` prop to the Lit component so the adapter can pass the page language.
- Wire it up in the adapter (`translator.js`).
- Also update the live msDropdown selection so the change is visible if reload is deferred.

Let me copy the files and apply the fixes:Now apply the fixes to `translator.mjs`. First, add the `siteLanguage` reactive property:Now add the `siteLanguage` initialisation in the constructor:Now the core fix — update `_onDisableTranslation()` to reset `translationLanguage` to `siteLanguage`:Now also update the `_initMsDropdown()` logic so that on the next modal open (after reload), the resolution path is robust. The `_resolveSelectedLanguage()` already reads from `_settings.translationLanguage` which we've now reset, so it should work — but let me verify by re-reading it:Good. Now apply the corresponding adapter-side fix in `translator.js` to pass `siteLanguage` to the component:Now let me verify the full set of changes by checking each edited section:Now let me run a syntax sanity check on the .mjs file using Node:Syntax check passes (`node --check` returned 0; the only error from the import test is the expected CDN-URL fetch failure, not a syntax issue). Let me also sanity-check `translator.js`:That error is from the file's Jekyll YAML front-matter at the very top (the `---` line), not from my edits — the original file has the same issue. Let me confirm:Confirmed — the file is a Jekyll/Liquid template processed at build time. Let me strip the Jekyll bits and verify the JS body itself is syntactically clean:Clean. Now let me also verify the comment tag was applied consistently and didn't accidentally break anything elsewhere:Six anchor points across the two files, all reflecting genuine changes. Let me do one final consistency check — confirming the diff against the originals to make sure no unintended changes slipped in:All changes are exactly what was intended — only additions, no accidental deletions. Let me copy the files to the outputs directory:## Summary of the fix

**Root cause.** `_onDisableTranslation()` wrote only `translationEnabled: false` to localStorage and left `translationLanguage` pointing at the user's last selection (e.g. `'es'`). After the forced page reload, re-opening the modal initialised the msDropdown from that stale value, so the dropdown still displayed Spanish even though translation had just been disabled.

**Changes — `translator.mjs`** (4 anchor points, all tagged `claude - improve translator code using lit #4`):

1. New reactive property `siteLanguage` declared in `static properties`, defaulting to `''` in the constructor. Mirrors the adapter's build-time `siteLanguage = '{{contentLanguage}}'` const.
2. `_onDisableTranslation()` now also writes `translationLanguage: resetLang` into both `_settings` and localStorage, where `resetLang` comes from the new `_resolveResetLanguage()` helper.
3. `_resolveResetLanguage()` — preference chain `siteLanguage → defaultLanguage → 'en'` so the field can never end up undefined.
4. `_syncMsDropdownSelection(value)` — imperatively updates the live msDropdown widget so the visual state matches the persisted state in the brief window before `window.location.reload()` fires (also makes the dropdown self-consistent if a future caller ever removes the reload).

**Change — `translator.js`** (1 anchor point): passes `siteLanguage: siteLanguage` to `new Translator({...})` so the component receives the page's source language from the adapter's existing const.

**Behaviour after the fix.** User picks Spanish → Translate → reload in Spanish; opens dialog → clicks "Don't translate" → localStorage now stores `translationLanguage: <siteLanguage>` → page reloads → reopening the dialog shows the dropdown selecting the page's native language as required.
