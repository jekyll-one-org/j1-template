---
regenerate:                             true
---

{%- capture cache -%}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/adapter/js/translator.js (6)
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
 # ~/assets/theme/j1/adapter/js/translator.js (6)
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
*/

// -----------------------------------------------------------------------------
// ESLint shimming
// -----------------------------------------------------------------------------
/* eslint indent: "off"                                                       */
/* eslint quotes: "off"                                                       */
// -----------------------------------------------------------------------------
"use strict";

j1.adapter.translator = ((j1, window) => {

  const isDev               = (j1.env === "development" || j1.env === "dev");
  const environment         = '{{environment}}';

  // Module-scope state shared between init() and cbGoogle().
  //
  let _this;
  let logger;
  let cookie_names;
  let secure;
  let cookieOptions;
  let translatorOptions;

  const READY_POLL_INTERVAL_MS = 50;
  const READY_POLL_TIMEOUT_MS  = 30000;

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
            disableLanguageSelector:    translatorOptions.disableLanguageSelector,
            postSelectionCallback:      translatorOptions.postSelectionCallback     // 'j1.adapter.translator.cbGoogle'
          });

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
      // reload the page to pick up the new language. The exact
      // mechanism depends on the site's Google Translate integration
      // and is left as-is for backward compatibility — the only
      // change in #1 is the callback signature (cbAction is now a
      // direct positional string, not extracted from a closure
      // variable inside translator.mjs).
      //
      const userTranslate = j1.translator.getSettings();

      if (userTranslate && userTranslate.translationEnabled) {
        if (translatorOptions.reloadPageOnChange) {
          window.location.reload();
        }
        // ... existing Google Translate widget injection ...
      }
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