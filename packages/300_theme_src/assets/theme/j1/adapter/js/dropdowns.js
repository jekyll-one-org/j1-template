---
regenerate:                             true
---

{%- capture cache -%}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/adapter/js/dropdowns.js
 # Liquid template to adapt dropdowns
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
 #  {{ dropdowns_options | debug }}
 # -----------------------------------------------------------------------------
{% endcomment %}

{% comment %} Liquid procedures
-------------------------------------------------------------------------------- {% endcomment %}

{% comment %} Set global settings
-------------------------------------------------------------------------------- {% endcomment %}
{% assign environment        = site.environment %}
{% assign asset_path         = "/assets/theme/j1" %}

{% comment %} Process YML config data
================================================================================ {% endcomment %}

{% comment %} Set config files
-------------------------------------------------------------------------------- {% endcomment %}
{% assign template_config    = site.data.j1_config %}
{% assign blocks             = site.data.blocks %}
{% assign modules            = site.data.modules %}

{% comment %} Set config data
-------------------------------------------------------------------------------- {% endcomment %}
{% assign dropdowns_defaults = modules.defaults.dropdowns.defaults %}
{% assign dropdowns_settings = modules.dropdowns.settings %}

{% comment %} Set config options
-------------------------------------------------------------------------------- {% endcomment %}
{% assign dropdowns_options  = dropdowns_defaults | merge: dropdowns_settings %}

{% comment %} Detect prod mode
-------------------------------------------------------------------------------- {% endcomment %}
{% assign production = false %}
{% if environment == 'prod' or environment == 'production' %}
  {% assign production = true %}
{% endif %}

/*
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/adapter/js/dropdowns.js
 # J1 Adapter for J1 Module Dropdowns
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
j1.adapter.dropdowns = ((j1, window) => {

  const isDev = (j1.env === "development" || j1.env === "dev") ? true : false;

  {% comment %} Set global variables
  ------------------------------------------------------------------------------ {% endcomment %}
  var environment           = '{{environment}}';
  var instances             = [];
  var state                 = 'not_started';

  var dropdownsDefaults;
  var dropdownsSettings;
  var dropdownsOptions;

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
        module_name: 'j1.adapter.dropdowns',
        generated:   '{{site.time}}'
      }, options);

      // -----------------------------------------------------------------------
      // global variable settings
      // -----------------------------------------------------------------------
      _this   = j1.adapter.dropdowns;
      logger  = log4javascript.getLogger('j1.adapter.dropdowns');

      // Load  module DEFAULTS|CONFIG
      dropdownsDefaults = $.extend({}, {{comments_defaults | replace: 'nil', 'null' | replace: '=>', ':' }});
      dropdownsSettings = $.extend({}, {{comments_settings | replace: 'nil', 'null' | replace: '=>', ':' }});
      dropdownsOptions  = $.extend(true, {}, dropdownsDefaults, dropdownsSettings);

      // initialize state flag
      _this.setState('started');
      logger.debug('state: ' + _this.getState());
      logger.info('module is being initialized');

      // -----------------------------------------------------------------------
      // module initializer
      // -----------------------------------------------------------------------
      var dependencies_met_page_ready = setInterval (() => {
        var pageState      = $('#content').css("display");
        var pageVisible    = (pageState === 'block') ? true : false;
        var j1CoreFinished = (j1.getState() === 'finished') ? true : false;

        if (j1CoreFinished && pageVisible) {
          var elms = document.querySelectorAll('.dropdowns');

          startTimeModule = Date.now();

          _this.setState('started');
          logger.debug('state: ' + _this.getState());
          logger.info('module is being initialized');

          {% for item in dropdowns_options.dropdowns %} {% if item.dropdown.enabled %}
            {% assign dropdown_id = item.dropdown.id %}

            {% comment %} load default options
            ---------------------------------------------------------------------- {% endcomment %}
            {% assign alignment       = dropdowns_options.options.alignment %}
            {% assign autoTrigger     = dropdowns_options.options.autoTrigger %}
            {% assign constrainWidth  = dropdowns_options.options.constrainWidth %}
            {% assign coverTrigger    = dropdowns_options.options.coverTrigger %}
            {% assign closeOnClick    = dropdowns_options.options.closeOnClick %}
            {% assign hover           = dropdowns_options.options.hover %}
            {% assign inDuration      = dropdowns_options.options.inDuration %}
            {% assign outDuration     = dropdowns_options.options.outDuration %}
            {% assign cbOnOpen        = dropdowns_options.options.cbOnOpen %}
            {% assign cbOnClose       = dropdowns_options.options.cbOnClose %}
            {% assign cbOnItemClick   = dropdowns_options.options.cbOnItemClick %}

            {% comment %} set dropdown options
            -------------------------------------------------------------------- {% endcomment %}
            {% if item.dropdown.options.alignment %}      {% assign alignment       = item.dropdown.options.alignment %}        {% endif %}
            {% if item.dropdown.options.autoTrigger %}    {% assign autoTrigger     = item.dropdown.options.autoTrigger %}      {% endif %}
            {% if item.dropdown.options.constrainWidth %} {% assign constrainWidth  = item.dropdown.options.constrainWidth %}   {% endif %}
            {% if item.dropdown.options.coverTrigger %}   {% assign coverTrigger    = item.dropdown.options.coverTrigger %}     {% endif %}
            {% if item.dropdown.options.closeOnClick %}   {% assign closeOnClick    = item.dropdown.options.closeOnClick %}     {% endif %}
            {% if item.dropdown.options.hover %}          {% assign hover           = item.dropdown.options.hover %}            {% endif %}
            {% if item.dropdown.options.inDuration %}     {% assign inDuration      = item.dropdown.options.inDuration %}       {% endif %}
            {% if item.dropdown.options.outDuration %}    {% assign outDuration     = item.dropdown.options.outDuration %}      {% endif %}
            {% if item.dropdown.options.cbOnOpen %}       {% assign cbOnOpen        = item.dropdown.options.cbOnOpen %}         {% endif %}
            {% if item.dropdown.options.cbOnClose %}      {% assign cbOnClose       = item.dropdown.options.cbOnClose %}        {% endif %}
            {% if item.dropdown.options.cbOnItemClick %}  {% assign cbOnItemClick   = item.dropdown.options.cbOnItemClick %}    {% endif %}

            elms.forEach((elm) => {
              var id = elm.dataset.target;

              if (id === '{{dropdown_id}}') {
                // processing: {{dropdown_id}}
                //
                var instance = j1.dropdowns.init(elm, {
                  alignment:        "{{alignment}}",
                  autoTrigger:      {{autoTrigger}},
                  constrainWidth:   {{constrainWidth}},
                  coverTrigger:     {{coverTrigger}},
                  closeOnClick:     {{closeOnClick}},
                  hover:            {{hover}},
                  inDuration:       "{{inDuration}}",
                  outDuration:      "{{outDuration}}",
                  onOpen:           "{{cbOnOpen}}",
                  onClose:          "{{cbOnClose}}",
                  onItemClick:      "{{cbOnItemClick}}"
                });
                instances.push(instance);
              }

            });
            {% assign item.dropdown.options = nil %}
          {% endif %} {% endfor %}

          _this.setState('finished');
          logger.debug('state: ' + _this.getState());
          logger.info('module initialized successfully');

          endTimeModule = Date.now();
          logger.info('module initializing time: ' + (endTimeModule-startTimeModule) + 'ms');

          clearInterval(dependencies_met_page_ready);
        } // END pageVisible
      }, 10); // END dependencies_met_page_ready
    }, // END init

    // -------------------------------------------------------------------------
    // cbOnClick)
    // called by the dropdowns CORE module when and dropdown element
    // is clicked
    // -------------------------------------------------------------------------
    cbOnclick: (event) => {
      var logger = log4javascript.getLogger('j1.adapter.dropdowns.cbOnClick');
      var itemEl = $(event.target).closest('li')[0];

      // logText = 'entered cbOnClick on id: ' + id;
      // logger.info(logText);

      return true;
    }, // END cbOnclick

    // -------------------------------------------------------------------------
    // cbOnOpen()
    // called by the dropdowns CORE module when dropdown get opened
    // -------------------------------------------------------------------------
    cbOnOpen: (elm) => {
      var logger  = log4javascript.getLogger('j1.adapter.dropdowns.cbOnOpen');
      var id      = elm.id;

      logText = 'entered cbOnOpen on id: ' + id;
      logger.info(logText);
      return true;
    }, // END cbOnOpen

    // -------------------------------------------------------------------------
    // cbOnClose()
    // called by the dropdowns CORE module when dropdown get closed
    // -------------------------------------------------------------------------
    cbOnClose: (elm) => {
      var logger    = log4javascript.getLogger('j1.adapter.dropdowns.cbOnClose');
      var id        = elm.id;
      var listItems = '#' + elm.id + " li";
      var menuItems = document.querySelectorAll(listItems);
      var activeItem;
      var activeValue;

      // Loop through each <li> element and mark selected menuItem by class active
      for (var i=0; i < menuItems.length; i++) {
        if (menuItems[i].classList.contains('active')) {
            activeItem  = i;
            activeValue = menuItems[i].dataset.target;
        }
      }

      logText = 'entered cbOnClose on id: ' + id;
      logger.info(logText);
      logText = 'item selected: ' + activeItem;
      logger.info(logText);
      logText = 'value selected: ' + activeValue;
      logger.info(logText);
      return true;
    }, // END cbOnClose

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
