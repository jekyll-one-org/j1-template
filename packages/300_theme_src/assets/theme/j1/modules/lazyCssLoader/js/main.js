/*
 # -----------------------------------------------------------------------------
 # ~/theme_uno/modules/iconPicker/js/universal-icon-picker.js
 # j1LazyLoader v.1.1.0 implementation for J1 Theme
 #
 # Product/Info:
 # https://jekyll.one
 # https://github.com/migliori/universal-icon-picker
 #
 # Copyright (C) 2023-2025 Juergen Adams
 # Copyright (C) 2023 Gilles Migliori
 #
 # J1 Template is licensed under the MIT License.
 # See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 # -----------------------------------------------------------------------------
*/

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory(root))
  } else if (typeof exports === 'object') {
    module.exports = factory(root)
  } else {
    root.j1LazyLoader = factory(root)
  }
})(typeof global !== 'undefined' ? global : this.window || this.global, function (root) {

"use strict";

  // coreApp.js

  class PluginManager {
    constructor() {
      this.plugins = [];
    }

    // Registrierung eines Plugins
    registerPlugin(plugin) {
      if (typeof plugin.init === 'function') {
        plugin.init(this);
        this.plugins.push(plugin);
      }
    }

    // Hook-Aufrufe zur Plugin-Interaktion
    triggerHook(hookName, ...args) {
      this.plugins.forEach(plugin => {
        if (typeof plugin[hookName] === 'function') {
          plugin[hookName](...args);
        }
      });
    }
  }

  export const pluginManager = new PluginManager();

  // Hauptfunktionalität der Anwendung
  function mainAppFunction() {
    console.log('Hauptanwendung läuft.');
    // Plugins können durch einen Hook aufgerufen werden
    pluginManager.triggerHook('onStart');
  }

  export default mainAppFunction;

})
