---
regenerate:                             true
---

{% capture cache %}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/amplitude.js
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
{% assign asset_path          = "/assets/themes/j1" %}

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
 # ~/assets/themes/j1/adapter/js/amplitude.js
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

'use strict';
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

  // player instance
  // ---------------------------------------------------------------------------
  var amplitudeInitialized    = false;

  // player config
  // ---------------------------------------------------------------------------
  var playerID;

  // defaults
  // --------
  var playerVolume            = '50';
  var playerRepeat            = false;
  var playerShuffle           = false;
  var playerTitleInfo         = false;
  var playerDelayOnNextTitle  = '100';
  var playerPauseOnNextTitle  = false;

  // settings
  // --------
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

        if (j1CoreFinished && pageVisible) {
          startTimeModule = Date.now();

          _this.setState('started');
          logger.debug('\n' + 'state: ' + _this.getState());
          logger.info('\n' + 'module is being initialized');

          // -------------------------------------------------------------------
          // initialize amplitude instances
          // -------------------------------------------------------------------
          {% for player in amplitude_options.players %} {% if player.enabled %}
            {% assign player_items  = player.items %}
            {% assign player_id     = player.player_id %}
            {% assign xhr_data_path = amplitude_options.xhr_data_path %}
            {% capture xhr_container_id %}{{player_id}}_parent{% endcapture %}

            playerID              = '{{player.player_id}}';

            // load|set (default) values
            playerVolume            = ('{{player.volume}}' !== '') ? '{{player.volume}}' : playerVolume;
            playerRepeat            = ('{{player.repeat}}' !== '') ? '{{player.repeat}}' : playerRepeat;
            playerShuffle           = ('{{player.shuffle}}' !== '') ? '{{player.shuffle}}' : playerShuffle;
            playerTitleInfo         = ('{{player.title_info}}' !== '') ? '{{player.title_info}}' : playerTitleInfo;
            playerPauseOnNextTitle  = ('{{player.delay_on_next_title}}' !== '') ? '{{player.pause_on_next_title}}' : playerPauseOnNextTitle;
            playerDelayOnNextTitle  = ('{{player.delay_on_next_title}}' !== '') ? '{{player.delay_on_next_title}}' : playerDelayOnNextTitle;

            // convert text to boolean
            playerRepeat            = ('{{player.repeat}}' == 'true') ? true : false;
            playerShuffle           = ('{{player.repeat}}' == 'true') ? true : false;
            playerTitleInfo         = ('{{player.title_info}}' == 'true') ? true : false;
            playerPauseOnNextTitle  = ('{{player.delay_on_next_title}}' == 'true') ? true : false;
            playerDelayOnNextTitle  = ('{{player.delay_on_next_title}}' == 'true') ? true : false;

            logger.info('\n' + 'found player on id: ' + '#' + '{{player_id}}');

            var uiLoaderSettings = {
              player_id:          '{{player_id}}',
              xhr_container_id:   '{{xhr_container_id}}',
              xhr_data_path:      '{{xhr_data_path}}'
            }
            _this.uiLoader(uiLoaderSettings);

            // dynamic loader variable to setup the playeron ID {{player_id}}
            dependency = 'dependencies_met_html_loaded_{{player_id}}';
            load_dependencies[dependency] = '';

            // -----------------------------------------------------------------
            // initialize amplitude instance (when player UI loaded)
            // -----------------------------------------------------------------
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
                _this.initApi(playerItems);

                var dependencies_met_api_initialized = setInterval (() => {
                  if (amplitudeInitialized) {
                    amplitudePlayerState = Amplitude.getPlayerState();

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
    initApi: (audio_items) => {
      var songs = [];

      for (var i = 0; i < Object.keys(audio_items).length; i++) {
        if (audio_items[i].enabled) {
          var item = audio_items[i];
          var song = {};

          // remap config settings|amplitude song items
          // -------------------------------------------------------------------
          for (const key in item) {
            if (key === 'audio_base' || key === 'item' || key === 'enabled') {
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

      Amplitude.init({
        songs: songs,
        callbacks: {
          // See: https://521dimensions.com/open-source/amplitudejs/docs
          initialized: function() {
            // successfully initialized
            amplitudeInitialized = true;
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
          this.style.backgroundColor = '#00A0FF';
          this.querySelectorAll('.audio-meta-data .audio-title')[0].style.color  = '#FFFFFF';
          this.querySelectorAll('.audio-meta-data .audio-artist')[0].style.color = '#FFFFFF';

          if (!this.classList.contains('amplitude-active-song-container')) {
            this.querySelectorAll('.play-button-container')[0].style.display = 'block';
          } // END if ???

          if (playerTitleInfo) {
            this.querySelectorAll('img.audio-info-grey')[0].style.display  = 'none';
            this.querySelectorAll('img.audio-info-white')[0].style.display = 'block';
          } else {
            this.querySelectorAll('img.audio-info-grey')[0].style.display  = 'none';
            this.querySelectorAll('img.audio-info-white')[0].style.display = 'none';
          } // END if playerTitleInfo

          this.querySelectorAll('.audio-duration')[0].style.color = '#FFFFFF';
        });

        // ensure that on mouseout, CSS styles don't get messed up for active songs
        songs[i].addEventListener('mouseout', function() {
          this.style.backgroundColor = '#FFFFFF';
          this.querySelectorAll('.audio-meta-data .audio-title')[0].style.color  = '#272726';
          this.querySelectorAll('.audio-meta-data .audio-artist')[0].style.color = '#607D8B';
          this.querySelectorAll('.play-button-container')[0].style.display = 'none';

          if (playerTitleInfo) {
            this.querySelectorAll('img.audio-info-grey')[0].style.display  = 'block';
            this.querySelectorAll('img.audio-info-white')[0].style.display = 'none';
          } else {
            this.querySelectorAll('img.audio-info-grey')[0].style.display  = 'none';
            this.querySelectorAll('img.audio-info-white')[0].style.display = 'none';
          } // END if playerTitleInfo

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
