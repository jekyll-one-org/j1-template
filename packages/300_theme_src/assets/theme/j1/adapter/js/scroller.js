---
regenerate:                             true
---

{%- capture cache -%}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/adapter/js/scroller.js
 # Liquid template to adapt the J1 Scroller jQuery plugin
 #
 # Product/Info:
 # https://jekyll.one
 # Copyright (C) 2023-2025 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # For details, see: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
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
{% assign asset_path        = "/assets/theme/j1" %}

{% comment %} Process YML config data
================================================================================ {% endcomment %}

{% comment %} Set config files
-------------------------------------------------------------------------------- {% endcomment %}
{% assign template_config   = site.data.j1_config %}
{% assign blocks            = site.data.blocks %}
{% assign modules           = site.data.modules %}

{% comment %} Set config data
-------------------------------------------------------------------------------- {% endcomment %}
{% assign scroller_defaults = modules.defaults.scroller.defaults %}
{% assign scroller_settings = modules.scroller.settings %}

{% comment %} Set config options (correct)
--------------------------------------------------------------------------------
{% assign scroller_options  = scroller_defaults | merge: scroller_settings %}
--------------------------------------------------------------------------------
{% endcomment %}

{% comment %} Set config options (settings only)
TODO: Check|Fix the (Liquid) merge issue for scroller_options
-------------------------------------------------------------------------------- {% endcomment %}
{% assign scroller_options  = scroller_settings %}

{% comment %} Detect prod mode
-------------------------------------------------------------------------------- {% endcomment %}
{% assign production = false %}
{% if environment == 'prod' or environment == 'production' %}
  {% assign production = true %}
{% endif %}

/*
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/adapter/js/scroller.js
 # J1 Adapter for the J1 Scroller jQuery plugin
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2023-2025 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # For details, see: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 # -----------------------------------------------------------------------------
 #  Adapter generated: {{site.time}}
 # -----------------------------------------------------------------------------
*/

// -----------------------------------------------------------------------------
// ESLint shimming
// -----------------------------------------------------------------------------
/* eslint indent: "off"                                                       */
// -----------------------------------------------------------------------------
"use strict";
j1.adapter.scroller = ((j1, window) => {

  const isDev = (j1.env === "development" || j1.env === "dev") ? true : false;

  {% comment %} Set global variables
  ------------------------------------------------------------------------------ {% endcomment %}
  var environment   = '{{environment}}';
  var language      = '{{site.language}}';
  var user_agent    = platform.ua;
  var state         = 'not_started';

  var scrollerDefaults;
  var scrollerSettings;
  var scrollerOptions;
  var lastPageInfo;

  var _this;
  var logger;
  var logText;

  // date|time
  var startTime;
  var endTime;
  var startTimeModule;
  var endTimeModule;
  var timeSeconds;

  // ---------------------------------------------------------------------------
  // main
  // ---------------------------------------------------------------------------
  return {

    // -------------------------------------------------------------------------
    // adapter initializer
    // -------------------------------------------------------------------------
    init: (options) => {

      // -----------------------------------------------------------------------
      // default module settings
      // -----------------------------------------------------------------------
      var settings = $.extend({
        module_name: 'j1.adapter.scroller',
        generated:   '{{site.time}}'
      }, options);

      // -----------------------------------------------------------------------
      // global variable settings
      // -----------------------------------------------------------------------
      _this   = j1.adapter.scroller;
      logger  = log4javascript.getLogger('j1.adapter.scroller');

      // load module DEFAULTS|CONFIG
      scrollerDefaults = $.extend({}, {{scroller_defaults | replace: 'nil', 'null' | replace: '=>', ':' }});
      scrollerSettings = $.extend({}, {{scroller_settings | replace: 'nil', 'null' | replace: '=>', ':' }});
      scrollerOptions  = $.extend(true, {}, scrollerDefaults, scrollerSettings);

      // initialize state flag
      _this.setState('started');
      logger.debug('state: ' + _this.getState());
      logger.info('module is being initialized');

      // -----------------------------------------------------------------------
      // module initializer
      // -----------------------------------------------------------------------
      var dependencies_met_page_ready = setInterval(() => {
        var pageState       = $('#content').css("display");
        var pageVisible     = (pageState === 'block') ? true: false;
        var j1CoreFinished  = (j1.getState() === 'finished') ? true : false;
        // var atticFinished   = (j1.adapter.attic.getState() == 'finished') ? true : false;

        if (j1CoreFinished && pageVisible) {
          startTimeModule = Date.now();

          _this.setState('started');
          logger.debug('set module state to: ' + _this.getState());
          logger.info('initializing module: started');

          logger.info('initialize scrollers');
          _this.generate_scrollers();

          clearInterval(dependencies_met_page_ready);
        } // END if pageVisible
      }, 10); // END dependency_met_page_ready
    }, // END init

    // -------------------------------------------------------------------------
    // generate_scrollers()
    // generate scrollers configured|enabled
    // -------------------------------------------------------------------------
    generate_scrollers: () => {

      var wrapper_dependencies = {};
      var dependency;

      {% comment %} generate scrollers of type 'infiniteScroll'
      -------------------------------------------------------------------------- {% endcomment %}

      {% for item in scroller_options.scrollers %} {% if item.scroller.enabled %}
      logger.info('scroller {{item.scroller.id}} is being initialized on wrapper: {{item.scroller.container}}');

      // create dynamic loader variable to setup
      dependency = 'dependency_met_wrapper_ready_{{item.scroller.container}}';
      wrapper_dependencies[dependency] = '';

      wrapper_dependencies['dependency_met_wrapper_ready_{{item.scroller.container}}'] = setInterval(() => {
        var scrollerID     = document.getElementById('{{item.scroller.container}}');
        var scrollerExists = (scrollerID !== undefined || scrollerID !== null ) ? true: false;

        // process the wrapper if extsts
        if (scrollerExists) {
          {% if item.scroller.type == 'infiniteScroll' %}

          {% assign scroller_id     = item.scroller.id %}
          {% assign scroller_type   = item.scroller.type %}
          {% assign container       = item.scroller.container %}
          {% assign pagePath        = item.scroller.pagePath  %}
          {% assign elementScroll   = item.scroller.elementScroll %}
          {% assign scrollOffset    = item.scroller.scrollOffset %}
          {% assign lastPage        = item.scroller.lastPage %}
          {% assign infoLastPage    = item.scroller.infoLastPage %}
          {% assign lastPageInfo_en = item.scroller.lastPageInfo_en %}
          {% assign lastPageInfo_de = item.scroller.lastPageInfo_de %}

          var container = '#' + '{{container}}';
          var pagePath  = '{{pagePath}}';

          var dependencies_met_container_exists = setInterval(() => {
            var containerExists = ($(container).length) ? true : false;

              if (containerExists) {
                // create an (scroller) instance of infiniteScroll
                logText = 'scroller of type {{item.scroller.type}} initialized on: ' + '{{scroller_id}}';
                logger.info(logText);

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

                $(container).scroller({
                  id:             '{{scroller_id}}',
                  type:           '{{scroller_type}}',
                  pagePath:       '{{pagePath}}',
                  elementScroll:  {{elementScroll}},
                  scrollOffset:   {{scrollOffset}},
                  lastPage:       {{lastPage}},
                  infoLastPage:   {{infoLastPage}},
                  lastPageInfo:   lastPageInfo,
                });

                _this.setState('finished');
                logger.debug('state: ' + _this.getState());
                logger.info('module initialized successfully');

                endTimeModule = Date.now();
                logger.info('module initializing time: ' + (endTimeModule-startTimeModule) + 'ms');

                clearInterval(dependencies_met_container_exists);
            } // END containerExists
          }, 10); // END dependencies_met_container_exists

          {% endif %}

          {% if item.scroller.type == 'showOnScroll' %}

          {% assign scroller_id     = item.scroller.id %}
          {% assign scroller_type   = item.scroller.type %}
          {% assign container       = item.scroller.container %}
          {% assign showDelay       = item.scroller.showDelay %}
          {% assign scrollOffset    = item.scroller.scrollOffset  %}

          var container = '#' + '{{container}}';

          // scroller_id: {{ scroller_id }}
          logText = 'scroller of type {{item.scroller.type}} initialized on: ' + '{{scroller_id}}';
          logger.info(logText);

          // create an (scroller) instance of 'showOnScroll'
          if ($(container).length) {
            $(container).scroller({
              id:             '{{scroller_id}}',
              type:           '{{scroller_type}}',
              container:      '{{container}}',
              showDelay:      {{showDelay}},
              scrollOffset:   {{scrollOffset}},
            });
          }

          {% endif %}
          // END scroller_id: {{ scroller_id }}

          clearInterval(wrapper_dependencies['dependency_met_wrapper_ready_{{item.scroller.container}}']);
        } // END if scrollerExists
      }, 10); // END dependencies_met_scroller_exists
      {% endif %} {% endfor %}

    }, // END generate scrollers

    // -------------------------------------------------------------------------
    // messageHandler()
    // manage messages send from other J1 modules
    // -------------------------------------------------------------------------
    messageHandler: (sender, message) => {
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
    // setState()
    // sets the current (processing) state of the module
    // -------------------------------------------------------------------------
    setState: (stat) => {
      _this.state = stat;
    }, // END setState

    // -------------------------------------------------------------------------
    // getState()
    // Returns the current (processing) state of the module
    // -------------------------------------------------------------------------
    getState: () => {
      return _this.state;
    } // END getState

  }; // END main (return)
})(j1, window);

{%- endcapture -%}

{%- if production -%}
  {{ cache|minifyJS }}
{%- else -%}
  {{ cache|strip_empty_lines }}
{%- endif -%}

{%- assign cache = false -%}
