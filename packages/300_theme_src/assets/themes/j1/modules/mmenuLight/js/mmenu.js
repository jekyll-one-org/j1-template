/*
 # -----------------------------------------------------------------------------
 #  ~/assets/themes/j1/modules/mmenu_light/js/mmenu.js
 #  Mobile Menu v3.1.1 (April 2022) implementation for J1 Theme
 #
 #  Product/Info:
 #  https://jekyll.one
 #  https://github.com/FrDH/mmenu-light
 #
 #  Copyright (C) 2023, 2024 Juergen Adams
 #  Copyright (C) 2015-2021 Fred Heusschen
 #
 #  J1 Template is licensed under the MIT License.
 #  See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE.md
 #  Mmenu Light is licensed under the CC-BY-4.0 License.
 #  See: http://creativecommons.org/licenses/by/4.0/
 # -----------------------------------------------------------------------------
*/

/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/mmenu-light.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./esm/core/index.js":
/*!***************************!*\
  !*** ./esm/core/index.js ***!
  \***************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _modules_match_media_toggler_index__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../modules/match-media-toggler/index */ \"./esm/modules/match-media-toggler/index.js\");\n/* harmony import */ var _modules_sliding_panels_navigation_index__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../modules/sliding-panels-navigation/index */ \"./esm/modules/sliding-panels-navigation/index.js\");\n/* harmony import */ var _modules_offcanvas_drawer_index__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../modules/offcanvas-drawer/index */ \"./esm/modules/offcanvas-drawer/index.js\");\n\n\n\n/**\n * Class for a lightweight mobile menu.\n */\nvar MmenuLight = /** @class */ (function () {\n    /**\n     * Create a lightweight mobile menu.\n     *\n     * @param {HTMLElement} menu                HTML element for the menu.\n     * @param {string}      [mediaQuery='all']  Media queury to match for the menu.\n     */\n    function MmenuLight(menu, mediaQuery) {\n        if (mediaQuery === void 0) { mediaQuery = 'all'; }\n        //  Store the menu node.\n        this.menu = menu;\n        //  Create the toggler instance.\n        this.toggler = new _modules_match_media_toggler_index__WEBPACK_IMPORTED_MODULE_0__[\"default\"](mediaQuery);\n    }\n    /**\n     * Add navigation for the menu.\n     *\n     * @param {object} options Options for the navigation.\n     */\n    MmenuLight.prototype.navigation = function (options) {\n        var _this = this;\n        //  Only needs to be done ones.\n        if (!this.navigator) {\n            options = options || {};\n            var _a = options.title, title = _a === void 0 ? 'Menu' : _a, _b = options.selectedClass, selectedClass = _b === void 0 ? 'Selected' : _b, _c = options.slidingSubmenus, slidingSubmenus = _c === void 0 ? true : _c, _d = options.theme, theme = _d === void 0 ? 'light' : _d;\n            this.navigator = new _modules_sliding_panels_navigation_index__WEBPACK_IMPORTED_MODULE_1__[\"default\"](this.menu, title, selectedClass, slidingSubmenus, theme);\n            //  En-/disable\n            this.toggler.add(function () { return _this.menu.classList.add(_this.navigator.prefix); }, function () { return _this.menu.classList.remove(_this.navigator.prefix); });\n        }\n        return this.navigator;\n    };\n    /**\n     * Add off-canvas behavior to the menu.\n     *\n     * @param {object} options Options for the off-canvas drawer.\n     */\n    MmenuLight.prototype.offcanvas = function (options) {\n        var _this = this;\n        //  Only needs to be done ones.\n        if (!this.drawer) {\n            options = options || {};\n            var _a = options.position, position = _a === void 0 ? 'left' : _a;\n            this.drawer = new _modules_offcanvas_drawer_index__WEBPACK_IMPORTED_MODULE_2__[\"default\"](null, position);\n            /** Original location in the DOM for the menu. */\n            var orgLocation_1 = document.createComment('original menu location');\n            this.menu.after(orgLocation_1);\n            //  En-/disable\n            this.toggler.add(function () {\n                // Move the menu to the drawer.\n                _this.drawer.content.append(_this.menu);\n            }, function () {\n                // Close the drawer.\n                _this.drawer.close();\n                // Move the menu to the original position.\n                orgLocation_1.after(_this.menu);\n            });\n        }\n        return this.drawer;\n    };\n    return MmenuLight;\n}());\n/* harmony default export */ __webpack_exports__[\"default\"] = (MmenuLight);\n\n\n//# sourceURL=webpack:///./esm/core/index.js?");

/***/ }),

/***/ "./esm/modules/helpers.js":
/*!********************************!*\
  !*** ./esm/modules/helpers.js ***!
  \********************************/
/*! exports provided: r, $ */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"r\", function() { return r; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"$\", function() { return $; });\n/**\n * Convert a list to an array.\n *\n * @param \t{NodeList|HTMLCollection} list \tThe list or collection to convert into an array.\n * @return\t{array}\t\t\t\t\t\t\tThe array.\n */\nvar r = function (list) {\n    return Array.prototype.slice.call(list);\n};\n/**\n * Find elements in the given context.\n *\n * @param \t{string}\t\tselector\t\t\tThe query selector to search for.\n * @param \t{HTMLElement}\t[context=document]\tThe context to search in.\n * @return\t{HTMLElement[]}\t\t\t\t\t\tThe found list of elements.\n */\nvar $ = function (selector, context) {\n    return r((context || document).querySelectorAll(selector));\n};\n\n\n//# sourceURL=webpack:///./esm/modules/helpers.js?");

/***/ }),

/***/ "./esm/modules/match-media-toggler/index.js":
/*!**************************************************!*\
  !*** ./esm/modules/match-media-toggler/index.js ***!
  \**************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/**\n * Class for a match media toggler.\n */\nvar MmToggler = /** @class */ (function () {\n    /**\n     * Create the match media.\n     *\n     * @param {string} mediaquery Media query to use.\n     */\n    function MmToggler(mediaquery) {\n        var _this = this;\n        this.listener = function (evnt) {\n            (evnt.matches ? _this.matchFns : _this.unmatchFns).forEach(function (listener) {\n                listener();\n            });\n        };\n        this.toggler = window.matchMedia(mediaquery);\n        this.toggler.addListener(this.listener);\n        this.matchFns = [];\n        this.unmatchFns = [];\n    }\n    /**\n     * Add a function to the list,\n     * also fires the added function.\n     *\n     * @param {Function} match      Function to fire when the media query matches.\n     * @param {Function} unmatch    Function to fire when the media query does not match.\n     */\n    MmToggler.prototype.add = function (match, unmatch) {\n        this.matchFns.push(match);\n        this.unmatchFns.push(unmatch);\n        (this.toggler.matches ? match : unmatch)();\n    };\n    return MmToggler;\n}());\n/* harmony default export */ __webpack_exports__[\"default\"] = (MmToggler);\n\n\n//# sourceURL=webpack:///./esm/modules/match-media-toggler/index.js?");

/***/ }),

/***/ "./esm/modules/offcanvas-drawer/index.js":
/*!***********************************************!*\
  !*** ./esm/modules/offcanvas-drawer/index.js ***!
  \***********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\nvar prefix = 'mm-ocd';\n/**\n * Class for off-canvas behavior.\n */\nvar MmOffCanvasDrawer = /** @class */ (function () {\n    /**\n     * Class for off-canvas drawer.\n     *\n     * @param {HTMLElement} [node]          The element to put in the drawer.\n     * @param {String}      [position=left] The position of the drawer, can be \"left\" or \"right\".\n     */\n    function MmOffCanvasDrawer(node, position) {\n        var _this = this;\n        if (node === void 0) { node = null; }\n        //  Create the wrapper.\n        this.wrapper = document.createElement('div');\n        this.wrapper.classList.add(\"\" + prefix);\n        this.wrapper.classList.add(prefix + \"--\" + position);\n        //  Create the drawer.\n        this.content = document.createElement('div');\n        this.content.classList.add(prefix + \"__content\");\n        this.wrapper.append(this.content);\n        //  Create the backdrop.\n        this.backdrop = document.createElement('div');\n        this.backdrop.classList.add(prefix + \"__backdrop\");\n        this.wrapper.append(this.backdrop);\n        //  Add the nodes to the <body>.\n        document.body.append(this.wrapper);\n        if (node) {\n            this.content.append(node);\n        }\n        //  Click the backdrop.\n        var close = function (evnt) {\n            _this.close();\n            evnt.stopImmediatePropagation();\n        };\n        this.backdrop.addEventListener('touchstart', close, { passive: true });\n        this.backdrop.addEventListener('mousedown', close, { passive: true });\n    }\n    Object.defineProperty(MmOffCanvasDrawer.prototype, \"prefix\", {\n        /** Prefix for the class. */\n        get: function () {\n            return prefix;\n        },\n        enumerable: false,\n        configurable: true\n    });\n    /**\n     * Open the drawer.\n     */\n    MmOffCanvasDrawer.prototype.open = function () {\n        this.wrapper.classList.add(prefix + \"--open\");\n        document.body.classList.add(prefix + \"-opened\");\n    };\n    /**\n     * Close the drawer.\n     */\n    MmOffCanvasDrawer.prototype.close = function () {\n        this.wrapper.classList.remove(prefix + \"--open\");\n        document.body.classList.remove(prefix + \"-opened\");\n    };\n    return MmOffCanvasDrawer;\n}());\n/* harmony default export */ __webpack_exports__[\"default\"] = (MmOffCanvasDrawer);\n\n\n//# sourceURL=webpack:///./esm/modules/offcanvas-drawer/index.js?");

/***/ }),

/***/ "./esm/modules/sliding-panels-navigation/index.js":
/*!********************************************************!*\
  !*** ./esm/modules/sliding-panels-navigation/index.js ***!
  \********************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _helpers__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../helpers */ \"./esm/modules/helpers.js\");\n\nvar prefix = 'mm-spn';\n/**\n * Class for navigating in a mobile menu.\n */\nvar MmSlidingPanelsNavigation = /** @class */ (function () {\n    /**\n     * Class for navigating in a mobile menu.\n     *\n     * @param {HTMLElement} node            HTMLElement for the menu.\n     * @param {string}      title           The title for the menu.\n     * @param {string}      selectedClass   The class for selected listitems.\n     * @param {boolean}     slidingSubmenus Whether or not to use sliding submenus.\n     * @param {string}      theme           The color scheme for the menu.\n     */\n    function MmSlidingPanelsNavigation(node, title, selectedClass, slidingSubmenus, theme) {\n        this.node = node;\n        this.title = title;\n        this.slidingSubmenus = slidingSubmenus;\n        this.selectedClass = selectedClass;\n        //  Add classname.\n        this.node.classList.add(prefix);\n        this.node.classList.add(prefix + \"--\" + theme);\n        this.node.classList.add(prefix + \"--\" + (this.slidingSubmenus ? 'navbar' : 'vertical'));\n        this._setSelectedl();\n        this._initAnchors();\n    }\n    Object.defineProperty(MmSlidingPanelsNavigation.prototype, \"prefix\", {\n        /** Prefix for the class. */\n        get: function () {\n            return prefix;\n        },\n        enumerable: false,\n        configurable: true\n    });\n    /**\n     * Open the given panel.\n     *\n     * @param {HTMLElement} panel Panel to open.\n     */\n    MmSlidingPanelsNavigation.prototype.openPanel = function (panel) {\n        /** Parent LI for the panel.  */\n        var listitem = panel.parentElement;\n        //  Sliding submenus\n        if (this.slidingSubmenus) {\n            /** Title above the panel to open. */\n            var title_1 = panel.dataset.mmSpnTitle;\n            //  Opening the main level UL.\n            if (listitem === this.node) {\n                this.node.classList.add(prefix + \"--main\");\n            }\n            //  Opening a sub level UL.\n            else {\n                this.node.classList.remove(prefix + \"--main\");\n                //  Find title from parent LI.\n                if (!title_1) {\n                    Object(_helpers__WEBPACK_IMPORTED_MODULE_0__[\"r\"])(listitem.children).forEach(function (child) {\n                        if (child.matches('a, span')) {\n                            title_1 = child.textContent;\n                        }\n                    });\n                }\n            }\n            //  Use the default title.\n            if (!title_1) {\n                title_1 = this.title;\n            }\n            //  Set the title.\n            this.node.dataset.mmSpnTitle = title_1;\n            //  Unset all panels from being opened and parent.\n            Object(_helpers__WEBPACK_IMPORTED_MODULE_0__[\"$\"])(\".\" + prefix + \"--open\", this.node).forEach(function (open) {\n                open.classList.remove(prefix + \"--open\");\n                open.classList.remove(prefix + \"--parent\");\n            });\n            //  Set the current panel as being opened.\n            panel.classList.add(prefix + \"--open\");\n            panel.classList.remove(prefix + \"--parent\");\n            //  Set all parent panels as being parent.\n            var parent_1 = panel.parentElement.closest('ul');\n            while (parent_1) {\n                parent_1.classList.add(prefix + \"--open\");\n                parent_1.classList.add(prefix + \"--parent\");\n                parent_1 = parent_1.parentElement.closest('ul');\n            }\n        }\n        //  Vertical submenus\n        else {\n            /** Whether or not the panel is currently opened. */\n            var isOpened = panel.matches(\".\" + prefix + \"--open\");\n            //  Unset all panels from being opened and parent.\n            Object(_helpers__WEBPACK_IMPORTED_MODULE_0__[\"$\"])(\".\" + prefix + \"--open\", this.node).forEach(function (open) {\n                open.classList.remove(prefix + \"--open\");\n            });\n            //  Toggle the current panel.\n            panel.classList[isOpened ? 'remove' : 'add'](prefix + \"--open\");\n            //  Set all parent panels as being opened.\n            var parent_2 = panel.parentElement.closest('ul');\n            while (parent_2) {\n                parent_2.classList.add(prefix + \"--open\");\n                parent_2 = parent_2.parentElement.closest('ul');\n            }\n        }\n    };\n    /**\n     * Initiate the selected listitem / open the current panel.\n     */\n    MmSlidingPanelsNavigation.prototype._setSelectedl = function () {\n        /** All selected LIs. */\n        var listitems = Object(_helpers__WEBPACK_IMPORTED_MODULE_0__[\"$\"])('.' + this.selectedClass, this.node);\n        /** The last selected LI. */\n        var listitem = listitems[listitems.length - 1];\n        /** The opened UL. */\n        var panel = null;\n        if (listitem) {\n            panel = listitem.closest('ul');\n        }\n        if (!panel) {\n            panel = this.node.querySelector('ul');\n        }\n        this.openPanel(panel);\n    };\n    /**\n     * Initialize the click event handlers.\n     */\n    MmSlidingPanelsNavigation.prototype._initAnchors = function () {\n        var _this = this;\n        /**\n         * Clicking an A in the menu: prevent bubbling up to the LI.\n         *\n         * @param   {HTMLElement}    target The clicked element.\n         * @return  {boolean}       handled Whether or not the event was handled.\n         */\n        var clickAnchor = function (target) {\n            if (target.matches('a')) {\n                return true;\n            }\n            return false;\n        };\n        /**\n         * Click a LI or SPAN in the menu: open its submenu (if present).\n         *\n         * @param   {HTMLElement}    target The clicked element.\n         * @return  {boolean}               Whether or not the event was handled.\n         */\n        var openSubmenu = function (target) {\n            /** Parent listitem for the submenu.  */\n            var listitem;\n            //  Find the parent listitem.\n            if (target.closest('span')) {\n                listitem = target.parentElement;\n            }\n            else if (target.closest('li')) {\n                listitem = target;\n            }\n            else {\n                listitem = false;\n            }\n            if (listitem) {\n                Object(_helpers__WEBPACK_IMPORTED_MODULE_0__[\"r\"])(listitem.children).forEach(function (panel) {\n                    if (panel.matches('ul')) {\n                        _this.openPanel(panel);\n                    }\n                });\n                return true;\n            }\n            return false;\n        };\n        /**\n         * Click the menu (the navbar): close the last opened submenu.\n         *\n         * @param   {HTMLElement}    target The clicked element.\n         * @return  {boolean}               Whether or not the event was handled.\n         */\n        var closeSubmenu = function (target) {\n            /** The opened ULs. */\n            var panels = Object(_helpers__WEBPACK_IMPORTED_MODULE_0__[\"$\"])(\".\" + prefix + \"--open\", target);\n            /** The last opened UL. */\n            var panel = panels[panels.length - 1];\n            if (panel) {\n                /** The second to last opened UL. */\n                var parent_3 = panel.parentElement.closest('ul');\n                if (parent_3) {\n                    _this.openPanel(parent_3);\n                    return true;\n                }\n            }\n            return false;\n        };\n        this.node.addEventListener('click', function (evnt) {\n            var target = evnt.target;\n            var handled = false;\n            handled = handled || clickAnchor(target);\n            handled = handled || openSubmenu(target);\n            handled = handled || closeSubmenu(target);\n            if (handled) {\n                evnt.stopImmediatePropagation();\n            }\n        });\n    };\n    return MmSlidingPanelsNavigation;\n}());\n/* harmony default export */ __webpack_exports__[\"default\"] = (MmSlidingPanelsNavigation);\n\n\n//# sourceURL=webpack:///./esm/modules/sliding-panels-navigation/index.js?");

/***/ }),

/***/ "./src/mmenu-light.js":
/*!****************************!*\
  !*** ./src/mmenu-light.js ***!
  \****************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _esm_core_index__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../esm/core/index */ \"./esm/core/index.js\");\n/*!\n * Mmenu Light\n * mmenujs.com/mmenu-light\n *\n * Copyright (c) Fred Heusschen\n * www.frebsite.nl\n *\n * License: CC-BY-4.0\n * http://creativecommons.org/licenses/by/4.0/\n */\n\n//\tThe module\n\n\n//  Export module\n/* harmony default export */ __webpack_exports__[\"default\"] = (_esm_core_index__WEBPACK_IMPORTED_MODULE_0__[\"default\"]);\n\n//\tGlobal namespace\nwindow.MmenuLight = _esm_core_index__WEBPACK_IMPORTED_MODULE_0__[\"default\"];\n\n\n//# sourceURL=webpack:///./src/mmenu-light.js?");

/***/ })

/******/ });
