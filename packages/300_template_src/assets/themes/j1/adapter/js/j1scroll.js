---
regenerate:                             true
---

{% capture cache %}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/j1Scroll.js
 # Liquid template to adapt j1Scroll plugin
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
{% assign asset_path        = "/assets/themes/j1" %}

{% comment %} Process YML config data
================================================================================ {% endcomment %}

{% comment %} Set config files
-------------------------------------------------------------------------------- {% endcomment %}
{% assign template_config   = site.data.j1_config %}
{% assign blocks            = site.data.blocks %}
{% assign modules           = site.data.modules %}

{% comment %} Set config data (settings only)
-------------------------------------------------------------------------------- {% endcomment %}
{% assign scroll_settings   = modules.j1scroll.settings %}

{% comment %} Set config options (settings only)
-------------------------------------------------------------------------------- {% endcomment %}
{% assign scroll_options    = scroll_settings %}

/*
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/j1Scroll.js
 # J1 Adapter for j1Scroll
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
j1.adapter['j1Scroll'] = (function (j1, window) {

  {% comment %} Set global variables
  ------------------------------------------------------------------------------ {% endcomment %}
  var environment   = '{{environment}}';
  var user_agent    = platform.ua;
  var moduleOptions = {};
  var _this;
  var logger;
  var logText;

  // ---------------------------------------------------------------------------
  // Helper functions
  // ---------------------------------------------------------------------------
  function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
      if ((new Date().getTime() - start) > milliseconds){
        break;
      }
    }
    return;
  }

  // ---------------------------------------------------------------------------
  // Main object
  // ---------------------------------------------------------------------------
  return {

    // -------------------------------------------------------------------------
    // Initializer
    // -------------------------------------------------------------------------
    init: function (options) {
      {% comment %} Set global variables
      -------------------------------------------------------------------------- {% endcomment %}
      _this = j1.adapter.j1Scroll;
      logger = log4javascript.getLogger('j1.adapter.j1Scroll');

      // initialize state flag
      _this.setState('started');
      logger.info('\n' + 'state: ' + _this.getState());
      logger.info('\n' + 'module is being initialized');

      // -----------------------------------------------------------------------
      // Default module settings
      // -----------------------------------------------------------------------
      var settings = $.extend({
        module_name: 'j1.adapter.j1Scroll',
        generated:   '{{site.time}}'
      }, options);

      {% comment %} Load module config from yml data (disabled)
      --------------------------------------------------------------------------
      // Load  module DEFAULTS|CONFIG
      //
      /* eslint-disable */
      moduleOptions = $.extend({}, {{scroll_options | replace: '=>', ':' | replace: 'nil', '""'}});
      /* eslint-enable */

      if (typeof settings !== 'undefined') {
        moduleOptions = j1.mergeData(moduleOptions, settings);
      }

      // _this.initialize(moduleOptions);
      -------------------------------------------------------------------------- {% endcomment %}

      _this.initialize();

      _this.setState('finished');
      logger.info('\n' + 'state: ' + _this.getState());
      logger.info('\n' + 'module initialized successfully');
    }, // END init

    // -----------------------------------------------------------------------
    // Generate scrollers configured/enabled
    // -----------------------------------------------------------------------
    initialize: function () {
      logger = log4javascript.getLogger('j1.adapter.j1Scroll');

      var log_text = '\n' + 'j1Scroll is being initialized';
      logger.info(log_text);

      // START generate scrollers
      var dependencies_met_page_ready = setInterval (function (options) {
        if (j1.getState() === 'finished') {

          {% for item in scroll_options.scrollers %} {% if item.scroller.enabled %}

          {% assign scroller_id     = item.scroller.id %}
          {% assign container       = item.scroller.container %}
          {% assign path            = item.scroller.path  %}
          {% assign elementScroll   = item.scroller.elementScroll %}
          {% assign scrollOffset    = item.scroller.scrollOffset %}
          {% assign lastPage        = item.scroller.lastPage %}
          {% assign infoLastPage    = item.scroller.infoLastPage %}

          // scroller_id: {{ scroller_id }}
          var log_text = '\n' + 'j1Scroll is being initialized on: ' + '{{scroller_id}}';
          logger.info(log_text);

          {% comment %} Unused options
          ----------------------------------------------------------------------
          // status:              '.page-scroll-last',
          // firstPage:            2,
          // onInit:               function(){},				                        // Callback after plugin has loaded
          // onBeforeLoad:         function(link){},	                          // Callback before new content is loaded
          // onAfterLoad:          function(html){}	                            // Callback after new content has been loaded
          ---------------------------------------------------------------------- {% endcomment %}

          var container = '#' + '{{container}}';
          var pagePath  = '{{path}}';

          // Create an j1Scroll instance if container exists
          if ($(container).length) {
            $(container).j1Scroll({
              path:                 pagePath,
              elementScroll:        {{elementScroll}},
              scrollOffset:         {{scrollOffset}},
              lastPage:             {{lastPage}},
              infoLastPage:         {{infoLastPage}},
            });
          }

          {% comment %} Unused callbacks (disabled)
          ----------------------------------------------------------------------
          // $('.list-group').on( 'load.j1Scroll', function( event, body, path, response ) {
          //   var logger = log4javascript.getLogger('j1.adapter.infiniteScroll');
          //   var log_text = `\n loaded data from path: ${path}`;
          //   logger.info(log_text);
          //
          //   var log_text = "\n initialize backdrops on load";
          //   logger.info(log_text);
          //
          //   // initialize backdrops
          //   j1.core.createDropCap();
          //
          // });
          //
          // $('.list-group').on( 'request.j1Scroll', function( event, path, fetchPromise ) {
          //   var logger = log4javascript.getLogger('j1.adapter.infiniteScroll');
          //   var log_text = `\n request for the next page to be loaded from path: ${path}`;
          //   logger.info(log_text);
          // });
          ---------------------------------------------------------------------- {% endcomment %}

          // END scroller_id: {{ scroller_id }}
          {% endif %} {% endfor %}
          clearInterval(dependencies_met_page_ready);
        }
      });
      // END generate scrollers
    },

    // -------------------------------------------------------------------------
    // messageHandler: MessageHandler for j1Scroll module
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
