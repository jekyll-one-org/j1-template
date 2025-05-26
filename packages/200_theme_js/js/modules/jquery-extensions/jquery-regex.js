/*
 # -----------------------------------------------------------------------------
 #  ~/200_theme_js/js/jquery-extensions/jquery-regex.js
 #  Provides additional jQuery functions
 #
 #  Product/Info:
 #  https://jekyll.one
 #
 #  Copyright (C) 2023-2025 Juergen Adams
 #
 #  J1 Theme is licensed under MIT License.
 #  See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 # -----------------------------------------------------------------------------
*/
'use strict';

// -----------------------------------------------------------------------------
// ESLint shimming
// -----------------------------------------------------------------------------
/* eslint indent: "off"                                                       */
/* eslint no-extra-semi: "off"                                                */
/* eslint no-unused-vars: "off"                                               */
/* eslint no-undef: "off"                                                     */
// -----------------------------------------------------------------------------

;(function(hasClass) {

	jQuery.fn.hasClass = function hasClassRegExp( selector ) {
		if ( selector && typeof selector.test === 'function' ) {
			for ( var i = 0, l = this.length; i < l; i++ ) {
				var classNames = this[i].className.split( /\s+/ );
				for ( var c = 0, cl = classNames.length; c < cl; c++ ) {
					if (selector.test( classNames[c]) ) {
						return true;
					}
				}
			}
            return false;
		} else {
			return hasClass.call(this, selector);
		}
	};

})(jQuery.fn.hasClass);

;(function(removeClass) {

	jQuery.fn.removeClass = function( value ) {
		if ( value && typeof value.test === 'function' ) {
			for ( var i = 0, l = this.length; i < l; i++ ) {
				var elem = this[i];
				if ( elem.nodeType === 1 && elem.className ) {
					var classNames = elem.className.split( /\s+/ );

					for ( var n = classNames.length; n--; ) {
						if ( value.test(classNames[n]) ) {
							classNames.splice(n, 1);
						}
					}
					elem.className = jQuery.trim( classNames.join(' ') );
				}
			}
		} else {
			removeClass.call(this, value);
		}
		return this;
	};

})(jQuery.fn.removeClass);
