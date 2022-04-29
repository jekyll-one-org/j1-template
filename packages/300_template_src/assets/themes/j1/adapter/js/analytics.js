---
regenerate:                             true
---

{% capture cache %}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/analytics.js
 # Liquid template to adapt the Analytics module
 #
 # Product/Info:
 # https://jekyll.one
 # Copyright (C) 2022 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # For details, see: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE.md
 # -----------------------------------------------------------------------------
 # Test data:
 #  {{ liquid_var | debug }}
 #  analytics_options:  {{ analytics_options | debug }}
 # -----------------------------------------------------------------------------
{% endcomment %}

{% comment %} Liquid procedures
-------------------------------------------------------------------------------- {% endcomment %}

{% comment %} Set global settings
-------------------------------------------------------------------------------- {% endcomment %}
{% assign environment       = site.environment %}
{% assign asset_path        = "/assets/themes/j1" %}

{% comment %} Process YML config data
================================================================================ {% endcomment %}

{% comment %} Set config files
-------------------------------------------------------------------------------- {% endcomment %}
{% assign template_config    = site.data.j1_config %}
{% assign blocks             = site.data.blocks %}
{% assign modules            = site.data.modules %}

{% comment %} Set config data (settings only)
-------------------------------------------------------------------------------- {% endcomment %}
{% assign analytics_defaults = modules.defaults.analytics.defaults %}
{% assign analytics_settings = modules.analytics.settings %}

{% comment %} Set config options (settings only)
-------------------------------------------------------------------------------- {% endcomment %}
{% assign analytics_options  = analytics_defaults | merge: analytics_settings %}

{% comment %} Variables
-------------------------------------------------------------------------------- {% endcomment %}
{% assign analytics          = analytics_options.enabled %}
{% assign analytics_provider = analytics_options.provider %}

{% assign production = false %}
{% if environment == 'prod' or environment == 'production' %}
  {% assign production = true %}
{% endif %}

/*
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/analytics.js
 # J1 Adapter for the analytics module
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2022 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # For details, see: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE.md
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
j1.adapter.analytics = (function (j1, window) {

{% comment %} Set global variables
-------------------------------------------------------------------------------- {% endcomment %}
var url             = new liteURL(window.location.href);
var hostname        = url.hostname;
var environment     = '{{environment}}';
var gaScript        = document.createElement('script');
var providerID      = '{{analytics_options.google.trackingID}}';
var skipAllHosts    = '{{analytics_options.google.skipAllHosts}}';
var validProviderID = (providerID.includes('your')) ? false : true;
var optInOut        = {{analytics_options.google.optInOut}};
var anonymizeIP     = {{analytics_options.google.anonymizeIP}};
var cookie_names    = j1.getCookieNames();
var date            = new Date();
var timestamp_now   = date.toISOString();
var skipHost        = false;
var skipHosts;
var gaCookies;
var user_consent;
var gaExists;
var _this;
var logger;
var logText;

  // ---------------------------------------------------------------------------
  // Main object
  // ---------------------------------------------------------------------------
  return {

    // -------------------------------------------------------------------------
    // init()
    // adapter initializer
    // -------------------------------------------------------------------------
    init: function (options) {

    {% if analytics %}
      // [INFO   ] [j1.adapter.analytics                    ] [ detected analytics provider (j1_config): {{analytics_provider}}} ]
      // [INFO   ] [j1.adapter.analytics                    ] [ start processing load region head, layout: {{page.layout}} ]

      {% case analytics_provider %}
      {% when "google" %}
      // [INFO   ] [j1.adapter.analytics                    ] [ place provider: Google Adsense ]

      // -----------------------------------------------------------------------
      // Default module settings
      // -----------------------------------------------------------------------
      var settings = $.extend({
        module_name: 'j1.adapter.analytics',
        generated:   '{{site.time}}'
      }, options);

      // -----------------------------------------------------------------------
      // Global variable settings
      // -----------------------------------------------------------------------
      _this = j1.adapter.analytics;
      logger = log4javascript.getLogger('j1.adapter.analytics.google');

      // initialize state flag
      _this.setState('started');
      logger.debug('\n' + 'state: ' + _this.getState());
      logger.info('\n' + 'module is being initialized');

      // remove cookies on invalid GA config or left from a previous
      // session/page view if they exists
      // ---------------------------------------------------------------------
      gaCookies = j1.findCookie('_ga');
      gaCookies.forEach(function (item) {
        logger.warn('\n' + 'delete cookie created by Google Analytics: ' + item);
        if (hostname == 'localhost') {
          j1.removeCookie({ name: item, domain: false, secure: false });
        } else {
          j1.removeCookie({ name: item, domain: '.' + hostname, secure: false });
        }
      });

      var dependencies_met_page_ready = setInterval(function() {
        if (j1.getState() == 'finished') {

          gaExists  = document.getElementById('google-tag-manager');
          skipHosts = skipAllHosts.replace(/,/g, ' ');
          skipHost = skipHosts.includes(hostname);

          user_consent  = j1.readCookie(cookie_names.user_consent);
          if (user_consent.analysis && skipHost && validProviderID) {
            logger.warn('\n' + 'Google Analytics skipped for: ' + hostname);
          }

          if (!gaExists && !skipHost) {
            // add ga api dynamically in the head section
            // -----------------------------------------------------------------
            logger.info('\n' + 'Google Analytics added for: ' + hostname);
            logger.info('\n' + 'Google Analytics API added in section: head');
            gaScript.async = true;
            gaScript.id    = 'google-tag-manager';
            gaScript.src   = '//www.googletagmanager.com/gtag/js?id=' + providerID;
            document.head.appendChild(gaScript);
          }

          user_consent  = j1.readCookie(cookie_names.user_consent);
          if (user_consent.analysis) {
            if (validProviderID) {
              logger.info('\n' + 'user consent on analytics: ' + user_consent.analysis);
              logger.info('\n' + 'enable Google Analytics on ID: ' + providerID);
              GTagOptIn.register(providerID);
              GTagOptIn.optIn();
            } else {
              logger.warn('\n' + 'invalid trackig id detected for Google Analytics: ' + providerID);
            }
          } else {
            logger.info('\n' + 'user consent on analytics: ' + user_consent.analysis);
            logger.warn('\n' + 'disable Google Analytics on ID: ' + providerID);
            GTagOptIn.register(providerID);
            GTagOptIn.optOut();
          }
          clearInterval(dependencies_met_page_ready);
        } // END if getState 'finished'
      }, 25);

      {% when "custom" %}
      // [INFO   ] [j1.adapter.analytics                    ] [ place provider: Custom Provider ]
      {% endcase %}
      // [INFO   ] [j1.adapter.analytics                    ] [ end processing ]
      {% else %}
      var dependencies_met_page_ready = setInterval(function() {
        if (j1.getState() == 'finished') {
          logger = log4javascript.getLogger('j1.adapter.analytics.google');
          logger.info('\n' + 'Google Analytics: disabled');
          clearInterval(dependencies_met_page_ready);
        }
      }, 25);
      {% endif %}
      return;
    }, // END init

    // -------------------------------------------------------------------------
    // messageHandler()
    // manage messages send from other J1 modules
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
    } // END getState

  }; // END return
})(j1, window);

{% endcapture %}
{% if production %}
  {{ cache | minifyJS }}
{% else %}
  {{ cache | strip_empty_lines }}
{% endif %}
{% assign cache = nil %}
