---
regenerate:                             true
---

{%- capture cache -%}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/adapter/js/lazyCSSLoaderLoader.js
 # Liquid template to adapt the lazyCSSLoader module (core)
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
 #  wave_options:  {{ wave_options | debug }}
 # -----------------------------------------------------------------------------
{% endcomment %}

{% comment %} Liquid procedures
-------------------------------------------------------------------------------- {% endcomment %}

{% comment %} Set global settings
-------------------------------------------------------------------------------- {% endcomment %}
{% assign environment          = site.environment %}
{% assign asset_path           = "/assets/theme/j1" %}

{% comment %} Process YML config data
================================================================================ {% endcomment %}

{% comment %} Set config files
-------------------------------------------------------------------------------- {% endcomment %}
{% assign template_config      = site.data.j1_config %}
{% assign blocks               = site.data.blocks %}
{% assign modules              = site.data.modules %}

{% comment %} Set config data (settings only)
-------------------------------------------------------------------------------- {% endcomment %}
{% assign lazy_css_loader_defaults = modules.defaults.lazyCSSLoader.defaults %}
{% assign lazy_css_loader_settings = modules.lazyCSSLoader.settings %}

{% comment %} Set config options (settings only)
-------------------------------------------------------------------------------- {% endcomment %}
{% assign lazy_css_loader_options  = lazy_css_loader_defaults | merge: lazy_css_loader_settings %}

{% comment %} Detect prod mode
-------------------------------------------------------------------------------- {% endcomment %}
{% assign production = false %}
{% if environment == 'prod' or environment == 'production' %}
  {% assign production = true %}
{% endif %}

/*
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/adapter/js/lazyCSSLoader.js
 # J1 Adapter for the lazyCSSLoader module (core: lazyCSS)
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
j1.adapter.lazyCSSLoader = ((j1, window) => {

{% comment %} Set global variables
-------------------------------------------------------------------------------- {% endcomment %}
var environment     = '{{environment}}';
var cookie_names    = j1.getCookieNames();
var user_state      = j1.readCookie(cookie_names.user_state);
var state           = 'not_started';

var lazyCSSLoaderDefaults;
var lazyCSSLoaderSettings;
var lazyCSSLoaderOptions;
var frontmatterOptions;

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

      // -----------------------------------------------------------------------
      // default module settings
      // -----------------------------------------------------------------------
      var settings = $.extend({
        module_name: 'j1.adapter.lazyCSSLoader',
        generated:   '{{site.time}}'
      }, options);

      // -----------------------------------------------------------------------
      // global variable settings
      // -----------------------------------------------------------------------

      // create settings object from module options
      //
      lazyCSSLoaderDefaults = $.extend({}, {{lazy_css_loader_defaults | replace: 'nil', 'null' | replace: '=>', ':' }});
      lazyCSSLoaderSettings = $.extend({}, {{lazy_css_loader_settings | replace: 'nil', 'null' | replace: '=>', ':' }});
      lazyCSSLoaderOptions  = $.extend(true, {}, lazyCSSLoaderDefaults, lazyCSSLoaderSettings);

      _this  = j1.adapter.lazyCSSLoader;
      logger = log4javascript.getLogger('j1.adapter.lazyCSSLoader');

      // -------------------------------------------------------------------------
      // module initializer
      // ---------------------------------------------------------------------
      var dependency_met_j1_core_ready = setInterval(() => {
        var j1CoreFinished = (j1.getState() === 'finished') ? true: false;

        if (j1CoreFinished) {
          startTimeModule = Date.now();

          _this.setState('started');
          logger.debug('\n' + 'set module state to: ' + _this.getState());
          logger.info('\n' + 'initializing module: started');

          _this.registerLoaders(lazyCSSLoaderOptions);

          _this.setState('finished');
          logger.debug('\n' + 'state: ' + _this.getState());
          logger.info('\n' + 'initializing module: finished');

          endTimeModule = Date.now();
          logger.info('\n' + 'module initializing time: ' + (endTimeModule-startTimeModule) + 'ms');

          clearInterval(dependency_met_j1_core_ready);
        } // END if pageVisible
      }, 10); // END dependency_met_j1_core_ready
    }, // END init

    // -------------------------------------------------------------------------
    // registerLoaders()
    // Lazy load CSS to speed up page rendering
    //
    // Requires the following settings:
    //
    //    src:        the 'location' of the CSS file
    //    selector:   the 'selector' that triggers the observer
    //    rootMargin: the 'margin' before the load is trigged
    //
    // -------------------------------------------------------------------------
    //
    registerLoaders: () => {
      {% for loader in lazy_css_loader_options.loaders %} {% if loader.enabled %}
        _this.lazyCSSLoader().observe({
          src:        '{{loader.src}}',
          selector:   '{{loader.selector}}',
          rootMargin: '{{loader.rootMargin}}'
        });
        logger.info('\n' + 'register lazy loading for: {{loader.description}}');
      {% endif %} {% endfor %}
    }, // END registerLoaders

    // -------------------------------------------------------------------------
    // lazyCSSLoader()
    // Lazy load CSS to speed up page rendering
    //
    lazyCSSLoader: () => {
      let options = {};

      const observe = (opt) => {
        options = opt;

        // sessionStorage NOT used
        //
        // (('IntersectionObserver' in window && !sessionStorage[options.selector]) ? fnCssObserver : fnCssDomLink)();
        (('IntersectionObserver' in window) ? fnCssObserver : doNothing) ();
      }

      const doNothing = () => {
        observe = false;
      }

      const fnCssDomLink = () => {
          let link = document.createElement('link');
          let id = 'lazy' + options.selector;
          link.id = id.replace('.', '_');;
          link.rel = 'stylesheet';
          link.type = 'text/css';
          link.href = options.src;
          document.head.appendChild(link);
      }

      const fnCssObserver = () => {
          let selectors = document.querySelectorAll(options.selector);
          let observer = new IntersectionObserver((entry, observer) => {
              if (entry[0].intersectionRatio > 0) {
                  fnCssDomLink();
                  sessionStorage[options.selector] = true;
                  observer.disconnect();
              }
          }, { rootMargin: options.rootMargin });
          selectors.forEach(selector => {
              observer.observe(selector);
          });
      }

      return { observe };
    },

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
