Prompt
  https://claude.ai/chat/f238ed7e-4700-460a-b077-71af0a8db72d
--------------------------------------------------------------------------------

```
Uncaught runtime errors:
ERROR
Cannot read properties of null (reading 'offsetTop')
TypeError: Cannot read properties of null (reading 'offsetTop')
    at getIsHeaderBottomMode (http://localhost:41000/assets/theme/j1/modules/toccer/js/import/build-html.js:374:21)
    at Object.updateToc (http://localhost:41000/assets/theme/j1/modules/toccer/js/import/build-html.js:213:11)
    at HTMLDocument.<anonymous> (http://localhost:41000/assets/theme/j1/modules/toccer/js/import/index.js:160:16)
    at HTMLDocument.<anonymous> (http://localhost:41000/assets/theme/j1/modules/toccer/js/import/index.js:266:10)
```

In the J1 Toccer module (based on tocbot), the error above sometimes occurs
when loading a page that uses the module to dynamically generate a TOC from
the content's headlines.

Why is it?

Create a fixed version and use the comment "claude - Fix J1 Toccer offsetTop issue #1"
for all proposed fixes.


Claude
--------------------------------------------------------------------------------

Now the core guard in `getIsHeaderBottomMode` plus the id-resolving helpers:

## Why it happens

The stack trace maps precisely onto the code:

| Frame | Line | What it is |
|---|---|---|
| `index.js:266` | `fn.apply(context, args)` | the **throttle** wrapper |
| `index.js:160` | `_buildHtml.updateToc(_headingsArray, event)` | inside **`clickListener`** |
| `build-html.js:213` | `getIsHeaderBottomMode(clickedHref.replace('#', ''))` | click path in `updateToc` |
| `build-html.js:374` | `activeHeading.offsetTop` | unchecked `getElementById()` result |

So this isn't a load-time race — it's a **click**, delivered through the
throttled `clickListener`. In `toccer.js` you init tocbot with `scrollContainer: null`,
so `index.js` falls into the `else` branch and binds the click listener to
**`document`**. Every click anywhere on the page therefore ends up in
`updateToc`:

```js
const clickedHref = event.target.getAttribute('href');   // any anchor, not just TOC links
const isBottomMode = clickedHref && clickedHref.charAt(0) === '#'
  ? getIsHeaderBottomMode(clickedHref.replace('#', ''))  // <- id may not exist
  : false;
```

and `getIsHeaderBottomMode()` reads `.offsetTop` without checking the lookup:

```js
const activeHeading = document.getElementById(headerId); // null for non-heading anchors
activeHeading.offsetTop                                  // 💥 TypeError
```

Anything in a J1 page that is an `<a href="#…">` but not a heading triggers
it: `href="#"` dropdown/collapse/tab toggles, mmenu controls, back-to-top
links, links to anchors on *other* pages, or a TOC link built from a heading
that has no `id` (`createLink` then produces `href="#undefined"` / `href="#"`).
`document.getElementById('')` returns `null` → crash. That's the
"sometimes" — it depends on *where* the first click lands.

There's a **second, latent path** into the same crash (line 242):
`topHeaderId` is CSS-escaped (`id.replace(/([ #;&,.+*~':"!^$[\]()=>|/\\@])/g, '\\$1')`)
for use in `querySelector()`, but that escaped string is then passed to
`getIsHeaderBottomMode()` → `getElementById()` expects the **raw** id, so
any heading id containing `.`, `:`, `(`, GUID-ish characters etc. resolves
to `null` as well.


## The fix

Tagged `claude - Fix J1 Toccer offsetTop issue #1` throughout:

1. **`getIsHeaderBottomMode()` is now null-safe**
   new `findHeadingById()` helper returns `null` for empty/unknown ids
   (with a `decodeURIComponent` fallback for percent-encoded hashes, e.g.
   umlaut headings); the function returns `false` (= not in bottom mode)
   instead of throwing. This is the actual crash fix.

2. **`getIdFromHref()`**
   Extracts the id only for genuine in-page anchors (`'#'`, `''`, `/page#id`,
   absolute URLs → `''`), so foreign anchors never reach the lookup.

3. **Raw vs. escaped id separated**
   `topHeaderRawId` for `getElementById()`, `topHeaderId` (escaped) for
   `querySelector()`; the `hashId !== topHeaderRawId` comparison is now
   raw-to-raw, which was also wrong before.

4. **`topHeader` guard**
   getTopHeader()` can return `undefined` (headings replaced by an AJAX load
   while an event is queued); `topHeader.id` threw in that case.

Verified with jsdom against both files — the original crashes on a `href="#"`
click and on a foreign anchor, the fixed version passes both plus the scroll
path.

The minified build was regenerated with terser from the fixed source and
passes the same test.

