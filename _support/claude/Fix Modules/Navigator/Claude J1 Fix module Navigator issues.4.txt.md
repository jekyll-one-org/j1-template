Prompt
  https://claude.ai/chat/97064909-c4f7-4ed8-b0eb-3ab31ce38ad8
--------------------------------------------------------------------------------

The J1 Navigator module improves the Bootstrap Framework regarding
ease-of-use and offers a powerful, simplified navigation. This is achieved
by providing a navigation bar that features a main menu.

In the main menu, when a list element li class="dropdown-item" is clicked
the classlist (class="dropdown-item") is extended by "active" to mark
the item as active.

Parent highlighting is currently not implemented. A parent item is not
marked when a descendant is active.

Create fixed versions and use the comment "Claude - Fix J1 Navigator issue #4"
for all proposed fixes.


Claude
--------------------------------------------------------------------------------

Now validating: syntax check, tag census, and a zero-deletion proof.
**Fix J1 Navigator issue #4 — parent (ancestor) highlighting**

Only the core module `~/assets/theme/j1/modules/navigator/navigator.js (2)`
was changed. `menu.html` needed no change — it already emits everything
required.

**Pre-edit audit**

I read `menu.html` to derive what a "parent" actually is, rather than guessing from the URL. The generated nesting is:

```
ul.nav.navbar-nav.navigator
  li.dropdown.nav-item          <- level 1 opener  (a[href="#"])
    ul.dropdown-menu
      li.dropdown-item > a      <- leaf, marked by fix #3
      li.dropdown.nav-sub-item  <- level 2 opener  (a[href="#"])
        ul.dropdown-menu
          li.dropdown-item > a
          li.dropdown.nav-sub-item  <- level 3 opener
```

Every parent is a real DOM ancestor of the active leaf, so a plain
walk-up (`.parents('li.dropdown, …')`) is exact and needs no path arithmetic.

**What was added**

One hook, three helpers, three public settings — all additive:

- `j1NavApplyActiveParents(items, path)`
   clears stale parent marks scope-wide, then walks up from every
   matching leaf and marks each container LI.

- Called from `j1NavApplyActive()`
  The single place fix #3 changes state, so both the page-load
  restore *and* the delegated click handler are covered by one hook.

- `j1NavParentConfig()`
   Re-reads the public settings on every call, so they can be flipped
   at runtime.

- Leaf items (`.dropdown-item`)
  Are excluded in both directions, so fix #3's state cannot be
  damaged even when the parent class is set to `active`.

**Behavioral change disclosure + kill switch**

```js
j1.api.navigator.activeParentHighlight = false;   // exact fix #3 behaviour back
j1.api.navigator.activeParentClassName = 'active active-parent';
```

The default class `active-parent` is new, so it is invisible until you add CSS,
e.g. `nav.navbar.navigator li.dropdown.active-parent > a { font-weight: 600; }`.
Set the class name to `'active'` if you'd rather reuse the leaf styling.
Space-separated lists work.


## Out of scope — candidates for a future series

1. Plain top-level items (`li.nav-item` with a real `href`, no dropdown) 
   are never collected by `j1NavCollectItems()` and so are never marked active.
   Same gap existed in fix #3.

2. Megamenu leaves use `li.dropdown-megamenu-item`, not `.dropdown-item`,
   so a megamenu branch is never highlighted at all.

3. `restoreActiveMenuItem()`
    Returns early when nothing matches, leaving whatever marks exist.
    Harmless on a full page load, but worth reviewing if the menu is
    ever re-rendered in place.

