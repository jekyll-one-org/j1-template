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
  var environment               = '{{environment}}';
  var themerOptions             = $.extend({}, {{themer_options | replace: '=>', ':' | replace: 'nil', '""' }});
  var user_state                = {};
  var user_consent              = {};
  var cookie_names              = j1.getCookieNames();
  var user_state_detected       = false;
  var styleLoaded               = false;
  var id                        = 'default';
  var user_state_cookie;
  var theme_css_html;
  var _this;
  var logger;
  var logText;
  var cookie_written;

  var cssExtension              = (environment === 'production')
                                  ? '.min.css'
                                  : '.css';

  var default_theme_name        = '{{default_theme.name}}';
  var default_theme_author      = '{{default_theme.author}}';
  var default_theme_author_url  = '{{default_theme.author_url}}';
  var default_theme_css_name    = default_theme_name.toLowerCase().replace(' ', '-');
  var default_theme_css         = '{{asset_path}}/{{theme_base}}/' + default_theme_css_name + '/bootstrap' + cssExtension;

  var interval_count            = 0;
  var max_count                 = themerOptions.retries;

  var j1Cookies;
  var gaCookies;

  var url;
  var baseUrl;
  var error_page;

  // ---------------------------------------------------------------------------
  // helper functions
  // ---------------------------------------------------------------------------

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
      _this       = j1.adapter.themer;
      url         = new liteURL(window.location.href);
      baseUrl     = url.origin;
      error_page  = url.origin + '/204.html';
      j1Cookies   = j1.findCookie('j1');
      gaCookies   = j1.findCookie('_ga');
      logger      = log4javascript.getLogger('j1.adapter.themer');

      // initialize state flag
      _this.state = 'started';
      logger.info('state: ' + _this.getState());

      // jadams, 2021-07-11: added dependecy on the user stae cookie
      // Found timing issues testing mobile devices (iPad)
      var dependencies_met_user_state_available = setInterval (function () {
        user_state_detected = j1.existsCookie(cookie_names.user_state);

        // counter how often the check should be done for the existence
        // of the user state cookie
        interval_count += 1;
        if (user_state_detected) {
           user_state        = j1.readCookie(cookie_names.user_state);
           user_consent      = j1.readCookie(cookie_names.user_consent);

           logger.info('cookie ' +  cookie_names.user_state + ' successfully loaded after: ' + interval_count * 25 + ' ms');

           // initial theme data
           if (user_state.theme_css === '') {
             user_state.theme_name       = default_theme_name;
             user_state.theme_css        = default_theme_css;
             user_state.theme_author     = default_theme_author;
             user_state.theme_author_url = default_theme_author_url;
           }

           styleLoaded     = styleSheetLoaded(user_state.theme_css);
           theme_css_html  = '<link rel="stylesheet" id="' + id + '" href="' + user_state.theme_css + '" type="text/css" />';

           // check cookie consistency
           if (Object.keys(user_state).length > 2)  {
             // loading theme CSS file except on UNO
             if (!user_state.theme_name.includes('Uno') || !styleLoaded) {
               $('head').append(theme_css_html);
             }
           } else {
             logger.fatal('inconsistent state detected for cookie: ' + cookie_names.user_state);
           }

           // set the theme switcher state
           user_state.theme_switcher = themerOptions.enabled;

           // jadams, 2021-07-11: unclear why the cookie consent is checked here
           if (!user_consent.analyses || !user_consent.personalization)  {
             // expire state cookie to session
             cookie_written = j1.writeCookie({
               name:     cookie_names.user_state,
               data:     user_state,
               samesite: 'Strict'
             });
             if (!cookie_written) {
             	logger.error('failed to write cookie: ' + cookie_names.user_state);
             }
           } else {
             cookie_written = j1.writeCookie({
               name:     cookie_names.user_state,
               data:     user_state,
               samesite: 'Strict',
               expires:  365
             });
             if (!cookie_written) {
             	logger.error('failed to write cookie: ' + cookie_names.user_state);
             }
           }

           if (themerOptions.enabled) {
           // enable BS ThemeSwitcher
           logger.info('themes detected as: enabled');
           logger.info('theme is being initialized: ' + user_state.theme_name);

           /* eslint-disable */
           // load list of remote themes
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
           };
           /* eslint-enable */

           logger.info('theme loaded: ' + user_state.theme_name);
           logger.info('theme css file: ' + user_state.theme_css);
           _this.setState('finished');
           logger.info('state: ' + _this.getState());
           logger.info('module initialized successfully');
         } else {
           _this.setState('finished');
           logger.info('state: ' + _this.getState());
           logger.info('themes detected as: disabled');
         }
          clearInterval(dependencies_met_user_state_available);
        } else {
          logger.info('wait for cookie to be loaded: ' + cookie_names.user_state);
        }
        if (interval_count > max_count) {
          logger.error('interval max count loading cookie reached: ' + interval_count);
          logger.error('check failed after: ' + interval_count * 25 + ' ms');
          logger.fatal('loading cookie failed: ' + cookie_names.user_state);

          // for development only
          if (environment === 'development') {
            gaCookies.forEach(item => console.log('cookieConsent: ' + item));
            j1Cookies.forEach(item => console.log('cookieConsent: ' + item));
          }
          
          // jadams, 2021-07-13: display error page instead to continue
          //
          logger.warn('redirect to error page');
          window.location.href = error_page;
          clearInterval(dependencies_met_user_state_available);
        }
      }, 25); // END dependencies_met_user_state_available
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
