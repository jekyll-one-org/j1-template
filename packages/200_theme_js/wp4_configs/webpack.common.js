// -----------------------------------------------------------------------------
// ~/packages/200_theme_js/wp4_configs/webpack.common.js
// Webpack base (common) config (webpack v4) for J1 Theme
//
// Product/Info:
// https://jekyll.one
//
// Copyright (C) 2023-2025 Juergen Adams
//
// J1 Template is licensed under the MIT License.
// See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
// -----------------------------------------------------------------------------
// NOTE
// Bootstrap|Webpack
//    https://getbootstrap.com/docs/4.0/getting-started/webpack/
//
// -----------------------------------------------------------------------------

// Global WP config variables
// -----------------------------------------------------------------------------
const ROOT =                            '../';
const path =                            require('path');

const webpack =                         require('webpack');
const webpackDevTool =                  'source-map';

const UnminifiedWebpackPlugin =         require('unminified-webpack-plugin');

const nodeEnv =                         process.env.NODE_ENV || 'development';
const jekyllEnv =                       process.env.JEKYLL_ENV || 'development';

const jsBuildPath =                     path.join(__dirname, ROOT, '../200_theme_js/dist');
const jsSourcePath =                    path.join(__dirname, ROOT, '../200_theme_js');
const jsPublicPath =                    '/assets/theme/j1/core/js';

const jsTemplatIndex =                  'template.js';
const jsTemplatIndexIn =                path.join(jsSourcePath, jsTemplatIndex);


// Plugin definitions
// -----------------------------------------------------------------------------

// ProvidePlugin
// Manages external dependencies at *build-time* to expose global
// symbols ( to window|root) if requested. Needed e.g. for Bootstrap
// for e.g. jQuery, Popper etc.
// -----------------------------------------------------------------------------
// const providePlugins = new webpack.ProvidePlugin({
//   $:                                    'jquery',
//   jQuery:                               'jquery',
//   'window.jQuery':                      'jquery'
// });


// MODULE object definitions
// -----------------------------------------------------------------------------
module.exports = {
// module.exports = (env) => {
  // MODULE base definitions
  // ---------------------------------------------------------------------------
  context:                              jsSourcePath,
  devtool:                              webpackDevTool,

  // LOG LEVEL definitions (console)
  // ---------------------------------------------------------------------------
  performance: {
    hints:                              false
  },
  stats:                                "errors-only",                          // NOTE: default: normal, can be normal|errors-only|minimal|verbose|none

  // ENTRY DOCUMENT definitions
  // ---------------------------------------------------------------------------
  entry: {
    js:                                 jsTemplatIndexIn
  },

  // BUILD PATH definitions
  // ---------------------------------------------------------------------------
  // NOTE:
  //    Base output path is defined by: path
  //    Non-WP content is defined by:   publicPath
  // NOTE:
  //  See: https://webpack.js.org/configuration/output/#output-filename
  //  (sub)folders/filenames for output is taken from entry points (hash)
  //   entry: name|value pairs
  // NOTE:
  //  Output file (filename) is calculated relative to 'buildPath'
  // ---------------------------------------------------------------------------
  output: {
    path:                               jsBuildPath,
    publicPath:                         jsPublicPath,
    filename:                           jsTemplatIndex
  },

  // RULES and LOADERS
  // ---------------------------------------------------------------------------
  module: {

    rules: [
      // COMPILE JS except files loaded by NODE|BOWER
      // -----------------------------------------------------------------------
      {
        test:                           /\.js$/,
        exclude:                        /(node_modules|bower_components)/,
        use: [{
          loader:                       'babel-loader',
        }],
      }
    ],
  },

  // PLUGIN declarations for export
  // See plugin definition|configuration with section
  // WP Plugin definitions
  // ---------------------------------------------------------------------------
  plugins: [
    new UnminifiedWebpackPlugin()
  ]

};
