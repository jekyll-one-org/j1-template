/*
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/modules/backstretch/js/backstretch.js (3)
 # Backstretch v.2.1.16 implementation for J1 Theme.
 #
 # Product/Info:
 # https://jekyll.one
 # http://srobbin.com/jquery-plugins/backstretch/
 #
 # Copyright (C) 2023-2026 Juergen Adams
 # Copyright (C) 2017 Daniel Cohen Gindi
 # Copyright (C) 2012 Scott Robbin
 #
 # J1 Template is licensed under the MIT License.
 # See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 # Backstretch is licensed under the MIT License.
 # See: https://github.com/danielgindi/jquery-backstretch
 # -----------------------------------------------------------------------------
*/

// -----------------------------------------------------------------------------
// ESLint shimming
// -----------------------------------------------------------------------------
/* eslint indent: "off"                                                       */
/* eslint no-unused-vars: "off"                                               */
/* eslint no-undef: "off"                                                     */
/* eslint no-useless-escape: "off"                                            */
/* eslint no-prototype-builtins: "off"                                        */
/* eslint no-shadow-restricted-names: "off"                                   */
// -----------------------------------------------------------------------------
// Version 2.1.16

'use strict';
(function ($, window, undefined) {

  /** @const */
  var YOUTUBE_REGEXP = /^.*(youtu\.be\/|youtube\.com\/v\/|youtube\.com\/embed\/|youtube\.com\/watch\?v=|youtube\.com\/watch\?.*\&v=)([^#\&\?]*).*/i;

  // claude - optimization chances: code clarity
  // Removed module-scoped 'var logText' declaration. The variable is only
  // used within resize() and show() where it is declared locally or should
  // be. A single shared mutable variable for unrelated log messages is
  // error-prone in concurrent/async scenarios.

  /* PLUGIN DEFINITION
   * ========================= */

  $.fn.backstretch = function (images, options) {
    var args = arguments;
    // var debug = false;

    /*
     * Scroll the page one pixel to get the right window height on iOS
     * Pretty harmless for everyone else
     */
    if ($(window).scrollTop() === 0) {
      window.scrollTo(0, 0);
    }

    var returnValues;

    this.each(function (eachIndex) {
      var $this = $(this),
        obj = $this.data('backstretch');

      // Do we already have an instance attached to this element?
      if (obj) {

        // Is this a method they're trying to execute?
        if (typeof args[0] === 'string' &&
          typeof obj[args[0]] === 'function') {

          // Call the method
          var returnValue = obj[args[0]].apply(obj, Array.prototype.slice.call(args, 1));
          if (returnValue === obj) { // If a method is chaining
            returnValue = undefined;
          }
          if (returnValue !== undefined) {
            returnValues = returnValues || [];
            returnValues[eachIndex] = returnValue;
          }

          return; // Nothing further to do
        }

        // Merge the old options with the new
        options = $.extend(obj.options, options);

        // Remove the old instance
        if (obj.hasOwnProperty('destroy')) {
          obj.destroy(true);
        }
      }

      // We need at least one image
      if (!images || (images && images.length === 0)) {
        var cssBackgroundImage = $this.css('background-image');
        if (cssBackgroundImage && cssBackgroundImage !== 'none') {
          images = [{
            url: $this.css('backgroundImage').replace(/url\(|\)|"|'/g, '')
          }];
        } else {
          $.error('No images were supplied for Backstretch, or element must have a CSS-defined background image.');
        }
      }

      obj = new Backstretch(this, images, options || {});
      $this.data('backstretch', obj);
    });

    return returnValues ? returnValues.length === 1 ? returnValues[0] : returnValues : this;
  };

  // If no element is supplied, we'll attach to body
  $.backstretch = function (images, options) {
    // Return the instance
    return $('body')
      .backstretch(images, options)
      .data('backstretch');
  };

  // Custom selector
  $.expr[':'].backstretch = function (elem) {
    return $(elem).data('backstretch') !== undefined;
  };

  /* DEFAULTS
   * ========================= */

  $.fn.backstretch.defaults = {
    debug: false,
    duration: 5000,                       // Amount of time in between slides (if slideshow)
    transition: 'fade',                   // Type of transition between slides
    transitionDuration: 0,                // Duration of transition between slides
    animateFirst: true,                   // Animate the transition of first image of slideshow in?
    alignX: 0.5,                          // The x-alignment for the image, can be 'left'|'center'|'right' or any number between 0.0 and 1.0
    alignY: 0.5,                          // The y-alignment for the image, can be 'top'|'center'|'bottom' or any number between 0.0 and 1.0
    paused: false,                        // Whether the images should slide after given duration
    start: 0,                             // Index of the first image to show
    preload: 2,                           // How many images preload at a time?
    preloadSize: 1,                       // How many images can we preload in parallel?
    resolutionRefreshRate: 2500,          // How long to wait before switching resolution?
    resolutionChangeRatioThreshold: 0.1   // How much a change should it be before switching resolution?
  };

  /* STYLES
   *
   * Baked-in styles that we'll apply to our elements.
   * In an effort to keep the plugin simple, these are not exposed as options.
   * That said, anyone can override these in their own stylesheet.
   * ========================= */
  var styles = {
    wrap: {
      left: 0,
      top: 0,
      overflow: 'hidden',
      margin: 0,
      padding: 0,
      height: '100%',
      width: '100%',
      zIndex: -999999
    },
    itemWrapper: {
      position: 'absolute',
      display: 'none',
      margin: 0,
      padding: 0,
      border: 'none',
      width: '100%',
      height: '100%',
      zIndex: -999999
    },
    // claude - backstretch responsiveness
    // Added maxHeight: 'none' and objectFit: 'none' to prevent CSS
    // frameworks (e.g. Bootstrap) from constraining image/video
    // dimensions via inherited max-height or object-fit rules. Without
    // these overrides, images may not scale beyond the container's
    // CSS-defined maximum, causing them to appear "stuck" at a previous
    // size after a browser resize.
    item: {
      position: 'absolute',
      margin: 0,
      padding: 0,
      border: 'none',
      width: '100%',
      height: '100%',
      maxWidth: 'none',
      maxHeight: 'none',
      objectFit: 'none'
    }
  };

  /* Given an array of different options for an image,
   * choose the optimal image for the container size.
   *
   * Given an image template (a string with {{ width }} and/or
   * {{height}} inside) and a container object, returns the
   * image url with the exact values for the size of that
   * container.
   *
   * Returns an array of urls optimized for the specified resolution.
   *
   */
  var optimalSizeImages = (function () {

    /* Sorts the array of image sizes based on width */
    var widthInsertSort = function (arr) {
      for (var i = 1; i < arr.length; i++) {
        var tmp = arr[i],
          j = i;
        while (arr[j - 1] && parseInt(arr[j - 1].width, 10) > parseInt(tmp.width, 10)) {
          arr[j] = arr[j - 1];
          --j;
        }
        arr[j] = tmp;
      }

      return arr;
    };

    /* Given an array of various sizes of the same image and a container width,
     * return the best image.
     */
    var selectBest = function (containerWidth, containerHeight, imageSizes) {

      var devicePixelRatio = window.devicePixelRatio || 1;
      var deviceOrientation = getDeviceOrientation();
      var windowOrientation = getWindowOrientation();
      var wrapperOrientation = (containerHeight > containerWidth) ?
        'portrait' :
        (containerWidth > containerHeight ? 'landscape' : 'square');

      var lastAllowedImage = 0;
      var testWidth;

      for (var j = 0, image; j < imageSizes.length; j++) {

        image = imageSizes[j];

        // In case a new image was pushed in, process it:
        if (typeof image === 'string') {
          image = imageSizes[j] = {
            url: image
          };
        }

        if (image.pixelRatio && image.pixelRatio !== 'auto' && parseFloat(image.pixelRatio) !== devicePixelRatio) {
          // We disallowed choosing this image for current device pixel ratio,
          // So skip this one.
          continue;
        }

        if (image.deviceOrientation && image.deviceOrientation !== deviceOrientation) {
          // We disallowed choosing this image for current device orientation,
          // So skip this one.
          continue;
        }

        // claude - optimization chances: correctness
        // Bug fix: was comparing windowOrientation against deviceOrientation
        // instead of the actual windowOrientation value
        if (image.windowOrientation && image.windowOrientation !== windowOrientation) {
          // We disallowed choosing this image for current window orientation,
          // So skip this one.
          continue;
        }

        if (image.orientation && image.orientation !== wrapperOrientation) {
          // We disallowed choosing this image for current element's orientation,
          // So skip this one.
          continue;
        }

        // Mark this one as the last one we investigated
        // which does not violate device pixel ratio rules.
        // We may choose this one later if there's no match.
        lastAllowedImage = j;

        // For most images, we match the specified width against element width,
        // And enforcing a limit depending on the "pixelRatio" property if specified.
        // But if a pixelRatio="auto", then we consider the width as the physical width of the image,
        // And match it while considering the device's pixel ratio.
        // claude - optimization chances: correctness
        // Bug fix: was mutating 'containerWidth' (outer variable) instead of
        // only adjusting 'testWidth'. This corrupted containerWidth for all
        // subsequent loop iterations when pixelRatio === 'auto'.
        testWidth = containerWidth;
        if (image.pixelRatio === 'auto') {
          testWidth = containerWidth * devicePixelRatio;
        }

        // Stop when the width of the image is larger or equal to the container width
        if (image.width >= testWidth) {
          break;
        }
      }

      // Use the image located at where we stopped
      return imageSizes[Math.min(j, lastAllowedImage)];
    };

    var replaceTagsInUrl = function (url, templateReplacer) {

      if (typeof url === 'string') {
        url = url.replace(/{{(width|height)}}/g, templateReplacer);
      } else if (url instanceof Array) {
        for (var i = 0; i < url.length; i++) {
          if (url[i].src) {
            url[i].src = replaceTagsInUrl(url[i].src, templateReplacer);
          } else {
            url[i] = replaceTagsInUrl(url[i], templateReplacer);
          }
        }
      }

      return url;
    };

    return function ($container, images) {
      var containerWidth = $container.width(),
        containerHeight = $container.height();

      var chosenImages = [];

      var templateReplacer = function (match, key) {
        if (key === 'width') {
          return containerWidth;
        }
        if (key === 'height') {
          return containerHeight;
        }
        return match;
      };

      for (var i = 0; i < images.length; i++) {
        if ($.isArray(images[i])) {
          images[i] = widthInsertSort(images[i]);
          var chosen = selectBest(containerWidth, containerHeight, images[i]);
          chosenImages.push(chosen);
        } else {
          // In case a new image was pushed in, process it:
          if (typeof images[i] === 'string') {
            images[i] = {
              url: images[i]
            };
          }

          var item = $.extend({}, images[i]);
          item.url = replaceTagsInUrl(item.url, templateReplacer);
          chosenImages.push(item);
        }
      }
      return chosenImages;
    };

  })();

  var isVideoSource = function (source) {
    return YOUTUBE_REGEXP.test(source.url) || source.isVideo;
  };

  /* Preload images */
  var preload = (function (sources, startAt, count, batchSize, callback) {
    // claude - optimization chances: performance
    // Changed from array-based linear scan (O(n) per lookup) to a Map
    // for O(1) cache lookups on repeated preload calls
    var cache = new Map();

    // Wrapper for cache
    var caching = function (image) {
      if (cache.has(image.src)) {
        return cache.get(image.src);
      }
      cache.set(image.src, image);
      return image;
    };

    // Execute callback
    var exec = function (sources, callback, last) {
      if (typeof callback === 'function') {
        callback.call(sources, last);
      }
    };

    // Closure to hide cache
    return function preload(sources, startAt, count, batchSize, callback) {
      // Check input data
      if (typeof sources === 'undefined') {
        return;
      }
      if (!$.isArray(sources)) {
        sources = [sources];
      }

      if (arguments.length < 5 && typeof arguments[arguments.length - 1] === 'function') {
        callback = arguments[arguments.length - 1];
      }

      startAt = (typeof startAt === 'function' || !startAt) ? 0 : startAt;
      count = (typeof count === 'function' || !count || count < 0) ? sources.length : Math.min(count, sources.length);
      batchSize = (typeof batchSize === 'function' || !batchSize) ? 1 : batchSize;

      if (startAt >= sources.length) {
        startAt = 0;
        count = 0;
      }
      if (batchSize < 0) {
        batchSize = count;
      }
      batchSize = Math.min(batchSize, count);

      // claude - optimization chances: correctness
      // Bug fix: the second argument to slice() for 'next' was 'count - batchSize'
      // which is an absolute index, not relative. When startAt > 0, this drops
      // trailing images. Corrected to 'startAt + count' to capture all remaining
      // images after the current batch.
      var next = sources.slice(startAt + batchSize, startAt + count);
      sources = sources.slice(startAt, startAt + batchSize);
      count = sources.length;

      // If sources array is empty
      if (!count) {
        exec(sources, callback, true);
        return;
      }

      // Image loading callback
      var countLoaded = 0;

      var loaded = function () {
        countLoaded++;
        if (countLoaded !== count) {
          return;
        }

        exec(sources, callback, !next);
        preload(next, 0, 0, batchSize, callback);
      };

      // Loop sources to preload
      var image;

      for (var i = 0; i < sources.length; i++) {

        if (isVideoSource(sources[i])) {

          // Do not preload videos. There are issues with that.
          // First - we need to keep an instance of the preloaded and use that exactly, not a copy.
          // Second - there are memory issues.
          // If there will be a requirement from users - I'll try to implement this.

          continue;

        } else {

          image = new Image();
          image.src = sources[i].url;

          image = caching(image);

          if (image.complete) {
            loaded();
          } else {
            $(image).on('load error', loaded);
          }

        }

      }
    };
  })();

  /* Process images array */
  var processImagesArray = function (images) {
    var processed = [];
    for (var i = 0; i < images.length; i++) {
      if (typeof images[i] === 'string') {
        processed.push({
          url: images[i]
        });
      } else if ($.isArray(images[i])) {
        processed.push(processImagesArray(images[i]));
      } else {
        processed.push(processOptions(images[i]));
      }
    }
    return processed;
  };

  /* Process options */
  var processOptions = function (options, required) {

    // Convert old options

    // centeredX/centeredY are deprecated
    if (options.centeredX || options.centeredY) {
      if (window.console && window.console.log) {
        window.console.log('jquery.backstretch: `centeredX`/`centeredY` is deprecated, please use `alignX`/`alignY`');
      }
      if (options.centeredX) {
        options.alignX = 0.5;
      }
      if (options.centeredY) {
        options.alignY = 0.5;
      }
    }

    // Deprecated spec
    if (options.speed !== undefined) {

      if (window.console && window.console.log) {
        window.console.log('jquery.backstretch: `speed` is deprecated, please use `transitionDuration`');
      }

      options.transitionDuration = options.speed;
      options.transition = 'fade';
    }

    // Typo
    // claude - optimization chances: correctness
    // Added missing console guard (matches the pattern used for other
    // deprecation warnings above) to prevent errors in consoleless environments
    if (options.resolutionChangeRatioTreshold !== undefined) {
      if (window.console && window.console.log) {
        window.console.log('jquery.backstretch: `treshold` is a typo!');
      }
      options.resolutionChangeRatioThreshold = options.resolutionChangeRatioTreshold;
    }

    // Current spec that needs processing

    if (options.fadeFirst !== undefined) {
      options.animateFirst = options.fadeFirst;
    }

    if (options.fade !== undefined) {
      options.transitionDuration = options.fade;
      options.transition = 'fade';
    }

    if (options.scale) {
      options.scale = validScale(options.scale);
    }

    return processAlignOptions(options);
  };

  /* Process align options */
  var processAlignOptions = function (options, required) {
    if (options.alignX === 'left') {
      options.alignX = 0.0;
    } else if (options.alignX === 'center') {
      options.alignX = 0.5;
    } else if (options.alignX === 'right') {
      options.alignX = 1.0;
    } else {
      if (options.alignX !== undefined || required) {
        options.alignX = parseFloat(options.alignX);
        if (isNaN(options.alignX)) {
          options.alignX = 0.5;
        }
      }
    }

    if (options.alignY === 'top') {
      options.alignY = 0.0;
    } else if (options.alignY === 'center') {
      options.alignY = 0.5;
    } else if (options.alignY === 'bottom') {
      options.alignY = 1.0;
    } else {
      // claude - optimization chances: correctness
      // Bug fix: was checking 'options.alignX' instead of 'options.alignY'
      // in the Y-axis alignment fallback branch
      if (options.alignY !== undefined || required) {
        options.alignY = parseFloat(options.alignY);
        if (isNaN(options.alignY)) {
          options.alignY = 0.5;
        }
      }
    }

    return options;
  };

  var SUPPORTED_SCALE_OPTIONS = {
    'cover': 'cover',
    'fit': 'fit',
    'fit-smaller': 'fit-smaller',
    'fill': 'fill'
  };

  function validScale(scale) {
    if (!SUPPORTED_SCALE_OPTIONS.hasOwnProperty(scale)) {
      return 'cover';
    }
    return scale;
  }

  /* CLASS DEFINITION
   * ========================= */
  var Backstretch = function (container, images, options) {
    this.options = $.extend({}, $.fn.backstretch.defaults, options || {});

    this.firstShow = true;

    // Process options
    processOptions(this.options, true);

    /* In its simplest form, we allow Backstretch to be called on an image path.
     * e.g. $.backstretch('/path/to/image.jpg')
     * So, we need to turn this back into an array.
     */
    this.images = processImagesArray($.isArray(images) ? images : [images]);

    /**
     * Paused-Option
     */
    if (this.options.paused) {
      this.paused = true;
    }

    /**
     * Start-Option (Index)
     */
    if (this.options.start >= this.images.length) {
      this.options.start = this.images.length - 1;
    }
    if (this.options.start < 0) {
      this.options.start = 0;
    }

    // Convenience reference to know if the container is body.
    this.isBody = container === document.body;

    /* We're keeping track of a few different elements
     *
     * Container: the element that Backstretch was called on.
     * Wrap: a DIV that we place the image into, so we can hide the overflow.
     * Root: Convenience reference to help calculate the correct height.
     */
    var $window = $(window);
    this.$container = $(container);
    this.$root = this.isBody ? supportsFixedPosition ? $window : $(document) : this.$container;

    this.originalImages = this.images;
    this.images = optimalSizeImages(
      this.options.alwaysTestWindowResolution ? $window : this.$root,
      this.originalImages);

    /**
     * Pre-Loading.
     * This is the first image, so we will preload a minimum of 1 images.
     */
    preload(this.images, this.options.start || 0, this.options.preload || 1);

    // Don't create a new wrap if one already exists (from a previous instance of Backstretch)
    var $existing = this.$container.children('.backstretch').first();
    this.$wrap = $existing.length ? $existing :
      $('<div class="backstretch"></div>')
      .css(this.options.bypassCss ? {} : styles.wrap)
      .appendTo(this.$container);

    if (!this.options.bypassCss) {

      // Non-body elements need some style adjustments
      if (!this.isBody) {
        // If the container is statically positioned, we need to make it relative,
        // and if no zIndex is defined, we should set it to zero.
        var position = this.$container.css('position'),
          zIndex = this.$container.css('zIndex');

        this.$container.css({
          position: position === 'static' ? 'relative' : position,
          zIndex: zIndex === 'auto' ? 0 : zIndex
        });

        // Needs a higher z-index
        this.$wrap.css({
          zIndex: -999998
        });
      }

      // Fixed or absolute positioning?
      this.$wrap.css({
        position: this.isBody && supportsFixedPosition ? 'fixed' : 'absolute'
      });

    }

    // Set the first image
    this.index = this.options.start;
    this.show(this.index);

    // Listen for resize
    // claude - backstretch responsiveness
    // Wrapped resize handler in requestAnimationFrame to throttle
    // recalculations to the browser's paint cycle (~60fps). Without
    // this, the raw resize event fires hundreds of times per second
    // and image dimensions are recalculated on every pixel of
    // movement — often faster than the browser can repaint — leaving
    // images at stale/intermediate sizes that overflow the container.
    var resizeRAFHandle = null;
    var that = this;
    $window.on('resize.backstretch', function () {
        if (resizeRAFHandle) {
          cancelAnimationFrame(resizeRAFHandle);
        }
        resizeRAFHandle = requestAnimationFrame(function () {
          resizeRAFHandle = null;
          that.resize();
        });
        that._resizeRAFHandle = resizeRAFHandle;
      })
      // claude - backstretch responsiveness #2
      // Throttled the orientationchange handler through
      // requestAnimationFrame, matching the resize handler. Without
      // this, orientationchange calls resize() synchronously before the
      // browser has finished reflowing the viewport to the new
      // orientation, causing dimensions to be read from the stale
      // (pre-rotation) layout. On mobile devices this manifests as the
      // image being sized for portrait while the screen is already in
      // landscape (or vice versa) until the next resize event corrects
      // it.
      .on('orientationchange.backstretch', function () {
        // Need to do this in order to get the right window height
        if (that.isBody && window.pageYOffset === 0) {
          window.scrollTo(0, 1);
        }
        if (resizeRAFHandle) {
          cancelAnimationFrame(resizeRAFHandle);
        }
        resizeRAFHandle = requestAnimationFrame(function () {
          resizeRAFHandle = null;
          that.resize();
        });
        that._resizeRAFHandle = resizeRAFHandle;
      });

    // claude - backstretch responsiveness #2
    // Added ResizeObserver on the container element to detect size
    // changes that do NOT trigger a window resize event. This is
    // critical for Bootstrap 5 responsive layouts where the container
    // width changes at breakpoint boundaries (e.g. navbar collapse,
    // sidebar toggle, grid reflow from col-lg to col-md) without the
    // browser window itself being resized. Without this, the
    // backstretch image retains dimensions calculated for the previous
    // container size and either overflows or leaves gaps until the user
    // happens to resize the window. The observer is throttled through
    // the same RAF handle to avoid redundant calculations when both
    // window resize and container resize fire simultaneously.
    this._resizeObserver = null;
    if (typeof ResizeObserver !== 'undefined') {
      this._resizeObserver = new ResizeObserver(function () {
        if (resizeRAFHandle) {
          cancelAnimationFrame(resizeRAFHandle);
        }
        resizeRAFHandle = requestAnimationFrame(function () {
          resizeRAFHandle = null;
          that.resize();
        });
        that._resizeRAFHandle = resizeRAFHandle;
      });
      this._resizeObserver.observe(container);
    }
  };

  var performTransition = function (options) {
    var transition = options.transition || 'fade';

    // Look for multiple options
    if (typeof transition === 'string' && transition.indexOf('|') > -1) {
      transition = transition.split('|');
    }

    if (transition instanceof Array) {
      transition = transition[Math.round(Math.random() * (transition.length - 1))];
    }

    var $new = options['new'];
    var $old = options['old'] ? options['old'] : $([]);

    switch (transition.toString().toLowerCase()) {

      // claude - optimization chances: code clarity
      // The 'default' label is intentionally placed before 'fade' so that
      // unrecognized transition names fall through to the fade behavior.
      default:
      case 'fade':
        $new.fadeIn({
          duration: options.duration,
          complete: options.complete,
          easing: options.easing || undefined
        });
        break;

      case 'fadeinout':
      case 'fade_in_out':

        var fadeInNew = function () {
          $new.fadeIn({
            duration: options.duration / 2,
            complete: options.complete,
            easing: options.easing || undefined
          });
        };

        if ($old.length) {
          $old.fadeOut({
            duration: options.duration / 2,
            complete: fadeInNew,
            easing: options.easing || undefined
          });
        } else {
          fadeInNew();
        }

        break;

      case 'pushleft':
      case 'push_left':
      case 'pushright':
      case 'push_right':
      case 'pushup':
      case 'push_up':
      case 'pushdown':
      case 'push_down':
      case 'coverleft':
      case 'cover_left':
      case 'coverright':
      case 'cover_right':
      case 'coverup':
      case 'cover_up':
      case 'coverdown':
      case 'cover_down':
        var transitionParts = transition.match(/^(cover|push)_?(.*)$/);
        var animProp = transitionParts[2] === 'left' ? 'right' : transitionParts[2] === 'right' ? 'left' : transitionParts[2] === 'down' ? 'top' : transitionParts[2] === 'up' ? 'bottom' : 'right';

        var newCssStart = {
            'display': ''
          },
          newCssAnim = {};
        newCssStart[animProp] = '-100%';
        newCssAnim[animProp] = 0;

        $new
          .css(newCssStart)
          .animate(newCssAnim, {
            duration: options.duration,
            complete: function () {
              $new.css(animProp, '');
              options.complete.apply(this, arguments);
            },
            easing: options.easing || undefined
          });

        if (transitionParts[1] === 'push' && $old.length) {
          var oldCssAnim = {};
          oldCssAnim[animProp] = '100%';

          $old
            .animate(oldCssAnim, {
              duration: options.duration,
              complete: function () {
                $old.css('display', 'none');
              },
              easing: options.easing || undefined
            });
        }

        break;
    }

  };

  /* PUBLIC METHODS
   * ========================= */
  Backstretch.prototype = {

    // https://claude.ai/chat/19c2ed38-9c6e-4ce4-b9b8-ae110436a04e
    // -------------------------------------------------------------------------
    //
    resize: function () {
      try {
        var debug = false;
        var logger = log4javascript.getLogger('j1.api.attic');

        // Check for a better suited image after the resize
        var $resTest = this.options.alwaysTestWindowResolution ? $(window) : this.$root;
        var newContainerWidth = $resTest.width();
        var newContainerHeight = $resTest.height();
        var changeRatioW = newContainerWidth / (this._lastResizeContainerWidth || 0);
        var changeRatioH = newContainerHeight / (this._lastResizeContainerHeight || 0);
        var resolutionChangeRatioThreshold = this.options.resolutionChangeRatioThreshold || 0.0;

        // check for big changes in container size
        if ((newContainerWidth !== this._lastResizeContainerWidth ||
            newContainerHeight !== this._lastResizeContainerHeight) &&
          ((Math.abs(changeRatioW - 1) >= resolutionChangeRatioThreshold || isNaN(changeRatioW)) ||
            (Math.abs(changeRatioH - 1) >= resolutionChangeRatioThreshold || isNaN(changeRatioH)))) {

          this._lastResizeContainerWidth = newContainerWidth;
          this._lastResizeContainerHeight = newContainerHeight;

          // Big change: rebuild the entire images array
          this.images = optimalSizeImages($resTest, this.originalImages);

          // Preload them (they will be automatically inserted on the next cycle)
          if (this.options.preload) {
            preload(this.images, (this.index + 1) % this.images.length, this.options.preload);
          }

          // In case there is no cycle and the new source is different than the current
          if (this.images.length === 1 &&
            this._currentImage.url !== this.images[0].url) {

            // Wait a little an update the image being showed
            var that = this;
            clearTimeout(that._selectAnotherResolutionTimeout);
            that._selectAnotherResolutionTimeout = setTimeout(function () {
              that.show(0);
            }, this.options.resolutionRefreshRate);
          }
        }

        var bgCSS = {
            left: 0,
            top: 0,
            right: 'auto',
            bottom: 'auto'
          },

          // claude - backstretch responsiveness #2
          // Replaced jQuery .width()/.height()/.innerWidth()/.innerHeight()
          // with getBoundingClientRect() for the container dimension read.
          // jQuery's dimension methods can return stale values when called
          // inside a requestAnimationFrame callback that fires before the
          // browser has fully committed a layout pass (especially after
          // Bootstrap breakpoint transitions or dynamic class changes).
          // getBoundingClientRect() forces a synchronous layout reflow and
          // always returns the element's current rendered dimensions. For
          // the body/window case, window.innerWidth/innerHeight are used
          // directly as they are always current.
          boxWidth, boxHeight;

        if (this.isBody) {
          boxWidth = window.innerWidth || document.documentElement.clientWidth;
          boxHeight = window.innerHeight || document.documentElement.clientHeight;
        } else {
          var containerRect = this.$container[0].getBoundingClientRect();
          boxWidth = Math.round(containerRect.width);
          boxHeight = Math.round(containerRect.height);
        }

        var naturalWidth = this.$itemWrapper.data('width'),
          naturalHeight = this.$itemWrapper.data('height'),
          ratio = (naturalWidth / naturalHeight) || 1,
          alignX = this._currentImage.alignX === undefined ? this.options.alignX : this._currentImage.alignX,
          alignY = this._currentImage.alignY === undefined ? this.options.alignY : this._currentImage.alignY,
          scale = validScale(this._currentImage.scale || this.options.scale);

        // jadams, 2017-12-07: Added log for testing
        if (debug) {
          logger.debug('\n' + 'resize: boxHeight x boxWidth: ' + boxHeight + ' x ' + boxWidth);
        }

        // claude - optimization chances: code clarity
        // Removed commented-out debug block with non-English text

        var width, height;
        if (scale === 'fit' || scale === 'fit-smaller') {
          width = naturalWidth;
          height = naturalHeight;

          if (width > boxWidth ||
            height > boxHeight ||
            scale === 'fit-smaller') {
            var boxRatio = boxWidth / boxHeight;
            if (boxRatio > ratio) {
              width = Math.floor(boxHeight * ratio);
              height = boxHeight;
            } else if (boxRatio < ratio) {
              width = boxWidth;
              height = Math.floor(boxWidth / ratio);
            } else {
              width = boxWidth;
              height = boxHeight;
            }
          }
        } else if (scale === 'fill') {
          width = boxWidth;
          height = boxHeight;
        } else { // 'cover'
          width = Math.max(boxHeight * ratio, boxWidth);
          height = Math.max(width / ratio, boxHeight);
        }

        // Make adjustments based on image ratio
        bgCSS.top = -(height - boxHeight) * alignY;
        bgCSS.left = -(width - boxWidth) * alignX;
        bgCSS.width = width;
        bgCSS.height = height;

        // claude - backstretch responsiveness
        // Explicitly override maxWidth and maxHeight on every resize
        // cycle. CSS frameworks or site-level stylesheets may set
        // 'max-width: 100%' or 'max-height: 100%' on img/video
        // elements, which caps the computed size to the wrapper's
        // dimensions and prevents the cover/fill scale modes from
        // rendering the image at the correct (larger-than-container)
        // size. This causes the image to appear "stuck" or clipped
        // incorrectly after a browser resize.
        bgCSS.maxWidth = 'none';
        bgCSS.maxHeight = 'none';

        // claude - backstretch responsiveness #2
        // Re-enforce objectFit: 'none' on every resize cycle.
        // Bootstrap 5 applies 'object-fit: cover' or 'contain' to
        // img elements via its .img-fluid and responsive utility
        // classes. If Bootstrap's stylesheet is loaded after
        // backstretch initializes, or if responsive classes are
        // toggled dynamically (e.g. via JS or media-query-driven
        // class changes), the initial inline objectFit style set
        // during show() can be overridden by higher-specificity CSS
        // rules. Without re-applying it here, the browser's
        // object-fit algorithm takes over and sizes the image
        // content independently of backstretch's calculated
        // dimensions, causing the image to appear zoomed, cropped,
        // or misaligned after a resize.
        bgCSS.objectFit = 'none';

        if (!this.options.bypassCss) {

          // claude - backstretch responsiveness
          // Re-enforce overflow: hidden on every resize. External
          // CSS rules (media queries, specificity overrides, or
          // dynamic class changes) can reset overflow on the wrap,
          // allowing the intentionally oversized cover-mode image to
          // visually spill out of the container.
          this.$wrap
            .css({
              width: boxWidth,
              height: boxHeight,
              overflow: 'hidden'
            })
            .find('>.backstretch-item').not('.deleteable')
            .each(function () {
              var $wrapper = $(this);
              $wrapper.find('img,video,iframe')
                .css(bgCSS)
                // claude - backstretch responsiveness #2
                // Set explicit width/height attributes on iframe
                // elements (YouTube embeds) in addition to CSS
                // properties. Unlike <img> and <video>, iframes do
                // not reliably resize from CSS width/height alone in
                // all browsers — the embedded content may retain its
                // original intrinsic dimensions. Setting the element
                // attributes forces the iframe's content viewport to
                // match the intended size, ensuring YouTube videos
                // scale correctly when the browser is resized.
                .filter('iframe').attr({
                  'width': Math.round(bgCSS.width),
                  'height': Math.round(bgCSS.height)
                });
            });
        }

        var evt = $.Event('backstretch.resize', {
          relatedTarget: this.$container[0]
        });
        this.$container.trigger(evt, this);

      } catch (err) {
        // IE7 seems to trigger resize before the image is loaded.
        // This try/catch block is a hack to let it fail gracefully.
        logger.warn('resize: error caught (legacy IE7 guard): ' + err);
      }

      return this;
    },

    // https://gemini.google.com/app/28f451de55826d02
    // -----------------------------------------------------------------------
    // Gemini hat gesagt
    // To ensure your images and videos in the master header (attic) respond
    // flawlessly and natively to resizing—similar to Bootstrap 5 CSS
    // components—we must transition backstretch.js from strictly calculating
    // rigid integer pixels via JS to using modern CSS mechanisms like object-fit,
    // width: 100%, and fractional bounds where JS geometry is required.
    //
    // Here is the fixed resize() method for backstretch.js to implement.
    // You can patch this directly into your existing backstretch.js file
    // (search for resize: function () {).
    // -----------------------------------------------------------------------
    // resize: function () {
    //   try {
    //     var debug = false;
    //     var logger = log4javascript.getLogger('j1.api.attic');

    //     // Check for a better suited image after the resize
    //     var $resTest = this.options.alwaysTestWindowResolution ? $(window) : this.$root;
    //     var newContainerWidth = $resTest.width();
    //     var newContainerHeight = $resTest.height();
    //     var changeRatioW = newContainerWidth / (this._lastResizeContainerWidth || 0);
    //     var changeRatioH = newContainerHeight / (this._lastResizeContainerHeight || 0);
    //     var resolutionChangeRatioThreshold = this.options.resolutionChangeRatioThreshold || 0.0;

    //     // check for big changes in container size
    //     if ((newContainerWidth !== this._lastResizeContainerWidth || newContainerHeight !== this._lastResizeContainerHeight) &&
    //       ((Math.abs(changeRatioW - 1) >= resolutionChangeRatioThreshold ||
    //         Math.abs(changeRatioH - 1) >= resolutionChangeRatioThreshold) ||
    //         this.firstShow)) {

    //       this._lastResizeContainerWidth = newContainerWidth;
    //       this._lastResizeContainerHeight = newContainerHeight;

    //       // Note: Here is where we check if a different sized image should be loaded.
    //       var testImages = optimalSizeImages(
    //         this.options.alwaysTestWindowResolution ? $(window) : this.$root,
    //         this.originalImages);

    //       var testImage = testImages[this.index];
    //       if (this._currentImage === undefined || testImage.url !== this._currentImage.url) {
    //         // A different image is needed, load it.
    //         this.show(this.index);
    //         return; // We will have a resize running after the show.
    //       }
    //     }

    //     var boxWidth, boxHeight;

    //     if (this.isBody) {
    //       boxWidth = window.innerWidth || document.documentElement.clientWidth;
    //       boxHeight = window.innerHeight || document.documentElement.clientHeight;
    //     } else {
    //       var containerRect = this.$container[0].getBoundingClientRect();
    //       // gemini - backstretch responsiveness #3
    //       // Removed Math.round() constraints to support fractional subpixel dimensions.
    //       // Bootstrap responsive layouts and fluid grids often yield fractional container sizes,
    //       // rounding these causes visible pixel gaps, overflows, or jitter during resizing.
    //       boxWidth = containerRect.width;
    //       boxHeight = containerRect.height;
    //     }

    //     var naturalWidth = this.$itemWrapper.data('width'),
    //       naturalHeight = this.$itemWrapper.data('height'),
    //       ratio = (naturalWidth / naturalHeight) || 1,
    //       alignX = this._currentImage.alignX === undefined ? this.options.alignX : this._currentImage.alignX,
    //       alignY = this._currentImage.alignY === undefined ? this.options.alignY : this._currentImage.alignY,
    //       scale = validScale(this._currentImage.scale || this.options.scale);

    //     if(debug) {
    //       logger.debug('\n' + 'resize: boxHeight x boxWidth: ' + boxHeight + ' x ' + boxWidth);
    //     }

    //     var width, height, left, top;

    //     // gemini - backstretch responsiveness #3
    //     // Setup modern CSS variables for object-fit to behave identically to Bootstrap V5 classes.
    //     var objectFitValue = 'cover';
    //     if (scale === 'fit' || scale === 'fit-smaller') {
    //       objectFitValue = 'contain';
    //     } else if (scale === 'fill') {
    //       objectFitValue = 'fill';
    //     }
    //     var alignXPercent = Math.round(alignX * 100);
    //     var alignYPercent = Math.round(alignY * 100);

    //     if (scale === 'fit' || scale === 'fit-smaller') {
    //       width = naturalWidth;
    //       height = naturalHeight;
    //       if (width > boxWidth || height > boxHeight || scale === 'fit-smaller') {
    //         var boxRatio = boxWidth / boxHeight;
    //         if (boxRatio > ratio) {
    //           width = boxHeight * ratio;
    //           height = boxHeight;
    //         } else {
    //           height = boxWidth / ratio;
    //           width = boxWidth;
    //         }
    //       }
    //       left = (boxWidth - width) * alignX;
    //       top = (boxHeight - height) * alignY;

    //     } else if (scale === 'fill') {
    //       width = boxWidth;
    //       height = boxHeight;
    //       left = 0;
    //       top = 0;

    //     } else { // cover
    //       var boxRatio = boxWidth / boxHeight;
    //       if (boxRatio > ratio) {
    //         width = boxWidth;
    //         height = width / ratio;
    //       } else {
    //         height = boxHeight;
    //         width = height * ratio;
    //       }
    //       left = (boxWidth - width) * alignX;
    //       top = (boxHeight - height) * alignY;
    //     }

    //     if (!this.options.bypassCss) {
    //       // gemini - backstretch responsiveness #3
    //       // Set wrap width and height to purely CSS 100% instead of JS computed pixels.
    //       // This allows the container to instantly flow smoothly without waiting for the JS 
    //       // resize event loop to catch up (e.g. Bootstrap col-* recalculations).
    //       this.$wrap
    //         .css({
    //           width: '100%',
    //           height: '100%',
    //           overflow: 'hidden'
    //         })
    //         .find('>.backstretch-item').not('.deleteable')
    //         .each(function () {
    //           var $wrapper = $(this);
    //           var $media = $wrapper.find('img,video,iframe');
    //           var isIframe = $media.is('iframe');

    //           var bgCSS;

    //           // gemini - backstretch responsiveness #3
    //           // To achieve true Bootstrap 5-like responsiveness, hand image/HTML5-video scaling 
    //           // off to the browser. Only retain JavaScript sizing calculations for iframes
    //           // (such as YouTube API embeds) since iframes cannot natively scale inner 
    //           // contents with `object-fit`.
    //           if (!isIframe) {
    //             bgCSS = {
    //               left: 0,
    //               top: 0,
    //               right: 'auto',
    //               bottom: 'auto',
    //               width: '100%',
    //               height: '100%',
    //               objectFit: objectFitValue,
    //               objectPosition: alignXPercent + '% ' + alignYPercent + '%',
    //               maxWidth: 'none',
    //               maxHeight: 'none'
    //             };
    //           } else {
    //             bgCSS = {
    //               left: left + 'px',
    //               top: top + 'px',
    //               right: 'auto',
    //               bottom: 'auto',
    //               width: width + 'px',
    //               height: height + 'px',
    //               objectFit: 'none',
    //               maxWidth: 'none',
    //               maxHeight: 'none'
    //             };
    //           }

    //           $media.css(bgCSS);

    //           if (isIframe) {
    //             $media.attr('width', width).attr('height', height);
    //           }
    //         });
    //     }

    //     var ev = $.Event('backstretch.resize', {
    //       relatedTarget: this.$container[0]
    //     });
    //     this.$container.trigger(ev, this);

    //   } catch (err) {
    //     // Nothing
    //   }

    //   return this;
    // },

    // Show the slide at a certain position
    show: function (newIndex, overrideOptions) {
        var logger = log4javascript.getLogger('j1.api.attic');

        // Validate index
        if (Math.abs(newIndex) > this.images.length - 1) {
          return;
        }

        // Vars
        var that = this,
          $oldItemWrapper = that.$wrap.find('>.backstretch-item').addClass('deleteable'),
          oldVideoWrapper = that.videoWrapper,
          evtOptions = {
            relatedTarget: that.$container[0]
          };

        // Trigger the "before" event
        that.$container.trigger($.Event('backstretch.before', evtOptions), [that, newIndex]);

        // Set the new frame index
        this.index = newIndex;
        var selectedImage = that.images[newIndex];

        // Pause the slideshow
        clearTimeout(that._cycleTimeout);

        // New image

        delete that.videoWrapper; // Current item may not be a video

        var isVideo = isVideoSource(selectedImage);
        if (isVideo) {
          that.videoWrapper = new VideoWrapper(selectedImage);
          that.$item = that.videoWrapper.$video.css('pointer-events', 'none');
        } else {
          that.$item = $('<img />');
        }

        that.$itemWrapper = $('<div class="backstretch-item">')
          .append(that.$item);

        if (this.options.bypassCss) {
          that.$itemWrapper.css({
            'display': 'none'
          });
        } else {
          that.$itemWrapper.css(styles.itemWrapper);
          that.$item.css(styles.item);
        }

        // claude - optimization chances: correctness
        // Replaced deprecated .bind() with .on() (bind was removed in jQuery 3.x)
        that.$item.on(isVideo ? 'canplay' : 'load', function (e) {
          var $this = $(this),
            $wrapper = $this.parent(),
            options = $wrapper.data('options');

          if (overrideOptions) {
            options = $.extend({}, options, overrideOptions);
          }

          var imgWidth = this.naturalWidth || this.videoWidth || this.width,
            imgHeight = this.naturalHeight || this.videoHeight || this.height;

          // Save the natural dimensions
          $wrapper
            .data('width', imgWidth)
            .data('height', imgHeight);

          var getOption = function (opt) {
            return options[opt] !== undefined ?
              options[opt] :
              that.options[opt];
          };

          var transition = getOption('transition');
          var transitionEasing = getOption('transitionEasing');
          var transitionDuration = getOption('transitionDuration');

          // Show the image, then delete the old one
          var bringInNextImage = function () {

            if (oldVideoWrapper) {
              oldVideoWrapper.stop();
              oldVideoWrapper.destroy();
            }

            $oldItemWrapper.remove();

            // Resume the slideshow
            if (!that.paused && that.images.length > 1) {
              that.cycle();
            }

            // Now we can clear the background on the element, to spare memory
            if (!that.options.bypassCss && !that.isBody) {
              // jadams, 2017-09-30: leave background unchanged
              //that.$container.css('background-image', 'none');
            }

            // Trigger the "after" and "show" events
            // claude - optimization chances: correctness
            // Removed 'before' from this array. Firing 'before' inside the
            // 'after' callback is logically incorrect - the 'before' event is
            // already triggered at the start of show(). Firing it again here
            // causes duplicate/out-of-sequence events for listeners.
            // "show" (as an event) is being deprecated (used only internally)
            $(['after', 'show']).each(function () {
              that.$container.trigger($.Event('backstretch.' + this, evtOptions), [that, newIndex]);
            });

            if (isVideo) {
              that.videoWrapper.play();
            }
          };

          if ((that.firstShow && !that.options.animateFirst) || !transitionDuration || !transition) {
            // Avoid transition on first show or if there's no transitionDuration value
            $wrapper.show();
            bringInNextImage();
          } else {
            performTransition({
              'new': $wrapper,
              old: $oldItemWrapper,
              transition: transition,
              duration: transitionDuration,
              easing: transitionEasing,
              complete: bringInNextImage
            });
          }

          that.firstShow = false;

          // jadams, 2017-12-07: Added log for debug mode
          var imageWidth  = this.naturalWidth || this.videoWidth || this.width;
          var imageHeight = this.naturalHeight || this.videoHeight || this.height;
          var logText     = 'show: imageHeight x imageWidth: ' + imageHeight + ' x ' + imageWidth;

          if (that.options.debug) {
            logger.debug(logText);
          }

          // jadams, 2019-08-06: a resize requires a VISIBLE element otherwise
          // the calculation of the image dimensions will fail.
          // As a workaround, wait until the element is visible
          // Run resize on the image loaded for re-scaling
          // claude - optimization chances: performance
          // Added a maximum retry count to prevent indefinite polling if the
          // container never becomes visible (e.g. removed from DOM). The
          // original code ran setInterval(…, 10) forever in that case.
          var myID = '#' + that.$container['0']['id'];
          var visibilityRetries = 0;
          var maxVisibilityRetries = 500; // ~5 seconds at 10ms intervals
          var isVisible = setInterval(function () {
            visibilityRetries++;
            if ($(myID).is(':visible')) {
              if (that.options.debug) {
                logger.debug('\n' + 'container visible on id: ' + myID);
              }
              that.resize();
              clearInterval(isVisible);
            } else if (visibilityRetries >= maxVisibilityRetries) {
              if (that.options.debug) {
                logger.warn('\n' + 'container visibility check timed out on id: ' + myID);
              }
              clearInterval(isVisible);
            }
          }, 10); // END 'isVisible'

        });

        that.$itemWrapper.appendTo(that.$wrap);

        that.$item.attr('alt', selectedImage.alt || '');
        that.$itemWrapper.data('options', selectedImage);

        if (!isVideo) {
          that.$item.attr('src', selectedImage.url);
        }

        that._currentImage = selectedImage;

        return that;
      },

      current: function () {
          return this.index;
      },

      next: function () {
        var args = Array.prototype.slice.call(arguments, 0);
        args.unshift(this.index < this.images.length - 1 ? this.index + 1 : 0);
        return this.show.apply(this, args);
      },

      prev: function () {
        var args = Array.prototype.slice.call(arguments, 0);
        args.unshift(this.index === 0 ? this.images.length - 1 : this.index - 1);
        return this.show.apply(this, args);
      },
    
      pause: function () {
        // Pause the slideshow
        this.paused = true;

        if (this.videoWrapper) {
          this.videoWrapper.pause();
        }

        return this;
      },

      resume: function () {
        // Resume the slideshow
        this.paused = false;

        if (this.videoWrapper) {
          this.videoWrapper.play();
        }

        this.cycle();
        return this;
      },

      cycle: function () {
        // Start/resume the slideshow
        if (this.images.length > 1) {
          // Clear the timeout, just in case
          clearTimeout(this._cycleTimeout);

          var duration = (this._currentImage && this._currentImage.duration) || this.options.duration;
          var isVideo = isVideoSource(this._currentImage);

          var callNext = function () {
            this.$item.off('.cycle');

            // Check for paused slideshow
            if (!this.paused) {
              this.next();
            }
          };

          // Special video handling
          if (isVideo) {

            // Leave video at last frame
            if (!this._currentImage.loop) {
              var lastFrameTimeout = 0;

              this.$item
                .on('playing.cycle', function () {
                  var player = $(this).data('player');

                  // jadams, 2017-10-10: Workaround the wrong handling of the
                  // HTML5 Audio/Video property .data
                  // See https://www.w3schools.com/tags/ref_av_dom.asp for more
                  // details for HTML Audio and Video DOM Reference

                  // ToDo: In general it should work. To be fixed.

                  clearTimeout(lastFrameTimeout);
                  if (typeof player != 'undefined') {
                    lastFrameTimeout = setTimeout(function () {
                      player.pause();
                      player.$video.trigger('ended');
                    }, (player.getDuration() - player.getCurrentTime()) * 1000);
                  }
                })
                .on('ended.cycle', function () {
                  clearTimeout(lastFrameTimeout);
                });
            }

            // On error go to next
            this.$item.on('error.cycle initerror.cycle', $.proxy(callNext, this));
          }

          if (isVideo && !this._currentImage.duration) {
            // It's a video - playing until end
            this.$item.on('ended.cycle', $.proxy(callNext, this));

          } else {
            // Cycling according to specified duration
            this._cycleTimeout = setTimeout($.proxy(callNext, this), duration);
          }

        }
        return this;
      },

      destroy: function (preserveBackground) {
      // Stop the resize events
      $(window).off('resize.backstretch orientationchange.backstretch');

      // claude - backstretch responsiveness
      // Cancel any pending requestAnimationFrame-based resize to
      // prevent a stale callback from firing after the instance is
      // destroyed and its DOM elements removed.
      if (this._resizeRAFHandle) {
        cancelAnimationFrame(this._resizeRAFHandle);
        this._resizeRAFHandle = null;
      }

      // claude - backstretch responsiveness #2
      // Disconnect the ResizeObserver that was set up on the container
      // element during initialization. Without this, the observer
      // continues to fire callbacks for a destroyed instance, causing
      // errors when resize() attempts to read dimensions from removed
      // DOM elements.
      if (this._resizeObserver) {
        this._resizeObserver.disconnect();
        this._resizeObserver = null;
      }

      // Stop any videos
      if (this.videoWrapper) {
        this.videoWrapper.destroy();
      }

      // Clear the timeout
      clearTimeout(this._cycleTimeout);

      // Remove Backstretch
      if (!preserveBackground) {
        this.$wrap.remove();
      }
      this.$container.removeData('backstretch');
    }
  };

  /**
   * Video Abstraction Layer
   *
   * Static methods:
   * > VideoWrapper.loadYoutubeAPI() -> Call in order to load the Youtube API.
   *                                   An 'youtube_api_load' event will be triggered on $(window) when the API is loaded.
   *
   * Generic:
   * > player.type -> type of the video
   * > player.video / player.$video -> contains the element holding the video
   * > player.play() -> plays the video
   * > player.pause() -> pauses the video
   * > player.setCurrentTime(position) -> seeks to a position by seconds
   *
   * Youtube:
   * > player.ytId will contain the youtube ID if the source is a youtube url
   * > player.ytReady is a flag telling whether the youtube source is ready for playback
   * */

  var VideoWrapper = function () {
    this.init.apply(this, arguments);
  };

  /**
   * @param {Object} options
   * @param {String|Array<String>|Array<{{src: String, type: String?}}>} options.url
   * @param {Boolean} options.loop=false
   * @param {Boolean?} options.mute=true
   * @param {String?} options.poster
   * loop, mute, poster
   */
  VideoWrapper.prototype.init = function (options) {
    var that = this;
    var $video;

    var setVideoElement = function () {
      that.$video = $video;
      that.video = $video[0];
    };

    // Determine video type
    var videoType = 'video';

    if (!(options.url instanceof Array) &&
      YOUTUBE_REGEXP.test(options.url)) {
      videoType = 'youtube';
    }

    that.type = videoType;

    if (videoType === 'youtube') {
      // Try to load the API in the meantime
      VideoWrapper.loadYoutubeAPI();

      that.ytId = options.url.match(YOUTUBE_REGEXP)[2];
      var src = 'https://www.youtube.com/embed/' + that.ytId +
        '?rel=0&autoplay=0&showinfo=0&controls=0&modestbranding=1' +
        '&cc_load_policy=0&disablekb=1&iv_load_policy=3&loop=0' +
        '&enablejsapi=1&origin=' + encodeURIComponent(window.location.origin);

      that.__ytStartMuted = !!options.mute || options.mute === undefined;

      $video = $('<iframe />')
        .attr({
          'src_to_load': src
        })
        .css({
          'border': 0,
          'margin': 0,
          'padding': 0
        })
        .data('player', that);

      if (options.loop) {
        $video.on('ended.loop', function () {
          if (!that.__manuallyStopped) {
            that.play();
          }
        });
      }

      that.ytReady = false;

      setVideoElement();

      if (window['YT']) {
        that._initYoutube();
        $video.trigger('initsuccess');
      } else {
        $(window).one('youtube_api_load', function () {
          that._initYoutube();
          $video.trigger('initsuccess');
        });
      }

    } else {
      // Traditional <video> tag with multiple sources

      $video = $('<video>')
        .prop('autoplay', false)
        .prop('controls', false)
        .prop('loop', !!options.loop)
        .prop('muted', !!options.mute || options.mute === undefined)
        .prop('preload', 'auto')    // Let the first frames be available before playback, as we do transitions
        .prop('poster', options.poster || '');

      var sources = (options.url instanceof Array) ? options.url : [options.url];

      for (var i = 0; i < sources.length; i++) {
        var sourceItem = sources[i];
        if (typeof (sourceItem) === 'string') {
          sourceItem = {
            src: sourceItem
          };
        }
        $('<source>')
          .attr('src', sourceItem.src)
          // Make sure to not specify type if unknown -
          //   so the browser will try to autodetect.
          .attr('type', sourceItem.type || null)
          .appendTo($video);
      }

      if (!$video[0].canPlayType || !sources.length) {
        $video.trigger('initerror');
      } else {
        $video.trigger('initsuccess');
      }

      setVideoElement();
    }

  };

  VideoWrapper.prototype._initYoutube = function () {
    var that = this;

    var YT = window['YT'];

    that.$video
      .attr('src', that.$video.attr('src_to_load'))
      .removeAttr('src_to_load');

    // It won't init if it's not in the DOM, so we emulate that
    var hasParent = !!that.$video[0].parentNode;
    if (!hasParent) {
      var $tmpParent = $('<div>').css('display', 'none !important').appendTo(document.body);
      that.$video.appendTo($tmpParent);
    }

    var player = new YT.Player(that.video, {
      events: {
        'onReady': function () {

          if (that.__ytStartMuted) {
            player.mute();
          }

          if (!hasParent) {
            // Restore parent to old state - without interrupting any changes
            if (that.$video[0].parentNode === $tmpParent[0]) {
              that.$video.detach();
            }
            $tmpParent.remove();
          }

          that.ytReady = true;
          that._updateYoutubeSize();
          that.$video.trigger('canplay');
        },

        'onStateChange': function (event) {
          switch (event.data) {
            case YT.PlayerState.PLAYING:
              that.$video.trigger('playing');
              break;
            case YT.PlayerState.ENDED:
              that.$video.trigger('ended');
              break;
            case YT.PlayerState.PAUSED:
              that.$video.trigger('pause');
              break;
            case YT.PlayerState.BUFFERING:
              that.$video.trigger('waiting');
              break;
            case YT.PlayerState.CUED:
              that.$video.trigger('canplay');
              break;
          }
        },

        'onPlaybackQualityChange': function () {
          that._updateYoutubeSize();
          that.$video.trigger('resize');
        },

        'onError': function (err) {
          that.hasError = true;
          that.$video.trigger({
            'type': 'error',
            'error': err
          });
        }
      }
    });

    that.ytPlayer = player;

    return that;
  };

  VideoWrapper.prototype._updateYoutubeSize = function () {
    var that = this;

    switch (that.ytPlayer.getPlaybackQuality() || 'medium') {
      case 'small':
        that.video.videoWidth = 426;
        that.video.videoHeight = 240;
        break;
      case 'medium':
        that.video.videoWidth = 640;
        that.video.videoHeight = 360;
        break;
      default:
      case 'large':
        that.video.videoWidth = 854;
        that.video.videoHeight = 480;
        break;
      case 'hd720':
        that.video.videoWidth = 1280;
        that.video.videoHeight = 720;
        break;
      case 'hd1080':
        that.video.videoWidth = 1920;
        that.video.videoHeight = 1080;
        break;
      case 'highres':
        that.video.videoWidth = 2560;
        that.video.videoHeight = 1440;
        break;
    }

    return that;
  };

  VideoWrapper.prototype.play = function () {
    var that = this;

    that.__manuallyStopped = false;

    if (that.type === 'youtube') {
      if (that.ytReady) {
        that.$video.trigger('play');
        that.ytPlayer.playVideo();
      }
    } else {
      that.video.play();
    }

    return that;
  };

  VideoWrapper.prototype.pause = function () {
    var that = this;

    that.__manuallyStopped = false;

    if (that.type === 'youtube') {
      if (that.ytReady) {
        that.ytPlayer.pauseVideo();
      }
    } else {
      that.video.pause();
    }

    return that;
  };

  VideoWrapper.prototype.stop = function () {
    var that = this;

    that.__manuallyStopped = true;

    if (that.type === 'youtube') {
      if (that.ytReady) {
        that.ytPlayer.pauseVideo();
        that.ytPlayer.seekTo(0);
      }
    } else {
      that.video.pause();
      that.video.currentTime = 0;
    }

    return that;
  };

  VideoWrapper.prototype.destroy = function () {
    var that = this;

    if (that.ytPlayer) {
      that.ytPlayer.destroy();
    }

    that.$video.remove();

    return that;
  };

  // claude - optimization chances: code clarity
  // Removed unused 'seconds' parameter (likely copy-paste from setCurrentTime)
  VideoWrapper.prototype.getCurrentTime = function () {
    var that = this;

    if (that.type === 'youtube') {
      if (that.ytReady) {
        return that.ytPlayer.getCurrentTime();
      }
    } else {
      return that.video.currentTime;
    }

    return 0;
  };

  VideoWrapper.prototype.setCurrentTime = function (seconds) {
    var that = this;

    if (that.type === 'youtube') {
      if (that.ytReady) {
        that.ytPlayer.seekTo(seconds, true);
      }
    } else {
      that.video.currentTime = seconds;
    }

    return that;
  };

  VideoWrapper.prototype.getDuration = function () {
    var that = this;

    if (that.type === 'youtube') {
      if (that.ytReady) {
        return that.ytPlayer.getDuration();
      }
    } else {
      return that.video.duration;
    }

    return 0;
  };

  /**
   * This will load the youtube API (if not loaded yet)
   * Use $(window).one('youtube_api_load', ...) to listen for API loaded event
   */
  VideoWrapper.loadYoutubeAPI = function () {
    if (window['YT']) {
      return;
    }
    if (!$('script[src*=www\\.youtube\\.com\\/iframe_api]').length) {
      $('<script src="https://www.youtube.com/iframe_api">').appendTo('body');
    }
    var ytAPILoadInt = setInterval(function () {
      if (window['YT'] && window['YT'].loaded) {
        $(window).trigger('youtube_api_load');

        // claude - optimization chances: correctness
        // Bug fix: was using clearTimeout() on a setInterval() handle.
        // While most browsers share the timer ID pool, this is technically
        // incorrect per the HTML spec and could fail in strict environments.
        clearInterval(ytAPILoadInt);
      }
    }, 10);
  };

  var getDeviceOrientation = function () {

    if ('matchMedia' in window) {
      if (window.matchMedia('(orientation: portrait)').matches) {
        return 'portrait';
      } else if (window.matchMedia('(orientation: landscape)').matches) {
        return 'landscape';
      }
    }

    if (screen.height > screen.width) {
      return 'portrait';
    }

    // Even square devices have orientation,
    //   but a desktop browser may be too old for `matchMedia`.
    // Defaulting to `landscape` for the VERY rare case of a square desktop screen is good enough.
    return 'landscape';
  };

  var getWindowOrientation = function () {
    if (window.innerHeight > window.innerWidth) {
      return 'portrait';
    }
    if (window.innerWidth > window.innerHeight) {
      return 'landscape';
    }

    return 'square';
  };

  /* SUPPORTS FIXED POSITION?
   *
   * claude - optimization chances: code clarity
   * Note: All browsers checked below (IE6, iOS < 5, Android < 2.2,
   * Firefox Mobile < 6, Opera Mobile < 7458, WebOS < 3, MeeGo) have
   * been end-of-life for over a decade. This function now always returns
   * true in practice. Consider replacing with a constant 'true' if
   * legacy browser support is no longer required.
   *
   * Based on code from jQuery Mobile 1.1.0
   * http://jquerymobile.com/
   * ========================= */

  var supportsFixedPosition = (function () {
    var ua = navigator.userAgent,
      platform = navigator.platform,  // Rendering engine is Webkit, and capture major version
      wkmatch = ua.match(/AppleWebKit\/([0-9]+)/),
      wkversion = !!wkmatch && wkmatch[1],
      ffmatch = ua.match(/Fennec\/([0-9]+)/),
      ffversion = !!ffmatch && ffmatch[1],
      operammobilematch = ua.match(/Opera Mobi\/([0-9]+)/),
      omversion = !!operammobilematch && operammobilematch[1],
      iematch = ua.match(/MSIE ([0-9]+)/),
      ieversion = !!iematch && iematch[1];

    return !(
      // iOS 4.3 and older : Platform is iPhone/Pad/Touch and Webkit version is less than 534 (ios5)
      ((platform.indexOf('iPhone') > -1 || platform.indexOf('iPad') > -1 || platform.indexOf('iPod') > -1) && wkversion && wkversion < 534) ||

      // Opera Mini
      (window.operamini && ({}).toString.call(window.operamini) === '[object OperaMini]') ||
      (operammobilematch && omversion < 7458) ||

      //Android lte 2.1: Platform is Android and Webkit version is less than 533 (Android 2.2)
      (ua.indexOf('Android') > -1 && wkversion && wkversion < 533) ||

      // Firefox Mobile before 6.0 -
      (ffversion && ffversion < 6) ||

      // WebOS less than 3
      ('palmGetResource' in window && wkversion && wkversion < 534) ||

      // MeeGo
      (ua.indexOf('MeeGo') > -1 && ua.indexOf('NokiaBrowser/8.5.0') > -1) ||

      // IE6
      (ieversion && ieversion <= 6)
    );
  }());

}(jQuery, window));