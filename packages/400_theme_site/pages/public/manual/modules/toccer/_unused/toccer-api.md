<!-- claude - J1 Toccer manual #1 -->
# Toccer API — Programming Interface

Toccer is the table of contents (TOC) generator of the J1 Template. The
module scans the headings of a page (`h1` .. `h6`) and builds a clickable
table of contents from them. While the visitor scrolls, the entry that
matches the current section is highlighted automatically, and nested
sections open and close like an accordion.

Toccer is based on [Tocbot](https://tscanlin.github.io/tocbot), a small,
dependency-free JavaScript library written by Tim Scanlin. Tocbot was
inspired by Tocify, but works natively without any need for jQuery or
jQuery UI. In the J1 Template, the Tocbot core is wrapped by the
**Toccer adapter**, which reads your YAML settings, waits until the page
is ready, and then starts Tocbot with the proper options.

> **Note**
> The Toccer API documentation pages are based on Tocbot version
> **v4.36.x** for the current J1 template version 2026.x. The idea of
> providing this documentation is *not* to simply copy the original
> Tocbot pages as duplicates. For better readability and usability, all
> pages are restructured and enhanced by code examples or improved
> description texts.

## Overview

The Tocbot **API** is the set of **options** and **methods** you use
from JavaScript to configure and control a table of contents. In J1
Template you usually do *not* call this API directly. Instead, you write
a few YAML settings and the J1 **toccer adapter**
(`~/assets/theme/j1/adapter/js/toccer.js`) builds the JavaScript
configuration for you. Reading this manual is still useful, because all
YAML keys map one-to-one to the API names described below.

Tocbot does three things, over and over again, while a page is open:

1. **Parse** — collect all headings from the content area and build a
   nested list (chapters and sub-chapters) from their heading levels.
2. **Render** — create the HTML of the table of contents (nested
   `ol`/`ul` lists with links) and place it into the TOC container
   element.
3. **Update** — watch the scroll position of the page and mark the link
   of the top-most visible heading as *active*; collapse and expand
   nested sections as needed.

### Module files

The Tocbot core used by J1 is split into small ES modules. Each file has
one job. You do not need to touch these files, but knowing what they do
helps when reading the rest of this manual.

| File | Description |
|------|-------------|
| `toccer.mjs` | The **outer wrapper** (UMD pattern). It loads the Tocbot core and makes it available globally as `window.tocbot`, so the J1 adapter (and your own scripts) can call `tocbot.init(...)`. |
| `import/index.js` | The **central index** of the Tocbot core. Exports the public methods `init()`, `destroy()` and `refresh()`, merges your options with the defaults, and wires up all scroll and click listeners. |
| `import/default-options.js` | All **default settings** of Tocbot in one place. Every option you can pass to `tocbot.init()` is listed here with its default value (see [Parameters](#parameters)). |
| `import/parse-content.js` | **Parses the content**. Selects all headings that match the `headingSelector`, skips headings matching the `ignoreSelector`, and nests the flat list of headings into a tree using their heading levels. |
| `import/build-html.js` | **Builds and updates the DOM**. Renders the nested heading tree as `ol`/`ul` lists with links, highlights the active link while scrolling, and opens/closes collapsible sub-lists. |
| `import/update-toc-scroll.js` | Keeps the TOC container itself **in sync** with the page: when the TOC list is longer than its container, the container is scrolled so the active entry stays visible. |
| `import/scroll-smooth/index.js` | Tocbot's built-in **smooth scrolling** for in-page links. **Note:** in J1 Template this part is *disabled by intention*. Smooth scrolling is handled by the central J1 scroller module instead, so all pages scroll the same way (see [Initialization in J1 Template](#initialization-in-j1-template)). |

### The Toccer adapter

The file `~/assets/theme/j1/adapter/js/toccer.js` is a **Liquid
template** that Jekyll turns into plain JavaScript at build time. The
adapter:

1. reads the **default** settings from
   `_data/modules/defaults/toccer.yml`,
2. merges the **user** settings from `_data/modules/toccer.yml` on top,
3. merges optional **per-page** settings from the page front matter
   (`resource_options`) on top of both,
4. waits until the J1 core has finished and the page content is visible,
5. waits until the TOC container (`#toc_mmenu`) has been loaded into the
   page (the TOC panel is injected by AJAX),
6. finally calls `tocbot.init(...)` with the merged options.

The merge order is important. It is the same **three-layer inheritance**
used by all J1 modules:

```text
defaults (toccer.yml)  <--  user settings (toccer.yml)  <--  page front matter
```

A key set in a *later* layer always wins over the same key set in an
*earlier* layer.

## HTML Layout

Tocbot needs two elements on the page:

* a **content** element that contains the headings — found by
  `contentSelector` (default in J1: `.js-toc-content`), and
* an (empty) **TOC container** element where the generated table of
  contents is rendered — found by `tocSelector` (default: `.js-toc`).

```html
<!-- The element the TOC is generated FROM -->
<div class="js-toc-content">
  <h2 id="section-1">Section 1</h2>
  <p>...</p>
  <h3 id="section-1-1">Section 1.1</h3>
  <p>...</p>
  <h2 id="section-2">Section 2</h2>
  <p>...</p>
</div>

<!-- The element the TOC is rendered INTO -->
<div class="js-toc"></div>
```

> **Important**
> Every heading needs an **ID**. The links of the table of contents
> point to the heading IDs (`href="#section-1"`). Headings without an ID
> cannot be jumped to. In J1 Template, heading IDs are generated
> automatically by AsciiDoctor, so you normally do not have to care
> about this.

To **exclude** a single heading from the table of contents, add the
class configured as `ignoreSelector` (default in J1: `.notoc`):

```html
<h2 id="internal-notes" class="notoc">Internal notes</h2>
```

> **Note**
> In J1 Template you normally do *not* write this markup yourself. The
> page layouts already provide the content wrapper and the TOC panel
> (`#toc_mmenu`). The TOC panel is loaded into the page by AJAX; the
> Toccer adapter waits for that load to finish before it starts Tocbot.

## Initialization

When the HTML portion is in place, Tocbot is initialised like so:

```js
tocbot.init(options)   // initialize tocbot with options
```

* `options` — object with Tocbot parameters. **Optional**. Every key you
  do not set falls back to its default value (see
  [Parameters](#parameters)).

**Example**

```js
tocbot.init({
  tocSelector:      '.js-toc',
  contentSelector:  '.js-toc-content',
  headingSelector:  'h2, h3, h4',
  collapseDepth:    3,
});
```

Different from libraries like Swiper, Tocbot is a **singleton**: there
is only *one* table of contents per page. You do not create instances
with `new`; you call `init()` on the global `tocbot` object. Calling
`init()` again first destroys the current TOC and then builds a new one.

### Initialization in J1 Template

In a J1 site the call above is generated by the **Toccer adapter** from
your YAML configuration. The adapter:

1. waits until the J1 core is initialised and the page content is
   visible,
2. waits until the TOC panel (`#toc_mmenu`) has been injected by AJAX,
3. merges the YAML defaults, user settings and page front matter into a
   single options object,
4. calls `tocbot.init(...)` with the merged options.

Two things are handled *differently* in J1 than in a stock Tocbot setup:

* **Smooth scrolling is delegated to J1.** The adapter starts Tocbot
  with `scrollSmooth: false` and passes an `onClick` handler instead.
  When a TOC link is clicked, the handler pushes the anchor URL to the
  browser's history (`history.pushState`) and then scrolls to the
  heading using the central J1 scroller (`j1.scrollToAnchor`). This
  ensures all pages of a J1 site scroll the same way.
* **The active link color comes from YAML.** The (J1-specific) option
  `activeLinkColor` styles the highlighted TOC entry; it is not part of
  the original Tocbot library.

After initialization, the merged options are stored on the adapter and
can be inspected in the browser console:

```js
j1.adapter.toccer.moduleOptions   // the effective Toccer options
```

<!-- claude - J1 Toccer manual #1 -->
## Parameters

The Tocbot API offers a collection of **parameters** that allow you to
configure almost every aspect of the table of contents. A parameter is
just a **key/value pair** you pass to `tocbot.init()` (or, in J1
Template, write in the Toccer YAML configuration).

**Initialization example**

```js
tocbot.init({
  tocSelector:     '.js-toc',
  headingSelector: 'h2, h3, h4',
  collapseDepth:   3,
});
```

This section lists **all** available parameters. Each parameter gets its
own subsection with a short description and, where helpful, a code
example. The accepted value types and the default value are summarised
in a small table at the end of each subsection.

> **Note**
> The defaults listed below are the **Tocbot library** defaults. The J1
> Template overrides several of them in its YAML configuration — for
> example, `headingSelector` is set to `"h2, h3, h4, h5, h6"` and
> `collapseDepth` to `3`. See the
> [YAML Configuration](#yaml-configuration) section for the effective
> J1 defaults.

### activeLinkClass

Class added to the **active** link — the link that corresponds to the
top-most heading currently visible on the page. Use this class in your
CSS to style the highlighted TOC entry.

| Name | Type | Default |
|------|------|---------|
| `activeLinkClass` | string | 'is-active-link' |

### activeListItemClass

Class added to the **list item** (`li`) that contains the active link.

| Name | Type | Default |
|------|------|---------|
| `activeListItemClass` | string | 'is-active-li' |

### basePath

Sets a base path that is put in front of every generated link. Useful if
you use a `<base>` tag in the `<head>` of your page, because then plain
`#anchor` links would point to the base URL instead of the current page.

| Name | Type | Default |
|------|------|---------|
| `basePath` | string | '' |

### bottomModeThreshold

Distance (in pixels) from the bottom of the page at which the **bottom
mode** is enabled. Bottom mode handles the highlighting of headings near
the end of the page that can never be scrolled to the top of the window
(because there is not enough content below them).

| Name | Type | Default |
|------|------|---------|
| `bottomModeThreshold` | number | 30 |

### collapseDepth

Specifies how many heading levels should **not** be collapsed (are
always displayed). For example, a value of `6` shows everything (there
are only six heading levels, `h1` .. `h6`), while `0` collapses all
nested levels. The hidden sections open and close automatically
(accordion effect) as the visitor scrolls through the matching content.

```js
tocbot.init({
  // always show two levels, collapse deeper levels
  collapseDepth: 2,
});
```

| Name | Type | Default |
|------|------|---------|
| `collapseDepth` | number | 0 |

### collapsibleClass

Class added to a nested list that **can** be collapsed (but is not
necessarily collapsed right now).

| Name | Type | Default |
|------|------|---------|
| `collapsibleClass` | string | 'is-collapsible' |

### contentElement

DOM node of the content element the headings are taken from. You can
pass this **instead of** `contentSelector` if you already have a
reference to the element.

```js
tocbot.init({
  contentElement: document.getElementById('content'),
});
```

| Name | Type | Default |
|------|------|---------|
| `contentElement` | HTMLElement \| null | null |

### contentSelector

CSS selector of the content element, typically your content area, from
which the headings are taken to calculate the TOC.

| Name | Type | Default |
|------|------|---------|
| `contentSelector` | string | '.js-toc-content' |

### disableTocScrollSync

Only takes effect when the TOC container itself is scrollable. By
default, the container is scrolled automatically so the active entry
stays visible (scroll sync). Set this option to `true` to switch that
behaviour off.

| Name | Type | Default |
|------|------|---------|
| `disableTocScrollSync` | boolean | false |

### enableUrlHashUpdateOnScroll

When enabled, the URL hash (the part after `#`) is updated with the ID
of the current heading while the visitor scrolls the page. This makes
the browser URL always point to the section currently being read.

> **Caution**
> Browsers limit how often `history.pushState()` may be called (for
> example, iOS Safari allows no more than 100 calls per 30 seconds).
> Keep this option disabled if you do not need it, or make sure the
> scroll handler does not fire too often (see `scrollHandlerType`).

| Name | Type | Default |
|------|------|---------|
| `enableUrlHashUpdateOnScroll` | boolean | false |

### extraLinkClasses

Extra classes to add to **all** links of the table of contents, for
example utility classes of your CSS framework.

| Name | Type | Default |
|------|------|---------|
| `extraLinkClasses` | string | '' |

### extraListClasses

Extra classes to add to **all** lists (`ol`/`ul`) of the table of
contents.

| Name | Type | Default |
|------|------|---------|
| `extraListClasses` | string | '' |

### fixedSidebarOffset

Scroll position (in pixels) after which the `positionFixedClass` is
added to the element selected by `positionFixedSelector`. The default
`'auto'` uses the TOC element's own distance from the top of the
document, so the sidebar becomes fixed exactly when it would leave the
screen.

| Name | Type | Default |
|------|------|---------|
| `fixedSidebarOffset` | 'auto' \| number | 'auto' |

### hasInnerContainers

Set this to `true` when your headings are placed inside **relative** or
**absolute** positioned containers within the content. Tocbot then adds
up the offsets of all parent containers to calculate the correct
position of each heading.

| Name | Type | Default |
|------|------|---------|
| `hasInnerContainers` | boolean | false |

### headingLabelCallback

Optional callback to change the **label** of a heading before it is
written to the TOC. For example, it can be used to shorten multi-line
headings and add an ellipsis (`...`). The function is called for every
heading, receives the label as a string, and must return the (modified)
label.

```js
tocbot.init({
  headingLabelCallback: (label) => {
    return label.length > 40 ? label.slice(0, 40) + '…' : label;
  },
});
```

> **Tip**
> Alternatively, the attribute `data-heading-label` may be used on a
> single heading to specify a shorter text to be used in the TOC:
>
> ```html
> <h2 id="long" data-heading-label="Short title">A very long title …</h2>
> ```

| Name | Type | Default |
|------|------|---------|
| `headingLabelCallback` | false \| function(string): string | false |

### headingObjectCallback

Optional callback to modify the **parsed heading object** before it is
added to the TOC tree. The heading element is passed in the `node`
parameter, the parsed data in the `obj` parameter. The function must
return the same or a modified object. If **nothing** is returned, the
heading is excluded from the TOC.

```js
tocbot.init({
  headingObjectCallback: (obj, node) => {
    // skip headings marked with data-draft
    if (node.dataset.draft !== undefined) return;
    return obj;
  },
});
```

| Name | Type | Default |
|------|------|---------|
| `headingObjectCallback` | null \| function(object, HTMLElement): object \| void | null |

### headingSelector

Which headings to grab inside of the content element to build the table
of contents. A comma-separated list of heading selectors.

```js
tocbot.init({
  headingSelector: 'h2, h3, h4',
});
```

| Name | Type | Default |
|------|------|---------|
| `headingSelector` | string | 'h1, h2, h3' |

### headingsOffset

Offset (in pixels) between the headings and the top of the document.
This value is meant for **minor** adjustments of the highlighting: it
shifts the point at which a heading counts as "reached" while scrolling.

| Name | Type | Default |
|------|------|---------|
| `headingsOffset` | number | 1 |

### ignoreHiddenElements

When enabled, headings that are **hidden** in the DOM (not visible, no
height) are skipped and do not appear in the table of contents.

| Name | Type | Default |
|------|------|---------|
| `ignoreHiddenElements` | boolean | false |

### ignoreSelector

Headings that match the ignore selector are skipped and do not appear in
the table of contents. In J1 Template the class `.notoc` is used for
this purpose.

| Name | Type | Default |
|------|------|---------|
| `ignoreSelector` | string | '.js-toc-ignore' |

### includeHtml

Set to `true` to include the **HTML markup** from the heading node in
the TOC link, instead of just its plain text. Useful when your headings
contain inline elements (icons, code, keyboard keys) that should also
show up in the table of contents.

| Name | Type | Default |
|------|------|---------|
| `includeHtml` | boolean | false |

### includeTitleTags

Automatically sets the HTML `title` attribute of each TOC link to the
heading text. This can be useful for SEO purposes or when TOC titles are
truncated by CSS, because the full text then appears as a tooltip.

| Name | Type | Default |
|------|------|---------|
| `includeTitleTags` | boolean | false |

### isCollapsedClass

Class that gets added to a nested list when it is currently
**collapsed** (hidden).

| Name | Type | Default |
|------|------|---------|
| `isCollapsedClass` | string | 'is-collapsed' |

### linkClass

Main class added to all links in the table of contents.

| Name | Type | Default |
|------|------|---------|
| `linkClass` | string | 'toc-link' |

### listClass

Main class added to all lists (`ol`/`ul`) of the table of contents.

| Name | Type | Default |
|------|------|---------|
| `listClass` | string | 'toc-list' |

### listItemClass

Class added to all list items (`li`) of the table of contents.

| Name | Type | Default |
|------|------|---------|
| `listItemClass` | string | 'toc-list-item' |

### onClick

Function applied to **all links** in the TOC. It is called with the
click event as the first parameter and can be used to stop propagation,
prevent the default action, or perform your own action.

```js
tocbot.init({
  onClick: (event) => {
    console.log('TOC link clicked:', event.currentTarget.href);
  },
});
```

> **Note**
> The J1 Toccer adapter uses this hook to push the anchor URL to the
> browser's history and to scroll to the target heading with the
> central J1 scroller (`j1.scrollToAnchor`).

| Name | Type | Default |
|------|------|---------|
| `onClick` | function(Event) | function () {} |

### orderedList

Set to `false` to generate **unordered** lists (`ul`) instead of ordered
lists (`ol`) for the table of contents.

| Name | Type | Default |
|------|------|---------|
| `orderedList` | boolean | true |

### positionFixedClass

Fixed-position class that is added to the element selected by
`positionFixedSelector` after the page has been scrolled down past the
`fixedSidebarOffset`. Use it in your CSS to make a TOC sidebar **stick**
to the screen.

| Name | Type | Default |
|------|------|---------|
| `positionFixedClass` | string | 'is-position-fixed' |

### positionFixedSelector

CSS selector of the element the `positionFixedClass` should be added to.
Set this option to enable the fixed-sidebar behaviour; leave it at
`null` to disable it.

| Name | Type | Default |
|------|------|---------|
| `positionFixedSelector` | string \| null | null |

### scrollContainer

CSS selector of a **fixed article scroll container**. Set this option if
your content does not scroll with the page itself, but inside its own
scrollable element. Tocbot then listens for scroll events on that
element and uses it for all offset calculations.

| Name | Type | Default |
|------|------|---------|
| `scrollContainer` | string \| null | null |

### scrollEndCallback

Callback fired when scrolling **ends** (the scroll position no longer
changes). The function receives the scroll event as its parameter.

| Name | Type | Default |
|------|------|---------|
| `scrollEndCallback` | function(Event) | function () {} |

### scrollHandlerTimeout

Delay (in milliseconds) of the scroll handler. Together with
`scrollHandlerType`, this option controls how often Tocbot reacts to
scroll events.

| Name | Type | Default |
|------|------|---------|
| `scrollHandlerTimeout` | number | 50 |

### scrollHandlerType

Type of scroll handler to use so the scroll event does not fire too
rapidly. Options are `'debounce'`, `'throttle'`, or `'auto'`:

* `debounce` — wait until scrolling **pauses**, then update once.
* `throttle` — update at most once per `scrollHandlerTimeout`.
* `auto` — use *debounce* when the timeout is below 333 ms, otherwise
  use *throttle*. The reason is a limit in iOS browsers: they cannot
  call `history.pushState()` more than 100 times per 30 seconds.

| Name | Type | Default |
|------|------|---------|
| `scrollHandlerType` | 'auto' \| 'debounce' \| 'throttle' | 'auto' |

### scrollSmooth

Enables Tocbot's built-in smooth scrolling for TOC links.

> **Note**
> In J1 Template this option is always forced to `false` by the Toccer
> adapter. Smooth scrolling is handled by the central J1 scroller
> module instead, so all pages of a site scroll the same way.

| Name | Type | Default |
|------|------|---------|
| `scrollSmooth` | boolean | true |

### scrollSmoothDuration

Duration (in milliseconds) of Tocbot's built-in smooth scroll animation.
Only effective when `scrollSmooth` is enabled.

| Name | Type | Default |
|------|------|---------|
| `scrollSmoothDuration` | number | 420 |

### scrollSmoothOffset

Offset (in pixels) applied to the target position of the built-in smooth
scroll. Use a **negative** value if a fixed header covers the heading
after scrolling. Only effective when `scrollSmooth` is enabled.

| Name | Type | Default |
|------|------|---------|
| `scrollSmoothOffset` | number | 0 |

### skipRendering

Prevents the TOC DOM rendering if the table of contents is **already
rendered** by an external system (for example, generated server-side).
Tocbot then only takes care of highlighting and collapsing.

| Name | Type | Default |
|------|------|---------|
| `skipRendering` | boolean | false |

### throttleTimeout

Timeout (in milliseconds) between events firing to make sure updates do
not happen too rapidly (for performance reasons). This is the **legacy**
option; newer configurations should prefer `scrollHandlerTimeout`, which
wins if both are set.

| Name | Type | Default |
|------|------|---------|
| `throttleTimeout` | number | 50 |

### tocElement

DOM node of the TOC container element. You can pass this **instead of**
`tocSelector` if you already have a reference to the element.

| Name | Type | Default |
|------|------|---------|
| `tocElement` | HTMLElement \| null | null |

### tocScrollingWrapper

Element (not a selector!) of an **outer** scrolling wrapper that
contains the TOC, for example a navigation panel with a search box on
top. If set to `null`, the `tocElement`/`tocSelector` element itself is
used for the TOC scroll sync. Only effective if `disableTocScrollSync`
is `false`.

| Name | Type | Default |
|------|------|---------|
| `tocScrollingWrapper` | HTMLElement \| null | null |

### tocScrollOffset

Offset (in pixels) for the TOC scroll (top) position when scrolling the
page. Keeps a bit of space above the active entry when the TOC container
is scrolled automatically. Only effective if `disableTocScrollSync` is
`false`.

| Name | Type | Default |
|------|------|---------|
| `tocScrollOffset` | number | 30 |

### tocSelector

CSS selector of the element where to render the table of contents.

| Name | Type | Default |
|------|------|---------|
| `tocSelector` | string | '.js-toc' |

<!-- claude - J1 Toccer manual #1 -->
## Methods

A **method** is a function you can call on the global `tocbot` object to
make it **do** something at runtime — build the table of contents,
remove it, or rebuild it after the content has changed.

```js
tocbot.init({ ... });     // build the TOC
tocbot.refresh();         // rebuild it (e.g. after content changed)
tocbot.destroy();         // remove it
```

| Name | Description |
|------|-------------|
| `tocbot.init(options)` | Initialise Tocbot and build the table of contents. `options` — **Object** with Tocbot parameters, *optional*. Keys you do not set fall back to their defaults. If a TOC already exists, it is destroyed first (an internal `destroy()` is called), so `init()` can safely be called more than once. |
| `tocbot.destroy()` | Remove the generated table of contents from the TOC container and detach all scroll, resize and click listeners. Use this before removing the content area from the page, or when the TOC is no longer needed. |
| `tocbot.refresh(customOptions)` | Destroy and re-initialise Tocbot in one call. `customOptions` — **Object** with Tocbot parameters, *optional*. If omitted, the options of the previous `init()` call are reused. Call this after the **content has changed** at runtime (for example after loading additional sections by AJAX), so the table of contents matches the new headings. |

### Internal exports (for testing)

For testing purposes, the Tocbot index module additionally exports a few
**internal** objects. They are not part of the public API and may change
between versions; do not build features on top of them.

| Name | Description |
|------|-------------|
| `_options` | The merged options object of the last `init()` call. |
| `_buildHtml` | The internal DOM builder/updater (see `import/build-html.js`). |
| `_parseContent` | The internal content parser (see `import/parse-content.js`). |
| `_headingsArray` | The flat array of headings collected from the content element. |
| `_scrollListener` | The (debounced or throttled) scroll handler that updates the TOC. |

## YAML Configuration

In J1 Template, Toccer is configured by **YAML files** — no JavaScript
required. Two files are involved, plus an optional third layer in the
page front matter:

| File | Purpose |
|------|---------|
| `_data/modules/defaults/toccer.yml` | **Default** settings of the module (key `defaults:`). Do not change this file; it documents all options and their factory values. |
| `_data/modules/toccer.yml` | **User** settings (key `settings:`). Place all your changes here. Keys you set in this file override the same keys of the defaults. |
| Page front matter (`resource_options`) | **Per-page** overrides. Settings placed here win over both files, but only for the current page. |

**Example: user settings (`_data/modules/toccer.yml`)**

```yaml
settings:
  enabled:                              true
  log:                                  false
```

**Example: per-page override in the page front matter**

```yaml
resource_options:
  - toccer:
      collapseDepth:                    2
```

### Options

The table below lists the YAML keys of the Toccer module and their J1
default values. Most keys map **one-to-one** to the Tocbot parameters
described above; the keys `enabled`, `log` and `activeLinkColor` are J1
additions.

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `enabled` | boolean | false | Enables or disables the Toccer module. The module defaults to **disabled**; it is switched on in the user settings of the J1 starter site. |
| `log` | boolean | false | Setting the log option to `true` enables the current option settings to be written to the JavaScript console, so you can inspect the effective settings. |
| `tocSelector` | string | .js-toc | The element where to render the table of contents. See [tocSelector](#tocselector). |
| `contentSelector` | string | .js-toc-content | The content area from which the headings are taken. See [contentSelector](#contentselector). |
| `headingSelector` | string | "h2, h3, h4, h5, h6" | Which headings to grab inside of the content element. Note that the J1 default **excludes** `h1` (the page title). See [headingSelector](#headingselector). |
| `ignoreSelector` | string | .notoc | Headings that match this class are skipped. Add the class `notoc` to a heading to exclude it from the TOC. |
| `collapseDepth` | integer | 3 | How many heading levels are always displayed (not collapsed). See [collapseDepth](#collapsedepth). |
| `activeLinkColor` | string (color) | var(--bs-red) | Color of the TOC entry that is marked as selected (active). Accepts any CSS color value, including CSS variables. **J1 addition** — not part of the original Tocbot library. |
| `throttleTimeout` | integer | 150 | Timeout between events firing to make sure updates are not too rapid (for performance reasons). See [throttleTimeout](#throttletimeout). |
| `scrollSmooth` | boolean | true | Smooth scrolling for TOC links. Note: the **effect** is produced by the central J1 scroller module; Tocbot's built-in smooth scrolling stays disabled either way. |
| `scrollSmoothDuration` | integer | 300 | Overall time (in milliseconds) to complete the scroll. |
| `scrollSmoothOffset` | integer | 0 | Amount of space (in pixels) between the top of the page and the selected heading after the page has been scrolled. |
| `scrollContainer` | string \| null | null | CSS selector of a fixed article scroll container, if the content scrolls inside its own element. See [scrollContainer](#scrollcontainer). |

## CSS Classes

Tocbot generates plain, unstyled HTML lists and marks them with CSS
classes. All visual styling — colors, indentation, the accordion
transitions — is done in CSS. The classes below are the ones used by the
J1 Template (they are the Tocbot defaults; the class names are
configurable via the [parameters](#parameters)).

| Class | Applied to |
|-------|------------|
| `toc-list` | Every generated list (`ol`/`ul`) of the table of contents. |
| `toc-list-item` | Every list item (`li`). |
| `toc-link` | Every link (`a`). |
| `is-active-link` | The link of the **currently active** heading (the top-most heading visible on the page). |
| `is-active-li` | The list item that contains the active link. |
| `is-collapsible` | A nested list that **can** be collapsed. |
| `is-collapsed` | A nested list that is currently **collapsed** (hidden). |
| `is-position-fixed` | The sidebar element, after the page has been scrolled past the `fixedSidebarOffset` (only if `positionFixedSelector` is set). |

**Example: generated TOC markup**

```html
<div class="js-toc">
  <ol class="toc-list">
    <li class="toc-list-item is-active-li">
      <a href="#section-1" class="toc-link node-name--H2 is-active-link">Section 1</a>
      <ol class="toc-list is-collapsible">
        <li class="toc-list-item">
          <a href="#section-1-1" class="toc-link node-name--H3">Section 1.1</a>
        </li>
      </ol>
    </li>
    <li class="toc-list-item">
      <a href="#section-2" class="toc-link node-name--H2">Section 2</a>
    </li>
  </ol>
</div>
```

> **Tip**
> Each link additionally carries a class `node-name--H2`, `node-name--H3`
> and so on, named after the heading level. Use these classes to style
> TOC entries differently per level (for example, smaller font sizes for
> deeper levels).
