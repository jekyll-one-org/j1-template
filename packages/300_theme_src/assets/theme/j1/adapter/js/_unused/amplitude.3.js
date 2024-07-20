---
regenerate:                             true
---

{% capture cache %}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/adapter/js/amplitude.js
 # Liquid template to adapt the AmplitudeJS module
 #
 # Product/Info:
 # https://jekyll.one
 # Copyright (C) 2023, 2024 Juergen Adams
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
{% assign amplitude_settings  = modules.amplitude.settings %}

{% comment %} Set config options (settings only)
-------------------------------------------------------------------------------- {% endcomment %}
{% assign amplitude_options   = amplitude_defaults | merge: amplitude_settings %}

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
 # ~/assets/theme/j1/adapter/js/amplitude.js
 # J1 Adapter for the amplitude module
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2023, 2024 Juergen Adams
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

  // göobal settings
  // ---------------------------------------------------------------------------
  var environment             = '{{environment}}';
  var cookie_names            = j1.getCookieNames();
  var user_state              = j1.readCookie(cookie_names.user_state);
  var state                   = 'not_started';

  // module settings
  // ---------------------------------------------------------------------------

  // control|logging
  // ---------------
  var _this;
  var logger;
  var logText;
  var toJSON;

  // date|time monitoring
  //---------------------
  var startTime;
  var endTime;
  var startTimeModule;
  var endTimeModule;
  var timeSeconds;

  // amplitude api settings
  // ----------------------
  var playLists       = {};
  var playersUILoaded = { state: false };
  var apiInitialized  = { state: false };
  var playList;
  var playerID;
  var playListTitle;
  var amplitudePlayerState;
  var amplitudeDefaults;
  var amplitudeSettings;
  var amplitudeOptions;

  // amplitude player (instance) settings
  // ------------------------------------
  var xhrLoadState;
  var dependency;
  var playerCounter             = 0;
  var load_dependencies         = {};
  var playersProcessed          = [];
  var playersHtmlLoaded         = false;
  var processingPlayersFinished = false;
  var playerType                = '{{amplitude_defaults.player_type}}';
  var playerVolume              = '{{amplitude_defaults.volume}}';
  var playerRepeat              = ('{{amplitude_defaults.repeat}}' === 'true') ? true : false;
  var playerShuffle             = ('{{amplitude_defaults.shuffle}}' === 'true') ? true : false;
  var playerTitleInfo           = ('{{amplitude_defaults.title_info}}' === 'true') ? true : false;
  var playerPlayNextTitle       = ('{{amplitude_defaults.play_next_title}}' === 'true') ? true : false;
  var playerPauseNextTitle      = ('{{amplitude_defaults.pause_next_title}}' === 'true') ? true : false;
  var playerDelayNextTitle      = '{{amplitude_defaults.delay_next_title}}';
  var playerWaveformSampleRate  = '{{amplitude_defaults.waveform_sample_rate}}';


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
      amplitudeDefaults = $.extend({}, {{amplitude_defaults | replace: 'nil', 'null' | replace: '=>', ':' }});
      amplitudeSettings = $.extend({}, {{amplitude_settings | replace: 'nil', 'null' | replace: '=>', ':' }});
      amplitudeOptions  = $.extend(true, {}, amplitudeDefaults, amplitudeSettings);

      // -----------------------------------------------------------------------
      // control|logging settings
      // -----------------------------------------------------------------------
      _this             = j1.adapter.amplitude;
      logger            = log4javascript.getLogger('j1.adapter.amplitude');


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
          // Create global playlist|songs (API)
          // -------------------------------------------------------------------
          logger.info('\n' + 'creating global playlist|songs (API): started');
          const songs = [
            {
              "enabled":        "true",
              "name":           "Dancefloor Fever",
              "artist":         "Royalty Free",
              "album":          "Free Disco",
              "url":            "//p.productioncrate.com/stock-hd/audio/SoundsCrate-Dancefloor_Fever.mp3",
              "cover_art_url":  "/assets/audio/cover/royalty_free/free_disco_sounds.jpg"
            }
          ];
          logger.info('\n' + 'creating global playlist|songs (API): finished');

          // -------------------------------------------------------------------
          // Create playlists (API)
          // -------------------------------------------------------------------
          _this.playlistLoader(playLists);
//        JJSON    = JSON.stringify(playLists, null, 2);
//        playLists = toJSON;

          // -------------------------------------------------------------------
          // load players HTML portion (UI)
          // -------------------------------------------------------------------
          _this.playerHtmlLoader(playersUILoaded);

          // -------------------------------------------------------------------
          // inititialize api (amplitude)
          // -------------------------------------------------------------------
          var dependencies_met_api_initialized = setInterval (() => {
            if (Object.keys(playLists).length && playersUILoaded.state) {
              _this.initApi(songs, playLists);
              apiInitialized.state = true;

              clearInterval(dependencies_met_api_initialized);
            } // END if apiInitialized
          }, 10); // END dependencies_met_api_initialized

          // -------------------------------------------------------------------
          // initialize player specific UI events
          // -------------------------------------------------------------------
          _this.initPlayerUiEvents()

          clearInterval(dependencies_met_page_ready);
        } // END pageVisible
      }, 10); // END dependencies_met_page_ready
    }, // END init

    // -------------------------------------------------------------------------
    // Global Playlist|Song Loader (API)
    // -------------------------------------------------------------------------
    somgLoader: (songs) => {

      // -----------------------------------------------------------------------
      // initialize amplitude playlist
      // -----------------------------------------------------------------------
      logger.info('\n' + 'creating playlists (API): started');

      {% for player in amplitude_options.players %} {% if player.enabled %}
        {% assign player_items   = player.items %}
        {% assign player_id      = player.player_id %}

        var songs       = [];
        var playerItems = $.extend({}, {{player_items | replace: 'nil', 'null' | replace: '=>', ':' }});

        for (var i = 0; i < Object.keys(song_items).length; i++) {
          if (song_items[i].enabled === 'true') {
            var item = song_items[i];
            var song = {};

            // map config settings|amplitude song items
            // -------------------------------------------------------------------
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
              } else if (key === 'title_info') {
                if (playerTitleInfo) {
                  song.title_info = item[key];
                } else {
                  song.title_info = '';
                } // END if playerTitleInfo
                continue;
              } else {
                song[key] = item[key];
              } // END if key
            } // END for item
          } // END id enabled

          // toJSON = JSON.stringify(song, null, 2);
          // song  = toJSON;
          songs.push(song);
        } // END for

      {% endif %} {% endfor %}

      logger.info('\n' + 'creating playlists (API): finished');
    }, // END somgLoader

    // -------------------------------------------------------------------------
    // Playlist Loader (API)
    // -------------------------------------------------------------------------
    playlistLoader: (playlist) => {

      // -----------------------------------------------------------------------
      // initialize amplitude playlist
      // -----------------------------------------------------------------------
      logger.info('\n' + 'creating playlists (API): started');

      {% for player in amplitude_options.players %} {% if player.enabled %}
        {% assign player_items   = player.items %}
        {% assign player_id      = player.player_id %}
        {% assign playlist_name  = player.playlist %}
        {% assign playlist_title = player.playlist_title %}

        var songs       = [];
        var playerItems = $.extend({}, {{player_items | replace: 'nil', 'null' | replace: '=>', ':' }});

        for (var i = 0; i < Object.keys(playerItems).length; i++) {

            // prevent multiple processing of already existing playlist
          if (playlist["{{playlist_name}}"] !== undefined) {
            break;
          } // END if playlist exists

          if (playerItems[i].enabled) {
            var item = playerItems[i];
            var song = {};

            // map config settings|amplitude song items
            // -------------------------------------------------------------------
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
              } else if (key === 'title_info') {
                if (playerTitleInfo) {
                  song.title_info = item[key];
                } else {
                  song.title_info = '';
                } // END if playerTitleInfo
                continue;
              } else {
                song[key] = item[key];
              } // END if key
            } // END for item
          } // END id enabled
          songs.push(song);
        } // END for items

        // prevent multiple processing of already existing playlist
        if (playlist["{{playlist_name}}"] === undefined) {
          playlist["{{playlist_name}}"]       = {};
          playlist["{{playlist_name}}"].title = '{{playlist_title}}'
          playlist["{{playlist_name}}"].songs = [];
          playlist["{{playlist_name}}"].songs = songs;

          logger.debug('\n' + 'loading playlist {{playlist_name}}: finished');
        } // END if playlist exists

        {% endif %} {% endfor %}

        logger.info('\n' + 'creating playlists (API): finished');
    }, // END playlistLoader

    // -------------------------------------------------------------------------
    // Player HTML loader (UI)
    // -------------------------------------------------------------------------
    playerHtmlLoader: (playersLoaded) => {

      // -----------------------------------------------------------------------
      // initialize HTML portion (UI) for all players configured|enabled
      // -----------------------------------------------------------------------
      logger.info('\n' + 'loading players (UI): started');

      {% for player in amplitude_options.players %} {% if player.enabled %}
        {% assign player_id     = player.player_id %}
        {% assign xhr_data_path = amplitude_options.xhr_data_path %}
        {% capture xhr_container_id %}{{player_id}}_parent{% endcapture %}

        playerCounter++;
        logger.debug('\n' + 'load player UI on ID #{{player_id}}: started');

        j1.loadHTML({
          xhr_container_id: '{{xhr_container_id}}',
          xhr_data_path:    '{{xhr_data_path}}',
          xhr_data_element: '{{player_id}}'
          },
          'j1.adapter.amplitude',
          'data_loaded'
        );

        // dynamic loader variable to setup the player on ID {{player_id}}
        dependency = 'dependencies_met_html_loaded_{{player_id}}';
        load_dependencies[dependency] = '';

        // -----------------------------------------------------------------
        // initialize amplitude instance (when player UI loaded)
        // -----------------------------------------------------------------
        // jadams: timeout seems NOT nessesary
        // setTimeout(() => {
        load_dependencies['dependencies_met_html_loaded_{{player_id}}'] = setInterval (() => {
          // check if HTML portion of the player is loaded successfully
          xhrLoadState = j1.xhrDOMState['#' + '{{xhr_container_id}}'];

          if (xhrLoadState === 'success') {
            playersProcessed.push('{{xhr_container_id}}');

            logger.debug('\n' + 'load player UI on ID #{{player_id}}: finished');

            clearInterval(load_dependencies['dependencies_met_html_loaded_{{player_id}}']);
          }
        }, 10); // END dependencies_met_html_loaded

      {% endif %} {% endfor %}

      load_dependencies['dependencies_met_players_loaded'] = setInterval (() => {

        if (playersProcessed.length === playerCounter) {
          processingPlayersFinished = true;
        }

        if (processingPlayersFinished) {
          logger.info('\n' + 'loading players (UI): finished');
          clearInterval(load_dependencies['dependencies_met_players_loaded']);
          playersLoaded.state = true;
        }
      }, 10); // END dependencies_met_players_loaded

    }, // END playerHtmlLoader

    // -------------------------------------------------------------------------
    // initApi
    // -------------------------------------------------------------------------
    initApi: (songs, playlists) => {
      logger.info('\n' + 'initialze API: started');

      // for (var i = 0; i < Object.keys(song_items).length; i++) {
      //   if (song_items[i].enabled === 'true') {
      //     var item = song_items[i];
      //     var song = {};
      //
      //     // map config settings|amplitude song items
      //     // -------------------------------------------------------------------
      //     for (const key in item) {
      //       // skip properties NOT needed for a song
      //       if (key === 'item' || key === 'audio_base' || key === 'enabled') {
      //         continue;
      //       } else if (key === 'audio') {
      //         song.url = item.audio_base + '/' + item[key];
      //         continue;
      //       } else if (key === 'title') {
      //         song.name = item[key];
      //         continue;
      //       } else if (key === 'name') {
      //         song.album = item[key];
      //         continue;
      //       } else if (key === 'cover_image') {
      //         song.cover_art_url = item[key];
      //         continue;
      //       } else if (key === 'title_info') {
      //         if (playerTitleInfo) {
      //           song.title_info = item[key];
      //         } else {
      //           song.title_info = '';
      //         } // END if playerTitleInfo
      //         continue;
      //       } else {
      //         song[key] = item[key];
      //       } // END if key
      //     } // END for item
      //   } // END id enabled
      //
      //   // toJSON = JSON.stringify(song, null, 2);
      //   // song  = toJSON;
      //   songs.push(song);
      //
      // } // END for items

     // See: https://521dimensions.com/open-source/amplitudejs/docs
      Amplitude.init({
        bindings: {
          32:       'play_pause',
          37:       'prev',
          39:       'next'
        },
        songs:      songs,
        playLists:  playlists,
        callbacks: {
          initialized: function() {
            // indicate api successfully initialized
            logger.info('\n' + 'initialze API: finished');
            apiInitialized.state = true;
          },
          onInitError: function() {
            // indicate api failed on initialization
            apiInitialized.state = false;
            console.error('\n' + 'Amplitude API failed on initialization');
          },
          play: function() {
            var songMetaData = Amplitude.getActiveSongMetadata();
            logger.debug('\n' + 'playing title: ' + songMetaData.name);
            document.getElementById('album-art').style.visibility = 'hidden';
            document.getElementById('large-visualization').style.visibility = 'visible';
          },
          pause: function() {
            var songMetaData = Amplitude.getActiveSongMetadata();
            logger.debug('\n' + 'pause title: ' + songMetaData.name);
            document.getElementById('album-art').style.visibility = 'visible';
            document.getElementById('large-visualization').style.visibility = 'hidden';
          },
          stop: function() {
            logger.warn('\n' + 'audio has been stopped');
          },
          song_change: function() {
            var songMetaData = Amplitude.getActiveSongMetadata();
            logger.debug('\n' + 'changed to title: ' + songMetaData.name);
          },
          next: function() {
            var songMetaData = Amplitude.getActiveSongMetadata();
            if (playerPauseNextTitle) {
              amplitudePlayerState = Amplitude.getPlayerState();
//            if (amplitudePlayerState === 'playing' || amplitudePlayerState === 'stopped' || amplitudePlayerState === 'paused') {
              if (amplitudePlayerState === 'playing' || amplitudePlayerState === 'stopped' ) {
                setTimeout(() => {
                  // pause playback of next title
                  logger.debug('\n' + 'paused on next title: ' + songMetaData.name);
                  Amplitude.pause();
                }, 150);
              } // END if playing
            } // END if pause on next title
          }
        },
        waveforms: {
          sample_rate:  playerWaveformSampleRate
        },
        continue_next:  playerPlayNextTitle,
        volume:         playerVolume
      });
    }, // END initApi

    // -------------------------------------------------------------------------
    // initPlayerUiEvents
    // -------------------------------------------------------------------------
    initPlayerUiEvents: () => {
      var dependencies_met_player_instances_initialized = setInterval (() => {
        if (apiInitialized.state) {
          logger.info('\n' + 'initialize player specific UI events: started');

          {% for player in amplitude_options.players %} {% if player.enabled %}
            {% assign player_items  = player.items %}
            {% assign player_id     = player.player_id %}
            {% assign xhr_data_path = amplitude_options.xhr_data_path %}
            {% capture xhr_container_id %}{{player_id}}_parent{% endcapture %}

            playerID      = '{{player.player_id}}';
            playList      = '{{player.playlist}}';
            playListTitle = '{{player.playlist_title}}';

            logger.debug('\n' + 'set playlist {{player.playlist}} on id #{{player_id}} with title: ' + playListTitle);

            // Set default values
            // -----------------------------------------------------------------
            playerVolume              = ('{{player.volume}}' !== '') ? '{{player.volume}}' : playerVolume;
            playerRepeat              = ('{{player.repeat}}' === 'true') ? true : playerRepeat;
            playerShuffle             = ('{{player.shuffle}}' === 'true') ? true : playerShuffle;
            playerType                = ('{{player.player_type}}' !== '') ? '{{player.player_type}}' : playerType;
            playerTitleInfo           = ('{{player.title_info}}' === 'true') ? true : playerTitleInfo;
            playerPlayNextTitle       = ('{{player.play_next_title}}' === 'true') ? true : playerPlayNextTitle;
            playerPauseNextTitle      = ('{{player.delay_next_title}}' === 'true') ? true : playerPauseNextTitle;
            playerDelayNextTitle      = ('{{player.delay_next_title}}' === 'true') ? true : playerDelayNextTitle;
            playerWaveformSampleRate  = ('{{player.waveform_sample_rate}}' !== '') ? '{{player.waveform_sample_rate}}' : playerWaveformSampleRate;

            // dynamic loader variable to setup the player on ID {{player_id}}
            dependency = 'dependencies_met_player_loaded_{{player_id}}';
            load_dependencies[dependency] = '';

            // -------------------------------------------------------------
            // initialize player instance (when player UI is loaded)
            // -------------------------------------------------------------
            load_dependencies['dependencies_met_player_loaded_{{player_id}}'] = setInterval (() => {
              // check if HTML portion of the player is loaded successfully
              var xhrLoadState = j1.xhrDOMState['#' + '{{xhr_container_id}}'];

              if (xhrLoadState === 'success') {

                // player|right (playlist): set audio info link (per item)
                // ---------------------------------------------------------
                if (playerTitleInfo) {
                  var audioInfoLinks = document.getElementsByClassName('audio-info-link');
                  _this.audioInfo(audioInfoLinks);
                }

                // player|right: set highlight|play on selected song
                // ---------------------------------------------------------
                var songElements = document.getElementsByClassName('song');
                _this.songEvents(songElements);

                // setup amplitude instance
                // ---------------------------------------------------------
                logger.debug('\n' + 'setup player specific UI events on ID #{{player_id}}: started');

                var dependencies_met_api_initialized = setInterval (() => {
                  if (apiInitialized.state) {
                    amplitudePlayerState = Amplitude.getPlayerState();

                    // ---------------------------------------------------------
                    // setup player specific UI events
                    // ---------------------------------------------------------

                    // mini player: click on the progress bar
                    if (document.getElementById('mini-player-container') !== null) {
                      document.getElementById('mini-player-progress').addEventListener('click', function(event) {
                        var offset = this.getBoundingClientRect();
                        var xpos   = event.pageX - offset.left;

                        Amplitude.setSongPlayedPercentage(
                          (parseFloat(xpos)/parseFloat(this.offsetWidth))*100);
                      });
                    } // END if mini player progress

                    // compact player: click down arrow to show the list screen
                    if (document.getElementById('compact-player-container') !== null) {
                      document.getElementsByClassName('down-header')[0].addEventListener('click', function() {
                        var list = document.getElementById('list');
                        list.style.height = ( parseInt( document.getElementById('compact-player-container').offsetHeight ) - 135 ) + 'px';

                        document.getElementById('list-screen').classList.remove('slide-out-top');
                        document.getElementById('list-screen').classList.add('slide-in-top');
                        document.getElementById('list-screen').style.display = "block";

                        // disable scrolling
                        if ($('body').hasClass('stop-scrolling')) {
                          return false;
                        } else {
                          $('body').addClass('stop-scrolling');
                        }
                      });

                      // compact player: click up arrow to hide the list screen
                      document.getElementsByClassName('hide-playlist')[0].addEventListener('click', function() {
                        document.getElementById('list-screen').classList.remove('slide-in-top');
                        document.getElementById('list-screen').classList.add('slide-out-top');
                        document.getElementById('list-screen').style.display = "none";

                        // enable scrolling
                        if ($('body').hasClass('stop-scrolling')) {
                          $('body').removeClass('stop-scrolling');
                        }
                      });

                      // compact player: click on the progress bar
                      document.getElementById('compact-player-progress').addEventListener('click', function(event) {
                        var offset = this.getBoundingClientRect();
                        var xpos   = event.pageX - offset.left;

                        Amplitude.setSongPlayedPercentage(
                          (parseFloat(xpos)/parseFloat(this.offsetWidth))*100);
                      });
                    } // END if compact-player-container

                    // jadams, 2021-03-05: manage scrolling on playlist (Expanded Player|Right)
                    if (document.getElementById('amplitude-right') !== null) {
                      document.getElementById('amplitude-right').addEventListener('mouseenter', function() {
                        if ($('body').hasClass('stop-scrolling')) {
                          return false;
                        } else {
                          $('body').addClass('stop-scrolling');
                        }
                      });
                      document.getElementById('amplitude-right').addEventListener('mouseleave', function() {
                        if ($('body').hasClass('stop-scrolling')) {
                          $('body').removeClass('stop-scrolling');
                        }
                      });
                    } // END manage scrolling on playlist (Expanded Player|Right)

                    // ---------------------------------------------------------
                    // setup configured player features
                    // ---------------------------------------------------------
                    logger.debug('\n' + 'set play next title: ' + playerPlayNextTitle);
                    logger.debug('\n' + 'set delay between titles: ' + playerDelayNextTitle + 'ms');
                    logger.debug('\n' + 'set repeat (album): ' + playerRepeat);
                    logger.debug('\n' + 'set shuffle (album): ' + playerShuffle);

                    // set delay between titles (songs)
                    Amplitude.setDelay(playerDelayNextTitle);
                    // set repeat (album)
                    Amplitude.setRepeat(playerRepeat)
                    // set shuffle (album)
                    Amplitude.setShuffle(playerShuffle)

                    // set finished messages
                    // ---------------------------------------------------------
                    logger.debug('\n' + 'current player state: ' + amplitudePlayerState);
                    logger.debug('\n' + 'setup player specific UI events on ID #{{player_id}}: finished');

                    _this.setState('finished');
                    logger.debug('\n' + 'module state: ' + _this.getState());
                    logger.info('\n' + 'module initialized successfully');

                    endTimeModule = Date.now();
                    logger.info('\n' + 'module initializing time: ' + (endTimeModule-startTimeModule) + 'ms');

                    clearInterval(dependencies_met_api_initialized);
                  } // END if apiInitialized
                }, 10); // END dependencies_met_api_initialized

                clearInterval(load_dependencies['dependencies_met_player_loaded_{{player_id}}']);
              } // END if xhrLoadState success
            }, 10); // END dependencies_met_html_loaded

          {% endif %} {% endfor %}
          logger.info('\n' + 'initialize player specific UI events: finished');

          clearInterval(dependencies_met_player_instances_initialized);
        } // END if apiInitialized
      }, 10);
      // END initialize player specific UI events
    }, // END initPlayerUiEvents

    // -------------------------------------------------------------------------
    // audioInfo
    // -------------------------------------------------------------------------
    audioInfo: (audioInfo) => {
      // jadams: ???
      // when the audioInfo link is clicked, stop all propagation so
      // AmplitudeJS doesn't play the song.
      for (var i = 0; i < audioInfo.length; i++) {
        audioInfo[i].addEventListener('click', function (event) {
          event.stopPropagation();
        });
      }
    }, // END audioInfo

    // -------------------------------------------------------------------------
    // songEvents
    // -------------------------------------------------------------------------
    songEvents: (songs) => {
      logger.debug('\n' + 'initializing title events for player on ID ' + '#' + playerID + ': started');

      for (var i = 0; i < songs.length; i++) {
        // ensure that on mouseover, CSS styles don't get messed up for active songs
        songs[i].addEventListener('mouseover', function() {

          if ($('body').hasClass('stop-scrolling')){
            return false;
          } else {
            $('body').addClass('stop-scrolling');
          }

          this.style.backgroundColor = '#00A0FF';

          if (this.querySelectorAll('.audio-meta-data .audio-title')[0] !== undefined) {
            this.querySelectorAll('.audio-meta-data .audio-title')[0].style.color  = '#FFFFFF';
          }
          if (this.querySelectorAll('.audio-meta-data .audio-artist')[0] !== undefined) {
            this.querySelectorAll('.audio-meta-data .audio-artist')[0].style.color = '#FFFFFF';
          }

          // mini play button in playlist
          if (!this.classList.contains('amplitude-active-song-container')) {
            if (this.querySelectorAll('.play-button-container')[0] !== undefined) {
              this.querySelectorAll('.play-button-container')[0].style.display = 'block';
            }
          } // END mini play button in playlist

          if (playerTitleInfo) {
            if (this.querySelectorAll('img.audio-info-grey')[0] !== undefined) {
              this.querySelectorAll('img.audio-info-grey')[0].style.display  = 'none';
            }
            if (this.querySelectorAll('img.audio-info-white')[0] !== undefined) {
              this.querySelectorAll('img.audio-info-white')[0].style.display = 'block';
            }
          } else {
            if (this.querySelectorAll('img.audio-info-grey')[0] !== undefined) {
              this.querySelectorAll('img.audio-info-grey')[0].style.display  = 'none';
            }
            if (this.querySelectorAll('img.audio-info-white')[0] !== undefined) {
              this.querySelectorAll('img.audio-info-white')[0].style.display = 'none';
            }
          } // END if playerTitleInfo

          if (this.querySelectorAll('.audio-duration')[0] !== undefined) {
            this.querySelectorAll('.audio-duration')[0].style.color = '#FFFFFF';
          }
        });

        // ensure that on mouseout, CSS styles don't get messed up for active songs
        songs[i].addEventListener('mouseout', function() {
          this.style.backgroundColor = '#FFFFFF';
          if (this.querySelectorAll('.audio-meta-data .audio-title')[0] !== undefined) {
            this.querySelectorAll('.audio-meta-data .audio-title')[0].style.color  = '#272726';
          }
          if (this.querySelectorAll('.audio-meta-data .audio-artist')[0] !== undefined) {
            this.querySelectorAll('.audio-meta-data .audio-artist')[0].style.color = '#607D8B';
          }
          if (this.querySelectorAll('.play-button-container')[0] !== undefined) {
            this.querySelectorAll('.play-button-container')[0].style.display = 'none';
          }

          if (playerTitleInfo) {
            if (this.querySelectorAll('img.audio-info-grey')[0] !== undefined) {
              this.querySelectorAll('img.audio-info-grey')[0].style.display  = 'block';
            }
            if (this.querySelectorAll('img.audio-info-white')[0] !== undefined) {
              this.querySelectorAll('img.audio-info-white')[0].style.display = 'none';
            }
          } else {
            if (this.querySelectorAll('img.audio-info-grey')[0] !== undefined) {
              this.querySelectorAll('img.audio-info-grey')[0].style.display  = 'none';
            }
            if (this.querySelectorAll('img.audio-info-white')[0] !== undefined) {
              this.querySelectorAll('img.audio-info-white')[0].style.display = 'none';
            }
          } // END if playerTitleInfo

          if (this.querySelectorAll('.audio-duration')[0] !== undefined) {
            this.querySelectorAll('.audio-duration')[0].style.color = '#607D8B';
          }

          if ($('body').hasClass('stop-scrolling')){
            return false;
          } else {
            $('body').addClass('stop-scrolling');
          }
        });

        // show|hide the (mini) play button when the song is clicked
        songs[i].addEventListener('click', function () {
          if (this.querySelectorAll('.play-button-container')[0] !== undefined) {
            this.querySelectorAll('.play-button-container')[0].style.display = 'none';
          }
          if ($('body').hasClass('stop-scrolling')){
            return false;
          } else {
            $('body').addClass('stop-scrolling');
          }
        });
      }
      logger.debug('\n' + 'initializing title events for player on ID ' + '#' + playerID + ': finished');
    }, // END songEvents

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

{% endcapture %}
{% if production %}
  {{ cache | minifyJS }}
{% else %}
  {{ cache | strip_empty_lines }}
{% endif %}
{% assign cache = nil %}
