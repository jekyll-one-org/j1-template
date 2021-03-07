/*
 # -----------------------------------------------------------------------------
 #  ~/js/back2top/back2top.js
 #  Scroll-To-Top v.1.1 implementation for J1 Template (Back2Top).
 #
 #  back2top is a jQuery script that adds ability to scroll to an absolute
 #  position (from top of page) or to an specific element on the page.
 #
 #  Product/Info:
 #  https://jekyll.one
 #  http://www.dynamicdrive.com
 #
 #  Copyright (C) 2019 Juergen Adams
 #  Copyright (C) 2009 Dynamic Drive DHTML code library
 #
 #  J1 Template is licensed under the MIT License.
 #  See: https://github.com/jekyll-one-org/j1_template/blob/master/LICENSE
 #  back2top is licensed under the terms of Dynamic Drive DHTML code library.
 #  See: http://www.dynamicdrive.com/notice.htm
 #
 # -----------------------------------------------------------------------------
 #  Author:         Dynamic Drive DHTML & Contributors
 #  Version:        v.1.1
 #  Created:        2009-03-30
 #  Last update:    2009-04-07
 # -----------------------------------------------------------------------------
*/
// bla bb ll mm pp

// -----------------------------------------------------------------------------
// ESLint shimming
// -----------------------------------------------------------------------------
/* eslint no-unused-vars: "off"                                               */
/* eslint no-undef: "off"                                                     */
/* eslint indent: "off"                                                       */
/* global window                                                              */
/* global document                                                            */
/* global jQuery                                                              */
/* global $                                                                   */
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// Back2Top API (core) registered as "back2top"
// -----------------------------------------------------------------------------
// module.exports = function j1Back2Top ( options ) {
module.exports = function back2top ( options ) {
  // Global variables
  var message = {};

  return {

  // ---------------------------------------------------------------------------
  // Initialize API methods (core)
  // ---------------------------------------------------------------------------
  init: function ( options ) {

    // Run on page ready
    jQuery(document).ready(function ($) {
      var $this = back2top();

      $this.$body = (window.opera) ? (document.compatMode == 'CSS1Compat' ? $('html') : $('body')) : $('html,body');
      $this.$button = $('<div id="topcontrol"></div>')
        .css({
          position: options.icon_position ? 'fixed' : 'absolute',
          bottom: options.controlattrs.offsety,
          right: options.controlattrs.offsetx,
          opacity: 0,
          cursor: 'pointer'
        })
        .attr({
          title: 'Scroll Back to Top'
        })
        .click(function () {
          $this.scrollup( options );
          return false;
        })
        .appendTo('body');

      $this.togglecontrol(options);

      $('a[href="' + options.anchorkeyword + '"]').click(function () {
        $this.scrollup( options );
        return false;
      });

      $(window).bind('scroll resize', function () {
        $this.togglecontrol(options);
      });

      message.type    = 'command';
      message.action  = 'module_initialized';
      message.text    = 'Module initialized successfully';
      j1.sendMessage( 'j1.core.back2top', 'j1.adapter.back2top', message );

    });
  }, // END init

  // ---------------------------------------------------------------------------
  // State settings
  // ---------------------------------------------------------------------------
  state: {
    isvisible: false,
    shouldvisible: false
  }, // END state

  // ---------------------------------------------------------------------------
  // scrollup
  // ---------------------------------------------------------------------------
  scrollup: function ( settings ) {
    if (!settings.icon_position)                                                // if button is positioned using JavaScript
      this.$button.css({                                                        // hide button immediately if clicked
        opacity: 0
      });
    var dest = isNaN(settings.scrollto) ? settings.scrollto : parseInt(settings.scrollto);
    if (typeof dest === 'string' && jQuery('#' + dest).length == 1)             // check element set by string exists
      dest = jQuery('#' + dest).offset().top;
    else
      dest = 0;
    this.$body.animate({
      scrollTop: dest
    }, settings.scrollduration);
  }, // END scrollup

  // ---------------------------------------------------------------------------
  // keepfixed
  // ---------------------------------------------------------------------------
  keepfixed: function ( settings ) {
    var $window = jQuery(window);
    var controlx = $window.scrollLeft() + $window.width() - this.$button.width() - settings.controlattrs.offsetx;
    var controly = $window.scrollTop() + $window.height() - this.$button.height() - settings.controlattrs.offsety;

    this.$button.css({
      left: controlx + 'px',
      top:  controly + 'px'
    });
  }, // END keepfixed

  // ---------------------------------------------------------------------------
  // togglecontrol
  // ---------------------------------------------------------------------------
  togglecontrol: function ( settings ) {
    var scrolltop = jQuery(window).scrollTop();

    if (!settings.icon_position)
      this.keepfixed(settings);
    this.state.shouldvisible = (scrolltop >= settings.startline) ? true : false;
    if (this.state.shouldvisible && !this.state.isvisible) {
      this.$button.stop().animate({
        opacity: 1
      }, settings.fadeduration.fadeIn);
      this.state.isvisible = true;
    } else if (this.state.shouldvisible == false && this.state.isvisible) {
      this.$button.stop().animate({
        opacity: 0
      }, settings.fadeduration.fadeOut);
      this.state.isvisible = false;
    }
  } // END togglecontrol

}; // END return
}( jQuery );
