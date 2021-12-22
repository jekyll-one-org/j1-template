/*
 # -----------------------------------------------------------------------------
 #  ~/js/navigator/navigator.js
 #  Provides all JavaScript core functions for J1 Navigator
 #
 #  Product/Info:
 #  https://jekyll.one
 #  https://github.com/adamnurdin01/bootsnav
 #  http://corenav.anurdin.net/
 #
 #  Copyright (C) 2021 Juergen Adams
 #  Copyright (C) 2016 adamnurdin01
 #
 #  J1 Template is licensed under MIT License.
 #  See: https://github.com/jekyll-one-org/J1 Template/blob/master/LICENSE
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
// Navigator core registered as 'j1.core.navigator'
// -----------------------------------------------------------------------------

module.exports = function navigator ( options ) {

  // ---------------------------------------------------------------------------
  // global vars
  // ---------------------------------------------------------------------------
  var message = {};
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
  // main object
  // ---------------------------------------------------------------------------
  return {

    // -------------------------------------------------------------------------
    // module initializer
    // -------------------------------------------------------------------------
    init: function( defaultOptions, menuOptions ) {
      logger  = log4javascript.getLogger('j1.core.navigator');

      logText = 'core is being initialized';
      logger.info(logText);

      // -----------------------------------------------------------------------
      // Create a Wrapper for the nav system
      // -----------------------------------------------------------------------
      $('body').wrapInner('<div id="wrapper-inner" class="wrapper"></div>');

      this.manageDropdownMenu(defaultOptions, menuOptions);
      this.navbarSticky();
      this.eventHandler(defaultOptions); // jadams, 2021-07-03: initialize events early

      message.type    = 'command';
      message.action  = 'core_initialized';
      message.text    = 'navigator core initialized';
      j1.sendMessage( 'j1.core.navigator', 'j1.adapter.navigator', message );

      return true;
    },

    // -------------------------------------------------------------------------
    // event handler
    // -------------------------------------------------------------------------
    eventHandler: function(options) {
      var defaultOptions    = options;
      var logger            = log4javascript.getLogger('j1.core.navigator.eventHandler');
      var $getNav           = $('nav.navbar.navigator');
      var scrollDuration    = 300;
      var page_link;
      var img_link;
      var classname;
      var nav_link;
      var anchor_id;
      var scrollOffset;
      var json_data;

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
      //     j1.sendMessage( 'j1.core.navigator', 'j1.adapter.navigator', message );
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

//      if (!nav_link || page_link) {
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
      // -----------------------------------------------------------------------
      $('.sect1, .sect2 .sect3, .sect4, .sect5, .sect6').on('click', function (e) {
        img_link     = (e.target.localName == 'img') ? true : false;
        page_link    = document.querySelector('[id="' + decodeURI(anchor_id).split('#').join('') + '"]') ? true : false;
        anchor_id    = e.target.hash ? e.target.hash : false;
        classname    = e.target.className ? e.target.className : '';
        nav_link     = classname.includes('nav-link');                          // skip BS nav links
        scrollOffset = j1.getScrollOffset();

        if (img_link) {
          // skip scrolling if a click on an image detected
          return true;
        }

        if (anchor_id && !nav_link || page_link) {
          logger.debug('\n' + 'click event on headline detected: ' + anchor_id);

          $('html, body').animate({
            scrollTop: $(anchor_id).offset().top + scrollOffset
          }, scrollDuration);
          e.preventDefault ? e.preventDefault() : e.returnValue = false;
        }
      });

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
      $('.attr-nav').each(function() {
        // ---------------------------------------------------------------------
        // QuickSearch
        //
        if ($('li.quicksearch')) {
          logger.debug('register OPEN event for QuickSearch');
          $('li.quicksearch > a', this).on('click', function(e) {
            e.preventDefault(); // don't do the default browser action
            logger.debug('manage search action OPEN');
            $('html,body').animate({scrollTop: 0}, 0);
            $('.top-search').slideToggle('slow', 'swing', function() {
              if ( $('.top-search').is(':visible') ) {
                // disable scrolling (desktop)
                $('body').addClass('stop-scrolling');
                // disable scrolling (mobile)
                $('body').bind('touchmove', function(e){e.preventDefault();});
                // disable navbar
                $('#' + defaultOptions.nav_bar.container_id).hide();
              } else {
                // enable scrolling (desktop)
                $('body').removeClass('stop-scrolling');
                // enable scrolling (mobile)
                $('body').unbind('touchmove');
                // enable navbar
                $('#' + defaultOptions.nav_bar.container_id).show();
              }
            });
            e.stopPropagation(); // don't bubble up the event
          });

          logger.debug('register CLOSE event for QuickSearch');
          $('.input-group-addon.close-search').on('click', function(e) {
            e.preventDefault(); // don't do the default browser action
            logger.debug('manage search action CLOSE');
            $('.top-search').slideUp('slow', 'swing');
            $('html,body').animate({scrollTop: 0}, 0);
            // enable scrolling (desktop)
            $('body').removeClass('stop-scrolling');
            // enable scrolling (mobile)
            $('body').unbind('touchmove');
            // enable navbar
            $('#' + defaultOptions.nav_bar.container_id).show();
            e.stopPropagation(); // don't bubble up the event
          });
        } // END QuickSearch

        // ---------------------------------------------------------------------
        // Translator
        //
        if ($('li.translate')) {
          logger.debug('register SHOW event for J1 Translator');
          $('li.translate > a', this).on('click', function(e) {
            j1.translator.showDialog();
          });
        } // END Translator

        // ---------------------------------------------------------------------
        // CookieConsent
        //
        if ($('li.cookie-consent')) {
          logger.debug('register SHOW event for J1 CookieConsent');
          $('li.cookie-consent > a', this).on('click', function(e) {
            j1.cookieConsent.showDialog();
          });
        } // END CookieConsent

      }); // End manage events for all quicklinks

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
      var delayMenuOpen       = navMenuOptions.delay_menu_open;

      var $menu;
      var breakPoint;
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

        // Collapse Navbar
        $(menuSelector).addClass('navbar-collapse');
        $(menuSelector).removeClass('show'); //
        $('#navigator_nav_quicklinks').addClass('show');

        // Enable click Quicklink Navigation
        $('nav.navbar.navigator .attr-nav').each(function() {
          $('.dropdown-menu', this).removeClass('animated');
          $('li.dropdown', this).off('mouseenter');
          $('li.dropdown', this).off('mouseleave');
          $('a.dropdown-toggle', this).off('click');
          $('a.dropdown-toggle', this).on('click', function (e) {
            // e.stopPropagation(); // don't bubble up the event
            $(this).closest('li.dropdown').find('.dropdown-menu').first().stop().fadeToggle();
            $('.navbar-toggle').each(function(){
              $('.mdi', this).removeClass('mdi-close');
              $('.mdi', this).addClass('mdi-menu');
              $('.navbar-collapse').removeClass('in');
              $('.navbar-collapse').removeClass('open');
            });
          });

          $(this).on('mouseleave', function(){
            $('.dropdown-menu', this).stop().fadeOut();
            $('li.dropdown', this).removeClass('open');
            // return false;
          });
        });

        $('#desktop_menu').hide();

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
          //
          if ( $list.length == 1 ) {
            $list.addClass('scrollable-menu');
          }
        });

        // jadams, 2021-03-06: Enable|Show Desktop Menu|s
        //
        $(menuSelector).removeClass('navbar-collapse');
        $(menuSelector).addClass('show');

        // Navbar Sidebar
        // jadams, 2021-03-05: Sidebar NOT used anymore

        // Open Desktop Menu|s on hover
        //
        $('nav.navbar.navigator ul.nav').each(function() {
          $('a.dropdown-toggle', this).off('click');
          $('a.dropdown-toggle', this).on('click', function (e) {
            // e.stopPropagation(); // don't bubble up the event
          });

          $('.megamenu-fw', this).each(function(){
            $('.title', this).off('click');
            $('a.dropdown-toggle', this).off('click');
            $('.content').removeClass('animated');
          });
          $('.dropdown-menu', this).addClass('animated');

          $('li.dropdown', this).on('mouseenter', function(){
            $menu     = $('.dropdown-menu', this).eq(0);
            $dropDown = $(this);

            $menu.removeClass($getOut);
            $menu.removeClass('open');
            $dropDown.addClass('open');
            // Get|Set the timeout object to delay the dropdown open
            timeoutHandle = window.setTimeout(function () {
              if ($dropDown.hasClass('open')){
                $menu.stop().fadeIn().addClass($getIn);
                $menu.addClass('open');
                $dropDown.addClass('open');
              }
            }, delayMenuOpen);
          });

          $('li.dropdown', this).on('mouseleave', function(){
            window.clearTimeout(timeoutHandle);  // Clear the timeout object
            $(this).removeClass('open').removeClass('open');

            $('.dropdown-menu', this).removeClass('open');
            $('.dropdown-menu', this).eq(0).removeClass($getIn);
            $('.dropdown-menu', this).eq(0).stop().fadeOut().addClass($getOut);
          });

          $(this).on('mouseleave', function(){
            window.clearTimeout(timeoutHandle);
            $('li.dropdown', this).removeClass('open');
            $('.dropdown-menu', this).removeClass('open');
            $('.dropdown-menu', this).removeClass($getIn);
            $('.dropdown-menu', this).eq(0).stop().fadeOut().addClass($getOut);
          });
        }); // END Desktop Menu

      } // end Desktop

      // -----------------------------------------------------------------------
      // Hover Open on Quicklink Navigation
      // -----------------------------------------------------------------------
      $('nav.navbar.navigator .attr-nav').each(function() {

        $('a.dropdown-toggle', this).off('click');
        $('a.dropdown-toggle', this).on('click', function (e) {
          // e.stopPropagation(); // don't bubble up the event
        });

        $('.dropdown-menu', this).addClass('animated');
        $('li.dropdown', this).on('mouseenter', function(){
          $('.dropdown-menu', this).eq(0).removeClass($getOut);
          $('.dropdown-menu', this).eq(0).stop().fadeIn().addClass($getIn);
          $(this).addClass('open');
          //return false;
        });

        $('li.dropdown', this).on('mouseleave', function(){
          $('.dropdown-menu', this).eq(0).removeClass($getIn);
          $('.dropdown-menu', this).eq(0).stop().fadeOut().addClass($getOut);
          $(this).removeClass('open');
        });

        $(this).on('mouseleave', function(){
          $('.dropdown-menu', this).removeClass($getIn);
          $('.dropdown-menu', this).eq(0).stop().fadeOut().addClass($getOut);
          $('li.dropdown', this).removeClass('open');
          //return false;
        });
      });

      // -----------------------------------------------------------------------
      //  Fullscreen Menu
      // -----------------------------------------------------------------------
      if( $getNav.hasClass('navbar-full')){
        var windowHeight = $(window).height(),
          windowWidth =  $(window).width();

        $('.nav-full').css('height', windowHeight + 'px');
        $('.wrap-full-menu').css('height', windowHeight + 'px');
        $('.wrap-full-menu').css('width', windowWidth + 'px');

        $('.navbar-collapse').addClass('animated');
        $('.navbar-toggle').each(function(){
          var getId = $(this).data('target');
          $(this).off('click');
          $(this).on('click', function(e){
            e.preventDefault();
            $(getId).removeClass($getOut);
            $(getId).addClass('in');
            $(getId).addClass($getIn);
            // e.stopPropagation(); // don't bubble up the event
            // return false;
          });

          $('li.close-full-menu').on('click', function(e){
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
      var logger = log4javascript.getLogger('j1.core.navigator.updateSidebar');
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
}( jQuery );
