---
regenerate:                             true
---

{%- capture cache -%}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/adapter/js/toccer.js (3)
 # Liquid template to adapt Tocbot Core functions
 #
 # Product/Info:
 # https://jekyll.one
 # https://tscanlin.github.io/tocbot
 #
 # Copyright (C) 2023-2026 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # For details, see: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 # Tocbot is licensed under under the MIT License.
 # For details, see https://tscanlin.github.io/tocbot
 # -----------------------------------------------------------------------------
 # jadams, 2019-03-10:
 # TODO: Old BS Affix code is to be removed
 # -----------------------------------------------------------------------------
  # jadams, 2019-03-10:
 # TODO: Manage heights
 #  Height of the window
 #    $(window).height()
 #  should be calculated and checked against the effective height of
 #  the toc menu:
 #    $('#toc_mmenu').outerHeight()
 #  to remove unneded overflow-y indicator (the scrollbar)
 # -----------------------------------------------------------------------------
{% endcomment %}

{% comment %} Liquid procedures
-------------------------------------------------------------------------------- {% endcomment %}

{% comment %} Process YML config data
================================================================================ {% endcomment %}

{% comment %} Set config files
-------------------------------------------------------------------------------- {% endcomment %}
{% assign template_config   = site.data.j1_config %}
{% assign blocks            = site.data.blocks %}
{% assign modules           = site.data.modules %}

{% comment %} Set config data
-------------------------------------------------------------------------------- {% endcomment %}
{% assign environment       = site.environment %}
{% assign template_version  = site.version %}

{% assign toccer_defaults   = modules.defaults.toccer.defaults %}
{% assign toccer_settings   = modules.toccer.settings %}

{% assign scroller_defaults = modules.defaults.scroller.defaults %}
{% assign scroller_settings = modules.scroller.settings %}

{% assign footer_config     = modules.j1_footer %}
{% assign footer_id         = modules.j1_footer.global.id %}

{% comment %} Set config options
-------------------------------------------------------------------------------- {% endcomment %}
{% assign toccer_options    = toccer_defaults | merge: toccer_settings %}

{% comment %} Detect prod mode
-------------------------------------------------------------------------------- {% endcomment %}
{% assign production = false %}
{% if environment == 'prod' or environment == 'production' %}
  {% assign production = true %}
{% endif %}


/*
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/adapter/js/toccer.js (3)
 # JS Adapter for J1 Toccer
 #
 # Product/Info:
 # https://jekyll.one
 # https://tscanlin.github.io/tocbot
 #
 # Copyright (C) 2023-2026 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # For details, see: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 # Tocbot is licensed under under the MIT License.
 # For details, see https://tscanlin.github.io/tocbot
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
j1.adapter.toccer = (() => {

  const isDev = (j1.env === "development" || j1.env === "dev") ? true : false;

  {% comment %} Set global variables
  ------------------------------------------------------------------------------ {% endcomment %}
  var environment         = '{{environment}}';
  var state               = 'not_started';

  var scrollerSettings    = {};
  var scrollerOptions     = {};
  var scrollerDefaults    = {};
  var toccerDefaults      = {};
  var toccerSettings      = {};
  var toccerOptions       = {};
  var frontmatterOptions  = {};

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
  // main object
  // ---------------------------------------------------------------------------
  return {

    // -------------------------------------------------------------------------
    // adapter initializer
    // -------------------------------------------------------------------------
    init: (options) => {

      // -----------------------------------------------------------------------
      // default module settings
      // -----------------------------------------------------------------------
      var settings  = $.extend({
        module_name: 'j1.adapter.toccer',
        generated:   '{{site.time}}'
      }, options);

      // -----------------------------------------------------------------------
      // global variable settings
      // -----------------------------------------------------------------------
      _this              = j1.adapter.toccer;
      logger             = log4javascript.getLogger('j1.adapter.toccer');

      // create settings object from frontmatter
      frontmatterOptions = options != null ? $.extend({}, options) : {};

      // Load module DEFAULTS|CONFIG
      toccerDefaults     = $.extend({}, {{toccer_defaults | replace: 'nil', 'null' | replace: '=>', ':' }});
      toccerSettings     = $.extend({}, {{toccer_settings | replace: 'nil', 'null' | replace: '=>', ':' }});
      toccerOptions      = $.extend(true, {}, toccerDefaults, toccerSettings, frontmatterOptions);

      // Load scroller module DEFAULTS|CONFIG
      scrollerDefaults   = $.extend({}, {{scroller_defaults | replace: 'nil', 'null' | replace: '=>', ':' }});
      scrollerSettings   = $.extend({}, {{scroller_settings | replace: 'nil', 'null' | replace: '=>', ':' }});
      scrollerOptions    = $.extend(true, {}, scrollerDefaults, scrollerSettings);

      // initialize state flag
      _this.setState('started');
      logger.debug('state: ' + _this.getState());
      logger.info('module is being initialized');

      // -----------------------------------------------------------------------
      // module initializer
      // -----------------------------------------------------------------------
      // J1 Adapter optimizations #1
      // bound the page-ready poller. Previously, if `#content` never reached
      // `display: block`, j1.getState() never reached 'finished', or the toc
      // module was effectively disabled by config (`toccerEnabled === false`),
      // this 10ms interval ran for the lifetime of the tab. The
      // `toccerEnabled` guard alone never lets the interval clear itself —
      // when toc is disabled, the condition is permanently false. Cap the
      // poller at 30s and log a warning so the failure mode is visible in
      // the console instead of silently burning CPU.
      //
      var dependenciesTimeout;
      var dependencies_met_toccer = setInterval (() => {
        var pageState      = $('#content').css("display");
        var pageVisible    = (pageState == 'block') ? true: false;
        var j1CoreFinished = (j1.getState() == 'finished') ? true : false;
        var toccerEnabled  = (j1.stringToBoolean(toccerOptions.toc)) ? true : false;
//      var atticFinished  = (j1.adapter.attic.getState() === 'finished') ? true: false;        

        if (toccerEnabled && j1CoreFinished && pageVisible) {
          startTimeModule = Date.now();

          _this.setState('started');
          logger.debug('state: ' + _this.getState());
          logger.info('module is being initialized');

          _this.initToccerCore(toccerOptions);

          // save config settings into the toccer object for later access
          _this['moduleOptions'] = toccerOptions;

          _this.setState('finished');
          logger.debug('state: ' + _this.getState());
          logger.info('initializing module finished');

          endTimeModule = Date.now();
          logger.info('module initializing time: ' + (endTimeModule-startTimeModule) + 'ms');

          clearInterval(dependencies_met_toccer);
          // J1 Adapter optimizations #1
          // clear the safety timeout on the happy path
          //
          if (dependenciesTimeout) {
            clearTimeout(dependenciesTimeout);
            dependenciesTimeout = null;
          }
        } // END
      }, 10); // END

      // J1 Adapter optimizations #1
      // safety bound paired with the 10ms poller above
      //
      dependenciesTimeout = setTimeout(function () {
        if (dependencies_met_toccer) {
          clearInterval(dependencies_met_toccer);
          logger.info('toccer init aborted: page-ready conditions not met within 5s');
        }
      }, 5000);
    }, // END init

    // -------------------------------------------------------------------------
    // Initialize the toccer on page
    // -------------------------------------------------------------------------
    initToccerCore: (options) => {
      var scrollOffsetCorrection  = scrollerOptions.smoothscroll.offsetCorrection;
      var scrollOffset            = j1.getScrollOffset(scrollOffsetCorrection) + scrollOffsetCorrection;

      // Fix J1 Toccer headline issue #1
      // -----------------------------------------------------------------------
      // Root cause of the "previous headline stays active" issue:
      // j1.scrollToAnchor() lands the page with the selected heading
      // 93px BELOW the viewport top (j1.js, static pages:
      //
      // `scrollOffsetCorrection = -93`, navbar compensation). Tocbot
      // decides the active TOC entry purely by position in
      // getTopHeader():
      //   heading.offsetTop <= scrollTop + headingsOffset + 10
      //
      // With the hardcoded `headingsOffset: 1` the "finish line" sits at
      // scrollTop + 11 while the target heading rests at scrollTop + 93,
      // so tocbot treats the target as "not yet reached" and highlights
      // headings[i - 1] - the last headline of the PREVIOUS section.
      // The threshold must mirror the magnitude of the scroll offset
      // actually used by j1.scrollToAnchor().
      //
      // NOTE (design decision, for review):
      // The value 93 is intentionally kept as a literal in sync with the
      // hardcoded `-93` in j1.scrollToAnchor() (j1.js). The computed
      // `scrollOffset` above is NOT reused because j1.scrollToAnchor()
      // does not use it either; both values may differ at runtime. A
      // follow-up could move the offset into a shared scroller config
      // key consumed by BOTH j1.scrollToAnchor() and this adapter.
      //
      // var anchorScrollOffset = 93;
      // -----------------------------------------------------------------------

      _this.setState('running');
      logger.debug('state: ' + _this.getState());

      // tocbot get fired if HTML portion is loaded (AJAX load finished)
      // J1 Adapter optimizations #1
      // bound the ajax-load poller. Previously, on any page where
      // `#toc_mmenu` is never injected (e.g. the AJAX include for the toc
      // panel fails, the layout omits the toc container, or the user
      // navigates away before the include completes), this 10ms interval
      // ran for the lifetime of the tab. Cap it and log a warning
      // so the failure mode is visible in the console instead of silently
      // burning CPU.
      //
      // Fix J1 Toccer headline issue #1
      // -----------------------------------------------------------------------
      // Original (deprecated, preserved for reference):
      // headingsOffset:         1,
      // Align tocbot's active-headline threshold with the landing
      // position produced by j1.scrollToAnchor() (see note above).
      // This also fixes MANUAL scrolling: with offset 1, a heading
      // hidden behind the fixed navbar was already counted as
      // "reached" and its section marked active too early.
      // -----------------------------------------------------------------------
      //
      var ajaxLoadTimeout;
      var ajaxLoadFinished;
      var dependencies_met_ajax_load_finished = setInterval (() => {

        ajaxLoadFinished = ($('#toc_mmenu').length) ? true : false;
        if (ajaxLoadFinished) {
          /* eslint-disable */
          tocbot.init({
            log:                    options.log,
            activeLinkColor:        options.activeLinkColor,
            tocSelector:            options.tocSelector,
            headingSelector:        options.headingSelector,
            ignoreSelector:         options.ignoreSelector,
            contentSelector:        options.contentSelector,
            collapseDepth:          options.collapseDepth,
            throttleTimeout:        options.throttleTimeout,
            disableTocScrollSync:   options.disableTocScrollSync,
            hasInnerContainers:     options.hasInnerContainers,
            includeHtml:            options.includeHtml,
            scrollSmooth:           options.scrollSmooth,
            scrollSmoothDuration:   options.scrollSmoothDuration,
            scrollSmoothOffset:     options.scrollSmoothOffset,
            linkClass:              options.linkClass,
            extraLinkClasses:       options.extraLinkClasses,
            activeLinkClass:        options.activeLinkClass,
            listClass:              options.listClass,
            extraListClasses:       options.extraListClasses,
            isCollapsedClass:       options.isCollapsedClass,
            collapsibleClass:       options.collapsibleClass,
            listItemClass:          options.listItemClass,
            positionFixedSelector:  options.positionFixedSelector,
            positionFixedClass:     options.positionFixedClass,
            fixedSidebarOffset:     options.fixedSidebarOffset,
            scrollContainer:        options.scrollContainer,
            headingsOffset:         options.anchorScrollOffset,
            throttleTimeout:        options.throttleTimeout,            
            onClick:                (event) => {
                                      // jadams 2024-03-16: workaroud|browser's history
                                      var currentURL = event.currentTarget.href;
                                      // add current URL (anchor) to browser's history
                                      history.pushState(null, null, currentURL);

                                      // jadams 2024-03-16: use smooth scrolling from J1
                                      // NOTE: scrolling (scrollSmooth) from tocbot DISABLED
                                      if (options.scrollToAnchor) {
                                        // Fix J1 Toccer headline issue #1
                                        // Because tocbot's own scrollSmooth is DISABLED
                                        // (`scrollSmooth: false`), tocbot's internal click
                                        // listener never calls disableTocAnimation(). The
                                        // highlighting therefore ran LIVE while
                                        // j1.scrollToAnchor() animated the page and walked
                                        // through intermediate sections. Freeze it for the
                                        // duration of the J1 scroll, like tocbot does for
                                        // its native smooth scroll.
                                        // NOTE: tocbot's internal click listener re-enables
                                        // highlighting on its own after scrollSmoothDuration;
                                        // the final resync below therefore always runs LAST
                                        // and settles the TOC at the real rest position.
                                        //
                                        if (window.tocbot && tocbot._buildHtml) {
                                          tocbot._buildHtml.disableTocAnimation(event);
                                        }
                                        setTimeout(() => {
                                          j1.scrollToAnchor(currentURL);
                                        }, options.scrollToAnchorDelay);
                                        // Fix J1 Toccer headline issue #1
                                        // Re-enable highlighting AFTER the J1 scroll has
                                        // finished (delay + animation + safety margin) and
                                        // force a final updateToc() run at the rest
                                        // position. With the corrected `headingsOffset`
                                        // this resync now selects the CLICKED headline.
                                        //
                                        var resyncDelay = options.scrollToAnchorDelay +
                                                          options.scrollSmoothDuration +
                                                          100;
                                        setTimeout(() => {
                                          if (window.tocbot && tocbot._buildHtml) {
                                            tocbot._buildHtml.enableTocAnimation();
                                            if (tocbot._scrollListener) {
                                              tocbot._scrollListener();
                                            }
                                          }
                                        }, resyncDelay);
                                      }
                                    }
          });
          /* eslint-enable */

          logger.debug('met dependencies for: loadHTML');
          clearInterval(dependencies_met_ajax_load_finished);
          // J1 Adapter optimizations #1
          // clear the safety timeout on the happy path
          //
          if (ajaxLoadTimeout) {
            clearTimeout(ajaxLoadTimeout);
            ajaxLoadTimeout = null;
          }
        } // END AJAX load finished
      }, 10); // END dependencies_met_ajax_load_finished

      // J1 Adapter optimizations #1
      // safety bound paired with the 10ms poller above
      //
      ajaxLoadTimeout = setTimeout(function () {
        if (dependencies_met_ajax_load_finished) {
          clearInterval(dependencies_met_ajax_load_finished);
          logger.warn('toccer initToccerCore aborted: #toc_mmenu not present within 30s');
        }
      }, 30000);

    }, // END initToccerCore

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