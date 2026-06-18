Prompt
  https://claude.ai/chat/ca2d3f54-295b-40cc-9f27-de45c24547c4
--------------------------------------------------------------------------------

How to set up next and prev buttons on a VideoJS player?

The plugin skipbuttons for video.js add seek buttons to the control bar.
These buttons allow the user to skip forward or back by a configured number
of seconds.

Similar to the plugin skipbuttons, I need a next-prev-button plugin for
video.js to add prev- and next buttons to the control bar. The previous button
(.vjs-icon-previous-item) should be placed before skip backward, the next
button (.vjs-icon-next-item).

The plugin next-prev-button should be based/use the plugin videojs-playlist.js
to control a playlist. The prev- and next buttons should load the prev- and next
item in the playlist.


Claude
--------------------------------------------------------------------------------

The playlist plugin gives me everything I need: `player.playlist.previous()` / `.next()` to move, and `previousIndex()` / `nextIndex()` (both repeat‑aware) to know when to disable the buttons at the ends. The icon glyphs (`vjs-icon-previous-item` `\f124`, `vjs-icon-next-item` `\f123`) already ship in `videojs.css`. I'll build the plugin as a near‑exact structural twin of `skipbuttons.js`.Here's the `nextPrevButtons` plugin, built as a structural twin of `skipbuttons.js`.

**How it works**

The plugin registers one `PlaylistButton` component (handling both directions,
like `SeekButton` does for forward/backward) and a `nextPrevButtons` plugin.

Each button drives the playlist directly:

- Previous → `player.playlist.previous()`
- Next → `player.playlist.next()`

The icon glyphs already exist in `videojs.css`, so the constructor just
adds `vjs-icon-previous-item` / `vjs-icon-next-item` to the placeholder.

**Placement (your requirement)**

Rather than a fragile fixed index, positions are auto-computed relative to
the skip buttons that `skipbuttons.js` stores as `controlBar.seekBack` / `controlBar.seekForward`:

- previous → inserted at `seekBack`'s index, landing it **immediately before skip‑backward**
- next → inserted right **after skip‑forward** (read after the previous button is added, so the shift is accounted for)

This needs `skipButtons` to run *before* `nextPrevButtons`. If skip buttons
aren't present, previous falls back to just after the play toggle and next
is appended.

You can always override with explicit numeric `previousIndex` / `nextIndex`
options.


**Boundary handling**

`_updateState()` listens to `loadstart`, `playlistitem`, `playlistchange`,
`playlistsorted` and disables a button when there's nothing to move to. It
relies on the playlist's own `previousIndex()` / `nextIndex()`, which clamp
at the ends and wrap when `repeat` is on — so the buttons stay enabled at
the boundaries only when looping is active.


**Wiring it up**

```js
player.playlist(items);     // videojs-playlist first
player.skipButtons({ forward: 30, backward: 10 });
player.nextPrevButtons();   // after skipButtons, so placement resolves
```

Both files validated with `node --check`. Tagged with the
`// claude - New J1 nextPrevButtons #N` series.

One thing worth a quick check on your side: confirm the seek buttons are
actually stored as `controlBar.seekBack` / `controlBar.seekForward` in
your build — that's what your `skipbuttons.js` sets, but if a different
skip plugin variant is ever loaded, the auto-positioning would fall back.

If you'd rather pin exact positions, say the word and I'll switch the defaults
to fixed indices.

