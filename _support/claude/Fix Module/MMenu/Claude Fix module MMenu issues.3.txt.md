Prompt
  https://claude.ai/chat/836d59af-c8da-4fb7-9c13-d32413ba3522
--------------------------------------------------------------------------------

The J1 MMenu module improves the Bootstrap Framework regarding ease-of-use
and offers a powerful, simplified navigation. This is achieved by providing a
Sidebar that features a Menu based on the Main Menu.

In the Mobile Menu, when a list element li is clicked, the classlist
(class="mm-item") is extended by "active" to mark the item as
active (and from all other items, the active flag should be removed).

From the last fix (commented by: Fix MMenu #1):

## Out-of-scope candidates (not touched)

1. **Contrast on the active item**
    mmenu.css` sets `.mm-item.active { background-color: #ffc700; }`
    while `.mm-spn a { color: #9e9e9e !important; }` keeps the label grey
    on yellow. A rule such as `.mm-item.active > a { color: #212121 !important; }`
    would fix it; CSS left unchanged per scope discipline.

2. **Parent highlighting**
    A parent item is not marked when a descendant is active. The plugin
    has its own `selectedClass` mechanism (`mmOptions.mmenu_navigator.selected`)
    that may be the better hook.

Create fixed versions and use the comment "Claude - Fix MMenu #2"
for all proposed fixes.


Claude
--------------------------------------------------------------------------------

Now the change inside `mmenuApplyActive()` and the new parent helper:Both candidates from the previous session are fixed, tagged `Claude - Fix MMenu #2`, additive-only.

**Files touched**

| File | Added | Deleted | Tags |
|---|---|---|---|
| `~/adapter/js/mmenu.js` | +140 | 0 | 6 |
| `~/modules/mmenu/css/theme/uno/mmenu.css` | +82 | 0 | 9 |

**Candidate 1 — contrast on the active item (`mmenu.css`)**

`.mm-item.active` keeps its yellow background; new rules give the label a dark color. Applied to `> a`, `> span` and `a.mm-item.active`, deliberately *not* to the LI itself — a parent item contains its submenu, so a color on the LI would be inherited by every child item. The chevron (`.mm-spn li:before`, drawn with `currentColor`) is colored explicitly instead.

A second problem surfaced while checking the cascade: `.mm-spn li:hover` sets `#424242`, which beats `.mm-item.active` on specificity — hovering the active item replaced the yellow with dark grey, so a dark label would have been unreadable. Added rules keep both background and label on hover.

**Candidate 2 — parent highlighting (`mmenu.js` + `mmenu.css`)**

New `mmenuApplyActiveParents()` walks up from every marked item via `closest('.mm-item')` and sets `active-parent` on all ancestor levels. Called from inside `mmenuApplyActive()` so click and restore stay in sync. Ancestors are re-scanned from the scope each time, because parent items carry no navigable link and are therefore never collected (and never cleared) by `mmenuCollectItems()`. `active` and `active-parent` are guaranteed disjoint.

**Design decision for your review:** the plugin's `selectedClass` hook is wired up (`activeSelectedClass`, read from `mmenu_navigator.selected`, plugin default `Selected`) but switched **off** — `activeItemUsePluginSelectedClass = false`. `_setSelectedl()` reads that class once at construction time and uses it to *open* the panel the item sits in. Enabling it would change menu behavior (drawer opens on a submenu instead of the main panel), not just styling, so I left it as a flag rather than deciding it.


## Out-of-scope candidates (not touched)

1. **Option name mismatch.** `mmenuInitializer` passes `selected:` to `mmenu.navigation()`, but the plugin destructures `options.selectedClass` — the YAML value never reaches it and the default `'Selected'` is always used. Candidate for a future fix in the adapter.

2. **Malformed CSS comment.** `mmenu.css`, `@media (min-width: 992px)`: a `/* … /* … */ … */` nesting leaves a stray `} */`. Real browsers recover; strict parsers report an error. A deletion would be required, so untouched.

3. **`active-parent` and `font-weight: 500`** may shift label width slightly; drop that declaration if you prefer color-only marking.
