---
regenerate:                             true
---

{%- capture cache -%}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/adapter/js/customModule.js (1)
 # Liquid template to adapt a custom module
 #
 # Product/Info:
 # https://jekyll.one
 # Copyright (C) 2023-2026 Juergen Adams
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
{% assign asset_path              = "/assets/theme/j1" %}

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
 # ~/assets/theme/j1/adapter/js/customModule.js (1)
 # J1 Adapter for custom module
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2023-2026 Juergen Adams
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
j1.adapter.customModule = ((j1, window) => {

  const isDev = (j1.env === "development" || j1.env === "dev") ? true : false;

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

  // claude - J1 Adapter optimizations #1
  // safety-timeout handle for the bounded j1-core-ready poller below.
  //
  var dependenciesTimeout;

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
      // claude - J1 Adapter optimizations #1
      // fixed copy/paste bug: `_this` was assigned to `j1.adapter.dropdowns`
      // (the template this file was cloned from). Every later call to
      // `_this.setState()` / `_this.getState()` therefore mutated and read
      // the dropdowns adapter's state, never this module's, which silently
      // broke any consumer relying on `j1.adapter.customModule.getState()`.
      //
      _this   = j1.adapter.customModule;
      logger  = log4javascript.getLogger('j1.adapter.customModule');

      // create settings object from frontmatterOptions
      frontmatterOptions  = options != null ? $.extend({}, options) : {};

      // claude - J1 Adapter optimizations #1
      // removed leftover `{{dropdowns_options}}` Liquid reference (another
      // clone-from-dropdowns artefact). For a custom module with no YAML
      // backing, `dropdowns_options` either rendered the unrelated dropdowns
      // config into this adapter or, if the variable was undefined in the
      // including page's scope, emitted a Liquid syntax error at build time.
      // Start from an empty object and merge frontmatter on top.
      //
      moduleOptions       = $.extend({}, frontmatterOptions);

      // -----------------------------------------------------------------------
      // module initializer
      // -----------------------------------------------------------------------
      var dependencies_met_j1_finished = setInterval(() => {
        var j1CoreFinished = (j1.getState() === 'finished') ? true : false;

        if (j1CoreFinished) {
          startTimeModule = Date.now();

          _this.setState('started');
          logger.debug('set module state to: ' + _this.getState());
          logger.info('custom functions are being initialized');

          //
          // place init code here
          //

          _this.setState('finished');
          logger.debug('state: ' + _this.getState());
          logger.info('initializing custom functions: finished');

          endTimeModule = Date.now();
          logger.info('initializing time: ' + (endTimeModule-startTimeModule) + 'ms');

          // claude - J1 Adapter optimizations #1
          // the original code never cleared the interval — it would keep
          // firing every 10ms after j1CoreFinished was true, repeatedly
          // re-running the init block, thrashing setState/getState and
          // log lines for the lifetime of the tab. Clear on the happy
          // path and tear down the safety timeout.
          //
          clearInterval(dependencies_met_j1_finished);
          if (dependenciesTimeout) {
            clearTimeout(dependenciesTimeout);
            dependenciesTimeout = null;
          }
        } // END j1CoreFinished
      }, 10); // END dependencies_met_j1_finished

      // claude - J1 Adapter optimizations #1
      // bound the j1-core-ready poller. Previously, if j1.getState() never
      // reached 'finished' (e.g. a bug elsewhere in the boot sequence,
      // an aborted navigation), this 10ms interval ran for the lifetime
      // of the tab. Cap it at 30s and log a warning so the failure mode
      // is visible in the console instead of silently burning CPU.
      //
      dependenciesTimeout = setTimeout(function () {
        if (dependencies_met_j1_finished) {
          clearInterval(dependencies_met_j1_finished);
          logger.warn('customModule init aborted: j1 core did not reach finished within 5s');
        }
      }, 5000);
    }, // END init

    // -------------------------------------------------------------------------
    // custom_module_1
    // called by ???
    // -------------------------------------------------------------------------
    custom_module_1: (options) => {
      var logger = log4javascript.getLogger('j1.adapter.customModule.custom_module_1');

      logText = 'entered custom function: custom_module_1';
      logger.info(logText);

      return true;
    },

    // -------------------------------------------------------------------------
    // messageHandler()
    // manage messages send from other J1 modules
    // -------------------------------------------------------------------------
    messageHandler: (sender, message) => {
      var json_message = JSON.stringify(message, undefined, 2);

      logText = 'received message from ' + sender + ': ' + json_message;
      logger.debug(logText);

      // -----------------------------------------------------------------------
      //  process commands|actions
      // -----------------------------------------------------------------------
      if (message.type === 'command' && message.action === 'module_initialized') {

        //
        // place handling of command|action here
        //

        logger.info(message.text);
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

{%- endcapture -%}

{%- if production -%}
  {{ cache|minifyJS }}
{%- else -%}
  {{ cache|strip_empty_lines }}
{%- endif -%}

{%- assign cache = false -%}
