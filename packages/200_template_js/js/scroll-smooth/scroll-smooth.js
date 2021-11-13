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
module.exports = function scrollSmooth (options) {

  // Default settings
  var settings = $.extend({
    foo: 'foo_option',
    bar: 'bar_option'
  }, options );

  return {
    // -------------------------------------------------------------------------
    // Initialize scrollSmooth
    // -------------------------------------------------------------------------
    scroll: function ( target, options ) {
      var logger = log4javascript.getLogger('j1.core.scrollSmooth');

      logger.info('run module scrollSmooth');
      this.scrollTo(target, {
        duration:   options.duration,
        offset:     options.offset,
        callback:   false
      });
    },

    // -------------------------------------------------------------------------
    // scrollTo()
    // NOTE: Calculate the tgt (HTML heading element including the hash)
    // This makes ids that start with a number to work:
    //  '[id="' + decodeURI(target).split('#').join('') + '"]'
    // DecodeURI is usded for nonASCII hashes, they was encoded,
    // but id was not encoded, it lead to not finding the tgt element by id.
    // -------------------------------------------------------------------------
    scrollTo: function (target, options) {
      var opt = {};
      var start;
      var tgt;
      var distance;
      var duration;
      var timeStart;
      var timeElapsed;

      opt = {
        duration:   options.duration,
        offset:     options.offset || 0,
        callback:   options.callback,
        easing:     options.easing || easeInOutQuad
      };

      // -----------------------------------------------------------------------
      // functions
      // -----------------------------------------------------------------------

      // -----------------------------------------------------------------------
      // animatedScroll()
      // callback routine for requestAnimationFrame()
      // -----------------------------------------------------------------------
      function animatedScroll (time) {
        timeElapsed = time - timeStart;
        window.scrollTo(0, opt.easing(timeElapsed, start, distance, duration));
        if (timeElapsed < duration) {
          requestAnimationFrame(animatedScroll);
        } else {
          postScrollActions();
        }
      }

      // -----------------------------------------------------------------------
      // postScrollActions()
      // actions after scrolling has finished
      // -----------------------------------------------------------------------
      function postScrollActions () {
        var logger = log4javascript.getLogger('j1.core.scrollSmooth.post');
        logText = 'scrollSmooth finished';
        logger.debug(logText);
        // post positioning if configured|needed
        if (typeof opt.callback === 'function') { opt.callback(); }
      }

      // -----------------------------------------------------------------------
      // easeInOutQuad()
      // default animation, adopted from Robert Penner's easeInOutQuad
      // see: http://robertpenner.com/easing/
      // parameters:
      //  t, current time in seconds
      //  b, starting value
      //  c, final value
      //  d, duration of animation
      // -----------------------------------------------------------------------
      function easeInOutQuad (t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
      }

      // -----------------------------------------------------------------------
      // main
      // -----------------------------------------------------------------------

      // calculate the scrolling parameters
      start     = window.pageYOffset;
      tgt       = document.querySelector('[id="' + decodeURI(target).split('#').join('') + '"]');
      duration  = opt.duration;
      distance  = typeof target === 'string'
        ? opt.offset + (
          target
            ? (tgt && tgt.getBoundingClientRect().top) || 0                     // handle non-existent links better.
            : -(document.documentElement.scrollTop || document.body.scrollTop))
        : target;

      // request the browser to perform an animation by a specified function
      // to update an animation before the next repaint.
      // see: https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
      requestAnimationFrame(function (time) { timeStart = time; animatedScroll(time); });

    } // END scrollTo

  }; // END return
} (jQuery);
