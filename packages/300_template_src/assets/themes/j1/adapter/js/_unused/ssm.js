---
regenerate:                             true
---

{% capture cache %}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/ssm.js
 # Liquid template to adapt SSM Core functions
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2021 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # For details, see https://jekyll.one
 # -----------------------------------------------------------------------------
 # Test data:
 #  {{ liquid_var | debug }}
 # -----------------------------------------------------------------------------
 # NOTE:
 #  jadams, 2020-07-17:
 #    J1 SSM can't be minfied for now. Uglifier fails on an ES6 (most probably)
 #    structure that couldn't fixed by 'harmony' setting. Minifier fails by:
 #    Unexpected token: punc ())
 #    Current, minifying has been disabled
 # -----------------------------------------------------------------------------
{% endcomment %}

{% comment %} Liquid var initialization
-------------------------------------------------------------------------------- {% endcomment %}

{% comment %} Set config files
-------------------------------------------------------------------------------- {% endcomment %}
{% assign environment     = site.environment %}
{% assign template_config = site.data.j1_config %}
{% assign modules         = site.data.modules %}

{% comment %} Set config data
-------------------------------------------------------------------------------- {% endcomment %}
{% assign toccer_defaults = modules.defaults.toccer.defaults %}
{% assign toccer_settings = modules.toccer.settings %}
{% assign ssm_settings    = modules.ssm.settings %}
{% assign ssm_defaults    = modules.defaults.ssm.defaults %}

{% comment %} Set config options
-------------------------------------------------------------------------------- {% endcomment %}
{% assign toccer_options  = toccer_defaults | merge: toccer_settings %}
{% assign ssm_options     = ssm_defaults | merge: ssm_settings %}

{% assign production = false %}
{% if environment == 'prod' or environment == 'production' %}
  {% assign production = true %}
{% endif %}

/*
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/ssm.js
 # JS Adapter for J1 SSM (Sticky Side Menu)
 #
 # Product/Info:
 # {{site.data.j1_config.theme_author_url}}
 #
 # Copyright (C) 2021 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # For details, see {{site.data.j1_config.theme_author_url}}
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

j1.adapter['ssm'] = (function (j1, window) {
  // ---------------------------------------------------------------------------
  // globals
  // ---------------------------------------------------------------------------
  var isMobile      = j1.core.isMobile();
  var environment   = '{{environment}}';
  var dclFinished   = false;
  var moduleOptions = {};
  var cookie_names  = j1.getCookieNames();
  var user_state;
  var user_session;
  var user_data;
  var sect1Nodes;
  var sect12Nodes;
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
    // module initializer
    // -------------------------------------------------------------------------
    init: function (options) {

      // -----------------------------------------------------------------------
      // globals
      // -----------------------------------------------------------------------
      _this         = j1.adapter.ssm;
      logger        = log4javascript.getLogger('j1.adapter.ssm');
      sect12Nodes   = $('[class$="sect1"],[class$="sect2"');
      sect1Nodes    = $('[class$="sect1"]');

      // initialize state flag
      _this.setState('started');
      logger.info('set module state to: ' + _this.getState());
      logger.info('module is being initialized');

      // create settings object from frontmatterOptions
      var frontmatterOptions = options != null ? $.extend({}, options) : {};

      // -----------------------------------------------------------------------
      // defaults
      // -----------------------------------------------------------------------
      var settings  = $.extend({
        module_name: 'j1.adapter.ssm',
        generated:   '{{site.time}}'
      }, options);

      // -----------------------------------------------------------------------
      // options loader
      // -----------------------------------------------------------------------
      /* eslint-disable */
      var ssmMenuOptions = $.extend({}, {{nav_ssm_options | replace: '=>', ':' }});
      var ssmOptions = $.extend({}, {{ssm_options | replace: 'nil', 'null' | replace: '=>', ':' }});
      /* eslint-enable */
      var xhr_data_path;
      var menu_id;

      // Load (individual) frontmatter options (currently NOT used)
      //
      if (options != null) { var frontmatterOptions = $.extend({}, options); }

      if (typeof frontmatterOptions !== 'undefined') {
        moduleOptions = j1.mergeData(ssmOptions, frontmatterOptions);
      }

      // save config settings into the mmenu object for global access
      //
      _this['moduleOptions'] = moduleOptions;

      var dependencies_met_navigator = setInterval(function() {
        if (j1.adapter.navigator.getState() == 'finished') {
          logger.info('met dependencies for: navigator');
          _this.ssmLoader(moduleOptions);
          clearInterval(dependencies_met_navigator);
        }
      }, 25);
    }, // END init

    // -------------------------------------------------------------------------
    // SSM Loader
    // -------------------------------------------------------------------------
    ssmLoader: function (ssmOptions) {
      var menu_id;
      var xhr_data_path;

      // cast text-based booleans
      var isToc = (ssmOptions.toc === 'true');

      _this.setState('loading');
      logger.info('set module state to: ' + _this.getState());
      logger.info('load HTML data for ssm');

      {% assign id_list = "" %}

      j1.xhrData ({
        xhr_container_id: '{{ssm_options.xhr_container_id}}',
        xhr_data_path:    '{{ssm_options.xhr_data_path}}' },
        'j1.adapter.ssm',
        'data_loaded'
      );

      // ---------------------------------------------------------------------
      // Initialize MMenu Navs and Drawers
      // ---------------------------------------------------------------------
      var dependencies_met_mmenu_initialized = setInterval (function () {
        if (j1.xhrDOMState['#{{ssm_options.xhr_container_id}}'] == 'success') {
          _this.setState('loaded');
          logger.info('set module state to: ' + _this.getState());
          logger.info('HTML data for ssm: ' + _this.getState());
          j1.core.ssm.init (moduleOptions);
          if(isToc) {
            logger.info('found toc in page: enabled');
            if ( j1.adapter.toccer.getState() == 'finished' ) {
              logger.info('met dependencies for: toccer');
              _this.setState('processing');
              logger.info('set module state to: ' + _this.getState());
              logger.info('initialize ssm menu');
              ssmOptions.mode === 'icon'
                ? logger.info('ssm mode detected: icon')
                : logger.info('ssm mode detected: menu');
              _this.scrollSpy(ssmOptions);
              _this.buttonInitializer(ssmOptions);

              _this.setState('finished');
              logger.info('state: ' + _this.getState());
              logger.info('module initialized successfully');
              logger.info('met dependencies for: xhrData');
              clearInterval(dependencies_met_mmenu_initialized);
            }
          } else {
            logger.info('found toc in page: disabled');
            logger.info('disable toc menu and prev|next section buttons');
            $('#ssm_toc').closest('.ssm-btn').hide();
            $('#ssm_previous_section').closest('.ssm-btn').hide();
            $('#ssm_next_section').closest('.ssm-btn').hide();
            _this.scrollSpy(ssmOptions);
            _this.buttonInitializer(ssmOptions);
            logger.info('met dependencies for: xhrData');
            clearInterval(dependencies_met_mmenu_initialized);
          }
        }
      }, 25); // END dependencies_met_mmenu_initialized
    }, // END dataLoader

    // -------------------------------------------------------------------------
    // Button Initializer
    // -------------------------------------------------------------------------
    buttonInitializer: function (ssmOptions) {
      var eventHandler;

      {% for item in ssm_options.items %} {% if item.enabled %}

      {% comment %} Identify the menu (item) type
      -------------------------------------------------------------------------- {% endcomment %}
      {% if item.sublevel %}
        {% assign menu_type = 'sublevel_menu' %}
      {% else %}
        {% assign menu_type = 'top_level_item' %}
      {% endif %}

      {% if menu_type ==  'top_level_item' %}
      {% assign button_id = item.id %}

      // Create an eventhandler instance if id exists: {{button_id}}
      if ($('#{{button_id}}').length) {
        eventHandler = '{{item.event_handler}}';
        // check if eventhandler configured is a SINGLE word
        if (eventHandler.split(' ').length == 1) {
          logger.info('register pre-configured eventhandler {{item.event_handler}} on id: {{button_id}}');
          $('#{{button_id}}').each(function(e) {
            var $this = $(this);
            $this.on('click', function(e) {
              _this.{{item.event_handler}}(sect1Nodes);
            });
          });
        } else {
          logger.info('register custom eventhandler on id: {{button_id}}');
        }
      } else {
        alert ('Creating Eventhandler failed on: #{{button_id}}');
      } // END items (buttons)
      {% endif %} // menu_type 'top_level_item'
      {% endif %} // ENDIF button_id enabled
      {% endfor %} // ENDFOR items
    }, // END buttonInitializer

    // -------------------------------------------------------------------------
    // Eventhandler

    // -------------------------------------------------------------------------
    // open mobile menu
    // -------------------------------------------------------------------------
    open_ssm_toc: function () {
    }, // END open_ssm_toc

    // -------------------------------------------------------------------------
    // reload page
    // -------------------------------------------------------------------------
    reload_page: function () {
      // reload current page (skip cache)
      location.reload(true);
    }, // END open_ssm_toc
    // -------------------------------------------------------------------------
    // scroll to previous section
    // -------------------------------------------------------------------------
    scroll_previous_section: function (nodes) {
      var previous_header_id;
      var currentNode;
      var prev_node;
      var anchor_id;

      var index             = 0;
      var maxNode           = $(nodes).length - 1;
      var $toc              = $('#sidebar');
      var current_header_id = $toc.find('.is-active-link').attr('href');
      var scrollDuration    = {{toccer_options.scrollSmoothDuration}};
      var scrollOffset      = {{toccer_options.scrollSmoothOffset}};

      // Correction if mobile (offset: desktop -90px, mobile -80px)
      scrollOffset          = j1.core.isMobile() ? scrollOffset + 10 : scrollOffset;

      nodes.each(function () {
        currentNode = $(this).find(current_header_id);
        if (currentNode.length) {
          if (index > maxNode) {
            return false;
          } else {
            prev_node           = (index > 0) ? nodes[index-1] : nodes[index];
            previous_header_id  = $(prev_node).find(':header').first()[0].id;
            anchor_id           = '#' + previous_header_id;

            $('a[href*="' + current_header_id + '"]').removeClass('is-active-link');
            $('a[href*="' + previous_header_id + '"]').addClass('is-active-link');

            j1.core.scrollSmooth.scroll( anchor_id, {
              duration: scrollDuration,
              offset: scrollOffset,
              callback: null
            });
          }
        }
        (index < maxNode) ? index++ : index;
      });
    }, // END scroll_previous_section

    // -------------------------------------------------------------------------
    // scroll to next section
    // -------------------------------------------------------------------------
    scroll_next_section: function (nodes) {
      var next_header_id;
      var currentNode;
      var nextNode;
      var anchor_id;

      var index             = 0;
      var maxNode           = $(nodes).length -1;
      var $toc              = $('#sidebar');
      var current_header_id = $toc.find('.is-active-link').attr('href');
      var scrollDuration    = {{toccer_options.scrollSmoothDuration}};
      var scrollOffset      = {{toccer_options.scrollSmoothOffset}};

      // Correction if mobile (offset: desktop -90px, mobile -80px)
      scrollOffset          = j1.core.isMobile() ? scrollOffset + 10 : scrollOffset;

      nodes.each(function () {
        currentNode = $(this).find(current_header_id);
        if (currentNode.length) {
          if (index == maxNode) {
            return false;
          } else {
            nextNode = nodes[index+1];
            next_header_id  = $(nextNode).find(':header').first()[0].id;
            anchor_id       = '#' + next_header_id;

            $('a[href*="' + current_header_id + '"]').removeClass('is-active-link');
            $('a[href*="' + next_header_id + '"]').addClass('is-active-link');

            j1.core.scrollSmooth.scroll( anchor_id, {
              duration: scrollDuration,
              offset: scrollOffset,
              callback: null
            });
          }
        }
        index < maxNode ? index++ : index;
      });
    }, // END scroll_next_section

    // -------------------------------------------------------------------------
    // scroll to top
    // -------------------------------------------------------------------------
    scroll_to_top: function () {
      var dest = 0;

      $('html, body').animate({
        scrollTop: dest
      }, 500);
    }, // END scroll_top

    // -------------------------------------------------------------------------
    // scroll to bottom
    // -------------------------------------------------------------------------
    scroll_to_bottom: function () {
      var $page           = $(document);
      var $footer         = $('#j1_footer');
      var f               = $footer.length ? $footer.outerHeight() : 0;
      var pageHeight      = $page.height() - f - 400;
      var pageHeightOuter = $page.outerHeight();

      $('html, body').animate({
        scrollTop: pageHeight
      }, 500);
    }, // END scroll_bottom

    // -------------------------------------------------------------------------
    // scroll to comments (Disqus)
    // -------------------------------------------------------------------------
    scroll_to_comments: function () {
    }, // END scroll_comments

    // -------------------------------------------------------------------------
    // create generic alert
    // -------------------------------------------------------------------------
    alert_me: function () {
      alert ('Hello world!');
    }, // END alert_me

    // -------------------------------------------------------------------------
    // messageHandler
    // Manage messages (paylods) send from other J1 modules
    // -------------------------------------------------------------------------
    messageHandler: function (sender, message) {
      // var json_message = JSON.stringify(message, undefined, 2);              // multiline
      var json_message = JSON.stringify(message);

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
      if (message.type === 'command' && message.action === 'status') {
        logger.info('messageHandler: received - ' + message.action);
      }

      //
      // Place handling of other command|action here
      //

      return true;
    }, // END messageHandler

    // -------------------------------------------------------------------------
    // Manage (top) position and sizes (@media breakpoints) of the
    // SSM container depending on the size of the page header (attic)
    // -------------------------------------------------------------------------
    scrollSpy: function (options) {
      logger = log4javascript.getLogger('j1.adapter.ssm.scrollSpy');

      $(window).scroll(function(event){
        var $navbar         = $('nav.navbar');
        var $pagehead       = $('.attic');
        var $main_content   = $('.js-toc-content');
        var $adblock        = $('#adblock');
        var $footer         = $('#j1_footer');
        var $ssmContainer   = $('#ssm-container');
        var $page           = $(document);
        var offset          = 0;
        var pageOffset      = $(document).width() >= 992 ? -120 : -116;
        var scrollPos       = $(document).scrollTop();
        var pageHeight      = $page.height();
        var pageHeightOuter = $page.outerHeight();

        var m               = $main_content.offset().top;
        var s               = $ssmContainer.length ? $ssmContainer.height() : 0;
        var f               = $footer.length   ? $footer.outerHeight() : 0;
        var n               = $navbar.length   ? $navbar.height() : 0;
//      var h               = $pagehead.length ? $pagehead.outerHeight() : 0;
        var a               = $adblock.length  ? $adblock.outerHeight() : 0;
        var o               = n + offset;

        // space above the (fixed) ssm container
        var showSsmPos      = m + pageOffset;

        // space below the (fixed) ssm container
        var hideSsmPos      = pageHeight - s - f + pageOffset;

        // set the top position of ssm container for navbar modes
        // e.g. "sticky" (navbar-fixed)
        if($navbar.hasClass('navbar-fixed')){
          $('#ssm-container').css('top', o);
        } else {
          $('#ssm-container').css('top', m);
        }

        // show|hide ssm container on scroll position in page
        //
        scrollPos >= showSsmPos && scrollPos <= hideSsmPos
          ? $ssmContainer.css('display','block')
          : $ssmContainer.css('display','none');

        // logger.debug('content pos detected as: ' + m + 'px');
        // logger.debug('scroll pos detected as: ' + scrollPos + 'px');
      }); // END setTop on scroll

    }, // END scrollSpy

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

{% comment %} process adapter COMPRESSED for production DISABLED
NOTE: for unknown reason, minifyJS detect JS/ES6 code
      SyntaxError: Unexpected token: punc ())
--------------------------------------------------------------------------------
{% assign production = true %}
{% endcapture %}
{% if production %}
  {{ cache | minifyJS }}
{% else %}
  {{ cache | strip_empty_lines }}
{% endif %}
{% assign cache = nil %}
-------------------------------------------------------------------------------- {% endcomment %}

{% comment %} process adapter UNCOMPRESSED
-------------------------------------------------------------------------------- {% endcomment %}
{% endcapture %}
{{ cache | strip_empty_lines }}
{% assign cache = nil %}
