// -----------------------------------------------------------------------------
// ~/packages/200_theme_js/wp4_configs/webpack.develop.js
// Webpack development config (dev-server v4) for J1 Theme
//
// Product/Info:
// https://jekyll.one
//
// Copyright (C) 2023 Juergen Adams
//
// J1 Template is licensed under the MIT License.
// See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE.md
// -----------------------------------------------------------------------------
// NOTE:
//   Webpack commandline|s
//
//   node C:\DevTools\NodeJS\node_modules\webpack\bin\webpack.js serve --progress --stats verbose --config D:\j1\github\j1-theme\j1-theme-2023.0.x\packages\200_theme_js\wp4_configs\webpack.develop.js
//   hot: webpack-dev-server --mode development --config wp4_configs/webpack.develop.js --progress
//   hot: webpack-dev-server --mode development --config wp4_configs/webpack.develop.js
// -----------------------------------------------------------------------------
// webpack-dev-server migration v3 --> v4:
//    https://github.com/webpack/webpack-dev-server/blob/master/migration-v4.md
//    https://github.com/webpack/webpack-dev-middleware
//
// -----------------------------------------------------------------------------

// Global WP config variables
// -----------------------------------------------------------------------------
const ROOT =                            '../';
const path =                            require('path');

const webpack =                         require('webpack');
const { merge } =                       require('webpack-merge');
const common =                          require('./webpack.common.js');

// Check if WP is running in a Docker container (environment var J1DOCKER)
// to adjust devServerHost and devServerPageOpen
//
const dockerEnv =                       process.env.J1DOCKER || false;

// Host Check security setting. Set environment var DISABLE_HOST_CHECK
// to 'true' to disable host checking if the development is done on
// a 'remote' host or the development system is e.g. behind a Proxy.
//
//const hostCheck =                     !!JSON.parse(String(process.env.DISABLE_WP_HOST_CHECK).toLowerCase());
const hostCheckDisabled =               !!"String(process.env.DISABLE_WP_HOST_CHECK).toLowerCase()" || false;

// WP Development Server config variables
// -----------------------------------------------------------------------------
const devServerHost =                   dockerEnv ? '0.0.0.0' : 'localhost';
const devServerPageOpen =               dockerEnv ? false : true;
const devServerPort =                   process.env.WP_JEKYLL_PORT || 41000;
const distFolder =                      path.resolve(__dirname, './dist');
const nodeModulesFolder =               path.resolve(__dirname, './node_modules');
const cssSrc =                          path.resolve(__dirname, ROOT, '../100_theme_css');
const gemSrc =                          path.resolve(__dirname, ROOT, '../500_theme_gem');
const jekyllSources =                   path.resolve(__dirname, ROOT, '../400_theme_site');
const jekyllSite =                      path.resolve(__dirname, ROOT, '../400_theme_site/_site');
const jekyllSiteAssets =                path.resolve(__dirname, ROOT, '../400_theme_site/_site/assets');
const jekyllSitePages =                 path.resolve(__dirname, ROOT, '../400_theme_site/_site/pages');
const jekyllSitePosts =                 path.resolve(__dirname, ROOT, '../400_theme_site/_site/posts');
const jekyllSiteCollections =           path.resolve(__dirname, ROOT, '../400_theme_site/_site/collections');
const jekyllSiteAutoPages =             path.resolve(__dirname, ROOT, '../400_theme_site/_site/autopages');

// WP PLUGIN definitions
// -----------------------------------------------------------------------------

// WP MODULE definitions
// https://webpack.js.org/guides/production/
// -----------------------------------------------------------------------------
module.exports = merge(common, {

  // GLOBALS
  // ---------------------------------------------------------------------------
  mode:                                 'development',                          // force the mode configured (like CLI option --mode)
  stats:                                'errors-only',                          // default: normal, can be normal|errors-only|minimal|verbose|none

  // RULES and LOADERS
  // ---------------------------------------------------------------------------
  module: {
  },

  // PLUGIN declarations for export
  // v4 automatically apply HotModuleReplacementPlugin plugin when set hot: true
  // ---------------------------------------------------------------------------
  plugins: [
    // hotModuleReplacement
  ],

  // WP DEVELOPMENT SERVER configuration
  // ---------------------------------------------------------------------------
  // Used for npm script *develop*  for *hot reload*.
  // See values|var with *Global config variables*.
  //
  // Response header settings for the STATIC web (includes CORS if needed)
  // headers:
  //   'Access-Control-Allow-Origin':     '*'
  //   'Access-Control-Allow-Methods':    'GET, POST'                           // 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
  //   'Access-Control-Allow-Headers':    'Content-Type'                        // 'Authorization, X-Requested-With, Content-Type'
  //   'X-Builder-Engine-By':             'J1 Theme'
  // ---------------------------------------------------------------------------
  // NOTE
  //    option --inline adds webpack-dev-server/client?<webpack-dev-server url>
  //    to all entry points.
  // ---------------------------------------------------------------------------
  devServer: {                                                                  // see: https://webpack.js.org/configuration/dev-server/
    host:                               devServerHost,                          // host to use
    port:                               devServerPort,                          // port number to listen for requests on:
    hot:                                true,                                   // enable HMR (Hot Module Replacement)
    open:                               devServerPageOpen,                      // open a browser after server had been started
    allowedHosts:                       'all',                                  // host security setting. Only use it when you know what you're doing.
    headers: {                                                                  // Response header settings for the STATIC web (CORS)
                                        'X-Builder-Template': 'J1 Theme',       // additional HTTP headers
                                        'X-Builder-Engine':   'Jekyll'
    },
    client: {                                                                   // see: https://webpack.js.org/configuration/dev-server/#devserverclient
      logging:                          'info',                                 // set log level in the browser (default: info, can be one of info|warn|error|none|verbose)
      overlay:                          true,                                   // shows a full-screen overlay in the browser when there are compiler errors or warnings
      progress:                         false,                                  // shows compilation progress in percentage in the browser
    },
    devMiddleware: {                                                            // see: https://webpack.js.org/configuration/dev-server/#devserverdevmiddleware
      index:                            true,                                   // the server will respond to requests to the root URL
      stats:                            'minimal',                              // default: normal, can be normal|errors-only|minimal|verbose|none
    },
    static: {                                                                   // see: https://webpack.js.org/configuration/dev-server/#devserverstatic
      directory:                        jekyllSite,                             // tell the server where to serve the content from
      serveIndex:                       true,                                   // tell dev-server to use serveIndex middleware when enabled; generate directory listings on viewing directories that don't have an index.html file
      staticOptions: {
        watchOptions: {                                                         // see: https://webpack.js.org/configuration/watch/#watchoptions
//        stdin:                        true,                                   // stop watching when stdin stream has ended
//        followSymlinks:               true,                                   // follow symbolic links while looking for a file
//        poll:                         true,                                   // turn on polling by passing true for e.g. NFS or machines in VirtualBox, WSL, Containers, or Docker. When set poll to 'true', the default poll interval is to set to '5000', or specify a poll interval in 'milliseconds'
          aggregateTimeout:             500,                                    // delay before rebuilding once the first file changed
        }
      },
      // see: https://webpack.js.org/configuration/dev-server/#watch
      watch: {                                                                  // watch the files served by the static.directory option. File changes will trigger a full page reload
        ignored: [                                                              // !!! unclear why ALL Jekyll folders ignored !!!
                                        jekyllSiteAssets,
                                        jekyllSitePages,
                                        jekyllSitePosts,
                                        jekyllSiteCollections,
                                        jekyllSiteAutoPages
        ],
        usePolling:                     false                                   // disable polling to watch files
      }
    }
  }

});  // end module.exports|merge
