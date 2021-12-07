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

{% assign translator_defaults = modules.defaults.translator.defaults %}
{% assign translator_settings = modules.translator.settings %}
{% assign tracking_enabled    = template_config.analytics.enabled %}

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
  var cookie_domain;
  var domain_enabled;
  var secure;
  var logText;
  var cookie_written;
  var navigator_language;
  var translation_language;
  var ddSourceLanguage;
  var head;
  var script;
  var languageList;

  // ---------------------------------------------------------------------------
  // helper functions
  // ---------------------------------------------------------------------------

  // ---------------------------------------------------------------------------
  // setCookie()
  // writes a FLAT cookie (not using an encoded JSON string)
  // ---------------------------------------------------------------------------
  function setCookie(options /*cName, cValue, expDays*/) {
    var date            = new Date();
    var timestamp_now   = date.toISOString()
    var url             = new liteURL(window.location.href);
    var baseUrl         = url.origin;;
    var hostname        = url.hostname;
    var domain          = hostname.substring(hostname.lastIndexOf('.', hostname.lastIndexOf('.') - 1) + 1);
    var domain_enabled  = '{{cookie_options.domain}}';
    var defaults        = {};
    var settings;
    var document_cookie;
    var stringifiedAttributes = '';

    defaults = {
        name: '',
        path: '/',
        expires: 0,
        domain: true,
        samesite: 'Lax',
        http_only: false,
        secure: false
    };
    settings = $.extend(defaults, options);

    stringifiedAttributes += '; ' + 'path=' + settings.path;

    if (settings.expires > 0) {
      date.setTime(date.getTime() + (settings.expires * 24 * 60 * 60 * 1000));
      stringifiedAttributes += '; ' + 'expires=' + date.toUTCString();
    }

    if (domain != hostname) {
      settings.domain = domain_enabled ? '.' + domain : hostname;
    } else {
      settings.domain = hostname;
    }
    stringifiedAttributes += '; ' + 'domain=' + settings.domain;

    stringifiedAttributes += '; ' + 'SameSite=' + settings.samesite;

    if (settings.secure) {
      stringifiedAttributes += '; ' + 'secure=' + settings.secure;
    }

    // document_cookie = settings.name + '=' + settings.data  + '; path=' + settings.path + '; ' + 'domain=' + settings.domain + '; ' + 'SameSite=' + settings.samesite + ';';
    document_cookie = settings.name + '=' + settings.data + stringifiedAttributes;

    document.cookie = document_cookie;
  };

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
      domain_enabled        = '{{cookie_options.domain}}';
      secure                = (url.protocol.includes('https')) ? true : false;
      navigator_language    = navigator.language || navigator.userLanguage;     // userLanguage for MS IE compatibility
      translation_language  = navigator_language.split('-')[0];
      cookie_names          = j1.getCookieNames();
      head                  = document.getElementsByTagName('head')[0];
      script                = document.createElement('script');
      script.id             = 'google-translate';
      script.src            = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';

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

      // -----------------------------------------------------------------------
      // initializer
      // -----------------------------------------------------------------------
      var dependencies_met_page_ready = setInterval (function (options) {
        var expires   = '{{cookie_options.expires}}';
        var same_site = '{{cookie_options.same_site}}';
        user_consent    = j1.readCookie(cookie_names.user_consent);

        // set domain used by cookies
        if (domain != hostname) {
          cookie_domain = domain_enabled ? '.' + domain : hostname;
        } else {
          cookie_domain = hostname;
        }

        // load|initialize user translate cookie
        if (j1.existsCookie(cookie_names.user_translate)) {
          user_translate = j1.readCookie(cookie_names.user_translate);
        } else {
          logger.debug('\n' + 'write to cookie : ' + cookie_names.user_translate);
          cookie_written = j1.writeCookie({
            name:     cookie_names.user_translate,
            data:     user_translate,
            samesite: 'Strict',
            secure:   secure,
            expires:  365
          });
        }

        if ( j1.getState() === 'finished' ) {
          _this.setState('started');
          logger.info('\n' + 'state: ' + _this.getState());
          logger.info('\n' + 'module is being initialized');

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
          user_translate = j1.readCookie(cookie_names.user_translate);
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
            cookieDomain:             cookie_domain,                            // set domain (hostname|domain)
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
              head.appendChild(script);
              if ($('google_translate_element')) {
                $('google_translate_element').hide();
              }
            }
          } else {
            if (moduleOptions.translatorName === 'google') {
              // remove all googtrans cookies that POTENTIALLY exists
              Cookies.remove('googtrans', { domain: cookie_domain });
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
      });
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
      var logger         = log4javascript.getLogger('j1.adapter.translator.cbGoogle');
      var cookie_names   = j1.getCookieNames();
      var user_consent   = j1.readCookie(cookie_names.user_consent);
      var user_translate = j1.readCookie(cookie_names.user_translate);
      var msDropdown     = document.getElementById('dropdownJSON').msDropdown;
      var url            = new liteURL(window.location.href);
      var baseUrl        = url.origin;;
      var hostname       = url.hostname;
      var domain         = hostname.substring(hostname.lastIndexOf('.', hostname.lastIndexOf('.') - 1) + 1);
      var domain_enabled = '{{cookie_options.domain}}';
      var same_site      = '{{cookie_options.same_site}}';

      var selectedTranslationLanguage;
      var srcLang;
      var destLang;
      var transCode;


      // set domain used by cookies
      if (domain != hostname) {
        cookie_domain = domain_enabled ? '.' + domain : hostname;
      } else {
        cookie_domain = hostname;
      }

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
        Cookies.remove('googtrans', { domain: cookie_domain });
        Cookies.remove('googtrans', { domain: hostname });
        Cookies.remove('googtrans');
        location.reload(true);
      }

      // set transCode settings
      destLang  = translation_language;
      transCode = '/' + srcLang + '/' + selectedTranslationLanguage;

      // remove all googtrans cookies that POTENTIALLY exists
      Cookies.remove('googtrans', { domain: cookie_domain });
      Cookies.remove('googtrans', { domain: hostname });
      Cookies.remove('googtrans');

      // -----------------------------------------------------------------------
      // NOTE: googtrans cookie will be rewritten (by Google!?) for
      // attributes 'SameSite' and potentially 'Domain'. This results
      // for 'SameSite' in an empty field!
      // -----------------------------------------------------------------------

      // write the googtrans cookie (w/o DOMAIN?!)
      Cookies.set('googtrans', transCode, {
        Domain:    cookie_domain,
        sameSite:  'Lax'
      });

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
