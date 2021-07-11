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

  var environment       = '{{environment}}';
  var tracking_enabled  = ('{{tracking_enabled}}' === 'true') ? true: false;
  var tracking_id       = '{{tracking_id}}';
  var tracking_id_valid = (tracking_id.includes('tracking-id')) ? false : true;
  var moduleOptions     = {};
  var _this;
  var $modal;
  var user_cookie;
  var logger;
  var logText;

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
      var dependencies_met_page_ready = setInterval (function (options) {
        if ( j1.getState() === 'finished' ) {
          _this.setState('started');
          logger.info('state: ' + _this.getState());
          logger.info('module is being initialized');

          j1.cookieConsent = new BootstrapCookieConsent({
            contentURL:             moduleOptions.contentURL,
            cookieName:             moduleOptions.cookieName,
            language:               moduleOptions.language,
            whitelisted:            moduleOptions.whitelisted,
            reloadPageOnChange:     moduleOptions.reloadPageOnChange,
            xhr_data_element:       moduleOptions.xhr_data_element + '-' + moduleOptions.language,
            postSelectionCallback:  function () {j1.adapter.cookieConsent.cbCookie()}
          });

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
    // Called by CookieConsent module after the user has
    // made his selection (callback)
    // -------------------------------------------------------------------------
    cbCookie: function () {
      var gaCookies           = j1.findCookie('_ga');
      var user_state          = j1.readCookie('j1.user.state');
      var user_consent        = j1.readCookie('j1.user.consent');
      var json                = JSON.stringify(user_consent);
      var user_agent          = platform.ua;

      logger.info('Entered post selection callback from CookieConsent');
      logger.info('Current values from CookieConsent: ' + json);

      // enable cookie button if not visible
      if ($('#quickLinksCookieButton').css('display') === 'none')  {
        $('#quickLinksCookieButton').css('display', 'block');
      }

      // jadams, 2021-07-11: moded to j1 adapter (displayPage)
      //
      // NOTE: Warning needs to be moved to another module
      // because page is reloaded after selection
      //
      // if (tracking_enabled && !tracking_id_valid) {
      //   logger.error('tracking enabled, but invalid tracking id found: ' + tracking_id);
      // } else {
      //   logger.warn('tracking enabled, tracking id found: ' + tracking_id);
      // }

      // for development only
      if (environment === 'development') {
        gaCookies.forEach(item => console.log('cookieConsent: ' + item));
      }

      if (user_agent.includes('iPad'))  {
        logger.warn('Product detected : ' + platform.product);
        logger.warn('Skip deleting (unwanted) cookies for this platform');
      }

      // Manage Google Analytics OptIn/Out
      // See: https://github.com/luciomartinez/gtag-opt-in/wiki
      if (tracking_enabled && tracking_id_valid) {
        GTagOptIn.register(tracking_id);
        if (user_consent.analyses)  {
          logger.info('Enable: GA');
          GTagOptIn.optIn();
        } else {
          logger.warn('Disable: GA');
          GTagOptIn.optOut();

          if (!user_agent.includes('iPad')) {
            gaCookies.forEach(function (item) {
              logger.warn('Delete GA cookie: ' + item);
              j1.removeCookie({name: item, path: '/'});
            });
          }
        }

        if (!user_consent.analyses || !user_consent.personalization)  {
          // expire consent|state cookies to session
          j1.writeCookie({
            name:     'j1.user.state',
            data:     user_state,
            samesite: 'Strict'
          });
          j1.writeCookie({
            name:     'j1.user.consent',
            data:     user_consent,
            samesite: 'Strict'
          });
        }

        if (moduleOptions.reloadPageOnChange)  {
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
