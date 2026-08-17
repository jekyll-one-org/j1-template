---
regenerate:                             true
---

{%- capture cache -%}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/adapter/js/videoPlayer.js (12)
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
 # Fix J1 VideoPlayer #1
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
{% assign videoplayer_default    = modules.defaults.videoPlayer.defaults %}
{% assign videoplayer_control     = modules.videoPlayer_control.settings %}
{% assign videoplayer_media       = modules.videoPlayer_media.settings %}
{% assign videoplayer_settings    = modules.videoPlayer_control.settings %}

{% comment %} Set config options (deep merge: defaults <- user settings)
-------------------------------------------------------------------------------- {% endcomment %}
{% assign videoplayer_options     = videoplayer_default | merge: videoplayer_control | merge: videoplayer_media %}
{% assign controls_sorted         = videoplayer_control.players | sort: 'id' %}
{% assign media_sorted            = videoplayer_media.players   | sort: 'id' %}
{% assign players                 = controls_sorted %}

{% comment %} Detect prod mode
-------------------------------------------------------------------------------- {% endcomment %}
{% assign production = false %}
{% if environment == 'prod' or environment == 'production' %}
  {% assign production = true %}
{% endif %}


/*
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/adapter/js/videoPlayer.js (11)
 # J1 Adapter for the module VideoPlayer (native HTML5/videoJS)
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2026 Juergen Adams
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

  var videoPlayerDefaults;
  var videoPlayerPlaylist;
  var videoPlayerOptions;
  var videoPlayers;

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
      var xhrLoadState      = 'pending';                                        // (initial) load state for the HTML portion of the slider
      var load_dependencies = {};
      var dependency;      

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
      videoPlayerDefaults = $.extend({}, {{videoplayer_default | replace: 'nil', 'null' | replace: '=>', ':' }});
      videoPlayers        = $.extend({}, {{videoplayer_control | replace: 'nil', 'null' | replace: '=>', ':' }});
      videoPlayerPlaylist = $.extend({}, {{videoplayer_media   | replace: 'nil', 'null' | replace: '=>', ':' }});
      videoPlayerOptions  = $.extend(true, {}, videoPlayerDefaults, videoPlayers, videoPlayerPlaylist);
      var videoPlayerSettings = $.extend(true, {}, videoPlayers, videoPlayerPlaylist);

      // Expose the merged options on the adapter object so the module can
      // read them via  j1.adapter.videoPlayer.videoPlayerOptions.
      //
      _this['videoPlayerOptions'] = videoPlayerOptions;

      // load HTML portion for all players
      _this.loadPlayerHTML(videoPlayerOptions, videoPlayers.players);

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

          // -------------------------------------------------------------------------
          // Build the merged options object from YAML config
          // -------------------------------------------------------------------------
          var adapterOptions = $.extend({}, videoPlayerDefaults, videoPlayerSettings);

          // -------------------------------------------------------------------------
          // claude - MultiInstance VideoPlayer #8
          // Forward adapter options to the module directly via the public-API setter.
          // This call is now safe at any time — before or after createInstance() —
          // because setAdapterOptions() writes straight to the module-level
          // `adapterOptions` variable and the `isDev` flag.
          //
          // The previous call was:
          //   videoPlayer.playlistManager.setAdapterOptions(adapterOptions);
          // which required a VideoPlayerInstance (and therefore a PlaylistManager)
          // to already exist, causing a race condition that produced the warning
          // "playlistManager still null after 2 s".
          // -------------------------------------------------------------------------
          // claude - MultiInstance VideoPlayer #8
          videoPlayer.setAdapterOptions(adapterOptions);

          {% comment %} split J1 Masonry data #3
          ----------------------------------------------------------------------
            Per-grid merge mirrors masonry.html exactly:
              videoplayer_default <- player <- playlist_match (by id)
            This makes the merged `grid` Liquid var expose the SAME keys
            downstream code reads (grid.id, grid.enabled, grid.lightbox.*,
            grid.lightGallery.*, grid.videojs.*, grid.options.*). Per-grid
            values still override defaults key-by-key thanks to deep_merge,
            so JS-side per-grid behaviour stays unchanged vs. the old
            single-file masonry.settings.grids iteration.
          ---------------------------------------------------------------------- {% endcomment %}
          {% for video_player in players %}
            {% assign playlist_match = media_sorted  | where: 'id', video_player.id | first %}
            {% if playlist_match %}
              {% assign player = videoplayer_default | merge: video_player | merge: playlist_match %}
            {% else %}
              {% assign player = videoplayer_default | merge: video_player %}
            {% endif %}          

            {% if player.enabled %}
              {% assign player_id = player.id %}
              logger.debug('\n' + 'found video player on id: ' + '{{player_id}}');

              // claude - MultiInstance VideoPlayer #2
              // The dependency key and the xhrDOMState lookup key are now built
              // from a JS variable (pid) that is captured at Liquid render time
              // as a string literal — NOT via Liquid interpolation inside the
              // arrow-function body.  This guarantees every instance closes
              // over its own correct id even when multiple players are on the
              // same page.
              //
              (function(pid) {
                var depKey = 'dependencies_met_html_loaded_' + pid;
                load_dependencies[depKey] = '';
                load_dependencies[depKey] = setInterval(function() {
                  xhrLoadState = j1.xhrDOMState['#' + pid + '_parent'];
                  if (xhrLoadState === 'success') {
                    // Initialize UI handlers and PLAYER events per instance
                    //
                    _this.initHandlers(videoPlayerOptions, pid);
                    _this.initPlayerUiEvents(pid);
                  }
                  clearInterval(load_dependencies[depKey]);
                }, 10); // END dependencies_met_html_loaded
              })('{{player_id}}');

            {% else %}

              logger.info('\n' + 'found player disabled on id: {{player.id}}');
              {% if videoplayer_options.hideDisabled %}
                // hide a grid if disabled
                logger.debug('\n' + 'hide video player disabled on id: {{player.id}}');
                $('#{{player.id}}').hide();
              {% endif %}
            {% endif %} // ENDIF player enabled

          {% endfor %} // ENDFOR (all) grids

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
    // loadPlayerHTML()
    // loads the HTML portion via AJAX (j1.loadHTML) for all players configured.
    // NOTE: Make sure the placeholder DIV is available in the content
    // page e.g. using the asciidoc extension masonry::
    // -------------------------------------------------------------------------
    loadPlayerHTML: (options, player) => {
      var numPlayers      = Object.keys(player).length;
      var active_players  = numPlayers;
      var xhr_data_path   = options.xhr_data_path + '/index.html';
      var xhr_container_id;

      isDev && console.debug('number of players found: ' + numPlayers);

      _this.setState('load_data');
      Object.keys(player).forEach((key) => {
        if (player[key].enabled) {
          xhr_container_id = player[key].id + '_parent';

          isDev && console.debug('load HTML portion on player id: ' + player[key].id);
          j1.loadHTML({
            xhr_container_id: xhr_container_id,
            xhr_data_path:    xhr_data_path,
            xhr_data_element: player[key].id
          });
        } else {
          isDev && console.debug('player found disabled on id: ' + player[key].id);
          active_players--;
        }
      });
      isDev && console.debug('players loaded in page enabled|all: ' + active_players + '|' + numPlayers);
      _this.setState('data_loaded');
    }, // END loadPlayerHTML


    // -------------------------------------------------------------------------
    // initPlayerUiEvents
    // -------------------------------------------------------------------------
    // claude - MultiInstance VideoPlayer #2
    // Accepts playerId so every DOM lookup uses the namespaced IDs emitted by
    // videoPlayer.html (e.g. "toggle_playlist_player_1", "edit_playlist_player_1").
    // No Liquid interpolation is used inside this function body — all IDs are
    // assembled at runtime from the playerId JS argument.
    // -------------------------------------------------------------------------
    initPlayerUiEvents: (playerId) => {

      // Modify J1 VideoPlayer #1
      // toggle playlist (video_player_container acts as a true toggle)
      //
      // Modify J1 VideoPlayer #5
      // The toggle element is now <button id="toggle_playlist_<id>">.
      // -------------------------------------------------------
      var togglePlaylistBtn  = document.getElementById("toggle_playlist_" + playerId);
      var togglePlaylistSpan = togglePlaylistBtn  ? togglePlaylistBtn.closest('.video-player-header').querySelector('span') : null;
      var togglePlaylistImg  = togglePlaylistBtn  ? togglePlaylistBtn.querySelector('img') : null;

      // Modify J1 VideoPlayer #4
      // shared helper: close the playlist and reset the toggle button label/icon.
      // Delegates to the public adapter method j1.adapter.videoPlayer.closePlaylist()
      // so that the module (e.g. doPostOnPlaying) can call it for full toggle-reset
      // without duplicating the DOM logic.
      //
      function _closePlaylist() {
        _this.closePlaylist(playerId, togglePlaylistBtn, togglePlaylistSpan, togglePlaylistImg);
      } // END _closePlaylist

      if (togglePlaylistBtn !== null) {
        // initialise toggle state
        togglePlaylistBtn.dataset.playlistOpen = "false";

        togglePlaylistBtn.addEventListener('click', function(event) {
          // claude - MultiInstance VideoPlayer #2
          // editBtn now looks up the namespaced id so each player instance
          // controls its own edit button.
          var editBtn = document.getElementById('edit_playlist_' + playerId);

          var playlistScreen = document.getElementById("playlist_screen_" + playerId);
          if (playlistScreen === null) return;

          var isOpen = (togglePlaylistBtn.dataset.playlistOpen === "true");

          if (!isOpen) {
            // ----- OPEN -----
            editBtn.setAttribute('disabled', '');
            editBtn.setAttribute('aria-disabled', 'true');
            editBtn.style.opacity = '0.4';
            editBtn.style.cursor  = 'not-allowed';
            editBtn.title         = 'Hide current playlist first';

            playlistScreen.classList.remove('slide-out-top');
            playlistScreen.classList.add('slide-in-top');
            playlistScreen.style.display = "block";
            playlistScreen.style.zIndex  = "199";

            togglePlaylistBtn.dataset.playlistOpen = "true";
            togglePlaylistBtn.title = "Hide playlist";
            togglePlaylistBtn.setAttribute('aria-label', "Hide playlist");
            if (togglePlaylistSpan !== null) { togglePlaylistSpan.textContent = "Hide Playlist"; }
            if (togglePlaylistImg  !== null) {
              togglePlaylistImg.src = "/assets/theme/j1/modules/videoPlayer/icons/player/dark/playlist-hide.svg";
              togglePlaylistImg.alt = "Hide playlist";
            }
          } else {
            // ----- CLOSE -----
            editBtn.removeAttribute('disabled');
            editBtn.setAttribute('aria-disabled', 'false');
            editBtn.style.removeProperty('opacity');
            editBtn.style.removeProperty('cursor');

            _closePlaylist();
          }

        }); // END EventListener
      } // END if togglePlaylistBtn

      // hide playlist (secondary close button inside the playlist screen)
      // -------------------------------------------------------
      // claude - MultiInstance VideoPlayer #5
      // Namespaced to hide_playlist_video_player_<playerId> so each player
      // instance wires its own secondary-close button independently.
      //
      var hidePlaylist = document.getElementById("hide_playlist_video_player_" + playerId);
      if (hidePlaylist !== null) {
        hidePlaylist.addEventListener('click', function(event) {
          // Modify J1 VideoPlayer #1
          // delegate to the shared helper so the toggle button stays in sync
          _closePlaylist();
        }); // END addEventListener
      } // END if hidePlaylist

      // Modify J1 VideoPlayer #7
      // edit playlist button — toggles #playlist_edit_screen_<id>.
      // -------------------------------------------------------
      // claude - MultiInstance VideoPlayer #2
      // Guard flag is now keyed by playerId so each instance initialises
      // its own handler exactly once even when initPlayerUiEvents is called
      // multiple times (once per renderCurrent cycle).
      //
      var editHandlerFlagKey = '_editPlaylistHandlerInitialized_' + playerId;
      if (!_this[editHandlerFlagKey]) {
        var editPlaylistBtn = document.getElementById("edit_playlist_" + playerId);
        if (editPlaylistBtn !== null) {

          // shared helper: close the edit screen and reset the button state.
          //
          function _closeEditPlaylist() {
            _this.closeEditPlaylist(playerId, editPlaylistBtn);
          } // END _closeEditPlaylist

          // initialise toggle state
          editPlaylistBtn.dataset.editOpen = "false";

          editPlaylistBtn.addEventListener('click', function(event) {
            var editScreen = document.getElementById("playlist_edit_screen_" + playerId);
            if (editScreen === null) return;

            var isOpen = (editPlaylistBtn.dataset.editOpen === "true");

            if (!isOpen) {
              // ----- OPEN -----
              togglePlaylistBtn.setAttribute('disabled', '');
              togglePlaylistBtn.setAttribute('aria-disabled', 'true');
              togglePlaylistBtn.style.opacity = '0.4';
              togglePlaylistBtn.style.cursor  = 'not-allowed';
              togglePlaylistBtn.title         = 'Hide current playlist first';

              // close the playlist panel first (mutually exclusive)
              _closePlaylist();

              editScreen.classList.remove('slide-out-top');
              editScreen.classList.add('slide-in-top');
              editScreen.style.display = "block";
              editScreen.style.zIndex  = "199";

              editPlaylistBtn.dataset.editOpen = "true";
              editPlaylistBtn.title = "Close playlist editor";
              editPlaylistBtn.setAttribute('aria-label', "Close playlist editor");
              var editImg = editPlaylistBtn.querySelector('img');
              if (editImg !== null) {
                editImg.src = "/assets/theme/j1/modules/videoPlayer/icons/player/dark/playlist-edit-close.svg";
                editImg.alt = "Close playlist editor";
              }

            } else {
              // ----- CLOSE -----
              togglePlaylistBtn.removeAttribute('disabled');
              togglePlaylistBtn.setAttribute('aria-disabled', 'false');
              togglePlaylistBtn.style.removeProperty('opacity');
              togglePlaylistBtn.style.removeProperty('cursor');

              _closeEditPlaylist();
            }

          }); // END addEventListener

          _this[editHandlerFlagKey] = true;
          logger.debug('\n' + 'initPlayerUiEvents: editPlaylistHandler[' + playerId + '] — OK');
        } else {
          logger.warn('\n' + 'initPlayerUiEvents: editPlaylistHandler[' + playerId + '] skipped — edit_playlist button not found');
        }
      } // END if !editHandlerFlagKey

    },

    // -------------------------------------------------------------------------
    // Fix J1 VideoPlayer #1
    // initHandlers()
    // Initialize all playlist and UI handler classes exported by the
    // videoPlayer module.  Called from within dependencies_met_html_loaded
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
    // claude - MultiInstance VideoPlayer #2
    // Added playerId parameter so all element-ID lookups use the correct
    // namespaced IDs.  setAdapterOptions is now called on the per-instance
    // module API (videoPlayer.getInstance(playerId).playlistManager) when
    // available, falling back to the singleton path for backward-compat.
    //
    // -------------------------------------------------------------------------
    initHandlers: (options, playerId) => {

      logger.info('\n' + 'initializing playlist handlers [' + playerId + ']: started');

      // Guard: videoPlayer module must be loaded before the adapter tries
      // to call its API.
      //
      if (typeof videoPlayer === 'undefined') {
        logger.error('\n' + 'initHandlers: videoPlayer module not found — handlers NOT initialized');
        return;
      }

      // 1. Push the merged adapter options into the module scope.
      //
      // claude - MultiInstance VideoPlayer #2
      // Prefer the per-instance API (videoPlayer.getInstance(playerId)) when
      // available so the multi-instance module can keep per-player state
      // isolated.  Falls back to the legacy singleton path so single-instance
      // deployments are unaffected.
      // setAdapterOptions is called inside a short retry loop because the
      // module's own init (VideoJS boot + playlist load) may not have
      // completed by the time the HTML-loaded poller fires.
      //
      try {
        var moduleInstance = (typeof videoPlayer.getInstance === 'function')
          ? videoPlayer.getInstance(playerId)
          : null;
        var pm = (moduleInstance && moduleInstance.playlistManager)
          ? moduleInstance.playlistManager
          : (videoPlayer.playlistManager || null);

        if (pm !== null) {
          pm.setAdapterOptions(options);
          logger.debug('\n' + 'initHandlers: setAdapterOptions [' + playerId + '] — OK');
        } else {
          // playlistManager not ready yet — retry up to 20× at 100 ms
          var retries = 0;
          var retryTimer = setInterval(function() {
            var inst = (typeof videoPlayer.getInstance === 'function')
              ? videoPlayer.getInstance(playerId)
              : null;
            var pm2 = (inst && inst.playlistManager)
              ? inst.playlistManager
              : (videoPlayer.playlistManager || null);
            if (pm2 !== null) {
              pm2.setAdapterOptions(options);
              logger.debug('\n' + 'initHandlers: setAdapterOptions [' + playerId + '] — OK (retry ' + retries + ')');
              clearInterval(retryTimer);
            } else if (++retries >= 20) {
              logger.warn('\n' + 'initHandlers: setAdapterOptions [' + playerId + '] — playlistManager still null after 2 s, skipping');
              clearInterval(retryTimer);
            }
          }, 100);
        }
      } catch (e) {
        logger.error('\n' + 'initHandlers: setAdapterOptions [' + playerId + '] failed: ' + e);
      }

      // 2. playlistIOHandler — import / export / clear / server-playlist buttons
      //
      if (options.playlist && options.playlist.enabled) {
        try {
          // claude - MultiInstance VideoPlayer #5
          // playerId passed so the handler resolves the namespaced element IDs
          // (serverPlaylistSelect_<id>, serverPlaylistLoadButton_<id>, etc.)
          // emitted by videoPlayer.html instead of the bare legacy IDs.
          new videoPlayer.playlistIOHandler(options, playerId);
          logger.debug('\n' + 'initHandlers: playlistIOHandler — OK');
        } catch (e) {
          logger.error('\n' + 'initHandlers: playlistIOHandler failed: ' + e);
        }
      } else {
        logger.info('\n' + 'initHandlers: playlistIOHandler skipped (playlist disabled)');
      }

      // Fix J1 VideoPlayer #2
      // ID corrected from 'playlistHistory' (non-existent) to
      // 'videoplayer_playlist_parent' to match the actual page element.
      //
      // Fix J1 VideoPlayer #4
      // 2a. initPlayHandler — listen for the 'playlist-play' CustomEvent bubbled
      //     from PlaylistCards._onPlayClick() and forward it to the module's
      //     play logic.
      //
      // claude - MultiInstance VideoPlayer #2
      // Element id is now namespaced: videoplayer_playlist_parent_<playerId>
      //
      if (options.playlist && options.playlist.enabled) {
        try {
          var playlistParentId = 'videoplayer_playlist_parent_' + playerId;
          var playlistHistory  = document.getElementById(playlistParentId);
          if (playlistHistory) {
            playlistHistory.addEventListener('playlist-play', (e) => {
              const videoId = e.detail && e.detail.videoId;
              if (videoId && typeof videoPlayer.loadAndPlay === 'function') {
                videoPlayer.loadAndPlay(videoId);
              }
            });
            logger.debug('\n' + 'initHandlers: initPlayHandler (event listener) — OK');
          } else {
            logger.warn('\n' + 'initHandlers: initPlayHandler skipped — #' + playlistParentId + ' not found');
          }
        } catch (e) {
          logger.error('\n' + 'initHandlers: initPlayHandler failed: ' + e);
        }
      } else {
        logger.info('\n' + 'initHandlers: initPlayHandler skipped (playlist disabled)');
      }

      // Fix J1 VideoPlayer #4
      // 2b. initDeleteHandler — listen for the 'playlist-delete' CustomEvent
      //     bubbled from PlaylistCards._onDeleteClick() and forward it to the
      //     module's delete logic.
      //
      // claude - MultiInstance VideoPlayer #2
      // Element id is now namespaced: videoplayer_playlist_parent_<playerId>
      //
      if (options.playlist && options.playlist.enabled) {
        try {
          var playlistParentId = 'videoplayer_playlist_parent_' + playerId;
          var playlistHistory  = document.getElementById(playlistParentId);
          if (playlistHistory) {
            playlistHistory.addEventListener('playlist-delete', (e) => {
              const videoId = e.detail && e.detail.videoId;
              if (videoId && typeof videoPlayer.deleteEntry === 'function') {
                videoPlayer.deleteEntry(videoId);
              }
            });
            logger.debug('\n' + 'initHandlers: initDeleteHandler (event listener) — OK');
          } else {
            logger.warn('\n' + 'initHandlers: initDeleteHandler skipped — #' + playlistParentId + ' not found');
          }
        } catch (e) {
          logger.error('\n' + 'initHandlers: initDeleteHandler failed: ' + e);
        }
      } else {
        logger.info('\n' + 'initHandlers: initDeleteHandler skipped (playlist disabled)');
      }

      // 3. playlistSearchHandler — live full-text search
      //
      if (options.playlist && options.playlist.enabled &&
          options.playlist.search && options.playlist.search.enabled) {
        try {
          // claude - MultiInstance VideoPlayer #5
          // playerId passed so the handler resolves playlistSearchInput_<id>
          // and playlistSearchClear_<id>.
          new videoPlayer.playlistSearchHandler(playerId);
          logger.debug('\n' + 'initHandlers: playlistSearchHandler — OK');
        } catch (e) {
          logger.error('\n' + 'initHandlers: playlistSearchHandler failed: ' + e);
        }
      } else {
        logger.info('\n' + 'initHandlers: playlistSearchHandler skipped (search disabled)');
      }

      // 4. playlistModeSwitchHandler — cards ↔ list display mode toggle
      //
      if (options.playlist && options.playlist.enabled &&
          options.playlist.modeSwitch && options.playlist.modeSwitch.enabled) {
        try {
          // claude - MultiInstance VideoPlayer #5
          // playerId passed so the handler resolves its namespaced toggle element.
          new videoPlayer.playlistModeSwitchHandler(options, playerId);
          logger.debug('\n' + 'initHandlers: playlistModeSwitchHandler — OK');
        } catch (e) {
          logger.error('\n' + 'initHandlers: playlistModeSwitchHandler failed: ' + e);
        }
      } else {
        logger.info('\n' + 'initHandlers: playlistModeSwitchHandler skipped (playlist disabled)');
      }

      // 5. playlistMergeSwitchHandler — merge-mode toggle
      //
      if (options.playlist && options.playlist.enabled &&
          options.playlist.mergeSwitch && options.playlist.mergeSwitch.enabled) {
        try {
          // claude - MultiInstance VideoPlayer #5
          // playerId passed so the handler resolves its namespaced element.
          new videoPlayer.playlistMergeSwitchHandler(options, playerId);
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
          // claude - MultiInstance VideoPlayer #5
          // playerId passed so the handler resolves its namespaced element.
          new videoPlayer.playlistLoopSwitchHandler(options, playerId);
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
          // claude - MultiInstance VideoPlayer #5
          // playerId passed so the handler resolves its namespaced <select>.
          new videoPlayer.playlistSortHandler(playerId);
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
        // claude - MultiInstance VideoPlayer #5
        // playerId passed so the handler resolves videoUrlInput_<id>,
        // pasteButton_<id>, playlistInputClear_<id>, and
        // serverPlaylistLoadButton_<id> (which calls loadPlaylistIndex).
        new videoPlayer.inputWrapperHandler(playerId);
        logger.debug('\n' + 'initHandlers: inputWrapperHandler — OK');
      } catch (e) {
        logger.error('\n' + 'initHandlers: inputWrapperHandler failed: ' + e);
      }

      // 9. inputValueBackgroundHandler — visual fill-state sync on all inputs
      //
      try {
        // claude - MultiInstance VideoPlayer #5
        // playerId passed so only this player's inputs are scoped.
        videoPlayer.inputValueBackgroundHandler(playerId);
        logger.debug('\n' + 'initHandlers: inputValueBackgroundHandler — OK');
      } catch (e) {
        logger.error('\n' + 'initHandlers: inputValueBackgroundHandler failed: ' + e);
      }

      // 10. navbarSmoothScrollHandler — smooth-scroll for same-page nav links
      //
      if (options.smoothScroll && options.smoothScroll.enabled) {
        try {
          // claude - MultiInstance VideoPlayer #5
          // playerId passed for consistency with the per-instance handler pattern.
          videoPlayer.navbarSmoothScrollHandler(playerId);
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
    // Modify J1 VideoPlayer #4
    // closePlaylist()
    // Public adapter method that closes the playlist panel and fully resets the
    // toggle button (label + icon + data-state) to its "Show Playlist" state.
    //
    // claude - MultiInstance VideoPlayer #2
    // Added playerId as the first parameter so DOM lookups resolve the correct
    // namespaced elements.  All call-sites supply playerId; the method also
    // falls back to fresh DOM lookups when btn/span/img are omitted (external
    // calls from the module).
    // -------------------------------------------------------------------------
    closePlaylist: (playerId, toggleBtn, toggleSpan, toggleImg) => {
      var playlistScreen = document.getElementById("playlist_screen_" + playerId);
      if (playlistScreen === null) return;

      playlistScreen.classList.remove('slide-in-top');
      playlistScreen.classList.add('slide-out-top');
      playlistScreen.style.display = "none";
      playlistScreen.style.zIndex  = "1";

      // Resolve button references — use the caller-supplied ones (fast path inside
      // initPlayerUiEvents) or fall back to fresh DOM lookups (call from module).
      var btn  = toggleBtn  || document.getElementById("toggle_playlist_" + playerId);
      var span = toggleSpan || (btn ? btn.querySelector('span') : null);
      var img  = toggleImg  || (btn ? btn.querySelector('img')  : null);

      // Reset toggle button to "Show Playlist" state
      if (btn !== null) {
        btn.dataset.playlistOpen = "false";
        btn.title = "Show playlist";
        btn.setAttribute('aria-label', "Show playlist");
        if (span !== null) { span.textContent = "Show Playlist"; }
        if (img  !== null) {
          img.src = "/assets/theme/j1/modules/videoPlayer/icons/player/dark/playlist-show.svg";
          img.alt = "Show playlist";
        }
      }

      // Re-enable body scrolling
      if ($('body').hasClass('stop-scrolling')) {
        $('body').removeClass('stop-scrolling');
      }

      // claude - Modify J1 VideoPlayer #12
      // Re-enable the edit_playlist button now that the playlist panel is closed.
      // claude - MultiInstance VideoPlayer #2
      // Lookup uses namespaced ID edit_playlist_<playerId>.
      //
      var editBtn = document.getElementById("edit_playlist_" + playerId);
      if (editBtn !== null) {
        editBtn.disabled = false;
        editBtn.classList.remove('disabled');
        editBtn.setAttribute('aria-disabled', 'false');
        editBtn.title = "Manage playlist";
        editBtn.setAttribute('aria-label', "Manage playlist");
      }
    }, // END closePlaylist

    // -------------------------------------------------------------------------
    // Modify J1 VideoPlayer #7
    // closeEditPlaylist()
    // Public adapter method that closes the playlist-edit panel and fully
    // resets the edit_playlist button (icon + data-state + accessibility
    // attributes) to its "Manage playlist" state.
    //
    // claude - MultiInstance VideoPlayer #2
    // Added playerId as the first parameter so DOM lookups use the namespaced
    // IDs.  All internal call-sites supply playerId; external callers (module)
    // pass playerId and may omit btn for a fresh DOM lookup.
    // -------------------------------------------------------------------------
    closeEditPlaylist: (playerId, btn) => {
      var editScreen = document.getElementById("playlist_edit_screen_" + playerId);
      if (editScreen === null) return;

      editScreen.style.display = "none";
      editScreen.style.zIndex  = "1";
      editScreen.classList.remove('slide-in-top');
      editScreen.classList.add('slide-out-top');

      // Resolve button reference — use caller-supplied one (fast path inside
      // initPlayerUiEvents) or fall back to a fresh DOM lookup.
      var editBtn = btn || document.getElementById("edit_playlist_" + playerId);
      if (editBtn !== null) {
        editBtn.disabled          = false;
        editBtn.title             = "Manage playlist";
        editBtn.style.cursor      = 'pointer';
        editBtn.dataset.editOpen  = "false";

        editBtn.classList.remove('disabled');
        editBtn.setAttribute('aria-disabled', 'false');
        editBtn.setAttribute('aria-label', "Manage playlist");
        editBtn.style.removeProperty('opacity');

        var editImg = editBtn.querySelector('img');
        if (editImg !== null) {
          editImg.src = "/assets/theme/j1/modules/videoPlayer/icons/player/dark/playlist-edit.svg";
          editImg.alt = "Manage playlist";
        }
      }
    }, // END closeEditPlaylist

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