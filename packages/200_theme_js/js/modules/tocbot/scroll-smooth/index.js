/*
 # -----------------------------------------------------------------------------
 #  ~/js/tocbot/scroll-smooth/index.js
 #  Scroll-Smooth (Tocbot v4.12.0) implementation for J1 Theme
 #
 #  Product/Info:
 #  https://jekyll.one
 #  https://tscanlin.github.io/tocbot
 #  https://github.com/tscanlin/tocbot
 #
 #  Copyright (C) 2023-2025 Juergen Adams
 #  Copyright (C) 2016 Tim Scanlin
 #
 #  J1 Theme is licensed under MIT License.
 #  See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 #  Tocbot is licensed under the MIT License.
 #  For details, https://github.com/tscanlin/tocbot/blob/master/LICENSE
 # -----------------------------------------------------------------------------
*/
'use strict';

// -----------------------------------------------------------------------------
// ESLint shimming
// -----------------------------------------------------------------------------
/* eslint indent: "off"                                                       */
/* eslint semi: "off"                                                         */
/* eslint no-redeclare: "off"                                                 */
/* eslint no-unused-vars: "off"                                               */
/* eslint no-undef: "off"                                                     */
/* eslint no-empty: "off"                                                     */
// -----------------------------------------------------------------------------

/* globals location, requestAnimationFrame */

exports.initSmoothScrolling = initSmoothScrolling

function initSmoothScrolling (options) {
  if (isCssSmoothSCrollSupported()) { }

  var duration = options.duration;
  var offset = options.offset;

  var pageUrl = location.hash
    ? stripHash(location.href)
    : location.href;

  delegatedLinkHijacking();

  function delegatedLinkHijacking () {
    document.body.addEventListener('click', onClick, false)

    function onClick (e) {
      e.preventDefault();
      e.stopPropagation();

      if (
        !isInPageLink(e.target) ||
        e.target.className.indexOf('no-smooth-scroll') > -1 ||
        (e.target.href.charAt(e.target.href.length - 2) === '#' &&
        e.target.href.charAt(e.target.href.length - 1) === '!') ||
        e.target.className.indexOf(options.linkClass) === -1) {
        return;
      }

      // Don't prevent default or hash doesn't change.
      // e.preventDefault()

      // fixing-skip-to-content-links
      // jump(e.target.hash, {
      //   duration: duration,
      //   offset: offset,
      //   callback: function () {
      //     setFocus(e.target.hash)
      //   }
      // })

      // jadams, 2021-11-13
      // fixing-skip-to-content-links, done by callback to focus(), seems
      // NOT longer required for current browsers
      jump(e.target.hash, {
        duration: duration,
        offset: offset,
        callback: false
      });
    }
  }

  function isInPageLink (n) {
    return n.tagName.toLowerCase() === 'a' &&
      (n.hash.length > 0 || n.href.charAt(n.href.length - 1) === '#') &&
      (stripHash(n.href) === pageUrl || stripHash(n.href) + '#' === pageUrl);
  }

  function stripHash (url) {
    return url.slice(0, url.lastIndexOf('#'));
  }

  function isCssSmoothSCrollSupported () {
    return 'scrollBehavior' in document.documentElement.style;
  }

  // Adapted from:
  // https://www.nczonline.net/blog/2013/01/15/fixing-skip-to-content-links/
  function setFocus (hash) {
    var element = document.getElementById(hash.substring(1));

    if (element) {
      if (!/^(?:a|select|input|button|textarea)$/i.test(element.tagName)) {
        element.tabIndex = -1;
      }
      element.focus();
    }
  }
}

function jump (target, options) {
  var start = window.pageYOffset;
  var opt = {
    duration:   options.duration,
    offset:     options.offset || 0,
    callback:   options.callback,
    easing:     options.easing || easeInOutQuad
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
  requestAnimationFrame(function (time) { timeStart = time; loop(time) });

  function loop (time) {
    timeElapsed = time - timeStart;
    window.scrollTo(0, opt.easing(timeElapsed, start, distance, duration));
    if (timeElapsed < duration) { requestAnimationFrame(loop); } else { end(); }
  }

  function end () {
    // window.scrollTo(0, start + distance)

    // jadams, 2020-07-04: on (some?) mobile devices, the navbar
    // background is NOT switched (always?) correctly on a
    // page RELOAD.
    //
    // Solution: scroll the page one pixel back and forth (trigger)
    // to get the right position for the Toccer and adjust the
    // Navigator to display the (tranparent) navbar correctly based
    // on their onscroll events registered.
    //
    // $(window).scrollTop($(window).scrollTop()+1);
    // $(window).scrollTop($(window).scrollTop()-1);

    if (typeof opt.callback === 'function') { opt.callback(); }
  }

  // Robert Penner's easeInOutQuad - http://robertpenner.com/easing/
  function easeInOutQuad (t, b, c, d) {
    t /= d / 2;
    if (t < 1) return c / 2 * t * t + b;
    t--;
    return -c / 2 * (t * (t - 2) - 1) + b;
  }

}
