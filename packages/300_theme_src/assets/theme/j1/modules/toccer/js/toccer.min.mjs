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
 #  Copyright (C) 2016 Tim Scanlin
 #  Copyright (C) 2023-2026 Juergen Adams
 #
 #  Tocbot is licensed under the MIT License.
 #  For details, https://github.com/tscanlin/tocbot/blob/master/LICENSE 
 #  J1 Theme is licensed under MIT License.
 #  See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 # -----------------------------------------------------------------------------
*/
"use strict";
import*as tocbot from"./import/index.js";
((e,o)=>{"function"==typeof define&&define.amd?define([],o(e)):"object"!=typeof exports||exports instanceof HTMLElement?e.tocbot=o(e):module.exports=o(e)})(("undefined"==typeof global||global instanceof HTMLElement)&&window||global,e=>{const o=!!(e&&e.document&&e.document.querySelector&&e.addEventListener);if("undefined"!=typeof window||o)return e.tocbot=tocbot,tocbot});
