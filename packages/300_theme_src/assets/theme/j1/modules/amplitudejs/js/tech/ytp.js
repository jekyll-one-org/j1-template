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
{% assign amplitude_defaults  = modules.defaults.amplitude.defaults %}
{% assign amplitude_settings  = modules.amplitude.settings %}

{% comment %} Set config options (settings only)
-------------------------------------------------------------------------------- {% endcomment %}
{% assign amplitude_options   = amplitude_defaults | merge: amplitude_settings %}

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
// const YT_PLAYER_STATE = {
var YT_PLAYER_STATE = {
  UNSTARTED:  -1,
  ENDED:       0,
  PLAYING:     1,
  PAUSED:      2,
  BUFFERING:   3,
  CUED:        5
};

var firstScriptTag;
var ytPlayer;
var ytPlayerReady     = false;
var ytApiReady        = false;
var logger            = log4javascript.getLogger('j1.adapter.amplitude.tech');

// YT Player settings data (created dynamically)
// -----------------------------------------------------------------------------
// var ytPlayers         = {};
// var ytPlayersMap      = new Map();

// AmplitudeJS API settings
// -----------------------------------------------------------------------------

var dependency;
var playerCounter     = 0;
var load_dependencies = {};

// set default song index to FIRST item
var songIndex         = 0;
var ytpSongIndex      = 0;

var ytpAutoPlay       = false;
var ytpLoop           = true;
var playLists         = {};
var playersUILoaded   = { state: false };
var apiInitialized    = { state: false };
var amplitudeDefaults = $.extend({}, {{amplitude_defaults | replace: 'nil', 'null' | replace: '=>', ':' }});
var amplitudeSettings = $.extend({}, {{amplitude_settings | replace: 'nil', 'null' | replace: '=>', ':' }});
var amplitudeOptions  = $.extend(true, {}, amplitudeDefaults, amplitudeSettings);

var playerExistsInPage = false;
var ytpContainer       = null;
var playerProperties   = {};
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

  // ---------------------------------------------------------------------------
  // Base YT functions and events
  // ---------------------------------------------------------------------------

  // Recursive function to MERGE objects
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

  // Add property path dynamically to an existing object
  // Example: addNestedProperty(j1.adapter.amplitude.data, 'playlist.profile.name', 'Max Mustermann')
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

  // Add (nested) object dynamically to an existing object
  // Example: createNestedObject(myObject, ['level1', 'arrayProperty', 0], 'element1');
  function addNestedObject(obj, path, value) {
    const lastKey = path[path.length - 1];
    let current = obj;
  
    path.slice(0, -1).forEach(key => {
      current[key] = current[key] || {};
      current = current[key];
    });
  
    current[lastKey] = value;
  }

  // load YT Iframe player API
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

  // setup YTPlayerUiEvents for AJS players
  function initUiEventsForAJS() {

      var dependencies_ytp_ready = setInterval (() => {
      var ytApiReady    = (j1.adapter.amplitude.data.ytpGlobals['ytApiReady']    !== undefined) ? j1.adapter.amplitude.data.ytpGlobals['ytApiReady']    : false;
      var ytPlayerReady = (j1.adapter.amplitude.data.ytpGlobals['ytPlayerReady'] !== undefined) ? j1.adapter.amplitude.data.ytpGlobals['ytPlayerReady'] : false;

      if (ytApiReady && ytPlayerReady) {

        {% for player in amplitude_settings.players %}{% if player.enabled %}

          {% if player.source == empty %}
            {% assign player_source = amplitude_defaults.player.source %}
          {% else %}
            {% assign player_source = player.source %}
          {% endif %}

          {% if player_source == 'video' %}
          var playerID = '{{player.id}}';
          mimikYTPlayerUiEventsForAJS(playerID);
          {% endif %}

        {% endif %}{% endfor %}

        clearInterval(dependencies_ytp_ready);
        logger.info('\n' + 'Initialize APIPlayers : ready');
      } // END if ready

    }, 10); // END dependencies_ytp_ready
  } // END initUiEventsForAJS()

  // Create a player after Iframe player API is ready to use
  // ---------------------------------------------------------------------------
  function onYouTubeIframeAPIReady() {
    // var currentOptions;
    var playerSource;

    ytApiReady     = true;
    // currentOptions = $.extend({}, {{amplitude_options | replace: 'nil', 'null' | replace: '=>', ':' }});

    {% for player in amplitude_options.players %}{% if player.enabled %}
      {% capture xhr_container_id %}{{player.id}}_parent{% endcapture %}

      playerSource = '{{player.source}}';

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
              'onReady':        {{player.id}}OnPlayerReady,
              'onStateChange':  {{player.id}}OnPlayerStateChange
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

          // save YT player data for later use (e.g. events)
          // j1.adapter.amplitude.data.ytpGlobals['ytVideoID']        = ytpVideoID;
          // j1.adapter.amplitude.data.ytpGlobals['ytPlayerDefaults'] = amplitudeDefaults.player;
          // j1.adapter.amplitude.data.ytpGlobals['ytPlayerSettings'] = playerSettings;
          j1.adapter.amplitude.data.ytpGlobals['ytApiReady']       = ytApiReady;
          

          // reset current player
          playerExistsInPage = false;

        } // END if playerExistsInPage()

        // run AJS YouTube Player initialization
        // ---------------------------------------------------------------------
        function {{player.id}}OnPlayerReady(event) {
          var hours, minutes, seconds;
          var ytPlayer      = event.target;
          var ytPlayerReady = true;

          logger.info('\n' + 'AJS YouTube Player on ID {{player.id}}: ready');

          // save YT player data for later use (e.g. events)
          j1.adapter.amplitude.data.ytpGlobals['ytPlayerReady'] = ytPlayerReady;
          j1.adapter.amplitude.data.ytPlayers.{{player.id}}.playerReady = ytPlayerReady;

          // setInterval(updateCurrentTimeContainerYTP, 1000);
          // setInterval(updateProgressBarsYTP, 1000)

          // get duration hours (if configured)
          if ({{player.display_hours}} ) {
            hours = ytpGetDurationHours (ytPlayer);
          }

          // get duration minutes|seconds
          minutes = ytpGetDurationMinutes (ytPlayer);
          seconds = ytpGetDurationSeconds (ytPlayer);

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

        // update YT player elements on state change (playing)
        // ---------------------------------------------------------------------
        function {{player.id}}OnPlayerStateChange(event) {
          var playlist      = j1.adapter.amplitude.data.ytPlayers.{{player.id}}.playerSettings.playlist.name;
          var playerID      = playlist + '_large';
          var ytPlayer      = j1.adapter.amplitude.data.ytPlayers.{{player.id}}.player;
          var songs         = j1.adapter.amplitude.data.ytPlayers.{{player.id}}.songs;
          // var activeIndex   = j1.adapter.amplitude.data.ytPlayers.{{player.id}}.activeIndex;
          
          // set active ytPlayer
          j1.adapter.amplitude.data.ytpGlobals['activePlayer'] = ytPlayer;

          // save YT player data for later use (e.g. events)
          // j1.adapter.amplitude.data.ytPlayers.{{player.id}}.player = ytPlayer;

          resetCurrentTimeContainerYTP();
          updateDurationTimeContainerYTP(ytPlayer);

          // setInterval(updateCurrentTimeContainerYTP, 1000);
          // setInterval(updateProgressBarsYTP('{{player.id}}'), 1000)

          // Set the index of the active song (index starts by 0)
          // ytpSetActiveIndex({{player.id}}, activeIndex);

          if (event.data === YT_PLAYER_STATE.PLAYING || event.data === YT_PLAYER_STATE.BUFFERING) {
            setInterval(updateCurrentTimeContainerYTP, 1000);
            setInterval(updateProgressBarsYTP, 1000);

            // j1.adapter.amplitude.data.ytpGlobals['activePlayer'] = ytPlayer;
          }

          // play next video
          if (event.data === YT_PLAYER_STATE.ENDED) {

            // var ytPlayer  = j1.adapter.amplitude.data.ytpGlobals['ytPlayer'];
            // var ytPlayer  = j1.adapter.amplitude.data.ytPlayers.{{player.id}}.player;
            // var songs     = j1.adapter.amplitude.data.ytpGlobals['ytPlayerSongs'];            
            // var songIndex = parseInt(j1.adapter.amplitude.data.ytpGlobals['ytpSongIndex']) + 1;

            var songIndex;
            songIndex    = ytpSongIndex;
            songIndex++;
            ytpSongIndex = songIndex;

            // var songIndex = j1.adapter.amplitude.data.ytPlayers[playerID].activeIndex
            // songIndex++

            // update activeIndex
            // j1.adapter.amplitude.data.ytPlayers[playerID].activeIndex = songIndex;

            if (songIndex < songs.length) {
              var songMetaData  = songs[songIndex];
              var songURL       = songMetaData.url;
              var ytpVideoID    = songURL.split('=')[1];       

              // continue on next video
              ytPlayer.loadVideoById(ytpVideoID);

              // reset|update time settings
              resetCurrentTimeContainerYTP();
              updateDurationTimeContainerYTP(ytPlayer);

              // update global song index for next video
              ytpSongIndex = songIndex;
              // ytpSetActiveIndex({{player.id}}, songIndex);

              // save YT player data for later use (e.g. events)
              // j1.adapter.amplitude.data.ytpGlobals['ytpSongIndex'] = ytpSongIndex;

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
                  largetPlayerSongAudioRating[0].innerHTML = songMetaData.rating + ' <i class="mdib mdib-star md-gray-400 mdib-18px"></i>';
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

              // set song active in playlist              
              // setSongPlayed(songIndex); 
              setSongPlayed(playerID, songIndex);
            } else {
              // select FIRST video
              songIndex = 0;
              var songMetaData  = songs[songIndex];
              var songURL       = songMetaData.url;
              var ytpVideoID    = songURL.split('=')[1];

              // ytpSetActiveIndex({{player.id}}, songIndex);

              // continue (paused) on FIRST video
              ytPlayer.loadVideoById(ytpVideoID);
              // wait some time to make sure video is loaded|active
              setTimeout(() => {
                ytPlayer.pauseVideo();
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

              // save YT player data for later use (e.g. events)
              // j1.adapter.amplitude.data.ytpGlobals['ytpSongIndex'] = ytpSongIndex;

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
                  largetPlayerSongAudioRating[0].innerHTML = songMetaData.rating + ' <i class="mdib mdib-star md-gray-400 mdib-18px"></i>';
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
              // setSongPlayed(songIndex);
              setSongPlayed(playerID, songIndex);
            }
          } // END if YT_PLAYER_STATE.ENDED

        } // END {{player.id}}OnPlayerStateChange

      {% endif %}
    {% endif %}{% endfor %}

  } // END onYouTubeIframeAPIReady ()


  // ---------------------------------------------------------------------------
  // main (plugin)
  // ---------------------------------------------------------------------------
  // load|initialize YT Iframe player API
  //
  initYtAPI();

  // setup YTPlayerUiEvents for AJS players
  //
  initUiEventsForAJS();


  // ---------------------------------------------------------------------------
  // Base AJS Player functions
  // ---------------------------------------------------------------------------
  
  // ---------------------------------------------------------------------------
  // Returns the index of the current video (song) in the songs array
  // that is currently playing (starts by 0)
  // ---------------------------------------------------------------------------
  //
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
  // Add class 'amplitude-active-song-container' to the element containing
  // visual information for the active song.
  //
  // NOTE: We then don't care if shuffle is on or not.
  // ---------------------------------------------------------------------------
  //
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
          // activeIndex = Amplitude.getActiveIndex();
          activeIndex = index;
        } else {
          if (Amplitude.getConfig().shuffle_on) {
            // activeIndex = Amplitude.getConfig().shuffle_list[Amplitude.getActiveIndex()];
          } else {
          // activeIndex = Amplitude.getActiveIndex();
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

  // Returns the position as a percentage the user clicked in player progressbar
  // NOTE: The percentage is out of [0.00 .. 1.00]
  // ---------------------------------------------------------------------------
  function getProgressBarSelectedPositionPercentage (event, progessBar) {
    var offset     = progessBar.getBoundingClientRect();
    var xpos       = event.pageX - offset.left;
    var percentage = (parseFloat(xpos) / parseFloat(progessBar.offsetWidth)).toFixed(2);

    return percentage;
  }

  // Returns the time in seconds calculated from a percentage value
  // NOTE: The percentage is out of [0.00 .. 1.00]
  // ---------------------------------------------------------------------------
  function getTimeFromPercentage (player, percentage) {
    var videoDuration = ytpGetDuration(player);
    var time          = parseFloat((videoDuration * percentage).toFixed(2));

    return time;
  }

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

    // calc procent value (float, 2 decimals [0.00 .. 1.00])
    // progress = parseFloat((ytPlayer.getCurrentTime() / ytPlayer.getDuration()).toFixed(2));

    // // jadams, 2024-12-07: added check on finite value
    // if (!isFinite(progress)) {
    //   // TODO: check why progress value may NOT finite
    //   progressBar.value = 0;
    // } else if (progress === 1) {
    //   // reset progress value for next video
    //   progressBar.value = 0;
    // } else {
    //   // calculate current progress
    //   progress = parseFloat((ytPlayer.getCurrentTime() / ytPlayer.getDuration()).toFixed(2));
    //   progressBar.value = progress;

    // save YT player progress data for later use (e.g. events)
    // j1.adapter.amplitude.data.ytpGlobals['ytPlayerProgress'] = progress;      
    //}
  }

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
  }

  // Update YTP specific CURRENT time data
  // ---------------------------------------------------------------------------
  function updateCurrentTimeContainerYTP() {
    var hours, minutes, seconds;
    var currentHours, currentMinutes, currentSeconds;

    // get current hours|minutes|seconds
    hours   = ytpGetCurrentHours(ytPlayer);
    minutes = ytpGetCurrentMinutes(ytPlayer);
    seconds = ytpGetCurrentSeconds(ytPlayer);

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
  }

  // Reset YTP specific progress data
  // ---------------------------------------------------------------------------
  function resetProgressBarYTP(playerID) {
    if (playerID !== undefined) {
      var progressBar   = j1.adapter.amplitude.data.ytPlayers[playerID].progressBar;
      progressBar.value = 0;
    }
  }

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
  }


  // ---------------------------------------------------------------------------
  // Mimik Base AJS API functions
  // ---------------------------------------------------------------------------

  // Seek (skip) video to time specified
  // ---------------------------------------------------------------------------
  function ytpSeekTo(player, time) {
    player.seekTo(time, true);
  } // END ytpSeekTo

  // Returns the buffered percentage of the playing video
  // ---------------------------------------------------------------------------
  function ytpGetBuffered(player) {
    // to be defined
  }

  // Returns the active song index (in the songs array, starts by 0)
  // ---------------------------------------------------------------------------
  function ytpGetActiveIndex(playerID) {
    var activeIndex = -1;

    if (j1.adapter.amplitude.data.ytPlayers[playerID].activeIndex !== undefined) {
        activeIndex = parseInt(j1.adapter.amplitude.data.ytPlayers[playerID].activeIndex);
    }

    return activeIndex;
  } // END ytpGetActiveIndex

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

  // Returns the percentage of the video played
  // ---------------------------------------------------------------------------
  function ytpGetPlayedPercentage(player) {
     // to be defined
  }

  // Returns the actual video element
  // ---------------------------------------------------------------------------
  function ytpGetAudio(player) {
     // to be defined
  }

  // Returns available playback speeds for the player
  // ---------------------------------------------------------------------------
  function ytpGetPlaybackSpeeds(player) {
     // to be defined
  }

  // Returns the current playback speed for the player
  // ---------------------------------------------------------------------------
  function ytpGetPlaybackSpeed(player) {
  }

  // Returns the current state of the player
  // ---------------------------------------------------------------------------
  function ytpGetPlayerState(player) {
     // to be defined
  }

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
  // mimikYTPlayerUiEventsForAJS()
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
              var activeIndex     = parseInt(j1.adapter.amplitude['data']['ytPlayers'][playerID]['activeIndex']); 
              var songMetaData    = songs[songIndex];
              var playPauseButton = `large-player-play-pause-${ytPlayerID}`;

              // toggle YT play|pause video
              if (ytPlayer.getPlayerState() === YT_PLAYER_STATE.PLAYING || ytPlayer.getPlayerState() === YT_PLAYER_STATE.BUFFERING) {
                ytPlayer.pauseVideo();
              } else {
                ytPlayer.playVideo();
              }

              // toggle AJS PlayPauseButton
              var largePlayerPlayPauseButton = document.getElementsByClassName(playPauseButton);
              if (largePlayerPlayPauseButton[0].classList.contains('amplitude-paused')) {
                largePlayerPlayPauseButton[0].classList.remove('amplitude-paused');
                largePlayerPlayPauseButton[0].classList.add('amplitude-playing');
              } else {
                largePlayerPlayPauseButton[0].classList.remove('amplitude-playing');
                largePlayerPlayPauseButton[0].classList.add('amplitude-paused');
              }

              // don't activate playlist item on FIRST || LAST song
              // if (songIndex !== 0 && songIndex !== songs.length - 1) {
              if (songIndex !== songs.length - 1) {              
                // set song active in playlist
                //setSongPlayed(songIndex);
                setSongPlayed(playerID, songIndex);
              }

              // event.preventDefault();
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
              // var songIndex  = parseInt(j1.adapter.amplitude.data.ytPlayers[playerID].activeIndex);
              var songIndex     =  ytpSongIndex;
              var songs         = j1.adapter.amplitude.data.ytPlayers[playerID].songs;
              var ytPlayer      = j1.adapter.amplitude.data.ytPlayers[playerID].player;

              // var songs     = j1.adapter.amplitude['data']['ytPlayers'][playerID].songs
              // var ytPlayer  = j1.adapter.amplitude['data']['ytPlayers'][playerID].player;

              // if (songIndex < songs.length) {
              if (songIndex < songs.length-1) {
                // set song on next item
                songIndex++;
                ytpSongIndex = songIndex;

                // j1.adapter.amplitude.data.ytPlayers[playerID].activeIndex = songIndex;
              }
              // else {
              //   songIndex--;
              // }

              // collect (next) song data
              // if (songIndex < songs.length) {
              if (songIndex < songs.length-1) {
                songMetaData  = songs[songIndex];
                songURL       = songMetaData.url;
                ytpVideoID    = songURL.split('=')[1];
              } else {
                songIndex     = 0;
                // j1.adapter.amplitude.data.ytPlayers[playerID].activeIndex = songIndex;
                songMetaData  = songs[songIndex];
                songURL       = songMetaData.url;
                ytpVideoID    = songURL.split('=')[1];
              }

              // pause song (video) if FIRST item reached
              // TODO: handle on player|shuffle different (do play)
              if (songMetaData.index === 0) {

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
              var coverImage;
              var selector   = ".cover-image-" + playlist;
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
                  largetPlayerSongAudioRating[0].innerHTML = songMetaData.rating + ' <i class="mdib mdib-star md-gray-400 mdib-18px"></i>';
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

              // if (songIndex < songs.length) {
              if (songIndex < songs.length-1) {              
                // set song active in playlist
                // setSongPlayed(songIndex);
                setSongPlayed(playerID, songIndex);
                // j1.adapter.amplitude.data.ytPlayers[playerID].activeIndex = songIndex;
              }

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
            // var songIndex = parseInt(j1.adapter.amplitude.data.ytPlayers[playerID].activeIndex);
            var songIndex = ytpSongIndex;
            var songs     = j1.adapter.amplitude.data.ytPlayers[playerID].songs;
            var ytPlayer  = j1.adapter.amplitude.data.ytPlayers[playerID].player;  

            if (songIndex < songs.length-1) {
              // set song on previous item
              songIndex--;
              ytpSongIndex = songIndex;
              // j1.adapter.amplitude.data.ytPlayers[playerID].activeIndex = songIndex;
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
              // j1.adapter.amplitude.data.ytPlayers[playerID].activeIndex = songIndex;
              songMetaData  = songs[songIndex];
              songURL       = songMetaData.url;
              ytpSongIndex  = songIndex;
              ytpVideoID    = songURL.split('=')[1];
            }

            // save YT player data for later use (e.g. events)
            // j1.adapter.amplitude.data.ytpGlobals['ytpSongIndex'] = ytpSongIndex;

            // pause song (video) if FIRST item reached
            // TODO: handle on player|shuffle different (do play)
            if (songMetaData.index === 0) {
              ytpSongIndex = 0;

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
                largetPlayerSongAudioRating[0].innerHTML = songMetaData.rating + ' <i class="mdib mdib-star md-gray-400 mdib-18px"></i>';
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
            if (songIndex !== songs.length - 1) {
              // set song active in playlist
              // setSongPlayed(songIndex);
              setSongPlayed(playerID, songIndex);
            }

            // set song active in playlist
            // setSongPlayed(songIndex);
            // setSongPlayed(playerID, songIndex);

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
            var ytpVideoID;
            var activeSongIndex;
            var success;

            var playlist        = this.getAttribute("data-amplitude-playlist");
            var playerID        = playlist + '_large';
            // var ytpSongIndex    = parseInt(this.getAttribute("data-amplitude-song-index"));
            var songs           = j1.adapter.amplitude.data.ytPlayers[playerID].songs;

            // update global song index
            ytpSongIndex = parseInt(this.getAttribute("data-amplitude-song-index"));

            // get active song index if video (song) is playing
            activeSongIndex = getSongPlayed();

            // if (activeSongIndex >= 0) {
            //   success = ytpSetActiveIndex(playerID, activeSongIndex);
            // } else {
            //   success = ytpSetActiveIndex(playerID, ytpSongIndex);
            // }

            // save YT player data for later use (e.g. events)
            // j1.adapter.amplitude.data.ytpGlobals['ytPlayerSongs'] = songs;
            // j1.adapter.amplitude.data.ytpGlobals['ytpSongIndex'] = ytpSongIndex;

            var playerState = ytPlayer.getPlayerState();
            if (playerState === YT_PLAYER_STATE.PLAYING && ytpSongIndex === activeSongIndex) {
              // do NOT interupt current video (song) is playing
              return;
            } else {
              // set (current) song data
              songMetaData  = songs[ytpSongIndex];
              songIndex     = songMetaData.index;
              songURL       = songMetaData.url;
              ytpSongIndex  = songIndex;
              ytpVideoID    = songURL.split('=')[1];            
              // load new video
              ytPlayer.loadVideoById(ytpVideoID);
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
                largetPlayerSongAudioRating[0].innerHTML = songMetaData.rating + ' <i class="mdib mdib-star md-gray-400 mdib-18px"></i>';
              } else {
                largetPlayerSongAudioRating[0].innerHTML = '';
              }
            } // END if largetPlayerSongAudioRating

            // update AJS play_pause button
            var largePlayerPlayPauseButton = document.getElementById('large_player_play_pause');
            largePlayerPlayPauseButton.classList.remove('amplitude-paused');
            largePlayerPlayPauseButton.classList.add('amplitude-playing');

            // set song active in playlist
            // if (event.currentTarget.className.includes(ytPlayerID)) {
            //   setSongPlayed(songIndex);
            // }

            // set song active in playlist
            setSongPlayed(ytPlayerID, songIndex);

            // do NOT bubble up
            event.stopPropagation();

            // deactivate AJS events (if any)
            event.stopImmediatePropagation();           
          }); // END EventListener 'click' SongContainer
        } // END if
      } // END for

      // add listeners to all progress bars found
      // TODO: Fix for multiple players in page
      // ---------------------------------------------------------------------
      var progressBars = document.getElementsByClassName("large-player-progress");
      if (progressBars.length) {
        for (var i=0; i<progressBars.length; i++) {
          var progressBar = progressBars[i];
          //        var id          = bar.id.split('large-player-progress_')[0];
          //        var progressId  = progressBars[i].id.split('large-player-progress_')[0];
          var progressId  = progressBars[i].id;
          var playerId    = progressId.split('large_player_progress_')[1];

          // save YT player data for later use (e.g. events)
          // j1.adapter.amplitude.data.ytpGlobals['ytPlayerProgressBar'] = progressBars[i];
          // j1.adapter.amplitude.data.ytPlayers[playerId].progressBar   = progressId;
          j1.adapter.amplitude.data.ytPlayers[playerId].progressBar = progressBar;

          progressBars[i].addEventListener('click', function(event)  {
            // if (ytPlayer.getPlayerState() === YT_PLAYER_STATE.PLAYING) {
            if (ytPlayer !== undefined) {
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

    } // END if playerType large'
  }
} // END mimikYTPlayerUiEventsForAJS

{%- endcapture -%}

{%- if production -%}
  {{ cache|minifyJS }}
{%- else -%}
  {{ cache|strip_empty_lines }}
{%- endif -%}

{%- assign cache = false -%}