/*
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/modules/mmenu/js/mmenu-light.mjs
 # Mobile Menu Light implementation for J1 Theme v3.2.2
 #
 # Product/Info:
 # https://jekyll.one
 # https://github.com/FrDH/mmenu-light
 #
 # Copyright (C) 2023-2026 Juergen Adams
 # Copyright (C) 2015-2021 Fred Heusschen
 #
 # J1 Template is licensed under the MIT License.
 # See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 # Mmenu Light is licensed under the CC-BY-4.0 License.
 # See: http://creativecommons.org/licenses/by/4.0/
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

import MmToggler from './modules/match-media-toggler.js';
import MmSlidingPanelsNavigation from './modules/sliding-panels-navigation.js';
import MmOffCanvasDrawer from './modules/offcanvas-drawer.js'; 

/**
 * Class for a lightweight mobile menu.
 */
var MmenuLight = /** @class */ (function () {
    /**
     * Create a lightweight mobile menu.
     *
     * @param {HTMLElement} menu                HTML element for the menu.
     * @param {string}      [mediaQuery='all']  Media queury to match for the menu.
     */
    function MmenuLight(menu, mediaQuery) {
        if (mediaQuery === void 0) { mediaQuery = 'all'; }
        //  Store the menu node.
        this.menu = menu;
        //  Create the toggler instance.
        this.toggler = new MmToggler(mediaQuery);
    }

    /**
     * Add navigation for the menu.
     *
     * @param {object} options Options for the navigation.
     */
    MmenuLight.prototype.navigation = function (options) {
        var _this = this;
        //  Only needs to be done ones.
        if (!this.navigator) {
            options = options || {};
            var _a = options.title, title = _a === void 0 ? 'Menu' : _a, _b = options.selectedClass, selectedClass = _b === void 0 ? 'Selected' : _b, _c = options.slidingSubmenus, slidingSubmenus = _c === void 0 ? true : _c, _d = options.theme, theme = _d === void 0 ? 'light' : _d;
            this.navigator = new MmSlidingPanelsNavigation(this.menu, title, selectedClass, slidingSubmenus, theme);
            //  En-/disable
            this.toggler.add(function () { return _this.menu.classList.add(_this.navigator.prefix); }, function () { return _this.menu.classList.remove(_this.navigator.prefix); });
        }
        return this.navigator;
    };

    /**
     * Add off-canvas behavior to the menu.
     *
     * @param {object} options Options for the off-canvas drawer.
     */
    MmenuLight.prototype.offcanvas = function (options) {
        var _this = this;
        //  Only needs to be done ones.
        if (!this.drawer) {
            options = options || {};
            var _a = options.position, position = _a === void 0 ? 'left' : _a;
            this.drawer = new MmOffCanvasDrawer(null, position);
            /** Original location in the DOM for the menu. */
            var orgLocation_1 = document.createComment('original menu location');
            this.menu.after(orgLocation_1);
            //  En-/disable
            this.toggler.add(function () {
                // Move the menu to the drawer.
                _this.drawer.content.append(_this.menu);
            }, function () {
                // Close the drawer.
                _this.drawer.close();
                // Move the menu to the original position.
                orgLocation_1.after(_this.menu);
            });
        }
        return this.drawer;
    };
    return MmenuLight;
}());

// -----------------------------------------------------------------------------
//  UMD|global registration (modeled on ~/js/tocbot/toccer.mjs)
//
//  A .mjs file is evaluated as an ES module. Top-level declarations of a
//  module live in the module scope only, so "var MmenuLight" above does NOT
//  create "window.MmenuLight". The J1 adapter (~/adapter/js/mmenu.js) calls
//  "new MmenuLight (...)" as a bare (global) identifier and would fail with
//  "MmenuLight is not defined". The wrapper below publishes the class the
//  same way toccer.mjs publishes "tocbot": AMD, CommonJS or global object.
// -----------------------------------------------------------------------------
;((root, factory) => {
  if (typeof define === "function" && define.amd) {
    define([], factory(root));
  } else if (typeof exports === "object" && !(exports instanceof HTMLElement)) {
    module.exports = factory(root);
  } else {
    root.MmenuLight = factory(root);
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
      !!root.addEventListener;

    if (typeof window === "undefined" && !supports) { return; }

    // Make MmenuLight available globally.
    root.MmenuLight = MmenuLight;

    return MmenuLight;
  }
);

// -----------------------------------------------------------------------------
//  ES module default export. Required because this file is loaded as a module
//  (.mjs). Without it, "import MmenuLight from './mmenu-light.mjs'" resolves
//  to undefined. The global window.MmenuLight is set as well (see above), so
//  the J1 adapter (mmenu.js) can keep using "new MmenuLight(...)".
// -----------------------------------------------------------------------------
export default MmenuLight;