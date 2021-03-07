---
regenerate:                             true
---

{% capture cache %}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/cookie_consent.js
 # Liquid template to adapt CookieConsent Core functions
 #
 # Product/Info:
 # http://jekyll.one
 #
 # Copyright (C) 2021 Juergen Adams
 #
 # J1 CookieConsent is licensed under the MIT License.
 # For details, see https://jekyll.one
 # -----------------------------------------------------------------------------
 # Test data:
 #  {{ liquid_var | debug }}
 # -----------------------------------------------------------------------------
{% endcomment %}

{% comment %} Liquid procedures
-------------------------------------------------------------------------------- {% endcomment %}
{% capture select_color %}themes/{{site.template.name}}/procedures/global/select_color.proc{% endcapture %}

{% comment %} Set global settings
-------------------------------------------------------------------------------- {% endcomment %}
{% assign environment       = site.environment %}
{% assign template_version  = site.version %}

{% assign production = false %}
{% if environment == 'prod' or environment == 'production' %}
  {% assign production = true %}
{% endif %}

{% comment %} Process YML config data
================================================================================ {% endcomment %}

{% comment %} Set config files
-------------------------------------------------------------------------------- {% endcomment %}
{% assign template_config   = site.data.j1_config %}
{% assign blocks            = site.data.blocks %}
{% assign modules           = site.data.modules %}

{% comment %} Set config data
-------------------------------------------------------------------------------- {% endcomment %}
{% assign consent_defaults  = modules.defaults.cookie_consent.defaults %}
{% assign consent_settings  = modules.cookie_consent.settings %}

{% comment %} Set config options
-------------------------------------------------------------------------------- {% endcomment %}
{% assign consent_options   = consent_defaults | merge: consent_settings %}

/*
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/cookie_consent.js
 # JS Adapter for J1 Cookie Consent module
 #
 # Product/Info:
 # http://jekyll.one
 #
 # Copyright (C) 2021 Juergen Adams
 #
 # J1 Cookie Consent is licensed under the MIT License.
 # For details, see https://jekyll.one
 # -----------------------------------------------------------------------------
 #  Adapter generated: {{site.time}}
 # -----------------------------------------------------------------------------
*/

// -----------------------------------------------------------------------------
// ESLint shimming
// -----------------------------------------------------------------------------
/* eslint indent: "off"                                                       */
// -----------------------------------------------------------------------------
'use strict';

j1.adapter['cookie_consent'] = (function (j1, window) {

  // ---------------------------------------------------------------------------
  // globals loader
  // ---------------------------------------------------------------------------
  var cookie_consent = {
    'cookies_accepted': 'pending'
  };
  var environment               = '{{environment}}';
  var cookie_names              = j1.getCookieNames();
  var user_state_name           = cookie_names.user_state;
  var user_state_exists         = j1.existsCookie(user_state_name);
  var moduleOptions             = {};
  var user_session              = {};
  var _this;
  var logger;
  var logText;

  // ---------------------------------------------------------------------------
  // main object
  // ---------------------------------------------------------------------------
  return {

    // -------------------------------------------------------------------------
    // module initializer
    // -------------------------------------------------------------------------
    init: function (options) {
      // initialize state flag
      j1.adapter.cookie_consent.state = 'pending';

      // -----------------------------------------------------------------------
      // defaults loader
      // -----------------------------------------------------------------------
      var settings = $.extend({
        module_name: 'j1.adapter.cookie_consent',
        generated:   '{{site.time}}'
      }, options);

      _this             = j1.adapter.cookie_consent;
      logger            = log4javascript.getLogger('j1.adapter.cookie_consent');

      // TODO:
      //    CHECK how|what module should initialize the user_state
      //    cookie. For now disabled here, because cookie is too early
      //    written. Cause corrupted|imcomplete cookie content if cookie
      //    does NOT exists already.

      // cookie_consent    = j1.existsCookie(user_state_name) ?
      //                       j1.readCookie(user_state_name) :
      //                       j1.writeCookie({
      //                         name:     user_state_name,
      //                         data:     cookie_consent,
      //                         expires:  365
      //                       });

      // -----------------------------------------------------------------------
      // options loader
      // -----------------------------------------------------------------------
      /* eslint-disable */
      moduleOptions = $.extend({}, {{consent_options | replace: '=>', ':' | replace: 'nil', '""'}});
      /* eslint-enable */

      if (typeof options !== 'undefined') {
        moduleOptions = j1.mergeData(moduleOptions, settings);
      }

      if (moduleOptions.enabled) {
        _this.setState('started');
        logger.info('state: ' + _this.getState());
        logger.info('module is being initialized');

        if (j1.existsCookie(user_state_name)) {
          cookie_consent                      = j1.readCookie(user_state_name);
          cookie_consent.deleteOnDecline      = moduleOptions.delete_cookies_on_decline;
          cookie_consent.showConsentOnPending = moduleOptions.show_consent_on_pending;
          cookie_consent.whitelistedPages     = moduleOptions.whitelisted_pages;
          cookie_consent.stopScrolling        = moduleOptions.stop_scrolling;

          // Update cookie consent
          // TODO: MAKE expiery date configurable

          // j1.writeCookie({
          //   name:    user_state_name,
          //   data:    cookie_consent,
          //   expires: cookie_consent.live_span
          // });

          j1.writeCookie({
            name:    user_state_name,
            data:    cookie_consent,
            expires: 365
          });
        }

        // ---------------------------------------------------------------------
        // data loader
        // ---------------------------------------------------------------------
        $.when (
          j1.xhrData('j1.adapter.cookie_consent', moduleOptions, 'data_loaded')
        )
        .then (function (success) {
          if (success) {
            logger.info('loading data completed');

            // -----------------------------------------------------------------
            // core initializer
            // -----------------------------------------------------------------
            var dependencies_met_cookie_consent_core = setInterval(function() {
              if (_this.getState() == 'data_loaded') {
                _this.setState('processing');

                j1.core.cookie_consent.init ({
                  deleteOnDecline:      moduleOptions.delete_on_decline,
                  showConsentOnPending: moduleOptions.show_consent_on_pending,
                  whitelistedPages:     moduleOptions.whitelisted_pages,
                  stopScrolling:        moduleOptions.stop_scrolling,
                  policyButton:         moduleOptions.buttons['policy_button'],
                  acceptButton:         moduleOptions.buttons['accept_button'],
                  declineButton:        moduleOptions.buttons['decline_button']
                });
                _this.setState('initialized');
                logger.info('state: ' + _this.getState());
                logger.info('core module initialized');
                clearInterval(dependencies_met_cookie_consent_core);
              }
            }, 25);

            // -----------------------------------------------------------------
            // event handler
            // -----------------------------------------------------------------
            var dependencies_events = setInterval(function() {
              if (_this.getState() == 'initialized') {
                _this.setState('processing');

                j1.core.cookie_consent.eventHandler(cookie_consent);
                _this.setState('finished');
                logger.info('state: ' + _this.getState());
                clearInterval(dependencies_events);
              }
            }, 25);
          } else {
            _this.setState('finished');
            logger.info('state: ' + _this.getState());
            logger.warn('loading data failed');
          }
        });
      } else {
        _this.setState('finished');
        logger.info('state: ' + _this.getState());
        logger.warn('module disabled');
      }

      return true;
    }, // END init

    // -------------------------------------------------------------------------
    // messageHandler:
    // Manage messages send from other modules
    // -------------------------------------------------------------------------
    messageHandler: function (sender, message) {
      var json_message = JSON.stringify(message, undefined, 2);

      logText = 'received message from ' + sender + ': ' + json_message;
      logger.info(logText);

      // -----------------------------------------------------------------------
      //  Process commands if send as a message
      // -----------------------------------------------------------------------
      if (message.type === 'command' && message.action === 'state_final') {
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
    //  Set the current (processing) state of the module
    // -------------------------------------------------------------------------
    setState: function (stat) {
      j1.adapter.cookie_consent.state = stat;
    }, // END setState

    // -------------------------------------------------------------------------
    //  Returns the current (processing) state of the module
    // -------------------------------------------------------------------------
    getState: function () {
      return j1.adapter.cookie_consent.state;
    } // END state

  }; // END return
})(j1, window);

{% endcapture %}
{% if production %}
  {{ cache | minifyJS }}
{% else %}
  {{ cache | strip_empty_lines }}
{% endif %}
{% assign cache = nil %}
