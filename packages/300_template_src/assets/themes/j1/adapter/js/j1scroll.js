---
regenerate:                             true
---

{% capture cache %}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/j1Scroll.js
 # Liquid template to adapt j1Scroll
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

      // -----------------------------------------------------------------------
      // globals
      // -----------------------------------------------------------------------
      _this   = j1.adapter.j1Scroll;
      logger  = log4javascript.getLogger('j1.adapter.j1Scroll');

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

      // -----------------------------------------------------------------------
      // j1Scroll initializer
      // -----------------------------------------------------------------------
      var log_text = '\n' + 'j1Scroll is being initialized';
      logger.info(log_text);

      var dependencies_met_page_ready = setInterval (function (options) {
        if (j1.getState() === 'finished') {
          var log_text = '\n' + 'j1Scroll is being initialized';
          logger.info(log_text);

          var postWrapperId = '#home_news_panel-scroll-group';
          var paginatePath  = '/assets/data/news_panel_posts/page';

          // status:              '.page-scroll-last',
          // firstPage:            2,
          // onInit:               function(){},				                        // Callback after plugin has loaded
          // onBeforeLoad:         function(link){},	                          // Callback before new content is loaded
          // onAfterLoad:          function(html){}	                            // Callback after new content has been loaded

          $(postWrapperId).j1Scroll({
            path:                 paginatePath,
            elementScroll:        false,
            scrollThreshold:      300,
            lastPage:             4,
            infoLastPage:         true,
          });

          $('.list-group').on( 'load.j1Scroll', function( event, body, path, response ) {
            var logger = log4javascript.getLogger('j1.adapter.infiniteScroll');
            var log_text = `\n loaded data from path: ${path}`;
            logger.info(log_text);

            var log_text = "\n initialize backdrops on load";
            logger.info(log_text);

            // initialize backdrops
            j1.core.createDropCap();

          });

          $('.list-group').on( 'request.j1Scroll', function( event, path, fetchPromise ) {
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
