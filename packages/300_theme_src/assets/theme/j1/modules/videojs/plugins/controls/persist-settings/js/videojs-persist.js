/*! @name videojs-persist @version 0.2.0 @license MIT */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('video.js')) :
  typeof define === 'function' && define.amd ? define(['video.js'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.videojsPersist = factory(global.videojs));
})(this, (function (videojs) { 'use strict';

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  var videojs__default = /*#__PURE__*/_interopDefaultLegacy(videojs);

  var version = "0.2.0";

  // Default options for the plugin.
  const defaults = {
    muted: true,
    playbackRate: true,
    volume: true,
    restoreUnsupportedRate: false,
    key: 'videojs-persist'
  };

  /**
   * Checks local storage is available
   *
   * @return {boolean} whether available
   */
  const localStorageAvailable = () => {
    const key = 'videojs-persist-test-' + Math.floor(Math.random() * 10);
    try {
      window.localStorage.setItem(key, '.');
      window.localStorage.removeItem(key);
      return true;
    } catch (e) {
      return false;
    }
  };

  /**
   * Function to invoke when the player is ready.
   *
   * This is a great place for your plugin to initialize itself. When this
   * function is called, the player will have its DOM and child components
   * in place.
   *
   * @function onPlayerReady
   * @param    {Player} player
   *           A Video.js player object.
   *
   * @param    {Object} [options={}]
   *           A plain object containing options for the plugin.
   */
  const onPlayerReady = (player, options) => {
    player.addClass('vjs-persist');
    const playerRates = player.playbackRates ? player.playbackRates() : player.options_.playbackRates || [];
    const data = JSON.parse(window.localStorage.getItem(options.key)) || {};
    ['playbackRate', 'volume', 'muted'].forEach(prop => {
      if (!options[prop]) {
        return;
      }
      const val = data[prop];
      if (val) {
        if (prop === 'playbackRate' && !options.restoreUnsupportedRate && !playerRates.includes(val)) {
          return;
        }
        player[prop](val);
      }
    });
    if (options.playbackRate) {
      player.on('ratechange', () => {
        player.defaultPlaybackRate(player.playbackRate());
        data.playbackRate = player.playbackRate();
        window.localStorage.setItem(options.key, JSON.stringify(data));
      });
    }
    if (options.muted || options.volume) {
      player.on('volumechange', () => {
        if (options.muted) {
          player.defaultMuted(player.muted());
          data.muted = player.muted();
        }
        if (options.volume) {
          data.volume = player.volume();
        }
        window.localStorage.setItem(options.key, JSON.stringify(data));
      });
    }
  };

  /**
   * A video.js plugin.
   *
   * In the plugin function, the value of `this` is a video.js `Player`
   * instance. You cannot rely on the player being in a "ready" state here,
   * depending on how the plugin is invoked. This may or may not be important
   * to you; if not, remove the wait for "ready"!
   *
   * @function persist
   * @param    {Object} [options={}]
   *           An object of options left to the plugin author to define.
   */
  const persist = function (options) {
    if (!localStorageAvailable()) {
      videojs__default["default"].log('videojs-persist aborted. localStorage not available.');
      return;
    }
    this.ready(() => {
      onPlayerReady(this, (videojs__default["default"].obj ? videojs__default["default"].obj.merge : videojs__default["default"].mergeOptions)(defaults, options));
    });
  };

  // Register the plugin with video.js.
  videojs__default["default"].registerPlugin('persist', persist);

  // Include the version number.
  persist.VERSION = version;

  return persist;

}));
