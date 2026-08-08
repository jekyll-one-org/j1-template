Prompt
  https://claude.ai/chat/d391df80-2c55-4628-957e-5d462c01aa42
--------------------------------------------------------------------------------

The J1 Navigator module improves the Bootstrap Framework regarding
ease-of-use and offers a powerful, simplified navigation. This is achieved
by providing a navigation bar that features a main menu.

In the main menu, when a list element li class="dropdown-item" is clicked
the classlist (class="dropdown-item") is extended by "active" to mark
the item as active.

Parent highlighting currently does not work. A parent item is not
marked when a descendant is active.

The last fix comment "Fix J1 Navigator issue #4" is commented by
candidates for a future series

1. Plain top-level items (`li.nav-item` with a real `href`, no dropdown) 
   are never collected by `j1NavCollectItems()` and so are never marked active.
   Same gap existed in fix #3.

2. `restoreActiveMenuItem()`
    Returns early when nothing matches, leaving any existing marks.
    Harmless on a full page load, but worth reviewing if the menu is
    ever re-rendered in place.

Create fixed versions and use the comment "Claude - Fix J1 Navigator issue #5"
for all proposed fixes.


Claude
--------------------------------------------------------------------------------

Now the item collection (candidate 1 — plain top-level items).
Now the core of the parent-highlighting fix:Now the two early returns in `restoreActiveMenuItem` (candidate 2). Now the click handler and init
hook:**Root cause of the parent highlighting failure** — reproduced in a
jsdom simulation against the original file, then fixed.

Fix #4 detected parents by class selector and then dropped everything carrying `.dropdown-item`. Two markup realities defeat that:

- A **level 2/3 opener carries `dropdown-item` itself** (it *is* an
  item of the menu above it and the opener of its own submenu) → `.not('.dropdown-item')` removed exactly the parents that should be marked.

- A **level 1 opener may carry `li.nav-item` only** (no `dropdown` class) → never matched `activeParentSelector` at all.

Baseline run on your file (level-3 page): only `li[Navigator].active`,
zero parents.

After #5: `li[Manuals].active-parent, li[Modules].active-parent, li[Navigator].active`.


**What #5 changes**

1. **Structural parent detection**
   Walk up from the active item; every container `LI` on the way to the
   menu root is a parent, whatever classes it carries. The class-based
   detection of #4 is kept and both results merged, so nothing #4 found
   can get lost. Kill switch: `activeParentStructural = false`.

2. **Leaves protected by identity, not by class**
   Only elements actually collected by `j1NavCollectItems()` are excluded
   from parent handling. This closes the `dropdown-item`-opener gap and
   still guarantees fix #3's state can't be damaged, verified with
   `activeParentClassName = 'active'`.

3. **Marker attribute** 
   `data-j1-active-parent` set alongside the class, so stale marks are
   cleared reliably regardless of the configured class name.

4. **Candidate (1)**
   Plain top-level items (`li.nav-item`, real href, no dropdown) are now
   collected in a second pass, both the `LI` and its `a.nav-link` (J1 styles
   `.dropdown-menu > .active > a`, Bootstrap styles `.nav-link.active`).
   Openers are excluded via submenu/toggle checks, and the delegated click
   handler covers them too, with a bubbling guard. Kill switch:
   `activeItemPlainSelector = ''`.

5. **Candidate (2)**
   `restoreActiveMenuItem()` now clears leaf and parent marks instead of
   returning early with stale state. **Behavioral change**, kill switch: `activeItemClearOnNoMatch = false`.


## Worth checking on your side

`active-parent` is a new class with no CSS rule in the theme, so even
correctly marked parents stay invisible.

`j1.api.navigator.activeParentInjectStyle = true` (or `injectActiveParentStyle(css)`)
injects a minimal `li[data-j1-active-parent] > a { font-weight: 600 }`
rule — off by default so no site look changes silently.

`j1.api.navigator.debugActiveItems()` prints collected paths, the matched
path, and mark counts.


## Out of scope, noted for a future series

1. `j1NavApplyActive()` marks *both* the desktop and mobile copy
   of an item; harmless today but doubles the `marked` count in the debug log.

2. The click handler's `activeItemUserSet` latch permanently disables
   the MutationObserver restore — an in-place re-render after a click
   keeps whatever the click set.

3. Fix #2's older handler on `nav.navbar.navigator` is still registered
   in the adapter path and now computes a *narrower* state than #5
   (no plain items, no parents); it's idempotent but redundant.

