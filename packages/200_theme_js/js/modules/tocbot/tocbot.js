/*
 # -----------------------------------------------------------------------------
 #  ~/js/tocbot/tocbot.js
 #  Tocbot v4.12.0 implementation for J1 Theme
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
 #  rules:
 #    "eslint:tocbot": "eslint --ignore-path .eslintignore src/tocbot/js"
 # -----------------------------------------------------------------------------
*/
'use strict';

// -----------------------------------------------------------------------------
// ESLint shimming
// -----------------------------------------------------------------------------
/* eslint no-extra-semi: "off"                                                */
/* eslint no-undef: "off"                                                     */
/* eslint no-redeclare: "off"                                                 */
/* eslint no-unused-vars: "off"                                               */
/* eslint indent: "off"                                                       */
/* eslint quotes: "off"                                                       */
/* eslint no-prototype-builtins: "off"                                        */
/* global window                                                              */

/**
 * Tocbot
 * Tocbot creates a toble of contents based on HTML headings on a page,
 * this allows users to easily jump to different sections of the document.
 * Tocbot was inspired by tocify (http://gregfranko.com/jquery.tocify.js/).
 * The main differences are that it works natively without any need for jquery or jquery UI).
 *
 * @author Tim Scanlin
 */

/* globals define */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory(root));
  } else if (typeof exports === 'object') {
    module.exports = factory(root);
  } else {
    root.tocbot = factory(root);
  }
})(typeof global !== 'undefined' ? global : this.window || this.global, function (root) {
  // Default options.
  var defaultOptions = require('./default-options.js');
  // Object to store current options.
  var options = {};
  // Object for public APIs.
  var tocbot = {};

  var BuildHtml = require('./build-html.js');
  var ParseContent = require('./parse-content.js');
  var updateTocScroll = require('./update-toc-scroll.js');
  // Keep these variables at top scope once options are passed in.
  var buildHtml;
  var parseContent;

  // Just return if its not a browser.
  var supports = !!root && !!root.document && !!root.document.querySelector && !!root.addEventListener; // Feature test
  if (typeof window === 'undefined' && !supports) {
    return;
  }
  var headingsArray;

  // From: https://github.com/Raynos/xtend
  var hasOwnProperty = Object.prototype.hasOwnProperty;
  function extend () {
    var target = {};
    for (var i = 0; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  }

  // From: https://remysharp.com/2010/07/21/throttling-function-calls
  function throttle (fn, threshold, scope) {
    threshold || (threshold = 250);
    var last;
    var deferTimer;
    return function () {
      var context = (scope || this);
      var now = +new Date();
      var args = arguments;
      if (last && now < last + threshold) {
        // hold on to it
        clearTimeout(deferTimer);
        deferTimer = setTimeout(function () {
          last = now;
          fn.apply(context, args);
        }, threshold);
      } else {
        last = now;
        fn.apply(context, args);
      }
    };
  }

  /**
   * Destroy tocbot.
   */
  tocbot.destroy = function () {
    if (!options.skipRendering) {
      // Clear HTML.
      try {
        document.querySelector(options.tocSelector).innerHTML = '';
      } catch (e) {
        console.warn('Element not found: ' + options.tocSelector); // eslint-disable-line
      }
    }

    // Remove event listeners.
    if (options.scrollContainer && document.querySelector(options.scrollContainer)) {
      document.querySelector(options.scrollContainer).removeEventListener('scroll', this._scrollListener, false);
      document.querySelector(options.scrollContainer).removeEventListener('resize', this._scrollListener, false);
      if (buildHtml) {
        document.querySelector(options.scrollContainer).removeEventListener('click', this._clickListener, false);
      }
    } else {
      document.removeEventListener('scroll', this._scrollListener, false);
      document.removeEventListener('resize', this._scrollListener, false);
      if (buildHtml) {
        document.removeEventListener('click', this._clickListener, false);
      }
    }
  };

  /**
   * Initialize tocbot.
   * @param {object} customOptions
   */
  tocbot.init = function (customOptions) {
    // feature test
    if (!supports) {
      return;
    }

    // Merge defaults with user options.
    // Set to options variable at the top.
    options = extend(defaultOptions, customOptions || {});
    this.options = options;
    this.state = {};

    // Init smooth scroll if enabled (default).
    if (options.scrollSmooth) {
      options.duration = options.scrollSmoothDuration;
      options.offset = options.scrollSmoothOffset;
      tocbot.scrollSmooth = require('./scroll-smooth').initSmoothScrolling(options);
    }

    // Pass options to these modules.
    buildHtml = BuildHtml(options);
    parseContent = ParseContent(options);

    // For testing purposes.
    this._buildHtml = buildHtml;
    this._parseContent = parseContent;

    // Destroy it if it exists first.
    tocbot.destroy();

    // Get headings array.
    headingsArray = parseContent.selectHeadings(options.contentSelector, options.headingSelector);
    // Return if no headings are found.
    if (headingsArray === null) {
      return;
    }

    // Build nested headings array.
    var nestedHeadingsObj = parseContent.nestHeadingsArray(headingsArray);
    var nestedHeadings = nestedHeadingsObj.nest;

    // Render.
    if (!options.skipRendering) {
      buildHtml.render(options.tocSelector, nestedHeadings);
    }

    // Update Sidebar and bind listeners.
    this._scrollListener = throttle(function (e) {
      buildHtml.updateToc(headingsArray);
      !options.disableTocScrollSync && updateTocScroll(options);
      var isTop = e && e.target && e.target.scrollingElement && e.target.scrollingElement.scrollTop === 0;
      if ((e && (e.eventPhase === 0 || e.currentTarget === null)) || isTop) {
        buildHtml.updateToc(headingsArray);
        if (options.scrollEndCallback) {
          options.scrollEndCallback(e);
        }
      }
    }, options.throttleTimeout);
    this._scrollListener();
    if (options.scrollContainer && document.querySelector(options.scrollContainer)) {
      document.querySelector(options.scrollContainer).addEventListener('scroll', this._scrollListener, false);
      document.querySelector(options.scrollContainer).addEventListener('resize', this._scrollListener, false);
    } else {
      document.addEventListener('scroll', this._scrollListener, false);
      document.addEventListener('resize', this._scrollListener, false);
    }

    // Bind click listeners to disable animation.
    var timeout = null;
    this._clickListener = throttle(function (event) {
      if (options.scrollSmooth) {
        buildHtml.disableTocAnimation(event);
      }
      buildHtml.updateToc(headingsArray);
      // Timeout to re-enable the animation.
      timeout && clearTimeout(timeout);
      timeout = setTimeout(function () {
        buildHtml.enableTocAnimation();
      }, options.scrollSmoothDuration);
    }, options.throttleTimeout);

    if (options.scrollContainer && document.querySelector(options.scrollContainer)) {
      document.querySelector(options.scrollContainer).addEventListener('click', this._clickListener, false);
    } else {
      document.addEventListener('click', this._clickListener, false);
    }

    return this;
  };

  /**
   * Refresh tocbot.
   */
  tocbot.refresh = function (customOptions) {
    tocbot.destroy();
    tocbot.init(customOptions || this.options);
  };

  // Make tocbot available globally.
  root.tocbot = tocbot;

  return tocbot;
});
