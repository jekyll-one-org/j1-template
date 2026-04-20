/*
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/modules/lightGallery/js/plugins/lg-video.js (6)
 # Provides lightGallery v2.8.3 JS code for the plugin lgVideo
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2025 Sachin Neravath
 # Copyright (C) 2023-2026 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 # lightGallery is licensed under the GPLv3 license
 # See: https://github.com/sachinchoolur/lightGallery/blob/master/LICENSE
 # -----------------------------------------------------------------------------
*/

/*!
 * lightgallery | 2.8.3 | March 1st 2025
 * http://www.lightgalleryjs.com/
 * Copyright (c) 2020 Sachin Neravath;
 * @license GPLv3
 */

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.lgVideo = factory());
}(this, (function () {
'use strict';

    /*! 
    ****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    **************************************************************************** 
    */

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    // jadams
    var videoSettings = {
        autoplayFirstVideo:         true,
        htmlPlayerParams:           false,
        youTubePlayerParams:        false,
//      vimeoPlayerParams:          false,
//      dailymotionPlayerParams:    false,
//      wistiaPlayerParams:         false,
//      tiktokPlayerParams:         false,
        gotoNextSlideOnVideoEnd:    true,
        autoplayVideoOnSlide:       false,
        videojs:                    false,
        videojsTheme:               '',
        videojsOptions:             {},
    };

    /**
     * List of lightGallery events
     * All events should be documented here
     * Below interfaces are used to build the website documentations
     * */
    var lGEvents = {
        afterAppendSlide:       'lgAfterAppendSlide',
        init:                   'lgInit',
        hasVideo:               'lgHasVideo',
        containerResize:        'lgContainerResize',
        updateSlides:           'lgUpdateSlides',
        afterAppendSubHtml:     'lgAfterAppendSubHtml',
        beforeOpen:             'lgBeforeOpen',
        afterOpen:              'lgAfterOpen',
        slideItemLoad:          'lgSlideItemLoad',
        beforeSlide:            'lgBeforeSlide',
        afterSlide:             'lgAfterSlide',
        posterClick:            'lgPosterClick',
        dragStart:              'lgDragStart',
        dragMove:               'lgDragMove',
        dragEnd:                'lgDragEnd',
        beforeNextSlide:        'lgBeforeNextSlide',
        beforePrevSlide:        'lgBeforePrevSlide',
        beforeClose:            'lgBeforeClose',
        afterClose:             'lgAfterClose',
        rotateLeft:             'lgRotateLeft',
        rotateRight:            'lgRotateRight',
        flipHorizontal:         'lgFlipHorizontal',
        flipVertical:           'lgFlipVertical',
        autoplay:               'lgAutoplay',
        autoplayStart:          'lgAutoplayStart',
        autoplayStop:           'lgAutoplayStop',
    };


    var isEmpty = function (obj) {
        return Object.keys(obj).length === 0;
    };

    var param = function (obj) {
        return Object.keys(obj)
            .map(function (k) {
            return encodeURIComponent(k) + '=' + encodeURIComponent(obj[k]);
        })
            .join('&');
    };

    var paramsToObject = function (url) {
        var paramas = url
            .slice(1)
            .split('&')
            .map(function (p) { return p.split('='); })
            .reduce(function (obj, pair) {
            var _a = pair.map(decodeURIComponent), key = _a[0], value = _a[1];
            obj[key] = value;
            return obj;
        }, {});
        return paramas;
    };

    // jadams
    var getYouTubeParams = function (videoInfo, youTubePlayerParamsSettings) {
        if (!videoInfo.youtube)
            return '';
        var slideUrlParams = videoInfo.youtube[2]
            ? paramsToObject(videoInfo.youtube[2])
            : '';
        // For youtube first params gets priority if duplicates found
        var defaultYouTubePlayerParams = {
            wmode: 'opaque',
            autoplay: 0,
            mute: 1,
            enablejsapi: 1,
        };
        var playerParamsSettings    = youTubePlayerParamsSettings || {};
        var youTubePlayerParams     = __assign(__assign(__assign({}, defaultYouTubePlayerParams), playerParamsSettings), slideUrlParams);
        var youTubeParams           = "?" + param(youTubePlayerParams);
        return youTubeParams;
    };

    var isYouTubeNoCookie = function (url) {
        return url.includes('youtube-nocookie.com');
    };

    // jadams
    // -------------------------------------------------------------------------
    // loadVtt
    // Loads a given WEBVTT file (from data path) and process loaded
    // data in callback cb (function)
    // -------------------------------------------------------------------------
    var loadVtt = function (data_path, cb) {
      var parser = new WebVTTParser();

      $.ajax({
        url:      data_path,
        type:     'GET',
        success:  cb,
        error:    function(data) {
          var json_data = JSON.stringify(data, undefined, 2);
        }
      });

    }; // END loadVtt

    // jadams
    // -------------------------------------------------------------------------
    // vjsProcessExtendedButtonsAndPlugins
    // Loads a given WEBVTT file (from data path) and process loaded
    // data in callback cb (function)
    // -------------------------------------------------------------------------
    var vjsProcessExtendedButtonsAndPlugins = function (vjsObject, videojsPlayer, videoInfo) {
        const vjsOptions = j1.modules.videojs.options;
        var dependency_met_module_ready, videoInfo, playerState,
            videoStart, videojsPlayer, playbackRates,
            hotKeysPlugin, skipButtonsPlugin, zoomPlugin;

        // ---------------------------------------------------------------------
        // helper functions
        // =====================================================================

        // remove existng markers
        // ---------------------------------------------------------------------
        function removeChapterMarkers(timeline, currentPlayerId) {
            timeline.find('.vjs-chapter-marker').remove();
        }

        // get player status
        // ---------------------------------------------------------------------
        function getPlayerStatus(player) {
            return {
                paused:             player.paused(),
                currentTime:        player.currentTime(),
                duration:           player.duration(),
                muted:              player.muted(),
                bufferedPercent:    player.bufferedPercent()
            };
        }

        // check if player is playing
        // ---------------------------------------------------------------------
        function isPlaying (player) {
            var vjsIsPlaying = (!player.paused() || player.currentTime() > 0) ? true : false;

            return vjsIsPlaying;
        }

        // set chapter markers for the player (videojsPlayer) specified
        // ---------------------------------------------------------------------
        function addChapterMarkers(videojsPlayer) {
            var timeline    = $(videojsPlayer.controlBar.progressControl.children_[0].el_);
            var playerID    = videojsPlayer.id();
            var parser      = new WebVTTParser();
            var markers     = [];

            function cb_load (data /* ,textStatus, jqXHR */ ) {
                var tree = parser.parse(data, 'metadata');
                var marker;

                // add chapter tracks to markers array
                for (var i=0; i<tree.cues.length; i++) {
                    marker = { time: tree.cues[i].startTime, label: tree.cues[i].text };
                    markers.push(marker);
                }
            }; // END function cb_load 

            // create chapter tracks from source file
            // -----------------------------------------------------------------
            loadVtt(videojsPlayer.chapterTracksSource, cb_load);

            // failsafe: remove already existing markers for current player
            // removeChapterMarkers(timeline, playerID);

            // if tracks available, add (chapter) tracks on timeline
            // -----------------------------------------------------------------
            if (j1.modules.videojs.data.players[playerID].videoData.tracks.length) {
                setTimeout (function() {
                    var markers_loaded = setInterval (function () {
                        if (markers.length) {
                            const duration = videojsPlayer.duration();

                            for (var i=0; i<markers.length; i++) {
                                var left = (markers[i].time / duration * 100) + '%';
                                var time = markers[i].time;

                                // add (unique) marker element
                                var el = $(
                                    '<div class="vjs-chapter-marker" ' +
                                    'style="left: ' + left + '" ' +
                                    'data-time="' + time + '" ' +
                                    'data-player-id="' + playerID + '">' +
                                    '<span>' + markers[i].label + '</span></div>'
                                );

                                // event handler with closure for correct player reference
                                (function(currentPlayer, markerTime) {
                                    el.click(function() {
                                        currentPlayer.currentTime(markerTime);
                                    });
                                })(videojsPlayer, time);

                                timeline.append(el);
                            }

                            clearInterval(markers_loaded);
                        } else {
                            clearInterval(markers_loaded);
                        } // END if markers.length
                    }, 10); // END interval markers_loaded
                }, 100); // END timeout
            } // END if chapterTracks enabled

        } // END addChapterMarkers


        // ---------------------------------------------------------------------
        // main
        // =====================================================================
        dependency_met_module_ready = setInterval (() => {
            var playerId, videoData, timeline,
            textTracks, isModuleInitialised, isVideojsOptions,
            hasChapters, hasSubtitles;

            textTracks          = videojsPlayer.textTracks();
            isModuleInitialised = (j1.adapter.gallery.getState() === 'finished') ? true : false;
            isVideojsOptions    = (isEmpty(vjsObject.settings.videojsOptions)) ? false : true;

            // check on chapters
            hasChapters = Array.from(textTracks).some(track => 
                track.kind === 'chapters' && track.cues && track.cues.length > 0
            );
            
            // check on subtitles||captions  
            hasSubtitles = Array.from(textTracks).some(track => 
                (track.kind === 'subtitles' || track.kind === 'captions') && 
                track.cues && track.cues.length > 0
            );

            if (isModuleInitialised && isVideojsOptions) {
                playerId    = videojsPlayer.id();
                videoData   = { tracks: [] };
                playerState = getPlayerStatus(videojsPlayer);

                var hotKeysPluginDefaults = {
                    volumeStep:                     vjsOptions.plugins.hotKeys.volumeStep,
                    seekStep:                       vjsOptions.plugins.hotKeys.seekStep,
                    enableMute:                     vjsOptions.plugins.hotKeys.enableMute,
                    enableVolumeScroll:             vjsOptions.plugins.hotKeys.enableVolumeScroll,
                    enableHoverScroll:              vjsOptions.plugins.hotKeys.enableHoverScroll,
                    enableFullscreen:               vjsOptions.plugins.hotKeys.enableFullscreen,
                    enableNumbers:                  vjsOptions.plugins.hotKeys.enableNumbers,
                    enableJogStyle:                 vjsOptions.plugins.hotKeys.enableJogStyle,
                    alwaysCaptureHotkeys:           vjsOptions.plugins.hotKeys.alwaysCaptureHotkeys,
                    captureDocumentHotkeys:         vjsOptions.plugins.hotKeys.captureDocumentHotkeys,
                    enableModifiersForNumbers:      vjsOptions.plugins.hotKeys.enableModifiersForNumbers,
                    enableInactiveFocus:            vjsOptions.plugins.hotKeys.enableInactiveFocus,
                    skipInitialFocus:               vjsOptions.plugins.hotKeys.skipInitialFocus
                };

                var skipButtonsPluginDefaults = {
                    backward:                       vjsOptions.plugins.skipButtons.backward,
                    forward:                        vjsOptions.plugins.skipButtons.forward,
                    backwardIndex:                  0,
                    forwardIndex:                   1
                };

                var zoomPluginDefaults = {
                    moveX:                          vjsOptions.plugins.zoomButtons.moveX,
                    moveY:                          vjsOptions.plugins.zoomButtons.moveY,
                    rotate:                         vjsOptions.plugins.zoomButtons.rotate,
                    zoom:                           vjsOptions.plugins.zoomButtons.zoom
                };

                //  add customControlContainer
                // -------------------------------------------------------------
                var vjsPlayerControlBar = videojsPlayer.controlBar;

                // create customControlContainer for progressControlSilder|time (display) elements
                const customProgressContainer = vjsPlayerControlBar.addChild('Component', {
                    el: videojs.dom.createEl('div', {
                        className: 'vjs-theme-uno custom-progressbar-container'
                    })
                });

                // move progressControlSlider into customControlContainer
                const progressControlSlider = vjsPlayerControlBar.progressControl;
                if (progressControlSlider) {
                    customProgressContainer.el().appendChild(progressControlSlider.el());
                }

                // move currentTimeDisplay BEFORE the progressControlSilder
                const currentTimeDisplay = vjsPlayerControlBar.currentTimeDisplay;
                if (currentTimeDisplay) {
                    customProgressContainer.el().insertBefore(currentTimeDisplay.el(), progressControlSlider.el());
                }

                // move the durationDisplay AFTER the progressControlSilder
                const durationDisplay = vjsPlayerControlBar.durationDisplay;
                if (durationDisplay) {
                    customProgressContainer.el().appendChild(durationDisplay.el());
                }

                // configure VideoJS (extended) Plugins
                // -------------------------------------------------------------
                if (!isEmpty(vjsObject.settings.videojsOptions)) {

                    hotKeysPlugin     = vjsObject.settings.videojsOptions.hotKeysPlugin;
                    skipButtonsPlugin = vjsObject.settings.videojsOptions.controlBar.skipButtonsPlugin;
                    zoomPlugin        = vjsObject.settings.videojsOptions.controlBar.zoomPlugin;
                    playbackRates     = vjsObject.settings.videojsOptions.controlBar.playbackRates;

                    // add video start position
                    // ---------------------------------------------------------
                    if (vjsObject.settings.videojsOptions.videoStart !== undefined) {
                        videoStart = vjsObject.settings.videojsOptions.videoStart[index];
                            videojsPlayer.on("play", function() {
                            var startFromSecond = new Date('1970-01-01T' + videoStart + 'Z').getTime() / 1000;
                            videojsPlayer.currentTime(startFromSecond);
                        }); // END on event play
                    } // END if videoStart

                    // add playbackRates
                    // ---------------------------------------------------------
                    videojsPlayer.playbackRates(playbackRates);

                    // add hotkeys Plugin
                    // ---------------------------------------------------------
                    if (hotKeysPlugin !== undefined && hotKeysPlugin.enabled && videojsPlayer.hotKeys !== undefined) {

                        // merge objects
                        hotKeysPlugin.options = __assign(__assign({}, hotKeysPluginDefaults), hotKeysPlugin.options);

                        // prevent multiple plugin instances
                        var hotKeysActive = false;
                        if (videojsPlayer.activePlugins_ !== undefined && videojsPlayer.activePlugins_.hotKeys !== undefined) {
                            hotKeysActive = videojsPlayer.activePlugins_.hotKeys;
                        }

                        if (!hotKeysActive) {
                            videojsPlayer.hotKeys({
                                volumeStep:                         hotKeysPlugin.options.volumeStep,
                                seekStep:                           hotKeysPlugin.options.seekStep,
                                enableMute:                         hotKeysPlugin.options.enableMute,
                                enableFullscreen:                   hotKeysPlugin.options.enableFullscreen,
                                enableNumbers:                      hotKeysPlugin.options.enableNumbers,
                                enableVolumeScroll:                 hotKeysPlugin.options.enableVolumeScroll,
                                enableHoverScroll:                  hotKeysPlugin.options.enableHoverScroll,
                                alwaysCaptureHotkeys:               hotKeysPlugin.options.alwaysCaptureHotkeys,
                                captureDocumentHotkeys:             hotKeysPlugin.options.captureDocumentHotkeys,
                                documentHotkeysFocusElementFilter:  hotKeysPlugin.options.documentHotkeysFocusElementFilter,

                                // Mimic VLC seek behavior (default to: 15)
                                seekStep: function(e) {
                                    if (e.ctrlKey && e.altKey) {
                                        return 5*60;
                                    } else if (e.ctrlKey) {
                                        return 60;
                                    } else if (e.altKey) {
                                        return 10;
                                    } else {
                                        return 15;
                                    }
                                }

                            });
                        } // END if hotKeysActive

                    } // END if hotKeysPlugin enabled

                    // add skipButtons Plugin
                    // ---------------------------------------------------------
                    if (skipButtonsPlugin !== undefined && skipButtonsPlugin.enabled && videojsPlayer.skipButtons !== undefined) {
                        // merge objects
                        skipButtonsPlugin.options = __assign(__assign({}, skipButtonsPluginDefaults), skipButtonsPlugin.options);

                        // prevent multiple plugin instances
                        var skipButtonsActive = false;
                        if (videojsPlayer.activePlugins_ !== undefined && videojsPlayer.activePlugins_.skipButtons !== undefined) {
                            skipButtonsActive = videojsPlayer.activePlugins_.skipButtons;
                        }

                        if (!skipButtonsActive) {
                            videojsPlayer.skipButtons({
                                backward:         skipButtonsPlugin.options.backward,
                                forward:          skipButtonsPlugin.options.forward,
                                backwardIndex:    skipButtonsPlugin.options.backwardIndex,
                                forwardIndex:     skipButtonsPlugin.options.forwardIndex
                            });
                        }

                    } // END if skipButtons Plugin enabled

                    // add zoom Plugin (only available for video/mp4
                    // ---------------------------------------------------------
                    if (videoInfo.youtube) {
                        // zoom pluging NOT supported for YouTube
                        zoomPlugin.enabled = false;
                    }

                    if (zoomPlugin !== undefined && zoomPlugin.enabled && videojsPlayer.zoomButtons !== undefined) {
                        // merge objects
                        zoomPlugin.options = __assign(__assign({}, zoomPluginDefaults), zoomPlugin.options);

                        // prevent multiple plugin instances
                        var zoomButtonsActive = false;
                        if (videojsPlayer.activePlugins_ !== undefined && videojsPlayer.activePlugins_.zoomButtons !== undefined) {
                            zoomButtonsActive  = videojsPlayer.activePlugins_.zoomButtons;
                        }
                        
                        if (!zoomButtonsActive) {
                            videojsPlayer.zoomButtons({
                                moveX:  zoomPlugin.options.moveX,
                                moveY:  zoomPlugin.options.moveY,
                                rotate: zoomPlugin.options.rotate,
                                zoom:   zoomPlugin.options.zoom
                            });
                        }

                    } // END if zoom Plugin enabled

                    // chapter track processing
                    // ---------------------------------------------------------
                    var tracksEnabled = vjsObject.settings.videojsOptions.tracks;
                    if (tracksEnabled && vjsObject.core.galleryItems[vjsObject.core.index].video !== undefined) {
                        videoData = JSON.parse(vjsObject.core.galleryItems[vjsObject.core.index].video);
                        videojsPlayer.videoData = videoData;

                        // save VJS videoData for later use
                        // NOTE: for unknown reasons, lightGallery generates
                        // WRONG videoData on skip forwaed|backward  a video slide
                        // Workaround: do NOT overwrite existing video data
                        // stored in current window (j1.modules.videojs.data)
                        // -----------------------------------------------------
                        if (j1.modules.videojs.data.players[playerId] === undefined) {
                            j1.modules.videojs.data.players[playerId] = {};
                            j1.modules.videojs.data.players[playerId]['videoData'] = {};
                            j1.modules.videojs.data.players[playerId].videoData['tracks'] = videoData.tracks || [];
                        }    

                        // load source file for chapter tracks
                        // -----------------------------------------------------
                        var chapterTracksSrc;
                        for (var i=0; i<videojsPlayer.videoData.tracks.length; i++) {
                            if (videojsPlayer.videoData.tracks[i].kind == 'captions') {
                                videojsPlayer.captionTracks = videojsPlayer.videoData.tracks[i];
                            }
                            if (videojsPlayer.videoData.tracks[i].kind == 'chapters') {
                                chapterTracksSrc = videojsPlayer.videoData.tracks[i].src;
                                videojsPlayer.chapterTracks  = videojsPlayer.videoData.tracks[i];
                                videojsPlayer.chapterTracksSource  = chapterTracksSrc;
                            }                            
                        }

                        // process chapter tracks
                        // -----------------------------------------------------
                        if (j1.modules.videojs.data.players[playerId].videoData.tracks.length) {
                            
                            playerId = videojsPlayer.id();
                            timeline = $(videojsPlayer.controlBar.progressControl.children_[0].el_);
                            removeChapterMarkers(timeline, playerId);

                            // add chapter markers when playing (e.g. autoplay)
                            // -------------------------------------------------
                            if (isPlaying(videojsPlayer)) {
                                addChapterMarkers(videojsPlayer);
                            } // END if VideoJS player isPlaying

                            // jadams, 2025-06-22: prepare processing start position
                            // TODO: coding is to be continued 
                            // -------------------------------------------------
                            // videojsPlayer.currentTime(videoStart);

                            // remove chapter markers on event 'pause'
                            // TODO: should be confifurable
                            // -------------------------------------------------
                            // videojsPlayer.on("pause", function() {
                            //     var timeline = $(videojsPlayer.controlBar.progressControl.children_[0].el_);
                            //     removeChapterMarkers(timeline, videojsPlayer.id());
                            // }); // END on event 'pause'

                            // add chapter tracks on event 'play'
                            // TODO: should be configurable
                            // -------------------------------------------------
                            videojsPlayer.on("play", function() {
                                addChapterMarkers(videojsPlayer) 
                            }); // END on event 'play'

                            // failsafe: remove chapter markers on player destroyed
                            // TODO: should be configurable
                            // -------------------------------------------------
                            // videojsPlayer.on("dispose", function() {
                            //     var timeline = $(videojsPlayer.controlBar.progressControl.children_[0].el_);
                            //     removeChapterMarkers(timeline, videojsPlayer.id());
                            // });

                            // add tracks and buttons
                            // -------------------------------------------------
                            videojsPlayer.addRemoteTextTrack(videojsPlayer.captionTracks);
                            videojsPlayer.addRemoteTextTrack(videojsPlayer.chapterTracks);

                            // enable 'english' caption tracks
                            // -------------------------------------------------
                            textTracks = videojsPlayer.textTracks();
                            for (var i = 0; i < textTracks.length; i++) {
                                var track = textTracks[i];
                                if (track.kind === 'captions' && track.language === 'en') {
                                    track.mode = 'showing';     // enable
                                } else {
                                    track.mode = 'disabled';    // disable other
                                }
                            }                            

                        } else {
                            // remove existing chapter markers if NO tracks enabled
                            // -------------------------------------------------
                            var playerId = videojsPlayer.id();
                            var timeline = $(videojsPlayer.controlBar.progressControl.children_[0].el_);
                            removeChapterMarkers(timeline, playerId);                        
                        } // END if chapterTracks enabled

                    } // END if tracksEnabled

                } // END if videojsOptions

                clearInterval(dependency_met_module_ready);
            } // END if isModuleInitialised

        }, 10); // END interval dependency_met_module_ready

    }; // END vjsProcessExtendedButtonsAndPlugins

    /**
     * Video module for lightGallery
     * Supports HTML5, YouTube, Native
     *

     * @ref Youtube
     * https://developers.google.com/youtube/player_parameters#enablejsapi
     * https://developers.google.com/youtube/iframe_api_reference
     * https://developer.chrome.com/blog/autoplay/#iframe-delegation
     *
     */
    var Video = /** @class */ (function () {
        function Video(instance) {
            // get lightGallery core plugin instance
            this.core = instance;
            this.settings = __assign(__assign({}, videoSettings), this.core.settings);
            return this;
        }
        Video.prototype.init = function () {
            var _this = this;
            /**
             * Event triggered when video url found without poster
             * Append video HTML
             * Play if autoplayFirstVideo is true
             */
            this.core.LGel.on(lGEvents.hasVideo + ".video", this.onHasVideo.bind(this));
            this.core.LGel.on(lGEvents.posterClick + ".video", function () {
                var $el = _this.core.getSlideItem(_this.core.index);
                _this.loadVideoOnPosterClick($el);
            });
            this.core.LGel.on(lGEvents.slideItemLoad + ".video", this.onSlideItemLoad.bind(this));
            // @desc fired immediately before each slide transition.
            this.core.LGel.on(lGEvents.beforeSlide + ".video", this.onBeforeSlide.bind(this));
            // @desc fired immediately after each slide transition.
            this.core.LGel.on(lGEvents.afterSlide + ".video", this.onAfterSlide.bind(this));
        };
        /**
         * @desc Event triggered when a slide is completely loaded
         *
         * @param {Event} event - lightGalley custom event
         */
        Video.prototype.onSlideItemLoad = function (event) {
            var _this = this;
            var _a = event.detail, isFirstSlide = _a.isFirstSlide, index = _a.index;
            // Should check the active slide as well as user may have moved to different slide before the first slide is loaded
            if (this.settings.autoplayFirstVideo &&
                isFirstSlide &&
                index === this.core.index) {
                // Delay is just for the transition effect on video load
                setTimeout(function () {
                    _this.loadAndPlayVideo(index);
                }, 200);
            }
            // Should not call on first slide. should check only if the slide is active
            if (!isFirstSlide &&
                this.settings.autoplayVideoOnSlide &&
                index === this.core.index) {
                this.loadAndPlayVideo(index);
            }
        };
        /**
         * @desc Event triggered when video url or poster found
         * Append video HTML is poster is not given
         * Play if autoplayFirstVideo is true
         *
         * @param {Event} event - Javascript Event object.
         */
        Video.prototype.onHasVideo = function (event) {
            var _a = event.detail, index = _a.index, src = _a.src, html5Video = _a.html5Video, hasPoster = _a.hasPoster;
            if (!hasPoster) {
                // All functions are called separately if poster exist in loadVideoOnPosterClick function
                this.appendVideo(this.core.getSlideItem(index), {
                    src: src,
                    addClass: 'lg-object',
                    index: index,
                    html5Video: html5Video,
                });
                // Automatically navigate to next slide once video reaches the end.
                this.gotoNextSlideOnVideoEnd(src, index);
            }
        };
        /**
         * @desc fired immediately before each slide transition.
         * Pause the previous video
         * Hide the download button if the slide contains YouTube videos.
         *
         * @param {Event} event - Javascript Event object.
         * @param {number} prevIndex - Previous index of the slide.
         * @param {number} index - Current index of the slide
         */
        Video.prototype.onBeforeSlide = function (event) {
            if (this.core.lGalleryOn) {
                var prevIndex = event.detail.prevIndex;
                this.pauseVideo(prevIndex);
            }
        };
        /**
         * @desc fired immediately after each slide transition.
         * Play video if autoplayVideoOnSlide option is enabled.
         *
         * @param {Event} event - Javascript Event object.
         * @param {number} prevIndex - Previous index of the slide.
         * @param {number} index - Current index of the slide
         * @todo should check on onSlideLoad as well if video is not loaded on after slide
         */
        Video.prototype.onAfterSlide = function (event) {
            var _this = this;
            var _a = event.detail, index = _a.index, prevIndex = _a.prevIndex;
            // Do not call on first slide
            var $slide = this.core.getSlideItem(index);
            if (this.settings.autoplayVideoOnSlide && index !== prevIndex) {
                if ($slide.hasClass('lg-complete')) {
                    setTimeout(function () {
                        _this.loadAndPlayVideo(index);
                    }, 100);
                }
            }
        };
        Video.prototype.loadAndPlayVideo = function (index) {
            var $slide = this.core.getSlideItem(index);
            var currentGalleryItem = this.core.galleryItems[index];
            if (currentGalleryItem.poster) {
                this.loadVideoOnPosterClick($slide, true);
            }
            else {
                this.playVideo(index);
            }
        };
        /**
         * Play HTML5, Youtube, Native videos in a particular slide.
         * @param {number} index - Index of the slide
         */
        Video.prototype.playVideo = function (index) {
            this.controlVideo(index, 'play');
        };
        /**
         * Pause HTML5, Youtube, Native in a particular slide.
         * @param {number} index - Index of the slide
         */
        Video.prototype.pauseVideo = function (index) {
            this.controlVideo(index, 'pause');
        };

        // jadams
        Video.prototype.getVideoHtml = function (src, addClass, index, html5Video) {
          var currentGalleryHtml, currentGalleryItem, videoInfo,
              videoTitle, video, video_api, commonIframeProps;

          videoInfo                  = this.core.galleryItems[index].__slideVideoInfo || {};
          currentGalleryItem         = this.core.galleryItems[index];

          if (currentGalleryItem.subHtml.includes('<h2>')) {
            currentGalleryHtml       = currentGalleryItem.subHtml.split("</h2>");
            videoTitle               = currentGalleryHtml[0].replace('<h2>','');  
          } else if (currentGalleryItem.subHtml.includes('<h5>')) {
            // for backward compatibility reasons
            currentGalleryHtml       = currentGalleryItem.subHtml.split("</h5>");
            videoTitle               = currentGalleryHtml[0].replace('<h5>','');            
          } 

          videoTitle                 = videoTitle ? 'title="' + videoTitle + '"' : '';
          commonIframeProps          = "allowtransparency=\"true\"\n            frameborder=\"0\"\n            scrolling=\"no\"\n            allowfullscreen\n            mozallowfullscreen\n            webkitallowfullscreen\n            oallowfullscreen\n            msallowfullscreen";

          if (videoInfo.youtube) {
            var videoId              = 'lg-youtube' + index;
            var youTubeParams        = getYouTubeParams(videoInfo, this.settings.youTubePlayerParams);
            var isYouTubeNoCookieURL = isYouTubeNoCookie(src);
            var youtubeURL           = isYouTubeNoCookieURL ? '//youtube-nocookie.com/' : '//youtube.com/';
            var ytVideoID            = videoInfo.youtube[1];

            var video_iframe = `
              <iframe
                id="${videoId}"
                class="lg-video-object lg-youtube ${addClass}"
                src="${youtubeURL}/embed/${ytVideoID}${youTubeParams}"
                ${commonIframeProps}>
              </iframe>
            `;

            var video_vjs = `
              <video
                id="${videoId}"
                class="video-js lg-video-object lg-youtube vjs-theme-uno">
                <source
                  type="video/youtube",
                  src="//youtube.com/watch?v=${ytVideoID}"
                >,
                <tracks>

                Your browser does not support HTML5 video.
              </video>
            `;

            video_api = 'youtube';
            video     = (video_api === 'iframe') ? video_iframe : video_vjs;
            // END videoInfo youtube
          } else if (videoInfo.html5) {
            var html5VideoMarkup = '';
            for (var i = 0; i < html5Video.source.length; i++) {
                var type = html5Video.source[i].type;
                var typeAttr = type ? "type=\"" + type + "\"" : '';
                html5VideoMarkup += "<source src=\"" + html5Video.source[i].src + "\" " + typeAttr + ">";
            }

            if (html5Video.tracks) {
                var _loop_1 = function (i) {
                    var trackAttributes = '';
                    var track = html5Video.tracks[i];
                    Object.keys(track || {}).forEach(function (key) {
                        trackAttributes += key + "=\"" + track[key] + "\" ";
                    });
                    html5VideoMarkup += "<track " + trackAttributes + ">";
                };
                for (var i = 0; i < html5Video.tracks.length; i++) {
                    _loop_1(i);
                }
            }

            var html5VideoAttrs_1 = '';
            var videoAttributes_1 = html5Video.attributes || {};
            Object.keys(videoAttributes_1 || {}).forEach(function (key) {
                html5VideoAttrs_1 += key + "=\"" + videoAttributes_1[key] + "\" ";
            });

            video = "<video class=\"lg-video-object lg-html5 " + (this.settings.videojs && this.settings.videojsTheme
                ? this.settings.videojsTheme + ' '
                : '') + " " + (this.settings.videojs ? ' video-js' : '') + "\" " + html5VideoAttrs_1 + ">\n                " + html5VideoMarkup + "\n                Your browser does not support HTML5 video.\n            </video>";
          }

          return video;
        };

        /**
         * @desc - Append videos to the slide
         *
         * @param {HTMLElement} el - slide element
         * @param {Object} videoParams - Video parameters, Contains src, class, index, htmlVideo
         */
        Video.prototype.appendVideo = function (el, videoParams) {
            var vjsPlayer;
            var _a             = {};
            var videojsEnabled = false;
            var videoHtml      = this.getVideoHtml(videoParams.src, videoParams.addClass, videoParams.index, videoParams.html5Video);

            el.find('.lg-video-cont').append(videoHtml);
            var $videoElement = el.find('.lg-video-object').first();

            // check the HTML Element for the active player (failsafe)
            // if NOT available, something went totally wrong
            if (!$videoElement.get()) {
                return;
            }

            if (videoParams.html5Video) {
                $videoElement.on('mousedown.lg.video', function (e) {
                    e.stopPropagation();
                });
            }

            _a                 = this.core.galleryItems[videoParams.index].__slideVideoInfo;
            _a.videojs         = { enabled: false };
            videojsEnabled     = videoHtml.includes('iframe');
            _a.videojs.enabled = (videojsEnabled) ? false : true;

            // jadams, 2025-06-13: process html5
            if (this.settings.videojs && (_a === null || _a === void 0 ? void 0 : _a.html5)) {
                try {
                    if (_a.videojs.enabled) {
                        vjsPlayer               = videojs($videoElement.get(), this.settings.videojsOptions);
                        this.settings.vjsPlayer = vjsPlayer;
                        _a.videojs.player       = vjsPlayer;

                        return vjsPlayer;
                    }
                }
                catch (e) {
                    // jadams:
                    console.warn('lightGallery: Make sure you have included //github.com/vimeo/player.js');
                }
            }

            // jadams, 2025-06-13: process youtube
            if (this.settings.videojs && (_a  === null || _a === void 0 ? void 0 : _a.youtube)) {
                try {
                    if (_a.videojs.enabled) {
                        vjsPlayer           = videojs($videoElement.get(), this.settings.videojsOptions);
                        this.settings.vjsPlayer = vjsPlayer;
                        _a.videojs.player       = vjsPlayer;

                        return vjsPlayer;
                    }
                }
                    catch (e) {
                    // jadams:
                    console.warn('lightGallery: Make sure you have included //github.com/vimeo/player.js');
                }
            }

        }; // END appendVideo

        // jadams
        Video.prototype.gotoNextSlideOnVideoEnd = function (src, index) {
            var _this = this;
            var $videoElement = this.core
                .getSlideItem(index)
                .find('.lg-video-object')
                .first();

            // try to get HTML Element for the active player (failsafe)
            // if NOT available, something went totally wrong
            if (!$videoElement.get()) {
                return;
            }

            var videoInfo = this.core.galleryItems[index].__slideVideoInfo || {};
            if (this.settings.gotoNextSlideOnVideoEnd) {
                if (videoInfo.html5) {
                    $videoElement.on('ended', function () {
                        _this.core.goToNextSlide();
                    });
                }
            }
        };

        // jadams: 2025-06-11: Add (extended) VideoJS control elements
        // for HTML5 video over VJS (to be extended for e.g.YouTube)
        // ---------------------------------------------------------------------
        Video.prototype.controlVideo = function (index, action) {
            var $videoElement, videoInfo, videoId;
            var videojsPlayer = 'not_set';

            // load the lgQuery element for the active player
            $videoElement = this.core
              .getSlideItem(index)
              .find('.lg-video-object')
              .first()

            // try to get HTML Element for the active player (failsafe)
            // if NOT available, something went totally wrong
            if (!$videoElement.get()) {
                return;
            }

            // load the INFO object for the active player
            videoInfo = this.core.galleryItems[index].__slideVideoInfo || {};

            // process video of type 'html5' for extended VJS settings
            // -----------------------------------------------------------------
            // if (this.core.galleryItems[this.core.index].video !== undefined && (videoInfo.html5 || videoInfo.youtube)) {
            if (videoInfo.html5 || videoInfo.youtube) {

                // if ($videoElement.selector.id !== undefined) {
                //     videoId       = $videoElement.selector.id;
                //     videojsPlayer = videojs(videoId);
                // }

                if ($videoElement.selector.player !== undefined) {
                  videojsPlayer = $videoElement.selector.player;
                }

                if (videojsPlayer !== 'not_set') {
                  vjsProcessExtendedButtonsAndPlugins(this, videojsPlayer, videoInfo);
                } // END if videojsPlayer is defined

            } // END if videoInfo.html5

            // check responses of the (active) player loaded
            // -----------------------------------------------------------------
            if (videoInfo.html5) {
                if (this.settings.videojs) {
                    // VideoJS  API detected
                    try {
                        videojs($videoElement.get())[action]();
                    }
                    catch (e) {
                        console.warn('lightGallery: Make sure you have included videojs');
                    }
                }
                else {
                    // iFrame API detected (??? supported ???)
                    $videoElement.get()[action]();
                } // END html5
            } else if (videoInfo.youtube) {
                if (this.settings.videojs) {
                    // VideoJS  API detected
                    try {
                        videojs($videoElement.get())[action]();
                    }
                    catch (e) {
                        console.warn('lightGallery: Make sure you have included videojs');
                    }
                } else  {
                    // iFrame API detected
                    try {
                        $videoElement.get().contentWindow.postMessage("{\"event\":\"command\",\"func\":\"" + action + "Video\",\"args\":\"\"}", '*');
                    }
                    catch (e) {
                        console.error("lightGallery:- " + e);
                    }
                } // END youtube
            } // END if videoInfo

        }; // END controlVideo

        Video.prototype.loadVideoOnPosterClick = function ($el, forcePlay) {
            var _this = this;
            // check slide has poster
            if (!$el.hasClass('lg-video-loaded')) {
                // check already video element present
                if (!$el.hasClass('lg-has-video')) {
                    $el.addClass('lg-has-video');
                    var _html = void 0;
                    var _src = this.core.galleryItems[this.core.index].src;
                    var video = this.core.galleryItems[this.core.index].video;
                    if (video) {
                        _html =
                            typeof video === 'string' ? JSON.parse(video) : video;
                    }
                    var videoJsPlayer_1 = this.appendVideo($el, {
                        src: _src,
                        addClass: '',
                        index: this.core.index,
                        html5Video: _html,
                    });
                    this.gotoNextSlideOnVideoEnd(_src, this.core.index);
                    var $tempImg = $el.find('.lg-object').first().get();
                    // @todo make sure it is working
                    $el.find('.lg-video-cont').first().append($tempImg);
                    $el.addClass('lg-video-loading');
                    videoJsPlayer_1 &&
                        videoJsPlayer_1.ready(function () {
                            videoJsPlayer_1.on('loadedmetadata', function () {
                                _this.onVideoLoadAfterPosterClick($el, _this.core.index);
                            });
                        });
                    $el.find('.lg-video-object')
                        .first()
                        .on('load.lg error.lg loadedmetadata.lg', function () {
                        setTimeout(function () {
                            _this.onVideoLoadAfterPosterClick($el, _this.core.index);
                        }, 50);
                    });
                }
                else {
                    this.playVideo(this.core.index);
                }
            }
            else if (forcePlay) {
                this.playVideo(this.core.index);
            }
        };
        Video.prototype.onVideoLoadAfterPosterClick = function ($el, index) {
            $el.addClass('lg-video-loaded');
            this.playVideo(index);
        };
        Video.prototype.destroy = function () {
            this.core.LGel.off('.lg.video');
            this.core.LGel.off('.video');
        };
        return Video;
    }());

    return Video;

})));