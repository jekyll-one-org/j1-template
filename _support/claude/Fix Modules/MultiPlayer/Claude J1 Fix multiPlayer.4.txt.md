Prompt
  https://claude.ai/chat/c9235267-e9fb-4095-bf1d-d22b77740cbc
--------------------------------------------------------------------------------

If a playlist item has a configured end-position ("endAt"), this works for
YouTube videos only once. When the next item to play is automatically
selected by the native videoJS plugin "playlist" (autoadvance), it seems
the new item's end-position is lost and is not evaluated or processed.

Why is it?

Create fixed versions and use the comment
"claude - Fix J1 multiPlayer #4" for all proposed fixes.

Fix does not work and produced additional issues.

Claude
--------------------------------------------------------------------------------

Only JSDoc `{{...}}` in comments — no real Liquid. Now the edits:
Now the full validation pipeline:All checks pass. Delivering the fixed file.

## Why it happens

I built a timed simulation of the autoadvance sequence against the actual `_applyStartEndAtPlayback` code, and it reproduced the failure exactly.
The root cause is a race in the **source-swap window** that the #3 re-arm
itself opened:

1. Item 1 reaches its endAt → `_stopAtEndAt()` fires; in loop mode this triggers the synthetic `'ended'`, and the playlist plugin autoadvances.
2. The plugin swaps the source inside the same player. `'loadstart'` and `'playlistitem'` fire **immediately** — and the #3 handlers re-arm the endAt latch right there.
3. But the raw `YT.Player` settles on the new video only **asynchronously** (youtube.js: `setSrc` → `cueVideoById_`/`loadVideoById_` on the same `YT.Player`; the IFrame API needs a moment). Until it settles, `getVideoData().video_id` still reports the **old** id and `getCurrentTime()` still reports the old position — which is parked **exactly at the old item's endAt**, because that's where the watchdog paused.
4. The next 500 ms watchdog tick inside that window therefore sees: activeId = old video, latch = re-armed, pos ≥ old endAt → it fires `_stopAtEndAt()` a **second time for the item that already stopped**. That spurious fire pauses the incoming item, and in loop mode triggers another synthetic `'ended'` — so the plugin advances **again** and the next item is skipped outright. Its endAt is never evaluated, which reads as "endAt works only once".

The unfixed simulation shows the cascade verbatim: V1 stops at
210 s → advance → spurious second V1 stop at 210.5 s → advance → V2 skipped, 
V3 plays to natural end.

## The fix (`claude - Fix J1 multiPlayer #4`, 7 tagged insertions)

A per-player **expectation tracker**: `_expectedActiveVideoId` is seeded with
the creation-time id and follows the plugin's `'playlistitem'` event hash
(the same authoritative source as the #23 tracker).

A helper `_isMidSwap(resolvedId)` flags any tick/handler run whose resolved
id differs from the expected id, and all four enforcement points skip while
mid-swap: the 500 ms YT interval (the tick that fired the cascade), the
native `'timeupdate'` watchdog, the YT per-`'playing'` startAt handler,
and the native startAt one-shot (which re-attaches itself before bailing,
so the shot isn't spent on the wrong video).

Enforcement resumes on the first tick after the raw player reports the
expected id; the existing "item changed" rule then re-arms the latch as
designed. Native mp3/mp4 sources resolve via the #23 tracker, which the
same event updates, so the guard is a no-op there.


## One observation outside #4 scope

A #5 candidate: with loop mode on **and** the plugin's autoadvance armed,
one synthetic `'ended'` still makes both the plugin (`playlist.next()`,
in-player swap) and the module loop path (`embedRunVideo()`, full rebuild)
advance — a pre-existing double reaction the #3 note already mentions.

The #4 guard makes it harmless for the playback window, but the redundant
rebuild race itself remains.
