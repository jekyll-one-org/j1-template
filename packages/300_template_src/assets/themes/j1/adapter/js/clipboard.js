---
regenerate:                             false
---

{% capture cache %}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/clipboard.js
 # Liquid template to adapt Clipboard for J1 Template
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
 # NOTE:
 # -----------------------------------------------------------------------------
{% endcomment %}

{% comment %} Set config files
-------------------------------------------------------------------------------- {% endcomment %}

{% comment %} Set config data
-------------------------------------------------------------------------------- {% endcomment %}
{% assign environment   = site.environment %}


{% assign production = false %}
{% if environment == 'prod' or environment == 'production' %}
  {% assign production = true %}
{% endif %}

/*
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/clipboard.js
 # JS Adapter for Clipboard
 #
 # Product/Info:
 # {{site.data.j1_config.theme_author_url}}
 #
 # Copyright (C) 2021 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # For details, see {{site.data.j1_config.theme_author_url}}
 # -----------------------------------------------------------------------------
 # NOTE:
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

j1.adapter['clipboard'] = (function (j1, window) {

  // ---------------------------------------------------------------------------
  // globals
  // ---------------------------------------------------------------------------
  var environment   = '{{environment}}';
  var moduleOptions = {};
  var logger;
  var logText;
  var _this;
  var clipboardJS;

  // ---------------------------------------------------------------------------
  // main object
  // ---------------------------------------------------------------------------
  return {

    // -------------------------------------------------------------------------
    // module initializer
    // -------------------------------------------------------------------------
    init: function (options) {

      // -----------------------------------------------------------------------
      // globals
      // -----------------------------------------------------------------------
      _this   = j1.adapter.clipboard;
      logger  = log4javascript.getLogger('j1.adapter.clipboard');

      // -----------------------------------------------------------------------
      // defaults
      // -----------------------------------------------------------------------
      var settings  = $.extend({
        module_name: 'j1.adapter.clipboard',
        generated:   '{{site.time}}'
      }, options);

      // initialize state flag
      _this.state = 'started';
      logText = 'initialization: started';
      logger.info(logText);

      // initialize ClipboardJS if page is loaded
      var dependencies_met_j1_finished = setInterval(function() {
        if ( j1.getState() == 'finished' ) {
          logText = 'create clipboard';
          logger.info(logText);

          clipboardJS = new ClipboardJS('.btn-clipboard', {
            target: function target(trigger) {
              return trigger.parentNode.nextElementSibling;
            }
          });

          _this.initClipButtons();
          _this.initEventHandler(clipboardJS);

          clearInterval(dependencies_met_j1_finished);
          logger.info('met dependencies for: j1');
          _this.setState('finished');
          logger.info('state: ' + _this.getState());
          logger.info('module initialized successfully');
        }
      }, 25); // END dependencies_met_j1_finished
    },

    // -------------------------------------------------------------------------
    // initClipboard
    // Create copy-to-clipboard for all pages
    // -------------------------------------------------------------------------
    initClipButtons: function () {
      // insert copy to clipboard button before all elements having a
      // class of ".highlight" assigned to (e.g. Asciidoc source blocks)
      $('.highlight').each(function () {
        // Check if no clipboard should be applied
        var isNoClip = $(this).closest('.noclip');
        if ( isNoClip.length == 0) {
          var btnHtml = '<div class="j1-clipboard"><span class="btn-clipboard j1-tooltip" data-toggle="tooltip" data-placement="left" title="Copy to clipboard">Copy</span></div>';
          $(this).before(btnHtml);
          $('.btn-clipboard').tooltip();
        }
      });
    }, // END initClipboard

    // -------------------------------------------------------------------------
    // Event handler
    // -------------------------------------------------------------------------
    initEventHandler: function (clipboard) {
      // Manage clipboard events
      clipboard.on('success', function (e) {
        $(e.trigger).attr('title', 'copied!').tooltip('_fixTitle').tooltip('show').attr('title', 'Copy to clipboard').tooltip('_fixTitle');
        var logger = log4javascript.getLogger('j1.initClipboard');
        var logText = 'initialization copy-to-clipboard sucessfull';
        logger.debug(logText);
        /* Cleanup clipped data for trailing numbers */
        var splitted = e.text.split('\n');
        var concat;
        var i;
        for (i=0; i<splitted.length; i++) {
          concat += splitted[i].replace(/^\s+\d+/, '');
        }
        e.clearSelection();
      });
      clipboard.on('error', function (e) {
        var fallbackMsg = /Mac/i.test(navigator.userAgent) ? 'press \u2318 to copy' : 'press ctrl-c to copy';
        logger = log4javascript.getLogger('j1.initClipboard');
        logText = 'initialization copy-to-clipboard failed, fallback used.';
        logger.warn(logText);
        $(e.trigger).attr('title', fallbackMsg).tooltip('_fixTitle').tooltip('show').attr('title', 'copy to clipboard').tooltip('_fixTitle');
      });
    },

    // -------------------------------------------------------------------------
    // messageHandler
    // Manage messages (paylods) send from other J1 modules
    // -------------------------------------------------------------------------
    messageHandler: function (sender, message) {
      // var json_message = JSON.stringify(message, undefined, 2);              // multiline
      var json_message = JSON.stringify(message);

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
      if (message.type === 'command' && message.action === 'status') {
        logger.info('messageHandler: received - ' + message.action);
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
