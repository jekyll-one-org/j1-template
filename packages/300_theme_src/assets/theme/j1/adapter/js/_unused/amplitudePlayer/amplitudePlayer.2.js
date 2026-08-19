---
regenerate:                             true
---

{%- capture cache -%}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/adapter/js/amplitudePlayer.js (2)
 # J1 Adapter for the module Amplitude player
 #
 # Product/Info:
 # https://jekyll.one
 # Copyright (C) 2023-2026 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # For details, see: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 # -----------------------------------------------------------------------------
 # Test data:
 #  {{ liquid_var | debug }}
 #  amplitude_player_options:  {{ amplitude_player_options | debug }}
 # -----------------------------------------------------------------------------
{% endcomment %}

{% comment %}
 # -----------------------------------------------------------------------------
 # PER-PLAYER CONFIG INHERITANCE CHAIN (adapter)
 #
 #   player settings -> overload user settings -> overload default settings
 #
 # Effective settings for ONE player instance are now built as a DEEP merge
 # of the three YAML layers (later layers overwrite earlier layers per key,
 # missing keys fall through):
 #
 #   1. _data/modules/defaults/amplitude.yml  (defaults ...........)  base
 #   2. _data/modules/amplitudePlayer_control.yml   (settings, w/o players)  user
 #                                            optional GLOBAL sections
 #                                            settings.player|settings.playlist
 #   3. _data/modules/amplitudePlayer_control.yml   (settings.players[] ..)  player
 #
 # Before this fix, the adapter read ALL runtime settings from the DEFAULTS
 # layer only (amplitude_player_default.player.*) per-player keys were read
 # RAW (player.*) without any fallthrough to the user or default layer,
 # and the global options were built with the SHALLOW merge filter (any key
 # set on a higher layer dropped ALL sibling default keys of its subtree).
 # In addition, the (renamed) config variable amplitude_player was still
 # referenced but NO LONGER ASSIGNED (leftover of the v44 file naming), so
 # j1.modules.amplitudejs.players was always empty.
 #
 # Changes:
 #
 #   • Liquid: amplitude_player_options — global chain built with deep_merge
 #     (defaults <- control/user). amplitude_player_media is NOT merged (its only
 #     payload is the playlists array, read separately where needed).
 #   • Liquid: amplitude_player_global|amplitude_playlist_global — global
 #     effective subtrees (defaults.player <- control.player, resp.
 #     defaults.playlist <- control.playlist); the page-global runtime vars
 #     (playerRepeat, playerScrollerSongElementMin, ...) are re-assigned
 #     from these chains (former defaults-only block kept, superseded).
 #   • Liquid: player loops iterate amplitudePlayer_control.players (RAW control
 #     entries); the initPlayerUiEvents loop builds the per-player
 #     player_effective chain and reads type, plugin_manager and
 #     player_scroller_song_element_min from it.
 #   • JS: _deepMerge(target, ...sources) — deep merge helper (plain
 #     objects merged recursively, ARRAYS REPLACE as a whole, scalars
 #     overload; same semantics as J1 VideoPlayer adapter fix #48).
 #   • JS: getInstanceOptions(playerId) — public method returning the
 #     cached EFFECTIVE options object for one player instance (defaults
 #     <- user settings <- player entry, entry keys applied at PLAYER
 #     scope). Exposed as j1.adapter.amplitudePlayer.amplitudeInstanceOptions and
 #     j1.modules.amplitudejs.instanceOptions for module|plugin (ytp) use.
 #   • JS: init() — amplitudePlayers now reads the CONTROL settings
 #     (formerly the unassigned amplitude_player); the global merged
 #     options (defaults <- user) are exposed as
 #     j1.adapter.amplitudePlayer.amplitudeOptions and
 #     j1.modules.amplitudejs.options.
 #   • JS: pluginManagerEnabled — resolved from the per-player effective
 #     chain. The former expression fell back to the DEFAULT when a player
 #     set plugin_manager.enabled to FALSE (string 'false' is neither
 #     empty nor 'true'), so per-player false could not overload.
 #
 # -----------------------------------------------------------------------------
 {% endcomment %}

{% comment %}
 # -----------------------------------------------------------------------------
 # INIT-TIME CRASH OF FIX #1 (module self-reference _this not yet bound)
 #
 # With fix #1 installed, the adapter failed on EVERY page load (single or
 # multiple players) by:
 #
 #   Uncaught TypeError: Cannot read properties of undefined (reading
 #   '_deepMerge') at Object.init (amplitude.js:216:32)
 #
 # ROOT CAUSE (ordering, NOT a multi-instance issue):
 #
 #   The module keeps its own object reference in the module-scoped var
 #   '_this' (declared, but NOT initialized, at the top of the module).
 #   The reference is bound INSIDE init() in the section
 #
 #     // control|logging settings
 #     _this  = j1.adapter.amplitudePlayer;
 #
 #   which is located WELL BELOW the global options block. Fix #1 inserted
 #   the new global merge chain
 #
 #     amplitudeOptions = _this._deepMerge({}, amplitudeDefaults, ...);
 #
 #   ABOVE that binding: at that point _this is still 'undefined' on a
 #   fresh page load, so the property read '_deepMerge' throws. Rendered by
 #   Liquid (front matter, Liquid comments and empty lines stripped) this
 #   statement IS line 216, and column 32 IS the position of the property
 #   name '_deepMerge' — the trace points exactly at that statement.
 #
 #   The pattern was ported from the J1 VideoPlayer adapter (fix #48/#49),
 #   where the very same merge chain works because there '_this' is bound
 #   BEFORE the merge block (videoPlayer.js: _this at line 390, _deepMerge
 #   call at line 410). In the AmplitudeJS adapter the binding site is at
 #   the OPPOSITE side of the block, so the order was inverted.
 #
 #   NOTE: init() is defined as an ARROW function ('init: (options) => {}'),
 #   so 'this' is NOT bound to the module object and cannot be used as a
 #   substitute. The module object is available as j1.adapter.amplitudePlayer:
 #   the module IIFE has returned long before init() is called from the
 #   page (document ready handler), so the reference is always valid at
 #   init() runtime.
 #
 # Changes:
 #
 #   • JS: init() — _this is bound to j1.adapter.amplitudePlayer as the FIRST
 #     statement of init(), i.e. before ANY use of the module reference.
 #     The original (late) binding in the 'control|logging settings'
 #     section is KEPT unchanged (now a harmless re-assignment) so the
 #     former code path stays intact.
 #   • JS: _self() — new module-scope helper resolving the module object
 #     independent of the init() state: (_this || j1.adapter.amplitudePlayer).
 #     Used at the _deepMerge()|getInstanceOptions() call sites so that a
 #     call from the module or a plugin (ytp) can NEVER fail again by an
 #     unbound _this, even if called before|without init().
 #   • JS: getInstanceOptions() — the logger calls are guarded (logger is
 #     assigned in init() as well and is 'undefined' on early calls; the
 #     error handlers would have thrown a follow-up TypeError).
 #
 # -----------------------------------------------------------------------------
 {% endcomment %}

{% comment %} Modify Amplitude comfig
 # -----------------------------------------------------------------------------
 # SIMPLIFIED YOUTUBE MEDIA REFERENCE (bare video ID)
 #
 # The media config (_data/modules/amplitude_player_media.yml) referenced a YouTube
 # title by a PARTIAL URL:
 #
 #   audio_base:   //youtube.com
 #   audio:        watch?v=HPWmY4am2oQ       (LEGACY format)
 #
 # The song URL is assembled as audio_base + '/' + audio, so the item above
 # became '//youtube.com/watch?v=HPWmY4am2oQ'. Repeating the constant URL
 # part 'watch?v=' for EVERY title is noise: what identifies a title is the
 # 11-character video ID alone. The media config now supports
 #
 #   audio:        HPWmY4am2oQ               (NEW format)
 #
 # BOTH formats are supported. The song URL is no longer assembled by a
 # plain string concatenation but by amplitudeMediaURL(), which
 #
 #   - expands a BARE 11-character video ID [A-Za-z0-9_-] to a well formed
 #     watch URL '<audio_base>/watch?v=<ID>' when the audio base names a
 #     YouTube host (youtube.com, youtube-nocookie.com, youtu.be) or is
 #     empty. Downstream consumers (the ytp plugin, AmplitudeJS itself)
 #     therefore see EXACTLY the same URL as before the change,
 #   - passes an ABSOLUTE reference ('https://...', '//...') through
 #     unchanged instead of prefixing it with the audio base a second time,
 #   - and leaves every other reference (local MP3 files, the LEGACY
 #     'watch?v=<ID>' form) at the previous concatenation, byte for byte.
 #
 # NOTE: on the video ID extraction (ytp plugin): a BARE ID must never be
 # derived with the naive expression songURL.split('=')[1] again. That
 # expression returns 'eotOxW5QU8Y&list' for any URL carrying additional
 # query parameters, 'undefined' for youtu.be/... and /embed/... links and
 # silently accepts MALFORMED IDs. It worked so far only because the media
 # config happened to use bare 'watch?v=' URLs. The robust extraction is
 # ytpVideoIdFromURL() in ytp.js (introduced by the Amplitude plugin fix
 # no. 5), extended by this fix for the bare-ID URL forms.
 #
 # Changes:
 #
 #   - JS: amplitudeMediaURL(audioBase, audioRef) - new helper building the
 #     song URL from a media config entry (see rules above).
 #   - JS: songLoader() - the 'audio' key mapping uses the helper.
 #   - Liquid: initApi() - the "url" property of a song item is built by the
 #     SAME rules (Liquid has no regular expressions, hence the
 #     size|contains checks) and emitted as {{song_url}}.
 #
 # -----------------------------------------------------------------------------
 {% endcomment %}

{% comment %} Liquid procedures
-------------------------------------------------------------------------------- {% endcomment %}

{% comment %} Set global settings
-------------------------------------------------------------------------------- {% endcomment %}
{% assign environment               = site.environment %}
{% assign asset_path                = "/assets/theme/j1" %}

{% comment %} Process YML config data
================================================================================ {% endcomment %}

{% comment %} Set config files
-------------------------------------------------------------------------------- {% endcomment %}
{% assign template_config           = site.data.j1_config %}
{% assign blocks                    = site.data.blocks %}
{% assign modules                   = site.data.modules %}

{% comment %} Set config data
-------------------------------------------------------------------------------- {% endcomment %}
{% assign amplitude_player_default  = modules.defaults.amplitudePlayer.defaults %}
{% assign amplitude_player_control  = modules.amplitudePlayer_control.settings %}
{% assign amplitude_player_media    = modules.amplitudePlayer_media.settings %}

{% comment %} Set config options
-------------------------------------------------------------------------------- {% endcomment %}

{% comment %}
--------------------------------------------------------------------------------
 Global options: DEEP merge of the chain defaults <- control (user settings).
 The media file is NO LONGER merged in: its only payload is the playlists
 array, read separately from amplitude_player_media.playlists. The former
 SHALLOW merge filter replaced the top-level 'player' and 'playlist' subtrees
 as a whole, so ANY key set on a higher layer silently dropped ALL sibling
 default keys of that subtree.
-------------------------------------------------------------------------------- {% endcomment %}
{% assign amplitude_player_options = amplitude_player_default | merge: amplitude_player_control %}

{% comment %}
--------------------------------------------------------------------------------
 Global EFFECTIVE subtrees (chain: defaults <- user settings). Source for
 the page-global runtime variables of the adapter. The user layer is the
 optional GLOBAL 'player' | 'playlist' section of amplitude_player_control.yml
 (applies to ALL players of a page); per-player overloads are resolved at
 the loop sites (player_effective) and by getInstanceOptions().
-------------------------------------------------------------------------------- {% endcomment %}
{% assign amplitude_player_global     = amplitude_player_default.player %}
{% if amplitude_player_control.player %}
  {% assign amplitude_player_global   = amplitude_player_global | merge: amplitude_player_control.player %}
{% endif %}

{% assign amplitude_playlist_global   = amplitude_player_default.playlist %}
{% if amplitude_player_control.playlist %}
  {% assign amplitude_playlist_global = amplitude_playlist_global | merge: amplitude_player_control.playlist %}
{% endif %}

{% comment %} Detect prod mode
-------------------------------------------------------------------------------- {% endcomment %}
{% assign production = false %}
{% if environment == 'prod' or environment == 'production' %}
  {% assign production = true %}
{% endif %}


/*
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/adapter/js/amplitudePlayer.js (2)
 # J1 Adapter for the module amplitudePlayer
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2023-2026 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # For details, see: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 #
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

// Claude - J1 amplitudePlayer optimizations #1
// =============================================================================
// ADAPTER / MODULE SPLIT
//
// The adapter has been reduced to the BUILD-TIME concerns only. Everything
// that is plain RUNTIME JavaScript now lives in the module API file
//
//   ~/assets/theme/j1/modules/amplitudePlayer/js/player.js
//
// which exports the factory  audioPlayer(playerId, config)  — the exact
// counterpart of  videoPlayer(playerId, options)  exported by the module
// multiPlayer (~/assets/theme/j1/modules/multiPlayer/js/player.js).
//
// What STAYED in this adapter (all of it needs Liquid|YAML at build time):
//
//   * the config inheritance chain defaults <- user settings <- player
//   * songLoader()         the liquid "for playlist" loop over the media file
//   * playerHtmlLoader()   the per-player XHR loading of the HTML portion
//   * initApi()            the liquid "for playlist" loop that emits 'playlists'
//   * initPlayerUiEvents() the liquid "for player" loop that emits ONE config
//                          hash per player
//   * the J1 module lifecycle: init, messageHandler, setState, getState
//
// What MOVED to the module (no Liquid at all):
//
//   * amplitudeMediaURL, timestamp2seconds, seconds2timestamp, deepMerge
//   * getInstanceOptions
//   * the complete Amplitude.init() call incl. ALL callbacks
//   * the complete AT player state machine (onPlayerStateChange & friends)
//   * atpFadeInAudio / atpFadeAudioOut / atpProcessAudioStart|EndPosition
//   * atPlayerScrollToActiveElement, atpUpdatMetaContainers,
//     atpStopParallelActivePlayers, setSongActive, setAudioInfo, songEvents
//   * isPluginLoaded, pluginManager, publishPluginOptions
//   * the complete mini|compact|large UI event wiring
//
// The PUBLIC ADAPTER API is UNCHANGED: every method that was callable as
// j1.adapter.amplitudePlayer.<name>() is still callable and delegates to the
// module. This keeps the contract with the ytp plugin intact — ytp.js calls
// j1.adapter.<host>.timestamp2seconds() / .seconds2timestamp() and reads
// j1.adapter.<host>.data.
//
// SIZE EFFECT: the biggest win is NOT the source line count of this file but
// the RENDERED output. The former per-player Liquid loop emitted a complete
// copy of the mini|compact|large wiring for EVERY player of a page; the loop
// now emits one small config hash per player.
// =============================================================================
//
j1.adapter.amplitudePlayer = ((j1, window) => {

  const isDev = '{{environment}}' === "development" || '{{environment}}' === "dev";

  // Adapter GLOBAL settings
  //
  var environment   = '{{environment}}';
  var cookie_names  = j1.getCookieNames();
  var user_state    = j1.readCookie(cookie_names.user_state);
  var state         = 'not_started';

  // control|logging
  //
  var consoleFilterSettings = {};
  var _this;
  var logger;
  var logText;
  var toJSON;
  var toText;

  // date|time monitoring
  //
  var startTime;
  var endTime;
  var startTimeModule;
  var endTimeModule;
  var timeSeconds;

  // Claude - J1 amplitudePlayer optimizations #1
  // ---------------------------------------------------------------------------
  // The AmplitudeJS GLOBAL constants moved to the module:
  //
  //   requiredForATP, AUDIO_ERROR, AUDIO_ERROR_NAMES,
  //   AT_PLAYER_STATE, AT_PLAYER_STATE_NAMES
  //
  // and are re-exported by the module surface if adapter-side code ever needs
  // them again (audioPlayer.AT_PLAYER_STATE etc.). Note that the adapter also
  // USED an identifier YT_PLAYER_STATE_NAMES that was never declared here —
  // the module owns that map now (see the note in player.js).
  //
  // The regular expressions of amplitudeMediaURL() moved along with the
  // function itself.
  // ---------------------------------------------------------------------------

  var techSrc                           = '/assets/theme/j1/modules/amplitudeJS';

  var playersUILoaded                   = { state: false };
  var playerCounter                     = 0;
  var load_dependencies                 = {};
  var playersProcessed                  = [];
  var amplitudeInstanceOptions          = {};
  var processingPlayersFinished         = false;

  var amplitudeOptions;
  var amplitudeDefaults;
  var amplitudePlayers;

  var xhrLoadState;
  var dependency;
  var playerExistsInPage;

  // Claude - J1 amplitudePlayer optimizations #1
  // the module factory instance of the shared engine (see player.js). The
  // adapter keeps ONE reference; per-player instances are created in
  // initPlayerUiEvents() through audioPlayer(playerId, cfg).
  var ap;

  // AmplitudeJS DEFAULT settings
  // ---------------------------------------------------------------------------

  // PLAYER settings
  //
  var playerDefaultPluginManager        = {{amplitude_player_default.player.plugin_manager.enabled}};
  var playerDefaultType                 = '{{amplitude_player_default.player.type}}';
  var playerDefaultVolume               = {{amplitude_player_default.player.volume_slider.preset_value}};
  var playerRepeat                      = {{amplitude_player_default.player.player_repeat}};
  var playerShuffle                     = {{amplitude_player_default.player.player_shuffle}};
  var playerPlayNextTitle               = {{amplitude_player_default.player.play_next_title}};
  var playerPauseNextTitle              = {{amplitude_player_default.player.pause_next_title}};
  var playerDelayNextTitle              = {{amplitude_player_default.player.delay_next_title}};
  var playerForwardBackwardSkipSeconds  = {{amplitude_player_default.player.forward_backward_skip_seconds}};
  var playerHoverPageScrollDisabled     = {{amplitude_player_default.player.player_hover_page_scroll_disabled}};

  var playerSongElementHeigthMobile     = {{amplitude_player_default.player.player_song_element_heigth_mobile}};
  var playerSongElementHeigthDesktop    = {{amplitude_player_default.player.player_song_element_heigt_desktop}};
  var playerScrollerSongElementMin      = {{amplitude_player_default.player.player_scroller_song_element_min}};
  var playerScrollControl               = {{amplitude_player_default.player.player_scroll_control}};
  var playerAutoScrollSongElement       = {{amplitude_player_default.player.player_auto_scroll_song_element}};

  // PLAYLIST settings
  //
  var playlistAudioInfo                 = {{amplitude_player_default.playlist.audio_info}};

  // CONTROL settings
  //
  var dependencies_met_page_ready;

  // Re-assign the page-global runtime settings from the global EFFECTIVE
  // chain (defaults <- user settings). The defaults-only block above is
  // kept unchanged (preserved) and is superseded here; per-player values
  // are resolved at the loop sites (player_effective) and by
  // getInstanceOptions().
  //
  playerDefaultPluginManager            = {{amplitude_player_global.plugin_manager.enabled}};
  playerDefaultType                     = '{{amplitude_player_global.type}}';
  playerDefaultVolume                   = {{amplitude_player_global.volume_slider.preset_value}};
  playerRepeat                          = {{amplitude_player_global.player_repeat}};
  playerShuffle                         = {{amplitude_player_global.player_shuffle}};
  playerPlayNextTitle                   = {{amplitude_player_global.play_next_title}};
  playerPauseNextTitle                  = {{amplitude_player_global.pause_next_title}};
  playerDelayNextTitle                  = {{amplitude_player_global.delay_next_title}};
  playerForwardBackwardSkipSeconds      = {{amplitude_player_global.forward_backward_skip_seconds}};
  playerHoverPageScrollDisabled         = {{amplitude_player_global.player_hover_page_scroll_disabled}};

  playerSongElementHeigthMobile         = {{amplitude_player_global.player_song_element_heigth_mobile}};
  playerSongElementHeigthDesktop        = {{amplitude_player_global.player_song_element_heigt_desktop}};
  playerScrollerSongElementMin          = {{amplitude_player_global.player_scroller_song_element_min}};
  playerScrollControl                   = {{amplitude_player_global.player_scroll_control}};
  playerAutoScrollSongElement           = {{amplitude_player_global.player_auto_scroll_song_element}};

  playlistAudioInfo                     = {{amplitude_playlist_global.audio_info}};

  // ---------------------------------------------------------------------------
  // helper functions
  // ---------------------------------------------------------------------------
  function forceJsError() {
    throw new Error("GENERATED JavaScript error!");
  }

  // Resolves the module object independent of the init() state. The module
  // keeps its self-reference in the module-scoped var _this that is bound
  // INSIDE init() only. Any method called before|outside init() (e.g. by a
  // plugin like ytp) would fail on _this being 'undefined'. Because init()
  // and all module methods are ARROW functions, 'this' is NOT bound to the
  // module object and cannot be used here. j1.adapter.amplitudePlayer is assigned
  // when the module IIFE returned, so the fallback is valid at ANY runtime
  // call (it is evaluated lazily, NOT at module load time).
  //
  var _self = () => (_this || j1.adapter.amplitudePlayer);

  // Claude - J1 amplitudePlayer optimizations #1
  // ---------------------------------------------------------------------------
  // _core()
  //
  // Resolves the SHARED ENGINE surface of the module API (player.js). Mirrors
  // the guarded factory access of the multiPlayer adapter
  // (typeof videoPlayer === 'undefined' check before the factory call).
  //
  // Returns null and logs ONCE when the module file was not loaded, so a
  // missing module never turns into a cascade of TypeErrors.
  // ---------------------------------------------------------------------------
  var _coreMissingLogged = false;

  var _core = () => {
    if (typeof audioPlayer === 'undefined') {
      if (!_coreMissingLogged) {
        _coreMissingLogged = true;
        logger && logger.error('\n' +
          'module API not available: ~/assets/theme/j1/modules/amplitudePlayer/js/player.js ' +
          'must be loaded BEFORE the adapter');
      }
      return null;
    }
    return audioPlayer;
  };

  // Claude - J1 amplitudePlayer optimizations #1
  // ---------------------------------------------------------------------------
  // _delegate(name, args, fallback)
  //
  // One guarded call path for every adapter facade below. Keeps the public
  // adapter API alive (contract with the ytp plugin and with page code)
  // without repeating the availability check 15 times.
  // ---------------------------------------------------------------------------
  var _delegate = (name, args, fallback) => {
    var core = _core();

    if (core === null || typeof core[name] !== 'function') {
      return fallback;
    }
    return core[name].apply(null, args);
  };

  // ---------------------------------------------------------------------------
  // main
  // ---------------------------------------------------------------------------
  return {

    // -------------------------------------------------------------------------
    // adapter initializer
    // -------------------------------------------------------------------------
    init: (options) => {

      // -----------------------------------------------------------------------
      // Bind the module self-reference (EARLY)
      // -----------------------------------------------------------------------
      // The module reference _this MUST be bound before ANY use of it. The
      // global options chain of fix #1 (see 'global variable settings' below)
      // calls _this._deepMerge() while the ORIGINAL binding of _this is done
      // FAR BELOW (section 'control|logging settings'), leaving _this
      // 'undefined' at that point on a fresh page load:
      //
      //   TypeError: Cannot read properties of undefined (reading '_deepMerge')
      //
      // NOTE: init() is an ARROW function, 'this' is NOT bound to the module
      // object. j1.adapter.amplitudePlayer is assigned when the module IIFE returned
      // and is therefore always valid at init() runtime.
      //
      _this = j1.adapter.amplitudePlayer;

      // -----------------------------------------------------------------------
      // set console/error log filters (early)
      // -----------------------------------------------------------------------
      //
      j1.api.consoleFilters.filter();
      // j1.api.errorFilters.filter();

      // control|logging settings
      //
      // Claude - J1 amplitudePlayer optimizations #1
      // the logger was created FAR BELOW the first isDev && logger.* call
      // site of the option chain. Moved to the top of init() so every log
      // statement of the initializer has a bound logger.
      logger = log4javascript.getLogger('j1.adapter.amplitudePlayer');

      // -----------------------------------------------------------------------
      // default module settings
      // -----------------------------------------------------------------------
      var settings = $.extend({
        module_name:  'j1.adapter.amplitudePlayer',
        generated:    '{{site.time}}'
      }, options);

      // global variable settings
      //
      amplitudeDefaults = $.extend({}, {{amplitude_player_default  | replace: 'nil', 'null' | replace: '=>', ':' }});
      amplitudePlayers  = $.extend({}, {{amplitude_player_control  | replace: 'nil', 'null' | replace: '=>', ':' }});

      // Claude - J1 amplitudePlayer optimizations #1
      // -----------------------------------------------------------------------
      // Hand the complete BUILD-TIME config over to the module API ONCE.
      // This is the single adapter -> module handoff point and the direct
      // counterpart of
      //
      //   vp.playlistManager.setAdapterOptions(options)
      //
      // in the multiPlayer adapter. Everything the module needs that used to
      // be a Liquid literal inside a module method is passed here.
      // -----------------------------------------------------------------------
      var _apCore = _core();

      if (_apCore !== null) {
        _apCore.setAdapterOptions({
          isDev:            isDev,
          environment:      environment,
          techSrc:          techSrc,
          adapterNamespace: 'amplitudePlayer',
          moduleNamespace:  'amplitudejs',
          defaults:         amplitudeDefaults,
          players:          amplitudePlayers,
          media:            $.extend({}, {{amplitude_player_media | replace: 'nil', 'null' | replace: '=>', ':' }}),
          player:           $.extend({}, {{amplitude_player_global   | replace: 'nil', 'null' | replace: '=>', ':' }}),
          playlist:         $.extend({}, {{amplitude_playlist_global | replace: 'nil', 'null' | replace: '=>', ':' }})
        });
      }

      // Build the GLOBAL (module-level) options with the deepMerge helper
      // (chain: defaults <- user settings). The user layer are the GLOBAL
      // keys of amplitudePlayer_control.yml (settings w/o the per-player array
      // 'players'). Reset + expose the PER-INSTANCE options cache so the
      // module and plugins (ytp) can read the effective per-player chain
      // via j1.adapter.amplitudePlayer.amplitudeInstanceOptions[playerId] resp.
      // j1.adapter.amplitudePlayer.getInstanceOptions(playerId).
      //
      var amplitudeUserSettings = {};
      Object.keys(amplitudePlayers || {}).forEach(function (key) {
        if (key !== 'players') { amplitudeUserSettings[key] = amplitudePlayers[key]; }
      });

      // Claude - J1 amplitudePlayer optimizations #1
      // Original (deprecated, preserved for reference):
      // amplitudeOptions = _this.deepMerge({}, amplitudeDefaults, amplitudeUserSettings);
      amplitudeOptions = _this.deepMerge({}, amplitudeDefaults, amplitudeUserSettings);
      amplitudeInstanceOptions = {};
      _self()['amplitudeOptions']         = amplitudeOptions;
      _self()['amplitudeInstanceOptions'] = amplitudeInstanceOptions;

      // set AmplitudeJS data for later use (e.g events)
      //
      j1.modules.amplitudejs                                = {};
      j1.modules.amplitudejs.songIndex                      = false;
      j1.modules.amplitudejs.defaults                       = amplitudeDefaults;
      j1.modules.amplitudejs.players                        = amplitudePlayers || {};
      j1.modules.amplitudejs.options                        = amplitudeOptions;
      j1.modules.amplitudejs.instanceOptions                = amplitudeInstanceOptions;
      j1.modules.amplitudejs.data                           = {};
      j1.modules.amplitudejs.data.activePlayer              = 'not_set';
      j1.modules.amplitudejs.data.playerSongElementHeigth   = playerSongElementHeigthDesktop;
      j1.modules.amplitudejs.data.atp                       = {};
      j1.modules.amplitudejs.data.ytp                       = {};

      // set INITIAL AmplitudeJS data
      //
      j1.modules.amplitudejs.data.atp.activeIndex           = false;
      j1.modules.amplitudejs.data.atp.apiError              = false;
      j1.modules.amplitudejs.data.atp.apiReady              = false ;
      j1.modules.amplitudejs.data.atp.playlist              = false;
      j1.modules.amplitudejs.data.atp.players               = {};
      j1.modules.amplitudejs.data.ytp.apiError              = false;
      j1.modules.amplitudejs.data.ytp.apiReady              = false;
      j1.modules.amplitudejs.data.ytp.players               = {};
      j1.modules.amplitudejs.data.ytp.plugin                = false;

      // save amplitudePlayer data for later use (e.g. events)
      //
      j1.adapter.amplitudePlayer.data                       = {};
      j1.adapter.amplitudePlayer.data.atpGlobals            = {};
      j1.adapter.amplitudePlayer.data.ytpGlobals            = {};
      j1.adapter.amplitudePlayer.data.ytPlayers             = {};

      // initial amplitudePlayer data
      //
      j1.adapter.amplitudePlayer.data.playerSongElementHeigth     = playerSongElementHeigthDesktop;
      j1.adapter.amplitudePlayer.data.activePlayer                = 'not_set';
      j1.adapter.amplitudePlayer.data.atpGlobals.activePlayerType = 'not_set';
      j1.adapter.amplitudePlayer.data.atpGlobals.ytpInstalled     = false;
      j1.adapter.amplitudePlayer.data.ytpGlobals.activePlayerType = 'not_set';

      // -----------------------------------------------------------------------
      // module initializer
      // -----------------------------------------------------------------------
      dependencies_met_page_ready = setInterval (() => {
        var pageState      = $('#content').css("display");
        var pageVisible    = (pageState === 'block') ? true : false;
        var j1CoreFinished = (j1.getState() === 'finished') ? true : false;

        if (j1CoreFinished && pageVisible) {
          startTimeModule = Date.now();

          _this.setState('started');
          isDev && logger.debug('\n' + `module state: ${_this.getState()}`);
          isDev && logger.info('\n' + 'module is being initialized');

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

              clearInterval(dependencies_met_players_loaded);
            } // END if playersUILoaded
          }, 10); // END dependencies_met_players_loaded

          // -------------------------------------------------------------------
          // initialize player-specific events
          // -------------------------------------------------------------------
          var dependencies_met_api_initialized = setInterval (() => {
            // Claude - J1 amplitudePlayer optimizations #1
            // the API-ready flag lives in the module now
            // Original (deprecated, preserved for reference):
            // if (apiInitialized.state) {
            if (_core() !== null && _core().isApiInitialized()) {
              _this.initPlayerUiEvents();

              clearInterval(dependencies_met_api_initialized);
            } // END if apiInitialized
          }, 10); // END dependencies_met_api_initialized

          // initialize viewPort specific (GLOBAL) settings
          $(window).bind('resizeEnd', function() {
            var viewPortSize = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
            //do something, window hasn't changed size in 500ms
            if (viewPortSize > 578) {
              j1.adapter.amplitudePlayer.data.playerSongElementHeigth = playerSongElementHeigthDesktop;
            } else {
              j1.adapter.amplitudePlayer.data.playerSongElementHeigth = playerSongElementHeigthMobile;
            }
          });

          $(window).resize(function() {
            if (this.resizeTO) clearTimeout(this.resizeTO);
            this.resizeTO = setTimeout(function() {
              $(this).trigger('resizeEnd');
            }, 500);
         });

          clearInterval(dependencies_met_page_ready);
        } // END pageVisible
      }, 10); // END dependencies_met_page_ready

    }, // END init

    // -------------------------------------------------------------------------
    // Create global playlist|songs (API)
    //
    // Claude - J1 amplitudePlayer optimizations #1
    // The ~55 line mapping loop (config key -> AmplitudeJS song property)
    // moved to the module as buildSongs(). Only the Liquid loop over the
    // ENABLED playlists of the media file stays here.
    // -------------------------------------------------------------------------
    songLoader: (songs) => {
      isDev && logger.info('\n' + 'creating global playlist (API): started');

      // -----------------------------------------------------------------------
      // initialize amplitude songs
      // -----------------------------------------------------------------------
      {% for playlist in amplitude_player_media.playlists %} {% if playlist.enabled %}
        _this.buildSongs({{playlist.items | replace: 'nil', 'null' | replace: '=>', ':' }}, songs);
      {% endif %} {% endfor %}

      isDev && logger.info('\n' + 'creating global playlist (API): finished');
    }, // END songLoader

    // -------------------------------------------------------------------------
    // load players HTML portion (UI)
    //
    // UNCHANGED: pure build-time concern (XHR paths are Liquid values).
    // -------------------------------------------------------------------------
    playerHtmlLoader: (playersLoaded) => {
      var playerExistsInPage;

      // -----------------------------------------------------------------------
      // initialize HTML portion (UI) for all players configured|enabled
      // -----------------------------------------------------------------------
      isDev && logger.info('\n' + 'loading player HTML components (UI): started');

      // -----------------------------------------------------------------------
      // iterate the RAW per-player entries of the control file}
      // -----------------------------------------------------------------------
      {% for player in amplitude_player_control.players %} {% if player.enabled %}
        {% assign xhr_data_path = amplitude_player_options.xhr_data_path %}
        {% capture xhr_container_id %}{{player.id}}_audio{% endcapture %}

        // load players only that are configured in current page
        //
        playerExistsInPage = ($('#' + '{{xhr_container_id}}')[0] !== undefined) ? true : false;
        if (playerExistsInPage) {
          playerCounter++;
          isDev && logger.debug('\n' + 'load player UI on ID #{{player.id}}: started');

          j1.loadHTML({
            xhr_container_id: '{{xhr_container_id}}',
            xhr_data_path:    '{{xhr_data_path}}',
            xhr_data_element: '{{player.id}}'
            },
            'j1.adapter.amplitudePlayer',
            'data_loaded'
          );

          // dynamic loader variable to setup the player on ID {{player.id}}
          //
          dependency                    = 'dependencies_met_html_loaded_{{player.id}}';
          load_dependencies[dependency] = '';

          // -------------------------------------------------------------------
          // initialize amplitude instance (when player UI loaded)
          // -------------------------------------------------------------------
          load_dependencies['dependencies_met_html_loaded_{{player.id}}'] = setInterval (() => {
            // check if HTML portion of the player is loaded successfully
            xhrLoadState = j1.xhrDOMState['#' + '{{xhr_container_id}}'];

            if (xhrLoadState === 'success') {
              playersProcessed.push('{{xhr_container_id}}');
              isDev && logger.debug('\n' + 'load player UI on ID #{{player.id}}: finished');

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
          isDev && logger.info('\n' + 'loading player HTML components (UI): finished');

          clearInterval(load_dependencies['dependencies_met_players_loaded']);
          playersLoaded.state = true;
        }
      }, 10); // END dependencies_met_players_loaded

    }, // END playerHtmlLoader

    // -------------------------------------------------------------------------
    // initApi
    //
    // Claude - J1 amplitudePlayer optimizations #1
    // The complete Amplitude.init() call (bindings, songs, ~100 lines of
    // callbacks, continue_next, volume) and the AT player state machine moved
    // to the module. What stays here is the Liquid loop that BUILDS the
    // 'playlists' hash out of the media file — a pure build-time concern.
    // -------------------------------------------------------------------------
    initApi: (songlist) => {

      {% comment %} collect playlists
      --------------------------------------------------------------------------  {% endcomment %}
      {% assign playlists_enabled = 0 %}
      {% for list in amplitude_player_media.playlists %} {% if list.enabled %}
        {% assign playlists_enabled = playlists_enabled | plus: 1 %}
      {% endif %} {% endfor %}

      {% assign playlists_processed = 0 %}
      {% for list in amplitude_player_media.playlists %} {% if list.enabled %}
        {% assign playlist_items = list.items %}
        {% assign playlist_name  = list.name %}
        {% assign playlist_title = list.title %}

        {% comment %} collect song items
        NOTE: configure all properties avaialble in songs array
        ------------------------------------------------------------------------ {% endcomment %}
        {% for item in playlist_items %} {% if item.enabled %}

          {% comment %} Modify Amplitude comfig
          ----------------------------------------------------------------------
           Build the song URL from the media config keys 'audio_base' and
           'audio'. Same rules as the JS helper amplitudeMediaURL(), written
           with the Liquid means available (no regular expressions):

             1. LOCAL media file   '02_valhalla.mp3'  -> <base>/02_valhalla.mp3
             2. LEGACY YouTube URL 'watch?v=<ID>'     -> <base>/watch?v=<ID>
             3. NEW bare video ID  '<ID>'             -> <base>/watch?v=<ID>
             4. ABSOLUTE reference '//host/path'      -> //host/path

           A bare video ID is a reference of EXACTLY 11 characters that
           carries none of the characters '. / ? = & :' (any local media file
           has a file extension, hence a dot). It is expanded only if the
           audio base names a YouTube host or is empty.
          ---------------------------------------------------------------------- {% endcomment %}
          {% assign audio_ref       = item.audio %}
          {% assign audio_base      = item.audio_base %}
          {% assign song_url        = audio_base | append: '/' | append: audio_ref %}
          {% assign audio_ref_size  = audio_ref | size %}
          {% assign audio_base_size = audio_base | size %}
          {% assign base_is_youtube = false %}

          {% if audio_base_size == 0 %}
            {% assign base_is_youtube = true %}
          {% elsif audio_base contains 'youtube.com' or audio_base contains 'youtube-nocookie.com' or audio_base contains 'youtu.be' %}
            {% assign base_is_youtube = true %}
          {% endif %}

          {% if base_is_youtube and audio_ref_size == 11 %}
            {% unless audio_ref contains '.' or audio_ref contains '/' or audio_ref contains '?' or audio_ref contains '=' or audio_ref contains '&' or audio_ref contains ':' %}
              {% assign song_url = audio_base | append: '/watch?v=' | append: audio_ref %}
            {% endunless %}
          {% endif %}

          {% assign audio_ref_prefix = audio_ref | slice: 0, 2 %}
          {% if audio_ref contains '://' or audio_ref_prefix == '//' %}
            {% assign song_url = audio_ref %}
          {% endif %}

          {% capture song_item %}
          {
            "name":           "{{item.title}}",
            "artist":         "{{item.artist}}",
            "playlist":       "{{item.playlist}}",
            "album":          "{{item.name}}",
            "url":            "{{song_url}}",
            "audio_info":     "{{item.audio_info}}",
            "rating":         "{{item.rating}}",
            "start":          "{{item.start}}",
            "end":            "{{item.end}}",
            "shuffle":        "{{item.shuffle}}",
            "repeat":         "{{item.repeat}}",
            "duration":       "{{item.duration}}",
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
            -------------------------------------------------------------------- {% endcomment %}
            {% capture song_items %}{% endcapture %}
          {% endif %}
        {% endif %} {% endfor %}

        {% comment %} collect playlists players enabled
        ------------------------------------------------------------------------ {% endcomment %}
        {% capture playlists %}
          {{playlists}} {{playlist}} {% if playlists_processed == playlists_enabled %}{% else %},{% endif %}
        {% endcapture %}

      {% endif %} {% endfor %}

      // Claude - J1 amplitudePlayer optimizations #1
      // hand songs + the Liquid-built playlists hash over to the module
      var _apCore = _core();

      if (_apCore === null) { return; }

      _apCore.initApi(songlist, {
        {{playlists}}
      });

    }, // END initApi

    // -------------------------------------------------------------------------
    // initPlayerUiEvents
    //
    // Claude - J1 amplitudePlayer optimizations #1
    // -------------------------------------------------------------------------
    // THE major size reduction. The adapter used to carry the COMPLETE
    // mini|compact|large event wiring INSIDE this Liquid loop, guarded by
    //
    //   if player.id contains 'mini'|'compact'|'large' ..
    //
    // so Jekyll rendered a full copy of the matching block for EVERY player
    // configured on a page (~700 lines of adapter source, multiplied by the
    // number of players in the rendered output).
    //
    // The loop now emits ONE config hash per player and hands it to the
    // module factory:
    //
    //   var ap = audioPlayer(playerID, cfg);   // create-or-get
    //   ap.init();                             // wire the UI of this player
    //
    // which is the exact counterpart of the multiPlayer adapter's
    //
    //   vp = videoPlayer(playerId, options);
    //   new vp.playlistIOHandler(options);
    //
    // The wiring itself is IDENTICAL — it just lives in player.js now and is
    // selected at runtime from the player id instead of at build time by
    // Liquid.
    // -------------------------------------------------------------------------
    initPlayerUiEvents: () => {

      var dependencies_met_player_instances_initialized = setInterval (() => {
        if (_core() !== null && _core().isApiInitialized()) {

          isDev &&  logger.info('\n' + 'initialize player specific UI events: started');

          {% comment %}
          ----------------------------------------------------------------------
          iterate the RAW per-player entries of the control file and build
          the per-player EFFECTIVE settings (inheritance chain, later
          overloads earlier):
            1. amplitude_player_default.player   defaults
            2. amplitude_player_control.player   user (optional global section)
            3. player                            player (settings.players[] entry)
          ---------------------------------------------------------------------- {% endcomment %}
          {% for player in amplitude_player_control.players %} {% if player.enabled %}
            {% assign player_effective = amplitude_player_default.player %}
            {% if amplitude_player_control.player %}
              {% assign player_effective = player_effective | deep_merge: amplitude_player_control.player %}
            {% endif %}
            {% assign player_effective = player_effective | deep_merge: player %}
            {% assign xhr_data_path    = amplitude_player_options.xhr_data_path %}
            {% capture xhr_container_id %}{{player.id}}_audio{% endcapture %}

            // dynamic loader variable to setup the player on ID {{player.id}}
            //
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

                // -------------------------------------------------------------
                // per-player config hash (the ONLY thing Liquid emits now)
                //
                // The plugin manager flag is resolved from the EFFECTIVE chain
                // (defaults <- user <- player). The former expression fell back
                // to the DEFAULT when a player set plugin_manager.enabled to
                // FALSE (the rendered string 'false' is neither empty nor
                // 'true'), so a per-player FALSE could not overload a global
                // TRUE.
                //
                // Original (deprecated, preserved for reference):
                // pluginManagerEnabled = ('{{player.plugin_manager.enabled}}'.length > 0 && '{{player.plugin_manager.enabled}}' === 'true') ? true : playerDefaultPluginManager;
                // -------------------------------------------------------------
                var playerConfig = {
                  playerID:               '{{player.id}}',
                  playerType:             '{{player_effective.type}}',
                  xhrContainerId:         '{{xhr_container_id}}',
                  playlistInfo:           {{player.playlist | replace: 'nil', 'null' | replace: '=>', ':' }},
                  playlistName:           '{{player.playlist.name}}',
                  playlistTitle:          '{{player.playlist.title}}',
                  scrollerSongElementMin: '{{player_effective.player_scroller_song_element_min}}',
                  pluginManagerEnabled:   ('{{player_effective.plugin_manager.enabled}}' === 'true') ? true : false,
                  plugins:                '{{player_effective.plugin_manager.plugins}}',
                  volumeSlider: {
                    min_value:            '{{player.volume_slider.min_value}}',
                    max_value:            '{{player.volume_slider.max_value}}',
                    preset_value:         '{{player.volume_slider.preset_value}}',
                    slider_step:          '{{player.volume_slider.slider_step}}'
                  },
                  volumeSliderDefaults: {
                    min_value:            '{{amplitude_player_default.player.volume_slider.min_value}}',
                    max_value:            '{{amplitude_player_default.player.volume_slider.max_value}}',
                    preset_value:         '{{amplitude_player_default.player.volume_slider.preset_value}}',
                    slider_step:          '{{amplitude_player_default.player.volume_slider.slider_step}}'
                  }
                };

                // -------------------------------------------------------------
                // create-or-get the module instance and wire its UI
                // -------------------------------------------------------------
                if (typeof audioPlayer === 'undefined') {
                  logger.error('\n' + 'initPlayerUiEvents: module API (player.js) not loaded [{{player.id}}]');
                } else {
                  ap = audioPlayer('{{player.id}}', playerConfig);
                  ap.init(playerConfig);
                }

                clearInterval(load_dependencies['dependencies_met_player_loaded_{{player.id}}']);
              } // END if xhrLoadState success
            }, 10); // END dependencies_met_html_loaded

          {% endif %} {% endfor %}

          isDev && logger.info('\n' + 'initialize player specific UI events: finished');

          _this.setState('finished');
          isDev && logger.debug('\n' + `module state: ${_this.getState()}`);
          isDev && logger.info('\n' + 'module initialized successfully');

          endTimeModule = Date.now();
          isDev && logger.info('\n' + `module initializing time: ${(endTimeModule-startTimeModule)}ms`);

          clearInterval(dependencies_met_player_instances_initialized);
        } // END if apiInitialized
      }, 10); // END initialize player specific UI events
    }, // END initPlayerUiEvents

    // =========================================================================
    // Claude - J1 amplitudePlayer optimizations #1
    // PUBLIC API FACADE
    //
    // Every method below used to carry its full implementation in this file.
    // The bodies moved to the module API (player.js); the names stay so the
    // PUBLIC ADAPTER CONTRACT is unchanged:
    //
    //   * ytp.js calls j1.adapter.<host>.timestamp2seconds() and
    //     j1.adapter.<host>.seconds2timestamp() through its ytpHost() accessor
    //   * page|template code and the J1 API manual reference these names
    //   * the AsciiDoc API documentation of the module stays valid
    //
    // A facade returns the documented FALLBACK value when the module file was
    // not loaded, so a missing player.js degrades instead of throwing.
    // =========================================================================

    // -------------------------------------------------------------------------
    // buildSongs(songItems, songs)   -> module: buildSongs()
    // -------------------------------------------------------------------------
    buildSongs: (songItems, songs) => _delegate('buildSongs', [songItems, songs], songs),

    // -------------------------------------------------------------------------
    // setAudioInfo(audioInfo)        -> module: setAudioInfo()
    // -------------------------------------------------------------------------
    setAudioInfo: (audioInfo) => _delegate('setAudioInfo', [audioInfo], undefined),

    // -------------------------------------------------------------------------
    // songEvents(songs, playerID)    -> module: songEvents()
    // -------------------------------------------------------------------------
    songEvents: (songs, playerID) => _delegate('songEvents', [songs, playerID], undefined),

    // -------------------------------------------------------------------------
    // isPluginLoaded(plugin)         -> module: isPluginLoaded()
    // -------------------------------------------------------------------------
    isPluginLoaded: (plugin) => _delegate('isPluginLoaded', [plugin], false),

    // -------------------------------------------------------------------------
    // pluginManager(plugin)          -> module: pluginManager()
    // -------------------------------------------------------------------------
    pluginManager: (plugin) => _delegate('pluginManager', [plugin], undefined),

    // -------------------------------------------------------------------------
    // publishPluginOptions(plugin)   -> module: publishPluginOptions()
    // -------------------------------------------------------------------------
    publishPluginOptions: (plugin) => _delegate('publishPluginOptions', [plugin], undefined),

    // -------------------------------------------------------------------------
    // atPlayerScrollToActiveElement(metaData)
    // -------------------------------------------------------------------------
    atPlayerScrollToActiveElement: (metaData) => _delegate('atPlayerScrollToActiveElement', [metaData], undefined),

    // -------------------------------------------------------------------------
    // atpUpdatMetaContainers(metaData)
    // -------------------------------------------------------------------------
    atpUpdatMetaContainers: (metaData) => _delegate('atpUpdatMetaContainers', [metaData], undefined),

    // -------------------------------------------------------------------------
    // atpStopParallelActivePlayers(players)
    // -------------------------------------------------------------------------
    atpStopParallelActivePlayers: (players) => _delegate('atpStopParallelActivePlayers', [players], undefined),

    // -------------------------------------------------------------------------
    // atpProcessAudioStartPosition()
    // -------------------------------------------------------------------------
    atpProcessAudioStartPosition: () => _delegate('atpProcessAudioStartPosition', [], undefined),

    // -------------------------------------------------------------------------
    // atpProcessAudioEndPosition()
    // -------------------------------------------------------------------------
    atpProcessAudioEndPosition: () => _delegate('atpProcessAudioEndPosition', [], undefined),

    // -------------------------------------------------------------------------
    // setSongActive(currentPlayList, currentIndex)
    // -------------------------------------------------------------------------
    setSongActive: (currentPlayList, currentIndex) => _delegate('setSongActive', [currentPlayList, currentIndex], undefined),

    // -------------------------------------------------------------------------
    // timestamp2seconds(timestamp)
    // PUBLIC: called by the ytp plugin via ytpHost().timestamp2seconds()
    // -------------------------------------------------------------------------
    timestamp2seconds: (timestamp) => _delegate('timestamp2seconds', [timestamp], false),

    // -------------------------------------------------------------------------
    // seconds2timestamp(seconds)
    // PUBLIC: called by the ytp plugin via ytpHost().seconds2timestamp()
    // -------------------------------------------------------------------------
    seconds2timestamp: (seconds) => _delegate('seconds2timestamp', [seconds], false),

    // -------------------------------------------------------------------------
    // deepMerge(target, ...sources)
    // -------------------------------------------------------------------------
    deepMerge: (target, ...sources) => _delegate('deepMerge', [target, ...sources], target),

    // -------------------------------------------------------------------------
    // getInstanceOptions(playerId)
    // -------------------------------------------------------------------------
    getInstanceOptions: (playerId) => _delegate('getInstanceOptions', [playerId], null),

    // -------------------------------------------------------------------------
    // Claude - J1 amplitudePlayer optimizations #1
    // getPlayer(playerId) / getPlayers()
    //
    // NEW, mirroring videoPlayer.getPlayer()/getPlayers() of the multiPlayer
    // module: hand the per-player module instance out to page code.
    // -------------------------------------------------------------------------
    getPlayer: (playerId) => {
      var core = _core();
      return (core === null) ? null : core.getPlayer(playerId);
    },

    getPlayers: () => {
      var core = _core();
      return (core === null) ? {} : core.getPlayers();
    },

    // -------------------------------------------------------------------------
    // messageHandler()
    // manage messages send from other J1 modules
    // -------------------------------------------------------------------------
    messageHandler: (sender, message) => {
      var json_message = JSON.stringify(message, undefined, 2);

      logText = 'received message from ' + sender + ': ' + json_message;
      isDev && logger.debug('\n' + logText);

      // -----------------------------------------------------------------------
      //  process commands|actions
      // -----------------------------------------------------------------------
      if (message.type === 'command' && message.action === 'module_initialized') {

        //
        // place handling of command|action here
        //

        isDev && logger.info('\n' + message.text);
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
      // Claude - J1 amplitudePlayer optimizations #1
      // _this wird erst INNERHALB von init() gebunden. Jeder Aufruf VOR
      // init() (oder aus einem Plugin heraus) lief in
      //   TypeError: Cannot set properties of undefined (setting 'state')
      // Der lazy Resolver _self() existiert genau dafuer und wird hier
      // benutzt.
      //
      // Original (deprecated, preserved for reference):
      // _this.state = stat;
      _self().state = stat;
    }, // END setState

    // -------------------------------------------------------------------------
    // getState()
    // Returns the current (processing) state of the module
    // -------------------------------------------------------------------------
    getState: () => {
      // Claude - J1 amplitudePlayer optimizations #1
      // siehe setState()
      //
      // Original (deprecated, preserved for reference):
      // return _this.state;
      return _self().state;
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
