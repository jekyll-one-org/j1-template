Prompt
  https://claude.ai/chat/0b063bd8-1875-4324-b348-cde97e85708e
--------------------------------------------------------------------------------

```
/* BS SM (Mobile)
# --------------------------------------------------------- */
@media screen and (max-width: 576px) { ... }
```

The styles for BS SM (Mobile) are not being applied to mobile devices.
What is the reason?

Create fixed versions and use the comment
"claude - Amplitude/large player styles (mobile) #1" for all proposed fixes.


Claude
--------------------------------------------------------------------------------

Looking at this carefully, the comments you already added in `large.css` give the diagnosis pattern away — and the same family of bugs exists in the other two files.

## The reason

**`compact.css` — combined cross-engine pseudo-elements (same defect as `large.css`)**

At the bottom of the 576px block:

```css
.compact-player-volume-container input[type=range].amplitude-volume-slider::-webkit-slider-thumb,
.compact-player-volume-container input[type=range].amplitude-volume-slider::-moz-range-thumb {
  width: 30px; ...
}
```

Per the CSS Selectors spec, if **any** selector in a comma-grouped list is invalid, the **whole rule** is dropped. WebKit/Blink doesn't recognize `::-moz-range-thumb`, Firefox doesn't recognize `::-webkit-slider-thumb` — so every browser throws the rule away. The mobile thumb is never sized. Fix: split per engine.

**`mini.css` — wrong Firefox pseudo-element name**

```css
input[type=range].mini-player.amplitude-volume-slider::-moz-slider-thumb { ... }
```

`::-moz-slider-thumb` does not exist. Firefox's pseudo-element for a range thumb is `::-moz-range-thumb`. The selector is invalid, so Firefox drops the rule and the thumb is never styled on mobile. The same typo also exists in the base (non-media-query) section of the file, so the desktop thumb is broken in Firefox too.

Let me write the fixes.## Summary

| File | Defect in the 576px block | Fix |
|---|---|---|
| `compact.css` | `::-webkit-slider-thumb, ::-moz-range-thumb` comma-grouped — invalid in both engines, whole rule dropped everywhere | Split into two per-engine rules |
| `mini.css` | `::-moz-slider-thumb` is not a real pseudo-element — Firefox drops the rule | Renamed to `::-moz-range-thumb` (also fixed the same typo in the base section, since it has the same bug) |
| `large.css` | Already fixed in your previous pass — no changes needed | — |

A small side note on `mini.css` that I left alone because it isn't the cause of the bug: the `::-webkit-slider-thumb` rule inside the media query has `margin-top` declared twice (`-15px` then `-2px`), so only `-2px` takes effect. If that was unintentional, drop the first one.
