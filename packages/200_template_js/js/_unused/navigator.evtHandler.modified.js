/*
 # -----------------------------------------------------------------------------
 #  ~/js/navigator/navigator.js
 #  Provides all JavaScript core functions for J1 Navigator
 #
 #  Product/Info:
 #  https://jekyll.one
 #  https://github.com/adamnurdin01/navigator
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
*/

// -----------------------------------------------------------------------------
// ESLint shimming
// -----------------------------------------------------------------------------
/* eslint indent: "off"                                                       */
/* eslint no-unused-vars: "off"                                               */
/* eslint no-undef: "off"                                                     */


// TODO: Height of dropdowns are to be limited in general

// -----------------------------------------------------------------------------
// Navigator core registered as 'j1.core.navigator'
// -----------------------------------------------------------------------------
module.exports = function navigator ( options ) {

  // Global variables
  var message = {};
  var state;
  var logger;
  var logText;

  // Define default options
  var settings = $.extend({
    // These are the defaults.
    foo: 'bar',
    bar: 'foo',
  }, options );

  return {
    // -------------------------------------------------------------------------
    // Initializer
    // -------------------------------------------------------------------------
    init: function( defaultOptions, menuOptions ) {
      logger = log4javascript.getLogger('j1.core.navigator');

      logText = 'Navigator is being initialized';
      logger.info(logText);

      var navDefaultOptions = defaultOptions;
      var navMenuOptions    = menuOptions;

      // because of async (HTML) data loads, eventHandler is called from adapter
      // this.eventHandler();

      this.manageDropdownMenu( navDefaultOptions, navMenuOptions );
      this.navbarSticky();
      this.navbarScrollspy();

      logText = 'Navigator initialized successfully';
      logger.info(logText);

      message.type    = 'command';
      message.action  = 'module_initialized';
      message.text    = 'Navigator initialized successfully';
      j1.sendMessage( 'j1.core.navigator', 'j1.adapter.navigator', message );
    },

    // -------------------------------------------------------------------------
    // Event Handler
    // -------------------------------------------------------------------------
    eventHandler: function() {
      var logger            = log4javascript.getLogger('j1.core.navigator.eventHandler');
      var $getNav           = $('nav.navbar.navigator');
      const seeMe           = 'https://smee.io/wlNIFNiJN0GClm2';
      const middleware      = 'localhost:5000/state';
      const web_server_dev  = 'http://localhost:41000/status';
      const utility_server  = 'http://localhost:41001/git?request=pull';
      var sender            = seeMe;
      var payload;
      var json_data;


      const middleware_status = new EventSource(sender);

      // -----------------------------------------------------------------------
      // Middleware event handler
      // -----------------------------------------------------------------------
      middleware_status.onmessage = (event) => {
        const payload = JSON.parse(event.data);

        logger.debug('middleware: event received');

        json_data = JSON.stringify(payload, undefined, 2);
        logText   = 'eventHandler: payload: ' + json_data;
        logger.debug(logText);

        message.type    = 'command';
        message.action  = 'status';
        message.text    = payload;
        j1.sendMessage( 'j1.core.navigator', 'j1.adapter.navigator', message );

        return true;
      }; // END event onMessage

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

        //Generate HTML for first list
        createHTML(firstList);
        $postsList.html(ListHTML);
        index.find('ul.nav').first().addClass('navbar-left');

        //Generate HTML for second list
        createHTML(secondList);
        //Create new list after original one
        $postsList.after('<ul class="nav navbar-nav"></ul>').next().html(ListHTML);
        index.find('ul.nav').last().addClass('navbar-right');

        //Wrap navigation menu
        index.find('ul.nav.navbar-left').wrap('<div class=\'col_half left\'></div>');
        index.find('ul.nav.navbar-right').wrap('<div class=\'col_half right\'></div>');

        //Selection Class
        index.find('ul.navbar-nav > li').each(function() {
          var dropDown = $('ul.dropdown-menu', this),
            megaMenu = $('ul.megamenu-content', this);
          dropDown.closest('li').addClass('dropdown');
          megaMenu.closest('li').addClass('megamenu-fw');
        });
      }

      // -----------------------------------------------------------------------
      // Navbar Sidebar
      // -----------------------------------------------------------------------
      if( $getNav.hasClass('navbar-sidebar')) {
        // Add Class to body
        $('body').addClass('wrap-nav-sidebar');
        $getNav.wrapInner('<div class=\'scroller\'></div>');
      } else {
        $('.navigator').addClass('on');
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
      // Navbar Mobile
      // -----------------------------------------------------------------------
      if( $getNav.hasClass('navbar-mobile')) {
        // Add Class to body
        $('.navbar-collapse').on('shown.bs.collapse', function() {
          $('body').addClass('side-right');
        });
        $('.navbar-collapse').on('hide.bs.collapse', function() {
          $('body').removeClass('side-right');
        });

        $(window).on('resize', function() {
          $('body').removeClass('side-right');
        });
      }

      // -----------------------------------------------------------------------
      // Navbar Fixed
      // -----------------------------------------------------------------------
      if( $getNav.hasClass('no-background') ) {
        $(window).on('scroll', function(){
          var scrollTop = $(window).scrollTop();
          if(scrollTop >34){
            $('.navbar-fixed').removeClass('no-background');
          } else {
            $('.navbar-fixed').addClass('no-background');
          }
        });
      }

      // -----------------------------------------------------------------------
      // Navbar Fixed
      // -----------------------------------------------------------------------
      if( $getNav.hasClass('navbar-transparent') ) {
        $(window).on('scroll', function(){
          var scrollTop = $(window).scrollTop();
          if(scrollTop >34){
            $('.navbar-fixed').removeClass('navbar-transparent');
            $('.navbar-fixed').addClass('navbar-scrolled');
          } else {
            $('.navbar-fixed').removeClass('navbar-scrolled');
            $('.navbar-fixed').addClass('navbar-transparent');
          }
        });
      }

      // -----------------------------------------------------------------------
      // Toggle Search
      // https://stackoverflow.com/questions/178325/how-do-i-check-if-an-element-is-hidden-in-jquery
      // https://stackoverflow.com/questions/4770025/how-to-disable-scrolling-temporarily
      // https://stackoverflow.com/questions/5963669/whats-the-difference-between-event-stoppropagation-and-event-preventdefault
      // -----------------------------------------------------------------------
      $('nav.navbar.navigator .attr-nav').each(function() {
        logger.debug('eventHandler: register OPEN event|s for QuickSearch');
        $('li.search > a', this).on('click', function(e) {
          e.preventDefault(); // don't do the default browser action
          logger.debug('eventHandler: manage search action OPEN');
          $('html,body').animate({scrollTop: 0}, 0);
          $('.top-search').slideToggle('slow', 'swing', function() {
            if ( $('.top-search').is(':visible') ) {
              $('body').addClass('stop-scrolling');
            } else {
              $('body').removeClass('stop-scrolling');
            }
          });
          e.stopPropagation(); // don't bubble up the event
        });
      });
      logger.debug('eventHandler: register CLOSE event|s for QuickSearch');
      $('.input-group-addon.close-search').on('click', function(e) {
        e.preventDefault(); // don't do the default browser action
        logger.debug('eventHandler: manage search action CLOSE');
        $('.top-search').slideUp('slow', 'swing');
        $('html,body').animate({scrollTop: 0}, 0);
        $('body').removeClass('stop-scrolling');
        e.stopPropagation(); // don't bubble up the event
      });

      // -----------------------------------------------------------------------
      // Toggle Side Menu
      // -----------------------------------------------------------------------
      $('nav.navbar.navigator .attr-nav').each(function() {
        logger.debug('eventHandler: register OPEN event|s for SideBar');
        $('li.side-menu > a', this).on('click', function(e) {
          e.preventDefault(); // don't do the default browser action
          logger.debug('eventHandler: manage sidebar action OPEN');
          // e.stopPropagation(); // don't bubble up the event
          $('nav.navbar.navigator > .side').toggleClass('on');
          $('body').toggleClass('on-side');
          e.stopPropagation(); // don't bubble up the event
        });
      });
      $('nav.navbar.navigator .side').each(function() {
        logger.debug('eventHandler: register CLOSE event|s for SideBar');
        $('.side .close-side').on('click', function(e) {
          e.preventDefault(); // don't do the default browser action
          logger.debug('eventHandler: manage sidebar action CLOSE');
          $('nav.navbar.navigator > .side').removeClass('on');
          $('body').removeClass('on-side');
          e.stopPropagation(); // don't bubble up the event
        });
      });

      // -----------------------------------------------------------------------
      // Wrapper
      // -----------------------------------------------------------------------
      $('body').wrapInner( '<div class=\'wrapper\'></div>');

    }, // end event

    // -------------------------------------------------------------------------
    // Manage the Menu Dropdowns for Desktop|Mobile
    // -------------------------------------------------------------------------
    manageDropdownMenu : function( defaultOptions, menuOptions ) {

      var navDefaultOptions = defaultOptions;
      var navMenuOptions    = menuOptions;

      var $getNav           = $('nav.navbar.navigator');
      var $getWindow        = $(window).width();
      var $getNavWidth      = $('nav').width();
      var $getIn            = $getNav.find('ul.nav').data('in');
      var $getOut           = $getNav.find('ul.nav').data('out');

      var menuSelector      = '#' +navMenuOptions.xhr_container_id+ '.collapse';
      var delayMenuOpen     = navMenuOptions.delay_menu_open;

      var $menu;
      var breakPoint;
      var $dropDown;
      var timeoutHandle;

      // BS4 media breakpoints
      var col_lg = 992;
      var col_md = 768;
      var col_sm = 576;

      // jadams, 2019-05-01: Set Media Breakpoint for Desktop|Mobile Navigation
      if ( navDefaultOptions.nav_bar.media_breakpoint === 'lg' ) {
        breakPoint = col_lg;
      } else if ( navDefaultOptions.nav_bar.media_breakpoint === 'md' ) {
        breakPoint = col_md;
      } else if ( navDefaultOptions.nav_bar.media_breakpoint === 'sm' ) {
        breakPoint = col_sm;
      } else{
        breakPoint = col_lg;
      }

      // -----------------------------------------------------------------------
      // Tablet or Mobile
      // -----------------------------------------------------------------------
      if( $getWindow < breakPoint ) {

        // Height of scroll navigation sidebar
        //$('.scroller').css('height', 'auto');

        // Collapse Navbar
        $(menuSelector).addClass('navbar-collapse');
        $(menuSelector).removeClass('show'); //

        // Disable mouse events
        $('nav.navbar.navigator ul.nav').find('li.dropdown').off('mouseenter');
        $('nav.navbar.navigator ul.nav').find('li.dropdown').off('mouseleave');
        $('nav.navbar.navigator ul.nav').find('.title').off('mouseenter');
        $('nav.navbar.navigator ul.nav').off('mouseleave');
        $('.navbar-collapse').removeClass('animated');

        // Enable click events
        $('nav.navbar.navigator ul.nav').each(function() {
          $('.dropdown-menu', this).addClass('animated');
          $('.dropdown-menu', this).removeClass($getOut);

          // Dropdown Fade Toggle
          $('a.dropdown-toggle', this).off('click');
          $('a.dropdown-toggle', this).on('click', function (e) {
            // prevent further event propagation (bubble up)
            e.stopPropagation(); // don't bubble up the event
            $(this).closest('li.dropdown').find('.dropdown-menu').first().stop().fadeToggle().toggleClass($getIn);
            // jadams, 2017-06-24: add|remove indicator class
            $(this).closest('li.dropdown').first().toggleClass('open');
            return false;
          });

          // Hidden dropdown action
          $('li.dropdown', this).each(function () {
            $(this).find('.dropdown-menu').stop().fadeOut();
            $(this).on('hidden.bs.dropdown', function () {
              $(this).find('.dropdown-menu').stop().fadeOut();
            });
            return false;
          });

          // Megamenu style
          /* jadams, 2017-12-11: until MM not fixed, disabled .megamenu-content */
          /*
          $('.megamenu-fw', this).each(function(){
            $('.col_menu', this).each(function(){
              $('.content', this).addClass('animated');
              $('.content', this).stop().fadeOut();
              $('.title', this).off('click');
              $('.title', this).on('click', function(){
                $(this).closest('.col_menu').find('.content').stop().fadeToggle().addClass($getIn);
                // jadams, 2017-06-24, changed on to open for BMD4
                // $(this).closest('.col_menu').toggleClass('on');
                $(this).closest('.col_menu').toggleClass('bla');
                return false;
              });

              $('.content', this).on('click', function(e) {
                // prevent further event propagation (bubble up)
                e.stopPropagation(); // don't bubble up the event
              });
            });
          });
          */
        }); // END enable click events

        // Hide Dropdown Menus
        var cleanOpen = function(){
          $('li.dropdown', this).removeClass('open');
          $('.dropdown-menu', this).stop().fadeOut();
          $('.dropdown-menu', this).removeClass($getIn);
          $('.col_menu', this).removeClass('open');
          $('.col_menu .content', this).stop().fadeOut();
          $('.col_menu .content', this).removeClass($getIn);
        };

        // Hide on mouse leave
        $('nav.navbar.navigator').on('mouseleave', function(){
          cleanOpen();
        });

        // Enable click Quicklink Navigation
        $('nav.navbar.navigator .attr-nav').each(function() {
          $('.dropdown-menu', this).removeClass('animated');
          $('li.dropdown', this).off('mouseenter');
          $('li.dropdown', this).off('mouseleave');
          $('a.dropdown-toggle', this).off('click');
          $('a.dropdown-toggle', this).on('click', function (e) {
            e.stopPropagation(); // don't bubble up the event
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
            return false;
          });
        });

        // Toggle Bars for the Navigator
        // jadams 2017-11-01: changed selector for the Navigator
        $('button.navigator.navbar-toggler').each(function(){
          var $this = $(this);
          $this.off('click');
          // Register icon toggle on click event
          $this.on('click', function(){
            // TODO: Animated toggle button
            //
            //$('button.navigator.navbar-toggler.animated').removeClass('fadeIn');
            //$('button.navigator.navbar-toggler.animated').addClass('rotateIn')
            $('.mdi', this).toggleClass('mdi-menu');
            $('.mdi', this).toggleClass('mdi-close');
            cleanOpen();
          });
        });

      } else if ( $getWindow >= breakPoint ) {
      // -----------------------------------------------------------------------
      // Desktop
      // -----------------------------------------------------------------------

        // TODO: Fix delayMenuOpen issue
        // TODO: scrollStart|Stop are to be moved to menu events
        //
        //    var scrollStart     = $('body').removeClass('stop-scrolling');
        //    var scrollStop      = $('body').addClass('stop-scrolling');

        // jadams, 2017-12-39: Workaround. Unclear why delayMenuOpen get lost for image|video headers
        if ( delayMenuOpen === undefined ) { delayMenuOpen = 250; }

        // limit the dropdown menu lenght if needed
        $('.dropdown-menu > li').hover(function() {
          var $container  = $(this);
          var $list       = $container.find('ul');

          // continue on simple dropdowns only (no MM)
          if ( $list.length == 1 ) {
            var height      = $list.height() * 1.1;   // make sure there is valid space at the bottom
            var maxHeight;
            if ( $list.css('max-height') != undefined ) {
              maxHeight     = $list.css('max-height').match(/\d+/)[0];  // get the value of (dropdown) maxHeight
            } else { maxHeight = 200; }
            var tooHeigh    = height / maxHeight;     // calc if the dropdown height exceeds the limit

            // limit the dropdown lenght to maxHeight (permanent)
            if (tooHeigh > 1) {
              $list.css({
                'height': maxHeight,
                'overflow-y': 'auto'
              });
            }
          }
        });

        // Height of scroll navigation sidebar (??? needed ???)
        // jadams: 2019-06-14, since HTML generationof the mnubar changed to "id only" jQuery of '.scroller' cause failures
        // What a hell is: '.scroller' (jQuery Scroller) ???
        //$('.scroller').css('height', $getHeight + 'px');
        // Removed module support this
        //$('body').removeClass('stop-scrolling');

        // jadams 2017-11-01: Menu button (toggler) shown|hide by BS4
        //$(buttonSelector).css('display','block');
        $(menuSelector).removeClass('navbar-collapse'); //.toggleClass(scrollStart);
        // jadams 2017-11-01: class open replaced 'in' by 'show' for BS4
        $(menuSelector).addClass('show');

        // Navbar Sidebar
        if ( $getNav.hasClass('navbar-sidebar')) {

          // Hover Open on Sidebar Menu
          $('nav.navbar.navigator ul.nav').each(function () {

            $('a.dropdown-toggle', this).off('click');
            $('a.dropdown-toggle', this).on('click', function (e) {
              e.stopPropagation(); // don't bubble up the event
            });

            $('.dropdown-menu', this).addClass('animated');
            $('li.dropdown', this).on('mouseenter', function () {
              $('.dropdown-menu', this).eq(0).removeClass($getOut);
              $('.dropdown-menu', this).eq(0).stop().fadeIn().addClass($getIn);
              $(this).addClass('open');
              return false;
            });

            $('.col_menu').each(function () {
              $('.content', this).addClass('animated');
              $('.title', this).on('mouseenter', function () {
                $(this).closest('.col_menu').find('.content').stop().fadeIn().addClass($getIn);
                $(this).closest('.col_menu').addClass('open');
                return false;
              });
            });

            $(this).on('mouseleave', function () {
              $('.dropdown-menu', this).stop().removeClass($getIn);
              $('.dropdown-menu', this).stop().addClass($getOut).fadeOut();
              $('.col_menu', this).find('.content').stop().fadeOut().removeClass($getIn);
              $('.col_menu', this).removeClass('open');
              $('li.dropdown', this).removeClass('open');
              return false;
            });
          }); // fixed
        } // END Navbar Sidebar

        // Hover Open on Default Menu
        $('nav.navbar.navigator ul.nav').each(function() {
          $('a.dropdown-toggle', this).off('click');
          $('a.dropdown-toggle', this).on('click', function (e) {
            e.stopPropagation(); // don't bubble up the event
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
        }); // END Default Menu

      } // end Desktop

      // -----------------------------------------------------------------------
      // Hover Open on Quicklink Navigation
      // -----------------------------------------------------------------------
      $('nav.navbar.navigator .attr-nav').each(function() {

        $('a.dropdown-toggle', this).off('click');
        $('a.dropdown-toggle', this).on('click', function (e) {
          e.stopPropagation(); // don't bubble up the event
        });

        $('.dropdown-menu', this).addClass('animated');
        $('li.dropdown', this).on('mouseenter', function(){
          $('.dropdown-menu', this).eq(0).removeClass($getOut);
          $('.dropdown-menu', this).eq(0).stop().fadeIn().addClass($getIn);
          $(this).addClass('open');
          return false;
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
          return false;
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
            e.stopPropagation(); // don't bubble up the event
            return false;
          });

          $('li.close-full-menu').on('click', function(e){
            e.preventDefault();
            $(getId).addClass($getOut);
            setTimeout(function(){
              $(getId).removeClass('in');
              $(getId).removeClass($getIn);
            }, 500);
            e.stopPropagation(); // don't bubble up the event
            return false;
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

      if( navSticky ){

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
    // Navbar Scrollspy
    // -------------------------------------------------------------------------
    navbarScrollspy : function() {
      var navScrollSpy = $('.navbar-scrollspy'),
        $body   = $('body'),
        $getNav = $('nav.navbar.navigator'),
        offset  = $getNav.outerHeight();

      if( navScrollSpy.length ){
        $body.scrollspy({target: '.navbar', offset: offset });

        // Animation Scrollspy
        $('.scroll').on('click', function(event) {
          event.preventDefault();

          // Active link
          $('.scroll').removeClass('active');
          $(this).addClass('active');

          // Remove navbar collapse
          $('.navbar-collapse').removeClass('in');

          // Toggle Bars
          $('.navbar-toggle').each(function(){
            $('.mdi', this).removeClass('mdi-close');
            $('.mdi', this).addClass('mdi-menu');
          });

          // Scroll
          var scrollTop = $(window).scrollTop(),
            $anchor = $(this).find('a'),
            $section = $($anchor.attr('href')).offset().top,
            $window = $(window).width(),
            $minusDesktop = $getNav.data('minus-value-desktop'),
            $minusMobile = $getNav.data('minus-value-mobile'),
            $speed = $getNav.data('speed'),
            $position;

          if( $window > 992 ){
            $position = $section - $minusDesktop;
          }else{
            $position = $section - $minusMobile;
          }

          $('html, body').stop().animate({
            scrollTop: $position
          }, $speed);
        });

        // Activate Navigation
        var fixSpy = function() {
          var data = $body.data('bs.scrollspy');
          if (data) {
            offset = $getNav.outerHeight();
            data.options.offset = offset;
            $body.data('bs.scrollspy', data);
            $body.scrollspy('refresh');
          }
        };

        // Activate Navigation on resize
        var resizeTimer;
        $(window).on('resize', function() {
          clearTimeout(resizeTimer);
          var resizeTimer = setTimeout(fixSpy, 200);
        });
      }
    } // end navbarScrollspy

  }; // end return (object)
}( jQuery );
