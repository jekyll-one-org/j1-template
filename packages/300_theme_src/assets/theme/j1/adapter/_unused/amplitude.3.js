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

'use strict';
j1.adapter.amplitude = ((j1, window) => {

  {% comment %} Set global variables
  ------------------------------------------------------------------------------ {% endcomment %}
  var environment          = '{{environment}}';
  var cookie_names         = j1.getCookieNames();
  var user_state           = j1.readCookie(cookie_names.user_state);
  var state                = 'not_started';

  var amplitudeInitialized = false;
  var amplitudePlayAll     = false;

  var amplitudePlayerState;
  var amplitudeDefaults;
  var amplitudeSettings;
  var amplitudeOptions;

  var _this;
  var logger;
  var logText;

  // date|time
  var startTime;
  var endTime;
  var startTimeModule;
  var endTimeModule;
  var timeSeconds;


  // ---------------------------------------------------------------------------
  // main
  // ---------------------------------------------------------------------------
  return {

    // -------------------------------------------------------------------------
    // adapter initializer
    // -------------------------------------------------------------------------
    init: (options) => {
      var xhrLoadState      = 'pending';
      var load_dependencies = {};
      var dependency;

      // -----------------------------------------------------------------------
      // default module settings
      // -----------------------------------------------------------------------
      var settings = $.extend({
        module_name: 'j1.adapter.amplitude',
        generated:   '{{site.time}}'
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

        if (j1CoreFinished && pageVisible) {
          startTimeModule = Date.now();

          _this.setState('started');
          logger.debug('\n' + 'state: ' + _this.getState());
          logger.info('\n' + 'module is being initialized');

          // var uiLoaderOptions = {
          //   player_id:        'back_to_black',
          //   xhr_container_id: amplitudeOptions.xhr_container_id,
          //   xhr_data_path:    amplitudeOptions.xhr_data_path
          // }
          //
          // _this.uiLoader(uiLoaderOptions);

          // -------------------------------------------------------------------
          // initialize amplitude instance (Liquid)
          // -------------------------------------------------------------------
          {% for player in amplitude_options.players %} {% if player.enabled %}
            {% assign player_id     = player.player_id %}
            {% assign xhr_data_path = amplitude_options.xhr_data_path %}
            {% capture xhr_container_id %}{{player_id}}_parent{% endcapture %}

            logger.info('\n' + 'found player on id: ' + '{{player_id}}');

            var uiLoaderSettings = {
              player_id:          '{{player_id}}',
              xhr_container_id:   '{{xhr_container_id}}',
              xhr_data_path:      '{{xhr_data_path}}'
            }
            _this.uiLoader(uiLoaderSettings);

            // create dynamic loader variable to setup the grid on id {{player_id}}
            dependency = 'dependencies_met_html_loaded_{{player_id}}';
            load_dependencies[dependency] = '';

            // initialize the grid if HTML portion successfully loaded
            load_dependencies['dependencies_met_html_loaded_{{player_id}}'] = setInterval (() => {
              // check if HTML portion of the grid is loaded successfully
              xhrLoadState = j1.xhrDOMState['#' + '{{xhr_container_id}}'];

              if (xhrLoadState === 'success') {
                logger.info('\n' + 'load playerUI on ID ' + '#' + '{{player_id}}' + ': finished');

                // do more
                // -------------------------------------------------------------
                // player|right (playlist): set audio info (per item)
                // ---------------------------------------------------------------
                var audioInfoLinks = document.getElementsByClassName('audio-info-link');
                _this.audioInfo(audioInfoLinks);

                // player|right (playlist): set highlight|play on selected song
                // ---------------------------------------------------------------
                var songElements = document.getElementsByClassName('song');
                _this.songEvents(songElements);

                // setup amplitude instance
                // ---------------------------------------------------------------
                logger.info('\n' + 'initialize player on ID #{{player_id}}: started');
                _this.initApi(amplitudeOptions);

                var dependencies_met_api_initialized = setInterval (() => {
                  if (amplitudeInitialized) {
                    amplitudePlayerState = Amplitude.getPlayerState();

                    // set delay between audio items (songs)
                    // Amplitude.setDelay(5000);

                    logger.info('\n' + 'initialize player on ID {{player_id}}: finished');
                    logger.info('\n' + 'current player state: ' + amplitudePlayerState);

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
          {% endif %} {% endfor %}

          // -------------------------------------------------------------------
          // initialize amplitude instance (when player UI loaded)
          // -------------------------------------------------------------------
          var dependencies_met_player_initialized = setInterval (() => {
            var playerUILoaded = (j1.xhrDOMState['#' + amplitudeOptions.xhr_container_id] === 'success') ? true: false;

            if (playerUILoaded) {
              _this.setState('loaded');
              logger.info('\n' + 'load playerUI on ID ' + '#' + amplitudeOptions.player_id + ': finished');

              // player|right (playlist): set audio info (per item)
              // ---------------------------------------------------------------
              var audioInfoLinks = document.getElementsByClassName('audio-info-link');
              _this.audioInfo(audioInfoLinks);

              // player|right (playlist): set highlight|play on selected song
              // ---------------------------------------------------------------
              var songElements = document.getElementsByClassName('song');
              _this.songEvents(songElements);

              // setup amplitude instance
              // ---------------------------------------------------------------
              logger.info('\n' + 'initialize player on ID ' + '#' + amplitudeOptions.player_id + ': started');
              _this.initApi(amplitudeOptions);

              var dependencies_met_api_initialized = setInterval (() => {
                if (amplitudeInitialized) {
                  amplitudePlayerState = Amplitude.getPlayerState();

                  // set delay between audio items (songs)
                  // Amplitude.setDelay(5000);

                  logger.info('\n' + 'initialize player on ID ' + '#' + amplitudeOptions.player_id + ': finished');
                  logger.info('\n' + 'current player state: ' + amplitudePlayerState);

                  _this.setState('finished');
                  logger.debug('\n' + 'state: ' + _this.getState());
                  logger.info('\n' + 'module initialized successfully');

                  endTimeModule = Date.now();
                  logger.info('\n' + 'module initializing time: ' + (endTimeModule-startTimeModule) + 'ms');

                  clearInterval(dependencies_met_api_initialized);
                } // END if amplitudeInitialized
              }, 10); // END dependencies_met_api_initialized

              clearInterval(dependencies_met_player_initialized);
            } // END if playerUILoaded
          }, 10); // END dependencies_met_player_initialized

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
    initApi: (options) => {
      Amplitude.init({
        songs: [
          {
            album:                      "Back To Black",
            name:                       "Rehab",
            artist:                     "Amy Winehouse",
            url:                        "/assets/audio/album/back_to_black/Rehab.mp3",
            cover_art_url:              "/assets/audio/cover/amy_winehouse/back_to_black.jpg"
          },
          {
            album:                      "Back To Black",
            name:                       "You Know I'm No Good",
            artist:                     "Amy Winehouse",
            url:                        "/assets/audio/album/back_to_black/You Know I'm No Good.mp3",
            cover_art_url:              "/assets/audio/cover/amy_winehouse/back_to_black.jpg"
          },
          {
            album:                      "Back To Black",
            name:                       "Me & Mr Jones",
            artist:                     "Amy Winehouse",
            url:                        "/assets/audio/album/back_to_black/Me & Mr Jones.mp3",
            cover_art_url:              "/assets/audio/cover/amy_winehouse/back_to_black.jpg"
          },
          {
            album:                      "Back To Black",
            name:                       "Just Friends",
            artist:                     "Amy Winehouse",
            url:                        "/assets/audio/album/back_to_black/Just Friends.mp3",
            cover_art_url:              "/assets/audio/cover/amy_winehouse/back_to_black.jpg"
          },
          {
            album:                      "Back To Black",
            name:                       "Back To Black",
            artist:                     "Amy Winehouse",
            url:                        "/assets/audio/album/back_to_black/Back To Black.mp3",
            cover_art_url:              "/assets/audio/cover/amy_winehouse/back_to_black.jpg"
          }
        ],

        callbacks: {
          // See: https://521dimensions.com/open-source/amplitudejs/docs
          initialized: function() {
            // Amplitude successfully initialized
            amplitudeInitialized = true;
          },

          onInitError: function() {
            // Amplitude failed on initializarion
            console.error('\n' + 'Amplitude failed on initialization');
          },

          play: function() {
            document.getElementById('album-art').style.visibility = 'hidden';
            document.getElementById('large-visualization').style.visibility = 'visible';
          },

          pause: function() {
            document.getElementById('album-art').style.visibility = 'visible';
            document.getElementById('large-visualization').style.visibility = 'hidden';
          },

          // next: function(event) {
          //   // when the song changes, stop the playback of the entire album
          //   setTimeout(() => {
          //     Amplitude.stop();
          //   }, 50);
          // },

          // song_change: function(event) {
          //   // when the song changes, stop the playback of the entire album
          //   setTimeout(() => {
          //     Amplitude.stop();
          //   }, 50);
          // },

          ended: function(event) {
            if (!amplitudePlayAll) {
              // Check the current playback state
              amplitudePlayerState = Amplitude.getPlayerState();
              if (amplitudePlayerState === 'playing' || amplitudePlayerState === 'stopped' || amplitudePlayerState === 'paused') {
                logger.info('\n' + 'current player state: ' + amplitudePlayerState);

                // when the song ends, pause the playback of the album
                setTimeout(() => {
                  logger.info('\n' + 'set player to: paused');
                  Amplitude.pause();
                  amplitudePlayerState = Amplitude.getPlayerState();
                  logger.info('\n' + 'current player state: ' + amplitudePlayerState);
                }, 150);
              } // END if amplitudePlayerState
            } // END if amplitudePlayAll
          }
        },

        waveforms: {
          sample_rate: 50
        }
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
      logger.info('\n' + 'initialize audio item events');

      for (var i = 0; i < songs.length; i++) {
        // ensure that on mouseover, CSS styles don't get messed up for active songs
        songs[i].addEventListener('mouseover', function() {
          this.style.backgroundColor = '#00A0FF';
          this.querySelectorAll('.audio-meta-data .audio-title')[0].style.color = '#FFFFFF';
          this.querySelectorAll('.audio-meta-data .audio-artist')[0].style.color = '#FFFFFF';

          if( !this.classList.contains('amplitude-active-song-container') ){
            this.querySelectorAll('.play-button-container')[0].style.display = 'block';
          }

          this.querySelectorAll('img.audio-info-grey')[0].style.display = 'none';
          this.querySelectorAll('img.audio-info-white')[0].style.display = 'block';
          this.querySelectorAll('.audio-duration')[0].style.color = '#FFFFFF';
        });

        // ensure that on mouseout, CSS styles don't get messed up for active songs
        songs[i].addEventListener('mouseout', function() {
          this.style.backgroundColor = '#FFFFFF';
          this.querySelectorAll('.audio-meta-data .audio-title')[0].style.color = '#272726';
          this.querySelectorAll('.audio-meta-data .audio-artist')[0].style.color = '#607D8B';
          this.querySelectorAll('.play-button-container')[0].style.display = 'none';
          this.querySelectorAll('img.audio-info-grey')[0].style.display = 'block';
          this.querySelectorAll('img.audio-info-white')[0].style.display = 'none';
          this.querySelectorAll('.audio-duration')[0].style.color = '#607D8B';
        });

        // show|hide the (mini) play button when the song is clicked
        songs[i].addEventListener('click', function () {
          this.querySelectorAll('.play-button-container')[0].style.display = 'none';
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
