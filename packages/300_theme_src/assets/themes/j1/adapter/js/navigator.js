---
regenerate:                             true
---

{% capture cache %}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/navigator.js
 # Liquid template to adapt Navigator Core functions
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2023 Juergen Adams
 #
 # J1 Theme is licensed under the MIT License.
 # For details, see: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE.md
 # -----------------------------------------------------------------------------
 # Test data:
 #  {{ liquid_var | debug }}
 # -----------------------------------------------------------------------------
 # NOTE:
 #
 # JSON pretty print
 # Example: var str = JSON.stringify(obj, null, 2); // spacing level = 2
 # See: https://stackoverflow.com/questions/4810841/how-can-i-pretty-print-json-using-javascript
 # -----------------------------------------------------------------------------
 # NOTE:
 #  jadams, 2020-06-21:
 #    J1 Navigator needs a general revision on BS4 code and functionalities
 #    Current, only base function are tested with BS4 (was coded for BS3)
 # -----------------------------------------------------------------------------
 # NOTE:
 #  jadams, 2020-07-17:
 #    J1 Navigator can't be minfied for now. Uglifier fails on an ES6
 #    (most probably) structure that couldn't fixed by 'harmony' setting.
 #    Minifier fails by:
 #    Unexpected token: punc ())
 #    Current, minifying has been disabled
 # -----------------------------------------------------------------------------
{% endcomment %}

{% comment %} Liquid procedures
-------------------------------------------------------------------------------- {% endcomment %}
{% capture select_color %}themes/{{site.template.name}}/procedures/global/select_color.proc{% endcapture %}

{% comment %} Set global settings
-------------------------------------------------------------------------------- {% endcomment %}
{% assign environment                   = site.environment %}
{% assign brand_image_height            = site.brand.image_height %}

{% comment %} Process YML config data
================================================================================ {% endcomment %}


{% comment %} Set config files
{% assign auth_manager_config           = site.j1_auth %}
-------------------------------------------------------------------------------- {% endcomment %}
{% assign template_config               = site.data.j1_config %}
{% assign blocks                        = site.data.blocks %}
{% assign modules                       = site.data.modules %}

{% assign themer_defaults               = modules.defaults.themer.defaults %}
{% assign themer_settings               = modules.themer.settings %}

{% assign authentication_defaults       = modules.defaults.authentication.defaults %}
{% assign authentication_settings       = modules.authentication.settings %}

{% assign template_config               = site.data.template_settings %}
{% assign navigator_defaults            = site.data.modules.defaults.navigator.defaults %}
{% assign navigator_settings            = site.data.modules.navigator.settings %}

{% comment %} Set config data
-------------------------------------------------------------------------------- {% endcomment %}
{% assign nav_bar_defaults              = navigator_defaults.nav_bar %}
{% assign nav_bar_settings              = navigator_settings.nav_bar %}
{% assign nav_menu_defaults             = navigator_defaults.nav_menu %}
{% assign nav_menu_settings             = navigator_settings.nav_menu %}

{% assign nav_quicklinks_defaults       = navigator_defaults.nav_quicklinks %}
{% assign nav_quicklinks_settings       = navigator_settings.nav_quicklinks %}
{% assign nav_authclient_defaults       = authentication_defaults.auth_client %}
{% assign nav_authclient_settings       = authentication_settings.auth_client %}

{% comment %} Set config options
-------------------------------------------------------------------------------- {% endcomment %}
{% assign authentication_options        = authentication_defaults | merge: authentication_settings %}
{% assign themer_options                = themer_defaults | merge: themer_settings %}
{% assign nav_bar_options               = nav_bar_defaults | merge: nav_bar_settings %}
{% assign nav_menu_options              = nav_menu_defaults | merge: nav_menu_settings %}
{% assign quicklinks_options            = nav_quicklinks_defaults | merge: nav_quicklinks_settings %}
{% assign authclient_options            = nav_authclient_defaults | merge: nav_authclient_settings %}

{% assign nav_bar_id                    = navigator_defaults.nav_bar.id %}
{% assign nav_menu_id                   = navigator_defaults.nav_menu.id %}
{% assign nav_quicklinks_id             = navigator_defaults.nav_quicklinks.id %}
{% assign nav_navbar_media_breakpoint   = navigator_defaults.nav_bar.media_breakpoint %}
{% assign authclient_modals_id          = navigator_defaults.nav_authclient.xhr_container_id %}

{% if nav_bar_options.dropdown_animate_duration != null %}
 {% assign animate_duration             = nav_bar_options.dropdown_animate_duration %}
{% else %}
 {% assign animate_duration             = 1 %}
{% endif %}

{% comment %} Detect prod mode
-------------------------------------------------------------------------------- {% endcomment %}
{% assign production = false %}
{% if environment == 'prod' or environment == 'production' %}
  {% assign production = true %}
{% endif %}

{% comment %}
--------------------------------------------------------------------------------
Set|Overload Liquid vars hardwired to NOT break the (MD) style
ToDo: Remove configuration from j1_navigator.yml
-------------------------------------------------------------------------------- {% endcomment %}
{% assign dropdown_border_height        = "3" %}

/*
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/navigator.js
 # JS Adapter for J1 Navigator
 #
 # Product/Info:
 # {{site.data.template_settings.theme_author_url}}
 #
 # Copyright (C) 2023 Juergen Adams
 #
 # J1 Theme is licensed under the MIT License.
 # For details, see {{site.data.template_settings.theme_author_url}}
 # -----------------------------------------------------------------------------
 # NOTE: For AJAX (XHR) loads see
 #  https://stackoverflow.com/questions/3709597/wait-until-all-jquery-ajax-requests-are-done
 # -----------------------------------------------------------------------------
 # NOTE: For getStyleValue helper see
 #  https://stackoverflow.com/questions/16965515/how-to-get-a-style-attribute-from-a-css-class-by-javascript-jquery
 # -----------------------------------------------------------------------------
 # Adapter generated: {{site.time}}
 # -----------------------------------------------------------------------------
*/

// -----------------------------------------------------------------------------
// ESLint shimming
// -----------------------------------------------------------------------------
/* eslint indent: "off"                                                       */
// -----------------------------------------------------------------------------
'use strict';
j1.adapter.navigator = (function (j1, window) {

  // ---------------------------------------------------------------------------
  // globals
  // ---------------------------------------------------------------------------
  var environment                 = '{{environment}}';
  var dclFinished                 = false;
  var moduleOptions               = {};

  var nav_menu_id                 = '{{nav_menu_id}}';
  var nav_quicklinks_id           = '{{nav_quicklinks_id}}';

  var authclient_modals_id        = '{{authclient_modals_id}}';
  var authclient_xhr_data_element = '{{authclient_options.xhr_data_element}}';
  var authclient_modals_data_path = '{{authclient_options.xhr_data_path}}';

  var nav_menu_data_path          = '{{nav_menu_options.data_path}}';
  var nav_quicklinks_data_path    = '{{quicklinks_options.data_path}}';

  var colors_data_path            = '{{template_config.colors_data_path}}';
  var font_size_data_path         = '{{template_config.font_size_data_path}}';


  var cookie_names                = j1.getCookieNames();
  var cookie_user_session_name    = cookie_names.user_session;

  var user_session                = {};
  var user_session_merged         = {};
  var session_state               = {};

  var themerEnabled               = {{themer_options.enabled}};                 //was (test): false;
  var authClientEnabled;
  var appDetected;
  var json_data;
  var _this;
  var logger;
  var logText;


  // ---------------------------------------------------------------------------
  // helper functions
  // ---------------------------------------------------------------------------

  // ---------------------------------------------------------------------------
  // main object
  // ---------------------------------------------------------------------------
  return {

    // -------------------------------------------------------------------------
    // module initializer
    // -------------------------------------------------------------------------
    init: function (options) {

      // -----------------------------------------------------------------------
      // Default module settings
      // -----------------------------------------------------------------------
      var settings  = $.extend({
        module_name: 'j1.adapter.navigator',
        generated:   '{{site.time}}'
      }, options);

      // -----------------------------------------------------------------------
      // Global variable settings
      // -----------------------------------------------------------------------
      _this         = j1.adapter.navigator;
      logger        = log4javascript.getLogger('j1.adapter.navigator');

      // initialize state flag
      _this.setState('started');
      logger.debug('\n' + 'state: ' + _this.getState());
      logger.info('\n' + 'module is being initialized');

      // -----------------------------------------------------------------------
      // options loader
      // -----------------------------------------------------------------------
      /* eslint-disable */
      var authConfig                                = {};
      var navDefaults                               = {};
      var navBarConfig                              = {};
      var navMenuConfig                             = {};
      var navQuicklinksConfig                       = {};
      var navAuthClientConfig                       = {};
      var navBarOptions                             = {};
      var navMenuOptions                            = {};
      var navQuicklinksOptions                      = {};
      var navAuthClientOptions                      = {};
      var navAuthMAnagerConfig                      = {};

      var user_state                                = {};
      var cookie_names                              = j1.getCookieNames();
      var cookie_user_state_name                    = cookie_names.user_state;

      var themerOptions                             = {};
      var interval_count                            = 0;
      var user_state_detected;
      var themes_count;
      var max_count                                 = 100;

      var gaCookies                                 = j1.findCookie('_ga');
      var j1Cookies                                 = j1.findCookie('j1');

      navDefaults                                   = $.extend({}, {{navigator_defaults | replace: '=>', ':' }});
      navBarConfig                                  = $.extend({}, {{nav_bar_options | replace: '=>', ':' }});
      navMenuConfig                                 = $.extend({}, {{nav_menu_options | replace: '=>', ':' }});
      navQuicklinksConfig                           = $.extend({}, {{quicklinks_options | replace: '=>', ':' }});
      navAuthClientConfig                           = $.extend({}, {{authclient_options | replace: '=>', ':' }});

      navAuthMAnagerConfig                          = $.extend({}, {{authentication_options | replace: '=>', ':' }});
      authClientEnabled                             = navAuthMAnagerConfig.enabled;

      themerOptions                                 = $.extend({}, {{themer_options | replace: '=>', ':' | replace: 'nil', '""' }});

      // Merge|Overload module CONFIG by DEFAULTS
      //
      navBarOptions                                 = j1.mergeData(navBarConfig, navDefaults.nav_bar);
      navMenuOptions                                = j1.mergeData(navMenuConfig, navDefaults.nav_menu);
      navQuicklinksOptions                          = j1.mergeData(navQuicklinksConfig, navDefaults.nav_quicklinks);
      navAuthClientConfig                           = j1.mergeData(navAuthClientConfig, navDefaults.nav_authclient);

      // save config settings into the adapter object for global access
      //
      _this['navDefaults']           = navDefaults;
      _this['navBarOptions']         = navBarOptions;
      _this['navMenuOptions']        = navMenuOptions;
      _this['navQuicklinksOptions']  = navQuicklinksOptions;
      _this['navAuthClientConfig']   = navAuthClientConfig;
      _this['navAuthManagerConfig']  = navAuthMAnagerConfig;

      // Load (individual) frontmatter options (currently NOT used)
      if (options  != null) { var frontmatterOptions = $.extend({}, options) }
      /* eslint-enable */

      // -----------------------------------------------------------------------
      // Load HTML data (AJAX)
      // -----------------------------------------------------------------------
      // jadams, 202-06-24: Promise (chain) if $.when seems NOT to work correctly.
      // It seems a chain using .then will be a better solution to make it sure
      // that the last Deferred set the state to 'data_loaded'.
      // Found the final state randomly set to 'null' what prevent the module
      // to run mmenuInitializer.
      // Workaround: Set 'data_loaded' to be returned by all Deferred in
      // the chain.
      // See: https://stackoverflow.com/questions/5436327/jquery-deferreds-and-promises-then-vs-done
      // authclient_xhr_data_element
      // -----------------------------------------------------------------------
      // data loader
      // -----------------------------------------------------------------------
      j1.loadHTML({
        xhr_container_id:   navQuicklinksOptions.xhr_container_id,
        xhr_data_path:      navQuicklinksOptions.xhr_data_path,
        xhr_data_element:   navQuicklinksOptions.xhr_data_element },
        'j1.adapter.navigator',
        null);
      j1.loadHTML({
        xhr_container_id:   navAuthClientConfig.xhr_container_id,
        xhr_data_path:      navAuthClientConfig.xhr_data_path,
        xhr_data_element:   navAuthClientConfig.xhr_data_element },
        'j1.adapter.navigator',
        null);
      j1.loadHTML({
        xhr_container_id:   navMenuOptions.xhr_container_id,
        xhr_data_path:      navMenuOptions.xhr_data_path,
        xhr_data_element:   navMenuOptions.xhr_data_element },
        'j1.adapter.navigator',
        'data_loaded');

        var dependencies_met_load_menu_finished = setInterval (function () {
  	      if (j1.xhrDOMState['#'+navQuicklinksOptions.xhr_container_id] === 'success' &&
            j1.xhrDOMState['#'+navAuthClientConfig.xhr_container_id] === 'success' &&
            j1.xhrDOMState['#'+navMenuOptions.xhr_container_id] === 'success' ) {
            // continue if all AJAX loads (loadHTML) has finished
            _this.setState('processing');
            logger.info('\n' + 'status: ' + _this.getState());
            logger.info('\n' + 'initialize navigator core');

            // Detect|Set J1 App status
            appDetected       = j1.appDetected();
            authClientEnabled = j1.authEnabled();
            logger.info('\n' + 'application status detected: ' + appDetected);

            j1.core.navigator.init (_this.navDefaults, _this.navMenuOptions);

            // load themes (to menu) if themer is enabled|finished
            if (themerEnabled) {
              logText = '\n' + 'theme switcher: enabled';
              logger.info(logText);

              // detect j1 user state cookie
              user_state_detected = j1.existsCookie(cookie_user_state_name);


              if (user_state_detected) {
                user_state        = j1.readCookie(cookie_user_state_name);
              }  else {
                logger.error('\n' + 'cookie not found: j1.user.state');
                logger.debug('\n' + 'j1 cookies found:' + j1Cookies.length);
                j1Cookies.forEach(item => console.log('j1.core.switcher: ' + item));
                logger.debug('\n' + 'ga cookies found:' + gaCookies.length);
                gaCookies.forEach(item => console.log('j1.core.switcher: ' + item));
              }

              // jadams, 2021-07-03: wait until navigator CORE get finished
              var dependencies_met_page_finished = setInterval(function() {
                if (j1.adapter.navigator.getState() == 'core_initialized') {
                  logText = '\n' + 'load themes';
                  logger.info(logText);

                  // load LOCAL themes from JSON data
                  logText = '\n' + 'load local themes (json file)';
                  logger.info(logText);
                  $('#local_themes').bootstrapThemeSwitcher({
                    localFeed: themerOptions.localThemes
                  });

                  // load REMOTE themes from Bootswatch API (localFeed EMPTY!)
                  $('#remote_themes').bootstrapThemeSwitcher({
                    localFeed: '',
                    bootswatchApiVersion: themerOptions.bootswatchApiVersion
                  });

                  // jadams, 2021-04-22: Up to now, it is unclear why in some
                  // cases the menu bar is NOT fully loaded for THEMES
                  // TODO: Add additional checks to find the reason

                  // added same checks (as already done by adapter themer) to
                  // check if remote theme menu detected as LOADED
                  //
                  var dependencies_met_remote_themes_loaded = setInterval(function() {
                    interval_count += 1;
                    themes_count = document.getElementById("remote_themes").getElementsByTagName("li").length;
                    if ( themes_count > 0  ) {
                      logger.info('\n' + 'remote themes loaded: successfully');
                      logger.info('\n' + 'remote themes loaded: successfully after: ' + interval_count * 25 + ' ms');

                      clearInterval(dependencies_met_remote_themes_loaded);
                    } else {
                        logger.debug('\n' + 'wait for theme to be loaded: ' + user_state.theme_name);
                    }
                    if (interval_count > max_count) {
                      logger.warn('\n' + 'remote themes loading: failed');
                      logger.warn('\n' + 'continue processing');
                      clearInterval(dependencies_met_remote_themes_loaded);
                    }
                    clearInterval(dependencies_met_page_finished);
                  }, 25);
                }
//              _this.setState('initialized');
                _this.setState('finished');
              }, 25); // END 'dependencies_met_page_finished'
            } else {
              logText = '\n' + 'theme switcher detected as: disabled';
              logger.info(logText);
              _this.setState('finished');
            }

            // -----------------------------------------------------------------
            // event handler|css styles
            // -----------------------------------------------------------------
            var dependencies_met_initialized = setInterval(function() {
              var pageState   = $('#no_flicker').css("display");
              var pageVisible = (pageState == 'block') ? true: false;
              // initialize if page and themer ready
              if (j1.getState() === 'finished' && j1.adapter.themer.getState() === 'finished' && pageVisible) {
                _this.setState('processing');

                // apply module configuration settings
                _this.applyNavigatorSettings (
                  navDefaults, navBarOptions, navMenuOptions,
                  navQuicklinksOptions
                );

                // (static) delay applying styles until added CSS data
                // of the theme is processed by the browser
                // TODO: Check why a timeout is required to load dynamic styles in a page
                setTimeout (function() {
                  // set general|global theme colors
                  logger.info('\n' + 'initializing dynamic CSS styles');
                  _this.applyThemeSettings (
                    navDefaults, navBarOptions, navMenuOptions,
                    navQuicklinksOptions
                  );
                }, {{template_config.page_on_load_timeout}} );

                logger.info('\n' + 'init auth client');
                _this.initAuthClient(_this.navAuthManagerConfig);

                _this.setState('finished');
                logger.debug('\n' + 'state: ' + _this.getState());
                logger.info('\n' + 'module initialized successfully');
                logger.debug('\n' + 'met dependencies for: j1');
                clearInterval(dependencies_met_initialized);
              }
            }, 25); // END 'dependencies_met_initialized'
            logger.debug('\n' + 'met dependencies for: themer');
            clearInterval(dependencies_met_load_menu_finished);
          }
        }, 25); // END 'dependencies_met_load_menu_finished'

      // --------------------------------------------------------------------
      // Register event 'reset on resize' to call j1.core.navigator on
      // manageDropdownMenu to manage the (current) NAV menu for
      // desktop or mobile
      // ---------------------------------------------------------------------
      $(window).on('resize', function() {
        j1.core.navigator.manageDropdownMenu(navDefaults, navMenuOptions);

        // Manage sticky NAV bars
        // TODO: Check why a timeout is required to manage sticky NAV bars on RESIZE a page
        setTimeout (function() {
          j1.core.navigator.navbarSticky();
        }, 500);

        // Scroll the page one pixel back and forth to get
        // the right position for the toccer
        $(window).scrollTop($(window).scrollTop()+1);
        $(window).scrollTop($(window).scrollTop()-1);
      });
    }, // END init

    // -------------------------------------------------------------------------
    // initialize JS portion for the dialogs (modals) used by J1AuthClient
    // NOTE: Currently cookie updates NOT processed at the NAV module
    //       All updates on Cookies are managed by Cookie Consent.
    //       To be considered to re-add cookie updates for the auth state
    // -------------------------------------------------------------------------
    initAuthClient: function(auth_config) {
      var logger        = log4javascript.getLogger('j1.adapter.navigator.initAuthClient');
      var user_session  = j1.readCookie(cookie_user_session_name);

      _this.modalEventHandler(auth_config);

      if (j1.appDetected() && j1.authEnabled()) {
        // Toggle/Set SignIn/SignOut icon|link in QuickLinks
        // See: https://stackoverflow.com/questions/13524107/how-to-set-data-attributes-in-html-elements
        if (user_session.authenticated === 'true') {
          // Set SignOut
          $('#navLinkSignInOut').attr('data-bs-target', '#modalOmniSignOut');
          $('#iconSignInOut').removeClass('mdi-login').addClass('mdi-logout');
        } else {
          // Set SignIn
          $('#navLinkSignInOut').attr('data-bs-target', '#modalOmniSignIn');
          $('#iconSignInOut').removeClass('mdi-logout').addClass('mdi-login');
        }
      }

      return true;
    }, // END initAuthClient

    // -------------------------------------------------------------------------
    // modalEventHandler
    // Manage button click events for all BS Modals
    // See: https://www.nickang.com/add-event-listener-for-loop-problem-in-javascript/
    // -------------------------------------------------------------------------
    modalEventHandler: function (options) {
      // var logger      = log4javascript.getLogger('j1.adapter.navigator.EventHandler');
      var authConfig  = options.j1_auth;
      var route;
      var provider;
      var provider_url;
      var allowed_users;
      var logText;

      var signIn = {
        provider:         authConfig.providers.activated[0],
        users:            authConfig.providers[authConfig.providers['activated'][0]]['users'],
        do:               false
      };

      var signOut = {
        provider:         authConfig.providers.activated[0],
        providerSignOut:  false,
        do:               false
      };

      logText = '\n' + 'initialize button click events';
      logger.info(logText);

      // Manage button click events for modal "signInOutButton"
      // -----------------------------------------------------------------------
      $('ul.nav-pills > li').click(function (e) {
        e.preventDefault();
        // jadams, 2019-07-30: To be checked if needed
        signIn.provider       = $(this).text().trim();
        signIn.provider       = signIn.provider.toLowerCase();
        signIn.allowed_users  = signIn.users.toString();
      });

      $('a.btn').click(function() {
        if (this.id === 'signInButton') {
          signIn.do = true;
        } else {
          signIn.do = false;
        }
        if (this.id === 'signOutButton') {
          signOut.do = true;
        } else {
          signOut.do = false;
        }
      });

      $('input:checkbox[name="providerSignOut"]').on('click', function (e) {
        e.stopPropagation();
        signOut.providerSignOut = $('input:checkbox[name="providerSignOut"]').is(':checked');
        if(environment === 'development') {
          logText = '\n' + 'provider signout set to: ' + signOut.providerSignOut;
          logger.info(logText);
        }
      });

      // Manage pre events on modal "modalOmniSignIn"
      // -----------------------------------------------------------------------
      $('#modalOmniSignOut').on('show.bs.modal', function() {
          var modal = $(this);
          logger.info('\n' + 'place current user data');
          user_session = j1.readCookie(cookie_user_session_name);
          modal.find('.user-info').text('You are signed in to provider: ' + user_session.provider);
      }); // END SHOW modalOmniSignOut

      // Manage post events on modal "modalOmniSignIn"
      // -----------------------------------------------------------------------
      $('#modalOmniSignIn').on('hidden.bs.modal', function() {
        if (signIn.do == true) {
          provider      = signIn.provider.toLowerCase();
          allowed_users = signIn.users.toString();
          logText       = '\n' + 'provider detected: ' + provider;
          logger.info(logText);

          var route = '/authentication?request=signin&provider=' +provider+ '&allowed_users=' +allowed_users;
          logText = '\n' + 'call middleware for signin on route: ' + route;
          logger.info(logText);
          window.location.href = route;
        } else {
          provider = signIn.provider.toLowerCase();
          logText = '\n' + 'provider detected: ' + provider;
          logger.info(logText);
          logText = '\n' + 'login declined for provider: ' +provider;
          logger.info(logText);
        }
      }); // END post events "modalOmniSignIn"

      // Manage post events on modal "modalOmniSignOut"
      // -----------------------------------------------------------------------
      $('#modalOmniSignOut').on('hidden.bs.modal', function() {
        if (signOut.do == true) {
          logger.info('\n' + 'load active provider from cookie: ' + cookie_user_session_name);

          user_session  = j1.readCookie(cookie_user_session_name);
          provider      = user_session.provider;
          provider_url  = user_session.provider_site_url;

          logText = '\n' + 'provider detected: ' + provider;
          logger.info(logText);
          logText = '\n' + 'initiate signout for provider: ' +provider;
          logger.info(logText);

          var route = '/authentication?request=signout&provider=' + provider + '&provider_signout=' + signOut.providerSignOut; // + '/logout/';
          logText = '\n' + 'call middleware on route : ' +route;
          logger.info(logText);
          window.location.href = route;
        } else {
          provider = signOut.provider.toLowerCase();
          logText = '\n' + 'provider detected: ' + provider;
          logger.info(logText);
          logText = '\n' + 'signout declined for provider: ' +provider ;
          logger.info(logText);
        }
      }); // END post events "modalSignOut"

      logText = '\n' + 'initialize button click events completed';
      logger.info(logText);

      return true;
    }, // END modalEventHandler

    // -------------------------------------------------------------------------
    // applyThemeSettings
    // Apply CSS styles from current theme
    // -------------------------------------------------------------------------
    applyThemeSettings: function (navDefaults, navBarOptions, navMenuOptions, navQuicklinksOptions) {

      var logger              = log4javascript.getLogger('j1.adapter.navigator.applyThemeSettings');
      var gridBreakpoint_lg   = '992px';
      var gridBreakpoint_md   = '768px';
      var gridBreakpoint_sm   = '576px';

      var navbar_scrolled_color;
      var navbar_scrolled_style;
      var bg_scrolled;
      var bg_collapsed;
      var style;

      // Set dymanic styles
      // -----------------------------------------------------------------------

      // read current background colors
      var bg_primary    = $('#bg-primary').css('background-color');
      var bg_table      = $('body').css('background-color');

      // set navbar background colors
      bg_scrolled   = bg_primary;
      bg_collapsed  = bg_primary;

      // navBar styles
      // -----------------------------------------------------------------------

      var navPrimaryColor     = navDefaults.nav_primary_color;

      if (navBarOptions.background_color_scrolled == 'default' ) {
        navbar_scrolled_color = bg_primary;
      } else {
//      navbar_scrolled_color = '#212529';
        navbar_scrolled_color = navBarOptions.background_color_scrolled;
      }


      navbar_scrolled_style  = '<style id="navbar_scrolled_color">';
      navbar_scrolled_style += '  .navbar-scrolled {';
      navbar_scrolled_style += '    background-color: ' + navbar_scrolled_color + ' !important;';
      navbar_scrolled_style += '  }';
      navbar_scrolled_style += '</style>';

      $('head').append(navbar_scrolled_style);

      // set current body background color for all tables
      // -----------------------------------------------------------------------
      $('table').css('background', bg_table);


      logger.info('\n' + 'set dynamic styles for the theme loaded');

      // Set|Resolve navMenuOptions
      // ------------------------------------------------------------------------
      navMenuOptions.dropdown_font_size               = navMenuOptions.dropdown_font_size;
      navMenuOptions.megamenu_font_size               = navMenuOptions.megamenu_font_size;

      // Set|Resolve navBarOptions
      // -----------------------------------------------------------------------
      navBarOptions.background_color_full             = navBarOptions.background_color_full;

      // Set|Resolve navMenuOptions
      // -----------------------------------------------------------------------
      navMenuOptions.menu_item_color                  = navMenuOptions.menu_item_color;
      navMenuOptions.menu_item_color_hover            = navMenuOptions.menu_item_color_hover;
      navMenuOptions.menu_item_dropdown_color         = navMenuOptions.menu_item_dropdown_color;
      navMenuOptions.dropdown_item_color              = navMenuOptions.dropdown_item_color;
      navMenuOptions.dropdown_background_color_hover  = navMenuOptions.dropdown_background_color_hover;
      navMenuOptions.dropdown_background_color_active = navMenuOptions.dropdown_background_color_active;
      navMenuOptions.dropdown_border_color            = navMenuOptions.dropdown_border_color;

      // Set|Resolve navQuicklinksOptions
      // -----------------------------------------------------------------------
      navQuicklinksOptions.icon_color                 = navQuicklinksOptions.icon_color;
      navQuicklinksOptions.icon_color_hover           = navQuicklinksOptions.icon_color_hover;
      navQuicklinksOptions.background_color           = navQuicklinksOptions.background_color;

      // Timeline styles
      // -----------------------------------------------------------------------
      style  = '<style>';
      style += '  .timeline > li > .timeline-panel:after {';
      style += '    border-left: 14px solid ' + bg_scrolled + ';';
      style += '    border-right: 0 solid ' + bg_scrolled + ';';
      style += '  }';
      style += '</style>';
      $('head').append(style);

      style  = '<style>';
      style += '  .tmicon {';
      style += '    background: ' + bg_scrolled + ';';
      style += '  }';
      style += '</style>';
      $('head').append(style);

      // Heading styles
      // -----------------------------------------------------------------------
      style  = '<style>';
      style += '  .heading:after {';
      style += '    background: ' + bg_scrolled + ' !important;';
      style += '  }';
      style += '</style>';
      $('head').append(style);

      // Tag Cloud styles
      // -----------------------------------------------------------------------
      style  = '<style>';
      style += '  .tag-cloud ul li a {';
      style += '    background: ' + bg_scrolled + ' !important;';
      style += '  }';
      style += '</style>';
      $('head').append(style);

      // Toccer styles
      // -----------------------------------------------------------------------
      style  = '<style>';
      style += '  .is-active-link::before {';
      style += '    background-color: ' + bg_scrolled + ' !important;';
      style += '  }';
      style += '</style>';
      $('head').append(style);

      // BS extended Modal styles
      // -----------------------------------------------------------------------
      style  = '<style>';
      style += '  .modal-dialog.modal-notify.modal-primary .modal-header {';
      style += '    background-color: ' + bg_scrolled + ' !important;';
      style += '  }';
      style += '</style>';
      $('head').append(style);

      // BS nav|pills styles
      // -----------------------------------------------------------------------
      style  = '<style>';
      style += '  .nav-pills .nav-link.active, .nav-pills .show > .nav-link  {';
      style += '    background-color: ' + bg_scrolled + ' !important;';
      style += '  }';
      style += '</style>';
      $('head').append(style);

      return true;
    }, // END applyThemeSettings


    // -------------------------------------------------------------------------
    // applyNavigatorSettings
    // Apply settings from configuration
    // -------------------------------------------------------------------------
    applyNavigatorSettings: function (navDefaults, navBarOptions, navMenuOptions, navQuicklinksOptions) {

      var logger              = log4javascript.getLogger('j1.adapter.navigator.applyThemeSettings');
      var gridBreakpoint_lg   = '992px';
      var gridBreakpoint_md   = '768px';
      var gridBreakpoint_sm   = '576px';

      var navPrimaryColor     = navDefaults.nav_primary_color;
      var navbar_scrolled_style;
      var navbar_scrolled_color = '#212529';

      navbar_scrolled_style  = '<style id="navbar_scrolled_color">';
      navbar_scrolled_style += '  .navbar-scrolled {';
      navbar_scrolled_style += '    background-color: ' + navbar_scrolled_color + ' !important;';
      navbar_scrolled_style += '  }';
      navbar_scrolled_style += '</style>';

      $('head').append(navbar_scrolled_style);



      logger.info('\n' + 'set dynamic styles for the theme loaded');

      // Set|Resolve navMenuOptions
      // ------------------------------------------------------------------------
      navMenuOptions.dropdown_font_size               = navMenuOptions.dropdown_font_size;
      navMenuOptions.megamenu_font_size               = navMenuOptions.megamenu_font_size;

      // Set|Resolve navBarOptions
      // -----------------------------------------------------------------------
      navBarOptions.background_color_full             = navBarOptions.background_color_full;

      // Set|Resolve navMenuOptions
      // -----------------------------------------------------------------------
      navMenuOptions.menu_item_color                  = navMenuOptions.menu_item_color;
      navMenuOptions.menu_item_color_hover            = navMenuOptions.menu_item_color_hover;
      navMenuOptions.menu_item_dropdown_color         = navMenuOptions.menu_item_dropdown_color;
      navMenuOptions.dropdown_item_color              = navMenuOptions.dropdown_item_color;
      navMenuOptions.dropdown_background_color_hover  = navMenuOptions.dropdown_background_color_hover;
      navMenuOptions.dropdown_background_color_active = navMenuOptions.dropdown_background_color_active;
      navMenuOptions.dropdown_border_color            = navMenuOptions.dropdown_border_color;

      // Set|Resolve navQuicklinksOptions
      // -----------------------------------------------------------------------
      navQuicklinksOptions.icon_color                 = navQuicklinksOptions.icon_color;
      navQuicklinksOptions.icon_color_hover           = navQuicklinksOptions.icon_color_hover;
      navQuicklinksOptions.background_color           = navQuicklinksOptions.background_color;

      // Set dymanic styles
      // -----------------------------------------------------------------------
      var style;

      // read current background colors
      var bg_primary    = $('#bg-primary').css('background-color');
      var bg_table      = $('body').css('background-color');


      // set navbar background colors
      var bg_scrolled   = bg_primary;
      var bg_collapsed  = bg_primary;

      // navBar styles
      // -----------------------------------------------------------------------

      // set current body background color for all tables
      $('table').css('background', bg_table);

//    $('head').append('<style> nav.navbar.navigator ul.nav.navigator .nav-item .nav-link { color: #212121 !important; } </style>');
      style  = '<style>';
      style += '  nav.navbar.navigator ul.nav.navigator .nav-item .nav-link {';
      style += '    color: ' + navBarOptions.menu_item_color;
      style += '  }';
      style += '</style>';
      $('head').append(style);




//    $('head').append('<style>.mdi-bg-primary {color: ' +bg_scrolled+ ';}</style>');
      style  = '<style>';
      style += '  .mdi-bg-primary {';
      style += '    color: ' + bg_scrolled;
      style += '  }';
      style += '</style>';
      $('head').append(style);

      // Size of brand image
//    $('head').append('<style>.navbar-brand > img { height: {{brand_image_height}}px !important; }</style>');
      style  = '<style>';
      style += '  .navbar-brand > img {';
      style += '     height: {{brand_image_height}}px !important;';
      style += '  }';
      style += '</style>';
      $('head').append(style);

      // Navbar transparent-light (light)
//    $('head').append('<style>@media (min-width: ' +gridBreakpoint_lg+ ') { nav.navbar.navigator.navbar-transparent.light { background-color: ' +navBarOptions.background_color_full+ ' !important; border-bottom: solid 0px !important; } }</style>');
      style  = '<style>';
      style += '  @media screen and (min-width: ' + gridBreakpoint_lg + ') {';
      style += '    nav.navbar.navigator.navbar-transparent.light {';
      style += '      background-color: ' + navBarOptions.background_color_full + ' !important;';
      style += '      border-bottom: solid 0px !important;';
      style += '    }';
      style += '  }';
      style += '</style>';
      $('head').append(style);

//    $('head').append('<style>@media (min-width: ' +gridBreakpoint_lg+ ') { nav.navbar.navigator.navbar-scrolled.light { background-color: ' +bg_scrolled+ ' !important; } }</style>');
      // style  = '<style>';
      // style += '  @media screen and (min-width: ' + gridBreakpoint_lg + ') {';
      // style += '    nav.navbar.navigator.navbar-scrolled.light {';
      // style += '      background-color: ' + bg_scrolled + ' !important;';
      // style += '    }';
      // style += '  }';
      // style += '</style>';
      // $('head').append(style);

//    $('head').append('<style id="dynNav">@media (max-width: ' +gridBreakpoint_md+ ') { nav.navbar.navigator.navbar-transparent.light { background-color: ' +navBarOptions.background_color_full+ ' !important; border-bottom: solid 0px !important; } }</style>');
      style  = '<style id="dynNav">';
      style += '  @media screen and (max-width: ' + gridBreakpoint_md + ') {';
      style += '    nav.navbar.navigator.navbar-transparent.light {';
      style += '      background-color: ' + navBarOptions.background_color_full + ' !important;';
      style += '      border-bottom: solid 0px !important;';
      style += '    }';
      style += '  }';
      style += '</style>';
      $('head').append(style);

//    $('head').append('<style id="dynNav">@media (max-width: ' +gridBreakpoint_md+ ') { nav.navbar.navigator.navbar-scrolled.light { background-color: ' +bg_scrolled+ ' !important; } }</style>');
      // style  = '<style id="dynNav">';
      // style += '  @media screen and (max-width: ' + gridBreakpoint_md + ') {';
      // style += '    nav.navbar.navigator.navbar-scrolled.light {';
      // style += '      background-color: ' + bg_scrolled + ' !important;';
      // style += '    }';
      // style += '  }';
      // style += '</style>';
      // $('head').append(style);

//    $('head').append('<style id="dynNav">@media (min-width: ' +gridBreakpoint_md+ ') { nav.navbar.navigator.navbar-transparent.light { background-color: ' +navBarOptions.background_color_full+ ' !important; border-bottom: solid 0px !important; } }</style>');
      style  = '<style id="dynNav">';
      style += '  @media screen and (min-width: ' + gridBreakpoint_md + ') {';
      style += '    nav.navbar.navigator.navbar-transparent.light {';
      style += '      background-color: ' + navBarOptions.background_color_full + ' !important;';
      style += '      border-bottom: solid 0px !important;';
      style += '    }';
      style += '  }';
      style += '</style>';
      $('head').append(style);

//   $('head').append('<style id="dynNav">@media (min-width: ' +gridBreakpoint_md+ ') { nav.navbar.navigator.navbar-scrolled.light { background-color: ' +bg_scrolled+ ' !important; } }</style>');
      // style  = '<style id="dynNav">';
      // style += '  @media screen and (min-width: ' + gridBreakpoint_md + ') {';
      // style += '    nav.navbar.navigator.navbar-scrolled.light {';
      // style += '      background-color: ' + bg_scrolled + ' !important;';
      // style += '    }';
      // style += '  }';
      // style += '</style>';
      // $('head').append(style);

//    $('head').append('<style id="dynNav">@media (max-width: ' +gridBreakpoint_sm+ ') { nav.navbar.navigator.navbar-transparent.light { background-color: ' +navBarOptions.background_color_full+ ' !important; border-bottom: solid 0px !important; } }</style>');
      style  = '<style id="dynNav">';
      style += '  @media screen and (max-width: ' + gridBreakpoint_sm + ') {';
      style += '    nav.navbar.navigator.navbar-transparent.light {';
      style += '      background-color: ' + navBarOptions.background_color_full + ' !important;';
      style += '      border-bottom: solid 0px !important;';
      style += '    }';
      style += '  }';
      style += '</style>';
      $('head').append(style);

//    $('head').append('<style id="dynNav">@media (max-width: ' +gridBreakpoint_sm+ ') { nav.navbar.navigator.navbar-scrolled.light { background-color: ' +bg_scrolled+ ' !important; } }</style>');
      // style  = '<style id="dynNav">';
      // style += '  @media screen and (max-width: ' + gridBreakpoint_sm + ') {';
      // style += '    nav.navbar.navigator.navbar-scrolled.light {';
      // style += '      background-color: ' + bg_scrolled + ' !important;';
      // style += '    }';
      // style += '  }';
      // style += '</style>';
      // $('head').append(style);


      // navQuicklinks styles
      // -----------------------------------------------------------------------
//    $('head').append('<style>.quicklink-nav> ul > li > a { color: ' +navQuicklinksOptions.icon_color+ ' !important; }</style>');
      style  = '<style>';
      style += '  .quicklink-nav> ul > li > a {';
      style += '    color: ' + navQuicklinksOptions.icon_color + ' !important;';
      style += '  }';
      style += '</style>';
      $('head').append(style);

//    $('head').append('<style>.quicklink-nav> ul > li > a:hover { color: ' +navQuicklinksOptions.icon_color_hover+ ' !important; }</style>');
      style  = '<style>';
      style += '  .quicklink-nav> ul > li > a:hover {';
      style += '    color: ' + navQuicklinksOptions.icon_color_hover + ' !important;';
      style += '  }';
      style += '</style>';
      $('head').append(style);


      // navMenu styles
      // -----------------------------------------------------------------------

//    $('head').append('<style>.dropdown-menu > .active > a { background-color: transparent !important; }</style>');
      // Remove background for anchor
      style  = '<style>';
      style += '  .dropdown-menu > .active > a {';
      style += '    background-color: transparent !important;';
      style += '  }';
      style += '</style>';
      $('head').append(style);

//    $('head').append('<style>@media (min-width: ' +gridBreakpoint_lg+ ') { nav.navbar.navigator .dropdown-item:focus, nav.navbar.navigator .dropdown-item:hover, nav.navbar.navigator .nav-sub-item:focus, nav.navbar.navigator .nav-sub-item:hover { background: ' +navMenuOptions.dropdown_background_color_hover+ ' !important; }}</style>');
      // hover menu-item|menu-sub-item
      style  = '<style>';
      style += '  @media screen and (min-width: ' + gridBreakpoint_lg + ') {';
      style += '    nav.navbar.navigator .dropdown-item:focus,';
      style += '    nav.navbar.navigator .dropdown-item:hover,';
      style += '    nav.navbar.navigator .nav-sub-item:focus,';
      style += '    nav.navbar.navigator .nav-sub-item:hover {';
      style += '       background: ' + navMenuOptions.dropdown_background_color_hover + ' !important;';
      style += '    }';
      style += '  }';
      style += '</style>';
      $('head').append(style);

//    $('head').append('<style>@media (min-width: ' +gridBreakpoint_lg+ ') { nav.navbar.navigator ul.nav.navbar-right .dropdown-menu .dropdown-menu { left: -' +navMenuOptions.dropdown_item_min_width+ 'rem !important; } }</style>');
      // Limit 1st dropdown item width
      style  = '<style>';
      style += '  @media screen and (min-width: ' + gridBreakpoint_lg + ') {';
      style += '    nav.navbar.navigator ul.nav.navbar-right .dropdown-menu .dropdown-menu  {';
      style += '       left: -' + navMenuOptions.dropdown_item_min_width + 'rem !important;';
      style += '    }';
      style += '  }';
      style += '</style>';
      $('head').append(style);

      //  Set dropdown item colors
//    $('head').append('<style>@media (min-width: ' +gridBreakpoint_lg+ ') { nav.navbar.navigator ul.nav > li > a { color: ' +navMenuOptions.menu_item_color+ ' !important; } }</style>');
      style  = '<style>';
      style += '  @media screen and (min-width: ' + gridBreakpoint_lg + ') {';
      style += '    nav.navbar.navigator ul.nav > li > a  {';
      style += '       color: ' + navMenuOptions.menu_item_color + ' !important;';
      style += '    }';
      style += '  }';
      style += '</style>';

//    $('head').append('<style>@media (min-width: ' +gridBreakpoint_lg+ ') { nav.navbar.navigator ul.nav > li > a:hover { color: ' +navMenuOptions.menu_item_color_hover+ ' !important; } }</style>');
      style  = '<style>';
      style += '  @media screen and (min-width: ' + gridBreakpoint_lg + ') {';
      style += '    nav.navbar.navigator ul.nav > li > a:hover {';
      style += '       color: ' + navMenuOptions.menu_item_color_hover + ' !important;';
      style += '    }';
      style += '  }';
      style += '</style>';

//    $('head').append('<style>@media (min-width: ' + gridBreakpoint_lg + ') { nav.navbar.navigator li.dropdown ul.dropdown-menu { animation-duration: ' +navMenuOptions.dropdown_animate_duration+ 's !important; color: #616161 !important; min-width: ' +navMenuOptions.dropdown_item_min_width+ 'rem !important; border-top: solid ' +navMenuOptions.dropdown_border_top+ 'px !important; border-radius: ' +navMenuOptions.dropdown_border_radius+ 'px !important; left: 0; } }</style>');
      // 1st level dropdown menu styles
      style  = '<style>';
      style += '  @media screen and (min-width: ' + gridBreakpoint_lg + ') {';
      style += '    nav.navbar.navigator li.dropdown ul.dropdown-menu {';
      style += '       max-height: ' + navMenuOptions.dropdown_menu_max_height + 'rem !important;';
      style += '       animation-duration: ' + navMenuOptions.dropdown_animate_duration + 's !important;';
      style += '       color: #616161 !important;';
      style += '       min-width: ' + navMenuOptions.dropdown_item_min_width + 'rem !important;';
      style += '       border-top: solid ' + navMenuOptions.dropdown_border_top + 'px !important;';
      style += '       border-radius: ' + navMenuOptions.dropdown_border_radius + 'px !important;';
      style += '       left: 0;';
      style += '    }';
      style += '  }';
      style += '</style>';
      $('head').append(style);

//    $('head').append('<style>@media (min-width: ' +gridBreakpoint_lg+ ') { nav.navbar.navigator li.dropdown ul.dropdown-menu ul.dropdown-menu  { top: -' +navMenuOptions.dropdown_border_top+ 'px !important; max-height: ' +navMenuOptions.dropdown_menu_max_height+ 'em; } }</style>');
      // Limit last (2nd) dropdown in height
      style  = '<style>';
      style += '  @media screen and (min-width: ' + gridBreakpoint_lg + ') {';
      style += '    nav.navbar.navigator li.dropdown ul.dropdown-menu ul.dropdown-menu  {';
      style += '       top: -' + navMenuOptions.dropdown_border_top + 'px !important;';
      style += '       max-height: ' + navMenuOptions.dropdown_menu_max_height + 'rem !important;';
      style += '    }';
      style += '  }';
      style += '</style>';

      {% if dropdown_style == 'raised' %}
//    $('head').append('<style>@media (min-width: ' +gridBreakpoint_lg+ ') { nav.navbar.navigator li.dropdown ul.dropdown-menu { box-shadow: 0 16px 38px -12px rgba(0, 0, 0, 0.56), 0 4px 25px 0px rgba(0, 0, 0, 0.12), 0 8px 10px -5px rgba(0, 0, 0, 0.2) !important; } }</style>');
      style  = '<style>';
      style += '  @media screen and (min-width: ' + gridBreakpoint_lg + ') {';
      style += '    nav.navbar.navigator li.dropdown ul.dropdown-menu {';
      style += '       box-shadow: 0 16px 38px -12px rgba(0, 0, 0, 0.56), 0 4px 25px 0px rgba(0, 0, 0, 0.12), 0 8px 10px -5px rgba(0, 0, 0, 0.2) !important;';
      style += '    }';
      style += '  }';
      style += '</style>';
      $('head').append(style);
      {% endif %}

//    $('head').append('<style>@media (min-width: ' +gridBreakpoint_lg+ ') { nav.navbar.navigator li.dropdown ul.dropdown-menu > li > a { color: ' +navMenuOptions.dropdown_item_color+ ' !important; font-size: ' +navMenuOptions.dropdown_font_size+ ' !important; font-weight: 400; } }</style>');
      // configure dropdown_font_size|color
      style  = '<style>';
      style += '  @media screen and (min-width: ' + gridBreakpoint_lg + ') {';
      style += '    nav.navbar.navigator li.dropdown ul.dropdown-menu > li > a {';
      style += '       color: ' + navMenuOptions.dropdown_item_color + ' !important;';
      style += '       font-size: ' + navMenuOptions.dropdown_font_size + ' !important;';
      style += '       font-weight: 400;';
      style += '    }';
      style += '  }';
      style += '</style>';
      $('head').append(style);

//    $('head').append('<style>@media (min-width: ' +gridBreakpoint_lg+ ') { nav.navbar.navigator ul.dropdown-menu.megamenu-content .content ul.menu-col li a { color: ' +navMenuOptions.dropdown_item_color+ ' !important; font-size: ' +navMenuOptions.megamenu_font_size+ ' !important; font-weight: 400; } }</style>');
      style  = '<style>';
      style += '  @media screen and (min-width: ' + gridBreakpoint_lg + ') {';
      style += '    nav.navbar.navigator ul.dropdown-menu.megamenu-content .content ul.menu-col li a {';
      style += '       color: ' + navMenuOptions.dropdown_item_color + ' !important;';
      style += '       font-size: ' + navMenuOptions.megamenu_font_size + ' !important;';
      style += '       font-weight: 400;';
      style += '    }';
      style += '  }';
      style += '</style>';
      $('head').append(style);

      // navQuicklinks|navTopSearch
      // -----------------------------------------------------------------------
      // style  = '<style>';
      // style += '  .top-search {';
      // style += '    background-color: ' + navTopsearchOptions.background_color + ' !important;';
      // style += '  }';
      // style += '</style>';
      // $('head').append(style);

      return true;
    }, // END applyThemeSettings

    // -------------------------------------------------------------------------
    // messageHandler
    // Manage messages (paylods) send from other J1 modules
    // -------------------------------------------------------------------------
    messageHandler: function (sender, message) {
      // var json_message = JSON.stringify(message, undefined, 2);              // multiline
      var json_message = JSON.stringify(message);
      _this.setState(message.action);

      logText = '\n' + 'received message from ' + sender + ': ' + json_message;
      logger.info(logText);

      logText = '\n' + 'set state to: ' + message.action;
      logger.info(logText);

      // -----------------------------------------------------------------------
      //  Process commands|actions
      // -----------------------------------------------------------------------
      if (message.type === 'command' && message.action === 'module_initialized') {
        //
        // Place handling of command|action here
        //
        logger.info('\n' + message.text);
      }
      if (message.type === 'command' && message.action === 'status') {
        logger.info('\n' + 'messageHandler: received - ' + message.action);
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
