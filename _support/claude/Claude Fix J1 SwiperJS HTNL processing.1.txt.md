Prompt
  https://claude.ai/chat/766e242d-159c-4810-bdaa-530884640b91
  KO
--------------------------------------------------------------------------------

For SwiperJS sliders, the HTML template (swiper.html) uses the ul/li pattern
for the Swiper Wrapper (slides). The sliders are working error-free, but the
Google Chroem/Lighthouse validator marks those list structures as follows:

```
Lists do not contain only <li> elements and script supporting elements (<script> and <template>).
```

Why is it?

Create fixed versions and use the comment "Fix J1 SwiperJS HTML processing #1"
for all proposed fixes.


Claude
--------------------------------------------------------------------------------

Now I'll apply the fix to the parallax layout — relocating the two `<style>`
blocks out of the `<ul>`
Now the adapter — the actual root cause fix:
Now the new adapter method:Now validating — Liquid strip, `node --check`,
zero-deletion diff, and a functional simulation:## Why the validator complains

The message is the **axe / Lighthouse `list` rule** (`<ul>` and `<ol>` must
only directly contain `<li>`, `<script>` or `<template>`). It inspects the
**live DOM**, not your template — which is exactly why the sliders work and
the authored HTML looks fine.

Two independent causes, one per file:

**1. `swiper.js` (adapter) — the real root cause, present on *every* slider**

The SwiperJS a11y module is enabled by **default** (`a11y.enabled: true`) and
stamps `a11y.slideRole` — default **`'group'`** — onto every `.swiper-slide`
when the Swiper is created:

```html
<li class="swiper-slide" role="group" aria-label="1 / 5">
```

An explicit role *replaces* an element's implicit role. So each `<li>` loses
its implicit `listitem`, and the `<ul>` is left with **zero listitem children**.
I verified this against the real axe-core 4.10 check and vnu.jar:

| markup | axe | Nu |
|---|---|---|
| `<li>` (authored) | pass | pass |
| `<li role="group">` (after Swiper init) | `list` + `aria-allowed-role` | *"An element with role=group must not be a child of an element with role=list"* |
| `<li>` with slide role off | **clean** | **clean (no warnings)** |

Your `ul/li` markup and Swiper's ARIA-carousel pattern are simply fighting
each other — `uno.css:106` (`ul.swiper-wrapper { list-style-type: none }`)
is the tell that the list semantics were never actually wanted.

**2. `swiper.html` — layout `text/parallax` only**

Two `<style>` elements sat as direct children of `<ul class="swiper-wrapper">`
(they depend on `swiper` only, not `media_set` — they were nested in the
media_set loop by accident).


## The fixes

**`adapter_swiper.js`**

New `enforceListSemantics(swiperEl, params)`. Detects a list wrapper
(`ul|ol|menu`) and turns the slide role off
(`a11y.slideRole: ''` → falsy → Swiper skips `addElRole()`), so the `<li>`
keeps its implicit `listitem`. `<div>` wrappers, explicitly disabled a11y,
and an explicitly configured non-`'group'` slideRole are left untouched.
To hook it in, the Swiper parameters are now built as an object first,
then post-processed before `new Swiper()` (both the Stacked and non-Stacked
branch).

**`swiper.html`**

Both `<style>` elements plus their Liquid var init relocated out of the
wrapper. Nothing deleted; a marker comment sits at the original position.


**Flagged, out of scope**
Documented in the headers, not touched:

1. `<style>` in `<body>` is *itself* a Nu error — after the relocation
   you still get *"Element style not allowed as child of element body"*.
   Proper fix: inject the parallax CSS into `<head>` from the adapter,
   or move it to a stylesheet.

2. The parallax CSS is not scoped by swiper id — two `text/parallax`
   sliders overwrite each other.

3. `{% if swiper_layout != 'Base' or swiper_layout != 'Parallax' %}`
   is always true.

4. `swiper.modules.navigation` vs `swiper.module_settings.navigation`
    inconsistent key across layouts in `swiper.html`.

Header revision bumps left to you. If you'd prefer the *other*
direction — `div/div` stock Swiper markup, keeping `role="group"` (the
ARIA carousel pattern, better a11y for a carousel) — that's
a `swiper.html`-only change and the adapter fix becomes a no-op
automatically.

