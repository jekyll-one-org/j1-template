/*
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/modules/videojs/js/plugins/players/yt/youtube.js (5)
 # Provides YouTube Playback Technology (Tech) for Video.js V8 and newer
 #
 # Product/Info:
 # http://jekyll.one
 #
 # Copyright (C) 2023-2026 Juergen Adams
 # Copyright (C) 2014-2015 Gary Katsevman, Benoit Tremblay
 #
 # YouTube Playback Technology (Tech) is licensed under MIT License.
 # See: https://github.com/videojs/videojs-youtube/blob/main/README.md
 # J1 Theme is licensed under MIT License.
 # See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 # -----------------------------------------------------------------------------
*/

/* Version 3.1.5 for J1 Template */

/* global define, YT */
(function (root, factory) {
  if(typeof exports==='object' && typeof module!=='undefined') {
    var videojs = require('video.js');
    module.exports = factory(videojs.default || videojs);
  } else if(typeof define === 'function' && define.amd) {
    define(['videojs'], function(videojs){
      return (root.Youtube = factory(videojs));
    });
  } else {
    root.Youtube = factory(root.videojs);
  }
}(this, function(videojs) {
  'use strict';

  const consoleLogId = generateId();

  // var isDev = (j1.env === "development" || j1.env === "dev") ? true : false;
  var isDev = true;

  var logger      = log4javascript.getLogger('videoJS.plugin.youtube');
  var _isOnMobile = videojs.browser.IS_IOS || videojs.browser.IS_NATIVE_ANDROID;
  var Tech        = videojs.getTech('Tech');

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

  /**
   * consoleLog - formatted console output with timestamp and unique ID
   * @param {string} level   - Log level: 'INFO', 'WARN', or 'ERROR'
   * @param {string} module  - Source module identifier
   * @param {string} message - Log message text
   */  
  function consoleLog(level, module, message) {
    const timestamp = new Date().toISOString().slice(11, 23);

    switch (level) {

      case 'INFO':
        console.log(`[${timestamp}] [${consoleLogId}] [${level}] [${module}] \n${message}`);
        break;
      case 'WARN':
        console.warn(`[${timestamp}] [${consoleLogId}] [${level}] [${module}] \n${message}`);
        break;
      case 'ERROR':
        console.error(`[${timestamp}] [${consoleLogId}] [${level}] [${module}] \n${message}`);
        break;
      default:
        console.log(`[${timestamp}] [${consoleLogId}] [${level}] [${module}] \n${message}`);
        break;
    }

  }

  class Youtube extends Tech {

    constructor(options, ready) {
      super(options, ready);

      this.setPoster(options.poster);
      this.setSrc(this.options_.source, true);

      // Set the vjs-youtube class to the player
      // Parent is not set yet so we have to wait a tick
      this.setTimeout(function() {
        if (this.el_) {
          this.el_.parentNode.className += ' vjs-youtube';

          if (_isOnMobile) {
            this.el_.parentNode.className += ' vjs-youtube-mobile';
          }

          if (Youtube.isApiReady) {
            this.initYTPlayer();
          } else {
            Youtube.apiReadyQueue.push(this);
          }
        }
      }.bind(this));
    } // END constructor

    dispose() {
      if (this.ytPlayer) {
        // Dispose of the YouTube Player
        if (this.ytPlayer.stopVideo) {
          this.ytPlayer.stopVideo();
        }
        if (this.ytPlayer.destroy) {
          this.ytPlayer.destroy();
        }
      } else {
        // YouTube API hasn't finished loading or the player is already disposed
        var index = Youtube.apiReadyQueue.indexOf(this);
        if (index !== -1) {
          Youtube.apiReadyQueue.splice(index, 1);
        }
      }
      this.ytPlayer = null;

      this.el_.parentNode.className = this.el_.parentNode.className
          .replace(' vjs-youtube', '')
          .replace(' vjs-youtube-mobile', '');
      this.el_.parentNode.removeChild(this.el_);

      // Needs to be called after the YouTube player is destroyed,
      // otherwise there will be a null reference exception
      Tech.prototype.dispose.call(this);
    } // END dispose

    createEl() {
      var div = document.createElement('div');
      div.setAttribute('id', this.options_.techId);
      div.setAttribute('style', 'width:100%;height:100%;top:0;left:0;position:absolute');
      div.setAttribute('class', 'vjs-tech');

      var divWrapper = document.createElement('div');
      divWrapper.appendChild(div);

      if (!_isOnMobile && !this.options_.ytControls) {
        var divBlocker = document.createElement('div');
        divBlocker.setAttribute('class', 'vjs-iframe-blocker');
        divBlocker.setAttribute('style', 'position:absolute;top:0;left:0;width:100%;height:100%');

        // In case the blocker is still there and we want to pause
        divBlocker.onclick = function() {
          this.pause();
        }.bind(this);

        divWrapper.appendChild(divBlocker);
      }

      return divWrapper;
    } // END createEl

    initYTPlayer() {

      var vjsOptions    = j1.modules.videojs.options;
      var playersParams = vjsOptions.players.youtube;

      // Default YT Player settings
      var playerVars = {
        autoplay:         playersParams.autoplay,
        controls:         playersParams.controls,
        cc_load_policy:   playersParams.cc_load_policy,
        disablekb:        playersParams.disablekb,
        enablejsapi:      playersParams.enablejsapi,    
        fs:               playersParams.fs,
        iv_load_policy:   playersParams.iv_load_policy,
        loop:             playersParams.loop,
        modestbranding:   playersParams.modestbranding,
        rel:              playersParams.rel,
        showinfo:         playersParams.showinfo
      };

      // Let the user set any YouTube parameter
      // https://developers.google.com/youtube/player_parameters?playerVersion=HTML5#Parameters
      // To use YouTube controls, you must use ytControls instead
      // to use the loop or autoplay, use the video.js settings
      //------------------------------------------------------------------------

      if (typeof this.options_.autohide !== 'undefined') {
        playerVars.autohide = this.options_.autohide;
      }

      if (typeof this.options_.loop !== 'undefined') {
        playerVars.loop = this.options_.loop;
      }

      if (typeof this.options_['cc_load_policy'] !== 'undefined') {
        playerVars.cc_load_policy = this.options_['cc_load_policy'];
      }

      // `this.options_['cc_load_policy']` a second time (copy-paste error)
      // but assigned to `iv_load_policy`. Fixed the condition to check
      // `iv_load_policy` as intended.
      if (typeof this.options_['iv_load_policy'] !== 'undefined') {
        playerVars.iv_load_policy = this.options_['iv_load_policy'];
      }
      if (typeof this.options_.ytControls !== 'undefined') {
        playerVars.controls = this.options_.ytControls;
      }

      if (typeof this.options_.disablekb !== 'undefined') {
        playerVars.disablekb = this.options_.disablekb;
      }

      if (typeof this.options_.color !== 'undefined') {
        playerVars.color = this.options_.color;
      }

      if (!playerVars.controls) {
        // Let video.js handle the fullscreen unless it is the
        // YouTube native controls
        playerVars.fs = 0;
      } else if (typeof this.options_.fs !== 'undefined') {
        playerVars.fs = this.options_.fs;
      }

      if (this.options_.source.src.indexOf('end=') !== -1) {
        var srcEndTime = this.options_.source.src.match(/end=([0-9]*)/);
        this.options_.end = parseInt(srcEndTime[1]);
      }

      if (typeof this.options_.end !== 'undefined') {
        playerVars.end = this.options_.end;
      }

      if (typeof this.options_.hl !== 'undefined') {
        playerVars.hl = this.options_.hl;
      } else if (typeof this.options_.language !== 'undefined') {
        // Set the YouTube player on the same language than video.js
        playerVars.hl = this.options_.language.substr(0, 2);
      }

      if (typeof this.options_['iv_load_policy'] !== 'undefined') {
        playerVars['iv_load_policy'] = this.options_['iv_load_policy'];
      }

      if (typeof this.options_.list !== 'undefined') {
        playerVars.list = this.options_.list;
      } else if (this.url && typeof this.url.listId !== 'undefined') {
        playerVars.list = this.url.listId;
      }

      if (typeof this.options_.listType !== 'undefined') {
        playerVars.listType = this.options_.listType;
      }

      // Deprecated
      //
      if (typeof this.options_.modestbranding !== 'undefined') {
        playerVars.modestbranding = this.options_.modestbranding;
      }

      if (typeof this.options_.playlist !== 'undefined') {
        playerVars.playlist = this.options_.playlist;
      }

      if (typeof this.options_.playsinline !== 'undefined') {
        playerVars.playsinline = this.options_.playsinline;
      }

      if (typeof this.options_.rel !== 'undefined') {
        playerVars.rel = this.options_.rel;
      }

      if (typeof this.options_.showinfo !== 'undefined') {
        playerVars.showinfo = this.options_.showinfo;
      }

      if (this.options_.source.src.indexOf('start=') !== -1) {
        var srcStartTime = this.options_.source.src.match(/start=([0-9]*)/);
        this.options_.start = parseInt(srcStartTime[1]);
      }

      if (typeof this.options_.start !== 'undefined') {
        playerVars.start = this.options_.start;
      }

      if (typeof this.options_.theme !== 'undefined') {
        playerVars.theme = this.options_.theme;
      }

      // allow undocumented options to be passed along via customVars
      //
      if (typeof this.options_.customVars !== 'undefined') {
        var customVars = this.options_.customVars;
        Object.keys(customVars).forEach((key) => {
          playerVars[key] = customVars[key];
        });
      }

      this.activeVideoId = this.url ? this.url.videoId : null;
      this.activeList = playerVars.list;

      var playerConfig = {
        videoId: this.activeVideoId,
        playerVars: playerVars,
        events: {
          onReady: this.onPlayerReady.bind(this),
          onPlaybackQualityChange: this.onPlayerPlaybackQualityChange.bind(this),
          onPlaybackRateChange: this.onPlayerPlaybackRateChange.bind(this),
          onStateChange: this.onPlayerStateChange.bind(this),
          onVolumeChange: this.onPlayerVolumeChange.bind(this),
          onError: this.onPlayerError.bind(this)
        }
      };

      if (typeof this.options_.enablePrivacyEnhancedMode !== 'undefined' && this.options_.enablePrivacyEnhancedMode) {
        playerConfig.host = 'https://www.youtube-nocookie.com';
      }

      this.ytPlayer = new YT.Player(this.options_.techId, playerConfig);

      isDev && logger.debug('\n' + 'created ' + this.name_ + ' player on ID: ' + this.el_.firstChild.id);
    } // END initYTPlayer

    onPlayerReady() {
      if (this.options_.muted) {
        this.ytPlayer.mute();
      }

      var playbackRates = this.ytPlayer.getAvailablePlaybackRates();
      if (playbackRates.length > 1) {
        this.featuresPlaybackRate = true;
      }

      // extract video data from YT video
      // Extract ALL available video data from the YT player object
      // and store it on the tech instance so the VJS player (and
      // adapters like skipad.js) can access it via
      //   player.tech().videoData()   – full data object
      //   player.tech().videoTitle()  – title string (kept for backward compatibility)
      try {
        var rawVideoData   = this.ytPlayer.getVideoData();
        this.ytVideoData_  = rawVideoData || {};
        this.ytVideoTitle_ = (rawVideoData && rawVideoData.title) ? rawVideoData.title : '';

        isDev && logger.debug('\n' + 'extracted YT video data: '
          + JSON.stringify(this.ytVideoData_));
      } catch (e) {
        this.ytVideoData_  = {};
        this.ytVideoTitle_ = '';
        isDev && logger.debug('\n' + 'failed to extract YT video data: ' + e);
      }
      // END extract video data from YT video

      this.playerReady_ = true;
      this.triggerReady();

      if (this.playOnReady) {
        this.play();
      } else if (this.cueOnReady) {
        this.cueVideoById_(this.url.videoId);
        this.activeVideoId = this.url.videoId;
      }
    } // END onPlayerReady

    onPlayerPlaybackQualityChange() {
      // do nothing
    } // END onPlayerPlaybackQualityChange

    onPlayerPlaybackRateChange() {
      this.trigger('ratechange');
    } // END onPlayerPlaybackRateChange

    onPlayerStateChange(e) {
      var state = e.data;

      if (state === this.lastState || this.errorNumber) {
        return;
      }

      this.lastState = state;

      switch (state) {
        case -1:
          this.trigger('loadstart');
          this.trigger('loadedmetadata');
          this.trigger('durationchange');
          this.trigger('ratechange');
          break;

        case YT.PlayerState.ENDED:
          this.trigger('ended');
          break;

        case YT.PlayerState.PLAYING:
          // YouTube's IFrame API only populates the `author` field in
          // getVideoData() AFTER playback begins. The initial fetch
          // in onPlayerReady() runs before that, so `author` is always
          // an empty string.
          try {
            if (this.ytPlayer && typeof this.ytPlayer.getVideoData === 'function') {
              var freshData = this.ytPlayer.getVideoData();
              if (freshData &&
                  (  (freshData.author && (!this.ytVideoData_ || this.ytVideoData_.author !== freshData.author))
                  || (freshData.title  && (!this.ytVideoData_ || this.ytVideoData_.title  !== freshData.title))
                  )) {
                this.ytVideoData_  = freshData;
                this.ytVideoTitle_ = freshData.title || this.ytVideoTitle_;

                isDev && logger.debug('\n' + 'updated YT video data (author now available): '
                  + JSON.stringify(this.ytVideoData_));

              }
            }
          } catch (e) {
            isDev && logger.debug('\n' + 'failed to re-read YT video data on PLAYING: ' + e);
          }

          this.trigger('timeupdate');
          this.trigger('durationchange');
          this.trigger('playing');
          this.trigger('play');

          if (this.isSeeking) {
            this.onSeeked();
          }
          break;

        case YT.PlayerState.PAUSED:
          this.trigger('canplay');
          if (this.isSeeking) {
            this.onSeeked();
          } else {
            this.trigger('pause');
          }
          break;

        case YT.PlayerState.BUFFERING:
          this.player_.trigger('timeupdate');
          this.player_.trigger('waiting');
          break;
      }
    } // END onPlayerStateChange

    onPlayerVolumeChange() {
      this.trigger('volumechange');
    } // END onPlayerVolumeChange

    onPlayerError(e) {
      this.errorNumber = e.data;
      this.trigger('pause');
      this.trigger('error');
    } // END onPlayerError

    error() {
      var code = 1000 + this.errorNumber; // lower codes are reserved
      switch (this.errorNumber) {
        case 5:
          return { code: code, message: 'Error while trying to play the video' };

        case 2:
        case 100:
          return { code: code, message: 'Unable to find the video' };

        case 101:
        case 150:
          return {
            code: code,
            message: 'Playback on other Websites has been disabled by the video owner.'
          };
      }

      return { code: code, message: 'YouTube unknown error (' + this.errorNumber + ')' };
    } // END error

    loadVideoById_(id) {
      var options = {
        videoId: id
      };
      if (this.options_.start) {
        options.startSeconds = this.options_.start;
      }
      if (this.options_.end) {
        options.endSeconds = this.options_.end;
      }
      this.ytPlayer.loadVideoById(options);
    } // END loadVideoById_

    cueVideoById_(id) {
      var options = {
        videoId: id
      };
      if (this.options_.start) {
        options.startSeconds = this.options_.start;
      }
      if (this.options_.end) {
        options.endSeconds = this.options_.end;
      }
      this.ytPlayer.cueVideoById(options);
    } // END cueVideoById_

    // extract video data from YT video
    // Public getter so the VJS player and external adapters can
    // retrieve ALL YouTube video data via player.tech().videoData().
    // Returns the full object from YT's getVideoData() which
    // typically includes: video_id, title, author,
    // video_quality, video_quality_features, list, and more
    // depending on the YT IFrame API version.
    videoData() {
      // If data was already cached, return it immediately
      if (this.ytVideoData_ && Object.keys(this.ytVideoData_).length) {
        return this.ytVideoData_;
      }
      // Attempt a live read from the YT player (covers late calls
      // after onPlayerReady has already fired)
      try {
        if (this.ytPlayer && typeof this.ytPlayer.getVideoData === 'function') {
          this.ytVideoData_ = this.ytPlayer.getVideoData() || {};
        }
      } catch (e) {
        this.ytVideoData_ = {};
      }
      return this.ytVideoData_ || {};
    } // END videoData

    // extract video data from YT video
    // Backward-compatible getter – returns only the title string.
    videoTitle() {
      // If the title was already cached, return it immediately
      if (this.ytVideoTitle_) {
        return this.ytVideoTitle_;
      }
      // Derive from the full data object
      var data = this.videoData();
      this.ytVideoTitle_ = (data && data.title) ? data.title : '';
      return this.ytVideoTitle_ || '';
    } // END videoTitle

    poster() {
      // You can't start programmaticlly a video with a mobile through 
      // the iframe so needed to hide the poster and the play button (with CSS)
      if (_isOnMobile) {
        return null;
      }

      return this.poster_;
    } // END poster

    setPoster(poster) {
      this.poster_ = poster;
    } // END setPoster

    src(src) {
      if (src) {
        this.setSrc({ src: src });
      }

      return this.source;
    } // END src

    setSrc(source) {
      if (!source || !source.src) {
        return;
      }

      delete this.errorNumber;
      this.source = source;
      this.url = Youtube.parseUrl(source.src);

      // jadams, 2025-06-14: disabled for now
      // -----------------------------------------------------------------------
      var checkVideoPoster = false;
      if (checkVideoPoster && this.poster_ === '') {
//      if (!this.options_.poster && checkVideoPoster) {
        if (this.url.videoId) {
          // Set the low resolution first
//        this.poster_ = 'https://img.youtube.com/vi/' + this.url.videoId + '/0.jpg';
//        this.poster_ = 'https://img.youtube.com/vi/' + this.url.videoId + '/sddefault.jpg';
          this.poster_ = 'https://img.youtube.com/vi/' + this.url.videoId + '/mqdefault.jpg';
          this.trigger('posterchange');

          // Check if their is a high res image
          this.checkHighResPoster();
        }
      }

      if (this.options_.autoplay && !_isOnMobile) {
        if (this.isReady_) {
          this.play();
        } else {
          this.playOnReady = true;
        }
      } else if (this.activeVideoId !== this.url.videoId) {
        if (this.isReady_) {
          this.cueVideoById_(this.url.videoId);
          this.activeVideoId = this.url.videoId;
        } else {
          this.cueOnReady = true;
        }
      }
    } // END setSrc

    autoplay() {
      return this.options_.autoplay;
    } // END autoplay

    setAutoplay(val) {
      this.options_.autoplay = val;
    } // END setAutoplay

    loop() {
      return this.options_.loop;
    } // END

    setLoop(val) {
      this.options_.loop = val;
    } // END loop

    play() {
      if (!this.url || !this.url.videoId) {
        return;
      }

      this.wasPausedBeforeSeek = false;

      if (this.isReady_) {
        if (this.url.listId) {
          if (this.activeList === this.url.listId) {
            this.ytPlayer.playVideo();
          } else {
            this.ytPlayer.loadPlaylist(this.url.listId);
            this.activeList = this.url.listId;
          }
        }

        if (this.activeVideoId === this.url.videoId) {
          this.ytPlayer.playVideo();
        } else {
          this.loadVideoById_(this.url.videoId);
          this.activeVideoId = this.url.videoId;
        }
      } else {
        this.trigger('waiting');
        this.playOnReady = true;
      }
    } // END play

    pause() {
      if (this.ytPlayer) {
        this.ytPlayer.pauseVideo();
      }
    } // END pause

    paused() {
      return (this.ytPlayer) ?
          (this.lastState !== YT.PlayerState.PLAYING && this.lastState !== YT.PlayerState.BUFFERING)
          : true;
    } // END

    currentTime() {
      return this.ytPlayer ? this.ytPlayer.getCurrentTime() : 0;
    } // END currentTime

    setCurrentTime(seconds) {
      if (this.lastState === YT.PlayerState.PAUSED) {
        this.timeBeforeSeek = this.currentTime();
      }

      if (!this.isSeeking) {
        this.wasPausedBeforeSeek = this.paused();
      }

      this.ytPlayer.seekTo(seconds, true);
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
    } // END setCurrentTime

    seeking() {
      return this.isSeeking;
    } // END seeking

    seekable() {
      if(!this.ytPlayer) {
        return videojs.time.createTimeRanges();
      }

      return videojs.time.createTimeRanges(0, this.ytPlayer.getDuration());
    } // END seekable

    onSeeked() {
      clearInterval(this.checkSeekedInPauseInterval);
      this.isSeeking = false;

      if (this.wasPausedBeforeSeek) {
        this.pause();
      }

      this.trigger('seeked');
    } // END

    playbackRate() {
      // jadams, 2025-06-22: check to prevent "Cannot read properties of undefined"
      try {
        return this.ytPlayer ? this.ytPlayer.getPlaybackRate() : 1;
      } catch (error) {
        return 1; // getPlaybackRate is not available/supported
      }
    } // END playbackRate

    setPlaybackRate(suggestedRate) {
      if (!this.ytPlayer) {
        return;
      }

      // jadams, 2025-06-22: check to prevent "Cannot read properties of undefined"
      try {
        this.ytPlayer.setPlaybackRate(suggestedRate);
      } catch (error) {
        this.ytPlayer.setPlaybackRate(1); // setPlaybackRate is not available/supported
      }
    } // END setPlaybackRate

    duration() {
      // jadams, 2025-06-22: check to prevent "Cannot read properties of undefined"
      try {
        return this.ytPlayer ? this.ytPlayer.getDuration() : 0;
      } catch (error) {
        return 0; // return 0, if getDuration is not available/supported
      }
    } // END duration

    currentSrc() {
      return this.source && this.source.src;
    } // END

    ended() {
      return this.ytPlayer ? (this.lastState === YT.PlayerState.ENDED) : false;
    } // END ended

    volume() {
      return this.ytPlayer ? this.ytPlayer.getVolume() / 100.0 : 1;
    } // END volume

    setVolume(percentAsDecimal) {
      if (!this.ytPlayer) {
        return;
      }

      this.ytPlayer.setVolume(percentAsDecimal * 100.0);
    } // END setVolume

    muted() {
      return this.ytPlayer ? this.ytPlayer.isMuted() : false;
    } // END muted

    // removed erroneous `this.muted(true)` call
    // in the else-branch. `muted()` is a getter (returns boolean), so calling
    // it with an argument had no effect. The else-branch was also logically
    // unreachable (it ran when `!this.ytPlayer` was true, then immediately
    // fell through to code that requires `this.ytPlayer`). Removed the dead
    // else-branch entirely.
    setMuted(mute) {
      if (!this.ytPlayer) {
        return;
      }

      if (mute) {
        this.ytPlayer.mute();
      } else {
        this.ytPlayer.unMute();
      }
      this.setTimeout(() => {
        this.trigger('volumechange');
      }, 50);
    } // END setMuted

    // removed unused `bufferedEnd` variable.
    // The value was computed but never used; the return always used full
    // duration instead.
    buffered() {
      if(!this.ytPlayer || !this.ytPlayer.getVideoLoadedFraction) {
        return videojs.time.createTimeRanges();
      }

      return videojs.time.createTimeRanges(0, this.ytPlayer.getDuration());
    } // END buffered

    // TODO: Can we really do something with this on YouTUbe?
    preload() {}
    load() {}
    reset() {}

    networkState() {
      if (!this.ytPlayer) {
        return 0; //NETWORK_EMPTY
      }
      switch (this.ytPlayer.getPlayerState()) {
        case -1: //unstarted
          return 0; //NETWORK_EMPTY
        case 3: //buffering
          return 2; //NETWORK_LOADING
        default:
          return 1; //NETWORK_IDLE
      }
    } // END networkState

    readyState() {
      if (!this.ytPlayer) {
        return 0; //HAVE_NOTHING
      }
      switch (this.ytPlayer.getPlayerState()) {
        case -1: //unstarted
          return 0; //HAVE_NOTHING
        case 5: //video cued
          return 1; //HAVE_METADATA
        case 3: //buffering
          return 2; //HAVE_CURRENT_DATA
        default:
          return 4; //HAVE_ENOUGH_DATA
      }
    } // END readyState

    supportsFullScreen() {
      return document.fullscreenEnabled ||
          document.webkitFullscreenEnabled ||
          document.mozFullScreenEnabled ||
          document.msFullscreenEnabled;
    } // END supportsFullScreen

    // Tries to get the highest resolution thumbnail available for the video
    checkHighResPoster() {
      var uri = 'https://img.youtube.com/vi/' + this.url.videoId + '/maxresdefault.jpg';

      try {
        var image = new Image();
        image.onload = function() {
          // Onload may still be called if YouTube returns the 120x90 error thumbnail
          if('naturalHeight' in image){
            if (image.naturalHeight <= 90 || image.naturalWidth <= 120) {
              return;
            }
          } else if(image.height <= 90 || image.width <= 120) {
            return;
          }
          this.poster_ = uri;
          this.trigger('posterchange');
        }.bind(this);

        image.onerror = function() {};
        image.src     = uri;
      }

      catch(event){}
    } // END  checkHighResPoster

  } // END  class YouTube

  Youtube.isSupported = () => {
    return true;
  };

  Youtube.canPlaySource = (event) => {
    return Youtube.canPlayType(event.type);
  };

  Youtube.canPlayType = (event) => {
    return (event === 'video/youtube');
  };

  Youtube.parseUrl = (url) => {
    var result = {
      videoId: null
    };

    var regex = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    var match = url.match(regex);

    if (match && match[2].length === 11) {
      result.videoId = match[2];
    }

    var regPlaylist = /[?&]list=([^#\&\?]+)/;
    match = url.match(regPlaylist);

    if(match && match[1]) {
      result.listId = match[1];
    }

    return result;
  };

  function apiLoaded() {
    YT.ready(() => {
      Youtube.isApiReady = true;
      isDev && logger.debug('\n' + 'API loaded successfully');

      for (var i = 0; i < Youtube.apiReadyQueue.length; ++i) {
        Youtube.apiReadyQueue[i].initYTPlayer();
      }
      isDev && logger.debug('\n' + 'created all players from queue: #' + i);

      endTimeModule = Date.now();
      isDev && logger.debug('\n' + 'initializing plugin: finished');
      isDev && logger.debug('\n' + 'plugin initializing time: ' + (endTimeModule-startTimeModule) + 'ms');
    });
  } // END apiLoaded

  // replaced `this.readyState` inside the arrow
  // function's `onreadystatechange` handler with `tag.readyState`. In the
  // original code, the arrow function lexically captures the outer `this`
  // (the module/window scope), NOT the script element, so
  // `this.readyState` would always be undefined. Using `tag.readyState`
  // correctly references the script element's ready state.
  function loadScript(src, callback) {
    var loaded = false;
    var tag = document.createElement('script');
    var firstScriptTag = document.getElementsByTagName('script')[0];
    if (!firstScriptTag) {
      // when loaded in jest without jsdom setup it doesn't get any element.
      // In jest it doesn't really make sense to do anything, because no one is watching youtube in jest
      return;
    }
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    tag.onload = () => {
      if (!loaded) {
        loaded = true;
        callback();
      }
    };
    tag.onreadystatechange = () => {
      if (!loaded && (tag.readyState === 'complete' || tag.readyState === 'loaded')) {
        loaded = true;
        callback();
      }
    };
    tag.src = src;
  } // END loadScript

  function injectCss() {
    // hide controlbar for YT video
    // When the marker class 'vjs-youtube-hide-controlbar' is present on
    // the player container, the entire VideoJS control bar is hidden.
    // The class is toggled by the skipad adapter (or any consumer) via
    // player.addClass('vjs-youtube-hide-controlbar').
    const css = `
      .vjs-youtube .vjs-iframe-blocker { display: none; }
      .vjs-youtube.vjs-user-inactive .vjs-iframe-blocker { display: block; }
      .vjs-youtube .vjs-poster { background-size: cover; }
      .vjs-youtube-mobile .vjs-big-play-button { display: none; }
      .vjs-youtube.vjs-youtube-hide-controlbar .vjs-control-bar { display: none !important; }
    `;

    var head = document.head || document.getElementsByTagName('head')[0];

    var style = document.createElement('style');
    style.type = 'text/css';

    if (style.styleSheet){
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(document.createTextNode(css));
    }

    head.appendChild(style);
    isDev && logger.debug('\n' + 'added additional CSS styles');
  } // END injectCss

  Youtube.apiReadyQueue = [];

  // initialize plugin if page ready
  // -------------------------------------------------------------------------
  var dependencies_met_page_ready = setInterval (() => {
    var pageState      = $('#content').css("display");
    var pageVisible    = (pageState === 'block') ? true : false;
//  var j1CoreFinished = (j1.getState() === 'finished') ? true : false;

//  if (j1CoreFinished && pageVisible) {
    if (pageVisible) {      
      startTimeModule = Date.now();

      isDev && logger.debug('\n' + 'initializing plugin: started');
      isDev && logger.debug('\n' + 'version of videoJS detected: ' + videojs.VERSION);

      loadScript('//www.youtube.com/iframe_api', apiLoaded);
      injectCss();

      clearInterval(dependencies_met_page_ready);
    } // END pageVisible
  }, 10); // END dependencies_met_page_ready

  // Check VJS versions to register Youtube TECH
  if (typeof videojs.registerTech !== 'undefined') {
    videojs.registerTech('Youtube', Youtube);
  } else {
    console.error('\n' + 'invalid version of videoJS detected: ' + videojs.VERSION);
  }

}));