---
regenerate:                             true
---

{%- capture cache -%}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/adapter/js/lazyLoader.js (1)
 # Liquid template to adapt the J1 lazyLoader module
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
{% assign lazy_loader_defaults = modules.defaults.lazyLoader.defaults %}
{% assign lazy_loader_settings = modules.lazyLoader.settings %}

{% comment %} Set config options (settings only)
-------------------------------------------------------------------------------- {% endcomment %}
{% assign lazy_loader_options  = lazy_loader_defaults | merge: lazy_loader_settings %}

{% comment %} Detect prod mode
-------------------------------------------------------------------------------- {% endcomment %}
{% assign production = false %}
{% if environment == 'prod' or environment == 'production' %}
  {% assign production = true %}
{% endif %}


/*
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/adapter/js/lazyLoader.js (1)
 # J1 Adapter for the J1 lazyLoader module
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
`use strict`;
j1.adapter.lazyLoader = ((j1, window) => {

  const isDev = (j1.env === "development" || j1.env === "dev") ? true : false;

  {% comment %} Set global variables
  ------------------------------------------------------------------------------ {% endcomment %}
  var environment     = '{{environment}}';
  var cookie_names    = j1.getCookieNames();
  var user_state      = j1.readCookie(cookie_names.user_state);
  var state           = 'not_started';

  var lazyLoaderDefaults;
  var lazyLoaderSettings;
  var lazyLoaderOptions;
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

  // claude - J1 Adapter optimizations #1
  // safety-timeout handle for the bounded j1-core-ready poller below.
  //
  var dependenciesTimeout;

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
        module_name: 'j1.adapter.lazyLoader',
        generated:   '{{site.time}}'
      }, options);

      // -----------------------------------------------------------------------
      // global variable settings
      // -----------------------------------------------------------------------

      // create settings object from module options
      //
      lazyLoaderDefaults = $.extend({}, {{lazy_loader_defaults | replace: 'nil', 'null' | replace: '=>', ':' }});
      lazyLoaderSettings = $.extend({}, {{lazy_loader_settings | replace: 'nil', 'null' | replace: '=>', ':' }});
      lazyLoaderOptions  = $.extend(true, {}, lazyLoaderDefaults, lazyLoaderSettings);

      _this  = j1.adapter.lazyLoader;
      logger = log4javascript.getLogger('j1.adapter.lazyLoader');

      // -----------------------------------------------------------------------
      // module initializer
      // -----------------------------------------------------------------------
      var dependency_met_j1_core_ready = setInterval(() => {
        var j1CoreFinished = (j1.getState() === 'finished') ? true: false;

        if (j1CoreFinished) {
          startTimeModule = Date.now();

          _this.setState('started');
          logger.debug('set module state to: ' + _this.getState());
          logger.info('initializing module: started');

          _this.registerLoaders(lazyLoaderOptions);

          _this.setState('finished');
          logger.debug('state: ' + _this.getState());
          logger.info('initializing module: finished');

          endTimeModule = Date.now();
          logger.info('module initializing time: ' + (endTimeModule-startTimeModule) + 'ms');

          clearInterval(dependency_met_j1_core_ready);
          // claude - J1 Adapter optimizations #1
          // clear safety timeout on the happy path
          //
          if (dependenciesTimeout) {
            clearTimeout(dependenciesTimeout);
            dependenciesTimeout = null;
          }
        } // END if pageVisible
      }, 10); // END dependency_met_j1_core_ready

      // claude - J1 Adapter optimizations #1
      // bound the j1-core-ready poller. Previously, if j1.getState() never
      // reached 'finished' (e.g. a bug elsewhere in the boot sequence,
      // an aborted navigation), this 10ms interval ran for the lifetime
      // of the tab — particularly costly for lazyLoader since it never
      // gets to register IntersectionObservers and the user pays the CPU
      // bill with no functional payoff. Cap at 30s and log a warning.
      //
      dependenciesTimeout = setTimeout(function () {
        if (dependency_met_j1_core_ready) {
          clearInterval(dependency_met_j1_core_ready);
          logger.warn('lazyLoader init aborted: j1 core did not reach finished within 5s');
        }
      }, 5000);
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
      {% for loader in lazy_loader_options.loaders %} {% if loader.enabled %}

        {% if loader.type == 'css' %}
          _this.cssLoader().observe({
            src:        '{{loader.src}}',
            selector:   '{{loader.selector}}',
            rootMargin: '{{loader.rootMargin}}'
          });
          logger.info('register lazy loading for: {{loader.description}}');
        {% endif %}

      {% endif %} {% endfor %}
    }, // END registerLoaders

    // -------------------------------------------------------------------------
    // cssLoader()
    // Lazy load CSS to speed up page rendering
    //
    cssLoader: () => {
      let options = {};

      const observe = (opt) => {
        options = opt;

        (('IntersectionObserver' in window) ? cssObserver : doNothing) ();
      }

      const doNothing = () => {
        observe = false;
      }

      const cssDomLink = () => {
          let link = document.createElement('link');
          let id = 'lazy' + options.selector;
          link.id = id.replace('.', '_');;
          link.rel = 'stylesheet';
          link.type = 'text/css';
          link.href = options.src;
          document.head.appendChild(link);
          logger.info('lazy load of type ' + link.rel + ': ' + link.href);
      }

      const cssObserver = () => {
          let selectors = document.querySelectorAll(options.selector);
          let observer = new IntersectionObserver((entry, observer) => {
            if (entry[0].intersectionRatio > 0) {
                cssDomLink();
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
