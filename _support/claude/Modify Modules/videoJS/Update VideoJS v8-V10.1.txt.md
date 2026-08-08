Prompt
  https://claude.ai/chat/68e50787-64f4-4e97-92fd-6cc4a84b3307
--------------------------------------------------------------------------------

VideoJS is a free, open-source video player for the web. The J1 Template
uses VideoJS V8 to play native (mp4) video files and video from several online
platforms such as YouTube.

VideoJS supports plugins that add new features. With plugins, the same player
can show videos from many different sources, all with the same look and
feel — a much better experience for your visitors.

A new version of VideoJS, version V10, is available. Would the VideoJS
implementation for the J1 Template benefit from an upgrade from version
V8 to V10?

What migration work is required for:

- the core module
- the plugins


Claude
--------------------------------------------------------------------------------

## Short answer

Not yet — and "upgrade" is the wrong word. v10 is a ground-up rewrite, not
just of Video.js but also of Plyr, Vidstack, and Media Chrome. There is no compatibility layer with v8. For J1 it would be a re-implementation of the
entire `videojs` module.

**Current status (checked today):** still beta. Latest is v10.0.0-beta.26,
released Aug 2, 2026. GA is still WIP, targeted mid-2026, with "Video.js
core/contrib parity and supported plugins migrated" scheduled for
end of 2026.

## The two hard blockers for J1 specifically

### 1. No YouTube media component
v10 has no Tech concept at all — media handling moved to media components,
and DASH, YouTube, Vimeo, and Mux media elements are currently under
development.

Issue #1434 (YouTube Provider) is still open and labelled *needs discussion*.
It's weighing Mux's `<youtube-video>` element, which sets `rel=0`, `iv_load_policy=3`, `modestbranding`, `cc_load_policy` by default and only
switches to the nocookie origin when `src` contains `-nocookie`, against videojs-youtube's much broader param surface (`enablePrivacyEnhancedMode`, `customVars`, plus explicit `rel`, `iv_load_policy`, `color`, `disablekb`, `cc_load_policy`, `modestbranding`, `playsinline`, `hl`, `theme`).

Your `youtube.js` (3.1.9 fork) and the whole `players.youtube.*` YAML branch
have no target to port to. Since YT is J1's primary source, this alone gates everything.

### 2. No plugin system yet
The v8 extension model — `registerPlugin`, `registerComponent`, `getComponent('Button')`, `controlBar.addChild(child, index)` — is precisely what v10
deliberately removed. The beta ships no plugin migrations, without plugin
author contribution; plugin ecosystem migration only "begins in earnest"
at GA, with contrib parity (ads, analytics) targeted late-2026. Every one
of your five plugins uses that model.


## Migration work — core module

| Area | Work |
|---|---|
| `adapter/js/videojs.js` | `videojs(el, opts)` + `data-setup` autoSetup → `createPlayer` taking an array of features, with State/UI/Media split into separate components communicating through API contracts. Rewrite, not port. The J1 scaffolding (poller, `setState`, `messageHandler`, `j1.modules.videojs.*`) survives unchanged. |
| Delivery | v10 is npm/ESM, tree-shaken, feature-composed. J1 ships flat files via `resources.yml` `js: [...]` with `script_load: defer` and an `init_function` hook. You'd need a Webpack target emitting a UMD/IIFE artifact — real work, but you already have `packages/200_theme_js`, so nothing novel. |
| CSS themes | All five (`city`, `fantasy`, `forest`, `sea`, `uno`) plus the three plugin stylesheets target `.vjs-*` v8 class names. v10 uses a UI built from unstyled primitives in the style of Radix and Base UI. Full rewrite. Biggest single line item after YouTube. |
| YAML config | The three-layer `deep_merge` chain survives; the leaf keys under `players.youtube` do not, and can't be finalised until #1434 lands. `playbackRates` is fine — beta.24 added a playback rate menu. |


## Migration work — plugins

- **`youtube.js`** — blocked, see above. No target API.

- **`playlist` (core + ui)**
  contrib, no v10 port. This is a hard dependency of your `videoPlayer`
  module, not just `videojs`.

- **`nextprevbuttons.js`** (your #1–#7)
  Becomes *simpler*: the auto-index arithmetic against `controlBar.seekBack` / `seekForward` disappears entirely, since placement is markup ordering in
  the skin. But the state logic (`currentIndex()` / `previousIndex()` / `nextIndex()` / `lastIndex()`) depends on videojs-playlist, so it's blocked behind that.

- **`skipbuttons.js`**
  same story. `SeekButton extends Button` + `addChild(..., forwardIndex)` → a skin component. Small rewrite; `surroundPlayButton` becomes a markup concern.

- **`zoom.js`** (614 lines, `ZoomModal` / `ZoomGesture` / `ZoomButton`)
  v10 has a native gesture system (`media-gesture` element, React gesture
  hooks, added in beta.17). Rebuildable on top of it, but a rewrite.

- **`hotkeys.js`**
  beta.24 added UI support for gestures and hotkeys, so this may be partly
  obsoleted by core. Your option surface (`seekStep`, `volumeStep`, `hotkeysFocusElementFilter`, and especially `enableInactiveFocus: false`
  for the multi-player focus case) has no documented equivalent yet.

- **`native.js`**, **`autoCaption`** — minor.

## What survives untouched

The `videoPlayer` adapter's own machinery: three-layer YAML inheritance,
per-instance localStorage namespacing (MultiInstance #6), `playlistCards.mjs`
(Lit, independent of Video.js), and the `j1.adapter.*` / `j1.modules.*`
conventions. That investment isn't at risk.

## Recommendation

Hold on v8.23.8. The headline benefit — 81% smaller default bundles versus
v8 — is muted for J1 anyway, since YT playback pulls the YouTube iframe API regardless and your CSS is custom.

There's no urgency pressure either: v8 stays on bug fixes and critical
security patches, with v8/v9 moving to a "video.js-legacy" repository
and package mid-2026, docs preserved at legacy.videojs.org, and hosted
CDN copies remaining available; security-only from 2027.

Worth noting the package rename may already have landed — if you pin from
CDN or npm, that's the one thing to verify before your next build.

Three signals to watch, in order: issue #1434 (YouTube provider), GA,
then a videojs-playlist v10 port. When the first two land, a throwaway
spike outside J1 — one YT player, one skip button — would tell you more
in a day than any amount of roadmap reading.

