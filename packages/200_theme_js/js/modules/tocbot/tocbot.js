/*
 # -----------------------------------------------------------------------------
 #  ~/js/tocbot/tocbot.js
 #  Tocbot v4.36.4
 #
 #  Product/Info:
 #  https://jekyll.one
 #  https://tscanlin.github.io/tocbot
 #  https://github.com/tscanlin/tocbot
 #
 #  Copyright (C) 2023-2026 Juergen Adams
 #  Copyright (C) 2016 Tim Scanlin
 #
 #  J1 Theme is licensed under MIT License.
 #  See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 #  Tocbot is licensed under the MIT License.
 #  For details, https://github.com/tscanlin/tocbot/blob/master/LICENSE
 # -----------------------------------------------------------------------------
 #  rules:
 #    "eslint:tocbot": "eslint --ignore-path .eslintignore src/tocbot/js"
 # -----------------------------------------------------------------------------
*/
"use strict";

// -----------------------------------------------------------------------------
// ESLint shimming
// -----------------------------------------------------------------------------
/* eslint no-extra-semi: "off"                                                */
/* eslint no-undef: "off"                                                     */
/* eslint no-redeclare: "off"                                                 */
/* eslint no-unused-vars: "off"                                               */
/* eslint indent: "off"                                                       */
/* eslint quotes: "off"                                                       */
/* eslint no-prototype-builtins: "off"                                        */
/* global window                                                              */

/**
 * Tocbot
 * Tocbot creates a toble of contents based on HTML headings on a page,
 * this allows users to easily jump to different sections of the document.
 * Tocbot was inspired by tocify (http://gregfranko.com/jquery.tocify.js/).
 * The main differences are that it works natively without any need for jquery or jquery UI).
 *
 * @author Tim Scanlin
 */

/* globals define */

import * as tocbot from "./index-esm.js"
;((root, factory) => {
  if (typeof define === "function" && define.amd) {
    define([], factory(root))
  } else if (typeof exports === "object" && !(exports instanceof HTMLElement)) {
    module.exports = factory(root)
  } else {
    root.tocbot = factory(root)
  }
})(
  typeof global !== "undefined" && !(global instanceof HTMLElement)
    ? global
    : window || global,
  (root) => {
    // Just return if its not a browser.
    const supports =
      !!root &&
      !!root.document &&
      !!root.document.querySelector &&
      !!root.addEventListener // Feature test
    if (typeof window === "undefined" && !supports) {
      return
    }

    // Make tocbot available globally.
    root.tocbot = tocbot

    return tocbot
  },
)
