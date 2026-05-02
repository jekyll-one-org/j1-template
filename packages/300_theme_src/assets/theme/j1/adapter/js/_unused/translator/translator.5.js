---
regenerate:                             true
---

{%- capture cache -%}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/adapter/js/translator.js (5)
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
 # Test data:
 #  {{ liquid_var | debug }}
 # -----------------------------------------------------------------------------
{% endcomment %}

{% comment %} Liquid var initialization
-------------------------------------------------------------------------------- {% endcomment %}

{% comment %} Set config files
-------------------------------------------------------------------------------- {% endcomment %}
{% assign environment         = site.environment %}
{% assign contentLanguage     = site.language %}
{% assign blocks              = site.data.blocks %}
{% assign modules             = site.data.modules %}
{% assign template_config     = site.data.j1_config %}

{% comment %} Set config data
-------------------------------------------------------------------------------- {% endcomment %}
{% assign cookie_defaults     = modules.defaults.cookies.defaults %}
{% assign cookie_settings     = modules.cookies.settings %}
{% assign translator_defaults = modules.defaults.translator.defaults %}
{% assign translator_settings = modules.translator.settings %}

{% comment %} Set config options
-------------------------------------------------------------------------------- {% endcomment %}
{% assign cookie_options      = cookie_defaults | merge: cookie_settings %}
{% assign translator_options  = translator_defaults | merge: translator_settings %}

{% comment %} Set variables
-------------------------------------------------------------------------------- {% endcomment %}

{% comment %} Detect prod mode
-------------------------------------------------------------------------------- {% endcomment %}
{% assign production = false %}
{% if environment == 'prod' or environment == 'production' %}
  {% assign production = true %}
{% endif %}

/*
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/adapter/js/translator.js
 # JS Adapter for J1 Translate
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
*/

// -----------------------------------------------------------------------------
// ESLint shimming
// -----------------------------------------------------------------------------
/* eslint indent: "off"                                                       */
/* eslint quotes: "off"                                                       */
// -----------------------------------------------------------------------------
"use strict";

j1.adapter.translator = (function (j1, window) {

  const isDev = (j1.env === "development" || j1.env === "dev");

  var environment       = '{{environment}}';
  var user_translate    = {};

  var translatorDefaults;
  var translatorSettings;
  var translatorOptions;
  var translationFeedbackHighlight;
  var _this;
  var cookie_names;
  var user_consent;
  var siteLanguage;
  var head;
  var gtTranslateScript;
  var gtCallbackScript;

  var logger;
  var logText;

  // J1 Translator optimizations #2
  // removed dead declarations: `state`, `$modal`, `ddSourceLanguage`,
  // `languageList`, `startTime`, `endTime`, `timeSeconds`. None were assigned
  // or read anywhere in the module — `state` in particular was shadowed by
  // `_this.state` from init() onward.

  // date|time
  var startTimeModule;
  var endTimeModule;

  // ---------------------------------------------------------------------------
  // Main object
  // ---------------------------------------------------------------------------
  return {

    // -------------------------------------------------------------------------
    // Initializer
    // -------------------------------------------------------------------------
    init: function (options) {

      // -----------------------------------------------------------------------
      // Default module settings
      // -----------------------------------------------------------------------
      var settings = $.extend({
        module_name: 'j1.adapter.translator',
        generated:   '{{site.time}}'
      }, options);

      // -----------------------------------------------------------------------
      // Global variable settings
      // -----------------------------------------------------------------------
      _this                 = j1.adapter.translator;
      logger                = log4javascript.getLogger('j1.adapter.translator');

      // Load  module DEFAULTS|CONFIG
      translatorDefaults    = $.extend({}, {{translator_defaults | replace: 'nil', 'null' | replace: '=>', ':' }});
      translatorSettings    = $.extend({}, {{translator_settings | replace: 'nil', 'null' | replace: '=>', ':' }});
      translatorOptions     = $.extend(true, {}, translatorDefaults, translatorSettings);
      siteLanguage          = '{{contentLanguage}}';
//    documentLanguage      = document.documentElement.lang; 
      cookie_names          = j1.getCookieNames();
      head                  = document.getElementsByTagName('head')[0];

      // default settings
      user_translate = {
        'translatorName':           'google',
        'translationEnabled':       true,
        'analysis':                 true,
        'personalization':          true,
        'translateAllPages':        true,
        'useLanguageFromBrowser':   false,
      };

      // initialize state flag
      _this.state = 'pending';

      // add GT callback script dynamically in the head section
      // jadams, 2022-04-21: postTranslateElementInit cause error, disabled
      // -----------------------------------------------------------------------
      // J1 Translator optimizations #2
      // guard script creation/injection so a second init() (e.g. on hot
      // reload, SPA-style navigation, or any re-entry) doesn't add a second
      // <script id="gt-translate"> / <script id="gt-callback"> to <head>
      // and re-define googleTranslateElementInit on window.
      //
      var existingGtTranslate = document.getElementById('gt-translate');
      if (existingGtTranslate) {
        gtTranslateScript = existingGtTranslate;
      } else {
        gtTranslateScript      = document.createElement('script');
        gtTranslateScript.id   = 'gt-translate';
        gtTranslateScript.src  = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      }

      var existingGtCallback = document.getElementById('gt-callback');
      if (existingGtCallback) {
        gtCallbackScript = existingGtCallback;
      } else {
        gtCallbackScript       = document.createElement('script');
        gtCallbackScript.id    = 'gt-callback';

        // template literal for readability
        gtCallbackScript.text  = `
          function googleTranslateElementInit() {
            var gtAPI = new google.translate.TranslateElement({
              pageLanguage: "{{translator_options.contentLanguage}}",
              layout:       google.translate.TranslateElement.FloatPosition.TOP_LEFT
            },
            "google_translate_element");
          }
        `;

        document.head.appendChild(gtCallbackScript);
      }

      // -----------------------------------------------------------------------
      // initializer
      // -----------------------------------------------------------------------
      // J1 Translator optimizations #2
      // bound the page-ready poller. Previously, if `#content` never reached
      // `display: block` or j1.getState() never reached 'finished' (e.g. a
      // bug elsewhere in the boot sequence, an aborted navigation, an extension
      // hiding #content), this 10ms interval ran for the lifetime of the tab.
      // Cap it and log a warning so the failure mode is visible in the
      // console instead of silently burning CPU.
      //
      var dependenciesTimeout;
      var dependencies_met_page_ready = setInterval (() => {
        var pageState       = $('#content').css("display");
        var pageVisible     = (pageState === 'block');
        var j1CoreFinished  = (j1.getState() === 'finished');

        if (j1CoreFinished && pageVisible) {

          var expires       = '{{cookie_options.expires}}';
          var same_site     = '{{cookie_options.same_site}}';
          var option_domain = '{{cookie_options.domain}}';

          startTimeModule = Date.now();

          user_consent = j1.readCookie(cookie_names.user_consent);
          if (!user_consent.personalization) {
            const translateButton = '#quickLinksTranslateButton';
            $(translateButton).hide();
            return;
          }

          _this.setState('started');
          logger.debug('state: ' + _this.getState ());
          logger.info('module is being initialized');

          // load|initialize user translate data
          // J1 Translator optimizations #2
          // defensive parsing: a corrupted JSON value in localStorage (from a
          // previous failed write or browser-extension tampering) previously
          // threw a SyntaxError that aborted module init silently. Fall back
          // to the in-memory defaults and overwrite the bad value so the next
          // session starts from a clean state. Also avoids the duplicate
          // `localStorage.getItem(...)` call the original made.
          //
          var storedUserTranslate = localStorage.getItem(translatorOptions.translatorLocalStorageKey);
          if (storedUserTranslate !== null) {
            try {
              user_translate = JSON.parse(storedUserTranslate);
            } catch (e) {
              logger.warn('corrupted user_translate in localStorage, resetting to defaults: ' + e.message);
              localStorage.setItem(translatorOptions.translatorLocalStorageKey, JSON.stringify(user_translate));
            }
          } else {
            logger.debug('write to localStorage: user_translate');
            localStorage.setItem(translatorOptions.translatorLocalStorageKey, JSON.stringify(user_translate));
          }

          // J1 Translator optimizations #2
          // cache jQuery selections that are queried multiple times in this
          // block — previously each `$('#…')` call re-ran the selector engine.
          //
          var $googleTranslateElement   = $('#google_translate_element');
          var $quickLinksTranslateButton = $('#quickLinksTranslateButton');

          // hide the google translate element if exists
          if ($googleTranslateElement.length) {
            $googleTranslateElement.hide();
          }

          // show|hide translate button if enabled
          if (translatorOptions.hideTranslatorIcon) {
            if (!user_consent.analysis || !user_consent.personalization) {
              // disable google translate button if visible
              if ($quickLinksTranslateButton.css('display') === 'block')  {
                logger.info('disable quickLinksTranslateButton');
                $quickLinksTranslateButton.css('display', 'none');
              }
            }
            if (user_consent.analysis && user_consent.personalization) {
              // enable google translate button if NOT visible
              if ($quickLinksTranslateButton.css('display') === 'none')  {
                logger.info('enable quickLinksTranslateButton');
                $quickLinksTranslateButton.css('display', 'block');
              }
            }
          }

          // load|set user data
          if (!user_consent.analysis || !user_consent.personalization) {
            // disable translation service
            user_translate.translationEnabled = false;
          } else {
            // enable translation service
            user_translate.translationEnabled = true;
          }
          localStorage.setItem(translatorOptions.translatorLocalStorageKey, JSON.stringify(user_translate));

          // initialize translator core
          j1.translator = new Translator({
            cookieStorageDays:          expires,                                          // lifetime of a cookie [0..365], 0: session cookie
            cookieSameSite:             same_site,                                        // restrict consent cookie
            contentURL:                 translatorOptions.contentURL,                     // dialog content (modals) for all supported languages
            translatorLocalStorageKey:  translatorOptions.translatorLocalStorageKey,      // name of the key in localsorage for user translation data
            cookieConsentName:          translatorOptions.cookieConsentName,              // the name of the Cookie Consent Cookie (secondary data)
            disableLanguageSelector:    translatorOptions.disableLanguageSelector,        // disable language dropdown for translation in dialog (modal)
            translatorLanguagesFile:    translatorOptions.translatorLanguagesFile,
            translatorLanguages:        translatorOptions.translatorLanguages,
            dialogContainerID:          translatorOptions.dialogContainerID,              // dest container, the dialog modal is loaded (dynamically)
            translationLanguage:        translatorOptions.translationLanguage,            // default language for translation
            translationLanguages:       translatorOptions.google.translationLanguages,    // supported languages for translation
            translationEnabled:         translatorOptions.translationEnabled,             // run translation enabled|disabled
            translatorName:             translatorOptions.translatorName,                 // translator used for translation
            xhrDataElement:             translatorOptions.xhrDataElement,                 // container for all language-specific dialogs (modals)
            postSelectionCallback:      translatorOptions.postSelectionCallback           // callback to run the translation
          });

          // Sync the msDropdown language selector and button visibility
          // with the current translation state whenever the modal is shown.
          //
          // Primary source of truth: document.documentElement.lang
          // Google Translate updates the <html lang="..."> attribute when
          // it translates a page, so this reflects the actual page language
          // regardless of cookie or localStorage state.
          //
          // Button logic:
          //   - page NOT translated (docLang === siteLanguage):
          //       show "Translate", hide "Disable translation"
          //   - page IS translated (docLang !== siteLanguage):
          //       show "Disable translation", hide "Translate"
          // -------------------------------------------------------------------
          // J1 Translator optimizations #2
          // scope the dropdown-sync poller across modal-show events. The
          // previous implementation created a fresh setInterval + setTimeout
          // pair on every `shown.bs.modal`, with each pair only cleared by
          // its own (independent) timer. Two modals shown within 1s could
          // briefly run two pollers in parallel, racing to write
          // dropdownEl.msDropdown.value. By tracking the active pair on the
          // closure and cancelling them at the top of the handler, we
          // guarantee at most one in-flight poller at a time.
          //
          var activeSyncPoll    = null;
          var activeSyncTimeout = null;

          $(document).on('shown.bs.modal', function () {

            // cancel any prior poll before starting a new one
            if (activeSyncPoll) {
              clearInterval(activeSyncPoll);
              activeSyncPoll = null;
            }
            if (activeSyncTimeout) {
              clearTimeout(activeSyncTimeout);
              activeSyncTimeout = null;
            }

            // poll briefly for the msDropdown to be ready (the modal
            // content may still be rendering after the show-transition)
            // -----------------------------------------------------------------
            activeSyncPoll = setInterval(function () {
              var dropdownEl = document.getElementById('dropdownJSON');
              if (dropdownEl && dropdownEl.msDropdown) {
                clearInterval(activeSyncPoll);
                activeSyncPoll = null;
                if (activeSyncTimeout) {
                  clearTimeout(activeSyncTimeout);
                  activeSyncTimeout = null;
                }

                // read the CURRENT document language; Google Translate
                // updates <html lang="..."> to the target language
                var currentDocLang = document.documentElement.lang;
                var isTranslated   = (currentDocLang !== siteLanguage);
                var activeLang     = '';

                if (isTranslated) {
                  // page is translated – use the live document language
                  activeLang = currentDocLang;
                  logger.info('page is translated, document language: ' + currentDocLang);
                } else {
                  // page is NOT translated – default to siteLanguage
                  activeLang = siteLanguage;
                  logger.info('page is not translated, site language: ' + siteLanguage);
                }

                // sync the dropdown to the detected language
                if (activeLang) {
                  try {
                    dropdownEl.msDropdown.value = activeLang;
                    logger.info('synced dropdown to language: ' + activeLang);
                  } catch (e) {
                    logger.warn('failed to sync dropdown language: ' + e.message);
                  }
                }

                // toggle button visibility based on translation state
                var $btnDisable   = $('#translator-buttonDisableTranslation');
                var $btnTranslate = $('#translator-buttonTranslate');

                if (isTranslated) {
                  // page IS translated: show Disable, hide Translate
                  $btnDisable.show();
                  $btnTranslate.hide();
                } else {
                  // page is NOT translated: hide Disable, show Translate
                  $btnDisable.hide();
                  $btnTranslate.show();
                }
              }
            }, 100);

            // safety timeout: stop polling after 1 second
            activeSyncTimeout = setTimeout(function () {
              if (activeSyncPoll) {
                clearInterval(activeSyncPoll);
                activeSyncPoll = null;
              }
              activeSyncTimeout = null;
            }, 1000);
          });

          // hide the translation feedback
          // J1 Translator optimizations #2
          // skip injection if a prior init() already added the style node
          //
          if (!document.getElementById('translationFeedbackHighlight')) {
            translationFeedbackHighlight  = '<style id="translationFeedbackHighlight">';
            translationFeedbackHighlight += '  .VIpgJd-yAWNEb-VIpgJd-fmcmS-sn54Q {';
            translationFeedbackHighlight += '    background-color:  transparent !important;';
            translationFeedbackHighlight += '    box-shadow: none !important;';
            translationFeedbackHighlight += '  }';
            translationFeedbackHighlight += '</style>';

            $('head').append(translationFeedbackHighlight);
          }

          // enable|disable translation (after callback)
          if (user_translate.analysis && user_translate.personalization && user_translate.translationEnabled) {
            if (translatorOptions.translatorName === 'google') {
              // J1 Translator optimizations #2
              // only append the GT loader if it isn't already in <head>
              if (!gtTranslateScript.parentNode) {
                logger.info('append Google Translate Script: ' + gtTranslateScript.id);
                head.appendChild(gtTranslateScript);
              }
              if ($('#google_translate_element').length) {
                $('#google_translate_element').hide();
              }
            }
          } else if (translatorOptions.translatorName === 'google') {
            logger.info('translation disabled');
            logger.info('remove existing Google Translate cookies');
          }

          _this.setState('finished');
          logger.debug('state: ' + _this.getState());
          logger.info('module initialized successfully');

          endTimeModule = Date.now();
          logger.info('module initializing time: ' + (endTimeModule-startTimeModule) + 'ms');

          clearInterval(dependencies_met_page_ready);
          // J1 Translator optimizations #2
          // clear the safety timeout on the happy path
          //
          if (dependenciesTimeout) {
            clearTimeout(dependenciesTimeout);
            dependenciesTimeout = null;
          }
        }
      }, 10);

      // J1 Translator optimizations #2
      // safety bound paired with the 10ms poller above
      //
      dependenciesTimeout = setTimeout(function () {
        if (dependencies_met_page_ready) {
          clearInterval(dependencies_met_page_ready);
          logger.warn('translator init aborted: page-ready conditions not met within 30s');
        }
      }, 30000);

    }, // END init

    // -------------------------------------------------------------------------
    // postTranslateElementInit()
    // prepared but currently NOT actively used
    // -------------------------------------------------------------------------
    postTranslateElementInit: function (response) {
      // code for post processing
      logger.info('postTranslateElementInit entered');
      logger.info(response.T.Dh);
    }, // END postTranslateElementInit

    // -------------------------------------------------------------------------
    // cbGoogle()
    // Called by the translator CORE module after the user has made
    // the selection for a translation|language
    // -------------------------------------------------------------------------
    cbGoogle: function (option) {
      var logger            = log4javascript.getLogger('j1.adapter.translator.cbGoogle');
      var msDropdown        = document.getElementById('dropdownJSON').msDropdown;
      var url               = new liteURL(window.location.href);
      var hostname          = url.hostname;
      var domain            = hostname.substring(hostname.lastIndexOf('.', hostname.lastIndexOf('.') - 1) + 1);
      var isSubDomain       = j1.subdomain(hostname);
      var srcLang           = '{{contentLanguage}}';

      // J1 Translator optimizations #2
      // removed unused locals: `baseUrl`, `subDomain`, `domainAttribute`.
      // None were read after assignment.
      //
      var transCode;
      var selectedTranslationLanguage;

      // button 'Do nothing' clicked
      if (option === 'exitOnly') {
        return;
      }

      selectedTranslationLanguage = msDropdown.value;
      logger.info('selected translation language: ' + selectedTranslationLanguage);

      // read localStorage once at the top
      // J1 Translator optimizations #2
      // guard against missing/corrupted localStorage. JSON.parse(null)
      // returns null, and JSON.parse(<invalid>) throws — both crashed the
      // `user_translate.translationEnabled` access below with a TypeError
      // before the user's selection could be acted on. Fall back to whatever
      // user_translate currently holds at module scope (defaults from init)
      // so the language switch still works on a fresh browser profile or
      // after storage corruption.
      //
      var stored = localStorage.getItem(translatorOptions.translatorLocalStorageKey);
      if (stored !== null) {
        try {
          user_translate = JSON.parse(stored);
        } catch (e) {
          logger.warn('corrupted user_translate in localStorage, using defaults: ' + e.message);
        }
      }

      // disabled translation
      if (!user_translate.translationEnabled) {
        logger.info(`translation disabled for language: ${user_translate.translationLanguage}`);
        location.reload();

        // added missing 'return' after location.reload() - without it,
        // JS execution continues synchronously past the reload into the
        // code below        
        return;
      }

      // restructured control flow to fix unreachable code.
      // -----------------------------------------------------------------------
      // Previously all three if/else-if/else branches ended with return or
      // location.reload(), making the cookie-setting and language-saving
      // code below them dead code that could never execute. The googtrans
      // cookie was therefore never written and the selected language was
      // never persisted.
      //
      // The corrected logic:
      //   1. selected language differs from source AND is not the default
      //      → set the googtrans cookie, save the selection, reload
      //   2. selected language IS the default → do nothing
      //   3. selected language equals the source → reset to source, return
      //
      // -----------------------------------------------------------------------
      // translation language MUST be DIFFERENT from default language
      if (srcLang !== selectedTranslationLanguage && selectedTranslationLanguage !== translatorOptions.defaultLanguage) {
        // set transCode settings for Google Translate cookie
        // J1 Translator optimizations #2
        // previously the cookie was set TWICE on a subdomain — once unscoped
        // (host-only) and again with `domain: <parent>` — leaving two
        // googtrans cookies in the jar that the browser then sent together,
        // with last-write-wins resolution depending on path/order. Set it
        // once with the right scope: domain-scoped on a subdomain so the
        // value is shared with the parent and any sibling subdomains, and
        // host-only otherwise.
        //
        transCode = '/' + srcLang + '/' + selectedTranslationLanguage;
        Cookies.set('googtrans', transCode, isSubDomain ? { domain: domain } : {});

        // save selected translation language to localStorage for dropdown
        // sync after page reload
        user_translate.translationLanguage = selectedTranslationLanguage;
        localStorage.setItem(translatorOptions.translatorLocalStorageKey, JSON.stringify(user_translate));
        logger.info('saved translation language to localStorage: ' + selectedTranslationLanguage);

        // reload current page to apply translation
        location.reload();
      } else if (selectedTranslationLanguage === translatorOptions.defaultLanguage) {
        return;
      } else {
        // reset translation language in localStorage to content language
        user_translate.translationLanguage = srcLang;
        localStorage.setItem(translatorOptions.translatorLocalStorageKey, JSON.stringify(user_translate));
        logger.info('reset translation language in localStorage to: ' + srcLang);
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