Prompt
    https://claude.ai/chat/c3af90b3-bad6-4821-8355-e78cc3d004c0
--------------------------------------------------------------------------------

The J1 MMenu module in the sidebar improves the Bootstrap Framework in 
regard to ease-of-use and offers a powerful, simplified navigation. This
is achieved by providing a Sidebar that features a Menu based on the
Main Menu.

The JavaScript module file "mmenu-light.mjs" for MMenu should be rewrtten
like the Toccer module file "toccer.mjs" to make "MmenuLight" globally
available in the browser.

Create a fixed version and use the comment "Claude - Fix MMenu mjs #1"
for all proposed fixes.


Claude
--------------------------------------------------------------------------------

**What was wrong**

`mmenu-light.mjs` is evaluated as an ES module, so the top-level `var MmenuLight` lives in module scope only — it never reaches `window`. The closing comment block already claimed *"The global window.MmenuLight is set as well (see above)"*, but nothing above actually set it. The adapter `~/adapter/js/mmenu.js` calls `new MmenuLight (...)` as a bare global identifier (lines 303 and 401), which would fail with `MmenuLight is not defined`.

**The fix**

A UMD/global registration block modeled 1:1 on `toccer.mjs` (AMD → CommonJS → global object), 
placed after the class definition and before the existing `export default`, plus the
ESLint shimming header used in `toccer.mjs`. Both consumption paths now work:
`import MmenuLight from './mmenu-light.mjs'` **and** the bare global.


## Out-of-scope findings (candidates, not fixed)

1. `mmenu.js` adapter passes `selected:` to `navigation()`, but the class
   destructures `options.selectedClass` — the selected-item class silently
   falls back to `'Selected'`.

2. `sliding-panels-navigation.js`
    imports `from '../helpers'` without a file extension. Fine under Webpack,
    but it would break if these files were ever served directly as native
    browser modules.

3. `match-media-toggler.js` uses the deprecated `MediaQueryList.addListener()`
   instead of `addEventListener('change', …)`.

4. The adapter has no wait-loop for `window.MmenuLight` to exist; if the `.mjs`
   is loaded as `type="module"` (deferred by spec) while the adapter runs
   from a classic script, ordering could still bite. Worth a dependency
   check similar to the `j1.xhrDataState` polling already used there.
