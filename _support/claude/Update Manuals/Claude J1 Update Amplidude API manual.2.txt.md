Prompt
   
--------------------------------------------------------------------------------

Check the attached documentation for the Amplitude API (amplitude-api.adoc).

Use simple, common English that is understandable to beginners who are not
experienced with JavaScript modules or APIs for J1 Template and Amplitude
in general.

Use the manual for SwiperJS (swiper-api.adoc) from the project files as
reference for the target document structure.

Create an updated/fixed version and use the comment
"claude - Update Amplitude API manual #2" for all proposed changes.


Claude
--------------------------------------------------------------------------------

Extraction is clean. Now I'll build the restructured master document:The update is complete. The monolithic manual (2837 lines) is now restructured to match the SwiperJS reference: a slim master document plus seven numbered sub-documents for `_includes/documents`, wired up via `include::{documentdir}/...` — the same pattern used by swiper-api.adoc and photoswipe.adoc.

**What changed (all tagged `claude - Update Amplitude API manual #2`, 28 tag sites):**

Master document `amplitude-api.adoc` (176 lines): added the `:includedir:`/`:tabledir:`/`:documentdir:` attribute block, the reading-time attributes as used by the Swiper master, a version NOTE block ("based on AmplitudeJS 5.3.2 for J1 2026.x"), the include statements, and a block comment mapping every moved section to its new file. Front matter title attributes aligned to the Swiper API style (`API` / `Programming Interface`), with the originals preserved as YAML comments.

New `000_amplitude_api_intro.asciidoc`: an "Overview" section in beginner English modeled on the Swiper intro — what the API consists of, that in J1 you configure via YAML through the amplitude adapter, a table of the three built-in players, and a roadmap of the manual. All facts were taken from existing sections, no new claims.

Moved sub-documents 100–150: content moved verbatim, plus small tagged improvements — explicit section anchors (`[[amplitude-api--...]]`) on each top-level section, beginner-English rewrites of the "Interactive Elements" and "Metadata" intros, a NOTE in "Notes on Implementation" clarifying that "we" means the Amplitude developers (not J1), and typo/grammar fixes in the Examples intro ("suports", "build-in", "player … are"). Every reworded passage keeps the original text in the `////` change comment.

**Validation:** after reverting the tagged #2 edits, all six moved slices are byte-identical to the original document portions (diff-proven); the #1 tag census is unchanged at exactly 5; all 7 `include::` targets exist; front matter YAML parses; all `////` comment fences are balanced.

Two design decisions flagged inline for your review: the reading-time attributes were added, but the hardcoded `mdi:clock-...` line is kept until you confirm the theme renders the attributes for this page; and the permalink was left untouched to avoid breaking links, even though the Swiper master uses a different path scheme.
