/*
 # -----------------------------------------------------------------------------
 #  ~200_template_js/js/asciidoctor/asciidoctor.js
 #  Provides JS functions to (dynamically) modify Asciidoctor HTML elements
 #
 #  Product/Info:
 #  http://jekyll.one
 #
 #  Copyright (C) 2021 Juergen Adams
 #
 #  J1 Template is licensed under MIT License.
 #  See: https://github.com/jekyll-one/J1 Template/blob/master/LICENSE
 # -----------------------------------------------------------------------------
 #  NOTE:
 #  cb cookie disabled. Instead, j1 user state cookie is used.
 # -----------------------------------------------------------------------------
 #  TODO:
 #  Module needs to be rewritten to use j1 native BS modals.
 # -----------------------------------------------------------------------------
*/

// -----------------------------------------------------------------------------
// ESLint shimming
// -----------------------------------------------------------------------------
/* eslint no-unused-vars: "off"                                               */
/* eslint no-undef: "off"                                                     */
/* eslint no-redeclare: "off"                                                 */
/* global window                                                              */

// TODO:

// -----------------------------------------------------------------------------
// J1 Asciidoctor registered as "asciidoctor"
// -----------------------------------------------------------------------------
/*!
 * J1 Asciidoctor
 * Copyright (C) 2021 Juergen Adams
 * Licensed under MIT License.
 */
module.exports = function asciidoctor (options) {

  return {

    // -------------------------------------------------------------------------
    // module initializer
    // -------------------------------------------------------------------------
    init: function (options) {

      var moduleOptions       = options;
      var logger              = log4javascript.getLogger('j1.asciidoctor');

      var moduleDefaults = {
        dummyOption:       false,                                               // placeholder
      };
      var options = $.extend(moduleDefaults,moduleOptions);

      logText = 'J1 Asciidoctor is being initialized';
      logger.info(logText);

      this.callouts();

    }, // end initializer

    // -------------------------------------------------------------------------
    // manage callouts (HTML)
    // -------------------------------------------------------------------------
    callouts: function( options ) {
      var colgroupList = '';

      // If the colist does not have a <colgroup> structure
      //
    	if($('.colist > table > colgroup').length == 0) {
        colgroupList += '<!-- [INFO   ] [j1.core.asciidoctor      ] [ place a colgroup dynamically ] -->' + '\n';
        colgroupList += '<colgroup> <col style="width: 5%;"> <col style="width: 95%;"> </colgroup>';
    		$(".colist > table").prepend(colgroupList);
      }

    }, // end callouts

    // -------------------------------------------------------------------------
    // manage callouts (HTML)
    // -------------------------------------------------------------------------
    conums: function( options ) {
      var dependencies_met_page_finished = setInterval(function() {
        if (j1.getState() == 'finished') {
          // If the colist does not have a <colgroup> structure
        	if($('.colist > table > colgroup').length == 0) {

        		var colgroupList = '';
            colgroupList += '<colgroup> <col style="width: 5%;"> <col style="width: 95%;"> </colgroup>';

        		$(".colist > table").prepend(colgroupList);
            clearInterval(dependencies_met_page_finished);
        	}
        }
      });
    }, // end conums

  }; // END return
}( jQuery );
