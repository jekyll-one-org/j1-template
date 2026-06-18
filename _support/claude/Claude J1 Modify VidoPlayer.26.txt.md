Prompt
  https://claude.ai/chat/f6c48cd4-55de-430b-8a18-07fab6288bc6
--------------------------------------------------------------------------------

When a playlist is loaded via handleLoadFromServer(), the first video in that
list should be loaded and started in the 'paused' state.

Create fixed versions and use the comment
"claude - Modify J1 VideoPlayer #26" for all proposed fixes.


Claude
--------------------------------------------------------------------------------

I have a clear picture now. Let me confirm the exact insertion region and then make the change.Now validate the syntax. Per the J1 convention, I strip Liquid template tags before running `node --check`.Validation passes (the 3 Liquid occurrences are pre-existing). Let me confirm the change is purely additive and the tag is on every new line.The change is purely additive (22 lines inserted, zero original lines modified), every new code line carries the `claude - Modify J1 VideoPlayer #26` tag, and `node --check` passes.Done — **Modify J1 VideoPlayer #26**.

What I added, at the tail of `handleLoadFromServer()` (right after
`_updateTogglePlaylistButton()`, before the scroll):

```js
const firstList  = playlistManager.load() || [];
playlistManager._applySortOrder(firstList);
const firstEntry = firstList[0];
if (firstEntry && firstEntry.videoId) {
  playlistManager.embedRunVideo(firstEntry.videoId, 'pause');
}
```


Key decisions behind it:

- **Display-order match**
  `load()` returns storage (insertion) order; the rendered list reorders
  via `_applySortOrder(_currentSort)`. By re-applying the same sort here,
  the entry I pick is the first *visible* row — important because the
  auto-sort path may have just switched `_currentSort` to `'episode'`.
- **`'pause'` mode, not `playEntry()`**
  The existing `playerMode === 'pause'` contract (the autoplay branch
  in `embedRunVideo` calls `vjsPlayer.pause()` after `VIDEO_START_DELAY`)
  is exactly "load and start, then settle in paused state." I deliberately
  bypassed `playEntry()` so `_startedFromPlaylist` is *not* set. That flag
  would collapse the playlist panel in `doPostOnPlaying()`, which you don't
  want immediately after loading a playlist.
- **Container/overlay**
  is already restored above (line ~4392) and `createVideoJsPlayer` restores
  it again defensively, so the embed lands cleanly.


One thing worth flagging:

The pause-after-start only fires when the active player config has `autoplay`
enabled (`players.youtube.autoplay` / `players.native.autoplay`).
With autoplay off, the first video still **loads** and sits paused
(poster + play button), but it won't briefly "start" first,
the `setTimeout(pause)` is inside the `if (autoplay)` branch in `embedRunVideo`.

If you want the started-then-paused behavior to be guaranteed regardless
of the autoplay config, that's a small follow-on change in `embedRunVideo`
rather than here — let me know and I'll do it as part of the same series.

