---
regenerate:                             true
---

{%- capture cache -%}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/adapter/js/lightbox3.js (2)
 # Liquid template to adapt Lightbox V3 Core functions
 # Based on Lightbox V3 v.1.1.0 - Modified version for J1 Theme.
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2026 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # For details, see: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 # -----------------------------------------------------------------------------
 # Test data:
 #  {{ liquid_var | debug }}
 # -----------------------------------------------------------------------------
{% endcomment %}

{% comment %} Liquid procedures
-------------------------------------------------------------------------------- {% endcomment %}

{% comment %} Set global settings
-------------------------------------------------------------------------------- {% endcomment %}
{% assign environment       = site.environment %}
{% assign template_version  = site.version %}

{% comment %} Process YML config data
================================================================================ {% endcomment %}

{% comment %} Set config files
-------------------------------------------------------------------------------- {% endcomment %}
{% assign template_config   = site.data.j1_config %}
{% assign modules           = site.data.modules %}

{% comment %} Set config data
-------------------------------------------------------------------------------- {% endcomment %}
{% assign lightbox_defaults = modules.defaults.lightbox3.defaults %}
{% assign lightbox_settings = modules.lightbox3.settings %}

{% comment %} Set config options
-------------------------------------------------------------------------------- {% endcomment %}
{% assign lightbox_options  = lightbox_defaults | merge: lightbox_settings %}

{% comment %} Detect prod mode
-------------------------------------------------------------------------------- {% endcomment %}
{% assign production = false %}
{% if environment == 'prod' or environment == 'production' %}
  {% assign production = true %}
{% endif %}


/*
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/adapter/js/lightbox3.js (2)
 # JS Adapter for J1 Lightbox V3 (based on v1.1.0)
 #
 # Product/Info:
 # https://jekyll.one
 # https://github.com/lokesh/lightbox3
 #
 # Copyright (C) 2026 Lokesh Dhakar
 # Copyright (C) 2026 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # For details, see: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 # Lightbox V3 is licensed under the MIT License.
 # For details, see https://github.com/lokesh/lightbox3/blob/master/LICENSE
 #
 # -----------------------------------------------------------------------------
 # Adapter generated: {{site.time}}
 # -----------------------------------------------------------------------------
*/

// -----------------------------------------------------------------------------
// ESLint shimming
// -----------------------------------------------------------------------------
/* eslint indent: "off"                                                       */
// -----------------------------------------------------------------------------
"use strict";
j1.adapter.lightbox3 = ((j1, window) => {

  const isDev = (j1.env === "development" || j1.env === "dev") ? true : false;

  {% comment %} Global variables
  ------------------------------------------------------------------------------ {% endcomment %}
  var environment       = '{{environment}}';
  var state             = 'not_started';

  var lightboxDefaults;
  var lightboxSettings;
  var lightboxOptions;
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
  // safety-timeout handle for the bounded page-ready poller below.
  //
  var dependenciesTimeout;

  // Declare lb at module scope so the instance is accessible from all
  // methods (messageHandler, open, destroy) and by external callers
  // via j1.adapter.lightbox3.getLightbox().
  var lb;

  // MutationObserver reference kept at module scope so it can be
  // disconnected cleanly when destroy() is called.
  var domObserver;

  // ---------------------------------------------------------------------------
  // helper functions
  // ---------------------------------------------------------------------------

  // _initLightbox()
  // Centralises the actual Lightbox3 initialisation so both the first
  // run and any re-initialisation triggered by the MutationObserver share
  // exactly the same code path and options.
  // ---------------------------------------------------------------------------
  function _initLightbox () {
    // Destroy any existing instance before creating a new one to prevent
    // duplicate event listeners accumulating across navigations / hot-reloads.
    if (lb && typeof lb.destroy === 'function') {
      lb.destroy();
      logger.debug('existing Lightbox3 instance destroyed before re-init');
    }

    lb = Lightbox3.Lightbox.init(lightboxOptions);
    logger.debug('Lightbox3 instance (re-)initialised with options: ' + JSON.stringify(lightboxOptions));
  }

  // _startDomObserver()
  // Watches the DOM for newly inserted [data-lightbox] elements so that
  // galleries and images injected after the initial page load (e.g. by
  // J1 gallery, carousel or AJAX modules) are covered by the same
  // Lightbox3 instance without requiring a full page reload.
  //
  // The observer calls _initLightbox() at most once per batch of mutations
  // (debounced via requestAnimationFrame) to avoid redundant re-inits.
  // ---------------------------------------------------------------------------
  function _startDomObserver () {
    if (domObserver) {
      domObserver.disconnect();
    }

    var rafPending = false;
    var selector   = lightboxOptions.selector || '[data-lightbox]';

    domObserver = new MutationObserver(function (mutations) {
      var hasNewTargets = mutations.some(function (mutation) {
        return Array.from(mutation.addedNodes).some(function (node) {
          if (node.nodeType !== Node.ELEMENT_NODE) { return false; }
          // Match the node itself or any of its descendants.
          return node.matches(selector) ||
                 node.querySelector(selector) !== null;
        });
      });

      if (hasNewTargets && !rafPending) {
        rafPending = true;
        requestAnimationFrame(function () {
          logger.info('new [data-lightbox] elements detected – re-initialising Lightbox3');
          _initLightbox();
          rafPending = false;
        });
      }
    });

    domObserver.observe(document.body, {
      childList: true,
      subtree:   true
    });

    logger.debug('MutationObserver active for selector: ' + selector);
  }

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
        module_name: 'j1.adapter.lightbox3',
        generated:   '{{site.time}}'
      }, options);

      // -----------------------------------------------------------------------
      // global variable settings
      // -----------------------------------------------------------------------
      _this   = j1.adapter.lightbox3;
      logger  = log4javascript.getLogger('j1.adapter.lightbox3');

      // create settings object from frontmatter (page settings)
      frontmatterOptions    = options !== null ? $.extend({}, options) : {};

      // Load module DEFAULTS|CONFIG
      lightboxDefaults      = $.extend({}, {{lightbox_defaults | replace: 'nil', 'null' | replace: '=>', ':' }});
      lightboxSettings      = $.extend({}, {{lightbox_settings | replace: 'nil', 'null' | replace: '=>', ':' }});

      // Use a deep (true) extend so nested objects such as backdrop,
      // springOpen and springClose are merged correctly rather than
      // replaced wholesale by the higher-priority source.
      lightboxOptions       = $.extend(true, {}, lightboxDefaults, lightboxSettings, frontmatterOptions);

      // -----------------------------------------------------------------------
      // module initializer
      // -----------------------------------------------------------------------
      var dependencies_met_page_ready = setInterval (() => {
        var pageState      = $('#content').css("display");
        var pageVisible    = (pageState === 'block') ? true: false;
        var j1CoreFinished = (j1.getState() === 'finished') ? true : false;

        if (j1CoreFinished && pageVisible) {
          startTimeModule = Date.now();

          _this.setState('started');
          logger.debug('state: ' + _this.getState());
          logger.info('module is being initialized');

          // Guard: honour the enabled flag from merged config.
          // When enabled is false the adapter registers itself as finished
          // but skips Lightbox3 initialisation so no listeners are attached.
          if (!lightboxOptions.enabled) {
            logger.info('Lightbox3 is disabled via configuration – skipping initialisation');
            _this.setState('finished');
            logger.debug('state: ' + _this.getState());
            clearInterval(dependencies_met_page_ready);
            // claude - J1 Adapter optimizations #1
            // clear safety timeout on the disabled-but-finished path too
            //
            if (dependenciesTimeout) {
              clearTimeout(dependenciesTimeout);
              dependenciesTimeout = null;
            }
            return;
          }

          // _initLightbox() replaces the inline Lightbox3.Lightbox.init() call.
          // The instance is stored in the module-scoped `lb` variable so it is
          // reachable from getLightbox(), open(), destroy() and messageHandler().
          _initLightbox();

          // Start the MutationObserver so that [data-lightbox] elements added
          // dynamically by other J1 modules (galleries, carousels, AJAX) are
          // automatically covered by the same Lightbox3 instance and options.
          _startDomObserver();

          _this.setState('finished');
          logger.debug('state: ' + _this.getState());
          logger.info('initializing module finished');

          endTimeModule = Date.now();
          logger.info('module initializing time: ' + (endTimeModule-startTimeModule) + 'ms');

          clearInterval(dependencies_met_page_ready);
          // claude - J1 Adapter optimizations #1
          // clear safety timeout on the happy path
          //
          if (dependenciesTimeout) {
            clearTimeout(dependenciesTimeout);
            dependenciesTimeout = null;
          }
        } // END if pageVisible
      }, 10); // END dependencies_met_page_ready

      // claude - J1 Adapter optimizations #1
      // bound the page-ready poller. Previously, if `#content` never reached
      // `display: block` or j1.getState() never reached 'finished' (e.g. a
      // bug elsewhere in the boot sequence, an aborted navigation, an
      // extension hiding #content), this 10ms interval ran for the lifetime
      // of the tab. Cap it at 30s and log a warning so the failure mode is
      // visible in the console instead of silently burning CPU.
      //
      dependenciesTimeout = setTimeout(function () {
        if (dependencies_met_page_ready) {
          clearInterval(dependencies_met_page_ready);
          logger.warn('lightbox3 init aborted: page-ready conditions not met within 5s');
        }
      }, 5000);

    }, // END init lightbox

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
    }, // END getState

    // -------------------------------------------------------------------------
    // getLightbox()
    // Returns the active Lightbox3 instance for programmatic access.
    // Callers can use this to invoke lb.open(url) or lb.destroy() directly.
    //
    // Example (from another J1 module):
    //   const lb = j1.adapter.lightbox3.getLightbox();
    //   if (lb) { lb.open('/assets/images/hero.jpg[Hero image]'); }
    // -------------------------------------------------------------------------
    getLightbox: () => {
      return lb;
    }, // END getLightbox

    // -------------------------------------------------------------------------
    // open()
    // Convenience wrapper to programmatically open an image URL in the
    // active Lightbox3 instance without requiring callers to hold a
    // reference to the raw lb object.
    //
    // @param {string} url  Full URL optionally suffixed with [caption]:
    //                      '/assets/image/foo.jpg[My caption]'
    // -------------------------------------------------------------------------
    open: (url) => {
      if (lb && typeof lb.open === 'function') {
        lb.open(url);
      } else {
        logger.warn('open() called before Lightbox3 is initialised or while disabled');
      }
    }, // END open

    // -------------------------------------------------------------------------
    // destroy()
    // Tears down the Lightbox3 instance and the MutationObserver.
    // Useful when navigating away or when a page section is removed so
    // that no stale event listeners remain in memory.
    // -------------------------------------------------------------------------
    destroy: () => {
      if (domObserver) {
        domObserver.disconnect();
        domObserver = null;
        logger.debug('MutationObserver disconnected');
      }
      if (lb && typeof lb.destroy === 'function') {
        lb.destroy();
        lb = null;
        logger.info('Lightbox3 instance destroyed');
      }
      _this.setState('destroyed');
    } // END destroy

  }; // END main (return)
})(j1, window);

{%- endcapture -%}

{%- if production -%}
  {{ cache|minifyJS }}
{%- else -%}
  {{ cache|strip_empty_lines }}
{%- endif -%}

{%- assign cache = false -%}