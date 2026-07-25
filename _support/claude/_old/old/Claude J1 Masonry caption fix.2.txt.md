Prompt
  https://claude.ai/chat/d0b8893a-806e-4c35-8e77-ec1e73dc1cb4
--------------------------------------------------------------------------------

```
<div class="card bottom">
  <!-- START youtube video -->
  <a href="#" class="lg-item" data-lg-size="1280-720" data-pinterest-text="Pin video Carpool Karaoke James and Adele at //youtube.com/Nck6BZga7TQ" data-tweet-text="Try video Carpool Karaoke James and Adele at //youtube.com/Nck6BZga7TQ" data-src="//youtube.com/Nck6BZga7TQ" data-poster="//img.youtube.com/vi/Nck6BZga7TQ/mqdefault.jpg" data-sub-html="&lt;h2&gt;Carpool Karaoke 2015&lt;/h2&gt; &lt;h3&gt;  James is on holidays in London and picks up  Adele for a ride through the city.  On the way, they sing some of their biggest hits.&lt;/h3&gt;">
	<div class="lg-uno-video-icon">
	  <img id="carpool_karaoke_james_and_adele" class="img-responsive" src="//img.youtube.com/vi/Nck6BZga7TQ/mqdefault.jpg" aria-label="Carpool Karaoke James and Adele">
	  <span class="big-play-button"></span>
	</div>
  </a>
  <!-- END youtube video -->
  <div class="caption">YouTube Video · Carpool Karaoke James and Adele</div>
</div>
```

The module Masonry (masonry.js) provides an ascending grid layout library
that places elements in optimal positions based on available vertical space,
sort of like a mason fitting stones into a wall.

On mouse hover, the element "card" (based on Bootstrap V5 class "card") on
mouse hover on "card bottom" gets enlarged to the height when the caption
overlay is shown. The amount for the height enlargement is the caption
height (.caption).

This is not wanted, the size for width and height should remain unchanged
on mouse hover, because the caption is placed over the existing
card.

What is the reason? 
Can this enlargement behavior be stopped/removed by CSS?

Create fixed versions and use the comment
"claude - J1 Masonry CSS modifications #1" for all proposed fixes.


Claude
--------------------------------------------------------------------------------

I have what I need. Here's the diagnosis and fix.

## Why the card grows on hover

The growth comes from the cascade in `~/scss/theme_uno/extensions/_caption.scss`
**not** from `bootstrap.css` as the existing comment block in your `uno.css`
claims. Bootstrap 5 doesn't define `.caption`, `.bottom .caption`, etc.
at all; those rules are entirely in `_caption.scss`.

The relevant rules compile to:

```css
.caption        { display: none; position: relative; width: 100%;
                  padding: 10px 5px; margin-top: 1px; ... }
.bottom .caption{ display: none; transform: translate(0,-100%);
                  transition: all 0.25s; }
.bottom:hover .caption { display: block; }
```

When `.card.bottom` is hovered, `.bottom:hover .caption` flips the
caption from `display:none` to `display:block`. Because the caption is
`position:relative`, `display:block`, full width, with padding and margin,
it **joins the document flow as a new block below the image** and the
card grows by `caption text height + 20px padding + 1px margin`.

The `transform: translate(0,-100%)` only repaints the pixels upward,
transforms do **not** remove an element from layout — so the visible
overlay looks right while the card still occupies the extra space underneath.
Masonry then reflows the grid on every hover, which is the secondary jank
you're seeing.

## Why your existing "fix" in `uno.css` doesn't apply

Your current rules use the descendant combinator:

```css
.card .bottom .caption { ... }   /* .bottom is a child of .card */
```

But the markup is:

```html
<div class="card bottom">  <!-- both classes on the SAME element -->
  ...
  <div class="caption">…</div>
</div>
```

`.card .bottom` matches a `.bottom` that is a *descendant* of `.card`.
An element cannot be a descendant of itself, so **none of those rules**
match this HTML — the fix is dormant and the original `.bottom .caption`
cascade still wins. You need the **compound** selector `.card.bottom`
(no space). The cleanest fix supports both shapes (compound for this markup,
descendant for any other J1 demos that nest a wrapper).

## Yes, this is fixable in CSS alone

Take the caption out of flow with `position: absolute`, make the card the
positioning context, and toggle visibility with `opacity` (animatable)
instead of `display` (not animatable).

Here is the patched file:
For a permanent fix you'd want the same change folded back into `_caption.scss`
so the bug is gone at the source rather than papered over downstream. Here's
that version too — drop-in replacement for the SCSS partial, same logic but
applied directly to `.bottom` / `.top` / `.center` rather than scoped under
`.card`

### Summary of the two answers you asked for

**Why does the card grow?**
Because `.bottom:hover .caption` flips the caption from `display:none` to
`display:block` while it is still `position:relative`. That makes the
caption a real block-level box below the image, so the card grows by
`caption height + 20px padding + 1px margin`.
The `transform: translate(0,-100%)` only moves the painted pixels.
Transforms don't remove an element from layout.

**Can it be fixed with CSS alone?**
Yes. The caption needs `position: absolute` (so it leaves flow) anchored
to a `position: relative` wrapper, with `opacity` (not `display`) doing
the visibility toggle so the 0.25s transition can actually animate.

The previous patch in `uno.css` had the right idea but used the descendant
selector `.card .bottom`, which never matches `<div class="card bottom">`.

Bboth classes are on the same element, so you need the compound selector
`.card.bottom`. Both patched files use the compound form (and keep the
descendant form too, for any J1 demos that nest a `.bottom` wrapper).

Prefer the SCSS patch if you can rebuild — it's a structural fix at the
source. The `uno.css` patch is the drop-in if you can't.
