---
regenerate:                             false
---

{% capture cache %}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/rtable.js
 # Liquid template to adapt rtable
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

/*
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/rtable.js
 # J1 Adapter for rtable
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2021 Juergen Adams
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

{% comment %} Main
-------------------------------------------------------------------------------- {% endcomment %}
j1.adapter['rtable'] = (function (j1, window) {

  {% comment %} Set global variables
  ------------------------------------------------------------------------------ {% endcomment %}
  var environment   = '{{environment}}';
  var moduleOptions = {};
  var _this;
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
      // globals
      // -----------------------------------------------------------------------
      _this   = j1.adapter.rtable;
      logger  = log4javascript.getLogger('j1.adapter.rtable');

      // initialize state flag
      _this.setState('started');
      logger.info('state: ' + _this.getState());
      logger.info('module is being initialized');

      // -----------------------------------------------------------------------
      // Default module settings
      // -----------------------------------------------------------------------
      var settings = $.extend({
        module_name: 'j1.adapter.rtable',
        generated:   '{{site.time}}'
      }, options);

      // -----------------------------------------------------------------------
      // rtable initializer
      // -----------------------------------------------------------------------
      var log_text = 'rtable is being initialized';
      logger.info(log_text);

      // Add data attribute for tablesaw to all tables of a page
      // as Asciidoctor has NO option to pass 'data attributes'
      // See: https://stackoverflow.com/questions/50600405/how-to-add-custom-data-attributes-with-asciidoctor
      //
      $('table').each(function(){
        var curTable = $(this);
        // jadams, 2020-09-16: class 'rtable' indicate use of 'tablesaw'
        if ($(curTable).hasClass('rtable')) {
          // jadams, 2020-09-17: add BS responsive class in case of an overflow
          // jadams, 2020-11-21: BS responsive class disabled, bcause the
          // table doesn't stretch full page width
          //$(curTable).addClass('table-responsive')
          // jadams, 2020-09-16: add needed CSS class/attribute for tablesaw
          $(curTable).addClass('tablesaw');
          $(curTable).attr('data-tablesaw-mode','stack');
        }
      });

      var dependencies_met_j1_finished = setInterval(function() {
        if (j1.getState() == 'finished') {

        	Tablesaw.init();

          _this.setState('finished');
          logger.info('state: ' + _this.getState());

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

      logText = 'received message from ' + sender + ': ' + json_message;
      logger.debug(logText);

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
