Prompt
    https://claude.ai/chat/c5b05f8c-61d0-4afd-bcfb-a480ab819098
--------------------------------------------------------------------------------

When a new file is opened from Explorer View in VS Code Editor, no
already-opened files should be closed.

How to configure this behavior?


Claude
--------------------------------------------------------------------------------

The behavior you're describing is VS Code's "preview mode" — single-clicking a file in the Explorer opens it in a preview tab (shown with italic title), and opening another file replaces that tab instead of adding a new one.

To disable it, set `workbench.editor.enablePreview` to `false`:

1. Open Settings (`Ctrl+,` / `Cmd+,`)
2. Search for `enablePreview`
3. Uncheck **Workbench › Editor: Enable Preview**

Or edit `settings.json` directly:

```json
"workbench.editor.enablePreview": false
```

A couple of related settings you might want too:

- `"workbench.editor.enablePreviewFromQuickOpen": false` — same behavior for files opened via `Ctrl+P` / `Cmd+P`
- `"workbench.editor.enablePreviewFromCodeNavigation": false` — same for Go to Definition and similar navigation

Quick tip without changing settings: double-clicking a file in the Explorer (instead of single-clicking) opens it as a permanent tab.

