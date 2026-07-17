Prompt
  https://claude.ai/chat/0c0c1d15-5779-470a-9794-b0f3259e9894
--------------------------------------------------------------------------------

When a page is loaded using multiple configured galleries, the values from the 
(YAML) configuration files are applied per instance. Like the fix commented by
"Fix Amplitude YAML data processing" for the adapter of the J1 Amplitude module
(amplitude.js) should also apply the Gallery module.

For the HTML data and the adapter, loading the config files should be
implemented through an inheritance chain:

```
  gallery settings -> overload user settings -> overload default settings
```

All default settings should be available under user and gallery settings,
but the default values should be overwritten when the same key is present
in both user and gallery settings.

Create fixed versions and use the comment "Fix J1 Gallery YAML data processing #1"
for all proposed fixes.


Claude
--------------------------------------------------------------------------------

Prior-series counts now match the pre-edit census exactly. Now the functional
simulation of the merge chain against the real YAML:## Root cause

Both Gallery files used the Liquid **`merge`** filter (SHALLOW) at every
merge site, although their own comments already claim `deep_merge`, and
although `gallery_control.yml` was de-duplicated against the defaults on
exactly that assumption.

A shallow merge replaces a top-level key *including its whole subtree*, so
every subtree a gallery touches loses all sibling defaults — differently per
instance, depending on which subtrees that gallery configures.

Additionally the **user layer** (global keys of `gallery_control.yml`) was
never part of the per-gallery chain, and `gallery_media` was merged into the
global options, where its `galleries` array (media content only) replaced
the control array wholesale.

Simulation against your shipped YAML — the worst hit:

| gallery | key | before | after |
|---|---|---|---|
| `jg_old_times`, `jg_mega_cities` | `lightbox.enabled` | **`<MISSING>`** → image markup gate false → **empty gallery DIV** | `true` |
| all video galleries | `lightGallery.plugins` | `<MISSING>` → `lightGallery({plugins: []})` | `lgThumbnail, lgVideo` |
| all galleries | `lightGallery.options.licenseKey/download/animateThumb` | `<MISSING>` | inherited |
| all video galleries | `videojsOptions.muted/preload/controls/controlBar.*` | `<MISSING>` | inherited |

All 9 per-gallery override probes still win over defaults/user
(`rowHeight: 250`, `zoomPlugin.enabled: false`, `forward: 5`, …).


## Changes (tag: `claude - Fix J1 Gallery YAML data processing #1`)

**gallery.html**
Global chain `gallery_defaults | deep_merge: gallery_control` (media dropped); Collect-Galleries loop builds `gallery` from
  `gallery_options <- gallery_item <- playlist_match`
via `deep_merge`; both `css_filters` sites deep-merged.

**gallery.js**
Same Liquid chain in `initGallery()`; JS: `_deepMerge()` (arrays replace,
objects recurse), `_self()` (Amplitude fix #2 hardening, ported), 
getInstanceOptions(galleryId)` with per-id cache exposed as `j1.adapter.gallery.

galleryInstanceOptions` / `.galleryOptions`; `init()` builds `galleryOptions`
from the user layer (control minus `galleries`) instead of `$.extend(true, …)`; `loadGalleryHTML()` resolves the `enabled` gate from the effective chain.


## Flagged, out of scope

1. `gallery_options` carries the control `galleries` array, so the
    merged `gallery` exposes a stray `gallery.galleries` (never read;
    same as `amplitude_options.players`). It does inflate the dev-mode
    debug comment `/* gallery: {{gallery_arg}} */` in gallery.js.

2. YAML key mismatch: defaults use `videojsOptions.controlBar.hotkeysPlugin`,
   the control file uses `videojsOptions.hotKeysPlugin` — different placement
   *and* case, so both now survive the merge as separate keys. Likely a
   candidate for fix #2.

3. `xhr_data_path` stays page-global in `loadGalleryHTML()` (not resolved
    per instance) — correct today, since one `index.html` serves all
    galleries.

