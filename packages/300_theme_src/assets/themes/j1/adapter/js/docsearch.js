---
regenerate:                             true
---

{% capture cache %}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/docsearch.js
 # Liquid template to adapt the DocSearch module
 #
 # Product/Info:
 # https://jekyll.one
 # Copyright (C) 2023, 2024 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # For details, see: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE.md
 # -----------------------------------------------------------------------------
 # Test data:
 #  {{ liquid_var | debug }}
 #  docsearch_options:  {{ docsearch_options | debug }}
 # -----------------------------------------------------------------------------
{% endcomment %}

{% comment %} Liquid procedures
-------------------------------------------------------------------------------- {% endcomment %}

{% comment %} Set global settings
-------------------------------------------------------------------------------- {% endcomment %}
{% assign environment       = site.environment %}
{% assign asset_path        = "/assets/themes/j1" %}

{% comment %} Process YML config data
================================================================================ {% endcomment %}

{% comment %} Set config files
-------------------------------------------------------------------------------- {% endcomment %}
{% assign template_config    = site.data.j1_config %}
{% assign blocks             = site.data.blocks %}
{% assign modules            = site.data.modules %}

{% comment %} Set config data (settings only)
-------------------------------------------------------------------------------- {% endcomment %}
{% assign docsearch_defaults = modules.defaults.docsearch.defaults %}
{% assign docsearch_settings = modules.docsearch.settings %}

{% comment %} Set config options (settings only)
-------------------------------------------------------------------------------- {% endcomment %}
{% assign docsearch_options  = docsearch_defaults | merge: docsearch_settings %}

{% comment %} Variables
-------------------------------------------------------------------------------- {% endcomment %}
{% assign comments          = docsearch_options.enabled %}

{% comment %} Detect prod mode
-------------------------------------------------------------------------------- {% endcomment %}
{% assign production = false %}
{% if environment == 'prod' or environment == 'production' %}
  {% assign production = true %}
{% endif %}

/*
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/docsearch.js
 # J1 Adapter for the DocSearch module
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2023, 2024 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # For details, see: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE.md
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
j1.adapter.docsearch = (function (j1, window) {

{% comment %} Set global variables
-------------------------------------------------------------------------------- {% endcomment %}
var environment   = '{{environment}}';
var state         = 'not_started';
var cookie_names  = j1.getCookieNames();
var docsearchDefaults;
var docsearchSettings;
var docsearchOptions;
var docsearchModal;
var modal_container;
var user_consent;
var _this;
var logger;
var logText;

  // ---------------------------------------------------------------------------
  // Main object
  // ---------------------------------------------------------------------------
  return {

    // -------------------------------------------------------------------------
    // init()
    // initializer
    // -------------------------------------------------------------------------
    init: function () {

      // -----------------------------------------------------------------------
      // Default module settings
      // -----------------------------------------------------------------------
      docsearchDefaults = $.extend({}, {{docsearch_defaults | replace: 'nil', 'null' | replace: '=>', ':' }});
      docsearchSettings = $.extend({}, {{docsearch_settings | replace: 'nil', 'null' | replace: '=>', ':' }});
      docsearchOptions  = $.extend(true, {}, docsearchDefaults, docsearchSettings);

      _this  = j1.adapter.docsearch;
      logger = log4javascript.getLogger('j1.adapter.docsearch');

      _this.setState('started');
      logger.debug('\n' + 'state: ' + _this.getState());
      logger.info('\n' + 'module is being initialized');

      modal_container               = document.createElement('div');
      modal_container.id            = 'docsearch_container';
      modal_container.style.display = 'none';

      modal_container.setAttribute('class', 'modal fade');
      modal_container.setAttribute('tabindex', '-1');
      modal_container.setAttribute('role', 'dialog');
      modal_container.setAttribute('aria-labelledby', 'docsearch_container');

      document.body.append(modal_container);

      // -----------------------------------------------------------------------
      // initializer
      // -----------------------------------------------------------------------
      var dependencies_met_page_ready = setInterval (() => {
        var pageState       = $('#content').css("display");
        var pageVisible     = (pageState == 'block') ? true : false;
        var j1CoreFinished  = (j1.getState() == 'finished') ? true : false;
        var atticFinished   = (j1.adapter.attic.getState() == 'finished') ? true: false;

        if (j1CoreFinished && pageVisible && atticFinished) {

          user_consent = j1.readCookie(cookie_names.user_consent);
          if (!user_consent.personalization) {
            const docsSearchButton = '#quickLinksDocSearchButton';
            $(docsSearchButton).hide();
            return;
          }

          // -----------------------------------------------------------------
          // data loader
          // -----------------------------------------------------------------
          j1.loadHTML ({
            xhr_container_id:   'docsearch_container',
            xhr_data_path:      '/assets/data/docsearch/index.html',
            xhr_data_element:   'docsearch-modal-data' },
            'j1.adapter.docsearch',
            'null'
          );

          // -------------------------------------------------------------------
          // on 'show'
          // -------------------------------------------------------------------
          $('#docsearch_container').on('show.bs.modal', function () {
            //
            // place code here
            //
          }); // END modal on 'show'

          // -------------------------------------------------------------------
          // on 'shown'
          // -------------------------------------------------------------------
          $('#docsearch_container').on('shown.bs.modal', function () {
            //
            // place code here
            //
          }); // END modal on 'shown'

          // -------------------------------------------------------------------
          // on 'hidden' (close)
          // -------------------------------------------------------------------
          $('#docsearch_container').on('hidden.bs.modal', function () {
            //
            // do something here
            //
          }); // END modal on 'hidden'

          _this.setState('finished');
          logger.debug('\n' + 'state: ' + _this.getState());
          logger.info('\n' + 'module initialization finished');

          clearInterval(dependencies_met_page_ready);
        } // END if
      }, 10); // END dependencies_met_page_ready
    }, // END init

    // -------------------------------------------------------------------------
    // showDialog()
    // display the dialog
    // -------------------------------------------------------------------------
    showDialog: function () {
      logger.debug('\n' + "showDialog");

      $('#docsearch_container').modal({
        backdrop: 'static',
        keyboard: false
      });

      $('#docsearch_container').modal('show');

    }, // END showDialog

    // -------------------------------------------------------------------------
    // messageHandler()
    // manage messages send from other J1 modules
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
