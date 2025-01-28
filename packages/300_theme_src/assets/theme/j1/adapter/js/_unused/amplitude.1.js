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

  // göobal settings
  // ---------------------------------------------------------------------------
  var environment             = '{{environment}}';
  var cookie_names            = j1.getCookieNames();
  var user_state              = j1.readCookie(cookie_names.user_state);
  var state                   = 'not_started';

  // module settings
  // ---------------------------------------------------------------------------

  // defaults
  // --------
  var _this;
  var logger;
  var logText;

  // date|time
  //----------
  var startTime;
  var endTime;
  var startTimeModule;
  var endTimeModule;
  var timeSeconds;

  // player instance settings
  // ---------------------------------------------------------------------------
  var playerID;
  var playList;
  var playListTitle;
  var amplitudeInitialized    = false;

  // player defaults
  // --------------
  var playerType              = '{{amplitude_defaults.player_type}}';
  var playerVolume            = '{{amplitude_defaults.volume}}';
  var playerRepeat            = ('{{amplitude_defaults.repeat}}' === 'true') ? true : false;
  var playerShuffle           = ('{{amplitude_defaults.shuffle}}' === 'true') ? true : false;
  var playerTitleInfo         = ('{{amplitude_defaults.title_info}}' === 'true') ? true : false;
  var playerPauseOnNextTitle  = ('{{amplitude_defaults.pause_on_next_title}}' === 'true') ? true : false;
  var playerDelayOnNextTitle  = '{{amplitude_defaults.delay_on_next_title}}';

  // player settings
  // ---------------
  var amplitudePlayerState;
  var amplitudeDefaults;
  var amplitudeSettings;
  var amplitudeOptions;


  // ---------------------------------------------------------------------------
  // main
  // ---------------------------------------------------------------------------
  return {

    // -------------------------------------------------------------------------
    // adapter initializer
    // -------------------------------------------------------------------------
    init: (options) => {
      var xhrLoadState        = 'pending';
      var load_dependencies   = {};
      var dependency;

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

      // create settings object from module options
      amplitudeDefaults = $.extend({}, {{amplitude_defaults | replace: 'nil', 'null' | replace: '=>', ':' }});
      amplitudeSettings = $.extend({}, {{amplitude_settings | replace: 'nil', 'null' | replace: '=>', ':' }});
      amplitudeOptions  = $.extend(true, {}, amplitudeDefaults, amplitudeSettings);

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
          logger.debug('\n' + 'state: ' + _this.getState());
          logger.info('\n' + 'module is being initialized');

          // -------------------------------------------------------------------
          // initialize amplitude instances
          // -------------------------------------------------------------------
          {% for player in amplitude_options.players %} {% if player.enabled %}
            {% assign player_items  = player.items %}
            {% assign player_index  = forloop.index0 %}
            {% assign player_id     = player.player_id %}
            {% assign xhr_data_path = amplitude_options.xhr_data_path %}
            {% capture xhr_container_id %}{{player_id}}_parent{% endcapture %}

            playerID      = '{{player.player_id}}';
            playList      = '{{player.playlist}}';
            playListTitle = '{{player.playlist_title}}';

            logger.info('\n' + 'found player on id: #' + playerID);
            logger.info('\n' + 'set playlist {{player.playlist}} on id #{{player_id}}: ' + playListTitle);

            // load|set (default) values
            playerVolume            = ('{{player.volume}}' !== '') ? '{{player.volume}}' : playerVolume;
            playerRepeat            = ('{{player.repeat}}' === 'true') ? true : playerRepeat;
            playerShuffle           = ('{{player.shuffle}}' === 'true') ? true : playerShuffle;
            playerType              = ('{{player.player_type}}' !== '') ? '{{player.player_type}}' : playerType;
            playerTitleInfo         = ('{{player.title_info}}' === 'true') ? true : playerTitleInfo;
            playerPauseOnNextTitle  = ('{{player.delay_on_next_title}}' === 'true') ? true : playerPauseOnNextTitle;
            playerDelayOnNextTitle  = ('{{player.delay_on_next_title}}' === 'true') ? true : playerDelayOnNextTitle;

            var uiLoaderSettings = {
              player_id:          '{{player_id}}',
              xhr_container_id:   '{{xhr_container_id}}',
              xhr_data_path:      '{{xhr_data_path}}'
            }
            _this.uiLoader(uiLoaderSettings);

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
                logger.info('\n' + 'load playerUI on ID ' + '#' + '{{player_id}}' + ': finished');

                // player|right (playlist): set audio info (per item)
                // -------------------------------------------------------------
                if (playerTitleInfo) {
                  var audioInfoLinks = document.getElementsByClassName('audio-info-link');
                  _this.audioInfo(audioInfoLinks);
                }

                // player|right (playlist): set highlight|play on selected song
                // -------------------------------------------------------------
                var songElements = document.getElementsByClassName('song');
                _this.songEvents(songElements);

                // setup amplitude instance
                // -------------------------------------------------------------
                logger.info('\n' + 'initialize player on ID #{{player_id}}: started');
                const playerItems = $.extend({}, {{player_items | replace: 'nil', 'null' | replace: '=>', ':' }});

                // cleanup playerItems
                var playerItemsEnabled = {};
                for (var i = 0; i < Object.keys(playerItems).length; i++) {
                  if (playerItems[i].enabled) {
                    playerItemsEnabled[i.toString()] = playerItems[i];
                  } // END if enabled
                } // END for playerItems

                _this.initApi(playList, playListTitle, playerItemsEnabled);

                var dependencies_met_api_initialized = setInterval (() => {
                  if (amplitudeInitialized) {
                    amplitudePlayerState = Amplitude.getPlayerState();

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
                    if (document.getElementById('flat-black-player-container') !== null) {
                      document.getElementsByClassName('down-header')[0].addEventListener('click', function() {
                        var list = document.getElementById('list');
                        list.style.height = ( parseInt( document.getElementById('flat-black-player-container').offsetHeight ) - 135 ) + 'px';

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
                      document.getElementById('flat-player-progress').addEventListener('click', function(event) {
                        var offset = this.getBoundingClientRect();
                        var xpos   = event.pageX - offset.left;

                        Amplitude.setSongPlayedPercentage(
                          (parseFloat(xpos)/parseFloat(this.offsetWidth))*100);
                      });
                    } // END if flat-black-player-container

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

                    // global player settings
                    // ---------------------------------------------------------
                    logger.info('\n' + 'set delay between titles: ' + playerDelayOnNextTitle + 'ms');
                    logger.info('\n' + 'set repeat (album): ' + playerRepeat);
                    logger.info('\n' + 'set shuffle (album): ' + playerShuffle);

                    // set delay between titles (songs)
                    Amplitude.setDelay(playerDelayOnNextTitle);
                    // set repeat (album)
                    Amplitude.setRepeat(playerRepeat)
                    // set shuffle (album)
                    Amplitude.setShuffle(playerShuffle)

                    // var activePlayList = Amplitude.getSongsInPlaylist(playList);

                    // set finished messages
                    // ---------------------------------------------------------
                    //
                    logger.info('\n' + 'initialize player on ID #{{player_id}}: finished');
                    logger.debug('\n' + 'current player state: ' + amplitudePlayerState);

                    _this.setState('finished');
                    logger.debug('\n' + 'state: ' + _this.getState());
                    logger.info('\n' + 'module initialized successfully');

                    endTimeModule = Date.now();
                    logger.info('\n' + 'module initializing time: ' + (endTimeModule-startTimeModule) + 'ms');

                    clearInterval(dependencies_met_api_initialized);
                  } // END if amplitudeInitialized
                }, 10); // END dependencies_met_api_initialized

                clearInterval(load_dependencies['dependencies_met_html_loaded_{{player_id}}']);
              }
            }, 10); // END dependencies_met_html_loaded
//          }, 100 + ({{player_index}} * 50));
          {% endif %} {% endfor %}
          // initialize amplitude instance (Liquid)

          clearInterval(dependencies_met_page_ready);
        } // END pageVisible
      }, 10); // END dependencies_met_page_ready
    }, // END init

    // -------------------------------------------------------------------------
    // UI Loader
    // -------------------------------------------------------------------------
    uiLoader: (options) => {
      _this.setState('loading');
      logger.debug('\n' + 'set module state to: ' + _this.getState());
      logger.info('\n' + 'load playerUI on ID ' + '#' + options.player_id + ': started');

      j1.loadHTML({
        xhr_container_id: options.xhr_container_id,
        xhr_data_path:    options.xhr_data_path,
        xhr_data_element: options.player_id
        },
        'j1.adapter.amplitude',
        'data_loaded'
      );
    }, // END uiLoader

    // -------------------------------------------------------------------------
    // initApi
    // -------------------------------------------------------------------------
    initApi: (playlist, playlist_title, audio_items) => {
      var playList      = playlist;
      var playListTitle = playlist_title;
      var songs         = [];

      for (var i = 0; i < Object.keys(audio_items).length; i++) {
        if (audio_items[i].enabled) {
          var item = audio_items[i];
          var song = {};

          // map config settings|amplitude song items
          // -------------------------------------------------------------------
          for (const key in item) {
            // skip properties NOT needed for a song
            if (key === 'item' || key === 'audio_base' || key === 'enabled') {
              continue;
            } else if (key === 'audio') {
              song.url = audio_items[i].audio_base + '/' + item[key];
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
            }else {
              song[key] = item[key];
            } // END if key
          } // END for item
        } // END id enabled
        songs.push(song);
      } // END for items

     // See: https://521dimensions.com/open-source/amplitudejs/docs
      Amplitude.init({
        bindings: {
          37:     'prev',
          39:     'next',
          32:     'play_pause'
        },
        songs: songs,
        // "playlists": {
        //   [playlist]: {
        //     title: playListTitle,
        //     songs: [1, 2, 3]
        //   },
        // },
        callbacks: {

          initialized: function() {
            // successfully initialized
            amplitudeInitialized = true;
            var activePlayListSongs = Amplitude.getSongsInPlaylist(playList);
            var bla = '';
          },

          onInitError: function() {
            // failed on initializarion
            console.error('\n' + 'Amplitude failed on initialization');
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
            logger.debug('\n' + 'changed to title: ' + songMetaData.name);
          },

          next: function() {
            var songMetaData = Amplitude.getActiveSongMetadata();
            if (playerPauseOnNextTitle) {
              // check current playback state
              amplitudePlayerState = Amplitude.getPlayerState();
              if (amplitudePlayerState === 'playing' || amplitudePlayerState === 'stopped' || amplitudePlayerState === 'paused') {
                // pause playback of next title
                setTimeout(() => {
                  logger.debug('\n' + 'paused on next title: ' + songMetaData.name);
                  Amplitude.pause();
                }, 150);
              } // END if amplitudePlayerState
            } // END if playerPauseOnNextTitle
          }
        },
        waveforms: {
          sample_rate: 50
        },
        volume: playerVolume
      });
    }, // END initApi

    // -------------------------------------------------------------------------
    // audioInfo
    // -------------------------------------------------------------------------
    audioInfo: (audioInfo) => {
      // jadams: ???
      // when the audioInfo link is pressed, stop all propagation so
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
      logger.info('\n' + 'initialize all title events for player on ID: ' + '#' + playerID);

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
