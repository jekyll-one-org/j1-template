/*
 # -----------------------------------------------------------------------------
 # ~/js/console_filter/consoleFilter.js
 # filter console logs (info|warning|error|) in the Browser Console
 # independent of the source that triggered the log and remove
 # specific error messages or log entries
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
module.exports = function consoleFilters (window, j1) {

  return {

    // -------------------------------------------------------------------------
    // filters
    // -------------------------------------------------------------------------
    filter: function (options) {

      // save console info|warning|error log function references
      const originalConsoleInfoLog    = console.log;
      const originalConsoleWarningLog = console.warn;
      const originalConsoleErrorLog   = console.error;

      var settings  = options || {};
      var debug     = settings.debug || false

      // define message filter|words (NOTE: words are case sensitive)
      const infoFilterWords     = ["Fehler", "Error", "WARNUNG", "WARNING"];
      const warningFilterWords  = ["Chrome", "Fehler", "Error", "WARNUNG", "WARNING"];
      const errorFilterWords    = ["doubleclick.net"];

      // define redirect for funktion console.log 
      console.log = function() {
        const argsArray   = Array.from(arguments);
        const logMessage  = argsArray.join(' ');

        // check for filter words in the log message
        const shouldLogged = !infoFilterWords.some(word => logMessage.includes(word));

        // call original console.log function if the message should not be filtered
        if (shouldLogged) {
          originalConsoleInfoLog.apply(console, arguments);
        }
      }

      // define redirect for funktion console.warn
      console.warn = function() {
        const argsArray   = Array.from(arguments);
        const logMessage  = argsArray.join(' ');

        // check for filter words in the log message
        const shouldLogged = !warningFilterWords.some(word => logMessage.includes(word));

        // call original console.warn function if the message should not be filtered
        if (shouldLogged) {
          originalConsoleWarningLog.apply(console, arguments);
        }
      }

      // define redirect for funktion console.error
      console.error = function() {
        const argsArray   = Array.from(arguments);
        const logMessage  = argsArray.join(' ');

        // check for filter words in the log message
        const shouldLogged = !errorFilterWords.some(word => logMessage.includes(word));

        // call original console.error function if the message should not be filtered
        if (shouldLogged) {
          originalConsoleErrorLog.apply(console, arguments);
        }
      }

      if (debug) {
        console.log("consoleFilters: This message should be displayed.");
        console.log("consoleFilters: This message contains the word \"Error\" and is filtered.");
        console.log("consoleFilters: This WARNING is also filtered.");
        console.warn("consoleFilters: This warning should be displayed.");        
        console.error("consoleFilters: This error should be displayed.");
      }
    
      return true;
    },

  };
}( window, j1 ); 
// END consoleFilters