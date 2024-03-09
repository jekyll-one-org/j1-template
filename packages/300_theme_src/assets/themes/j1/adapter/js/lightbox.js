---
regenerate:                             true
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
 # Copyright (C) 2023, 2024 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # For details, see: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE.md
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
{% assign modules           = site.data.modules %}

{% comment %} Set config data
-------------------------------------------------------------------------------- {% endcomment %}
{% assign lightbox_defaults  = modules.defaults.lightbox.defaults %}
{% assign lightbox_settings  = modules.lightbox.settings %}

{% comment %} Set config options
-------------------------------------------------------------------------------- {% endcomment %}
{% assign lightbox_options   = lightbox_defaults | merge: lightbox_settings %}

{% comment %} Detect prod mode
-------------------------------------------------------------------------------- {% endcomment %}
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
 # Copyright (C) 2023, 2024 Juergen Adams
 # Copyright (C) 2007, 2018 Lokesh Dhakar
 #
 # J1 Template is licensed under the MIT License.
 # For details, see: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE.md
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
j1.adapter.lightbox = (function (j1, window) {

  {% comment %} Global variables
  ------------------------------------------------------------------------------ {% endcomment %}
  var environment  = '{{environment}}';
  var state        = 'not_started';
  var lightboxDefaults;
  var lightboxSettings;
  var lightboxOptions;
  var frontmatterOptions;
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
        module_name: 'j1.adapter.lightbox',
        generated:   '{{site.time}}'
      }, options);

      // -----------------------------------------------------------------------
      // Global variable settings
      // -----------------------------------------------------------------------
      _this   = j1.adapter.lightbox;
      logger  = log4javascript.getLogger('j1.adapter.lightbox');

      // create settings object from frontmatter (page settings)
      frontmatterOptions  = options != null ? $.extend({}, options) : {};

      // Load  module DEFAULTS|CONFIG
      lightboxDefaults          = $.extend({}, {{lightbox_defaults | replace: 'nil', 'null' | replace: '=>', ':' }});
      lightboxSettings          = $.extend({}, {{lightbox_settings | replace: 'nil', 'null' | replace: '=>', ':' }});
      lightboxOptions           = $.extend(true, {}, lightboxDefaults, lightboxSettings, frontmatterOptions);

      var dependencies_met_j1_finished = setInterval(function() {
        var pageState     = $('#no_flicker').css("display");
        var pageVisible   = (pageState == 'block') ? true: false;
        var atticFinished = (j1.adapter.attic.getState() == 'finished') ? true: false;

         if (j1.getState() == 'finished' && pageVisible) {
//       if (j1.getState() == 'finished' && pageVisible && atticFinished) {

          _this.setState('started');
          logger.debug('\n' + 'state: ' + _this.getState());
          logger.info('\n' + 'module is being initialized');

          lightbox.option({
            alwaysShowNavOnTouchDevices:  lightboxOptions.alwaysShowNavOnTouchDevices,
            albumLabel:                   lightboxOptions.albumLabel,
            disableScrolling:             lightboxOptions.disableScrolling,
            fadeDuration:                 lightboxOptions.fadeDuration,
            fitImagesInViewport:          lightboxOptions.fitImagesInViewport,
            imageFadeDuration:            lightboxOptions.imageFadeDuration,
            maxWidth:                     lightboxOptions.maxWidth,
            maxHeight:                    lightboxOptions.maxHeight,
            positionFromTop:              lightboxOptions.positionFromTop,
            resizeDuration:               lightboxOptions.resizeDuration,
            showImageNumberLabel:         lightboxOptions.showImageNumberLabel,
            wrapAround:                   lightboxOptions.wrapAround
          });

          // _this.setState('finished');
          // logger.debug('\n' + 'state: ' + _this.getState());
          // logger.info('\n' + 'initializing module finished');

          clearInterval(dependencies_met_j1_finished);
        } // END dependencies_met_j1_finished
      }, 10);

      // jadams, 2023-05-07: place CSS styles in GENERAL on a LIGHTBOX V2 doesn't help.
      // a lightbox shoud restpect the individual IMAGE styles
      // FixMe:
      //
      var dependencies_met_lb_v2_finished = setInterval(function() {
        var lb_v2 = $('#lightbox').length;
        if (lb_v2) {
          _this.setState('finished');
          logger.debug('\n' + 'state: ' + _this.getState());
          logger.info('\n' + 'initializing module finished');

          // $('#lightbox').css("filter: grayscale(0.8) contrast(0.8) brightness(0.7) sepia(1)");

          clearInterval(dependencies_met_lb_v2_finished);
        }
      }, 10); // END dependencies_met_lb_v2_finished

    }, // END init lightbox

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
