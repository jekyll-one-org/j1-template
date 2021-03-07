/*
 # -----------------------------------------------------------------------------
 # ~/js/scroll-smooth/scroll-smooth.js
 # Provides Javascript functions for smooth scrolling
 #
 # Product/Info:
 # http://jekyll.one
 #
 # Copyright (C) 2020 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # See: https://github.com/jekyll-one-org/J1 Template/blob/master/LICENSE
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
// scrollSmooth core registered as "scrollSmooth"
// -----------------------------------------------------------------------------
module.exports = function scrollSmooth ( options ) {

  // Default settings
  var settings = $.extend({
    foo: 'foo_option',
    bar: 'bar_option'
  }, options );

  // -----------------------------------------------------------------------
  // Helper functions
  // -----------------------------------------------------------------------
  function stripHash (url) {
    return url.slice(0, url.lastIndexOf('#'));
  }

  function isCssSmoothScrollSupported () {
    return 'scrollBehavior' in document.documentElement.style;
  }

  return {
    // -------------------------------------------------------------------------
    // Initialize scrollSmooth
    // -------------------------------------------------------------------------
    scroll: function ( target, options ) {

      var logger;
      var logText;

      logger = log4javascript.getLogger('j1.scrollSmooth.core');

      // indicator|check currently NOT used
      // if (isCssSmoothScrollSupported()) { }

      logText = 'run module scrollSmooth';
      logger.info(logText);

      var duration  = options.duration;
      var offset    = options.offset;

      // var pageUrl = options.location.hash
      //   ? stripHash(options.location.href)
      //   : options.location.href;

      this.scrollTo(target, {
        duration: duration,
        offset: offset,
        callback: null
      });

      logText = 'scrollSmooth finished';
      logger.info(logText);
    },

    // -------------------------------------------------------------------------
    // scrollTo
    // -------------------------------------------------------------------------
    scrollTo: function ( target, options ) {
      var start = window.pageYOffset;
      var opt = {
        duration: options.duration,
        offset: options.offset || 0,
        callback: options.callback,
        easing: options.easing || easeInOutQuad
      };

      // This makes ids that start with a number work: ('[id="' + decodeURI(target).split('#').join('') + '"]')
      // DecodeURI for nonASCII hashes, they was encoded, but id was not encoded, it lead to not finding the tgt element by id.
      // And this is for IE: document.body.scrollTop
      var tgt = document.querySelector('[id="' + decodeURI(target).split('#').join('') + '"]');
      var distance = typeof target === 'string'
        ? opt.offset + (
          target
            ? (tgt && tgt.getBoundingClientRect().top) || 0 // handle non-existent links better.
            : -(document.documentElement.scrollTop || document.body.scrollTop))
        : target;
      var duration = typeof opt.duration === 'function'
        ? opt.duration(distance)
        : opt.duration;
      var timeStart;
      var timeElapsed;

      requestAnimationFrame(function (time) { timeStart = time; loop(time); });
      function loop (time) {
        timeElapsed = time - timeStart;

        window.scrollTo(0, opt.easing(timeElapsed, start, distance, duration));

        if (timeElapsed < duration) { requestAnimationFrame(loop); } else { end(); }
      }

      function end () {
        window.scrollTo(0, start + distance);

        // jadams, 2020-07-04: on (some?) mobile devices, the navbar
        // background is NOT switched (always?) correctly on a
        // page RELOAD.
        //
        // Solution: scroll the page one pixel back and forth (trigger)
        // to get the right position for the Toccer and adjust the
        // Navigator to display the (tranparent) navbar correctly based
        // on their onscroll events registered.
        //
        $(window).scrollTop($(window).scrollTop()+1);
        $(window).scrollTop($(window).scrollTop()-1);

        if (typeof opt.callback === 'function') { opt.callback(); }
      }

      // Robert Penner's easeInOutQuad - http://robertpenner.com/easing/
      function easeInOutQuad (t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
      }
    } // END scrollTo

  }; // END return
}( jQuery );
