Prompt
  https://claude.ai/chat/9db747f0-731d-463e-9aa2-5e8132021bb1
--------------------------------------------------------------------------------

``` 
if (bType === 'ai') {
  var badgeHTML = ''
      + '<div class="attic__badge animate__animated animate__fadeIn animate__slower">'
      + ' <a class="attic__badge_unsplash link-no-decoration"'
      + '  href="' +bLink+ '?utm_medium=referral&amp;utm_campaign=photographer-credit&amp;utm_content=creditBadge"'
      + '  target="_blank"'
      + '  rel="noopener noreferrer"'
      + '  title="Free high-resolution photos from ' +bAuthor+ '">'
      + '  <span class="attic__badge_unsplash_icon">'
      + '    <svg xmlns="http://www.w3.org/2000/svg"'
      + '	   class="attic__badge_unsplash_icon-size"'
      + '      viewBox="0 0 5.6 5.6">'
      + '      <path d="m 2.7536906,1.6771374 c 0.02445,0 0.036683,-0.013105 0.042796,-0.033693 0.063168,-0.3125793 0.059098,-0.3200622 0.4136794,-0.3818338 0.02445,-0.00374 0.038718,-0.016842 0.038718,-0.039307 0,-0.022457 -0.014268,-0.035562 -0.038718,-0.039307 C 2.8576195,1.1174956 2.8678098,1.1100046 2.7964866,0.8011707 2.7903766,0.7805828 2.7781406,0.7674778 2.7536906,0.7674778 c -0.024458,0 -0.036683,0.013105 -0.042796,0.0336929 -0.071323,0.308834 -0.059098,0.3163248 -0.4136794,0.3818259 -0.022415,0.00375 -0.038718,0.01685 -0.038718,0.039307 0,0.022465 0.016303,0.03557 0.038718,0.039307 0.3545811,0.065517 0.3505032,0.069254 0.4136794,0.3818338 0.00611,0.020588 0.018337,0.033693 0.042796,0.033693 z M 1.7673829,2.9648773 c 0.038718,0 0.065211,-0.022464 0.06928,-0.056149 0.073366,-0.4997549 0.091704,-0.4997549 0.6541504,-0.5989488 0.036683,-0.00562 0.063167,-0.028079 0.063167,-0.06364 0,-0.033693 -0.026484,-0.058026 -0.063167,-0.06364 C 1.9283665,2.1113765 1.907986,2.0945255 1.8366629,1.5854194 c -0.00407,-0.033685 -0.030562,-0.058018 -0.06928,-0.058018 -0.036683,0 -0.063176,0.024333 -0.067254,0.059895 -0.067245,0.5016156 -0.095781,0.4997469 -0.6541417,0.5952034 -0.036683,0.00749 -0.0631762,0.029947 -0.0631762,0.06364 0,0.03743 0.026493,0.058018 0.0713232,0.06364 0.5542911,0.082351 0.5787494,0.095456 0.6459947,0.5952034 0.00408,0.03743 0.030571,0.059895 0.067254,0.059894 z m 1.3816498,2.0719875 c 0.052986,0 0.091704,-0.035562 0.1018853,-0.086097 0.1446895,-1.0257038 0.3016039,-1.1810551 1.4061082,-1.293362 0.057064,-0.00561 0.095782,-0.044921 0.095782,-0.09358 0,-0.048667 -0.038718,-0.086105 -0.095782,-0.093588 C 3.5525219,3.3579315 3.3956075,3.2025802 3.250918,2.1768843 3.2407364,2.126349 3.2020186,2.0926561 3.1490327,2.0926561 c -0.052986,0 -0.091704,0.033693 -0.099851,0.084228 C 2.9044922,3.20258 2.7455432,3.3579313 1.6430648,3.4702382 c -0.05909,0.00748 -0.097807,0.044921 -0.097807,0.093588 0,0.048659 0.038718,0.087966 0.097807,0.09358 1.1004351,0.1328948 1.2532717,0.2695349 1.4061169,1.293362 0.00815,0.050535 0.046865,0.086097 0.099851,0.086097 z"></path>'
      + '    </svg>'
      + '  </span>'
      + '  <span class="attic__badge_unsplash_text">' +bAuthor+ '</span>'
      + ' </a>'
      + '</div>';
      $('.attic-caption').html(badgeHTML).hide();
}
```

The generated svg HTML element (see var badgeHTML) for the attached
ai sparkles icon  (ai-sparkles.svg) is too small in size. 

How can the size for the vg HTML element upscaled to double size?


Claude
--------------------------------------------------------------------------------

The size isn't controlled by the SVG markup at all — it's set by the CSS class `attic__badge_unsplash_icon-size`. That matters, because **CSS `width`/`height` always beat SVG presentation attributes**, so adding `width="…"`/`height="…"` to the `<svg>` tag will have no visible effect.

Two separate things are making the icon look small, and you probably want both fixes.

## 1. The viewBox is too loose (free ~1.27× gain)

The sparkles artwork doesn't fill `0 0 5.6 5.6`. Its actual bounding box is:

| | min | max | extent |
|---|---|---|---|
| x | 0.983 | 4.753 | 3.770 |
| y | 0.767 | 5.037 | 4.269 |

So the glyph occupies only ~67% of the box horizontally. The Unsplash icon
it replaces fills its `0 0 32 32` box completely — that alone is why the new
icon reads as smaller at identical CSS dimensions.

Tighten it to a square box centred on the artwork:

```js
+ '      viewBox="0.67 0.70 4.4 4.4">'
```

## 2. Double the CSS size

**Recommended — dedicated class.** Don't reuse the Unsplash size class for a different glyph:

```js
+ '	   class="attic__badge_ai_icon-size"'
```

```css
.attic__badge_ai_icon-size {
  width:  2rem;   /* whatever the unsplash class uses × 2 */
  height: 2rem;
}
```

Look up the current value in DevTools (inspect the `<svg>`, read the computed `width` on `.attic__badge_unsplash_icon-size`) and double it.

**Quick, value-agnostic alternatives** — if you'd rather not chase the base value, an inline `style` outranks the class:

```js
+ '      style="zoom:2;"'
```

`zoom` scales the element *and* its layout box, so the badge text reflows correctly around it. Supported everywhere modern (Firefox since 126).

If you need older Firefox support, use `transform` instead — but note it scales visually only, the reserved layout box stays at the original size, so the icon may overlap the author name:

```js
+ '      style="transform:scale(2);transform-origin:left center;"'
```

## Net effect

Tightened viewBox (1.27×) plus doubled CSS (2×) gives roughly 2.5× the current rendered glyph. If that overshoots, keep the viewBox fix and use a 1.5× CSS bump instead — you'll land near a true 2×.

