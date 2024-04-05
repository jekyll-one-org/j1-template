---
regenerate:                             true
---

{% capture cache %}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/customModule.js
 # Liquid template to adapt a custom module
 #
 # Product/Info:
 # https://jekyll.one
 # Copyright (C) 2023, 2024 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # For details, see: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 # -----------------------------------------------------------------------------
 # Test data:
 #  {{ liquid_var | debug }}
 #  {{ dropdowns_options | debug }}
 # -----------------------------------------------------------------------------
{% endcomment %}

{% comment %} Liquid procedures
-------------------------------------------------------------------------------- {% endcomment %}

{% comment %} Set global settings
-------------------------------------------------------------------------------- {% endcomment %}
{% assign environment             = site.environment %}
{% assign asset_path              = "/assets/themes/j1" %}

{% comment %} Process YML config data
================================================================================ {% endcomment %}

{% comment %} Set config files
-------------------------------------------------------------------------------- {% endcomment %}
{% assign template_config         = site.data.j1_config %}
{% assign blocks                  = site.data.blocks %}
{% assign modules                 = site.data.modules %}

{% comment %} Set config data (unused)
--------------------------------------------------------------------------------
{% assign custom_module_defaults  = modules.defaults.custom_module.defaults %}
{% assign custom_module_settings  = modules.custom_module.settings %}
-------------------------------------------------------------------------------- {% endcomment %}

{% comment %} Set config options (unused)
--------------------------------------------------------------------------------
{% assign custom_module_options   = custom_module_defaults | merge: custom_module_settings %}
-------------------------------------------------------------------------------- {% endcomment %}

{% comment %} Detect prod mode
-------------------------------------------------------------------------------- {% endcomment %}
{% assign production = false %}
{% if environment == 'prod' or environment == 'production' %}
  {% assign production = true %}
{% endif %}

/*
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/customModule.js
 # J1 Adapter for custom module
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2023, 2024 Juergen Adams
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
'use strict';
j1.adapter.customModule = ((j1, window) => {

  {% comment %} Set global variables
  ------------------------------------------------------------------------------ {% endcomment %}
  var environment       = '{{environment}}';
  var moduleOptions     = {};
  var instances         = [];
  var state             = 'not_started';

  var frontmatterOptions;

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
  // helper functions
  // ---------------------------------------------------------------------------

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
        module_name: 'j1.adapter.customModule',
        generated:   '{{site.time}}'
      }, options);

      // -----------------------------------------------------------------------
      // global variable settings
      // -----------------------------------------------------------------------
      _this   = j1.adapter.dropdowns;
      logger  = log4javascript.getLogger('j1.adapter.customModule');

      // create settings object from frontmatterOptions
      frontmatterOptions  = options != null ? $.extend({}, options) : {};
      moduleOptions       = $.extend({}, {{dropdowns_options | replace: 'nil', 'null' | replace: '=>', ':' }});

      if (typeof frontmatterOptions !== 'undefined') {
        moduleOptions = $.extend({}, moduleOptions, frontmatterOptions);;
      }

      // -----------------------------------------------------------------------
      // module initializer
      // -----------------------------------------------------------------------
      var dependencies_met_j1_finished = setInterval(() => {
        var j1CoreFinished = (j1.getState() === 'finished') ? true : false;

        if (j1CoreFinished) {
          startTimeModule = Date.now();

          _this.setState('started');
          logger.debug('\n' + 'set module state to: ' + _this.getState());
          logger.info('\n' + 'custom functions are being initialized');

          //
          // place init code here
          //

          _this.setState('finished');
          logger.debug('\n' + 'state: ' + _this.getState());
          logger.info('\n' + 'initializing custom functions: finished');

          endTimeModule = Date.now();
          logger.info('\n' + 'initializing time: ' + (endTimeModule-startTimeModule) + 'ms');
        } // END j1CoreFinished
      }, 10); // END dependencies_met_j1_finished
    }, // END init

    // -------------------------------------------------------------------------
    // custom_module_1
    // called by ???
    // -------------------------------------------------------------------------
    custom_module_1: (options) => {
      var logger = log4javascript.getLogger('j1.adapter.customModule.custom_module_1');

      logText = '\n' + 'entered custom function: custom_module_1';
      logger.info(logText);

      return true;
    },

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

{% endcapture %}
{% if production %}
  {{ cache | minifyJS }}
{% else %}
  {{ cache | strip_empty_lines }}
{% endif %}
{% assign cache = nil %}
