Prompt
   
--------------------------------------------------------------------------------

```
<div class="btn-group speak2me-ignore">
  <!-- See: https://stackoverflow.com/questions/47242702/force-bootstrap-dropdown-menu-to-always-display-at-the-bottom-and-allow-it-go-of -->
  <!-- NOTE: control the behaviour of popper.js for positioning -->
  <!-- NOTE: set attribute data-flip="false" to open the SELECT list at the BOTTOM of the BUTTON -->
  <button
    class="btn btn-flex btn-lg btn-info dropdown-toggle mt-2 mb-4"
    data-flip="false" type="button"
    data-bs-toggle="dropdown"
    data-bs-target="#navbarDropdown"
    aria-haspopup="true"
    aria-expanded="false">
    Available Themes <span class="ml-2 caret"></span>
  </button>

  <ul class="dropdown-menu scrollable-menu" role="menu">
    <li><a class="dropdown-item" aria-label="rouge" onclick="j1.adapter.rouge.reaplyStyles('base16')">                 <i class="mdib mdib-view-quilt mdib-18px mr-2" style="color: #9E9E9E"></i>base16</a></li>
    <li><a class="dropdown-item" aria-label="rouge" onclick="j1.adapter.rouge.reaplyStyles('base16.dark')">            <i class="mdib mdib-view-quilt mdib-18px mr-2" style="color: #9E9E9E"></i>base16.dark</a></li>
    <li><a class="dropdown-item" aria-label="rouge" onclick="j1.adapter.rouge.reaplyStyles('base16.light')">           <i class="mdib mdib-view-quilt mdib-18px mr-2" style="color: #9E9E9E"></i>base16.light</a></li>
    <li><a class="dropdown-item" aria-label="rouge" onclick="j1.adapter.rouge.reaplyStyles('base16.monokai')">         <i class="mdib mdib-view-quilt mdib-18px mr-2" style="color: #9E9E9E"></i>base16.monokai</a></li>
    <li><a class="dropdown-item" aria-label="rouge" onclick="j1.adapter.rouge.reaplyStyles('base16.monokai.dark')">    <i class="mdib mdib-view-quilt mdib-18px mr-2" style="color: #9E9E9E"></i>base16.monokai.dark</a></li>
    <li><a class="dropdown-item" aria-label="rouge" onclick="j1.adapter.rouge.reaplyStyles('base16.monokai.light')">   <i class="mdib mdib-view-quilt mdib-18px mr-2" style="color: #9E9E9E"></i>base16.monokai.light</a></li>
    <li><a class="dropdown-item" aria-label="rouge" onclick="j1.adapter.rouge.reaplyStyles('base16.solarized')">       <i class="mdib mdib-view-quilt mdib-18px mr-2" style="color: #9E9E9E"></i>base16.solarized</a></li>
    <li><a class="dropdown-item" aria-label="rouge" onclick="j1.adapter.rouge.reaplyStyles('base16.solarized.dark')">  <i class="mdib mdib-view-quilt mdib-18px mr-2" style="color: #9E9E9E"></i>base16.solarized.dark</a></li>
    <li><a class="dropdown-item" aria-label="rouge" onclick="j1.adapter.rouge.reaplyStyles('base16.solarized.light')"> <i class="mdib mdib-view-quilt mdib-18px mr-2" style="color: #9E9E9E"></i>base16.solarized.light</a></li>
    <li><a class="dropdown-item" aria-label="rouge" onclick="j1.adapter.rouge.reaplyStyles('colorful')">               <i class="mdib mdib-view-quilt mdib-18px mr-2" style="color: #9E9E9E"></i>colorful</a></li>
    <li><a class="dropdown-item" aria-label="rouge" onclick="j1.adapter.rouge.reaplyStyles('github')">                 <i class="mdib mdib-view-quilt mdib-18px mr-2" style="color: #9E9E9E"></i>github</a></li>
    <li><a class="dropdown-item" aria-label="rouge" onclick="j1.adapter.rouge.reaplyStyles('gruvbox')">                <i class="mdib mdib-view-quilt mdib-18px mr-2" style="color: #9E9E9E"></i>gruvbox</a></li>
    <li><a class="dropdown-item" aria-label="rouge" onclick="j1.adapter.rouge.reaplyStyles('gruvbox.light')">          <i class="mdib mdib-view-quilt mdib-18px mr-2" style="color: #9E9E9E"></i>gruvbox.light</a></li>
    <li><a class="dropdown-item" aria-label="rouge" onclick="j1.adapter.rouge.reaplyStyles('igorpro')">                <i class="mdib mdib-view-quilt mdib-18px mr-2" style="color: #9E9E9E"></i>igorpro</a></li>
    <li><a class="dropdown-item" aria-label="rouge" onclick="j1.adapter.rouge.reaplyStyles('molokai')">                <i class="mdib mdib-view-quilt mdib-18px mr-2" style="color: #9E9E9E"></i>molokai</a></li>
    <li><a class="dropdown-item" aria-label="rouge" onclick="j1.adapter.rouge.reaplyStyles('monokai')">                <i class="mdib mdib-view-quilt mdib-18px mr-2" style="color: #9E9E9E"></i>monokai</a></li>
    <li><a class="dropdown-item" aria-label="rouge" onclick="j1.adapter.rouge.reaplyStyles('monokai.sublime')">        <i class="mdib mdib-view-quilt mdib-18px mr-2" style="color: #9E9E9E"></i>monokai.sublime</a></li>
    <li><a class="dropdown-item" aria-label="rouge" onclick="j1.adapter.rouge.reaplyStyles('pastie')">                 <i class="mdib mdib-view-quilt mdib-18px mr-2" style="color: #9E9E9E"></i>pastie</a></li>
    <li><a class="dropdown-item" aria-label="rouge" onclick="j1.adapter.rouge.reaplyStyles('thankful_eyes')">          <i class="mdib mdib-view-quilt mdib-18px mr-2" style="color: #9E9E9E"></i>thankful_eyes</a></li>
    <li><a class="dropdown-item" aria-label="rouge" onclick="j1.adapter.rouge.reaplyStyles('tulip')">                  <i class="mdib mdib-view-quilt mdib-18px mr-2" style="color: #9E9E9E"></i>tulip</a></li>
  </ul>
</div>
<div id="selected" class="mt-1 mb-3"></div>
```

Validating the HTML based on the attached code fails with
"Links are not crawlable".

Intentionally, the anchor link does not have a href property but a onclick
handler run an action on click.

What HTML element can be used intstead on an anchor elelement to place
the onclick handler?

Create fixed version and use the comment "claude - Fix J1 Rouge issue #1"
for all proposed fixes.


Claude
--------------------------------------------------------------------------------

Use a `<button type="button" class="dropdown-item">`. Bootstrap 5 explicitly supports `<button>` elements inside `.dropdown-menu` — they get identical styling to `<a class="dropdown-item">`, and semantically a button *is* the right element here because the item triggers an action rather than navigating anywhere. That removes the "Links are not crawlable" finding at the source instead of papering over it with a dummy `href="#"`.

Two details worth keeping in mind:

- `type="button"` is mandatory, otherwise the element defaults to `type="submit"` and would submit an enclosing form.
- `aria-label="rouge"` on every item overrides the accessible name, so a screen reader announces all 21 entries as "rouge". Better to drop it and let the visible text label the button.

Here is the fixed block:

```html
<div class="btn-group speak2me-ignore">
  <!-- See: https://stackoverflow.com/questions/47242702/force-bootstrap-dropdown-menu-to-always-display-at-the-bottom-and-allow-it-go-of -->
  <!-- NOTE: control the behaviour of popper.js for positioning -->
  <!-- NOTE: set attribute data-flip="false" to open the SELECT list at the BOTTOM of the BUTTON -->
  <button
    class="btn btn-flex btn-lg btn-info dropdown-toggle mt-2 mb-4"
    type="button"
    data-bs-display="static"
    data-bs-toggle="dropdown"
    data-bs-target="#navbarDropdown"
    aria-haspopup="true"
    aria-expanded="false">
    Available Themes <span class="ml-2 caret"></span>
  </button>

  <!-- claude - Fix J1 Rouge issue #1 -->
  <!-- NOTE: dropdown items are ACTIONS, not links. Anchors without a href are -->
  <!--       flagged as "Links are not crawlable". Bootstrap 5 supports button -->
  <!--       elements as .dropdown-item with identical styling.                -->
  <ul class="dropdown-menu scrollable-menu" role="menu">
    <li><button type="button" class="dropdown-item" onclick="j1.adapter.rouge.reaplyStyles('base16')">                 <i class="mdib mdib-view-quilt mdib-18px mr-2" style="color: #9E9E9E"></i>base16</button></li>
    <li><button type="button" class="dropdown-item" onclick="j1.adapter.rouge.reaplyStyles('base16.dark')">            <i class="mdib mdib-view-quilt mdib-18px mr-2" style="color: #9E9E9E"></i>base16.dark</button></li>
    <li><button type="button" class="dropdown-item" onclick="j1.adapter.rouge.reaplyStyles('base16.light')">           <i class="mdib mdib-view-quilt mdib-18px mr-2" style="color: #9E9E9E"></i>base16.light</button></li>
    <li><button type="button" class="dropdown-item" onclick="j1.adapter.rouge.reaplyStyles('base16.monokai')">         <i class="mdib mdib-view-quilt mdib-18px mr-2" style="color: #9E9E9E"></i>base16.monokai</button></li>
    <li><button type="button" class="dropdown-item" onclick="j1.adapter.rouge.reaplyStyles('base16.monokai.dark')">    <i class="mdib mdib-view-quilt mdib-18px mr-2" style="color: #9E9E9E"></i>base16.monokai.dark</button></li>
    <li><button type="button" class="dropdown-item" onclick="j1.adapter.rouge.reaplyStyles('base16.monokai.light')">   <i class="mdib mdib-view-quilt mdib-18px mr-2" style="color: #9E9E9E"></i>base16.monokai.light</button></li>
    <li><button type="button" class="dropdown-item" onclick="j1.adapter.rouge.reaplyStyles('base16.solarized')">       <i class="mdib mdib-view-quilt mdib-18px mr-2" style="color: #9E9E9E"></i>base16.solarized</button></li>
    <li><button type="button" class="dropdown-item" onclick="j1.adapter.rouge.reaplyStyles('base16.solarized.dark')">  <i class="mdib mdib-view-quilt mdib-18px mr-2" style="color: #9E9E9E"></i>base16.solarized.dark</button></li>
    <li><button type="button" class="dropdown-item" onclick="j1.adapter.rouge.reaplyStyles('base16.solarized.light')"> <i class="mdib mdib-view-quilt mdib-18px mr-2" style="color: #9E9E9E"></i>base16.solarized.light</button></li>
    <li><button type="button" class="dropdown-item" onclick="j1.adapter.rouge.reaplyStyles('colorful')">               <i class="mdib mdib-view-quilt mdib-18px mr-2" style="color: #9E9E9E"></i>colorful</button></li>
    <li><button type="button" class="dropdown-item" onclick="j1.adapter.rouge.reaplyStyles('github')">                 <i class="mdib mdib-view-quilt mdib-18px mr-2" style="color: #9E9E9E"></i>github</button></li>
    <li><button type="button" class="dropdown-item" onclick="j1.adapter.rouge.reaplyStyles('gruvbox')">                <i class="mdib mdib-view-quilt mdib-18px mr-2" style="color: #9E9E9E"></i>gruvbox</button></li>
    <li><button type="button" class="dropdown-item" onclick="j1.adapter.rouge.reaplyStyles('gruvbox.light')">          <i class="mdib mdib-view-quilt mdib-18px mr-2" style="color: #9E9E9E"></i>gruvbox.light</button></li>
    <li><button type="button" class="dropdown-item" onclick="j1.adapter.rouge.reaplyStyles('igorpro')">                <i class="mdib mdib-view-quilt mdib-18px mr-2" style="color: #9E9E9E"></i>igorpro</button></li>
    <li><button type="button" class="dropdown-item" onclick="j1.adapter.rouge.reaplyStyles('molokai')">                <i class="mdib mdib-view-quilt mdib-18px mr-2" style="color: #9E9E9E"></i>molokai</button></li>
    <li><button type="button" class="dropdown-item" onclick="j1.adapter.rouge.reaplyStyles('monokai')">                <i class="mdib mdib-view-quilt mdib-18px mr-2" style="color: #9E9E9E"></i>monokai</button></li>
    <li><button type="button" class="dropdown-item" onclick="j1.adapter.rouge.reaplyStyles('monokai.sublime')">        <i class="mdib mdib-view-quilt mdib-18px mr-2" style="color: #9E9E9E"></i>monokai.sublime</button></li>
    <li><button type="button" class="dropdown-item" onclick="j1.adapter.rouge.reaplyStyles('pastie')">                 <i class="mdib mdib-view-quilt mdib-18px mr-2" style="color: #9E9E9E"></i>pastie</button></li>
    <li><button type="button" class="dropdown-item" onclick="j1.adapter.rouge.reaplyStyles('thankful_eyes')">          <i class="mdib mdib-view-quilt mdib-18px mr-2" style="color: #9E9E9E"></i>thankful_eyes</button></li>
    <li><button type="button" class="dropdown-item" onclick="j1.adapter.rouge.reaplyStyles('tulip')">                  <i class="mdib mdib-view-quilt mdib-18px mr-2" style="color: #9E9E9E"></i>tulip</button></li>
  </ul>
  <!-- claude - Fix J1 Rouge issue #1 -->
</div>
<div id="selected" class="mt-1 mb-3"></div>
```

If the icons should be hidden from assistive tech (they're decorative), adding `aria-hidden="true"` to each `<i>` would be the follow-up.


One side note outside the scope of this fix:

`data-flip="false"` and `aria-haspopup="true"` are Bootstrap 4 conventions,
while `data-bs-toggle` is Bootstrap 5. If this is running on BS5, the flip
attribute is silently ignored — BS5 uses `data-bs-display="static"` or a
custom `popperConfig` instead. Worth verifying against whichever Bootstrap version J1 currently ships.

