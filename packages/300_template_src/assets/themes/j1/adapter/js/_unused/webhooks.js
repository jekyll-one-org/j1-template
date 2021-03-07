---
regenerate:                             false
---

{% capture cache %}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/webhooks.js
 # Liquid template to adapt J1 WebHooks Core functions
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
{% assign environment           = site.environment %}
{% assign template_version      = site.version %}


{% comment %} Process YML config data
================================================================================ {% endcomment %}

{% comment %} Set config files
-------------------------------------------------------------------------------- {% endcomment %}
{% assign template_config       = site.data.j1_config %}
{% assign blocks                = site.data.blocks %}
{% assign modules               = site.data.modules %}
{% assign utilities             = site.data.utilities %}
{% assign private_data          = site.data.private.modules.webhook %}

{% comment %} Set config data
-------------------------------------------------------------------------------- {% endcomment %}
{% assign util_srv_defaults     = utilities.defaults.util_srv.defaults %}
{% assign util_srv_settings     = utilities.util_srv.settings %}
{% assign webhooks_defaults     = modules.defaults.webhooks.defaults %}
{% assign webhooks_settings     = modules.webhooks.settings %}

{% comment %} Set config options
-------------------------------------------------------------------------------- {% endcomment %}
{% assign util_srv_options      = util_srv_defaults | merge: util_srv_settings %}
{% assign webhooks_options      = webhooks_defaults | merge: webhooks_settings %}
{% assign module_options        = webhooks_options  | merge: util_srv_options %}
{% assign module_options        = module_options    | merge: private_data %}


/*
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/webhooks.js
 # J1 Adapter for J1 WebHooks
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
j1.adapter['webhooks'] = (function (j1, window) {

  {% comment %} Global variables
  ------------------------------------------------------------------------------ {% endcomment %}
  var environment               = '{{environment}}';
  var moduleOptions             = {};
  var message                   = {};
  var cookie_names              = j1.getCookieNames();
  var cookie_user_session_name  = cookie_names.user_session;
  var ep_util_serv_git_pull;
  var ep_util_serv_npm_rebuild;
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
    // TODO: Support for Git and NPM endpoints needs to be extended for
    // the middleware
    // -------------------------------------------------------------------------
    init: function () {

      // Load  module DEFAULTS|CONFIG
      moduleOptions = $.extend({}, {{module_options | replace: '=>', ':' | replace: 'nil', '""'}});

      // Set global variables
      _this                     = j1.adapter.webhooks;
      logger                    = log4javascript.getLogger('j1.adapter.webhooks.init');
      ep_util_serv_git_pull     = 'http://localhost:' + moduleOptions.port + '/git?request=pull';
      ep_util_serv_npm_rebuild  = 'http://localhost:' + moduleOptions.port + '/npm?request=rebuild';

      if (j1.checkUserAgent('IE') || j1.checkUserAgent('Edge')) {
        moduleOptions.enabled = false;
        logger.warn('MS browsers does not support server side events (SSE)');
        logger.warn('webhooks disabled');
      }

      // for middleware, currently no ENDPOINTS available for Git and NPM
      if (j1.appDetected()) {
      	logger.warn('webhooks currently disabled for mode: app');
        moduleOptions.enabled = false;
      }

      if (moduleOptions.enabled) {
        logger.info('webhooks enabled, run initialization');

        _this.setState('started');
        logger.info('state: ' + _this.getState());
        logger.info('module is being initialized');

        // Load webhook modals
        logger.info('loading html data for modals');
        $.when (j1.xhrData('j1.adapter.webhooks', moduleOptions , 'data_loaded'))
        .then (function (success) {
          if (success) {
            // Run initializers if webhook modals are LOADED
            var dependencies_met_modals_loaded = setInterval(function() {
              if (j1.adapter.webhooks.getState() == 'data_loaded') {
                logger.info('loading data completed');
                // Run initializers
                j1.core.webhooks.init(moduleOptions);
                j1.adapter.webhooks.eventHandler(moduleOptions);
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
    // EventHandler for J1 Webhooks (UI)
    // Manage button click events for all BS Modals
    // See: https://www.nickang.com/add-event-listener-for-loop-problem-in-javascript/
    // -------------------------------------------------------------------------
    eventHandler: function (options) {
      var message = {};
      var topPosition;
      var logText;
      var json_message;

      logger  = log4javascript.getLogger('j1.adapter.webhooks.eventHandler');

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
            e.preventDefault();

            logger.info('user clicked acceptGitPullButton');

            $.when (j1.xhrApi(ep_util_serv_git_pull))
            .then (function (response) {
              // json_message = JSON.stringify(response, undefined, 2);
              json_message = JSON.stringify(response);

              logText = 'response received: ' + json_message;
              logger.info(logText);

              if (response.status === 'success') {
                $('#gitPullSuccess').find('.pull-message').html(response.response);
                $('#gitPullSuccess').modal('show');
              }
            });
          }

          // declineGitPullButton
          // -------------------------------------------------------------------
          if (this.id === 'declineGitPullButton') {
            e.preventDefault();
            logger.info('user clicked declineGitPullButton');
          }

          // requestFailedOkButton
          // -------------------------------------------------------------------
          if (this.id === 'requestFailedOkButton') {
            e.preventDefault();
            logger.info('user clicked requestFailedOkButton');
          }

        });
      });

      // Register pre/post events for modal 'webhookCommitDetected'
      // -----------------------------------------------------------------------
      $(document).on('shown.bs.modal','#webhookCommitDetected', function (e) {
        e.preventDefault();

        // store y-scroll position on shown
        topPosition = $(window).scrollTop();

        logger.info('display webhookCommitDetected');

        // autohide modal if configured
        if (options.commit_detection.modal_commit_detected.autohide) {
          var timeout = setInterval(function() {
            $('#webhookCommitDetected').modal('hide');
            logger.info('hide modal on timeout');
            // clear interval checking
            clearInterval(timeout);
          }, options.commit_detection.modal_commit_detected.autohidden);
        }

      }); // END shown modal 'webhookCommitDetected'

      $(document).on('hidden.bs.modal','#webhookCommitDetected', function (e) {
        e.preventDefault();

        // restore y-scroll position on hidden
        $(window).scrollTop(topPosition);

        // jadams, 2019-10-06: message NOT send to other open windows|pages
        // disabled for now
        //
        // message.type    = 'command';
        // message.action  = 'close_modals';
        // message.text    = 'close open modals';
        // j1.sendMessage('j1.core.webhooks', 'j1.adapter.webhooks', message);

        logger.info('closed webhookCommitDetected');
      }); // END hide modal 'webhookCommitDetected'


      // Register pre/post events for modal 'gitPullSuccess'
      // close all open Modals
      // see: https://stackoverflow.com/questions/17978043/how-to-close-all-active-bootstrap-modals-on-session-timeout
      // -----------------------------------------------------------------------
      $(document).on('shown.bs.modal','#gitPullSuccess', function (e) {
        e.preventDefault();

        // store y-scroll position on shown
        $(window).scrollTop(topPosition);

        logger.info('display gitPullSuccess');

        // Autohide modal if configured
        if (options.commit_detection.modal_pull_response.autohide) {
          var timeout = setInterval(function() {
            // close all open Modals
            $('.modal').modal('hide');
            logger.info('hide modal on timeout');
            // clear interval checking
            clearInterval(timeout);
          }, options.commit_detection.modal_pull_response.autohidden);
        }

      }); // END shown modal 'gitPullSuccess'

      $(document).on('hidden.bs.modal','#gitPullSuccess', function (e) {
        e.preventDefault();

        // restore y-scroll position on hidden
        $(window).scrollTop(topPosition);

        logger.info('post processing on gitPullSuccess');
      }); // END hidden modal 'gitPullSuccess'

      // Register pre/post events for modal 'npmScriptSuccess'
      // -----------------------------------------------------------------------
      $(document).on('shown.bs.modal','#npmScriptSuccess', function (e) {
        e.preventDefault();

        // store y-scroll position on shown
        $(window).scrollTop(topPosition);

        logger.info('display npmScriptSuccess');

        // Autohide modal if configured
        if (options.commit_detection.modal_pull_response.autohide) {
          var timeout = setInterval(function() {
            // close all open Modals
            $('.modal').modal('hide');
            logger.info('hide modal on timeout');
            // clear interval checking
            clearInterval(timeout);
          }, options.commit_detection.modal_pull_response.autohidden);
        }

      }); // END shown modal 'npmScriptSuccess'

      $(document).on('hidden.bs.modal','#npmScriptSuccess', function (e) {
        e.preventDefault();

        // restore y-scroll position on hidden
        $(window).scrollTop(topPosition);

        logger.info('post processing on npmScriptSuccess');

      }); // END hidden modal 'npmScriptSuccess'

      logText = 'register events finished';
      logger.info(logText);

    }, // END eventHandler

    // -------------------------------------------------------------------------
    // messageHandler
    // Manage messages send from other J1 modules
    // -------------------------------------------------------------------------
    messageHandler: function (sender, message) {
      // var json_message = JSON.stringify(message, undefined, 2);
      var json_message = JSON.stringify(message);

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
      if (message.type === 'command' && message.action === 'close_modals') {
        logText = 'processing message from ' + sender + ', type: ' + message.type + ', action: ' + message.action;
        logger.info(logText);
        // close all open Modals
        // see: https://stackoverflow.com/questions/17978043/how-to-close-all-active-bootstrap-modals-on-session-timeout
        $('.modal').modal('hide');
      }

      // -----------------------------------------------------------------------
      //  Command message (action), type (Git) 'pull'
      if (message.type === 'command' && message.action === 'pull') {
        logText = 'processing message from ' + sender + ', type: ' + message.type + ', action: ' + message.action;
        logger.info(logText);

        $.when (j1.xhrApi(ep_util_serv_git_pull))
        .then (function(response) {
          // json_message = JSON.stringify(response, undefined, 2);
          json_message  = JSON.stringify(response);
          logText       = 'response from xhrApi received: ' + json_message;

          if (response.status === 'success') {
            logger.info(logText);
          } else if (response.status === 'failed') {
            logger.warn(logText);
          } else {
            logger.error('unknown response from xhrApi');
          }

        });
      } // ENDIF message action 'pull'

      // -----------------------------------------------------------------------
      //  Process command message (action), type (NPM) 'built'
      if (message.type === 'command' && message.action === 'built') {
        logText = 'processing message from ' + sender + ', type: ' + message.type + ', action: ' + message.action;
        logger.info(logText);

        $.when (j1.xhrApi(ep_util_serv_npm_rebuild))
        .then (function(response) {
          // json_message = JSON.stringify(response, undefined, 2);
          json_message = JSON.stringify(response);

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
      j1.adapter.webhooks.state = stat;
    }, // END setState

    // -------------------------------------------------------------------------
    //  Returns the current (processing) state of the module
    // -------------------------------------------------------------------------
    getState: function () {
      return j1.adapter.webhooks.state;
    } // END state

  }; // END return

})(j1, window);

{% endcapture %}
{{ cache | strip_empty_lines }}
{% assign cache = nil %}
