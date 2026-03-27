---
regenerate:                             true
---

{% capture cache %}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/adapter/js/iconPickers.js
 # Liquid template to adapt the iconPickers module
 #
 # Product/Info:
 # https://jekyll.one
 # Copyright (C) 2023-2025 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # For details, see: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
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
{% assign environment         = site.environment %}
{% assign asset_path          = "/assets/theme/j1" %}

{% comment %} Process YML config data
================================================================================ {% endcomment %}

{% comment %} Set config files
-------------------------------------------------------------------------------- {% endcomment %}
{% assign template_config     = site.data.j1_config %}
{% assign blocks              = site.data.blocks %}
{% assign modules             = site.data.modules %}

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
 # ~/assets/theme/j1/adapter/js/iconPickers.js
 # J1 Adapter for the iconPickers module
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2023-2025 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # For details, see: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
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
j1.adapter.iconPickerPage = (function (j1, window) {

{% comment %} Set global variables
-------------------------------------------------------------------------------- {% endcomment %}
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
        module_name: 'j1.adapter.iconPickerPage',
        generated:   '{{site.time}}'
      }, options);

      // -----------------------------------------------------------------------
      // Global variable settings
      // -----------------------------------------------------------------------
      iconPickerDefaults  = $.extend({}, {{icon_picker_defaults | replace: 'nil', 'null' | replace: '=>', ':' }});
      iconPickerSettings  = $.extend({}, {{iconPicker_settings | replace: 'nil', 'null' | replace: '=>', ':' }});
      iconPickerOptions   = $.extend(true, {}, iconPickerDefaults, iconPickerSettings);

      slimSelectDefaults  = $.extend({}, {{slim_select_defaults | replace: 'nil', 'null' | replace: '=>', ':' }});
      slimSelectSettings  = $.extend({}, {{slim_select_settings | replace: 'nil', 'null' | replace: '=>', ':' }});
      slimSelectOptions   = $.extend(true, {}, slimSelectDefaults, slimSelectSettings);

      // -----------------------------------------------------------------------
      // initializer
      // -----------------------------------------------------------------------
      _this   = j1.adapter.iconPickerPage;
      logger  = log4javascript.getLogger('j1.adapter.iconPickerPage');

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
        pickerButton.addEventListener('click', (event) => {
          event.preventDefault();
        }); // END pickerButton (click)

        // setup slimSelect events|iconPicker options
        logger.info('\n' + 'slimSelect: setup events');
        init_select_events();
      } // END init_select

      function init_select_events() {

        const $slimSelect = j1.adapter.slimSelect.select.icon_library;
        $slimSelect.events.afterClose = () => {
          const icon_picker         = j1.adapter.iconPicker.icon_picker;
          const select              = document.getElementById(selectID);

          var currentIconLibrary    = select.value;
          var currentIconLibraryCss = select.options[select.selectedIndex].dataset.css;

          logger.debug('\n' + 'select: use current IconLibrary: ' + currentIconLibrary);

          // apply selection
          currentIconLibrary        = select.value;
          currentIconLibraryCss     = select.options[select.selectedIndex].dataset.css;

          icon_picker.setOptions({
            iconLibraries:          [currentIconLibrary + '.min.json'],
            iconLibrariesCss:       [currentIconLibraryCss]
          });
        }
      } // END init_select_events

      var dependencies_met_page_ready = setInterval (() => {
        var pageState   = $('#content').css("display");
        var pageVisible = (pageState == 'block') ? true : false;
        var j1Finished  = (j1.getState() == 'finished') ? true : false;

        if (j1Finished && pageVisible) {

          _this.setState('started');
          logger.debug('\n' + 'set module state to: ' + _this.getState());
          logger.info('\n' + 'initializing page: started');

          var dependencies_met_modules_ready = setInterval(() => {
            var selectState         = $('#container_icon_library_select_wrapper').length;
            var selectReady         = (selectState > 0) ? true : false;
            var slimSelectFinished  = (j1.adapter.slimSelect.getState() === 'finished') ? true: false;
//          var iconPickerFinished = (j1.adapter.iconPicker.getState() === 'finished') ? true: false;

            if (slimSelectFinished && selectReady) {

              var selectContainer   = document.getElementById('container_icon_library_select_wrapper');
              var wrapperContainer  = document.getElementById('icon_library_select_wrapper');
              var childs            = wrapperContainer.childNodes;

              // create|place button <div> element
              //
              var buttonHTML      =  '';
              buttonHTML          += '<a id="icon_picker" href="#"';
              buttonHTML          += '  class="btn btn-info btn-flex btn-lg"';
              buttonHTML          += '  aria-label="Icon Picker">';
              buttonHTML          += '  <i class="mdi mdi-emoticon mdi-2x mr-2"></i>';
              buttonHTML          += '  Show Icons Selected';
              buttonHTML          += '</a>';

              var buttonDIV       = document.createElement('div');
              buttonDIV.id        = "picker_button_wrapper";
              buttonDIV.className = "{{icon_picker_options.picker_button_wrapper_classes}}";
              buttonDIV.innerHTML = buttonHTML;
              document.getElementById('icon_library_select_wrapper').appendChild(buttonDIV);
              // wrapperContainer.parentNode.insertBefore(buttonDIV.id, wrapperContainer);

              var dependencies_met_button_ready = setInterval (() => {
                var buttonState = $('#picker_button_wrapper').length;
                var buttonReady = (buttonState > 0) ? true : false;

                if (buttonReady) {
                  var divToMove   = document.getElementById('picker_button_wrapper')
                  var existingDiv = document.getElementById('container_icon_library_select_wrapper');

                  document.getElementById('container_icon_library_select_wrapper').appendChild(buttonDIV);

                  // wrapperContainer.parentNode.insertBefore(buttonDIV.id, wrapperContainer);
                  // existingDiv.insertBefore(divToMove, existingDiv);

                  clearInterval(dependencies_met_button_ready);
                }
              }, 10);

//            selectContainer.parentNode.insertBefore(buttonDIV.id, selectContainer);
//            document.getElementById('icon_library_select_wrapper').appendChild(buttonDIV);
//            var parentNode      = buttonContainer.parentNode;

              // document.getElementById('container_icon_library_select_wrapper').appendChild(buttonDIV);
              // var buttonContainer = document.getElementById(buttonDIV.id);

              // var selectContainer   = document.getElementById('container_icon_library_select_wrapper');
              // var wrapperContainer  = document.getElementById('icon_library_select_wrapper');
              // var childs            = wrapperContainer.childNodes;

              var dependencies_met_div_ready = setInterval (() => {
                var divState            = $('#icon_picker').length;
                var divReady            = (divState > 0) ? true : false;
                var iconPickerFinished  = (j1.adapter.iconPicker.getState() === 'finished') ? true: false;

                if (divReady && iconPickerFinished) {

                  // setup initial slimSelect values|iconPicker options
                  init_select();

                  clearInterval(dependencies_met_div_ready);
                }
              }, 10);

              clearInterval(dependencies_met_modules_ready);
            } // END if modules loaded
          }, 10);

          _this.setState('finished');
          logger.debug('\n' + 'state: ' + _this.getState());
          logger.info('\n' + 'initializing page: finished');

          clearInterval(dependencies_met_page_ready);
        } // END if page loaded
      }, 10);
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
