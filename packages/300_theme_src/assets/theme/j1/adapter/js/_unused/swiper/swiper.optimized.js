---
regenerate:                             true
---

{%- capture cache -%}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/adapter/js/swiper.1.js
 # Liquid template to adapt J1 SwiperJS Apps
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
j1.adapter.swiper = ((j1, window) => {

  // Claude: optimized code and fixes - Use const for immutable values
  const isDev = (j1.env === "development" || j1.env === "dev");

  {% comment %} Set global variables
  ------------------------------------------------------------------------------ {% endcomment %}
  // Claude: optimized code and fixes - Use const for immutable values
  const environment = '{{environment}}';
  
  // Claude: optimized code and fixes - Declare variables with let instead of var for better scoping
  let cookie_names;
  let user_state;
  let viewport_width;
  let state = 'not_started';

  let swiperDefaults;
  let swiperSettings;
  let swiperOptions;
  let swiperLayout;
  let frontmatterOptions;
  let themes_allowed;
  let theme_enabled;
  let theme;

  let _this;
  let logger;
  let logText;

  // date|time
  let startTime;
  let endTime;
  let startTimeModule;
  let endTimeModule;
  let timeSeconds;

  // Claude: optimized code and fixes - Store interval IDs for cleanup
  const activeIntervals = new Set();

  // Claude: optimized code and fixes - Helper function to safely clear intervals
  const clearIntervalSafe = (intervalId) => {
    if (intervalId) {
      clearInterval(intervalId);
      activeIntervals.delete(intervalId);
    }
  };

  // Claude: optimized code and fixes - Helper function to add tracked intervals
  const setIntervalTracked = (callback, delay) => {
    const intervalId = setInterval(callback, delay);
    activeIntervals.add(intervalId);
    return intervalId;
  };

  // ---------------------------------------------------------------------------
  // main
  // ---------------------------------------------------------------------------
  return {

    // -------------------------------------------------------------------------
    // adapter initializer
    // -------------------------------------------------------------------------
    init: (options) => {
      // Claude: optimized code and fixes - Use let/const instead of var
      let xhrLoadState = 'pending';
      const load_dependencies = {};
      const carouselResponsiveSettingsOBJ = {};
      const reload_on_resize = false;
      let dependency;
      let carouselResponsiveSettingsYAML;
      let carouselResponsiveSettingsSTRING;
      let swiper_lightbox_enabled;

      // Claude: optimized code and fixes - Initialize global variables safely
      try {
        cookie_names = j1.getCookieNames();
        user_state = j1.readCookie(cookie_names.user_state);
        viewport_width = $(window).width();
      } catch (error) {
        console.error('Error initializing swiper adapter:', error);
        return;
      }

      // [INFO   ] [j1.adapter.comments                    ] [ detected comments provider (j1_config): {{comments_provider}}} ]
      // [INFO   ] [j1.adapter.comments                    ] [ start processing load region head, layout: {{page.layout}} ]

      // -----------------------------------------------------------------------
      // default module settings
      // -----------------------------------------------------------------------
      const settings = $.extend({
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
      const dependencies_met_page_ready = setIntervalTracked(() => {
        // Claude: optimized code and fixes - Cache jQuery selectors
        const $content = $('#content');
        const pageState = $content.css("display");
        const pageVisible = (pageState === 'block');
        
        // Claude: optimized code and fixes - Use strict equality
        const j1CoreFinished = (j1.getState() === 'finished');
        const atticFinished = (j1.adapter.attic.getState() === 'finished');

        if (j1CoreFinished && pageVisible && atticFinished) {
          startTimeModule = Date.now();

          // load HTML portion for all swipers
          _this.loadSwiperHTML(swiperOptions, swiperOptions.swipers);

          _this.setState('started');
          logger.debug('state: ' + _this.getState());
          logger.info('module is being initialized');

          {% for swiper in swipers %}{% if swiper.enabled %}
          logger.info('initialize swiper on id: ' + '{{swiper.id}}');

          // create dynamic loader variable
          dependency = 'dependencies_met_html_loaded_{{swiper.id}}';
          load_dependencies[dependency] = '';

          // initialize the swiper if the HTML portion of the slider successfully loaded
          load_dependencies['dependencies_met_html_loaded_{{swiper.id}}'] = setIntervalTracked(() => {
            // check if HTML portion of the swiper is loaded successfully
            // Claude: optimized code and fixes - Add null check for xhrDOMState
            xhrLoadState = j1.xhrDOMState && j1.xhrDOMState['#{{swiper.id}}_app'];
            if (xhrLoadState === 'success') {

              logger.info('HTML portion loaded for swiper on id: ' + '{{swiper.id}}');

              {% comment %} Set Swiper Layout
              ------------------------------------------------------------------ {% endcomment %}      
              {% assign type_layout   = swiper.layout | split: "/" %}
              {% assign swiper_layout = type_layout[1] | capitalize %}             

              // setup slider {{swiper.id}}
              // ---------------------------------------------------------------
              logger.info('swiper is being setup on id: ' + '{{swiper.id}}');

              const slider = document.querySelector('#{{swiper.id}}');
              
              // Claude: optimized code and fixes - Add null check before accessing properties
              if (!slider) {
                logger.error('Slider element not found for id: {{swiper.id}}');
                clearIntervalSafe(load_dependencies['dependencies_met_html_loaded_{{swiper.id}}']);
                return;
              }
              
              const swiperEl = slider.querySelector('.swiper');
              
              // Claude: optimized code and fixes - Add null check for swiperEl
              if (!swiperEl) {
                logger.error('Swiper element not found for id: {{swiper.id}}');
                clearIntervalSafe(load_dependencies['dependencies_met_html_loaded_{{swiper.id}}']);
                return;
              }

              {% if swiper_layout != 'Stacked' %}
              // Swiper options for non-stacked layout
              // ---------------------------------------------------------------
              // Claude: optimized code and fixes - Use const for configuration objects
              const swiperOptions_{{swiper.id}} = {
                {% if swiper.options.modules %}
                modules: [
                  {% for module in swiper.options.modules %}
                  Swiper{{module}}{% unless forloop.last %},{% endunless %}
                  {% endfor %}
                ],
                {% endif %}

                {% if swiper.options.initialSlide %}
                initialSlide: {{swiper.options.initialSlide}},
                {% endif %}

                {% if swiper.options.autoHeight %}
                autoHeight: {{swiper.options.autoHeight}},
                {% endif %}

                {% if swiper.options.navigation %}
                navigation: {
                  nextEl: '.swiper-button-next',
                  prevEl: '.swiper-button-prev'
                },
                {% endif %}

                {% if swiper.options.pagination %}
                pagination: {
                  {% if swiper.options.pagination.clickable %}
                  clickable: {{swiper.options.pagination.clickable}},
                  {% endif %}
                  {% if swiper.options.pagination.dynamicBullets %}
                  dynamicBullets: {{swiper.options.pagination.dynamicBullets}},
                  {% endif %}
                  el: '.swiper-pagination'
                },
                {% endif %}

                {% if swiper.options.scrollbar %}
                scrollbar: {
                  el: '.swiper-scrollbar'
                },
                {% endif %}

                {% if swiper.options.loop %}
                loop: {{swiper.options.loop}},
                {% endif %}

                {% if swiper.options.effect %}
                effect: '{{swiper.options.effect}}',
                {% endif %}

                {% if swiper.options.speed %}
                speed: {{swiper.options.speed}},
                {% endif %}

                {% if swiper.options.spaceBetween %}
                spaceBetween: {{swiper.options.spaceBetween}},
                {% endif %}

                {% if swiper.options.slidesPerView %}
                slidesPerView: {{swiper.options.slidesPerView}},
                {% endif %}

                {% if swiper.options.slidesPerGroup %}
                slidesPerGroup: {{swiper.options.slidesPerGroup}},
                {% endif %}

                {% if swiper.options.centeredSlides %}
                centeredSlides: {{swiper.options.centeredSlides}},
                {% endif %}

                {% if swiper.options.grabCursor %}
                grabCursor: {{swiper.options.grabCursor}},
                {% endif %}

                {% if swiper.options.keyboard %}
                keyboard: {
                  enabled: {{swiper.options.keyboard.enabled}}
                },
                {% endif %}

                {% if swiper.options.mousewheel %}
                mousewheel: {
                  enabled: {{swiper.options.mousewheel.enabled}}
                },
                {% endif %}

                {% if swiper.options.autoplay %}
                autoplay: {
                  delay: {{swiper.options.autoplay.delay}},
                  disableOnInteraction: {{swiper.options.autoplay.disableOnInteraction}}
                },
                {% endif %}

                {% if swiper.options.breakpoints %}
                breakpoints: {{swiper.options.breakpoints | replace: 'nil', 'null' | replace: '=>', ':' }}
                {% endif %}
              };

              // Initialize Swiper
              // Claude: optimized code and fixes - Add try-catch for swiper initialization
              let swiperInstance_{{swiper.id}};
              try {
                swiperInstance_{{swiper.id}} = new Swiper(swiperEl, swiperOptions_{{swiper.id}});
                logger.info('swiper successfully initialized on id: {{swiper.id}}');
              } catch (error) {
                logger.error('Failed to initialize swiper on id {{swiper.id}}:', error);
                clearIntervalSafe(load_dependencies['dependencies_met_html_loaded_{{swiper.id}}']);
                return;
              }

              {% if swiper.lightbox.enabled %}
              // Setup Lightbox if enabled
              // ---------------------------------------------------------------
              swiper_lightbox_enabled = {{swiper.lightbox.enabled}};
              
              if (swiper_lightbox_enabled && typeof PhotoSwipeLightbox !== 'undefined') {
                // Claude: optimized code and fixes - Add try-catch for lightbox initialization
                try {
                  const lightbox_{{swiper.id}} = new PhotoSwipeLightbox({
                    gallery: '#{{swiper.id}}',
                    pswpModule: PhotoSwipe,
                    bgOpacity: {% if swiper.lightbox.options.bgOpacity %}{{swiper.lightbox.options.bgOpacity}}{% else %}1{% endif %},
                    showHideOpacity: {% if swiper.lightbox.options.showHideOpacity %}{{swiper.lightbox.options.showHideOpacity}}{% else %}true{% endif %},
                    children: 'a',
                    loop: {% if swiper.lightbox.options.loop %}{{swiper.lightbox.options.loop}}{% else %}true{% endif %},
                    showHideAnimationType: '{% if swiper.lightbox.options.showHideAnimationType %}{{swiper.lightbox.options.showHideAnimationType}}{% else %}zoom{% endif %}',
                    imageClickAction: '{% if swiper.lightbox.options.imageClickAction %}{{swiper.lightbox.options.imageClickAction}}{% else %}next{% endif %}',
                    tapAction: '{% if swiper.lightbox.options.tapAction %}{{swiper.lightbox.options.tapAction}}{% else %}next{% endif %}',
                    zoom: {% if swiper.lightbox.options.zoom %}{{swiper.lightbox.options.zoom}}{% else %}false{% endif %},
                    close: {% if swiper.lightbox.options.close %}{{swiper.lightbox.options.close}}{% else %}true{% endif %},
                    counter: {% if swiper.lightbox.options.counter %}{{swiper.lightbox.options.counter}}{% else %}true{% endif %},
                    arrowKeys: {% if swiper.lightbox.options.arrowKeys %}{{swiper.lightbox.options.arrowKeys}}{% else %}true{% endif %},
                    wheelToZoom: {% if swiper.lightbox.options.wheelToZoom %}{{swiper.lightbox.options.wheelToZoom}}{% else %}true{% endif %},
                    escKey: {% if swiper.lightbox.options.escKey %}{{swiper.lightbox.options.escKey}}{% else %}true{% endif %}
                  });

                  {% if swiper.lightbox.captions.enabled %}
                  // Setup Lightbox Captions
                  // Claude: optimized code and fixes - Add check for PhotoSwipeDynamicCaption
                  if (typeof PhotoSwipeDynamicCaption !== 'undefined') {
                    const captionPlugin_{{swiper.id}} = new PhotoSwipeDynamicCaption(lightbox_{{swiper.id}}, {
                      type: '{% if swiper.lightbox.captions.type %}{{swiper.lightbox.captions.type}}{% else %}auto{% endif %}'
                    });
                  }
                  {% endif %}

                  // Initialize the Lightbox
                  lightbox_{{swiper.id}}.init();

                  // Create Lightbox Events
                  // Claude: optimized code and fixes - Use arrow functions for event handlers
                  lightbox_{{swiper.id}}.on('change', () => {
                    const { pswp } = lightbox_{{swiper.id}};
                    if (swiperInstance_{{swiper.id}} && pswp) {
                      swiperInstance_{{swiper.id}}.slideTo(pswp.currIndex, 0, false);
                    }
                  });

                  lightbox_{{swiper.id}}.on('afterInit', () => {
                    // Claude: optimized code and fixes - Add null checks before accessing nested properties
                    if (swiperInstance_{{swiper.id}} && 
                        swiperInstance_{{swiper.id}}.params && 
                        swiperInstance_{{swiper.id}}.params.autoplay && 
                        swiperInstance_{{swiper.id}}.params.autoplay.enabled) {
                      swiperInstance_{{swiper.id}}.autoplay.stop();
                    }
                  });

                  // if autoplay enabled, run autoplay.start() on (lightbox) close
                  lightbox_{{swiper.id}}.on('closingAnimationStart', () => {
                    const { pswp } = lightbox_{{swiper.id}};
                    if (swiperInstance_{{swiper.id}} && pswp) {
                      swiperInstance_{{swiper.id}}.slideTo(pswp.currIndex, 0, false);
                      // Claude: optimized code and fixes - Add null checks
                      if (swiperInstance_{{swiper.id}}.params && 
                          swiperInstance_{{swiper.id}}.params.autoplay && 
                          swiperInstance_{{swiper.id}}.params.autoplay.enabled) {
                        swiperInstance_{{swiper.id}}.autoplay.start();
                      }
                    }
                  });

                  logger.info('lightbox successfully initialized on swiper id: {{swiper.id}}');
                } catch (error) {
                  logger.error('Failed to initialize lightbox on swiper id {{swiper.id}}:', error);
                }
              }
              {% endif %}

              {% else %}
              // Stacked layout handling
              logger.info('stacked layout detected for swiper id: {{swiper.id}}');
              {% endif %}

              // Claude: optimized code and fixes - Clear interval after successful initialization
              clearIntervalSafe(load_dependencies['dependencies_met_html_loaded_{{swiper.id}}']);
            }
          }, 10);
          {% endif %}{% endfor %}

          _this.setState('finished');
          logger.debug('state: ' + _this.getState());
          logger.info('initializing module finished');

          endTimeModule = Date.now();
          logger.info('module initializing time: ' + (endTimeModule-startTimeModule) + 'ms');

          // Claude: optimized code and fixes - Use the safe clear function
          clearIntervalSafe(dependencies_met_page_ready);
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
      // Claude: optimized code and fixes - Add null checks and use const
      if (!options || !swipers) {
        console.error('loadSwiperHTML: Invalid parameters');
        return;
      }

      const numSwipers = Object.keys(swipers).length;
      let activeSwipers = numSwipers;
      const xhrDataPath = options.xhr_data_path + '/index.html';
      let xhrContainerId;

      console.debug('number of swipers found: ' + numSwipers);

      _this.setState('load_data');
      Object.keys(swipers).forEach((key) => {
        if (swipers[key].enabled) {
          xhrContainerId = swipers[key].id + '_app';

          console.debug('load HTML data on swiper id: ' + swipers[key].id);
          
          // Claude: optimized code and fixes - Add null check for j1.loadHTML
          if (typeof j1.loadHTML === 'function') {
            j1.loadHTML({
              xhr_container_id: xhrContainerId,
              xhr_data_path:    xhrDataPath,
              xhr_data_element: swipers[key].id
            });
          } else {
            console.error('j1.loadHTML is not available');
          }
        } else {
          console.debug('swiper found disabled on id: ' + swipers[key].id);
          activeSwipers--;
        }
      });
      console.debug('swipers loaded in page enabled|all: ' + activeSwipers + '|' + numSwipers);
      _this.setState('data_loaded');
    }, // END loadSwiperHTML

    // -------------------------------------------------------------------------
    // findModuleByName(array, functionName)
    // Claude: optimized code and fixes - Renamed parameter for clarity
    // -------------------------------------------------------------------------
    findModuleByName: (moduleArray, moduleName) => {
      // Claude: optimized code and fixes - Add validation
      if (!Array.isArray(moduleArray) || !moduleName) {
        return null;
      }
      return moduleArray.find(func => func.name === moduleName);
    }, // END findModuleByName

    // -------------------------------------------------------------------------
    // pluginManager()
    // Claude: optimized code and fixes - Added error handling
    // -------------------------------------------------------------------------
    pluginManager: (plugin) => {
      if (plugin === 'photoswipe') {
        // Claude: optimized code and fixes - Use try-catch for script loading
        try {
          const tech = document.createElement('script');
          tech.id = 'tech_' + plugin;
          tech.src = '/assets/theme/j1/modules/amplitudejs/js/tech/' + plugin + '.js';
          
          // Claude: optimized code and fixes - Add error and load event handlers
          tech.onerror = () => {
            console.error('Failed to load plugin script:', plugin);
          };
          
          tech.onload = () => {
            console.debug('Plugin script loaded successfully:', plugin);
          };
          
          const techScript = document.getElementsByTagName('script')[0];
          
          // Claude: optimized code and fixes - Check if parent node exists
          if (techScript && techScript.parentNode) {
            techScript.parentNode.insertBefore(tech, techScript);
          } else {
            document.head.appendChild(tech);
          }
        } catch (error) {
          console.error('Error loading plugin:', plugin, error);
        }
      }
    }, // END pluginManager

    // -------------------------------------------------------------------------
    // createLightboxOnSwiper()
    // Create a PhotoSwipe Lightbox on a Swiper
    // Claude: optimized code and fixes - This function appears to be a placeholder
    // -------------------------------------------------------------------------
    createLightboxOnSwiper: (swiper, lightbox) => {
      // Claude: optimized code and fixes - Add parameter validation
      if (!swiper) {
        console.error('createLightboxOnSwiper: swiper parameter is required');
        return;
      }

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
    //     // Claude: optimized code and fixes - Fixed syntax error (missing parenthesis)
    //     if (swiper.params.autoplay.enabled) {
    //       swiper.autoplay.stop();
    //     }
    //   });

    //   // if autoplay enabled, run autoplay.start() on (lightbox) close
    //   lightbox.on('closingAnimationStart', () => {
    //     const { pswp } = lightbox;
    //     swiper.slideTo(pswp.currIndex, 0, false);
    //     // Claude: optimized code and fixes - Fixed syntax error (missing parenthesis)
    //     if (swiper.params.autoplay.enabled) {
    //       swiper.autoplay.start();
    //     }
    //   });

    }, // END createLightboxOnSwiper

    // -------------------------------------------------------------------------
    // messageHandler()
    // manage messages send from other J1 modules
    // -------------------------------------------------------------------------
    messageHandler: (sender, message) => {
      // Claude: optimized code and fixes - Add parameter validation
      if (!sender || !message) {
        logger.warn('messageHandler: Invalid parameters');
        return false;
      }

      // Claude: optimized code and fixes - Use try-catch for JSON.stringify
      let json_message;
      try {
        json_message = JSON.stringify(message, undefined, 2);
      } catch (error) {
        logger.error('Failed to stringify message:', error);
        return false;
      }

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
      // Claude: optimized code and fixes - Add validation
      if (typeof stat === 'string') {
        _this.state = stat;
      } else {
        logger.warn('setState: Invalid state value');
      }
    }, // END setState

    // -------------------------------------------------------------------------
    // getState()
    // Returns the current (processing) state of the module
    // -------------------------------------------------------------------------
    getState: () => {
      return _this.state;
    }, // END getState

    // -------------------------------------------------------------------------
    // cleanup()
    // Claude: optimized code and fixes - Added cleanup method for proper resource management
    // -------------------------------------------------------------------------
    cleanup: () => {
      // Clear all tracked intervals
      activeIntervals.forEach(intervalId => {
        clearInterval(intervalId);
      });
      activeIntervals.clear();
      
      logger.info('Swiper adapter cleanup completed');
    } // END cleanup

  }; // END main (return)
})(j1, window);

{%- endcapture -%}

{%- if production -%}
  {{ cache|minifyJS }}
{%- else -%}
  {{ cache|strip_empty_lines }}
{%- endif -%}

{%- assign cache = false -%}