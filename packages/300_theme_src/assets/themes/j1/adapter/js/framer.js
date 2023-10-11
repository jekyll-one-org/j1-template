---
regenerate:                             false
---

{% capture cache %}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/framer.js
 # Liquid template to adapt iFrameResizer Core functions
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2023 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # For details, see: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE.md
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
{% assign framer_defaults   = modules.defaults.framer.defaults %}
{% assign framer_settings   = modules.framer.settings %}

{% comment %} Set config options
-------------------------------------------------------------------------------- {% endcomment %}
{% assign framer_options    = framer_defaults | merge: framer_settings %}

{% comment %} Detect prod mode
-------------------------------------------------------------------------------- {% endcomment %}
{% assign production = false %}
{% if environment == 'prod' or environment == 'production' %}
  {% assign production = true %}
{% endif %}

/*
 # -----------------------------------------------------------------------------
 #  ~/assets/themes/j1/adapter/js/framer.js
 #  J1 Adapter for J1 iFrameResizer
 #
 #  Product/Info:
 #  https://jekyll.one
 #  http://davidjbradshaw.github.io/iframe-resizer/
 #
 #  Copyright (C) 2023 Juergen Adams
 #  Copyright (C) 2013-15 David J. Bradshaw
 #
 #  J1 Template is licensed under the MIT License.
 #  For details, see: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE.md
 #  iFrameResizer is licensed under under the MIT License.
 #  For details, see http://davidjbradshaw.github.io/iframe-resizer/
 #
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
j1.adapter.framer = (function (j1, window) {

  {% comment %} Set global variables
  ------------------------------------------------------------------------------ {% endcomment %}
  var environment   = '{{environment}}';
  var state         = 'not_started';
  var framerDefaults;
  var framerSettings;
  var framerOptions;
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

      var dependencies_met_page_finished = setInterval (function () {
        if (j1.getState() === 'finished') {

          // -----------------------------------------------------------------------
          // Default module settings
          // -----------------------------------------------------------------------
          var settings = $.extend({
            module_name: 'j1.adapter.example',
            generated:   '{{site.time}}'
          }, options);

          // -----------------------------------------------------------------------
          // Global variable settings
          // -----------------------------------------------------------------------
          _this   = j1.adapter.framer;
          logger  = log4javascript.getLogger('j1.adapter.framer');

          // Load  module DEFAULTS|CONFIG
          framerDefaults = $.extend({}, {{framer_defaults | replace: 'nil', 'null' | replace: '=>', ':' }});
          framerSettings = $.extend({}, {{framer_settings | replace: 'nil', 'null' | replace: '=>', ':' }});
          framerOptions  = $.extend(true, {}, framerDefaults, framerSettings);

          // initialize state flag
          _this.setState('started');
          logger.debug('\n' + 'state: ' + _this.getState());
          logger.info('\n' + 'module is being initialized');

          iFrameResize({
            log:                      framerOptions.log,
            autoResize:               framerOptions.autoResize,
            bodyBackground:           framerOptions.bodyBackground,
            bodyMargin:               framerOptions.bodyMargin,
            checkOrigin:              framerOptions.checkOrigin,
            inPageLinks:              framerOptions.inPageLinks,
            interval:                 framerOptions.interval,
            heightCalculationMethod:  framerOptions.heightCalculationMethod,
            maxHeight:                framerOptions.maxHeight,
            minWidth:                 framerOptions.minWidth,
            maxWidth:                 framerOptions.maxWidth,
            minHeight:                framerOptions.minHeight,
            resizeFrom:               framerOptions.resizeFrom,
            scrolling:                framerOptions.scrolling,
            sizeHeight:               framerOptions.sizeHeight,
            sizeWidth:                framerOptions.sizeWidth,
            tolerance:                framerOptions.tolerance,
            widthCalculationMethod:   framerOptions.widthCalculationMethod,
            targetOrigin:             framerOptions.checkOrigin
          });

          _this.setState('finished');
          logger.debug('\n' + 'state: ' + _this.getState());
          logger.info('\n' + 'initializing module finished');

          clearInterval(dependencies_met_page_finished);
          return true;
        }
      }, 10);
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
    // getState
    // Returns the current (processing) state of the module
    // -------------------------------------------------------------------------
    getState: function () {
      return j1.adapter.navigator.state;
    }, // END getState

    // -------------------------------------------------------------------------
    // setXhrState
    // Set the final (loading) state of an element (partial) loaded via Xhr
    // -------------------------------------------------------------------------
    setXhrState: function (obj, stat) {
      j1.adapter.navigator.xhrData[obj] = stat;
    }, // END setXhrState

    // -------------------------------------------------------------------------
    // getState
    // Returns the final (loading) state of an element (partial) loaded via Xhr
    // -------------------------------------------------------------------------
    getXhrState: function (obj) {
      return j1.adapter.navigator.xhrData[obj];
    } // END getXhrState

  }; // END return
})(j1, window);

{% endcapture %}
{% if production %}
  {{ cache | minifyJS }}
{% else %}
  {{ cache | strip_empty_lines }}
{% endif %}
{% assign cache = nil %}
