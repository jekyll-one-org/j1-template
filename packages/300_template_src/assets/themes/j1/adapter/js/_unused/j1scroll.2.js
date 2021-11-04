---
regenerate:                             true
---

{% capture cache %}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/scroller.js
 # Liquid template to adapt scroller plugin
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
{% assign scroll_settings   = modules.scroller.settings %}

{% comment %} Set config options (settings only)
-------------------------------------------------------------------------------- {% endcomment %}
{% assign scroll_options    = scroll_settings %}

{% assign production = false %}
{% if environment == 'prod' or environment == 'production' %}
  {% assign production = true %}
{% endif %}

/*
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/scroller.js
 # J1 Adapter for scroller module
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
j1.adapter['scroller'] = (function (j1, window) {

  {% comment %} Set global variables
  ------------------------------------------------------------------------------ {% endcomment %}
  var environment   = '{{environment}}';
  var language      = '{{site.language}}';
  var user_agent    = platform.ua;
  var moduleOptions = {};
  var _this;
  var lastPageInfo;
  var logger;
  var logText;

  // ---------------------------------------------------------------------------
  // main object
  // ---------------------------------------------------------------------------
  return {

    // -------------------------------------------------------------------------
    // init()
    // adapter initializer
    // -------------------------------------------------------------------------
    init: function (options) {
      {% comment %} Set global variables
      -------------------------------------------------------------------------- {% endcomment %}
      _this = j1.adapter.scroller;
      logger = log4javascript.getLogger('j1.adapter.scroller');

      // initialize state flag
      _this.setState('started');
      logger.info('\n' + 'state: ' + _this.getState());
      logger.info('\n' + 'module is being initialized');

      // -----------------------------------------------------------------------
      // default module settings
      // -----------------------------------------------------------------------
      var settings = $.extend({
        module_name: 'j1.adapter.',
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

      _this.generate_scrollers();

      _this.setState('finished');
      logger.info('\n' + 'state: ' + _this.getState());
      logger.info('\n' + 'module initialized successfully');
    }, // END init

    // -----------------------------------------------------------------------
    // generate_scrollers()
    // generate scrollers configured and enabled
    // -----------------------------------------------------------------------
    generate_scrollers: function () {
      logger = log4javascript.getLogger('j1.adapter.');

      var log_text = '\n' + ' is being initialized';
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
          {% assign lastPageInfo_en = item.scroller.lastPageInfo_en %}
          {% assign lastPageInfo_de = item.scroller.lastPageInfo_de %}

          // scroller_id: {{ scroller_id }}
          var log_text = '\n' + ' is being initialized on: ' + '{{scroller_id}}';
          logger.info(log_text);

          var container = '#' + '{{container}}';
          var pagePath  = '{{path}}';

          if (language === 'en') {
            lastPageInfo =  '<div class="page-scroll-last"><p class="infinite-scroll-last">';
            lastPageInfo += '{{lastPageInfo_en|strip_newlines}}';
            lastPageInfo += '</p></div>';
          } else if (language === 'de') {
            lastPageInfo =  '<div class="page-scroll-last"><p class="infinite-scroll-last">';
            lastPageInfo += '{{lastPageInfo_de|strip_newlines}}';
            lastPageInfo += '</p></div>';
          } else {
            lastPageInfo =  '<div class="page-scroll-last"><p class="infinite-scroll-last">';
            lastPageInfo += '{{lastPageInfo_en|strip_newlines}}';
            lastPageInfo += '</p></div>';
          }

          // Create an  instance if container exists
          if ($(container).length) {
            $(container).scroller({
              path:                 pagePath,
              elementScroll:        {{elementScroll}},
              scrollOffset:         {{scrollOffset}},
              lastPage:             {{lastPage}},
              infoLastPage:         {{infoLastPage}},
              lastPageInfo:         lastPageInfo,
            });
          }

          // END scroller_id: {{ scroller_id }}
          {% endif %} {% endfor %}
          clearInterval(dependencies_met_page_ready);
        }
      });
      // END generate_scrollers
    },

    // -------------------------------------------------------------------------
    // messageHandler()
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
