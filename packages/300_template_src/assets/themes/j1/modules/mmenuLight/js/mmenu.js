/*
 # -----------------------------------------------------------------------------
 #  ~/assets/themes/j1/modules/mmenu_light/js/mmenu.js
 #  Mobile Menu v3.0.5 implementation for J1 Template
 #
 #  Product/Info:
 #  https://jekyll.one
 #  https://github.com/FrDH/mmenu-light
 #
 #  Copyright (C) 2021 Juergen Adams
 #  Copyright (C) 2015-2021 Fred Heusschen
 #
 #  J1 Template is licensed under the MIT License.
 #  See: https://github.com/jekyll-one-org/J1 Template/blob/master/LICENSE
 #  Mmenu Light is licensed under the CC-BY-4.0 License.
 #  See: http://creativecommons.org/licenses/by/4.0/
 # -----------------------------------------------------------------------------
*/

/*!
 * Mmenu Light
 * mmenujs.com/mmenu-light v3.0.8
 *
 * Copyright (c) Fred Heusschen
 * www.frebsite.nl
 *
 * License: CC-BY-4.0
 * http://creativecommons.org/licenses/by/4.0/
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
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);

// CONCATENATED MODULE: ./esm/modules/match-media-toggler/index.js
/**
 * Class for a match media toggler.
 */
var MmToggler = /** @class */ (function () {
    /**
     * Create the match media.
     *
     * @param {string} mediaquery Media query to use.
     */
    function MmToggler(mediaquery) {
        var _this = this;
        this.listener = function (evnt) {
            (evnt.matches ? _this.matchFns : _this.unmatchFns).forEach(function (listener) {
                listener();
            });
        };
        this.toggler = window.matchMedia(mediaquery);
        this.toggler.addListener(this.listener);
        this.matchFns = [];
        this.unmatchFns = [];
    }
    /**
     * Add a function to the list,
     * also fires the added function.
     *
     * @param {Function} match      Function to fire when the media query matches.
     * @param {Function} unmatch    Function to fire when the media query does not match.
     */
    MmToggler.prototype.add = function (match, unmatch) {
        this.matchFns.push(match);
        this.unmatchFns.push(unmatch);
        (this.toggler.matches ? match : unmatch)();
    };
    return MmToggler;
}());
/* harmony default export */ var match_media_toggler = (MmToggler);

// CONCATENATED MODULE: ./esm/modules/helpers.js
/**
 * Convert a list to an array.
 *
 * @param 	{NodeList|HTMLCollection} list 	The list or collection to convert into an array.
 * @return	{array}							The array.
 */
var r = function (list) {
    return Array.prototype.slice.call(list);
};
/**
 * Find elements in the given context.
 *
 * @param 	{string}		selector			The query selector to search for.
 * @param 	{HTMLElement}	[context=document]	The context to search in.
 * @return	{HTMLElement[]}						The found list of elements.
 */
var $ = function (selector, context) {
    return r((context || document).querySelectorAll(selector));
};

// CONCATENATED MODULE: ./esm/modules/support.js
/** Whether or not touch gestures are supported by the browser. */
var touch = 'ontouchstart' in window ||
    (navigator.msMaxTouchPoints ? true : false) ||
    false;
/** Whether or not its IE11 :/ */
var IE11 = navigator.userAgent.indexOf('MSIE') > -1 ||
    navigator.appVersion.indexOf('Trident/') > -1;

// CONCATENATED MODULE: ./esm/modules/sliding-panels-navigation/index.js


var prefix = 'mm-spn';
/**
 * Class for navigating in a mobile menu.
 */
var sliding_panels_navigation_MmSlidingPanelsNavigation = /** @class */ (function () {
    /**
     * Class for navigating in a mobile menu.
     *
     * @param {HTMLElement} node            HTMLElement for the menu.
     * @param {string}      title           The title for the menu.
     * @param {string}      selectedClass   The class for selected listitems.
     * @param {boolean}     slidingSubmenus Whether or not to use sliding submenus.
     * @param {string}      theme           The color scheme for the menu.
     */
    function MmSlidingPanelsNavigation(node, title, selectedClass, slidingSubmenus, theme) {
        this.node = node;
        this.title = title;
        this.slidingSubmenus = slidingSubmenus;
        this.selectedClass = selectedClass;
        //  Add classname.
        this.node.classList.add(prefix);
        //  Sliding submenus not supported in IE11.
        if (IE11) {
            this.slidingSubmenus = false;
        }
        this.node.classList.add(prefix + "--" + theme);
        this.node.classList.add(prefix + "--" + (this.slidingSubmenus ? 'navbar' : 'vertical'));
        this._setSelectedl();
        this._initAnchors();
    }
    Object.defineProperty(MmSlidingPanelsNavigation.prototype, "prefix", {
        /** Prefix for the class. */
        get: function () {
            return prefix;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Open the given panel.
     *
     * @param {HTMLElement} panel Panel to open.
     */
    MmSlidingPanelsNavigation.prototype.openPanel = function (panel) {
        /** Parent LI for the panel.  */
        var listitem = panel.parentElement;
        //  Sliding submenus
        if (this.slidingSubmenus) {
            /** Title above the panel to open. */
            var title_1 = panel.dataset.mmSpnTitle;
            //  Opening the main level UL.
            if (listitem === this.node) {
                this.node.classList.add(prefix + "--main");
            }
            //  Opening a sub level UL.
            else {
                this.node.classList.remove(prefix + "--main");
                //  Find title from parent LI.
                if (!title_1) {
                    r(listitem.children).forEach(function (child) {
                        if (child.matches('a, span')) {
                            title_1 = child.textContent;
                        }
                    });
                }
            }
            //  Use the default title.
            if (!title_1) {
                title_1 = this.title;
            }
            //  Set the title.
            this.node.dataset.mmSpnTitle = title_1;
            //  Unset all panels from being opened and parent.
            $("." + prefix + "--open", this.node).forEach(function (open) {
                open.classList.remove(prefix + "--open");
                open.classList.remove(prefix + "--parent");
            });
            //  Set the current panel as being opened.
            panel.classList.add(prefix + "--open");
            panel.classList.remove(prefix + "--parent");
            //  Set all parent panels as being parent.
            var parent_1 = panel.parentElement.closest('ul');
            while (parent_1) {
                parent_1.classList.add(prefix + "--open");
                parent_1.classList.add(prefix + "--parent");
                parent_1 = parent_1.parentElement.closest('ul');
            }
        }
        //  Vertical submenus
        else {
            /** Whether or not the panel is currently opened. */
            var isOpened = panel.matches("." + prefix + "--open");
            //  Unset all panels from being opened and parent.
            $("." + prefix + "--open", this.node).forEach(function (open) {
                open.classList.remove(prefix + "--open");
            });
            //  Toggle the current panel.
            panel.classList[isOpened ? 'remove' : 'add'](prefix + "--open");
            //  Set all parent panels as being opened.
            var parent_2 = panel.parentElement.closest('ul');
            while (parent_2) {
                parent_2.classList.add(prefix + "--open");
                parent_2 = parent_2.parentElement.closest('ul');
            }
        }
    };
    /**
     * Initiate the selected listitem / open the current panel.
     */
    MmSlidingPanelsNavigation.prototype._setSelectedl = function () {
        /** All selected LIs. */
        var listitems = $('.' + this.selectedClass, this.node);
        /** The last selected LI. */
        var listitem = listitems[listitems.length - 1];
        /** The opened UL. */
        var panel = null;
        if (listitem) {
            panel = listitem.closest('ul');
        }
        if (!panel) {
            panel = this.node.querySelector('ul');
        }
        this.openPanel(panel);
    };
    /**
     * Initialize the click event handlers.
     */
    MmSlidingPanelsNavigation.prototype._initAnchors = function () {
        var _this = this;
        /**
         * Clicking an A in the menu: prevent bubbling up to the LI.
         *
         * @param   {HTMLElement}    target The clicked element.
         * @return  {boolean}       handled Whether or not the event was handled.
         */
        var clickAnchor = function (target) {
            if (target.matches('a')) {
                return true;
            }
            return false;
        };
        /**
         * Click a LI or SPAN in the menu: open its submenu (if present).
         *
         * @param   {HTMLElement}    target The clicked element.
         * @return  {boolean}               Whether or not the event was handled.
         */
        var openSubmenu = function (target) {
            /** Parent listitem for the submenu.  */
            var listitem;
            //  Find the parent listitem.
            if (target.closest('span')) {
                listitem = target.parentElement;
            }
            else if (target.closest('li')) {
                listitem = target;
            }
            else {
                listitem = false;
            }
            if (listitem) {
                r(listitem.children).forEach(function (panel) {
                    if (panel.matches('ul')) {
                        _this.openPanel(panel);
                    }
                });
                return true;
            }
            return false;
        };
        /**
         * Click the menu (the navbar): close the last opened submenu.
         *
         * @param   {HTMLElement}    target The clicked element.
         * @return  {boolean}               Whether or not the event was handled.
         */
        var closeSubmenu = function (target) {
            /** The opened ULs. */
            var panels = $("." + prefix + "--open", target);
            /** The last opened UL. */
            var panel = panels[panels.length - 1];
            if (panel) {
                /** The second to last opened UL. */
                var parent_3 = panel.parentElement.closest('ul');
                if (parent_3) {
                    _this.openPanel(parent_3);
                    return true;
                }
            }
            return false;
        };
        this.node.addEventListener('click', function (evnt) {
            var target = evnt.target;
            var handled = false;
            handled = handled || clickAnchor(target);
            handled = handled || openSubmenu(target);
            handled = handled || closeSubmenu(target);
            if (handled) {
                evnt.stopImmediatePropagation();
            }
        });
    };
    return MmSlidingPanelsNavigation;
}());
/* harmony default export */ var sliding_panels_navigation = (sliding_panels_navigation_MmSlidingPanelsNavigation);

// CONCATENATED MODULE: ./esm/modules/offcanvas-drawer/index.js
var offcanvas_drawer_prefix = 'mm-ocd';
/**
 * Class for off-canvas behavior.
 */
var MmOffCanvasDrawer = /** @class */ (function () {
    /**
     * Class for off-canvas drawer.
     *
     * @param {HTMLElement} [node]          The element to put in the drawer.
     * @param {String}      [position=left] The position of the drawer, can be "left" or "right".
     * @param {Boolean}     toggle_mode     Whether or not to use toggle mode.
     */
    function MmOffCanvasDrawer(node, position, toggle_mode) {
        var _this = this;
        if (node === void 0) { node = null; }
        //  Create the wrapper.
        this.wrapper = document.createElement('div');
        this.wrapper.classList.add("" + offcanvas_drawer_prefix);
        this.wrapper.classList.add(offcanvas_drawer_prefix + "--" + position);
        //  Create the drawer.
        this.content = document.createElement('div');
        this.content.classList.add(offcanvas_drawer_prefix + "__content");
        this.wrapper.append(this.content);
        //  Create the backdrop.
        this.backdrop = document.createElement('div');
        this.backdrop.classList.add(offcanvas_drawer_prefix + "__backdrop");
        this.wrapper.append(this.backdrop);
        //  Add the nodes to the <body>.
        document.body.append(this.wrapper);
        if (node) {
            this.content.append(node);
        }
        //  Click the backdrop.
        if (!toggle_mode) {
            var close_1 = function (evnt) {
                _this.close();
                evnt.stopImmediatePropagation();
            };
            this.backdrop.addEventListener('touchstart', close_1, { passive: true });
            this.backdrop.addEventListener('mousedown', close_1, { passive: true });
        }
    }
    Object.defineProperty(MmOffCanvasDrawer.prototype, "prefix", {
        /** Prefix for the class. */
        get: function () {
            return offcanvas_drawer_prefix;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Open the drawer.
     */
    MmOffCanvasDrawer.prototype.open = function () {
        this.wrapper.classList.add(offcanvas_drawer_prefix + "--open");
        document.body.classList.add(offcanvas_drawer_prefix + "-opened");
    };
    /**
     * Close the drawer.
     */
    MmOffCanvasDrawer.prototype.close = function () {
        this.wrapper.classList.remove(offcanvas_drawer_prefix + "--open");
        document.body.classList.remove(offcanvas_drawer_prefix + "-opened");
    };
    return MmOffCanvasDrawer;
}());
/* harmony default export */ var offcanvas_drawer = (MmOffCanvasDrawer);

// CONCATENATED MODULE: ./esm/core/index.js



/**
 * Class for a lightweight mobile menu.
 */
var core_MmenuLight = /** @class */ (function () {
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
        this.toggler = new match_media_toggler(mediaQuery);
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
            this.navigator = new sliding_panels_navigation(this.menu, title, selectedClass, slidingSubmenus, theme);
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
            var _a = options.position, position = _a === void 0 ? 'left' : _a, _b = options.toggle_mode, toggle_mode = _b === void 0 ? false : _b;
            this.drawer = new offcanvas_drawer(null, position, toggle_mode);
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
/* harmony default export */ var core = (core_MmenuLight);

// CONCATENATED MODULE: ./src/mmenu-light.js
/*!
 * Mmenu Light
 * mmenujs.com/mmenu-light
 *
 * Copyright (c) Fred Heusschen
 * www.frebsite.nl
 *
 * License: CC-BY-4.0
 * http://creativecommons.org/licenses/by/4.0/
 */

//	The module


//  Export module
/* harmony default export */ var mmenu_light = __webpack_exports__["default"] = (core);

//	Global namespace
window.MmenuLight = core;


/***/ })
/******/ ]);
