---
regenerate: true
---

{%- capture cache -%}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/modules/amplitudejs/js/plugins/tech/ytp.33.js
 # AmplitudeJS V5 Tech for J1 Template
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2023-2025 Juergen Adams
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
 # ~/assets/theme/j1/modules/amplitudejs/js/plugins/tech/ytp.33.js
 # AmplitudeJS V5 Plugin|Tech for J1 Template
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2023-2025 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 # -----------------------------------------------------------------------------
*/
"use strict";

  // date|time monitoring
  //----------------------------------------------------------------------------
  var startTime;
  var endTime;
  var startTimeModule;
  var endTimeModule;
  var timeSeconds;

  // YT API settings
  // ---------------------------------------------------------------------------

  var YT_PLAYER_ERROR = {
    INVALID_PARAMETER:  2,
    INVALID_PLAYER:     5,
    VIDEO_NOT_ALLOWED:  101,
    VIDEO_NOT_ALLOWED:  150
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

  var YT_PLAYER_STATE_NAMES = {
    0:          "ended",
    1:          "playing",
    2:          "paused",
    3:          "buffering",
    4:          "not_used",
    5:          "cued",
    6:          "unstarted",
  };

  // date|time monitoring
  //----------------------------------------------------------------------------
  var startTime;
  var endTime;
  var startTimeModule;
  var endTimeModule;
  var timeSeconds;

  // AmplitudeJS API settings
  // ---------------------------------------------------------------------------
  var firstScriptTag;
  var ytPlayer;
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
  var playerProperties;
  var playerID;
  var playerType;
  var playListTitle;
  var playListName;
  var amplitudePlayerState;

  var ytPlayer;
  
  
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
    var currentVideoTime,
        playlist, playerID, songIndex, songs,
        trackID, activeVideoID, previousVideoID, isVideoChanged;

    playlist            = activeVideoElement.playlist;
    playerID            = playlist + '_large';
    currentVideoTime    = player.getCurrentTime();
    previousVideoID     = player.options.videoId;
    activeVideoID       = activeVideoElement.videoID;
    songIndex           = activeVideoElement.index;
    trackID             = songIndex + 1;
    songs               = activeVideoElement.songs;

    // check if video is changed (to detect multiple videoIDs in playlist)
    if (songIndex > 0) {
      isVideoChanged = (previousVideoID !== activeVideoID) ? true : false;
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

    // if (!activeVideoElement.audio_single) {
    if (isVideoChanged) {
      // load next video
      logger.debug(`LOAD next VIDEO on processOnVideoEnd at trackID|playlist: ${trackID}|${playlist}`);
      loadNextVideo(playlist, songIndex);
    } else {
      // skip loading next video if a single video is used for playlist
      logger.debug(`LOAD next TRACK in video on processOnVideoEnd at trackID|playlist: ${trackID}|${playlist}`);
    }

  } // END processOnVideoEnd  

  // ---------------------------------------------------------------------------
  // doNothingOnStateChange(state)
  //
  // wrraper for states that are not processed
  // ---------------------------------------------------------------------------
  function doNothingOnStateChange(state) {
    if (state > 0) {
      logger.warn(`DO NOTHING on StateChange for state: ${YT_PLAYER_STATE_NAMES[state]}`);
    } else {
      logger.warn(`DO NOTHING on StateChange for state: ${YT_PLAYER_STATE_NAMES[6]}`);
    }
  } // END doNothingOnStateChange

  // ---------------------------------------------------------------------------
  // processOnStateChangePlaying()
  //
  // wrapper for processing players on state PLAYING 
  // ---------------------------------------------------------------------------
  function processOnStateChangePlaying(event, playlist, songIndex) {
    var activeSong, activePlaylist, playerID, videoID,
        ytPlayer, songs, songIndex,
        currentPlayer, previousPlayer, trackID;

    ytPlayer = event.target;

    // update active song settings (manually)
    checkActiveVideoElementYTP(); 

    // get active song settings (manually)
    activeSong      = getActiveSong();
    
    activePlaylist  = playlist;
    playerID        = activeSong.playerID;
    videoID         = activeSong.videoID;
    songs           = activeSong.songs;
    // songIndex       = activeSong.index;
    currentPlayer   = activeSong.player;
    previousPlayer  = j1.adapter.amplitude.data.ytPlayers[playerID].player
    trackID         = songIndex + 1;

    logger.debug(`PLAY audio on YTP at playlist|trackID: ${activePlaylist}|${trackID}`);
    // logger.debug(`PLAY video on StateChange (playing) at playlist|trackID: ${playList}|${trackID}`);

    // save YT player GLOBAL data for later use (e.g. events)
    j1.adapter.amplitude.data.activePlayer              = 'ytp';
    j1.adapter.amplitude.data.ytpGlobals['activeIndex'] = songIndex;
    j1.adapter.amplitude.data.ytpGlobals['videoID']     = videoID;

    // save YT player data for later use (e.g. events)
    j1.adapter.amplitude.data.ytPlayers[playerID].activeIndex = songIndex;

    // update time container for the ACTIVE video
    // -----------------------------------------------------------------
    setInterval(function() {
      updateCurrentTimeContainerYTP(ytPlayer, playlist);
    }, 500);

    // update time progressbar for the ACTIVE video
    // -----------------------------------------------------------------
    setInterval(function() {
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
    var videoID = event.target.options.videoId;
    var trackID = songIndex + 1;

    // save player current time data for later use
    ytPlayerCurrentTime = ytPlayer.getCurrentTime();

    logger.debug(`NEXT video on StateChange at trackID|VideoID: ${trackID}|${videoID}`);

    // load NEXT song (video) in playlist
    loadNextVideo(playlist, songIndex);

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

    // current fade-in settings using DEFAULTS (if available)
    settings =  {
      playerID:     params.playerID,
      targetVolume: params.targetVolume = 50,
      speed:        params.speed = 'default'
    };    

    // number of iteration steps to INCREASE the players volume on fade-in
    // NOTE: number of steps controls how long and smooth the fade-in 
    // transition will be
    const iterationSteps = {
      'default':  150,
      'slow': 	  250,
      'slower':   350,
      'slowest':  500
    };

    sliderID      = 'volume_slider_' + settings.playerID;
    volumeSlider  = document.getElementById(sliderID);
    steps         = iterationSteps[settings.speed];
    currentStep   = 1;

    if (volumeSlider === undefined || volumeSlider === null) {
      logger.warn('no volume slider found at playerID: ' + settings.playerID);
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

    // current fade-in settings using DEFAULTS (if available)
    settings =  {
      playerID:   params.playerID,
      speed:      params.speed = 'default'
    };

    // number of iteration steps to DECREASE the volume
    const iterationSteps = {
      'default':  150,
      'slow': 	  250,
      'slower':   350,
      'slowest':  500
    };

    sliderID      = 'volume_slider_' + settings.playerID;
    volumeSlider  = document.getElementById(sliderID);
    startVolume   = ytPlayer.getVolume();
    steps         = iterationSteps[settings.speed];
    currentStep   = 0;

    if (volumeSlider === undefined || volumeSlider === null) {
      logger.warn('no volume slider found at playerID: ' + settings.playerID);
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
  // loadNextVideo(list, index)
  //
  // load next video in playlist
  // ---------------------------------------------------------------------------
  function loadNextVideo(currentPlaylist, currentIndex) {
    var activeSongSettings, trackID, songName, playlist, playerID, playerIFrame,
        songs, songIndex, songMetaData, songURL, ytpVideoID;

    // update active song settings (manually)
    checkActiveVideoElementYTP();   

    // get active song settings (manually)
    activeSongSettings = getActiveSong();  

    playlist    = currentPlaylist;
    playerID    = playlist + '_large';
    songs       = activeSongSettings.songs;
    ytPlayer    = activeSongSettings.player;
    songIndex   = currentIndex;
    trackID     = songIndex + 1;

    songIndex++;

    ytpSongIndex  = songIndex;
    
    // play sonng (video) in playlist 
    if (songIndex <= songs.length - 1) {
      songMetaData  = songs[songIndex];
      songURL       = songMetaData.url;
      ytVideoID     = songURL.split('=')[1];

      // save YT player data for later use (e.g. events)
      j1.adapter.amplitude.data.ytPlayers[playerID].activeIndex = songIndex;
      j1.adapter.amplitude.data.ytPlayers[playerID].videoID     = ytVideoID;      

      logger.debug(`SWITCH video on loadNextVideo at trackID|VideoID: ${trackID}|${ytVideoID}`);
      ytPlayer.loadVideoById(ytVideoID);

      // delay after switch video
      if (muteAfterVideoSwitchInterval) {
        ytPlayer.mute();
        setTimeout(() => {
          ytPlayer.unMute();
        }, muteAfterVideoSwitchInterval);
      }

      // update global song index
      ytpSongIndex = songIndex;

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
    } else {
      // continue on FIRST track (video) in playlist
      //
      songIndex         = 0;
      var songMetaData  = songs[songIndex];
      var songURL       = songMetaData.url;
      var ytVideoID     = songURL.split('=')[1];

      // update global song index
      ytpSongIndex = songIndex;

      // load next video (paused)
      // -----------------------------------------------------------------------

      // save YT player data for later use (e.g. events)
      j1.adapter.amplitude.data.ytPlayers[playerID].activeIndex = songIndex;
      j1.adapter.amplitude.data.ytPlayers[playerID].videoID     = ytpVideoID; 

      logger.debug(`SWITCH video on loadNextVideo at trackID|VideoID: ${trackID}|${ytVideoID}`);
      ytPlayer.loadVideoById(ytVideoID);

      // delay after switch video
      if (muteAfterVideoSwitchInterval) {
        ytPlayer.mute();
        setTimeout(() => {
          ytPlayer.unMute();
        }, muteAfterVideoSwitchInterval);
      }

      // load the song cover image
      loadCoverImage(songMetaData);
  
      // update meta data
      // ytpUpdatMetaContainers(songMetaData);
  
      var playPauseButtonClass = `large-player-play-pause-${ytPlayerID}`;
      togglePlayPauseButton(playPauseButtonClass);

      // set song (video) active at index in playlist
      setSongActive(playlist, songIndex);

      // reset progress bar settings
      resetProgressBarYTP();

      // scroll song active at index in player
      if (playerAutoScrollSongElement) {
        scrollToActiveElement(playlist);
      }

      // TODO: check if SHUFFLE is enabled on PLAYLIST (PLAYER ???)
      // set FIRST song (video) paused
      ytPlayer.pauseVideo();
    }

  } // END loadVideo

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
        playerExistsInPage = ($('#' + '{{xhr_container_id}}')[0] !== undefined) ? true : false;
        if (playerExistsInPage) { 
          var playerSettings     = $.extend({}, {{player | replace: 'nil', 'null' | replace: '=>', ':' }});
          var songs              = Amplitude.getSongsStatePlaylist(playerSettings.playlist.name);         
          var activeSongMetadata = songs[0];
          var playerType         = playerSettings.type

          // increase number of found players in page by one
          playerCounter++;     

          // load individual player settings (to manage multiple players in page)
          //
          var ytpVideoID  = activeSongMetadata.url.split('=')[1];
          var ytpAutoPlay = ('{{player.yt_player.autoplay}}'.length > 0) ? '{{player.yt_player.autoplay}}'  : '{{amplitude_defaults.player.yt_player.autoplay}}';
          var ytpLoop     = ('{{player.yt_player.loop}}'.length > 0)     ? '{{player.yt_player.loop}}'      : '{{amplitude_defaults.player.yt_player.loop}}';
          var ytpHeight   = ('{{player.yt_player.height}}'.length > 0)   ? '{{player.yt_player.height}}'    : '{{amplitude_defaults.player.yt_player.height}}';
          var ytpWidth    = ('{{player.yt_player.width}}'.length > 0)    ? '{{player.yt_player.width}}'     : '{{amplitude_defaults.player.yt_player.width}}';

          logger.info('AJS YouTube iFrame API: ready');
          logger.info('configure player on ID: #{{player.id}}');

          // create a hidden YT Player iFrame container
          //
          ytpContainer                = document.getElementById('{{player.id}}_video');
          ytpContainer.innerHTML      = '<div id="iframe_{{player.id}}"></div>';
          ytpContainer.style.cssText  = 'display:none';

          ytPlayer = new YT.Player('iframe_{{player.id}}', {
            height:             ytpHeight,
            width:              ytpWidth,
            videoId:            ytpVideoID,
            // videoId:         'bloedsinn',
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

          logger.info('AJS YouTube Player on ID {{player.id}}: ready');

          // save YT player GLOBAL data for later use (e.g. events)
          j1.adapter.amplitude.data.ytpGlobals['ytPlayerReady'] = ytPlayerReady;
          j1.adapter.amplitude.data.ytpGlobals['ytApiError']    = 0;          

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
            logger.warn('Found NO players of type video (YTP) in page');
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
        var currentPlaylist = songName[i].dataset.amplitudePlaylist;
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
        var playerState   = (player.getPlayerState() > 0) ? player.getPlayerState() : 6;
        var ytPlayerState = YT_PLAYER_STATE_NAMES[playerState];

        // toggle PlayPause buttons playing => puased
        // ---------------------------------------------------------------------
        if (ytPlayerState === 'playing' || ytPlayerState === 'paused') {
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
    var activeSongSettings, ytPlayer, activePlaylist;

    // update active song settings (manually)
    checkActiveVideoElementYTP(); 

    // get active song settings (manually)
    activeSongSettings = getActiveSong();
    if (!activeSongSettings) {
      return false;
    }

    ytPlayer        = activeSongSettings.player;
    activePlaylist  = activeSongSettings.playlist;

    // get current hours|minutes|seconds
    // -------------------------------------------------------------------------
    hours   = ytpGetDurationHours(ytPlayer);
    minutes = ytpGetDurationMinutes(ytPlayer);
    seconds = ytpGetDurationSeconds(ytPlayer);

    // update current duration|hours
    // -------------------------------------------------------------------------
    durationHours = document.getElementsByClassName("amplitude-duration-hours");
    if (durationHours.length && !isNaN(hours)) {
      for (var i=0; i<durationHours.length; i++) {    
        var currentPlaylist = durationHours[i].dataset.amplitudePlaylist;
        if (currentPlaylist === activePlaylist) {
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
        if (currentPlaylist === activePlaylist) {
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
        if (currentPlaylist === activePlaylist) {
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
      for (var i=0; i<currentHours.length; i++) {    
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
  // ytpLoadVideById
  //
  // ???????
  // ---------------------------------------------------------------------------
  function ytpLoadVideoById(player, id, bufferQuote) {
    const cycle = 250;

    player.loadVideoById(id);

    const videoLoaded = setInterval(() => {
      bufferQuote = ytpGetBuffered(player);

      if (bufferQuote >= 3) {
        return true;

        clearInterval(videoLoaded);
      } else {
        return false;
      }
    }, cycle);

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
    var playerState, duration;

    playerState = player.getPlayerState();
    if (playerState === YT_PLAYER_STATE.PLAYING || playerState === YT_PLAYER_STATE.BUFFERING || playerState === YT_PLAYER_STATE.PAUSED || playerState === YT_PLAYER_STATE.CUED) {
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
    var currentTime, playerState;

    if (player !== undefined && player.getPlayerState !== undefined) {
      playerState = player.getPlayerState();
      if (playerState === YT_PLAYER_STATE.PLAYING || playerState === YT_PLAYER_STATE.PAUSED || playerState === YT_PLAYER_STATE.CUED) {
        currentTime = player.getCurrentTime();

        return currentTime;
      } else {
        return 0;
      }
    }
  } // END ytpGetCurrentTime

  // ---------------------------------------------------------------------------
  // ytpGetDurationHours
  //
  // Returns the duration hours of the video
  // ---------------------------------------------------------------------------
  function ytpGetDurationHours(player) {
    var playerState, duration, hours, d, h;

    if (player !== undefined && player.getPlayerState !== undefined) {
      playerState = player.getPlayerState();
      if (playerState === YT_PLAYER_STATE.PLAYING || playerState === YT_PLAYER_STATE.PAUSED || playerState === YT_PLAYER_STATE.CUED ) {
        duration  = ytpGetDuration(player);
        d         = Number(duration);
        h         = Math.floor(d / 3600);
        hours     = h.toString().padStart(2, '0');

        return hours;
      } else {
        return '00';
      }
    }
  } // END ytpGetDurationHours

  // ---------------------------------------------------------------------------
  // ytpGetDurationMinutes
  //
  // Returns the duration minutes of the video
  // ---------------------------------------------------------------------------
  function ytpGetDurationMinutes(player) {
    var playerState, duration, minutes, d, m;

    if (player !== undefined && player.getPlayerState !== undefined) {
      playerState = player.getPlayerState();
      if (playerState === YT_PLAYER_STATE.PLAYING || playerState === YT_PLAYER_STATE.PAUSED || playerState === YT_PLAYER_STATE.CUED) {
        duration  = ytpGetDuration(player);
        d         = Number(duration);
        m         = Math.floor(d % 3600 / 60);
        minutes   = m.toString().padStart(2, '0');

        return minutes;
      } else {
        return '00';
      }
    }
  } // END ytpGetDurationMinutes

  // ---------------------------------------------------------------------------
  // ytpGetDurationSeconds
  //
  // Returns the duration seconds of the video
  // ---------------------------------------------------------------------------
  function ytpGetDurationSeconds(player) {
    var playerState, duration, seconds, d, s;

    if (player !== undefined && player.getPlayerState !== undefined) {
      playerState = player.getPlayerState();
      if (playerState === YT_PLAYER_STATE.PLAYING || playerState === YT_PLAYER_STATE.PAUSED || playerState === YT_PLAYER_STATE.CUED ) {
        duration  = ytpGetDuration(player);
        d         = Number(duration);
        s         = Math.floor(d % 60);
        seconds   = s.toString().padStart(2, '0');

        return seconds;
      } else {
        return '00';
      }
    }
  } // END ytpGetDurationSeconds

  // ---------------------------------------------------------------------------
  // ytpGetCurrentHours
  //
  // Returns the current hours the user is into the video
  // ---------------------------------------------------------------------------
  function ytpGetCurrentHours(player) {
    var playerState, currentTime, hours, d, h;

    if (player !== undefined && player.getPlayerState !== undefined) {
      playerState = player.getPlayerState();
      if (playerState === YT_PLAYER_STATE.PLAYING || playerState === YT_PLAYER_STATE.PAUSED || playerState === YT_PLAYER_STATE.CUED) {
        currentTime = ytpGetCurrentTime(player);
        d           = Number(currentTime);
        h           = Math.floor(d / 3600);
        hours       = h.toString().padStart(2, '0');

        return hours;
      } else {
        return '00';
      }
    }
  } // END ytpGetCurrentHours

  // ---------------------------------------------------------------------------
  // ytpGetCurrentMinutes
  //
  // Returns the current minutes the user is into the video
  // ---------------------------------------------------------------------------
  function ytpGetCurrentMinutes (player) {
    var playerState, currentTime, minutes, d, m;

    if (player !== undefined && player.getPlayerState !== undefined) {
      playerState = player.getPlayerState();
      if (playerState === YT_PLAYER_STATE.PLAYING || playerState === YT_PLAYER_STATE.PAUSED || playerState === YT_PLAYER_STATE.CUED) {
        currentTime = ytpGetCurrentTime(player);
        d           = Number(currentTime);
        m           = Math.floor(d % 3600 / 60);
        minutes     = m.toString().padStart(2, '0');

        return minutes;
      } else {
        return '00';
      }
    }
  } // END ytpGetCurrentMinutes

  // ---------------------------------------------------------------------------
  // ytpGetCurrentSeconds
  //
  // Returns the current seconds the user is into the video
  // ---------------------------------------------------------------------------
  function ytpGetCurrentSeconds(player) {
    var playerState, currentTime, seconds, d, s;

    if (player !== undefined && player.getPlayerState !== undefined) {
      playerState = player.getPlayerState();
      if (playerState === YT_PLAYER_STATE.PLAYING || playerState === YT_PLAYER_STATE.PAUSED || playerState === YT_PLAYER_STATE.CUED ) {
        currentTime = ytpGetCurrentTime(player);
        d           = Number(currentTime);
        s           = Math.floor(d % 60);
        seconds     = s.toString().padStart(2, '0');

        return seconds;
      } else {
        return '00';
      }
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
          var listItemHeight        = playerSongElementHeigth/2;
          var itemsPerBlock         = 1;
          var isScrollingResetDelay = 150;
          var isScrolling           = false;

          playerScrollList.addEventListener('scroll', (event) => {
            // block multiple scroll events (while scrolling)
            if (isScrolling) {
              return; 
            }
            isScrolling = true;

            // calculate number of blocks already scrolled
            const scrolledBlocks = Math.round(list.scrollTop / (listItemHeight * itemsPerBlock));

            // calculate top position based on number of blocks
            const targetScrollTop = scrolledBlocks * listItemHeight * itemsPerBlock;

            // smooth scrolling
            list.scrollTo({
              top: targetScrollTop,
              behavior: 'smooth'
            });

            // reset the scrolling flags
            setTimeout(() => {
              isScrolling = false;
            }, isScrollingResetDelay); 
          });
        }          

        // Overload AJS play_pause button for YT
        // TODO: Fix for multiple players in page
        // ---------------------------------------------------------------------
        var largePlayerPlayPauseButton = document.getElementsByClassName(playerButton);
        for (var i=0; i<largePlayerPlayPauseButton.length; i++) {          
          var classArray  = [].slice.call(largePlayerPlayPauseButton[i].classList, 0);
          var classString = classArray.toString();

          if (classString.includes(ytPlayerID)) {
            largePlayerPlayPauseButton[i].addEventListener('click', function(event) {
              var activeSongSettings, songs, songMetaData, playerData,
                  ytPlayer, playerState, ytPlayerState, playlist,
                  playerID, songIndex;

              playlist            = this.getAttribute("data-amplitude-playlist");
              playerID            = playlist + '_large';

              // update active song settings (manually)
              checkActiveVideoElementYTP();

              // get active song settings (manually)
              activeSongSettings  = getActiveSong();
              if (!activeSongSettings) {
                songIndex     = 0;
                ytpSongIndex  = 0;
              } else {
                if (activeSongSettings.playlist !== playlist) {
                  songIndex    = 0;
                  ytpSongIndex = 0;

                  // reset previous player settings
                  // if (activeSongSettings.player !== undefined) {
                  //   activeSongSettings.player.stopVideo();
                  //   var playPauseButtonClass = `large-player-play-pause-${activeSongSettings.playerID}`;
                  //   togglePlayPauseButton(playPauseButtonClass);                    
                  // }
                } else {
                  songIndex = ytpSongIndex;
                }
              } // END if activeSongSettings

              if (j1.adapter.amplitude.data.ytpGlobals.ytApiError > 0) {
                // do nothing on API errors
                var trackID = songIndex + 1;
                logger.error(`DISABLED player for playlist|trackID: ${playlist}|${trackID} on API error '${YT_PLAYER_ERROR_NAMES[j1.adapter.amplitude.data.ytpGlobals.ytApiError]}'`);

                return;
              }

              // update activeAudio data (manually)
              checkActiveVideoElementYTP();

              // get active song settings (manually)
              // activeSongSettings  = getActiveSong();

              playerData    = j1.adapter.amplitude.data.ytPlayers[playerID];
              ytPlayer      = playerData.player;
              songIndex     = playerData.activeIndex;
              songs         = playerData.songs;

              // update meta data
              // songMetaData = songs[songIndex];
              // ytpUpdatMetaContainers(songMetaData);              

              // save player GLOBAL data for later use (e.g. events)
              j1.adapter.amplitude.data.activePlayer                 = 'ytp';
              j1.adapter.amplitude.data.ytpGlobals['activeIndex']    = songIndex;
              j1.adapter.amplitude.data.ytpGlobals['activePlaylist'] = playlist;

              // toggle YT play|pause video
              // ---------------------------------------------------------------
              playerState   = ytPlayer.getPlayerState();
              ytPlayerState = (playerState < 0) ? YT_PLAYER_STATE_NAMES[6] : YT_PLAYER_STATE_NAMES[playerState];

              // if (playerState < 0) {
              //   var ytPlayerState = YT_PLAYER_STATE_NAMES[6];
              // } else {
              //   var ytPlayerState = YT_PLAYER_STATE_NAMES[playerState];
              // }

              // TOGGLE state 'playing' => 'paused'
              if (ytPlayerState === 'playing') {
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
              } // END if ytPlayerState === 'cued'

              // TODO: unclear why state 'unstarted' is generated
              // on LAST item
              // workaround sofar
              // -------------------------------------------------------------
              // if (ytPlayerState === 'unstarted') {
              //   ytPlayer.playVideo();
              //   // ytPlayer.mute();              
              //  
              //   var playPauseButtonClass = `large-player-play-pause-${ytPlayerID}`;
              //   togglePlayPauseButton(playPauseButtonClass);
              //   resetCurrentTimeContainerYTP(ytPlayer, playlist);
              //   updateDurationTimeContainerYTP(ytPlayer, playlist);                  
              // } // END if ytPlayerState === 'unstarted'               

              // deactivate AJS events (if any)
              event.stopImmediatePropagation();

            }); // END EventListener largePlayerPlayPauseButton 'click
          } // END if classString
        } // END for largePlayerPlayPauseButton

        // Overload AJS largePlayerSkipBackward button for YT
        // TODO: Fix for multiple players in page
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
            }); // END Listener 'click'
          } // END if skip-forward button
        } // END for  

        // Overload AJS largePlayerSkipBackward button for YT
        // TODO: Fix for multiple players in page
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
        // click on (player) next button
        // TODO: Fix for multiple players in page
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
          } // END if

      } // END for largePlayerNextButton

      // Overload AJS largePlayerPrevious button for YT
      // click on (player) previous button
      // TODO: Fix for multiple players in page
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
        } // END if

    } // END for largePlayerNextButton

    // click on song container
    // TODO: Fix for multiple players in page
    // -------------------------------------------------------------------------
    var largePlayerSongContainer = document.getElementsByClassName("amplitude-song-container");
    for (var i=0; i<largePlayerSongContainer.length; i++) {
      var classArray  = [].slice.call(largePlayerSongContainer[i].classList, 0);
      var classString = classArray.toString();

      if (classString.includes(ytPlayerID)) {
        largePlayerSongContainer[i].addEventListener('click', function(event) {
          var activeSongSettings, playlist, playerID, playerState,
              songs, songIndex, songName, singleAudio, trackID,
              ytPlayer, ytpVideoID, activeSongIndex, isSongIndexChanged;

          // set (current) playlist|song data
          playlist            = this.getAttribute("data-amplitude-playlist");
          playerID            = playlist + '_large';
          songIndex           = parseInt(this.getAttribute("data-amplitude-song-index"));
          trackID             = songIndex + 1;
          activeSongIndex     = j1.adapter.amplitude.data.ytPlayers[playerID].activeIndex;
          isSongIndexChanged  = (activeSongIndex !== songIndex) ? true : false;

          // update active song settings (manually)
          checkActiveVideoElementYTP(); 

          // set (current) song meta data
          songs         = j1.adapter.amplitude.data.ytPlayers[playerID].songs;
          songMetaData  = songs[songIndex];
          songURL       = songMetaData.url;
          ytpVideoID    = songURL.split('=')[1];
          // ytpVideoID = 'bloedsinn';
          ytPlayer      = j1.adapter.amplitude.data.ytPlayers[playerID].player;
          playerState   = ytPlayer.getPlayerState();                   

          // TOGGLE state 'playing' => 'paused' if video (audio) NOT changed
          if (playerState === YT_PLAYER_STATE.PLAYING && !isSongIndexChanged) {
            ytPlayer.pauseVideo();
              // get active song settings (manually)
              activeSongSettings = getActiveSong();

              if (activeSongSettings) {
                // ytpCurrentTime = activeSongSettings.currentTime;
                if (activeSongSettings.playlist !== playlist) {
                  // set current player settings
                  songs     = j1.adapter.amplitude.data.ytPlayers[playerID].songs;
                  ytPlayer  = j1.adapter.amplitude.data.ytPlayers[playerID].player;              

                  // reset previous player settings
                  // if (activeSongSettings.player !== undefined) {
                  //   activeSongSettings.player.stopVideo();
                  //   var playPauseButtonClass = `large-player-play-pause-${activeSongSettings.playerID}`;
                  //   togglePlayPauseButton(playPauseButtonClass);                    
                  // }
                } else {
                  // set current player settings
                  songs     = j1.adapter.amplitude.data.ytPlayers[playerID].songs;
                  ytPlayer  = j1.adapter.amplitude.data.ytPlayers[playerID].player;
                }
              } else {
                // set current player settings
                songs     = j1.adapter.amplitude.data.ytPlayers[playerID].songs;
                ytPlayer  = j1.adapter.amplitude.data.ytPlayers[playerID].player;
              }

              ytPlayerCurrentTime = ytPlayer.getCurrentTime();

              var trackID = songIndex + 1;
              logger.debug(`PAUSE video for PlayerSongContainer on playlist|trackID: ${playlist}|${trackID} at: ${ytPlayerCurrentTime}`);

              var playPauseButtonClass = `large-player-play-pause-${ytPlayerID}`;
              togglePlayPauseButton(playPauseButtonClass);

              // reset|update time settings
              resetCurrentTimeContainerYTP(ytPlayer, playlist);
              updateDurationTimeContainerYTP(ytPlayer, playlist);

              // update global song index (start at 0)
              ytpSongIndex  = songIndex;

              // save YT player GLOBAL data for later use (e.g. events)
              j1.adapter.amplitude.data.activePlayer                 = 'ytp';
              j1.adapter.amplitude.data.ytpGlobals['activeIndex']    = songIndex;
              j1.adapter.amplitude.data.ytpGlobals['activePlaylist'] = playlist;            

              // save YT player data for later use (e.g. events)
              j1.adapter.amplitude.data.ytPlayers[playerID].activeIndex = songIndex;
              j1.adapter.amplitude.data.ytPlayers[playerID].videoID     = ytpVideoID;

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
            if (playerState === YT_PLAYER_STATE.PAUSED && !isSongIndexChanged) {
              ytPlayer.playVideo();
              ytpSeekTo(ytPlayer, ytPlayerCurrentTime, true);

              // get active song settings (manually)
              activeSongSettings = getActiveSong();

              if (activeSongSettings) {
                // ytpCurrentTime = activeSongSettings.currentTime;
                if (activeSongSettings.playlist !== playlist) {
                  // set current player settings
                  songs     = j1.adapter.amplitude.data.ytPlayers[playerID].songs;
                  ytPlayer  = j1.adapter.amplitude.data.ytPlayers[playerID].player;              

                  // reset previous player settings
                  // if (activeSongSettings.player !== undefined) {
                  //   activeSongSettings.player.stopVideo();
                  //   var playPauseButtonClass = `large-player-play-pause-${activeSongSettings.playerID}`;
                  //   togglePlayPauseButton(playPauseButtonClass);                    
                  // }
                } else {
                  // set current player settings
                  songs     = j1.adapter.amplitude.data.ytPlayers[playerID].songs;
                  ytPlayer  = j1.adapter.amplitude.data.ytPlayers[playerID].player;
                }
              } else {
                // set current player settings
                songs     = j1.adapter.amplitude.data.ytPlayers[playerID].songs;
                ytPlayer  = j1.adapter.amplitude.data.ytPlayers[playerID].player;
              }

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
              ytPlayer.loadVideoById(ytpVideoID);

              // wait for API error state
              setTimeout(() => {
                if (j1.adapter.amplitude.data.ytpGlobals.ytApiError > 0) {
                  var trackID = songIndex + 1;
                  logger.error(`DISABLED player for playlist|trackID: ${playlist}|${trackID} on API error '${YT_PLAYER_ERROR_NAMES[j1.adapter.amplitude.data.ytpGlobals.ytApiError]}'`);

                  // do nothing on API errors
                  return;
                }

                // update global song index (start at 0)
                ytpSongIndex  = songIndex;

                // save YT player GLOBAL data for later use (e.g. events)
                j1.adapter.amplitude.data.activePlayer                 = 'ytp';
                j1.adapter.amplitude.data.ytpGlobals['activeIndex']    = songIndex;
                j1.adapter.amplitude.data.ytpGlobals['activePlaylist'] = playlist;            

                // save YT player data for later use (e.g. events)
                j1.adapter.amplitude.data.ytPlayers[playerID].activeIndex = songIndex;
                j1.adapter.amplitude.data.ytPlayers[playerID].videoID     = ytpVideoID;

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
                j1.adapter.amplitude.data.ytPlayers[playerID].activeIndex = songIndex;
                j1.adapter.amplitude.data.ytPlayers[playerID].videoID     = ytpVideoID;   

                // mute sound after next video load
                // -------------------------------------------------------------------
                if (muteAfterVideoSwitchInterval) {
                  ytPlayer.mute();
                  setTimeout(() => {
                    ytPlayer.unMute();
                  }, muteAfterVideoSwitchInterval);
                }
              }, 100);
            } // END if isSongIndexChanged

            // deactivate AJS events (if any)
            event.stopImmediatePropagation();           
        }); // END EventListener
      } // END if classString
    } // END for largePlayerSongContainer

    // add listeners to all progress bars found
    // TODO: Fix for multiple players in page
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
              var activeSongSettings, playlist, ytPlayer,
                  playerState, progressBar, percentage, time;

              // update active song settings (manually)
              checkActiveVideoElementYTP();                   

              // get active song settings (manually)
              activeSongSettings = getActiveSong();

              if (!activeSongSettings) {
                // do nothing if current video (audio) item is NOT selected|active
                return;
              }

              playlist = this.getAttribute("data-amplitude-playlist");
              if (activeSongSettings.playlist !== playlist) {
                // do nothing on PREVIOUS playlist (player)
                return;              
              }

              ytPlayer    = activeSongSettings.player; 
              playerState = ytPlayer.getPlayerState();

              //if (playerState === YT_PLAYER_STATE.PLAYING || playerState === YT_PLAYER_STATE.BUFFERING) {
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
    // TODO: Fix for multiple players in page
    // -------------------------------------------------------------------------
    var volumeSliders = document.getElementsByClassName("amplitude-volume-slider");
    for (var i=0; i<volumeSliders.length; i++) {
      if (volumeSliders[i].dataset.amplitudeSource === 'audio') {
        // do nothing (managed by adapter)
        var bla = 1;
      } else {
        if (volumeSliders[i]) {
          // for (var i=0; i<volumeSliders.length; i++) {
            var volumeSlider  = volumeSliders[i];
            var sliderID      = volumeSliders[i].id;
            var playerID      = sliderID.split('volume_slider_')[1];

            volumeSliders[i].addEventListener('click', function(event) {

              // update active song settings (manually)
              checkActiveVideoElementYTP(); 
              
              // get active song settings (manually)
              var activeSongSettings = getActiveSong();

              if (!activeSongSettings) {
                // do nothing if current video (audio) item is NOT selected|active
                return;
              } 
              
              var ytPlayer    = activeSongSettings.player; 
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
          // } // END for
        } // END if volumeSliders
      } // END if volumeSliders
    } // END for volumeSliders

    // add listeners to all mute buttons found
    // TODO: Fix for multiple buttons in page
    // -------------------------------------------------------------------------
    var volumeMutes = document.getElementsByClassName("amplitude-mute");
    for (var i=0; i<volumeMutes.length; i++) {
      if (volumeMutes[i].dataset.amplitudeSource === 'audio') {
        // do nothing (managed by adapter)
        var bla = 1;
      } else {    
        if (volumeMutes[i]) {
          var volumMute = volumeMutes[i];
          var sliderID  = volumeMutes[i].id;
          var playerID  = sliderID.split('amplitude-mute_')[1];

          volumeMutes[i].addEventListener('click', function(event) {

            // update active song settings (manually)
            checkActiveVideoElementYTP();

            // get active song settings (manually)
            var activeSongSettings = getActiveSong();

            if (!activeSongSettings) {
              // do nothing if current video (audio) item is NOT selected|active
              return;
            } 
  
            var ytPlayer            = activeSongSettings.player;
            var playerState         = ytPlayer.getPlayerState();
            var volumeSlider        = j1.adapter.amplitude.data.ytPlayers[playerID].volumeSlider;
            var currenVolume        = ytPlayer.getVolume();
            var playerVolumePreset  = parseInt(j1.adapter.amplitude.data.ytPlayers[playerID].playerSettings.volume_slider.preset_value);
    
            if ((playerState === YT_PLAYER_STATE.PLAYING || playerState === YT_PLAYER_STATE.PAUSED) && ytPlayer !== undefined) {
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