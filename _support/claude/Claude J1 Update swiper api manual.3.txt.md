Prompt
  https://claude.ai/chat/d86a6056-ed71-45ab-9ecf-288624681ede
--------------------------------------------------------------------------------

SwiperJS provides a complete carousel engine that can be operated via touch
(mobile devices) and mouse/keyboard (desktop).

Create/Rewrite the same section structures from the table each row in
chapter "Additional parameters" like the existing sections "a11y" or
"allowSlideNext" (were taken fron such a table as well).

Create an updated version and use the comment
"claude - Update swiper manual #3" for all proposed changes.


Claude
--------------------------------------------------------------------------------

Now I have a clear picture. Let me search the project knowledge to check if there's an existing convention for change comments.Good, I understand the convention now. Let me search for previous swiper manual updates to confirm I'm building on the right pattern.Confirmed - the convention is to add `// claude - Update <module> manual #<N>` inline at each change location. Let me now build the updated file. Given the size (92 parameters to convert), I'll work iteratively.Now let me build the updated file. I'll:
1. Keep the existing sections (lines 1-675: header + intro + a11y through flipEffect) 
2. Update the intro paragraph to reflect the new structure
3. Replace the "Additional parameters" table (line 676 onwards) with 92 individual sections

Let me start with step 1 — extract the unchanged part:Now update the intro paragraph to reflect the new structure:Now I need to append 92 new sections. Let me build them in chunks for manageability. First chunk — sections from `focusableElements` through `injectStylesUrls`:All chunks appended. Let me verify the output by checking counts and key sections:I see two issues to investigate — there's still a "quick reference" heading and "compact reference table" text. Let me check where they are:Both occurrences are intentional — they're in my explanatory comments describing the change. Let me do a few more sanity checks:Excellent! Everything looks good. Let me do a final spot-check on a few representative sections (one with code example, one with notes, one with caution):Let me verify the file ending is clean and then copy to outputs:Done. Here's a summary of the changes in the updated `100_swiper_parameters.asciidoc`:

**What was changed**
- The chapter intro paragraph was rewritten (it no longer mentions a "compact reference table") to reflect that every parameter now has its own subsection.
- The `=== Additional parameters (quick reference)` section heading and its long 4-column table were removed.
- Each of the **92 rows** of that table (`focusableElements` → `zoom`) was rewritten as its own subsection, using exactly the same structure as the existing `a11y` / `allowSlideNext` sections:

  ```
  [role="mt-4"]
  === <paramName>

  <description>

  [optional code example]

  [cols="3a,2a,1a", subs=+macros, options="header", width="100%", role="rtable"]
  |===
  |Name |Type |Default

  |`<paramName>`
  |<type>
  |<default>

  |===
  ```

- Code samples, `____` block-quote notes, and `[CAUTION]` admonitions from the original table cells were preserved (see e.g. `freeMode`, `loop`, `rewind`, `slideActiveClass`, `width`).
- All changes are marked with `// claude - Update swiper manual #3` — one comment before the intro change, one block comment introducing the converted section, and one comment before every new subsection (94 markers total).

**Final counts**
- 27 existing dedicated sections (a11y → flipEffect) — untouched
- 92 new dedicated sections (focusableElements → zoom) — converted from the table
- 119 `===` sections total, alphabetically ordered from `a11y` to `zoom`
- 119 parameter summary tables (one per section)
