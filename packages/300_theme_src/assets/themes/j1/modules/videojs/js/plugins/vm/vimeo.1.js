/*
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/modules/videojs/js/vimeo/vimeo.js
 # Provides Vimeo Playback Technology for Video.js V8 and newer
 #
 #  Product/Info:
 #  http://jekyll.one
 #
 #  Copyright (C) 2023 Juergen Adams
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
// 'use strict';

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

        // injectCss();
        // loadScript('https://player.vimeo.com/api/player.js', apiLoaded);

        this.setPoster(options.poster);
        this.initVimeoPlayer();
      }

      initVimeoPlayer() {
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

        this._player = new VimeoPlayer(this.el(), vimeoOptions);
        this.initVimeoState();

        ['play', 'pause', 'ended', 'timeupdate', 'progress', 'seeked'].forEach(e => {
          this._player.on(e, (progress) => {
            if (this._vimeoState.progress.duration !== progress.duration) {
              this.trigger('durationchange');
            }
            this._vimeoState.progress = progress;
            this.trigger(e);
          });
        });

        this._player.on('pause', () => this._vimeoState.playing = false);
        this._player.on('play', () => {

          // jadams: just a try
          // -------------------------------------------------------------------
          // const vjsControlBar = document.getElementsByClassName("vjs-control-bar");
          // vjsControlBar[0].style.display = 'block';

          this._vimeoState.playing = true;
          this._vimeoState.ended = false;
        });
        this._player.on('ended', () => {
          this._vimeoState.playing = false;
          this._vimeoState.ended = true;
        });
        this._player.on('volumechange', (v) => this._vimeoState.volume = v);
        this._player.on('error', e => this.trigger('error', e));

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

        this._player.getCurrentTime().then(time => state.progress.seconds = time);
        this._player.getDuration().then(time => state.progress.duration = time);
        this._player.getPaused().then(paused => state.playing = !paused);
        this._player.getVolume().then(volume => state.volume = volume);
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
        this._player.setCurrentTime(time);
      }

      volume() {
        return this._vimeoState.volume;
      }

      setVolume(volume) {
        return this._player.setVolume(volume);
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
        this._player.pause();
      }

      play() {
        this._player.play();
      }

      muted() {
        return this._vimeoState.volume === 0;
      }

      ended() {
        return this._vimeoState.ended;
      }

      // jadams: TODO
      // replace all YT.Player* by theirs Videmo API conterparts
      // -----------------------------------------------------------------------

      currentTime() {
        return this._player ? this._player.getCurrentTime() : 0;
      }

      setCurrentTime(seconds) {
        if (this.lastState === YT.PlayerState.PAUSED) {
          this.timeBeforeSeek = this.currentTime();
        }

        if (!this.isSeeking) {
          this.wasPausedBeforeSeek = this.paused();
        }

        this._player.seekTo(seconds, true);
        this.trigger('timeupdate');
        this.trigger('seeking');
        this.isSeeking = true;

        // A seek event during pause does not return an event to trigger a seeked event,
        // so run an interval timer to look for the currentTime to change
        if (this.lastState === YT.PlayerState.PAUSED && this.timeBeforeSeek !== seconds) {
          clearInterval(this.checkSeekedInPauseInterval);
          this.checkSeekedInPauseInterval = setInterval(function() {
            if (this.lastState !== YT.PlayerState.PAUSED || !this.isSeeking) {
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
        if(!this._player) {
          // return videojs.createTimeRange();
          return videojs.time.createTimeRanges();
        }
        // return videojs.createTimeRange(0, this._player.getDuration());
        return videojs.time.createTimeRanges(0, this._player.getDuration());
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
        return this._player ? this._player.getPlaybackRate() : 1;
      }

      setPlaybackRate(suggestedRate) {
        if (!this._player) {
          return;
        }

        this._player.setPlaybackRate(suggestedRate);
      }

      duration() {
        return this._player ? this._player.getDuration() : 0;
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

    var _isOnMobile = videojs.browser.IS_IOS || videojs.browser.IS_NATIVE_ANDROID;
    var Tech        = videojs.getTech('Tech');
    var cssInjected = false;

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
        .vjs-vimeo .vjs-iframe-blocker { display: none; }
        .vjs-vimeo.vjs-user-inactive .vjs-iframe-blocker { display: block; }
        .vjs-vimeo .vjs-poster { background-size: cover; }'
        .vjs-vimeo-mobile .vjs-big-play-button { display: none; }


      `;

//    'use strict';

      function apiLoaded() {
        Vimeo.isSdkReady = true;

        // for (var i = 0; i < Dailymotion.sdkReadyQueue.length; ++i) {
        //   Vimeo.sdkReadyQueue[i].initDMPlayer();
        // }
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

    // document ready
    //
    if (typeof document !== 'undefined'){
      // loadScript('https://player.vimeo.com/api/player.js', apiLoaded);
      injectCss();
    }

    // Older versions of VJS5 doesn't have the registerTech function
    if (typeof videojs.registerTech !== 'undefined') {
      videojs.registerTech('Vimeo', Vimeo);
    } else {
      videojs.registerComponent('Vimeo', Vimeo);
    }

  }));
