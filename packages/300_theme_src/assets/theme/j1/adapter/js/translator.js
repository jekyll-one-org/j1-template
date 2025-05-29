---
regenerate:                             true
---

{%- capture cache -%}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/adapter/js/translator.js
 # Liquid template to create the Template Adapter for J1 Translator
 #
 # Product/Info:
 # http://jekyll.one
 #
 # Copyright (C) 2023-2025 Juergen Adams
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
 #  Copyright (C) 2023-2025 Juergen Adams
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
// https://github.com/EdwardBalaj/Simple-DeepL-API-Integration
// https://www.javatpoint.com/how-to-add-google-translate-button-on-your-webpage
// https://gist.github.com/ab007shetty/28e99707734db32a6e881e4d245d42f7
// https://github.com/marghoobsuleman/ms-Dropdown
// https://www.marghoobsuleman.com/image-dropdown/help
// https://www.marghoobsuleman.com/image-dropdown/advanced-help
"use strict";

j1.adapter.translator = (function (j1, window) {

  const isDev = (j1.env === "development" || j1.env === "dev") ? true : false;

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
  var logger;
  var url;
  var baseUrl;
  var hostname;
  var domain;
  var subDomain;
  var isSubDomain;
  var cookie_option_domain;
  var secure;
  var logText;
  var cookie_written;
  var navigator_language;
  var translation_language;
  var ddSourceLanguage;
  var head;
  var gtTranslateScript;
  var gtCallbackScript;
  var languageList;
  var domainAttribute;

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
      translatorDefaults    = $.extend({},   {{translator_defaults | replace: 'nil', 'null' | replace: '=>', ':' }});
      translatorSettings    = $.extend({},   {{translator_settings | replace: 'nil', 'null' | replace: '=>', ':' }});
      translatorOptions     = $.extend(true, {}, translatorDefaults, translatorSettings);
      url                   = new liteURL(window.location.href);
      baseUrl               = url.origin;
      hostname              = url.hostname;
      domain                = hostname.substring(hostname.lastIndexOf('.', hostname.lastIndexOf('.') - 1) + 1);
      subDomain             = '.' + domain;
      isSubDomain           = j1.subdomain(hostname);
      secure                = (url.protocol.includes('https')) ? true : false;
      navigator_language    = navigator.language || navigator.userLanguage;     // userLanguage for MS IE compatibility
      translation_language  = navigator_language.split('-')[0];
      cookie_names          = j1.getCookieNames();
      head                  = document.getElementsByTagName('head')[0];
      gtTranslateScript     = document.createElement('script');
      gtTranslateScript.id  = 'gt-translate';
      gtTranslateScript.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      gtCallbackScript      = document.createElement('script');
      gtCallbackScript.id   = 'gt-callback';

      user_translate = {
        'translatorName':           'google',
        'translationEnabled':       false,
        'analysis':                 true,
        'personalization':          true,
        'translateAllPages':        true,
        'useLanguageFromBrowser':   true,
        'translationLanguage':      translation_language,
      };

      // initialize state flag
      _this.state = 'pending';

      // add GT callback script dynamically in the head section
      // jadams, 2022-04-21: postTranslateElementInit cause error, disabled
      // -----------------------------------------------------------------------
      gtCallbackScript.text  = '\n';
      gtCallbackScript.text += 'function googleTranslateElementInit() {' + '\n';
      gtCallbackScript.text += '  var gtAPI = new google.translate.TranslateElement({' + '\n';
      gtCallbackScript.text += '    pageLanguage: "{{translator_options.contentLanguage}}",' + '\n';
      gtCallbackScript.text += '    layout:       google.translate.TranslateElement.FloatPosition.TOP_LEFT' + '\n';
      gtCallbackScript.text += '  },' + '\n';
      gtCallbackScript.text += '  "google_translate_element");' + '\n';
      gtCallbackScript.text += '}' + '\n';
      document.head.appendChild(gtCallbackScript);

      // -----------------------------------------------------------------------
      // initializer
      // -----------------------------------------------------------------------
      var dependencies_met_page_ready = setInterval (() => {
        var pageState       = $('#content').css("display");
        var pageVisible     = (pageState == 'block') ? true: false;
        var j1CoreFinished  = (j1.getState() == 'finished') ? true : false;
        // var atticFinished   = (j1.adapter.attic.getState() == 'finished') ? true : false;

        if (j1CoreFinished && pageVisible) {

          var expires       = '{{cookie_options.expires}}';
          var same_site     = '{{cookie_options.same_site}}';
          var option_domain = '{{cookie_options.domain}}';

          user_consent = j1.readCookie(cookie_names.user_consent);
          if (!user_consent.personalization) {
            const translateButton = '#quickLinksTranslateButton';
            $(translateButton).hide();
            return;
          }

          // set domain used by cookies
          //
          if (option_domain == 'auto') {
            domainAttribute = domain ;
          } else  {
            domainAttribute = '';
          }

          _this.setState('started');
          logger.debug('state: ' + _this.getState ());
          logger.info('module is being initialized');

          // load|initialize user translate cookie
          //
          if (j1.existsCookie(cookie_names.user_translate)) {
            user_translate = j1.readCookie(cookie_names.user_translate);
          } else {
            logger.debug ('write to cookie : ' + cookie_names.user_translate);
            cookie_written = j1.writeCookie({
              name:     cookie_names.user_translate,
              data:     user_translate,
              samesite: same_site,
              secure:   secure,
              expires:  expires
            });
          }

          // hide the google translate element if exists
          //
          if ($('google_translate_element')) {
            $('google_translate_element').hide();
          }

          // show|hide translate button if enabled
          //
          if (translatorOptions.hideTranslatorIcon) {
            if (!user_consent.analysis || !user_consent.personalization) {
              // disable google translate button if visible
              //
              if ($('#quickLinksTranslateButton').css('display') === 'block')  {
                logger.info('disable quickLinksTranslateButton');
                $('#quickLinksTranslateButton').css('display', 'none');
              }
            }
            if (user_consent.analysis && user_consent.personalization) {
              // enable google translate button if NOT visible
              //
              if ($('#quickLinksTranslateButton').css('display') === 'none')  {
                logger.info('enable quickLinksTranslateButton');
                $('#quickLinksTranslateButton').css('display', 'block');
              }
            }
          }

          // load|set user translate cookie
          //
          user_consent = j1.readCookie(cookie_names.user_consent);
          if (!user_consent.analysis || !user_consent.personalization) {
            // disable translation service
            user_translate.translationEnabled = false;
            cookie_written = j1.writeCookie({
              name:     cookie_names.user_translate,
              data:     user_translate,
              secure:   secure
            });

            // expire permanent cookie to session
            //
            j1.expireCookie({ name: cookie_names.user_translate });
          } else {
            logger.debug('write to cookie : ' + cookie_names.user_translate);
            cookie_written = j1.writeCookie({
              name:     cookie_names.user_translate,
              data:     user_translate,
              secure:   secure,
              expires:  365
            });
          }

          if (translatorOptions.dialogLanguage === 'auto') {
            translatorOptions.dialogLanguage = '{{contentLanguage}}';
          }

          j1.translator = new Translator({
            contentURL:               translatorOptions.contentURL,                     // dialog content (modals) for all supported languages
            cookieName:               cookie_names.user_translate,                      // name of the translator cookie
            cookieStorageDays:        expires,                                          // lifetime of a cookie [0..365], 0: session cookie
            cookieSameSite:           same_site,                                        // restrict consent cookie
            cookieDomain:             domainAttribute,                                  // set domain (hostname|domain)
            cookieSecure:             secure,                                           // set secure
            cookieConsentName:        translatorOptions.cookieConsentName,              // the name of the Cookie Consent Cookie (secondary data)
            disableLanguageSelector:  translatorOptions.disableLanguageSelector,        // disable language dropdown for translation in dialog (modal)
            translatorLanguagesFile:  translatorOptions.translatorLanguagesFile,
            translatorLanguages:      translatorOptions.translatorLanguages,
            dialogContainerID:        translatorOptions.dialogContainerID,              // dest container, the dialog modal is loaded (dynamically)
            dialogLanguage:           translatorOptions.dialogLanguage,                 // language for the dialog (modal)
            translationLanguage:      translatorOptions.translationLanguage,            // default language for translation
            translationLanguages:     translatorOptions.google.translationLanguages,    // supported languages for translation
            translationEnabled:       translatorOptions.translationEnabled,             // run translation enabled|disabled
            translatorName:           translatorOptions.translatorName,                 // translator used for translation
            xhrDataElement:           translatorOptions.xhrDataElement,                 // container for all language-specific dialogs (modals)
            postSelectionCallback:    translatorOptions.google.postSelectionCallback    // prepared but currently NOT actively used
          });

          // hide the translation feedback
          //
          translationFeedbackHighlight  = '<style id="translationFeedbackHighlight">';
          translationFeedbackHighlight += '  .VIpgJd-yAWNEb-VIpgJd-fmcmS-sn54Q {';
          translationFeedbackHighlight += '    background-color:  transparent !important;';
          translationFeedbackHighlight += '    box-shadow: none !important;;';
          translationFeedbackHighlight += '  }';
          translationFeedbackHighlight += '</style>';

          $('head').append(translationFeedbackHighlight);

          // enable|disable translation (after callback)
          if (user_translate.analysis && user_translate.personalization && user_translate.translationEnabled) {
            if (translatorOptions.translatorName === 'google') {
              logger.info('append Google Translate Script: ' + gtTranslateScript.id);
              head.appendChild(gtTranslateScript);
              if ($('google_translate_element')) {
                $('google_translate_element').hide();
              }
            }
          } else {
            if (translatorOptions.translatorName === 'google') {
              logger.info('translation disabled');
              logger.info('remove existing Google Translate cookies');

              // remove all googtrans cookies that POTENTIALLY exists
              //
              Cookies.remove('googtrans', { domain: domainAttribute });
              Cookies.remove('googtrans', { domain: subDomain });
              Cookies.remove('googtrans', { domain: hostname });
              Cookies.remove('googtrans');
            }
          }

          // -------------------------------------------------------------------
          // NOTE: Click events moved to Navigator (core)
          // -------------------------------------------------------------------

          _this.setState('finished');
          logger.debug('state: ' + _this.getState());
          logger.info('module initialized successfully');

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

      return;
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
      var srcLang;
      var destLang;
      var transCode;
      var selectedTranslationLanguage;

      // set domain used by cookies
      // if (cookie_option_domain == 'auto') {
      //   domainAttribute = domain ;
      // } else  {
      //   // domainAttribute = hostname;
      //   domainAttribute = '';
      // }

      // button 'Do nothing' clicked
      //
      if (option === 'exitOnly') {
        return;
      }

      selectedTranslationLanguage = msDropdown.value;
      logger.info('selected translation language: ' + selectedTranslationLanguage);

      // set content language
      //
      if (translatorOptions.contentLanguage === 'auto') {
        srcLang = '{{contentLanguage}}';
      } else {
        srcLang = translatorOptions.contentLanguage;
      }

      // translation language MUST be DIFFERENT from content language
      //
      if (srcLang == selectedTranslationLanguage ) {
        // remove all googtrans cookies that POTENTIALLY exists
        //
        Cookies.remove('googtrans', { domain: domainAttribute });
        Cookies.remove('googtrans', { domain: subDomain });
        Cookies.remove('googtrans', { domain: hostname });
        Cookies.remove('googtrans');
        location.reload();
      }

      // set transCode settings
      //
      destLang  = translation_language;
      transCode = '/' + srcLang + '/' + selectedTranslationLanguage;

      // remove all googtrans cookies that POTENTIALLY exists
      //
      Cookies.remove('googtrans', { domain: domainAttribute });
      Cookies.remove('googtrans', { domain: subDomain });
      Cookies.remove('googtrans', { domain: hostname });
      Cookies.remove('googtrans');

      // set googtrans cookie for all sites
      //
      Cookies.set('googtrans', transCode);

      // -----------------------------------------------------------------------
      // NOTE: googtrans cookie will be rewritten (by Google!?) for
      // attributes 'SameSite' and 'Domain'. This results for 'SameSite'
      // in an empty field and two cookies (host+domain) if domain option
      // is enabled!!!
      // -----------------------------------------------------------------------
      if (isSubDomain) {
        Cookies.set('googtrans', transCode, { domain: domain });
      }

      // reload current page
      location.reload();

    }, // END cbGoogle

    // -------------------------------------------------------------------------
    // cbDeepl()
    // Called by the translator CORE module after the user made the
    // selection for a translation language
    // -------------------------------------------------------------------------
    cbDeepl: function () {
      var logger     = log4javascript.getLogger('j1.adapter.translator.cbDeepl');

      //
      // place code for processing here
      //

    }, // END cbDeepl

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
