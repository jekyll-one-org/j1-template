---
regenerate:                             true
---

{% capture cache %}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/cookiebar.js
 # Liquid template to create the Template Adapter for J1 Cookiebar
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
{% assign environment           = site.environment %}
{% assign modules               = site.data.modules %}

{% comment %} Set config data
-------------------------------------------------------------------------------- {% endcomment %}
{% assign cookiebar_settings    = modules.cookiebar.settings %}
{% assign cookiebar_defaults    = modules.defaults.cookiebar.defaults %}

{% comment %} Set config options
-------------------------------------------------------------------------------- {% endcomment %}
{% assign cookiebar_options     = cookiebar_defaults | merge: cookiebar_settings %}

{% assign production = false %}
{% if environment == 'prod' or environment == 'production' %}
  {% assign production = true %}
{% endif %}

/*
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/cookiebar.js
 # JS Adapter for Cookiebar
 #
 # Product/Info:
 # http://jekyll.one
 # http://www.primebox.co.uk/projects/jquery-cookiebar/
 #
 # Copyright (C) 2021 Juergen Adams
 # Copyright (C) 2016 Ant Parsons (primebox.co.uk)
 #
 # J1 Template is licensed under the MIT License.
 # For details, see https://jekyll.one
 # jQuery Cookibar is licensed under Creative Commons Attribution 3.0 Unported License.
 # For details, see http://www.primebox.co.uk/projects/jquery-cookiebar/
 #
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
j1.adapter['cookiebar'] = (function (j1, window) {

  var environment   = '{{environment}}';
  var moduleOptions = {};
  var _this;
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
      // Default module settings
      // -----------------------------------------------------------------------
      var settings = $.extend({
        module_name: 'j1.adapter.cookiebar',
        generated:   '{{site.time}}'
      }, options);

      {% comment %} Load module config from yml data
      -------------------------------------------------------------------------- {% endcomment %}
      // Load  module DEFAULTS|CONFIG
      /* eslint-disable */
      moduleOptions = $.extend({}, {{cookiebar_options | replace: '=>', ':' | replace: 'nil', '""'}});
      /* eslint-enable */

      if (typeof settings !== 'undefined') {
        moduleOptions = j1.mergeData(moduleOptions, settings);
      }

      // -----------------------------------------------------------------------
      // initializer
      // -----------------------------------------------------------------------
      _this   = j1.adapter.cookiebar;
      logger  = log4javascript.getLogger('j1.adapter.cookiebar');

      _this.setState('started');
      logger.info('state: ' + _this.getState());
      logger.info('module is being initialized');

      j1.core.cookiebar.init({
        expireDays:             {{ cookiebar_options.expireDays | json }},
        renewOnVisit:           {{ cookiebar_options.renewOnVisit | json }},
        forceShow:              {{ cookiebar_options.forceShow | json }},
        domain:                 {{ cookiebar_options.domain | json }},
        referrer:               {{ cookiebar_options.referrer | json }}
      });

      j1.xhrData(moduleOptions, 'j1.adapter.cookiebar', 'data_loaded');

      // ---------------------------------------------------------------------
      // Initialize events if all modals loaded
      // ---------------------------------------------------------------------
      var dependencies_met_modals_loaded = setInterval (function () {
        if (j1.xhrDataState['#{{cookiebar_options.xhr_container_id}}'] == 'success') {
          logger.info('load HTML data (AJAX): finished');
          j1.core.cookiebar.eventHandler(moduleOptions);
          _this.setState('finished');
          logger.info('state: ' + _this.getState());
          logger.info('initializing module finished');
          clearInterval(dependencies_met_modals_loaded);
          logger.info('met dependencies for: xhrData');
        }
        if (j1.xhrDataState['#{{cookiebar_options.xhr_container_id}}'] == 'not loaded') {
          logger.error('load HTML data (AJAX): failed');
          _this.setState('finished');
          logger.info('state: ' + _this.getState());
          logger.info('initializing module finished');
          clearInterval(dependencies_met_modals_loaded);
        }
      }, 25); // END dependencies_met_modals_loaded
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
    } // END getState

  }; // END return
})(j1, window);

{% endcapture %}
{{ cache | strip_empty_lines }}
{% assign cache = nil %}
