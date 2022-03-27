---
regenerate:                             false
---

{% capture cache %}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/nbinteract.js
 # Liquid template to adapt nbinteract
 #
 # Product/Info:
 # https://jekyll.one
 # Copyright (C) 2022 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # For details, see https://jekyll.one
 # -----------------------------------------------------------------------------
 # Test data:
 #  {{ liquid_var | debug }}
 # -----------------------------------------------------------------------------
{% endcomment %}

/*
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/nbinteract.js
 # J1 Adapter for nbinteract
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2022 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # For details, see https://jekyll.one
 # -----------------------------------------------------------------------------
 #  Adapter generated: {{site.time}}
 # -----------------------------------------------------------------------------
*/

// -----------------------------------------------------------------------------
// ESLint shimming
// -----------------------------------------------------------------------------
/* eslint indent: "off"                                                       */
// -----------------------------------------------------------------------------
'use strict';
j1.adapter.nbinteract = (function (j1, window) {

  {% comment %} Set global variables
  ------------------------------------------------------------------------------ {% endcomment %}
  var environment   = '{{environment}}';
  var moduleOptions = {};
  var _this;
  var interact;
  var logger;
  var logText;

  // ---------------------------------------------------------------------------
  // Helper functions
  // ---------------------------------------------------------------------------

  // ---------------------------------------------------------------------------
  // Main object
  // ---------------------------------------------------------------------------
  return {

    // -------------------------------------------------------------------------
    // Initializer
    // -------------------------------------------------------------------------
    init: function (options) {

      // -----------------------------------------------------------------------
      // Default module settings
      // -----------------------------------------------------------------------
      var settings = $.extend({
        module_name: 'j1.adapter.nbinteract',
        generated:   '{{site.time}}'
      }, options);

      // -----------------------------------------------------------------------
      // Global variable settings
      // -----------------------------------------------------------------------
      _this   = j1.adapter.nbinteract;
      logger  = log4javascript.getLogger('j1.adapter.nbinteract');

      var dependencies_met_j1_finished = setInterval(function() {
        if (j1.getState() == 'finished') {

          // initialize state flag
          _this.setState('started');
          logger.debug('\n' + 'state: ' + _this.getState());

          var log_text = '\n' + 'nbinteract is being initialized';
          logger.info(log_text);

          // nbInteract initializer
          //
          var coreLogger = log4javascript.getLogger('nbinteract.core');
//        interact = new window.NbInteract({
          interact = new NbInteract({
            spec: 'jekyll-one/7818823efbfa538c35cc811da9e72296/master',
            baseUrl: 'https://mybinder.org',
            provider: 'gist',
            logger: coreLogger,
          });

          interact.prepare();
          window.interact = interact;

          // MathJax initializer (MathJax currently NOT used)
          //
          // MathJax.Hub.Config({
          //     tex2jax: {
          //         inlineMath: [ ['$','$'], ["\\(","\\)"] ],
          //         displayMath: [ ['$$','$$'], ["\\[","\\]"] ],
          //         processEscapes: true,
          //         processEnvironments: true
          //     },
          //     // Center justify equations in code and markdown cells. Elsewhere
          //     // we use CSS to left justify single line equations in code cells.
          //     displayAlign: 'center',
          //     "HTML-CSS": {
          //         styles: {'.MathJax_Display': {"margin": 0}},
          //         linebreaks: { automatic: true }
          //     }
          // });

          _this.setState('finished');
          logger.debug('\n' + 'state: ' + _this.getState());
          logger.info('\n' + 'initializing module finished');
          clearInterval(dependencies_met_j1_finished);
        } // END dependencies_met_j1_finished
      }, 25);

    }, // END init

    // -------------------------------------------------------------------------
    // messageHandler: MessageHandler for J1 CookieConsent module
    // Manage messages send from other J1 modules
    // -------------------------------------------------------------------------
    messageHandler: function (sender, message) {
      var json_message = JSON.stringify(message, undefined, 2);

      logText = '\n' + 'received message from ' + sender + ': ' + json_message;
      logger.debug(logText);

      // -----------------------------------------------------------------------
      //  Process commands|actions
      // -----------------------------------------------------------------------
      if (message.type === 'command' && message.action === 'module_initialized') {
        //
        // Place handling of command|action here
        //
        logger.info('\n' + message.text);
      }

      //
      // Place handling of other command|action here
      //

      return true;
    }, // END messageHandler

    // -------------------------------------------------------------------------
    // setState()
    // Sets the current (processing) state of the module
    // -------------------------------------------------------------------------
    setState: function (stat) {
      _this.state = stat;
    }, // END setState

    // -------------------------------------------------------------------------
    // getState()
    // Returns the current (processing) state of the module
    // -------------------------------------------------------------------------
    getState: function () {
      return _this.state;
    } // END getState

  }; // END return
})(j1, window);

{% endcapture %}
{% if production %}
  {{ cache | minifyJS }}
{% else %}
  {{ cache | strip_empty_lines }}
{% endif %}
{% assign cache = nil %}
