---
regenerate:                             false
---

{% capture cache %}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/masterslider.js
 # Liquid template to adapt Averta MasterSlider Lite v2.50.0 (Aug 2016)
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
 # -----------------------------------------------------------------------------
{% endcomment %}

/*
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/masterslider.js
 # J1 Adapter for Averta MasterSlider Lite v2.50.0 (Aug 2016)
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
j1.adapter.masterslider = (function (j1, window) {

  {% comment %} Set global variables
  ------------------------------------------------------------------------------ {% endcomment %}
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

    // ----ms_1------------------------------------------------------------------
    // Initializer
    // -------------------------------------------------------------------------
    init: function (options) {

      // -----------------------------------------------------------------------
      // Default module settings
      // -----------------------------------------------------------------------
      var settings = $.extend({
        module_name: 'j1.adapter.masterslider',
        generated:   '{{site.time}}'
      }, options);

      // -----------------------------------------------------------------------
      // Global variable settings
      // -----------------------------------------------------------------------
      _this   = j1.adapter.bmd;
      logger  = log4javascript.getLogger('j1.adapter.masterslider');

      var dependencies_met_j1_finished = setInterval(function() {
        if (j1.getState() == 'finished') {

          // initialize state flag
          _this.setState('started');
          logger.debug('\n' + 'state: ' + _this.getState());
          logger.info('\n' + 'module is being initialized');

          var log_text = '\n' + 'Sliders are being initialized';
          logger.info(log_text);

          var masterslider_1 = new MasterSlider();

          // slider controls
          masterslider_1.control('arrows', {
            autohide:             false,
            overVideo:            true
          });

          // slider setup
          masterslider_1.setup('ms_1', {
            width:                1200,
            height:               600,
            minHeight:            0,
            space:                0,
            start:                1,
            grabCursor:           true,
            swipe:                true,
            mouse:                true,
            keyboard:             false,
            layout:               'boxed',
            wheel:                false,
            autoplay:             false,
            instantStartLayers:   false,
            mobileBGVideo:        false,
            loop:                 false,
            shuffle:              false,
            preload:              0,
            heightLimit:          true,
            autoHeight:           false,
            smoothHeight:         true,
            endPause:             false,
            overPause:            true,
            fillMode:             'fill',
            centerControls:       true,
            startOnAppear:        false,
            layersMode:           'center',
            autofillTarget:       '',
            hideLayers:           false,
            fullscreenMargin:     0,
            speed:                20,
            dir:                  'h',
            responsive:           true,
            tabletWidth:          768,
            tabletHeight:         null,
            phoneWidth:           480,
            phoneHeight:          null,
            sizingReference:      window,
            parallaxMode:         'swipe',
            view:                 'basic'
          });

          window.masterslider_instances = window.masterslider_instances || [];
          window.masterslider_instances.push(masterslider_1);

          var masterslider_2 = new MasterSlider();

          // slider controls
          masterslider_2.control('arrows', {
            autohide:             false,
            overVideo:            true
          });

          // slider setup
          masterslider_2.setup('ms_2', {
            width:                1200,
            height:               600,
            minHeight:            0,
            space:                0,
            start:                1,
            grabCursor:           true,
            swipe:                true,
            mouse:                true,
            keyboard:             false,
            layout:               'boxed',
            wheel:                false,
            autoplay:             false,
            instantStartLayers:   false,
            mobileBGVideo:        false,
            loop:                 false,
            shuffle:              false,
            preload:              0,
            heightLimit:          true,
            autoHeight:           false,
            smoothHeight:         true,
            endPause:             false,
            overPause:            true,
            fillMode:             'fill',
            centerControls:       true,
            startOnAppear:        false,
            layersMode:           'center',
            autofillTarget:       '',
            hideLayers:           false,
            fullscreenMargin:     0,
            speed:                20,
            dir:                  'h',
            responsive:           true,
            tabletWidth:          768,
            tabletHeight:         null,
            phoneWidth:           480,
            phoneHeight:          null,
            sizingReference:      window,
            parallaxMode:         'swipe',
            view:                 'basic'
          });

          window.masterslider_instances = window.masterslider_instances || [];
          window.masterslider_instances.push(masterslider_2);



          _this.setState('finished');
          logger.debug('\n' + 'state: ' + _this.getState());
          logger.info('\n' + 'initializing module finished');
          clearInterval(dependencies_met_j1_finished);
        } // END dependencies_met_j1_finished
      }, 25);

    }, // END init

    // -------------------------------------------------------------------------
    // messageHandler: MessageHandler for J1 CookieConsent module
    // Manage messages send from other J1 modules
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
