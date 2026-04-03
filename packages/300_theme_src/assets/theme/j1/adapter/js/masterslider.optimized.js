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
 # Copyright (C) 2023-2026 Juergen Adams
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
 # Copyright (C) 2023-2026 Juergen Adams
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

  // Claude: optimized code and fixes - use const for immutable values
  const isDev = (j1.env === "development" || j1.env === "dev");

  {% comment %} Set global variables
  ------------------------------------------------------------------------------ {% endcomment %}
  // Claude: optimized code and fixes - use const for config values that don't change
  const environment             = '{{environment}}';
  const moduleVersion           = '{{module_version}}';
  const sliderManager           = j1.stringToBoolean('{{slider_manager}}');
  const lightboxEnabled         = j1.stringToBoolean('{{lightbox_enabled}}');
  const saveSliderConfig        = j1.stringToBoolean('{{save_slider_config}}');
  const newline                 = '\n';
  
  // Claude: optimized code and fixes - use let for mutable state variables
  let state                     = 'not_started';
  let masterSliderDefaults;
  let masterSliderSettings;
  let masterSliderOptions;
  let _this;
  let logger;
  let logText;

  // date|time
  // Claude: optimized code and fixes - use let for variables that will be reassigned
  let startTime;
  let endTime;
  let startTimeModule;
  let endTimeModule;
  let timeSeconds;

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
      // Claude: optimized code and fixes - use let for local mutable variable
      let msSliderManager;

      if (sliderManager) {
        msSliderManager             = document.createElement('script');
        msSliderManager.id          = 'ms-slider-manager';
        msSliderManager.innerHTML   = '';
      }

      // used for later access
      // Claude: optimized code and fixes - ensure namespace exists before setting properties
      j1.masterslider           = j1.masterslider || {};
      j1.masterslider.instances = j1.masterslider.instances || [];

      // -----------------------------------------------------------------------
      // default module settings
      // -----------------------------------------------------------------------
      // Claude: optimized code and fixes - use const for settings that don't change
      const settings = $.extend({
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
      // Claude: optimized code and fixes - store interval ID for proper cleanup
      const dependency_met_page_ready = setInterval(() => {
        // Claude: optimized code and fixes - cache DOM query result
        const pageState      = $('#content').css("display");
        const pageVisible    = (pageState === 'block');
        const j1CoreFinished = (j1.getState() === 'finished');
        const dataLoaded     = (_this.getState() === 'data_loaded');
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
      // Claude: optimized code and fixes - store interval ID for proper cleanup
      const dependencies_met_module_finished = setInterval (() => {
        const slidersInitialized = (_this.getState() === 'sliders_initialized');

        if (slidersInitialized) {

            // TODO: Check why a timeout is required to load the Slider Manager
            setTimeout (() => {

              // load the SliderManager (if configured)
              if (sliderManager && msSliderManager) {
                logger.debug('slider manager is being loaded');

                // close function SliderManager()
                msSliderManager.innerHTML += '  ' + '}';
                msSliderManager.innerHTML += newline;

                // call function SliderManager()
                msSliderManager.innerHTML += '  ' + 'SliderManager();';
                msSliderManager.innerHTML += newline;

                // inject MasterSlider Manager code
                $('head').append(msSliderManager);
                logger.debug('slider manager loaded successfully');

                _this.setState('finished');
                logger.debug('state: ' + _this.getState());
                logger.info('module initialized successfully');

                endTimeModule = Date.now();
                // Claude: optimized code and fixes - use const for calculated value
                const timeSeconds = (endTimeModule-startTimeModule)/1000;
                logger.info('module initializing time: ' + timeSeconds + ' seconds');

                clearInterval(dependencies_met_module_finished);
              } else {
                _this.setState('finished');
                logger.debug('state: ' + _this.getState());
                logger.info('module initialized successfully');

                endTimeModule = Date.now();
                // Claude: optimized code and fixes - use const for calculated value
                const timeSeconds = (endTimeModule-startTimeModule)/1000;
                logger.info('module initializing time: ' + timeSeconds + ' seconds');

                clearInterval(dependencies_met_module_finished);
              }
            }, 1000); // END setTimeout
        } // END if (slidersInitialized)
      }, 10);
    }, // END init

    // -------------------------------------------------------------------------
    // loadSliderHTML()
    // load all slider (HTML) portion (AJAX) from partial (HTML) file
    // located in _includes/slider
    // -------------------------------------------------------------------------
    loadSliderHTML: (options, slider) => {
      // Claude: optimized code and fixes - use const for loop counter
      let i = 0;
      
      _this.setState('load_data');
      logger.debug('state: ' + _this.getState());
      logger.info('slider HTML data are being loaded');

      Object.keys(slider).forEach((key) => {
        i++;
        // Claude: optimized code and fixes - use const for index that doesn't change in loop
        const index = parseInt(key);

        if (slider[index].enabled) {
          logger.debug('load HTML data on id: ' + slider[index].id);

          // Claude: optimized code and fixes - use template literals for cleaner string concatenation
          const slider_id = `#${slider[index].id}_parent`;
          const xhr_data_path = `${options.xhr_data_path}/index_${slider[index].id}.html`;

          // Claude: optimized code and fixes - use const for variables that don't change
          const xhr_container_id = slider_id;

          // console.debug('loading HTML data from: ' + xhr_data_path );
          j1.loadHTML({
            xhr_container_id: xhr_container_id,
            xhr_data_path:    xhr_data_path,
            xhr_data_element: slider[index].id
          });

        } else {
          logger.debug('slider found disabled on id: ' + slider[index].id);
        }
      }); // END forEach
      _this.setState('data_loaded');
      logger.debug('state: ' + _this.getState());
    }, // END loadSliderHTML

    // -------------------------------------------------------------------------
    // createSliderInstances()
    // create all 'MasterSlider' instances for all sliders enabled|configured
    // -------------------------------------------------------------------------
    createSliderInstances: (slider, msSliderManager) => {
      // Claude: optimized code and fixes - use let for loop counter
      let i = 0;

      logger.info('create slider instances');

      if (sliderManager) {
        msSliderManager.innerHTML += '  ' + 'function SliderManager() {';
        msSliderManager.innerHTML += newline;
      }

      Object.keys(slider).forEach((key) => {
        // Claude: optimized code and fixes - declare variables with let/const
        let msSliderManagerItem = '\n';
        i++;
        // Claude: optimized code and fixes - use const for index that doesn't change
        const index = parseInt(key);

        if (slider[index].enabled) {
          logger.debug('create instance on id: ' + slider[index].id);
          if (sliderManager) {
            // Claude: optimized code and fixes - use template literals for cleaner string formatting
            msSliderManagerItem = `    var masterslider_${i} = new MasterSlider();`;
            msSliderManager.innerHTML += msSliderManagerItem + '\n';
          } else {
            _this[`masterslider_${i}`] = new MasterSlider();
          }
        } else {
          logger.debug('slider found disabled on id: ' + slider[index].id);
        }
      }); // END forEach

      if (sliderManager) msSliderManager.innerHTML += newline;
    }, // END createSliderInstances

    // -------------------------------------------------------------------------
    // initSliders()
    // initialize all sliders enabled|configured
    // -------------------------------------------------------------------------
    initSliders: (options, slider, msSliderManager, save_config) => {

      // run the method 'control' on all sliders 'enabled'
      //
      function setupControls(options, slider, sliderManager) {
        // Claude: optimized code and fixes - use const for variables that don't change
        const controlOptions = options.controls;
        const msSliderManager  = sliderManager;
        
        // Claude: optimized code and fixes - use let for mutable variables
        let control = {};
        let index;

        logger.info('generate control setup');

        if (sliderManager) msSliderManager.innerHTML += newline;
        
        // Claude: optimized code and fixes - use let for loop counter
        let i = 0;
        Object.keys(slider).forEach((key) => {
          // Claude: optimized code and fixes - use let for variables that change
          let msSliderManagerItem = '\n';
          i++;
          index = parseInt(key);

          if (slider[index].enabled) {
            logger.debug('setup controls for id: ' + slider[key].id);

            // log all controls (if any)
            if (slider[index].controls.length) {
              slider[index].controls.forEach((ctrl, i) => {
                // Claude: optimized code and fixes - use const for control name
                const controlName = Object.keys(ctrl)[0];
                logger.debug('control found: ' + controlName);
              });
            } else {
              logger.debug('no controls found on id: ' + slider[key].id);
            }

            // create controls requested
            if (slider[index].controls.length) {
              slider[index].controls.forEach((ctrl, j) => {
                // Claude: optimized code and fixes - use const for control name
                const controlName = Object.keys(ctrl)[0];
                control = $.extend({}, controlOptions[controlName], ctrl[controlName]);

                if (sliderManager) {
                  // Claude: optimized code and fixes - use template literals
                  msSliderManagerItem = `    masterslider_${i}.control('${controlName}', ${JSON.stringify(control)});`;
                  msSliderManager.innerHTML += msSliderManagerItem + '\n';
                } else {
                  _this[`masterslider_${i}`].control(controlName, control);
                }
              }); // END forEach ctrl
            }
          } else {
            logger.debug('slider found disabled on id: ' + slider[key].id);
          }
        }); // END forEach
      } // END setupControls

      // run the method 'plugin' on all sliders 'enabled'
      //
      function setupPlugIns(options, slider, sliderManager) {
        // Claude: optimized code and fixes - use const for variables that don't change
        const pluginOptions = options.plugins;
        const msSliderManager = sliderManager;
        
        // Claude: optimized code and fixes - use let for mutable variables
        let plugins = {};
        let pluginSettings;
        let index;

        logger.info('generate plugin setup');

        if (sliderManager) msSliderManager.innerHTML += newline;
        
        // Claude: optimized code and fixes - use let for loop counter
        let i = 0;
        Object.keys(slider).forEach((key) => {
          // Claude: optimized code and fixes - use let for variables that change
          let msSliderManagerItem = '\n';
          i++;
          index = parseInt(key);

          if (slider[index].enabled) {
            logger.debug('setup plugins for id: ' + slider[key].id);

            // merge settings, defaults into 'plugins'
            if (slider[index].plugins) {

              // log all plugins (if any)
              Object.keys(slider[index].plugins).forEach((plugin, j) => {
                logger.debug('plugin found: ' + plugin);
              });

              slider[index].plugins.forEach((plugin, j) => {
                plugins = $.extend({}, pluginOptions, slider[index].plugins);

                // generate setup for plugin 'MSScrollParallax'
                // NOTE: for the MS config, the plugin 'MSScrollParallax'  is named ' J1ScrollParallax'
                if (plugins.J1ScrollParallax.enabled) {
                  // remove J1 config settings
                  delete plugins.J1ScrollParallax.enabled;

                  // create a 'properties' string
                  // Claude: optimized code and fixes - chain replace operations for better performance
                  pluginSettings = JSON.stringify(plugins.J1ScrollParallax)
                    .replace(/"/g, '')
                    .replace(/[{}]/g, '');
                  logger.debug('plugin J1ScrollParallax found: ' + pluginSettings);

                  // remove property names to get a pure 'parameter' string
                  // Claude: optimized code and fixes - chain replace operations
                  pluginSettings = pluginSettings
                    .replace(/layers_parallax_depth:/g, '')
                    .replace(/background_parallax_depth:/g, '')
                    .replace(/fade_layers:/g, '');

                  if (sliderManager) {
                    // Claude: optimized code and fixes - use template literals
                    msSliderManagerItem = `    MSScrollParallax.setup(masterslider_${i}, ${pluginSettings});`;
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
        // Claude: optimized code and fixes - use const for variables that don't change
        const controlOptions = options.controls;
        const msSliderManager  = sliderManager;
        
        // Claude: optimized code and fixes - use let for mutable variables
        let control = {};
        let setup = {};
        let index;

        logger.info('generate slider setup');

        if (sliderManager) msSliderManager.innerHTML += newline;
        
        // Claude: optimized code and fixes - use let for loop counter
        let i = 0;
        Object.keys(slider).forEach((key) => {
          // Claude: optimized code and fixes - use let for variables that change
          let msSliderManagerItem = '\n';
          i++;
          index = parseInt(key);
          
          if (slider[index].enabled) {
            logger.debug('slider is being initialized on id: ' + slider[key].id);

            // merge settings, defaults into 'setup'
            setup = $.extend({}, settings.options, slider[index].options);

            // log the filter object if enabled
            if (setup.filters !== null) {
              // Claude: optimized code and fixes - chain replace operations
              const filterSettings = JSON.stringify(setup.filters)
                .replace(/"/g, '')
                .replace(/[{}]/g, '');
              logger.debug('filters found: ' + filterSettings);
            }

            if (sliderManager) {
              // Claude: optimized code and fixes - use template literals
              msSliderManagerItem = `    masterslider_${i}.setup('${slider[key].id}', ${JSON.stringify(setup)});`;
              msSliderManager.innerHTML +=  msSliderManagerItem + '\n';
            } else {
              _this[`masterslider_${i}`].setup(slider[key].id, setup);
            }

            // save slider config for later access
            if (save_config) {
              if (sliderManager) {
                // Claude: optimized code and fixes - use template literals
                msSliderManagerItem = `    j1.masterslider.instances.push(masterslider_${i});`;
                msSliderManager.innerHTML +=  msSliderManagerItem + '\n';
              } else {
                j1.masterslider.instances.push(_this[`masterslider_${i}`]);
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

      // Claude: optimized code and fixes - use const for variables that don't change
      const settings  = $.extend({}, options, slider);
      
      // Claude: optimized code and fixes - moved setup variable to setupSliders where it's used
      let log_text;

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
      // Claude: optimized code and fixes - use let for mutable variable
      let index;
      let i = 0;
      
      Object.keys(slider).forEach((key) => {
        index = parseInt(key); // object index
        i++;  // instance index

        logger.debug('slider events are being initialized on id: ' + index);

        // slider[index].api.addEventListener(MSSliderEvent.WAITING, (e) => {
        // Claude: optimized code and fixes - use arrow function for better performance and 'this' binding
        slider[index].api.addEventListener(MSSliderEvent.WAITING, (e) => {
          // Claude: optimized code and fixes - use const for values that don't change
          const controller      = e.target.view.controller;
          const controllerValue = e.target.view.controller.value;
          const isLoading       = e.target.currentSlide.$loading.length;

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
      // Claude: optimized code and fixes - use const for JSON string
      const json_message = JSON.stringify(message, undefined, 2);

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