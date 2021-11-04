---
regenerate:                             true
---

{% capture cache %}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/.js
 # Liquid template to adapt 
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

{% comment %} Set config data
-------------------------------------------------------------------------------- {% endcomment %}
{% assign scroll_settings   = modules.j1scroll.settings %}

{% comment %} Set config options
-------------------------------------------------------------------------------- {% endcomment %}
{% assign scroll_options    = scroll_settings %}


/*
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/.js
 # J1 Adapter for 
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
j1.adapter[''] = (function (j1, window) {

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

      // -----------------------------------------------------------------------
      // globals
      // -----------------------------------------------------------------------
      _this   = j1.adapter.;
      logger  = log4javascript.getLogger('j1.adapter.');

      // initialize state flag
      _this.setState('started');
      logger.info('\n' + 'state: ' + _this.getState());
      logger.info('\n' + 'module is being initialized');

      // -----------------------------------------------------------------------
      // Default module settings
      // -----------------------------------------------------------------------
      var settings = $.extend({
        module_name: 'j1.adapter.',
        generated:   '{{site.time}}'
      }, options);

      // -----------------------------------------------------------------------
      //  initializer
      // -----------------------------------------------------------------------
      var log_text = '\n' + ' is being initialized';
      logger.info(log_text);

      var dependencies_met_page_ready = setInterval (function (options) {
        if (j1.getState() === 'finished') {
          var log_text = '\n' + ' is being initialized';
          logger.info(log_text);

          var postWrapperId = '#home_news_panel-scroll-group';
          var paginatePath  = '/assets/data/news_panel_posts/page';

          // status:              '.page-scroll-last',
          // firstPage:            2,
          // onInit:               function(){},				                        // Callback after plugin has loaded
          // onBeforeLoad:         function(link){},	                          // Callback before new content is loaded
          // onAfterLoad:          function(html){}	                            // Callback after new content has been loaded

          $(postWrapperId).({
            path:                 paginatePath,
            elementScroll:        true,
            scrollThreshold:      300,
            lastPage:             4,
            infoLastPage:         true,
          });

          $('.list-group').on( 'load.', function( event, body, path, response ) {
            var logger = log4javascript.getLogger('j1.adapter.infiniteScroll');
            var log_text = `\n loaded data from path: ${path}`;
            logger.info(log_text);

            var log_text = "\n initialize backdrops on load";
            logger.info(log_text);

            // initialize backdrops
            j1.core.createDropCap();

          });

          $('.list-group').on( 'request.', function( event, path, fetchPromise ) {
            var logger = log4javascript.getLogger('j1.adapter.infiniteScroll');
            var log_text = `\n request for the next page to be loaded from path: ${path}`;
            logger.info(log_text);
          });

          clearInterval(dependencies_met_page_ready);
        }
      });
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
