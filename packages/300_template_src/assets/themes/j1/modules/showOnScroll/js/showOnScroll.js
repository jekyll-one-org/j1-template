/*
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/modules/showOnScroll/js/showOnScroll.js
 # Very simple J1 implementation for showOnScroll
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
// -------------------------------------------------------------------------
// isInViewport:
// Detects if an element is visible in an viewport specified
// -------------------------------------------------------------------------
function isInViewport(elm, offset) {
	// if the element doesn't exist, abort
	if( elm.length == 0 ) {
		return;
	}
	var $window = jQuery(window);
	var viewport_top = $window.scrollTop();
	var viewport_height = $window.height();
	var viewport_bottom = viewport_top + viewport_height;
	var $elm = jQuery(elm);
	var top = $elm.offset().top + offset;
	var height = $elm.height();
	var bottom = top + height;

	return (top >= viewport_top && top < viewport_bottom) ||
	(bottom > viewport_top && bottom <= viewport_bottom) ||
	(height > viewport_height && top <= viewport_top && bottom >= viewport_bottom);
}

// -----------------------------------------------------------------------------
// Initializer
// -----------------------------------------------------------------------------
$(document).ready( function() {

  var showDelay =   700;
  var yOffset 	=  500;
	var logger  	= log4javascript.getLogger('j1ShowOnScroll');

	// ---------------------------------------------------------------------------
	// EventHandler: Service Panel
	// ---------------------------------------------------------------------------
  var eventHandler_service_panel = function (event) {
    if (isInViewport ($('#home_service_panel'), yOffset)) {
			logger.info('\n' + 'specified container is in view: home_service_panel');
      $(".home_service_panel").show(showDelay);
			logger.info('\n' + 'remove eventHandler');
      window.removeEventListener('scroll', eventHandler_service_panel);
    }
  }
	window.addEventListener('scroll', eventHandler_service_panel);

	// ---------------------------------------------------------------------------
	// EventHandler: Intro Panel
	// ---------------------------------------------------------------------------
	var eventHandler_intro_panel = function (event) {
		if (isInViewport ($('#home_intro_panel'), yOffset)) {
			logger.info('\n' + 'specified container is in view: home_intro_panel');
			$(".home_intro_panel").show(showDelay);
			logger.info('\n' + 'remove eventHandler');
			window.removeEventListener('scroll', eventHandler_intro_panel);
		}
	}
	window.addEventListener('scroll', eventHandler_intro_panel);

});
