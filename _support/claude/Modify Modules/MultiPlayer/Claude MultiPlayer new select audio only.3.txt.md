Prompt
   https://claude.ai/chat/dc9c57b6-b8c2-4cbc-ae2c-fb9ed3bdc119
--------------------------------------------------------------------------------

J1 MultiPlayer, derived from the VideoPlayer module, is a complete player
engine built on top of VideoJS. It gives every audio and video the same
good-looking, skinnable player, and it adds a full playlist on top:
a searchable, sortable list of media items that the viewer can play, rate,
and continue from where they left off. It plays native mp3 audio files and 
two kinds of video: native videos (mp4) and YouTube videos.

On the fix commented by: Fix multiPlayer new select audio only #1
For YouTube videos, an additional "audio only" option was added.

If the "audio only" option is enabled, the player inside the "video_container"
should show the configured video poster "instead" of the YouTube video while
the video is played hidden. Currently, no content is placed and only the
videoJS controlbar is shown.

Create extended versions and use the comment:
"claude - Fix multiPlayer new select audio only #2" for all proposed fixes.


Claude
--------------------------------------------------------------------------------

Edit D — the switch tooltip and the live-apply in `audioOnlySwitchHandler`:The `vq` line was re-aligned — that violates byte-identical preservation. Restoring its original spacing:Final verification and delivery:Fix #2 is complete. Root cause: Fix #1 used the Video.js creation option `audioOnlyMode: true`, and that mode *collapses* the player to the control-bar height (`enableAudioOnlyUI_` hides every component except the control bar) — hence the empty `video_container` with only the control bar.

The bundled Video.js 8.23.8 ships the exact sibling mechanism this feature needs: **`audioPosterMode`**. It hides the tech element (the YouTube iframe, via `tech.hide()`) while the player keeps its full fluid surface, on which the PosterImage component persistently displays the poster during playback. Fix #2 switches to it — with one precondition the mode silently depends on: PosterImage hides itself when the player has no poster URL, so a URL must always be resolved and set.

**player.js — 13 tags `claude - Fix multiPlayer new select audio only #2`**

1. **Feature-note ADDENDUM** after the Fix #1 header explaining the strategy
   change and why the ytp parity (quality clamp) is untouched.

2. **`_resolveYouTubeAudioOnlyPoster(videoId)`**
   Resolves the configured poster with precedence: `entry.poster` of the
   playlist record (skipped when it's merely `DEFAULT_POSTER`) → YT thumbnail
   derived from the videoId plus the configured `players.youtube.poster`
   file (e.g. `maxresdefault.jpg`, served from cookieless `i.ytimg.com`) → `players.youtube.default_poster` → `DEFAULT_POSTER`. Never returns empty.

3. **`_ensureAudioOnlyPosterStyles()`**
   One-time defensive stylesheet re-asserting
     `.vjs-audio-poster-mode … .vjs-poster { display: block }`
   at higher specificity; a harmless duplicate when the full core CSS is
   present, insurance against a trimmed bundle.

4. **`createVideoJsPlayer`**
   `videoConfig.audioOnlyMode = true` deprecated
   (preserved) → `videoConfig.audioPosterMode = true` **plus** 
   `videoConfig.poster = _resolveYouTubeAudioOnlyPoster(videoId)`;
   `ytPlayerVars.vq = 'small'` and the `'playing'` quality one-shot are
   unchanged.

5. **`audioOnlySwitchHandler` live-apply**
   `player.audioOnlyMode(enabled)` deprecated → `player.audioPosterMode(enabled)`
   with a poster ensure on live-enable (a player created with audio-only OFF
   carries no poster; `player.id_` is the raw videoId) and a defensive
   `.catch()` on the returned Promise (unhandled-rejection rule of #32).
   Design note flagged for you: the poster is intentionally not cleared on
   live-disable — `vjs-has-started` hides it anyway.
   The switch tooltip now mentions the poster.

**multiPlayer.js — 1 tag**
Documentation-only addendum in the 5a block; no adapter code change
is required, all gates/ids/keys are unchanged.
