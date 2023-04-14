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
      var xhrLoadState      = 'pending';                                        // (initial) load state for the HTML portion of the slider
      var load_dependencies = {};
      var dependency;

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
      masonryOptions =  $.extend(true, {}, masonryDefaults, masonrySettings);

      // load HTML portion for all grids
      console.debug('loading HTML portion for all Masonry grids configured');
      _this.loadGridHTML(masonryOptions, masonryOptions.grids);

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

          {% for grid in masonry_settings.grids %}
            {% if grid.enabled %}
              {% assign grid_id = grid.id %}
              logger.info('\n' + 'found masonry grid on id: ' + '{{grid_id}}');

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
              {% assign resize              = masonry_defaults.resize %}
              {% assign itemSelector        = masonry_defaults.itemSelector %}
              {% assign containerStyle      = masonry_defaults.containerStyle %}
              {% assign columnWidth         = masonry_defaults.columnWidth %}

              {% comment %} overload defaults by grid element options
              ------------------------------------------------------------------ {% endcomment %}
              {% if grid.options.percentPosition %}    {% assign percent_position    = grid.options.percentPosition %}    {% endif %}
              {% if grid.options.horizontalOrder %}    {% assign horizontal_order    = grid.options.horizontalOrder %}    {% endif %}
              {% if grid.options.originLeft %}         {% assign origin_left         = grid.options.originLeft %}         {% endif %}
              {% if grid.options.originTop %}          {% assign origin_top          = grid.options.originTop %}          {% endif %}
              {% if grid.options.initLayout %}         {% assign init_layout         = grid.options.initLayout %}         {% endif %}
              {% if grid.options.transitionDuration %} {% assign transition_duration = grid.options.transitionDuration %} {% endif %}
              {% if grid.options.stagger %}            {% assign stagger_duration    = grid.options.stagger %}            {% endif %}
              {% if grid.options.gutter %}             {% assign gutter_size         = grid.options.gutter %}             {% endif %}
              {% if grid.options.resize %}             {% assign resize              = grid.options.resize %}             {% endif %}
              {% if grid.options.itemSelector %}       {% assign itemSelector        = grid.options.itemSelector %}       {% endif %}
              {% if grid.options.containerStyle %}     {% assign containerStyle      = grid.options.containerStyle %}     {% endif %}
              {% if grid.options.columnWidth %}        {% assign columnWidth         = grid.options.columnWidth %}     {% endif %}

              // create dynamic loader variable|s
              dependency = 'dependencies_met_html_loaded_{{grid.id}}';
              load_dependencies[dependency] = '';

              // initialize the grid if HTML portion successfully loaded
              load_dependencies['dependencies_met_html_loaded_{{grid.id}}'] = setInterval (function (options) {
                // check if HTML portion of the slider is loaded successfully (loadSliderHTML)
                xhrLoadState = j1.xhrDOMState['#{{grid.id}}_parent'];
                if ( xhrLoadState === 'success' ) {
                  setTimeout (function() {
                    var $grid_{{grid_id}} = $('#{{grid_id}}');
                    logger.info('\n' + 'initialize grid on id: ' + '{{grid_id}}');

                    // grid event handler
                    logger.info('\n' + 'install event handlers for grid on id: ' + '{{grid_id}}');
                    $grid_{{grid_id}}.on('layoutComplete', function() {
                      // initializing (grid layout) completed
                      logger.debug('\n' + 'initializing layout completed for grid on id: ' + '{{grid_id}}');

                      // correct position for artice modals (previwes)
                      logger.debug('\n' + 'adjust positions of all modals on id: {{grid_id.id}}');
                      var preview_modals = $("#{{grid_id}} > .article-modal");
                      $.each($(preview_modals), function(index, modal) {
                          $(modal).attr('style', 'left: 0%');
                      });

                    });

                    // setup the grid
                    logger.info('\n' + 'grid is being setup on id: ' + '{{grid.id}}');
                    $grid_{{grid_id}}.masonry({
                      percentPosition:        {{percent_position}},
                      horizontalOrder:        {{horizontal_order}},
                      originLeft:             {{origin_left}},
                      originTop:              {{origin_top}},
                      initLayout:             {{init_layout}},
                      transitionDuration:     "{{transition_duration}}s",
                      stagger:                "{{stagger_duration}}s",
                      resize:                 {{resize}},
                      gutter:                 {{gutter_size}},
//                    containerStyle:         "{{containerStyle}}",
//                    columnWidth:             {{columnWidth}},
                    });
                  }, masonryOptions.initTimeout);
                }
                clearInterval(load_dependencies['dependencies_met_html_loaded_{{grid.id}}']);
              }, 25); // END dependencies_met_html_loaded

            {% else %}
              logger.info('\n' + 'found grid disabled on id: {{grid.id}}');
              {% if masonryOptions.hideDisabled %}
                // hide a grid if disabled
                logger.debug('\n' + 'hide grid disabled on id: {{grid.id}}');
                $('#{{grid.id}}').hide();
              {% endif %}
            {% endif %} // ENDIF grid enabled

          {% endfor %} // ENDFOR (all) grids
          logger.info('\n' + 'initializing module finished');
          clearInterval(dependencies_met_page_ready);
        }
      }, 25);

    }, // END init

    // -------------------------------------------------------------------------
    // loadGridHTML()
    // loads the HTML portion via AJAX (j1.loadHTML) for all grids configured.
    // NOTE: Make sure the placeholder DIV is available in the content
    // page e.g. using the asciidoc extension masonry::
    // -------------------------------------------------------------------------
    loadGridHTML: function (options, grid) {
      var numGrids      = Object.keys(grid).length;
      var active_grids  = numGrids;
      var xhr_data_path = options.xhr_data_path + '/index.html';
      var xhr_container_id;

      console.debug('number of grids found: ' + numGrids);

      _this.setState('load_data');
      Object.keys(grid).forEach(function(key) {
        if (grid[key].enabled) {
          xhr_container_id = grid[key].id + '_parent';

          console.debug('load HTML portion on grid id: ' + grid[key].id);
          j1.loadHTML({
            xhr_container_id: xhr_container_id,
            xhr_data_path:    xhr_data_path,
            xhr_data_element: grid[key].id
          });
        } else {
          console.debug('grid found disabled on id: ' + grid[key].id);
          active_grids--;
        }
      });
      console.debug('grids loaded in page enabled|all: ' + active_grids + '|' + numGrids);
      _this.setState('data_loaded');
    }, // END loadSliderHTML

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
