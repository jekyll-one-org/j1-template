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

// Object to store current options
var options = {};

var customOptions = {
  cssPlugin:  'pluginA.js',
};

var plugins       = [];
var pluginsLoaded = false;

// var _this = this;

// Object for the public API
//var j1LazyLoader = {};

var j1LazyLoader = {
  name: "LazyLoader"
};

var pluginManager = {
  name: "pluginManager"
};

  // ---------------------------------------------------------------------------
  // methods
  // ---------------------------------------------------------------------------
  //
  // Add a method dynamically
  j1LazyLoader.loadPlugin = function(url) {
    // ES-Module dynamisch laden
    // const module = await import(url);
    // const module = import(url);
    const module = url;
    if (module && module.init) {
      // Plugin initialisieren
      var plugin = module.init();
      this.plugins.push(plugin);
      console.log(`Plugin ${plugin.name} geladen`);
      pluginsLoaded = true;
    }

    // try {
    //   // ES-Module dynamisch laden
    //   // const module = await import(url);
    //   // const module = import(url);
    //   const module = url;
    //   if (module && module.init) {
    //     // Plugin initialisieren
    //     const plugin = module.init();
    //     this.plugins.push(plugin);
    //     console.log(`Plugin ${plugin.name} geladen`);
    //     pluginsLoaded = true;
    //   }
    // }
    // catch (err) {
    //   console.error(`Fehler beim Laden des Plugins: ${err}`);
    // }

  };

  // Add a method dynamically
  j1LazyLoader.initializePlugins = function () {
    plugins.forEach(plugin => plugin.run());
  };

  j1LazyLoader.pluginManager = function (customOptions) {
    // var plugins = [];

    // Plugin laden
    // async function loadPlugin(url) {
    // loadPlugin: (url) => {
    // function loadPlugin(url) {

    // Object.defineProperty(j1LazyLoader.pluginManager, 'loadPlugin', {
    //   value: function(url) {
    //     try {
    //       // ES-Module dynamisch laden
    //       // const module = await import(url);
    //       const module = import(url);
    //       if (module && module.init) {
    //           const plugin = module.init(); // Plugin initialisieren
    //           this.plugins.push(plugin);
    //           console.log(`Plugin ${plugin.name} geladen`);
    //           pluginsLoaded = true;
    //       }
    //     }
    //     catch (err) {
    //       console.error(`Fehler beim Laden des Plugins: ${err}`);
    //     }
    //   },
    //   enumerable: true,
    //   configurable: true,
    //   writable: true
    // });

    // Alle Plugins initialisieren
    // initializePlugins: () => {
    // function initializePlugins(url) {
    //   plugins.forEach(plugin => plugin.run());
    // }

    // Object.defineProperty(j1LazyLoader.pluginManager, 'initializePlugins', {
    //   value: function(url) {
    //     plugins.forEach(plugin => plugin.run());
    //   },
    //   enumerable: true,
    //   configurable: true,
    //   writable: true
    // });

  } // END j1LazyLoader.pluginManager

  j1LazyLoader.init = function (customOptions) {
    var pluginURL = customOptions.cssPlugin;

    // Plugins dynamisch laden
    j1LazyLoader.loadPlugin(pluginURL);

    // Alle Plugins initialisieren
    var dependencies_plugins_ready = setInterval (() => {
      if (pluginsLoaded) {
        j1LazyLoader.initializePlugins();

        clearInterval(dependencies_plugins_ready);
      } // END pageVisible
    }, 10); // END dependencies_plugins_ready

    return;

  } // END j1LazyLoader.init

  // Make j1LazyLoader available globally.
  root.j1LazyLoader = j1LazyLoader;

  return j1LazyLoader;

})
