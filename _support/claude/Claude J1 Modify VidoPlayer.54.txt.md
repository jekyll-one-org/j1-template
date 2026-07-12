Prompt
  https://claude.ai/chat/4cf5ecc3-5df0-4e8b-8c74-bfd0d0d2dd43
--------------------------------------------------------------------------------

Based on the fix commented by "Modify J1 VideoPlayer #39", the async function
preloadPlaylists(preloadList, baseUrl, playerId) was added to the VideoPlayer
module.

But in the adapter, the function _loadFirstAfterPreload does not detect a
successful preload (via var loaded):

```
var loaded = vp.playlistManager.autoLoadFirstEntryOnReload();
```

Why is it?

Create fixed versions and use the comment "claude - Modify J1 VideoPlayer #54"
for all proposed fixes.


Claude
--------------------------------------------------------------------------------

The root cause is a **semantic ambiguity in `autoLoadFirstEntryOnReload()`
return value**, combined with a **trigger race** the adapter loses on
every reload:

**1. `false` means three different things**

The core method returns `false` for

(a) *once-only guard already consumed* (#41/#43)
(b) *adapter not ready*
(c) *nothing stored yet*.

Only (b) and (c) are retriable — but the adapter's `var loaded` can't
tell them apart from (a), which is actually a *success* that happened
via a different trigger.

**2. The core's own hook always wins on reloads**

In `initHandlers()`, step 7 (`new vp.playlistSortHandler()`) runs before
the step-12 `#42` call — and `playlistSortHandler.init()` still contains
the original `#41` hook that calls `autoLoadFirstEntryOnReload()` itself.

On any reload with a stored playlist, that hook loads the first entry and
consumes the per-player guard. The `#42` call then sees `false` via
outcome (a), the MultiInstance `#7` condition `!autoLoaded && preloadConfigured.length`
misreads that as "fresh visit", and schedules `_loadFirstAfterPreload()`.


**3. The poll can then never succeed**

Every tick short-circuits at the consumed
guard → `loaded` stays `false` → the poll burns all `preload_attempts`
and logs the misleading "gave up — preload store not ready".

Crucially, this is the *steady state*: the `#39` preload seeds localStorage
on the very first visit, so from the second visit on, every page load hits
this race. The preload and the paused first-entry load both succeeded — the
adapter just couldn't see it.


## Fixes applied (`claude - Modify J1 VideoPlayer #54`)

**Core (`videoPlayer.js`, 8185 → 8233 lines, purely additive)**

New status query `autoLoadFirstDone()` on `PlaylistManager`, returning `!!_autoLoadFirstOnReloadDoneByPid[_playerID]` — it disambiguates
outcome (a) without changing any existing behavior.


**Adapter (`adapter_videoPlayer.js`, 1840 → 1909 lines)**

- Dispatch site: `alreadyDone` is read via the new query
  (typeof-guarded for cores predating #54); the retry is no longer
  scheduled when the sort-handler trigger already loaded the entry.
  The `else`-branch log now reports "reload path — already loaded" correctly
  for this case.

- Poll body: after a falsy `loaded`, an `autoLoadFirstDone()` check treats
  a guard consumed mid-flight as terminal success and stops the retry
  immediately (covers the residual race window on fresh visits).


Flagged, not fixed (out of scope, candidate #55)

`var MAX_ATTEMPTS = attempts;` followed by `var attempts = 0;` re-declares
the parameter — it works today due to hoisting order, but
if `playlist.preload_attempts` is absent in YAML, `MAX_ATTEMPTS` is
`undefined` and the poll never self-terminates.



