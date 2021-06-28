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
{% assign modules             = site.data.modules %}

{% comment %} Set config data
-------------------------------------------------------------------------------- {% endcomment %}
{% assign consent_defaults    = modules.defaults.cookieconsent.defaults %}
{% assign consent_settings    = modules.cookieconsent.settings %}
{% assign tracking_id         = site.data.j1_config.analytics.google.tracking_id %}

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
 #  https://shaack.com
 #  http://jekyll.one
 #
 #  Copyright (C) 2020 Stefan Haack
 #  Copyright (C) 2021 Juergen Adams
 #
 #  bootstrap-cookie-banner is licensed under MIT License.
 #  See: https://github.com/shaack/bootstrap-cookie-banner/blob/master/LICENSE
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
--------------------------------------------------------------- {% endcomment %}
j1.adapter['cookieConsent'] = (function (j1, window) {

  var environment   = '{{environment}}';
  var moduleOptions = {};
  var _this;
  var $modal;
  var logger;
  var logText;
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
      _this   = j1.adapter.cookieConsent;
      logger  = log4javascript.getLogger('j1.adapter.cookieConsent');

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

      // -----------------------------------------------------------------------
      // initializer
      // -----------------------------------------------------------------------
      _this.setState('started');
      logger.info('state: ' + _this.getState());
      logger.info('module is being initialized');

      j1.cookieConsent = new BootstrapCookieConsent({
        contentURL:             moduleOptions.contentURL,
        cookieName:             moduleOptions.cookieName,
        language:               moduleOptions.language,
        whitelisted:            moduleOptions.whitelisted,
        reloadPageOnChange:     moduleOptions.reloadCurrentPage,
        xhr_data_element:       moduleOptions.xhr_data_element + '-' + moduleOptions.language,
        postSelectionCallback:  function () {
            j1.adapter.cookieConsent.cbCookie()
        }
      });

      var dependencies_met_page_ready = setInterval (function (options) {
        if ( j1.cookieConsent && j1.getState() === 'finished' ) {
          _this.setState('finished');
          logger.info('state: ' + _this.getState());
          logger.debug('module initialized successfully');
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
    }, // END getState

    // -------------------------------------------------------------------------
    // cbCookie()
    // Callback function called by CookieConsent module after the user has
    // made his selection
    // -------------------------------------------------------------------------
    // TODO:
    // If ONLY required setting selected, make j1.user.consent
    // a SESSION cookie!!!
    // -------------------------------------------------------------------------
    cbCookie: function () {
      logger.info('Entered post selection callback from CookieConsent');
      var user_cookie = j1.readCookie('j1.user.consent');
      var json = JSON.stringify(user_cookie);
      logger.info('Current values from CookieConsent: ' + json);

      // Manage Google Analytics OptIn/Out
      // See: https://github.com/luciomartinez/gtag-opt-in/wiki
      GTagOptIn.register('{{tracking_id}}');
      if (user_cookie.analyses)  {
        logger.info('Google Analytics: enabled');
        GTagOptIn.optIn();
      } else {
        logger.warn('Google Analytics: disabled');
        GTagOptIn.optOut();
      }

      // enable cookie button if not visible
      //
      if ($('#quickLinksCookieButton').css('display') === 'none')  {
        $('#quickLinksCookieButton').css('display', 'block');
      }

      // location.reload() // reload after selection

    } // END cbCookie

  }; // END return
})(j1, window);

{% endcapture %}
{{ cache | strip_empty_lines }}
{% assign cache = nil %}
