---
regenerate:                             true
---

{% capture cache %}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/dynamicLoader.js
 # Liquid template to adapt the dynamicLoader module
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
 #  wave_options:  {{ wave_options | debug }}
 # -----------------------------------------------------------------------------
{% endcomment %}

{% comment %} Liquid procedures
-------------------------------------------------------------------------------- {% endcomment %}

{% comment %} Set global settings
-------------------------------------------------------------------------------- {% endcomment %}
{% assign environment             = site.environment %}
{% assign asset_path              = "/assets/themes/j1" %}

{% comment %} Process YML config data
================================================================================ {% endcomment %}

{% comment %} Set config files
-------------------------------------------------------------------------------- {% endcomment %}
{% assign template_config         = site.data.j1_config %}
{% assign blocks                  = site.data.blocks %}
{% assign modules                 = site.data.modules %}

{% comment %} Set config data (settings only)
-------------------------------------------------------------------------------- {% endcomment %}
{% assign dynamic_loader_defaults = modules.defaults.dynamicLoader.defaults %}
{% assign dynamic_loader_settings = modules.dynamicLoader.settings %}

{% comment %} Set config options (settings only)
-------------------------------------------------------------------------------- {% endcomment %}
{% assign dynamic_loader__options  = dynamic_loader_defaults | merge: dynamic_loader_settings %}

{% comment %} Variables
-------------------------------------------------------------------------------- {% endcomment %}
{% assign comments                = dynamic_loader__options.enabled %}

{% comment %} Detect prod mode
-------------------------------------------------------------------------------- {% endcomment %}
{% assign production = false %}
{% if environment == 'prod' or environment == 'production' %}
  {% assign production = true %}
{% endif %}

/*
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/dynamicLoader.js
 # J1 Adapter for the dynamicLoader module
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2023 Juergen Adams
 #
 # J1 Theme is licensed under the MIT License.
 # For details, see: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE.md
 # -----------------------------------------------------------------------------
 # NOTE: Wave styles defind in /assets/data/panel.html, key 'wave'
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
j1.adapter.dynamicLoader = (function (j1, window) {

{% comment %} Set global variables
-------------------------------------------------------------------------------- {% endcomment %}
var environment     = '{{environment}}';
var cookie_names    = j1.getCookieNames();
var user_state      = j1.readCookie(cookie_names.user_state);
var dynamicLoaderDefaults;
var dynamicLoaderSettings;
var dynamicLoaderOptions;
var frontmatterOptions;
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

      // -----------------------------------------------------------------------
      // Default module settings
      // -----------------------------------------------------------------------
      var settings = $.extend({
        module_name: 'j1.adapter.dynamicLoader',
        generated:   '{{site.time}}'
      }, options);

      // -----------------------------------------------------------------------
      // Global variable settings
      // -----------------------------------------------------------------------

      // create settings object from frontmatter
      //
      frontmatterOptions  = options != null ? $.extend({}, options) : {};

      // create settings object from module options
      //
      dynamicLoaderDefaults = $.extend({}, {{dynamic_loader_defaults | replace: 'nil', 'null' | replace: '=>', ':' }});
      dynamicLoaderSettings = $.extend({}, {{dynamic_loader_settings | replace: 'nil', 'null' | replace: '=>', ':' }});
      dynamicLoaderOptions  = $.extend(true, {}, dynamicLoaderDefaults, dynamicLoaderSettings, frontmatterOptions);

      _this  = j1.adapter.dynamicLoader;
      logger = log4javascript.getLogger('j1.adapter.dynamicLoader');

      var dependencies_met_dynamic_loader = setInterval(function() {
        var pageFinished = (j1.getState() == 'finished') ? true: false;

        if (pageFinished) {
          logger.info('\n' + 'met dependencies for: dynamicLoader');
          _this.registerLazyLoadCss(dynamicLoaderOptions);
          clearInterval(dependencies_met_dynamic_loader);
        }
      }, 10);

    }, // END init

    // -------------------------------------------------------------------------
    // registerLazyLoadCss()
    // CSS loader to speed up inital rendering
    //
    // Requires the following config serrings:
    //
    //    src:        the 'location' of the CSS file
    //    selector:   the 'selector' that triggers the observer
    //    rootMargin: the 'margin' before the load is trigged
    //
    // -------------------------------------------------------------------------
    //
    registerLazyLoadCss: function () {

      logger.info('\n' + 'register CSS files for lazy loading');

      // load MDI Light CSS
      //
      j1.lazyCss().observe({
        'src':        '/assets/themes/j1/core/css/icon-fonts/mdil.min.css',
        'selector':   '.mdil',
        'rootMargin': '150px 0px'
      });

      // load MDI Regular CSS
      //
      j1.lazyCss().observe({
        'src':        '/assets/themes/j1/core/css/icon-fonts/mdi.min.css',
        'selector':   '.mdi',
        'rootMargin': '150px 0px'
      });

      // load FA CSS
      //
      j1.lazyCss().observe({
        'src':        '/assets/themes/j1/core/css/icon-fonts/fontawesome.min.css',
        'selector':   '.fa',
        'rootMargin': '150px 0px'
      });

      // load rTable CSS
      //
      j1.lazyCss().observe({
        'src':        '/assets/themes/j1/modules/rtable/css/theme/uno/rtable.min.css',
        'selector':   '.rtable',
        'rootMargin': '150px 0px'
      });

      // load CountryFlags CSS
      //
      j1.lazyCss().observe({
        'src':        '/assets/themes/j1/core/country-flags/css/theme/uno.min.css',
        'selector':   '.flag-icon',
        'rootMargin': '150px 0px'
      });

    }, // END registerLazyLoadCss

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
