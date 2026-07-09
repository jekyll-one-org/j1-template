Prompt
  https://claude.ai/chat/6836e993-13b1-47d8-b722-b577fc2091bd
--------------------------------------------------------------------------------

```
  # --------------------------------------------------------------------------
  # Player 3 – Tiny Desk Concerts
  #
  - player:
    enabled:                          true

    # GENERAL options
    #   
    id:                               player_tiny_desk_concerts
    description:                      NPR Tiny Desk Concerts

    # UI settings
    ui_elements:
      edit_playlist_button:           false

    # videoJS settings
    videoJS:
      autoStart:                      true

      playbackRates:
        enabled:                      false

      plugins:
        playlist:
          enabled:                    false
```

For multiple configured players, the values from the (YAML) configuration files
are applied per instance on the fix commented by
"claude - Modify J1 VideoPlayer #48".

For the HTML data, the adapter and the module (factory api), loading the
config files should implement the inheritance chain.

For the player 3 (Tiny Desk Concerts), the videoJS settings never get applied
on the config options to be used in the VideoPlayer module (factory api).

Create fixed versions and use the comment "claude - Modify J1 VideoPlayer #49"
for all proposed fixes.


Claude
--------------------------------------------------------------------------------

The core module (`modules/videoPlayer/js/videoPlayer.js`) is fixed.
Here's the summary.

## Root cause

Per-player options handed to the factory 
  `videoPlayer(id, options)` → `setAdapterOptions()` → instance-level `adapterOptions`
were **stored but never read**.

Seven runtime sites read the page-global `j1.adapter.videoPlayer.videoPlayerOptions`
instead. The decisive one is inside `onReady`, where `videoPlayerOptions = j1.adapter.videoPlayer.videoPlayerOptions;` clobbered the instance options immediately before
every `videoJS.*` evaluation (`autoStart`, `playbackRates.enabled`, `plugins.playlist.enabled`, …). 

Player 3's overrides therefore had no effect, ever — regardless of what the adapter merged at #48.


## Fix #49 (8 tags, all `// claude - Modify J1 VideoPlayer #49`)

1. **New central resolver**
   `_resolveVideoPlayerEffectiveOptions()` (after the module variables block):
   per-instance `adapterOptions` first (only if it carries a `videoJS` subtree,
   so a sparse object can never break unguarded deep reads), then the page-global
   adapter options, then the module snapshot. Single-player behaviour stays identical.

2. **`_resolveNativePosterConfig()`** — rewired through the resolver.

3. **`autoLoadFirstEntryOnReload()` readiness gate** 
   now also passes for players configured exclusively per-instance.

4. **`_resyncPluginPlaylist()`**
   per-player `plugins.playlist.enabled` governs the resync guard.

5. **loadstart autoplay branch** — per-player `nextPrevButtons.autoplay`.

6. **`onReady` snapshot** — the root-cause line, now resolver-based.

7. + 8. **`createVideoJsPlayer()`**
   YouTube and native tech configs — per-player
   `videoJS.players.youtube` / `videoJS.players.native`.


## The adapter — I need it re-uploaded

Both uploads arrived under the identical filename `videoPlayer.js`, so one
overwrote the other and only the core module reached me. The project-knowledge
adapter copy is at an old state (tags only up to Modify #12 / Unique #7
pre-MultiInstance, no #46–#48), so producing #49 against it would break the
byte-identical prior-series constraint. Please re-upload the current adapter,
ideally renamed (e.g. `adapter_videoPlayer.js`).

The adapter-side #49 contract is already documented in the resolver comment:
the object handed to `videoPlayer(id, options)` at the #48 per-instance site
must be the **complete three-layer deep merge including the per-player
`videoJS` subtree** from `videoPlayer_control.yml` — not only
`ui_elements`/`playlist` keys.

That's the "inheritance chain" half; with the core fix above, those merged
values will actually take effect. Once I have the current adapter, I'll audit
whether its #48 merge already includes `videoJS` (and fix it under the same
#49 tag if not), plus verify it passes the merged object to the factory rather
than only assigning the global namespace.

