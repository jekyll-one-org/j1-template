---
regenerate:                             true
---

{%- capture cache -%}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/adapter/js/swiper.js
 # Liquid template to adapt the Swiper module
 #
 # Product/Info:
 # https://jekyll.one
 # Copyright (C) 2023, 2024 Juergen Adams
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
{% assign swiper_defaults       = modules.defaults.swiper.defaults %}
{% assign swiper_settings       = modules.swiper.settings %}

{% comment %} Set config options (settings only)
-------------------------------------------------------------------------------- {% endcomment %}
{% assign swiper_options        = swiper_defaults | merge: swiper_settings %}
{% assign swipers               = swiper_settings.sliders %}

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
 # Copyright (C) 2023, 2024 Juergen Adams
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
      var xhrLoadState                  = 'pending';                            // (initial) load state for the HTML portion of the carousel
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

          // load HTML portion for all carousels
          _this.loadSwiperHTML(swiperOptions, swiperOptions.sliders);

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
            xhrLoadState = j1.xhrDOMState['#{{swiper.id}}_parent'];
            if (xhrLoadState === 'success') {

              logger.info ('\n' + 'HTML portion loaded for swiper on id: ' + '{{swiper.id}}');

              // setup the slider
              logger.info ('\n' + 'swiper is being setup on id: ' + '{{swiper.id}}');
              const {{swiper.id}} = new Swiper('#{{swiper.id}}', {
                // parameters
                direction:              {%- if swiper.options.direction -%}  {{swiper.options.direction}}                  {%- else -%} 'horizontal' {%- endif -%},
                loop:                   {%- if swiper.options.loop -%}       {{swiper.options.loop}}                       {%- else -%} false        {%- endif -%},
                // modules
                a11y:                   {%- if swiper.modules.a11y -%}       {{swiper.modules.a11y|replace: '=>', ':'}}     {%- else -%} false      {%- endif -%},
                autoplay:               {%- if swiper.modules.autoplay -%}   {{swiper.modules.autoplay|replace: '=>', ':'}} {%- else -%} false      {%- endif -%},
                pagination:             {%- if swiper.modules.pagination -%}   {{swiper.modules.pagination|replace: '=>', ':'}} {%- else -%} false      {%- endif -%},                
                // events
                on: {
                  init: () => {
                    // do something on initialization
                  },                  
                  afterInit: () => {
                    // do something after initialization
                  },
                }
              }); // END Swiper 

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
    // loadSwiperHTML()
    // load all Slick carousels (HTML portion) dynanically configured
    // and enabled (AJAX) from YAMLdata file
    // NOTE: Make sure the placeholder is available in the content page
    // eg. using the asciidoc extension mastercarousel::
    // -------------------------------------------------------------------------
    loadSwiperHTML: (options, carousel) => {
      var numcarousels      = Object.keys(carousel).length;
      var active_carousels  = numcarousels;
      var xhr_data_path   = options.xhr_data_path + '/index.html';
      var xhr_container_id;

      // console.debug('number of carousels found: ' + numcarousels);

      _this.setState('load_data');
      Object.keys(carousel).forEach ((key) => {
        if (carousel[key].enabled) {
          xhr_container_id = carousel[key].id + '_parent';

          // console.debug('load HTML data on carousel id: ' + carousel[key].id);
          j1.loadHTML({
            xhr_container_id: xhr_container_id,
            xhr_data_path:    xhr_data_path,
            xhr_data_element: carousel[key].id
          });
        } else {
          // console.debug('carousel found disabled on id: ' + carousel[key].id);
          active_carousels--;
        }
      });
      // console.debug('carousels loaded in page enabled|all: ' + active_carousels + '|' + numcarousels);
      _this.setState('data_loaded');
    }, // END loadSwiperHTML

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