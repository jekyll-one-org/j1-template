---
regenerate:                             true
---

{%- capture cache -%}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/adapter/js/rangeSlider.js
 # Liquid template to adapt rangeSlider
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
 #  {{ range_slider_options | debug }}
 # -----------------------------------------------------------------------------
{% endcomment %}

{% comment %} Liquid procedures
-------------------------------------------------------------------------------- {% endcomment %}

{% comment %} Set global settings
-------------------------------------------------------------------------------- {% endcomment %}
{% assign environment           = site.environment %}
{% assign asset_path            = "/assets/theme/j1" %}

{% comment %} Process YML config data
================================================================================ {% endcomment %}

{% comment %} Set config files
-------------------------------------------------------------------------------- {% endcomment %}
{% assign template_config       = site.data.j1_config %}
{% assign blocks                = site.data.blocks %}
{% assign modules               = site.data.modules %}

{% comment %} Set config data
-------------------------------------------------------------------------------- {% endcomment %}
{% assign range_slider_defaults = modules.defaults.rangeSlider.defaults %}
{% assign range_slider_settings = modules.rangeSlider.settings %}

{% comment %} Set config options
-------------------------------------------------------------------------------- {% endcomment %}
{% assign range_slider_options  = range_slider_defaults | merge: range_slider_settings %}

{% comment %} Detect prod mode
-------------------------------------------------------------------------------- {% endcomment %}
{% assign production = false %}
{% if environment == 'prod' or environment == 'production' %}
  {% assign production = true %}
{% endif %}

/*
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/adapter/js/rangeSlider.js
 # J1 Adapter for J1 Module rangeSlider
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
j1.adapter.rangeSlider = ((j1, window) => {

  {% comment %} Set global variables
  ------------------------------------------------------------------------------ {% endcomment %}
  var environment   = '{{environment}}';
  var instances     = [];
  var state         = 'not_started';

  var rangeSliderDefaults;
  var rangeSliderSettings;
  var rangeSliderOptions;
  var elms;

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
  function prepend(newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode);
  }

  function append(newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
  }

  function insert(newNode, referenceNode) {
    referenceNode.appendChild(newNode);
  }

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
        module_name: 'j1.adapter.rangeSlider',
        generated:   '{{site.time}}'
      }, options);

      // -----------------------------------------------------------------------
      // global variable settings
      // -----------------------------------------------------------------------
      _this   = j1.adapter.rangeSlider;
      logger  = log4javascript.getLogger('j1.adapter.rangeSlider');

      // Load  module DEFAULTS|CONFIG
      rangeSliderDefaults = $.extend({}, {{range_slider_defaults | replace: 'nil', 'null' | replace: '=>', ':' }});
      rangeSliderSettings = $.extend({}, {{range_slider_settings | replace: 'nil', 'null' | replace: '=>', ':' }});
      rangeSliderOptions  = $.extend(true, {}, rangeSliderDefaults, rangeSliderSettings);

      // -----------------------------------------------------------------------
      // module initializer
      // -----------------------------------------------------------------------
      var dependencies_met_j1_finished = setInterval(() => {
        var pageState      = $('#content').css("display");
        var pageVisible    = (pageState === 'block') ? true : false;
        var j1CoreFinished = (j1.getState() === 'finished') ? true : false;

        if (j1CoreFinished) {
          startTimeModule = Date.now();

          _this.setState('started');
          logger.debug('\n' + 'state: ' + _this.getState());
          logger.info('\n' + 'module is being initialized');

          var dependencies_met_elms_loaded = setInterval(() => {
            elms = document.querySelectorAll('.range-slider');
            if (elms.length) {
              logger.info('\n' + 'number of rangeSlider elements found: ' + elms.length);

              var log_text = '\n' + 'rangeSlider elements are being initialized';
              logger.info(log_text);

              {% for item in range_slider_options.sliders %} {% if item.slider.enabled %}
                {% assign slider_id = item.slider.id %}

                {% comment %} load default options
                ---------------------------------------------------------------- {% endcomment %}
                {% assign start             = range_slider_options.options.start %}
                {% assign connect           = range_slider_options.options.connect %}
                {% assign step              = range_slider_options.options.step %}
                {% assign orientation       = range_slider_options.options.orientation %}
                {% assign range_min         = range_slider_options.options.range.min %}
                {% assign range_max         = range_slider_options.options.range.max %}
                {% assign format_decimals   = range_slider_options.options.format.decimals %}
                {% assign cbOnUpdate        = range_slider_options.options.cbOnUpdate %}

                {% comment %} overload defaults by slider options
                ---------------------------------------------------------------- {% endcomment %}
                {% if item.slider.options.title %}            {% assign title           = item.slider.options.title %}            {% endif %}
                {% if item.slider.options.label %}            {% assign label           = item.slider.options.label %}            {% endif %}
                {% if item.slider.options.start %}            {% assign start           = item.slider.options.start %}            {% endif %}
                {% if item.slider.options.connect %}          {% assign connect         = item.slider.options.connect %}          {% endif %}
                {% if item.slider.options.step %}             {% assign step            = item.slider.options.step %}             {% endif %}
                {% if item.slider.options.orientation %}      {% assign orientation     = item.slider.options.orientation %}      {% endif %}
                {% if item.slider.options.range.min %}        {% assign range_min       = item.slider.options.range.min %}        {% endif %}
                {% if item.slider.options.range.max %}        {% assign range_max       = item.slider.options.range.max %}        {% endif %}
                {% if item.slider.options.format.decimals %}  {% assign format_decimals = item.slider.options.format.decimals %}  {% endif %}
                {% if item.slider.options.cbOnUpdate %}       {% assign cbOnUpdate      = item.slider.options.cbOnUpdate %}       {% endif %}


                elms.forEach((elm) => {
                  var id      = elm.id;
                  var parent  = document.getElementById(id);

                  if (id === '{{slider_id}}') {
                    // processing rangeSlider: {{slider_id}}
                    //
                    logger.info('\n' + 'configure rangeSlider: ' + id);

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

                    if ('{{title}}'.length) {
                      var title = document.createElement('div');
                      title.classList.add('range-slider-title');
                      title.innerHTML = '{{title}}';
                      prepend(title, parent);
                    }

                    var label = document.createElement('label');
                    label.classList.add('range-slider-label');
                    label.innerHTML = '{{label}}';
                    insert(label, parent);

                    slider_{{slider_id}}.noUiSlider.on('update', (values, handle) => {
                      var logger = log4javascript.getLogger('j1.adapter.rangeSlider.cbOnUpdate');
                      logger.debug('\n' + 'current value: ' + values[handle]);
                    });
                    instances.push(instance);
                  }
                }); // END forEach

                {% assign item.slider.options = nil %}
              {% endif %} {% endfor %}

              if (instances.length) {
                logger.info('\n' + 'number of rangeSlider instances configured: ' + instances.length);
              } else {
                logger.error('\n' + 'no configured rangeSlider instances found');
                logger.warning('\n' + 'initializing module failed');
              } // END if instances
            } // END if elms

            clearInterval(dependencies_met_elms_loaded);
          }, 10); // END dependencies_met_elms_loaded

          _this.setState('finished');
          logger.debug('\n' + 'state: ' + _this.getState());
          logger.info('\n' + 'initializing module finished');

          endTimeModule = Date.now();
          logger.info('\n' + 'module initializing time: ' + (endTimeModule-startTimeModule) + 'ms');

          clearInterval(dependencies_met_j1_finished);
        } // END if j1CoreFinished
      }, 10); // END dependencies_met_j1_finished
    }, // END init

    // -------------------------------------------------------------------------
    // cbOnClick)
    // called by the rangeSlider CORE module when and dropdown element
    // is clicked
    // -------------------------------------------------------------------------
    cbOnclick: (event) => {
      var logger  = log4javascript.getLogger('j1.adapter.rangeSlider.cbOnClick');
      var itemEl = $(event.target).closest('li')[0];

      // logText = '\n' + 'entered cbOnClick on id: ' + id;
      // logger.info(logText);

      return true;
    },

    // -------------------------------------------------------------------------
    // cbOnOpen()
    // called by the rangeSlider CORE module when dropdown get opened
    // -------------------------------------------------------------------------
    cbOnOpen: (elm) => {
      var logger  = log4javascript.getLogger('j1.adapter.rangeSlider.cbOnOpen');
      var id      = elm.id;

      logText = '\n' + 'entered cbOnOpen on id: ' + id;
      logger.info(logText);
      return true;
    },

    // -------------------------------------------------------------------------
    // cbOnClose()
    // called by the rangeSlider CORE module when dropdown get closed
    // -------------------------------------------------------------------------
    cbOnClose: (elm) => {
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
