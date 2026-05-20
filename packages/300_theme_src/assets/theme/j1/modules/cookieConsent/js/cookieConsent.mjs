/*
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/modules/cookieConsent/js/cookieConsent.mjs (1)
 # Provides JS Core for J1 Module BS Cookie Consent
 #
 #  Product/Info:
 #  https://shaack.com
 #  http://jekyll.one
 #
 #  Copyright (C) 2020 Stefan Haack
 #  Copyright (C) 2023-2026 Juergen Adams
 #
 #  bootstrap-cookie-banner is licensed under MIT License.
 #  See: https://github.com/shaack/bootstrap-cookie-banner/blob/master/LICENSE
 #  J1 Theme is licensed under MIT License.
 #  See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 # -----------------------------------------------------------------------------
 #
 # claude - improve cookieConsent code using lit #1
 # -----------------------------------------------------------------------------
 # Refactored to use Lit (https://lit.dev) for the consent modal UI.
 # The component <j1-cookie-consent> renders the modal declaratively
 # from reactive state; nothing in the template is touched by external
 # code, so the class of bugs the previous version had to defend against
 # (innerHTML injection wiping `.modal-dialog`, Bootstrap Modal reading
 # `_dialog` once at construction time, HTML compressor stripping the
 # dialog markup, etc.) cannot occur here.
 #
 # claude - improve cookieConsent code using lit #2
 # -----------------------------------------------------------------------------
 # Follow-up: drop the XHR-based JSON fetch entirely. The Lit component
 # now receives its localized text strings directly from the adapter
 # via the new `content` constructor property. This means:
 #
 #   - one fewer network round-trip on every page that triggers the modal
 #   - the modal can open synchronously (no `await` in showDialog or in
 #     connectedCallback) — a single render pass on first interaction
 #   - the JSON endpoint at /assets/data/cookieconsent is no longer
 #     required for the component to function
 #
 # Also fixed in #2:
 #
 #   - `bodyText` and `privacyNotice` from the YAML config contain
 #     intentional HTML markup (<b>, <br>, <ul>, <li>, ...). The #1
 #     refactor interpolated them with `${t.bodyText}`, which Lit's
 #     html`` text-bindings HTML-ESCAPE. The tags were rendered as
 #     literal angle brackets instead of formatting the text. The #2
 #     code uses the `unsafeHTML` directive for these two fields. They
 #     are sourced from the site's own _data files, not from user
 #     input, so this is the correct escape hatch.
 #   - The original code wrapped the privacy notice (which contains a
 #     `<ul>` and nested `<p>` blocks) inside a `<p>`. HTML does not
 #     allow block elements inside `<p>`; browsers auto-closed the
 #     outer `<p>` early. Switched both wrappers to `<div>`.
 #
 # What this refactor removes (cumulative across #1 + #2):
 #   - jQuery dependency for the modal UI
 #   - XHR-based JSON fetch for the modal's localized text
 #   - The Bootstrap 5 Modal JS dependency. Bootstrap *CSS* classes
 #     are still used for styling; show/hide/backdrop is local.
 #   - The defensive scaffolding around `.modal-dialog` re-injection
 #     and the requestAnimationFrame deferral
 #   - The `updateButtons()` / `updateOptionsFromCookie()` imperative
 #     DOM sync — replaced by Lit's reactive render
 #   - The `contentURL` constructor property and the `_loadConfig()`
 #     method that used it
 #
 # What is preserved (drop-in compatible):
 #   - Public API: `new CookieConsent(props)`, `.showDialog()`,
 #     `.getSettings(optionName)`
 #   - Cookie semantics: same name/expiry/SameSite/Domain/Secure
 #     attributes, base64-encoded JSON payload
 #   - Whitelisted page handling and `autoShowDialog` behavior
 #   - The `postSelectionCallback` window-resolved callback contract,
 #     called with `{ dataChanged }`
 #   - Redirect to /445.html on "Do not Agree"
 #
 # -----------------------------------------------------------------------------
*/

'use strict';

// Lit is imported from a CDN-served ESM bundle so this file works when
// loaded as `<script type="module" src=".../cookieConsent.js">`.
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
// Cookie utility
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

    // Build the cookie string from parts instead of the original
    // four-branch conditional. Same wire-format output.
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
// <j1-cookie-consent> — the Lit web component.
// -----------------------------------------------------------------------------
class J1CookieConsent extends LitElement {

  // Render into light DOM so the page's Bootstrap CSS continues to
  // apply (`modal-dialog`, `btn`, `btn-success`, `collapse`, ...).
  // Shadow DOM would isolate those styles, which we do not want.
  //
  createRenderRoot() {
    return this;
  }

  static properties = {
    // `content` is the new single source of truth for the modal's
    // localized text. The adapter builds it from
    // cookieConsentOptions.modal_settings (defaults + site overrides)
    // and assigns it to this property. Shape:
    //
    //   {
    //     title:         String,
    //     bodyText:      String  (may contain HTML markup),
    //     privacyNotice: String  (may contain HTML markup),
    //     labels: {
    //       privacyNotice, mySettings,
    //       necessary, necessaryDesc:[],
    //       analysis,  analysisDesc:[],
    //       personalization, personalizationDesc:[],
    //       buttonDoNotAgree, buttonDoNothing, buttonAgree,
    //       buttonSave, buttonAgreeAll, close
    //     }
    //   }
    //
    // The component falls back to a minimal English config (see
    // _fallbackConfig() below) only if `content` is missing entirely;
    // individual missing label keys fall back per-field at render
    // time. `contentURL` was removed — the XHR fetch is gone.
    //
    content:               { type: Object },

    // config (mirrors the original `props` object)
    cookieName:            { type: String },
    cookieStorageDays:     { type: Number },
    cookieSameSite:        { type: String },
    cookieDomain:          { type: String },
    cookieSecure:          { type: Boolean },
    autoShowDialog:        { type: Boolean },
    whitelisted:           { type: Array },
    postSelectionCallback: { type: String },

    // reactive internal state
    // `_config` is gone — the render path reads from `this.content`
    // directly. Lit re-renders automatically when the property is
    // (re)assigned by the factory.
    //
    _open:         { state: true },
    _detailed:     { state: true },
    _showPrivacy:  { state: true },
    _options:      { state: true }
  };

  constructor() {
    super();

    // `content` starts null. The adapter assigns it before the
    // element is attached to <body> (see the CookieConsent factory
    // below), so by the time the first render runs it is populated.
    // If for some reason it is still null when render() is called,
    // `_fallbackConfig()` provides a safety net.
    //
    this.content               = null;

    this.cookieName            = 'j1.user.consent';
    this.cookieStorageDays     = 365;
    this.cookieSameSite        = 'Strict';
    this.cookieDomain          = '';
    this.cookieSecure          = window.location.protocol.includes('https');
    this.autoShowDialog        = true;
    this.whitelisted           = [];
    this.postSelectionCallback = '';

    this._open         = false;
    this._detailed     = false;
    this._showPrivacy  = false;
    this._options      = { necessary: true, analysis: true, personalization: true };
    this._dataChanged  = null;
  }

  // No longer async — there is nothing left to fetch. Decisions about
  // restoring previous selections and auto-opening the modal happen
  // synchronously against the already-resolved props.
  //
  connectedCallback() {
    super.connectedCallback();

    // Restore any previous selections from the cookie
    const existing = this.getSettings();
    if (existing && typeof existing === 'object') {
      this._options = { ...this._options, ...existing, necessary: true };
    }

    // Decide whether to auto-show the dialog on this page load
    const whitelisted = (this.whitelisted || []).indexOf(window.location.pathname) > -1;
    const consent = Cookie.get(this.cookieName);
    if ((consent === undefined || consent === 'false') && this.autoShowDialog && !whitelisted) {
      this._open = true;
    }
  }

  // Static minimal English fallback. Used only when `content` is
  // completely absent (e.g. the component was instantiated directly
  // without going through the adapter). Individual missing fields
  // inside a partial `content` block are handled per-field at render
  // time via the `|| 'default'` patterns below.
  //
  static _fallbackConfig() {
    return {
      title: 'Cookie Consent',
      bodyText: 'This site uses cookies. Please review your settings.',
      privacyNotice: 'No privacy notice available.',
      labels: {
        privacyNotice: 'Privacy Notice',
        mySettings: 'My Settings',
        necessary: 'Necessary',
        necessaryDesc: ['Required to run the website'],
        analysis: 'Analysis',
        analysisDesc: [],
        personalization: 'Personalization',
        personalizationDesc: [],
        buttonDoNotAgree: 'I Do not Agree',
        buttonDoNothing: 'Do Nothing',
        buttonAgree: 'I Agree',
        buttonSave: 'Save selection',
        buttonAgreeAll: 'Agree on all',
        close: 'Close'
      }
    };
  }

  // ---------------------------------------------------------------------------
  // Render — single source of truth for the modal UI. Replaces the
  // original Liquid-generated HTML + jQuery wiring.
  //
  // claude - improve cookieConsent code using lit #2
  // Reads from `this.content` directly (no XHR-loaded `_config` state).
  // The fallback engages only if the property was never assigned.
  // ---------------------------------------------------------------------------
  //
  render() {
    if (!this._open) return nothing;
    const t = this.content || J1CookieConsent._fallbackConfig();
    const L = t.labels || {};

    return html`
      <div class="modal-backdrop fade show"
           @click=${this._onBackdropClick}></div>

      <div class="modal fade show"
           style="display: block;"
           tabindex="-1"
           role="dialog"
           aria-modal="true"
           aria-labelledby="bccs-title">
        <div class="modal-dialog modal-frame modal-top modal-notify modal-primary"
             role="document">
          <div class="modal-content">

            <div class="modal-header">
              <p id="bccs-title" class="lead">${t.title}</p>
              <button type="button"
                      class="btn-close"
                      aria-label=${L.close || 'Close'}
                      @click=${this._onClose}></button>
            </div>

            <div class="modal-body mt-4">
              <p>
                <a href="#"
                   @click=${this._togglePrivacy}>${L.privacyNotice || 'Privacy Notice'}</a>
                <a href="#"
                   class="float-right"
                   @click=${this._toggleOptions}>${L.mySettings || 'My Settings'}</a>
              </p>

              <!--
                claude - improve cookieConsent code using lit #2
                <div> wrapper (not <p>) because bodyText may contain
                block-level HTML (<br>, <b>) and the privacy notice
                further down contains <ul>/<li>/<p>, which are
                illegal inside <p>. unsafeHTML renders the trusted
                YAML-sourced markup instead of escaping it.
              -->
              <div class="bccs-body-text r-text-300">
                ${unsafeHTML(t.bodyText || '')}
              </div>

              ${this._showPrivacy ? html`
                <div id="bccs-privacy">
                  <p class="tagline mt-4 mb-1"><b>${L.privacyNotice || 'Privacy Notice'}</b></p>
                  <div class="d-inline-block g-width-50 g-height-2 bg-primary mb-3"></div>
                  <div class="bccs-body-text r-text-200">
                    ${unsafeHTML(t.privacyNotice || '')}
                  </div>
                </div>
              ` : nothing}

              ${this._detailed ? html`
                <div id="bccs-options">
                  <p class="tagline mt-4 mb-1"><b>${L.mySettings || 'My Settings'}</b></p>
                  <div class="d-inline-block g-width-50 g-height-2 bg-primary mb-3"></div>
                  ${this._renderOption('necessary',
                                       L.necessary || 'Necessary',
                                       L.necessaryDesc,
                                       /*disabled=*/ true)}
                  ${this._renderOption('analysis',
                                       L.analysis || 'Analysis',
                                       L.analysisDesc,
                                       false)}
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

  // The two button banks replace the original `updateButtons()` show/hide
  // dance. The displayed bank is purely a function of `_detailed`.
  //
  _renderDefaultButtons(L) {
    return html`
      <button type="button"
              class="btn btn-danger mb-1 mr-2"
              style="min-width: 20rem"
              @click=${this._onDoNotAgree}>${L.buttonDoNotAgree || 'I Do not Agree'}</button>
      <button type="button"
              class="btn btn-info mb-1 mr-2"
              style="min-width: 20rem"
              @click=${this._onDoNothing}>${L.buttonDoNothing || 'Do Nothing'}</button>
      <button type="button"
              class="btn btn-success mb-1 mr-2"
              style="min-width: 20rem"
              @click=${this._onAgree}>${L.buttonAgree || 'I Agree'}</button>
    `;
  }

  _renderDetailedButtons(L) {
    return html`
      <button type="button"
              class="btn btn-warning mb-1 mr-2"
              style="min-width: 20rem"
              @click=${this._onSave}>${L.buttonSave || 'Save selection'}</button>
      <button type="button"
              class="btn btn-success mb-1 mr-2"
              style="min-width: 20rem"
              @click=${this._onAgreeAll}>${L.buttonAgreeAll || 'Agree on all'}</button>
    `;
  }

  _renderOption(name, label, descriptions, disabled) {
    return html`
      <div class="bccs-option" data-name=${name}>
        <div class="switch">
          <label>
            <input type="checkbox"
                   name="bccs-checkbox-${name}"
                   ?checked=${this._options[name]}
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
    if (name === 'necessary') return;  // forced on, original behavior
    this._options = { ...this._options, [name]: checked };
  }

  _togglePrivacy(e) {
    e.preventDefault();
    this._showPrivacy = !this._showPrivacy;
  }

  _toggleOptions(e) {
    e.preventDefault();
    this._detailed = !this._detailed;
  }

  _onClose() {
    // Closing via the "X" leaves `_dataChanged` as whatever the user's
    // last commit action set it to (null if no commit). Matches the
    // original `hidden.bs.modal` behavior.
    this._close();
  }

  _onBackdropClick() {
    // Original used `backdrop: 'static'` — clicking the backdrop does
    // nothing. Preserved.
  }

  _onAgree() {
    this._dataChanged = true;
    this._options = { necessary: true, analysis: true, personalization: true };
    this._persist(this.cookieStorageDays);
    this._close();
  }

  _onAgreeAll() {
    this._dataChanged = true;
    this._options = { necessary: true, analysis: true, personalization: true };
    this._persist(this.cookieStorageDays);
    this._detailed = false;
    this._close();
  }

  _onSave() {
    this._dataChanged = true;
    this._persist(this.cookieStorageDays);
    this._detailed = false;
    this._close();
  }

  _onDoNotAgree() {
    this._dataChanged = true;
    this._options = { necessary: true, analysis: false, personalization: false };
    // expire immediately (days = 0), matches original
    this._persist(0);
    this._close();
    // preserved redirect
    window.location.href = '/445.html';
  }

  _onDoNothing() {
    this._dataChanged = false;
    this._close();
  }

  _persist(days) {
    Cookie.set(
      this.cookieName,
      JSON.stringify(this._options),
      days,
      this.cookieSameSite,
      this.cookieDomain,
      this.cookieSecure
    );
  }

  _close() {
    this._open = false;
    executeFunctionByName(
      this.postSelectionCallback,
      window,
      { dataChanged: this._dataChanged }
    );
  }

  // ---------------------------------------------------------------------------
  // Public component methods (mirror the original API)
  // ---------------------------------------------------------------------------
  // Synchronous: no XHR fetch to await any more. The signature is kept
  // as a method that returns `undefined` (rather than a Promise) — the
  // original `.showDialog()` was used in fire-and-forget contexts only,
  // and call sites that did `await j1.cookieConsent.showDialog()`
  // continue to work because `await undefined` is just `undefined`.
  //
  showDialog() {
    const whitelisted = (this.whitelisted || []).indexOf(window.location.pathname) > -1;
    if (whitelisted) return;
    this._open = true;
  }

  getSettings(optionName) {
    const raw = Cookie.get(this.cookieName);
    if (!raw) return undefined;
    let settings;
    try { settings = JSON.parse(raw); } catch (_) { return undefined; }
    if (optionName === undefined) return settings;
    return settings ? settings[optionName] : false;
  }
}

customElements.define('j1-cookie-consent', J1CookieConsent);

// -----------------------------------------------------------------------------
// Drop-in factory.
//
// Existing call sites use `new CookieConsent({...})` and then call
// `.showDialog()` / `.getSettings()`. This factory keeps that contract:
// it instantiates (or finds) a single <j1-cookie-consent> element,
// copies the caller's props onto it, attaches it to <body>, and
// returns a thin proxy exposing the same method names.
//
// One subtlety with the new `content` property: it must be assigned
// BEFORE the element is appended to the DOM, so that the first
// render() call sees it. The original loop already does this — it
// copies all props onto `el` and only then calls `appendChild`. Order
// is now load-bearing; if you reorder these statements you will get
// a brief flash of the fallback English content.
//
// -----------------------------------------------------------------------------
export function CookieConsent(props) {
  let el = document.querySelector('j1-cookie-consent');
  const isNew = !el;
  if (isNew) {
    el = document.createElement('j1-cookie-consent');
  }

  // copy known props onto the element so Lit's reactive system sees them
  for (const key in (props || {})) {
    if (Object.prototype.hasOwnProperty.call(props, key)) {
      el[key] = props[key];
    }
  }

  // Append AFTER property assignment so connectedCallback() runs with
  // a fully-populated `content` block.
  //
  if (isNew) {
    document.body.appendChild(el);
  }

  this.showDialog  = () => el.showDialog();
  this.getSettings = (name) => el.getSettings(name);
}

// Expose globally to do `new CookieConsent(...)`
//
if (typeof window !== 'undefined') {
  window.CookieConsent = CookieConsent;
}
