---
regenerate:                             true
---

{%- capture cache -%}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/adapter/js/rtable.js
 # Liquid template to adapt rtable
 #
 # Product/Info:
 # https://jekyll.one
 # Copyright (C) 2023, 2024 Juergen Adams
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
{% assign rtable_defaults   = modules.defaults.rtable.defaults %}
{% assign rtable_settings   = modules.rtable.settings %}

{% comment %} Set config options
-------------------------------------------------------------------------------- {% endcomment %}
{% assign rtable_options    = rtable_defaults | merge: rtable_settings %}

{% comment %} Detect prod mode
-------------------------------------------------------------------------------- {% endcomment %}
{% assign production = false %}
{% if environment == 'prod' or environment == 'production' %}
  {% assign production = true %}
{% endif %}

/*
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/adapter/js/rtable.js
 # J1 Adapter for rtable
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2023, 2024 Juergen Adams
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
j1.adapter.rtable = ((j1, window) => {

  {% comment %} Set global variables
  ------------------------------------------------------------------------------ {% endcomment %}
  var environment   = '{{environment}}';
  var state         = 'not_started';
  var rtableDefaults;
  var rtableSettings;
  var rtableOptions;

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
  // helper functions
  // ---------------------------------------------------------------------------

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
        module_name: 'j1.adapter.rtable',
        generated:   '{{site.time}}'
      }, options);

      var bsMediaBreakpoints = {
        xs: 575,
        sm: 576,
        md: 768,
        lg: 992,
        xl: 1200
      };

      var breakpoint;

      // -----------------------------------------------------------------------
      // global variable settings
      // -----------------------------------------------------------------------
      _this   = j1.adapter.rtable;
      logger  = log4javascript.getLogger('j1.adapter.rtable');

      // Load  module DEFAULTS|CONFIG
      rtableDefaults = $.extend({}, {{rtable_defaults | replace: 'nil', 'null' | replace: '=>', ':' }});
      rtableSettings = $.extend({}, {{rtable_settings | replace: 'nil', 'null' | replace: '=>', ':' }});
      rtableOptions  = $.extend(true, {}, rtableDefaults, rtableSettings);

      // initialize state flag
      _this.setState('started');
      logger.debug('\n' + 'state: ' + _this.getState());
      logger.info('\n' + 'module is being initialized');

      // -----------------------------------------------------------------------
      // module initializer
      // -----------------------------------------------------------------------
      var dependency_met_page_ready = setInterval(() => {
        var pageState      = $('#content').css("display");
        var pageVisible    = (pageState === 'block') ? true : false;
        var j1CoreFinished = (j1.getState() === 'finished') ? true : false;

        if (j1CoreFinished && pageVisible) {
          startTimeModule = Date.now();

          _this.setState('started');
          logger.debug('\n' + 'set module state to: ' + _this.getState());
          logger.info('\n' + 'initializing module: started');

          // Add data attributes for tablesaw to all tables of a page
          // as Asciidoctor has NO option to pass 'data attributes'
          // See: https://stackoverflow.com/questions/50600405/how-to-add-custom-data-attributes-with-asciidoctor
          //
          $('table').each(function () {
            var curTable = $(this);
            var log_text;
            // jadams, 2020-09-16: class 'rtable' indicate use of 'tablesaw'
            if ($(curTable).hasClass('rtable')) {
              // add needed CSS class/attribute for tablesaw
              $(curTable).addClass('table');
              $(curTable).addClass('tablesaw');
              $(curTable).attr('data-tablesaw-mode', rtableOptions.rtable.mode);

              // Advanced mode NOT supported (mode stack only)
              //
              // $(curTable).attr('data-tablesaw-sortable', '');
              // $(curTable).attr('data-tablesaw-sortable-switch', '');
              // $(curTable).attr('data-tablesaw-minimap', '');
              // $(curTable).attr('data-tablesaw-mode-switch', '');

              Tablesaw.init(curTable, {
                breakpoint:   rtableOptions.rtable.breakpoint
              });

              // set initial state for all table/colgroup elements
              //
              breakpoint = bsMediaBreakpoints[rtableOptions.rtable.breakpoint];
              if (! breakpoint) {
                breakpoint = bsMediaBreakpoints['lg'];
              }

              if ($(window).width() < breakpoint) {
                log_text = '\n' + 'hide colgroups: ' + curTable.attr('id')
                curTable.find('colgroup').hide();
                logger.debug(log_text);
              } else {
                log_text = '\n' + 'show colgroup: ' + curTable.attr('id')
                curTable.find('colgroup').show();
                logger.debug(log_text);
              }
            } // END if hasClass rtable

            // add needed div element needed for BS to move the table found
            // for BS responsiveness
            //
            if ($(curTable).hasClass(/table-responsive/)) {
              // see: https://stackoverflow.com/questions/2596833/how-to-move-child-element-from-one-parent-to-another-using-jquery
              // see: https://github.com/NV/jquery-regexp-classes
              //
              const re                 = /table-responsive[-]*\w*/;
              const myID               = 'b-table-' + Math.floor(Math.random() * 10000) + 1;
              var myClasses            = $(curTable).attr("class");
              var responsiveClassFound = myClasses.match(re);
              var responsiveClass;

              if (responsiveClassFound) {
                responsiveClass = responsiveClassFound[0];
              } else {
                // failsafe
                log_text = '\n' + 'no matching responsive class found';
                logger.warn(log_text);
              }

              // remove responsive class from the table
              $(curTable).removeClass(/table-responsive[-]*\w+/);
              $(curTable).addClass('table');

              // add needed div element needed for BS
              $('<div>', {
                id: myID,
                class: responsiveClass
              }).insertBefore($(curTable));

              // move the table found for BS responsiveness
              $('#' + myID ).append($(curTable));
            } // END if hasClass 'table-responsive'
          });

          _this.setState('finished');
          logger.debug('\n' + 'state: ' + _this.getState());
          logger.info('\n' + 'initializing module: finished');

          endTimeModule = Date.now();
          logger.info('\n' + 'module initializing time: ' + (endTimeModule-startTimeModule) + 'ms');

          clearInterval(dependency_met_page_ready);
        } // END if pageVisible
      }, 10); // END dependency_met_page_ready
    }, // END init

    // -------------------------------------------------------------------------
    // messageHandler()
    // manage messages send from other J1 modules
    // -------------------------------------------------------------------------
    messageHandler: (sender, message) => {
      var json_message = JSON.stringify(message, undefined, 2);

      logText = '\n' + 'received message from ' + sender + ': ' + json_message;
      logger.debug(logText);

      // -----------------------------------------------------------------------
      //  process commands|actions
      // -----------------------------------------------------------------------
      if (message.type === 'command' && message.action === 'module_initialized') {

        //
        // place handling of command|action here
        //

        logger.info('\n' + message.text);
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
