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

  // ---------------------------------------------------------------------------
  // methods
  // ---------------------------------------------------------------------------

  class Application {

    constructor() {
      this.features = {};
    }

    addFeature(name, fn) {
      this.features[name] = fn;
    }

    useFeature(name) {
      if (this.features[name]) {
        this.features[name]();
      } else {
        console.log(`Feature ${name} not found`);
      }
    }

  }

  const app = new Application();

  // Plugins statisch laden
  import myPlugin from './plugins/my-plugin.js';

  // Plugins registrieren
  myPlugin.register(app);

  // Plugin-Funktionalität nutzen
  app.useFeature('myFeature');

})
