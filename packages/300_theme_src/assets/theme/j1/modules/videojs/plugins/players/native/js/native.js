/*
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/modules/videojs/js/plugins/players/native/js/native.js
 # Provides Native HTML5 Video Playback Plugin for Video.js V8 and newer
 # claude - change skipAd API to local files #1
 #
 # Product/Info:
 # http://jekyll.one
 #
 # Copyright (C) 2026 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # For details, see: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 # -----------------------------------------------------------------------------
*/

/* global define */
(function (root, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    var videojs = require('video.js');
    module.exports = factory(videojs.default || videojs);
  } else if (typeof define === 'function' && define.amd) {
    define(['videojs'], function (videojs) {
      return (root.NativePlayer = factory(videojs));
    });
  } else {
    root.NativePlayer = factory(root.videojs);
  }
}(this, function (videojs) {
  'use strict';

  // ---------------------------------------------------------------------------
  // Constants
  // claude - change skipAd API to local files #1
  // ---------------------------------------------------------------------------

  const env   = 'dev';                                                           // dev | prod
  const isDev = (env === 'dev');

  // ---------------------------------------------------------------------------
  // Module variables
  // ---------------------------------------------------------------------------

  var logger         = log4javascript.getLogger('videoJS.plugin.nativePlayer');
  var startTimeModule;
  var endTimeModule;

  // ---------------------------------------------------------------------------
  // Helper Functions
  // ---------------------------------------------------------------------------

  /**
   * generateId - generate a random alphanumeric ID string
   * @param {number} [length=11] - Desired ID length
   * @returns {string} - Generated ID
   */
  function generateId(length = 11) {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let id = '';
    for (let i = 0; i < length; i++) {
      id += chars[Math.floor(Math.random() * chars.length)];
    }
    return id;
  }

  // ---------------------------------------------------------------------------
  // Plugin function
  // claude - change skipAd API to local files #1
  // Replaces the youtube.js YouTube Tech with a lightweight video.js plugin
  // that delegates all actual decoding to video.js's built-in Html5 tech.
  // Supports local and remote MP4, WebM, and OGG video files without any
  // third-party dependencies.
  // Dispatches the same custom DOM events the videoPlayer adapter expects,
  // but with native-video names instead of YouTube-prefixed names:
  //   ytVideoDataResolved → videoDataResolved
  //   ytVideoEnded        → videoEnded
  //   ytVideoManualPlay   → videoManualPlay
  // ---------------------------------------------------------------------------

  /**
   * nativePlayer - video.js plugin for native HTML5 video playback.
   *
   * @param {Object} [options]        - Plugin options
   * @param {string} [options.title]  - Optional video title (overrides data-title attribute)
   * @param {string} [options.poster] - Optional poster image URL
   */
  function nativePlayer(options) {
    var player = this;

    options = options || {};

    // -------------------------------------------------------------------------
    // getVideoData
    // claude - change skipAd API to local files #1
    // Collect metadata from the native HTML5 player equivalent to the data
    // YouTube's getVideoData() used to return.  A stable videoId is derived
    // from the filename portion of the src URL so downstream playlist logic
    // can continue to use the videoId field without modification.
    // -------------------------------------------------------------------------
    function getVideoData() {
      var src      = player.currentSrc()  || '';
      var title    = options.title
                     || player.el().getAttribute('data-title')
                     || '';
      var duration = isNaN(player.duration()) ? 0 : (player.duration() || 0);
      var type     = player.currentType() || 'video/mp4';

      // derive a stable videoId from the filename (without extension)
      // so playlist entries using videoId still resolve correctly
      var videoId  = src.split('/').pop().replace(/\.[^.]+$/, '') || src;

      return {
        src:      src,
        videoId:  videoId,
        title:    title,
        duration: duration,
        type:     type
      };
    }

    // -------------------------------------------------------------------------
    // dispatchVideoDataResolved
    // claude - change skipAd API to local files #1
    // Replaces the 'ytVideoDataResolved' event dispatched by youtube.js.
    // Fired when metadata is available so j1.adapter.videoPlayer can store
    // the video info and attach per-player event bridges.
    // -------------------------------------------------------------------------
    function dispatchVideoDataResolved(source) {
      try {
        var videoData = getVideoData();

        document.dispatchEvent(new CustomEvent('videoDataResolved', {
          detail: {
            videoData:  videoData,
            videoTitle: videoData.title,
            source:     source || 'nativePlayer'
          }
        }));

        isDev && logger.debug('\n' + 'dispatched event: videoDataResolved (source: ' + source + ')');
      } catch (e) {
        logger.error('\n' + 'failed to dispatch videoDataResolved: ' + e);
      }
    }

    // -------------------------------------------------------------------------
    // dispatchVideoEnded
    // claude - change skipAd API to local files #1
    // Replaces the 'ytVideoEnded' custom event previously bridged from the
    // video.js 'ended' event inside skipad.js.  The bridge is no longer
    // needed because this plugin is the canonical source of truth for the
    // ended signal.
    // -------------------------------------------------------------------------
    function dispatchVideoEnded() {
      try {
        var videoData = getVideoData();

        document.dispatchEvent(new CustomEvent('videoEnded', {
          detail: {
            source:  'nativePlayer',
            src:     videoData.src,
            videoId: videoData.videoId
          }
        }));

        isDev && logger.debug('\n' + 'dispatched event: videoEnded');
      } catch (e) {
        logger.error('\n' + 'failed to dispatch videoEnded: ' + e);
      }
    }

    // -------------------------------------------------------------------------
    // dispatchVideoManualPlay
    // claude - change skipAd API to local files #1
    // Replaces the 'ytVideoManualPlay' event.  Fired on every play() call so
    // the loop-mode logic in j1.adapter.videoPlayer can reset its loop-start
    // marker to the currently playing video.
    // -------------------------------------------------------------------------
    function dispatchVideoManualPlay() {
      try {
        var videoData = getVideoData();

        document.dispatchEvent(new CustomEvent('videoManualPlay', {
          detail: {
            source:  'nativePlayer',
            src:     videoData.src,
            videoId: videoData.videoId
          }
        }));

        isDev && logger.debug('\n' + 'dispatched event: videoManualPlay');
      } catch (e) {
        logger.error('\n' + 'failed to dispatch videoManualPlay: ' + e);
      }
    }

    // -------------------------------------------------------------------------
    // Attach native video.js event listeners
    // claude - change skipAd API to local files #1
    // All events come directly from video.js's Html5 tech (the browser's
    // native <video> element) — no YouTube IFrame API is involved.
    // -------------------------------------------------------------------------

    // loadedmetadata: dispatch videoDataResolved as soon as the browser has
    // read the media dimensions, duration, and track list from the file
    // header.  This is the earliest moment reliable metadata is available.
    player.on('loadedmetadata', function () {
      isDev && logger.debug('\n' + 'event: loadedmetadata — src=' + player.currentSrc());
      dispatchVideoDataResolved('loadedmetadata');
    });

    // playing: re-dispatch videoDataResolved after each src swap so the
    // adapter always has the latest video info (e.g. after embedRunVideo
    // changes the source for the next playlist item).
    player.on('playing', function () {
      dispatchVideoDataResolved('playing');
    });

    // play: fired on every play() call (user interaction or programmatic).
    // Used by loop mode to reset the loop-start marker.
    player.on('play', function () {
      dispatchVideoManualPlay();
    });

    // ended: fired when the native video element reaches the end of the
    // media.  Loop mode listens for videoEnded to advance the playlist.
    player.on('ended', function () {
      dispatchVideoEnded();
    });

    isDev && logger.debug('\n' + 'nativePlayer plugin: event listeners attached');

    // -------------------------------------------------------------------------
    // injectCss
    // claude - change skipAd API to local files #1
    // Inject minimal CSS for the native player.  Mirrors the pattern used by
    // youtube.js#injectCss() but removes all YouTube-specific rules.
    // -------------------------------------------------------------------------
    (function injectCss() {
      // hide the control bar when the 'vjs-native-hide-controlbar' class
      // is added to the player container (same pattern as
      // 'vjs-youtube-hide-controlbar' in the old youtube.js)
      const css = `
        .vjs-native .vjs-big-play-button { display: block; }
        .vjs-native.vjs-native-hide-controlbar .vjs-control-bar { display: none !important; }
      `;

      var head  = document.head || document.getElementsByTagName('head')[0];
      var style = document.createElement('style');
      style.type = 'text/css';

      if (style.styleSheet) {
        style.styleSheet.cssText = css;
      } else {
        style.appendChild(document.createTextNode(css));
      }

      head.appendChild(style);
      isDev && logger.debug('\n' + 'nativePlayer: CSS injected');
    }());

  } // END nativePlayer plugin function

  // ---------------------------------------------------------------------------
  // canPlayType helper
  // claude - change skipAd API to local files #1
  // Exposes the supported MIME types for use by the videoPlayer adapter
  // (analogous to Youtube.canPlayType in youtube.js).
  // ---------------------------------------------------------------------------
  nativePlayer.canPlayType = function (type) {
    return ['video/mp4', 'video/webm', 'video/ogg'].indexOf(type) !== -1
      ? 'probably'
      : '';
  };

  // ---------------------------------------------------------------------------
  // Register the plugin with video.js
  // claude - change skipAd API to local files #1
  // video.js's built-in Html5 tech handles all actual decoding; this plugin
  // only adds the custom event dispatching layer on top of it.
  // ---------------------------------------------------------------------------
  if (typeof videojs.registerPlugin !== 'undefined') {
    videojs.registerPlugin('nativePlayer', nativePlayer);
  } else {
    console.error('nativePlayer: unsupported version of videoJS detected: ' + videojs.VERSION);
  }

  // ---------------------------------------------------------------------------
  // initialize plugin if page ready
  // ---------------------------------------------------------------------------
  var dependencies_met_page_ready = setInterval(() => {
    var pageState      = $('#content').css('display');
    var pageVisible    = (pageState === 'block');
    var j1CoreFinished = (j1.getState() === 'finished');

    if (j1CoreFinished && pageVisible) {
      const isDev = (j1.env === 'development' || j1.env === 'dev');

      startTimeModule = Date.now();

      isDev && logger.debug('\n' + 'initializing plugin: started');
      isDev && logger.debug('\n' + 'version of videoJS detected: ' + videojs.VERSION);

      endTimeModule = Date.now();
      isDev && logger.debug('\n' + 'initializing plugin: finished');
      isDev && logger.debug('\n' + 'plugin initializing time: ' + (endTimeModule - startTimeModule) + 'ms');

      clearInterval(dependencies_met_page_ready);
    }
  }, 10);

}));
