---
regenerate:                             true
---

{%- capture cache -%}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/adapter/js/videoPlayer.js (1)
 # J1 Adapter for the module VideoPlayer (native videoJS)
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2026 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 # -----------------------------------------------------------------------------
 # claude - Fix J1 VideoPlayer #1
 # Adapter created from scratch for the native-video videoPlayer module.
 # Follows the same pattern as j1.adapter.claudeAI / j1.adapter.mmenu:
 #
 #   1. Merge default + user YAML settings into videoPlayerOptions.
 #   2. Expose videoPlayerOptions as j1.adapter.videoPlayer.videoPlayerOptions
 #      so the module can read it via j1.adapter.videoPlayer.videoPlayerOptions.
 #   3. Inside dependencies_met_page_ready, call initHandlers() which
 #      calls setAdapterOptions() on the module's playlistManager and then
 #      instantiates every handler class exported by the module.
 #
 # -----------------------------------------------------------------------------
{% endcomment %}

{% comment %} Liquid procedures
-------------------------------------------------------------------------------- {% endcomment %}

{% comment %} Set global settings
-------------------------------------------------------------------------------- {% endcomment %}
{% assign environment             = site.environment %}
{% assign asset_path              = "/assets/theme/j1" %}

{% comment %} Process YML config data
================================================================================ {% endcomment %}

{% comment %} Set config files
-------------------------------------------------------------------------------- {% endcomment %}
{% assign template_config         = site.data.j1_config %}
{% assign blocks                  = site.data.blocks %}
{% assign modules                 = site.data.modules %}

{% comment %} Set config data
-------------------------------------------------------------------------------- {% endcomment %}
{% assign videoplayer_defaults    = modules.defaults.videoPlayer.defaults %}
{% assign videoplayer_settings    = modules.videoPlayer.settings %}

{% comment %} Set config options (deep merge: defaults <- user settings)
-------------------------------------------------------------------------------- {% endcomment %}
{% assign videoplayer_options     = videoplayer_defaults | merge: videoplayer_settings %}


{% comment %} Detect prod mode
-------------------------------------------------------------------------------- {% endcomment %}
{% assign production = false %}
{% if environment == 'prod' or environment == 'production' %}
  {% assign production = true %}
{% endif %}


/*
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/adapter/js/videoPlayer.js (1)
 # J1 Adapter for the module VideoPlayer (native HTML5/videoJS)
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2023-2026 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 # -----------------------------------------------------------------------------
 #  Adapter generated: {{site.time}}
 # -----------------------------------------------------------------------------
*/

// -----------------------------------------------------------------------------
// ESLint shimming
// -----------------------------------------------------------------------------
/* eslint indent: "off"                                                       */
// -----------------------------------------------------------------------------
"use strict";
j1.adapter.videoPlayer = ((j1, window) => {

  // ---------------------------------------------------------------------------
  // Module-level variables
  // ---------------------------------------------------------------------------

  const env   = '{{environment}}';
  const isDev = (env === 'development' || env === 'dev') ? true : false;

  let videoPlayerDefaults;
  let videoPlayerSettings;
  let videoPlayerOptions;

  let _this;
  let logger;
  let logText;

  // J1 Adapter optimizations #1
  // safety-bound for the page-ready poller: cleared on success, triggers
  // a warning + cleanup if the page-ready conditions are never met.
  //
  let dependenciesTimeout;

  // date|time
  let startTime;
  let endTime;
  let startTimeModule;
  let endTimeModule;
  let timeSeconds;

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
        module_name: 'j1.adapter.videoPlayer',
        generated:   '{{site.time}}'
      }, options);

      // -----------------------------------------------------------------------
      // global variable settings
      // -----------------------------------------------------------------------
      _this  = j1.adapter.videoPlayer;
      logger = log4javascript.getLogger('j1.adapter.videoPlayer');

      // -----------------------------------------------------------------------
      // merge default + user YAML settings
      // -----------------------------------------------------------------------
      videoPlayerDefaults = $.extend({}, {{videoplayer_defaults | replace: 'nil', 'null' | replace: '=>', ':' }});
      videoPlayerSettings = $.extend({}, {{videoplayer_settings | replace: 'nil', 'null' | replace: '=>', ':' }});
      videoPlayerOptions  = $.extend(true, {}, videoPlayerDefaults, videoPlayerSettings);

      // Expose the merged options on the adapter object so the module can
      // read them via  j1.adapter.videoPlayer.videoPlayerOptions.
      //
      _this['videoPlayerOptions'] = videoPlayerOptions;

      // -----------------------------------------------------------------------
      // module initializer
      // -----------------------------------------------------------------------
      var dependencies_met_page_ready = setInterval(() => {
        var pageState      = $('#content').css('display');
        var pageVisible    = (pageState === 'block') ? true : false;
        var j1CoreFinished = (j1.getState() === 'finished') ? true : false;

        if (j1CoreFinished && pageVisible) {
          startTimeModule = Date.now();

          _this.setState('started');
          logger.debug('\n' + 'state: ' + _this.getState());
          logger.info('\n' + 'module is being initialized');

          // Initialize all playlist and UI handlers once the page is ready.
          //
          _this.initHandlers(videoPlayerOptions);

          _this.setState('finished');
          logger.debug('\n' + 'state: ' + _this.getState());
          logger.info('\n' + 'initializing module finished');

          endTimeModule = Date.now();
          logger.info('\n' + 'module initializing time: ' + (endTimeModule - startTimeModule) + ' ms');

          clearInterval(dependencies_met_page_ready);

          // J1 Adapter optimizations #1
          // clear the safety timeout on the happy path
          //
          if (dependenciesTimeout) {
            clearTimeout(dependenciesTimeout);
            dependenciesTimeout = null;
          }
        } // END if j1CoreFinished && pageVisible
      }, 10); // END dependencies_met_page_ready

      // J1 Adapter optimizations #1
      // safety bound paired with the 10ms poller above
      //
      dependenciesTimeout = setTimeout(function() {
        if (dependencies_met_page_ready) {
          clearInterval(dependencies_met_page_ready);
          logger.warn('\n' + 'videoPlayer init aborted: page-ready conditions not met within 5s');
        }
      }, 5000);

    }, // END init

    // -------------------------------------------------------------------------
    // claude - Fix J1 VideoPlayer #1
    // initHandlers()
    // Initialize all playlist and UI handler classes exported by the
    // videoPlayer module.  Called from within dependencies_met_page_ready
    // once the J1 core and the page are both ready.
    //
    // Handler init order mirrors the skipad adapter:
    //
    //   1. setAdapterOptions             — write merged options into the module scope
    //   2. playlistIOHandler             — import / export / clear / server-load buttons
    //   3. playlistSearchHandler         — live search + clear
    //   4. playlistModeSwitchHandler     — cards ↔ list toggle
    //   5. playlistMergeSwitchHandler    — merge-mode toggle
    //   6. playlistLoopSwitchHandler     — loop-mode toggle
    //   7. playlistSortHandler           — sort <select>
    //   8. inputWrapperHandler           — URL input + paste + load-video button
    //   9. inputValueBackgroundHandler   — input fill-state background sync
    //  10. navbarSmoothScrollHandler     — same-page anchor smooth-scroll
    //
    // -------------------------------------------------------------------------
    initHandlers: (options) => {

      logger.info('\n' + 'initializing playlist handlers: started');

      // Guard: videoPlayer module must be loaded before the adapter tries
      // to call its API.
      //
      if (typeof videoPlayer === 'undefined') {
        logger.error('\n' + 'initHandlers: videoPlayer module not found — handlers NOT initialized');
        return;
      }

      // 1. Push the merged adapter options into the module scope so that
      //    all module-internal code that reads the module-level variable
      //    `videoPlayerOptions` (set via j1.adapter.videoPlayer.videoPlayerOptions)
      //    and the playlistManager-level `adapterOptions` / `isDev` have
      //    consistent, adapter-sourced values.
      //
      try {
        videoPlayer.playlistManager.setAdapterOptions(options);
        logger.debug('\n' + 'initHandlers: setAdapterOptions — OK');
      } catch (e) {
        logger.error('\n' + 'initHandlers: setAdapterOptions failed: ' + e);
      }

      // 2. playlistIOHandler — import / export / clear / server-playlist buttons
      //
      if (options.playlist && options.playlist.enabled) {
        try {
          new videoPlayer.playlistIOHandler(options);
          logger.debug('\n' + 'initHandlers: playlistIOHandler — OK');
        } catch (e) {
          logger.error('\n' + 'initHandlers: playlistIOHandler failed: ' + e);
        }
      } else {
        logger.info('\n' + 'initHandlers: playlistIOHandler skipped (playlist disabled)');
      }

      // 3. playlistSearchHandler — live full-text search
      //
      if (options.playlist && options.playlist.enabled &&
          options.playlist.search && options.playlist.search.enabled) {
        try {
          new videoPlayer.playlistSearchHandler();
          logger.debug('\n' + 'initHandlers: playlistSearchHandler — OK');
        } catch (e) {
          logger.error('\n' + 'initHandlers: playlistSearchHandler failed: ' + e);
        }
      } else {
        logger.info('\n' + 'initHandlers: playlistSearchHandler skipped (search disabled)');
      }

      // 4. playlistModeSwitchHandler — cards ↔ list display mode toggle
      //
      if (options.playlist && options.playlist.enabled) {
        try {
          new videoPlayer.playlistModeSwitchHandler(options);
          logger.debug('\n' + 'initHandlers: playlistModeSwitchHandler — OK');
        } catch (e) {
          logger.error('\n' + 'initHandlers: playlistModeSwitchHandler failed: ' + e);
        }
      } else {
        logger.info('\n' + 'initHandlers: playlistModeSwitchHandler skipped (playlist disabled)');
      }

      // 5. playlistMergeSwitchHandler — merge-mode toggle
      //
      if (options.playlist && options.playlist.enabled) {
        try {
          new videoPlayer.playlistMergeSwitchHandler(options);
          logger.debug('\n' + 'initHandlers: playlistMergeSwitchHandler — OK');
        } catch (e) {
          logger.error('\n' + 'initHandlers: playlistMergeSwitchHandler failed: ' + e);
        }
      } else {
        logger.info('\n' + 'initHandlers: playlistMergeSwitchHandler skipped (playlist disabled)');
      }

      // 6. playlistLoopSwitchHandler — loop-mode toggle
      //
      if (options.playlist && options.playlist.enabled &&
          options.playlist.loop && options.playlist.loop.enabled !== undefined) {
        try {
          new videoPlayer.playlistLoopSwitchHandler(options);
          logger.debug('\n' + 'initHandlers: playlistLoopSwitchHandler — OK');
        } catch (e) {
          logger.error('\n' + 'initHandlers: playlistLoopSwitchHandler failed: ' + e);
        }
      } else {
        logger.info('\n' + 'initHandlers: playlistLoopSwitchHandler skipped (loop config absent)');
      }

      // 7. playlistSortHandler — sort criterion <select>
      //
      if (options.playlist && options.playlist.enabled &&
          options.playlist.sort && options.playlist.sort.enabled) {
        try {
          new videoPlayer.playlistSortHandler();
          logger.debug('\n' + 'initHandlers: playlistSortHandler — OK');
        } catch (e) {
          logger.error('\n' + 'initHandlers: playlistSortHandler failed: ' + e);
        }
      } else {
        logger.info('\n' + 'initHandlers: playlistSortHandler skipped (sort disabled)');
      }

      // 8. inputWrapperHandler — URL input field, paste button, load-video button
      //
      try {
        new videoPlayer.inputWrapperHandler();
        logger.debug('\n' + 'initHandlers: inputWrapperHandler — OK');
      } catch (e) {
        logger.error('\n' + 'initHandlers: inputWrapperHandler failed: ' + e);
      }

      // 9. inputValueBackgroundHandler — visual fill-state sync on all inputs
      //
      try {
        videoPlayer.inputValueBackgroundHandler();
        logger.debug('\n' + 'initHandlers: inputValueBackgroundHandler — OK');
      } catch (e) {
        logger.error('\n' + 'initHandlers: inputValueBackgroundHandler failed: ' + e);
      }

      // 10. navbarSmoothScrollHandler — smooth-scroll for same-page nav links
      //
      if (options.smoothScroll && options.smoothScroll.enabled) {
        try {
          videoPlayer.navbarSmoothScrollHandler();
          logger.debug('\n' + 'initHandlers: navbarSmoothScrollHandler — OK');
        } catch (e) {
          logger.error('\n' + 'initHandlers: navbarSmoothScrollHandler failed: ' + e);
        }
      } else {
        logger.info('\n' + 'initHandlers: navbarSmoothScrollHandler skipped (smoothScroll disabled)');
      }

      logger.info('\n' + 'initializing playlist handlers: finished');

    }, // END initHandlers

    // -------------------------------------------------------------------------
    // messageHandler()
    // manage messages sent from other J1 modules
    // -------------------------------------------------------------------------
    messageHandler: (sender, message) => {
      var json_message = JSON.stringify(message, undefined, 2);

      logText = 'received message from ' + sender + ': ' + json_message;
      logger.debug('\n' + logText);

      // -----------------------------------------------------------------------
      // process commands|actions
      // -----------------------------------------------------------------------
      if (message.type === 'command' && message.action === 'module_initialized') {
        logger.info('\n' + message.text);
      }

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
    // returns the current (processing) state of the module
    // -------------------------------------------------------------------------
    getState: () => {
      return _this.state;
    } // END getState

  }; // END return (main)
})(j1, window);

{%- endcapture -%}

{%- if production -%}
  {{ cache|minifyJS }}
{%- else -%}
  {{ cache|strip_empty_lines }}
{%- endif -%}

{%- assign cache = false -%}