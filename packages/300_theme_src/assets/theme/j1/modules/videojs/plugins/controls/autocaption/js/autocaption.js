/*
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/modules/videojs/js/plugins/controls/autocaption/autocaption.js
 # Provides the autocaption plugin for Video.js V8 and newer
 # See: https://github.com/mister-ben/videojs-auto-caption/edit/master/README.md
 #
 # Product/Info:
 # https://github.com/mister-ben/videojs-auto-caption
 # http://jekyll.one
 #
 # Copyright (C) 2023 mister-ben
 # Copyright (C) 2023-2025 Juergen Adams
 #
 # videojs-auto-caption is licensed under the Apache License 2.0.
 # See: https://github.com/mister-ben/videojs-auto-caption/blob/master/LICENSE
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
  
    // Default options for the button.
    const Button = videojs__default["default"].getComponent('Button'); 

    // Default options for the plugin.
    const defaults = {
        enabled:        false,
    };

    // Enables the best matching caption
    const update = function() {

        const lang      = this.language();
        const tracks    = this.textTracks();
        const matches   = {
            exact: [],
            twoletter: [],
            fallback: [],
            default: []
        };

        const candidateTracks = Array.prototype.filter.call(tracks, t => {
            return t.kind === 'subtitles' || t.kind === 'captions';
        });

        candidateTracks.forEach(t => {
            // Player normalises language to lower case
            const trackLang = t.language.toLowerCase();

            // `en-US` ~= `en` ~= `en-GB`
            if (trackLang.split('-')[0] === lang.split('-')[0]) {
                matches.twoletter.push(t);

                // `en-US` === `en-US`
                if (trackLang === lang) {
                    matches.exact.push(t);
                }
            }

            // Honour the default if a language didn't match
            if (t.default) {
                matches.default.push(t);
            }
        }); // END forEach

        // Join arrays to order preference
        //
        const selectedTracks = matches.exact
            .concat(matches.twoletter)
            .concat(matches.defaultMatches);

        if (selectedTracks.length > 0) {
            const selectedTrack = selectedTracks[0];

            for (let i = 0; i < tracks.length; i++) {
                if (tracks[i] === selectedTrack) {
                    tracks[i].mode = 'showing';
                } else {
                    tracks[i].mode = 'disabled';
                }
            } // END for
        } // END if 'selectedTracks'

    }; // END function 'update'

    /*
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
        player.addClass('vjs-auto-caption');
        if (player.usingPlugin('perSourceBehaviors')) {
            player.on('sourcechanged', function() {
            player.onePerSrc('canplay', update);
            });
        } else {
            player.one('canplay', update);
        }
    };

    /*
     * In the plugin function, the value of `this` is a video.js `Player`
     * instance. You cannot rely on the player being in a "ready" state here,
     * depending on how the plugin is invoked. This may or may not be important
     * to you; if not, remove the wait for "ready"!
     *
     * @function autoCaption
     * @param    {Object} [options={}]
     *           An object of options left to the plugin author to define.
    */
    const autoCaption = function(options) {
        this.ready(() => {
            onPlayerReady(this, videojs.mergeOptions(defaults, options));
        });
    };

    // register plugin
    //
    videojs__default["default"].registerPlugin('autoCaption', autoCaption);

    return autoCaption;

}));