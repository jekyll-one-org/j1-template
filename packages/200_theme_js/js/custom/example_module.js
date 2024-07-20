/*
 # -----------------------------------------------------------------------------
 # ~/js/test_module/promise_test.js
 # Provides Javascript functions for Testing Promises
 #
 # Product/Info:
 # http://jekyll.one
 #
 # Copyright (C) 2023, 2024 Juergen Adams
 #
 # J1 Theme is licensed under MIT License.
 # See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 # -----------------------------------------------------------------------------
 # promise_test@2019-06-14
 # -----------------------------------------------------------------------------
*/
"use strict";

// -----------------------------------------------------------------------------
// ESLint shimming
// -----------------------------------------------------------------------------
/* eslint indent: "off"                                                       */
/* eslint no-unused-vars: "off"                                               */
/* eslint no-undef: "off"                                                     */
/* eslint no-redeclare: "off"                                                 */
/* eslint indent: "off"                                                       */
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// WebHook core registered as "webHook"
// -----------------------------------------------------------------------------
module.exports = function j1example ( options ) {

  //const WebhooksApi = require('@octokit/webhooks');

  // Default settings
  var settings = $.extend({
    foo: 'foo_option',
    bar: 'bar_option'
  }, options );

  return {

    // -------------------------------------------------------------------------
    // Initialize j1webhook
    // -------------------------------------------------------------------------
    init: function ( options ) {

      var logger;
      var logText;

      // -----------------------------------------------------------------------
      // Helper functions
      // -----------------------------------------------------------------------

      // -----------------------------------------------------------------------
      // Main
      // -----------------------------------------------------------------------
      logger = log4javascript.getLogger('j1.example');

      logText = 'Example module successfully initialized'
      logger.info(logText);

    } // END init

  }; // END return
}( jQuery );
