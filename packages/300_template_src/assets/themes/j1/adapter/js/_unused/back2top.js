---
regenerate:                             false
---

{% capture cache %}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/back2top.js
 # Liquid template to adapt Back2Top Core functions
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
{% capture select_color %}themes/{{site.template.name}}/procedures/global/select_color.proc{% endcapture %}

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
{% assign back2top_defaults = modules.defaults.back2top.defaults %}
{% assign back2top_settings = modules.back2top.settings %}

{% comment %} Set config options
-------------------------------------------------------------------------------- {% endcomment %}
{% assign back2top_options  = back2top_defaults | merge: back2top_settings %}
{% assign active_color      = back2top_options.active_color %}
{% assign background_color  = back2top_options.background_color %}
{% assign back2top_icon     = back2top_options.icon %}
{% assign color             = back2top_options.color %}

{% if back2top_options.icon_family == 'MDI' %}
  {% assign back2top_icon_family = 'Material Design Icons' %}
{% elsif moduleOptions.icon_family == 'FA' %}
  {% assign back2top_icon_family = 'FontAweSome' %}
{% else %}
  {% assign back2top_icon_family = 'Material Design Icons' %}
{% endif %}


/*
 # -----------------------------------------------------------------------------
 #  ~/assets/themes/j1/adapter/js/back2top.js
 #  JS Adapter for J1 Back2Top
 #
 #  Product/Info:
 #  https://jekyll.one
 #  http://dynamicdrive.com/dynamicindex3/scrolltop.htm
 #
 #  Copyright (C) 2021 Juergen Adams
 #  Copyright (C) 2009 dynamicdrive.com
 #
 #  J1 Template is licensed under the MIT License.
 #  For details, see https://jekyll.one
 #
 # -----------------------------------------------------------------------------
 #  Adapter generated: {{site.time}}
 # -----------------------------------------------------------------------------
*/
'use strict';

{% comment %} Main
-------------------------------------------------------------------------------- {% endcomment %}
j1.adapter['back2top'] = (function (j1, window) {

  {% comment %} Set global variables
  ------------------------------------------------------------------------------ {% endcomment %}
  var environment    = '{{environment}}';
  var moduleOptions  = {};
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
      // initialize state flag
      j1.adapter.back2top.state = 'pending';

      // -----------------------------------------------------------------------
      // Default module settings
      // -----------------------------------------------------------------------
      var settings = $.extend({
        module_name: 'j1.adapter.back2top',
        generated:   '{{site.time}}'
      }, options);

      {% comment %} Set global variables
      -------------------------------------------------------------------------- {% endcomment %}
      _this   = j1.adapter.back2top;
      logger  = log4javascript.getLogger('j1.adapter.back2top');

      {% comment %} Load module config from yml data
      -------------------------------------------------------------------------- {% endcomment %}
      // Load  module DEFAULTS|CONFIG
      moduleOptions = $.extend({}, {{back2top_options | replace: '=>', ':' | replace: 'nil', '""'}});

      if (typeof settings !== 'undefined') {
        moduleOptions = j1.mergeData(moduleOptions, settings);
      }

      if (moduleOptions.enabled) {
        _this.setState('started');
        logger.info('state: ' + _this.getState());
        logger.info('module is being initialized');

        _this.setCss();
        j1.core.back2top.init(moduleOptions);

        _this.setState('finished');
        logger.info('state: ' + _this.getState());
      } else {
        _this.setState('finished');
        logger.info('state: ' + _this.getState());
        logger.warn('module back2top disabled');
      }

      return true;
    }, // END init

    // -------------------------------------------------------------------------
    // Set dynamic styles for Back2Top
    // -------------------------------------------------------------------------
    setCss: function () {
      var bg_primary  = j1.getStyleValue('uno-primary', 'background-color');

      var dependencies_met_back2top_adapter = setInterval(function() {
        if (typeof j1.colors !== 'undefined') {
          $('head').append('<style>#topcontrol { background: ' + j1.colors['{{background_color}}'] + '; }</style>');
          // $('head').append('<style>#topcontrol:hover { background: ' + j1.colors['{{active_color}}'] + '; }</style>');
          $('head').append('<style>#topcontrol:hover { background: ' +bg_primary+ '; }</style>');
          $('head').append('<style>#topcontrol:after { content: "\\{{back2top_icon}}"; font-family: {{back2top_icon_family}}; }</style>');
          // clear interval checking
          clearInterval(dependencies_met_back2top_adapter);
        } // END 'getState'
      }, 25); // END 'dataLoaded'

      return true;
    }, // END setCss

    // -------------------------------------------------------------------------
    // messageHandler: MessageHandler for J1 CookieConsent module
    // Manage messages send from other J1 modules
    // -------------------------------------------------------------------------
    messageHandler: function (sender, message) {
      // var json_message = JSON.stringify(message, undefined, 2);
      var json_message = JSON.stringify(message);

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
