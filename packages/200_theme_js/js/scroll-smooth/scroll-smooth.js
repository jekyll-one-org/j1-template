/*
 # -----------------------------------------------------------------------------
 # ~/200_theme_js/js/scroll-smooth/scroll-smooth.js
 # Provides Javascript functions for smooth scrolling
 #
 # Product/Info:
 # http://jekyll.one
 #
 # J1 Theme is licensed under the MIT License.
 # See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE.md
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

      logger = log4javascript.getLogger('j1.core.scrollSmooth');

      // indicator|check currently NOT used
      // if (isCssSmoothScrollSupported()) { }

      logText = '\n' + 'run module scrollSmooth';
      logger.debug(logText);

      var duration  = options.duration;
      var offset    = options.offset;

      // var pageUrl = options.location.hash
      //   ? stripHash(options.location.href)
      //   : options.location.href;

      this.scrollTo(target, {
        duration: duration,
        offset: offset,
        callback: false
      });
    },

    // -------------------------------------------------------------------------
    // scrollTo
    // NOTE: Calculate the tgt (HTML heading element including the hash)
    // This makes ids that start with a number to work:
    //  '[id="' + decodeURI(target).split('#').join('') + '"]'
    // DecodeURI is usded for nonASCII hashes, they was encoded,
    // but id was not encoded, it lead to not finding the tgt element by id.
    // -------------------------------------------------------------------------
    scrollTo: function ( target, options ) {
      var start = window.pageYOffset;
      var opt = {
        duration: options.duration,
        offset: options.offset || 0,
        callback: options.callback,
        easing: options.easing || easeInOutQuad
      };

      // calculate the tgt (HTML heading element including the hash)
      var tgt = document.querySelector('[id="' + decodeURI(target).split('#').join('') + '"]');
      var distance = typeof target === 'string'
        ? opt.offset + (
          target
            ? (tgt && tgt.getBoundingClientRect().top) || 0                     // handle non-existent links better.
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
        if (timeElapsed < duration) { requestAnimationFrame(loop); } else { postPositioning(); }
      }

      function postPositioning () {
        //  if configured
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
