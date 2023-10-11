---
regenerate:                             true
---

{% capture cache %}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/masterslider.js
 # Liquid template to adapt Averta MasterSlider Lite 2.85.13 (Feb 2022)
 #
 # Product/Info:
 # https://jekyll.one
 # Copyright (C) 2023 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # For details, see: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE.md
 # -----------------------------------------------------------------------------
 # Test data:
 #  {{ liquid_var | debug }}
 # -----------------------------------------------------------------------------
{% endcomment %}

{% comment %} Liquid var initialization
-------------------------------------------------------------------------------- {% endcomment %}

{% comment %} Set config files
-------------------------------------------------------------------------------- {% endcomment %}
{% assign template_config     = site.data.j1_config %}
{% assign modules             = site.data.modules %}

{% comment %} Set config data
-------------------------------------------------------------------------------- {% endcomment %}
{% assign slider_defaults     = modules.defaults.masterslider.defaults %}
{% assign slider_settings     = modules.masterslider.settings %}

{% comment %} Set config options
-------------------------------------------------------------------------------- {% endcomment %}
{% assign sliders             = slider_settings.sliders %}

/*
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/masterslider.js
 # J1 Adapter for Averta MasterSlider Lite v2.50.0 (Aug 2016)
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2023 Juergen Adams
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
  var sliderOptions = {};
  var sliders       = {};
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

      j1.masterslider           = {};
      j1.masterslider.instances = [];

      // -----------------------------------------------------------------------
      // Default module settings
      // -----------------------------------------------------------------------
      var settings = $.extend({
        module_name: 'j1.adapter.masterslider',
        generated:   '{{site.time}}'
      }, options);

      sliderOptions = $.extend({}, {{slider_defaults | replace: 'nil', 'null' | replace: '=>', ':' }});
      sliders       = $.extend({}, {{sliders | replace: 'nil', 'null' | replace: '=>', ':' }});

      // -----------------------------------------------------------------------
      // Global variable settings
      // -----------------------------------------------------------------------
      _this   = j1.adapter.masterslider;
      logger  = log4javascript.getLogger('j1.adapter.masterslider');

      // initialize state flag
      _this.setState('started');
      logger.debug('\n' + 'state: ' + _this.getState());
      logger.info('\n' + 'module is being initialized');

      _this.loadSliderHTML(sliderOptions, sliders);
      _this.initSliders(sliderOptions, sliders, true /* save_config */);

    }, // END init

    // -------------------------------------------------------------------------
    // postActionSliders()
    // NOTE: currently NOT used
    // -------------------------------------------------------------------------
    postActionSliders: function (options, slider) {
      var settings  = $.extend(options, slider);
      var setup     = {};

      var i=0;
      Object.keys(slider).forEach(function(key) {
        i++;
        if (slider[key].enabled) {
          logger.info('\n' + 'run slider post actions');
          setup = $.extend(settings.options, slider[key].options);

          if (setup.layout == 'partialview') {
            $('#' + slider[key].id).removeClass('ms-layout-partialview ms-wk');
            window.setTimeout(function() {
              logger.warn('\n' + 'modify slider layout partialview on id: ' + slider[key].id);
              //_this["masterslider_" + i].setup(slider[key].id, setup);
              $('#' + slider[key].id).addClass('ms-layout-partialview');
            }, 5000);
          } else {
            logger.debug('\n' + 'slider found disabled on id: ' + slider[key].id);
          }
        }
      });
    }, // END postActionSliders

    // -------------------------------------------------------------------------
    // loadSliderHTML()
    // load all master sliders (HTML portion) dynanically configured
    // and enabled (AJAX) from data file
    // NOTE: Make sure the placeholder is available in the content page
    // eg. using the asciidoc extension masterslider::
    // -------------------------------------------------------------------------
    loadSliderHTML: function (options, slider) {
      var numSliders      = Object.keys(slider).length;
      var active_sliders  = numSliders;
      var xhr_data_path   = options.xhr_data_path + '/index.html';
      var xhr_container_id;

      console.debug('load HTML portion of all sliders configured found in page');
      console.debug('number of sliders found: ' + numSliders);

      _this.setState('load_data');
      Object.keys(slider).forEach(function(key) {
        if (slider[key].enabled) {
          console.debug('load HTML data on slider id: ' + slider[key].id);

          xhr_container_id = 'p_' + slider[key].id;
          j1.loadHTML({
            xhr_container_id: xhr_container_id,
            xhr_data_path:    xhr_data_path,
            xhr_data_element: sliders[key].id
          });
        } else {
          console.debug('slider found disabled on id: ' + slider[key].id);
          active_sliders--;
        }
      });
      console.debug('sliders loaded in page active|deactive: ' + active_sliders + '|' + numSliders);
      _this.setState('data_loaded');
    }, // END loadSliderHTML

    // -------------------------------------------------------------------------
    // initSliders()
    // initialze all master sliders found in page
    // -------------------------------------------------------------------------
    initSliders: function (options, slider, save_config) {

      // create an 'MasterSlider' instance for all sliders configured
      //
      function createSliderInstances(sliders) {
        var i=0;
        Object.keys(sliders).forEach(function(key) {
          i++;
          logger.debug('\n' + 'create slider instances on id: ' + sliders[key].id);
          _this["masterslider_" + i] = new MasterSlider();
        });
      } // END createSliderInstances

      // run the method 'setup' on all sliders 'enabled'
      //
      function setupSliders(options, slider, save_config) {
        var i=0;
        Object.keys(slider).forEach(function(key) {
          i++;
          if (slider[key].enabled) {
            logger.debug('\n' + 'slider is being initialized on id: ' + slider[key].id);

            setup = $.extend(settings.options, slider[key].options );
            _this["masterslider_" + i].setup(slider[key].id, setup);

            if (save_config) {
              // save slider config for later access
              j1.masterslider.instances.push(_this["masterslider_" + i]);
            }
          } else {
            logger.debug('\n' + 'slider found disabled on id: ' + slider[key].id);
          }
        });
      } // END setupSliders

      // run the method 'control' on all sliders 'enabled'
      //
      function setupControls(options, slider) {
        const controlOptions    = options.controls;
        var control             = {};
        var numSliders          = Object.keys(slider).length;
        var index;
        numSliders--;

        var i=0;
        Object.keys(slider).forEach(function(key) {
          i++;
          index = parseInt(key);

          if (slider[index].enabled) {

            if (slider[index].controls) {
              // logger.info('\n' + 'slider controls are being initialized on id: ' + slider[index].id);

              Object.keys(slider[index].controls).forEach(function(key) {


                logger.info('\n' + 'slider control found id|key: ' + slider[index].id + '|' + key);
//              control = $.extend(sliderOptions.controls[key], slider[(i-1)].controls[key]);
//              control = $.extend(controlOptions[key], slider[index].controls[key]);
//              control = slider[index].controls[key];
//              $.extend(control, controlOptions[key]);
//              control = j1.mergeData(slider[index].controls[key], controlOptions[key]);
                control = $.extend({}, controlOptions[key], slider[index].controls[key]);


                // remove J1 config setting
                delete control['enabled'];
                _this["masterslider_" + i].control(key, control);
                // if (key > numSliders) break;
              });
            }
          } else {
            logger.info('\n' + 'slider found disabled on id: ' + slider[key].id);
          }
        });

      } // END setupControls

      var settings  = $.extend(options, slider);
      var setup     = {};
      var log_text;

      var dependencies_met_j1_finished = setInterval(function() {
        if (_this.getState() == 'data_loaded' && j1.getState() == 'finished') {
          window.masterslider_instances = window.masterslider_instances || [];

          // initialize state flag
          _this.setState('initialize_sliders');
          logger.debug('\n' + 'state: ' + _this.getState());
          logger.info('\n' + 'module is being initialized');

          log_text = '\n' + 'sliders are being initialized';
          logger.info(log_text);

          createSliderInstances(slider);
          setupControls(options, slider);
          setupSliders(options, slider, save_config);

          _this.setState('finished');
          logger.debug('\n' + 'state: ' + _this.getState());
          logger.info('\n' + 'initializing sliders finished');
          clearInterval(dependencies_met_j1_finished);
        } // END dependencies_met_j1_finished
      }, 25);

    }, // END initSliders

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
