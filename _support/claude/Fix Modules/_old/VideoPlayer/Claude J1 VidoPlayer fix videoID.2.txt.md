Prompt
  https://claude.ai/chat/fb99965e-fe80-4caa-bee4-a8a499b02718
--------------------------------------------------------------------------------

Since the extracted video ID, taken from native video file name, is fixed for
invalid characters (comment: VidoPlayer fix videoID #1), the video is added
twice to the playlist (stored in localstorage).

Why is it?

Create a fixed version for the videoPlayer and use the comment
"claude - VidoPlayer fix videoID #2" for all proposed fixes.


Claude
--------------------------------------------------------------------------------

I'll dig into this. Let me read the uploaded file and find the `#1` fix to understand what's happening.Let me examine both regions where the videoID is derived and used.Now the second derivation site, in the input-wrapper handler:Now let me trace where entries actually get written to the playlist. Let me find `createEntry`, `addEntry`, and `doPostOnPlaying`.`createEntry` is idempotent by `videoId`, and it's called both early (in `embedRunVideo`, sanitized) and defensively late (in `doPostOnPlaying`). Let me see how `doPostOnPlaying` derives its id — that's the likely mismatch.Native `vid` here comes from `player.videoData.videoId`. I need to see whether that value is the sanitized id or the raw (dotted) filename id. Let me find where `player.videoData` / `videoData.videoId` gets set.Let me find where `videoDataResolved` is dispatched — that's where the native `videoData.videoId` is originally computed.The mismatch is becoming clear. In `doPostOnPlaying`'s native branch, `vid` comes from `player.videoData.videoId`, which is set by the native plugin via the `videoDataResolved` event (line 4269, `player.videoData = videoData`). Let me confirm the plugin builds that id from the filename **without** sanitizing.That confirms the plugin uses the raw filename. Now let me verify `createEntry`'s idempotency logic (the duplicate check) to confirm a key mismatch produces a second entry rather than an update.Confirmed — `createEntry` matches on strict `item.videoId === entry.videoId`, so a key mismatch appends a second record. Let me check the remaining consumers of `player.videoData.videoId` to make sure sanitizing at the source is safe for all of them.All consumers key off the same stored id, so sanitizing at the single point the plugin's id enters this module fixes the reported double-add and several latent keying bugs at once. Let me set up a working copy and check for Liquid templating that would affect syntax validation.The three Liquid hits are all inside `//` comments, so they won't affect validation. Baseline recorded: `#1` = 24 tagged lines, `#2` = 0. Now applying the fix at the single point the native plugin's id enters this module.Now validating: strip the comment-embedded Liquid tags, run `node --check`, and verify tag counts.Syntax passes, `#1` stays at 24 (untouched), and `#2` adds 8 tagged lines. Let me eyeball the final edited region to confirm it reads cleanly.The edit reads cleanly and preserves the surrounding logic. Delivering the fixed file.## Why the video is added twice

The `#1` fix sanitized the derived videoId at only the two **input-side** derivation sites — `embedRunVideo()` and `inputWrapperHandler.processUrl()`. So `embedRunVideo()` persists the early playlist record (`createEntry()`, `#34`) under the **sanitized** key, e.g. `TV-20251021-0955-0000-1080`.

But there's a **third** id that never went through `sanitizeVideoId()`: the one the native plugin resolves straight from the file name and hands over via the `videoDataResolved` event. That raw id keeps the invalid char (`TV-20251021-0955-0000.1080`, dot intact) and lands on `player.videoData.videoId` at line 4269.

Later, when the player hits `playing`, `doPostOnPlaying()`'s native branch reads `vid = player.videoData.videoId` (the **dotted** id) and calls its defensive `createEntry(media)`. Since `createEntry()`'s idempotency check is a strict equality — `playlist.find(item => item.videoId === entry.videoId)` (line 1188) — the dotted key doesn't match the already-stored hyphenated key, so `playlist.unshift(record)` appends a **second** record. Two entries in localStorage for one video: one keyed `…-0000-1080`, one keyed `…-0000.1080`.

It's native-only. YouTube's 11-char id is already clean, so `sanitizeVideoId()` is a no-op there and no duplicate appears.


## The fix (`claude - VideoPlayer fix videoID #2`)

Rather than patch the duplicate at `doPostOnPlaying()` alone, I routed the
plugin-fed id through the same shared `sanitizeVideoId()` helper at the
**single point it enters the module** — inside `applyVideoData()`, right
before `player.videoData = videoData` (lines 4269–4317). Because it runs
before the assignment, every native consumer of `player.videoData.videoId`
now sees the same key `embedRunVideo()` persisted:

- `doPostOnPlaying()` → `createEntry`/`enrichEntry`/`setActiveItem` (fixes the reported double-add)
- `updateEntryDuration()` on `durationchange` (line 4301)
- `updateEntryPosition()` on state change (line 4119)
- the `activeVideoId` resolution used to rebuild the plugin playlist (line 3457)

Those last three were latent keying bugs too — they'd silently target the
un-persisted dotted key. This closes the last derivation site the `#1` note
flagged, "so the duplicate-check id can never drift from the persisted key."
The repair is idempotent and reassign/log-only-when-changed, matching
the `#1` pattern.


**Two things to note:**

The fix mutates the plugin's `videoData` object in place (it's assigned to
`player.videoData` immediately after, and `onVideoDataResolved` is its sole
consumer). I flagged this as a DESIGN NOTE in the code with the non-mutating
clone alternative, in case you prefer that.

I used the tag `claude - VideoPlayer fix videoID #2` (consistent spelling
with `#1`), not the literal `VidoPlayer` from your message — I assumed that
was a typo so `grep -c "VideoPlayer fix videoID"` keeps counting the whole
series. Say the word if you actually want the `VidoPlayer` spelling.

