---
regenerate:                             false
---

{% capture cache %}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/octokit.js
 # Liquid template to adapt GH WebHooks Core functions
 #
 # Product/Info:
 # https://jekyll.one
 # Copyright (C) 2021 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # For details, see https://jekyll.one
 # -----------------------------------------------------------------------------
 # Test data:
 #  {{ liquid_var | debug }}
 # -----------------------------------------------------------------------------
{% endcomment %}

{% comment %} Liquid procedures
-------------------------------------------------------------------------------- {% endcomment %}

{% comment %} Set global settings
-------------------------------------------------------------------------------- {% endcomment %}
{% assign environment       = site.environment %}
{% assign template_version  = site.version %}

{% comment %} Process YML config data
================================================================================ {% endcomment %}

{% comment %} Set config files
-------------------------------------------------------------------------------- {% endcomment %}
{% assign template_config   = site.data.j1_config %}
{% assign blocks            = site.data.blocks %}
{% assign modules           = site.data.modules %}

{% comment %} Set config data
-------------------------------------------------------------------------------- {% endcomment %}
{% assign webhook_defaults = modules.defaults.util_srv.defaults %}
{% assign webhook_settings = modules.util_srv.settings %}

{% comment %} Set config options
-------------------------------------------------------------------------------- {% endcomment %}
{% assign webhook_options  = webhook_defaults | merge: webhook_settings %}

/*
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/octokit.js
 # J1 Adapter for GH WebHooks
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2021 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # For details, see https://jekyll.one
 # -----------------------------------------------------------------------------
 # Adapter generated: {{site.time}}
 # -----------------------------------------------------------------------------
*/
'use strict';

{% comment %} Main
-------------------------------------------------------------------------------- {% endcomment %}
j1.adapter['octokit'] = (function (j1, window) {

  {% comment %} Global variables
  ------------------------------------------------------------------------------ {% endcomment %}
  var environment               = '{{environment}}';
  var moduleOptions             = {};
  var cookie_names              = j1.getCookieNames();
  var cookie_user_session_name  = cookie_names.user_session;
  var logger;
  var logText;
  var _this;
  var json_data;
  var success;

  // ---------------------------------------------------------------------------
  // Main object
  // ---------------------------------------------------------------------------
  return {

    // -------------------------------------------------------------------------
    // Initializer
    // -------------------------------------------------------------------------
    init: function () {

      // Set global variables
      _this   = j1.adapter.octokit;
      logger  = log4javascript.getLogger('j1.adapter.octokit.init');

      // Load  module DEFAULTS|CONFIG
      moduleOptions = $.extend({}, {{webhook_options | replace: '=>', ':' | replace: 'nil', '""'}});

      if (j1.checkUserAgent('IE') || j1.checkUserAgent('Edge')) {
        moduleOptions.enabled = false;
        logger.warn('browser does not support server side events (SSE)');
        logger.warn('webhooks disabled');
      }

      if (moduleOptions.enabled) {
        logger.info('webhooks enabled, run initialization');

        _this.setState('started');
        logger.info('state: ' + _this.getState());
        logger.info('module is being initialized');

        // Load webhook modals
        logger.info('loading html data for modals');
        $.when (j1.xhrData('j1.adapter.octokit', moduleOptions , 'data_loaded'))
        .then (function (success) {
          if (success) {
            // Run initializers if webhook modals are LOADED
            var dependencies_met_modals_loaded = setInterval(function() {
              if (j1.adapter.octokit.getState() == 'data_loaded') {
                logger.info('loading data completed');
                // Run initializers
                j1.core.octokit.init(moduleOptions);
                j1.adapter.octokit.eventHandler(moduleOptions);
                _this.setState('finished');
                logger.info('state: ' + _this.getState());
                // clear interval checking
                clearInterval(dependencies_met_modals_loaded);
              }
            }, 25); // END 'dataLoaded'
          } else {
            _this.setState('finished');
            logger.info('state: ' + _this.getState());
            logger.error('loading modal html data failed');
          }
          return true;
        })
        .catch(function(error) {
          logger.error('loading html data for modals failed at: j1.xhrData');
          return false;
        });

      } else {
        _this.setState('finished');
        logger.info('state: ' + _this.getState());
        logger.info('webhooks disabled, initialization skipped');
        return false;
      } // END if moduleOptions enabled

    }, // END init

    // -------------------------------------------------------------------------
    // EventHandler for J1 Octotokit client
    // Manage button click events for all BS Modals
    // See: https://www.nickang.com/add-event-listener-for-loop-problem-in-javascript/
    // -------------------------------------------------------------------------
    eventHandler: function (options) {
      var message = {};
      var logText;
      var json_message;

      logger  = log4javascript.getLogger('j1.adapter.octokit.eventHandler');

      logText = 'register events';
      logger.info(logText);

      var modalButtons = document.querySelectorAll('a.btn');
      if (modalButtons == 0) {
        logger.warn('no modal buttons found to register');
      }

      // Register button click events for WebHook modals
      // -----------------------------------------------------------------------
      modalButtons.forEach(function(button, index) {
        button.addEventListener('click', function(e) {

          // acceptGitPullButton
          // -------------------------------------------------------------------
          if (this.id === 'acceptGitPullButton') {
            logger.info('user clicked acceptGitPullButton');

            $.when (j1.xhrApi('http://localhost:41001/git?request=pull'))
            .then (function (response) {
              json_message = JSON.stringify(response, undefined, 2);

              logText = 'response received: ' + json_message;
              logger.info(logText);

              if (response.status === 'success') {
                $('#gitPullSuccess').find('.pull-message').html(response.response);
                $('#gitPullSuccess').modal('show');
              }

            });

            // false == prevent further event propagation (bubble up)
            // like preventDefault()
            return false;
          }

          // declineGitPullButton
          // -------------------------------------------------------------------
          if (this.id === 'declineGitPullButton') {
            logger.info('user clicked declineGitPullButton');

            return false;
          }

          // acceptGitPullButton
          // -------------------------------------------------------------------
          if (this.id === 'acceptGitPullButton') {
            logger.info('user clicked acceptGitPullButton');

            // if (options.git.pull.enabled) {
            //   // Send commit message (silent mode)
            //   // ------------------------------------------------------------
            //   message.type    = 'command'
            //   message.action  = 'pull'
            //   message.text    = 'Run Git pull'
            //
            //   j1.sendMessage('j1.adapter.octokit', 'j1.core.octokit', message);
            // }

            return false;
          };

          // requestFailedOkButton
          // -------------------------------------------------------------------
          if (this.id === 'requestFailedOkButton') {
            logger.info('user clicked requestFailedOkButton');

            return false;
          }

        });
      });

      // Register pre/post events for modal 'webhookCommitDetected'
      // -----------------------------------------------------------------------
      $(document).on('shown.bs.modal','#webhookCommitDetected',
        function (e) {
          logger.info('display webhookCommitDetected');

          // Autohide modal if configured
          if (options.commit_detection.modal_commit_detected.autohide) {
            var timeout = setInterval(function() {
              $('#webhookCommitDetected').modal('hide');
              logger.info('hide modal on timeout');
              // clear interval checking
              clearInterval(timeout);
            }, options.commit_detection.modal_commit_detected.autohidden);
          }

      }); // END shown modal 'webhookCommitDetected'

      $(document).on('hide.bs.modal','#webhookCommitDetected',
        function (e) {
          logger.info('closed webhookCommitDetected');
      }); // END hide modal 'webhookCommitDetected'


      // Register pre/post events for modal 'gitPullSuccess'
      // -----------------------------------------------------------------------
      $(document).on('shown.bs.modal','#gitPullSuccess',
        function () {
          logger.info('display gitPullSuccess');

          // Autohide modal if configured
          if (options.commit_detection.modal_pull_response.autohide) {
            var timeout = setInterval(function() {
              $('#gitPullSuccess').modal('hide');
              logger.info('hide modal on timeout');
              // clear interval checking
              clearInterval(timeout);
            }, options.commit_detection.modal_pull_response.autohidden);
          }

      }); // END shown modal 'gitPullSuccess'

      $(document).on('hidden.bs.modal','#gitPullSuccess',
        function () {

          logger.info('post processing on gitPullSuccess');

          if (options.utility_server.npm_client.enabled) {
            if (options.utility_server.npm_client.built.execute) {
            // Send commit message (silent mode)
            // -----------------------------------------------------------------
            message.type    = 'command'
            message.action  = 'built'
            message.text    = 'Run NPM built'
            j1.sendMessage('j1.adapter.octokit', 'j1.core.octokit', message);
          }
        }

      }); // END hidden modal 'gitPullSuccess'

      // Register pre/post events for modal 'npmScriptSuccess'
      // -----------------------------------------------------------------------
      $(document).on('shown.bs.modal','#npmScriptSuccess',
        function () {
          logger.info('display npmScriptSuccess');

          // Autohide modal if configured
          if (options.commit_detection.modal_pull_response.autohide) {
            var timeout = setInterval(function() {
              $('#npmScriptSuccess').modal('hide');
              logger.info('hide modal on timeout');
              // clear interval checking
              clearInterval(timeout);
            }, options.commit_detection.modal_pull_response.autohidden);
          }

      }); // END shown modal 'npmScriptSuccess'

      $(document).on('hidden.bs.modal','#npmScriptSuccess',
        function () {
          logger.info('post processing on npmScriptSuccess');
      }); // END hidden modal 'npmScriptSuccess'

      logText = 'register events finished';
      logger.info(logText);

      return true;
    }, // END eventHandler

    // -------------------------------------------------------------------------
    // messageHandler
    // Manage messages send from other J1 modules
    // -------------------------------------------------------------------------
    messageHandler: function (sender, message) {
      var json_message = JSON.stringify(message, undefined, 2);

      logText = 'received message from ' + sender + ': ' + json_message;
      logger.info(logText);

      // -----------------------------------------------------------------------
      //  Process commands|actions
      // -----------------------------------------------------------------------

      // -----------------------------------------------------------------------
      //  Command message (action), type 'module_initialized'
      if (message.type === 'command' && message.action === 'module_initialized') {
        //
        // Place handling of command|action here
        //
        logger.info(message.text);
      }

      // -----------------------------------------------------------------------
      //  Command message (action), type (Git) 'pull'
      if (message.type === 'command' && message.action === 'pull') {
        var url = 'http://localhost:41001/git?request=pull';

        logText = 'processing message from ' + sender + ', type: ' + message.type + ', action: ' + message.action;
        logger.info(logText);

        $.when (j1.xhrApi(url))
        .then (function(response) {
          json_message = JSON.stringify(response, undefined, 2);

          logText = 'response from xhrApi received: ' + json_message;
          logger.info(logText);

          if (response.status === 'success') {
            $('#gitPullSuccess').find('.pull-message').html(response.response);
            $('#gitPullSuccess').modal('show');
          }

          if (response.status === 'failed') {
            $('#requestFailed').find('.pull-message').html(response.response + response.error);
            $('#requestFailed').modal('show');
          }
        });
      } // ENDIF message action 'pull'

      // -----------------------------------------------------------------------
      //  Process command message (action), type (NPM) 'built'
      if (message.type === 'command' && message.action === 'built') {
        //var url = 'http://localhost:41001/npm?request=get_version';
        var url = 'http://localhost:41001/npm?request=rebuild';

        logText = 'processing message from ' + sender + ', type: ' + message.type + ', action: ' + message.action;
        logger.info(logText);

        $.when (j1.xhrApi(url))
        .then (function(response) {
          json_message = JSON.stringify(response, undefined, 2);

          logText = 'response from xhrApi received: ' + json_message;
          logger.info(logText);

          if (response.status === 'success') {
            $('#npmScriptSuccess').find('.pull-message').html(response.response);
            $('#npmScriptSuccess').modal('show');
          }

          if (response.status === 'failed') {
            $('#requestFailed').find('.pull-message').html(response.response + response.error);
            $('#requestFailed').modal('show');
          }
        });
      } // END message action 'pull'

      //
      // Place handling of other command|action here
      //

      return true;
    }, // END messageHandler

    // -------------------------------------------------------------------------
    //  Set the current (processing) state of the module
    // -------------------------------------------------------------------------
    setState: function (stat) {
      j1.adapter.octokit.state = stat;
    }, // END setState

    // -------------------------------------------------------------------------
    //  Returns the current (processing) state of the module
    // -------------------------------------------------------------------------
    getState: function () {
      return j1.adapter.octokit.state;
    } // END state

  }; // END return

})(j1, window);

{% endcapture %}
{{ cache | strip_empty_lines }}
{% assign cache = nil %}
