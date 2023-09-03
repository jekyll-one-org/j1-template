---
regenerate:                             true
---

{% capture cache %}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/masterslider.js
 # Liquid template to adapt Averta MasterSlider Lite
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
{% assign environment                = site.environment %}
{% assign template_config            = site.data.j1_config %}
{% assign modules                    = site.data.modules %}

{% comment %} Set config data
-------------------------------------------------------------------------------- {% endcomment %}
{% assign master_slider_defaults     = modules.defaults.masterslider.defaults %}
{% assign master_slider_settings     = modules.masterslider.settings %}

{% comment %} Set config options
-------------------------------------------------------------------------------- {% endcomment %}
{% assign master_slider_options      = master_slider_defaults | merge: master_slider_settings %}
{% assign lightbox_enabled           = master_slider_options.enable_lightbox %}
{% assign slider_manager             = master_slider_options.slider_manager %}
{% assign save_slider_config         = master_slider_options.save_slider_config %}
{% assign module_version             = master_slider_options.module_version %}

{% comment %} Detect prod mode
-------------------------------------------------------------------------------- {% endcomment %}
{% assign production = false %}
{% if environment == 'prod' or environment == 'production' %}
  {% assign production = true %}
{% endif %}


/*
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/masterslider.js
 # J1 Adapter for Averta MasterSlider Lite v2.85.13 (Feb 2022)
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
  var sliderManager     = j1.stringToBoolean('{{slider_manager}}');
  var lightboxEnabled   = j1.stringToBoolean('{{lightbox_enabled}}');
  var saveSliderConfig  = j1.stringToBoolean('{{save_slider_config}}');
  var newline           = '\n';
  var state             = 'not_started';

  var masterSliderDefaults;
  var masterSliderSettings;
  var masterSliderOptions;
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

      if (sliderManager) {
        msSliderManager             = document.createElement('script');
        msSliderManager.id          = 'ms-slider-manager';
        msSliderManager.innerHTML   = '';
      }

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

      // Load  module DEFAULTS|CONFIG
      masterSliderDefaults = $.extend({}, {{master_slider_defaults | replace: 'nil', 'null' | replace: '=>', ':' }});
      masterSliderSettings = $.extend({}, {{master_slider_settings | replace: 'nil', 'null' | replace: '=>', ':' }});
      masterSliderOptions = $.extend({}, masterSliderDefaults, masterSliderSettings);

      // -----------------------------------------------------------------------
      // Global variable settings
      // -----------------------------------------------------------------------
      _this   = j1.adapter.masterslider;
      logger  = log4javascript.getLogger('j1.adapter.masterslider');

      // initialize state flag
      //
      _this.setState('started');
      // console.debug('module state: ' + _this.getState());

      // load HTML portion for sliders configured
      // console.debug('loading HTML portion for all sliders configured');
      _this.loadSliderHTML(masterSliderOptions, masterSliderOptions.sliders);
      // create an 'MasterSlider' instance for all sliders configured
      // console.debug('create an \'MasterSlider\' instance for all MS sliders configured');
      _this.createSliderInstances(masterSliderOptions.sliders, msSliderManager);

      // initialize sliders configured if HTML portion (of sliders) loaded
      //
      var dependencies_met_data_loaded = setInterval(function() {
        if (_this.getState() == 'data_loaded') {
          logger.info('\n' + 'ms module version detected: ' + moduleVersion);
          logger.info('\n' + 'module is being initialized');
          // console.debug('MS slider module is being initialized');
          _this.initSliders(masterSliderOptions, masterSliderOptions.sliders, msSliderManager, saveSliderConfig);
          clearInterval(dependencies_met_data_loaded);
        } // END dependencies_met_j1_finished
      }, 10);

      // make sure the 'content' section is visible BEFORE setting-up sliders
      //
      var dependencies_met_module_finished = setInterval(function() {
        var contentState    = $('#content').css("display");
        var contentVisible  = (contentState == 'block') ? true: false;
        var atticFinished   = (j1.adapter.attic.getState() == 'finished') ? true: false;

        if (_this.getState() == 'sliders_initialized' && contentVisible && atticFinished) {
            // TODO: Check why a timeout is required to load the Slider Manager
            setTimeout (function() {
              if (sliderManager) document.body.appendChild(msSliderManager);
              // final state|messages
              _this.setState('finished');
              logger.info('\n' + 'initializing module finished');
              // console.debug('initializing MS slider module finished');
            }, masterSliderOptions.slider_manager_load_timeout);
            clearInterval(dependencies_met_module_finished);
        } // END dependencies_met_j1_finished
      }, 10);

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
      // console.debug('number of sliders found: ' + numSliders);

      _this.setState('load_data');
      Object.keys(slider).forEach(function(key) {
        if (slider[key].enabled) {
          // console.debug('load HTML data on slider id: ' + slider[key].id);

          xhr_container_id = 'p_' + slider[key].id;
          j1.loadHTML({
            xhr_container_id: xhr_container_id,
            xhr_data_path:    xhr_data_path,
            xhr_data_element: slider[key].id
          });
        } else {
          // console.debug('slider found disabled on id: ' + slider[key].id);
          active_sliders--;
        }
      });
      // console.debug('sliders loaded in page active|deactive: ' + active_sliders + '|' + numSliders);
      _this.setState('data_loaded');
    }, // END loadSliderHTML

    // -------------------------------------------------------------------------
    // createSliderInstances()
    // create an 'MasterSlider' instance for all sliders configured
    // -------------------------------------------------------------------------
    createSliderInstances: function (sliders, sliderManager) {
      var msSliderManager = sliderManager;
      var numSliders      = Object.keys(sliders).length;
      var msSliderManagerItem;

      // add jQuery ready() function once
      // if (sliderManager) {
      //   msSliderManagerItem        = '$(function() {' + '\n';
      //   msSliderManagerItem       += '  // console.debug("initializing MS Slider Manager");' + '\n';
      //   msSliderManagerItem       += '\n';
      //   msSliderManager.innerHTML  = msSliderManagerItem;
      // }

      var i=0;
      Object.keys(sliders).forEach(function(key) {
        i++;
        // console.debug('create slider instance on id: ' + sliders[key].id);

        if (sliderManager) {
          msSliderManagerItem        = '  var masterslider_' + i + ' = new MasterSlider();' + '\n';
          msSliderManager.innerHTML += msSliderManagerItem;
        } else {
          _this["masterslider_" + i] = new MasterSlider();
        }

      });

      // console.debug('slider instances created: ' + numSliders);
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

        if (sliderManager) msSliderManager.innerHTML += newline;
        Object.keys(slider).forEach(function(key) {
          i++;                                                                  // instance index
          index = parseInt(key);                                                // object index

          if (slider[index].enabled) {
            if (slider[index].controls) {
              Object.keys(slider[index].controls).forEach(function(key) {
                var msSliderManagerItem = '\n';
                logger.debug('\n' + 'slider control found id|key: ' + slider[index].id + '|' + key);

                // merge settings, defaults into control
                control = $.extend({}, controlOptions[key], slider[index].controls[key]);
                // remove J1 config setting
                delete control['enabled'];

                if (sliderManager) {
                  msSliderManagerItem        = '    ' + 'masterslider_' + i + '.control(' + '\'' + key + '\'' +  ', ' + JSON.stringify(control) + ');'
                  msSliderManager.innerHTML +=  msSliderManagerItem + '\n';
                } else {
                  _this["masterslider_" + i].control(key, control);
                }

              });
            } else {
              logger.debug('\n' + 'no slider controls found on id: ' + slider[key].id);
            }
          } else {
            logger.debug('\n' + 'slider found disabled on id: ' + slider[key].id);
          }
        });
      } // END setupControls

      // initialize plugins on all sliders if 'enabled'
      //
      function setupPlugIns(options, slider, sliderManager) {
        const pluginOptions = options.plugins;
        var msSliderManager = sliderManager;
        var plugins         = {};
        var pluginSettings;
        var index;
        var i=0;

        logger.debug('\n' + 'generate slider plugins');

        if (sliderManager) msSliderManager.innerHTML += newline;
        Object.keys(slider).forEach(function(key) {
          i++;                                                                  // instance index
          index = parseInt(key);                                                // object index

          if (slider[index].enabled) {
            if (slider[index].plugins) {
              Object.keys(slider[index].plugins).forEach(function(key) {
                var msSliderManagerItem = '\n';
                logger.info('\n' + 'slider plugin found id|key: ' + slider[index].id + '|' + key);

                // merge settings, defaults into 'plugins'
                plugins = $.extend({}, pluginOptions, slider[index].plugins);

                // generate setup for plugin 'MSScrollParallax'
                // NOTE: for the MS config, the plugin 'MSScrollParallax'  is named ' J1ScrollParallax'
                if (plugins.J1ScrollParallax.enabled) {
                  // remove J1 config settings
                  delete plugins.J1ScrollParallax.enabled;

                  // create a 'properties' string
                  pluginSettings = JSON.stringify(plugins.J1ScrollParallax).replace(/"/g, '').replace(/{/g, '').replace(/}/g, '');
                  logger.debug('\n' + 'plugin J1ScrollParallax found: ' + pluginSettings);

                  // remove property names to get a pure 'parameter' string
                  pluginSettings = pluginSettings.replace(/layers_parallax_depth:/g, '');
                  pluginSettings = pluginSettings.replace(/background_parallax_depth:/g, '');
                  pluginSettings = pluginSettings.replace(/fade_layers:/g, '');

                  if (sliderManager) {
                    msSliderManagerItem        = '    ' + 'MSScrollParallax.setup(masterslider_' + i + ', ' + pluginSettings + ');';
                    msSliderManager.innerHTML +=  msSliderManagerItem + '\n';
                  } else {
                    MSScrollParallax.setup(j1.masterslider.instances[index], pluginSettings);
                  }
                } // END plugin 'MSScrollParallax'
              });
            } else {
              logger.debug('\n' + 'no slider plugins found on id: ' + slider[key].id);
            }
          } else {
            logger.debug('\n' + 'slider found disabled on id: ' + slider[key].id);
          }
        });
      } // END setupPlugIns

      // run the method 'setup' on all sliders 'enabled'
      //
      function setupSliders(options, slider, sliderManager, save_config) {
        const controlOptions = options.controls;
        var msSliderManager  = sliderManager;
        var control          = {};
        var index;

        logger.info('\n' + 'generate slider setup');

        if (sliderManager) msSliderManager.innerHTML += newline;
        var i=0;
        Object.keys(slider).forEach(function(key) {
          var msSliderManagerItem = '\n';
          i++;                                                                  // instance index
          index = parseInt(key);                                                // object index
          if (slider[index].enabled) {
            logger.info('\n' + 'slider is being initialized on id: ' + slider[key].id);

            // merge settings, defaults into 'setup'
            setup = $.extend({}, settings.options, slider[index].options);

            // log the filter object if enabled
            if (setup.filters != null) {
              var filterSettings = JSON.stringify(setup.filters).replace(/"/g, '');
              logger.debug('\n' + 'filters found: ' + filterSettings.replace(/{/g, '').replace(/}/g, ''));
            }

            if (sliderManager) {
              msSliderManagerItem        = '    ' + 'masterslider_' + i + '.setup(' + '\'' + slider[key].id + '\'' + ', ' + JSON.stringify(setup) + ');'
              msSliderManager.innerHTML +=  msSliderManagerItem + '\n';
            } else {
              _this["masterslider_" + i].setup(slider[key].id, setup);
            }

            // save slider config for later access
            if (save_config) {
              if (sliderManager) {
                msSliderManagerItem        = '    ' + 'j1.masterslider.instances.push(masterslider_' + i + ');';
                msSliderManager.innerHTML +=  msSliderManagerItem + '\n';
              } else {
                j1.masterslider.instances.push(_this["masterslider_" + i]);
              }
            }
          } else {
            logger.info('\n' + 'slider found disabled on id: ' + slider[key].id);
          }
        });

        // var msSliderManagerItem;
        // msSliderManagerItem        = '\n' + '  console.debug("initializing MS Slider Manager finished");' + '\n';
        // msSliderManagerItem       +=  '});' + '\n';
        // msSliderManager.innerHTML +=  msSliderManagerItem + '\n';

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
      setupPlugIns(options, slider, msSliderManager);

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
    // registerEvents()
    // Currently NOT used (experimental)
    // -------------------------------------------------------------------------
    registerEvents: function (options, slider) {
      var index;

      var i=0;
      Object.keys(slider).forEach(function(key) {
        i++;                                                                    // instance index
        index = parseInt(key);                                                  // object index

          logger.debug('\n' + 'slider events are being initialized on id: ' + index);

          slider[index].api.addEventListener(MSSliderEvent.WAITING, function(e) {
          var controller      = e.target.view.controller;
          var controllerValue = e.target.view.controller.value;
          var isLoading       = e.target.currentSlide.$loading.length;

          // dispatches when the slider's current slide change starts.
          if (!isLoading) {
            logger.info('\n' + 'slider is loaded' );
          } else {
            logger.info('\n' + 'slider is being loaded: ' + e.target.currentSlide.bg_src);
          }

        });

      });

    }, // END registerEvents

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
