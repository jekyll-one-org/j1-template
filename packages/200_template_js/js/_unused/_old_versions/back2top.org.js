/*
 # -----------------------------------------------------------------------------
 #  ~/js/back2top/back2top.js
 #  Scroll-To-Top v.1.1 implementation for J1 Template (back2top).
 #
 #  back2top is a jQuery script that adds ability to scroll to an absolute
 #  position (from top of page) or to an specific element on the page.
 #
 #  Product/Info:
 #  https://jekyll.one
 #  http://www.dynamicdrive.com
 #
 #  Copyright (C) 2021 Juergen Adams
 #  Copyright (C) 2009 Dynamic Drive DHTML code library
 #
 #  J1 Template is licensed under MIT License.
 #  See: https://github.com/jekyll-one-org/J1 Template/blob/master/LICENSE
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
// bla bb ll mm kk pp

// -----------------------------------------------------------------------------
// ESLint shimming
// -----------------------------------------------------------------------------
/* eslint indent: "off"                                                       */


/* global jQuery                                                              */
// -----------------------------------------------------------------------------

var scrolltotop = {

  // ---------------------------------------------------------------------------
  // Default settings
  // ---------------------------------------------------------------------------
  settings: {
    startline: 100,
    scrollto: 0,
    scrollduration: 1000,
    fadeduration: [500, 100]
  }, // END setting

  //  HTML for control, which is auto wrapped in DIV w/ ID="topcontrol"
  controlHTML: '', //<img src="assets/img/up.png" style="width:51px; height:42px" />

  controlattrs: {
    offsetx: 5,
    offsety: 5
  }, // END controlattrs

  //  Offset of control relative to right/ bottom of window corner
  //  Enter href value of HTML anchors on the page that should also act as "Scroll Up" links
  anchorkeyword: '#top',

  state: {
    isvisible: false,
    shouldvisible: false
  }, // END state

  // ---------------------------------------------------------------------------
  // scrollup
  // ---------------------------------------------------------------------------
  scrollup: function () {
    if (!this.cssfixedsupport) //if control is positioned using JavaScript
      this.$control.css({
        opacity: 0
      }); //hide control immediately after clicking it
    var dest = isNaN(this.settings.scrollto) ? this.settings.scrollto : parseInt(this.settings.scrollto);
    if (typeof dest === 'string' && jQuery('#' + dest).length == 1) //check element set by string exists
      dest = jQuery('#' + dest).offset().top;
    else
      dest = 0;
    this.$body.animate({
      scrollTop: dest
    }, this.settings.scrollduration);
  }, // END scrollup

  // ---------------------------------------------------------------------------
  // keepfixed
  // ---------------------------------------------------------------------------
  keepfixed: function () {
    var $window = jQuery(window);
    var controlx = $window.scrollLeft() + $window.width() - this.$control.width() - this.controlattrs.offsetx;
    var controly = $window.scrollTop() + $window.height() - this.$control.height() - this.controlattrs.offsety;

    this.$control.css({
      left: controlx + 'px',
      top: controly + 'px'
    });
  }, // END keepfixed

  // ---------------------------------------------------------------------------
  // togglecontrol
  // ---------------------------------------------------------------------------
  togglecontrol: function () {
    var scrolltop = jQuery(window).scrollTop();

    if (!this.cssfixedsupport)
      this.keepfixed();
    this.state.shouldvisible = (scrolltop >= this.settings.startline) ? true : false;
    if (this.state.shouldvisible && !this.state.isvisible) {
      this.$control.stop().animate({
        opacity: 1
      }, this.settings.fadeduration[0]);
      this.state.isvisible = true;
    } else if (this.state.shouldvisible == false && this.state.isvisible) {
      this.$control.stop().animate({
        opacity: 0
      }, this.settings.fadeduration[1]);
      this.state.isvisible = false;
    }
  }, // END togglecontrol

  // ---------------------------------------------------------------------------
  // Initialize Back2Top (Core)
  // ---------------------------------------------------------------------------
  init: function () {

    jQuery(document).ready(function ($) {
      var mainobj   = scrolltotop;
      var iebrws    = document.all;

      mainobj.cssfixedsupport = !iebrws || iebrws && document.compatMode == 'CSS1Compat' && window.XMLHttpRequest; //not IE or IE7+ browsers in standards mode
      mainobj.$body = (window.opera) ? (document.compatMode == 'CSS1Compat' ? $('html') : $('body')) : $('html,body');
      mainobj.$control = $('<div id="topcontrol">' + mainobj.controlHTML + '</div>')
        .css({
          position: mainobj.cssfixedsupport ? 'fixed' : 'absolute',
          bottom: mainobj.controlattrs.offsety,
          right: mainobj.controlattrs.offsetx,
          opacity: 0,
          cursor: 'pointer'
        })
        .attr({
          title: 'Scroll Back to Top'
        })
        .click(function () {
          mainobj.scrollup();
          return false;
        })
        .appendTo('body');

      //  Loose check for IE6 and below, plus whether control contains any text
      if (document.all && !window.XMLHttpRequest && mainobj.$control.text() != '')
        mainobj.$control.css({
          width: mainobj.$control.width()
        }); //  IE6- seems to require an explicit width on a DIV containing text
      mainobj.togglecontrol();
      $('a[href="' + mainobj.anchorkeyword + '"]').click(function () {
        mainobj.scrollup();
        return false;
      });
      //  jadams, (error) var e from callback never used: $(window).bind('scroll resize', function(e){
      $(window).bind('scroll resize', function () {
        mainobj.togglecontrol();
      });

    });
  } // END init
}; // END scrolltotop

// ---------------------------------------------------------------------------
// Initializer
// ---------------------------------------------------------------------------
scrolltotop.init();
