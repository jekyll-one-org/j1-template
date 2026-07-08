Prompt
  https://claude.ai/chat/57b7ac49-78c3-4419-a1f1-e37a6428ab05
--------------------------------------------------------------------------------

When the video is started from a playlist element, the data element
'data-item-active' on the corresponding card or list element is set to
true to indicate that when the video is in state 'playing' (see comment:
Modify J1 VideoPlayer #21/#22).

The indicator `data-item-active="false|true"]` does not match the
video state when a next/previous video is started from the playlist
plugin (button class="vjs-playlist-button skip-next/skip-forward). The
indicator should follow the video that starts from the playlist plugin.

Create extended versions and use the comment
"claude - Modify J1 VideoPlayer #23" for all proposed fixes.


Claude
--------------------------------------------------------------------------------

Baseline is clean. Now let me make the four targeted edits, all tagged `claude - Modify J1 VideoPlayer #23`.Now the `'playlistitem'` listener, placed right after the playlist plugin is loaded and before the synced `currentItem()` jump:Now the `doPostOnPlaying()` change so the `'playing'` re-mark prefers the plugin-driven id over the stale per-tech metadata:Now let me validate the syntax and verify all four edits are in place.Only a single original line was changed — everything else is purely additive. Let me confirm the line delta and copy the final file to outputs.Done — `videoPlayer.js` extended with four `// claude - Modify J1 VideoPlayer #23` changes. `node --check` passes; +57 lines, exactly **one** original line modified (everything else additive).

## Root cause

The `data-item-active` marker is set in `doPostOnPlaying()` (the `'playing'`
handler from #21/#22), which resolves the active videoId from `player.videoData`,
`player.ytVideoData`. Those per-tech metadata objects are populated **once per
`embedRunVideo()`** (native via a one-shot `videoDataResolved` listener,
YouTube via a one-time tech read).

The videojs-playlist plugin's prev/next buttons don't go through
`embedRunVideo()` — they call
`playlist.previous()`/`.next()` → `playItem()` → `player.src(...)`
inside the *same* player. So `videoData` stays stale, and the `'playing'`
event re-marks the **previous** entry.

## The fix

The hook is `core.js`'s `'playlistitem'` event — `playItem()` fires it on
**every** plugin-driven item load (prev/next buttons, autoadvance,
`currentItem()`/`first()`/`last()`), passing the item object, which carries
the J1 `videoId` via `mapVideoPlayerPlaylist`.

1. **Module-level
   `_playlistActiveVideoId`** (~line 267) — single source of truth for
   the entry the plugin last switched to.
2. **Reset in `embedRunVideo()`** (~line 2683)
    cleared on every new player so it can't go stale across embeds
    (e.g. empty/disabled playlists).
3. **`'playlistitem'` listener** (~line 2974)
   attached after `vjsPlayer.playlist(playlist)` and before the synced
   `currentItem()` jump; records the id and calls `setActiveItem()`
   immediately so the marker jumps the instant prev/next is pressed.
4. **`doPostOnPlaying()`** (~line 3213)
   prefers `_playlistActiveVideoId` over the stale per-tech resolution,
   falling back to the old behaviour for plain non-playlist plays
   (where it's `null`).

Works for both native and YouTube (the listener keys off the item's
J1 `videoId`, which matches `data-video-id` on the cards/rows).
The existing `clearActiveItem()` on pause/ended still fires; the following
`'playing'` now correctly restores the marker onto the new entry.


One related observation, not touched since it's outside #23's scope:

on pause/ended the position-save block (~line 2739) resolves `currentVideoId`
from the same stale `player.videoData`, so after a plugin-driven prev/next
the resume position can be written under the previous entry's id.

If you want, that's a clean follow-on (`#24`) reusing `_playlistActiveVideoId`
the same way.

