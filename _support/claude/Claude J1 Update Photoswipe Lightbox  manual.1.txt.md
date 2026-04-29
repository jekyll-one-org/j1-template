Prompt
  https://claude.ai/chat/4c4c5c6a-eb95-4fec-bf68-1f81f7df5db6
--------------------------------------------------------------------------------

PhotoSwipe Lightbox is a JavaScript library to create lightboxes placed
on images in webpages. When you click such extended images, they open in
a new, overlaying layer, darkening the background and focusing the image.

Check and update the attached JavaScript and the related manual pages for
PhotoSwipe Lightbox. Use simple, common English that is understandable to
beginners who are not experienced with JavaScript modules or APIs for
J1 Template and PhotoSwipe Lightbox in general.

Create fixed versions and use the comment
"claude - Update Photoswipe Lightbox manual #1" for all proposed fixes.


Claude
--------------------------------------------------------------------------------

Now I have enough context to understand the files. Let me analyze the issues I've found:I've reviewed all the files. Here are the issues I found:

**Issues in `photoswipe.js` (the J1 adapter):**
- Uses non-existent API call `PsLightbox.Lightbox.init(options)` — the real API is `new PhotoSwipeLightbox(options); lb.init();`
- `open(url)` wrapper calls `lb.open(url)` which doesn't exist — actual method is `loadAndOpen(index, dataSource, point)`
- Missing `pswpModule: PhotoSwipe` requirement in the init flow
- Caption plugin (uploaded but not wired up) never instantiated

**Issues in `100_photoswipe_core_parameters.asciidoc`:**
- Duplicate `pswpModule: PhotoSwipe` in `closeOnVerticalDrag` example (line 113)
- `appendToEl` is hidden under `mainClass` heading using wrong `====` level (line 283)
- `showAnimationDuration` example wrongly shows `escKey: false` (line 465)
- Sparse descriptions for `clickAction`, `tapAction`, `zoomLevel`

**Issues in `110_photoswipe_lightbox_methods.asciidoc`:**
- Typo "Bby default" (line 67)
- Inconsistent spacing like `new PhotoSwipeLightbox (` and `document.createElement ('button')`

**Issues in `120_photoswipe_lightbox_events.asciidoc`:**
- ESM import style inconsistent with rest of manual (UMD)
- No prose explanation of what each event does — just `console.log` calls

**Issues in `photoswipe.adoc`:**
- Multiple "Sniper" typos throughout (should be "Swiper")
- Version reference "v11.2.1" — that's the Swiper version, not PhotoSwipe (which is v5.4.4)
- "Initialization" section text confuses lightbox setup with caption plugin setup

Let me now create the fixed versions:Now let me create the fixed version of `100_photoswipe_core_parameters.asciidoc`:Now the main `photoswipe.adoc` file:Now let me move the files to the output directory and run a verification:Only the comment that *describes* the Sniper→Swiper fix mentions the word. All actual typos are fixed.All remaining mentions of `PsLightbox`, `Bby`, and `escKey: false` are either explanatory `// claude - ...` comments documenting the fixes, or the legitimate new example I added under the `escKey` section itself (which now has its own example for the first time — that one *should* contain `escKey: false`).Everything is in order. Now let me present the files:## Summary of fixes

Every change is marked with the comment **`claude - Update Photoswipe Lightbox manual #1`** so you can find them quickly.

### `photoswipe.js` (J1 adapter) — 15 markers
The biggest issues were broken API calls that would have crashed at runtime:
- **`PsLightbox.Lightbox.init(options)` does not exist.** Replaced with the real API: `lb = new PhotoSwipeLightbox(options); lb.init();`
- **`lb.open(url)` does not exist.** PhotoSwipe v5 only has `loadAndOpen(index, dataSource, point)`. The `open()` wrapper now forwards to that method.
- The `init()` block had `_initLightbox()` and `_startDomObserver()` commented out, so nothing was being initialised. Re-enabled them.
- Added optional **Dynamic Caption plugin** wiring (the plugin was uploaded and referenced in the docs but never instantiated).
- Made the `pswpModule: PhotoSwipe` requirement explicit (the lightbox needs a reference to the core class).

### `100_photoswipe_core_parameters.asciidoc` — 9 markers
- Removed duplicate `pswpModule: PhotoSwipe,` line in the `closeOnVerticalDrag` example.
- Promoted `appendToEl` from a hidden `====` sub-heading under the empty `mainClass` section to its own `===` section.
- Fixed the `showAnimationDuration` example that mistakenly contained `escKey: false`.
- Added a self-contained explanation for `clickAction`, `tapAction`, and `zoomLevel` so beginners do not have to leave the page.
- Added an example for `escKey` to match its neighbours.
- Clarified the `getViewportSizeFn` function signature.

### `110_photoswipe_lightbox_methods.asciidoc` — 3 markers
- Fixed typo "Bby default" → "By default".
- Removed inconsistent spaces in `new PhotoSwipeLightbox (`, `document.createElement (...)` and `document.querySelector (...)`.

### `120_photoswipe_lightbox_events.asciidoc` — 6 markers
- Replaced ESM imports with the UMD `pswpModule: PhotoSwipe` style used everywhere else.
- Added a one-line plain-English description for **every** event (initialization, opening/closing, closing, pointer/gesture, slide content) so the meaning is clear without reading the example.

### `130_photoswipe_lightbox_captions.asciidoc` — 4 markers
- Replaced the placeholder `lorem:sentences[3]` with a real introduction explaining how the plugin finds caption text.
- Documented that `captionContent` accepts both a CSS selector **and** a function.
- Updated the `captionContent` row of the parameters table to reflect both types.
- Reworded the layout-decision algorithm so the bullet list reads naturally.

### `photoswipe.adoc` — 6 markers
- Fixed all **"Sniper" → "Swiper"** typos (in three layout examples).
- Corrected the version reference: the docs say v5.4.4 (matching the bundled JS), not v11.2.1 (which is the Swiper version).
- Rewrote the **"Initialization"** section so its description matches its example: it now lists which files are needed (lightbox + core + CSS, plus optional caption plugin) and shows the proper `new PhotoSwipeLightbox(...) → new PhotoSwipeDynamicCaption(...) → init()` order.
- Replaced placeholder `lorem:sentences[3]` blocks with short, useful intros for the three HTML layouts.
- Cleaned up the awkward `preloadFirstSlide:, boolean,` notation and explained what the option actually does.
- Added inline comments to the **Translating** code block so each string's UI role is obvious.

