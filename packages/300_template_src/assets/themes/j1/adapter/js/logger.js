---
regenerate:                             false
---

{% capture cache %}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/logger.js
 # Liquid template to adapt Log4Javascript Core functions
 #
 # Product/Info:
 # https://jekyll.one
 #
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
{% assign modules           = site.data.modules %}

{% comment %} Set config data
-------------------------------------------------------------------------------- {% endcomment %}
{% assign logger_defaults   = modules.defaults.log4javascript.defaults %}
{% assign logger_settings   = modules.log4javascript.settings %}

{% comment %} Set config options
-------------------------------------------------------------------------------- {% endcomment %}
{% assign logger_options    = logger_defaults | merge: logger_settings %}

{% assign production = false %}
{% if environment == 'prod' or environment == 'production' %}
  {% assign production = true %}
{% endif %}

/*
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/logger.js
 # JS Adapter for for J1 Logger (log4javascript)
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

// -----------------------------------------------------------------------------
// ESLint shimming
// -----------------------------------------------------------------------------
/* eslint indent: "off"                                                       */
// -----------------------------------------------------------------------------
'use strict';

j1.adapter['logger'] = (function (j1, window) {

  // ---------------------------------------------------------------------------
  // globals
  // ---------------------------------------------------------------------------
  var environment           = '{{environment}}';
  var page_id               = j1.generateId(12);
  var cookie_names          = j1.getCookieNames();
  var loggerRequestCallback = false;
  var loggerOptions         = {};
  var ajaxAppenderOptions   = {};
  var user_session;
  var appDetected;
  var _this;
  var logger;
  var log2disk;
  var ajaxAppender;
  var consoleAppender;
  var jsonLayout;
  var httpPostDataLayout;
  var xmlLayout;
  var jsonLayout;
  var nullLayout;
  var simpleLayout;
  var patternLayout;
  var logText;
  var payloadURL;

  // ---------------------------------------------------------------------------
  // helper functions
  // ---------------------------------------------------------------------------

  // ---------------------------------------------------------------------------
  // getCustomData
  // throw a 'fake' exception to retrieve the stack trace and analyze
  // to find the line from which this function was called
  // ---------------------------------------------------------------------------
  var getCustomData = function(layout, loggingReference) {
    var customData = [];

    try { (0)(); } catch (e) {
      var pattern = /^(.+?) ?\(?((?:file|https?|chrome-extension):.*?):(\d+)(?::(\d+))?\)?\s*$/ig;
      // Split the stack trace
      var output = e.stack.replace(/^.*?\n/,'').replace(/(?:\n@:0)?\s+$/m,'').replace(/^\(/gm,'{anon}(').split('\n');
      // The last trace in the array is the line this function was called
      var logger_trace = output.pop();
      // Extract the full path:line number from this trace
      var path = logger_trace.replace(pattern, '$2:$3');
      // Extract the filename and line number from this trace
      var logger_location = logger_trace.split(':');
      var file = logger_location[logger_location.length - 3];
      var splitString = file.split('/');
      // The filename is (in array) at position length - 1
      file = splitString[splitString.length - 1];
      // If no file(name) found in the array, the file is the index document
      if (file == '') file = '(index)';
      var line = logger_location[logger_location.length - 2];
      // Push resulting fields on an Object|Array to identify
      // the first custom field (%f{1}) by index [0]
      customData.push({ 'name':  'file', 'value':file });
      customData.push({ 'name':  'line', 'value': line });
      customData.push({ 'name':  'path', 'value': path });
      customData.push({ 'name':  'id',   'value': page_id });
    }

    // set custom fields > %f{1}
    for (var i = 1, len = layout.customFields.length; i < len; i++) {
      var name = layout.customFields[i].name;
      if (customData[i].value) layout.customFields[i].value = customData[i].value;
    }

    // return custom field %f{1}
    return customData[0].value;
  };

  var requestCallback = function(data) {
    var xhrData = data;
    //
    // place handling of command|action here
    //
    return;
  };

  // ---------------------------------------------------------------------------
  // main object
  // ---------------------------------------------------------------------------
  return {

    // -------------------------------------------------------------------------
    // initializer
    // -------------------------------------------------------------------------
    init: function (options) {
      // initialize state flag
      j1.adapter.logger.state = 'started';

      // load module DEFAULTS|CONFIG to js object
      /* eslint-disable */
      loggerOptions       = $.extend({}, {{logger_options | replace: '=>', ':' | replace: 'nil', '""'}});
      /* eslint-enable */
      ajaxAppenderOptions = loggerOptions.appenders[1].appender;

      // -----------------------------------------------------------------------
      // setup logger instances
      // -----------------------------------------------------------------------
      _this       = j1.adapter.logger;
      logger      = log4javascript.getLogger('j1.adapter.logger');
      log2disk    = log4javascript.getLogger('j1.adapter.log2disk');

      // wait until user_session.mode is detected by j1.init()
      //
      var dependencies_met_mode_detected = setInterval(function() {
        user_session = j1.readCookie(cookie_names.user_session);

        if (user_session.mode !== 'na') {
          clearInterval(dependencies_met_mode_detected);
          logger.info('met dependencies for: mode detected');
          appDetected = user_session.mode === 'app' ? true : false;

          if (appDetected) {
            payloadURL = ajaxAppenderOptions.payload_url_app;
          } else {
            payloadURL = ajaxAppenderOptions.payload_url_web;
          }

          // -------------------------------------------------------------------
          // setup appenders
          // -------------------------------------------------------------------

          // consoleAppender (browser console)
          consoleAppender = new log4javascript.BrowserConsoleAppender();
          consoleAppender.setThreshold(log4javascript.Level.DEBUG);

          // ajaxAppender (XHR)
          // HTTP POST log data on the utility server (write log to disk)
          ajaxAppender = new log4javascript.AjaxAppender(payloadURL);
          ajaxAppender.setThreshold(log4javascript.Level.DEBUG);
          ajaxAppender.setWaitForResponse(true);
          ajaxAppender.setSendAllOnUnload(true);
          ajaxAppender.addHeader('X-Page-ID', page_id);

          // success callback for testing (disabled for default)
          if (loggerRequestCallback) {
            ajaxAppender.setRequestSuccessCallback(requestCallback);
          }

          // -------------------------------------------------------------------
          // setup layouts
          // -------------------------------------------------------------------
          patternLayout       = new log4javascript.PatternLayout('[%d{HH:mm:ss.SSS}] [%f{4}] [%-5p] [%-40c] [%f{1}:%f{2}] %m%n[%f{3}]');
          httpPostDataLayout  = new log4javascript.HttpPostDataLayout();
          xmlLayout           = new log4javascript.XmlLayout();
          jsonLayout          = new log4javascript.JsonLayout();
          nullLayout          = new log4javascript.NullLayout();
          simpleLayout        = new log4javascript.SimpleLayout();

          // Use the method getLineNumber() as the value for the 0th custom field
          patternLayout.setCustomField('file',    getCustomData);
          patternLayout.setCustomField('line',    getCustomData);
          patternLayout.setCustomField('path',    getCustomData);
          patternLayout.setCustomField('id',      getCustomData);
          httpPostDataLayout.setCustomField('id', page_id);

          consoleAppender.setLayout(patternLayout);
          ajaxAppender.setLayout(httpPostDataLayout);

          // -------------------------------------------------------------------
          // setup log levels
          // -------------------------------------------------------------------
          if (environment == 'production') {
            log4javascript.getLogger('j1').setLevel(log4javascript.Level.WARN);
          }
          if (environment == 'development' || environment == 'devel' || environment == 'dev' || environment == 'test') {
            log4javascript.getLogger('j1').setLevel(log4javascript.Level.DEBUG);
          } else {
            // fallback settings
            log4javascript.getLogger('j1').setLevel(log4javascript.Level.WARN);
          }

          // -------------------------------------------------------------------
          // setup (root) loggers
          // -------------------------------------------------------------------
          log4javascript.getRootLogger().addAppender(consoleAppender);

          if (ajaxAppenderOptions.enabled) {
            log4javascript.getRootLogger().addAppender(ajaxAppender);
            logger.info('ajax appender detected as: enabled');
          } else {
            logger.info('ajax appender detected as: disabled');
          }

          _this.setState('finished');
          logger.info('state: ' + _this.getState());
          logger.info('module initialized successfully');

          return true;
        }
      }, 25); // END 'mode detected'

    }, // END init

    // -------------------------------------------------------------------------
    // messageHandler: MessageHandler for J1 NAV module
    // manage messages (paylods) send from other J1 modules
    // -------------------------------------------------------------------------
    messageHandler: function (sender, message) {
      var json_message = JSON.stringify(message, undefined, 2);

      logText = 'received message from ' + sender + ': ' + json_message;
      logger.debug(logText);

      // -----------------------------------------------------------------------
      //  process commands|actions
      // -----------------------------------------------------------------------
      if (message.type === 'command' && message.action === 'module_initialized') {
        //
        // place handling of command|action here
        //
        logger.info(message.text);
      }

      //
      // place handling of other command|action here
      //

      return true;
    }, // END messageHandler

    // -------------------------------------------------------------------------
    // setState
    // set the current (processing) state of the module
    // -------------------------------------------------------------------------
    setState: function (stat) {
      j1.adapter.logger.state = stat;
    }, // END setState

    // -------------------------------------------------------------------------
    // getState
    // return ;urns the current (processing) state of the module
    // -------------------------------------------------------------------------
    getState: function () {
      return j1.adapter.logger.state;
    } // END state

  }; // END return
})(j1, window);

{% endcapture %}
{% if production %}
  {{ cache | minifyJS }}
{% else %}
  {{ cache | strip_empty_lines }}
{% endif %}
{% assign cache = nil %}
