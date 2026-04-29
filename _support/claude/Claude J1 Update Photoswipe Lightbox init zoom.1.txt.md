Prompt
  https://claude.ai/chat/4f0c6b88-01af-4459-9e14-4f269d11b265
--------------------------------------------------------------------------------

```
    PhotoSwipeLightbox.autoInitDefaults = {
      bgOpacity:              1,
      showHideOpacity:        true,
      loop:                   true,
      wheelToZoom:            true,
      imageClickAction:       'next',
      tapAction:              'next',
      padding:                { top: 0, bottom: 0, left: 80, right: 80 },
      zoom:                   false
    };
```

PhotoSwipe Lightbox is a JavaScript library to create lightboxes placed
on images in webpages. When you click such extended images, they open in
a new, overlaying layer, darkening the background and focusing the image.

If the property "zoom" is set to false for autoInitDefaults, the mouse cursor
should be set to a hand/finger pointer (cursor: pointer, default: zoom-in).

Create an modified version and use the comment
"claude - Update Photoswipe Lightbox init zoom #1" for all proposed fixes.


Claude
--------------------------------------------------------------------------------

Let me look at the relevant parts of the file to understand the full context
before making changes. Now I have a clear picture.

Here's my plan:

**The issue:** When `zoom: false` is set in `autoInitDefaults`, PhotoSwipe core skips applying the `pswp--zoom-allowed` class, so the CSS rule that gives `.pswp__img` the `zoom-in` cursor never matches. The image then falls back to the base `.pswp__img { cursor: zoom-out }` rule — which is wrong UX, since zoom is disabled.

**The fix:** Two coordinated changes:
1. **JS** — In `autoInit()`, when the resolved options have `zoom === false`, inject a `pswp--no-zoom-cursor` class via PhotoSwipe's `mainClass` option (preserving any existing `mainClass`).
2. **CSS** — Add a rule that targets that class and sets `cursor: pointer` on the image.

Let me build the modified files.Now apply the JS change — inject `pswp--no-zoom-cursor` into `mainClass` when `opts.zoom === false`:Now update the CSS — add cursor rules for the new marker class. I'll place them near the existing `.pswp__img` cursor rules so the override is local and easy to find:Verify both edits landed cleanly:Now run a quick syntax check on the JS to make sure I haven't broken anything:Both files are clean. Move them to outputs and present:## Summary of changes

**Why the change touches both files:** the `zoom` option is a runtime JS flag, but the cursor is decided by CSS. PhotoSwipe core only paints `pswp--zoom-allowed` on its root when zoom is enabled — so when `zoom: false`, none of the existing zoom-cursor rules match, and the image silently falls back to the base `.pswp__img { cursor: zoom-out }` declaration (a zoom-out cursor on an image that can't be zoomed). One file alone can't fix that cleanly.

**`photoswipe-lightbox.js`** — inside `autoInit()`'s per-element loop, after `opts` is merged but before `new PhotoSwipeLightbox(opts)`, I check for `opts.zoom === false` and append `pswp--no-zoom-cursor` to `opts.mainClass`. Appending (rather than overwriting) preserves any caller-supplied `mainClass`. This works for the baked-in `autoInitDefaults`, for `autoInitOptions` overrides, and for per-element `data-pswp-options` — wherever `zoom: false` ends up in the final merged options.

**`photoswipe.css`** — added one rule, `.pswp--no-zoom-cursor .pswp__img { cursor: pointer }`, with an `:active` companion so the click doesn't briefly flicker into `grab`/`grabbing` from the existing click-to-zoom rules above it.


All edits are tagged `claude - Update Photoswipe Lightbox init zoom #1`
as you specified.
