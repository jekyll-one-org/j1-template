Prompt
  https://claude.ai/chat/ae784a54-c98f-4e5f-a265-179f19e5b0a3
--------------------------------------------------------------------------------

Validating the HTML based on the attached Liquid-template fails with
"Links must have discernible text".

"Links must have discernible text" is a critical web accessibility rule
stating that every hyperlink must have a clear, visible, and unique name
describing its destination.

What HTML element can be usded intstead on an anchor elelement to link
to the info page?

Create fixed version and use the comment "claude - Fix J1 Amplitude issue #1"
for all proposed fixes.


Claude
--------------------------------------------------------------------------------

Let me find the anchor element that links to the info page.I found the two anchors. Both link to the info page but contain only an icon-font `<i>` element (no text), which is why the validator flags them. Let me view both regions in full context.I've found the problem. There are **two** icon-only info links in this template — one in the compact player (lines 343–348) and one in the large player (lines 919–924). Both are identical in shape:

```html
<a href="{{item.audio_info}}" target="_blank">
  <i class="mdib mdib-information md-gray-400 mdib-24px"></i>
</a>
```

The link's only child is a Material Design **icon-font** `<i>`. Icon fonts
render their glyph through a CSS pseudo-element, so assistive technology sees
an empty element and the link ends up with no accessible name — hence
*"Links must have discernible text."*

**Direct answer to your question:**

The only other native HTML element that is itself a real hyperlink (carries
its own `href`) and takes its accessible name from an *attribute* rather than
a text child is `<area>` — its name comes from `alt`. But `<area>` only works
inside an image map (`<map>` + an `<img usemap>`), which is heavy for a
single 24 px inline icon, and swapping a genuine link for a non-link element
(e.g. a `<button>`, which would also need discernible text and JavaScript) is
usually an accessibility *regression*. Since this genuinely navigates to an
info page, it should stay an `<a>`.

The clean, rule-satisfying fix that needs **no text element at all** is to
give the anchor its accessible name through an attribute — `aria-label` —
and mark the now-decorative icon `aria-hidden="true"`. That's the canonical
axe-core resolution for icon-only links.

Let me apply it to both players. Both anchors are fixed, and the approach is
consistent with the file's existing patterns (the volume sliders already use
`aria-label`). Let me stage the fixed file for you.What changed, in both the
compact and large player blocks:

- Added `aria-label="Show more information about this track"` to each
  info `<a>`. This gives the link a discernible accessible name from an
  attribute, so no visible text element is required — that's what clears
  the axe-core `link-name` rule.

- Added `aria-hidden="true"` to each icon-font `<i>`, since it's now purely
  decorative and shouldn't be exposed to assistive tech.

- Tagged every change with `<!-- claude - Fix J1 Amplitude issue #1 -->`
  (four comments total). These sit inside the HTML-comment stream, so
  `strip_html_comments` removes them in production, exactly like the rest
  of the file's comments.

Two things worth flagging, both optional and left untouched to keep this
diff scoped to the accessibility rule:

- `target="_blank"` opens a new tab. Strictly, best practice is to
  signal that in the name (e.g. append "(opens in a new tab)") and
  add `rel="noopener"` to the anchor for security. Say the word and
  I'll fold those in under the same tag.

- The label is hard-coded English, matching the other literals in this
  file ("song rating", "Track", etc.). If you'd rather drive it from your
  i18n/YAML config for the German locale, point me at the mechanism and
  I'll wire it up.

