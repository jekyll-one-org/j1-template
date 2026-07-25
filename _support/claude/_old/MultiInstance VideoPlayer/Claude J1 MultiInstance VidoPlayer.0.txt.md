Prompt
  https://claude.ai/chat/7015f985-f318-4958-b570-14a1d6b469a5
--------------------------------------------------------------------------------

Currently the module VideoPlayer is a sngle instance API that support only
a single player per page. The API should be tranformed into a full featured
multi-instance one.

Each instance (player) should process one or a set of playlists. A playlist
is a JSON file that defines the video items (and meta data) to play.
Is this possible?

Create fixed versions and use the comment
"claude - MultiInstance VideoPlayer #1" for all proposed fixes.


Claude
--------------------------------------------------------------------------------

Let me run a syntax check and produce the final output files.
Clean parse. Now update `videoPlayer.yml` with multi-instance configuration
example, then update `videoPlayer.adoc` with the two-instance HTML template.
Now update `videoPlayer.adoc` to show the two-instance HTML pattern:Now copy
all three output files.

Here is a complete summary of everything that was changed and why.


## Fix: MultiInstance VideoPlayer #1 — Summary

### What changed and why

**Root problem:**
The entire module shared a single set of mutable globals — `player`,
`container`, `containerHTML`, `lastState`, `playerMode`, `playlistManager`,
`loopConfigEnabled`, `pipConfigEnabled`, `pipWindow`, `pipEnabled`,
`pipVisibilityBound`, `previousPlayerId` —
which made it structurally impossible to run two players on the same page
without them clobbering each other's state.


### `videoPlayer.js` — all changes tagged `// claude - MultiInstance VideoPlayer #1`

| Area | Change |
|---|---|
| **Module-level singletons removed** | `container`, `containerHTML`, `player`, `lastState`, `playerMode`, `_startedFromPlaylist`, `previousPlayerId`, `videoPlayerOptions`, `pipWindow`, `pipEnabled`, `pipVisibilityBound`, `loopConfigEnabled`, `pipConfigEnabled` all moved off the module scope |
| **`_instanceRegistry` + `_defaultInstance`** | New module-level map tracks all live instances; `_defaultInstance` provides a backward-compatible shim for any adapter code that still calls the legacy single-instance form |
| **`PlaylistManager` constructor** | Now accepts `instanceId`; all localStorage keys are namespaced (`playlist_<id>`, `playlistMode_<id>`, `mergeMode_<id>`, `playlistLoop_<id>`, `searchMode_<id>`); adds `_scopedId()` helper that resolves DOM elements within the instance's container first |
| **`VideoPlayerInstance` class** | New class that owns all per-instance state; created via `videoPlayer.createInstance(containerId, options)`; also exposes `preloadPlaylist(urlOrArray)` for preloading JSON playlists at startup and `destroy()` for teardown |
| **`embedRunVideo`** | Gains `inst` as first argument; all formerly-global state reads/writes go through `inst.xxx`; backward-compatible two-argument overload preserved |
| **`doPostOnPlaying`** | Gains `inst` as first argument; DOM lookups (`#video_title`, `#video_container`, `#video_title_text`) are scoped inside `inst.containerEl` first |
| **`createVideoJsPlayer`** | Gains `inst` as first argument; overlay lookup is scoped to `inst.containerEl`; player element ID suffixed with `inst.instanceId` to prevent VideoJS id collisions; assigns result to `inst.player` |
| **PiP helpers** | All five helpers (`_enterDocumentPiP`, `_enterVideoPiP`, `_exitPictureInPicture`, `_requestPictureInPicture`, `_initPiPVisibilityHandler`) gain `inst` as first argument; state stored in `inst.pipWindow` / `inst.pipEnabled` / `inst.pipVisibilityBound`; `_playWhenVisible` gains `inst` for `inst.pipConfigEnabled` |
| **Handler classes** | `playlistModeSwitchHandler`, `playlistMergeSwitchHandler`, `playlistLoopSwitchHandler`, `playlistSortHandler`, `playlistSearchHandler`, `playlistIOHandler`, `inputWrapperHandler` — all accept an optional `instanceId`, resolve the correct `PlaylistManager` via `_pm()`, look up DOM elements via `_scopedEl()`, and use namespaced switch/select IDs (e.g. `playlistModeSwitch_<id>`) |
| **`PlaylistManager._updateXxxVisibility()`** | All four visibility helpers use `_scopedId()` with suffixed IDs and read `loopConfigEnabled` from the instance |
| **Public API** | `createInstance(containerId, options)` — factory; `getInstance(instanceId)` — lookup; `instances` getter — registry snapshot; `playlistManager` getter — legacy shim to default instance |


### `videoPlayer.yml`

Added an `instances:` array at the end of `defaults` documenting the
two-instance configuration shape. Each entry maps to one `createInstance()`
call in the adapter and carries its own `preload:` playlist list.


### `videoPlayer.adoc`

Replaced the single-player HTML block with two fully independent player
blocks (Instance 1 = Tiny Desk Concerts, Instance 2 = Carpool Karaoke).
Every DOM id is suffixed with `1` or `2` (`video_container_1`, `playlistBlock1`,
`serverPlaylistSelect1`, etc.) so the module's scoped lookup helpers can
distinguish them without collision.


### How the J1 adapter wires it up (pattern)

```js
// In the J1 adapter init, after options are merged:
const inst1 = videoPlayer.createInstance('video_container_1', videoPlayerOptions);
await inst1.preloadPlaylist('tinydesk-concerts.json');
new videoPlayer.playlistIOHandler(videoPlayerOptions, inst1.instanceId);
new videoPlayer.playlistSortHandler(inst1.instanceId);
// ... remaining handlers

const inst2 = videoPlayer.createInstance('video_container_2', videoPlayerOptions);
await inst2.preloadPlaylist('carpool-karaoke.json');
new videoPlayer.playlistIOHandler(videoPlayerOptions, inst2.instanceId);
new videoPlayer.playlistSortHandler(inst2.instanceId);
```
