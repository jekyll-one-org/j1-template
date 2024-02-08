/*
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/modules/videojs/js/wt/wistia.js
 # Provides Wistia Playback Technology for Video.js V8 and newer
 # See: https://github.com/edly-io/videojs-wistia
 #
 #  Product/Info:
 #  http://jekyll.one
 #
  # Copyright (C) 2020-2021 Zia Fazal
 #  Copyright (C) 2023, 2024 Juergen Adams
 #
 #  J1 Theme is licensed under MIT License.
 #  See: https://github.com/jekyll-one/J1 Theme/blob/master/LICENSE
 #  See: https://wistia.com/support/developers/player-api
 # -----------------------------------------------------------------------------
*/
/* The MIT License (MIT)

Copyright (c) 2020-2021 Zia Fazal <zia.fazal@edly.io>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE. */

/*global define, Wistia*/
(function (root, factory) {
    if(typeof exports==='object' && typeof module!=='undefined') {
      var videojs = require('video.js');
      module.exports = factory(videojs.default || videojs);
    } else if(typeof define === 'function' && define.amd) {
      define(['videojs'], function(videojs){
        return (root.Wistia = factory(videojs));
      });
    } else {
      root.Wistia = factory(root.videojs);
    }
  }(this, function(videojs) {
    'use strict';

    var _isOnMobile = videojs.browser.IS_IOS || videojs.browser.IS_NATIVE_ANDROID;
    var Tech = videojs.getTech('Tech');

    class Wistia extends Tech {

      constructor(options, ready) {
        super(options, ready);

        this.setPoster(options.poster);
        this.setSrc(this.options_.source, true);

        this.setTimeout(function() {
          if (this.el_) {
            this.el_.parentNode.className += ' vjs-wistia';

            if (_isOnMobile) {
              this.el_.parentNode.className += ' vjs-wistia-mobile';
            }

            if (Wistia.isApiReady) {
              this.initWistiaPlayer();
            } else {
              Wistia.apiReadyQueue.push(this);
            }
          }
        }.bind(this));
      }

      dispose() {
        if (this.wistiaPlayer) {
          //Dispose of the Wistia Player
          if (this.wistiaPlayer) {
            this.wistiaPlayer.pause();
            this.wistiaPlayer.remove();
          }
        } else {
          //Wistia API hasn't finished loading or the player is already disposed
          var index = Wistia.apiReadyQueue.indexOf(this);
          if (index !== -1) {
            Wistia.apiReadyQueue.splice(index, 1);
          }
        }
        this.wistiaPlayer = null;

        this.el_.parentNode.className = this.el_.parentNode.className
          .replace(' vjs-wistia', '')
          .replace(' vjs-wistia-mobile', '');
        this.el_.parentNode.removeChild(this.el_);
      }

      createEl() {
        var div = document.createElement('div');
        div.setAttribute('id', this.options_.techId);
        div.setAttribute('style', 'width:100%;height:100%;top:0;left:0;position:absolute');
        div.setAttribute('class', 'vjs-tech ' + this.options_.playback_css_class);

        var divWrapper = document.createElement('div');
        divWrapper.appendChild(div);

        return divWrapper;
      }

      initWistiaPlayer() {
        var playerConfig = {
          controlsVisibleOnLoad: false,
          chromeless: true,
          playbar: false,
          playButton: false,
          settingsControl: false,
          smallPlayButton: false,
          volumeControl: false,
          videoFoam: false,
          fullscreenButton: false,
          preload: true,
          doNotTrack: true,
          autoPlay: false
        };

        if (typeof this.options_.videoFoam !== 'undefined') {
          playerConfig.videoFoam = this.options_.videoFoam;
        }

        if (typeof this.options_.source !== 'undefined') {
          this.videoId = this.options_.source.src;
        }

        if (typeof this.options_.autoplay !== 'undefined') {
          playerConfig.autoPlay = this.options_.autoplay;
          playerConfig.muted = this.options_.autoplay;
        }

        var this_ = this;
        window._wq = window._wq || [];
        _wq.push({
          id: this.videoId,
          options: playerConfig,
          onReady: function(video) {
            this_.wistiaPlayer = video;
            this_.onPlayerReady();
            this_.wistiaPlayer.bind('end', this_.onPlaybackEnded.bind(this_));
          }
        });
      }

      onPlayerReady() {
        if (this.options_.muted) {
          this.wistiaPlayer.mute();
        }

        this.playerReady_ = true;
        this.triggerReady();

        if (this.playOnReady) {
          this.play();
        }
      }

      onPlaybackEnded() {
        this.trigger('ended');
      }

      src(src) {
        if (src) {
          this.setSrc({ src: src });
        }

        return this.source;
      }

      setSrc(source) {
        if (!source || !source.src) {
          return;
        }

        delete this.errorName;
        this.source = source;

        if (this.options_.autoplay && !_isOnMobile) {
          if (this.isReady_) {
            this.play();
          } else {
            this.playOnReady = true;
          }
        }
      }

      autoplay() {
        return this.options_.autoplay;
      }

      setAutoplay(val) {
        this.options_.autoplay = val;
      }

      loop() {
        return this.options_.loop;
      }

      setLoop(val) {
        this.options_.loop = val;
      }

      play() {
        if (!this.videoId) {
          return;
        }

        if (this.isReady_) {
          this.wistiaPlayer.play();
          this.trigger('play');
        } else {
          this.trigger('waiting');
          this.playOnReady = true;
        }
      }

      pause() {
        if (this.wistiaPlayer) {
          this.wistiaPlayer.pause();
          this.trigger('pause');
        }
      }

      paused() {
        if (this.wistiaPlayer) {
          return this.wistiaPlayer.state() === 'paused' || this.wistiaPlayer.state() === 'ended';
        }
      }

      currentTime() {
        if (this.wistiaPlayer) {
          return this.wistiaPlayer.time();
        }
      }

      setCurrentTime(seconds) {
        if (this.wistiaPlayer) {
          this.wistiaPlayer.time(seconds);
        }
      }

      duration() {
        if (this.wistiaPlayer) {
          return this.wistiaPlayer.duration();
        }
      }

      currentSrc() {
        return this.source && this.source.src;
      }

      ended() {
        if (this.wistiaPlayer) {
          return this.wistiaPlayer.state() === 'ended';
        }
      }

      volume() {
        if (this.wistiaPlayer) {
          return this.wistiaPlayer.volume();
        }
      }

      setVolume(percentAsDecimal) {
        if (this.wistiaPlayer) {
          this.wistiaPlayer.volume(percentAsDecimal);
          this.trigger('volumechange');
        }
      }

      muted() {
        if (this.wistiaPlayer) {
          return this.wistiaPlayer.isMuted();
        }
      }

      setMuted(mute) {
        if (this.wistiaPlayer) {
          if (mute === true) {
            this.wistiaPlayer.mute();
          }
          else {
            this.wistiaPlayer.unmute();
          }
          this.trigger('volumechange');
        }
      }

      supportsFullScreen() {
        return true;
      }

    }

    Wistia.isSupported = function() {
      return true;
    };

    Wistia.canPlaySource = function(e) {
      return Wistia.canPlayType(e.type);
    };

    Wistia.canPlayType = function(e) {
      return (e === 'video/wistia');
    };

    function apiLoaded() {
      Wistia.isApiReady = true;
      for (var i = 0; i < Wistia.apiReadyQueue.length; ++i) {
        Wistia.apiReadyQueue[i].initWistiaPlayer();
      }
    }

    function loadScript(src, callback) {
      var loaded = false;
      var tag = document.createElement('script');
      var firstScriptTag = document.getElementsByTagName('script')[0];
      if (!firstScriptTag) {
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
      var css =
//      '.vjs-theme-uno .vjs-big-play-button { display: block }' +
        '.vjs-wistia-mobile .vjs-big-play-button { display: none; }';

      var head = document.head || document.getElementsByTagName('head')[0];

      var style = document.createElement('style');
      style.type = 'text/css';

      if (style.styleSheet){
        style.styleSheet.cssText = css;
      } else {
        style.appendChild(document.createTextNode(css));
      }

      head.appendChild(style);
    }

    Wistia.apiReadyQueue = [];

    if (typeof document !== 'undefined'){
      loadScript('//fast.wistia.com/assets/external/E-v1.js', apiLoaded);
      injectCss();
    }

    // Older versions of VJS5 doesn't have the registerTech function
    if (typeof videojs.registerTech !== 'undefined') {
      videojs.registerTech('Wistia', Wistia);
    } else {
      videojs.registerComponent('Wistia', Wistia);
    }
  }));
