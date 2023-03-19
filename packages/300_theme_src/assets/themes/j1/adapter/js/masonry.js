---
regenerate:                             true
---

{% capture cache %}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/masonry.js
 # Liquid template to adapt the Masonry module
 #
 # Product/Info:
 # https://jekyll.one
 # Copyright (C) 2023 Juergen Adams
 #
 # J1 Theme is licensed under the MIT License.
 # For details, see: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE.md
 # -----------------------------------------------------------------------------
 # Test data:
 #  {{ liquid_var | debug }}
 #  masonry_options:  {{ masonry_options | debug }}
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
{% assign template_config    = site.data.j1_config %}
{% assign blocks             = site.data.blocks %}
{% assign modules            = site.data.modules %}

{% comment %} Set config data (settings only)
-------------------------------------------------------------------------------- {% endcomment %}
{% assign masonry_defaults = modules.defaults.masonry.defaults %}
{% assign masonry_settings = modules.masonry.settings %}

{% comment %} Set config options (settings only)
-------------------------------------------------------------------------------- {% endcomment %}
{% assign masonry_options  = masonry_defaults | merge: masonry_settings %}

{% comment %} Variables
-------------------------------------------------------------------------------- {% endcomment %}


{% comment %} Detect prod mode
-------------------------------------------------------------------------------- {% endcomment %}
{% assign production = false %}
{% if environment == 'prod' or environment == 'production' %}
  {% assign production = true %}
{% endif %}


/*
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/masonry.js
 # J1 Adapter for the comments module
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2023 Juergen Adams
 #
 # J1 Theme is licensed under the MIT License.
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
j1.adapter.masonry = (function (j1, window) {

{% comment %} Set global variables
-------------------------------------------------------------------------------- {% endcomment %}
var environment     = '{{environment}}';
var cookie_names    = j1.getCookieNames();
var user_state      = j1.readCookie(cookie_names.user_state);
var viewport_width  = $(window).width();
var masonryDefaults;
var masonrySettings;
var masonryOptions;
var themes_allowed;
var theme_enabled;
var theme;
var _this;
var logger;
var logText;

  // ---------------------------------------------------------------------------
  // Main object
  // ---------------------------------------------------------------------------
  return {

    // -------------------------------------------------------------------------
    // init()
    // adapter initializer
    // -------------------------------------------------------------------------
    init: function (options) {

      // [INFO   ] [j1.adapter.comments                    ] [ detected comments provider (j1_config): {{comments_provider}}} ]
      // [INFO   ] [j1.adapter.comments                    ] [ start processing load region head, layout: {{page.layout}} ]

      // -----------------------------------------------------------------------
      // Default module settings
      // -----------------------------------------------------------------------
      var settings = $.extend({
        module_name: 'j1.adapter.masonry',
        generated:   '{{site.time}}'
      }, options);

      // -----------------------------------------------------------------------
      // Global variable settings
      // -----------------------------------------------------------------------
      _this  = j1.adapter.masonry;
      theme  = user_state.theme_name;
      logger = log4javascript.getLogger('j1.adapter.masonry');

      // Load  module DEFAULTS|CONFIG
      masonryDefaults = $.extend({}, {{masonry_defaults | replace: 'nil', 'null' | replace: '=>', ':' }});
      masonrySettings = $.extend({}, {{masonry_settings | replace: 'nil', 'null' | replace: '=>', ':' }});
      masonryOptions = $.extend({}, masonryDefaults, masonrySettings);

      // -----------------------------------------------------------------------
      // initializer
      // -----------------------------------------------------------------------
      var dependencies_met_page_ready = setInterval (function (options) {
        var pageState   = $('#no_flicker').css("display");
        var pageVisible = (pageState == 'block') ? true: false;

        if ( j1.getState() === 'finished' && pageVisible ) {

          _this.setState('started');
          logger.debug('\n' + 'state: ' + _this.getState());
          logger.info('\n' + 'module is being initialized');

          {% for item in masonry_options.grids %}
            {% if item.grid.enabled %}
              {% assign grid_id = item.grid.id %}

              logger.info('\n' + 'found masonry on id: ' + '{{grid_id}}');

              {% comment %} load default grid options
              ------------------------------------------------------------------ {% endcomment %}
              {% assign percent_position    = masonry_defaults.percentPosition %}
              {% assign horizontal_order    = masonry_defaults.horizontalOrder %}
              {% assign origin_left         = masonry_defaults.originLeft %}
              {% assign origin_top          = masonry_defaults.originTop %}
              {% assign init_layout         = masonry_defaults.initLayout %}
              {% assign transition_duration = masonry_defaults.transitionDuration %}
              {% assign stagger_duration    = masonry_defaults.stagger %}
              {% assign gutter_size         = masonry_defaults.gutter %}

              {% comment %} overload defaults by grid element options
              ------------------------------------------------------------------ {% endcomment %}
              {% if item.grid.percentPosition %}      {% assign percent_position    = item.grid.percentPosition %}    {% endif %}
              {% if item.grid.horizontalOrder %}      {% assign horizontal_order    = item.grid.horizontalOrder %}    {% endif %}
              {% if item.grid.originLeft %}           {% assign origin_left         = item.grid.originLeft %}         {% endif %}
              {% if item.grid.originTop %}            {% assign origin_top          = item.grid.originTop %}          {% endif %}
              {% if item.grid.initLayout %}           {% assign init_layout         = item.grid.initLayout %}         {% endif %}
              {% if item.grid.transitionDuration %}   {% assign transition_duration = item.grid.transitionDuration %} {% endif %}
              {% if item.grid.stagger %}              {% assign stagger_duration    = item.grid.stagger %}            {% endif %}
              {% if item.grid.gutter %}               {% assign gutter_size         = item.grid.gutter %}             {% endif %}

              var $grid_{{grid_id}} = $('#{{grid_id}}');

              logger.info('\n' + 'initialize grid on id: ' + '{{grid_id}}');
              // initialize the (masonry) grid
              //
              $grid_{{grid_id}}.masonry({
                percentPosition:        {{percent_position}},
                horizontalOrder:        {{horizontal_order}},
                originLeft:             {{origin_left}},
                originTop:              {{origin_top}},
                initLayout:             {{init_layout}},
                transitionDuration:     "{{transition_duration}}s",
                stagger:                "{{stagger_duration}}",
              });

              logger.info('\n' + 'install event handlers on id: ' + '{{grid_id}}');
              // grid event handler
              //
              $grid_{{grid_id}}.on( 'click', '.card', function() {
                // remove clicked element
                // layout remaining item elements
                $grid_{{grid_id}}.masonry('remove', this).masonry('layout');
                $grid_{{grid_id}}.masonry('reloadItems');
              });

            {% else %}

              {% if item.grid.hideDisabled %}
                // hide a grid if disabled
                $('#{{item.grid.id}}').hide();
              {% endif %}

            {% endif %} // ENDIF grid enabled
          {% endfor %} // ENDFOR (all) grids

          logger.info('\n' + 'initializing module finished');
          clearInterval(dependencies_met_page_ready);
        }
      }, 25);

    }, // END init

    // -------------------------------------------------------------------------
    // messageHandler()
    // manage messages send from other J1 modules
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
