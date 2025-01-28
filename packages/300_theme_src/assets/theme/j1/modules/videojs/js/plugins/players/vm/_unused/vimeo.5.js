/*
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/modules/videojs/js/vimeo/vimeo.js
 # Provides Vimeo Playback Technology (Tech) for Video.js V8 and newer
 #
 #  Product/Info:
 #  http://jekyll.one
 #
 #  Copyright (C) 2023-2025 Juergen Adams
 #
 #  J1 Theme is licensed under MIT License.
 #  See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 # -----------------------------------------------------------------------------
*/

/* global define, VM */
(function (root, factory) {
  if(typeof exports==='object' && typeof module!=='undefined') {
    var videojs = require('video.js');
    module.exports = factory(videojs.default || videojs);
  } else if(typeof define === 'function' && define.amd) {
    define(['videojs'], function(videojs){
      return (root.Vimeo = factory(videojs));
    });
  } else {
    root.Vimeo = factory(root.videojs);
  }
}(this, function(videojs) {
  'use strict';

   var logger        = log4javascript.getLogger('videoJS.plugin.vimeo');
   var isOnMobile    = videojs.browser.IS_IOS || videojs.browser.IS_ANDROID;
   var Tech          = videojs.getTech('Tech');
   var cssInjected   = false;
   var vjsControlbar = false;

   var vjsPlayer;
   var vjsBigPlayButtons;

   var startTimeModule;
   var endTimeModule;

   class Vimeo extends Tech {

    /**
     * Vimeo - Wrapper for Video Player API
     *
     * @param {Object=} options Object of option names and values
     * @param {Function=} ready Ready callback function
     * @extends Tech
     * @class Vimeo
     */
      constructor(options, ready) {
        super(options, ready);

        // jadams: VJS controlbar
        if (vjsControlbar) {
          var divElement = document.getElementById(options.playerId);
          divElement.classList.remove("vjs-controls-disabled");
          divElement.classList.add("vjs-controls-enabled");
          divElement.classList.remove("vjs-user-inactive");
          divElement.classList.add("vjs-user-active");
        } // END if vjsControlbar

        this.setPoster(options.poster);

        // Set the vjs-vimeo class on the player PARENT node.
        // When not set, yet so we have to wait a tick
        var vm = this;
        setTimeout(function() {
          if (this.el_) {
            this.el_.parentNode.className += ' vjs-vimeo';

            if (isOnMobile) {
              this.el_.parentNode.className += ' vjs-vimeo-mobile';
            }

            if (Vimeo.isSdkReady) {
              vm.initVMPlayer();
            } else {
              Vimeo.sdkReadyQueue.push(vm);
            }
          }
        }.bind(this));

      } // END constructor

      initVMPlayer() {
        // initial vmPlayer settings
        var vimeoOptions = {
          url:          this.options_.source.src,
          byline:       false,
          controls:     false,
          portrait:     false,
          title:        false,
          pip:          false,
          vimeo_logo:   false,
//        dnt:          false,
//        transparent:  false,
//        keyboard:     false,
        };

        // jadams: VJS controlbar
        if (vjsControlbar) {
          vimeoOptions.controls = false;
        } else {
          vimeoOptions.controls = true;
        } // END if vjsControlbar

        if (this.options_.autoplay) {
          vimeoOptions.autoplay = true;
        }
        if (this.options_.height) {
          vimeoOptions.height = this.options_.height;
        }
        if (this.options_.width) {
          vimeoOptions.width = this.options_.width;
        }
        if (this.options_.maxheight) {
          vimeoOptions.maxheight = this.options_.maxheight;
        }
        if (this.options_.maxwidth) {
          vimeoOptions.maxwidth = this.options_.maxwidth;
        }
        if (this.options_.loop) {
          vimeoOptions.loop = this.options_.loop;
        }
        if (this.options_.color) {
          // vimeo is the only API on earth to reject hex color with leading #
          vimeoOptions.color = this.options_.color.replace(/^#/, '');
        }

        this.vmPlayer = new VM.Player(this.el(), vimeoOptions);
        this.initVimeoState();

        // setup API events
        var apiEvents = [
          'play', 'playing', 'pause', 'ended', 'loaded',
          'timeupdate', 'progress', 'seeking', 'seeked',
          'ready'
        ];
        apiEvents.forEach(e => {
          this.vmPlayer.on(e, (progress) => {
            if (this._vimeoState.progress.duration !== progress.duration) {
              this.trigger('durationchange');
            }
            this._vimeoState.progress = progress;
            this.trigger(e);
          });

          this.vmPlayer.on(e, (ready) => {
            this.vmPlayer.getVideoEmbedCode()
            .then (function(embedCode) {
              var code = embedCode;
            })
            .catch(function(error) {
             console.err('Vimeo API: an error occurred');
            });
          }); // END on ready

          this.vmPlayer.on(e, (timeupdate) => {
            if (this._vimeoState.progress.duration !== progress.duration) {
              this.trigger('durationchange');
            }
            this._vimeoState.progress = progress;
            this.trigger(e);
          });

          this.vmPlayer.on('pause', () => this._vimeoState.playing = false);

          this.vmPlayer.on('play', () => {
            this._vimeoState.playing = true;
            this._vimeoState.ended = false;
          });
        }); // END forEach apiEvents

        this.vmPlayer.on('ended', () => {
          this._vimeoState.playing = false;
          this._vimeoState.ended = true;
        });

        this.vmPlayer.on('volumechange', (v) => {
          this._vimeoState.volume = v;
        });

        this.vmPlayer.on('error', (e) => {
          this.trigger('error', e);
        });
        // END API events

        this.triggerReady();
        logger.debug('\n' + 'created ' + this.name_ + ' player on ID: ' + this.el_.firstChild.id);
      } // END initVMPlayer

      initVimeoState() {
        var state = this._vimeoState = {
          ended:        false,
          playing:      false,
          muted:        false,
          volume:       0,
          progress: {
            seconds:    0,
            percent:    0,
            duration:   0
          }
        };

        this.vmPlayer.getCurrentTime().then(time => state.progress.seconds = time);
        this.vmPlayer.getDuration().then(time => state.progress.duration = time);
        this.vmPlayer.getPaused().then(paused => state.playing = !paused);
        this.vmPlayer.getVolume().then(volume => state.volume = volume);

        // jadams: workaround SHOW vjsBigPlayButton
        if (vjsControlbar) {
          // native VJS player
          // do nothing
        } else {
          // SHOW vjsBigPlayButton for Vimeo NATIVE players
          vjsPlayer         = videojs(this.options_.playerId);
          vjsBigPlayButtons = document.getElementsByClassName('vjs-big-play-button');

          for (var i = 0; i < vjsBigPlayButtons.length; i++) {
            var button = vjsBigPlayButtons[i];
            if (!button.parentElement.player.controls_) {
              vjsPlayer.player_.el_.classList.remove("vjs-controls-disabled");
            }
          } // END for vjsBigPlayButtons
        } // END

      } // END initVimeoState

      createEl() {
        vjsPlayer = videojs(this.options_.playerId);

        var div = document.createElement('div');
        div.setAttribute('id', this.options_.techId);
        div.setAttribute('style', 'width:100%; height:100%; top:0; left:0; position:absolute');
        div.setAttribute('class', 'vjs-tech');

        var techWrapper = document.createElement('div');
        techWrapper.setAttribute('class', 'vjs-tech-wrapper');
        techWrapper.appendChild(div);

        var techOverlay = document.createElement('div');
        techOverlay.setAttribute('class', 'vjs-tech-overlay');
        techOverlay.setAttribute('style', 'cursor: pointer; position:absolute; z-index: 1; top:0; left:0; width:100%; height:100%');
        techWrapper.appendChild(techOverlay);

        if (vjsControlbar) {
          // workaround TOGGLE play|pause for Vimmo Tech (click on video)
          techOverlay.addEventListener('click', (event) => {
            if (this._vimeoState.playing) {
              this.vmPlayer.pause();
              this.trigger('pause');
              this._vimeoState.playing = false;
            } else {
              this.vmPlayer.play();
              this.trigger('play');
              this._vimeoState.playing = true;
            }
          }); // END EventListener 'click'
        } else {
          // workaround PLAY for Vimmo Tech (click on video)
          techOverlay.addEventListener('click', (event) => {
            if (!this._vimeoState.playing) {
              vjsPlayer.player_.el_.classList.add("vjs-controls-disabled");
              this.vmPlayer.play();
              this.trigger('play');
              this._vimeoState.playing = true;
            } else {
              // errror in flow
            } // END if NOT playing
            // remove techOverlay as it is only required on initial page
            techOverlay.remove();
          }, {once: true}); // END EventListener 'click' ONCE
        } // END if vjsControlbar

        return techWrapper;
      } // END createEl

      controls() {
        return true;
      } // END controls

      supportsFullScreen() {
        return true;
      } // END supportsFullScreen

      src() {
        return this.options_.source;
      } // END src

      currentSrc() {
        return this.options_.source.src;
      } // END currentSrc

      volume() {
        // return this._vimeoState.volume;
        this.vmPlayer.getVolume().then((volume) => {
          // volume = the volume level of the player
          return volume;
        }).catch(function(error) {
          // an error occurred
        });
      } // END volume

      setVolume(volume) {
        // return this.vmPlayer.setVolume(volume);

        this.vmPlayer.setVolume(volume).then((volume) => {
          // volume was set
          this.trigger('volumechange');
          return volume;
        }).catch(function(error) {
          switch (error.name) {
              case 'RangeError':
              // the volume was less than 0 or greater than 1
                  break;
              default:
              // some other error occurred
                  break;
          }
        });
      } // END setVolume

      muted() {
        var player = videojs(this.options_.playerId);
        this.vmPlayer.getMuted().then((muted) => {
          // muted = whether muted is turned on or not
          // if (muted) {
          //   player.muted(true);
          // }
          return muted;
        }).catch(function(error) {
          // an error occurred
        });
      } // END muted

      setMuted(mute) {
        var player  = videojs(this.options_.playerId);
        var isMuted = !this._vimeoState.muted;  // toggle mute state
        var _this   = this;

        this.vmPlayer.setMuted(isMuted).then((muted) => {
          _this._vimeoState.muted = muted;
          // if (muted) {
          //   player.muted(true);
          // }
          return muted;
        }).catch(function(error) {
          // an error occurred
        });
      } // END setMuted

      buffered() {
        const progress = this._vimeoState.progress;
        return videojs.time.createTimeRanges(0, progress.percent * progress.duration);
      } // END buffered

      paused() {
        return !this._vimeoState.playing;
      } // END paused

      pause() {
        this.vmPlayer.pause();
        this._vimeoState.playing = false;
      } // END pause

      play() {
        vjsPlayer.player_.el_.classList.add("vjs-controls-disabled");
        this.vmPlayer.play();
        this._vimeoState.playing = true;
      } // END play

      ended() {
        return this._vimeoState.ended;
      } // END ended


      // currentTime() {
      //   return this._vimeoState.progress.seconds;
      // } // END
      //
      // setCurrentTime(time) {
      //   // this.vmPlayer.setCurrentTime(time);
      //   this.vmPlayer.setCurrentTime(30.456).then(function(seconds) {
      //   // seconds = the actual time that the player seeked to
      //   var currentTime = seconds
      //   }).catch(function(error) {
      //       switch (error.name) {
      //           case 'RangeError':
      //             // the time was less than 0 or greater than the video’s duration
      //             break;
      //           default:
      //             // some other error occurred
      //             break;
      //       }
      //   });
      // } // END setCurrentTime

      // currentTime() {
      //   var currentTime = this.vmPlayer ? this.vmPlayer.getCurrentTime() : 0;
      //   return currentTime;
      // }

      currentTime() {
        this.vmPlayer.getCurrentTime().then((seconds) => {
          // seconds = the current playback position
          return seconds;
        }).catch(function(error) {
          // an error occurred
        });
      } // END currentTime

      setCurrentTime(seconds) {
        if (this.lastState === vmPlayer.getPaused()) {
          this.timeBeforeSeek = this.currentTime();
        }

        if (!this.isSeeking) {
          this.wasPausedBeforeSeek = this.paused();
        }

        this.vmPlayer.seekTo(seconds, true);
        this.trigger('timeupdate');
        this.trigger('seeking');
        this.isSeeking = true;

        // A seek event during pause does not return an event to trigger a seeked event,
        // so run an interval timer to look for the currentTime to change
        if (this.lastState === vmPlayer.getPaused() && this.timeBeforeSeek !== seconds) {
          clearInterval(this.checkSeekedInPauseInterval);
          this.checkSeekedInPauseInterval = setInterval(function() {
            if (this.lastState !== vmPlayer.getPaused() || !this.isSeeking) {
              // If something changed while we were waiting for the currentTime to change,
              //  clear the interval timer
              clearInterval(this.checkSeekedInPauseInterval);
            } else if (this.currentTime() !== this.timeBeforeSeek) {
              this.trigger('timeupdate');
              this.onSeeked();
            }
          }.bind(this), 250);
        }
      } // END setCurrentTime

      seeking() {
        return this.isSeeking;
      } // END seeking

      // jadams, 2023-10-01: videojs.createTimeRange() deprecated in VideoJS 9
      //
      seekable() {
        if(!this.vmPlayer) {
          // return videojs.createTimeRange();
          return videojs.time.createTimeRanges();
        }
        // return videojs.createTimeRange(0, this.vmPlayer.getDuration());
        return videojs.time.createTimeRanges(0, this.vmPlayer.getDuration());
      } // END seekable

      onSeeked() {
        clearInterval(this.checkSeekedInPauseInterval);
        this.isSeeking = false;

        if (this.wasPausedBeforeSeek) {
          this.pause();
        }

        this.trigger('seeked');
      } // END onSeeked

      playbackRate() {
        return this.vmPlayer ? this.vmPlayer.getPlaybackRate() : 1;
      } // END playbackRate

      setPlaybackRate(suggestedRate) {
        if (!this.vmPlayer) {
          return;
        }

        this.vmPlayer.setPlaybackRate(suggestedRate);
      } // END setPlaybackRate

      // duration() {
      //   var duration = this.vmPlayer ? this.vmPlayer.getDuration() : 0;
      //   return duration;
      // }

      // duration() {
      //   return this._vimeoState.progress.duration;
      // } // END

      duration() {
        this.vmPlayer.getDuration().then((duration) => {
          // duration = the duration of the video in seconds
          return duration;
        }).catch(function(error) {
          // an error occurred
        });
      } // END duration

    } // END class Vimeo

    Vimeo.prototype.featuresTimeupdateEvents = true;

    Vimeo.isSupported = () => {
      return true;
    };

    // Add Source Handler pattern functions to this tech
    Tech.withSourceHandlers(Vimeo);

    Vimeo.nativeSourceHandler = {};

    /**
     * Check if Vimeo can play the given videotype
     * @param  {String} type    The mimetype to check
     * @return {String}         'maybe', or '' (empty string)
     */
    Vimeo.nativeSourceHandler.canPlayType = (source) => {
      if (source === 'video/vimeo') {
        return 'maybe';
      }
    };

    /*
     * Check Vimeo can handle the source natively
     *
     * @param  {Object} source  The source object
     * @return {String}         'maybe', or '' (empty string)
     * @note: Copied over from YouTube — not sure this is relevant
     */
    Vimeo.nativeSourceHandler.canHandleSource = (source) => {
      if (source.type) {
        return Vimeo.nativeSourceHandler.canPlayType(source.type);
      } else if (source.src) {
        return Vimeo.nativeSourceHandler.canPlayType(source.src);
      }
    };

    // @note: Copied over from YouTube — not sure this is relevant
    Vimeo.nativeSourceHandler.handleSource = (source, tech) => {
      tech.src(source.src);
    };

    // @note: Copied over from YouTube — not sure this is relevant
    Vimeo.nativeSourceHandler.dispose = () => {};

    Vimeo.registerSourceHandler(Vimeo.nativeSourceHandler);

    // Include the version number
    Vimeo.VERSION = '1.0.0';

    Vimeo.sdkReadyQueue = [];

    // Since the iframe can't be touched using Vimeo's way of embedding,
    // let's add a new styling rule to have the same style as `vjs-tech`
    //
    function injectCss() {
      if (cssInjected) {
        return;
      }
      cssInjected = true;

      const css = `
        .vjs-vimeo iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
        .vjs-vimeo-mobile .vjs-big-play-button { display: none; }
      `;

      const head  = document.head || document.getElementsByTagName('head')[0];
      const style = document.createElement('style');
      style.type  = 'text/css';

      if (style.styleSheet) {
        style.styleSheet.cssText = css;
      } else {
        style.appendChild(document.createTextNode(css));
      }

      logger.debug('\n' + 'added additional CSS styles');
      head.appendChild(style);
    } // END injectCss

    function apiLoaded() {
      Vimeo.isSdkReady = true;

      for (var i = 0; i < Vimeo.sdkReadyQueue.length; ++i) {
        Vimeo.sdkReadyQueue[i].initVMPlayer();
      }
      logger.debug('\n' + 'created all players from queue: #' + i);

      endTimeModule = Date.now();
      logger.debug('\n' + 'initializing plugin: finished');
      logger.debug('\n' + 'plugin initializing time: ' + (endTimeModule-startTimeModule) + 'ms');
    } // END apiLoaded

    function loadScript(src, callback) {
      var loaded         = false;
      var tag            = document.createElement('script');
      var firstScriptTag = document.getElementsByTagName('script')[0];

      if (!firstScriptTag) {
        // when loaded in jest without jsdom setup it doesn't get any element.
        // In jest it doesn't really make sense to do anything, because no
        // one is watching dailymotion in jest
        return;
      }

      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      tag.onload = function () {
        if (!loaded) {
          loaded = true;
          callback();
        }
      };

      tag.onreadystatechange = () => {
        if (!loaded && (this.readyState === 'complete' || this.readyState === 'loaded')) {
          loaded = true;
          callback();
        }
      };

      tag.src = src;
    } // END loadScript

    // initialize plugin if page ready
    // -------------------------------------------------------------------------
    var dependencies_met_page_ready = setInterval (() => {
      var pageState      = $('#content').css("display");
      var pageVisible    = (pageState === 'block') ? true : false;
      var j1CoreFinished = (j1.getState() === 'finished') ? true : false;
      var atticFinished  = (j1.adapter.attic.getState() == 'finished') ? true : false;

      if (j1CoreFinished && pageVisible && atticFinished) {
        startTimeModule = Date.now();

        logger.debug('\n' + 'initializing plugin: started');
        logger.debug('\n' + 'version of videoJS detected: ' + videojs.VERSION);

        // load script loaded from local because of NemeSpace conflicts (Vimeo -> VM)
        loadScript('/assets/theme/j1/modules/videojs/js/plugins/vm/api/vimeo.js', apiLoaded);
  //    loadScript('https://player.vimeo.com/api/player.js', apiLoaded);

        injectCss();

        clearInterval(dependencies_met_page_ready);
      } // END pageVisible
    }, 10); // END dependencies_met_page_ready


    // Check VJS versions to register Wistia TECH
    if (typeof videojs.registerTech !== 'undefined') {
      videojs.registerTech('Vimeo', Vimeo);
    } else {
      console.error('\n' + 'invalid version of videoJS detected: ' + videojs.VERSION);
    }

  }));
