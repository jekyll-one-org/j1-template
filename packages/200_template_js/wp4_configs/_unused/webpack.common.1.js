// -----------------------------------------------------------------------------
//  ~/packages/200_template_js/wp4_configs/webpack.common.js
//  Webpack base (common) config for J1 Template - Main built
//
//  Product/Info:
//  https://jekyll.one
//
//  Copyright (C) 2021 Juergen Adams
//
//  J1 Template is licensed under the MIT License.
//  See: https://github.com/jekyll-one-org/J1 Template/blob/master/LICENSE
//
// -----------------------------------------------------------------------------
// NOTE
//  Webpack > 2.x
//    As of webpack 2, you need to use expose-loader to export (expose)
//    modules, e.g jQuery object, to the global namespace|window:
//    https://stackoverflow.com/questions/29080148/expose-jquery-to-real-window-object-with-webpack
//
//  Bootstrap|Webpack
//    https://getbootstrap.com/docs/4.0/getting-started/webpack/
//
// -----------------------------------------------------------------------------
// NOTE:
//
// -----------------------------------------------------------------------------

// Global WP config variables
// -----------------------------------------------------------------------------
const ROOT =                              '../';
const path =                              require('path');

const webpack =                           require('webpack');
const webpackDevTool =                    'source-map';

const nodeEnv =                           process.env.NODE_ENV || 'development';
const jekyllEnv =                         process.env.JEKYLL_ENV || 'development';

const jsBuildPath =                       path.join(__dirname, ROOT, '../200_template_js/dist');
const jsSourcePath =                      path.join(__dirname, ROOT, '../200_template_js');
const jsPublicPath =                      '/assets/themes/j1/core/js';

const jsTemplatIndex =                    'template.js';
const jsTemplatIndexIn =                  path.join(jsSourcePath, jsTemplatIndex);


// Plugin definitions
// -----------------------------------------------------------------------------

// HtmlWebpackPlugin
// Creates an HTML index document for *HMR/Single Page*
// -------------------------------------------------------------------
const HtmlWebpackPlugin = require('html-webpack-plugin');
const createHtmlIndexPage = new HtmlWebpackPlugin({
  title: 'HMR Demo',
  // Load a custom template (lodash by default)
  //template: './src/template.html'
});

// CleanWebpackPlugin
// Cleans up files in destination at *build-time*
// -------------------------------------------------------------------
const CleanWebpackPlugin = require('clean-webpack-plugin');
const cleanUpDist = new CleanWebpackPlugin(['dist']);

// ProvidePlugin
// Manages external dependencies at *build-time* to expose global
// symbols ( to window|root) if requested. Needed e.g. for Bootstrap
// for e.g. jQuery, Popper etc.
// -------------------------------------------------------------------
const providePlugins = new webpack.ProvidePlugin({
  $:                                      'jquery',
  jQuery:                                 'jquery',
  'window.jQuery':                        'jquery',
  Popper:                                 ['popper.js', 'default']
});


// MODULE object definitions
// -----------------------------------------------------------------------------
module.exports = {

  //const mode =                            env.MODE;

  // MODULE base definitions
  // -----------------------------------------------------------------
  context:                                jsSourcePath,
  devtool:                                webpackDevTool,

  // LOG LEVEL definitions (console)
  // -----------------------------------------------------------------
  performance: {
    hints:                                false
  },
  stats:                                  "errors-only",                        // NOTE: default: normal, can be normal|errors-only|minimal|verbose|none

  // ENTRY DOCUMENT definitions
  // -----------------------------------------------------------------
  entry: {
    js:                                   jsTemplatIndexIn
  },

  // BUILD PATH definitions
  // -----------------------------------------------------------------
  // NOTE:
  //    Base output path is defined by:   path
  //    Non-WP content is defined by:     publicPath
  // NOTE:
  //  See: https://webpack.js.org/configuration/output/#output-filename
  //  (sub)folders/filenames for output is taken from entry points (hash)
  //   entry: name|value pairs
  // NOTE:
  //  Output file (filename) is calculated relative to: buildPath
  // -----------------------------------------------------------------
  output: {
    path:                                 jsBuildPath,
    publicPath:                           jsPublicPath,
    filename:                             jsTemplatIndex
  },

  // RULES and LOADERS
  // -----------------------------------------------------------------
  module: {

    rules: [
      // COMPILE JS except files loaded by NODE|BOWER
      // --------------------------------------------------------
      {
        test:                             /\.js$/,
        exclude:                          /(node_modules|bower_components)/,
        use: [{
          loader:                         'babel-loader',
        }],
      },

      // EXPOSE SETTINGS for the run-time. Defines MODULES|OBJECTS
      // *conditionaly* exposed to the global namespace (window)
      // if required - as needed e.g. for jQuery rquired by
      // e.g Bootstrap
      // --------------------------------------------------------
      // {
      //   test:                             require.resolve('jquery'),
      //   use: [
      //     {
      //       loader:                       'expose-loader',
      //       options:                      'jQuery'
      //     },
      //     {
      //       loader:                       'expose-loader',
      //       options:                      '$'
      //     }
      //   ]
      // },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: [{
            loader:                       'file-loader'
        }]
      }
    ],
  },

  // PLUGIN declarations for export
  // See plugin definition|configuration with section
  // WP Plugin definitions
  // --------------------------------------------------------
  plugins: [
    // providePlugins
  ]

};
