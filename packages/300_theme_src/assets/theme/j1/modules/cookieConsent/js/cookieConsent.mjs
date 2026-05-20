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
 #   - The "Do Nothing" button was a UX dead-end: its click handler
 #     (`_onDoNothing`) was functionally identical to clicking the "X"
 #     close button — both called `_close()` without mutating
 #     `_dataChanged`. The button slot is now repurposed as a
 #     "Show Privacy Notice" entry-point that toggles the Privacy Notice
 #     section (the `_showPrivacy` reactive state). The previous in-body
 #     `<a>Privacy Notice</a>` link has been removed because the
 #     dedicated footer button is more discoverable than a small
 #     inline link, and keeping both would have introduced two
 #     controls for the same action.

 #
 # claude - improve cookieConsent code using lit #3
 # -----------------------------------------------------------------------------
 # Follow-up to #2: the repurposed footer button is now a TRUE toggle
 # for the Privacy Notice section, with its label tracking the
 # `_showPrivacy` reactive state:
 #
 #   _showPrivacy === false  →  "Show Privacy Notice" (buttonShowPrivacyNotice)
 #   _showPrivacy === true   →  "Hide Privacy Notice" (buttonHidePrivacyNotice)
 #
 # The label swap is purely a function of state in render(), so Lit
 # repaints it automatically the moment `_togglePrivacy` flips the
 # flag — no imperative DOM writes are needed. The `aria-expanded`
 # attribute, which was already wired correctly in #2, complements
 # the visible label change for screen-reader users.
 #
 # The new `buttonHidePrivacyNotice` label key has been added to
 # `_data/modules/defaults/cookieconsent.yml` alongside the existing
 # `buttonShowPrivacyNotice` key, with a default of "Hide Privacy
 # Notice". Both keys are independently overridable from
 # `modules.cookieconsent.settings.modal_settings.labels` for i18n,
 # and each falls back to its English literal at render time if the
 # key is absent from the content block.
 #
 # No changes are required in the adapter (cookieConsent.js): its
 # `buildModalContent()` helper passes the entire `labels` object
 # through to the component as-is, so the new key flows through
 # without any further wiring.
 #
 # claude - improve cookieConsent code using lit #4
 # -----------------------------------------------------------------------------
 # Follow-up to #3: the inline "My Settings" anchor that lived in the
 # modal body has been removed and replaced with a footer toggle
 # button modeled on `buttonShowPrivacyNotice`. The new button sits
 # immediately to the right of the Privacy Notice toggle. Its label
 # tracks the existing `_detailed` reactive state:
 #
 #   _detailed === false  →  "Show Settings" (buttonShowSettings)
 #   _detailed === true   →  "Hide Settings" (buttonHideSettings)
 #
 # The button is wired to the existing `_toggleOptions` handler — no
 # new state field is required; `_detailed` already drives both the
 # visibility of the `#bccs-options` block and the choice between
 # the default and detailed footer button banks.
 #
 # To make it a TRUE toggle (the user must be able to BOTH show and
 # hide the section, exactly like the Privacy toggle), the toggle
 # button is rendered in BOTH footer banks:
 #
 #   - default bank  (DoNotAgree | Privacy toggle | Settings toggle | Agree)
 #   - detailed bank (Settings toggle | Save | AgreeAll)
 #
 # In the default bank the button reads "Show Settings"; in the
 # detailed bank it reads "Hide Settings". The Privacy toggle on the
 # other hand does not need to appear in the detailed bank: opening
 # the privacy section never changes the button bank, so its single
 # placement is sufficient.
 #
 # Two new label keys, `buttonShowSettings` and `buttonHideSettings`,
 # have been added to `_data/modules/defaults/cookieconsent.yml`
 # alongside the existing Privacy toggle keys. Both are independently
 # overridable from `modules.cookieconsent.settings.modal_settings.labels`
 # for i18n, and each falls back to its English literal at render time
 # if the key is absent from the content block. The pre-existing
 # `mySettings` label is retained — it is still used as the section
 # heading inside the expanded options block ("My Settings" header).
 #
 # No changes are required in the adapter (cookieConsent.js): its
 # `buildModalContent()` helper passes the entire `labels` object
 # through to the component as-is, so the two new keys flow through
 # without any further wiring.
 #
 # claude - improve cookieConsent code using lit #5
 # -----------------------------------------------------------------------------
 # Follow-up to #4: the Settings toggle button now also closes the
 # Privacy Notice section as a side-effect of being clicked. Prior to
 # #5, `_showPrivacy` and `_detailed` were fully independent reactive
 # flags, which meant the user could expand BOTH the Privacy Notice
 # block AND the My Settings block at the same time. That made the
 # modal grow unbounded in height and forced two unrelated sections
 # to compete for the same viewport space.
 #
 # The fix is a single additional assignment in `_toggleOptions`:
 #
 #   this._showPrivacy = false;
 #   this._detailed    = !this._detailed;
 #
 # Behavioral consequences:
 #
 #   - Clicking "Show Settings" while the Privacy Notice is open:
 #     the Privacy Notice closes, the Settings section opens, the
 #     footer flips to the detailed button bank — all in one Lit
 #     render pass.
 #   - Clicking "Hide Settings": the Privacy Notice is already
 #     closed (it would have been closed by the same handler when
 #     the user first opened Settings), so the new assignment is a
 #     no-op. Lit's change detection short-circuits the re-render of
 #     the `#bccs-privacy` conditional when the value is unchanged,
 #     so the unconditional assignment costs nothing in the common
 #     case.
 #   - The footer Privacy toggle button's label automatically reverts
 #     from "Hide Privacy Notice" back to "Show Privacy Notice"
 #     because that label is purely a function of `_showPrivacy` in
 #     `_renderDefaultButtons`. The `aria-expanded` attribute on the
 #     same button is wired to the same flag, so the a11y semantics
 #     stay in sync with the visible label without any extra code.
 #
 # The symmetric behavior — closing the Settings section when the
 # Privacy toggle is clicked — is INTENTIONALLY NOT mirrored here.
 # Opening the Privacy Notice never changes the footer button bank
 # (Privacy is a body-only expansion), whereas opening Settings does
 # swap the footer bank entirely. The two sections are therefore not
 # symmetric in their UI impact and do not need a symmetric handler.
 # If a future iteration wants to make them symmetric, the change is
 # a single line in `_togglePrivacy`.
 #
 # No changes are required in the adapter (cookieConsent.js), in
 # `_data/modules/defaults/cookieconsent.yml`, or in the public API.
 # The fix is localized to one event handler.
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
    //       buttonShowPrivacyNotice, buttonHidePrivacyNotice,
    //       // claude - improve cookieConsent code using lit #4
    //       // New label keys for the footer Settings toggle.
    //       // `mySettings` is still used as the in-body section
    //       // heading; these drive the new toggle button label.
    //       buttonShowSettings, buttonHideSettings,
    //       buttonAgree,
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
    this.content                = null;

    this.cookieName             = 'j1.user.consent';
    this.cookieStorageDays      = 365;
    this.cookieSameSite         = 'Strict';
    this.cookieDomain           = '';
    this.cookieSecure           = window.location.protocol.includes('https');
    this.autoShowDialog         = true;
    this.whitelisted            = [];
    this.postSelectionCallback  = '';

    this._open                  = false;
    this._detailed              = false;
    this._showPrivacy           = false;
    this._options               = { necessary: true, analysis: true, personalization: true };
    this._dataChanged           = null;
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
      title:                      'Cookie Consent',
      bodyText:                   'This site uses cookies. Please review your settings.',
      privacyNotice:              'No privacy notice available.',
      labels: {
        privacyNotice:            'Privacy Notice',
        mySettings:               'My Settings',
        necessary:                'Necessary',
        necessaryDesc:            ['Required to run the website'],
        analysis:                 'Analysis',
        analysisDesc:             [],
        personalization:          'Personalization',
        personalizationDesc:      [],
        buttonDoNotAgree:         'I Do not Agree',
        buttonShowPrivacyNotice:  'Show Privacy Notice',
        buttonHidePrivacyNotice:  'Hide Privacy Notice',
        buttonShowSettings:       'Show Settings',
        buttonHideSettings:       'Hide Settings',
        buttonAgree:              'I Agree',
        buttonSave:               'Save selection',
        buttonAgreeAll:           'Agree on all',
        close:                    'Close'
      }
    };
  }

  // ---------------------------------------------------------------------------
  // Render — single source of truth for the modal UI. Replaces the
  // original Liquid-generated HTML + jQuery wiring.
  //
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
              <!--
                claude - improve cookieConsent code using lit #2
                The "Privacy Notice" anchor that used to live here has
                been removed. Toggling the Privacy Notice section is
                now the job of the renamed footer button (Settings,
                wired to _togglePrivacy). Keeping a redundant inline
                link would give the same action two controls and was
                the less-discoverable of the two.
              -->
              <!--
                claude - improve cookieConsent code using lit #4
                The "My Settings" anchor that used to live in this
                slot (a floated <a class="float-right"> wired to
                _toggleOptions) has been removed. Toggling the
                detailed options section is now the job of the new
                footer button buttonShowSettings / buttonHideSettings,
                placed to the right of the Privacy Notice toggle
                (see _renderDefaultButtons and _renderDetailedButtons).
                The motivation is the same as #2's removal of the
                Privacy Notice anchor: a dedicated footer button is
                more discoverable than a small floated inline link,
                and keeping both would have introduced two controls
                for the same action. The pre-existing mySettings
                label key is still consumed below as the heading of
                the expanded #bccs-options block.
              -->

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
    // The middle button is a TRUE toggle for the Privacy Notice
    // section. Its visible label is derived from `_showPrivacy` at
    // render time:
    //
    //   _showPrivacy === false → L.buttonShowPrivacyNotice
    //   _showPrivacy === true  → L.buttonHidePrivacyNotice
    //
    // Lit re-runs this template on every state change, so flipping
    // the flag in `_togglePrivacy` repaints both the body
    // (collapsing/expanding the #bccs-privacy block) and the button
    // label in a single reactive pass — no imperative DOM writes.
    //
    // `aria-expanded` was already correct in #2 and is kept in sync
    // here with the same `_showPrivacy` state for screen-reader users,
    // so the visible label change and the a11y semantics never drift
    // apart.
    //
    // The per-field `||` fallbacks keep the component usable when a
    // partial `content` block was provided that happens to omit one
    // of these label keys (e.g. an older site override that predates
    // the toggle).
    //
    const privacyToggleLabel = this._showPrivacy
      ? (L.buttonHidePrivacyNotice || 'Hide Privacy Notice')
      : (L.buttonShowPrivacyNotice || 'Show Privacy Notice');

    // Settings toggle label, mirroring the Privacy toggle pattern
    // above. Driven by `_detailed` (the same flag that controls the
    // visibility of the `#bccs-options` block and the choice of
    // footer button bank). The toggle is wired to `_toggleOptions`,
    // which simply flips `_detailed` — Lit re-renders both the body
    // and the footer in a single reactive pass.
    //
    // The button is rendered here in the default bank so the user
    // can OPEN the settings section, and re-rendered in the detailed
    // bank (see `_renderDetailedButtons`) so the user can CLOSE it
    // again without committing. That dual placement is what makes
    // the control a true toggle.
    //
    const settingsToggleLabel = this._detailed
      ? (L.buttonHideSettings || 'Hide Settings')
      : (L.buttonShowSettings || 'Show Settings');

    return html`
      <button type="button"
              class="btn btn-danger mb-1 mr-2"
              style="min-width: 20rem"
              @click=${this._onDoNotAgree}>${L.buttonDoNotAgree || 'I Do not Agree'}</button>
      <button type="button"
              class="btn btn-info mb-1 mr-2"
              style="min-width: 20rem"
              aria-expanded=${this._showPrivacy ? 'true' : 'false'}
              @click=${this._togglePrivacy}>${privacyToggleLabel}</button>
      <!--
        claude - improve cookieConsent code using lit #4
        New Settings toggle button. Placed immediately to the right
        of the Privacy toggle, before the primary Agree action.
        btn-info matches the visual treatment of the Privacy
        toggle — both are non-committal utility toggles, so the
        shared style signals their shared semantics. aria-expanded
        mirrors _detailed so the visible label change and the a11y
        semantics never drift apart.
      -->
      <button type="button"
              class="btn btn-info mb-1 mr-2"
              style="min-width: 20rem"
              aria-expanded=${this._detailed ? 'true' : 'false'}
              @click=${this._toggleOptions}>${settingsToggleLabel}</button>
      <button type="button"
              class="btn btn-success mb-1 mr-2"
              style="min-width: 20rem"
              @click=${this._onAgree}>${L.buttonAgree || 'I Agree'}</button>
    `;
  }

  _renderDetailedButtons(L) {
    // The Settings toggle button is also rendered here, in the
    // FIRST position of the detailed bank. When `_detailed === true`
    // this bank is shown; the toggle therefore reads "Hide Settings"
    // (via the same `_detailed`-driven ternary used in
    // `_renderDefaultButtons`) and clicking it flips `_detailed`
    // back to false, which:
    //   1. collapses the `#bccs-options` block in the modal body;
    //   2. switches the footer bank back to the default trio.
    //
    // Without this dual placement, the toggle would not be a true
    // toggle (the user could open the settings section but never
    // close it without committing via Save/AgreeAll or dismissing
    // the modal). The pattern mirrors how the Privacy toggle works,
    // adapted to a state flag (`_detailed`) that does change banks.
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
    // Flipping `_showPrivacy` drives two visible changes in a single
    // Lit render pass:
    //   1. the #bccs-privacy block is added to / removed from the
    //      modal body (the existing `${this._showPrivacy ? ... : nothing}`
    //      conditional in render());
    //   2. the footer toggle button's label swaps between
    //      `buttonShowPrivacyNotice` and `buttonHidePrivacyNotice`
    //      (see `_renderDefaultButtons`).
    // No imperative DOM mutation is needed — assigning to the
    // reactive state is sufficient.
    //
    e.preventDefault();
    this._showPrivacy = !this._showPrivacy;
  }

  _toggleOptions(e) {
    // Now driven by the footer Settings toggle button
    // (`buttonShowSettings` / `buttonHideSettings`) instead of the
    // removed inline "My Settings" anchor. The handler itself is
    // unchanged: it simply flips `_detailed`, and Lit re-renders
    // both the body (showing/hiding `#bccs-options`) and the footer
    // (swapping between the default and detailed button banks) in
    // a single reactive pass.
    //
    // Additionally, clicking the Settings toggle now closes the
    // Privacy Notice section if it happened to be open. Without this
    // assignment, `_showPrivacy` and `_detailed` were fully independent
    // and the user could expand BOTH optional sections at once,
    // letting the modal grow unbounded in height. Setting the flag is
    // unconditional and cheap — when `_showPrivacy` was already
    // `false`, Lit's change detection short-circuits the re-render of
    // the `#bccs-privacy` conditional.
    //
    // The footer Privacy toggle button's label and `aria-expanded`
    // are both purely functions of `_showPrivacy` in
    // `_renderDefaultButtons`, so they revert automatically in the
    // same render pass — no extra wiring required.
    //
    e.preventDefault();
    this._showPrivacy = false;
    this._detailed = !this._detailed;
  }

  _onClose() {
    // Closing via the "X" leaves `_dataChanged` as whatever the user's
    // last commit action set it to (null if no commit). Matches the
    // original `hidden.bs.modal` behavior.
    //
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

  // `_onDoNothing()` was deleted: the middle "Settings" button is now
  // wired to `_togglePrivacy`, and the bare close-without-mutation
  // path stays reachable via the modal's "X" (`_onClose` → `_close`).
  //
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
// -----------------------------------------------------------------------------
//
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

// Expose globally to do `new CookieConsent({...})`
//
if (typeof window !== 'undefined') {
  window.CookieConsent = CookieConsent;
}
