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
 # Copyright (C) 2023 Juergen Adams
 #
 # J1 Theme is licensed under the MIT License.
 # For details, see: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE.md
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

{% comment %} Detect prod mode
-------------------------------------------------------------------------------- {% endcomment %}
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
 # Copyright (C) 2023 Juergen Adams
 # Copyright (C) 2014 Joseph Guadagno
 #
 # J1 Theme is licensed under the MIT License.
 # For details, see: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE.md
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

  // see: https://stackoverflow.com/questions/4301968/checking-a-url-in-jquery-javascript
  // see: https://stackoverflow.com/questions/16481598/prevent-unhandled-jquery-ajax-error
  //
  var urlExists = function(url, callback) {
      if ( ! $.isFunction(callback)) {
         throw Error('Not a valid callback');
      }

      $.ajax({
        type:     'HEAD',
        url:      url,
        success:  $.proxy(callback, this, true),
        error:    $.proxy(callback, this, false)
      });
  };

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
      logger.debug('\n' + 'state: ' + _this.getState());

      $('#no_flicker').hide();

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
           user_state   = j1.readCookie(cookie_names.user_state);
           user_consent = j1.readCookie(cookie_names.user_consent);

           logger.debug('\n' + 'cookie ' +  cookie_names.user_state + ' successfully loaded after: ' + interval_count * 25 + ' ms');

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

           // set the theme switcher state
           user_state.theme_switcher = themerOptions.enabled;
           if (themerOptions.enabled) {
             // enable BS ThemeSwitcher
             logger.info('\n' + 'themes detected as: ' + themerOptions.enabled);
             logger.info('\n' + 'remote themes are being initialized');

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
           } else {
             logger.warn('\n' + 'themes detected as: disabled');
             logger.warn('\n' + 'no remote themes are available');
          }

          // validate theme to be loaded
           urlExists(user_state.theme_css, function(success) {
             // load  theme
             if (success) {
               // continue processing if page is ready
               var dependencies_met_theme_loaded = setInterval (function () {
                 if (j1.getState() == 'finished') {
//                 $('#no_flicker').hide();
                   theme_css_html = '<link rel="stylesheet" id="' + id + '" href="' + user_state.theme_css + '" type="text/css" />';
                   $('head').append(theme_css_html);

                   clearInterval(dependencies_met_theme_loaded);
                 }
               }, 25); // END dependencies_met_theme_loaded
             } else {
               // invalid theme, fallback on default
               logger.warn('\n' + 'themes CSS invalid: ' + user_state.theme_css);
               theme_css_html = '<link rel="stylesheet" id="' + id + '" href="' + default_theme_css + '" type="text/css" />';
               logger.warn('\n' + 'set default theme :' + default_theme_name);
               logger.debug('\n' + 'theme CSS loaded: ' + default_theme_css);
               $('head').append(theme_css_html);

               // write theme defaults to cookie
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

               // reload page using the default thme
               location.reload(true);
             }
           });
          clearInterval(dependencies_met_user_state_available);
        }
      }, 25); // END dependencies_met_user_state_available

      // set final module state if theme loaded
      var dependencies_met_theme_applied = setInterval (function () {
        user_state  = j1.readCookie(cookie_names.user_state);
        styleLoaded = styleSheetLoaded(user_state.theme_css);

        if (styleLoaded) {
          logger.info('\n' + 'theme loaded successfully: ' + user_state.theme_name);
          logger.debug('\n' + 'theme CSS loaded: ' + user_state.theme_css);
          _this.setState('finished');
          logger.debug('\n' + 'state: ' + _this.getState());
          logger.info('\n' + 'module initialized successfully');
          $('#no_flicker').show();
          clearInterval(dependencies_met_theme_applied);
        }

      }, 25); // END dependencies_met_theme_applied

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
