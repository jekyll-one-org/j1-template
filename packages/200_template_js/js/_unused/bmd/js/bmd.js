//  -----------------------------------------------------------------------------
//   ~/src/js/bootstrap_material_design/js/bmd.js
//
//   This is the main entry point.
//   You can import other modules here, including external packages.
//   When bundling using rollup you can mark those modules as external and
//   have them excluded or, if they have a jsnext:main entry in their
//   package.json (like this package does), let rollup bundle them into your
//   dist file.
//
//   At your application entry point.  This is necessary for browsers that do
//   not  yet support some ES2015 runtime necessities such as Symbol.
//   We do this in `index-iife.js` for our iife rollup bundle.
//
//   Product/Info:
//   https://github.com/FezVrasta/bootstrap-material-design
//
//   Copyright (C) 2020 Federico Zivolo and Contributors
//
//   Bootstrap Material Design is licensed under MIT License.
//   See: https://github.com/FezVrasta/bootstrap-material-design/blob/master/LICENSE.md
//
//  -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// ESLint shimming
// -----------------------------------------------------------------------------
/* eslint no-unused-vars: "off"                                               */
/* eslint quotes: "off"                                                       */
/* eslint no-undef: "off"                                                     */
/* eslint indent: "off"                                                       */
/* eslint semi: "off"                                                         */
/* global jQuery                                                              */
/* global $                                                                   */
// -----------------------------------------------------------------------------

// Bootstrap components
// NOTE: loaded from LATEST BS version
//
// import "../bootstrap/js/alert";
// import "../bootstrap/js/button";
// //import "../bootstrap/js/carousel";
// import "../bootstrap/js/collapse";
// //import "../bootstrap/js/dropdown";
// import "../bootstrap/js/modal";
// import "../bootstrap/js/popover";
// import "../bootstrap/js/scrollspy";
// import "../bootstrap/js/tab";
// import "../bootstrap/js/tooltip";
// import "../bootstrap/js/util";

// invalidComponentMatches is currently disabled due to
// https://github.com/rollup/rollup/issues/428#issuecomment-170066452
import "./checkbox";
import "./checkboxInline";
import "./collapseInline";
import "./file";
import "./radio";
import "./radioInline";
import "./select";
import "./switch";
import "./text";
import "./textarea";
import "./dropdown";
import "./drawer";
import "./ripples";
import "./autofill";

import "./bootstrapMaterialDesign";
