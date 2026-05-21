Prompt
  https://claude.ai/chat/cf6be2bd-ba04-4524-9c07-c170408f1a8c
--------------------------------------------------------------------------------

The J1 Template core JavaScript files are bundled via Webpack 5.
Can the WP files be optimized?

Please check the attached WP V5 code for bundling the J1 Template core files.

Create a fixed version and use the comment
"claude - optimize J1 Template core bundle #1" for all proposed fixes.


Claude
--------------------------------------------------------------------------------

Looking at the two Webpack files, I can see several opportunities for optimization — including one clear bug (the `hostCheckDisabled` expression is wrapped in quotes), several Webpack-5-native features that aren't being used yet, and some empty/dead config blocks. Let me build the fixed versions.### Summary of changes

**`webpack.common.js`**

| Change | Effect |
|---|---|
| Filesystem `cache` (type: filesystem) | Biggest win — 5-10× faster rebuilds; restored from disk between runs |
| `babel-loader` `cacheDirectory: true` | Skips re-transpiling unchanged files |
| `output.clean: true` | Native dist-folder cleanup; removes need for CleanWebpackPlugin |
| `devtool` env-aware (`eval-cheap-module-source-map` in dev, `source-map` in prod) | Dev rebuilds noticeably faster, prod debuggability unchanged |
| Explicit `resolve.extensions` / `resolve.modules` | Faster module resolution |
| Removed unused `require('webpack')` | Dead import |
| Removed `UnminifiedWebpackPlugin` | Unmaintained, not webpack-5 native, and a no-op in dev |

**`webpack.develop.js`**

| Change | Effect |
|---|---|
| **Fixed `hostCheckDisabled`** — original was `!!"String(process.env...)"` (string literal in quotes, always truthy and never read) | Flag now actually reads `DISABLE_WP_HOST_CHECK` and is wired into `allowedHosts` |
| `allowedHosts: hostCheckDisabled ? 'all' : 'auto'` | Safer default — `'all'` only when explicitly requested |
| `parseInt` on `WP_JEKYLL_PORT` | Avoids string-vs-number bugs |
| `compress: true` | gzip on dev server — faster page loads, closer to prod |
| `client.overlay` → errors-only object | Warnings no longer hijack the screen |
| `client.reconnect: 5` | Prevents infinite reconnect loop in a dead-server tab |
| Removed misplaced `static.staticOptions.watchOptions` | It was a silent no-op (`staticOptions` forwards to `serve-static`, which doesn't accept watchOptions) |
| Removed empty `module: {}` and `plugins: []` blocks | Dead code; HMR is auto-applied by `hot: true` in dev-server v4+ |
| Removed unused `require('webpack')` | Dead import |

Every change is tagged with `// claude - optimize J1 Template core bundle #1` so they're easy to grep and review.

Two things worth flagging that I deliberately did **not** change, in case you want to revisit:

1. The `path.join(__dirname, ROOT, '../200_theme_js')` style resolves the same as `path.resolve(__dirname, '../../200_theme_js')` but is harder to read. Tidying is cosmetic, so I left it.
2. If you actually need the parallel min/unmin production output that `UnminifiedWebpackPlugin` used to give you, the cleanest webpack-5 path is two separate prod configs (one with `optimization.minimize: true`, one with `false`) rather than reviving the plugin. Happy to draft that if needed.

