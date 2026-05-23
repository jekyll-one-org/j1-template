/*
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/modules/translator/js/translator.mjs
 # Provides JS Core for J1 Module BS Translator
 # Version 1.0.3
 #
 #  Product/Info:
 #  http://jekyll.one
 #
 #  Copyright (C) 2026 Juergen Adams
 #
 #  J1 Theme is licensed under MIT License.
 #  See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 # -----------------------------------------------------------------------------
 #
 # claude - improve translator code using lit #1
 # -----------------------------------------------------------------------------
 # Refactored to use Lit (https://lit.dev) for the translator modal UI.
 # The component <j1-translator> renders the modal declaratively from
 # reactive state; nothing in the template is touched by external code,
 # so the class of bugs the previous version had to defend against
 # (innerHTML injection overwriting the rendered dialog, jQuery/Bootstrap
 # Modal lifecycle ordering, msDropdown polling that may never converge,
 # etc.) cannot occur here.
 #
 # The refactor mirrors the approach used for cookieConsent.mjs:
 #
 #   - the Lit component is the single source of truth for the modal UI;
 #     all show/hide/toggle logic flows from reactive state through one
 #     render() pass;
 #   - all localized text (title, body text, privacy notice, button
 #     labels, section headings, per-category descriptions) is supplied
 #     to the component via the new `content` constructor property,
 #     which the adapter builds from the merged YAML config block
 #     (defaults <- site overrides). The legacy XHR-based content load
 #     from `contentURL + '/index.html'` is gone — the modal opens
 #     synchronously with no network round-trip;
 #   - HTML-bearing text fields (`bodyText`, `privacyNotice`) are
 #     rendered with the `unsafeHTML` directive so the YAML-sourced
 #     markup (<b>, <br>, <ul>, ...) formats correctly instead of being
 #     escaped to literal angle brackets. The content originates in
 #     the site's own _data files, not user input, so this is the
 #     correct escape hatch;
 #   - the privacy notice was previously a static block inside the
 #     loaded HTML; it is now a true toggle, opened/closed by a footer
 #     button whose label tracks the `_showPrivacy` reactive state
 #     ("Show Privacy Notice" / "Hide Privacy Notice");
 #   - the "My Settings" detailed view is also a true toggle, with a
 #     footer button whose label tracks the `_detailed` reactive state
 #     ("Show Settings" / "Hide Settings"). The two banks of footer
 #     buttons (default and detailed) are selected purely as a function
 #     of `_detailed`;
 #   - the body scroll-lock side effect (`stop-scrolling` class on
 #     <body>) is reactive too — it flips with `_open`, applied in
 #     `updated()` and stripped on `disconnectedCallback()` so an SPA
 #     host tearing down the page mid-modal cannot leave the body
 #     permanently locked.
 #
 # The language dropdown still loads its language list from the JSON
 # file referenced by `translatorLanguagesFile`. That file is *data*
 # (ISO-639 codes + flag SVGs + native-language names), not localized
 # UI text, so it is correctly handled as a separate asset and is NOT
 # subject to this refactor.
 #
 # claude - improve translator code using lit #2
 # -----------------------------------------------------------------------------
 # The native <select> introduced in #1 was a regression in the user
 # experience: it dropped the per-language flag icons that the legacy
 # msDropdown-based control rendered, and matched the page's plain
 # form-control styling instead of the distinctive dropdown the rest
 # of the J1 theme uses. The flag-bearing msDropdown widget is now
 # restored for the language selector only, while everything else in
 # the #1 refactor (Lit-rendered modal, reactive state, YAML-sourced
 # localized text, no jQuery for the modal lifecycle, no XHR fetch
 # for the modal content) is preserved unchanged.
 #
 # Integration approach: msDropdown is an imperative DOM widget that
 # mutates the element it is constructed on (it appends a wrapper
 # plus an inner <select>). To keep it from fighting Lit's reactive
 # render, the template emits a STATIC, empty container
 # (`<div id="dropdownJSON">`) with no dynamic children. Lit's
 # incremental update preserves the element's children across
 # re-renders of the surrounding modal, so the msDropdown DOM
 # persists for the lifetime of an open modal. When the modal closes
 # (render() returns `nothing`), Lit removes the container and the
 # MsDropdown instance is torn down with it; the next open builds a
 # fresh widget. See `_initMsDropdown()` and the `updated()` hook
 # below.
 #
 # What is preserved from #1 (unchanged in #2):
 #   - Lit `<j1-translator>` web component is the single source of
 #     truth for the modal UI; reactive `_open`, `_detailed`,
 #     `_showPrivacy`, `_settings`, `_languages` state.
 #   - YAML-sourced localized text via the `content` constructor
 #     property; no XHR fetch for modal content.
 #   - postSelectionCallback contract and localStorage shape.
 #
 # What changes in #2:
 #   - The native <select id="j1tr-language"> is replaced by an
 #     empty placeholder <div id="dropdownJSON" class="ms-dropdown
 #     notranslate">. msDropdown is initialized on it in `updated()`
 #     once `_open === true` and the language list has loaded.
 #   - jQuery is NOT pulled back in: msDropdown is a plain DOM
 #     widget (instantiated as `new MsDropdown(el, opts)` via the
 #     global `window.MsDropdown`). The host site is expected to
 #     have loaded msDropdown via a regular <script> tag before
 #     translator.mjs runs, identical to how the legacy code
 #     consumed it.
 #   - The `change` event from msDropdown writes back into the
 #     reactive `_settings.translationLanguage` field, mirroring
 #     the previous native-select `@change` binding so commit-on-
 #     Translate / Save semantics are unchanged.
 # -----------------------------------------------------------------------------
 #
 # claude - improve translator code using lit #5
 # -----------------------------------------------------------------------------
 # No-op guard on the Translate button: when the user clicks Translate
 # while the language they have selected in the dropdown already matches
 # the language the page is currently displayed in, the click is now a
 # no-op (modal closes with `exitOnly` semantics, no translation work).
 #
 # Why this matters: invoking the postSelectionCallback with 'process'
 # against the current target language is visually a no-op but still
 # triggers Google Translate's re-injection path (and, depending on the
 # adapter, a full page reload). Users who open the modal to change a
 # different setting — toggle Analysis/Personalization, read the Privacy
 # Notice — and then click Translate without touching the dropdown would
 # otherwise incur an unnecessary reload. The guard short-circuits
 # before any state mutation, so localStorage and the consent cookie are
 # left untouched on a no-op Translate.
 #
 # What "current language" means here:
 #   - if translation is currently active (the persisted localStorage
 #     state has `translationEnabled === true`), it is the last-
 #     committed `translationLanguage`;
 #   - if translation is not active, it is the page's source language
 #     (`siteLanguage`, falling back through `defaultLanguage` and 'en'
 #     in the same order as `_resolveResetLanguage()` in #4).
 #
 # The comparison is performed against the resolved value of the
 # dropdown selection (via `_resolveSelectedLanguage()`), so the 'auto'
 # sentinel is expanded to its actual navigator-derived primary subtag
 # before comparison and a user clicking Translate with 'auto' selected
 # while the page is already in that browser language is also a no-op.
 #
 # localStorage is the source of truth for "current language" rather
 # than the in-memory `_settings`, because `_settings` has already been
 # mutated by the modal session (`_onLanguageChangeMS` writes the new
 # selection into it immediately on dropdown change) while localStorage
 # is only written on commit (Translate / Save / Don't-translate). So
 # at the moment of the click, localStorage still reflects the page's
 # actual current state.
 # -----------------------------------------------------------------------------
 #
 # What this refactor removes:
 #   - jQuery / Bootstrap 5 Modal JS dependency for the modal UI
 #   - XHR-based load of /assets/data/translator/<lang>/index.html
 #   - The `_updateButtons()` / `_updateOptionsFromCookie()` imperative
 #     DOM-sync paths — replaced by Lit's reactive render
 #   - The setInterval msDropdown availability polling loop
 #     (replaced in #2 by a single bounded check in `_initMsDropdown`)
 #   - The defensive scaffolding around `.modal-dialog` injection
 #   - The `contentURL`, `xhrDataElement`, `dialogContainerID` props
 #
 # What is preserved (drop-in compatible):
 #   - Public API: `new Translator(props)`, `.showDialog()`,
 #     `.getSettings(optionName)`
 #   - LocalStorage semantics: same key, same JSON shape
 #     ({ translatorName, translationEnabled, translateAllPages,
 #       useLanguageFromBrowser, translationLanguage, analysis,
 #       personalization })
 #   - Consent cookie write-through on Translate/Save (analysis +
 #     personalization fields synced into the user_consent cookie)
 #   - The `postSelectionCallback` window-resolved callback contract,
 #     called after the modal closes with a string action arg matching
 #     the original cbAction values:
 #       'process'   — user committed (Translate or Save)
 #       'exitOnly'  — user dismissed without committing
 #   - The googtrans cookie expiry + page reload on "Don't Translate"
 # -----------------------------------------------------------------------------
*/

'use strict';

// Lit is imported from a CDN-served ESM bundle so this file works when
// loaded as `<script type="module" src=".../translator.mjs">`.
// Bundler-based builds can swap the URL for the bare specifier `lit`.
//
import {
  LitElement,
  html,
  nothing
} from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';

// Pulled in separately so the `bodyText` and `privacyNotice` fields,
// which legitimately contain HTML markup from the site's YAML config,
// render as formatted markup instead of escaped text. The directive
// lives in a sub-path of the lit package; jsdelivr's `+esm` suffix
// produces a browser-ready ESM bundle from it.
//
import {
  unsafeHTML
} from 'https://cdn.jsdelivr.net/npm/lit@3/directives/unsafe-html.js/+esm';

// -----------------------------------------------------------------------------
// Cookie utility — identical to the helper in cookieConsent.mjs so the
// two modules write the user_consent cookie in exactly the same wire
// format (base64-encoded JSON, same SameSite / Domain / Secure
// attributes). The translator module needs this only to keep the
// `analysis` and `personalization` keys of the consent cookie in sync
// when the user commits a Translate/Save action; reads happen via the
// `get()` helper.
// -----------------------------------------------------------------------------
const Cookie = {
  set(name, value, days, sameSite, domain, secure) {
    const value_encoded = window.btoa(value);
    let expires = '; expires=Thu, 01 Jan 1970 00:00:00 UTC';
    if (days > 0) {
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = '; expires=' + date.toUTCString();
    }
    const parts = [
      name + '=' + (value_encoded || ''),
      expires,
      'Path=/',
      'SameSite=' + sameSite
    ];
    if (domain) parts.push('Domain=' + domain);
    if (secure) parts.push('Secure=' + secure);
    document.cookie = parts.join('; ') + ';';
  },

  get(name) {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1);
      if (c.indexOf(nameEQ) === 0) {
        const value_encoded = c.substring(nameEQ.length);
        try {
          return window.atob(value_encoded);
        } catch (_) {
          return undefined;
        }
      }
    }
    return undefined;
  }
};

// -----------------------------------------------------------------------------
// executeFunctionByName() — preserved for the `postSelectionCallback`
// contract. Resolves a dotted path against a root object and invokes it.
// Identical to the helper in cookieConsent.mjs.
// -----------------------------------------------------------------------------
function executeFunctionByName(functionName, context, args) {
  if (!functionName) return undefined;
  const namespaces = functionName.split('.');
  const func = namespaces.pop();
  for (let i = 0; i < namespaces.length; i++) {
    context = context[namespaces[i]];
    if (!context) return undefined;
  }
  if (args !== undefined && !Array.isArray(args)) args = [args];
  return typeof context[func] === 'function'
    ? context[func].apply(context, args)
    : undefined;
}

// -----------------------------------------------------------------------------
// <j1-translator> — the Lit web component.
// -----------------------------------------------------------------------------
class J1Translator extends LitElement {

  // Render into light DOM so the page's Bootstrap CSS continues to
  // apply (`modal-dialog`, `btn`, `btn-success`, `collapse`, ...).
  // Shadow DOM would isolate those styles, which we do not want.
  //
  createRenderRoot() {
    return this;
  }

  static properties = {
    // `content` is the single source of truth for the modal's
    // localized text. The adapter builds it from
    // `translatorOptions.google.modal_settings` (defaults + site
    // overrides) and assigns it to this property. Shape:
    //
    //   {
    //     title:                 String,
    //     bodyText:              String  (may contain HTML markup),
    //     privacyNotice:         String  (may contain HTML markup),
    //     languageSelectorTitle: String,
    //     labels: {
    //       mySettings,
    //       privacyNotice,
    //       analysis,            analysisDesc:[],
    //       personalization,     personalizationDesc:[],
    //       buttonDisableTranslation, buttonTranslate,
    //       buttonSave,          buttonExit,
    //       buttonShowPrivacyNotice, buttonHidePrivacyNotice,
    //       buttonShowSettings,  buttonHideSettings,
    //       close
    //     }
    //   }
    //
    // The component falls back to a minimal English config (see
    // _fallbackConfig() below) only if `content` is missing entirely;
    // individual missing label keys fall back per-field at render
    // time. The legacy `contentURL` / `xhrDataElement` /
    // `dialogContainerID` props are gone — there is no XHR fetch
    // for the modal content any more.
    //
    content:                    { type: Object },

    // config (mirrors the original `props` object)
    translatorName:             { type: String },
    cookieConsentName:          { type: String },
    cookieStorageDays:          { type: Number },
    cookieSameSite:             { type: String },
    cookieDomain:               { type: String },
    cookieSecure:               { type: Boolean },

    translatorLocalStorageKey:  { type: String },
    translatorLanguagesFile:    { type: String },
    translatorLanguagesElement: { type: String },   // JSON element key (the `translatorLanguages` field in YAML)
    translationLanguages:       { type: Array },    // allowed languages (filter)
    defaultLanguage:            { type: String },
    // claude - improve translator code using lit #4
    // `siteLanguage` is the page's source language (the `pageLanguage`
    // value the Google Translate Element is initialised with, e.g. 'en'
    // for an English-source site). Supplied by the adapter from its
    // module-scope `siteLanguage = '{{contentLanguage}}'` const so the
    // component can reset `translationLanguage` back to the page's
    // native language whenever the user opts out of translation via
    // the "Don't translate" button. Defaults to '' so callers that do
    // not supply it fall back to `defaultLanguage` (see
    // `_resolveResetLanguage()` below).
    //
    siteLanguage:               { type: String },
    disableLanguageSelector:    { type: Boolean },

    whitelisted:                { type: Array },
    postSelectionCallback:      { type: String },

    // reactive internal state. Lit re-renders automatically when any
    // of these change (they are declared with `state: true` so they
    // do not become reflected attributes on the host element).
    //
    _open:           { state: true },
    _detailed:       { state: true },
    _showPrivacy:    { state: true },
    _settings:       { state: true },
    _languages:      { state: true }  // populated async from the languages JSON
  };

  constructor() {
    super();

    // `content` starts null. The adapter assigns it before the
    // element is attached to <body> (see the Translator factory
    // below), so by the time the first render runs it is populated.
    // If for some reason it is still null when render() is called,
    // `_fallbackConfig()` provides a safety net.
    //
    this.content                    = null;

    this.translatorName             = 'google';
    this.cookieConsentName          = 'j1.user.consent';
    this.cookieStorageDays          = 365;
    this.cookieSameSite             = 'Strict';
    this.cookieDomain               = '';
    this.cookieSecure               = window.location.protocol.includes('https');

    this.translatorLocalStorageKey  = 'user_translate';
    this.translatorLanguagesFile    = '/assets/data/iso-639-language-codes-flags.json';
    this.translatorLanguagesElement = 'translator-languages';
    this.translationLanguages       = ['en', 'de', 'es', 'fr', 'it'];
    this.defaultLanguage            = 'en';
    // claude - improve translator code using lit #4
    // Empty default. The adapter (translator.js) overrides this with
    // the build-time `siteLanguage` const before the element is
    // attached to <body>; if it does not, `_resolveResetLanguage()`
    // falls back to `defaultLanguage`.
    //
    this.siteLanguage               = '';
    this.disableLanguageSelector    = false;

    this.whitelisted                = [];
    this.postSelectionCallback      = '';

    this._open           = false;
    this._detailed       = false;
    this._showPrivacy    = false;
    this._settings       = J1Translator._defaultSettings();
    this._languages      = [];

    // Mirrors the original `cbAction` local variable: tracks the
    // pending callback action between a button click and the
    // `_close()` -> postSelectionCallback hop.
    //
    this._cbAction       = 'none';

    // claude - improve translator code using lit #2
    // Live reference to the MsDropdown widget that decorates the
    // language-selector placeholder. Set in `_initMsDropdown()`,
    // cleared in `_destroyMsDropdown()` and `disconnectedCallback()`.
    // It is intentionally a plain instance field (not a reactive
    // state slot) — the dropdown's existence is a side effect of
    // open/close, not a render input. Re-rendering on every change
    // would tear down and rebuild the widget on every keystroke.
    //
    this._msDropdown     = null;
  }

  // Static defaults for the localStorage payload. Matches the shape
  // the original module wrote on first run.
  //
  static _defaultSettings() {
    return {
      translatorName:         'google',
      translationEnabled:     false,
      translateAllPages:      true,
      useLanguageFromBrowser: true,
      translationLanguage:    'de',
      analysis:               true,
      personalization:        true
    };
  }

  connectedCallback() {
    super.connectedCallback();

    // Restore previous selections from localStorage. If absent,
    // seed the storage with the static defaults so the next read
    // (e.g. from the adapter's postSelectionCallback) sees a
    // well-formed object — matches the original constructor's
    // seed-on-first-run behavior.
    //
    const existing = this._readLocalStorage();
    if (existing && typeof existing === 'object') {
      this._settings = { ...this._settings, ...existing };
    } else {
      this._writeLocalStorage(this._settings);
    }

    // Pre-load the language list so the dropdown is populated by the
    // first time the user opens the modal. The fetch is fire-and-forget;
    // if it fails the dropdown gracefully degrades to a single option
    // for the default language. The previous version polled msDropdown
    // availability on a setInterval after the modal opened — the
    // unconditional pre-load here is both simpler and earlier.
    //
    this._loadLanguages();
  }

  // Reactive side effect: keep <body>'s `stop-scrolling` class in
  // lockstep with the `_open` flag. Same rationale as the cookieConsent
  // module: there is one source of truth for "is the modal showing"
  // (`_open`) and one place where the body class is synced from it.
  //
  // claude - improve translator code using lit #2
  // Also drives the msDropdown lifecycle: when the modal opens (and
  // the language list is loaded), instantiate the widget on the
  // placeholder; when it closes, drop the instance reference (the
  // DOM is removed by Lit's next render() returning `nothing`, so
  // there is no detach-the-element step to do here). Re-runs when
  // `_languages` arrives late, in case the modal opened before the
  // JSON fetch completed.
  //
  updated(changedProperties) {
    if (changedProperties.has('_open')) {
      this._syncBodyClasses(this._open);
      if (!this._open) {
        this._destroyMsDropdown();
      }
    }

    if (this._open && (changedProperties.has('_open') || changedProperties.has('_languages'))) {
      // Defer to a microtask so Lit has finished committing the
      // template (the placeholder <div> needs to be in the DOM
      // before MsDropdown can decorate it). `await this.updateComplete`
      // would also work, but a queueMicrotask is cheaper and just
      // as reliable for light-DOM render targets.
      //
      queueMicrotask(() => this._initMsDropdown());
    }
  }

  // Defensive cleanup. If the element is removed from the DOM while
  // the modal happens to be open (e.g. SPA navigation), strip the
  // body classes so the page is not left permanently scroll-locked.
  //
  // claude - improve translator code using lit #2
  // Also drop the msDropdown instance handle. Same rationale as in
  // `updated()`: the DOM goes away with the host element, so there
  // is no widget-side detach to do, but the field must be cleared
  // so a subsequent re-attach of the element re-initialises cleanly.
  //
  disconnectedCallback() {
    super.disconnectedCallback();
    this._syncBodyClasses(false);
    this._destroyMsDropdown();
  }

  _syncBodyClasses(open) {
    const body = document.body;
    if (!body) return;
    if (open) {
      body.classList.add('modal-open', 'stop-scrolling');
    } else {
      body.classList.remove('modal-open', 'stop-scrolling');
    }
  }

  // ---------------------------------------------------------------------------
  // Language list loader. Fetches the JSON file referenced by
  // `translatorLanguagesFile`, extracts the array under
  // `translatorLanguagesElement`, and filters it down to entries whose
  // `value` is included in `translationLanguages` (unless the array
  // contains the literal string 'all', in which case no filtering is
  // applied). Replaces the original `_createMsDropdownFromJSON()`
  // method.
  // ---------------------------------------------------------------------------
  async _loadLanguages() {
    try {
      const resp = await fetch(this.translatorLanguagesFile);
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      const data = await resp.json();
      const all = data[this.translatorLanguagesElement] || [];

      const allowed = this.translationLanguages || [];
      this._languages = allowed.includes('all')
        ? all
        : all.filter((l) => allowed.includes(l.value));
    } catch (e) {
      // Graceful degradation: a one-item dropdown is still a usable
      // form control. The original code would log and silently leave
      // the dropdown empty.
      //
      this._languages = [{ value: this.defaultLanguage, text: this.defaultLanguage }];
      // eslint-disable-next-line no-console
      console.warn('[j1-translator] failed to load language list:', e);
    }
  }

  // ---------------------------------------------------------------------------
  // localStorage helpers — same key, same JSON shape as the original.
  // ---------------------------------------------------------------------------
  _readLocalStorage() {
    try {
      const raw = localStorage.getItem(this.translatorLocalStorageKey);
      return raw ? JSON.parse(raw) : undefined;
    } catch (_) {
      return undefined;
    }
  }

  _writeLocalStorage(value) {
    try {
      localStorage.setItem(this.translatorLocalStorageKey, JSON.stringify(value));
    } catch (_) {
      /* localStorage may be unavailable in private-browsing modes */
    }
  }

  // ---------------------------------------------------------------------------
  // Static minimal English fallback. Used only when `content` is
  // completely absent (e.g. the component was instantiated directly
  // without going through the adapter). Individual missing fields
  // inside a partial `content` block are handled per-field at render
  // time via the `|| 'default'` patterns below.
  // ---------------------------------------------------------------------------
  static _fallbackConfig() {
    return {
      title:                          'Google Translator',
      bodyText:                       'This website uses Google Translate to translate its content.',
      privacyNotice:                  'No privacy notice available.',
      languageSelectorTitle:          'Current language',
      labels: {
        mySettings:                   'My Settings',
        privacyNotice:                'Privacy Notice',
        analysis:                     'Analysis',
        analysisDesc:                 ['Usage monitoring for this site'],
        personalization:              'Personalization',
        personalizationDesc:          ['Storage of personal preferences'],
        buttonDisableTranslation:     "Don't translate",
        buttonTranslate:              'Translate',
        buttonSave:                   'Save settings',
//      buttonExit:                   'Cancel',
        buttonShowPrivacyNotice:      'Show Privacy Notice',
        buttonHidePrivacyNotice:      'Hide Privacy Notice',
        buttonShowSettings:           'Show Settings',
        buttonHideSettings:           'Hide Settings',
        close:                        'Close'
      }
    };
  }

  // ---------------------------------------------------------------------------
  // Render — single source of truth for the modal UI. Replaces the
  // original Liquid-generated HTML + jQuery wiring.
  // ---------------------------------------------------------------------------
  render() {
    if (!this._open) return nothing;
    const t = this.content || J1Translator._fallbackConfig();
    const L = t.labels || {};

    // claude - improve translator code using lit #2
    // The currently-selected language used to be resolved inline
    // here and bound onto each <option ?selected=...> in the
    // template. The selector is now an msDropdown widget owned
    // imperatively in `_initMsDropdown()`, which reads the same
    // resolved value from `_resolveSelectedLanguage()`. This
    // render() pass no longer needs the value at all.
    //
    return html`
      <div class="modal-backdrop fade show"
           @click=${this._onBackdropClick}></div>

      <div class="modal fade show"
           style="display: block;"
           tabindex="-1"
           role="dialog"
           aria-modal="true"
           aria-labelledby="j1tr-title">
        <div class="modal-dialog modal-frame modal-top modal-notify modal-primary"
             role="document">
          <div class="modal-content">

            <div class="modal-header">
              <p id="j1tr-title" class="lead">${t.title}</p>
              <button type="button"
                      class="btn-close"
                      aria-label=${L.close || 'Close'}
                      @click=${this._onClose}></button>
            </div>

            <div class="modal-body mt-4">
              <!--
                claude - improve translator code using lit #1
                <div> wrapper (not <p>) because bodyText may contain
                block-level HTML (<br>, <b>) and the privacy notice
                further down contains <ul>/<li>/<p>, which are illegal
                inside <p>. unsafeHTML renders the trusted YAML-sourced
                markup instead of escaping it.
              -->
              <div class="j1tr-body-text r-text-300">
                ${unsafeHTML(t.bodyText || '')}
              </div>

              <!-- language selector -->
              <p class="tagline mt-4 mb-1">
                <b>${t.languageSelectorTitle || 'Current language'}</b>
              </p>
              <div class="d-inline-block g-width-50 g-height-2 bg-primary mb-3"></div>
              <!--
                claude - improve translator code using lit #2
                Empty placeholder for the msDropdown widget. Intentionally
                rendered with NO child template nodes so Lit's incremental
                update treats it as a stable container and never disturbs
                the DOM that MsDropdown injects into it. The widget itself
                is instantiated in updated() once _open === true and
                _languages has loaded; see _initMsDropdown(). The
                'notranslate' class is preserved from the legacy markup so
                Google Translate does not rewrite the native-language
                option labels (which are already in their target language).
              -->
              <div class="j1tr-language-selector mb-3">
                <div id="dropdownJSON"
                     class="ms-dropdown notranslate"
                     style="width: 400px;"></div>
              </div>

              ${this._showPrivacy ? html`
                <div id="j1tr-privacy">
                  <p class="tagline mt-4 mb-1">
                    <b>${L.privacyNotice || 'Privacy Notice'}</b>
                  </p>
                  <div class="d-inline-block g-width-50 g-height-2 bg-primary mb-3"></div>
                  <div class="j1tr-body-text r-text-200">
                    ${unsafeHTML(t.privacyNotice || '')}
                  </div>
                </div>
              ` : nothing}

              ${this._detailed ? html`
                <div id="j1tr-options">
                  <p class="tagline mt-4 mb-1">
                    <b>${L.mySettings || 'My Settings'}</b>
                  </p>
                  <div class="d-inline-block g-width-50 g-height-2 bg-primary mb-3"></div>
                  ${this._renderOption('analysis',
                                       L.analysis || 'Analysis',
                                       L.analysisDesc,
                                       /*disabled=*/ false)}
                  ${this._renderOption('personalization',
                                       L.personalization || 'Personalization',
                                       L.personalizationDesc,
                                       false)}
                </div>
              ` : nothing}
            </div>

            <div class="modal-footer">
              ${this._detailed
                ? this._renderDetailedButtons(L)
                : this._renderDefaultButtons(L)}
            </div>

          </div>
        </div>
      </div>
    `;
  }

  // The two button banks replace the original `_updateButtons()` show/hide
  // dance. The displayed bank is purely a function of `_detailed`.
  //
  _renderDefaultButtons(L) {
    // Two true-toggle buttons (Privacy Notice, Settings) sit between
    // the destructive "Don't translate" action and the primary
    // "Translate" action. Their labels swap based on the
    // `_showPrivacy` / `_detailed` reactive flags — Lit re-renders
    // both the body and the footer in a single reactive pass when
    // either flag flips. The pattern mirrors the cookieConsent module
    // for consistency.
    //
    const privacyToggleLabel = this._showPrivacy
      ? (L.buttonHidePrivacyNotice || 'Hide Privacy Notice')
      : (L.buttonShowPrivacyNotice || 'Show Privacy Notice');

    const settingsToggleLabel = this._detailed
      ? (L.buttonHideSettings || 'Hide Settings')
      : (L.buttonShowSettings || 'Show Settings');

    return html`
      <button type="button"
              class="btn btn-danger mb-1 mr-2"
              style="min-width: 20rem"
              @click=${this._onDisableTranslation}>${L.buttonDisableTranslation || "Don't translate"}</button>
      <button type="button"
              class="btn btn-info mb-1 mr-2"
              style="min-width: 20rem"
              aria-expanded=${this._showPrivacy ? 'true' : 'false'}
              @click=${this._togglePrivacy}>${privacyToggleLabel}</button>
      <button type="button"
              class="btn btn-info mb-1 mr-2"
              style="min-width: 20rem"
              aria-expanded=${this._detailed ? 'true' : 'false'}
              @click=${this._toggleOptions}>${settingsToggleLabel}</button>
      <!-- button type="button"
              class="btn btn-secondary mb-1 mr-2"
              style="min-width: 20rem"
              @click=${this._onExit}>${L.buttonExit || 'Cancel'}</button -->
      <button type="button"
              class="btn btn-success mb-1 mr-2"
              style="min-width: 20rem"
              @click=${this._onTranslate}>${L.buttonTranslate || 'Translate'}</button>
    `;
  }

  _renderDetailedButtons(L) {
    // Mirrors the cookieConsent detailed bank: the Settings toggle is
    // also rendered here so the user can collapse the section without
    // committing via Save. Without this dual placement the toggle
    // would not be a true toggle.
    //
    const settingsToggleLabel = this._detailed
      ? (L.buttonHideSettings || 'Hide Settings')
      : (L.buttonShowSettings || 'Show Settings');

    return html`
      <button type="button"
              class="btn btn-info mb-1 mr-2"
              style="min-width: 20rem"
              aria-expanded=${this._detailed ? 'true' : 'false'}
              @click=${this._toggleOptions}>${settingsToggleLabel}</button>
      <!-- button type="button"
              class="btn btn-secondary mb-1 mr-2"
              style="min-width: 20rem"
              @click=${this._onExit}>${L.buttonExit || 'Cancel'}</button -->
      <button type="button"
              class="btn btn-warning mb-1 mr-2"
              style="min-width: 20rem"
              @click=${this._onSave}>${L.buttonSave || 'Save settings'}</button>
    `;
  }

  _renderOption(name, label, descriptions, disabled) {
    return html`
      <div class="translator-option" data-name=${name}>
        <div class="switch">
          <label>
            <input type="checkbox"
                   name="j1tr-checkbox-${name}"
                   ?checked=${this._settings[name]}
                   ?disabled=${disabled}
                   @change=${(e) => this._onOptionToggle(name, e.target.checked)}>
            ${label}
            <span class="bmd-switch-track"></span>
          </label>
          <ul>
            ${(descriptions || []).map((d, i) => html`
              <li class=${i === 0 ? 'mt-2' : nothing}
                  style="list-style-type: none;">${d}</li>
            `)}
          </ul>
        </div>
      </div>
    `;
  }

  // ---------------------------------------------------------------------------
  // Event handlers
  // ---------------------------------------------------------------------------
  _onOptionToggle(name, checked) {
    this._settings = { ...this._settings, [name]: checked };
  }

  _onLanguageChange(e) {
    // Persist the language choice into the reactive `_settings` object
    // immediately. The eventual write to localStorage happens when the
    // user commits via Translate or Save; until then the change is
    // local to the component (matches the original's
    // gather-on-commit semantics).
    //
    // claude - improve translator code using lit #2
    // Kept as a thin shim for callers that still expect the original
    // signature `(event) => ...`. The msDropdown integration calls
    // `_onLanguageChangeMS()` below with the widget's dataAndUI
    // payload directly, but a direct `change` listener on the inner
    // <select> would land here unchanged.
    //
    this._settings = { ...this._settings, translationLanguage: e.target.value };
  }

  // claude - improve translator code using lit #2
  // msDropdown's `on.change` callback receives a `{ data, ui, option,
  // index }` envelope (see msDropdown.js `_getDataAndUI`). The
  // option's value attribute is in `data.value`; fall back to
  // `option.value` or the widget's own `.value` getter if the
  // envelope shape ever drifts. Updating `_settings` here triggers
  // Lit's reactive re-render, but because the language-selector
  // template region is static (no dynamic children inside the
  // placeholder), the widget's DOM is undisturbed.
  //
  _onLanguageChangeMS(envelope) {
    const value =
      (envelope && envelope.data && envelope.data.value) ||
      (envelope && envelope.option && envelope.option.value) ||
      (this._msDropdown && this._msDropdown.value);
    if (value == null) return;
    this._settings = { ...this._settings, translationLanguage: value };
  }

  // claude - improve translator code using lit #2
  // Resolve which language should be pre-selected when the widget
  // opens. Matches the legacy logic that the #1 `render()` had
  // inlined: `_settings.translationLanguage` is canonical; the
  // sentinel value 'auto' means "follow the browser", clipped to
  // the primary subtag (`de-DE` -> `de`).
  //
  _resolveSelectedLanguage() {
    let lang = this._settings.translationLanguage;
    if (lang === 'auto') {
      const nav = navigator.language || navigator.userLanguage || this.defaultLanguage;
      lang = nav.split('-')[0];
    }
    return lang;
  }

  // claude - improve translator code using lit #2
  // Idempotent initialiser for the language-selector widget. Safe
  // to call multiple times: if an instance already exists it returns
  // immediately. Returns silently (with a console warning) if either
  // the placeholder element or the global `MsDropdown` constructor
  // is missing, so a partial page load can never crash the modal.
  //
  // The widget's `byJson` config takes the same `_languages` array
  // that the #1 render() used to map into <option> elements:
  // `[{ value, text, imageCss, ... }, ...]`. msDropdown reads `text`
  // and `value` for the option label and value, copies every other
  // key onto the resulting <option> as a `data-*` attribute (so
  // `imageCss` -> `data-image-css`, which the widget's renderer
  // then reads to attach a flag icon). Same shape the legacy
  // implementation consumed, by design — the JSON file at
  // `translatorLanguagesFile` was not changed in #1.
  //
  _initMsDropdown() {
    if (this._msDropdown) return;
    if (!this._open) return;
    if (!this._languages || !this._languages.length) return;

    const container = this.querySelector('#dropdownJSON');
    if (!container) return;

    if (typeof window === 'undefined' || typeof window.MsDropdown !== 'function') {
      // Graceful degradation: render a minimal native <select> so
      // the modal is still usable. Matches the spirit of the #1
      // load-failure fallback in `_loadLanguages()`. A console
      // warning makes the cause visible during development.
      //
      // eslint-disable-next-line no-console
      console.warn('[j1-translator] window.MsDropdown not available — '
        + 'language selector will fall back to a native <select>. '
        + 'Ensure msDropdown.js is loaded before translator.mjs.');
      this._renderFallbackSelect(container);
      return;
    }

    // If the container was previously decorated by another open/
    // close cycle and Lit somehow preserved leftover children, wipe
    // them first so MsDropdown gets a clean target. Belt-and-braces
    // — under normal Lit reactivity this branch is a no-op.
    //
    while (container.firstChild) container.removeChild(container.firstChild);

    const selectedLang = this._resolveSelectedLanguage();
    const data         = this._languages;
    let selectedIndex  = data.findIndex((l) => l.value === selectedLang);
    if (selectedIndex < 0) selectedIndex = 0;

    try {
      // The `on.change` handler is bound to `_onLanguageChangeMS`
      // via an arrow wrapper so msDropdown's internal `try/catch`
      // around the callback (see msDropdown.js `_fireLocalEventIfExist`)
      // does not swallow `this`. The same pattern is used by the
      // cookieConsent module's external-widget integration.
      //
      this._msDropdown = new window.MsDropdown(container, {
        byJson: {
          data:          data,
          selectedIndex: selectedIndex,
          width:         400
        },
        visibleRows: 8,
        on: {
          change: (envelope) => this._onLanguageChangeMS(envelope)
        }
      });

      // `disableLanguageSelector` is preserved from the legacy
      // option: it disables the dropdown entirely when the site
      // wants the user to be locked to a single language while
      // still showing the rest of the modal. MsDropdown exposes a
      // setter; if a future version renames it, the try/catch
      // keeps the modal from crashing.
      //
      if (this.disableLanguageSelector) {
        try {
          this._msDropdown.disabled = true;
        } catch (_) {
          container.classList.add('disabled');
        }
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('[j1-translator] failed to initialise MsDropdown:', e);
      this._msDropdown = null;
      this._renderFallbackSelect(container);
    }
  }

  // claude - improve translator code using lit #2
  // Symmetric teardown. We deliberately do NOT call into MsDropdown
  // to dispose anything — the upstream widget has no documented
  // destroy() method, and the DOM it owns is about to be removed
  // by Lit anyway (render() will return `nothing` when `_open`
  // flips to false). All we need to do is drop the reference so
  // the next `_initMsDropdown()` call rebuilds from scratch.
  //
  _destroyMsDropdown() {
    this._msDropdown = null;
  }

  // claude - improve translator code using lit #2
  // Last-ditch fallback used only when MsDropdown is unavailable or
  // throws during construction. Builds a plain native <select>
  // directly into the placeholder so the modal stays operable.
  // Bypasses Lit on purpose — this code runs *after* render() has
  // committed and is appending into the static container that Lit
  // does not re-touch, so an imperative insertion is safe.
  //
  _renderFallbackSelect(container) {
    while (container.firstChild) container.removeChild(container.firstChild);

    const select = document.createElement('select');
    select.id        = 'j1tr-language';
    select.className = 'form-control';
    select.disabled  = !!this.disableLanguageSelector;

    const selectedLang = this._resolveSelectedLanguage();
    for (const lang of (this._languages || [])) {
      const opt = document.createElement('option');
      opt.value       = lang.value;
      opt.textContent = lang.text || lang.value;
      if (lang.value === selectedLang) opt.selected = true;
      select.appendChild(opt);
    }

    select.addEventListener('change', (e) => this._onLanguageChange(e));
    container.appendChild(select);
  }

  _togglePrivacy(e) {
    e.preventDefault();
    this._showPrivacy = !this._showPrivacy;
  }

  _toggleOptions(e) {
    // Match the cookieConsent #5 behavior: opening the Settings
    // section also closes the Privacy Notice section. Without this,
    // both expandable sections could be open simultaneously and the
    // modal would grow unbounded in height.
    //
    e.preventDefault();
    this._showPrivacy = false;
    this._detailed = !this._detailed;
  }

  _onClose() {
    // The "X" close button preserves the original `cbAction='exitOnly'`
    // semantics: dismiss without committing any changes.
    //
    this._cbAction = 'exitOnly';
    this._close();
  }

  _onBackdropClick() {
    // Original used Bootstrap `backdrop: 'static'` — clicking the
    // backdrop does nothing. Preserved.
  }

  _onExit() {
    // Identical to clicking the "X". Preserved as a separate handler
    // for clarity; if a future iteration wants different semantics
    // (e.g. "exit but still fire the callback with the last selection")
    // this is the place to diverge.
    //
    this._cbAction = 'exitOnly';
    this._close();
  }

  _onTranslate() {
    // claude - improve translator code using lit #5
    // No-op guard: if the language the user has selected in the
    // dropdown already matches the language the page is currently
    // displayed in, clicking Translate is a no-op. We short-circuit
    // BEFORE any state mutation so localStorage, the consent cookie
    // and `_settings` are all left untouched, then close the modal
    // with `exitOnly` semantics so the postSelectionCallback receives
    // the same signal as a user-initiated cancel and the adapter
    // skips the translation injection / reload. See the #5 section
    // in the file header for the rationale and the definition of
    // "current language" used here.
    //
    const selectedLang = this._resolveSelectedLanguage();
    const currentLang  = this._resolveCurrentLanguage();
    if (selectedLang && selectedLang === currentLang) {
      this._cbAction = 'exitOnly';
      this._close();
      return;
    }

    // Equivalent of the original `_enableTranslation()`:
    //   - force analysis + personalization + translationEnabled on
    //     in the localStorage payload (Google Translate requires both
    //     consent flags);
    //   - mirror those two flags into the user_consent cookie so the
    //     CookieConsent module observes the user's implicit grant;
    //   - close; postSelectionCallback then drives the actual
    //     translation injection.
    //
    const next = {
      ...this._settings,
      analysis:           true,
      personalization:    true,
      translationEnabled: true
    };
    this._settings = next;
    this._writeLocalStorage(next);
    this._syncConsentCookie(next);
    this._cbAction = 'process';
    this._close();
  }

  _onDisableTranslation() {
    // Equivalent of the original `_disableTranslation()`. Two effects:
    //   1. expire the googtrans cookie on every plausible
    //      domain/path combination Google Translate may have used;
    //   2. force a full page reload, because once Google Translate
    //      has rewritten DOM text nodes in memory, cookie deletion
    //      alone does NOT reverse those changes — only a reload does.
    //
    // The reload itself unmounts the component, so the cbAction
    // callback path is intentionally NOT invoked here — the original
    // module had the same behavior (the modal hide handler never
    // fired before the reload tore the page down).
    //
    const url       = new URL(window.location.href);
    const hostname  = url.hostname;
    const domain    = hostname.substring(hostname.lastIndexOf('.', hostname.lastIndexOf('.') - 1) + 1);
    const subDomain = '.' + domain;

    const expiry = '=; expires=Thu, 01 Jan 1970 00:00:00 UTC';
    ['', hostname, subDomain].forEach((d) => {
      const base = 'googtrans' + expiry + '; Path=/';
      document.cookie = d ? (base + '; Domain=' + d) : base;
    });

    // claude - improve translator code using lit #4
    // BUG FIX: previously the localStorage payload was rewritten with
    // only `translationEnabled: false`, leaving `translationLanguage`
    // pointing at whatever the user last picked. After the reload,
    // re-opening the modal then showed the dropdown still selecting
    // that stale language even though translation had been disabled.
    //
    // The user's stated intent when clicking "Don't translate" is "go
    // back to the page as it natively reads", so the canonical reset
    // target is the page's source language (`siteLanguage`, supplied
    // by the adapter from its build-time `{{contentLanguage}}` const).
    // We fall back through `defaultLanguage` and finally a hard-coded
    // 'en' so the field can never end up undefined.
    //
    // We also update the live msDropdown widget's selected option so
    // the visual state matches the persisted state for the brief
    // moment between this write and `window.location.reload()` below.
    // If the reload were ever removed in the future, the in-modal
    // dropdown would still be consistent on its own.
    //
    const resetLang = this._resolveResetLanguage();

    const next = {
      ...this._settings,
      translationEnabled:  false,
      translationLanguage: resetLang
    };
    this._settings = next;
    this._writeLocalStorage(next);
    this._syncMsDropdownSelection(resetLang);

    window.location.reload();
  }

  // claude - improve translator code using lit #4
  // Resolve the language the dropdown should snap back to when the
  // user opts out of translation. Preference order:
  //   1. `siteLanguage` (the page's native language, supplied by the
  //      adapter) — this is what "Don't translate" semantically means;
  //   2. `defaultLanguage` (the configured fallback) — used when the
  //      adapter did not supply a siteLanguage, e.g. the component
  //      was instantiated directly without going through the adapter;
  //   3. 'en' — last-ditch hard-coded fallback to keep the field
  //      from ever ending up undefined in localStorage.
  //
  _resolveResetLanguage() {
    return this.siteLanguage || this.defaultLanguage || 'en';
  }

  // claude - improve translator code using lit #5
  // Resolve the language the page is CURRENTLY displayed in, i.e. the
  // "before" state at the moment the user clicks Translate. Used by
  // `_onTranslate()` to detect a no-op (selected language already
  // matches the page's current language) and short-circuit without
  // doing any translation work.
  //
  // Preference order:
  //   1. if translation is active per persisted localStorage
  //      (`translationEnabled === true`), the last-committed
  //      `translationLanguage` (with the 'auto' sentinel expanded to
  //      the navigator's primary subtag exactly as
  //      `_resolveSelectedLanguage()` does, so the comparison in
  //      `_onTranslate()` is apples-to-apples);
  //   2. otherwise the page's source language, via the same fallback
  //      chain `_resolveResetLanguage()` uses
  //      (`siteLanguage` -> `defaultLanguage` -> 'en').
  //
  // Why read from localStorage rather than `this._settings`: the
  // in-memory `_settings` has already been mutated by the modal
  // session (the dropdown's change handler writes the new selection
  // into it immediately), so it no longer reflects the page's actual
  // current state by the time the user clicks Translate. localStorage
  // is only written on commit, so it still holds the pre-modal state.
  //
  _resolveCurrentLanguage() {
    const persisted = this._readLocalStorage();
    if (persisted && persisted.translationEnabled && persisted.translationLanguage) {
      let lang = persisted.translationLanguage;
      if (lang === 'auto') {
        const nav = navigator.language || navigator.userLanguage || this.defaultLanguage;
        lang = (nav || '').split('-')[0];
      }
      return lang;
    }
    return this.siteLanguage || this.defaultLanguage || 'en';
  }

  // claude - improve translator code using lit #4
  // Imperatively update the msDropdown widget's currently-selected
  // option to match `value`. The widget exposes a `value` setter
  // (see msDropdown.js); if a future upstream version renames it the
  // try/catch keeps us from blowing up the surrounding flow. No-op
  // if the widget has not been initialised yet (modal never opened,
  // graceful-degradation fallback path active, ...).
  //
  _syncMsDropdownSelection(value) {
    if (!this._msDropdown || value == null) return;
    try {
      this._msDropdown.value = value;
    } catch (_) {
      // Fallback: poke the native <select> the widget wraps, if any.
      const select = this.querySelector('#dropdownJSON select');
      if (select) {
        select.value = value;
      }
    }
  }

  _onSave() {
    // Equivalent of the original `_saveSettings()`: persist the
    // current `_settings` (which already reflects every checkbox
    // toggle and dropdown change made in the modal), sync the
    // consent cookie, collapse the detailed section, and close.
    //
    this._writeLocalStorage(this._settings);
    this._syncConsentCookie(this._settings);
    this._cbAction = 'process';
    this._detailed = false;
    this._close();
  }

  // Centralizes the user_consent cookie write-through. Both Translate
  // and Save propagate the in-modal analysis/personalization toggles
  // into the consent cookie so the two modules stay in sync. The
  // original code did this inline in both _enableTranslation() and
  // _saveSettings(); centralising it removes a duplication and keeps
  // the two paths from drifting.
  //
  _syncConsentCookie(settings) {
    const raw = Cookie.get(this.cookieConsentName);
    if (!raw) return;
    let consent;
    try { consent = JSON.parse(raw); } catch (_) { return; }
    consent.analysis        = settings.analysis;
    consent.personalization = settings.personalization;
    Cookie.set(
      this.cookieConsentName,
      JSON.stringify(consent),
      this.cookieStorageDays,
      this.cookieSameSite,
      this.cookieDomain,
      this.cookieSecure
    );
  }

  _close() {
    this._open = false;
    // Invoke the configured postSelectionCallback with the pending
    // action string. Matches the original module's hidden.bs.modal
    // handler that called `_executeFunctionByName(..., cbAction)`.
    //
    executeFunctionByName(this.postSelectionCallback, window, this._cbAction);
    // Reset for the next open
    this._cbAction = 'none';
  }

  // ---------------------------------------------------------------------------
  // Public component methods (mirror the original API)
  // ---------------------------------------------------------------------------
  // Synchronous: no XHR fetch to await any more. Like cookieConsent,
  // the signature returns undefined; `await translator.showDialog()`
  // is harmless because `await undefined` is just `undefined`.
  //
  showDialog() {
    const whitelisted = (this.whitelisted || []).indexOf(window.location.pathname) > -1;
    if (whitelisted) return;
    this._open = true;
  }

  getSettings(optionName) {
    const settings = this._readLocalStorage();
    if (!settings) return undefined;
    if (optionName === undefined) return settings;
    return settings[optionName] !== undefined ? settings[optionName] : false;
  }
}

customElements.define('j1-translator', J1Translator);

// -----------------------------------------------------------------------------
// Drop-in factory.
//
// Existing call sites use `new Translator({...})` and then call
// `.showDialog()` / `.getSettings()`. This factory keeps that contract:
// it instantiates (or finds) a single <j1-translator> element, copies
// the caller's props onto it, attaches it to <body>, and returns a
// thin proxy exposing the same method names.
//
// One subtlety with the `content` property: it must be assigned BEFORE
// the element is appended to the DOM, so that connectedCallback() and
// the first render() see it. The loop below copies all props onto
// `el` and only then calls `appendChild`. Order is load-bearing; if
// you reorder these statements you will get a brief flash of the
// fallback English content.
// -----------------------------------------------------------------------------
export function Translator(props) {
  let el = document.querySelector('j1-translator');
  const isNew = !el;
  if (isNew) {
    el = document.createElement('j1-translator');
  }

  // copy known props onto the element so Lit's reactive system sees them
  for (const key in (props || {})) {
    if (Object.prototype.hasOwnProperty.call(props, key)) {
      el[key] = props[key];
    }
  }

  if (isNew) {
    document.body.appendChild(el);
  }

  this.showDialog  = () => el.showDialog();
  this.getSettings = (name) => el.getSettings(name);
}

// Expose globally so existing call sites can do `new Translator({...})`
// without an explicit import.
//
if (typeof window !== 'undefined') {
  window.Translator = Translator;
}
