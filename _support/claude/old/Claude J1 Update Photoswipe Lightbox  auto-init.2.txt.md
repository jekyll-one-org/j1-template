Prompt
  https://claude.ai/chat/22b8aa01-b96d-42de-ad0e-45e297293eaa
--------------------------------------------------------------------------------

PhotoSwipe Lightbox is a JavaScript library to create lightboxes placed
on images in webpages. When you click such extended images, they open in
a new, overlaying layer, darkening the background and focusing the image.

The module photoswipe-lightbox.js has been extended to support
auto-initialization using a set of default options.

A comment marked all changes
"claude - Update Photoswipe Lightbox auto-init #1".

Like manual initialization, for auto-initialization the captionPlugin
should be enabled by default.

```
// Setup Lightbox Captions
// ---------------------------------------------------------------
const captionPlugin = new PhotoSwipeDynamicCaption (swiperId, {
type: 'auto'
});
```

Create an extended version and use the comment
"claude - Update Photoswipe Lightbox auto-init #2" for all proposed fixes.


Claude
--------------------------------------------------------------------------------

Now I have a clear picture.
Let me read the caption plugin's defaults more carefully to confirm the
integration contract.
Confirmed: the caption plugin must be constructed with `(lightbox, options)`
and instantiated before `lightbox.init()` is called (it hooks the `init` event).
Now I'll create the extended version. Now I'll make three coordinated edits,
each marked with `claude - Update Photoswipe Lightbox auto-init #2`:

**Edit 1** — extend the documentation block to advertise the new caption API and data attributes:**Edit 2** — insert the caption-plugin auto-attach block (static API + helper functions) right after the existing `auto-init #1 (end)` block:**Edit 3** — wire the caption attach call into the `autoInit()` loop, between `new PhotoSwipeLightbox(opts)` and `lb.init()`:Now let me verify the three edits are coherent by viewing the modified regions:Markers in all three regions. Let me do a syntax sanity check and verify the wiring looks right:The wiring is correct: construct → attach caption → init, matching the plugin's `lightbox.on('init', ...)` contract. Let me also do a quick runtime sanity check on the helper logic by extracting and testing it in isolation:All seven behavioural checks pass. Let me move the final file to the outputs directory:**Summary of changes** (all marked `claude - Update Photoswipe Lightbox auto-init #2`):

1. **Doc-block update** (top of the auto-init section) — adds two new per-gallery data attributes (`data-pswp-caption`, `data-pswp-caption-options`) and three new static API entries to the public surface list.

2. **New caption-attach block** (right after the `auto-init #1 (end)` marker) — adds:
   - `PhotoSwipeLightbox.autoInitCaptionEnabled` (default `true`)
   - `PhotoSwipeLightbox.autoInitCaptionDefaults` (default `{ type: 'auto' }`)
   - `PhotoSwipeLightbox.autoInitCaptionPlugin` (lazy fallback to `window.PhotoSwipeDynamicCaption`)
   - Helpers `_autoInitReadCaptionOptions()` and `_autoInitAttachCaption()`

3. **`autoInit()` loop wiring** — calls `_autoInitAttachCaption(lb, el)` *between* `new PhotoSwipeLightbox(opts)` and `lb.init()`, so the plugin's `'init'`-event listener fires on the right instance.

**Key design points**

- *Captions on by default.* No caller change is needed: load `photoswipe-caption-plugin.js` before this file and every auto-initialised gallery gets a caption with `type: 'auto'`.
- *Resolution order* mirrors the existing `pswpModule` fallback — explicit static slot wins, then `window.PhotoSwipeDynamicCaption`. Missing plugin → one console warning total, not one per gallery.
- *Per-gallery overrides.* `data-pswp-caption="false"` opts out for one gallery; `data-pswp-caption-options='{"type":"below"}'` merges over the defaults (invalid JSON falls back silently, matching `_autoInitReadOptions`).
- *No teardown plumbing needed.* `lb.destroy()` already fires `slideDestroy`, which the plugin handles to remove its caption nodes; the plugin instance becomes garbage-collectable when `autoInitDestroy()` drops the lightbox from `_autoInitInstances` / `_autoInitInstanceSet`.
- *Backwards compatible.* Manual `new PhotoSwipeLightbox(...) + new PhotoSwipeDynamicCaption(...)` users are untouched — the new code only runs for elements matching `autoInitSelector`.

Verified with `node --check` (syntax) and a 7-case smoke test covering happy path, per-element options merge, opt-out, global disable, missing-plugin warn-once, and invalid-JSON fallback — all pass.

