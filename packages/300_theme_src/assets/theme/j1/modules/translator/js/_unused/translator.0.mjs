/*
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/modules/translator/js/translator.mjs (0)
 # Provides JS Core for J1 Module BS Translator
 # Version 1.0.0
 #
 #  Product/Info:
 #  https://jekyll.one
 #
 #  Copyright (C) 2023-2026 Juergen Adams
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
 # subject to this refactor. The native <select> replaces the
 # jQuery-based msDropdown widget, eliminating one more jQuery
 # dependency in the modal.
 #
 # What this refactor removes:
 #   - jQuery / Bootstrap 5 Modal JS dependency for the modal UI
 #   - msDropdown jQuery plugin dependency
 #   - XHR-based load of /assets/data/translator/<lang>/index.html
 #   - The `_updateButtons()` / `_updateOptionsFromCookie()` imperative
 #     DOM-sync paths — replaced by Lit's reactive render
 #   - The setInterval msDropdown availability polling loop
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
  updated(changedProperties) {
    if (changedProperties.has('_open')) {
      this._syncBodyClasses(this._open);
    }
  }

  // Defensive cleanup. If the element is removed from the DOM while
  // the modal happens to be open (e.g. SPA navigation), strip the
  // body classes so the page is not left permanently scroll-locked.
  //
  disconnectedCallback() {
    super.disconnectedCallback();
    this._syncBodyClasses(false);
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

    // Resolve the currently-selected language. `'auto'` means
    // "follow the browser" — matches the original logic in
    // `_showDialog`'s `shown.bs.modal` handler.
    //
    let selectedLang = this._settings.translationLanguage;
    if (selectedLang === 'auto') {
      const nav = navigator.language || navigator.userLanguage || this.defaultLanguage;
      selectedLang = nav.split('-')[0];
    }

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
              <div class="j1tr-language-selector mb-3">
                <select id="j1tr-language"
                        class="form-control"
                        ?disabled=${this.disableLanguageSelector}
                        @change=${this._onLanguageChange}>
                  ${(this._languages || []).map((lang) => html`
                    <option value=${lang.value}
                            ?selected=${lang.value === selectedLang}>
                      ${lang.text || lang.value}
                    </option>
                  `)}
                </select>
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
    this._settings = { ...this._settings, translationLanguage: e.target.value };
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

    // Also update the localStorage payload so subsequent reads see
    // the user's choice. Mirrors the original `_disableTranslation`'s
    // intent even though it wrote the cookie path instead.
    //
    const next = {
      ...this._settings,
      translationEnabled: false
    };
    this._writeLocalStorage(next);

    window.location.reload();
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
