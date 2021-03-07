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

// Following objects (native node modules) are *explicitely* forced to be
// exposed for run-time to the global namespace (window).
// -----------------------------------------------------------------------------
window.Clipboard                        = require('clipboard');
window.Cookies                          = require('js-cookie');
window.log4javascript                   = require('log4javascript');
window.moment                           = require('moment');
window.noUiSlider                       = require('nouislider');
window.yaml                             = require('js-yaml');
window.uuid                             = require('uuid/v4');
window.parseURL                         = require('lite-url');
window.platform                         = require('platform');
window.stickybits                       = require('stickybits');

// exposed for run-time to the namespace of jQuery ($).
// -----------------------------------------------------------------------------
//const jsYaml                            = require('js-yaml');

// Core Libraries - build|required from SOURCE
// -----------------------------------------------------------------------------

// Following source objects|modules are *explicitely* forced to be
// exposed for run-time to the global namespace (window).
// -----------------------------------------------------------------------------
window.j1.adapter                       = require('./js/adapter/index.js');

window.j1.core                          = require('./js/core/index.js');
window.j1.core.back2top                 = require('./js/back2top/core.js');
window.j1.core.cookie_consent           = require('./js/cookie_consent/consent.js');
window.j1.core.navigator                = require('./js/navigator/navigator.js');
window.j1.core.webhooks                 = require('./js/webhooks/octokit/client.js');

// Passing log data over Internet|SeeMe currently NOT used
// window.j1.core.log4javascript           = require('./js/logger/client/webhook.js');

// TODO: Check if client componeent for framer module
// can be included by template.js
// window.iFrameResizer                 = require('./js/iframe_resizer/client/contentWindow.js');

window.iFrameResize                     = require('./js/iframe_resizer/resizer.js');
window.bootstrapMaterialDesign          = require('./js/bmd/js/index.js');
window.lightbox                         = require('./js/lightbox/lightbox.js');
window.twemoji                          = require('./js/twemoji/twemoji.js');
window.SmoothScroll                     = require('./js/smoothscroll-for-websites/smoothscroll.js');


// Custom modules
// -----------------------------------------------------------------------------
// window.j1promiseTest                 = require('./js/custom/test_promises.js');
// window.j1Example                     = require('./js/custom/example_module.js');

// Following source objects|modules are *implicetly* forced to be
// exposed for run-time to the global namespace (window).
// -----------------------------------------------------------------------------
const Bootstrap                         = require('./js/bootstrap/bootstrap.js');
const J1JekyllSearch                    = require('./js/jekyll_search/index.js');
const J1Tocbot                          = require('./js/tocbot/tocbot.js');
const J1ThemeSwitcher                   = require('./js/bootstrap_themeswitcher/switcher.js');

// Following source objects|modules are *implicetly* forced to be
// exposed for run-time to the namespace of jQuery ($).
// -----------------------------------------------------------------------------
const J1MouseWheel                      = require('jquery-mousewheel');
const J1Attics                          = require('./js/backstretch/backstretch.js');

const J1Datepicker                      = require('./js/bootstrap_datepicker/datepicker.js');
// const J1BsGallery                    = require('./js/bootstrap_gallery/gallery.js');
const J1TwitterEmojiPicker              = require('./js/twemoji/twemoji-picker.js');

// Additional Vanilla JS helpers
// -----------------------------------------------------------------------------
const J1AdocResultViewer                = require('./js/adoc_result_viewer/view_results.js');

// iFrameResizer Client JS
// -----------------------------------------------------------------------------
const iFrameResizeClient                = require('./js/iframe_resizer/client/contentWindow.js');

// HMR messages
// NOTE
//
// -----------------------------------------------------------------------------
if (module.hot) {
  var logtext;
  var stat;
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
  module.hot.addStatusHandler(status => {
    stat=module.hot.status();
    logtext='[INFO ] [HMR                               ] [Status: ' + stat + ']';
    console.log(logtext);
  });

}

// end entry documnet
// -----------------------------------------------------------------------------
