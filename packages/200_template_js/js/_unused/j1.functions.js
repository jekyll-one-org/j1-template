/*
 # -----------------------------------------------------------------------------
 #  ~/js/j1_template/core.js
 #  Provides J1 Template JavaScript Core functions
 #
 #  Product/Info:
 #  https://jekyll.one
 #  http://getbootstrap.com/
 #
 #  Copyright (C) 2021 Juergen Adams
 #  Copyright (C) 2011-2017 Twitter, Inc.
 #  Copyright (C) 2011-2017 The Bootstrap Authors
 #
 #  J1 Template is licensed under MIT License.
 #  See: https://github.com/jekyll-one-org/J1 Template/blob/master/LICENSE
 #  Bootstrap is licensed under MIT License.
 #  For BS3, see https://github.com/twbs/bootstrap/blob/v3-dev/LICENSE
 #  For BS4, see https://github.com/twbs/bootstrap/blob/v4-dev/LICENSE
 # -----------------------------------------------------------------------------
*/
'use strict';

// -----------------------------------------------------------------------------
// ESLint shimming
// -----------------------------------------------------------------------------
/* eslint indent: "off"                                                       */
/* eslint no-unused-vars: "off"                                               */
/* eslint no-undef: "off"                                                     */


//module.exports = function j1 ( options ) {
module.exports = function adapter ( options ) {

  var message_catalog = {};

  return {

    // -------------------------------------------------------------------------
    // loadMessageCatalog
    // Loads the message catalog object
    // -------------------------------------------------------------------------
     getLogMessageCatalog: function (data_path) {
      var type      = typeof request_type  == 'undefined' || request_type  == '' ? 'GET'  : request_type;
      var data_type = typeof data_type     == 'undefined' || data_type     == '' ? 'text' : data_type;
      var logger    = log4javascript.getLogger('j1.loadMessageCatalog');
      var messageData;
      var logBase;
      var logText;
      var property;

      return $.ajax({
        url:      data_path,
        type:     type,
        dataType: data_type,
        success:  function (data) {
          messageData = yaml.safeLoad(data);
          for (property in messageData) {
            if (messageData.hasOwnProperty(property)) {
              message_catalog[property] = {};
              messageData[property].forEach((element) => {
                var key   = Object.keys(element)[0];
                var value = element[Object.keys(element)[0]];
                message_catalog[property][key] = value;
              });
            }
          }
          logBase = message_catalog.info.getData.message;
          logText = logBase.text + logBase.message_catalog + logBase.finished;
          logger.info(logText);
        },
        error: function(data) {
          var json_data = JSON.stringify(data, undefined, 2);
          logBase       = message_catalog.error.getData.message;
          logText       = logBase.text + logBase.xhr + ': ' + json_data;
          logger.error(logText);
        }
      });
    }, // END getLogMessageCatalog

    // -------------------------------------------------------------------------
    // getLogMessage
    // Get a log message from the log message catalog object
    // -------------------------------------------------------------------------
    getLogMessage: function (level, msg, prop) {
      var message = message_catalog[level][msg]['message'][prop];

      return message;
    },  // END getLogMessage


  }; // end return (object)
}( jQuery );
