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
{% assign blocks              = site.data.blocks %}
{% assign modules             = site.data.modules %}
{% assign template_config     = site.data.j1_config %}

{% comment %} Set config data
-------------------------------------------------------------------------------- {% endcomment %}
{% assign consent_defaults    = modules.defaults.cookieconsent.defaults %}
{% assign consent_settings    = modules.cookieconsent.settings %}
{% assign tracking_enabled    = template_config.analytics.enabled %}
{% assign tracking_id         = template_config.analytics.google.tracking_id %}

{% assign comment_provider    = site.data.j1_config.comments.provider %}

{% comment %} Set config options
-------------------------------------------------------------------------------- {% endcomment %}
{% assign consent_options     = consent_defaults | merge: consent_settings %}

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
'use strict';

{% comment %} Main
-------------------------------------------------------------------------------- {% endcomment %}
j1.adapter['cookieConsent'] = (function (j1, window) {

  var environment       = '{{environment}}';
  var tracking_enabled  = ('{{tracking_enabled}}' === 'true') ? true: false;
  var tracking_id       = '{{tracking_id}}';
  var tracking_id_valid = (tracking_id.includes('tracking-id')) ? false : true;
  var comment_provider  = '{{comment_provider}}';
  var moduleOptions     = {};
  var _this;
  var $modal;
  var user_cookie;
  var logger;
  var url;
  var baseUrl;
  var hostname;
  var domain;
  var cookie_domain;
  var secure;
  var logText;
  var cookie_written;
  var contentLanguage;
  var navigatorLanguage;

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
      // globals
      // -----------------------------------------------------------------------
      _this             = j1.adapter.cookieConsent;
      logger            = log4javascript.getLogger('j1.adapter.cookieConsent');
      url               = new liteURL(window.location.href);
      baseUrl           = url.origin;
      hostname          = url.hostname;
      domain            = hostname.substring(hostname.lastIndexOf('.', hostname.lastIndexOf('.') - 1) + 1);
      secure            = (url.protocol.includes('https')) ? true : false;
      contentLanguage   = '{{site.language}}';
      navigatorLanguage = navigator.language || navigator.userLanguage;

      // set domain used by cookies
      if(domain !== 'localhost') {
        cookie_domain = '.' + hostname;
      } else {
        cookie_domain = hostname;
      }

      // initialize state flag
      _this.state = 'pending';

      // -----------------------------------------------------------------------
      // Default module settings
      // -----------------------------------------------------------------------
      var settings = $.extend({
        module_name: 'j1.adapter.cookieConsent',
        generated:   '{{site.time}}'
      }, options);

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
        if ( j1.getState() === 'finished' ) {
          _this.setState('started');
          logger.info('\n' + 'state: ' + _this.getState());
          logger.info('\n' + 'module is being initialized');

          j1.cookieConsent = new BootstrapCookieConsent({
            contentURL:             moduleOptions.contentURL,                   // dialog content (modals) for all supported languages
            cookieName:             moduleOptions.cookieName,                   // name of the consent cookie
            cookieSameSite:         moduleOptions.cookieSameSite,               // restrict consent cookie
            dialogLanguage:         moduleOptions.dialogLanguage,               // language for the dialog (modal)
            whitelisted:            moduleOptions.whitelisted,                  // pages NOt dialog is shown
            reloadPageOnChange:     moduleOptions.reloadPageOnChange,           // reload if setzings has changed
            dialogContainerID:      moduleOptions.dialogContainerID,            // container, the dialog modal is (dynamically) loaded
            xhrDataElement:         moduleOptions.xhrDataElement,               // container for all language-specific dialogs (modals)
            postSelectionCallback:  function () {j1.adapter.cookieConsent.cbCookie()}
          });

          _this.setState('finished');
          logger.info('\n' + 'state: ' + _this.getState());
          logger.debug('\n' + 'module initialized successfully');
          clearInterval(dependencies_met_page_ready);
        }
      });
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
    // Called by CookieConsent module after the user has
    // made his selection (callback)
    // -------------------------------------------------------------------------
    cbCookie: function () {
      var gaCookies           = j1.findCookie('_ga');
      var j1Cookies           = j1.findCookie('j1');
      var cookie_names        = j1.getCookieNames();
      var user_state          = j1.readCookie(cookie_names.user_state);
      var user_consent        = j1.readCookie(cookie_names.user_consent);
      var user_translate      = j1.readCookie(cookie_names.user_translate);
      var json                = JSON.stringify(user_consent);
      var user_agent          = platform.ua;
      var cookie_written;

      logger.info('\n' + 'entered post selection callback from CookieConsent');
      logger.info('\n' + 'current values from CookieConsent: ' + json);

      // enable cookie button if not visible
      if ($('#quickLinksCookieButton').css('display') === 'none')  {
        $('#quickLinksCookieButton').css('display', 'block');
      }

      logger.debug('\n' + 'j1 cookies found:' + j1Cookies.length);
      j1Cookies.forEach(item => console.log('j1.core.switcher: ' + item));
      logger.debug('\n' + 'ga cookies found:' + gaCookies.length);
      gaCookies.forEach(item => console.log('j1.core.switcher: ' + item));

      if (user_agent.includes('iPad'))  {
        logger.warn('\n' + 'product detected : ' + platform.product);
        logger.warn('\n' + 'skip deleting (unwanted) cookies for this platform');
      }

      // Manage Google Analytics OptIn/Out
      // See: https://github.com/luciomartinez/gtag-opt-in/wiki
      if (tracking_enabled && tracking_id_valid) {
        GTagOptIn.register(tracking_id);
        if (user_consent.analysis)  {
          logger.info('\n' + 'enable: GA');
          GTagOptIn.optIn();
        } else {
          logger.warn('\n' + 'disable: GA');
          GTagOptIn.optOut();

          if (!user_agent.includes('iPad')) {
            gaCookies.forEach(function (item) {
              logger.warn('\n' + 'delete GA cookie: ' + item);
              j1.removeCookie({ name: item, domain: cookie_domain });
            });
          }
        }

        // Managing providers for personalization OptIn/Out (Comments|Ads)
        //
        if (!user_consent.analysis || !user_consent.personalization) {
          // expire consent|state cookies to session
          j1.expireCookie({ name: cookie_names.user_state });
          j1.expireCookie({ name: cookie_names.user_consent });
          j1.expireCookie({ name: cookie_names.user_translate });

          user_translate.translationEnabled = false;
          cookie_written = j1.writeCookie({
            name:     cookie_names.user_translate,
            data:     user_translate,
            samesite: 'Strict',
            secure:   secure
          });

        }
        if (moduleOptions.reloadPageOnChange) {
          // reload current page (skip cache)
          location.reload(true);
        }
      } else {
        // jadams, 2021-08-10: remove cookies on invalid GA config or left
        // cookies from previous session if they exists
        gaCookies.forEach(function (item) {
          logger.warn('\n' + 'delete GA cookie: ' + item);
          j1.removeCookie({ name: item, domain: cookie_domain });
        });

        // Managing providers for personalization OptIn/Out (Comments|Ads)
        //
        if (!user_consent.analysis || !user_consent.personalization) {
          // expire consent|state cookies to session
          j1.expireCookie({ name: cookie_names.user_state });
          j1.expireCookie({ name: cookie_names.user_consent });
          j1.expireCookie({ name: cookie_names.user_translate });
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
