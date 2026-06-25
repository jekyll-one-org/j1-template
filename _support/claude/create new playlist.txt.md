Prompt
  https://claude.ai/chat/e25e08ea-ce1b-4858-b02c-2e3e2d469ff8
--------------------------------------------------------------------------------

How is a new playlist is created when a new video is loaded?


Claude
--------------------------------------------------------------------------------

There are actually two distinct things called "playlist" in this file,
and a single newly-loaded video touches both. The important point is that
**no explicit "create a new playlist" step exists** — the persistent
playlist is lazily materialized the first time an entry is saved.

Here's the call chain for loading one new video:

1. **`handleLoadVideo()` → `processUrl()`** (~line 4633) 
   classifies the input: YouTube IDs go through `extractVideoId` → `loadYtVideo()`,
   native URLs through `extractVideoSrc` → `loadVideo()` (line 4732).

2. **`loadVideo()` / `loadYtVideo()`** dispatch a `videoLoad` CustomEvent
    and call **`embedRunVideo(src/id)`** (line 3193), which builds the
    Video.js instance and starts playback.

3. When the player reaches the `playing` state, the state handler calls
   **`doPostOnPlaying(state)`** (line 3864).

4. `doPostOnPlaying` reads the live per-tech metadata (`player.ytVideoData`
   for YouTube, `player.videoData` for native), assembles a single `media`
   object, wraps it as `newItem = [media]`, and calls
   **`playlistManager.addEntry(entry)`** (lines 3953 / 3997).

The actual "creation" happens inside **`addEntry()`** (line 968):

- It calls `this.load()` (line 856), which reads localStorage key `'playlist'`.
  On the very first video nothing is stored, so `load()` returns `null` and
  the code falls back to `const playlist = this.load() || []`.

- It dedupes by `videoId` (skips if already present), then normalizes the
  input into a full `record` with defaults (`creator: 'videoPlayer'`,
  fresh `watchDate`, etc.).

- `filtered.unshift(record)` prepends it,
   then `this.save(filtered)` (line 934) does `localStorage.setItem('playlist', …)`.

That `save()` is the moment the playlist comes into existence — on the first
video it writes the `'playlist'` key as a one-element array; on subsequent
loads it just grows the existing array. Then `renderCurrent()` repaints
the list/card UI.

So the persistent playlist is never explicitly "created" — it's a side
effect of the first `addEntry()` after playback starts, with `load() || []`
quietly bootstrapping the empty array.

Worth distinguishing from the **videojs-playlist plugin's in-memory list** 
(`player.playlist(...)`), which is a separate concern rebuilt every time
the player is constructed in `onReady` (line 3539–3553): it takes the
*display source* (`_searchResults || load()`), sorts it via `_applySortOrder`,
converts it with `convertVideoPlayerPlaylist`, and feeds
`vjsPlayer.playlist(playlist)`. That's what the prev/next buttons and
autoadvance navigate — derived from the persistent playlist, not the
same object.

Which of the two senses did you mean — the persistent localStorage
collection, or the plugin's navigation list? I can go deeper on either.







