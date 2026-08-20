Prompt
  https://claude.ai/chat/cdcdd306-a8a7-4c86-93f8-f9686f01ceb5
--------------------------------------------------------------------------------

The J1 Template supports native audio files (such as MP3) and uses
custom players built on Amplitude. The module amplitudePlayer (based on
the library AmplitidudeJS) lets web designers build custom audio players
that look exactly the way they want.

With the J1 Template, Amplitude is already integrated, so you can
drop a nice-looking player into any page without writing complex
JavaScript. You can also use the large player of amplitudePlayer to play
the audio track of a YouTube video. The module amplitudePlayer adds a
plugin called "ytp" that enables this feature for large players.

The playlists used by native large players and large players using the
"ytp" plugin should be synchronized (e.g. the active state marked by class "amplitude-active-song-container") across all players.

The fix commented by "Claude - J1 amplitudePlayer optimization #4" has mainly
fixed the issues. One sync is left: the matadata in div class="meta-container"
is not synchronized.

Why is that?

Create fixed versions using the comment
"Claude - J1 amplitudePlayer optimization #5" for all
proposed changes.


Claude
--------------------------------------------------------------------------------

I'll start with a pre-edit audit of the uploaded files.## Why the
meta-container stayed out of sync

Series #4 pushes two things to every other playlist on the page: the **marker** (`_mirrorActiveSong` / `ytpMirrorActiveSong`) and the **engine**
(cue the YouTube players / `Amplitude.setPlaylistSongActive`).
It never pushes the **metadata**, because every meta writer on the page is
scoped to the playlist that is *playing*:

1. **AmplitudeJS `displayMetaData()`**
   Writes the `data-amplitude-song-info` elements only for `config.active_playlist`.
   This is what the native meta-container relies on (`requiredForATP === false`
   switches the class-based writer off for native players).

2. **`atpUpdatMetaContainers()` / `ytpUpdatMetaContainers()`**
   Write the class-based elements (`song-name`, `artist`, `album`, rating,
   info link) only where `data-amplitude-playlist === metaData.playlist`
   and both are called from the leader's `processOnStateChangePlaying()`
   with the *leader's* metadata.

A following playlist therefore gets its marker moved and its engine cued,
but no writer is ever handed that playlist's song. `ytpFollowActiveSong`
updated the cover image only.

The ytp → native direction sometimes looked right because `setPlaylistSongActive()`
runs `displayMetaData()`, but that covers the attribute form only and only
when the engine follow actually runs (engine not playing, vendored patch present).


## Fix #5

Both `setSongActive()` implementations now pass the playlist list returned
by the marker mirror into a new meta mirror, so the meta-container of every
mirrored playlist shows the song that is marked in its list — DOM only,
independent of the engine follow:

- **`player.js`**
  `_songMetaOfPlaylist()` (copy of the song from the Amplitude config,
  which holds native *and* ytp playlists), `_writeSongMetaContainer()`
  (attribute form + class form + `.cover-image-<playlist>` + rating/info
  via `atpUpdatMetaContainers`), `_mirrorActiveSongMeta()`.
  Call site in `setSongActive`, original line preserved as comment.

- **`ytp.js`**
  Mirror-image helpers `ytpSongMetaOfPlaylist()`, `ytpWriteSongMetaContainer()`, `ytpMirrorActiveSongMeta()`. The plugin writer deliberately does *not*
  delegate to `ytpUpdatMetaContainers()`, because that writes every element
  of a class for the playlist; the new writer skips per-song elements carrying `data-amplitude-song-index`, the same rule `displayMetaData()` applies.

No version bump applied.
