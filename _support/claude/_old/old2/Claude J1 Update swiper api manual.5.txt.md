Prompt
  https://claude.ai/chat/e1c38d9a-d9fc-4f2f-b21c-f19e0ca53df4
--------------------------------------------------------------------------------

Sort the level 3 sections in the manual140_swiper_modules.asciidoc
alphabeticallay from a to z.

Create updated/fixed version and use the comment
"claude - Update swiper manual #5" for all proposed changes.


Claude
--------------------------------------------------------------------------------

Now I have a clear picture. Let me analyze the file structure:

- Lines 1-40: header/intro (with comments at top)
- Lines 41-2827: 24 level-3 sections, each starting with `[role="mt-5"]`, `[[swiper-api-modules-<name>]]`, and `=== <Name>`
- Between sections: 2 blank lines
- Between intro and first section: 1 blank line

Let me extract sections, sort them alphabetically, and rebuild the file.Let me verify the output is correct.Sections are now in alphabetical order. Let me verify content integrity by checking that no content was lost or duplicated.Content is fully preserved. Let me also spot-check section boundaries to confirm sections weren't split up — that each section's content travels with its heading.Everything checks out:
- **2828 lines** = original 2827 + 1 new claude comment line
- **68682 bytes** = 68646 + 36 bytes (`// claude - Update swiper manual #5\n` = 36 bytes ✓)
- All 24 sections present in alphabetical order (a11y → Zoom)
- All content preserved (verified by full sorted-line diff)
- All structural markers (78 anchors, 79 role tags, 54 sub-headings, 92 source-block delimiters, 102 table delimiters) match exactly
- Trailing newline style preserved

Let me copy the result to the outputs folder.The 24 level-3 sections are now sorted alphabetically (case-insensitive):

| # | Section |   | # | Section |
|---|---|---|---|---|
| 1 | a11y (Accessibility) | | 13 | History Navigation |
| 2 | Autoplay | | 14 | Keyboard Control |
| 3 | Cards Effect | | 15 | Lazy Loading |
| 4 | Controller | | 16 | Manipulation |
| 5 | Coverflow Effect | | 17 | Mousewheel Control |
| 6 | Creative Effect | | 18 | Navigation |
| 7 | Cube Effect | | 19 | Pagination |
| 8 | Fade Effect | | 20 | Parallax |
| 9 | Flip Effect | | 21 | Scrollbar |
| 10 | Free Mode | | 22 | Thumbs |
| 11 | Grid | | 23 | Virtual Slides |
| 12 | Hash Navigation | | 24 | Zoom |

Changes made:
- Reordered the 24 level-3 sections (`=== Section`) alphabetically; each section's anchor, sub-sections, tables and code blocks travel with it.
- Preserved the preamble (`== Modules` intro) and the 2-blank-line separator pattern between sections.
- Added `// claude - Update swiper manual #5` to the existing claude-comment block at the top of the file.

Note on sort key: I sorted by the visible heading text (e.g. `a11y (Accessibility)` sorts under "a"). If you'd prefer sorting by the anchor slug (e.g. `swiper-api-modules-a11y`) or any other key, let me know — the order would be identical in this case, but worth flagging.
