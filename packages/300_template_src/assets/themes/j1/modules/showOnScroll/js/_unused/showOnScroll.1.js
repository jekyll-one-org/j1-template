/*
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/infiniteScroll.js
 # J1 Adapter for infiniteScroll
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

function isOnScreen(elem) {
	// if the element doesn't exist, abort
	if( elem.length == 0 ) {
		return;
	}
	var $window = jQuery(window)
	var viewport_top = $window.scrollTop()
	var viewport_height = $window.height()
	var viewport_bottom = viewport_top + viewport_height
	var $elem = jQuery(elem)
	var top = $elem.offset().top
	var height = $elem.height()
	var bottom = top + height

	return (top >= viewport_top && top < viewport_bottom) ||
	(bottom > viewport_top && bottom <= viewport_bottom) ||
	(height > viewport_height && top <= viewport_top && bottom >= viewport_bottom)
}

var someEventHander = function(event) {
  // Pass element selector you want to check
  if( isOnScreen( jQuery( '#home_intro_panel' ) ) ) {
    console.log( 'The specified container is in view.' );
  }
  // document.getElementById("home_intro_panel").removeEventListener('scroll',someEventHander);
}

jQuery( document ).ready( function() {
	window.getElementById("home_intro_panel").addEventListener('scroll', someEventHander);
});
