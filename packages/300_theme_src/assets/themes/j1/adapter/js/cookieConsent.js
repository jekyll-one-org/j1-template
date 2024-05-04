---
regenerate:                             true
---

{%- capture cache -%}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/cookieConsent.js
 # Liquid template to create the Template Adapter for J1 CookieConsent
 #
 # Product/Info:
 # http://jekyll.one
 #
 # Copyright (C) 2023, 2024 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # For details, see: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 # -----------------------------------------------------------------------------
 # Test data:
 #  {{ liquid_var | debug }}
 # cookie_options: {{ cookie_options | debug }}
 # -----------------------------------------------------------------------------
{% endcomment %}

{% comment %} Liquid var initialization
-------------------------------------------------------------------------------- {% endcomment %}

{% comment %} Set config files
-------------------------------------------------------------------------------- {% endcomment %}
{% assign environment         = site.environment %}
{% assign blocks              = site.data.blocks %}
{% assign modules             = site.data.modules %}
{% assign template_config     = site.data.j1_config %}

{% comment %} Set config data
-------------------------------------------------------------------------------- {% endcomment %}
{% assign cookie_defaults     = modules.defaults.cookies.defaults %}
{% assign cookie_settings     = modules.cookies.settings %}
{% assign consent_defaults    = modules.defaults.cookieconsent.defaults %}
{% assign consent_settings    = modules.cookieconsent.settings %}
{% assign analytics_defaults  = modules.defaults.analytics.defaults %}
{% assign analytics_settings  = modules.analytics.settings %}

{% comment %} Set config options
-------------------------------------------------------------------------------- {% endcomment %}
{% assign consent_options     = consent_defaults | merge: consent_settings %}
{% assign cookie_options      = cookie_defaults | merge: cookie_settings %}
{% assign analytics_options   = analytics_defaults | merge: analytics_settings %}

{% comment %} Set variables
-------------------------------------------------------------------------------- {% endcomment %}
{% assign tracking_enabled    = analytics_options.enabled %}
{% assign tracking_id         = analytics_options.google.trackingID %}

{% comment %} Detect prod mode
-------------------------------------------------------------------------------- {% endcomment %}
{% assign production = false %}
{% if environment == 'prod' or environment == 'production' %}
  {% assign production = true %}
{% endif %}

/*
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/cookieConsent.js
 # JS Adapter for J1 CookieConsent
 #
 #  Product/Info:
 #  http://jekyll.one
 #
 #  Copyright (C) 2023, 2024 Juergen Adams
 #
 #  J1 Theme is licensed under MIT License.
 #  See: https://github.com/jekyll-one/J1 Theme/blob/master/LICENSE
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
'use strict';
j1.adapter.cookieConsent = ((j1, window) => {
  var environment           = '{{environment}}';
  var tracking_enabled      = ('{{tracking_enabled}}' === 'true') ? true: false;
  var tracking_id           = '{{tracking_id}}';
  var tracking_id_valid     = (tracking_id.includes('tracking-id')) ? false : true;
  var stringifiedAttributes = '';
  var state                 = 'not_started';

  var expireCookiesOnRequiredOnly;

  var cookieDefaults;
  var cookieSettings;
  var cookieOptions;

  var cookieConsentDefaults;
  var cookieConsentSettings;
  var cookieConsentOptions;

  var $modal;
  var cookie_names;
  var user_cookie;
  var url;
  var baseUrl;
  var hostname;
  var auto_domain;
  var check_cookie_option_domain;
  var cookie_domain;
  var secure;
  var cookie_written;
  var contentLanguage;
  var navigatorLanguage;
  var domainAttribute;

  var logger;
  var logText;
  var _this;

  // date|time
  var startTime;
  var endTime;
  var startTimeModule;
  var endTimeModule;
  var timeSeconds;

  // ---------------------------------------------------------------------------
  // helper functions
  // ---------------------------------------------------------------------------
  // NOTE: RegEx for tracking_id: ^(G|UA|YT|MO)-[a-zA-Z0-9-]+$
  // See: https://stackoverflow.com/questions/20411767/how-to-validate-google-analytics-tracking-id-using-a-javascript-function/20412153

  // ---------------------------------------------------------------------------
  // main
  // ---------------------------------------------------------------------------
  return {

    // -------------------------------------------------------------------------
    // adapter initializer
    // -------------------------------------------------------------------------
    init: (options) => {

      // -----------------------------------------------------------------------
      // default module settings
      // -----------------------------------------------------------------------
      var settings = $.extend({
        module_name: 'j1.adapter.cookieConsent',
        generated:   '{{site.time}}'
      }, options);

      // -----------------------------------------------------------------------
      // global variable settings
      // -----------------------------------------------------------------------
      _this             = j1.adapter.cookieConsent;
      logger            = log4javascript.getLogger('j1.adapter.cookieConsent');
      cookie_names      = j1.getCookieNames();
      url               = new liteURL(window.location.href);
      baseUrl           = url.origin;
      hostname          = url.hostname;
      auto_domain       = hostname.substring(hostname.lastIndexOf('.', hostname.lastIndexOf('.') - 1) + 1);
      secure            = (url.protocol.includes('https')) ? true : false;
      contentLanguage   = '{{site.language}}';
      navigatorLanguage = navigator.language || navigator.userLanguage;

      // Load cookie DEFAULTS|CONFIG
      cookieDefaults    = $.extend({}, {{cookie_defaults | replace: 'nil', 'null' | replace: '=>', ':' }});
      cookieSettings    = $.extend({}, {{cookie_settings | replace: 'nil', 'null' | replace: '=>', ':' }});
      cookieOptions     = $.extend(true, {}, cookieDefaults, cookieSettings);

      // Load  module DEFAULTS|CONFIG
      cookieConsentDefaults = $.extend({}, {{consent_defaults | replace: 'nil', 'null' | replace: '=>', ':' }});
      cookieConsentSettings = $.extend({}, {{consent_settings | replace: 'nil', 'null' | replace: '=>', ':' }});
      cookieConsentOptions  = $.extend(true, {}, cookieConsentDefaults, cookieConsentSettings);

      if (navigatorLanguage.indexOf("-") !== -1) {
        navigatorLanguage = navigatorLanguage.split("-")[0];
      }

      if (cookieConsentOptions.dialogLanguage === 'auto') {
        cookieConsentOptions.dialogLanguage = navigatorLanguage;
      } else if (cookieConsentOptions.dialogLanguage === 'content') {
        cookieConsentOptions.dialogLanguage = contentLanguage;
      } else {
        cookieConsentOptions.dialogLanguage = navigatorLanguage;
      }

      check_cookie_option_domain  = (cookieOptions.domain === 'false') ? false : true;
      expireCookiesOnRequiredOnly = (cookieOptions.expireCookiesOnRequiredOnly === 'true') ? true: false;

      // -----------------------------------------------------------------------
      // module initializer
      // -----------------------------------------------------------------------
      var dependencies_met_page_ready = setInterval((options) => {
        var pageState      = $('#content').css("display");
        var pageVisible    = (pageState === 'block') ? true : false;
        var j1CoreFinished = (j1.getState() === 'finished') ? true : false;

        if (j1CoreFinished) {
          var same_site = cookieOptions.same_site;
          var expires;

          startTimeModule = Date.now();

          _this.setState('started');
          logger.debug('\n' + 'set module state to: ' + _this.getState());
          logger.info('\n' + 'initializing module: started');

          if (cookieConsentOptions.enabled) {
            expires = cookieOptions.expires;
          } else {
            // expire permanent cookies to session
            j1.expireCookie({ name: cookie_names.user_state });
            j1.expireCookie({ name: cookie_names.user_consent });
            j1.expireCookie({ name: cookie_names.user_translate });

            // disable the themes menus
            $('#themes_menu').css('display', 'none');
            $('#themes_mmenu').css('display', 'none');
            logger.warn('\n' + 'disable module: Themes');

            // disable the quick link for (Google) Translation
            $('#quickLinksTranslateButton').css('display', 'none');
            logger.warn('\n' + 'disable module: Trranslator');
          }

          // set domain used by cookies
          if (check_cookie_option_domain) {
            if (cookieOptions.domain === 'auto') {
              domainAttribute = auto_domain;
              stringifiedAttributes += '; ' + 'Domain=' + domainAttribute;
            } else  {
              domainAttribute = cookieOptions.domain;
              stringifiedAttributes += '; ' + 'Domain=' + domainAttribute;
            }
          } else {
            domainAttribute = cookieOptions.domain;
          }

          // failsafe: if 'None' is given for samesite in non-secure
          // environments open access to cookies to subdomains
          // ---------------------------------------------------------------------
          if (same_site === 'None' && !secure) {
            same_site = 'Lax';
          }

          // -------------------------------------------------------------------
          // NOTE: Click events moved to Navigator (core)
          // -------------------------------------------------------------------

          if (cookieConsentOptions.enabled) {
            logger.info('\n' + 'initialize core module');

            j1.cookieConsent = new CookieConsent ({
              contentURL:             cookieConsentOptions.contentURL,          // dialog content (modals) for all supported languages
              cookieName:             cookie_names.user_consent,                // name of the consent cookie
              cookieStorageDays:      expires,                                  // lifetime of a cookie [0..365], 0: session cookie
              cookieSameSite:         same_site,                                // restrict consent cookie
              cookieSecure:           secure,                                   // only sent to the server with an encrypted request over HTTPS
              cookieDomain:           domainAttribute,                          // set domain (hostname|domain)
              dialogLanguage:         cookieConsentOptions.dialogLanguage,      // language for the dialog (modal)
              whitelisted:            cookieConsentOptions.whitelisted,         // pages NO cookie dialog is shown
              reloadPageOnChange:     cookieConsentOptions.reloadPageOnChange,  // reload if setzings has changed
              dialogContainerID:      cookieConsentOptions.dialogContainerID,   // container, the dialog modal is (dynamically) loaded
              xhrDataElement:         cookieConsentOptions.xhrDataElement,      // container for all language-specific dialogs (modals)
              postSelectionCallback:  cookieConsentOptions.postSelectionCallback, // callback function, called after the user has made his selection
            });
          } else {
            logger.warn('\n' + 'module is disabled');
          } // END if cookieConsentOptions enabled

          _this.setState('finished');
          logger.debug('\n' + 'state: ' + _this.getState());
          logger.info('\n' + 'module initialized successfully');

          endTimeModule = Date.now();
          logger.info('\n' + 'module initializing time: ' + (endTimeModule-startTimeModule) + 'ms');

          clearInterval(dependencies_met_page_ready);
        } // END  j1CoreFinished
      }, 10); // END dependencies_met_page_ready
    }, // END init

    // -------------------------------------------------------------------------
    // cbCookie()
    // callback for CookieConsent module after the user has
    // made his selection
    // -------------------------------------------------------------------------
    cbCookie: () => {
      var url             = new liteURL(window.location.href);
      var hostname        = url.hostname;
      var gaCookies       = j1.findCookie('_ga');
      var gasCookies      = j1.findCookie('__ga');
      var j1Cookies       = j1.findCookie('j1');
      var cookie_names    = j1.getCookieNames();
      var user_state      = j1.readCookie(cookie_names.user_state);
      var user_consent    = j1.readCookie(cookie_names.user_consent);
      var user_translate  = j1.readCookie(cookie_names.user_translate);
      var json            = JSON.stringify(user_consent);
      var user_agent      = platform.ua;
      var cookie_written;

      logger.info('\n' + 'entered post selection callback from CookieConsent');
      logger.info('\n' + 'current values from CookieConsent: ' + json);

      // enable cookie button if not visible
      if ($('#quickLinksCookieButton').css('display') === 'none')  {
        $('#quickLinksCookieButton').css('display', 'block');
      }

      // manage Google Analytics OptIn/Out
      // See: https://github.com/luciomartinez/gtag-opt-in/wiki
      if (tracking_enabled && tracking_id_valid) {
        // Managing cookie life-time
        // ---------------------------------------------------------------------
        // If cookie settings allows only "required" cookies, all "persistent"
        // cookies (Comments|Ads|Translation) get expired to "session" for
        // better GDPR compliance. The GDPR regulations does NOT require
        // any consent on session-only cookies.
        //
        if (!user_consent.analysis || !user_consent.personalization) {

          // overload cookie consent settings
          user_translate.analysis           = user_consent.analysis;
          user_translate.personalization    = user_consent.personalization;
          // disable translation service
          user_translate.translationEnabled = false;

          cookie_written = j1.writeCookie({
            name:     cookie_names.user_translate,
            data:     user_translate,
            secure:   secure
          });

          // expire permanent cookies to session
          // -------------------------------------------------------------------
          j1.expireCookie({ name: cookie_names.user_state });
          j1.expireCookie({ name: cookie_names.user_consent });
          j1.expireCookie({ name: cookie_names.user_translate });
        }
        if (cookieConsentOptions.reloadPageOnChange) {
          // reload current page (skip cache)
          location.reload(true);
        }
      } else {
        // failsafe: Make (really) sure the all GA|GAS cookies removed
        // left from a previous session/page view for better privacy compliance
        // ---------------------------------------------------------------------

        // remove cookies on invalid GA config or left from a previous
        // session/page view if they exists
        // ---------------------------------------------------------------------
        gaCookies.forEach((item) => {
          logger.warn('\n' + 'delete GA cookie: ' + item);
          j1.removeCookie({ name: item });
        });

        // remove cookies on invalid GAS config or left from a previous
        // session/page view if they exists
        // ---------------------------------------------------------------------
        gasCookies.forEach((item) => {
          // Remove cookies from Google Ads
          logger.warn('\n' + 'delete GAS cookie: ' + item);
          j1.removeCookie({
            name: item
          });
        });

        // managing cookie life-time. If cookie settings allows only
        // "required" cookies, all "persistent" cookies (Comments|Ads|Translation)
        // get expired to "session" for better GDPR compliance. The GDPR
        // regulations|privacy does NOT require any consent on using cookies
        // for session-only cookies.
        // ---------------------------------------------------------------------
        if (!user_consent.analysis || !user_consent.personalization) {
          // overload cookie consent settings
          user_translate.analysis           = user_consent.analysis;
          user_translate.personalization    = user_consent.personalization;
          // disable translation service
          user_translate.translationEnabled = false;

          cookie_written = j1.writeCookie({
            name:   cookie_names.user_translate,
            data:   user_translate,
            secure: secure
          });

          if (expireCookiesOnRequiredOnly) {
            // expire permanent cookies to session
            j1.expireCookie({ name: cookie_names.user_state });
            j1.expireCookie({ name: cookie_names.user_consent });
            j1.expireCookie({ name: cookie_names.user_translate });
          }
        }

        if (cookieConsentOptions.reloadPageOnChange) {
          // reload current page (skip cache)
          location.reload(true);
        }
      } // END if tracking_enabled
    }, // END cbCookie

    // -------------------------------------------------------------------------
    // messageHandler()
    // manage messages send from other J1 modules
    // -------------------------------------------------------------------------
    messageHandler: (sender, message) => {
      var json_message = JSON.stringify(message, undefined, 2);

      logText = '\n' + 'received message from ' + sender + ': ' + json_message;
      logger.debug(logText);

      // -----------------------------------------------------------------------
      //  process commands|actions
      // -----------------------------------------------------------------------
      if (message.type === 'command' && message.action === 'module_initialized') {

        //
        // place handling of command|action here
        //

        logger.info('\n' + message.text);
      }

      //
      // place handling of other command|action here
      //

      return true;
    }, // END messageHandler

    // -------------------------------------------------------------------------
    // setState()
    // sets the current (processing) state of the module
    // -------------------------------------------------------------------------
    setState: (stat) => {
      _this.state = stat;
    }, // END setState

    // -------------------------------------------------------------------------
    // getState()
    // Returns the current (processing) state of the module
    // -------------------------------------------------------------------------
    getState: () => {
      return _this.state;
    } // END getState

  }; // END main (return)
})(j1, window);

{%- endcapture -%}

{%- if production -%}
  {{ cache|minifyJS }}
{%- else -%}
  {{ cache|strip_empty_lines }}
{%- endif -%}

{%- assign cache = false -%}
