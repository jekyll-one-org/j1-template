---
regenerate:                             true
---

{%- capture cache -%}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/fab.js
 # Liquid template to adapt FAB Core functions
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2023, 2024 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # For details, see: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 # -----------------------------------------------------------------------------
 # Test data:
 #  {{ liquid_var | debug }}
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
{% assign fab_settings    = modules.fab.settings %}
{% assign fab_defaults    = modules.defaults.fab.defaults %}

{% comment %} Set config options
-------------------------------------------------------------------------------- {% endcomment %}
{% assign toccer_options  = toccer_defaults | merge: toccer_settings %}
{% assign fab_options     = fab_defaults | merge: fab_settings %}

{% comment %} Detect prod mode
-------------------------------------------------------------------------------- {% endcomment %}
{% assign production = false %}
{% if environment == 'prod' or environment == 'production' %}
  {% assign production = true %}
{% endif %}

/*
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/fab.js
 # JS Adapter for J1 FABs (Floating Action Buttons)
 #
 # Product/Info:
 # http://jekyll.one
 #
 # Copyright (C) 2023, 2024 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # For details, see http://jekyll.one
 # -----------------------------------------------------------------------------
 # TODO: check why 'found toc in page: disabled' detected (some times)
 #       if a toc IS configured
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
j1.adapter.fab = ((j1, window) => {

  // ---------------------------------------------------------------------------
  // global variable settings
  // ---------------------------------------------------------------------------
  var isMobile          = j1.core.isMobile();
  var environment       = '{{environment}}';
  var dclFinished       = false;
  var moduleOptions     = {};
  var cookie_names      = j1.getCookieNames();
  var state             = 'not_started';

  var fabDefaults;
  var fabSettings;
  var fabOptions;
  var frontmatterOptions;
  var user_state;
  var user_session;
  var user_data;
  var sect1Nodes;
  var sect3Nodes;
  var sect12Nodes;
  var sect123Nodes;

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
      var settings  = $.extend({
        module_name: 'j1.adapter.fab',
        generated:   '{{site.time}}'
      }, options);

      // -----------------------------------------------------------------------
      // global variable settings
      // -----------------------------------------------------------------------
      _this        = j1.adapter.fab;
      logger       = log4javascript.getLogger('j1.adapter.fab');
      sect123Nodes = $('[class$="sect1"],[class$="sect2"],[class$="sect3"]');
      sect12Nodes  = $('[class$="sect1"],[class$="sect2"]');
      sect1Nodes   = $('[class$="sect1"]');

      // create settings object from frontmatter (page settings)
      frontmatterOptions  = options != null ? $.extend({}, options) : {};

      // Load  module DEFAULTS|CONFIG
      fabDefaults = $.extend({}, {{fab_defaults | replace: 'nil', 'null' | replace: '=>', ':' }});
      fabSettings = $.extend({}, {{fab_settings | replace: 'nil', 'null' | replace: '=>', ':' }});
      fabOptions  = $.extend(true, {}, fabDefaults, fabSettings, frontmatterOptions);

      // save config settings into the FAB object for global access
      _this['moduleOptions'] = fabOptions;

      // -----------------------------------------------------------------------
      // module initializer
      // -----------------------------------------------------------------------
      var dependency_met_page_ready = setInterval(() => {
        var pageState      = $('#content').css("display");
        var pageVisible    = (pageState === 'block') ? true : false;
        var j1CoreFinished = (j1.getState() === 'finished') ? true : false;
        var atticFinished  = (j1.adapter.attic.getState() === 'finished') ? true: false;

        if (pageVisible && j1CoreFinished && atticFinished) {
          startTimeModule = Date.now();

          _this.setState('started');
          logger.info('\n' + 'set module state to: ' + _this.getState());
          logger.info('\n' + 'module is being initialized');

          logger.info('\n' + 'load FABs');
          _this.fabLoader(fabOptions);

          clearInterval(dependency_met_page_ready);
        } // END pageVisible
      }, 10); // END dependency_met_page_ready
    }, // END init

    // -------------------------------------------------------------------------
    // FAB Loader
    // -------------------------------------------------------------------------
    fabLoader: (fabOptions) => {

      _this.setState('loading');
      logger.info('\n' + 'set module state to: ' + _this.getState());
      logger.info('\n' + 'load HTML data for FAB: ' + fabOptions.fab_menu_id);

      j1.loadHTML({
        xhr_container_id: fabOptions.xhr_container_id,
        xhr_data_path:    fabOptions.xhr_data_path,
        xhr_data_element: fabOptions.fab_menu_id
        },
        'j1.adapter.fab',
        'data_loaded'
      );

      // ---------------------------------------------------------------------
      // Initialize FAB button
      // ---------------------------------------------------------------------
      var dependencies_met_fab_initialized = setInterval (() => {
        var fabLoaded = (j1.xhrDOMState['#' + fabOptions.xhr_container_id] === 'success') ? true: false;

        if (fabLoaded) {
          _this.setState('loaded');
          logger.info('\n' + 'set module state to: ' + _this.getState());
          logger.info('\n' + 'HTML data for FAB: ' + _this.getState());

          _this.buttonInitializer(fabOptions);
          $('.fab-btn').show();

          _this.setState('finished');
          logger.debug('\n' + 'state: ' + _this.getState());
          logger.info('\n' + 'module initialized successfully');

          endTimeModule = Date.now();
          logger.info('\n' + 'module initializing time: ' + (endTimeModule-startTimeModule) + 'ms');

          clearInterval(dependencies_met_fab_initialized);
        } // END if fabLoaded
      }, 10); // END dependencies_met_fab_initialized
    }, // END fabLoader

    // -------------------------------------------------------------------------
    // buttonInitializer()
    // -------------------------------------------------------------------------
    buttonInitializer: (fabOptions) => {
      var $fabContainer         = $('#' + fabOptions.xhr_container_id);
      var iconFamily            = fabOptions.icon_family.toLowerCase();
      var floatingActionOptions = fabOptions.menu_options;
      var fabButtons            = document.querySelectorAll('.fab-btn');
      var eventHandler;
      var actionMenuId;
      var actionMenuOptions;
      var actionButtonId;
      var instances;
      var $actionButton;
      var toggleIcons;
      var fabActions;

      // check if multiple buttons detected
      if (fabButtons.length === 1) {
        _this.setState('processing');
        logger.info('\n' + 'set module state to: ' + _this.getState());
        logger.info('\n' + 'initialize FAB menu');

        actionButtonId  = fabButtons[0].firstElementChild.id;
        actionMenuId    = actionButtonId.replace('_button', '');
        instances       = j1.fab.init(fabButtons, floatingActionOptions);
        $actionButton   = $('#' + actionButtonId);

        fabOptions.menus.forEach((menu, index) => {
          if (menu.id === actionMenuId) {
            actionMenuOptions = fabOptions.menus[index];
          };
        });

        // count number of menu actions for the button. If only one action
        // found the FAB button gets created as a FAB (no menu) that has the
        // the action bound directly to the button
        //
        fabActions  = actionMenuOptions.items.length;
        toggleIcons = iconFamily + '-' + actionMenuOptions.icon + ' ' + iconFamily + '-' + actionMenuOptions.icon_hover;

        // toggle the icon for the FAB if configured
        if (floatingActionOptions.hoverEnabled) {
          $actionButton.hover(
            function () {
              $('#fab-icon').toggleClass(toggleIcons);
            }, function () {
              $('#fab-icon').toggleClass(toggleIcons);
            }
          );
        } else {
          $actionButton.on('click', (e) => {
            $('#fab-icon').toggleClass(toggleIcons);
          });
        }

        if (fabActions > 1) {
          actionMenuOptions.items.forEach((item, index) => {
            // Bind an eventhandler instance if item id exists
            if ($('#' + item.id).length) {
              eventHandler = item.event_handler;
              // check if eventhandler configured is a SINGLE word
              if (eventHandler.split(' ').length == 1) {
                logger.debug('\n' + 'register pre-configured eventhandler ' + eventHandler + ' on id: #' + item.id);

                if (eventHandler === 'open_mmenu_toc') {
                  if ($('#j1-toc-mgr').length) {
                    logger.info('\n' + 'found toc in page: enabled');
                    var dependencies_met_toccer_finished = setInterval (() => {
                      if (j1.adapter.toccer.getState() == 'finished') {
                        logger.debug('\n' + 'met dependencies for: toccer');

                        $('#open_mmenu_toc').show();
                        clearInterval(dependencies_met_toccer_finished);
                      }
                    }, 10); // END dependencies_met_toccer_finished
                  } else {
                    logger.info('\n' + 'found toc in page: disabled');
                  }
                } else {
                  $('#' + item.id).show();
                } // END eventHandler 'open_mmenu_toc'

                $('#' + item.id).each(function (e) {
                  var $this = $(this);
                  $this.on('click', function (e) {
                  _this[item.event_handler](sect123Nodes);
                  });
                });
              } else {
                logger.info('\n' + 'register custom eventhandler on id: #' + item.id);
              }
            } else {
              logger.error('\n' + 'creating Eventhandler failed on id: #' + item.id);
            } // END if items (action buttons)
          });
        } else {
          // single action, create FAB
          logger.info('\n' + 'single action found for FAB, no menu loaded/created');

          // disable hover event (CSS)
          // $actionButton.css({'pointer-events': 'none'})

          actionMenuOptions.items.forEach((item, index) => {
            eventHandler = item.event_handler;
            // check if eventhandler configured is a SINGLE word
            if (eventHandler.split(' ').length === 1) {
              logger.debug('\n' + 'register pre-configured eventhandler ' +eventHandler+ ' on id: #' + actionButtonId);

              if (eventHandler === 'scroll_to_top') {
                // register click event
                $actionButton.on('click', function (e) {
                  var dest = 0;
                  $('html, body').animate({
                    scrollTop: dest
                  }, 500);
                });
              } // END if eventHandler == scroll_to_top

              if ( eventHandler === 'open_mmenu_toc' ) {
                // check if toccer (toc_mgr) is available
                if ($('#j1-toc-mgr').length) {
                  logger.info('\n' + 'found toc in page: enabled');
                  var dependencies_met_toccer_finished = setInterval (() => {
                    if (j1.adapter.toccer.getState() === 'finished') {
                      logger.debug('\n' + 'met dependencies for toccer: finished');

                      // change the id of the $actionButton to the already
                      // registered id by mmenu adapter of ('open_mmenu_toc')
                      // to open the TOC sidebar
                      //
                      $actionButton.prop('id', 'open_mmenu_toc');
                      clearInterval(dependencies_met_toccer_finished);
                    }
                  }, 10); // END dependencies_met_toccer_finished
                } else {
                  logger.info('\n' + 'found toc in page: disabled');
                  logger.info('\n' + 'eventhandler: disabled');
                }
              } // END if eventHandler == open_mmenu_toc
            }
          });
        } // END else
      } else {
        logger.error('\n' + 'multiple FAB buttons found: ' + fabButtons.length);
        logger.info('\n' + 'FAB container set to hidden: ' + $fabContainer);
        $fabContainer.hide();
      } // END if famButton
    }, // END buttonInitializer

    // -------------------------------------------------------------------------
    // event handler
    // -------------------------------------------------------------------------

    // -------------------------------------------------------------------------
    // open_mmenu_toc()
    // open TOC in mobile menu
    // -------------------------------------------------------------------------
    open_mmenu_toc: () => {
        // Event configured with Navigator module (navigator.yml)
        // with content section DRAWER TOC. Event registered at
        // runtime on element with id '#open_mmenu_toc' by Mobile Menu
        // module ADAPTER (mmenu.js)
        //
        // NOTE: no further handling needed for this event
    },  // END open_mmenu_toc

    // -------------------------------------------------------------------------
    // reload_page()
    // reload current page
    // -------------------------------------------------------------------------
    reload_page: () => {
      // reload current page (skip cache)
      location.reload(true);
    }, // END reload_page

    // -------------------------------------------------------------------------
    // scroll_previous_section()
    // scroll to previous section in page
    // -------------------------------------------------------------------------
    scroll_previous_section: (nodes) => {
      var previous_header_id;
      var currentNode;
      var prev_node;
      var anchor_id;
      var index                = 0;
      var maxNode              = $(nodes).length-1;
      var $toc                 = $('#sidebar');
      var current_header_id    = $toc.find('.is-active-link').attr('href');
      var toccerScrollDuration = {{toccer_options.scrollSmoothDuration}};
      var toccerScrollOffset   = {{toccer_options.scrollSmoothOffset}};

      // scroll offset correction if mobile or window width <= 992
      // For smaller window sizes, the height of the menubar changes.
      // if (j1.core.isMobile() || $(window).width() <= 992) { scrollOffset += 30; }
      // calculate offset for correct (smooth) scroll position.
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

      var scrollOffset    = navbarType == 'fixed' ? -1*(n + a + l) : -1*(h + n + a + l);

      // static offset, to be checked why this is needed
      //
      scrollOffset        = scrollOffset + toccerScrollOffset;

      nodes.each(() => {
        currentNode = $(this).find(current_header_id);
        if (currentNode.length) {
          if (index > maxNode) {
            return false;
          } else {
            prev_node           = (index > 0) ? nodes[index-1] : nodes[index];
            previous_header_id  = $(prev_node).find(':header').first()[0].id;
            anchor_id           = '#' + previous_header_id;

            j1.core.scrollSmooth.scroll( anchor_id, {
              duration: toccerScrollDuration,
              offset: scrollOffset,
              callback: null
            });
          }
        }
        (index < maxNode) ? index++ : index;
      });
    }, // END scroll_previous_section

    // -------------------------------------------------------------------------
    // scroll_next_section()
    // scroll to next section in page
    // -------------------------------------------------------------------------
    scroll_next_section: (nodes) => {
      var next_header_id;
      var next_header_plus_id;
      var currentNode;
      var current_header_id;
      var nextNode;
      var next_header_id;
      var next_anchor_id;
      var index                 = 0;
      var maxNode               = $(nodes).length-1;
      var $toc                  = $('#sidebar');
      var scrollDuration        = {{toccer_options.scrollSmoothDuration}};
      var toccerScrollDuration  = {{toccer_options.scrollSmoothDuration}};
      var toccerScrollOffset    = {{toccer_options.scrollSmoothOffset}};

      current_header_id = $toc.find('.is-active-link').attr('href');
      nodes.each(() => {
        currentNode = $(this).find(current_header_id);
        if (currentNode.length) {
          if (index == maxNode) {
            return false;
          } else {
            nextNode              = nodes[index+1];
            next_header_id        = $(nextNode).find(':header').first()[0].id;
            next_anchor_id        = '#' + next_header_id;

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

            var scrollOffset    = navbarType == 'fixed' ? -1*(n + a + l) : -1*(h + n + a + l);

            // static offset, to be checked why this is needed
            //
            scrollOffset        = scrollOffset + toccerScrollOffset;

            j1.core.scrollSmooth.scroll( next_anchor_id, {
              duration: toccerScrollDuration,
              offset: scrollOffset,
              callback: null
            });
          }
        }
        index < maxNode ? index++ : index;
      });
    }, // END scroll_next_section

    // -------------------------------------------------------------------------
    // scroll_to_top()
    // scroll to top of current pqge
    // -------------------------------------------------------------------------
    scroll_to_top: () => {
      var dest = 0;

      $('html, body').animate({
        scrollTop: dest
      }, 500);

      // tocbot.refresh();
    }, // END scroll_top

    // -------------------------------------------------------------------------
    // scroll_to_bottom()
    // scroll to bottom of current page
    // -------------------------------------------------------------------------
    scroll_to_bottom: () => {
      var $page           = $(document);
      var $footer         = $('#j1_footer');
      var f               = $footer.length ? $footer.outerHeight() : 0;
      var pageHeight      = $page.height() - f - 400;
      var pageHeightOuter = $page.outerHeight();

      $('html, body').animate({
        scrollTop: pageHeight
      }, 500);

      // tocbot.refresh();
    }, // END scroll_bottom

    // -------------------------------------------------------------------------
    // scroll_to_comments()
    // scroll to comments headline in current page (if comments enabled)
    // -------------------------------------------------------------------------
    scroll_to_comments: () => {
    }, // END scroll_comments

    // -------------------------------------------------------------------------
    // alert_me()
    // create generic alert
    // -------------------------------------------------------------------------
    alert_me: () => {
      alert ('Hello world!');
    }, // END alert_me

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
