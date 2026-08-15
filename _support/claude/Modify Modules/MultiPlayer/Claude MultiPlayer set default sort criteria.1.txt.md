Prompt
   https://claude.ai/chat/2b33970e-bcdd-43b5-878e-5760eb3213d8
--------------------------------------------------------------------------------

J1 MultiPlayer, derived from the VideoPlayer module, is a complete player
engine built on top of VideoJS. It gives every audio and video the same
good-looking, skinnable player, and it adds a full playlist on top:
a searchable, sortable list of media items that the viewer can play, rate,
and continue from where they left off. It plays native mp3 audio files and 
two kinds of video: native videos (mp4) and YouTube videos.

For all playlists, the related items are sorted (display order). For playlist
with no series flag enabled (Series = 0, Episode = 0) set on the items, the
default sort order should be "Date (newest)". For playlists with items the
series flag is enabled (Series = 1, Episode > 0), the sort order should be
set to "Episode" by default.

Create extended versions and use the comment:
"claude - Fix multiPlayer set default sort criteria #1" for all proposed fixes.


Claude
--------------------------------------------------------------------------------

Now the helper block and the `_applySortOrder()` hook:
Now the hidden-option fallback in `_updateSortOptionsVisibility()`:
Now the preload path:
Now the two playlist load paths (file import and server load):
Now the sort handler's restore chain:
Now the validation pipeline — Liquid stripping, syntax check, 
zero-deletion proof, and tag census:


## Root cause

The display order came from `_currentSort`, seeded with the hard-coded
`'watchDate'` in the constructor and only ever switched to `'episode'`
by the two *user-triggered* load paths.

A **preloaded** series playlist (`olivia-dean-audio.json`:
`series: 1`, `episode: 1…12`, every `watchDate` identical `2026-01-01`)
therefore rendered in date order over twelve equal keys — i.e. arbitrary
JSON order.

The two load paths also only ever switched *to* `'episode'`, never back,
so a plain playlist loaded afterwards kept sorting by an episode number
none of its entries had.

**Fix — 7 hunks, tag `claude - Fix multiPlayer set default sort criteria #1`**

14 occurrences:

| Site | Change |
|---|---|
| `PlaylistManager` constructor | new `_defaultSortResolved` latch |
| before `_applySortOrder()` | `_isSeriesPlaylist()`, `_deriveDefaultSortCriterion()`, `_ensureDefaultSortCriterion()` (silent, once-only), `applyDefaultSortCriterion()` (loud, for content changes) |
| `_applySortOrder()` | resolver call before the criterion is read |
| `_updateSortOptionsVisibility()` | hidden-option fallback now derived, not hard-coded `'watchDate'` |
| `preloadPlaylists()` | applies the derived default before the render (stored user choice wins) |
| import + server-load paths | added the missing non-series branch; existing `hasSeries \|\| hasEpisode` branch untouched |
| `playlistSortHandler.init()` | terminal `'watchDate'` of the fallback chain replaced by the derived default |

The hook sits in `_applySortOrder()` — the single chokepoint all of
`renderPlaylist()`, `renderCards()`, `autoLoadFirstEntryOnReload()`,
`_resyncPluginPlaylist()` and `embedRunVideo()` pass through — so the default
is independent of handler init order and works even when no title bar exists.

Precedence: explicit user choice

 (`localStorage searchMode`) → derived default → previous behaviour.
 
 `_isSeriesPlaylist()` requires **both** `series > 0` and `episode > 0`, so
a series flag with all-zero episodes still gets the date default.


**Validation:** Liquid-stripped `node --check` OK · zero-deletion proof: 274 lines added, only 3 originals replaced, each preserved verbatim as `// Original (deprecated, preserved for reference):` (lines 7604, 7605, 11670) · tag census diff against the original shows the new tag as the *only* delta, all 44 prior series byte-identical · functional simulation running the verbatim patched methods against the real Olivia Dean JSON: 22/22 passed, episodes ordered 1…12.
