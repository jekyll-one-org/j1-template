Prompt
  https://claude.ai/chat/03656db4-fde5-44db-9a01-53ec1605c191
--------------------------------------------------------------------------------

The cookieConsent module was optimized (comment: J1 CookieConsent optimizations #1)
and improved by using the Lit JavaScript library
(comment: improve cookieConsent code using lit #1).

All the HTML components were wrapped into the module code (cookieConsent.mjs),
but all configurable text is still configured with cookieconsent.html and 
loaded via XHR requests. All the configurable text should be moved to the
default YAML file cookieconsent.yml.

The YAML data for the module is processed by the adapter cookieConsent.js
and passed over by new CookieConsent({ .. }). All the J1 CookieConsent
related parameters should be taken from the JS var cookieConsentOptions in
the adapter.

Inside the JS module script cookieConsent.mjs, all configurable text for the
BS modal should no longer be loaded via an XHR request but instead taken
from the module config data passed by the adapter.

Optimize the module translator (translator.js) using the JavaScript library
Lit as it was done for the cookieConsent module.

Create fixed/modified versions and use the comment
"claude - improve translator code using lit #1" for all proposed fixes.


Claude
--------------------------------------------------------------------------------

Now I have everything I need. Let me look at the photoswipe.js briefly to confirm the J1 module convention used in this codebase:Now I have enough context to design the refactor. Let me think through the structure before writing.

**Plan:**

The cookieConsent module follows a clear three-layer pattern:
1. **`cookieConsent.mjs`** — the Lit-based component (declarative template, reactive state)
2. **`cookieConsent.js`** — Liquid template/adapter that builds options and instantiates `new CookieConsent({...})` with a `content` block
3. **`cookieconsent.yml`** — defaults file with all configurable text under `modal_settings.labels`

I'll mirror this exactly for translator:
1. **`translator.mjs`** — new Lit component replacing the uploaded module file
2. **Updated `translator.yml`** (defaults) — add `modal_settings.labels` block
3. **`translator.js`** adapter sketch — showing the `buildModalContent()` helper and the new constructor call

Let me start writing:Now let me create the updated YAML defaults file:Now let me create the adapter sketch (modeled on `cookieConsent.js`):Let me verify the YAML I produced is well-formed:Now let me do a syntax check on the .mjs file:All three files have the required tag comments. Let me copy them to the outputs directory and present them:Three files, mirroring the cookieConsent layout exactly.

**`translator.mjs`** — new Lit-based module replacing the uploaded `translator.js`. Renders into light DOM so the existing Bootstrap CSS still styles it; reads its localized text from the new `content` constructor property instead of fetching `contentURL + '/index.html'`. The msDropdown jQuery plugin is replaced by a native `<select>` populated by a fetch of the languages JSON (which stays — that file is language *data*, not UI text). Privacy Notice and Settings are real toggles in the footer, matching the cookieConsent #3/#4 pattern, and `_open` syncs `modal-open` / `stop-scrolling` on `<body>` via `updated()` + `disconnectedCallback()`. Public API is unchanged: `new Translator({...})`, `.showDialog()`, `.getSettings(name)`.

**`translator.yml`** — defaults file extended with `google.modal_settings.labels` carrying every previously-hardcoded string: section headings (`mySettings`, `privacyNotice`), per-category labels and description arrays (`analysis` / `analysisDesc`, `personalization` / `personalizationDesc`), the four primary buttons (`buttonDisableTranslation`, `buttonTranslate`, `buttonSave`, `buttonExit`), the toggle-button label pairs (`buttonShow*` / `buttonHide*` for Privacy and Settings), and the `close` aria-label. The legacy `contentURL` / `xhrDataElement` / `dialogContainerID` keys are removed since nothing reads them anymore.

**`translator.js`** — adapter Liquid template modeled on `cookieConsent.js`. The key addition is the `buildModalContent(options)` helper that flattens `translatorOptions[translatorName].modal_settings` into the `{title, bodyText, privacyNotice, languageSelectorTitle, labels}` shape the Lit component consumes, plus the updated `new Translator({...})` call that passes `content` and drops the three XHR-era properties. I didn't have the source of your existing adapter, so this is a scaffold against the cookieConsent adapter pattern — if your current `translator.js` has bespoke logic in `cbGoogle` (Google Translate widget injection, etc.) you'll want to paste that back into the marked spot in `cbGoogle`.

**Cleanup action for the site source tree** (parallel to the cookieConsent #2 cleanup): the Liquid template that emitted `/assets/data/translator/<lang>/index.html` is no longer referenced by anything and should be deleted, since `translator.mjs` no longer XHR-fetches it.
