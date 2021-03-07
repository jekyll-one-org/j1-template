---
regenerate:                             true
---

{% capture cache %}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/themer.js
 # Liquid template to adapt theme functions
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2021 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # For details, see https://jekyll.one
 #
 # -----------------------------------------------------------------------------
 # Test data:
 #  {{config| debug }}
 # -----------------------------------------------------------------------------
{% endcomment %}

{% comment %} Liquid procedures
-------------------------------------------------------------------------------- {% endcomment %}

{% comment %} Set global settings
-------------------------------------------------------------------------------- {% endcomment %}
{% assign environment       = site.environment %}
{% assign template_version  = site.version %}
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
{% assign themer_defaults   = modules.defaults.themer.defaults %}
{% assign themer_settings   = modules.themer.settings %}

{% comment %} Set config options
-------------------------------------------------------------------------------- {% endcomment %}
{% assign themer_options    = themer_defaults| merge: themer_settings %}
{% assign default_theme     = template_config.theme %}
{% assign theme_base        = "core/css/themes" %}

{% if environment == "development" or environment == "test" %}
  {% assign theme_ext       = "css" %}
{% else %}
  {% assign theme_ext       = "min.css" %}
{% endif %}

{% assign production = false %}
{% if environment == 'prod' or environment == 'production' %}
  {% assign production = true %}
{% endif %}

/*
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/themer.js
 # JS Adapter for J1 themer (bootstrapThemeSwitcher)
 #
 # Product/Info:
 # https://jekyll.one
 # https://github.com/jguadagno/bootstrapThemeSwitcher
 #
 # Copyright (C) 2021 Juergen Adams
 # Copyright (C) 2014 Joseph Guadagno
 #
 # J1 Template is licensed under the MIT License.
 # For details, see https://jekyll.one
 # bootstrapThemeSwitcher is licensed under the MIT License.
 # For details, see https://github.com/jguadagno/bootstrapThemeSwitcher/blob/master/LICENSE
 # -----------------------------------------------------------------------------
 # NOTE:
 #  Setup of theme loaders for local_themes|remote_themes moved
 #  to adapter navigator.js
 # -----------------------------------------------------------------------------
 # Adapter generated: {{site.time}}
 # -----------------------------------------------------------------------------
*/

// -----------------------------------------------------------------------------
// ESLint shimming
// -----------------------------------------------------------------------------
/* eslint indent: "off"                                                       */
/* eslint quotes: "off"                                                       */
// -----------------------------------------------------------------------------

'use strict';

j1.adapter['themer'] = (function (j1, window) {
  // ---------------------------------------------------------------------------
  // globals
  // ---------------------------------------------------------------------------
  var environment                 = '{{environment}}';
  var themerOptions               = $.extend({}, {{themer_options | replace: '=>', ':' | replace: 'nil', '""' }});
  var user_state                  = {};
  var cookie_names                = j1.getCookieNames();
  var cookie_user_state_name      = cookie_names.user_state;
  var user_state_detected         = false;
  var styleLoaded                 = false;
  var id                          = 'default';
  var user_state_cookie;
  var theme_css_html;
  var _this;
  var logger;
  var logText;

  var default_theme_name        = '{{default_theme.name}}';
  var default_theme_author      = '{{default_theme.author}}';
  var default_theme_author_url  = '{{default_theme.theme_author_url}}';
  var default_theme_css_name    = default_theme_name.toLowerCase().replace(' ', '-');
  var default_theme_css         = (environment == 'production')
                                  ? '{{asset_path}}/{{theme_base}}/' +default_theme_css_name+ '/bootstrap.min.css'
                                  : '{{asset_path}}/{{theme_base}}/' +default_theme_css_name+ '/bootstrap.css';

  // ---------------------------------------------------------------------------
  // helper functions
  // ---------------------------------------------------------------------------
  // Example: var styleLoaded = styleSheetLoaded('');
  function styleSheetLoaded(styleSheet) {
    var sheets = document.styleSheets, stylesheet = sheets[(sheets.length - 1)];

    // find CSS file 'styleSheetName' in document
    for(var i in document.styleSheets) {
      if(sheets[i].href && sheets[i].href.indexOf(styleSheet) > -1) {
        return true;
      }
    }
    return false;
  }

  // ---------------------------------------------------------------------------
  // Main object
  // ---------------------------------------------------------------------------
  return {
    // -------------------------------------------------------------------------
    // initializer
    // -------------------------------------------------------------------------
    init: function () {
      // -----------------------------------------------------------------------
      // globals
      // -----------------------------------------------------------------------
      _this     = j1.adapter.themer;
      logger    = log4javascript.getLogger('j1.adapter.themer');

      // initialize state flag
      _this.state = 'started';
      logger.info('state: ' + _this.getState());

      // Detect|Set J1 UserState
      user_state_detected = j1.existsCookie(cookie_user_state_name);
      if (user_state_detected) {
        user_state            = j1.readCookie(cookie_user_state_name);
      }

      // initial user_state cookie
      //
      if ( user_state.theme_name == '') {
        user_state.theme_name       = default_theme_name;
        user_state.theme_css        = default_theme_css;
        user_state.theme_author     = default_theme_author;
        user_state.theme_author_url = default_theme_author_url;
      }

      styleLoaded     = styleSheetLoaded(user_state.theme_css);
      theme_css_html  = '<link rel="stylesheet" id="' + id + '" href="' + user_state.theme_css + '" type="text/css" />';

      // skip loading UNO CSS file except it is NOT loaded
      //
      if (!user_state.theme_name.includes('Uno') || !styleLoaded) {
        $('head').append(theme_css_html);
      }

      // store if theme_switcher is enabled
      //
      user_state.theme_switcher = themerOptions.enabled;

      j1.writeCookie({
        name: cookie_user_state_name,
        data: user_state,
        expires: 365                                                            // was missing
      });

      // jadams, 2021-01-03: dependency has to be checked in more detail
      //
      var dependencies_met_j1_finished = setInterval (function () {
        // if (j1.getState() == 'finished' && j1.navigator.getState() == 'finished') {
        if (j1.getState() == 'finished') {
        // if (j1.navigator.getState() == 'finished') {
          if (themerOptions.enabled) {
            // enable BS ThemeSwitcher
            //
            logger.info('themes detected as: enabled');
            logger.info('theme is being initialized: ' + user_state.theme_name);

            // jadams, 2021-02-22: make sure that remote themes are loaded
            // max retries = max_count

            // load list of remote themes
            //
            if ( $('#remote_themes').length ) {
              var interval_count = 0;
              var max_count      = themerOptions.retries;

              /* eslint-disable */
              // initialize Bootswatch Theme Switcher
              $('#remote_themes').bootstrapThemeSwitcher.defaults = {
                debug:                    themerOptions.debug,
                saveToCookie:             themerOptions.saveToCookie,
                cssThemeLink:             themerOptions.cssThemeLink,
                cookieThemeName:          themerOptions.cookieThemeName,
                cookieDefaultThemeName:   themerOptions.cookieDefaultThemeName,
                cookieThemeCss:           themerOptions.cookieThemeCss,
                cookieThemeExtensionCss:  themerOptions.cookieThemeExtensionCss,
                cookieExpiration:         themerOptions.cookieExpiration,
                cookiePath:               themerOptions.cookiePath,
                defaultCssFile:           themerOptions.defaultCssFile,
                bootswatchApiUrl:         themerOptions.bootswatchApiUrl,
                bootswatchApiVersion:     themerOptions.bootswatchApiVersion,
                loadFromBootswatch:       themerOptions.loadFromBootswatch,
                localFeed:                themerOptions.localThemes,
                excludeBootswatch:        themerOptions.excludeBootswatch,
                includeBootswatch:        themerOptions.includeBootswatch,
                skipIncludeBootswatch:    themerOptions.skipIncludeBootswatch
              }
              /* eslint-enable */

              // jadams, 2021-02-16: load checking disabled. Seem does NOT
              // solve the problem

              // var dependencies_met_remote_themes_loaded = setInterval(function() {
              //   interval_count += 1;
              //   if ( document.getElementById("remote_themes").getElementsByTagName("li").length == 0  ) {
              //     /* eslint-disable */
              //     // initialize Bootswatch Theme Switcher
              //     $('#remote_themes').bootstrapThemeSwitcher.defaults = {
              //       debug:                    themerOptions.debug,
              //       saveToCookie:             themerOptions.saveToCookie,
              //       cssThemeLink:             themerOptions.cssThemeLink,
              //       cookieThemeName:          themerOptions.cookieThemeName,
              //       cookieDefaultThemeName:   themerOptions.cookieDefaultThemeName,
              //       cookieThemeCss:           themerOptions.cookieThemeCss,
              //       cookieThemeExtensionCss:  themerOptions.cookieThemeExtensionCss,
              //       cookieExpiration:         themerOptions.cookieExpiration,
              //       cookiePath:               themerOptions.cookiePath,
              //       defaultCssFile:           themerOptions.defaultCssFile,
              //       bootswatchApiUrl:         themerOptions.bootswatchApiUrl,
              //       bootswatchApiVersion:     themerOptions.bootswatchApiVersion,
              //       loadFromBootswatch:       themerOptions.loadFromBootswatch,
              //       localFeed:                themerOptions.localThemes,
              //       excludeBootswatch:        themerOptions.excludeBootswatch,
              //       includeBootswatch:        themerOptions.includeBootswatch,
              //       skipIncludeBootswatch:    themerOptions.skipIncludeBootswatch
              //     }
              //     /* eslint-enable */
              //   } else {
              //     logger.info('remote themes loaded: successfully');
              //     logger.debug('remote themes loaded: successfully after: ' + interval_count * 25 + ' ms');
              //     clearInterval(dependencies_met_remote_themes_loaded);
              //   }
              //   if (interval_count > max_count) {
              //     logger.warn('remote themes loading: failed');
              //     logger.warn('continue processing');
              //     clearInterval(dependencies_met_remote_themes_loaded);
              //   }
              // }, 25);

              logger.info('theme loaded: ' + user_state.theme_name);
              logger.info('theme css file: ' + user_state.theme_css);
              _this.setState('finished');
              logger.info('state: ' + _this.getState());
              logger.info('module initialized successfully');
              logger.info('met dependencies for: j1.adapter');
            }
          } else {
            _this.setState('finished');
            logger.info('state: ' + _this.getState());
            logger.info('themes detected as: disabled');
          }
          clearInterval(dependencies_met_j1_finished);
        }
      }, 25); // END 'dependencies_met_j1_finished'
    }, // END init

    // -------------------------------------------------------------------------
    // messageHandler
    // Manage messages send from other J1 modules
    // -------------------------------------------------------------------------
    messageHandler: function (sender, message) {
      var json_message = JSON.stringify(message, undefined, 2);

      logText = 'received message from ' + sender + ': ' + json_message;
      logger.info(logText);

      // -----------------------------------------------------------------------
      //  Process commands|actions
      // -----------------------------------------------------------------------
      if (message.type === 'command' && message.action === 'module_initialized') {
        logger.info(message.text);
        //
        // Place handling of other command|action here
        //
      }
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
  {{cache| minifyJS }}
{% else %}
  {{cache| strip_empty_lines }}
{% endif %}
{% assign cache = nil %}
