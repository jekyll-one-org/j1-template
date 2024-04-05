/*
 # -----------------------------------------------------------------------------
 #  ~/js/adapter/adapter.js
 #  Provides an empty object for later loaded adapter objects
 #
 #  Product/Info:
 #  https://jekyll.one
 #
 #  Copyright (C) 2023, 2024 Juergen Adams
 #
 #  J1 Theme is licensed under MIT License.
 #  See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 # -----------------------------------------------------------------------------
*/

// -----------------------------------------------------------------------------
// ESLint shimming
// -----------------------------------------------------------------------------
/* eslint indent: "off"                                                       */
/* eslint no-unused-vars: "off"                                               */
/* eslint no-undef: "off"                                                     */
// -----------------------------------------------------------------------------

'use strict';
module.exports = (function ( j1, window ) {
  return {

    // -------------------------------------------------------------------------
    // _init_
    // Global initializer for the adapter object
    // -------------------------------------------------------------------------
    _init_: function () {
      return;
    }  // END _init_

  }; // END return

})( j1, window );
