/*
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/modules/navigator/navigator.js (3)
 # Provides all JavaScript core functions for J1 Navigator
 #
 # Product/Info:
 # https://jekyll.one
 # https://github.com/adamnurdin01/bootsnav
 #
 # Copyright (C) 2023-2026 Juergen Adams
 # Copyright (C) 2016 adamnurdin01
 #
 # J1 Theme is licensed under MIT License.
 # See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE.txt
 # Bootsnav is licensed under MIT License.
 # See: https://github.com/adamnurdin01/bootsnav/blob/master/LICENSE.txt
 #
 # -----------------------------------------------------------------------------
*/

// -----------------------------------------------------------------------------
// ESLint shimming
// -----------------------------------------------------------------------------
/* eslint indent: "off"                                                       */
/* eslint no-unused-vars: "off"                                               */
/* eslint no-undef: "off"                                                     */
// -----------------------------------------------------------------------------

'use strict';
// -----------------------------------------------------------------------------
// Fix J1 Navigator issue #1
// Navigator core registered as 'j1.api.navigator'
// -----------------------------------------------------------------------------
//
window.j1     = window.j1     || {};
window.j1.api = window.j1.api || {};

window.j1.api.navigator = (function navigator(options) {

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
  // Fix J1 Navigator issue #3
  // Private state and helpers for the "active" menu item management
  //
  // Background:
  // Fix #2 registered a DELEGATED click handler on 'nav.navbar.navigator' that
  // marks the clicked li.dropdown-item as "active". Two gaps were flagged for
  // review by that fix and are closed here:
  //
  //   (1) The "active" class did NOT survive navigation. Each dropdown item
  //       loads a new page, so the class set on click is gone on page load.
  //       Closed by restoreActiveMenuItem(), matching the href of all menu
  //       items against window.location.pathname on load.
  //
  //   (2) The MOBILE menu (mmenu-light) was NOT covered. Verified against
  //       ~/assets/theme/j1/modules/mmenu_light/js/mmenu.js: the plugin
  //       method offcanvas() MOVES the menu node out of its original
  //       container into the off-canvas drawer (div.mm-ocd__content, a direct
  //       child of <body>) whenever the media query matches, and moves it
  //       back when it does not. The mobile menu is therefore NEVER inside
  //       'nav.navbar.navigator', and a handler scoped to that element can
  //       not see it. Closed by scoping the handler to the DOCUMENT and
  //       filtering on the href of the clicked item instead of on a fixed
  //       container.
  //
  // NOTE: Items are matched by their normalized link path. Desktop and mobile
  // render the SAME menu, so BOTH copies of the current page's item are marked
  // active. This is intentional: whichever menu the user opens shows the
  // correct state.
  // ---------------------------------------------------------------------------
  //
  var activeItemUserSet       = false;
  var activeItemObserver      = null;
  var activeItemRestoreTimer  = null;
  var activeItemInitialized   = false;

  // ---------------------------------------------------------------------------
  // Fix J1 Navigator issue #3
  // Normalize a URL path for comparison
  //
  // Removes the query string and the fragment, collapses duplicate slashes,
  // drops a trailing 'index.html|index.htm' and drops a trailing slash. The
  // root path '/' is kept as is.
  // ---------------------------------------------------------------------------
  function j1NavNormalizePath (path) {
    var normalized = path || '';

    try {
      normalized = decodeURI(normalized);
    } catch (e) {
      // keep the raw (not decodable) value
    }

    normalized = normalized.split('#')[0];
    normalized = normalized.split('?')[0];
    normalized = normalized.replace(/\/{2,}/g, '/');
    normalized = normalized.replace(/\/index\.html?$/i, '/');

    if (normalized.length > 1) {
      normalized = normalized.replace(/\/+$/, '');
    }
    if (normalized === '') {
      normalized = '/';
    }

    return normalized;
  }

  // ---------------------------------------------------------------------------
  // Fix J1 Navigator issue #3
  // Resolve the normalized path of an anchor element
  //
  // Returns 'null' for all links that do NOT navigate to a page of this site:
  // empty links, in-page links ('#', '#anchor'), pseudo protocols
  // (javascript:, mailto:, tel:, data:) and cross-origin links. The DOM
  // property 'pathname' is used, so RELATIVE links and a Jekyll 'baseurl'
  // are resolved by the browser against the document base.
  // ---------------------------------------------------------------------------
  function j1NavAnchorPath (anchorElement) {
    var href;

    if (!anchorElement || !anchorElement.getAttribute) {
      return null;
    }

    href = anchorElement.getAttribute('href');
    if (!href) {
      return null;
    }

    href = href.replace(/^\s+|\s+$/g, '');
    if (href === '' || href.charAt(0) === '#') {
      return null;
    }
    if (/^(javascript|mailto|tel|data|blob):/i.test(href)) {
      return null;
    }
    if (anchorElement.protocol && !/^https?:$/i.test(anchorElement.protocol)) {
      return null;
    }
    if (anchorElement.host && anchorElement.host !== window.location.host) {
      return null;
    }

    return j1NavNormalizePath(anchorElement.pathname || '');
  }

  // ---------------------------------------------------------------------------
  // Fix J1 Navigator issue #3
  // Collect all menu items of the given scope that link to a page
  //
  // The class 'dropdown-item' is carried by the LI element in J1 menus, but
  // Bootstrap places it on the A element. Both variants are supported: the
  // element carrying the class is the element the class 'active' is set on,
  // the (first) contained A element supplies the link.
  //
  // Items WITHOUT a navigable link (e.g. the theme switcher that uses
  // href="#") are skipped entirely, so they are neither marked nor cleared.
  // ---------------------------------------------------------------------------
  function j1NavCollectItems (scopeSelector) {
    var $scope  = $(scopeSelector || 'body');
    var items   = [];

    $scope.find('.dropdown-item').each(function () {
      var $item   = $(this);
      var $anchor = $item.is('a[href]') ? $item : $item.find('a[href]').first();
      var path;

      if (!$anchor.length) {
        return;
      }

      path = j1NavAnchorPath($anchor.get(0));
      if (!path) {
        return;
      }

      items.push({ element: this, path: path });
    });

    return items;
  }

  // ---------------------------------------------------------------------------
  // Fix J1 Navigator issue #3
  // Find the menu path that matches the current page best
  //
  // An EXACT match always wins. If no item matches exactly and the prefix
  // fallback is enabled, the LONGEST item path the current page lies below is
  // used, so that e.g. a post '/pages/public/blog/articles/my-post' still
  // highlights the menu item '/pages/public/blog'. The match is taken on a
  // path SEGMENT boundary only, so '/blog' never matches '/blogroll'.
  // ---------------------------------------------------------------------------
  function j1NavBestMatch (items, currentPath, prefixFallback) {
    var bestPath   = null;
    var bestLength = -1;
    var index;
    var path;

    for (index = 0; index < items.length; index++) {
      if (items[index].path === currentPath) {
        return items[index].path;
      }
    }

    if (!prefixFallback) {
      return null;
    }

    for (index = 0; index < items.length; index++) {
      path = items[index].path;
      if (path.length > 1
        && currentPath.indexOf(path + '/') === 0
        && path.length > bestLength) {
        bestPath   = path;
        bestLength = path.length;
      }
    }

    return bestPath;
  }

  // ---------------------------------------------------------------------------
  // Fix J1 Navigator issue #3
  // Set the class 'active' on all items of the given path, remove it from all
  // other collected items. Only items collected by j1NavCollectItems() are
  // touched.
  // ---------------------------------------------------------------------------
  function j1NavApplyActive (items, path) {
    var index;
    var count = 0;

    for (index = 0; index < items.length; index++) {
      if (items[index].path === path) {
        $(items[index].element).addClass('active');
        count = count + 1;
      } else {
        $(items[index].element).removeClass('active');
      }
    }

    return count;
  }

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
      this.eventHandler(defaultOptions);
      this.initActiveMenuItems();

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

      // bind click event to all HTML elements of class '.badge' (Bootstrap)
      // for smooth-scroll (in-page) to a '<div>' element
      // -----------------------------------------------------------------------
      $('.badge').on('click', function (e) {
        anchor_id    = e.target.hash ? e.target.hash : false;
        scrollOffset = 100;

        if (anchor_id) {
          logger.debug('\n' + 'click event on badge detected: ' + anchor_id);
          $('html, body').animate({
            scrollTop: $(anchor_id).offset().top - scrollOffset
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

        // create array of all posts in lists
        index.find('ul.navbar-nav > li').each(function(){
          postsArr.push($(this).html());
        });

        // split the array at this point. The original array is altered.
        var firstList   = postsArr.splice(0, Math.round(postsArr.length / 2));
        var secondList  = postsArr;
        var ListHTML    = '';

        var createHTML = function(list) {
          ListHTML = '';
          for (var i = 0; i < list.length; i++) {
            ListHTML += '<li>' + list[i] + '</li>';
          }
        };

        // generate HTML for first list
        createHTML(firstList);
        $postsList.html(ListHTML);
        index.find('ul.nav').first().addClass('navbar-left');

        // generate HTML for second list
        createHTML(secondList);
        // create new list after original one
        $postsList.after('<ul class="nav navbar-nav"></ul>').next().html(ListHTML);
        index.find('ul.nav').last().addClass('navbar-right');

        // wrap navigation menu
        index.find('ul.nav.navbar-left').wrap('<div class=\'col_half left\'></div>');
        index.find('ul.nav.navbar-right').wrap('<div class=\'col_half right\'></div>');

        // selection Class
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
        // add Class to body
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
        // site_search
        //
        if ($('li.site_search')) {

          logger.debug('register OPEN event for site_search');

          $('li.site_search > a', this).on('click', function(e) {
            logger.debug('manage search action OPEN');
            $('#searchModal').modal('show');
          });

        } // END site_search

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

        // collapse Navbar (Desktop Navigation)
        $(menuSelector).addClass('navbar-collapse');
        $(menuSelector).removeClass('show');

        // show QuicklinksBar
        $(quicklinksSelector).addClass('show');

      // -----------------------------------------------------------------------
      // Desktop Navigation does NOT work on physical devices like iPad|Pro
      // Config DISABLED
      //
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

        // open Desktop Menu|s on hover
        $('nav.navbar.navigator ul.nav').each(function() {

          $('a.dropdown-toggle', this).off('click');

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

            // create a timeout object to delay the dropdown menus to open
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

            // clear the timeout object for dropdown menus 'open'
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
          });

          $('li.close-full-menu').on('click', function(e) {
            e.preventDefault();
            $(getId).addClass($getOut);
            setTimeout(function(){
              $(getId).removeClass('in');
              $(getId).removeClass($getIn);
            }, 500);
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
        // set height navigation
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
    // Fix J1 Navigator issue #3
    // Configuration for the "active" menu item management
    //
    // activeItemScopeSelector:
    //   The DOM scope scanned for menu items. The default 'body' covers the
    //   desktop navbar AND the mobile menu, INCLUDING the state where the
    //   mmenu-light plugin has moved the menu node into its off-canvas drawer
    //   (div.mm-ocd, a direct child of <body>). Narrow it down (e.g. to
    //   'nav.navbar.navigator, .mm-ocd') only if other Bootstrap dropdowns on
    //   the page must be excluded.
    //
    // activeItemPrefixFallback:
    //   If 'true' (default) and no menu item matches the current page
    //   exactly, the menu item of the closest PARENT path is marked active.
    //   Set to 'false' for exact matches only.
    // -------------------------------------------------------------------------
    activeItemScopeSelector:  'body',
    activeItemPrefixFallback: true,

    // -------------------------------------------------------------------------
    // Fix J1 Navigator issue #3
    // Restore the "active" menu item for the CURRENT page
    //
    // Closes review item (1) of fix #2: the class 'active' set on click does
    // not survive the page load triggered by that very click. This method
    // re-derives the state from window.location.pathname instead.
    //
    // Returns 'true' if a matching item was found and marked.
    // -------------------------------------------------------------------------
    restoreActiveMenuItem: function (scopeSelector) {
      var currentPath = j1NavNormalizePath(window.location.pathname);
      var scope       = scopeSelector || this.activeItemScopeSelector;
      var items       = j1NavCollectItems(scope);
      var matchedPath;
      var marked;

      if (!items.length) {
        return false;
      }

      matchedPath = j1NavBestMatch(
        items, currentPath, this.activeItemPrefixFallback
      );

      if (!matchedPath) {
        return false;
      }

      marked = j1NavApplyActive(items, matchedPath);

      if (logger) {
        logger.debug('\n' + 'active menu item restored: ' + matchedPath
          + ' (' + marked + ' item|s marked)');
      }

      return true;
    }, // END restoreActiveMenuItem

    // -------------------------------------------------------------------------
    // Fix J1 Navigator issue #3
    // Initialize the "active" menu item management
    //
    // Registers ONE delegated click handler on the DOCUMENT (closing review
    // item (2) of fix #2: the mobile mmenu-light menu is moved OUT of
    // 'nav.navbar.navigator' into the off-canvas drawer, so a handler bound
    // to the NAV element can never see it), runs an initial restore and
    // watches the DOM for menus that arrive later by AJAX (j1.loadHTML) or
    // that are moved around by the mmenu-light media query toggler.
    //
    // NOTE: The handler is IDEMPOTENT with respect to the handler installed
    // by fix #2 on 'nav.navbar.navigator'. Both compute the same final state
    // for a desktop click, so fix #2 can stay in place unchanged.
    // -------------------------------------------------------------------------
    initActiveMenuItems: function () {
      var _self       = this;
      var observeTime = 30000;

      if (activeItemInitialized) {
        return true;
      }
      activeItemInitialized = true;

      // delegated click handler, valid for desktop AND mobile menus
      $(document).off('click.j1navActiveItem');
      $(document).on('click.j1navActiveItem', '.dropdown-item', function () {
        var $item   = $(this);
        var $anchor = $item.is('a[href]')
                        ? $item
                        : $item.find('a[href]').first();
        var path;

        if (!$anchor.length) {
          return;
        }

        // ignore items that do NOT navigate to a page of this site
        // (e.g. the theme switcher items using href="#")
        path = j1NavAnchorPath($anchor.get(0));
        if (!path) {
          return;
        }

        // mark the clicked item AND its twin in the other (desktop|mobile)
        // rendering of the same menu, clear all other items
        j1NavApplyActive(
          j1NavCollectItems(_self.activeItemScopeSelector), path
        );

        activeItemUserSet = true;
      });

      // initial restore for the menus already present
      _self.restoreActiveMenuItem();

      // re-run the restore for menus loaded (AJAX) or moved (mmenu) later
      if (window.MutationObserver && document.body) {
        activeItemObserver = new MutationObserver(function () {
          if (activeItemUserSet) {
            return;
          }
          window.clearTimeout(activeItemRestoreTimer);
          activeItemRestoreTimer = window.setTimeout(function () {
            _self.restoreActiveMenuItem();
          }, 50);
        });

        // NOTE: only 'childList' is observed. Setting the class 'active' is
        // an ATTRIBUTE mutation and can NOT re-trigger the observer.
        activeItemObserver.observe(document.body, {
          childList: true,
          subtree:   true
        });

        // stop watching after all menus had a fair chance to load
        window.setTimeout(function () {
          if (activeItemObserver) {
            activeItemObserver.disconnect();
            activeItemObserver = null;
          }
        }, observeTime);
      }

      return true;
    }, // END initActiveMenuItems

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

      // replace macro placeholders to values
      j1.resolveMacros(user_data);
      // replace macro values only
      j1.updateMacros(user_data);

      return true;

    }, // END updateSidebar

  }; // end return (object)

}(window.j1.api.navigator || {}));