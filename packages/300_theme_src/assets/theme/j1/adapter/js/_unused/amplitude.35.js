---
regenerate:                             true
---

{%- capture cache -%}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/adapter/js/amplitude.35.js
 # Liquid template to adapt J1 AmplitudeJS Apps
 #
 # Product/Info:
 # https://jekyll.one
 # Copyright (C) 2023-2025 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # For details, see: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
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

{% comment %} Variables
-------------------------------------------------------------------------------- {% endcomment %}
{% assign comments            = amplitude_options.enabled %}

{% comment %} Detect prod mode
-------------------------------------------------------------------------------- {% endcomment %}
{% assign production = false %}
{% if environment == 'prod' or environment == 'production' %}
  {% assign production = true %}
{% endif %}

/*
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/adapter/js/amplitude.35.js
 # J1 Adapter for the amplitude module
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2023-2025 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # For details, see: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 # -----------------------------------------------------------------------------
 # Adapter generated: {{site.time}}
 # -----------------------------------------------------------------------------
*/

// -----------------------------------------------------------------------------
// ESLint shimming
// -----------------------------------------------------------------------------
/* eslint indent: "off"                                                       */
// -----------------------------------------------------------------------------

"use strict";
j1.adapter.amplitude = ((j1, window) => {

  // global settings
  // ---------------------------------------------------------------------------
  var environment   = '{{environment}}';
  var cookie_names  = j1.getCookieNames();
  var user_state    = j1.readCookie(cookie_names.user_state);
  var state         = 'not_started';

  // module settings
  // ---------------------------------------------------------------------------

  // control|logging
  // ---------------------------------------------------------------------------
  var _this;
  var logger;
  var logText;
  var toJSON;
  var toText;

  // date|time monitoring
  //----------------------------------------------------------------------------
  var startTime;
  var endTime;
  var startTimeModule;
  var endTimeModule;
  var timeSeconds;

  // AmplitudeJS API settings
  // ---------------------------------------------------------------------------
  const AT_PLAYER_STATE = {
    ENDED:          0,
    PLAYING:        1,
    PAUSED:         2,
    STOPPED:        3,
    PREVIOUS:       4,
    NEXT:           5,
    CHANGED:        6,
  };

  const AT_PLAYER_STATE_NAMES = {
    0:              "ended",
    1:              "playing",
    2:              "paused",
    3:              "stopped",
    4:              "previous",
    5:              "next",
    6:              "changed",
  };

  // var ytpSongIndex    = "0";
  // var ytpAutoPlay     = false;
  // var ytpLoop         = true;

  var playLists       = {};
  var playersUILoaded = { state: false };
  var apiInitialized  = { state: false };

  // var playList;
  // var playerID;
  // var playerType;
  // var playListTitle;
  // var playListName;

  var amplitudePlayerState;
  var amplitudeDefaults;
  var amplitudePlayers
  var amplitudePlaylists
  var amplitudeOptions;
  var ytPlayer;
  var ytpPlaybackRate

  var xhrLoadState;
  var dependency;
  var pluginManagerEnabled;
  var playerExistsInPage;

  // AmplitudeJS Player DEFAULT settings
  // ---------------------------------------------------------------------------
  var playerCounter                     = 0;
  var load_dependencies                 = {};
  var playersProcessed                  = [];
  var playersHtmlLoaded                 = false;
  var processingPlayersFinished         = false;
  var pluginManagerRunOnce              = false;

  var playerAudioInfo                   = ('{{amplitude_defaults.playlist.audio_info}}' === 'true') ? true : false;
  var playerDefaultPluginManager        = ('{{amplitude_defaults.player.plugin_manager.enabled}}' === 'true') ? true : false;
  var playerDefaultType                 = '{{amplitude_defaults.player.type}}';
  var playerVolumeValue                 = '{{amplitude_defaults.player.volume_slider.preset_value}}';
  var playerVolumeSliderStep            = '{{amplitude_defaults.player.volume_slider.slider_step}}';
  var playerRepeat                      = ('{{amplitude_defaults.player.repeat}}' === 'true') ? true : false;
  var playerShuffle                     = ('{{amplitude_defaults.player.shuffle}}' === 'true') ? true : false;
  var playerPlayNextTitle               = ('{{amplitude_defaults.player.play_next_title}}' === 'true') ? true : false;
  var playerPauseNextTitle              = ('{{amplitude_defaults.player.pause_next_title}}' === 'true') ? true : false;
  var playerDelayNextTitle              = '{{amplitude_defaults.player.delay_next_title}}';
  var playerForwardBackwardSkipSeconds  = '{{amplitude_defaults.player.forward_backward_skip_seconds}}';

  // AmplitudeJS settings curently NOT used
  // ---------------------------------------------------------------------------
  var playerWaveformsEnabled           = '{{amplitude_defaults.player.waveforms.enabled}}';
  var playerWaveformsSampleRate        = '{{amplitude_defaults.player.waveforms.sample_rate}}';
  var playerVisualizationEnabled       = '{{amplitude_defaults.player.visualization.enabled}}';
  var playerVisualizationName          = '{{amplitude_defaults.player.visualization.name}}';

  // ---------------------------------------------------------------------------
  // helper functions
  // ---------------------------------------------------------------------------

  // ---------------------------------------------------------------------------
  // main
  // ---------------------------------------------------------------------------
  return {

    // -------------------------------------------------------------------------
    // adapter initializer
    // -------------------------------------------------------------------------
    init: (options) => {

      // -----------------------------------------------------------------------
      // default module settings
      // -----------------------------------------------------------------------
      var settings = $.extend({
        module_name:  'j1.adapter.amplitude',
        generated:    '{{site.time}}'
      }, options);

      // -----------------------------------------------------------------------
      // global variable settings
      // -----------------------------------------------------------------------
      amplitudeDefaults  = $.extend({}, {{amplitude_defaults  | replace: 'nil', 'null' | replace: '=>', ':' }});
      amplitudePlayers   = $.extend({}, {{amplitude_players   | replace: 'nil', 'null' | replace: '=>', ':' }});
      amplitudePlaylists = $.extend({}, {{amplitude_playlists | replace: 'nil', 'null' | replace: '=>', ':' }});
      amplitudeOptions   = $.extend(true, {}, amplitudeDefaults, amplitudePlayers, amplitudePlaylists);

      // save AJS player setiings for later use (e.g. the AJS plugins)
      // j1.adapter.amplitude['amplitudeDefaults'] = amplitudeDefaults;
      // j1.adapter.amplitude['amplitudeSettings'] = amplitudeSettings;
      // j1.adapter.amplitude['amplitudeOptions']  = amplitudeOptions;

      // -----------------------------------------------------------------------
      // control|logging settings
      // -----------------------------------------------------------------------
      _this              = j1.adapter.amplitude;
      logger             = log4javascript.getLogger('j1.adapter.amplitude');

      // prepare data element for later use
      j1.adapter.amplitude.data             = {};
      j1.adapter.amplitude.data.ytpGlobals  = {};
      j1.adapter.amplitude.data.ytPlayers   = {};

      // -----------------------------------------------------------------------
      // module initializer
      // -----------------------------------------------------------------------
      var dependencies_met_page_ready = setInterval (() => {
        var pageState      = $('#content').css("display");
        var pageVisible    = (pageState === 'block') ? true : false;
        var j1CoreFinished = (j1.getState() === 'finished') ? true : false;
        var atticFinished  = (j1.adapter.attic.getState() == 'finished') ? true : false;

        if (j1CoreFinished && pageVisible && atticFinished) {
          startTimeModule = Date.now();

          _this.setState('started');
          logger.debug('\n' + 'module state: ' + _this.getState());
          logger.info('\n' + 'module is being initialized');

          // -------------------------------------------------------------------
          // create global playlist (songs)
          // -------------------------------------------------------------------
          var songs = [];
          _this.songLoader(songs);

          // -------------------------------------------------------------------
          // load all players (HTML|UI)
          // -------------------------------------------------------------------
          _this.playerHtmlLoader(playersUILoaded);

          // -------------------------------------------------------------------
          // inititialize amplitude api
          // -------------------------------------------------------------------
          var dependencies_met_players_loaded = setInterval (() => {
            if (playersUILoaded.state) {
              _this.initApi(songs);
              // var playbackRate = ytPlayer.getPlaybackRate();

              clearInterval(dependencies_met_players_loaded);
            } // END if playersUILoaded
          }, 10); // END dependencies_met_players_loaded

          // -------------------------------------------------------------------
          // initialize player specific UI events
          // -------------------------------------------------------------------
          var dependencies_met_api_initialized = setInterval (() => {
            if (apiInitialized.state) {
              _this.initPlayerUiEvents();

              clearInterval(dependencies_met_api_initialized);
            } // END if apiInitialized
          }, 10); // END dependencies_met_api_initialized

          clearInterval(dependencies_met_page_ready);
        } // END pageVisible
      }, 10); // END dependencies_met_page_ready

    }, // END init

    // -------------------------------------------------------------------------
    // Create global playlist|songs (API)
    // -------------------------------------------------------------------------
    songLoader: (songs) => {

      logger.info('\n' + 'creating global playlist (API): started');

      // -----------------------------------------------------------------------
      // initialize amplitude songs
      // -----------------------------------------------------------------------
      {% for playlist in amplitude_playlists.playlists %} {% if playlist.enabled %}
        var song_items = $.extend({}, {{playlist.items | replace: 'nil', 'null' | replace: '=>', ':' }});

        for (var i = 0; i < Object.keys(song_items).length; i++) {
          if (song_items[i].enabled) {
            var item = song_items[i];
            var song = {};

            // map config settings|amplitude song items
            // -----------------------------------------------------------------
            for (const key in item) {
              // skip properties NOT needed for a song
              if (key === 'item' || key === 'audio_base' || key === 'enabled') {
                continue;
              } else if (key === 'audio') {
                song.url = item.audio_base + '/' + item[key];
                continue;
              } else if (key === 'title') {
                song.name = item[key];
                continue;
              } else if (key === 'name') {
                song.album = item[key];
                continue;
              } else if (key === 'cover_image') {
                song.cover_art_url = item[key];
                continue;
              } else if (key === 'audio_info') {
                song.audio_info = item[key];
                continue;
              } else if (key === 'rating') {
                song.rating = item[key];
                continue;
              } else {
                song[key] = item[key];
              } // END if key
            } // END for item
          } // END id enabled

          songs.push(song);
        } // END for song_items

      {% endif %} {% endfor %}

      logger.info('\n' + 'creating global playlist (API): finished');
    }, // END songLoader

    // -------------------------------------------------------------------------
    // load players HTML portion (UI)
    // -------------------------------------------------------------------------
    playerHtmlLoader: (playersLoaded) => {
      var playerExistsInPage;

      // -----------------------------------------------------------------------
      // initialize HTML portion (UI) for all players configured|enabled
      // -----------------------------------------------------------------------
      logger.info('\n' + 'loading player HTML components (UI): started');

      {% for player in amplitude_options.players %} {% if player.enabled %}
        {% assign xhr_data_path = amplitude_options.xhr_data_path %}
        {% capture xhr_container_id %}{{player.id}}_app{% endcapture %}

        // load players only that are configured in current page
        //
        playerExistsInPage = ($('#' + '{{xhr_container_id}}')[0] !== undefined) ? true : false;
        if (playerExistsInPage) {
          playerCounter++;
          logger.debug('\n' + 'load player UI on ID #{{player.id}}: started');

          j1.loadHTML({
            xhr_container_id: '{{xhr_container_id}}',
            xhr_data_path:    '{{xhr_data_path}}',
            xhr_data_element: '{{player.id}}'
            },
            'j1.adapter.amplitude',
            'data_loaded'
          );

          // dynamic loader variable to setup the player on ID {{player.id}}
          dependency                    = 'dependencies_met_html_loaded_{{player.id}}';
          load_dependencies[dependency] = '';

          // ---------------------------------------------------------------------
          // initialize amplitude instance (when player UI loaded)
          // ---------------------------------------------------------------------
          load_dependencies['dependencies_met_html_loaded_{{player.id}}'] = setInterval (() => {
            // check if HTML portion of the player is loaded successfully
            xhrLoadState = j1.xhrDOMState['#' + '{{xhr_container_id}}'];

            if (xhrLoadState === 'success') {
              playersProcessed.push('{{xhr_container_id}}');
              logger.debug('\n' + 'load player UI on ID #{{player.id}}: finished');

              clearInterval(load_dependencies['dependencies_met_html_loaded_{{player.id}}']);
            }
          }, 10); // END dependencies_met_html_loaded
        } // END if playerExistsInPage

      {% endif %} {% endfor %}

      load_dependencies['dependencies_met_players_loaded'] = setInterval (() => {

        if (playersProcessed.length === playerCounter) {
          processingPlayersFinished = true;
        }

        if (processingPlayersFinished) {
          logger.info('\n' + 'loading player HTML components (UI): finished');

          clearInterval(load_dependencies['dependencies_met_players_loaded']);
          playersLoaded.state = true;
        }
      }, 10); // END dependencies_met_players_loaded

    }, // END playerHtmlLoader

    // -------------------------------------------------------------------------
    // initApi
    // -------------------------------------------------------------------------
    initApi: (songlist) => {

      logger.info('\n' + 'initialze API: started');

      {% comment %} collect playlists
      --------------------------------------------------------------------------  {% endcomment %}
      {% assign playlists_enabled = 0 %}
      {% for list in amplitude_playlists.playlists %} {% if list.enabled %}
        {% assign playlists_enabled = playlists_enabled | plus: 1 %}
      {% endif %} {% endfor %}

      {% assign playlists_processed = 0 %}
      {% for list in amplitude_playlists.playlists %} {% if list.enabled %}
        {% assign playlist_items = list.items %}
        {% assign playlist_name  = list.name %}
        {% assign playlist_title = list.title %}

        {% comment %} collect song items
        NOTE: configure all properties avaialble in songs array
        ------------------------------------------------------------------------ {% endcomment %}
        {% for item in playlist_items %} {% if item.enabled %}
          {% capture song_item %}
          {
            "name":           "{{item.title}}",
            "track":          "{{item.track}}",
            "artist":         "{{item.artist}}",
            "playlist":       "{{item.playlist}}",
            "album":          "{{item.name}}",
            "url":            "{{item.audio_base}}/{{item.audio}}",
            "audio_info":     "{{item.audio_info}}",
            "rating":         "{{item.rating}}",
            "start":          "{{item.start}}",
            "end":            "{{item.end}}",
            "audio_single":   "{{item.audio_single}}",
            "audio_fade":     "{{item.audio_fade}}",
            "cover_art_url":  "{{item.cover_image}}"
          }{% if forloop.last %}{% else %},{% endif %}
          {% endcapture %}
          {% capture song_items %}{{song_items}} {{song_item}}{% endcapture %}

          {% comment %} create playlist
          ---------------------------------------------------------------------- {% endcomment %}
          {% if forloop.last %}
            {% capture playlist %}
            "{{playlist_name}}": {
              "title": "{{playlist_title}}",
              "songs": [
                {{song_items}}
              ]
            }
            {% endcapture %}
            {% assign playlists_processed = playlists_processed | plus: 1 %}

            {% comment %} reset song_items
            --------------------------------------------------------------------  {% endcomment %}
            {% capture song_items %}{% endcapture %}
          {% endif %}
        {% endif %} {% endfor %}

        {% comment %} collect playlists players enabled
        ------------------------------------------------------------------------ {% endcomment %}
        {% capture playlists %}
          {{playlists}} {{playlist}} {% if playlists_processed == playlists_enabled %}{% else %},{% endif %}
        {% endcapture %}

      {% endif %} {% endfor %}

      // See:  https://521dimensions.com/open-source/amplitudejs/docs
      // NOTE: slider VALUE (volume) is set by DEFAULT settings (player)
      Amplitude.init({

        bindings: {
          33:  'play_pause',
          37:  'prev',
          39:  'next'
        },
        songs: songlist,
        playlists: {
          {{playlists}}
        },
        callbacks: {
          initialized: function() {
            var amplitudeConfig = Amplitude.getConfig();
            logger.info('\n' + 'initialze API: finished');
            // indicate api successfully initialized
            apiInitialized.state = true;
          },
          onInitError: function() {
            // indicate api failed on initialization
            apiInitialized.state = false;
            console.error('\n' + 'Amplitude API failed on initialization');
          },
          play: function() {
            onPlayerStateChange(1);
            return;
          },
          pause: function() {
            onPlayerStateChange(2);
            return;
          },
          stop: function() {
            var currentState = Amplitude.getPlayerState();
            onPlayerStateChange(3);
            return;
          },
          song_change: function() {
            var currentState = Amplitude.getPlayerState();
            if (currentState === 'stopped') {
              // onPlayerStateChange(3);
              return;
            }
            return;
          },
          prev: function() {
            var currentState = Amplitude.getPlayerState();
            onPlayerStateChange(4);
            if (playerDelayNextTitle) {
              logger.debug('\n' + 'delay on previous title: ' + songMetaData.name + ' with titleIndex ' + songMetaData.index);
            }

            if (playerPauseNextTitle) {
              amplitudePlayerState = Amplitude.getPlayerState();
              if (amplitudePlayerState === 'playing' || amplitudePlayerState === 'stopped' ) {
                setTimeout(() => {
                  // pause playback of next title
                  logger.debug('\n' + 'paused on next title: ' + songMetaData.name);
                  Amplitude.pause();
                }, 150);
              } // END if playing
            } // END if pause on next title

            return;
          },
          next: function() {
            onPlayerStateChange(5);
            if (playerDelayNextTitle) {
              logger.debug('\n' + 'delay on next title: ' + songMetaData.name + ' with titleIndex ' + songMetaData.index);
            }

            if (playerPauseNextTitle) {
              amplitudePlayerState = Amplitude.getPlayerState();
              if (amplitudePlayerState === 'playing' || amplitudePlayerState === 'stopped' ) {
                setTimeout(() => {
                  // pause playback of next title
                  logger.debug('\n' + 'paused on next title: ' + songMetaData.name);
                  Amplitude.pause();
                }, 150);
              } // END if playing
            } // END if pause on next title

            return;
          },
          ended: function() {
            onPlayerStateChange(0);
            return;            
          }
        }, // END callbacks

        // waveforms: {
        //   sample_rate:    playerWaveformSampleRate
        // },

        continue_next:    playerPlayNextTitle,
        volume:           playerVolumeValue,
        volume_decrement: playerVolumeSliderStep,
        volume_increment: playerVolumeSliderStep

      }); // END Amplitude init

      // -----------------------------------------------------------------------
      // timestamp2seconds
      // -----------------------------------------------------------------------
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

      // -----------------------------------------------------------------------
      // seconds2timestamp
      // -----------------------------------------------------------------------
      function seconds2timestamp(seconds) {

        if (isNaN(seconds)) {
          return false;
        }

        const hours         = Math.floor(seconds / 3600);
        const minutes       = Math.floor((seconds % 3600) / 60);
        const remainSeconds = seconds % 60;
        const tsHours       = hours.toString().padStart(2, '0');
        const tsMinutes     = minutes.toString().padStart(2, '0');
        const tsSeconds     = remainSeconds.toString().padStart(2, '0');
      
        return `${tsHours}:${tsMinutes}:${tsSeconds}`;
      } // END seconds2timestamp

      // -----------------------------------------------------------------------
      // atpFadeInAudio
      // -----------------------------------------------------------------------
      function atpFadeInAudio(params) {
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

        sliderID     = 'volume_slider_' + settings.playerID;
        volumeSlider = document.getElementById(sliderID);
        steps        = iterationSteps[settings.speed];
        currentStep  = 1;

        if (volumeSlider === undefined || volumeSlider === null) {
          logger.warn('\n' + 'no volume slider found at playerID: ' + settings.playerID);
          return;
        }

        // Start the players volume muted
        Amplitude.setVolume(0);

        const fadeInInterval = setInterval(() => {
          const newVolume = settings.targetVolume * (currentStep / steps);

          Amplitude.setVolume(newVolume);
          volumeSlider.value = newVolume;
          currentStep++;

          (currentStep > steps) && clearInterval(fadeInInterval);
        }, cycle);

      } // END atpFadeInAudio

      // -----------------------------------------------------------------------
      // atpFadeAudioOut
      //
      // returns true if fade-out is finished
      // -----------------------------------------------------------------------
      function atpFadeAudioOut(params) {
        const cycle = 1;
        var   settings, currentStep, steps, sliderID, 
              startVolume, newVolume, volumeSlider;

        // current fade-out settings using DEFAULTS (if available)
        settings =  {
          playerID:       params.playerID,
          speed:          params.speed = 'default'
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
        startVolume   = Amplitude.getVolume();
        steps         = iterationSteps[settings.speed];
        currentStep   = 1;

        var songMetaData  = Amplitude.getActiveSongMetadata();
        var playlist      = songMetaData.playlist;
        var songIndex     = songMetaData.index;
        var trackID       = songIndex + 1; 

        if (volumeSlider !== null) {
          const fadeOutInterval = setInterval(() => {
            newVolume = startVolume * (1 - currentStep / steps);

            Amplitude.setVolume(newVolume);
            volumeSlider.value = newVolume;
            currentStep++;

            // seek current audio to total end to continue on next track
            if (currentStep > steps) {
              logger.debug('\n' + 'seek audio to total end position after fade-out');          
              Amplitude.setSongPlayedPercentage(99.99999);
              // Amplitude.setVolume(startVolume);
              // volumeSlider.value = startVolume;

              clearInterval(fadeOutInterval);
            } 
          }, cycle);
        } // END if volumeSlider

      } // END atpFadeAudioOut

      // function onplaying(metaData) {
      //   var songMetaData = metaData;
      //   logger.debug('\n' + 'playing title: ' + songMetaData.name);
      //   // document.getElementById('album-art').style.visibility = 'hidden';
      //   // document.getElementById('large-visualization').style.visibility = 'visible';        
      // }

      // function onpaused(metaData) {
      //   var songMetaData = metaData;
      //   logger.debug('\n' + 'playing title: ' + songMetaData.name);     
      // }

      // -----------------------------------------------------------------------
      // onPlayerStateChange
      //
      // update AT player on state change        
      // -----------------------------------------------------------------------
      function onPlayerStateChange(state) {
        var playerID, playlist, songs, songIndex, songIndex, trackID,
            songStart, songEnd, songStartSec, songEndSec,
            songStartTS, songEndTS, songMetaData, currentVolume,
            fadeAudio;

        playlist      = Amplitude.getActivePlaylist();
        playerID      = playlist + '_large';
        songs         = Amplitude.getSongsInPlaylist(playlist);
        songMetaData  = Amplitude.getActiveSongMetadata();
        songIndex     = songMetaData.index;
        trackID       = songIndex + 1;
        
        if (state === AT_PLAYER_STATE.UNSTARTED) {
          // logger.debug('\n' + 'current audio state: unstarted');
          return;
        } 

        if (state === AT_PLAYER_STATE.STOPPED) {
          // logger.debug('\n' + 'changed to title: ' + songMetaData.name + ' with titleIndex ' + songMetaData.index);
          logger.debug('\n' + 'audio player on playlist: ' + playlist + ' at trackID|state: ' + trackID + '|' + AT_PLAYER_STATE_NAMES[state]);
          return;
        }

        if (state === AT_PLAYER_STATE.PAUSED) {
          logger.debug('\n' + 'audio player on playlist: ' + playlist + ' at trackID|state: ' + trackID + '|' + AT_PLAYER_STATE_NAMES[state]);
          return;
        }

        if (state === AT_PLAYER_STATE.PREVIOUS) {
          logger.debug('\n' + 'audio player on playlist: ' + playlist + ' at trackID|state: ' + trackID + '|' + AT_PLAYER_STATE_NAMES[state]);
          return;
        }

        if (state === AT_PLAYER_STATE.NEXT) {
          logger.debug('\n' + 'audio player on playlist: ' + playlist + ' at trackID|state: ' + trackID + '|' + AT_PLAYER_STATE_NAMES[state]);
          return;
        }

        if (state === AT_PLAYER_STATE.CHANGED) {
          logger.debug('\n' + 'audio player on playlist: ' + playlist + ' at trackID|state: ' + trackID + '|' + AT_PLAYER_STATE_NAMES[state]);
          return;
        }

        if (state === AT_PLAYER_STATE.PLAYING) {
          var playlist, startVolume, ratingIndex, ratingElement,
              screenControlRatingElements, screenControlRating;

          songMetaData  = Amplitude.getActiveSongMetadata();
          songIndex     = songMetaData.index;
          trackID       = songIndex + 1;
          songStartTS   = songMetaData.start;
          songEndTS     = songMetaData.end;
          songStartSec  = timestamp2seconds(songStartTS);
          songEndSec    = timestamp2seconds(songEndTS);
          startVolume   = Amplitude.getVolume();
          // playlist   = Amplitude.getActivePlaylist();
          playlist      = songMetaData.playlist;

          logger.info('\n' + 'audio player on playlist: ' + playlist + ' at trackID|state: ' + trackID + '|' + AT_PLAYER_STATE_NAMES[state]);

          // update song rating in playlist-screen|meta-container
          // -------------------------------------------------------------------
          screenControlRatingElements = document.getElementsByClassName('audio-rating-screen-controls');
          screenControlRating         = null;
          songMetaData                = Amplitude.getActiveSongMetadata();

          for (let i=0; i<screenControlRatingElements.length; i++) {
            ratingElement = screenControlRatingElements[i];
            if (ratingElement.dataset.amplitudePlaylist === songMetaData.playlist) {
              ratingIndex = i;
              screenControlRating = ratingElement;
              break;
            }
          }

          if (screenControlRating) {
            if (songMetaData.rating) {
              screenControlRatingElements[ratingIndex].innerHTML = '<img src="/assets/image/pattern/rating/scalable/' + songMetaData.rating + '-star.svg"' + 'alt="song rating" style="margin-top: 5px;">';
            } else {
              screenControlRatingElements[ratingIndex].innerHTML = '';
            }
          } // END if screenControlRating

          // check|process audio for configured START position (if is plaxing)
          // -------------------------------------------------------------------
          if (songStartSec) {
            var checkIsPlaying = setInterval (() => {
              songMetaData  = Amplitude.getActiveSongMetadata();
              songIndex     = songMetaData.index;
              trackID       = songIndex + 1;
              songStartTS   = songMetaData.start;
              songEndTS     = songMetaData.end;
              songStartSec  = timestamp2seconds(songStartTS);
              songEndSec    = timestamp2seconds(songEndTS);
              currentVolume = Amplitude.getVolume();
              // playlist   = songMetaData.playlist;
              // playlist   = 'emancipator';
              // playlist   = songMetaData.playlist;

              // NOTE: check currentAudioTime to prevent reentrance
              // NOTE: check currentAudioTime > 0 to make sure that the active audio is PLAYING.
              //       Required to get correct values from AmplitudeJS API calls
              // -----------------------------------------------------------------
              // process audio for configured START position
              var currentAudioTime = Amplitude.getSongPlayedSeconds();
              if (songStartSec && currentAudioTime > 0 && currentAudioTime <= songStartSec) {
                fadeAudio = (songMetaData.audio_fade === 'true') ? true : false;

                // seek audio to configured START position
                logger.debug('\n' + 'seek audio on playlist: ' + playlist + ' at|to trackID|timestamp: ' + trackID + '|' + songStartTS);
                Amplitude.skipTo(songStartSec, songIndex, playlist);

                // fade-in audio IN (if enabled)
                if (fadeAudio) {
                  logger.debug('\n' + 'fade-in audio on playlist: ' + playlist + ' at|to trackID|timestamp: ' + trackID + '|' + songStartTS);
                  atpFadeInAudio({ playerID: playerID });
                } // END if fadeAudio

                clearInterval(checkIsPlaying);
              } // END if songStartSec

            }, 250); // END checkIsPlaying
          } // END if songStartSec

          // check|process audio for configured END position
          // -------------------------------------------------------------------
          if (songEndSec) {
            var checkIsOnVideoEnd = setInterval(() => {
              var currentAudioTime = Amplitude.getSongPlayedSeconds();

              if (currentAudioTime > 0 && currentAudioTime >= songEndSec) {                
                songMetaData  = Amplitude.getActiveSongMetadata();
                // playlist   = songMetaData.playlist;
                // playlist   = 'emancipator';
                // playlist   = songMetaData.playlist;                
                songIndex     = songMetaData.index;
                trackID       = songIndex + 1;

                // fade-out audio (if enabled)
                var fadeAudio = (songMetaData.audio_fade === 'true') ? true : false;
                if (fadeAudio) {
                  logger.debug('\n' + 'fade-out audio on playlist: ' + playlist + ' at|to trackID|timestamp: ' + trackID + '|' + songEndTS);
                  atpFadeAudioOut({ playerID: playerID });
                } // END if fadeAudio

                clearInterval(checkIsOnVideoEnd);
              } // END if currentAudioTime

              // Restore players volume on LAST track
              // ---------------------------------------------------------------
              // if (songIndex === songs.length-1) {
              //   logger.debug('\n' + 'restore player volume on last track');
              //   Amplitude.setVolume(currentVolume);
              // }

            }, 250); // END checkIsOnVideoEnd
          } // END if songEndSec

        } // END state AT_PLAYER_STATE PLAYING

        if (state === AT_PLAYER_STATE.ENDED) {
          // Amplitude.setVolume(50);
        } // END state AT_PLAYER_STATE.ENDED

      } // END onPlayerStateChange

    }, // END initApi

    // -------------------------------------------------------------------------
    // initPlayerUiEvents
    // -------------------------------------------------------------------------
    initPlayerUiEvents: () => {

      var dependencies_met_player_instances_initialized = setInterval (() => {
        if (apiInitialized.state) {
          var parentContainer = (document.getElementById('{{xhr_container_id}}') !== null) ? true : false;
          var parentContainerExist = ($('#' + '{{xhr_container_id}}')[0] !== undefined) ? true : false;

          logger.info('\n' + 'initialize player specific UI events: started');
          
          {% for player in amplitude_options.players %} {% if player.enabled %}
            {% assign xhr_data_path = amplitude_options.xhr_data_path %}
            {% capture xhr_container_id %}{{player.id}}_app{% endcapture %}

            // dynamic loader variable to setup the player on ID {{player.id}}
            dependency                    = 'dependencies_met_player_loaded_{{player.id}}';
            load_dependencies[dependency] = '';

            // -----------------------------------------------------------------
            // initialize player instance (when player UI is loaded)
            // -----------------------------------------------------------------
            load_dependencies['dependencies_met_player_loaded_{{player.id}}'] = setInterval (() => {
              var xhrDataLoaded      = (j1.xhrDOMState['#' + '{{xhr_container_id}}'] === 'success') ? true : false;
              var playerExistsInPage = ($('#' + '{{xhr_container_id}}')[0] !== undefined) ? true : false;

              // check the player HTML portion is loaded and player exists (in page)
              if (xhrDataLoaded && playerExistsInPage) {
                var playerID      = '{{player.id}}';
                var playerType    = '{{player.type}}';
                var playList      = '{{player.playlist}}';
                var playListName  = '{{player.playlist.name}}';
                var playListTitle = '{{player.playlist.title}}';

                logger.debug('\n' + 'initialize audio player instance on id: {{player.id}}');

                // set song (title) specific audio info links
                // -------------------------------------------------------------
                if (playerAudioInfo) {
                  var infoLinks = document.getElementsByClassName('audio-info-link');
                  _this.setAudioInfo(infoLinks);
                }

                // jadams, 2024-10-19: (song) events DISABLED
                // set song (title) specific UI events
                // -------------------------------------------------------------
                // var songElements = document.getElementsByClassName('song');
                // _this.songEvents(songElements);

                // player specific UI events
                // -------------------------------------------------------------
                logger.debug('\n' + 'setup audio player specific UI events on ID #{{player.id}}: started');

                var dependencies_met_api_initialized = setInterval (() => {
                  if (apiInitialized.state) {
                    amplitudePlayerState = Amplitude.getPlayerState();

                    {% if player.id contains 'mini' %}
                    // ---------------------------------------------------------
                    // START mini player UI events
                    //
                    if (document.getElementById('{{player.id}}') !== null) {

                      // add listeners to all progress bars found (mini-player)
                      // getElementsByClassName returns an Array-like object
                      // -------------------------------------------------------
                      var progressBars = document.getElementsByClassName("mini-player-progress");
                      for (var i=0; i<progressBars.length; i++) {
                        if (progressBars[i].dataset.amplitudeSource === 'youtube') {
                          // do nothing
                        } else {
                          progressBars[i].addEventListener('click', function(event) {
                            var offset = this.getBoundingClientRect();
                            var xpos   = event.pageX - offset.left;
  
                            Amplitude.setSongPlayedPercentage(
                              (parseFloat(xpos)/parseFloat(this.offsetWidth))*100);
                          }); // END EventListener 'click'
                        }
                      } // END for

                      // for (var i=0; i<progressBars.length; i++) {
                      //     progressBars[i].addEventListener('click', function(event) {
                      //       var offset = this.getBoundingClientRect();
                      //       var xpos   = event.pageX - offset.left;

                      //       Amplitude.setSongPlayedPercentage(
                      //         (parseFloat(xpos)/parseFloat(this.offsetWidth))*100);
                      //     });
                      // }

                    } // END mini player UI events
                    {% endif %}

                    {% if player.id contains 'compact' %}
                    // ---------------------------------------------------------
                    // START compact player UI events
                    //                    
                    if (document.getElementById('{{player.id}}') !== null) {

                      // show|hide scrollbar in playlist (compact player)
                      // -------------------------------------------------------                   
                      const songsInPlaylist = Amplitude.getSongsInPlaylist(playListName);
                      if (songsInPlaylist.length <= 8) {
                        const titleListCompactPlayer = document.getElementById('compact_player_title_list_' + playListName);
                        if (titleListCompactPlayer !== null) {
                          titleListCompactPlayer.classList.add('hide-scrollbar');
                        }
                      }

                      // show|hide playlist
                      // -------------------------------------------------------

                      // show playlist
                      var showPlaylist = document.getElementById("show_playlist_{{player.id}}");
                      if (showPlaylist !== null) {
                        showPlaylist.addEventListener('click', function(event) {
                          var scrollOffset = (window.innerWidth >= 720) ? -130 : -110;

                          // scroll player to top position
                          const targetDiv         = document.getElementById("show_playlist_{{player.id}}");
                          const targetDivPosition = targetDiv.offsetParent.offsetTop;
                          window.scrollTo(0, targetDivPosition + scrollOffset);

                          // open playlist
                          var playlistScreen = document.getElementById("playlist_screen_{{player.id}}");

                          playlistScreen.classList.remove('slide-out-top');
                          playlistScreen.classList.add('slide-in-top');
                          playlistScreen.style.display = "block";
                          playlistScreen.style.zIndex = "199";

                          // disable scrolling (if window viewport >= BS Medium and above)
                          if (window.innerWidth >= 720) {
                            if ($('body').hasClass('stop-scrolling')) {
                              return false;
                            } else {
                              $('body').addClass('stop-scrolling');
                            }
                          }
                        }); // END EventListener 'click' (compact player|show playlist)
                     } // END if showPlaylist

                    // hide playlist
                    var hidePlaylist = document.getElementById("hide_playlist_{{player.id}}");
                    if (hidePlaylist !== null) {
                      hidePlaylist.addEventListener('click', function(event) {
                        var playlistScreen = document.getElementById("playlist_screen_{{player.id}}");

                        playlistScreen.classList.remove('slide-in-top');
                        playlistScreen.classList.add('slislide-out-top');
                        playlistScreen.style.display = "none";
                        playlistScreen.style.zIndex = "1";

                        // enable scrolling
                        if ($('body').hasClass('stop-scrolling')) {
                          $('body').removeClass('stop-scrolling');
                        }
                      }); // END EventListener 'click' (compact player|show playlist)
                    } // END if hidePlaylist

                    // add listeners to all progress bars found (compact-player)
                    // getElementsByClassName returns an Array-like object
                    // -------------------------------------------------------
                    var progressBars = document.getElementsByClassName("compact-player-progress");
                    for (var i=0; i<progressBars.length; i++) {
                      if (progressBars[i].dataset.amplitudeSource === 'youtube') {
                        // do nothing
                      } else {
                        progressBars[i].addEventListener('click', function(event) {
                          var offset = this.getBoundingClientRect();
                          var xpos   = event.pageX - offset.left;

                          Amplitude.setSongPlayedPercentage(
                            (parseFloat(xpos)/parseFloat(this.offsetWidth))*100);
                        }); // END EventListener 'click'
                      }
                    } // END for

                      // click on skip forward|backward (compact player)
                      // See: https://github.com/serversideup/amplitudejs/issues/384
                      // -------------------------------------------------------

                      // add listeners to all SkipForwardButtons found
                      var compactPlayerSkipForwardButtons = document.getElementsByClassName("compact-player-skip-forward");
                      for (var i=0; i<compactPlayerSkipForwardButtons.length; i++) {
                        if (compactPlayerSkipForwardButtons[i].id === 'skip-forward_{{player.id}}') {
                          compactPlayerSkipForwardButtons[i].addEventListener('click', function(event) {
                            const skipOffset  = parseFloat(playerForwardBackwardSkipSeconds);
                            const duration    = Amplitude.getSongDuration();
                            const currentTime = parseFloat(Amplitude.getSongPlayedSeconds());
                            const targetTime  = parseFloat(currentTime + skipOffset);

                            if (currentTime > 0) {
                              Amplitude.setSongPlayedPercentage((targetTime / duration) * 100);
                            }
                          }); // END EventListener 'click'
                        } // END if ID
                      } // END for SkipForwardButtons

                      // add listeners to all SkipBackwardButtons found
                      var compactPlayerSkipBackwardButtons = document.getElementsByClassName("compact-player-skip-backward");
                      for (var i=0; i<compactPlayerSkipBackwardButtons.length; i++) {
                        if (compactPlayerSkipBackwardButtons[i].id === 'skip-backward_{{player.id}}') {
                          compactPlayerSkipBackwardButtons[i].addEventListener('click', function(event) {
                            const skipOffset  = parseFloat(playerForwardBackwardSkipSeconds);
                            const duration    = Amplitude.getSongDuration();
                            const currentTime = parseFloat(Amplitude.getSongPlayedSeconds());
                            const targetTime  = parseFloat(currentTime - skipOffset);

                            if (currentTime > 0) {
                              Amplitude.setSongPlayedPercentage((targetTime / duration) * 100);
                            }
                          }); // END EventListener 'click'
                        } // END if ID
                      } // END for SkipBackwardButtons

                      // click on shuffle button
                      var compactPlayerShuffleButton = document.getElementById('compact_player_shuffle');
                      if (compactPlayerShuffleButton) {
                        compactPlayerShuffleButton.addEventListener('click', function(event) {
                          var shuffleState = (document.getElementById('compact_player_shuffle').className.includes('amplitude-shuffle-on')) ? true : false;

                          Amplitude.setShuffle(shuffleState)
                        }); // END EventListener 'click'
                      } // END compactPlayerShuffleButton

                      // click on repeat button
                      var compactPlayerRepeatButton = document.getElementById('compact_player_repeat');
                      if (compactPlayerRepeatButton) {
                        compactPlayerRepeatButton.addEventListener('click', function(event) {
                          var repeatState = (document.getElementById('compact_player_repeat').className.includes('amplitude-repeat-on')) ? true : false;

                          Amplitude.setRepeat(repeatState)
                        }); // END EventListener 'click'
                      } // END compactPlayerRepeatButton

                    } // END compact player UI events
                    {% endif %}

                    {% if player.id contains 'large' %}
                    // START large player UI events
                    //
                    if (document.getElementById('{{player.id}}') !== null) {

                      // NOTE: listener overloads for video managed by plugin
                      // -------------------------------------------------------
                      var largetPlayerSongContainer = document.getElementsByClassName("amplitude-song-container");
                      for (var i=0; i<largetPlayerSongContainer.length; i++) {
                        var classArray  = [].slice.call(largetPlayerSongContainer[i].classList, 0);
                        var classString = classArray.toString();

                        largetPlayerSongContainer[i].addEventListener('click', function(event) {
                          // workaround: restore player default volume settings on muted
                          var currentVolume = Amplitude.getVolume();
                          if (currentVolume === 0) {
                            // set volume to default (50%)
                            Amplitude.setVolume(50);
                          }
                        });                           

                      } // END for

                      // click on prev button
                      var largePlayerPreviousButton = document.getElementById('large_player_previous');
                      if (largePlayerPreviousButton && largePlayerPreviousButton.getAttribute("data-amplitude-source") === 'youtube') {
                        // do nothing (managed by plugin)
                      }

                      // click on play_pause button
                      var largePlayerPlayPauseButton = document.getElementsByClassName('large-player-play-pause');
                      for (var i=0; i<largePlayerPlayPauseButton.length; i++) {
                        var classArray  = [].slice.call(largePlayerPlayPauseButton[i].classList, 0);
                        var classString = classArray.toString();                        
                        if (largePlayerPlayPauseButton[i].dataset.amplitudeSource === 'youtube') {
                          // do nothing (managed by plugin)
                        } else {
                          var amplitudeSource = largePlayerPlayPauseButton[i].dataset.amplitudeSource;
                          largePlayerPlayPauseButton[i].addEventListener('click', function(event) {
                            // workaround: restore player default volume settings on muted
                            var currentVolume = Amplitude.getVolume();
                            if (currentVolume === 0) {
                              // set volume to default (50%)
                              Amplitude.setVolume(50);
                            }

                            // logger.debug('\n' + 'play playlist|index: ' + playlist + '|' + currentIndex + ' with title: ' + songMetadata.name);
                          });
                        }
                      } // END for

                      // add listeners to all progress bars found (large-player)
                      // -------------------------------------------------------
                      var progressBars = document.getElementsByClassName("large-player-progress");
                      for (var i=0; i<progressBars.length; i++) {
                        if (progressBars[i].dataset.amplitudeSource === 'youtube') {
                          // do nothing (managed by plugin)
                        } else {
                          progressBars[i].addEventListener('click', function(event) {
                            var offset = this.getBoundingClientRect();
                            var xpos   = event.pageX - offset.left;

                            if (Amplitude.getPlayerState() === 'playing') {
                              Amplitude.setSongPlayedPercentage((parseFloat(xpos)/parseFloat(this.offsetWidth))*100);
                            }

                          }); // END EventListener 'click'
                        }
                      } // END for

                      // click on skip forward|backward (large player)
                      // See: https://github.com/serversideup/amplitudejs/issues/384
                      // -------------------------------------------------------

                      // add listeners to all SkipForwardButtons found
                      var largePlayerSkipForwardButtons = document.getElementsByClassName("large-player-skip-forward");
                      for (var i=0; i<largePlayerSkipForwardButtons.length; i++) {
                        if (largePlayerSkipForwardButtons[i].id === 'skip-forward_{{player.id}}') {
                          if (largePlayerSkipForwardButtons[i].dataset.amplitudeSource === 'youtube') {
                            // do nothing (managed by plugin)
                          } else {
                            largePlayerSkipForwardButtons[i].addEventListener('click', function(event) {
                              const skipOffset  = parseFloat(playerForwardBackwardSkipSeconds);
                              const duration    = Amplitude.getSongDuration();
                              const currentTime = parseFloat(Amplitude.getSongPlayedSeconds());
                              const targetTime  = parseFloat(currentTime + skipOffset);

                              if (currentTime > 0) {
                                Amplitude.setSongPlayedPercentage((targetTime / duration) * 100);
                              }
                            }); // END EventListener 'click'
                          } // END else
                        } // END if ID
                      } // END for SkipForwardButtons

                      // add listeners to all SkipBackwardButtons found
                      var largePlayerSkipBackwardButtons = document.getElementsByClassName("large-player-skip-backward");
                      for (var i=0; i<largePlayerSkipBackwardButtons.length; i++) {
                        if (largePlayerSkipBackwardButtons[i].id === 'skip-backward_{{player.id}}') {
                          if (largePlayerSkipBackwardButtons[i].dataset.amplitudeSource === 'youtube') {
                            // do nothing (managed by plugin)
                          } else {
                            largePlayerSkipBackwardButtons[i].addEventListener('click', function(event) {
                              const skipOffset  = parseFloat(playerForwardBackwardSkipSeconds);
                              const duration    = Amplitude.getSongDuration();
                              const currentTime = parseFloat(Amplitude.getSongPlayedSeconds());
                              const targetTime  = parseFloat(currentTime - skipOffset);

                              if (currentTime > 0) {
                                Amplitude.setSongPlayedPercentage((targetTime / duration) * 100);
                              }
                            }); // END EventListener 'click'
                          } // END else
                        } // END if ID
                      } // END for SkipBackwardButtons

                      // click on shuffle button
                      var largePlayerShuffleButton = document.getElementById('large_player_shuffle');
                      if (largePlayerShuffleButton) {
                        largePlayerShuffleButton.addEventListener('click', function(event) {
                          var shuffleState = (document.getElementById('large_player_shuffle').className.includes('amplitude-shuffle-on')) ? true : false;
                          Amplitude.setShuffle(shuffleState)
                        }); // END EventListener 'click'
                      } // END largePlayerShuffleButton

                      // click on repeat button
                      var largePlayerRepeatButton = document.getElementById('large_player_repeat');
                      if (largePlayerRepeatButton) {
                        largePlayerRepeatButton.addEventListener('click', function(event) {
                          var repeatState = (document.getElementById('large_player_repeat').className.includes('amplitude-repeat-on')) ? true : false;
                          Amplitude.setRepeat(repeatState)
                        }); // END EventListener 'click'
                      } // END if largePlayerRepeatButton

                      // enable|disable scrolling on playlist (large player)
                      // -------------------------------------------------------
                      if (document.getElementById('large_player_right') !== null) {

                        // show|hide scrollbar in playlist
                        // -----------------------------------------------------
                        var songsInPlaylist = Amplitude.getSongsInPlaylist(playListName);
                        if (songsInPlaylist.length <= 8) {
                          const titleListLargePlayer = document.getElementById('large_player_title_list_' + playListName);
                          if (titleListLargePlayer !== null) {
                            titleListLargePlayer.classList.add('hide-scrollbar');
                          }
                        }

                        // scroll to player top position (large player)
                        //
                        // Bootstrap grid breakpoints
                        //   SN:     576px           Mobile
                        //   MD:     768px           Small Desktop|Tablet
                        //   LG:     992px           Default Desktop
                        //   XL:     1200px          Large Desktop
                        //   XXL:    1400px          X Large Desktop
                        // -----------------------------------------------------

                        var largePlayerTitleHeader = document.getElementById("large_player_title_header_{{player.id}}");
                        largePlayerTitleHeader.addEventListener('click', function(event) {
                          var playerRight     = document.getElementById("{{player.id}}");
                          var playlistHeader  = document.getElementById("playlist_header_{{player.id}}");
                          var scrollOffset    = (window.innerWidth >= 992) ? -130 : -44;

                          // scroll player|playlist to top position (large player)
                          //
                          const targetDivPlayerRight            = playerRight;
                          const targetDivPositionPlayerRight    = targetDivPlayerRight.offsetTop;
                          const targetDivPlaylistHeader         = playlistHeader;
                          const targetDivPositionplaylistHeader = targetDivPlaylistHeader.offsetTop;

                          // NOTE: depending on WINDOW SIZE the relation changes to TOP POSITION (targetDivPosition)
                          //
                          if (targetDivPositionPlayerRight > targetDivPositionplaylistHeader) {
                            window.scrollTo(0, targetDivPositionPlayerRight + targetDivPlaylistHeader.offsetParent.firstElementChild.clientHeight + scrollOffset);
                          } else {
                            window.scrollTo(0, targetDivPositionplaylistHeader + scrollOffset);
                          }
                        }); // END EventListener 'click' largePlayerTitleHeader

                        var largePlayerPlaylistHeader = document.getElementById("playlist_header_{{player.id}}");
                        largePlayerPlaylistHeader.addEventListener('click', function(event) {
                          var playerRight     = document.getElementById("{{player.id}}");
                          var playlistHeader  = document.getElementById("playlist_header_{{player.id}}");
                          var scrollOffset    = (window.innerWidth >= 992) ? -130 : -44;

                          // scroll player|playlist to top position (large player)
                          //
                          const targetDivPlayerRight            = playerRight;
                          const targetDivPositionPlayerRight    = targetDivPlayerRight.offsetTop;
                          const targetDivPlaylistHeader         = playlistHeader;
                          const targetDivPositionplaylistHeader = targetDivPlaylistHeader.offsetTop;

                          // NOTE: depending on WINDOW SIZE the relation changes to TOP POSITION (targetDivPosition)
                          //
                          if (targetDivPositionPlayerRight > targetDivPositionplaylistHeader) {
                            window.scrollTo(0, targetDivPositionPlayerRight + targetDivPlaylistHeader.offsetParent.firstElementChild.clientHeight + scrollOffset);
                          } else {
                            window.scrollTo(0, targetDivPositionplaylistHeader + scrollOffset);
                          }

                        }); // END EventListener 'click' largePlayerPlaylistHeader

                        // disable scrolling (if window viewport >= BS Medium and above)
                        document.getElementById('large_player_right').addEventListener('mouseenter', function() {
                          if (window.innerWidth >= 720) {
                            if ($('body').hasClass('stop-scrolling')) {
                              return false;
                            } else {
                              $('body').addClass('stop-scrolling');
                            }
                          }
                        }); // END EventListener 'mouseenter'

                        // enable scrolling
                        document.getElementById('large_player_right').addEventListener('mouseleave', function() {
                          if ($('body').hasClass('stop-scrolling')) {
                            $('body').removeClass('stop-scrolling');
                          }
                        }); // END EventListener 'mouseleave'

                      } // END enable|disable scrolling on playlist

                      // set volume slider presets (for the player when exists|enabled)
                      //
                      var volumeSlider = document.getElementById('volume_slider_{{player.id}}');
                      if (volumeSlider !== null) {
                        const volumeMin     = parseInt('{{player.volume_slider.min_value}}'); 
                        const volumeMax     = parseInt('{{player.volume_slider.max_value}}'); 
                        const volumeValue   = parseInt('{{player.volume_slider.preset_value}}'); 
                        const volumeStep    = parseInt('{{player.volume_slider.slider_step}}'); 
  
                        // if player has NO slider presets, use amplitude defaults
                        //
                        volumeSlider.min    = (isNaN(volumeMin))   ? parseInt('{{amplitude_defaults.player.volume_slider.min_value}}')    : volumeMin;
                        volumeSlider.max    = (isNaN(volumeMax))   ? parseInt('{{amplitude_defaults.player.volume_slider.max_value}}')    : volumeMax;
                        volumeSlider.value  = (isNaN(volumeValue)) ? parseInt('{{amplitude_defaults.player.volume_slider.preset_value}}') : volumeValue;
                        volumeSlider.step   = (isNaN(volumeStep))  ? parseInt('{{amplitude_defaults.player.volume_slider.slider_step}}')  : volumeStep; 
                      } // END volumeSlider exists

                    } // END large player UI events
                    {% endif %}

                    // ---------------------------------------------------------
                    // START configured player features

                    logger.debug('\n' + 'set play next title: ' + playerPlayNextTitle);
                    logger.debug('\n' + 'set delay between titles: ' + playerDelayNextTitle + 'ms');
                    logger.debug('\n' + 'set repeat (album): ' + playerRepeat);
                    logger.debug('\n' + 'set shuffle (album): ' + playerShuffle);

                    // set delay between titles (songs)
                    Amplitude.setDelay(playerDelayNextTitle);
                    // set repeat (album)
                    Amplitude.setRepeat(playerRepeat);
                    // set shuffle (album)
                    Amplitude.setShuffle(playerShuffle);

                    // ---------------------------------------------------------
                    // END configured player features

                    // finished messages
                    // ---------------------------------------------------------
                    logger.debug('\n' + 'current player state: ' + amplitudePlayerState);
                    logger.debug('\n' + 'setup player specific UI events on ID #{{player.id}}: finished');

                    clearInterval(dependencies_met_api_initialized);
                  } // END if apiInitialized
                }, 10); // END dependencies_met_api_initialized

                playerExistsInPage   = (document.getElementById('{{player.id}}_app') !== null) ? true : false;
                pluginManagerEnabled = ('{{player.plugin_manager.enabled}}'.length > 0 && '{{player.plugin_manager.enabled}}' === 'true') ? true : playerDefaultPluginManager;

                if (playerExistsInPage && pluginManagerEnabled && !pluginManagerRunOnce) {
                  _this.pluginManager('{{player.plugin_manager.plugins}}');

                  // make sure the plugin is loaded|run only ONCE
                  pluginManagerRunOnce = true;
                }

                clearInterval(load_dependencies['dependencies_met_player_loaded_{{player.id}}']);
              } // END if xhrLoadState success
            }, 10); // END dependencies_met_html_loaded

          {% endif %} {% endfor %}

          logger.info('\n' + 'initialize player specific UI events: finished');

          _this.setState('finished');
          logger.debug('\n' + 'module state: ' + _this.getState());
          logger.info('\n' + 'module initialized successfully');

          endTimeModule = Date.now();
          logger.info('\n' + 'module initializing time: ' + (endTimeModule-startTimeModule) + 'ms');

          clearInterval(dependencies_met_player_instances_initialized);
        } // END if apiInitialized
      }, 10); // END initialize player specific UI events
    }, // END initPlayerUiEvents

    // -------------------------------------------------------------------------
    // START setAudioInfo
    setAudioInfo: (audioInfo) => {
      // jadams: ??? new config setting 'pause_on_audio_info' ???
      // when the audioInfo link is clicked, stop all propagation so
      // AmplitudeJS doesn't play the song.
      for (var i=0; i<audioInfo.length; i++) {
        audioInfo[i].addEventListener('click', function (event) {
          event.stopPropagation();
        });
      }
    }, // END setAudioInfo

    // -------------------------------------------------------------------------
    // songEvents
    // -------------------------------------------------------------------------
    songEvents: (songs) => {
      logger.debug('\n' + 'initializing title events for player on ID ' + '#' + playerID + ': started');

      for (var i = 0; i < songs.length; i++) {
        // ensure that on mouseover, CSS styles don't get messed up for active songs
        songs[i].addEventListener('mouseover', function() {
          // active song indicator (mini play button) in playlist
          if (!this.classList.contains('amplitude-active-song-container')) {
            if (this.querySelectorAll('.play-button-container')[0] !== undefined) {
              this.querySelectorAll('.play-button-container')[0].style.display = 'block';
            }
          } // END mini play button in playlist
        }); // END EventListener 'mouseover' (songlist)

        // ensure that on mouseout, CSS styles don't get messed up for active songs
        songs[i].addEventListener('mouseout', function() {
          if (this.querySelectorAll('.play-button-container')[0] !== undefined) {
            this.querySelectorAll('.play-button-container')[0].style.display = 'none';
          }
        }); // END EventListener 'mouseout' (songlist)

        // show|hide the (mini) play button when the song is clicked
        songs[i].addEventListener('click', function () {
          if (this.querySelectorAll('.play-button-container')[0] !== undefined) {
            this.querySelectorAll('.play-button-container')[0].style.display = 'none';
          }
        }); // END EventListener 'click' (songlist)
      }

      logger.debug('\n' + 'initializing title events for player on ID ' + '#' + playerID + ': finished');
    }, // END songEvents

    // -------------------------------------------------------------------------
    // pluginManager()
    // 
    // -------------------------------------------------------------------------
    pluginManager: (plugin) => {
//    if (plugin === 'ytp' && j1.adapter.amplitude['ytPlayerReady'] === undefined ) {
      if (plugin === 'ytp') {        
        var tech;
        var techScript;

        tech        = document.createElement('script');
        tech.id     = 'tech_' + plugin;
        tech.src    = '/assets/theme/j1/modules/amplitudejs/js/tech/' + plugin + '.js';
        techScript  = document.getElementsByTagName('script')[0];

        techScript.parentNode.insertBefore(tech, techScript);
      }
    }, // END pluginManager

    // -------------------------------------------------------------------------
    // messageHandler()
    // manage messages send from other J1 modules
    // -------------------------------------------------------------------------
    messageHandler: (sender, message) => {
      var json_message = JSON.stringify(message, undefined, 2);

      logText = '\n' + 'received message from ' + sender + ': ' + json_message;
      logger.debug(logText);

      // -----------------------------------------------------------------------
      //  process commands|actions
      // -----------------------------------------------------------------------
      if (message.type === 'command' && message.action === 'module_initialized') {

        //
        // place handling of command|action here
        //

        logger.info('\n' + message.text);
      }

      //
      // place handling of other command|action here
      //

      return true;
    }, // END messageHandler

    // -------------------------------------------------------------------------
    // setState()
    // sets the current (processing) state of the module
    // -------------------------------------------------------------------------
    setState: (stat) => {
      _this.state = stat;
    }, // END setState

    // -------------------------------------------------------------------------
    // getState()
    // Returns the current (processing) state of the module
    // -------------------------------------------------------------------------
    getState: () => {
      return _this.state;
    } // END getState

  }; // END main (return)
})(j1, window);

{%- endcapture -%}

{%- if production -%}
  {{ cache|minifyJS }}
{%- else -%}
  {{ cache|strip_empty_lines }}
{%- endif -%}

{%- assign cache = false -%}