/*
 # -----------------------------------------------------------------------------
 # ~/js/test_module/promise_test.js
 # Provides Javascript functions for Testing Promises
 #
 # Product/Info:
 # http://jekyll.one
 #
 # Copyright (C) 2023 Juergen Adams
 #
 # J1 Theme is licensed under MIT License.
 # See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE.md
 # -----------------------------------------------------------------------------
 # promise_test@2019-06-14
 # -----------------------------------------------------------------------------
*/
'use strict';

// -----------------------------------------------------------------------------
// ESLint shimming
// -----------------------------------------------------------------------------
/* eslint indent: "off"                                                       */
/* eslint no-unused-vars: "off"                                               */
/* eslint no-undef: "off"                                                     */
/* eslint no-redeclare: "off"                                                 */
/* eslint indent: "off"                                                       */
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// WebHook core registered as "webHook"
// -----------------------------------------------------------------------------
module.exports = function j1promiseTest ( options ) {

  //const WebhooksApi = require('@octokit/webhooks');

  // Default settings
  var settings = $.extend({
    secret: '12ada70c0d34914d194f1a790c9b23bd'  // make sure a secret is used
  }, options );

  return {

    // -------------------------------------------------------------------------
    // Initialize j1webhook
    // -------------------------------------------------------------------------
    init: function ( options ) {

      var state;
      var logger;
      var logText;

      var colorData     = {};
      var fontSizeData  = {};

    	var promise_data = 'Huhuu!!!'

      // -----------------------------------------------------------------------
      // Helper functions
      // -----------------------------------------------------------------------

      // function executeFunctionByName(functionName, context /*, args */) {
      //   // See: https://stackoverflow.com/questions/359788/how-to-execute-a-javascript-function-when-i-have-its-name-as-a-string
      //   //
      //   var args = Array.prototype.slice.call(arguments, 2);
      //   var namespaces = functionName.split(".");
      //   var func = namespaces.pop();
      //   for(var i = 0; i < namespaces.length; i++) {
      //     context = context[namespaces[i]];
      //   }
      //   return context[func].apply(context, args);
      // }

      logger = log4javascript.getLogger('promise_test');


      function started ( data ) {
        logger.warn('Started :' + data);
        return 'I did something';
      }

      const promiseToDoSomething = () => {
        return new Promise( resolve => {
          setTimeout( () => resolve (
            //started ( promise_data )
            j1.loadColorData()
          ), 1 )
        })
      }

      const watchOverSomeoneDoingSomething = async () => {
        colorData = await promiseToDoSomething()
        return 'I did something' + ' and I watched'
      }

      const watchOverSomeoneWatchingSomeoneDoingSomething = async () => {
        const something = await watchOverSomeoneDoingSomething()
        return something + ' and I watched as well'
      }

      watchOverSomeoneWatchingSomeoneDoingSomething().then(res => {
        logger.warn('result: ' + res);
      });



      // async function loadColors() {
      //     try {
      //         let colors = await Promise.resolve( resolve => { j1.loadColorData() })
      //         logger.error("Got colors: " + JSON.parse(colors));
      //     } catch(error) {
      //         logger.error("An error occurred in asyc loadColors() ");
      //     }
      // }
      // let colors = loadColors();
      //
      // async function waitForPromise() {
      //     // let result = await any Promise, like:
      //     let result = await Promise.resolve('this is a sample promise');
      // }

      // const loadColors = () => {
      //   return fetch('/assets/data/colors.json') // get users list
      //     .then(response => response.json()) // parse JSON
      // }
      //
      // var colors = loadColors()


      // state = 'finished';
      // logger.info('state: ' + state); // Set|Log status

      logger.error("J1 promise_test successfully initialized");

    } // END init


  }; // END return
}( jQuery );
