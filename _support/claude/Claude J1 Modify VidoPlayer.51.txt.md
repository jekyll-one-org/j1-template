Prompt
  
--------------------------------------------------------------------------------

When the playlist mode is toggled from list to cards by the switch
div id="playlistModeSwitch_player*", the number of cards displayed per
row is controlled by CSS styles:

```
.playlist.card-mode {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
}
```

The config setting cards/perRow defines how may cards should be displayed
per row:

```
  playlist:
    preload:                        []
    cards:
      perRow:                       4
```

For the top-level div element with id "videoplayer_playlist_parent_player_*",
additional styles should be added to override the CSS property
"grid-template-columns".

Create fixed versions and use the comment "claude - Modify J1 VideoPlayer #51"
for all proposed fixes.


Claude
--------------------------------------------------------------------------------

Now let me look at the render/mode-switch sections. Now the core change — a per-instance resolver + DOM writer in `videoPlayer.js`:Now wire it into the three places that own the container's mode class.Now the stylesheet — make the column count data-driven with a safe fallback:Now `playlistCards.mjs` — the Lit card renderer is layout-transparent, so it needs a way to drive the same variable if an adapter uses it directly:Finally, document the key in the defaults YAML so the setting is discoverable:Now validation — syntax, YAML parse, and a check that no call site was missed:Root cause: `playlist.cards.perRow` was never read anywhere in the module — `grep perRow videoPlayer.js` returned nothing. The column count lived only in the stylesheet as a hard-wired `repeat(2, 1fr)`.


**videoPlayer.js** — new instance-scoped helpers after `_pid()`:

- `_resolveCardsPerRow()` reads `playlist.cards.perRow` through 
  `_resolveVideoPlayerEffectiveOptions()`, so per-player overrides win
  over the page-global merge (same contract as #49). Defensive at every level,
  clamped to 1..6, falls back to 2.

- `_applyCardsPerRow(el)` writes **two** inline declarations onto
  `#videoplayer_playlist_parent_<id>`: the custom property
  `--playlist-cards-per-row: N` *and* the longhand `grid-template-columns: repeat(N, 1fr)`.
  The longhand is belt-and-braces for pages still served a cached,
  pre-#51 stylesheet.

- `_clearCardsPerRow(el)` strips both on the way back to
  list mode — `className = '...'` doesn't touch the style attribute, so
  the geometry would otherwise persist.

Wired into all four sites that own the mode class: both branches of
`renderCurrent()`, plus `renderPlaylist()` and `renderCards()` (which
re-assert it on every sort/search/delete re-render). `renderCurrent()` is
the one the mode switch calls, and it's also the only one that runs on
an empty playlist.


**videoPlayer.css** 
`grid-template-columns: repeat(var(--playlist-cards-per-row, 2), 1fr)`.
The fallback `2` reproduces the old behaviour when nothing is configured.

One cascade detail worth flagging: inline styles outrank a normal author
rule but **lose to `!important`**. That's load-bearing here — it's why
`.playlist.list-mode { grid-template-columns: none !important }` and
the ≤991.98px single-column media query still win over the inline `perRow`.
Phones keep one column even with `perRow: 4`. I documented that in both
files so the `!important` doesn't get "cleaned up" later.


**playlistCards.mjs** 

Optional `cardsPerRow` property, defaulting to `null` (no-op) so the Lit
component never fights the module writing the same declarations. When set,
it writes to `this.parentElement`, not the host: the host has
`display: contents`, so it generates no box, and custom properties inherit
downwards, never up to the grid container.

**videoPlayer.yml** — documented the key in the defaults block.
