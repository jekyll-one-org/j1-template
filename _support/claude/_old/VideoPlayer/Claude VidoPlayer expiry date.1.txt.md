Prompt
   https://claude.ai/chat/18f62664-f9dc-4b73-a04b-93286a923776
--------------------------------------------------------------------------------

```
<div class="edit-field-group">
   <label class="edit-field-label" for="editFieldIssueDate">Issue Date</label>
   <input id="editFieldIssueDate" type="date" class="edit-field-input" placeholder="e.g. 2026-01-01" />
</div>
```

J1 VideoPlayer is a complete video player engine built on top of VideoJS.
It gives every video the same good-looking, skinnable player, and it adds
a full playlist on top: a searchable, sortable list of videos that the
viewer can play, rate, and continue from where they left off. It plays two
kinds of video: native videos and YouTube videos.

For some locations, access to their sources is time-limited (expiry date).
Similar to "editFieldIssueDate" a new field should be added to "const modalHTML"
in file videoPlayer.js.

By default, this expiry date should be set to unlimited. If set, the background
color should be set to "yellow" 4 weeks before, and set to "red" 2 weeks before
and if the date is reached.

If the expiry date is reached, playing the affected playlist should be disabled
and a log warning message issued.

Create extended versions and use the comment
"Claude - Modify J1 VideoPlayer expiry date #1" for all proposed fixes.


Claude
--------------------------------------------------------------------------------

Tag census is clean: all 37 prior-series tags byte-identical, only the
new series added. Now a functional smoke test of the state machine and
playback gate.

All DOM tests pass. Now the playback gate and persistence round-trip.
Everything passes. Final verification pass, then delivery.
Both files delivered.

| Check | Result |
|---|---|
| `node --check` (after Liquid strip) | OK |
| `tinycss2` parse | 159 rules, 0 errors |
| Zero-deletion proof — JS | 9456 → 9815 (+359), **0 originals missing** |
| Zero-deletion proof — CSS | 1517 → 1586 (+69), **0 originals missing** |
| Prior-series tag census | **0 deltas** — all 37 prior tags byte-identical |
| New tags | 23 in JS, 2 in CSS |


## Functional simulation (passing)

**State machine** (14 cases)
Boundaries verified exactly at 29/28 days (ok→yellow) and 15/14 days
(yellow→red). Unset, whitespace, garbage text, missing key, and `null`
entries all resolve to `unlimited`/not-expired — a malformed record can
never lock a video out.

**Timezone stability** (7 zones incl. Kiritimati +14 and Midway −11)
`daysLeft(today) === 0` everywhere. This is the bug the local-midnight
parsing avoids — `new Date('2026-01-01')` parses as UTC and lands on
the previous local day at negative offsets.

**DOM colouring + ownership hand-off**
(jsdom, code extracted verbatim from the patched file): the critical one
is that red **survives 20 consecutive handler sweeps** (~10 s of the 500 ms poll).
Neutral states hand ownership back correctly, and unrelated inputs are
provably untouched by the new guard.

**Playback gates** (all three paths)
`expired` and `today` blocked with a warning on every path.
`valid`/`warn`/`unlimited`/`legacy` play normally. An unknown source id
passes through unblocked, as intended.

Sample warning:
```
playlistmanager: playback DISABLED for videoId: expired -
access expired on 2026-08-09 (Access EXPIRED 1 day(s) ago - playback disabled)
```


## Header revisions

Open decisions from before still stand:

The **boundary semantics**
(flip `EXPIRY_EXPIRED_AT_DAYS_LEFT` to `-1` if the expiry day should be the
last *valid* day) and the **entry-vs-playlist scope** of the block.

Candidates for a follow-up fix: lunr index schema, sort options, and visual
marking of expired rows — currently a blocked play overlay does nothing
visible except log.

