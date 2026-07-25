Prompt
  https://claude.ai/chat/b61f394b-3fc1-4cc2-8385-da309127d9ff
--------------------------------------------------------------------------------

How to fix and optimize the attached Jekyll (Ruby) plugins, as was done
on load_env.rb?

Create fixed version and use the comment
"claude - Optimize J1 Jekyll plugins #1" for all proposed fixes.


Claude
--------------------------------------------------------------------------------

I'll analyze the plugins and apply the same optimization patterns used in `load_env.rb` to the other plugins. Let me first check what's in the uploads and examine `j1-seo-tags.rb` (which wasn't shown in the document context but is uploaded).Now I have a complete picture. Let me look at the rest of the SEO tags file to make sure I have all the context:I have enough context. Let me lay out the issues I'll fix, then create the optimized versions.

**Common issues across all three plugins** (mirroring the load_env.rb fixes):
1. **Fragile path resolution** — `File.dirname(__FILE__).sub('_plugins/seo', '')` is a no-op (the substring doesn't exist in the path), leaving `@project_path` pointing at `_plugins/` rather than the site root, so `_data` lookups land in `_plugins/_data` (which doesn't exist). Replace with `site.source`.
2. **`YAML::load(File.open(...))`** — leaks the file handle, uses the unsafe loader, and crashes on missing files.
3. **`default.merge!(user)`** — mutates the loaded defaults hash.
4. **Verbose `plugin_disabled?`** — collapses to `!config['enabled']`.

**Plugin-specific bugs I found:**
- `j1-feed.rb`:
  - `config['tags']['enabled']` blows up if `config['tags']` isn't a Hash (the type guard is placed *after* the access).
  - Code reads `rebuild_feeds` (plural) but the defaults YAML key is `rebuild_feed` (singular) → rebuild flag never works as documented.
  - `@feed_output` is assigned but never used.
  - Path is recomputed redundantly inside an `unless` block.
  - Tag-feed regeneration doesn't honor the `rebuild_feed` flag.
- `j1-sitemap.rb`: `source_path` / `destination_path` are dead code.
- `j1-seo-tags.rb`:
  - The `SeoTag < Liquid::Tag` class runs all the path/YAML/merge logic **at class-body load time** (before any site exists). Move to lazy class methods that resolve paths from `context.registers[:site].source` on first render.
  - `page_title_extention` writes to `@site_title_extention` (typo poisons the site-level cache).
  - `date_modified` always uses current time because `current_time.to_liquid` is always truthy, so `page["last_modified"]` is never read.

Let me create the fixed files:Now the SEO tags plugin — the largest of the three. The key challenge here is that the `SeoTag < Liquid::Tag` class does its YAML/path resolution **at class-body load time**, which runs before any site exists. I'll defer that work to lazy class methods that resolve the site source from the Liquid context on first render.Now let me verify all three files are syntactically valid Ruby and copy them to the outputs directory:All three pass Ruby syntax checks. Let me run a quick sanity diff to confirm I haven't dropped any of the unchanged code in the seo-tags file (which is the largest):All structurally intact and every change is tagged. Let me copy the files to the output directory and present them:All three fixed plugins pass Ruby syntax check (`ruby -c`) and every change is tagged with `claude - Optimize J1 Jekyll plugins #1`.

**Summary of what was applied to all three files** (the same patterns as `load_env.rb`):

1. **Path resolution → `site.source`.** The original `File.dirname(__FILE__).sub('_plugins/seo', '')` was a no-op because the substring `_plugins/seo` never appears in the plugin path, so `@project_path` actually pointed at `<site>/_plugins` rather than `<site>/`. This silently broke every `_data/...` lookup.
2. **`YAML::load(File.open(...))` → safe `load_yaml` helper.** No more leaked file handles, no unsafe loader, no crash on missing/malformed YAML — failures degrade to an empty hash with a logged warning.
3. **`merge!` → `merge`.** Defaults are no longer mutated.
4. **`plugin_disabled?`** collapsed from a 5-line `if/else` to `!config['enabled']`.

**File-specific bug fixes also caught (10 / 6 / 15 tagged changes):**

- `j1-feed.rb`: fixed the `tags_config` NPE (the type guard ran *after* the unsafe access); fixed the `rebuild_feed`/`rebuild_feeds` key mismatch (defaults YAML uses singular, code read plural — option silently never worked); made tag-feed regeneration honor that flag too; removed unused `@feed_output`; removed redundant path re-assignment.
- `j1-sitemap.rb`: removed the `source_path` / `destination_path` dead code.
- `j1-seo-tags.rb`: deferred all `SeoTag < Liquid::Tag` class-body initialization to first render via a class-level `site_source` memo (it ran at file-load time before any site existed); fixed `page_title_extention` writing to `@site_title_extention` (typo poisoned the site-level cache); fixed `date_modified` always returning the current time because `current_time.to_liquid` was always truthy and shadowed `page["last_modified"]`; removed the redundant trailing `@title` line in `title`.

