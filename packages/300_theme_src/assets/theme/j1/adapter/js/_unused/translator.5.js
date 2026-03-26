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
 # ~/assets/theme/j1/adapter/js/translator.js (5)
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
  var state             = 'not_started';
  var user_translate    = {};

  var translatorDefaults;
  var translatorSettings;
  var translatorOptions;
  var translationFeedbackHighlight;
  var _this;
  var $modal;
  var cookie_names;
  var user_consent;
  var siteLanguage;
  var ddSourceLanguage;
  var head;
  var gtTranslateScript;
  var gtCallbackScript;
  var languageList;

  var logger;
  var logText;

  // date|time
  var startTime;
  var endTime;
  var startTimeModule;
  var endTimeModule;
  var timeSeconds;

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
      gtTranslateScript      = document.createElement('script');
      gtTranslateScript.id   = 'gt-translate';
      gtTranslateScript.src  = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
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

      // -----------------------------------------------------------------------
      // initializer
      // -----------------------------------------------------------------------
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
          if (localStorage.getItem(translatorOptions.translatorLocalStorageKey) !== null) {
            user_translate = JSON.parse(localStorage.getItem(translatorOptions.translatorLocalStorageKey));
          } else {
            logger.debug ('write to localStorage: user_translate');
            localStorage.setItem(translatorOptions.translatorLocalStorageKey, JSON.stringify(user_translate));
          }

          // hide the google translate element if exists
          if ($('#google_translate_element').length) {
            $('#google_translate_element').hide();
          }

          // show|hide translate button if enabled
          if (translatorOptions.hideTranslatorIcon) {
            if (!user_consent.analysis || !user_consent.personalization) {
              // disable google translate button if visible
              if ($('#quickLinksTranslateButton').css('display') === 'block')  {
                logger.info('disable quickLinksTranslateButton');
                $('#quickLinksTranslateButton').css('display', 'none');
              }
            }
            if (user_consent.analysis && user_consent.personalization) {
              // enable google translate button if NOT visible
              if ($('#quickLinksTranslateButton').css('display') === 'none')  {
                logger.info('enable quickLinksTranslateButton');
                $('#quickLinksTranslateButton').css('display', 'block');
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
          $(document).on('shown.bs.modal', function () {

            // poll briefly for the msDropdown to be ready (the modal
            // content may still be rendering after the show-transition)
            // -----------------------------------------------------------------
            var syncPoll = setInterval(function () {
              var dropdownEl = document.getElementById('dropdownJSON');
              if (dropdownEl && dropdownEl.msDropdown) {
                clearInterval(syncPoll);

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
            setTimeout(function () {
              clearInterval(syncPoll);
            }, 1000);
          });

          // hide the translation feedback
          translationFeedbackHighlight  = '<style id="translationFeedbackHighlight">';
          translationFeedbackHighlight += '  .VIpgJd-yAWNEb-VIpgJd-fmcmS-sn54Q {';
          translationFeedbackHighlight += '    background-color:  transparent !important;';
          translationFeedbackHighlight += '    box-shadow: none !important;';
          translationFeedbackHighlight += '  }';
          translationFeedbackHighlight += '</style>';

          $('head').append(translationFeedbackHighlight);

          // enable|disable translation (after callback)
          if (user_translate.analysis && user_translate.personalization && user_translate.translationEnabled) {
            if (translatorOptions.translatorName === 'google') {
              logger.info('append Google Translate Script: ' + gtTranslateScript.id);
              head.appendChild(gtTranslateScript);
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
        }
      }, 10);

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
      var baseUrl           = url.origin;
      var hostname          = url.hostname;
      var domain            = hostname.substring(hostname.lastIndexOf('.', hostname.lastIndexOf('.') - 1) + 1);
      var subDomain         = '.' + domain;
      var isSubDomain       = j1.subdomain(hostname);
      var domainAttribute   = '';
      var srcLang           = '{{contentLanguage}}';

      var transCode;
      var selectedTranslationLanguage;

      // button 'Do nothing' clicked
      if (option === 'exitOnly') {
        return;
      }

      selectedTranslationLanguage = msDropdown.value;
      logger.info('selected translation language: ' + selectedTranslationLanguage);

      // read localStorage once at the top
      user_translate = JSON.parse(localStorage.getItem(translatorOptions.translatorLocalStorageKey));

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
        transCode = '/' + srcLang + '/' + selectedTranslationLanguage;
        Cookies.set('googtrans', transCode);

        if (isSubDomain) {
          Cookies.set('googtrans', transCode, { domain: domain });
        }

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