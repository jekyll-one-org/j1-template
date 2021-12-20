---
regenerate:                             true
---

{% capture cache %}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/translator.js
 # Liquid template to create the Template Adapter for J1 Translator
 #
 # Product/Info:
 # http://jekyll.one
 #
 # Copyright (C) 2021 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # For details, see https://jekyll.one
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

{% assign tracking_enabled    = modules.analytics.settings.enabled %}

{% assign translator_defaults = modules.defaults.translator.defaults %}
{% assign translator_settings = modules.translator.settings %}


{% comment %} Set config options
-------------------------------------------------------------------------------- {% endcomment %}
{% assign translator_options  = translator_defaults | merge: translator_settings %}
{% assign cookie_options      = cookie_defaults | merge: cookie_settings %}

{% assign production = false %}
{% if environment == 'prod' or environment == 'production' %}
  {% assign production = true %}
{% endif %}

/*
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/translator.js
 # JS Adapter for J1 Translate
 #
 #  Product/Info:
 #  http://jekyll.one
 #
 #  Copyright (C) 2021 Juergen Adams
 #
 #  J1 Template is licensed under MIT License.
 #  See: https://github.com/jekyll-one/J1 Template/blob/master/LICENSE
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
// https://github.com/marghoobsuleman/ms-Dropdown
// https://www.marghoobsuleman.com/image-dropdown/help
// https://www.marghoobsuleman.com/image-dropdown/advanced-help
'use strict';

{% comment %} Main
-------------------------------------------------------------------------------- {% endcomment %}
j1.adapter['translator'] = (function (j1, window) {

  var environment       = '{{environment}}';
  var tracking_enabled  = ('{{tracking_enabled}}' === 'true') ? true: false;    // Analytics/GA enabled?
  var moduleOptions     = {};
  var user_translate    = {};
  var _this;
  var $modal;
  var cookie_names;
  var user_consent;
  var logger;
  var url;
  var baseUrl;
  var hostname;
  var domain;
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
      // globals
      // -----------------------------------------------------------------------
      _this                 = j1.adapter.translator;
      logger                = log4javascript.getLogger('j1.adapter.translator');
      url                   = new liteURL(window.location.href);
      baseUrl               = url.origin;
      hostname              = url.hostname;
      domain                = hostname.substring(hostname.lastIndexOf('.', hostname.lastIndexOf('.') - 1) + 1);
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

      // -----------------------------------------------------------------------
      // Default module settings
      // -----------------------------------------------------------------------
      var settings = $.extend({
        module_name: 'j1.adapter.translator',
        generated:   '{{site.time}}'
      }, options);

      {% comment %} Load module config from yml data
      -------------------------------------------------------------------------- {% endcomment %}
      // Load  module DEFAULTS|CONFIG
      /* eslint-disable */
      moduleOptions = $.extend({}, {{translator_options | replace: '=>', ':' | replace: 'nil', '""'}});
      /* eslint-enable */

      if (typeof settings !== 'undefined') {
        moduleOptions = j1.mergeData(moduleOptions, settings);
      }

      // add GT callback script dynamically in the head section
      // -----------------------------------------------------------------------
      gtCallbackScript.text  = '';
      gtCallbackScript.text += 'function googleTranslateElementInit() {';
      gtCallbackScript.text += '  var gtAPI = new google.translate.TranslateElement({';
      gtCallbackScript.text += '    pageLanguage: "{{translator_options.contentLanguage}}",';
      gtCallbackScript.text += '    layout:       google.translate.TranslateElement.FloatPosition.TOP_LEFT';
      gtCallbackScript.text += '  },';
      gtCallbackScript.text += '  "google_translate_element");';
      gtCallbackScript.text += '  j1.adapter.translator.postTranslateElementInit(gtAPI);';
      gtCallbackScript.text += '}';
      document.head.appendChild(gtCallbackScript);

      // -----------------------------------------------------------------------
      // initializer
      // -----------------------------------------------------------------------
      var dependencies_met_page_ready = setInterval (function (options) {
        var expires       = '{{cookie_options.expires}}';
        var same_site     = '{{cookie_options.same_site}}';
        var option_domain = '{{cookie_options.domain}}';

        user_consent      = j1.readCookie(cookie_names.user_consent);

        // set domain used by cookies
        if (option_domain == 'auto') {
          domainAttribute = domain ;
        } else  {
          domainAttribute = '';
        }

        if ( j1.getState() === 'finished' ) {
          _this.setState('started');
          logger.info('\n' + 'state: ' + _this.getState());
          logger.info('\n' + 'module is being initialized');

          // load|initialize user translate cookie
          if (j1.existsCookie(cookie_names.user_translate)) {
            user_translate = j1.readCookie(cookie_names.user_translate);
          } else {
            logger.debug('\n' + 'write to cookie : ' + cookie_names.user_translate);
            cookie_written = j1.writeCookie({
              name:     cookie_names.user_translate,
              data:     user_translate,
              samesite: same_site,
              secure:   secure,
              expires:  expires
            });
          }

          // hide the google translate element if exists
          if ($('google_translate_element')) {
            $('google_translate_element').hide();
          }

          // show|hide translate button if enabled
          if (moduleOptions.hideTranslatorIcon) {
            if (!user_consent.analysis || !user_consent.personalization) {
              // disable google translate button if visible
              if ($('#quickLinksTranslateButton').css('display') === 'block')  {
                $('#quickLinksTranslateButton').css('display', 'none');
              }
            }
            if (user_consent.analysis && user_consent.personalization) {
              // enable google translate button if not visible
              if ($('#quickLinksTranslateButton').css('display') === 'none')  {
                $('#quickLinksTranslateButton').css('display', 'block');
              }
            }
          }

          // load|set user translate cookie
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
            j1.expireCookie({ name: cookie_names.user_translate });
          } else {
            logger.debug('\n' + 'write to cookie : ' + cookie_names.user_translate);
            cookie_written = j1.writeCookie({
              name:     cookie_names.user_translate,
              data:     user_translate,
              secure:   secure,
              expires:  365
            });
          }

          if (moduleOptions.dialogLanguage === 'auto') {
            moduleOptions.dialogLanguage = '{{contentLanguage}}';
          }

          j1.translator = new Translator({
            contentURL:               moduleOptions.contentURL,                 // dialog content (modals) for all supported languages
            cookieName:               cookie_names.user_translate,              // name of the translator cookie
            cookieStorageDays:        expires,                                  // lifetime of a cookie [0..365], 0: session cookie
            cookieSameSite:           same_site,                                // restrict consent cookie
            cookieDomain:             domainAttribute,                          // set domain (hostname|domain)
            cookieSecure:             secure,                                   // set
            cookieConsentName:        moduleOptions.cookieConsentName,          // the name of the Cookie Consent Cookie (secondary data)
            disableLanguageSelector:  moduleOptions.disableLanguageSelector,    // disable language dropdown for translation in dialog (modal)
            dialogContainerID:        moduleOptions.dialogContainerID,          // dest container, the dialog modal is loaded (dynamically)
            dialogLanguage:           moduleOptions.dialogLanguage,             // language for the dialog (modal)
            translationLanguage:      moduleOptions.translationLanguage,        // default language for translation
            translationLanguages:     moduleOptions.google.translationLanguages,// supported languages for translation
            translationEnabled:       moduleOptions.translationEnabled,         // run translation enabled|disabled
            translatorName:           moduleOptions.translatorName,             // translator used for translation
            xhrDataElement:           moduleOptions.xhrDataElement,             // container for all language-specific dialogs (modals)
            postSelectionCallback:    moduleOptions.google.postSelectionCallback
          });

          // enable|disable translation (after callback)
          if (user_translate.analysis && user_translate.personalization && user_translate.translationEnabled) {
            if (moduleOptions.translatorName === 'google') {
              head.appendChild(gtTranslateScript);
              if ($('google_translate_element')) {
                $('google_translate_element').hide();
              }
            }
          } else {
            if (moduleOptions.translatorName === 'google') {
              // remove all googtrans cookies that POTENTIALLY exists
              Cookies.remove('googtrans', { domain: domainAttribute });
              Cookies.remove('googtrans', { domain: hostname });
              Cookies.remove('googtrans');
            }
          }

          // -------------------------------------------------------------------
          // NOTE: Click events moved to Navigator (core)
          // -------------------------------------------------------------------

          _this.setState('finished');
          logger.info('\n' + 'state: ' + _this.getState());
          logger.debug('\n' + 'module initialized successfully');

          clearInterval(dependencies_met_page_ready);
        }
      }, 25);
    }, // END init

    // -------------------------------------------------------------------------
    // messageHandler: MessageHandler for J1 google_translate module
    // Manage messages send from other J1 modules
    // -------------------------------------------------------------------------
    messageHandler: function (sender, message) {
      var json_message = JSON.stringify(message, undefined, 2);

      logText = '\n' + 'received message from ' + sender + ': ' + json_message;
      logger.debug(logText);

      // -----------------------------------------------------------------------
      //  Process commands|actions
      // -----------------------------------------------------------------------
      if (message.type === 'command' && message.action === 'module_initialized') {
        //
        // Place handling of command|action here
        //
        logger.info('\n' + message.text);
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
    }, // END getState

    // -------------------------------------------------------------------------
    // postTranslateElementInit()
    // ???
    // -------------------------------------------------------------------------
    postTranslateElementInit: function (response) {
      // code for post processing
      logger.info('\n' + 'postTranslateElementInit entered');
      logger.info('\n' + response.T.Dh);
      return;
    }, // END postTranslateElementInit

    // -------------------------------------------------------------------------
    // cbGoogle()
    // Called by the translator CORE module after the user has made
    // the selection for a translation|language
    // -------------------------------------------------------------------------
    cbGoogle: function () {
      var logger                = log4javascript.getLogger('j1.adapter.translator.cbGoogle');
      var msDropdown            = document.getElementById('dropdownJSON').msDropdown;
//    var cookie_names          = j1.getCookieNames();
//    var user_consent          = j1.readCookie(cookie_names.user_consent);
//    var user_translate        = j1.readCookie(cookie_names.user_translate);
//    var url                   = new liteURL(window.location.href);
//    var baseUrl               = url.origin;;
//    var hostname              = url.hostname;
//    var domain                = hostname.substring(hostname.lastIndexOf('.', hostname.lastIndexOf('.') - 1) + 1);
//    var cookie_option_domain  = '{{cookie_options.domain}}';
//    var same_site             = '{{cookie_options.same_site}}';
      var srcLang;
      var destLang;
      var transCode;
      var domainAttribute;
      var selectedTranslationLanguage;

      // set domain used by cookies
      // if (cookie_option_domain == 'auto') {
      //   domainAttribute = domain ;
      // } else  {
      //   // domainAttribute = hostname;
      //   domainAttribute = '';
      // }

      selectedTranslationLanguage = msDropdown.value;
      logger.info('\n' + 'selected translation language: ' + selectedTranslationLanguage);

      // set content language
      if (moduleOptions.contentLanguage === 'auto') {
        srcLang = '{{contentLanguage}}';
      } else {
        srcLang = moduleOptions.contentLanguage;
      }

      // translation language MUST be DIFFERENT from content language
      if (srcLang == selectedTranslationLanguage ) {
        Cookies.remove('googtrans', { domain: domainAttribute });
        Cookies.remove('googtrans', { domain: hostname });
        Cookies.remove('googtrans');
        location.reload(true);
      }

      // set transCode settings
      destLang  = translation_language;
      transCode = '/' + srcLang + '/' + selectedTranslationLanguage;

      // remove all googtrans cookies that POTENTIALLY exists
      Cookies.remove('googtrans', { domain: domainAttribute });
      Cookies.remove('googtrans', { domain: hostname });
      Cookies.remove('googtrans');

      // -----------------------------------------------------------------------
      // NOTE: googtrans cookie will be rewritten (by Google!?) for
      // attributes 'SameSite' and 'Domain'. This results for 'SameSite'
      // in an empty field and two cookies (host+domain) if domain option
      // is enabled!!!
      // -----------------------------------------------------------------------
      Cookies.set('googtrans', transCode);

      // reload current page (skip cache)
      location.reload(true);
    }, // END cbGoogle

    // -------------------------------------------------------------------------
    // cbDeepl()
    // Called by the translator CORE module after the user made the
    // selection for a translation language
    // -------------------------------------------------------------------------
    cbDeepl: function () {
      var logger     = log4javascript.getLogger('j1.adapter.translator.cbDeepl');
      // code for post processing
    } // END cbDeepl

  }; // END return
})(j1, window);

{% endcapture %}
{{ cache | strip_empty_lines }}
{% assign cache = nil %}
