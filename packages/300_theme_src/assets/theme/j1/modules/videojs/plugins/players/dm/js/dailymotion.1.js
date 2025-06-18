/*
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/modules/videojs/js/plugins/players/dm/dailymotion.js
 # Provides Dailymotion Playback Technology (Tech) for Video.js V8 and newer
 #
 # Product/Info:
 # http://jekyll.one
 #
 # Copyright (C) 2020 John Law
 # Copyright (C) 2023-2025 Juergen Adams
 #
 # videojs-dailymotion is licensed under MIT License.
 # See: https://github.com/lawchihon/videojs-dailymotion/blob/master/LICENSE
 # J1 Theme is licensed under MIT License.
 # See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 # -----------------------------------------------------------------------------
*/

/* Version 1.0, updated version for videoJS V8 + J1 Template */

/*global define, DM*/
(function (root, factory) {
  if (typeof exports==='object' && typeof module!=='undefined') {
    var videojs = require('video.js');
    module.exports = factory(videojs.default || videojs);
  } else if (typeof define === 'function' && define.amd) {
    define(['videojs'], function(videojs){
      return (root.Dailymotion = factory(videojs));
    });
  } else {
    root.Dailymotion = factory(root.videojs);
  }
}(this, function(videojs) {
 'use strict';
 
  var _isOnMobile = videojs.browser.IS_IOS || videojs.browser.IS_ANDROID;
  var Tech        = videojs.getTech('Tech');
  var isDev       = false;

  var startTimeModule;
  var endTimeModule;

  class Dailymotion extends Tech {

    constructor(options, ready) {
      super(options, ready);

      this.setPoster(options.poster);
      this.setSrc(this.options_.source, true);

      // set the vjs-dailymotion class to the player's parent node,
      // when is not set, wait a tick
      var vm = this;
      setTimeout(function() {
        if (this.el_) {
          this.el_.parentNode.className += ' vjs-dailymotion';

          if (_isOnMobile) {
            this.el_.parentNode.className += ' vjs-dailymotion-mobile';
          }

          if (Dailymotion.isSdkReady) {
            vm.initDMPlayer();
          } else {
            Dailymotion.sdkReadyQueue.push(vm);
          }
        }
      }.bind(this));
    } // END Constructor

    getPlayerParams() {
      var playerParams = {
        autoplay: false,
        mute: false,
        controls: false,
        'queue-autoplay-next': false,
        'queue-enable': false
      };

      // Let the user set any Dailymotion parameter
      // https://developer.dailymotion.com/player/#player-parameters
      // To use Dailymotion controls, you must use dmControls instead
      var params = [
        'api', 'autoplay', 'autoplay-mute', 'id', 'mute', 'origin',
        'quality', 'queue-autoplay-next', 'queue-enable', 'sharing-enable',
        'start', 'subtitles-default', 'syndication', 'ui-highlight',
        'ui-logo','ui-start-screen-info', 'ui-theme', 'apimode',
        'playlist'
      ];
      var options = this.options_;

      params.forEach((param) => {
        if (typeof options[param] === 'undefined') {
          return;
        }
        playerParams[param] = options[param];
      });

      if (typeof this.options_.dmControls !== 'undefined') {
        playerParams.controls = this.options_.dmControls;
      }

      // Overwriting playlist if it is included in url
      if (this.url && typeof this.url.playlist !== 'undefined') {
        playerParams.playlist = this.url.playlist;
      }

      // Allow undocumented options to be passed along via customVars
      if (typeof this.options_.customVars !== 'undefined') {
        var customVars = this.options_.customVars;
        Object.keys(customVars).forEach((key) => {
          playerParams[key] = customVars[key];
        });
      }

      return playerParams;
    } // END getPlayerParams

    getPlayerConfig() {
      var playerConfig = {
        width:    '100%',
        height:   '100%',
        params:   this.getPlayerParams()
      };

      if (this.url && typeof this.url.video !== 'undefined') {
        playerConfig.video = this.url.video;
      } else if (typeof this.options_.video !== 'undefined') {
        playerConfig.video = this.options_.video;
      }

      return playerConfig;
    } // END getPlayerConfig

    initDMPlayer() {
      if (this.dmPlayer) {

        // jadams, 2024-06-26:
        this.dmPlayer.dmPlayerState = {
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

        return;
      }

      this.dmPlayer = new DM.player(
        document.getElementById(this.options_.techId),
        this.getPlayerConfig()
      );
      var vm = this;
      this.isApiReady = false;
      this.dmPlayer.addEventListener('apiready', () => {
        vm.triggerReady();
        vm.isApiReady = true;
      });
      this.dmPlayer.addEventListener('durationchange', () => {
        vm.trigger('durationchange');
      });
      this.dmPlayer.addEventListener('end', () => {
        vm.trigger('ended');
      });
      this.dmPlayer.addEventListener('error', () => {
        vm.trigger('error');
      });
      this.dmPlayer.addEventListener('loadedmetadata', () => {
        vm.trigger('loadeddata');
        vm.trigger('loadedmetadata');
      });
      this.dmPlayer.addEventListener('pause', ()  =>{
        vm.trigger('pause');
      });
      this.dmPlayer.addEventListener('play', () => {
        // jadams, 2024-06-26:
        // this.dmPlayer.dmPlayerState.playing = true;

        vm.trigger('loadStart');
        vm.trigger('play');
        vm.trigger('playing');
        vm.trigger('waiting');
      });
      this.dmPlayer.addEventListener('playback_ready', () => {
        vm.trigger('loadeddata');
      });
      this.dmPlayer.addEventListener('timeupdate', () => {
        vm.trigger('timeupdate');
      });
      this.dmPlayer.addEventListener('volumechange', () => {
        vm.trigger('volumechange');
      });

      this.triggerReady();
      isDev && logger.debug('\n' + 'created ' + this.name_ + ' player on ID: ' + vm.dmPlayer.id);
    } // END initDMPlayer

    autoplay(autoplay) {
      if (typeof autoplay !== 'undefined') {
        return this.setAutoplay(autoplay);
      }

      return this.options_.autoplay;
    } // END autoplay

    setAutoplay(val) {
      return this.options_.autoplay = val;
    } // END setAutoplay

    buffered() {
      if(!this.dmPlayer || !this.dmPlayer.bufferedTime) {
        return videojs.time.createTimeRanges();
      }

      return videojs.time.createTimeRanges(0, this.dmPlayer.bufferedTime);
    } // END buffered

    createEl() {
      var div = document.createElement('div');
      div.setAttribute('id', this.options_.techId);
      div.setAttribute('style', 'cursor: default; width:100%; height:100%; top:0; left:0; position:absolute');
      div.setAttribute('class', 'vjs-tech');

      var divWrapper = document.createElement('div');
      divWrapper.appendChild(div);

      return divWrapper;
    } // END createEl

    currentSrc() {
      return this.source && this.source.src;
    } // END currentSrc

    currentTime(seconds) {
      if (typeof seconds !== 'undefined') {
        return this.setCurrentTime(seconds);
      }

      return this.dmPlayer && this.dmPlayer.currentTime;
    } // END currentTime

    setCurrentTime(seconds) {
      if (!this.dmPlayer || !this.dmPlayer.seek) {
        return;
      }

      return this.dmPlayer.seek(seconds);
    } // END setCurrentTime

    dispose() {
      if (DM && DM.destroy) {
        //Destroy the Dailymotion Player
        DM.destroy(this.options_.techId);
      } else {
        //Dailymotion API hasn't finished loading or the player is already disposed
        var index = Dailymotion.sdkReadyQueue.indexOf(this);
        if (index !== -1) {
          Dailymotion.sdkReadyQueue.splice(index, 1);
        }
      }
      this.dmPlayer = undefined;

      this.el_.parentNode.className = this.el_.parentNode.className
        .replace(' vjs-dailymotion', '')
        .replace(' vjs-dailymotion-mobile', '');
      this.el_.parentNode.removeChild(this.el_);

      // Needs to be called after the Dailymotion player is destroyed,
      // otherwise there will be a undefined reference exception
      Tech.prototype.dispose.call(this);
    } // END dispose

    duration(seconds) {
      if (typeof seconds !== 'undefined') {
        return this.setDuration(seconds);
      }

      return this.dmPlayer ? this.dmPlayer.duration : 0;
    } // END duration

    setDuration(seconds) {
      if (!this.dmPlayer || !this.dmPlayer.seek) {
        return;
      }

      return this.dmPlayer.seek(seconds);
    } // END setDuration

    ended() {
      return this.dmPlayer && this.dmPlayer.ended;
    } // END ended

    enterFullWindow() {
      if (!this.dmPlayer || !this.dmPlayer.setFullscreen) {
        return;
      }

      return this.dmPlayer.setFullscreen(true);
    } // END enterFullWindow

    error() {
      return this.dmPlayer && this.dmPlayer.error;
    } // END error

    exitFullscreen() {
      if (!this.dmPlayer || !this.dmPlayer.setFullscreen) {
        return;
      }

      return this.dmPlayer.setFullscreen(false);
    } // END exitFullscreen

    isFullscreen() {
      return this.dmPlayer && this.dmPlayer.fullscreen;
    } // END isFullscreen

    // not supported by Dailymotion
    language() {
      return undefined;
    } // END language

    // not supported by Dailymotion
    languages() {
      return undefined;
    } // END languages

    load() {
      if (!this.dmPlayer || !this.dmPlayer.load) {
        return;
      }

      return this.dmPlayer.load(this.getPlayerConfig());
    } // END load

    // not supported by Dailymotion
    loop() {
      return undefined;
    } // END loop

    muted(muted) {
      if (typeof muted !== undefined) {
        return this.setMuted(muted);
      }

      return this.dmPlayer && this.dmPlayer.mute;
    } // END muted

    setMuted(mute) {
      if (typeof mute === 'undefined' || !this.dmPlayer || !this.dmPlayer.setMuted) {
        return;
      }

      if (mute) {
        this.volumeBeforeMute = this.volume();
        this.setVolume(0);
      } else {
        this.setVolume(this.volumeBeforeMute);
      }

      this.dmPlayer.setMuted(mute);
    } // END setMuted

    networkState() {
      if (!this.dmPlayer || this.dmPlayer.error) {
        return 0; //NETWORK_EMPTY
      }

      if (this.dmPlayer.seeking) {
        return 2; //NETWORK_LOADING
      }
    } // END networkState

    pause() {
      if (!this.dmPlayer || !this.dmPlayer.pause) {
        return;
      }

      return this.dmPlayer.pause();
    } // END pause

    paused() {
      return this.dmPlayer && this.dmPlayer.paused;
    } // END paused

    play() {
      if (!this.isApiReady || !this.dmPlayer || !this.dmPlayer.play) {
        return;
      }

      this.trigger('loadStart');
      this.trigger('waiting');
      return this.dmPlayer.play();
    } // END play

    // not supported by Dailymotion
    playbackRate() {
      return 1;
    } // END playbackRate

    // not supported by Dailymotion
    poster() {
      return undefined;
    } // END poster

    // not supported by Dailymotion
    preload() {
      return undefined;
    } // END preload

    readyState() {
      if (!this.dmPlayer || this.dmPlayer.error) {
        return 0; //NETWORK_EMPTY
      }

      if (this.dmPlayer.seeking) {
        return 1; //HAVE_METADATA
      }
      return 4; //HAVE_ENOUGH_DATA
    } // END readyState

    remainingTime() {
      return this.dmPlayer && (this.dmPlayer.duration - this.dmPlayer.currentTime);
    } // END remainingTime

    requestFullscreen() {
      return this.enterFullWindow();
    } // END requestFullscreen

    enterFullScreen() {
      return this.enterFullWindow();
    } // END enterFullScreen

    reset() {
      this.load();
    } // END reset

    seekable() {
      if(!this.ytPlayer) {
        return videojs.time.createTimeRanges();
      }

      return videojs.time.createTimeRanges(0, this.ytPlayer.getDuration());
    } // END seekable

    seeking() {
      return this.dmPlayer && this.dmPlayer.seeking;
    } // END seeking

    src(source) {
      if (typeof source !== 'undefined') {
        return this.setSrc(source);
      }

      return this.source;
    } // END src

    setSrc(source) {
      if (typeof source === 'undefined') {
        return;
      }

      this.source = source;
      this.url = Dailymotion.parseUrl(source.src || source);

      // Load the video if sdk is ready
      if (Dailymotion.isSdkReady) {
        this.load();
      }
      return this.source;
    } // END setSrc

    supportsFullScreen() {
      return true;
    } // END supportsFullScreen

    volume() {
      return this.dmPlayer ? this.dmPlayer.volume : 1;
    } // END volume

    // if (DMPlayerState.playing === true) {
    //   setVolume(percentAsDecimal) {
    //     if (!this.dmPlayer || !this.dmPlayer.setMuted || !this.dmPlayer.setVolume) {
    //       return;
    //     }
    //
    //     this.dmPlayer.setMuted(false);
    //     this.dmPlayer.setVolume(percentAsDecimal);
    //   } // END setVolume
    // }

    setVolume(percentAsDecimal) {
      if (!this.dmPlayer || !this.dmPlayer.setMuted || !this.dmPlayer.setVolume) {
        return;
      }

//    jadams, 2024-06-26:
//    if (this.dmPlayer.dmPlayerState.playing === true) {
      if (this.dmPlayer.apiReady) {
        this.dmPlayer.setMuted(false);
        this.dmPlayer.setVolume(percentAsDecimal);
      }

    } // END setVolume

  } // END class Dailymotion

  Dailymotion.isSupported = () => {
    return true;
  };

  Dailymotion.canPlaySource = (event) => {
    return Dailymotion.canPlayType(event.type);
  };

  Dailymotion.canPlayType = (event) => {
    return (event === 'video/dailymotion');
  };

  Dailymotion.parseUrl = (url) => {
    var result = {};

    var regex = /video\/[^?|^\/]*/;
    var match = url.match(regex);

    if (match && match[0]) {
      result.video = match[0].replace('video/', '');
    }

    var regPlaylist = /playlist(=|\/)[^&]*/;
    match = url.match(regPlaylist);

    if(match && match[0]) {
      result.playlist = match[0].replace(/playlist(=|\/)/, '');
    }

    return result;
  };

  function apiLoaded() {
    isDev && logger.debug('\n' + 'API loaded successfully');

    Dailymotion.isSdkReady = true;

    for (var i = 0; i < Dailymotion.sdkReadyQueue.length; ++i) {
      Dailymotion.sdkReadyQueue[i].initDMPlayer();
    }
    isDev && logger.debug('\n' + 'created all players from queue: #' + i);

    endTimeModule = Date.now();
    isDev && logger.debug('\n' + 'initializing plugin: finished');
    isDev && logger.debug('\n' + 'plugin initializing time: ' + (endTimeModule-startTimeModule) + 'ms');
  } // END apiLoaded

  function loadScript(src, callback) {
    var loaded         = false;
    var tag            = document.createElement('script');
    var firstScriptTag = document.getElementsByTagName('script')[0];

    if (!firstScriptTag) {
      // when loaded in jest without jsdom setup it doesn't get any element.
      // In jest it doesn't really make sense to do anything, because no one is watching dailymotion in jest
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
      if (!loaded && (this.readyState === 'complete' || this.readyState === 'loaded')) {
        loaded = true;
        callback();
      }
    };

    tag.src = src;
  } // END loadScript

  function injectCss() {

    const css = `
      .vjs-dailymotion .vjs-iframe-blocker { display: none; }
      .vjs-dailymotion.vjs-user-inactive .vjs-iframe-blocker { display: block; }
      .vjs-dailymotion .vjs-poster { background-size: cover; }
      .vjs-dailymotion-mobile .vjs-big-play-button { display: none; }
    `;

    var head = document.head || document.getElementsByTagName('head')[0];

    var style = document.createElement('style');
    style.setAttribute('type', 'text/css');

    if (style.styleSheet){
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(document.createTextNode(css));
    }

    head.appendChild(style);
    isDev && logger.debug('\n' + 'added additional CSS styles');
  } // END injectCss

  // Include the version number
  Dailymotion.VERSION = '1.0.0';

  Dailymotion.sdkReadyQueue = [];

  // initialize plugin if page ready
  // -------------------------------------------------------------------------
  var dependencies_met_page_ready = setInterval (() => {
    var pageState      = $('#content').css("display");
    var pageVisible    = (pageState === 'block') ? true : false;
    // var j1CoreFinished = (j1.getState() === 'finished') ? true : false;

    // if (j1CoreFinished && pageVisible) {
    if (pageVisible) {    
      var logger  = log4javascript.getLogger('videoJS.plugin.dailymotion');
      // var isDev   = false;

      // try {
      //   var isDev = (j1.env === "development" || j1.env === "dev") ? true : false;
      // } catch (error) {
      //   var isDev = false;
      // }

      isDev && logger.debug('\n' + 'version of videoJS detected: ' + videojs.VERSION);

//    loadScript('/assets/theme/j1/modules/videojs/plugins/players/dm/api/js/dailymotion.sdk.min.js', apiLoaded);      
      loadScript('../api/js/dailymotion.sdk.min.js', apiLoaded);      
//    loadScript('//api.dmcdn.net/all.js', apiLoaded);
      injectCss();

      clearInterval(dependencies_met_page_ready);
    } // END pageVisible
  }, 10); // END dependencies_met_page_ready

  // Older versions of VJS5 doesn't have the registerTech function
  if (typeof videojs.registerTech !== 'undefined') {
    videojs.registerTech('Dailymotion', Dailymotion);
  } else {
    videojs.registerComponent('Dailymotion', Dailymotion);
  }

}));
