/*
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/modules/scroller/js/scroller.js
 # J1 core module for scroller
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2022 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # For details, see: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE.md
 # -----------------------------------------------------------------------------
 # NOTE: Based on https://github.com/jquery-boilerplate/jquery-boilerplate
 # See:  https://www.dotnetcurry.com/jquery/1069/authoring-jquery-plugins
 # -----------------------------------------------------------------------------
*/

// the semi-colon before function invocation is a SAFETY method
// against concatenated scripts and/or other plugins which may
// NOT be closed properly.
//
;(function($, window, document, undefined) {
  'use strict';

  // plugin defaults
  var pluginName = 'scroller', defaults = {
    type:                 'infiniteScroll',
    scrollOffset:         100,
    elementScroll:        false,
    firstPage:            2,
    lastPage:             false,
    infoLastPage:         false,
    loadStatus:           false,
    onInit:               function () {},                                       // callback after plugin has initialized
    onBeforeLoad:         function () {},                                       // callback before new items are loaded
    onAfterLoad:          function () {}                                        // callback after new items are loaded
  };

  // plugin constructor
  function Plugin (element, options) {
    this.element            = element;
    this.settings           = $.extend( {}, defaults, options);
    this.settings.elementID = '#' + this.element.id;

    // call the initializer
    this.init(this.settings);
  } // END function Plugin

  // avoid plugin prototype conflicts
  $.extend(Plugin.prototype, {

    // -------------------------------------------------------------------------
    // puglin initializer
    // -------------------------------------------------------------------------
    init: function(options) {
      var logger = log4javascript.getLogger('j1.scroller.core');
      var _this  = this;

      logger.debug('\n' + 'initializing plugin: started');
      logger.debug('\n' + 'state: started');

      if (options.elementScroll) {
        _this.scroller = _this.element;
      } else {
        _this.scroller = window;
      }

      // -----------------------------------------------------------------------
      // module initializer
      // -----------------------------------------------------------------------
      var dependencies_met_page_ready = setInterval (function () {
        var pageState       = $('#content').css("display");
        var pageVisible     = (pageState === 'block') ? true: false;
        var j1CoreFinished  = (j1.getState() === 'finished') ? true : false;

        if (j1CoreFinished && pageVisible) {

          // initialize infinite scroll
          if (options.type === 'infiniteScroll') {
            logger.debug('\n' + 'processing mode: ' + options.type);
            logger.debug('\n' + 'loading items from path: ' + options.pagePath);
            logger.debug('\n' + 'monitoring element set to: ' + _this.scroller);
            _this.registerScrollEvent(options);
          }

          // initialize show on scroll
          if (options.type === 'showOnScroll') {
            logger.debug('\n' + 'processing mode: ' + options.type);
            logger.debug('\n' + 'loading items from path: ' + options.pagePath);
            logger.debug('\n' + 'monitoring element set to: ' + _this.scroller);
            _this.registerScrollEvent(options);
          }

          logger.debug('\n' + 'initializing plugin: finished');
          logger.debug('\n' + 'state: finished');

          clearInterval(dependencies_met_page_ready);
        } // END if pageVisible
      }, 25); // END dependencies_met_page_ready
    }, // END init

    // -------------------------------------------------------------------------
    // isInViewport()
    // detects if an element is visible in an viewport specified
    // -------------------------------------------------------------------------
    isInViewport: function (elm, offset) {
      // if the element doesn't exist, abort
    	if( elm.length == 0 ) {
    		return;
    	}

    	var $window          = jQuery(window);
    	var viewport_top     = $window.scrollTop();
    	var viewport_height  = $window.height();
    	var viewport_bottom  = viewport_top + viewport_height;
    	var $elm             = jQuery(elm);
    	var top              = $elm.offset().top + offset;
    	var height           = $elm.height();
    	var bottom           = top + height;

    	return (top >= viewport_top && top < viewport_bottom) ||
    	(bottom > viewport_top && bottom <= viewport_bottom) ||
    	(height > viewport_height && top <= viewport_top && bottom >= viewport_bottom);
    }, // END isInViewport

    // -------------------------------------------------------------------------
    // bottomReached()
    // detect final scroll position
    // NOTE: the calculation for BOTTOM position is different for
    //       elementScroll and windowScroll. For elementScroll, the
    //       trigger isBottomReached is TRUE, if the scroll position has
    //       the end of the container PLUS a given scrollOffset.
    //       For windowScroll, the trigger isBottomReached is TRUE, if
    //       the scroll position has the end of the window MINUS
    //       a given scrollOffset.
    // -------------------------------------------------------------------------
    isBottomReached: function (options) {
      var _this = this;
      var bottom, scrollY;
      var clientHeight = $(options.elementID).height();

      if (_this.settings.elementScroll) {
        // check scroll position of the container items are to be added
        //
        var $window         = $(window);
        var viewport_top    = $window.scrollTop();
        var viewport_height = $window.height();
        var viewport_bottom = viewport_top + viewport_height - options.scrollOffset;
        var $elm            = $(options.elementID);
        var top             = $elm.offset().top + clientHeight;
        var height          = $elm.height();
        bottom              = top + height;

        return (top >= viewport_top && top < viewport_bottom) ||
        (bottom > viewport_top && bottom <= viewport_bottom) ||
        (height > viewport_height && top <= viewport_top && bottom >= viewport_bottom);
      } else {
        // check scroll position of the (overall) window
        return (window.innerHeight + window.pageYOffset + options.scrollOffset >= document.body.offsetHeight);
      } // END if elementScroll
    }, // END isBottomReached

    // -------------------------------------------------------------------------
    // detectScroll()
    // EventHandler to load new items for infinite scroll if final scroll
    // position reached
    // -------------------------------------------------------------------------
    registerScrollEvent: function (options) {
      var logger = log4javascript.getLogger('j1.scroller.core');
      var _this  = this;

      // scroller type 'infiniteScroll'
      if (options.type === 'infiniteScroll') {
        // register event function DYNAMICALLY
        _this[options.id] = function (event) {
          var options = _this.settings;

          if (_this.isBottomReached(options)) {
            if (options.firstPage > options.lastPage ) {
              window.removeEventListener('scroll', _this[options.id]);
              logger.debug('\n' + 'scroll event removed: ' + options.type);

              if (options.infoLastPage ) {
                logger.debug('\n' + 'show last page info');
                _this.infoLastPage(options);
              }
              return false;
            }
            _this.getNewPost(options);
          } // END if BottomReached
        }; // END event

        window.addEventListener('scroll', _this[options.id]);
        logger.debug('\n' + 'scroll event registered: ' + options.type);
      } // END if type infiniteScroll

      // scroller type 'showOnScroll'
      if (options.type === 'showOnScroll') {
        // register event function DYNAMICALLY
        _this[options.id] = function (event) {
          if (_this.isInViewport ($('#' + options.id ), options.scrollOffset)) {
      			logger.debug('\n' + 'specified container is in view: ' + options.id);
            $('.' + options.id).show(options.showDelay);
            window.removeEventListener('scroll', _this[options.id]);
            logger.debug('\n' + 'scroll event showOnScroll: removed');
          } // END if isInViewport
        } // END event

      	window.addEventListener('scroll', _this[options.id]);
        logger.debug('\n' + 'scroll event registered: ' + options.type);
      } // END if type showOnScrol
    }, // END registerScrollEvent

    // -------------------------------------------------------------------------
    // getNewPost()
    // load new items (from current path)
    // Note:  loader flag prevents to load items if AJAX load in progress
    //        is NOT finished
    // -------------------------------------------------------------------------
    getNewPost: function (options) {
      var logger = log4javascript.getLogger('j1.scroller.core');
      var _this  = this;

      logger.debug('\n' + 'loading new posts');

      // initialze loader flag
      if (this.itemsLoaded === false) return false;

      // set loader flag (false == not loaded
      this.itemsLoaded = false;

      // display spinner while loading
      if (options.loadStatus) {
        logger.debug('\n' + 'show: spinner');
        $('.loader-ellips').show();
      }

      var xmlhttp = new XMLHttpRequest();
      xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == XMLHttpRequest.DONE) {
          if (xmlhttp.status == 200) {
            options.firstPage++;
            var childItems = _this.getChildItemsByAjaxHTML(options, xmlhttp.responseText);
            _this.appendNewItems(childItems);

            logger.debug('\n' + 'loading new items: successful');

            // hide the spinner after loading
            if (options.loadStatus) {
                logger.debug('\n' + 'hide: spinner');
                $('.loader-ellips').hide();
            }

            // set loader flag (true == loaded)
            // return _this.itemsLoaded = true;
            _this.itemsLoaded = true;
          } else {
            // hide the spinner
            if (options.loadStatus) {
                logger.debug('\n' + 'hide: spinner');
                $('.loader-ellips').hide();
            }

            logger.error('\n' + 'loading new items failed, HTTP response: ' + xmlhttp.status );
            _this.itemsLoaded = false;
          } // END if xmlhttp. tatus 200
        } // END if if xmlhttp readyState
      }; // END onreadystatechange

      logger.debug('\n' + 'loading new items from path: ' + options.pagePath + options.firstPage);
      xmlhttp.open("GET", location.origin + options.pagePath + options.firstPage + '/index.html', true);

      xmlhttp.send();
    }, // END getNewPost

    // -------------------------------------------------------------------------
    // getChildItemsByAjaxHTML()
    // extract items from page loaded
    // -------------------------------------------------------------------------
    getChildItemsByAjaxHTML: function (options, HTMLText) {
      var logger  = log4javascript.getLogger('j1.scroller.core');
      var newHTML = document.createElement('html');

      logger.debug('\n' + 'load new items');
      newHTML.innerHTML = HTMLText;
      var childItems    = newHTML.querySelectorAll(options.elementID + ' > *');

      return childItems;
    }, // END getChildItemsByAjaxHTML

    // -------------------------------------------------------------------------
    // appendNewItems()
    // append items and run post processing
    // -------------------------------------------------------------------------
    appendNewItems: function (items) {
      var logger          = log4javascript.getLogger('j1.scroller.core');
      var _this           = this;
      var cookie_names    = j1.getCookieNames();
      var user_translate  = j1.readCookie(cookie_names.user_translate);

      items.forEach(function (item) {
        var elmID = _this.element.id
        document.getElementById(elmID).appendChild(item);
        logger.debug('\n' + 'new item appended');
      }); // END forEach

      // no dropcaps if translation enabled
      if (user_translate.translationEnabled) {
        logger.debug('\n' + 'translation enabled: ' + user_translate.translationEnabled);
        logger.debug('\n' + 'skipped processing of dropcaps');
      } else {
        // initialize dropcaps
        logger.debug('\n' + 'post processing: createDropCap');
        j1.core.createDropCap();
      } // END if translationEnabled
    }, // END appendNewItems

    // -------------------------------------------------------------------------
    // infoLastPage()
    // append|show info message on last page (infiniteScroll)
    // -------------------------------------------------------------------------
    infoLastPage: function (options) {
      var message = options.lastPageInfo;

      $(message).insertAfter(options.elementID);
      $('.page-scroll-last').show();

    } // END infoLastPage

  }); // END prototype

  // wrapper around the constructor to prevent multiple instantiations
  $.fn [pluginName] = function(options) {
    return this.each(function() {
      if (!$.data( this, "plugin_" + pluginName)) {
        $.data(this, "plugin_" +
        pluginName, new Plugin(this, options));
      }
    });
  }; // END

})(jQuery, window, document);
