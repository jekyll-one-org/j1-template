Prompt
   
--------------------------------------------------------------------------------

To use the VideoJS plugin videojs-playlist (core.js), many functions were
implemented in the VideoPlayer core (see comments: Modify J1 VideoPlayer)
to make the native VideoPlayer's playlist format compatible with the format
expected by the VideoJS plugin (loaded from core.js).

All the conversion stuff should be unnecessary by changing the native
VideoPlayers playlist format to be compatible with the VideoJS plugin
videojs-playlist.

Create a modified version and use the comment
"claude - Modify J1 VideoPlayer #28" for all proposed fixes.


Claude
--------------------------------------------------------------------------------

Now let me examine the videoPlayer.js to understand the native format and the conversion code.Now let me look at the consumption site where the conversion is used and the player is created.Let me check the search-index build and any place that iterates entry fields generically, to ensure adding `sources`/`name` won't break anything.Let me check the file header and whether it contains Liquid template tags (which affect validation).Baseline is clean. Now I'll make the edits. First, attach the videojs-playlist shape inside `_normalizeEntry` and add the helper method.Now I'll add a deprecation banner to the (now-retired) `convertVideoPlayerPlaylist`. Let me view its current location.Now the consumption site — replace the conversion call with a direct filter of the (already plugin-shaped) loaded entries.Now validate with `node --check` after stripping Liquid tags.Let me do a final visual check of the two core regions.Everything checks out. Let me copy the final file to outputs and present it.Done.

All `#28` changes are in, syntax validated with `node --check`, +85 lines
(purely additive comments/code plus the one consumption-site swap).


## What #28 does

The core idea: make the native playlist record *already* carry the
videojs-playlist item shape, so `load()` returns plugin-ready items
and the whole record→item conversion layer becomes dead weight.


Three touch points:

1. **`_attachPlaylistItemShape(entry)`** (new method, after `_normalizeEntry`)
Attaches the plugin fields onto each entry in place: `sources` (reusing the
existing `_buildPlaylistItemSources` so YouTube/native derivation stays in
one place), `name`, and a numeric `duration`. It's idempotent and re-derives
`sources` on every call, so edits to `entry.src`/`entry.videoLink` propagate
on the next `load()`.

2. **`_normalizeEntry`**
Now calls `_attachPlaylistItemShape(entry)` right before returning.
Since `load()` normalizes every entry, every loaded entry comes back 
lugin-shaped.

3. **`createVideoJsPlayer` consumption site** 
The `convertVideoPlayerPlaylist()` call is gone. It's replaced by a
direct `load()` plus a simple "has a playable source" filter (the one
job conversion still did, to keep video.js's `player.src()` from erroring
on legacy/corrupt records). I kept both `rawPlaylist` and `playlist` as
identical references so the downstream `#20`/`#23` videoId-based index-sync
code keeps working untouched — and because the filtered list reuses the
same entry objects, those two index spaces are now genuinely identical
(the divergence `#20` was guarding against is gone).


## Deliberate choices worth flagging

- **`convertVideoPlayerPlaylist` and `mapVideoPlayerPlaylist`
  Are retired, not deleted.** I added a `#28` deprecation banner to
  `convertVideoPlayerPlaylist`. They're off the hot path now but left
  intact as a safety net / for any external callers. Say the word and
  I'll strip them out entirely (and fold the source logic so only
  `_attachPlaylistItemShape` remains).

- **`poster` is intentionally left to `_normalizeEntry`'s existing policy**
  Rather than defaulted to `DEFAULT_POSTER` on the entry. The old conversion
  injected `DEFAULT_POSTER` into the *transient* item; doing that on the
  *persisted* entry would violate the documented normalize rule (it must
  keep `''` so a real poster is still recognized as "missing" later).
  Both `core.js` `playItem()` and the J1 render helpers already tolerate
  an empty poster, so the only delta is that the videojs-playlist-ui menu
  thumbnail for a native, posterless entry falls back to nothing instead
  of `DEFAULT_POSTER`. If you want exact parity, I can backfill the poster
  at the filter step (non-persisted) — let me know.

- **Persistence note:**
  Because `_normalizeEntry` mutates entries, `sources`/`name` will now be
  written into localStorage on the next `save()`. That's harmless (re-derived
  on load, tolerated by export/import and the lunr index, which uses explicit
  fields) and is arguably the point — the stored format is now
  plugin-native too.

