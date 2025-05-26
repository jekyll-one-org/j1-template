/*
 # -----------------------------------------------------------------------------
 # ~/js/console_filter/errorFilter.js
 # filter error logs in the browser console regardless of the
 # (triggering) source and remove specific error messages
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2023-2025 Juergen Adams
 #
 # J1 Theme is licensed under MIT License.
 # See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 # -----------------------------------------------------------------------------
*/
"use strict";

module.exports = function errorFilters (options) {

  return {

    // -------------------------------------------------------------------------
    // filters
    // -------------------------------------------------------------------------
    filter: function () {  

      window.onerror = function(message, source, lineno, colno, error) {
        console.log('Globaler Fehler:', message, source, lineno, colno, error);

        // Versuchen Sie, Fehler von Drittanbietern zu identifizieren (begrenzte Möglichkeiten)
        if (source && source.includes('doubleclick.net')) {
          console.warn('Möglicher Fehler von der Drittanbieter-API:', message, source);
          // Hier könnten Sie entscheiden, diesen Fehler nicht weiter in der Konsole anzuzeigen,
          // wenn er für Ihre Anwendung irrelevant ist.
          return true; // Verhindert die Standard-Fehlerausgabe des Browsers für diesen Fehler.
        }

        // Geben Sie false zurück, um die Standard-Fehlerbehandlung des Browsers zuzulassen
        return false;
      };
    }

  };
}( window, j1 );  
// END errorFilters

