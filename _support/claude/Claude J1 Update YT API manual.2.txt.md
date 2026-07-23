Prompt
  https://claude.ai/chat/b5397de2-d00e-45c7-9c75-de9289680347
--------------------------------------------------------------------------------

The attached api documentation for YouTube iFrame API (iframe-api.adoc)
was updated in "Update YouTube iFrame API manual #1". This update was
flagged but not touched (scope discipline) by:

The doc doesn't cover the cue/load methods `loadVideoById`, `cueVideoById`,
`loadPlaylist`…, playlist navigation `nextVideo`, `previousVideo`,
`playVideoAt` is worth a follow-up `#2` if you want the methods set complete.

Create an updated/fixed version and use the comment
"claude - Update YouTube iFrame API manual #2" for all proposed changes.


Claude
--------------------------------------------------------------------------------

Now the playlist navigation methods, inserted after `setShuffle` and
before `=== Playback status`: Update `#2` is complete.
Only `120_yt_iframe_api_methods.asciidoc` was changed — the other five
files are untouched, so the `#1` tag counts across the manual
(adoc: 1, intro: 1, examples: 1) remain byte-identical.

## What was added (all purely additive, 298 new lines, zero deletions)

1. **`=== Queueing videos`** — inserted before `=== playVideo`, matching the upstream reference order (queueing before playback controls). Covers `cueVideoById`, `loadVideoById`, `cueVideoByUrl`, `loadVideoByUrl`, each with argument syntax and object syntax code blocks. Includes the cue-vs-load semantic distinction (state `5` vs `1`), the `endSeconds` object-syntax-only constraint, and the `seekTo()`-cancels-`endSeconds` note.

2. **`=== Queueing playlists`** — `cuePlaylist` and `loadPlaylist`, both syntaxes, with the `listType`/`list` object properties (`playlist` vs `user_uploads`) and a note on `PL`-prefixed playlist IDs.

3. **`=== Playing a video in a playlist`** — inserted after `setShuffle`, before `=== Playback status`. Covers `nextVideo()`, `previousVideo()` (including the `setLoop` wrap-around and first-video-restart edge cases) and `playVideoAt(index)` with the zero-based index and shuffled-order caveat.

One design decision flagged inline via the begin/end comments:
The queueing sections are placed *before* `playVideo` to mirror Google's
reference structure rather than appended at the end — easy to relocate if
you prefer append-only ordering. 


## Also two out-of-scope observations for a possible `#3`

The events file (line 205) references `loadVideoById` and could now carry
an xref to the new section, and `getSphericalProperties`/`setSphericalProperties`
(360° video) remain the last uncovered methods in the upstream API.
