---
regenerate: true
---

{%- capture cache -%}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/modules/amplitudejs/js/plugins/tech/ytp.js
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
{% assign amplitude_defaults  = modules.defaults.amplitude_app.defaults %}
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
 # ~/assets/theme/j1/modules/amplitudejs/js/plugins/tech/ytp.js
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
//----------------------------------------------------------------------------
var startTime;
var endTime;
var startTimeModule;
var endTimeModule;
var timeSeconds;

var firstScriptTag;
var ytPlayer;
var ytPlayerReady     = false;
var ytApiReady        = false;
var logger            = log4javascript.getLogger('j1.adapter.amplitude.tech');

var dependency;
var playerCounter       = 0;
var load_dependencies   = {};

// set default song index to FIRST item
var songIndex           = 0;
var ytpSongIndex        = 0;

var ytpAutoPlay         = false;
var ytpLoop             = true;
var playLists           = {};
var playersUILoaded     = { state: false };
var apiInitialized      = { state: false };

var amplitudeDefaults   = $.extend({}, {{amplitude_defaults | replace: 'nil', 'null' | replace: '=>', ':' }});
var amplitudePlayers    = $.extend({}, {{amplitude_players   | replace: 'nil', 'null' | replace: '=>', ':' }});
var amplitudePlaylists  = $.extend({}, {{amplitude_playlists | replace: 'nil', 'null' | replace: '=>', ':' }});
var amplitudeOptions    = $.extend(true, {}, amplitudeDefaults, amplitudePlayers, amplitudePlaylists);

var playerExistsInPage  = false;
var ytpContainer        = null;
var playerProperties    = {};
var playlistScrollMin   = 5;
var playList;
var playerProperties;
var playerID;
var playerType;
var playListTitle;
var playListName;
var amplitudePlayerState;
var ytPlayer;
var ytpPlaybackRate

var songs;
var songMetaData;
var songURL;
                                                            
var progress;

var messageLoggedOnce = false;

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
  }

  // ---------------------------------------------------------------------------
  // audioFadeIn
  // ---------------------------------------------------------------------------
  function audioFadeIn(targetVolume=50, speed='default') {
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
    currentStep = 0;

    (ytPlayer.isMuted()) && ytPlayer.unMute();

    // skip fade-in when volume is already at target value
    if (ytPlayer.getVolume() >= targetVolume) {
      logger.warn('\n' + 'skipped fade-in for current video on volume: ', targetVolume);
      return;
    }

    const fadeInInterval = setInterval(() => {
      const newVolume = targetVolume * (currentStep / steps);

      ytPlayer.setVolume(newVolume);
      volumSlider.value = newVolume;
      currentStep++;

      (currentStep > steps) && clearInterval(fadeInInterval);
    }, cycle);

  } // END audioFadeIn

  // ---------------------------------------------------------------------------
  // audioFadeOut
  // ---------------------------------------------------------------------------
  function audioFadeOut(speed='default') {
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

    const fadeOutInterval = setInterval(() => {
      newVolume = startVolume * (1 - currentStep / steps);

      ytPlayer.setVolume(newVolume);
      volumSlider.value = newVolume;
      currentStep++;

      (currentStep > steps) && clearInterval(fadeOutInterval);
    }, cycle);

  } // END audioFadeOut

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
  // nextVideo
  //
  // calculate|play next video in playlist
  // ---------------------------------------------------------------------------
  function nextVideo() {
    var playlist    = j1.adapter.amplitude.data.ytpGlobals.activePlaylist;
    var player      = playlist + '_large';
    var songs       = j1.adapter.amplitude.data.ytPlayers[player].songs;
    var activeIndex = getSongPlayed();
    var songIndex   = ytpSongIndex;

    songIndex++;
    ytpSongIndex = songIndex;
  
    // play NEXT sonng (video) in playlist 
    if (songIndex <= songs.length-1) {
      var songMetaData  = songs[songIndex];
      var songURL       = songMetaData.url;
      var ytpVideoID    = songURL.split('=')[1];

      logger.debug('\n' + 'switch current video to next video on ID: ', ytpVideoID);

      // continue on next video
      ytPlayer.loadVideoById(ytpVideoID);
  
      // reset|update time settings
      resetCurrentTimeContainerYTP();
      updateDurationTimeContainerYTP(ytPlayer);
  
      // update global song index for next video
      ytpSongIndex = songIndex;
  
      // save YT player GLOBAL data for later use (e.g. events)
      j1.adapter.amplitude.data.ytpGlobals['activeIndex'] = songIndex;
      j1.adapter.amplitude.data.ytpGlobals['videoID']     = ytpVideoID;

      // save YT player data for later use (e.g. events)
      // j1.adapter.amplitude.data.ytPlayers[playerID].activeIndex = songIndex;
      // j1.adapter.amplitude.data.ytPlayers[playerID].videoID     = ytpVideoID;
  
      // load cover image for next video
      var coverImage;
      var selector   = ".cover-image-" + playlist;
      coverImage     = document.querySelector(selector);
      coverImage.src = songMetaData.cover_art_url;
  
      // replace song name in meta-containers for next video
      var songName = document.getElementsByClassName("song-name");
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
  
      // replace artist name in meta-containers for next video
      var artistName = document.getElementsByClassName("artist");
      artistName[0].innerHTML = songMetaData.artist;
  
      // replace album name in meta-containers for next video
      var albumName          = document.getElementsByClassName("album");
      albumName[0].innerHTML = songMetaData.album;
  
      setSongPlayed(playerID, songIndex);
    } else {
      // continue on FIRST song (video) in playlist
      //
      songIndex = 0;
      var songMetaData  = songs[songIndex];
      var songURL       = songMetaData.url;
      var ytpVideoID    = songURL.split('=')[1];
  
      // save YT player data for later use (e.g. events)
      j1.adapter.amplitude.data.ytPlayers[playerID].activeIndex = songIndex;
      j1.adapter.amplitude.data.ytPlayers[playerID].videoID     = ytpVideoID;
  
      // continue (paused) on FIRST video muted
      ytPlayer.loadVideoById(ytpVideoID);

      // wait some time to make sure video is loaded
      setTimeout(() => {
        ytPlayer.pauseVideo();
        // ytPlayer.mute();
    
        // reset|update time settings
        resetCurrentTimeContainerYTP();
        updateDurationTimeContainerYTP(ytPlayer);
    
        // update AJS play_pause button
        var largePlayerPlayPauseButton = document.getElementById('large_player_play_pause');
        largePlayerPlayPauseButton.classList.remove('amplitude-playing');
        largePlayerPlayPauseButton.classList.add('amplitude-paused');              
      }, 300);            
  
      // update global song index for first video
      ytpSongIndex = songIndex;
  
      // load cover image for first video
      var coverImage;
      var selector   = ".cover-image-" + playlist;
      coverImage     = document.querySelector(selector);
      coverImage.src = songMetaData.cover_art_url;              
  
      // replace name in meta-containers for first video
      var songName          = document.getElementsByClassName("song-name");
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
  
      // replace artist name in meta-containers for next video
      var artistName       = document.getElementsByClassName("artist");
      artistName.innerHTML = songMetaData.artist;
  
      // replace album name in meta-containers for next video
      var albumName       = document.getElementsByClassName("album");
      albumName.innerHTML = songMetaData.album;
  
      // update AJS play_pause button
      var largePlayerPlayPauseButton = document.getElementById('large_player_play_pause');
      largePlayerPlayPauseButton.classList.remove('amplitude-playing');
      largePlayerPlayPauseButton.classList.add('amplitude-paused');
  
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
    ytApiReady     = true;

    // var currentOptions = $.extend({}, {{amplitude_options | replace: 'nil', 'null' | replace: '=>', ':' }});

    {% for player in amplitude_options.players %}{% if player.enabled and player.source == 'video' %}
      {% capture xhr_container_id %}{{player.id}}_app{% endcapture %}

      // var playerSource = '{{player.source}}';

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

          ytPlayer = new YT.Player('iframe_{{player.id}}', {
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

        function checkPlayingStatus(player) {
          if (player.getPlayerState() === YT_PLAYER_STATE.PLAYING) {
            // code run after video is playing
            // console.debug("checkPlayingStatus: AJS YouTube Player state: PLAYING");
            // do nothing
            return;            
          } else {
            // re-check player state required
            // console.debug("checkPlayingStatus: AJS YouTube Player state:", player.getPlayerState());
          }
        } // END checkPlayingStatus

        // run AJS YouTube Player initialization
        // ---------------------------------------------------------------------
        function {{player.id}}OnPlayerReady(event) {
          var hours, minutes, seconds;
          var ytPlayer            = event.target;
          var ytPlayerReady       = true;
          var playerVolumePreset  = parseInt({{player.volume_slider.preset_value}});

          // set video playback quality to a minimum
          ytPlayer.setPlaybackQuality('small');

          // set configured player volume preset
          ytPlayer.setVolume(playerVolumePreset);

          // enable|disable scrolling on playlist
          // -------------------------------------------------------------------
          if (document.getElementById('large_player_right') !== null) {

            // show|hide scrollbar in playlist
            // -----------------------------------------------------------------
            var playListName          = j1.adapter.amplitude.data.ytPlayers.{{player.id}}.playerSettings.playlist.name;
            var songsInPlaylist       = Amplitude.getSongsInPlaylist(playListName);
            var titleListLargePlayer  = document.getElementById('large_player_title_list_' + playListName);

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
          // j1.adapter.amplitude.data.ytPlayers.{{player.id}}.playerReady = ytPlayerReady;

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
          var currentTime, playlist, ytPlayer, songs, songIndex;

          playlist    = j1.adapter.amplitude.data.ytPlayers.{{player.id}}.playerSettings.playlist.name;
          playerID    = playlist + '_large';
          ytPlayer    = event.target;
          songs       = j1.adapter.amplitude.data.ytPlayers.{{player.id}}.songs;
          currentTime = ytPlayer.getCurrentTime();

          // save YT player GLOBAL data for later use (e.g. events)
          j1.adapter.amplitude.data.ytpGlobals['activePlayer']   = ytPlayer;
          j1.adapter.amplitude.data.ytpGlobals['activeIndex']    = ytpSongIndex;
          j1.adapter.amplitude.data.ytpGlobals['activePlaylist'] = playlist;   

          // save YT player data for later use (e.g. events)
          j1.adapter.amplitude.data.ytPlayers.{{player.id}}.player = ytPlayer;

          // reset time container|progressbar for the ACTIVE song (video)
          // -------------------------------------------------------------------          
          resetCurrentTimeContainerYTP();
          updateDurationTimeContainerYTP(ytPlayer);

          if (event.data === YT_PLAYER_STATE.UNSTARTED) {
            // logger.debug('\n' + 'current player state: unstarted');
            return;
          } 

          if (event.data === YT_PLAYER_STATE.CUED) {
            logger.debug('\n' + 'current player state: ' + YT_PLAYER_STATE_NAMES[event.data]);
            return;
          }

          // if (event.data == YT_PLAYER_STATE.BUFFERING || event.data == YT_PLAYER_STATE.CUED) {
          if (event.data == YT_PLAYER_STATE.BUFFERING) {
            logger.debug('\n' + 'current player state: ' + YT_PLAYER_STATE_NAMES[event.data]);
            setTimeout(checkPlayingStatus(ytPlayer), 250);
            return
          } 

          if (event.data === YT_PLAYER_STATE.PAUSED) {
            logger.debug('\n' + 'current player state: ' + YT_PLAYER_STATE_NAMES[event.data]);
            return;
          }

          if (event.data === YT_PLAYER_STATE.PLAYING) {
            var playlist      = j1.adapter.amplitude.data.ytpGlobals.activePlaylist;
            var player        = playlist + '_large';
            var songs         = j1.adapter.amplitude.data.ytPlayers[player].songs;
            var songIndex     = j1.adapter.amplitude.data.ytpGlobals.activeIndex;
            var songStart     = songs[songIndex].start;
            var songEnd       = songs[songIndex].end;
            var songStartSec  = timestamp2seconds(songStart);
            var songEndSec    = timestamp2seconds(songEnd);
            var audioFade     = true;

            logger.debug('\n' + 'current player state: ' + YT_PLAYER_STATE_NAMES[event.data]);

            // update time container|progressbar for the ACTIVE song (video)
            // -----------------------------------------------------------------
            setInterval(updateCurrentTimeContainerYTP, 1000);
            setInterval(updateProgressBarsYTP, 1000);

            if (audioFade) {
              // check|process video for configured START position
              if (songStartSec && currentTime <= songStartSec) {
                logger.debug('\n' + 'seek current video at second: ', songStartSec);

                // seek video to START position
                ytPlayer.seekTo(songStartSec);

                // audio FadeIn on song position START
                logger.debug('\n' + 'fade-in current video at second: ', songStartSec);
                audioFadeIn();

              } // END if songStartSec
            } // END if audioFade

            // check|process video for configured END position
            // -----------------------------------------------------------------
            if (songEndSec) {
              var fadeoOutStartTime = 1;  // give fadeoOut 1 second to run

              if (audioFade) {
                var checkOnVideoFadeoOut = setInterval(function() {            
                  if (ytPlayer.getCurrentTime() >= songEndSec - fadeoOutStartTime) {

                    // fade-out audio on video|song END
                    logger.debug('\n' + 'fade-out current video at second: ', songEndSec);
                    audioFadeOut();                
            
                    clearInterval(checkOnVideoFadeoOut);
                  }
                }, 100);

                var checkOnVideoEnd = setInterval(function() {            
                  if (songEndSec && ytPlayer.getCurrentTime() >= songEndSec) {

                    // mute audio on LAST video
                    if (songIndex === songs.length-1) {
                      ytPlayer.mute();
                    }

                    // force player state change after fade-out
                    ytPlayer.pauseVideo();

                    // load next video
                    logger.debug('\n' + 'switch current video on end position: ', songEndSec);
                    nextVideo();
                    clearInterval(checkOnVideoEnd);
                  }
                }, 200);
              } // END if audioFade
            } // END if songEndSec

          } // END YT_PLAYER_STATE PLAYING

          // load|play NEXT|FIRST song (video) in playlist
          // -------------------------------------------------------------------
          if (event.data === YT_PLAYER_STATE.ENDED) {
            if (audioFade) {
              if (ytPlayer.getVolume() === 0) {
                audioFadeIn();
              }
            }

            nextVideo();
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
    var activePlayer = j1.adapter.amplitude.data.ytpGlobals['activePlayer'];
    var progressBars = document.getElementsByClassName("large-player-progress");

    for (var i=0; i<progressBars.length; i++) {
      if (activePlayer !== undefined) {
        // calc procent value (float, 2 decimals [0.00 .. 1.00])
        progress = parseFloat((activePlayer.getCurrentTime() / activePlayer.getDuration()).toFixed(2));
        
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
  function updateDurationTimeContainerYTP(player) {
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
    hours   = ytpGetCurrentHours(ytPlayer);
    minutes = ytpGetCurrentMinutes(ytPlayer);
    seconds = ytpGetCurrentSeconds(ytPlayer);

    // set GLOBAL player current time
    // ytPlayerCurrentTime = ytPlayer.getCurrentTime()

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
  // ytpSeekTo
  // ---------------------------------------------------------------------------  
  // Seek (skip) video to time specified
  // ---------------------------------------------------------------------------
  function ytpSeekTo(player, time) {
    player.seekTo(time, true);
  } // END ytpSeekTo


  // ---------------------------------------------------------------------------
  // ytpGetBuffered
  // ---------------------------------------------------------------------------  
  // Returns the buffered percentage of the playing video
  // ---------------------------------------------------------------------------
  function ytpGetBuffered(player) {
    // tbd
  }

  // ---------------------------------------------------------------------------
  // ytpGetActiveIndex
  // ---------------------------------------------------------------------------
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
  // ---------------------------------------------------------------------------  
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
  // ---------------------------------------------------------------------------  
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
  // toggle_play_pause_video
  // ---------------------------------------------------------------------------
  function toggle_play_pause_video(playPauseButton) {
    var largePlayerPlayPauseButton = document.getElementsByClassName(playPauseButton);

    if (largePlayerPlayPauseButton[0].classList.contains('amplitude-paused')) {
      largePlayerPlayPauseButton[0].classList.remove('amplitude-paused');
      largePlayerPlayPauseButton[0].classList.add('amplitude-playing');
    } else {
      largePlayerPlayPauseButton[0].classList.remove('amplitude-playing');
      largePlayerPlayPauseButton[0].classList.add('amplitude-paused');
    }

    // deactivate AJS events
    event.stopImmediatePropagation(); 
  } // END toggle_play_pause_video


  // ---------------------------------------------------------------------------
  // toggle_now_playing_image
  // ---------------------------------------------------------------------------  
  function toggle_now_playing_image(playPauseButton) {
    var playPauseButton, imgNowPlaying;

    playPauseButton = document.getElementsByClassName(playPauseButton);
    imgNowPlaying   = document.querySelector('img.now-playing');

    if (playPauseButton[0].classList.contains('amplitude-paused')) {
      if (imgNowPlaying.style.display !== '') {
        imgNowPlaying.style.display = 'none';
      }
    } else {
      if (imgNowPlaying.style.display !== '') {
        imgNowPlaying.style.display = 'block';
      }
    }

  } // END toggle_now_playing_image

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
              var playlist        = this.getAttribute("data-amplitude-playlist");
              var playerID        = playlist + '_large';
              var ytPlayer        = j1.adapter.amplitude['data']['ytPlayers'][playerID]['player'];
              var songs           = j1.adapter.amplitude['data']['ytPlayers'][playerID]['songs'];
              var activeIndex     = getSongPlayed();
              var activeIndex     = ytpSongIndex;
              var songMetaData    = songs[activeIndex];
              var playPauseButton = `large-player-play-pause-${ytPlayerID}`;
              var audioFade       = true;

              var player          = playlist + '_large';
              var songStart       = songs[songIndex].start;
              var songEnd         = songs[songIndex].end;
              var songStartSec    = timestamp2seconds(songStart);
              var songEndSec      = timestamp2seconds(songEnd);

              // save YT player GLOBAL data for later use (e.g. events)
              j1.adapter.amplitude.data.ytpGlobals['activeIndex']    = activeIndex;
              j1.adapter.amplitude.data.ytpGlobals['activePlaylist'] = playlist;

              // save YT player data for later use (e.g. events)
              j1.adapter.amplitude.data.ytPlayers[playerID].activeIndex = activeIndex;

              // toggle YT play|pause video
              if (ytPlayer.getPlayerState() === YT_PLAYER_STATE.PLAYING || event.data === YT_PLAYER_STATE.BUFFERING) {
                ytPlayer.pauseVideo();
                toggle_play_pause_video(playPauseButton);

                // set song active in playlist
                setSongPlayed(ytPlayerID, activeIndex);
              } else {
                if (audioFade) {
                  if (ytPlayer.getVolume() === 0) {
                    audioFadeIn();
                  }
                }
    
                // set video to configured start position
                if (songStartSec) {
                  // ytPlayer.mute();
                  logger.debug('\n' + 'seek current video on configured start position: ', songStartSec);
                  ytPlayer.seekTo(songStartSec);
                  // ytPlayer.unMute();
                }

                ytPlayer.playVideo();
                toggle_play_pause_video(playPauseButton);

                // set song active in playlist
                setSongPlayed(ytPlayerID, activeIndex);
              }

              event.stopImmediatePropagation(); // deactivate AJS events
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

          // if (largePlayerSkipForwardButtons[i].id === 'skip-forward_' + ytPlayerID) {
          // if (classString.includes(ytPlayerID)) && largePlayerSkipForwardButtons[i].id === 'skip-forkward_' + ytPlayerID) {
          if (classString.includes(ytPlayerID)) {
            largePlayerSkipForwardButtons[i].addEventListener('click', function(event)  {
              var currentTime, playerState, skipOffset, ytPlayer;

              skipOffset  = parseFloat(playerForwardBackwardSkipSeconds);
              ytPlayer    = j1.adapter.amplitude['data']['ytPlayers'][ytPlayerID].player;
              playerState = ytPlayer.getPlayerState();
              currentTime = ytPlayer.getCurrentTime();

              if (playerState === YT_PLAYER_STATE.PLAYING || playerState === YT_PLAYER_STATE.PAUSED) {
                ytPlayer.seekTo(currentTime + skipOffset, true);
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
              var currentTime, playerState, skipOffset, ytPlayer;

              skipOffset  = parseFloat(playerForwardBackwardSkipSeconds);
              ytPlayer    = j1.adapter.amplitude['data']['ytPlayers'][ytPlayerID].player;
              playerState = ytPlayer.getPlayerState();
              currentTime = ytPlayer.getCurrentTime();

              if (playerState === YT_PLAYER_STATE.PLAYING || playerState === YT_PLAYER_STATE.PAUSED) {
                ytPlayer.seekTo(currentTime - skipOffset, true);
              }

              // deactivate AJS events (if any)
              event.stopImmediatePropagation();            
            }); // END Listener 'click'
          } // END if skip-backward button
        } // END for

        // click on (player) next button
        // TODO: Fix for multiple players in page
        // --------------------------------------------------------------------
      
        // Overload AJS largePlayerNext button for YT
        //
        var largePlayerNextButton = document.getElementsByClassName("large-player-next");
        for (var i=0; i<largePlayerNextButton.length; i++) {
          var classArray  = [].slice.call(largePlayerNextButton[i].classList, 0);
          var classString = classArray.toString();

          if (classString.includes(ytPlayerID)) {
            largePlayerNextButton[i].addEventListener('click', function(event) {
              var ytpVideoID;
              var playlist      = this.getAttribute("data-amplitude-playlist");
              var playerID      = playlist + '_large';
              var songIndex     = ytpSongIndex;
              var songs         = j1.adapter.amplitude.data.ytPlayers[playerID].songs;
              var ytPlayer      = j1.adapter.amplitude.data.ytPlayers[playerID].player;

              // select NEXT video
              if (songIndex < songs.length-1 ) {
                songMetaData  = songs[songIndex];
                songURL       = songMetaData.url;
                ytpVideoID    = songURL.split('=')[1];
                songIndex++;
                ytpSongIndex = songIndex;                
              } else {
                // select FIRST video
                songIndex     = 0;
                songMetaData  = songs[songIndex];
                songURL       = songMetaData.url;
                ytpVideoID    = songURL.split('=')[1];              
              }

              // save YT player GLOBAL data for later use (e.g. events)
              j1.adapter.amplitude.data.ytpGlobals['activeIndex']    = getSongPlayed();
              j1.adapter.amplitude.data.ytpGlobals['activePlaylist'] = playlist;

              // save YT player data for later use (e.g. events)
              j1.adapter.amplitude.data.ytPlayers[playerID].activeIndex = songIndex;
              j1.adapter.amplitude.data.ytPlayers[playerID].videoID = ytpVideoID;

              // pause song (video) if FIRST item reached
              // TODO: handle on player|shuffle different (do play)
              if (songIndex === 0) {

                // continue (paused) on FIRST video
                if (ytPlayer !== undefined) {                
                  ytPlayer.loadVideoById(ytpVideoID);

                  // wait some time to make sure video is loaded|active
                  setTimeout(() => {
                    ytPlayer.pauseVideo();
                    // reset|update time settings
                    resetCurrentTimeContainerYTP();
                    updateDurationTimeContainerYTP(ytPlayer);
                    // resetProgressBarYTP(playerID);
                        
                    // update AJS play_pause button
                    var largePlayerPlayPauseButton = document.getElementById('large_player_play_pause');
                    largePlayerPlayPauseButton.classList.remove('amplitude-playing');
                    largePlayerPlayPauseButton.classList.add('amplitude-paused');               
                  }, 300);                
                }
              } else {
                // load NEXT video if available
                if (ytPlayer !== undefined) {
                  ytPlayer.loadVideoById(ytpVideoID);

                  // update AJS play_pause button (set playing)
                  var largePlayerPlayPauseButton = document.getElementById('large_player_play_pause');
                  largePlayerPlayPauseButton.classList.remove('amplitude-paused');
                  largePlayerPlayPauseButton.classList.add('amplitude-playing');              
                } else {
                  // update AJS play_pause button (set paused)
                  var largePlayerPlayPauseButton = document.getElementById('large_player_play_pause');
                  largePlayerPlayPauseButton.classList.remove('amplitude-playing');
                  largePlayerPlayPauseButton.classList.add('amplitude-paused');              
                }
              }

              // reset|update current time settings
              resetCurrentTimeContainerYTP();
              updateDurationTimeContainerYTP(ytPlayer);

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

              // update AJS play_pause button
              var largePlayerPlayPauseButton = document.getElementById('large_player_play_pause');
              largePlayerPlayPauseButton.classList.remove('amplitude-paused');
              largePlayerPlayPauseButton.classList.add('amplitude-playing');

              setSongPlayed(playerID, songIndex);
              // deactivate AJS events (if any)
              event.stopImmediatePropagation();
            }); // END EventListener 'click' next button
          } // END if
      } // END for largePlayerNextButton

      // click on (player) previous button
      // TODO: Fix for multiple players in page
      // -----------------------------------------------------------------------

      // Overload AJS largePlayerPrevious button for YT
      //
      var largePlayePreviousButton = document.getElementsByClassName("large-player-previous");
      for (var i=0; i<largePlayePreviousButton.length; i++) {
        var classArray  = [].slice.call(largePlayerNextButton[i].classList, 0);
        var classString = classArray.toString();

        if (classString.includes(ytPlayerID)) {
          largePlayePreviousButton[i].addEventListener('click', function(event) {
            var ytpVideoID;
            var playlist  = this.getAttribute("data-amplitude-playlist");
            var playerID  = playlist + '_large';            
            var songIndex = ytpSongIndex;
            var songs     = j1.adapter.amplitude.data.ytPlayers[playerID].songs;
            var ytPlayer  = j1.adapter.amplitude.data.ytPlayers[playerID].player;  

            // do nothing on FIRST song
            if (j1.adapter.amplitude.data.ytPlayers[playerID].activeIndex === 0) { return }

            if (songIndex <= songs.length-1) {
              // set song on previous item
              songIndex--;
              ytpSongIndex = songIndex;
            }

            // collect (next) song data
            if (songIndex > 0 && songIndex < songs.length) {
              songMetaData  = songs[songIndex];
              songIndex     = songMetaData.index;
              songURL       = songMetaData.url;
              ytpSongIndex  = songMetaData.index;
              ytpVideoID    = songURL.split('=')[1];
            } else {
              songIndex     = 0;
              ytpSongIndex  = 0;
              songMetaData  = songs[songIndex];
              songURL       = songMetaData.url;
              ytpSongIndex  = songIndex;
              ytpVideoID    = songURL.split('=')[1];
            }

            // save YT player GLOBAL data for later use (e.g. events)
            j1.adapter.amplitude.data.ytpGlobals['activeIndex']    = getSongPlayed();
            j1.adapter.amplitude.data.ytpGlobals['activePlaylist'] = playlist;

            // save YT player data for later use (e.g. events)
            j1.adapter.amplitude.data.ytPlayers[playerID].activeIndex = songIndex;
            j1.adapter.amplitude.data.ytPlayers[playerID].videoID = ytpVideoID;

            // pause song (video) if FIRST item reached
            // TODO: handle on player|shuffle different (do play)
            if (songMetaData.index === 0) {
              ytpSongIndex = 0;

              // save YT player GLOBAL data for later use (e.g. events)
              j1.adapter.amplitude.data.ytpGlobals['activeIndex']    = getSongPlayed();
              j1.adapter.amplitude.data.ytpGlobals['activePlaylist'] = playlist;

              // save YT player data for later use (e.g. events)
              j1.adapter.amplitude.data.ytPlayers[playerID].activeIndex = ytpSongIndex;

              // continue (paused) on FIRST video
              if (ytPlayer !== undefined) {
                ytPlayer.loadVideoById(ytpVideoID);

                // wait some time to make sure video is loaded|active
                setTimeout(() => {
                  ytPlayer.pauseVideo();

                  // reset|update time settings
                  resetCurrentTimeContainerYTP();
                  updateDurationTimeContainerYTP(ytPlayer);
                  resetProgressBarYTP(playerID);
    
                  // update AJS play_pause button
                  var largePlayerPlayPauseButton = document.getElementById('large_player_play_pause');
                  largePlayerPlayPauseButton.classList.remove('amplitude-playing');
                  largePlayerPlayPauseButton.classList.add('amplitude-paused');                
                }, 300);                
              }
            } else {
              // load NEXT video if available
              if (ytPlayer !== undefined) {
                ytPlayer.loadVideoById(ytpVideoID);

                // update AJS play_pause button (set playing)
                var largePlayerPlayPauseButton = document.getElementById('large_player_play_pause');
                largePlayerPlayPauseButton.classList.remove('amplitude-paused');
                largePlayerPlayPauseButton.classList.add('amplitude-playing');              
              } else {
                // update AJS play_pause button (set paused)
                var largePlayerPlayPauseButton = document.getElementById('large_player_play_pause');
                largePlayerPlayPauseButton.classList.remove('amplitude-playing');
                largePlayerPlayPauseButton.classList.add('amplitude-paused');              
              }
            }

            // reset|update current time settings
            resetCurrentTimeContainerYTP();
            updateDurationTimeContainerYTP(ytPlayer);

            // replace new song name (meta-container)
            var songName = document.getElementsByClassName("song-name");          
            songName[0].innerHTML = songMetaData.name; // player-bottom
            songName[1].innerHTML = songMetaData.name; // playlist-screen

            // load cover image for next video
            var coverImage;
            var selector   = ".cover-image-" + playlist;
            coverImage     = document.querySelector(selector);
            coverImage.src = songMetaData.cover_art_url;

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

            // update AJS play_pause button
            var largePlayerPlayPauseButton = document.getElementById('large_player_play_pause');
            largePlayerPlayPauseButton.classList.remove('amplitude-paused');
            largePlayerPlayPauseButton.classList.add('amplitude-playing');

            // on LAST item, don't activate item in playlist 
            if (songIndex !== songs.length-1) {
              // set song active in playlist
              setSongPlayed(playerID, songIndex);
            }

            // deactivate AJS events (if any)
            event.stopImmediatePropagation();   
          }); // END EventListener 'click' previous button
        } // END if
      } // END for

      // click on song container
      // TODO: Fix for multiple players in page
      // ---------------------------------------------------------------------
      var largetPlayerSongContainer = document.getElementsByClassName("amplitude-song-container");
      for (var i=0; i<largetPlayerSongContainer.length; i++) {
        var classArray  = [].slice.call(largetPlayerSongContainer[i].classList, 0);
        var classString = classArray.toString();
  
        if (classString.includes(ytPlayerID)) {
          largetPlayerSongContainer[i].addEventListener('click', function(event)  {
            var ytpVideoID, playlist, playerID, songs, songIndex;

            playlist  = this.getAttribute("data-amplitude-playlist");
            playerID  = playlist + '_large';
            songs     = j1.adapter.amplitude.data.ytPlayers[playerID].songs;
            songIndex = parseInt(this.getAttribute("data-amplitude-song-index"));

            // update global song index (start at 0)
            ytpSongIndex = songIndex

            // save YT player GLOBAL data for later use (e.g. events)
            j1.adapter.amplitude.data.ytpGlobals['activeIndex']    = songIndex;
            j1.adapter.amplitude.data.ytpGlobals['activePlaylist'] = playlist;            

            // save YT player data for later use (e.g. events)
            j1.adapter.amplitude.data.ytPlayers[playerID].activeIndex = ytpSongIndex;

            // set (current) song data
            songMetaData  = songs[ytpSongIndex];
            songIndex     = songMetaData.index;
            songURL       = songMetaData.url;
            ytpSongIndex  = songIndex;
            ytpVideoID    = songURL.split('=')[1];

            var playerState = ytPlayer.getPlayerState();
            if ((playerState === YT_PLAYER_STATE.PLAYING || playerState === YT_PLAYER_STATE.PAUSED) && j1.adapter.amplitude.data.ytPlayers[playerID].videoID  === ytpVideoID) {
              // do NOT interupt CURRENT video (song) is playing|paused
              return;
            } else {
              // save YT player GLOBAL data for later use (e.g. events)
              j1.adapter.amplitude.data.ytpGlobals['activeIndex']    = ytpSongIndex;
              j1.adapter.amplitude.data.ytpGlobals['activePlaylist'] = playlist; 

              // save YT player data for later use (e.g. events)
              j1.adapter.amplitude.data.ytPlayers[playerID].videoID = ytpVideoID;
            }

            // reset|update current time settings
            resetCurrentTimeContainerYTP();
            updateDurationTimeContainerYTP(ytPlayer);

            // load cover image for next video
            var coverImage;
            var selector   = ".cover-image-" + playlist;
            coverImage     = document.querySelector(selector);
            coverImage.src = songMetaData.cover_art_url;

            // replace new song name (meta-container)
            var songName = document.getElementsByClassName("song-name");          
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

            // update AJS play_pause button
            var largePlayerPlayPauseButton = document.getElementById('large_player_play_pause');
            largePlayerPlayPauseButton.classList.remove('amplitude-paused');
            largePlayerPlayPauseButton.classList.add('amplitude-playing');

            // set song active in playlist
            setSongPlayed(ytPlayerID, songIndex);

            // load new video
            ytPlayer.loadVideoById(ytpVideoID);

            // do NOT bubble up
            event.stopPropagation();

            // deactivate AJS events (if any)
            event.stopImmediatePropagation();           
          }); // END EventListener 'click' SongContainer
        } // END if
      } // END for

      // add listeners to all progress bars found
      // TODO: Fix for multiple players in page
      // -----------------------------------------------------------------------
      var progressBars = document.getElementsByClassName("large-player-progress");
      if (progressBars.length) {
        for (var i=0; i<progressBars.length; i++) {
          var progressBar = progressBars[i];
          var progressId  = progressBars[i].id;
          var playerId    = progressId.split('large_player_progress_')[1];

          // save YT player data for later use (e.g. events)
          j1.adapter.amplitude.data.ytPlayers[playerId].progressBar = progressBar;

          progressBars[i].addEventListener('click', function(event)  {
            var playerState = ytPlayer.getPlayerState();

            if ((playerState === YT_PLAYER_STATE.PLAYING || playerState === YT_PLAYER_STATE.PAUSED) && ytPlayer !== undefined) {
              var progressBar, percentage, time;
              progressBar = this;
              percentage  = getProgressBarSelectedPositionPercentage(event, progressBar);
              time        = getTimeFromPercentage(ytPlayer, percentage);

              // seek video to current time
              ytpSeekTo(ytPlayer, time);
        
              // set current progess value if valid
              if (isFinite(percentage)) {
                progressBar.value = percentage;
              }
            } // END if ytPlayer

            // deactivate AJS events (if any)
            event.stopImmediatePropagation();   
          }); // END EventListener 'click'
        } // END for
      } // END if progressBars

      // add listeners to all volume_sliders found
      // TODO: Fix for multiple players in page
      // -----------------------------------------------------------------------
      var volumSliders = document.getElementsByClassName("amplitude-volume-slider");
      if (volumSliders.length) {
        for (var i=0; i<volumSliders.length; i++) {
          var volumSlider   = volumSliders[i];
          var sliderId      = volumSliders[i].id;
          var playerId      = progressId.split('large_player_progress_')[1];

          // save YT player data for later use (e.g. events)
          j1.adapter.amplitude.data.ytPlayers[playerId].volumeSlider = volumSlider;

          volumSliders[i].addEventListener('click', function(event)  {
            var playerState = ytPlayer.getPlayerState();

            if ((playerState === YT_PLAYER_STATE.PLAYING || playerState === YT_PLAYER_STATE.PAUSED) && ytPlayer !== undefined) {
              var volumSlider, volumeValue;
              var currenVolume = ytPlayer.getVolume();

              volumSlider = this;
              volumeValue = parseInt(volumSlider.value);

              ytPlayer.setVolume(volumeValue);
            } // END if ytPlayer

          }); // END EventListener 'click'
        } // END for
      } // END if volumSliders

      // add listeners to all mute buttons found
      // TODO: Fix for multiple buttons in page
      // -----------------------------------------------------------------------
      var volumMutes = document.getElementsByClassName("amplitude-mute");
      if (volumMutes.length) {
        for (var i=0; i<volumMutes.length; i++) {
          var volumMute = volumMutes[i];
          var playerId  = progressId.split('large_player_progress_')[1];

          // save YT player data for later use (e.g. events)
          j1.adapter.amplitude.data.ytPlayers[playerId].volumMute = volumMute;

          volumMutes[i].addEventListener('click', function(event)  {
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
      } // END if volumMutes

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