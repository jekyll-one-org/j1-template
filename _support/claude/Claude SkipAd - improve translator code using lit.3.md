Prompt
    https://claude.ai/chat/0ec99cd4-d224-4560-b739-49d17be56693
--------------------------------------------------------------------------------

The translator module was optimized and improved by using the Lit JavaScript
library (comment: improve translator code using lit).

The previous version of the translator adapter (translator.5.js) adds the
required Google Translate script (var gtTranslateScript) dynamically in the
head section. This is missing in the improved version of translator.js using
the Lit JavaScript library. Therefore, the translation never starts.

Create a fixed version and use the comment
"claude - improve translator code using lit #3" for all proposed fixes.


Claude
--------------------------------------------------------------------------------

Now I have everything I need. Let me look at the current translator.js once more to understand exactly what I'm patching:Now I have a complete understanding. Let me create the fixed version of `translator.js`. The fix needs to:

1. Re-introduce the `gt-callback` script (defines `googleTranslateElementInit`) and the `gt-translate` loader script (`translate.google.com/translate_a/element.js`) that the legacy adapter used to inject into `<head>`.
2. Re-introduce the `googtrans` cookie write when the user commits a language choice (the Lit module only writes localStorage; the Google Translate API only reads the cookie).
3. Inject the scripts on initial page load when a returning visitor already has `translationEnabled: true` in localStorage (so navigation between pages keeps translating).
4. Inject them on commit too, so the translation happens even when `reloadPageOnChange` is `false`.Let me do a quick sanity check on the file — verify it parses, the `#3` markers are placed correctly, and nothing from the original got accidentally dropped:JS parses cleanly. Let me also do a quick semantic smoke test — load the stripped module and verify the new helpers behave as expected:All six scenarios behave exactly as designed:

- **A** (new visitor): no scripts, no cookies — correct, nothing was committed yet.
- **B** (returning visitor with `translationEnabled: true`): both scripts injected at init time with the right `pageLanguage` ("en") and loader URL — this is the navigation-between-pages path the legacy adapter had.
- **C** (user commits `de` on `blog.example.com`): cookie `googtrans=/en/de` written scoped to `example.com` (parent domain because it's a subdomain), and scripts injected inline (since `reloadPageOnChange: false`).
- **D** (`exitOnly`): no-op — user dismissed the modal.
- **E** (committed but target = source language): cookie write skipped (defensive), as designed.
- **F** (`process` but `translationEnabled: false` — e.g. user unchecked it in detailed settings and clicked Save): no cookie, no scripts — correct, the disable path is handled by `translator.mjs` itself.

Let me move the file into the outputs directory:Here is the fixed `translator.js`. All changes are marked with `claude - improve translator code using lit #3`.

**Root cause.** The Lit refactor (#1) moved the modal UI into `translator.mjs` but only moved the *settings persistence* part — `_onTranslate()` writes `translationEnabled: true` to localStorage and closes the modal, and that's it. Two pieces that used to live in `translator.5.js` were dropped on the floor:

1. The `<script id="gt-callback">` (defining `googleTranslateElementInit`) and the `<script id="gt-translate">` loader (`//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit`) — without these, the Google Translate Element API never loads and translation cannot start.
2. The `googtrans=/srcLang/targetLang` cookie write — without this, the Translate Element loads but has nothing telling it which target language to use.

The `cbGoogle` body in the new file had a placeholder comment "`... existing Google Translate widget injection ...`" where this logic was supposed to be, but the actual code was never carried over.

**The fix** restores both, in the adapter layer (which is the correct place for them — they're Google-specific integration, not generic modal UI):

- `injectGoogleTranslateScripts(pageLanguage)` — idempotent helper that appends the callback definition and the loader script to `<head>`, in that order (the callback must exist before the loader fires it).
- `setGoogtransCookie(srcLang, targetLang, domain, isSubDomain)` — writes the cookie via `Cookies` (js-cookie), scoped to the parent domain on a subdomain so sibling subdomains share the choice, host-only otherwise. Same scoping rule the legacy adapter used.
- A new `contentLanguage` Liquid variable (= `site.language`, defaulting to `'en'`) feeds both the `pageLanguage` argument of `googleTranslateElementInit` and the source side of the cookie.

**Two call sites:**

- In `init()`, right after `j1.translator = new Translator({...})`: read `j1.translator.getSettings()` and, if the returning visitor already has `translationEnabled`, `analysis` and `personalization` all true, inject the scripts so the fresh page load gets translated. This is what makes translation persist across page navigation, matching the legacy behavior.
- In `cbGoogle('process')`: write the cookie (skipping the write when target equals source, defensively), then either `window.location.reload()` (if `reloadPageOnChange: true`, the legacy default — init then re-injects on the new page) or inject inline (if `reloadPageOnChange: false`).

`cbGoogle('exitOnly')` and the disable-translation flow (handled inside `translator.mjs._onDisableTranslation`) are left alone — they don't need changes.
