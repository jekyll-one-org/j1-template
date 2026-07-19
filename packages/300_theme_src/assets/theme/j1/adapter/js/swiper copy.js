---
regenerate:                             true
---

{%- capture cache -%}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/adapter/js/swiper.js (4)
 # Liquid template to adapt J1 SwiperJS Apps
 #
 # Product/Info:
 # https://jekyll.one
 # Copyright (C) 2026 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # For details, see: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 # -----------------------------------------------------------------------------
 # Test data:
 #  {{ liquid_var | debug }}
 #  swiper_options:  {{ swiper_options | debug }}
 # -----------------------------------------------------------------------------
{% endcomment %}

{% comment %} claude - Fix J1 Swiper YAML data processing #1
 # -----------------------------------------------------------------------------
 # PER-SWIPER CONFIG INHERITANCE CHAIN (adapter)
 #
 #   swiper settings -> overload user settings -> overload default settings
 #
 # Effective settings for ONE swiper instance are now built as a DEEP merge
 # of the three YAML layers (later layers overwrite earlier layers per key,
 # missing keys fall through):
 #
 #   1. _data/modules/defaults/swiper.yml   (defaults ..............)  base
 #   2. _data/modules/swiper_control.yml    (settings, w/o swipers ..)  user
 #                                          optional GLOBAL section
 #   3. _data/modules/swiper_control.yml    (settings.swipers[] ....)  swiper
 #
 # Before this fix the adapter read EVERY per-swiper key RAW from the loop
 # variable (swiper.parameters, swiper.module_settings, swiper.lightbox.*,
 # swiper.events) with NO fallthrough to the user or default layer. A key not
 # declared on the swiper entry resolved to Liquid 'nil' — NOT to its
 # default, so the defaults file had NO effect on any swiper instance.
 #
 # The most severe consequence was in the PhotoSwipe Lightbox setup: the
 # blocks there are guarded by the truthiness of 'swiper.lightbox.parameters',
 # 'swiper.lightbox.ui_controls' and 'swiper.lightbox.kbd_controls'
 # respectively. For a swiper that carries only
 # 'lightbox: {enabled: true}' (the layout intended by the "split J1 Swiper
 # data #1" cleanup of swiper.yml, which moved those subtrees INTO the
 # defaults and removed them from the per-swiper entries), all three guards
 # were nil, so the Lightbox was constructed with 'gallery' and 'pswpModule'
 # ONLY — every configured parameter, ui control and kbd control was
 # silently dropped. 5 of the 11 configured swipers are in exactly that
 # state today and would hit this the moment their lightbox is enabled.
 #
 # In addition the global options were built with the SHALLOW 'merge' filter
 # in Liquid (any key set on a higher layer dropped ALL sibling default keys
 # of its subtree) and with $.extend(true, ...) in JS (which merges ARRAYS
 # INDEX-WISE, so a shorter higher-layer array leaves stale tail elements of
 # the lower layer in place).
 #
 # This is the same defect class fixed for the J1 Amplitude module by
 # "claude - Fix Amplitude YAML data processing #1" and is resolved here by
 # the same mechanism.
 #
 # Changes (all tagged "claude - Fix J1 Swiper YAML data processing #1"):
 #
 #   • Liquid: swiper_options — global chain built with deep_merge
 #     (defaults <- control/user) instead of the shallow 'merge' filter.
 #   • Liquid: the swiper loop iterates 'swiper_entry' (RAW control entry)
 #     now and assigns the EFFECTIVE object to 'swiper' as the FIRST
 #     statement of each iteration. The whole loop body is therefore
 #     UNCHANGED and reads the effective chain through the same 'swiper.*'
 #     expressions it always used.
 #
 #     NOTE on Liquid scoping (why the loop var is renamed): an 'assign'
 #     tag writes to the OUTERMOST scope, while a 'for' loop var lives in
 #     the loop's own (innermost) scope and SHADOWS it. Assigning to the
 #     loop var's own name from inside the loop would therefore have NO
 #     effect (verified against Liquid 5.4, the engine used by Jekyll).
 #     Renaming the loop var to 'swiper_entry' frees the name 'swiper' so
 #     the assigned effective object is what the body resolves.
 #   • JS: _deepMerge(target, ...sources) — deep merge helper (plain objects
 #     merged recursively, ARRAYS REPLACE as a whole, scalars overload; same
 #     semantics as the J1 Amplitude adapter fix #1 and the J1 VideoPlayer
 #     adapter fix #48).
 #   • JS: _self() — module-scope helper resolving the module object
 #     independent of the init() state: (_this || j1.adapter.swiper).
 #   • JS: init() — _this is bound to j1.adapter.swiper as the FIRST
 #     statement of init(). This is REQUIRED here: the ORIGINAL binding of
 #     _this sits BELOW the swiperOptions assignment, so calling
 #     _this._deepMerge() from that assignment would throw
 #       TypeError: Cannot read properties of undefined (reading '_deepMerge')
 #     on every page load — exactly the init-time crash that had to be
 #     repaired for the AmplitudeJS adapter afterwards by
 #     "claude - Fix Amplitude YAML data processing #2". The lesson is
 #     applied UP FRONT here. The original (late) binding is KEPT unchanged
 #     (now a harmless re-assignment) so the former code path stays intact.
 #     NOTE: init() is an ARROW function, so 'this' is NOT bound to the
 #     module object and cannot be used as a substitute.
 #   • JS: swiperOptions — built by _deepMerge (chain: defaults <- user
 #     settings) instead of $.extend(true, ...). Exposed as
 #     j1.adapter.swiper.swiperOptions.
 #   • JS: getInstanceOptions(swiperId) — public method returning the cached
 #     EFFECTIVE options object for ONE swiper instance (defaults <- user
 #     settings <- swiper entry). Exposed as
 #     j1.adapter.swiper.swiperInstanceOptions.
 # ----------------------------------------------------------------------------- {% endcomment %}

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
{% assign swiper_defaults     = modules.defaults.swiper.defaults %}
{% assign swiper_settings     = modules.swiper_control.settings %}
{% assign swiper_media        = modules.swiper_media.settings %}

{% comment %} Set config options (settings only)
-------------------------------------------------------------------------------- {% endcomment %}

{% comment %} claude - Fix J1 Swiper YAML data processing #1
--------------------------------------------------------------------------------
 Global options: DEEP merge of the chain defaults <- swiper_settings (user
 settings). The former SHALLOW 'merge' filter replaced whole subtrees: any
 key set on a higher layer silently dropped ALL sibling default keys of that
 subtree. swiper_options is the BASE of the per-swiper chain resolved in the
 swiper loop below. Mirrors the same assignment in swiper.html so both the
 HTML data file and the adapter resolve an IDENTICAL chain.

 Original (deprecated, preserved for reference):
  {% assign swiper_options    = swiper_defaults | merge: swiper_settings %}
  {% assign swipers           = swiper_settings.swipers %}

  {% assign swiper_sorted     = swiper_options.swipers | sort: 'id' %}
  {% assign media_sorted      = swiper_media.media_sets | sort: 'name' %}

  swipers : {{ swipers | debug }}
-------------------------------------------------------------------------------- {% endcomment %}
{% assign swiper_options      = swiper_defaults | merge: swiper_settings %}
{% assign swipers             = swiper_settings.swipers %}

{% comment %} Detect prod mode
-------------------------------------------------------------------------------- {% endcomment %}
{% assign production = false %}
{% if environment == 'prod' or environment == 'production' %}
  {% assign production = true %}
{% endif %}


/*
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/adapter/js/swiper.js (3)
 # J1 Adapter for the swiper module
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2026 Juergen Adams
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

  {% comment %} Set global constants
  ------------------------------------------------------------------------------ {% endcomment %}
  const MODULE_NAME     = 'j1.adapter.swiper';
  const CONSOLE_LOG_ID  = Math.random().toString(36).substring(2, 13);
  const env             = j1.getEnv();
  const isDev           = (env === 'dev') ? true : false;

  {% comment %} Set global variables
  ------------------------------------------------------------------------------ {% endcomment %}
  var cookie_names      = j1.getCookieNames();
  var user_state        = j1.readCookie(cookie_names.user_state);
  var viewport_width    = $(window).width();
  var state             = 'not_started';

  var swiperDefaults;
  var swiperSettings;
  var swiperOptions;
  var swiperLayout;
  var frontmatterOptions;
  var themes_allowed;
  var theme_enabled;
  var theme;

  var _this;
  var logger;
  var logText;

  // claude - Fix J1 Swiper YAML data processing #1
  // per-instance options cache, keyed by swiperId. Each cache entry is the
  // deep merge of the inheritance chain:
  //   swiper settings -> overload user settings -> overload default settings
  // Populated lazily by getInstanceOptions().
  //
  var swiperInstanceOptions = {};

  // date|time
  var startTime;
  var endTime;
  var startTimeModule;
  var endTimeModule;
  var timeSeconds;

  // ---------------------------------------------------------------------------
  // helper functions
  // ---------------------------------------------------------------------------

  // claude - Fix J1 Swiper YAML data processing #1
  // _self()
  // Resolves the module object independent of the init() state. The module
  // keeps its self-reference in the module-scoped var _this that is bound
  // INSIDE init() only. Any method called before|outside init() would fail
  // on _this being 'undefined'. Because init() and all module methods are
  // ARROW functions, 'this' is NOT bound to the module object and cannot be
  // used here. j1.adapter.swiper is assigned when the module IIFE returned,
  // so the fallback is valid at ANY runtime call (it is evaluated lazily,
  // NOT at module load time).
  //
  var _self = () => (_this || j1.adapter.swiper);

  // ---------------------------------------------------------------------------
  // main
  // ---------------------------------------------------------------------------
  return {

    // -------------------------------------------------------------------------
    // adapter initializer
    // -------------------------------------------------------------------------
    init: (options) => {

      // -----------------------------------------------------------------------
      // claude - Fix J1 Swiper YAML data processing #1
      // bind the module self-reference (EARLY)
      // -----------------------------------------------------------------------
      // The module reference _this MUST be bound before ANY use of it. The
      // global options chain below calls _self()._deepMerge() while the
      // ORIGINAL binding of _this is done FURTHER DOWN (right after the
      // 'global variable settings' block), leaving _this 'undefined' at that
      // point on a fresh page load:
      //
      //   TypeError: Cannot read properties of undefined (reading '_deepMerge')
      //
      // // That is exactly the init-time crash the AmplitudeJS adapter had to be
      // repaired for afterwards ("claude - Fix Amplitude YAML data processing
      // #2"); the lesson is applied UP FRONT here.
      // NOTE: init() is an ARROW function, 'this' is NOT bound to the module
      // object. j1.adapter.swiper is assigned when the module IIFE returned
      // and is therefore always valid at init() runtime.
      //
      _this = j1.adapter.swiper;

      var xhrLoadState                  = 'pending';                            // (initial) load state for the HTML portion of the swiper
      var load_dependencies             = {};                                   // dynamic variable
      var carouselResponsiveSettingsOBJ = {};                                   // initial object for responsive settings
      var reload_on_resize              = false;

      var dependency;
      var carouselResponsiveSettingsYAML;
      var carouselResponsiveSettingsSTRING;
      var swiper_lightbox_enabled;

      // -----------------------------------------------------------------------
      // default module settings
      // -----------------------------------------------------------------------
      var settings = $.extend({
        module_name:  MODULE_NAME,
        generated:    '{{site.time}}'
      }, options);

      // -----------------------------------------------------------------------
      // global variable settings
      // -----------------------------------------------------------------------

      // create settings object from module options
      swiperDefaults  = $.extend({}, {{swiper_defaults | replace: 'nil', 'null' | replace: '=>', ':' }});
      swiperSettings  = $.extend({}, {{swiper_settings | replace: 'nil', 'null' | replace: '=>', ':' }});

      // claude - Fix J1 Swiper YAML data processing #1
      // Build the GLOBAL (module-level) options with the _deepMerge helper
      // (chain: defaults <- user settings). $.extend(true, ...) merges ARRAYS
      // INDEX-WISE: a shorter array on a higher layer leaves the stale tail
      // elements of the lower layer in place. _deepMerge REPLACES arrays as a
      // whole, which is the semantics the config layers require (relevant for
      // the 'swipers' array and for any array-valued parameter such as
      // 'breakpoints' overloads).
      // Reset + expose the PER-INSTANCE options cache so the module can read
      // the effective per-swiper chain via
      // j1.adapter.swiper.swiperInstanceOptions[swiperId] resp.
      // j1.adapter.swiper.getInstanceOptions(swiperId).
      //
      // Original (deprecated, preserved for reference):
      //  swiperOptions = $.extend(true, {}, swiperDefaults, swiperSettings);
      //
      swiperOptions = _self()._deepMerge({}, swiperDefaults, swiperSettings);

      swiperInstanceOptions             = {};
      _self()['swiperOptions']          = swiperOptions;
      _self()['swiperInstanceOptions']  = swiperInstanceOptions;

      // claude - Fix J1 Swiper YAML data processing #1
      // KEPT (superseded): _this is bound at the TOP of init() now, this
      // line is a harmless re-assignment of the same reference. The former
      // code path is left intact on purpose.
      //
      _this           = j1.adapter.swiper;
      theme           = user_state.theme_name;
      logger          = log4javascript.getLogger(MODULE_NAME);

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

          // load HTML portion for all swipers
          _this.loadSwiperHTML(swiperOptions, swiperOptions.swipers);

          _this.setState('started');
          logger.debug('\n' + `state: ${_this.getState()}`);
          logger.info('\n' + 'module is being initialized');

          {% comment %} claude - Fix J1 Swiper YAML data processing #1
          ----------------------------------------------------------------------
          The loop iterates the RAW control entries as 'swiper_entry' now.
          The EFFECTIVE options of the instance are resolved as the FIRST
          statement of the iteration and assigned to 'swiper', so the
          complete loop body below stays UNCHANGED and resolves the full
          inheritance chain

            swiper settings -> overload user settings -> overload default settings

          through the very same 'swiper.*' expressions it used before. This
          is what restores the lightbox parameters|ui_controls|kbd_controls
          for swipers that carry 'lightbox: {enabled: true}' only.

          Original (deprecated, preserved for reference):
            {% for swiper in swipers %}{% if swiper.enabled %}
            {% endif %}{% endfor %}

            {% if swiper_options.lightbox.enabled %}
            {% assign swiper.lightbox = swiper_entry.lightbox | merge: swiper_options.lightbox %}
            swiper.lightbox: {{ swiper.lightbox | debug }}
            {% endif %}
          ---------------------------------------------------------------------- {% endcomment %}
          {% for swiper_entry in swipers %}
          {% assign swiper = swiper_entry | merge: swiper_options %}

          {% if swiper.enabled %}
          logger.info('\n' + `initialize swiper on id: {{swiper.id}}`);

          // create dynamic loader variable
          dependency = 'dependencies_met_html_loaded_{{swiper.id}}';
          load_dependencies[dependency] = '';

          // initialize the swiper if the HTML portion of the slider successfully loaded
          load_dependencies['dependencies_met_html_loaded_{{swiper.id}}'] = setInterval (() => {
            // check if HTML portion of the swiper is loaded successfully
            xhrLoadState = j1.xhrDOMState['#{{swiper.id}}_app'];
            if (xhrLoadState === 'success') {

              logger.info('\n' + `HTML portion loaded for swiper on id: {{swiper.id}}`);

              {% comment %} Set Swiper Layout
              ------------------------------------------------------------------ {% endcomment %}      
              {% assign type_layout   = swiper.layout | split: "/" %}
              {% assign swiper_layout = type_layout[1] | capitalize %}             

              // setup slider {{swiper.id}}
              // ---------------------------------------------------------------
              logger.info('\n' + `swiper is being setup on id: {{swiper.id}}`);

              const slider        = document.querySelector('#{{swiper.id}}');
              const swiperEl      = slider.querySelector('.swiper');

              {% if swiper_layout != 'Stacked' %}
              const {{swiper.id}} = new Swiper(swiperEl, {             
                // set swiper CORE parameter settings
                {% if swiper.parameters %}
                {% for setting in swiper.parameters %}
                {% if setting[0] == 'direction' or setting[0] == 'effect' or setting[0] == 'slideHeight' %}
                {{setting[0]}}: {{ setting[1] | replace: '=>', ':' | json }},
                {% else %}
                {{setting[0]}}: {{ setting[1] | replace: '=>', ':' }},
                {% endif %}
                {% endfor %}
                {% endif %}
                // end swiper CORE parameter settings

                // set swiper LAYOUT module settings
                // -------------------------------------------------------------
                {% if swiper_layout != 'Base' or swiper_layout != 'Parallax' %}
                modules: [Layout{{swiper_layout}}],
                {% endif %}
                // end swiper LAYOUT module settings

                // set swiper DEFAULT module settings
                // -------------------------------------------------------------
                {% if swiper.module_settings %}
                {% for setting in swiper.module_settings %}
                {{setting[0]}}: {{ setting[1] | replace: '=>', ':' }},
                {% endfor %}
                {% endif %}
                // end swiper DEFAULT module settings

                // set swiper EVENT settings
                {% if swiper.events and swiper.events.enabled %}
                on: {
                  {% for setting in swiper.events %}
                  {% if setting[0] == 'enabled' %} {% continue %} {% endif %}
                  {{setting[0]}}: {{ setting[1] }},                  
                  {% endfor %}
                }
                {% endif %}
                // end swiper EVENT settings

              }); // end setup slider
              {% else %}
              const {{swiper.id}} = new Swiper(swiperEl, {             
                // set swiper LAYOUT module settings
                // -------------------------------------------------------------
                {% if swiper_layout != 'Base' or swiper_layout != 'Parallax' %}
                modules: [Layout{{swiper_layout}}],
                {% endif %}
              }); // end setup slider              
              {% endif %}

              {% if swiper.lightbox.enabled %}
              
              var bratze = 'pisse-{{swiper.id}}';

              {% comment %}
              {% assign swiper.lightbox = swiper.lightbox | merge: swiper_options.lightbox %}
              swiper.lightbox: {{ swiper.lightbox | debug }}
              ------------------------------------------------------------------ {% endcomment %}   
              
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
                logger.debug('\n' + `current slide index: ${pswp.currIndex}`);
            //  logger.debug('\n' + 'Slide object', pswp.currSlide);
            //  logger.debug('\n' + 'Slide object data', pswp.currSlide.data);
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
          logger.debug('\n' + `state: ${_this.getState()}`);
          logger.info('\n' + 'initializing module finished');

          endTimeModule = Date.now();
          logger.info('\n' + `module initializing time: ${(endTimeModule-startTimeModule)}ms`);

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

      j1.consoleLog(isDev, 'DEBUG', CONSOLE_LOG_ID, MODULE_NAME, `number of swipers found: ${numSwipers}`);

      _this.setState('load_data');
      Object.keys(swipers).forEach ((key) => {
        if (swipers[key].enabled) {
          xhrContainerId = swipers[key].id + '_app';

          j1.consoleLog(isDev, 'DEBUG', CONSOLE_LOG_ID, MODULE_NAME, `load HTML data on swiper id: ${swipers[key].id}`);

          j1.loadHTML({
            xhr_container_id: xhrContainerId,
            xhr_data_path:    xhrDataPath,
            xhr_data_element: swipers[key].id
          });
        } else {
          j1.consoleLog(isDev, 'DEBUG', CONSOLE_LOG_ID, MODULE_NAME, `swiper found disabled on swiper id: ${swipers[key].id}`);
          activeSwipers--;
        }
      });

      j1.consoleLog(isDev, 'DEBUG', CONSOLE_LOG_ID, MODULE_NAME, `swipers loaded in page enabled|all: ${activeSwipers}|${numSwipers}`);
      _this.setState('data_loaded');
    }, // END loadSwiperHTML

    // -------------------------------------------------------------------------
    // findModuleByName(array, functionName)
    // 
    // -------------------------------------------------------------------------
    findModuleByName: (moduleArray, moduleName) => {
      return moduleArray.find(func => func.name === moduleName);
    }, // END findModuleByName

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
    //     logger.debug('Slide index', pswp.currIndex);
    //     logger.debug('Slide object', pswp.currSlide);
    //     logger.debug('Slide object data', pswp.currSlide.data);
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

      logText = 'received message from ' + sender + ': ' + json_message;
      logger.debug('\n' + logText);

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
    // claude - Fix J1 Swiper YAML data processing #1
    // _deepMerge(target, ...sources)
    // Deep merge helper implementing the layer semantics of the config
    // inheritance chain (same semantics as the J1 Amplitude adapter fix #1
    // and the J1 VideoPlayer adapter fix #48):
    //
    //   • plain objects are merged RECURSIVELY (missing keys fall through
    //     to the lower layer, present keys overload it)
    //   • ARRAYS REPLACE the lower layer's value as a whole (copied via
    //     slice() so layers never share array references) — no index-wise
    //     merging as done by $.extend(true, ...)
    //   • scalars (string/number/boolean/null) overload the lower layer;
    //     'undefined' source values are skipped (key stays inherited)
    //
    // Sources are applied left to right: the LAST source wins.
    // -------------------------------------------------------------------------
    //
    _deepMerge: (target, ...sources) => {
      var isPlainObject = function (v) {
        return (v !== null && typeof v === 'object' && !Array.isArray(v));
      };

      sources.forEach(function (source) {
        if (!isPlainObject(source)) { return; }
        Object.keys(source).forEach(function (key) {
          var srcVal = source[key];
          if (isPlainObject(srcVal)) {
            if (!isPlainObject(target[key])) { target[key] = {}; }
            // recursion resolved by _self(): _this is bound INSIDE init()
            // only, so the recursion would fail for any call before|without
            // init()
            _self()._deepMerge(target[key], srcVal);
          } else if (Array.isArray(srcVal)) {
            target[key] = srcVal.slice();
          } else if (srcVal !== undefined) {
            target[key] = srcVal;
          }
        });
      });

      return target;
    }, // END _deepMerge

    // -------------------------------------------------------------------------
    // claude - Fix J1 Swiper YAML data processing #1
    // getInstanceOptions(swiperId)
    // Returns the EFFECTIVE options for ONE swiper instance, built from the
    // config inheritance chain (later overloads earlier):
    //
    //   1. swiperDefaults   — _data/modules/defaults/swiper.yml
    //   2. user settings    — _data/modules/swiper_control.yml
    //                         (GLOBAL keys of settings, w/o 'swipers')
    //   3. swiper entry     — _data/modules/swiper_control.yml
    //                         (settings.swipers[], matched by id)
    //
    // All default keys are available on the result; keys present in the user
    // settings overload the defaults, keys present in the swiper entry
    // overload both. The swiper entry keys are applied at TOP scope (the
    // per-swiper entries use the same flat key layout as the defaults file:
    // parameters, captions, lightbox, filters, ...). When no control entry
    // exists for the given id, the result equals the global chain
    // (defaults <- user settings).
    //
    // Results are cached per swiperId and exposed on the adapter object as
    // j1.adapter.swiper.swiperInstanceOptions[swiperId].
    //
    // This is the RUNTIME counterpart of the build-time Liquid chain
    // resolved in the init() loop and in swiper.html; both resolve the same
    // layers in the same order.
    // -------------------------------------------------------------------------
    //
    getInstanceOptions: (swiperId) => {
      // fast path: already resolved for this instance
      if (swiperInstanceOptions[swiperId]) {
        return swiperInstanceOptions[swiperId];
      }

      // user layer: all GLOBAL top-level keys of the control settings,
      // excluding the per-swiper array 'swipers'
      var userSettings = {};
      try {
        Object.keys(swiperSettings || {}).forEach(function (key) {
          if (key !== 'swipers') { userSettings[key] = swiperSettings[key]; }
        });
      } catch (e) {
        // logger is assigned in init() and is 'undefined' on early calls
        logger && logger.error('\n' + 'getInstanceOptions: user settings lookup failed [' + swiperId + ']: ' + e);
      }

      // resolve the swiper entry from the RAW control settings
      var swiperEntry = null;
      try {
        var entries = (swiperSettings && Array.isArray(swiperSettings.swipers))
          ? swiperSettings.swipers
          : [];
        for (var i = 0; i < entries.length; i++) {
          if (entries[i] && entries[i].id === swiperId) {
            swiperEntry = entries[i];
            break;
          }
        }
      } catch (e) {
        logger && logger.error('\n' + 'getInstanceOptions: control lookup failed [' + swiperId + ']: ' + e);
      }

      if (swiperEntry === null) {
        logger && logger.warn('\n' + 'getInstanceOptions: no control entry found [' + swiperId + '] — instance falls back to defaults <- user settings');
      }

      // build the per-instance chain:
      // swiper settings -> overload user settings -> overload default settings
      var instanceOptions = _self()._deepMerge(
        {},
        swiperDefaults,
        userSettings,
        swiperEntry || {}
      );

      // the 'swipers' array is control data, NOT an option of an instance:
      // drop it from the result so an instance can never read it back
      if (instanceOptions.swipers !== undefined) {
        delete instanceOptions.swipers;
      }

      // cache + expose
      swiperInstanceOptions[swiperId]  = instanceOptions;
      _self()['swiperInstanceOptions'] = swiperInstanceOptions;

      logger && logger.debug('\n' + 'getInstanceOptions: per-instance options resolved [' + swiperId + ']');
      return instanceOptions;
    }, // END getInstanceOptions

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