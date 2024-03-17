---
regenerate:                             true
---

{% capture cache %}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/iconPicker.js
 # Liquid template to adapt the iconPicker module
 #
 # Product/Info:
 # https://jekyll.one
 # Copyright (C) 2023, 2024 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # For details, see: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE.md
 # -----------------------------------------------------------------------------
 # Test data:
 #  {{ liquid_var | debug }}
 #  icon_picker_options:  {{ icon_picker_options | debug }}
 # -----------------------------------------------------------------------------
{% endcomment %}

{% comment %} Liquid procedures
-------------------------------------------------------------------------------- {% endcomment %}

{% comment %} Set global settings
-------------------------------------------------------------------------------- {% endcomment %}
{% assign environment           = site.environment %}
{% assign asset_path            = "/assets/themes/j1" %}

{% comment %} Process YML config data
================================================================================ {% endcomment %}

{% comment %} Set config files
-------------------------------------------------------------------------------- {% endcomment %}
{% assign template_config       = site.data.j1_config %}
{% assign blocks                = site.data.blocks %}
{% assign modules               = site.data.modules %}

{% comment %} Set config data (settings only)
-------------------------------------------------------------------------------- {% endcomment %}
{% assign icon_picker_defaults  = modules.defaults.icon_picker.defaults %}
{% assign icon_picker_settings  = modules.icon_picker.settings %}

{% comment %} Set config options (settings only)
-------------------------------------------------------------------------------- {% endcomment %}
{% assign icon_picker_options   = icon_picker_defaults | merge: icon_picker_settings %}


{% comment %} Variables
-------------------------------------------------------------------------------- {% endcomment %}

{% comment %} Detect prod mode
-------------------------------------------------------------------------------- {% endcomment %}
{% assign production = false %}
{% if environment == 'prod' or environment == 'production' %}
  {% assign production = true %}
{% endif %}

/*
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/iconPicker.js
 # J1 Adapter for the iconPicker module
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2023, 2024 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # For details, see: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE.md
 # -----------------------------------------------------------------------------
 # NOTE:
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
j1.adapter.iconPicker = (function (j1, window) {

{% comment %} Set global variables
-------------------------------------------------------------------------------- {% endcomment %}
var environment           = '{{environment}}';
var state                 = 'not_started';
var iconPickerDefaults;
var iconPickerSettings;
var iconPickerOptions;
var frontmatterOptions;
var icon_picker;
var icon_picker_button_id;
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
  // Main object
  // ---------------------------------------------------------------------------
  return {

    // -------------------------------------------------------------------------
    // init()
    // adapter initializer
    // -------------------------------------------------------------------------
    init: function (options) {

      // -----------------------------------------------------------------------
      // Default module settings
      // -----------------------------------------------------------------------
      var settings = $.extend({
        module_name: 'j1.adapter.iconPicker',
        generated:   '{{site.time}}'
      }, options);

      // -----------------------------------------------------------------------
      // Global variable settings
      // -----------------------------------------------------------------------

      // create settings object from module options
      iconPickerDefaults = $.extend({}, {{icon_picker_defaults | replace: 'nil', 'null' | replace: '=>', ':' }});
      iconPickerSettings = $.extend({}, {{icon_picker_settings | replace: 'nil', 'null' | replace: '=>', ':' }});
      iconPickerOptions  = $.extend(true, {}, iconPickerDefaults, iconPickerSettings);

      _this  = j1.adapter.iconPicker;
      logger = log4javascript.getLogger('j1.adapter.iconPicker');

      // -----------------------------------------------------------------------
      // initializer
      // -----------------------------------------------------------------------
      var dependencies_met_page_ready = setInterval (function (options) {
        var pageState       = $('#content').css("display");
        var pageVisible     = (pageState == 'block') ? true : false;
        var j1CoreFinished  = (j1.getState() == 'finished') ? true : false;


        if (j1CoreFinished && pageVisible) {
          startTimeModule       = Date.now();
          icon_picker_button_id = '#' + iconPickerOptions.picker_button_id;

          _this.setState('started');
          logger.debug('\n' + 'state: ' + _this.getState());
          logger.info('\n' + 'module is being initialized on id: ' + icon_picker_button_id);

          var dependencies_met_picker_button_ready = setInterval (() => {
            var buttonState = $(icon_picker_button_id).length;
            var buttonReady = (buttonState > 0) ? true : false;

            if (buttonReady) {
              // setup initial slimSelect values|iconPicker options

              icon_picker = new UniversalIconPicker(icon_picker_button_id, {
                allowEmpty:       iconPickerOptions.api_options.allowEmpty,
                iconLibraries:    iconPickerOptions.api_options.iconLibraries,
                iconLibrariesCss: iconPickerOptions.api_options.iconLibrariesCss,
                onSelect: function(jsonIconData) {
                  // copy selected icon to clipboard (iconClass)
                  var copyFrom = document.createElement('textarea');
                  copyFrom.value = jsonIconData.iconClass;
                  document.body.appendChild(copyFrom);
                  copyFrom.select();
                  document.execCommand('copy');
                  // Remove data element from body
                  setTimeout(function () {
                    document.body.removeChild(copyFrom);
                  }, 500);
                }
              });

              // save config settings into the toccer object for later access
              //
              _this['icon_picker']    = icon_picker;
              _this['moduleOptions']  = iconPickerOptions;

              _this.setState('finished');
              logger.debug('\n' + 'state: ' + _this.getState());
              logger.info('\n' + 'initializing module finished');

              endTimeModule = Date.now();
              logger.info('\n' + 'module initializing time: ' + (endTimeModule-startTimeModule) + 'ms');

              clearInterval(dependencies_met_picker_button_ready);
            }
          }, 10);

          clearInterval(dependencies_met_page_ready);
        }
      }, 10);

    }, // END init

    // -------------------------------------------------------------------------
    // int2float()
    // convert an integer to float using given precision (default: 2 decimals)
    // -------------------------------------------------------------------------
    int2float: function (number, precision=2) {
      return number.toFixed(precision);
    },

    // -------------------------------------------------------------------------
    // messageHandler()
    // manage messages send from other J1 modules
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
