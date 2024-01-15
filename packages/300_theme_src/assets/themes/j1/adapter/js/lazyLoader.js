---
regenerate:                             true
---

{% capture cache %}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/lazyCSSLoader.js
 # Liquid template to adapt the lazyCSS module(core)
 #
 # Product/Info:
 # https://jekyll.one
 # Copyright (C) 2023, 2024 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
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
{% assign environment          = site.environment %}
{% assign asset_path           = "/assets/themes/j1" %}

{% comment %} Process YML config data
================================================================================ {% endcomment %}

{% comment %} Set config files
-------------------------------------------------------------------------------- {% endcomment %}
{% assign template_config      = site.data.j1_config %}
{% assign blocks               = site.data.blocks %}
{% assign modules              = site.data.modules %}

{% comment %} Set config data (settings only)
-------------------------------------------------------------------------------- {% endcomment %}
{% assign lazy_loader_defaults = modules.defaults.lazyLoader.defaults %}
{% assign lazy_loader_settings = modules.lazyLoader.settings %}

{% comment %} Set config options (settings only)
-------------------------------------------------------------------------------- {% endcomment %}
{% assign lazy_loader_options = lazy_loader_defaults | merge: lazy_loader_settings %}

{% comment %} Detect prod mode
-------------------------------------------------------------------------------- {% endcomment %}
{% assign production = false %}
{% if environment == 'prod' or environment == 'production' %}
  {% assign production = true %}
{% endif %}

/*
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/lazyLoader.js
 # J1 Adapter for the lazyLoader module (core)
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2023, 2024 Juergen Adams
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
j1.adapter.lazyLoader = (function (j1, window) {

{% comment %} Set global variables
-------------------------------------------------------------------------------- {% endcomment %}
var environment     = '{{environment}}';
var cookie_names    = j1.getCookieNames();
var user_state      = j1.readCookie(cookie_names.user_state);
var state           = 'not_started';
var lazyLoaderDefaults;
var lazyLoaderSettings;
var lazyLoaderOptions;
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
        module_name: 'j1.adapter.lazyLoader',
        generated:   '{{site.time}}'
      }, options);

      // -----------------------------------------------------------------------
      // Global variable settings
      // -----------------------------------------------------------------------

      // create settings object from module options
      //
      lazyLoaderDefaults = $.extend({}, {{lazy_loader_defaults | replace: 'nil', 'null' | replace: '=>', ':' }});
      lazyLoaderSettings = $.extend({}, {{lazy_loader_settings | replace: 'nil', 'null' | replace: '=>', ':' }});
      lazyLoaderOptions  = $.extend(true, {}, lazyLoaderDefaults, lazyLoaderSettings);

      _this  = j1.adapter.lazyLoader;
      logger = log4javascript.getLogger('j1.adapter.lazyLoader');

      var dependencies_met_lazy_loader = setInterval(function() {
        var pageFinished = (j1.getState() == 'finished') ? true: false;

        if (pageFinished) {

          _this.setState('started');
          logger.info('\n' + 'initialize moodule lazyLoader: started');

          _this.registerLoaders(lazyLoaderOptions);

          _this.setState('finished');
          logger.info('\n' + 'initialize moodule lazyLoader: finished');
          clearInterval(dependencies_met_lazy_loader);
        }
      }, 10);

    }, // END init

    // -------------------------------------------------------------------------
    // registerLoaders()
    // Lazy load CSS to speed up page rendering
    //
    // Requires the following settings:
    //
    //    src:        the 'location' of the CSS file
    //    selector:   the 'selector' that triggers the observer
    //    rootMargin: the 'margin' before the load is trigged
    //
    // -------------------------------------------------------------------------
    //
    registerLoaders: function () {
      {% for loader in lazy_loader_options.loaders %} {% if loader.enabled %}
        j1.lazyCSS().observe({
          src:        '{{loader.src}}',
          selector:   '{{loader.selector}}',
          rootMargin: '{{loader.rootMargin}}'
        });
        logger.info('\n' + 'register lazy loading for: {{loader.description}}');
      {% endif %} {% endfor %}
    }, // END registerLoaders

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
