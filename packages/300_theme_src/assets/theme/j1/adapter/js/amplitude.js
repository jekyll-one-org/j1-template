---
regenerate:                             true
---

{%- capture cache -%}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/adapter/js/amplitude.js
 # Liquid template to adapt the AmplitudeJS v4 module
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
  var toText;

  // date|time monitoring
  //---------------------
  var startTime;
  var endTime;
  var startTimeModule;
  var endTimeModule;
  var timeSeconds;

  // amplitude api settings
  // ----------------------
  var ytpSongIndex    = "0";
  var ytpAutoPlay     = false;
  var ytpLoop         = true;
  var playLists       = {};
  var playersUILoaded = { state: false };
  var apiInitialized  = { state: false };
  var playList;
  var playerID;
  var playerType;
  var playListTitle;
  var playListName;
  var amplitudePlayerState;
  var amplitudeDefaults;
  var amplitudeSettings;
  var amplitudeOptions;
  var ytPlayer;
  var ytpPlaybackRate

  // amplitude player (instance) settings
  // NOTE: slider VALUE is set by Adapter|Amplitude API
  // ------------------------------------
  var xhrLoadState;
  var dependency;
  var playerCounter                     = 0;
  var load_dependencies                 = {};
  var playersProcessed                  = [];
  var playersHtmlLoaded                 = false;
  var processingPlayersFinished         = false;
  var playerAudioInfo                   = ('{{amplitude_defaults.playlist.audio_info}}' === 'true') ? true : false;
  var playerDefaultType                 = '{{amplitude_defaults.player.type}}';
  var playerVolumeValue                 = '{{amplitude_defaults.player.volume_slider.preset_value}}';
  var playerVolumeSliderStep            = '{{amplitude_defaults.player.volume_slider.slider_step}}';
  var playerRepeat                      = ('{{amplitude_defaults.player.repeat}}' === 'true') ? true : false;
  var playerShuffle                     = ('{{amplitude_defaults.player.shuffle}}' === 'true') ? true : false;
  var playerPlayNextTitle               = ('{{amplitude_defaults.player.play_next_title}}' === 'true') ? true : false;
  var playerPauseNextTitle              = ('{{amplitude_defaults.player.pause_next_title}}' === 'true') ? true : false;
  var playerDelayNextTitle              = '{{amplitude_defaults.player.delay_next_title}}';
  var playerForwardBackwardSkipSeconds  = '{{amplitude_defaults.player.forward_backward_skip_seconds}}';

  // unused settings
  // ---------------------------------------------------------------------------
  // var playerWaveformSampleRate       = '{{amplitude_defaults.player.waveform_sample_rate}}';

  // ---------------------------------------------------------------------------
  // YouTube Player Tech (loaded early, runs on Document Ready)
  // ---------------------------------------------------------------------------
  //
  // $(function() {
  //   // Load YTP API code asynchronously and create a player for later use
  //   var techScript;
  //   var tech    = document.createElement('script');
  //
  //   tech.id     = 'yt_player_init';
  //   tech.src    = "/assets/theme/j1/modules/amplitudejs/js/tech/ytp.js";
  //   techScript  = document.getElementsByTagName('script')[0];
  //
  //   // Append Tech script
  //   techScript.parentNode.insertBefore(tech, techScript);
  // });

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

        if (j1CoreFinished && pageVisible) {
          startTimeModule = Date.now();

          _this.setState('started');
          logger.debug('\n' + 'module state: ' + _this.getState());
          logger.info('\n' + 'module is being initialized');

          // jQuery('.scrollbar-rail').scrollbar();

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
      {% for playlist in amplitude_settings.playlists %} {% if playlist.enabled %}
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
                if (playerAudioInfo) {
                  song.audio_info = item[key];
                } else {
                  song.audio_info = '';
                } // END if playerAudioInfo
                continue;
              } else {
                song[key] = item[key];
              } // END if key
            } // END for item
          } // END id enabled

          songs.push(song);
        } // END for song_items

      {% endif %} {% endfor %}

      logger.info('\n' + 'creating global playlist  (API): finished');
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
        {% capture xhr_container_id %}{{player.id}}_parent{% endcapture %}

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
          dependency = 'dependencies_met_html_loaded_{{player.id}}';
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
      {% for list in amplitude_settings.playlists %} {% if list.enabled %}
        {% assign playlists_enabled = playlists_enabled | plus: 1 %}
      {% endif %} {% endfor %}

      {% assign playlists_processed = 0 %}
      {% for list in amplitude_settings.playlists %} {% if list.enabled %}
        {% assign playlist_items = list.items %}
        {% assign playlist_name  = list.name %}
        {% assign playlist_title = list.title %}

        {% comment %} collect song items
        ------------------------------------------------------------------------ {% endcomment %}
        {% for item in playlist_items %} {% if item.enabled %}
          {% capture song_item %}
          {
            "name":           "{{item.title}}",
            "artist":         "{{item.artist}}",
            "album":          "{{item.name}}",
            "url":            "{{item.audio_base}}/{{item.audio}}",
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
          song_change: function() {
            var songMetaData = Amplitude.getActiveSongMetadata();
            logger.debug('\n' + 'changed to title: ' + songMetaData.name + ' with titleIndex ' + songMetaData.index);
          },
          next: function() {
            var songMetaData = Amplitude.getActiveSongMetadata();

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
          },
          prev: function() {
            var songMetaData = Amplitude.getActiveSongMetadata();

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

    }, // END initApi

    // -------------------------------------------------------------------------
    // initPlayerUiEvents
    // -------------------------------------------------------------------------
    initPlayerUiEvents: () => {

      var dependencies_met_player_instances_initialized = setInterval (() => {
        if (apiInitialized.state) {
            logger.info('\n' + 'initialize player specific UI events: started');

          var parentContainer = (document.getElementById('{{xhr_container_id}}') !== null) ? true : false;
          var parentContainerExist = ($('#' + '{{xhr_container_id}}')[0] !== undefined) ? true : false;
          
          {% for player in amplitude_options.players %} {% if player.enabled %}
            {% assign xhr_data_path = amplitude_options.xhr_data_path %}
            {% capture xhr_container_id %}{{player.id}}_parent{% endcapture %}

            playerID            = '{{player.id}}';
            playerType          = '{{player.type}}';
            playList            = '{{player.playlist}}';
            playListName        = '{{player.playlist.name}}'
            playListTitle       = '{{player.playlist.title}}';
            
            logger.debug('\n' + 'set playlist {{player.playlist}} on id #{{player.id}} with title: ' + playListTitle);

            // dynamic loader variable to setup the player on ID {{player.id}}
            dependency = 'dependencies_met_player_loaded_{{player.id}}';
            load_dependencies[dependency] = '';

            // -----------------------------------------------------------------
            // initialize player instance (when player UI is loaded)
            // -----------------------------------------------------------------
            load_dependencies['dependencies_met_player_loaded_{{player.id}}'] = setInterval (() => {
              // check if HTML portion of the player is loaded successfully
              var xhrLoadState        = j1.xhrDOMState['#' + '{{xhr_container_id}}'];
              var playerExistsInPage  = ($('#' + '{{xhr_container_id}}')[0] !== undefined) ? true : false;

              if (xhrLoadState === 'success' && playerExistsInPage) {
//            if (xhrLoadState === 'success') {

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
                logger.debug('\n' + 'setup player specific UI events on ID #{{player.id}}: started');

                var dependencies_met_api_initialized = setInterval (() => {
                  if (apiInitialized.state) {
                    amplitudePlayerState = Amplitude.getPlayerState();

                    {% if player.id contains 'mini' %}
                    // ---------------------------------------------------------
                    // START mini player UI events
                    //
                    if (document.getElementById('{{player.id}}') !== null) {

                      // click on progress bar
                      // -------------------------------------------------------

                      // getElementsByClassName returns an Array-like object
                      var progressBars = document.getElementsByClassName("mini-player-progress");

                      // add listeners to all progress bars found
                      for (var i=0; i<progressBars.length; i++) {
                          progressBars[i].addEventListener('click', function(event) {
                            var offset = this.getBoundingClientRect();
                            var xpos   = event.pageX - offset.left;

                            Amplitude.setSongPlayedPercentage(
                              (parseFloat(xpos)/parseFloat(this.offsetWidth))*100);
                          });
                      }

                    } // END mini player UI events
                    {% endif %}

                    {% if player.id contains 'compact' %}
                    // ---------------------------------------------------------
                    // START compact player UI events
                    //
                    if (document.getElementById('{{player.id}}') !== null) {

                      // show|hide scrollbar in playlist
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
                     }

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
                      }

                      // click on progress bar
                      // -------------------------------------------------------

                      // getElementsByClassName returns an Array-like object
                      var progressBars = document.getElementsByClassName("compact-player-progress");

                      // add listeners to all progress bars found
                      for (var i=0; i<progressBars.length; i++) {
                        progressBars[i].addEventListener('click', function(event) {
                          var offset = this.getBoundingClientRect();
                          var xpos   = event.pageX - offset.left;

                          Amplitude.setSongPlayedPercentage(
                            (parseFloat(xpos)/parseFloat(this.offsetWidth))*100);
                        }); // END EventListener 'click'
                      }

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
                            } // END EventListener 'click'
                          });
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
                            } // END EventListener 'click'
                          });
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

                      // listener overloads for Youtube video (large player)
                      // -------------------------------------------------------

                      // click on prev button
                      var largePlayerPreviousButton = document.getElementById('large_player_previous');
                      if (largePlayerPreviousButton && largePlayerPreviousButton.getAttribute("data-amplitude-source") === 'youtube') {
                        largePlayerPreviousButton.addEventListener('click', function(event) {
                          var playlist  = this.getAttribute("data-amplitude-playlist");
                          var songIndex = ytpSongIndex;                          // Amplitude.getActiveIndex();

                        }); // END EventListener 'click'
                      }

                      // click on play_pause button
                      var largePlayerPlayButton = document.getElementById('large_player_play_pause');
                      if (largePlayerPlayButton && largePlayerPlayButton.getAttribute("data-amplitude-source") === 'youtube') {
                        largePlayerPlayButton.addEventListener('click', function(event) {
                          var playlist      = this.getAttribute("data-amplitude-playlist");
                          var songMetaData  = Amplitude.getSongAtIndex(ytpSongIndex);
                          var songURL       = songMetaData.url;
                          var songIndex     = ytpSongIndex;

                          var dependencies_met_ytIframeAPIReady = setInterval (() => {
                            if (j1.adapter.amplitude['iframeAPIReady']) {
                              ytPlayer          = j1.adapter.amplitude['ytPlayer'];
                              ytpPlaybackRate   = ytPlayer.getPlaybackRate()

                              // ytPlayer.loadVideoById({
                              //   'videoId': 'bHQqvYy5KYo',
                              //   'startSeconds': 5,
                              //   'endSeconds': 60
                              // });

                              // ytPlayer.loadVideoByUrl(
                              //   mediaContentUrl:  songURL,
                              //   startSeconds: 10
                              // )

                              // ytPlayer.playVideo();

                              clearInterval(dependencies_met_ytIframeAPIReady);
                            } // END if playersUILoaded
                          }, 10); // END dependencies_met_ytIframeAPIReady

                        }); // END EventListener 'click'
                      }

                      // click on next button
                      var largePlayerNextButton = document.getElementById('large_player_next');
                      if (largePlayerNextButton && largePlayerPlayButton.getAttribute("data-amplitude-source") === 'youtube') {
                        largePlayerNextButton.addEventListener('click', function(event) {
                          var playlist  = this.getAttribute("data-amplitude-playlist");
                          var songIndex = ytpSongIndex;                          // Amplitude.getActiveIndex();
                        }); // END EventListener 'click'
                      }

                      // click on song container
                      var largetPlayerSongContainer = document.getElementsByClassName("song amplitude-song-container");
                      for (var i=0; i<largetPlayerSongContainer.length; i++) {
                        if (largetPlayerSongContainer[i].dataset.amplitudeSource === 'youtube') {
                          largetPlayerSongContainer[i].addEventListener('click', function(event) {
                            var playlist        = this.getAttribute("data-amplitude-playlist");
                            var playlistLength  = largetPlayerSongContainer.length;
                            ytpSongIndex         = this.getAttribute("data-amplitude-song-index");
                          });
                        } // END if Attribute
                      } // END for

                      // add listeners to all progress bars found
                      // -------------------------------------------------------
                      var progressBars = document.getElementsByClassName("large-player-progress");
                      for (var i=0; i<progressBars.length; i++) {
                        progressBars[i].addEventListener('click', function(event) {
                          var offset = this.getBoundingClientRect();
                          var xpos   = event.pageX - offset.left;

                          Amplitude.setSongPlayedPercentage(
                            (parseFloat(xpos)/parseFloat(this.offsetWidth))*100);
                        }); // END EventListener 'click'
                      }

                      // click on skip forward|backward (large player)
                      // See: https://github.com/serversideup/amplitudejs/issues/384
                      // -------------------------------------------------------

                      // add listeners to all SkipForwardButtons found
                      var largePlayerSkipForwardButtons = document.getElementsByClassName("large-player-skip-forward");
                      for (var i=0; i<largePlayerSkipForwardButtons.length; i++) {
                        if (largePlayerSkipForwardButtons[i].id === 'skip-forward_{{player.id}}') {
                          if (largePlayerSkipForwardButtons[i].dataset.amplitudeSource === 'youtube') {
                            largePlayerSkipForwardButtons[i].addEventListener('click', function(event) {
                              const skipOffset  = parseFloat(playerForwardBackwardSkipSeconds);
                              //const duration    = Amplitude.getSongDuration();
                              //const currentTime = parseFloat(Amplitude.getSongPlayedSeconds());
                              //const targetTime  = parseFloat(currentTime + skipOffset);

                              // if (currentTime > 0) {
                              //   Amplitude.setSongPlayedPercentage((targetTime / duration) * 100);
                              // }
                            }); // END EventListener 'click
                          } else {
                            largePlayerSkipForwardButtons[i].addEventListener('click', function(event) {
                              const skipOffset  = parseFloat(playerForwardBackwardSkipSeconds);
                              const duration    = Amplitude.getSongDuration();
                              const currentTime = parseFloat(Amplitude.getSongPlayedSeconds());
                              const targetTime  = parseFloat(currentTime + skipOffset);

                              if (currentTime > 0) {
                                Amplitude.setSongPlayedPercentage((targetTime / duration) * 100);
                              }
                            }); // END EventListener 'click
                          }

                        } // END if ID
                      } // END for SkipForwardButtons

                      // add listeners to all SkipBackwardButtons found
                      var largePlayerSkipBackwardButtons = document.getElementsByClassName("large-player-skip-backward");
                      for (var i=0; i<largePlayerSkipBackwardButtons.length; i++) {
                        if (largePlayerSkipBackwardButtons[i].id === 'skip-backward_{{player.id}}') {
                          if (largePlayerSkipBackwardButtons[i].dataset.amplitudeSource === 'youtube') {
                            largePlayerSkipBackwardButtons[i].addEventListener('click', function(event) {
                              const skipOffset  = parseFloat(playerForwardBackwardSkipSeconds);
                            }); // END EventListener 'click'
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
                          }

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
                      if (largePlayerShuffleButton) {
                        largePlayerRepeatButton.addEventListener('click', function(event) {
                          var repeatState = (document.getElementById('large_player_repeat').className.includes('amplitude-repeat-on')) ? true : false;
                          Amplitude.setRepeat(repeatState)
                        }); // END EventListener 'click'
                      } // END largePlayerRepeatButton

                      // enable|disable scrolling on playlist
                      // -------------------------------------------------------
                      if (document.getElementById('large_player_right') !== null) {

                        // show|hide scrollbar in playlist
                        // -------------------------------------------------------
                        const songsInPlaylist = Amplitude.getSongsInPlaylist(playListName);

                        if (songsInPlaylist.length <= 8) {
                          const titleListLargePlayer = document.getElementById('large_player_title_list_' + playListName);
                          if (titleListLargePlayer !== null) {
                            titleListLargePlayer.classList.add('hide-scrollbar');
                          }
                        }

                        // scroll to player top position
                        // -------------------------------------------------------
                        var playlistHeader = document.getElementById("playlist_header_{{player.id}}");

                        playlistHeader.addEventListener('click', function(event) {
                          var scrollOffset = (window.innerWidth >= 720) ? -130 : -110;

                          // scroll player to top position
                          const targetDiv         = document.getElementById("playlist_header_{{player.id}}");
                          const targetDivPosition = targetDiv.offsetTop;
                          window.scrollTo(0, targetDivPosition + scrollOffset);
                        }); // END EventListener 'click'

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
