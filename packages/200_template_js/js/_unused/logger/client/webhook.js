/*
 # -----------------------------------------------------------------------------
 #  ~/js/octokit/webhooks.js
 #  Provides J1 WebHook JavaScript Core functions
 #
 #  Product/Info:
 #  https://jekyll.one
 #
 #  Copyright (C) 2021 Juergen Adams
 #
 #  J1 Template is licensed under MIT License.
 #  See: https://github.com/jekyll-one/J1 Template/blob/master/LICENSE
 # -----------------------------------------------------------------------------
*/
'use strict';

// -----------------------------------------------------------------------------
// Octokit WebHook client registered as j1.core.octokit
// -----------------------------------------------------------------------------
module.exports = function client (options) {

  // ---------------------------------------------------------------------------
  // Load dependecies
  // ---------------------------------------------------------------------------
  const yaml = require('js-yaml');                                              // See: https://www.npmjs.com/package/js-yaml

  // ---------------------------------------------------------------------------
  // Global variables
  // ---------------------------------------------------------------------------
  var message       = {};
  var state;
  var logger;
  var logText;

  // ---------------------------------------------------------------------------
  // Default settings
  // ---------------------------------------------------------------------------
  var settings = $.extend({
    foo: 'foo_option',
    bar: 'bar_option'
  }, options );

  return {

    // -------------------------------------------------------------------------
    // Initialize WebHook client
    // -------------------------------------------------------------------------
    init: function (options) {
      logger = log4javascript.getLogger('j1.core.logger');

      logger.info('Logger client being initialized for payload url: ' + options.utility_server.logger_client.payload_url);

      // Set Webhook (Proxy) URL to receive the payload
      const webhookPayloadUrl = options.utility_server.logger_client.payload_url;

      if ( options.enabled )  {
        this.eventHandler(options);
        return true;
      } else {
        return false;
      }

    }, //END init

    // -------------------------------------------------------------------------
    // eventHandler
    // -------------------------------------------------------------------------
    eventHandler: function ( options ) {
      var source            = new EventSource(options.utility_server.logger_client.payload_url);
      var logWriterEndPoint = 'http://localhost:41001/log2disk?request=write';
      var payload;
      var json_data;

      logger = log4javascript.getLogger('j1.core.logger');

      source.onmessage = (event) => {
        var webhookEvent  = JSON.parse(event.data);
        var payload       = webhookEvent.body[0];

        logger.debug('eventHandler: event received');

        json_data = JSON.stringify(payload, undefined, 2);
        logText   = 'eventHandler: Webhook payload: ' + json_data;
        logger.debug(logText);

        $.when (j1.xhrApi(logWriterEndPoint, 'POST', 'json'))
        .then (function (response) {
          json_message = JSON.stringify(response, undefined, 2);

          logText = 'Response received: ' + json_message;
          logger.info(logText);

          if ( response.status === 'success' ) {
            logText = 'Response received: ' + json_message;
            logger.info(logText);
          }

        });

        return true;
      } //END event onMessage

    } //END eventHandler

  }; //END return
}( jQuery );
