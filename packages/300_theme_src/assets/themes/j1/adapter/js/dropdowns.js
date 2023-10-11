---
regenerate:                             true
---

{% capture cache %}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/dropdowns.js
 # Liquid template to adapt dropdowns
 #
 # Product/Info:
 # https://jekyll.one
 # Copyright (C) 2023 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # For details, see: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE.md
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
{% assign environment       = site.environment %}
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
 # ~/assets/themes/j1/adapter/js/dropdowns.js
 # J1 Adapter for J1 Module Dropdowns
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2023 Juergen Adams
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
j1.adapter.dropdowns = (function (j1, window) {

  {% comment %} Set global variables
  ------------------------------------------------------------------------------ {% endcomment %}
  var environment   = '{{environment}}';
  var instances     = [];
  var state         = 'not_started';
  var dropdownsDefaults;
  var dropdownsSettings;
  var dropdownsOptions;
  var _this;
  var logger;
  var logText;

  // ---------------------------------------------------------------------------
  // Helper functions
  // ---------------------------------------------------------------------------

  // ---------------------------------------------------------------------------
  // Main object
  // ---------------------------------------------------------------------------
  return {

    // -------------------------------------------------------------------------
    // Initializer
    // -------------------------------------------------------------------------
    init: function (options) {

      // -----------------------------------------------------------------------
      // Default module settings
      // -----------------------------------------------------------------------
      var settings = $.extend({
        module_name: 'j1.adapter.dropdowns',
        generated:   '{{site.time}}'
      }, options);

      // -----------------------------------------------------------------------
      // Global variable settings
      // -----------------------------------------------------------------------
      _this   = j1.adapter.dropdowns;
      logger  = log4javascript.getLogger('j1.adapter.dropdowns');

      // Load  module DEFAULTS|CONFIG
      dropdownsDefaults = $.extend({}, {{comments_defaults | replace: 'nil', 'null' | replace: '=>', ':' }});
      dropdownsSettings = $.extend({}, {{comments_settings | replace: 'nil', 'null' | replace: '=>', ':' }});
      dropdownsOptions  = $.extend(true, {}, dropdownsDefaults, dropdownsSettings);

      // initialize state flag
      _this.setState('started');
      logger.debug('\n' + 'state: ' + _this.getState());
      logger.info('\n' + 'module is being initialized');

      var dependencies_met_j1_finished = setInterval(function() {
        var pageState     = $('#no_flicker').css("display");
        var pageVisible   = (pageState == 'block') ? true : false;
        var atticFinished = (j1.adapter.attic.getState() == 'finished') ? true: false;

        if (j1.getState() == 'finished' && pageVisible) {
//      if (j1.getState() == 'finished' && pageVisible && atticFinished) {

          var elms = document.querySelectorAll('.dropdowns');

          // -------------------------------------------------------------------
          // dropdowns initializer
          // -------------------------------------------------------------------
          var log_text = '\n' + 'dropdowns is being initialized';
          logger.info(log_text);

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

            elms.forEach(function (elm) {
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
          logger.debug('\n' + 'state: ' + _this.getState());

          clearInterval(dependencies_met_j1_finished);
        } // END dependencies_met_j1_finished
      }, 10);

    }, // END init

    // -------------------------------------------------------------------------
    // cbOnClick)
    // Called by the dropdowns CORE module when and dropdown element
    // is clicked
    // -------------------------------------------------------------------------
    cbOnclick: function (event) {
      var logger  = log4javascript.getLogger('j1.adapter.dropdowns.cbOnClick');
      var itemEl = $(event.target).closest('li')[0];


      // logText = '\n' + 'entered cbOnClick on id: ' + id;
      // logger.info(logText);

      return true;
    },

    // -------------------------------------------------------------------------
    // cbOnOpen()
    // Called by the dropdowns CORE module when dropdown get opened
    // -------------------------------------------------------------------------
    cbOnOpen: function (elm) {
      var logger  = log4javascript.getLogger('j1.adapter.dropdowns.cbOnOpen');
      var id      = elm.id;

      logText = '\n' + 'entered cbOnOpen on id: ' + id;
      logger.info(logText);
      return true;
    },

    // -------------------------------------------------------------------------
    // cbOnClose()
    // Called by the dropdowns CORE module when dropdown get closed
    // -------------------------------------------------------------------------
    cbOnClose: function (elm) {
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

      logText = '\n' + 'entered cbOnClose on id: ' + id;
      logger.info(logText);
      logText = '\n' + 'item selected: ' + activeItem;
      logger.info(logText);
      logText = '\n' + 'value selected: ' + activeValue;
      logger.info(logText);
      return true;
    },

    // -------------------------------------------------------------------------
    // messageHandler
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
