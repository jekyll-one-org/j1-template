/*
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/modules/amplitudePlayer/js/player.js
 # Provides JS Core for J1 Module amplitudePlayer
 # Version 1.0.3 for J1 Template
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2023-2026 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 # -----------------------------------------------------------------------------
*/

// -----------------------------------------------------------------------------
// ESLint shimming
// -----------------------------------------------------------------------------
/* eslint indent: "off"                                                       */
/* global j1, $, Amplitude, log4javascript                                    */
// -----------------------------------------------------------------------------

// code optimization
// =============================================================================
// MODULE API of the J1 amplitudePlayer
//
// This file is the module-side counterpart of the adapter
// ~/assets/theme/j1/adapter/js/amplitudePlayer.js and follows the SAME split
// that is already established for the module multiPlayer:
//
//   multiPlayer.js  (adapter, Liquid)  <->  multiPlayer/js/player.js  (module)
//   amplitudePlayer.js (adapter, Liquid) <-> amplitudePlayer/js/player.js (this)
//
// The adapter keeps EVERYTHING that needs Liquid|YAML at BUILD time:
//
//   * the config inheritance chain (defaults <- user settings <- player)
//   * the per-player XHR loading of the player HTML portion (UI)
//   * the Liquid loops that emit the songs|playlists payload
//   * the J1 module lifecycle (init, messageHandler, setState, getState)
//
// This module keeps EVERYTHING that is PLAIN JavaScript at RUNTIME:
//
//   * all helper functions (URL building, timestamp conversion, deep merge)
//   * the complete AmplitudeJS API initialization incl. all callbacks
//   * the complete AT player state machine
//   * the complete per-player UI event wiring (mini|compact|large)
//   * the plugin manager (ytp) incl. the plugin options handoff
//
// -----------------------------------------------------------------------------
// ARCHITECTURAL NOTE (differs from multiPlayer on purpose)
//
// multiPlayer wraps video.js. video.js creates ONE PLAYER PER ELEMENT, so the
// module player.js of multiPlayer is a PURE MultiInstance module: every member
// (state, PlaylistManager, handler classes) is built per instance by
// createVideoPlayerInstance(id).
//
// AmplitudeJS is NOT per element. Amplitude.init() creates ONE GLOBAL PLAYER
// ENGINE for the whole page; all players of a page share that engine and are
// distinguished by their playlist only. A per-instance copy of the engine
// state would therefore be WRONG here.
//
// The split of this module is consequently:
//
//   SHARED CORE      (module scope)  one engine, one state machine, one
//                                    plugin manager, one options cache
//   PLAYER INSTANCE  (class)         the per-player UI binding, keyed by the
//                                    player id of the control file
//
// The public surface still mirrors the video.js|multiPlayer factory shape
// (audioPlayer(id) create-or-get, registry, dispose) so both J1 player modules
// are used the same way from adapter code.
// -----------------------------------------------------------------------------

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);                // AMD: let the loader call factory
  } else if (typeof exports === 'object') {
    module.exports = factory();         // CommonJS: call factory, export result
  } else {
    root['audioPlayer'] = factory();    // Browser global: assign result
  }
}(this, function () {
  "use strict";

  const VERSION       = '1.0.3';
  const MODULE_NAME   = 'j1.module.amplitudePlayer';

  // ---------------------------------------------------------------------------
  // code optimization
  // AmplitudeJS GLOBAL constants
  //
  // Moved VERBATIM out of the adapter (adapter module-variable block). The
  // constants are pure data and have no Liquid dependency at all.
  // ---------------------------------------------------------------------------
  //
  const requiredForATP = false;

  const AUDIO_ERROR = {
    SUCCESSFUL:         0,
    ABORTED:            1,
    NETWORK_ERROR:      2,
    DECODE_ERROR:       3,
    SRC_NOT_SUPPORTED:  4,
    GENERIC_ERROR:      5
  };

  const AUDIO_ERROR_NAMES = {
    0:                  "successful",
    1:                  "aborted",
    2:                  "network error",
    3:                  "decode error",
    4:                  "not supported",
    5:                  "generic error",
  };

  const AT_PLAYER_STATE = {
    ENDED:              0,
    PLAYING:            1,
    PAUSED:             2,
    STOPPED:            3,
    PREVIOUS:           4,
    NEXT:               5,
    CHANGED:            6,
  };

  const AT_PLAYER_STATE_NAMES = {
    0:                "ended",
    1:                "playing",
    2:                "paused",
    3:                "stopped",
    4:                "previous",
    5:                "next",
    6:                "changed",
  };

  // code optimization
  // ---------------------------------------------------------------------------
  // YT_PLAYER_STATE_NAMES was USED by the adapter method
  // atpStopParallelActivePlayers() but was NEVER DECLARED anywhere in the
  // adapter. The name only resolved when the ytp plugin happened to leak a
  // global of that name; without the plugin the method threw a
  // ReferenceError and killed the whole 'playing' state processing.
  //
  // The map is declared here as the OWN, local source of truth. It mirrors
  // the numeric states of the YouTube IFrame API.
  // ---------------------------------------------------------------------------
  //
  const YT_PLAYER_STATE_NAMES = {
    '-1':             "unstarted",
    0:                "ended",
    1:                "playing",
    2:                "paused",
    3:                "buffering",
    5:                "video cued",
  };

  // code optimization
  // fade transition step tables, lifted out of atpFadeInAudio|atpFadeAudioOut
  // (both declared the very same literal locally)
  //
  const FADE_ITERATION_STEPS = {
    'default':  150,
    'slow':     250,
    'slower':   350,
    'slowest':  500
  };

  const FADE_CYCLE_MS         = 1;
  const FADE_DEFAULT_VOLUME   = 50;
  const FADE_DEFAULT_TARGET   = 50;
  const AUDIO_POSITION_POLL   = 100;

  // ---------------------------------------------------------------------------
  // code optimization
  // amplitudeMediaURL regular expressions (moved VERBATIM from the adapter)
  // ---------------------------------------------------------------------------
  //
  var amplitudeYtIdRE       = /^[A-Za-z0-9_-]{11}$/;
  var amplitudeYtHostRE     = /(^|\/\/|\.)(youtube(-nocookie)?\.com|youtu\.be)(\/|$)/i;
  var amplitudeAbsoluteRE   = /^([A-Za-z][A-Za-z0-9+.-]*:)?\/\//;

  // ---------------------------------------------------------------------------
  // code optimization
  // SHARED module state
  //
  // Everything the AmplitudeJS engine owns exactly ONCE per page. The values
  // are fed by the adapter through setAdapterOptions() (mirror of
  // playlistManager.setAdapterOptions() in the multiPlayer module).
  // ---------------------------------------------------------------------------
  //
  let logger                    = null;
  let isDev                     = false;

  let adapterOptions            = null;   // full options hash of the adapter
  let adapterNamespace          = 'amplitudePlayer';
  let moduleNamespace           = 'amplitudejs';
  let techSrc                   = '/assets/theme/j1/modules/amplitudeJS';
  let environment               = 'production';

  let amplitudeDefaults         = {};     // defaults/amplitude.yml
  let amplitudePlayers          = {};     // amplitudePlayer_control.yml settings
  let amplitudeMedia            = {};     // amplitudePlayer_media.yml settings
  let amplitudeInstanceOptions  = {};     // per-player effective options cache

  let apiInitialized            = { state: false };
  let ytpPluginInstalled        = false;
  let isFadingIn                = false;
  let isFadingOut               = false;
  let amplitudePlayerState      = null;

  // page-global PLAYER settings (effective chain: defaults <- user settings)
  //
  let playerDefaultVolume                 = 50;
  let playerRepeat                        = false;
  let playerShuffle                       = false;
  let playerPlayNextTitle                 = true;
  let playerPauseNextTitle                = false;
  let playerDelayNextTitle                = 0;
  let playerForwardBackwardSkipSeconds    = 10;
  let playerHoverPageScrollDisabled       = false;
  let playerSongElementHeigthMobile       = 0;
  let playerSongElementHeigthDesktop      = 0;
  let playerScrollerSongElementMin        = 0;
  let playerScrollControl                 = false;
  let playerAutoScrollSongElement         = false;
  let playlistAudioInfo                   = false;

  // Claude - J1 amplitudePlayer optimization #4
  // PAGE-WIDE active-song sync (YAML key player.sync_active_song, default
  // true). See _mirrorActiveSong() for the description.
  //
  let playerSyncActiveSong                = true;

  // code optimization
  // ---------------------------------------------------------------------------
  // PAGE-GLOBAL default player TYPE
  //
  // The adapter declared 'playerDefaultType' (from
  // amplitude_player_default.player.type resp. amplitude_player_global.type)
  // but NEVER evaluated it — the exact counterpart of piHotKeys|piAutoCaption
  // in the multiPlayer module. The module keeps the value now and uses it as
  // the LAST fallback of _resolvePlayerType() so a player whose id carries no
  // mini|compact|large keyword still gets its UI wired.
  //
  // The YAML default is 'compact' (_data/modules/defaults/amplitude.yml,
  // player.type); the literal below is only the pre-handoff seed.
  // ---------------------------------------------------------------------------
  //
  let playerDefaultType                   = 'compact';

  // code optimization
  // ---------------------------------------------------------------------------
  // ACTIVE player id tracking
  //
  // The adapter methods atpProcessAudioStartPosition|atpProcessAudioEndPosition
  // referenced a bare identifier 'playerID' that was NEVER declared in their
  // scope (see the original call atpFadeInAudio({ playerID: playerID })). The
  // fade helpers therefore threw a ReferenceError instead of fading.
  //
  // The module tracks the id of the player that owns the CURRENTLY ACTIVE
  // playlist instead and resolves the volume slider from it.
  // ---------------------------------------------------------------------------
  //
  const _playlistOwner  = Object.create(null);   // playlist name -> player id
  let   _activePlayerID = '';

  function _registerPlaylistOwner(playlistName, playerID) {
    if (playlistName && playerID) {
      _playlistOwner[playlistName] = playerID;
      if (!_activePlayerID) { _activePlayerID = playerID; }
    }
  } // END _registerPlaylistOwner

  function _resolveActivePlayerID() {
    var playlist;

    try {
      playlist = Amplitude.getActivePlaylist();
    } catch (e) {
      playlist = null;
    }

    if (playlist && _playlistOwner[playlist]) {
      _activePlayerID = _playlistOwner[playlist];
    }
    return _activePlayerID;
  } // END _resolveActivePlayerID

  // ---------------------------------------------------------------------------
  // code optimization
  // _adapter() / _adapterData()
  //
  // The moved code wrote to the LITERAL namespaces j1.adapter.amplitudePlayer
  // and j1.modules.amplitudejs. Both names are resolved indirectly now so the
  // module can be hosted by a renamed adapter without a code change (same
  // decoupling the ytp plugin already implements via ytpHost()).
  // ---------------------------------------------------------------------------
  //
  function _adapter() {
    window.j1                    = window.j1 || {};
    j1.adapter                   = j1.adapter || {};
    j1.adapter[adapterNamespace] = j1.adapter[adapterNamespace] || {};
    return j1.adapter[adapterNamespace];
  } // END _adapter

  function _adapterData() {
    var host  = _adapter();
    host.data = host.data || {};
    return host.data;
  } // END _adapterData

  function _module() {
    window.j1                   = window.j1 || {};
    j1.modules                  = j1.modules || {};
    j1.modules[moduleNamespace] = j1.modules[moduleNamespace] || {};
    return j1.modules[moduleNamespace];
  } // END _module

  function _moduleAtp() {
    var mod  = _module();
    mod.data = mod.data || {};
    mod.data.atp = mod.data.atp || {};
    return mod.data.atp;
  } // END _moduleAtp

  // code optimization
  // The three-line sequence
  //   j1.modules.amplitudejs.data.atp.activeIndex = songIndex;
  //   j1.modules.amplitudejs.data.atp.playlist    = playlist;
  // was repeated at SEVEN call sites of the adapter. Folded into one helper
  // //.
  function _saveAtpState(songIndex, playlist) {
    var atp = _moduleAtp();

    atp.activeIndex = songIndex;
    atp.playlist    = playlist;
  } // END _saveAtpState

  // Claude - J1 amplitudePlayer optimization #3
  // ---------------------------------------------------------------------------
  // SHARED ACTIVE-SONG REGISTRY (native players <-> 'ytp' plugin players)
  //
  // PROBLEM
  // A page may carry a NATIVE large player AND a large player driven by the
  // 'ytp' plugin at the same time (see the tour page 'audio_data.adoc':
  // 'emancipator_large' on playlist 'emancipator' and 'emancipator_yt_large'
  // on playlist 'dusk_to_dawn_yt'). Their playlists ran OUT OF SYNC because
  // the marker class 'amplitude-active-song-container' was removed PAGE-GLOBAL
  // from THREE places:
  //
  //   1. setSongActive()          of this module           (native players)
  //   2. setSongActive()          of ~/plugins/tech/ytp.js (YouTube players)
  //   3. ContainerElements.setActive() of AmplitudeJS itself, called on
  //      EVERY afterSongChange() of ANY Amplitude driven player
  //
  // All three collect document.getElementsByClassName('amplitude-song-container')
  // -- which matches the song containers of EVERY player of the page -- and
  // then re-mark only the containers of the ONE playlist they are updating.
  // Net effect: at most ONE playlist of a page could show its current track.
  // Starting a track on the native player silently un-marked the ytp playlist
  // and the other way round.
  //
  // SOLUTION
  // The LAST known active song index is registered PER PLAYLIST in the host
  // adapter data, so BOTH the module and the plugin read and write the very
  // same hash (ytp.js reaches it through ytpHostData(), this module through
  // _adapterData(); both resolve to j1.adapter.<adapterNamespace>.data).
  //
  //   j1.adapter.<adapterNamespace>.data.activeSongContainers
  //     = { '<playlist name>': <song index>, ... }
  //
  // setSongActive() clears the marker only WITHIN the playlist it updates and
  // afterwards restores the marker of every OTHER registered playlist that
  // lost it (case 3 above, the AmplitudeJS internal wipe, is repaired this
  // way as well). The playlists of a page therefore stay synchronized: every
  // player keeps showing the track it is parked on.
  //
  // NOTE: Players that SHARE a playlist name (the mini|compact|large players
  // of the same album) keep being cleared and re-marked TOGETHER. That is the
  // playlist centric model of AmplitudeJS and is intentionally preserved.
  // ---------------------------------------------------------------------------
  //
  function _activeSongRegistry() {
    var data = _adapterData();

    data.activeSongContainers = data.activeSongContainers || {};
    return data.activeSongContainers;
  } // END _activeSongRegistry

  function _registerActiveSong(playlistName, songIndex) {
    var registry = _activeSongRegistry();
    var index    = parseInt(songIndex, 10);

    if (typeof playlistName === 'string' && playlistName.length > 0 && !isNaN(index)) {
      registry[playlistName] = index;
    }
  } // END _registerActiveSong

  // ---------------------------------------------------------------------------
  // _restoreForeignActiveContainers(currentPlayList)
  //
  // Re-applies 'amplitude-active-song-container' for all REGISTERED playlists
  // OTHER than currentPlayList that currently carry NO marked container. A
  // playlist that still owns its marker is left untouched, so the helper is
  // idempotent and safe to call from a polling loop.
  // ---------------------------------------------------------------------------
  //
  function _restoreForeignActiveContainers(currentPlayList) {
    var registry    = _activeSongRegistry();
    var names       = Object.keys(registry);
    var containers  = document.getElementsByClassName("amplitude-song-container");
    var n, k, name, index, listName, hasActive;

    if (!containers.length) {
      return;
    }

    for (n=0; n<names.length; n++) {
      name = names[n];

      if (name === currentPlayList) {
        continue;
      }

      index     = parseInt(registry[name], 10);
      hasActive = false;

      if (isNaN(index)) {
        continue;
      }

      // playlist still marked? -> nothing to repair
      // -----------------------------------------------------------------------
      for (k=0; k<containers.length; k++) {
        listName = containers[k].getAttribute("data-amplitude-playlist");
        if (listName === name && containers[k].classList.contains("amplitude-active-song-container")) {
          hasActive = true;
          break;
        }
      }

      if (hasActive) {
        continue;
      }

      // restore the marker at the LAST known index of that playlist
      // -----------------------------------------------------------------------
      for (k=0; k<containers.length; k++) {
        listName = containers[k].getAttribute("data-amplitude-playlist");
        if (listName === name &&
            parseInt(containers[k].getAttribute("data-amplitude-song-index"), 10) === index) {
          containers[k].classList.add("amplitude-active-song-container");
        }
      }
    } // END for names

  } // END _restoreForeignActiveContainers

  // Claude - J1 amplitudePlayer optimization #4
  // ---------------------------------------------------------------------------
  // PAGE-WIDE ACTIVE-SONG SYNC (native players <-> 'ytp' plugin players)
  //
  // WHY #3 WAS NOT ENOUGH
  // Series #3 made the playlists of a page INDEPENDENT: every playlist
  // remembers its own last active index and gets it restored when a parallel
  // player wipes the marker. That is not how the play|pause state behaves,
  // which is ONE page-wide state every player mirrors (Amplitude pushes it
  // to all native buttons, the StopParallel helpers push the complementary
  // state to the other tech). For the song marker NO such push existed:
  // Amplitude marks only config.active_playlist, setSongActive() of the
  // module and of the plugin mark only the playlist passed in. The ytp list
  // therefore kept showing its own last track (or nothing) while the native
  // list moved -- the "only play|pause is synchronized" observation.
  //
  // MODEL
  // The page has ONE active song index. When a player activates index N,
  // every OTHER playlist of the page that owns a song at index N follows:
  //
  //   1. MARKER   'amplitude-active-song-container' is set at index N in
  //               every other playlist (_mirrorActiveSong, DOM only, both
  //               directions, called from setSongActive of module|plugin)
  //   2. ENGINE   native -> ytp: the YouTube players are CUED to the video of
  //               index N (j1.plugins.ytp.followActiveSong, plugin side)
  //               ytp -> native: the AmplitudeJS engine is moved to index N
  //               WITHOUT playing (Amplitude.setPlaylistSongActive, added to
  //               the vendored amplitude.js in this series)
  //
  // so a click on the play button of ANY player continues with the track
  // that is highlighted in its list. Playlists that have NO song at index N
  // (shorter album) are left untouched.
  //
  // The sync is by INDEX (all playlists of the tour page are the same album)
  // and can be switched off page-wide with player.sync_active_song: false.
  //
  // Shared data (same hash for module and plugin, see _activeSongRegistry):
  //
  //   j1.adapter.<adapterNamespace>.data.activeSongSync
  //     = { enabled: <bool>, followYtp: <function>|undefined }
  // ---------------------------------------------------------------------------
  //
  function _activeSongSync() {
    var data = _adapterData();

    data.activeSongSync = data.activeSongSync || {};
    return data.activeSongSync;
  } // END _activeSongSync

  function _activeSongSyncEnabled() {
    return (playerSyncActiveSong !== false) && (_activeSongSync().enabled !== false);
  } // END _activeSongSyncEnabled

  // ---------------------------------------------------------------------------
  // _ytpOwnedPlaylists()
  //
  // Returns a hash { '<playlist name>': '<player id>' } of the playlists that
  // are driven by a REGISTERED YouTube player of the 'ytp' plugin.
  // ---------------------------------------------------------------------------
  //
  function _ytpOwnedPlaylists() {
    var owned     = {};
    var ytPlayers = _adapterData().ytPlayers || {};
    var ids       = Object.keys(ytPlayers);
    var i, settings, name;

    for (i=0; i<ids.length; i++) {
      settings = ytPlayers[ids[i]] && ytPlayers[ids[i]].playerSettings;
      name     = settings && settings.playlist && settings.playlist.name;
      if (typeof name === 'string' && name.length > 0) {
        owned[name] = ids[i];
      }
    }
    return owned;
  } // END _ytpOwnedPlaylists

  // ---------------------------------------------------------------------------
  // _mirrorActiveSong(currentPlayList, songIndex)
  //
  // Marks 'amplitude-active-song-container' at songIndex in every playlist
  // of the page OTHER than currentPlayList that owns a container at that
  // index, and registers the index for the #3 restore helpers. Returns the
  // names of the playlists that were mirrored.
  // ---------------------------------------------------------------------------
  //
  function _mirrorActiveSong(currentPlayList, songIndex) {
    var index      = parseInt(songIndex, 10);
    var containers = document.getElementsByClassName("amplitude-song-container");
    var targets    = {};
    var mirrored   = [];
    var k, listName, names, n;

    if (!_activeSongSyncEnabled() || isNaN(index) || !containers.length) {
      return mirrored;
    }

    // collect the playlists that own a song at this index
    // -------------------------------------------------------------------------
    for (k=0; k<containers.length; k++) {
      listName = containers[k].getAttribute("data-amplitude-playlist");
      if (typeof listName !== 'string' || listName.length === 0 || listName === currentPlayList) {
        continue;
      }
      if (parseInt(containers[k].getAttribute("data-amplitude-song-index"), 10) === index) {
        targets[listName] = true;
      }
    }

    names = Object.keys(targets);
    if (!names.length) {
      return mirrored;
    }

    // move the marker of every target playlist to the index
    // -------------------------------------------------------------------------
    for (k=0; k<containers.length; k++) {
      listName = containers[k].getAttribute("data-amplitude-playlist");
      if (!targets[listName]) {
        continue;
      }
      if (parseInt(containers[k].getAttribute("data-amplitude-song-index"), 10) === index) {
        containers[k].classList.add("amplitude-active-song-container");
      } else {
        containers[k].classList.remove("amplitude-active-song-container");
      }
    }

    for (n=0; n<names.length; n++) {
      _registerActiveSong(names[n], index);
      mirrored.push(names[n]);
    }

    isDev && logger.debug('\n' + `SYNC active song at index ${index} from playlist ${currentPlayList} to: ${mirrored.join('|')}`);

    return mirrored;
  } // END _mirrorActiveSong

  // ---------------------------------------------------------------------------
  // _followActiveSongYtp(currentPlayList, songIndex)
  //
  // ENGINE follow native -> ytp. Delegates to the hook the plugin publishes
  // on the shared adapter data (activeSongSync.followYtp) resp. on
  // j1.plugins.ytp.followActiveSong. A page without the plugin is a no-op.
  //
  // NOTE: must be called AFTER atpStopParallelActivePlayers(), so the cue of
  // the YouTube player is not cancelled by its stopVideo().
  // ---------------------------------------------------------------------------
  //
  function _followActiveSongYtp(currentPlayList, songIndex) {
    var hook = _activeSongSync().followYtp;

    if (!_activeSongSyncEnabled()) {
      return;
    }
    if (typeof hook !== 'function' && window.j1 && j1.plugins && j1.plugins.ytp) {
      hook = j1.plugins.ytp.followActiveSong;
    }
    if (typeof hook !== 'function') {
      return;
    }

    try {
      hook(currentPlayList, songIndex, 'atp');
    } catch (e) {
      isDev && logger.error('\n' + `SYNC active song: ytp follow failed: ${e}`);
    }
  } // END _followActiveSongYtp

  // ---------------------------------------------------------------------------
  // _followActiveSongNative(leaderPlaylist, songIndex)
  //
  // ENGINE follow ytp -> native. Moves the AmplitudeJS engine (which the
  // plugin has already stopped) to songIndex of every NATIVE playlist of the
  // page -- i.e. a playlist known to Amplitude that is NOT owned by a YouTube
  // player and whose media is NOT a YouTube URL -- and scrolls the list.
  // Published for the plugin as activeSongSync.followNative.
  // ---------------------------------------------------------------------------
  //
  function _followActiveSongNative(leaderPlaylist, songIndex) {
    var index = parseInt(songIndex, 10);
    var owned, config, names, n, name, songs, state;

    if (!_activeSongSyncEnabled() || isNaN(index)) {
      return;
    }
    if (typeof Amplitude === 'undefined' || typeof Amplitude.setPlaylistSongActive !== 'function') {
      isDev && logger.warn('\n' + 'SYNC active song: Amplitude.setPlaylistSongActive NOT available (vendored amplitude.js not patched)');
      return;
    }

    try {
      state = Amplitude.getPlayerState();
    } catch (e) {
      state = null;
    }
    if (state === 'playing') {
      return;
    }

    owned  = _ytpOwnedPlaylists();
    config = Amplitude.getConfig();
    names  = Object.keys((config && config.playlists) || {});

    for (n=0; n<names.length; n++) {
      name  = names[n];
      songs = config.playlists[name].songs || [];

      if (name === leaderPlaylist || owned[name] || songs[index] === undefined) {
        continue;
      }
      if (songs[0] && typeof songs[0].url === 'string' && amplitudeYtHostRE.test(songs[0].url)) {
        continue;
      }

      if (Amplitude.setPlaylistSongActive(name, index)) {
        isDev && logger.debug('\n' + `SYNC active song: native playlist ${name} follows to index ${index}`);
        _registerActiveSong(name, index);
        atPlayerScrollToActiveElement({ index: index, playlist: name });
      }
    }
  } // END _followActiveSongNative

  // ===========================================================================
  // PURE HELPERS
  // Moved VERBATIM out of the adapter. No Liquid, no DOM, no Amplitude.
  // ===========================================================================

  // ---------------------------------------------------------------------------
  // Modify Amplitude comfig
  // amplitudeMediaURL(audioBase, audioRef)
  //
  // Builds the URL of a song (property 'url') from the media config keys
  // 'audio_base' and 'audio'. Supported reference formats of the 'audio'
  // key:
  //
  //   1. LOCAL media file   '02_valhalla.mp3'  -> <base>/02_valhalla.mp3
  //   2. LEGACY YouTube URL 'watch?v=<ID>'     -> <base>/watch?v=<ID>
  //   3. NEW bare video ID  '<ID>'             -> <base>/watch?v=<ID>
  //   4. ABSOLUTE reference '//host/path'      -> //host/path (base ignored)
  //
  // Format 3. is expanded ONLY if the reference matches the EXACT YouTube ID
  // alphabet (11 characters out of [A-Za-z0-9_-], no dot, no slash) AND the
  // audio base names a YouTube host or is empty. Any local media file has a
  // file extension and therefore contains a dot, so it can never be taken
  // for a video ID. Formats 1 and 2 produce the very same string as the
  // former concatenation audio_base + '/' + audio.
  // ---------------------------------------------------------------------------
  //
  function amplitudeMediaURL(audioBase, audioRef) {
    var base, ref, baseIsYouTube;

    base = (audioBase === undefined || audioBase === null) ? '' : String(audioBase).trim();
    ref  = (audioRef  === undefined || audioRef  === null) ? '' : String(audioRef).trim();

    // NO media reference: keep the (possibly empty) base
    if (ref.length === 0) {
      return base;
    }

    // ABSOLUTE reference: the base must NOT be prepended a second time
    if (amplitudeAbsoluteRE.test(ref)) {
      return ref;
    }

    // strip a TRAILING slash of the base to avoid a double slash
    if (base.length > 1 && base.charAt(base.length - 1) === '/') {
      base = base.substring(0, base.length - 1);
    }

    baseIsYouTube = (base.length === 0) || amplitudeYtHostRE.test(base);

    // NEW format: bare 11-character YouTube video ID
    if (baseIsYouTube && amplitudeYtIdRE.test(ref)) {
      return base + '/watch?v=' + ref;
    }

    // LEGACY format ('watch?v=<ID>') and all LOCAL media files
    return base + '/' + ref;
  } // END amplitudeMediaURL

  // ---------------------------------------------------------------------------
  // timestamp2seconds(timestamp)
  // converts a timestamp of hh:mm:ss into seconds
  // ---------------------------------------------------------------------------
  // TODO:
  // Add support for timestamp w/o hours like mm:ss
  // ---------------------------------------------------------------------------
  function timestamp2seconds(timestamp) {

    // code optimization
    // failsafe: the adapter version called .split() on the raw argument and
    // threw a TypeError for undefined|null|number values (song metadata of
    // AmplitudeJS returns 'undefined' for songs w/o a start|end key)
    //
    if (typeof timestamp !== 'string') {
      return false;
    }

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

  // ---------------------------------------------------------------------------
  // seconds2timestamp(seconds)
  // converts seconds into a timestamp of hh:mm:ss
  // ---------------------------------------------------------------------------
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

  // ---------------------------------------------------------------------------
  // deepMerge(target, ...sources)
  //
  // Deep merge helper implementing the layer semantics of the config
  // inheritance chain (same semantics as J1 VideoPlayer adapter #48):
  //
  //   target = deepMerge(target, ...sources)
  //
  //   • plain objects are merged RECURSIVELY (missing keys fall through
  //     to the lower layer, present keys overload it)
  //   • ARRAYS REPLACE the lower layer's value as a whole (copied via
  //     slice() so layers never share array references) — no index-wise
  //     merging as done by $.extend(true, ...)
  //   • scalars (string/number/boolean/null) overload the lower layer;
  //     'undefined' source values are skipped (key stays inherited)
  //
  // Sources are applied left to right: the LAST source wins.
  // ---------------------------------------------------------------------------
  function deepMerge(target, ...sources) {
    var isPlainObject = function (v) {
      return (v !== null && typeof v === 'object' && !Array.isArray(v));
    };

    sources.forEach(function (source) {
      if (!isPlainObject(source)) { return; }
      Object.keys(source).forEach(function (key) {
        var srcVal = source[key];
        if (isPlainObject(srcVal)) {
          if (!isPlainObject(target[key])) { target[key] = {}; }
          deepMerge(target[key], srcVal);
        } else if (Array.isArray(srcVal)) {
          target[key] = srcVal.slice();
        } else if (srcVal !== undefined) {
          target[key] = srcVal;
        }
      });
    });

    return target;
  } // END deepMerge

  // ---------------------------------------------------------------------------
  // isPluginLoaded()
  // ---------------------------------------------------------------------------
  function isPluginLoaded(plugin) {
    const scripts     = document.scripts;
    const pluginFile  = plugin + '.js';

    for (let i = 0; i < scripts.length; i++) {
      if (scripts[i].src.includes(pluginFile)) {
        return true;
      }
    }
    return false;
  } // END isPluginLoaded

  // ===========================================================================
  // CONFIG LAYER
  // ===========================================================================

  // code optimization
  // ---------------------------------------------------------------------------
  // setAdapterOptions(options)
  //
  // The ONE handoff point adapter -> module. Mirrors
  // playlistManager.setAdapterOptions(options) of the multiPlayer module.
  // Everything the module needs that used to be a Liquid-rendered literal
  // inside the adapter body is passed in here ONCE.
  //
  // Expected keys (all optional, defaults are kept when absent):
  //
  //   isDev, environment, techSrc
  //   adapterNamespace, moduleNamespace
  //   defaults           amplitude_player_default   (raw YAML hash)
  //   players            amplitude_player_control   (raw YAML hash)
  //   media              amplitude_player_media     (raw YAML hash)
  //   player             the EFFECTIVE page-global 'player' subtree
  //   playlist           the EFFECTIVE page-global 'playlist' subtree
  //
  // ---------------------------------------------------------------------------
  //
  function setAdapterOptions(options) {
    var opts = options || {};

    adapterOptions   = opts;
    isDev            = (opts.isDev === true);
    environment      = (typeof opts.environment === 'string') ? opts.environment : environment;
    techSrc          = (typeof opts.techSrc     === 'string') ? opts.techSrc     : techSrc;
    adapterNamespace = (typeof opts.adapterNamespace === 'string' && opts.adapterNamespace.length)
                     ? opts.adapterNamespace : adapterNamespace;
    moduleNamespace  = (typeof opts.moduleNamespace  === 'string' && opts.moduleNamespace.length)
                     ? opts.moduleNamespace  : moduleNamespace;

    amplitudeDefaults = opts.defaults || amplitudeDefaults;
    amplitudePlayers  = opts.players  || amplitudePlayers;
    amplitudeMedia    = opts.media    || amplitudeMedia;

    logger = logger || log4javascript.getLogger(MODULE_NAME);

    // page-global PLAYER settings (effective chain, resolved by the adapter)
    var p = opts.player || {};
    if (p.volume_slider && p.volume_slider.preset_value !== undefined) {
      playerDefaultVolume = p.volume_slider.preset_value;
    }
    playerRepeat                     = _pick(p.player_repeat,                       playerRepeat);
    playerShuffle                    = _pick(p.player_shuffle,                      playerShuffle);
    playerPlayNextTitle              = _pick(p.play_next_title,                     playerPlayNextTitle);
    playerPauseNextTitle             = _pick(p.pause_next_title,                    playerPauseNextTitle);
    playerDelayNextTitle             = _pick(p.delay_next_title,                    playerDelayNextTitle);
    playerForwardBackwardSkipSeconds = _pick(p.forward_backward_skip_seconds,       playerForwardBackwardSkipSeconds);
    playerHoverPageScrollDisabled    = _pick(p.player_hover_page_scroll_disabled,   playerHoverPageScrollDisabled);
    playerSongElementHeigthMobile    = _pick(p.player_song_element_heigth_mobile,   playerSongElementHeigthMobile);
    playerSongElementHeigthDesktop   = _pick(p.player_song_element_heigt_desktop,   playerSongElementHeigthDesktop);
    playerScrollerSongElementMin     = _pick(p.player_scroller_song_element_min,    playerScrollerSongElementMin);
    playerScrollControl              = _pick(p.player_scroll_control,               playerScrollControl);
    playerAutoScrollSongElement      = _pick(p.player_auto_scroll_song_element,     playerAutoScrollSongElement);

    // code optimization
    // 'type' travels in the SAME page-global subtree the adapter already hands
    // over (amplitude_player_global). No new adapter key is required — the
    // value was simply never read.
    //
    playerDefaultType                = _pick(p.type, playerDefaultType);

    var pl = opts.playlist || {};
    playlistAudioInfo                = _pick(pl.audio_info, playlistAudioInfo);

    // Claude - J1 amplitudePlayer optimization #4
    // Resolve the sync switch from the effective page-global chain and
    // PUBLISH it on the shared adapter data, so the 'ytp' plugin reads the
    // very same resolved value (ytpSyncActiveSongEnabled) instead of the raw
    // module defaults.
    //
    playerSyncActiveSong             = (_pick(p.sync_active_song, playerSyncActiveSong) !== false);
    _activeSongSync().enabled        = playerSyncActiveSong;
    _activeSongSync().followNative   = _followActiveSongNative;

    // reset the per-instance cache: the chain has been re-published
    amplitudeInstanceOptions = {};

    isDev && logger.debug('\n' + 'setAdapterOptions: adapter options applied');
    return adapterOptions;
  } // END setAdapterOptions

  // code optimization
  // _pick(): guard for absent YAML keys — an 'undefined' member must NEVER
  // overwrite a resolved default (same role as _definedOnly() in the J1
  // videoPlayer adapter chain).
  //
  function _pick(value, fallback) {
    return (value === undefined || value === null) ? fallback : value;
  } // END _pick

  // ---------------------------------------------------------------------------
  // getInstanceOptions(playerId)
  // Returns the EFFECTIVE options for ONE player instance, built from the
  // config inheritance chain (later overloads earlier):
  //
  //   1. amplitudeDefaults      — _data/modules/defaults/amplitude.yml
  //   2. user settings          — _data/modules/amplitude_player_control.yml
  //                               (GLOBAL keys of settings, w/o 'players')
  //   3. player entry           — _data/modules/amplitude_player_control.yml
  //                               (settings.players[], matched by id)
  //
  // All default keys are available on the result; keys present in the
  // user settings overload the defaults, keys present in the player entry
  // overload both. The player entry keys are applied at PLAYER scope
  // (they overload <result>.player.*), matching the key layout of the
  // control file entries (type, source, plugin_manager, playlist, ...).
  // When no control entry exists for the given id, the result equals the
  // global chain (defaults <- user settings).
  //
  // Results are cached per playerId and exposed on the adapter object as
  // j1.adapter.amplitudePlayer.amplitudeInstanceOptions[playerId] (mirrored on
  // j1.modules.amplitudejs.instanceOptions) so the module and plugins
  // (ytp) can read the per-instance options directly.
  // ---------------------------------------------------------------------------
  function getInstanceOptions(playerId) {
    // fast path: already resolved for this instance
    if (amplitudeInstanceOptions[playerId]) {
      return amplitudeInstanceOptions[playerId];
    }

    // user layer: all GLOBAL top-level keys of the control settings,
    // excluding the per-player array 'players'
    var userSettings = {};
    try {
      Object.keys(amplitudePlayers || {}).forEach(function (key) {
        if (key !== 'players') { userSettings[key] = amplitudePlayers[key]; }
      });
    } catch (e) {
      isDev && logger.error('\n' + 'getInstanceOptions: user settings lookup failed [' + playerId + ']: ' + e);
    }

    // resolve the player entry from the RAW control settings
    var playerEntry = null;
    try {
      var players = (amplitudePlayers && Array.isArray(amplitudePlayers.players))
        ? amplitudePlayers.players
        : [];
      for (var i = 0; i < players.length; i++) {
        if (players[i] && players[i].id === playerId) {
          playerEntry = players[i];
          break;
        }
      }
    } catch (e) {
      isDev && logger.error('\n' + 'getInstanceOptions: control lookup failed [' + playerId + ']: ' + e);
    }

    if (playerEntry === null) {
      isDev && logger.warn('\n' + 'getInstanceOptions: no control entry found [' + playerId + '] — instance falls back to defaults <- user settings');
    }

    // build the per-instance chain
    // player settings -> overload user settings -> overload default settings
    var instanceOptions = deepMerge({}, amplitudeDefaults, userSettings);

    // the player entry keys live at PLAYER scope: they overload the
    // 'player' subtree of the chain (defaults.player <- user.player)
    //
    // code optimization
    // The adapter version merged the player entry in the ELSE branch only.
    // When the chain carried NO 'player' subtree, the branch created an
    // EMPTY object and DROPPED the player entry silently — the per-player
    // overload was lost for exactly the case it is needed most. Both
    // branches merge now; the if-branch only makes sure the merge target
    // exists.
    //
    if (instanceOptions.player === undefined || instanceOptions.player === null) {
      instanceOptions.player = {};
    }
    if (playerEntry !== null) {
      instanceOptions.player = deepMerge(instanceOptions.player, playerEntry);
    }

    // update environment setting (parity with the global amplitudeOptions)
    instanceOptions.env = environment;

    // cache + expose
    amplitudeInstanceOptions[playerId] = instanceOptions;
    _adapter()['amplitudeInstanceOptions'] = amplitudeInstanceOptions;
    _module().instanceOptions = amplitudeInstanceOptions;

    isDev && logger.debug('\n' + 'getInstanceOptions: per-instance options resolved [' + playerId + ']');
    return instanceOptions;
  } // END getInstanceOptions

  // ===========================================================================
  // SONG BUILDING
  // ===========================================================================

  // ---------------------------------------------------------------------------
  // code optimization
  // buildSongs(songItems, songs)
  //
  // The JS body of the former adapter method songLoader(). The adapter keeps
  // ONLY the Liquid loop that emits the raw 'items' array of every ENABLED
  // playlist and hands each array over to this function:
  //
  //   {% for playlist in amplitude_player_media.playlists %}{% if playlist.enabled %}
  //     ap.buildSongs({{playlist.items | ... }}, songs);
  //   {% endif %}{% endfor %}
  //
  // The mapping table below is UNCHANGED (config key -> AmplitudeJS song
  // property).
  // ---------------------------------------------------------------------------
  //
  function buildSongs(songItems, songs) {
    var song_items = $.extend({}, songItems);

    songs = songs || [];

    for (var i = 0; i < Object.keys(song_items).length; i++) {
      if (song_items[i].enabled) {
        var item = song_items[i];
        var song = {};

        // map config settings|amplitude song items
        // ---------------------------------------------------------------------
        for (const key in item) {
          // skip properties NOT needed for a song
          if (key === 'item' || key === 'audio_base' || key === 'enabled') {
            continue;
          } else if (key === 'audio') {
            song.url = amplitudeMediaURL(item.audio_base, item[key]);
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
          } else if (key === 'playlist') {
            song.playlist = item[key];
            continue;
          } else if (key === 'shuffle') {
            song.shuffle = ((!!item[key]) === false) ? playerShuffle : item[key];
            continue;
          } else if (key === 'repeat') {
            song.repeat = ((!!item[key]) === false) ? playerRepeat : item[key];
            continue;
          } else if (key === 'start') {
            song.start = ((!!item[key]) === false) ? '00:00:00' : item[key];
            continue;
          } else if (key === 'end') {
            song.end = ((!!item[key]) === false) ? '00:00:00' : item[key];
            continue;
          } else {
            song[key] = item[key];
          } // END if key
        } // END for item

        // code optimization
        // songs.push() moved INSIDE the 'enabled' branch. In the adapter it
        // sat OUTSIDE the branch, so a DISABLED item pushed the song object
        // of the PREVIOUS iteration a second time (and threw a
        // ReferenceError on a disabled FIRST item, because 'song' was not
        // yet assigned). Disabled items are skipped entirely now.
        //
        songs.push(song);
      } // END id enabled
    } // END for song_items

    return songs;
  } // END buildSongs

  // ===========================================================================
  // AT PLAYER RUNTIME
  // ===========================================================================

  // ---------------------------------------------------------------------------
  // setSongActive(currentPlayList, currentIndex)
  // set song active at index in playlist
  // ---------------------------------------------------------------------------
  function setSongActive(currentPlayList, currentIndex) {
    var playlist, songContainers, songIndex;

    songIndex = currentIndex;

    // Claude - J1 amplitudePlayer optimization #3
    // -------------------------------------------------------------------------
    // Remember the active song of THIS playlist BEFORE any container is
    // touched, so a parallel player (native or 'ytp') can restore the marker
    // of this playlist later on. See _activeSongRegistry() for the full
    // description of the out-of-sync defect.
    //
    _registerActiveSong(currentPlayList, songIndex);

    // clear ALL active song containers
    // -------------------------------------------------------------------------

    // Claude - J1 amplitudePlayer optimization #3
    // -------------------------------------------------------------------------
    // PLAYLIST-SCOPED clearing (was: PAGE-GLOBAL).
    //
    // The loop removed the marker class from the song containers of EVERY
    // player of the page, while the SET phase below re-marks only containers
    // whose 'data-amplitude-playlist' equals currentPlayList. The clear was
    // therefore the asymmetric half of the operation and un-marked the
    // playlist of every OTHER player -- most visibly the large player driven
    // by the 'ytp' plugin.
    //
    // Clearing is limited to the containers of the playlist being updated.
    //
    // FAILSAFE: an empty|missing playlist name falls back to the LEGACY
    // page-global clear, so no call path can leave stale markers behind.
    //
    songContainers = document.getElementsByClassName("amplitude-song-container");
    for (var i=0; i<songContainers.length; i++) {
      if (typeof currentPlayList !== 'string' || currentPlayList.length === 0) {
        songContainers[i].classList.remove("amplitude-active-song-container");
        continue;
      }
      if (songContainers[i].getAttribute("data-amplitude-playlist") === currentPlayList) {
        songContainers[i].classList.remove("amplitude-active-song-container");
      }
    }

    // Original (deprecated, preserved for reference):
    // songContainers = document.getElementsByClassName("amplitude-song-container");
    // for (var i=0; i<songContainers.length; i++) {
    //   songContainers[i].classList.remove("amplitude-active-song-container");
    // }

    // find current song container and activate the element
    // -------------------------------------------------------------------------
    songContainers = document.querySelectorAll('.amplitude-song-container[data-amplitude-song-index="' + songIndex + '"]');
    for (var i=0; i<songContainers.length; i++) {
      if (songContainers[i].hasAttribute("data-amplitude-playlist")) {
        playlist = songContainers[i].getAttribute("data-amplitude-playlist");
        if (playlist === currentPlayList) {
          songContainers[i].classList.add("amplitude-active-song-container");

          // save AT player data for later use (e.g. events)
          // -------------------------------------------------------------------
          _saveAtpState(songIndex, playlist);
        }
      }
    }

    // Claude - J1 amplitudePlayer optimization #3
    // -------------------------------------------------------------------------
    // Restore the marker of every OTHER registered playlist of the page. This
    // repairs BOTH the page-global clear of AmplitudeJS itself
    // (ContainerElements.setActive, called on every afterSongChange) AND any
    // clear performed by a parallel player, so the playlist of a native large
    // player and the playlist of a 'ytp' large player stay synchronized.
    //
    _restoreForeignActiveContainers(currentPlayList);

    // Claude - J1 amplitudePlayer optimization #4
    // -------------------------------------------------------------------------
    // PAGE-WIDE sync of the marker: every other playlist of the page shows
    // the same index now (see _mirrorActiveSong). The ENGINE follow of the
    // YouTube players is triggered from processOnStateChangePlaying() AFTER
    // the parallel players were stopped.
    //
    _mirrorActiveSong(currentPlayList, songIndex);

  } // END setSongActive

  // ---------------------------------------------------------------------------
  // atPlayerScrollToActiveElement(metaData)
  // ---------------------------------------------------------------------------
  function atPlayerScrollToActiveElement(metaData) {
    var scrollableList, songIndex, playlist,
        activeElement, activeElementOffsetTop, numSongs,
        songElementMin;

    if (!playerAutoScrollSongElement) {
      // do nothing if playerAutoScrollSongElement is false
      return;
    }

    songIndex       = metaData.index;
    songElementMin  = playerScrollerSongElementMin;
    playlist        = metaData.playlist;
    scrollableList  = document.getElementById('large_player_title_list_' + playlist);

    // code optimization
    // The NULL check of scrollableList ran AFTER scrollableList.querySelector()
    // had already been called on it. A player whose title list is not in the
    // page (mini|compact only) threw a TypeError instead of returning. The
    // guard is evaluated BEFORE the first dereference now.
    //
    if (scrollableList === null) {
      return;
    }

    activeElement   = scrollableList.querySelector('.amplitude-active-song-container');
    numSongs        = Amplitude.getSongsInPlaylist(playlist).length;

    if (activeElement === null)  {
      // do nothing if NO scrollableList or ACTIVE element found (failsafe)
      return;
    }

    // LARGE players
    // -------------------------------------------------------------------------
    if (songIndex > 0 && numSongs >= songElementMin) {
      activeElementOffsetTop    = songIndex * _adapterData().playerSongElementHeigth;
      scrollableList.scrollTop  = activeElementOffsetTop;
    } else {
      // do nothing if songIndex is 0 or less than songElementMin
      return;
    }

    // save AT player data for later use (e.g. events)
    // -------------------------------------------------------------------------
    _saveAtpState(songIndex, playlist);

    // COMPACT players (WIP)
    // -------------------------------------------------------------------------
    // playerSongElementHeigthCompact  = 74.00;
    // if (songIndex > 0 && numSongs >= songElementMin) {
    //   activeElementOffsetTop    = (songIndex * playerSongElementHeigthCompact);
    //   scrollableList.scrollTop  = activeElementOffsetTop;
    // } else {
    //   return;
    // }

  } // END atPlayerScrollToActiveElement

  // ---------------------------------------------------------------------------
  // atpUpdatMetaContainers(playlist, rating)
  // update song rating in playlist-screen|meta-container
  // for all (compact|large) players
  // ---------------------------------------------------------------------------
  function atpUpdatMetaContainers(metaData) {
    var activePlayist   = metaData.playlist;
    var rating          = parseInt(metaData.rating);
    var trackID         = metaData.index + 1;

    isDev && logger.debug('\n' + `UPDATE metadata on atpUpdatMetaContainers for trackID|playlist at: ${trackID}|${activePlayist}`);

    // properties automatically set by AT API
    if (requiredForATP) {
      // update SONG NAME in meta-containers
      var songName = document.getElementsByClassName("song-name");
      if (songName.length) {
        for (var i=0; i<songName.length; i++) {
          var currentPlaylist = songName[i].dataset.amplitudePlaylist;
          if (currentPlaylist === activePlayist) {
            songName[i].innerHTML = metaData.name;
          }
        }
      }
    }

    // properties automatically set by AT API
    if (requiredForATP) {
      // update SONG ARTIST name in meta-containers
      var artistName = document.getElementsByClassName("artist");
      if (artistName.length) {
        for (var i=0; i<artistName.length; i++) {
          // code optimization
          // copy-paste defect: the ARTIST loop read the playlist attribute
          // from the SONG NAME collection (songName[i]) instead of its own
          // collection. Both collections rarely have the same length, so the
          // loop threw a TypeError once artistName was longer.
          //
          var currentPlaylist = artistName[i].dataset.amplitudePlaylist;
          if (currentPlaylist === activePlayist) {
            artistName[i].innerHTML = metaData.artist;
          }
        }
      }
    }

    // properties automatically set by AT API
    if (requiredForATP) {
      // update SONG ALBUM name in meta-containers
      var albumName = document.getElementsByClassName("album");
      if (albumName.length) {
        for (var i=0; i<albumName.length; i++) {
          var currentPlaylist = albumName[i].dataset.amplitudePlaylist;
          if (currentPlaylist === activePlayist) {
            albumName[i].innerHTML = metaData.album;
          }
        }
      }
    }

    // update SONG RATING in screen controls
    var screenControlRatingElements = document.getElementsByClassName('audio-rating-screen-controls');
    if (rating) {
      for (let i=0; i<screenControlRatingElements.length; i++) {
        var ratingElement = screenControlRatingElements[i];
        if (ratingElement.dataset.amplitudePlaylist === activePlayist && ratingElement.classList.contains('audio-rating-screen-controls')) {
          ratingElement.innerHTML = '<img src="/assets/image/pattern/rating/scalable/' + rating + '-star.svg"' + 'alt="song rating">';
        }
      }
    }

    // update SONG INFO in screen controls
    var songAudioInfo = document.getElementsByClassName("audio-info-link-screen-controls");
    if (songAudioInfo.length) {
      for (var i=0; i<songAudioInfo.length; i++) {
        var currentPlaylist = songAudioInfo[i].dataset.amplitudePlaylist;
        if (currentPlaylist === activePlayist) {
          if (metaData.audio_info) {
            songAudioInfo[i].setAttribute("href", metaData.audio_info);
          }
        }
      }
    } // END if songAudioInfo

  } // END atpUpdatMetaContainers

  // ---------------------------------------------------------------------------
  // atpStopParallelActivePlayers(players)
  // stop active YT players (running in parallel to AT players)
  // ---------------------------------------------------------------------------
  function atpStopParallelActivePlayers(players) {
    var ytPlayer, playerState, ytPlayerState;

    // code optimization
    // failsafe: the adapter called Object.keys() on the raw argument. The
    // call site passes j1.adapter.<ns>.data.ytPlayers which is 'undefined'
    // until the ytp plugin registered its first player.
    //
    if (players === undefined || players === null) {
      return;
    }

    const ytPlayers = Object.keys(players);
    for (var i=0; i<ytPlayers.length; i++) {
      const ytPlayerID = ytPlayers[i];

      ytPlayer      = players[ytPlayerID].player;
      playerState   = ytPlayer.getPlayerState();
      ytPlayerState = YT_PLAYER_STATE_NAMES[playerState];

      // stop YT players running in parallel
      // -----------------------------------------------------------------------
      var isValidPlayerState = /playing|paused|buffering/.test(ytPlayerState);
      if (isValidPlayerState) {
        // code optimization
        // the log line interpolated the UNDECLARED identifier 'playerID'
        // (ReferenceError in dev mode, which aborted the state processing
        // before stopVideo() was ever reached). The loop variable is
        // 'ytPlayerID'.
        //
        isDev && logger.debug('\n' + `STOP YT player on id: ${ytPlayerID}`);
        ytPlayer.stopVideo();
      }

      // toggle PlayPause buttons playing => puased
      // -----------------------------------------------------------------------
      var ytpButtonPlayerPlayPause = document.getElementsByClassName("large-player-play-pause-" + ytPlayerID);
      for (var j=0; j<ytpButtonPlayerPlayPause.length; j++) {

        var htmlElement = ytpButtonPlayerPlayPause[j];
        if (htmlElement.dataset.amplitudeSource === 'youtube') {
          if (htmlElement.classList.contains('amplitude-playing')) {
            htmlElement.classList.remove('amplitude-playing');
            htmlElement.classList.add('amplitude-paused');
          }
        }
      } // END for ytpButtonPlayerPlayPause

    } // END for ytPlayers
  } // END atpStopParallelActivePlayers

  // ---------------------------------------------------------------------------
  // atpFadeInAudio
  // ---------------------------------------------------------------------------
  // Lifted OUT of initApi(). In the adapter both fade helpers were declared
  // INSIDE initApi() while their ONLY call sites live in the SIBLING methods
  // atpProcessAudioStartPosition()|atpProcessAudioEndPosition(). A function
  // declaration is scoped to its enclosing function, so the calls could never
  // resolve and always threw:
  //
  //   ReferenceError: atpFadeInAudio is not defined
  //
  // i.e. the configured audio_fade_in|audio_fade_out never worked. Both
  // helpers are module-scope functions now and are reachable from every call
  // site.
  // ---------------------------------------------------------------------------
  function atpFadeInAudio(params) {
    const cycle = FADE_CYCLE_MS;
    var   settings, currentStep, steps, sliderID, volumeSlider;

    isFadingIn = true;

    // current fade-in settings using DEFAULTS (if available)
    //
    // code optimization
    // 'params.targetVolume = 50' was an ASSIGNMENT, not a default: it
    // OVERWROTE any caller value with 50 and then stored 50. Same defect for
    // 'speed'. Replaced by real fallbacks.
    //
    settings =  {
      playerID:     params.playerID,
      targetVolume: _pick(params.targetVolume, FADE_DEFAULT_TARGET),
      speed:        _pick(params.speed, 'default')
    };

    // number of iteration steps to INCREASE the players volume on fade-in
    // NOTE: number of steps controls how long and smooth the fade-in
    // transition will be
    //
    sliderID     = 'volume_slider_' + settings.playerID;
    volumeSlider = document.getElementById(sliderID);
    steps        = FADE_ITERATION_STEPS[settings.speed] || FADE_ITERATION_STEPS['default'];
    currentStep  = 1;

    if (volumeSlider === undefined || volumeSlider === null) {
      isFadingIn = false;
      isDev && logger.warn('\n' + `no volume slider found at playerID: ${settings.playerID}`);
      return;
    }

    // Start the players volume muted
    Amplitude.setVolume(0);

    const fadeInInterval = setInterval(() => {
      const newVolume = settings.targetVolume * (currentStep / steps);

      Amplitude.setVolume(newVolume);
      volumeSlider.value = newVolume;
      currentStep++;

      if (currentStep > steps) {
        isFadingIn = false;
        clearInterval(fadeInInterval);
      }

    }, cycle);

  } // END atpFadeInAudio

  // ---------------------------------------------------------------------------
  // atpFadeAudioOut
  //
  // returns true if fade-out is finished
  // ---------------------------------------------------------------------------
  function atpFadeAudioOut(params) {
    const cycle = FADE_CYCLE_MS;
    var   settings, currentStep, steps, sliderID, songs,
          startVolume, newVolume, defaultVolume, volumeSlider;

    // current fade-out settings using DEFAULTS (if available)
    //
    // code optimization
    // same assignment-instead-of-default defect as in atpFadeInAudio
    //
    settings =  {
      playerID:       params.playerID,
      speed:          _pick(params.speed, 'default')
    };

    isFadingOut = true;

    sliderID      = 'volume_slider_' + settings.playerID;
    volumeSlider  = document.getElementById(sliderID);
    startVolume   = Amplitude.getVolume();
    steps         = FADE_ITERATION_STEPS[settings.speed] || FADE_ITERATION_STEPS['default'];
    currentStep   = 1;
    defaultVolume = FADE_DEFAULT_VOLUME;

    var songMetaData  = Amplitude.getActiveSongMetadata();
    var playlist      = songMetaData.playlist;
    var songIndex     = songMetaData.index;
    var trackID       = songIndex + 1;

    // save AT player data for later use (e.g. events)
    // -------------------------------------------------------------------------
    _saveAtpState(songIndex, playlist);

    if (volumeSlider !== null) {
      const fadeOutInterval = setInterval(() => {
        newVolume = startVolume * (1 - currentStep / steps);

        Amplitude.setVolume(newVolume);
        volumeSlider.value = newVolume;
        currentStep++;

        // seek current audio to total end to continue on next track
        if (currentStep > steps) {
          songs = Amplitude.getSongsInPlaylist(playlist);

          if (songIndex === songs.length-1) {
            isDev && logger.debug('\n' + `restore player volume on last trackID|volume at: ${trackID}|${defaultVolume}`);
            volumeSlider.value  =  defaultVolume;
          }

          isFadingOut = false;
          clearInterval(fadeOutInterval);
        }
      }, cycle);
    } else {
      // code optimization
      // the adapter left isFadingOut TRUE forever when no slider was found.
      // atpProcessAudioEndPosition() polls on '!isFadingOut', so a single
      // missing slider froze the END position processing of ALL players.
      //
      isFadingOut = false;
    } // END if volumeSlider

  } // END atpFadeAudioOut

  // ---------------------------------------------------------------------------
  // atpProcessAudioStartPosition()
  // process audio for configured START position
  // ---------------------------------------------------------------------------
  function atpProcessAudioStartPosition() {
    var songMetaData, songIndex, playlist,
        songStartSec, songStartTS, trackID, playerID;

    songMetaData  = Amplitude.getActiveSongMetadata();
    songIndex     = songMetaData.index;
    songStartTS   = songMetaData.start;
    songStartSec  = timestamp2seconds(songStartTS);
    playlist      = Amplitude.getActivePlaylist();
    trackID       = songIndex + 1;

    // code optimization
    // resolve the OWNING player of the active playlist (see the note at
    // _resolveActivePlayerID) — the adapter passed an undeclared 'playerID'
    //
    playerID      = _resolveActivePlayerID();

    if (!songStartSec) {
      return;
    }

    // save AT player data for later use (e.g. events)
    // -------------------------------------------------------------------------
    _saveAtpState(songIndex, playlist);

    var checkIsFading = setInterval (() => {
      if (!isFadingIn) {
        var currentAudioTime = Amplitude.getSongPlayedSeconds();
        if (songStartSec && currentAudioTime <= songStartSec) {
          var songDurationSec = timestamp2seconds(songMetaData.duration);

          // seek audio to configured START position
          // NOTE: use setSongPlayedPercentage for seeking to NOT
          //       generation any addition state changes like stopped
          //       or playing
          //
          isDev && logger.debug( '\n' + `seek audio in on playlist: ${playlist} at|to trackID|timestamp: ${trackID}|${songStartTS}`);
          Amplitude.setSongPlayedPercentage((songStartSec / songDurationSec) * 100);

          // fade-in audio (if enabled)
          //
          var fadeAudioIn = (songMetaData.audio_fade_in === 'true') ? true : false;
          if (fadeAudioIn) {
            isDev && logger.debug('\n' + `fade audio in on playlist: ${playlist} at|to trackID|timestamp: ${trackID}|${songStartTS}`);
            atpFadeInAudio({ playerID: playerID });
          } // END if fadeAudio

        } // END if songStartSec

        clearInterval(checkIsFading);
      }
    }, AUDIO_POSITION_POLL); // END checkIsFading
  } // END atpProcessAudioStartPosition

  // ---------------------------------------------------------------------------
  // atpProcessAudioEndPosition()
  // process audio for configured END position
  // ---------------------------------------------------------------------------
  function atpProcessAudioEndPosition() {
    var songMetaData, songIndex, playlist,
        songStartSec, songStartTS, songEndSec, songEndTS,
        trackID, playerID;

    songMetaData  = Amplitude.getActiveSongMetadata();
    songIndex     = songMetaData.index;
    songStartTS   = songMetaData.start;
    songStartSec  = timestamp2seconds(songStartTS);
    songEndTS     = songMetaData.end;
    songEndSec    = timestamp2seconds(songEndTS);
    playlist      = Amplitude.getActivePlaylist();
    trackID       = songIndex + 1;

    // code optimization
    // see atpProcessAudioStartPosition
    //
    playerID      = _resolveActivePlayerID();

    // save AT player data for later use (e.g. events)
    // -------------------------------------------------------------------------
    _saveAtpState(songIndex, playlist);

    if (songEndSec > songStartSec) {
      var checkIsOnVideoEnd = setInterval(() => {
        if (!isFadingOut) {
          var currentAudioTime = Amplitude.getSongPlayedSeconds();
          if (currentAudioTime >= songEndSec) {
            songMetaData  = Amplitude.getActiveSongMetadata();
            songIndex     = songMetaData.index;
            trackID       = songIndex + 1;

            // seek audio out to END position
            // NOTE:
            // -----------------------------------------------------------------
            // use setSongPlayedPercentage for seeking to NOT
            // generation any addition state changes like stopped
            // or playing
            isDev && logger.debug('\n' + `seek audio to end on playlist: ${playlist} at trackID|timestamp: ${trackID}|${songEndTS}`);
            Amplitude.setSongPlayedPercentage(99.99);

            // fade-out audio (if enabled)
            //
            var fadeAudioOut = (songMetaData.audio_fade_out === 'true') ? true : false;
            if (fadeAudioOut) {
              isDev && logger.debug('\n' + `fade audio out on playlist: ${playlist} at trackID|timestamp: ${trackID}|${songEndTS}`);
              atpFadeAudioOut({ playerID: playerID });
            } // END if fadeAudio

            clearInterval(checkIsOnVideoEnd);
          } // END if currentAudioTime
        } // END if !isFading
      }, AUDIO_POSITION_POLL); // END checkIsOnVideoEnd
    } // END if songEndSec

  } // END atpProcessAudioEndPosition

  // ===========================================================================
  // AT PLAYER STATE MACHINE
  // Moved VERBATIM out of the adapter method initApi()
  // ===========================================================================

  // ---------------------------------------------------------------------------
  // doNothingOnStateChange(state)
  //
  // wrraper for states that are not processed
  // ---------------------------------------------------------------------------
  function doNothingOnStateChange(state) {

    // Fix J1 Amplitude playerID
    // removed the (unused) playerID calculated from the playlist name;
    // playerID is an independent value (YAML key "id", set via the HTML
    // attribute "data-amplitude-player") and cannot be derived from a
    // playlist name
    //
    var playlist, songMetaData, songIndex, trackID;

    playlist      = Amplitude.getActivePlaylist();
    songMetaData  = Amplitude.getActiveSongMetadata();
    songIndex     = songMetaData.index;
    trackID       = songIndex + 1;

    // save AT player data for later use (e.g. events)
    // -------------------------------------------------------------------------
    _saveAtpState(songIndex, playlist);

    isDev && logger.debug('\n' + `DO NOTHING on StateChange for playlist: ${playlist} at trackID|state: ${trackID}|${AT_PLAYER_STATE_NAMES[state]}`);

  } // END doNothingOnStateChange

  // ---------------------------------------------------------------------------
  // processOnStateChangePlaying()
  //
  // wrraper to process the ACTIVE player on state PLAYING
  // ---------------------------------------------------------------------------
  function processOnStateChangePlaying(state) {
    var songMetaData, songIndex,  playlist, trackID;

    songMetaData  = Amplitude.getActiveSongMetadata();
    songIndex     = songMetaData.index;
    playlist      = Amplitude.getActivePlaylist();
    trackID       = songIndex + 1;

    // save AT player data for later use (e.g. events)
    // -------------------------------------------------------------------------
    _saveAtpState(songIndex, playlist);

    isDev && logger.debug('\n' + `PLAY audio on AT Player at playlist|trackID: ${playlist}|${trackID}`);

    // save player GLOBAL data for later use (e.g. events)
    _adapterData().activePlayer = 'atp';

    // set song (manually) active at index in playlist
    setSongActive(playlist, songIndex);

    // stop active YT players
    // -------------------------------------------------------------------------
    atpStopParallelActivePlayers(_adapterData().ytPlayers);

    // Claude - J1 amplitudePlayer optimization #4
    // ENGINE follow native -> ytp: cue the YouTube players to the same index
    // (AFTER they were stopped above, see _followActiveSongYtp).
    //
    _followActiveSongYtp(playlist, songIndex);

    // update song rating in playlist-screen|meta-container
    // -------------------------------------------------------------------------
    atpUpdatMetaContainers(songMetaData);

    // scroll active song in players playlist
    // -------------------------------------------------------------------------
    atPlayerScrollToActiveElement(songMetaData);

    // process audio for AT players at configured START position
    // -------------------------------------------------------------------------
    atpProcessAudioStartPosition();

    // process audio for AT players at configured END position
    // -------------------------------------------------------------------------
    atpProcessAudioEndPosition();

    // save YT player data for later use (e.g. events)
    // -------------------------------------------------------------------------
    _adapterData().activePlayer = 'atp';
    _adapterData().atpGlobals   = _adapterData().atpGlobals || {};
    _adapterData().atpGlobals.activePlayerType = 'large';

  } // END processOnStateChangePlaying

  // ---------------------------------------------------------------------------
  // onInitialized
  // ---------------------------------------------------------------------------
  function onInitialized() {
    // indicate api failed on initialization
    apiInitialized.state = true;
    _moduleAtp().apiReady = apiInitialized.state;
  } // END onInitialized

  // ---------------------------------------------------------------------------
  // onAudioError
  //
  // Errors fired by the YT API
  // ---------------------------------------------------------------------------
  function onAudioError(event) {
    if (event > 0) {
      isDev &&  logger.warn('\n' + `Audio API error occured: ${AUDIO_ERROR_NAMES[event]}`);
    }
  } // END onAudioError

  // ---------------------------------------------------------------------------
  // onPlayerStateChange
  //
  // process all AT Player specific state changes
  // ---------------------------------------------------------------------------
  // NOTE:
  // The AT API fires a lot of INTERMEDIATE states. MOST of them gets
  // ignored (do nothing). Currently, only state PLAYING is actively
  // processed.
  // ---------------------------------------------------------------------------
  function onPlayerStateChange(state) {

    // process all state changes fired by AT API
    // -------------------------------------------------------------------------
    // code optimization
    // The adapter switch opened with 'case AT_PLAYER_STATE.UNSTARTED:'. The
    // key UNSTARTED does NOT exist in AT_PLAYER_STATE, so the case label
    // evaluated to 'undefined' and could never match a numeric state; at the
    // same time the label shadowed nothing, so the entry was pure dead code.
    // It has been dropped, the remaining labels are unchanged.
    //
    switch(state) {
      case AT_PLAYER_STATE.STOPPED:
        doNothingOnStateChange(AT_PLAYER_STATE.STOPPED);
        break;
      case AT_PLAYER_STATE.PAUSED:
        doNothingOnStateChange(AT_PLAYER_STATE.PAUSED);
        break;
      case AT_PLAYER_STATE.PREVIOUS:
        doNothingOnStateChange(AT_PLAYER_STATE.PREVIOUS);
        break;
      case AT_PLAYER_STATE.NEXT:
        doNothingOnStateChange(AT_PLAYER_STATE.NEXT);
        break;
      case AT_PLAYER_STATE.CHANGED:
        doNothingOnStateChange(AT_PLAYER_STATE.CHANGED);
        break;
      case AT_PLAYER_STATE.PLAYING:
        processOnStateChangePlaying(AT_PLAYER_STATE.PLAYING);
        break;
      case AT_PLAYER_STATE.ENDED:
        doNothingOnStateChange(AT_PLAYER_STATE.ENDED);
        break;
      default:
        logger.error('\n' + `UNKNOWN state on StateChange fired: ${state}`);
    } // END switch state
  } // END onPlayerStateChange

  // ---------------------------------------------------------------------------
  // initApi(songlist, playlists)
  //
  // Initializes the ONE global AmplitudeJS engine of the page.
  // See:  https://521dimensions.com/open-source/amplitudejs/docs
  // NOTE: slider VALUE (volume) is set by DEFAULT settings (player)
  // ---------------------------------------------------------------------------
  // code optimization
  // The adapter built the 'playlists' hash with a nested Liquid loop that
  // emitted a JSON literal INTO the Amplitude.init() call. Only the LOOP
  // stays in the adapter now; the resulting hash is handed over as the
  // second argument, so the complete callback block below (~100 lines) is
  // rendered ONCE in this module instead of being part of the adapter.
  // ---------------------------------------------------------------------------
  //
  function initApi(songlist, playlists) {
    isDev && logger.info('\n' + 'initialze API: started');

    Amplitude.init({
      bindings: {
        33:  'play_pause',
        37:  'prev',
        39:  'next'
      },
      songs: songlist,
      playlists: playlists || {},
      callbacks: {
        initialized: function() {
          onInitialized();
        },
        error: function(event) {
          if (event === undefined) {
            onAudioError(0);
          } else {
            onAudioError(event);
          }
        },
        play: function() {
          // make sure the player is playing
          setTimeout(() => {
            onPlayerStateChange(1);
          }, 150);
        },
        pause: function() {
          // make sure the player is paused
          setTimeout(() => {
            onPlayerStateChange(2);
          }, 150);
        },
        stop: function() {
          // make sure the player is stopped
          setTimeout(() => {
            onPlayerStateChange(3);
          }, 150);
        },
        song_change: function() {
          // make sure the player has changed
          setTimeout(() => {
            var currentState = Amplitude.getPlayerState();
            if (currentState === 'stopped') {
              // onPlayerStateChange(3);
              return;
            } else {
              onPlayerStateChange(6);
            }
          }, 150);
        },
        prev: function() {
          // code optimization
          // 'songMetaData' was NOT declared in this callback (the adapter
          // interpolated it into the log lines below). Both branches threw a
          // ReferenceError as soon as delay_next_title|pause_next_title was
          // enabled, so the configured pause-on-previous never ran.
          //
          var songMetaData = Amplitude.getActiveSongMetadata();

          onPlayerStateChange(4);
          if (playerDelayNextTitle) {
            isDev && logger.debug('\n' + `delay on previous title: ${songMetaData.name} with titleIndex ${songMetaData.index}`);
          }

          if (playerPauseNextTitle) {
            amplitudePlayerState = Amplitude.getPlayerState();
            if (amplitudePlayerState === 'playing' || amplitudePlayerState === 'stopped' ) {
              setTimeout(() => {
                // pause playback of next title
                isDev && logger.debug('\n' + `paused on next title: ${songMetaData.name}`);
                Amplitude.pause();
              }, 150);
            } // END if playing
          } // END if pause on next title

          return;
        },
        next: function() {
          // see the 'prev' callback: undeclared 'songMetaData'
          //
          var songMetaData = Amplitude.getActiveSongMetadata();

          onPlayerStateChange(5);
          if (playerDelayNextTitle) {
            isDev && logger.debug('\n' + `delay on next title: ${songMetaData.name} with titleIndex ${songMetaData.index}`);
          }

          if (playerPauseNextTitle) {
            amplitudePlayerState = Amplitude.getPlayerState();
            if (amplitudePlayerState === 'playing' || amplitudePlayerState === 'stopped' ) {
              setTimeout(() => {
                // pause playback of next title
                // bare debug() instead of logger.debug() — a second
                // ReferenceError on the very same line.
                //
                isDev && logger.debug('\n' + `paused on next title: ${songMetaData.name}`);
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

      continue_next:    playerPlayNextTitle,
      volume:           playerDefaultVolume

    }); // END Amplitude init

    isDev && logger.info('\n' + 'initialze API: finished');
    return apiInitialized;
  } // END initApi

  // ===========================================================================
  // PLUGIN LAYER
  // ===========================================================================

  // ---------------------------------------------------------------------------
  // publishPluginOptions(plugin)
  //
  // Publishes the RUNTIME options hash for a J1 plugin (currently: ytp).
  //
  //   module:    name of the calling module (used for logging only)
  //   adapter:   name of the ADAPTER NAMESPACE of the calling module. The
  //              plugin stores its runtime data in j1.adapter.<adapter>.data
  //              and calls the helper methods of j1.adapter.<adapter>
  //              (seconds2timestamp, timestamp2seconds).
  //   defaults:  DEFAULT settings  (_data/modules/defaults/amplitudePlayer.yml)
  //   players:   PLAYER settings   (_data/modules/amplitudePlayer_control.yml)
  //   playlists: PLAYLIST settings (_data/modules/amplitude_player_media.yml)
  //
  // NOTE: The plugin still resolves the LEGACY handoff
  // j1.modules.amplitudejs.{defaults,players,playlists} if no options hash
  // is found. Publishing the hash here makes the amplitude module use the
  // DOCUMENTED path and removes the legacy warning from the log.
  //
  // NOTE: The plugin currently reads the SONGS of a playlist from the
  // AmplitudeJS state (Amplitude.getSongsStatePlaylist). The playlist
  // settings are passed in for completeness (and for future use by the
  // plugin), they are NOT required to create a player.
  // ---------------------------------------------------------------------------
  function publishPluginOptions(plugin) {

    if (plugin !== 'ytp') {
      // no options defined for other plugins (yet)
      return;
    }

    // create the plugin namespace (if not already created)
    //
    j1.plugins         = j1.plugins || {};
    j1.plugins[plugin] = j1.plugins[plugin] || {};

    // code optimization
    // NAMESPACE MISMATCH (functional defect, not cosmetic).
    //
    // The adapter published the literal 'amplitude' for both 'module' and
    // 'adapter'. ytp.js resolves its host with
    //
    //   j1.adapter[ytpOptions.adapter]           -> j1.adapter.amplitude
    //
    // and CREATES that namespace when absent, so the plugin wrote ALL of its
    // runtime data (ytPlayers, ytpGlobals, activePlayer) into
    // j1.adapter.amplitude.data — while THIS adapter reads it back from
    // j1.adapter.amplitudePlayer.data. The two never met:
    // atpStopParallelActivePlayers() always saw an EMPTY player hash and no
    // parallel YouTube player was ever stopped.
    //
    j1.plugins[plugin].options = {
      module:           'amplitudePlayer',
      adapter:          adapterNamespace,
      moduleNamespace:  moduleNamespace,
      defaults:         amplitudeDefaults,
      players:          (amplitudePlayers && amplitudePlayers.players) ? amplitudePlayers.players : [],
      playlists:        $.extend({}, amplitudeMedia)
    };

    isDev && logger.debug('\n' + `published options for plugin: ${plugin}`);

  } // END publishPluginOptions

  // ---------------------------------------------------------------------------
  // pluginManager()
  // ---------------------------------------------------------------------------
  function pluginManager(plugin) {

    const pluginLoaded = isPluginLoaded(plugin);
    if (!pluginLoaded && plugin !== '' && plugin === 'ytp') {
      var tech;
      var techScript;

      // Hand the PLAYER and PLAYLIST settings of THIS module over to the
      // plugin as an options hash. The plugin does NOT read the YAML config
      // files of the amplitude module anymore, and it does NOT assume the
      // adapter namespace j1.adapter.amplitudePlayer anymore either: the key
      // 'adapter' tells the plugin where to store its runtime data.
      //
      // IMPORTANT: the options MUST be published BEFORE the plugin script
      // is added to the page. The plugin resolves its options while it is
      // being loaded (see resolvePluginOptions in ytp.js).
      //
      publishPluginOptions(plugin);

      tech        = document.createElement('script');
      tech.id     = 'tech_' + plugin;
      tech.src    = techSrc + '/js/tech/' + plugin + '.js';
      techScript  = document.getElementsByTagName('script')[0];

      techScript.parentNode.insertBefore(tech, techScript);
    }

    if (plugin !== '' && pluginLoaded) {
      logger.info('\n' + `plugin loaded: ${plugin}`);

      // make sure the plugin installed only ONCE
      //
      ytpPluginInstalled = true;

      _adapterData().atpGlobals = _adapterData().atpGlobals || {};
      _adapterData().atpGlobals.ytpInstalled = true;
    }
  } // END pluginManager

  function isYtpPluginInstalled() {
    return ytpPluginInstalled;
  } // END isYtpPluginInstalled

  // ===========================================================================
  // UI LAYER
  //
  // code optimization
  // This is the section that shrinks the adapter the most. In the adapter the
  // complete mini|compact|large event wiring sat INSIDE a Liquid
  // {% for player %} loop and was guarded by
  //
  //   {% if player.id contains 'mini' %} ... {% endif %}
  //   {% if player.id contains 'compact' %} ... {% endif %}
  //   {% if player.id contains 'large' %} ... {% endif %}
  //
  // so Jekyll emitted a COMPLETE COPY of the matching block for EVERY player
  // of the page. The wiring lives here exactly ONCE and is selected at
  // RUNTIME from the player id. The three tests stay INDEPENDENT ifs (not a
  // switch) to keep the original semantics for ids that match more than one
  // keyword.
  // ---------------------------------------------------------------------------
  // _bindOnce(element, type, handler, flag)
  //
  // Every wiring block below queried the DOM PAGE-WIDE
  // (document.getElementsByClassName). Rendered once per player, a page with
  // three players bound the SAME progress bar three times and the click
  // seeked three times. The elements carry a per-event marker now, so a
  // second registration for the same element+event is skipped.
  // ---------------------------------------------------------------------------
  //
  function _bindOnce(element, type, handler, flag) {
    if (!element) { return false; }

    var key = 'j1Ap' + flag;
    if (element.dataset && element.dataset[key] === 'true') {
      return false;
    }
    element.addEventListener(type, handler);
    if (element.dataset) { element.dataset[key] = 'true'; }
    return true;
  } // END _bindOnce

  // ---------------------------------------------------------------------------
  // code optimization
  // _playerRoot(playerID) / _scopedById(baseId, playerID)
  //
  // MULTI-INSTANCE ID NAMESPACING — the amplitudePlayer counterpart of the
  // per-player namespacing of the multiPlayer series.
  //
  // Fix #1 introduced _bindOnce() so a page-wide element could not be bound
  // twice. That removed the DOUBLE BINDING but NOT the underlying ID
  // COLLISION: the control ids
  //
  //   large_player_previous | large_player_shuffle | large_player_repeat
  //   large_player_right    | compact_player_shuffle | compact_player_repeat
  //
  // carry NO player suffix. With two LARGE players in one page both players
  // resolve the SAME element through document.getElementById() (which returns
  // the FIRST match for a duplicated id). Player A wins, _bindOnce() then
  // silently SKIPS player B, and player B's buttons stay dead.
  //
  // Resolution order (first hit wins):
  //
  //   1. document.getElementById(baseId + '_' + playerID)
  //      the SCOPED markup. Preferred; works as soon as the player HTML
  //      portion emits suffixed ids.
  //   2. root.querySelector('[id="' + baseId + '"]')
  //      LEGACY markup, searched INSIDE this player's own root element.
  //      A subtree query is unaffected by duplicate ids elsewhere in the
  //      page, so each player finds ITS OWN control.
  //   3. document.getElementById(baseId)
  //      last resort for markup that places the control OUTSIDE the player
  //      root. Page-global by definition — the pre-#2 behaviour, kept so no
  //      existing layout loses its controls.
  //
  // Steps 1 and 2 make the fix work with BOTH the current (unsuffixed) and a
  // future (suffixed) player HTML portion, so no template change is required
  // to land this.
  // ---------------------------------------------------------------------------
  //
  function _playerRoot(playerID) {
    if (!playerID) { return null; }
    return document.getElementById(playerID);
  } // END _playerRoot

  function _scopedById(baseId, playerID, root) {
    var scoped, legacy, playerRoot;

    if (!baseId) { return null; }

    // 1. scoped markup
    if (playerID) {
      scoped = document.getElementById(baseId + '_' + playerID);
      if (scoped) { return scoped; }
    }

    // 2. legacy markup, resolved INSIDE this player's root
    playerRoot = root || _playerRoot(playerID);
    if (playerRoot && typeof playerRoot.querySelector === 'function') {
      try {
        legacy = playerRoot.querySelector('[id="' + baseId + '"]');
      } catch (e) {
        legacy = null;
      }
      if (legacy) { return legacy; }
    }

    // 3. page-global last resort (pre-#2 behaviour)
    legacy = document.getElementById(baseId);
    if (legacy && playerRoot && typeof playerRoot.contains === 'function' && !playerRoot.contains(legacy)) {
      isDev && logger && logger.warn('\n' +
        `_scopedById: '${baseId}' resolved OUTSIDE the player root [${playerID}] — control is shared page-wide`);
    }
    return legacy;
  } // END _scopedById

  // ---------------------------------------------------------------------------
  // code optimization
  // _toggleHandlerEl(element, onClass, apply, label)
  //
  // _toggleHandler() (#1) re-resolved the element by ID *inside* the handler
  // via document.getElementById(elementId). Scoping the BINDING alone is
  // therefore not enough: on a second player the handler would still read the
  // class list of the FIRST element carrying that duplicated id and toggle
  // against the wrong state. It also threw a TypeError when the element was
  // removed from the DOM after binding.
  //
  // The element-bound variant closes over the ALREADY RESOLVED element. The
  // id-based _toggleHandler() is kept unchanged (see below) and now delegates.
  // ---------------------------------------------------------------------------
  //
  function _toggleHandlerEl(element, onClass, apply, label) {
    return function (event) {
      var target = element || this;
      if (!target || typeof target.className !== 'string') { return; }

      var state = (target.className.includes(onClass)) ? true : false;
      isDev && logger.debug('\n' + `Set ${label} state to: ${state} [${target.id || 'unnamed'}]`);
      apply(state);
    };
  } // END _toggleHandlerEl

  // ---------------------------------------------------------------------------
  // code optimization
  // _seekOnProgressClick(event) / _skip(offsetSeconds)
  //
  // The progress-bar click handler was written out FIVE times (mini,
  // compact, large and two prepared blocks) and the skip handler FOUR times
  // with the sign as the only difference.
  // ---------------------------------------------------------------------------
  //
  function _seekOnProgressClick(requirePlaying) {
    return function (event) {
      var offset = this.getBoundingClientRect();
      var xpos   = event.pageX - offset.left;

      if (requirePlaying && Amplitude.getPlayerState() !== 'playing') {
        return;
      }
      Amplitude.setSongPlayedPercentage(
        (parseFloat(xpos)/parseFloat(this.offsetWidth))*100);
    };
  } // END _seekOnProgressClick

  function _skipHandler(direction, label) {
    return function (event) {
      const skipOffset  = parseFloat(playerForwardBackwardSkipSeconds);
      const duration    = Amplitude.getSongDuration();
      const currentTime = parseFloat(Amplitude.getSongPlayedSeconds());
      const targetTime  = parseFloat(currentTime + (direction * skipOffset));

      if (currentTime > 0) {
        isDev && logger.debug('\n' + `SKIP ${label} on Button skip${label} for ${skipOffset} seconds`);
        Amplitude.setSongPlayedPercentage((targetTime / duration) * 100);
      }
    };
  } // END _skipHandler

  // code optimization
  // shuffle|repeat toggles were written out four times (compact + large)
  function _toggleHandler(elementId, onClass, apply, label) {

    // code optimization
    // Delegates to _toggleHandlerEl() so BOTH entry points share one code
    // path. The lookup stays LAZY (evaluated on click, not on binding) to
    // keep the original semantics of this signature, and it is null-guarded
    // now — a control removed from the DOM after binding no longer throws.
    //
    return function (event) {
      var element = document.getElementById(elementId);
      if (element === null) {
        isDev && logger.warn('\n' + `_toggleHandler: element vanished [${elementId}] — ${label} ignored`);
        return;
      }
      return _toggleHandlerEl(element, onClass, apply, label).call(element, event);
    };
  } // END _toggleHandler

  // ---------------------------------------------------------------------------
  // setAudioInfo(audioInfo)
  // ---------------------------------------------------------------------------
  function setAudioInfo(audioInfo) {
    // when the audioInfo link is clicked, stop all propagation so
    // AmplitudeJS doesn't play the song.
    //
    for (var i=0; i<audioInfo.length; i++) {
      _bindOnce(audioInfo[i], 'click', function (event) {
        event.stopPropagation();
      }, 'AudioInfo');
    }
  } // END setAudioInfo

  // ---------------------------------------------------------------------------
  // songEvents(songs)
  // ---------------------------------------------------------------------------
  function songEvents(songs, playerID) {
    // code optimization
    // the two log lines interpolated an UNDECLARED 'playerID' (the method had
    // no such parameter in the adapter) — ReferenceError on every call in dev
    // mode. The id is a parameter now.
    //
    isDev && logger.debug('\n' + `initializing title events for player on ID #${playerID}: started`);

    for (var i = 0; i < songs.length; i++) {
      // ensure that on mouseover, CSS styles don't get messed up for active songs
      _bindOnce(songs[i], 'mouseover', function() {
        // active song indicator (mini play button) in playlist
        if (!this.classList.contains('amplitude-active-song-container')) {
          if (this.querySelectorAll('.play-button-container')[0] !== undefined) {
            this.querySelectorAll('.play-button-container')[0].style.display = 'block';
          }
        } // END mini play button in playlist
      }, 'SongOver'); // END EventListener 'mouseover' (songlist)

      // ensure that on mouseout, CSS styles don't get messed up for active songs
      _bindOnce(songs[i], 'mouseout', function() {
        if (this.querySelectorAll('.play-button-container')[0] !== undefined) {
          this.querySelectorAll('.play-button-container')[0].style.display = 'none';
        }
      }, 'SongOut'); // END EventListener 'mouseout' (songlist)

      // show|hide the (mini) play button when the song is clicked
      _bindOnce(songs[i], 'click', function () {
        if (this.querySelectorAll('.play-button-container')[0] !== undefined) {
          this.querySelectorAll('.play-button-container')[0].style.display = 'none';
        }
      }, 'SongClick'); // END EventListener 'click' (songlist)
    }

    isDev && logger.debug('\n' + `initializing title events for player on ID #${playerID}: finished`);
  } // END songEvents

  // ---------------------------------------------------------------------------
  // _wireMiniPlayer(cfg)
  // ---------------------------------------------------------------------------
  function _wireMiniPlayer(cfg) {
    if (document.getElementById(cfg.playerID) === null) { return; }

    // add listeners to all progress bars found (MINI Player)
    // -------------------------------------------------------------------------
    var progressBars = document.getElementsByClassName("mini-player-progress");
    for (var i=0; i<progressBars.length; i++) {
      if (progressBars[i].dataset.amplitudeSource === 'youtube') {
        // do nothing for YTP (managed by plugin)
      } else {
        _bindOnce(progressBars[i], 'click', _seekOnProgressClick(false), 'MiniProgress');
      } // END if progressBars
    } // END for progressBars

  } // END _wireMiniPlayer

  // ---------------------------------------------------------------------------
  // _wireCompactPlayer(cfg)
  // ---------------------------------------------------------------------------
  function _wireCompactPlayer(cfg) {
    if (document.getElementById(cfg.playerID) === null) { return; }

    var playerID     = cfg.playerID;
    var playlistName = cfg.playlistName;

    // show|hide scrollbar in playlist (compact player)
    // -------------------------------------------------------------------------
    const songsInPlaylist = Amplitude.getSongsInPlaylist(playlistName);
    if (songsInPlaylist && songsInPlaylist.length <= cfg.scrollerSongElementMin) {
      const titleListCompactPlayer = document.getElementById('compact_player_title_list_' + playlistName);
      if (titleListCompactPlayer !== null) {
        titleListCompactPlayer.classList.add('hide-scrollbar');
      }
    } // END if songsInPlaylist

    // show playlist
    // -------------------------------------------------------------------------
    var showPlaylist = document.getElementById("show_playlist_" + playerID);
    if (showPlaylist !== null) {
      _bindOnce(showPlaylist, 'click', function(event) {
        var scrollOffset = (window.innerWidth >= 720) ? -130 : -110;

        // scroll player to top position
        const targetDiv         = document.getElementById("show_playlist_" + playerID);
        const targetDivPosition = targetDiv.offsetParent.offsetTop;
        window.scrollTo(0, targetDivPosition + scrollOffset);

        // open playlist
        var playlistScreen = document.getElementById("playlist_screen_" + playerID);

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

      }, 'ShowPlaylist'); // END EventListener
    } // END if showPlaylist

    // hide playlist
    // -------------------------------------------------------------------------
    var hidePlaylist = document.getElementById("hide_playlist_" + playerID);
    if (hidePlaylist !== null) {
      _bindOnce(hidePlaylist, 'click', function(event) {
        var playlistScreen = document.getElementById("playlist_screen_" + playerID);

        playlistScreen.classList.remove('slide-in-top');
        playlistScreen.classList.add('slide-out-top');
        playlistScreen.style.display = "none";
        playlistScreen.style.zIndex = "1";

        // enable scrolling
        if ($('body').hasClass('stop-scrolling')) {
          $('body').removeClass('stop-scrolling');
        }

      }, 'HidePlaylist'); // END addEventListener
    } // END if hidePlaylist

    // add listeners to all progress bars found (compact-player)
    // -------------------------------------------------------------------------
    var progressBars = document.getElementsByClassName("compact-player-progress");
    for (var i=0; i<progressBars.length; i++) {
      if (progressBars[i].dataset.amplitudeSource === 'youtube') {
        // do nothing for YTP (managed by plugin)
      } else {
        _bindOnce(progressBars[i], 'click', _seekOnProgressClick(false), 'CompactProgress');
      } // END if progressBars
    } // END for progressBars

    // click on skip forward|backward (COMPACT player)
    // See: https://github.com/serversideup/amplitudejs/issues/384
    // -------------------------------------------------------------------------
    var compactPlayerSkipForwardButtons = document.getElementsByClassName("compact-player-skip-forward");
    for (var i=0; i<compactPlayerSkipForwardButtons.length; i++) {
      if (compactPlayerSkipForwardButtons[i].dataset.amplitudeSource === 'youtube') {
        // do nothing for YTP (managed by plugin)
      } else {
        if (compactPlayerSkipForwardButtons[i].id === 'skip-forward_' + playerID) {
          _bindOnce(compactPlayerSkipForwardButtons[i], 'click', _skipHandler(1, 'forward'), 'CompactSkipFwd');
        } // END if ID
      }
    } // END SkipForwardButtons (COMPACT player)

    var compactPlayerSkipBackwardButtons = document.getElementsByClassName("compact-player-skip-backward");
    for (var i=0; i<compactPlayerSkipBackwardButtons.length; i++) {
      if (compactPlayerSkipBackwardButtons[i].dataset.amplitudeSource === 'youtube') {
        // do nothing for YTP (managed by plugin)
      } else {
        if (compactPlayerSkipBackwardButtons[i].id === 'skip-backward_' + playerID) {
          _bindOnce(compactPlayerSkipBackwardButtons[i], 'click', _skipHandler(-1, 'backward'), 'CompactSkipBwd');
        } // END if ID
      }
    } // END SkipBackwardButtons (COMPACT player)

    // code optimization
    // per-player root, resolved ONCE for all scoped lookups below
    //
    var compactPlayerRoot = _playerRoot(playerID);

    // click on shuffle button
    //
    var compactPlayerShuffleButton = _scopedById('compact_player_shuffle', playerID, compactPlayerRoot);
    if (compactPlayerShuffleButton) {
      _bindOnce(compactPlayerShuffleButton, 'click',
        _toggleHandlerEl(compactPlayerShuffleButton, 'amplitude-shuffle-on', function (s) { Amplitude.setShuffle(s); }, 'shuffle'),
        'CompactShuffle'); // END EventListener 'click'
    } // END PlayerShuffleButton (COMPACT player)

    // click on repeat button
    //
    var compactPlayerRepeatButton = _scopedById('compact_player_repeat', playerID, compactPlayerRoot);
    if (compactPlayerRepeatButton) {
      _bindOnce(compactPlayerRepeatButton, 'click',
        _toggleHandlerEl(compactPlayerRepeatButton, 'amplitude-repeat-on', function (s) { Amplitude.setRepeat(s); }, 'repeat'),
        'CompactRepeat'); // END EventListener 'click'
    } // END PlayerRepeatButton (COMPACT player)

  } // END _wireCompactPlayer

  // ---------------------------------------------------------------------------
  // _wireLargePlayer(cfg)
  // ---------------------------------------------------------------------------
  function _wireLargePlayer(cfg) {
    if (document.getElementById(cfg.playerID) === null) { return; }

    var playerID      = cfg.playerID;
    var playlistName  = cfg.playlistName;
    var playlistInfo  = cfg.playlistInfo || {};
    var playlist      = playlistInfo.name;

    // Optimization
    // per-player root, resolved ONCE for all scoped lookups below
    //
    var largePlayerRoot = _playerRoot(playerID);

    // click on prev button
    //
    var largePlayerPreviousButton = _scopedById('large_player_previous', playerID, largePlayerRoot);
    if (largePlayerPreviousButton && largePlayerPreviousButton.getAttribute("data-amplitude-source") === 'youtube') {
      // do nothing for YTP (managed by plugin)
    }

    // add listeners to all progress bars found (LARGE player)
    // -------------------------------------------------------------------------
    var progressBars = document.getElementsByClassName("large-player-progress");
    for (var i=0; i<progressBars.length; i++) {
      if (progressBars[i].dataset.amplitudeSource === 'youtube') {
        // do nothing for YTP (managed by plugin)
      } else {
        _bindOnce(progressBars[i], 'click', _seekOnProgressClick(true), 'LargeProgress');
      }
    } // END for

    // add listeners to all SkipForward Buttons found
    // See: https://github.com/serversideup/amplitudejs/issues/384
    // -------------------------------------------------------------------------
    var largePlayerSkipForwardButtons = document.getElementsByClassName("large-player-skip-forward");
    for (var i=0; i<largePlayerSkipForwardButtons.length; i++) {
      if (largePlayerSkipForwardButtons[i].id === 'skip-forward_' + playerID) {
        if (largePlayerSkipForwardButtons[i].dataset.amplitudeSource === 'youtube') {
          // do nothing for YTP (managed by plugin)
        } else {
          _bindOnce(largePlayerSkipForwardButtons[i], 'click', _skipHandler(1, 'forward'), 'LargeSkipFwd');
        } // END largePlayerSkipForwardButtons
      } // END if largePlayerSkipForwardButtons
    } // END for SkipForwardButtons

    // add listeners to all SkipBackward Buttons found
    // -------------------------------------------------------------------------
    var largePlayerSkipBackwardButtons = document.getElementsByClassName("large-player-skip-backward");
    for (var i=0; i<largePlayerSkipBackwardButtons.length; i++) {
      if (largePlayerSkipBackwardButtons[i].id === 'skip-backward_' + playerID) {
        if (largePlayerSkipBackwardButtons[i].dataset.amplitudeSource === 'youtube') {
          // do nothing for YTP (managed by plugin)
        } else {
          _bindOnce(largePlayerSkipBackwardButtons[i], 'click', _skipHandler(-1, 'backward'), 'LargeSkipBwd');
        } // END else
      } // END if largePlayerSkipBackwardButtons
    } // END for SkipBackwardButtons

    // click on shuffle button
    //
    var largePlayerShuffleButton = _scopedById('large_player_shuffle', playerID, largePlayerRoot);
    if (largePlayerShuffleButton) {
      _bindOnce(largePlayerShuffleButton, 'click',
        _toggleHandlerEl(largePlayerShuffleButton, 'amplitude-shuffle-on', function (s) { Amplitude.setShuffle(s); }, 'shuffle'),
        'LargeShuffle'); // END addEventListener
    } // END if largePlayerShuffleButton

    // click on repeat button
    //
    var largePlayerRepeatButton = _scopedById('large_player_repeat', playerID, largePlayerRoot);
    if (largePlayerRepeatButton) {
      _bindOnce(largePlayerRepeatButton, 'click',
        _toggleHandlerEl(largePlayerRepeatButton, 'amplitude-repeat-on', function (s) { Amplitude.setRepeat(s); }, 'repeat'),
        'LargeRepeat'); // END addEventListener
    } // END if largePlayerRepeatButton

    // enable|disable PAGE scrolling on players playlist (LARGE player)
    // -------------------------------------------------------------------------

    // code optimization
    // -------------------------------------------------------------------------
    // EVALUATION of 'player_scroll_control' (playerScrollControl)
    //
    // The setting was resolved through the whole chain
    // (defaults <- user settings <- player) and then never read — the
    // amplitudePlayer counterpart of piHotKeys|piAutoCaption in the
    // multiPlayer module.
    //
    // YAML semantics (_data/modules/defaults/amplitude.yml):
    //   player_scroll_control  "additional control on scrolling player song
    //                           items"
    //
    // So it enables the ADDITIONAL, user-operated scroll control — the
    // click-to-top handlers on the title header and the playlist header.
    // Those handlers were wired as a side effect of
    // 'player_hover_page_scroll_disabled', which is a DIFFERENT concern (it
    // locks PAGE scrolling while the pointer rests on the player).
    //
    // The two are separated with an OR, NOT with a replacement, so the fix is
    // strictly ADDITIVE:
    //
    //   hover=true,  control=false  ->  section runs   (DEFAULT, unchanged)
    //   hover=true,  control=true   ->  section runs   (unchanged)
    //   hover=false, control=true   ->  section runs, page-scroll lock is
    //                                   NOT applied    (NEW capability)
    //   hover=false, control=false  ->  section skipped (unchanged)
    //
    // No existing configuration loses a control this way.
    // -------------------------------------------------------------------------
    //
    var largeHoverPageScrollDisabled = playerHoverPageScrollDisabled;
    var largeScrollControl           = _effectiveScrollControl(cfg);
    var largeScrollSectionEnabled    = (largeHoverPageScrollDisabled || largeScrollControl);

    isDev && logger.debug('\n' +
      `scroll section [${playerID}]: hoverPageScrollDisabled=${largeHoverPageScrollDisabled}, scrollControl=${largeScrollControl}`);

    if (largeScrollSectionEnabled) {

      // show|hide scrollbar in playlist
      // -----------------------------------------------------------------------
      const songsInPlaylist = Amplitude.getSongsInPlaylist(playlistName);
      if (songsInPlaylist && songsInPlaylist.length <= cfg.scrollerSongElementMin) {
        const titleListLargePlayer = document.getElementById('large_player_title_list_' + playlistName);
        if (titleListLargePlayer !== null) {
          titleListLargePlayer.classList.add('hide-scrollbar');
        }
      } // END show|hide scrollbar in playlist

      // scroll player to top position (LARGE player)
      //
      // Bootstrap grid breakpoints
      //   SN:     576px           Mobile
      //   MD:     768px           Small Desktop|Tablet
      //   LG:     992px           Default Desktop
      //   XL:     1200px          Large Desktop
      //   XXL:    1400px          X Large Desktop
      // -----------------------------------------------------------------------

      // code optimization
      // _scrollPlayerToTop() folds the two IDENTICAL handler bodies the
      // adapter carried for the title header and the playlist header.
      //
      var _scrollPlayerToTop = function (event) {
        var playerRight     = document.getElementById(playerID);
        var playlistHeader  = document.getElementById("playlist_header_" + playerID);
        var scrollOffset    = (window.innerWidth >= 992) ? -130 : -44;

        if (playerRight === null || playlistHeader === null) { return; }

        // scroll player|playlist to top position (LARGE player)
        // NOTE: depending on WINDOW SIZE the relation changes to TOP POSITION
        // -----------------------------------------------------------------
        const targetDivPlayerRight            = playerRight;
        const targetDivPositionPlayerRight    = targetDivPlayerRight.offsetTop;
        const targetDivPlaylistHeader         = playlistHeader;
        const targetDivPositionplaylistHeader = targetDivPlaylistHeader.offsetTop;

        // code optimization
        // 'offsetParent' is NULL for any element (or ancestor) with
        // display:none and for position:fixed elements. The chained
        // dereference .offsetParent.firstElementChild.clientHeight therefore
        // threw a TypeError inside a click handler whenever the large player
        // was collapsed or rendered in a hidden tab pane. The header height
        // falls back to 0 now, which degrades to the plain header offset.
        //
        var headerOffsetParent = targetDivPlaylistHeader.offsetParent;
        var headerFirstChild   = (headerOffsetParent) ? headerOffsetParent.firstElementChild : null;
        var headerHeight       = (headerFirstChild) ? headerFirstChild.clientHeight : 0;

        if (targetDivPositionPlayerRight > targetDivPositionplaylistHeader) {
          window.scrollTo(0, targetDivPositionPlayerRight + headerHeight + scrollOffset);
        } else {
          window.scrollTo(0, targetDivPositionplaylistHeader + scrollOffset);
        }
      }; // END _scrollPlayerToTop

      // code optimization
      // the adapter dereferenced the two headers WITHOUT a null check
      // (largePlayerTitleHeader.addEventListener(...)). A large player that
      // renders without the title header threw a TypeError and aborted the
      // REST of the wiring (volume slider presets included).
      //
      var largePlayerTitleHeader = document.getElementById("large_player_title_header_" + playerID);
      _bindOnce(largePlayerTitleHeader, 'click', _scrollPlayerToTop, 'LargeTitleHeader');

      var largePlayerPlaylistHeader = document.getElementById("playlist_header_" + playerID);
      _bindOnce(largePlayerPlaylistHeader, 'click', _scrollPlayerToTop, 'LargePlaylistHeader');

      // disable scrolling (if window viewport >= BS Medium and above)
      //
      // code optimization/#2
      // same missing null check on 'large_player_right'
      var largePlayerRight = _scopedById('large_player_right', playerID, largePlayerRoot);

      // code optimization
      // The PAGE-SCROLL LOCK stays bound to 'player_hover_page_scroll_disabled'
      // ALONE. Without this inner gate the new OR condition of the enclosing
      // block would newly lock page scrolling for a player that only asked for
      // 'player_scroll_control' — a regression. The two original
      // _bindOnce() calls are unchanged, they are only wrapped.
      //
      if (largeHoverPageScrollDisabled) {

      _bindOnce(largePlayerRight, 'mouseenter', function() {
        if (window.innerWidth >= 720) {
          if ($('body').hasClass('stop-scrolling')) {
            return false;
          } else {
            $('body').addClass('stop-scrolling');
          }
        }
      }, 'LargeHoverIn'); // END addEventListener

      // enable scrolling
      //
      _bindOnce(largePlayerRight, 'mouseleave', function() {
        if ($('body').hasClass('stop-scrolling')) {
          $('body').removeClass('stop-scrolling');
        }
      }, 'LargeHoverOut'); // END addEventListener

      } // END if largeHoverPageScrollDisabled

    } // END enable|disable PAGE scrolling on players playlist

    // set volume slider presets (for the player when exists|enabled)
    //
    _applyVolumeSliderPresets(cfg);

  } // END _wireLargePlayer

  // ---------------------------------------------------------------------------
  // code optimization
  // _applyVolumeSliderPresets(cfg)
  //
  // The adapter rendered EIGHT Liquid values per player for this block
  // (four player values + four default fallbacks). The adapter now emits the
  // two hashes once (cfg.volumeSlider / cfg.volumeSliderDefaults) and the
  // fallback logic lives here.
  // ---------------------------------------------------------------------------
  //
  function _applyVolumeSliderPresets(cfg) {
    var volumeSlider = document.getElementById('volume_slider_' + cfg.playerID);
    if (volumeSlider === null) {
      return;
    } // END volumeSlider exists

    var preset    = cfg.volumeSlider         || {};
    var fallback  = cfg.volumeSliderDefaults || {};

    const volumeMin     = parseInt(preset.min_value,     10);
    const volumeMax     = parseInt(preset.max_value,     10);
    const volumeValue   = parseInt(preset.preset_value,  10);
    const volumeStep    = parseInt(preset.slider_step,   10);

    // if player has NO slider presets, use amplitude defaults
    //
    volumeSlider.min    = (isNaN(volumeMin))   ? parseInt(fallback.min_value,    10) : volumeMin;
    volumeSlider.max    = (isNaN(volumeMax))   ? parseInt(fallback.max_value,    10) : volumeMax;
    volumeSlider.value  = (isNaN(volumeValue)) ? parseInt(fallback.preset_value, 10) : volumeValue;
    volumeSlider.step   = (isNaN(volumeStep))  ? parseInt(fallback.slider_step,  10) : volumeStep;
  } // END _applyVolumeSliderPresets

  // ---------------------------------------------------------------------------
  // code optimization
  // _applyGlobalPlayerFeatures()
  //
  // START configured player features. These are PAGE-GLOBAL AmplitudeJS
  // settings (one engine per page). The adapter applied them INSIDE the
  // per-player loop, so on a page with N players the very same three calls
  // ran N times. Guarded to run exactly ONCE.
  // ---------------------------------------------------------------------------
  //
  let _globalFeaturesApplied = false;

  function _applyGlobalPlayerFeatures() {
    if (_globalFeaturesApplied) { return; }
    _globalFeaturesApplied = true;

    isDev && logger.debug('\n' + `set play next title: ${playerPlayNextTitle}`);
    isDev && logger.debug('\n' + `set delay between titles: ${playerDelayNextTitle}ms`);
    isDev && logger.debug('\n' + `set repeat (album): ${playerRepeat}`);
    isDev && logger.debug('\n' + `set shuffle (album): ${playerShuffle}`);

    // set delay between titles (songs)
    Amplitude.setDelay(playerDelayNextTitle);
    // set repeat (album)
    Amplitude.setRepeat(playerRepeat);
    // set shuffle (album)
    Amplitude.setShuffle(playerShuffle);
  } // END _applyGlobalPlayerFeatures

  // ---------------------------------------------------------------------------
  // code optimization
  // initPlayerInstance(cfg)
  //
  // The RUNTIME body of the former adapter method initPlayerUiEvents(). The
  // adapter keeps ONLY the Liquid {% for player %} loop that emits ONE
  // config hash per player and calls this function for it.
  //
  // Expected cfg keys (all rendered by the adapter):
  //
  //   playerID                 '{{player.id}}'
  //   playerType               '{{player_effective.type}}'
  //   xhrContainerId           '{{player.id}}_audio'
  //   playlistName             '{{player.playlist.name}}'
  //   playlistTitle            '{{player.playlist.title}}'
  //   playlistInfo             {{player.playlist | ...}}
  //   scrollerSongElementMin   {{player_effective.player_scroller_song_element_min}}
  //   pluginManagerEnabled     {{player_effective.plugin_manager.enabled}}
  //   plugins                  '{{player_effective.plugin_manager.plugins}}'
  //   volumeSlider             {{player.volume_slider | ...}}
  //   volumeSliderDefaults     {{amplitude_player_default.player.volume_slider | ...}}
  //
  // _effectiveScrollControl(cfg)
  //
  // Per-instance resolution of 'player_scroll_control'. Mirrors the pattern
  // already used for scrollerSongElementMin: the adapter MAY render the
  // per-player value into cfg.scrollControl (from player_effective), and the
  // page-global value resolved in setAdapterOptions() is the fallback. Both
  // the rendered Liquid string 'true'|'false' and a real boolean are accepted
  // so the helper works no matter how the adapter emits the key.
  // ---------------------------------------------------------------------------
  //
  function _effectiveScrollControl(cfg) {
    var value = (cfg || {}).scrollControl;

    if (value === undefined || value === null || value === '') {
      return (playerScrollControl === true || playerScrollControl === 'true');
    }
    return (value === true || value === 'true');
  } // END _effectiveScrollControl

  // ---------------------------------------------------------------------------
  // _resolvePlayerType(cfg)
  //
  // Resolution order for the player TYPE:
  //
  //   1. the id keyword(s) — 'mini' | 'compact' | 'large' contained in the
  //      player id. UNCHANGED and still FIRST, so the #1 semantics for ids
  //      matching MORE THAN ONE keyword survive byte for byte.
  //   2. cfg.playerType    — '{{player_effective.type}}', already part of the
  //      adapter contract since #1 but never read.
  //   3. playerDefaultType — the page-global default (YAML: 'compact').
  //
  // Steps 2 and 3 only ever apply when step 1 matched NOTHING, i.e. for a
  // player id such as 'olivia_dean' that carries no keyword. Those players
  // got NO UI wiring at all before; they are wired from their configured type
  // now. Purely additive: no id that matched before changes its outcome.
  // ---------------------------------------------------------------------------
  //
  function _resolvePlayerType(cfg) {
    var config = cfg || {};
    var id     = String(config.playerID || '');
    var type;

    if (id.indexOf('mini')    !== -1) { return null; }
    if (id.indexOf('compact') !== -1) { return null; }
    if (id.indexOf('large')   !== -1) { return null; }

    type = String(config.playerType || '').toLowerCase();
    if (type !== 'mini' && type !== 'compact' && type !== 'large') {
      type = String(playerDefaultType || '').toLowerCase();
    }
    if (type !== 'mini' && type !== 'compact' && type !== 'large') {
      return null;
    }
    return type;
  } // END _resolvePlayerType

  function initPlayerInstance(cfg) {
    var config = cfg || {};

    if (!config.playerID) {
      logger && logger.error('\n' + 'initPlayerInstance: called without a playerID');
      return null;
    }

    // per-instance scroller minimum (chain: defaults <- user <- player);
    // falls back to the page-global value if the rendered setting is not a
    // number.
    //
    var scrollerMin = parseInt(config.scrollerSongElementMin, 10);
    if (isNaN(scrollerMin)) {
      scrollerMin = playerScrollerSongElementMin;
    }
    config.scrollerSongElementMin = scrollerMin;

    _registerPlaylistOwner(config.playlistName, config.playerID);

    isDev && logger.debug('\n' + `initialize audio player instance on id: ${config.playerID}`);

    // set song (title) specific audio info links
    // -------------------------------------------------------------------------
    if (playlistAudioInfo) {
      var infoLinks = document.getElementsByClassName('audio-info-link');
      setAudioInfo(infoLinks);
    }

    // set player specific UI events
    // -------------------------------------------------------------------------
    isDev && logger.debug('\n' + `setup audio player specific UI events on ID #${config.playerID}: started`);

    amplitudePlayerState = Amplitude.getPlayerState();

    // code optimization
    // Runtime replacement of the three Liquid guards
    //   {% if player.id contains 'mini'|'compact'|'large' %}
    // The tests stay INDEPENDENT (not else-if) to reproduce the adapter
    // semantics for ids matching more than one keyword.
    //
    if (config.playerID.indexOf('mini')    !== -1) { _wireMiniPlayer(config);    }
    if (config.playerID.indexOf('compact') !== -1) { _wireCompactPlayer(config); }
    if (config.playerID.indexOf('large')   !== -1) { _wireLargePlayer(config);   }

    // code optimization
    // TYPE-based fallback. Runs ONLY when none of the three id tests above
    // matched, so every id that was wired before is wired exactly as before.
    // This is where 'playerDefaultType' (declared but never evaluated since
    // the adapter split) finally takes effect.
    //
    var resolvedPlayerType = _resolvePlayerType(config);
    if (resolvedPlayerType !== null) {
      isDev && logger.debug('\n' +
        `player id carries no type keyword [${config.playerID}] — wiring from type: ${resolvedPlayerType}`);

      if (resolvedPlayerType === 'mini')    { _wireMiniPlayer(config);    }
      if (resolvedPlayerType === 'compact') { _wireCompactPlayer(config); }
      if (resolvedPlayerType === 'large')   { _wireLargePlayer(config);   }
    }

    // START configured player features
    // -------------------------------------------------------------------------
    _applyGlobalPlayerFeatures();

    // finished messages
    // -------------------------------------------------------------------------
    isDev && logger.debug('\n' + `current player state: ${amplitudePlayerState}`);
    isDev && logger.debug('\n' + `setup player specific UI events on ID #${config.playerID}: finished`);

    // plugin manager resolved from the EFFECTIVE chain
    // (defaults <- user <- player)
    // -------------------------------------------------------------------------
    var playerExistsInPage = (document.getElementById(config.xhrContainerId || (config.playerID + '_audio')) !== null);
    if (playerExistsInPage && config.pluginManagerEnabled === true && !ytpPluginInstalled) {
      pluginManager(config.plugins);
    }

    return config;
  } // END initPlayerInstance

  // ===========================================================================
  // SHARED CORE SURFACE
  //
  // code optimization
  // Everything the AmplitudeJS ENGINE owns exactly once per page. The adapter
  // and the per-player instances below both call into this object, so there
  // is exactly ONE implementation of every function.
  // ===========================================================================
  const core = Object.freeze({

    // config
    setAdapterOptions:              setAdapterOptions,
    getInstanceOptions:             getInstanceOptions,
    deepMerge:                      deepMerge,

    // helpers
    amplitudeMediaURL:              amplitudeMediaURL,
    timestamp2seconds:              timestamp2seconds,
    seconds2timestamp:              seconds2timestamp,

    // songs / api
    buildSongs:                     buildSongs,
    initApi:                        initApi,
    getApiState:                    function () { return apiInitialized; },
    isApiInitialized:               function () { return apiInitialized.state === true; },

    // AT runtime
    setSongActive:                  setSongActive,
    // Claude - J1 amplitudePlayer optimization #4
    followActiveSongNative:         _followActiveSongNative,
    followActiveSongYtp:            _followActiveSongYtp,
    setAudioInfo:                   setAudioInfo,
    songEvents:                     songEvents,
    atPlayerScrollToActiveElement:  atPlayerScrollToActiveElement,
    atpUpdatMetaContainers:         atpUpdatMetaContainers,
    atpStopParallelActivePlayers:   atpStopParallelActivePlayers,
    atpProcessAudioStartPosition:   atpProcessAudioStartPosition,
    atpProcessAudioEndPosition:     atpProcessAudioEndPosition,
    atpFadeInAudio:                 atpFadeInAudio,
    atpFadeAudioOut:                atpFadeAudioOut,
    onPlayerStateChange:            onPlayerStateChange,

    // plugins
    isPluginLoaded:                 isPluginLoaded,
    pluginManager:                  pluginManager,
    publishPluginOptions:           publishPluginOptions,
    isYtpPluginInstalled:           isYtpPluginInstalled,

    // per-player UI
    initPlayerInstance:             initPlayerInstance,

    // constants (read-only exports for adapter|plugin use)
    AUDIO_ERROR:                    AUDIO_ERROR,
    AUDIO_ERROR_NAMES:              AUDIO_ERROR_NAMES,
    AT_PLAYER_STATE:                AT_PLAYER_STATE,
    AT_PLAYER_STATE_NAMES:          AT_PLAYER_STATE_NAMES,
    YT_PLAYER_STATE_NAMES:          YT_PLAYER_STATE_NAMES

  }); // END core

  // ---------------------------------------------------------------------------
  // class amplitudePlayer
  //
  // code optimization
  // Instance wrapper for ONE configured player of the page, mirroring the
  // multiPlayer class of the module multiPlayer so both J1 player modules are
  // used identically from adapter code:
  //
  //     const ap = audioPlayer(playerId, cfg);   // create-or-get
  //     ap.init();                               // wire the UI of this player
  //
  // Unlike multiPlayer the instance does NOT own an engine — see the
  // architectural note at the top of the file. It owns its config hash and
  // delegates every engine call to the shared core.
  // ---------------------------------------------------------------------------
  class amplitudePlayer {

    constructor(playerId = '', config = null) {
      const id = String(playerId || '');

      // duplicate protection: the factory normally prevents this; guard the
      // direct-constructor path as well
      //
      if (amplitudePlayer.players[id]) {
        throw new Error(
          `audioPlayer: instance "${id}" already exists — ` +
          'use the audioPlayer(id) factory (create-or-get) instead of new amplitudePlayer()'
        );
      }

      this.id_      = id;
      this.config_  = config || { playerID: id };

      // the shared engine surface is reachable from every instance
      Object.assign(this, core);

      // register AFTER a fully successful build
      amplitudePlayer.players[id] = this;
    }

    id()      { return this.id_; }
    options() { return this.config_; }

    // -------------------------------------------------------------------------
    // init(config)
    // Wires the UI of THIS player. Idempotent: _bindOnce() makes a repeated
    // call a no-op instead of registering the listeners twice.
    // -------------------------------------------------------------------------
    init(config = null) {
      if (config) { this.config_ = config; }
      this.config_.playerID = this.config_.playerID || this.id_;
      return initPlayerInstance(this.config_);
    }

    // -------------------------------------------------------------------------
    // dispose()
    // Removes this instance from the registry so its id can be re-created.
    //
    // NOTE (carried over from the multiPlayer module): DOM listeners are NOT
    // torn down here — a full destroy() lifecycle is out of scope.
    // -------------------------------------------------------------------------
    dispose() {
      delete amplitudePlayer.players[this.id_];
    }

  } // END class amplitudePlayer

  // Static instance registry, keyed by player id.
  amplitudePlayer.players = Object.create(null);

  // ---------------------------------------------------------------------------
  // audioPlayer() — the module factory and the module export
  //
  // Mirrors videoPlayer(id, options) of the multiPlayer module: returns the
  // already registered instance for `playerId` when one exists
  // (create-or-get), otherwise creates, registers and returns a new
  // amplitudePlayer.
  // ---------------------------------------------------------------------------
  function audioPlayer(playerId = '', config = null) {
    const id       = String(playerId || '');
    const existing = amplitudePlayer.players[id];

    if (existing) {
      return existing;
    }
    return new amplitudePlayer(id, config);
  }

  // module surface
  //
  audioPlayer.VERSION         = VERSION;
  audioPlayer.amplitudePlayer = amplitudePlayer;
  audioPlayer.players         = amplitudePlayer.players;
  audioPlayer.core            = core;

  audioPlayer.getPlayer = function (playerId = '') {
    return amplitudePlayer.players[String(playerId || '')] || null;
  };

  audioPlayer.getPlayers = function () {
    return amplitudePlayer.players;
  };

  // code optimization
  // The shared core is ALSO reachable directly on the factory so the adapter
  // can call engine-level functions (buildSongs, initApi, deepMerge, ...)
  // without owning an instance.
  //
  Object.keys(core).forEach(function (key) {
    if (audioPlayer[key] === undefined) {
      audioPlayer[key] = core[key];
    }
  });

  return audioPlayer;

}));
