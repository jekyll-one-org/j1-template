/*
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/modules/lightGallery/js/plugins/lg-video.js
 # Provides lightGallery JS code for the plugin lgVideo
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2023 Sachin Neravath
 # Copyright (C) 2023, 2024 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE.md
 # lightGallery is licensed under the GPLv3 license
 # See: https://github.com/sachinchoolur/lightGallery/blob/master/LICENSE
 # -----------------------------------------------------------------------------
*/

/*!
 * lightgallery | 2.7.2 | September 20th 2023
 * http://www.lightgalleryjs.com/
 * Copyright (c) 2020 Sachin Neravath;
 * @license GPLv3
 */

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.lgVideo = factory());
}(this, (function () { 'use strict';

    /*! *****************************************************************************
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
    ***************************************************************************** */

    var url = new URL(window.location.href);
    var origin = url.origin;

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

    var videoSettings = {
        autoplayFirstVideo: true,
        youTubePlayerParams: false,
        vimeoPlayerParams: false,
        wistiaPlayerParams: false,
        dailymotionPlayerParams: false,
        gotoNextSlideOnVideoEnd: true,
        autoplayVideoOnSlide: false,
        videojs: false,
        videojsTheme: '',
        videojsOptions: {},
    };

    /**
     * List of lightGallery events
     * All events should be documented here
     * Below interfaces are used to build the website documentations
     * */
    var lGEvents = {
        afterAppendSlide: 'lgAfterAppendSlide',
        init: 'lgInit',
        hasVideo: 'lgHasVideo',
        containerResize: 'lgContainerResize',
        updateSlides: 'lgUpdateSlides',
        afterAppendSubHtml: 'lgAfterAppendSubHtml',
        beforeOpen: 'lgBeforeOpen',
        afterOpen: 'lgAfterOpen',
        slideItemLoad: 'lgSlideItemLoad',
        beforeSlide: 'lgBeforeSlide',
        afterSlide: 'lgAfterSlide',
        posterClick: 'lgPosterClick',
        dragStart: 'lgDragStart',
        dragMove: 'lgDragMove',
        dragEnd: 'lgDragEnd',
        beforeNextSlide: 'lgBeforeNextSlide',
        beforePrevSlide: 'lgBeforePrevSlide',
        beforeClose: 'lgBeforeClose',
        afterClose: 'lgAfterClose',
        rotateLeft: 'lgRotateLeft',
        rotateRight: 'lgRotateRight',
        flipHorizontal: 'lgFlipHorizontal',
        flipVertical: 'lgFlipVertical',
        autoplay: 'lgAutoplay',
        autoplayStart: 'lgAutoplayStart',
        autoplayStop: 'lgAutoplayStop',
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
    var getYouTubeParams = function (videoInfo, youTubePlayerParamsSettings) {
        if (!videoInfo.youtube)
            return '';
        var slideUrlParams = videoInfo.youtube[2]
            ? paramsToObject(videoInfo.youtube[2])
            : '';

        // For YouTube first params gets priority if duplicates found
        // See: https://stackoverflow.com/questions/40685142/youtube-autoplay-does-not-work-with-iframe
        var defaultYouTubePlayerParams = {
            autoplay: 0,
            controls: 1,
            enablejsapi: 1,
            hl: 'en',
            loop: 0,
            mute: 1,
            wmode: 'opaque',
            origin: origin,
        };

        var playerParamsSettings = youTubePlayerParamsSettings || {};
        var youTubePlayerParams = __assign(__assign(__assign({}, defaultYouTubePlayerParams), playerParamsSettings), slideUrlParams);
        var youTubeParams = "?" + param(youTubePlayerParams);
        return youTubeParams;
    };
    var isYouTubeNoCookie = function (url) {
        return url.includes('youtube-nocookie.com');
    };
    var getVimeoURLParams = function (defaultParams, videoInfo) {
        if (!videoInfo || !videoInfo.vimeo)
            return '';
        var urlParams = videoInfo.vimeo[2] || '';
        var defaultPlayerParams = defaultParams && Object.keys(defaultParams).length !== 0
            ? '&' + param(defaultParams)
            : '';
        // Support private video
        var urlWithHash = videoInfo.vimeo[0].split('/').pop() || '';
        var urlWithHashWithParams = urlWithHash.split('?')[0] || '';
        var hash = urlWithHashWithParams.split('#')[0];
        var isPrivate = videoInfo.vimeo[1] !== hash;
        if (isPrivate) {
            urlParams = urlParams.replace("/" + hash, '');
        }
        urlParams =
            urlParams[0] == '?' ? '&' + urlParams.slice(1) : urlParams || '';
        // For vimeo last params gets priority if duplicates found
        var vimeoPlayerParams = "?autoplay=0&muted=1" + (isPrivate ? "&h=" + hash : '') + defaultPlayerParams + urlParams;
        return vimeoPlayerParams;
    };

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

    } // END loadVtt

    /**
     * Video module for lightGallery
     * Supports HTML5, YouTube, Vimeo, wistia videos
     *
     *
     * @ref Wistia
     * https://wistia.com/support/integrations/wordpress(How to get url)
     * https://wistia.com/support/developers/embed-options#using-embed-options
     * https://wistia.com/support/developers/player-api
     * https://wistia.com/support/developers/construct-an-embed-code
     * http://jsfiddle.net/xvnm7xLm/
     * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video
     * https://wistia.com/support/embed-and-share/sharing-videos
     * https://private-sharing.wistia.com/medias/mwhrulrucj
     *
     * @ref Youtube
     * https://developers.google.com/youtube/player_parameters#enablejsapi
     * https://developers.google.com/youtube/iframe_api_reference
     * https://developer.chrome.com/blog/autoplay/#iframe-delegation
     *
     * @ref Vimeo
     * https://stackoverflow.com/questions/10488943/easy-way-to-get-vimeo-id-from-a-vimeo-url
     * https://vimeo.zendesk.com/hc/en-us/articles/360000121668-Starting-playback-at-a-specific-timecode
     * https://vimeo.zendesk.com/hc/en-us/articles/360001494447-Using-Player-Parameters
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
                this.appendVideos(this.core.getSlideItem(index), {
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
         * Hide the download button if the slide contains YouTube, Vimeo, or Wistia videos.
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
         * Play HTML5, Youtube, Vimeo or Wistia videos in a particular slide.
         * @param {number} index - Index of the slide
         */
        Video.prototype.playVideo = function (index) {
            this.controlVideo(index, 'play');
        };

        /**
         * Pause HTML5, Youtube, Vimeo or Wistia videos in a particular slide.
         * @param {number} index - Index of the slide
         */
        Video.prototype.pauseVideo = function (index) {
            this.controlVideo(index, 'pause');
        };

        Video.prototype.getVideoHtml = function (src, addClass, index, html5Video) {
            var video = '';
            var videoInfo = this.core.galleryItems[index]
                .__slideVideoInfo || {};
            var currentGalleryItem = this.core.galleryItems[index];
            var videoTitle = currentGalleryItem.title || currentGalleryItem.alt;
            videoTitle = videoTitle ? 'title="' + videoTitle + '"' : '';
            var commonIframeProps = "allowtransparency=\"true\"\n            frameborder=\"0\"\n            scrolling=\"no\"\n            allowfullscreen\n            mozallowfullscreen\n            webkitallowfullscreen\n            msallowfullscreen";
            if (videoInfo.youtube) {
                var videoId = 'lg-youtube' + index;
                var youTubeParams = getYouTubeParams(videoInfo, this.settings.youTubePlayerParams);
                var isYouTubeNoCookieURL = isYouTubeNoCookie(src);
                var youtubeURL = isYouTubeNoCookieURL
                    ? '//www.youtube-nocookie.com/'
                    : '//www.youtube.com/';
                video = "<iframe allow=\"autoplay\" id=" + videoId + " class=\"lg-video-object lg-youtube " + addClass + "\" " + videoTitle + " src=\"" + youtubeURL + "embed/" + (videoInfo.youtube[1] + youTubeParams) + "\" " + commonIframeProps + "></iframe>";
            }
            else if (videoInfo.vimeo) {
                var videoId = 'lg-vimeo' + index;
                var playerParams = getVimeoURLParams(this.settings.vimeoPlayerParams, videoInfo);
                video = "<iframe allow=\"autoplay\" id=" + videoId + " class=\"lg-video-object lg-vimeo " + addClass + "\" " + videoTitle + " src=\"//player.vimeo.com/video/" + (videoInfo.vimeo[1] + playerParams) + "\" " + commonIframeProps + "></iframe>";
            }
            else if (videoInfo.wistia) {
                var wistiaId = 'lg-wistia' + index;
                var playerParams = param(this.settings.wistiaPlayerParams);
                playerParams = playerParams ? '?' + playerParams : '';
                video = "<iframe allow=\"autoplay\" id=\"" + wistiaId + "\" src=\"//fast.wistia.net/embed/iframe/" + (videoInfo.wistia[4] + playerParams) + "\" " + videoTitle + " class=\"wistia_embed lg-video-object lg-wistia " + addClass + "\" name=\"wistia_embed\" " + commonIframeProps + "></iframe>";
            }
            // jadams: added Dailymotion Player
            else if (videoInfo.dailymotion) {
                var dailymotionId = 'lg-dailymotion' + index;
                var playerParams = param(this.settings.dailymotionPlayerParams);
                playerParams = playerParams ? '?' + playerParams : '';
                video = "<iframe allow=\"autoplay\" id=\"" + dailymotionId + "\" src=\"//www.dailymotion.com/embed/video/" + (videoInfo.dailymotion[1] + playerParams) + "\" " + videoTitle + " class=\"dailymotion_embed lg-video-object lg-dailymotion " + addClass + "\" name=\"dailymotion_embed\" " + commonIframeProps + "></iframe>"
            }
            else if (videoInfo.html5) {
                var html5VideoMarkup = '';
                for (var i = 0; i < html5Video.source.length; i++) {
                    html5VideoMarkup += "<source src=\"" + html5Video.source[i].src + "\" type=\"" + html5Video.source[i].type + "\">";
                }
                if (html5Video.tracks) {
                    var _loop_1 = function (i) {
                        var trackAttributes = '';
                        var track = html5Video.tracks[i];
                        Object.keys(track || {}).forEach(function (key) {
                            trackAttributes += key + "=\"" + track[key] + "\" ";
                        });
                        html5VideoMarkup += "<track " + trackAttributes + ">";
//                      html5VideoMarkup += '<track default="true" kind="captions" src="/assets/videos/gallery/vtt/captions/video1.vtt" srclang="en" label="Captions">';
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
        Video.prototype.appendVideos = function (el, videoParams) {
            var _a;
            var videoHtml = this.getVideoHtml(videoParams.src, videoParams.addClass, videoParams.index, videoParams.html5Video);
            el.find('.lg-video-cont').append(videoHtml);
            var $videoElement = el.find('.lg-video-object').first();
            if (videoParams.html5Video) {
                $videoElement.on('mousedown.lg.video', function (e) {
                    e.stopPropagation();
                });
            }
            if (this.settings.videojs && ((_a = this.core.galleryItems[videoParams.index].__slideVideoInfo) === null || _a === void 0 ? void 0 : _a.html5)) {
                try {
                    return videojs($videoElement.get(), this.settings.videojsOptions);
                }
                catch (e) {
                    console.warn('lightGallery: Make sure you have included videojs');
                }
            }
        };

        Video.prototype.gotoNextSlideOnVideoEnd = function (src, index) {
            var _this = this;
            var $videoElement = this.core
                .getSlideItem(index)
                .find('.lg-video-object')
                .first();
            var videoInfo = this.core.galleryItems[index].__slideVideoInfo || {};
            if (this.settings.gotoNextSlideOnVideoEnd) {
                if (videoInfo.html5) {
                    $videoElement.on('ended', function () {
                        _this.core.goToNextSlide();
                    });
                }
                else if (videoInfo.vimeo) {
                    try {
                        // https://github.com/vimeo/player.js/#ended
                        new Vimeo.Player($videoElement.get()).on('ended', function () {
                            _this.core.goToNextSlide();
                        });
                    }
                    catch (e) {
                        // jadams:
                        console.warn('lightGallery: Make sure you have included //github.com/vimeo/player.js');
                    }
                }
                else if (videoInfo.wistia) {
                    try {
                        window._wq = window._wq || [];
                        // @todo Event is gettign triggered multiple times
                        window._wq.push({
                            id: $videoElement.attr('id'),
                            onReady: function (video) {
                                video.bind('end', function () {
                                    _this.core.goToNextSlide();
                                });
                            },
                        });
                    }
                    catch (e) {
                      // jadams:
                      console.warn('lightGallery: Make sure you have included //fast.wistia.com/assets/external/E-v1.js');
                    }
                }
            }
        };

        Video.prototype.controlVideo = function (index, action) {
            var trackSrc, $videoElement, videoInfo, videoData, videoId, videojsPlayer, zoomPlugin;

            var chapterTracksEnabled = false;
            var zoomPluginDefaults   = {
              moveX:  0,
              moveY:  0,
              rotate: 0,
              zoom:   1
            };

            videoInfo     = this.core.galleryItems[index].__slideVideoInfo || {};
            $videoElement = this.core
              .getSlideItem(index)
              .find('.lg-video-object')
              .first()

            // zoom and chapter tracks only available for HTML5 video
            //
            if (videoInfo.html5) {
              videoData = JSON.parse(this.core.galleryItems[this.core.index].video);
              if (videoData.tracks.length > 0) {
                for (var i=0; i<videoData.tracks.length; i++) {
                  if (videoData.tracks[i].kind == 'chapters') {
                    trackSrc = videoData.tracks[i].src;
                    chapterTracksEnabled = true;
                  }
                }
              } // END if videoData.tracks

              videoId       = $videoElement.selector.id;
              videojsPlayer = videojs(videoId);

              // jadams, 2023-12-11: added VideoJS zoomPlugin
              // -----------------------------------------------------------------
              var zoomPlugin = this.settings.videojsOptions.zoomPlugin;
              if (zoomPlugin != undefined && zoomPlugin.enabled) {

                zoomPlugin.settings = __assign(__assign({}, zoomPluginDefaults), zoomPlugin.options);
                videojsPlayer.zoomPlugin({
                  moveX:  zoomPlugin.settings.moveX,
                  moveY:  zoomPlugin.settings.moveY,
                  rotate: zoomPlugin.settings.rotate,
                  zoom:   zoomPlugin.settings.zoom
                });
              } // END if zoomPlugin enabled
            } // END if videoInfo.html

            // jadams, 2023-12-11: added chapter track processing
            // -----------------------------------------------------------------
            if (chapterTracksEnabled) {
              var parser  = new WebVTTParser();
              var markers = [];

              function cb_load (data /* , textStatus, jqXHR */ ) {
                var tree = parser.parse(data, 'metadata');
                var marker;

                // add chapter tracks to markers array
                for (var i=0; i<tree.cues.length; i++) {
                  marker = { time: tree.cues[i].startTime, label: tree.cues[i].text };
                  markers.push(marker);
                }
              }; // END callback

              // load chapter tracks
              //
              loadVtt(trackSrc, cb_load);

              // add chapter tracks on play
              //
              videojsPlayer.on("play", function() {
                var total    = videojsPlayer.duration();
                var timeline = $(videojsPlayer.controlBar.progressControl.children_[0].el_);

                // add chapter tracks on timeline (delayed)
                setTimeout (function() {
                  var markers_loaded = setInterval (function () {
                    if (markers.length) {
                      for (var i=0; i<markers.length; i++) {
                        var left = (markers[i].time / total * 100) + '%';
                        var time = markers[i].time;
                        var el   = $('<div class="vjs-chapter-marker" style="left: ' +left+ '" data-time="' +time+ '"> <span>' +markers[i].label+ '</span></div>');

                        el.click(function() {
                          videojsPlayer.currentTime($(this).data('time'));
                        });

                        timeline.append(el);
                      }
                      clearInterval(markers_loaded);
                    }
                  }, 10);
                }, 1000 );

              }); // END on "play"

            } // END if chapterTracksEnabled

            if (!$videoElement.get())
                return;
            if (videoInfo.youtube) {
                try {
                    $videoElement.get().contentWindow.postMessage("{\"event\":\"command\",\"func\":\"" + action + "Video\",\"args\":\"\"}", '*');
                }
                catch (e) {
                    console.error("lightGallery:- " + e);
                }
            }
            else if (videoInfo.vimeo) {
                try {
                    new Vimeo.Player($videoElement.get())[action]();
                }
                catch (e) {
                    console.warn('lightGallery: Make sure you have included //github.com/vimeo/player.js');
                }
            }
            else if (videoInfo.html5) {
                if (this.settings.videojs) {
                    try {
                        videojs($videoElement.get())[action]();
                    }
                    catch (e) {
                        console.warn('lightGallery: Make sure you have included videojs');
                    }
                }
                else {
                    $videoElement.get()[action]();
                }
            }
            else if (videoInfo.wistia) {
                try {
                    window._wq = window._wq || [];
                    // @todo Find a way to destroy wistia player instance
                    window._wq.push({
                        id: $videoElement.attr('id'),
                        onReady: function (video) {
                            video[action]();
                        },
                    });
                }
                catch (e) {
                    console.warn('lightGallery: Make sure you have included //fast.wistia.com/assets/external/E-v1.js');
                }
            }
        };

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
                    var videoJsPlayer_1 = this.appendVideos($el, {
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
