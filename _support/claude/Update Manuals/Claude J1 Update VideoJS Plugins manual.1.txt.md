Prompt
  https://claude.ai/chat/67f27588-8b8c-4672-8a44-ccbe8ace99d1
--------------------------------------------------------------------------------

Check the attached VideoJS plugin documentation for CSS and JS files
and update the related manual pages for the VideoJS Plugin (plugin.adoc)
for the additional nextprevbuttons plugin.

Use simple, common English that is understandable to beginners who are not
experienced with JavaScript modules or APIs for J1 Template and VideoJS
in general.

Use the VideoJS API manual (api.adoc) as a reference for the target document.

Create an updated/fixed version and use the comment
"claude - Update VideoJS Plugins manual #1" for all proposed changes.


Claude
--------------------------------------------------------------------------------

Next, extend the "Plugin settings" YAML excerpt with the new plugin's
configuration block: Now the main new section, placed after skipButtons
(the two plugins work together in the control bar): The updated manual page
is ready.

Summary of what was added — strictly additive (0 deletions, 150 inserted lines),
all three change sites tagged with the exact comment
`claude - Update  VideoJS Plugins manual #1`:

**1. Section control attribute (line 61ff)**

New attribute `:nextprevbuttons_plugin: true`, following the existing
pattern used for the other four plugins, so the new section can be switched
on/off the same way.

**2. Plugin settings excerpt (line 127ff)**

The YAML example gained a `nextPrevButtonsPlugin` block (`enabled`,
`options.previous`, `options.next`), inserted between `skipButtonsPlugin`
and `zoomPlugin` to match the naming convention of the sibling keys. The
tag inside the listing uses YAML `#` comment style since AsciiDoc `//`
comments would render inside a source block.

**3. New `=== nextPrevButtons` section (after skipButtons, before zoomButtons)**

Written in plain, beginner-oriented English and structured like the existing
skipButtons/hotKeys sections:

- **Intro** — what the buttons do, the dependency on the `videojs-playlist`
  plugin, and why the buttons gray out without a playlist

- **Automatic state** — disabled at first/last item, always enabled
  in repeat mode, updates on load/playlist changes (derived from `_updateState()`
  and its event list in the JS)

- **Options table** — `previous`, `next`, `previousIndex`, `nextIndex` with
  the auto-positioning noted as default

- **Control button positions**
  explains the "previous before skip-backward, next after skip-forward"
  grouping and the fallback when skipButtons isn't used, matching the
  logic in tags `#2`/`#3` of the plugin

- **Styling (CSS)**
  documents `vjs-playlist-button`, `skip-previous`/`skip-next`, and
  the `vjs-disabled` 50% dimming from `nextprevbuttons.css

- **Template Defaults table**
`enabled: false`, `previous: true`, `next: true`, mirroring the format
of the other plugins


## Two notes for your review

The YAML key `nextPrevButtonsPlugin` and the Template Default `enabled: false`
are my proposal following the sibling-plugin convention — the adapter wiring
for this key didn't exist in the project files yet, so please confirm the
key name once the adapter side is in place.

I also left `last_modified` in the front matter untouched, as version/date
bumps are yours.

