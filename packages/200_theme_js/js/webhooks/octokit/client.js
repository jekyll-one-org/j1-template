/*
 # -----------------------------------------------------------------------------
 # ~/200_theme_js/js/webhooks/octokit/client.js
 # Provides J1 WebHook JavaScript Core functions based on
 # GH Octokit Webhooks
 #
 # Product/Info:
 # https://jekyll.one
 #
 # J1 Template is licensed under the MIT License.
 # See: https://github.com/jekyll-one/J1 Theme/blob/master/LICENSE
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
/* eslint no-prototype-builtins: "off"                                        */
/* eslint indent: "off"                                                       */
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// WebHook client registered as j1.core.webhooks
// -----------------------------------------------------------------------------
module.exports = function client (options) {

  // ---------------------------------------------------------------------------
  // Load dependecies
  // ---------------------------------------------------------------------------
  const WebhooksApi = require('@octokit/webhooks');
  const yaml        = require('js-yaml');                                       // See: https://www.npmjs.com/package/js-yaml

  // ---------------------------------------------------------------------------
  // Global variables
  // ---------------------------------------------------------------------------
  var message         = {};
  var messageCatalog  = {};
  var webhookEvent;
  var webhookEventCommits;
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
    // Initialize WebHook (Octokit) client
    // -------------------------------------------------------------------------
    init: function (options) {
      logger = log4javascript.getLogger('j1.core.webhooks');

      // if (options.utility_server.git_client.enabled) {
      if (options.enabled) {
        // logger.info('client being initialized for payload url: ' + options.utility_server.git_client.payload_url);
        logger.info('client being initialized for payload url: ' + options.payload_url);

        const webhooks = new WebhooksApi({
          // secret: options.utility_server.git_client.secret
          secret: options.secret
        });

        // Set Webhook (Proxy) URL to receive the payload
        // const webhookPayloadUrl = options.utility_server.git_client.payload_url;
        const webhookPayloadUrl = options.payload_url;

        if (options.enabled)  {
          this.sseHandler(options);
          return true;
        } else {
          return false;
        }
      } else {
        logger.info('client found disabled, initialization skipped');
      }
    }, // END init

    // -------------------------------------------------------------------------
    // sseHandler
    // -------------------------------------------------------------------------
    sseHandler: function (options) {
      const source = new EventSource(options.payload_url);
      var payload;
      var json_data;
      var json_data_log;

      logger = log4javascript.getLogger('j1.core.webhooks.sseHandler');

      source.onmessage = function (e) {
        e.preventDefault();

        webhookEvent        = JSON.parse(e.data);
        webhookEventCommits = webhookEvent.body.commits;

        if ( webhookEvent.body.commits ) {
          payload = webhookEvent.body.commits;
        } else  {
          payload = webhookEvent.body.hook;
        }

        logger.info('webhook event received');

        json_data     = JSON.stringify(payload, undefined, 2);
        json_data_log = JSON.stringify(payload);
        logText       = 'webhook payload: ' + json_data_log;
        logger.info(logText);

        // Display|Update Web Hook modal (mode: interactive)
        // ---------------------------------------------------------------------
        if ( options.mode === 'interactive' ) {
          logger.info('interactive mode: display webhook commit modal');

          var pageLoaded = setInterval(function() {
            if ( j1.adapter.webhooks.getState() === 'finished' ) {
              // Place json_data into the modal body
              $('#webhookCommitDetected').find('.json-payload').html(json_data);
              $('#webhookCommitDetected').modal('show');
              clearInterval(pageLoaded);
            }
          }, 25); //END pageLoaded

        } else if ( options.mode === 'silent' )  {
          logger.info('silent mode, send message to run: git pull');
          // Send commit message (mode: silent)
          // -------------------------------------------------------------------
          if ( options.git_client.pull.execute ) {
            message.type    = 'command';
            message.action  = 'pull';
            message.text    = 'pull message';
            j1.sendMessage( 'j1.core.webhooks', 'j1.adapter.webhooks', message );
          }
        } else {
          logger.warn ('mode invalid: do nothing');
        }

      }; // END event onMessage

    }, // END sseHandler

    // -------------------------------------------------------------------------
    // messageHandler: MessageHandler for J1 CookieConsent module
    // Manage messages send from other J1 modules
    // -------------------------------------------------------------------------
    messageHandler: function (sender, message) {
      var json_message = JSON.stringify(message, undefined, 2);

      logText = 'received message from ' + sender + ': ' + json_message;
      logger.info(logText);

      // -----------------------------------------------------------------------
      //  Process commands|actions
      // -----------------------------------------------------------------------
      if (message.type === 'command' && message.action === 'module_initialized') {
        //
        // Place handling of command|action here
        //
        logger.info(message.text);
      }

      //
      // Place handling of other command|action here
      //

      return true;
    }, // END messageHandler

    // -------------------------------------------------------------------------
    // loadMessageCatalog
    // Loads the message catalog object
    // -------------------------------------------------------------------------
    loadMessageCatalog: function (data_path /*, request_type, data_type*/) {
      var type      = typeof request_type  == 'undefined' || request_type  == '' ? 'GET'  : request_type;
      var data_type = typeof data_type     == 'undefined' || data_type     == '' ? 'text' : data_type;
      var messageData;
      var logBase;
      var logText;
      var property;

      logger = log4javascript.getLogger('j1.core.webhooks');

      return $.ajax({

        url:      data_path,
        type:     type,
        dataType: data_type,
        success:  function (data) {
          messageData = yaml.safeLoad(data);
          for (property in messageData) {
            if (messageData.hasOwnProperty(property)) {
              messageCatalog[property] = {};
              messageData[property].forEach((element) => {
                var key = Object.keys(element)[0];
                var value = element[Object.keys(element)[0]];
                messageCatalog[property][key] = value;
              });
            }
          }
          logBase = messageCatalog.info.getData.message;
          logText = 'load message catalog: ' + logBase.text + logBase.message_catalog + logBase.finished;
          logger.info(logText);
        },
        error: function(data) {
          var json_data = JSON.stringify(data, undefined, 2);
          logBase = messageCatalog.error.getData.message;
          logText = logBase.text + logBase.xhr + ': ' + json_data;
          logger.error(logText);
        }

      });
    } // END loadMessageCatalog

  }; // END return

}( jQuery );
