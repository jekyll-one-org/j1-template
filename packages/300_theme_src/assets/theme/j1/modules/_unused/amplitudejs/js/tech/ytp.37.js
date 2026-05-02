---
regenerate: true
---

{%- capture cache -%}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/modules/amplitudejs/js/plugins/tech/ytp.js (37)
 # AmplitudeJS V5 Tech for J1 Template
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2026 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 # -----------------------------------------------------------------------------
 # Test data:
 #  {{ liquid_var | debug }}
 #  amplitude_options:  {{ amplitude_options | debug }}
 # -----------------------------------------------------------------------------
{% endcomment %}

{% comment %} Liquid procedures
-------------------------------------------------------------------------------- {% endcomment %}

{% comment %} Set global settings
-------------------------------------------------------------------------------- {% endcomment %}
{% assign environment         = site.environment %}
{% assign asset_path          = "/assets/theme/j1" %}

{% comment %} Process YML config data
================================================================================ {% endcomment %}

{% comment %} Set config files
-------------------------------------------------------------------------------- {% endcomment %}
{% assign template_config     = site.data.j1_config %}
{% assign blocks              = site.data.blocks %}
{% assign modules             = site.data.modules %}

{% comment %} Set config data (settings only)
-------------------------------------------------------------------------------- {% endcomment %}
{% assign amplitude_defaults  = modules.defaults.amplitude.defaults %}
{% assign amplitude_players   = modules.amplitude_app.settings %}
{% assign amplitude_playlists = modules.amplitude_playlists.settings %}

{% comment %} Set config options (settings only)
-------------------------------------------------------------------------------- {% endcomment %}
{% assign amplitude_options   = amplitude_defaults | merge: amplitude_players %}
{% assign amplitude_options   = amplitude_options  | merge: amplitude_playlists %}

{% comment %} Detect prod mode
-------------------------------------------------------------------------------- {% endcomment %}
{% assign production = false %}
{% if environment == 'prod' or environment == 'production' %}
  {% assign production = true %}
{% endif %}


/*
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/modules/amplitudejs/js/plugins/tech/ytp.js (37)
 # AmplitudeJS V5 Plugin|Tech for J1 Template
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2026 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 # -----------------------------------------------------------------------------
*/
"use strict";

  // J1 Amplitude optimizations #1
  // CLARITY: `(expr) ? true : false` is just `Boolean(expr)` -- or, since
  // logical OR/comparison already returns a boolean, just `expr` itself.
  const isDev = j1.env === "development" || j1.env === "dev";

  // date|time monitoring
  //----------------------------------------------------------------------------
  var startTime;
  var endTime;
  var startTimeModule;
  var endTimeModule;
  var timeSeconds;

  // YT API settings
  // ---------------------------------------------------------------------------

  // J1 Amplitude optimizations #1
  // BUG FIX: Property `VIDEO_NOT_ALLOWED` was declared twice; the second
  // declaration silently overwrote the first, so error code 101 was lost.
  // Per the YT IFrame API, codes 101 and 150 both signal "video not allowed
  // in embedded players" -- but they are still distinct values that must
  // be addressable individually. Renamed the second key so both are kept.
  var YT_PLAYER_ERROR = {
    INVALID_PARAMETER:           2,
    INVALID_PLAYER:              5,
    VIDEO_NOT_ALLOWED:           101,
    VIDEO_NOT_ALLOWED_EMBEDDED:  150
  };

  var YT_PLAYER_ERROR_NAMES = {
    2:          "invalid parameter",
    5:          "invalid player",
    101:        "video not allowed",
    150:        "video not allowed"
  };

  var YT_PLAYER_STATE = {
    UNSTARTED:  -1,
    ENDED:       0,
    PLAYING:     1,
    PAUSED:      2,
    BUFFERING:   3,
    CUED:        5
  };

  // J1 Amplitude optimizations #1
  // BUG FIX: The names table had a fake key `4: "not_used"` that does not
  // correspond to any real YT player state, and it had `6: "unstarted"` which
  // forced lookup code to use the magic number 6 as a workaround for the
  // missing -1 entry (e.g. `YT_PLAYER_STATE_NAMES[6]`). Replaced with the
  // proper string key "-1" so `YT_PLAYER_STATE_NAMES[playerState]` works
  // directly for UNSTARTED. The "6" entry is retained for backwards
  // compatibility with existing call sites that still pass 6.
  var YT_PLAYER_STATE_NAMES = {
    "-1":       "unstarted",
    0:          "ended",
    1:          "playing",
    2:          "paused",
    3:          "buffering",
    5:          "cued",
    6:          "unstarted"   // deprecated alias for legacy call sites
  };

  // J1 Amplitude optimizations #1
  // CLEANUP: Removed a duplicate block declaring startTime, endTime,
  // startTimeModule, endTimeModule, timeSeconds. The same `var` set was
  // already declared 40 lines above. Re-declaring `var` is legal but
  // confusing and the second block was dead noise.

  // AmplitudeJS API settings
  // ---------------------------------------------------------------------------
  var firstScriptTag;
  var ytPlayer;
  var ytPlayerErrorTest               = false;
  var ytPlayerReady                   = false;
  var ytApiReady                      = false;
  var logger                          = log4javascript.getLogger('j1.adapter.amplitude.tech');

  var dependency;
  var playerCounter                   = 0;
  var load_dependencies               = {};

  // set default song index to FIRST track (video) in playlist
  var songIndex                       = 0;
  var ytpSongIndex                    = 0;

  var ytpAutoPlay                     = false;
  var ytpLoop                         = true;
  var playLists                       = {};
  var playersUILoaded                 = { state: false };
  var apiInitialized                  = { state: false };

  var amplitudeDefaults               = $.extend({}, {{amplitude_defaults  | replace: 'nil', 'null' | replace: '=>', ':' }});
  var amplitudePlayers                = $.extend({}, {{amplitude_players   | replace: 'nil', 'null' | replace: '=>', ':' }});
  var amplitudePlaylists              = $.extend({}, {{amplitude_playlists | replace: 'nil', 'null' | replace: '=>', ':' }});
  var amplitudeOptions                = $.extend(true, {}, amplitudeDefaults, amplitudePlayers, amplitudePlaylists);

  var playerExistsInPage              = false;
  var ytpContainer                    = null;
  var ytpBufferQuote                  = 0;
  var playerProperties                = {};
  var activeVideoElement              = {};
  var ytPlayerCurrentTime             = 0;
  var singleAudio                     = false;

  var playerScrollerSongElementMin    = {{amplitude_defaults.player.player_scroller_song_element_min}};
  var playerScrollControl             = {{amplitude_defaults.player.player_scroll_control}};
  var playerAutoScrollSongElement     = {{amplitude_defaults.player.player_auto_scroll_song_element}};
  var playerFadeAudio                 = {{amplitude_defaults.player.player_fade_audio}};
  var playerPlaybackRate              = '{{amplitude_defaults.player.player_playback_rate}}';

  var muteAfterVideoSwitchInterval    = {{amplitude_defaults.player.mute_after_video_switch_interval}};
  var checkActiveVideoInterval        = {{amplitude_defaults.player.check_active_video_interval}};

  var playList;
  // J1 Amplitude optimizations #1
  // CLEANUP: Removed duplicate `var playerProperties;` here. It was already
  // declared 15 lines above. Same legality / confusion comment as before.
  var playerID;
  var playerType;
  var playListTitle;
  var playListName;
  var amplitudePlayerState; 
  
  var songs;
  var songMetaData;
  var songURL;
                                                              
  var progress;

  // ---------------------------------------------------------------------------
  // Base YT functions
  // ===========================================================================

  // ---------------------------------------------------------------------------
  // mergeObject
  // ---------------------------------------------------------------------------
  // function mergeObject() {
  //   mergeObject = Object.assign || function mergeObject(t) {
  //     for (var s, i=1, n=arguments.length; i<n; i++) {
  //       s = arguments[i];
  //       for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
  //       }
  //       return t;
  //   };

  //   return mergeObject.apply(this, arguments);
  // } // END mergeObject

  // ---------------------------------------------------------------------------
  // processOnVideoStart(trackID, player, startSec)
  //
  // ---------------------------------------------------------------------------
  function processOnVideoStart(player, startSec) {
    var currentVolume, playlist, playerID,
        videoID, songIndex, trackID;

    playlist  = activeVideoElement.playlist;
    playerID  = playlist + '_large';
    videoID   = player.options.videoId;
    songIndex = activeVideoElement.index;
    trackID   = songIndex + 1;

    // seek video to START position
    ytpSeekTo(player, startSec, true);

    // fade-in audio (if enabled)
    if (playerFadeAudio) {
      currentVolume = player.getVolume();
      logger.debug(`FADE-IN audio on StateChange at trackID|VideoID: ${trackID}|${videoID}`);
      ytpFadeInAudio({
        playerID:     playerID,
        targetVolume: currentVolume,
        speed:        'default'
      });
    } // END if playerFadeAudio

  } // END processOnVideoStart

  // ---------------------------------------------------------------------------
  // processOnVideoEnd(player)
  //
  // TODO: 
  // ---------------------------------------------------------------------------
  function processOnVideoEnd(player) {
    var currentVideoTime, activeSong,
        playlist, playerID, songIndex, songs, playlistRepeat,
        trackID, activeVideoID, previousVideoID, isVideoChanged;

    activeSong = getActiveSong();

    playlist            = activeVideoElement.playlist;
    playerID            = playlist + '_large';
    currentVideoTime    = player.getCurrentTime();
    previousVideoID     = player.options.videoId;
    activeVideoID       = activeVideoElement.videoID;
    songIndex           = activeVideoElement.index;
    trackID             = songIndex + 1;
    songs               = activeVideoElement.songs;
    // J1 Amplitude optimizations #1
    // CLARITY: Removed redundant `? true : false` ternaries.
    // The compared expression already returns a boolean.
    playlistRepeat      = songs[songIndex].repeat === 'true';

    // check if video is changed (to detect multiple videoIDs in playlist)
    if (songIndex > 0) {
      isVideoChanged = previousVideoID !== activeVideoID;
    } else {
      isVideoChanged = true;
    }

    // fade-out audio (if enabled)
    if (isVideoChanged && playerFadeAudio) {
      logger.debug(`FADE-OUT audio on processOnVideoEnd at trackID|VideoID: ${trackID}|${activeVideoID}`);
      ytpFadeOutAudio({
      playerID:     playerID,
      speed:        'default'
      });
    } // END if playerFadeAudio

    if (isVideoChanged) {
      if (songIndex === songs.length - 1) {
        // LAST index reached, continue on FIRST index
        songIndex = 0;

        logger.debug(`LOAD first VIDEO on processOnVideoEnd at trackID|playlist: ${trackID}|${playlist}`);
        loadVideo(playlist, songIndex);

        // check if REPEAT is enabled on PLAYLIST
        if (!playlistRepeat) {
          // set FIRST song (video) paused if playing is continued
          ytPlayer.pauseVideo();
        } 
      } else {
        // load next video
        logger.debug(`LOAD next VIDEO on processOnVideoEnd at trackID|playlist: ${trackID}|${playlist}`);
        loadVideo(playlist, songIndex + 1);
      }
    } else {
      // skip loading next video if a SINGLE video is used for playlist
      logger.debug(`LOAD next TRACK in video on processOnVideoEnd at trackID|playlist: ${trackID}|${playlist}`);
    }

  } // END processOnVideoEnd  

  // ---------------------------------------------------------------------------
  // doNothingOnStateChange(state)
  //
  // wrapper for states that are not processed
  // ---------------------------------------------------------------------------
  function doNothingOnStateChange(state) {
    // J1 Amplitude optimizations #1
    // BUG FIX: The original branched on `state > 0` and -- in the else --
    // logged `YT_PLAYER_STATE_NAMES[6]` (which is "unstarted"). That meant
    // any non-positive state (including 0 = ENDED) was logged as "unstarted",
    // which is misleading. Now that YT_PLAYER_STATE_NAMES has a proper "-1"
    // key (see Fix #1), a single direct lookup with a fallback is enough
    // and produces the correct label for every documented YT state.
    var stateName = YT_PLAYER_STATE_NAMES[state] || ('unknown(' + state + ')');
    isDev && logger.debug(`DO NOTHING on StateChange for state: ${stateName}`);
  } // END doNothingOnStateChange

  // ---------------------------------------------------------------------------
  // processOnStateChangePlaying()
  //
  // wrapper for processing players on state PLAYING 
  // ---------------------------------------------------------------------------
  function processOnStateChangePlaying(event, playlist, songIndex) {
    // J1 Amplitude optimizations #1
    // BUG FIX: The original `var` block re-declared `songIndex`, `ytPlayer`
    // and `songs` -- each of which was either a function parameter
    // (songIndex) or the name of a separate variable on the same line.
    // With `var` this is legal but creates confusing shadowing where the
    // parameter and the local share the same identifier. The local
    // declarations are removed; the parameter stays authoritative until
    // it is reassigned from `activeSong.index` further down.
    var activeSong, activePlaylist,
        playerID, videoID, firstVideo,
        previousSongIndex,
        currentPlayer, previousPlayer,
        trackID, isSongIndexChanged;
    var ytPlayer, songs;

    ytPlayer   = event.target;
    // J1 Amplitude optimizations #1
    // CLARITY: `(songIndex > 0) ? false : true` is `songIndex <= 0`.
    firstVideo = songIndex <= 0;

    activeSong      = getActiveSong();
    activePlaylist  = playlist;
    playerID        = activeSong.playerID;
    videoID         = activeSong.videoID;
    songs           = activeSong.songs;
    songIndex       = activeSong.index;
    currentPlayer   = activeSong.player;
    previousPlayer  = j1.adapter.amplitude.data.ytPlayers[playerID].player
    trackID         = songIndex + 1;

    logger.debug(`PLAY audio on YT Player at playlist|trackID: ${activePlaylist}|${trackID}`);

    // save YT player GLOBAL data for later use (e.g. events)
    j1.adapter.amplitude.data.activePlayer              = 'ytp';
    j1.adapter.amplitude.data.ytpGlobals['activeIndex'] = songIndex;
    j1.adapter.amplitude.data.ytpGlobals['videoID']     = videoID;


    // save YT player data for later use (e.g. events)
    // -------------------------------------------------------------------------
    j1.modules.amplitudejs.data.activePlayer = 'ytp';
    j1.modules.amplitudejs.data.activeIndex = songIndex;
    j1.modules.amplitudejs.data.activePlaylist = playlist;
    j1.modules.amplitudejs.data.ytp.activePlayer = ytPlayer;
    j1.modules.amplitudejs.data.ytp.activeIndex = songIndex;
    j1.modules.amplitudejs.data.ytp.activePlaylist = playlist;
    j1.modules.amplitudejs.data.ytp.players[playerID].activeIndex = songIndex;
    j1.modules.amplitudejs.data.ytp.players[playerID].player = ytPlayer;
    j1.modules.amplitudejs.data.ytp.players[playerID].videoID = videoID;


    // update time container for the ACTIVE video
    // -----------------------------------------------------------------
    // J1 Amplitude optimizations #1
    // BUG FIX (memory leak): The original code created TWO new setInterval
    // handlers every time the player transitioned to PLAYING, but never
    // cleared the previous ones. After enough state transitions, dozens
    // (then hundreds) of timers would run in parallel, each calling
    // updateCurrentTimeContainerYTP / updateProgressBarsYTP twice per
    // second, scanning the DOM by class name on every tick.
    //
    // We now keep module-level handles to the running intervals and clear
    // them before installing fresh ones. The handles are stored on
    // j1.adapter.amplitude.data so they survive across calls without
    // leaking to the global scope.
    var intervals = j1.adapter.amplitude.data.ytpIntervals
                  || (j1.adapter.amplitude.data.ytpIntervals = {});

    if (intervals.currentTime) { clearInterval(intervals.currentTime); }
    if (intervals.progressBar) { clearInterval(intervals.progressBar); }

    intervals.currentTime = setInterval(function() {
      updateCurrentTimeContainerYTP(ytPlayer, playlist);
    }, 500);

    intervals.progressBar = setInterval(function() {
      updateProgressBarsYTP();
    }, 500);

    // update meta data
    ytpUpdatMetaContainers(activeSong);    

    // check|process video for configured START position (if set)
    // -------------------------------------------------------------------------
    var songStartSec = activeSong.startSec;
    if (songStartSec) {
      var tsStartSec      = j1.adapter.amplitude.seconds2timestamp(songStartSec);
      var songCurrentTime = ytPlayer.getCurrentTime();

      if (songCurrentTime < songStartSec) {
        logger.debug(`START video on StateChange at trackID|timestamp: ${trackID}|${tsStartSec}`);
        processOnVideoStart(ytPlayer, songStartSec);
      }
    } // END if songStartEnabled

    // check|process video for configured END position (if set)
    // -------------------------------------------------------------------------
    var songEndSec = activeSong.endSec;
    if (songEndSec) {
      var tsEndSec = j1.adapter.amplitude.seconds2timestamp(songEndSec);

      var checkOnVideoEnd = setInterval(function() {
        var songCurrentTime = ytPlayer.getCurrentTime();

        if (songCurrentTime >= songEndSec) {
          logger.debug(`STOP video on StateChange at trackID|timestamp: ${trackID}|${tsEndSec}`);
          processOnVideoEnd(ytPlayer);

          clearInterval(checkOnVideoEnd);
        } // END if currentVideoTime
      }, 500); // END checkOnVideoEnd
    } // END if songEndEnabled

    // stop active AT|YT players running in parallel except the current
    ytpStopParallelActivePlayers(playerID);

    // clear button MINI PlayerPlayPause (AT player)
    var buttonPlayerPlayPauseMini = document.getElementsByClassName("mini-player-play-pause");
    for (var i=0; i<buttonPlayerPlayPauseMini.length; i++) {
      var htmlElement = buttonPlayerPlayPauseMini[i];

      // toggle classes on state playing
      if (htmlElement.dataset.amplitudeSource === 'audio') {
        if (htmlElement.classList.contains('amplitude-playing')) {        
          htmlElement.classList.remove('amplitude-playing');
          htmlElement.classList.add('amplitude-paused');
        }
      }
  
    } // END for MINI buttonPlayerPlayPause

    // clear button COMPACT PlayerPlayPause (AT player)
    var buttonPlayerPlayPauseCompact = document.getElementsByClassName("compact-player-play-pause");
    for (var i=0; i<buttonPlayerPlayPauseCompact.length; i++) {
      var htmlElement = buttonPlayerPlayPauseCompact[i];
      
      // toggle classes on state playing
      if (htmlElement.dataset.amplitudeSource === 'audio') {
        if (htmlElement.classList.contains('amplitude-playing')) {
          htmlElement.classList.remove('amplitude-playing');
          htmlElement.classList.add('amplitude-paused');
        }
      }
  
    } // END for COMACT buttonPlayerPlayPause

    // clear button LARGE PlayerPlayPause (AT player)
    var buttonPlayerPlayPauseLarge = document.getElementsByClassName("large-player-play-pause");
    for (var i=0; i<buttonPlayerPlayPauseLarge.length; i++) {
      var htmlElement = buttonPlayerPlayPauseLarge[i];

      // toggle classes on state playing
      if (htmlElement.dataset.amplitudeSource === 'audio') {
        if (htmlElement.classList.contains('amplitude-playing')) {
          htmlElement.classList.remove('amplitude-playing');
          htmlElement.classList.add('amplitude-paused');
        }
      }

    } // END for LARGE buttonPlayerPlayPause

  } // END processOnStateChangePlaying

  // ---------------------------------------------------------------------------
  // processOnStateChangeEnded()
  //
  // ---------------------------------------------------------------------------
  function processOnStateChangeEnded(event, playlist, songIndex) {
    var videoID         = event.target.options.videoId;
    var trackID         = songIndex + 1;
    var playerID        = playlist + '_large';
    var songs           = j1.adapter.amplitude.data.ytPlayers[playerID].songs;
    var songMetaData    = songs[songIndex];
    // J1 Amplitude optimizations #1
    // CLARITY: removed redundant `? true : false`.
    var playlistRepeat  = songMetaData.repeat === 'true';
 
    if (songIndex === songs.length - 1) {
      // LAST index reached, continue on FIRST index
      songIndex = 0;

      // save player current time data for later use
      // ytPlayerCurrentTime = ytPlayer.getCurrentTime();

      // save YT player data for later use (e.g. events)
      // ---------------------------------------------------------------------
      j1.modules.amplitudejs.data.ytp.previousIndex = songIndex;  

      logger.debug(`LOAD first VIDEO on processOnStateChangeEnded at trackID|playlist: ${trackID}|${playlist}`);
      loadVideo(playlist, songIndex);

      // check if REPEAT is enabled on PLAYLIST
      if (!playlistRepeat) {
        // set FIRST song (video) paused if playing is continued
        ytPlayer.pauseVideo();
      } 
    } else {
      // save player current time data for later use
      // ytPlayerCurrentTime = ytPlayer.getCurrentTime();

      // save YT player data for later use (e.g. events)
      // ---------------------------------------------------------------------
      j1.modules.amplitudejs.data.ytp.previousIndex = songIndex;        

      // load next video
      logger.debug(`LOAD next VIDEO on processOnStateChangeEnded at trackID|playlist: ${trackID}|${playlist}`);
      loadVideo(playlist, songIndex + 1);
    }

  } // END processOnStateChangeEnded

  // ---------------------------------------------------------------------------
  // getSongIndex(songArray, videoID)
  //
  // TODO: Extend getSongIndex() for singleAudio
  // ---------------------------------------------------------------------------
  function getSongIndex(songArray, videoID) {
    var index;

    for (var i=0; i<songArray.length; i++) {
      if (songArray[i].url.includes(videoID)) {
        index = songArray[i].index;
        break;
      }
    }

    return index;
  }

  // ---------------------------------------------------------------------------
  // addNestedProperty
  //
  // Add property path dynamically to an existing object
  // Example: addNestedProperty(j1.adapter.amplitude.data, 'playlist.profile.name', 'Max Mustermann')
  // ---------------------------------------------------------------------------  
  function addNestedProperty(obj, path, value) {
    let current = obj;
    const properties = path.split('.');

    properties.forEach((property, index) => {
      if (index === properties.length - 1) {
        current[property] = value;
      } else {
        if (!current[property]) {
          current[property] = {};
        }
        current = current[property];
      }
    });
  }

  // ---------------------------------------------------------------------------
  // setNestedProperty
  // ---------------------------------------------------------------------------
  function setNestedProperty(obj, path, value) {
    const keys = path.split('.');
  
    // Basisfall: Wenn nur noch ein Schlüssel übrig ist, setzen wir den Wert direkt
    if (keys.length === 1) {
      obj[keys[0]] = value;
      return;
    }
  
    // Rekursiver Fall: Wir erstellen das Objekt für den nächsten Schlüssel, falls es noch nicht existiert
    let current = obj[keys[0]];
    if (typeof current !== 'object') {
      current = obj[keys[0]] = {};
    }
  
    // Rekursiver Aufruf für den Rest des Pfades
    setNestedProperty(current, keys.slice(1).join('.'), value);
  }

  // ---------------------------------------------------------------------------
  // addNestedObject
  //
  // Add (nested) object dynamically to an existing object
  // Example: createNestedObject(myObject, ['level1', 'arrayProperty', 0], 'element1');  
  // ---------------------------------------------------------------------------
  function addNestedObject(obj, path, value) {
    const lastKey = path[path.length - 1];
    let current = obj;
  
    path.slice(0, -1).forEach(key => {
      current[key] = current[key] || {};
      current = current[key];
    });
  
    current[lastKey] = value;
  }

  // ---------------------------------------------------------------------------
  // ytpFadeInAudio
  // ---------------------------------------------------------------------------
  function ytpFadeInAudio(params) {
    const cycle = 1;
    var   settings, currentStep, steps, sliderID, volumeSlider;

    // J1 Amplitude optimizations #1
    // BUG FIX: `params.targetVolume = 50` is an ASSIGNMENT, not a default.
    // It always wrote 50 back into params.targetVolume regardless of the
    // value the caller passed in (e.g. `currentVolume` from
    // processOnVideoStart). The result is that fade-in always faded to 50%
    // and ignored the caller's target. Same bug below for `speed`.
    // Replaced with the nullish-coalescing-as-default idiom.
    settings = {
      playerID:     params.playerID,
      targetVolume: (params.targetVolume != null) ? params.targetVolume : 50,
      speed:        params.speed || 'default'
    };

    // number of iteration steps to INCREASE the players volume on fade-in
    // NOTE: number of steps controls how long and smooth the fade-in 
    // transition will be
    const iterationSteps = {
      'default':  150,
      'slow':     250,
      'slower':   350,
      'slowest':  500
    };

    sliderID      = 'volume_slider_' + settings.playerID;
    volumeSlider  = document.getElementById(sliderID);
    steps         = iterationSteps[settings.speed];
    currentStep   = 1;

    if (volumeSlider === undefined || volumeSlider === null) {
      isDev && logger.warn('no volume slider found at playerID: ' + settings.playerID);
      return;
    }

    // Start the players volume muted
    ytPlayer.setVolume(0);

    const fadeInInterval = setInterval(() => {
      const newVolume = settings.targetVolume * (currentStep / steps);

      ytPlayer.setVolume(newVolume);
      volumeSlider.value = newVolume;
      currentStep++;

      (currentStep > steps) && clearInterval(fadeInInterval);
    }, cycle);

  } // END ytpFadeInAudio

  // ---------------------------------------------------------------------------
  // ytpFadeOutAudio
  // ---------------------------------------------------------------------------
  function ytpFadeOutAudio(params) {
    const cycle = 1;
    var   settings, currentStep, steps, newVolume, startVolume,
          playerID, sliderID, volumeSlider;

    // J1 Amplitude optimizations #1
    // BUG FIX: Same defaulting bug as in ytpFadeInAudio --
    // `params.speed = 'default'` was overwriting the caller's choice
    // every call. Use a real default expression instead.
    settings =  {
      playerID:   params.playerID,
      speed:      params.speed || 'default'
    };

    // number of iteration steps to DECREASE the volume
    const iterationSteps = {
      'default':  150,
      'slow':     250,
      'slower':   350,
      'slowest':  500
    };

    sliderID      = 'volume_slider_' + settings.playerID;
    volumeSlider  = document.getElementById(sliderID);
    startVolume   = ytPlayer.getVolume();
    steps         = iterationSteps[settings.speed];
    currentStep   = 0;

    if (volumeSlider === undefined || volumeSlider === null) {
      isDev && logger.warn('no volume slider found at playerID: ' + settings.playerID);
      return;
    }

    const fadeOutInterval = setInterval(() => {
      newVolume = startVolume * (1 - currentStep / steps);

      ytPlayer.setVolume(newVolume);
      volumeSlider.value = newVolume;
      currentStep++;

      (currentStep > steps) && clearInterval(fadeOutInterval);
    }, cycle);

  } // END ytpFadeOutAudio

  // ---------------------------------------------------------------------------
  // initYtAPI
  //
  // load YT Iframe player API
  // ---------------------------------------------------------------------------
  function initYtAPI() {
    startTimeModule = Date.now();

    logger.info('Initialize plugin|tech (ytp) : started');

    // Load YT IFrame Player API asynchronously
    // -------------------------------------------------------------------------
    var tag         = document.createElement('script');
    tag.src         = "//youtube.com/iframe_api";
    firstScriptTag  = document.getElementsByTagName('script')[0];

    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  }

  // ---------------------------------------------------------------------------
  // loadVideo(list, index)
  //
  // load next video in playlist
  // ---------------------------------------------------------------------------
  function loadVideo(currentPlaylist, currentIndex) {
    var activeSong, trackID, songName,
        playlist, playerID, playerIFrame,
        songs, songIndex, songMetaData, songURL,
        ytpVideoID, firstVideo, playlistRepeat;

    activeSong      = getActiveSong();
    playlist        = currentPlaylist;
    playerID        = playlist + '_large';
    songs           = activeSong.songs;
    // J1 Amplitude optimizations #1
    // CLARITY: removed redundant `? true : false`. Note: `playlistRepeat`
    // is computed but never used inside loadVideo; left as-is to match the
    // existing surface (could be deleted, see review document).
    playlistRepeat  = songs[currentIndex].repeat === 'true';
    ytPlayer        = activeSong.player;
    songIndex       = currentIndex;
    trackID         = songIndex + 1;
    
    // switch|play to songIndex in playlist
    if (songIndex <= songs.length - 1) {
      songMetaData  = songs[songIndex];
      songURL       = songMetaData.url;
      ytpVideoID    = songURL.split('=')[1];

      // save YT player data for later use (e.g. events)
      j1.adapter.amplitude.data.ytPlayers[playerID].activeIndex = songIndex;
      j1.adapter.amplitude.data.ytPlayers[playerID].videoID     = ytpVideoID;


      // save YT player data for later use (e.g. events)
      // -----------------------------------------------------------------------
      j1.modules.amplitudejs.data.ytp.previousSongIndex = songIndex;
      j1.modules.amplitudejs.data.ytp.players[playerID].activeIndex = songIndex;
      j1.modules.amplitudejs.data.ytp.players[playerID].previousIndex = songIndex - 1;
      j1.modules.amplitudejs.data.ytp.players[playerID].videoID = ytpVideoID;


      logger.debug(`SWITCH video on loadNextVideo at trackID|VideoID: ${trackID}|${ytpVideoID}`);
      ytPlayer.loadVideoById(ytpVideoID);
     
      // delay after switch video
      if (muteAfterVideoSwitchInterval) {
        ytPlayer.mute();
        setTimeout(() => {
          ytPlayer.unMute();
        }, muteAfterVideoSwitchInterval);
      }

      // save YT player data for later use (e.g. events)
      // -----------------------------------------------------------------------
      ytpSongIndex = songIndex;
      j1.modules.amplitudejs.data.ytp.songIndex = songIndex;

      // load the song cover image
      loadCoverImage(songMetaData);

      // update meta data
      // ytpUpdatMetaContainers(songMetaData);
  
      // set song (video) active at index in playlist
      setSongActive(playlist, songIndex);

      // reset progress bar settings
      resetProgressBarYTP();

      // scroll song active at index in player
      if (playerAutoScrollSongElement) {
        scrollToActiveElement(playlist);
      }

    } // END if songIndex

  } // END loadNextVideo

  // ---------------------------------------------------------------------------
  // initUiEventsForAJS
  //
  // setup YTPlayerUiEvents for AJS players  
  // ---------------------------------------------------------------------------
  function initUiEventsForAJS() {

    var dependencies_ytp_ready = setInterval (() => {
      var ytApiReady    = (j1.adapter.amplitude.data.ytpGlobals['ytApiReady']    !== undefined) ? j1.adapter.amplitude.data.ytpGlobals['ytApiReady']    : false;
      var ytPlayerReady = (j1.adapter.amplitude.data.ytpGlobals['ytPlayerReady'] !== undefined) ? j1.adapter.amplitude.data.ytpGlobals['ytPlayerReady'] : false;

      if (ytApiReady && ytPlayerReady) {

        {% for player in amplitude_players.players %}{% if player.enabled %}

          {% if player.source == empty %}
            {% assign player_source = amplitude_defaults.player.source %}
          {% else %}
            {% assign player_source = player.source %}
          {% endif %}

          {% if player_source == 'video' %}
          playerID = '{{player.id}}';
          mimikYTPlayerUiEventsForAJS(playerID);
          {% endif %}

        {% endif %}{% endfor %}

        clearInterval(dependencies_ytp_ready);
        logger.info('Initialize APIPlayers : ready');
      } // END if ready

    }, 10); // END dependencies_ytp_ready

  } // END initUiEventsForAJS()

  // ---------------------------------------------------------------------------
  // onYouTubeIframeAPIReady
  //
  // Create a player after Iframe player API is ready to use
  // ---------------------------------------------------------------------------
  function onYouTubeIframeAPIReady() {
    ytApiReady = true;

    {% for player in amplitude_options.players %}{% if player.enabled and player.source == 'video' %}
      {% capture xhr_container_id %}{{player.id}}_app{% endcapture %}

      {% if player.source == empty %}
        {% assign player_source = amplitude_defaults.player.source %}
      {% else %}
        {% assign player_source = player.source %}
      {% endif %}

      {% if player_source != 'video' %}
        {% continue %}
      {% else %}
        // load players of type 'video' configured in current page
        // ---------------------------------------------------------------------
        // J1 Amplitude optimizations #1
        // CLARITY: removed redundant `? true : false`.
        playerExistsInPage = $('#' + '{{xhr_container_id}}')[0] !== undefined;
        if (playerExistsInPage) { 
          var playerSettings     = $.extend({}, {{player | replace: 'nil', 'null' | replace: '=>', ':' }});
          var songs              = Amplitude.getSongsStatePlaylist(playerSettings.playlist.name);         
          var activeSongMetadata = songs[0];
          var playerType         = playerSettings.type

          // increase number of found players in page by one
          playerCounter++;     

          // load individual player settings (to manage multiple players in page)
          //
          var ytpAutoPlay = ('{{player.yt_player.autoplay}}'.length > 0) ? '{{player.yt_player.autoplay}}'  : '{{amplitude_defaults.player.yt_player.autoplay}}';
          var ytpLoop     = ('{{player.yt_player.loop}}'.length > 0)     ? '{{player.yt_player.loop}}'      : '{{amplitude_defaults.player.yt_player.loop}}';
          var ytpHeight   = ('{{player.yt_player.height}}'.length > 0)   ? '{{player.yt_player.height}}'    : '{{amplitude_defaults.player.yt_player.height}}';
          var ytpWidth    = ('{{player.yt_player.width}}'.length > 0)    ? '{{player.yt_player.width}}'     : '{{amplitude_defaults.player.yt_player.width}}';

          logger.info('AJS YouTube iFrame API: ready');
          logger.info('configure player on ID: #{{player.id}}');

          // create a (hidden) ytp iframe container
          //
          ytpContainer                = document.getElementById('{{player.id}}_video');
          ytpContainer.innerHTML      = '<div id="iframe_{{player.id}}"></div>';
          ytpContainer.style.cssText  = 'display:none';

          var ytpVideoID = (ytPlayerErrorTest) ? 'invalidVideoID' : activeSongMetadata.url.split('=')[1];
          ytPlayer = new YT.Player('iframe_{{player.id}}', {
            height:             ytpHeight,
            width:              ytpWidth,
            videoId:            ytpVideoID,
            playerVars: {
              autoplay:         ytpAutoPlay,
              loop:             ytpLoop
            },
            events: {
              'onReady':        {{player.id}}OnPlayerReady,
              'onStateChange':  {{player.id}}OnPlayerStateChange,
              'onError':        {{player.id}}OnPlayerErrors
            }
          });

          // remove EMPTY properties
          delete playerSettings.player;

          // save YT player properties for later use
          playerProperties = {
            "playerDefaults":   amplitudeDefaults.player,
            "playerSettings":   playerSettings,
            "player":           ytPlayer,
            "playerReady":      false,
            "playerType":       playerType,
            "playerID":         "{{player.id}}",
            "videoID":          ytpVideoID,
            "songs":            songs,
            "activeIndex":      0,
          };

          // store player properties for later use 
          addNestedProperty(j1.adapter.amplitude.data.ytPlayers, '{{player.id}}', playerProperties);

          // save YT player GLOBAL data for later use (e.g. events)
          j1.adapter.amplitude.data.ytpGlobals['ytApiReady'] = ytApiReady;


          // save amplitudejs data for later use (e.g. events)
          // -------------------------------------------------------------------
          j1.modules.amplitudejs.data.ytp.apiReady = ytApiReady;


          // reset current player
          playerExistsInPage = false;

        } // END if playerExistsInPage()

        // AJS YouTube Player errors fired by the YT API
        // ---------------------------------------------------------------------
        function {{player.id}}OnPlayerErrors(event) {
          var eventData, ytPlayer, videoID;

          eventData = event.data;
          ytPlayer  = event.target;
          videoID   = ytPlayer.options.videoId;

          logger.error(`YT API Error '${YT_PLAYER_ERROR_NAMES[eventData]}' for VideoID: '${videoID}'`);

          // save YT player GLOBAL data for later use (e.g. events)
          j1.adapter.amplitude.data.ytpGlobals['ytApiError'] = eventData;


          // save amplitudejs data for later use (e.g. events)
          // ------------------------------------------------------------------
          j1.modules.amplitudejs.data.ytp.apiError = eventData;


        }

        // AJS YouTube Player initialization fired by the YT API
        // ---------------------------------------------------------------------
        function {{player.id}}OnPlayerReady(event) {
          var hours, minutes, seconds,
              ytPlayer, ytPlayerReady, playerVolumePreset,
              playListName, songsInPlaylist, titleListLargePlayer;

          ytPlayer            = event.target;
          ytPlayerReady       = true;
          playerVolumePreset  = parseInt({{player.volume_slider.preset_value}});

          logger.debug(`FOUND video ready at ID: {{player.id}}`);

          // set video playback quality to a minimum
          ytPlayer.setPlaybackQuality('small');

          // set configured player volume preset
          ytPlayer.setVolume(playerVolumePreset);

          // enable|disable scrolling on playlist
          // -------------------------------------------------------------------
          if (document.getElementById('large_player_right') !== null) {

            // show|hide scrollbar in playlist
            // -----------------------------------------------------------------
            playListName          = j1.adapter.amplitude.data.ytPlayers.{{player.id}}.playerSettings.playlist.name;
            songsInPlaylist       = Amplitude.getSongsInPlaylist(playListName);
            titleListLargePlayer  = document.getElementById('large_player_title_list_' + playListName);

            if (songsInPlaylist.length <= playerScrollerSongElementMin) {
              if (titleListLargePlayer !== null) {
                titleListLargePlayer.classList.add('hide-scrollbar');
              }
            }
          }

          logger.info('yt player on ID {{player.id}}: ready');

          // save YT player GLOBAL data for later use (e.g. events)
          j1.adapter.amplitude.data.ytpGlobals['ytPlayerReady'] = ytPlayerReady;
          j1.adapter.amplitude.data.ytpGlobals['ytApiError']    = 0;          


          // save amplitudejs data for later use (e.g. events)
          // -------------------------------------------------------------------
          j1.modules.amplitudejs.data.ytp.apiError = 0;
          j1.modules.amplitudejs.data.ytp.players.{{player.id}} = {};
          j1.modules.amplitudejs.data.ytp.players.{{player.id}}.playerReady = ytPlayerReady;


          // get duration hours (if configured)
          if ({{player.display_hours}} ) {
            hours = ytpGetDurationHours(ytPlayer);
          }

          // get duration minutes|seconds
          minutes = ytpGetDurationMinutes(ytPlayer);
          seconds = ytpGetDurationSeconds(ytPlayer);

          // set duration time values for current video
          // -------------------------------------------------------------------

          // set duration|hours
          if ({{player.display_hours}} ) {
            var durationHours = document.getElementsByClassName("amplitude-duration-hours");
            durationHours[0].innerHTML = hours;
          }

          // set duration|minutes
          var durationMinutes = document.getElementsByClassName("amplitude-duration-minutes");
          durationMinutes[0].innerHTML = minutes;

          // set duration|seconds
          var durationSeconds = document.getElementsByClassName("amplitude-duration-seconds");
          durationSeconds[0].innerHTML = seconds;

          // final message
          // -------------------------------------------------------------------
          endTimeModule = Date.now();

          logger.info('Initialize plugin|tech (ytp) : finished');

          if (playerCounter > 0) {
            logger.info('Found players of type video (YTP) in page: ' + playerCounter);
          } else {
            isDev && logger.warn('Found NO players of type video (YTP) in page');
          }

          // update activeVideoElement data structure for the ACTIVE video
          // -------------------------------------------------------------------
          setInterval(function() {
            checkActiveVideoElementYTP();
          }, checkActiveVideoInterval);
          // END checkActiveVideoElementYTP

          logger.info('plugin|tech initializing time: ' + (endTimeModule-startTimeModule) + 'ms');

        } // END onPlayerReady()

        // ---------------------------------------------------------------------
        // OnPlayerStateChange
        //
        // process all YT Player specific state changes
        // ---------------------------------------------------------------------
        // NOTE:
        // The YT API fires a lot of INTERMEDIATE states. MOST of them gets
        // ignored (do nothing). For state PLAYING, important initial values
        // are being set; e.g. start|stop positions for a video (when)
        // configured.
        // ---------------------------------------------------------------------
        // AJS YouTube Player state changes fired by the YT API
        // ---------------------------------------------------------------------
        function {{player.id}}OnPlayerStateChange(event) {
          var currentTime, playlist, ytPlayer, ytVideoID,
              songs, songIndex, trackID, playerID, songMetaData;

          ytPlayer      = event.target;
          ytVideoID     = ytPlayer.options.videoId;
          playlist      = '{{player.id}}'.replace('_large', '');
          playerID      = '{{player.id}}';
          songs         = j1.adapter.amplitude.data.ytPlayers.{{player.id}}.songs;
          songIndex     = ytpSongIndex; // getSongIndex(songs, ytVideoID);
          trackID       = songIndex + 1;
          // songMetaData  = songs[songIndex];

          // save YT player GLOBAL data for later use (e.g. events)
          j1.adapter.amplitude.data.activePlayer                 = 'ytp';
          j1.adapter.amplitude.data.ytpGlobals['activePlayer']   = ytPlayer;
          j1.adapter.amplitude.data.ytpGlobals['activeIndex']    = songIndex;
          j1.adapter.amplitude.data.ytpGlobals['activePlaylist'] = playlist;   

          // save YT player data for later use (e.g. events)
          j1.adapter.amplitude.data.ytPlayers.{{player.id}}.player      = ytPlayer;
          j1.adapter.amplitude.data.ytPlayers.{{player.id}}.activeIndex = songIndex;


          // save amplitudejs data for later use (e.g. events)
          // -------------------------------------------------------------------
          j1.modules.amplitudejs.data.activePlayer = 'ytp';
          j1.modules.amplitudejs.data.activeIndex = songIndex;
          j1.modules.amplitudejs.data.activePlaylist = playlist;          
          j1.modules.amplitudejs.data.ytp.activePlayer = ytPlayer;
          j1.modules.amplitudejs.data.ytp.activeIndex = songIndex;
          j1.modules.amplitudejs.data.ytp.activePlaylist = playlist;
          j1.modules.amplitudejs.data.ytp.players.{{player.id}}.player = ytPlayer;
          j1.modules.amplitudejs.data.ytp.players.{{player.id}}.activeIndex = songIndex;


          // reset time container|progressbar for the ACTIVE song (video)
          // -------------------------------------------------------------------          
          resetCurrentTimeContainerYTP(ytPlayer, playlist);
          updateDurationTimeContainerYTP(ytPlayer, playlist);
          resetProgressBarYTP();

          // process all state changes fired by YT API
          // ------------------------------------------------------------------- 
          switch(event.data) {
            case YT_PLAYER_STATE.UNSTARTED:
              doNothingOnStateChange(YT_PLAYER_STATE.UNSTARTED);
              break;
            case YT_PLAYER_STATE.CUED:
              doNothingOnStateChange(YT_PLAYER_STATE.CUED);
              break;
            case YT_PLAYER_STATE.BUFFERING:
              doNothingOnStateChange(YT_PLAYER_STATE.BUFFERING);
              break;
            case YT_PLAYER_STATE.PAUSED:
              doNothingOnStateChange(YT_PLAYER_STATE.PAUSED);
              break;
            case YT_PLAYER_STATE.PLAYING:
              processOnStateChangePlaying(event, playlist, songIndex);
              break;
            case YT_PLAYER_STATE.ENDED:
              processOnStateChangeEnded(event, playlist, songIndex);
              break;
            default:
              logger.error(`UNKNOWN event on StateChange fired: ${event.data}`);
          } // END switch event.data

        } // END {{player.id}}OnPlayerStateChange

      {% endif %}
    {% endif %}{% endfor %}

  } // END onYouTubeIframeAPIReady

  // ---------------------------------------------------------------------------
  // main
  // ===========================================================================

  // ---------------------------------------------------------------------------
  // initYtAPI
  //
  // load|initialize YT Iframe player API
  // ---------------------------------------------------------------------------
  initYtAPI();

  // save YT player data for later use (e.g. events)
  // ---------------------------------------------------------------------
  var url = '//youtube.com/iframe_api'
  if (document.querySelectorAll(`script[src="${url}"]`).length > 0) {
    j1.modules.amplitudejs.data.ytp.plugin = 'loaded';
  }

  // ---------------------------------------------------------------------------
  // initUiEventsForAJS
  //
  // setup YTPlayerUiEvents for AJS players  
  // ---------------------------------------------------------------------------
  initUiEventsForAJS();

  // ---------------------------------------------------------------------------
  // Base AJS Player functions
  // ===========================================================================
  
  // ---------------------------------------------------------------------------
  // ytpUpdatMetaContainers(metaData)
  //
  // update song name in meta-containers
  // ---------------------------------------------------------------------------  
  function ytpUpdatMetaContainers(metaData) {
    var playerID, playlist, trackID, rating;

    playlist  = metaData.playlist;
    playerID  = playlist + '_large';
    rating    = metaData.rating;
    trackID   = metaData.index + 1;

    logger.debug(`UPDATE metadata on ytpUpdatMetaContainers for trackID|playlist at: ${trackID}|${playlist}`);

    // update song name in meta-containers
    var songName = document.getElementsByClassName("song-name");
    if (songName.length) {
      for (var i=0; i<songName.length; i++) {    
        var currentPlaylist = songName[i].dataset.amplitudePlaylist;
        if (currentPlaylist === playlist) {
          songName[i].innerHTML = metaData.name;
        }
      }
    }

    // update artist name in meta-containers
    var artistName = document.getElementsByClassName("artist");
    if (artistName.length) {
      for (var i=0; i<artistName.length; i++) {    
        var currentPlaylist = artistName[i].dataset.amplitudePlaylist;
        if (currentPlaylist === playlist) {
          artistName[i].innerHTML = metaData.artist;
        }
      }
    }

    // update album name in meta-containers
    var albumName = document.getElementsByClassName("album");
    if (albumName.length) {
      for (var i=0; i<albumName.length; i++) {
        // J1 Amplitude optimizations #1
        // BUG FIX: The original used `songName[i].dataset.amplitudePlaylist`
        // here -- a copy/paste from the songName loop above. Because the
        // songName and albumName HTMLCollections do not necessarily have
        // matching length or indexing, this either reads the wrong
        // element's data-attribute or throws when songName is shorter.
        // The correct array to read from is the one we are iterating over.
        var currentPlaylist = albumName[i].dataset.amplitudePlaylist;
        if (currentPlaylist === playlist) {
          albumName[i].innerHTML = metaData.album;
        }
      }
    }

    // update song rating in screen controls
    var songAudioRating = document.getElementsByClassName("audio-rating-screen-controls");
    if (songAudioRating.length) {
      for (var i=0; i<songAudioRating.length; i++) {
        var currentPlaylist = songAudioRating[i].dataset.amplitudePlaylist;
        if (currentPlaylist === playlist) {
          if (metaData.rating) {
            songAudioRating[i].innerHTML = `<img src="/assets/image/pattern/rating/scalable/${metaData.rating}-star.svg" alt="song rating">`;
          }
        }
      }
    } // END if songAudioRating

    // update song info in screen controls
    var songAudioInfo = document.getElementsByClassName("audio-info-link-screen-controls");
    if (songAudioInfo.length) {
      for (var i=0; i<songAudioInfo.length; i++) {
        var currentPlaylist = songAudioInfo[i].dataset.amplitudePlaylist;
        if (currentPlaylist === playlist) {
          if (metaData.audio_info) {
            songAudioInfo[i].setAttribute("href", metaData.audio_info);
          }
        }
      }
    } // END if songAudioInfo

  } // END ytpUpdatMetaContainers

  // ---------------------------------------------------------------------------
  // loadCoverImage(metaData)
  //
  // load the configured cover image for a specic song (metaData)
  // ---------------------------------------------------------------------------  
  function loadCoverImage(metaData) {
    var selector;
    var coverImage = {};

    selector       = ".cover-image-" + metaData.playlist;
    coverImage     = document.querySelector(selector);
    coverImage.src = metaData.cover_art_url;

  } // END loadCoverImage

  // ---------------------------------------------------------------------------
  // ytpStopParallelActivePlayers(exceptPlayer)
  //
  // if multiple players used on a page, stop ALL active AT|YT players
  // running in parallel skipping the exceptPlayer
  // ---------------------------------------------------------------------------  
  function ytpStopParallelActivePlayers(exceptPlayer) {

    // stop active AT players running in parallel
    // -------------------------------------------------------------------------
    var atPlayerState = Amplitude.getPlayerState();
    if (atPlayerState === 'playing' || atPlayerState === 'paused') {
      Amplitude.stop();
    } // END stop active AT players

    // stop active YT players running in parallel
    // -------------------------------------------------------------------------
    const ytPlayers = Object.keys(j1.adapter.amplitude.data.ytPlayers);
    for (let i=0; i<ytPlayers.length; i++) {
      const ytPlayerID        = ytPlayers[i];
      const playerProperties  = j1.adapter.amplitude.data.ytPlayers[ytPlayerID];

      if (ytPlayerID !== exceptPlayer) {
        var player        = j1.adapter.amplitude['data']['ytPlayers'][ytPlayerID]['player'];
        // J1 Amplitude optimizations #1
        // CLARITY: With the YT_PLAYER_STATE_NAMES table now containing a
        // proper "-1" key (see Fix #1), the magic-number workaround
        // `(state > 0) ? state : 6` is no longer needed. Direct lookup
        // with a fallback expresses intent more clearly. Equivalent
        // simplifications appear at every site that used `[6]`.
        var rawState      = player.getPlayerState();
        var ytPlayerState = YT_PLAYER_STATE_NAMES[rawState] || 'unstarted';

        // toggle PlayPause buttons playing => puased
        // ---------------------------------------------------------------------
        var isValidPlayerState = /playing|paused/.test(ytPlayerState);
        if (isValidPlayerState) {
          logger.debug(`STOP player at ytpStopParallelActivePlayers for id: ${ytPlayerID}`);
          player.stopVideo();
          var ytpButtonPlayerPlayPause = document.getElementsByClassName("large-player-play-pause-" + ytPlayerID);
          for (var j=0; j<ytpButtonPlayerPlayPause.length; j++) {

            var htmlElement = ytpButtonPlayerPlayPause[j];
            if (htmlElement.dataset.amplitudeSource === 'youtube') {
              if (htmlElement.classList.contains('amplitude-playing')) {        
                htmlElement.classList.remove('amplitude-playing');
                htmlElement.classList.add('amplitude-paused');
              }
              // if (htmlElement.classList.contains('amplitude-paused')) {        
              //   htmlElement.classList.remove('amplitude-paused');
              //   htmlElement.classList.add('amplitude-playing');
              // }              
            }

          } // END for ytpButtonPlayerPlayPause

        } // END if ytPlayerState
      } // END if ytPlayerID

      // save AT player data for later use (e.g. events)
      // ---------------------------------------------------------------------
      j1.adapter.amplitude.data.ytpGlobals.activeIndex = 0;

    } // END stop active YT players
  } // END ytpStopParallelActivePlayers

  // ---------------------------------------------------------------------------
  // getSongPlayed
  //
  // Returns the index of the current video (song) in the songs array
  // that is currently playing (starts by 0)  
  // ---------------------------------------------------------------------------  
  function getSongPlayed() {  
    var index           = -1;
    var songContainers  = document.getElementsByClassName("amplitude-active-song-container");

    if (songContainers.length) {
      for (var i=0; i<songContainers.length; i++) {
        index = parseInt(songContainers[i].getAttribute('data-amplitude-song-index'));
        if (index >= 0) {
            break;
        }
      }      
    }

    return index;
  } // END getSongPlayed

  // ---------------------------------------------------------------------------
  // setSongActive(currentPlayList, currentIndex)
  //
  // set song (video) active at index in playlist
  // ---------------------------------------------------------------------------
  function setSongActive(currentPlayList, currentIndex) {
    var playlist, songContainers, songIndex;

    songIndex = currentIndex;

    // clear ALL active song containers
    // -------------------------------------------------------------------------
    songContainers = document.getElementsByClassName("amplitude-song-container");
    for (var i=0; i<songContainers.length; i++) {
      songContainers[i].classList.remove("amplitude-active-song-container");
    }

    // find current song container and activate the element
    // -------------------------------------------------------------------------
    songContainers = document.querySelectorAll('.amplitude-song-container[data-amplitude-song-index="' + songIndex + '"]');          
    for (var i=0; i<songContainers.length; i++) {
      if (songContainers[i].hasAttribute("data-amplitude-playlist")) {
        playlist = songContainers[i].getAttribute("data-amplitude-playlist");
        if (playlist === currentPlayList) {
          songContainers[i].classList.add("amplitude-active-song-container");
        }
      }
    }

  } // END setSongActive

  // ---------------------------------------------------------------------------
  // getProgressBarSelectedPositionPercentage
  //
  // Returns the position as a percentage the user clicked in player progressbar
  // NOTE: The percentage is out of [0.00 .. 1.00]  
  // ---------------------------------------------------------------------------
  function getProgressBarSelectedPositionPercentage (event, progessBar) {
    var offset     = progessBar.getBoundingClientRect();
    var xpos       = event.pageX - offset.left;
    var percentage = (parseFloat(xpos) / parseFloat(progessBar.offsetWidth)).toFixed(2);

    return percentage;
  } // END getProgressBarSelectedPositionPercentage

  // ---------------------------------------------------------------------------
  // getTimeFromPercentage
  //
  // Returns the time in seconds calculated from a percentage value
  // NOTE: The percentage is out of [0.00 .. 1.00]
  // ---------------------------------------------------------------------------
  function getTimeFromPercentage (player, percentage) {
    var videoDuration = ytpGetDuration(player);
    var time          = parseFloat((videoDuration * percentage).toFixed(2));

    return time;
  } // END getTimeFromPercentage

  // ---------------------------------------------------------------------------
  // checkActiveVideoElementYTP
  //
  // 
  // ---------------------------------------------------------------------------
  function checkActiveVideoElementYTP() {
    var activeVideoElements = document.getElementsByClassName("amplitude-active-song-container");
    if (activeVideoElements.length) {
      var classArray  = [].slice.call(activeVideoElements[0].classList, 0); 
      var classString = classArray.toString();

      // activeVideoElement.html          = activeVideoElements[0];
      activeVideoElement.playlist         = activeVideoElements[0].dataset.amplitudePlaylist;
      activeVideoElement.index            = parseInt(activeVideoElements[0].dataset.amplitudeSongIndex);
      activeVideoElement.playerType       = (classString.includes('large') ? 'large' : 'compact');
      activeVideoElement.playerID         = activeVideoElement.playlist + '_' + activeVideoElement.playerType;

      if (j1.adapter.amplitude.data.ytPlayers[activeVideoElement.playerID] !== undefined) {
        activeVideoElement.player         = j1.adapter.amplitude.data.ytPlayers[activeVideoElement.playerID].player;
        activeVideoElement.songs          = j1.adapter.amplitude.data.ytPlayers[activeVideoElement.playerID].songs;

        var activeSong                    = activeVideoElement.songs[activeVideoElement.index];

        activeVideoElement.album          = activeSong.album;
        activeVideoElement.artist         = activeSong.artist;
        activeVideoElement.audio_info     = activeSong.audio_info;
        activeVideoElement.currentTime    = parseFloat(activeVideoElement.player.getCurrentTime());
        activeVideoElement.cover_art_url  = activeSong.cover_art_url;
        activeVideoElement.duration       = activeSong.duration;
        activeVideoElement.endSec         = j1.adapter.amplitude.timestamp2seconds(activeSong.end);
        activeVideoElement.endTS          = activeSong.end;
        activeVideoElement.name           = activeSong.name;
        activeVideoElement.rating         = activeSong.rating;
        activeVideoElement.startSec       = j1.adapter.amplitude.timestamp2seconds(activeSong.start);
        activeVideoElement.startTS        = activeSong.start;
        activeVideoElement.url            = activeSong.url;

        var videoArray                    = activeSong.url.split('=');
        activeVideoElement.videoID        = videoArray[1];

      }
    }
  }

  // ---------------------------------------------------------------------------
  // isObjectEmpty(obj)
  //
  // ---------------------------------------------------------------------------
  function isObjectEmpty(obj) {
    for (const prop in obj) {
      if (Object.hasOwn(obj, prop)) {
        return false;
      }
    }

    return true;
  } // END isObjectEmpty

  // ---------------------------------------------------------------------------
  // getActiveSong()
  //
  // Returns the time in seconds calculated from a percentage value
  // NOTE: The percentage is out of [0.00 .. 1.00]
  // ---------------------------------------------------------------------------
  function getActiveSong() {

    if(!isObjectEmpty(activeVideoElement)) {
      return activeVideoElement;
    }

    return false;
  } // END getActiveSong


  // ---------------------------------------------------------------------------
  // updateProgressBarsYTP
  //
  // Update YTP specific progress data
  // ---------------------------------------------------------------------------
  function updateProgressBarsYTP() {
    var progress, progressBars, playlist, playerID,
        classArray, classString, activePlayer, activeClass;

    progressBars = document.getElementsByClassName("large-player-progress");
    for (var i=0; i<progressBars.length; i++) {
      if (progressBars[i].dataset.amplitudeSource === 'audio') {
        // do nothing (managed by adapter)
      } else {  
        playlist      = progressBars[i].getAttribute("data-amplitude-playlist");    
        playerID      = playlist + '_large';  
        classArray    = [].slice.call(progressBars[i].classList, 0);
        classString   = classArray.toString();
        activePlayer  = j1.adapter.amplitude.data.ytPlayers[playerID].player;
        activeClass   = 'large-player-progress-' + playlist;

        if (activePlayer === undefined) {
          logger.error('YT player not defined');
          return;
        }

        if (classString.includes(activeClass)) {
          // calc procent value (float, 2 decimals [0.00 .. 1.00])
          progress = parseFloat((activePlayer.getCurrentTime() / activePlayer.getDuration()).toFixed(2));
          
          // set current progess value if valid
          if (isFinite(progress)) {
            progressBars[i].value = progress;
          }
        }
      }
    } // END for

    return;
  } // END updateProgressBarsYTP

  // ---------------------------------------------------------------------------
  // updateDurationTimeContainerYTP(player, playlist)
  //
  // update time container values for current video
  // ---------------------------------------------------------------------------
  function updateDurationTimeContainerYTP(player, playlist) {
    var hours, minutes, seconds;
    var durationHours, durationMinutes, durationSeconds;
    var activePlaylist;

    // get current hours|minutes|seconds
    // -------------------------------------------------------------------------
    hours   = ytpGetDurationHours(player);
    minutes = ytpGetDurationMinutes(player);
    seconds = ytpGetDurationSeconds(player);

    // update current duration|hours
    // -------------------------------------------------------------------------
    durationHours = document.getElementsByClassName("amplitude-duration-hours");
    if (durationHours.length && !isNaN(hours)) {
      for (var i=0; i<durationHours.length; i++) {    
        var currentPlaylist = durationHours[i].dataset.amplitudePlaylist;
        if (currentPlaylist === playlist) {
          durationHours[i].innerHTML = hours;
        }
      }
    }

    // update current duration|minutes
    // -------------------------------------------------------------------------
    durationMinutes = document.getElementsByClassName("amplitude-duration-minutes");
    if (durationMinutes.length && !isNaN(minutes)) {
      for (var i=0; i<durationMinutes.length; i++) {    
        var currentPlaylist = durationMinutes[i].dataset.amplitudePlaylist;
        if (currentPlaylist === playlist) {
          durationMinutes[i].innerHTML = minutes;
        }
      }
    }

    // update duration|seconds
    // -------------------------------------------------------------------------
    durationSeconds = document.getElementsByClassName("amplitude-duration-seconds");
    if (durationSeconds.length && !isNaN(seconds)) {
      for (var i=0; i<durationSeconds.length; i++) {    
        var currentPlaylist = durationSeconds[i].dataset.amplitudePlaylist;
        if (currentPlaylist === playlist) {
          durationSeconds[i].innerHTML = seconds;
        }
      }
    }

    return;
  } // END updateDurationTimeContainerYTP

  // ---------------------------------------------------------------------------
  // updateCurrentTimeContainerYTP(player, metaData)
  //
  // update time container values for current video
  // ---------------------------------------------------------------------------
  function updateCurrentTimeContainerYTP(player, playlist) {
    var hours, minutes, seconds;
    var currentHours, currentMinutes, currentSeconds;

    // get current hours|minutes|seconds
    hours   = ytpGetCurrentHours(player);
    minutes = ytpGetCurrentMinutes(player);
    seconds = ytpGetCurrentSeconds(player);

    // update current duration|hours
    // -------------------------------------------------------------------------
    if (hours !== '00') {
      currentHours = document.getElementsByClassName("amplitude-current-hours");
      if (currentHours.length) {
        for (var i=0; i<currentHours.length; i++) {    
          var currentPlaylist = currentHours[i].dataset.amplitudePlaylist;
          if (currentPlaylist === playlist) {
            currentHours[i].innerHTML = hours;
          }
        }
      }
    }

    // update current duration|minutes
    // -------------------------------------------------------------------------
    currentMinutes = document.getElementsByClassName("amplitude-current-minutes");
    if (currentMinutes.length) {
      for (var i=0; i<currentMinutes.length; i++) {    
        var currentPlaylist = currentMinutes[i].dataset.amplitudePlaylist;
        if (currentPlaylist === playlist) {
          currentMinutes[i].innerHTML = minutes;
        }
      }
    }
   
    // update duration|seconds
    // -------------------------------------------------------------------------
    currentSeconds = document.getElementsByClassName("amplitude-current-seconds");
    if (currentSeconds.length) {
      for (var i=0; i<currentSeconds.length; i++) {    
        var currentPlaylist = currentSeconds[i].dataset.amplitudePlaylist;
        if (currentPlaylist === playlist) {
          currentSeconds[i].innerHTML = seconds;
        }
      }
    }

    return;
  } // END updateCurrentTimeContainerYTP

  // ---------------------------------------------------------------------------
  // resetProgressBarYTP()
  //
  // Reset ALL progress bars
  // ---------------------------------------------------------------------------
  function resetProgressBarYTP() {
    var progressBars = document.getElementsByClassName("large-player-progress");
    for (var i=0; i<progressBars.length; i++) {
      progressBars[i].value = 0;
    }
  } // END resetProgressBarYTP

  // ---------------------------------------------------------------------------
  // resetCurrentTimeContainerYTP
  //
  // Reset YTP specific CURRENT time data
  // ---------------------------------------------------------------------------  
  function resetCurrentTimeContainerYTP(player, playlist) {

    // reset duration|hours
    var currentHours = document.getElementsByClassName("amplitude-current-hours");
    if (currentHours.length) {
      for (var i=0; i<currentHours.length; i++) {    
        var currentPlaylist = currentHours[i].dataset.amplitudePlaylist;
        if (currentPlaylist === playlist) {
          currentHours[i].innerHTML = '00';
        }
      }
    }

    // reset duration|minutes
    var currentMinutes = document.getElementsByClassName("amplitude-current-minutes");
    if (currentMinutes.length) {
      // J1 Amplitude optimizations #1
      // BUG FIX: The loop bound was `currentHours.length` (copy/paste from
      // the block above) instead of `currentMinutes.length`. If the page
      // had a different number of hours/minutes spans (e.g. when
      // `display_hours` is false the hours collection is empty), the loop
      // either skipped real elements or skipped iteration entirely.
      for (var i=0; i<currentMinutes.length; i++) {
        var currentPlaylist = currentMinutes[i].dataset.amplitudePlaylist;
        if (currentPlaylist === playlist) {
          currentMinutes[i].innerHTML = '00';
        }
      }
    } 

    // reset duration|seconds
    var currentSeconds = document.getElementsByClassName("amplitude-current-seconds");
    if (currentSeconds.length) {
      for (var i=0; i<currentSeconds.length; i++) {    
        var currentPlaylist = currentSeconds[i].dataset.amplitudePlaylist;
        if (currentPlaylist === playlist) {
          currentSeconds[i].innerHTML = '00';
        }
      }    
    }    

    return;
  } // END resetCurrentTimeContainerYTP


  // ---------------------------------------------------------------------------
  // Mimik Base AJS API functions
  // ===========================================================================

  // ---------------------------------------------------------------------------
  // ytpLoadVideoById
  //
  // Load a video by ID and resolve once the YT player has buffered enough
  // of it for smooth playback (or a timeout is reached).
  // ---------------------------------------------------------------------------
  function ytpLoadVideoById(player, id, _bufferQuoteIgnored) {
    // J1 Amplitude optimizations #1
    // BUG FIX: The original implementation was unrecoverable:
    //   1. `return true;` came BEFORE `clearInterval(videoLoaded);` --
    //      so the clearInterval line was unreachable; the timer ran forever.
    //   2. The `return` statements inside the setInterval callback returned
    //      from the arrow function, NOT from the outer ytpLoadVideoById. The
    //      outer function returned `undefined` immediately after starting
    //      the timer, so callers could never see the buffer state.
    //   3. The `bufferQuote` parameter was being reassigned inside the
    //      callback, which served no purpose because the assignment was
    //      not visible outside the closure.
    //
    // Result: the function leaked an interval per call and never returned
    // anything meaningful. Since it is currently unreferenced (grep finds
    // no callers), the safest fix is to keep its name and signature stable
    // but rewrite it as a Promise that actually resolves when the video is
    // buffered, with a hard timeout to prevent the runaway-timer scenario.
    const cycle           = 250;   // poll every 250 ms
    const bufferThreshold = 3;     // % loaded before considering ready
    const maxTries        = 60;    // give up after 60 polls (~15 s)

    player.loadVideoById(id);

    return new Promise(function(resolve) {
      var tries = 0;
      const videoLoaded = setInterval(function() {
        tries++;
        const bufferQuote = ytpGetBuffered(player);
        if (bufferQuote >= bufferThreshold || tries >= maxTries) {
          clearInterval(videoLoaded);
          resolve(bufferQuote >= bufferThreshold);
        }
      }, cycle);
    });
  } // END ytpLoadVideoById

  // ---------------------------------------------------------------------------
  // ytpSeekTo
  //
  // Seek (skip) video to specified time (position)
  // ---------------------------------------------------------------------------
  function ytpSeekTo(player, time, seekAhead) {
    // const allowSeekAhead = true;
    // var buffered = ytpGetBuffered(player);

    if (player.id !== undefined) {
      player.seekTo(time, seekAhead);
      // player.seekTo(time);

     return true;
    } else {
      return false;
    }

  } // END ytpSeekTo

  // ---------------------------------------------------------------------------
  // ytpGetBuffered
  //
  // Returns the buffered percentage of the video currently playing
  // ---------------------------------------------------------------------------
  function ytpGetBuffered(player) {

    return (player.getVideoLoadedFraction() * 100).toFixed(2);
  } // END ytpGetBuffered

  // ---------------------------------------------------------------------------
  // ytpGetActiveIndex
  //
  // Returns the active song index (in the songs array, starts by 0)
  // ---------------------------------------------------------------------------
  function ytpGetActiveIndex(playerID) {
    var activeIndex = -1;

    if (j1.adapter.amplitude.data.ytPlayers[playerID].activeIndex !== undefined) {
        activeIndex = parseInt(j1.adapter.amplitude.data.ytPlayers[playerID].activeIndex);
    }

    return activeIndex;
  } // END ytpGetActiveIndex

  // ---------------------------------------------------------------------------
  // ytpSetActiveIndex
  //
  // Set the index of the active song (index starts by 0)
  // ---------------------------------------------------------------------------   
  function ytpSetActiveIndex(playerID, idx) {
    var success = false;
    var index   = parseInt(idx);

    if (j1.adapter.amplitude.data.ytPlayers[playerID].activeIndex !== undefined) {
        j1.adapter.amplitude.data.ytPlayers[playerID].activeIndex = index;
        success = true;
    }

    return success;
  } // END ytpSetActiveIndex

  // ---------------------------------------------------------------------------
  // ytpGetPlayedPercentage
  //
  // Returns the percentage of the video played
  // ---------------------------------------------------------------------------
  function ytpGetPlayedPercentage(player) {
     // tbd
  } // END ytpGetPlayedPercentage

  // ---------------------------------------------------------------------------
  // ytpGetAudio
  //
  // Returns the actual video element
  // ---------------------------------------------------------------------------
  function ytpGetAudio(player) {
     // tbd
  } // END ytpGetAudio

  // ---------------------------------------------------------------------------
  // ytpGetPlaybackSpeeds
  //
  // Returns available playback speeds for the player
  // ---------------------------------------------------------------------------
  function ytpGetPlaybackSpeeds(player) {
     // tbd
  } // END ytpGetPlaybackSpeeds

  // ---------------------------------------------------------------------------
  // ytpGetPlayerState
  //
  // Returns the current state of the player
  // ---------------------------------------------------------------------------
  function ytpGetPlayerState(player) {
     // tbd
  } // END ytpGetPlayerState

  // ---------------------------------------------------------------------------
  // ytpGetDuration
  //
  // Returns the duration of the video
  // ---------------------------------------------------------------------------
  function ytpGetDuration(player) {
    var duration;

    var playerState   = player.getPlayerState();
    var ytPlayerState = YT_PLAYER_STATE_NAMES[playerState];

    var isValidPlayerState = /playing|paused|buffering|cued/.test(ytPlayerState);
    if (isValidPlayerState) {
      duration = player.getDuration();

      return duration;
    } else {
      return 0;
    }
  } // END ytpGetDuration

  // ---------------------------------------------------------------------------
  // ytpGetCurrentTime
  //
  // Returns the current time of the video played
  // ---------------------------------------------------------------------------
  function ytpGetCurrentTime(player) {
    var currentTime;

    var playerState   = player.getPlayerState();
    var ytPlayerState = YT_PLAYER_STATE_NAMES[playerState];

    var isValidPlayerState = /playing|paused|cued|unstarted/.test(ytPlayerState);
    if (isValidPlayerState) {
        currentTime = player.getCurrentTime();

        return currentTime;
    } else {
        return 0;
    }

  } // END ytpGetCurrentTime

  // ---------------------------------------------------------------------------
  // ytpGetDurationHours
  //
  // Returns the duration hours of the video
  // ---------------------------------------------------------------------------
  function ytpGetDurationHours(player) {
    var duration, hours, d, h;

    var playerState   = player.getPlayerState();
    var ytPlayerState = YT_PLAYER_STATE_NAMES[playerState];

    var isValidPlayerState = /playing|paused|cued/.test(ytPlayerState);
    if (isValidPlayerState) {
        duration  = ytpGetDuration(player);
        d         = Number(duration);
        h         = Math.floor(d / 3600);
        hours     = h.toString().padStart(2, '0');

        return hours;
    } else {
        return '00';
    }

  } // END ytpGetDurationHours

  // ---------------------------------------------------------------------------
  // ytpGetDurationMinutes
  //
  // Returns the duration minutes of the video
  // ---------------------------------------------------------------------------
  function ytpGetDurationMinutes(player) {
    var duration, minutes, d, m;

    var playerState   = player.getPlayerState();
    var ytPlayerState = YT_PLAYER_STATE_NAMES[playerState];

    var isValidPlayerState = /playing|paused|cued/.test(ytPlayerState);
    if (isValidPlayerState) {
        duration  = ytpGetDuration(player);
        d         = Number(duration);
        m         = Math.floor(d % 3600 / 60);
        minutes   = m.toString().padStart(2, '0');

        return minutes;
    } else {
        return '00';
    }

  } // END ytpGetDurationMinutes

  // ---------------------------------------------------------------------------
  // ytpGetDurationSeconds
  //
  // Returns the duration seconds of the video
  // ---------------------------------------------------------------------------
  function ytpGetDurationSeconds(player) {
    var duration, seconds, d, s;

    var playerState   = player.getPlayerState();
    var ytPlayerState = YT_PLAYER_STATE_NAMES[playerState];

    var isValidPlayerState = /playing|paused|cued/.test(ytPlayerState);
    if (isValidPlayerState) {
        duration  = ytpGetDuration(player);
        d         = Number(duration);
        s         = Math.floor(d % 60);
        seconds   = s.toString().padStart(2, '0');

        return seconds;
    } else {
        return '00';
    }

  } // END ytpGetDurationSeconds

  // ---------------------------------------------------------------------------
  // ytpGetCurrentHours
  //
  // Returns the current hours the user is into the video
  // ---------------------------------------------------------------------------
  function ytpGetCurrentHours(player) {
    var currentTime, hours, d, h;

    var playerState   = player.getPlayerState();
    var ytPlayerState = YT_PLAYER_STATE_NAMES[playerState];

    var isValidPlayerState = /playing|paused/.test(ytPlayerState);
    if (isValidPlayerState) {
        currentTime = ytpGetCurrentTime(player);
        d           = Number(currentTime);
        h           = Math.floor(d / 3600);
        hours       = h.toString().padStart(2, '0');

        return hours;
    } else {
        return '00';
    }

  } // END ytpGetCurrentHours

  // ---------------------------------------------------------------------------
  // ytpGetCurrentMinutes
  //
  // Returns the current minutes the user is into the video
  // ---------------------------------------------------------------------------
  function ytpGetCurrentMinutes (player) {
    var currentTime, minutes, d, m;

    var playerState   = player.getPlayerState();
    var ytPlayerState = YT_PLAYER_STATE_NAMES[playerState];

    var isValidPlayerState = /playing|paused/.test(ytPlayerState);
    if (isValidPlayerState) {
        currentTime = ytpGetCurrentTime(player);
        d           = Number(currentTime);
        m           = Math.floor(d % 3600 / 60);
        minutes     = m.toString().padStart(2, '0');

        return minutes;
    } else {
        return '00';
    }

  } // END ytpGetCurrentMinutes

  // ---------------------------------------------------------------------------
  // ytpGetCurrentSeconds
  //
  // Returns the current seconds the user is into the video
  // ---------------------------------------------------------------------------
  function ytpGetCurrentSeconds(player) {
    var currentTime, seconds, d, s;

    var playerState   = player.getPlayerState();
    var ytPlayerState = YT_PLAYER_STATE_NAMES[playerState];

    var isValidPlayerState = /playing|paused/.test(ytPlayerState);
    if (isValidPlayerState) {
        currentTime = ytpGetCurrentTime(player);
        d           = Number(currentTime);
        s           = Math.floor(d % 60);
        seconds     = s.toString().padStart(2, '0');

        return seconds;
    } else {
        return '00';
    }

  } // END ytpGetCurrentSeconds

  // ---------------------------------------------------------------------------
  // togglePlayPauseButton
  //
  // toggle button play|pause
  // ---------------------------------------------------------------------------
  function togglePlayPauseButton(elementClass) {
    var button, htmlElement;

    button = document.getElementsByClassName(elementClass);

    if (button.length) {
      htmlElement = button[0];

      if (htmlElement.classList.contains('amplitude-paused')) {
        htmlElement.classList.remove('amplitude-paused');
        htmlElement.classList.add('amplitude-playing');
      } else {
        htmlElement.classList.remove('amplitude-playing');
        htmlElement.classList.add('amplitude-paused');
      }
    } else {
      return false;
    }

  } // END togglePlayPauseButton

  // ---------------------------------------------------------------------------
  // setPlayPauseButtonPaused 
  // ---------------------------------------------------------------------------
  function setPlayPauseButtonPaused(element) {

    element.classList.remove('amplitude-playing');
    element.classList.add('amplitude-paused');

  } // END setPlayPauseButtonPaused

  // ---------------------------------------------------------------------------
  // setPlayPauseButtonPlaying 
  // ---------------------------------------------------------------------------
  function setPlayPauseButtonPlaying(element) {

    element.classList.remove('amplitude-paused');
    element.classList.add('amplitude-playing');

  } // END setPlayPauseButtonPlaying

  // ---------------------------------------------------------------------------
  // scrollToActiveElement(playlist)
  // ---------------------------------------------------------------------------  
  function scrollToActiveElement(activePlaylist) {
    const scrollableList        = document.getElementById('large_player_title_list_' + activePlaylist);
    const activeElement         = scrollableList.querySelector('.amplitude-active-song-container');
    var activeElementOffsetTop  = activeElement.offsetTop;
    var songIndex               = parseInt(activeElement.getAttribute("data-amplitude-song-index"));
    var activeElementOffsetTop  = songIndex * j1.adapter.amplitude.data.playerSongElementHeigth;

    if (scrollableList && activeElement) {
      scrollableList.scrollTop = activeElementOffsetTop;
    }
  } // END scrollToActiveElement

  // ---------------------------------------------------------------------------
  // mimikYTPlayerUiEventsForAJS
  //
  // Mimik AJS button events for YT video
  // ---------------------------------------------------------------------------  
  function mimikYTPlayerUiEventsForAJS(ytPlayerID) {

    if (j1.adapter.amplitude['data']['ytPlayers'][ytPlayerID] !== undefined) {
      var playerDefaults = j1.adapter.amplitude['data']['ytPlayers'][ytPlayerID].playerDefaults;
      var playerSettings = j1.adapter.amplitude['data']['ytPlayers'][ytPlayerID].playerSettings;
      var playerButton   = `large-player-play-pause-${ytPlayerID}`;

      // -----------------------------------------------------------------------
      // Large AJS players
      // -----------------------------------------------------------------------
      if (j1.adapter.amplitude['data']['ytPlayers'][ytPlayerID].playerSettings.type === 'large') { 
        var playlist             = j1.adapter.amplitude['data']['ytPlayers'][ytPlayerID].playerSettings.playlist.name;
        var playerScrollList     = document.getElementById('large_player_title_list_' + playlist);

        if (playerScrollControl) {
          // J1 Amplitude optimizations #1
          // BUG FIX (3 problems in this block):
          //
          // 1. `playerSongElementHeigth` was used as a free identifier but
          //    never declared anywhere in this scope. The actual storage
          //    location is `j1.adapter.amplitude.data.playerSongElementHeigth`
          //    (the misspelling -- "Heigth" -- is preserved because that
          //    same key is read elsewhere in the codebase; renaming it
          //    here would silently break the contract). The next major
          //    pass should rename the property in *all* read sites.
          //
          // 2. Inside the scroll handler, `list.scrollTop` and `list.scrollTo`
          //    referenced an identifier `list` that was never declared --
          //    a runtime ReferenceError on the very first scroll event.
          //    The intended target is the bound element `playerScrollList`.
          //
          // 3. The handler was added unconditionally even when
          //    `playerScrollList` is null (no playlist DOM on the page),
          //    which would throw at .addEventListener. Added a null guard.
          var songElementHeight     = j1.adapter.amplitude.data.playerSongElementHeigth || 0;
          var listItemHeight        = songElementHeight / 2;
          var itemsPerBlock         = 1;
          var isScrollingResetDelay = 150;
          var isScrolling           = false;

          if (playerScrollList) {
            playerScrollList.addEventListener('scroll', (event) => {
              // block multiple scroll events (while scrolling)
              if (isScrolling) {
                return;
              }
              isScrolling = true;

              // calculate number of blocks already scrolled
              const scrolledBlocks = Math.round(
                playerScrollList.scrollTop / (listItemHeight * itemsPerBlock)
              );

              // calculate top position based on number of blocks
              const targetScrollTop = scrolledBlocks * listItemHeight * itemsPerBlock;

              // smooth scrolling
              playerScrollList.scrollTo({
                top: targetScrollTop,
                behavior: 'smooth'
              });

              // reset the scrolling flags
              setTimeout(() => {
                isScrolling = false;
              }, isScrollingResetDelay);
            });
          }
        }

        // Overload ytp play_pause button for YT
        // ---------------------------------------------------------------------
        var largePlayerPlayPauseButton = document.getElementsByClassName(playerButton);
        for (var i=0; i<largePlayerPlayPauseButton.length; i++) {          
          var classArray  = [].slice.call(largePlayerPlayPauseButton[i].classList, 0);
          var classString = classArray.toString();

          if (classString.includes(ytPlayerID)) {
            largePlayerPlayPauseButton[i].addEventListener('click', function(event) {
              var activeSong, songs, songMetaData, playerData,
                  ytPlayer, playerState, ytPlayerState, playlist,
                  playerID, songIndex;

              playlist    = this.getAttribute("data-amplitude-playlist");
              playerID    = playlist + '_large';
              activeSong  = getActiveSong();

              if (!activeSong) {
                songIndex     = 0;
                ytpSongIndex  = 0;
              } else {
                if (activeSong.playlist !== playlist) {
                  songIndex    = 0;
                  ytpSongIndex = 0;
                } else {
                  songIndex = ytpSongIndex;
                }
              } // END if activeSong

              if (j1.adapter.amplitude.data.ytpGlobals.ytApiError > 0) {
                // do nothing on API errors
                var trackID = songIndex + 1;
                logger.error(`DISABLED player for playlist|trackID: ${playlist}|${trackID} on API error '${YT_PLAYER_ERROR_NAMES[j1.adapter.amplitude.data.ytpGlobals.ytApiError]}'`);

                return;
              }

              playerData    = j1.adapter.amplitude.data.ytPlayers[playerID];
              ytPlayer      = playerData.player;
              songIndex     = playerData.activeIndex;
              songs         = playerData.songs;           

              // save player GLOBAL data for later use (e.g. events)
              j1.adapter.amplitude.data.activePlayer                 = 'ytp';
              j1.adapter.amplitude.data.ytpGlobals['activeIndex']    = songIndex;
              j1.adapter.amplitude.data.ytpGlobals['activePlaylist'] = playlist;

              // toggle YT play|pause video
              // ---------------------------------------------------------------
              playerState   = ytPlayer.getPlayerState();
              // J1 Amplitude optimizations #1
              // CLARITY: With the YT_PLAYER_STATE_NAMES table now containing
              // a real "-1" key (Fix #1), direct lookup is sufficient and
              // there is no need for the magic-6 fallback workaround.
              ytPlayerState = YT_PLAYER_STATE_NAMES[playerState] || 'unstarted';

              // NOTE:
              // ---------------------------------------------------------------
              // unclear why player state 'cued' occurs
              // ---------------------------------------------------------------              
              // load (cued) video
              if (ytPlayerState === 'cued' || ytPlayerState === 'unstarted' ) {
                ytPlayer.playVideo();

                // wait for API error state
                setTimeout(() => {
                  if (j1.adapter.amplitude.data.ytpGlobals.ytApiError > 0) {
                    var trackID = songIndex + 1;
                    logger.error(`DISABLED player for playlist|trackID: ${playlist}|${trackID} on API error '${YT_PLAYER_ERROR_NAMES[j1.adapter.amplitude.data.ytpGlobals.ytApiError]}'`);

                    // do nothing on API errors
                    return;
                  }

                  // reset progress bar settings
                  resetProgressBarYTP();                    

                  var playPauseButtonClass = `large-player-play-pause-${ytPlayerID}`;
                  togglePlayPauseButton(playPauseButtonClass);

                  // set song at songIndex active in playlist
                  setSongActive(playlist, songIndex);

                  // scroll song active at index in player
                  if (playerAutoScrollSongElement) {
                    scrollToActiveElement(playlist);
                  }

                  // reset|update time settings
                  resetCurrentTimeContainerYTP(ytPlayer, playlist);
                  updateDurationTimeContainerYTP(ytPlayer, playlist);

                }, 100);

                return;
              } // END if ytPlayerState === 'cued'              

              // NOTE:
              // ---------------------------------------------------------------
              // unclear why player state 'cued'
              // is folloed by 'unstarted'|'buffering' on playing
              // ---------------------------------------------------------------
              // TOGGLE state 'playing' => 'paused'
              var isValidPlayerState = /playing|unstarted|buffering/.test(ytPlayerState);
              if (isValidPlayerState) {
                ytPlayer.pauseVideo();

                ytPlayerCurrentTime = ytPlayer.getCurrentTime();

                var playPauseButtonClass = `large-player-play-pause-${ytPlayerID}`;
                togglePlayPauseButton(playPauseButtonClass);

                // reset|update time settings
                resetCurrentTimeContainerYTP(ytPlayer, playlist);
                updateDurationTimeContainerYTP(ytPlayer, playlist);                
              }

              // TOGGLE state 'paused' => 'playing'
              if (ytPlayerState === 'paused') {
                ytPlayer.playVideo();
                ytpSeekTo(ytPlayer, ytPlayerCurrentTime, true);

                var trackID =  songIndex + 1;
                logger.debug(`PLAY video for PlayPauseButton on playlist|trackID: ${playlist}|${trackID} at: ${ytPlayerCurrentTime}`);

                var playPauseButtonClass = `large-player-play-pause-${ytPlayerID}`;
                togglePlayPauseButton(playPauseButtonClass);

                // reset|update time settings
                resetCurrentTimeContainerYTP(ytPlayer, playlist);
                updateDurationTimeContainerYTP(ytPlayer, playlist);                  
              } // if ytPlayerState === 'paused'

              // deactivate AJS events (if any)
              event.stopImmediatePropagation();

            }); // END EventListener largePlayerPlayPauseButton 'click
          } // END if classString
        } // END for largePlayerPlayPauseButton

        // Overload AJS largePlayerSkipBackward button for YT
        // ---------------------------------------------------------------------
        var largePlayerSkipForwardButtons = document.getElementsByClassName("large-player-skip-forward");
        for (var i=0; i<largePlayerSkipForwardButtons.length; i++) {
          var classArray  = [].slice.call(largePlayerSkipForwardButtons[i].classList, 0);
          var classString = classArray.toString();

          // load player settings
          var playerForwardBackwardSkipSeconds = (playerSettings.forward_backward_skip_seconds === undefined) ? playerDefaults.forward_backward_skip_seconds : playerSettings.forward_backward_skip_seconds;

          if (classString.includes(ytPlayerID)) {
            largePlayerSkipForwardButtons[i].addEventListener('click', function(event)  {
              var currentVideoTime, playerState, skipOffset, ytPlayer;

              skipOffset        = parseInt(playerForwardBackwardSkipSeconds);
              ytPlayer          = j1.adapter.amplitude['data']['ytPlayers'][ytPlayerID].player;
              playerState       = ytPlayer.getPlayerState();
              currentVideoTime  = ytPlayer.getCurrentTime();

              if (playerState === YT_PLAYER_STATE.PLAYING || playerState === YT_PLAYER_STATE.PAUSED) {
                logger.debug(`SKIP forward on Button skipForward for ${skipOffset} seconds`);
                ytpSeekTo(ytPlayer, currentVideoTime + skipOffset, true);
              }

            // deactivate AJS events (if any)
            event.stopImmediatePropagation();
            }); // END eventListener
          } // END if classString.includes(ytPlayerID
        } // END for largePlayerSkipForwardButtons 

        // Overload AJS largePlayerSkipBackward button for YT
        // ---------------------------------------------------------------------
        var largePlayerSkipBackwardButtons = document.getElementsByClassName("large-player-skip-backward");
        for (var i=0; i<largePlayerSkipBackwardButtons.length; i++) {
          var classArray  = [].slice.call(largePlayerSkipBackwardButtons[i].classList, 0);
          var classString = classArray.toString();

          // load player settings
          var playerForwardBackwardSkipSeconds = (playerSettings.forward_backward_skip_seconds === undefined) ? playerDefaults.forward_backward_skip_seconds : playerSettings.forward_backward_skip_seconds;

          if (classString.includes(ytPlayerID)) {
            largePlayerSkipBackwardButtons[i].addEventListener('click', function(event)  {
              var currentVideoTime, playerState, skipOffset, ytPlayer;

              skipOffset        = parseInt(playerForwardBackwardSkipSeconds);
              ytPlayer          = j1.adapter.amplitude['data']['ytPlayers'][ytPlayerID].player;
              playerState       = ytPlayer.getPlayerState();
              currentVideoTime  = ytPlayer.getCurrentTime();

              if (playerState === YT_PLAYER_STATE.PLAYING || playerState === YT_PLAYER_STATE.PAUSED) {
                logger.debug(`SKIP backward on Button skipBackward for ${skipOffset} seconds`);
                ytpSeekTo(ytPlayer, currentVideoTime - skipOffset, true);
              }

              // deactivate AJS events (if any)
              event.stopImmediatePropagation();            
            }); // END Listener 'click'
          } // END if skip-backward button
        } // END for

        // Overload AJS largePlayerNext button for YT
        // ---------------------------------------------------------------------
        var largePlayerNextButton = document.getElementsByClassName("large-player-next");
        for (var i=0; i<largePlayerNextButton.length; i++) {
          var classArray  = [].slice.call(largePlayerNextButton[i].classList, 0);
          var classString = classArray.toString();

          if (classString.includes(ytPlayerID)) {
            largePlayerNextButton[i].addEventListener('click', function(event) {
              var playlist, playerID, songIndex, trackID,
                  songs, songMetaData, songName, songURL,
                  ytPlayer, ytpVideoID;

              songIndex = ytpSongIndex;
              playlist  = this.getAttribute("data-amplitude-playlist");
              playerID  = playlist + '_large';
              songs     = j1.adapter.amplitude.data.ytPlayers[playerID].songs;
              ytPlayer  = j1.adapter.amplitude.data.ytPlayers[playerID].player;

              if (j1.adapter.amplitude.data.ytpGlobals.ytApiError > 0) {
                // do nothing on API errors
                var trackID = songIndex + 1;
                logger.error(`DISABLED player for playlist|trackID: ${playlist}|${trackID} on API error '${YT_PLAYER_ERROR_NAMES[j1.adapter.amplitude.data.ytpGlobals.ytApiError]}'`);

                return;
              }

              if (ytPlayer === undefined) {
                logger.error('YT player not defined');
              }

              // select video
              if (songIndex < songs.length-1) {
                // select NEXT video
                songIndex++;                
                ytpSongIndex = songIndex;
              } else {
                // select FIRST video
                songIndex    = 0; 
                ytpSongIndex = songIndex;           
              }

              // set song (video)^meta data
              songMetaData  = songs[songIndex];
              songURL       = songMetaData.url;
              ytpVideoID    = songURL.split('=')[1];

              // load next video
              // ---------------------------------------------------------------

              // save YT player GLOBAL data for later use (e.g. events)
              j1.adapter.amplitude.data.activePlayer                 = 'ytp';
              j1.adapter.amplitude.data.ytpGlobals['activeIndex']    = songIndex;
              j1.adapter.amplitude.data.ytpGlobals['activePlaylist'] = playlist;

              // save YT player data for later use (e.g. events)
              j1.adapter.amplitude.data.ytPlayers[playerID].activeIndex = songIndex;
              j1.adapter.amplitude.data.ytPlayers[playerID].videoID     = ytpVideoID;

              // save amplitudejs data for later use (e.g. events)
              // ---------------------------------------------------------------
              j1.modules.amplitudejs.data.ytp.activeIndex = songIndex;
              j1.modules.amplitudejs.data.ytp.activePlaylist = playlist;
              j1.modules.amplitudejs.data.ytp.players[playerID].player = ytPlayer;
              j1.modules.amplitudejs.data.ytp.players[playerID].activeIndex = songIndex;


              trackID = songIndex + 1;
              logger.debug(`SWITCH video for PlayerNextButton at trackID|VideoID: ${trackID}|${ytpVideoID}`);
              ytPlayer.loadVideoById(ytpVideoID);

              // delay after switch video
              if (muteAfterVideoSwitchInterval) {
                ytPlayer.mute();
                setTimeout(() => {
                  ytPlayer.unMute();
                }, muteAfterVideoSwitchInterval);
              }

              if (songIndex === 0) {

                // continue paused on FIRST video
                // TODO: handle on player|shuffle different (do play)
                ytPlayer.pauseVideo();

                // reset|update time settings
                resetCurrentTimeContainerYTP(ytPlayer, playlist);
                updateDurationTimeContainerYTP(ytPlayer, playlist);
                resetProgressBarYTP();

                // set AJS play_pause button paused
                var playPauseButtonClass = `large-player-play-pause-${ytPlayerID}`;
                togglePlayPauseButton(playPauseButtonClass);
              } else {
                // toggle AJS play_pause button
                var playPauseButtonClass = `large-player-play-pause-${ytPlayerID}`;
                togglePlayPauseButton(playPauseButtonClass);
              }

              // reset|update current time settings
              resetCurrentTimeContainerYTP(ytPlayer, playlist);
              updateDurationTimeContainerYTP(ytPlayer, playlist);
              resetProgressBarYTP();

              // load the song cover image
              loadCoverImage(songMetaData);

              // update meta data
              // ytpUpdatMetaContainers(songMetaData);

              // set song at songIndex active in playlist
              setSongActive(playlist, songIndex);

              // scroll song active at index in player
              if (playerAutoScrollSongElement) {
                scrollToActiveElement(playlist);
              }

              // deactivate AJS events (if any)
              event.stopImmediatePropagation();

            }); // END EventListener 'click' next button
          } // END if classString.includes(ytPlayerID)

      } // END for largePlayerNextButton

      // Overload AJS largePlayerPrevious button for YT
      // -----------------------------------------------------------------------
      var largePlayePreviousButton = document.getElementsByClassName("large-player-previous");
      for (var i=0; i<largePlayePreviousButton.length; i++) {
        var classArray  = [].slice.call(largePlayePreviousButton[i].classList, 0);
        var classString = classArray.toString();

        if (classString.includes(ytPlayerID)) {
          largePlayePreviousButton[i].addEventListener('click', function(event) {
            var playlist, playerID, songIndex, trackID,
                songs, songMetaData, songName, songURL,
                ytPlayer, ytpVideoID;

            songIndex = ytpSongIndex;
            playlist  = this.getAttribute("data-amplitude-playlist");
            playerID  = playlist + '_large';
            songs     = j1.adapter.amplitude.data.ytPlayers[playerID].songs;
            ytPlayer  = j1.adapter.amplitude.data.ytPlayers[playerID].player;

            if (j1.adapter.amplitude.data.ytpGlobals.ytApiError > 0) {
              // do nothing on API errors
              var trackID = songIndex + 1;
              logger.error(`DISABLED player for playlist|trackID: ${playlist}|${trackID} on API error '${YT_PLAYER_ERROR_NAMES[j1.adapter.amplitude.data.ytpGlobals.ytApiError]}'`);

              return;
            }

            if (ytPlayer === undefined) {
              logger.error('YT player not defined');
            }

            // select video
            if (songIndex > 0 && songIndex <= songs.length - 1) {
              // select NEXT video
              songIndex--;                
              ytpSongIndex = songIndex;
            } else {
              // select FIRST video
              songIndex    = 0; 
              ytpSongIndex = songIndex;           
            }

            // set song (video)^meta data
            songMetaData  = songs[songIndex];
            songURL       = songMetaData.url;
            ytpVideoID    = songURL.split('=')[1];

            // save YT player GLOBAL data for later use (e.g. events)
            j1.adapter.amplitude.data.activePlayer                 = 'ytp';
            j1.adapter.amplitude.data.ytpGlobals['activeIndex']    = songIndex;
            j1.adapter.amplitude.data.ytpGlobals['activePlaylist'] = playlist;


            // save amplitudejs data for later use (e.g. events)
            // -----------------------------------------------------------------
            // J1 Amplitude optimizations #1
            // BUG FIX: The original wrote `songIndex` (a number) into
            // `activePlayer` and `activePlaylist`. By inspection of every
            // other write site, the correct values are the strings 'ytp'
            // and the playlist name -- consumers downstream rely on these
            // being string identifiers, not the numeric song index.
            j1.modules.amplitudejs.data.activePlayer = 'ytp';
            j1.modules.amplitudejs.data.activeIndex = songIndex;
            j1.modules.amplitudejs.data.activePlaylist = playlist;
            j1.modules.amplitudejs.data.ytp.activeIndex = songIndex;
            j1.modules.amplitudejs.data.ytp.activePlaylist = playlist;
            j1.modules.amplitudejs.data.ytp.players[playerID].player = ytPlayer;
            j1.modules.amplitudejs.data.ytp.players[playerID].activeIndex = songIndex;   



            // load previous video
            // -----------------------------------------------------------------

            // save YT player data for later use (e.g. events)
            j1.adapter.amplitude.data.activePlayer                    = 'ytp';
            j1.adapter.amplitude.data.ytPlayers[playerID].activeIndex = songIndex;
            j1.adapter.amplitude.data.ytPlayers[playerID].videoID     = ytpVideoID; 

            trackID = songIndex + 1;
            logger.debug(`SWITCH video for PlayePreviousButton at trackID|VideoID: ${trackID}|${ytpVideoID}`);
            ytPlayer.loadVideoById(ytpVideoID);

            // delay after switch video
            if (muteAfterVideoSwitchInterval) {
              ytPlayer.mute();
              setTimeout(() => {
                ytPlayer.unMute();
              }, muteAfterVideoSwitchInterval);
            }

            if (songIndex === 0) {

              // continue paused on FIRST video
              // TODO: handle on player|shuffle different (do play)
              ytPlayer.pauseVideo();

              // reset|update time settings
              resetCurrentTimeContainerYTP(ytPlayer, playlist);
              updateDurationTimeContainerYTP(ytPlayer, playlist);
              resetProgressBarYTP();

              // set AJS play_pause button paused
              var playPauseButtonClass = `large-player-play-pause-${ytPlayerID}`;
              togglePlayPauseButton(playPauseButtonClass);
            } else {
              // toggle AJS play_pause button
              var playPauseButtonClass = `large-player-play-pause-${ytPlayerID}`;
              togglePlayPauseButton(playPauseButtonClass);
            }

            // reset|update current time settings
            resetCurrentTimeContainerYTP(ytPlayer, playlist);
            updateDurationTimeContainerYTP(ytPlayer, playlist);
            resetProgressBarYTP();

            // load the song cover image
            loadCoverImage(songMetaData);

            // update meta data
            // ytpUpdatMetaContainers(songMetaData);

            // set song at songIndex active in playlist
            setSongActive(playlist, songIndex);

            // scroll song active at index in player
            if (playerAutoScrollSongElement) {
              scrollToActiveElement(playlist);
            }

            // deactivate AJS events (if any)
            event.stopImmediatePropagation();

          }); // END EventListener 'click' next button
        } // END if classString.includes(ytPlayerID)

    } // END for largePlayerNextButton

    // click on song container
    // -------------------------------------------------------------------------
    var largePlayerSongContainer = document.getElementsByClassName("amplitude-song-container");
    for (var i=0; i<largePlayerSongContainer.length; i++) {
      var classArray  = [].slice.call(largePlayerSongContainer[i].classList, 0);
      var classString = classArray.toString();

      if (classString.includes(ytPlayerID)) {
        largePlayerSongContainer[i].addEventListener('click', function(event) {
          var activeSong, playlist, playerID,
              playerState, ytPlayerState,
              songs, songIndex, songName, singleAudio, trackID,
              ytPlayer, ytpVideoID, activeSongIndex, isSongIndexChanged;

          // set (current) playlist|song data
          // -------------------------------------------------------------------
          playlist            = this.getAttribute("data-amplitude-playlist");
          playerID            = playlist + '_large';
          songIndex           = parseInt(this.getAttribute("data-amplitude-song-index"));
          trackID             = songIndex + 1;
          activeSongIndex     = j1.adapter.amplitude.data.ytPlayers[playerID].activeIndex;
          // J1 Amplitude optimizations #1
          // CLARITY: removed redundant `? true : false`.
          isSongIndexChanged  = activeSongIndex !== songIndex;

          // set (current) song meta data
          // -------------------------------------------------------------------
          songs               = j1.adapter.amplitude.data.ytPlayers[playerID].songs;
          songMetaData        = songs[songIndex];
          songURL             = songMetaData.url;
          ytpVideoID          = (ytPlayerErrorTest) ? 'invalidVideoID' : songURL.split('=')[1];
          ytPlayer            = j1.adapter.amplitude.data.ytPlayers[playerID].player;
          playerState         = ytPlayer.getPlayerState();
          // J1 Amplitude optimizations #1
          // CLARITY: replaced magic-6 fallback with the proper -1 entry
          // (see Fix #1) plus a defensive default.
          ytPlayerState       = YT_PLAYER_STATE_NAMES[playerState] || 'unstarted';

          // NOTE:
          // -------------------------------------------------------------------
          // unclear why player state 'cued' occurs
          // -------------------------------------------------------------------              
          // load (cued) video
          if (ytPlayerState === 'cued') {
            ytPlayer.playVideo();

            // wait for API error state
            setTimeout(() => {
              if (j1.adapter.amplitude.data.ytpGlobals.ytApiError > 0) {
                var trackID = songIndex + 1;
                logger.error(`DISABLED player for playlist|trackID: ${playlist}|${trackID} on API error '${YT_PLAYER_ERROR_NAMES[j1.adapter.amplitude.data.ytpGlobals.ytApiError]}'`);

                // do nothing on API errors
                return;
              }

              // reset progress bar settings
              resetProgressBarYTP();                    

              var playPauseButtonClass = `large-player-play-pause-${ytPlayerID}`;
              togglePlayPauseButton(playPauseButtonClass);

              // set song at songIndex active in playlist
              setSongActive(playlist, songIndex);

              // scroll song active at index in player
              if (playerAutoScrollSongElement) {
                scrollToActiveElement(playlist);
              }

              // reset|update time settings
              resetCurrentTimeContainerYTP(ytPlayer, playlist);
              updateDurationTimeContainerYTP(ytPlayer, playlist);

            }, 100);

            return;
          } // END if ytPlayerState === 'cued'

          // TOGGLE state 'playing' => 'paused' if video (audio) NOT changed
          if (!isSongIndexChanged && ytPlayerState === 'playing') {
            ytPlayer.pauseVideo();
              // get active song settings (manually)
              activeSong = getActiveSong();

              // J1 Amplitude optimizations #1
              // CLEANUP: The original branched on `activeSong.playlist !==
              // playlist` and ran identical bodies in both arms (and again
              // in the outer else). All three branches assign the same
              // `songs` and `ytPlayer` from the same source, so the
              // conditional is dead code. Reduced to a single assignment.
              songs     = j1.adapter.amplitude.data.ytPlayers[playerID].songs;
              ytPlayer  = j1.adapter.amplitude.data.ytPlayers[playerID].player;

              ytPlayerCurrentTime = ytPlayer.getCurrentTime();

              var trackID = songIndex + 1;
              logger.debug(`PAUSE video for PlayerSongContainer on playlist|trackID: ${playlist}|${trackID} at: ${ytPlayerCurrentTime}`);

              var playPauseButtonClass = `large-player-play-pause-${ytPlayerID}`;
              togglePlayPauseButton(playPauseButtonClass);

              // reset|update time settings
              resetCurrentTimeContainerYTP(ytPlayer, playlist);
              updateDurationTimeContainerYTP(ytPlayer, playlist);

              // save YT player data for later use (e.g. events)
              // ---------------------------------------------------------------
              ytpSongIndex = songIndex;
              j1.modules.amplitudejs.data.ytp.songIndex = songIndex;

              // save YT player GLOBAL data for later use (e.g. events)
              j1.adapter.amplitude.data.activePlayer                 = 'ytp';
              j1.adapter.amplitude.data.ytpGlobals['activeIndex']    = songIndex;
              j1.adapter.amplitude.data.ytpGlobals['activePlaylist'] = playlist;            

              // save YT player data for later use (e.g. events)
              j1.adapter.amplitude.data.ytPlayers[playerID].activeIndex = songIndex;
              j1.adapter.amplitude.data.ytPlayers[playerID].videoID     = ytpVideoID;


              // save amplitudejs data for later use (e.g. events)
              // -----------------------------------------------------------------
              // J1 Amplitude optimizations #1
              // BUG FIX: The original wrote the YT player INSTANCE into
              // `activePlayer`. Every other write site sets it to the
              // string 'ytp'. Downstream consumers compare against
              // strings, not objects, so this assignment broke the
              // active-player check exactly while a YT video was paused.
              j1.modules.amplitudejs.data.activePlayer = 'ytp';
              j1.modules.amplitudejs.data.activeIndex = songIndex;
              j1.modules.amplitudejs.data.activePlaylist = playlist;
              j1.modules.amplitudejs.data.ytp.activeIndex = songIndex;
              j1.modules.amplitudejs.data.ytp.activePlaylist = playlist;
              j1.modules.amplitudejs.data.ytp.players[playerID].player = ytPlayer;
              j1.modules.amplitudejs.data.ytp.players[playerID].activeIndex = songIndex;
              j1.modules.amplitudejs.data.ytp.players[playerID].ytpVideoID = ytpVideoID;


              // reset|update current time settings
              resetCurrentTimeContainerYTP(ytPlayer, playlist);
              updateDurationTimeContainerYTP(ytPlayer, playlist);
              resetProgressBarYTP();

              // load the song cover image
              loadCoverImage(songMetaData);

              // update meta data
              // ytpUpdatMetaContainers(songMetaData);

              // set song at songIndex active in playlist
              setSongActive(playlist, songIndex);

              // scroll song active at index in player
              if (playerAutoScrollSongElement) {
                scrollToActiveElement(playlist);
              }

              // save YT player data for later use (e.g. events)
              j1.adapter.amplitude.data.ytPlayers[playerID].activeIndex = songIndex;
              j1.adapter.amplitude.data.ytPlayers[playerID].videoID     = ytpVideoID;   

              return;
            } // END if playerState === PLAYING

            // TOGGLE state 'paused' => 'playing' if video (audio) NOT changed
            if (!isSongIndexChanged && ytPlayerState === 'paused') {
              ytPlayer.playVideo();
              ytpSeekTo(ytPlayer, ytPlayerCurrentTime, true);

              activeSong = getActiveSong();
              // J1 Amplitude optimizations #1
              // CLEANUP: Same dead conditional as in the pause branch
              // above -- all three arms assigned the same values.
              // Reduced to a single assignment.
              songs     = j1.adapter.amplitude.data.ytPlayers[playerID].songs;
              ytPlayer  = j1.adapter.amplitude.data.ytPlayers[playerID].player;

              var trackID = songIndex + 1;
              logger.debug(`PLAY video for PlayerSongContainer on playlist|trackID: ${playlist}|${trackID} at: ${ytPlayerCurrentTime}`);

              var playPauseButtonClass = `large-player-play-pause-${ytPlayerID}`;
              togglePlayPauseButton(playPauseButtonClass);

              // update meta data
              // ytpUpdatMetaContainers(songMetaData);

              // reset|update time settings
              resetCurrentTimeContainerYTP(ytPlayer, playlist);
              updateDurationTimeContainerYTP(ytPlayer, playlist);

              // set song at songIndex active in playlist
              setSongActive(playlist, songIndex);

              return;
            } // END if playerState === PAUSED
        
            if (isSongIndexChanged) {
              // load (next) video
              // -------------------------------------------------------------------
              trackID = songIndex + 1;
              logger.debug(`SWITCH video for PlayerSongContainer at trackID|VideoID: ${trackID}|${ytpVideoID}`);
              loadVideo(playlist, songIndex) 

              // wait for API error state
              setTimeout(() => {
                if (j1.adapter.amplitude.data.ytpGlobals.ytApiError > 0) {
                  var trackID = songIndex + 1;
                  logger.error(`DISABLED player for playlist|trackID: ${playlist}|${trackID} on API error '${YT_PLAYER_ERROR_NAMES[j1.adapter.amplitude.data.ytpGlobals.ytApiError]}'`);

                  // do nothing on API errors
                  return;
                }

                // save YT player data for later use (e.g. events)
                // -------------------------------------------------------------
                ytpSongIndex = songIndex;
                j1.modules.amplitudejs.data.ytp.songIndex = songIndex;

                // save YT player GLOBAL data for later use (e.g. events)
                j1.adapter.amplitude.data.activePlayer = 'ytp';
                j1.adapter.amplitude.data.ytpGlobals['activeIndex'] = songIndex;
                j1.adapter.amplitude.data.ytpGlobals['activePlaylist'] = playlist;            

                // save YT player data for later use (e.g. events)
                j1.adapter.amplitude.data.ytPlayers[playerID].activeIndex = songIndex;
                j1.adapter.amplitude.data.ytPlayers[playerID].videoID     = ytpVideoID;


                // save amplitudejs data for later use (e.g. events)
                // -------------------------------------------------------------
                j1.modules.amplitudejs.data.activePlayer = 'ytp';
                j1.modules.amplitudejs.data.activeIndex = songIndex;
                j1.modules.amplitudejs.data.activePlaylist = playlist;
                j1.modules.amplitudejs.data.ytp.songIndex = songIndex;
                j1.modules.amplitudejs.data.ytp.activeIndex = songIndex;
                j1.modules.amplitudejs.data.ytp.activePlaylist = playlist;
                j1.modules.amplitudejs.data.ytp.players[playerID].player = ytPlayer;
                j1.modules.amplitudejs.data.ytp.players[playerID].activeIndex = songIndex;
                j1.modules.amplitudejs.data.ytp.players[playerID].ytpVideoID = ytpVideoID;


                // reset|update current time settings
                resetCurrentTimeContainerYTP(ytPlayer, playlist);
                updateDurationTimeContainerYTP(ytPlayer, playlist);
                resetProgressBarYTP();

                // load the song cover image
                loadCoverImage(songMetaData);

                // update meta data
                // ytpUpdatMetaContainers(songMetaData);

                var playPauseButtonClass = `large-player-play-pause-${ytPlayerID}`;
                togglePlayPauseButton(playPauseButtonClass);

                // set song at songIndex active in playlist
                setSongActive(playlist, songIndex);

                // scroll song active at index in player
                if (playerAutoScrollSongElement) {
                  scrollToActiveElement(playlist);
                }

                // save YT player data for later use (e.g. events)
                // j1.adapter.amplitude.data.ytPlayers[playerID].activeIndex = songIndex;
                // j1.adapter.amplitude.data.ytPlayers[playerID].videoID     = ytpVideoID;   

                // mute sound after next video load
                // -------------------------------------------------------------------
                if (muteAfterVideoSwitchInterval) {
                  ytPlayer.mute();
                  setTimeout(() => {
                    ytPlayer.unMute();
                  }, muteAfterVideoSwitchInterval);
                }
              }, 100); // END timeout
            } // END if isSongIndexChanged

            // deactivate AJS events (if any)
            event.stopImmediatePropagation();           
        }); // END EventListener
      } // END if classString
    } // END for largePlayerSongContainer

    // add listeners to all progress bars found
    // -------------------------------------------------------------------------
    var progressBars = document.getElementsByClassName("large-player-progress");
    if (progressBars.length) {
      for (var i=0; i<progressBars.length; i++) {
        var classArray    = [].slice.call(progressBars[i].classList, 0);
        var classString   = classArray.toString();
        var progressId    = progressBars[i].id;
        var playerID      = progressId.split('large_player_progress_')[1];
        var progressClass = ('large-player-progress-' + playerID).replace('_large','');

        if (progressBars[i].dataset.amplitudeSource === 'audio') {
          // do nothing (managed by adapter)
        } else {
          var progressBar = progressBars[i];
          if (classString.includes(progressClass)) {
            // save YT player data for later use (e.g. events)
            j1.adapter.amplitude.data.ytPlayers[playerID].progressBar = progressBar;

            progressBars[i].addEventListener('click', function(event) {
              var activeSong, playlist, ytPlayer,
                  playerState, progressBar, percentage, time;               

              activeSong = getActiveSong();
              if (!activeSong) {
                 // do nothing if activeSong data is missing (failsafe)
                return;
              }

              playlist = this.getAttribute("data-amplitude-playlist");
              if (activeSong.playlist !== playlist) {
                // do nothing on PREVIOUS playlist
                return;              
              }

              ytPlayer    = activeSong.player; 
              playerState = ytPlayer.getPlayerState();

              if (playerState === YT_PLAYER_STATE.PLAYING || playerState === YT_PLAYER_STATE.PAUSED || playerState === YT_PLAYER_STATE.BUFFERING) {
                progressBar = this;
                percentage  = getProgressBarSelectedPositionPercentage(event, progressBar);
                time        = getTimeFromPercentage(ytPlayer, percentage);

                // seek video to current time
                // var buffered = ytpSeekTo(ytPlayer, time, true);
                ytpSeekTo(ytPlayer, time, true);
          
                // set current progess value if valid
                if (isFinite(percentage)) {
                  progressBar.value = percentage;
                }
              } // END if ytPlayer

              // deactivate AJS events (if any)
              event.stopImmediatePropagation();   
            }); // END EventListener 'click'
          } // END if classString includes
        } // END if amplitudeSource
      } // END for progressBars
    } // END if progressBars

    // add listeners to all volume sliders found
    // -------------------------------------------------------------------------
    var volumeSliders = document.getElementsByClassName("amplitude-volume-slider");
    for (var i=0; i<volumeSliders.length; i++) {
      if (volumeSliders[i].dataset.amplitudeSource === 'audio') {
        // do nothing (managed by adapter)
      } else {
        if (volumeSliders[i]) {
          var volumeSlider  = volumeSliders[i];
          var sliderID      = volumeSliders[i].id;
          var playerID      = sliderID.split('volume_slider_')[1];

          // save YT player data for later use (e.g. events)
          if (volumeSlider.dataset.amplitudeSource === 'youtube') {
            j1.adapter.amplitude.data.ytPlayers[playerID].volumeSlider = volumeSlider;
          }

          volumeSliders[i].addEventListener('click', function(event) {
            var activeSong = getActiveSong();

            if (!activeSong) {
               // do nothing if activeSong data is missing (failsafe)
              return;
            } 

            var ytPlayer    = activeSong.player; 
            var playerState = ytPlayer.getPlayerState();

            if ((playerState === YT_PLAYER_STATE.PLAYING || playerState === YT_PLAYER_STATE.PAUSED) && ytPlayer !== undefined) {
              var volumeSlider, volumeValue;
              var currenVolume = ytPlayer.getVolume();

              volumeSlider = this;
              volumeValue  = 50;  // default

              if (volumeSlider !== null) {
                volumeValue = parseInt(volumeSlider.value);
              }

              ytPlayer.setVolume(volumeValue);
            } // END if ytPlayer

          }); // END EventListener 'click'
        } // END if volumeSliders
      } // END if volumeSliders
    } // END for volumeSliders

    // add listeners to all mute buttons found
    // -------------------------------------------------------------------------
    var volumeMutes = document.getElementsByClassName("amplitude-mute");
    for (var i=0; i<volumeMutes.length; i++) {
      if (volumeMutes[i].dataset.amplitudeSource === 'audio') {
        // do nothing (managed by adapter)
      } else {    
        if (volumeMutes[i]) {
          var volumMute = volumeMutes[i];
          var sliderID  = volumeMutes[i].id;
          var playerID  = sliderID.split('amplitude-mute_')[1];

          volumeMutes[i].addEventListener('click', function(event) {
            var activeSong = getActiveSong();

            if (!activeSong) {
              // do nothing if activeSong data is missing (failsafe)
              return;
            } 
  
            var ytPlayer            = activeSong.player;
            // J1 Amplitude optimizations #1
            // CLEANUP: The original declared `var playerState` on the line
            // immediately above and then re-declared it three lines later
            // with a different value. The first assignment was unused;
            // removed it. Also folded the magic-6 dance into the proper
            // -1 lookup (Fix #1).
            var volumeSlider        = j1.adapter.amplitude.data.ytPlayers[playerID].volumeSlider;
            var currenVolume        = ytPlayer.getVolume();
            var playerVolumePreset  = parseInt(j1.adapter.amplitude.data.ytPlayers[playerID].playerSettings.volume_slider.preset_value);
            var playerState         = ytPlayer.getPlayerState();
            var ytPlayerState       = YT_PLAYER_STATE_NAMES[playerState] || 'unstarted';

            var isValidPlayerState = /playing|paused/.test(ytPlayerState);
            if (isValidPlayerState && ytPlayer !== undefined) {
              if (currenVolume > 0) {
                volumeSlider.value = 0;
                ytPlayer.setVolume(0);                
              } else {
                volumeSlider.value = playerVolumePreset;
                ytPlayer.setVolume(playerVolumePreset);
              }
            } // END if ytPlayer

          }); // END EventListener 'click'

        } // END if volumeMutes
      } // END if volumeSliders
    } // END for volumeSliders

  } // END if playerSettings.type 'large'

 } // END if j1.adapter.amplitude['data']['ytPlayers'][ytPlayerID] !== undefined
} // END mimikYTPlayerUiEventsForAJS

{%- endcapture -%}

{%- if production -%}
  {{ cache|minifyJS }}
{%- else -%}
  {{ cache|strip_empty_lines }}
{%- endif -%}

{%- assign cache = false -%}