Prompt
  https://claude.ai/chat/83f869a9-660d-4e49-87a5-476a3e783477
--------------------------------------------------------------------------------

Check the attached documentation for data, CSS, YAML, and JS files and update
of the related manual pages for the Amplitude API (amplitude-api.adoc).

Use simple, common English that is understandable to beginners who are not
experienced with JavaScript modules or APIs for J1 Template and Amplitude
in general.

Use the manual for SwiperJS (swiper-api.adoc) from the project files as
reference for the target document structure.

Create an updated/fixed version and use the comment
"claude - Update Amplitude API manual #1" for all proposed changes.


Claude
--------------------------------------------------------------------------------

The user mentions swiper-api.adoc as a structural reference, but it's not among the uploads — let me check past conversations for it.I checked all the attached files (both YAML config files, the media file, the generated HTML portion, the ytp plugin, the vendor library, and the three CSS themes) and updated the manual. Every change carries the tag `claude - Update Amplitude API manual #1` in an AsciiDoc comment block explaining what was changed and why. All delimiters validate as balanced, and every `amplitude::` reference now matches a configured player id 1:1.

**What changed:**

**New top-level section "Configuration (J1 Template)"** — the biggest gap. The manual previously jumped straight from the intro to the low-level vendor HTML elements; the J1 side (YAML files, merge order, page usage) was completely undocumented. The new section covers the three-file chain (`defaults/amplitude.yml` → `amplitude_control.yml` → per-player settings), how to place a player on a page with `resources: [ amplitudejs ]` plus `amplitude::{id}[]`, a full player-settings table (`id`, `type`, `source`, `privacy_enhanced`, `playlist.name`, `plugin_manager`), and the playlist/album/item reference including a plain-English explanation of the `&album` / `<<: *album` YAML anchor pattern. All keys and defaults were verified against the shipped files.

**Documented `data-amplitude-player`** — a J1 note under "Structure for Elements" explaining this template-specific attribute, which your `Fix J1 Amplitude playerID #1` work added to all control elements and which ytp uses to resolve the player instance on multi-player pages.

**Fixed the YouTube examples** — the manual referenced `bea_yt_large` and `diana_krall_yt_large`, but neither player exists in `amplitude_control.yml` and no matching playlists exist in the media file, so those blocks couldn't render. Replaced with the actually configured `olivia_dean_yt_large` player ("The Art Of Loving"), including its real control YAML so readers can connect the page block with the configuration. Also extended the ytp intro with two verified facts: the privacy-enhanced `youtube-nocookie.com` host, and `start`/`end` partial playback.

**Minor** — added the shipped library version (AmplitudeJS v5.3.2, verified in the file headers) to the intro.

Two caveats: `swiper-api.adoc` wasn't among the uploads, so I followed the J1 manual conventions already established in this file and your recent Justified Gallery/VideoPlayer manuals (config-first structure, striped tables, tagged comment blocks). And since both uploads were named `amplitude.js`, the second overwrote the first — only the vendor library reached me, not the J1 adapter. Adapter behavior (AJAX loading, `timestamp2seconds`) was cross-checked via `amplitude.html` and `ytp.js` instead; if you'd like the adapter's public functions documented too, re-upload it under a distinct name and I'll extend the Methods section.

