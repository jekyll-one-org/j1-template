/*
 # -----------------------------------------------------------------------------
 #  ~/src/template.js
 #  J1 Template Javascript Core library
 #
 #  Product/Info:
 #  https://jekyll.one
 #
 #  Copyright (C) 2021 Juergen Adams
 #
 #  J1 Template is licensed under the MIT License.
 #  See: https://github.com/jekyll-one-org/J1 Template/blob/master/LICENSE
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
// import '../100_template_css/scss/theme_uno/components/_footer.scss';
// import '../100_template_css/theme_uno.css';  // <-- yes, also require (s)css. This is a Webpack thing

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
// window.Cookies                       = require('js-cookie');
// window.log4javascript                = require('log4javascript');
// window.parseURL                      = require('lite-url');
// window.platform                      = require('platform');
// window.yaml                          = require('js-yaml');
// window.uuid                          = require('uuid/v4');

// Core Libraries - build|required from SOURCE
// -----------------------------------------------------------------------------

// Following source objects|modules are *explicitely* forced to be
// exposed for run-time to the global namespace (window).
// -----------------------------------------------------------------------------
window.j1.adapter                       = require('./js/adapter/adapter.js');
window.j1.core                          = require('./js/core/core.js');
window.j1.core.navigator                = require('./js/navigator/navigator.js');
// window.j1.core.cookiebar             = require('./js/cookiebar/cookiebar.js');
// window.j1.core.cookieconsent         = require('./js/cookieconsent/cookieconsent.js');
window.j1.core.asciidoctor              = require('./js/asciidoctor/asciidoctor.js');
window.j1.core.scrollSmooth             = require('./js/scroll-smooth/scroll-smooth.js');
window.j1.anime                         = require('./js/anime/anime.js');       // added for fam
// window.j1.fam                        = require('./js/fam/fam.js');           // cannot used until NOT rewritten to jQuery

// Following source objects|modules are *implicetly* forced to be
// exposed for run-time to the global namespace (window).
// -----------------------------------------------------------------------------
//const Bootstrap                         = require('./js/bootstrap/bootstrap.js');
//const J1JekyllSearch                    = require('./js/jekyll_search/jekyll_search.js');
const J1Tocbot                            = require('./js/tocbot/tocbot.js');
//const J1ThemeSwitcher                   = require('./js/bs_theme_switcher/switcher.js');
// const J1MmenuLight                     = require('./js/mmenu-light/mmenu.js');

// Passing log data over Internet|SeeMe (currently NOT used)
// -----------------------------------------------------------------------------
// window.j1.core.log4javascript        = require('./js/logger/client/webhook.js');

// BMD Libraries (moved to modules)
// -----------------------------------------------------------------------------
// window.bootstrapMaterialDesign       = require('./js/bmd/js/bmd.js');

// Github Webhooks (currently NOT used)
// -----------------------------------------------------------------------------
// window.j1.core.webhooks              = require('./js/webhooks/octokit/client.js');


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

// Additional Vanilla JS helpers
// -----------------------------------------------------------------------------
const J1AdocResultViewer                = require('./js/adoc_result_viewer/view_results.js');
// const MSIEPolyfills                  = require('./js/polyfills/ms-ie.js');

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
//   module.hot.accept('../100_template_css/theme_uno.scss', function () {
//     console.log('[HMR] Accepting the updated style.css module!');
//     require('../100_template_css/theme_uno.scss')
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
