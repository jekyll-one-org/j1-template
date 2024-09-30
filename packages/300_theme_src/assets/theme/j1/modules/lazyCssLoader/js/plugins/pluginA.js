/*
 * jQuery & Zepto Lazy - AJAX Plugin - v1.4
 * http://jquery.eisbehr.de/lazy/
 *
 * Copyright 2012 - 2018, Daniel 'Eisbehr' Kern
 *
 * Dual licensed under the MIT and GPL-2.0 licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl-2.0.html
*/
"use strict";

// my-plugin.js
class PluginInterface {
  constructor() {}

  // Diese Methode muss jedes Plugin implementieren
  register(app) {
    throw new Error("register method must be implemented");
  }
}

var j1LazyLoader = {};

var PluginA = {
  name: 'PluginA',
};

// j1LazyLoader.PluginA.init = function() {
PluginA.init = function() {
  return {
    name: 'PluginA',
    run() {
      console.log('PluginA wird ausgeführt!');
    }
  };
}(window.j1LazyLoader.PluginA);

// export function init() {
//   return {
//       name: 'PluginA',
//       run() {
//         console.log('PluginA wird ausgeführt!');
//       }
//   };
// }
