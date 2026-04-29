---
regenerate:                             true
---

{%- capture cache -%}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/adapter/js/photoswipe.js (0)
 # Liquid template to adapt Photoswipe Lightbox Core functions
 # Based on Photoswipe Lightbox V5 (v.5.4.4) - Modified version for J1 Theme.
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
{% assign lightbox_defaults = modules.defaults.photoswipe.defaults %}
{% assign lightbox_settings = modules.photoswipe.settings %}

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
 # ~/assets/theme/j1/adapter/js/photoswipe.js (0)
 # JS Adapter for J1 Photoswipe Lightbox (v5.4.4)
 # Modified version for J1 Theme.
 #
 # Product/Info:
 # https://jekyll.one
 # https://photoswipe.com
 #
 # Copyright (C) 2014 - 2024 Dmitry Semenov
 # Copyright (C) 2026 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # For details, see: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 # PhotoSwipe is licensed under the MIT License.
 # See: https://github.com/dimsemenov/PhotoSwipe/blob/master/LICENSE
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
j1.adapter.photoswipe = ((j1, window) => {

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

  // Declare lb at module scope so the instance is accessible from all
  // methods (messageHandler, open, destroy) and by external callers
  // via j1.adapter.photoswipe.getLightbox().
  var lb;

  // MutationObserver reference kept at module scope so it can be
  // disconnected cleanly when destroy() is called.
  var domObserver;

  // ---------------------------------------------------------------------------
  // helper functions
  // ---------------------------------------------------------------------------

  // _initLightbox()
  // Centralises the actual PsLightbox initialisation so both the first
  // run and any re-initialisation triggered by the MutationObserver share
  // exactly the same code path and options.
  // ---------------------------------------------------------------------------
  function _initLightbox () {
    // Destroy any existing instance before creating a new one to prevent
    // duplicate event listeners accumulating across navigations / hot-reloads.
    if (lb && typeof lb.destroy === 'function') {
      lb.destroy();
      logger.debug('existing PsLightbox instance destroyed before re-init');
    }

    lb = PsLightbox.Lightbox.init(lightboxOptions);
    logger.debug('PsLightbox instance (re-)initialised with options: ' + JSON.stringify(lightboxOptions));
  }

  // _startDomObserver()
  // Watches the DOM for newly inserted [data-lightbox] elements so that
  // galleries and images injected after the initial page load (e.g. by
  // J1 gallery, carousel or AJAX modules) are covered by the same
  // PsLightbox instance without requiring a full page reload.
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
          logger.info('new [data-lightbox] elements detected – re-initialising PsLightbox');
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
        module_name: 'j1.adapter.photoswipe',
        generated:   '{{site.time}}'
      }, options);

      // -----------------------------------------------------------------------
      // global variable settings
      // -----------------------------------------------------------------------
      _this   = j1.adapter.photoswipe;
      logger  = log4javascript.getLogger('j1.adapter.photoswipe');

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
          // but skips PsLightbox initialisation so no listeners are attached.
          if (!lightboxOptions.enabled) {
            logger.info('PsLightbox is disabled via configuration – skipping initialisation');
            _this.setState('finished');
            logger.debug('state: ' + _this.getState());
            clearInterval(dependencies_met_page_ready);
            return;
          }

          // _initLightbox() replaces the inline PsLightbox.Lightbox.init() call.
          // The instance is stored in the module-scoped `lb` variable so it is
          // reachable from getLightbox(), open(), destroy() and messageHandler().
          // jadams
          // _initLightbox();

          // Start the MutationObserver so that [data-lightbox] elements added
          // dynamically by other J1 modules (galleries, carousels, AJAX) are
          // automatically covered by the same PsLightbox instance and options.
          // jadams
          // _startDomObserver();

          _this.setState('finished');
          logger.debug('state: ' + _this.getState());
          logger.info('initializing module finished');

          endTimeModule = Date.now();
          logger.info('module initializing time: ' + (endTimeModule-startTimeModule) + 'ms');

          clearInterval(dependencies_met_page_ready);
        } // END if pageVisible
      }, 10); // END dependencies_met_page_ready

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
    // Returns the active PsLightbox instance for programmatic access.
    // Callers can use this to invoke lb.open(url) or lb.destroy() directly.
    //
    // Example (from another J1 module):
    //   const lb = j1.adapter.photoswipe.getLightbox();
    //   if (lb) { lb.open('/assets/images/hero.jpg[Hero image]'); }
    // -------------------------------------------------------------------------
    getLightbox: () => {
      return lb;
    }, // END getLightbox

    // -------------------------------------------------------------------------
    // open()
    // Convenience wrapper to programmatically open an image URL in the
    // active PsLightbox instance without requiring callers to hold a
    // reference to the raw lb object.
    //
    // @param {string} url  Full URL optionally suffixed with [caption]:
    //                      '/assets/image/foo.jpg[My caption]'
    // -------------------------------------------------------------------------
    open: (url) => {
      if (lb && typeof lb.open === 'function') {
        lb.open(url);
      } else {
        logger.warn('open() called before PsLightbox is initialised or while disabled');
      }
    }, // END open

    // -------------------------------------------------------------------------
    // destroy()
    // Tears down the PsLightbox instance and the MutationObserver.
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
        logger.info('PsLightbox instance destroyed');
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