/*
 # -----------------------------------------------------------------------------
 #  ~/src/template.js
 #  J1 Theme Javascript Core library
 #
 #  Product/Info:
 #  https://jekyll.one
 #
 #  Copyright (C) 2023-2025 Juergen Adams
 #
 #  J1 Template is licensed under the MIT License.
 #  See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 #
 # -----------------------------------------------------------------------------
*/

// -----------------------------------------------------------------------------
// ESLint shimming
// -----------------------------------------------------------------------------
/* eslint-disable no-unused-vars                                              */
/* global window                                                              */

// -----------------------------------------------------------------------------
// Import SASS sources for HMR
// -----------------------------------------------------------------------------
// import '../100_theme_css/scss/theme_uno/components/_footer.scss';
// import '../100_theme_css/theme_uno.css';  // <-- yes, also require (s)css. This is a Webpack thing

// Core Libraries - imported|required from NODE|NPM modules
// -----------------------------------------------------------------------------
//
// Following objects (framework modules) are *conditionaly* forced to be
// exposed for run-time to the global namespace (window) by WP config
// file (expose-loader):
//  jQuery
//  Popper  ('popper.js/dist/umd/popper', https://github.com/twbs/bootstrap/issues/23381)
// -----------------------------------------------------------------------------

// Core Utilities (moved to modules)
// -----------------------------------------------------------------------------
// Following objects (native node modules) are *explicitely* forced to be
// exposed for run-time to the global namespace (window).
// -----------------------------------------------------------------------------
window.Cookies               = require('js-cookie');
window.yaml                  = require('js-yaml');
window.log4javascript        = require('log4javascript');
window.liteURL               = require('lite-url');
window.platform              = require('platform');

// Core Libraries - build|required from SOURCE
// -----------------------------------------------------------------------------

// Following source objects|modules are *explicitely* forced to be
// exposed for run-time to the global namespace (window).
// -----------------------------------------------------------------------------
// window.deeplTranslator    = require('./js/deepl-translator');                // J1 Module deeplAPI used instead
// window.j1.fab             = require('./js/fab/fab.js');                      // cannot used until NOT rewritten to jQuery
// window.ejs                = require('./js/ejs/ejs.js');                      // currently NOT used
// window.j1.lazyCSSLoader   = require('./js/lazyCSS/lazyCSSLoader.js');        // currently NOT used

window.j1.adapter            = require('./js/adapter/adapter.js');

window.j1.api                = require('./js/api/api.js');
window.j1.api.anime          = require('./js/api/anime/anime.js');              // added for fab
window.j1.api.asciidoctor    = require('./js/api/asciidoctor/asciidoctor.js');
window.j1.api.consoleFilters = require('./js/api/console_filter/consoleFilters.js');
window.j1.api.errorFilters   = require('./js/api/error_filter/errorFilters.js');
window.j1.api.navigator      = require('./js/api/navigator/navigator.js');
window.j1.api.scrollSmooth   = require('./js/api/scroll-smooth/scroll-smooth.js');

// window.j1.api.ts2sec         = require('./js/api/tools/timestamps2seconds.js');

window.j1.modules            = {};                                              // placeholder object for all J1 Modules
window.j1.env                = 'prod';

// Following source objects|modules are *implicetly* forced to be
// exposed for run-time to the global namespace (window).
// -----------------------------------------------------------------------------
// const J1Yaml              = require('js-yaml');
// const J1jQueryExt         = require('./js/jquery-extensions/jquery-regex.js');
// const J1ThemeSwitcher     = require('./js/bs_theme_switcher/switcher.js');
// const J1MmenuLight        = require('./js/mmenu-light/mmenu.js');
// const BootstrapJS         = require('./node_modules/bootstrap/dist/js/bootstrap.js');

const J1Tocbot               = require('./js/modules/tocbot/tocbot.js');
const J1AttrChangeListener   = require('./js/modules/jquery-extensions/attrchange.js');
const J1SCarousel            = require('./js/modules/carousel/carousel.js');
const J1Speak2Me             = require('./js/modules/jquery-extensions/speak2me/speak2me.js');

// Additional Vanilla JS helpers
// -----------------------------------------------------------------------------
const J1AdocResultViewer     = require('./js/api/asciidoctor/view_results.js');


// Passing log data over Internet|SeeMe (currently NOT used)
// -----------------------------------------------------------------------------
// window.j1.api.log4javascript        = require('./js/logger/client/webhook.js');

// BMD Libraries (moved to modules)
// -----------------------------------------------------------------------------
// window.bootstrapMaterialDesign       = require('./js/bmd/js/bmd.js');

// Github Webhooks (currently NOT used)
// -----------------------------------------------------------------------------
// window.j1.api.webhooks              = require('./js/webhooks/octokit/client.js');

// Test|Custom modules (currently NOT used)
// -----------------------------------------------------------------------------
// window.j1promiseTest                 = require('./js/custom/test_promises.js');
// window.j1Example                     = require('./js/custom/example_module.js');

// BS Libraries (moved to modules)
// -----------------------------------------------------------------------------
// Following source objects|modules are *implicetly* forced to be
// exposed for run-time to the global namespace (window).
// -----------------------------------------------------------------------------
// const Bootstrap                      = require('./js/bootstrap/bootstrap.js');
// const J1JekyllSearch                 = require('./js/jekyll_search/jekyll_search.js'); // Buffer Kack
// const J1Tocbot                       = require('./js/tocbot/tocbot.js');

// Backstretch (moved to modules)
// -----------------------------------------------------------------------------
// Following source objects|modules are *implicetly* forced to be
// exposed for run-time to the namespace of jQuery ($).
// -----------------------------------------------------------------------------
// const J1Attics                       = require('./js/backstretch/backstretch.js');

// HMR messages  (currently NOT used)
// -----------------------------------------------------------------------------
// if (module.hot) {
//   var logtext;
//   var stat;
//   var stat=module.hot.status();
//
//   logtext='[INFO ] [HMR                               ] [Hot Module Replacement enabled]';
//   console.log(logtext);
//   logtext='[INFO ] [HMR                               ] [Status: ' + stat + ']';
//   console.log(logtext);
//
//   module.hot.accept('./template.js', function() {
//     console.log('[HMR] Accepting the updated template.js module!');
//   });
//
//   module.hot.accept('../100_theme_css/theme_uno.scss', function () {
//     console.log('[HMR] Accepting the updated style.css module!');
//     require('../100_theme_css/theme_uno.scss')
//   })
//
// React to the current status...
// module.hot.addStatusHandler(status => {
//   stat=module.hot.status();
//   logtext='[INFO ] [HMR                               ] [Status: ' + stat + ']';
//   console.log(logtext);
// });
//}

// -----------------------------------------------------------------------------
// END