---
regenerate:                             false
---

{% capture j1_cache %}

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
{% assign blocks            = site.data.blocks %}
{% assign modules           = site.data.modules %}

{% comment %} Set config data
-------------------------------------------------------------------------------- {% endcomment %}
{% assign toccer_defaults   = modules.defaults.toccer.defaults %}
{% assign toccer_settings   = modules.toccer.settings %}
{% assign footer_config     = modules.j1_footer %}
{% assign footer_id         = modules.j1_footer.global.id %}

{% comment %} Set config options
-------------------------------------------------------------------------------- {% endcomment %}
{% assign toccer_options    = toccer_defaults | merge: toccer_settings %}


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
'use strict';

{% comment %} Main
-------------------------------------------------------------------------------- {% endcomment %}
j1.adapter['toccer'] = (function () {

  {% comment %} Set global variables
  ------------------------------------------------------------------------------ {% endcomment %}
  var environment   = '{{environment}}'; // Set environment
  var moduleOptions = {};
  var _this;
  var logger;
  var logText;

  // ---------------------------------------------------------------------------
  // Helper functions
  // ---------------------------------------------------------------------------

  // ---------------------------------------------------------------------------
  // Main object
  // ---------------------------------------------------------------------------
  return {

    // -------------------------------------------------------------------------
    // Initializer
    // -------------------------------------------------------------------------
    init: function (options) {
      // initialize state flag
      j1.adapter.toccer.state = 'pending';

      {% comment %} Set global variables
      -------------------------------------------------------------------------- {% endcomment %}
      _this   = j1.adapter.toccer;
      logger  = log4javascript.getLogger('j1.adapter.toccer');

      _this.setState('started');
      logger.info('state: ' + _this.getState());
      logger.info('Module is being initialized');

      if (options  !== undefined) {
        var settings = $.extend({}, options);
      } else {
        var settings = false;
      }

      // cast text-based booleans
      var  isToc = (options.toc === 'true');
      var  isComments = (options.comments === 'true');

      if (typeof settings.collapseDepth === 'undefined') {
        settings.collapseDepth = {{toccer_options.collapseDepth}};
      }

      if (typeof settings.headingsOffset === 'undefined') {
        settings.scrollOffset = {{toccer_options.smoothScrollOffset}};
      } else {
        settings.scrollOffset = settings.headingsOffset
      }

      if (typeof settings.enabled === 'undefined') {
        settings.enabled = true;
      }

      if (isToc) {
        _this.initToccerCore(settings);
        _this.setCss();

        /* jadams, 2011-03-11: For now, no need to adjust the top sticky position */
        /* leave the code in for future use if needed */
        /* _this.setTop(); */

        // if comments enabled
        if (isToc && isComments) {
          logText = 'connector for disqus successfully initialized';
          logger.info(logText);

          // NOTE: BS or Tocbot Affix is not used anymore.
          // Replaced by CSS style "sticky"
          // j1.adapter.toccer.initAffix();
          // state = 'finished';
          // logger.info('state: ' + state); // Set|Log status
          // logger.info('module initialized successfully');

        } else {
          // if toc enabled only
          if (isToc) {
            // state = 'finished';
            // logger.info('state: ' + state); // Set|Log status
            // logger.info('module initialized successfully');
          }
        } // END if isComments (Disqus enabled)
      } // END if isToc

      _this.setState('finished');
      logger.info('state: ' + _this.getState());
      logger.info('module initialized successfully');

      return true;
    }, // END init

    // -------------------------------------------------------------------------
    // Set Toccer options
    // -------------------------------------------------------------------------
    initToccerCore: function (options) {

      if (options  !== undefined) {
        var settings = $.extend({}, options);
      } else {
        var settings = false;
      }

      _this.setState('running');
      logger.info('state: ' + _this.getState());

      // jadams, 2020-06-23: TODO, tocbot should be fired if page|mmenu
      //                     is ready
      //
      setTimeout (function () {
        var bg_primary = j1.getStyleValue('uno-primary', 'background-color');

        tocbot.init({
          log:                    {{ toccer_options.log | json }},
          activeLinkColor:        {{ toccer_options.activeLinkColor | json }},
          tocSelector:            {{ toccer_options.tocSelector | json }},
          headingSelector:        {{ toccer_options.headingSelector | json }},
          ignoreSelector:         {{ toccer_options.ignoreSelector | json }},
          contentSelector:        {{ toccer_options.contentSelector | json }},
          collapseDepth:          settings.collapseDepth,
          throttleTimeout:        {{ toccer_options.throttleTimeout | json }},
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
          smoothScroll:           {{ toccer_options.smoothScrollEnabled | json }},
          smoothScrollOffset:     {{ toccer_options.smoothScrollOffset | json }},
          smoothScrollDuration:   {{ toccer_options.smoothScrollDuration | json }},
          headingsOffset:         {{ toccer_options.headingsOffset | json }},
          throttleTimeout:        {{ toccer_options.throttleTimeout | json }}
        });

        if (tocbot.options.log == true) {
          // Writes all of the current option settings to JS console
          console.log(tocbot.options);
        }
      }, {{toccer_options.delay}});

      return true;
    }, // END initToccerCore

    // -------------------------------------------------------------------------
    // Calculate|Set Affix offset Top|Bottom of the Toccer menu
    // depending on the size of the page header (attic)
    // -------------------------------------------------------------------------
    initAffix: function () {
      var nav_bar         = $('nav.navbar');
      var side_bar        = $('#j1-sidebar');
      var header          = $('.attic');
//    var disqus_id       = $('#disqus');
      var disqus_id       = $('.bmd-layout-content');
      var disqus_thread   = $('#disqus_thread');
      var adblock         = $('#adblock');
      var footer          = '#' + '{{footer_id}}';
      var footer_id       = $(footer);
      var footer_offset   = 100;

      $(side_bar).affix({
        offset: {
          top: function() {
            var c = $(side_bar).offset().top;
            var a = adblock.length ? adblock.outerHeight() : 0;
            var e = $(nav_bar).height();
            var h = $(header).height();
            var z = c - e;
            return _this.top = z - a;
          },
          bottom: function () {
            /*  space below the affixed element */
            if (disqus_id.length) {
              return (_this.bottom = $(disqus_id).outerHeight(true) + $(footer_id).outerHeight(true) + footer_offset)
            } else {
              return (_this.bottom = $(footer_id).outerHeight(true) + footer_offset);
            }
          }
        }
      });

      return true;
    }, // END initAffix

    // -------------------------------------------------------------------------
    // Calculate|Set Top position of the Toccer menu
    // depending on the size of the page header (attic)
    // -------------------------------------------------------------------------
    setTop: function (options) {
      $(window).scroll(function(event){
        var navbar    = $('nav.navbar.navigator');
        var adblock   = $('#adblock');
        var pagehead  = $('.attic');
        var offset    = 0;
        var m         = parseInt(pagehead.css('margin-bottom'), 10);
        var n         = navbar.outerHeight();
        var a         = adblock.length ? adblock.outerHeight() : 0;
        // var o         = n + m + a + offset;
        var o         = n + m + offset;

        if(navbar.hasClass('navbar-fixed')){
          $('#j1-sidebar.affix').css('top', o);
        } else {
          $('#j1-sidebar.affix').css('top', m);
        }
      });

      return true;
    }, // END setTop

    // -------------------------------------------------------------------------
    // Set dynamic styles
    // -------------------------------------------------------------------------
    setCss: function () {

      var bg_primary  = j1.getStyleValue('uno-primary', 'background-color');
      $('head').append('<style>.is-active-link::before { background-color: ' +bg_primary+ ' !important; }</style>');

      return true;
    }, // END setCss

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
    //  Set the current (processing) state of the module
    // -------------------------------------------------------------------------
    setState: function (stat) {
      j1.adapter.toccer.state = stat;
    }, // END setState

    // -------------------------------------------------------------------------
    //  Returns the current (processing) state of the module
    // -------------------------------------------------------------------------
    getState: function () {
      return j1.adapter.toccer.state;
    } // END state

  }; // END return
})(j1, window);

{% endcapture %}
{{ j1_cache | strip_empty_lines }}
{% assign j1_cache = nil %}
