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
 # Copyright (C) 2022 Juergen Adams
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
 # Copyright (C) 2022 Juergen Adams
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
j1.adapter.themer = (function (j1, window) {

  // ---------------------------------------------------------------------------
  // globals
  // ---------------------------------------------------------------------------
  var environment               = '{{environment}}';
  var themerOptions             = $.extend({}, {{themer_options | replace: '=>', ':' | replace: 'nil', '""' }});
  var url                       = new liteURL(window.location.href);
  var secure                    = (url.protocol.includes('https')) ? true : false;
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

  var cssExtension              = (environment === 'production') ? '.min.css' : '.css';

  var default_theme_name        = '{{default_theme.name}}';
  var default_theme_author      = '{{default_theme.author}}';
  var default_theme_author_url  = '{{default_theme.author_url}}';
  var default_theme_css_name    = default_theme_name.toLowerCase();
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
    init: function (options) {

      // -----------------------------------------------------------------------
      // Default module settings
      // -----------------------------------------------------------------------
      var settings = $.extend({
        module_name: 'j1.adapter.themer',
        generated:   '{{site.time}}'
      }, options);

      // -----------------------------------------------------------------------
      // Global variable settings
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
      logger.info('\n' + 'state: ' + _this.getState());

      // jadams, 2021-07-25: problem seems NOT an timing issue on the iPad
      // platform. (General) Dependency should be REMOVED!!!
      // TODO: Isolate redirect for iPad ONLY!!!
      //
      // jadams, 2021-07-11: added dependecy on the user state cookie
      // Found timing issues testing mobile devices (iPad)
      var dependencies_met_user_state_available = setInterval (function () {
        user_state_detected = j1.existsCookie(cookie_names.user_state);

        // counter how often the check should be done for the existence
        // of the user state cookie
        interval_count += 1;
        if (user_state_detected) {
           user_state        = j1.readCookie(cookie_names.user_state);
           user_consent      = j1.readCookie(cookie_names.user_consent);

           logger.info('\n' + 'cookie ' +  cookie_names.user_state + ' successfully loaded after: ' + interval_count * 25 + ' ms');

           // initial theme data
           if (user_state.theme_css === '') {
             user_state.theme_name       = default_theme_name;
             user_state.theme_css        = default_theme_css;
             user_state.theme_author     = default_theme_author;
             user_state.theme_author_url = default_theme_author_url;

             cookie_written = j1.writeCookie({
               name:     cookie_names.user_state,
               data:     user_state,
               secure:   secure,
               expires:  365
             });
             if (!cookie_written) {
                 logger.error('\n' + 'failed to write cookie: ' + cookie_names.user_consent);
             }
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
             logger.fatal('\n' + 'inconsistent state detected for cookie: ' + cookie_names.user_state);
           }

           // set the theme switcher state
           user_state.theme_switcher = themerOptions.enabled;

           // jadams, 2021-08-10: moved hide|show themes menu to
           // j1 adapter (displayPage)
           //
           // jadams, 2021-07-25: hide|show themes menu on cookie consent
           // (analysis|personalization) settings. BootSwatch is a 3rd party
           // is using e.g GA. Because NO control is possible on 3rd parties,
           // for GDPR compliance, themes feature may disabled on
           // privacy settings
           //
           // if (!user_consent.analysis || !user_consent.personalization)  {
           //   logger.warn('\n' + 'disable themes feature because of privacy settings');
           //   $("#themes_menu").hide();
           // } else {
           //   $("#themes_menu").show();
           // }

           if (themerOptions.enabled) {
           // enable BS ThemeSwitcher
           logger.info('\n' + 'themes detected as: enabled');
           logger.info('\n' + 'theme is being initialized: ' + user_state.theme_name);

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

           logger.info('\n' + 'theme loaded: ' + user_state.theme_name);
           logger.info('\n' + 'theme css file: ' + user_state.theme_css);
           _this.setState('finished');
           logger.info('\n' + 'state: ' + _this.getState());
           logger.info('\n' + 'module initialized successfully');
         } else {
           _this.setState('finished');
           logger.info('\n' + 'state: ' + _this.getState());
           logger.info('\n' + 'themes detected as: disabled');
         }
          clearInterval(dependencies_met_user_state_available);
        }

        if (interval_count > max_count) {
          logger.error('\n' + 'interval max count reached: ' + max_count);
          logger.error('\n' + 'check failed after: ' + max_count * 25 + ' ms');
          logger.error('\n' + 'loading cookie failed: ' + cookie_names.user_state);

          logger.debug('\n' + 'j1 cookies found:' + j1Cookies.length);
          j1Cookies.forEach(item => console.log('j1.core.switcher: ' + item));
          logger.debug('\n' + 'ga cookies found:' + gaCookies.length);
          gaCookies.forEach(item => console.log('j1.core.switcher: ' + item));

          // jadams, 2021-07-15: redirect to homepage
          // NOTE: UNCLEAR why it is needed to create the user state
          // cookie THIS way
          //
          logger.warn('\n' + 'redirect to home page');
//        window.location.href = error_page;
          window.location.href = '/';
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

      logText = '\n' + 'received message from ' + sender + ': ' + json_message;
      logger.info(logText);

      // -----------------------------------------------------------------------
      //  Process commands|actions
      // -----------------------------------------------------------------------
      if (message.type === 'command' && message.action === 'module_initialized') {
        logger.info('\n' + message.text);
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
