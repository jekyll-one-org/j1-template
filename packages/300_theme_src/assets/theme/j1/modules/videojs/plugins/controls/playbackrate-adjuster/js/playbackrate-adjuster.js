/*
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/modules/videojs/js/plugins/controls/playbackrate-adjuster/playbackrate-adjuster.js
 # Provides the playbackrate-adjuster middleware for Video.js V8 and newer
 # See: https://github.com/ctd1500/videojs-hotkeys
 #
 # Product/Info:
 # http://jekyll.one
 #
 # Copyright (C) Gary Katsevman <me@gkatsev.com>
 # Copyright (C) 2023-2025 Juergen Adams
 #
 # playbackrate-adjuster is licensed under the under MIT License.
 #
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
    var version = "0.0.1";

    const createNewRanges = (timeRanges, playbackRate) => {
      const newRanges = [];

      for (let i = 0; i < timeRanges.length; i++) {
        newRanges.push([
          timeRanges.start(i) / playbackRate,
          timeRanges.end(i) / playbackRate]);
      }

      return videojs.createTimeRange(newRanges);
    };

    const playbackrateAdjuster = function(player) {
      let tech;

      player.on('ratechange', function() {
        tech.trigger('durationchange');
        tech.trigger('timeupdate');
      });

      return {
        setSource(srcObj, next) {
          next(null, srcObj);
        },

        setTech(newTech) {
          tech = newTech;
        },

        duration(dur) {
          return dur / player.playbackRate();
        },

        currentTime(ct) {
          return ct / player.playbackRate();
        },

        setCurrentTime(ct) {
          return ct * player.playbackRate();
        },

        buffered(bf) {
          return createNewRanges(bf, player.playbackRate());
        },

        seekable(seekable) {
          return createNewRanges(seekable, player.playbackRate());
        },

        played(played) {
          return createNewRanges(played, player.playbackRate());
        }
      };

    }; // END playbackrateAdjuster

    var registerPlugin = videojs.registerPlugin || videojs.plugin;

    // register plugin
    //
    registerPlugin('playbackrateAdjuster', playbackrateAdjuster);

}));