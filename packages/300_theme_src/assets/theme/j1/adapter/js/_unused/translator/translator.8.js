---
regenerate:                             true
---

{%- capture cache -%}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/adapter/js/translator.js (8)
 # Liquid template to create the Template Adapter for J1 Translator
 #
 # Product/Info:
 # http://jekyll.one
 #
 # Copyright (C) 2023-2026 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # For details, see: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 # -----------------------------------------------------------------------------
{% endcomment %}

{% comment %} Liquid var initialization
-------------------------------------------------------------------------------- {% endcomment %}

{% comment %} Set config files
-------------------------------------------------------------------------------- {% endcomment %}
{% assign environment             = site.environment %}
{% assign modules                 = site.data.modules %}

{% assign contentLanguage         = site.language | default: 'en' %}

{% comment %} Set config data
-------------------------------------------------------------------------------- {% endcomment %}
{% assign cookie_defaults         = modules.defaults.cookies.defaults %}
{% assign cookie_settings         = modules.cookies.settings %}
{% assign translator_defaults     = modules.defaults.translator.defaults %}
{% assign translator_settings     = modules.translator.settings %}

{% comment %} Set config options
-------------------------------------------------------------------------------- {% endcomment %}
{% assign cookie_options          = cookie_defaults     | merge: cookie_settings %}
{% assign translator_options      = translator_defaults | merge: translator_settings %}

{% comment %} Detect prod mode
-------------------------------------------------------------------------------- {% endcomment %}
{% assign production = false %}
{% if environment == 'prod' or environment == 'production' %}
  {% assign production = true %}
{% endif %}


/*
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/adapter/js/translator.js (8)
 # JS Adapter for J1 Translator
 #
 #  Product/Info:
 #  http://jekyll.one
 #
 #  Copyright (C) 2023-2026 Juergen Adams
 #
 #  J1 Theme is licensed under MIT License.
 #  See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 # -----------------------------------------------------------------------------
 #  Adapter generated: {{site.time}}
 # -----------------------------------------------------------------------------
 #
 # claude - improve translator code using lit #1
 # -----------------------------------------------------------------------------
 # Adapter rewritten to feed the Lit-based translator.mjs module. The
 # localized text content for the translator modal is built once in
 # this adapter (from the merged YAML config block) and handed to the
 # constructor as the `content` property — no XHR fetch for the modal
 # content is performed by the module any more.
 #
 # The following constructor properties of the legacy (pre-Lit)
 # implementation no longer exist and have been removed from the
 # `new Translator({...})` call below:
 #
 #   - `contentURL`        — the XHR endpoint is gone; the component
 #                           receives `content` directly.
 #   - `xhrDataElement`    — referred to a wrapper element inside the
 #                           fetched HTML payload; no fetch, no wrapper.
 #   - `dialogContainerID` — the component owns its own host element
 #                           (<j1-translator>), so an external
 #                           placeholder is unnecessary.
 #
 # The three keys have also been removed from the YAML defaults file
 # (`_data/modules/defaults/translator.yml`) because nothing reads them
 # any more. The Liquid template that emitted the legacy modal HTML at
 # /assets/data/translator/<lang>/index.html should be deleted from the
 # site source tree.
 # -----------------------------------------------------------------------------
 #
 # claude - improve translator code using lit #3
 # -----------------------------------------------------------------------------
 # Restore Google Translate widget script injection that was lost in #1.
 #
 # The Lit-based translator.mjs module is purely the *settings UI* — it
 # renders the modal, persists the user's selection to localStorage, and
 # fires `postSelectionCallback` with `'process'` or `'exitOnly'`. It
 # does NOT load the Google Translate Element API and does NOT write the
 # `googtrans` cookie that the API reads to decide what to translate to.
 #
 # The legacy (pre-Lit) adapter (translator.js v5) handled both of those:
 #
 #   1. It built two <script> elements at init time:
 #        - `<script id="gt-callback">` defining the global
 #          `googleTranslateElementInit()` function that Google Translate
 #          invokes once its loader script has parsed.
 #        - `<script id="gt-translate" src="//translate.google.com/
 #          translate_a/element.js?cb=googleTranslateElementInit">`
 #          the actual Translate Element loader. Appended to <head> only
 #          when translation was enabled in user settings.
 #
 #   2. It wrote the `googtrans=/srcLang/targetLang` cookie (scoped to
 #      the registrable domain on a subdomain, host-only otherwise) in
 #      its `cbGoogle()` callback before reloading the page. Without
 #      that cookie the Translate Element loads but has no instruction
 #      to translate anything.
 #
 # #1 dropped both responsibilities under the (incorrect) assumption that
 # the Lit module's `_onTranslate()` handler covered them. It does not:
 # `_onTranslate()` only flips `translationEnabled: true` in localStorage
 # and closes the modal. As a result the translator UI worked, the user
 # could pick a language and click Translate, the modal closed cleanly —
 # and nothing translated, because no Google Translate script was ever
 # loaded and no `googtrans` cookie was ever written.
 #
 # #3 puts both pieces back into the adapter (which is the right layer
 # for them — they are integrations with a specific translator backend,
 # not generic modal UI). Two helper functions are introduced:
 #
 #   - `injectGoogleTranslateScripts(pageLanguage)`
 #       Idempotent. Creates `gt-callback` and `gt-translate` if absent
 #       and appends them to <head>. Safe to call multiple times — a
 #       returning visitor with a stale tab gets the scripts only once.
 #
 #   - `setGoogtransCookie(srcLang, targetLang, domain, isSubDomain)`
 #       Writes the cookie via js-cookie (the same `Cookies` global the
 #       legacy version used). Scoped to the parent domain on a subdomain
 #       so all siblings share the same translation choice, host-only
 #       otherwise. Mirrors the legacy logic exactly.
 #
 # Call sites:
 #
 #   - In `init()`, after `j1.translator = new Translator({...})`:
 #     read `j1.translator.getSettings()`. If `translationEnabled` is
 #     true (i.e. a returning visitor previously picked a language),
 #     inject the scripts so this fresh page load gets translated
 #     automatically without the user having to re-open the modal.
 #
 #   - In `cbGoogle('process')`: read the user's selection, write the
 #     `googtrans` cookie, then either reload the page (so init() picks
 #     up where it left off — the legacy flow) or, if `reloadPageOnChange`
 #     is false, inject the scripts inline and let Google Translate
 #     translate the live DOM in place.
 #
 # No changes to translator.mjs or the YAML defaults are required — this
 # is purely an adapter-layer restoration of the pre-#1 behavior.
 # -----------------------------------------------------------------------------
*/

// -----------------------------------------------------------------------------
// ESLint shimming
// -----------------------------------------------------------------------------
/* eslint indent: "off"                                                       */
/* eslint quotes: "off"                                                       */
// -----------------------------------------------------------------------------
"use strict";

j1.adapter.translator = ((j1, window) => {

  const isDev                   = (j1.env === "development" || j1.env === "dev");
  const environment             = '{{environment}}';

  const READY_POLL_INTERVAL_MS  = 50;
  const READY_POLL_TIMEOUT_MS   = 30000;

  // claude - improve translator code using lit #3
  // The page's source language, used both as the `pageLanguage` parameter
  // of the Google Translate Element constructor and as the source side of
  // the `googtrans=/src/target` cookie. Mirrors the legacy adapter's
  // `siteLanguage = '{{contentLanguage}}'` assignment.
  //
  const siteLanguage        = '{{contentLanguage}}';

  // Module-scope state shared between init() and cbGoogle().
  //
  let _this;
  let logger;
  let cookie_names;
  let secure;
  let cookieOptions;
  let translatorOptions;

  // claude - improve translator code using lit #3
  // Module-scope handles for the two Google Translate <script> elements.
  // Kept here so `injectGoogleTranslateScripts()` can re-use the same
  // nodes on repeated calls (e.g. a returning visitor opens the modal,
  // toggles their selection, and commits a different language without
  // a full page reload). The legacy adapter kept them at the same scope.
  //
  let gtTranslateScript;
  let gtCallbackScript;

  // ---------------------------------------------------------------------------
  // helper functions
  // ---------------------------------------------------------------------------

  // claude - improve translator code using lit #1
  // Internal helper: extract the localized text content for the
  // translator modal from `translatorOptions`. The result is the
  // JSON shape that translator.mjs used to fetch from
  // /assets/data/translator/<lang>/index.html via XHR; it is now
  // handed to the constructor as the `content` property, so no XHR
  // is needed.
  //
  // The merged YAML config exposes the modal content under
  // `translatorOptions[translatorName].modal_settings`. Currently
  // only the 'google' translator is supported; if more translators
  // are added later the `[translatorName]` index will route to the
  // correct block automatically.
  //
  // A defensive empty object is supplied as the fallback for each
  // missing branch so a partially-configured site cannot crash the
  // adapter; translator.mjs itself ships a complete English fallback
  // for any keys still missing at render time.
  //
  function buildModalContent(options) {
    const translatorName = options.translatorName || 'google';
    const block          = (options[translatorName] || {});
    const ms             = block.modal_settings || {};
    const labels         = ms.labels || {};
    return {
      title:                  ms.title,
      bodyText:               ms.body_text,
      privacyNotice:          ms.privacy_notice,
      languageSelectorTitle:  ms.language_selector_title,
      labels:                 labels
    };
  }

  // claude - improve translator code using lit #3
  // Idempotently inject the two Google Translate <script> elements
  // (`gt-callback` and `gt-translate`) into <head>. Order matters:
  // the callback definition MUST be parsed before the loader fires
  // `googleTranslateElementInit`, otherwise the loader's callback hop
  // resolves `undefined` and the Translate Element never mounts. This
  // is why `gt-callback` is appended first.
  //
  // The function is safe to call any number of times — on the second
  // call it finds both scripts already present and short-circuits.
  // That matters for two scenarios:
  //
  //   - `init()` injects on page load for a returning visitor with
  //     translation enabled; `cbGoogle('process')` later injects again
  //     for the same load if the user re-opens the modal and re-commits
  //     without `reloadPageOnChange`. The second call is a no-op.
  //
  //   - An SPA-style host or a hot-reload during development re-enters
  //     `init()`. The guard keeps a second `<script id="gt-translate">`
  //     from being added (which would silently re-trigger the loader
  //     and re-define `googleTranslateElementInit` on `window`, with
  //     attendant warnings and possible double-mount of the widget).
  //
  function injectGoogleTranslateScripts(pageLanguage) {
    const head = document.getElementsByTagName('head')[0];
    if (!head) {
      logger.warn('\n' + 'cannot inject Google Translate scripts: <head> not found');
      return;
    }

    // gt-callback: define `googleTranslateElementInit` as a global
    // function. Must exist before gt-translate fires its callback.
    //
    const existingGtCallback = document.getElementById('gt-callback');
    if (existingGtCallback) {
      gtCallbackScript = existingGtCallback;
    } else {
      gtCallbackScript      = document.createElement('script');
      gtCallbackScript.id   = 'gt-callback';
      gtCallbackScript.text =
        'function googleTranslateElementInit() {'
        + '  new google.translate.TranslateElement('
        + '    {'
        + '      pageLanguage: "' + pageLanguage + '",'
        + '      layout: google.translate.TranslateElement.FloatPosition.TOP_LEFT'
        + '    },'
        + '    "google_translate_element"'
        + '  );'
        + '}';
      head.appendChild(gtCallbackScript);
      logger.info('\n' + 'appended Google Translate callback script: gt-callback');
    }

    // gt-translate: the loader. Once parsed, Google's code calls
    // googleTranslateElementInit which constructs the Translate
    // Element bound to #google_translate_element. The Element then
    // reads the `googtrans` cookie to decide on a target language
    // and rewrites the DOM accordingly.
    //
    const existingGtTranslate = document.getElementById('gt-translate');
    if (existingGtTranslate) {
      gtTranslateScript = existingGtTranslate;
    } else {
      gtTranslateScript     = document.createElement('script');
      gtTranslateScript.id  = 'gt-translate';
      gtTranslateScript.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      head.appendChild(gtTranslateScript);
      logger.info('\n' + 'appended Google Translate loader script: gt-translate');
    }
  }

  // claude - improve translator code using lit #3
  // Write the `googtrans` cookie that Google Translate reads to decide
  // what language to translate the page TO. Format is `/srcLang/tgtLang`
  // (with the leading slash — Google requires it; without it the
  // Translate Element ignores the cookie).
  //
  // Domain scoping mirrors the legacy adapter:
  //   - on a subdomain (e.g. blog.example.com), scope to the
  //     registrable parent (`example.com`) so the choice is shared
  //     across siblings — the user picks German once on the blog and
  //     gets German on the docs subdomain too.
  //   - on the apex domain, host-only (no `domain` attribute), which
  //     is the strictest scope and the right default.
  //
  // Uses the `Cookies` global from js-cookie, which is loaded by the
  // J1 boot sequence well before any adapter runs. The legacy adapter
  // used the same library.
  //
  function setGoogtransCookie(srcLang, targetLang, domain, isSubDomain) {
    const transCode = '/' + srcLang + '/' + targetLang;
    if (isSubDomain) {
      Cookies.set('googtrans', transCode, { domain: domain });
    } else {
      Cookies.set('googtrans', transCode);
    }
    logger.info('\n' + 'set googtrans cookie: ' + transCode
      + (isSubDomain ? ' (domain=' + domain + ')' : ' (host-only)'));
  }

  // ---------------------------------------------------------------------------
  // main
  // ---------------------------------------------------------------------------
  return {

    // -------------------------------------------------------------------------
    // adapter initializer
    // -------------------------------------------------------------------------
    init: (options) => {

      const settings = $.extend({
        module_name: 'j1.adapter.translator',
        generated:   '{{site.time}}'
      }, options);

      _this             = j1.adapter.translator;
      logger            = log4javascript.getLogger('j1.adapter.translator');
      cookie_names      = j1.getCookieNames();

      const url         = new liteURL(window.location.href);
      const hostname    = url.hostname;
      const auto_domain = hostname.substring(hostname.lastIndexOf('.', hostname.lastIndexOf('.') - 1) + 1);
      secure            = (url.protocol === 'https:');

      cookieOptions     = {{cookie_options | jsonify}};
      translatorOptions = {{translator_options | jsonify}};

      const pollStart = Date.now();
      const dependencies_met_page_ready = setInterval(() => {

        const j1CoreFinished = (j1.getState() === 'finished');

        if (!j1CoreFinished) {
          if ((Date.now() - pollStart) > READY_POLL_TIMEOUT_MS) {
            logger.error('\n' + 'j1 core did not reach state "finished" within '
              + READY_POLL_TIMEOUT_MS + 'ms; aborting Translator init');
            clearInterval(dependencies_met_page_ready);
          }
          return;
        }

        // ---------------------------------------------------------------------
        // j1 core is ready - run the one-shot initialization
        // ---------------------------------------------------------------------
        let same_site = cookieOptions.same_site;
        let expires   = cookieOptions.expires;
        let domainAttribute;

        _this.setState('started');
        logger.info('\n' + 'initializing module: started');

        if (cookieOptions.domain === 'auto') {
          domainAttribute = auto_domain;
        } else {
          domainAttribute = cookieOptions.domain;
        }

        // failsafe: if 'None' is given for samesite in non-secure
        // environments open access to cookies to subdomains
        //
        if (same_site === 'None' && !secure) {
          same_site = 'Lax';
        }

        if (translatorOptions.enabled) {
          logger.info('\n' + 'initialize core module');

          // claude - improve translator code using lit #1
          // Build the localized text content block once, here, and
          // hand it to the constructor as the `content` property.
          // translator.mjs reads it directly from the property and
          // skips the legacy XHR fetch entirely.
          //
          const translatorContent = buildModalContent(translatorOptions);

          j1.translator = new Translator({
            content:                    translatorContent,                          // localized text block (title, body, privacy, labels)
            translatorName:             translatorOptions.translatorName,           // 'google' (only supported translator currently)
            cookieConsentName:          translatorOptions.cookieConsentName,        // name of the user_consent cookie
            cookieStorageDays:          expires,                                    // lifetime of a cookie [0..365], 0: session cookie
            cookieSameSite:             same_site,
            cookieSecure:               secure,
            cookieDomain:               domainAttribute,
            translatorLocalStorageKey:  translatorOptions.translatorLocalStorageKey,
            translatorLanguagesFile:    translatorOptions.translatorLanguagesFile,
            translatorLanguagesElement: translatorOptions.translatorLanguages,      // JSON element key
            translationLanguages:       translatorOptions.translationLanguages,
            defaultLanguage:            translatorOptions.defaultLanguage,
            // claude - improve translator code using lit #4
            // Pass the page's source language down to the Lit
            // component so its "Don't translate" handler can reset
            // `translationLanguage` back to the page's native
            // language. Without this, the dropdown would keep showing
            // the last translation target (e.g. 'es') even after the
            // user opted out of translation. See `_onDisableTranslation`
            // and `_resolveResetLanguage` in translator.mjs.
            //
            siteLanguage:               siteLanguage,
            disableLanguageSelector:    translatorOptions.disableLanguageSelector,
            postSelectionCallback:      translatorOptions.postSelectionCallback     // 'j1.adapter.translator.cbGoogle'
          });

          // claude - improve translator code using lit #3
          // Returning-visitor path: the user committed a language on a
          // previous page load (or in a previous session that wrote to
          // localStorage with a long enough lifetime). The `googtrans`
          // cookie is presumably still set from then, but Google
          // Translate has not been loaded on THIS page yet — so without
          // an explicit inject here the user navigates to a new page
          // and sees it untranslated until they re-open the modal.
          //
          // The legacy adapter did this same step inline at the tail of
          // its page-ready block. Refactored into the helper here for
          // symmetry with the cbGoogle path.
          //
          // Guards:
          //   - getSettings() may return undefined on a brand-new
          //     visitor where translator.mjs has not yet seeded the
          //     localStorage payload. The `&&` chain short-circuits.
          //   - We honor the same triple-check the legacy adapter used
          //     (analysis AND personalization AND translationEnabled).
          //     translator.mjs's `_onTranslate()` forces all three on
          //     when the user clicks Translate, so this is effectively
          //     equivalent to "user has previously enabled translation
          //     and not since revoked consent in the detailed settings".
          //   - Only Google is supported as a translator backend right
          //     now; the `translatorName` guard leaves room for future
          //     backends without making this branch fire incorrectly.
          //
          const userTranslateAtInit = j1.translator.getSettings();
          if (userTranslateAtInit
              && userTranslateAtInit.analysis
              && userTranslateAtInit.personalization
              && userTranslateAtInit.translationEnabled
              && translatorOptions.translatorName === 'google') {
            logger.info('\n' + 'translation enabled in persisted settings - '
              + 'injecting Google Translate scripts for this page load');
            injectGoogleTranslateScripts(siteLanguage);
          }

        } else {
          logger.warn('\n' + 'module is disabled');
        }

        _this.setState('finished');
        logger.info('\n' + 'module initialized successfully');

        clearInterval(dependencies_met_page_ready);
      }, READY_POLL_INTERVAL_MS);
    }, // END init

    // -------------------------------------------------------------------------
    // cbGoogle()
    // callback for Translator module after the user has made his
    // selection. Receives the action string from translator.mjs:
    //   'process'   - user committed (Translate or Save)
    //   'exitOnly'  - user dismissed without committing
    // -------------------------------------------------------------------------
    cbGoogle: (cbAction) => {
      logger.info('\n' + 'entered post selection callback from Translator');
      logger.info('\n' + 'cbAction: ' + cbAction);

      if (cbAction === 'exitOnly') {
        // No-op: the user closed the modal without committing any
        // changes. Nothing to apply.
        return;
      }

      // 'process': user committed. Read the persisted translator
      // settings, then either inject the Google Translate widget or
      // reload the page to pick up the new language.
      //
      const userTranslate = j1.translator.getSettings();

      if (!userTranslate || !userTranslate.translationEnabled) {
        // User committed but ended up with translation disabled (e.g.
        // they unchecked it in the detailed Settings view and clicked
        // Save). translator.mjs has already persisted that and may
        // have cleared the googtrans cookie via its
        // `_onDisableTranslation()` path; nothing more to do here.
        //
        logger.info('\n' + 'translation disabled in persisted settings - '
          + 'nothing to inject');
        return;
      }

      if (translatorOptions.translatorName !== 'google') {
        // Defensive: only the Google backend is currently supported.
        // Other backends would have their own adapter callback wired
        // up in `translatorOptions.postSelectionCallback`.
        //
        logger.warn('\n' + 'unsupported translator backend: '
          + translatorOptions.translatorName);
        return;
      }

      // claude - improve translator code using lit #3
      // Resolve the target language. The Lit module stores the user's
      // dropdown selection under `translationLanguage` in localStorage
      // (see `_onLanguageChangeMS()` in translator.mjs). Fall back to
      // the configured default if for some reason the selection is
      // missing (a corrupted localStorage write, an older payload from
      // a previous module version, ...). The fall-back keeps cbGoogle
      // from writing an invalid cookie like `/en/undefined`.
      //
      const targetLang = userTranslate.translationLanguage
                          || translatorOptions.defaultLanguage
                          || siteLanguage;

      // claude - improve translator code using lit #3
      // Write the `googtrans` cookie. Skip the write when the user
      // picked their current page language — Google Translate would
      // either no-op or, depending on its state machine, briefly flash
      // a confused banner; safer to leave any prior cookie untouched
      // in that edge case (a separate "Disable translation" button in
      // the modal handles full opt-out).
      //
      if (targetLang && targetLang !== siteLanguage) {
        const url          = new liteURL(window.location.href);
        const hostname     = url.hostname;
        const parentDomain = hostname.substring(
          hostname.lastIndexOf('.', hostname.lastIndexOf('.') - 1) + 1
        );
        const isSubDomain  = (typeof j1.subdomain === 'function')
                              ? j1.subdomain(hostname)
                              : false;

        setGoogtransCookie(siteLanguage, targetLang, parentDomain, isSubDomain);
      } else {
        logger.info('\n' + 'target language equals site language - '
          + 'skipping googtrans cookie write');
      }

      // claude - improve translator code using lit #3
      // Two ways to actually apply the translation now:
      //
      //   - `reloadPageOnChange: true` (the legacy default): hard reload.
      //     After the reload, init() runs again, sees `translationEnabled`
      //     true in localStorage, and injects the Google Translate scripts
      //     via the returning-visitor branch above. The Translate Element
      //     then reads the `googtrans` cookie we just wrote and translates
      //     the fresh DOM. Cleanest path; no in-place DOM rewrite races.
      //
      //   - `reloadPageOnChange: false`: inject the scripts inline. Google
      //     Translate will rewrite the live DOM in place. This is faster
      //     (no full reload) but risks interfering with any other module
      //     that is mutating the DOM at the same moment. The choice is
      //     left to the site author via the YAML setting.
      //
      if (translatorOptions.reloadPageOnChange) {
        logger.info('\n' + 'reloadPageOnChange is true - reloading page');
        window.location.reload();
        return;
      }

      logger.info('\n' + 'reloadPageOnChange is false - '
        + 'injecting Google Translate scripts inline');
      injectGoogleTranslateScripts(siteLanguage);
    }, // END cbGoogle

    // -------------------------------------------------------------------------
    // messageHandler: MessageHandler for J1 google_translate module
    // Manage messages send from other J1 modules
    // -------------------------------------------------------------------------
    messageHandler: function (sender, message) {
      var json_message = JSON.stringify(message, undefined, 2);

      logText = 'received message from ' + sender + ': ' + json_message;
      logger.debug(logText);

      // -----------------------------------------------------------------------
      //  Process commands|actions
      // -----------------------------------------------------------------------
      if (message.type === 'command' && message.action === 'module_initialized') {

        //
        // Place handling of command|action here
        //

        logger.info(message.text);
      }

      //
      // Place handling of other command|action here
      //

      return true;
    }, // END messageHandler

    // -------------------------------------------------------------------------
    // setState()
    // Sets the current (processing) state of the module
    // -------------------------------------------------------------------------
    setState: function (stat) {
      _this.state = stat;
    }, // END setState

    // -------------------------------------------------------------------------
    // getState()
    // Returns the current (processing) state of the module
    // -------------------------------------------------------------------------
    getState: function () {
      return _this.state;
    } // END getState

  }; // END return

})(j1, window);

{%- endcapture -%}

{%- if production -%}
  {{ cache|minifyJS }}
{%- else -%}
  {{ cache|strip_empty_lines }}
{%- endif -%}

{%- assign cache = false -%}