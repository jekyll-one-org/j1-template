Prompt
  https://claude.ai/chat/8c2a0ba8-2e03-48a8-8dfb-12fafee795d4
--------------------------------------------------------------------------------

J1 MultiPlayer, derived from the VideoPlayer module, is a complete player
engine built on top of VideoJS. It gives every audio and video the same
good-looking, skinnable player, and it adds a full playlist on top:
a searchable, sortable list of media items that the viewer can play, rate,
and continue from where they left off. It plays native mp3 audio files and 
two kinds of video: native videos (mp4) and YouTube videos.

MultiPlayer supports the ZoomButtons plugin for videoJS:

```
   // load piZoomButtons (mp4 files only)
   if (piZoomButtons.enabled && isMP4) {
      vjsPlayer.zoomButtons({
         moveX:  piZoomButtons.moveX,
         moveY:  piZoomButtons.moveY,
         rotate: piZoomButtons.rotate,
         zoom:   piZoomButtons.zoom
      }); 
   }
```

The zoom buttons (zoom) are created in by the plugin (zoom.js) created via
"const move". The zoom buttons buld a cross:

```
        cross--top
            |         
   --- cross--middle ---
            |
       cross--bottom
```

The current positions of cross--top and cross--bottom are correct and aligned
centered each other. The element of the cross--middle
row div class="vjs-zoom-buttons__container--row cross--middle"
are not correcly aligned.

The button id="vjs-zoom-buttons__reset" should the center of the cross,
aligned centered to cross--top and cross--bottom.

Create modified versions and use the comment:
"Claude - Fix multiPlayer arrange piZoomButtons #1" for all proposed fixes.


Claude
--------------------------------------------------------------------------------

**Root cause**

`.vjs-zoom-buttons__container--row` had **no CSS rule at all**. Every
row was a plain block box holding inline-block cells, so a row's horizontal
geometry depended on what it contained:

- `cross--top` / `cross--bottom`:
  `span.__space` (22px, no padding) + button + span

- `cross--middle`:
  three `<button>` elements — and buttons inherit the user-agent padding
  (`1px 6px`), which the stylesheet only reset on `:hover`

So the middle row was wider than the outer rows and its glyphs were
additionally pushed right by the button's left padding. The reset button
therefore never sat on the vertical axis of `moveUp` / `moveDown`.

**Fix (CSS only — `zoom.js` needs no change)**

- Every `--row` is now a centered flex row with fixed 22px cells
  and one common 6px gap → all rows get identical geometry regardless
  of whether they use buttons or spacer spans.

- `.__button` and `.__space` get `box-sizing: border-box`,
  `flex: 0 0 22px`, `padding: 0`, `margin: 0`.

- The glyph is centered inside the 22px button box
  (`inline-flex` + a 22px glyph box), so it no longer starts at the
  content-box edge.

- The `:hover` padding resets became obsolete (padding is now 0 in all
  states, so the glyph no longer jumps on hover).

- `.__container.open` gets `align-items: center` plus a 6px row gap.


# Out of scope, noted for later

 `ZoomModalContent._createContent()` (zoom.js:352) does
 `var options = mergeOptions(DEFAULT_OPTIONS, options);` — `options`
 is read before it is assigned in its own declaration, so the merge
 always falls back to `DEFAULT_OPTIONS`.
 
 The `showZoom` / `showMove` / `showRotate` options passed by `player.js`
 are silently ignored.
 
 Candidate for *Fix multiPlayer arrange piZoomButtons #2*.

