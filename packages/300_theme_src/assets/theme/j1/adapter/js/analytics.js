---
regenerate:                             true
---

{%- capture cache -%}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/adapter/js/analytics.js
 # Liquid template to adapt the Analytics module
 #
 # Product/Info:
 # https://jekyll.one
 # Copyright (C) 2023-2025 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # For details, see: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
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
{% assign environment        = site.environment %}
{% assign asset_path         = "/assets/theme/j1" %}

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
 # ~/assets/theme/j1/adapter/js/analytics.js
 # J1 Adapter for the analytics module
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2023-2025 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # For details, see: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 # -----------------------------------------------------------------------------
 #  Adapter generated: {{site.time}}
 # -----------------------------------------------------------------------------
*/

// -----------------------------------------------------------------------------
// ESLint shimming
// -----------------------------------------------------------------------------
/* eslint indent: "off"                                                       */
// -----------------------------------------------------------------------------
"use strict";
j1.adapter.analytics = ((j1, window) => {

  const isDev = (j1.env === "development" || j1.env === "dev") ? true : false;

  {% comment %} Set global variables
  ------------------------------------------------------------------------------ {% endcomment %}
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

  // date|time
  var startTime;
  var endTime;
  var startTimeModule;
  var endTimeModule;
  var timeSeconds;

  // ---------------------------------------------------------------------------
  // main
  // ---------------------------------------------------------------------------
  return {

    // -------------------------------------------------------------------------
    // adapter initializer
    // -------------------------------------------------------------------------
    init: (options) => {

      // -----------------------------------------------------------------------
      // module initializer
      // -----------------------------------------------------------------------
      var dependencies_met_page_ready = setInterval (() => {
        var pageState      = $('#content').css("display");
        var pageVisible    = (pageState === 'block') ? true: false;
        var j1CoreFinished = (j1.getState() === 'finished') ? true : false;

        if (j1CoreFinished && pageVisible) {
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
            // default module settings
            // -----------------------------------------------------------------
            var settings = $.extend({
              module_name: 'j1.adapter.analytics',
              generated:   '{{site.time}}'
            }, options);

            // -----------------------------------------------------------------
            // global variable settings
            // -----------------------------------------------------------------
            _this  = j1.adapter.analytics;
            logger = log4javascript.getLogger('j1.adapter.analytics');

            startTimeModule = Date.now();

            _this.setState('started');
            logger.debug('state: ' + _this.getState());
            logger.info('module initializing: started');

            // remove cookies on invalid GA config or left from a previous
            // session/page view if they exists
            // -----------------------------------------------------------------
            gaCookies = j1.findCookie('_ga');
            gaCookies.forEach((item) => {
              logger.debug('delete cookie created by Google Analytics: ' + item);
              j1.removeCookie({ name: item });
            });

            gaExists  = document.getElementById('google-tag-manager') === null ? false : true;
            skipHosts = skipAllHosts.replace(/,/g, ' ');
            skipHost  = skipHosts.includes(hostname);

            user_consent = j1.readCookie(cookie_names.user_consent);
            if (user_consent.analysis && skipHost && validProviderID) {
              logger.debug('Google Analytics skipped for: ' + hostname);
            }

            if (!gaExists && !skipHost) {
              // add ga api dynamically in the head section
              // ---------------------------------------------------------------
              logger.info('Google Analytics added for: ' + hostname);
              logger.info('Google Analytics API added in section: head');
              gaScript.async = true;
              gaScript.id    = 'google-tag-manager';
              gaScript.src   = '//www.googletagmanager.com/gtag/js?id=' + providerID;
              document.head.appendChild(gaScript);
            }

            user_consent = j1.readCookie(cookie_names.user_consent);
            if (user_consent.analysis && !skipHost ) {
              if (validProviderID) {
                logger.info('user consent on analytics: ' + user_consent.analysis);
                logger.info('enable Google Analytics on ID: ' + providerID);
                GTagOptIn.register(providerID);
                GTagOptIn.optIn();
              } else {
                logger.debug('invalid trackig id detected for Google Analytics: ' + providerID);
              }
            } else {
              logger.info('user consent on analytics: ' + user_consent.analysis);
              logger.debug('disable Google Analytics on ID: ' + providerID);
              GTagOptIn.register(providerID);
              GTagOptIn.optOut();
            }

            _this.setState('finished');
            logger.debug('state: ' + _this.getState());
            logger.info('module initializing: finished');

            endTimeModule = Date.now();
            logger.info('module initializing time: ' + (endTimeModule-startTimeModule) + 'ms');

            clearInterval(dependencies_met_page_ready);
            {% when "custom" %}
            // [INFO   ] [j1.adapter.analytics                    ] [ place provider: Custom Provider ]
            {% endcase %}
            // [INFO   ] [j1.adapter.analytics                    ] [ end processing ]
          {% else %}
            logger = log4javascript.getLogger('j1.adapter.analytics');
            logger.info('Google Analytics: disabled');

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
    messageHandler: (sender, message) => {
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

  }; // END return
})(j1, window);

{%- endcapture -%}

{%- if production -%}
  {{ cache|minifyJS }}
{%- else -%}
  {{ cache|strip_empty_lines }}
{%- endif -%}

{%- assign cache = false -%}
