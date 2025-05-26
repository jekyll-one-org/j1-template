/*
 # -----------------------------------------------------------------------------
 #  ~/js/console_filter/consoleFilter.js
 #  console logs (error|info) im Browser unabhängig von der auslösenden
 #  Quelle filtern und bestimmte Fehlermeldungen oder Log-Einträge entfernen
 #
 #  Product/Info:
 #  https://jekyll.one
 #
 #  Copyright (C) 2023-2025 Juergen Adams
 #
 #  J1 Theme is licensed under MIT License.
 #  See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 # -----------------------------------------------------------------------------
*/
"use strict";
module.exports = function consoleFilters (options) {

  return {

    // -------------------------------------------------------------------------
    // filters
    // -------------------------------------------------------------------------
    filter: function () {  

      // Speichern Sie die ursprüngliche console error|log Funktion
      const originalConsoleInfoLog  = console.log;
      const originalConsoleErrorLog = console.error;
      var debug = false;

      // Definieren Sie die Filter, nach denen gesucht werden soll (Groß-/Kleinschreibung beachten)
      const logFilterWoerter    = ["Fehler", "Error", "WARNUNG"];
      const errorFilterWoerter  = ["googleads.g.doubleclick.net"];

      // Definieren Sie die neue console.log-Funktion
      console.error = function() {
        const argsArray = Array.from(arguments);
        const logMessage = argsArray.join(" ");

        // Überprüfen Sie, ob die Log-Nachricht eines der Filterwörter enthält
        const sollGeloggtWerden = !errorFilterWoerter.some(wort => logMessage.includes(wort));

        // Rufen Sie die ursprüngliche console.log-Funktion nur auf, wenn die Nachricht nicht gefiltert werden soll
        if (sollGeloggtWerden) {
            originalConsoleErrorLog.apply(console, arguments);
        }
      }

      // Definieren Sie die neue console.log-Funktion
      console.log = function() {
        const argsArray = Array.from(arguments);
        const logMessage = argsArray.join(" ");

        // Überprüfen Sie, ob die Log-Nachricht eines der Filterwörter enthält
        const sollGeloggtWerden = !logFilterWoerter.some(wort => logMessage.includes(wort));

        // Rufen Sie die ursprüngliche console.log-Funktion nur auf, wenn die Nachricht nicht gefiltert werden soll
        if (sollGeloggtWerden) {
          originalConsoleInfoLog.apply(console, arguments);
        }
      }

      if (debug) {
      console.error("consoleFilter: Dieser Fehler sollte angezeigt werden.");

      console.log("consoleFilter: Diese Nachricht sollte angezeigt werden.");
      console.log("consoleFilter: Diese Nachricht enthält das Wort Fehler und wird gefiltert.");
      console.log("consoleFilter: Diese WARNUNG wird ebenfalls gefiltert.");
      }
    
    return true;
    },

  };
}( window, j1 ); 
// END consoleFilters

