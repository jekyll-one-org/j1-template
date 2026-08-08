Prompt
  https://claude.ai/chat/f6054e30-0e40-453b-b0f2-60f2c3ea8fe7
--------------------------------------------------------------------------------

```
<ul class="mm-spn--open">
	  <li class="mm-item"><a class="link-no-decoration" href="/pages/public/tour/image_data/"><i class="mdib mdi-image mdib-sm mdib-grey mr-2"></i> Image</a></li>
	  <li class="mm-item"><a class="link-no-decoration" href="/pages/public/tour/audio_data/"><i class="mdib mdi-volume-high mdib-sm mdib-grey mr-2"></i> Audio</a></li>
	  <li class="mm-item"><a class="link-no-decoration" href="/pages/public/tour/video_data/"><i class="mdib mdi-video mdib-sm mdib-grey mr-2"></i> Video</a></li>
	  <li class="mm-item"><a class="link-no-decoration" href="/pages/public/tour/typography/"><i class="mdib mdi-format-text mdib-sm mdib-grey mr-2"></i> Typography</a></li>
	  <li class="mm-item"><a class="link-no-decoration" href="/pages/public/tour/mdi_icon_font/"><i class="mdib mdi-fan mdib-sm mdib-grey mr-2"></i> Icons</a></li>
	  <li class="mm-item active"><a class="link-no-decoration" href="/pages/public/tour/asciidoc_extensions/"><i class="mdib mdi-format-annotation-plus mdib-sm mdib-grey mr-2"></i> Extensions</a></li>
	  <li class="mm-item"><a class="link-no-decoration" href="/pages/public/tour/modals/"><i class="mdib mdi-image mdib-sm mdib-grey mr-2"></i> Modals</a></li>
	  <li class="mm-item"><a class="link-no-decoration" href="/pages/public/tour/responsive_tables/"><i class="mdib mdi-table mdib-sm mdib-grey mr-2"></i> Tables</a></li>
	  <li class="mm-item"><a class="link-no-decoration" href="/pages/public/tour/themes/"><i class="mdib mdi-theme-light-dark mdib-sm mdib-grey mr-2"></i> Themes</a></li>
	  <li class="mm-item"><a class="link-no-decoration" href="/pages/public/tour/rouge/"><i class="mdib mdi-code-parentheses mdib-sm mdib-grey mr-2"></i> Highligher</a></li>
	  <li class="mm-item"><a class="link-no-decoration" href="/pages/public/tour/site_search/"><i class="mdib mdi-magnify mdib-sm mdib-grey mr-2"></i> Search</a></li>
</ul>
```

The J1 MMenu module mproves the Bootstrap Framework in regard to ease-of-use
and offers a powerful, simplified navigation. This is achieved by providing a
Sidebar that features a Menu based on the Main Menu.

In the Mobile Menu, when a list element li is clicked the classlist
(class="mm-item") should be extended by "active" to mark the item as
active (and from all other items, the active flag should be removed).

Active state should survive page navigation. Each dropdown item navigates
to a new page, so the class set on click should not be lost on page load.

Create a fixed versions and use the comment "Claude - Fix MMenu #1"
for all proposed fixes.


Claude
--------------------------------------------------------------------------------

**File identity confirmed:** the file changed is the **adapter** `~/assets/theme/j1/adapter/js/mmenu.js` (526 lines, Liquid-templated) — not the core module. All other uploads (`mmenu-light.mjs`, `sliding-panels-navigation.js`, `offcanvas-drawer.js`, `match-media-toggler.js`, `navigator.js`, `mmenu.css`) are **unchanged**.


## Why the adapter, and why capture phase

Two findings from the pre-edit audit drove the design:

1. **`sliding-panels-navigation.js` swallows the click.** `_initAnchors()` binds a handler on the menu `UL` that calls `evnt.stopImmediatePropagation()` for every click it considers handled — and `clickAnchor()` reports *every* `<a>` as handled. Any delegated handler on `document` in the **bubble** phase is therefore never reached. That is also why the existing `Fix J1 Navigator issue #3` handler in `navigator.js` cannot cover the mobile menu, even though its comment assumes it does — it collects `.dropdown-item`, mmenu items carry `.mm-item`, and its handler is bubble-phase. The new handler registers for the **capture** phase, which runs before the target/bubble phase and cannot be suppressed.

2. **Persistence must be re-derived, not carried.** Each item navigates to a new page, and the menu HTML arrives fresh by AJAX (`j1.loadHTML`) on every load — so any class set on click is gone. On load the state is re-derived from `window.location.pathname`, matched against the items' `href` (exact match wins, longest parent path as fallback on a segment boundary). The last clicked path is written to `sessionStorage` as a **secondary** fallback, used only when the location matches no item at all. **Design decision for your review:** if you prefer location-only derivation, delete the `mmenuReadStoredPath`/`mmenuWriteStoredPath` pair and the fallback branch in `restoreActiveMenuItem()`.

A `MutationObserver` (childList/subtree on `body`, 30 s window) re-runs the restore for menus that arrive by AJAX or are moved between their container and `div.mm-ocd__content` by the media-query toggler. Only attribute-free mutations are observed, so setting `active` cannot re-trigger it.


## Out-of-scope candidates (not touched)

1. **Contrast on the active item**
    mmenu.css` sets `.mm-item.active { background-color: #ffc700; }`
    while `.mm-spn a { color: #9e9e9e !important; }` keeps the label grey
    on yellow. A rule such as `.mm-item.active > a { color: #212121 !important; }`
    would fix it; CSS left unchanged per scope discipline.

2. **Parent highlighting**
    a parent item is not marked when a descendant is active. The plugin
    has its own `selectedClass` mechanism (`mmOptions.mmenu_navigator.selected`)
    that may be the better hook.

3. **`navigator.js` comment drift**
   The `Fix J1 Navigator issue #3` block claims item (2) closes mobile-menu
   coverage; per finding 1 above it does not. Comment-only correction,
   9 occurrences of that tag left byte-identical.
