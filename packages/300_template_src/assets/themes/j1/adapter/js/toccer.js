---
regenerate:                             true
---

{% capture cache %}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/toccer.js
 # Liquid template to adapt Tocbot Core functions
 #
 # Product/Info:
 # https://jekyll.one
 # https://tscanlin.github.io/tocbot
 #
 # Copyright (C) 2021 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # For details, see https://jekyll.one
 # Tocbot is licensed under under the MIT License.
 # For details, see https://tscanlin.github.io/tocbot
 # -----------------------------------------------------------------------------
 # TODO:
 # 2019-03-10:  Old BS Affix code is to be removed
 # -----------------------------------------------------------------------------
 # TODO:
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
{% assign footer_config     = modules.j1_footer %}
{% assign footer_id         = modules.j1_footer.global.id %}

{% comment %} Set config options
-------------------------------------------------------------------------------- {% endcomment %}
{% assign toccer_options    = toccer_defaults | merge: toccer_settings %}

{% assign production = false %}
{% if environment == 'prod' or environment == 'production' %}
  {% assign production = true %}
{% endif %}

/*
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/toccer.js
 # JS Adapter for J1 Toccer
 #
 # Product/Info:
 # https://jekyll.one
 # https://tscanlin.github.io/tocbot
 #
 # Copyright (C) 2021 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # For details, see https://jekyll.one
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

{% comment %} Main
-------------------------------------------------------------------------------- {% endcomment %}
j1.adapter['toccer'] = (function () {

  {% comment %} Set global variables
  ------------------------------------------------------------------------------ {% endcomment %}
  var environment         = '{{environment}}';                                  // Set environment
  var moduleOptions       = {};
  var toccerOptions       = {};
  var frontmatterOptions  = {};
  var _this;
  var logger;
  var logText;

  // ---------------------------------------------------------------------------
  // helper functions
  // ---------------------------------------------------------------------------

  // ---------------------------------------------------------------------------
  // main object
  // ---------------------------------------------------------------------------
  return {

    // -------------------------------------------------------------------------
    // initializer
    // -------------------------------------------------------------------------
    init: function (options) {

      // -----------------------------------------------------------------------
      // globals
      // -----------------------------------------------------------------------
      _this   = j1.adapter.toccer;
      logger  = log4javascript.getLogger('j1.adapter.toccer');

      // initialize state flag
      _this.setState('started');
      logger.info('state: ' + _this.getState());
      logger.info('Module is being initialized');

      // create settings object from frontmatterOptions
      var frontmatterOptions = options != null ? $.extend({}, options) : {};

      // -----------------------------------------------------------------------
      // defaults
      // -----------------------------------------------------------------------
      var settings  = $.extend({
        module_name: 'j1.adapter.toccer',
        generated:   '{{site.time}}'
      }, options);

      // -----------------------------------------------------------------------
      // options loader
      // -----------------------------------------------------------------------
      /* eslint-disable */
      toccerOptions = $.extend({}, {{toccer_options | replace: 'nil', 'null' | replace: '=>', ':' }});

      // Load (individual) frontmatter options (currently NOT used)
      if (options != null) { frontmatterOptions = $.extend({}, options); }

      if (typeof frontmatterOptions !== 'undefined') {
        moduleOptions = j1.mergeData(frontmatterOptions, toccerOptions);
      }
      /* eslint-enable */

      // save config settings into the toccer object for global access
      _this['moduleOptions'] = moduleOptions;

      // cast text-based booleans
      var isToc = (moduleOptions.toc === 'true');
      var isComments = (moduleOptions.comments === 'true');

      if ( typeof moduleOptions.collapseDepth === 'undefined') {
        moduleOptions.collapseDepth = 3;
      }

      if (isToc) {
        var dependencies_met_navigator = setInterval(function() {
//        if ( j1.adapter.navigator.getState() == 'finished' ) {
          if ( j1.getState() == 'finished' ) {
            var settings = j1.adapter.toccer.moduleOptions;

            _this.initToccerCore(settings);
            _this.setState('finished');

            logger.info('state: ' + _this.getState());
            logger.info('module initialized successfully');
            logger.info('met dependencies for: j1');
            clearInterval(dependencies_met_navigator);
          }
        }, 25);
      }
    }, // END init

    // -------------------------------------------------------------------------
    // Set Toccer options
    // -------------------------------------------------------------------------
    initToccerCore: function (options) {
      var scrollOffset;

      if (options  !== undefined) {
        var settings = $.extend({}, options);
      } else {
        var settings = false;
      }

      // calculate offset for correct (smooth) scroll position
      //
      var $pagehead       = $('.attic');
      var $navbar         = $('nav.navbar');
      var $adblock        = $('#adblock');

      var navbarType      = $navbar.hasClass('navbar-fixed') ? 'fixed' : 'scrolled';
      var fontSize        = $('body').css('font-size').replace('px','');
      var start           = window.pageYOffset;

      var l               = parseInt(fontSize);

      var h               = $pagehead.length ? $pagehead.height() : 0;
      var n               = $navbar.length ? $navbar.height() : 0;
      var a               = $adblock.length ? $adblock.height() : 0;

      scrollOffset        = navbarType == 'fixed' ? -1*(n + a + l) : -1*(h + n + a + l);

      // static offset, to be checked why this is needed
      //
      scrollOffset        = scrollOffset + moduleOptions.scrollSmoothOffset

      _this.setState('running');
      logger.info('state: ' + _this.getState());

      // tocbot get fired if HTML portion is loaded (AJAX load finished)
      //
      var dependencies_met_ajax_load_finished = setInterval (function () {
        if ($('#toc_mmenu').length) {
          /* eslint-disable */
          tocbot.init({
            log:                    moduleOptions.log,
            activeLinkColor:        moduleOptions.activeLinkColor,
            tocSelector:            moduleOptions.tocSelector,
            headingSelector:        moduleOptions.headingSelector,
            ignoreSelector:         moduleOptions.ignoreSelector,
            contentSelector:        moduleOptions.contentSelector,
            collapseDepth:          moduleOptions.collapseDepth,
            throttleTimeout:        moduleOptions.throttleTimeout,
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
            scrollSmooth:           moduleOptions.scrollSmooth,
            scrollSmoothDuration:   moduleOptions.scrollSmoothDuration,
            scrollSmoothOffset:     scrollOffset,
            headingsOffset:         1,
            throttleTimeout:        moduleOptions.throttleTimeout
          });
          /* eslint-enable */
          logger.info('met dependencies for: xhrData');
          clearInterval(dependencies_met_ajax_load_finished);
        } // END AJAX load finished
      }, 25); // END dependencies_met_ajax_load_finished

      $(window).on('resize', function() {
        var scrollOffset;
        // re-calculate offset for correct (smooth) scroll position
        //
        var $pagehead       = $('.attic');
        var $navbar         = $('nav.navbar');
        var $adblock        = $('#adblock');

        var navbarType      = $navbar.hasClass('navbar-fixed') ? 'fixed' : 'scrolled';
        var fontSize        = $('body').css('font-size').replace('px','');
        var start           = window.pageYOffset;

        var l               = parseInt(fontSize);

        var h               = $pagehead.length ? $pagehead.height() : 0;
        var n               = $navbar.length ? $navbar.height() : 0;
        var a               = $adblock.length ? $adblock.height() : 0;

        scrollOffset        = navbarType == 'fixed' ? -1*(n + a + l) : -1*(h + n + a + l);

        // static offset, to be checked why this is needed
        scrollOffset        = scrollOffset + moduleOptions.scrollSmoothOffset

        tocbot.refresh({
          log:                    moduleOptions.log,
          activeLinkColor:        moduleOptions.activeLinkColor,
          tocSelector:            moduleOptions.tocSelector,
          headingSelector:        moduleOptions.headingSelector,
          ignoreSelector:         moduleOptions.ignoreSelector,
          contentSelector:        moduleOptions.contentSelector,
          collapseDepth:          moduleOptions.collapseDepth,
          throttleTimeout:        moduleOptions.throttleTimeout,
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
          scrollSmooth:           moduleOptions.scrollSmooth,
          scrollSmoothDuration:   moduleOptions.scrollSmoothDuration,
          scrollSmoothOffset:     scrollOffset,
          headingsOffset:         1,
          throttleTimeout:        moduleOptions.throttleTimeout
        });
      });
    }, // END initToccerCore

    // -------------------------------------------------------------------------
    // messageHandler: MessageHandler for J1 NAV module
    // Manage messages (paylods) send from other J1 modules
    // -------------------------------------------------------------------------
    messageHandler: function (sender, message) {
      var json_message = JSON.stringify(message, undefined, 2);

      logText = 'received message from ' + sender + ': ' + json_message;
      logger.debug(logText);

      // -----------------------------------------------------------------------
      //  Process commands|actions
      // -----------------------------------------------------------------------
      if (message.type === 'command' && message.action === 'module_initialized') {
        //
        // Place handling of command|action here
        //
        logger.info(message.text);
      }

      //
      // Place handling of other command|action here
      //

      return true;
    }, // END messageHandler

    // -------------------------------------------------------------------------
    // setState()
    // Sets the current (processing) state of the module
    // -------------------------------------------------------------------------
    setState: function (stat) {
      _this.state = stat;
    }, // END setState

    // -------------------------------------------------------------------------
    // getState()
    // Returns the current (processing) state of the module
    // -------------------------------------------------------------------------
    getState: function () {
      return _this.state;
    } // END getState

  }; // END return
})(j1, window);

{% endcapture %}
{% if production %}
  {{ cache | minifyJS }}
{% else %}
  {{ cache | strip_empty_lines }}
{% endif %}
{% assign cache = nil %}
