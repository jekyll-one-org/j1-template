/*
 # -----------------------------------------------------------------------------
 #  ~/js/api/navigator/navigator.js
 #  Provides all JavaScript core functions for J1 Navigator
 #
 #  Product/Info:
 #  https://jekyll.one
 #  https://github.com/adamnurdin01/bootsnav
 #  http://corenav.anurdin.net/
 #
 #  Copyright (C) 2023-2025 Juergen Adams
 #  Copyright (C) 2016 adamnurdin01
 #
 #  J1 Theme is licensed under MIT License.
 #  See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 #  Bootsnav is licensed under MIT License.
 #  See: https://github.com/adamnurdin01/navigator
 #
 # -----------------------------------------------------------------------------
 # NOTE:
 #  jadams, 2020-06-21:
 #    J1 Navigator needs a general revision on BS4 code and functionalities
 #    Current, only base function are tested with BS4 (was coded for BS3)
 # -----------------------------------------------------------------------------
*/
'use strict';

// -----------------------------------------------------------------------------
// ESLint shimming
// -----------------------------------------------------------------------------
/* eslint indent: "off"                                                       */
/* eslint no-unused-vars: "off"                                               */
/* eslint no-undef: "off"                                                     */
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// TODO: Height of dropdowns are to be limited in general

// -----------------------------------------------------------------------------
// Navigator core registered as 'j1.api.navigator'
// -----------------------------------------------------------------------------

module.exports = function navigator ( options ) {

  // ---------------------------------------------------------------------------
  // global vars
  // ---------------------------------------------------------------------------
  var cookie_names = j1.getCookieNames();
  var user_state   = j1.readCookie(cookie_names.user_state);
  var message      = {};

  var state;
  var logger;
  var logText;

  // -----------------------------------------------------------------------
  // default settings
  // -----------------------------------------------------------------------
  var settings = $.extend ({
    foo: 'bar',
    bar: 'foo',
  }, options );

  // ---------------------------------------------------------------------------
  // main
  // ---------------------------------------------------------------------------
  return {

    // -------------------------------------------------------------------------
    // module initializer
    // -------------------------------------------------------------------------
    init: function( defaultOptions, menuOptions ) {
      logger = log4javascript.getLogger('j1.navigator.core');

      logger.debug('\n' + 'initializing module: started');

      // -----------------------------------------------------------------------
      // Create a Wrapper for the nav system
      // -----------------------------------------------------------------------
      $('body').wrapInner('<div id="wrapper-inner" class="wrapper"></div>');

      this.manageDropdownMenu(defaultOptions, menuOptions);
      this.navbarSticky();
      this.eventHandler(defaultOptions); // jadams, 2021-07-03: initialize events early

      logger.debug('\n' + 'initializing module: finished');

      message.type    = 'state';
      message.action  = 'core_initialized';
      message.text    = 'navigator core initialized';
      j1.sendMessage('j1.navigator.core', 'j1.adapter.navigator', message);

      return true;
    },

    // -------------------------------------------------------------------------
    // event handler
    // -------------------------------------------------------------------------
    eventHandler: function(options) {
      var defaultOptions    = options;
      var $getNav           = $('nav.navbar.navigator');
      var scrollDuration    = 300;
      var page_link;
      var img_link;
      var classname;
      var nav_link;
      var anchor_id;
      var scrollOffset;
      var json_data;

      logger.debug('\n' + 'initializing eventHandler: started');

      // jadams: unused code (for now).: manages HTML5 server side events
      // for incoming messages from Git Server send e.g. on a 'pull request'
      // NOTE: used for ControlCenter (cc) functionality only !!!
      // -----------------------------------------------------------------------
      // const seeMe           = 'https://smee.io/wlNIFNiJN0GClm2';
      // const middleware      = 'localhost:5000/state';
      // const web_server_dev  = 'http://localhost:41000/status';
      // const utility_server  = 'http://localhost:41001/git?request=pull';
      // var sender            = seeMe;
      // var payload;

      // if (j1.checkUserAgent('IE') || j1.checkUserAgent('Edge')) {
      //   logger.warn('HTML5 server side events (SSE) not supported for: ' + userAgent);
      //   logger.warn('Middleware messages disabled');
      // } else {
      //   const middleware_status = new EventSource(sender);
      //
      //   // -----------------------------------------------------------------------
      //   // middleware event handler ( SSE currently NOT used)
      //   // -----------------------------------------------------------------------
      //   middleware_status.onmessage = (event) => {
      //     const payload = JSON.parse(event.data);
      //
      //     logger.debug('middleware: event received');
      //
      //     json_data = JSON.stringify(payload, undefined, 2);
      //     logText   = 'payload: ' + json_data;
      //     logger.debug(logText);
      //
      //     message.type    = 'command';
      //     message.action  = 'status';
      //     message.text    = payload;
      //     j1.sendMessage( 'j1.api.navigator', 'j1.adapter.navigator', message );
      //
      //     return true;
      //   }; // END event onMessage
      // }

      // bind click event to all plain '#' links to prevent default action
      // 'scroll-to-top'
      // See:
      //  https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault
      //  https://developer.mozilla.org/en-US/docs/Web/API/Event/stopPropagation
      //  https://stackoverflow.com/questions/134845/which-href-value-should-i-use-for-javascript-links-or-javascriptvoid0
      //
      $('a[href="#"]').click(function(e) {
        page_link    = document.querySelector('[id="' + decodeURI(anchor_id).split('#').join('') + '"]') ? true : false;
        anchor_id    = e.target.hash ? e.target.hash : false;
        classname    = e.target.className ? e.target.className : '';
        nav_link     = classname.includes('nav-');

        if (nav_link || !page_link) {
          logger.debug('\n' + 'click event on href "#" detected: prevent default action');
          e.preventDefault ? e.preventDefault() : e.returnValue = false;
        }
      });

      // -----------------------------------------------------------------------
      // In-page smooth scroll
      // -----------------------------------------------------------------------

      // bind click event to all headlines generated by AsciiDoctor
      // for smooth-scroll (in-page)
      // jadams,2022-06-10: unused code - smooth scrolling managed by
      // (page height) observer
      // -----------------------------------------------------------------------
      // $('.sect1, .sect2 .sect3, .sect4, .sect5, .sect6').on('click', function (e) {
      //   img_link     = (e.target.localName == 'img') ? true : false;
      //   page_link    = document.querySelector('[id="' + decodeURI(anchor_id).split('#').join('') + '"]') ? true : false;
      //   anchor_id    = e.target.hash ? e.target.hash : false;
      //   classname    = e.target.className ? e.target.className : '';
      //   nav_link     = typeof classname == 'string' ? classname.includes('nav-link') : false;                          // skip BS nav links
      //   scrollOffset = j1.getScrollOffset();
      //   anchorTop    = $(anchor_id).offset().top ? true : false;
      //
      //   if (anchor_id && anchor_id.includes('void')) anchor_id = false;
      //
      //   // skip scrolling if a click on an image detected
      //   if (img_link) {
      //     return true;
      //   }
      //
      //   if (anchor_id && !nav_link || page_link) {
      //     logger.debug('\n' + 'click event on headline detected: ' + anchor_id);
      //
      //     $('html, body').animate({
      //       scrollTop:  + scrollOffset
      //     }, scrollDuration);
      //     e.preventDefault ? e.preventDefault() : e.returnValue = false;
      //   }
      // });

      // bind click event to all HTML elements of class '.badge' (Bootstrap)
      // for smooth-scroll (in-page) to a '<div>' element
      // -----------------------------------------------------------------------
      $('.badge').on('click', function (e) {
        anchor_id    = e.target.hash ? e.target.hash : false;
        scrollOffset = 100;

        if (anchor_id) {
          logger.debug('\n' + 'click event on badge detected: ' + anchor_id);
          $('html, body').animate({
            scrollTop: $(anchor_id).offset().top - scrollOffset                   // NOTE: diffeent scrollOffset
          }, scrollDuration);
          event.stopPropagation();
        }
      });

      // bind click event to all HTML elements of class '.badge-tag' (j1)
      // for smooth-scroll (in-page)
      $('.badge-tag').on('click', function (e) {
        anchor_id    = e.target.hash ? e.target.hash : false;
        scrollOffset = j1.getScrollOffset();

        if (anchor_id) {
          logger.debug('\n' + 'click event on badge-tag detected: ' + anchor_id);
          $('html, body').animate({
            scrollTop: $(anchor_id).offset().top + scrollOffset
          }, scrollDuration);
          event.stopPropagation();
        }
      });

      // jadams: test code for jQuery plugin 'regex'
      // -----------------------------------------------------------------------
      // $('a:contains("?#")').click(function(e) {
      //   e.preventDefault ? e.preventDefault() : e.returnValue = false;
      //   logger.info('bound click event to "?#*", suppress default action');
      // });

      // -----------------------------------------------------------------------
      // Navbar Sticky
      // -----------------------------------------------------------------------
      var navSticky = $getNav.hasClass('navbar-sticky');
      if( navSticky ){
        // Wraped navigation
        $getNav.wrap('<div class=\'wrap-sticky\'></div>');
      }

      // -----------------------------------------------------------------------
      // Navbar Center
      // -----------------------------------------------------------------------
      if( $getNav.hasClass('brand-center') ){
        var postsArr    = new Array();
        var index       = $('nav.brand-center');
        var $postsList  = index.find('ul.navbar-nav');

        //Create array of all posts in lists
        index.find('ul.navbar-nav > li').each(function(){
          postsArr.push($(this).html());
        });

        // Split the array at this point. The original array is altered.
        var firstList   = postsArr.splice(0, Math.round(postsArr.length / 2));
        var secondList  = postsArr;
        var ListHTML    = '';

        var createHTML = function(list) {
          ListHTML = '';
          for (var i = 0; i < list.length; i++) {
            ListHTML += '<li>' + list[i] + '</li>';
          }
        };

        // Generate HTML for first list
        createHTML(firstList);
        $postsList.html(ListHTML);
        index.find('ul.nav').first().addClass('navbar-left');

        // Generate HTML for second list
        createHTML(secondList);
        //Create new list after original one
        $postsList.after('<ul class="nav navbar-nav"></ul>').next().html(ListHTML);
        index.find('ul.nav').last().addClass('navbar-right');

        // Wrap navigation menu
        index.find('ul.nav.navbar-left').wrap('<div class=\'col_half left\'></div>');
        index.find('ul.nav.navbar-right').wrap('<div class=\'col_half right\'></div>');

        // Selection Class
        index.find('ul.navbar-nav > li').each(function() {
          var dropDown = $('ul.dropdown-menu', this),
            megaMenu = $('ul.megamenu-content', this);
          dropDown.closest('li').addClass('dropdown');
          megaMenu.closest('li').addClass('megamenu-fw');
        });
      }

      // -----------------------------------------------------------------------
      // Menu Center
      // -----------------------------------------------------------------------
      if( $getNav.find('ul.nav').hasClass('navbar-center')) {
        $getNav.addClass('menu-center');
      }

      // -----------------------------------------------------------------------
      // Navbar Full
      // -----------------------------------------------------------------------
      if( $getNav.hasClass('navbar-full')) {
        // Add Class to body
        $('nav.navbar.navigator').find('ul.nav').wrap('<div class=\'wrap-full-menu\'></div>');
        $('.wrap-full-menu').wrap('<div class=\'nav-full\'></div>');
        $('ul.nav.navbar-nav').prepend('<li class=\'close-full-menu\'><a href=\'#\'><i class=\'mdi mdi-close\'></i></a></li>');
      } else if( $getNav.hasClass('navbar-mobile') ) {
        $getNav.removeClass('no-full');
      } else {
        $getNav.addClass('no-full');
      }

      // -----------------------------------------------------------------------
      // Navbar Fixed
      // -----------------------------------------------------------------------
      if( $getNav.hasClass('no-background') ) {
        $(window).on('scroll', function() {
          var navbarHeighth = $('nav.navbar').outerHeight();
          var scrollPos     = $(window).scrollTop();

          if (scrollPos > navbarHeighth) {
            $('.navbar-fixed').removeClass('no-background');
          } else {
            $('.navbar-fixed').addClass('no-background');
          }
        });
      }

      if( $getNav.hasClass('navbar-transparent') ) {
        $(window).on('scroll', function() {
          var navbarHeighth = $('nav.navbar').outerHeight();
          var scrollPos     = $(window).scrollTop();

          if (scrollPos > navbarHeighth) {
            $('.navbar-fixed').removeClass('navbar-transparent');
            $('.navbar-fixed').addClass('navbar-scrolled');
          } else {
            $('.navbar-fixed').removeClass('navbar-scrolled');
            $('.navbar-fixed').addClass('navbar-transparent');
          }
        });
      }

      // -----------------------------------------------------------------------
      // Manage events for all quicklinks
      // https://stackoverflow.com/questions/178325/how-do-i-check-if-an-element-is-hidden-in-jquery
      // https://stackoverflow.com/questions/4770025/how-to-disable-scrolling-temporarily
      // https://stackoverflow.com/questions/5963669/whats-the-difference-between-event-stoppropagation-and-event-preventdefault
      // -----------------------------------------------------------------------
      $('.quicklink-nav').each(function() {

        // ---------------------------------------------------------------------
        // ThemeToggler
        //

        // -------------------------------------------------------------------
        // Event Mgmt from themeToggler SHOULD placed here
        // -------------------------------------------------------------------

        // ---------------------------------------------------------------------
        // QuickSearch
        //
        if ($('li.quicksearch')) {

          logger.debug('register OPEN event for QuickSearch');

          $('li.quicksearch > a', this).on('click', function(e) {
            logger.debug('manage search action OPEN');
            $('#searchModal').modal('show');
          });

        } // END QuickSearch

        // ---------------------------------------------------------------------
        // DocSearch dialog
        //
        if ($('li.documind')) {
          logger.debug('register SHOW event for J1 DocSearch');
          $('li.documind > a', this).on('click', function(e) {
            j1.adapter.docsearch.showDialog();
          });
        } // END DocSearch

        // ---------------------------------------------------------------------
        // Translator dialog
        //
        if ($('li.translate')) {
          logger.debug('register SHOW event for J1 Translator');
          $('li.translate > a', this).on('click', function(e) {
            j1.translator.showDialog();
          });
        } // END Translator

        // ---------------------------------------------------------------------
        // Speak2Me dialog
        //
        if ($('li.speak')) {
          logger.debug('register SHOW event for J1 Speak2Me');
          $('li.speak > a', this).on('click', function(e) {
            j1.adapter.speak2me.showDialog();
          });
        } // END Speak2Me

        // ---------------------------------------------------------------------
        // NBI Notebooks dialog
        //
        // if ($('li.nbi-notebooks')) {
        //   logger.debug('register SHOW event for J1 NBI');
        //   $('li.nbi-notebooks > a', this).on('click', function(e) {
        //     j1.adapter.nbinteract.showDialog();
        //   });
        // } // END NBI Notebooks

        // ---------------------------------------------------------------------
        // CookieConsent dialog
        //
        if ($('li.cookie-consent')) {
          logger.debug('register SHOW event for J1 CookieConsent');
          $('li.cookie-consent > a', this).on('click', function(e) {
            j1.cookieConsent.showDialog();
          });
        } // END CookieConsent

      }); // End manage events for all quicklinks

      logger.debug('\n' + 'initializing eventHandler: finished');

    }, // END eventHandler

    // -------------------------------------------------------------------------
    // Manage the Menu Dropdowns for Desktop|Mobile
    // -------------------------------------------------------------------------
    manageDropdownMenu : function( defaultOptions, menuOptions ) {

      var navDefaultOptions   = defaultOptions;
      var navMenuOptions      = menuOptions;

      var $getNav             = $('nav.navbar.navigator');
      var $windowOrientation  = window.matchMedia('(orientation: landscape)').matches ? 'landscape' : 'portrait';
      var $getWindow          = $(window).width();
      var $getNavWidth        = $('nav').width();
      var $getIn              = $getNav.find('ul.nav').data('in');
      var $getOut             = $getNav.find('ul.nav').data('out');

      var menuSelector        = '#' +navMenuOptions.xhr_container_id+ '.collapse';
      var quicklinksSelector  = '#navigator_nav_quicklinks';
      var delayMenuOpen       = navMenuOptions.delay_menu_open;

      var breakPoint;

      var $menu;
      var $dropDown;
      var timeoutHandle;

      // BS4 @media MAX breakpoints
      // NOTE: a media query is always a range
      // -----------------------------------------------------------------------
      var gridBreakpoint_lg = 992;                                              // bs-breakpoint-lg
      var gridBreakpoint_md = 768;                                              // bs-breakpoint-md
      var gridBreakpoint_sm = 576;                                              // bs-breakpoint-sm

      // BS4 @media MIN breakpoints
      // -----------------------------------------------------------------------
      // NOTE: a media query is always a range
      // var gridBreakpoint_lg = 991;
      // var gridBreakpoint_md = 767;
      // var gridBreakpoint_sm = 575;

      // @media ranges
      // -----------------------------------------------------------------------
      var small_range         = {min: '0em',      max: '40em'};                 /* 0, 640px */
      var medium_range        = {min: '40.063em', max: '64em'};                 /* 641px, 1024px */
      var large_range         = {min: '64.063em', max: '90em'};                 /* 1025px, 1440px */
      var xlarge_range        = {min: '90.063em', max: '120em'};                /* 1441px, 1920px */
      var xxlarge_range       = {min: '120.063em'};                             /* 1921px */

      // jadams, 2019-05-01: Set Media Breakpoint for Desktop|Mobile Navigation
      if ( navDefaultOptions.nav_bar.media_breakpoint === 'lg' ) {
        breakPoint = gridBreakpoint_lg;
      } else if ( navDefaultOptions.nav_bar.media_breakpoint === 'md' ) {
        breakPoint = gridBreakpoint_md;
      } else if ( navDefaultOptions.nav_bar.media_breakpoint === 'sm' ) {
        breakPoint = gridBreakpoint_sm;
      } else{
        breakPoint = gridBreakpoint_lg;
      }

      // -----------------------------------------------------------------------
      // Tablet or Mobile
      // NOTE:
      //    Managing the mobile menu is moved to MMenu Plugin
      //    Only base functions like QuickLinks are managed by
      //    J1 Navigator
      // -----------------------------------------------------------------------
      // MIN media breakpoint
      if ( $getWindow <= breakPoint ) {

        // Collapse Navbar (Desktop Navigation)
        $(menuSelector).addClass('navbar-collapse');
        $(menuSelector).removeClass('show');

        // Show QuicklinksBar
        $(quicklinksSelector).addClass('show');

      // -----------------------------------------------------------------------
      // Desktop Navigation does NOT work on physical devices like iPad|Pro
      // Config DISABLED
      //
//    } else if ( $getWindow > breakPoint || $getWindow <= 1024 && $windowOrientation == 'portrait'  ) {
      } else if ( $getWindow > breakPoint ) {
      // -----------------------------------------------------------------------
      // Desktop
      // -----------------------------------------------------------------------
        $('#navigator_nav_quicklinks').removeClass('show');
        $('#desktop_menu').show();

        // jadams, 2021-03-05: manage dropdown menus
        // ---------------------------------------------------------------------

        $('.dropdown-menu > li').on('mouseenter', function(){
          if ($('body').hasClass('stop-scrolling')){
            return false;
          } else {
            $('body').addClass('stop-scrolling');
          }
        });

        $('.dropdown-menu > li').on('mouseleave', function(){
          // stop scrolling if top search or any (mmenu) drawer is opened
          if ($('body').hasClass('stop-scrolling')){
            $('body').removeClass('stop-scrolling');
          }
        });

        // limit the dropdown menu lenght if needed
        $('.dropdown-menu > li').hover(function() {
          var $container  = $(this);
          var $list       = $container.find('ul');

          // limit LAST menu ONLY
          if ( $list.length == 1 ) {
            $list.addClass('scrollable-menu');
          }
        });

        // jadams, 2021-03-06: Enable|Show Desktop Menu|s
        //
        $(menuSelector).removeClass('navbar-collapse');
        $(menuSelector).addClass('show');

        // Open Desktop Menu|s on hover
        $('nav.navbar.navigator ul.nav').each(function() {

          $('a.dropdown-toggle', this).off('click');
          // $('a.dropdown-toggle', this).on('click', function (e) {
          //   // e.stopPropagation(); // don't bubble up the event
          // });

          $('.megamenu-fw', this).each(function() {
            $('.title', this).off('click');
            $('a.dropdown-toggle', this).off('click');
            $('.content').removeClass('animate__animated ');
          });

          $('.dropdown-menu', this).addClass('animate__animated ');

          $('li.dropdown', this).on('mouseenter', function(e) {
            $menu     = $('.dropdown-menu', this).eq(0);
            $dropDown = $(this);

            $menu.removeClass($getOut);
            $menu.removeClass('open');
            $dropDown.addClass('open');

            // Create a timeout object to delay the dropdown menus to open
            timeoutHandle = window.setTimeout(function () {
              if ($dropDown.hasClass('open')) {
                $menu.stop().fadeIn().addClass($getIn);
                $menu.addClass('open');
                $dropDown.addClass('open');
              }
            }, delayMenuOpen);
            return true;
          });

          $('li.dropdown', this).on('mouseleave', function(e) {
            $menu     = $('.dropdown-menu', this).eq(0);
            $dropDown = $(this);

            // Clear the timeout object for dropdown menus 'open'
            window.clearTimeout(timeoutHandle);

            $menu.removeClass($getIn);
            $menu.addClass($getOut);
            $menu.fadeOut('slow');
            $dropDown.removeClass('open');

           return true;
          });
        }); // END Desktop Menu

      } // end Desktop

      // -----------------------------------------------------------------------
      //  Fullscreen Menu
      // -----------------------------------------------------------------------
      if( $getNav.hasClass('navbar-full')){
        var windowHeight = $(window).height(),
          windowWidth =  $(window).width();

        $('.nav-full').css('height', windowHeight + 'px');
        $('.wrap-full-menu').css('height', windowHeight + 'px');
        $('.wrap-full-menu').css('width', windowWidth + 'px');

        $('.navbar-collapse').addClass('animate__animated ');
        $('.navbar-toggle').each(function(){
          var getId = $(this).data('target');
          $(this).off('click');
          $(this).on('click', function(e) {
            e.preventDefault();
            $(getId).removeClass($getOut);
            $(getId).addClass('in');
            $(getId).addClass($getIn);
            // e.stopPropagation(); // don't bubble up the event
            // return false;
          });

          $('li.close-full-menu').on('click', function(e) {
            e.preventDefault();
            $(getId).addClass($getOut);
            setTimeout(function(){
              $(getId).removeClass('in');
              $(getId).removeClass($getIn);
            }, 500);
            //e.stopPropagation(); // don't bubble up the event
            // return false;
          });
        });
      }
    },  // end manageDropdownMenu

    // -------------------------------------------------------------------------
    // Sticky Navbar
    // -------------------------------------------------------------------------
    navbarSticky : function() {
      var $getNav = $('nav.navbar.navigator'),
        navSticky = $getNav.hasClass('navbar-sticky');

      if (navSticky) {
        // Set Height Navigation
        var $getHeight = $getNav.height();
        $('.wrap-sticky').height($getHeight);

        // Windown on scroll
        var getOffset = $('.wrap-sticky').offset().top;
        $(window).on('scroll', function(){
          var scrollTop = $(window).scrollTop();
          if(scrollTop > getOffset){
            $getNav.addClass('sticked');
          }else {
            $getNav.removeClass('sticked');
          }
        });
      }
    }, // end navbarSticky

    // -------------------------------------------------------------------------
    // updateSidebar
    // Note:
    // -------------------------------------------------------------------------
    updateSidebar: function (user_data) {
      var logger = log4javascript.getLogger('j1.api.navigator.updateSidebar');
      var json_message;

//    json_message = JSON.stringify(user_data, undefined, 2);                   // multiline
      json_message = JSON.stringify(user_data);
      logText      = 'user state data: ' + json_message;
      logger.debug(logText);

      // Replace Macro placeholders to values
      j1.resolveMacros(user_data);
      // Replace Macro values only
      j1.updateMacros(user_data);

      return true;

    }, // END updateSidebar

  }; // end return (object)

// }( j1, window, jQuery );
}( jQuery );
