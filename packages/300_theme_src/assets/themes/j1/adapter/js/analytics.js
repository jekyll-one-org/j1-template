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
 # Copyright (C) 2023, 2024 Juergen Adams
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

{% comment %} Detect prod mode
-------------------------------------------------------------------------------- {% endcomment %}
{% assign production = false %}
{% if environment == 'prod' or environment == 'production' %}
  {% assign production = true %}
{% endif %}

{% comment %} analytics_options:  {{ analytics_options | debug }} {% endcomment %}

/*
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/analytics.js
 # J1 Adapter for the analytics module
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2023, 2024 Juergen Adams
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
var url               = new liteURL(window.location.href);
var hostname          = url.hostname;
var environment       = '{{environment}}';
var gaScript          = document.createElement('script');
var cookie_names      = j1.getCookieNames();
var date              = new Date();
var timestamp_now     = date.toISOString();
var skipHost          = false;
var state             = 'not_started';
var analyticsDefaults;
var analyticsSettings;
var analyticsOptions;
var providerID;
var skipAllHosts;
var optInOut;
var anonymizeIP;
var validProviderID;
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

      // -----------------------------------------------------------------------
      // initializer
      // -----------------------------------------------------------------------
      var dependencies_met_page_ready = setInterval (() => {
        var pageState   = $('#content').css("display");
        var pageVisible = (pageState == 'block') ? true: false;

        if (j1.getState() === 'finished' && pageVisible) {
          {% if analytics %}

            // Load  module DEFAULTS|CONFIG
            analyticsDefaults = $.extend({}, {{analytics_defaults | replace: 'nil', 'null' | replace: '=>', ':' }});
            analyticsSettings = $.extend({}, {{analytics_settings | replace: 'nil', 'null' | replace: '=>', ':' }});
            analyticsOptions  = $.extend(true, {}, analyticsDefaults, analyticsSettings);

            // [INFO   ] [j1.adapter.analytics                    ] [ detected analytics provider (j1_config): {{analytics_provider}}} ]
            // [INFO   ] [j1.adapter.analytics                    ] [ start processing load region head, layout: {{page.layout}} ]
            {% case analytics_provider %}
            {% when "google" %}
            // [INFO   ] [j1.adapter.analytics                    ] [ place provider: Google Adsense ]
            providerID        = analyticsOptions.trackingID;
            skipAllHosts      = analyticsOptions.skipAllHosts;
            optInOut          = analyticsOptions.google.optInOut;
            anonymizeIP       = analyticsOptions.google.anonymizeIP;
            validProviderID   = (providerID.includes('your')) ? false : true;

            // -----------------------------------------------------------------
            // Default module settings
            // -----------------------------------------------------------------
            var settings = $.extend({
              module_name: 'j1.adapter.analytics',
              generated:   '{{site.time}}'
            }, options);

            // -----------------------------------------------------------------
            // Global variable settings
            // -----------------------------------------------------------------
            _this = j1.adapter.analytics;
            logger = log4javascript.getLogger('j1.adapter.analytics');

            // initialize state flag
            _this.setState('started');
            logger.debug('\n' + 'state: ' + _this.getState());
            logger.info('\n' + 'module initializing: started');

            // remove cookies on invalid GA config or left from a previous
            // session/page view if they exists
            // -----------------------------------------------------------------
            gaCookies = j1.findCookie('_ga');
            gaCookies.forEach(function (item) {
              logger.debug('\n' + 'delete cookie created by Google Analytics: ' + item);
              if (hostname == 'localhost') {
                j1.removeCookie({ name: item, domain: false, secure: false });
              } else {
                j1.removeCookie({ name: item, domain: '.' + hostname, secure: false });
              }
            });

            gaExists  = document.getElementById('google-tag-manager') === null ? false : true;
            skipHosts = skipAllHosts.replace(/,/g, ' ');
            skipHost  = skipHosts.includes(hostname);

            user_consent = j1.readCookie(cookie_names.user_consent);
            if (user_consent.analysis && skipHost && validProviderID) {
              logger.debug('\n' + 'Google Analytics skipped for: ' + hostname);
            }

            if (!gaExists && !skipHost) {
              // add ga api dynamically in the head section
              // ---------------------------------------------------------------
              logger.info('\n' + 'Google Analytics added for: ' + hostname);
              logger.info('\n' + 'Google Analytics API added in section: head');
              gaScript.async = true;
              gaScript.id    = 'google-tag-manager';
              gaScript.src   = '//www.googletagmanager.com/gtag/js?id=' + providerID;
              document.head.appendChild(gaScript);
            }

            user_consent  = j1.readCookie(cookie_names.user_consent);
            if (user_consent.analysis && !skipHost ) {
              if (validProviderID) {
                logger.info('\n' + 'user consent on analytics: ' + user_consent.analysis);
                logger.info('\n' + 'enable Google Analytics on ID: ' + providerID);
                GTagOptIn.register(providerID);
                GTagOptIn.optIn();
              } else {
                logger.debug('\n' + 'invalid trackig id detected for Google Analytics: ' + providerID);
              }
            } else {
              logger.info('\n' + 'user consent on analytics: ' + user_consent.analysis);
              logger.debug('\n' + 'disable Google Analytics on ID: ' + providerID);
              GTagOptIn.register(providerID);
              GTagOptIn.optOut();
            }
            _this.setState('finished');
            logger.debug('\n' + 'state: ' + _this.getState());
            logger.info('\n' + 'module initializing: finished');

            clearInterval(dependencies_met_page_ready);
            {% when "custom" %}
            // [INFO   ] [j1.adapter.analytics                    ] [ place provider: Custom Provider ]
            {% endcase %}
            // [INFO   ] [j1.adapter.analytics                    ] [ end processing ]
          {% else %}
            logger = log4javascript.getLogger('j1.adapter.analytics');
            logger.info('\n' + 'Google Analytics: disabled');

            clearInterval(dependencies_met_page_ready);
          {% endif %}
        }
      }, 10);

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
