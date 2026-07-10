Prompt
  https://claude.ai/chat/f1c92d08-23a2-40a2-ba29-ac5957fc47fe
--------------------------------------------------------------------------------

How to permanently turn off YouTube captions with the iFrame API?

Create fixed versions and use the comment
"claude - VideoPlayer permanently turn off YouTube captions #1" for all proposed fixes.


Claude
--------------------------------------------------------------------------------

Let me confirm the current YouTube IFrame API behavior for captions before writing the fix.The API behavior is confirmed. Let me check a couple more spots in the code to place the fix correctly, then verify the YouTube tech's player handle.Now I have what I need. Let me make a working copy and apply the fix.Now applying the fix. First, the core helper — a module-level function that unloads YouTube's caption modules:Now wire the helper into the `onReady` YouTube branch:Finally, ensure the initial `cc_load_policy` is hard-set to `0` in the player vars regardless of config (best-effort initial state, complementing the runtime unload):Now validate: strip Liquid tags, run `node --check`, confirm tag count, and verify additive-only.The single `>` is just the original file's missing trailing newline — the code line `}));` is byte-identical. Additive-only is fully confirmed. Let me finalize the output file.## Why `cc_load_policy` alone doesn't work

The player var `cc_load_policy=0` only controls the **initial** state ("don't
show captions by default"). It doesn't stop captions from appearing when the
viewer's YouTube account or browser preference has CC switched on, and there's
no player var that hard-disables them.

<cite index="5-1">
    The HTML5 player supports `cc_load_policy`, but it governs
    the default load behavior, not a permanent off switch.
</cite>


## The reliable mechanism

The IFrame API only exposes captions through a module that loads
**after playback starts**, signalled by the `onApiChange` event.

<cite index="2-1">
    On receiving `onApiChange`, you poll `player.getOptions()` / `getOptions('captions')`
    to see which module options are accessible, and use `setOption(module, option, value)`
    to change them.
</cite>

The module gets (re)loaded on every new video, so a one-shot call isn't enough.
You need a persistent listener that unloads it each time it fires.

Two wrinkles the fix handles:
the `onApiChange` event doesn't fire until the video actually starts playing,
and there are two differently-named caption modules — `captions` for the
HTML5 player and the legacy `cc` module, so both are covered.


## What I changed (all tagged `claude - VideoPlayer permanently turn off YouTube captions #1`)

1. **New module-level helper
   `_disableYouTubeCaptions(ytPlayer)`** (before `embedRunVideo`). It reads
   `getOptions()`, and for whichever caption module is currently present,
   clears the active track (`setOption(mod,'track',{})`) and then
   `unloadModule(mod)`. It does a best-effort immediate pass, then binds
   a persistent `onApiChange` listener (guarded by `_j1CcDisableBound` so
   it binds once) that re-applies on every fire. Acting only on present
   modules means it never throws and never loops on the unload-triggered
   event.

2. **Wired into the `onReady` YouTube branch**,
    reaching the underlying YT player via `player.tech().ytPlayer` (the same
    handle the module already uses elsewhere). Because the tech creates
    `ytPlayer` asynchronously, there's a short polling fallback (capped at ~3s)
    if it isn't ready yet. The persistent listener keeps captions off across
    in-player playlist navigation too, since each new video re-fires
    `onApiChange`.

3. **Forced `ytPlayerVars.cc_load_policy = 0`**
    in `createVideoJsPlayer` regardless of config — this only suppresses
    the initial flash before the module is unloaded; the runtime unload
    is what makes it permanent.


One caveat worth knowing:

Because the caption module only loads after playback begins, there can be
a sub-second window at the very start of a video before `onApiChange` fires
and the unload runs.

With `cc_load_policy=0` set up front, captions won't auto-show in that window
for the common case; the unload then guarantees they stay off even when the
viewer's account preference would otherwise force them on.

