---
regenerate:                             true
---

{% capture cache %}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/themeToggler.js
 # Liquid template to adapt the Theme Toggler module
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
{% assign toggler_defaults    = modules.defaults.theme_toggler.defaults %}
{% assign toggler_settings    = modules.theme_toggler.settings %}

{% comment %} Set config options (settings only)
-------------------------------------------------------------------------------- {% endcomment %}
{% assign toggler_options     = toggler_defaults | merge: toggler_settings %}

{% comment %} Variables
-------------------------------------------------------------------------------- {% endcomment %}
{% assign comments            = toggler_options.enabled %}

{% comment %} Detect prod mode
-------------------------------------------------------------------------------- {% endcomment %}
{% assign production = false %}
{% if environment == 'prod' or environment == 'production' %}
  {% assign production = true %}
{% endif %}

/*
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/themeToggler.js
 # J1 Adapter for the Theme Toggler module
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
j1.adapter.themeToggler = (function (j1, window) {

{% comment %} Set global variables
-------------------------------------------------------------------------------- {% endcomment %}
var environment       = '{{environment}}';
var cookie_names      = j1.getCookieNames();
var user_state        = j1.readCookie(cookie_names.user_state);
var viewport_width    = $(window).width();
var url               = new liteURL(window.location.href);
var secure            = (url.protocol.includes('https')) ? true : false;
var cookie_names      = j1.getCookieNames();
var state             = 'not_started';
var user_state        = {};
var light_theme_css;
var dark_theme_css;
var light_theme_name;
var dark_theme_name;
var togglerDefaults;
var togglerSettings;
var togglerOptions;
var frontmatterOptions;
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
      logger = log4javascript.getLogger('j1.adapter.theme_toggler');

      // -----------------------------------------------------------------------
      // Default module settings
      // -----------------------------------------------------------------------
      var settings = $.extend({
        module_name: 'j1.adapter.waves',
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
      togglerDefaults     = $.extend({}, {{toggler_defaults | replace: 'nil', 'null' | replace: '=>', ':' }});
      togglerSettings     = $.extend({}, {{toggler_settings | replace: 'nil', 'null' | replace: '=>', ':' }});
      togglerOptions      = $.extend(true, {}, togglerDefaults, togglerSettings, frontmatterOptions);

      // toggle themes
      //
      light_theme_name    = togglerOptions.themes.light.name;
      light_theme_css     = togglerOptions.themes.light.css_file;
      dark_theme_name     = togglerOptions.themes.dark.name;
      dark_theme_css      = togglerOptions.themes.dark.css_file;;

      // -----------------------------------------------------------------------
      // initializer
      // -----------------------------------------------------------------------
      var dependencies_met_page_ready = setInterval (function (options) {
        var pageState     = $('#no_flicker').css("display");
        var pageVisible   = (pageState == 'block') ? true : false;
        var atticFinished = (j1.adapter.attic.getState() == 'finished') ? true: false;

        if (j1.getState() === 'finished' && pageVisible && atticFinished) {
            logger.info('\n' + 'initialize module: started');
            user_state = j1.readCookie(cookie_names.user_state);

            // toggle themeToggler icon to 'dark' if required
            //
            if ($('#quickLinksThemeTogglerButton').length) {
              if (user_state.theme_name == dark_theme_name) {
                $('#quickLinksThemeTogglerButton a i').toggleClass('mdib-lightbulb mdib-lightbulb-outline');
              }
            }

            $('#quickLinksThemeTogglerButton').click(function() {

              if (user_state.theme_name == light_theme_name) {
                user_state.theme_name = dark_theme_name;
                user_state.theme_css  = dark_theme_css;
                user_state.theme_icon = 'mdib-lightbulb';
              } else {
                user_state.theme_name = light_theme_name;
                user_state.theme_css  = light_theme_css;
                user_state.theme_icon = 'mdib-lightbulb-outline';
              }

              logger.info('\n' + 'switch theme to: ' + user_state.theme_name);

              user_state.writer = 'themeToggler';
              var cookie_written = j1.writeCookie({
                name:     cookie_names.user_state,
                data:     user_state,
                secure:   secure,
                expires:  365
              });

              if (!cookie_written) {
                logger.error('\n' + 'failed write to cookie: ' + cookie_names.user_consent);
              } else {
                location.reload(true);
              }

            });

            logger.info('\n' + 'initializing module: finished');
            clearInterval(dependencies_met_page_ready);
        }
      }, 10);
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
