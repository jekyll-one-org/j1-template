---
regenerate:                             false
---

{% capture cache %}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/lightbox.js
 # Liquid template to adapt Lightbox Core functions
 #
 # Product/Info:
 # https://jekyll.one
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
{% assign apps              = site.data.apps %}

{% comment %} Set config data
-------------------------------------------------------------------------------- {% endcomment %}
{% assign lightbox_defaults  = apps.defaults.lightbox.defaults %}
{% assign lightbox_settings  = apps.lightbox.settings %}

{% comment %} Set config options
-------------------------------------------------------------------------------- {% endcomment %}
{% assign lightbox_options   = lightbox_defaults | merge: lightbox_settings %}

{% assign production = false %}
{% if environment == 'prod' or environment == 'production' %}
  {% assign production = true %}
{% endif %}

/*
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/lightbox.js
 # JS Adapter for J1 Lightbox
 #
 # Product/Info:
 # https://jekyll.one
 # https://github.com/lokesh/lightbox2/
 #
 # Copyright (C) 2021 Juergen Adams
 # Copyright (C) 2007, 2018 Lokesh Dhakar
 #
 # J1 Template is licensed under the MIT License.
 # For details, see https://jekyll.one
 # Lightbox V2 is licensed under the MIT License.
 # For details, see https://github.com/lokesh/lightbox2/
 #
 # -----------------------------------------------------------------------------
 # Adapter generated: {{site.time}}
 # -----------------------------------------------------------------------------
*/

// -----------------------------------------------------------------------------
// ESLint shimming
// -----------------------------------------------------------------------------
/* eslint indent: "off"                                                       */
// -----------------------------------------------------------------------------
'use strict';

{% comment %} Main
--------------------------------------------------------------- {% endcomment %}
// j1.Lightbox = (function (j1, window) {
j1.adapter['lightbox'] = (function (j1, window) {

  {% comment %} Global variables
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

    // -------------------------------------------------------------------------
    // Initializer
    // -------------------------------------------------------------------------
    init: function () {
      // initialize state flag
      j1.adapter.lightbox.state = 'pending';

      // -----------------------------------------------------------------------
      // globals
      // -----------------------------------------------------------------------
      _this   = j1.adapter.lightbox;
      logger  = log4javascript.getLogger('j1.adapter.lightbox');

      _this.setState('started');
      logger.info('state: ' + _this.getState());
      logger.info('module is being initialized');

      /* eslint-disable */
      lightbox.option({
        alwaysShowNavOnTouchDevices:  {{ lightbox_options.alwaysShowNavOnTouchDevices | json }},
        albumLabel:                   {{ lightbox_options.albumLabel | json }},
        disableScrolling:             {{ lightbox_options.disableScrolling | json }},
        fadeDuration:                 {{ lightbox_options.fadeDuration | json }},
        fitImagesInViewport:          {{ lightbox_options.fitImagesInViewport | json }},
        imageFadeDuration:            {{ lightbox_options.imageFadeDuration | json }},
        maxWidth:                     {{ lightbox_options.maxWidth | json }},
        maxHeight:                    {{ lightbox_options.maxHeight | json }},
        positionFromTop:              {{ lightbox_options.positionFromTop | json }},
        resizeDuration:               {{ lightbox_options.resizeDuration | json }},
        showImageNumberLabel:         {{ lightbox_options.showImageNumberLabel | json }},
        wrapAround:                   {{ lightbox_options.wrapAround | json }}
      });
      /* eslint-enable */

      _this.setState('finished');
      logger.info('state: ' + _this.getState());
      logger.info('initializing module finished');

      return true;
    }, // END init lightbox

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
{% if production %}
  {{ cache | minifyJS }}
{% else %}
  {{ cache | strip_empty_lines }}
{% endif %}
{% assign cache = nil %}
