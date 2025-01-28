/*
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/modules/videojs/js/plugins/controls/skipbuttons/skipbuttons.js
 # Provides the skipbuttons plugin for Video.js V8 and newer
 # See: https://github.com/mister-ben/videojs-seek-buttons/edit/master/README.md
 #
 # Product/Info:
 # https://github.com/mister-ben/videojs-seek-buttons
 # http://jekyll.one
 #
 # Copyright (C) 2023 mister-ben
 # Copyright (C) 2023-2025 Juergen Adams
 #
 # skipbuttons is licensed under the Apache License 2.0.
 # See: https://github.com/mister-ben/videojs-seek-buttons/blob/master/LICENSE
 # J1 Theme is licensed under MIT License.
 # See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 # -----------------------------------------------------------------------------
*/

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('video.js')) :
  typeof define === 'function' && define.amd ? define(['video.js'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.videojsskipButtons = factory(global.videojs));
})(this, (function (videojs) {
  
  'use strict';

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  var videojs__default = /*#__PURE__*/_interopDefaultLegacy(videojs);
  var version = "4.0.2";

  const Button = videojs__default["default"].getComponent('Button'); // Default options for the plugin.

  const defaults = {
    forwardIndex:  1,
    backwardIndex: 1
  };

  // Set up buttons when the player is ready
  // 
  const onPlayerReady = (player, options) => {
    player.addClass('vjs-seek-buttons');

    if (options.forward && options.forward > 0) {
      player.controlBar.seekForward = player.controlBar.addChild('seekButton', {
        direction: 'forward',
        seconds: options.forward
      }, options.forwardIndex);
    }

    if (options.backward && options.backward > 0) {
      player.controlBar.seekBack = player.controlBar.addChild('seekButton', {
        direction: 'backward',
        seconds: options.backward
      }, options.backwardIndex);
    }
  };

  // Plugin init if ready or on ready
  // An object of options left to the plugin author to define.
  //
  const skipButtons = function (options) {
    this.ready(() => {
      onPlayerReady(this, videojs__default["default"].obj.merge(defaults, options));
    });
  }; 

  // Set version number
  //
  skipButtons.VERSION = version;

  // Button to seek forward/backward
  //
  class SeekButton extends Button {

    // Constructor for class
    //
    // @param {Player|Object} player The player
    // @param {Object=} options Button options
    // @param {string} options.direction back or forward
    // @param {Int} options.seconds number of seconds to seek
    //
    constructor(player, options) {
      super(player, options);
      this.$('.vjs-icon-placeholder').classList.add('vjs-icon-replay');
//    this.$('.vjs-icon-placeholder').classList.add('vjs-icon-next-item');

      if (this.options_.direction === 'forward') {
        this.controlText(this.localize('Seek forward {{seconds}} seconds').replace('{{seconds}}', this.options_.seconds));
      } else if (this.options_.direction === 'backward') {
        this.controlText(this.localize('Seek backward {{seconds}} seconds').replace('{{seconds}}', this.options_.seconds));
      }
    }

    // Return button class names which include the seek amount
    //
    buildCSSClass() {
      /* Each button will have the classes:
         `vjs-seek-button`
         `skip-forward` or `skip-backward`
         `skip-n` where `n` is the number of seconds
         So you could have a generic icon for "skip backward" and a more
         specific one for "skip back 30 seconds"
      */
      return `vjs-seek-button skip-${this.options_.direction} ` + `skip-${this.options_.seconds} ${super.buildCSSClass()}`;
    }

    // Seek with the button's configured offset
    //
    handleClick() {
      const now = this.player_.currentTime();

      if (this.options_.direction === 'forward') {
        let duration = this.player_.duration();

        if (this.player_.liveTracker && this.player_.liveTracker.isLive()) {
          duration = this.player_.liveTracker.seekableEnd();
        }

        this.player_.currentTime(Math.min(now + this.options_.seconds, duration));
      } else if (this.options_.direction === 'backward') {
        this.player_.currentTime(Math.max(0, now - this.options_.seconds));
      }
    }

  }

  // register components|plugin
  //
  videojs__default["default"].registerComponent('SeekButton', SeekButton);
  videojs__default["default"].registerPlugin('skipButtons', skipButtons);

  return skipButtons;

}));
