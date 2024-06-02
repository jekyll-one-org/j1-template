---
regenerate:                             true
---

{%- capture cache -%}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/adapter/js/toccer.js
 # Liquid template to adapt Tocbot Core functions
 #
 # Product/Info:
 # https://jekyll.one
 # https://tscanlin.github.io/tocbot
 #
 # Copyright (C) 2023, 2024 Juergen Adams
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
 # ~/assets/theme/j1/adapter/js/toccer.js
 # JS Adapter for J1 Toccer
 #
 # Product/Info:
 # https://jekyll.one
 # https://tscanlin.github.io/tocbot
 #
 # Copyright (C) 2023, 2024 Juergen Adams
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
'use strict';
j1.adapter.toccer = (() => {

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
      // _this.setState('started');
      // logger.debug('\n' + 'state: ' + _this.getState());
      // logger.info('\n' + 'module is being initialized');

      // -----------------------------------------------------------------------
      // module initializer
      // -----------------------------------------------------------------------
      var dependencies_met_toccer = setInterval (() => {
        var pageState      = $('#content').css("display");
        var pageVisible    = (pageState == 'block') ? true: false;
        var j1CoreFinished = (j1.getState() == 'finished') ? true : false;
        var toccerEnabled  = (j1.stringToBoolean(toccerOptions.toc)) ? true : false;

        if (toccerEnabled && j1CoreFinished && pageVisible) {
          startTimeModule = Date.now();

          _this.setState('started');
          logger.debug('\n' + 'state: ' + _this.getState());
          logger.info('\n' + 'module is being initialized');

          _this.initToccerCore(toccerOptions);

          // save config settings into the toccer object for later access
          _this['moduleOptions'] = toccerOptions;

          _this.setState('finished');
          logger.debug('\n' + 'state: ' + _this.getState());
          logger.info('\n' + 'initializing module finished');

          endTimeModule = Date.now();
          logger.info('\n' + 'module initializing time: ' + (endTimeModule-startTimeModule) + 'ms');

          clearInterval(dependencies_met_toccer);
        } // END
      }, 10); // END
    }, // END init

    // -------------------------------------------------------------------------
    // Initialize the toccer on page
    // -------------------------------------------------------------------------
    initToccerCore: (options) => {
      var scrollOffsetCorrection  = scrollerOptions.smoothscroll.offsetCorrection;
      var scrollOffset            = j1.getScrollOffset(scrollOffsetCorrection) + scrollOffsetCorrection;

      _this.setState('running');
      logger.debug('\n' + 'state: ' + _this.getState());

      // tocbot get fired if HTML portion is loaded (AJAX load finished)
      var dependencies_met_ajax_load_finished = setInterval (() => {
        var ajaxLoadFinished = ($('#toc_mmenu').length) ? true : false;

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
            hasInnerContainers:     false,
            includeHtml:            false,
            linkClass:              'toc-link',
            extraLinkClasses:       '',
            activeLinkClass:        'is-active-link',
            listClass:              'toc-list',
            extraListClasses:       '',
            isCollapsedClass:       'is-collapsed',
            collapsibleClass:       'is-collapsible',
            listItemClass:          'toc-list-item',
            positionFixedSelector:  '',
            positionFixedClass:     'is-position-fixed',
            fixedSidebarOffset:     'auto',
            scrollContainer:        null,
            scrollSmooth:           false,                                      // options.scrollSmooth,
            scrollSmoothDuration:   0,                                          // options.scrollSmoothDuration,
            scrollSmoothOffset:     0,                                          // scrollOffset,
            onClick:                (event) => {
                                      // jadams 2024-03-16: workaroud|browser's history
                                      var currentURL = event.currentTarget.href;
                                      // add current URL (anchor) to browser's history
                                      history.pushState(null, null, currentURL);

                                      // jadams 2024-03-16: use smooth scrolling from J1
                                      // NOTE: all scrolling functions from tocbot DISABLED
                                      setTimeout(() => {
                                        j1.scrollToAnchor(currentURL);
                                      }, 1500);
                                    },
            headingsOffset:         1,
            throttleTimeout:        options.throttleTimeout
          });
          /* eslint-enable */

          logger.debug('\n' + 'met dependencies for: loadHTML');
          clearInterval(dependencies_met_ajax_load_finished);
        } // END AJAX load finished
      }, 10); // END dependencies_met_ajax_load_finished

    }, // END initToccerCore

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
