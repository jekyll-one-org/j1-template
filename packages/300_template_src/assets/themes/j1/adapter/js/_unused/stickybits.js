---
regenerate:                             false
---

{% capture cache %}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/stickybits.js
 # Liquid template to adapt Stickybits Core functions
 #
 # Product/Info:
 # https://jekyll.one
 # http://dynamicdrive.com/dynamicindex3/scrolltop.htm
 #
 # Copyright (C) 2021 Juergen Adams
 # Copyright (C) 2009 dynamicdrive.com
 #
 # J1 Template is licensed under the MIT License.
 # For details, see https://jekyll.one
 # -----------------------------------------------------------------------------
 # Test data:
 #  {{ liquid_var | debug }}
 # -----------------------------------------------------------------------------
{% endcomment %}

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
{% assign stickybits_defaults = modules.defaults.stickybits.defaults %}
{% assign stickybits_settings = modules.stickybits.settings %}

{% comment %} Set config options
-------------------------------------------------------------------------------- {% endcomment %}
{% assign stickybits_options  = stickybits_defaults | merge: stickybits_settings %}

/*
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/stickybits.js
 # JS Adapter for J1 Stickybits
 #
 # Product/Info:
 # https://jekyll.one
 # https://github.com/dollarshaveclub/stickybits
 #
 # Copyright (C) 2021 Juergen Adams
 # Copyright (C) 2016 Dollar Shave Club, Inc.
 #
 # J1 Template is licensed under the MIT License.
 # For details, see https://jekyll.one
 # -----------------------------------------------------------------------------
 # Adapter generated: {{site.time}}
 # -----------------------------------------------------------------------------
*/
'use strict';

{% comment %} Main
-------------------------------------------------------------------------------- {% endcomment %}
j1.adapter['stickybits'] = (function () {

  {% comment %} Set global variables
  ------------------------------------------------------------------------------ {% endcomment %}
  var environment   = '{{environment}}'; // Set environment
  var moduleOptions = {};
  var _this;
  var logger;
  var logText;
  var stickybitsInstance;

  // ---------------------------------------------------------------------------
  // Main object
  // ---------------------------------------------------------------------------
  return {

    // -------------------------------------------------------------------------
    // Initializer
    // -------------------------------------------------------------------------
    init: function () {
      // initialize state flag
      j1.adapter.stickybits.state = 'pending';

      {% comment %} Set global variables
      -------------------------------------------------------------------------- {% endcomment %}
      _this   = j1.adapter.stickybits;
      logger  = log4javascript.getLogger('j1.adapter.stickybits');

      _this.setState('started');
      logger.info('state: ' + _this.getState());
      logger.info('Module is being initialized');

      stickybitsInstance = stickybits('{{stickybits_options.selector}}', {
        useStickyClasses:       {{site.data.modules.j1_stickybits.default.useStickyClasses}},
        stickyBitStickyOffset:  "{{site.data.modules.j1_stickybits.default.offset}}px"
      });

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
      logger.info(logText);

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
      j1.adapter.stickybits.state = stat;
    }, // END setState

    // -------------------------------------------------------------------------
    // getState
    // Returns the current (processing) state of the module
    // -------------------------------------------------------------------------
    getState: function () {
      return j1.adapter.stickybits.state;
    } // END state

  }; // END return
})(j1, window);

{% endcapture %}
{{ cache | strip_empty_lines }}
{% assign cache = nil %}
