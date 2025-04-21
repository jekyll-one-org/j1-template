---
regenerate: true
---

{%- capture cache -%}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/modules/amplitudejs/js/plugins/tech/ytp.28.js
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
 # ~/assets/theme/j1/modules/amplitudejs/js/plugins/tech/ytp.28.js
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
//------------------------------------------------------------------------------
var startTime;
var endTime;
var startTimeModule;
var endTimeModule;
var timeSeconds;

// YT API settings
// -----------------------------------------------------------------------------
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
};

// AmplitudeJS API settings
// -----------------------------------------------------------------------------


// date|time monitoring
//------------------------------------------------------------------------------
var startTime;
var endTime;
var startTimeModule;
var endTimeModule;
var timeSeconds;

var playerLoop;

var firstScriptTag;
var ytActivePlayer;
var ytPlayerReady       = false;
var ytApiReady          = false;
var logger              = log4javascript.getLogger('j1.adapter.amplitude.tech');

var dependency;
var playerCounter         = 0;
var load_dependencies     = {};

// set default song index to FIRST track (video) in playlist
var songIndex             = 0;
var ytpSongIndex          = 0;

var ytpAutoPlay           = false;
var ytpLoop               = false;

var playLists             = {};
var playersUILoaded       = { state: false };
var apiInitialized        = { state: false };

var amplitudeDefaults     = $.extend({}, {{amplitude_defaults  | replace: 'nil', 'null' | replace: '=>', ':' }});
var amplitudePlayers      = $.extend({}, {{amplitude_players   | replace: 'nil', 'null' | replace: '=>', ':' }});
var amplitudePlaylists    = $.extend({}, {{amplitude_playlists | replace: 'nil', 'null' | replace: '=>', ':' }});
var amplitudeOptions      = $.extend(true, {}, amplitudeDefaults, amplitudePlayers, amplitudePlaylists);

var playerExistsInPage    = false;
var ytpContainer          = null;
var ytpBufferQuote        = 0;
var playerProperties      = {};
var playlistScrollMin     = 5;
var fadeAudio             = false;
var singleAudio           = true;
var delayAfterVideoLoaded;
var playList;
var playerProperties;
var playerID;
var playerType;
var playListTitle;
var playListName;
var amplitudePlayerState;
var ytPlayer;
var ytpPlaybackRate;


var songs;
var songMetaData;
var songURL;
                                                            
var progress;

  // ---------------------------------------------------------------------------
  // Base YT functions and events
  // ===========================================================================

  // ---------------------------------------------------------------------------
  // mergeObject
  // ---------------------------------------------------------------------------
  var mergeObject = function() {
    mergeObject = Object.assign || function mergeObject(t) {
      for (var s, i=1, n=arguments.length; i<n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return mergeObject.apply(this, arguments);
  };

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
  // timestamp2seconds
  // ---------------------------------------------------------------------------
  function timestamp2seconds(timestamp) {
    // split timestamp
    const parts = timestamp.split(':');

    // check timestamp format
    if (parts.length !== 3) {
      // return "invalid timestamp";
      return false;
    }

    // convert parts to integers
    const hours   = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    const seconds = parseInt(parts[2], 10);

    // check valid timestamp values
    if (isNaN(hours) || isNaN(minutes) || isNaN(seconds) ||
        hours   < 0 || hours   > 23 ||
        minutes < 0 || minutes > 59 ||
        seconds < 0 || seconds > 59) {
      return "invalid timestamp";
    }

    const totalSeconds = (hours * 3600) + (minutes * 60) + seconds;
    return totalSeconds;
  } // END timestamp2seconds

  // ---------------------------------------------------------------------------
  // seconds2timestamp
  // ---------------------------------------------------------------------------
  function seconds2timestamp(seconds) {
    const hours         = Math.floor(seconds / 3600);
    const minutes       = Math.floor((seconds % 3600) / 60);
    const remainSeconds = seconds % 60;
    const tsHours       = hours.toString().padStart(2, '0');
    const tsMinutes     = minutes.toString().padStart(2, '0');
    const tsSeconds     = remainSeconds.toString().padStart(2, '0');
  
    return `${tsHours}:${tsMinutes}:${tsSeconds}`;
  } // END seconds2timestamp

  // ---------------------------------------------------------------------------
  // fadeAudioIn
  // ---------------------------------------------------------------------------
  function fadeAudioIn(targetVolume=50, speed='default') {
    var currentStep, steps,
        playerId, sliderId, volumSlider;

    const cycle = 1;

    // number of iteration steps to INCREASE the volume to targetVolume
    const speedSteps = {
      'default':  150,
      'slow': 	  250,
      'slower':   350
    };

    playerId    = 'manon_melodie_yt_large';
    sliderId    = 'volume_slider_' + playerId;
    volumSlider = document.getElementById(sliderId);

    steps       = speedSteps[speed];
    currentStep = 1;

    (ytPlayer.isMuted()) && ytPlayer.unMute();

    // skip fade-in when volume is already at target value
    if (ytPlayer.getVolume() >= targetVolume) {
      logger.warn('\n' + 'skipped fade-in for current video on volume: ', targetVolume);
      return;
    }

    if (volumSlider !== null) {
      const fadeInInterval = setInterval(() => {
        const newVolume = targetVolume * (currentStep / steps);

        ytPlayer.setVolume(newVolume);
        volumSlider.value = newVolume;
        currentStep++;

        (currentStep > steps) && clearInterval(fadeInInterval);
      }, cycle);
    } // END if volumSlider

  } // END fadeAudioIn

  // ---------------------------------------------------------------------------
  // fadeAudioOut
  // ---------------------------------------------------------------------------
  function fadeAudioOut(speed='default') {
    var currentStep, steps, newVolume, startVolume,
        playerId, sliderId, volumSlider;

    const cycle = 1;

    // number of iteration steps to DECREASE the volume
    const speedSteps = {
      'default':  100,
      'slow': 	  200,
      'slower':   300
    };

    playerId    = 'manon_melodie_yt_large';
    sliderId    = 'volume_slider_' + playerId;
    volumSlider = document.getElementById(sliderId);

    startVolume = ytPlayer.getVolume();
    steps       = speedSteps[speed];
    currentStep = 0;

    if (volumSlider !== null) {
      const fadeOutInterval = setInterval(() => {
        newVolume = startVolume * (1 - currentStep / steps);

        ytPlayer.setVolume(newVolume);
        volumSlider.value = newVolume;
        currentStep++;

        (currentStep > steps) && clearInterval(fadeOutInterval);
      }, cycle);
    } // END if volumSlider

  } // END fadeAudioOut

  // ---------------------------------------------------------------------------
  // initYtAPI
  //
  // load YT Iframe player API
  // ---------------------------------------------------------------------------
  function initYtAPI() {
    startTimeModule = Date.now();

    logger.info('\n' + 'Initialize plugin|tech (ytp) : started');

    // Load YT IFrame Player API asynchronously
    // -------------------------------------------------------------------------
    var tag         = document.createElement('script');
    tag.src         = "//youtube.com/iframe_api";
    firstScriptTag  = document.getElementsByTagName('script')[0];

    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  }

  // ---------------------------------------------------------------------------
  // ytStopAllActivePlayers
  //
  // ???
  // ---------------------------------------------------------------------------
  function ytStopAllActivePlayers() {

    j1.adapter.amplitude['data']['ytPlayers']['ephraim_kishon_familien_geschichten_yt_large'].player.mute();
    j1.adapter.amplitude['data']['ytPlayers']['ephraim_kishon_familien_geschichten_yt_large'].player.stopVideo();
    j1.adapter.amplitude['data']['ytPlayers']['ephraim_kishon_familien_geschichten_yt_large'].player.unMute();

    j1.adapter.amplitude['data']['ytPlayers']['ephraim_kishon_autofahrer_geschichten_yt_large'].player.mute();
    j1.adapter.amplitude['data']['ytPlayers']['ephraim_kishon_autofahrer_geschichten_yt_large'].player.stopVideo();
    j1.adapter.amplitude['data']['ytPlayers']['ephraim_kishon_autofahrer_geschichten_yt_large'].player.unMute();

  } // END ytStopAllActivePlayers

  // ---------------------------------------------------------------------------
  // nextVideo
  //
  // calculate|play next video in playlist
  // ---------------------------------------------------------------------------
  function nextVideo(playlist, videoID) {
    var trackID;
    var coverImage;
    var selector;
    var songName;
    var songMetaData;
    var songURL;
    var ytpVideoID;
    var artistName;
    var albumName;
    var playlist;
    var player;
    var ytPlayerID;
    var songs;
    var songIndex;
    var activePlayer;
    var ytPlayer;

    // playlist        = j1.adapter.amplitude.data.ytpGlobals.activePlaylist;
    playerID        = playlist + '_large';
    player          = playlist + '_large';
    ytPlayerID      = playlist + '_large';
    songs           = j1.adapter.amplitude.data.ytPlayers[player].songs;
    ytPlayer        = j1.adapter.amplitude.data.ytPlayers[player].player;
    ytActivePlayer  = ytPlayer;
    songIndex       = ytpSongIndex + 1;
    ytpSongIndex    = songIndex;
    trackID         = songIndex + 1;

    // play NEXT song (video) in playlist 
    if (songIndex <= songs.length - 1) {
      songMetaData  = songs[songIndex];
      songURL       = songMetaData.url;
      ytpVideoID    = songURL.split('=')[1];
      
      // activePlayer  =  j1.adapter.amplitude['data']['ytPlayers'][playerID].player;
      // ytPlayer      = activePlayer;

      
      // activePlayer  = j1.adapter.amplitude.data.ytpGlobals.activePlayer;
      // var activeVideoData  = activePlayer.getVideoData();
      // if (typeof activeVideoData !== 'undefined') {
      //   var activeVideoID    = activeVideoData.video_id;
      // }

      // if (typeof ytPlayer !== 'undefined') {
      //   var currentVideoData = ytPlayer.getVideoData();
      //   var currentVideoID   = currentVideoData.video_id;
      // }

      // load next video
      logger.debug('\n' + 'switch video at track|ID: ', trackID + '|' + ytpVideoID);
      
      // ytPlayer.loadVideoById(ytpVideoID);
      ytPlayer.stopVideo();
      ytPlayer.loadVideoById(videoID);

      // delay after switch video
      if (delayAfterVideoLoaded) {
        ytPlayer.mute();
        setTimeout(() => {
          ytPlayer.unMute();
        }, delayAfterVideoLoaded);
      }

      // reset|update time settings
      resetCurrentTimeContainerYTP();
      updateDurationTimeContainerYTP(ytPlayer, playerID);
      resetProgressBarYTP(playerID);

      // update global song index
      ytpSongIndex = songIndex;

      // save YT player GLOBAL data for later use (e.g. events)
      j1.adapter.amplitude.data.ytpGlobals['activeIndex'] = songIndex;
      j1.adapter.amplitude.data.ytpGlobals['videoID']     = ytpVideoID;
  
      // save YT player data for later use (e.g. events)
      j1.adapter.amplitude.data.ytPlayers[playerID].activeIndex = songIndex;

      // load cover image
      selector       = ".cover-image-" + playlist;
      coverImage     = document.querySelector(selector);
      coverImage.src = songMetaData.cover_art_url;

      // replace song name in meta-containers
      songName              = document.getElementsByClassName("song-name");
      songName[0].innerHTML = songMetaData.name; // player-bottom
      songName[1].innerHTML = songMetaData.name; // playlist-screen-controls
  
      // replace song rating (playlist-screen|meta-container)
      var largetPlayerSongAudioRating = document.getElementsByClassName("audio-rating");
      if (largetPlayerSongAudioRating.length) {
        if (songMetaData.rating) {
          largetPlayerSongAudioRating[0].innerHTML = '<img src="/assets/image/pattern/rating/scalable/' + songMetaData.rating + '-star.svg"' + 'alt="song rating" style="margin-top: 5px;">';
        } else {
          largetPlayerSongAudioRating[0].innerHTML = '';
        }
      } // END if largetPlayerSongAudioRating
  
      // replace artist name in meta-containers
      artistName              = document.getElementsByClassName("artist");
      artistName[0].innerHTML = songMetaData.artist;
  
      // replace album name in meta-containers
      albumName              = document.getElementsByClassName("album");
      albumName[0].innerHTML = songMetaData.album;
  
      // set song (video) active in playlist
      setSongPlayed(playerID, songIndex);
    } else {
      // continue on FIRST track (video) in playlist
      //
      songIndex     = 0;
      trackID       = songIndex + 1;
      songMetaData  = songs[songIndex];
      songURL       = songMetaData.url;
      ytpVideoID    = songURL.split('=')[1];
  
      // update global song index
      ytpSongIndex = songIndex;

      // save YT player data for later use (e.g. events)
      j1.adapter.amplitude.data.ytPlayers[playerID].activeIndex = songIndex;
      j1.adapter.amplitude.data.ytPlayers[playerID].videoID     = ytpVideoID;
  
      logger.debug('\n' + 'switch video at track|ID: ', trackID + '|' + ytpVideoID);
      ytPlayer.loadVideoById(ytpVideoID);

      // continue on FIRST video ..
      if (playerLoop) {
        // continue on FIRST video PLAYING
        logger.debug('\n' + 'continue video playing at track|ID: ', trackID + '|' + ytpVideoID);
      } else {
        // continue on FIRST video PAUSED
        logger.debug('\n' + 'continue video paused at track|ID: ', trackID + '|' + ytpVideoID);
        ytPlayer.pauseVideo();
      }

      // delay after switch video
      if (delayAfterVideoLoaded) {
        ytPlayer.mute();
        setTimeout(() => {
          ytPlayer.unMute();
        }, delayAfterVideoLoaded);
      }

      // reset|update time settings
      resetCurrentTimeContainerYTP();
      updateDurationTimeContainerYTP(ytPlayer, playerID);
      resetProgressBarYTP(playerID);
  
      // set AJS play_pause button paused
      var playPauseButtonClass = `large-player-play-pause-${ytPlayerID}`;
      setPlayPauseButtonPaused(playPauseButtonClass);

      // load cover image
      selector       = ".cover-image-" + playlist;
      coverImage     = document.querySelector(selector);
      coverImage.src = songMetaData.cover_art_url;              
  
      // replace name in meta-containers
      songName              = document.getElementsByClassName("song-name");
      songName[0].innerHTML = songMetaData.name; // player-bottom
      songName[1].innerHTML = songMetaData.name; // playlist-screen-controls
  
      // replace song rating (playlist-screen|meta-container)
      var largetPlayerSongAudioRating = document.getElementsByClassName("audio-rating");
      if (largetPlayerSongAudioRating.length) {
        if (songMetaData.rating) {
          largetPlayerSongAudioRating[0].innerHTML = '<img src="/assets/image/pattern/rating/scalable/' + songMetaData.rating + '-star.svg"' + 'alt="song rating" style="margin-top: 5px;">';
        } else {
          largetPlayerSongAudioRating[0].innerHTML = '';
        }
      } // END if largetPlayerSongAudioRating
  
      // replace artist name in meta-containers
      artistName           = document.getElementsByClassName("artist");
      artistName.innerHTML = songMetaData.artist;
  
      // replace album name in meta-containers
      albumName           = document.getElementsByClassName("album");
      albumName.innerHTML = songMetaData.album;
  
      // set AJS play_pause button paused
      var playPauseButtonClass = `large-player-play-pause-${ytPlayerID}`
      setPlayPauseButtonPaused(playPauseButtonClass);

      // set song (video) active in playlist
      setSongPlayed(playerID, songIndex);
    }

  } // END nextVideo

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
        logger.info('\n' + 'Initialize APIPlayers : ready');
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
        //
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

          logger.info('\n' + 'AJS YouTube iFrame API: ready');
          logger.info('\n' + 'configure player on ID: #{{player.id}}');

          // create a hidden YT Player iFrame container
          //
          ytpContainer                = document.getElementById('{{player.id}}_video');
          ytpContainer.innerHTML      = '<div id="iframe_{{player.id}}"></div>';
          ytpContainer.style.cssText  = 'display:none';

          var ytPlayer = new YT.Player('iframe_{{player.id}}', {
            height:             ytpHeight,
            width:              ytpWidth,
            videoId:            ytpVideoID,
            playerVars: {
              autoplay:         ytpAutoPlay,
              loop:             ytpLoop
            },
            events: {
              'onReady':                  {{player.id}}OnPlayerReady,
              'onStateChange':            {{player.id}}OnPlayerStateChange
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

        // function checkPlayingStatus(player) {
        //   if (player.getPlayerState() === YT_PLAYER_STATE.PLAYING) {
        //     // code run after video is playing
        //     // console.debug("checkPlayingStatus: AJS YouTube Player state: PLAYING");
        //     // do nothing
        //     return;
        //   } else {
        //     // re-check player state required
        //     // console.debug("checkPlayingStatus: AJS YouTube Player state:", player.getPlayerState());
        //   }
        // } // END checkPlayingStatus

        // run AJS YouTube Player initialization
        // ---------------------------------------------------------------------
        function {{player.id}}OnPlayerReady(event) {
          var hours, minutes, seconds,
              ytPlayer, ytPlayerReady, playerVolumePreset,
              playListName, songsInPlaylist, titleListLargePlayer;

          ytPlayer              = event.target;
          ytPlayerReady         = true;
          playerVolumePreset    = parseInt({{player.volume_slider.preset_value}});
          playerLoop            = ('{{player.loop}}' === 'true') ? true: false;

          // collect default|player settings for delayAfterVideoLoaded
          delayAfterVideoLoaded = (parseInt({{amplitude_defaults.player.delay_after_video_loaded}}) > 0) ? parseInt({{amplitude_defaults.player.delay_after_video_loaded}}) : false;
          delayAfterVideoLoaded = (parseInt({{player.delay_after_video_loaded}}) > 0) ? parseInt({{player.delay_after_video_loaded}}) : delayAfterVideoLoaded;

          // logger.debug('\n' + 'current video ready at ID: {{player.id}}');
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

            if (songsInPlaylist.length <= playlistScrollMin) {
              if (titleListLargePlayer !== null) {
                titleListLargePlayer.classList.add('hide-scrollbar');
              }
            }
          }

          logger.info('\n' + 'AJS YouTube Player on ID {{player.id}}: ready');

          // save YT player GLOBAL data for later use (e.g. events)
          j1.adapter.amplitude.data.ytpGlobals['ytPlayerReady'] = ytPlayerReady;

          // save YT player data for later use (e.g. events)
          j1.adapter.amplitude.data.ytPlayers.{{player.id}}.playerReady = ytPlayerReady;
          j1.adapter.amplitude.data.ytPlayers.{{player.id}}.player = ytPlayer;

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

          logger.info('\n' + 'Initialize plugin|tech (ytp) : finished');

          if (playerCounter > 0) {
            logger.info('\n' + 'Found players of type video (YTP) in page: ' + playerCounter);
          } else {
            logger.warn('\n' + 'Found NO players of type video (YTP) in page');
          }

          logger.info('\n' + 'plugin|tech initializing time: ' + (endTimeModule-startTimeModule) + 'ms');

        } // END onPlayerReady()

        // ---------------------------------------------------------------------
        // OnPlayerStateChange
        //
        // update YT player on state change        
        // ---------------------------------------------------------------------
        function {{player.id}}OnPlayerStateChange(event) {
          var currentTime, playlist, playerID, ytPlayer, ytPlayerState, 
              songs, songIndex, songMetaData, songURL,
              ytpVideoID, trackID;

          ytPlayer      = event.target;
          ytPlayerState = (YT_PLAYER_STATE_NAMES[event.data] > 0) ? YT_PLAYER_STATE_NAMES[event.data] : 'unstarted';
          playlist      = j1.adapter.amplitude.data.ytPlayers.{{player.id}}.playerSettings.playlist.name;
          playerID      = playlist + '_large';
          songs         = j1.adapter.amplitude.data.ytPlayers.{{player.id}}.songs;
          songIndex     = j1.adapter.amplitude.data.ytPlayers.{{player.id}}.activeIndex;
          trackID       = songIndex + 1;
          songMetaData  = songs[songIndex];
          songURL       = songMetaData.url;
          ytpVideoID    = songURL.split('=')[1];

          // save YT player GLOBAL data for later use (e.g. events)
          // j1.adapter.amplitude.data.ytpGlobals['activePlayer']   = ytPlayer;
          // j1.adapter.amplitude.data.ytpGlobals['activeIndex']    = ytpSongIndex;
          // j1.adapter.amplitude.data.ytpGlobals['activePlaylist'] = playlist;   

          // save YT player data for later use (e.g. events)
          j1.adapter.amplitude.data.ytPlayers.{{player.id}}.player      = ytPlayer;
          // j1.adapter.amplitude.data.ytPlayers.{{player.id}}.activeIndex = ytpSongIndex;

          // reset time container|progressbar for the ACTIVE song (video)
          // -------------------------------------------------------------------          
          resetCurrentTimeContainerYTP();
          updateDurationTimeContainerYTP(ytPlayer, playerID);
          resetProgressBarYTP(playerID);

          if (event.data === -1) {
            logger.debug('\n' + 'video at track|state: '   + trackID + '|' + ytPlayerState);
            logger.debug('\n' + 'start video at track|videoID: ' + trackID + '|' + ytpVideoID);

            ytPlayer.loadVideoById(ytpVideoID);

            return;
          } 

          if (event.data === YT_PLAYER_STATE.CUED) {
            // var playlist   = j1.adapter.amplitude.data.ytPlayers[player].playerSettings.playlist.name;
            // var playlist   = j1.adapter.amplitude.data.ytpGlobals.activePlaylist;
            // var player     = playlist + '_large';
            // var songs      = j1.adapter.amplitude.data.ytPlayers[playerID].songs;
            // var songIndex  = j1.adapter.amplitude.data.ytPlayers[playerID].activeIndex;
            // var songIndex  = j1.adapter.amplitude.data.ytpGlobals.activeIndex;
            // var trackID    = songIndex + 1;            

            logger.debug('\n' + 'video at track|state: ' + trackID + '|' + ytPlayerState);
            logger.debug('\n' + 'video at track|videoID: ' + trackID + '|' + ytpVideoID);

            return;
          }

          if (event.data == YT_PLAYER_STATE.BUFFERING) {
            // var playlist   = j1.adapter.amplitude.data.ytPlayers[player].playerSettings.playlist.name;
            // var playlist   = j1.adapter.amplitude.data.ytpGlobals.activePlaylist;
            // var player     = playlist + '_large';
            // var songs      = j1.adapter.amplitude.data.ytPlayers[playerID].songs;
            // var songIndex  = j1.adapter.amplitude.data.ytPlayers[playerID].activeIndex;
            // var songIndex  = j1.adapter.amplitude.data.ytpGlobals.activeIndex;
            // var trackID    = songIndex + 1;

            logger.debug('\n' + 'video at track|state: '   + trackID + '|' + ytPlayerState);
            logger.debug('\n' + 'video at track|videoID: ' + trackID + '|' + ytpVideoID);

            return;
          } 

          if (event.data === YT_PLAYER_STATE.PAUSED) {
            // var playlist   = j1.adapter.amplitude.data.ytPlayers[player].playerSettings.playlist.name;
            // var playlist   = j1.adapter.amplitude.data.ytpGlobals.activePlaylist;
            // var player     = playlist + '_large';
            // var songs      = j1.adapter.amplitude.data.ytPlayers[playerID].songs;
            // var songIndex  = j1.adapter.amplitude.data.ytPlayers[playerID].activeIndex;
            // var songIndex  = j1.adapter.amplitude.data.ytpGlobals.activeIndex;            
            // var trackID    = songIndex + 1;

            // logger.debug('\n' + 'current video state: ' + YT_PLAYER_STATE_NAMES[event.data]);
            logger.debug('\n' + 'video at track|state: '   + trackID + '|' + ytPlayerState);
            logger.debug('\n' + 'video at track|videoID: ' + trackID + '|' + ytpVideoID);

            return;
          }

          if (event.data === YT_PLAYER_STATE.PLAYING) {
            // var activeIndex    = getSongPlayed();
            // var activeVideoID  = j1.adapter.amplitude.data.ytpGlobals.activePlayer.playerInfo.videoData.video_id;
            // var playlist       = j1.adapter.amplitude.data.ytPlayers[player].playerSettings.playlist.name;
            // var playlist       = j1.adapter.amplitude.data.ytpGlobals.activePlaylist;
            // var player         = playlist + '_large';
            // var songs          = j1.adapter.amplitude.data.ytPlayers[playerID].songs;
            // var songIndex      = j1.adapter.amplitude.data.ytPlayers[playerID].activeIndex;
            // var songIndex      = j1.adapter.amplitude.data.ytpGlobals.activeIndex;

            var songStart     = songs[songIndex].start;
            var songEnd       = songs[songIndex].end;
            var songStartSec  = timestamp2seconds(songStart);
            var songEndSec    = timestamp2seconds(songEnd);

            // var trackID       = songIndex + 1;
            // var songMetaData  = songs[songIndex];
            // var songURL       = songMetaData.url;
            // var ytpVideoID    = songURL.split('=')[1];            

            // save YT player GLOBAL data for later use (e.g. events)
            // j1.adapter.amplitude.data.ytpGlobals['activeIndex'] = songIndex;
            // j1.adapter.amplitude.data.ytpGlobals['videoID']     = ytpVideoID;

            // save YT player data for later use (e.g. events)
            j1.adapter.amplitude.data.ytPlayers[playerID].activeIndex = songIndex;

            // update time container|progressbar for the ACTIVE song (video)
            // -----------------------------------------------------------------
            setInterval(updateCurrentTimeContainerYTP, 1000);
            setInterval(updateProgressBarsYTP, 1000);

            if (songStartSec) {
              var tsStartSec       = seconds2timestamp(songStartSec);
              var currentVideoTime = ytPlayer.getCurrentTime();

              // check|process video for configured START position
              if (currentVideoTime <= songStartSec) {

                // seek video to START position
                ytpSeekTo(ytPlayer, songStartSec, true);
                logger.debug('\n' + 'start video at track|timestamp: ' + trackID + '|' + tsStartSec);
                logger.debug('\n' + 'start video at track|videoID: '   + trackID + '|' + ytpVideoID);

                // audio FadeIn on song position START
                fadeAudio && fadeAudioIn();
                //logger.debug('\n' + 'fade-in current video at track|second: ' + trackID + '|' + songStartSec);

              } // END if songStartSec
            }

            // check|process video for configured END position
            // -----------------------------------------------------------------
            if (songEndSec) {
 
              var checkOnVideoEnd = setInterval(function() {
                // var playlist       = j1.adapter.amplitude.data.ytPlayers[player].playerSettings.playlist.name;
                // var playlist       = j1.adapter.amplitude.data.ytpGlobals.activePlaylist;
                // var songIndex      = j1.adapter.amplitude.data.ytPlayers[playerID].activeIndex;
                // var songIndex      = j1.adapter.amplitude.data.ytpGlobals.activeIndex;
                // var player         = playlist + '_large';
                // var songs          = j1.adapter.amplitude.data.ytPlayers[playerID].songs;
                // var trackID        = songIndex + 1;
                
                var songEnd           = songs[songIndex].end;
                var songEndSec        = timestamp2seconds(songEnd);
                var tsEndSec          = seconds2timestamp(songEndSec);
                
                var currentVideoTime  = ytPlayer.getCurrentTime();

                var songMetaData      = songs[songIndex];
                var songURL           = songMetaData.url;
                var ytpVideoID        = songURL.split('=')[1];                 

                if (currentVideoTime >= songEndSec) {
                  // fade-out audio on video|song END
                  fadeAudio && fadeAudioOut();
                  // logger.debug('\n' + 'fade-out current video at track|second: ' + trackID + '|' + songEndSec);

                  // mute audio on LAST video
                  if (songIndex === songs.length - 1) {
                    ytPlayer.mute();
                  }

                  // stop|load current|next video
                  logger.debug('\n' + 'stop video at track|timestamp: ' + trackID + '|' + tsEndSec);
                  logger.debug('\n' + 'stop video at track|videoID: '   + trackID + '|' + ytpVideoID);
                  nextVideo(playlist, ytpVideoID);

                  clearInterval(checkOnVideoEnd);
                }
              }, 250);

            } // END if songEndSec

            return;
          } // END YT_PLAYER_STATE PLAYING

          // load|play NEXT|FIRST song (video) in playlist
          // -------------------------------------------------------------------
          if (event.data === YT_PLAYER_STATE.ENDED) {
            var ytPlayer      = event.target;
            var playlist      = j1.adapter.amplitude.data.ytPlayers[player].playerSettings.playlist.name;

            if (fadeAudio) {
              if (ytPlayer.getVolume() === 0) {
                fadeAudioIn();
              }
            }
            nextVideo(playlist, ytpVideoID);

            return;
          } // END if YT_PLAYER_STATE.ENDED

        } // END {{player.id}}OnPlayerStateChange

      {% endif %}
    {% endif %}{% endfor %}

  } // END onYouTubeIframeAPIReady ()


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
  // setSongPlayed
  //
  // Add class 'amplitude-active-song-container' to the element containing
  // visual information for the active song.  
  // ---------------------------------------------------------------------------
  function setSongPlayed(playerID, index) {
    var direct;

    // Specify if it was a (direct) click on the song container
    direct = true;

    // Get all song container elements
    var songContainers = document.getElementsByClassName("amplitude-song-container");
    
    // Clear all active song containrs
    for (var i = 0; i < songContainers.length; i++) {
      songContainers[i].classList.remove("amplitude-active-song-container");
    }

    // Find the active index and add the active song container to the element
    // that represents the song at the index.
    //
    if (Amplitude.getActivePlaylist() == "" || Amplitude.getActivePlaylist() == null) {
      var activeIndex = "";

      // If we click directly on the song element, we ignore
      // whether it's in shuffle or not.
      //
      if (direct) {
        activeIndex = index;
      } else {
        if (Amplitude.getConfig().shuffle_on) {
          // tbd
        } else {
        activeIndex = index;
        }
      }

      // activate playlist container
      if (document.querySelectorAll('.amplitude-song-container[data-amplitude-song-index="' + activeIndex + '"]')) {
        var _songContainers = document.querySelectorAll('.amplitude-song-container[data-amplitude-song-index="' + activeIndex + '"]');          
        for (var _i = 0; _i < _songContainers.length; _i++) {
          if (_songContainers[_i].hasAttribute("data-amplitude-playlist")) {
            var _playerID = _songContainers[_i].getAttribute("data-amplitude-playlist") + '_large';
            if (_playerID === playerID) {
              _songContainers[_i].classList.add("amplitude-active-song-container");
            }
          }
        }
      }
    } else {
      //  If we have an active playlist or the action took place directly on the
      //  song element, we ignore the shuffle.
      //
      if (Amplitude.getActivePlaylist() != null && Amplitude.getActivePlaylist() != "" || direct) {
        var activePlaylistIndex = Amplitude.getActiveIndex();
      } else {
        var activePlaylistIndex = "";

        if (Amplitude.getActivePlaylist().shuffle) {
          activePlaylistIndex = Amplitude.getActiveIndex();
        } else {
          activePlaylistIndex = Amplitude.getActiveIndex();
        }
      } // END if
    } // END if

  } // END setSongPlayed

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
  // updateProgressBarsYTP
  //
  // Update YTP specific progress data
  // ---------------------------------------------------------------------------
  function updateProgressBarsYTP() {
    var progress;

    var progressBars = document.getElementsByClassName("large-player-progress");
    for (var i=0; i<progressBars.length; i++) {
      var classArray      = [].slice.call(progressBars[i].classList, 0);
      var classString     = classArray.toString();
      var progressBar     = progressBars[i];
      var progressId      = progressBars[i].id;
      var playerId        = progressId.split('large_player_progress_')[1];
      var ytPlayer        = j1.adapter.amplitude.data.ytPlayers[playerId].player;
      var activePlaylist  = j1.adapter.amplitude.data.ytPlayers[playerId].playerSettings.playlist.name;

      if (classString.includes(activePlaylist)) {
      // if (activePlayer !== undefined) {
        // calc procent value (float, 2 decimals [0.00 .. 1.00])
        progress = parseFloat((ytPlayer.getCurrentTime() / ytPlayer.getDuration()).toFixed(2));
        
        // set current progess value if valid
        if (isFinite(progress)) {
          progressBars[i].value = progress;
        }
      }
    } // END for
  } // END updateProgressBarsYTP

  // ---------------------------------------------------------------------------
  // updateDurationTimeContainerYTP
  //
  // Update YTP specific duration time data  
  // ---------------------------------------------------------------------------
  function updateDurationTimeContainerYTP(player, playerID) {
    var hours, minutes, seconds;
    var durationHours, durationMinutes, durationSeconds;

    // get current hours|minutes|seconds
    hours   = ytpGetDurationHours(player);
    minutes = ytpGetDurationMinutes(player);
    seconds = ytpGetDurationSeconds(player);

    // update time container values for current video
    // -------------------------------------------------------------------------

    // update current duration|hours
    durationHours = document.getElementsByClassName("amplitude-duration-hours");
    if (durationHours.length && !isNaN(hours)) {
      durationHours[0].innerHTML = hours;
    }

    // update current duration|minutes
    durationMinutes = document.getElementsByClassName("amplitude-duration-minutes");
    if (durationMinutes.length && !isNaN(minutes)) {
      durationMinutes[0].innerHTML = minutes;
    }

    // update duration|seconds
    durationSeconds = document.getElementsByClassName("amplitude-duration-seconds");
    if (durationSeconds.length && !isNaN(seconds)) {
      durationSeconds[0].innerHTML = seconds;
    }
  } // END updateDurationTimeContainerYTP

  // ---------------------------------------------------------------------------
  // updateCurrentTimeContainerYTP
  //
  // Update YTP specific CURRENT time data  
  // ---------------------------------------------------------------------------
  function updateCurrentTimeContainerYTP() {
    var hours, minutes, seconds;
    var currentHours, currentMinutes, currentSeconds;

    // get current hours|minutes|seconds
    hours   = ytpGetCurrentHours(ytActivePlayer);
    minutes = ytpGetCurrentMinutes(ytActivePlayer);
    seconds = ytpGetCurrentSeconds(ytActivePlayer);

    // set GLOBAL player current time
    // ytPlayerCurrentTime = ytPlayer.getCurrentTime();

    // update time container values for current video
    // -------------------------------------------------------------------------

    // update current duration|hours
    if (hours !== '00') {
      currentHours = document.getElementsByClassName("amplitude-current-hours");
      currentHours[0].innerHTML = hours;
    }

    // update current duration|minutes
    currentMinutes = document.getElementsByClassName("amplitude-current-minutes");
    currentMinutes[0].innerHTML = minutes;

    // update duration|seconds
    currentSeconds = document.getElementsByClassName("amplitude-current-seconds");
    currentSeconds[0].innerHTML = seconds;

  } // END updateCurrentTimeContainerYTP

  // ---------------------------------------------------------------------------
  // resetProgressBarYTP
  //
  // Reset YTP specific progress data
  // ---------------------------------------------------------------------------
  function resetProgressBarYTP(playerID) {
    if (playerID !== undefined) {
      var progressBar   = j1.adapter.amplitude.data.ytPlayers[playerID].progressBar;
      progressBar.value = 0;
    }
  } // END resetProgressBarYTP

  // ---------------------------------------------------------------------------
  // resetCurrentTimeContainerYTP
  //
  // Reset YTP specific CURRENT time data
  // ---------------------------------------------------------------------------  
  function resetCurrentTimeContainerYTP() {

    // reset duration|hours
    var currentHours = document.getElementsByClassName("amplitude-current-hours");
    if (currentHours.length) {
      currentHours[0].innerHTML = '00';
    }

    // reset duration|minutes
    var currentMinutes = document.getElementsByClassName("amplitude-current-minutes");
    currentMinutes[0].innerHTML = '00';

    // reset duration|seconds
    var currentSeconds = document.getElementsByClassName("amplitude-current-seconds");
    currentSeconds[0].innerHTML = '00';    
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

    // player.seekTo(time, seekAhead);

    player.seekTo(time);

    // return buffered;
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
    if (playerState === YT_PLAYER_STATE.PLAYING || playerState === YT_PLAYER_STATE.BUFFERING || playerState === YT_PLAYER_STATE.PAUSED) {
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
      if (playerState === YT_PLAYER_STATE.PLAYING || playerState === YT_PLAYER_STATE.PAUSED) {
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
      if (playerState === YT_PLAYER_STATE.PLAYING || playerState === YT_PLAYER_STATE.PAUSED) {
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
      if (playerState === YT_PLAYER_STATE.PLAYING || playerState === YT_PLAYER_STATE.PAUSED) {
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
      if (playerState === YT_PLAYER_STATE.PLAYING || playerState === YT_PLAYER_STATE.PAUSED) {
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
      if (playerState === YT_PLAYER_STATE.PLAYING || playerState === YT_PLAYER_STATE.PAUSED) {
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
      if (playerState === YT_PLAYER_STATE.PLAYING || playerState === YT_PLAYER_STATE.PAUSED) {
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
      if (playerState === YT_PLAYER_STATE.PLAYING || playerState === YT_PLAYER_STATE.PAUSED) {
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

    button      = document.getElementsByClassName(elementClass);
    htmlElement = button[0];

    if (htmlElement.classList.contains('amplitude-paused')) {
      htmlElement.classList.remove('amplitude-paused');
      htmlElement.classList.add('amplitude-playing');
    } else {
      htmlElement.classList.remove('amplitude-playing');
      htmlElement.classList.add('amplitude-paused');
    }
  
  } // END togglePlayPauseButton

  // ---------------------------------------------------------------------------
  // setPlayPauseButtonPaused 
  // ---------------------------------------------------------------------------
  function setPlayPauseButtonPaused(elementClass) {
    var button, htmlElement;

    button      = document.getElementsByClassName(elementClass);
    htmlElement = button[0];

    htmlElement.classList.remove('amplitude-playing');
    htmlElement.classList.add('amplitude-paused');

  } // END setPlayPauseButtonPaused

  // ---------------------------------------------------------------------------
  // setPlayPauseButtonPlaying 
  // ---------------------------------------------------------------------------
  function setPlayPauseButtonPlaying(elementClass) {
    var button, htmlElement;

    button      = document.getElementsByClassName(elementClass);
    htmlElement = button[0];

    htmlElement.classList.remove('amplitude-paused');
    htmlElement.classList.add('amplitude-playing');

  } // END setPlayPauseButtonPlaying

  // ---------------------------------------------------------------------------
  // showHideSongCoverImage
  // ---------------------------------------------------------------------------  
  // function showHideSongCoverImage(playPauseButton) {
  //   var playPauseButton, imgNowPlaying;

  //   playPauseButton = document.getElementsByClassName(playPauseButton);
  //   imgNowPlaying   = document.querySelector('img.now-playing');

  //   if (playPauseButton[0].classList.contains('amplitude-paused')) {
  //     if (imgNowPlaying.style.display !== '') {
  //       imgNowPlaying.style.display = 'none';
  //     }
  //   } else {
  //     if (imgNowPlaying.style.display !== '') {
  //       imgNowPlaying.style.display = 'block';
  //     }
  //   }

  // } // END showHideSongCoverImage


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
      //
      if (j1.adapter.amplitude['data']['ytPlayers'][ytPlayerID].playerSettings.type === 'large') {

        // Overload AJS play_pause button for YT
        //
        var largePlayerPlayPauseButton = document.getElementsByClassName(playerButton);
        for (var i=0; i<largePlayerPlayPauseButton.length; i++) {
          var classArray  = [].slice.call(largePlayerPlayPauseButton[i].classList, 0);
          var classString = classArray.toString();

          if (classString.includes(ytPlayerID)) {
            largePlayerPlayPauseButton[i].addEventListener('click', function(event) {
              var playlist          = this.getAttribute("data-amplitude-playlist");
              var playerID          = playlist + '_large';
              var ytPlayer          = j1.adapter.amplitude['data']['ytPlayers'][playerID]['player'];
              ytActivePlayer        = ytPlayer;
              var songs             = j1.adapter.amplitude['data']['ytPlayers'][playerID]['songs'];

              var activeIndex       = j1.adapter.amplitude['data']['ytPlayers'][playerID]['activeIndex'];
              var activeVideoID     = j1.adapter.amplitude['data']['ytPlayers'][playerID]['videoID'];
              // var previousVideoID   = (typeof j1.adapter.amplitude.data.ytpGlobals.videoID === 'undefined') ? activeVideoID : j1.adapter.amplitude.data.ytpGlobals.videoID;
              var activePlayer      = j1.adapter.amplitude['data']['ytPlayers'][playerID]['player'];

              // save YT player GLOBAL data for later use (e.g. events)
              // j1.adapter.amplitude.data.ytpGlobals['activeIndex']    = activeIndex;
              // j1.adapter.amplitude.data.ytpGlobals['activePlaylist'] = playlist;
              // j1.adapter.amplitude.data.ytpGlobals['videoID']        = activeVideoID;

              // save YT player data for later use (e.g. events)
              j1.adapter.amplitude.data.ytPlayers[ytPlayerID].activeIndex = activeIndex;
              j1.adapter.amplitude.data.ytPlayers[ytPlayerID].player      = activePlayer;

              // change video
              // if (activeVideoID !== previousVideoID) {
              //   //ytPlayer.loadVideoById(activeVideoID);
              //   // ytPlayer.stopVideo();
              //   nextVideo(activeVideoID);
              //   return;
              // }                

              ytStopAllActivePlayers();

              // var player            = playlist + '_large';
              var songStart         = songs[songIndex].start;
              var songEnd           = songs[songIndex].end;
              var songStartSec      = timestamp2seconds(songStart);
              var songEndSec        = timestamp2seconds(songEnd);

              // toggle YT play|pause video
              var playerState = ytPlayer.getPlayerState();
              if (playerState === YT_PLAYER_STATE.CUED) {
                ytPlayer.loadVideoById(activeVideoID);
                return;
              }

              if (playerState === YT_PLAYER_STATE.PLAYING || playerState === YT_PLAYER_STATE.BUFFERING) {
                ytPlayer.pauseVideo();

                // set AJS play_pause button paused
                var playPauseButtonClass = `large-player-play-pause-${ytPlayerID}`;
                setPlayPauseButtonPaused(playPauseButtonClass);

                // set song active in playlist
                setSongPlayed(ytPlayerID, activeIndex);
              } else {
                // set video to configured start position
                if (songStartSec) {
                  var trackID    = activeIndex + 1;
                  var tsStartSec = seconds2timestamp(songStartSec);

                  if (ytPlayer.getVolume() === 0) {
                    fadeAudio && fadeAudioIn();
                  }

                  // seek video to INITIAL start position
                  var currentVideoTime = ytPlayer.getCurrentTime();
                  if (currentVideoTime < songStartSec) {
                    // logger.debug('\n' + 'seek video at track|start position: ' + activeIndex+1 + '|' + songStartSec);
                    logger.debug('\n' + 'start video trackID|playerID: ' + trackID + '|' + ytPlayerID);
                    logger.debug('\n' + 'start video trackID|timestamp: ' + trackID + '|' + tsStartSec);
                    ytpSeekTo(ytPlayer, songStartSec, true);
                  } else {
                    var tscurrentVideoTime = seconds2timestamp(Math.round(currentVideoTime));
                    logger.debug('\n' + 'start video trackID|playerID: ' + trackID + '|' + ytPlayerID);
                    logger.debug('\n' + 'video position at track|timestamp: ' + trackID + '|' + tscurrentVideoTime);
                  }
                }

                ytPlayer.playVideo();

                // set AJS play_pause button playing
                var playPauseButtonClass = `large-player-play-pause-${ytPlayerID}`;
                setPlayPauseButtonPlaying(playPauseButtonClass);

                // set song active in playlist
                setSongPlayed(ytPlayerID, activeIndex);
              }

              // deactivate AJS events (if any)
              event.stopImmediatePropagation();
            }); // END EventListener largePlayerPlayPauseButton 'click'
          } // END if largePlayerPlayPauseButton
        } // END for largePlayerPlayPauseButton

        // Overload AJS largePlayerSkipBackward button for YT
        //
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
                // var buffered = ytpSeekTo(ytPlayer, currentTime + skipOffset, true);
                ytpSeekTo(ytPlayer, currentVideoTime + skipOffset, true);

              }

            // deactivate AJS events (if any)
            event.stopImmediatePropagation();
            }); // END Listener 'click'
          } // END if skip-forward button
        } // END for  

        // Overload AJS largePlayerSkipBackward button for YT
        //
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
                // var buffered = ytpSeekTo(ytPlayer, currentTime - skipOffset, true);
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
              var playlist, playerID, songIndex, trackID, songs, songMetaData,
                  songURL, ytPlayer, ytpVideoID, doNextButtonOnLast;

              playlist        = this.getAttribute("data-amplitude-playlist");
              playerID        = playlist + '_large';
              songIndex       = j1.adapter.amplitude.data.ytPlayers[playerID].activeIndex;
              songs           = j1.adapter.amplitude.data.ytPlayers[playerID].songs;
              ytPlayer        = j1.adapter.amplitude.data.ytPlayers[playerID].player;
              ytActivePlayer  = ytPlayer;

              if (ytPlayer === undefined) {
                logger.error('\n' + 'YT playter not defined:');
              }

              // select video
              if (songIndex < songs.length - 1) {
                // select NEXT video
                songIndex++;                
                ytpSongIndex = songIndex;
              } else {
                doNextButtonOnLast = playerDefaults.do_next_button_on_last;
                if (doNextButtonOnLast === 'none') {
                  // do nothing on LAST video
                  return;                  
                }
                if (doNextButtonOnLast === 'first') {
                  // select FIRST video
                  songIndex    = 0; 
                  ytpSongIndex = songIndex;
                }
              }

              // set song (video)^meta data
              songMetaData  = songs[songIndex];
              songURL       = songMetaData.url;
              ytpVideoID    = songURL.split('=')[1];

              // save YT player GLOBAL data for later use (e.g. events)
              // j1.adapter.amplitude.data.ytpGlobals['activeIndex']    = songIndex;
              // j1.adapter.amplitude.data.ytpGlobals['activePlaylist'] = playlist;

              // save YT player data for later use (e.g. events)
              j1.adapter.amplitude.data.ytPlayers[playerID].activeIndex = songIndex;
              j1.adapter.amplitude.data.ytPlayers[playerID].videoID     = ytpVideoID;

              // wait some time to make sure video is loaded|active
              // load next video
              trackID = songIndex + 1;
              logger.debug('\n' + 'switch video at track|ID: ', trackID + '|' + ytpVideoID);
              ytPlayer.loadVideoById(ytpVideoID);

              // set AJS play_pause button playing
              var playPauseButtonClass = `large-player-play-pause-${playerID}`;
              setPlayPauseButtonPlaying(playPauseButtonClass);

              // delay after switch video
              if (delayAfterVideoLoaded) {
                ytPlayer.mute();
                setTimeout(() => {
                  ytPlayer.unMute();
                }, delayAfterVideoLoaded);
              }

              if (songIndex === 0) {
                // continue paused on FIRST video
                // TODO: handle on player|shuffle different (do play)
                ytPlayer.pauseVideo();

                // set AJS play_pause button paused
                var playPauseButtonClass = `large-player-play-pause-${ytPlayerID}`;
                setPlayPauseButtonPaused(playPauseButtonClass);
                
                // reset|update time settings
                resetCurrentTimeContainerYTP();
                updateDurationTimeContainerYTP(ytPlayer, playerID);
                resetProgressBarYTP(playerID);
              } else {
                // set AJS play_pause button playing
                var playPauseButtonClass = `large-player-play-pause-${ytPlayerID}`;
                setPlayPauseButtonPlaying(playPauseButtonClass);
              }

              // reset|update current time settings
              resetCurrentTimeContainerYTP();
              updateDurationTimeContainerYTP(ytPlayer, playerID);
              resetProgressBarYTP(playerID);

              // load cover image for next video
              var coverImage, selector;
              selector       = '.cover-image-' + playlist;
              coverImage     = document.querySelector(selector);
              coverImage.src = songMetaData.cover_art_url;

              // replace new song name (meta-container)
              var songName = document.getElementsByClassName("song-name");          
              songName[0].innerHTML = songMetaData.name; // player-bottom
              songName[1].innerHTML = songMetaData.name; // playlist-screen

              // replace song rating (playlist-screen|meta-container)
              var largetPlayerSongAudioRating = document.getElementsByClassName("audio-rating");
              if (largetPlayerSongAudioRating.length) {
                if (songMetaData.rating) {
                  largetPlayerSongAudioRating[0].innerHTML = '<img src="/assets/image/pattern/rating/scalable/' + songMetaData.rating + '-star.svg"' + 'alt="song rating" style="margin-top: 5px;">';
                } else {
                  largetPlayerSongAudioRating[0].innerHTML = '';
                }
              } // END if largetPlayerSongAudioRating

              // replace artist name in meta-containers for next video
              var artistName = document.getElementsByClassName("artist");
              artistName[0].innerHTML = songMetaData.artist;

              // replace album name in meta-containers for next video
              var albumName = document.getElementsByClassName("album");
              albumName[0].innerHTML = songMetaData.album;

              // set song active in playlist
              setSongPlayed(playerID, songIndex);

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
            var playlist, playerID, songIndex, trackID, songs, songMetaData,
                songURL, ytPlayer, ytpVideoID, doPreviousButtonOnFirst;

            playlist        = this.getAttribute("data-amplitude-playlist");
            playerID        = playlist + '_large';
            songIndex       = j1.adapter.amplitude.data.ytPlayers[playerID].activeIndex;      
            songs           = j1.adapter.amplitude.data.ytPlayers[playerID].songs;
            ytPlayer        = j1.adapter.amplitude.data.ytPlayers[playerID].player;
            ytActivePlayer  = ytPlayer;

            if (ytPlayer === undefined) {
              logger.error('\n' + 'YT playter not defined:');
            }

            // select video
            if (songIndex > 0 && songIndex <= songs.length - 1) {
              // select NEXT video
              songIndex--;                
              ytpSongIndex = songIndex;
            } else {
              doPreviousButtonOnFirst = playerDefaults.do_previous_button_on_first;
              if (doPreviousButtonOnFirst === 'none') {
                // do nothing on FIRST video
                // var playPauseButtonClass = `large-player-play-pause-${playerID}`;
                // setPlayPauseButtonPlaying(playPauseButtonClass);
                return;
              }
              if (doPreviousButtonOnFirst === 'last' ) {
                // skip to LAST video
                songIndex    = songs.length - 1;
                ytpSongIndex = songIndex;
                // var playPauseButtonClass = `large-player-play-pause-${playerID}`;
                // setPlayPauseButtonPlaying(playPauseButtonClass);
              }
            }

            var playPauseButtonClass = `large-player-play-pause-${playerID}`;
            setPlayPauseButtonPlaying(playPauseButtonClass);

            // set song (video)^meta data
            songMetaData  = songs[songIndex];
            songURL       = songMetaData.url;
            ytpVideoID    = songURL.split('=')[1];

            // save YT player GLOBAL data for later use (e.g. events)
            // j1.adapter.amplitude.data.ytpGlobals['activeIndex']    = songIndex;
            // j1.adapter.amplitude.data.ytpGlobals['activePlaylist'] = playlist;

            // save YT player data for later use (e.g. events)
            j1.adapter.amplitude.data.ytPlayers[playerID].activeIndex = songIndex;
            j1.adapter.amplitude.data.ytPlayers[playerID].videoID = ytpVideoID;

            // wait some time to make sure video is loaded|active
            // load next video
            trackID = songIndex + 1;
            logger.debug('\n' + 'switch video at track|ID: ', trackID + '|' + ytpVideoID);
            ytPlayer.loadVideoById(ytpVideoID);

            // delay after switch video
            if (delayAfterVideoLoaded) {
              ytPlayer.mute();
              setTimeout(() => {
                ytPlayer.unMute();
              }, delayAfterVideoLoaded);
            }

            if (songIndex === 0) {

              // continue paused on FIRST video
              // TODO: handle on player|shuffle different (do play)
              ytPlayer.pauseVideo();
              // set AJS play_pause button paused
              var playPauseButtonClass = `large-player-play-pause-${ytPlayerID}`;
              setPlayPauseButtonPaused(playPauseButtonClass);              

              // reset|update time settings
              resetCurrentTimeContainerYTP();
              updateDurationTimeContainerYTP(ytPlayer, playerID);
              resetProgressBarYTP(playerID);
            } else {
              // set AJS play_pause button playing
              var playPauseButtonClass = `large-player-play-pause-${ytPlayerID}`;
              setPlayPauseButtonPlaying(playPauseButtonClass);
            }

            // reset|update current time settings
            resetCurrentTimeContainerYTP();
            updateDurationTimeContainerYTP(ytPlayer, playerID);
            resetProgressBarYTP(playerID);

            // load cover image for next video
            var coverImage, selector;
            selector       = '.cover-image-' + playlist;
            coverImage     = document.querySelector(selector);
            coverImage.src = songMetaData.cover_art_url;

            // replace new song name (meta-container)
            var songName = document.getElementsByClassName("song-name");          
            songName[0].innerHTML = songMetaData.name; // player-bottom
            songName[1].innerHTML = songMetaData.name; // playlist-screen

            // replace song rating (playlist-screen|meta-container)
            var largetPlayerSongAudioRating = document.getElementsByClassName("audio-rating");
            if (largetPlayerSongAudioRating.length) {
              if (songMetaData.rating) {
                largetPlayerSongAudioRating[0].innerHTML = '<img src="/assets/image/pattern/rating/scalable/' + songMetaData.rating + '-star.svg"' + 'alt="song rating" style="margin-top: 5px;">';
              } else {
                largetPlayerSongAudioRating[0].innerHTML = '';
              }
            } // END if largetPlayerSongAudioRating

            // replace artist name in meta-containers for next video
            var artistName = document.getElementsByClassName("artist");
            artistName[0].innerHTML = songMetaData.artist;

            // replace album name in meta-containers for next video
            var albumName = document.getElementsByClassName("album");
            albumName[0].innerHTML = songMetaData.album;

            // set song active in playlist
            setSongPlayed(playerID, songIndex);

            // deactivate AJS events (if any)
            event.stopImmediatePropagation();

          }); // END EventListener 'click' next button
        } // END if

    } // END for largePlayerNextButton

    // click on song container
    // TODO: Fix for multiple players in page
    // -------------------------------------------------------------------------
    var largetPlayerSongContainer = document.getElementsByClassName("amplitude-song-container");
    for (var i=0; i<largetPlayerSongContainer.length; i++) {
      var classArray  = [].slice.call(largetPlayerSongContainer[i].classList, 0);
      var classString = classArray.toString();

      if (classString.includes(ytPlayerID)) {
        largetPlayerSongContainer[i].addEventListener('click', function(event) {
          var playlist, playerID, playerState, activeIndex, songs, songIndex,
              ytPlayer, trackID, songStart, songStartSec, songName, coverImage,
              changedAudio, selector, playerCurrentTime, ytpVideoID;

          // set (current) playlist|song data
          playlist        = this.getAttribute("data-amplitude-playlist");
          playerID        = playlist + '_large';
          songs           = j1.adapter.amplitude.data.ytPlayers[playerID].songs;
          songIndex       = parseInt(this.getAttribute("data-amplitude-song-index"));
          ytPlayer        = j1.adapter.amplitude.data.ytPlayers[playerID].player;
          ytActivePlayer  = ytPlayer;

          // set (current) song meta data
          songMetaData    = songs[songIndex];
          songURL         = songMetaData.url;
          ytpVideoID      = songURL.split('=')[1];

          // update global song index (start at 0)
          ytpSongIndex    = songIndex;

          // save YT player GLOBAL data for later use (e.g. events)
          // j1.adapter.amplitude.data.ytpGlobals['activeIndex']    = songIndex;
          // j1.adapter.amplitude.data.ytpGlobals['activePlaylist'] = playlist;            

          // save YT player data for later use (e.g. events)
          j1.adapter.amplitude.data.ytPlayers[playerID].activeIndex = songIndex;

          playerState     = ytPlayer.getPlayerState();
          changedAudio    = (j1.adapter.amplitude.data.ytPlayers[playerID].videoID !== ytpVideoID) ? true : false;

          // check if clicked on ACTIVE item
          // -------------------------------------------------------------------
          activeIndex = getSongPlayed();
          if (songIndex === activeIndex) {
              // do NOT interupt CURRENT song (video)
              return;            
          }

          // reset|update current time settings
          resetCurrentTimeContainerYTP();
          updateDurationTimeContainerYTP(ytPlayer, playerID);
          resetProgressBarYTP(playerID);

          // load cover image for next video
          selector       = ".cover-image-" + playlist;
          coverImage     = document.querySelector(selector);
          coverImage.src = songMetaData.cover_art_url;

          // replace new song name (meta-container)
          songName              = document.getElementsByClassName("song-name"); 
          songName[0].innerHTML = songMetaData.name; // player-bottom
          songName[1].innerHTML = songMetaData.name; // playlist-screen

          // replace song info URL (playlist-screen|meta-container)
          var largetPlayerSongInfoLink = document.getElementsByClassName("audio-info-link");
          if (largetPlayerSongInfoLink.length) {
            if (songMetaData.audio_info) {
              largetPlayerSongInfoLink[0].href = songMetaData.audio_info;
            } else {
              largetPlayerSongInfoLink[0].href = songURL;
            }
          } // END if largetPlayerSongInfoLink

          // replace song rating (playlist-screen|meta-container)
          var largetPlayerSongAudioRating = document.getElementsByClassName("audio-rating");
          if (largetPlayerSongAudioRating.length) {
            if (songMetaData.rating) {
              largetPlayerSongAudioRating[0].innerHTML = '<img src="/assets/image/pattern/rating/scalable/' + songMetaData.rating + '-star.svg"' + 'alt="song rating" style="margin-top: 5px;">';
            } else {
              largetPlayerSongAudioRating[0].innerHTML = '';
            }
          } // END if largetPlayerSongAudioRating

          // set AJS play_pause button playing
          var playPauseButtonClass = `large-player-play-pause-${ytPlayerID}`;
          setPlayPauseButtonPlaying(playPauseButtonClass)

          // set song active in playlist
          setSongPlayed(ytPlayerID, songIndex);

          // load next video
          trackID = songIndex + 1;
          logger.debug('\n' + 'switch video at track|ID: ', trackID + '|' + ytpVideoID);
          ytPlayer.loadVideoById(ytpVideoID);

          // delay after switch video
          if (delayAfterVideoLoaded) {
            ytPlayer.mute();
            setTimeout(() => {
              ytPlayer.unMute();
            }, delayAfterVideoLoaded);
          }

          // deactivate AJS events (if any)
          event.stopImmediatePropagation();           
        }); // END EventListener 'click' SongContainer
      } // END if
    } // END for

    // add listeners to all progress bars found
    // TODO: Fix for multiple players in page
    // -------------------------------------------------------------------------
    var progressBars = document.getElementsByClassName("large-player-progress");
    if (progressBars.length) {
      for (var i=0; i<progressBars.length; i++) {
        var progressBar = progressBars[i];
        var progressId  = progressBars[i].id;
        var playerId    = progressId.split('large_player_progress_')[1];
        

        // save YT player data for later use (e.g. events)
        j1.adapter.amplitude.data.ytPlayers[playerId].progressBar = progressBar;

        progressBars[i].addEventListener('click', function(event)  {
          // var ytPlayer     = j1.adapter.amplitude.data.ytpGlobals.activePlayer;
          var ytPlayer        = j1.adapter.amplitude.data.ytPlayers[playerId].player;
          var classArray      = [].slice.call(this.classList, 0);
          var classString     = classArray.toString();
          var playerState     = ytPlayer.getPlayerState();
          var playerState     = ytPlayer.getPlayerState();
        //var activePlaylist  = (typeof j1.adapter.amplitude.data.ytpGlobals['activePlaylist'] !== 'undefined') ? j1.adapter.amplitude.data.ytpGlobals['activePlaylist'] : false;
          var activePlaylist  = j1.adapter.amplitude.data.ytPlayers[playerId].playerSettings.playlist.name;

          if (classString.includes(activePlaylist)) {
            if (playerState === YT_PLAYER_STATE.PLAYING || playerState === YT_PLAYER_STATE.PAUSED) {
              var progressBar, percentage, time;
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
          } // END activePlaylist

          // deactivate AJS events (if any)
          event.stopImmediatePropagation();   
        }); // END EventListener 'click'
      } // END for
    } // END if progressBars

    // add listeners to all volume_sliders found
    // TODO: Fix for multiple players in page
    // -------------------------------------------------------------------------
    var volumSliders = document.getElementsByClassName("amplitude-volume-slider");
    if (volumSliders.length) {
      for (var i=0; i<volumSliders.length; i++) {
        var volumSlider   = volumSliders[i];
        var sliderId      = volumSliders[i].id;
        var playerId      = progressId.split('large_player_progress_')[1];
        var ytPlayer      = j1.adapter.amplitude.data.ytPlayers[playerId].player;

        // save YT player data for later use (e.g. events)
        j1.adapter.amplitude.data.ytPlayers[playerId].volumeSlider = volumSlider;

        volumSliders[i].addEventListener('click', function(event)  {
          var playerState = ytPlayer.getPlayerState();

          if ((playerState === YT_PLAYER_STATE.PLAYING || playerState === YT_PLAYER_STATE.PAUSED) && ytPlayer !== undefined) {
            var volumSlider, volumeValue;
            var currenVolume = ytPlayer.getVolume();

            volumSlider = this;
            volumeValue = 50;  // default

            if (volumSlider !== null) {
              volumeValue = parseInt(volumSlider.value);
            }

            ytPlayer.setVolume(volumeValue);
          } // END if ytPlayer

        }); // END EventListener 'click'
      } // END for
    } // END if volumSliders

    // add listeners to all mute buttons found
    // TODO: Fix for multiple buttons in page
    // -------------------------------------------------------------------------
    var volumeMutes = document.getElementsByClassName("amplitude-mute");
    if (volumeMutes.length) {
      for (var i=0; i<volumeMutes.length; i++) {
        var volumMute = volumeMutes[i];
        var playerId  = progressId.split('large_player_progress_')[1];
        var ytPlayer  = j1.adapter.amplitude.data.ytPlayers[playerId].player;

        // save YT player data for later use (e.g. events)
        j1.adapter.amplitude.data.ytPlayers[playerId].volumMute = volumMute;

        volumeMutes[i].addEventListener('click', function(event) {
          var playerState         = ytPlayer.getPlayerState();
          var volumSlider         = j1.adapter.amplitude.data.ytPlayers[playerId].volumeSlider;
          var currenVolume        = ytPlayer.getVolume();
          var playerVolumePreset  = parseInt(j1.adapter.amplitude.data.ytPlayers[playerId].playerSettings.volume_slider.preset_value);
  
          if ((playerState === YT_PLAYER_STATE.PLAYING || playerState === YT_PLAYER_STATE.PAUSED) && ytPlayer !== undefined) {
            if (currenVolume > 0) {
              volumSlider.value = 0;
              ytPlayer.setVolume(0);                
            } else {
              volumSlider.value = playerVolumePreset;
              ytPlayer.setVolume(playerVolumePreset);
            }

          } // END if ytPlayer

        }); // END EventListener 'click'
      } // END for
    } // END if volumeMutes

    } // END if playerType large
  } // END if ytPlayerID
} // END mimikYTPlayerUiEventsForAJS

{%- endcapture -%}

{%- if production -%}
  {{ cache|minifyJS }}
{%- else -%}
  {{ cache|strip_empty_lines }}
{%- endif -%}

{%- assign cache = false -%}