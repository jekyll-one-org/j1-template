Prompt
   https://claude.ai/chat/95895eea-3a19-4488-9484-30cad7c49a0e
--------------------------------------------------------------------------------

J1 MultiPlayer is a complete player engine built on top of VideoJS. It gives
every audio and video the same good-looking, skinnable player, and it adds
a full playlist on top: a searchable, sortable list of media items that the
viewer can play, rate, and continue from where they left off. It plays native
mp3 audio files and two kinds of video: native videos (mp4) and YouTube videos.

When the option "startAt" is set, the video should be set "dark" (invisible)
until the synthetic start time is reached. Until the start time is reached,
the related poster of the video should be displayed instead.

Create an extended version and use the comment:
"Claude - Fix multiPlayer start video at startAt #1"
for all proposed fixes.


Claude
--------------------------------------------------------------------------------

**`player.js` extended — tag `Claude - Fix multiPlayer start video at startAt #1` (7 occurrences). `multiPlayer.js` needs no change** (the adapter has no `startAt`/`endAt` plumbing — the window is resolved entirely inside the module).

**Root cause.** `startAt` is enforced by *seeking*, not by loading at an offset: the native one-shot calls `player.currentTime(startAt)` and the ytp-parity handler calls `ytPlayer.seekTo(startAt, true)` — both deferred 400 ms past the resume seek. Between playback start and the seek landing, the tech renders the media *from its beginning*, i.e. exactly the material the window was configured to skip. Worse for YouTube, which then has to re-buffer at the new offset.

**Strategy.** Same one the module already uses for AUDIO ONLY (`audioPosterMode`): don't touch the tech, sources or player config — hide the *surface* with CSS and let `PosterImage` cover it. The playback path (buffering, seek, endAt watchdog, resume, autoadvance, loop) runs byte-identically; only pixels change.


# What was added

- `_ensureStartAtDarkStyles()`
  one-time stylesheet, modelled on `_ensureAudioOnlyPosterStyles()`.
  Marker class `j1-startat-dark`:

    `.vjs-tech` (+ its iframe) → `visibility: hidden` — never `display: none`,
  
  which would detach the YouTube iframe and break the very seek being waited on; `.vjs-poster` → `display: block !important` (beats both `.vjs-has-started .vjs-poster`
  and the component's `.vjs-hidden { display: none !important }`);
  Black backdrop so a poster-less media is genuinely dark; spinner lifted
  above the poster.

- `_resolveStartAtDarkPoster()`
  guarantees a URL (`PosterImage.update()` hides itself without one):
  `player.poster()` → `entry.poster` → YouTube thumbnail → `default_poster`/`DEFAULT_POSTER`.

- Runtime block inside `_applyStartEndAtPlayback()`, reusing its existing
  `_resolveStartEndAt`, `_expectedActiveVideoId` and `_isMidSwap` (#4) guards.
  Enters on `play`/`loadstart`/`playlistitem`; reveals on a 100 ms poll
  reading the **raw YT.Player first** (the `#2` reason:
  the facade's `timeupdate` is a synthetic relay, and its 500 ms granularity
  would leave the surface dark up to half a second into the window).
  Also leaves on `ended`/`error`/`dispose`.


## No-op guarantees

`startAt === null` → never darkens (every existing entry/config unchanged);
AUDIO ONLY skipped (one owner per surface); a resume position already inside
the window skipped (resume keeps winning); a per-item latch stops a mid-item scrub-back-and-play from re-darkening after the one-shot is spent; and an 8 s
hard cap reveals the video with a dev warning, so no failure mode leaves a
permanently black player. Audio is deliberately **not** muted — that would
fight the user's volume state and risk stranding the player muted.
