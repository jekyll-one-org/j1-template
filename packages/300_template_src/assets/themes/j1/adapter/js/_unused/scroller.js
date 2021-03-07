---
regenerate:                             false
---

{% capture cache %}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/smooth_scroll.js
 # Liquid template to adapt SmoothScroll Core functions
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
{% assign smooth_scroll_defaults = modules.defaults.smooth_scroll.defaults %}
{% assign smooth_scroll_settings = modules.smooth_scroll.settings %}

{% comment %} Set config options
-------------------------------------------------------------------------------- {% endcomment %}
{% assign smooth_scroll_options  = smooth_scroll_defaults | merge: smooth_scroll_settings %}

/*
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/smooth_scroll.js
 # JS Adapter for J1 Scroller (SmoothScroll)
 #
 # Product/Info:
 # http://jekyll.one
 # https://github.com/galambalazs/smoothscroll-for-websites
 #
 # Copyright (C) 2021 Juergen Adams
 # Copyright (C) 2010-2016 Balazs Galambosi
 #
 # J1 Template is licensed under the MIT License.
 # For details, see https://jekyll.one
 # Smooth Scroll is licensed under the MIT License.
 # For details, https://github.com/galambalazs/smoothscroll-for-websites
 # -----------------------------------------------------------------------------
 # Adapter generated: {{site.time}}
 # -----------------------------------------------------------------------------
*/
'use strict';

{% comment %} Main
-------------------------------------------------------------------------------- {% endcomment %}
j1.adapter['scroller'] = (function (j1, window) {

  {% comment %} Set global variables
  ------------------------------------------------------------------------------ {% endcomment %}
  var environment   = '{{environment}}';
  var moduleOptions = {};
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
    init: function () {
      // initialize state flag
      j1.adapter.scroller.state = 'pending';

      {% comment %} Set global variables
      -------------------------------------------------------------------------- {% endcomment %}
      _this   = j1.adapter.scroller;
      logger  = log4javascript.getLogger('j1.adapter.scroller');

      _this.setState('started');
      logger.info('state: ' + _this.getState());
      logger.info('Module is being initialized');

      SmoothScroll({
        frameRate:              {{ smooth_scroll_options.frameRate | json }},
        animationTime:          {{ smooth_scroll_options.animationTime | json }},
        stepSize:               {{ smooth_scroll_options.stepSize | json }},
        accelerationDelta:      {{ smooth_scroll_options.accelerationDelta | json }},
        accelerationMax:        {{ smooth_scroll_options.accelerationMax | json }},
        keyboardSupport:        {{ smooth_scroll_options.keyboardSupport | json }},
        arrowScroll:            {{ smooth_scroll_options.arrowScroll | json }},
        pulseAlgorithm:         {{ smooth_scroll_options.pulseAlgorithm | json }},
        pulseScale:             {{ smooth_scroll_options.pulseScale | json }},
        pulseNormalize:         {{ smooth_scroll_options.pulseNormalize | json }},
        touchpadSupport:        {{ smooth_scroll_options.touchpadSupport | json }},
        fixedBackground:        {{ smooth_scroll_options.fixedBackground | json }},
        excluded:               {{ smooth_scroll_options.excluded | json }},
      });

      _this.setState('finished');
      logger.info('state: ' + _this.getState());

      return true;
    }, // END init

    // -------------------------------------------------------------------------
    // messageHandler: MessageHandler for J1 NAV module
    // Manage messages (paylods) send from other J1 modules
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
      j1.adapter.scroller.state = stat;
    }, // END setState

    // -------------------------------------------------------------------------
    // getState
    // Returns the current (processing) state of the module
    // -------------------------------------------------------------------------
    getState: function () {
      return j1.adapter.scroller.state;
    } // END state

  }; // END return
})(j1, window);

{% endcapture %}
{{ cache | strip_empty_lines }}
{% assign cache = nil %}
