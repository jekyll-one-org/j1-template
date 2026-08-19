/*
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/modules/multiPlayer/js/player.js
 # Provides JS Core for J1 Module multiPlayer
 # Version 3.1.78 for J1 Template
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

// -----------------------------------------------------------------------------
// ESLint shimming
// -----------------------------------------------------------------------------
/* eslint indent: "off"                                                       */
// -----------------------------------------------------------------------------

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);              // AMD: let the loader call factory
  } else if (typeof exports === 'object') {
    module.exports = factory();       // CommonJS: call factory, export result
  } else {
    root['videoPlayer'] = factory();  // Browser global: call factory, assign result
  }
}(this, function () {
  "use strict";

  // multiPlayer MultiInstance
  // ===========================================================================
  // Multi-instance module architecture
  //
  // The whole former factory body (constants, module variables, the
  // PlaylistManager class, every handler class and every helper function) is
  // now wrapped in createVideoPlayerInstance(instanceID) below. Each call runs
  // the body in a FRESH closure, so ALL previously module-global mutable state
  // (player, _playerID, playlistManager, containerHTML, the *HandlerInit
  // guards, PiP state, ...) is private to one player instance. Nothing had to
  // be rewritten into classes: the closure boundary IS the instance boundary.
  //
  // Only the few things that are genuinely PAGE-global live in this outer
  // (shared) scope:
  //
  //   - the one-shot guards for the two page-level handlers
  //     (inputValueBackgroundHandler / navbarSmoothScrollHandler), which wire
  //     document-level listeners and must run exactly once per page, no
  //     matter how many player instances exist;
  //   - the instance registry (_instances) and the registry API appended at
  //     the end of the file (createInstance / getInstance / ...).
  //
  // Backward compatibility: the module export mirrors the complete legacy
  // surface (videoPlayer.playlistManager, new videoPlayer.playlistIOHandler,
  // videoPlayer.closePlaylist, ...) through lazy getters that delegate to a
  // DEFAULT instance (instanceID ''), created on first access. Existing
  // single-player adapter code therefore keeps working unchanged. Multi-player
  // adapters switch to:
  //
  //     const vp = videoPlayer.createInstance(playerId);
  //     vp.playlistManager.setAdapterOptions(options);
  //     new vp.playlistIOHandler({ ... });
  //     ...
  //
  // NOTE (intentional): the body below keeps its original 2-space indentation
  // instead of being re-indented one level deeper. This keeps the diff against
  // the singleton version reviewable line-by-line; JavaScript is unaffected.
  //
  // Architecture revision — video.js-aligned multi-instance module
  //
  // The #1 (closure-registry) architecture above kept the complete legacy
  // singleton surface alive through lazy getters delegating to an ambient
  // DEFAULT instance (''). An adapter that kept using that legacy surface
  // (videoPlayer.playlistManager…, new videoPlayer.playlistIOHandler…)
  // silently wired EVERY player on the page into that ONE shared default
  // instance: setPlayerID() calls overwrote each other and only the last
  // configured player worked. That is the multi-player failure #2 resolves.
  //
  // #2 restructures the MODULE SURFACE to the same structures/strategy as
  // the videoJS module (video.js):
  //
  //   video.js                          multiPlayer (this module)
  //   --------------------------------  ----------------------------------
  //   videojs(id, options)   (factory)  videoPlayer(id, options)  (factory)
  //   class Player                      class multiPlayer
  //   Player.players         (registry) multiPlayer.players       (registry)
  //   videojs.getPlayer(id)             videoPlayer.getPlayer(id)
  //   videojs.getPlayers()              videoPlayer.getPlayers()
  //   player.id()/player.options()      vp.id() / vp.options()
  //   player.dispose()                  vp.dispose()
  //   videojs.VERSION                   videoPlayer.VERSION
  //
  // The module export is now the CALLABLE create-or-get factory; there is NO
  // ambient default instance any more — exactly as in video.js, every
  // consumer addresses a concrete player id. createVideoPlayerInstance()
  // below is retained unchanged as the per-player member builder, invoked
  // exclusively by the multiPlayer class constructor (the way a video.js
  // Player constructor builds and attaches its child components). See the
  // module API section at the end of the file.
  // ===========================================================================

  // Module version, exposed as videoPlayer.VERSION (video.js parity:
  // videojs.VERSION). Keep in sync with the file header above.
  const VERSION = '3.1.78';

  let _sharedInputValueBackgroundHandlerInit = false;
  let _sharedNavbarSmoothScrollHandlerInit   = false;

  let isMP3 = false;
  let isMP4 = false;

  // Registry of live player instances, keyed by instance id ('' = default /
  // legacy single-player instance).
  const _instances = new Map();

  // ---------------------------------------------------------------------------
  // createVideoPlayerInstance
  //
  // Runs the complete (former singleton) module body in a fresh closure and
  // returns the per-instance API for ONE player. Do not call directly from
  // adapter code — use the registry functions (createInstance / getInstance)
  // at the end of the file so instances are tracked and de-duplicated.
  //
  // @param {string} instanceID - the player id ('' for the legacy default);
  //                              identical to the id the adapter passes to
  //                              playlistManager.setPlayerID() and to the
  //                              _{{player.id}} suffix used by videoPlayer.html
  //
  // multiPlayer MultiInstance
  // Invocation change: this builder is no longer reached through the #1
  // registry functions (createInstance/getInstance — retired below). It is
  // invoked EXCLUSIVELY by the multiPlayer class constructor, which attaches
  // the returned members to the class instance — the same way a video.js
  // Player constructor builds and attaches its child components. The body of
  // this function (all state, PlaylistManager, handler classes, fixes #1–#45)
  // is intentionally UNCHANGED by #2.
  // ---------------------------------------------------------------------------
  function createVideoPlayerInstance(instanceID) {

  // Constants
  // ---------------------------------------------------------------------------

  const MODULE_NAME         = 'multiPlayer.core';
  const CONSOLE_LOG_ID      = Math.random().toString(36).substring(2, 13);
  const PASTE_DELAY         = 10;
  const VIDEO_START_DELAY   = 250;

  // Re-added YOUTUBE_PATTERNS so that YouTube URLs are recognised and
  // routed to the YouTube tech path
  const YOUTUBE_PATTERNS = Object.freeze([
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/
  ]);

  // jadams, 2026-07-27: Added YouTube site ytimg for detection
  const YOUTUBE_RE              = /(?:youtu\.be\/.*|youtube\.com\/.*|ytimg\.com\/.*)/;
  const YOUTUBE_ID_RE           = /(?:youtu\.be\/.*|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/))([A-Za-z0-9_-]{11})/;
  const YOUTUBE_POSTER_QUALITY  = 'hqdefault';

  // VIDEO_URL_PATTERNS matches local paths (/assets/...) and remote URLs
  // for MP4, WebM, OGV, OGG, M4V and MOV video files.  A bare filename
  // (no directory) with a recognised extension is also accepted.
  const VIDEO_URL_PATTERNS = Object.freeze([
    // remote URL with a video file extension
    /^https?:\/\/.+\.(?:mp4|webm|og[gv]|m4v|mov)(?:[?#].*)?$/i,
    // absolute local path (starts with /) with a video file extension
    /^\/[^?#]+\.(?:mp4|webm|og[gv]|m4v|mov)(?:[?#].*)?$/i,
    // bare filename (no slash) with a video file extension – relative paths
    /^[^/][^?#]*\.(?:mp4|webm|og[gv]|m4v|mov)(?:[?#].*)?$/i
  ]);

  // Default poster image used when a playlist entry has no poster URL.
  const DEFAULT_POSTER = '/assets/image/icon/videojs/videojs-poster.png';

  // multiPlayer optimizations #2 (e)
  // Performance: this timezone map was an object literal allocated INSIDE
  // _normalizeIssueDate() on every single call. _normalizeIssueDate() runs
  // once per entry with an issueDate on every load(), and load() itself runs
  // several times per render pass — so the literal was rebuilt hundreds of
  // times per page interaction for identical, immutable data. Hoisted here
  // as a frozen module-level constant (same pattern as YOUTUBE_PATTERNS /
  // NATIVE_POSTER_DEFAULTS). Content is byte-identical to the original.
  const ISSUE_DATE_TZ_MAP = Object.freeze({
    'ET': '-0500', 'EST': '-0500', 'EDT': '-0400',
    'CT': '-0600', 'CST': '-0600', 'CDT': '-0500',
    'MT': '-0700', 'MST': '-0700', 'MDT': '-0600',
    'PT': '-0800', 'PST': '-0800', 'PDT': '-0700',
    'UTC': '+0000', 'GMT': '+0000',
    'BST': '+0100', 'CET': '+0100', 'CEST': '+0200',
    'IST': '+0530', 'JST': '+0900', 'AEST': '+1000'
  });

  // ---------------------------------------------------------------------------
  // Expiry date (time-limited media sources)
  //
  // Some media locations grant access only for a limited period. The playlist
  // record therefore carries an OPTIONAL `expiryDate` field alongside the
  // existing `issueDate`. Semantics:
  //
  //   expiryDate === ''   ->  UNLIMITED (the default for every entry, old and
  //                           new; legacy records without the key are
  //                           back-filled with '' by _normalizeEntry()).
  //   expiryDate === ISO  ->  'YYYY-MM-DD', the SAME normalised shape
  //                           _normalizeIssueDate() already produces, so the
  //                           existing normaliser is reused verbatim.
  //
  // Derived state (see _expiryState below), driven by the number of whole days
  // between "today" and the stored expiry day, both taken at LOCAL midnight so
  // the result never flips because of a time-of-day or timezone offset:
  //
  //   daysLeft  >  EXPIRY_WARN_DAYS      -> 'ok'         (no colouring)
  //   daysLeft <=  EXPIRY_WARN_DAYS      -> 'warning'    (yellow background)
  //   daysLeft <=  EXPIRY_CRITICAL_DAYS  -> 'critical'   (red background)
  //   daysLeft <=  0                     -> 'expired'    (red background,
  //                                                       playback blocked)
  //
  // DESIGN DECISION (flagged for review): the expiry date is treated as the
  // moment access ENDS, i.e. an entry whose expiryDate is TODAY is already
  // 'expired' ("... and if the date is reached"). To make the expiry day the
  // last VALID day instead, change EXPIRY_EXPIRED_AT_DAYS_LEFT to -1; nothing
  // else has to be touched.
  // ---------------------------------------------------------------------------
  //
  const EXPIRY_UNLIMITED              = '';
  const EXPIRY_WARN_DAYS              = 28;   // 4 weeks -> yellow
  const EXPIRY_CRITICAL_DAYS          = 14;   // 2 weeks -> red
  const EXPIRY_EXPIRED_AT_DAYS_LEFT   = 0;    // <= this value -> expired
  const EXPIRY_MS_PER_DAY             = 86400000;

  const EXPIRY_STATE = Object.freeze({
    UNLIMITED: 'unlimited',
    OK:        'ok',
    WARNING:   'warning',
    CRITICAL:  'critical',
    EXPIRED:   'expired'
  });

  // Returns the whole number of days left until `expiryDate`, or null when the
  // value is empty (unlimited) or cannot be parsed. Both operands are reduced
  // to LOCAL midnight before the difference is taken, so the value is a stable
  // calendar-day distance rather than an elapsed-hours quotient. Negative
  // values mean the date already lies in the past.
  //
  // @param  {string}      expiryDate  'YYYY-MM-DD' (or any Date-parsable text)
  // @return {number|null}             days left, or null for unlimited/invalid
  //
  function _expiryDaysLeft(expiryDate) {
    if (!expiryDate || typeof expiryDate !== 'string') return null;

    const trimmed = expiryDate.trim();
    if (!trimmed) return null;

    let target;
    const iso = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (iso) {
      // Build from the parts so 'YYYY-MM-DD' is read as a LOCAL date. new
      // Date('2026-01-01') would be parsed as UTC midnight and could land on
      // the previous local day for negative UTC offsets.
      target = new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
    } else {
      const parsed = new Date(trimmed);
      if (isNaN(parsed.getTime())) return null;
      target = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
    }

    if (isNaN(target.getTime())) return null;

    const now   = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return Math.round((target.getTime() - today.getTime()) / EXPIRY_MS_PER_DAY);
  }

  // Maps an expiry date onto one of the EXPIRY_STATE values. An empty/invalid
  // value yields 'unlimited' - the safe default that keeps every legacy entry
  // playable and uncoloured.
  //
  // @param  {string} expiryDate
  // @return {string}            one of EXPIRY_STATE.*
  //
  function _expiryState(expiryDate) {
    const daysLeft = _expiryDaysLeft(expiryDate);

    if (daysLeft === null)                            return EXPIRY_STATE.UNLIMITED;
    if (daysLeft <= EXPIRY_EXPIRED_AT_DAYS_LEFT)      return EXPIRY_STATE.EXPIRED;
    if (daysLeft <= EXPIRY_CRITICAL_DAYS)             return EXPIRY_STATE.CRITICAL;
    if (daysLeft <= EXPIRY_WARN_DAYS)                 return EXPIRY_STATE.WARNING;

    return EXPIRY_STATE.OK;
  }


  // True when the given playlist entry carries an expiry date that has been
  // reached. Defensive by design: anything that is not a clearly expired,
  // parsable date returns false, so a malformed record can never lock a video
  // out of playback.
  //
  // @param  {Object}  entry  playlist record
  // @return {boolean}
  //
  function _isEntryExpired(entry) {
    if (!entry || typeof entry !== 'object') return false;
    return _expiryState(entry.expiryDate || EXPIRY_UNLIMITED) === EXPIRY_STATE.EXPIRED;
  }


  // Short human-readable summary of the expiry state, used for the hint line
  // under the modal input and for the log warning raised on blocked playback.
  //
  // @param  {string} expiryDate
  // @return {string}
  //
  function _expiryHintText(expiryDate) {
    const state    = _expiryState(expiryDate);
    const daysLeft = _expiryDaysLeft(expiryDate);

    if (state === EXPIRY_STATE.UNLIMITED) return 'Access unlimited (no expiry date set)';
    if (state === EXPIRY_STATE.EXPIRED) {
      return (daysLeft === 0)
        ? 'Access period EXPIRED today - playback disabled'
        : `Access period EXPIRED ${Math.abs(daysLeft)} day(s) ago:`;
    }
    return `Access period ends in ${daysLeft} day(s)`;
  }

    // ---------------------------------------------------------------------------
  // Native-video poster auto-generation
  //
  // For native videos (MP4, WebM, OGV/OGG, M4V, MOV) the playlist would
  // otherwise only ever show DEFAULT_POSTER, because — unlike YouTube, which
  // exposes a thumbnail CDN — a local/remote video file carries no ready-made
  // poster image. The helpers below grab a single still frame from the file
  // off-screen (a detached <video> element decodes the frame, a <canvas>
  // captures it) and return it as a Base64 data-URL that is stored in the
  // playlist record (localStorage) and used as the list/card thumbnail.
  //
  // NATIVE_POSTER_DEFAULTS provides the fall-back configuration; any subset of
  // these keys may be overridden through videoPlayer.yml ->
  // videoPlayerOptions.videoJS.poster (see _resolveNativePosterConfig()).
  //
  //   enabled          master on/off switch
  //   capturePosition  capture point in SECONDS (configurable start position).
  //                    When <= 0 the captureFraction is used instead.
  //   captureFraction  fraction (0..100) percent of the duration used as
  //                    the capture point when capturePosition <= 0
  //   maxWidth         output is downscaled to at most this width in px
  //                    (aspect preserved); 0 keeps the native frame size.
  //   mimeType         output image type ('jpeg'|'png' |'webp')
  //   quality          0..1 encoder quality (jpeg/webp only)
  //   generate_timeout hard timeout so a bad/slow file can never hang capture
  //
  // ---------------------------------------------------------------------------
  const NATIVE_POSTER_DEFAULTS = Object.freeze({
    enabled:            true,
    capturePosition:    5.0,
    captureFraction:    10,
    maxWidth:           320,
    mimeType:           'webp',
    quality:            0.60,
    generate_timeout:   8000
  });


  // Resolves the effective native-poster config by overlaying any values found
  // under videoPlayerOptions.videoJS.poster onto NATIVE_POSTER_DEFAULTS. Reads
  // defensively (module-level videoPlayerOptions first, then the adapter
  // namespace) so it is safe to call before the adapter has assigned options.
  //
  function _resolveNativePosterConfig() {

    // Resolve through the central per-instance resolver so a per-player
    // videoJS.poster configuration (factory options) takes precedence over the
    // page-global adapter options. Resolution order and defensiveness are
    // unchanged in the single-player case (global -> module snapshot).
    let opts = _resolveVideoPlayerEffectiveOptions();

    const cfg = (opts && opts.videoJS.poster.autoGenerate)
      ? opts.videoJS.poster.autoGenerate
      : {};

    const settings = Object.assign({}, NATIVE_POSTER_DEFAULTS, cfg);
    return settings;
  }


  // True when the URL/path points at a native (browser-decodable) video file
  // rather than a YouTube watch URL/id.  Reuses VIDEO_URL_PATTERNS so exactly
  // the same extensions accepted elsewhere in the module are accepted here.
  function _isNativeVideoSource(src) {
    if (!src || typeof src !== 'string') return false;
    return VIDEO_URL_PATTERNS.some((re) => re.test(src));
  }

  // ---------------------------------------------------------------------------
  // generateNativePoster
  //
  // Extracts a single still frame from a native video file and returns it as a
  // Base64 data-URL, suitable for storing in the playlist record (localStorage)
  // and for use directly as an <img> src in the list/card views.
  //
  // Mechanism (the element never needs to be inserted into the DOM):
  //   1. create a detached <video> (muted, preload=metadata, crossOrigin)
  //   2. on 'loadedmetadata' the duration / intrinsic size are known
  //   3. seek to the configured capture position; absolute seconds when
  //      capturePosition > 0, otherwise (captureFraction/100) * duration:
  //      clamped so the seek target always lies inside the media
  //   4. on 'seeked' draw the current frame into a <canvas> sized to the video
  //      (optionally downscaled to maxWidth, aspect preserved)
  //   5. resolve with canvas.toDataURL(mimeType, quality)
  //
  // The promise NEVER rejects: on any failure (unsupported file, decode error,
  // tainted cross-origin canvas without CORS headers, or timeout) it resolves
  // to '' so callers can simply fall back to DEFAULT_POSTER.  A hard timeout
  // guarantees the returned promise always settles and the <video> is released.
  //
  // @param  {string} src            native video URL/path
  // @param  {Object} [opts]         per-call overrides for the resolved config
  // @return {Promise<string>}       Base64 data-URL, or '' on failure
  // ---------------------------------------------------------------------------
  function generateNativePoster(src, opts) {
    return new Promise((resolve) => {
      if (!_isNativeVideoSource(src)) { resolve(''); return; }

      const cfg = Object.assign(_resolveNativePosterConfig(), opts || {});

      let settled = false;
      let video   = document.createElement('video');

      const cleanup = () => {
        if (!video) return;
        try {
          video.removeAttribute('src');
          video.load();                 // abort any in-flight network fetch
        } catch (_e) { /* ignore */ }
        video = null;
      };

      const finish = (dataUrl) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        cleanup();
        resolve(dataUrl || '');
      };

      const timer = setTimeout(() => {
        isDev && logger.debug('\n' + `generateNativePoster: timed out after ${cfg.generate_timeout}ms for src: ${src}`);
        finish('');
      }, cfg.generate_timeout);

      const drawFrame = () => {
        try {
          const vw = video.videoWidth  || 0;
          const vh = video.videoHeight || 0;
          if (!vw || !vh) { finish(''); return; }

          let cw = vw, ch = vh;
          if (cfg.maxWidth > 0 && vw > cfg.maxWidth) {
            cw = cfg.maxWidth;
            ch = Math.round(vh * (cfg.maxWidth / vw));
          }

          const canvas  = document.createElement('canvas');
          canvas.width  = cw;
          canvas.height = ch;

          const ctx = canvas.getContext('2d');
          if (!ctx) { finish(''); return; }
          ctx.drawImage(video, 0, 0, cw, ch);

          // toDataURL() throws a SecurityError on a tainted (cross-origin)
          // canvas — caught below and reported as '' (fall back to default).
          const dataUrl = canvas.toDataURL(`image/${cfg.mimeType}`, cfg.quality);
          finish(dataUrl);
        } catch (e) {
          isDev && logger.warn('\n' + `generateNativePoster: frame capture failed for src: ${src} - ${e}`);
          finish('');
        }
      };

      video.addEventListener('error', () => {
        isDev && logger.warn('\n' + `generateNativePoster: media error for src: ${src}`);
        finish('');
      }, { once: true });

      video.addEventListener('loadedmetadata', () => {
        const duration = isFinite(video.duration) ? video.duration : 0;

        // Resolve the seek target (configurable start position).
        let target = (cfg.capturePosition > 0)
          ? cfg.capturePosition
          : (duration > 0 ? duration * (cfg.captureFraction/100) : 0);

        // Clamp into (0, duration) so the seek lands on a decodable frame.
        if (duration > 0) {
          const maxSeek = Math.max(0, duration - 0.1);
          if (target > maxSeek) target = maxSeek;
        }

        if (!(target > 0)) {
          // No seek needed — draw the first decoded frame. Some browsers fire
          // 'seeked' for currentTime=0, some do not, so key off 'loadeddata'.
          video.addEventListener('loadeddata', drawFrame, { once: true });
          if (video.readyState >= 2) drawFrame();
          return;
        }

        // 'seeked' fires once the target frame is decoded and available.
        video.addEventListener('seeked', drawFrame, { once: true });
        try {
          video.currentTime = target;
        } catch (_e) {
          // Some browsers refuse currentTime before data is buffered; fall
          // back to drawing the first available frame.
          video.addEventListener('loadeddata', drawFrame, { once: true });
        }
      }, { once: true });

      // crossOrigin must be set BEFORE src so the CORS request is issued. A
      // same-origin file is unaffected; a cross-origin file with proper CORS
      // headers yields an untainted canvas; otherwise toDataURL() throws and
      // the capture resolves to '' (handled in drawFrame).
      video.crossOrigin = 'anonymous';
      video.muted       = true;
      video.playsInline = true;
      video.preload     = 'metadata';

      try {
        video.src = src;
        video.load();
      } catch (_e) {
        finish('');
      }
    });
  }

  // ---------------------------------------------------------------------------
  // _buildPlaylistItemSources
  //
  // Derives the videojs-playlist `sources` array ([{ src, type }]) for a single
  // J1 playlistManager entry.  This mirrors the source/type resolution already
  // performed in createVideoJsPlayer():
  //
  //   - YouTube entries  -> { type: 'video/youtube', src: '//youtu.be/<id>' }
  //   - native entries   -> { type: <ext-derived MIME>, src: <file url> }
  //
  // The YouTube id is taken from entry.videoLink (matched against
  // YOUTUBE_PATTERNS) and only falls back to a bare 11-char entry.videoId when
  // there is no native entry.src (native videoIds are filenames-without-ext and
  // could otherwise be mistaken for a YouTube id).  entry.infoLink is NOT used
  // here because for YouTube records it points at the *playlist* URL, not the
  // playable video.
  //
  // Returns an empty array when no playable source can be derived; the caller
  // (convertVideoPlayerPlaylist) drops such entries so player.src() never
  // receives an empty/invalid source list.
  // ---------------------------------------------------------------------------
  function _buildPlaylistItemSources(entry) {
    if (!entry || typeof entry !== 'object') return [];

    // 1) YouTube: prefer an explicit videoLink, then a bare 11-char videoId.
    let ytId = null;

    if (entry.videoLink) {
      for (const pattern of YOUTUBE_PATTERNS) {
        const m = String(entry.videoLink).match(pattern);
        if (m) { ytId = m[1]; break; }
      }
    }

    if (!ytId && !entry.src && entry.videoId && /^[A-Za-z0-9_-]{11}$/.test(entry.videoId)) {
      ytId = entry.videoId;
    }

    if (ytId) {
      // Keep protocol-relative form consistent with createVideoJsPlayer().
      return [{ type: 'video/youtube', src: `//youtu.be/${ytId}` }];
    }

    // 2) Native: use entry.src (preferred) or entry.videoLink as the file URL
    //    and auto-detect the MIME type from the extension (same map used by
    //    createVideoJsPlayer()).
    const nativeSrc = entry.src || entry.videoLink || '';
    if (!nativeSrc) return [];

    const extMap = {
      mp4:  'video/mp4',
      webm: 'video/webm',
      ogv:  'video/ogg',
      ogg:  'video/ogg',
      m4v:  'video/mp4',
      mov:  'video/mp4'
    };

    const ext  = nativeSrc.split('?')[0].split('.').pop().toLowerCase();
    const type = extMap[ext] || 'video/mp4';

    return [{ type: type, src: nativeSrc }];
  }

  // ---------------------------------------------------------------------------
  // mapVideoPlayerPlaylist
  //
  // Declarative mapping rules that translate a single J1 playlistManager record
  // (the localStorage entry shape produced by playlistManager.load() /
  // PlaylistManager._normalizeEntry — see Hofgeschichten.json for an example)
  // into one playlist item as expected by the videojs-playlist plugin (core.js)
  // and rendered by videojs-playlist-ui.
  //
  // Target item shape:
  //   {
  //     sources:     [{ src, type }],   // REQUIRED by core.js playItem()/player.src()
  //     poster:      <string>,          // menu thumbnail (playlist-ui)
  //     name:        <string>,          // menu title       (playlist-ui)
  //     description: <string>,          // menu description (playlist-ui)
  //     duration:    <number seconds>,  // menu duration    (playlist-ui)
  //     ...J1 metadata carried through (videoId, videoLink, infoLink, rating,
  //        lastPosition, …) so downstream resume/rating/link handling keeps
  //        working off the playlist item.
  //   }
  //
  // Each rule value is either:
  //   - a string   -> copy that source field verbatim   (entry[srcKey])
  //   - a function -> (entry) => computed/derived value
  // A rule that yields `undefined` is omitted from the produced item.
  // ---------------------------------------------------------------------------
  //
  const mapVideoPlayerPlaylist = Object.freeze({
    // --- videojs-playlist core (REQUIRED) ------------------------------------
    sources:      (entry) => _buildPlaylistItemSources(entry),

    // --- videojs-playlist-ui menu fields -------------------------------------
    name:         (entry) => entry.title || entry.videoId || 'Untitled',
    description:  (entry) => entry.description || '',
    poster:       (entry) => entry.poster || DEFAULT_POSTER,
    duration:     (entry) => (typeof entry.duration === 'number' ? entry.duration : 0),

    // --- J1 metadata carried through (verbatim copies) -----------------------
    videoId:      'videoId',
    videoLink:    'videoLink',
    infoLink:     'infoLink',
    author:       'author',
    category:     'category',
    issueDate:    'issueDate',
    expiryDate:   'expiryDate',
    episode:      'episode',
    series:       'series',
    tags:         'tags',
    rating:       'rating',
    lastPosition: 'lastPosition',
    watchDate:    'watchDate',
    type:         'type'
  });

  const MESSAGES = Object.freeze({
    NO_CLIPBOARD_API:   'Clipboard API not available. Please use Ctrl+V.',
    CLIPBOARD_DENIED:   'Clipboard access failed. Please paste URL manually.',
    INVALID_URL:        'Invalid URL. Accepted: YouTube URL/ID or local video path (MP4, WebM, OGV).',
    NO_URL:             'No URL entered.',
    VIDEO_EXISTS:       'Video|Player already exists.',
    LOADING_VIDEO:      'Loading video.'
  });

  // vjsStateEventMap / vjsStateEventNameMap retain the same numeric codes
  // because video.js native HTML5 tech fires the same event names as the
  // YouTube tech did (loadstart, ended, playing, pause, waiting).
  const vjsStateEventMap = {
    'loadstart':        -1,
    'ended':             0,
    'playing':           1,
    'pause':             2,
    'waiting':           3
  };

  const vjsStateEventNameMap = {
    '-1': 'loadstart',
     '0': 'ended',
     '1': 'playing',
     '2': 'paused',
     '3': 'waiting'
  };

  // Pre-defined tags data array
  // ---------------------------------------------------------------------------
  const TAGS_BY_GENRE = Object.freeze({
    'Beauty':             ['beauty', 'makeup', 'skincare', 'hairstyle', 'fashion'],
    'Comedy':             ['comedy', 'standup', 'memes'],
    'Education':          ['education', 'learn', 'tutorial','study'],
    'Entertainment':      [
                           'entertainment', 'infotainment', 'edutainment',
                           'cinema', 'crime', 'true-crime', 'dance', 'show',
                           'musical', 'tv', 'mixed',  'podcast', 'magician',
                           "novel", "horror", "ventriloquist", 'celebrity',
                           'series', 'competition', 'audioclip', 'videoclip'
                          ],
    'Music':              [
                           'music',  'concert', 'festival', 'cover', 'pop',
                           'k-pop', 'classsic', 'rock', 'folk', 'traditional',
                           'latin', 'jazz', 'rap', 'singer', 'songwriter',
                           'original', 'emotional', 'romantic', '60th', '70th',
                           '80th', '90th', 'remix', 'live'
                          ],
    'Gaming':             ['game', 'gamer'],
    'Howto':              ['howto', 'diy', 'tech', 'mounting', 'cooking', 'food'],
    'Product':            ['product', 'reviews', 'tech', 'unboxing', 'ai', 'programming', 'gadgets'],
    'News':               ['news', 'commentary', 'viral', 'trending' ],
    'Fitness':            ['fitness', 'health', 'sport', 'workout', 'gym', 'health', 'motivation'],
    'Business':           ['business', 'finance', 'tech', 'ai', 'programming', 'gadgets']
  });

  const GENRE_OPTIONS_HTML        = _buildGenreOptionHTML();
  const PLAYLIST_URL_BASE         = '/assets/data/apps/multiPlayer/playlists';
  const PLAYLIST_INDEX            = `${PLAYLIST_URL_BASE}/index.json`;

  // Module variables
  // ---------------------------------------------------------------------------

  let isDev                       = false;

  let player                      = null;
  let lastState                   = null;
  let playerMode                  = null;
  let previousPlayerId            = null;
  let videoPlayerOptions          = null;
  let adapterOptions              = null;

    // ---------------------------------------------------------------------------
  // _resolveVideoPlayerEffectiveOptions()
  //
  // Central resolver for the EFFECTIVE per-player configuration. Before #49,
  // every runtime consumer of videoJS settings (embedRunVideo/onReady,
  // _resyncPluginPlaylist, createVideoJsPlayer, the loadstart autoplay branch,
  // _resolveNativePosterConfig, the autoLoadFirstEntryOnReload readiness gate)
  // read the GLOBAL adapter options object
  // (j1.adapter.videoPlayer.videoPlayerOptions) directly. On a multi-player
  // page that global holds ONE merged option set, so per-player overrides
  // handed to the factory — videoPlayer(id, options), which stores them into
  // this instance's adapterOptions via playlistManager.setAdapterOptions() —
  // were silently ignored: per-player videoJS settings (autoStart,
  // playbackRates.enabled, plugins.playlist.enabled, ...) never took effect.
  //
  // Resolution order (first match wins):
  //
  //   1. adapterOptions      — the per-instance options handed to the factory
  //                            (videoPlayer(id, options)) or set explicitly via
  //                            playlistManager.setAdapterOptions(). Accepted
  //                            only when it carries a videoJS subtree, i.e. the
  //                            adapter passed a FULLY merged option set
  //                            (defaults <- global settings <- per-player
  //                            control). A sparse object (e.g. env-only) falls
  //                            through so unguarded deep reads such as
  //                            opts.videoJS.playbackRates.values cannot throw.
  //
  //   2. j1.adapter.videoPlayer.videoPlayerOptions
  //                          — the page-global merged options; single-player /
  //                            legacy fallback (pre-#49 behaviour).
  //
  //   3. videoPlayerOptions  — the last module-level snapshot, if any.
  //
  // CONTRACT (adapter side, "inheritance chain"): the object the adapter hands
  // to videoPlayer(id, options) at the site MUST be
  // the complete three-layer deep merge INCLUDING the per-player videoJS
  // subtree from videoPlayer_control.yml — not only ui_elements/playlist keys.
  // The module deliberately does NOT re-merge here; merging YAML layers is the
  // adapter's responsibility.
  // ---------------------------------------------------------------------------
  function _resolveVideoPlayerEffectiveOptions() {
    // 1. per-instance options (factory / setAdapterOptions) — preferred
    if (adapterOptions && typeof adapterOptions === 'object' && adapterOptions.videoJS) {
      return adapterOptions;
    }

    // 2. page-global adapter options — legacy / single-player fallback
    if (typeof j1 !== 'undefined' && j1 && j1.adapter && j1.adapter.videoPlayer
        && j1.adapter.videoPlayer.videoPlayerOptions) {
      return j1.adapter.videoPlayer.videoPlayerOptions;
    }

    // 3. last-known module-level snapshot
    return (typeof videoPlayerOptions === 'object' && videoPlayerOptions)
      ? videoPlayerOptions
      : null;
  }

  // Fix multiPlayer load failed #1
  // ---------------------------------------------------------------------------
  // _adapterCloseEditPlaylist(button, playerID)
  //
  // ROOT CAUSE of the "playlist load failed" errors: the module was renamed
  // videoPlayer -> multiPlayer, and the adapter now registers itself as
  // j1.adapter.multiPlayer (adapter/js/multiPlayer.js). The four playlist-load
  // call sites in this file (playlistIOHandler: processUrl [YouTube + native
  // branch], handleFileSelected, handleLoadFromServer) still addressed the
  // OLD namespace j1.adapter.videoPlayer. On a multiPlayer page that object
  // is undefined, so every playlist load crashed with
  //
  //     TypeError: Cannot read properties of undefined
  //                (reading 'closeEditPlaylist')
  //
  // The crash fired AFTER the playlist was already parsed and stored (which
  // is why the list showed up fine after a page reload) but BEFORE the
  // remaining steps of the load path ran — _updateTogglePlaylistButton(),
  // renderCurrent(), the poster backfill (#33) and the first-entry autoload
  // (#26/#27) were silently skipped for the current page view.
  //
  // This helper resolves the adapter namespace defensively — NEW name first,
  // LEGACY name as fallback, the same order/idea as fallback step 2 in
  // _resolveVideoPlayerEffectiveOptions() — and no-ops with a dev warning
  // when no adapter is present at all (standalone / jsdom test runs), so the
  // load path can never crash on a missing namespace again.
  //
  // NOTE (jadams, OUT OF SCOPE for this fix, flagged only): the call sites
  // derive playerID via  _pid('edit_playlist').replace('edit_playlist_', '').
  // On the DEFAULT (single-player) instance (_playerID === '') _pid() returns
  // the bare name, the replace() finds no match, and playerID resolves to the
  // literal string 'edit_playlist'; the adapter then looks up the element
  // 'playlist_edit_screen_edit_playlist', finds null and returns early.
  // Candidate follow-up fix: pass the closure variable _playerID directly.
  // ---------------------------------------------------------------------------
  function _adapterCloseEditPlaylist(button, playerID) {
    var adapter = (typeof j1 !== 'undefined' && j1 && j1.adapter)
      ? (j1.adapter.multiPlayer || j1.adapter.videoPlayer)
      : null;

    if (adapter && typeof adapter.closeEditPlaylist === 'function') {
      adapter.closeEditPlaylist(button, playerID);
    } else {
      isDev && logger.warn('\n' + '_adapterCloseEditPlaylist: no adapter namespace found (j1.adapter.multiPlayer / j1.adapter.videoPlayer) - edit screen close skipped');
    }
  } // END _adapterCloseEditPlaylist

  let pipWindow                   = null;
  let pipEnabled                  = false;
  let pipVisibilityBound          = false;

  let loopConfigEnabled           = false;
  let pipConfigEnabled            = false;
  let _playlistActiveVideoId      = null;

    // Guards the brief window during which the videojs-playlist plugin performs
  // its initial source selection inside onReady(): playlist(list) auto-loads
  // item 0 (player.src()), then currentItem(syncedIndex) re-loads the selected
  // item (a second player.src()). These two/three source swaps happen
  // back-to-back. The loadstart-driven autoplay (nextPrevButtons.autoplay) must
  // NOT call play() against these transient sources — the immediately-following
  // currentItem() src() aborts that pending play(), which the browser surfaces
  // as "The play() request was interrupted by a new load request". The flag is
  // set before playlist()/currentItem() and cleared once the SELECTED source
  // has settled (loadedmetadata), after which the deferred autoplay branch in
  // onReady() performs a single, race-free play(). Hoisted here with the other
  // module-level flags so it is initialised before any factory code runs (TDZ).
  //
  let _playlistSetupInProgress    = false;

  // Instance-scoped logger name so multi-player log output is attributable
  // per player (e.g. 'multiPlayer.core.player_1'). The bare MODULE_NAME is
  // kept for the default ('') instance so existing single-player log output
  // is byte-identical to the singleton version.
  //
  let logger                      = log4javascript.getLogger(instanceID ? `${MODULE_NAME}.${instanceID}` : MODULE_NAME);

  // container data will be initialized in playlistIOHandler
  //
  let container                   = null;
  let containerHTML               = null;

  // Declaring here — with all other module-level flags — ensures it
  // is initialised before any code in this factory function executes.
  //
  let _startedFromPlaylist        = false;
  let _editPlaylistHandlerInit    = false;
  let _togglePlaylistHandlerInit  = false;

  // Guards the page-load "auto-load first playlist entry in paused state"
  // behaviour (autoLoadFirstEntryOnReload()) so it fires at most once per
  // page load even if the triggering handler init runs more than once or
  // several callers invoke it. Hoisted here with the other module-level
  // flags so it is initialised before any factory code runs.
  //
  let _autoLoadFirstOnReloadDone  = false;

    // Per-player keying of the auto-load-on-reload once-only guard.
  //
  // The #41 flag above (_autoLoadFirstOnReloadDone) is a SINGLETON: a single
  // module-level boolean shared by every player on the page. On a multi-player
  // page the first player to run autoLoadFirstEntryOnReload() set it true,
  // after which every sibling player short-circuited at the guard and never
  // restored ITS OWN stored first entry — so only one player auto-loaded.
  //
  // We replace that single boolean with a registry keyed by the owning player
  // id (_playerID — the same scope _pid() and this.load()/this.STORAGE_KEY use,
  // set per instance by setPlayerID()). Each distinct player id (including the
  // empty-string '' single-player / test fallback) gets its own "done" slot, so
  // every player auto-loads its own first entry exactly once, independently of
  // the others. Object.create(null) avoids prototype-key collisions for ids
  // like 'toString'. Declared here with the other module-level flags so it is
  // initialised before any factory code runs (TDZ pitfall — see #32).
  //
  // The original boolean is left in place (deprecated, unreferenced) rather
  // than deleted, in line with the additive convention; nothing reads or writes
  // it after the autoLoadFirstEntryOnReload() reads/writes are rerouted below.
  //
  const _autoLoadFirstOnReloadDoneByPid = Object.create(null);

  // Player-scoped element ID support.
  // The HTML data file (videoPlayer.html) suffixes every per-player element
  // id with _{{player.id}} so that multiple players can coexist on the
  // same page without duplicate-id conflicts.
  // _playerID stores the current player id set by the adapter
  // (via playlistManager.setPlayerID), and _pid() converts a bare element
  // name to its scoped form for all getElementById / querySelector calls.
  //
  // _playerID is now a PER-INSTANCE closure variable (one per
  // createVideoPlayerInstance() call), seeded from the instanceID argument so
  // that _pid() resolves the suffixed element ids correctly from the very
  // first statement of the instance — even before the adapter (re-)asserts it
  // via playlistManager.setPlayerID(). A sibling player can no longer
  // overwrite it: each instance owns its own copy.
  //
  let _playerID = instanceID || '';

  /**
   * _pid(bare) – returns the player-scoped element id.
   * When _playerID is set the result is `${bare}_${_playerID}`;
   * when it is empty the bare name is returned unchanged (fallback / tests).
   * @param {string} bare - the unsuffixed element id
   * @returns {string}
   */
  function _pid(bare) {
    return _playerID ? `${bare}_${_playerID}` : bare;
  }

  // ---------------------------------------------------------------------------
  // Playlist CARD-MODE grid columns (playlist.cards.perRow)
  //
  // The playlist toggles between LIST and CARD mode through the per-player
  // control #playlistModeSwitch_<id> (playlistModeSwitchHandler), which flips
  // the class on the top-level container #videoplayer_playlist_parent_<id> and
  // re-renders through renderCurrent(). In card mode videoPlayer.css laid the
  // container out as a CSS grid with a HARD-WIRED column count:
  //
  //     .playlist.card-mode {
  //       display: grid;
  //       grid-template-columns: repeat(2, 1fr);
  //     }
  //
  // The configuration key that is supposed to drive that count
  //
  //     playlist:
  //       cards:
  //         perRow:  4
  //
  // (defaults in videoPlayer.yml, per-player override in videoPlayer_control.yml)
  // was never read anywhere in this module, so it had no effect: every player
  // always rendered exactly 2 cards per row.
  //
  // #51 resolves the effective value through _resolveVideoPlayerEffectiveOptions()
  // — so a per-player override wins over the page-global merged defaults, in
  // line with the resolution contract established by #49 — and writes it onto
  // THIS player's own container as two element-attached (inline) declarations:
  //
  //   1. the custom property  --playlist-cards-per-row: N
  //      consumed by the updated rule
  //        grid-template-columns: repeat(var(--playlist-cards-per-row, 2), 1fr)
  //
  //   2. the resolved longhand  grid-template-columns: repeat(N, 1fr)
  //      written as well so that a page still served a CACHED, pre-#51
  //      videoPlayer.css (no var() in the rule) also gets the correct column
  //      count. Where the updated stylesheet is loaded, (1) and (2) agree.
  //
  // Cascade note: an inline declaration outranks a normal author rule, but NOT
  // an author `!important` declaration. The existing responsive overrides
  //
  //     .playlist.list-mode { grid-template-columns: none !important; }
  //     @media (max-width: 991.98px) {
  //       .playlist.card-mode { grid-template-columns: repeat(1, 1fr) !important; }
  //     }
  //
  // therefore keep winning: list mode and small screens are unaffected by
  // perRow, exactly as before. _clearCardsPerRow() additionally strips both
  // declarations when switching back to list mode so the container carries no
  // stale grid geometry.
  //
  // Scoping: every write goes through the element handed in by the caller,
  // which is always resolved via _pid('videoplayer_playlist_parent'). On a
  // multi-player page each instance therefore styles only its own grid.
  // ---------------------------------------------------------------------------
  //
  const CARDS_PER_ROW_CSS_VAR   = '--playlist-cards-per-row';
  const CARDS_PER_ROW_DEFAULT   = 2;
  const CARDS_PER_ROW_MIN       = 1;
  const CARDS_PER_ROW_MAX       = 6;

  /**
   * _resolveCardsPerRow - effective number of playlist cards per row.
   *
   * Reads playlist.cards.perRow from the EFFECTIVE options of this instance
   * (per-player factory options -> page-global adapter options -> module
   * snapshot). Every level is read defensively: renderCurrent() may run before
   * the adapter has assigned any options, and older option sets carry no
   * playlist.cards subtree at all. Non-numeric, missing or out-of-range values
   * fall back to CARDS_PER_ROW_DEFAULT (2) — the value the stylesheet hard-wired
   * before #51, so behaviour is unchanged whenever the key is absent.
   *
   * @returns {number} integer in [CARDS_PER_ROW_MIN .. CARDS_PER_ROW_MAX]
   */
  function _resolveCardsPerRow() {
    const opts = _resolveVideoPlayerEffectiveOptions();

    const raw = (opts && opts.playlist && opts.playlist.cards)
      ? opts.playlist.cards.perRow
      : undefined;

    const perRow = parseInt(raw, 10);

    if (!Number.isFinite(perRow) || perRow < CARDS_PER_ROW_MIN) {
      return CARDS_PER_ROW_DEFAULT;
    }

    return Math.min(perRow, CARDS_PER_ROW_MAX);
  }

  /**
   * _applyCardsPerRow - writes the resolved column count onto the top-level
   * playlist container (#videoplayer_playlist_parent_<id>) as inline styles.
   * Called on every switch into, and every re-render of, card mode.
   *
   * @param  {HTMLElement} containerEl - the player-scoped playlist container
   * @returns {number} the perRow value that was applied
   */
  function _applyCardsPerRow(containerEl) {
    if (!containerEl || !containerEl.style) return CARDS_PER_ROW_DEFAULT;

    const perRow = _resolveCardsPerRow();

    containerEl.style.setProperty(CARDS_PER_ROW_CSS_VAR, String(perRow));
    containerEl.style.gridTemplateColumns = `repeat(${perRow}, 1fr)`;

    isDev && logger.debug('\n' + `playlistManager: card mode grid set to ${perRow} card(s) per row`);

    return perRow;
  }

  /**
   * _clearCardsPerRow - removes the inline card-grid declarations again.
   * Called when the container is switched (back) to list mode. The list-mode
   * rule uses !important and would win regardless; stripping the declarations
   * keeps the element free of stale geometry and makes the DOM readable while
   * debugging.
   *
   * @param {HTMLElement} containerEl - the player-scoped playlist container
   */
  function _clearCardsPerRow(containerEl) {
    if (!containerEl || !containerEl.style) return;

    containerEl.style.removeProperty(CARDS_PER_ROW_CSS_VAR);
    containerEl.style.removeProperty('grid-template-columns');
  }

  // ---------------------------------------------------------------------------
  // Playlist ACTION BUTTONS on|off (ui_elements.playlist_*_button)
  //
  // #52 introduced per-player on|off switches for the three playlist action
  // buttons (button.playlist-btn.rate|edit|delete) via the YAML keys
  //
  //     ui_elements:
  //       playlist_rate_button:    true|false
  //       playlist_edit_button:    true|false
  //       playlist_delete_button:  true|false
  //
  // but implemented them only inside the Lit drop-in component
  // playlistCards.mjs. Two gaps remained, both closed by #53:
  //
  //   1. The "adapter step 0" that #52 relied on — publishing the RESOLVED
  //      flags as data attributes on div#videoplayer_playlist_parent_<id>,
  //      where the component's _applyUiElementFlags() reads them at
  //      (re)connect time — was never implemented in this module. The
  //      component therefore always kept its constructor defaults (all
  //      buttons visible): connectedCallback() ran, but the mirror step
  //      never had any data to apply. _applyUiElementFlags(containerEl)
  //      below is that missing publisher; it runs on every render so the
  //      attributes can never go stale after option changes.
  //
  //   2. The string-template renderers in THIS module emitted the three
  //      buttons unconditionally — the CARD view (renderCards) and the
  //      LIST/ROW view (renderPlaylist, flagged as a future fix by #52).
  //      Both templates now gate each button on the resolved flags and skip
  //      the actions wrapper entirely when all three are disabled, so no
  //      empty actions bar is rendered.
  //
  // Resolution: _resolveUiElementFlags() reads ui_elements.* from the
  // EFFECTIVE options of this instance via
  // _resolveVideoPlayerEffectiveOptions() — per-player control entry ->
  // user settings -> module defaults, the #48/#49 inheritance chain — so a
  // per-player override always wins. Only an explicit `false` hides a
  // button (`!== false`, the #47 null-safety pattern): configurations
  // without the keys keep the pre-#52 behavior (all visible) unchanged.
  //
  // Side effect (intended): hiding a button also removes its click target,
  // so the delegated handlers (initRateHandler / initEditHandler /
  // initDeleteHandler) are implicitly disabled per player — no handler
  // changes required.
  //
  // Scoping: like _applyCardsPerRow(), every write goes through the element
  // handed in by the caller, always resolved via
  // _pid('videoplayer_playlist_parent'). On a multi-player page each
  // instance publishes only onto its own container.
  // ---------------------------------------------------------------------------

  /**
   * _resolveUiElementFlags - effective visibility of the playlist action
   * buttons for this instance.
   *
   * Every level is read defensively: renderCurrent() may run before the
   * adapter has assigned any options, and older option sets carry no
   * ui_elements subtree at all — both degrade to "all visible".
   *
   * @returns {{rate: boolean, edit: boolean, delete: boolean}}
   */
  function _resolveUiElementFlags() {
    const opts = _resolveVideoPlayerEffectiveOptions();
    const ui   = (opts && typeof opts.ui_elements === 'object' && opts.ui_elements)
      ? opts.ui_elements
      : {};

    return {
      rate:   ui.playlist_rate_button   !== false,
      edit:   ui.playlist_edit_button   !== false,
      delete: ui.playlist_delete_button !== false,
    };
  }

  /**
   * _applyUiElementFlags - resolves the action-button flags and publishes
   * them as data attributes on the top-level playlist container
   * (#videoplayer_playlist_parent_<id>):
   *
   *     data-playlist-rate-button   = "true"|"false"
   *     data-playlist-edit-button   = "true"|"false"
   *     data-playlist-delete-button = "true"|"false"
   *
   * The attributes are the contract consumed by playlistCards.mjs
   * (_applyUiElementFlags on the component side, #52/#53) whenever an
   * adapter renders the cards through <playlist-cards> instead of through
   * this module's renderCards(). Called on every render of either view so
   * the published state always matches the effective options.
   *
   * @param  {HTMLElement} containerEl - the player-scoped playlist container
   * @returns {{rate: boolean, edit: boolean, delete: boolean}} the resolved
   *          flags — also used directly by renderCards()/renderPlaylist()
   */
  function _applyUiElementFlags(containerEl) {
    const flags = _resolveUiElementFlags();

    if (containerEl && containerEl.dataset) {
      containerEl.dataset.playlistRateButton   = String(flags.rate);
      containerEl.dataset.playlistEditButton   = String(flags.edit);
      containerEl.dataset.playlistDeleteButton = String(flags.delete);
    }

    isDev && logger.debug('\n' + `playlistManager: playlist action buttons resolved (rate: ${flags.rate}, edit: ${flags.edit}, delete: ${flags.delete})`);

    return flags;
  }

  // ---------------------------------------------------------------------------
  // MEDIA EXPORT (download of plain audio/video files)
  //
  // The player already exports the playlist META DATA as JSON
  // (exportToFile()/backupToFile()). This section adds the export of the
  // MEDIA ITSELF: for every playlist entry whose `src` points at a PLAIN
  // media file the item can now be written to the browser's local download
  // folder — per item (button.playlist-btn.download inside
  // div.playlist-row-content / div.playlist-card-actions) and for the whole
  // active playlist at once (button.playlist-download-all-btn inside
  // div.playlist-block-title).
  //
  // What counts as "plain media" is defined by exactly ONE table —
  // DOWNLOAD_MIME_BY_EXTENSION below. Only the two formats named in the
  // requirement are enabled (.mp3 audio, .mp4 video); adding a further
  // container (webm, m4a, ogg, ...) is a one-line addition there and needs
  // no other change anywhere in this module.
  //
  // Streaming sources are NEVER downloadable and are filtered out before a
  // button is ever rendered:
  //   - YouTube records (entry.type 'video/youtube', youtu.be/youtube.com
  //     URLs) — there is no plain file behind them,
  //   - manifest/streaming URLs (.m3u8, .mpd) and any extension that is not
  //     listed in the table.
  // The buttons are therefore self-hiding: a YouTube-only playlist shows no
  // download UI at all.
  //
  // Same-origin vs. cross-origin (important, browser-imposed):
  //   - SAME ORIGIN: the anchor `download` attribute is honoured by the
  //     browser, so the file is written straight to the download folder
  //     without ever passing through JS memory.
  //   - CROSS ORIGIN: browsers IGNORE the `download` attribute (it would be
  //     a cross-origin data leak) and would navigate instead. The bytes must
  //     therefore be pulled through fetch() — which requires the serving
  //     host to send CORS headers — and handed to the anchor as an object
  //     URL. When the host sends no CORS headers the fetch fails; the last
  //     resort is opening the media in a new tab so the user can save it
  //     manually via the browser's own context menu. This is a hard browser
  //     restriction, not a module limitation.
  // ---------------------------------------------------------------------------

  // The SINGLE source of truth for "is this a plain media file we export?".
  // Keys are lower-case file extensions (without dot), values the MIME type
  // used for the generated Blob on the cross-origin path.
  // EXTENSION POINT: add e.g. `webm: 'video/webm'` here — nothing else.
  //
  const DOWNLOAD_MIME_BY_EXTENSION = Object.freeze({
    mp3: 'audio/mpeg',
    mp4: 'video/mp4'
  });

  // Pause between two consecutive downloads of a "download all" run. Browsers
  // throttle (or silently drop) multiple downloads fired within the same tick;
  // a short gap keeps every file of a batch.
  //
  const DOWNLOAD_SEQUENCE_DELAY_MS = 700;

  // Upper bound for the generated file name STEM (without extension). Keeps
  // long playlist titles inside the path limits of all common file systems.
  //
  const DOWNLOAD_FILENAME_MAX_LENGTH = 120;

  // ---------------------------------------------------------------------------
  // EXPORT PROGRESS NOTIFICATIONS (toasts)
  //
  // The export controls added by #1 give NO visual feedback beyond the button
  // 'busy' state: a same-origin transfer is handed to the browser silently, a
  // cross-origin transfer can run for seconds behind a pulsing icon, and a
  // failure was only ever visible in the browser console. This fix adds the
  // user-visible layer: a toast notification for every export — start,
  // per-file progress of a batch and the final result.
  //
  // The implementation mirrors the Toast module of claudeAI.js
  // (claudeAI.js -> `const Toast = (() => { function show(message, type,
  // duration) ... })()`) so both modules look and behave identically on a
  // page that hosts them together:
  //
  //   - one fixed, stacking container,
  //   - one <div class="toast <type>"> per message, class 'show' added on the
  //     next animation frame to trigger the slide-in transition,
  //   - auto-removal after `duration` ms, with the element dropped from the
  //     DOM after the slide-out transition,
  //   - the same three message types: 'info' | 'success' | 'error'.
  //
  // Three DELIBERATE deviations from the claudeAI.js original, each required
  // by this module's context:
  //
  //   1. CONTAINER: claudeAI.js reads a statically authored
  //      <div id="toastContainer"> out of its own page template. The video
  //      player is dropped into arbitrary pages that carry no such element,
  //      so the container is created on demand (id 'videoplayer_toast_container',
  //      class 'toast-container'). An EXISTING '#toastContainer' is reused
  //      when present, so a page running claudeAI.js and the player side by
  //      side keeps ONE toast stack instead of two overlapping ones.
  //   2. ICONS: claudeAI.js renders Material Design Icons (mdi mdi-*). This
  //      module renders Font Awesome throughout (fas fa-*, see every playlist
  //      button), so the icon set follows the host module.
  //   3. ESCAPING: claudeAI.js interpolates the message into innerHTML
  //      unescaped. Export messages carry PLAYLIST TITLES — free text from
  //      imported/served playlists — so the text is escaped here
  //      (_escapeToastText) exactly as the render methods escape titles.
  //
  // ADDITION on top of the claudeAI.js API: _showProgressToast() returns a
  // HANDLE for a toast that does NOT auto-dismiss. A batch export updates one
  // single toast in place ('Exporting media file 3 of 12 ...') and finally
  // turns that same toast into the success/error result, instead of flooding
  // the stack with one toast per file.
  // ---------------------------------------------------------------------------

  // Id of the container this module creates when the page has none.
  //
  const TOAST_CONTAINER_ID        = 'videoplayer_toast_container';

  // Id of the container authored by claudeAI.js. Reused when present so both
  // modules share ONE toast stack (see deviation 1 above).
  //
  const TOAST_SHARED_CONTAINER_ID = 'toastContainer';

  // Default lifetime of a toast — the claudeAI.js default (3500 ms).
  //
  const TOAST_DEFAULT_DURATION_MS = 3500;

  // Delay between removing the 'show' class and dropping the element from the
  // DOM. Must cover the slide-out transition (claudeAI.js uses 750 ms).
  //
  const TOAST_REMOVE_DELAY_MS     = 750;

  // Hard safety timeout of a PROGRESS toast. A progress toast has no lifetime
  // of its own — it lives until resolve()/dismiss() is called. Should an
  // unexpected exception ever escape an export run before it resolves, this
  // timeout still clears the toast instead of leaving it on screen forever.
  //
  const TOAST_PROGRESS_TIMEOUT_MS = 15 * 60 * 1000;

  // Outcome of the LAST _downloadMediaSource() call. _downloadMediaSource()
  // returns a plain boolean (contract kept unchanged for every existing
  // caller), which cannot distinguish "failed" from "cross-origin blocked,
  // media opened in a new tab for a manual save" — two cases that need very
  // different messages. The function therefore records its outcome here and
  // the callers read it when composing the toast.
  //
  //   'same-origin'  - written straight to the download folder
  //   'cross-origin' - fetched through CORS and written as an object URL
  //   'manual-tab'   - CORS blocked; opened in a new tab for a manual save
  //   'failed'       - no transfer and no fallback tab
  //
  let _lastDownloadOutcome = null;

  /**
   * _escapeToastText - HTML-escapes a toast message. Same technique as
   * PlaylistManager._escapeHtml(): assign as textContent, read back as
   * innerHTML.
   *
   * @param  {*} value
   * @returns {string}
   */
  function _escapeToastText(value) {
    const el = document.createElement('div');
    el.textContent = (value === null || value === undefined) ? '' : String(value);
    return el.innerHTML;
  }

  /**
   * _getToastContainer - resolves (and on first use creates) the toast stack.
   *
   * Resolution order:
   *   1. '#toastContainer'              - authored by the page / claudeAI.js
   *   2. '#videoplayer_toast_container' - created by this module, reused on
   *                                       every later call and shared by all
   *                                       player instances of the page
   *
   * @returns {HTMLElement|null} null only when there is no document to attach
   *          to (non-browser/test environment) — every caller handles null.
   */
  function _getToastContainer() {
    if (typeof document === 'undefined' || !document.body) return null;

    const shared = document.getElementById(TOAST_SHARED_CONTAINER_ID);
    if (shared) return shared;

    let container = document.getElementById(TOAST_CONTAINER_ID);

    if (!container) {
      container           = document.createElement('div');
      container.id        = TOAST_CONTAINER_ID;
      container.className = 'toast-container videoplayer-toast-container mt-4';
      container.setAttribute('aria-live', 'polite');
      container.setAttribute('aria-atomic', 'false');

      document.body.appendChild(container);

      isDev && logger.debug('\n' + 'videoPlayerToast: toast container created');
    }

    return container;
  }

  /**
   * _toastIconClass - Font Awesome counterpart of the claudeAI.js mdi mapping
   * (check-circle / alert-circle / information).
   *
   * @param  {string} type - 'info' | 'success' | 'error'
   * @returns {string} Font Awesome icon class
   */
  function _toastIconClass(type) {
    if (type === 'success') return 'fa-check-circle';
    if (type === 'error')   return 'fa-exclamation-circle';
    return 'fa-info-circle';
  }

  /**
   * _toastType - normalises any caller input to one of the three known types
   * so an unknown value can never produce an unstyled toast.
   *
   * @param  {string} type
   * @returns {string} 'info' | 'success' | 'error'
   */
  function _toastType(type) {
    return (type === 'success' || type === 'error') ? type : 'info';
  }

  /**
   * _removeToastElement - slide-out and removal, idempotent (a toast can be
   * dismissed by its lifetime timer and by an explicit dismiss() call in the
   * same tick without being removed twice).
   *
   * @param {HTMLElement} el
   */
  function _removeToastElement(el) {
    if (!el || el._vpToastRemoving) return;

    el._vpToastRemoving = true;

    if (el._vpToastTimer) {
      clearTimeout(el._vpToastTimer);
      el._vpToastTimer = null;
    }

    el.classList.remove('show');

    setTimeout(() => {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, TOAST_REMOVE_DELAY_MS);
  }

  /**
   * _showToast - shows one toast notification. Signature and behaviour of
   * claudeAI.js Toast.show().
   *
   * @param  {string} message  - plain text; HTML is escaped
   * @param  {string} [type]   - 'info' (default) | 'success' | 'error'
   * @param  {number} [duration] - lifetime in ms; 0 disables auto-dismissal
   *                               (used by _showProgressToast)
   * @returns {HTMLElement|null} the toast element, null when there is no DOM
   */
  function _showToast(message, type, duration) {
    const container = _getToastContainer();
    if (!container) return null;

    const kind = _toastType(type);
    const el   = document.createElement('div');

    // 'toast' + type keep the claudeAI.js class contract (a page that already
    // styles .toast styles these too); 'videoplayer-toast' is the module's own
    // hook in videoPlayer.css so the player stays self-contained.
    //
    el.className = `toast videoplayer-toast ${kind}`;
    el.setAttribute('role', kind === 'error' ? 'alert' : 'status');

    el.innerHTML = `
      <table class="mb-0">
        <tbody>
          <tr>
            <td class="icon">
              <i class="fas ${_toastIconClass(kind)} videoplayer-toast-icon"></i>
            </td>
            <td class="content">
              <p class="mb-0">${_escapeToastText(message)}</p>
            </td>
          </tr>
        </tbody>
      </table>    
    `;

    container.appendChild(el);
    requestAnimationFrame(() => el.classList.add('show'));

    const ttl = (typeof duration === 'number') ? duration : TOAST_DEFAULT_DURATION_MS;

    if (ttl > 0) {
      el._vpToastTimer = setTimeout(() => _removeToastElement(el), ttl);
    }

    return el;
  }

  /**
   * _showProgressToast - shows a toast that stays on screen until it is
   * resolved, and returns the handle to drive it.
   *
   * Handle:
   *   update(message)                  - replace the text (progress ticks)
   *   resolve(message, type, duration) - turn the SAME toast into the final
   *                                      success/error/info message and let it
   *                                      auto-dismiss; a no-op once settled
   *   dismiss()                        - remove without a final message
   *
   * The handle is always usable — when there is no DOM (or the container could
   * not be created) every method degrades to a no-op, so no caller needs a
   * null check.
   *
   * @param  {string} message
   * @returns {{element: (HTMLElement|null), update: Function, resolve: Function, dismiss: Function}}
   */
  function _showProgressToast(message) {
    const el = _showToast(message, 'info', 0);

    let settled = false;
    let guard   = null;

    if (el) {
      guard = setTimeout(() => {
        if (settled) return;
        settled = true;
        _removeToastElement(el);
        logger.warn('\n' + 'videoPlayerToast: progress toast timed out and was cleared');
      }, TOAST_PROGRESS_TIMEOUT_MS);
    }

    function _setText(msg) {
      if (!el) return;
      const textEl = el.querySelector('.videoplayer-toast-text');
      if (textEl) {
        textEl.textContent = (msg === null || msg === undefined) ? '' : String(msg);
      }
    }

    return {
      element: el,

      update(msg) {
        if (settled) return;
        _setText(msg);
      },

      resolve(msg, type, duration) {
        if (settled) return;
        settled = true;

        if (guard) {
          clearTimeout(guard);
          guard = null;
        }

        // No live element (no DOM): fall back to a plain toast attempt so the
        // call site stays uniform.
        if (!el) {
          _showToast(msg, type, duration);
          return;
        }

        const kind = _toastType(type);

        // Keep 'show' asserted: resolve() can run in the same tick as the
        // initial show (a fast same-origin transfer) — before the initial
        // requestAnimationFrame added it.
        el.className = `toast videoplayer-toast ${kind} show`;
        el.setAttribute('role', kind === 'error' ? 'alert' : 'status');

        const icon = el.querySelector('.videoplayer-toast-icon');
        if (icon) icon.className = `fas ${_toastIconClass(kind)} videoplayer-toast-icon`;

        _setText(msg);

        const ttl = (typeof duration === 'number') ? duration : TOAST_DEFAULT_DURATION_MS;

        if (el._vpToastTimer) clearTimeout(el._vpToastTimer);
        if (ttl > 0) {
          el._vpToastTimer = setTimeout(() => _removeToastElement(el), ttl);
        }
      },

      dismiss() {
        settled = true;

        if (guard) {
          clearTimeout(guard);
          guard = null;
        }

        if (el) _removeToastElement(el);
      }
    };
  }

  // Public notification surface of this instance, exported on the instance API
  // as `videoPlayerToast` (see the return block at the end of
  // createVideoPlayerInstance). An adapter can use the very same toasts for
  // its own export-related messages:
  //
  //     const vp = videoPlayer('player_1');
  //     vp.videoPlayerToast.show('Playlist loaded.', 'success');
  //     const t = vp.videoPlayerToast.progress('Preparing export ...');
  //     t.resolve('Export prepared.', 'success');
  //
  const videoPlayerToast = Object.freeze({
    show:     _showToast,
    progress: _showProgressToast
  });

  // ===========================================================================
  // EXPIRY NOTICE MODAL (user-visible counterpart of the #1 log warning)
  //
  // Fix #1 introduced the expiry gates: when a playlist entry carries an
  // expiryDate that has been reached, playback is refused and a WARNING is
  // written to the log. That warning is the right signal for an OPERATOR, but
  // it is invisible to the VIEWER: from the outside a blocked entry simply
  // does nothing when clicked, which is indistinguishable from a broken
  // player. This fix adds the missing user-facing layer - a Bootstrap modal
  // that names the affected video, states WHY it cannot be played and shows
  // the expiry date.
  //
  // MARKUP CONTRACT
  // The generated markup mirrors the reference dialog supplied for this fix
  // (the `div id="sideModalDanger"` template) node for node and class for
  // class:
  //
  //     .modal.fade.right
  //       .modal-dialog.modal-side.modal-bottom-right.modal-notify.modal-danger
  //         .modal-content
  //           .modal-header  > .modal-title.lead.mb-3 + .btn-close.mb-3
  //           .modal-body    > .row > .col-3 (icon) + .col-9 (text + badge)
  //           .modal-footer.justify-content-right > .btn.btn-outline-secondary
  //
  // so a J1 theme that already styles the side/notify/danger family paints
  // this modal exactly like every other danger notice of the site. A scoped
  // fallback (videoPlayer.css, same fix tag) covers themes that do NOT ship
  // those classes, so the dialog is never unstyled.
  //
  // THREE DELIBERATE DEVIATIONS from the reference template, each with a
  // reason:
  //
  //   1. ID. The reference id 'sideModalDanger' is NOT reused. A page may
  //      already author its own #sideModalDanger for unrelated purposes, and
  //      rewriting its body would destroy host content. The player creates its
  //      own element (EXPIRY_MODAL_ID) instead. This is the OPPOSITE choice to
  //      the toast container above, which deliberately shares '#toastContainer'
  //      - a container is additive, a dialog body is not.
  //   2. ICONS. The reference renders Material Design Icons (mdi mdi-info).
  //      This module renders Font Awesome throughout (fas fa-*, see every
  //      playlist button and the toast layer), so the icon set follows the
  //      host module: fas fa-exclamation-triangle.
  //   3. STATIC TEXT -> LIVE TEXT. The Lorem-ipsum placeholders and the fixed
  //      `<span class="badge">` become per-entry content, written as
  //      textContent (never innerHTML) so a title coming from an imported or
  //      served playlist can never inject markup.
  //
  // LIFECYCLE. Built once per page, on first blocked playback (the same
  // create-once pattern as _createRatingModal/_createEditModal), then reused
  // and repopulated on every later block. The element is page-global by id, so
  // all player instances of a multi-player page share ONE dialog instead of
  // stacking one per instance.
  //
  // GRACEFUL DEGRADATION. When the Bootstrap JS bundle is absent (the modal
  // API is a hard dependency the player itself never loads), the notice falls
  // back to the toast layer of the export fix, and to the log warning alone if
  // there is no DOM at all. A missing dependency must never turn a blocked
  // playback into a thrown exception.
  // ===========================================================================

  // Id of the dialog this module creates. Deliberately NOT 'sideModalDanger'
  // (see deviation 1 above).
  //
  const EXPIRY_MODAL_ID          = 'videoPlayerExpiryModal';

  // Ids of the parts rewritten on every show(). Kept as constants so the
  // markup template and the populate step can never drift apart.
  //
  const EXPIRY_MODAL_LABEL_ID    = 'videoPlayerExpiryModalLabel';
  const EXPIRY_MODAL_TITLE_ID    = 'videoPlayerExpiryModalVideoTitle';
  const EXPIRY_MODAL_TEXT_ID     = 'videoPlayerExpiryModalText';
  const EXPIRY_MODAL_HINT_ID     = 'videoPlayerExpiryModalHint';
  const EXPIRY_MODAL_BADGE_ID    = 'videoPlayerExpiryModalBadge';
  const EXPIRY_MODAL_CLOSE_ID    = 'videoPlayerExpiryModalClose';

  // Heading of the dialog. Single point of change for a re-wording.
  //
  const EXPIRY_MODAL_HEADING     = 'Access Period Expired';

  // Repeat suppression. One user action can cross more than one expiry gate
  // (playEntry -> the PlaylistManager embedRunVideo wrapper -> the global
  // embedRunVideo last line of defence), and a viewer who keeps clicking a
  // blocked row would otherwise re-trigger the dialog on every click. A second
  // notice for the SAME videoId inside this window is swallowed; the log
  // warning of #1 is NOT suppressed, so the operator still sees every single
  // blocked attempt.
  //
  const EXPIRY_MODAL_REPEAT_MS   = 2000;

  //
  // DESIGN DECISION RESOLVED: the notice is now raised on the load-and-pause
  // (preload) path as well. The reported failure case IS exactly this path -
  // playlistSortHandler.init() -> autoLoadFirstEntryOnReload() ->
  // embedRunVideo(videoId, 'pause') -> expiry gate: an expired first entry
  // was blocked with the #1 log warning only, so the viewer saw an inert
  // player and NO dialog. Flipping the prepared toggle routes this path
  // through the very same _showExpiryNotice() dialog as an interactive
  // click; nothing else has to be touched (see the note above).
  // Original (deprecated, preserved for reference):
  // const EXPIRY_MODAL_ON_PRELOAD  = false;
  //
  const EXPIRY_MODAL_ON_PRELOAD  = true;

  // Lifetime of the TOAST used when Bootstrap's modal API is unavailable.
  // Longer than the export toasts (3500 ms): this message reports a refusal
  // the viewer has to read and act on, not a progress tick.
  //
  const EXPIRY_MODAL_TOAST_MS    = 9000;

  // Repeat-suppression state. Module-level `let` (not `const`) because both
  // values are rewritten on every accepted notice. Declared ABOVE their first
  // call site on purpose - a `let` read from a function that runs before this
  // line is evaluated would raise a Temporal Dead Zone error.
  //
  let _expiryModalLastVideoId    = '';
  let _expiryModalLastShownAt    = 0;

  /**
   * _isBootstrapModalAvailable - true when the Bootstrap JS bundle exposes the
   * modal component. The player never loads Bootstrap itself; it is provided
   * by the J1 theme, so its presence is checked rather than assumed.
   *
   * @returns {boolean}
   */
  function _isBootstrapModalAvailable() {
    return (typeof bootstrap !== 'undefined') &&
           !!bootstrap &&
           typeof bootstrap.Modal !== 'undefined';
  }

  /**
   * _expiryModalVideoLabel - the most human-readable name available for an
   * entry, used as the dialog subtitle.
   *
   * Resolution order: title -> "author - videoId" -> videoId -> a generic
   * placeholder. Never returns an empty string, so the dialog never renders a
   * blank line.
   *
   * @param  {Object|null} entry   - a playlistManager record (may be null)
   * @param  {string}      videoId - the id the block was raised for
   * @returns {string}
   */
  function _expiryModalVideoLabel(entry, videoId) {
    if (entry && typeof entry === 'object') {
      const title = (entry.title || '').toString().trim();
      if (title) return title;

      const author = (entry.author || '').toString().trim();
      if (author && videoId) return `${author} - ${videoId}`;
    }

    const id = (videoId || '').toString().trim();
    return id || 'this video';
  }

  /**
   * _createExpiryModal - builds the dialog ONCE and appends it to <body>.
   *
   * Mirrors _createRatingModal()/_createEditModal(): guard on the id, build a
   * template literal, insert with insertAdjacentHTML('beforeend'). The
   * template carries NO entry data - every per-entry string is written later
   * by _populateExpiryModal() as textContent.
   *
   * @returns {HTMLElement|null} the dialog element, null when there is no DOM
   */
  function _createExpiryModal() {
    if (typeof document === 'undefined' || !document.body) return null;

    const existing = document.getElementById(EXPIRY_MODAL_ID);
    if (existing) return existing;

    const modalHTML = `
      <div id="${EXPIRY_MODAL_ID}" class="modal fade right" tabindex="-1" role="dialog"
        aria-labelledby="${EXPIRY_MODAL_LABEL_ID}" aria-hidden="true"
        data-bs-keyboard="false" data-bs-backdrop="static">
        <div class="modal-dialog modal-side modal-bottom-right modal-notify modal-danger" role="document">
          <!-- Content -->
          <div class="modal-content">
            <!-- Header -->
            <div class="modal-header">
              <p id="${EXPIRY_MODAL_LABEL_ID}" class="modal-title lead mb-3" style="font-size: 1.5rem;font-weight: 400;">${EXPIRY_MODAL_HEADING}</p>
              <button id="${EXPIRY_MODAL_CLOSE_ID}" type="button" class="btn-close mb-3" data-bs-dismiss="modal" aria-label="Close">
              </button>
            </div>
            <!-- Body -->
            <div class="modal-body">
              <div class="row">
                <div class="col-3">
                  <p class="text-center"><i class="fas fa-exclamation-triangle fa-4x videoplayer-expiry-modal-icon"></i></p>
                </div>
                <div class="col-9">
                  <p id="${EXPIRY_MODAL_TEXT_ID}" class="videoplayer-expiry-modal-text"></p>
                  <p id="${EXPIRY_MODAL_TITLE_ID}" class="videoplayer-expiry-modal-title"></p>
                  <p id="${EXPIRY_MODAL_HINT_ID}" class="videoplayer-expiry-modal-hint"></p>
                  <h2 class="notoc mb-3">
                    <span id="${EXPIRY_MODAL_BADGE_ID}" class="badge videoplayer-expiry-modal-badge"></span>
                  </h2>
                </div>
              </div>
            </div>
            <!-- Footer -->
            <div class="modal-footer justify-content-right">
              <a href="#" type="button" class="btn btn-primary fw-bold" videoPlayerExpiryModalBadge data-bs-dismiss="modal">Understand, thanks</a>
            </div>
          </div>
          <!-- END Content -->
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Target the modal element by its ID and initialize it
    // const myModal = new bootstrap.Modal(document.getElementById("${EXPIRY_MODAL_ID}"));

    isDev && logger.debug('\n' + 'videoPlayerExpiry: expiry notice modal created');

    return document.getElementById(EXPIRY_MODAL_ID);
  }

  /**
   * _populateExpiryModal - writes the per-entry strings into the dialog.
   *
   * Every write goes through textContent, NOT innerHTML: a playlist title is
   * free text from an imported or served playlist and must never be parsed as
   * markup here (the render methods escape the same values with _escapeHtml()
   * because they build HTML strings; this path does not have to build one).
   *
   * @param {HTMLElement}  modalEl - the dialog returned by _createExpiryModal()
   * @param {Object|null}  entry   - the blocked playlistManager record
   * @param {string}       videoId - the id the block was raised for
   */
  function _populateExpiryModal(modalEl, entry, videoId) {
    if (!modalEl) return;

    const expiryDate = (entry && entry.expiryDate) ? entry.expiryDate : EXPIRY_UNLIMITED;

    const setText = (id, text) => {
      const el = modalEl.querySelector('#' + id);
      if (el) el.textContent = text;
    };

    setText(EXPIRY_MODAL_TEXT_ID,
            'The Access period for this media has ended. Playback is disabled.');

    setText(EXPIRY_MODAL_TITLE_ID, _expiryModalVideoLabel(entry, videoId));

    // Reuses the #1 hint builder, so the dialog, the hint line of the edit
    // dialog and the log warning all phrase the state identically.
    setText(EXPIRY_MODAL_HINT_ID, _expiryHintText(expiryDate));

    setText(EXPIRY_MODAL_BADGE_ID,
            expiryDate ? `expired: ${expiryDate}` : 'expired');
  }

  /**
   * _showExpiryNotice - the single entry point every expiry gate calls right
   * after the #1 log warning.
   *
   * Contract: NEVER throws and never returns a value a caller has to handle.
   * A gate must be able to call it unconditionally, and a failure to notify
   * must never turn into a failure to BLOCK - the refusal itself is already
   * decided by the caller before this runs.
   *
   * Order of operations:
   *   1. preload suppression  (EXPIRY_MODAL_ON_PRELOAD, mode 'pause')
   *   2. repeat suppression   (EXPIRY_MODAL_REPEAT_MS, same videoId)
   *   3. Bootstrap present    -> create/populate/show the dialog
   *      Bootstrap absent     -> toast fallback
   *      no DOM               -> log warning of #1 only
   *
   * @param {Object|null} entry     - the blocked playlistManager record
   * @param {string}      videoId   - the id the block was raised for
   * @param {Object}     [options]  - { source: string, mode: string }
   *                                  `source` names the calling gate (logs
   *                                  only), `mode` is the embedRunVideo mode.
   */
  function _showExpiryNotice(entry, videoId, options) {
    try {
      const opts   = options || {};
      const source = opts.source || 'expiryGate';
      const mode   = opts.mode   || '';

      // 1) Non-interactive load-and-pause path - silenced by default.
      if (!EXPIRY_MODAL_ON_PRELOAD && mode === 'pause') {
        isDev && logger.debug('\n' + `videoPlayerExpiry: notice suppressed (preload/pause) for videoId: ${videoId}`);
        return;
      }

      if (typeof document === 'undefined' || !document.body) return;

      // 2) Same entry, same user action / rapid re-click.
      const now = Date.now();
      if (videoId &&
          videoId === _expiryModalLastVideoId &&
          (now - _expiryModalLastShownAt) < EXPIRY_MODAL_REPEAT_MS) {
        isDev && logger.debug('\n' + `videoPlayerExpiry: notice suppressed (repeat) for videoId: ${videoId}`);
        return;
      }

      _expiryModalLastVideoId = videoId || '';
      _expiryModalLastShownAt = now;

      // 3a) Fallback: no Bootstrap modal API on the page.
      if (!_isBootstrapModalAvailable()) {
        const label = _expiryModalVideoLabel(entry, videoId);
        const date  = (entry && entry.expiryDate) ? entry.expiryDate : '';

        logger.warn('\n' + 'videoPlayerExpiry: bootstrap.Modal unavailable - ' +
                           'falling back to a toast notification');

        _showToast(
          `${EXPIRY_MODAL_HEADING}: "${label}" cannot be played` +
          (date ? ` - access ended on ${date}.` : ' - the Access period has ended.'),
          'error',
          EXPIRY_MODAL_TOAST_MS
        );
        return;
      }

      // 3b) Normal path
      const modalEl = _createExpiryModal();
      if (!modalEl) return;

      _populateExpiryModal(modalEl, entry, videoId);

      // bootstrap.Modal.getOrCreateInstance(modalEl).show();

      const expiryModal = bootstrap.Modal.getOrCreateInstance(modalEl);
      expiryModal.show();

      isDev && logger.debug('\n' + `videoPlayerExpiry: notice shown by ${source} for videoId: ${videoId}`);
    } catch (e) {
      // A notification failure must never escape into the gate that called it.
      logger.warn('\n' + `videoPlayerExpiry: could not raise the expiry notice: ${e && e.message}`);
    }
  }


  // Public expiry-notice surface of this instance, exported on the instance
  // API as `videoPlayerExpiryNotice` (see the return block at the end of
  // createVideoPlayerInstance). An adapter that blocks an expired source on
  // its own (for example before handing a src to the player) can raise the
  // very same dialog:
  //
  //     const vp = videoPlayer('player_1');
  //     vp.videoPlayerExpiryNotice.show(entry, entry.videoId);
  //
  const videoPlayerExpiryNotice = Object.freeze({
    show:      _showExpiryNotice,
    isExpired: _isEntryExpired,
    state:     _expiryState,
    hintText:  _expiryHintText
  });

  /**
   * _getEntryDownloadSource - resolves the plain-media download source of a
   * playlist entry.
   *
   * @param  {Object} entry - a playlistManager record
   * @returns {{url: string, ext: string, mime: string}|null} null when the
   *          entry carries no plain, downloadable media file.
   */
  function _getEntryDownloadSource(entry) {
    if (!entry || typeof entry !== 'object') return null;

    // 1) YouTube records are never plain files.
    if (entry.type && String(entry.type).toLowerCase() === 'video/youtube') {
      return null;
    }

    // 2) `src` is the field the player itself plays from (see embedRunVideo);
    //    videoLink is the documented fallback for older records.
    const url = String(entry.src || entry.videoLink || '').trim();
    if (!url) return null;

    const lower = url.toLowerCase();
    if (lower.indexOf('youtu.be') !== -1 || lower.indexOf('youtube.com') !== -1) {
      return null;
    }

    // 3) Extension check against the ONE table. Query string and fragment are
    //    stripped first so '.../clip.mp3?token=x#t=30' still resolves to mp3.
    const path  = url.split('#')[0].split('?')[0];
    const ext   = path.split('.').pop().toLowerCase();
    isMP3 = (ext === 'mp3') ? true : false;
    isMP4 = (ext === 'mp4') ? true : false;

    if (!Object.prototype.hasOwnProperty.call(DOWNLOAD_MIME_BY_EXTENSION, ext)) {
      return null;
    }

    return { url: url, ext: ext, mime: DOWNLOAD_MIME_BY_EXTENSION[ext] };
  }

  /**
   * _isDownloadableEntry - boolean convenience wrapper around
   * _getEntryDownloadSource(). Safe as an Array#filter/#some callback (the
   * extra index/array arguments are ignored).
   *
   * @param  {Object} entry
   * @returns {boolean}
   */
  function _isDownloadableEntry(entry) {
    return _getEntryDownloadSource(entry) !== null;
  }

  // ---------------------------------------------------------------------------
  // AUDIO ONLY playback for YouTube entries
  //
  // Feature: a new per-player title-bar switch #audioOnlySwitch_<id> (sibling
  // of #playlistModeSwitch_<id>, inserted right AFTER it) toggles "audio only"
  // playback for YouTube sources. When active, the module follows the very
  // same strategy the Amplitude module applies through its ytp plugin
  // (yt_player: height 0 / width 0 / quality 'small' — see ytp.js,
  // buildYtPlayer + onPlayerReady -> ytPlayer.setPlaybackQuality('small')):
  // the video surface is not shown and the amount of VIDEO data loaded is
  // reduced to the minimum — only the audio plays.
  //
  // Implementation mapping (VideoJS instead of a bare YT.Player):
  //
  //   ytp "height/width: 0"      -> videoConfig.audioOnlyMode: true
  //                                 The bundled Video.js (audioOnlyMode_,
  //                                 video.js) collapses the player to the
  //                                 height of the control bar; the YouTube
  //                                 tech iframe is hidden. The control bar
  //                                 (play/pause, volume, progress, rates)
  //                                 stays fully functional.
  //   ytp "quality: small"       -> playerVars.vq = 'small' as the initial
  //                                 hint, hard-enforced after playback start
  //                                 via _applyYouTubeAudioOnlyQuality()
  //                                 (tech_.ytPlayer.setPlaybackQuality),
  //                                 mirroring ytp.js exactly.
  //   ytp "privacy_enhanced"     -> already handled by the existing
  //                                 enablePrivacyEnhancedMode option (host
  //                                 www.youtube-nocookie.com); unchanged.
  //
  // Configuration: the new YAML key `audio_only` (defaults <- user settings
  // <- per-player control settings) seeds the INITIAL switch state; a user
  // toggle is persisted per player in localStorage under _pid('audioOnly')
  // and, once present, wins over the YAML seed (same precedence as
  // playlistMode/mergeMode). The optional ui_elements.audioOnlySwitch flag
  // (absent-key default: TRUE) suppresses the control entirely.
  //
  // The switch is SELF-HIDING: it only appears when the active view holds at
  // least one YouTube entry (mirrors the export controls, which self-hide on
  // YouTube-only playlists — the exact inverse rule).
  //
  // ADDENDUM: display strategy changed from audioOnlyMode to audioPosterMode
  //
  // Fix #1 mapped the ytp 'height: 0 / width: 0' setup to
  // videoConfig.audioOnlyMode: true. That Video.js mode COLLAPSES the player
  // to the height of the control bar (video.js: enableAudioOnlyUI_ hides every
  // component except the control bar and sets the player height to the bar
  // height), so #video_container showed the control bar and NOTHING else — no
  // poster, no video surface.
  //
  // Fix #2 switches to the sibling Video.js mode audioPosterMode (video.js:
  // enablePosterModeUI_): the tech element (the YouTube iframe) is hidden via
  // tech.hide() while the player KEEPS its full fluid 16:9 surface, on which
  // the PosterImage component persistently displays the poster — the core CSS
  // rule '.vjs-has-started.vjs-audio-poster-mode .vjs-poster{display:block}'
  // keeps it visible during playback (normally vjs-has-started hides it).
  // The player inside #video_container therefore shows the CONFIGURED video
  // poster instead of the YouTube video while the video plays hidden.
  //
  // Two supporting pieces are added:
  //   _resolveYouTubeAudioOnlyPoster()  — resolves the poster URL to display
  //                                       (entry.poster <- players.youtube
  //                                       thumbnail file <- default_poster <-
  //                                       DEFAULT_POSTER); PosterImage hides
  //                                       itself when no URL is set, so a URL
  //                                       MUST be provided for the mode to be
  //                                       visible at all.
  //   _ensureAudioOnlyPosterStyles()    — one-time defensive stylesheet with
  //                                       the poster-persistence rule, a no-op
  //                                       when the bundled video-js CSS (which
  //                                       ships the rule since the mode was
  //                                       introduced) is present.
  //
  // The ytp quality parity of Fix #1 (playerVars.vq = 'small' +
  // _applyYouTubeAudioOnlyQuality on 'playing') is UNCHANGED — the amount of
  // video data loaded stays at the minimum; only the presentation changed.
  // ---------------------------------------------------------------------------

  /**
   * _isYouTubeEntry - true when a playlist record resolves to a YouTube
   * source. Classification mirrors _getEntryDownloadSource() rules 1|2
   * (entry.type first, then a host test on src/videoLink), so the two
   * classifiers can never disagree on the same record. Safe as an
   * Array#some/#filter callback.
   *
   * @param  {Object} entry - a playlistManager record
   * @returns {boolean}
   */
  function _isYouTubeEntry(entry) {
    if (!entry || typeof entry !== 'object') return false;

    if (entry.type && String(entry.type).toLowerCase() === 'video/youtube') {
      return true;
    }

    const url = String(entry.src || entry.videoLink || '').toLowerCase();
    return (url.indexOf('youtu.be') !== -1 || url.indexOf('youtube.com') !== -1);
  }

  // ---------------------------------------------------------------------------
  // FIXED audio-only state for players WITHOUT the title-bar switch
  //
  // Fix #1 introduced the per-player title-bar switch #audioOnlySwitch_<id>
  // and the YAML key `audio_only`, which SEEDS the initial switch state; a
  // user toggle persisted under _pid('audioOnly') wins over that seed from
  // the first click on. The control can be suppressed per player with
  // ui_elements.audioOnlySwitch: false — and then the seed/toggle pair is a
  // dead end: `audio_only` still seeds a state the viewer can no longer see
  // or change, and a STALE localStorage value left over from a time the
  // switch WAS shown keeps winning over the configuration for good.
  //
  // Fix 4 adds the companion key `set_audio_only` (defaults <- user settings
  // <- per-player control settings, exactly like `audio_only`) which states
  // the audio-only mode of a player DECLARATIVELY, for the case where no
  // switch exists to state it interactively:
  //
  //   set_audio_only: true   — YouTube entries always play audio only
  //   set_audio_only: false  — YouTube entries always play with video
  //   (key absent)           — no opinion; Fix #1 behaviour unchanged
  //
  // GATE (requirement): the key is consulted ONLY when the switch is not
  // shown or is unavailable — see _isAudioOnlySwitchAvailable() for the four
  // cases that qualify. As long as the viewer can reach the control, the
  // control owns the state and `set_audio_only` is ignored entirely; the
  // precedence of Fix #1 (localStorage -> audio_only -> false) then applies
  // unchanged.
  //
  // BACKWARD COMPATIBILITY: an ABSENT key resolves to null ("no opinion") and
  // falls through to the original chain, so a configuration that does not
  // declare `set_audio_only` behaves byte-for-byte as before Fix 4 — the same
  // absent-key rule the ui_elements switches of the export fixes follow.
  //
  // SINGLE DECISION POINT: every playback decision of the feature already
  // resolves through _resolveAudioOnlyActive() (createVideoJsPlayer and the
  // 'playing' quality one-shot); playlistManager._audioOnly is UI mirror
  // state only. The new gate therefore needs exactly ONE hook — the head of
  // that resolver — plus a mirror sync for the checkbox-less case, so no
  // playback path can disagree with the configuration.
  // ---------------------------------------------------------------------------

  /**
   * _isAudioOnlySwitchAvailable - can the viewer reach the title-bar switch
   * #audioOnlySwitch_<id> of THIS player?
   *
   * Answers "shown or reachable", NOT "currently visible": the switch is
   * self-hiding on a view that holds no YouTube entry (see
   * _updateAudioOnlySwitchVisibility), and a running search can hide it for a
   * moment. Treating that transient state as "unavailable" would let
   * `set_audio_only` override a deliberate user toggle mid-session, so the
   * display attribute is deliberately NOT tested — on a playlist without
   * YouTube entries the audio-only state has no effect anyway.
   *
   * Unavailable (first match wins):
   *   1. no effective options at all, or the module is disabled for this
   *      player (opts.enabled === false) — nothing is rendered
   *   2. ui_elements.audioOnlySwitch === false — suppressed by configuration;
   *      the case the requirement names explicitly
   *   3. playlist.enabled === false — no playlist panel, hence no
   *      '.playlist-block-title' bar the switch could ever be built into
   *   4. neither the switch element NOR its host title bar exists in the DOM
   *      — the markup this player was rendered with carries no playlist
   *      block, so the lazy build of renderCurrent() can never succeed
   *
   * Read defensively (callable before the adapter has assigned options),
   * mirroring _resolveAudioOnlyActive()/_resolveUiElementFlags().
   *
   * @returns {boolean} true when the control is shown or can still appear
   */
  function _isAudioOnlySwitchAvailable() {
    const opts = _resolveVideoPlayerEffectiveOptions();

    // 1. no options / module disabled for this player
    //
    if (opts === null || opts.enabled === false) {
      return false;
    }

    // 2. suppressed by configuration (absent key defaults to TRUE, same rule
    //    as audioOnlySwitchHandler.init() and _updateAudioOnlySwitchVisibility)
    //
    const ui = (typeof opts.ui_elements === 'object' && opts.ui_elements)
      ? opts.ui_elements
      : {};
    if (ui.audioOnlySwitch === false) {
      return false;
    }

    // 3. no playlist -> no title bar -> no switch
    //
    if (opts.playlist && opts.playlist.enabled === false) {
      return false;
    }

    // 4. DOM reachability: the built switch, or the title bar it is built
    //    into (same player-scoped resolution as audioOnlySwitchHandler.
    //    cacheElements(), with the document-wide fallback of the default
    //    instance).
    //
    if (document.getElementById(_pid('audioOnlySwitch'))) {
      return true;
    }

    const _aoScope = document.getElementById(_pid('playlist_screen')) || document.getElementById(_pid('playlistBlock'));
    const _aoBar   = _aoScope
      ? _aoScope.querySelector('.playlist-block-title')
      : document.querySelector('.playlist-block-title');

    return !!_aoBar;
  }

  /**
   * _resolveSetAudioOnly - the configured FIXED audio-only state of this
   * player, read from the YAML chain (defaults <- user settings <- per-player
   * control settings) resolved by _resolveVideoPlayerEffectiveOptions().
   *
   * Tri-state on purpose:
   *   true  / 'true'   -> true
   *   false / 'false'  -> false
   *   anything else    -> null  ("key absent / not configured")
   *
   * The string forms are accepted because a YAML author may quote the value
   * ("true"), which the Liquid -> JSON hand-over of the adapter carries
   * through as a string; a null return keeps such a player on the Fix #1
   * chain instead of silently reading a quoted 'false' as truthy.
   *
   * @returns {boolean|null}
   */
  function _resolveSetAudioOnly() {
    const opts = _resolveVideoPlayerEffectiveOptions();
    if (opts === null || typeof opts !== 'object') {
      return null;
    }

    const value = opts.set_audio_only;

    if (value === true  || value === 'true')  return true;
    if (value === false || value === 'false') return false;

    return null;
  }

  /**
   * _resolveAudioOnlyActive - effective audio-only state for THIS player.
   *
   * Precedence (first match wins):
   * 
   *   1. the per-player localStorage key _pid('audioOnly') — a user toggle
   *   2. the YAML chain (defaults <- settings <- control): opts.audio_only
   *   3. false (feature off)
   *
   * Read defensively: callable before the adapter has assigned any options
   * (degrades to the localStorage value or false), mirroring
   * _resolveUiElementFlags().
   *
   * Fix multiPlayer new select audio only 4
   * Precedence EXTENDED by one leading rule (see the feature note above):
   * 
   *   0. when the title-bar switch is not shown or unavailable AND the YAML
   *      chain declares set_audio_only, that value is the answer — a viewer
   *      who cannot toggle must not be governed by a stale toggle
   * 
   * Rules 1..3 below are unchanged and apply whenever rule 0 does not match,
   * which includes every configuration that does not declare the new key.
   *
   * @returns {boolean}
   */
  function _resolveAudioOnlyActive() {

    // Rule 0 — fixed state for a player without a reachable switch. Ordered
    // BEFORE the localStorage read on purpose: the persisted toggle is the
    // switch's own state, so it must not outlive the switch. Skipped (null)
    // whenever the key is absent, which keeps the original chain intact.
    //
    if (!_isAudioOnlySwitchAvailable()) {
      const _fixedAudioOnly = _resolveSetAudioOnly();
      if (_fixedAudioOnly !== null) {
        isDev && logger.debug('\n' + `audioOnly: switch unavailable — set_audio_only applies (${_fixedAudioOnly})`);
        return _fixedAudioOnly;
      }
    }

    const stored = localStorage.getItem(_pid('audioOnly'));
    if (stored !== null) {
      return (stored === 'true');
    }

    const opts = _resolveVideoPlayerEffectiveOptions();
    return !!(opts && opts.audio_only === true);
  }

  /**
   * _parseTimeToSeconds - tolerant time parser for the startAt/endAt values.
   *
   * Accepts every shape the feature can meet:
   * 
   *   - 'HH:MM:SS' / 'H:MM:SS'  (the value of an <input type="time" step="1">)
   *   - 'MM:SS'    / 'HH:MM'    (a time input without seconds, or shorthand)
   *   - plain seconds as number or numeric string ('90', 90, '90.5')
   *   - '' / null / undefined   -> null (feature not set)
   *
   * Two-part values are read as MM:SS (media offsets), which also covers the
   * HH:MM reading for offsets below one hour with identical results in the
   * common cases; YAML authors who need hours write the full 'HH:MM:SS'.
   *
   * @param  {string|number} value
   * @returns {number|null}  offset in seconds (>= 0), or null when unset/invalid
   */
  function _parseTimeToSeconds(value) {
    if (value === null || value === undefined) return null;

    if (typeof value === 'number') {
      return (isFinite(value) && value >= 0) ? value : null;
    }

    const str = String(value).trim();
    if (str === '') return null;

    if (str.indexOf(':') === -1) {
      const secs = parseFloat(str);
      return (isFinite(secs) && secs >= 0) ? secs : null;
    }

    const parts = str.split(':').map(p => p.trim());
    if (parts.length < 2 || parts.length > 3) return null;
    if (parts.some(p => p === '' || isNaN(p))) return null;

    let seconds = 0;
    if (parts.length === 3) {
      seconds = (parseInt(parts[0], 10) * 3600) + (parseInt(parts[1], 10) * 60) + parseFloat(parts[2]);
    } else {
      seconds = (parseInt(parts[0], 10) * 60) + parseFloat(parts[1]);
    }

    return (isFinite(seconds) && seconds >= 0) ? seconds : null;
  }

  /**
   * _secondsToTimeInputValue - inverse of _parseTimeToSeconds for the modal.
   *
   * Formats an offset in seconds as the 'HH:MM:SS' string an
   * <input type="time" step="1"> expects as its value. Returns '' for
   * null/unset so the input renders empty (= feature off), mirroring the
   * EXPIRY_UNLIMITED convention of the expiry-date field.
   *
   * @param  {number|null} seconds
   * @returns {string}     'HH:MM:SS' or ''
   */
  function _secondsToTimeInputValue(seconds) {
    if (seconds === null || seconds === undefined || !isFinite(seconds) || seconds < 0) {
      return '';
    }

    const total = Math.floor(seconds);
    const hh    = String(Math.floor(total / 3600)).padStart(2, '0');
    const mm    = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
    const ss    = String(total % 60).padStart(2, '0');

    return `${hh}:${mm}:${ss}`;
  }

  // ---------------------------------------------------------------------------
  // AUDIO FADE-IN (all source kinds: YouTube AND native mp3/mp4)
  //
  // New per-media / per-player option `audioFadeIn`. When set, the audio of a
  // media item does not start at the player's volume but is RAMPED UP to it,
  // exactly the way the Amplitude module's ytp plugin does it in
  // ytpFadeInAudio(params) (ytp.js):
  //
  //     const iterationSteps = { 'default': 150, 'slow': 250,
  //                              'slower':  350, 'slowest': 500 };
  //     ...
  //     ytPlayer.setVolume(0);                       // start muted
  //     setInterval(() => {                          // 1ms cycle
  //       ytPlayer.setVolume(targetVolume * (currentStep / steps));
  //       currentStep++;
  //       (currentStep > steps) && clearInterval(...);
  //     }, cycle);
  //
  // The step table below is a VERBATIM copy of the ytp table, so the four
  // speed names mean the same thing in both modules: the number of iteration
  // steps controls how long and how smooth the fade-in transition is (more
  // steps = longer, smoother fade).
  //
  // Configuration (three-layer inheritance, same as every other key):
  //
  //   1. the per-media value edited in the Edit Media Settings dialog (field
  //      "Audio Fade In") or shipped in a preloaded playlist JSON. Two values
  //      are distinguished here on purpose:
  //        ''     unset  - no per-media opinion, the YAML chain applies
  //        'off'  explicit per-media opt-out, WINS over the YAML chain
  //   2. the YAML chain resolved by _resolveVideoPlayerEffectiveOptions():
  //      defaults <- user settings (multiPlayer.yml) <- per-player control
  //      settings (multiPlayer_control.yml), key `audioFadeIn`
  //   3. no fade at all (the pre-feature behaviour)
  //
  // Tech handling: the ramp is written through the Video.js facade
  // (player.volume(), 0..1) so the control bar's volume panel follows the
  // fade, AND - when the raw YT.Player is reachable - mirrored to it with
  // setVolume(0..100), the exact call ytp.js uses. The videojs-youtube tech
  // proxies volume to the same raw call, so the second write is a harmless
  // no-op in the normal case and a safety net when the facade write is
  // dropped while the tech is being rebuilt.
  // ---------------------------------------------------------------------------

  // Iteration steps per speed - verbatim ytp.js parity (see note above).
  //
  const AUDIO_FADE_IN_STEPS = Object.freeze({
    'default':  150,
    'slow':     250,
    'slower':   350,
    'slowest':  500
  });

  // ytp.js parity: `const cycle = 1` - the interval delay of the ramp. Browsers
  // clamp nested timeouts to ~4ms, so the real fade duration is roughly
  // steps * 4ms (default ~0.6s ... slowest ~2s), the same as in ytp.
  //
  const AUDIO_FADE_IN_CYCLE_MS = 1;

  // The two "no fade" representations, kept apart by _normalizeAudioFadeInField
  // (storage) and collapsed by _normalizeAudioFadeIn (runtime).
  //
  const AUDIO_FADE_IN_UNSET = '';
  const AUDIO_FADE_IN_OFF   = 'off';

  // Failsafe timeout of the pre-arm (see _applyAudioFadeIn): if a media that
  // was silenced on 'play' never reaches 'playing' - and fires no pause, error
  // or ended either - the captured volume is written back after this delay, so
  // a stalled item can never leave the player permanently muted.
  //
  const AUDIO_FADE_IN_ARM_TIMEOUT_MS = 3000;

  /**
   * _buildAudioFadeInOptionHTML - <option> list of the Edit Media Settings
   * select, built FROM the iteration-step table so the dialog can never drift
   * away from the speeds the runtime actually knows (same idea as
   * _buildGenreOptionHTML/GENRE_OPTIONS_HTML for the tags select).
   *
   * @returns {string} option markup
   */
  function _buildAudioFadeInOptionHTML() {
    const labels = {
      'default':  'default (shortest fade)',
      'slow':     'slow',
      'slower':   'slower',
      'slowest':  'slowest (longest fade)'
    };

    let html = ''
      + `<option value="${AUDIO_FADE_IN_UNSET}">Player setting (no media override)</option>`
      + `<option value="${AUDIO_FADE_IN_OFF}">No fade-in (start at full volume)</option>`;

    Object.keys(AUDIO_FADE_IN_STEPS).forEach((key) => {
      const label = labels[key] || key;
      html += `<option value="${key}">${label} - ${AUDIO_FADE_IN_STEPS[key]} steps</option>`;
    });

    return html;
  }

  const AUDIO_FADE_IN_OPTIONS_HTML = _buildAudioFadeInOptionHTML();

  /**
   * _normalizeAudioFadeInField - STORAGE-side normalizer for the playlist
   * record and the edit dialog.
   *
   * Keeps the distinction the precedence rules need:
   *   ''      unset          - the YAML chain applies
   *   'off'   explicit off   - wins over the YAML chain
   *   speed   one of the keys of AUDIO_FADE_IN_STEPS
   *
   * Anything unknown degrades to '' (unset), never to a wrong speed.
   *
   * @param  {string|boolean|null|undefined} value
   * @returns {string} '', 'off' or a speed key
   */
  function _normalizeAudioFadeInField(value) {
    if (value === null || value === undefined) return AUDIO_FADE_IN_UNSET;
    if (value === true)  return 'default';
    if (value === false) return AUDIO_FADE_IN_OFF;

    const key = String(value).trim().toLowerCase();
    if (key === '') return AUDIO_FADE_IN_UNSET;

    if (key === 'off' || key === 'none' || key === 'no' || key === 'false') {
      return AUDIO_FADE_IN_OFF;
    }
    if (key === 'on' || key === 'yes' || key === 'true') {
      return 'default';
    }
    if (Object.prototype.hasOwnProperty.call(AUDIO_FADE_IN_STEPS, key)) {
      return key;
    }

    isDev && logger.warn('\n' + `audioFadeIn: unknown speed "${value}" - ignored (known speeds: ${Object.keys(AUDIO_FADE_IN_STEPS).join(', ')})`);
    return AUDIO_FADE_IN_UNSET;
  }

  /**
   * _normalizeAudioFadeIn - RUNTIME normalizer: yields the speed key to fade
   * with, or '' when there is no fade. The explicit 'off' of the storage layer
   * collapses to '' here - at playback time both mean "play at full volume".
   *
   * @param  {string|boolean|null|undefined} value
   * @returns {string} a key of AUDIO_FADE_IN_STEPS, or ''
   */
  function _normalizeAudioFadeIn(value) {
    const field = _normalizeAudioFadeInField(value);
    return (field === AUDIO_FADE_IN_OFF) ? AUDIO_FADE_IN_UNSET : field;
  }

  /**
   * _resolveAudioFadeIn - effective fade-in speed for ONE playlist entry.
   *
   * Precedence (first value that says ANYTHING wins), the same shape as
   * _resolveStartEndAt():
   *   1. the persisted playlist record (entry.audioFadeIn) - a non-empty
   *      value, INCLUDING the explicit 'off', is the answer
   *   2. the YAML chain (defaults <- user settings <- per-player control):
   *      opts.audioFadeIn via _resolveVideoPlayerEffectiveOptions()
   *   3. '' - no fade (pre-feature behaviour)
   *
   * Read defensively: callable before the adapter has assigned options
   * (degrades to the entry value or ''), mirroring _resolveStartEndAt() and
   * _resolveAudioOnlyActive().
   *
   * @param  {string} videoId
   * @param  {Object} playlistManagerRef - THIS instance's playlistManager
   * @returns {string} a key of AUDIO_FADE_IN_STEPS, or '' for "no fade"
   */
  function _resolveAudioFadeIn(videoId, playlistManagerRef) {
    let entry = null;
    try {
      if (playlistManagerRef && typeof playlistManagerRef.getEntry === 'function') {
        entry = playlistManagerRef.getEntry(videoId);
      }
    } catch (e) {
      isDev && logger.warn('\n' + `audioFadeIn: playlist entry lookup skipped: ${e}`);
    }

    const entryValue = (entry && entry.audioFadeIn !== undefined && entry.audioFadeIn !== null)
      ? String(entry.audioFadeIn).trim()
      : '';

    if (entryValue !== '') {
      return _normalizeAudioFadeIn(entryValue);
    }

    const opts       = _resolveVideoPlayerEffectiveOptions();
    const optsValue  = (opts && opts.audioFadeIn !== undefined && opts.audioFadeIn !== null)
      ? String(opts.audioFadeIn).trim()
      : '';

    if (optsValue !== '') {
      return _normalizeAudioFadeIn(optsValue);
    }

    return AUDIO_FADE_IN_UNSET;
  }

  /**
   * _resolveActiveAudioFadeInVideoId - id of the item the player CURRENTLY
   * holds. Same resolution order as the (closure-local) helper of
   * _applyStartEndAtPlayback(): raw YT.Player metadata -> the module's
   * playlist tracker -> per-tech data -> the creation-time id. Declared at
   * module level here because the fade-in installer is a sibling of, not a
   * part of, the playback-window installer.
   *
   * Needed for the same reason: the videojs-playlist plugin swaps sources
   * INSIDE one player, so the creation-time videoId is stale from item 2 on.
   *
   * @param  {Object} vjsPlayer
   * @param  {string} fallbackVideoId
   * @returns {string}
   */
  function _resolveActiveAudioFadeInVideoId(vjsPlayer, fallbackVideoId) {
    try {
      const ytPlayer = _resolveYouTubeRawPlayer(vjsPlayer);
      if (ytPlayer && typeof ytPlayer.getVideoData === 'function') {
        const ytData = ytPlayer.getVideoData();
        if (ytData && ytData.video_id) return ytData.video_id;
      }
    } catch (e) {
      isDev && logger.debug('\n' + `audioFadeIn: raw YT video id read skipped: ${e}`);
    }

    if (_playlistActiveVideoId) return _playlistActiveVideoId;

    try {
      if (vjsPlayer && vjsPlayer.ytVideoData && vjsPlayer.ytVideoData.video_id) {
        return vjsPlayer.ytVideoData.video_id;
      }
      if (vjsPlayer && vjsPlayer.videoData && vjsPlayer.videoData.videoId) {
        return vjsPlayer.videoData.videoId;
      }
    } catch (e) {
      isDev && logger.debug('\n' + `audioFadeIn: per-tech video id read skipped: ${e}`);
    }

    return fallbackVideoId;
  }

  /**
   * _applyAudioFadeIn - runtime enforcement of the audio fade-in.
   *
   * Installed ONCE per created player (both techs) from onReady(), right
   * beside _applyStartEndAtPlayback(), and driven by player events only:
   *
   *   'play'        PRE-ARM. Captures the current volume and silences the
   *                 player BEFORE the media is audible, so the fade has no
   *                 loud onset. Guarded by exactly the same rules as the fade
   *                 itself, and protected by a failsafe timer
   *                 (AUDIO_FADE_IN_ARM_TIMEOUT_MS) that writes the captured
   *                 volume back if 'playing' never arrives.
   *
   *   'playing'     START the ramp: steps writes of
   *                 targetVolume * (currentStep / steps) on a 1ms cycle
   *                 (ytp.js parity), the last write landing exactly on the
   *                 captured target so rounding can never leave the player
   *                 slightly quieter than before.
   *
   *   'pause'       CANCEL + restore. A pause during the ramp (user, endAt
   *   'error'       stop, media error) must never leave the volume down.
   *
   *   'ended'       CANCEL + restore AND re-arm the per-item latch, so a
   *                 replay of the same item fades in again.
   *
   *   'loadstart'   CANCEL + restore AND re-arm the latch: the plugin loaded
   *   'playlistitem' another item into this SAME player.
   *
   *   'dispose'     CANCEL without restore (the player is going away).
   *
   * ONE fade per loaded item: the latch _fadedForVideoId keeps a
   * resume-from-pause at full volume - the fade belongs to the START of a
   * media, not to every unpause. The window is re-resolved lazily at each
   * trigger point, so a per-entry edit saved in the modal takes effect on the
   * very next play without re-embedding the video.
   *
   * Multi-instance safe: every piece of state lives in this closure, so two
   * players on one page fade independently.
   *
   * @param {Object} player   - the videojs player instance
   * @param {string} videoId  - the creation-time id (fallback only)
   * @param {Object} playlistManagerRef - THIS instance's playlistManager
   */
  function _applyAudioFadeIn(player, videoId, playlistManagerRef) {
    if (!player || typeof player.on !== 'function') return;

    let _fadeInterval      = null;    // running ramp
    let _fadeTargetVolume  = null;    // volume the ramp climbs to (0..1)
    let _armedTargetVolume = null;    // volume captured by the 'play' pre-arm
    let _armedTimer        = null;    // failsafe of the pre-arm
    let _fadedForVideoId   = null;    // per-item latch
    let _expectedActiveId  = videoId || null;

    // The plugin announces the item it is switching to; the same authoritative
    // source the playback-window guard (#4) uses to detect a source swap that
    // has not settled yet.
    player.on('playlistitem', (event, item) => {
      const nextId = (item && item.videoId) ? item.videoId : null;
      if (nextId) _expectedActiveId = nextId;
    });

    const _isDisposed = () => {
      try {
        return (typeof player.isDisposed === 'function') ? !!player.isDisposed() : false;
      } catch (e) {
        return true;
      }
    };

    // Read the current volume as 0..1: Video.js facade first, raw YT.Player
    // (0..100) as fallback. null when neither answers.
    const _readVolume = () => {
      try {
        if (typeof player.volume === 'function') {
          const v = player.volume();
          if (typeof v === 'number' && isFinite(v)) {
            return Math.max(0, Math.min(1, v));
          }
        }
      } catch (e) {
        isDev && logger.debug('\n' + `audioFadeIn: facade volume read skipped: ${e}`);
      }

      try {
        const ytPlayer = _resolveYouTubeRawPlayer(player);
        if (ytPlayer && typeof ytPlayer.getVolume === 'function') {
          const raw = ytPlayer.getVolume();
          if (typeof raw === 'number' && isFinite(raw)) {
            return Math.max(0, Math.min(1, raw / 100));
          }
        }
      } catch (e) {
        isDev && logger.debug('\n' + `audioFadeIn: raw YT volume read skipped: ${e}`);
      }

      return null;
    };

    // Write a volume 0..1 through both paths (see the tech note above).
    const _writeVolume = (value) => {
      const v = Math.max(0, Math.min(1, value));

      try {
        if (typeof player.volume === 'function') player.volume(v);
      } catch (e) {
        isDev && logger.debug('\n' + `audioFadeIn: facade volume write skipped: ${e}`);
      }

      try {
        const ytPlayer = _resolveYouTubeRawPlayer(player);
        // ytp.js parity: ytPlayer.setVolume(percent)
        if (ytPlayer && typeof ytPlayer.setVolume === 'function') {
          ytPlayer.setVolume(Math.round(v * 100));
        }
      } catch (e) {
        isDev && logger.debug('\n' + `audioFadeIn: raw YT volume write skipped: ${e}`);
      }
    };

    const _clearArmTimer = () => {
      if (_armedTimer) {
        clearTimeout(_armedTimer);
        _armedTimer = null;
      }
    };

    /**
     * Stop everything the fade is doing and (optionally) put the volume back
     * where it was before the pre-arm/ramp touched it.
     *
     * @param {string}  reason  - dev log text
     * @param {boolean} restore - write the captured volume back
     */
    const _cancelFade = (reason, restore) => {
      const captured = (_fadeTargetVolume !== null) ? _fadeTargetVolume : _armedTargetVolume;

      if (_fadeInterval) {
        clearInterval(_fadeInterval);
        _fadeInterval = null;
      }
      _clearArmTimer();

      _fadeTargetVolume  = null;
      _armedTargetVolume = null;

      if (captured === null) return;

      if (restore && !_isDisposed()) {
        _writeVolume(captured);
        isDev && logger.debug('\n' + `audioFadeIn: fade cancelled (${reason}) - volume restored to ${Math.round(captured * 100)}%`);
      } else {
        isDev && logger.debug('\n' + `audioFadeIn: fade cancelled (${reason})`);
      }
    };

    /**
     * Common gate of pre-arm and ramp.
     *
     * @param  {string} activeId
     * @returns {string} the speed to fade with, or '' when nothing should happen
     */
    const _resolveFadeSpeedNow = (activeId) => {
      // mid-swap: the tech still reports the PREVIOUS item, so both the latch
      // and the resolved configuration would belong to the wrong media
      if (_expectedActiveId !== null && activeId !== _expectedActiveId) return AUDIO_FADE_IN_UNSET;

      // one fade per loaded item (a resume from pause keeps full volume)
      if (_fadedForVideoId === activeId) return AUDIO_FADE_IN_UNSET;

      const speed = _resolveAudioFadeIn(activeId, playlistManagerRef);
      if (!speed || !AUDIO_FADE_IN_STEPS[speed]) return AUDIO_FADE_IN_UNSET;

      // muted player: a ramp would be inaudible and would only fight the
      // user's own setting once unmuted
      try {
        if (typeof player.muted === 'function' && player.muted()) {
          isDev && logger.debug('\n' + `audioFadeIn: fade skipped for videoId ${activeId} - player is muted`);
          return AUDIO_FADE_IN_UNSET;
        }
      } catch (e) {
        isDev && logger.debug('\n' + `audioFadeIn: muted state read skipped: ${e}`);
      }

      return speed;
    };

    // PRE-ARM on 'play': silence the player before the first sample is audible
    const onPlayAudioFadeIn = () => {
      try {
        if (_isDisposed())            return;
        if (_fadeInterval)            return;   // ramp already running
        if (_armedTargetVolume !== null) return; // already armed

        const activeId = _resolveActiveAudioFadeInVideoId(player, videoId);
        const speed    = _resolveFadeSpeedNow(activeId);
        if (!speed) return;

        const target = _readVolume();
        if (target === null || !(target > 0)) return;   // nothing to fade to

        _armedTargetVolume = target;
        _writeVolume(0);

        _clearArmTimer();
        _armedTimer = setTimeout(() => {
          _armedTimer = null;
          if (_armedTargetVolume !== null && !_fadeInterval) {
            const captured = _armedTargetVolume;
            _armedTargetVolume = null;
            if (!_isDisposed()) _writeVolume(captured);
            isDev && logger.warn('\n' + `audioFadeIn: 'playing' never arrived after pre-arm - volume restored to ${Math.round(captured * 100)}%`);
          }
        }, AUDIO_FADE_IN_ARM_TIMEOUT_MS);

        isDev && logger.debug('\n' + `audioFadeIn: pre-armed for videoId ${activeId} at target ${Math.round(target * 100)}% (speed: ${speed})`);
      } catch (e) {
        isDev && logger.warn('\n' + `audioFadeIn: pre-arm skipped: ${e}`);
      }
    };

    // START the ramp on 'playing' (ytp.js parity, see the note above)
    const onPlayingAudioFadeIn = () => {
      try {
        if (_isDisposed()) return;
        if (_fadeInterval) return;

        const activeId = _resolveActiveAudioFadeInVideoId(player, videoId);
        const speed    = _resolveFadeSpeedNow(activeId);

        if (!speed) {
          // The pre-arm silenced a media the gate now rejects (e.g. the swap
          // settled on another item): never leave it muted.
          if (_armedTargetVolume !== null) _cancelFade('gate closed after pre-arm', true);
          return;
        }

        const steps  = AUDIO_FADE_IN_STEPS[speed];
        const target = (_armedTargetVolume !== null) ? _armedTargetVolume : _readVolume();

        _clearArmTimer();
        _armedTargetVolume = null;

        if (target === null || !(target > 0)) return;

        _fadedForVideoId  = activeId;
        _fadeTargetVolume = target;

        let currentStep = 1;

        // ytp.js parity: start muted, then climb in `steps` iterations
        _writeVolume(0);

        _fadeInterval = setInterval(() => {
          try {
            if (_isDisposed()) {
              clearInterval(_fadeInterval);
              _fadeInterval     = null;
              _fadeTargetVolume = null;
              return;
            }

            const newVolume = target * (currentStep / steps);
            _writeVolume(newVolume);
            currentStep++;

            if (currentStep > steps) {
              clearInterval(_fadeInterval);
              _fadeInterval = null;
              // land EXACTLY on the captured target (no rounding drift)
              _writeVolume(target);
              _fadeTargetVolume = null;
              isDev && logger.debug('\n' + `audioFadeIn: fade-in completed for videoId ${activeId} at ${Math.round(target * 100)}%`);
            }
          } catch (e) {
            clearInterval(_fadeInterval);
            _fadeInterval = null;
            if (_fadeTargetVolume !== null && !_isDisposed()) _writeVolume(_fadeTargetVolume);
            _fadeTargetVolume = null;
            isDev && logger.warn('\n' + `audioFadeIn: fade-in aborted: ${e}`);
          }
        }, AUDIO_FADE_IN_CYCLE_MS);

        isDev && logger.info('\n' + `audioFadeIn: fade-in started for videoId ${activeId} (speed: ${speed}, steps: ${steps}, target: ${Math.round(target * 100)}%)`);
      } catch (e) {
        isDev && logger.warn('\n' + `audioFadeIn: fade-in start skipped: ${e}`);
      }
    };

    // re-arm the per-item latch: a new source, or a replay of this one
    const _rearmAudioFadeIn = (reason) => {
      _cancelFade(reason, true);
      _fadedForVideoId = null;
    };

    player.on('play',         onPlayAudioFadeIn);
    player.on('playing',      onPlayingAudioFadeIn);
    player.on('pause',        () => _cancelFade('pause', true));
    player.on('error',        () => _cancelFade('media error', true));
    player.on('ended',        () => _rearmAudioFadeIn('media ended'));
    player.on('loadstart',    () => _rearmAudioFadeIn('source loaded'));
    player.on('playlistitem', () => _rearmAudioFadeIn('playlist item changed'));
    player.on('dispose',      () => _cancelFade('player disposed', false));

    isDev && logger.debug('\n' + `audioFadeIn: handlers installed for videoId ${videoId}`);
  }

  // Fix J1 multiPlayer #6
  // The "endAt beyond media duration" diagnostic below (#3) fires from
  // _resolveStartEndAt(), which is BY DESIGN re-resolved lazily on every
  // trigger point (each endAt watchdog tick, each startAt one-shot). The
  // diagnostic therefore repeated on every tick and flooded the console
  // ("multiple warning messages"). The condition is per-entry data, not
  // per-tick state, so warn ONCE per videoId. The set is keyed by videoId
  // only (not by the stored duration): after the #6 root-cause repair a
  // once-corrupted duration is healed on the entry's next play, and a
  // still-warned id simply stays quiet - the single warning already said
  // everything there is to say about that entry.
  const _playbackWindowDurationWarnedIds = new Set();

  /**
   * Fix multiPlayer for new startAt/endAt params #1
   * _resolveStartEndAt - effective playback window for ONE playlist entry.
   *
   * Precedence (first non-empty wins), matching the module's established
   * three-layer YAML chain plus the per-entry edit dialog:
   *   1. the persisted playlist record (entry.startAt / entry.endAt), i.e.
   *      the per-media values edited in the Edit Media Settings modal or
   *      shipped in a preloaded playlist JSON
   *   2. the YAML chain (defaults <- user settings <- per-player control):
   *      opts.startAt / opts.endAt via _resolveVideoPlayerEffectiveOptions()
   *   3. null (feature off)
   *
   * Sanity: when both resolve and endAt <= startAt the endAt value is
   * dropped (with a dev warning) - a window that can never play is treated
   * as a configuration mistake, not enforced.
   *
   * Read defensively: callable before the adapter has assigned options
   * (degrades to the entry values or null), mirroring _resolveAudioOnlyActive().
   *
   * @param  {string} videoId
   * @param  {Object} playlistManagerRef - THIS instance's playlistManager
   * @returns {{startAt: (number|null), endAt: (number|null)}}
   */
  function _resolveStartEndAt(videoId, playlistManagerRef) {
    let entry = null;
    try {
      if (playlistManagerRef && typeof playlistManagerRef.getEntry === 'function') {
        entry = playlistManagerRef.getEntry(videoId);
      }
    } catch (e) {
      // Fix J1 multiPlayer #3
      // "startEndAt" was never an API, config key or data field - a grep shows
      // all of its occurrences were the prefix of these log strings, i.e. a
      // made-up label for "the startAt/endAt window". Nothing read it, so it
      // only made the console output confusing (a stop was reported by a
      // message beginning with "start"). Renamed to `playbackWindow`, which is
      // what the feature actually is.
      // Original (deprecated, preserved for reference):
      // isDev && logger.warn('\n' + `startEndAt: playlist entry lookup skipped: ${e}`);
      isDev && logger.warn('\n' + `playbackWindow: playlist entry lookup skipped: ${e}`);
    }

    const opts = _resolveVideoPlayerEffectiveOptions();

    let startAt = _parseTimeToSeconds(entry && entry.startAt);
    if (startAt === null) startAt = _parseTimeToSeconds(opts && opts.startAt);

    let endAt = _parseTimeToSeconds(entry && entry.endAt);
    if (endAt === null) endAt = _parseTimeToSeconds(opts && opts.endAt);

    if (startAt !== null && endAt !== null && endAt <= startAt) {
      // Fix J1 multiPlayer #3
      // Original (deprecated, preserved for reference):
      // isDev && logger.warn('\n' + `startEndAt: endAt (${endAt}s) <= startAt (${startAt}s) for videoId ${videoId} - endAt ignored`);
      isDev && logger.warn('\n' + `playbackWindow: endAt (${endAt}s) <= startAt (${startAt}s) for videoId ${videoId} - endAt ignored`);
      endAt = null;
    }

    // Fix J1 multiPlayer #3
    // Diagnostic for a data problem that is indistinguishable from the bug
    // this fix series repairs: an endAt BEYOND the media length can never be
    // reached, so the video plays to its natural end and the feature looks
    // broken. The shipped demo playlist has exactly this case - item 2
    // ("2 - Lady Lady") carries endAt 00:03:26 (206s) while the entry's own
    // duration is 196s. Warn instead of silently doing nothing; the window is
    // left untouched, because duration may still be 0/unknown at this point
    // (it is filled in later on 'durationchange') and must not gate playback.
    // Fix J1 multiPlayer #6
    // Original (deprecated, preserved for reference):
    // if (endAt !== null && entry && isFinite(entry.duration) && entry.duration > 0 && endAt >= entry.duration) {
    //   isDev && logger.warn('\n' + `playbackWindow: endAt (${endAt}s) is at or beyond the media duration (${entry.duration}s) for videoId ${videoId} - it can never be reached, check the playlist entry`);
    // }
    // Warn once per videoId (see _playbackWindowDurationWarnedIds above).
    // NOTE the wording is kept, plus a hint that entry.duration is the STORED
    // value: before #6 it could have been corrupted by a cross-entry write
    // (see doPostOnPlaying), i.e. the warning can indicate a stale record,
    // not necessarily a playlist authoring error.
    if (endAt !== null && entry && isFinite(entry.duration) && entry.duration > 0 && endAt >= entry.duration && !_playbackWindowDurationWarnedIds.has(videoId)) {
      _playbackWindowDurationWarnedIds.add(videoId);
      isDev && logger.warn('\n' + `playbackWindow: endAt (${endAt}s) is at or beyond the STORED media duration (${entry.duration}s) for videoId ${videoId} - if the real video is longer, the stored duration is stale and is re-measured on the entry's next play; otherwise check the playlist entry`);
    }

    return { startAt: startAt, endAt: endAt };
  }

  /**
   * Fix multiPlayer for new startAt/endAt params #1
   * _applyStartEndAtPlayback - runtime enforcement of the playback window.
   *
   * Installed once per created player (both techs, YouTube and native) from
   * onReady(), AFTER the existing resume-position handlers:
   *
   *   startAt - a one-shot on the first 'playing' event, deferred to 400ms
   *     so it runs AFTER the resume seek (250ms one-shot of the existing
   *     handlers). It then clamps INTO the window: when the current position
   *     lies before startAt (fresh start, or a stale resume position outside
   *     the window) the player seeks to startAt; a legitimate resume position
   *     inside [startAt, endAt) is left untouched - resume keeps winning.
   *
   *   endAt - a 'timeupdate' watchdog. Reaching endAt pauses the player and
   *     triggers 'ended' on it; the trigger travels through the existing
   *     vjsStateEventMap wiring into onStateChange, so ALL established
   *     end-of-media behaviour (position reset to 0, loop-mode advance to
   *     the next playlist item) runs exactly as for a natural media end.
   *     The one-shot flag re-arms when the user seeks back before endAt,
   *     so replaying the window works without recreating the player.
   *
   * The window is re-resolved lazily on each trigger point (not captured at
   * install time) so a per-entry edit saved in the modal takes effect on the
   * very next play without re-embedding the video.
   *
   * @param {Object} player   - the videojs player instance
   * @param {string} videoId  - id the resume/position handlers use
   * @param {Object} playlistManagerRef - THIS instance's playlistManager
   */
  function _applyStartEndAtPlayback(player, videoId, playlistManagerRef) {
    if (!player || typeof player.on !== 'function') return;

    // Fix J1 multiPlayer #3
    // ROOT CAUSE 1 of "endAt works for YouTube videos only once":
    // this function is called EXACTLY ONCE per created player (from onReady)
    // and closes over `videoId` - the id the player was CREATED with. The
    // videojs-playlist plugin, however, swaps sources INSIDE the same player
    // for prev/next (nextPrevButtons/skipButtons), autoadvance, playlist-ui
    // clicks and currentItem(); the player is never disposed. The module's
    // own #23 note states it plainly: "player.videoData / player.ytVideoData
    // are not refreshed on these in-player source swaps". Every later item was
    // therefore measured against the FIRST item's startAt/endAt.
    //
    // With the shipped demo playlist that is exactly the reported symptom:
    // item 1 endAt 00:03:30 (210s) stops correctly, then 210s is carried over
    // to item 2 (196s long) and item 3 (195s long), where it can never be
    // reached - so endAt appears to fire "only once".
    //
    // _resolveActivePlaybackVideoId() re-resolves the id of the video that is
    // CURRENTLY loaded, at every trigger point, using the most authoritative
    // source available first:
    //   1. the raw YT.Player's own getVideoData().video_id - per-player,
    //      always current, unaffected by the stale per-tech metadata above
    //   2. _playlistActiveVideoId - the #23 tracker fed by 'playlistitem',
    //      the established module answer for plugin-driven item changes
    //   3. the per-tech metadata (player.ytVideoData / player.videoData),
    //      correct while no in-player swap has happened yet
    //   4. the captured creation-time id (previous behaviour, last resort)
    //
    // @param  {Object} vjsPlayer
    // @param  {string} fallbackVideoId - the creation-time id
    // @returns {string}
    const _resolveActivePlaybackVideoId = (vjsPlayer, fallbackVideoId) => {
      try {
        const ytPlayer = _resolveYouTubeRawPlayer(vjsPlayer);
        if (ytPlayer && typeof ytPlayer.getVideoData === 'function') {
          const ytData = ytPlayer.getVideoData();
          if (ytData && ytData.video_id) return ytData.video_id;
        }
      } catch (e) {
        isDev && logger.debug('\n' + `playbackWindow: raw YT video id read skipped: ${e}`);
      }

      if (_playlistActiveVideoId) return _playlistActiveVideoId;

      try {
        if (vjsPlayer.ytVideoData && vjsPlayer.ytVideoData.video_id) {
          return vjsPlayer.ytVideoData.video_id;
        }
        if (vjsPlayer.videoData && vjsPlayer.videoData.videoId) {
          return vjsPlayer.videoData.videoId;
        }
      } catch (e) {
        isDev && logger.debug('\n' + `playbackWindow: per-tech video id read skipped: ${e}`);
      }

      return fallbackVideoId;
    };

    // Fix J1 multiPlayer #3
    // ROOT CAUSE 4 of "the video should stop and not even start anything":
    // the #2 implementation ended the window with
    //   player.pause(); player.trigger('ended');
    // to reuse "the standard end-of-media path". But 'ended' is a PUBLIC
    // player event with other subscribers, so that synthetic trigger does not
    // stop playback - it STARTS the next one:
    //   - vjsPlayer.playlist.autoadvance(delay), installed in onReady when
    //     plugins.playlist.autoadvance is set, loads and plays the NEXT item
    //   - the module's own loop mode in onStateChange calls embedRunVideo()
    //     on the next item, which REBUILDS the player
    // Both can react to the same synthetic event, so the "stop" turned into
    // one (or two racing) starts. It also persisted lastPosition = 0 for the
    // entry, so a later resume restarted the video from the beginning.
    //
    // _stopAtEndAt() makes endAt mean what it says: pause, stay put, announce
    // nothing. Continuous playback is preserved where it was actually asked
    // for - when loop mode is genuinely enabled (loopConfigEnabled AND the
    // user's playlistLoop toggle) the standard end-of-media path is still
    // taken, byte-identically to a natural end. With loop mode off (the
    // default) the player simply stops at endAt.
    //
    // @param {Object} vjsPlayer
    // @param {string} activeId - the CURRENTLY loaded video id
    // @param {number} endAtSec
    // @param {string} techLabel - 'YT' or '' (log wording only)
    const _stopAtEndAt = (vjsPlayer, activeId, endAtSec, techLabel) => {
      vjsPlayer.pause();

      const loopActive = !!(loopConfigEnabled && playlistManagerRef && playlistManagerRef._loopEnabled);

      if (loopActive) {
        // Loop mode is ON: the user asked for continuous playback, so route
        // through the standard end-of-media path exactly as #1/#2 did.
        vjsPlayer.trigger('ended');
        isDev && logger.info('\n' + `playbackWindow: ${techLabel}video id ${activeId} reached endAt ${endAtSec}s - loop mode advances`);
        return;
      }

      // Fix J1 multiPlayer #5
      // ROOT CAUSE of "the plugin's autoadvance does not advance anymore":
      // the #3 "stop means stop" rule above recognises exactly ONE request
      // for continuous playback - the module's own loop toggle. But the
      // videojs-playlist plugin's autoadvance (onReady:
      // `if (piPlaylist.autoadvance) vjsPlayer.playlist.autoadvance(delay)`)
      // is a SECOND, independent such request, and it is driven purely by
      // the player's 'ended' event (core.js setup():
      // `player.one('ended', autoadvance_.trigger)` -> timeout ->
      // `playlist.next()`). A natural media end fires that event, so
      // autoadvance kept working there - but an endAt stop, since #3,
      // deliberately announces nothing. The plugin's armed one-shot never
      // hears an 'ended', its timeout is never scheduled, and playback dies
      // at the first configured end-position: the pre-#3 behaviour (where
      // the synthetic 'ended' was unconditional) regressed for exactly the
      // autoadvance-without-loop configuration.
      //
      // Treat an ARMED, ACTIONABLE plugin autoadvance as what it is - an
      // explicit ask for continuous playback - and route through the same
      // standard end-of-media path as the loop branch above: the synthetic
      // 'ended' reaches (a) the plugin's one('ended') trigger, which
      // advances IN-PLAYER after its configured delay, and (b) onStateChange
      // via the vjsStateEventMap wiring, where the position-reset runs and
      // the module loop path stays quiet (loop is off in this branch; and
      // even with loop on, the #5 guard in onStateChange now yields to the
      // plugin - see there). The #4 mid-swap guard covers the swap window
      // that follows, exactly as for a loop-mode advance.
      //
      // The stored position is reset FIRST, keyed by the resolved activeId -
      // not left to the onStateChange 'ended' handler, whose per-tech
      // metadata id can be stale after earlier in-player swaps (#23 note) -
      // so a later manual replay of this entry starts from the window start.
      //
      // On the LAST playlist item _pluginWillAutoadvance() answers false
      // (playlist.next() would be a no-op), and the established hard stop
      // below runs unchanged - no dead synthetic 'ended', no lost stop.
      if (_pluginWillAutoadvance(vjsPlayer)) {
        try {
          if (playlistManagerRef && typeof playlistManagerRef.updateEntryPosition === 'function') {
            playlistManagerRef.updateEntryPosition(activeId, 0);
          }
        } catch (e) {
          isDev && logger.warn('\n' + `playbackWindow: position reset skipped: ${e}`);
        }

        vjsPlayer.trigger('ended');
        isDev && logger.info('\n' + `playbackWindow: ${techLabel}video id ${activeId} reached endAt ${endAtSec}s - plugin autoadvance takes over`);
        return;
      }
      // END Fix J1 multiPlayer #5

      // Loop mode is OFF: hard stop. Nothing is triggered, nothing advances.
      // Reset the stored position so the NEXT play replays the whole window
      // from startAt instead of resuming at endAt (the 'ended' path used to
      // do this implicitly; keep the behaviour without the side effects).
      try {
        if (playlistManagerRef && typeof playlistManagerRef.updateEntryPosition === 'function') {
          playlistManagerRef.updateEntryPosition(activeId, 0);
        }
      } catch (e) {
        isDev && logger.warn('\n' + `playbackWindow: position reset skipped: ${e}`);
      }

      isDev && logger.info('\n' + `playbackWindow: ${techLabel}video id ${activeId} stopped at configured endAt ${endAtSec}s`);
    };

    // Fix J1 multiPlayer #3
    // ROOT CAUSE 3 of "only once": _endAtFired below is a single boolean per
    // PLAYER, and its only re-arm rule is `pos < endAt - 1.5`. Because the
    // watchdog pauses the player exactly AT endAt, the position never drops
    // below that threshold again, and nothing reset the flag on a source
    // swap. After the first stop the watchdog was dead for the whole life of
    // the player. _endAtFiredFor holds the video id the latch fired for
    // (null = armed), so it re-arms automatically as soon as another item is
    // loaded, and the explicit re-arm points below cover a replay of the
    // SAME item.
    let _endAtFiredFor = null;

    const _rearmEndAt = (reason) => {
      if (_endAtFiredFor !== null) {
        isDev && logger.debug('\n' + `playbackWindow: endAt watchdog re-armed (${reason})`);
      }
      _endAtFiredFor = null;
    };

    // A plugin-driven source swap keeps this player alive, so re-arm the
    // latch (and the native startAt one-shot) for the newly loaded item.
    player.on('loadstart', () => _rearmEndAt('loadstart'));
    player.on('playlistitem', () => _rearmEndAt('playlistitem'));

    // Fix J1 multiPlayer #4
    // ROOT CAUSE of "endAt is lost for the item the playlist plugin loads on
    // autoadvance": a race in the SWAP WINDOW that #3 itself opened.
    //
    // When the videojs-playlist plugin advances (autoadvance, prev/next,
    // currentItem()), it swaps the source INSIDE this player. The two events
    // above fire IMMEDIATELY and re-arm the endAt latch — but the raw
    // YT.Player settles on the new video only ASYNCHRONOUSLY
    // (youtube.js: setSrc -> cueVideoById_/loadVideoById_ on the SAME
    // YT.Player; the IFrame API needs a moment to load the new id). Until it
    // settles, _resolveActivePlaybackVideoId() still resolves the PREVIOUS
    // video — its priority-1 source, ytPlayer.getVideoData().video_id, keeps
    // reporting the old id — and getCurrentTime() still reports the old
    // position, which is parked EXACTLY AT that video's endAt (the watchdog
    // pauses there).
    //
    // The next 500ms watchdog tick inside that window therefore sees:
    //   activeId = OLD video, latch = re-armed (null), pos >= OLD endAt
    // and fires _stopAtEndAt() a SECOND time for the item that already
    // stopped. The spurious fire pauses the just-started next item and — in
    // loop mode — triggers another synthetic 'ended', which makes the plugin
    // autoadvance a second time: the next item is SKIPPED, so its endAt is
    // never evaluated. A timed simulation of the autoadvance sequence
    // reproduces the cascade with the #3 code and shows the shipped demo
    // playlist jumping from item 1 straight over item 2.
    //
    // Fix: track the video id the player is EXPECTED to hold —
    // seeded with the creation-time id, updated from the plugin's
    // 'playlistitem' event hash (the same authoritative source the #23
    // active-item tracker uses) — and treat any tick/handler run whose
    // RESOLVED id differs from the expectation as "mid swap": skip it.
    // Enforcement resumes automatically on the first tick after the raw
    // player reports the expected id; the existing 'item changed' rule then
    // re-arms the latch for the new item as designed. Native techs resolve
    // via the #23 tracker, which is updated by the SAME 'playlistitem'
    // event, so expectation and resolution can only diverge for the async
    // YouTube tech — the guard is a no-op for mp3/mp4 sources.
    let _expectedActiveVideoId = videoId || null;

    // Fix J1 multiPlayer #4
    // Video.js passes the trigger hash as the handler's 2nd argument; the
    // item object carries the J1 `videoId` copied through by
    // mapVideoPlayerPlaylist (see the #23 wiring in onReady).
    player.on('playlistitem', (event, item) => {
      const nextId = (item && item.videoId) ? item.videoId : null;
      if (nextId) {
        _expectedActiveVideoId = nextId;
        isDev && logger.debug('\n' + `playbackWindow: expected active video follows plugin to videoId: ${nextId}`);
      }
    });

    // Fix J1 multiPlayer #4
    // TRUE while the id the tech ACTUALLY reports differs from the id the
    // player is EXPECTED to hold — i.e. while a plugin-driven source swap
    // has not settled yet. Watchdogs and startAt handlers must not act on
    // the stale id in that window.
    //
    // @param  {string} resolvedId - _resolveActivePlaybackVideoId() result
    // @returns {boolean}
    //
    const _isMidSwap = (resolvedId) => {
      return (_expectedActiveVideoId !== null && resolvedId !== _expectedActiveVideoId);
    };

    // Fix multiPlayer start video at startAt #1
    // =========================================================================
    // DARK START runtime - installed here, inside _applyStartEndAtPlayback(),
    // because everything this feature needs already exists in this closure and
    // must NOT be duplicated:
    //
    //   _resolveStartEndAt()            the effective window (entry <- YAML)
    //   _resolveActivePlaybackVideoId() the id of the item CURRENTLY loaded
    //   _expectedActiveVideoId          the id the plugin is swapping TO
    //   _isMidSwap()                    the #4 stale-id guard
    //   _resolveYouTubeRawPlayer()      the raw YT.Player for exact positions
    //
    // Lifecycle:
    //   enter  - on 'play' (playback requested, before the first frame is
    //            painted) and on every plugin-driven source swap ('loadstart',
    //            'playlistitem'), which re-evaluates for the NEW item
    //   leave  - as soon as the effective position reaches the target, i.e.
    //            when the deferred startAt seek of the #1/#2 handlers has
    //            LANDED; plus on 'ended', 'error' and 'dispose'
    //
    // The reveal is driven by an own short-interval poll rather than by
    // 'timeupdate': the YouTube tech only relays 'timeupdate' synthetically
    // (the exact reason the #2 handlers poll the raw player at 500ms), and a
    // 500ms granularity would leave the surface dark for up to half a second
    // AFTER the window has started. The poll reads the raw YT.Player when it
    // is available and the Video.js facade otherwise, and it exists ONLY while
    // the surface is dark - it is cleared the moment the video is revealed.
    //
    // The safety timeout is the important part of the design: nothing that can
    // fail (a seek rejected by the tech, a startAt beyond the media duration, a
    // never-buffering source, a paused player) may leave the viewer looking at
    // a permanently black player. When it expires the video is revealed with a
    // dev warning, and playback continues exactly as it would have without
    // this feature.
    //
    let _startAtDarkActive     = false;
    let _startAtDarkForId      = null;
    let _startAtDarkTarget     = null;

    // The dark start belongs to the START of an item, not to every 'play'.
    // Without this latch a user who pauses, seeks BACK before startAt and
    // presses play again would darken the surface a second time - but the
    // native startAt one-shot is already spent at that point, so no seek
    // would follow and the surface would stay dark until the safety timeout.
    // The latch holds the id the dark cycle has already completed for; it is
    // cleared on every source load, so a replay of the SAME item (plugin swap,
    // playlist selection) darkens again as designed.
    //
    let _startAtDarkDoneForId  = null;
    let _startAtDarkPollId     = null;
    let _startAtDarkSafetyId   = null;
    let _startAtDarkPosterSet  = false;   // TRUE only when WE wrote player.poster()
    let _startAtDarkPosterPrev = '';

    // Reveal tolerance: techs report positions in coarse steps and a seek may
    // land marginally short of the requested offset; without a tolerance the
    // surface could stay dark although the window has effectively started.
    //
    const STARTAT_DARK_TOLERANCE   = 0.25;   // seconds
    const STARTAT_DARK_POLL_MS     = 100;    // reveal granularity
    const STARTAT_DARK_MAX_WAIT_MS = 8000;   // hard cap, see the note above

    // Effective playback position, raw player first (ytp parity: the facade's
    // currentTime() is a synthetic relay for the YouTube tech).
    //
    const _startAtDarkPosition = () => {
      try {
        const ytPlayer = _resolveYouTubeRawPlayer(player);
        if (ytPlayer && typeof ytPlayer.getCurrentTime === 'function') {
          return ytPlayer.getCurrentTime() || 0;
        }
      } catch (e) {
        isDev && logger.debug('\n' + `startAtDark: raw position read skipped: ${e}`);
      }

      try {
        if (typeof player.currentTime === 'function') {
          return player.currentTime() || 0;
        }
      } catch (e) {
        isDev && logger.debug('\n' + `startAtDark: position read skipped: ${e}`);
      }

      return 0;
    };

    // Reveal the video surface and drop every resource the dark state holds.
    // Idempotent: safe to call from any number of events, in any order.
    //
    const _leaveStartAtDark = (reason) => {
      if (_startAtDarkPollId) {
        clearInterval(_startAtDarkPollId);
        _startAtDarkPollId = null;
      }
      if (_startAtDarkSafetyId) {
        clearTimeout(_startAtDarkSafetyId);
        _startAtDarkSafetyId = null;
      }

      if (!_startAtDarkActive) return;

      _startAtDarkActive = false;

      try {
        if (typeof player.removeClass === 'function') {
          player.removeClass(STARTAT_DARK_CLASS);
        }
      } catch (e) {
        isDev && logger.warn('\n' + `startAtDark: class removal skipped: ${e}`);
      }

      // Restore the poster ONLY when this feature assigned one - a poster the
      // player was created with is left untouched.
      //
      if (_startAtDarkPosterSet) {
        try {
          player.poster(_startAtDarkPosterPrev);
        } catch (e) {
          isDev && logger.warn('\n' + `startAtDark: poster restore skipped: ${e}`);
        }
        _startAtDarkPosterSet  = false;
        _startAtDarkPosterPrev = '';
      }

      isDev && logger.info('\n' + `startAtDark: video id ${_startAtDarkForId} revealed (${reason})`);

      _startAtDarkDoneForId = _startAtDarkForId;
      _startAtDarkForId     = null;
      _startAtDarkTarget    = null;
    };

    // Darken the surface when the item about to play has a startAt window and
    // the playhead is still before it. Every early return below is a case in
    // which there is nothing to hide.
    const _enterStartAtDark = (trigger) => {
      try {
        if (_startAtDarkActive) return;

        if (typeof player.isDisposed === 'function' && player.isDisposed()) return;

        // AUDIO ONLY already owns this surface (tech hidden, poster shown
        // permanently by audioPosterMode). Two owners would fight over the
        // same elements, and there is no video to hide in the first place.
        try {
          if (_resolveAudioOnlyActive()) {
            isDev && logger.debug('\n' + 'startAtDark: skipped - AUDIO ONLY owns the surface');
            return;
          }
        } catch (e) {
          isDev && logger.debug('\n' + `startAtDark: audio-only probe skipped: ${e}`);
        }

        // Prefer the id the player is EXPECTED to hold: at 'play' / 'loadstart'
        // time the tech may still report the PREVIOUS item (the #4 swap
        // window), and the window of the wrong item must not be applied. When
        // 'playlistitem' has not updated the expectation yet, the swap handlers
        // below re-evaluate on that event.
        const targetId = _expectedActiveVideoId
          ? _expectedActiveVideoId
          : _resolveActivePlaybackVideoId(player, videoId);

        // This item's dark start has already run (see the latch note above):
        // a later 'play' within the same item is a resume, not a start.
        if (_startAtDarkDoneForId !== null && _startAtDarkDoneForId === targetId) {
          isDev && logger.debug('\n' + `startAtDark: skipped - dark start already completed for videoId ${targetId}`);
          return;
        }

        const win = _resolveStartEndAt(targetId, playlistManagerRef);

        // No window configured -> byte-identical behaviour to before this fix.
        if (win.startAt === null || !(win.startAt > 0)) return;

        // Resume position already inside the window: nothing to skip, so the
        // viewer must see the video immediately (resume keeps winning, the
        // established rule of the #1/#2 startAt handlers).
        const pos = _startAtDarkPosition();
        if (pos >= (win.startAt - STARTAT_DARK_TOLERANCE)) {
          isDev && logger.debug('\n' + `startAtDark: skipped - position ${pos}s already inside the window of videoId ${targetId}`);
          return;
        }

        _ensureStartAtDarkStyles();

        // The PosterImage needs a URL to be visible at all. Write one only
        // when the player carries none, and remember that we did so.
        try {
          const currentPoster = (typeof player.poster === 'function') ? (player.poster() || '') : '';
          if (!currentPoster) {
            const resolved = _resolveStartAtDarkPoster(targetId, player, playlistManagerRef);
            if (resolved) {
              _startAtDarkPosterPrev = currentPoster;
              _startAtDarkPosterSet  = true;
              player.poster(resolved);
              isDev && logger.debug('\n' + `startAtDark: poster assigned for videoId ${targetId}: ${resolved}`);
            }
          }
        } catch (e) {
          isDev && logger.warn('\n' + `startAtDark: poster assignment skipped: ${e}`);
        }

        try {
          if (typeof player.addClass === 'function') {
            player.addClass(STARTAT_DARK_CLASS);
          }
        } catch (e) {
          isDev && logger.warn('\n' + `startAtDark: class assignment skipped: ${e}`);
          return;
        }

        _startAtDarkActive = true;
        _startAtDarkForId  = targetId;
        _startAtDarkTarget = win.startAt;

        isDev && logger.info('\n' + `startAtDark: video id ${targetId} darkened until startAt ${win.startAt}s (${trigger})`);

        // Reveal poll - the only thing that ends the dark state in the normal
        // case, i.e. when the deferred startAt seek has landed.
        _startAtDarkPollId = setInterval(() => {
          try {
            if (typeof player.isDisposed === 'function' && player.isDisposed()) {
              _leaveStartAtDark('player disposed');
              return;
            }

            // The item changed under us without a swap event reaching this
            // handler: never keep a previous item's dark state alive.
            const nowId = _resolveActivePlaybackVideoId(player, videoId);
            if (!_isMidSwap(nowId) && nowId !== _startAtDarkForId) {
              _leaveStartAtDark('item changed');
              return;
            }

            const nowPos = _startAtDarkPosition();
            if (nowPos >= (_startAtDarkTarget - STARTAT_DARK_TOLERANCE)) {
              _leaveStartAtDark(`startAt ${_startAtDarkTarget}s reached at ${nowPos}s`);
            }
          } catch (e) {
            _leaveStartAtDark(`reveal poll error: ${e}`);
          }
        }, STARTAT_DARK_POLL_MS);

        // Hard cap - a black player is never an acceptable end state.
        _startAtDarkSafetyId = setTimeout(() => {
          if (_startAtDarkActive) {
            isDev && logger.warn('\n' + `startAtDark: startAt ${_startAtDarkTarget}s not reached within ${STARTAT_DARK_MAX_WAIT_MS}ms for videoId ${_startAtDarkForId} - revealing the video (check the configured startAt against the media duration)`);
            _leaveStartAtDark('safety timeout');
          }
        }, STARTAT_DARK_MAX_WAIT_MS);
      } catch (e) {
        isDev && logger.warn('\n' + `startAtDark: enter skipped: ${e}`);
        _leaveStartAtDark(`enter error: ${e}`);
      }
    };

    // A plugin-driven source swap keeps this player alive: drop the dark state
    // of the OLD item and re-evaluate for the new one. Both events are wired
    // for the same reason the #3 re-arm points are wired for both - whichever
    // fires with the updated expectation applies the correct window, and
    // _enterStartAtDark() is a no-op while the state is already active.
    const _restartStartAtDark = (trigger) => {
      _leaveStartAtDark(`${trigger} - re-evaluating`);
      // A fresh source load re-arms the dark start, also for the SAME item
      // (replay from the playlist, loop mode, plugin autoadvance back).
      _startAtDarkDoneForId = null;
      _enterStartAtDark(trigger);
    };

    player.on('play',         () => _enterStartAtDark('play'));
    player.on('loadstart',    () => _restartStartAtDark('loadstart'));
    player.on('playlistitem', () => _restartStartAtDark('playlistitem'));
    player.on('ended',        () => _leaveStartAtDark('media ended'));
    player.on('error',        () => _leaveStartAtDark('media error'));
    player.on('dispose',      () => _leaveStartAtDark('player disposed'));

    // startAt: clamp into the window on first playback
    const onFirstPlayingStartAt = () => {
      player.off('playing', onFirstPlayingStartAt);

      setTimeout(() => {
        try {
          // Fix multiPlayer for new startAt/endAt params #2
          // YouTube sources are enforced ytp-style on the RAW YT.Player by
          // the #2 handlers installed below (per-'playing' seekTo, ytp.js
          // parity). Hand over to avoid a duplicate seek to the same target
          // through the Video.js facade; native techs (resolver yields
          // null) fall through unchanged into the original #1 logic.
          if (_resolveYouTubeRawPlayer(player)) return;
          // END Fix multiPlayer for new startAt/endAt params #2

          // Fix J1 multiPlayer #3
          // Resolve the CURRENTLY loaded item (root cause 1) instead of the
          // creation-time id, and log under the honest `playbackWindow` name.
          // Original (deprecated, preserved for reference):
          // const win = _resolveStartEndAt(videoId, playlistManagerRef);
          const activeId = _resolveActivePlaybackVideoId(player, videoId);

          // Fix J1 multiPlayer #4
          // Mid-swap: the tech still reports the PREVIOUS item (see the
          // _expectedActiveVideoId note). Seeking now would act on the wrong
          // video. This handler is a ONE-SHOT that already removed itself, so
          // re-attach it before bailing out — the settled new source fires
          // 'playing' again and the shot runs against the correct item.
          if (_isMidSwap(activeId)) {
            player.on('playing', onFirstPlayingStartAt);
            isDev && logger.debug('\n' + `playbackWindow: startAt one-shot deferred (source swap to ${_expectedActiveVideoId} not settled)`);
            return;
          }

          const win = _resolveStartEndAt(activeId, playlistManagerRef);
          if (win.startAt === null) return;

          const pos = (typeof player.currentTime === 'function') ? (player.currentTime() || 0) : 0;

          const beforeWindow = (pos < win.startAt);
          const afterWindow  = (win.endAt !== null && pos >= win.endAt);

          if (beforeWindow || afterWindow) {
            player.currentTime(win.startAt);
            // Fix J1 multiPlayer #3
            // Original (deprecated, preserved for reference):
            // isDev && logger.info('\n' + `startEndAt: video id ${videoId} started at configured startAt ${win.startAt}s`);
            isDev && logger.info('\n' + `playbackWindow: video id ${activeId} started at configured startAt ${win.startAt}s`);
          }
        } catch (e) {
          // Fix J1 multiPlayer #3
          // Original (deprecated, preserved for reference):
          // isDev && logger.warn('\n' + `startEndAt: startAt seek skipped: ${e}`);
          isDev && logger.warn('\n' + `playbackWindow: startAt seek skipped: ${e}`);
        }
      }, 400);
    };
    player.on('playing', onFirstPlayingStartAt);

    // Fix J1 multiPlayer #3
    // The #1 startAt handler is a ONE-SHOT (it removes itself on the first
    // 'playing'). That is correct per item, but the plugin loads every later
    // item into this SAME player, so from item 2 on no startAt was applied at
    // all. Re-attach the one-shot whenever a new source is loaded; off()
    // first keeps it idempotent when both events fire for one swap.
    const _reattachStartAtOneShot = () => {
      player.off('playing', onFirstPlayingStartAt);
      player.on('playing', onFirstPlayingStartAt);
    };
    player.on('loadstart', _reattachStartAtOneShot);
    player.on('playlistitem', _reattachStartAtOneShot);

    // endAt: watchdog that converts reaching endAt into a regular media end
    let _endAtFired = false;

    player.on('timeupdate', () => {
      try {
        // Fix multiPlayer for new startAt/endAt params #2
        // YouTube sources are enforced ytp-style by the 500ms raw-player
        // polling interval installed below (ytp.js checkOnVideoEnd parity);
        // the synthetic 'timeupdate' relay of the videojs-youtube tech is
        // not reliable enough for the endAt watchdog. Hand over — the
        // shared _endAtFired flag keeps both paths single-fire in every
        // case; native techs (resolver yields null) fall through unchanged
        // into the original #1 logic.
        if (_resolveYouTubeRawPlayer(player)) return;
        // END Fix multiPlayer for new startAt/endAt params #2

        // Fix J1 multiPlayer #3
        // Root cause 1: resolve the CURRENTLY loaded item, not the id the
        // player was created with.
        // Original (deprecated, preserved for reference):
        // const win = _resolveStartEndAt(videoId, playlistManagerRef);
        const activeId = _resolveActivePlaybackVideoId(player, videoId);

        // Fix J1 multiPlayer #4
        // Mid-swap: the tech still reports the PREVIOUS item — its position
        // is parked at that item's endAt, so acting here would re-fire the
        // stop for a video that already stopped (see the
        // _expectedActiveVideoId note). Skip until the swap settles.
        if (_isMidSwap(activeId)) return;

        const win = _resolveStartEndAt(activeId, playlistManagerRef);
        if (win.endAt === null) return;

        const pos = (typeof player.currentTime === 'function') ? (player.currentTime() || 0) : 0;

        // Fix J1 multiPlayer #3
        // Root cause 3: the latch is now keyed by video id, so it re-arms by
        // itself as soon as another item is loaded into this player. The
        // hysteresis rule is kept for a seek back inside the SAME item.
        // Original (deprecated, preserved for reference):
        // // re-arm after a seek back into the window (1.5s hysteresis)
        // if (_endAtFired && pos < (win.endAt - 1.5)) {
        //   _endAtFired = false;
        // }
        if (_endAtFiredFor !== null && _endAtFiredFor !== activeId) {
          _rearmEndAt('item changed');
        }
        if (_endAtFiredFor === activeId && pos < (win.endAt - 1.5)) {
          _rearmEndAt('seek back into window');
        }

        // Fix J1 multiPlayer #3
        // Root cause 4: endAt now STOPS instead of triggering a synthetic
        // 'ended' that made the plugin autoadvance / loop mode start the next
        // video. _stopAtEndAt() keeps the loop-mode advance for the case the
        // user actually enabled it.
        // Original (deprecated, preserved for reference):
        // if (!_endAtFired && pos >= win.endAt) {
        //   _endAtFired = true;
        //   player.pause();
        //   // Route through the standard end-of-media path: the 'ended'
        //   // trigger reaches onStateChange via the vjsStateEventMap wiring,
        //   // so position reset and loop-mode advance behave as usual.
        //   player.trigger('ended');
        //   isDev && logger.info('\n' + `startEndAt: video id ${videoId} stopped at configured endAt ${win.endAt}s`);
        // }
        if (_endAtFiredFor === null && pos >= win.endAt) {
          _endAtFiredFor = activeId;
          _stopAtEndAt(player, activeId, win.endAt, '');
        }
      } catch (e) {
        // Fix J1 multiPlayer #3
        // Original (deprecated, preserved for reference):
        // isDev && logger.warn('\n' + `startEndAt: endAt watchdog skipped: ${e}`);
        isDev && logger.warn('\n' + `playbackWindow: endAt watchdog skipped: ${e}`);
      }
    });

    // Fix multiPlayer for new startAt/endAt params #2
    // YouTube enforcement, mirrored from the Amplitude module's ytp plugin
    // (ytp.js). For YouTube sources the #1 handlers above proved unreliable:
    // they act through the Video.js facade (player.currentTime() /
    // 'timeupdate'), while the videojs-youtube tech only relays those
    // synthetically. The ytp plugin instead operates on the RAW YT.Player:
    //
    //   startAt - ytp seeks the raw player on EVERY 'playing' state change
    //     (ytp.js: `if (songCurrentTime < songStartSec)` ->
    //     processOnVideoStart() -> ytpSeekTo(player, startSec, true) ->
    //     player.seekTo(time, seekAhead)). Mirrored here per-'playing'
    //     (NOT one-shot like the native #1 handler), so a REPLAY after an
    //     endAt stop (position reset to 0 by the standard 'ended' path)
    //     starts at startAt again. Resume keeps winning: a position inside
    //     [startAt, endAt) is left untouched — same outside-window test as
    //     the #1 handler; same 400ms deferral past the 250ms resume seek.
    //
    //   endAt - ytp polls the raw player on a 500ms interval
    //     (ytp.js: `checkOnVideoEnd = setInterval(...)` reading
    //     ytPlayer.getCurrentTime() against songEndSec). Mirrored here as
    //     ONE persistent 500ms interval per created player (ytp re-installs
    //     per PLAYING and clears at end; a single lazily-resolving interval
    //     with the #1 hysteresis re-arm gives the same behaviour without
    //     interval churn). Reaching endAt routes through the SAME standard
    //     end-of-media path as #1 (pause + trigger 'ended' -> onStateChange
    //     via the vjsStateEventMap wiring). The interval shares the
    //     _endAtFired flag with the #1 'timeupdate' watchdog, so the two
    //     paths can never double-fire 'ended'; it is cleared on 'dispose'
    //     (embedRunVideo rebuilds players on every selection).
    //
    // Tech ownership: when _resolveYouTubeRawPlayer() yields the raw
    // YT.Player, the #2 handlers own enforcement and the #1 handlers
    // early-return (see the #2 guards inserted there); native mp3/mp4
    // techs have no ytPlayer, the resolver yields null, and the #1
    // handlers keep owning them byte-identically to before.

    // startAt (YouTube): clamp into the window on EVERY 'playing' (ytp parity)
    const onPlayingStartAtYtp = () => {
      setTimeout(() => {
        try {
          const ytPlayer = _resolveYouTubeRawPlayer(player);
          if (!ytPlayer) return;

          // Fix J1 multiPlayer #3
          // Root cause 1: resolve the CURRENTLY loaded item. On a plugin-
          // driven source swap this player keeps running, so the creation-
          // time id resolved item 1's window for every following item.
          // Original (deprecated, preserved for reference):
          // const win = _resolveStartEndAt(videoId, playlistManagerRef);
          const activeId = _resolveActivePlaybackVideoId(player, videoId);

          // Fix J1 multiPlayer #4
          // Mid-swap: the raw YT.Player still reports the PREVIOUS item (see
          // the _expectedActiveVideoId note). Seeking it would rewind the
          // wrong video. Unlike the native #1 handler this one is attached
          // per-'playing' (ytp parity), so a plain skip is enough — the
          // settled new source fires 'playing' again and this handler runs
          // against the correct item.
          if (_isMidSwap(activeId)) return;

          const win = _resolveStartEndAt(activeId, playlistManagerRef);

          // Fix J1 multiPlayer #3
          // Replay of a window that already stopped: the player is parked AT
          // endAt with the latch set, so pressing play would run straight past
          // endAt (the hysteresis rule can never see a position below it).
          // Rewind to the window start - startAt when configured, otherwise 0 -
          // and re-arm, so the trimmed clip plays again from its beginning.
          // This branch also covers items that have endAt but NO startAt,
          // which the early return below would otherwise skip entirely.
          if (_endAtFiredFor === activeId && win.endAt !== null) {
            const posFired = ytPlayer.getCurrentTime() || 0;
            if (posFired >= (win.endAt - 1.5)) {
              const rewindTo = (win.startAt !== null) ? win.startAt : 0;
              ytPlayer.seekTo(rewindTo, true);
              _rearmEndAt('replay after endAt stop');
              isDev && logger.info('\n' + `playbackWindow: YT video id ${activeId} replays window from ${rewindTo}s (ytp parity)`);
              return;
            }
          }

          if (win.startAt === null) return;

          const pos = ytPlayer.getCurrentTime() || 0;

          const beforeWindow = (pos < win.startAt);
          const afterWindow  = (win.endAt !== null && pos >= win.endAt);

          if (beforeWindow || afterWindow) {
            // ytp.js parity: ytpSeekTo(player, startSec, true)
            ytPlayer.seekTo(win.startAt, true);
            // Fix J1 multiPlayer #3
            // Original (deprecated, preserved for reference):
            // isDev && logger.info('\n' + `startEndAt: YT video id ${videoId} started at configured startAt ${win.startAt}s (ytp parity)`);
            isDev && logger.info('\n' + `playbackWindow: YT video id ${activeId} started at configured startAt ${win.startAt}s (ytp parity)`);
          }
        } catch (e) {
          // Fix J1 multiPlayer #3
          // Original (deprecated, preserved for reference):
          // isDev && logger.warn('\n' + `startEndAt: YT startAt seek skipped: ${e}`);
          isDev && logger.warn('\n' + `playbackWindow: YT startAt seek skipped: ${e}`);
        }
      }, 400);
    };
    player.on('playing', onPlayingStartAtYtp);

    // endAt (YouTube): 500ms raw-player polling watchdog (ytp parity)
    let _ytpEndAtInterval = null;

    const installEndAtWatchYtp = () => {
      if (_ytpEndAtInterval) return;                    // single instance

      const ytPlayer = _resolveYouTubeRawPlayer(player);
      if (!ytPlayer) return;                            // native techs: #1 owns

      _ytpEndAtInterval = setInterval(() => {
        try {
          if (typeof player.isDisposed === 'function' && player.isDisposed()) {
            clearInterval(_ytpEndAtInterval);
            _ytpEndAtInterval = null;
            return;
          }

          // Fix J1 multiPlayer #3
          // ROOT CAUSE 2 of "endAt works for YouTube videos only once", and
          // the one that is genuinely YouTube-specific: the raw YT.Player was
          // resolved ONCE, above, and captured in this interval closure -
          // while `if (_ytpEndAtInterval) return;` guaranteed it was never
          // resolved again. The videojs-youtube tech re-creates its YT.Player
          // when the playlist plugin swaps the source, so from the second item
          // on this interval polled a DISCARDED instance: getCurrentTime()
          // returns undefined (-> `|| 0`, never reaching endAt) or throws into
          // the catch below, which swallows it. The watchdog was silently dead
          // even when the window itself resolved correctly.
          //
          // Re-resolve per tick. That is cheap (a property read every 500ms)
          // and always yields the LIVE player; a null result simply skips the
          // tick, e.g. while the tech is being rebuilt between two items.
          // Original (deprecated, preserved for reference):
          // const win = _resolveStartEndAt(videoId, playlistManagerRef);
          const ytLive = _resolveYouTubeRawPlayer(player);
          if (!ytLive) return;

          const activeId = _resolveActivePlaybackVideoId(player, videoId);

          // Fix J1 multiPlayer #4
          // Mid-swap: the raw YT.Player still reports the PREVIOUS item,
          // parked exactly at that item's endAt, while 'loadstart'/
          // 'playlistitem' have already re-armed the latch. THIS is the tick
          // that fired _stopAtEndAt() a second time for the old video and —
          // in loop mode — advanced the plugin over the next item, losing
          // its endAt (see the _expectedActiveVideoId note). Skip the tick
          // until the tech reports the expected id; the 'item changed' rule
          // below then re-arms for the new item as designed.
          if (_isMidSwap(activeId)) return;

          const win = _resolveStartEndAt(activeId, playlistManagerRef);
          if (win.endAt === null) return;

          // Fix J1 multiPlayer #3
          // Original (deprecated, preserved for reference):
          // const pos = ytPlayer.getCurrentTime() || 0;
          const pos = ytLive.getCurrentTime() || 0;

          // Fix J1 multiPlayer #3
          // Root cause 3: latch keyed by video id (see the declaration note),
          // so it re-arms on an item change; the #1 hysteresis rule is kept
          // for a seek back inside the SAME item.
          // Original (deprecated, preserved for reference):
          // // re-arm after a seek back into the window (1.5s hysteresis, #1 rule)
          // if (_endAtFired && pos < (win.endAt - 1.5)) {
          //   _endAtFired = false;
          // }
          if (_endAtFiredFor !== null && _endAtFiredFor !== activeId) {
            _rearmEndAt('item changed');
          }
          if (_endAtFiredFor === activeId && pos < (win.endAt - 1.5)) {
            _rearmEndAt('seek back into window');
          }

          // Fix J1 multiPlayer #3
          // Root cause 4: stop means stop. See the _stopAtEndAt() note.
          // Original (deprecated, preserved for reference):
          // if (!_endAtFired && pos >= win.endAt) {
          //   _endAtFired = true;
          //   player.pause();
          //   // Route through the standard end-of-media path (see #1 note).
          //   player.trigger('ended');
          //   isDev && logger.info('\n' + `startEndAt: YT video id ${videoId} stopped at configured endAt ${win.endAt}s (ytp parity)`);
          // }
          if (_endAtFiredFor === null && pos >= win.endAt) {
            _endAtFiredFor = activeId;
            _stopAtEndAt(player, activeId, win.endAt, 'YT ');
          }
        } catch (e) {
          // Fix J1 multiPlayer #3
          // Original (deprecated, preserved for reference):
          // isDev && logger.warn('\n' + `startEndAt: YT endAt watchdog skipped: ${e}`);
          isDev && logger.warn('\n' + `playbackWindow: YT endAt watchdog skipped: ${e}`);
        }
      }, 500);                                          // ytp.js: 500ms poll
    };
    player.on('playing', installEndAtWatchYtp);

    player.on('dispose', () => {
      if (_ytpEndAtInterval) {
        clearInterval(_ytpEndAtInterval);
        _ytpEndAtInterval = null;
      }
    });
    // END Fix multiPlayer for new startAt/endAt params #2
  }

  /**
   * Fix multiPlayer for new startAt/endAt params #2
   * _resolveYouTubeRawPlayer - guarded probe for the raw YT.Player of a
   * created VideoJS player, mirroring the access path already established
   * by _applyYouTubeAudioOnlyQuality() (audio only #1): the videojs-youtube
   * tech exposes the raw YT IFrame API instance as tech.ytPlayer
   * (youtube.js: this.ytPlayer = new YT.Player(...)).
   *
   * Yields the raw player ONLY when both API calls the ytp-style
   * enforcement needs (getCurrentTime, seekTo — ytp.js base functions)
   * are present; every other case (native mp3/mp4 tech, YT.Player not
   * created yet, tech disposed) yields null, which hands enforcement
   * back to the generic #1 handlers. Safe no-op outside its target case.
   *
   * @param  {Object} vjsPlayer - the VideoJS player instance
   * @returns {(Object|null)} the raw YT.Player, or null
   */
  function _resolveYouTubeRawPlayer(vjsPlayer) {
    try {
      const tech = vjsPlayer && vjsPlayer.tech_ ? vjsPlayer.tech_ : null;
      if (tech && tech.ytPlayer
          && typeof tech.ytPlayer.getCurrentTime === 'function'
          && typeof tech.ytPlayer.seekTo === 'function') {
        return tech.ytPlayer;
      }
    } catch (e) {
      // Fix J1 multiPlayer #3
      // Original (deprecated, preserved for reference):
      // isDev && logger.warn('\n' + `startEndAt: YT raw player probe skipped: ${e}`);
      isDev && logger.warn('\n' + `playbackWindow: YT raw player probe skipped: ${e}`);
    }
    return null;
  }

  /**
   * Fix J1 multiPlayer #5
   * _pluginWillAutoadvance - TRUE when the videojs-playlist plugin's
   * autoadvance is armed on THIS player AND has an item to advance to, i.e.
   * when a (real or synthetic) 'ended' on the player will be answered by the
   * plugin with an IN-PLAYER advance (playlist.next() -> playItem() source
   * swap) instead of dying unheard.
   *
   * Three conditions, all read from the plugin's own state (core.js):
   *
   *   1. autoadvance configured - setup() stores the validated delay in
   *      playlist.autoadvance_.delay and leaves it null when autoadvance was
   *      cancelled or never enabled (plugins.playlist.autoadvance unset).
   *   2. the 'ended' listener is armed - setup() installs it via
   *      player.one('ended', trigger) and keeps the trigger function in
   *      playlist.autoadvance_.trigger; reset() (cancel path) nulls it.
   *   3. there IS a next item - playlist.next() is an explicit no-op when
   *      nextIndex() === currentIndex() (last item without plugin repeat),
   *      so on the final item the plugin will NOT advance and the caller
   *      must fall back to its own end-of-playlist behaviour.
   *
   * Every read is guarded: players without the playlist plugin (single-video
   * embeds via embedRunVideo) have no player.playlist function, and the
   * helper then answers false - byte-identical behaviour to before #5.
   *
   * @param  {Object} vjsPlayer - the VideoJS player instance
   * @returns {boolean}
   */
  function _pluginWillAutoadvance(vjsPlayer) {
    try {
      if (!vjsPlayer || typeof vjsPlayer.playlist !== 'function') return false;

      const aa = vjsPlayer.playlist.autoadvance_;
      if (!aa) return false;
      if (aa.delay === null || aa.delay === undefined) return false;      // never enabled / cancelled
      if (typeof aa.trigger !== 'function') return false;                 // 'ended' listener not armed

      if (typeof vjsPlayer.playlist.nextIndex    !== 'function' ||
          typeof vjsPlayer.playlist.currentIndex !== 'function') return false;

      // core.js playlist.next(): no side effects when the indexes match
      return (vjsPlayer.playlist.nextIndex() !== vjsPlayer.playlist.currentIndex());
    } catch (e) {
      isDev && logger.debug('\n' + `playbackWindow: plugin autoadvance probe skipped: ${e}`);
      return false;
    }
  }

  /**
   * Fix multiPlayer new select audio only #1
   * _applyYouTubeAudioOnlyQuality - hard-enforce the minimum video quality
   * on the underlying YT.Player, mirroring the ytp plugin of the Amplitude
   * module (ytp.js: ytPlayer.setPlaybackQuality('small') on player ready).
   *
   * The videojs-youtube tech exposes the raw YT.Player instance as
   * tech.ytPlayer (youtube.js: this.ytPlayer = new YT.Player(...)). Every
   * step is guarded — the tech may not be the YouTube tech, the YT.Player
   * may not be created yet — so the helper is a safe no-op outside its
   * target case.
   *
   * @param {Object} vjsPlayer - the VideoJS player instance
   */
  function _applyYouTubeAudioOnlyQuality(vjsPlayer) {
    try {
      const tech = vjsPlayer && vjsPlayer.tech_ ? vjsPlayer.tech_ : null;
      if (tech && tech.ytPlayer && typeof tech.ytPlayer.setPlaybackQuality === 'function') {
        tech.ytPlayer.setPlaybackQuality('small');
        isDev && logger.debug('\n' + 'audioOnly: YT playback quality set to small (ytp parity)');
      }
    } catch (e) {
      isDev && logger.warn('\n' + `audioOnly: setPlaybackQuality skipped: ${e}`);
    }
  }

  /**
   * Fix multiPlayer new select audio only #2
   * _resolveYouTubeAudioOnlyPoster - poster URL shown on the player surface
   * while a YouTube source plays in AUDIO ONLY (audioPosterMode). The
   * PosterImage component of Video.js hides itself when the player has no
   * poster URL (PosterImage.update: no url -> hide()), so audioPosterMode is
   * only VISIBLE when a URL is supplied — this resolver guarantees one.
   *
   * Precedence (first match wins):
   *   1. entry.poster of the playlist record — the per-video configured
   *      poster (playlist YAML preload / normalized YouTube thumbnail),
   *      skipped when it merely holds the module fallback DEFAULT_POSTER
   *   2. the YouTube thumbnail derived from the videoId and the configured
   *      thumbnail file players.youtube.poster (videojs.yml, e.g.
   *      'maxresdefault.jpg'); served from the cookieless CDN i.ytimg.com
   *      ('optimize J1 third-party cookies #1' rule)
   *   3. players.youtube.default_poster (videojs.yml)
   *   4. DEFAULT_POSTER (module constant)
   *
   * Read defensively — callable before the adapter has assigned options and
   * before the playlist record exists (degrades along the chain), mirroring
   * _resolveAudioOnlyActive().
   *
   * @param  {string} videoId - YouTube video id (player.id_ / playlist key)
   * @returns {string} poster URL (never empty)
   */
  function _resolveYouTubeAudioOnlyPoster(videoId) {
    // 1. per-entry configured poster from the playlist record
    try {
      if (typeof playlistManager !== 'undefined'
          && playlistManager
          && typeof playlistManager.getEntry === 'function') {
        const entry = playlistManager.getEntry(videoId);
        if (entry && entry.poster && entry.poster !== DEFAULT_POSTER) {
          return entry.poster;
        }
      }
    } catch (e) {
      isDev && logger.warn('\n' + `audioOnly: poster lookup from playlist record skipped: ${e}`);
    }

    // 2.|3. players.youtube configuration (defaults <- settings <- control)
    const vpo   = _resolveVideoPlayerEffectiveOptions();
    const ytCfg = (vpo && vpo.videoJS && vpo.videoJS.players && vpo.videoJS.players.youtube)
      ? vpo.videoJS.players.youtube
      : {};

    if (videoId) {
      const posterFile = ytCfg.poster || 'maxresdefault.jpg';
      return `//i.ytimg.com/vi/${videoId}/${posterFile}`;
    }

    // 4. module fallback
    return ytCfg.default_poster || DEFAULT_POSTER;
  }

  /**
   * Fix multiPlayer new select audio only #2
   * _ensureAudioOnlyPosterStyles - one-time DEFENSIVE stylesheet for the
   * poster persistence of audioPosterMode.
   *
   * The bundled video-js core CSS ships the rule
   *   .vjs-has-started.vjs-audio-poster-mode .vjs-poster { display: block; }
   * since the mode was introduced; without it, the generic
   * '.vjs-has-started .vjs-poster { display: none }' rule would hide the
   * poster the moment playback starts and the audio-only surface would go
   * blank. Because J1 sites may bundle a trimmed or older video-js
   * stylesheet, the rule is re-asserted here with a HIGHER specificity
   * (four classes vs. two) so it wins regardless of stylesheet order. A
   * byte-identical duplicate of the core rule is harmless — same declaration,
   * same result.
   *
   * Idempotent: keyed on a fixed style-element id; the second and every
   * later call is a no-op. Injected only on the audio-only code paths, so
   * pages that never use the feature stay untouched.
   */
  function _ensureAudioOnlyPosterStyles() {
    const STYLE_ID = 'j1VideoPlayerAudioOnlyPosterCss';

    if (document.getElementById(STYLE_ID)) {
      return;
    }

    const styleEl = document.createElement('style');
    styleEl.id    = STYLE_ID;
    styleEl.textContent = [
      '/* Fix multiPlayer new select audio only #2 */',
      '/* Poster persistence for AUDIO ONLY playback (audioPosterMode):    */',
      '/* keep the poster visible on the player surface during playback.   */',
      '.video-js.vjs-audio-poster-mode .vjs-poster { display: block; }',
      '.video-js.vjs-audio-poster-mode.vjs-has-started .vjs-poster { display: block; }'
    ].join('\n');

    document.head.appendChild(styleEl);

    isDev && logger.debug('\n' + 'audioOnly: poster-persistence stylesheet injected');
  }

  // Fix multiPlayer start video at startAt #1
  // ===========================================================================
  // FEATURE: "dark start" for the startAt playback window
  //
  // Problem this fixes
  // ------------------
  // startAt is enforced by SEEKING, not by loading the media at an offset:
  //
  //   native  - _applyStartEndAtPlayback() installs a 'playing' one-shot that
  //             is deferred 400ms (past the 250ms resume seek) and then calls
  //             player.currentTime(startAt)
  //   YouTube - the ytp-parity handler seeks the RAW YT.Player on every
  //             'playing' state change, also deferred 400ms
  //
  // Between the moment playback actually starts and the moment that seek
  // lands, the tech renders the media FROM ITS BEGINNING. The viewer sees a
  // visible flash of exactly the material the startAt window was configured to
  // skip (title cards, sponsor bumpers, silence, a wrong scene) - for YouTube
  // typically longer, because the IFrame API has to buffer at the new offset
  // after seekTo(). The window is correct; the presentation is not.
  //
  // Requirement
  // -----------
  // "When the option startAt is set, the video should be set dark (invisible)
  //  until the synthetic start time is reached. Until the start time is
  //  reached, the related poster of the video should be displayed instead."
  //
  // Implementation strategy
  // -----------------------
  // The same strategy the module already uses for AUDIO ONLY (the
  // audioPosterMode display strategy of the "select audio only" series, fix
  // number 2 of that series): do NOT touch the tech, the
  // sources or the player configuration - hide the video SURFACE with CSS and
  // let the PosterImage component cover it. That keeps the fix out of the
  // playback path entirely: buffering, the seek, the endAt watchdog, the
  // resume handlers, autoadvance and loop mode all run byte-identically. Only
  // the pixels change.
  //
  //   1. one-time stylesheet (_ensureStartAtDarkStyles) declaring a single
  //      marker class 'j1-startat-dark' on the .video-js element:
  //        - .vjs-tech (and the YouTube iframe inside it) -> invisible
  //        - .vjs-poster                                  -> forced visible
  //        - the player surface                           -> black backdrop,
  //          so a media WITHOUT any resolvable poster is genuinely "dark"
  //          rather than showing the unwanted frames
  //   2. visibility (not display) is used for the tech: display:none would
  //      detach the video element / iframe from layout, which pauses or
  //      re-initialises the YouTube IFrame API and would break the very seek
  //      this feature waits for. visibility:hidden keeps the media running.
  //   3. the poster is guaranteed to have a URL (PosterImage.update() hides
  //      itself when player.poster() is empty, so audioPosterMode and this
  //      mode are only VISIBLE with a URL set) - see _resolveStartAtDarkPoster
  //      below, which mirrors the precedence chain of
  //      _resolveYouTubeAudioOnlyPoster().
  //   4. !important is required on the poster rule: PosterImage.hide() sets
  //      the core class .vjs-hidden { display: none !important }, which a
  //      plain 'display: block' could not beat.
  //
  // Scope / no-op guarantees
  // ------------------------
  //   - a media whose resolved startAt is null (the default for every existing
  //     playlist entry and every existing YAML configuration) never enters the
  //     mode: behaviour is byte-identical to before this fix
  //   - AUDIO ONLY (audioPosterMode) already hides the tech and shows the
  //     poster permanently; the mode is skipped there to avoid two owners of
  //     the same surface
  //   - a resume position that already lies INSIDE the window means there is
  //     nothing to skip, so the mode is skipped as well (resume keeps winning,
  //     the established rule of the startAt handlers)
  //   - only the VIDEO surface is darkened. Audio is deliberately NOT muted:
  //     muting would fight the user's volume/mute state and could strand the
  //     player muted if the reveal path ever failed. The pre-startAt audio
  //     blip lasts only until the seek lands.
  // ===========================================================================
  //
  const STARTAT_DARK_CLASS = 'j1-startat-dark';

  /**
   * Fix multiPlayer start video at startAt #1
   * _ensureStartAtDarkStyles - one-time stylesheet for the "dark start" of a
   * configured startAt window.
   *
   * Modelled on _ensureAudioOnlyPosterStyles(): idempotent, keyed on a fixed
   * style-element id, injected lazily from the code path that needs it, so
   * pages that never configure startAt stay untouched.
   *
   * Rules, in the order they appear:
   *   1. .vjs-tech / its iframe -> invisible. visibility + opacity, NEVER
   *      display: the element must stay in layout so the media keeps loading
   *      and seeking (see the feature note above).
   *   2. the player surface gets a black backdrop, so a media without a
   *      resolvable poster still reads as "dark" instead of leaking frames
   *      through a transparent stack.
   *   3. .vjs-poster -> forced visible with !important, which beats BOTH the
   *      core rule '.vjs-has-started .vjs-poster { display: none }' and the
   *      component's own '.vjs-hidden { display: none !important }'.
   *   4. the loading spinner is lifted above the poster: while the tech
   *      buffers at the new offset the spinner is the only feedback the
   *      viewer gets that something is happening.
   */
  function _ensureStartAtDarkStyles() {
    const STYLE_ID = 'j1VideoPlayerStartAtDarkCss';

    if (document.getElementById(STYLE_ID)) {
      return;
    }

    const styleEl = document.createElement('style');
    styleEl.id    = STYLE_ID;
    styleEl.textContent = [
      '.video-js.' + STARTAT_DARK_CLASS + ' .vjs-tech,',
      '.video-js.' + STARTAT_DARK_CLASS + ' .vjs-tech iframe {',
      '  visibility: hidden !important;',
      '  opacity: 0 !important;',
      '}',
      '.video-js.' + STARTAT_DARK_CLASS + ' {',
      '  background-color: #000;',
      '}',
      '.video-js.' + STARTAT_DARK_CLASS + ' .vjs-poster {',
      '  display: block !important;',
      '  visibility: visible !important;',
      '  opacity: 1 !important;',
      '  z-index: 1;',
      '}',
      '.video-js.' + STARTAT_DARK_CLASS + ' .vjs-loading-spinner {',
      '  z-index: 2;',
      '}'
    ].join('\n');

    document.head.appendChild(styleEl);

    isDev && logger.debug('\n' + 'startAtDark: dark-surface stylesheet injected');
  }

  /**
   * Fix multiPlayer start video at startAt #1
   * _resolveStartAtDarkPoster - poster URL shown INSTEAD of the video while
   * the player seeks to a configured startAt.
   *
   * The PosterImage component hides itself when player.poster() is empty
   * (PosterImage.update: no url -> hide()), so the dark surface would be a
   * plain black box without a URL. This resolver guarantees one, using the
   * same precedence idea as _resolveYouTubeAudioOnlyPoster() but starting
   * from the poster the player was ALREADY created with - that is the poster
   * the viewer expects to see for this media, and using it means the common
   * case needs no player.poster() write at all:
   *
   *   1. player.poster() - the poster videoConfig was built with
   *   2. entry.poster of the playlist record - the per-video configured
   *      poster, skipped when it merely holds the module fallback
   *      DEFAULT_POSTER (a later step may resolve something better)
   *   3. for a YouTube source: the established YouTube resolver
   *      (_resolveYouTubeAudioOnlyPoster), i.e. the i.ytimg.com thumbnail
   *      derived from the video id and players.youtube.poster
   *   4. players.youtube.default_poster / DEFAULT_POSTER (module constant)
   *
   * Read defensively at every step - callable before the adapter has assigned
   * options and before the playlist record exists, mirroring
   * _resolveAudioOnlyActive() / _resolveStartEndAt().
   *
   * @param  {string} videoId - the CURRENTLY loaded video id
   * @param  {Object} vjsPlayer - the videojs player instance
   * @param  {Object} playlistManagerRef - THIS instance's playlistManager
   * @returns {string} poster URL (may be empty only if every step failed)
   */
  function _resolveStartAtDarkPoster(videoId, vjsPlayer, playlistManagerRef) {
    // 1. the poster the player already carries
    try {
      if (vjsPlayer && typeof vjsPlayer.poster === 'function') {
        const current = vjsPlayer.poster();
        if (current) return current;
      }
    } catch (e) {
      isDev && logger.debug('\n' + `startAtDark: player poster read skipped: ${e}`);
    }

    // 2. per-entry configured poster from the playlist record
    try {
      if (playlistManagerRef && typeof playlistManagerRef.getEntry === 'function') {
        const entry = playlistManagerRef.getEntry(videoId);
        if (entry && entry.poster && entry.poster !== DEFAULT_POSTER) {
          return entry.poster;
        }
      }
    } catch (e) {
      isDev && logger.debug('\n' + `startAtDark: poster lookup from playlist record skipped: ${e}`);
    }

    // 3. YouTube thumbnail when the YouTube tech owns this surface
    try {
      if (_resolveYouTubeRawPlayer(vjsPlayer)) {
        return _resolveYouTubeAudioOnlyPoster(videoId);
      }
    } catch (e) {
      isDev && logger.debug('\n' + `startAtDark: YouTube poster resolution skipped: ${e}`);
    }

    // 4. module fallback
    try {
      const vpo   = _resolveVideoPlayerEffectiveOptions();
      const ytCfg = (vpo && vpo.videoJS && vpo.videoJS.players && vpo.videoJS.players.youtube)
        ? vpo.videoJS.players.youtube
        : {};
      return ytCfg.default_poster || DEFAULT_POSTER;
    } catch (e) {
      isDev && logger.debug('\n' + `startAtDark: default poster resolution skipped: ${e}`);
    }

    return DEFAULT_POSTER;
  }

  /**
   * _buildDownloadFileName - human readable, file-system safe download name.
   *
   * Preference order: entry.title -> file name of the source URL ->
   * entry.videoId -> a generic constant. Characters that are illegal in
   * Windows/macOS/Linux file names are folded to '-'.
   *
   * @param  {Object} entry
   * @param  {{url: string, ext: string}} source - result of _getEntryDownloadSource
   * @returns {string} e.g. 'Mord im Orient-Express (1-18).mp3'
   */
  function _buildDownloadFileName(entry, source) {
    let base = (entry && entry.title) ? String(entry.title) : '';

    if (!base.trim()) {
      const last = source.url.split('#')[0].split('?')[0].split('/').pop() || '';
      base = last.replace(/\.[^.]*$/, '');
    }

    if (!base.trim() && entry && entry.videoId) {
      base = String(entry.videoId);
    }

    base = base
      .replace(/[\\/:*?"<>|]+/g, '-')          // illegal in file names
      .replace(/[\u0000-\u001F\u007F]+/g, '')  // control characters
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/^[.\s]+/, '')                  // no leading dot (hidden file)
      .replace(/[.\s]+$/, '');                 // no trailing dot/space

    if (base.length > DOWNLOAD_FILENAME_MAX_LENGTH) {
      base = base.slice(0, DOWNLOAD_FILENAME_MAX_LENGTH).trim();
    }

    if (!base) base = 'videoPlayer-media';

    return `${base}.${source.ext}`;
  }

  /**
   * _isSameOriginUrl - true when the (possibly relative or protocol-relative)
   * URL resolves to the origin of the hosting page. Only for same-origin URLs
   * is the anchor `download` attribute honoured by the browser.
   *
   * @param  {string} url
   * @returns {boolean}
   */
  function _isSameOriginUrl(url) {
    try {
      const resolved = new URL(String(url), window.location.href);
      return resolved.origin === window.location.origin;
    } catch (_e) {
      return false;
    }
  }

  /**
   * _triggerAnchorDownload - the click-a-hidden-anchor primitive, identical in
   * shape to the one used by exportToFile()/backupToFile().
   *
   * @param {string}  href       - file URL or object URL
   * @param {string}  filename   - suggested name in the download folder
   * @param {boolean} isObjectUrl- revoke `href` after the click when true
   */
  function _triggerAnchorDownload(href, filename, isObjectUrl) {
    const a = document.createElement('a');

    a.href     = href;
    a.download = filename;
    a.rel      = 'noopener';
    a.style.display = 'none';

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    if (isObjectUrl) {
      // Give the browser a tick to pick the blob up before releasing it.
      setTimeout(() => URL.revokeObjectURL(href), 1000);
    }
  }

  /**
   * _downloadMediaSource - writes one plain media file to the local download
   * folder. See the same-origin/cross-origin note in the section header.
   *
   * Never throws: every failure is logged and reported through the return
   * value so a "download all" run continues with the next item.
   *
   * @param  {string} url
   * @param  {string} filename
   * @returns {Promise<boolean>} true when the download was handed to the browser
   */
  async function _downloadMediaSource(url, filename) {

    // Reset the outcome marker at every entry so a caller can never read the
    // classification of a PREVIOUS transfer (see _lastDownloadOutcome).
    //
    _lastDownloadOutcome = null;

    // Same origin: let the browser stream the file straight to disk.
    //
    if (_isSameOriginUrl(url)) {
      try {
        _triggerAnchorDownload(url, filename, false);
        _lastDownloadOutcome = 'same-origin';
        isDev && logger.info('\n' + `media export: downloading (same-origin) "${filename}"`);
        return true;
      } catch (err) {
        _lastDownloadOutcome = 'failed';
        logger.error('\n' + `media export: download failed for "${filename}": ${err}`);
        return false;
      }
    }

    // Cross origin: the download attribute is ignored, so fetch the bytes
    // (needs CORS on the serving host) and download them as an object URL.
    //
    try {
      const response = await fetch(url, { mode: 'cors', credentials: 'omit' });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }

      const blob      = await response.blob();
      const objectUrl = URL.createObjectURL(blob);

      _triggerAnchorDownload(objectUrl, filename, true);
      _lastDownloadOutcome = 'cross-origin';
      isDev && logger.info('\n' + `media export: downloading (cross-origin, ${blob.size} bytes) "${filename}"`);
      return true;
    } catch (err) {
      logger.warn('\n' + `media export: cross-origin download of "${filename}" failed (${err}) — opening in a new tab for a manual save`);

      try {
        window.open(url, '_blank', 'noopener');
        _lastDownloadOutcome = 'manual-tab';
      } catch (_e) {
        _lastDownloadOutcome = 'failed';
        logger.error('\n' + `media export: fallback tab could not be opened for "${filename}"`);
      }
      return false;
    }
  }

  /**
   * _resolveUiElementDownloadFlags - effective visibility of the two NEW
   * export controls for this instance.
   *
   *     ui_elements:
   *       playlist_download_button:      true|false   # per playlist item
   *       playlist_download_all_button:  true|false   # playlist title bar
   *
   * Deliberately a SEPARATE resolver next to the #53
   * _resolveUiElementFlags(): the rate/edit/delete resolution stays untouched
   * and the new keys can be added or removed without any risk to it. Same
   * `!== false` null-safety rule as #47/#52/#53, so configurations that do not
   * carry the keys get the buttons — which stay invisible anyway unless the
   * playlist actually holds plain media files (see
   * _updateDownloadAllButtonVisibility and the per-item render gates).
   *
   * @returns {{download: boolean, downloadAll: boolean}}
   */
  function _resolveUiElementDownloadFlags() {
    const opts = _resolveVideoPlayerEffectiveOptions();
    const ui   = (opts && typeof opts.ui_elements === 'object' && opts.ui_elements)
      ? opts.ui_elements
      : {};

    return {
      download:    ui.playlist_download_button     !== false,
      downloadAll: ui.playlist_download_all_button !== false,
    };
  }

  /**
   * _applyUiElementDownloadFlags - resolves the export-button flags and
   * publishes them as data attributes on the player-scoped playlist container
   * (#videoplayer_playlist_parent_<id>):
   *
   *     data-playlist-download-button     = "true"|"false"
   *     data-playlist-download-all-button = "true"|"false"
   *
   * Same publisher contract as #53: playlistCards.mjs mirrors
   * data-playlist-download-button into its showDownloadButton property when an
   * adapter renders the cards through <playlist-cards>.
   *
   * @param  {HTMLElement} containerEl - the player-scoped playlist container
   * @returns {{download: boolean, downloadAll: boolean}} the resolved flags
   */
  function _applyUiElementDownloadFlags(containerEl) {
    const flags = _resolveUiElementDownloadFlags();

    if (containerEl && containerEl.dataset) {
      containerEl.dataset.playlistDownloadButton    = String(flags.download);
      containerEl.dataset.playlistDownloadAllButton = String(flags.downloadAll);
    }

    isDev && logger.debug('\n' + `playlistManager: playlist export buttons resolved (download: ${flags.download}, downloadAll: ${flags.downloadAll})`);

    return flags;
  }

  // ---------------------------------------------------------------------------
  // Helper Functions
  // ---------------------------------------------------------------------------

  /**
   * _buildGenreOptionHTML - returns the <optgroup> / <option> HTML
   * string for all genres in TAGS_BY_GENRE.
   */
  function _buildGenreOptionHTML() {
    let html = '<option value="">select from common tags</option>\n';
    for (const [genre, tags] of Object.entries(TAGS_BY_GENRE)) {
      html += `                      <optgroup label="${genre}">\n`;
      tags.forEach(t => {
        html += `                      <option value="${t}">${t}</option>\n`;
      });
      html += `                      </optgroup>\n`;
    }
    return html;
  }

  // ---------------------------------------------------------------------------
  // PlaylistManager
  // Central component for all video playlist operations on localStorage
  //
  // Extended to store native video metadata (src, poster) in playlist entries
  // instead of YouTube-specific fields.
  // ---------------------------------------------------------------------------
  class PlaylistManager {

    constructor() {
      this.STORAGE_KEY                    = 'playlist';
      this.INDEX_KEY                      = 'index';

      // Per-player localStorage namespacing (issue #40).
      // The two keys above are the *bare* base keys. On a multi-player page
      // every PlaylistManager instance previously shared the bare 'playlist'
      // (and 'index') key, so a second player's content merged into the
      // first player's localStorage list. To isolate instances, setPlayerID()
      // re-derives STORAGE_KEY/INDEX_KEY by suffixing them with the owning
      // player id (e.g. 'playlist_player_1', 'index_player_1').
      // The bare values are preserved here so the derivation is always built
      // from the base — never from an already-suffixed key — which keeps
      // setPlayerID() idempotent even when it is re-asserted (e.g. by
      // preloadPlaylists()). When no player id is set the bare keys are used
      // unchanged, mirroring the _pid() fallback and preserving the existing
      // single-player / test behaviour.
      //
      this._BASE_STORAGE_KEY              = this.STORAGE_KEY;
      this._BASE_INDEX_KEY                = this.INDEX_KEY;

      // guard flags
      //
      this._rateHandlerInitialized        = false;
      this._editHandlerInitialized        = false;
      this._infoLinkHandlerInitialized    = false;
      this._videoLinkHandlerInitialized   = false;
      this._playHandlerInitialized        = false;
      this._deleteHandlerInitialized      = false;
      this._downloadHandlerInitialized    = false;
      this._downloadAllHandlerInitialized = false;
      this._downloadInProgress            = false;

      // initial settings
      //
      this._searchResults                 = null;
      this._searchIndex                   = null;
      this._currentSort                   = 'watchDate';

      // Set default sort criteria #1
      // One-shot latch of the CONTENT-DERIVED default sort criterion.
      //
      // The line above seeds _currentSort with the historic hard-coded
      // 'watchDate' default. That default is wrong for a SERIES playlist:
      // every entry of a series export typically carries the SAME watchDate
      // (see the shipped sample playlists), so sorting by date degenerates to
      // "whatever order the JSON happened to arrive in" and the episodes are
      // shown unordered. Such a playlist must default to 'episode' instead.
      //
      // The criterion cannot be derived HERE: at constructor time the storage
      // key is still the BARE base key ('playlist'); setPlayerID() re-derives
      // the per-player key only later (#40), so this.load() would read the
      // wrong (or an empty) list. The derivation is therefore deferred to the
      // first non-empty _applySortOrder() pass — the single chokepoint every
      // render, plugin-feed and auto-load path already goes through — and this
      // flag makes it happen exactly ONCE per session so a later explicit user
      // choice (sort <select>) is never overruled by a re-derivation.
      //
      this._defaultSortResolved           = false;

      // Player-scope the three UI-preference localStorage reads. These bare keys
      // are origin-global, so on a multi-player page BOTH players' constructors
      // read the SAME 'playlistMode'/'mergeMode'/'playlistLoop' value on (re)load
      // and each playlist restored the other player's mode. _pid() suffixes the
      // key with the owning player id (e.g. 'playlistMode_player_1') — the SAME
      // suffix the matching checkbox ids already use (fix #4:
      // getElementById(_pid('playlistMode'))) — so the persisted key and its DOM
      // control stay in lockstep. _playerID is seeded from instanceID at closure
      // entry (createVideoPlayerInstance), so it is already correct here, before
      // the adapter's later (idempotent) setPlayerID() call. With no player id
      // (default instance) _pid() returns the bare key, so single-player behaviour
      // is unchanged. Mirrors the STORAGE_KEY/INDEX_KEY namespacing of #40.
      //
      this._displayMode                   = localStorage.getItem(_pid('playlistMode')) || 'cards'; // jadams
      this._mergeMode                     = localStorage.getItem(_pid('mergeMode')) === 'true';
      this._loopEnabled                   = localStorage.getItem(_pid('playlistLoop')) === 'true';

      // Runtime mirror of the audio-only state, seeded from the per-player
      // localStorage key (same _pid() namespacing as the three reads above).
      // A missing key reads as false here; the YAML seed (opts.audio_only)
      // is applied later by audioOnlySwitchHandler.init() — the adapter has
      // not assigned any options yet at constructor time. All PLAYBACK
      // decisions resolve through _resolveAudioOnlyActive(), which applies
      // the full precedence (localStorage -> YAML -> false) on every call,
      // so this field is UI state only (checkbox sync), never a config gate.
      //
      this._audioOnly                     = localStorage.getItem(_pid('audioOnly')) === 'true';

      // Lazy one-shot guard for the title-bar audio-only switch, following
      // the _downloadAllHandlerInitialized pattern (export #1): the switch is
      // built by renderCurrent() on the first render that finds the title
      // bar, so NO adapter change is required for the control to appear.
      //
      this._audioOnlySwitchInitialized    = false;
      this._escapeHtmlEl                  = document.createElement('div');
      this._loopSwitchInitialized         = false;

      // Tracks the videoId of the entry that is currently in the 'playing'
      // state. The matching card/list element gets data-item-active="true";
      // null means no entry is active. Re-applied after every render so the
      // active marker survives renderCurrent()/renderCards()/renderPlaylist().
      //
      this._activeVideoId                 = null;
    }

    setAdapterOptions(options) {
      adapterOptions = options;
      isDev = (adapterOptions.env === 'development' || adapterOptions.env === 'dev')
        ? true
        : false;
    }

    // Registers the player id so that _pid() can resolve all per-player element
    // ids to their suffixed form (e.g. 'videoplayer_playlist_parent_myPlayer').
    // Called by the adapter immediately after instantiating the handlers.
    //
    setPlayerID(id) {
      _playerID = id || '';

      // Re-derive the per-instance localStorage keys from the bare base keys
      // each time the owning player id changes. With a player id present the
      // keys become player-scoped (e.g. 'playlist_player_1' / 'index_player_1')
      // so concurrent instances on the same page no longer collide; with an
      // empty id the bare keys are kept (single-player / test fallback, in line
      // with _pid()). Always derived from _BASE_* so repeated calls (e.g. the
      // re-assertion inside preloadPlaylists()) can never double-suffix.
      // Because STORAGE_KEY/INDEX_KEY are *instance* properties, the value set
      // here is stable for this instance regardless of later changes to the
      // module-level _playerID by a sibling player — all subsequent load()/
      // save()/search-index reads and writes follow it automatically.
      //
      this.STORAGE_KEY = _playerID ? `${this._BASE_STORAGE_KEY}_${_playerID}` : this._BASE_STORAGE_KEY;
      this.INDEX_KEY   = _playerID ? `${this._BASE_INDEX_KEY}_${_playerID}`   : this._BASE_INDEX_KEY;

      isDev && logger.debug('\n' + `playlistManager: player id set to "${_playerID}"`);
      isDev && logger.debug('\n' + `playlistManager: storage key set to "${this.STORAGE_KEY}", index key set to "${this.INDEX_KEY}"`);
    }

    // Corrected bare ids ('playlistSearch', 'playlistBlock') to match the
    // actual element ids in videoPlayer.html ('playlist_screen', 'playlistBlock')
    // and resolved through _pid() so the suffixed form is used at runtime.
    //
    // Removed 'playlist_screen' from this data-driven show/hide list.
    // The outer #playlist_screen panel is the TOGGLE target: its visibility
    // is owned solely by the #toggle_playlist button (initTogglePlaylistHandler)
    // and by the public closePlaylist() API.
    // Previously _manageHiddenMode(true) forced #playlist_screen to display:block 
    // whenever a playlist existed, and because it is called on every
    // renderCurrent()/renderCards()/renderPlaylist() run, the panel was
    // re-opened on each render — including on page load/reload with
    // a loaded playlist.
    // That silently undid the adapter's closePlaylist() call (the close
    // worked, then the next render re-showed the panel), so the panel
    // appeared "stuck open".
    // Only the INNER #playlistBlock is data-driven here; the #playlist_screen panel
    // now stays closed until the user opens it.
    //
    _manageHiddenMode(visible) {
      const ids = ['playlistBlock'];
      ids.forEach(id => {
        const el = document.getElementById(_pid(id));
        if (el) {
          el.style.display = visible ? 'block' : 'none';
        }
      });
    }

    // Internal Helper Functions
    // -------------------------------------------------------------------------

    _formatDuration(seconds) {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = Math.floor(seconds % 60);
      if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
      return `${m}:${String(s).padStart(2, '0')}`;
    }

    _getTimeAgo(date) {
      const diff    = Date.now() - date.getTime();
      const mins    = Math.floor(diff / 60000);
      const hours   = Math.floor(diff / 3600000);
      const days    = Math.floor(diff / 86400000);
      const weeks   = Math.floor(days / 7);
      const months  = Math.floor(days / 30);

      if (mins < 1) return 'Just now';
      if (mins < 60) return `${mins} minute${mins > 1 ? 's' : ''} ago`;
      if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
      if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
      if (weeks < 5) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
      return `${months} month${months > 1 ? 's' : ''} ago`;
    }

    _escapeHtml(str) {
      this._escapeHtmlEl.textContent = str;
      return this._escapeHtmlEl.innerHTML;
    }

    _formatTimestamp() {
      const now  = new Date();
      const yyyy = now.getFullYear();
      const mo   = String(now.getMonth() + 1).padStart(2, '0');
      const dd   = String(now.getDate()).padStart(2, '0');
      const hh   = String(now.getHours()).padStart(2, '0');
      const mm   = String(now.getMinutes()).padStart(2, '0');
      const ss   = String(now.getSeconds()).padStart(2, '0');
      return `${yyyy}-${mo}-${dd}__${hh}-${mm}-${ss}`;
    }

    _parseDuration(text) {
      if (!text) return 0;
      const cleaned = text.replace(/[^0-9:]/g, '').trim();
      if (!cleaned) return 0;
      const parts = cleaned.split(':').map(Number);
      if (parts.some(isNaN)) return 0;
      if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
      if (parts.length === 2) return parts[0] * 60 + parts[1];
      return parts[0] || 0;
    }

    _isValidUrl(str) {
      if (!str || typeof str !== 'string') return false;
      try {
        const url = new URL(str);
        return url.protocol === 'http:' || url.protocol === 'https:';
      } catch (_) {
        return false;
      }
    }

    _updateInfoLinkButton() {
      const input = document.getElementById('editFieldInfoLink');
      const btn   = document.getElementById('editInfoLinkOpenBtn');
      if (!input || !btn) return;
      const valid = this._isValidUrl(input.value.trim());
      btn.style.display = valid ? 'inline-flex' : 'none';
    }

    _updateVideoLinkButton() {
      const input = document.getElementById('editFieldVideoLink');
      const btn   = document.getElementById('editVideoLinkOpenBtn');
      if (!input || !btn) return;
      const valid = this._isValidUrl(input.value.trim());
      btn.style.display = valid ? 'inline-flex' : 'none';
    }

    // -------------------------------------------------------------------------
    // _updateExpiryFieldState
    //
    // Applies the traffic-light colouring to the Expiry Date input in the edit
    // dialog and refreshes the hint line underneath it. The resolved state is
    // published on the element as data-expiry-state, which is what the CSS
    // rules (videoPlayer.css) select on:
    //
    //   unlimited / ok   -> no override; the generic value-aware background
    //                       handler (inputValueBackgroundHandler) keeps owning
    //                       the field exactly as before
    //   warning          -> yellow background   (<= 4 weeks left)
    //   critical         -> red background      (<= 2 weeks left)
    //   expired          -> red background      (date reached; playback blocked)
    //
    // Why the inline background is written here rather than left to the CSS
    // class alone: inputValueBackgroundHandler sets background-color as an
    // INLINE !important style on every date input twice a second, and an inline
    // !important declaration beats a stylesheet !important rule. The handler
    // therefore skips elements that carry a colouring state (see the matching
    // guard in syncBackground), and this method writes the colour with the same
    // inline+important weight so the two never fight. For the neutral states
    // the override is removed again and ownership handed straight back.
    // -------------------------------------------------------------------------
    _updateExpiryFieldState() {
      const input = document.getElementById('editFieldExpiryDate');
      const hint  = document.getElementById('editFieldExpiryHint');
      if (!input) return EXPIRY_STATE.UNLIMITED;

      const value = (input.value || '').trim();
      const state = _expiryState(value);

      input.dataset.expiryState = state;

      const readVar = (name, fallback) =>
        getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;

      if (state === EXPIRY_STATE.WARNING ||
          state === EXPIRY_STATE.CRITICAL ||
          state === EXPIRY_STATE.EXPIRED) {

        const bg = (state === EXPIRY_STATE.WARNING)
          ? readVar('--expiry-warning-background',  'yellow')
          : readVar('--expiry-critical-background', 'red');

        const fg = (state === EXPIRY_STATE.WARNING)
          ? readVar('--expiry-warning-color',  '#1d1d1f')
          : readVar('--expiry-critical-color', '#ffffff');

        input.style.setProperty('background-color', bg, 'important');
        input.style.setProperty('color', fg, 'important');
      } else {
        // Neutral again: drop the override and restore the value-aware default
        // immediately instead of waiting for the next handler tick.
        input.style.removeProperty('background-color');
        input.style.removeProperty('color');

        const neutral = value
          ? readVar('--input-background', '#E1F5FE')
          : readVar('--card-background',  '#ffffff');

        input.style.setProperty('background-color', neutral, 'important');
      }

      if (hint) {
        hint.textContent          = _expiryHintText(value);
        hint.dataset.expiryState  = state;
      }

      return state;
    }

    _normalizeIssueDate(str) {
      if (!str || typeof str !== 'string') return str;
      const trimmed = str.trim();
      if (!trimmed) return '';

      if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;

      // The map is now the module-level frozen constant ISSUE_DATE_TZ_MAP
      // (see the constants block) instead of a literal re-allocated on every
      // call.
      const tzMap = ISSUE_DATE_TZ_MAP;

      let dateTxt = trimmed.replace(
        /\b([A-Z]{2,4})\s*$/,
        (_, tz) => tzMap[tz] || tz
      );

      const parsed = new Date(dateTxt);
      if (isNaN(parsed.getTime())) return str;

      const yyyy = parsed.getUTCFullYear();
      const mo   = String(parsed.getUTCMonth() + 1).padStart(2, '0');
      const dd   = String(parsed.getUTCDate()).padStart(2, '0');

      return `${yyyy}-${mo}-${dd}`;
    }

    // _normalizeEntry: added 'src' and 'poster' fields for native video entries.
    // Legacy entries that lack these fields are backfilled with empty strings
    // so the rest of the code can always access entry.src and entry.poster
    // without null-checks.
    _normalizeEntry(entry) {
      let ytID;

      if (entry && typeof entry === 'object' && !('author' in entry)) {
        entry.author = '';
      }

      // Add new field title VidoPlayer #1
      if (entry && typeof entry === 'object' && !('title' in entry)) {
        entry.title = '';
      }

      if (entry && typeof entry === 'object' && !('infoLink' in entry)) {
        entry.infoLink = '';
      }

      if (entry && typeof entry === 'object' && !('videoLink' in entry)) {
        entry.videoLink = '';
      }

      // Ensure native-video fields exist on every entry.
      //
      // Bug: the guard `if ('poster' in entry)` was always true because the
      // line above (`if (!('poster' in entry)) entry.poster = ''`) ensures the
      // key is present on every entry before the check runs.  As a result
      // _normalizeEntry() unconditionally overwrote any stored poster URL —
      // replacing it with a freshly synthesised CDN URL (YouTube) or
      // DEFAULT_POSTER (everything else) on every call, including when called
      // during handleImport() / importFromUrlAsync().
      //
      // Fix: only synthesise a poster when the entry genuinely has none
      // (empty string or missing key).  When a non-empty poster is already
      // stored — e.g. from a previous addEntry() / doPostOnPlaying() call —
      // leave it untouched.  The else-branch must also not overwrite a valid
      // native-video poster with DEFAULT_POSTER; it should only fill the gap
      // when both the stored poster and the videoLink yield nothing.
      //
      if (entry && typeof entry === 'object') {
        if (!('src' in entry))    entry.src    = '';
        if (!('poster' in entry)) entry.poster = '';

        // Synthesise a poster only when none is already stored.
        if (!entry.poster || entry.poster === DEFAULT_POSTER) {

          // jadams, 2026-06-12 - to be fixed: entry.videoLink should always set
          //
          if (entry.videoLink) {
            ytID = entry.videoLink ? entry.videoLink.match(YOUTUBE_ID_RE) : null;
          } else if (entry.infoLink) {
            ytID = entry.infoLink ? entry.infoLink.match(YOUTUBE_ID_RE) : null;
          }

          // overload the stored/default poster for YouTube entries
          const isYt = (ytID) ? true : false;
          if (isYt) {
            // Poster images are loaded from the cookieless image CDN
            // i.ytimg.com. img.youtube.com serves the identical images, but
            // as a *.youtube.com host every request carries (and can set)
            // the youtube.com cookies, which Chrome/Lighthouse flags as
            // third-party cookie usage.
            entry.poster = `https://i.ytimg.com/vi/${ytID[1]}/${YOUTUBE_POSTER_QUALITY}.jpg`;
          } else {
            // For non-YouTube entries leave entry.poster as '' so the render
            // helpers can fall back to DEFAULT_POSTER at display time (they
            // already do: `item.poster || DEFAULT_POSTER`).  Storing
            // DEFAULT_POSTER in the playlist record would prevent a real poster
            // from ever being recognised as "missing" in future normalise calls.
          }
        }
      }

      if (entry && typeof entry === 'object') {
        if (!('lastPosition' in entry)) {
          entry.lastPosition = 0;
        }

        if (!('rating' in entry)) {
          entry.rating = 0;
        }

        if (!('issueDate' in entry)) {
          entry.issueDate = '';
        }

        if (entry.issueDate) {
          entry.issueDate = this._normalizeIssueDate(entry.issueDate);
        }

        // Back-fill the optional expiry date on legacy records so every caller
        // can read entry.expiryDate without a null check. The default is
        // EXPIRY_UNLIMITED ('') - an entry never becomes time-limited just
        // because it was written before this field existed.
        if (!('expiryDate' in entry)) {
          entry.expiryDate = EXPIRY_UNLIMITED;
        }

        // Reuse the existing date normaliser: an expiry date has exactly the
        // same 'YYYY-MM-DD' target shape as an issue date, so free-text and
        // timezone-suffixed input is accepted here too.
        if (entry.expiryDate) {
          entry.expiryDate = this._normalizeIssueDate(entry.expiryDate);
        }

        // Back-fill the optional playback window on legacy records so every
        // caller can read entry.startAt / entry.endAt without a null check.
        // The default is '' (feature off) - an entry never gains a playback
        // window just because it was written before these fields existed.
        if (!('startAt' in entry)) {
          entry.startAt = '';
        }

        if (!('endAt' in entry)) {
          entry.endAt = '';
        }
      }

      return entry;
    }

    // Core localStorage accessors
    // -------------------------------------------------------------------------

    load() {
      try {
        const data = localStorage.getItem(this.STORAGE_KEY);
        if (!data) return null;
        const parsed = JSON.parse(data);

        if (Array.isArray(parsed)) {
          parsed.forEach(entry => this._normalizeEntry(entry));
        }
        return parsed;
      } catch (e) {
        logger.error('\n' + `error parsing localStorage data: ${e}`);
        return null;
      }
    }

    // -------------------------------------------------------------------------
    // convertVideoPlayerPlaylist
    //
    // Maps and converts the raw record set produced by load() (the J1
    // localStorage playlist shape) into the item-array shape expected by the
    // videojs-playlist plugin (core.js).  The field-by-field translation is
    // driven entirely by the declarative mapVideoPlayerPlaylist rules object so
    // the mapping stays in one place and is easy to extend.
    //
    // Entries that do not yield a playable `sources` array are dropped: core.js
    // playItem() calls player.src(item.sources) and an empty/missing source
    // list would put the player into an error state.
    //
    // @param  {Array<Object>} rawPlaylist  result of playlistManager.load()
    // @return {Array<Object>}              videojs-playlist ready item list
    // -------------------------------------------------------------------------
    convertVideoPlayerPlaylist(rawPlaylist, poster) {
      if (!Array.isArray(rawPlaylist)) return [];

      // Correctness: `ytID` was declared OUTSIDE the forEach and was only
      // re-assigned when an entry actually HAD a poster. Every entry WITHOUT
      // a poster therefore inherited the PREVIOUS entry's YouTube
      // classification (stale match). On playlists mixing YouTube and native
      // entries, a poster-less native entry that follows a YouTube entry was
      // wrongly treated as YouTube — and with the vjs `poster` option enabled
      // its mapped poster was suppressed (value = null). The match is now a
      // loop-local const computed fresh for every entry; no state can leak
      // between iterations.
      //
      const items = [];

      rawPlaylist.forEach((entry) => {
        if (!entry || typeof entry !== 'object') return;

        const ytID = entry.poster ? entry.poster.match(YOUTUBE_RE) : null;

        // overload the stored/default poster for YouTube entries
        //
        const isYt = (ytID) ? true : false;   
        const item = {};

        // Apply every rule from the mapping object.
        Object.keys(mapVideoPlayerPlaylist).forEach((targetKey) => {
          const rule = mapVideoPlayerPlaylist[targetKey];
          let value;

          // -----------------------------------------------------------------
          // ROOT CAUSE of "skipped entry without a playable source" for EVERY
          // entry (converted 0/N).
          //
          // The YouTube poster overload had been folded INTO the function-rule
          // branch, so `value = rule(entry)` was reached ONLY for the single
          // targetKey 'poster' AND only while (poster && isYt) held. Every
          // OTHER function rule of mapVideoPlayerPlaylist was therefore never
          // executed:
          //
          //   sources     -> _buildPlaylistItemSources(entry)   NEVER RUN
          //   name        -> entry.title || ...                 NEVER RUN
          //   description -> entry.description || ''            NEVER RUN
          //   duration    -> numeric duration                   NEVER RUN
          //
          // `sources` is the ONLY field the guard below tests, so item.sources
          // stayed `undefined` for every record and the guard dropped the
          // whole playlist — regardless of how well-formed the JSON was. The
          // downstream symptom "playlist sync: vjsVideoId '<id>' not found in
          // converted playlist" (#20 sync block) is a pure follow-up error of
          // the resulting EMPTY converted list, not a second defect.
          //
          // Fix: restore the unconditional two-branch rule evaluation (the
          // contract documented for mapVideoPlayerPlaylist: a function rule is
          // called with the entry, a string rule copies entry[rule]) and apply
          // the YouTube poster overload AFTERWARDS as a post-step on the
          // already computed value, where it belongs. String rules were never
          // affected and keep working unchanged.
          //
          // Original (deprecated, preserved for reference):
          //   if (typeof rule === 'function') {
          //     if (targetKey === 'poster' && poster && isYt) {
          //       value = rule(entry);
          //     }
          //   } else if (typeof rule === 'string') {
          //     value = entry[rule];
          //   }
          // -----------------------------------------------------------------
          if (typeof rule === 'function') {
            value = rule(entry);
          } else if (typeof rule === 'string') {
            value = entry[rule];
          }

          // overload the stored/default poster for YouTube entries
          //
          // Gate kept verbatim (`poster` = plugins.playlist.poster option,
          // `isYt` = per-entry YouTube classification, see optimizations #2
          // (a)): for a YouTube record the stored YouTube CDN thumbnail wins
          // over the mapped fallback. It is now a POST-step, so it can no
          // longer suppress the mapping of the remaining keys.
          //
          if (targetKey === 'poster' && poster && isYt) {
            value = entry.poster || value;
          }

          // Omit undefined values so the produced item only carries real data.
          //
          if (value !== undefined) {
            item[targetKey] = value;
          }
        });

        // Guard: a playlist item without a playable source is unusable.
        //
        if (!Array.isArray(item.sources) || item.sources.length === 0 || !item.sources[0].src) {
          isDev && logger.warn('\n' + `playlistmanager: skipped entry without a playable source (videoId: ${entry.videoId || 'n/a'})`);
          return;
        }

        items.push(item);
      });

      isDev && logger.info('\n' + `playlistmanager: converted ${items.length}/${rawPlaylist.length} entries for videojs-playlist`);

      return items;
    }

    save(playlistArray) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(playlistArray));
      this._invalidateSearchIndex();
    }

    // -------------------------------------------------------------------------
    // _loadFromKey(storageKey) / _saveToKey(storageKey, playlistArray)
    //
    // Explicit-key variants of load()/save(). They read/write the localStorage
    // key passed to them rather than the *shared, mutable* instance property
    // this.STORAGE_KEY.
    //
    // Rationale (issue #45 — concurrent preload cross-contamination):
    // PlaylistManager is a SINGLETON (one instance for the whole page, 
    // created once by the UMD factory: `const playlistManager = new PlaylistManager()`).
    //
    // multiPlayer MultiInstance #1
    //
    // NOTE: the SINGLETON statement above is HISTORICAL. Since the
    // multi-instance conversion, createVideoPlayerInstance() runs the whole
    // module body once PER PLAYER, so every player owns a private
    // PlaylistManager and a private _playerID — the cross-instance key
    // mutation described below can no longer occur BETWEEN players.
    // // The explicit-key helpers are kept regardless: they still harden
    // the async preload path against setPlayerID() re-assertions WITHIN
    // one instance and keep the preload destination pinned across awaits.
    //
    // setPlayerID() re-points the single instance's STORAGE_KEY/INDEX_KEY
    // and the module-level _playerID. preloadPlaylists() is async and
    // `await`s a fetch() per file; while one player's preload is suspended
    // on its fetch, a sibling player's setPlayerID() (driven by the adapter's
    // per-player init loop) mutates the same STORAGE_KEY. When the suspended
    // preload resumes, this.load()/this.save() inside _preloadMergeFromUrl()
    // therefore read and write the WRONG player's key — so every preloaded
    // list collapses onto a single player's storage and the players render
    // the same (first) playlist.
    //
    // These helpers let the preload path pin the destination key ONCE
    // (computed from the owning playerId at call time) and stay immune to
    // any concurrent STORAGE_KEY change.
    // They do NOT touch INDEX_KEY: the search index is rebuilt scope-correctly
    // at the end of preloadPlaylists() via buildSearchIndex(); here we only
    // drop the in-memory index reference.
    // -------------------------------------------------------------------------
    _loadFromKey(storageKey) {
      try {
        const data = localStorage.getItem(storageKey);
        if (!data) return null;
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          parsed.forEach(entry => this._normalizeEntry(entry));
        }
        return parsed;
      } catch (e) {
        logger.error('\n' + `error parsing localStorage data (key: ${storageKey}): ${e}`);
        return null;
      }
    }

    _saveToKey(storageKey, playlistArray) {
      localStorage.setItem(storageKey, JSON.stringify(playlistArray));
      this._searchIndex = null;
    }

    // CRUD operations
    // -------------------------------------------------------------------------

    /**
     * playlistManager
     * addEntry - add a new video to the playlist in localStorage.
     *
     * @param {Object}  entry
     * @param {string}  [entry.src]           - full local or remote video URL/path
     * @param {string}  [entry.poster]        - poster image URL for the video
     * @param {string}  [entry.videoId]       - derived filename-without-extension key
     * @param {string}  [entry.videoLink]     - full video URL (identical to src for native)
     * @param {string}  [entry.author]        - author name
     * @param {string}  [entry.category]      - category
     * @param {string}  [entry.description]   - description text, limited to 50 words
     * @param {number}  [entry.duration]      - video duration in seconds
     * @param {string}  [entry.infoLink]      - Info URL
     * @param {string}  [entry.issueDate]     - issue date (ISO string or free text)
     * @param {string}  [entry.expiryDate]    - optional access expiry date (ISO string or free text). Empty string = unlimited (default)
     * @param {number}  [entry.episode]       - episode no for series
     * @param {number}  [entry.lastPosition]  - playback position in seconds
     * @param {number}  [entry.rating]        - video rating 1-5
     * @param {number}  [entry.series]        - set to series no
     * @param {array}   [entry.tags]          - array of tags
     * @param {string}  [entry.title ]        - video title
     * @param {string}  [entry.type ]         - element type
     * @param {string}  [entry.videoLink]     - full YouTube Video URL
     * @param {string}  [entry.videoId]       - YouTube video ID
     * @param {string}  [entry.watchDate]     - ISO date of watching
     */

    // DEPRECATED. addEntry() performed "late" creation: it was invoked from
    // doPostOnPlaying() only once the player reached the 'playing' state, so a
    // playlist record never existed until the video actually started playing.
    // It is superseded by the separated pair createEntry() (early creation, at
    // the moment the video is created in embedRunVideo()) + enrichEntry()
    // (back-fills title/author/poster/duration as the tech resolves them).
    // addEntry() also could NOT update an entry that already existed - it
    // simply skipped - which is exactly why metadata back-filling now goes
    // through enrichEntry(). The method is retained unchanged for backward
    // compatibility (external/legacy callers); the module itself no longer
    // calls it. Prefer createEntry()/enrichEntry() for new code.
    //
    addEntry(entry) {
      const playlist = this.load() || [];

      const found = (playlist.find(item => item.videoId === entry.videoId)) ? true : false;
      if (found) {
        isDev && logger.info('\n' + `playlistmanager: skip adding entry with title: ${entry.title}`);
        return;
      }

      // Added 'src' and 'poster' fields.
      // 'videoLink' now defaults to entry.src (the local/remote video path)
      // instead of a YouTube watch URL.
      const record = {
        author:       entry.author        || '',
        category:     entry.category      || '',
        creator:      'videoPlayer',
        description:  entry.description   || '',
        duration:     entry.duration      || 0,
        infoLink:     entry.infoLink      || '',
        issueDate:    this._normalizeIssueDate(entry.issueDate || ''),
        expiryDate:   this._normalizeIssueDate(entry.expiryDate || EXPIRY_UNLIMITED),
        startAt:      entry.startAt       || '',
        endAt:        entry.endAt         || '',
        audioFadeIn:  _normalizeAudioFadeInField(entry.audioFadeIn),
        episode:      entry.episode       || 0,
        lastPosition: entry.lastPosition  || 0,
        poster:       entry.poster        || '',
        rating:       entry.rating        || 0,
        series:       entry.series        || 0,
        src:          entry.src           || '',
        tags:         entry.tags          || [],
        title:        entry.title         || '',
        type:         entry.type          || 'video/mp4',
        videoLink:    entry.videoLink     || entry.src || '',
        videoId:      entry.videoId,
        watchDate:    new Date().toISOString()
      };

      const filtered = playlist.filter(item => item.videoId !== entry.videoId);
      filtered.unshift(record);
      this.save(filtered);

      isDev && logger.info('\n' + `playlistmanager: entry added for videoId: ${entry.videoId}`);

      this.renderCurrent();
    }

    // createEntry - EARLY, isolated playlist creation.
    //
    // Creates the playlist record as soon as the video is *created* (its source
    // is known in embedRunVideo()), decoupled from playback. This replaces the
    // "late" addEntry() path that only ran on the 'playing' state.
    //
    // Only the fields known at creation time need to be supplied; everything
    // the tech resolves asynchronously (title, author, duration, native poster)
    // is back-filled later by enrichEntry()/updateEntry*(). The record shape is
    // identical to the one addEntry() produced, plus a `createDate` marker.
    //
    // Idempotent: if a record for entry.videoId already exists it is returned
    // untouched (no overwrite, no re-render, no duplicate), so re-embedding the
    // same video - or the defensive createEntry() call still left in
    // doPostOnPlaying() - never resets or duplicates it.
    //
    // watchDate is seeded to the creation timestamp so the existing watchDate
    // sort order behaves exactly as it did when addEntry() stamped it on first
    // play; updateWatchDate() refreshes it on the first 'playing' event.
    //
    // @param  {Object}      entry            same field set accepted by addEntry()
    // @return {Object|null}                  the created (or pre-existing) record
    //
    createEntry(entry) {
      if (!entry || !entry.videoId) {
        isDev && logger.warn('\n' + 'playlistmanager: createEntry skipped - missing videoId');
        return null;
      }

      const playlist = this.load() || [];

      const existing = playlist.find(item => item.videoId === entry.videoId);
      if (existing) {
        isDev && logger.debug('\n' + `playlistmanager: createEntry - entry already exists for videoId: ${entry.videoId}`);
        return existing;
      }

      const now = new Date().toISOString();

      const record = {
        author:       entry.author        || '',
        category:     entry.category      || '',
        creator:      'videoPlayer',
        description:  entry.description   || '',
        duration:     entry.duration      || 0,
        infoLink:     entry.infoLink      || '',
        issueDate:    this._normalizeIssueDate(entry.issueDate || ''),
        expiryDate:   this._normalizeIssueDate(entry.expiryDate || EXPIRY_UNLIMITED),
        startAt:      entry.startAt       || '',
        endAt:        entry.endAt         || '',
        audioFadeIn:  _normalizeAudioFadeInField(entry.audioFadeIn),
        episode:      entry.episode       || 0,
        lastPosition: entry.lastPosition  || 0,
        poster:       entry.poster        || '',
        rating:       entry.rating        || 0,
        series:       entry.series        || 0,
        src:          entry.src           || '',
        tags:         entry.tags          || [],
        title:        entry.title         || '',
        type:         entry.type          || 'video/mp4',
        videoLink:    entry.videoLink     || entry.src || '',
        videoId:      entry.videoId,
        createDate:   now,
        watchDate:    entry.watchDate     || now
      };

      playlist.unshift(record);
      this.save(playlist);

      isDev && logger.info('\n' + `playlistmanager: entry created (early) for videoId: ${entry.videoId}`);

      this.renderCurrent();
      return record;
    }

    // enrichEntry - back-fill metadata that only becomes available AFTER the
    // record was created: title/author resolved by the tech, the real poster,
    // the measured duration, canonical links. It is the "separated" counterpart
    // to createEntry(): creation captures what is known at load time;
    // enrichEntry() fills in the rest as it arrives.
    //
    // By default a field is written ONLY when the stored value is still empty /
    // a placeholder (poster === DEFAULT_POSTER counts as empty), so it never
    // clobbers a value the user edited in the playlist panel or one an earlier
    // resolution already supplied. Pass force=true to overwrite regardless.
    //
    // This is exactly what addEntry() could not do - addEntry() skipped any
    // record that already existed, leaving the early-created stub un-enriched.
    //
    // @param  {string}  videoId
    // @param  {Object}  meta              { title, author, infoLink, videoLink,
    //                                        src, type, poster, duration }
    // @param  {boolean} [force]           overwrite non-empty fields too
    // @return {boolean}                   true when at least one field changed
    //
    enrichEntry(videoId, meta, force) {
      if (!videoId || !meta) return false;

      const playlist = this.load() || [];
      const entry    = playlist.find(item => item.videoId === videoId);
      if (!entry) return false;

      let changed = false;

      const isBlank = (v) => (v === undefined || v === null || v === '');

      const fillString = (key, value) => {
        if (isBlank(value)) return;
        if (!force && !isBlank(entry[key])) return;
        if (entry[key] === value) return;
        entry[key] = value;
        changed = true;
      };

      fillString('title',     meta.title);
      fillString('author',    meta.author);
      fillString('infoLink',  meta.infoLink);
      fillString('videoLink', meta.videoLink);
      fillString('src',       meta.src);
      fillString('type',      meta.type);

      // duration: 0 counts as "not yet measured"
      if (typeof meta.duration === 'number' && meta.duration > 0) {
        if ((force || !entry.duration) && entry.duration !== meta.duration) {
          entry.duration = meta.duration;
          changed = true;
        }
      }

      // poster: DEFAULT_POSTER is treated as "no real poster yet"
      if (meta.poster) {
        const hasReal = entry.poster && entry.poster !== DEFAULT_POSTER;
        if ((force || !hasReal) && entry.poster !== meta.poster) {
          entry.poster = meta.poster;
          changed = true;
        }
      }

      if (!changed) return false;

      this.save(playlist);

      isDev && logger.info('\n' + `playlistmanager: entry enriched for videoId: ${videoId}`);

      this.renderCurrent();
      return true;
    }

    updateEntryDuration(videoId, durationSeconds) {
      if (!videoId || !durationSeconds || durationSeconds <= 0) return;

      const playlist = this.load() || [];
      const entry   = playlist.find(item => item.videoId === videoId);
      if (!entry) return;

      entry.duration = durationSeconds;
      this.save(playlist);

      isDev && logger.info('\n' + `playlistmanager: duration updated for video with id: ${videoId} - ${this._formatDuration(durationSeconds)}`);

      this.renderCurrent();
    }

    // updateEntryPoster - store a poster (a Base64 data-URL produced by
    // generateNativePoster(), or any URL) on the playlist entry identified by
    // videoId and persist it to localStorage. By default it only writes when
    // the entry has no real poster yet (empty string or DEFAULT_POSTER) so an
    // explicitly supplied poster is never clobbered; pass force=true to
    // overwrite. The write and re-render are skipped when nothing changed.
    // Returns true when the entry was updated.
    updateEntryPoster(videoId, poster, force) {
      if (!videoId || !poster) return false;

      const playlist = this.load() || [];
      const entry    = playlist.find(item => item.videoId === videoId);
      if (!entry) return false;

      const hasReal = entry.poster && entry.poster !== DEFAULT_POSTER;
      if (hasReal && !force)      return false;
      if (entry.poster === poster) return false;

      entry.poster = poster;
      this.save(playlist);

      isDev && logger.info('\n' + `playlistmanager: poster updated for videoId: ${videoId} (${poster.length} bytes)`);

      this.renderCurrent();
      return true;
    }

    // generatePosterForEntry - resolve the native src of a single playlist
    // entry and, when it still has no poster, capture one off-screen via
    // generateNativePoster() and store it through updateEntryPoster(). YouTube
    // entries and entries that already carry a real poster are skipped.
    // Returns a Promise<boolean> indicating whether a poster was stored.
    generatePosterForEntry(videoId) {
      if (!videoId) return Promise.resolve(false);

      const cfg = _resolveNativePosterConfig();
      if (!cfg.enabled) return Promise.resolve(false);

      const playlist = this.load() || [];
      const entry    = playlist.find(item => item.videoId === videoId);
      if (!entry) return Promise.resolve(false);

      // Already has a usable poster -> nothing to do.
      if (entry.poster && entry.poster !== DEFAULT_POSTER) return Promise.resolve(false);

      const src = entry.src || entry.videoLink || '';
      if (!_isNativeVideoSource(src)) return Promise.resolve(false);

      return generateNativePoster(src).then((dataUrl) => {
        if (!dataUrl) return false;
        return this.updateEntryPoster(videoId, dataUrl);
      });
    }

    // generateMissingNativePosters - scan the stored playlist for native-video
    // entries that still lack a real poster and generate one for each. Runs
    // SEQUENTIALLY (one decode at a time) so importing a large playlist does
    // not spawn dozens of concurrent <video> decodes; each capture is bounded
    // by the generator's own timeout. updateEntryPoster() already re-renders
    // per stored poster; a final renderCurrent() guarantees the view reflects
    // the last write. Returns a Promise<number> = count of posters generated.
    generateMissingNativePosters() {
      const cfg = _resolveNativePosterConfig();
      if (!cfg.enabled) return Promise.resolve(0);

      const playlist = this.load() || [];
      const pending  = playlist.filter((entry) => {
        if (!entry || typeof entry !== 'object') return false;
        if (entry.poster && entry.poster !== DEFAULT_POSTER) return false;
        const src = entry.src || entry.videoLink || '';
        return _isNativeVideoSource(src);
      });

      if (pending.length === 0) return Promise.resolve(0);

      isDev && logger.info('\n' + `playlistmanager: generating posters for ${pending.length} native entr${pending.length === 1 ? 'y' : 'ies'}`);

      let count = 0;

      return pending.reduce((chain, entry) => {
        return chain.then(() => this.generatePosterForEntry(entry.videoId).then((done) => {
          if (done) count++;
        }));
      }, Promise.resolve()).then(() => {
        if (count > 0) this.renderCurrent();
        isDev && logger.info('\n' + `playlistmanager: generated ${count} native poster(s)`);
        return count;
      });
    }

    // updateEntryAuthor retained for compatibility; for native videos the
    // author field is set from the title/metadata stored in the entry itself
    // or left blank when the source does not provide one.
    updateEntryAuthor(videoId, author) {
      if (!videoId || !author) return;

      const playlist = this.load() || [];
      const entry   = playlist.find(item => item.videoId === videoId);
      if (!entry) return;

      if (entry.author === author) return;

      entry.author = author;
      this.save(playlist);

      isDev && logger.info('\n' + `playlist entry author updated for videoId: ${videoId} - ${author}`);

      this.renderCurrent();
    }

    updateEntryPosition(videoId, positionSeconds) {
      if (!videoId || positionSeconds == null || positionSeconds < 0) return;

      const playlist = this.load() || [];
      const entry   = playlist.find(item => item.videoId === videoId);
      if (!entry) return;

      entry.lastPosition = positionSeconds;
      this.save(playlist);

      isDev && logger.info('\n' + `playlistmanager: position updated for video with id: ${videoId} - ${positionSeconds}s`);
    }

    updateWatchDate(videoId) {
      if (!videoId) return;

      const playlist = this.load() || [];
      const entry    = playlist.find(item => item.videoId === videoId);
      if (!entry) return;

      entry.watchDate = new Date().toISOString();
      this.save(playlist);

      isDev && logger.info('\n' + `playlistmanager: watchDate updated for video with id: ${videoId}`);

      this.renderCurrent();
    }

    updateEntryRating(videoId, rating) {
      if (!videoId || rating == null) return;

      const playlist = this.load() || [];
      const entry   = playlist.find(item => item.videoId === videoId);
      if (!entry) return;

      entry.rating = rating;
      this.save(playlist);

      isDev && logger.info('\n' + `playlistmanager: rating updated for videoId: ${videoId} - ${rating}`);

      this.renderCurrent();
    }

    updateEntryFields(videoId, fields) {
      if (!videoId || !fields) return;

      const playlist = this.load() || [];
      const entry   = playlist.find(item => item.videoId === videoId);
      if (!entry) return;

      if ('category'    in fields) entry.category     = fields.category;
      if ('title'       in fields) entry.title        = fields.title;
      if ('description' in fields) entry.description  = fields.description;
      if ('episode'     in fields) entry.episode      = fields.episode;
      if ('infoLink'    in fields) entry.infoLink     = fields.infoLink;
      if ('videoLink'   in fields) entry.videoLink    = fields.videoLink;
      if ('issueDate'   in fields) entry.issueDate    = this._normalizeIssueDate(fields.issueDate);
      if ('expiryDate'  in fields) entry.expiryDate   = this._normalizeIssueDate(fields.expiryDate || EXPIRY_UNLIMITED);
      if ('startAt'     in fields) entry.startAt      = _secondsToTimeInputValue(_parseTimeToSeconds(fields.startAt));
      if ('endAt'       in fields) entry.endAt        = _secondsToTimeInputValue(_parseTimeToSeconds(fields.endAt));
      if ('audioFadeIn' in fields) entry.audioFadeIn  = _normalizeAudioFadeInField(fields.audioFadeIn);
      if ('series'      in fields) entry.series       = fields.series;
      if ('tags'        in fields) entry.tags         = fields.tags;
      if ('type'        in fields) entry.type         = fields.type;

      this.save(playlist);

      isDev && logger.info('\n' + `playlistmanager: fields updated for videoId: ${videoId}`);

      this.renderCurrent();
    }

    getEntryPosition(videoId) {
      if (!videoId) return 0;

      const playlist = this.load() || [];
      const entry   = playlist.find(item => item.videoId === videoId);
      return (entry && entry.lastPosition > 0) ? entry.lastPosition : 0;
    }

    // getEntry
    // Returns the full playlist entry record for a given videoId, or null when
    // none exists. Added so callers (e.g. the header-title updater in
    // doPostOnPlaying) can read the canonical entry.title back from the
    // persisted playlist rather than re-deriving it from per-tech metadata.
    getEntry(videoId) {
      if (!videoId) return null;
      const playlist = this.load() || [];
      return playlist.find(item => item.videoId === videoId) || null;
    }

    getNextVideoId(currentVideoId) {
      if (!currentVideoId) return null;

      const playlist = this.load() || [];
      if (playlist.length < 2) return null;

      this._applySortOrder(playlist);

      const currentIndex = playlist.findIndex(item => item.videoId === currentVideoId);
      if (currentIndex < 0) return null;

      if (currentIndex >= playlist.length - 1) return null;

      return playlist[currentIndex + 1].videoId;
    }

    deleteEntry(videoId) {
      const playlist = this.load() || [];
      const updated = playlist.filter(item => item.videoId !== videoId);

      if (updated.length === playlist.length) {
        isDev && logger.warn('\n' + `playlist entry not found for videoId: ${videoId}`);
        return;
      }

      this.save(updated);
      isDev && logger.info('\n' + `playlist entry deleted for videoId: ${videoId}`);

      // Guard: if the deleted entry is the one currently marked active, drop
      // the tracked active videoId. Otherwise _activeVideoId keeps pointing at
      // a videoId that no longer has a matching element. That is harmless for
      // the render that follows (nothing to mark), but it is a stale value
      // that would wrongly re-activate an element if the same videoId were
      // re-added later. renderCurrent() below then re-renders with the cleared
      // state, so every entry ends up with data-item-active="false".
      //
      if (this._activeVideoId && this._activeVideoId === videoId) {
        this._activeVideoId = null;
      }

      this.renderCurrent();
    }

    clearPlaylist() {
      const playlist = this.load() || [];
      if (playlist.length === 0) {
        return false;
      }

      localStorage.removeItem(this.STORAGE_KEY);
      this._invalidateSearchIndex();

      isDev && logger.info('\n' + `cleared ${playlist.length} items from localStorage key: ${this.STORAGE_KEY}`);

      // Same guard as deleteEntry(), for the bulk case: clearing the playlist
      // removes every entry (including any active one), so the tracked active
      // videoId must be dropped to avoid a stale value re-activating a future
      // entry. Also covers the "Clear with backup" path, which routes through
      // clearPlaylist().
      //
      this._activeVideoId = null;
      this._manageHiddenMode(false);
      this.renderCurrent();

      return true;
    }

    // Import / Export
    // -------------------------------------------------------------------------

    importFromUrl(url) {
      fetch(url)
        .then(res => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then(data => {
          if (!Array.isArray(data)) {
            logger.error('\n' + 'imported URL does not contain a JSON array');
            return;
          }
          const hasMetaData = data.some(entry => entry.type === 'metaData');
          const videos      = hasMetaData ? data.filter(entry => entry.type === 'video') : data;

          videos.forEach(entry => this._normalizeEntry(entry));

          if (this._mergeMode) {
            const existing    = this.load() || [];
            const existingIds = new Set(existing.map(e => e.videoId));
            const newEntries  = videos.filter(e => !existingIds.has(e.videoId));
            const merged      = existing.concat(newEntries);
            this.save(merged);
            isDev && logger.info('\n' + `merged ${newEntries.length} new items (${videos.length - newEntries.length} duplicates skipped) into localStorage on key: ${this.STORAGE_KEY}`);
          } else {
            this.save(videos);
            isDev && logger.info('\n' + `imported ${videos.length} of ${data.length} items into localStorage on key: ${this.STORAGE_KEY}`);
          }
          this.renderCurrent();
        })
        .catch(err => logger.error('\n' + `import from URL failed: ${err}`));
    }

    async importFromUrlAsync(url) {
      try {
        const res  = await fetch(url);
        if (!res.ok) {
          logger.error('\n' + `import from URL failed: HTTP ${res.status}`);
          return;
        }
        const data = await res.json();

        // Bug: a YouTube (or any) playlist loaded via 'serverPlaylistLoadButton*'
        // never reached _normalizeEntry().
        //
        // Root cause: server playlists exported by this module (see
        // exportToFile(), which writes `JSON.stringify(this.load())`) and legacy
        // YouTube playlists are *plain JSON arrays*. The previous guard
        //
        //  if (data && typeof data === 'object' && !data.playlist) { return; }
        //
        // returned early for every plain array, because `typeof [] === 'object'`
        // is true and an array has no `.playlist` property — so `!data.playlist`
        // is true. The function bailed out before the
        // `playlist.forEach(entry => this._normalizeEntry(entry))` line below
        // was ever reached.
        //
        // A secondary defect: when `data` was a wrapped object *without*
        // meta_data (`{ playlist: [...] }`), the old line
        // `hasMetaData ? data.playlist : data` assigned the whole object (not its
        // array) to `playlist`, and the later `playlist.forEach(...)` threw a
        // TypeError — again never reaching _normalizeEntry.
        //
        // Fix: normalise both supported shapes to a real array before iterating:
        //
        //   1. plain array        ->  [ {...}, {...} ]
        //   2. wrapped object     ->  { meta_data?: {...}, playlist: [ {...} ] }
        //
        // Reject only genuinely invalid payloads (no usable array of entries).
        //
        const playlist = Array.isArray(data)
          ? data
          : (data && typeof data === 'object' && Array.isArray(data.playlist)
              ? data.playlist
              : null);

        if (!Array.isArray(playlist)) {
          logger.error('\n' + 'imported URL does not contain a valid playlist (expected a JSON array or an object with a "playlist" array)');
          return;
        }

        playlist.forEach(entry => this._normalizeEntry(entry));

        if (this._mergeMode) {
          const existing    = this.load() || [];
          const existingIds = new Set(existing.map(e => e.videoId));
          const newEntries  = playlist.filter(e => !existingIds.has(e.videoId));
          const merged      = existing.concat(newEntries);
          this.save(merged);
          isDev && logger.info('\n' + `merged ${newEntries.length} new items (${playlist.length - newEntries.length} duplicates skipped) into localStorage on key: ${this.STORAGE_KEY}`);
        } else {
          this.save(playlist);
          isDev && logger.info('\n' + `imported ${playlist.length} items into localStorage on key: ${this.STORAGE_KEY}`);
        }
        this.renderCurrent();
      } catch (err) {
        logger.error('\n' + `import from URL failed: ${err}`);
      }
    }

    // -------------------------------------------------------------------------
    // preloadPlaylists(preloadList, baseUrl, playerId)
    //
    // Loads one or more configured playlist files into the player instance's
    // localStorage on page load. The list originates from the per-player
    // `playlist.preload` key in videoPlayer_control.yml and is forwarded by the
    // adapter (initHandlers -> _resolvePreloadList). Relative file names are
    // resolved against `baseUrl` (the `playlist_url_base` config value); entries
    // that are already absolute (http(s):// or a leading '/') are used unchanged.
    //
    // Behaviour (intentional — mirrors the control-yml comment
    // "Playlists are merged into the instance's localStorage on page load"):
    //   • MERGE, never overwrite. Existing entries are kept; only entries whose
    //     videoId is not already present are added. The call is therefore
    //     non-destructive (user-added videos, ratings, watch positions survive)
    //     and idempotent (re-running on every reload never duplicates).
    //   • All reads/writes go through this.load() / this.save(), so preload
    //     always targets whatever STORAGE_KEY the manager currently uses for the
    //     instance and follows that key automatically.
    //
    // The method is fire-and-forget (async). It handles its own errors, rebuilds
    // the search index, re-asserts the owning player id and re-renders the panel
    // when finished so the preloaded content is visible without further
    // interaction.
    //
    // NOTE: it deliberately does NOT auto-embed/play the first video — preload
    // only seeds the playlist. Auto-play on load would conflict with the
    // existing autoStart/init path. (See handleLoadFromServer() for the
    // load-and-pause variant used for user-triggered server loads.)
    //
    // @param  {Array<string>} preloadList  file names or URLs to preload
    // @param  {string}        [baseUrl]    base for relative file names
    // @param  {string}        [playerId]   owning player id (render scoping)
    // @return {Promise<number>}            count of newly added entries
    // -------------------------------------------------------------------------
    async preloadPlaylists(preloadList, baseUrl, playerId) {
      if (!Array.isArray(preloadList) || preloadList.length === 0) {
        isDev && logger.info('\n' + 'playlistManager: preload skipped — no playlists configured');
        return 0;
      }

      const base = String(baseUrl || PLAYLIST_URL_BASE).replace(/\/+$/, '');
      let totalAdded = 0;

      // Pin the destination localStorage key ONCE, derived from the owning
      // playerId passed by the adapter, using the same rule setPlayerID() uses
      // (bare base key when no id). Every merge below writes to THIS key via the
      // explicit-key helpers, so a sibling player's setPlayerID() firing while
      // this async preload is suspended on a fetch() can no longer redirect the
      // merge to the wrong player's storage. When playerId is falsy the value
      // falls back to the currently configured STORAGE_KEY, preserving the
      // single-player / test behaviour unchanged.
      //
      const targetStorageKey = playerId
        ? `${this._BASE_STORAGE_KEY}_${playerId}`
        : this.STORAGE_KEY;

      for (let i = 0; i < preloadList.length; i++) {
        const fileName = preloadList[i];
        if (!fileName || typeof fileName !== 'string') continue;

        const url = this._resolvePreloadUrl(fileName, base);
        try {
          const added = await this._preloadMergeFromUrl(url, targetStorageKey);
          totalAdded += added;
          isDev && logger.info('\n' + `playlistManager: preload "${url}" — ${added} new entr${added === 1 ? 'y' : 'ies'} merged`);
        } catch (e) {
          logger.error('\n' + `playlistManager: preload "${url}" failed: ${e}`);
        }
      }

      // Re-assert the owning player id before any DOM work so renderCurrent()
      // (which resolves element ids via _pid()) targets the correct player even
      // if a sibling instance changed the shared module-level _playerID while
      // this async preload was in flight.
      //
      if (playerId) this.setPlayerID(playerId);

      // Rebuild the search index from the merged set (save() invalidated it).
      //
      try {
        if (typeof lunr !== 'undefined') this.buildSearchIndex();
      } catch (e) {
        isDev && logger.warn('\n' + `playlistManager: preload search-index rebuild failed: ${e}`);
      }

      // The preloaded content decides the DEFAULT display order: a series
      // playlist (series > 0 / episode > 0, e.g. the shipped album exports)
      // opens sorted by episode, every other playlist by date (newest).
      //
      // Applied here, BEFORE the render below, because preload is async: it
      // may finish long after playlistSortHandler.init() has already settled
      // on a criterion for the then still empty (or previous) playlist. An
      // explicit user choice from an earlier session (localStorage
      // _pid('searchMode')) is respected and wins — hence `true`.
      //
      this.applyDefaultSortCriterion(null, true);

      // Reflect the preloaded playlist in the UI (panel content + toggle button).
      //
      this.renderCurrent();

      // Backfill posters for native-video entries that arrived without one
      // (mirror of the server-load backfill). Fire-and-forget.
      //
      if (typeof this.generateMissingNativePosters === 'function') {
        this.generateMissingNativePosters()
          .catch((e) => { isDev && logger.warn('\n' + `playlistManager: preload poster backfill failed: ${e}`); });
      }

      isDev && logger.info('\n' + `playlistManager: preload finished — ${totalAdded} new entr${totalAdded === 1 ? 'y' : 'ies'} added from ${preloadList.length} file(s)`);
      return totalAdded;
    }

    // _resolvePreloadUrl(fileName, base)
    // Join a configured preload file name to the base URL. Absolute inputs
    // (http(s):// or a leading '/') are returned unchanged; otherwise the file
    // name is appended to `base` with exactly one separating slash.
    _resolvePreloadUrl(fileName, base) {
      if (/^https?:\/\//i.test(fileName) || fileName.charAt(0) === '/') {
        return fileName;
      }
      return `${base}/${fileName.replace(/^\/+/, '')}`;
    }

    // _preloadMergeFromUrl(url)
    // Fetch a single playlist file and MERGE its entries (by videoId) into the
    // current localStorage playlist. Accepts both the plain-array and the
    // { playlist: [...] } shapes (same as importFromUrlAsync()). Returns the
    // number of newly added entries (0 when nothing new, or on error).
    //
    // A second, optional `storageKey` argument pins the localStorage key for
    // this merge. When omitted it defaults to the shared this.STORAGE_KEY so
    // any other caller keeps the previous behaviour; preloadPlaylists() always
    // passes the per-player key it derived up front.
    //
    async _preloadMergeFromUrl(url, storageKey) {
      const _key = storageKey || this.STORAGE_KEY;
      const res = await fetch(url);
      if (!res.ok) {
        logger.error('\n' + `playlistManager: preload fetch failed: HTTP ${res.status} (${url})`);
        return 0;
      }

      const data = await res.json();

      const incoming = Array.isArray(data)
        ? data
        : (data && typeof data === 'object' && Array.isArray(data.playlist) ? data.playlist : null);

      if (!Array.isArray(incoming)) {
        logger.error('\n' + `playlistManager: preload payload is not a valid playlist (expected a JSON array or an object with a "playlist" array): ${url}`);
        return 0;
      }

      incoming.forEach(entry => this._normalizeEntry(entry));

      const existing    = this._loadFromKey(_key) || [];
      const existingIds  = new Set(existing.map(e => e && e.videoId));
      const newEntries   = incoming.filter(e => e && e.videoId && !existingIds.has(e.videoId));

      if (newEntries.length === 0) {
        isDev && logger.debug('\n' + `playlistManager: preload "${url}" — all entries already present, nothing merged`);
        return 0;
      }

      this._saveToKey(_key, existing.concat(newEntries));
      return newEntries.length;
    }

    importFromFile() {
      const fileInput = document.createElement('input');
      fileInput.type  = 'file';
      fileInput.accept = '.json,application/json';

      fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target.result);

            let videos;
            let totalCount;

            if (data && typeof data === 'object' && data.playlist) {
              videos     = data.playlist;
              totalCount = videos.length + (data.meta_data ? 1 : 0);
              isDev && logger.info('\n' + 'imported file uses new format (meta_data + playlist)');
            } else {
              logger.error('\n' + 'imported file does not contain a valid playlist format');
              return;
            }

            videos.forEach(entry => this._normalizeEntry(entry));
            this.save(videos);
            isDev && logger.info('\n' + `imported ${videos.length} of ${totalCount} items from file: ${file.name}`);
            this.renderCurrent();
          } catch (err) {
            logger.error('\n' + `import from file failed: ${err}`);
          }
        };
        reader.readAsText(file);
      });

      fileInput.click();
    }

    exportToFile(filename) {
      if (!filename) {
        filename = `videoPlayer-playlist_${this._formatTimestamp()}.json`;
      }
      const playlist = this.load();
      if (!playlist || playlist.length === 0) {
        isDev && logger.warn('\n' + 'no playlist data to export');
        return;
      }

      const blob = new Blob(
        [JSON.stringify(playlist, null, 2)],
        { type: 'application/json' }
      );
      const url = URL.createObjectURL(blob);
      const a   = document.createElement('a');

      a.href     = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();

      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      isDev && logger.info('\n' + `exported ${playlist.length} items to file: ${filename}`);
    }

    // backupToFile - write a downloadable safety backup of the current
    // playlist BEFORE a destructive operation (e.g. clearPlaylist).
    //
    // Unlike exportToFile (which writes a bare array), the backup is wrapped
    // in a { backup_date, playlist } envelope so that re-importing it through
    // handleFileSelected() is recognised as a dated backup file (the import
    // path keys off the presence of `backup_date`).
    //
    // Returns true when a backup was written, false when there was nothing to
    // back up (mirrors clearPlaylist()'s empty-guard so callers can branch).
    //
    // @param {string} [filename] - download file name
    //                              (defaults to videoPlayer-playlist-backup.json)
    backupToFile(filename) {
      if (!filename) {
        filename = 'videoPlayer-playlist-backup.json';
      }
      const playlist = this.load();
      if (!playlist || playlist.length === 0) {
        isDev && logger.warn('\n' + 'no playlist data to back up');
        return false;
      }

      const backup = {
        backup_date : new Date().toISOString(),
        playlist    : playlist
      };

      const blob = new Blob(
        [JSON.stringify(backup, null, 2)],
        { type: 'application/json' }
      );
      const url = URL.createObjectURL(blob);
      const a   = document.createElement('a');

      a.href     = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();

      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      isDev && logger.info('\n' + `backed up ${playlist.length} items to file: ${filename}`);
      return true;
    }

    // Media export (download of the plain audio/video FILES)
    // -------------------------------------------------------------------------
    // exportToFile()/backupToFile() above write the playlist META DATA as
    // JSON. The three methods below write the MEDIA itself to the browser's
    // local download folder. They are public members of the instance API, so
    // an adapter can drive them directly:
    //
    //     const vp = videoPlayer('player_1');
    //     vp.playlistManager.downloadEntry('<videoId>');
    //     vp.playlistManager.downloadAllEntries();
    //
    // See the MEDIA EXPORT section header near _getEntryDownloadSource() for
    // the same-origin/cross-origin rules the browser imposes here.
    // -------------------------------------------------------------------------

    /**
     * _getDownloadableEntries - the entries of the ACTIVE view (search result
     * when a search is active, otherwise the stored playlist) that carry a
     * plain, downloadable media file.
     *
     * @param  {Array}  [data] - optional pre-resolved view data
     * @returns {Array}          possibly empty, never null
     */
    _getDownloadableEntries(data) {
      if (!data) data = this._searchResults || this.load() || [];
      return data.filter(_isDownloadableEntry);
    }

    /**
     * downloadEntry - exports the media file of ONE playlist entry.
     *
     * The lookup runs against the FULL stored playlist (not the filtered
     * view) so the method stays callable from an adapter with any videoId.
     *
     * @param  {string}       videoId
     * @param  {HTMLElement} [btnEl] - the clicked button; gets a 'busy' state
     *                                 for the duration of the transfer
     * @returns {Promise<boolean>} true when the download was handed to the browser
     */
    async downloadEntry(videoId, btnEl) {
      if (!videoId) {
        isDev && logger.warn('\n' + 'playlistManager: downloadEntry called without a videoId');
        return false;
      }

      const playlist = this.load() || [];
      const entry    = playlist.find(item => item.videoId === videoId);

      if (!entry) {
        // The click reached a row whose record is gone (deleted or replaced
        // between render and click) — report it instead of failing silently.
        //
        _showToast('Export failed: the playlist entry no longer exists.', 'error', 5000);
        logger.error('\n' + `playlistManager: downloadEntry — no playlist entry for videoId: ${videoId}`);
        return false;
      }

      const source = _getEntryDownloadSource(entry);
      if (!source) {
        // Reachable only through an adapter call (the button is never rendered
        // for a non-downloadable entry), so the message names the reason.
        //
        _showToast(`"${entry.title || videoId}" cannot be exported: it is a streaming or YouTube item, not a media file.`, 'error', 5000);
        isDev && logger.warn('\n' + `playlistManager: downloadEntry — entry "${entry.title || videoId}" has no plain media source (streaming/YouTube items cannot be exported)`);
        return false;
      }

      const filename = _buildDownloadFileName(entry, source);

      // One progress toast per item, updated in place to the final result
      // below. The label prefers the playlist title and falls back to the
      // generated file name so the toast always names something the user
      // recognises. This covers the <playlist-cards> path too: the web
      // component dispatches 'playlist-download' and the adapter routes it to
      // exactly this method (see playlistCards.mjs _onDownloadClick).
      //
      const dlLabel = (entry.title && String(entry.title).trim()) ? String(entry.title).trim() : filename;
      const dlToast = _showProgressToast(`Exporting "${dlLabel}" ...`);

      if (btnEl) {
        btnEl.classList.add('busy');
        btnEl.setAttribute('disabled', '');
        btnEl.setAttribute('aria-busy', 'true');
      }

      const succeeded = await _downloadMediaSource(source.url, filename);

      if (btnEl) {
        btnEl.classList.remove('busy');
        btnEl.removeAttribute('disabled');
        btnEl.setAttribute('aria-busy', 'false');
      }

      // Three outcomes, three messages (see _lastDownloadOutcome):
      //   success            -> 'success' toast naming the exported item
      //   CORS fallback tab  -> 'info' toast; the transfer did NOT happen but
      //                         the user CAN save the file by hand, so this is
      //                         an instruction, not an error
      //   everything else    -> 'error' toast
      //
      if (succeeded) {
        dlToast.resolve(`Export finished: "${dlLabel}"`, 'success');
      } else if (_lastDownloadOutcome === 'manual-tab') {
        dlToast.resolve(`"${dlLabel}" could not be transferred directly (the media host sends no CORS headers). It was opened in a new tab — save it from there.`, 'info', 8000);
      } else {
        dlToast.resolve(`Export failed: "${dlLabel}"`, 'error', 5000);
      }

      return succeeded;
    }

    /**
     * downloadAllEntries - exports the media files of ALL downloadable items
     * of the ACTIVE playlist (a running search narrows the set to the visible
     * result, exactly like the rendered view).
     *
     * The transfers run STRICTLY SEQUENTIALLY with DOWNLOAD_SEQUENCE_DELAY_MS
     * between them: browsers throttle or silently drop downloads that are
     * fired in one burst. A failing item never aborts the batch.
     *
     * Re-entrancy: a second call while a batch is running is refused through
     * the _downloadInProgress latch.
     *
     * @returns {Promise<{total: number, succeeded: number, failed: number}>}
     */
    async downloadAllEntries() {
      if (this._downloadInProgress) {

        // The button is disabled while a batch runs, so this is reachable only
        // through a second adapter call — tell the user why nothing happened
        // instead of dropping the request silently.
        //
        _showToast('A media export is already running. Please wait for it to finish.', 'info');
        isDev && logger.warn('\n' + 'playlistManager: downloadAllEntries — a batch is already running, request ignored');
        return { total: 0, succeeded: 0, failed: 0 };
      }

      const targets = this._getDownloadableEntries();

      if (targets.length === 0) {
        _showToast('No media files to export in the active playlist.', 'error');
        isDev && logger.warn('\n' + 'playlistManager: downloadAllEntries — the active playlist holds no plain media files to export');
        return { total: 0, succeeded: 0, failed: 0 };
      }

      const button       = document.getElementById(_pid('playlistDownloadAllButton'));
      const restoreTitle = button ? button.title : '';

      this._downloadInProgress = true;

      if (button) {
        button.classList.add('busy');
        button.setAttribute('disabled', '');
        button.setAttribute('aria-busy', 'true');
      }

      isDev && logger.info('\n' + `playlistManager: exporting ${targets.length} media files of the active playlist`);

      // ONE progress toast for the whole batch, updated per file and turned
      // into the summary when the run ends. A toast per file would push the
      // stack off screen on a large playlist and the important message — the
      // summary — would be the one the user misses.
      //
      const batchToast = _showProgressToast(`Exporting ${targets.length} media file${targets.length === 1 ? '' : 's'} ...`);

      let succeeded = 0;
      let failed    = 0;

      // Counts the items that could not be transferred but were opened in a
      // new tab for a manual save. Reported separately in the summary because
      // the user has to act on exactly those.
      //
      let manualTabs = 0;

      for (let i = 0; i < targets.length; i++) {
        const entry  = targets[i];
        const source = _getEntryDownloadSource(entry);

        if (button) {
          button.title = `Exporting media files (${i + 1}/${targets.length}) ...`;
        }

        // Progress tick: same counter the button tooltip carries, plus the
        // title of the file currently on the wire.
        //
        batchToast.update(`Exporting media file ${i + 1} of ${targets.length}${entry && entry.title ? `: "${entry.title}"` : ''} ...`);

        // Defensive: the set was filtered by the very same resolver, so this
        // can only miss if the playlist changed mid-batch.
        //
        if (!source) {
          failed++;
          continue;
        }

        const ok = await _downloadMediaSource(source.url, _buildDownloadFileName(entry, source));
        ok ? succeeded++ : failed++;

        if (!ok && _lastDownloadOutcome === 'manual-tab') {
          manualTabs++;
        }

        if (i < targets.length - 1) {
          await new Promise(resolve => setTimeout(resolve, DOWNLOAD_SEQUENCE_DELAY_MS));
        }
      }

      if (button) {
        button.classList.remove('busy');
        button.removeAttribute('disabled');
        button.setAttribute('aria-busy', 'false');
        button.title = restoreTitle;
      }

      this._downloadInProgress = false;

      // Summary in the SAME toast the progress ran in. Three cases:
      //
      //   all done          -> 'success'
      //   nothing done      -> 'error'
      //   partially done    -> 'error' naming both counts
      //
      // Items that fell back to a manual save are appended in all three cases
      // because the user still has to save them by hand.
      //
      const manualNote = manualTabs > 0
        ? ` ${manualTabs} file${manualTabs === 1 ? ' was' : 's were'} opened in a new tab for a manual save.`
        : '';

      if (failed === 0) {
        batchToast.resolve(`Media export finished: ${succeeded} of ${targets.length} file${targets.length === 1 ? '' : 's'}.`, 'success', 5000);
      } else if (succeeded === 0) {
        batchToast.resolve(`Media export failed: none of the ${targets.length} file${targets.length === 1 ? '' : 's'} could be exported.${manualNote}`, 'error', 8000);
      } else {
        batchToast.resolve(`Media export finished with errors: ${succeeded} of ${targets.length} files exported, ${failed} failed.${manualNote}`, 'error', 8000);
      }

      isDev && logger.info('\n' + `playlistManager: media export finished (${succeeded} of ${targets.length} files, ${failed} failed)`);

      return { total: targets.length, succeeded: succeeded, failed: failed };
    }

    // Rendering
    // -------------------------------------------------------------------------

    renderCurrent() {
      const currentData = this.load() || [];
      if (currentData.length === 0) {
        this._manageHiddenMode(false);
      } else {
        this._manageHiddenMode(true);
      }

      // ID corrected from 'playlistHistory' (non-existent) to
      // 'videoplayer_playlist_parent' to match the actual page element.
      //
      const historyEl = document.getElementById(_pid('videoplayer_playlist_parent'));

      if (historyEl) {

        // Publish the per-player action-button flags on THIS player's
        // container in BOTH display modes (see _applyUiElementFlags). Done
        // here — in addition to renderCards()/renderPlaylist() — for the
        // same reason as the #51 call below: the render methods bail out
        // early on an empty playlist, while renderCurrent() always owns the
        // container, so the published attributes are in place before a
        // <playlist-cards> drop-in ever connects.
        //
        _applyUiElementFlags(historyEl);

        // Publish the export-button flags with the #53 flags, for the same
        // reason: the render methods bail out early on an empty playlist,
        // renderCurrent() always owns the container, so the attributes are in
        // place before a <playlist-cards> drop-in ever connects.
        //
        _applyUiElementDownloadFlags(historyEl);

        if (this._displayMode === 'list') {
          historyEl.className = 'playlist list-mode';

          // Drop the card-grid geometry when leaving card mode.
          //
          _clearCardsPerRow(historyEl);
        } else {
          historyEl.className = 'playlist card-mode';

          // Apply playlist.cards.perRow to THIS player's grid container. Done
          // here (and not only in renderCards()) because renderCards() bails out
          // early on an empty playlist, while renderCurrent() always owns the
          // container's mode class.
          //
          _applyCardsPerRow(historyEl);
        }
      }

      if (this._displayMode === 'list') {
        this.renderPlaylist();
      } else {
        this.renderCards();
      }

      if (!this._rateHandlerInitialized) {
        this.initRateHandler();
      }

      if (!this._editHandlerInitialized) {
        this.initEditHandler();
      }

      if (!this._infoLinkHandlerInitialized) {
        this.initInfoLinkHandler();
      }

      if (!this._videoLinkHandlerInitialized) {
        this.initVideoLinkHandler();
      }

      // initPlayHandler and initDeleteHandler were never called from
      // renderCurrent(), so clicking the play overlay or the delete
      // button had no effect.  Both handlers already existed; they
      // just needed to be wired in here, guarded by the new flags added
      // to the constructor.
      //
      if (!this._playHandlerInitialized) {
        this.initPlayHandler();
      }

      if (!this._deleteHandlerInitialized) {
        this.initDeleteHandler();
      }

      // Performance: each of the five UI helpers below independently resolved
      // its data via `this._searchResults || this.load() || []`, so a single
      // renderCurrent() pass JSON-parsed and re-normalised the ENTIRE playlist
      // from localStorage up to five additional times (on top of the render
      // itself). The view data is now resolved ONCE here — reusing the
      // `currentData` already loaded at the top of renderCurrent() — and
      // passed down. Every helper keeps its original no-argument behaviour as
      // the fallback (see the optional `data` parameters), so all external
      // call sites remain untouched.
      //
      const viewData = this._searchResults || currentData;

      this._updateSortSelectVisibility(viewData);
      this._updateModeSwitchVisibility(viewData);
      this._updateMergeSwitchVisibility(viewData);
      this._updateTogglePlaylistButton(viewData);

      if (loopConfigEnabled && !this._loopSwitchInitialized) {
        const _scope   = document.getElementById(_pid('playlist_screen')) || document.getElementById(_pid('playlistBlock')); // multiPlayer MultiInstance #4
        const titleBar = _scope ? _scope.querySelector('.playlist-block-title') : document.querySelector('.playlist-block-title'); // multiPlayer MultiInstance #4

        if (titleBar) {
          this._loopSwitchInitialized = true;
          new playlistLoopSwitchHandler();
          isDev && logger.info('\n' + 'playlistManager: loop switch initialized (lazy)');
        }
      }

      this._updateLoopSwitchVisibility(viewData);

      // Lazy build of the title-bar export button, modelled on the loop-switch
      // block above: the '.playlist-block-title' bar is populated dynamically
      // (mode switch, merge switch, sort select), so the button is created on
      // the first render that finds the bar in the DOM. No adapter change is
      // required for the button to appear; playlistDownloadAllHandler is
      // nevertheless exported on the instance API so an adapter can build it
      // at a more precise point (same pattern as the other handler classes).
      //
      if (!this._downloadAllHandlerInitialized) {
        const _dlScope    = document.getElementById(_pid('playlist_screen')) || document.getElementById(_pid('playlistBlock'));
        const _dlTitleBar = _dlScope ? _dlScope.querySelector('.playlist-block-title') : document.querySelector('.playlist-block-title');

        if (_dlTitleBar) {
          this._downloadAllHandlerInitialized = true;
          new playlistDownloadAllHandler();
          isDev && logger.info('\n' + 'playlistManager: download-all handler initialized (lazy)');
        }
      }

      this._updateDownloadAllButtonVisibility(viewData);

      // Lazy build of the title-bar audio-only switch, modelled on the
      // download-all block above: the '.playlist-block-title' bar is
      // populated dynamically, so the switch is created on the first render
      // that finds the bar in the DOM. No adapter change is required for the
      // switch to appear; audioOnlySwitchHandler is nevertheless exported on
      // the instance API so an adapter can build it at a more precise point
      // (same pattern as the other handler classes). The handler init
      // re-checks all config gates (opts.enabled, ui_elements.audioOnlySwitch)
      // itself, so the guard flag is set BEFORE the call — a config-declined
      // init must not re-run on every render.
      //
      if (!this._audioOnlySwitchInitialized) {
        const _aoScope    = document.getElementById(_pid('playlist_screen')) || document.getElementById(_pid('playlistBlock'));
        const _aoTitleBar = _aoScope ? _aoScope.querySelector('.playlist-block-title') : document.querySelector('.playlist-block-title');

        if (_aoTitleBar) {
          this._audioOnlySwitchInitialized = true;
          new audioOnlySwitchHandler();
          isDev && logger.info('\n' + 'playlistManager: audio-only switch initialized (lazy)');
        }
      }

      this._updateAudioOnlySwitchVisibility(viewData);

      // Re-assert the UI mirror for players whose switch is suppressed or
      // unreachable, so this._audioOnly always agrees with the state
      // _resolveAudioOnlyActive() hands to the playback paths. A no-op for
      // every player that HAS the switch (the checkbox owns the mirror
      // there), and placed AFTER the visibility update so the availability
      // test sees the final DOM of this render.
      //
      this._syncAudioOnlyMirror();
    }

    // ID corrected from 'playlistHistory' (non-existent) to
    // 'videoplayer_playlist_parent' which is the actual element in the page.
    _getPlaylistContainer() {
      const el = document.getElementById(_pid('videoplayer_playlist_parent'));
      if (!el) {
        logger.error('\n' + 'playlist container element not found');
        isDev && logger.warn('\n' + 'processing playlist skipped');
      }
      return el;
    }

    // renderPlaylist: thumbnail src replaced with entry.poster
    // or DEFAULT_POSTER.
    // YouTube CDN image URLs (img.youtube.com) have been removed.
    renderPlaylist() {
      const preCheckData = this.load() || [];
      if (preCheckData.length === 0) {
        this._manageHiddenMode(false);
        return;
      }
      this._manageHiddenMode(true);

      const playlistContainer = this._getPlaylistContainer();
      if (!playlistContainer) return;

      playlistContainer.className = 'playlist list-mode';

      // renderPlaylist() re-asserts the mode class on every render; re-assert
      // the (absence of) card-grid geometry with it. Assigning className does
      // NOT touch the style attribute, so the inline declarations written by
      // _applyCardsPerRow() would otherwise survive the switch to list mode.
      //
      _clearCardsPerRow(playlistContainer);

      // The LIST/ROW view honors the very same three ui_elements flags as the
      // card view — the follow-up that #52 flagged against the core module.
      // Resolve once per render, publish on the container, and gate each
      // button in the row template below; showActions skips the
      // .playlist-playlist-actions wrapper when all three are disabled.
      //
      const uiFlags     = _applyUiElementFlags(playlistContainer);
      const showActions = uiFlags.rate || uiFlags.edit || uiFlags.delete;

      // Resolve and publish the export-button flags alongside the #53 flags.
      // The per-item export button is additionally gated PER ENTRY on
      // _isDownloadableEntry() below, so it never appears for a YouTube or
      // streaming record that has no plain file behind it.
      //
      const dlFlags = _applyUiElementDownloadFlags(playlistContainer);

      isDev && logger.info('\n' + `render playlist`);

      // Performance: the method parsed the full playlist out of localStorage
      // TWICE per render — once for the empty pre-check above and again here.
      // load() JSON-parses and re-normalises every entry, so the second parse
      // is pure duplicate work. Reuse the pre-check result; behaviour is
      // identical (same key, same call, microseconds apart).
      //
      const data = this._searchResults || preCheckData;
      this._applySortOrder(data);

      playlistContainer.innerHTML = data.map((item, index) => {
        const hasDuration   = (item.duration && item.duration > 0) ? true : false;
        const duration      = hasDuration ? this._formatDuration(item.duration) : '';
        const hasAuthor     = (item.author && item.author.trim().length > 0) ? true : false;
        const author        = hasAuthor ? item.author.trim() : '';
        const timeAgo       = this._getTimeAgo(new Date(item.watchDate));
        const hasRating     = (item.rating && item.rating > 0) ? true : false;
        const ratingStars   = hasRating ? '<i class="fas fa-star"></i>'.repeat(item.rating) : '';
        const hasInfoLink   = this._isValidUrl(item.infoLink);
        const thumbSrc      = item.poster || DEFAULT_POSTER;
        const canDownload   = dlFlags.download && _isDownloadableEntry(item);

        // data-item-active is rendered from the live active videoId so a
        // re-render while a video is playing keeps the correct row marked.
        //
        // Clarity: the rate-button icon ternary evaluated to 'fa-star' in
        // BOTH branches (no-op); the rated/unrated distinction is carried by
        // the button's ' rated' class. Replaced with the plain class string.
        //
        return `
          <div class="playlist-row card-base" data-item-active="${(this._activeVideoId && item.videoId === this._activeVideoId) ? 'true' : 'false'}" data-index="${index}" data-video-id="${item.videoId}">
            <div class="playlist-row-content">
              <div class="playlist-thumb-wrapper">
                <img class="playlist-thumb" src="${thumbSrc}" alt="playlist-thumb">
                <div class="playlist-play-overlay"><i class="fas fa-play"></i></div>
                <div class="playlist-duration">${duration}</div>
                ${hasRating ? `<div class="playlist-rating">${ratingStars}</div>` : ''}
              </div>
              <div class="playlist playlist-info-row">
                <div class="playlist-title">${this._escapeHtml(item.title)}${hasInfoLink ? ` <a class="playlist-info-link" href="${this._escapeHtml(item.infoLink)}" target="_blank" rel="noopener noreferrer" title="More info"><i class="fas fa-info-circle"></i></a>` : ''}</div>
                <div class="playlist-author">${this._escapeHtml(author)}</div>
                <div class="playlist-time-info">${timeAgo}</div>
              </div>
              ${(showActions || canDownload) ? `
              <div class="playlist-playlist-actions">
                ${canDownload ? `
                <button class="playlist-btn download" title="Download this item to your download folder" aria-label="Download this item">
                  <i class="fas fa-download"></i>
                </button>` : ''}
                ${uiFlags.rate ? `
                <button class="playlist-btn rate ${item.rating ? ' rated' : ''}" title="Set rating${item.rating ? ' (' + item.rating + '/5)' : ''}" aria-label="Set rating">
                  <i class="fas fa-star"></i>
                </button>` : ''}
                ${uiFlags.edit ? `
                <button class="playlist-btn edit" title="Edit item" aria-label="Edit item">
                  <i class="fas fa-edit"></i>
                </button>` : ''}
                ${uiFlags.delete ? `
                <button class="playlist-btn delete" title="Delete from playlist" aria-label="Delete from playlist">
                  <i class="fas fa-trash"></i>
                </button>` : ''}
              </div>` : ''}
            </div>
          </div>
        `;

      }).join('');

      if (!this._rateHandlerInitialized) {
        this.initRateHandler();
      }

      if (!this._editHandlerInitialized) {
        this.initEditHandler();
      }

      if (!this._downloadHandlerInitialized) {
        this.initDownloadHandler();
      }
    }

    // renderCards: thumbnail src replaced with entry.poster or DEFAULT_POSTER.
    // YouTube CDN image URLs (img.youtube.com) have been removed.
    //
    renderCards() {
      const preCheckData = this.load() || [];
      if (preCheckData.length === 0) {
        this._manageHiddenMode(false);
        return;
      }
      this._manageHiddenMode(true);

      const playlistContainer = this._getPlaylistContainer();
      if (!playlistContainer) return;

      playlistContainer.className = 'playlist card-mode';

      // Re-assert the configured column count on every card render (sort,
      // search, delete, rate, ...) so a re-render can never fall back to the
      // stylesheet's hard-wired 2 columns.
      //
      _applyCardsPerRow(playlistContainer);

      // Resolve the per-player action-button flags ONCE per render and
      // publish them on the container (contract for playlistCards.mjs).
      // The template below gates each button on these flags; showActions
      // skips the .playlist-card-actions wrapper entirely when all three
      // buttons are disabled so no empty actions bar is rendered.
      //
      const uiFlags     = _applyUiElementFlags(playlistContainer);
      const showActions = uiFlags.rate || uiFlags.edit || uiFlags.delete;

      // Same export-flag resolution as renderPlaylist() so the CARD view
      // offers the per-item export button under the identical rules.
      //
      const dlFlags = _applyUiElementDownloadFlags(playlistContainer);

      // Performance: same duplicate-parse pattern as renderPlaylist() — the
      // playlist was JSON-parsed from localStorage twice per render (empty
      // pre-check + display source). Reuse the pre-check result.
      //
      const data = this._searchResults || preCheckData;

      this._applySortOrder(data);

      playlistContainer.innerHTML = data.map(v => {
        const hasDuration  = v.duration && v.duration > 0;
        const duration     = hasDuration ? this._formatDuration(v.duration) : '';
        const hasAuthor    = v.author && v.author.trim().length > 0;
        const timeAgo      = this._getTimeAgo(new Date(v.watchDate));
        const hasRating    = v.rating && v.rating > 0;
        const ratingStars  = hasRating ? '<i class="fas fa-star"></i>'.repeat(v.rating) : '';
        const hasInfoLink  = this._isValidUrl(v.infoLink);
        const thumbSrc     = v.poster || DEFAULT_POSTER;
        const canDownload  = dlFlags.download && _isDownloadableEntry(v);

        // data-item-active is rendered from the live active videoId so a
        // re-render while a video is playing keeps the correct card marked.
        //
        // Clarity: same no-op 'fa-star'/'fa-star' ternary as renderPlaylist().
        //
        return `
          <div class="playlist-card card-base" data-item-active="${(this._activeVideoId && v.videoId === this._activeVideoId) ? 'true' : 'false'}" data-video-id="${v.videoId}">
            <div class="playlist-thumb-wrapper">
              <img class="playlist-thumb" src="${thumbSrc}" alt="playlist-thumb">
              <div class="playlist-play-overlay"><i class="fas fa-play"></i></div>
              ${hasDuration ? `<div class="playlist-duration">${duration}</div>` : ''}
              ${hasRating ? `<div class="playlist-rating">${ratingStars}</div>` : ''}
            </div>
            <div class="playlist-info">
              <div class="playlist-title">${this._escapeHtml(v.title)}${hasInfoLink ? ` <a class="playlist-info-link" href="${this._escapeHtml(v.infoLink)}" target="_blank" rel="noopener noreferrer" title="More info"><i class="fas fa-info-circle"></i></a>` : ''}</div>
              ${hasAuthor ? `<div class="playlist-author">${this._escapeHtml(v.author)}</div>` : ''}
              <div class="playlist-time-info">${timeAgo}</div>
              ${(showActions || canDownload) ? `
              <div class="playlist-card-actions">
                ${canDownload ? `
                <button class="playlist-btn download" title="Download this item to your download folder" aria-label="Download this item">
                  <i class="fas fa-download"></i>
                </button>` : ''}
                ${uiFlags.rate ? `
                <button class="playlist-btn rate ${v.rating ? ' rated' : ''}" title="Set rating ${v.rating ? ' (' + v.rating + '/5)' : ''}" aria-label="Set rating">
                  <i class="fas fa-star"></i>
                </button>` : ''}
                ${uiFlags.edit ? `
                <button class="playlist-btn edit" title="Edit item" aria-label="Edit item">
                  <i class="fas fa-edit"></i>
                </button>` : ''}
                ${uiFlags.delete ? `
                <button class="playlist-btn delete" title="Delete from playlist" aria-label="Delete from playlist">
                  <i class="fas fa-trash"></i>
                </button>` : ''}
              </div>` : ''}
            </div>
          </div>
        `;
      }).join('');

      if (!this._rateHandlerInitialized) {
        this.initRateHandler();
      }

      if (!this._editHandlerInitialized) {
        this.initEditHandler();
      }

      if (!this._downloadHandlerInitialized) {
        this.initDownloadHandler();
      }
    }

    // Active-item state management
    // -------------------------------------------------------------------------
    // The playlist is rendered (as cards or list rows) under
    // #videoplayer_playlist_parent_<id>. Every entry element carries
    // data-item-active="false" by default. While a video taken from the
    // playlist is in the 'playing' state, the matching element is flipped to
    // data-item-active="true" so the UI can highlight the now-playing item.
    //
    // setActiveItem(videoId)  -> remember videoId and mark its element active
    // clearActiveItem()       -> forget the active videoId and reset all marks
    // _applyActiveItem()      -> re-apply the current mark to the live DOM
    //                            (called by the render methods after they
    //                            rebuild innerHTML with all marks reset).

    setActiveItem(videoId) {
      this._activeVideoId = videoId || null;
      this._applyActiveItem();
    }

    clearActiveItem() {
      this._activeVideoId = null;
      this._applyActiveItem();
    }

    _applyActiveItem() {
      const playlistContainer = document.getElementById(_pid('videoplayer_playlist_parent'));
      if (!playlistContainer) return;

      // Reset every entry, then mark the active one (if any). Iterating and
      // comparing dataset.videoId avoids CSS-selector escaping issues for
      // videoIds that contain special characters.
      //
      const items = playlistContainer.querySelectorAll('[data-item-active]');

      items.forEach(el => {
        const isActive = !!this._activeVideoId && el.getAttribute('data-video-id') === this._activeVideoId;
        el.setAttribute('data-item-active', isActive ? 'true' : 'false');
      });
    }

    // Event delegation
    // -------------------------------------------------------------------------

    initDeleteHandler() {

      const playlistContainer = document.getElementById(_pid('videoplayer_playlist_parent'));
      if (!playlistContainer) return;

      // Guard flag set here to prevent duplicate listener registration.
      //
      this._deleteHandlerInitialized = true;

      playlistContainer.addEventListener('click', (event) => {
        const deleteBtn = event.target.closest('.playlist-btn.delete');
        if (!deleteBtn) return;

        const row     = deleteBtn.closest('[data-video-id]');
        const videoId = row ? row.dataset.videoId : null;

        if (videoId) {
          this.deleteEntry(videoId);
        }
      });

      isDev && logger.info('\n' + 'playlistManager: delete handler initialized');
    }

    // initDownloadHandler - delegated click handler for the per-item export
    // button (button.playlist-btn.download), rendered by BOTH views:
    // div.playlist-row-content (list) and div.playlist-card-actions (cards).
    //
    // Modelled one-to-one on initDeleteHandler: one listener on the
    // player-scoped container, resolution of the owning row/card through the
    // shared [data-video-id] marker, and a once-only guard flag so repeated
    // renders cannot stack listeners.
    //
    // stopPropagation() keeps the click off the row itself — without it the
    // play-overlay/row handling of the surrounding element could start
    // playback while the export runs.
    initDownloadHandler() {

      const playlistContainer = document.getElementById(_pid('videoplayer_playlist_parent'));
      if (!playlistContainer) return;

      this._downloadHandlerInitialized = true;

      playlistContainer.addEventListener('click', (event) => {
        const downloadBtn = event.target.closest('.playlist-btn.download');
        if (!downloadBtn) return;

        event.stopPropagation();
        event.preventDefault();

        const row     = downloadBtn.closest('[data-video-id]');
        const videoId = row ? row.dataset.videoId : null;

        if (videoId) {
          this.downloadEntry(videoId, downloadBtn);
        }
      });

      isDev && logger.info('\n' + 'playlistManager: download handler initialized');
    }

    // playEntry now resolves the video src from the playlist entry and passes
    // it to embedRunVideo so the native player receives a proper file URL.
    //
    playEntry(videoId) {
      if (!videoId) {
        isDev && logger.warn('\n' + 'playlistManager: playEntry called without a videoId');
        return;
      }

      // Expiry gate (user-triggered play). When the entry carries an expiry
      // date that has been reached, playback is refused here and a WARNING is
      // logged. The warning is NOT wrapped in `isDev &&` on purpose: a blocked
      // playback is an operational condition an operator has to be able to see
      // in production, unlike the informational traces around it.
      //
      const expiryEntry     = this.getEntry(videoId);
      const isEntryExpired  = _isEntryExpired(expiryEntry);

      if (isEntryExpired) {
        logger.warn('\n' + `playlistmanager: playback DISABLED for videoId: ${videoId} - ` +
                           `access period expired on ${expiryEntry.expiryDate} (${_expiryHintText(expiryEntry.expiryDate)})`);

        // The direct jQuery call below is DEFECTIVE and must stay disabled;
        // the dialog is raised by _showExpiryNotice() above instead. It is
        // the source of the reported runtime error:
        //
        //   "Syntax error, unrecognized expression: #${EXPIRY_MODAL_ID}"
        //
        // and carries TWO independent faults:
        //
        //   1. "#${EXPIRY_MODAL_ID}" is a NORMAL (double-quoted) string, not
        //      a template literal: `${...}` is NOT interpolated, so jQuery's
        //      selector engine receives the literal text '#${EXPIRY_MODAL_ID}'
        //      and THROWS. Because the call sits OUTSIDE the try/catch of
        //      _showExpiryNotice(), the exception escapes the expiry gate and
        //      aborts the calling chain (on the reload path it killed
        //      playlistSortHandler.init(); see the hardening under the same
        //      tag there).
        //   2. `.modal('show')` is the jQuery-plugin API of Bootstrap 4.
        //      J1 ships the Bootstrap 5 bundle, where dialogs are driven via
        //      bootstrap.Modal.getOrCreateInstance(el).show() - exactly what
        //      _showExpiryNotice() does (with a toast/log fallback when the
        //      modal API is absent).
        //
        // User-visible counterpart of the warning above. This is the most
        // INTERACTIVE of the three gates - the viewer just clicked a playlist
        // row - so the notice is raised unconditionally here (no mode is
        // passed, hence no preload suppression). The return below is
        // unchanged: the block is decided by #1, this call only reports it.
        //
        _showExpiryNotice(expiryEntry, videoId, { source: 'playEntry' });

        return;
      }

      isDev && logger.info('\n' + `playlistmanager: playing entry for videoId: ${videoId}`);
      _startedFromPlaylist = true;
      this.embedRunVideo(videoId);
    }

    // embedRunVideo looks up the 'src' field from the playlist entry
    // so that the native player receives the correct local/remote file URL.
    //
    embedRunVideo(videoId, mode) {
      if (!videoId) {
        isDev && logger.warn('\n' + 'playlistManager: embedRunVideo called without a videoId');
        return;
      }

      isDev && logger.info('\n' + `playlistManager: embedding video for videoId: ${videoId}`);

      // Resolve the src from the playlist entry; fall back to videoId as-is
      //
      const playlist = this.load() || [];
      const entry    = playlist.find(item => item.videoId === videoId);
      const videoSrc = (entry && entry.src) ? entry.src : videoId;

      // Expiry gate (common funnel). Covers every caller that reaches the
      // player through this wrapper - playEntry(), the reload auto-load of the
      // first entry (autoLoadFirstEntryOnReload, mode 'pause') and the IO
      // handlers - so an expired source is never embedded, not even paused.
      //
      const isEntryExpired = _isEntryExpired(entry);

      if (isEntryExpired) {
        logger.warn('\n' + `playlistManager: embed DISABLED for videoId: ${videoId} - ` +
                           `access period expired on ${entry.expiryDate} (${_expiryHintText(entry.expiryDate)})`);
      
        // Common funnel: this gate is crossed by user-triggered playback AND
        // by the non-interactive load-and-pause path (mode 'pause', used by
        // autoLoadFirstEntryOnReload and the IO handlers). `mode` is therefore
        // handed through, so _showExpiryNotice() can silence the page-load
        // case (EXPIRY_MODAL_ON_PRELOAD) while still notifying on a real
        // playback attempt.
        //
        _showExpiryNotice(entry, videoId, { source: 'playlistManager.embedRunVideo', mode: mode });

        return;
      }

      embedRunVideo(videoSrc, mode);
    }

    // autoLoadFirstEntryOnReload()
    //
    // Page-load counterpart to the load-and-pause behaviour the
    // playlistIOHandler applies after a user-triggered load
    // (handleLoadFromServer() / #26 and handleFileSelected() / #27):
    // When a playlist is ALREADY present in the instance's localStorage
    // (i.e. it was loaded in an earlier session/visit and the whole page
    // is now reloaded), load the first video of the display-ordered list
    // into the player and start it in the 'paused' state —
    // exactly as if the user had just (re)loaded that playlist.
    //
    // The display order is reproduced by applying the active sort criterion
    // (_currentSort) to a fresh copy of the stored playlist — the same
    // ordering renderCards()/renderPlaylist() apply — so the entry chosen
    // here matches the first row the user sees. Going through
    // embedRunVideo(videoId, 'pause') resolves the entry's src and, via
    // playerMode === 'pause', pauses playback right after start (see the
    // autoplay branch in embedRunVideo). 'pause' mode (instead of playEntry())
    // is deliberate and mirrors #26/#27: it does NOT set _startedFromPlaylist,
    // so the playlist panel is left open after load.
    // As with #26/#27, the paused-after-start behaviour depends on the
    // autoplay config being enabled.
    //
    // Differences from preloadPlaylists() (#39) are intentional: preload only
    // SEEDS/merges configured playlist files and explicitly does NOT
    // auto-embed (to avoid clashing with the autoStart/init path on a first
    // visit). This method, by contrast, only ever acts on a playlist that
    // is ALREADY in localStorage at load time — it never fetches or merges —
    // so on a fresh first visit (empty list) it is a no-op and the autoStart
    // path is left untouched.
    //
    // Once-only: guarded by the module-level _autoLoadFirstOnReloadDone
    // flag so repeated handler init or multiple callers cannot double-load.
    // The flag is set only on the success path, so a not-ready or empty-list
    // call remains retriable (e.g. an adapter call after async setup
    // completes).
    //
    // The once-only guard described above is now keyed per player
    // (_autoLoadFirstOnReloadDoneByPid[_playerID]) rather than a single shared
    // boolean, so on a multi-player page each player auto-loads its own stored
    // first entry exactly once. NOTE: this keys the guard correctly, but for
    // every player to actually auto-load, autoLoadFirstEntryOnReload() must be
    // invoked once PER PLAYER with _playerID set to that player's id. The
    // current call site is playlistSortHandler.init() — a single, page-global
    // handler (see the timing/scope note below) — so the adapter still needs to
    // drive this method per-instance (it is exported on playlistManager) for
    // multi-player auto-load to take full effect. Flagged for review.
    //
    // Timing/scope (flagged for review): this is invoked from
    // playlistSortHandler.init(), a page-load handler the adapter
    // instantiates after its dependencies (videojs + j1.adapter.videoPlayer.videoPlayerOptions)
    // are met, so embedRunVideo() is callable by then — the same readiness the
    // IO handlers rely on at click time. A defensive readiness check below
    // skips (without consuming the once-only flag) if the adapter options
    // are not yet present.
    // Because playlistSortHandler is a single, page-global handler (it resolves
    // '.playlist-block-title'/'#playlistSortSelect' without _pid()), this
    // auto-load targets the playlistManager's current player scope, matching
    // that handler's existing load()/save()/renderCurrent() behaviour.
    // The method is also reachable via the public playlistManager export,
    // so the adapter can drive it per-instance at a more precise point if
    // multi-instance auto-load on reload is later required.
    //
    // @return {boolean} true if a first entry was auto-loaded, false otherwise.
    //
    autoLoadFirstEntryOnReload() {

      // Once-only guard: never auto-load more than once per page load.
      // Now keyed by the current player scope (_playerID) instead of a
      // single shared boolean, so each player on a multi-player page
      // is guarded independently and one player's completed auto-load
      // no longer suppresses its siblings'. See the registry declaration
      // near the module-level flags.
      //
      if (_autoLoadFirstOnReloadDoneByPid[_playerID]) {
        isDev && logger.debug('\n' + `playlistManager: auto-load on reload already done for player "${_playerID}" — skipping`);
        return false;
      }

      // Defensive readiness check. embedRunVideo() reads
      // j1.adapter.videoPlayer.videoPlayerOptions (and relies on videojs).
      // If the adapter has not finished wiring yet, skip WITHOUT consuming
      // the once-only flag so a later (adapter-driven) call can still succeed.
      //
      // Readiness is now resolved through _resolveVideoPlayerEffectiveOptions()
      // so a player configured EXCLUSIVELY per-instance (factory options, no
      // page-global j1.adapter.videoPlayer.videoPlayerOptions assignment) is
      // recognised as ready as well. Semantics are otherwise identical: skip
      // WITHOUT consuming the once-only flag when no options are resolvable.
      //
      if (!_resolveVideoPlayerEffectiveOptions()) {
        isDev && logger.debug('\n' + 'playlistManager: auto-load on reload deferred — adapter not ready yet');
        return false;
      }

      // Resolve the display-first entry from the ALREADY-stored playlist (no
      // fetch/merge). _applySortOrder() sorts in place on a fresh load() copy.
      //
      const currentList = this.load() || [];
      this._applySortOrder(currentList);
      const firstEntry = currentList[0];

      if (!firstEntry || !firstEntry.videoId) {
        // Empty/invalid list: nothing was "already loaded", so there is nothing
        // to restore on reload. Leave the once-only flag unset (retriable).
        isDev && logger.debug('\n' + 'playlistManager: no stored playlist on reload — nothing to auto-load');

        return false;
      }

      // Mirror of the IO-handler container guard (#26/#33): if a previous
      // session teardown left the player slot without its empty-player overlay,
      // restore the pristine container markup before embedding. On a normal
      // reload the overlay is already present (server-rendered), so this
      // branch is inert.
      // Guarded on container/containerHTML because those module-level refs
      // are only populated once playlistIOHandler has been constructed.
      //
      try {
        const overlayExists = document.getElementById(_pid('emptyPlayerOverlay'));
        if (!overlayExists && container && containerHTML) {
          isDev && logger.debug('\n' + 'playlistManager: restoring container/overlay before reload auto-load');
          container.innerHTML = containerHTML;
        }
      } catch (e) {
        isDev && logger.warn('\n' + `playlistManager: reload container restore skipped: ${e}`);
      }

      // Consume the once-only guard now (success path) and load the first entry
      // in the paused state, exactly as handleLoadFromServer()/handleFileSelected().
      // Mark the once-only guard consumed for THIS player only (keyed by
      // _playerID) so sibling players on the same page can still auto-load their
      // own stored first entry. Mirrors the per-player read guard above.
      //
      _autoLoadFirstOnReloadDoneByPid[_playerID] = true;
      isDev && logger.info('\n' + `playlistManager: loading first stored-playlist video in paused state on reload (videoId: ${firstEntry.videoId})`);

      this.embedRunVideo(firstEntry.videoId, 'pause');
      return true;
    }

    // -------------------------------------------------------------------------
    // autoLoadFirstDone()
    //
    // Status query for the per-player once-only auto-load guard (#41/#43).
    //
    // WHY (issue #54 — adapter cannot detect a successful preload):
    // autoLoadFirstEntryOnReload() collapses THREE semantically different
    // outcomes into a single boolean `false`:
    //
    //   (a) "already done"   — the guard _autoLoadFirstOnReloadDoneByPid[_playerID]
    //                          was consumed earlier by ANOTHER trigger. On any
    //                          RELOAD (store already populated — the steady
    //                          state once #39 preload has seeded the store on
    //                          the very first visit) the core-side #41 hook in
    //                          playlistSortHandler.init() fires FIRST (adapter
    //                          initHandlers step 7), loads the first entry and
    //                          consumes the guard, so the adapter's later #42
    //                          call (step 12) and EVERY subsequent retry tick
    //                          in _loadFirstAfterPreload() return false.
    //   (b) "not ready"      — adapter options not resolvable yet (skip,
    //                          guard NOT consumed, retriable).
    //   (c) "nothing stored" — empty/absent playlist (no-op, guard NOT
    //                          consumed, retriable — the fresh-visit case the
    //                          MultiInstance #7 retry was built for).
    //
    // The adapter's `var loaded = vp.playlistManager.autoLoadFirstEntryOnReload();`
    // therefore CANNOT distinguish (a) — a SUCCESS that merely happened via a
    // different trigger — from (b)/(c) — "keep polling". Result: on every
    // reload with a preload configured, _loadFirstAfterPreload() polls the
    // full attempt budget and logs "gave up ... preload store not ready"
    // although the preload succeeded and the first entry is already loaded
    // (paused). This method exposes the guard state so the adapter can treat
    // (a) as terminal success and stop the retry immediately.
    //
    // Additive: no existing behaviour or return value is changed; the method
    // only READS the #43 registry. Scoped by _playerID — the adapter must
    // call setPlayerID(playerId) first (it already re-asserts it before every
    // retry tick, see the adapter's _loadFirstAfterPreload #50 notes).
    //
    // @return {boolean} true if the paused first-entry auto-load has already
    //                   completed for the CURRENT player scope (_playerID),
    //                   regardless of which trigger performed it.
    // -------------------------------------------------------------------------
    autoLoadFirstDone() {
      return !!_autoLoadFirstOnReloadDoneByPid[_playerID];
    }

    initPlayHandler() {

      const playlistContainer = document.getElementById(_pid('videoplayer_playlist_parent'));
      if (!playlistContainer) return;

      // Guard flag set here so renderCurrent() can protect against duplicate
      // listener registration (same pattern used by initRateHandler, etc.).
      //
      this._playHandlerInitialized = true;

      playlistContainer.addEventListener('click', (event) => {
        const playOverlay = event.target.closest('.playlist-play-overlay');
        if (!playOverlay) return;

        const row     = playOverlay.closest('[data-video-id]');
        const videoId = row ? row.dataset.videoId : null;

        if (videoId) {
          this.playEntry(videoId);
        }
      });

      isDev && logger.info('\n' + 'playlistManager: play handler initialized');
    }

    // _createRatingModal: thumbnail src now uses entry.poster or
    // DEFAULT_POSTER instead of the YouTube CDN (img.youtube.com).
    //
    _createRatingModal(videoId) {
      if (document.getElementById('ratingModal')) return;

      // Resolve poster from playlist entry
      const playlist  = this.load() || [];
      const entry     = playlist.find(item => item.videoId === videoId);
      const thumbSrc  = (entry && entry.poster) ? entry.poster : DEFAULT_POSTER;

      const modalHTML = `
        <div id="ratingModal" class="modal fade" tabindex="-1"
          aria-labelledby="ratingModalLabel"
          data-bs-backdrop="static" data-bs-keyboard="false">
          <div class="modal-dialog modal-dialog-centered modal-notify modal-success">
            <div class="modal-content" style="max-width: 500px;">
              <div class="modal-header">
                <p id="ratingModalLabel" class="modal-title lead mb-3">Set Media Rating</p>
                <button id="closeRatingModal"
                  type="button" class="btn-close mb-3" data-bs-dismiss="modal" aria-label="Close">
                </button>
              </div>
              <div class="modal-body">
                <div class="playlist-thumb-wrapper mb-3">
                  <img id="ratingVideoThumb" class="playlist-thumb"
                       src="${thumbSrc}"
                       alt="playlist-thumb">
                </div>
                <div class="rating-dialog">
                  <div>
                    <p id="ratingVideoTitle" class="playlist-title"></p>
                    <p id="ratingVideoAuthor" class="playlist-author"></p>
                  </div>
                  <div style="text-align: center;">
                    <div id="ratingStars" class="rating-stars">
                      <span class="rating-star" data-value="1"><i class="fas fa-star"></i></span>
                      <span class="rating-star" data-value="2"><i class="fas fa-star"></i></span>
                      <span class="rating-star" data-value="3"><i class="fas fa-star"></i></span>
                      <span class="rating-star" data-value="4"><i class="fas fa-star"></i></span>
                      <span class="rating-star" data-value="5"><i class="fas fa-star"></i></span>
                    </div>
                    <p id="ratingLabel" class="rating-label"</p>
                  </div>
                  <div class="rating-modal-footer mb-2">
                    <button id="clearRatingBtn" class="rating-modal-btn rating-modal-btn-warning">Clear</button>
                    <button id="saveRatingBtn"  class="rating-modal-btn rating-modal-btn-primary" data-bs-dismiss="modal">Save Rating</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

      document.body.insertAdjacentHTML('beforeend', modalHTML);
      this._initRatingModalEvents();
    }

    _initRatingModalEvents() {
      const overlay   = document.getElementById('ratingModal');
      const saveBtn   = document.getElementById('saveRatingBtn');
      const clearBtn  = document.getElementById('clearRatingBtn');
      const starsWrap = document.getElementById('ratingStars');

      this._ratingModalVideoId = null;
      this._ratingModalValue   = 0;

      const ratingLabels = ['No rating', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

      const updateStarDisplay = (value) => {
        const stars = starsWrap.querySelectorAll('.rating-star');
        stars.forEach(star => {
          const v = parseInt(star.dataset.value, 10);
          star.classList.toggle('active', v <= value);
        });
        const label = document.getElementById('ratingLabel');
        if (label) label.textContent = ratingLabels[value] || 'No rating';
      };

      starsWrap.addEventListener('mouseover', (e) => {
        const star = e.target.closest('.rating-star');
        if (!star) return;
        const hoverVal = parseInt(star.dataset.value, 10);
        const stars = starsWrap.querySelectorAll('.rating-star');
        stars.forEach(s => {
          s.classList.toggle('hover', parseInt(s.dataset.value, 10) <= hoverVal);
        });
      });

      starsWrap.addEventListener('mouseout', () => {
        const stars = starsWrap.querySelectorAll('.rating-star');
        stars.forEach(s => s.classList.remove('hover'));
      });

      starsWrap.addEventListener('click', (e) => {
        const star = e.target.closest('.rating-star');
        if (!star) return;
        this._ratingModalValue = parseInt(star.dataset.value, 10);
        updateStarDisplay(this._ratingModalValue);
      });

      clearBtn.addEventListener('click', () => {
        this._ratingModalValue = 0;
        updateStarDisplay(0);
      });

      saveBtn.addEventListener('click', () => {
        if (this._ratingModalVideoId) {
          this.updateEntryRating(this._ratingModalVideoId, this._ratingModalValue);
          isDev && logger.debug('\n' + `playlistmanager: rating set to ${this._ratingModalValue} for videoId: ${this._ratingModalVideoId}`);
        }
      });

      this._updateRatingStarDisplay = updateStarDisplay;
    }

    // openRatingModal: thumbnail src resolves from playlist entry.poster
    // instead of constructing a YouTube CDN URL from the videoId.
    openRatingModal(videoId) {
      if (!videoId) return;

      if(!document.getElementById('ratingModal')) {
        this._createRatingModal(videoId);
      }

      const playlist = this.load() || [];
      const entry   = playlist.find(item => item.videoId === videoId);
      if (!entry) return;

      const titleEl  = document.getElementById('ratingVideoTitle');
      const authorEl = document.getElementById('ratingVideoAuthor');
      const thumbEl  = document.getElementById('ratingVideoThumb');

      if (titleEl)  titleEl.textContent  = entry.title  || videoId;
      if (authorEl) authorEl.textContent = entry.author || '';
      if (thumbEl)  thumbEl.src = entry.poster || DEFAULT_POSTER;

      this._ratingModalVideoId = videoId;
      this._ratingModalValue   = entry.rating || 0;
      if (this._updateRatingStarDisplay) {
        this._updateRatingStarDisplay(this._ratingModalValue);
      }

      const modalEl = document.getElementById('ratingModal');
      if (modalEl) {
        const bsModal = bootstrap.Modal.getOrCreateInstance(modalEl);
        bsModal.show();
      }
    }

    initRateHandler() {
      if (this._rateHandlerInitialized) return;

      // Fix multiPlayer #2: corrected ID
      const playlistContainer = document.getElementById(_pid('videoplayer_playlist_parent'));
      if (!playlistContainer) return;

      this._rateHandlerInitialized = true;

      playlistContainer.addEventListener('click', (event) => {
        const rateBtn = event.target.closest('.playlist-btn.rate');
        if (!rateBtn) return;

        const row     = rateBtn.closest('[data-video-id]');
        const videoId = row ? row.dataset.videoId : null;

        if (videoId) {
          this.openRatingModal(videoId);
        }
      });

      isDev && logger.debug('\n' + 'playlistManager: rate handler initialized');
    }

    // _createEditModal: thumbnail uses entry.poster; video link defaults to
    // entry.src (local/remote file path) instead of a YouTube watch URL.
    _createEditModal(videoId) {
      if (document.getElementById('editModal')) return;

      // Resolve poster from playlist entry
      const playlist  = this.load() || [];
      const entry     = playlist.find(item => item.videoId === videoId);
      const videoSrc  = (entry && entry.src)    ? entry.src    : '';
      const thumbSrc  = (entry && entry.poster) ? entry.poster : DEFAULT_POSTER;

      const modalHTML = `
        <div id="editModal" class="modal fade" tabindex="-1"
          aria-labelledby="editModalLabel"
          data-bs-backdrop="static" data-bs-keyboard="false">
          <div class="modal-dialog modal-dialog-scrollable modal-dialog-centered modal-notify modal-success">
            <div class="modal-content" style="max-width: 500px;">
              <div class="modal-header">
                <p id="editModalLabel" class="modal-title lead mb-3">Edit Media Settings</p>
                <button id="closeEditModal"
                  type="button" class="btn-close mb-3" data-bs-dismiss="modal" aria-label="Close">
                </button>
              </div>
              <div class="modal-body">
                <div class="playlist-thumb-wrapper mb-3">
                  <img id="editVideoThumb" class="playlist-thumb" src="${thumbSrc}" alt="playlist-thumb">
                </div>
                <div class="edit-dialog">

                  <div>
                    <p id="editVideoTitle" class="playlist-title"></p>
                    <p id="editVideoAuthor" class="playlist-author"></p>
                  </div>

                  <div class="edit-field-group">
                    <label class="edit-field-label" for="editFieldCategory">Category</label>
                    <select id="editFieldCategory" class="edit-field-input" form="playlist">
                      <option value="">Select a category</option>
                      <option value="Animals">Animals</option>
                      <option value="Beauty">Beauty</option>
                      <option value="Comedy">Comedy</option>
                      <option value="Education">Education</option>
                      <option value="Entertainment">Entertainment</option>
                      <option value="Events">Events</option>
                      <option value="Gaming">Gaming</option>
                      <option value="Howto">Howto</option>
                      <option value="Music">Music</option>
                      <option value="News">News</option>
                      <option value="People">People</option>
                      <option value="Sports">Sports</option>
                      <option value="Science">Science</option>
                      <option value="Technology">Technology</option>
                      <option value="Travel">Travel</option>
                      <option value="Vehicles">Vehicles</option>
                    </select>
                  </div>

                  <div class="edit-field-group">
                    <label class="edit-field-label" for="editFieldTitle">Title</label>
                    <input id="editFieldTitle" class="edit-field-input" placeholder="Title ..." ></input>
                  </div>

                  <div class="edit-field-group">
                    <label class="edit-field-label" for="editFieldDescription">Description</label>
                    <textarea id="editFieldDescription" class="edit-field-input" placeholder="Description text ..." rows="3" style="overflow-y: auto; resize: vertical;"></textarea>
                  </div>

                  <div class="edit-field-group">
                    <label class="edit-field-label" for="editFieldSeries">Series</label>
                    <select id="editFieldSeries" class="edit-field-input" form="series">
                     <option value="">Enable|Disable Series</option>
                      <option value="0">No</option>
                      <option value="1">Yes</option>
                    </select>
                  </div>

                  <div class="edit-field-group">
                    <label class="edit-field-label" for="editFieldEpisode">Episode</label>
                    <input id="editFieldEpisode" type="number" class="edit-field-input" min="0" step="1" placeholder="0" />
                  </div>

                  <div class="edit-field-group">
                    <label class="edit-field-label" for="editFieldInfoLink">Info Link</label>
                    <div class="edit-field-info-link-wrapper" style="display:flex; align-items:center; gap:6px;">
                      <input id="editFieldInfoLink" type="url" class="edit-field-input" style="flex:1;" placeholder="e.g. https://en.wikipedia.org/wiki/..." />
                      <button id="editInfoLinkOpenBtn" type="button" title="Open link in new window"
                        style="display:none; border:none; background:transparent; cursor:pointer; padding:2px 4px; color:#0d6efd; font-size:1.1rem;"
                        aria-label="Open info link in new window">
                        <i class="fas fa-external-link-alt"></i>
                      </button>
                    </div>
                  </div>

                  <div class="edit-field-group videoplayer-videolink-group mt-2">
                    <label class="edit-field-label" for="entryVideoLink_${videoId}">Video Link</label>
                    <div class="edit-field-video-link-wrapper" style="display:flex; align-items:center; gap:6px;">
                      <input id="editFieldVideoLink" type="url" class="edit-field-input form-control" style="flex:1;"
                             placeholder="e.g. /assets/video/my-video.mp4 or https://example.com/v.mp4"
                             value="${videoSrc}" />
                      <button id="editVideoLinkOpenBtn" type="button" title="Open link in new window"
                        style="border:none; background:transparent; cursor:pointer; padding:2px 4px; color:#0d6efd; font-size:1.1rem;"
                        aria-label="Open video link in new window">
                        <i class="fas fa-external-link-alt"></i>
                      </button>
                    </div>
                  </div>

                  <div class="edit-field-group">
                    <label class="edit-field-label" for="editFieldIssueDate">Issue Date</label>
                    <input id="editFieldIssueDate" type="date" class="edit-field-input" placeholder="e.g. 2026-01-01" />
                  </div>

                  <div class="edit-field-group">
                    <label class="edit-field-label" for="editFieldStartAt">Start At</label>
                    <input id="editFieldStartAt" type="time" step="1" class="edit-field-input" placeholder="e.g. 00:01:30" />
                    <small class="edit-field-hint">Playback starts at this position (empty: from the beginning)</small>
                  </div>

                  <div class="edit-field-group">
                    <label class="edit-field-label" for="editFieldEndAt">End At</label>
                    <input id="editFieldEndAt" type="time" step="1" class="edit-field-input" placeholder="e.g. 00:04:45" />
                    <small class="edit-field-hint">Playback ends at this position (empty: to the natural end)</small>
                  </div>

                  <div class="edit-field-group">
                    <label class="edit-field-label" for="editFieldAudioFadeIn">Audio Fade In</label>
                    <select id="editFieldAudioFadeIn" class="edit-field-input" form="playlist">
                      ${AUDIO_FADE_IN_OPTIONS_HTML}
                    </select>
                    <small class="edit-field-hint">Audio is ramped up to the player volume when playback starts</small>
                  </div>

                  <div class="edit-field-group">
                    <label class="edit-field-label" for="editFieldExpiryDate">Expiry Date</label>
                    <div class="edit-field-expiry-wrapper" style="display:flex; align-items:center; gap:6px;">
                      <input id="editFieldExpiryDate" type="date" class="edit-field-input" style="flex:1;"
                             data-expiry-state="unlimited"
                             placeholder="unlimited when empty" />
                      <button id="editExpiryClearBtn" type="button" title="Reset to unlimited access"
                        style="border:none; background:transparent; cursor:pointer; padding:2px 4px; color:#0d6efd; font-size:1.1rem;"
                        aria-label="Reset expiry date to unlimited">
                        <i class="fas fa-infinity"></i>
                      </button>
                    </div>
                    <small id="editFieldExpiryHint" class="edit-field-hint">Access unlimited (no expiry date set)</small>
                  </div>

                  <div class="edit-field-group">
                    <label class="edit-field-label" for="editFieldTags">Tags</label>
                    <select id="editFieldTags" class="edit-field-input" form="playlist">
                      ${GENRE_OPTIONS_HTML}
                    </select>
                    <div style="display:flex; align-items:center; gap:6px; margin-top:4px;">
                      <input id="editFieldTagsCustom" type="text" class="edit-field-input" style="flex:1;"
                        placeholder="selected and custom tags (comma separated)" />
                    </div>
                  </div>

                  <div class="edit-field-group">
                    <label class="edit-field-label" for="editFieldType">Type</label>
                    <select id="editFieldType" class="edit-field-input" form="type">
                      <option value="">Select a content type</option>
                      <option value="video" selected>video</option>
                      <option value="audio">audio</option>
                    </select>
                  </div>

                  <div class="rating-modal-footer mb-2">
                    <button id="clearEditBtn" class="rating-modal-btn rating-modal-btn-warning">Clear</button>
                    <button id="saveEditBtn" class="rating-modal-btn rating-modal-btn-primary" data-bs-dismiss="modal">Save</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

      document.body.insertAdjacentHTML('beforeend', modalHTML);
      this._initEditModalEvents();
    }

    _initEditModalEvents() {
      const saveBtn  = document.getElementById('saveEditBtn');
      const clearBtn = document.getElementById('clearEditBtn');

      this._editModalVideoId = null;

      clearBtn.addEventListener('click', () => {
        document.getElementById('editFieldCategory').value      = '';
        document.getElementById('editFieldTitle').value         = '';
        document.getElementById('editFieldDescription').value   = '';        
        document.getElementById('editFieldEpisode').value       = '';
        document.getElementById('editFieldInfoLink').value      = '';
        document.getElementById('editFieldVideoLink').value     = '';
        document.getElementById('editFieldIssueDate').value     = '';
        document.getElementById('editFieldStartAt').value       = '';
        document.getElementById('editFieldEndAt').value         = '';
        document.getElementById('editFieldAudioFadeIn').value   = AUDIO_FADE_IN_UNSET;
        document.getElementById('editFieldExpiryDate').value   = EXPIRY_UNLIMITED;
        document.getElementById('editFieldSeries').value        = '';
        document.getElementById('editFieldTags').value          = '';
        document.getElementById('editFieldTagsCustom').value    = '';
        document.getElementById('editFieldType').value          = '';

        this._updateInfoLinkButton();
        this._updateVideoLinkButton();
        this._updateExpiryFieldState();
      });

      const _appendTagToInput = (tag) => {
        const customInput = document.getElementById('editFieldTagsCustom');
        const current     = customInput.value
          .split(',').map(t => t.trim()).filter(Boolean);

        if (!current.includes(tag)) {
          current.push(tag);
          customInput.value = current.join(', ');
          customInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
      };

      const tagsSelect = document.getElementById('editFieldTags');
      tagsSelect.addEventListener('change', () => {
        const value = tagsSelect.value;
        if (value) {
          _appendTagToInput(value);
          tagsSelect.value = '';
          tagsSelect.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });

      saveBtn.addEventListener('click', () => {
        if (this._editModalVideoId) {
          const tagsRaw = document.getElementById('editFieldTagsCustom').value;
          const tags    = tagsRaw
            ? [...new Set(tagsRaw.split(',').map(t => t.trim()).filter(Boolean))]
            : [];

          const fields = {
            category:     document.getElementById('editFieldCategory').value.trim(),
            title:        document.getElementById('editFieldTitle').value.trim(),
            description:  document.getElementById('editFieldDescription').value.trim(),            
            episode:      parseInt(document.getElementById('editFieldEpisode').value, 10) || 0,
            infoLink:     document.getElementById('editFieldInfoLink').value.trim(),
            videoLink:    document.getElementById('editFieldVideoLink').value.trim(),
            issueDate:    document.getElementById('editFieldIssueDate').value.trim(),
            expiryDate:   document.getElementById('editFieldExpiryDate').value.trim(),
            startAt:      document.getElementById('editFieldStartAt').value.trim(),
            endAt:        document.getElementById('editFieldEndAt').value.trim(),
            audioFadeIn:  document.getElementById('editFieldAudioFadeIn').value.trim(),
            series:       parseInt(document.getElementById('editFieldSeries').value, 10) || 0,
            tags:         tags,
            type:         document.getElementById('editFieldType').value.trim() || 'video'
          };

          this.updateEntryFields(this._editModalVideoId, fields);
          isDev && logger.debug('\n' + `playlistmanager: fields saved for videoId: ${this._editModalVideoId}`);
        }
      });

      const infoLinkInput   = document.getElementById('editFieldInfoLink');
      const infoLinkOpenBtn = document.getElementById('editInfoLinkOpenBtn');

      if (infoLinkInput && infoLinkOpenBtn) {
        infoLinkInput.addEventListener('input', () => {
          this._updateInfoLinkButton();
        });

        infoLinkOpenBtn.addEventListener('click', () => {
          const url = infoLinkInput.value.trim();
          if (this._isValidUrl(url)) {
            window.open(url, '_blank', 'noopener,noreferrer');
          }
        });
      }

      const videoLinkInput   = document.getElementById('editFieldVideoLink');
      const videoLinkOpenBtn = document.getElementById('editVideoLinkOpenBtn');

      if (videoLinkInput && videoLinkOpenBtn) {
        videoLinkInput.addEventListener('input', () => {
          this._updateVideoLinkButton();
        });

        videoLinkOpenBtn.addEventListener('click', () => {
          const url = videoLinkInput.value.trim();
          if (this._isValidUrl(url)) {
            window.open(url, '_blank', 'noopener,noreferrer');
          }
        });
      }

      // Live colour/hint feedback while the user edits the expiry date, plus
      // the "reset to unlimited" shortcut next to the input. Both 'input' and
      // 'change' are observed because a native date picker commits its value
      // through 'change' in several browsers without ever firing 'input'.
      //
      const expiryInput    = document.getElementById('editFieldExpiryDate');
      const expiryClearBtn = document.getElementById('editExpiryClearBtn');

      if (expiryInput) {
        expiryInput.addEventListener('input',  () => this._updateExpiryFieldState());
        expiryInput.addEventListener('change', () => this._updateExpiryFieldState());
      }

      if (expiryInput && expiryClearBtn) {
        expiryClearBtn.addEventListener('click', () => {
          expiryInput.value = EXPIRY_UNLIMITED;
          this._updateExpiryFieldState();
        });
      }

      const episodeInput = document.getElementById('editFieldEpisode');
      const seriesSelect = document.getElementById('editFieldSeries');

      if (episodeInput && seriesSelect) {
        episodeInput.addEventListener('input', () => {
          const episodeValue = parseInt(episodeInput.value, 10) || 0;
          if (episodeValue > 0) {
            seriesSelect.value = '1';
            seriesSelect.dispatchEvent(new Event('change', { bubbles: true }));
          } else {
            seriesSelect.value = '0';
            seriesSelect.dispatchEvent(new Event('change', { bubbles: true }));
          }
        });
      }
    }

    // openEditModal: thumbnail and video link default to native video fields
    // (entry.poster, entry.src) instead of YouTube CDN / YouTube watch URL.
    openEditModal(videoId) {
      if (!videoId) return;

      if (!document.getElementById('editModal')) {
        this._createEditModal(videoId);
      }

      const playlist = this.load() || [];
      const entry    = playlist.find(item => item.videoId === videoId);
      if (!entry) return;

      const titleEl  = document.getElementById('editVideoTitle');
      const authorEl = document.getElementById('editVideoAuthor');
      const thumbEl  = document.getElementById('editVideoThumb');

      if (titleEl)  titleEl.textContent  = entry.title  || videoId;
      if (authorEl) authorEl.textContent = entry.author || '';
      if (thumbEl)  thumbEl.src = entry.poster || DEFAULT_POSTER;

      document.getElementById('editFieldCategory').value      = entry.category    || '';
      document.getElementById('editFieldTitle').value         = entry.title       || '';
      document.getElementById('editFieldDescription').value   = entry.description || '';
      document.getElementById('editFieldEpisode').value       = entry.episode     || '';
      document.getElementById('editFieldInfoLink').value      = entry.infoLink    || '';
      document.getElementById('editFieldVideoLink').value     = entry.videoLink   || entry.src || '';
      document.getElementById('editFieldIssueDate').value     = entry.issueDate   || '';
      document.getElementById('editFieldExpiryDate').value    = entry.expiryDate  || EXPIRY_UNLIMITED;
      document.getElementById('editFieldStartAt').value       = _secondsToTimeInputValue(_parseTimeToSeconds(entry.startAt));
      document.getElementById('editFieldEndAt').value         = _secondsToTimeInputValue(_parseTimeToSeconds(entry.endAt));
      document.getElementById('editFieldAudioFadeIn').value    = _normalizeAudioFadeInField(entry.audioFadeIn);
      document.getElementById('editFieldSeries').value        = entry.series      ? '1' : '';

      const entryTags = Array.isArray(entry.tags) ? entry.tags : [];

      document.getElementById('editFieldTagsCustom').value    = entryTags.join(', ');
      document.getElementById('editFieldTags').value          = '';
      document.getElementById('editFieldType').value          = entry.type || 'video';

      this._updateInfoLinkButton();
      this._updateVideoLinkButton();
      this._updateExpiryFieldState();

      this._editModalVideoId = videoId;

      const modalEl = document.getElementById('editModal');
      if (modalEl) {
        const bsModal = bootstrap.Modal.getOrCreateInstance(modalEl);
        bsModal.show();
      }
    }

    initEditHandler() {
      if (this._editHandlerInitialized) return;

      const playlistContainer = document.getElementById(_pid('videoplayer_playlist_parent'))
      if (!playlistContainer) return;

      this._editHandlerInitialized = true;

      playlistContainer.addEventListener('click', (event) => {
        const editBtn = event.target.closest('.playlist-btn.edit');
        if (!editBtn) return;

        const row     = editBtn.closest('[data-video-id]');
        const videoId = row ? row.dataset.videoId : null;

        if (videoId) {
          this.openEditModal(videoId);
        }
      });

      isDev && logger.info('\n' + 'playlistManager: edit handler initialized');
    }

    initInfoLinkHandler() {
      if (this._infoLinkHandlerInitialized) return;

      const playlistContainer = document.getElementById(_pid('videoplayer_playlist_parent'))
      if (!playlistContainer) return;

      this._infoLinkHandlerInitialized = true;

      playlistContainer.addEventListener('click', (event) => {
        const infoLink = event.target.closest('.playlist-info-link');
        if (!infoLink) return;
        event.stopPropagation();
      });

      isDev && logger.info('\n' + 'playlistManager: infoLink handler initialized');
    }

    initVideoLinkHandler() {
      if (this._videoLinkHandlerInitialized) return;

      const playlistContainer = document.getElementById(_pid('videoplayer_playlist_parent'))
      if (!playlistContainer) return;

      this._videoLinkHandlerInitialized = true;

      playlistContainer.addEventListener('click', (event) => {
        const videoLink = event.target.closest('.playlist-video-link');
        if (!videoLink) return;
        event.stopPropagation();
      });

      isDev && logger.info('\n' + 'playlistManager: videoLink handler initialized');
    }

    // search engine
    // -------------------------------------------------------------------------

    _saveSearchIndex() {
      if (!this._searchIndex) return;
      try {
        localStorage.setItem(this.INDEX_KEY, JSON.stringify(this._searchIndex));
        isDev && logger.info('\n' + 'playlistManager: search index saved to localStorage');
      } catch (e) {
        logger.error('\n' + `playlistManager: failed to save search index: ${e}`);
      }
    }

    _loadSearchIndex() {
      try {
        const stored = localStorage.getItem(this.INDEX_KEY);
        if (!stored) return false;
        this._searchIndex = lunr.Index.load(JSON.parse(stored));
        isDev && logger.info('\n' + 'playlistManager: search index loaded from localStorage');
        return true;
      } catch (e) {
        isDev && logger.debug('\n' + `playlistManager: failed to load search index from localStorage: ${e}`);
        this._searchIndex = null;
        return false;
      }
    }

    _invalidateSearchIndex() {
      this._searchIndex = null;
      localStorage.removeItem(this.INDEX_KEY);
    }

    buildSearchIndex() {
      const data = this.load() || [];
      const self = this;

      this._searchIndex = lunr(function () {

        // Correctness: the document objects passed to add() below have always
        // carried a `description` property, but the field was never DECLARED
        // via this.field() — and lunr silently ignores undeclared fields at
        // add() time, so descriptions were never indexed and a search for
        // description text returned no hits. Declaring the field makes the
        // already-supplied data searchable; no add() change needed.
        //
        this.ref('videoId');
        this.field('title',       { boost: 10 });
        this.field('author',      { boost: 5 });
        this.field('category',    { boost: 3 });
        this.field('tags',        { boost: 3 });
        this.field('description', { boost: 2 });
        this.field('infoLink');
        this.field('videoLink');
        this.field('issueDate');
        this.field('type');

        data.forEach(function (entry) {
          self._normalizeEntry(entry);
          this.add({
            videoId:      entry.videoId     || '',
            title:        entry.title       || '',
            author:       entry.author      || '',
            category:     entry.category    || '',
            description:  entry.description || '',
            infoLink:     entry.infoLink    || '',
            videoLink:    entry.videoLink   || '',
            issueDate:    entry.issueDate   || '',
            type:         entry.type        || '',
            tags:         Array.isArray(entry.tags) ? entry.tags.join(' ') : '',
          });
        }, this);
      });

      isDev && logger.info('\n' + `playlistManager: search index built with ${data.length} entries`);

      this._saveSearchIndex();
    }

    searchPlaylist(query) {
      if (!query || !query.trim()) {
        this.clearSearch();
        return [];
      }

      if (!this._searchIndex && !this._loadSearchIndex()) {
        this.buildSearchIndex();
      }

      if (!this._searchIndex) {
        isDev && logger.warn('\n' + 'playlistManager: search index not available');
        return [];
      }

      let lunrResults;
      try {
        lunrResults = this._searchIndex.search(query);
      } catch (e) {
        isDev && logger.warn('\n' + `playlistManager: lunr search error: ${e}`);
        lunrResults = [];
      }

      const data     = this.load() || [];
      const matchIds = new Set(lunrResults.map(r => r.ref));
      const results  = data.filter(item => matchIds.has(item.videoId));

      const orderMap = {};
      lunrResults.forEach((r, i) => { orderMap[r.ref] = i; });
      results.sort((a, b) => (orderMap[a.videoId] || 0) - (orderMap[b.videoId] || 0));

      this._searchResults = results;

      isDev && logger.debug('\n' + `playlistManager: search for "${query}" returned ${results.length} results`);

      this.renderCurrent();
      return results;
    }

    // Performance helper for the date criteria of _applySortOrder(): the
    // original comparators constructed TWO `new Date(...)` objects on EVERY
    // comparison, i.e. ~2·n·log(n) Date parses per sort (a 200-entry list
    // sorts with roughly 3000 short-lived Date allocations — on every render
    // while a date criterion is active). The timestamp is now computed ONCE
    // per element (decorate-sort pattern via a Map keyed by the element
    // reference) and the comparator reduces to a numeric subtraction.
    // Order semantics are IDENTICAL to the originals, including the
    // invalid-date case: an unparseable date yields NaN, the subtraction
    // yields NaN, and Array.prototype.sort treats a NaN comparator result
    // exactly like 0 — the same behaviour the `new Date(a) - new Date(b)`
    // comparators had. Sorting stays in place on `data`, preserving the
    // method's contract.
    //
    // @param {Array<Object>} data  playlist entries (sorted in place)
    // @param {Function}      tsOf  entry -> numeric timestamp (may be NaN)
    // @param {boolean}       desc  true = newest first
    _sortByTimestamp(data, tsOf, desc) {
      const ts = new Map();
      data.forEach(e => ts.set(e, tsOf(e)));
      data.sort((a, b) => desc ? (ts.get(b) - ts.get(a)) : (ts.get(a) - ts.get(b)));
      return data;
    }

    // _isSeriesPlaylist(data) - true when the given set is a SERIES playlist.
    //
    // A set qualifies as soon as ONE entry carries BOTH flags set:
    //
    //   series  > 0   the entry belongs to a series
    //   episode > 0   the entry has a position inside that series
    //
    // Both are required on purpose. 'episode' sorting orders by the episode
    // number, so a set that flags a series but leaves every episode at 0
    // (or vice versa) would sort into a single equal-keys bucket, i.e. no
    // visible order at all — for such a set the date default is the better
    // answer and the test correctly reports false.
    //
    // NOTE: this is deliberately STRICTER than the pre-existing
    // `hasSeries || hasEpisode` test of the two playlist LOAD paths
    // (handleFileSelected() / handleLoadFromServer()). Those keep their
    // original OR semantics untouched — this fix only adds the branch they
    // never had (see there) — so no established behaviour changes.
    //
    // @param  {Array<Object>} data  playlist entries
    // @return {boolean}
    //
    _isSeriesPlaylist(data) {
      if (!Array.isArray(data) || data.length === 0) return false;
      return data.some(e => e && Number(e.series) > 0 && Number(e.episode) > 0);
    }

    // _deriveDefaultSortCriterion(data) - the DEFAULT display order of a set.
    //
    //   'episode'    series playlist  (series > 0 and episode > 0)
    //   'watchDate'  everything else  (Date, newest first — the historic default)
    //
    // Both values are canonical options of the sort <select> and both are
    // handled by _applySortOrder(), so the result can be used as-is anywhere a
    // criterion is expected.
    //
    // @param  {Array<Object>} data  playlist entries
    // @return {string}              sort criterion
    //
    _deriveDefaultSortCriterion(data) {
      return this._isSeriesPlaylist(data) ? 'episode' : 'watchDate';
    }

    // _ensureDefaultSortCriterion(data) - silent, once-only default resolution.
    //
    // Called from the top of _applySortOrder() (below), the one place EVERY
    // ordering consumer passes through: renderPlaylist(), renderCards(),
    // autoLoadFirstEntryOnReload(), _resyncPluginPlaylist(), embedRunVideo()
    // and the two load paths. Hooking it there makes the content-derived
    // default independent of handler INIT ORDER — it also applies when the
    // playlist arrives late (async preloadPlaylists()) or when no title bar
    // exists at all, in which case playlistSortHandler.init() returns early
    // and never gets to set a criterion.
    //
    // Precedence (identical to the switch/localStorage precedence used by the
    // other playlist preferences):
    //
    //   1. an explicit user choice  - localStorage _pid('searchMode'), written
    //                                 by the sort <select> change listener
    //   2. the derived default      - 'episode' | 'watchDate'
    //
    // Deliberately SILENT: it only updates _currentSort (and mirrors the value
    // into an already-built <select>) and never calls sortPlaylist() /
    // renderCurrent(), because its caller _applySortOrder() runs INSIDE the
    // render pipeline — a render from here would re-enter it. The criterion is
    // picked up by the very same _applySortOrder() pass, one statement later.
    //
    // Once-only via _defaultSortResolved, and the flag is set only for a
    // NON-EMPTY set, so an early render of the still empty playlist keeps the
    // resolution retriable for the first real data.
    //
    // @param {Array<Object>} data  playlist entries of the current pass
    //
    _ensureDefaultSortCriterion(data) {
      if (this._defaultSortResolved) return;
      if (!Array.isArray(data) || data.length === 0) return;

      this._defaultSortResolved = true;

      let storedSortMode = null;
      try {
        storedSortMode = localStorage.getItem(_pid('searchMode'));
      } catch (e) {
        storedSortMode = null;
      }

      if (storedSortMode) {
        isDev && logger.debug('\n' + `playlistManager: default sort criterion skipped — user choice "${storedSortMode}" in effect`);
        return;
      }

      const criterion = this._deriveDefaultSortCriterion(data);
      if (criterion === this._currentSort) return;

      this._currentSort = criterion;

      // Keep an already-built control in sync. When the <select> does not
      // exist yet, playlistSortHandler.init() adopts _currentSort as its own
      // fallback, so the value reaches the control either way.
      //
      const sortSelect = document.getElementById(_pid('playlistSortSelect'));
      if (sortSelect) sortSelect.value = criterion;

      isDev && logger.info('\n' + `playlistManager: default sort criterion derived from playlist content: "${criterion}"`);
    }

    // applyDefaultSortCriterion(data, respectUserChoice) - RE-apply the default.
    //
    // The loud counterpart of _ensureDefaultSortCriterion(): used whenever the
    // playlist CONTENT is replaced or extended (import, server load, preload),
    // where the previously resolved default may no longer match the new set —
    // e.g. a series playlist ('episode') followed by a plain one, which kept
    // sorting by episode until now.
    //
    // Unlike the silent resolver it re-arms the once-only latch, mirrors the
    // criterion into the <select> and routes the change through
    // sortPlaylist(), so the panel AND the videojs-playlist plugin order
    // (#31 resync) follow immediately. It is safe to call outside a render
    // because no render is in progress on those paths.
    //
    // @param  {Array<Object>} [data]              entries; falls back to load()
    // @param  {boolean}       [respectUserChoice] true = an explicit sort
    //                                             choice in localStorage wins
    // @return {string}                            the criterion in effect
    //
    applyDefaultSortCriterion(data, respectUserChoice) {
      const view = (Array.isArray(data) && data.length > 0) ? data : (this.load() || []);
      if (view.length === 0) return this._currentSort || 'watchDate';

      this._defaultSortResolved = true;

      if (respectUserChoice) {
        let storedSortMode = null;
        try {
          storedSortMode = localStorage.getItem(_pid('searchMode'));
        } catch (e) {
          storedSortMode = null;
        }
        if (storedSortMode) {
          isDev && logger.debug('\n' + `playlistManager: default sort criterion skipped — user choice "${storedSortMode}" in effect`);
          return storedSortMode;
        }
      }

      const criterion  = this._deriveDefaultSortCriterion(view);
      const sortSelect = document.getElementById(_pid('playlistSortSelect'));
      if (sortSelect) sortSelect.value = criterion;

      if (criterion !== this._currentSort) {
        this.sortPlaylist(criterion);
        isDev && logger.info('\n' + `playlistManager: default sort criterion set to "${criterion}" for the loaded playlist`);
      } else {
        this._currentSort = criterion;
      }

      return criterion;
    }

    _applySortOrder(data) {
      if (!data || data.length === 0) return data;

      // Resolve the content-derived default BEFORE the criterion is read
      // below, so the very first ordering pass of a series playlist already
      // uses 'episode' instead of the constructor's 'watchDate' seed.
      // No-op after the first non-empty pass and whenever an explicit user
      // choice is stored (see the method note).
      //
      this._ensureDefaultSortCriterion(data);

      const criterion = this._currentSort || 'watchDate';

      switch (criterion) {
        case 'watchDate':
          this._sortByTimestamp(data, e => new Date(e.watchDate).getTime(), true);
          break;
        case 'watchDateAsc':
          this._sortByTimestamp(data, e => new Date(e.watchDate).getTime(), false);
          break;
        case 'title':
          data.sort((a, b) => (a.title || '').localeCompare(b.title || '', undefined, { sensitivity: 'base' }));
          break;
        case 'author':
          data.sort((a, b) => (a.author || '').localeCompare(b.author || '', undefined, { sensitivity: 'base' }));
          break;
        case 'duration':
          data.sort((a, b) => (b.duration || 0) - (a.duration || 0));
          break;
        case 'durationAsc':
          data.sort((a, b) => (a.duration || 0) - (b.duration || 0));
          break;
        case 'rating':
          data.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          break;
        case 'category':
          data.sort((a, b) => (a.category || '').localeCompare(b.category || '', undefined, { sensitivity: 'base' }));
          break;
        case 'type':
          data.sort((a, b) => (a.type || '').localeCompare(b.type || '', undefined, { sensitivity: 'base' }));
          break;
        case 'issueDate':
          this._sortByTimestamp(data, e => e.issueDate ? new Date(e.issueDate).getTime() : 0, true);
          break;
        case 'issueDateAsc':
          this._sortByTimestamp(data, e => e.issueDate ? new Date(e.issueDate).getTime() : 0, false);
          break;
        case 'episode':
          data.sort((a, b) => {
            const aSeries = a.series ? 1 : 0;
            const bSeries = b.series ? 1 : 0;
            if (aSeries !== bSeries) return bSeries - aSeries;
            return (a.episode || 0) - (b.episode || 0);
          });
          break;
        case 'series':
          data.sort((a, b) => {
            const aSeries = a.series ? 1 : 0;
            const bSeries = b.series ? 1 : 0;
            if (aSeries !== bSeries) return bSeries - aSeries;
            return (a.title || '').localeCompare(b.title || '', undefined, { sensitivity: 'base' });
          });
          break;
        default:
          break;
      }

      return data;
    }

    // Enables the #toggle_playlist button only when at least one playlist
    // entry exists in localStorage.  When the playlist is empty the button
    // receives the HTML `disabled` attribute and a reduced opacity so it is
    // clearly non-interactive; both are removed the moment data is present.
    //
    // The helper follows the same _update*Visibility pattern used by
    // _updateSortSelectVisibility, _updateModeSwitchVisibility, etc. and is
    // called unconditionally from renderCurrent() so the button state is
    // always in sync with the actual playlist contents.
    //
    // Also blocks #toggle_playlist whenever the playlist editor is open
    // (#edit_playlist has data-edit-open="true").  While the editor occupies
    // the video-container slot, toggling the playlist panel is meaningless and
    // could leave the UI in an inconsistent state, so the button is disabled
    // (same visual treatment as the empty-playlist case) for the duration of
    // the edit session.  The block is lifted automatically as soon as the
    // editor is closed (data-edit-open attribute becomes "false" or absent).
    //
    // multiPlayer optimizations #2 (d)
    // Optional `data` parameter: when renderCurrent() passes its already-
    // resolved view snapshot, the extra localStorage parse is skipped. All
    // pre-existing no-argument call sites keep the original behaviour via
    // the fallback below.
    //
    _updateTogglePlaylistButton(data) {
      const btn = document.getElementById(_pid('toggle_playlist'));
      if (!btn) return;

      // Check whether the playlist editor is currently open.
      const editBtn    = document.getElementById(_pid('edit_playlist'));
      const editIsOpen = editBtn && editBtn.getAttribute('data-edit-open') === 'true';

      if (editIsOpen) {
        btn.setAttribute('disabled', '');
        btn.setAttribute('aria-disabled', 'true');
        btn.style.opacity = '0.35';
        btn.style.cursor  = 'not-allowed';
        btn.title         = 'Close the playlist editor first';
        isDev && logger.debug('\n' + '_updateTogglePlaylistButton: button blocked — playlist editor is open');
        return;
      }

      if (!data) data = this._searchResults || this.load() || [];
      const hasData = data.length > 0;

      if (hasData) {
        btn.removeAttribute('disabled');
        btn.setAttribute('aria-disabled', 'false');
        btn.style.removeProperty('opacity');
        btn.style.removeProperty('cursor');
        btn.title       = btn.getAttribute('aria-label') || 'Show playlist';
      } else {
        btn.setAttribute('disabled', '');
        btn.setAttribute('aria-disabled', 'true');
        btn.style.opacity = '0.35';
        btn.style.cursor  = 'not-allowed';
        btn.title         = 'No playlist loaded';
      }

      isDev && logger.debug('\n' + `_updateTogglePlaylistButton: button ${hasData ? 'enabled' : 'disabled'} (${data.length} items)`);
    }

    _updateSortSelectVisibility(data) {

      // This per-render visibility helper must resolve the SAME player-scoped id
      // the sort handler now creates (_pid('playlistSortSelect')). Left bare, it
      // would no longer find the (now suffixed) control for any player and the
      // show/hide-on-empty behaviour would silently stop working.
      //
      const sortSelect = document.getElementById(_pid('playlistSortSelect'));
      if (!sortSelect) return;

      if (!data) data = this._searchResults || this.load() || [];
      sortSelect.style.display = data.length > 0 ? '' : 'none';

      this._updateSortOptionsVisibility(sortSelect, data);
    }

    _updateModeSwitchVisibility(data) {
      const listModeSwitch = document.getElementById(_pid('playlistModeSwitch'));
      if (!listModeSwitch) return;

      if (!data) data = this._searchResults || this.load() || [];
      listModeSwitch.style.display = data.length > 0 ? '' : 'none';
    }

    _updateMergeSwitchVisibility(data) {
      const mergeModeSwitch = document.getElementById(_pid('playlistMergeSwitch'));
      if (!mergeModeSwitch) return;

      if (!data) data = this._searchResults || this.load() || [];
      mergeModeSwitch.style.display = data.length > 0 ? '' : 'none';
    }

    // _updateAudioOnlySwitchVisibility - show/hide the title-bar audio-only
    // switch, following the _update*Visibility pattern of this class.
    //
    // The switch is visible only when BOTH conditions hold:
    //
    //   1. ui_elements.audioOnlySwitch is not explicitly false,
    //   2. the ACTIVE view holds at least one YouTube entry.
    //
    // Rule 2 makes the control self-hiding on native-only (.mp3/.mp4)
    // playlists and on an empty playlist — the exact INVERSE of the export
    // controls' rule (which self-hide on YouTube-only playlists), so a mixed
    // playlist shows both control groups and a pure playlist only the
    // applicable one. A running search narrows the tested set to the visible
    // result (viewData), same as every sibling helper.
    //
    _updateAudioOnlySwitchVisibility(data) {
      const audioOnlySwitch = document.getElementById(_pid('audioOnlySwitch'));
      if (!audioOnlySwitch) return;

      const opts = _resolveVideoPlayerEffectiveOptions();
      const ui   = (opts && typeof opts.ui_elements === 'object' && opts.ui_elements)
        ? opts.ui_elements
        : {};

      if (ui.audioOnlySwitch === false) {
        audioOnlySwitch.style.display = 'none';
        return;
      }

      if (!data) data = this._searchResults || this.load() || [];

      const hasYouTube = data.some(_isYouTubeEntry);
      audioOnlySwitch.style.display = hasYouTube ? '' : 'none';
    }

    // _syncAudioOnlyMirror - keep the UI mirror this._audioOnly aligned with
    // the EFFECTIVE state when no checkbox owns it.
    //
    // With the switch present, audioOnlySwitchHandler.init() seeds the mirror
    // and its 'change' listener maintains it. With the switch suppressed or
    // unreachable, that handler never runs (it returns early on the
    // ui_elements gate) and the mirror keeps the raw constructor seed
    // (localStorage 'audioOnly_<id>' === 'true'), which can contradict the
    // configured set_audio_only. Playback never reads the mirror — every
    // decision goes through _resolveAudioOnlyActive() — but a contradicting
    // field is a trap for any future consumer and for log analysis, so the
    // value is re-asserted from the resolver on every render.
    //
    // Deliberately a no-op while the switch is available: writing the mirror
    // there would fight the checkbox handler for ownership.
    _syncAudioOnlyMirror() {
      if (_isAudioOnlySwitchAvailable()) {
        return;
      }

      const effective = _resolveAudioOnlyActive();
      if (this._audioOnly !== effective) {
        this._audioOnly = effective;
        isDev && logger.debug('\n' + `playlistManager: audio-only mirror synced from configuration (${effective})`);
      }
    }

    // _updateDownloadAllButtonVisibility - show/hide the title-bar export
    // button, following the _update*Visibility pattern of this class.
    //
    // The button is visible only when BOTH conditions hold:
    //
    //   1. ui_elements.playlist_download_all_button is not explicitly false,
    //   2. the ACTIVE view holds at least one plain .mp3/.mp4 item.
    //
    // Rule 2 makes the control self-hiding on YouTube/streaming playlists and
    // on an empty playlist, so no configuration is needed to keep it away
    // from players that have nothing to export. The item count is carried in
    // the tooltip so the user knows what a click will do.
    //
    _updateDownloadAllButtonVisibility(data) {
      const button = document.getElementById(_pid('playlistDownloadAllButton'));
      if (!button) return;

      if (!_resolveUiElementDownloadFlags().downloadAll) {
        button.style.display = 'none';
        return;
      }

      if (!data) data = this._searchResults || this.load() || [];

      const count = this._getDownloadableEntries(data).length;

      button.style.display = count > 0 ? '' : 'none';

      if (count > 0) {
        button.title = `Download all ${count} media file${count === 1 ? '' : 's'} of the playlist to your download folder`;
      }
    }

    _updateLoopSwitchVisibility(data) {
      const loopSwitch = document.getElementById(_pid('playlisLoopSwitch'));
      if (!loopSwitch) return;

      if (!loopConfigEnabled) {
        loopSwitch.style.display = 'none';
        if (this._loopEnabled) {
          this._loopEnabled = false;

          // Player-scope this UI-preference write so it clears only
          // THIS player's persisted loop flag (see the constructor-read note).
          // _pid('playlistLoop') matches the key read back in the constructor
          // and the loop checkbox id.
          //
          localStorage.setItem(_pid('playlistLoop'), 'false');
        }
        const checkbox = document.getElementById(_pid('loopMode'));
        if (checkbox) checkbox.checked = false;
        return;
      }

      if (!data) data = this._searchResults || this.load() || [];
      const allSeries = data.length > 0 && data.every(e => e.series && e.series >= 1);

      if (allSeries) {
        loopSwitch.style.display = '';
      } else {
        loopSwitch.style.display = 'none';

        if (this._loopEnabled) {
          this._loopEnabled = false;

          // Player-scope this UI-preference write (see the constructor-read note).
          //
          localStorage.setItem(_pid('playlistLoop'), 'false');

          isDev && logger.debug('\n' + '_updateLoopSwitchVisibility: loop mode disabled (not all items are series)');
        }
        // multiPlayer MultiInstance #4
        const checkbox = document.getElementById(_pid('loopMode'));
        if (checkbox) {
          checkbox.checked = false;
        }
      }
    }

    _updateSortOptionsVisibility(selectEl, data) {
      const fieldTests = {
        title:       (d) => d.some(e => e.title       && e.title.trim()       !== ''),
        author:      (d) => d.some(e => e.author      && e.author.trim()      !== ''),
        duration:    (d) => d.some(e => e.duration    && e.duration > 0),
        durationAsc: (d) => d.some(e => e.duration    && e.duration > 0),
        rating:      (d) => d.some(e => e.rating      && e.rating > 0),
        category:    (d) => d.some(e => e.category    && e.category.trim()    !== ''),
        description: (d) => d.some(e => e.description && e.description.trim() !== ''),
        type:        (d) => d.some(e => e.type        && e.type.trim()        !== ''),
        issueDate:   (d) => d.some(e => e.issueDate   && e.issueDate.trim()   !== ''),
        issueDateAsc:(d) => d.some(e => e.issueDate   && e.issueDate.trim()   !== ''),
        episode:     (d) => d.some(e => e.series),
      };

      const options = selectEl.options;
      for (let i = 0; i < options.length; i++) {
        const opt = options[i];

        if (!opt.value || opt.value.trim() === '') {
          opt.hidden   = true;
          opt.disabled = true;
          continue;
        }

        const test = fieldTests[opt.value];
        if (test) {
          const hasData = data.length > 0 && test(data);
          opt.hidden   = !hasData;
          opt.disabled = !hasData;
        } else {
          opt.hidden   = false;
          opt.disabled = false;
        }
      }

      const current    = selectEl.value;
      const currentOpt = selectEl.querySelector(`option[value="${current}"]`);
      if (currentOpt && currentOpt.hidden) {

        // The active criterion lost its data (e.g. 'rating' on a playlist
        // without ratings) and the option was just hidden above. The fallback
        // was hard-coded to 'watchDate', which dropped a SERIES playlist into
        // the meaningless equal-dates order. It now falls back to the same
        // content-derived default the rest of this fix uses.
        //
        // No recursion risk: the 'episode' option is shown whenever an entry
        // carries a series flag (fieldTests above) — which is exactly when
        // _deriveDefaultSortCriterion() can return 'episode' — and the
        // 'watchDate' option has no field test and is never hidden. So the
        // re-render triggered by sortPlaylist() finds a VISIBLE current
        // option and does not re-enter this branch.
        //
        // Original (deprecated, preserved for reference):
        // selectEl.value = 'watchDate';
        // this.sortPlaylist('watchDate');
        //
        const fallbackCriterion = this._deriveDefaultSortCriterion(data);
        selectEl.value = fallbackCriterion;
        this.sortPlaylist(fallbackCriterion);
      }
    }

    sortPlaylist(criterion) {
      this._currentSort = criterion || 'watchDate';
      isDev && logger.debug('\n' + `playlistManager: sort criterion set to "${this._currentSort}"`);
      this.renderCurrent();

      // Re-sync the videojs-playlist plugin order on a sort change.
      //
      // Problem (follow-on candidate left open by #30): #30 only re-feeds the
      // plugin from the sorted display source inside embedRunVideo(), i.e. when
      // a video is (re)selected and the player is rebuilt. If the user changes
      // the sort dropdown mid-playback WITHOUT selecting a new video,
      // renderCurrent() (above) re-renders the visible panel in the new order,
      // but the plugin keeps its previous internal order — so the control-bar
      // prev/next buttons (nextPrevButtons -> playlist.previous()/.next()) and
      // autoadvance navigate in the OLD order until the next selection.
      //
      // Fix: push the freshly sorted order into the live plugin via the
      // module-level `player` handle (declared at the module variables block),
      // keeping the currently-playing item as the plugin's current item so only
      // the navigation sequence changes, not which video is loaded. The heavy
      // lifting (guards, display-source build, active-item resolution, playback
      // preservation) is centralised in _resyncPluginPlaylist().
      //
      this._resyncPluginPlaylist();
    }

    // Re-feed the live videojs-playlist plugin with the current display order.
    //
    // Mirrors the #30 source-build pipeline (displaySource -> _applySortOrder()
    // copy -> convertVideoPlayerPlaylist()) so the plugin's item order matches
    // exactly what renderPlaylist()/renderCards() shows, then re-points the
    // plugin's current item at the video that is playing right now (resolved by
    // videoId, the #20/#23 index space) so the active source is preserved.
    //
    // Unlike #30 (which runs while embedRunVideo() is rebuilding the player and
    // a fresh source load is expected), this runs mid-playback with no rebuild.
    // The videojs-playlist public API exposes no "reorder without reload", so
    // re-feeding necessarily reloads the active source; the current time and
    // play/pause state are captured beforehand and restored after the reload
    // using the same one-shot listener + 250ms-seek pattern the resume logic in
    // embedRunVideo() already relies on for both the native and YouTube techs.
    //
    // Heavily guarded and purely additive: it no-ops unless a non-disposed
    // player with the playlist plugin loaded exists, the playlist has at least
    // two items (ordering is meaningless otherwise), the active video resolves
    // inside the freshly converted list, AND the order actually changed — so a
    // sort selection that yields an identical sequence never disturbs playback.
    _resyncPluginPlaylist() {

      // Guard: a live, non-disposed player with the playlist plugin loaded.
      //
      if (!player) return;
      if (typeof player.isDisposed === 'function' && player.isDisposed()) return;
      if (typeof player.playlist !== 'function') return;

      // Guard: the playlist plugin must be enabled in config (same source #30
      // reads). Read defensively straight from the adapter options so this does
      // not depend on the module-level videoPlayerOptions having been assigned.
      //
      let piPlaylist = null;

      try {

        // Per-instance options (factory) take precedence over the page-global
        // adapter options, so a per-player plugins.playlist.enabled override
        // (videoPlayer_control.yml) governs THIS player's resync guard.
        //
        const opts = _resolveVideoPlayerEffectiveOptions();
        piPlaylist = opts && opts.videoJS && opts.videoJS.plugins
          ? opts.videoJS.plugins.playlist
          : null;
      } catch (e) {
        piPlaylist = null;
      }
      if (!piPlaylist || !piPlaylist.enabled) return;

      // Resolve the video that is playing RIGHT NOW, BEFORE the list is touched.
      // Re-feeding fires 'playlistitem' (the #23 listener) and would otherwise
      // clobber _playlistActiveVideoId, so the active id is captured up front.
      //
      //   1) _playlistActiveVideoId  - the #23 tracker that follows plugin nav.
      //   2) the current plugin item - via the pre-reorder list + currentItem().
      //   3) player.*VideoData       - last-resort tech-side fallback.
      //
      let activeVideoId = _playlistActiveVideoId || null;

      // Snapshot the plugin's current (pre-reorder) list + index. Used both for
      // the activeVideoId fallback and for the order-changed comparison below.
      //
      let currentList = null;
      let currentIdx  = -1;

      try {
        currentList = player.playlist();
        if (typeof player.playlist.currentItem === 'function') {
          currentIdx = player.playlist.currentItem();
        }
      } catch (e) {
        currentList = null;
      }

      if (!activeVideoId && Array.isArray(currentList) &&
          typeof currentIdx === 'number' && currentIdx >= 0 &&
          currentList[currentIdx] && currentList[currentIdx].videoId) {
        activeVideoId = currentList[currentIdx].videoId;
      }

      if (!activeVideoId) {
        if (player.ytVideoData && player.ytVideoData.video_id) {
          activeVideoId = player.ytVideoData.video_id;
        } else if (player.videoData && player.videoData.videoId) {
          activeVideoId = player.videoData.videoId;
        }
      }

      // Build the new plugin source from the SAME display source the panel uses
      // and sort it with the SAME _applySortOrder() before conversion (#30
      // pipeline). _applySortOrder() sorts in place and returns the array, so a
      // defensive .slice() copy is sorted to avoid mutating _searchResults / the
      // stored playlist here.
      //
      const displaySource = this._searchResults || this.load() || [];
      const rawPlaylist   = this._applySortOrder(displaySource.slice());
      const playlist      = this.convertVideoPlayerPlaylist(rawPlaylist, piPlaylist.poster);

      // Guard: ordering only matters with at least two playable items.
      //
      if (!Array.isArray(playlist) || playlist.length < 2) return;

      // Resolve the active video inside the freshly converted list (videoId
      // match, the #20 index space). convertVideoPlayerPlaylist() silently
      // drops entries without playable sources, so a raw index cannot be
      // reused. If the active video is absent from the converted list,
      // do NOT reload — that would interrupt playback for no navigational
      // benefit.
      //
      const syncedIndex = playlist.findIndex((item) => item && item.videoId === activeVideoId);
      if (syncedIndex < 0) {
        isDev && logger.debug('\n' + `playlist re-sync for active videoId '${activeVideoId}' not in converted list: skipping re-feed`);
        return;
      }

      // Guard: skip the re-feed entirely when the order did not actually change
      // (e.g. the chosen sort criterion yields the same sequence). Comparing the
      // videoId sequence of the live plugin list against the new converted list
      // avoids an unnecessary source reload — and the playback hiccup it causes.
      //
      if (Array.isArray(currentList) && currentList.length === playlist.length) {
        let identical = true;
        for (let i = 0; i < playlist.length; i++) {
          const a = currentList[i] && currentList[i].videoId;
          const b = playlist[i] && playlist[i].videoId;
          if (a !== b) { identical = false; break; }
        }
        if (identical) {
          isDev && logger.debug('\n' + 'playlist re-sync: order unchanged, no re-feed');
          return;
        }
      }

      // Capture playback state so the reload (below) is transparent to the user.
      //
      let resumeTime = 0;
      let wasPaused  = true;

      try {
        if (typeof player.currentTime === 'function') resumeTime = player.currentTime() || 0;
        if (typeof player.paused === 'function')      wasPaused  = player.paused();
      } catch (e) {
        resumeTime = 0;
        wasPaused  = true;
      }

      // Re-feed the live plugin and re-point its current item at the active
      // video (same two-step pattern as #30: playlist(list) then currentItem()).
      // The intermediate playlist() load of item 0 fires a transient
      // 'playlistitem' that the #23 listener self-corrects on the currentItem()
      // jump, so the active-item marker lands on the right entry.
      //
      try {

        // Same defect class as the onReady setup feed: the two-step re-feed
        // (playlist() auto-loading item 0, then currentItem(syncedIndex)
        // re-loading the active item) put a burst of TWO source swaps — two
        // cueVideoById() commands on the YouTube tech — into the live player,
        // exposing the same IFrame command race mid-playback. The one-step
        // form playlist(playlist, syncedIndex) selects the active item
        // directly, so at most ONE source swap occurs. Bonus: when the active
        // video keeps the SAME index in the new order, the plugin's
        // currentItem(syncedIndex) is a no-op (core.js: `currentIndex_ !== e`)
        // and the reload — and the playback hiccup the #31 notes accept — is
        // skipped entirely.
        //
        player.playlist(playlist, syncedIndex);
      } catch (e) {
        isDev && logger.warn('\n' + `playlist re-sync: re-feed failed: ${e}`);
        return;
      }

      // Restore playback after the source reload triggered by the re-feed.
      // 'loadedmetadata' fires regardless of play state (covers both a playing
      // and a paused video), and the 250ms-deferred seek mirrors the resume
      // logic embedRunVideo() already uses successfully on both techs. Play/
      // pause state is re-asserted because currentItem() may auto-start the
      // reloaded source. All operations are wrapped so a tech-side rejection can
      // never break the sort handler.
      //
      const onResyncLoaded = () => {
        player.off('loadedmetadata', onResyncLoaded);

        setTimeout(() => {
          try {
            if (resumeTime > 0) player.currentTime(resumeTime);
          } catch (e) { /* tech may reject an early seek; harmless */ }
          try {
            if (wasPaused) {
              player.pause();
            } else {
              const p = player.play();
              if (p && typeof p.catch === 'function') p.catch(() => {});
            }
          } catch (e) { /* play()/pause() rejection is non-fatal */ }
        }, 250);
      };
      player.on('loadedmetadata', onResyncLoaded);

      isDev && logger.info('\n' +
        `playlist re-sync: re-fed plugin in new order; active videoId '${activeVideoId}' kept at index ${syncedIndex}`);
    }

    clearSearch() {
      this._searchResults = null;
      this.renderCurrent();
      isDev && logger.debug('\n' + 'playlistManager: search cleared');
    }

  } // END PlaylistManager

  const playlistManager = new PlaylistManager();

  // Seed the owning player id at instance-creation time. This runs BEFORE the
  // initial load()/_manageHiddenMode() check below and BEFORE the
  // initEditPlaylistHandler()/initTogglePlaylistHandler() registrations, so
  // _pid() resolves the per-player (suffixed) element ids and the
  // localStorage keys (STORAGE_KEY/INDEX_KEY, see #40) are player-scoped from
  // the very first read. The adapter may still call setPlayerID() again later
  // — the call is idempotent because the keys are always re-derived from the
  // bare base keys.
  //
  if (instanceID) {
    playlistManager.setPlayerID(instanceID);
  }

  {
    const data = playlistManager.load();
    if (!data || (Array.isArray(data) && data.length === 0)) {
      playlistManager._manageHiddenMode(false);
    }
  }

  // Register the edit_playlist toggle handler once the module initialises.
  // The handler is safe to call here because the DOM elements it references
  // (#edit_playlist, #playlist_edit_screen, #video_container) are declared in
  // the page HTML above the <script> block that loads this module, so they
  // are already present when this line executes.
  //
  initEditPlaylistHandler();

  // Register the toggle_playlist click handler.  The adapter's toggle handler
  // used bare (un-suffixed) element IDs, which broke after every per-player id
  // was made unique.  This module-level handler resolves all ids via _pid().
  //
  initTogglePlaylistHandler();

  // ---------------------------------------------------------------------------
  // Picture-in-Picture helpers (unchanged)
  // ---------------------------------------------------------------------------

  function _isPiPSupported() {
    if ('documentPictureInPicture' in window) return 'documentPiP';
    if (document.pictureInPictureEnabled) return 'videoPiP';
    return null;
  }

  async function _enterDocumentPiP(vjsPlayer) {
    if (!vjsPlayer) return false;
    if (pipWindow && !pipWindow.closed) {
      isDev && logger.info('\n' + 'pip: Document PiP window already open');
      return true;
    }

    try {
      const playerEl = vjsPlayer.el();
      if (!playerEl) return false;

      const width  = Math.min(480, Math.round(window.innerWidth * 0.35));
      const height = Math.round(width * 9 / 16);

      pipWindow = await window.documentPictureInPicture.requestWindow({
        width:  width,
        height: height
      });

      [...document.styleSheets].forEach(sheet => {
        try {
          if (sheet.href) {
            const link  = pipWindow.document.createElement('link');
            link.rel    = 'stylesheet';
            link.href   = sheet.href;
            pipWindow.document.head.appendChild(link);
          } else if (sheet.cssRules) {
            const style = pipWindow.document.createElement('style');
            [...sheet.cssRules].forEach(rule => {
              style.appendChild(pipWindow.document.createTextNode(rule.cssText));
            });
            pipWindow.document.head.appendChild(style);
          }
        } catch (_) {}
      });

      const originalParent = playerEl.parentNode;
      const nextSibling    = playerEl.nextSibling;

      pipWindow.document.body.appendChild(playerEl);

      playerEl.style.width  = '100%';
      playerEl.style.height = '100%';

      pipWindow.addEventListener('pagehide', () => {
        if (originalParent) {
          if (nextSibling && nextSibling.parentNode === originalParent) {
            originalParent.insertBefore(playerEl, nextSibling);
          } else {
            originalParent.appendChild(playerEl);
          }
        }
        playerEl.style.width  = '';
        playerEl.style.height = '';

        pipWindow = null;
        isDev && logger.info('\n' + 'pip: Document PiP window closed, player restored');
      });

      isDev && logger.info('\n' + `pip: entered Document PiP (${width}x${height})`);
      pipEnabled = true;
      return true;

    } catch (err) {
      isDev && logger.warn('\n' + `pip: Document PiP request failed: ${err}`);
      pipWindow = null;
      return false;
    }
  }

  async function _enterVideoPiP(vjsPlayer) {
    if (!vjsPlayer) return false;

    try {
      const tech = vjsPlayer.tech({ IWillNotUseThisInPlugins: true });
      const videoEl = tech && tech.el();

      if (videoEl && typeof videoEl.requestPictureInPicture === 'function') {
        await videoEl.requestPictureInPicture();
        isDev && logger.info('\n' + 'pip: entered standard video PiP');
        pipEnabled = true;
        return true;
      }
    } catch (err) {
      isDev && logger.warn('\n' + `pip: standard video PiP failed: ${err}`);
    }

    return false;
  }

  async function _exitPictureInPicture(vjsPlayer) {
    if (pipWindow && !pipWindow.closed) {
      pipWindow.close();
      pipWindow = null;
      isDev && logger.info('\n' + 'pip: closed Document PiP window');
      return;
    }

    if (document.pictureInPictureElement) {
      try {
        await document.exitPictureInPicture();
        isDev && logger.debug('\n' + 'pip: exited standard video PiP');
      } catch (err) {
        isDev && logger.warn('\n' + `pip: exitPictureInPicture failed: ${err}`);
      }
    }
  }

  async function _requestPictureInPicture(vjsPlayer) {
    const mode = _isPiPSupported();

    if (mode === 'documentPiP') {
      return _enterDocumentPiP(vjsPlayer);
    }

    if (mode === 'videoPiP') {
      return _enterVideoPiP(vjsPlayer);
    }

    isDev && logger.warn('\n' + 'pip: no PiP API supported by this browser');
    return false;
  }

  function _initPiPVisibilityHandler(vjsPlayer) {
    if (pipVisibilityBound) return;
    pipVisibilityBound = true;

    document.addEventListener('visibilitychange', async () => {
      if (!vjsPlayer || vjsPlayer.isDisposed()) return;

      if (document.visibilityState === 'hidden') {
        const paused = vjsPlayer.paused();
        if (!paused) {
          isDev && logger.info('\n' + 'pip: tab hidden while playing, requesting PiP');
          const ok = await _requestPictureInPicture(vjsPlayer);
          if (!ok) {
            isDev && logger.info('\n' + 'pip: PiP unavailable, playback may pause in background');
          }
        }
      } else if (document.visibilityState === 'visible') {
        if (pipWindow && !pipWindow.closed) {
          isDev && logger.info('\n' + 'pip: tab visible again, closing PiP window');
          await _exitPictureInPicture(vjsPlayer);
        }
      }
    });

    isDev && logger.info('\n' + 'pip: auto-PiP visibility handler installed');
  }

  function _playWhenVisible(vjsPlayer) {
    if (!vjsPlayer) return;

    if (document.visibilityState === 'visible') {
      const p = vjsPlayer.play();
      if (p && typeof p.catch === 'function') {
        p.catch(err => {
          isDev && logger.warn('\n' + `play() rejected: ${err}`);
        });
      }
    } else {
      isDev && logger.info('\n' + 'play deferred: page is hidden, attempting PiP before fallback');

      (async () => {
        const pipOk = pipConfigEnabled ? await _requestPictureInPicture(vjsPlayer) : false;
        if (pipOk) {
          const p = vjsPlayer.play();
          if (p && typeof p.catch === 'function') {
            p.catch(err => {
              isDev && logger.warn('\n' + `play() inside PiP rejected: ${err}`);
            });
          }
        } else {
          isDev && logger.debug('\n' + 'pip: falling back to visibility-deferred play()');
          const onVisible = () => {
            if (document.visibilityState === 'visible') {
              document.removeEventListener('visibilitychange', onVisible);
              isDev && logger.debug('\n' + 'page became visible, starting deferred play()');
              const p = vjsPlayer.play();
              if (p && typeof p.catch === 'function') {
                p.catch(err => {
                  isDev && logger.warn('\n' + `deferred play() rejected: ${err}`);
                });
              }
            }
          };
          document.addEventListener('visibilitychange', onVisible);
        }
      })();
    }
  }

  // ---------------------------------------------------------------------------
  // embedRunVideo
  // Extended to support both YouTube video IDs and native file URLs.
  // When the input matches YOUTUBE_PATTERNS the player is created with
  // YouTube tech (techOrder: ['youtube', 'html5'], type: 'video/youtube').
  // For native video files the original HTML5 tech path is unchanged.
  //
  // Renamed parameter: videoId → videoSrc.  The function now accepts a full
  // local or remote video file URL (e.g. /assets/video/my.mp4 or
  // https://cdn.example.com/video.mp4) instead of a YouTube video ID.
  //
  // The videoId for playlist keying is derived from the filename without
  // its extension so existing playlist-management logic is unaffected.
  //
  // Permanently disable YouTube closed captions / subtitles via the IFrame API.
  //
  // Why the player var alone is not enough:
  //   cc_load_policy=0 only sets the *initial* load policy ("do not show CC by
  //   default"). It does NOT prevent captions from appearing when the viewer's
  //   YouTube account / browser preference has captions switched on, and there
  //   is no player var that hard-disables them.
  //
  // The reliable mechanism (per the IFrame API) is to unload the caption module
  // once it becomes available. The module only loads AFTER playback starts and
  // signals availability through the `onApiChange` event. Because YouTube
  // (re)loads the module on every new video, we must re-apply on each fire —
  // hence a persistent `onApiChange` listener rather than a one-shot call.
  // This keeps captions off across in-player playlist navigation too.
  //
  // Two module names exist: 'captions' (HTML5 player) and 'cc' (legacy AS3).
  // We only act on whichever is currently present (via getOptions) so we never
  // throw on an unloaded module and never loop on the unload-triggered event.
  //
  // @param {object} ytPlayer - underlying YT.Player from the videojs-youtube
  //                            tech (player.tech().ytPlayer)
  // ---------------------------------------------------------------------------
  const _disableYouTubeCaptions = (ytPlayer) => {                           
    if (!ytPlayer) return;                                                  

    const CC_MODULES = ['captions', 'cc'];                                  

    const unloadCaptionModules = () => {                                    
      let loaded = [];                                                      
      try {                                                                 
        loaded = (typeof ytPlayer.getOptions === 'function')                
          ? (ytPlayer.getOptions() || [])                                   
          : [];                                                             
      } catch (e) {                                                         
        loaded = [];                                                        
      }                                                                     

      CC_MODULES.forEach((mod) => {                                         
        if (loaded.indexOf(mod) === -1) return;                             
        try {                                                               
          // Belt: clear the active track first (empty track = captions off)
          if (typeof ytPlayer.setOption === 'function') {
            ytPlayer.setOption(mod, 'track', {});
          }
          // Suspenders: unload the module entirely so the CC button/track go
          if (typeof ytPlayer.unloadModule === 'function') {                
            ytPlayer.unloadModule(mod);
          }                                                                 
          isDev && logger && logger.info('\n' + `YouTube captions disabled (module: ${mod})`);
        } catch (e) {                                                       
          isDev && logger && logger.debug('\n' + `unload of caption module '${mod}' skipped: ${e}`);
        }                                                                   
      });                                                                   
    };                                                                      

    // Best-effort immediate pass (no-op if the module has not loaded yet)
    //
    unloadCaptionModules();

    // Persistent hook: onApiChange fires whenever a module (incl. captions) is
    // loaded/unloaded. Re-apply on every fire so captions never re-appear, even
    // across new videos loaded into the same player by the playlist plugin
    //
    if (typeof ytPlayer.addEventListener === 'function' && !ytPlayer._j1CcDisableBound) {
      ytPlayer._j1CcDisableBound = true;
      try {                                                                 
        ytPlayer.addEventListener('onApiChange', unloadCaptionModules);
      } catch (e) {
        isDev && logger && logger.debug('\n' + `onApiChange bind for captions skipped: ${e}`);
      }
    }
  };                                                                        

  // sanitizeVideoId - normalize a derived videoId so it is safe for playlist
  // keying, localStorage keys and [data-video-id] selectors. Native filenames
  // can carry characters outside the id space - most commonly an embedded dot
  // in quality/version markers, e.g. after stripping the final extension from
  // ".../TV-20251021-0955-0000.1080.mp4" the id is still
  // "TV-20251021-0955-0000.1080" (the ".1080" survives). Every character that
  // is not part of the codebase's canonical id charset [A-Za-z0-9_-] (the same
  // set used in YOUTUBE_ID_RE and the 11-char YouTube check) is replaced by a
  // single hyphen. The transform is deterministic and idempotent - sanitizing
  // an already-clean id (e.g. an 11-char YouTube id) is a no-op - so the same
  // source URL always yields the same key on every derivation site.
  //
  // DESIGN NOTE (for review): the invalid set is the complement of
  // [A-Za-z0-9_-], not "dots only". Narrow the regex to /\./g to strip dots
  // exclusively. Consecutive invalid chars map 1:1 to hyphens (no collapsing);
  // append .replace(/-+/g, '-').replace(/^-+|-+$/g, '') if collapsing/trimming
  // is wanted. This one helper is deliberately shared by both derivation sites
  // (embedRunVideo and inputWrapperHandler.processUrl) so the duplicate-check
  // id can never drift from the persisted key.
  //
  function sanitizeVideoId(rawId) {
    if (!rawId) return rawId;
    return String(rawId).replace(/[^A-Za-z0-9_-]/g, '-');
  }

  /**
   * embedRunVideo - embed and play a video via videoJS.
   * Accepts either a YouTube video ID / URL or a native file URL/path.
   * @param {string} videoSrc  - YouTube video ID or local/remote video URL
   * @param {string} [mode]    - optional player mode ('pause' to start paused)
   */
  const embedRunVideo = (videoSrc, mode) => {
    logger = log4javascript.getLogger(MODULE_NAME);

    isDev && logger.debug('\n' + `embedding video from src: ${videoSrc}`);

    // reset lastState so state change events fire correctly for the new player
    //
    lastState = null;

    // A new player is being built. Forget the playlist-plugin active id from any
    // prior embed so doPostOnPlaying() cannot fall back onto a stale value
    // before the fresh player's 'playlistitem'/videoData resolution repopulates
    // it. (For empty/disabled playlists no 'playlistitem' fires, so leaving a
    // stale id here would otherwise mis-mark the first 'playing' event.)
    //
    _playlistActiveVideoId = null;

    // target mode for the vjs player
    //
    playerMode = (mode === undefined) ? null : mode;

    // Detect whether the input is a YouTube video ID / URL so the right
    // tech and playlist-key derivation are used below.
    //
    const youtubeMatch = (() => {
      for (const pattern of YOUTUBE_PATTERNS) {
        const m = (videoSrc || '').match(pattern);
        if (m) return m[1];
      }
      return null;
    })();

    const isYouTube = !!youtubeMatch;

    // const -> let so the derived id can be repaired in place by the sanitize
    // step below. All downstream references - including the pass into
    // createVideoJsPlayer(videoId, ...) further down, from which previousPlayerId
    // is later set - then observe the cleaned id.
    //
    let videoId = isYouTube
      ? youtubeMatch
      : (videoSrc
          ? videoSrc.split('?')[0].split('/').pop().replace(/\.[^.]+$/, '') || videoSrc
          : '');

    // Repair (not reject) ids carrying characters invalid for keying. The prior
    // reject guard (kept as a deprecated comment below) rejected any dotted id
    // via `return`, so a native file such as
    // ".../TV-20251021-0955-0000.1080.mp4" -> "TV-20251021-0955-0000.1080"
    // never played. sanitizeVideoId() maps every out-of-charset character to a
    // hyphen -> "TV-20251021-0955-0000-1080". YouTube ids are already clean and
    // pass through untouched. Reassign/log only when something actually changed,
    // to keep the id stable and the logs quiet.
    //
    if (videoId) {
      const sanitizedVideoId = sanitizeVideoId(videoId);
      if (sanitizedVideoId !== videoId) {
        isDev && logger.debug('\n' + `videoId sanitized for keying: "${videoId}" -> "${sanitizedVideoId}"`);
        videoId = sanitizedVideoId;
      }

      // Expiry gate (last line of defence). The PlaylistManager wrappers above
      // already refuse expired entries, but embedRunVideo() is also reached
      // directly from the URL input wrapper, the "play next" chain and any
      // external/adapter caller. The check therefore repeats here, at the point
      // where the persisted key is final, so no path can build a player for a
      // source whose access period has ended. Guarded defensively: an unknown
      // videoId (nothing persisted yet) is NOT expired and passes through.
      //
      const expiryEntry     = playlistManager.getEntry(videoId);
      const isEntryExpired  = _isEntryExpired(expiryEntry);

      if (isEntryExpired) {
        logger.warn('\n' + `embedRunVideo: playback DISABLED for videoId: ${videoId} - ` +
                           `access period expired on ${expiryEntry.expiryDate} (${_expiryHintText(expiryEntry.expiryDate)})`);
      
        // Last line of defence: reached by the URL input wrapper, the
        // "play next" chain and any external/adapter caller - paths that never
        // pass through the PlaylistManager wrappers and would otherwise fail
        // silently. `mode` (the second parameter of this function) is handed
        // through for the same preload suppression as gate 2. The repeat
        // window in _showExpiryNotice() keeps a cascade of two gates for one
        // user action down to a single dialog.
        //
        _showExpiryNotice(expiryEntry, videoId, { source: 'embedRunVideo', mode: playerMode });

        return;
      }
    }

    // EARLY, isolated playlist creation.
    //
    // Historically the playlist record was created "late", inside
    // doPostOnPlaying() -> playlistManager.addEntry(), which only runs once the
    // player reaches the 'playing' state - tying record creation to playback.
    // Here we create the record the moment the video is *created* (its source
    // is known), independent of whether or when it actually starts playing.
    //
    // Only the fields known now are written. Title/author/duration are resolved
    // asynchronously by the tech and back-filled later via enrichEntry() /
    // updateEntry*() (see onReady and doPostOnPlaying). createEntry() is
    // idempotent: an existing entry for this videoId is left untouched, so
    // re-embedding the same video never duplicates or resets it.
    //
    // Doing it here also means the videojs-playlist plugin, built in onReady
    // from playlistManager.load(), already sees this entry on first setup
    // instead of only after the first 'playing' event.
    //
    if (videoId) {
      if (isYouTube) {

        // For YouTube the poster and canonical links are derivable immediately
        // from the id. `type` is intentionally left to the createEntry default
        // ('video/mp4'), matching the shape addEntry() previously stored - the
        // playable source type is derived independently in
        // _buildPlaylistItemSources() from videoLink, so this has no effect on
        // playback.
        //
        playlistManager.createEntry({
          videoId:   videoId,
          poster:    `//i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
          infoLink:  `https://youtu.be/${videoId}`,
          videoLink: `https://youtu.be/${videoId}`
        });
      } else {
        playlistManager.createEntry({
          videoId:   videoId,
          src:       videoSrc,
          videoLink: videoSrc,
          type:      'video/mp4'
        });

        // The source is already known, so a poster can be captured off-screen
        // right away instead of waiting for the 'playing' event. Fire-and-
        // forget: generatePosterForEntry() is config-gated, only writes when
        // the entry still lacks a real poster, and never rejects.
        //
        playlistManager.generatePosterForEntry(videoId)
          .catch((e) => { isDev && logger.warn('\n' + `early native poster generation failed for videoId: ${videoId} - ${e}`); });
      }
    }

    const vjsPlayer = createVideoJsPlayer(videoId, videoSrc, isYouTube, {
      title: '',

      onStateChange: (() => {
        let errorNumber = null;
        return (event) => {
          const state = event.data;

          if (state === lastState || errorNumber) {
            return;
          }

          const stateName = vjsStateEventNameMap[state] || (state < 0 ? 'loadstart' : String(state));
          isDev && logger.debug('\n' + `changed player to state: ${stateName}`);

          if (vjsStateEventNameMap[state] === 'loadstart') {

            // `activePlugins_` is created by Video.js only when the FIRST
            // plugin is activated on a player. A player configured without
            // any plugin at all — plugins.enabled false, or a per-player
            // control entry carrying no plugin subtree — never gets the
            // member, and reading `.nextPrevButtons` from it threw on every
            // loadstart, i.e. on every source change of that player.
            //
            var piNextPrevButtons = (vjsPlayer.activePlugins_ && vjsPlayer.activePlugins_.nextPrevButtons) ? true : false;

            // Per-instance options (factory) take precedence over the
            // page-global adapter options, so a per-player
            // plugins.nextPrevButtons.autoplay override governs THIS player.
            //
            var piPlaylistOptions = _resolveVideoPlayerEffectiveOptions();

            // Skip the loadstart autoplay while the playlist plugin is still
            // swapping sources during its initial setup. Calling play() here
            // would be aborted by the immediately-following currentItem()
            // src() ("The play() request was interrupted by a new load
            // request"). Genuine prev/next navigation does NOT rebuild the
            // player (so this flag is false then) and still autoplays as
            // before; the deferred autoplay branch in onReady() starts the
            // first playback once the selected source has settled.
            //
            // Fix multiPlayer plugin option guards #1
            // The option walk below descended three levels without a check.
            // The short-circuit of `piNextPrevButtons` did NOT protect it:
            // that flag reports whether the plugin is ACTIVE on the player,
            // while the walk reads the CONFIGURATION — and the plugin can be
            // active on a player whose per-player control entry replaced the
            // videoJS subtree with one that spells out no nextPrevButtons
            // block. `_resolveVideoPlayerEffectiveOptions()` may also hand
            // back an object without a videoJS subtree if the resolver finds
            // nothing usable.
            //
            const npbOptions = (piPlaylistOptions && piPlaylistOptions.videoJS && piPlaylistOptions.videoJS.plugins)
              ? (piPlaylistOptions.videoJS.plugins.nextPrevButtons || {})
              : {};

            if (piNextPrevButtons && npbOptions.autoplay && !_playlistSetupInProgress) {

              // Always attach a .catch(): even outside the setup window a
              // benign interruption (e.g. rapid user navigation, a pause()
              // racing the play()) must never surface as an unhandled promise
              // rejection or a red console error.
              //
              const pAutoLoadstart = vjsPlayer.play();
              if (pAutoLoadstart && typeof pAutoLoadstart.catch === 'function') {
                pAutoLoadstart.catch(err => {
                  isDev && logger.warn('\n' + `loadstart autoplay play() rejected: ${err}`);
                });
              }
            }
          }

          if (vjsStateEventNameMap[state] === 'playing') {
            doPostOnPlaying(state);
          }

          // persist the current playback position when the video is
          // paused or has ended so the user can resume later.
          //
          if (vjsStateEventNameMap[state] === 'paused' || vjsStateEventNameMap[state] === 'ended') {

            // The video is no longer playing, so clear the active marker on
            // the playlist card/row. In loop mode the next video's 'playing'
            // event re-marks the following entry via setActiveItem().
            //
            // jadams, 2026-06-18: disabled
            // playlistManager.clearActiveItem();

            try {
              const currentPos    = player.currentTime();
              const totalDuration = player.duration();

              // For YouTube videos use player.ytVideoData.video_id;
              // for native videos use player.videoData.videoId (unchanged from #2).
              //
              const currentVideoId = isYouTube
                ? ((player.ytVideoData && player.ytVideoData.video_id) ? player.ytVideoData.video_id : videoId)
                : ((player.videoData   && player.videoData.videoId)    ? player.videoData.videoId    : videoId);

              if (currentVideoId && currentPos > 0) {
                const positionToSave = (vjsStateEventNameMap[state] === 'ended') ? 0 : currentPos;
                playlistManager.updateEntryPosition(currentVideoId, positionToSave);
              }

              // loop mode
              //
              if (vjsStateEventNameMap[state] === 'ended' && loopConfigEnabled && playlistManager._loopEnabled) {

                // The double reaction the #3/#4 notes flagged as a #5
                // candidate: with loop mode ON *and* the plugin's autoadvance
                // armed, ONE 'ended' (natural or synthetic from
                // _stopAtEndAt) used to advance TWICE - the plugin swapped
                // the source IN-PLAYER (core.js: one('ended') -> timeout ->
                // playlist.next()), while this branch scheduled
                // embedRunVideo() on the next item, a FULL PLAYER REBUILD,
                // VIDEO_START_DELAY later. Two racing advances on one end:
                // the rebuild tears down the player the plugin just loaded
                // (or, depending on timing, the plugin swap lands inside the
                // rebuild), and the #4 mid-swap guard only kept the playback
                // window intact - the redundant rebuild race itself remained.
                //
                // Single-owner rule: when the plugin autoadvance is armed AND
                // actionable (_pluginWillAutoadvance: delay set, 'ended'
                // one-shot listening, a next item exists), the plugin owns
                // this 'ended' and the module rebuild is skipped. The
                // in-player swap is also the cheaper advance - no player
                // teardown, and the #3/#4 playbackWindow machinery
                // ('playlistitem' re-arm, expected-id tracking) is built for
                // exactly that path.
                //
                // The module path below remains the owner in every other
                // case, byte-identically to before: plugin autoadvance not
                // configured, cancelled, or on the LAST item - where
                // playlist.next() would be a no-op and only embedRunVideo()
                // / the end-of-playlist log below can answer.
                //
                if (_pluginWillAutoadvance(player)) {
                  isDev && logger.debug('\n' + `loop mode: plugin autoadvance owns this 'ended' - in-player advance, module rebuild skipped`);
                } else {
                  const nextId = playlistManager.getNextVideoId(currentVideoId);
                  if (nextId) {
                    isDev && logger.debug('\n' + `loop mode: advancing from videoId ${currentVideoId} to next videoId ${nextId}`);

                    // For native entries, resolve src from the playlist entry;
                    // for YouTube entries, the nextId itself is the video ID.
                    //
                    const playlist  = playlistManager.load() || [];
                    const nextEntry = playlist.find(item => item.videoId === nextId);
                    const nextSrc   = (nextEntry && nextEntry.src) ? nextEntry.src : nextId;

                    setTimeout(() => {
                      embedRunVideo(nextSrc);
                    }, VIDEO_START_DELAY);
                  } else {
                    isDev && logger.debug('\n' + `loop mode: reached last playlist item, stopping loop`);
                  }
                }
              }

            } catch (e) {
              isDev && logger.warn('\n' + `failed to save playback position: ${e}`);
            }
          }

          lastState = state;
        };
      })(),

      // videoJS event: onReady
      onReady: (player) => {
        isDev && logger.info('\n' + 'vjs player initialized and ready');

        if (isYouTube) {
          // -------------------------------------------------------------------
          // Metadata is read from the YouTube tech's videoData() / ytPlayer
          // -------------------------------------------------------------------
          const applyVideoData = (videoData) => {
            if (!videoData) return;
            const title  = videoData.title  || '';
            const author = videoData.author || '';

            isDev && logger.debug('\n' + `YT video data resolved - title: ${title}`);

            player.ytVideoData  = videoData;
            player.ytVideoTitle = title;

            const playerEl = player.el();
            if (playerEl) {
              playerEl.setAttribute('aria-label', title);
            }

            document.dispatchEvent(new CustomEvent('ytVideoTitleResolved', {
              detail: { title: title, playerId: player.id_ },
              bubbles: true
            }));
          };

          // immediate read: the tech may already have the data cached
          try {
            const tech = player.tech({ IWillNotUseThisInPlugins: true });
            if (tech && typeof tech.videoData === 'function') {
              const cachedData = tech.videoData();
              if (cachedData && Object.keys(cachedData).length) {
                applyVideoData(cachedData);
              }
            }
          } catch (e) {
            isDev && logger.debug('\n' + `immediate YT video data read skipped: ${e}`);
          }

          // Permanently suppress YouTube CC/subtitles for this player. The
          // underlying YT.Player is exposed by the videojs-youtube tech as
          // tech.ytPlayer; _disableYouTubeCaptions() attaches a persistent
          // onApiChange listener so captions stay off across every video the
          // playlist plugin loads into this same player instance.
          //
          try {
            const ccTech     = player.tech({ IWillNotUseThisInPlugins: true });
            const ccYtPlayer = ccTech && ccTech.ytPlayer;
            if (ccYtPlayer) {
              _disableYouTubeCaptions(ccYtPlayer);
            } else {
              // tech.ytPlayer is created asynchronously; retry once it exists
              //
              const ccWait = setInterval(() => {
                const t  = player.tech({ IWillNotUseThisInPlugins: true });
                const yt = t && t.ytPlayer;
                if (yt) {
                  clearInterval(ccWait);
                  _disableYouTubeCaptions(yt);
                }
              }, 150);
        
              // stop polling after ~3s so we never leak the interval
              //
              setTimeout(() => clearInterval(ccWait), 3000);
            }
          } catch (e) {
            isDev && logger.debug('\n' + `YouTube caption disable skipped: ${e}`);
          }

          // playlistManager, fixed video duration (YouTube)
          //
          player.on('durationchange', () => {
            const durationDisplay = player.controlBar && player.controlBar.durationDisplay;
            if (!durationDisplay) return;

            const durationEl   = durationDisplay.contentEl();
            const durationText = durationEl ? durationEl.textContent : '';

            // Self-reference through the module global (videoPlayer.playlistManager)
            // would resolve to the DEFAULT instance's manager under the multi-instance
            // architecture — i.e. the WRONG player on a multi-player page. Use this
            // instance's closure-local playlistManager instead.
            //
            const seconds      = playlistManager._parseDuration(durationText);

            if (seconds > 0) {

              // Same stale-metadata class as in doPostOnPlaying(): this
              // one-shot usually fires for the FIRST loaded video (fresh
              // metadata), but when the first parsable duration only arrives
              // AFTER a plugin-driven in-player swap, the duration measured
              // here belongs to the swapped-in video while ytVideoData still
              // names the previous one (#23). Prefer the live raw player's
              // own id - the same authoritative source the #6 refresh in
              // doPostOnPlaying() uses - and keep the previous resolution as
              // the fallback chain.
              //
              let _dcLiveYtId = '';

              try {
                const _dcTech = player.tech({ IWillNotUseThisInPlugins: true });
                const _dcYt   = (_dcTech && _dcTech.ytPlayer) ? _dcTech.ytPlayer : null;
                const _dcData = (_dcYt && typeof _dcYt.getVideoData === 'function')
                  ? (_dcYt.getVideoData() || null)
                  : null;
                if (_dcData && _dcData.video_id) {
                  _dcLiveYtId = _dcData.video_id;
                }
              } catch (_e) {
                isDev && logger.debug('\n' + `playbackWindow: live YT id read skipped (durationchange): ${_e}`);
              }
              const currentVideoId = _dcLiveYtId
                || (player.ytVideoData && player.ytVideoData.video_id
                  ? player.ytVideoData.video_id
                  : videoId);

              // Self-reference through the module global (videoPlayer.playlistManager)
              // would resolve to the DEFAULT instance's manager under the multi-instance
              // architecture — i.e. the WRONG player on a multi-player page. Use this
              // instance's closure-local playlistManager instead.
              //
              playlistManager.updateEntryDuration(currentVideoId, seconds);

              player.off('durationchange');
            }
          });

          // resume from saved position if available (YouTube)
          // Self-reference through the module global (videoPlayer.playlistManager)
          // would resolve to the DEFAULT instance's manager under the multi-instance
          // architecture — i.e. the WRONG player on a multi-player page. Use this
          // instance's closure-local playlistManager instead.
          //
          const savedPositionYT = playlistManager.getEntryPosition(videoId);
          if (savedPositionYT > 0) {
            const onFirstPlayingYT = () => {
        
              player.off('playing', onFirstPlayingYT);

              setTimeout(() => {
                player.currentTime(savedPositionYT);
                isDev && logger.info('\n' + `resumed YouTube video id: ${videoId} at last position ${savedPositionYT}s`);
              }, 250);
            };
            player.on('playing', onFirstPlayingYT);
          }

        } else {

          // Native video path
          // -------------------------------------------------------------------
          const applyVideoData = (videoData) => {
            if (!videoData) return;
            const title  = videoData.title  || '';
            const author = videoData.author || '';

            isDev && logger.debug('\n' + `video data resolved - title: ${title}`);

            // ROOT CAUSE OF THE DOUBLE-ADD (native videos only):
            // The #1 fix sanitized the derived videoId ONLY at the two INPUT-side
            // derivation sites - embedRunVideo() and inputWrapperHandler
            // .processUrl(). embedRunVideo() therefore PERSISTS the early playlist
            // record (createEntry(), #34) under the SANITIZED key, e.g.
            // "TV-20251021-0955-0000-1080". The native plugin, however, resolves
            // its OWN id straight from the file name and delivers it to us here via
            // the 'videoDataResolved' event with the invalid char still intact,
            // e.g. "TV-20251021-0955-0000.1080" (the dot survives). That raw id is
            // stored on player.videoData.videoId and later read verbatim by
            // doPostOnPlaying() as the key for its defensive createEntry(#34).
            // Because createEntry()'s idempotency test is a strict
            // `item.videoId === entry.videoId`, the dotted key never matches the
            // already-stored hyphenated key, so a SECOND record is unshift()ed ->
            // the video appears twice in localStorage. (YouTube is unaffected: its
            // 11-char id is already clean, so this is a no-op there.)
            //
            // FIX: route this plugin-fed id through the SAME sanitizeVideoId()
            // helper #1 shares across the input-side sites, at the single point it
            // enters this module. This is the DRY, source-level repair: because it
            // runs before `player.videoData = videoData` below, EVERY native
            // consumer of player.videoData.videoId now observes the same key
            // embedRunVideo() persisted - not just doPostOnPlaying()'s createEntry/
            // enrichEntry/setActiveItem, but also updateEntryDuration (on
            // 'durationchange'), updateEntryPosition (on state change) and the
            // activeVideoId resolution used to rebuild the plugin playlist. This
            // closes the last id-derivation site the #1 design note called out,
            // "so the duplicate-check id can never drift from the persisted key".
            //
            // Repair in place and reassign/log only when it actually changed -
            // identical to the #1 pattern; sanitizeVideoId() is deterministic and
            // idempotent, so re-resolving the same source always yields this key.
            //
            // DESIGN NOTE (for review): videoData is the plugin's own object,
            // passed by reference through the event detail. We mutate its .videoId
            // in place (matching #1's "repair, don't reject" approach) because
            // player.videoData is assigned this same reference immediately below
            // and every read goes through it. onVideoDataResolved() removes itself
            // and is the sole consumer, so no other 'videoDataResolved' listener
            // observes the mutation. If a non-mutating copy is preferred, clone
            // videoData first and sanitize the clone.
            //
            if (videoData.videoId) {
              const _sanitizedNativeId = sanitizeVideoId(videoData.videoId);
              if (_sanitizedNativeId !== videoData.videoId) {
                isDev && logger.debug('\n' + `native videoData.videoId sanitized for keying: "${videoData.videoId}" -> "${_sanitizedNativeId}"`);
                videoData.videoId = _sanitizedNativeId;
              }
            }

            player.videoData  = videoData;
            player.videoTitle = title;

            const playerEl = player.el();
            if (playerEl) {
              playerEl.setAttribute('aria-label', title);
            }

            document.dispatchEvent(new CustomEvent('videoTitleResolved', {
              detail: { title: title, playerId: player.id_ },
              bubbles: true
            }));
          };

          const onVideoDataResolved = (e) => {
            document.removeEventListener('videoDataResolved', onVideoDataResolved);
            if (e && e.detail && e.detail.videoData) {
              applyVideoData(e.detail.videoData);
            }
          };

          document.addEventListener('videoDataResolved', onVideoDataResolved);

          // playlistManager, fixed video duration (native)
          //
          player.on('durationchange', () => {
            const durationDisplay = player.controlBar && player.controlBar.durationDisplay;
            if (!durationDisplay) return;

            const durationEl   = durationDisplay.contentEl();
            const durationText = durationEl ? durationEl.textContent : '';

            // Self-reference through the module global (videoPlayer.playlistManager)
            // would resolve to the DEFAULT instance's manager under the multi-instance
            // architecture — i.e. the WRONG player on a multi-player page. Use this
            // instance's closure-local playlistManager instead.
            //
            const seconds      = playlistManager._parseDuration(durationText);

            if (seconds > 0) {
              const currentVideoId = player.videoData && player.videoData.videoId
                ? player.videoData.videoId
                : videoId;

              // Self-reference through the module global (videoPlayer.playlistManager)
              // would resolve to the DEFAULT instance's manager under the multi-instance
              // architecture — i.e. the WRONG player on a multi-player page. Use this
              // instance's closure-local playlistManager instead.
              //
              playlistManager.updateEntryDuration(currentVideoId, seconds);

              player.off('durationchange');
            }
          });

          // resume from saved position if available (native)
          // Self-reference through the module global (videoPlayer.playlistManager)
          // would resolve to the DEFAULT instance's manager under the multi-instance
          // architecture — i.e. the WRONG player on a multi-player page. Use this
          // instance's closure-local playlistManager instead.
          //
          const savedPosition = playlistManager.getEntryPosition(videoId);

          if (savedPosition > 0) {
            const onFirstPlaying = () => {             
              player.off('playing', onFirstPlaying);

              setTimeout(() => {
                player.currentTime(savedPosition);
                isDev && logger.info('\n' + `resumed video with id: ${videoId} at last position ${savedPosition}s`);
              }, 250);
            };

            player.on('playing', onFirstPlaying);
          }
        } // END if isYouTube / else

        // Install the playback-window enforcement for BOTH techs (YouTube and
        // native) in one place, AFTER the tech-specific resume handlers above:
        // the startAt one-shot defers past their 250ms resume seek, and the
        // endAt watchdog routes into the standard 'ended' path. Uses THIS
        // instance's closure-local playlistManager (MultiInstance #1 rule).
        //
        _applyStartEndAtPlayback(player, videoId, playlistManager);

        // Install the audio fade-in for BOTH techs (YouTube and native), in
        // the same place and for the same reasons as the playback window
        // above: one installation per created player, driven by player events,
        // using THIS instance's closure-local playlistManager (MultiInstance
        // #1 rule). A no-op for every media whose resolved audioFadeIn is
        // empty, i.e. byte-identical behaviour for existing configurations.
        //
        _applyAudioFadeIn(player, videoId, playlistManager);

        // ROOT CAUSE of "per-player videoJS settings never applied": this
        // assignment unconditionally overwrote the instance-level
        // videoPlayerOptions with the PAGE-GLOBAL adapter options, immediately
        // before every videoJS.* evaluation below (autoStart,
        // playbackRates.enabled/values, plugins.playlist/hotKeys/skipButtons/
        // nextPrevButtons/zoomButtons, players.youtube/native, playlist.loop,
        // close_on_play, ...). Per-player overrides handed to the factory
        // (videoPlayer(id, options) -> setAdapterOptions -> adapterOptions)
        // were therefore ignored for EVERY configured player instance — e.g.
        // player_tiny_desk_concerts' videoJS.playbackRates.enabled=false and
        // videoJS.plugins.playlist.enabled=false had no effect. The resolver
        // prefers this instance's adapterOptions and falls back to the global
        // object, so single-player pages behave byte-identically.
        //
        videoPlayerOptions = _resolveVideoPlayerEffectiveOptions();
        loopConfigEnabled  = !!(videoPlayerOptions.playlist && videoPlayerOptions.playlist.loop && videoPlayerOptions.playlist.loop.enabled);
        pipConfigEnabled   = !!(videoPlayerOptions.playlist && videoPlayerOptions.playlist.loop && videoPlayerOptions.playlist.loop.pip);

        if (videoPlayerOptions.videoJS.autoStart) {

          isDev && logger.info('\n' + 'vjs player started');

          // SAME DEFECT CLASS as the piZoomButtons guard added in the third
          // fix of the "arrange piZoomButtons" series, found while auditing
          // that fix: every option block below was dereferenced without ever
          // asking whether it exists.
          //
          // The subtrees are OPTIONAL. They arrive through the usual chain
          // (defaults <- user settings <- per-player entries in
          // multiPlayer_control.yml), and a per-player entry REPLACES the
          // videoJS subtree it carries rather than adding to it. A control
          // file that spells out, say, only `plugins: { playlist: ... }` for
          // one player therefore leaves skipButtons, nextPrevButtons and the
          // rest undefined — and the very next line threw
          //
          //     TypeError: Cannot read properties of undefined (reading 'enabled')
          //
          // inside the player setup, i.e. that player stayed dead over a
          // merely absent option block, exactly as observed for zoomButtons.
          // `playbackRates` has the same exposure two places further down.
          //
          // The blocks are resolved ONCE here and default to an empty object,
          // so every `.enabled` read further down is safe without touching
          // the individual call sites. An absent block now means "plugin off",
          // which is what a missing configuration has always meant.
          //
          const piPlugins         = (videoPlayerOptions.videoJS && videoPlayerOptions.videoJS.plugins) ? videoPlayerOptions.videoJS.plugins : {};
          const piPlaybackRates   = (videoPlayerOptions.videoJS && videoPlayerOptions.videoJS.playbackRates) ? videoPlayerOptions.videoJS.playbackRates : {};
          const vjsPlaybackRates  = piPlaybackRates.values;

          const piAutoCaption     = piPlugins.autoCaption     || {};
          const piPlaylist        = piPlugins.playlist        || {};
          const piHotKeys         = piPlugins.hotKeys         || {};
          const piSkipButtons     = piPlugins.skipButtons     || {};
          const piNextPrevButtons = piPlugins.nextPrevButtons || {};
          const piZoomButtons     = piPlugins.zoomButtons     || {};

          isDev && logger.debug('\n' + 'customize vjs player (controls)');

          const vjsPlayer   = player;
          const vjsVideoId  = videoId;

          // manage playlists (piPlaylist) plugin (first)
          if (piPlaylist.enabled) {

            // Convert the raw playlistManager record set (localStorage shape)
            // into the item shape required by the videojs-playlist plugin
            // (core.js). The raw load() entries have no `sources` array, so
            // passing them straight to vjsPlayer.playlist() would make
            // player.src() fail. The mapping/derivation is centralised in
            // mapVideoPlayerPlaylist + convertVideoPlayerPlaylist().
            //
            // Feed the videojs-playlist plugin a playlist whose order matches
            // exactly what the user sees in the playlist panel.
            //
            // Problem: the panel (renderPlaylist()/renderCards()) renders
            // `this._searchResults || this.load()` AFTER running it through
            // _applySortOrder() (the active sort/"search criterion",
            // _currentSort). The plugin, however, was previously fed the
            // *unsorted* load() order. When a video is selected from the
            // playlist screen, embedRunVideo() rebuilds the player and re-feeds
            // the plugin here, so the prev/next control-bar buttons
            // (nextPrevButtons -> playlist.previous()/.next()) and autoadvance
            // navigated in load() order while the visible list was sorted — the
            // two were out of sync.
            //
            // Fix: build the plugin source from the SAME display source the
            // panel uses (_searchResults || load()) and sort it with the SAME
            // _applySortOrder() before conversion, so the plugin's item order ==
            // the displayed order. _applySortOrder() sorts in place and returns
            // the array, so a defensive .slice() copy is sorted instead of the
            // live _searchResults / stored playlist to avoid mutating them here.
            //
            // Safe with the existing #20 currentItem() sync: that logic resolves
            // the active item by videoId (syncedIndex) against the converted
            // array, so reordering the source before conversion does not affect
            // which item is loaded — only the navigation sequence around it.
            //
            const displaySource = playlistManager._searchResults || playlistManager.load() || [];
            const rawPlaylist   = playlistManager._applySortOrder(displaySource.slice());
            const playlist      = playlistManager.convertVideoPlayerPlaylist(rawPlaylist, piPlaylist.poster);

            // Enter the playlist-setup window. The next source swaps —
            // playlist(playlist) auto-loading item 0 and the currentItem()
            // jump below loading the selected item — are internal and must not
            // trigger the loadstart autoplay (guarded in the loadstart branch
            // of onStateChange via _playlistSetupInProgress).
            //
            _playlistSetupInProgress = true;

            // ROOT CAUSE of "with a stored playlist, selecting any item other
            // than the first plays the FIRST item (while the poster shows the
            // SELECTED one)".
            //
            // The two-step feed below — playlist(playlist) auto-loading item 0,
            // then currentItem(syncedIndex) re-loading the selected item — puts
            // TWO back-to-back player.src() swaps into the freshly created
            // player. On the YouTube tech every swap becomes a cueVideoById()
            // command against the SAME just-readied YT.Player (youtube.js:
            // setSrc -> cueVideoById_), so the IFrame receives a burst of cue
            // commands while it is still settling on its construction video.
            // The IFrame API processes these commands ASYNCHRONOUSLY and does
            // not guarantee last-command-wins under such a burst — the
            // intermediate item-0 cue can land LAST inside the iframe, which is
            // exactly the reported picture: every SYNCHRONOUS last-write-wins
            // surface is correct (player.poster(), the #23 active-item marker,
            // the #37 header title — all set by the final currentItem() call
            // and therefore showing the SELECTED entry), while the video that
            // actually plays is the FIRST playlist item.
            //
            // Why only with a localStorage entry: without stored entries the
            // converted `playlist` is EMPTY, so neither the item-0 auto-load
            // nor the currentItem() jump performs any source swap — the player
            // simply keeps its creation source (the selected video) and plays
            // correctly. The whole race exists ONLY when a stored playlist is
            // fed to the plugin.
            //
            // Fix: eliminate the intermediate item-0 load entirely. The
            // videojs-playlist plugin natively supports selecting the initial
            // item in the SAME call — playlist(list, index) (core.js:
            // `-1 !== r && o.currentItem(r)`), so the selected item is loaded
            // DIRECTLY and exactly ONE source selection happens, making the
            // outcome order-independent. For YouTube sources the tech then
            // issues ZERO redundant cue commands: the single setSrc() carries
            // the id the player was created with, youtube.js finds
            // activeVideoId === url.videoId and leaves the already-cued
            // construction video untouched. (This also retires, for the setup
            // path, the aborted-play() fallout the #32 guard documents.)
            //
            // The feed is therefore MOVED below: it now happens as ONE call —
            // vjsPlayer.playlist(playlist, currentIndex) — after the
            // 'playlistitem' listener (#23) is attached (the initial
            // 'playlistitem' of the selected item fires synchronously inside
            // the feed and must be captured) and after the synced index has
            // been resolved (#20). The plugin's autoadvance arming moves after
            // the feed as well, because vjsPlayer.playlist.autoadvance only
            // exists once the plugin has been initialised by its first call.
            //
            // Mirror plugin-driven item changes onto the active-item indicator.
            //
            // core.js (playItem) fires 'playlistitem' every time the plugin
            // loads a new item — including via the previous/next control-bar
            // buttons (skipButtons / nextPrevButtons -> playlist.previous()/
            // .next()), autoadvance and currentItem(). The event hash is the
            // item object, which carries the J1 `videoId` copied through by
            // mapVideoPlayerPlaylist. Recording it here keeps doPostOnPlaying()
            // from re-marking the previous entry (player.videoData /
            // player.ytVideoData are not refreshed on these in-player source
            // swaps) and the immediate setActiveItem() call makes the marker
            // jump as soon as the user presses prev/next, before 'playing'.
            //
            // Attached AFTER playlist() (so the function exists) and BEFORE the
            // synced currentItem() jump below, so the initial sync is captured
            // too. Video.js passes the trigger hash as the handler's 2nd arg.
            //
            vjsPlayer.on('playlistitem', (event, item) => {
              const switchedId = (item && item.videoId) ? item.videoId : '';
              _playlistActiveVideoId = switchedId || null;
              if (switchedId) {
                isDev && logger.debug('\n' + `playlistitem: active item follows plugin to videoId: ${switchedId}`);
                playlistManager.setActiveItem(switchedId);

                // Keep the centre header span (.video-player-header-title) in
                // sync the moment the videojs-playlist plugin switches item, so
                // a skip-backward / skip-forward / prev / next control-bar click
                // flips the header title to the newly loaded video immediately —
                // not only once (and only if) the 'playing' state is reached.
                //
                // Background: the header was set exclusively from
                // doPostOnPlaying() (#35), which reads the title from the
                // per-tech metadata (player.ytVideoData / player.videoData).
                // On an in-player source swap driven by the plugin that metadata
                // is NOT refreshed (see the #23 note above), so the header kept
                // showing the previously loaded video's title even though the
                // correct video had loaded.
                //
                // The canonical title is read back from the playlist record by
                // the switched videoId (the same source doPostOnPlaying() uses),
                // falling back to the converted item's name and then the videoId
                // so the header is never blank. The authoritative resync added to
                // doPostOnPlaying() (#37) later confirms the same value.
                //
                const _entrySwitched = playlistManager.getEntry(switchedId);

                _updateHeaderTitle(
                  (_entrySwitched && _entrySwitched.title) ||
                  (item && item.name) ||
                  switchedId
                );
              }
            });

            // Moved below the one-step feed: before the plugin's first
            // invocation, vjsPlayer.playlist is still the registered plugin
            // initializer and carries NO autoadvance member — arming here
            // would throw. The block is re-issued verbatim right after
            // vjsPlayer.playlist(playlist, currentIndex) below.
            // 
            // Sync the (converted) playlist index to the active vjsVideoId.
            //
            // vjsPlayer.playlist() is loaded with the *converted* `playlist`,
            // whose entry order can diverge from `rawPlaylist`:
            // convertVideoPlayerPlaylist() silently drops entries that have no
            // playable `sources` array. A rawPlaylist index can therefore NOT be
            // reused directly as the videojs-playlist currentItem() index.
            //
            // Strategy:
            //
            //   1. Locate the active vjsVideoId inside rawPlaylist (rawIndex) -
            //      the authoritative position in the J1 record set.
            //   2. Resolve the matching index inside the converted `playlist`
            //      (syncedIndex) by videoId - the index space the
            //      videojs-playlist plugin actually addresses.
            //   3. currentIndex := syncedIndex, then load it via
            //      currentItem(currentIndex) so the video identified by
            //      vjsVideoId becomes the current item.
            //
            const rawIndex = rawPlaylist.findIndex(
              (entry) => entry && entry.videoId === vjsVideoId
            );

            // Map the rawPlaylist hit onto its position in the converted
            // playlist (videoId match). Falls back to the existing
            // currentItem() (or 0) when the active video is absent from / was
            // dropped during conversion of the converted playlist.
            //
            let syncedIndex = playlist.findIndex(
              (item) => item && item.videoId === vjsVideoId
            );

            if (syncedIndex < 0) {
              isDev && logger.warn('\n' +
                `playlist sync: vjsVideoId '${vjsVideoId}' not found in converted playlist ` +
                `(rawIndex: ${rawIndex}); keeping current item`);

              // This fallback now runs BEFORE the plugin's first invocation
              // (the feed moved below), so vjsPlayer.playlist.currentItem does
              // not exist yet. The plugin has no current item at this point
              // anyway — a freshly fed plugin always answered 0 here — so the
              // fallback resolves to 0 directly, behaviour-identically.
              //
              syncedIndex = 0;
            }

            // currentIndex (for loading the video) is the synced index.
            //
            let currentIndex = syncedIndex;

            // Guard the currentItem() jump so a short or empty converted
            // playlist can never produce an out-of-range index.
            //
            // Load the video specified by vjsVideoId from the synced playlist.
            //
            // ONE-STEP feed+select (see the note at the disabled immediate
            // feed above). The list and the initial item are handed to the
            // plugin in a SINGLE call, so exactly one source selection is
            // performed and the intermediate item-0 load never happens:
            //
            //   - non-empty list: playlist(playlist, currentIndex) loads the
            //     selected item directly (core.js: `-1 !== r &&
            //     o.currentItem(r)`), inside the same #19 range guard as the
            //     original jump.
            //   - empty list: index -1 tells the plugin to load NOTHING
            //     (core.js skips the currentItem() call for -1) — matching the
            //     original behaviour where playlist([]) auto-loaded nothing
            //     and the guarded jump was skipped. The plugin function is
            //     still initialised, so all later vjsPlayer.playlist.* users
            //     (autoadvance, _pluginWillAutoadvance, _resyncPluginPlaylist)
            //
            const _initialFeedIndex = (playlist.length > 0 && currentIndex >= 0 && currentIndex < playlist.length)
              ? currentIndex
              : -1;

              vjsPlayer.playlist(playlist, _initialFeedIndex);

            // Autoadvance arming, moved here from above (the plugin function
            // now exists). Re-issued verbatim from the disabled original.
            //
            if (piPlaylist.autoadvance) {
              vjsPlayer.playlist.autoadvance(piPlaylist.autoadvance_delay);
            }

            // Leave the playlist-setup window once the SELECTED source has
            // produced metadata (mirrors the proven #31 'loadedmetadata'
            // settle pattern). The intermediate item-0 load triggered by
            // playlist() is aborted by the currentItem() src() above, so its
            // 'loadedmetadata' never fires — this listener therefore resolves
            // on the final, selected source. After it clears, any further
            // loadstart originates from genuine prev/next navigation, so the
            // loadstart autoplay may run normally without colliding with a
            // pending currentItem() src().
            //
            // With the one-step feed above there IS no intermediate item-0
            // load anymore: the single selected source produces the one and
            // only 'loadedmetadata', on which this listener settles — the
            // semantics ("resolves on the final, selected source") are
            // unchanged, just without the aborted intermediate load.
            //
            const _onPlaylistSetupSettled = () => {           
              vjsPlayer.off('loadedmetadata', _onPlaylistSetupSettled);

              _playlistSetupInProgress = false;
              isDev && logger.debug('\n' + 'playlist setup settled; loadstart autoplay re-enabled');
            };
            vjsPlayer.on('loadedmetadata', _onPlaylistSetupSettled);

            // Safety net: if 'loadedmetadata' never arrives (a source error, a
            // disabled tech, or an empty playlist) clear the guard after a
            // bounded delay so the loadstart autoplay is not disabled
            // permanently for subsequent navigations.
            //
            setTimeout(() => {
              if (_playlistSetupInProgress) {               
                vjsPlayer.off('loadedmetadata', _onPlaylistSetupSettled);

                _playlistSetupInProgress = false;
                isDev && logger.debug('\n' + 'playlist setup guard cleared by timeout fallback');
              }
            }, 2000);

          }

          // add custom progressControlSlider
          //
          const customProgressContainer = vjsPlayer.controlBar.addChild('Component', {
            el: videojs.dom.createEl('div', {
              className: 'vjs-theme-uno custom-progressbar-container'
            })
          });

          const progressControlSlider = vjsPlayer.controlBar.progressControl;
          if (progressControlSlider) {
            customProgressContainer.el().appendChild(progressControlSlider.el());
          }

          const currentTimeDisplay = vjsPlayer.controlBar.currentTimeDisplay;
          if (currentTimeDisplay) {
            customProgressContainer.el().insertBefore(currentTimeDisplay.el(), progressControlSlider.el());
          }

          const durationDisplay = vjsPlayer.controlBar.durationDisplay;
          if (durationDisplay) {
            customProgressContainer.el().appendChild(durationDisplay.el());
          }

          // add|skip playbackRates
          // Read from the block resolved above instead of walking into
          // videoJS.playbackRates again, which threw when the subtree was
          // absent. `values` may still be undefined; the plugin is only
          // called when `enabled` says so, and a configuration that switches
          // playbackRates on always ships the list with it (the defaults do).
          //
          if (piPlaybackRates.enabled) {
            vjsPlayer.playbackRates(vjsPlaybackRates);
          }

          // add|skip skipButtons plugin
          //
          if (piSkipButtons.enabled) {
            let backwardIndex = piSkipButtons.backward;
            let forwardIndex  = piSkipButtons.forwardIndex;

            if (piSkipButtons.surroundPlayButton) {
              backwardIndex = 0;
              forwardIndex  = 1;
            }

            vjsPlayer.skipButtons({
              backwardIndex:  backwardIndex,
              forwardIndex:   forwardIndex,
              backward:       piSkipButtons.backward,
              forward:        piSkipButtons.forward,
            });
          }

          // add|skip nextPrevButtons plugin
          // NOTE: placed AFTER skipButtons, so (button) placement resolves
          //
          if (piNextPrevButtons.enabled) {
            vjsPlayer.nextPrevButtons();

            // Hide the playlist panel when the user starts the previous/next
            // video from the playlist plugin's navigation buttons
            // (class="vjs-playlist-button skip-next/skip-forward").
            //
            // The #toggle_playlist button owns the panel's open state; once the
            // user navigates to another playlist item from the control bar the
            // panel is no longer relevant and would otherwise stay open on top
            // of the now-playing video. The toggle button continues to control
            // show/hide as before — this only adds an automatic hide for the
            // prev/next case.
            //
            // A single delegated click listener is attached to the control bar
            // (rather than to each button) so it:
            //
            //   • survives any internal re-creation of the button elements by
            //     the plugin (repeat-aware enable/disable rebuilds),
            //   • catches clicks that bubble up from inner icon/span children
            //     (resolved via closest('.vjs-playlist-button')),
            //   • targets ONLY the playlist nav buttons — the skipButtons seek
            //     buttons do not carry the .vjs-playlist-button class.
            //
            // The disabled guard skips boundary-disabled buttons (the repeat-off
            // ends of the playlist) so the panel is closed only when a video is
            // actually started. closePlaylist() is idempotent, so closing an
            // already-closed panel is a harmless no-op (e.g. when the panel was
            // never opened). Each embedRunVideo() builds a fresh player/control
            // bar, so exactly one listener is bound per player and is disposed
            // together with that player.
            //
            const _npbControlBarEl = (vjsPlayer.controlBar && typeof vjsPlayer.controlBar.el === 'function')
              ? vjsPlayer.controlBar.el() 
              : null;

            if (_npbControlBarEl) {
              _npbControlBarEl.addEventListener('click', (ev) => {
                const navBtn = (ev.target && typeof ev.target.closest === 'function')
                  ? ev.target.closest('.vjs-playlist-button')
                  : null;

                if (!navBtn) return;

                const isDisabled = navBtn.classList.contains('vjs-disabled')
                  || navBtn.getAttribute('aria-disabled') === 'true'
                  || navBtn.disabled === true;

                if (isDisabled) return;

                if (videoPlayerOptions.playlist.close_on_play) {
                  closePlaylist();
                  isDev && logger.debug('\n' + 'nextPrevButtons: playlist panel hidden after prev/next navigation');
                }
              });
            }
          }

          // The zoom plugin knows three switches that decide which button
          // rows the zoom panel shows: showZoom (the +/- row), showMove (the
          // move cross including the reset button in its centre) and
          // showRotate (the rotate/flip row). They were never handed over, so
          // the panel could not be arranged from the configuration at all.
          //
          // With the option plumbing inside zoom.js repaired (same fix tag),
          // the three keys are passed on here. They are read straight from
          // the resolved plugin configuration, which follows the usual
          // inheritance chain: defaults <- user settings <- per-player
          // control. videojs.yml does not declare them today, so they arrive
          // as `undefined`; the plugin drops empty members before merging and
          // keeps its own defaults (all three rows shown). Existing pages
          // therefore look exactly as before, and a page that adds e.g.
          //
          //     zoomButtons:
          //       showRotate:  false
          //
          // to its configuration now really loses the rotate/flip row.
          //
          // NOTE for the configuration: the reset button ("go back to the
          // original picture") sits in the middle of the move cross. Turning
          // showMove off removes the reset button together with the arrows.
          //
          // Two additions to the block below.
          //
          // GUARD. `piZoomButtons` is read straight from
          // videoPlayerOptions.videoJS.plugins.zoomButtons a few hundred lines
          // above. A configuration that does not carry a zoomButtons subtree
          // at all — the plugin block is optional, and a per-player entry in
          // multiPlayer_control.yml may replace it — leaves the variable
          // `undefined`, and reading `.enabled` from it threw a TypeError
          // right here. That happened inside the player setup, so the whole
          // player stayed dead because of a merely absent option block.
          // The second half of the guard covers the mirror image: the option
          // says the plugin is on, but zoom.js was not bundled into the page,
          // in which case vjsPlayer.zoomButtons is not a function.
          //
          // gestureHandler. The plugin knows a fourth switch besides the three
          // row switches added in #2: it decides whether the picture can be
          // panned and zoomed with the pointer and the mouse wheel. It was
          // never handed over, so it could not be configured. It is passed on
          // here now; the plugin defaults it to false (see zoom.js), which is
          // also the value declared in the module defaults.
          //
          if (piZoomButtons && piZoomButtons.enabled && isMP4 && typeof vjsPlayer.zoomButtons === 'function') {
            // piZoomButtons
            vjsPlayer.zoomButtons({
              moveX:          piZoomButtons.moveX,
              moveY:          piZoomButtons.moveY,
              rotate:         piZoomButtons.rotate,
              zoom:           piZoomButtons.zoom,
              showZoom:       piZoomButtons.showZoom,
              showMove:       piZoomButtons.showMove,
              showRotate:     piZoomButtons.showRotate,
              gestureHandler: piZoomButtons.gestureHandler
            });
          } else if (piZoomButtons && piZoomButtons.enabled && isMP4) {
            isDev && logger.warn('\n' + 'zoomButtons enabled, but the zoom plugin is not loaded');
          }

          // For YouTube, hide the VJS control bar when configured.
          // players.youtube.controls === 0 means the YouTube IFrame API hides
          // its own chrome; the VJS control bar is hidden separately here.
          // For native videos the control bar is always shown.
          //
          const ytControls = videoPlayerOptions.videoJS.players.youtube
            ? videoPlayerOptions.videoJS.players.youtube.controls
            : undefined;

            if (isYouTube && (videoPlayerOptions.videoJS.hideControlBar || ytControls === 0)) {
            isDev && logger.debug('\n' + 'hiding vjs controlbar for YT video');
            vjsPlayer.addClass('vjs-youtube-hide-controlbar');
          }

          // Autoplay: read from players.youtube for YouTube, players.native for
          // native video — both driven by the defaults in videoPlayer.yml.
          //
          const autoplay = isYouTube
            ? (videoPlayerOptions.videoJS.players.youtube && videoPlayerOptions.videoJS.players.youtube.autoplay)
            : (videoPlayerOptions.videoJS.players.native  && videoPlayerOptions.videoJS.players.native.autoplay);

          if (autoplay) {
            if (playerMode === 'pause') {
              setTimeout(() => vjsPlayer.pause(), VIDEO_START_DELAY);
            } else {
              setTimeout(() => _playWhenVisible(vjsPlayer), VIDEO_START_DELAY);
            }
          }

          // PiP support (unchanged logic)
          if (pipConfigEnabled) {
            _initPiPVisibilityHandler(vjsPlayer);
          }

          if (pipConfigEnabled && _isPiPSupported() === 'documentPiP') {
            const PiPButton = videojs.getComponent('Button');

            class DocumentPiPButton extends PiPButton {
              constructor(player, options) {
                super(player, options);
                this.controlText('Picture-in-Picture');
                this.addClass('vjs-pip-button');
              }
              handleClick() {
                if (pipWindow && !pipWindow.closed) {
                  _exitPictureInPicture(player);
                } else {
                  _requestPictureInPicture(player);
                }
              }
            }

            videojs.registerComponent('DocumentPiPButton', DocumentPiPButton);
            vjsPlayer.controlBar.addChild('DocumentPiPButton', {});

            const nativePiP = vjsPlayer.controlBar.getChild('pictureInPictureToggle');
            if (nativePiP) {
              nativePiP.hide();
            }

            isDev && logger.info('\n' + 'pip: custom Document PiP button added to control bar');
          } else {
            const nativePiP = vjsPlayer.controlBar.getChild('pictureInPictureToggle');
            if (nativePiP) {
              nativePiP.hide();
            }
          }
        } // END if videoPlayerOptions.videoJS.autoStart
      } // END onReady
    }); // END vjsPlayer
  }; // END embedRunVideo

  /**
   * doPostOnPlaying - post-processing after state change to 'playing'
   * Extended to handle both YouTube (player.ytVideoData) and native
   * (player.videoData) metadata
   * @param {number} state - player state code
   */
  function doPostOnPlaying(state) {
    const titleElement      = document.getElementById(_pid("video_title"));
    const videoTitleElement = document.getElementById('video_title');    
    const textEl            = document.getElementById(_pid('video_title_text'));

    isDev && logger.debug('\n' + `do post processing on state: ${vjsStateEventNameMap[state]}`);

    // Choose the right video-data source depending on which tech is active.
    // YouTube: player.ytVideoData (set in onReady YouTube branch).
    // Native:  player.videoData  (set by nativePlayer plugin via 'videoDataResolved').
    //
    const isYouTubePlayer = !!(player && player.ytVideoData);

    // The player just entered the 'playing' state. Resolve the videoId for
    // the active tech (YouTube vs native) and mark its playlist card/row as
    // active. Done before addEntry()/updateWatchDate() below, which trigger
    // renderCurrent(); setting it here lets those re-renders inline the
    // correct data-item-active value, and setActiveItem() also updates any
    // already-rendered element directly.
    //
    // Prefer the id recorded by the 'playlistitem' listener. When the source
    // change was driven by the videojs-playlist plugin (previous/next buttons,
    // autoadvance), the per-tech metadata below is stale — it still describes
    // the entry from the last embedRunVideo() — so resolving from it alone
    // would re-mark the previously playing entry. _playlistActiveVideoId
    // reflects the item the plugin actually loaded; fall back to the per-tech
    // resolution for plain (non-playlist) plays where it is null.
    //
    const _resolvedFromTech = isYouTubePlayer
      ? ((player.ytVideoData && player.ytVideoData.video_id) ? player.ytVideoData.video_id : '')
      : ((player.videoData   && player.videoData.videoId)    ? player.videoData.videoId    : '');

    const _activePlayingId = _playlistActiveVideoId || _resolvedFromTech;

    if (_activePlayingId) {
      playlistManager.setActiveItem(_activePlayingId);
    }

    if (isYouTubePlayer) {

      // ROOT CAUSE of "playlist-duration flips to a wrong value (and the
      // beyond-duration warnings start) the moment endAt is reached":
      //
      // Every playlist WRITE in this branch below - createEntry(),
      // enrichEntry(), updateEntryAuthor(), updateEntryDuration(),
      // updateWatchDate(), and the media object they consume - keys off
      // `vid = player.ytVideoData.video_id`. But the module's own #23 note
      // states that player.ytVideoData is NOT refreshed on plugin-driven
      // in-player source swaps (autoadvance, prev/next, currentItem()); it
      // still describes the PREVIOUSLY loaded entry. #23 repaired only the
      // READ side (setActiveItem via _playlistActiveVideoId, right above);
      // the write side kept using the stale id.
      //
      // player.duration(), in contrast, follows the swap: it reports the
      // duration of the video NOW playing. So on every in-player advance the
      // pairing in updateEntryDuration(vid, Math.floor(player.duration()))
      // is (OLD video's id, NEW video's duration) - the new item's duration
      // is stamped onto the PREVIOUS playlist entry (updateEntryDuration
      // overwrites unconditionally); updateWatchDate() stamps the previous
      // entry too.
      //
      // Until #5 this write path was rarely hit at an endAt stop, because an
      // endAt stop did not autoadvance at all. #5 restored the plugin
      // autoadvance at endAt - and thereby routed every endAt stop through
      // exactly this stale write: reaching endAt on item N advances to item
      // N+1, whose 'playing' immediately writes item N+1's duration under
      // item N's id. Demo playlist, the reported case: item 2 ("Lady Lady",
      // JN_Vyg_wURY, really 222s / 3:42, endAt 206s) reaches endAt, item 3
      // (~196s) starts, and updateEntryDuration(JN_Vyg_wURY, 196) rewrites
      // item 2's row to 3:16. From then on every window resolution for
      // JN_Vyg_wURY sees endAt 206s >= stored duration 196s and warns - on
      // every watchdog tick (spam repaired separately, see
      // _playbackWindowDurationWarnedIds). Exports persist the corruption
      // (the uploaded playlist JSON carries exactly this 196).
      //
      // FIX: refresh player.ytVideoData from the LIVE raw YT.Player (the
      // same authoritative priority-1 source _resolveActivePlaybackVideoId()
      // uses, #3) BEFORE anything in this branch reads it. One refresh point
      // heals the whole downstream family in source order: the
      // 'videoPlayingStarted' event detail, the title/author line, the media
      // object, createEntry/enrichEntry, updateEntryAuthor,
      // updateEntryDuration, updateWatchDate - and, because 'playing'
      // always precedes the later 'paused'/'ended' of the same media, the
      // position saver in onStateChange as well.
      //
      // The live duration is captured HERE too (raw getDuration() is
      // per-media and already correct at 'playing'), because the videojs
      // facade's cached duration() can lag one durationchange behind right
      // after a swap - id and duration must come from the SAME live player
      // so the stale (id, duration) pairing can never re-form. When the raw
      // player is not reachable (tech not settled), everything falls back to
      // the previous behaviour unchanged.
      //
      let _liveYtDurationSecs = 0; // 0 = not resolved, fall back to player.duration()
      try {
        const _liveTech = player.tech({ IWillNotUseThisInPlugins: true });
        const _liveYt   = (_liveTech && _liveTech.ytPlayer) ? _liveTech.ytPlayer : null;
        const _liveData = (_liveYt && typeof _liveYt.getVideoData === 'function')
          ? (_liveYt.getVideoData() || null)
          : null;

        if (_liveData && _liveData.video_id) {
          if (player.ytVideoData.video_id && player.ytVideoData.video_id !== _liveData.video_id) {
            isDev && logger.info('\n' + `playbackWindow: per-tech metadata refreshed on in-player source swap: ${player.ytVideoData.video_id} -> ${_liveData.video_id}`);
          }
          player.ytVideoData.video_id = _liveData.video_id;
          if (_liveData.title)  player.ytVideoData.title  = _liveData.title;
          if (_liveData.author) player.ytVideoData.author = _liveData.author;
        }

        if (_liveYt && typeof _liveYt.getDuration === 'function') {
          const _liveDur = Number(_liveYt.getDuration());
          if (isFinite(_liveDur) && _liveDur > 0) {
            _liveYtDurationSecs = _liveDur;
          }
        }
      } catch (_e) {
        isDev && logger.debug('\n' + `playbackWindow: live YT metadata refresh skipped: ${_e}`);
      }

      document.dispatchEvent(new CustomEvent('videoPlayingStarted', {
        detail: { videoId: player.ytVideoData?.video_id || '' },
        bubbles: true
      }));

      // refresh author from live YT player object
      //
      try {
        const tech      = player.tech({ IWillNotUseThisInPlugins: true });
        const ytPlayer  = tech.ytPlayer;
        const freshData = ytPlayer.getVideoData();
        player.ytVideoData.author = freshData.author;
      } catch (_e) {
        // tech not yet fully ready; author stays as-is
      }

      const vd  = player.ytVideoData;
      const vid = vd.video_id || '';

      if (textEl && vd) {
        const title  = vd.title  || player.ytVideoTitle || '';
        const author = vd.author || '';
        textEl.textContent = author ? ` ${author} · ${title}` : title;
      } else if (textEl && player.ytVideoTitle) {
        textEl.textContent = player.ytVideoTitle;
      }

      // Added 'poster' field: resolves to the highest-quality YouTube thumbnail
      // (maxresdefault.jpg) so list and card items show the real poster image
      // instead of falling back to DEFAULT_POSTER.
      //
      // Two fixes in the YouTube media object:
      //
      // 1. infoLink used the wrong URL format ('https://youtu.be/watch?v=ID'
      //    mixes the youtu.be short-link domain with the youtube.com/watch path
      //    and produces a broken link).  Correct format: 'https://youtu.be/ID'.
      // 2. videoLink was missing entirely.  addEntry() falls back to entry.src,
      //    but src is also absent from the YouTube media object, so videoLink
      //    was always stored as ''.  For YouTube items videoLink should equal
      //    the same canonical watch URL as infoLink.
      //
      const media = {
        videoId:      vid,
        title:        vd.title  || player.ytVideoTitle || '',
        author:       vd.author || '',
        infoLink:     vid ? `https://youtu.be/${vid}` : '',
        videoLink:    vid ? `https://youtu.be/${vid}` : '',
        poster:       vid ? `//i.ytimg.com/vi/${vid}/maxresdefault.jpg` : '',
        duration:     (_liveYtDurationSecs > 0) ? _liveYtDurationSecs : player.duration(),
        lastPosition: 0
      };

      // Creation now happens early in embedRunVideo(). createEntry() here is a
      // defensive no-op when the record already exists (it is idempotent) and
      // only creates one in the rare case the early creation was skipped (e.g.
      // a direct doPostOnPlaying() path). enrichEntry() then back-fills the
      // metadata that just became available from the live YouTube player
      // (title/author/duration) onto the existing record - something addEntry()
      // could not do because it skips records that already exist.
      //
      playlistManager.createEntry(media);
      playlistManager.enrichEntry(vid, media);

      // Reflect the now-loaded video's title in the centre header span
      // (.video-player-header-title). Read the canonical entry.title back from
      // the playlist (just created / enriched above); fall back to the locally
      // resolved media.title, then to the videoId, so the header is never blank
      // for a loaded video.
      //
      const _entryYT = playlistManager.getEntry(vid);

      _updateHeaderTitle((_entryYT && _entryYT.title) || media.title || vid);

      if (vid && vd.author) {
        playlistManager.updateEntryAuthor(vid, vd.author);
      }

      // Same live-source pairing as the media object above: `vid` was just
      // refreshed from the raw YT player, so the duration written next to it
      // must come from that same player. This is the write that used to
      // stamp the NEXT item's duration onto the PREVIOUS entry on every
      // endAt-driven autoadvance (see the #6 root-cause note at the top of
      // this branch). A previously corrupted stored duration is healed here
      // automatically on the entry's next play.
      //
      const durationYT = (_liveYtDurationSecs > 0) ? _liveYtDurationSecs : player.duration();

      if (vid && durationYT > 0) {
        playlistManager.updateEntryDuration(vid, Math.floor(durationYT));
      }

      if (vid) {
        playlistManager.updateWatchDate(vid);
      }

    } else {
      // Native video path
      //
      document.dispatchEvent(new CustomEvent('videoPlayingStarted', {
        detail: { videoId: player.videoData && player.videoData.videoId || '' },
        bubbles: true
      }));

      const vd  = player.videoData || {};
      const vid = vd.videoId || '';

      if (textEl) {
        const title  = vd.title  || player.videoTitle || '';
        const author = vd.author || '';
        textEl.textContent = author ? ` ${author} · ${title}` : title;
      }

      const media = {
        src:          vd.src      || '',
        poster:       vd.poster   || '',
        videoId:      vid,
        title:        vd.title    || player.videoTitle || '',
        author:       vd.author   || '',
        infoLink:     '',
        videoLink:    vd.src      || '',
        duration:     player.duration(),
        lastPosition: 0
      };

      // Creation now happens early in embedRunVideo(). createEntry() here is a
      // defensive no-op when the record already exists (idempotent); enrichEntry()
      // back-fills the title/author/duration resolved during playback onto the
      // existing record. The native poster is captured early in embedRunVideo()
      // and, as a fallback, again below.
      //
      playlistManager.createEntry(media);
      playlistManager.enrichEntry(vid, media);

      // Reflect the now-loaded native video's title in the centre header span
      // (.video-player-header-title). Read entry.title back from the playlist,
      // falling back to the resolved media.title and then the videoId.
      const _entryNV = playlistManager.getEntry(vid);
      _updateHeaderTitle((_entryNV && _entryNV.title) || media.title || vid);

      if (vid && vd.author) {
        playlistManager.updateEntryAuthor(vid, vd.author);
      }

      const duration = player.duration();
      if (vid && duration > 0) {
        playlistManager.updateEntryDuration(vid, Math.floor(duration));
      }

      if (vid) {
        playlistManager.updateWatchDate(vid);
      }

      // The native entry just added above may have arrived without a poster
      // (the media object's poster came through empty). Capture a still frame
      // from the file off-screen and store it so the playlist list/card views
      // show a real thumbnail instead of the DEFAULT_POSTER placeholder.
      // Fire-and-forget: generateNativePoster() never rejects and only writes
      // when the entry still lacks a real poster, so this is safe to run on
      // every native play.
      //
      if (vid && !media.poster) {
        playlistManager.generatePosterForEntry(vid)
          .catch((e) => { isDev && logger.warn('\n' + `native poster generation failed for videoId: ${vid} - ${e}`); });
      }
    }

    // Authoritative header-title resync for plugin-driven source swaps.
    //
    // The per-tech branches above set the centre header span
    // (.video-player-header-title) from player.ytVideoData / player.videoData
    // (#35). On an in-player source swap driven by the videojs-playlist plugin
    // (the playlist nav / skip-backward / skip-forward / prev / next control-bar
    // buttons and autoadvance) that per-tech metadata is NOT refreshed - it still
    // describes the entry from the last embedRunVideo() (see the #23 note above) -
    // so the branch above re-writes the *previously* loaded video's title and the
    // header stops matching the video that actually loaded.
    //
    // _activePlayingId already prefers _playlistActiveVideoId (the id the plugin
    // really switched to, recorded by the 'playlistitem' listener) and falls back
    // to the per-tech id for plain plays, so it is the correct id in BOTH cases.
    // Reading the canonical title back from that entry and writing it LAST (after
    // the per-tech writes above) makes the header follow the plugin without
    // disturbing the normal, non-playlist path: there _activePlayingId equals the
    // per-tech id, so this resolves the same title and the write is idempotent.
    // Only writes when a titled entry resolves, so a missing record never blanks
    // a header the branch above already set.
    //
    if (_activePlayingId) {
      const _entryActive = playlistManager.getEntry(_activePlayingId);
      if (_entryActive && _entryActive.title) {
        _updateHeaderTitle(_entryActive.title);
      }
    }

    if (titleElement) {
      titleElement.style.display = "flex";
    }

    // When the video was started by clicking a playlist card, collapse the
    // playlist panel so the video container has the full viewport while
    // playing.  The flag is reset immediately so subsequent non-playlist
    // plays (e.g. direct embed) are not affected.
    //
    if (_startedFromPlaylist) {
      _startedFromPlaylist = false;

      if (videoPlayerOptions.playlist.close_on_play) {
        closePlaylist();
        closeEditPlaylist();
      }
    }

    // jadams, 2026-07-05: disable scrolling on playimg video
    // if (videoTitleElement) {
    //   scrollToElement(videoTitleElement);
    // }

    // Re-enable body scrolling
    if ($('body').hasClass('stop-scrolling')) {
      $('body').removeClass('stop-scrolling');
    }

  }
 
  // _updateHeaderTitle
  //
  // Sets the centre header span (.video-player-header-title) to the supplied
  // text so the header shows the title of the currently loaded video. This
  // span previously doubled as the playlist toggle label ("Show/Hide
  // Playlist"); that behaviour has been removed (see _resetPlaylistToggleUI
  // and initTogglePlaylistHandler), making the span a dedicated "now playing"
  // title.
  //
  // The lookup is scoped to THIS player instance's #video_player_container so
  // the correct span is updated when several players share one page. A
  // defensive fall-back to the first <span> inside the container keeps the
  // helper working even if the .video-player-header-title class is ever
  // renamed. An empty / missing title clears the span rather than printing
  // 'undefined'.
  //
  function _updateHeaderTitle(title) {
    const container = document.getElementById(_pid('video_player_container'));
    if (!container) return;

    const span = container.querySelector('.video-player-header-title')
              || container.querySelector('span');
    if (!span) return;

    const text = (title != null && String(title).trim() !== '')
      ? String(title)
      : '';
    span.textContent = text;

    isDev && logger.debug('\n' + `_updateHeaderTitle: header title set to "${text}"`);
  }

  function _resetPlaylistToggleUI() {
    const wrapper = document.getElementById(_pid('video_player_container'));
    if (!wrapper) return;

    // The centre header <span> (.video-player-header-title) no longer doubles
    // as the playlist toggle label; it now shows the title of the currently
    // loaded video (set by _updateHeaderTitle() from doPostOnPlaying()).
    // Writing "Show Playlist" here would clobber that title every time the
    // panel closes, so the legacy span-label write is disabled. Show/hide
    // state is still conveyed by the toggle button's title / aria-label / icon
    // (updated below), so accessibility is unaffected.
    //
    void wrapper;

    // Corrected button ID from 'video_player_header_arrows' (does not
    // exist in the page template) to 'toggle_playlist' (the actual
    // rendered element ID).
    // The previous ID caused a silent no-op: btn was always null so the
    // icon, title and aria attributes were never reset after closePlaylist().
    //
    const btn = document.getElementById(_pid('toggle_playlist'));
    if (btn) {
      btn.title                             = 'Show playlist';
      btn.setAttribute('aria-label',          'Show playlist');
      btn.setAttribute('aria-expanded',       'false');

      const img = btn.querySelector('img');
      if (img) {
        const currentSrc  = img.getAttribute('src') || '';
        const showIconSrc = currentSrc.replace('playlist-hide.svg', 'playlist-show.svg');

        img.setAttribute('src', showIconSrc);
        img.setAttribute('alt', 'Show playlist');
      }
    }

    isDev && logger.debug('\n' + '_resetPlaylistToggleUI: toggle reset to "Show Playlist" state');
  }

  // ---------------------------------------------------------------------------
  // initEditPlaylistHandler
  //
  // Wires the #edit_playlist button so that clicking it:
  //
  //   1.  Toggles the visibility of #playlist_edit_screen.
  //   2a. ON OPEN : replaces the content of #video_container with the
  //       #playlist_edit_screen div (the edit panel is moved inside the
  //       video container so it occupies the same visual slot as the player).
  //   2b. ON CLOSE: restores #video_container to its saved snapshot and moves
  //       #playlist_edit_screen back to its original position (hidden).
  //
  // Why move instead of overlay?
  //   The #video_container has CSS that sizes and positions the player area.
  //   Injecting the edit panel *inside* that container reuses the same layout
  //   box without adding new positioning rules.  The original container HTML
  //   (module-level `containerHTML`) is restored verbatim on close, which is
  //   the same strategy already used by createVideoJsPlayer().
  //
  // Guard: the handler is registered only once via _editPlaylistHandlerInit.
  // NOTE: _editPlaylistHandlerInit is declared in the module variables section
  // (above) rather than here.  The original `let` placement immediately before
  // this function caused a TDZ ReferenceError because initEditPlaylistHandler()
  // is called at module init time (~line 1956), before this `let` would have
  // been reached.  See the module variables section for the declaration.
  // ---------------------------------------------------------------------------
  //
  function initEditPlaylistHandler() {
    // ------------------------------------------------------------------------
    // DEPRECATED — handler ownership moved to the adapter.
    //
    // The edit-playlist click is now owned exclusively by the adapter's
    // initPlayerUiEvents(playerId) (per-player loop, suffixed ids). That path
    // implements the overlay model (#29): the edit screen is positioned
    // absolutely OVER #video_container as a sibling and the live player is
    // left running underneath — it is never disposed and the container
    // innerHTML is never replaced.
    //
    // This module-level handler used the legacy "move editScreen inside
    // video_container + dispose player + snapshot-restore innerHTML" model,
    // which conflicts with the overlay approach and, in practice, never bound
    // anyway: it runs at module-IIFE load when _playerID is still '' so
    // _pid('edit_playlist') resolves to the unsuffixed id and the guard below
    // bails. We make the deprecation explicit with a hard early-return while
    // preserving the original body for reference (deprecation, not deletion).
    //
    return;

    // Removed the temporary `return;` that disabled this handler.  Now that
    // every element id is resolved through _pid() the handler correctly finds
    // the suffixed elements (e.g. edit_playlist_myPlayer) even when multiple
    // players share the same page, so it is safe to re-enable it here.
    //
    if (_editPlaylistHandlerInit) return;

    const editBtn     = document.getElementById(_pid('edit_playlist'));
    const editScreen  = document.getElementById(_pid('playlist_edit_screen'));
    const videoContnr = document.getElementById(_pid('video_container'));

    if (!editBtn || !editScreen || !videoContnr) {
      isDev && logger.warn('\n' + 'initEditPlaylistHandler: required element(s) not found — handler skipped');
      return;
    }

    _editPlaylistHandlerInit = true;

    const editScreenOriginalParent  = editScreen.parentNode;
    const editScreenOriginalSibling = editScreen.nextSibling;

    // Track whether the edit panel is currently shown inside video_container.
    let _editScreenVisible = false;

    editBtn.addEventListener('click', () => {

      if (!_editScreenVisible) {
        // --- OPEN ------------------------------------------------------------
        // 1. Dispose any live videoJS player so it does not leak resources
        //    while the video_container is replaced.
        if (player) {
          isDev && logger.debug('\n' + 'initEditPlaylistHandler: disposing videoJS player before showing edit screen');
          player.dispose();
          player = null;
        }

        // 2. Move #playlist_edit_screen into #video_container.
        //    The edit screen was hidden (display:none) in the source HTML;
        //    make it visible now that it occupies the player slot.
        editScreen.style.display  = 'block';
        videoContnr.innerHTML     = '';
        videoContnr.appendChild(editScreen);

        // 3. Update button aria state.
        editBtn.setAttribute('aria-expanded', 'true');
        editBtn.title       = 'Close playlist editor';
        editBtn.setAttribute('aria-label', 'Close playlist editor');

        // Mark the editor as open so _updateTogglePlaylistButton() (and any
        // other consumer) can read the state without tracking a private flag.
        editBtn.setAttribute('data-edit-open', 'true');

        // Block #toggle_playlist while the editor occupies the player slot.
        const toggleBtn = document.getElementById(_pid('toggle_playlist'));
        if (toggleBtn) {
          toggleBtn.setAttribute('disabled', '');
          toggleBtn.setAttribute('aria-disabled', 'true');
          toggleBtn.style.opacity = '0.35';
          toggleBtn.style.cursor  = 'not-allowed';
          toggleBtn.title         = 'Close the playlist editor first';
        }

        _editScreenVisible = true;

        isDev && logger.debug('\n' + 'initEditPlaylistHandler: edit screen shown inside video_container');

      } else {
        // --- CLOSE -----------------------------------------------------------
        // 1. Remove the edit screen from video_container and put it back at
        //    its original DOM position (hidden, as the HTML declares it).
        editScreen.style.display = 'none';

        if (editScreenOriginalParent) {
          if (editScreenOriginalSibling && editScreenOriginalSibling.parentNode === editScreenOriginalParent) {
            editScreenOriginalParent.insertBefore(editScreen, editScreenOriginalSibling);
          } else {
            editScreenOriginalParent.appendChild(editScreen);
          }
        }

        // 2. Restore the video_container to its original snapshot
        //    (same mechanism used by createVideoJsPlayer).
        videoContnr.innerHTML = containerHTML;

        // 3. Update button aria state.
        editBtn.setAttribute('aria-expanded', 'false');
        editBtn.title       = 'Manage playlists';
        editBtn.setAttribute('aria-label', 'Manage playlists');

        // Clear the open marker so the toggle button can be re-enabled.
        editBtn.setAttribute('data-edit-open', 'false');

        // Re-enable #toggle_playlist now that the editor is closed.
        // Delegate to _updateTogglePlaylistButton() so empty-playlist logic
        // is respected automatically (button stays disabled when the list is
        // empty, rather than being blindly re-enabled here).
        playlistManager._updateTogglePlaylistButton();

        _editScreenVisible = false;

        isDev && logger.debug('\n' + 'initEditPlaylistHandler: video_container restored, edit screen hidden');
      }
    });

    isDev && logger.info('\n' + 'initEditPlaylistHandler: edit-playlist toggle handler registered');
  }

  /**
   * scrollToElement - scroll to element's (vertical) top position
   */
  function scrollToElement(elm) {
    if (!elm) return;

    const targetElmPosition = elm.offsetTop;
    const scrollOffset      = (window.innerWidth >= 720) ? -180 : -130;
    const position          = targetElmPosition + scrollOffset;

    isDev && logger.debug('\n' + `scroll page to vertical position: ${position}`);
    window.scrollTo(0, position);
  }

  /**
   * generateId - generate a random alphanumeric ID string
   */
  function generateId(length = 11) {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let id = '';
    for (let i = 0; i < length; i++) {
      id += chars[Math.floor(Math.random() * chars.length)];
    }
    return id;
  }

  /**
   * createVideoJsPlayer
   * Extended to support YouTube tech when isYouTube is true.
   * When isYouTube is false the original HTML5-only path is used unchanged.
   *
   * Replaced YouTube-tech player creation with native HTML5 tech (native path).
   * - techOrder: ['html5']   (was ['youtube', 'html5'])
   * - source type: auto-detected from file extension (was 'video/youtube')
   * - source URL:  videoSrc parameter (was '//youtu.be/${videoId}')
   * - nativePlayer plugin registered so custom events are dispatched
   * - 'vjs-youtube' class replaced with 'vjs-native'
   *
   * @param {string}  videoId   - YouTube video ID or filename-without-extension key
   * @param {string}  videoSrc  - YouTube ID / URL or native file URL/path
   * @param {boolean} isYouTube - true → YouTube tech; false → HTML5 tech
   * @param {Object}  options   - player callbacks (onStateChange, onReady, title)
   * @returns {Object|null}     - VideoJS player instance or null on failure
   */
  function createVideoJsPlayer(videoId, videoSrc, isYouTube, options = {}) {

    if (!container) {
      logger.error('\n' + `Container or overlay element not found`);
      return null;
    }

    if (player) {
      const isPlayerLoaded = (document.getElementById(player.id_) !== null) ? true : false;

      // jadams, 2026-06-28: prevent error like:
      // video.js:210 VIDEOJS: ERROR: TypeError: player.off is not a function      
      if (isPlayerLoaded) {
        isDev && logger.info('\n' + `Disposing existing videoJS player: ${player.id_}`);

        if (pipWindow && !pipWindow.closed) {
          pipWindow.close();
          pipWindow = null;
        }
        pipVisibilityBound = false;
        pipEnabled         = false;
      }
    }

    const overlayExists = document.getElementById(_pid('emptyPlayerOverlay'));
    if (!overlayExists) {
      isDev && logger.info('\n' + `Restoring container and overlay for new video`);
      container.innerHTML = containerHTML;
    }

    const currentOverlay = document.getElementById(_pid('emptyPlayerOverlay'));
    if (!currentOverlay) {
      isDev && logger.error('\n' + `Overlay element could not be restored`);
      return null;
    }

    // The element id is kept as the raw videoId (bare, no 'vjs-' prefix) so
    // player.id_, the videojs player registry key, previousPlayerId and the
    // playlist keys all stay identical - nothing downstream changes.
    //
    // IMPORTANT: an id like "8eba89d3-..._AVC-1080" (ARD Mediathek native
    // files are GUID-named) is a perfectly LEGAL "id" attribute in HTML5,
    // and sanitizeVideoId() (#1) correctly leaves it untouched - every char
    // is inside [A-Za-z0-9_-]. But it is NOT a legal CSS *identifier*: a CSS
    // ident must not start with a digit (nor a hyphen followed by a digit).
    // querySelector('#8eba...') therefore throws a SyntaxError. video.js's
    // videojs(id) -> getPlayer(id) does exactly that querySelector when the
    // player is not yet in its registry, which is why creation crashed for
    // these sources. The fix is applied at the videojs() call below: the
    // freshly created <video> ELEMENT is passed instead of the id string,
    // so no '#id' selector is ever built. getElementById()-based lookups
    // (e.g. the dispose guard above) are unaffected - getElementById has no
    // CSS-identifier restriction.
    //
    const playerElementId = videoId;

    const video       = document.createElement('video');
    video.id          = playerElementId;
    video.className   = 'video-js vjs-theme-uno';
    video.controls    = true;
    video.width       = 640;
    video.height      = 360;

    video.setAttribute('aria-label', options.title || 'Video Player');

    currentOverlay.replaceWith(video);

    let videoConfig;

    if (isYouTube) {
      // YouTube tech configuration: all player parameters are now read from
      // videoPlayerOptions.videoJS.players.youtube (videoPlayer.yml) instead
      // of being hardcoded.
      // Per-instance options (factory) take precedence over the page-global
      // adapter options, so per-player videoJS.players.youtube settings
      // govern THIS player's YouTube tech configuration.
      //
      const vpo     = _resolveVideoPlayerEffectiveOptions();
      const ytCfg   = (vpo && vpo.videoJS && vpo.videoJS.players && vpo.videoJS.players.youtube)
        ? vpo.videoJS.players.youtube
        : {};

      // Build the YouTube playerVars object from players.youtube defaults.
      // Only numeric / string params that the YouTube IFrame API accepts are
      // forwarded; boolean flags (end, start) are used elsewhere in the module
      // and are intentionally excluded from playerVars.
      //
      const ytPlayerVars = {};
      const ytParamKeys = [
        'cc_load_policy', 'controls', 'disablekb', 'enablejsapi',
        'fs', 'iv_load_policy', 'loop', 'modestbranding', 'rel', 'showinfo'
      ];
      ytParamKeys.forEach(key => {
        if (key in ytCfg) ytPlayerVars[key] = ytCfg[key];
      });

      const privacyEnhanced = ('privacy_enhanced' in ytCfg) ? true : false;

      // Hard-set the initial caption load policy to 0 ("do not show captions by
      // default") regardless of the players.youtube config value. This only
      // governs the INITIAL state; the permanent enforcement is done at runtime
      // via _disableYouTubeCaptions() (onApiChange -> unloadModule). Setting it
      // here avoids a brief caption flash before the module is unloaded.
      //
      ytPlayerVars.cc_load_policy = 0;

      videoConfig = {
        fluid:     !!(ytCfg.fluid !== undefined ? ytCfg.fluid : true),
        techOrder: ['youtube', 'html5'],
        sources: [{
          type: 'video/youtube',
          src:  `//youtu.be/${videoId}`
        }],
        youtube: {
          
          // see: https://github.com/videojs/videojs-youtube
          // see: https://github.com/videojs/videojs-youtube/issues/499
          // Run the YouTube embed from the privacy-enhanced host
          // www.youtube-nocookie.com. The videojs-youtube tech (youtube.js)
          // maps the option `enablePrivacyEnhancedMode` to
          // `playerConfig.host` when creating the underlying YT.Player.
          // The classic host youtube.com sets several third-party
          // cookies already on page load, which Chrome/Lighthouse flags in
          // the "Best Practices" audit ("Uses third-party cookies").
          // Default: enabled. Set the YAML key
          // videoJS.players.youtube.enablePrivacyEnhancedMode: false
          // (defaults <- control settings <- per-instance) to restore the
          // classic youtube.com host.
          //
          enablePrivacyEnhancedMode: privacyEnhanced,
          playerVars: ytPlayerVars
        },
        controlBar: {
          pictureInPictureToggle: false,
          volumePanel: {
            inline: false
          }
        }
      };

      isDev && logger.info('\n' + `createVideoJsPlayer: YouTube playerVars from players.youtube: ${JSON.stringify(ytPlayerVars)}`);

      // AUDIO ONLY (YouTube sources only, ytp parity — see the feature note
      // at _isYouTubeEntry). When the effective state is active:
      //
      //   audioOnlyMode: true  — Video.js hides the video surface and
      //                          collapses the player to the control-bar
      //                          height; the VideoJS equivalent of the ytp
      //                          yt_player 'height: 0 / width: 0' setup.
      //   playerVars.vq        — initial quality HINT for the IFrame API
      //                          ('small', the ytp 'quality: small' value).
      //                          The hard enforcement runs after playback
      //                          start (onPlayerReady below ->
      //                          _applyYouTubeAudioOnlyQuality), exactly as
      //                          ytp.js calls setPlaybackQuality('small')
      //                          in its onPlayerReady.
      //
      // ytPlayerVars is the SAME object already referenced by
      // videoConfig.youtube.playerVars above, so the late write is carried
      // into the player creation. The native (else) branch is untouched:
      // audio-only never applies to native .mp4/.mp3 sources.
      // Fix multiPlayer new select audio only #2
      // Display strategy CHANGED (see the ADDENDUM at the feature note):
      // audioOnlyMode collapsed the player to the control-bar height, so
      // #video_container showed the control bar and no content at all.
      // audioPosterMode keeps the full fluid player surface, hides the
      // YouTube iframe (tech.hide()) and persistently displays the poster —
      // videoConfig.poster MUST be set for the mode to be visible (the
      // PosterImage component hides itself without a URL), so the configured
      // poster is resolved here (entry.poster <- players.youtube thumbnail <-
      // default_poster <- DEFAULT_POSTER). The quality clamp (vq = 'small' +
      // the 'playing' one-shot below) is unchanged ytp parity.
      // Fix multiPlayer new select audio only 4
      // UNCHANGED call site — the resolver itself gained the leading rule
      // "switch not shown/unavailable -> set_audio_only wins" (see the
      // feature note at _isAudioOnlySwitchAvailable). A player configured
      // with ui_elements.audioOnlySwitch: false and set_audio_only: true
      // therefore reaches the audioPosterMode branch below on every YouTube
      // load without any UI ever being built.
      //
      const audioOnlyActive = _resolveAudioOnlyActive();
      if (audioOnlyActive) {
        videoConfig.audioPosterMode = true;
        videoConfig.poster          = _resolveYouTubeAudioOnlyPoster(videoId);
        ytPlayerVars.vq           = 'small';

        // Defensive poster-persistence CSS (no-op with the full core CSS).
        //
        _ensureAudioOnlyPosterStyles();

        isDev && logger.info('\n' + `createVideoJsPlayer: AUDIO ONLY active — poster shown (${videoConfig.poster}), video hidden, quality small (ytp parity)`);
      }

    } else {
      // Native HTML5 tech configuration: all player parameters are now read
      // from videoPlayerOptions.videoJS.players.native (videoPlayer.yml)
      // instead of being hardcoded.  Static defaults are used as fallback
      // values when videoPlayerOptions is not yet available.
      // Per-instance options (factory) take precedence over the page-global
      // adapter options, so per-player videoJS.players.native settings
      // govern THIS player's HTML5 tech configuration.
      //
      const vpo      = _resolveVideoPlayerEffectiveOptions();
      const ntvCfg   = (vpo && vpo.videoJS && vpo.videoJS.players && vpo.videoJS.players.native)
        ? vpo.videoJS.players.native
        : {};

      // Auto-detect MIME type from the file extension so that MP4, WebM
      // and OGV sources are all accepted without hardcoding.
      //
      const extMap = {
        mp4:  'video/mp4',
        webm: 'video/webm',
        ogv:  'video/ogg',
        ogg:  'video/ogg',
        m4v:  'video/mp4',
        mov:  'video/mp4'
      };

      const srcExt  = (videoSrc || '').split('?')[0].split('.').pop().toLowerCase();
      const srcType = extMap[srcExt] || 'video/mp4';

      // videoJS configuration: HTML5 tech only.
      // Boolean/string player params are taken from players.native defaults;
      // static fallback values match the previous hardcoded behaviour.
      //
      videoConfig = {
        fluid:       !!(ntvCfg.fluid       !== undefined ? ntvCfg.fluid       : true),
        fill:        !!(ntvCfg.fill        !== undefined ? ntvCfg.fill        : false),
        responsive:  !!(ntvCfg.responsive  !== undefined ? ntvCfg.responsive  : true),
        playsinline: !!(ntvCfg.playsinline !== undefined ? ntvCfg.playsinline : true),
        preload:     ntvCfg.preload || 'auto',
        sources: [{
          type: srcType,
          src:  videoSrc
        }],
        controlBar: {
          pictureInPictureToggle: false,
          volumePanel: {
            inline: false
          }
        }
      };

      // Apply poster from players.native if no dedicated poster is present
      // on the entry itself (poster resolution happens later in nativePlayer
      // plugin; this sets the initial VJS poster attribute).
      //
      if (ntvCfg.default_poster) {
        videoConfig.poster = ntvCfg.default_poster;
      }

      isDev && logger.info('\n' + `createVideoJsPlayer: native config from players.native: fluid=${videoConfig.fluid}, responsive=${videoConfig.responsive}, preload=${videoConfig.preload}`);
    }

    if (typeof videojs !== 'undefined') {

      // Companion guard: because dispose() is intentionally skipped above
      // (see the "player.off is not a function" note), a previously created
      // player can linger in video.js's global registry under the same id.
      // With the string-based call this returned that STALE player (its DOM
      // element long since replaced via container.innerHTML) instead of a
      // new one. Clearing the slot to null first - video.js's own convention
      // for disposed players - guarantees the element-based call below always
      // yields a fresh, working player, and keeps registry lookups by id
      // (videojs.getPlayer) pointing at the live instance afterwards.
      //
      try {
        const vjsRegistry = (typeof videojs.getPlayers === 'function') ? videojs.getPlayers() : null;
        if (vjsRegistry && vjsRegistry[playerElementId]) {
          isDev && logger.info('\n' + `clearing stale videojs registry entry for id: ${playerElementId}`);
          vjsRegistry[playerElementId] = null;
        }
      } catch (e) {
        isDev && logger.warn('\n' + `videojs registry cleanup skipped: ${e}`);
      }

      // Pass the <video> ELEMENT created above - NOT the id string. When
      // videojs() receives a string it routes through videojs.getPlayer(),
      // which resolves an unknown id via document.querySelector('#' + id).
      // A videoId with a leading digit (e.g. ARD Mediathek GUID filenames:
      // "8eba89d3-..._AVC-1080") is a valid HTML id but an invalid CSS
      // identifier, so that querySelector throws:
      //
      //   SyntaxError: '#8eba...' is not a valid selector
      //
      // Passing the element skips the selector path entirely and works for
      // ANY id (this also covers YouTube ids that start with a digit, e.g.
      // "9bZkp7q19f0", which had the same latent problem). video.js still
      // registers the player under video.id, so later registry lookups via
      // videojs.getPlayer(videoId) / player.id_ keep working unchanged.
      //
      player = videojs(video, videoConfig, function onPlayerReady() {
        isDev && logger.info('\n' + `player ready on id: ${playerElementId}`);

        if (options.onStateChange) {
          const vjsPlayer = this;

          Object.keys(vjsStateEventMap).forEach(function(eventName) {
            vjsPlayer.on(eventName, function() {
              options.onStateChange({ data: vjsStateEventMap[eventName] });
            });
          });
        }

        if (!isYouTube) {
          // Register the nativePlayer plugin so it starts dispatching the
          // 'videoDataResolved', 'videoEnded' and 'videoManualPlay' custom
          // DOM events that the adapter (onReady) and loop mode rely on.
          //
          if (typeof this.nativePlayer === 'function') {
            this.nativePlayer({ title: options.title || '' });
            isDev && logger.info('\n' + `nativePlayer plugin activated on: ${playerElementId}`);
          } else {
            isDev && logger.warn('\n' + `nativePlayer plugin not available - custom events will not be dispatched`);
          }
        }

        // Hard-enforce the minimum video quality on the underlying YT.Player
        // once playback has actually started (ytp parity — ytp.js calls
        // setPlaybackQuality('small') in its onPlayerReady; here 'playing'
        // is the earliest point at which tech_.ytPlayer is guaranteed to be
        // constructed, since the videojs-youtube tech creates the YT.Player
        // asynchronously after the IFrame API is ready). one() keeps it a
        // single shot per created player; the audioOnlyMode/vq creation
        // options above already govern the initial state.
        // Fix multiPlayer new select audio only #2
        // The creation option is now audioPosterMode (+ videoConfig.poster);
        // this quality one-shot is UNCHANGED — it clamps the video data of
        // the hidden playback exactly as before (ytp parity).
        //
        if (isYouTube && _resolveAudioOnlyActive()) {
          const vjsAudioOnlyPlayer = this;
          vjsAudioOnlyPlayer.one('playing', function () {
            _applyYouTubeAudioOnlyQuality(vjsAudioOnlyPlayer);
          });
        }

        if (options.onReady) {
          options.onReady(this);
        }
      });
    }

    previousPlayerId = videoId;

    return player;
  } // END createVideoJsPlayer()

  // ---------------------------------------------------------------------------
  // Helper Classes
  // ---------------------------------------------------------------------------

  /**
   * inputWrapperHandler
   * Supports both YouTube URLs/IDs (routed to YouTube tech) and native
   * local/remote video URLs (routed to HTML5 tech).  YouTube detection
   * uses YOUTUBE_PATTERNS, native video detection uses VIDEO_URL_PATTERNS.
   * The class keeps the same public interface.
   */
  class inputWrapperHandler {
    constructor() {
      this.elements = this.cacheElements();
      this.init();
    }

    cacheElements() {
      return {
        pasteButton:      document.getElementById(_pid('pasteButton')),
        videoUrlInput:    document.getElementById(_pid('videoUrlInput')),
        loadVideoButton:  document.getElementById('loadVideo'),
        clearInputButton: document.getElementById(_pid('playlistInputClear'))
      };
    }

    init() {
      const { pasteButton, videoUrlInput, loadVideoButton, clearInputButton } = this.elements;

      if (pasteButton) {
        pasteButton.addEventListener('click', () => this.handlePasteClick());
      }

      if (loadVideoButton) {
        loadVideoButton.addEventListener('click', () => this.handleLoadVideo());
      }

      if (clearInputButton) {
        clearInputButton.addEventListener('click', () => this.handleClearInput());
      }

      if (videoUrlInput) {
        videoUrlInput.addEventListener('paste', (e) => this.handleDirectPaste(e));
        videoUrlInput.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            this.handleLoadVideo();
          }
        });

        videoUrlInput.addEventListener('input', (e) => {
          this._toggleClearButton(e.target.value);
        });

        videoUrlInput.addEventListener('keydown', (e) => {
          if (e.key === 'Escape') {
            e.preventDefault();
            this.handleClearInput();
            videoUrlInput.blur();
          }
        });
      }
    }

    async handlePasteClick() {
      try {
        if (!navigator.clipboard || !navigator.clipboard.readText) {
          isDev && logger.warn('\n' + MESSAGES.NO_CLIPBOARD_API);
          return;
        }

        window.focus();
        this.elements.videoUrlInput.focus();

        const text = await navigator.clipboard.readText();
        this.elements.videoUrlInput.value = text.trim();
        this._toggleClearButton(text.trim());
        this.processUrl();
      } catch (err) {
        isDev && logger.error('\n' + `Clipboard read error: ${err}`);
      }
    }

    handleDirectPaste(_event) {
      setTimeout(() => {
        this._toggleClearButton(this.elements.videoUrlInput.value);
        this.processUrl();
      }, PASTE_DELAY);
    }

    handleLoadVideo() {
      this.processUrl();
    }

    handleClearInput() {
      this.elements.videoUrlInput.value = '';
      this._toggleClearButton('');
      this.elements.videoUrlInput.focus();
    }

    _toggleClearButton(value) {
      const { clearInputButton } = this.elements;
      if (clearInputButton) {
        clearInputButton.style.display = (value && value.trim()) ? 'inline-flex' : 'none';
      }
    }

    processUrl() {
      const url = this.elements.videoUrlInput.value.trim();
      if (url === "") {
        isDev && logger.warn('\n' + MESSAGES.NO_URL);
        return;
      }

      // Try YouTube first; fall back to native video URL matching.
      //
      const youtubeId = this.extractVideoId(url);
      if (youtubeId) {
        // duplicate check using the YouTube video ID
        if (previousPlayerId !== null && youtubeId === previousPlayerId) {
          isDev && logger.warn('\n' + `player already exists with id: ${youtubeId}`);
          return;
        }
        isDev && logger.info('\n' + `Loading YouTube video with id: ${youtubeId}`);
        this.loadYtVideo(youtubeId);

        // closeEditPlaylist(btn, playerId) — same pattern as closePlaylist.
        // force closinb the playlisz_edit_screen when a playlist is loaded
        //
        const button  = _pid('edit_playlist');
        const playerID = button.replace("edit_playlist_", "");

        // Adapter namespace renamed videoPlayer -> multiPlayer; route the call
        // through the guarded resolver so a missing adapter namespace can no
        // longer crash the load path (see _adapterCloseEditPlaylist).
        // Original (deprecated, preserved for reference):
        // j1.adapter.videoPlayer.closeEditPlaylist(button, playerID);
        //
        _adapterCloseEditPlaylist(button, playerID);

        // update the playListButton (to be enabled when a playlist is loaded)
        //
        playlistManager._updateTogglePlaylistButton();   

        return;
      }

      // extractVideoSrc returns the raw URL/path for native video files.
      //
      const videoSrc = this.extractVideoSrc(url);

      // Apply the same sanitize embedRunVideo() uses so this duplicate-check id
      // matches previousPlayerId (set from embedRunVideo's cleaned id). Without
      // it, a native id containing an invalid char (e.g. a dot) would be compared
      // unsanitized here vs. sanitized there and never match, silently defeating
      // the "player already exists" guard. null/'' pass through unchanged
      // (sanitizeVideoId returns falsy input as-is).
      //
      const videoId  = videoSrc
        ? sanitizeVideoId(videoSrc.split('?')[0].split('/').pop().replace(/\.[^.]+$/, '') || videoSrc)
        : null;

      if (previousPlayerId !== null && videoId === previousPlayerId) {
        isDev && logger.warn('\n' + `player already exists with id: ${videoId}`);
        return;
      }

      if (videoSrc) {
        isDev && logger.info('\n' + `Loading video from src: ${videoSrc}`);
        this.loadVideo(videoSrc);

        //  closeEditPlaylist(btn, playerId) — same pattern as closePlaylist.
        // force closinb the playlisz_edit_screen when a playlist is loaded
        //
        const button  = _pid('edit_playlist');
        const playerID = button.replace("edit_playlist_", "");

        // Adapter namespace renamed videoPlayer -> multiPlayer; route the call
        // through the guarded resolver so a missing adapter namespace can no
        // longer crash the load path (see _adapterCloseEditPlaylist).
        // Original (deprecated, preserved for reference):
        // j1.adapter.videoPlayer.closeEditPlaylist(button, playerID);
        //
        _adapterCloseEditPlaylist(button, playerID);

        // update the playListButton (to be enabled when a playlist is loaded)
        //
        playlistManager._updateTogglePlaylistButton();
      } else {
        isDev && logger.error('\n' + MESSAGES.INVALID_URL);
      }
    } // END processUrl()

    /**
     * extractVideoId
     * Detects YouTube URLs and bare video IDs using YOUTUBE_PATTERNS.
     * Returns the 11-character video ID on a match, otherwise returns null.
     * @param {string} url - raw input from the URL field
     * @returns {string|null} - YouTube video ID or null
     */
    extractVideoId(url) {
      for (const pattern of YOUTUBE_PATTERNS) {
        const match = (url || '').match(pattern);
        if (match) {
          return match[1];
        }
      }
      return null;
    }

    /**
     * loadYtVideo
     * Loads a YouTube video by ID through the YouTube tech path.
     * @param {string} videoId - YouTube video ID
     */
    loadYtVideo(videoId) {
      isDev && logger.info('\n' + `Loading YouTube video with id: ${videoId}`);

      const event = new CustomEvent('videoLoad', {
        detail: { videoId },
        bubbles: true
      });

      document.dispatchEvent(event);

      document.addEventListener('videoPlayingStarted', () => {
        this.elements.videoUrlInput.value = '';
        this._toggleClearButton('');
        isDev && logger.debug('\n' + 'inputWrapperHandler: input cleared after video started');
      }, { once: true });

      embedRunVideo(videoId);
    }

    /**
     * extractVideoSrc
     * Replaces extractVideoId (YouTube).  Returns the trimmed URL/path when
     * it matches VIDEO_URL_PATTERNS, otherwise returns null.
     * A bare value with no extension is also accepted as a fallback so that
     * relative filenames without dots still go through to the player.
     * @param {string} url - raw input from the URL field
     * @returns {string|null} - validated video src or null
     */
    extractVideoSrc(url) {
      const trimmed = (url || '').trim();
      if (!trimmed) return null;

      for (const pattern of VIDEO_URL_PATTERNS) {
        if (pattern.test(trimmed)) {
          return trimmed;
        }
      }

      // Accept any non-empty string as a last resort so that unusual but
      // valid server-relative URLs (e.g. /stream/live) still work.
      //
      return trimmed || null;
    }

    /**
     * loadVideo
     * Renamed from loadYtVideo (YouTube) to loadVideo (native).
     * Dispatches 'videoLoad' with the video src URL instead of a YouTube ID.
     * @param {string} videoSrc - validated video URL/path
     */
    loadVideo(videoSrc) {
      isDev && logger.info('\n' + `Loading video from: ${videoSrc}`);

      const event = new CustomEvent('videoLoad', {
        detail: { videoSrc },
        bubbles: true
      });

      document.dispatchEvent(event);

      document.addEventListener('videoPlayingStarted', () => {
        this.elements.videoUrlInput.value = '';
        this._toggleClearButton('');
        isDev && logger.debug('\n' + 'inputWrapperHandler: input cleared after video started');
      }, { once: true });

      embedRunVideo(videoSrc);
    }
  }

  // ---------------------------------------------------------------------------
  // playlistIOHandler
  // ---------------------------------------------------------------------------
  class playlistIOHandler {

    constructor(options) {

      // Use the scoped video_container_{{player.id}} id instead of the
      // class selector '.video-container' so the correct player container is
      // captured when multiple players exist on the same page.
      //
      container     = document.getElementById(_pid('video_container'));
      containerHTML = container ? container.innerHTML : '';

      this._videoPlayerOptions = options || null;
      this.elements            = this.cacheElements();
      this.init();
    }

    cacheElements() {
      return {
        importButton:         document.getElementById(_pid('playlistImportButton')),
        exportButton:         document.getElementById(_pid('playlistExportButton')),
        importFile:           document.getElementById(_pid('playlistImportFile')),
        clearButton:          document.getElementById(_pid('playlistClearButton')),
        serverPlaylistSelect: document.getElementById(_pid('serverPlaylistSelect')),
        serverPlaylistLoad:   document.getElementById(_pid('serverPlaylistLoadButton')),
        serverSelectClear:    document.getElementById(_pid('playlistSelectClear'))
      };
    }

    init() {
      const { importButton, exportButton, importFile, clearButton, serverPlaylistSelect, serverPlaylistLoad, serverSelectClear } = this.elements;

      if (importButton) {
        importButton.addEventListener('click', () => this.handleImport());
      }

      if (exportButton) {
        exportButton.addEventListener('click', () => this.handleExport());
      }

      if (importFile) {
        importFile.addEventListener('change', (e) => this.handleFileSelected(e));
      }

      if (clearButton) {
        clearButton.addEventListener('click', () => this.handleClear());
      }

      if (serverPlaylistLoad) {
        serverPlaylistLoad.addEventListener('click', () => this.handleLoadFromServer());
      }

      if (serverSelectClear) {
        serverSelectClear.addEventListener('click', () => this.handleClearServerSelect());
      }

      if (serverPlaylistSelect) {
        serverPlaylistSelect.addEventListener('change', () => {
          this._toggleServerSelectClear(serverPlaylistSelect.value);
        });
        this._serverSelectChangeBound = true;
      }

      this.loadPlaylistIndex();

      isDev && logger.info('\n' + 'playlistManager: IOHandler initialized');
    }

    handleImport() {
      const { importFile } = this.elements;
      if (importFile) {
        importFile.value = '';
        importFile.click();
      }
    }

    // called on handleImport()
    //
    handleFileSelected(event) {
      const options = this._videoPlayerOptions;
      const file    = event.target.files[0];

      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);

          const hasMetaData = (data && typeof data === 'object' && data.backup_date) ? true : false;
          const playlist    = hasMetaData ? data.playlist : data;

          if (hasMetaData) {
            const bkupDate = data.backup_date.replace('T', ' ').substring(0, 16);
            isDev && logger.info('\n' + `import playlist from backup file of date: ${bkupDate}`);
          }

          playlist.forEach(entry => playlistManager._normalizeEntry(entry));

          if (playlistManager._mergeMode) {
            const existing    = playlistManager.load() || [];
            const existingIds = new Set(existing.map(e => e.videoId));
            const newEntries  = playlist.filter(e => !existingIds.has(e.videoId));
            const merged      = existing.concat(newEntries);
            playlistManager.save(merged);
            isDev && logger.debug('\n' + `merged ${newEntries.length} new items (${playlist.length - newEntries.length} duplicates skipped) from file`);
          } else {
            playlistManager.save(playlist);
          }

          const loaded     = playlistManager.load() || [];
          const hasSeries  = loaded.some(entry => entry.series > 0);
          const hasEpisode = loaded.some(entry => entry.episode > 0);

          if (hasSeries || hasEpisode) {
            // Match the player-scoped sort <select> id so the imported playlist's
            // auto-sort reflects in THIS player's own control.
            //
            const sortSelect = document.getElementById(_pid('playlistSortSelect'));
            if (sortSelect) {
              sortSelect.value = 'episode';
            }
            playlistManager.sortPlaylist('episode');
            isDev && logger.info('\n' + 'playlistManager: series/episode entries detected - auto-sorted by episode');

            // Keep the once-only latch of the derived default in sync: the
            // criterion for THIS content has just been decided explicitly, so
            // a later silent resolution must not second-guess it.
            //
            playlistManager._defaultSortResolved = true;
          }

          // Counterpart of the branch above, which only ever switches TO
          // 'episode' and never back: importing a plain playlist while
          // 'episode' was still active (from a previously loaded series
          // playlist) left the new content sorted by an episode number none
          // of its entries has. The imported content now always decides the
          // display order — here: 'watchDate' (Date, newest first).
          //
          // The load is an explicit user action on new content, so a stored
          // sort choice does NOT win over it — hence `false`.
          //
          if (!hasSeries && !hasEpisode) {
            playlistManager.applyDefaultSortCriterion(loaded, false);
          }

          if (!playlistManager._searchIndex && !playlistManager._loadSearchIndex()) {
            isDev && logger.info('\n' + 'playlistManager: build search index from scratch');
            playlistManager.buildSearchIndex();
          }

          const overlayExists = document.getElementById(_pid('emptyPlayerOverlay'));
          if (!overlayExists) {
            isDev && logger.debug('\n' + `Restoring container and overlay for new video`);
            container.innerHTML = containerHTML;
          }

          // closeEditPlaylist(btn, playerId) — same pattern as closePlaylist.
          // force closinb the playlisz_edit_screen when a playlist is loaded
          //
          const button  = _pid('edit_playlist');
          const playerID = button.replace("edit_playlist_", "");

          // Adapter namespace renamed videoPlayer -> multiPlayer; route the call
          // through the guarded resolver so a missing adapter namespace can no
          // longer crash the load path (see _adapterCloseEditPlaylist).
          // Original (deprecated, preserved for reference):
          // j1.adapter.videoPlayer.closeEditPlaylist(button, playerID);
          //
          _adapterCloseEditPlaylist(button, playerID);

          // update the playListButton (to be enabled when a playlist is loaded)
          //
          playlistManager._updateTogglePlaylistButton();
          playlistManager.renderCurrent();

          // Backfill posters for imported native-video entries that arrived
          // without one. Runs asynchronously after the initial render so the
          // list appears immediately (with DEFAULT_POSTER placeholders) and the
          // real thumbnails fill in as each frame is captured.
          //
          playlistManager.generateMissingNativePosters()
            .catch((e) => { isDev && logger.warn('\n' + `poster backfill (file import) failed: ${e}`); });

          // When a playlist file is imported here, load the first video of the
          // (display-ordered) list into the player and start it in the 'paused'
          // state. The display order is reproduced by applying the active sort
          // criterion (_currentSort) to a fresh copy of the stored playlist —
          // the same ordering renderCards()/renderPlaylist() apply — so the
          // entry chosen here matches the first row the user sees. Going through
          // the playlistManager.embedRunVideo(videoId, 'pause') wrapper resolves
          // the entry's src and, via playerMode === 'pause', pauses playback
          // right after start (see the autoplay branch in embedRunVideo). The
          // 'pause' mode (instead of playEntry()) is deliberate: it does NOT set
          // _startedFromPlaylist, so the playlist panel is left open after load.
          // As with #26, the paused-after-start behaviour depends on the
          // autoplay config being enabled.
          //
          const currentList = playlistManager.load() || [];

          playlistManager._applySortOrder(currentList);

          const firstEntry = currentList[0];
          if (firstEntry && firstEntry.videoId) {
            isDev && logger.info('\n' + `playlistManager: loading first imported-playlist video in paused state (videoId: ${firstEntry.videoId})`);
            playlistManager.embedRunVideo(firstEntry.videoId, 'pause');
          } else {
            isDev && logger.warn('\n' + 'playlistManager: no playable first entry found after playlist file import');
          }

          // jadams, 2026-07-27: disable scrolling
          // const videoTitleElement = document.getElementById(_pid('videoplayer_playlist_parent'));
          // // const videoTitleElement = document.getElementById('video_title');
          // if (videoTitleElement) {
          //   scrollToElement(videoTitleElement);
          // }

        } catch (err) {
          logger.error('\n' + `import from file failed: ${err}`);
        }
      };

      reader.readAsText(file);
    }

    handleExport() {
      playlistManager.exportToFile();
    }

    handleClear() {
      const opts = this._videoPlayerOptions;

      // jadams, 2026-06-06, reload should made unnecessary. Requures
      // additional checks for the toggle_playlist button if a playlist
      // is loaded/available
      //
      // "Clear with backup": trigger a downloadable safety backup of the
      // current playlist BEFORE it is removed. The anchor download is
      // initiated synchronously, so it is committed by the browser before
      // the subsequent clearPlaylist()/location.reload() runs. backupToFile()
      // is a no-op (returns false, no download) when the playlist is already
      // empty, matching clearPlaylist()'s own empty-guard.
      //
      playlistManager.backupToFile();

      const reload  = true;
      const cleared = playlistManager.clearPlaylist();
      if (cleared && reload) {
        location.reload();
      }
    }

    handleClearServerSelect() {
      const { serverPlaylistSelect } = this.elements;
      if (serverPlaylistSelect) {
        serverPlaylistSelect.selectedIndex = 0;
        this._toggleServerSelectClear('');
        isDev && logger.info('\n' + 'playlistManager: server playlist selection cleared');
      }
    }

    _toggleServerSelectClear(value) {
      const { serverSelectClear } = this.elements;
      if (serverSelectClear) {
        serverSelectClear.style.display = (value && value.trim()) ? 'inline-flex' : 'none';
      }
    }

    loadPlaylistIndex(attempt = 1, maxAttempts = 5) {
      let selectEl = this.elements.serverPlaylistSelect;
      if (!selectEl) {
        selectEl = document.getElementById(_pid('serverPlaylistSelect'));
        if (selectEl) {
          this.elements.serverPlaylistSelect = selectEl;

          if (!this._serverSelectChangeBound) {
            selectEl.addEventListener('change', () => {
              this._toggleServerSelectClear(selectEl.value);
            });
            this._serverSelectChangeBound = true;
          }
        }
      }

      if (!selectEl) {
        if (attempt <= maxAttempts) {
          const delay = 500 * attempt;
          isDev && logger.warn('\n' + `loadPlaylistIndex: serverPlaylistSelect not in DOM, retry ${attempt}/${maxAttempts} in ${delay}ms`);
          setTimeout(() => this.loadPlaylistIndex(attempt + 1, maxAttempts), delay);
        } else {
          logger.error('\n' + 'loadPlaylistIndex: serverPlaylistSelect element not found after ' + maxAttempts + ' attempts');
        }
        return;
      }

      fetch(PLAYLIST_INDEX)
        .then(res => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then(index => {
          if (!Array.isArray(index) || index.length === 0) {
            isDev && logger.warn('\n' + 'playlist index is empty or not an array');
            return;
          }

          selectEl.innerHTML = `
            <option value="" disabled selected>
              Select a playlist to import ...
            </option>
          `;

          index.forEach(entry => {
            const option       = document.createElement('option');
            option.value       = entry.file;
            option.textContent = entry.name || entry.file;
            selectEl.appendChild(option);
          });

          isDev && logger.debug('\n' + `playlistManager: loaded ${index.length} playlists from index`);
        })
        .catch(err => {
          logger.error('\n' + `playlistManager: failed to load playlist index: ${err}`);

          if (attempt < maxAttempts) {
            const delay = 1000 * attempt;
            isDev && logger.warn('\n' + `loadPlaylistIndex: fetch failed, retry ${attempt}/${maxAttempts} in ${delay}ms`);
            setTimeout(() => this.loadPlaylistIndex(attempt + 1, maxAttempts), delay);
          } else {
            logger.error('\n' + 'loadPlaylistIndex: all ' + maxAttempts + ' attempts failed - playlist index not loaded');
          }
        });
    }

    async handleLoadFromServer() {
      const { serverPlaylistSelect }  = this.elements;
      const selectedFile              = serverPlaylistSelect ? serverPlaylistSelect.value : '';

      if (!selectedFile) {
        isDev && logger.warn('\n' + 'playlistManager: no server playlist selected');
        return;
      }

      const url = `${PLAYLIST_URL_BASE}/${selectedFile}`;
      isDev && logger.info('\n' + `playlistManager: loading server playlist from: ${url}`);

      await playlistManager.importFromUrlAsync(url);

      const loaded     = playlistManager.load() || [];
      const hasSeries  = loaded.some(entry => entry.series > 0);
      const hasEpisode = loaded.some(entry => entry.episode > 0);

      if (hasSeries || hasEpisode) {

        // multiPlayer MultiInstance #4
        // Match the player-scoped sort <select> id (server-playlist load path).
        //
        const sortSelect = document.getElementById(_pid('playlistSortSelect'));
        if (sortSelect) {
          sortSelect.value = 'episode';
        }
        playlistManager.sortPlaylist('episode');
        isDev && logger.debug('\n' + 'playlistManager: series/episode entries detected - auto-sorted by episode');

        // Keep the once-only latch of the derived default in sync (see the
        // file-import path for the rationale).
        //
        playlistManager._defaultSortResolved = true;
      }

      // Counterpart of the branch above (server-playlist load path): a plain
      // playlist loaded after a series playlist now falls back to the date
      // default instead of keeping the stale 'episode' criterion.
      //
      if (!hasSeries && !hasEpisode) {
        playlistManager.applyDefaultSortCriterion(loaded, false);
      }

      if (!playlistManager._searchIndex && !playlistManager._loadSearchIndex()) {
        isDev && logger.debug('\n' + 'playlistManager: build search index from scratch');
        playlistManager.buildSearchIndex();
      }

      serverPlaylistSelect.value = '';

      const overlayExists = document.getElementById(_pid('emptyPlayerOverlay'));
      if (!overlayExists) {
        isDev && logger.debug('\n' + `Restoring container and overlay for new video`);
        container.innerHTML = containerHTML;
      }

      //  closeEditPlaylist(btn, playerId) — same pattern as closePlaylist.
      // force closinb the playlisz_edit_screen when a playlist is loaded
      const button  = _pid('edit_playlist');
      const playerID = button.replace("edit_playlist_", "");

      // Adapter namespace renamed videoPlayer -> multiPlayer; route the call
      // through the guarded resolver so a missing adapter namespace can no
      // longer crash the load path (see _adapterCloseEditPlaylist).
      // Original (deprecated, preserved for reference):
      // j1.adapter.videoPlayer.closeEditPlaylist(button, playerID);
      //
      _adapterCloseEditPlaylist(button, playerID);

      // update the playListButton (to be enabled when a playlist is loaded)
      //
      playlistManager._updateTogglePlaylistButton();

      // Backfill posters for server-loaded native-video entries that arrived
      // without one (mirror of the handleFileSelected() backfill). Runs
      // asynchronously so the list appears immediately and the real thumbnails
      // fill in as each frame is captured off-screen.
      //
      playlistManager.generateMissingNativePosters()
        .catch((e) => { isDev && logger.warn('\n' + `poster backfill (server load) failed: ${e}`); });

      // When a playlist is loaded from the server, load the first video of the
      // (display-ordered) list into the player and start it in the 'paused'
      // state. The display order is reproduced by applying the active sort
      // criterion (_currentSort) to a fresh copy of the stored playlist — the
      // same ordering renderCards()/renderPlaylist() apply — so the entry
      // chosen here matches the first row the user sees. Going through the
      // playlistManager.embedRunVideo(videoId, 'pause') wrapper resolves the
      // entry's src and, via playerMode === 'pause', pauses playback right
      // after start (see the autoplay branch in embedRunVideo). The 'pause'
      // mode (instead of playEntry()) is deliberate: it does NOT set
      // _startedFromPlaylist, so the playlist panel is left open after load.
      //
      const currentList = playlistManager.load() || [];
      playlistManager._applySortOrder(currentList);
      const firstEntry = currentList[0];
      if (firstEntry && firstEntry.videoId) {
        isDev && logger.info('\n' + `playlistManager: loading first server-playlist video in paused state (videoId: ${firstEntry.videoId})`);
        playlistManager.embedRunVideo(firstEntry.videoId, 'pause');
      } else {
        isDev && logger.warn('\n' + 'playlistManager: no playable first entry found after server playlist load');
      }

      // jadams, 2026-07-27: disable scrolling
      // const videoTitleElement = document.getElementById(_pid('videoplayer_playlist_parent'));
      // if (videoTitleElement) {
      //   scrollToElement(videoTitleElement);
      // }

    }
  } // END playlistIOHandler

  // ---------------------------------------------------------------------------
  // playlistSearchHandler (unchanged)
  // ---------------------------------------------------------------------------
  class playlistSearchHandler {

    constructor() {
      this.elements     = this.cacheElements();
      this._debounceTimer = null;
      this.init();
    }

    cacheElements() {
      return {
        searchInput:  document.getElementById(_pid('playlistSearchInput')),
        clearButton:  document.getElementById(_pid('playlistSearchClear')),
        resultCount:  document.getElementById(_pid('playlistSearchResultCount'))
      };
    }

    init() {
      const { searchInput, clearButton } = this.elements;

      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          this._toggleClearButton(e.target.value);
          this._debounceSearch(e.target.value, 300);
        });

        searchInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            clearTimeout(this._debounceTimer);
            this._executeSearch(searchInput.value);
          }
          if (e.key === 'Escape') {
            e.preventDefault();
            this._clearSearch();
            searchInput.blur();
          }
        });
      }

      if (clearButton) {
        clearButton.addEventListener('click', () => {
          this._clearSearch();
          if (searchInput) searchInput.focus();
        });
      }

      isDev && logger.info('\n' + 'playlistManager: searchHandler initialized');
    }

    _debounceSearch(query, delayMs) {
      clearTimeout(this._debounceTimer);
      this._debounceTimer = setTimeout(() => {
        this._executeSearch(query);
      }, delayMs);
    }

    _toggleClearButton(value) {
      const { clearButton } = this.elements;
      if (clearButton) {
        clearButton.style.display = (value && value.trim()) ? 'inline-flex' : 'none';
      }
    }

    _executeSearch(query) {
      const { searchInput, clearButton, resultCount } = this.elements;
      const trimmed = (query || '').trim();

      if (!trimmed) {
        this._clearSearch();
        return;
      }

      const results = playlistManager.searchPlaylist(trimmed);

      if (resultCount) {
        resultCount.textContent = `${results.length} item${results.length !== 1 ? 's' : ''} found`;        
        resultCount.style.display = 'inline';
      }

      if (clearButton) {
        clearButton.style.display = 'inline-flex';
      }
    }

    _clearSearch() {
      const { searchInput, clearButton, resultCount } = this.elements;

      if (searchInput) {
        searchInput.value = '';
      }

      if (clearButton) {
        clearButton.style.display = 'none';
      }

      if (resultCount) {
        resultCount.textContent = '';
        resultCount.style.display = 'none';
      }

      playlistManager.clearSearch();
    }

  } // END playlistSearchHandler

  // ---------------------------------------------------------------------------
  // playlistModeSwitchHandler
  // ---------------------------------------------------------------------------
  class playlistModeSwitchHandler {

    constructor() {
      this.elements = this.cacheElements();
      this.init();
    }

    cacheElements() {

      // Resolve the title bar within THIS player's own #playlist_screen panel
      // (falling back to #playlistBlock) instead of the first
      // '.playlist-block-title' in the whole document. On a multi-player page the
      // bare document.querySelector() always returned player 1's title bar, so a
      // later player's handler kept operating on player 1 and never populated its
      // own #playlistBlock_<id> — which is exactly why the second player's
      // playlist block stayed empty (mode/merge switches absent). _pid() scopes
      // the lookup to the owning player; the page-global querySelector remains as
      // the single-player fallback when no player id is set.
      //
      const _scope = document.getElementById(_pid('playlist_screen')) || document.getElementById(_pid('playlistBlock'));
      return {
        titleBar:       _scope ? _scope.querySelector('.playlist-block-title') : document.querySelector('.playlist-block-title'),
        listModeSwitch: null
      };
    }

    init() {
      const { titleBar } = this.elements;
      if (!titleBar) {
        isDev && logger.warn('\n' + 'playlistModeSwitchHandler: .playlist-block-title not found');
        return;
      }

      // Player-scope the switch id so each player creates and owns its own
      // control. With the bare id, once player 1 had created #playlistModeSwitch
      // the lookup here found it for every later player, took the "reuse existing
      // static switch" branch, and never built a switch in the later player's
      // title bar. _pid('playlistModeSwitch') keys the control to this player.
      //
      let listModeSwitch = document.getElementById(_pid('playlistModeSwitch'));

      if (!listModeSwitch) {
        listModeSwitch            = document.createElement('div');
        listModeSwitch.id         = _pid('playlistModeSwitch');
        listModeSwitch.className  = 'switch not-spoken';

        // Player-scope the checkbox id too (it is read back below via
        // getElementById(_pid('playlistMode'))). The label wraps the input,
        // so the label/for association is preserved without a `for` attribute.
        //
        listModeSwitch.innerHTML  = `
          <label>
            <input id="${_pid('playlistMode')}" type="checkbox" name="playlistMode" checked>
            <span class="bmd-switch-track"></span>
            Cards
          </label>
        `;

        const sortSelect = document.getElementById(_pid('playlistSortSelect'));
        if (sortSelect) {
          titleBar.insertBefore(listModeSwitch, sortSelect);
        } else {
          titleBar.appendChild(listModeSwitch);
        }

        isDev && logger.debug('\n' + 'playlistModeSwitchHandler: created dynamic switch');
      } else {
        isDev && logger.debug('\n' + 'playlistModeSwitchHandler: reusing existing static switch');
      }

      const checkbox = document.getElementById(_pid('playlistMode'));
      if (!checkbox) {
        logger.error('\n' + 'playlistModeSwitchHandler: checkbox #playlistMode not found');
        return;
      }

      // jadams
      checkbox.checked = (playlistManager._displayMode === 'cards');

      checkbox.addEventListener('change', (e) => {

        // Player-scope both mode writes so a toggle persists only THIS player's
        // preference. _pid('playlistMode') matches the constructor read and the
        // checkbox id created in init() (fix #4), keeping key and DOM in lockstep.
        //
        if (e.target.checked) {
          playlistManager._displayMode = 'cards';
          localStorage.setItem(_pid('playlistMode'), 'cards');
          isDev && logger.info('\n' + 'playlistModeSwitchHandler: switched to card mode');
        } else {
          playlistManager._displayMode = 'list';
          localStorage.setItem(_pid('playlistMode'), 'list');
          isDev && logger.info('\n' + 'playlistModeSwitchHandler: switched to list mode');
        }
        playlistManager.renderCurrent();
      });

      this.elements.listModeSwitch = listModeSwitch;

      const data = playlistManager.load() || [];
      if (data.length === 0) {
        listModeSwitch.style.display = 'none';
      }

      isDev && logger.info('\n' + 'playlistModeSwitchHandler: modeSwitchHandler initialized');
    }

  } // END playlistModeSwitchHandler

  // ---------------------------------------------------------------------------
  // playlistMergeSwitchHandler
  // ---------------------------------------------------------------------------
  class playlistMergeSwitchHandler {

    constructor(options) {
      this._videoPlayerOptions = options || null;
      this.elements            = this.cacheElements();
      this.init();
    }

    cacheElements() {

      // Same per-player title-bar scoping as playlistModeSwitchHandler
      // See the note there. Without it the merge switch was built into
      // (or reused from) player's title bar and never appeared for
      // later players.
      //
      const _scope = document.getElementById(_pid('playlist_screen')) || document.getElementById(_pid('playlistBlock'));
      return {
        titleBar:        _scope ? _scope.querySelector('.playlist-block-title') : document.querySelector('.playlist-block-title'),
        mergeModeSwitch: null
      };
    }

    init() {
      const opts = this._videoPlayerOptions;
      if (opts === null || !opts.enabled) {
        return;
      }

      const { titleBar } = this.elements;
      if (!titleBar) {
        isDev && logger.warn('\n' + 'playlistMergeSwitchHandler: .playlist-block-title not found');
        return;
      }

      let mergeModeSwitch = document.getElementById(_pid('playlistMergeSwitch'));

      if (!mergeModeSwitch) {
        mergeModeSwitch           = document.createElement('div');
        mergeModeSwitch.id        = _pid('playlistMergeSwitch');
        mergeModeSwitch.className = 'switch not-spoken';
        mergeModeSwitch.innerHTML = `
          <label>
            <input id="${_pid('mergeMode')}" type="checkbox" name="mergeMode">
            <span class="bmd-switch-track"></span>
            Merge
          </label>
        `;

        const listModeSwitch = document.getElementById(_pid('playlistModeSwitch'));
        const sortSelect     = document.getElementById(_pid('playlistSortSelect'));

        if (listModeSwitch && listModeSwitch.nextSibling) {
          titleBar.insertBefore(mergeModeSwitch, listModeSwitch.nextSibling);
        } else if (sortSelect) {
          titleBar.insertBefore(mergeModeSwitch, sortSelect);
        } else {
          titleBar.appendChild(mergeModeSwitch);
        }

        isDev && logger.debug('\n' + 'playlistMergeSwitchHandler: created dynamic switch');
      } else {
        isDev && logger.debug('\n' + 'playlistMergeSwitchHandler: reusing existing static switch');
      }

      const checkbox = document.getElementById(_pid('mergeMode'));

      if (!checkbox) {
        logger.error('\n' + 'playlistMergeSwitchHandler: checkbox #mergeMode not found');
        return;
      }

      checkbox.checked = playlistManager._mergeMode;
      checkbox.addEventListener('change', (e) => {

        // Player-scope both merge writes so a toggle persists only THIS player's
        // preference. _pid('mergeMode') matches the constructor read and the
        // checkbox id created in init() (fix #4), keeping key and DOM in lockstep.
        //
        if (e.target.checked) {
          playlistManager._mergeMode = true;

          localStorage.setItem(_pid('mergeMode'), 'true');
          isDev && logger.debug('\n' + 'playlistMergeSwitchHandler: merge mode enabled');
        } else {
          playlistManager._mergeMode = false;

          localStorage.setItem(_pid('mergeMode'), 'false');
          isDev && logger.debug('\n' + 'playlistMergeSwitchHandler: merge mode disabled');
        }
        playlistManager.renderCurrent();
      });

      this.elements.mergeModeSwitch = mergeModeSwitch;

      const data = playlistManager.load() || [];
      if (data.length === 0) {
        mergeModeSwitch.style.display = 'none';
      }

      isDev && logger.info('\n' + 'playlistManager: mergeSwitchHandler initialized');
    }

  } // END playlistMergeSwitchHandler

  // ---------------------------------------------------------------------------
  // playlistLoopSwitchHandler
  // ---------------------------------------------------------------------------
  class playlistLoopSwitchHandler {

    constructor(options) {
      this._videoPlayerOptions = options || null;
      this.elements            = this.cacheElements();
      this.init();
    }

    cacheElements() {
      const _scope = document.getElementById(_pid('playlist_screen')) || document.getElementById(_pid('playlistBlock'));
      return {
        titleBar:       _scope ? _scope.querySelector('.playlist-block-title') : document.querySelector('.playlist-block-title'),
        loopModeSwitch: null
      };
    }

    init() {
      const opts = this._videoPlayerOptions;

      if (opts === null || !opts.enabled) {
        return;
      }

      const { titleBar } = this.elements;
      if (!titleBar) {
        isDev && logger.warn('\n' + 'playlistLoopSwitchHandler: .playlist-block-title not found');
        return;
      }

      loopConfigEnabled = !!(opts.playlist && opts.playlist.loop && opts.playlist.loop.enabled);
      pipConfigEnabled  = !!(opts.playlist && opts.playlist.loop && opts.playlist.loop.pip);

      if (!loopConfigEnabled) {
        isDev && logger.debug('\n' + 'playlistLoopSwitchHandler: loop mode disabled by config, skipping init');
        return;
      }

      let loopModeSwitch = document.getElementById(_pid('playlisLoopSwitch'));

      if (!loopModeSwitch) {
        loopModeSwitch            = document.createElement('div');
        loopModeSwitch.id         = _pid('playlisLoopSwitch');
        loopModeSwitch.className  = 'switch not-spoken';
        loopModeSwitch.innerHTML  = `
          <label>
            <input id="${_pid('loopMode')}" type="checkbox" name="loopMode">
            <span class="bmd-switch-track"></span>
            Loop
          </label>
        `;

        const mergeModeSwitch = document.getElementById(_pid('playlistMergeSwitch'));
        const sortSelect      = document.getElementById(_pid('playlistSortSelect'));

        if (mergeModeSwitch && mergeModeSwitch.nextSibling) {
          titleBar.insertBefore(loopModeSwitch, mergeModeSwitch.nextSibling);
        } else if (sortSelect) {
          titleBar.insertBefore(loopModeSwitch, sortSelect);
        } else {
          titleBar.appendChild(loopModeSwitch);
        }

        isDev && logger.debug('\n' + 'playlistLoopSwitchHandler: created dynamic switch');
      } else {
        isDev && logger.debug('\n' + 'playlistLoopSwitchHandler: reusing existing static switch');
      }

      const checkbox = document.getElementById(_pid('loopMode'));
      if (!checkbox) {
        logger.error('\n' + 'playlistLoopSwitchHandler: checkbox #loopMode not found');
        return;
      }

      checkbox.checked = playlistManager._loopEnabled;

      checkbox.addEventListener('change', (e) => {

        // Player-scope both loop writes so a toggle persists only THIS
        // player's preference. _pid('playlistLoop') matches the constructor
        // read and the loop checkbox id created in init() (fix #4), key
        // and DOM in lockstep.
        //
        if (e.target.checked) {
          playlistManager._loopEnabled = true;
          localStorage.setItem(_pid('playlistLoop'), 'true');
          isDev && logger.debug('\n' + 'playlistLoopSwitchHandler: loop mode enabled');
        } else {
          playlistManager._loopEnabled = false;
          localStorage.setItem(_pid('playlistLoop'), 'false');
          isDev && logger.debug('\n' + 'playlistLoopSwitchHandler: loop mode disabled');
        }
      });

      this.elements.loopModeSwitch = loopModeSwitch;

      const data      = playlistManager.load() || [];
      const allSeries = data.length > 0 && data.every(e => e.series && e.series >= 1);
      if (!allSeries) {
        loopModeSwitch.style.display = 'none';
        if (playlistManager._loopEnabled) {
          playlistManager._loopEnabled = false;

          localStorage.setItem(_pid('playlistLoop'), 'false');
        }
        checkbox.checked = false;
      }

      isDev && logger.info('\n' + 'playlistManager: loopSwitchHandler initialized');
    }

  } // END playlistLoopSwitchHandler

  // ---------------------------------------------------------------------------
  // audioOnlySwitchHandler
  //
  // Builds the per-player title-bar switch #audioOnlySwitch_<id> that toggles
  // AUDIO ONLY playback for YouTube entries (see the feature note at
  // _isYouTubeEntry/_resolveAudioOnlyActive). Structure follows
  // playlistModeSwitchHandler/playlistMergeSwitchHandler: player-scoped title
  // bar resolution, player-scoped control/checkbox ids, localStorage-persisted
  // preference. The switch is inserted directly AFTER #playlistModeSwitch_<id>
  // (requirement), with the sort <select> and plain append as the fallbacks
  // every sibling handler uses.
  //
  // Unlike mode/merge, the handler takes NO constructor options: it is built
  // lazily by renderCurrent() (see the download-all precedent of export #1),
  // at which point setAdapterOptions() has long run, so the effective option
  // chain is resolved internally via _resolveVideoPlayerEffectiveOptions().
  // An adapter MAY still construct it explicitly (exported on the instance
  // API); the getElementById() reuse branch keeps a double build harmless,
  // and the renderCurrent() guard flag prevents a second listener.
  // ---------------------------------------------------------------------------
  class audioOnlySwitchHandler {

    constructor() {
      this.elements = this.cacheElements();
      this.init();
    }

    cacheElements() {
      // Same per-player title-bar scoping as playlistModeSwitchHandler
      // (MultiInstance fix #4) — see the note there.
      //
      const _scope = document.getElementById(_pid('playlist_screen')) || document.getElementById(_pid('playlistBlock'));

      return {
        titleBar:        _scope ? _scope.querySelector('.playlist-block-title') : document.querySelector('.playlist-block-title'),
        audioOnlySwitch: null
      };
    }

    init() {
      const opts = _resolveVideoPlayerEffectiveOptions();
      if (opts === null || !opts.enabled) {
        return;
      }

      // ui_elements.audioOnlySwitch — absent-key default TRUE (same rule as
      // the export switches of #1: existing configurations need no change).
      //
      const ui = (typeof opts.ui_elements === 'object' && opts.ui_elements)
        ? opts.ui_elements
        : {};

      // This early return is exactly the state the new key covers: no switch
      // is built, so nothing can seed or persist a state interactively. From
      // here on the audio-only mode of this player is stated declaratively by
      // set_audio_only (YAML chain), which _resolveAudioOnlyActive() applies
      // ahead of the localStorage/audio_only chain — see the feature note at
      // _isAudioOnlySwitchAvailable(). No code change is required here; the
      // return stays as it was.
      //
      if (ui.audioOnlySwitch === false) {
        isDev && logger.debug('\n' + 'audioOnlySwitchHandler: disabled by ui_elements.audioOnlySwitch, skipping init');
        return;
      }

      const { titleBar } = this.elements;
      if (!titleBar) {
        isDev && logger.warn('\n' + 'audioOnlySwitchHandler: .playlist-block-title not found');
        return;
      }

      let audioOnlySwitch = document.getElementById(_pid('audioOnlySwitch'));

      if (!audioOnlySwitch) {
        audioOnlySwitch           = document.createElement('div');
        audioOnlySwitch.id        = _pid('audioOnlySwitch');
        audioOnlySwitch.className = 'switch not-spoken';
        audioOnlySwitch.title     = 'Play YouTube entries as audio only (poster shown instead of the video, minimum video data loaded)';
        audioOnlySwitch.innerHTML = `
          <label>
            <input id="${_pid('audioOnly')}" type="checkbox" name="audioOnly">
            <span class="bmd-switch-track"></span>
            Audio
          </label>
        `;

        // Requirement: the switch goes into div.playlist-block-title directly
        // AFTER the playlistModeSwitch. insertBefore(x, ref.nextSibling) is
        // the canonical "insert after ref" (also correct when ref is the last
        // child: nextSibling is null and insertBefore appends).
        //
        const listModeSwitch = document.getElementById(_pid('playlistModeSwitch'));
        const sortSelect     = document.getElementById(_pid('playlistSortSelect'));

        if (listModeSwitch) {
          titleBar.insertBefore(audioOnlySwitch, listModeSwitch.nextSibling);
        } else if (sortSelect) {
          titleBar.insertBefore(audioOnlySwitch, sortSelect);
        } else {
          titleBar.appendChild(audioOnlySwitch);
        }

        isDev && logger.debug('\n' + 'audioOnlySwitchHandler: created dynamic switch');
      } else {
        isDev && logger.debug('\n' + 'audioOnlySwitchHandler: reusing existing static switch');
      }

      const checkbox = document.getElementById(_pid('audioOnly'));
      if (!checkbox) {
        logger.error('\n' + 'audioOnlySwitchHandler: checkbox #audioOnly not found');
        return;
      }

      // INITIAL state: a persisted user toggle (localStorage) wins; without
      // one, the YAML chain seeds the state (opts.audio_only, defaults <-
      // settings <- control) — the precedence _resolveAudioOnlyActive()
      // applies on every playback decision. The manager mirror is synced so
      // checkbox and runtime state agree from the first render on.
      //
      const stored = localStorage.getItem(_pid('audioOnly'));

      playlistManager._audioOnly = (stored !== null)
        ? (stored === 'true')
        : (opts.audio_only === true);

      checkbox.checked = playlistManager._audioOnly;

      checkbox.addEventListener('change', (e) => {
        // Player-scope the preference write (MultiInstance fix #6
        // rule): _pid('audioOnly') matches the constructor read and the
        // checkbox id created above, keeping key and DOM in lockstep.
        //
        const enabled = !!e.target.checked;

        playlistManager._audioOnly = enabled;
        localStorage.setItem(_pid('audioOnly'), enabled ? 'true' : 'false');

        // LIVE apply on the currently loaded player — but only when it is
        // actually playing a YouTube source; a native (.mp4) playback is
        // never touched, the new state simply governs the NEXT YouTube load
        // (createVideoJsPlayer). player.audioOnlyMode(bool) is the runtime
        // twin of the videoConfig.audioOnlyMode creation option (video.js).
        // Fix multiPlayer new select audio only #2
        // Runtime twin CHANGED with the creation option (see the ADDENDUM at
        // the feature note): player.audioPosterMode(bool) hides/shows the
        // YouTube iframe while the poster persists on the full player
        // surface. A player created with audio-only OFF carries NO poster
        // (videoConfig.poster is only set on the audio-only creation path),
        // and the PosterImage component hides itself without a URL — so on a
        // live ENABLE the configured poster is resolved and set first.
        // audioPosterMode() returns a Promise when setting; a defensive
        // .catch() keeps a benign mode-switch race out of the console.
        //
        try {
          if (player
              && typeof player.audioPosterMode === 'function'
              && typeof player.currentType  === 'function'
              && player.currentType() === 'video/youtube') {
            if (enabled) {
              _ensureAudioOnlyPosterStyles();
              if (!player.poster()) {
                player.poster(_resolveYouTubeAudioOnlyPoster(player.id_));
              }
            }
            const _aoModePromise = player.audioPosterMode(enabled);
            if (_aoModePromise && typeof _aoModePromise.catch === 'function') {
              _aoModePromise.catch((mErr) => {
                isDev && logger.warn('\n' + `audioOnlySwitchHandler: audioPosterMode(${enabled}) rejected: ${mErr}`);
              });
            }
            if (enabled) {
              _applyYouTubeAudioOnlyQuality(player);
            }
          }
        } catch (err) {
          isDev && logger.warn('\n' + `audioOnlySwitchHandler: live apply skipped: ${err}`);
        }

        isDev && logger.info('\n' + `audioOnlySwitchHandler: audio-only ${enabled ? 'enabled' : 'disabled'}`);
      });

      this.elements.audioOnlySwitch = audioOnlySwitch;

      // SELF-HIDING initial state: visible only when the playlist holds at
      // least one YouTube entry (see _updateAudioOnlySwitchVisibility, which
      // re-evaluates the rule on every render).
      //
      const data = playlistManager.load() || [];

      if (!data.some(_isYouTubeEntry)) {
        audioOnlySwitch.style.display = 'none';
      }

      isDev && logger.info('\n' + 'audioOnlySwitchHandler: audioOnlySwitchHandler initialized');
    }

  } // END audioOnlySwitchHandler

  // ---------------------------------------------------------------------------
  // playlistSortHandler
  // ---------------------------------------------------------------------------
  class playlistSortHandler {

    constructor() {
      this.elements = this.cacheElements();
      this.init();
    }

    cacheElements() {
      const _scope = document.getElementById(_pid('playlist_screen')) || document.getElementById(_pid('playlistBlock'));
      return {
        titleBar:   _scope ? _scope.querySelector('.playlist-block-title') : document.querySelector('.playlist-block-title'),
        sortSelect: null
      };
    }

    init() {
      const { titleBar } = this.elements;
      if (!titleBar) {
        isDev && logger.warn('\n' + 'playlistSortHandler: .playlist-block-title not found');
        return;
      }

      const canonicalOptions = [
        { value: 'watchDate',    label: 'Date (newest)' },
        { value: 'watchDateAsc', label: 'Date (oldest)' },
        { value: 'issueDate',    label: 'Issue Date (newest)' },
        { value: 'issueDateAsc', label: 'Issue Date (oldest)' },
        { value: 'duration',     label: 'Duration (longest)' },
        { value: 'durationAsc',  label: 'Duration (shortest)' },
        { value: 'title',        label: 'Title' },
        { value: 'author',       label: 'Author' },
        { value: 'category',     label: 'Category' },
        { value: 'description',  label: 'Description' },
        { value: 'rating',       label: 'Rating' },
        { value: 'episode',      label: 'Episode' },
        { value: 'type',         label: 'Type' }
      ];

      // Player-scope the sort <select> id so each player builds and owns its own
      // control in its own title bar (see playlistModeSwitchHandler note).
      //
      let select = document.getElementById(_pid('playlistSortSelect'));

      if (select) {
        this._ensureOptions(select, canonicalOptions);
        isDev && logger.debug('\n' + 'playlistSortHandler: reusing existing static <select>');
      } else {
        select            = document.createElement('select');
        select.id         = _pid('playlistSortSelect');
        select.className  = 'playlist-sort-select';
        select.title      = 'Sort playlist';
        select.setAttribute('aria-label', 'Sort playlist');

        canonicalOptions.forEach(opt => {
          const o       = document.createElement('option');
          o.value       = opt.value;
          o.textContent = opt.label;
          select.appendChild(o);
        });

        titleBar.appendChild(select);
      }

      // Player-scope the sort-mode read. The bare 'searchMode' key is
      // origin-global, so on a multi-player page both sort <select>s
      // restored the same criterion on (re)load. _pid('searchMode')
      // suffixes it per player, matching the write in the change
      // listener below. (Key name 'searchMode' is an established
      // series identifier and is preserved verbatim; only the _pid()
      // scope is added.)
      //
      const storedSortMode = localStorage.getItem(_pid('searchMode'));

      // Replace the hard-coded terminal 'watchDate' of the fallback chain with
      // the CONTENT-DERIVED default of the stored playlist, so a series
      // playlist (series > 0 / episode > 0) opens sorted by episode on a page
      // (re)load instead of by a date every entry of a series export shares.
      //
      // Precedence is unchanged where it matters: an explicit user choice
      // (storedSortMode) still wins over everything. The derived value is
      // never falsy, so it takes the place _currentSort/'watchDate' held —
      // and it AGREES with _currentSort whenever the silent resolver
      // (_ensureDefaultSortCriterion) has already run on the same content,
      // e.g. after an async preload. The original chain is kept as the tail
      // for the empty-playlist case, where the derived value is 'watchDate'
      // exactly as before.
      //
      const storedPlaylist  = playlistManager.load() || [];
      const defaultSortMode = playlistManager._deriveDefaultSortCriterion(storedPlaylist);
      const sortCriterion   = storedSortMode || defaultSortMode || playlistManager._currentSort || 'watchDate';

      // The criterion for this content is decided here, so the once-only
      // silent resolution must not revisit it on the first render below.
      // Latched for a NON-EMPTY playlist only: with an empty store nothing was
      // derived yet, and the resolution has to stay armed for content that
      // arrives later (async preload, first addEntry()).
      //
      if (storedPlaylist.length > 0) {
        playlistManager._defaultSortResolved = true;
      }

      playlistManager._currentSort = sortCriterion;
      select.value = sortCriterion;

      isDev && logger.debug('\n' + `playlistSortHandler: sort criterion restored to "${sortCriterion}" (stored: ${storedSortMode || 'none'})`);

      const playlist = playlistManager.load() || [];
      if (playlist.length > 0) {
        playlistManager._applySortOrder(playlist);
        playlistManager.save(playlist);
        playlistManager.renderCurrent();
      }

      // When a playlist is already present in localStorage on (re)load, restore
      // the same "first entry loaded in paused state" behaviour the IO handlers
      // apply after a user-triggered load (#26/#27). This runs here because
      // playlistSortHandler.init() is a page-load handler that already touches
      // the stored playlist (load/sort/render above) and runs after the adapter
      // has wired videojs + videoPlayerOptions, so embedRunVideo() is callable.
      // The method is once-only-guarded, no-ops on an empty list, and skips
      // gracefully if the adapter is not ready yet (see autoLoadFirstEntryOnReload).
      //
    
      // Hardened: the auto-load is a GUEST inside this init - it merely rides
      // along because this handler already touches the stored playlist. In
      // the reported failure a defective jQuery selector inside the expiry
      // gate (thrown OUTSIDE the notice's own try/catch) escaped through
      // autoLoadFirstEntryOnReload() and aborted init() right here, taking
      // the sort <select> wiring below down with it and surfacing in the
      // adapter as "initHandlers: playlistSortHandler failed". The <select>
      // wiring is unrelated to the auto-load result, so a failure of the
      // auto-load chain is now contained: logged as a WARNING (unguarded on
      // purpose - an operator has to see it in production, mirroring the #1
      // gate warnings) and init() continues.
      //
      try {
        playlistManager.autoLoadFirstEntryOnReload();
      } catch (e) {
        logger.warn('\n' + `playlistSortHandler: auto-load on reload failed (init continues): ${e && e.message}`);
      }

      select.addEventListener('change', (e) => {
        localStorage.setItem(_pid('searchMode'), e.target.value); // multiPlayer MultiInstance #6
        playlistManager.sortPlaylist(e.target.value);
      });

      this.elements.sortSelect = select;

      const data = playlistManager.load() || [];
      if (data.length === 0) {
        select.style.display = 'none';
      }

      isDev && logger.debug('\n' + 'playlistManager: sortHandler initialized');
    }

    _ensureOptions(selectEl, canonical) {
      const existing = new Set(
        Array.from(selectEl.options).map(o => o.value)
      );

      canonical.forEach(opt => {
        if (!existing.has(opt.value)) {
          const o       = document.createElement('option');
          o.value       = opt.value;
          o.textContent = opt.label;
          selectEl.appendChild(o);

          isDev && logger.debug('\n' + `playlistSortHandler: injected missing option "${opt.value}"`);
        }
      });
    }

  } // END playlistSortHandler

  // ---------------------------------------------------------------------------
  // playlistDownloadAllHandler
  //
  // Builds the playlist-level export control inside div.playlist-block-title:
  //
  //     <button id="playlistDownloadAllButton_<playerId>"
  //             class="playlist-download-all-btn not-spoken" ...>
  //       <i class="fas fa-download"></i><span>Download</span>
  //     </button>
  //
  // and wires it to playlistManager.downloadAllEntries().
  //
  // Structure follows playlistModeSwitchHandler/playlistMergeSwitchHandler
  // one-to-one: the title bar is resolved inside THIS player's own
  // #playlist_screen (fallback #playlistBlock) panel — never through a
  // page-global querySelector — and the button id is player-scoped via
  // _pid(), so each player builds and owns exactly one control on a
  // multi-player page (MultiInstance #4 rule).
  //
  // Insertion point: before the sort <select>. The select carries
  // 'margin-left: auto' and therefore always stays flush right; inserting
  // before it groups the export button with the mode/merge switches on the
  // left instead of fighting that rule.
  //
  // Listener binding is guarded by a data marker rather than by the
  // create/reuse branch, so a re-run against an already existing button (a
  // statically authored one, or a second lazy init after a DOM swap) can
  // never stack a second click listener and download every file twice.
  // ---------------------------------------------------------------------------
  class playlistDownloadAllHandler {

    constructor() {
      this.elements = this.cacheElements();
      this.init();
    }

    cacheElements() {
      const _scope = document.getElementById(_pid('playlist_screen')) || document.getElementById(_pid('playlistBlock'));
      return {
        titleBar:           _scope ? _scope.querySelector('.playlist-block-title') : document.querySelector('.playlist-block-title'),
        downloadAllButton:  null
      };
    }

    init() {
      const { titleBar } = this.elements;
      if (!titleBar) {
        isDev && logger.warn('\n' + 'playlistDownloadAllHandler: .playlist-block-title not found');
        return;
      }

      let button = document.getElementById(_pid('playlistDownloadAllButton'));

      if (!button) {
        button           = document.createElement('button');
        button.id        = _pid('playlistDownloadAllButton');
        button.className = 'playlist-download-all-btn not-spoken';
        button.type      = 'button';
        button.title     = 'Download all media files of the playlist to your download folder';
        button.setAttribute('aria-label', 'Download all media files of the playlist');
        button.innerHTML = '<i class="fas fa-download fa-18px md-blue"></i><span>Download</span>';

        const sortSelect = document.getElementById(_pid('playlistSortSelect'));
        if (sortSelect) {
          titleBar.insertBefore(button, sortSelect);
        } else {
          titleBar.appendChild(button);
        }

        isDev && logger.debug('\n' + 'playlistDownloadAllHandler: created dynamic export button');
      } else {
        isDev && logger.debug('\n' + 'playlistDownloadAllHandler: reusing existing export button');
      }

      if (button.dataset.downloadAllBound !== 'true') {
        button.addEventListener('click', (event) => {
          event.preventDefault();
          playlistManager.downloadAllEntries();
        });
        button.dataset.downloadAllBound = 'true';
      }

      this.elements.downloadAllButton = button;

      // Hide immediately when the active playlist holds nothing exportable
      // (the same rule every later render re-applies).
      //
      playlistManager._updateDownloadAllButtonVisibility();

      isDev && logger.info('\n' + 'playlistManager: downloadAllHandler initialized');
    }

  } // END playlistDownloadAllHandler

  // ---------------------------------------------------------------------------
  // inputValueBackgroundHandler
  // ---------------------------------------------------------------------------
  function inputValueBackgroundHandler() {

    // Page-global one-shot guard. This handler wires DOCUMENT-level listeners
    // (input / change / animationstart / visibilitychange) plus a 500 ms
    // interval that syncs EVERY matching input on the page — it is
    // page-scoped, not player-scoped. Under the multi-instance architecture
    // this function exists once per player instance, so without a SHARED
    // guard every instance whose adapter calls it would register a duplicate
    // listener set and a duplicate interval. The guard therefore lives in the
    // shared module scope (outside createVideoPlayerInstance): the first
    // caller wins page-wide, all later instances no-op here.
    //
    if (_sharedInputValueBackgroundHandlerInit) {
      isDev && logger.debug('\n' + 'inputValueBackgroundHandler: already initialized page-wide — skipped');
      return;
    }
    _sharedInputValueBackgroundHandlerInit = true;

    const SELECTOR = [
      'input[type="text"]',
      'input[type="search"]',
      'input[type="date"]',
      'input[type="url"]',
      'input[type="email"]',
      'input[type="tel"]',
      'input[type="number"]',
      'input:not([type])',
      'select[form="playlist"]',
      'select[form="series"]',
      'select[form="type"]',
      'textarea'
    ].join(', ');

    const BG_FILLED  = getComputedStyle(document.documentElement)
                        .getPropertyValue('--input-background').trim() || '#E1F5FE';
    const BG_EMPTY   = getComputedStyle(document.documentElement)
                        .getPropertyValue('--card-background').trim()  || '#ffffff';
    const TEXT_COLOR = getComputedStyle(document.documentElement)
                        .getPropertyValue('--text-color').trim()       || '#1d1d1f';

    function hasValue(el) {
      if (el instanceof HTMLSelectElement) {
        return el.selectedIndex > 0 || (el.value !== '' && el.value !== el.options[0]?.value);
      }
      return el.value.trim() !== '';
    }

    function syncBackground(el) {

      // Ownership hand-off for the Expiry Date field. This handler writes the
      // background as an INLINE !important style every 500 ms, which would
      // overwrite the yellow/red expiry colouring within half a second. When
      // the element publishes an active colouring state (warning / critical /
      // expired) via data-expiry-state, _updateExpiryFieldState() owns its
      // background and this handler leaves it untouched. In the neutral states
      // ('unlimited' / 'ok') - and for every other element on the page, which
      // carries no such attribute at all - behaviour is completely unchanged.
      //
      const expiryState = el.dataset ? el.dataset.expiryState : undefined;

      if (expiryState &&
          expiryState !== EXPIRY_STATE.UNLIMITED &&
          expiryState !== EXPIRY_STATE.OK) {
        return;
      }

      if (hasValue(el)) {
        el.style.setProperty('background-color', BG_FILLED, 'important');
        el.style.setProperty('color', TEXT_COLOR, 'important');
        el.dataset.valueFilled = 'true';
      } else {
        el.style.setProperty('background-color', BG_EMPTY, 'important');
        el.style.removeProperty('color');
        delete el.dataset.valueFilled;
      }
    }

    // Performance: syncAll() is driven by a PERMANENT setInterval(…, 500)
    // below (needed to catch browser autofill and programmatic value changes
    // that fire no input/change event). That means a full-document
    // querySelectorAll + per-element class sync twice a second for the whole
    // page lifetime — including while the tab is in the background, where the
    // work is invisible by definition. The poll now no-ops while
    // document.hidden is true; a visibilitychange listener runs one immediate
    // catch-up pass when the tab becomes visible again, so any value change
    // that happened while hidden is reflected without waiting for the next
    // tick. Foreground behaviour is completely unchanged.
    function syncAll() {
      if (document.hidden) return;
      document.querySelectorAll(SELECTOR).forEach(syncBackground);
    }

    // Immediate catch-up pass when the tab returns to the foreground.
    //
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) syncAll();
    });

    document.addEventListener('input', (e) => {
      if (e.target.matches && e.target.matches(SELECTOR)) {
        syncBackground(e.target);
      }
    }, true);

    document.addEventListener('change', (e) => {
      if (e.target.matches && e.target.matches(SELECTOR)) {
        syncBackground(e.target);
      }
    }, true);

    setTimeout(syncAll, 250);
    setInterval(syncAll, 500);

    document.addEventListener('animationstart', (e) => {
      if (e.target.matches && e.target.matches(SELECTOR)) {
        setTimeout(() => syncBackground(e.target), 50);
      }
    }, true);

    isDev && logger.debug('\n' + 'inputValueBackgroundHandler: initialized');
  }

  // ---------------------------------------------------------------------------
  // initTogglePlaylistHandler
  //
  // Wires the #toggle_playlist button so that clicking it shows or hides the
  // #playlist_screen panel.  Prior to this fix the toggle handler lived
  // exclusively in the adapter, which used bare (un-suffixed) element IDs.
  // After the "Unique multiPlayer" changes every element id is suffixed
  // with _{{player.id}}, so the adapter's bare-id lookups silently failed.
  //
  // This module-level handler replaces the adapter's toggle click handler for
  // the per-player elements.  It:
  //   • resolves all ids through _pid() so multi-player pages work correctly
  //   • guards against duplicate registration with _togglePlaylistHandlerInit
  //   • delegates the early-return guard to _updateTogglePlaylistButton() so
  //     the disabled-when-empty and disabled-when-edit-open rules are respected
  //   • updates the button's icon, span label, title, and aria attributes in
  //     sync with the actual panel visibility (show ↔ hide)
  //
  // NOTE: _togglePlaylistHandlerInit is declared in the module variables section
  // (near the top of this factory) rather than here.  The original `let`
  // placement immediately before this function caused a TDZ ReferenceError
  // ("Cannot access '_togglePlaylistHandlerInit' before initialization") because
  // initTogglePlaylistHandler() is called at module init time (~line 2063),
  // before this `let` would have been reached at runtime.  See the module
  // variables section for the declaration.
  // ---------------------------------------------------------------------------
  //
  function initTogglePlaylistHandler() {
    if (_togglePlaylistHandlerInit) return;

    const btn         = document.getElementById(_pid('toggle_playlist'));
    const screen      = document.getElementById(_pid('playlist_screen'));
    const container   = document.getElementById(_pid('video_player_container'));

    if (!btn || !screen || !container) {
      isDev && logger.warn('\n' + 'initTogglePlaylistHandler: required element(s) not found — handler skipped');
      return;
    }

    _togglePlaylistHandlerInit = true;

    // The centre header span is now a "now playing" title that is filled on
    // play by _updateHeaderTitle(). If the rendered template still seeded that
    // span with the legacy toggle label, clear the stale text so it isn't
    // shown before the first video loads. Only the known legacy labels are
    // cleared, so a real title set by an early play is never clobbered.
    //
    const _titleSpan = container.querySelector('.video-player-header-title')
                    || container.querySelector('span');
    if (_titleSpan) {
      const _legacy = (_titleSpan.textContent || '').trim();
      if (_legacy === 'Show Playlist' || _legacy === 'Hide Playlist') {
        _titleSpan.textContent = '';
      }
    }

    btn.addEventListener('click', () => {
      // Re-check disabled state at click time (guards empty-playlist / edit-open).
      if (btn.disabled || btn.getAttribute('aria-disabled') === 'true') return;

      const isVisible = screen.style.display !== 'none' && screen.style.display !== '';

      if (isVisible) {
        // --- HIDE ------------------------------------------------------------
        closePlaylist();
      } else {
        // --- SHOW ------------------------------------------------------------
        screen.style.display = 'block';

        btn.title = 'Hide playlist';
        btn.setAttribute('aria-label',    'Hide playlist');
        btn.setAttribute('aria-expanded', 'true');

        // The centre header span (.video-player-header-title) is now a
        // "now playing" title, not the toggle label, so the legacy
        // "Hide Playlist" span write is disabled. The button's title /
        // aria-label / icon (set above and below) still signal the
        // open state.
        //
        void container;

        const img = btn.querySelector('img');
        if (img) {
          const currentSrc  = img.getAttribute('src') || '';
          const hideIconSrc = currentSrc.replace('playlist-show.svg', 'playlist-hide.svg');
          img.setAttribute('src', hideIconSrc);
          img.setAttribute('alt', 'Hide playlist');
        }

        isDev && logger.debug('\n' + 'initTogglePlaylistHandler: playlist panel shown');
      }
    });

    isDev && logger.info('\n' + 'initTogglePlaylistHandler: toggle-playlist click handler registered');
  }

  // ---------------------------------------------------------------------------
  // closePlaylist
  //
  // Hides the #playlist_screen panel and resets the #toggle_playlist button
  // to its "Show Playlist" state.  All element ids are resolved through _pid()
  // so this works correctly for every uniquely-named player on the page.
  //
  // This is the module-local implementation that replaces the adapter's
  // closePlaylist() calls; it is also exposed in the public API so the adapter
  // can delegate to it.
  // ---------------------------------------------------------------------------
  function closePlaylist() {
    const screen = document.getElementById(_pid('playlist_screen'));
    if (screen) {
      screen.style.display = 'none';
    }

    // Reset the toggle button back to the "Show Playlist" state so it is
    // always in sync with the now-hidden panel.
    //
    _resetPlaylistToggleUI();

    isDev && logger.debug('\n' + 'closePlaylist: playlist panel closed');
  }

  // ---------------------------------------------------------------------------
  // closeEditPlaylist
  //
  // Programmatically closes the playlist edit screen and restores the
  // #video_container to the snapshot saved in `containerHTML`.  All element
  // ids are resolved through _pid().
  //
  // This mirrors the CLOSE branch of initEditPlaylistHandler so the edit
  // panel state is always consistent whether the user clicks the button or
  // whether the module closes it programmatically (e.g. from doPostOnPlaying).
  // ---------------------------------------------------------------------------
  function closeEditPlaylist() {
    const editBtn     = document.getElementById(_pid('edit_playlist'));
    const editScreen  = document.getElementById(_pid('playlist_edit_screen'));
    const videoContnr = document.getElementById(_pid('video_container'));

    // Previously this function early-returned (doing nothing) unless the
    // edit button carried data-edit-open="true".  That made a programmatic
    // call from the adapter on page load a silent no-op, so the caller could
    // not rely on closeEditPlaylist() to enforce the closed state.
    // The function is now idempotent: it always hides #playlist_edit_screen
    // and resets the #edit_playlist button to its "Manage playlists" state,
    // while the single DESTRUCTIVE step — overwriting #video_container with
    // the saved snapshot — still runs ONLY when the editor was genuinely
    // open (data-edit-open="true").
    // The wasOpen guard preserves the original protection that prevented
    // this call from wiping a live, playing video (e.g. when invoked from
    // doPostOnPlaying after a playlist card was started).
    //
    const wasOpen = !!editBtn && editBtn.getAttribute('data-edit-open') === 'true';

    if (editScreen) {
      editScreen.style.display = 'none';
    }

    // Under the overlay model the edit screen is positioned OVER
    // #video_container as a sibling and never replaces its contents, so the
    // snapshot-restore step below is no longer required and would, if it ran,
    // wipe a live player. The legacy "move editScreen inside container" path
    // that this restore paired with is now disabled (see initEditPlaylistHandler
    // deprecation), so this branch is gated off. Preserved (not deleted) for
    // reference. The `void` keeps `containerHTML`/`videoContnr` referenced.
    //
    if (false && wasOpen && videoContnr && containerHTML) {
      videoContnr.innerHTML = containerHTML;
    }
    void wasOpen; void videoContnr; void containerHTML;

    // Reset button aria / title / open-marker state (idempotent).
    //
    if (editBtn) {
      editBtn.setAttribute('aria-expanded', 'false');
      editBtn.title = 'Manage playlists';
      editBtn.setAttribute('aria-label',  'Manage playlists');
      editBtn.setAttribute('data-edit-open', 'false');
    }

    // Re-enable #toggle_playlist now that the editor is closed, delegating
    // to the guard method so the empty-playlist rule is respected.
    //
    playlistManager._updateTogglePlaylistButton();

    isDev && logger.debug('\n' + `closeEditPlaylist: playlist edit screen closed (wasOpen=${wasOpen})`);
  }

  // ---------------------------------------------------------------------------
  // Instance API
  //
  // This object is no longer the module-global export: it is the PER-INSTANCE
  // API returned by createVideoPlayerInstance() for exactly one player. The
  // module export (see the registry section at the end of the file) hands out
  // one of these per player id via createInstance()/getInstance() and mirrors
  // the default instance's members for backward compatibility.
  //
  // Update: these members are now attached DIRECTLY to the owning multiPlayer
  // class instance (Object.assign in the multiPlayer constructor, see the
  // module API section at the end of the file). The default-instance mirror
  // described above has been retired — every consumer addresses a concrete
  // player id via the videoPlayer(id, options) factory, as in video.js.
  // ---------------------------------------------------------------------------
  return {
    instanceID:                   instanceID,
    getPlayerID:                  function () { return _playerID; },

    playlistManager:              playlistManager,
    playlistIOHandler:            playlistIOHandler,
    playlistSearchHandler:        playlistSearchHandler,
    playlistModeSwitchHandler:    playlistModeSwitchHandler,
    playlistMergeSwitchHandler:   playlistMergeSwitchHandler,
    playlistLoopSwitchHandler:    playlistLoopSwitchHandler,
    audioOnlySwitchHandler:       audioOnlySwitchHandler,
    playlistSortHandler:          playlistSortHandler,
    playlistDownloadAllHandler:   playlistDownloadAllHandler,
    videoPlayerToast:             videoPlayerToast,
    videoPlayerExpiryNotice:      videoPlayerExpiryNotice,
    inputWrapperHandler:          inputWrapperHandler,
    inputValueBackgroundHandler:  inputValueBackgroundHandler,
    initTogglePlaylistHandler:    initTogglePlaylistHandler,
    closePlaylist:                closePlaylist,
    closeEditPlaylist:            closeEditPlaylist
  };

  } // END createVideoPlayerInstance

  // Module API — video.js-aligned multi-instance architecture
  //
  // This section is what the UMD wrapper exports as `videoPlayer` (browser
  // global) / module.exports / AMD. The export is now the CALLABLE
  // create-or-get factory videoPlayer(id, options) — the exact structure of
  // the global videojs(id, options) function of the videoJS module — backed
  // by the multiPlayer class (video.js: Player) and its static instance
  // registry multiPlayer.players (video.js: Player.players).
  // 
  // class multiPlayer — the per-player instance class (video.js: class Player)
  //
  // The constructor builds the complete per-player implementation by running
  // createVideoPlayerInstance(id) — all state, the PlaylistManager and every
  // handler class live in the members it returns — and attaches those members
  // to the class instance, the same way a video.js Player constructor creates
  // and attaches its child components. The instance then registers itself in
  // the static multiPlayer.players registry.
  //
  // Do NOT call `new multiPlayer()` from adapter code — use the videoPlayer()
  // factory below (create-or-get), exactly like the global videojs() factory.
  // ---------------------------------------------------------------------------
  class multiPlayer {

    constructor(playerId = '', options = null) {
      const id = String(playerId || '');

      // duplicate protection: the factory normally prevents this; guard the
      // direct-constructor path as well (video.js errors on re-initialising
      // an element that already owns a player)
      //
      if (multiPlayer.players[id]) {
        throw new Error(
          `videoPlayer: instance "${id}" already exists — ` +
          'use the videoPlayer(id) factory (create-or-get) instead of new multiPlayer()'
        );
      }

      // per-instance identification (video.js: player.id_ / player.options_)
      //
      this.id_      = id;
      this.options_ = options || null;

      // Build the per-player implementation (state, PlaylistManager, handler
      // classes, public methods) and attach all members to this instance.
      // The members are self-contained closures over the instance id, so no
      // `this` re-binding is required here.
      //
      Object.assign(this, createVideoPlayerInstance(id));

      // Apply adapter/player options when handed to the factory (video.js
      // parity: videojs(id, options) applies options on creation). The
      // adapter's later explicit setAdapterOptions() call stays valid — the
      // method is an idempotent assignment.
      //
      if (options) {
        this.playlistManager.setAdapterOptions(options);
      }

      // register AFTER a fully successful build so a constructor exception
      // can never leave a half-built instance in the registry
      //
      multiPlayer.players[id] = this;
    }

    id()      { return this.id_; }
    options() { return this.options_; }

    // -------------------------------------------------------------------------
    // dispose()
    // Removes this instance from the registry so its id can be re-created
    // (e.g. SPA-style page swaps that rebuild the player DOM).
    //
    // NOTE (unchanged limitation, carried over from #1 removeInstance()):
    // DOM listeners and the underlying video.js player of this instance are
    // NOT torn down here — a full destroy() lifecycle is out of scope for
    // MultiInstance #2 (the singleton never had one either). Flagged for a
    // future numbered fix.
    // -------------------------------------------------------------------------
    dispose() {
      delete multiPlayer.players[this.id_];
    }

  } // END class multiPlayer

  // Static instance registry, keyed by player id (video.js: Player.players).
  // Object.create(null) avoids prototype-key collisions for ids like
  // 'toString
  //
  multiPlayer.players = Object.create(null);

  // ---------------------------------------------------------------------------
  // videoPlayer() — the module factory and the module export
  //
  // Mirrors the global videojs(id, options) function: returns the already
  // registered instance for `playerId` when one exists (create-or-get),
  // otherwise creates, registers and returns a new multiPlayer. Options
  // passed for an ALREADY EXISTING instance are ignored, as in video.js.
  //
  // Adapter usage:
  //
  //     const vp = videoPlayer(playerId, options);   // create-or-get
  //     vp.playlistManager.setPlayerID(playerId);
  //     new vp.playlistIOHandler(options);
  //     ...
  // ---------------------------------------------------------------------------
  function videoPlayer(playerId = '', options = null) {
    const id       = String(playerId || '');
    const existing = multiPlayer.players[id];

    if (existing) {
      return existing;
    }
    return new multiPlayer(id, options);
  }

  // video.js-parity module surface
  //
  videoPlayer.VERSION     = VERSION;                    // videojs.VERSION
  videoPlayer.multiPlayer = multiPlayer;                // instance class export
  videoPlayer.players     = multiPlayer.players;        // live registry reference

  videoPlayer.getPlayer = function (playerId = '') {
    return multiPlayer.players[String(playerId || '')] || null;
  };

  videoPlayer.getPlayers = function () {
    return multiPlayer.players;
  };

  // ---------------------------------------------------------------------------
  // Deprecated #1 registry API — thin compatibility aliases
  //
  // Kept so any remaining #1-style caller keeps working against the ONE new
  // registry (a second, diverging registry must never exist). New code uses
  // the factory / getPlayer() / getPlayers() / dispose() instead. Note that
  // the ambient DEFAULT instance ('' auto-creation via property getters) is
  // intentionally NOT carried over — it caused the multi-player failure.
  // ---------------------------------------------------------------------------

  // deprecated -> videoPlayer(id)
  videoPlayer.createInstance = function (instanceID = '') {
    return videoPlayer(instanceID);
  };

   // deprecated -> getPlayer(id)
  videoPlayer.getInstance = function (instanceID = '') {
    return videoPlayer.getPlayer(instanceID);
  };

  // deprecated -> !!getPlayer(id)
  videoPlayer.hasInstance = function (instanceID = '') { 
    return !!videoPlayer.getPlayer(instanceID);
  };

  // deprecated -> Object.keys(players)
  videoPlayer.listInstances = function () {
    return Object.keys(multiPlayer.players);
  };

  // deprecated -> vp.dispose()
  videoPlayer.removeInstance = function (instanceID = '') {
    const vp = videoPlayer.getPlayer(instanceID);
    if (!vp) { return false; }
    vp.dispose();
    return true;
  };

  return videoPlayer;

}));