---
regenerate:                             true
---

{%- capture cache -%}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/adapter/js/swiper.js
 # Liquid template to adapt J1 SwiperJS Apps
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
 #  swiper_options:  {{ swiper_options | debug }}
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
{% assign swiper_defaults       = modules.defaults.swiper_app.defaults %}
{% assign swiper_settings       = modules.swiper_app.settings %}

{% comment %} Set config options (settings only)
-------------------------------------------------------------------------------- {% endcomment %}
{% assign swiper_options        = swiper_defaults | merge: swiper_settings %}
{% assign swipers               = swiper_settings.swipers %}

{% comment %} Detect prod mode
-------------------------------------------------------------------------------- {% endcomment %}
{% assign production = false %}
{% if environment == 'prod' or environment == 'production' %}
  {% assign production = true %}
{% endif %}

/*
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/adapter/js/swiper.js
 # J1 Adapter for the swiper module
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
j1.adapter.swiper = ((j1, window) => {

  {% comment %} Set global variables
  ------------------------------------------------------------------------------ {% endcomment %}
  var environment         = '{{environment}}';
  var cookie_names        = j1.getCookieNames();
  var user_state          = j1.readCookie(cookie_names.user_state);
  var viewport_width      = $(window).width();
  var state               = 'not_started';

  var swiperDefaults;
  var swiperSettings;
  var swiperOptions;
  var frontmatterOptions;
  var themes_allowed;
  var theme_enabled;
  var theme;

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
  // main
  // ---------------------------------------------------------------------------
  return {

    // -------------------------------------------------------------------------
    // adapter initializer
    // -------------------------------------------------------------------------
    init: (options) => {
      var xhrLoadState                  = 'pending';                            // (initial) load state for the HTML portion of the swiper
      var load_dependencies             = {};                                   // dynamic variable
      var carouselResponsiveSettingsOBJ = {};                                   // initial object for responsive settings
      var reload_on_resize              = false;
      var dependency;
      var carouselResponsiveSettingsYAML;
      var carouselResponsiveSettingsSTRING;
      var swiper_lightbox_enabled;

      // [INFO   ] [j1.adapter.comments                    ] [ detected comments provider (j1_config): {{comments_provider}}} ]
      // [INFO   ] [j1.adapter.comments                    ] [ start processing load region head, layout: {{page.layout}} ]

      // -----------------------------------------------------------------------
      // default module settings
      // -----------------------------------------------------------------------
      var settings = $.extend({
        module_name: 'j1.adapter.swiper',
        generated:   '{{site.time}}'
      }, options);

      // -----------------------------------------------------------------------
      // global variable settings
      // -----------------------------------------------------------------------

      // create settings object from module options
      swiperDefaults = $.extend({}, {{swiper_defaults | replace: 'nil', 'null' | replace: '=>', ':' }});
      swiperSettings = $.extend({}, {{swiper_settings | replace: 'nil', 'null' | replace: '=>', ':' }});
      swiperOptions  = $.extend(true, {}, swiperDefaults, swiperSettings);

      _this        = j1.adapter.swiper;
      theme        = user_state.theme_name;
      logger       = log4javascript.getLogger('j1.adapter.swiper');

      // -----------------------------------------------------------------------
      // module initializer
      // -----------------------------------------------------------------------
      var dependencies_met_page_ready = setInterval (() => {
        var pageState       = $('#content').css("display");
        var pageVisible     = (pageState === 'block') ? true : false;
        var j1CoreFinished  = (j1.getState() === 'finished') ? true : false;
        var atticFinished   = (j1.adapter.attic.getState() == 'finished') ? true : false;

        if (j1CoreFinished && pageVisible && atticFinished) {
          startTimeModule = Date.now();

          // load HTML portion for all swiper
          _this.loadSwiperHTML(swiperOptions, swiperOptions.swipers);

          _this.setState('started');
          logger.debug('\n' + 'state: ' + _this.getState());
          logger.info('\n' + 'module is being initialized');

          {% for swiper in swipers %}{% if swiper.enabled %}
          logger.info ('\n' + 'initialize swiper on id: ' + '{{swiper.id}}');

          // create dynamic loader variable|s
          dependency = 'dependencies_met_html_loaded_{{swiper.id}}';
          load_dependencies[dependency] = '';

          // initialize the swiper if the HTML portion of the slider is successfully loaded
          load_dependencies['dependencies_met_html_loaded_{{swiper.id}}'] = setInterval (() => {
            // check if HTML portion of the swiper is loaded successfully
            xhrLoadState = j1.xhrDOMState['#{{swiper.id}}_app'];
            if (xhrLoadState === 'success') {

              logger.info ('\n' + 'HTML portion loaded for swiper on id: ' + '{{swiper.id}}');

              // setup the slider
              // ---------------------------------------------------------------
              logger.info ('\n' + 'swiper is being setup on id: ' + '{{swiper.id}}');

              const slider        = document.querySelector('#{{swiper.id}}');
              const swiperEl      = slider.querySelector('.swiper');
              const {{swiper.id}} = new Swiper(swiperEl, {

                {% if swiper.parameters %}
                // parameters (core)
                {% for setting in swiper.parameters %}
                {% if setting[0] == 'direction' or setting[0] == 'effect' or setting[0] == 'slideHeight' %}
                {{setting[0]}}: {{ setting[1] | replace: '=>', ':' | json }},
                {% else %}
                {{setting[0]}}: {{ setting[1] | replace: '=>', ':' }},
                {% endif %}
                {% endfor %}
                {% endif %}

                {% if swiper.module_settings %}
                // module settings
                {% for setting in swiper.module_settings %}
                {% if setting[0] == 'modules' or setting[0] == 'ppppppagination' %}
                {{setting[0]}}: {{ setting[1] | replace: '=>', ':' | replace: '"', ' ' }},
                {% else %}
                {{setting[0]}}: {{ setting[1] | replace: '=>', ':' }},
                {% endif %}
                {% endfor %}
                {% endif %}

                {% if swiper.events and swiper.events.enabled %}
                // events
                on: {
                  {% for setting in swiper.events %}
                  {% if setting[0] == 'enabled' %} {% continue %} {% endif %}
                  {{setting[0]}}: {{ setting[1] }},                  
                  {% endfor %}
                } // END events
                {% endif %}

              }); // END Swiper 

              {% if swiper.lightbox.enabled %}
              // ---------------------------------------------------------------
              // Setup PhotoSwipe Lightbox
              // ---------------------------------------------------------------
              //
              const {{swiper.id}}Lightbox = new PhotoSwipeLightbox ({
                // global settings
                gallery: '#{{swiper.id}}',
                pswpModule: PhotoSwipe,

                {% if swiper.lightbox.parameters %}
                // parameters (lightbox)
                {% for setting in swiper.lightbox.parameters %}
                {% if setting[1] == 'a' or setting[1] == 'zoom' or setting[1] == 'next' %}
                {{setting[0]}}: {{ setting[1] | replace: '=>', ':' | json }},
                {% else %}
                {{setting[0]}}: {{ setting[1] | replace: '=>', ':' }},
                {% endif %}
                {% endfor %}
                {% endif %}

                {% if swiper.lightbox.ui_controls %}
                // ui elements
                {% for setting in swiper.lightbox.ui_controls %}

                {{setting[0]}}: {{ setting[1] | replace: '=>', ':' }},
                {% endfor %}
                {% endif %}

                {% if swiper.lightbox.kbd_controls %}
                // kbd control
                {% for setting in swiper.lightbox.kbd_controls %}
                {{setting[0]}}: {{ setting[1] | replace: '=>', ':' }},
                {% endfor %}
                {% endif %}

              });

              {% if swiper.lightbox.captions.enabled %}
              // Setup Lightbox Captions
              // ---------------------------------------------------------------
              const captionPlugin = new PhotoSwipeDynamicCaption ({{swiper.id}}Lightbox, {
                type: 'auto'
              });
              {% endif %}

              // Initialize the Lightbox
              // ---------------------------------------------------------------
              {{swiper.id}}Lightbox.init();

              // Create Lightbox Events
              // ---------------------------------------------------------------
              {{swiper.id}}Lightbox.on('change', () => {
                const { pswp } = {{swiper.id}}Lightbox;
                {{swiper.id}}.slideTo(pswp.currIndex, 0, false);
                console.log('Slide index', pswp.currIndex);
                console.log('Slide object', pswp.currSlide);
                console.log('Slide object data', pswp.currSlide.data);
              });

              {{swiper.id}}Lightbox.on('afterInit', () => {
                const { pswp } = {{swiper.id}}Lightbox;
                if ({{swiper.id}}.params.autoplay.enabled) {
                  {{swiper.id}}.autoplay.stop();
                };
              });

              // if autoplay enabled, run autoplay.start() on (lightbox) close
              {{swiper.id}}Lightbox.on('closingAnimationStart', () => {
                const { pswp } = {{swiper.id}}Lightbox;
                {{swiper.id}}.slideTo(pswp.currIndex, 0, false);
                if ({{swiper.id}}.params.autoplay.enabled) {
                  {{swiper.id}}.autoplay.start();
                }
              });
              {% endif %}

              // workaround for swiper pagination placed 'outer'
              // ---------------------------------------------------------------
              {% assign init_swiper_delay   = 500 %}
              {% assign pagination_el       = swiper.module_settings.pagination.el | split: '-' %}
              {% assign pagination_position = pagination_el[2] %}

              {% if swiper.module_settings.pagination and pagination_position == 'outer' %}
              setTimeout(() => {
                const sourceEl = document.getElementById('{{swiper.id}}_pagination');
                const targetEl = document.getElementById('{{swiper.id}}');
                targetEl.appendChild(sourceEl);

                logger.debug('\n' + 'pagination elements (outer) moved');
              }, {{init_swiper_delay}});
              {% endif %}
              // ---------------------------------------------------------------

              clearInterval (load_dependencies['dependencies_met_html_loaded_{{swiper.id}}']);
            } // END if xhrLoadState success
          }, 10); // END dependencies_met_html_loaded swiper.id              

          {% endif %}{% endfor %} // ENDFOR (all) carousels

          _this.setState('finished');
          logger.debug('\n' + 'state: ' + _this.getState());
          logger.info('\n' + 'initializing module finished');

          endTimeModule = Date.now();
          logger.info('\n' + 'module initializing time: ' + (endTimeModule-startTimeModule) + 'ms');

          clearInterval(dependencies_met_page_ready);
        } // END pageVisible
      }, 10); // END dependencies_met_page_ready
    }, // END init

    // -------------------------------------------------------------------------
    // loadSwiperHTML(options, swipers)
    // load all swipers (HTML portion) dynanically configured
    // and enabled (AJAX) from YAMLdata file.
    // NOTE: Make sure the placeholder is available in the content page
    // eg. using the asciidoc extension mastercarousel::
    // -------------------------------------------------------------------------
    loadSwiperHTML: (options, swipers) => {
      var numSwipers      = Object.keys(swipers).length;
      var activeSwipers   = numSwipers;
      var xhrDataPath     = options.xhr_data_path + '/index.html';
      var xhrContainerId;

      console.debug('number of swipers found: ' + numSwipers);

      _this.setState('load_data');
      Object.keys(swipers).forEach ((key) => {
        if (swipers[key].enabled) {
          xhrContainerId = swipers[key].id + '_app';

          console.debug('load HTML data on swiper id: ' + swipers[key].id);
          j1.loadHTML({
            xhr_container_id: xhrContainerId,
            xhr_data_path:    xhrDataPath,
            xhr_data_element: swipers[key].id
          });
        } else {
          console.debug('swiper found disabled on id: ' + swipers[key].id);
          activeSwipers--;
        }
      });
      console.debug('swipers loaded in page enabled|all: ' + activeSwipers + '|' + numSwipers);
      _this.setState('data_loaded');
    }, // END loadSwiperHTML

    // -------------------------------------------------------------------------
    // pluginManager()
    // 
    // -------------------------------------------------------------------------
    pluginManager: (plugin) => {
      if (plugin === 'photoswipe') {        
        var tech;
        var techScript;

        tech        = document.createElement('script');
        tech.id     = 'tech_' + plugin;
        tech.src    = '/assets/theme/j1/modules/amplitudejs/js/tech/' + plugin + '.js';
        techScript  = document.getElementsByTagName('script')[0];

        techScript.parentNode.insertBefore(tech, techScript);
      }
    }, // END pluginManager

    // -------------------------------------------------------------------------
    // createLightboxOnSwiper()
    // Create a PhotoSwipe Lightbox on a Swiper
    // -------------------------------------------------------------------------
    createLightboxOnSwiper: (swiper, lightbox) => {

      // Setup PhotoSwipe Lightbox
      // -----------------------------------------------------------------------
      // const lightbox = new PhotoSwipeLightbox ({
      //   // global settings
      //   gallery: '#' + swiper,
      //   pswpModule: PhotoSwipe,
      //   // options
      //   bgOpacity: 1,
      //   showHideOpacity: true,
      //   children: 'a',
      //   loop: true,
      //   showHideAnimationType: 'zoom',
      //   imageClickAction: 'next',
      //   tapAction: 'next',
      //   // ui elements
      //   zoom: false,
      //   close: true,
      //   counter: true,
      //   arrowKeys: true,
      //   bgOpacity: "1",
      //   wheelToZoom: true,
      //   // kbd control
      //   escKey: true
      // });

      // {% if swiper.lightbox.captions.enabled %}
      // // Setup Lightbox Captions
      // // -----------------------------------------------------------------------
      // const captionPlugin = new PhotoSwipeDynamicCaption (lightbox, {
      //   type: 'auto'
      // });
      // {% endif %}

    //   // Initialize the Lightbox
    //   // -----------------------------------------------------------------------
    //   lightbox.init();

    //   // Create Lightbox Events
    //   // -----------------------------------------------------------------------
    //   lightbox.on('change', () => {
    //     const { pswp } = lightbox;
    //     swiper.slideTo(pswp.currIndex, 0, false);
    //     console.log('Slide index', pswp.currIndex);
    //     console.log('Slide object', pswp.currSlide);
    //     console.log('Slide object data', pswp.currSlide.data);
    //   });

    //   lightbox.on('afterInit', () => {
    //     const { pswp } = lightbox;
    //     if swiper.params.autoplay.enabled) {
    //       swiper.autoplay.stop();
    //     };
    //   });

    //   // if autoplay enabled, run autoplay.start() on (lightbox) close
    //   lightbox.on('closingAnimationStart', () => {
    //     const { pswp } = lightbox;
    //     swiper.slideTo(pswp.currIndex, 0, false);
    //     if swiper.params.autoplay.enabled) {
    //       swiper.autoplay.start();
    //     }
    //   });

    }, // END createLightboxOnSwiper

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

{%- endcapture -%}

{%- if production -%}
  {{ cache|minifyJS }}
{%- else -%}
  {{ cache|strip_empty_lines }}
{%- endif -%}

{%- assign cache = false -%}