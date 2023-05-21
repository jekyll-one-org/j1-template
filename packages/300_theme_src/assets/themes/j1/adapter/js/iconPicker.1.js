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
 # Copyright (C) 2023 Juergen Adams
 #
 # J1 Theme is licensed under the MIT License.
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
{% assign icon_picker_defaults  = modules.defaults.iconPicker.defaults %}
{% assign icon_picker_settings  = modules.iconPicker.settings %}

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
 # Copyright (C) 2023 Juergen Adams
 #
 # J1 Theme is licensed under the MIT License.
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
var environment     = '{{environment}}';
var iconPickerDefaults;
var iconPickerSettings;
var iconPickerOptions;
var frontmatterOptions;
var icon_picker;
var iconLibraries;
var iconLibrariesCss;
var _this;
var logger;
var logText;

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

      // create settings object from frontmatter
      frontmatterOptions = options != null ? $.extend({}, options) : {};

      // create settings object from module options
      iconPickerDefaults = $.extend({}, {{icon_picker_defaults | replace: 'nil', 'null' | replace: '=>', ':' }});
      iconPickerSettings = $.extend({}, {{icon_picker_settings | replace: 'nil', 'null' | replace: '=>', ':' }});
      iconPickerOptions  = $.extend(true, {}, iconPickerDefaults, iconPickerSettings, frontmatterOptions);

      _this  = j1.adapter.iconPicker;
      logger = log4javascript.getLogger('j1.adapter.iconPicker');


      // -----------------------------------------------------------------------
      // initializer
      // -----------------------------------------------------------------------
      var dependencies_met_page_ready = setInterval (function (options) {
        var pageState     = $('#no_flicker').css("display");
        var pageVisible   = (pageState == 'block') ? true : false;
        var atticFinished = (j1.adapter.attic.getState() == 'finished') ? true: false;

        if (j1.getState() === 'finished' && pageVisible && atticFinished) {

          _this.setState('started');
          logger.debug('\n' + 'state: ' + _this.getState());
          logger.info('\n' + 'module is being initialized');


          let txt = "";
          iconPickerDefaults.iconLibraries.forEach(myFunction);

          function myFunction(value, index, array) {
            txt += '\'' + value + '\',';
          }



          iconLibraries     = JSON.stringify(iconPickerDefaults.iconLibraries);
          var myString      = iconLibraries.replace(/^\[|\]$/g, '');

//        var iconLibrariesJSON = iconLibraries.substring(1).substr(0, iconLibraries.length-1);
//        iconLibrariesJSON = iconLibraries.substr(0, iconLibrariesJSON.length-1);
//        iconLibraries = iconLibraries.substring(1, str.length - 1);
//        iconLibraries = iconLibraries.substring(0, str.length - 1);

          iconLibrariesCss  = JSON.stringify(iconPickerDefaults.iconLibrariesCss);

          icon_picker = new UniversalIconPicker('#selector', {
            iconLibraries:    [ txt ],
            iconLibrariesCss: [
              'https://cdn.jsdelivr.net/npm/@mdi/light-font@0.2.63/css/materialdesignicons-light.min.css',
              'https://cdnjs.cloudflare.com/ajax/libs/MaterialDesign-Webfont/7.2.96/css/materialdesignicons.min.css',
              'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
            ],
            onSelect: function(jsonIconData) {
              document.getElementById('output').innerHTML = jsonIconData.iconMarkup;
              console.log(jsonIconData);
            }
          });

          logger.info('\n' + 'initializing module finished');
          clearInterval(dependencies_met_page_ready);
        }
      }, 25);

    }, // END init

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
