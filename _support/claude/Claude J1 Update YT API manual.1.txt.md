Prompt
  https://claude.ai/chat/25eca3e3-5a3c-48ef-97bb-01cca4cf9aa2
--------------------------------------------------------------------------------

Check the attached api documentation and update the related manual pages
for YouTube iFrame API (iframe-api.adoc).

Use simple, common English that is understandable to beginners who are not
experienced with JavaScript modules or APIs for J1 Template and Masonry
in general.

Use the manual for SwiperJS (swiper-api.adoc) from the project files as
reference for the target document structure.

Create an updated/fixed version and use the comment
"claude - Update YouTube iFrame API manual #1" for all proposed changes.


Claude
--------------------------------------------------------------------------------

One more grammar defect in the hub preamble ("is used the underlying Provider API").
I'll fix that too, then rebuild and finalize:Done.

The manual is now restructured to match the SwiperJS reference: a hub page
`iframe-api.adoc` (front matter + intro + includes) plus five sub-documents
in the swiper naming scheme — `000_..._intro`, `100_..._parameters`,
`120_..._methods`, `130_..._events`, `140_..._examples` (110 is intentionally
skipped to keep the number-to-topic mapping identical to Swiper, which uses
110 for Properties).

Fixes applied, all tagged `claude - Update YouTube iFrame API manual #1`
(52 tags total, zero-deletion verified against the upload — every original
non-empty line survives verbatim or as a preserved comment):

**Restored truncated "player." endings** 
A systematic defect: the word "player." was missing at 21 spots, both at
sentence ends ("Mutes the ", "Removes the `<iframe>` containing the ") and
mid-paragraph ("in the  The default value…"). All restored.


**Replaced all 11 `lorem:sentences[5]` placeholders**
With short, beginner-friendly intros in simple English — e.g. Parameters now
explains what a key/value pair is and that J1's YAML config sets these values
for you; Methods explains what a player object is and why you must wait
for `onReady`.

**Typos and API-name errors**:
`etPlayerState()` → `getPlayerState()`,
`removeEventListener+(` → `removeEventListener(`, `getVolume(volume:Number)` → `getVolume()`
(takes no argument), `#FF6DOO` → `#FF6D00` in Example 1 (letter O instead
of zero — that branch silently failed at runtime), `onPlayerStateChange+` 
backticked properly, "recommendend", "For Loading", "AppleSafari", missing
backtick on `getVideoBytesLoaded`, missing space in "`pauseVideo`method",
a non-breaking space breaking the playlist URL example, and invisible
zero-width spaces in three "values are" sentences. Also "is used the
underlying Provider API" → "is used as".


## Two design decisions to note

I renamed the `== Settings` heading to `== Parameters` (Swiper convention)
but kept the `[[yt-iframe-api-player-settings]]` anchors unchanged so
existing cross-references keep working. And for fixes inside rendered
code/literal blocks, the preserved-original comments sit either as JS comments
in the block (Example 1) or immediately before the block (URL example),
since AsciiDoc `//` comments would render literally inside `....` blocks.


## Flagged but not touched (scope discipline)

The doc doesn't cover the cue/load methods (`loadVideoById`, `cueVideoById`, `loadPlaylist`…),
playlist navigation (`nextVideo`, `previousVideo`, `playVideoAt`),
or `getSphericalProperties` — worth a follow-up `#2` if you want the method
set complete.

Header revision bumps are left to you as usual.

