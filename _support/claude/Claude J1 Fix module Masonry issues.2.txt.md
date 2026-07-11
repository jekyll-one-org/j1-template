Prompt
  https://claude.ai/chat/1650e27c-c20b-4fda-a802-ad747425ef65
--------------------------------------------------------------------------------

On fix commented by "claude - Fix Masonry module error #1". The fix was
tagged by:

One suggestion beyond this fix:

The trigger itself is the adapter initializing before the container is
laid out — if the error recurs (now as a harmless 1-column first paint),
a follow-up in the adapter could defer init until the container reports
a non-zero width.

Create fixed versions and use the comment "claude - Fix Masonry module error #2"
for all proposed fixes.


Claude
--------------------------------------------------------------------------------

Fix #2 is done. Here's the full report.

## File collision — please note

Both uploads arrived as `masonry.js`, and the second overwrote the first. Only the **core module** (Masonry v4.2.2 packaged, 2598 lines, all 3 `Fix #1` tags present) survived in the uploads folder. The **adapter** upload was lost. Fix #2 is adapter-side, so I used the adapter from project knowledge (`~/assets/theme/j1/adapter/js/masonry.js (2)`, header `(2)`, "split J1 Masonry data #3" state) as the base — please confirm that copy matches your working tree. Per our convention, the deliverable is named `adapter_masonry.js`.


## What Fix #2 does

The original per-grid setup body ran directly inside
`setTimeout(() => {...}, masonryOptions.initTimeout)`, regardless
of whether the container was measurable yet. The fix wraps that
body — byte-identical, unmoved — into a named function `initGrid_{{grid_id}}()`
with a width gate at the top:

1. On each invocation, the container is re-queried via
  `document.getElementById('{{grid_id}}')` and probed with
  `offsetWidth > 0` (zero for detached, `display:none`, or
  not-yet-laid-out containers — exactly the trigger conditions).

2. While not measurable, the setup re-schedules itself with a
   bounded retry: **50 attempts × 100 ms = max. 5 s**.

3. If the budget is exhausted, the setup runs anyway as a last
   resort — the core module's Fix #1 guards keep that path safe
   (single-column fallback, recomputed on the next resize).

4. The configured `masonryOptions.initTimeout` from `masonry.yml`
   is kept unchanged as the first-attempt delay.

Per-grid variable suffixing (`initAttempts_{{grid_id}}`, etc.) follows
the existing `$grid_{{grid_id}}` style, so multiple grids on one page
stay isolated.


## Flagged during the audit (not changed — out of scope)

In the per-grid interval `dependencies_met_html_loaded_{{grid.id}}`, the `clearInterval(...)` call sits **outside** the `if (xhrLoadState === 'success')` block, so the interval is cleared unconditionally on its first 10 ms tick. If the XHR portion isn't in `success` state within that first tick, the grid setup is never scheduled at all. In practice the page-ready gate (`j1CoreFinished && pageVisible`) usually means the XHR has long completed — but this is the same race-condition family, and moving the `clearInterval` inside the success branch would be a natural candidate for a Fix #3 if you want it.

