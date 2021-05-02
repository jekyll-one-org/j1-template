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
 # Copyright (C) 2021 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # For details, see https://jekyll.one
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
{% assign nav_topsearch_defaults        = navigator_defaults.nav_topsearch %}
{% assign nav_topsearch_settings        = navigator_settings.nav_topsearch %}
{% assign nav_authclient_defaults       = authentication_defaults.auth_client %}
{% assign nav_authclient_settings       = authentication_settings.auth_client %}

{% comment %} Set config options
-------------------------------------------------------------------------------- {% endcomment %}
{% assign authentication_options        = authentication_defaults | merge: authentication_settings %}
{% assign themer_options                = themer_defaults | merge: themer_settings %}
{% assign nav_bar_options               = nav_bar_defaults | merge: nav_bar_settings %}
{% assign nav_menu_options              = nav_menu_defaults | merge: nav_menu_settings %}
{% assign quicklinks_options            = nav_quicklinks_defaults | merge: nav_quicklinks_settings %}
{% assign topsearch_options             = nav_topsearch_defaults | merge: nav_topsearch_settings %}
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
 # Copyright (C) 2021 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
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

j1.adapter['navigator'] = (function (j1, window) {

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
      // globals
      // -----------------------------------------------------------------------
      _this         = j1.adapter.navigator;
      logger        = log4javascript.getLogger('j1.adapter.navigator');

      // initialize state flag
      _this.setState('started');
      logger.info('state: ' + _this.getState());
      logger.info('module is being initialized');

      // -----------------------------------------------------------------------
      // defaults
      // -----------------------------------------------------------------------
      var settings  = $.extend({
        module_name: 'j1.adapter.navigator',
        generated:   '{{site.time}}'
      }, options);

      // -----------------------------------------------------------------------
      // options loader
      // -----------------------------------------------------------------------
      /* eslint-disable */
      var authConfig                                = {};
      var navDefaults                               = {};
      var navBarConfig                              = {};
      var navMenuConfig                             = {};
      var navQuicklinksConfig                       = {};
      var navTopsearchConfig                        = {};
      var navAuthClientConfig                       = {};
      var navBarOptions                             = {};
      var navMenuOptions                            = {};
      var navQuicklinksOptions                      = {};
      var navTopsearchOptions                       = {};
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


      navDefaults                                   = $.extend({}, {{navigator_defaults | replace: '=>', ':' }});
      navBarConfig                                  = $.extend({}, {{nav_bar_options | replace: '=>', ':' }});
      navMenuConfig                                 = $.extend({}, {{nav_menu_options | replace: '=>', ':' }});
      navQuicklinksConfig                           = $.extend({}, {{quicklinks_options | replace: '=>', ':' }});
      navTopsearchConfig                            = $.extend({}, {{topsearch_options | replace: '=>', ':' }});
      navAuthClientConfig                           = $.extend({}, {{authclient_options | replace: '=>', ':' }});

      navAuthMAnagerConfig                          = $.extend({}, {{authentication_options | replace: '=>', ':' }});
      authClientEnabled                             = navAuthMAnagerConfig.enabled;

      themerOptions                                 = $.extend({}, {{themer_options | replace: '=>', ':' | replace: 'nil', '""' }});

      // Merge|Overload module CONFIG by DEFAULTS
      //
      navBarOptions                                 = j1.mergeData(navBarConfig, navDefaults.nav_bar);
      navMenuOptions                                = j1.mergeData(navMenuConfig, navDefaults.nav_menu);
      navQuicklinksOptions                          = j1.mergeData(navQuicklinksConfig, navDefaults.nav_quicklinks);
      navTopsearchOptions                           = j1.mergeData(navTopsearchConfig, navDefaults.nav_topsearch);
      navAuthClientConfig                           = j1.mergeData(navAuthClientConfig, navDefaults.nav_authclient);

      // save config settings into the adapter object for global access
      //
      _this['navDefaults']           = navDefaults;
      _this['navBarOptions']         = navBarOptions;
      _this['navMenuOptions']        = navMenuOptions;
      _this['navQuicklinksOptions']  = navQuicklinksOptions;
      _this['navTopsearchOptions']   = navTopsearchOptions;
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

      j1.xhrData({
        xhr_container_id:   navQuicklinksOptions.xhr_container_id,
        xhr_data_path:      navQuicklinksOptions.xhr_data_path,
        xhr_data_element:   navQuicklinksOptions.xhr_data_element },
        'j1.adapter.navigator',
        null);
      j1.xhrData({
        xhr_container_id:   navAuthClientConfig.xhr_container_id,
        xhr_data_path:      navAuthClientConfig.xhr_data_path,
        xhr_data_element:   navAuthClientConfig.xhr_data_element },
        'j1.adapter.navigator',
        null);
      j1.xhrData({
        xhr_container_id:   navMenuOptions.xhr_container_id,
        xhr_data_path:      navMenuOptions.xhr_data_path,
        xhr_data_element:   navMenuOptions.xhr_data_element },
        'j1.adapter.navigator',
        'null');

      var dependencies_met_load_menu_finished = setInterval (function () {
        if (j1.xhrDOMState['#'+navQuicklinksOptions.xhr_container_id] == 'not loaded' ||
            j1.xhrDOMState['#'+navAuthClientConfig.xhr_container_id] == 'not loaded' ||
            j1.xhrDOMState['#'+navMenuOptions.xhr_container_id] == 'not loaded' ){
          logger.error('load HTML data (AJAX): failed');
          _this.setState('finished');
          logger.info('state: ' + _this.getState());
          logger.info('initializing module: failed');
          logger.info('met dependencies for: xhrData');
          clearInterval(dependencies_met_load_menu_finished);
        }
        // continue if all AJAX loads (xhrData) has finished
        if (j1.xhrDOMState['#'+navQuicklinksOptions.xhr_container_id] == 'success' &&
            j1.xhrDOMState['#'+navAuthClientConfig.xhr_container_id] == 'success' &&
            j1.xhrDOMState['#'+navMenuOptions.xhr_container_id] == 'success' ){
          _this.setState('processing');
          logger.info('status: ' + _this.getState());
          logger.info('initialize navigator core');

          // Detect|Set J1 App status
          appDetected       = j1.appDetected();
          authClientEnabled = j1.authEnabled();
          logger.info('application status detected: ' + appDetected);

          j1.core.navigator.init (
            _this.navDefaults,
            _this.navMenuOptions
          );

          // _this.delayShowMenu( 200 );

          // cast text-based booleans
          // themerEnabled = ({{themer_options.enabled }} === 'true');

          // load themes (to menu) if themer is enabled|finished
          if (themerEnabled) {

            // Detect|Set J1 UserState
            user_state_detected = j1.existsCookie(cookie_user_state_name);
            if (user_state_detected) {
              user_state        = j1.readCookie(cookie_user_state_name);
            }

            var dependencies_met_page_finished = setInterval(function() {
               // jadams, 2020-10-03: NOT needed to wait for j1 finished
//             if (j1.getState() == 'finished') {
               if (j1.adapter.themer.getState() == 'finished') {
                // initialize theme switcher menus
                logText = 'theme switcher detect: enabled';
                logger.info(logText);

                logText = 'load themes';
                logger.info(logText);

                // load LOCAL themes from JSON data
                logText = 'load local themes (json file)';
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
                    logger.info('remote themes loaded: successfully');
                    logger.info('remote themes loaded: successfully after: ' + interval_count * 25 + ' ms');

                    clearInterval(dependencies_met_remote_themes_loaded);
//                  clearInterval(dependencies_met_page_finished);
                  } else {
                      logger.debug('wait for theme to be loaded: ' + user_state.theme_name);
                  }
                  if (interval_count > max_count) {
                    logger.warn('remote themes loading: failed');
                    logger.warn('continue processing');
                    clearInterval(dependencies_met_remote_themes_loaded);
//                  clearInterval(dependencies_met_page_finished);
                  }
                  clearInterval(dependencies_met_page_finished);
                }, 25);

//              clearInterval(dependencies_met_page_finished);
              }
              _this.setState('initialized');
            }, 25); // END 'dependencies_met_page_finished'
          } else {
            logText = 'theme switcher detected as: disabled';
            logger.info(logText);
          }

          // -----------------------------------------------------------------
          // event handler|css styles
          // -----------------------------------------------------------------
          // continue if Theme CSS is applied
          var dependencies_met_themer_finished = setInterval(function() {
            if (themerEnabled) {
              if (j1.adapter.themer.getState() === 'finished') {
                _this.setState('processing');

                logger.info('initialize eventHandler');
                j1.core.navigator.eventHandler();

                var dependencies_met_page_finished = setInterval(function() {
                  if (j1.getState() == 'finished') {
                    // set general|global theme colors
                    logger.info('initializing dynamic CSS styles: started');
                    _this.setCSS (
                      navDefaults, navBarOptions, navMenuOptions,
                      navQuicklinksOptions, navTopsearchOptions
                    );
                    clearInterval(dependencies_met_page_finished);
                  }
                  logger.info('initializing dynamic CSS styles: finished');
                }, 25); // END 'dependencies_met_page_finished'

                logger.info('init auth client');
                _this.initAuthClient(_this.navAuthManagerConfig);

                _this.setState('finished');
                logger.info('state: ' + _this.getState());
                logger.info('module initialized successfully');
                logger.info('met dependencies for: j1');
                clearInterval(dependencies_met_themer_finished);
              }
            } else {
              _this.setState('processing');

              logger.info('initialize eventHandler');
              j1.core.navigator.eventHandler();

              // set general|global theme colors
              logger.info('apply dynamic CSS styles');
              _this.setCSS (
                navDefaults, navBarOptions, navMenuOptions,
                navQuicklinksOptions, navTopsearchOptions
              );

              logger.info('init auth client');
              _this.initAuthClient(_this.navAuthManagerConfig);
              _this.setState('finished');
              logger.info('state: ' + _this.getState());
              clearInterval(dependencies_met_themer_finished);
            }
          }, 25); // END 'dependencies_met_themer_finished'
          logger.info('met dependencies for: themer');
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

        // jadams, 2020-07-10: cause severe trouble on mobile devices if
        // OnScreen Kbd comes up and reduces the window size (resize event)
        // DISABLED
        // -------------------------------------------------------------------
        // Hide|Close topSearch on resize event
        // $('.top-search').slideUp();

        // Manage sticky NAV bars
        setTimeout (function() {
          j1.core.navigator.navbarSticky();
        }, 500);

        // Scroll the page one pixel back and forth to get
        // the right position for Toccer (trigger) and SSM
        $(window).scrollTop($(window).scrollTop()+1);
        $(window).scrollTop($(window).scrollTop()-1);

        // jadams, 2020-06-21: unclear|forgotten what I'm doing here!
        // Looks like the old BS3 implementation
        //
        // $('.navbar-collapse').removeClass('in');
        // $('.navbar-collapse').removeClass('on');
        // $('.navbar-collapse').removeClass('bounceIn');
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
          $('#navLinkSignInOut').attr('data-target', '#modalOmniSignOut');
          $('#iconSignInOut').removeClass('mdi-login').addClass('mdi-logout');
        } else {
          // Set SignIn
          $('#navLinkSignInOut').attr('data-target', '#modalOmniSignIn');
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

      logText = 'initialize button click events';
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
          logText = 'provider signout set to: ' + signOut.providerSignOut;
          logger.info(logText);
        }
      });

      // Manage pre events on modal "modalOmniSignIn"
      // -----------------------------------------------------------------------
      $('#modalOmniSignOut').on('show.bs.modal', function() {
          var modal = $(this);
          logger.info('place current user data');
          user_session = j1.readCookie(cookie_user_session_name);
          modal.find('.user-info').text('You are signed in to provider: ' + user_session.provider);
      }); // END SHOW modalOmniSignOut

      // Manage post events on modal "modalOmniSignIn"
      // -----------------------------------------------------------------------
      $('#modalOmniSignIn').on('hidden.bs.modal', function() {
        if (signIn.do == true) {
          provider      = signIn.provider.toLowerCase();
          allowed_users = signIn.users.toString();
          logText       = 'provider detected: ' + provider;
          logger.info(logText);

          var route = '/authentication?request=signin&provider=' +provider+ '&allowed_users=' +allowed_users;
          logText = 'call middleware for signin on route: ' + route;
          logger.info(logText);
          window.location.href = route;
        } else {
          provider = signIn.provider.toLowerCase();
          logText = 'provider detected: ' + provider;
          logger.info(logText);
          logText = 'login declined for provider: ' +provider;
          logger.info(logText);
        }
      }); // END post events "modalOmniSignIn"

      // Manage post events on modal "modalOmniSignOut"
      // -----------------------------------------------------------------------
      $('#modalOmniSignOut').on('hidden.bs.modal', function() {
        if (signOut.do == true) {
          logger.info('load active provider from cookie: ' + cookie_user_session_name);

          user_session  = j1.readCookie(cookie_user_session_name);
          provider      = user_session.provider;
          provider_url  = user_session.provider_site_url;

          logText = 'provider detected: ' + provider;
          logger.info(logText);
          logText = 'initiate signout for provider: ' +provider;
          logger.info(logText);

          var route = '/authentication?request=signout&provider=' + provider + '&provider_signout=' + signOut.providerSignOut; // + '/logout/';
          logText = 'call middleware on route : ' +route;
          logger.info(logText);
          window.location.href = route;
        } else {
          provider = signOut.provider.toLowerCase();
          logText = 'provider detected: ' + provider;
          logger.info(logText);
          logText = 'signout declined for provider: ' +provider ;
          logger.info(logText);
        }
      }); // END post events "modalSignOut"

      logText = 'initialize button click events completed';
      logger.info(logText);

      return true;
    }, // END modalEventHandler

    // -------------------------------------------------------------------------
    // setCSS
    // Set dynamic CSS styles
    // -------------------------------------------------------------------------
    setCSS: function (navDefaults, navBarOptions, navMenuOptions, navQuicklinksOptions, navTopsearchOptions) {
      var logger              = log4javascript.getLogger('j1.adapter.navigator.setCSS');
      var gridBreakpoint_lg   = '992px';
      var gridBreakpoint_md   = '768px';
      var gridBreakpoint_sm   = '576px';
      var navPrimaryColor     = navDefaults.nav_primary_color;

      {% comment %} Set|Resolve navMenuOptions
      -------------------------------------------------------------------------- {% endcomment %}
      navMenuOptions.dropdown_font_size               = navMenuOptions.dropdown_font_size;
      navMenuOptions.megamenu_font_size               = navMenuOptions.megamenu_font_size;

      {% comment %} Set|Resolve navBarOptions
      -------------------------------------------------------------------------- {% endcomment %}
      navBarOptions.background_color_full             = navBarOptions.background_color_full;

      {% comment %} Set|Resolve navMenuOptions
      -------------------------------------------------------------------------- {% endcomment %}
      navMenuOptions.menu_item_color                  = navMenuOptions.menu_item_color;
      navMenuOptions.menu_item_color_hover            = navMenuOptions.menu_item_color_hover;
      navMenuOptions.menu_item_dropdown_color         = navMenuOptions.menu_item_dropdown_color;
      navMenuOptions.dropdown_item_color              = navMenuOptions.dropdown_item_color;
      navMenuOptions.dropdown_background_color_hover  = navMenuOptions.dropdown_background_color_hover;
      navMenuOptions.dropdown_background_color_active = navMenuOptions.dropdown_background_color_active;
      navMenuOptions.dropdown_border_color            = navMenuOptions.dropdown_border_color;

      {% comment %} Set|Resolve navQuicklinksOptions
      -------------------------------------------------------------------------- {% endcomment %}
      navQuicklinksOptions.icon_color                 = navQuicklinksOptions.icon_color;
      navQuicklinksOptions.icon_color_hover           = navQuicklinksOptions.icon_color_hover;
      navQuicklinksOptions.background_color           = navQuicklinksOptions.background_color;

      {% comment %} Set|Resolve navTopsearchOptions
      -------------------------------------------------------------------------- {% endcomment %}
      navTopsearchOptions.input_color                 = navTopsearchOptions.input_color;
      navTopsearchOptions.background_color            = navTopsearchOptions.background_color;

      {% comment %} Set dymanic styles
      -------------------------------------------------------------------------- {% endcomment %}
      // $('nav-primary').css({"background-color": "navPrimaryColor"});


      {% comment %} navBar styles
      -------------------------------------------------------------------------- {% endcomment %}
      var bg_primary    = j1.getStyleValue('bg-primary', 'background-color');
      var bg_scrolled   = bg_primary;
      var bg_collapsed  = bg_primary;

      $('head').append('<style>.mdi-bg-primary {color: ' +bg_scrolled+ ';}</style>');

      // Size of brand image
      $('head').append('<style>.navbar-brand > img { height: {{brand_image_height}}px !important; }</style>');

      // Navbar transparent-light (light)
      $('head').append('<style>@media (min-width: ' +gridBreakpoint_lg+ ') { nav.navbar.navigator.navbar-transparent.light { background-color: ' +navBarOptions.background_color_full+ ' !important; border-bottom: solid 0px !important; } }</style>');
      $('head').append('<style>@media (min-width: ' +gridBreakpoint_lg+ ') { nav.navbar.navigator.navbar-scrolled.light { background-color: ' +bg_scrolled+ ' !important; } }</style>');

      $('head').append('<style id="dynNav">@media (max-width: ' +gridBreakpoint_md+ ') { nav.navbar.navigator.navbar-transparent.light { background-color: ' +navBarOptions.background_color_full+ ' !important; border-bottom: solid 0px !important; } }</style>');
      $('head').append('<style id="dynNav">@media (max-width: ' +gridBreakpoint_md+ ') { nav.navbar.navigator.navbar-scrolled.light { background-color: ' +bg_scrolled+ ' !important; } }</style>');
      $('head').append('<style id="dynNav">@media (min-width: ' +gridBreakpoint_md+ ') { nav.navbar.navigator.navbar-transparent.light { background-color: ' +navBarOptions.background_color_full+ ' !important; border-bottom: solid 0px !important; } }</style>');
      $('head').append('<style id="dynNav">@media (min-width: ' +gridBreakpoint_md+ ') { nav.navbar.navigator.navbar-scrolled.light { background-color: ' +bg_scrolled+ ' !important; } }</style>');

      $('head').append('<style id="dynNav">@media (max-width: ' +gridBreakpoint_sm+ ') { nav.navbar.navigator.navbar-transparent.light { background-color: ' +navBarOptions.background_color_full+ ' !important; border-bottom: solid 0px !important; } }</style>');
      $('head').append('<style id="dynNav">@media (max-width: ' +gridBreakpoint_sm+ ') { nav.navbar.navigator.navbar-scrolled.light { background-color: ' +bg_scrolled+ ' !important; } }</style>');

      {% comment %} navQuicklinks styles
      -------------------------------------------------------------------------- {% endcomment %}
      $('head').append('<style>.attr-nav> ul > li > a { color: ' +navQuicklinksOptions.icon_color+ ' !important; }</style>');
      $('head').append('<style>.attr-nav> ul > li > a:hover { color: ' +navQuicklinksOptions.icon_color_hover+ ' !important; }</style>');

      {% comment %} navMenu styles
      -------------------------------------------------------------------------- {% endcomment %}
      // Remove background for anchor
      $('head').append('<style>.dropdown-menu > .active > a { background-color: transparent !important; }</style>');
      // hover menu-item|menu-sub-item
      $('head').append('<style>@media (min-width: ' +gridBreakpoint_lg+ ') { nav.navbar.navigator .dropdown-item:focus, nav.navbar.navigator .dropdown-item:hover, nav.navbar.navigator .nav-sub-item:focus, nav.navbar.navigator .nav-sub-item:hover { background: ' +navMenuOptions.dropdown_background_color_hover+ ' !important; }}</style>');

      // Limit 1st dropdown item width
      $('head').append('<style>@media (min-width: ' +gridBreakpoint_lg+ ') { nav.navbar.navigator ul.nav.navbar-right .dropdown-menu .dropdown-menu { left: -' +navMenuOptions.dropdown_item_min_width+ 'rem !important; } }</style>');

      // Limit last (2nd) dropdown in height (nav.navbar.navigator li.dropdown ul.dropdown-menu ul.dropdown-menu)
      // !important
      $('head').append('<style>@media (min-width: ' +gridBreakpoint_lg+ ') { nav.navbar.navigator li.dropdown ul.dropdown-menu ul.dropdown-menu  { top: -' +navMenuOptions.dropdown_border_top+ 'px !important; max-height: ' +navMenuOptions.dropdown_menu_max_height+ 'em; } }</style>');

      //  Set dropdown item colors
      $('head').append('<style>@media (min-width: ' +gridBreakpoint_lg+ ') { nav.navbar.navigator ul.nav > li > a { color: ' +navMenuOptions.menu_item_color+ ' !important; } }</style>');
      $('head').append('<style>@media (min-width: ' +gridBreakpoint_lg+ ') { nav.navbar.navigator ul.nav > li > a:hover { color: ' +navMenuOptions.menu_item_color_hover+ ' !important; } }</style>');

      // Dropdown menu styles
      // jadams, 2017-11-30: removed left padding from dropdown mwenu (for new j1nav style based on Navigator|Slate)
      $('head').append('<style>@media (min-width: ' +gridBreakpoint_lg+ ') { nav.navbar.navigator li.dropdown ul.dropdown-menu { animation-duration: ' +navMenuOptions.dropdown_animate_duration+ 's !important; color: ' +bg_scrolled+ ' !important; min-width: ' +navMenuOptions.dropdown_item_min_width+ 'rem !important; border-top: solid ' +navMenuOptions.dropdown_border_top+ 'px !important; border-radius: ' +navMenuOptions.dropdown_border_radius+ 'px !important; left: 0; } }</style>');

      {% if dropdown_style == 'raised' %}
      $('head').append('<style>@media (min-width: ' +gridBreakpoint_lg+ ') { nav.navbar.navigator li.dropdown ul.dropdown-menu { box-shadow: 0 16px 38px -12px rgba(0, 0, 0, 0.56), 0 4px 25px 0px rgba(0, 0, 0, 0.12), 0 8px 10px -5px rgba(0, 0, 0, 0.2) !important; } }</style>');
      {% endif %}

      // jadams, 2017-11-22: configure dropdown_font_size|color
      $('head').append('<style>@media (min-width: ' +gridBreakpoint_lg+ ') { nav.navbar.navigator li.dropdown ul.dropdown-menu > li > a { color: ' +navMenuOptions.dropdown_item_color+ ' !important; font-size: ' +navMenuOptions.dropdown_font_size+ ' !important; font-weight: 400; } }</style>');
      $('head').append('<style>@media (min-width: ' +gridBreakpoint_lg+ ') { nav.navbar.navigator ul.dropdown-menu.megamenu-content .content ul.menu-col li a { color: ' +navMenuOptions.dropdown_item_color+ ' !important; font-size: ' +navMenuOptions.megamenu_font_size+ ' !important; font-weight: 400; } }</style>');

      {% comment %} navQuicklinks styles
      -------------------------------------------------------------------------- {% endcomment %}

      {% comment %} navTopSearch Styles
      -------------------------------------------------------------------------- {% endcomment %}
//    jadams, 2020-07-08: disabled because colors for icons set by the icon font settings
//    $('head').append('<style>.top-search .input-group-addon { color: ' +navTopsearchOptions.input_color+ ' !important; }</style>');
      $('head').append('<style>.top-search { background-color: ' +navTopsearchOptions.background_color+ ' !important; }</style>');
      $('head').append('<style>.top-search input.form-control { color: ' +navTopsearchOptions.input_color+ ' !important; }</style>');

      {% comment %} Timeline styles
      -------------------------------------------------------------------------- {% endcomment %}
  	  $('head').append('<style>.timeline > li > .timeline-panel:after {border-right-color: ' +bg_scrolled+ '; border-left-color: ' +bg_scrolled+ ';}</style>');
      $('head').append('<style>.tmicon {background: ' +bg_scrolled+ ';}</style>');

      {% comment %} Heading styles
      -------------------------------------------------------------------------- {% endcomment %}
      $('head').append('<style>.heading:after {background: ' +bg_scrolled+ ' !important;}</style>');

      {% comment %} Tag Cloud styles
      -------------------------------------------------------------------------- {% endcomment %}
      $('head').append('<style>.tag-cloud ul li a {background-color: ' +bg_scrolled+ ' !important;}</style>');
      // $('head').append('<style>.tag-cloud ul li a:hover {background-color: #212121 !important;}</style>');

      {% comment %} Toccer styles
      -------------------------------------------------------------------------- {% endcomment %}
      $('head').append('<style>.is-active-link::before {background-color: ' +bg_scrolled+ ' !important;}</style>');

      {% comment %} BS extended Modal styles
      -------------------------------------------------------------------------- {% endcomment %}
      $('head').append('<style>.modal-dialog.modal-notify.modal-primary .modal-header {background-color: ' +bg_scrolled+ ';}</style>');

      {% comment %} BS nav|pills styles
      -------------------------------------------------------------------------- {% endcomment %}
      $('head').append('<style>.nav-pills .nav-link.active, .nav-pills .show > .nav-link {background-color: ' +bg_scrolled+ ' !important;}</style>');

      return true;
    }, // END setCSS

    // -------------------------------------------------------------------------
    //  delayShowMenu
    //  delay all dropdown menu to open for "delay" time
    //  See: http://jsfiddle.net/AndreasPizsa/NzvKC/
    // -------------------------------------------------------------------------
    delayShowMenu: function ( menuOpenDelay ) {
      var logger      = log4javascript.getLogger('j1.adapter.navigator.delayShowMenu');
      var theTimer = 0;
      var theElement = null;
      var theLastPosition = {x:0,y:0};

      logText ='entered delayShowMenu';
      logger.info(logText);

      // $('#navigator_nav_menu')
      //   .find('li.dropdown.nav-item')

      $('[data-toggle]').closest('li')
      .on('mouseenter', function (inEvent) {
        if (theElement) theElement.removeClass('open');
        window.clearTimeout(theTimer);
        theElement = $(this);

        theTimer = window.setTimeout(function () {
          theElement.addClass('open');
        }, menuOpenDelay);
      })
      .on('mousemove', function (inEvent) {
        if(Math.abs(theLastPosition.x - inEvent.ScreenX) > 4 ||
           Math.abs(theLastPosition.y - inEvent.ScreenY) > 4) {
          theLastPosition.x = inEvent.ScreenX;
          theLastPosition.y = inEvent.ScreenY;
          return;
        }
        if (theElement.hasClass('open')) return;
        window.clearTimeout(theTimer);
        theTimer = window.setTimeout(function () {
          theElement.addClass('open');
        }, menuOpenDelay);
      })
      .on('mouseleave', function (inEvent) {
        window.clearTimeout(theTimer);
        theElement = $(this);
        theTimer = window.setTimeout(function () {
          theElement.removeClass('open');
        }, menuOpenDelay);
      });

      return true;
    }, // END delayShowMenu

    // -------------------------------------------------------------------------
    // messageHandler
    // Manage messages (paylods) send from other J1 modules
    // -------------------------------------------------------------------------
    messageHandler: function (sender, message) {
      // var json_message = JSON.stringify(message, undefined, 2);              // multiline
      var json_message = JSON.stringify(message);

      logText = 'received message from ' + sender + ': ' + json_message;
      logger.debug(logText);

      // -----------------------------------------------------------------------
      //  Process commands|actions
      // -----------------------------------------------------------------------
      if (message.type === 'command' && message.action === 'module_initialized') {
        //
        // Place handling of command|action here
        //
        logger.info(message.text);
      }
      if (message.type === 'command' && message.action === 'status') {
        logger.info('messageHandler: received - ' + message.action);
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
