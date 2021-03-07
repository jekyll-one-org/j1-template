---
regenerate:                             false
---

{% capture cache %}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/example.js
 # Liquid template to adapt tne Example Module Core functions
 #
 # Product/Info:
 # https://jekyll.one
 # https://YOUR.SITE
 #
 # Copyright (C) 2021 Juergen Adams
 # Copyright (C) YEAR YOUR NAME
 #
 # J1 Template is licensed under the MIT License.
 # For details, see https://jekyll.one
 # YOUR_MODULE_NAME is licensed under YOUR LICENSE
 # For details, see https://YOUR.SITE
 # -----------------------------------------------------------------------------
 # Test data:
 #  {{ liquid_var | debug }}
 # -----------------------------------------------------------------------------
{% endcomment %}

{% comment %} set global settings
-------------------------------------------------------------------------------- {% endcomment %}
{% assign data                = site.data %}
{% assign environment         = site.environment %}
{% assign template_name       = site.template.name %}

{% assign apps                = data.apps %}
{% assign blocks              = data.blocks %}
{% assign builder             = data.builder %}
{% assign layouts             = data.layouts %}
{% assign modules             = data.modules %}
{% assign pages               = data.pages %}
{% assign tables              = data.tables %}


{% comment %} Liquid procedures
-------------------------------------------------------------------------------- {% endcomment %}
{% capture select_color %}themes/{{template_name}}/procedures/global/select_color.proc{% endcapture %}


{% comment %} Process YML config data
================================================================================ {% endcomment %}

{% comment %} Set config data
{% assign your_defaults     = modules.defaults.YOUR_DATA.defaults %}
{% assign your_settings     = modules.YOUR_DATA.settings %}
-------------------------------------------------------------------------------- {% endcomment %}

{% comment %} Set config options
{% assign your_options  = your_defaults | merge: your_settings %}
-------------------------------------------------------------------------------- {% endcomment %}

/*
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/example.js
 # J1 Adapter for YOUR_MODULE_NAME
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2021 Juergen Adams
 # Copyright (C) YEAR YOUR NAME
 #
 # J1 Template is licensed under the MIT License.
 # For details, see https://jekyll.one
 # YOUR_MODULE_NAME is licensed under YOUR LICENSE
 # For details, see https://YOUR.SITE
 # -----------------------------------------------------------------------------
 # Adapter generated: {{site.time}}
 # -----------------------------------------------------------------------------
*/
'use strict';

{% comment %} Liquid procedures
-------------------------------------------------------------------------------- {% endcomment %}

{% comment %} Set global settings
-------------------------------------------------------------------------------- {% endcomment %}
{% assign environment       = site.environment %}
{% assign template_version  = site.version %}

{% comment %} Process YML config data
================================================================================ {% endcomment %}

{% comment %} Set config files
-------------------------------------------------------------------------------- {% endcomment %}
{% assign template_config   = site.data.j1_config %}
{% assign blocks            = site.data.blocks %}
{% assign modules           = site.data.modules %}

{% comment %} Set config data
-------------------------------------------------------------------------------- {% endcomment %}

{% comment %} Set config options
-------------------------------------------------------------------------------- {% endcomment %}


{% comment %} Main
-------------------------------------------------------------------------------- {% endcomment %}
j1.adapter.example = (function (j1, window) {

  {% comment %} Set global variables
  ------------------------------------------------------------------------------ {% endcomment %}
  var environment     = '{{environment}}';
  var moduleOptions   = {};
  var _this;
  var logger;
  var logText;

  // ---------------------------------------------------------------------------
  // Main object
  // ---------------------------------------------------------------------------
  return {

    // -------------------------------------------------------------------------
    // Initializer
    // -------------------------------------------------------------------------
    init: function (options) {
      // initialize state flag
      j1.adapter.example.state = 'pending';

      // -----------------------------------------------------------------------
      // Default module settings
      // -----------------------------------------------------------------------
      var settings = $.extend({
        module_name: 'j1.adapter.example',
        generated:   '{{site.time}}'
      }, options);

      {% comment %} Load module config from yml data
      -------------------------------------------------------------------------- {% endcomment %}
      // Load  module DEFAULTS|CONFIG
      //
      // moduleOptions = $.extend({}, {{jekyll_options | replace: '=>', ':' | replace: 'nil', '""'}});
      //
      // if (typeof settings !== 'undefined') {
      //   moduleOptions = j1.mergeData(moduleOptions, settings);
      // }

      {% comment %} Set global variables
      -------------------------------------------------------------------------- {% endcomment %}
      _this = j1.adapter.example;
      logger = log4javascript.getLogger('j1.adapter.example');

      _this.setState('started');
      logger.info('state: ' + _this.getState());
      logger.info('module is being initialized');

      j1example.init();

      //
      // code to be implemented goes here
      //

      _this.setState('finished');
      logger.info('state: ' + _this.getState());
      logger.info('initializing module finished');

      return true;
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
    // setState
    // Set the current (processing) state of the module
    // -------------------------------------------------------------------------
    setState: function (stat) {
      j1.adapter.example.state = stat;
    }, // END setState

    // -------------------------------------------------------------------------
    // getState
    // Returns the current (processing) state of the module
    // -------------------------------------------------------------------------
    getState: function () {
      return j1.adapter.example.state;
    } // END state


  }; // END return
})(j1, window);

{% endcapture %}
{{ cache | strip_empty_lines }}
{% assign cache = nil %}