---
regenerate:                             true
---

{% capture cache %}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/fam.js
 # Liquid template to adapt FAM Core functions
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
 #    J1 FAM can't be minfied for now. Uglifier fails on an ES6 (most probably)
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
{% assign fam_settings    = modules.fam.settings %}
{% assign fam_defaults    = modules.defaults.fam.defaults %}

{% comment %} Set config options
-------------------------------------------------------------------------------- {% endcomment %}
{% assign toccer_options  = toccer_defaults | merge: toccer_settings %}
{% assign fam_options     = fam_defaults | merge: fam_settings %}

{% assign production = false %}
{% if environment == 'prod' or environment == 'production' %}
  {% assign production = true %}
{% endif %}


/*
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/fam.js
 # JS Adapter for J1 FAM (Floating Button Menu)
 #
 # Product/Info:
 # http://jekyll.one
 #
 # Copyright (C) 2021 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # For details, see http://jekyll.one
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

j1.adapter['fam'] = (function (j1, window) {
  // ---------------------------------------------------------------------------
  // globals
  // ---------------------------------------------------------------------------
  var isMobile      = j1.core.isMobile();
  var environment   = '{{environment}}';
  var dclFinished   = false;
  var moduleOptions = {};
  var cookie_names  = j1.getCookieNames();
  var famOptions;
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
      _this         = j1.adapter.fam;
      logger        = log4javascript.getLogger('j1.adapter.fam');
      sect123Nodes  = $('[class$="sect1"],[class$="sect2"],[class$="sect3"]');
      sect12Nodes   = $('[class$="sect1"],[class$="sect2"]');
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
        module_name: 'j1.adapter.fam',
        generated:   '{{site.time}}'
      }, options);

      // -----------------------------------------------------------------------
      // options loader
      // -----------------------------------------------------------------------
      /* eslint-disable */
      famOptions = $.extend({}, {{fam_options | replace: 'nil', 'null' | replace: '=>', ':' }});

      // Load (individual) frontmatter options (currently NOT used)
      if (options != null) { frontmatterOptions = $.extend({}, options); }

      if (typeof frontmatterOptions !== 'undefined') {
        moduleOptions = j1.mergeData(famOptions, frontmatterOptions);
      }
      /* eslint-enable */

      // save config settings into the fam object for global access
      //
      _this['moduleOptions'] = moduleOptions;

      var dependencies_met_navigator = setInterval(function() {
        if (j1.adapter.navigator.getState() == 'finished') {
          logger.info('met dependencies for: navigator');
          _this.famLoader(moduleOptions);
          clearInterval(dependencies_met_navigator);
        }
      }, 25);

    }, // END init

    // -------------------------------------------------------------------------
    // FAM Loader
    // -------------------------------------------------------------------------
    famLoader: function (famOptions) {

      _this.setState('loading');
      logger.info('set module state to: ' + _this.getState());
      logger.info('load HTML data for fam');

      j1.xhrData ({
        xhr_container_id: famOptions.xhr_container_id,
        xhr_data_path:    famOptions.xhr_data_path,
        xhr_data_element: famOptions.fam_menu_id },
        'j1.adapter.fam',
        'data_loaded'
      );

      // ---------------------------------------------------------------------
      // Initialize FAM button
      // ---------------------------------------------------------------------
      var dependencies_met_fam_initialized = setInterval (function () {
        if (j1.xhrDOMState['#' + famOptions.xhr_container_id] == 'success' && j1.getState() == 'finished') {
          _this.setState('loaded');
          logger.info('set module state to: ' + _this.getState());
          logger.info('HTML data for fam: ' + _this.getState());

//        _this.scrollSpy(famOptions);
          _this.buttonInitializer(famOptions);

          _this.setState('finished');
          logger.info('state: ' + _this.getState());
          logger.info('module initialized successfully');

          $('.fam-btn').show();

          clearInterval(dependencies_met_fam_initialized);
        }
      }, 25); // END dependencies_met_fam_initialized
    }, // END dataLoader

    // -------------------------------------------------------------------------
    // Button Initializer
    // -------------------------------------------------------------------------
    buttonInitializer: function (famOptions) {
      var eventHandler;
      var actionMenuId;
      var actionMenuOptions;
      var actionButtonId;
      var instances;
      var $actionButton;
      var toggleIcons;
      var famActions;
      var $famContainer         = $('#' + famOptions.xhr_container_id);
      var iconFamily            = famOptions.icon_family.toLowerCase();
      var floatingActionOptions = famOptions.menu_options;
      var famButtons            = document.querySelectorAll('.fam-btn');

      // bind click event to all links with "#void" to suppress default action
      // See: https://stackoverflow.com/questions/134845/which-href-value-should-i-use-for-javascript-links-or-javascriptvoid0
      //
      $('a[href="#void"]').click(function(e) {
        e.preventDefault ? e.preventDefault() : e.returnValue = false;
        logger.info('bound click event to "#void", suppress default action');
      });

      // check if multiple buttons detected
      if ( famButtons.length == 1 ) {
        _this.setState('processing');
        logger.info('set module state to: ' + _this.getState());
        logger.info('initialize fam menu');

        actionButtonId  = famButtons[0].firstElementChild.id;
        actionMenuId    = actionButtonId.replace('_button', '');
        instances       = j1.fam.init(famButtons, floatingActionOptions);
        $actionButton   = $('#' + actionButtonId);

        famOptions.menus.forEach(function (menu, index) {
          if (menu.id === actionMenuId) {
            actionMenuOptions = famOptions.menus[index];
          };
        });

        // count number of menu actions for the button. If only one action
        // found the FAM button gets created as a FAB (no menu) that has the
        // the action bound directly to the button
        //
        famActions = actionMenuOptions.items.length;
        toggleIcons = iconFamily + '-' + actionMenuOptions.icon + ' ' + iconFamily + '-' + actionMenuOptions.icon_hover;

        // toggle the icon for the FAB if configured
        if (floatingActionOptions.hoverEnabled) {
          $actionButton.hover(
            function() {
              $('#fam-icon').toggleClass(toggleIcons);
            }, function() {
              $('#fam-icon').toggleClass(toggleIcons);
            }
          );
        } else {
          $actionButton.on('click', function (e) {
            $('#fam-icon').toggleClass(toggleIcons);
          });
        }

        if (famActions > 1) {

          actionMenuOptions.items.forEach(function (item, index) {
            // Bind an eventhandler instance if item id exists
            if ($('#' + item.id).length) {
              eventHandler = item.event_handler;
              // check if eventhandler configured is a SINGLE word
              if (eventHandler.split(' ').length == 1) {
                logger.info('register pre-configured eventhandler ' +eventHandler+ ' on id: #' + item.id);

                if ( eventHandler === 'open_mmenu_toc' ) {
                  if ($('#j1-toc-mgr').length) {
                    logger.info('found toc in page: enabled');
                    var dependencies_met_toccer_finished = setInterval (function () {
                      if ( j1.adapter.toccer.getState() == 'finished' ) {
                        logger.info('met dependencies for: toccer');

                        // famOptions.mode === 'icon'
                        //   ? logger.info('fam mode detected: icon')
                        //   : logger.info('fam mode detected: menu');

                        $('#open_mmenu_toc').show();
                        clearInterval(dependencies_met_toccer_finished);
                      }
                    }, 25); // END dependencies_met_toccer_finished
                  } else {
                    logger.info('found toc in page: disabled');
                  }
                } else {
                  $('#' + item.id).show();
                } // END eventHandler 'open_mmenu_toc'

                $('#' + item.id).each(function(e) {
                  var $this = $(this);
                  $this.on('click', function(e) {
                  _this[item.event_handler](sect123Nodes);
  //              _this[item.event_handler](sect12Nodes);
                  });
                });
              } else {
                logger.info('register custom eventhandler on id: #' + item.id);
              }
            } else {
  //          alert ('Creating Eventhandler failed on id: #' + item.id);
              logger.error('Creating Eventhandler failed on id: #' + item.id);
            } // END if items (action buttons)
          });
        } else {
          // single action, create FAB
          logger.info('single action found for FAM, create: FAB');

          // disable hover event (CSS)
          // $actionButton.css({'pointer-events': 'none'})

          actionMenuOptions.items.forEach(function (item, index) {
            eventHandler = item.event_handler;
            // check if eventhandler configured is a SINGLE word
            if (eventHandler.split(' ').length == 1) {
              logger.info('register pre-configured eventhandler ' +eventHandler+ ' on id: #' + actionButtonId);

              if (eventHandler === 'scroll_to_top') {
                // register click event
                $actionButton.on('click', function(e) {
                  var dest = 0;
                  $('html, body').animate({
                    scrollTop: dest
                  }, 500);
                });
              } // END if eventHandler == scroll_to_top

              if ( eventHandler === 'open_mmenu_toc' ) {
                // check if toccer (toc_mgr) is available
                if ($('#j1-toc-mgr').length) {
                  logger.info('found toc in page: enabled');
                  var dependencies_met_toccer_finished = setInterval (function () {
                    if ( j1.adapter.toccer.getState() == 'finished' ) {
                      logger.info('met dependencies for toccer: finished');
                      // change the id of the $actionButton to the already
                      // registered id by mmenu adapter of ('open_mmenu_toc')
                      // to open the TOC sidebar
                      //
                      $actionButton.prop('id', 'open_mmenu_toc');
                      clearInterval(dependencies_met_toccer_finished);
                    }
                  }, 25); // END dependencies_met_toccer_finished
                } else {
                  logger.info('found toc in page: disabled');
                  logger.info('eventhandler: disabled');
                }
              } // END if eventHandler == open_mmenu_toc
            }
          });
        } // END else
      } else {
//      alert ('Multiple FAM buttons found: ' + famButtons.length);
        logger.error('Multiple FAM buttons found: ' + famButtons.length);
        logger.info('FAM container set to hidden: ' + $famContainer);
        $famContainer.hide();
      } // END if famButton
    }, // END buttonInitializer

    // -------------------------------------------------------------------------
    // Eventhandler

    // -------------------------------------------------------------------------
    // open mmenu TOC
    // -------------------------------------------------------------------------
    open_mmenu_toc: function () {
        // Event configured with Navigator module (navigator.yml)
        // with content section DRAWER TOC. Event registered at
        // runtime on element with id '#open_mmenu_toc' by Mobile Menu
        // module ADAPTER (mmenu.js)
        //
        // NOTE: no further handling needed for this event
    },  // END open_mmenu_toc

    // -------------------------------------------------------------------------
    // reload page
    // -------------------------------------------------------------------------
    reload_page: function () {
      // reload current page (skip cache)
      location.reload(true);
    }, // END reload_page

    // -------------------------------------------------------------------------
    // scroll to previous section
    // -------------------------------------------------------------------------
    scroll_previous_section: function (nodes) {
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

      // Scroll offset correction if mobile or window width <= 992
      // For smaller window sizes, the height of the menubar changes
      //
      // if (j1.core.isMobile() || $(window).width() <= 992) { scrollOffset += 30; }

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

      nodes.each(function () {
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
    // scroll to next section
    // -------------------------------------------------------------------------
    scroll_next_section: function (nodes) {
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
      nodes.each(function () {
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
    // scroll to top
    // -------------------------------------------------------------------------
    scroll_to_top: function () {
      var dest = 0;

      $('html, body').animate({
        scrollTop: dest
      }, 500);

      // tocbot.refresh();
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

      // tocbot.refresh();
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
    // FAM container depending on the size of the page header (attic)
    // -------------------------------------------------------------------------
    scrollSpy: function (options) {
      logger = log4javascript.getLogger('j1.adapter.fam.scrollSpy');

      $(window).scroll(function(event){
        var $navbar         = $('nav.navbar');
        var $pagehead       = $('.attic');
        var $main_content   = $('.js-toc-content');
        var $adblock        = $('#adblock');
        var $footer         = $('#j1_footer');
        var $famContainer   = $('#fam-container');
        var $page           = $(document);
        var offset          = 0;
        var pageOffset      = $(document).width() >= 992 ? -120 : -116;
        var scrollPos       = $(document).scrollTop();
        var pageHeight      = $page.height();
        var pageHeightOuter = $page.outerHeight();

        var m               = $main_content.offset().top;
        var s               = $famContainer.length ? $famContainer.height() : 0;
        var f               = $footer.length   ? $footer.outerHeight() : 0;
        var n               = $navbar.length   ? $navbar.height() : 0;
//      var h               = $pagehead.length ? $pagehead.outerHeight() : 0;
        var a               = $adblock.length  ? $adblock.outerHeight() : 0;
        var o               = n + offset;

        // space above the (fixed) fam container
        var showSsmPos      = m + pageOffset;

        // space below the (fixed) fam container
        var hideSsmPos      = pageHeight - s - f + pageOffset;

        // set the top position of fam container for navbar modes
        // e.g. "sticky" (navbar-fixed)
        if($navbar.hasClass('navbar-fixed')){
          $('#fam-container').css('top', o);
        } else {
          $('#fam-container').css('top', m);
        }

        // show|hide fam container on scroll position in page
        //
        scrollPos >= showSsmPos && scrollPos <= hideSsmPos
          ? $famContainer.css('display','block')
          : $famContainer.css('display','none');

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

{% endcapture %}
{% if production %}
  {{ cache | minifyJS }}
{% else %}
  {{ cache | strip_empty_lines }}
{% endif %}
{% assign cache = nil %}
