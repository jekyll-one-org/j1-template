/*
 # -----------------------------------------------------------------------------
 # ~/js/sticky-side-menu/ssm.js/ssm.js
 # Sticky Side Menu for J1
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2021 Juergen Adams
 #
 # J1 Template is licensed under MIT License.
 # For details, see https://jekyll.one
 # -----------------------------------------------------------------------------
*/
'use strict';

// -----------------------------------------------------------------------------
// ESLint shimming
// -----------------------------------------------------------------------------
/* eslint indent: "off"                                                       */
/* eslint no-unused-vars: "off"                                               */
/* eslint no-undef: "off"                                                     */
/* eslint no-redeclare: "off"                                                 */
/* eslint indent: "off"                                                       */
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// SSC core registered as "ssc"
// -----------------------------------------------------------------------------
/*!
 * J1 SSM
 * Copyright (C) 2021 Juergen Adams
 * Licensed under MIT License.
 */
module.exports = function ssm ( options ) {

  // ---------------------------------------------------------------------------
  // default settings
  // ---------------------------------------------------------------------------
  var settings = $.extend ({
    foo: 'bar',
    bar: 'foo',
  }, options );

  // ---------------------------------------------------------------------------
  // main object
  // ---------------------------------------------------------------------------
  return {

    // -------------------------------------------------------------------------
    // module initializer
    // -------------------------------------------------------------------------
    init: function ( options ) {
      // if no TOC is avaialable
      const iconWidthCorrection = 35;

      // cast text-based booleans
      var isToc = (options.toc === 'true');
      var logger;
      var logText;
      var timeoutHandle;

      // -----------------------------------------------------------------------
      // helper functions
      // -----------------------------------------------------------------------

      // -----------------------------------------------------------------------
      // core
      // -----------------------------------------------------------------------
      logger = log4javascript.getLogger('j1.core.ssc');

      logText = 'initialize ssm core';
      logger.info(logText);

      // content container, add space for SSM menu on the right
      //
      var $content_container              = $('#content');
      var content_container_margin_right  = '50px';

      // panel slide settings
      //
      var $ssb_panel                      = $('#ssm-container');
      var ssb_panel_w                     = 0;
      var sbb_display_margin              = isToc
                                            ? options.margin
                                            : options.margin + iconWidthCorrection;

      if (options.z_level) {ssb_panel.css('z-index', options.z-level)}
      $content_container.css('padding-right', content_container_margin_right);
      $ssb_panel.css('right', `${sbb_display_margin}`);

      if ($ssb_panel.hasClass('ssm-btns-left') &&
        ($ssb_panel.hasClass('ssm-anim-slide') ||
        $ssb_panel.hasClass('ssm-anim-icons'))) {
          $ssb_panel.css('left', '-' + (ssb_panel_w - sbb_display_margin) + 'px');
      } else if ($ssb_panel.hasClass('ssm-btns-right') &&
                ($ssb_panel.hasClass('ssm-anim-slide') ||
                $ssb_panel.hasClass('ssm-anim-icons'))) {
          $ssb_panel.css('right', '-' + (ssb_panel_w - sbb_display_margin) + 'px');
      }

      if ( options.mode == 'menu' ) {
        // slide the menu on hover
        $ssb_panel.hover(function () {
          // disable scrolling (desktop)
          $('body').addClass('stop-scrolling');
          // disable scrolling (mobile)
          $('body').bind('touchmove', function(e){e.preventDefault()})
          timeoutHandle = window.setTimeout(function () {
            if ($ssb_panel.hasClass('ssm-btns-left') &&
                $ssb_panel.hasClass('ssm-anim-slide')) {
                $ssb_panel.stop().animate({'left': 0}, 300);
            } else if ($ssb_panel.hasClass('ssm-btns-right') &&
                      $ssb_panel.hasClass('ssm-anim-slide')) {
                $ssb_panel.stop().animate({'right': 0}, 300);
            }
          }, 250);
        }, function () {
          // delay to close the menu
          timeoutHandle = window.setTimeout(function () {
              // enable scrolling (desktop)
              $('body').removeClass('stop-scrolling');
              // enable scrolling (mobile)
              $('body').unbind('touchmove')
            if ($ssb_panel.hasClass('ssm-btns-left') &&
                $ssb_panel.hasClass('ssm-anim-slide')) {
                $ssb_panel.animate({'left': '-' + (ssb_panel_w - sbb_display_margin) + 'px'}, 300);
            } else if ( $ssb_panel.hasClass('ssm-btns-right') &&
                        $ssb_panel.hasClass('ssm-anim-slide')) {
                $ssb_panel.animate({'right': '-' + (ssb_panel_w - sbb_display_margin) + 'px'}, 300);
            }
          }, 100);
        });
      }

      logText = 'ssm core successfully initialized';
      logger.info(logText);
    } // END init
  }; // end return (object)
}( jQuery );
