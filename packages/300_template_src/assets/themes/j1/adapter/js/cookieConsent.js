---
regenerate:                             true
---

{% capture cache %}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/cookieConsent.js
 # Liquid template to create the Template Adapter for J1 CookieConsent
 #
 # Product/Info:
 # http://jekyll.one
 #
 # Copyright (C) 2022 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # For details, see https://jekyll.one
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
 #  Copyright (C) 2022 Juergen Adams
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
'use strict';
j1.adapter.cookieConsent = (function (j1, window) {
  var environment                 = '{{environment}}';
  var tracking_enabled            = ('{{tracking_enabled}}' === 'true') ? true: false;
  var tracking_id                 = '{{tracking_id}}';
  var tracking_id_valid           = (tracking_id.includes('tracking-id')) ? false : true;
  var expireCookiesOnRequiredOnly = ('{{cookie_options.expireCookiesOnRequiredOnly}}' === 'true') ? true: false;
  var moduleOptions               = {};
  var _this;
  var $modal;
  var cookie_names;
  var user_cookie;
  var logger;
  var url;
  var baseUrl;
  var hostname;
  var auto_domain;
  var cookie_option_domain;
  var cookie_domain;
  var secure;
  var logText;
  var cookie_written;
  var contentLanguage;
  var navigatorLanguage;
  var domainAttribute;

  // NOTE: RegEx for tracking_id: ^(G|UA|YT|MO)-[a-zA-Z0-9-]+$
  // See: https://stackoverflow.com/questions/20411767/how-to-validate-google-analytics-tracking-id-using-a-javascript-function/20412153

  // ---------------------------------------------------------------------------
  // Helper functions
  // ---------------------------------------------------------------------------

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
        module_name: 'j1.adapter.cookieConsent',
        generated:   '{{site.time}}'
      }, options);

      // -----------------------------------------------------------------------
      // Global variable settings
      // -----------------------------------------------------------------------
      _this                 = j1.adapter.cookieConsent;
      logger                = log4javascript.getLogger('j1.adapter.cookieConsent');
      cookie_names          = j1.getCookieNames();
      url                   = new liteURL(window.location.href);
      baseUrl               = url.origin;
      hostname              = url.hostname;
      auto_domain           = hostname.substring(hostname.lastIndexOf('.', hostname.lastIndexOf('.') - 1) + 1);
      cookie_option_domain  = ('{{cookie_options.domain}}' === 'true');
      secure                = (url.protocol.includes('https')) ? true : false;
      contentLanguage       = '{{site.language}}';
      navigatorLanguage     = navigator.language || navigator.userLanguage;

      // initialize state flag
      _this.state = 'pending';

      {% comment %} Load module config from yml data
      -------------------------------------------------------------------------- {% endcomment %}
      // Load  module DEFAULTS|CONFIG
      /* eslint-disable */
      moduleOptions = $.extend({}, {{consent_options | replace: '=>', ':' | replace: 'nil', '""'}});
      /* eslint-enable */

      if (typeof settings !== 'undefined') {
        moduleOptions = j1.mergeData(moduleOptions, settings);
      }

      if (moduleOptions.dialogLanguage === 'auto') {
        moduleOptions.dialogLanguage = navigatorLanguage;
      } else if (moduleOptions.dialogLanguage === 'content') {
        moduleOptions.dialogLanguage = contentLanguage;
      }

      // -----------------------------------------------------------------------
      // initializer
      // -----------------------------------------------------------------------
      var dependencies_met_page_ready = setInterval (function (options) {
        var expires     = '{{cookie_options.expires}}';
        var same_site   = '{{cookie_options.same_site}}';

        // // set domain used by cookies
        // if (cookie_option_domain == 'auto') {
        //   domainAttribute = domain ;
        // } else  {
        //   domainAttribute = '';
        // }

        // set domain used by cookies
        if (cookie_option_domain) {
          if (cookie_option_domain == 'auto') {
            domainAttribute = auto_domain;
            stringifiedAttributes += '; ' + 'Domain=' + domainAttribute;
          } else if (cookie_option_domain)  {
            domainAttribute = domain;
            stringifiedAttributes += '; ' + 'Domain=' + domainAttribute;
          }
        }

        // Failsafe: if 'None' is given for samesite in non-secure
        // environments open access to cookies to subdomains
        // ---------------------------------------------------------------------
        if (same_site == 'None' && !secure) {
          same_site = 'Lax';
        }

        if ( j1.getState() === 'finished' ) {
          _this.setState('started');
          logger.info('\n' + 'state: ' + _this.getState());
          logger.info('\n' + 'module is being initialized');

          j1.cookieConsent = new CookieConsent ({
            contentURL:             moduleOptions.contentURL,                   // dialog content (modals) for all supported languages
            cookieName:             cookie_names.user_consent,                  // name of the consent cookie
            cookieStorageDays:      expires,                                    // lifetime of a cookie [0..365], 0: session cookie
            cookieSameSite:         same_site,                                  // restrict consent cookie
            cookieSecure:           secure,                                     // only sent to the server with an encrypted request over HTTPS
            cookieDomain:           domainAttribute,                            // set domain (hostname|domain)
            dialogLanguage:         moduleOptions.dialogLanguage,               // language for the dialog (modal)
            whitelisted:            moduleOptions.whitelisted,                  // pages NOt dialog is shown
            reloadPageOnChange:     moduleOptions.reloadPageOnChange,           // reload if setzings has changed
            dialogContainerID:      moduleOptions.dialogContainerID,            // container, the dialog modal is (dynamically) loaded
            xhrDataElement:         moduleOptions.xhrDataElement,               // container for all language-specific dialogs (modals)
            postSelectionCallback:  moduleOptions.postSelectionCallback,        // callback function, called after the user has made his selection
          });

          _this.setState('finished');
          logger.info('\n' + 'state: ' + _this.getState());
          logger.debug('\n' + 'module initialized successfully');

          // -------------------------------------------------------------------
          // NOTE: Click events moved to Navigator (core)
          // -------------------------------------------------------------------

          clearInterval(dependencies_met_page_ready);
        }
      }, 25);
    }, // END init

    // -------------------------------------------------------------------------
    // messageHandler: MessageHandler for J1 CookieConsent module
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
    // cbCookie()
    // Called (callback) by CookieConsent module after the user has
    // made his selection
    // -------------------------------------------------------------------------
    cbCookie: function () {
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

      // Manage Google Analytics OptIn/Out
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
          user_translate.analysis         = user_consent.analysis;
          user_translate.personalization  = user_consent.personalization;
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
        if (moduleOptions.reloadPageOnChange) {
          // reload current page (skip cache)
          location.reload(true);
        }
      } else {
        // Failsafe: Make (really) sure the all GA|GAS cookies removed
        // left from a previous session/page view for better privacy compliance
        // ---------------------------------------------------------------------

        // remove cookies on invalid GA config or left from a previous
        // session/page view if they exists
        // ---------------------------------------------------------------------
        gaCookies.forEach(function (item) {
          logger.warn('\n' + 'delete GA cookie: ' + item);
          if (hostname == 'localhost') {
            j1.removeCookie({ name: item, domain: false, secure: false });
          } else {
            j1.removeCookie({ name: item, domain: '.' + hostname, secure: false });
          }
        });

        // remove cookies on invalid GAS config or left from a previous
        // session/page view if they exists
        // ---------------------------------------------------------------------
        gasCookies.forEach(function (item) {
          // Remove cookies from Google Ads
          logger.warn('\n' + 'delete GAS cookie: ' + item);
          if (hostname == 'localhost') {
            j1.removeCookie({ name: item, domain: false, secure: false });
          } else {
            j1.removeCookie({ name: item, domain: '.' + hostname, secure: false });
          }
        });

        // Managing cookie life-time. If cookie settings allows only
        // "required" cookies, all "persistent" cookies (Comments|Ads|Translation)
        // get expired to "session" for better GDPR compliance. The GDPR
        // regulations|privacy does NOT require any consent on using cookies
        // for session-only cookies.
        // ---------------------------------------------------------------------
        if (!user_consent.analysis || !user_consent.personalization) {
          // overload cookie consent settings
          user_translate.analysis         = user_consent.analysis;
          user_translate.personalization  = user_consent.personalization;
          // disable translation service
          user_translate.translationEnabled = false;

          cookie_written = j1.writeCookie({
            name:     cookie_names.user_translate,
            data:     user_translate,
            secure:   secure
          });

          if (expireCookiesOnRequiredOnly) {
            // expire permanent cookies to session
            j1.expireCookie({ name: cookie_names.user_state });
            j1.expireCookie({ name: cookie_names.user_consent });
            j1.expireCookie({ name: cookie_names.user_translate });
          }
        }

        if (moduleOptions.reloadPageOnChange) {
          // reload current page (skip cache)
          location.reload(true);
        }
      } // END if tracking_enabled
    } // END cbCookie

  }; // END return
})(j1, window);

{% endcapture %}
{{ cache | strip_empty_lines }}
{% assign cache = nil %}
