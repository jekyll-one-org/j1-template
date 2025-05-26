---
regenerate:                             true
---

{%- capture cache -%}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/adapter/js/masterslider.js
 # Liquid template to adapt Averta MasterSlider Lite
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
 # -----------------------------------------------------------------------------
{% endcomment %}

{% comment %} Liquid var initialization
-------------------------------------------------------------------------------- {% endcomment %}

{% comment %} Set config files
-------------------------------------------------------------------------------- {% endcomment %}
{% assign environment             = site.environment %}
{% assign template_config         = site.data.j1_config %}
{% assign modules                 = site.data.modules %}

{% comment %} Set config data
-------------------------------------------------------------------------------- {% endcomment %}
{% assign master_slider_defaults  = modules.defaults.masterslider.defaults %}
{% assign master_slider_settings  = modules.masterslider.settings %}

{% comment %} Set config options
-------------------------------------------------------------------------------- {% endcomment %}
{% assign master_slider_options   = master_slider_defaults | merge: master_slider_settings %}
{% assign lightbox_enabled        = master_slider_options.enable_lightbox %}
{% assign slider_manager          = master_slider_options.slider_manager %}
{% assign save_slider_config      = master_slider_options.save_slider_config %}
{% assign module_version          = master_slider_options.module_version %}

{% comment %} Detect prod mode
-------------------------------------------------------------------------------- {% endcomment %}
{% assign production = false %}
{% if environment == 'prod' or environment == 'production' %}
  {% assign production = true %}
{% endif %}

/*
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/adapter/js/masterslider.js
 # J1 Adapter for Averta MasterSlider Lite v2.85.13 (Feb 2022)
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2023-2025 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # For details, see: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 # -----------------------------------------------------------------------------
 #  Adapter generated: {{site.time}}
 # -----------------------------------------------------------------------------
*/

// -----------------------------------------------------------------------------
// ESLint shimming
// -----------------------------------------------------------------------------
/* eslint indent: "off"                                                       */
// -----------------------------------------------------------------------------
"use strict";
j1.adapter.masterslider = ((j1, window) => {

  {% comment %} Set global variables
  ------------------------------------------------------------------------------ {% endcomment %}
  var environment             = '{{environment}}';
  var moduleVersion           = '{{module_version}}';
  var sliderManager           = j1.stringToBoolean('{{slider_manager}}');
  var lightboxEnabled         = j1.stringToBoolean('{{lightbox_enabled}}');
  var saveSliderConfig        = j1.stringToBoolean('{{save_slider_config}}');
  var newline                 = '\n';
  var state                   = 'not_started';

  var masterSliderDefaults;
  var masterSliderSettings;
  var masterSliderOptions;

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
  // helper functions
  // ---------------------------------------------------------------------------

  // ---------------------------------------------------------------------------
  // main
  // ---------------------------------------------------------------------------
  return {

    // -------------------------------------------------------------------------
    // adapter initializer
    // -------------------------------------------------------------------------
    init: (options) => {
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
      // default module settings
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
      // global variable settings
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

      // -----------------------------------------------------------------------
      // module initializer
      // -----------------------------------------------------------------------
      var dependency_met_page_ready = setInterval(() => {
        var pageState      = $('#content').css("display");
        var pageVisible    = (pageState === 'block') ? true : false;
        var j1CoreFinished = (j1.getState() === 'finished') ? true : false;
        var dataLoaded     = (_this.getState() === 'data_loaded') ? true : false;
        // var atticFinished  = (j1.adapter.attic.getState() == 'finished') ? true : false;

        if (pageVisible && j1CoreFinished && dataLoaded) {
          startTimeModule = Date.now();

          _this.setState('started');
          logger.debug('set module state to: ' + _this.getState());
          logger.info('initializing module: started');

          logger.debug('ms module version detected: ' + moduleVersion);
          logger.debug('module is being initialized');

          _this.initSliders(masterSliderOptions, masterSliderOptions.sliders, msSliderManager, saveSliderConfig);

          clearInterval(dependency_met_page_ready);
        } // END pageVisible|dataLoaded
      }, 10); // END dependency_met_page_ready

      // make sure the 'content' section is visible BEFORE setting-up sliders
      var dependencies_met_module_finished = setInterval (() => {
        var slidersInitialized = (_this.getState() === 'sliders_initialized') ? true: false;

        if (slidersInitialized) {

            // TODO: Check why a timeout is required to load the Slider Manager
            setTimeout(() => {
              if (sliderManager) document.body.appendChild(msSliderManager);

              _this.setState('finished');
              logger.debug('state: ' + _this.getState());
              logger.info('initializing module: finished');

              endTimeModule = Date.now();
              logger.info('module initializing time: ' + (endTimeModule-startTimeModule) + 'ms');

            }, masterSliderOptions.slider_manager_load_timeout);

            clearInterval(dependencies_met_module_finished);
        } // END if slidersInitialized
      }, 10); // END dependencies_met_j1_core_finished
    }, // END init

    // -------------------------------------------------------------------------
    // loadSliderHTML()
    // load all master sliders (HTML portion) dynanically configured
    // and enabled (AJAX) from data file
    // NOTE: Make sure the placeholder is available in the content page
    // eg. using the asciidoc extension masterslider::
    // -------------------------------------------------------------------------
    loadSliderHTML: (options, slider) => {
      var numSliders      = Object.keys(slider).length;
      var active_sliders  = numSliders;
      var xhr_data_path   = options.xhr_data_path + '/index.html';
      var xhr_container_id;

      _this.setState('load_data');
      Object.keys(slider).forEach((key) => {
        if (slider[key].enabled) {
          xhr_container_id = 'p_' + slider[key].id;
          j1.loadHTML({
            xhr_container_id: xhr_container_id,
            xhr_data_path:    xhr_data_path,
            xhr_data_element: slider[key].id
          });
        } else {
          active_sliders--;
        }
      }); //END forEach

      _this.setState('data_loaded');
    }, // END loadSliderHTML

    // -------------------------------------------------------------------------
    // createSliderInstances()
    // create an 'MasterSlider' instance for all sliders configured
    // -------------------------------------------------------------------------
    createSliderInstances: (sliders, sliderManager) => {
      var msSliderManager = sliderManager;
      var numSliders      = Object.keys(sliders).length;
      var msSliderManagerItem;

      var i=0;
      Object.keys(sliders).forEach((key) => {
        i++;
        if (sliderManager) {
          msSliderManagerItem        = '  var masterslider_' + i + ' = new MasterSlider();' + '\n';
          msSliderManager.innerHTML += msSliderManagerItem;
        } else {
          _this["masterslider_" + i] = new MasterSlider();
        }
      });  //END forEach
    }, // END createSliderInstances

    // -------------------------------------------------------------------------
    // initSliders()
    // initialze all master sliders found in page. Dynamically apply properties
    // for methods 'setup' and 'control'.
    // -------------------------------------------------------------------------
    initSliders: (options, slider, sliderManager, save_config) => {
      var msSliderManager = sliderManager;
      var newline         = '\n';

      // run the method 'control' on all sliders 'enabled'
      //
      function setupControls(options, slider, sliderManager) {
        const controlOptions = options.controls;
        var msSliderManager  = sliderManager;
        var index;
        var i=0;

        logger.info('generate slider controls');

        if (sliderManager) msSliderManager.innerHTML += newline;
        Object.keys(slider).forEach((key) => {
          i++;                                                                  // instance index
          index = parseInt(key);                                                // object index

          if (slider[index].enabled) {
            if (slider[index].controls) {
              Object.keys(slider[index].controls).forEach((key) => {
                var msSliderManagerItem = '\n';
                logger.debug('slider control found id|key: ' + slider[index].id + '|' + key);

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
              logger.debug('no slider controls found on id: ' + slider[key].id);
            }
          } else {
            logger.debug('slider found disabled on id: ' + slider[key].id);
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

        logger.debug('generate slider plugins');

        if (sliderManager) msSliderManager.innerHTML += newline;
        Object.keys(slider).forEach((key) => {
          index = parseInt(key); // object index
          i++;  // instance index

          if (slider[index].enabled) {
            if (slider[index].plugins) {
              Object.keys(slider[index].plugins).forEach((key) => {
                var msSliderManagerItem = '\n';
                logger.info('slider plugin found id|key: ' + slider[index].id + '|' + key);

                // merge settings, defaults into 'plugins'
                plugins = $.extend({}, pluginOptions, slider[index].plugins);

                // generate setup for plugin 'MSScrollParallax'
                // NOTE: for the MS config, the plugin 'MSScrollParallax'  is named ' J1ScrollParallax'
                if (plugins.J1ScrollParallax.enabled) {
                  // remove J1 config settings
                  delete plugins.J1ScrollParallax.enabled;

                  // create a 'properties' string
                  pluginSettings = JSON.stringify(plugins.J1ScrollParallax).replace(/"/g, '').replace(/{/g, '').replace(/}/g, '');
                  logger.debug('plugin J1ScrollParallax found: ' + pluginSettings);

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
              logger.debug('no slider plugins found on id: ' + slider[key].id);
            } // END if slider[index].plugins
          } else {
            logger.debug('slider found disabled on id: ' + slider[key].id);
          } // END if slider[index].enabled
        }); // END forEach
      } // END setupPlugIns

      // run the method 'setup' on all sliders 'enabled'
      //
      function setupSliders(options, slider, sliderManager, save_config) {
        const controlOptions = options.controls;
        var msSliderManager  = sliderManager;
        var control          = {};
        var index;

        logger.info('generate slider setup');

        if (sliderManager) msSliderManager.innerHTML += newline;
        var i=0;
        Object.keys(slider).forEach((key) => {
          var msSliderManagerItem = '\n';
          i++;                                                                  // instance index
          index = parseInt(key);                                                // object index
          if (slider[index].enabled) {
            logger.debug('slider is being initialized on id: ' + slider[key].id);

            // merge settings, defaults into 'setup'
            setup = $.extend({}, settings.options, slider[index].options);

            // log the filter object if enabled
            if (setup.filters !== null) {
              var filterSettings = JSON.stringify(setup.filters).replace(/"/g, '');
              logger.debug('filters found: ' + filterSettings.replace(/{/g, '').replace(/}/g, ''));
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
            logger.info('slider found disabled on id: ' + slider[key].id);
          }
        }); // END forEach

        _this.setState('sliders_initialized');
        logger.debug('state: ' + _this.getState());
        logger.info('initializing sliders finished');

      } // END setupSliders

      var settings  = $.extend({}, options, slider);
      var control   = {};
      var setup     = {};

      var log_text;

      _this.setState('initialize_sliders');
      logger.debug('state: ' + _this.getState());
      log_text = 'sliders are being initialized';
      logger.info(log_text);

      setupControls(options, slider, msSliderManager);
      setupSliders(options, slider, msSliderManager, save_config);
      setupPlugIns(options, slider, msSliderManager);

    }, // END initSliders

    // -------------------------------------------------------------------------
    // registerEvents()
    // Currently NOT used (experimental)
    // -------------------------------------------------------------------------
    registerEvents: (options, slider) => {
      var index;

      var i=0;
      Object.keys(slider).forEach((key) => {
        index = parseInt(key); // object index
        i++;  // instance index

        logger.debug('slider events are being initialized on id: ' + index);

        // slider[index].api.addEventListener(MSSliderEvent.WAITING, (e) => {
        slider[index].api.addEventListener(MSSliderEvent.WAITING, function(e) {
          var controller      = e.target.view.controller;
          var controllerValue = e.target.view.controller.value;
          var isLoading       = e.target.currentSlide.$loading.length;

          // dispatches when the slider's current slide change starts.
          if (!isLoading) {
            logger.info('slider is loaded' );
          } else {
            logger.info('slider is being loaded: ' + e.target.currentSlide.bg_src);
          }
        }); // END addEventListener
      }); // END forEach
    }, // END registerEvents

    // -------------------------------------------------------------------------
    // messageHandler()
    // manage messages send from other J1 modules
    // -------------------------------------------------------------------------
    messageHandler: (sender, message) => {
      var json_message = JSON.stringify(message, undefined, 2);

      logText = 'received message from ' + sender + ': ' + json_message;
      logger.debug(logText);

      // -----------------------------------------------------------------------
      //  process commands|actions
      // -----------------------------------------------------------------------
      if (message.type === 'command' && message.action === 'module_initialized') {

        //
        // place handling of command|action here
        //

        logger.info(message.text);
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

{%- endcapture -%}

{%- if production -%}
  {{ cache|minifyJS }}
{%- else -%}
  {{ cache|strip_empty_lines }}
{%- endif -%}

{%- assign cache = false -%}
