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

	// The actual plugin constructor
	function Plugin (element, options) {
		// jQuery has an extend method which merges the contents of two or
		// more objects, storing the result in the first object. The first object
		// is generally empty as we don't want to alter the default options for
		// future instances of the plugin
		//
		this.element            = element;
		this.settings           = $.extend( {}, defaults, options);
		this.settings.elementID = '#' + this.element["id"];
		this._defaults          = defaults;
		this._name              = pluginName;

		var proto           		= pluginName.prototype;

		// call the initializer
		//
		this.init(this.settings);
	}

	// Avoid Plugin.prototype conflicts
	//
	$.extend( Plugin.prototype, {
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

			// initialize infinite scroll
			if (options.type === 'infiniteScroll')
				logger.info('\n' + 'initializing: infinite scroll');
			  this.detectScroll(options);
			}
		},
		// -----------------------------------------------------------------------
		// isBottomReached: checks if final scroll position is reached for
		// selected element (windows|container)
		// -----------------------------------------------------------------------
		isBottomReached: function isBottomReached(options) {
		  var _this = this;
		  let bottom, scrollY;
			var clientHeight = $(options.elementID).height();

		  if ( _this.settings.elementScroll ) {
				var $window = $(window);
				var viewport_top = $window.scrollTop();
				var viewport_height = $window.height();
				var viewport_bottom = viewport_top + viewport_height;
				var $elm = $(options.elementID);
				var top = $elm.offset().top + clientHeight;
				var height = $elm.height();
				bottom = top + height + options.scrollThreshold;

				return (top >= viewport_top && top < viewport_bottom) ||
				(bottom > viewport_top && bottom <= viewport_bottom) ||
				(height > viewport_height && top <= viewport_top && bottom >= viewport_bottom);
		  } else {
				return (window.innerHeight + window.pageYOffset + options.scrollThreshold >= document.body.offsetHeight);
		  }
		},
		// -----------------------------------------------------------------------
		// detectScroll: Register EventHandler to detect scroll position
		// -----------------------------------------------------------------------
		detectScroll: function detectScroll(options) {
		  var _this = this;
		  var logger = log4javascript.getLogger('j1.core.j1Scroll.detectScroll');

		  logger.info('\n' + 'register onscroll eventhendler');
		  window.onscroll = function (ev) {
				if (_this.isBottomReached(options)) {
					_this.getNewPost(options);
				}
		  };
		},
		// -----------------------------------------------------------------------
		// getNewPost:
		//
		// -----------------------------------------------------------------------
		getNewPost: function getNewPost(options) {
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
		getChildItemsByAjaxHTML: function getChildItemsByAjaxHTML(options, HTMLText) {
		  var newHTML = document.createElement('html');

		  newHTML.innerHTML = HTMLText;
		  var childItems = newHTML.querySelectorAll(options.elementID + ' > *');
		  return childItems;
		},
		// -----------------------------------------------------------------------
		// appendNewItems:
		//
		// -----------------------------------------------------------------------
		appendNewItems: function appendNewItems(items) {
		  var _this = this;

		  items.forEach(function (item) {
		    _this.element.appendChild(item);
		  });
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
