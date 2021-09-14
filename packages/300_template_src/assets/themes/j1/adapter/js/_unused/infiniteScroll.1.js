---
regenerate:                             true
---

{% capture cache %}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/infiniteScroll.js
 # Liquid template to adapt infiniteScroll
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
 # ~/assets/themes/j1/adapter/js/infiniteScroll.js
 # J1 Adapter for infiniteScroll
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
j1.adapter['infiniteScroll'] = (function (j1, window) {

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
      _this   = j1.adapter.infiniteScroll;
      logger  = log4javascript.getLogger('j1.adapter.infiniteScroll');

      // initialize state flag
      _this.setState('started');
      logger.info('\n' + 'state: ' + _this.getState());
      logger.info('\n' + 'module is being initialized');

      // -----------------------------------------------------------------------
      // Default module settings
      // -----------------------------------------------------------------------
      var settings = $.extend({
        module_name: 'j1.adapter.infiniteScroll',
        generated:   '{{site.time}}'
      }, options);

      // -----------------------------------------------------------------------
      // infiniteScroll initializer
      // -----------------------------------------------------------------------
      var log_text = '\n' + 'infiniteScroll is being initialized';
      logger.info(log_text);

      // Add data attribute for tablesaw to all tables of a page
      var dependencies_met_page_ready = setInterval (function (options) {
        var lastPage = 4;

        if ( j1.getState() === 'finished' ) {
          var logger = log4javascript.getLogger('j1.infiniteScroll');
          var log_text = '\n module infiniteScroll is being initialized';
          logger.info(log_text);

          function getPosts() {
            var pageNumber = ( this.loadCount + 1 ) + 1;                          // +1: offset for j1-paginator
            if ( pageNumber <= lastPage) {
              return `/assets/data/news_panel_posts/page${pageNumber}/index.html`;
            }
          }

          // jadams, 2021-09-12
          // added scrollOffset property !!!
          //
          var scrollOffset = 450 + 20;
          // var article_height = $('#home_news_panel-scroll-item').height();
          var article_height = document.getElementById('home_news_panel-scroll-item').clientHeight;
          var scrollThreshold = (article_height -200) * -1;

          $('#home_news_panel-scroll-group').infiniteScroll({
            path: getPosts,
            append: '#home_news_panel-scroll-item',
            elementScroll: true,
            history: false,
            scrollOffset: 100,
            checkLastPage: true,
            status: '.page-scroll-last',
          });

          $('.list-group').on( 'error.infiniteScroll', function( event, error, path, response ) {
            var logger = log4javascript.getLogger('j1.adapter.infiniteScroll');
            var log_text = `\n could not load next items: ${path}. ${error}`;
            logger.info(log_text);
          });

          $('.list-group').on( 'last.infiniteScroll', function( event, body, path ) {
            var logger = log4javascript.getLogger('j1.adapter.infiniteScroll');
            var log_text = `\n last page reached on ${path}`;
            logger.info(log_text);
          });

          $('.list-group').on( 'scrollThreshold.infiniteScroll', function( event ) {
            var logger = log4javascript.getLogger('j1.adapter.infiniteScroll');
            var log_text = '\n scroll position is less than scrollThreshold option distance';
            logger.info(log_text);
          });

          $('.list-group').on( 'load.infiniteScroll', function( event, body, path, response ) {
            var elm = document.getElementById("home_news_panel-scroll-group");
            var logger = log4javascript.getLogger('j1.adapter.infiniteScroll');
            var log_text = `\n loaded data from path: ${path}`;
            logger.info(log_text);

            var ww = $(window).width();
            var wh = $(window).height();

            var vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
            var vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)

            var article_height = $('#home_news_panel-scroll-item').height();

            // if (user_agent.includes('iPad') || user_agent.includes('Windows') || user_agent.includes('OS X')) {
            if (user_agent.includes('Windows') || !user_agent.includes('OS X')) {
              // on desktops, scroll the page to view appended elements
              //window.scrollTo(0,document.body.scrollHeight);
              window.scrollBy(0, article_height);
            }
          });

          $('.list-group').on( 'request.infiniteScroll', function( event, path, fetchPromise ) {
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
