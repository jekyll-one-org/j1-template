---
regenerate: true
---

{%- capture cache -%}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/modules/amplitudejs/js/plugins/tech/ytp.30.js
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
 # ~/assets/theme/j1/modules/amplitudejs/js/plugins/tech/ytp.30.js
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
  var ytpLoop               = true;
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
  var activeAudioElement    = {};
  var playlistScrollMin     = 5;
  var delayAfterVideoSwitch = 750;
  var fadeAudio             = true;
  var singleAudio           = true;
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
    var currentVolume, playlist, playerID;

    playlist = activeAudioElement.playlist;
    playerID = playlist + '_large';

    // seek video to START position
    ytpSeekTo(player, startSec, true);

    // fade-in audio (if enabled)
    if (fadeAudio) {
      currentVolume = player.getVolume();
      ytpFadeInAudio({
        playerID:     playerID,
        targetVolume: currentVolume,
        speed:        'default'
      });
    } // END if fadeAudio

  } // END processOnVideoStart

  // ---------------------------------------------------------------------------
  // processOnVideoEnd(player)
  //
  // ---------------------------------------------------------------------------
  function processOnVideoEnd(player) {
    var currentVideoTime,
        playlist, playerID, songIndex, songs;

    playlist            = activeAudioElement.playlist;
    playerID            = playlist + '_large';
    currentVideoTime    = player.getCurrentTime();
    songIndex           = activeAudioElement.index;
    songs               = j1.adapter.amplitude.data.ytPlayers[playerID].songs;

    // fade-out audio (if enabled)
    if (fadeAudio) {
      ytpFadeOutAudio({
      playerID:     playerID,
      speed:        'default'
      });
    } // END if fadeAudio

    // mute audio on LAST video
    if (songIndex === songs.length-1) {
      player.mute();
    }

    // load next video
    logger.debug('\n' + 'load next video');
    loadNextVideo(playlist, songIndex);

  } // END processOnVideoEnd  

  // ---------------------------------------------------------------------------
  // getSongIndex(songArray, videoID)
  //
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
      logger.warn('\n' + 'no volume slider found at playerID: ' + settings.playerID);
      return;
    }

    // (ytPlayer.isMuted()) && ytPlayer.unMute();

    // skip fade-in when volume is already at target value
    // if (ytPlayer.getVolume() >= targetVolume) {
    //   logger.warn('\n' + 'skipped fade-in for current video on volume: ', targetVolume);
    //   return;
    // }

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
      logger.warn('\n' + 'no volume slider found at playerID: ' + settings.playerID);
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

    logger.info('\n' + 'Initialize plugin|tech (ytp) : started');

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

      logger.debug('\n' + 'switch video at trackID|ID: ', trackID + '|' + ytVideoID);
      ytPlayer.loadVideoById(ytVideoID);

      // delay after switch video
      if (delayAfterVideoSwitch) {
        ytPlayer.mute();
        setTimeout(() => {
          ytPlayer.unMute();
        }, delayAfterVideoSwitch);
      }

      // update global song index
      ytpSongIndex = songIndex;

      // load the song cover image
      loadCoverImage(songMetaData);

      // update meta data
      updatMetaContainers(songMetaData);
  
      // set song (video) active at index in playlist
      setSongActive(playlist, songIndex);
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

      logger.debug('\n' + 'switch video at trackID|ID: ', trackID + '|' + ytpVideoID);
      ytPlayer.loadVideoById(ytVideoID);

      // delay after switch video
      if (delayAfterVideoSwitch) {
        ytPlayer.mute();
        setTimeout(() => {
          ytPlayer.unMute();
        }, delayAfterVideoSwitch);
      }

      // load the song cover image
      loadCoverImage(songMetaData);
  
      // update meta data
      updatMetaContainers(songMetaData);
  
      // set AJS play_pause button paused
      var playPauseButtonClass = `large-player-play-pause-${playerID}`
      setPlayPauseButtonPaused(playPauseButtonClass);

      // set song (video) active at index in playlist
      setSongActive(playlist, songIndex);

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
          var hours, minutes, seconds,
              ytPlayer, ytPlayerReady, playerVolumePreset,
              playListName, songsInPlaylist, titleListLargePlayer;

          ytPlayer            = event.target;
          ytPlayerReady       = true;
          playerVolumePreset  = parseInt({{player.volume_slider.preset_value}});

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

          // update GLOBAL var activeAudioElement for the ACTIVE song (video)
          // -------------------------------------------------------------------
          setInterval(function() {
            checkActiveAudioElementYTP();
          }, 500); // END checkActiveAudioElementYTP

          logger.info('\n' + 'plugin|tech initializing time: ' + (endTimeModule-startTimeModule) + 'ms');

        } // END onPlayerReady()

        // ---------------------------------------------------------------------
        // OnPlayerStateChange
        //
        // update YT player on state change        
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
          songMetaData  = songs[songIndex];

          // do nothing on state 'unstarted'
          if (event.data === YT_PLAYER_STATE.UNSTARTED) {
            // do nothing on state 'unstarted'
            logger.debug('\n' + 'do nothing on playlist at trackID|state: ' + playlist + ' ' + trackID + '|' + 'unstarted');
            return;
          }

          // save YT player GLOBAL data for later use (e.g. events)
          j1.adapter.amplitude.data.activePlayer                 = 'ytp';
          j1.adapter.amplitude.data.ytpGlobals['activePlayer']   = ytPlayer;
          j1.adapter.amplitude.data.ytpGlobals['activeIndex']    = songIndex;   // ytpSongIndex;
          j1.adapter.amplitude.data.ytpGlobals['activePlaylist'] = playlist;   

          // save YT player data for later use (e.g. events)
          j1.adapter.amplitude.data.ytPlayers.{{player.id}}.player = ytPlayer;
          j1.adapter.amplitude.data.ytPlayers.{{player.id}}.activeIndex = songIndex;   // ytpSongIndex;

          // reset time container|progressbar for the ACTIVE song (video)
          // -------------------------------------------------------------------          
          resetCurrentTimeContainerYTP(ytPlayer, songMetaData);
          updateDurationTimeContainerYTP(ytPlayer, songMetaData);
          // resetProgressBarYTP(playerID);

          if (event.data === YT_PLAYER_STATE.CUED) {
            // do nothing on state 'cued'
            logger.debug('\n' + 'current video state: ' + YT_PLAYER_STATE_NAMES[event.data]);
            return;
          }

          if (event.data == YT_PLAYER_STATE.BUFFERING) {
            // do nothing on state 'buffering'

            // var activeSong    = getActiveSong();
            // var playlist      = activeSong.playlist;
            // var songIndex     = activeSong.index;
            // var trackID       = songIndex + 1;

            // logger.debug('\n' + 'video at trackID|state: ' + trackID + '|' + YT_PLAYER_STATE_NAMES[event.data]);
            logger.debug('\n' + 'current video state: ' + YT_PLAYER_STATE_NAMES[event.data]);
            return;
          } 

          if (event.data === YT_PLAYER_STATE.PAUSED) {
            var activeSongSettings  = getActiveSong();
            var playlist            = activeSongSettings.playlist;
            var songIndex           = activeSongSettings.index;
            var trackID             = songIndex + 1;

            logger.debug('\n' + 'pause video at playlist|trackID: ' + playlist + '|' + trackID);
            return;
          }

          if (event.data === YT_PLAYER_STATE.PLAYING) {
            var activeSongSettings    = getActiveSong();
            var playlist              = activeSongSettings.playlist;
            var playerID              = activeSongSettings.playerID;
            var songs                 = activeSongSettings.songs;
            var songIndex             = activeSongSettings.index;
            var trackID               = songIndex + 1;
            var songMetaData          = activeSongSettings.songs[songIndex];

            logger.debug('\n' + 'play video at playlist|trackID: ' + playlist + '|' + trackID);

            // save YT player GLOBAL data for later use (e.g. events)
            j1.adapter.amplitude.data.activePlayer              = 'ytp';
            j1.adapter.amplitude.data.ytpGlobals['activeIndex'] = songIndex;
            j1.adapter.amplitude.data.ytpGlobals['videoID']     = ytpVideoID;

            // save YT player data for later use (e.g. events)
            j1.adapter.amplitude.data.ytPlayers[playerID].activeIndex = songIndex;

            // update time container for the ACTIVE song (video)
            // -----------------------------------------------------------------
            setInterval(function() {
              updateCurrentTimeContainerYTP(ytPlayer, songMetaData);
            }, 500);

            // update time progressbar for the ACTIVE song (video)
            // -----------------------------------------------------------------
            setInterval(function() {
              updateProgressBarsYTP();
            }, 500);

            // check|process video for configured START position (if enabled)
            // -----------------------------------------------------------------
            var songStartEnabled = (songMetaData.start.includes(':') ? true : false);
            if (songStartEnabled) {
              var songStart      = songMetaData.start;
              var songStartSec   = timestamp2seconds(songStart);
              var tsStartSec     = seconds2timestamp(songStartSec);
              // var ytpCurrentTime = getActiveSong().currentTime;
              var ytpCurrentTime = ytPlayer.getCurrentTime();

              if (ytpCurrentTime < songStartSec) {
                logger.debug('\n' + 'start video at trackID|timestamp: ' + trackID + '|' + tsStartSec);
                processOnVideoStart(ytPlayer, songStartSec);
              }

            } // END if songStartEnabled

            // check|process video for configured END position (if enabled)
            // -----------------------------------------------------------------
            var songEndEnabled = (songMetaData.end.includes(':') ? true : false);
            if (songEndEnabled) {
                var songEnd     = songMetaData.end;
                var songEndSec  = timestamp2seconds(songEnd);
                var tsEndSec    = seconds2timestamp(songEndSec);

                var checkOnVideoEnd = setInterval(function() {
                  // var currentVideoTime = getActiveSong().currentTime;
                  var currentVideoTime = ytPlayer.getCurrentTime();

                  if (currentVideoTime >= songEndSec) {
                    logger.debug('\n' + 'end video at trackID|timestamp: ' + trackID + '|' + tsEndSec);
                    processOnVideoEnd(ytPlayer);

                    clearInterval(checkOnVideoEnd);
                  } // END if currentVideoTime
                }, 500); // END checkOnVideoEnd

              } // END if songEndEnabled

          } // END YT_PLAYER_STATE PLAYING

          // load|play NEXT|FIRST song (video) in playlist
          // -------------------------------------------------------------------
          if (event.data === YT_PLAYER_STATE.ENDED) {
            // var playlist          = j1.adapter.amplitude.data.ytpGlobals.activePlaylist;
            // var songIndex         = j1.adapter.amplitude.data.ytpGlobals.activeIndex;
            // var songIndex      = j1.adapter.amplitude.data.ytPlayers[player].activeIndex;
            var playerID            = playlist + '_large';

            // fade-in audio (if enabled)
            if (fadeAudio) {
              // logger.debug('\n' + 'fade-in current video at trackID|second: ' + trackID + '|' + songStartSec);
              logger.debug('\n' + 'fade-in current video at trackID|timestamp: ' + trackID + '|' + tsStartSec);

              var currentVolume = ytPlayer.getVolume();
                ytpFadeInAudio({
                playerID:     playerID,
                targetVolume: currentVolume,
                speed:        'default'
              });
            } // END if fadeAudio

            // load next video
            loadNextVideo(playlist, songIndex);

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
  // updatMetaContainers(metaData)
  //
  // update song name in meta-containers
  // ---------------------------------------------------------------------------  
  function updatMetaContainers(metaData) {
    var playerID, playlist, songName, artistName, albumName,
        largePlayerSongAudioRating;

    playlist = metaData.playlist;
    playerID = playlist + '_large';

    // update song name in meta-containers
    songName = document.getElementsByClassName("song-name");
    if (songName.length) {
      for (var i=0; i<songName.length; i++) {    
        var currentPlaylist = songName[i].dataset.amplitudePlaylist;
        if (currentPlaylist === playlist) {
          songName[i].innerHTML = metaData.name;
        }
      }
    }

    // update artist name in meta-containers
    artistName = document.getElementsByClassName("artist");
    if (artistName.length) {
      for (var i=0; i<artistName.length; i++) {    
        var currentPlaylist = songName[i].dataset.amplitudePlaylist;
        if (currentPlaylist === playlist) {
          artistName[i].innerHTML = metaData.artist;
        }
      }
    }

    // update album name in meta-containers
    albumName = document.getElementsByClassName("album");
    if (albumName.length) {
      for (var i=0; i<albumName.length; i++) {    
        var currentPlaylist = songName[i].dataset.amplitudePlaylist;
        if (currentPlaylist === playlist) {
          albumName[i].innerHTML = metaData.album;
        }
      }
    }

    // update song rating in screen controls
    largePlayerSongAudioRating = document.getElementsByClassName("audio-rating-screen-controls");
    if (largePlayerSongAudioRating.length) {
      for (var i=0; i<largePlayerSongAudioRating.length; i++) {
        var currentPlaylist = largePlayerSongAudioRating[i].dataset.amplitudePlaylist;
        if (currentPlaylist === playlist) {
          if (metaData.rating) {
            var trackID = metaData.index + 1;

            // save YT player data for later use (e.g. events)
            j1.adapter.amplitude.data.ytPlayers[playerID].videoID = metaData.videoID;

            logger.debug('\n' + 'update song rating for trackID|playlist at: ', trackID + '|' + playlist + ' = ' + metaData.rating);
            largePlayerSongAudioRating[i].innerHTML = '<img src="/assets/image/pattern/rating/scalable/' + metaData.rating + '-star.svg"' + 'alt="song rating">';
          } else {
            largePlayerSongAudioRating[i].innerHTML = '';
          }
        }
      }
    } // END if largePlayerSongAudioRating

  } // END updatMetaContainers

  // ---------------------------------------------------------------------------
  // loadCoverImage(metaData)
  //
  // load the configured cover image for a specic song (metaData)
  // ---------------------------------------------------------------------------  
  function loadCoverImage(metaData) {
    var selector, coverImage;

    selector       = ".cover-image-" + metaData.playlist;
    coverImage     = document.querySelector(selector);
    coverImage.src = metaData.cover_art_url;
  } // END loadCoverImage

  // ---------------------------------------------------------------------------
  // stopActivePlayers(exceptPlayer)
  //
  // if multiple players used on a page, stop active AT|YT players
  // running in parallel to exceptPlayer
  // ---------------------------------------------------------------------------  
  function stopActivePlayers(exceptPlayer) {

    // stop active AT players
    // -------------------------------------------------------------------------
    var atpPlayerState = Amplitude.getPlayerState();
    if (atpPlayerState === 'playing') {
      Amplitude.stop();
    } // END stop active AT players

    // stop active YT players
    // -------------------------------------------------------------------------
    const ytPlayers = Object.keys(j1.adapter.amplitude.data.ytPlayers);
    for (let i=0; i<ytPlayers.length; i++) {
      const ytPlayerID = ytPlayers[i];
      const playerProperties = j1.adapter.amplitude.data.ytPlayers[ytPlayerID];

      if (ytPlayerID !== exceptPlayer) {
        var player        = j1.adapter.amplitude['data']['ytPlayers'][ytPlayerID]['player'];
        var playerState   = (player.getPlayerState() > 0) ? player.getPlayerState() : 6;
        var ytPlayerState = YT_PLAYER_STATE_NAMES[playerState];

        // if (ytPlayerState === 'playing' || ytPlayerState === 'paused' || ytPlayerState === 'buffering' || ytPlayerState === 'cued' || ytPlayerState === 'unstarted') {
        if (ytPlayerState === 'playing' || ytPlayerState === 'paused' || ytPlayerState === 'buffering' || ytPlayerState === 'cued' || ytPlayerState === 'unstarted') {
          logger.debug('\n' + 'stop player id: ' + ytPlayerID + ' stopped');
          // player.mute();
          player.stopVideo();
          j1.adapter.amplitude.data.ytpGlobals.activeIndex = 0;
        }
      }
    } // END stop active YT players

  } // END stopActivePlayers

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
  // checkActiveAudioElementYTP
  //
  // 
  // ---------------------------------------------------------------------------
  function checkActiveAudioElementYTP() {
    var activeAudioElements = document.getElementsByClassName("amplitude-active-song-container");
    if (activeAudioElements.length) {
      var classArray  = [].slice.call(activeAudioElements[0].classList, 0); 
      var classString = classArray.toString();

      // activeAudioElement.html          = activeAudioElements[0];
      activeAudioElement.playlist         = activeAudioElements[0].dataset.amplitudePlaylist;
      activeAudioElement.index            = parseInt(activeAudioElements[0].dataset.amplitudeSongIndex);
      activeAudioElement.playerType       = (classString.includes('large') ? 'large' : 'compact');
      activeAudioElement.playerID         = activeAudioElement.playlist + '_' + activeAudioElement.playerType;

      if (j1.adapter.amplitude.data.ytPlayers[activeAudioElement.playerID] !== undefined) {
        activeAudioElement.player         = j1.adapter.amplitude.data.ytPlayers[activeAudioElement.playerID].player;
        activeAudioElement.songs          = j1.adapter.amplitude.data.ytPlayers[activeAudioElement.playerID].songs;

        var activeSong                    = activeAudioElement.songs[activeAudioElement.index];

        activeAudioElement.album          = activeSong.album;
        activeAudioElement.artist         = activeSong.artist;
        activeAudioElement.audio_info     = activeSong.audio_info;
        activeAudioElement.audio_single   = activeSong.audio_single;
        activeAudioElement.currentTime    = parseFloat(activeAudioElement.player.getCurrentTime());
        activeAudioElement.cover_art_url  = activeSong.cover_art_url;
        activeAudioElement.duration       = activeSong.duration;
        activeAudioElement.endSec         = timestamp2seconds(activeSong.end);
        activeAudioElement.endTS          = activeSong.end;
        activeAudioElement.name           = activeSong.name;
        activeAudioElement.rating         = activeSong.album;
        activeAudioElement.startSec       = timestamp2seconds(activeSong.start);
        activeAudioElement.startTS        = activeSong.start;
        activeAudioElement.url            = activeSong.url;

        var videoArray                    = activeSong.url.split('=');

        activeAudioElement.videoID        = videoArray[1];

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

    if(!isObjectEmpty(activeAudioElement)) {
      return activeAudioElement;
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
          logger.error('\n' + 'YT player not defined');
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
  // updateDurationTimeContainerYTP(player, metaData)
  //
  // update time container values for current video
  // ---------------------------------------------------------------------------
  function updateDurationTimeContainerYTP(player, metaData) {
    var hours, minutes, seconds;
    var durationHours, durationMinutes, durationSeconds;
    var activeSongSettings, ytPlayer, playlist;

    activeSongSettings = getActiveSong();

    if (!activeSongSettings) {
      return false;
    }

    if (activeSongSettings) {
      ytPlayer = activeSongSettings.player;
      playlist = activeSongSettings.playlist;
    } else {
      ytPlayer = player;
      playlist = metaData.playlist;      
    }

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
  function updateCurrentTimeContainerYTP(player, metaData) {
    var hours, minutes, seconds;
    var currentHours, currentMinutes, currentSeconds;
    var playlist;

    playlist = metaData.playlist;

    // get current hours|minutes|seconds
    hours   = ytpGetCurrentHours(player);
    minutes = ytpGetCurrentMinutes(player);
    seconds = ytpGetCurrentSeconds(player);

    // set GLOBAL player current time
    // ytPlayerCurrentTime = ytPlayer.getCurrentTime();

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
  // resetProgressBarYTP
  //
  // Reset YTP specific progress data
  // ---------------------------------------------------------------------------
  function resetProgressBarYTP(playerID) {
    if (playerID !== undefined) {
      var progressBar   = j1.adapter.amplitude.data.ytPlayers[playerID].progressBar;
      progressBar.value = 0;
    }

    return;    
  } // END resetProgressBarYTP

  // ---------------------------------------------------------------------------
  // resetCurrentTimeContainerYTP
  //
  // Reset YTP specific CURRENT time data
  // ---------------------------------------------------------------------------  
  function resetCurrentTimeContainerYTP(player, metaData) {
    
    if (metaData === undefined || player === undefined) {
      return;
    }

    var playlist = metaData.playlist;

    // reset duration|hours
    var currentHours = document.getElementsByClassName("amplitude-current-hours");
    if (currentHours.length) {
      for (var i=0; i<currentHours.length; i++) {    
        var currentPlaylist = currentHours[i].dataset.amplitudePlaylist;
        if (currentPlaylist === playlist) {
          currentHours[i].innerHTML = '00';
        }
      }
      // currentHours[0].innerHTML = '00';
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
      // currentMinutes[0].innerHTML = '00';
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
      // currentSeconds[0].innerHTML = '00';      
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
        
        // Overload AJS play_pause button for YT
        // TODO: Fix for multiple players in page
        // ---------------------------------------------------------------------
        var largePlayerPlayPauseButton = document.getElementsByClassName(playerButton);
        for (var i=0; i<largePlayerPlayPauseButton.length; i++) {
          var classArray  = [].slice.call(largePlayerPlayPauseButton[i].classList, 0);
          var classString = classArray.toString();

          if (classString.includes(ytPlayerID)) {
            largePlayerPlayPauseButton[i].addEventListener('click', function(event) {
              var playlist            = this.getAttribute("data-amplitude-playlist");
              var playerID            = playlist + '_large';
              var activeSongSettings  = getActiveSong();
              var songIndex;

              // TODO: Extend getSongIndex() for singleAudio
              // var songIndex      = (singleAudio) ? ytpSongIndex : getSongIndex(songs, ytVideoID);
              if (!activeSongSettings) {
                songIndex     = 0;
                ytpSongIndex  = 0;
              } else {
                if (activeSongSettings.playlist !== playlist) {
                  songIndex    = 0;
                  ytpSongIndex = 0;

                  // reset previous player settings
                  activeSongSettings.player.stopVideo();
                  resetProgressBarYTP(activeSongSettings.playerID);
                  var playPauseButtonClass = `large-player-play-pause-${activeSongSettings.playerID}`;
                  togglePlayPauseButton(playPauseButtonClass);
                } else {
                  songIndex = ytpSongIndex;
                }
              }

              // set song (video) active at index in playlist
              setSongActive(playlist, songIndex);

              // update activeAudio data (manually)
              checkActiveAudioElementYTP();

              var activeSongSettings  = getActiveSong();
              var songs               = activeSongSettings.songs;
              var songMetaData        = songs[songIndex];
              var ytPlayer            = activeSongSettings.player;

              if (j1.adapter.amplitude.data.activePlayer !== 'not_set') {
                logger.debug('\n' + 'active player type: ' + j1.adapter.amplitude.data.activePlayer);
              }

              // stop active AT|YT players
              stopActivePlayers(playerID);

              // update meta data
              updatMetaContainers(songMetaData);              

              // save player GLOBAL data for later use (e.g. events)
              j1.adapter.amplitude.data.activePlayer                 = 'ytp';
              j1.adapter.amplitude.data.ytpGlobals['activeIndex']    = songIndex;
              j1.adapter.amplitude.data.ytpGlobals['activePlaylist'] = playlist;

              // setTimeout(() => {
                // YT play|pause video
                // ---------------------------------------------------------------
                var playerState   = ytPlayer.getPlayerState();
                if (playerState < 0) {
                  var ytPlayerState = YT_PLAYER_STATE_NAMES[6];
                } else {
                  var ytPlayerState = YT_PLAYER_STATE_NAMES[playerState];
                }

                if (ytPlayerState === 'playing') {
                  ytPlayer.pauseVideo();
                  
                  var playPauseButtonClass = `large-player-play-pause-${ytPlayerID}`;
                  togglePlayPauseButton(playPauseButtonClass);

                  // reset|update time settings
                  resetCurrentTimeContainerYTP(ytPlayer, songMetaData);
                  updateDurationTimeContainerYTP(ytPlayer, songMetaData);                
                }

                if (ytPlayerState === 'paused') {
                  var ytpCurrentTime = ytPlayer.getCurrentTime();
                  ytPlayer.playVideo();
                  ytpSeekTo(ytPlayer, ytpCurrentTime, true);

                  var playPauseButtonClass = `large-player-play-pause-${ytPlayerID}`;
                  togglePlayPauseButton(playPauseButtonClass);

                  // reset|update time settings
                  resetCurrentTimeContainerYTP(ytPlayer, songMetaData);
                  updateDurationTimeContainerYTP(ytPlayer, songMetaData);                  
                }

                if (ytPlayerState === 'cued') {
                  ytPlayer.playVideo();
                  var playPauseButtonClass = `large-player-play-pause-${ytPlayerID}`;
                  togglePlayPauseButton(playPauseButtonClass);

                  // set song at songIndex active in playlist
                  setSongActive(playlist, songIndex);

                  // reset|update time settings
                  resetCurrentTimeContainerYTP(ytPlayer, songMetaData);
                  updateDurationTimeContainerYTP(ytPlayer, songMetaData);                  
                }

                // TODO: unclear why state 'unstarted' is generated
                // on LAST item
                // workaround sofar
                if (ytPlayerState === 'unstarted') {
                  ytPlayer.playVideo();
                  // ytPlayer.mute();              
                  
                  var playPauseButtonClass = `large-player-play-pause-${ytPlayerID}`;
                  togglePlayPauseButton(playPauseButtonClass);
                  resetCurrentTimeContainerYTP(ytPlayer, songMetaData);
                  updateDurationTimeContainerYTP(ytPlayer, songMetaData);                  
                }

              // }, 500);

              // deactivate AJS events (if any)
              event.stopImmediatePropagation();
            }); // END EventListener largePlayerPlayPauseButton 'click'
          }
        } // END largePlayerPlayPauseButton

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
                // var buffered = ytpSeekTo(ytPlayer, currentTime + skipOffset, true);
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
              var playlist, playerID, songIndex, trackID,
                  songs, songMetaData, songName, songURL,
                  ytPlayer, ytpVideoID;

              songIndex = ytpSongIndex;
              playlist  = this.getAttribute("data-amplitude-playlist");
              playerID  = playlist + '_large';
              songs     = j1.adapter.amplitude.data.ytPlayers[playerID].songs;
              ytPlayer  = j1.adapter.amplitude.data.ytPlayers[playerID].player;

              if (ytPlayer === undefined) {
                logger.error('\n' + 'YT player not defined');
              }

              // stop active AT|YT players
              stopActivePlayers(playerID);

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
              logger.debug('\n' + 'switch video at trackID|ID: ', trackID + '|' + ytpVideoID);
              ytPlayer.loadVideoById(ytpVideoID);

              // delay after switch video
              if (delayAfterVideoSwitch) {
                ytPlayer.mute();
                setTimeout(() => {
                  ytPlayer.unMute();
                }, delayAfterVideoSwitch);
              }

              if (songIndex === 0) {

                // continue paused on FIRST video
                // TODO: handle on player|shuffle different (do play)
                ytPlayer.pauseVideo();

                // reset|update time settings
                resetCurrentTimeContainerYTP(ytPlayer, songMetaData);
                updateDurationTimeContainerYTP(ytPlayer, songMetaData);
                // resetProgressBarYTP(playerID);

                // set AJS play_pause button paused
                var playPauseButtonClass = `large-player-play-pause-${ytPlayerID}`;
                // setPlayPauseButtonPlaying(playPauseButtonClass);
                togglePlayPauseButton(playPauseButtonClass);
              } else {
                // toggle AJS play_pause button
                var playPauseButtonClass = `large-player-play-pause-${ytPlayerID}`;
                togglePlayPauseButton(playPauseButtonClass);
              }

              // reset|update current time settings
              resetCurrentTimeContainerYTP(ytPlayer, songMetaData);
              updateDurationTimeContainerYTP(ytPlayer, songMetaData);
              // resetProgressBarYTP(playerID);

              // load the song cover image
              loadCoverImage(songMetaData);

              // update meta data
              updatMetaContainers(songMetaData);

              // set song at songIndex active in playlist
              setSongActive(playlist, songIndex);

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

            if (ytPlayer === undefined) {
              logger.error('\n' + 'YT player not defined');
            }

            // stop active AT|YT players
            stopActivePlayers(playerID);

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

            // load next video
            // -----------------------------------------------------------------

            // save YT player data for later use (e.g. events)
            j1.adapter.amplitude.data.activePlayer                    = 'ytp';
            j1.adapter.amplitude.data.ytPlayers[playerID].activeIndex = songIndex;
            j1.adapter.amplitude.data.ytPlayers[playerID].videoID     = ytpVideoID; 

            trackID = songIndex + 1;
            logger.debug('\n' + 'switch video at trackID|ID: ', trackID + '|' + ytpVideoID);
            ytPlayer.loadVideoById(ytpVideoID);

            // delay after switch video
            if (delayAfterVideoSwitch) {
              ytPlayer.mute();
              setTimeout(() => {
                ytPlayer.unMute();
              }, delayAfterVideoSwitch);
            }

            if (songIndex === 0) {

              // continue paused on FIRST video
              // TODO: handle on player|shuffle different (do play)
              ytPlayer.pauseVideo();

              // reset|update time settings
              resetCurrentTimeContainerYTP(ytPlayer, songMetaData);
              updateDurationTimeContainerYTP(ytPlayer, songMetaData);
              // resetProgressBarYTP(playerID);

              // set AJS play_pause button paused
              var playPauseButtonClass = `large-player-play-pause-${ytPlayerID}`;
              // setPlayPauseButtonPlaying(playPauseButtonClass);
              togglePlayPauseButton(playPauseButtonClass);
            } else {
              // toggle AJS play_pause button
              var playPauseButtonClass = `large-player-play-pause-${ytPlayerID}`;
              togglePlayPauseButton(playPauseButtonClass);
            }

            // reset|update current time settings
            resetCurrentTimeContainerYTP(ytPlayer, songMetaData);
            updateDurationTimeContainerYTP(ytPlayer, songMetaData);
            // resetProgressBarYTP(playerID);

            // load the song cover image
            loadCoverImage(songMetaData);

            // update meta data
            updatMetaContainers(songMetaData);

            // set song at songIndex active in playlist
            setSongActive(playlist, songIndex);

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
              songs, songIndex, songName,
              singleAudio, changedAudio, trackID,
              ytPlayer, ytpVideoID;

          activeSongSettings  = getActiveSong();

          // set (current) playlist|song data
          playlist    = this.getAttribute("data-amplitude-playlist");
          playerID    = playlist + '_large';
          songIndex   = parseInt(this.getAttribute("data-amplitude-song-index"));
          trackID     = songIndex + 1;

          if (activeSongSettings) {
            if (activeSongSettings.playlist !== playlist) {
              // set current player settings
              songs     = j1.adapter.amplitude.data.ytPlayers[playerID].songs;
              ytPlayer  = j1.adapter.amplitude.data.ytPlayers[playerID].player;              

              // reset previous player settings
              activeSongSettings.player.stopVideo();
              resetProgressBarYTP(activeSongSettings.playerID);
              var playPauseButtonClass = `large-player-play-pause-${activeSongSettings.playerID}`;
              togglePlayPauseButton(playPauseButtonClass);
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

          // set (current) song meta data
          songMetaData  = songs[songIndex];
          songURL       = songMetaData.url;
          ytpVideoID    = songURL.split('=')[1];
            
          // do nothing on state 'playing'|'paused' if videoID has NOT changed
          playerState  = ytPlayer.getPlayerState();
          changedAudio = (j1.adapter.amplitude.data.ytPlayers[playerID].videoID !== ytpVideoID) ? true : false;          
          if (!changedAudio && (playerState === YT_PLAYER_STATE.PLAYING || playerState === YT_PLAYER_STATE.PAUSED)) {
            // do NOT interupt CURRENT video (song) playing|paused
            logger.debug('\n' + `do not interrupt video at trackID|state: ${trackID} | ${YT_PLAYER_STATE_NAMES[playerState]}`);
            return;
          }

          // update global song index (start at 0)
          ytpSongIndex  = songIndex;

          // stop active AT|YT players
          stopActivePlayers(playerID);

          // save YT player GLOBAL data for later use (e.g. events)
          j1.adapter.amplitude.data.activePlayer                 = 'ytp';
          j1.adapter.amplitude.data.ytpGlobals['activeIndex']    = songIndex;
          j1.adapter.amplitude.data.ytpGlobals['activePlaylist'] = playlist;            

          // save YT player data for later use (e.g. events)
          j1.adapter.amplitude.data.ytPlayers[playerID].activeIndex = songIndex;
          j1.adapter.amplitude.data.ytPlayers[playerID].videoID     = ytpVideoID;

          // reset|update current time settings
          resetCurrentTimeContainerYTP(ytPlayer, songMetaData);
          //updateDurationTimeContainerYTP(ytPlayer, songMetaData);
          // resetProgressBarYTP(playerID);

          // load the song cover image
          loadCoverImage(songMetaData);

          // update meta data
          updatMetaContainers(songMetaData);

          // set AJS play_pause button playing
          var playPauseButtonClass = `large-player-play-pause-${ytPlayerID}`;
          setPlayPauseButtonPlaying(playPauseButtonClass)

          // set song at songIndex active in playlist
          setSongActive(playlist, songIndex);

          // save YT player data for later use (e.g. events)
          j1.adapter.amplitude.data.ytPlayers[playerID].activeIndex = songIndex;
          j1.adapter.amplitude.data.ytPlayers[playerID].videoID     = ytpVideoID;          

          // load next video
          // -------------------------------------------------------------------
          trackID = songIndex + 1;
          logger.debug('\n' + 'switch video at trackID|ID: ', trackID + '|' + ytpVideoID);
          ytPlayer.loadVideoById(ytpVideoID);

          // mute sound after next video load
          // -------------------------------------------------------------------
          if (delayAfterVideoSwitch) {
            ytPlayer.mute();
            setTimeout(() => {
              ytPlayer.unMute();
            }, delayAfterVideoSwitch);
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
        if (progressBars[i].dataset.amplitudeSource === 'audio') {
          // do nothing (managed by adapter)
        } else {
          var progressBar = progressBars[i];
          var progressId  = progressBars[i].id;
          var playerID    = progressId.split('large_player_progress_')[1];

          // save YT player data for later use (e.g. events)
          j1.adapter.amplitude.data.ytPlayers[playerID].progressBar = progressBar;

          progressBars[i].addEventListener('click', function(event)  {
            var activeSongSettings = getActiveSong();

            if (!activeSongSettings) {
              // do nothing if current video (audio) item is NOT selected|active
              return;
            }

            var playlist = this.getAttribute("data-amplitude-playlist");
            if (activeSongSettings.playlist !== playlist) {
              // do nothing on PREVIOUS playlist (player)
              return;              
            }

            var ytPlayer    = activeSongSettings.player; 
            var playerState = ytPlayer.getPlayerState();

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

            // deactivate AJS events (if any)
            event.stopImmediatePropagation();   
          }); // END EventListener 'click'
        }
      } // END for
    } // END if progressBars

    // add listeners to all volume sliders found
    // TODO: Fix for multiple players in page
    // -------------------------------------------------------------------------
    var volumeSliders = document.getElementsByClassName("amplitude-volume-slider");
    if (volumeSliders.length) {
      for (var i=0; i<volumeSliders.length; i++) {
        var volumeSlider   = volumeSliders[i];
        var sliderID      = volumeSliders[i].id;
        var playerID      = progressId.split('large_player_progress_')[1];

        // save YT player data for later use (e.g. events)
        j1.adapter.amplitude.data.ytPlayers[playerID].volumeSlider = volumeSlider;

        volumeSliders[i].addEventListener('click', function(event) {
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
      } // END for
    } // END if volumeSliders

    // add listeners to all mute buttons found
    // TODO: Fix for multiple buttons in page
    // -------------------------------------------------------------------------
    var volumeMutes = document.getElementsByClassName("amplitude-mute");
    if (volumeMutes.length) {
      for (var i=0; i<volumeMutes.length; i++) {
        var volumMute = volumeMutes[i];
        var playerID  = progressId.split('large_player_progress_')[1];  

        // save YT player data for later use (e.g. events)
        j1.adapter.amplitude.data.ytPlayers[playerID].volumMute = volumMute;

        volumeMutes[i].addEventListener('click', function(event) {
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