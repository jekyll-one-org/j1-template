/*
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/modules/videojs/js/vimeo/vimeo.js
 # Provides Vimeo Playback Technology for Video.js V8 and newer
 #
 #  Product/Info:
 #  http://jekyll.one
 #
 #  Copyright (C) 2023, 2024 Juergen Adams
 #
 #  J1 Theme is licensed under MIT License.
 #  See: https://github.com/jekyll-one/J1 Theme/blob/master/LICENSE
 # -----------------------------------------------------------------------------
*/

/*global define, VM*/
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

   var _isOnMobile = videojs.browser.IS_IOS || videojs.browser.IS_ANDROID;
   var Tech        = videojs.getTech('Tech');
   var cssInjected = false;

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

        this.setPoster(options.poster);

        // Set the vjs-vimeo class to the player
        // parent is not set yet so we have to wait a tick
        var vm = this;
        setTimeout(function() {
          if (this.el_) {
            this.el_.parentNode.className += ' vjs-vimeo';

            if (_isOnMobile) {
              this.el_.parentNode.className += ' vjs-vimeo-mobile';
            }

            if (Vimeo.isSdkReady) {
              vm.initVMPlayer();
            } else {
              Vimeo.sdkReadyQueue.push(vm);
            }
          }
        }.bind(this));

      } // END Constructor

      initVMPlayer() {
        const vimeoOptions = {
          url: this.options_.source.src,
          byline: false,
          portrait: false,
          title: false
        };

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
        //
//      ['play', 'playing', 'pause', 'ended', 'timeupdate', 'progress', 'seeking', 'seeked'].forEach(e => {
        ['play', 'playing', 'pause', 'ended', 'loaded', 'timeupdate', 'progress', 'seeking', 'seeked', 'ready'].forEach(e => {

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
              var code = embedCode
            })
            .catch(function(error) {
             console.err('Vimeo API: an error occurred');
            });
          });

          this.vmPlayer.on(e, (timeupdate) => {
            if (this._vimeoState.progress.duration !== progress.duration) {
              this.trigger('durationchange');
            }
            this._vimeoState.progress = progress;
            this.trigger(e);
          });

          this.vmPlayer.on('pause', () => this._vimeoState.playing = false);

          this.vmPlayer.on('play', () => {
           const bigPlayButton = document.getElementsByClassName("vjs-big-play-button");

           // jadams: just a try
           // ------------------------------------------------------------------
            // for (var i = 0; i < bigPlayButton.length; ++i) {
            //   bigPlayButton[i].style.display = 'none';
            // }

            this._vimeoState.playing = true;
            this._vimeoState.ended = false;
          });

        });

        // jadams: just a try
        // ---------------------------------------------------------------------
        // this.vmPlayer.on('playing', () => {
        //   const vjsControlBar = document.getElementsByClassName("vjs-control-bar");
        //
        //   for (var i = 0; i < vjsControlBar.length; ++i) {
        //     vjsControlBar[i].style.display = 'block';
        //   }
        // });

        this.vmPlayer.on('ended', () => {
          this._vimeoState.playing = false;
          this._vimeoState.ended = true;
        });

        this.vmPlayer.on('volumechange', (v) => this._vimeoState.volume = v);
        this.vmPlayer.on('error', e => this.trigger('error', e));

        this.triggerReady();
      }

      initVimeoState() {
        const state = this._vimeoState = {
          ended: false,
          playing: false,
          volume: 0,
          progress: {
            seconds: 0,
            percent: 0,
            duration: 0
          }
        };

        this.vmPlayer.getCurrentTime().then(time => state.progress.seconds = time);
        this.vmPlayer.getDuration().then(time => state.progress.duration = time);
        this.vmPlayer.getPaused().then(paused => state.playing = !paused);
        this.vmPlayer.getVolume().then(volume => state.volume = volume);
      }

      createEl() {
//      jadams: videojs.createEl() is deprecated
//      const div = videojs.createEl('div', {
        const div = videojs.dom.createEl('div', {
          id: this.options_.techId
        });

        div.style.cssText = 'width:100%;height:100%;top:0;left:0;position:absolute';
        div.className = 'vjs-vimeo';

        return div;
      }

      controls() {
        return true;
      }

      supportsFullScreen() {
        return true;
      }

      src() {
        // @note: Not sure why this is needed but videojs requires it
        return this.options_.source;
        // return '//player.vimeo.com/api/player.js';
      }

      currentSrc() {
        return this.options_.source.src;
      }

      // @note setSrc is used in other usecases (Vimeo, Html) it doesn't seem required here
      // setSrc() {}

      currentTime() {
        return this._vimeoState.progress.seconds;
      }

      setCurrentTime(time) {
        this.vmPlayer.setCurrentTime(time);
      }

      volume() {
        return this._vimeoState.volume;
      }

      setVolume(volume) {
        return this.vmPlayer.setVolume(volume);
      }

      duration() {
        return this._vimeoState.progress.duration;
      }

      buffered() {
        const progress = this._vimeoState.progress;

//      jadams: videojs.createTimeRange is deprecated
//      return videojs.createTimeRange(0, progress.percent * progress.duration);
        return videojs.time.createTimeRanges(0, progress.percent * progress.duration);
      }

      paused() {
        return !this._vimeoState.playing;
      }

      pause() {
        this.vmPlayer.pause();
      }

      play() {
        this.vmPlayer.play();
      }

      muted() {
        return this._vimeoState.volume === 0;
      }

      ended() {
        return this._vimeoState.ended;
      }

      currentTime() {
        return this.vmPlayer ? this.vmPlayer.getCurrentTime() : 0;
      }

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
      }

      seeking() {
        return this.isSeeking;
      }

      // jadams, 2023-10-01: videojs.createTimeRange() deprecated in VideoJS 9
      //
      seekable() {
        if(!this.vmPlayer) {
          // return videojs.createTimeRange();
          return videojs.time.createTimeRanges();
        }
        // return videojs.createTimeRange(0, this.vmPlayer.getDuration());
        return videojs.time.createTimeRanges(0, this.vmPlayer.getDuration());
      }

      onSeeked() {
        clearInterval(this.checkSeekedInPauseInterval);
        this.isSeeking = false;

        if (this.wasPausedBeforeSeek) {
          this.pause();
        }

        this.trigger('seeked');
      }

      playbackRate() {
        return this.vmPlayer ? this.vmPlayer.getPlaybackRate() : 1;
      }

      setPlaybackRate(suggestedRate) {
        if (!this.vmPlayer) {
          return;
        }

        this.vmPlayer.setPlaybackRate(suggestedRate);
      }

      duration() {
        return this.vmPlayer ? this.vmPlayer.getDuration() : 0;
      }

      // Vimeo does has a mute API and native controls aren't being used,
      // so setMuted doesn't really make sense and shouldn't be called.
      // setMuted(mute) {}

    }

    Vimeo.prototype.featuresTimeupdateEvents = true;

    Vimeo.isSupported = function() {
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
    Vimeo.nativeSourceHandler.canPlayType = function(source) {
      if (source === 'video/vimeo') {
        return 'maybe';
      }

      return '';
    };

    /*
     * Check Vimeo can handle the source natively
     *
     * @param  {Object} source  The source object
     * @return {String}         'maybe', or '' (empty string)
     * @note: Copied over from YouTube — not sure this is relevant
     */
    Vimeo.nativeSourceHandler.canHandleSource = function(source) {
      if (source.type) {
        return Vimeo.nativeSourceHandler.canPlayType(source.type);
      } else if (source.src) {
        return Vimeo.nativeSourceHandler.canPlayType(source.src);
      }

      return '';
    };

    // @note: Copied over from YouTube — not sure this is relevant
    Vimeo.nativeSourceHandler.handleSource = function(source, tech) {
      tech.src(source.src);
    };

    // @note: Copied over from YouTube — not sure this is relevant
    Vimeo.nativeSourceHandler.dispose = function() { };

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

      // const css = `
      //   .vjs-vimeo iframe {
      //     position: absolute;
      //     top: 0;
      //     left: 0;
      //     width: 100%;
      //     height: 100%;
      //   }
      //   .vjs-vimeo .vjs-iframe-blocker { display: none; }
      //   .vjs-vimeo.vjs-user-inactive .vjs-iframe-blocker { display: block; }
      //   .vjs-vimeo .vjs-poster { background-size: cover; }'
      //   .vjs-vimeo-mobile .vjs-big-play-button { display: none; }
      //
      //   .vjs-vimeo .vjs-duration { display: none; }
      //   .vjs-vimeo .vjs-remaining-time { display: none; }
      //
      //   .vjs-vimeo .vjs-big-play-button { display: block; }
      //   .player .vp-player-ui-overlays { display: none !important; }
      // `;

      const css = `
        .vjs-vimeo iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
        .vjs-vimeo .vjs-iframe-blocker { display: none; }
        .vjs-vimeo.vjs-user-inactive .vjs-iframe-blocker { display: block; }
        .vjs-vimeo .vjs-poster { background-size: cover; }'
        .vjs-vimeo-mobile .vjs-big-play-button { display: none; }

        .vjs-vimeo .vjs-duration { display: none; }
        .vjs-vimeo .vjs-remaining-time { display: none; }
      `;

      const head  = document.head || document.getElementsByTagName('head')[0];
      const style = document.createElement('style');
      style.type  = 'text/css';

      if (style.styleSheet) {
        style.styleSheet.cssText = css;
      } else {
        style.appendChild(document.createTextNode(css));
      }

      head.appendChild(style);
    }

    function apiLoaded() {
      Vimeo.isSdkReady = true;

      for (var i = 0; i < Vimeo.sdkReadyQueue.length; ++i) {
        Vimeo.sdkReadyQueue[i].initVMPlayer();
      }
    }

    function loadScript(src, callback) {
      var loaded = false;
      var tag = document.createElement('script');
      var firstScriptTag = document.getElementsByTagName('script')[0];
      if (!firstScriptTag) {
        // when loaded in jest without jsdom setup it doesn't get any element.
        // In jest it doesn't really make sense to do anything, because no one is watching dailymotion in jest
        return;
      }
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      tag.onload = function () {
        if (!loaded) {
          loaded = true;
          callback();
        }
      };
      tag.onreadystatechange = function () {
        if (!loaded && (this.readyState === 'complete' || this.readyState === 'loaded')) {
          loaded = true;
          callback();
        }
      };
      tag.src = src;
    }

    // document ready
    //
    if (typeof document !== 'undefined') {
      // load script local because of NemeSpace conflicts (Vimeo -> VM)
      loadScript('/assets/themes/j1/modules/videojs/js/plugins/vm/api/vimeo.min.js', apiLoaded);
//    loadScript('https://player.vimeo.com/api/player.js', apiLoaded);
      injectCss();
    }

    // Older versions of VJS5 doesn't have the registerTech function
    if (typeof videojs.registerTech !== 'undefined') {
      videojs.registerTech('Vimeo', Vimeo);
    } else {
      videojs.registerComponent('Vimeo', Vimeo);
    }

  }));
