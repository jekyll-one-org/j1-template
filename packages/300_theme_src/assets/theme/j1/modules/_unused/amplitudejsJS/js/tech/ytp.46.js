---
regenerate:                             true
---

{%- capture cache -%}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/modules/amplitudejs/js/tech/ytp.js (46)
 # AmplitudeJS V5 Tech for J1 Template (AI optimized)
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2026 Juergen Adams
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

{% comment %} Set config data
-------------------------------------------------------------------------------- {% endcomment %}
{% assign amplitude_default   = modules.defaults.amplitude.defaults %}

{% comment %} Fix Amplitude plugin #1
--------------------------------------------------------------------------------
 The plugin is NO LONGER bound to the PLAYER settings (amplitude_control) and
 the PLAYLIST settings (amplitude_media) of the amplitude module at BUILD time.
 Both are passed in at RUNTIME by the calling module as an options hash; see
 the JS function resolvePluginOptions() below. This makes the plugin reusable
 for other modules (e.g. audioPlayer) that provide their OWN player and
 playlist settings.

 The dependency on the MODULE DEFAULTS (amplitude_default) is kept, but is
 used as a LAST-RESORT fallback only: if the calling module passes its own
 defaults in the options hash, those defaults win.

 The deprecated statements are preserved VERBATIM in the 'if false' block
 below. A comment block cannot be used as the wrapper here because the
 preserved text CONTAINS a comment block itself, and NESTED comment blocks
 are not supported by all Liquid versions.
-------------------------------------------------------------------------------- {% endcomment %}

{% if false %}
{% comment %} Original (deprecated, preserved for reference)
-------------------------------------------------------------------------------- {% endcomment %}
{% comment %} Set config options
{% assign amplitude_control   = modules.amplitude_control.settings %}
{% assign amplitude_media     = modules.amplitude_media.settings %}
{% assign amplitude_options   = amplitude_default | deep_merge: amplitude_control, amplitude_media %}
{% assign amplitude_options   = amplitude_default | merge: amplitude_control | merge: amplitude_media %}
-------------------------------------------------------------------------------- {% endcomment %}
{% endif %}

{% comment %} Detect prod mode
-------------------------------------------------------------------------------- {% endcomment %}
{% assign production = false %}
{% if environment == 'prod' or environment == 'production' %}
  {% assign production = true %}
{% endif %}


/*
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/modules/amplitudejs/js/plugins/tech/ytp.js (46)
 # AmplitudeJS V5 Plugin|Tech for J1 Template (AI optimized)
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2026 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 # -----------------------------------------------------------------------------
*/
"use strict";

  // J1 Amplitude optimizations #1
  const env   = '{{environment}}';
  const isDev = (env === 'development' || env === 'dev') ? true : false;

  // date|time monitoring
  //----------------------------------------------------------------------------
  var startTime;
  var endTime;
  var startTimeModule;
  var endTimeModule;
  var timeSeconds;

  // YT API settings
  // ---------------------------------------------------------------------------

  // J1 Amplitude optimizations #1
  // BUG FIX: Property `VIDEO_NOT_ALLOWED` was declared twice; the second
  // declaration silently overwrote the first, so error code 101 was lost.
  // Per the YT IFrame API, codes 101 and 150 both signal "video not allowed
  // in embedded players" -- but they are still distinct values that must
  // be addressable individually. Renamed the second key so both are kept.
  const YT_PLAYER_ERROR = {
    INVALID_PARAMETER:           2,
    INVALID_PLAYER:              5,
    VIDEO_NOT_ALLOWED:           101,
    VIDEO_NOT_ALLOWED_EMBEDDED:  150
  };

  const YT_PLAYER_ERROR_NAMES = {
    2:          "invalid parameter",
    5:          "invalid player",
    101:        "video not allowed",
    150:        "video not allowed"
  };

  const YT_PLAYER_STATE = {
    UNSTARTED:  -1,
    ENDED:       0,
    PLAYING:     1,
    PAUSED:      2,
    BUFFERING:   3,
    CUED:        5
  };

  // J1 Amplitude optimizations #1
  // BUG FIX: The names table had a fake key `4: "not_used"` that does not
  // correspond to any real YT player state, and it had `6: "unstarted"` which
  // forced lookup code to use the magic number 6 as a workaround for the
  // missing -1 entry (e.g. `YT_PLAYER_STATE_NAMES[6]`). Replaced with the
  // proper string key "-1" so `YT_PLAYER_STATE_NAMES[playerState]` works
  // directly for UNSTARTED. The "6" entry is retained for backwards
  // compatibility with existing call sites that still pass 6.
  const YT_PLAYER_STATE_NAMES = {
    "-1":       "unstarted",
    0:          "ended",
    1:          "playing",
    2:          "paused",
    3:          "buffering",
    5:          "cued",
    6:          "unstarted"   // deprecated alias for legacy call sites
  };

  // J1 Amplitude optimizations #1
  // CLEANUP: Removed a duplicate block declaring startTime, endTime,
  // startTimeModule, endTimeModule, timeSeconds. The same `var` set was
  // already declared 40 lines above. Re-declaring `var` is legal but
  // confusing and the second block was dead noise.

  // AmplitudeJS API settings
  // ---------------------------------------------------------------------------
  var firstScriptTag;
  var ytPlayer;
  var ytPlayerErrorTest               = false;
  var ytPlayerReady                   = false;
  var ytApiReady                      = false;

  // Fix AudioPlayer #4
  // Run-once guard for the player configuration in onYouTubeIframeAPIReady.
  // The configuration can now be reached on TWO paths: the ONE-TIME global
  // callback window.onYouTubeIframeAPIReady invoked by the YT iframe API,
  // and the YT.ready() registration added in initYtAPI (used when the YT
  // API was ALREADY loaded by another module, e.g. the VideoJS YouTube
  // tech). The guard makes sure the players are configured exactly ONCE,
  // no matter which path fires (first) or whether both fire.
  var ytpApiReadyProcessed            = false;
  var logger                          = log4javascript.getLogger('j1.adapter.amplitude.tech');

  var dependency;
  var playerCounter                   = 0;
  var load_dependencies               = {};

  // set default song index to FIRST track (video) in playlist
  var songIndex                       = 0;
  var ytpSongIndex                    = 0;

  var ytpAutoPlay                     = false;
  var ytpLoop                         = true;
  var playLists                       = {};
  var playersUILoaded                 = { state: false };
  var apiInitialized                  = { state: false };

  // Fix Amplitude plugin #1
  // The PLAYER and PLAYLIST settings are NO LONGER rendered into the plugin
  // at build time. They are handed over at RUNTIME as an options hash by the
  // module that loads the plugin (amplitude, audioPlayer, ...).
  //
  // The variables amplitudePlayers, amplitudePlaylists and amplitudeOptions
  // were DEAD CODE: they were assigned here but never read anywhere else in
  // this plugin (verified by a full-file scan). The only value that WAS read
  // is amplitudeDefaults.player (see the YT player properties below), which
  // is kept -- but now resolved from the options hash.
  //
  // Original (deprecated, preserved for reference; kept verbatim inside a
  // Liquid comment block so the Liquid expressions are NOT evaluated):
  {% comment %}
    var amplitudeDefaults               = $.extend({}, {{amplitude_default  | replace: 'nil', 'null' | replace: '=>', ':' }});
    var amplitudePlayers                = $.extend({}, {{amplitude_control   | replace: 'nil', 'null' | replace: '=>', ':' }});
    var amplitudePlaylists              = $.extend({}, {{amplitude_media | replace: 'nil', 'null' | replace: '=>', ':' }});
    var amplitudeOptions                = $.extend(true, {}, amplitudeDefaults, amplitudePlayers, amplitudePlaylists);
  {% endcomment %}


  // MODULE DEFAULTS as rendered at build time. Used as LAST-RESORT fallback
  // only: options.defaults (passed in by the calling module) always wins.
  var ytpModuleDefaults               = $.extend({}, {{amplitude_default  | replace: 'nil', 'null' | replace: '=>', ':' }});

  // Fix Amplitude plugin #1
  // RUNTIME options hash (see resolvePluginOptions below)
  var ytpOptions                      = resolvePluginOptions();
  var amplitudeDefaults               = ytpOptions.defaults;
  var ytpPlayerSettings               = ytpOptions.players;
  var ytpPlaylistSettings             = ytpOptions.playlists;

  // Fix Amplitude plugin #2
  // REBIND the logger to the ADAPTER NAMESPACE of the CALLING module. The
  // initial binding above ('j1.adapter.amplitude.tech') is created BEFORE
  // the plugin options are resolved and is kept as the BOOTSTRAP logger for
  // the messages issued by resolvePluginOptions itself.
  logger                              = log4javascript.getLogger('j1.adapter.' + ytpHostAdapter() + '.tech');

  var playerExistsInPage              = false;
  var ytpContainer                    = null;
  var ytpBufferQuote                  = 0;
  var playerProperties                = {};
  var activeVideoElement              = {};
  var ytPlayerCurrentTime             = 0;
  var singleAudio                     = false;

  // Fix Amplitude plugin #1
  // The GLOBAL player settings below are read from the DEFAULTS of the
  // calling module (options.defaults) instead of being hard-wired to the
  // amplitude defaults at build time. The build-time value of the amplitude
  // module is kept as the fallback value (2nd argument), so the behaviour is
  // unchanged when the plugin is used by the amplitude module.
  //
  // Original (deprecated, preserved for reference):
  // var playerScrollerSongElementMin    = {{amplitude_default.player.player_scroller_song_element_min}};
  // var playerScrollControl             = {{amplitude_default.player.player_scroll_control}};
  // var playerAutoScrollSongElement     = {{amplitude_default.player.player_auto_scroll_song_element}};
  // var playerFadeAudioIn               = {{amplitude_default.player.player_fade_audio_in}};
  // var playerFadeAudioOut              = {{amplitude_default.player.player_fade_audio_out}};
  // var playerFadeAudioSpeed            = '{{amplitude_default.player.player_fade_audio_speed}}';
  // var playerPlaybackRate              = '{{amplitude_default.player.player_playback_rate}}';
  // var muteAfterVideoSwitchInterval    = {{amplitude_default.player.mute_after_video_switch_interval}};
  // var checkActiveVideoInterval        = {{amplitude_default.player.check_active_video_interval}};
  //
  var playerScrollerSongElementMin    = ytpDefault('player.player_scroller_song_element_min', {{amplitude_default.player.player_scroller_song_element_min}});
  var playerScrollControl             = ytpDefault('player.player_scroll_control', {{amplitude_default.player.player_scroll_control}});
  var playerAutoScrollSongElement     = ytpDefault('player.player_auto_scroll_song_element', {{amplitude_default.player.player_auto_scroll_song_element}});
  var playerFadeAudioIn               = ytpDefault('player.player_fade_audio_in', {{amplitude_default.player.player_fade_audio_in}});
  var playerFadeAudioOut              = ytpDefault('player.player_fade_audio_out', {{amplitude_default.player.player_fade_audio_out}});
  var playerFadeAudioSpeed            = ytpDefault('player.player_fade_audio_speed', '{{amplitude_default.player.player_fade_audio_speed}}');
  var playerPlaybackRate              = ytpDefault('player.player_playback_rate', '{{amplitude_default.player.player_playback_rate}}');

  var muteAfterVideoSwitchInterval    = ytpDefault('player.mute_after_video_switch_interval', {{amplitude_default.player.mute_after_video_switch_interval}});
  var checkActiveVideoInterval        = ytpDefault('player.check_active_video_interval', {{amplitude_default.player.check_active_video_interval}});

  var playList;
  var playerID;
  var playerType;
  var playListTitle;
  var playListName;
  var amplitudePlayerState; 
  
  var songs;
  var songMetaData;
  var songURL;

  var progress;

  // Fix Amplitude plugin #1
  // Publish the plugin API (and the RESOLVED options) for the calling module.
  // The calling module hands the options over BEFORE the plugin script is
  // injected into the page (see resolvePluginOptions for details).
  window.j1                   = window.j1 || {};
  j1.plugins                  = j1.plugins || {};
  j1.plugins.ytp              = j1.plugins.ytp || {};
  j1.plugins.ytp.options      = ytpOptions;
  j1.plugins.ytp.getOptions   = function() { return ytpOptions; };
  j1.plugins.ytp.getPlayers   = function() { return ytpVideoPlayers(); };

  // ---------------------------------------------------------------------------
  // Plugin options (Fix Amplitude plugin #1)
  // ===========================================================================

  // ---------------------------------------------------------------------------
  // resolvePluginOptions()
  //
  // Returns the RUNTIME options hash of the plugin. The plugin does NOT read
  // any module YAML config file (player|playlist settings) at build time
  // anymore. The calling module (amplitude, audioPlayer, ...) passes its OWN
  // settings in as a plain JS object.
  //
  // Options hash (all keys optional):
  //
  //   {
  //     module:    'audioPlayer',   // name of the calling module (logging)
  //     defaults:  { ... },         // _data/modules/defaults/<module>.yml
  //                                 // -> defaults
  //     players:   [ { ... } ],     // _data/modules/<module>_control.yml
  //                                 // -> settings.players
  //     playlists: { ... }          // _data/modules/<module>_media.yml
  //                                 // -> settings
  //   }
  //
  // The 'players' key also accepts the RAW control settings object (the
  // object that CONTAINS the players array) for convenience.
  //
  // How the calling module hands the options over (BEFORE the plugin script
  // tag is added to the page):
  //
  //   j1.plugins     = j1.plugins || {};
  //   j1.plugins.ytp = j1.plugins.ytp || {};
  //   j1.plugins.ytp.options = {
  //     module:    'audioPlayer',
  //     defaults:  audioPlayerDefaults,
  //     players:   audioPlayerControl.players,
  //     playlists: audioPlayerMedia
  //   };
  //
  // Resolution order:
  //
  //   1. j1.plugins.ytp.options                 (documented handoff)
  //   2. j1.modules.amplitudejs.{defaults, players, playlists}
  //                                             (legacy handoff, kept for
  //                                              backwards compatibility)
  //   3. build-time module defaults, NO players (last resort; logs an error
  //      because no player can be created without player settings)
  // ---------------------------------------------------------------------------
  function resolvePluginOptions() {
    var handoff, legacy, options;

    // Fix Amplitude plugin #2
    // NEW key 'adapter': names the ADAPTER NAMESPACE of the CALLING module.
    // The plugin stores ALL runtime data in j1.adapter.<adapter>.data and
    // calls the helper methods of j1.adapter.<adapter> (seconds2timestamp,
    // timestamp2seconds). Fallback is 'amplitude' to keep the behaviour of
    // the plugin UNCHANGED when the calling module does not pass the key.
    options = {
      module:     'unknown',
      defaults:   ytpModuleDefaults,
      players:    [],
      // Fix Amplitude plugin #2
      // Original (deprecated, preserved for reference):
      // playlists:  {}
      playlists:  {},
      // Fix AudioPlayer #3
      // NEW key 'moduleNamespace': names the MODULE RUNTIME NAMESPACE
      // j1.modules.<name> of the CALLING module. The plugin mirrors its
      // module runtime data (data.ytp, legacy compatibility writes) to
      // j1.modules.<name>.data. Fallback is 'amplitudejs' to keep the
      // behaviour of the plugin UNCHANGED when the calling module does
      // not pass the key.
      // Original (deprecated, preserved for reference):
      // adapter:    'amplitude'
      adapter:    'amplitude',
      moduleNamespace: 'amplitudejs'
    };

    // 1. documented handoff
    handoff = (window.j1 && j1.plugins && j1.plugins.ytp && j1.plugins.ytp.options)
            ? j1.plugins.ytp.options
            : null;

    // 2. legacy handoff (published by the amplitude|audioPlayer adapter)
    legacy  = (window.j1 && j1.modules && j1.modules.amplitudejs)
            ? j1.modules.amplitudejs
            : null;

    if (handoff) {
      options.module    = handoff.module    || options.module;
      options.defaults  = ytpIsPlainObject(handoff.defaults)  ? handoff.defaults  : options.defaults;
      options.players   = ytpNormalizePlayers(handoff.players);
      options.playlists = ytpIsPlainObject(handoff.playlists) ? handoff.playlists : options.playlists;

      // Fix Amplitude plugin #2
      // Resolve the ADAPTER NAMESPACE of the calling module from the handoff.
      // Only a NON-EMPTY string is accepted; anything else keeps the fallback
      // 'amplitude' (see the base options above).
      options.adapter   = (typeof handoff.adapter === 'string' && handoff.adapter.length > 0)
                        ? handoff.adapter
                        : options.adapter;

      // Fix AudioPlayer #3
      // Resolve the MODULE RUNTIME NAMESPACE (j1.modules.<name>) of the
      // calling module from the handoff. Only a NON-EMPTY string is
      // accepted; anything else keeps the fallback 'amplitudejs' (see the
      // base options above).
      options.moduleNamespace = (typeof handoff.moduleNamespace === 'string' && handoff.moduleNamespace.length > 0)
                              ? handoff.moduleNamespace
                              : options.moduleNamespace;

      logger && logger.info('\n' + `plugin options passed by module: ${options.module}`);
      return options;
    }

    if (legacy) {
      // Fix Amplitude plugin #2
      // The LEGACY handoff (j1.modules.amplitudejs) is by definition published
      // by the amplitude|audioPlayer adapter WITHOUT an adapter key. The base
      // fallback 'amplitude' is kept UNCHANGED here on purpose: the legacy
      // path always stored its runtime data in j1.adapter.amplitude.data.
      // Fix AudioPlayer #3
      // Same reasoning for the MODULE RUNTIME NAMESPACE: the legacy
      // handoff IS the namespace j1.modules.amplitudejs, so the base
      // fallback 'amplitudejs' is kept UNCHANGED here on purpose.
      options.module    = 'legacy';
      options.defaults  = ytpIsPlainObject(legacy.defaults)  ? legacy.defaults  : options.defaults;
      options.players   = ytpNormalizePlayers(legacy.players);
      options.playlists = ytpIsPlainObject(legacy.playlists) ? legacy.playlists : options.playlists;

      logger && logger.warn('\n' + 'plugin options NOT passed as an options hash, legacy settings used');
      return options;
    }

    logger && logger.error('\n' + 'plugin options NOT found, no player settings available');
    return options;
  } // END resolvePluginOptions

  // ---------------------------------------------------------------------------
  // Fix Amplitude plugin #2
  // Host adapter accessors
  //
  // Until now, the plugin had STRONG (hardcoded) dependencies on the RUNTIME
  // data of the module amplitudejs: every access went to the literal
  // namespace j1.adapter.amplitude. The plugin now resolves the adapter
  // namespace of the module it was LOADED BY (via the plugin manager
  // 'pluginManager' -> publishPluginOptions -> options.adapter) and stores
  // ALL runtime data there instead:
  //
  //   ytpHostAdapter()  name of the host ADAPTER NAMESPACE (string).
  //                     Resolution: ytpOptions.adapter, fallback 'amplitude'.
  //   ytpHost()         the host ADAPTER OBJECT j1.adapter.<name>. Replaces
  //                     literal j1.adapter.amplitude for METHOD calls
  //                     (seconds2timestamp, timestamp2seconds).
  //   ytpHostData()     the RUNTIME DATA object j1.adapter.<name>.data.
  //                     Replaces literal j1.adapter.amplitude.data (and its
  //                     bracket form j1.adapter.amplitude['data']).
  //
  // NOTE (design decision, flagged): ytpHost() CREATES the adapter namespace
  // (and ytpHostData() the data hash) if absent instead of throwing. This
  // makes the plugin robust against load-order races, at the price of
  // masking a missing host adapter. If a hard failure is preferred, replace
  // the creation with a logger.error and a throw.
  // ---------------------------------------------------------------------------
  function ytpHostAdapter() {
    return (ytpOptions && typeof ytpOptions.adapter === 'string' && ytpOptions.adapter.length > 0)
         ? ytpOptions.adapter
         : 'amplitude';
  } // END ytpHostAdapter

  function ytpHost() {
    var name = ytpHostAdapter();

    window.j1        = window.j1        || {};
    j1.adapter       = j1.adapter       || {};
    j1.adapter[name] = j1.adapter[name] || {};

    return j1.adapter[name];
  } // END ytpHost

  function ytpHostData() {
    var host  = ytpHost();

    host.data = host.data || {};
    return host.data;
  } // END ytpHostData

  // ---------------------------------------------------------------------------
  // Fix AudioPlayer #3
  // Host module accessors
  //
  // Until now, the plugin had STRONG (hardcoded) dependencies on the RUNTIME
  // data of the module amplitudejs: every access went to the literal
  // namespace j1.modules.amplitudejs. The plugin now resolves the MODULE
  // RUNTIME NAMESPACE of the module it was LOADED BY (via the plugin
  // manager 'pluginManager' -> publishPluginOptions ->
  // options.moduleNamespace) and stores ALL module runtime data there
  // instead:
  //
  //   ytpHostModuleName() name of the host MODULE NAMESPACE (string).
  //                       Resolution: ytpOptions.moduleNamespace, fallback
  //                       'amplitudejs'.
  //   ytpHostModule()     the host MODULE OBJECT j1.modules.<name>.
  //                       Replaces literal j1.modules.amplitudejs.
  //   ytpHostModuleData() the MODULE RUNTIME DATA object
  //                       j1.modules.<name>.data. Replaces literal
  //                       j1.modules.amplitudejs.data.
  //   ytpHostModuleYtp()  the PLUGIN DATA hash j1.modules.<name>.data.ytp.
  //                       Replaces literal j1.modules.amplitudejs.data.ytp.
  //                       Ensures the 'players' hash exists (the adapter
  //                       creates it on init; the accessor recreates it
  //                       only if the namespace was created lazily).
  //
  // NOTE (design decision, flagged): like ytpHost()/ytpHostData()
  // introduced by Fix Amplitude plugin #2, these accessors CREATE the
  // module namespace (and its data hashes) if absent instead of throwing.
  // This makes the plugin robust against load-order races, at the price of
  // masking a missing host module. If a hard failure is preferred, replace
  // the creation with a logger.error and a throw.
  // ---------------------------------------------------------------------------
  function ytpHostModuleName() {
    return (ytpOptions && typeof ytpOptions.moduleNamespace === 'string' && ytpOptions.moduleNamespace.length > 0)
         ? ytpOptions.moduleNamespace
         : 'amplitudejs';
  } // END ytpHostModuleName

  function ytpHostModule() {
    var name = ytpHostModuleName();

    window.j1        = window.j1        || {};
    j1.modules       = j1.modules       || {};
    j1.modules[name] = j1.modules[name] || {};

    return j1.modules[name];
  } // END ytpHostModule

  function ytpHostModuleData() {
    var hostModule = ytpHostModule();

    hostModule.data = hostModule.data || {};
    return hostModule.data;
  } // END ytpHostModuleData

  function ytpHostModuleYtp() {
    var data = ytpHostModuleData();

    data.ytp         = data.ytp         || {};
    data.ytp.players = data.ytp.players || {};
    return data.ytp;
  } // END ytpHostModuleYtp

  // ---------------------------------------------------------------------------
  // ytpNormalizePlayers(players)
  //
  // Accepts the players ARRAY or the control settings OBJECT that contains
  // the players array. Returns an array (empty if nothing usable is found).
  // ---------------------------------------------------------------------------
  function ytpNormalizePlayers(players) {
    if (Array.isArray(players)) {
      return players;
    }
    if (ytpIsPlainObject(players) && Array.isArray(players.players)) {
      return players.players;
    }
    return [];
  } // END ytpNormalizePlayers

  // ---------------------------------------------------------------------------
  // ytpIsPlainObject(value)
  // ---------------------------------------------------------------------------
  function ytpIsPlainObject(value) {
    return (
      value !== null &&
      typeof value === 'object' &&
      !Array.isArray(value)
    );
  } // END ytpIsPlainObject

  // ---------------------------------------------------------------------------
  // ytpGetValue(obj, path, fallback)
  //
  // Reads a DOTTED path (e.g. 'player.yt_player.autoplay') from an object.
  // Returns the fallback if the path does not exist or the value is
  // undefined|null|empty string.
  // ---------------------------------------------------------------------------
  function ytpGetValue(obj, path, fallback) {
    var parts, current, i;

    if (!ytpIsPlainObject(obj)) { return fallback; }

    parts   = path.split('.');
    current = obj;

    for (i = 0; i < parts.length; i++) {
      if (current === null || current === undefined) { return fallback; }
      current = current[parts[i]];
    }

    if (current === undefined || current === null || current === '') {
      return fallback;
    }
    return current;
  } // END ytpGetValue

  // ---------------------------------------------------------------------------
  // ytpDefault(path, fallback)
  //
  // Reads a DOTTED path from the DEFAULT settings of the calling module.
  // ---------------------------------------------------------------------------
  function ytpDefault(path, fallback) {
    return ytpGetValue(amplitudeDefaults, path, fallback);
  } // END ytpDefault

  // ---------------------------------------------------------------------------
  // ytpEffectivePlayer(player)
  //
  // Returns the EFFECTIVE settings of ONE player: the DEFAULT player settings
  // (options.defaults.player) overloaded by the settings of the player entry
  // (options.players[]).
  //
  // NOTE: This replaces the (broken) build-time expression
  //   $.extend({}, {{player}}, {{amplitude_defaults}})
  // The Liquid variable 'amplitude_defaults' (plural) was NEVER assigned --
  // the assigned name is 'amplitude_default' (singular) -- so the expression
  // rendered as `$.extend({}, {...}, )` and the defaults were silently
  // dropped. The keys read from the merged object (e.g. display_hours) were
  // therefore always undefined.
  // ---------------------------------------------------------------------------
  function ytpEffectivePlayer(player) {
    var defaults = ytpGetValue(amplitudeDefaults, 'player', {});
    return $.extend(true, {}, defaults, player || {});
  } // END ytpEffectivePlayer

  // ---------------------------------------------------------------------------
  // ytpVideoPlayers()
  //
  // Returns all ENABLED players of source type 'video' configured for the
  // calling module. The source type is resolved from the player entry and
  // falls back to the module default (options.defaults.player.source).
  // ---------------------------------------------------------------------------
  function ytpVideoPlayers() {
    var players = [];
    var i, entry, source;

    for (i = 0; i < ytpPlayerSettings.length; i++) {
      entry = ytpPlayerSettings[i];

      if (!ytpIsPlainObject(entry) || !entry.enabled || !entry.id) { continue; }

      source = ytpGetValue(entry, 'source', ytpDefault('player.source', 'audio'));
      if (source !== 'video') { continue; }

      players.push(entry);
    }

    return players;
  } // END ytpVideoPlayers

  // ---------------------------------------------------------------------------
  // Base YT functions
  // ===========================================================================

  // ---------------------------------------------------------------------------
  // mergeObject
  // ---------------------------------------------------------------------------
  // function mergeObject() {
  //   mergeObject = Object.assign || function mergeObject(t) {
  //     for (var s, i=1, n=arguments.length; i<n; i++) {
  //       s = arguments[i];
  //       for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
  //       }
  //       return t;
  //   };

  //   return mergeObject.apply(this, arguments);
  // } // END mergeObject

  // ---------------------------------------------------------------------------
  // processOnVideoStart(trackID, player, startSec)
  //
  // ---------------------------------------------------------------------------
  function processOnVideoStart(player, startSec) {
    var currentVolume, playlist, playerID,
        videoID, songIndex, trackID;

    playlist  = activeVideoElement.playlist;
    playerID  = activeVideoElement.playerID;
    videoID   = player.options.videoId;
    songIndex = activeVideoElement.index;
    trackID   = songIndex + 1;

    // seek video to START position
    ytpSeekTo(player, startSec, true);

    // fade-in audio (if enabled)
    if (playerFadeAudioIn) {
      currentVolume = player.getVolume();
      isDev && logger.debug('\n' + `FADE-IN audio on StateChange at trackID|VideoID: ${trackID}|${videoID} at ${currentVolume}%`);
      ytpFadeInAudio({
        playerID:     playerID,
        targetVolume: currentVolume,
        speed:        playerFadeAudioSpeed
      });
    } // END if playerFadeAudio

  } // END processOnVideoStart

  // ---------------------------------------------------------------------------
  // processOnVideoEnd(player)
  //
  // TODO: 
  // ---------------------------------------------------------------------------
  function processOnVideoEnd(player) {
    var currentVideoTime, activeSong,
        playlist, playerID, songIndex, songs, playlistRepeat,
        trackID, activeVideoID, previousVideoID, isVideoChanged;

    activeSong          = getActiveSong();
    playlist            = activeVideoElement.playlist;
    playerID            = activeVideoElement.playerID;
    currentVideoTime    = player.getCurrentTime();
    previousVideoID     = player.options.videoId;
    activeVideoID       = activeVideoElement.videoID;
    songIndex           = activeVideoElement.index;
    trackID             = songIndex + 1;
    songs               = activeVideoElement.songs;
    playlistRepeat      = songs[songIndex].repeat === 'true';

    // check if video is changed (to detect multiple videoIDs in playlist)
    if (songIndex > 0) {
      isVideoChanged = previousVideoID !== activeVideoID;
    } else {
      isVideoChanged = true;
    }

    // fade-out audio (if enabled)
    if (isVideoChanged && playerFadeAudioOut) {
      isDev && logger.debug('\n' + `FADE-OUT audio on processOnVideoEnd at trackID|VideoID: ${trackID}|${activeVideoID}`);
      ytpFadeOutAudio({
        playerID:     playerID,
        speed:        playerFadeAudioSpeed
      });
    } // END if playerFadeAudio

    if (isVideoChanged) {
      if (songIndex === songs.length - 1) {
        // LAST index reached, continue on FIRST index
        songIndex = 0;

        isDev && logger.debug('\n' + `LOAD first VIDEO on processOnVideoEnd at trackID|playlist: ${trackID}|${playlist}`);
        loadVideo(playlist, songIndex);

        // check if REPEAT is enabled on PLAYLIST
        if (!playlistRepeat) {
          // set FIRST song (video) paused if playing is continued
          ytPlayer.pauseVideo();
        } 
      } else {
        // load next video
        isDev && logger.debug('\n' + `LOAD next VIDEO on processOnVideoEnd at trackID|playlist: ${trackID}|${playlist}`);
        loadVideo(playlist, songIndex + 1);
      }
    } else {
      // skip loading next video if a SINGLE video is used for playlist
      isDev && logger.debug('\n' + `LOAD next TRACK in video on processOnVideoEnd at trackID|playlist: ${trackID}|${playlist}`);
    }

  } // END processOnVideoEnd  

  // ---------------------------------------------------------------------------
  // doNothingOnStateChange(state)
  //
  // wrapper for states that are not processed
  // ---------------------------------------------------------------------------
  function doNothingOnStateChange(state) {
    // J1 Amplitude optimizations #1
    // BUG FIX: The original branched on `state > 0` and -- in the else --
    // logged `YT_PLAYER_STATE_NAMES[6]` (which is "unstarted"). That meant
    // any non-positive state (including 0 = ENDED) was logged as "unstarted",
    // which is misleading. Now that YT_PLAYER_STATE_NAMES has a proper "-1"
    // key (see Fix #1), a single direct lookup with a fallback is enough
    // and produces the correct label for every documented YT state.
    //
    var stateName = YT_PLAYER_STATE_NAMES[state] || ('unknown(' + state + ')');
    isDev && logger.debug('\n' + `DO NOTHING on StateChange for state: ${stateName}`);
  } // END doNothingOnStateChange

  // ---------------------------------------------------------------------------
  // processOnStateChangePlaying()
  //
  // wrapper for processing players on state PLAYING 
  // ---------------------------------------------------------------------------
  function processOnStateChangePlaying(event, playlist, songIndex) {
    // J1 Amplitude optimizations #1
    // BUG FIX: The original `var` block re-declared `songIndex`, `ytPlayer`
    // and `songs` -- each of which was either a function parameter
    // (songIndex) or the name of a separate variable on the same line.
    // With `var` this is legal but creates confusing shadowing where the
    // parameter and the local share the same identifier. The local
    // declarations are removed; the parameter stays authoritative until
    // it is reassigned from `activeSong.index` further down.
    //
    var activeSong, activePlaylist,
        playerID, videoID, firstVideo,
        previousSongIndex,
        currentPlayer, previousPlayer,
        trackID, isSongIndexChanged;
    var ytPlayer, songs;

    ytPlayer   = event.target;
    // J1 Amplitude optimizations #1
    // CLARITY: `(songIndex > 0) ? false : true` is `songIndex <= 0`.
    firstVideo = songIndex <= 0;

    activeSong      = getActiveSong();
    activePlaylist  = playlist;
    playerID        = activeSong.playerID;
    videoID         = activeSong.videoID;
    songs           = activeSong.songs;
    songIndex       = activeSong.index;
    currentPlayer   = activeSong.player;
//  previousPlayer  = j1.adapter.amplitude.data.ytPlayers[playerID].player
    trackID         = songIndex + 1;

    isDev && logger.debug('\n' + `PLAY audio on YT Player at playlist|trackID: ${activePlaylist}|${trackID}`);

    // save YT player GLOBAL data for later use (e.g. events)
    // Fix Amplitude plugin #2
    // Original (deprecated, preserved for reference):
    // j1.adapter.amplitude.data.activePlayer              = 'ytp';
    // j1.adapter.amplitude.data.ytpGlobals['activeIndex'] = songIndex;
    // j1.adapter.amplitude.data.ytpGlobals['videoID']     = videoID;
    ytpHostData().activePlayer              = 'ytp';
    ytpHostData().ytpGlobals['activeIndex'] = songIndex;
    ytpHostData().ytpGlobals['videoID']     = videoID;

    // save YT player data for later use (e.g. events)
    // -------------------------------------------------------------------------
    // Fix AudioPlayer #3
    // Original (deprecated, preserved for reference):
    // j1.modules.amplitudejs.data.activePlayer = 'ytp';
    // j1.modules.amplitudejs.data.activeIndex = songIndex;
    // j1.modules.amplitudejs.data.activePlaylist = playlist;
    // j1.modules.amplitudejs.data.ytp.activePlayer = ytPlayer;
    // j1.modules.amplitudejs.data.ytp.activeIndex = songIndex;
    // j1.modules.amplitudejs.data.ytp.activePlaylist = playlist;
    // j1.modules.amplitudejs.data.ytp.players[playerID].activeIndex = songIndex;
    // j1.modules.amplitudejs.data.ytp.players[playerID].player = ytPlayer;
    // j1.modules.amplitudejs.data.ytp.players[playerID].videoID = videoID;
    ytpHostModuleData().activePlayer = 'ytp';
    ytpHostModuleData().activeIndex = songIndex;
    ytpHostModuleData().activePlaylist = playlist;
    ytpHostModuleYtp().activePlayer = ytPlayer;
    ytpHostModuleYtp().activeIndex = songIndex;
    ytpHostModuleYtp().activePlaylist = playlist;
    ytpHostModuleYtp().players[playerID].activeIndex = songIndex;
    ytpHostModuleYtp().players[playerID].player = ytPlayer;
    ytpHostModuleYtp().players[playerID].videoID = videoID;

    // update time container for the ACTIVE video
    // -----------------------------------------------------------------
    // J1 Amplitude optimizations #1
    // BUG FIX (memory leak): The original code created TWO new setInterval
    // handlers every time the player transitioned to PLAYING, but never
    // cleared the previous ones. After enough state transitions, dozens
    // (then hundreds) of timers would run in parallel, each calling
    // updateCurrentTimeContainerYTP / updateProgressBarsYTP twice per
    // second, scanning the DOM by class name on every tick.
    //
    // We now keep module-level handles to the running intervals and clear
    // them before installing fresh ones. The handles are stored on
    // j1.adapter.amplitude.data so they survive across calls without
    // leaking to the global scope.
    //
    // Fix Amplitude plugin #2
    // Original (deprecated, preserved for reference):
    // var intervals = j1.adapter.amplitude.data.ytpIntervals
    // || (j1.adapter.amplitude.data.ytpIntervals = {});
    var intervals = ytpHostData().ytpIntervals
                  || (ytpHostData().ytpIntervals = {});

    if (intervals.currentTime) { clearInterval(intervals.currentTime); }
    if (intervals.progressBar) { clearInterval(intervals.progressBar); }

    intervals.currentTime = setInterval(function() {
      updateCurrentTimeContainerYTP(ytPlayer, playlist);
    }, 500);

    intervals.progressBar = setInterval(function() {
      updateProgressBarsYTP();
    }, 500);

    // update meta data
    ytpUpdatMetaContainers(activeSong);    

    // check|process video for configured START position (if set)
    // -------------------------------------------------------------------------
    var songStartSec = activeSong.startSec;
    if (songStartSec) {
      // Fix Amplitude plugin #2
      // Original (deprecated, preserved for reference):
      // var tsStartSec      = j1.adapter.amplitude.seconds2timestamp(songStartSec);
      var tsStartSec      = ytpHost().seconds2timestamp(songStartSec);
      var songCurrentTime = ytPlayer.getCurrentTime();

      if (songCurrentTime < songStartSec) {
        isDev && logger.debug('\n' + `START video on StateChange at trackID|timestamp: ${trackID}|${tsStartSec}`);
        processOnVideoStart(ytPlayer, songStartSec);
      }
    } // END if songStartEnabled

    // check|process video for configured END position (if set)
    // -------------------------------------------------------------------------
    var songEndSec = activeSong.endSec;
    if (songEndSec) {
      // Fix Amplitude plugin #2
      // Original (deprecated, preserved for reference):
      // var tsEndSec = j1.adapter.amplitude.seconds2timestamp(songEndSec);
      var tsEndSec = ytpHost().seconds2timestamp(songEndSec);

      var checkOnVideoEnd = setInterval(function() {
        var songCurrentTime = ytPlayer.getCurrentTime();

        if (songCurrentTime >= songEndSec) {
          isDev && logger.debug('\n' + `STOP video on StateChange at trackID|timestamp: ${trackID}|${tsEndSec}`);
          processOnVideoEnd(ytPlayer);

          clearInterval(checkOnVideoEnd);
        } // END if currentVideoTime
      }, 500); // END checkOnVideoEnd
    } // END if songEndEnabled

    // stop active AT|YT players running in parallel except the current
    ytpStopParallelActivePlayers(playerID);

    // clear button MINI PlayerPlayPause (AT player)
    var buttonPlayerPlayPauseMini = document.getElementsByClassName("mini-player-play-pause");
    for (var i=0; i<buttonPlayerPlayPauseMini.length; i++) {
      var htmlElement = buttonPlayerPlayPauseMini[i];

      // toggle classes on state playing
      if (htmlElement.dataset.amplitudeSource === 'audio') {
        if (htmlElement.classList.contains('amplitude-playing')) {        
          htmlElement.classList.remove('amplitude-playing');
          htmlElement.classList.add('amplitude-paused');
        }
      }
  
    } // END for MINI buttonPlayerPlayPause

    // clear button COMPACT PlayerPlayPause (AT player)
    var buttonPlayerPlayPauseCompact = document.getElementsByClassName("compact-player-play-pause");
    for (var i=0; i<buttonPlayerPlayPauseCompact.length; i++) {
      var htmlElement = buttonPlayerPlayPauseCompact[i];
      
      // toggle classes on state playing
      if (htmlElement.dataset.amplitudeSource === 'audio') {
        if (htmlElement.classList.contains('amplitude-playing')) {
          htmlElement.classList.remove('amplitude-playing');
          htmlElement.classList.add('amplitude-paused');
        }
      }
  
    } // END for COMACT buttonPlayerPlayPause

    // clear button LARGE PlayerPlayPause (AT player)
    var buttonPlayerPlayPauseLarge = document.getElementsByClassName("large-player-play-pause");
    for (var i=0; i<buttonPlayerPlayPauseLarge.length; i++) {
      var htmlElement = buttonPlayerPlayPauseLarge[i];

      // toggle classes on state playing
      if (htmlElement.dataset.amplitudeSource === 'audio') {
        if (htmlElement.classList.contains('amplitude-playing')) {
          htmlElement.classList.remove('amplitude-playing');
          htmlElement.classList.add('amplitude-paused');
        }
      }

    } // END for LARGE buttonPlayerPlayPause

  } // END processOnStateChangePlaying

  // ---------------------------------------------------------------------------
  // processOnStateChangeEnded()
  //
  // Fix J1 Amplitude playerID #1
  // playerID is no longer derived from the playlist name. The (configured)
  // player ID (YAML key "id") is passed by the caller
  // {{player.id}}OnPlayerStateChange as an additional parameter.  
  // ---------------------------------------------------------------------------
  function processOnStateChangeEnded(event, playerID, playlist, songIndex) {
    var videoID         = event.target.options.videoId;
    var trackID         = songIndex + 1;
    // Fix Amplitude plugin #2
    // Original (deprecated, preserved for reference):
    // var songs           = j1.adapter.amplitude.data.ytPlayers[playerID].songs;
    var songs           = ytpHostData().ytPlayers[playerID].songs;
    var songMetaData    = songs[songIndex];
    var playlistRepeat  = songMetaData.repeat === 'true';
 
    if (songIndex === songs.length - 1) {
      // LAST index reached, continue on FIRST index
      songIndex = 0;

      // save player current time data for later use
      // ytPlayerCurrentTime = ytPlayer.getCurrentTime();

      // save YT player data for later use (e.g. events)
      // -----------------------------------------------------------------------
      // Fix AudioPlayer #3
      // Original (deprecated, preserved for reference):
      // j1.modules.amplitudejs.data.ytp.previousIndex = songIndex;
      ytpHostModuleYtp().previousIndex = songIndex;

      logger.debug('\n' + `LOAD first VIDEO on processOnStateChangeEnded at trackID|playlist: ${trackID}|${playlist}`);
      loadVideo(playlist, songIndex);

      // check if REPEAT is enabled on PLAYLIST
      if (!playlistRepeat) {
        // set FIRST song (video) paused if playing is continued
        ytPlayer.pauseVideo();
      } 
    } else {
      // save player current time data for later use
      // ytPlayerCurrentTime = ytPlayer.getCurrentTime();

      // save YT player data for later use (e.g. events)
      // -----------------------------------------------------------------------
      // Fix AudioPlayer #3
      // Original (deprecated, preserved for reference):
      // j1.modules.amplitudejs.data.ytp.previousIndex = songIndex;
      ytpHostModuleYtp().previousIndex = songIndex;

      // load next video
      isDev && logger.debug('\n' + `LOAD next VIDEO on processOnStateChangeEnded at trackID|playlist: ${trackID}|${playlist}`);
      loadVideo(playlist, songIndex + 1);
    }

  } // END processOnStateChangeEnded

  // ---------------------------------------------------------------------------
  // getSongIndex(songArray, videoID)
  //
  // TODO: Extend getSongIndex() for singleAudio
  // ---------------------------------------------------------------------------
  function getSongIndex(songArray, videoID) {
    var index;

    for (var i=0; i<songArray.length; i++) {
      if (songArray[i].url.includes(videoID)) {
        index = songArray[i].index;
        break;
      }
    }

    return index;
  }

  // ---------------------------------------------------------------------------
  // addNestedProperty
  //
  // Add property path dynamically to an existing object
  // Example: addNestedProperty(j1.adapter.amplitude.data, 'playlist.profile.name', 'Max Mustermann')
  // ---------------------------------------------------------------------------  
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

  // ---------------------------------------------------------------------------
  // setNestedProperty
  // ---------------------------------------------------------------------------
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

  // ---------------------------------------------------------------------------
  // addNestedObject
  //
  // Add (nested) object dynamically to an existing object
  // Example: createNestedObject(myObject, ['level1', 'arrayProperty', 0], 'element1');  
  // ---------------------------------------------------------------------------
  function addNestedObject(obj, path, value) {
    const lastKey = path[path.length - 1];
    let current = obj;
  
    path.slice(0, -1).forEach(key => {
      current[key] = current[key] || {};
      current = current[key];
    });
  
    current[lastKey] = value;
  }

  // ---------------------------------------------------------------------------
  // ytpFadeInAudio
  // ---------------------------------------------------------------------------
  function ytpFadeInAudio(params) {
    const cycle = 1;
    var   settings, currentStep, steps, sliderID, volumeSlider;

    // J1 Amplitude optimizations #1
    // BUG FIX: `params.targetVolume = 50` is an ASSIGNMENT, not a default.
    // It always wrote 50 back into params.targetVolume regardless of the
    // value the caller passed in (e.g. `currentVolume` from
    // processOnVideoStart). The result is that fade-in always faded to 50%
    // and ignored the caller's target. Same bug below for `speed`.
    // Replaced with the nullish-coalescing-as-default idiom.
    //
    settings = {
      playerID:     params.playerID,
      targetVolume: (params.targetVolume != null) ? params.targetVolume : 50,
      speed:        params.speed || 'default'
    };

    // number of iteration steps to INCREASE the players volume on fade-in
    // NOTE: number of steps controls how long and smooth the fade-in 
    // transition will be
    //
    const iterationSteps = {
      'default':  150,
      'slow':     250,
      'slower':   350,
      'slowest':  500
    };

    sliderID      = 'volume_slider_' + settings.playerID;
    volumeSlider  = document.getElementById(sliderID);
    steps         = iterationSteps[settings.speed];
    currentStep   = 1;

    if (volumeSlider === undefined || volumeSlider === null) {
      isDev && logger.warn('\n' + `no volume slider found at playerID: ${settings.playerID}`);
      return;
    }

    // Start the players volume muted
    ytPlayer.setVolume(0);

    const fadeInInterval = setInterval(() => {
      const newVolume = settings.targetVolume * (currentStep / steps);

      ytPlayer.setVolume(newVolume);
      volumeSlider.value = newVolume;
      currentStep++;

      (currentStep > steps) && clearInterval(fadeInInterval);
    }, cycle);

  } // END ytpFadeInAudio

  // ---------------------------------------------------------------------------
  // ytpFadeOutAudio
  // ---------------------------------------------------------------------------
  function ytpFadeOutAudio(params) {
    const cycle = 1;
    var   settings, currentStep, steps, newVolume, startVolume,
          playerID, sliderID, volumeSlider;

    // J1 Amplitude optimizations #1
    // BUG FIX: Same defaulting bug as in ytpFadeInAudio --
    // `params.speed = 'default'` was overwriting the caller's choice
    // every call. Use a real default expression instead.
    //
    settings =  {
      playerID:   params.playerID,
      speed:      params.speed || 'default'
    };

    // number of iteration steps to DECREASE the volume
    const iterationSteps = {
      'default':  150,
      'slow':     250,
      'slower':   350,
      'slowest':  500
    };

    sliderID      = 'volume_slider_' + settings.playerID;
    volumeSlider  = document.getElementById(sliderID);
    startVolume   = ytPlayer.getVolume();
    steps         = iterationSteps[settings.speed];
    currentStep   = 0;

    if (volumeSlider === undefined || volumeSlider === null) {
      isDev && logger.warn('\n' + `no volume slider found at playerID: ${settings.playerID}`);
      return;
    }

    const fadeOutInterval = setInterval(() => {
      newVolume = startVolume * (1 - currentStep / steps);

      ytPlayer.setVolume(newVolume);
      volumeSlider.value = newVolume;
      currentStep++;

      (currentStep > steps) && clearInterval(fadeOutInterval);
    }, cycle);

  } // END ytpFadeOutAudio

  // ---------------------------------------------------------------------------
  // initYtAPI
  //
  // load YT Iframe player API
  // ---------------------------------------------------------------------------
  function initYtAPI() {
    startTimeModule = Date.now();

    isDev && logger.info('\n' + 'Initialize plugin|tech (ytp) : started');

    // Fix AudioPlayer #4
    // BUG FIX: The YT iframe API invokes the global callback
    // window.onYouTubeIframeAPIReady exactly ONCE, at the moment the
    // widget API has finished loading. On pages that load the VideoJS
    // YouTube tech as well (resource 'videojs', e.g. page audioPlayer.adoc),
    // that tech loads the YT iframe API INDEPENDENTLY (via its own script
    // 'onload' handler and YT.ready(), NOT via the global callback). On a
    // BROWSER RELOAD, the API scripts are served from the HTTP cache and
    // finish BEFORE this plugin is injected by the adapter: the one-time
    // global callback fires while onYouTubeIframeAPIReady does not exist
    // yet, and is never fired again. Re-injecting the API script below
    // does NOT help: the loader stub sees YT.loading === 1 and exits.
    // Result: the plugin logged 'started' and stalled forever.
    //
    // FIX: If the YT API loader stub is ALREADY present (window.YT with
    // its YT.ready function), do NOT inject the script again. Register
    // the configuration via YT.ready() instead, which works in ALL load
    // states: the callback is queued while the API is still loading and
    // invoked immediately when the API has already finished loading.
    // The run-once guard in onYouTubeIframeAPIReady prevents a double
    // configuration when the global callback fires as well.
    //
    // Pages WITHOUT a second YT API consumer (e.g. page audio_data.adoc,
    // resources [amplitude, amplitudejs]) never enter this branch and
    // behave UNCHANGED.
    if (window.YT && typeof window.YT.ready === 'function') {
      isDev && logger.info('\n' + 'YT iframe API already loaded by another module, register via YT.ready');
      window.YT.ready(onYouTubeIframeAPIReady);
      return;
    }

    // Load YT IFrame Player API asynchronously
    // -------------------------------------------------------------------------
    var tag         = document.createElement('script');
    tag.src         = "//youtube.com/iframe_api";
    firstScriptTag  = document.getElementsByTagName('script')[0];

    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  }

  // ---------------------------------------------------------------------------
  // loadVideo(list, index)
  //
  // load next video in playlist
  // ---------------------------------------------------------------------------
  function loadVideo(currentPlaylist, currentIndex) {
    var activeSong, trackID, songName,
        playlist, playerID, playerIFrame,
        songs, songIndex, songMetaData, songURL,
        ytpVideoID, firstVideo, playlistRepeat;

    activeSong      = getActiveSong();
    playlist        = currentPlaylist;
    playerID        = activeSong.playerID;
    songs           = activeSong.songs;
    playlistRepeat  = songs[currentIndex].repeat === 'true';
    ytPlayer        = activeSong.player;
    songIndex       = currentIndex;
    trackID         = songIndex + 1;
    
    // switch|play to songIndex in playlist
    if (songIndex <= songs.length - 1) {
      songMetaData  = songs[songIndex];
      songURL       = songMetaData.url;
      ytpVideoID    = songURL.split('=')[1];

      // save YT player data for later use (e.g. events)
      // Fix Amplitude plugin #2
      // Original (deprecated, preserved for reference):
      // j1.adapter.amplitude.data.ytPlayers[playerID].activeIndex = songIndex;
      // j1.adapter.amplitude.data.ytPlayers[playerID].videoID     = ytpVideoID;
      ytpHostData().ytPlayers[playerID].activeIndex = songIndex;
      ytpHostData().ytPlayers[playerID].videoID     = ytpVideoID;

      // save YT player data for later use (e.g. events)
      // -----------------------------------------------------------------------
      // Fix AudioPlayer #3
      // Original (deprecated, preserved for reference):
      // j1.modules.amplitudejs.data.ytp.previousSongIndex = songIndex;
      // j1.modules.amplitudejs.data.ytp.players[playerID].activeIndex = songIndex;
      // j1.modules.amplitudejs.data.ytp.players[playerID].previousIndex = songIndex - 1;
      // j1.modules.amplitudejs.data.ytp.players[playerID].videoID = ytpVideoID;
      ytpHostModuleYtp().previousSongIndex = songIndex;
      ytpHostModuleYtp().players[playerID].activeIndex = songIndex;
      ytpHostModuleYtp().players[playerID].previousIndex = songIndex - 1;
      ytpHostModuleYtp().players[playerID].videoID = ytpVideoID;

      isDev && logger.debug('\n' + `SWITCH video on loadNextVideo at trackID|VideoID: ${trackID}|${ytpVideoID}`);
      ytPlayer.loadVideoById(ytpVideoID);
     
      // delay after switch video
      if (muteAfterVideoSwitchInterval) {
        ytPlayer.mute();
        setTimeout(() => {
          ytPlayer.unMute();
        }, muteAfterVideoSwitchInterval);
      }

      // save YT player data for later use (e.g. events)
      // -----------------------------------------------------------------------
      ytpSongIndex = songIndex;
      // Fix AudioPlayer #3
      // Original (deprecated, preserved for reference):
      // j1.modules.amplitudejs.data.ytp.songIndex = songIndex;
      ytpHostModuleYtp().songIndex = songIndex;

      // load the song cover image
      loadCoverImage(songMetaData);

      // update meta data
      // ytpUpdatMetaContainers(songMetaData);
  
      // set song (video) active at index in playlist
      setSongActive(playlist, songIndex);

      // reset progress bar settings
      resetProgressBarYTP();

      // scroll song active at index in player
      if (playerAutoScrollSongElement) {
        scrollToActiveElement(playlist);
      }

    } // END if songIndex

  } // END loadNextVideo

  // ---------------------------------------------------------------------------
  // initUiEventsForAJS
  //
  // setup YTPlayerUiEvents for AJS players  
  // ---------------------------------------------------------------------------
  function initUiEventsForAJS() {

    var dependencies_ytp_ready = setInterval (() => {
      // Fix Amplitude plugin #2
      // Original (deprecated, preserved for reference):
      // var ytApiReady    = (j1.adapter.amplitude.data.ytpGlobals['ytApiReady']    !== undefined) ? j1.adapter.amplitude.data.ytpGlobals['ytApiReady']    : false;
      // var ytPlayerReady = (j1.adapter.amplitude.data.ytpGlobals['ytPlayerReady'] !== undefined) ? j1.adapter.amplitude.data.ytpGlobals['ytPlayerReady'] : false;
      var ytApiReady    = (ytpHostData().ytpGlobals['ytApiReady']    !== undefined) ? ytpHostData().ytpGlobals['ytApiReady']    : false;
      var ytPlayerReady = (ytpHostData().ytpGlobals['ytPlayerReady'] !== undefined) ? ytpHostData().ytpGlobals['ytPlayerReady'] : false;

      if (ytApiReady && ytPlayerReady) {

        // Fix Amplitude plugin #1
        // The players are NO LONGER unrolled at BUILD time from the control
        // settings of the amplitude module. They are taken at RUNTIME from
        // the options hash passed in by the calling module.
        //
        // Original (deprecated, preserved for reference; kept verbatim
        // inside a Liquid comment block so the Liquid tags are NOT
        // evaluated):
        {% comment %}
          {% for player in amplitude_control.players %}{% if player.enabled %}

            {% if player.source == empty %}
              {% assign player_source = amplitude_default.player.source %}
            {% else %}
              {% assign player_source = player.source %}
            {% endif %}

            {% if player_source == 'video' %}
            playerID = '{{player.id}}';
            mimikYTPlayerUiEventsForAJS(playerID);
            {% endif %}

          {% endif %}{% endfor %}
        {% endcomment %}

        var videoPlayers = ytpVideoPlayers();
        for (var i = 0; i < videoPlayers.length; i++) {
          playerID = videoPlayers[i].id;
          mimikYTPlayerUiEventsForAJS(playerID);
        }

        clearInterval(dependencies_ytp_ready);
        isDev && logger.info('\n' + 'Initialize APIPlayers : ready');
      } // END if ready

    }, 10); // END dependencies_ytp_ready

  } // END initUiEventsForAJS()

  // ---------------------------------------------------------------------------
  // onYouTubeIframeAPIReady
  // Create a player after Iframe player API is ready to use
  // ---------------------------------------------------------------------------
  function onYouTubeIframeAPIReady() {
    // Fix AudioPlayer #4
    // Run-once guard: this function is a GLOBAL of the page (top-level
    // function declaration in a classic script) and is additionally
    // registered via YT.ready() in initYtAPI when the YT iframe API was
    // loaded by another module. If BOTH paths fire (API still loading at
    // plugin start), the SECOND invocation must be a no-op.
    if (ytpApiReadyProcessed) {
      isDev && logger.debug('\n' + 'onYouTubeIframeAPIReady: players already configured, skipped');
      return;
    }
    ytpApiReadyProcessed = true;

    ytApiReady = true;

    // Fix Amplitude plugin #1
    // The players are NO LONGER unrolled at BUILD time from the (merged)
    // amplitude config files. They are taken at RUNTIME from the options
    // hash passed in by the calling module (see resolvePluginOptions), and
    // each player is configured by configureYtPlayer().
    //
    // Original (deprecated, preserved for reference; kept verbatim inside a
    // Liquid comment block so the Liquid tags are NOT evaluated):
    {% comment %}
        {% for player in amplitude_options.players %}{% if player.enabled and player.source == 'video' %}
          {% capture xhr_container_id %}{{player.id}}_audio{% endcapture %}

          {% if player.source == empty %}
            {% assign player_source = amplitude_default.player.source %}
          {% else %}
            {% assign player_source = player.source %}
          {% endif %}

          {% if player_source != 'video' %}
            {% continue %}
          {% else %}

            // J1 Amplitude optimizations #2
            // jadams, set|overload player settings
            var player = $.extend({}, {{player | replace: 'nil', 'null' | replace: '=>', ':' }}, {{amplitude_defaults | replace: 'nil', 'null' | replace: '=>', ':' }});

            // load players of type 'video' configured in current page
            // -----------------------------------------------------------------
            playerExistsInPage = $('#' + '{{xhr_container_id}}')[0] !== undefined;
            if (playerExistsInPage) { 
              var playerSettings     = $.extend({}, {{player | replace: 'nil', 'null' | replace: '=>', ':' }});
              var songs              = Amplitude.getSongsStatePlaylist(playerSettings.playlist.name);         
              var activeSongMetadata = songs[0];
              var playerType         = playerSettings.type

              // increase number of found players in page by one
              playerCounter++;     

              // load individual player settings (to manage multiple players in page)
              //
              var ytpAutoPlay = ('{{player.yt_player.autoplay}}'.length > 0) ? '{{player.yt_player.autoplay}}'  : '{{amplitude_default.player.yt_player.autoplay}}';
              var ytpLoop     = ('{{player.yt_player.loop}}'.length > 0)     ? '{{player.yt_player.loop}}'      : '{{amplitude_default.player.yt_player.loop}}';
              var ytpHeight   = ('{{player.yt_player.height}}'.length > 0)   ? '{{player.yt_player.height}}'    : '{{amplitude_default.player.yt_player.height}}';
              var ytpWidth    = ('{{player.yt_player.width}}'.length > 0)    ? '{{player.yt_player.width}}'     : '{{amplitude_default.player.yt_player.width}}';

              // claude - optimize J1 third-party cookies #1
              // Per-player privacy-enhanced mode for the (hidden) YT video
              // iframe. Resolution order: per-player YAML key
              // yt_player.privacy_enhanced <- default settings
              // amplitude_default.player.yt_player.privacy_enhanced <- hard
              // default 'true' (privacy-enhanced host) when the key is absent
              // in both YAML layers. NOTE: Liquid renders missing keys as an
              // empty string, hence the length checks.
              // var ytpPrivacy  = ('{{player.yt_player.privacy_enhanced}}'.length > 0) ? '{{player.yt_player.privacy_enhanced}}' : (('{{amplitude_default.player.yt_player.privacy_enhanced}}'.length > 0) ? '{{amplitude_default.player.yt_player.privacy_enhanced}}' : 'true');
              var ytpPrivacy          = {{amplitude_default.player.yt_player.privacy_enhanced}};
              var privacyEnhancedHost = (ytpPrivacy) ? 'https://www.youtube-nocookie.com' : 'https://youtube.com';

              isDev && logger.info('\n' + 'AJS YouTube iFrame API: ready');
              isDev && logger.info('\n' + 'configure player on ID: #{{player.id}}');

              // create a (hidden) ytp iframe container (video)
              //
              ytpContainer                = document.getElementById('{{player.id}}_video');
              ytpContainer.innerHTML      = '<div id="iframe_{{player.id}}"></div>';
              ytpContainer.style.cssText  = 'display:none';

              var ytpVideoID = (ytPlayerErrorTest) ? 'invalidVideoID' : activeSongMetadata.url.split('=')[1];
              ytPlayer = new YT.Player('iframe_{{player.id}}', {
                // claude - optimize J1 third-party cookies #1
                // Serve the (hidden) YT video iframe from the privacy-enhanced
                // host www.youtube-nocookie.com. The classic host
                // youtube.com sets several third-party cookies already on
                // page load, which Chrome/Lighthouse flags in the "Best Practices" 
                // audit ("Uses third-party cookies") and logs to the DevTools
                // Issues panel. Configurable per player via the YAML key
                // yt_player.privacy_enhanced (default: true).
                host:               privacyEnhancedHost,
                height:             ytpHeight,
                width:              ytpWidth,
                videoId:            ytpVideoID,
                playerVars: {
                  autoplay:         ytpAutoPlay,
                  loop:             ytpLoop
                },
                events: {
                  'onReady':        {{player.id}}OnPlayerReady,
                  'onStateChange':  {{player.id}}OnPlayerStateChange,
                  'onError':        {{player.id}}OnPlayerErrors
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
              // Fix Amplitude plugin #2
              // Original (deprecated, preserved for reference):
              // addNestedProperty(j1.adapter.amplitude.data.ytPlayers, '{{player.id}}', playerProperties);
              addNestedProperty(ytpHostData().ytPlayers, '{{player.id}}', playerProperties);

              // save YT player GLOBAL data for later use (e.g. events)
              // Fix Amplitude plugin #2
              // Original (deprecated, preserved for reference):
              // j1.adapter.amplitude.data.ytpGlobals['ytApiReady'] = ytApiReady;
              ytpHostData().ytpGlobals['ytApiReady'] = ytApiReady;

              // save amplitudejs data for later use (e.g. events)
              // ---------------------------------------------------------------
              // Fix AudioPlayer #3
              // Original (deprecated, preserved for reference):
              // j1.modules.amplitudejs.data.ytp.apiReady = ytApiReady;
              ytpHostModuleYtp().apiReady = ytApiReady;

              // reset current player
              playerExistsInPage = false;

            } // END if playerExistsInPage()

            // AJS YouTube Player errors fired by the YT API
            // -----------------------------------------------------------------
            function {{player.id}}OnPlayerErrors(event) {
              var eventData, ytPlayer, videoID;

              eventData = event.data;
              ytPlayer  = event.target;
              videoID   = ytPlayer.options.videoId;

              logger.error('\n' + `YT API Error '${YT_PLAYER_ERROR_NAMES[eventData]}' for VideoID: '${videoID}'`);

              // save YT player GLOBAL data for later use (e.g. events)
              // Fix Amplitude plugin #2
              // Original (deprecated, preserved for reference):
              // j1.adapter.amplitude.data.ytpGlobals['ytApiError'] = eventData;
              ytpHostData().ytpGlobals['ytApiError'] = eventData;

              // save amplitudejs data for later use (e.g. events)
              // ---------------------------------------------------------------
              // Fix AudioPlayer #3
              // Original (deprecated, preserved for reference):
              // j1.modules.amplitudejs.data.ytp.apiError = eventData;
              ytpHostModuleYtp().apiError = eventData;

            }

            // AJS YouTube Player initialization fired by the YT API
            // -----------------------------------------------------------------
            function {{player.id}}OnPlayerReady(event) {

              // J1 Amplitude optimizations #2
              // jadams, set|overload player settings
              var player = $.extend({}, {{player | replace: 'nil', 'null' | replace: '=>', ':' }}, {{amplitude_defaults | replace: 'nil', 'null' | replace: '=>', ':' }});

              var hours, minutes, seconds,
                  ytPlayer, ytPlayerReady, playerVolumePreset,
                  playListName, songsInPlaylist, titleListLargePlayer;

              ytPlayer            = event.target;
              ytPlayerReady       = true;
              playerVolumePreset  = parseInt({{amplitude_default.player.volume_slider.preset_value}});

              isDev && logger.debug('\n' + `FOUND video ready at ID: {{player.id}}`);

              // set video playback quality to a minimum
              ytPlayer.setPlaybackQuality('small');

              // set configured player volume preset
              ytPlayer.setVolume(playerVolumePreset);

              // enable|disable scrolling on playlist
              // ---------------------------------------------------------------
              if (document.getElementById('large_player_right') !== null) {

                // show|hide scrollbar in playlist
                // -------------------------------------------------------------
                // Fix Amplitude plugin #2
                // Original (deprecated, preserved for reference):
                // playListName          = j1.adapter.amplitude.data.ytPlayers.{{player.id}}.playerSettings.playlist.name;
                playListName          = ytpHostData().ytPlayers.{{player.id}}.playerSettings.playlist.name;
                songsInPlaylist       = Amplitude.getSongsInPlaylist(playListName);
                titleListLargePlayer  = document.getElementById('large_player_title_list_' + playListName);

                if (songsInPlaylist.length <= playerScrollerSongElementMin) {
                  if (titleListLargePlayer !== null) {
                    titleListLargePlayer.classList.add('hide-scrollbar');
                  }
                }
              }

              isDev && logger.info('\n' + 'yt player on ID {{player.id}}: ready');

              // save YT player GLOBAL data for later use (e.g. events)
              // Fix Amplitude plugin #2
              // Original (deprecated, preserved for reference):
              // j1.adapter.amplitude.data.ytpGlobals['ytPlayerReady'] = ytPlayerReady;
              // j1.adapter.amplitude.data.ytpGlobals['ytApiError']    = 0;          
              ytpHostData().ytpGlobals['ytPlayerReady'] = ytPlayerReady;
              ytpHostData().ytpGlobals['ytApiError']    = 0;          

              // save amplitudejs data for later use (e.g. events)
              // ---------------------------------------------------------------
              // Fix AudioPlayer #3
              // Original (deprecated, preserved for reference):
              // j1.modules.amplitudejs.data.ytp.apiError                          = 0;
              // j1.modules.amplitudejs.data.ytp.players.{{player.id}}             = {};
              // j1.modules.amplitudejs.data.ytp.players.{{player.id}}.playerReady = ytPlayerReady;
              ytpHostModuleYtp().apiError                          = 0;
              ytpHostModuleYtp().players.{{player.id}}             = {};
              ytpHostModuleYtp().players.{{player.id}}.playerReady = ytPlayerReady;

              // J1 Amplitude optimizations #2
              // jadams, set|overload player settings
              var player = $.extend({}, {{player | replace: 'nil', 'null' | replace: '=>', ':' }}, {{amplitude_defaults | replace: 'nil', 'null' | replace: '=>', ':' }});

              // J1 Amplitude optimizations #2
              if (player.display_hours) {
                hours = ytpGetDurationHours(ytPlayer);
              }

              // get duration minutes|seconds
              minutes = ytpGetDurationMinutes(ytPlayer);
              seconds = ytpGetDurationSeconds(ytPlayer);

              // set duration time values for current video
              // ---------------------------------------------------------------

              // J1 Amplitude optimizations #1
              if (player.display_hours) {
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
              // ---------------------------------------------------------------
              endTimeModule = Date.now();

              isDev && logger.info('\n' + 'Initialize plugin|tech (ytp) : finished');

              if (playerCounter > 0) {
                isDev && logger.info('\n' + `Found players of type video (YTP) in page: ${playerCounter}`);
              } else {
                isDev && logger.warn('\n' + 'Found NO players of type video (YTP) in page');
              }

              // update activeVideoElement data structure for the ACTIVE video
              // ---------------------------------------------------------------
              setInterval(function() {
                checkActiveVideoElementYTP();
              }, checkActiveVideoInterval);
              // END checkActiveVideoElementYTP

              isDev && logger.info('\n' + `plugin|tech initializing time: ${(endTimeModule-startTimeModule)}ms`);

            } // END onPlayerReady()

            // -----------------------------------------------------------------
            // OnPlayerStateChange
            //
            // process all YT Player specific state changes
            // -----------------------------------------------------------------
            // NOTE:
            // The YT API fires a lot of INTERMEDIATE states. MOST of them gets
            // ignored (do nothing). For state PLAYING, important initial values
            // are being set; e.g. start|stop positions for a video (when)
            // configured.
            // -----------------------------------------------------------------
            // AJS YouTube Player state changes fired by the YT API
            // -----------------------------------------------------------------
            function {{player.id}}OnPlayerStateChange(event) {

              // J1 Amplitude optimizations #2
              // jadams, set|overload player settings
              var player = $.extend({}, {{player | replace: 'nil', 'null' | replace: '=>', ':' }}, {{amplitude_defaults | replace: 'nil', 'null' | replace: '=>', ':' }});

              var currentTime, playlist, ytPlayer, ytVideoID,
                  songs, songIndex, trackID, playerID, songMetaData;

              ytPlayer      = event.target;
              ytVideoID     = ytPlayer.options.videoId;
              playlist      = '{{player.playlist.name}}';
              playerID      = '{{player.id}}';
              // Fix Amplitude plugin #2
              // Original (deprecated, preserved for reference):
              // songs         = j1.adapter.amplitude.data.ytPlayers.{{player.id}}.songs;
              songs         = ytpHostData().ytPlayers.{{player.id}}.songs;
              songIndex     = ytpSongIndex; // getSongIndex(songs, ytVideoID);
              trackID       = songIndex + 1;
              // songMetaData  = songs[songIndex];

              // save YT player GLOBAL data for later use (e.g. events)
              // Fix Amplitude plugin #2
              // Original (deprecated, preserved for reference):
              // j1.adapter.amplitude.data.activePlayer                 = 'ytp';
              // j1.adapter.amplitude.data.ytpGlobals['activePlayer']   = ytPlayer;
              // j1.adapter.amplitude.data.ytpGlobals['activeIndex']    = songIndex;
              // j1.adapter.amplitude.data.ytpGlobals['activePlaylist'] = playlist;   
              ytpHostData().activePlayer                 = 'ytp';
              ytpHostData().ytpGlobals['activePlayer']   = ytPlayer;
              ytpHostData().ytpGlobals['activeIndex']    = songIndex;
              ytpHostData().ytpGlobals['activePlaylist'] = playlist;   

              // save YT player data for later use (e.g. events)
              // Fix Amplitude plugin #2
              // Original (deprecated, preserved for reference):
              // j1.adapter.amplitude.data.ytPlayers.{{player.id}}.player      = ytPlayer;
              // j1.adapter.amplitude.data.ytPlayers.{{player.id}}.activeIndex = songIndex;
              ytpHostData().ytPlayers.{{player.id}}.player      = ytPlayer;
              ytpHostData().ytPlayers.{{player.id}}.activeIndex = songIndex;

              // save amplitudejs data for later use (e.g. events)
              // ---------------------------------------------------------------
              // Fix AudioPlayer #3
              // Original (deprecated, preserved for reference):
              // j1.modules.amplitudejs.data.activePlayer = 'ytp';
              // j1.modules.amplitudejs.data.activeIndex = songIndex;
              // j1.modules.amplitudejs.data.activePlaylist = playlist;
              // j1.modules.amplitudejs.data.ytp.activePlayer = ytPlayer;
              // j1.modules.amplitudejs.data.ytp.activeIndex = songIndex;
              // j1.modules.amplitudejs.data.ytp.activePlaylist = playlist;
              // j1.modules.amplitudejs.data.ytp.players.{{player.id}}.player = ytPlayer;
              // j1.modules.amplitudejs.data.ytp.players.{{player.id}}.activeIndex = songIndex;
              ytpHostModuleData().activePlayer = 'ytp';
              ytpHostModuleData().activeIndex = songIndex;
              ytpHostModuleData().activePlaylist = playlist;          
              ytpHostModuleYtp().activePlayer = ytPlayer;
              ytpHostModuleYtp().activeIndex = songIndex;
              ytpHostModuleYtp().activePlaylist = playlist;
              ytpHostModuleYtp().players.{{player.id}}.player = ytPlayer;
              ytpHostModuleYtp().players.{{player.id}}.activeIndex = songIndex;

              // reset time container|progressbar for the ACTIVE song (video)
              // ---------------------------------------------------------------
              resetCurrentTimeContainerYTP(ytPlayer, playlist);
              updateDurationTimeContainerYTP(ytPlayer, playlist);
              resetProgressBarYTP();

              // process all state changes fired by YT API
              // ---------------------------------------------------------------
              switch(event.data) {
                case YT_PLAYER_STATE.UNSTARTED:
                  doNothingOnStateChange(YT_PLAYER_STATE.UNSTARTED);
                  break;
                case YT_PLAYER_STATE.CUED:
                  doNothingOnStateChange(YT_PLAYER_STATE.CUED);
                  break;
                case YT_PLAYER_STATE.BUFFERING:
                  doNothingOnStateChange(YT_PLAYER_STATE.BUFFERING);
                  break;
                case YT_PLAYER_STATE.PAUSED:
                  doNothingOnStateChange(YT_PLAYER_STATE.PAUSED);
                  break;
                case YT_PLAYER_STATE.PLAYING:
                  processOnStateChangePlaying(event, playlist, songIndex);
                  break;
                case YT_PLAYER_STATE.ENDED:
                  processOnStateChangeEnded(event, playerID, playlist, songIndex);
                  break;
                default:
                  logger.error('\n' + `UNKNOWN event on StateChange fired: ${event.data}`);
              } // END switch event.data

            } // END {{player.id}}OnPlayerStateChange

          {% endif %}
        {% endif %}{% endfor %}

    {% endcomment %}

    var videoPlayers = ytpVideoPlayers();

    for (var i = 0; i < videoPlayers.length; i++) {
      configureYtPlayer(videoPlayers[i]);
    }

  } // END onYouTubeIframeAPIReady

  // ---------------------------------------------------------------------------
  // configureYtPlayer(playerConfig)
  //
  // Fix Amplitude plugin #1
  // Creates and configures ONE (hidden) YT iframe player for the given player
  // settings. This function contains the body of the former BUILD-time loop
  // over the players of the amplitude module. All values that were rendered
  // by Liquid (player id, playlist name, yt_player settings, ...) are now
  // read at RUNTIME from the player entry of the options hash, overloading
  // the DEFAULT settings of the calling module.
  //
  // ---------------------------------------------------------------------------
  function configureYtPlayer(playerConfig) {
    var playerId          = playerConfig.id;
    var playerEffective   = ytpEffectivePlayer(playerConfig);
    var xhrContainerId    = playerId + '_audio';

    // load players of type 'video' configured in current page
    // -------------------------------------------------------------------------
    playerExistsInPage = $('#' + xhrContainerId)[0] !== undefined;

    if (playerExistsInPage) {
      var playerSettings     = $.extend({}, playerConfig);
      var songs              = Amplitude.getSongsStatePlaylist(playerSettings.playlist.name);
      var activeSongMetadata = songs[0];
      var playerType         = playerSettings.type;

      // increase number of found players in page by one
      playerCounter++;

      // load individual player settings (to manage multiple players in page)
      // resolved from the player entry, falling back to the module defaults
      //
      var ytpAutoPlay = String(ytpGetValue(playerConfig, 'yt_player.autoplay', ytpDefault('player.yt_player.autoplay', 0)));
      var ytpLoop     = String(ytpGetValue(playerConfig, 'yt_player.loop',     ytpDefault('player.yt_player.loop', 0)));
      var ytpHeight   = String(ytpGetValue(playerConfig, 'yt_player.height',   ytpDefault('player.yt_player.height', 0)));
      var ytpWidth    = String(ytpGetValue(playerConfig, 'yt_player.width',    ytpDefault('player.yt_player.width', 0)));

      // claude - optimize J1 third-party cookies #1
      // Per-player privacy-enhanced mode for the (hidden) YT video
      // iframe. Resolution order: per-player YAML key
      // yt_player.privacy_enhanced <- default settings
      // <module>.player.yt_player.privacy_enhanced <- hard default 'true'
      // (privacy-enhanced host) when the key is absent in both layers.
      var ytpPrivacy          = ytpGetValue(playerConfig, 'yt_player.privacy_enhanced', ytpDefault('player.yt_player.privacy_enhanced', true));
      var privacyEnhancedHost = (ytpPrivacy) ? 'https://www.youtube-nocookie.com' : 'https://youtube.com';

      isDev && logger.info('\n' + 'AJS YouTube iFrame API: ready');
      isDev && logger.info('\n' + `configure player on ID: #${playerId}`);

      // create a (hidden) ytp iframe container (video)
      //
      ytpContainer                = document.getElementById(playerId + '_video');
      ytpContainer.innerHTML      = '<div id="iframe_' + playerId + '"></div>';
      ytpContainer.style.cssText  = 'display:none';

      var ytpVideoID = (ytPlayerErrorTest) ? 'invalidVideoID' : activeSongMetadata.url.split('=')[1];
      ytPlayer = new YT.Player('iframe_' + playerId, {
        // claude - optimize J1 third-party cookies #1
        // Serve the (hidden) YT video iframe from the privacy-enhanced
        // host www.youtube-nocookie.com. The classic host
        // youtube.com sets several third-party cookies already on
        // page load, which Chrome/Lighthouse flags in the "Best Practices"
        // audit ("Uses third-party cookies") and logs to the DevTools
        // Issues panel. Configurable per player via the YAML key
        // yt_player.privacy_enhanced (default: true).
        host:               privacyEnhancedHost,
        height:             ytpHeight,
        width:              ytpWidth,
        videoId:            ytpVideoID,
        playerVars: {
          autoplay:         ytpAutoPlay,
          loop:             ytpLoop
        },
        events: {
          'onReady':        onPlayerReady,
          'onStateChange':  onPlayerStateChange,
          'onError':        onPlayerErrors
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
        "playerID":         playerId,
        "videoID":          ytpVideoID,
        "songs":            songs,
        "activeIndex":      0,
      };

      // store player properties for later use
      // Fix Amplitude plugin #2
      // Original (deprecated, preserved for reference):
      // addNestedProperty(j1.adapter.amplitude.data.ytPlayers, playerId, playerProperties);
      addNestedProperty(ytpHostData().ytPlayers, playerId, playerProperties);

      // save YT player GLOBAL data for later use (e.g. events)
      // Fix Amplitude plugin #2
      // Original (deprecated, preserved for reference):
      // j1.adapter.amplitude.data.ytpGlobals['ytApiReady'] = ytApiReady;
      ytpHostData().ytpGlobals['ytApiReady'] = ytApiReady;

      // save amplitudejs data for later use (e.g. events)
      // -----------------------------------------------------------------------
      // Fix AudioPlayer #3
      // Original (deprecated, preserved for reference):
      // j1.modules.amplitudejs.data.ytp.apiReady = ytApiReady;
      ytpHostModuleYtp().apiReady = ytApiReady;

      // reset current player
      playerExistsInPage = false;

    } // END if playerExistsInPage()

    // AJS YouTube Player errors fired by the YT API
    // -------------------------------------------------------------------------
    function onPlayerErrors(event) {
      var eventData, ytPlayer, videoID;

      eventData = event.data;
      ytPlayer  = event.target;
      videoID   = ytPlayer.options.videoId;

      logger.error('\n' + `YT API Error '${YT_PLAYER_ERROR_NAMES[eventData]}' for VideoID: '${videoID}'`);

      // save YT player GLOBAL data for later use (e.g. events)
      // Fix Amplitude plugin #2
      // Original (deprecated, preserved for reference):
      // j1.adapter.amplitude.data.ytpGlobals['ytApiError'] = eventData;
      ytpHostData().ytpGlobals['ytApiError'] = eventData;

      // save amplitudejs data for later use (e.g. events)
      // -----------------------------------------------------------------------
      // Fix AudioPlayer #3
      // Original (deprecated, preserved for reference):
      // j1.modules.amplitudejs.data.ytp.apiError = eventData;
      ytpHostModuleYtp().apiError = eventData;

    }

    // AJS YouTube Player initialization fired by the YT API
    // -------------------------------------------------------------------------
    function onPlayerReady(event) {

      // Fix Amplitude plugin #1
      // The EFFECTIVE player settings (module defaults overloaded by the
      // player entry) are taken from the closure variable playerEffective.
      //
      var player = playerEffective;

      var hours, minutes, seconds,
          ytPlayer, ytPlayerReady, playerVolumePreset,
          playListName, songsInPlaylist, titleListLargePlayer;

      ytPlayer            = event.target;
      ytPlayerReady       = true;
      playerVolumePreset  = parseInt(ytpDefault('player.volume_slider.preset_value', 50));

      isDev && logger.debug('\n' + `FOUND video ready at ID: ${playerId}`);

      // set video playback quality to a minimum
      ytPlayer.setPlaybackQuality('small');

      // set configured player volume preset
      ytPlayer.setVolume(playerVolumePreset);

      // enable|disable scrolling on playlist
      // -----------------------------------------------------------------------
      if (document.getElementById('large_player_right') !== null) {

        // show|hide scrollbar in playlist
        // ---------------------------------------------------------------------
        // Fix Amplitude plugin #2
        // Original (deprecated, preserved for reference):
        // playListName          = j1.adapter.amplitude.data.ytPlayers[playerId].playerSettings.playlist.name;
        playListName          = ytpHostData().ytPlayers[playerId].playerSettings.playlist.name;
        songsInPlaylist       = Amplitude.getSongsInPlaylist(playListName);
        titleListLargePlayer  = document.getElementById('large_player_title_list_' + playListName);

        if (songsInPlaylist.length <= playerScrollerSongElementMin) {
          if (titleListLargePlayer !== null) {
            titleListLargePlayer.classList.add('hide-scrollbar');
          }
        }
      }

      isDev && logger.info('\n' + `yt player on ID ${playerId}: ready`);

      // save YT player GLOBAL data for later use (e.g. events)
      // Fix Amplitude plugin #2
      // Original (deprecated, preserved for reference):
      // j1.adapter.amplitude.data.ytpGlobals['ytPlayerReady'] = ytPlayerReady;
      // j1.adapter.amplitude.data.ytpGlobals['ytApiError']    = 0;
      ytpHostData().ytpGlobals['ytPlayerReady'] = ytPlayerReady;
      ytpHostData().ytpGlobals['ytApiError']    = 0;

      // save amplitudejs data for later use (e.g. events)
      // -----------------------------------------------------------------------
      // Fix AudioPlayer #3
      // Original (deprecated, preserved for reference):
      // j1.modules.amplitudejs.data.ytp.apiError                     = 0;
      // j1.modules.amplitudejs.data.ytp.players[playerId]            = {};
      // j1.modules.amplitudejs.data.ytp.players[playerId].playerReady = ytPlayerReady;
      ytpHostModuleYtp().apiError                     = 0;
      ytpHostModuleYtp().players[playerId]            = {};
      ytpHostModuleYtp().players[playerId].playerReady = ytPlayerReady;

      // J1 Amplitude optimizations #2
      if (player.display_hours) {
        hours = ytpGetDurationHours(ytPlayer);
      }

      // get duration minutes|seconds
      minutes = ytpGetDurationMinutes(ytPlayer);
      seconds = ytpGetDurationSeconds(ytPlayer);

      // set duration time values for current video
      // -----------------------------------------------------------------------

      // J1 Amplitude optimizations #1
      if (player.display_hours) {
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
      // -----------------------------------------------------------------------
      endTimeModule = Date.now();

      isDev && logger.info('\n' + 'Initialize plugin|tech (ytp) : finished');

      if (playerCounter > 0) {
        isDev && logger.info('\n' + `Found players of type video (YTP) in page: ${playerCounter}`);
      } else {
        isDev && logger.warn('\n' + 'Found NO players of type video (YTP) in page');
      }

      // update activeVideoElement data structure for the ACTIVE video
      // -----------------------------------------------------------------------
      setInterval(function() {
        checkActiveVideoElementYTP();
      }, checkActiveVideoInterval);
      // END checkActiveVideoElementYTP

      isDev && logger.info('\n' + `plugin|tech initializing time: ${(endTimeModule-startTimeModule)}ms`);

    } // END onPlayerReady()

    // -------------------------------------------------------------------------
    // OnPlayerStateChange
    //
    // process all YT Player specific state changes
    // -------------------------------------------------------------------------
    // NOTE:
    // The YT API fires a lot of INTERMEDIATE states. MOST of them gets
    // ignored (do nothing). For state PLAYING, important initial values
    // are being set; e.g. start|stop positions for a video (when)
    // configured.
    // -------------------------------------------------------------------------
    // AJS YouTube Player state changes fired by the YT API
    // -------------------------------------------------------------------------
    function onPlayerStateChange(event) {

      var currentTime, playlist, ytPlayer, ytVideoID,
          songs, songIndex, trackID, playerID, songMetaData;

      ytPlayer      = event.target;
      ytVideoID     = ytPlayer.options.videoId;
      playlist      = ytpGetValue(playerConfig, 'playlist.name', '');
      playerID      = playerId;
      // Fix Amplitude plugin #2
      // Original (deprecated, preserved for reference):
      // songs         = j1.adapter.amplitude.data.ytPlayers[playerId].songs;
      songs         = ytpHostData().ytPlayers[playerId].songs;
      songIndex     = ytpSongIndex; // getSongIndex(songs, ytVideoID);
      trackID       = songIndex + 1;
      // songMetaData  = songs[songIndex];

      // save YT player GLOBAL data for later use (e.g. events)
      // Fix Amplitude plugin #2
      // Original (deprecated, preserved for reference):
      // j1.adapter.amplitude.data.activePlayer                 = 'ytp';
      // j1.adapter.amplitude.data.ytpGlobals['activePlayer']   = ytPlayer;
      // j1.adapter.amplitude.data.ytpGlobals['activeIndex']    = songIndex;
      // j1.adapter.amplitude.data.ytpGlobals['activePlaylist'] = playlist;
      ytpHostData().activePlayer                 = 'ytp';
      ytpHostData().ytpGlobals['activePlayer']   = ytPlayer;
      ytpHostData().ytpGlobals['activeIndex']    = songIndex;
      ytpHostData().ytpGlobals['activePlaylist'] = playlist;

      // save YT player data for later use (e.g. events)
      // Fix Amplitude plugin #2
      // Original (deprecated, preserved for reference):
      // j1.adapter.amplitude.data.ytPlayers[playerId].player      = ytPlayer;
      // j1.adapter.amplitude.data.ytPlayers[playerId].activeIndex = songIndex;
      ytpHostData().ytPlayers[playerId].player      = ytPlayer;
      ytpHostData().ytPlayers[playerId].activeIndex = songIndex;

      // save amplitudejs data for later use (e.g. events)
      // -----------------------------------------------------------------------
      // Fix AudioPlayer #3
      // Original (deprecated, preserved for reference):
      // j1.modules.amplitudejs.data.activePlayer = 'ytp';
      // j1.modules.amplitudejs.data.activeIndex = songIndex;
      // j1.modules.amplitudejs.data.activePlaylist = playlist;
      // j1.modules.amplitudejs.data.ytp.activePlayer = ytPlayer;
      // j1.modules.amplitudejs.data.ytp.activeIndex = songIndex;
      // j1.modules.amplitudejs.data.ytp.activePlaylist = playlist;
      // j1.modules.amplitudejs.data.ytp.players[playerId].player = ytPlayer;
      // j1.modules.amplitudejs.data.ytp.players[playerId].activeIndex = songIndex;
      ytpHostModuleData().activePlayer = 'ytp';
      ytpHostModuleData().activeIndex = songIndex;
      ytpHostModuleData().activePlaylist = playlist;
      ytpHostModuleYtp().activePlayer = ytPlayer;
      ytpHostModuleYtp().activeIndex = songIndex;
      ytpHostModuleYtp().activePlaylist = playlist;
      ytpHostModuleYtp().players[playerId].player = ytPlayer;
      ytpHostModuleYtp().players[playerId].activeIndex = songIndex;

      // reset time container|progressbar for the ACTIVE song (video)
      // -----------------------------------------------------------------------
      resetCurrentTimeContainerYTP(ytPlayer, playlist);
      updateDurationTimeContainerYTP(ytPlayer, playlist);
      resetProgressBarYTP();

      // process all state changes fired by YT API
      // -----------------------------------------------------------------------
      switch(event.data) {
        case YT_PLAYER_STATE.UNSTARTED:
          doNothingOnStateChange(YT_PLAYER_STATE.UNSTARTED);
          break;
        case YT_PLAYER_STATE.CUED:
          doNothingOnStateChange(YT_PLAYER_STATE.CUED);
          break;
        case YT_PLAYER_STATE.BUFFERING:
          doNothingOnStateChange(YT_PLAYER_STATE.BUFFERING);
          break;
        case YT_PLAYER_STATE.PAUSED:
          doNothingOnStateChange(YT_PLAYER_STATE.PAUSED);
          break;
        case YT_PLAYER_STATE.PLAYING:
          processOnStateChangePlaying(event, playlist, songIndex);
          break;
        case YT_PLAYER_STATE.ENDED:
          processOnStateChangeEnded(event, playerID, playlist, songIndex);
          break;
        default:
          logger.error('\n' + `UNKNOWN event on StateChange fired: ${event.data}`);
      } // END switch event.data

    } // END onPlayerStateChange

  } // END configureYtPlayer

  // ---------------------------------------------------------------------------
  // main
  // ===========================================================================

  // ---------------------------------------------------------------------------
  // initYtAPI
  //
  // load|initialize YT Iframe player API
  // ---------------------------------------------------------------------------
  initYtAPI();

  // save YT player data for later use (e.g. events)
  // ---------------------------------------------------------------------------
  // Fix AudioPlayer #4
  // The EXACT src match '//youtube.com/iframe_api' only detects the script
  // tag injected by THIS plugin. It never matches the tag injected by the
  // VideoJS YouTube tech ('//youtube.com/iframe_api'), and after the
  // fix in initYtAPI, NO tag is injected at all when the API was already
  // loaded by another module. The detection is made host-agnostic
  // (substring match on 'iframe_api') and additionally accepts a present
  // YT API loader stub (window.YT.ready).
  // Original (deprecated, preserved for reference):
  // var url = '//youtube.com/iframe_api';
  //
  // if (document.querySelectorAll(`script[src="${url}"]`).length > 0) {
  var url = 'iframe_api';

  // Fix AudioPlayer #3
  // Original (deprecated, preserved for reference):
  // j1.modules.amplitudejs.data.ytp.plugin = 'loaded';
  if (document.querySelectorAll(`script[src*="${url}"]`).length > 0 ||
    (window.YT && typeof window.YT.ready === 'function')) {
    ytpHostModuleYtp().plugin = 'loaded';
  }

  // ---------------------------------------------------------------------------
  // initUiEventsForAJS
  //
  // setup YTPlayerUiEvents for AJS players  
  // ---------------------------------------------------------------------------
  initUiEventsForAJS();

  // ---------------------------------------------------------------------------
  // Base AJS Player functions
  // ===========================================================================
  
  // ---------------------------------------------------------------------------
  // ytpUpdatMetaContainers(metaData)
  // update song name in meta-containers 
  // ---------------------------------------------------------------------------  
  function ytpUpdatMetaContainers(metaData) {
    var playlist, trackID, rating;

    playlist  = metaData.playlist;
    rating    = metaData.rating;
    trackID   = metaData.index + 1;

    isDev && logger.debug('\n' + `UPDATE metadata on ytpUpdatMetaContainers for trackID|playlist at: ${trackID}|${playlist}`);

    // update song name in meta-containers
    var songName = document.getElementsByClassName("song-name");
    if (songName.length) {
      for (var i=0; i<songName.length; i++) {    
        var currentPlaylist = songName[i].dataset.amplitudePlaylist;
        if (currentPlaylist === playlist) {
          songName[i].innerHTML = metaData.name;
        }
      }
    }

    // update artist name in meta-containers
    var artistName = document.getElementsByClassName("artist");
    if (artistName.length) {
      for (var i=0; i<artistName.length; i++) {    
        var currentPlaylist = artistName[i].dataset.amplitudePlaylist;
        if (currentPlaylist === playlist) {
          artistName[i].innerHTML = metaData.artist;
        }
      }
    }

    // update album name in meta-containers
    var albumName = document.getElementsByClassName("album");
    if (albumName.length) {
      for (var i=0; i<albumName.length; i++) {
        // J1 Amplitude optimizations #1
        // BUG FIX: The original used `songName[i].dataset.amplitudePlaylist`
        // here -- a copy/paste from the songName loop above. Because the
        // songName and albumName HTMLCollections do not necessarily have
        // matching length or indexing, this either reads the wrong
        // element's data-attribute or throws when songName is shorter.
        // The correct array to read from is the one we are iterating over.
        var currentPlaylist = albumName[i].dataset.amplitudePlaylist;
        if (currentPlaylist === playlist) {
          albumName[i].innerHTML = metaData.album;
        }
      }
    }

    // update song rating in screen controls
    var songAudioRating = document.getElementsByClassName("audio-rating-screen-controls");
    if (songAudioRating.length) {
      for (var i=0; i<songAudioRating.length; i++) {
        var currentPlaylist = songAudioRating[i].dataset.amplitudePlaylist;
        if (currentPlaylist === playlist) {
          if (metaData.rating) {
            songAudioRating[i].innerHTML = `<img src="/assets/image/pattern/rating/scalable/${metaData.rating}-star.svg" alt="song rating">`;
          }
        }
      }
    } // END if songAudioRating

    // update song info in screen controls
    var songAudioInfo = document.getElementsByClassName("audio-info-link-screen-controls");
    if (songAudioInfo.length) {
      for (var i=0; i<songAudioInfo.length; i++) {
        var currentPlaylist = songAudioInfo[i].dataset.amplitudePlaylist;
        if (currentPlaylist === playlist) {
          if (metaData.audio_info) {
            songAudioInfo[i].setAttribute("href", metaData.audio_info);
          }
        }
      }
    } // END if songAudioInfo

  } // END ytpUpdatMetaContainers

  // ---------------------------------------------------------------------------
  // loadCoverImage(metaData)
  // load the configured cover image for a specic song (metaData)
  // ---------------------------------------------------------------------------  
  function loadCoverImage(metaData) {
    var selector;
    var coverImage = {};

    selector       = ".cover-image-" + metaData.playlist;
    coverImage     = document.querySelector(selector);
    coverImage.src = metaData.cover_art_url;

  } // END loadCoverImage

  // ---------------------------------------------------------------------------
  // ytpStopParallelActivePlayers(exceptPlayer)
  // if multiple players used on a page, stop ALL active AT|YT players
  // running in parallel skipping the exceptPlayer
  // ---------------------------------------------------------------------------  
  function ytpStopParallelActivePlayers(exceptPlayer) {

    // stop active AT players running in parallel
    // -------------------------------------------------------------------------
    var atPlayerState = Amplitude.getPlayerState();
    if (atPlayerState === 'playing' || atPlayerState === 'paused') {
      Amplitude.stop();
    } // END stop active AT players

    // stop active YT players running in parallel
    // -------------------------------------------------------------------------
    // Fix Amplitude plugin #2
    // Original (deprecated, preserved for reference):
    // const ytPlayers = Object.keys(j1.adapter.amplitude.data.ytPlayers);
    const ytPlayers = Object.keys(ytpHostData().ytPlayers);
    for (let i=0; i<ytPlayers.length; i++) {
      const ytPlayerID        = ytPlayers[i];
      // Fix Amplitude plugin #2
      // Original (deprecated, preserved for reference):
      // const playerProperties  = j1.adapter.amplitude.data.ytPlayers[ytPlayerID];
      const playerProperties  = ytpHostData().ytPlayers[ytPlayerID];

      if (ytPlayerID !== exceptPlayer) {
        // Fix Amplitude plugin #2
        // Original (deprecated, preserved for reference):
        // var player        = j1.adapter.amplitude['data']['ytPlayers'][ytPlayerID]['player'];
        var player        = ytpHostData()['ytPlayers'][ytPlayerID]['player'];
        // J1 Amplitude optimizations #1
        // CLARITY: With the YT_PLAYER_STATE_NAMES table now containing a
        // proper "-1" key (see Fix #1), the magic-number workaround
        // `(state > 0) ? state : 6` is no longer needed. Direct lookup
        // with a fallback expresses intent more clearly. Equivalent
        // simplifications appear at every site that used `[6]`.
        //
        var rawState      = player.getPlayerState();
        var ytPlayerState = YT_PLAYER_STATE_NAMES[rawState] || 'unstarted';

        // toggle PlayPause buttons playing => puased
        // ---------------------------------------------------------------------
        var isValidPlayerState = /playing|paused/.test(ytPlayerState);
        if (isValidPlayerState) {
          isDev && logger.debug('\n' + `STOP player at ytpStopParallelActivePlayers for id: ${ytPlayerID}`);
          player.stopVideo();
          var ytpButtonPlayerPlayPause = document.getElementsByClassName("large-player-play-pause-" + ytPlayerID);
          for (var j=0; j<ytpButtonPlayerPlayPause.length; j++) {

            var htmlElement = ytpButtonPlayerPlayPause[j];
            if (htmlElement.dataset.amplitudeSource === 'youtube') {
              if (htmlElement.classList.contains('amplitude-playing')) {        
                htmlElement.classList.remove('amplitude-playing');
                htmlElement.classList.add('amplitude-paused');
              }
              // if (htmlElement.classList.contains('amplitude-paused')) {        
              //   htmlElement.classList.remove('amplitude-paused');
              //   htmlElement.classList.add('amplitude-playing');
              // }              
            }

          } // END for ytpButtonPlayerPlayPause

        } // END if ytPlayerState
      } // END if ytPlayerID

      // save AT player data for later use (e.g. events)
      // -----------------------------------------------------------------------
      // Fix Amplitude plugin #2
      // Original (deprecated, preserved for reference):
      // j1.adapter.amplitude.data.ytpGlobals.activeIndex = 0;
      ytpHostData().ytpGlobals.activeIndex = 0;

    } // END stop active YT players
  } // END ytpStopParallelActivePlayers

  // ---------------------------------------------------------------------------
  // getSongPlayed
  //
  // Returns the index of the current video (song) in the songs array
  // that is currently playing (starts by 0)  
  // ---------------------------------------------------------------------------  
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
  // setSongActive(currentPlayList, currentIndex)
  // set song (video) active at index in playlist
  // ---------------------------------------------------------------------------
  function setSongActive(currentPlayList, currentIndex) {
    var playlist, songContainers, songIndex;

    songIndex = currentIndex;

    // clear ALL active song containers
    // -------------------------------------------------------------------------
    songContainers = document.getElementsByClassName("amplitude-song-container");
    for (var i=0; i<songContainers.length; i++) {
      songContainers[i].classList.remove("amplitude-active-song-container");
    }

    // find current song container and activate the element
    // -------------------------------------------------------------------------
    songContainers = document.querySelectorAll('.amplitude-song-container[data-amplitude-song-index="' + songIndex + '"]');          
    for (var i=0; i<songContainers.length; i++) {
      if (songContainers[i].hasAttribute("data-amplitude-playlist")) {
        playlist = songContainers[i].getAttribute("data-amplitude-playlist");
        if (playlist === currentPlayList) {
          songContainers[i].classList.add("amplitude-active-song-container");
        }
      }
    }

  } // END setSongActive

  // ---------------------------------------------------------------------------
  // getProgressBarSelectedPositionPercentage
  // Returns the position as a percentage the user clicked in player progressbar
  // NOTE: The percentage is out of [0.00 .. 1.00]  
  // ---------------------------------------------------------------------------
  function getProgressBarSelectedPositionPercentage (event, progessBar) {
    var offset     = progessBar.getBoundingClientRect();
    var xpos       = event.pageX - offset.left;
    var percentage = (parseFloat(xpos) / parseFloat(progessBar.offsetWidth)).toFixed(2);

    return percentage;
  } // END getProgressBarSelectedPositionPercentage

  // ---------------------------------------------------------------------------
  // getTimeFromPercentage
  // Returns the time in seconds calculated from a percentage value
  // NOTE: The percentage is out of [0.00 .. 1.00]
  // ---------------------------------------------------------------------------
  function getTimeFromPercentage (player, percentage) {
    var videoDuration = ytpGetDuration(player);
    var time          = parseFloat((videoDuration * percentage).toFixed(2));

    return time;
  } // END getTimeFromPercentage

  // ---------------------------------------------------------------------------
  // checkActiveVideoElementYTP
  //
  // ---------------------------------------------------------------------------
  function checkActiveVideoElementYTP() {
    var activeVideoElements = document.getElementsByClassName("amplitude-active-song-container");
    if (activeVideoElements.length) {
      var classArray  = [].slice.call(activeVideoElements[0].classList, 0); 
      var classString = classArray.toString();

      // activeVideoElement.html          = activeVideoElements[0];
      activeVideoElement.playlist         = activeVideoElements[0].dataset.amplitudePlaylist;
      activeVideoElement.index            = parseInt(activeVideoElements[0].dataset.amplitudeSongIndex);
      activeVideoElement.playerType       = (classString.includes('large') ? 'large' : 'compact');
      activeVideoElement.playerID         = activeVideoElements[0].dataset.amplitudePlayer;

      // Fix Amplitude plugin #2
      // Original (deprecated, preserved for reference):
      // if (j1.adapter.amplitude.data.ytPlayers[activeVideoElement.playerID] !== undefined) {
      // activeVideoElement.player         = j1.adapter.amplitude.data.ytPlayers[activeVideoElement.playerID].player;
      // activeVideoElement.songs          = j1.adapter.amplitude.data.ytPlayers[activeVideoElement.playerID].songs;
      if (ytpHostData().ytPlayers[activeVideoElement.playerID] !== undefined) {
        activeVideoElement.player         = ytpHostData().ytPlayers[activeVideoElement.playerID].player;
        activeVideoElement.songs          = ytpHostData().ytPlayers[activeVideoElement.playerID].songs;

        var activeSong                    = activeVideoElement.songs[activeVideoElement.index];

        activeVideoElement.album          = activeSong.album;
        activeVideoElement.artist         = activeSong.artist;
        activeVideoElement.audio_info     = activeSong.audio_info;
        activeVideoElement.currentTime    = parseFloat(activeVideoElement.player.getCurrentTime());
        activeVideoElement.cover_art_url  = activeSong.cover_art_url;
        activeVideoElement.duration       = activeSong.duration;
        // Fix Amplitude plugin #2
        // Original (deprecated, preserved for reference):
        // activeVideoElement.endSec         = j1.adapter.amplitude.timestamp2seconds(activeSong.end);
        activeVideoElement.endSec         = ytpHost().timestamp2seconds(activeSong.end);
        activeVideoElement.endTS          = activeSong.end;
        activeVideoElement.name           = activeSong.name;
        activeVideoElement.rating         = activeSong.rating;
        // Fix Amplitude plugin #2
        // Original (deprecated, preserved for reference):
        // activeVideoElement.startSec       = j1.adapter.amplitude.timestamp2seconds(activeSong.start);
        activeVideoElement.startSec       = ytpHost().timestamp2seconds(activeSong.start);
        activeVideoElement.startTS        = activeSong.start;
        activeVideoElement.url            = activeSong.url;

        var videoArray                    = activeSong.url.split('=');
        activeVideoElement.videoID        = videoArray[1];
      }
    }
  }

  // ---------------------------------------------------------------------------
  // isObjectEmpty(obj)
  //
  // ---------------------------------------------------------------------------
  function isObjectEmpty(obj) {
    for (const prop in obj) {
      if (Object.hasOwn(obj, prop)) {
        return false;
      }
    }

    return true;
  } // END isObjectEmpty

  // ---------------------------------------------------------------------------
  // getActiveSong()
  // Returns the time in seconds calculated from a percentage value
  // NOTE: The percentage is out of [0.00 .. 1.00]
  // ---------------------------------------------------------------------------
  function getActiveSong() {

    if(!isObjectEmpty(activeVideoElement)) {
      return activeVideoElement;
    }

    return false;
  } // END getActiveSong


  // ---------------------------------------------------------------------------
  // updateProgressBarsYTP
  // Update YTP specific progress data
  // ---------------------------------------------------------------------------
  function updateProgressBarsYTP() {
    var progress, progressBars, playlist, playerID,
        classArray, classString, activePlayer, activeClass;

    progressBars = document.getElementsByClassName("large-player-progress");
    for (var i=0; i<progressBars.length; i++) {
      if (progressBars[i].dataset.amplitudeSource === 'audio') {
        // do nothing (managed by adapter)
      } else {  
        playlist      = progressBars[i].getAttribute("data-amplitude-playlist");
        playerID      = progressBars[i].getAttribute("data-amplitude-player");
        classArray    = [].slice.call(progressBars[i].classList, 0);
        classString   = classArray.toString();
        // Fix Amplitude plugin #2
        // Original (deprecated, preserved for reference):
        // activePlayer  = j1.adapter.amplitude.data.ytPlayers[playerID].player;
        activePlayer  = ytpHostData().ytPlayers[playerID].player;
        activeClass   = 'large-player-progress-' + playlist;

        if (activePlayer === undefined) {
          logger.error('\n' + 'YT player not defined');
          return;
        }

        if (classString.includes(activeClass)) {
          // calc procent value (float, 2 decimals [0.00 .. 1.00])
          progress = parseFloat((activePlayer.getCurrentTime() / activePlayer.getDuration()).toFixed(2));
          
          // set current progess value if valid
          if (isFinite(progress)) {
            progressBars[i].value = progress;
          }
        }
      }
    } // END for

    return;
  } // END updateProgressBarsYTP

  // ---------------------------------------------------------------------------
  // updateDurationTimeContainerYTP(player, playlist)
  // update time container values for current video
  // ---------------------------------------------------------------------------
  function updateDurationTimeContainerYTP(player, playlist) {
    var hours, minutes, seconds;
    var durationHours, durationMinutes, durationSeconds;
    var activePlaylist;

    // get current hours|minutes|seconds
    // -------------------------------------------------------------------------
    hours   = ytpGetDurationHours(player);
    minutes = ytpGetDurationMinutes(player);
    seconds = ytpGetDurationSeconds(player);

    // update current duration|hours
    // -------------------------------------------------------------------------
    durationHours = document.getElementsByClassName("amplitude-duration-hours");
    if (durationHours.length && !isNaN(hours)) {
      for (var i=0; i<durationHours.length; i++) {    
        var currentPlaylist = durationHours[i].dataset.amplitudePlaylist;
        if (currentPlaylist === playlist) {
          durationHours[i].innerHTML = hours;
        }
      }
    }

    // update current duration|minutes
    // -------------------------------------------------------------------------
    durationMinutes = document.getElementsByClassName("amplitude-duration-minutes");
    if (durationMinutes.length && !isNaN(minutes)) {
      for (var i=0; i<durationMinutes.length; i++) {    
        var currentPlaylist = durationMinutes[i].dataset.amplitudePlaylist;
        if (currentPlaylist === playlist) {
          durationMinutes[i].innerHTML = minutes;
        }
      }
    }

    // update duration|seconds
    // -------------------------------------------------------------------------
    durationSeconds = document.getElementsByClassName("amplitude-duration-seconds");
    if (durationSeconds.length && !isNaN(seconds)) {
      for (var i=0; i<durationSeconds.length; i++) {    
        var currentPlaylist = durationSeconds[i].dataset.amplitudePlaylist;
        if (currentPlaylist === playlist) {
          durationSeconds[i].innerHTML = seconds;
        }
      }
    }

    return;
  } // END updateDurationTimeContainerYTP

  // ---------------------------------------------------------------------------
  // updateCurrentTimeContainerYTP(player, metaData)
  // update time container values for current video
  // ---------------------------------------------------------------------------
  function updateCurrentTimeContainerYTP(player, playlist) {
    var hours, minutes, seconds;
    var currentHours, currentMinutes, currentSeconds;

    // get current hours|minutes|seconds
    hours   = ytpGetCurrentHours(player);
    minutes = ytpGetCurrentMinutes(player);
    seconds = ytpGetCurrentSeconds(player);

    // update current duration|hours
    // -------------------------------------------------------------------------
    if (hours !== '00') {
      currentHours = document.getElementsByClassName("amplitude-current-hours");
      if (currentHours.length) {
        for (var i=0; i<currentHours.length; i++) {    
          var currentPlaylist = currentHours[i].dataset.amplitudePlaylist;
          if (currentPlaylist === playlist) {
            currentHours[i].innerHTML = hours;
          }
        }
      }
    }

    // update current duration|minutes
    // -------------------------------------------------------------------------
    currentMinutes = document.getElementsByClassName("amplitude-current-minutes");
    if (currentMinutes.length) {
      for (var i=0; i<currentMinutes.length; i++) {    
        var currentPlaylist = currentMinutes[i].dataset.amplitudePlaylist;
        if (currentPlaylist === playlist) {
          currentMinutes[i].innerHTML = minutes;
        }
      }
    }
   
    // update duration|seconds
    // -------------------------------------------------------------------------
    currentSeconds = document.getElementsByClassName("amplitude-current-seconds");
    if (currentSeconds.length) {
      for (var i=0; i<currentSeconds.length; i++) {    
        var currentPlaylist = currentSeconds[i].dataset.amplitudePlaylist;
        if (currentPlaylist === playlist) {
          currentSeconds[i].innerHTML = seconds;
        }
      }
    }

    return;
  } // END updateCurrentTimeContainerYTP

  // ---------------------------------------------------------------------------
  // resetProgressBarYTP()
  // Reset ALL progress bars
  // ---------------------------------------------------------------------------
  function resetProgressBarYTP() {
    var progressBars = document.getElementsByClassName("large-player-progress");
    for (var i=0; i<progressBars.length; i++) {
      progressBars[i].value = 0;
    }
  } // END resetProgressBarYTP

  // ---------------------------------------------------------------------------
  // resetCurrentTimeContainerYTP
  // Reset YTP specific CURRENT time data
  // ---------------------------------------------------------------------------  
  function resetCurrentTimeContainerYTP(player, playlist) {

    // reset duration|hours
    var currentHours = document.getElementsByClassName("amplitude-current-hours");
    if (currentHours.length) {
      for (var i=0; i<currentHours.length; i++) {    
        var currentPlaylist = currentHours[i].dataset.amplitudePlaylist;
        if (currentPlaylist === playlist) {
          currentHours[i].innerHTML = '00';
        }
      }
    }

    // reset duration|minutes
    var currentMinutes = document.getElementsByClassName("amplitude-current-minutes");
    if (currentMinutes.length) {
      // J1 Amplitude optimizations #1
      // BUG FIX: The loop bound was `currentHours.length` (copy/paste from
      // the block above) instead of `currentMinutes.length`. If the page
      // had a different number of hours/minutes spans (e.g. when
      // `display_hours` is false the hours collection is empty), the loop
      // either skipped real elements or skipped iteration entirely.
      //
      for (var i=0; i<currentMinutes.length; i++) {
        var currentPlaylist = currentMinutes[i].dataset.amplitudePlaylist;
        if (currentPlaylist === playlist) {
          currentMinutes[i].innerHTML = '00';
        }
      }
    } 

    // reset duration|seconds
    var currentSeconds = document.getElementsByClassName("amplitude-current-seconds");
    if (currentSeconds.length) {
      for (var i=0; i<currentSeconds.length; i++) {    
        var currentPlaylist = currentSeconds[i].dataset.amplitudePlaylist;
        if (currentPlaylist === playlist) {
          currentSeconds[i].innerHTML = '00';
        }
      }    
    }    

    return;
  } // END resetCurrentTimeContainerYTP


  // ---------------------------------------------------------------------------
  // Mimik Base AJS API functions
  // ===========================================================================

  // ---------------------------------------------------------------------------
  // ytpLoadVideoById
  //
  // Load a video by ID and resolve once the YT player has buffered enough
  // of it for smooth playback (or a timeout is reached).
  // ---------------------------------------------------------------------------
  function ytpLoadVideoById(player, id, _bufferQuoteIgnored) {
    // J1 Amplitude optimizations #1
    // BUG FIX: The original implementation was unrecoverable:
    //
    //   1. `return true;` came BEFORE `clearInterval(videoLoaded);` --
    //      so the clearInterval line was unreachable; the timer ran forever.
    //   2. The `return` statements inside the setInterval callback returned
    //      from the arrow function, NOT from the outer ytpLoadVideoById. The
    //      outer function returned `undefined` immediately after starting
    //      the timer, so callers could never see the buffer state.
    //   3. The `bufferQuote` parameter was being reassigned inside the
    //      callback, which served no purpose because the assignment was
    //      not visible outside the closure.
    //
    // Result: the function leaked an interval per call and never returned
    // anything meaningful. Since it is currently unreferenced (grep finds
    // no callers), the safest fix is to keep its name and signature stable
    // but rewrite it as a Promise that actually resolves when the video is
    // buffered, with a hard timeout to prevent the runaway-timer scenario.
    //
    const cycle           = 250;   // poll every 250 ms
    const bufferThreshold = 3;     // % loaded before considering ready
    const maxTries        = 60;    // give up after 60 polls (~15 s)

    player.loadVideoById(id);

    return new Promise(function(resolve) {
      var tries = 0;
      const videoLoaded = setInterval(function() {
        tries++;
        const bufferQuote = ytpGetBuffered(player);
        if (bufferQuote >= bufferThreshold || tries >= maxTries) {
          clearInterval(videoLoaded);
          resolve(bufferQuote >= bufferThreshold);
        }
      }, cycle);
    });
  } // END ytpLoadVideoById

  // ---------------------------------------------------------------------------
  // ytpSeekTo
  //
  // Seek (skip) video to specified time (position)
  // ---------------------------------------------------------------------------
  function ytpSeekTo(player, time, seekAhead) {
    // const allowSeekAhead = true;
    // var buffered = ytpGetBuffered(player);

    if (player.id !== undefined) {
      player.seekTo(time, seekAhead);
      // player.seekTo(time);

     return true;
    } else {
      return false;
    }

  } // END ytpSeekTo

  // ---------------------------------------------------------------------------
  // ytpGetBuffered
  // Returns the buffered percentage of the video currently playing
  // ---------------------------------------------------------------------------
  function ytpGetBuffered(player) {

    return (player.getVideoLoadedFraction() * 100).toFixed(2);
  } // END ytpGetBuffered

  // ---------------------------------------------------------------------------
  // ytpGetActiveIndex
  // Returns the active song index (in the songs array, starts by 0)
  // ---------------------------------------------------------------------------
  function ytpGetActiveIndex(playerID) {
    var activeIndex = -1;

    // Fix Amplitude plugin #2
    // Original (deprecated, preserved for reference):
    // if (j1.adapter.amplitude.data.ytPlayers[playerID].activeIndex !== undefined) {
    // activeIndex = parseInt(j1.adapter.amplitude.data.ytPlayers[playerID].activeIndex);
    if (ytpHostData().ytPlayers[playerID].activeIndex !== undefined) {
        activeIndex = parseInt(ytpHostData().ytPlayers[playerID].activeIndex);
    }

    return activeIndex;
  } // END ytpGetActiveIndex

  // ---------------------------------------------------------------------------
  // ytpSetActiveIndex
  // Set the index of the active song (index starts by 0)
  // ---------------------------------------------------------------------------   
  function ytpSetActiveIndex(playerID, idx) {
    var success = false;
    var index   = parseInt(idx);

    // Fix Amplitude plugin #2
    // Original (deprecated, preserved for reference):
    // if (j1.adapter.amplitude.data.ytPlayers[playerID].activeIndex !== undefined) {
    // j1.adapter.amplitude.data.ytPlayers[playerID].activeIndex = index;
    if (ytpHostData().ytPlayers[playerID].activeIndex !== undefined) {
        ytpHostData().ytPlayers[playerID].activeIndex = index;
        success = true;
    }

    return success;
  } // END ytpSetActiveIndex

  // ---------------------------------------------------------------------------
  // ytpGetPlayedPercentage
  // Returns the percentage of the video played
  // ---------------------------------------------------------------------------
  function ytpGetPlayedPercentage(player) {
     // tbd
  } // END ytpGetPlayedPercentage

  // ---------------------------------------------------------------------------
  // ytpGetAudio
  // Returns the actual video element
  // ---------------------------------------------------------------------------
  function ytpGetAudio(player) {
     // tbd
  } // END ytpGetAudio

  // ---------------------------------------------------------------------------
  // ytpGetPlaybackSpeeds
  // Returns available playback speeds for the player
  // ---------------------------------------------------------------------------
  function ytpGetPlaybackSpeeds(player) {
     // tbd
  } // END ytpGetPlaybackSpeeds

  // ---------------------------------------------------------------------------
  // ytpGetPlayerState
  // Returns the current state of the player
  // ---------------------------------------------------------------------------
  function ytpGetPlayerState(player) {
     // tbd
  } // END ytpGetPlayerState

  // ---------------------------------------------------------------------------
  // ytpGetDuration
  // Returns the duration of the video
  // ---------------------------------------------------------------------------
  function ytpGetDuration(player) {
    var duration;

    var playerState   = player.getPlayerState();
    var ytPlayerState = YT_PLAYER_STATE_NAMES[playerState];

    var isValidPlayerState = /playing|paused|buffering|cued/.test(ytPlayerState);
    if (isValidPlayerState) {
      duration = player.getDuration();

      return duration;
    } else {
      return 0;
    }
  } // END ytpGetDuration

  // ---------------------------------------------------------------------------
  // ytpGetCurrentTime
  // Returns the current time of the video played
  // ---------------------------------------------------------------------------
  function ytpGetCurrentTime(player) {
    var currentTime;

    var playerState   = player.getPlayerState();
    var ytPlayerState = YT_PLAYER_STATE_NAMES[playerState];

    var isValidPlayerState = /playing|paused|cued|unstarted/.test(ytPlayerState);
    if (isValidPlayerState) {
        currentTime = player.getCurrentTime();

        return currentTime;
    } else {
        return 0;
    }

  } // END ytpGetCurrentTime

  // ---------------------------------------------------------------------------
  // ytpGetDurationHours
  // Returns the duration hours of the video
  // ---------------------------------------------------------------------------
  function ytpGetDurationHours(player) {
    var duration, hours, d, h;

    var playerState   = player.getPlayerState();
    var ytPlayerState = YT_PLAYER_STATE_NAMES[playerState];

    var isValidPlayerState = /playing|paused|cued/.test(ytPlayerState);
    if (isValidPlayerState) {
        duration  = ytpGetDuration(player);
        d         = Number(duration);
        h         = Math.floor(d / 3600);
        hours     = h.toString().padStart(2, '0');

        return hours;
    } else {
        return '00';
    }

  } // END ytpGetDurationHours

  // ---------------------------------------------------------------------------
  // ytpGetDurationMinutes
  // Returns the duration minutes of the video
  // ---------------------------------------------------------------------------
  function ytpGetDurationMinutes(player) {
    var duration, minutes, d, m;

    var playerState   = player.getPlayerState();
    var ytPlayerState = YT_PLAYER_STATE_NAMES[playerState];

    var isValidPlayerState = /playing|paused|cued/.test(ytPlayerState);
    if (isValidPlayerState) {
        duration  = ytpGetDuration(player);
        d         = Number(duration);
        m         = Math.floor(d % 3600 / 60);
        minutes   = m.toString().padStart(2, '0');

        return minutes;
    } else {
        return '00';
    }

  } // END ytpGetDurationMinutes

  // ---------------------------------------------------------------------------
  // ytpGetDurationSeconds
  // Returns the duration seconds of the video
  // ---------------------------------------------------------------------------
  function ytpGetDurationSeconds(player) {
    var duration, seconds, d, s;

    var playerState   = player.getPlayerState();
    var ytPlayerState = YT_PLAYER_STATE_NAMES[playerState];

    var isValidPlayerState = /playing|paused|cued/.test(ytPlayerState);
    if (isValidPlayerState) {
        duration  = ytpGetDuration(player);
        d         = Number(duration);
        s         = Math.floor(d % 60);
        seconds   = s.toString().padStart(2, '0');

        return seconds;
    } else {
        return '00';
    }

  } // END ytpGetDurationSeconds

  // ---------------------------------------------------------------------------
  // ytpGetCurrentHours
  // Returns the current hours the user is into the video
  // ---------------------------------------------------------------------------
  function ytpGetCurrentHours(player) {
    var currentTime, hours, d, h;

    var playerState   = player.getPlayerState();
    var ytPlayerState = YT_PLAYER_STATE_NAMES[playerState];

    var isValidPlayerState = /playing|paused/.test(ytPlayerState);
    if (isValidPlayerState) {
        currentTime = ytpGetCurrentTime(player);
        d           = Number(currentTime);
        h           = Math.floor(d / 3600);
        hours       = h.toString().padStart(2, '0');

        return hours;
    } else {
        return '00';
    }

  } // END ytpGetCurrentHours

  // ---------------------------------------------------------------------------
  // ytpGetCurrentMinutes
  // Returns the current minutes the user is into the video
  // ---------------------------------------------------------------------------
  function ytpGetCurrentMinutes (player) {
    var currentTime, minutes, d, m;

    var playerState   = player.getPlayerState();
    var ytPlayerState = YT_PLAYER_STATE_NAMES[playerState];

    var isValidPlayerState = /playing|paused/.test(ytPlayerState);
    if (isValidPlayerState) {
        currentTime = ytpGetCurrentTime(player);
        d           = Number(currentTime);
        m           = Math.floor(d % 3600 / 60);
        minutes     = m.toString().padStart(2, '0');

        return minutes;
    } else {
        return '00';
    }

  } // END ytpGetCurrentMinutes

  // ---------------------------------------------------------------------------
  // ytpGetCurrentSeconds
  // Returns the current seconds the user is into the video
  // ---------------------------------------------------------------------------
  function ytpGetCurrentSeconds(player) {
    var currentTime, seconds, d, s;

    var playerState   = player.getPlayerState();
    var ytPlayerState = YT_PLAYER_STATE_NAMES[playerState];

    var isValidPlayerState = /playing|paused/.test(ytPlayerState);
    if (isValidPlayerState) {
        currentTime = ytpGetCurrentTime(player);
        d           = Number(currentTime);
        s           = Math.floor(d % 60);
        seconds     = s.toString().padStart(2, '0');

        return seconds;
    } else {
        return '00';
    }

  } // END ytpGetCurrentSeconds

  // ---------------------------------------------------------------------------
  // togglePlayPauseButton
  // toggle button play|pause
  // ---------------------------------------------------------------------------
  function togglePlayPauseButton(elementClass) {
    var button, htmlElement;

    button = document.getElementsByClassName(elementClass);

    if (button.length) {
      htmlElement = button[0];

      if (htmlElement.classList.contains('amplitude-paused')) {
        htmlElement.classList.remove('amplitude-paused');
        htmlElement.classList.add('amplitude-playing');
      } else {
        htmlElement.classList.remove('amplitude-playing');
        htmlElement.classList.add('amplitude-paused');
      }
    } else {
      return false;
    }

  } // END togglePlayPauseButton

  // ---------------------------------------------------------------------------
  // setPlayPauseButtonPaused 
  // ---------------------------------------------------------------------------
  function setPlayPauseButtonPaused(element) {

    element.classList.remove('amplitude-playing');
    element.classList.add('amplitude-paused');

  } // END setPlayPauseButtonPaused

  // ---------------------------------------------------------------------------
  // setPlayPauseButtonPlaying 
  // ---------------------------------------------------------------------------
  function setPlayPauseButtonPlaying(element) {

    element.classList.remove('amplitude-paused');
    element.classList.add('amplitude-playing');

  } // END setPlayPauseButtonPlaying

  // ---------------------------------------------------------------------------
  // scrollToActiveElement(playlist)
  // ---------------------------------------------------------------------------  
  function scrollToActiveElement(activePlaylist) {
    const scrollableList        = document.getElementById('large_player_title_list_' + activePlaylist);
    const activeElement         = scrollableList.querySelector('.amplitude-active-song-container');
    var activeElementOffsetTop  = activeElement.offsetTop;
    var songIndex               = parseInt(activeElement.getAttribute("data-amplitude-song-index"));
    // Fix Amplitude plugin #2
    // Original (deprecated, preserved for reference):
    // var activeElementOffsetTop  = songIndex * j1.adapter.amplitude.data.playerSongElementHeigth;
    var activeElementOffsetTop  = songIndex * ytpHostData().playerSongElementHeigth;

    if (scrollableList && activeElement) {
      scrollableList.scrollTop = activeElementOffsetTop;
    }
  } // END scrollToActiveElement

  // ---------------------------------------------------------------------------
  // mimikYTPlayerUiEventsForAJS
  // Mimik AJS button events for YT video
  // ---------------------------------------------------------------------------  
  function mimikYTPlayerUiEventsForAJS(ytPlayerID) {

    // Fix Amplitude plugin #2
    // Original (deprecated, preserved for reference):
    // if (j1.adapter.amplitude['data']['ytPlayers'][ytPlayerID] !== undefined) {
    // var playerDefaults = j1.adapter.amplitude['data']['ytPlayers'][ytPlayerID].playerDefaults;
    // var playerSettings = j1.adapter.amplitude['data']['ytPlayers'][ytPlayerID].playerSettings;
    if (ytpHostData()['ytPlayers'][ytPlayerID] !== undefined) {
      var playerDefaults = ytpHostData()['ytPlayers'][ytPlayerID].playerDefaults;
      var playerSettings = ytpHostData()['ytPlayers'][ytPlayerID].playerSettings;
      var playerButton   = `large-player-play-pause-${ytPlayerID}`;

      // -----------------------------------------------------------------------
      // Large AJS players
      // -----------------------------------------------------------------------
      // Fix Amplitude plugin #2
      // Original (deprecated, preserved for reference):
      // if (j1.adapter.amplitude['data']['ytPlayers'][ytPlayerID].playerSettings.type === 'large') { 
      // var playlist             = j1.adapter.amplitude['data']['ytPlayers'][ytPlayerID].playerSettings.playlist.name;
      if (ytpHostData()['ytPlayers'][ytPlayerID].playerSettings.type === 'large') { 
        var playlist             = ytpHostData()['ytPlayers'][ytPlayerID].playerSettings.playlist.name;
        var playerScrollList     = document.getElementById('large_player_title_list_' + playlist);

        if (playerScrollControl) {
          // J1 Amplitude optimizations #1
          // BUG FIX (3 problems in this block):
          //
          // 1. `playerSongElementHeigth` was used as a free identifier but
          //    never declared anywhere in this scope. The actual storage
          //    location is `j1.adapter.amplitude.data.playerSongElementHeigth`
          //    (the misspelling -- "Heigth" -- is preserved because that
          //    same key is read elsewhere in the codebase; renaming it
          //    here would silently break the contract). The next major
          //    pass should rename the property in *all* read sites.
          //
          // 2. Inside the scroll handler, `list.scrollTop` and `list.scrollTo`
          //    referenced an identifier `list` that was never declared --
          //    a runtime ReferenceError on the very first scroll event.
          //    The intended target is the bound element `playerScrollList`.
          //
          // 3. The handler was added unconditionally even when
          //    `playerScrollList` is null (no playlist DOM on the page),
          //    which would throw at .addEventListener. Added a null guard.
          //
          // Fix Amplitude plugin #2
          // Original (deprecated, preserved for reference):
          // var songElementHeight     = j1.adapter.amplitude.data.playerSongElementHeigth || 0;
          var songElementHeight     = ytpHostData().playerSongElementHeigth || 0;
          var listItemHeight        = songElementHeight / 2;
          var itemsPerBlock         = 1;
          var isScrollingResetDelay = 150;
          var isScrolling           = false;

          if (playerScrollList) {
            playerScrollList.addEventListener('scroll', (event) => {
              // block multiple scroll events (while scrolling)
              if (isScrolling) {
                return;
              }
              isScrolling = true;

              // calculate number of blocks already scrolled
              const scrolledBlocks = Math.round(
                playerScrollList.scrollTop / (listItemHeight * itemsPerBlock)
              );

              // calculate top position based on number of blocks
              const targetScrollTop = scrolledBlocks * listItemHeight * itemsPerBlock;

              // smooth scrolling
              playerScrollList.scrollTo({
                top: targetScrollTop,
                behavior: 'smooth'
              });

              // reset the scrolling flags
              setTimeout(() => {
                isScrolling = false;
              }, isScrollingResetDelay);
            });
          }
        }

        // Overload ytp play_pause button for YT
        // ---------------------------------------------------------------------
        var largePlayerPlayPauseButton = document.getElementsByClassName(playerButton);
        for (var i=0; i<largePlayerPlayPauseButton.length; i++) {          
          var classArray  = [].slice.call(largePlayerPlayPauseButton[i].classList, 0);
          var classString = classArray.toString();

          if (classString.includes(ytPlayerID)) {
            largePlayerPlayPauseButton[i].addEventListener('click', function(event) {
              var activeSong, songs, songMetaData, playerData,
                  ytPlayer, playerState, ytPlayerState, playlist,
                  playerID, songIndex;

              playlist    = this.getAttribute("data-amplitude-playlist");
              playerID    = this.getAttribute("data-amplitude-player");
              activeSong  = getActiveSong();

              if (!activeSong) {
                songIndex     = 0;
                ytpSongIndex  = 0;
              } else {
                if (activeSong.playlist !== playlist) {
                  songIndex    = 0;
                  ytpSongIndex = 0;
                } else {
                  songIndex = ytpSongIndex;
                }
              } // END if activeSong

              // Fix Amplitude plugin #2
              // Original (deprecated, preserved for reference):
              // if (j1.adapter.amplitude.data.ytpGlobals.ytApiError > 0) {
              if (ytpHostData().ytpGlobals.ytApiError > 0) {
                // do nothing on API errors
                var trackID = songIndex + 1;
                // Fix Amplitude plugin #2
                // Original (deprecated, preserved for reference):
                // logger.error('\n' + `DISABLED player for playlist|trackID: ${playlist}|${trackID} on API error '${YT_PLAYER_ERROR_NAMES[j1.adapter.amplitude.data.ytpGlobals.ytApiError]}'`);
                logger.error('\n' + `DISABLED player for playlist|trackID: ${playlist}|${trackID} on API error '${YT_PLAYER_ERROR_NAMES[ytpHostData().ytpGlobals.ytApiError]}'`);

                return;
              }

              // Fix Amplitude plugin #2
              // Original (deprecated, preserved for reference):
              // playerData    = j1.adapter.amplitude.data.ytPlayers[playerID];
              playerData    = ytpHostData().ytPlayers[playerID];
              ytPlayer      = playerData.player;
              songIndex     = playerData.activeIndex;
              songs         = playerData.songs;           

              // save player GLOBAL data for later use (e.g. events)
              // Fix Amplitude plugin #2
              // Original (deprecated, preserved for reference):
              // j1.adapter.amplitude.data.activePlayer                 = 'ytp';
              // j1.adapter.amplitude.data.ytpGlobals['activeIndex']    = songIndex;
              // j1.adapter.amplitude.data.ytpGlobals['activePlaylist'] = playlist;
              ytpHostData().activePlayer                 = 'ytp';
              ytpHostData().ytpGlobals['activeIndex']    = songIndex;
              ytpHostData().ytpGlobals['activePlaylist'] = playlist;

              // toggle YT play|pause video
              // ---------------------------------------------------------------
              playerState   = ytPlayer.getPlayerState();
              // J1 Amplitude optimizations #1
              // CLARITY: With the YT_PLAYER_STATE_NAMES table now containing
              // a real "-1" key (Fix #1), direct lookup is sufficient and
              // there is no need for the magic-6 fallback workaround.
              ytPlayerState = YT_PLAYER_STATE_NAMES[playerState] || 'unstarted';

              // NOTE:
              // ---------------------------------------------------------------
              // unclear why player state 'cued' occurs
              // ---------------------------------------------------------------              
              // load (cued) video
              if (ytPlayerState === 'cued' || ytPlayerState === 'unstarted' ) {
                ytPlayer.playVideo();

                // wait for API error state
                setTimeout(() => {
                  // Fix Amplitude plugin #2
                  // Original (deprecated, preserved for reference):
                  // if (j1.adapter.amplitude.data.ytpGlobals.ytApiError > 0) {
                  if (ytpHostData().ytpGlobals.ytApiError > 0) {
                    var trackID = songIndex + 1;
                    // Fix Amplitude plugin #2
                    // Original (deprecated, preserved for reference):
                    // logger.error('\n' + `DISABLED player for playlist|trackID: ${playlist}|${trackID} on API error '${YT_PLAYER_ERROR_NAMES[j1.adapter.amplitude.data.ytpGlobals.ytApiError]}'`);
                    logger.error('\n' + `DISABLED player for playlist|trackID: ${playlist}|${trackID} on API error '${YT_PLAYER_ERROR_NAMES[ytpHostData().ytpGlobals.ytApiError]}'`);

                    // do nothing on API errors
                    return;
                  }

                  // reset progress bar settings
                  resetProgressBarYTP();                    

                  var playPauseButtonClass = `large-player-play-pause-${ytPlayerID}`;
                  togglePlayPauseButton(playPauseButtonClass);

                  // set song at songIndex active in playlist
                  setSongActive(playlist, songIndex);

                  // scroll song active at index in player
                  if (playerAutoScrollSongElement) {
                    scrollToActiveElement(playlist);
                  }

                  // reset|update time settings
                  resetCurrentTimeContainerYTP(ytPlayer, playlist);
                  updateDurationTimeContainerYTP(ytPlayer, playlist);

                }, 100);

                return;
              } // END if ytPlayerState === 'cued'              

              // NOTE:
              // ---------------------------------------------------------------
              // unclear why player state 'cued'
              // is folloed by 'unstarted'|'buffering' on playing
              // ---------------------------------------------------------------
              // TOGGLE state 'playing' => 'paused'
              var isValidPlayerState = /playing|unstarted|buffering/.test(ytPlayerState);
              if (isValidPlayerState) {
                ytPlayer.pauseVideo();

                ytPlayerCurrentTime = ytPlayer.getCurrentTime();

                var playPauseButtonClass = `large-player-play-pause-${ytPlayerID}`;
                togglePlayPauseButton(playPauseButtonClass);

                // reset|update time settings
                resetCurrentTimeContainerYTP(ytPlayer, playlist);
                updateDurationTimeContainerYTP(ytPlayer, playlist);                
              }

              // TOGGLE state 'paused' => 'playing'
              if (ytPlayerState === 'paused') {
                ytPlayer.playVideo();
                ytpSeekTo(ytPlayer, ytPlayerCurrentTime, true);

                var trackID =  songIndex + 1;
                isDev && logger.debug('\n' + `PLAY video for PlayPauseButton on playlist|trackID: ${playlist}|${trackID} at: ${ytPlayerCurrentTime}`);

                var playPauseButtonClass = `large-player-play-pause-${ytPlayerID}`;
                togglePlayPauseButton(playPauseButtonClass);

                // reset|update time settings
                resetCurrentTimeContainerYTP(ytPlayer, playlist);
                updateDurationTimeContainerYTP(ytPlayer, playlist);                  
              } // if ytPlayerState === 'paused'

              // deactivate AJS events (if any)
              event.stopImmediatePropagation();

            }); // END EventListener largePlayerPlayPauseButton 'click
          } // END if classString
        } // END for largePlayerPlayPauseButton

        // Overload AJS largePlayerSkipBackward button for YT
        // ---------------------------------------------------------------------
        var largePlayerSkipForwardButtons = document.getElementsByClassName("large-player-skip-forward");
        for (var i=0; i<largePlayerSkipForwardButtons.length; i++) {
          var classArray  = [].slice.call(largePlayerSkipForwardButtons[i].classList, 0);
          var classString = classArray.toString();

          // load player settings
          var playerForwardBackwardSkipSeconds = (playerSettings.forward_backward_skip_seconds === undefined) ? playerDefaults.forward_backward_skip_seconds : playerSettings.forward_backward_skip_seconds;

          if (classString.includes(ytPlayerID)) {
            largePlayerSkipForwardButtons[i].addEventListener('click', function(event)  {
              var currentVideoTime, playerState, skipOffset, ytPlayer;

              skipOffset        = parseInt(playerForwardBackwardSkipSeconds);
              // Fix Amplitude plugin #2
              // Original (deprecated, preserved for reference):
              // ytPlayer          = j1.adapter.amplitude['data']['ytPlayers'][ytPlayerID].player;
              ytPlayer          = ytpHostData()['ytPlayers'][ytPlayerID].player;
              playerState       = ytPlayer.getPlayerState();
              currentVideoTime  = ytPlayer.getCurrentTime();

              if (playerState === YT_PLAYER_STATE.PLAYING || playerState === YT_PLAYER_STATE.PAUSED) {
                isDev && logger.debug('\n' + `SKIP forward on Button skipForward for ${skipOffset} seconds`);
                ytpSeekTo(ytPlayer, currentVideoTime + skipOffset, true);
              }

            // deactivate AJS events (if any)
            event.stopImmediatePropagation();
            }); // END eventListener
          } // END if classString.includes(ytPlayerID
        } // END for largePlayerSkipForwardButtons 

        // Overload AJS largePlayerSkipBackward button for YT
        // ---------------------------------------------------------------------
        var largePlayerSkipBackwardButtons = document.getElementsByClassName("large-player-skip-backward");
        for (var i=0; i<largePlayerSkipBackwardButtons.length; i++) {
          var classArray  = [].slice.call(largePlayerSkipBackwardButtons[i].classList, 0);
          var classString = classArray.toString();

          // load player settings
          var playerForwardBackwardSkipSeconds = (playerSettings.forward_backward_skip_seconds === undefined) ? playerDefaults.forward_backward_skip_seconds : playerSettings.forward_backward_skip_seconds;

          if (classString.includes(ytPlayerID)) {
            largePlayerSkipBackwardButtons[i].addEventListener('click', function(event)  {
              var currentVideoTime, playerState, skipOffset, ytPlayer;

              skipOffset        = parseInt(playerForwardBackwardSkipSeconds);
              // Fix Amplitude plugin #2
              // Original (deprecated, preserved for reference):
              // ytPlayer          = j1.adapter.amplitude['data']['ytPlayers'][ytPlayerID].player;
              ytPlayer          = ytpHostData()['ytPlayers'][ytPlayerID].player;
              playerState       = ytPlayer.getPlayerState();
              currentVideoTime  = ytPlayer.getCurrentTime();

              if (playerState === YT_PLAYER_STATE.PLAYING || playerState === YT_PLAYER_STATE.PAUSED) {
                isDev && logger.debug('\n' + `SKIP backward on Button skipBackward for ${skipOffset} seconds`);
                ytpSeekTo(ytPlayer, currentVideoTime - skipOffset, true);
              }

              // deactivate AJS events (if any)
              event.stopImmediatePropagation();            
            }); // END Listener 'click'
          } // END if skip-backward button
        } // END for

        // Overload AJS largePlayerNext button for YT
        // ---------------------------------------------------------------------
        var largePlayerNextButton = document.getElementsByClassName("large-player-next");
        for (var i=0; i<largePlayerNextButton.length; i++) {
          var classArray  = [].slice.call(largePlayerNextButton[i].classList, 0);
          var classString = classArray.toString();

          if (classString.includes(ytPlayerID)) {
            largePlayerNextButton[i].addEventListener('click', function(event) {
              var playlist, playerID, songIndex, trackID,
                  songs, songMetaData, songName, songURL,
                  ytPlayer, ytpVideoID;

              songIndex = ytpSongIndex;
              playlist  = this.getAttribute("data-amplitude-playlist");
              playerID  = this.getAttribute("data-amplitude-player");
              // Fix Amplitude plugin #2
              // Original (deprecated, preserved for reference):
              // songs     = j1.adapter.amplitude.data.ytPlayers[playerID].songs;
              // ytPlayer  = j1.adapter.amplitude.data.ytPlayers[playerID].player;
              songs     = ytpHostData().ytPlayers[playerID].songs;
              ytPlayer  = ytpHostData().ytPlayers[playerID].player;

              // Fix Amplitude plugin #2
              // Original (deprecated, preserved for reference):
              // if (j1.adapter.amplitude.data.ytpGlobals.ytApiError > 0) {
              if (ytpHostData().ytpGlobals.ytApiError > 0) {
                // do nothing on API errors
                var trackID = songIndex + 1;
                // Fix Amplitude plugin #2
                // Original (deprecated, preserved for reference):
                // logger.error('\n' + `DISABLED player for playlist|trackID: ${playlist}|${trackID} on API error '${YT_PLAYER_ERROR_NAMES[j1.adapter.amplitude.data.ytpGlobals.ytApiError]}'`);
                logger.error('\n' + `DISABLED player for playlist|trackID: ${playlist}|${trackID} on API error '${YT_PLAYER_ERROR_NAMES[ytpHostData().ytpGlobals.ytApiError]}'`);

                return;
              }

              if (ytPlayer === undefined) {
                logger.error('\n' + 'YT player not defined');
              }

              // select video
              if (songIndex < songs.length-1) {
                // select NEXT video
                songIndex++;                
                ytpSongIndex = songIndex;
              } else {
                // select FIRST video
                songIndex    = 0; 
                ytpSongIndex = songIndex;           
              }

              // set song (video)^meta data
              songMetaData  = songs[songIndex];
              songURL       = songMetaData.url;
              ytpVideoID    = songURL.split('=')[1];

              // load next video
              // ---------------------------------------------------------------

              // save YT player GLOBAL data for later use (e.g. events)
              // Fix Amplitude plugin #2
              // Original (deprecated, preserved for reference):
              // j1.adapter.amplitude.data.activePlayer                 = 'ytp';
              // j1.adapter.amplitude.data.ytpGlobals['activeIndex']    = songIndex;
              // j1.adapter.amplitude.data.ytpGlobals['activePlaylist'] = playlist;
              ytpHostData().activePlayer                 = 'ytp';
              ytpHostData().ytpGlobals['activeIndex']    = songIndex;
              ytpHostData().ytpGlobals['activePlaylist'] = playlist;

              // save YT player data for later use (e.g. events)
              // Fix Amplitude plugin #2
              // Original (deprecated, preserved for reference):
              // j1.adapter.amplitude.data.ytPlayers[playerID].activeIndex = songIndex;
              // j1.adapter.amplitude.data.ytPlayers[playerID].videoID     = ytpVideoID;
              ytpHostData().ytPlayers[playerID].activeIndex = songIndex;
              ytpHostData().ytPlayers[playerID].videoID     = ytpVideoID;

              // save amplitudejs data for later use (e.g. events)
              // ---------------------------------------------------------------
              // Fix AudioPlayer #3
              // Original (deprecated, preserved for reference):
              // j1.modules.amplitudejs.data.ytp.activeIndex = songIndex;
              // j1.modules.amplitudejs.data.ytp.activePlaylist = playlist;
              // j1.modules.amplitudejs.data.ytp.players[playerID].player = ytPlayer;
              // j1.modules.amplitudejs.data.ytp.players[playerID].activeIndex = songIndex;
              ytpHostModuleYtp().activeIndex = songIndex;
              ytpHostModuleYtp().activePlaylist = playlist;
              ytpHostModuleYtp().players[playerID].player = ytPlayer;
              ytpHostModuleYtp().players[playerID].activeIndex = songIndex;

              trackID = songIndex + 1;
              isDev && logger.debug('\n' + `SWITCH video for PlayerNextButton at trackID|VideoID: ${trackID}|${ytpVideoID}`);
              ytPlayer.loadVideoById(ytpVideoID);

              // delay after switch video
              if (muteAfterVideoSwitchInterval) {
                ytPlayer.mute();
                setTimeout(() => {
                  ytPlayer.unMute();
                }, muteAfterVideoSwitchInterval);
              }

              if (songIndex === 0) {

                // continue paused on FIRST video
                // TODO: handle on player|shuffle different (do play)
                ytPlayer.pauseVideo();

                // reset|update time settings
                resetCurrentTimeContainerYTP(ytPlayer, playlist);
                updateDurationTimeContainerYTP(ytPlayer, playlist);
                resetProgressBarYTP();

                // set AJS play_pause button paused
                var playPauseButtonClass = `large-player-play-pause-${ytPlayerID}`;
                togglePlayPauseButton(playPauseButtonClass);
              } else {
                // toggle AJS play_pause button
                var playPauseButtonClass = `large-player-play-pause-${ytPlayerID}`;
                togglePlayPauseButton(playPauseButtonClass);
              }

              // reset|update current time settings
              resetCurrentTimeContainerYTP(ytPlayer, playlist);
              updateDurationTimeContainerYTP(ytPlayer, playlist);
              resetProgressBarYTP();

              // load the song cover image
              loadCoverImage(songMetaData);

              // update meta data
              // ytpUpdatMetaContainers(songMetaData);

              // set song at songIndex active in playlist
              setSongActive(playlist, songIndex);

              // scroll song active at index in player
              if (playerAutoScrollSongElement) {
                scrollToActiveElement(playlist);
              }

              // deactivate AJS events (if any)
              event.stopImmediatePropagation();

            }); // END EventListener 'click' next button
          } // END if classString.includes(ytPlayerID)

      } // END for largePlayerNextButton

      // Overload AJS largePlayerPrevious button for YT
      // -----------------------------------------------------------------------
      var largePlayePreviousButton = document.getElementsByClassName("large-player-previous");
      for (var i=0; i<largePlayePreviousButton.length; i++) {
        var classArray  = [].slice.call(largePlayePreviousButton[i].classList, 0);
        var classString = classArray.toString();

        if (classString.includes(ytPlayerID)) {
          largePlayePreviousButton[i].addEventListener('click', function(event) {
            var playlist, playerID, songIndex, trackID,
                songs, songMetaData, songName, songURL,
                ytPlayer, ytpVideoID;

            songIndex = ytpSongIndex;
            playlist  = this.getAttribute("data-amplitude-playlist");
            playerID  = this.getAttribute("data-amplitude-player");
            // Fix Amplitude plugin #2
            // Original (deprecated, preserved for reference):
            // songs     = j1.adapter.amplitude.data.ytPlayers[playerID].songs;
            // ytPlayer  = j1.adapter.amplitude.data.ytPlayers[playerID].player;
            songs     = ytpHostData().ytPlayers[playerID].songs;
            ytPlayer  = ytpHostData().ytPlayers[playerID].player;

            // Fix Amplitude plugin #2
            // Original (deprecated, preserved for reference):
            // if (j1.adapter.amplitude.data.ytpGlobals.ytApiError > 0) {
            if (ytpHostData().ytpGlobals.ytApiError > 0) {
              // do nothing on API errors
              var trackID = songIndex + 1;
              // Fix Amplitude plugin #2
              // Original (deprecated, preserved for reference):
              // logger.error('\n' + `DISABLED player for playlist|trackID: ${playlist}|${trackID} on API error '${YT_PLAYER_ERROR_NAMES[j1.adapter.amplitude.data.ytpGlobals.ytApiError]}'`);
              logger.error('\n' + `DISABLED player for playlist|trackID: ${playlist}|${trackID} on API error '${YT_PLAYER_ERROR_NAMES[ytpHostData().ytpGlobals.ytApiError]}'`);

              return;
            }

            if (ytPlayer === undefined) {
              logger.error('\n' + 'YT player not defined');
            }

            // select video
            if (songIndex > 0 && songIndex <= songs.length - 1) {
              // select NEXT video
              songIndex--;                
              ytpSongIndex = songIndex;
            } else {
              // select FIRST video
              songIndex    = 0; 
              ytpSongIndex = songIndex;           
            }

            // set song (video)^meta data
            songMetaData  = songs[songIndex];
            songURL       = songMetaData.url;
            ytpVideoID    = songURL.split('=')[1];

            // save YT player GLOBAL data for later use (e.g. events)
            // Fix Amplitude plugin #2
            // Original (deprecated, preserved for reference):
            // j1.adapter.amplitude.data.activePlayer                 = 'ytp';
            // j1.adapter.amplitude.data.ytpGlobals['activeIndex']    = songIndex;
            // j1.adapter.amplitude.data.ytpGlobals['activePlaylist'] = playlist;
            ytpHostData().activePlayer                 = 'ytp';
            ytpHostData().ytpGlobals['activeIndex']    = songIndex;
            ytpHostData().ytpGlobals['activePlaylist'] = playlist;

            // save amplitudejs data for later use (e.g. events)
            // -----------------------------------------------------------------
            // J1 Amplitude optimizations #1
            // BUG FIX: The original wrote `songIndex` (a number) into
            // `activePlayer` and `activePlaylist`. By inspection of every
            // other write site, the correct values are the strings 'ytp'
            // and the playlist name -- consumers downstream rely on these
            // being string identifiers, not the numeric song index.
            //
            // Fix AudioPlayer #3
            // Original (deprecated, preserved for reference):
            // j1.modules.amplitudejs.data.activePlayer = 'ytp';
            // j1.modules.amplitudejs.data.activeIndex = songIndex;
            // j1.modules.amplitudejs.data.activePlaylist = playlist;
            // j1.modules.amplitudejs.data.ytp.activeIndex = songIndex;
            // j1.modules.amplitudejs.data.ytp.activePlaylist = playlist;
            // j1.modules.amplitudejs.data.ytp.players[playerID].player = ytPlayer;
            // j1.modules.amplitudejs.data.ytp.players[playerID].activeIndex = songIndex;
            ytpHostModuleData().activePlayer = 'ytp';
            ytpHostModuleData().activeIndex = songIndex;
            ytpHostModuleData().activePlaylist = playlist;
            ytpHostModuleYtp().activeIndex = songIndex;
            ytpHostModuleYtp().activePlaylist = playlist;
            ytpHostModuleYtp().players[playerID].player = ytPlayer;
            ytpHostModuleYtp().players[playerID].activeIndex = songIndex;   

            // load previous video
            // -----------------------------------------------------------------

            // save YT player data for later use (e.g. events)
            // Fix Amplitude plugin #2
            // Original (deprecated, preserved for reference):
            // j1.adapter.amplitude.data.activePlayer                    = 'ytp';
            // j1.adapter.amplitude.data.ytPlayers[playerID].activeIndex = songIndex;
            // j1.adapter.amplitude.data.ytPlayers[playerID].videoID     = ytpVideoID; 
            ytpHostData().activePlayer                    = 'ytp';
            ytpHostData().ytPlayers[playerID].activeIndex = songIndex;
            ytpHostData().ytPlayers[playerID].videoID     = ytpVideoID; 

            trackID = songIndex + 1;
            isDev && logger.debug('\n' + `SWITCH video for PlayePreviousButton at trackID|VideoID: ${trackID}|${ytpVideoID}`);
            ytPlayer.loadVideoById(ytpVideoID);

            // delay after switch video
            if (muteAfterVideoSwitchInterval) {
              ytPlayer.mute();
              setTimeout(() => {
                ytPlayer.unMute();
              }, muteAfterVideoSwitchInterval);
            }

            if (songIndex === 0) {

              // continue paused on FIRST video
              // TODO: handle on player|shuffle different (do play)
              ytPlayer.pauseVideo();

              // reset|update time settings
              resetCurrentTimeContainerYTP(ytPlayer, playlist);
              updateDurationTimeContainerYTP(ytPlayer, playlist);
              resetProgressBarYTP();

              // set AJS play_pause button paused
              var playPauseButtonClass = `large-player-play-pause-${ytPlayerID}`;
              togglePlayPauseButton(playPauseButtonClass);
            } else {
              // toggle AJS play_pause button
              var playPauseButtonClass = `large-player-play-pause-${ytPlayerID}`;
              togglePlayPauseButton(playPauseButtonClass);
            }

            // reset|update current time settings
            resetCurrentTimeContainerYTP(ytPlayer, playlist);
            updateDurationTimeContainerYTP(ytPlayer, playlist);
            resetProgressBarYTP();

            // load the song cover image
            loadCoverImage(songMetaData);

            // update meta data
            // ytpUpdatMetaContainers(songMetaData);

            // set song at songIndex active in playlist
            setSongActive(playlist, songIndex);

            // scroll song active at index in player
            if (playerAutoScrollSongElement) {
              scrollToActiveElement(playlist);
            }

            // deactivate AJS events (if any)
            event.stopImmediatePropagation();

          }); // END EventListener 'click' next button
        } // END if classString.includes(ytPlayerID)

    } // END for largePlayerNextButton

    // click on song container
    // -------------------------------------------------------------------------
    var largePlayerSongContainer = document.getElementsByClassName("amplitude-song-container");
    for (var i=0; i<largePlayerSongContainer.length; i++) {
      var classArray  = [].slice.call(largePlayerSongContainer[i].classList, 0);
      var classString = classArray.toString();

      if (classString.includes(ytPlayerID)) {
        largePlayerSongContainer[i].addEventListener('click', function(event) {
          var activeSong, playlist, player, playerID,
              playerState, ytPlayerState,
              songs, songIndex, songName, singleAudio, trackID,
              ytPlayer, ytpVideoID, activeSongIndex, isSongIndexChanged;

          // set (current) playlist|song data
          // jadams, 2026-07-15: playerID, added data-amplitude-player (used by ytp)
          // -------------------------------------------------------------------
          playlist            = this.getAttribute("data-amplitude-playlist");
          playerID            = this.getAttribute("data-amplitude-player");
          songIndex           = parseInt(this.getAttribute("data-amplitude-song-index"));
          trackID             = songIndex + 1;
          // Fix Amplitude plugin #2
          // Original (deprecated, preserved for reference):
          // activeSongIndex     = j1.adapter.amplitude.data.ytPlayers[playerID].activeIndex;
          activeSongIndex     = ytpHostData().ytPlayers[playerID].activeIndex;
          isSongIndexChanged  = activeSongIndex !== songIndex;

          // set (current) song meta data
          // -------------------------------------------------------------------
          // Fix Amplitude plugin #2
          // Original (deprecated, preserved for reference):
          // songs               = j1.adapter.amplitude.data.ytPlayers[playerID].songs;
          songs               = ytpHostData().ytPlayers[playerID].songs;
          songMetaData        = songs[songIndex];
          songURL             = songMetaData.url;
          ytpVideoID          = (ytPlayerErrorTest) ? 'invalidVideoID' : songURL.split('=')[1];
          // Fix Amplitude plugin #2
          // Original (deprecated, preserved for reference):
          // ytPlayer            = j1.adapter.amplitude.data.ytPlayers[playerID].player;
          ytPlayer            = ytpHostData().ytPlayers[playerID].player;
          playerState         = ytPlayer.getPlayerState();
          ytPlayerState       = YT_PLAYER_STATE_NAMES[playerState] || 'unstarted';

          // NOTE:
          // -------------------------------------------------------------------
          // unclear why player state 'cued' occurs
          // -------------------------------------------------------------------              
          // load (cued) video
          if (ytPlayerState === 'cued') {
            ytPlayer.playVideo();

            // wait for API error state
            setTimeout(() => {
              // Fix Amplitude plugin #2
              // Original (deprecated, preserved for reference):
              // if (j1.adapter.amplitude.data.ytpGlobals.ytApiError > 0) {
              if (ytpHostData().ytpGlobals.ytApiError > 0) {
                var trackID = songIndex + 1;
                // Fix Amplitude plugin #2
                // Original (deprecated, preserved for reference):
                // logger.error('\n' + `DISABLED player for playlist|trackID: ${playlist}|${trackID} on API error '${YT_PLAYER_ERROR_NAMES[j1.adapter.amplitude.data.ytpGlobals.ytApiError]}'`);
                logger.error('\n' + `DISABLED player for playlist|trackID: ${playlist}|${trackID} on API error '${YT_PLAYER_ERROR_NAMES[ytpHostData().ytpGlobals.ytApiError]}'`);

                // do nothing on API errors
                return;
              }

              // reset progress bar settings
              resetProgressBarYTP();                    

              var playPauseButtonClass = `large-player-play-pause-${ytPlayerID}`;
              togglePlayPauseButton(playPauseButtonClass);

              // set song at songIndex active in playlist
              setSongActive(playlist, songIndex);

              // scroll song active at index in player
              if (playerAutoScrollSongElement) {
                scrollToActiveElement(playlist);
              }

              // reset|update time settings
              resetCurrentTimeContainerYTP(ytPlayer, playlist);
              updateDurationTimeContainerYTP(ytPlayer, playlist);

            }, 100);

            return;
          } // END if ytPlayerState === 'cued'

          // TOGGLE state 'playing' => 'paused' if video (audio) NOT changed
          if (!isSongIndexChanged && ytPlayerState === 'playing') {
            ytPlayer.pauseVideo();
              // get active song settings (manually)
              activeSong = getActiveSong();

              // J1 Amplitude optimizations #1
              // CLEANUP: The original branched on `activeSong.playlist !==
              // playlist` and ran identical bodies in both arms (and again
              // in the outer else). All three branches assign the same
              // `songs` and `ytPlayer` from the same source, so the
              // conditional is dead code. Reduced to a single assignment.
              //
              // Fix Amplitude plugin #2
              // Original (deprecated, preserved for reference):
              // songs     = j1.adapter.amplitude.data.ytPlayers[playerID].songs;
              // ytPlayer  = j1.adapter.amplitude.data.ytPlayers[playerID].player;
              songs     = ytpHostData().ytPlayers[playerID].songs;
              ytPlayer  = ytpHostData().ytPlayers[playerID].player;

              ytPlayerCurrentTime = ytPlayer.getCurrentTime();

              var trackID = songIndex + 1;
              isDev && logger.debug('\n' + `PAUSE video for PlayerSongContainer on playlist|trackID: ${playlist}|${trackID} at: ${ytPlayerCurrentTime}`);

              var playPauseButtonClass = `large-player-play-pause-${ytPlayerID}`;
              togglePlayPauseButton(playPauseButtonClass);

              // reset|update time settings
              resetCurrentTimeContainerYTP(ytPlayer, playlist);
              updateDurationTimeContainerYTP(ytPlayer, playlist);

              // save YT player data for later use (e.g. events)
              // ---------------------------------------------------------------
              ytpSongIndex = songIndex;
              // Fix AudioPlayer #3
              // Original (deprecated, preserved for reference):
              // j1.modules.amplitudejs.data.ytp.songIndex = songIndex;
              ytpHostModuleYtp().songIndex = songIndex;

              // save YT player GLOBAL data for later use (e.g. events)
              // Fix Amplitude plugin #2
              // Original (deprecated, preserved for reference):
              // j1.adapter.amplitude.data.activePlayer                 = 'ytp';
              // j1.adapter.amplitude.data.ytpGlobals['activeIndex']    = songIndex;
              // j1.adapter.amplitude.data.ytpGlobals['activePlaylist'] = playlist;            
              ytpHostData().activePlayer                 = 'ytp';
              ytpHostData().ytpGlobals['activeIndex']    = songIndex;
              ytpHostData().ytpGlobals['activePlaylist'] = playlist;            

              // save YT player data for later use (e.g. events)
              // Fix Amplitude plugin #2
              // Original (deprecated, preserved for reference):
              // j1.adapter.amplitude.data.ytPlayers[playerID].activeIndex = songIndex;
              // j1.adapter.amplitude.data.ytPlayers[playerID].videoID     = ytpVideoID;
              ytpHostData().ytPlayers[playerID].activeIndex = songIndex;
              ytpHostData().ytPlayers[playerID].videoID     = ytpVideoID;

              // save amplitudejs data for later use (e.g. events)
              // -----------------------------------------------------------------
              // J1 Amplitude optimizations #1
              // BUG FIX: The original wrote the YT player INSTANCE into
              // `activePlayer`. Every other write site sets it to the
              // string 'ytp'. Downstream consumers compare against
              // strings, not objects, so this assignment broke the
              // active-player check exactly while a YT video was paused.
              //
              // Fix AudioPlayer #3
              // Original (deprecated, preserved for reference):
              // j1.modules.amplitudejs.data.activePlayer = 'ytp';
              // j1.modules.amplitudejs.data.activeIndex = songIndex;
              // j1.modules.amplitudejs.data.activePlaylist = playlist;
              // j1.modules.amplitudejs.data.ytp.activeIndex = songIndex;
              // j1.modules.amplitudejs.data.ytp.activePlaylist = playlist;
              // j1.modules.amplitudejs.data.ytp.players[playerID].player = ytPlayer;
              // j1.modules.amplitudejs.data.ytp.players[playerID].activeIndex = songIndex;
              // j1.modules.amplitudejs.data.ytp.players[playerID].ytpVideoID = ytpVideoID;
              ytpHostModuleData().activePlayer = 'ytp';
              ytpHostModuleData().activeIndex = songIndex;
              ytpHostModuleData().activePlaylist = playlist;
              ytpHostModuleYtp().activeIndex = songIndex;
              ytpHostModuleYtp().activePlaylist = playlist;
              ytpHostModuleYtp().players[playerID].player = ytPlayer;
              ytpHostModuleYtp().players[playerID].activeIndex = songIndex;
              ytpHostModuleYtp().players[playerID].ytpVideoID = ytpVideoID;

              // reset|update current time settings
              resetCurrentTimeContainerYTP(ytPlayer, playlist);
              updateDurationTimeContainerYTP(ytPlayer, playlist);
              resetProgressBarYTP();

              // load the song cover image
              loadCoverImage(songMetaData);

              // update meta data
              // ytpUpdatMetaContainers(songMetaData);

              // set song at songIndex active in playlist
              setSongActive(playlist, songIndex);

              // scroll song active at index in player
              if (playerAutoScrollSongElement) {
                scrollToActiveElement(playlist);
              }

              // save YT player data for later use (e.g. events)
              // Fix Amplitude plugin #2
              // Original (deprecated, preserved for reference):
              // j1.adapter.amplitude.data.ytPlayers[playerID].activeIndex = songIndex;
              // j1.adapter.amplitude.data.ytPlayers[playerID].videoID     = ytpVideoID;   
              ytpHostData().ytPlayers[playerID].activeIndex = songIndex;
              ytpHostData().ytPlayers[playerID].videoID     = ytpVideoID;   

              return;
            } // END if playerState === PLAYING

            // TOGGLE state 'paused' => 'playing' if video (audio) NOT changed
            if (!isSongIndexChanged && ytPlayerState === 'paused') {
              ytPlayer.playVideo();
              ytpSeekTo(ytPlayer, ytPlayerCurrentTime, true);

              activeSong  = getActiveSong();
              // Fix Amplitude plugin #2
              // Original (deprecated, preserved for reference):
              // songs       = j1.adapter.amplitude.data.ytPlayers[playerID].songs;
              // ytPlayer    = j1.adapter.amplitude.data.ytPlayers[playerID].player;
              songs       = ytpHostData().ytPlayers[playerID].songs;
              ytPlayer    = ytpHostData().ytPlayers[playerID].player;

              var trackID = songIndex + 1;
              isDev && logger.debug('\n' + `PLAY video for PlayerSongContainer on playlist|trackID: ${playlist}|${trackID} at: ${ytPlayerCurrentTime}`);

              var playPauseButtonClass = `large-player-play-pause-${ytPlayerID}`;
              togglePlayPauseButton(playPauseButtonClass);

              // update meta data
              // ytpUpdatMetaContainers(songMetaData);

              // reset|update time settings
              resetCurrentTimeContainerYTP(ytPlayer, playlist);
              updateDurationTimeContainerYTP(ytPlayer, playlist);

              // set song at songIndex active in playlist
              setSongActive(playlist, songIndex);

              return;
            } // END if playerState === PAUSED
        
            if (isSongIndexChanged) {
              // load (next) video
              // -------------------------------------------------------------------
              trackID = songIndex + 1;
              isDev && logger.debug('\n' + `SWITCH video for PlayerSongContainer at trackID|VideoID: ${trackID}|${ytpVideoID}`);
              loadVideo(playlist, songIndex) 

              // wait for API error state
              setTimeout(() => {
                // Fix Amplitude plugin #2
                // Original (deprecated, preserved for reference):
                // if (j1.adapter.amplitude.data.ytpGlobals.ytApiError > 0) {
                if (ytpHostData().ytpGlobals.ytApiError > 0) {
                  var trackID = songIndex + 1;
                  // Fix Amplitude plugin #2
                  // Original (deprecated, preserved for reference):
                  // logger.error('\n' + `DISABLED player for playlist|trackID: ${playlist}|${trackID} on API error '${YT_PLAYER_ERROR_NAMES[j1.adapter.amplitude.data.ytpGlobals.ytApiError]}'`);
                  logger.error('\n' + `DISABLED player for playlist|trackID: ${playlist}|${trackID} on API error '${YT_PLAYER_ERROR_NAMES[ytpHostData().ytpGlobals.ytApiError]}'`);

                  // do nothing on API errors
                  return;
                }

                // save YT player data for later use (e.g. events)
                // -------------------------------------------------------------
                ytpSongIndex = songIndex;
                // Fix AudioPlayer #3
                // Original (deprecated, preserved for reference):
                // j1.modules.amplitudejs.data.ytp.songIndex = songIndex;
                ytpHostModuleYtp().songIndex = songIndex;

                // save YT player GLOBAL data for later use (e.g. events)
                // Fix Amplitude plugin #2
                // Original (deprecated, preserved for reference):
                // j1.adapter.amplitude.data.activePlayer = 'ytp';
                // j1.adapter.amplitude.data.ytpGlobals['activeIndex'] = songIndex;
                // j1.adapter.amplitude.data.ytpGlobals['activePlaylist'] = playlist;            
                ytpHostData().activePlayer = 'ytp';
                ytpHostData().ytpGlobals['activeIndex'] = songIndex;
                ytpHostData().ytpGlobals['activePlaylist'] = playlist;            

                // save YT player data for later use (e.g. events)
                // Fix Amplitude plugin #2
                // Original (deprecated, preserved for reference):
                // j1.adapter.amplitude.data.ytPlayers[playerID].activeIndex = songIndex;
                // j1.adapter.amplitude.data.ytPlayers[playerID].videoID     = ytpVideoID;
                ytpHostData().ytPlayers[playerID].activeIndex = songIndex;
                ytpHostData().ytPlayers[playerID].videoID     = ytpVideoID;

                // save amplitudejs data for later use (e.g. events)
                // -------------------------------------------------------------
                // Fix AudioPlayer #3
                // Original (deprecated, preserved for reference):
                // j1.modules.amplitudejs.data.activePlayer = 'ytp';
                // j1.modules.amplitudejs.data.activeIndex = songIndex;
                // j1.modules.amplitudejs.data.activePlaylist = playlist;
                // j1.modules.amplitudejs.data.ytp.songIndex = songIndex;
                // j1.modules.amplitudejs.data.ytp.activeIndex = songIndex;
                // j1.modules.amplitudejs.data.ytp.activePlaylist = playlist;
                // j1.modules.amplitudejs.data.ytp.players[playerID].player = ytPlayer;
                // j1.modules.amplitudejs.data.ytp.players[playerID].activeIndex = songIndex;
                // j1.modules.amplitudejs.data.ytp.players[playerID].ytpVideoID = ytpVideoID;
                ytpHostModuleData().activePlayer = 'ytp';
                ytpHostModuleData().activeIndex = songIndex;
                ytpHostModuleData().activePlaylist = playlist;
                ytpHostModuleYtp().songIndex = songIndex;
                ytpHostModuleYtp().activeIndex = songIndex;
                ytpHostModuleYtp().activePlaylist = playlist;
                ytpHostModuleYtp().players[playerID].player = ytPlayer;
                ytpHostModuleYtp().players[playerID].activeIndex = songIndex;
                ytpHostModuleYtp().players[playerID].ytpVideoID = ytpVideoID;

                // reset|update current time settings
                resetCurrentTimeContainerYTP(ytPlayer, playlist);
                updateDurationTimeContainerYTP(ytPlayer, playlist);
                resetProgressBarYTP();

                // load the song cover image
                loadCoverImage(songMetaData);

                // update meta data
                // ytpUpdatMetaContainers(songMetaData);

                var playPauseButtonClass = `large-player-play-pause-${ytPlayerID}`;
                togglePlayPauseButton(playPauseButtonClass);

                // set song at songIndex active in playlist
                setSongActive(playlist, songIndex);

                // scroll song active at index in player
                if (playerAutoScrollSongElement) {
                  scrollToActiveElement(playlist);
                }

                // save YT player data for later use (e.g. events)
                // j1.adapter.amplitude.data.ytPlayers[playerID].activeIndex = songIndex;
                // j1.adapter.amplitude.data.ytPlayers[playerID].videoID     = ytpVideoID;   

                // mute sound after next video load
                // -------------------------------------------------------------------
                if (muteAfterVideoSwitchInterval) {
                  ytPlayer.mute();
                  setTimeout(() => {
                    ytPlayer.unMute();
                  }, muteAfterVideoSwitchInterval);
                }
              }, 100); // END timeout
            } // END if isSongIndexChanged

            // deactivate AJS events (if any)
            event.stopImmediatePropagation();           
        }); // END EventListener
      } // END if classString
    } // END for largePlayerSongContainer

    // add listeners to all progress bars found
    // -------------------------------------------------------------------------
    var progressBars = document.getElementsByClassName("large-player-progress");
    if (progressBars.length) {
      for (var i=0; i<progressBars.length; i++) {
        var classArray    = [].slice.call(progressBars[i].classList, 0);
        var classString   = classArray.toString();
        var playerID      = progressBars[i].getAttribute("data-amplitude-player");
        var progressClass = 'large-player-progress-' + progressBars[i].getAttribute("data-amplitude-playlist");

        if (progressBars[i].dataset.amplitudeSource === 'audio') {
          // do nothing (managed by adapter)
        } else {
          var progressBar = progressBars[i];
          if (classString.includes(progressClass)) {
            // save YT player data for later use (e.g. events)
            // Fix Amplitude plugin #2
            // Original (deprecated, preserved for reference):
            // j1.adapter.amplitude.data.ytPlayers[playerID].progressBar = progressBar;
            ytpHostData().ytPlayers[playerID].progressBar = progressBar;

            progressBars[i].addEventListener('click', function(event) {
              var activeSong, playlist, ytPlayer,
                  playerState, progressBar, percentage, time;               

              activeSong = getActiveSong();
              if (!activeSong.player) {
                 // do nothing if activeSong player is missing (failsafe)
                return;
              }

              playlist = this.getAttribute("data-amplitude-playlist");
              if (activeSong.playlist !== playlist) {
                // do nothing on PREVIOUS playlist
                return;              
              }

              ytPlayer    = activeSong.player; 
              playerState = ytPlayer.getPlayerState();

              if (playerState === YT_PLAYER_STATE.PLAYING || playerState === YT_PLAYER_STATE.PAUSED || playerState === YT_PLAYER_STATE.BUFFERING) {
                progressBar = this;
                percentage  = getProgressBarSelectedPositionPercentage(event, progressBar);
                time        = getTimeFromPercentage(ytPlayer, percentage);

                // seek video to current time
                // var buffered = ytpSeekTo(ytPlayer, time, true);
                ytpSeekTo(ytPlayer, time, true);
          
                // set current progess value if valid
                if (isFinite(percentage)) {
                  progressBar.value = percentage;
                }
              } // END if ytPlayer

              // deactivate AJS events (if any)
              event.stopImmediatePropagation();   
            }); // END EventListener 'click'
          } // END if classString includes
        } // END if amplitudeSource
      } // END for progressBars
    } // END if progressBars

    // add listeners to all volume sliders found
    // -------------------------------------------------------------------------
    var volumeSliders = document.getElementsByClassName("amplitude-volume-slider");
    for (var i=0; i<volumeSliders.length; i++) {
      if (volumeSliders[i].dataset.amplitudeSource === 'audio') {
        // do nothing (managed by adapter)
      } else {
        if (volumeSliders[i]) {
          var volumeSlider  = volumeSliders[i];
          var sliderID      = volumeSliders[i].id;
          var playerID      = sliderID.split('volume_slider_')[1];

          // save YT player data for later use (e.g. events)
          if (volumeSlider.dataset.amplitudeSource === 'youtube') {
            // Fix Amplitude plugin #2
            // Original (deprecated, preserved for reference):
            // j1.adapter.amplitude.data.ytPlayers[playerID].volumeSlider = volumeSlider;
            ytpHostData().ytPlayers[playerID].volumeSlider = volumeSlider;
          }

          volumeSliders[i].addEventListener('click', function(event) {
            // Fix Amplitude plugin #2
            // Original (deprecated, preserved for reference):
            // var activePlayerType  = j1.adapter.amplitude.data.activePlayer;
            var activePlayerType  = ytpHostData().activePlayer;

            // Fix Amplitude plugin #2
            // Original (deprecated, preserved for reference):
            // if (j1.adapter.amplitude.data.activePlayer === 'atp') {
            if (ytpHostData().activePlayer === 'atp') {
              // do nothing (managed by amplitude)
            } else {
              var activeSong = getActiveSong();
              if (!activeSong.player) {
                 // do nothing if activeSong player is missing (failsafe)
                return;
              }

              // var ytPlayer = activeSong.player; 
              // Fix Amplitude plugin #2
              // Original (deprecated, preserved for reference):
              // var ytPlayer    = j1.adapter.amplitude.data.ytPlayers[activeSong.playerID].player;
              var ytPlayer    = ytpHostData().ytPlayers[activeSong.playerID].player;
              var playerState = ytPlayer.getPlayerState();

              if ((playerState === YT_PLAYER_STATE.PLAYING || playerState === YT_PLAYER_STATE.PAUSED) && ytPlayer !== undefined) {
                var volumeSlider, volumeValue;
                var currenVolume = ytPlayer.getVolume();

                volumeSlider = this;
                volumeValue  = 50;  // default

                if (volumeSlider !== null) {
                  volumeValue = parseInt(volumeSlider.value);
                }

                ytPlayer.setVolume(volumeValue);
              } // END if ytPlayer
            }
          }); // END EventListener 'click'
        } // END if volumeSliders
      } // END if volumeSliders
    } // END for volumeSliders

    // add listeners to all mute buttons found
    // -------------------------------------------------------------------------
    var volumeMutes = document.getElementsByClassName("amplitude-mute");
    for (var i=0; i<volumeMutes.length; i++) {
      if (volumeMutes[i].dataset.amplitudeSource === 'audio') {
        // do nothing (managed by adapter)
      } else {
        // Fix Amplitude plugin #2
        // Original (deprecated, preserved for reference):
        // var activePlayer = j1.adapter.amplitude.data.activePlayer;
        var activePlayer = ytpHostData().activePlayer;

        if (volumeMutes[i]) {
          var volumMute = volumeMutes[i];
          var sliderID  = volumeMutes[i].id;
          var playerID  = sliderID.split('amplitude-mute_')[1];

          volumeMutes[i].addEventListener('click', function(event) {
            var activeSong = getActiveSong();

            if (!activeSong) {
              // do nothing if activeSong data is missing (failsafe)
              return;
            } 
  
            var ytPlayer            = activeSong.player;
            // Fix Amplitude plugin #2
            // Original (deprecated, preserved for reference):
            // var volumeSlider        = j1.adapter.amplitude.data.ytPlayers[playerID].volumeSlider;
            var volumeSlider        = ytpHostData().ytPlayers[playerID].volumeSlider;
            var currenVolume        = ytPlayer.getVolume();
//          var playerVolumePreset  = parseInt(j1.adapter.amplitude.data.ytPlayers[playerID].playerSettings.volume_slider.preset_value);
            // Fix Amplitude plugin #2
            // Original (deprecated, preserved for reference):
            // var playerVolumePreset  = parseInt(j1.adapter.amplitude.data.ytPlayers[playerID].playerDefaults.volume_slider.preset_value);
            var playerVolumePreset  = parseInt(ytpHostData().ytPlayers[playerID].playerDefaults.volume_slider.preset_value);
            var playerState         = ytPlayer.getPlayerState();
            var ytPlayerState       = YT_PLAYER_STATE_NAMES[playerState] || 'unstarted';

            var isValidPlayerState = /playing|paused/.test(ytPlayerState);
            if (isValidPlayerState && ytPlayer !== undefined) {
              if (currenVolume > 0) {
                volumeSlider.value = 0;
                ytPlayer.setVolume(0);                
              } else {
                volumeSlider.value = playerVolumePreset;
                ytPlayer.setVolume(playerVolumePreset);
              }
            } // END if ytPlayer

          }); // END EventListener 'click'

        } // END if volumeMutes
      } // END if volumeSliders
    } // END for volumeSliders

  } // END if playerSettings.type 'large'

 } // END if j1.adapter.amplitude['data']['ytPlayers'][ytPlayerID] !== undefined
} // END mimikYTPlayerUiEventsForAJS

{%- endcapture -%}

{%- if production -%}
  {{ cache|minifyJS }}
{%- else -%}
  {{ cache|strip_empty_lines }}
{%- endif -%}

{%- assign cache = false -%}