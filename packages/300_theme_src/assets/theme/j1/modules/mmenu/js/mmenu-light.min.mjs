/*
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/modules/mmenu/js/mmenu-light.min.mjs
 # Mobile Menu implementation for J1 Theme v3.2.2
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

import MmToggler from"./modules/match-media-toggler.min.js";
import MmSlidingPanelsNavigation from"./modules/sliding-panels-navigation.min.js";
import MmOffCanvasDrawer from"./modules/offcanvas-drawer.min.js";

var MmenuLight=function(){function e(e,t){void 0===t&&(t="all"),this.menu=e,this.toggler=new MmToggler(t)}return e.prototype.navigation=function(e){var t=this;if(!this.navigator){var n=(e=e||{}).title,i=void 0===n?"Menu":n,o=e.selectedClass,r=void 0===o?"Selected":o,a=e.slidingSubmenus,s=void 0===a||a,d=e.theme,u=void 0===d?"light":d;this.navigator=new MmSlidingPanelsNavigation(this.menu,i,r,s,u),this.toggler.add(function(){return t.menu.classList.add(t.navigator.prefix)},function(){return t.menu.classList.remove(t.navigator.prefix)})}return this.navigator},e.prototype.offcanvas=function(e){var t=this;if(!this.drawer){var n=(e=e||{}).position,i=void 0===n?"left":n;this.drawer=new MmOffCanvasDrawer(null,i);var o=document.createComment("original menu location");this.menu.after(o),this.toggler.add(function(){t.drawer.content.append(t.menu)},function(){t.drawer.close(),o.after(t.menu)})}return this.drawer},e}();((e,t)=>{"function"==typeof define&&define.amd?define([],t(e)):"object"!=typeof exports||exports instanceof HTMLElement?e.MmenuLight=t(e):module.exports=t(e)})(("undefined"==typeof global||global instanceof HTMLElement)&&window||global,e=>{const t=!!(e&&e.document&&e.document.querySelector&&e.addEventListener);if("undefined"!=typeof window||t)return e.MmenuLight=MmenuLight,MmenuLight});export default MmenuLight;
