---
regenerate:                             true
---

{% capture cache %}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/iconPickers.js
 # Liquid template to adapt the iconPickers module
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
 #  iconPicker_options:  {{ iconPicker_options | debug }}
 # -----------------------------------------------------------------------------
{% endcomment %}

{% comment %} Liquid procedures
-------------------------------------------------------------------------------- {% endcomment %}

{% comment %} Set global settings
-------------------------------------------------------------------------------- {% endcomment %}
{% assign environment          = site.environment %}
{% assign asset_path           = "/assets/themes/j1" %}

{% comment %} Process YML config data
================================================================================ {% endcomment %}

{% comment %} Set config files
-------------------------------------------------------------------------------- {% endcomment %}
{% assign template_config      = site.data.j1_config %}
{% assign blocks               = site.data.blocks %}
{% assign modules              = site.data.modules %}

{% comment %} Set config data (settings only)
-------------------------------------------------------------------------------- {% endcomment %}
{% assign icon_picker_defaults = modules.defaults.icon_picker.defaults %}
{% assign icon_picker_settings = modules.icon_picker.settings %}
{% assign slim_select_defaults = modules.defaults.slim_select.defaults %}
{% assign slim_select_settings = modules.slim_select.settings %}

{% comment %} Set config options
-------------------------------------------------------------------------------- {% endcomment %}
{% assign icon_picker_options  = icon_picker_defaults | merge: icon_picker_settings %}
{% assign slim_select_options  = slim_select_defaults | merge: slim_select_settings %}

/*
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/iconPickers.js
 # J1 Adapter for the iconPickers module
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2023, 2024 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # For details, see: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE.md
 # -----------------------------------------------------------------------------
 # NOTE: iconPicker styles defind in /assets/data/panel.html, key 'iconPicker'
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
j1.adapter.iconPickerPage = ((j1, window) => {

  {% comment %} Set global variables
  ------------------------------------------------------------------------------ {% endcomment %}
  const selectID  = 'icon_library';

  var iconPickerDefaults;
  var iconPickerSettings;
  var iconPickerOptions;

  var slimSelectDefaults;
  var slimSelectSettings;
  var slimSelectOptions;

  var _this;
  var logger;
  var logText;

  // ---------------------------------------------------------------------------
  // main
  // ---------------------------------------------------------------------------
  return {

    // -------------------------------------------------------------------------
    // adapter initializer
    // -------------------------------------------------------------------------
    init: (options) => {

      // -----------------------------------------------------------------------
      // default module settings
      // -----------------------------------------------------------------------
      var settings = $.extend({
        module_name: 'j1.adapter.iconPickerPage',
        generated:   '{{site.time}}'
      }, options);

      // -----------------------------------------------------------------------
      // global variable settings
      // -----------------------------------------------------------------------
      iconPickerDefaults  = $.extend({}, {{icon_picker_defaults | replace: 'nil', 'null' | replace: '=>', ':' }});
      iconPickerSettings  = $.extend({}, {{iconPicker_settings | replace: 'nil', 'null' | replace: '=>', ':' }});
      iconPickerOptions   = $.extend(true, {}, iconPickerDefaults, iconPickerSettings);

      slimSelectDefaults  = $.extend({}, {{slim_select_defaults | replace: 'nil', 'null' | replace: '=>', ':' }});
      slimSelectSettings  = $.extend({}, {{slim_select_settings | replace: 'nil', 'null' | replace: '=>', ':' }});
      slimSelectOptions   = $.extend(true, {}, slimSelectDefaults, slimSelectSettings);

      _this   = j1.adapter.iconPickerPage;
      logger  = log4javascript.getLogger('j1.adapter.iconPicker');

      function init_select() {
        // set initial select values
        const select              = document.getElementById(selectID);
        const icon_picker         = j1.adapter.iconPicker.icon_picker;

        var currentIconLibrary    = select.value;
        var currentIconLibraryCss = select.options[select.selectedIndex].dataset.css;

        icon_picker.setOptions({
          iconLibraries:          [currentIconLibrary + '.min.json'],
          iconLibrariesCss:       [currentIconLibraryCss]
        });

        // stop default actions on picker button
        const pickerButton = document.getElementById('icon_picker');
        pickerButton.addEventListener('click', (e) => {
          // suppress default actions|bubble up
          e.preventDefault();
          e.stopPropagation();
        }); // END pickerButton (click)

        // setup slimSelect events|iconPicker options
        logger.info('\n' + 'setup select events');
        init_select_events();

        _this.setState('finished');
        logger.debug('\n' + 'state: ' + _this.getState());
        logger.info('\n' + 'initializing finished');
      } // END init_select

      function init_select_events() {

        const $slimSelect = j1.adapter.slimSelect.select.icon_library;
        $slimSelect.events.afterClose = () => {
          const icon_picker         = j1.adapter.iconPicker.icon_picker;
          const select              = document.getElementById(selectID);

          var currentIconLibrary    = select.value;
          var currentIconLibraryCss = select.options[select.selectedIndex].dataset.css;

          logger.debug('\n' + 'use current IconLibrary: ' + currentIconLibrary);

          // apply selection
          currentIconLibrary        = select.value;
          currentIconLibraryCss     = select.options[select.selectedIndex].dataset.css;

          icon_picker.setOptions({
            iconLibraries:          [currentIconLibrary + '.min.json'],
            iconLibrariesCss:       [currentIconLibraryCss]
          });
        }
      } // END init_select_events

      // -----------------------------------------------------------------------
      // module initializer
      // -----------------------------------------------------------------------
      var dependencies_met_page_ready = setInterval (() => {
        var pageState   = $('#content').css("display");
        var pageVisible = (pageState === 'block') ? true : false;
        var j1Finished  = (j1.getState() === 'finished') ? true : false;

        if (j1Finished && pageVisible) {
          _this.setState('started');
          logger.debug('\n' + 'set module state to: ' + _this.getState());
          logger.info('\n' + 'initializing started');

          var dependencies_met_modules_ready = setInterval(() => {
            var selectState         = $('#container_icon_library_select_wrapper').length;
            var selectReady         = (selectState > 0) ? true : false;
            var slimSelectFinished  = (j1.adapter.slimSelect.getState() === 'finished') ? true: false;
            var iconPickerFinished = (j1.adapter.iconPicker.getState() === 'finished') ? true: false;

            if (slimSelectFinished && iconPickerFinished && selectReady) {
              logger.info('\n' + 'initializing select data');

              // setup initial slimSelect values|iconPicker options
              init_select();

              clearInterval(dependencies_met_modules_ready);
            } // END if modules loaded
          }, 10); // END if modules loaded

          const dummy = document.getElementById('dummy');
          dummy.remove();

          var wrapperContainer = document.getElementById('icon_library_select_wrapper');
          wrapperContainer.classList.add('mb-10');

          clearInterval(dependencies_met_page_ready);
        } // END if page loaded
      }, 10); // END dependencies_met_page_ready
    }, // END init

    // -------------------------------------------------------------------------
    // messageHandler()
    // manage messages send from other J1 modules
    // -------------------------------------------------------------------------
    messageHandler: (sender, message) => {
      var json_message = JSON.stringify(message, undefined, 2);

      logText = '\n' + 'received message from ' + sender + ': ' + json_message;
      logger.debug(logText);

      // -----------------------------------------------------------------------
      //  process commands|actions
      // -----------------------------------------------------------------------
      if (message.type === 'command' && message.action === 'module_initialized') {

        //
        // place handling of command|action here
        //

        logger.info('\n' + message.text);
      }

      //
      // place handling of other command|action here
      //

      return true;
    }, // END messageHandler

    // -------------------------------------------------------------------------
    // setState()
    // sets the current (processing) state of the module
    // -------------------------------------------------------------------------
    setState: (stat) => {
      _this.state = stat;
    }, // END setState

    // -------------------------------------------------------------------------
    // getState()
    // Returns the current (processing) state of the module
    // -------------------------------------------------------------------------
    getState: () => {
      return _this.state;
    } // END getState

  }; // END main (return)
})(j1, window);

{% endcapture %}
{% if production %}
  {{ cache | minifyJS }}
{% else %}
  {{ cache | strip_empty_lines }}
{% endif %}
{% assign cache = nil %}
