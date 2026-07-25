Prompt
  https://claude.ai/chat/a859fb73-b64e-484f-a5fd-1090c48f95ea
--------------------------------------------------------------------------------

Justified Gallery (https://miromannino.github.io/Justified-Gallery/) is a
library that arranges images in *evenly aligned rows* as a block. Each row
in such a block has the same height, but the images inside it can have
different widths. This is the layout style you see on photo sites like Flickr
or Google Photos.

Check the attached YAML, HTML, CSS, and JavaScript files and update the
related manual pages for Justified Gallery (justified-gallery-api.adoc).
Use simple, common English that is understandable to beginners who are not
experienced with JavaScript modules or APIs for J1 Template and Masonry
in general.

Use the manual for the Photoswipe Lightbox (photoswipe.adoc) from the
project files as reference for the target document structure.

Create updated/fixed versions and use the comment
"claude - Update Justified Gallery manual #1" for all proposed changes.


Claude
--------------------------------------------------------------------------------

I'll start by examining all the uploaded files to understand the Justified Gallery module and its current documentation structure.Now let me examine the source code files to understand how the module actually works. Starting with the adapter:Now the HTML template:Now the configuration files. Let me read `gallery_control.yml`:Now the media content file:Now let me examine the actual Justified Gallery library to verify the options, methods, and events. Let me look at the key parts:Let me verify a couple of the library's methods and check whether the referenced Photoswipe manual exists anywhere:I now have a complete, verified picture of how the module works. I found several things in the current manual that don't match the shipped code (leftover *Masonry*/*Swiper* copy-paste text, `lorem` placeholders, and a few wrong default values). Let me create the corrected, beginner-friendly versions.Now the intro section — this had the most leftover Masonry text:Now the "Getting Started" page — I'll keep its good conceptual explanations but frame it for J1 users:Now the Properties page — replacing the `lorem` placeholder and correcting the default values that don't match the shipped library:Now the Methods page — removing the misplaced *Swiper* note and the `lorem` placeholder:Now the Events page — same clean-up:Let me validate the AsciiDoc structure of all files (balanced delimiters, matching cross-reference anchors):All six files validate cleanly — delimiters balanced, every cross-reference resolves to a defined anchor, and each file carries the required tag.

I checked all the source files (`gallery.yml`, `gallery_control.yml`, `gallery_media.yml`, `gallery.html`, `gallery.js`, `justifiedGallery.js`, and the CSS) and updated all six manual pages.
Every change is tagged `claude - Update Justified Gallery manual #1` in an
AsciiDoc comment block explaining what and why.

The biggest issue was that several pages were still copied from the
**Masonry** and **Swiper** manuals and described the wrong module.


Here's what I fixed:

**Intro (`000`)**
Rewritten. It called this "the Masonry API", pointed to `masonry*.yml` files,
listed grid types `image | video | post | collection`, described a Masonry
"Cascading grid" feature, and initialized with `$('.grid').masonry()`.

Corrected everything to Justified Gallery: the three real config files
(`gallery.yml` → `gallery_control.yml` → `gallery_media.yml`), the actual
`image` / `video` types (with `html5` / `youtube`), a real feature list,
and the true adapter behavior (`justifiedGallery()`, AJAX HTML loading,
lightbox attached on `jg.complete`).

I also removed a made-up "`initTimeout`, 1200 ms" option the adapter doesn't
have, and fixed the instance accessor to `$('#id').data('jg.controller')`.


**Getting Started (`100`)**
Kept the good concept explanations, added a J1 note so beginners know these
options live in YAML, added the equivalent YAML for the example, and
fixed a `ppath/to` typo.


**Properties (`200`)**
Replaced the `lorem` placeholder and corrected four defaults that didn't
match the shipped library: `justifyThreshold` 0.75→**0.90**,
`refreshTime` 250→**200**, `selector` →**`'a'`**,
`imgSelector` →**`'> img, > a > img, > svg, > a > svg'`**.

Fixed a broken `selector` table row (missing back-tick), added the previously
undocumented `triggerEvent`, and split rarely-used options into an "Advanced"
table.


**Methods (`300`) & Events (`400`)**
Removed the misplaced "core Swiper events" notes, replaced the `lorem`
placeholders, and documented the real behavior (methods: the update-options
call form, `norewind`, `destroy`; events: `jg.complete`, `jg.resize`, `jg.rowflush`).

Two J1-specific points I made sure to surface for beginners: the module
writes spacing as **`gutters`** (the adapter maps it to the library's
`margins`), and `rowHeight` defaults to **150** in J1 even though the
library default is 120.


**One note**

I couldn't find `photoswipe.adoc` anywhere in the uploads or filesystem,
so I couldn't use it as the structural reference. The existing include
structure (Overview → Getting Started → Properties → Methods → Events)
is already a standard J1 API-manual layout, so I preserved it. If you
upload `photoswipe.adoc`, I can realign the headings, section order,
or admonition style to match it exactly.
