/*
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/modules/j1Scroll/js/j1scroll.js
 # J1 core module for j1scroll
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2021 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # For details, see https://jekyll.one
 # -----------------------------------------------------------------------------
*/

// the semi-colon before function invocation is a SAFETY method against
// concatenated scripts and/or other plugins which may NOT be closed
// properly.
//
;(function($, window, document, undefined) {

	'use strict';

	// undefined is used here as the undefined global variable in ECMAScript 3 is
	// mutable (ie. it can be changed by someone else). undefined isn't really being
	// passed in so we can ensure the value of it is truly undefined. In ES5, undefined
	// can no longer be modified.

	// window and document are passed through as local variable rather than global
	// as this (slightly) quickens the resolution process and can be more efficiently
	// minified (especially when both are regularly referenced in your plugin).

	// Create the defaults once
	var pluginName = 'j1Scroll',
	defaults = {
	    type:               'infiniteScroll',
	    scrollThreshold:    100,
	    elementScroll:      false,
	    pNum:               2,
	    pMaxNum:            6,
	    enable:             true,
	};

	// Plugin constructor
	function Plugin (element, options) {
		this.element            = element;
		this.settings           = $.extend( {}, defaults, options);
		this.settings.elementID = this.element["id"]
		this._defaults          = defaults;
		this._name              = pluginName;

		// call the initializer
		this.init(this.settings);
	}

	// Avoid Plugin.prototype conflicts
	//
	$.extend(Plugin.prototype, {
		// -----------------------------------------------------------------------
		// init: initializer
		//
		// -----------------------------------------------------------------------
		init: function(options) {
		  var logger = log4javascript.getLogger('j1.core.j1Scroll');

			if ( this.settings.elementScroll ) {
				this.scroller = this.element;
			} else {
				this.scroller = window;
			}

		  logger.info('\n' + 'initializing core module: started');
			logger.info('\n' + 'state: started');

		  // initialize infinite scroll
		  if ( options.type === 'infiniteScroll') {
		      this.detectScroll(options);
		  }
		},
		// -----------------------------------------------------------------------
		// bottomReached: detect final scroll position
		//
		// -----------------------------------------------------------------------
		isBottomReached: function (options) {
		  var _this = this;
		  let bottom, scrollY;
			var clientHeight = $('#' + options.elementID).height();

		  if ( _this.settings.elementScroll ) {
				var $window = $(window);
				var viewport_top = $window.scrollTop();
				var viewport_height = $window.height();
				var viewport_bottom = viewport_top + viewport_height;
				var $elm = $('#' + options.elementID);
				var top = $elm.offset().top + clientHeight;
				var height = $elm.height();
				// bottom = top + height - options.scrollThreshold
				bottom = top + height;

				return (top >= viewport_top && top < viewport_bottom) ||
				(bottom > viewport_top && bottom <= viewport_bottom) ||
				(height > viewport_height && top <= viewport_top && bottom >= viewport_bottom);
		  } else {
				return (window.innerHeight + window.pageYOffset + options.scrollThreshold >= document.body.offsetHeight);
		  }
		},
		// -----------------------------------------------------------------------
		// detectScroll: EventHandler to load new items for infinite scroll
		// if final scroll position reached
		// -----------------------------------------------------------------------
		detectScroll: function (options) {
		  var _this = this;
		  var logger = log4javascript.getLogger('j1.core.j1Scroll.detectScroll');

		  logger.info('\n' + 'detectScroll: started');

		  window.onscroll = function (ev) {
				var bottomReached = _this.isBottomReached(options);
				if (bottomReached) _this.getNewPost(options);
		  };
		},
		// -----------------------------------------------------------------------
		// getNewPost: load/append new items
		//
		// -----------------------------------------------------------------------
		getNewPost: function (options) {
		  var _this = this;

		  if (options.pNum >= options.pMaxNum ) {
		    return;
		  }
		  if (this.enable === false) return false;
		  this.enable = false;
		  var xmlhttp = new XMLHttpRequest();
		  xmlhttp.onreadystatechange = function () {
		    if (xmlhttp.readyState == XMLHttpRequest.DONE) {
		      if (xmlhttp.status == 200) {
		        options.pNum++;
		        var childItems = _this.getChildItemsByAjaxHTML(options, xmlhttp.responseText);
		        _this.appendNewItems(childItems);
		      }
		      return _this.enable = true;
		    }
		  };
		  xmlhttp.open("GET", location.origin + options.path + options.pNum + '/index.html', true);
		  xmlhttp.send();
		},
		// -----------------------------------------------------------------------
		// getChildItemsByAjaxHTML:
		//
		// -----------------------------------------------------------------------
		getChildItemsByAjaxHTML: function (options, HTMLText) {
		  var newHTML = document.createElement('html');

		  newHTML.innerHTML = HTMLText;
		  var childItems = newHTML.querySelectorAll('#' + options.elementID + ' > *');
		  return childItems;
		},
		// -----------------------------------------------------------------------
		// appendNewItems:
		//
		// -----------------------------------------------------------------------
		appendNewItems: function (items) {
		  var _this = this;

		  items.forEach(function (item) {
		    _this.element.appendChild(item);
		  });

			// initialize backdrops
			j1.core.createDropCap();
		}

	}); // END prototype

	// lightweight plugin wrapper around the constructor,
	// preventing multiple instantiations
	//
	$.fn [pluginName] = function(options) {
	  return this.each(function() {
	      if (!$.data( this, "plugin_" + pluginName)) {
	          $.data(this, "plugin_" +
	              pluginName, new Plugin(this, options));
	      }
	  });
	};

})(jQuery, window, document);
