---
regenerate:                             true
---

{% capture cache %}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/rangeSlider.js
 # Liquid template to adapt rangeSlider
 #
 # Product/Info:
 # https://jekyll.one
 # Copyright (C) 2022 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # For details, see: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE.md
 # -----------------------------------------------------------------------------
 # Test data:
 #  {{ liquid_var | debug }}
 #  {{ range_slider_options | debug }}
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
{% assign range_slider_defaults = modules.defaults.rangeSlider.defaults %}
{% assign range_slider_settings = modules.rangeSlider.settings %}

{% comment %} Set config options
-------------------------------------------------------------------------------- {% endcomment %}
{% assign range_slider_options  = range_slider_defaults | merge: range_slider_settings %}

{% assign production = false %}
{% if environment == 'prod' or environment == 'production' %}
  {% assign production = true %}
{% endif %}

/*
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/rangeSlider.js
 # J1 Adapter for J1 Module rangeSlider
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2022 Juergen Adams
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
j1.adapter.rangeSlider = (function (j1, window) {

  {% comment %} Set global variables
  ------------------------------------------------------------------------------ {% endcomment %}
  var environment   = '{{environment}}';
  var moduleOptions = {};
  var instances     = [];
  var frontmatterOptions;
  var elms;
  var _this;
  var logger;
  var logText;

  // ---------------------------------------------------------------------------
  // Helper functions
  // ---------------------------------------------------------------------------

  function insertAfter(newNode, referenceNode) {
      referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
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
      // Default module settings
      // -----------------------------------------------------------------------
      var settings = $.extend({
        module_name: 'j1.adapter.rangeSlider',
        generated:   '{{site.time}}'
      }, options);

      // -----------------------------------------------------------------------
      // Global variable settings
      // -----------------------------------------------------------------------
      _this   = j1.adapter.rangeSlider;
      logger  = log4javascript.getLogger('j1.adapter.rangeSlider');

      // initialize state flag
      _this.setState('started');
      logger.debug('\n' + 'state: ' + _this.getState());
      logger.info('\n' + 'module is being initialized');

      // create settings object from frontmatterOptions
      frontmatterOptions = options != null ? $.extend({}, options) : {};
      moduleOptions = $.extend({}, {{range_slider_options | replace: 'nil', 'null' | replace: '=>', ':' }});

      if (typeof frontmatterOptions !== 'undefined') {
        moduleOptions = j1.mergeData(moduleOptions, frontmatterOptions);
      }

      var dependencies_met_j1_finished = setInterval(function() {
        elms = document.querySelectorAll('.range-slider');
        if (elms) {
//          var elms = document.querySelectorAll('.range-slider');

          // -------------------------------------------------------------------
          // slider initializer
          // -------------------------------------------------------------------
          var log_text = '\n' + 'rangeSliders are being initialized';
          logger.info(log_text);

          {% for item in range_slider_options.sliders %} {% if item.slider.enabled %}
            {% assign slider_id = item.slider.id %}

            {% comment %} load default options
            ---------------------------------------------------------------------- {% endcomment %}
            {% assign start             = range_slider_options.options.start %}
            {% assign connect           = range_slider_options.options.connect %}
            {% assign step              = range_slider_options.options.step %}
            {% assign orientation       = range_slider_options.options.orientation %}
            {% assign range_min         = range_slider_options.options.range.min %}
            {% assign range_max         = range_slider_options.options.range.max %}
            {% assign format_decimals   = range_slider_options.options.format.decimals %}
            {% assign cbOnUpdate        = range_slider_options.options.cbOnUpdate %}

            {% comment %} overload defaults by slider options
            -------------------------------------------------------------------- {% endcomment %}
            {% if item.slider.options.label %}            {% assign label           = item.slider.options.label %}            {% endif %}
            {% if item.slider.options.start %}            {% assign start           = item.slider.options.start %}            {% endif %}
            {% if item.slider.options.connect %}          {% assign connect         = item.slider.options.connect %}          {% endif %}
            {% if item.slider.options.step %}             {% assign step            = item.slider.options.step %}             {% endif %}
            {% if item.slider.options.orientation %}      {% assign orientation     = item.slider.options.orientation %}      {% endif %}
            {% if item.slider.options.range.min %}        {% assign range_min       = item.slider.options.range.min %}        {% endif %}
            {% if item.slider.options.range.max %}        {% assign range_max       = item.slider.options.range.max %}        {% endif %}
            {% if item.slider.options.format.decimals %}  {% assign format_decimals = item.slider.options.format.decimals %}  {% endif %}
            {% if item.slider.options.cbOnUpdate %}       {% assign cbOnUpdate      = item.slider.options.cbOnUpdate %}       {% endif %}

            elms.forEach(function (elm) {
              var id = elm.id;

              if (id === '{{slider_id}}') {
                // processing: {{slider_id}}
                //
                logger.info('\n' + 'configure range slider: ' + id);

                var slider_{{slider_id}} = document.getElementById('{{slider_id}}');
                var instance = noUiSlider.create(slider_{{slider_id}}, {
                   start:       [{{start}}],
                   connect:     {{connect}},
                   step:        {{step}},
                   orientation: '{{orientation}}',
                   range: {
                     'min':     {{range_min}},
                     'max':     {{range_max}}
                   },
                   format: wNumb({
                     decimals:  {{format_decimals}}
                   })
                });

                var el = document.createElement("label");
                el.classList.add('range-slider-label');
                el.innerHTML = '{{label}}';
                var div = document.getElementById(id);
                insertAfter(el, div);

                slider_{{slider_id}}.noUiSlider.on('update', function (values, handle) {
                  var logger = log4javascript.getLogger('j1.adapter.rangeSlider.cbOnUpdate');
                  logger.debug('\n' + 'current value: ' + values[handle]);
                });
                instances.push(instance);
              }
            }); // END forEach

            {% assign item.slider.options = nil %}
          {% endif %} {% endfor %}

          if (instances.length) {
            logger.info('\n' + 'number of instances configured: ' + instances.length);
            _this.setState('finished');
            logger.debug('\n' + 'state: ' + _this.getState());
          } else {
            logger.error('\n' + 'no configured instances found');
          }

          clearInterval(dependencies_met_j1_finished);
        } // END dependencies_met_j1_finished
      }, 25);

    }, // END init

    // -------------------------------------------------------------------------
    // cbOnClick)
    // Called by the rangeSlider CORE module when and dropdown element
    // is clicked
    // -------------------------------------------------------------------------
    cbOnclick: function (event) {
      var logger  = log4javascript.getLogger('j1.adapter.rangeSlider.cbOnClick');
      var itemEl = $(event.target).closest('li')[0];


      // logText = '\n' + 'entered cbOnClick on id: ' + id;
      // logger.info(logText);

      return true;
    },

    // -------------------------------------------------------------------------
    // cbOnOpen()
    // Called by the rangeSlider CORE module when dropdown get opened
    // -------------------------------------------------------------------------
    cbOnOpen: function (elm) {
      var logger  = log4javascript.getLogger('j1.adapter.rangeSlider.cbOnOpen');
      var id      = elm.id;

      logText = '\n' + 'entered cbOnOpen on id: ' + id;
      logger.info(logText);
      return true;
    },

    // -------------------------------------------------------------------------
    // cbOnClose()
    // Called by the rangeSlider CORE module when dropdown get closed
    // -------------------------------------------------------------------------
    cbOnClose: function (elm) {
      var logger    = log4javascript.getLogger('j1.adapter.rangeSlider.cbOnClose');
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
