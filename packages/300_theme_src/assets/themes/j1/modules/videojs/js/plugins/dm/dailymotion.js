/*
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/modules/videojs/js/dailymotion/dailymotion.js
 # Provides Dailymotion Playback Technology for Video.js V8 and newer
 #
 #  Product/Info:
 #  http://jekyll.one
 #
  # Copyright (C) John Law
 #  Copyright (C) 2023, 2024 Juergen Adams
 #
 #  J1 Theme is licensed under MIT License.
 #  See: https://github.com/jekyll-one/J1 Theme/blob/master/LICENSE
 # -----------------------------------------------------------------------------
*/

/*
  Copyright (c) John Law <chihonlaw@gmail.com>

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all
  copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/

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
  var Tech = videojs.getTech('Tech');

  class Dailymotion extends Tech {

    constructor(options, ready) {
      super(options, ready);

      this.setPoster(options.poster);
      this.setSrc(this.options_.source, true);

      // Set the vjs-dailymotion class to the player
      // Parent is not set yet so we have to wait a tick
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
    }

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

      var params = ['api', 'autoplay', 'autoplay-mute', 'id', 'mute', 'origin', 'quality', 'queue-autoplay-next',
      'queue-enable', 'sharing-enable', 'start', 'subtitles-default', 'syndication', 'ui-highlight', 'ui-logo',
      'ui-start-screen-info', 'ui-theme', 'apimode', 'playlist'];

      var options = this.options_;
      params.forEach(function(param) {
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
        Object.keys(customVars).forEach(function(key) {
          playerParams[key] = customVars[key];
        });
      }

      return playerParams;
    }

    getPlayerConfig() {
      var playerConfig = {
        width: '100%',
        height: '100%',
        params: this.getPlayerParams()
      };

      if (this.url && typeof this.url.video !== 'undefined') {
        playerConfig.video = this.url.video;
      } else if (typeof this.options_.video !== 'undefined') {
        playerConfig.video = this.options_.video;
      }

      return playerConfig;
    }

    initDMPlayer() {
      if (this.dmPlayer) {
        return;
      }
      this.dmPlayer = new DM.player(
        document.getElementById(this.options_.techId),
        this.getPlayerConfig()
      );
      var vm = this;
      this.isApiReady = false;
      this.dmPlayer.addEventListener('apiready', function() {
        vm.triggerReady();
        vm.isApiReady = true;
      });
      this.dmPlayer.addEventListener('durationchange', function() {
        vm.trigger('durationchange');
      });
      this.dmPlayer.addEventListener('end', function() {
        vm.trigger('ended');
      });
      this.dmPlayer.addEventListener('error', function() {
        vm.trigger('error');
      });
      this.dmPlayer.addEventListener('loadedmetadata', function() {
        vm.trigger('loadeddata');
        vm.trigger('loadedmetadata');
      });
      this.dmPlayer.addEventListener('pause', function() {
        vm.trigger('pause');
      });
      this.dmPlayer.addEventListener('play', function() {
        vm.trigger('loadStart');
        vm.trigger('play');
        vm.trigger('playing');
        vm.trigger('waiting');
      });
      this.dmPlayer.addEventListener('playback_ready', function() {
        vm.trigger('loadeddata');
      });
      this.dmPlayer.addEventListener('timeupdate', function() {
        vm.trigger('timeupdate');
      });
      this.dmPlayer.addEventListener('volumechange', function() {
        vm.trigger('volumechange');
      });
    }

    autoplay(autoplay) {
      if (typeof autoplay !== 'undefined') {
        return this.setAutoplay(autoplay);
      }

      return this.options_.autoplay;
    }

    setAutoplay(val) {
      return this.options_.autoplay = val;
    }

    buffered() {
      if(!this.dmPlayer || !this.dmPlayer.bufferedTime) {
        return videojs.time.createTimeRanges();
      }

      return videojs.time.createTimeRanges(0, this.dmPlayer.bufferedTime);
    }

    createEl() {
      var div = document.createElement('div');
      div.setAttribute('id', this.options_.techId);
      div.setAttribute('style', 'width:100%;height:100%;top:0;left:0;position:absolute');
      div.setAttribute('class', 'vjs-tech');

      var divWrapper = document.createElement('div');
      divWrapper.appendChild(div);

      if (!_isOnMobile && !this.options_.dmControls) {

        // var divBlocker = document.createElement('div');
        // divBlocker.setAttribute('class', 'vjs-iframe-blocker');
        // divBlocker.setAttribute('style', 'position:absolute;top:0;left:0;width:100%;height:100%');
        //
        // // In case the blocker is still there and we want to pause
        // divBlocker.onclick = function() {
        //   this.pause();
        // }.bind(this);
        //
        // divWrapper.appendChild(divBlocker);
      }

      return divWrapper;
    }

    currentSrc() {
      return this.source && this.source.src;
    }

    currentTime(seconds) {
      if (typeof seconds !== 'undefined') {
        return this.setCurrentTime(seconds);
      }
      return this.dmPlayer && this.dmPlayer.currentTime;
    }

    setCurrentTime(seconds) {
      if (!this.dmPlayer || !this.dmPlayer.seek) {
        return;
      }

      return this.dmPlayer.seek(seconds);
    }

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
    }

    duration(seconds) {
      if (typeof seconds !== 'undefined') {
        return this.setDuration(seconds);
      }
      return this.dmPlayer ? this.dmPlayer.duration : 0;
    }

    setDuration(seconds) {
      if (!this.dmPlayer || !this.dmPlayer.seek) {
        return;
      }
      return this.dmPlayer.seek(seconds);
    }

    ended() {
      return this.dmPlayer && this.dmPlayer.ended;
    }

    enterFullWindow() {
      if (!this.dmPlayer || !this.dmPlayer.setFullscreen) {
        return;
      }
      return this.dmPlayer.setFullscreen(true);
    }

    error() {
      return this.dmPlayer && this.dmPlayer.error;
    }

    exitFullscreen() {
      if (!this.dmPlayer || !this.dmPlayer.setFullscreen) {
        return;
      }
      return this.dmPlayer.setFullscreen(false);
    }

    isFullscreen() {
      return this.dmPlayer && this.dmPlayer.fullscreen;
    }

    // Not supported by Dailymotion
    language() {
      return undefined;
    }

    // Not supported by Dailymotion
    languages() {
      return undefined;
    }

    load() {
      if (!this.dmPlayer || !this.dmPlayer.load) {
        return;
      }
      return this.dmPlayer.load(this.getPlayerConfig());
    }

    // Not supported by Dailymotion
    loop() {
      return undefined;
    }

    muted(muted) {
      if (typeof muted !== undefined) {
        return this.setMuted(muted);
      }
      return this.dmPlayer && this.dmPlayer.mute;
    }

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
      // var vm = this;
      // setTimeout( function(){
      //   vm.trigger('volumechange');
      // }, 50);
    }

    networkState() {
      if (!this.dmPlayer || this.dmPlayer.error) {
        return 0; //NETWORK_EMPTY
      }

      if (this.dmPlayer.seeking) {
        return 2; //NETWORK_LOADING
      }
    }

    pause() {
      if (!this.dmPlayer || !this.dmPlayer.pause) {
        return;
      }

      return this.dmPlayer.pause();
    }

    paused() {
      return this.dmPlayer && this.dmPlayer.paused;
    }

    play() {
      if (!this.isApiReady || !this.dmPlayer || !this.dmPlayer.play) {
        return;
      }

      this.trigger('loadStart');
      this.trigger('waiting');
      return this.dmPlayer.play();
    }

    // Playback rate is not support by Dailymotion
    playbackRate() {
      return 1;
    }

    // Not supported by Dailymotion
    poster() {
      return undefined;
    }

    // Not supported by Dailymotion
    preload() {
      return undefined;
    }

    // TODO: Confirm if it can be more detail
    readyState() {
      if (!this.dmPlayer || this.dmPlayer.error) {
        return 0; //NETWORK_EMPTY
      }

      if (this.dmPlayer.seeking) {
        return 1; //HAVE_METADATA
      }
      return 4; //HAVE_ENOUGH_DATA
    }

    remainingTime() {
      return this.dmPlayer && (this.dmPlayer.duration - this.dmPlayer.currentTime);
    }

    requestFullscreen() {
      return this.enterFullWindow();
    }

    enterFullScreen() {
      return this.enterFullWindow();
    }

    reset() {
      this.load();
    }

    // jadams, 2023-10-01: videojs.createTimeRange() deprecated in VideoJS 9
    //
    seekable() {
      if(!this.ytPlayer) {
        // return videojs.createTimeRange();
        return videojs.time.createTimeRanges();
      }
      // return videojs.createTimeRange(0, this.ytPlayer.getDuration());
      return videojs.time.createTimeRanges(0, this.ytPlayer.getDuration());
    }

    seeking() {
      return this.dmPlayer && this.dmPlayer.seeking;
    }

    src(source) {
      if (typeof source !== 'undefined') {
        return this.setSrc(source);
      }

      return this.source;
    }

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
    }

    supportsFullScreen() {
      return true;
    }

    volume() {
      return this.dmPlayer ? this.dmPlayer.volume : 1;
    }

    setVolume(percentAsDecimal) {
      if (!this.dmPlayer || !this.dmPlayer.setMuted || !this.dmPlayer.setVolume) {
        return;
      }

      this.dmPlayer.setMuted(false);
      this.dmPlayer.setVolume(percentAsDecimal);
    }

  }

  Dailymotion.isSupported = function() {
    return true;
  };

  Dailymotion.canPlaySource = function(e) {
    return Dailymotion.canPlayType(e.type);
  };

  Dailymotion.canPlayType = function(e) {
    return (e === 'video/dailymotion');
  };

  Dailymotion.parseUrl = function(url) {
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
    Dailymotion.isSdkReady = true;

    for (var i = 0; i < Dailymotion.sdkReadyQueue.length; ++i) {
      Dailymotion.sdkReadyQueue[i].initDMPlayer();
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

  function injectCss() {
    var css = // iframe blocker to catch mouse events
      '.vjs-dailymotion .vjs-iframe-blocker { display: none; }' +
      '.vjs-dailymotion.vjs-user-inactive .vjs-iframe-blocker { display: block; }' +
      '.vjs-dailymotion .vjs-poster { background-size: cover; }' +
      '.vjs-dailymotion-mobile .vjs-big-play-button { display: none; }';

    var head = document.head || document.getElementsByTagName('head')[0];

    var style = document.createElement('style');
    style.setAttribute('type', 'text/css');

    if (style.styleSheet){
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(document.createTextNode(css));
    }

    head.appendChild(style);
  }

  // Include the version number
  Dailymotion.VERSION = '1.0.0';

  Dailymotion.sdkReadyQueue = [];

  if (typeof document !== 'undefined'){
//  loadScript('/assets/themes/j1/modules/videojs/js/plugins/dm/api/dailymotion.min.js', apiLoaded);
//  loadScript('https://geo.dailymotion.com/player.js', apiLoaded);
//  loadScript('//static1.dmcdn.net/playerv5/dmp.infopack.52dea8cf991168130bab.js', apiLoaded);
//  loadScript('https://api.dmcdn.net/all.js', apiLoaded);
    loadScript('//api.dmcdn.net/all.js', apiLoaded);
    injectCss();
  }

  // Older versions of VJS5 doesn't have the registerTech function
  if (typeof videojs.registerTech !== 'undefined') {
    videojs.registerTech('Dailymotion', Dailymotion);
  } else {
    videojs.registerComponent('Dailymotion', Dailymotion);
  }

}));
