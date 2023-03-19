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
 # J1 Theme is licensed under the MIT License.
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
{% assign slider_options      = slider_defaults | merge: slider_settings %}
{% assign save_slider_config  = slider_options.save_slider_config %}
{% assign module_version      = slider_options.module_version %}
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
 # J1 Theme is licensed under the MIT License.
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
  var environment       = '{{environment}}';
  var moduleVersion     = '{{module_version}}';
  var saveSliderConfig  = j1.stringToBoolean('{{save_slider_config}}');
  var sliderOptions     = {};
  var sliders           = {};
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
      var msSliderManager;

      msSliderManager             = document.createElement('script');
      msSliderManager.id          = 'ms-slider-manager';
      msSliderManager.innerHTML   = `
// initialize slider controls and setup
//------------------------------------------------------------------------------
// $(document).ready(function() {
//  var dependencies_met_data_loaded = setInterval(function() {
//    if (j1.getState() == 'finished') {
`;

      // used for later access
      j1.masterslider           = {};
      j1.masterslider.instances = j1.masterslider.instances || [];

      // -----------------------------------------------------------------------
      // Default module settings
      // -----------------------------------------------------------------------
      var settings = $.extend({
        module_name: 'j1.adapter.masterslider',
        generated:   '{{site.time}}'
      }, options);

      // collect slider data
      sliderOptions = $.extend({}, {{slider_options | replace: 'nil', 'null' | replace: '=>', ':' }});
      sliders       = $.extend({}, {{slider_options.sliders | replace: 'nil', 'null' | replace: '=>', ':' }});

      // -----------------------------------------------------------------------
      // Global variable settings
      // -----------------------------------------------------------------------
      _this   = j1.adapter.masterslider;
      logger  = log4javascript.getLogger('j1.adapter.masterslider');

      // initialize state flag
      _this.setState('started');
      console.debug('module state: ' + _this.getState());

      // load HTML portion for all sliders configured
      console.debug('load HTML portion for all sliders configured');
      _this.loadSliderHTML(sliderOptions, sliders);
      // create an 'MasterSlider' instance for all sliders configured
      console.debug('create an \'MasterSlider\' instance for all sliders configured');
      _this.createSliderInstances(sliders, msSliderManager);

      // initialize all sliders configured
      var dependencies_met_data_loaded = setInterval(function() {
        if (_this.getState() == 'data_loaded' && j1.getState() == 'finished') {
          logger.info('\n' + 'ms module version detected: ' + moduleVersion);
          logger.info('\n' + 'module is being initialized');
          _this.initSliders(sliderOptions, sliders, msSliderManager, saveSliderConfig);
          clearInterval(dependencies_met_data_loaded);
        } // END dependencies_met_j1_finished
      }, 25);

      // final state messages
      var dependencies_met_module_finished = setInterval(function() {
        if (_this.getState() == 'sliders_initialized' && j1.getState() == 'finished') {
            _this.setState('finished');

            // msSliderManager.innerHTML +=  `
            // clearInterval(dependencies_met_data_loaded);
            // } // END dependencies_met_j1_finished
            // }, 25);
            // `
            // msSliderManager.innerHTML +=  '   });'

            document.body.appendChild(msSliderManager);
            logger.info('\n' + 'initializing module finished');
            clearInterval(dependencies_met_module_finished);
        } // END dependencies_met_j1_finished
      }, 25);

    }, // END init

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

      // console.debug('load HTML portion of all sliders configured found in page');
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
    // createSliderInstances()
    // create an 'MasterSlider' instance for all sliders configured
    // -------------------------------------------------------------------------
    createSliderInstances: function (sliders, sliderManager) {
      var msSliderManager = sliderManager;
      var newline         = '\n';
      var numSliders      = Object.keys(sliders).length;

      msSliderManager.innerHTML += newline;
      var i=0;
      Object.keys(sliders).forEach(function(key) {
        var msSliderManagerItem;
        i++;
        console.debug('create slider instance on id: ' + sliders[key].id);

        msSliderManagerItem        =  '\n' + 'var masterslider_' + i + ' = new MasterSlider();';
        msSliderManager.innerHTML +=  '        ' + msSliderManagerItem;
//      _this["masterslider_" + i] = new MasterSlider();
      });

      console.debug('slider instances created: ' + numSliders);
    }, // END loadSliderHTML

    // -------------------------------------------------------------------------
    // initSliders()
    // initialze all master sliders found in page. Dynamically apply properties
    // for methods 'setup' and 'control'.
    // -------------------------------------------------------------------------
    initSliders: function (options, slider, sliderManager, save_config) {
      var msSliderManager = sliderManager;
      var newline         = '\n';

      // run the method 'control' on all sliders 'enabled'
      //
      function setupControls(options, slider, sliderManager) {
        const controlOptions = options.controls;
        var msSliderManager  = sliderManager;
        var index;
        var i=0;

        logger.info('\n' + 'generate slider controls');

        msSliderManager.innerHTML += newline;
        Object.keys(slider).forEach(function(key) {
          i++;                                                                  // instance index
          index = parseInt(key);                                                // object index

          if (slider[index].enabled) {
            if (slider[index].controls) {
              Object.keys(slider[index].controls).forEach(function(key) {
                var msSliderManagerItem = '\n';
                logger.info('\n' + 'slider control found id|key: ' + slider[index].id + '|' + key);
                // merge settings, defaults into control
                control = $.extend({}, controlOptions[key], slider[index].controls[key]);
                // remove J1 config setting
                delete control['enabled'];

                msSliderManagerItem        = '    ' + 'masterslider_' + i + '.control(' + '\'' + key + '\'' +  ', ' + JSON.stringify(control) + ');'
                msSliderManager.innerHTML +=  msSliderManagerItem + '\n';

                // _this["masterslider_" + i].control(key, control);
              });
            } else {
              logger.info('\n' + 'no slider controls found on id: ' + slider[key].id);
            }
          } else {
            logger.info('\n' + 'slider found disabled on id: ' + slider[key].id);
          }
        });
      } // END setupControls

      // run the method 'setup' on all sliders 'enabled'
      //
      function setupSliders(options, slider, sliderManager, save_config) {
        const controlOptions = options.controls;
        var msSliderManager  = sliderManager;
        var control          = {};
        var index;

        logger.info('\n' + 'generate slider setup');

        msSliderManager.innerHTML += newline;
        var i=0;
        Object.keys(slider).forEach(function(key) {
          var msSliderManagerItem = '\n';
          i++;                                                                  // instance index
          index = parseInt(key);                                                // object index
          if (slider[index].enabled) {
            logger.info('\n' + 'slider is being initialized on id: ' + slider[key].id);

            setup                      = $.extend({}, settings.options, slider[index].options);
            msSliderManagerItem        = '    ' + 'masterslider_' + i + '.setup(' + '\'' + slider[key].id + '\'' + ', ' + JSON.stringify(setup) + ');'
            msSliderManager.innerHTML +=  msSliderManagerItem + '\n';

            // _this["masterslider_" + i].setup(slider[key].id, setup);

            if (save_config) {
              // save slider config for later access
              j1.masterslider.instances.push(_this["masterslider_" + i]);
            }
          } else {
            logger.debug('\n' + 'slider found disabled on id: ' + slider[key].id);
          }
        });
        _this.setState('sliders_initialized');
        logger.debug('\n' + 'state: ' + _this.getState());
        logger.info('\n' + 'initializing sliders finished');
      } // END setupSliders

      var settings  = $.extend({}, options, slider);
      var control   = {};
      var setup     = {};
      var log_text;

      _this.setState('initialize_sliders');
      logger.debug('\n' + 'state: ' + _this.getState());
      log_text = '\n' + 'sliders are being initialized';
      logger.info(log_text);

      setupControls(options, slider, msSliderManager);
      setupSliders(options, slider, msSliderManager, save_config);

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
