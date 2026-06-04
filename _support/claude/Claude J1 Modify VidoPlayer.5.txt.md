Prompt
  https://claude.ai/chat/f5cd774a-1e8d-47dd-859e-3262f8fc1de6
-----------

The current toggle element

```
<img id="video_player_header_arrows"
  class="video-player-header-arrows"
  src="/assets/theme/j1/modules/videoPlayer/icons/player/dark/playlist-show.svg"
  aria-label="Show playlist"
  alt="Show playlist">
```  

should be rewritten into a button like:

```
<button id="video_player_header_arrows"
  class="video-player-header-arrows"
  title="Show playlist"
  alt="Show playlist"
  aria-label="Show playlist">
  ..
</button>
```

The toggle functionality (toggle: Show/Hide playlist) for the span inside
the div element id="show_playlist_video_player" should preserved if clicking
the button.

Create fixed versions and use the comment
"claude - Modify J1 VideoPlayer #5" for all proposed fixes.


Claude
--------------------------------------------------------------------------------

Now let me read the CSS file to understand the current styling for the toggle button and arrows:Now let me read the adoc template to see the full HTML structure of the toggle element:Now I have a complete picture of all three files. Let me analyze what needs to change:

1. **`videoPlayer.adoc`**: The `<img id="video_player_header_arrows">` inside `<div id="show_playlist_video_player">` must become a `<button>` containing the `<img>` and a `<span>`. The div itself loses its click role (the button takes it).
2. **`videoPlayer.js`**: `closePlaylist()` and `initPlayerUiEvents()` use `togglePlaylistBtn.querySelector('img')` to update `img.src/alt/aria-label` — this must continue to work since the `<img>` stays inside the button. The span queries also work unchanged. Need to update the comment tags.
3. **`videoPlayer.css`**: `.video-player-header-arrows` is currently styled as an `img` positioned absolutely. It needs to become a button-reset style, and the `<img>` inside it needs its own sizing rule.Now I have everything I need. Let me produce all three fixed files:**videoPlayer.adoc** — replace the `<img>` toggle with a `<button>` containing `<img>` + `<span>`:**videoPlayer.js** — update `closePlaylist()` to set `button.title` + `button.setAttribute('aria-label')` (the `<img>` alt/aria-label are now on the button's child `<img>`, and `title`/`aria-label` live on the button itself). Also annotate with the new comment tag:Now update `initPlayerUiEvents()` — the OPEN branch also sets `img.setAttribute('aria-label')`, which should move to the button, and add the `#5` annotation:**videoPlayer.css** — restyle `.video-player-header-arrows` as a button reset and add an `img` child rule:Now verify the final state of all three changed areas:All changes look correct. Copy to outputs:Here's a summary of every change made, all tagged `// claude - Modify J1 VideoPlayer #5`.

---

### `videoPlayer.adoc`

The `<img id="video_player_header_arrows">` is replaced with a `<button>` wrapping a child `<img>`. The outer `<div id="show_playlist_video_player">` and `<span>Show Playlist</span>` are untouched:

```html
<button
  id="video_player_header_arrows"
  class="video-player-header-arrows"
  title="Show playlist"
  aria-label="Show playlist">
  <img
    src=".../playlist-show.svg"
    alt="Show playlist">
</button>
```

`title` + `aria-label` live on the `<button>`; `alt` lives on the child `<img>`. No `alt` on the button itself (that's not valid on non-img elements).

---

### `videoPlayer.js`

**`initPlayerUiEvents()`** — two corrections:

1. `togglePlaylistSpan` now uses `.closest('.video-player-header').querySelector('span')` instead of `togglePlaylistBtn.querySelector('span')`, because the `<span>` is a sibling of the button, not a descendant.
2. The OPEN branch now sets `btn.title` / `btn.setAttribute('aria-label')` on the button, and only `img.alt` on the child `<img>` (removed the stale `img.setAttribute('aria-label')` from the img).

**`closePlaylist()`** — same pair of corrections in the CLOSE / reset branch: `btn.title` + `btn.setAttribute('aria-label')` on the button; `img.alt` on the child `<img>` only.

---

### `videoPlayer.css`

`.video-player-header-arrows` is extended with a full **button reset** (`background: none; border: none; padding: 0; margin: 0; line-height: 0`) so browsers don't render any native button chrome. Position and `cursor: pointer` are kept exactly as before. Two new rules are added:

- `.video-player-header-arrows:focus-visible` — a white outline for keyboard navigation.
- `.video-player-header-arrows img { display: block; }` — prevents the inline baseline gap that browsers add to `<img>` elements.

