---
regenerate:                             true
---

{%- capture cache -%}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/core/js/j1.js
 # Liquid template to initialize J1 Theme Core functions
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2023-2025 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # For details, see: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 # -----------------------------------------------------------------------------
 # Test data:
 #  {{ liquid_var | debug }}
 # -----------------------------------------------------------------------------
{% endcomment %}

{% comment %} Liquid procedures
------------------------------------------------------------------------------- {% endcomment %}

{% comment %} Set global settings
-------------------------------------------------------------------------------- {% endcomment %}
{% assign environment               = site.environment %}
{% assign template_version          = site.version %}

{% if site.permalink == 'none' %}
   {% capture page_url %}{{ site.url }}.html{% endcapture %}
{% else %}
   {% capture page_url %}{{ site.url }}{% endcapture %}
{% endif %}

{% comment %} Process YML config data
================================================================================ {% endcomment %}

{% comment %} Set config files
-------------------------------------------------------------------------------- {% endcomment %}
{% assign blocks                    = site.data.blocks %}
{% assign modules                   = site.data.modules %}
{% assign template_config           = site.data.j1_config %}

{% comment %} Set config data
-------------------------------------------------------------------------------- {% endcomment %}
{% assign banner_defaults           = blocks.defaults.banner.defaults %}
{% assign banner_settings           = blocks.banner.settings %}

{% assign panel_defaults            = blocks.defaults.panel.defaults %}
{% assign panel_settings            = blocks.panel.settings %}

{% assign footer_defaults           = blocks.defaults.footer.defaults %}
{% assign footer_settings           = blocks.footer.settings %}

{% assign toccer_defaults           = modules.defaults.toccer.defaults %}

{% assign cookie_defaults           = modules.defaults.cookies.defaults %}
{% assign cookie_settings           = modules.cookies.settings %}

{% assign themes_defaults           = modules.defaults.themes.defaults %}
{% assign themes_settings           = modules.themes.settings %}

{% assign scroller_defaults         = modules.defaults.scroller.defaults %}
{% assign scroller_settings         = modules.scroller.settings %}

{% assign tracking_enabled          = modules.analytics.enabled %}
{% assign tracking_id               = modules.analytics.google.trackingID %}

{% assign authentication_defaults   = modules.defaults.authentication.defaults %}
{% assign authentication_settings   = modules.authentication.settings %}

{% comment %} Set config options
-------------------------------------------------------------------------------- {% endcomment %}
{% assign toccer_options            = toccer_defaults | merge: toccer_settings %}
{% assign themes_options            = themes_defaults| merge: themes_settings %}
{% assign cookie_options            = cookie_defaults | merge: cookie_settings %}
{% assign scroller_options          = scroller_defaults | merge: scroller_settings %}
{% assign footer_options            = footer_defaults | merge: footer_settings %}

{% assign authentication_options    = authentication_defaults | merge: authentication_settings %}

{% assign footer                    = 'active_footer' %}
{% assign footer_id                 = footer_options.active_footer %}
{% assign footer_data_path          = footer_defaults.data_path %}
{% assign banner_data_path          = banner_defaults.data_path %}
{% assign panel_data_path           = panel_defaults.data_path %}

{% assign themes_enabled            = modules.themes_options.enabled %}
{% assign themes_reloadPageOnChange = modules.themes_options.reloadPageOnChange %}
{% assign themes_hideOnReload       = modules.themes_options.hideOnReload %}

{% comment %} Detect prod mode
-------------------------------------------------------------------------------- {% endcomment %}
{% assign production = false %}
{% if environment == 'prod' or environment == 'production' %}
  {% assign production = true %}
{% endif %}

{% comment %} language detection
-------------------------------------------------------------------------------- {% endcomment %}
{% if site.language == "en" %}
  {% assign language = "en" %}
{% elsif site.language == "de"%}
  {% assign language = "de" %}
{% else %}
  {% assign language = "en" %}
{% endif %}

/*
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/adapter/js/j1_template.js
 # JS Adapter for J1 Theme
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2023-2025 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # For details, see: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 # -----------------------------------------------------------------------------
 # Adapter generated: {{site.time}}
 # -----------------------------------------------------------------------------
*/

// -----------------------------------------------------------------------------
// ESLint shimming
// -----------------------------------------------------------------------------
/* eslint indent: "off"                                                       */
/* eslint quotes: "off"                                                       */
/* eslint semi: "off"                                                         */
// -----------------------------------------------------------------------------
"use strict";
var j1 = ((options) => {

  // ---------------------------------------------------------------------------
  // globals
  // ---------------------------------------------------------------------------
  // base page resources
  var environment                   = '{{environment}}';
  var scrollOffsetBase              = {{scroller_options.smoothscroll.offsetBase}};
  var scrollOffsetCorrection        = {{scroller_options.smoothscroll.offsetCorrection}};
  var date                          = new Date();
  var timestamp_now                 = date.toISOString();
  var url                           = new URL(window.location.href);
  var rePager                       =  new RegExp('navigator|dateview|tagview|archive');
  var baseUrl                       = url.origin;
  var hostname                      = url.hostname;
  var domain                        = hostname.substring(hostname.lastIndexOf('.', hostname.lastIndexOf('.') - 1) + 1);
  var secure                        = (url.protocol.includes('https')) ? true : false;
  var template_version              = '{{template_version}}';
  var moduleOptions                 = {};
  var j1_runtime_data               = {};
  var scrollerSettings              = {};
  var scrollerOptions               = {};
  var scrollerDefaults              = {};
  var banner                        = [];
  var headingArray                  = [];

  var ep;
  var settings;
  var json_data;
  var referrer;
  var documentHeight;
  var scrollOffset;

  // defaults for status information
  var state                         = 'not_started';
  var mode                          = 'not_detected';

  var performance_monitors_enabled  = ('{{template_config.monitor.performance_observer}}' === 'true') ? true: false;

  // defaults for tracking providers
  var tracking_enabled              = ('{{tracking_enabled}}' === 'true') ? true: false;
  var tracking_id                   = '{{tracking_id}}';
  var tracking_id_valid             = (tracking_id.includes('tracking-id')) ? false : true;

  // defaults for comment providers
  var comment_provider              = '{{comment_provider}}';
  var site_id                       = '{{site_id}}';
  var checkCookies                  = {{cookie_options.checkCookies}};
  var expireCookiesOnRequiredOnly   = ('{{cookie_options.expireCookiesOnRequiredOnly}}' === 'true') ? true: false;

  // animation on page load
  var bodyAnimation                 = ('{{template_config.body.animation}}' === 'true') ? true: false;
  var bodyAnimationType             = '{{template_config.body.animation_type}}';
  var bodyAnimationDuration         = '{{template_config.body.animation_duration}}';

  // defaults for dynamic pages
  var timeoutScrollDynamicPages     = '{{template_config.timeoutScrollDynamicPages}}';
  var scrollDynamicPagesTopOnChange = '{{template_config.scrollDynamicPagesTopOnChange}}';

  var pageGrowthRatio               = 0;                                        // ratio a dynamic page has grown in height
  var pageBaseHeigth                = 0;                                        // base height of a dynamic page (not grown)
  var staticPage                    = false;                                    // defalt: false, but decided in ResizeObserver
  var pageHeight;
  var pageBaseHeight;                                                           // height of a page dynamic detected in ResizeObserver

  var growthRatio                   = 0.00;
  var previousGrowthRatio           = 0.00;
  var previousPageHeight;
  var documentHeight;

  // defaults for the cookie management
  var current_user_data;
  var current_page;
  var previous_page;
  var last_pager;
  var last_pager_url;
  var app_detected;
  var user_session_detected;
  var cookie_written;

  // defaults for template versions
  var template_previous_version;
  var template_version_changed;

  // defaults for themes
  var themeName;
  var themeCss;
  var cssExtension                  = (environment === 'production') ? '.min.css' : '.css';

  // defaults for data files
  var colors_data_path              = '{{template_config.colors_data_path}}';
  var font_size_data_path           = '{{template_config.font_size_data_path}}';
  var runtime_data_path             = '{{template_config.runtime_data_path}}';
  var message_catalog_data_path     = '{{template_config.message_catalog_data_path}}';

  // block mgmt
  var banner_state;
  var panel_state;
  var footer_state;
  var banner_blocks;
  var panel_blocks;
  var footer_blocks;
  var banners_exits;
  var panels_exists;
  var footer_exists;

  // Logger resources
  var logger;
  var logText;

  var frontmatterOptions;
  var _this;

  // date|time
  var startTime;
  var endTime;
  var startTimeModule;
  var endTimeModule;
  var timeSeconds;

  // initial cookie settings
  var cookie_names = {
    'app_session':                  '{{template_config.cookies.app_session}}',
    'user_session':                 '{{template_config.cookies.user_session}}',
    'user_state':                   '{{template_config.cookies.user_state}}',
    'user_consent':                 '{{template_config.cookies.user_consent}}',
    'user_translate':               '{{template_config.cookies.user_translate}}',
    'chat_prompt':                  '{{template_config.cookies.chat_prompt}}',
    'search_prompt':                '{{template_config.cookies.search_prompt}}'
  };

  var user_consent = {
    'necessary':                    true,
    'analysis':                     false,
    'personalization':              false
  };

  var user_translate = {
    'analysis':                     false,
    'personalization':              false,
    'useLanguageFromBrowser':       true,
    'translateAllPages':            true,
    'translationEnabled':           false
  };

  var user_session = {
    'mode':                         'web',
    'writer':                       'j1.adapter',
    'locale':                       navigator.language || navigator.userLanguage,
    'user_name':                    '{{template_config.user.user_name}}',
    'provider':                     '{{template_config.user.provider}}',
    'provider_membership':          '{{template_config.user.provider_membership}}',
    'provider_permissions':         'public,{{template_config.user.provider_permissions}}',
    'provider_site_url':            '{{template_config.user.provider_site_url}}',
    'provider_home_url':            '{{template_config.user.provider_home_url}}',
    'provider_blog_url':            '{{template_config.user.provider_blog_url}}',
    'provider_member_url':          '{{template_config.user.provider_member_url}}',
    'provider_privacy_url':         '{{template_config.user.provider_privacy_url}}',
    'requested_page':               '',
    'previous_page':                '',
    'last_pager':                   ''
  };

  var user_state = {
    'writer':                       'j1.adapter',
    'template_version':             '{{template_version}}',
    'theme_name':                   'UnoLight',
    'theme_css':                    '/assets/theme/j1/core/css/themes/unolight/bootstrap.css',
    'theme_author':                 'J1 Team',
    'theme_version':                '{{template_version}}',
    'session_active':               false,
    'google_translate':             'disabled',
    'translate_all_pages':          true,
    'translate_locale':             navigator.language || navigator.userLanguage,
    'last_session_ts':              timestamp_now
  };

  var chat_prompt   =               {};
  var search_prompt =               {};

  // ---------------------------------------------------------------------------
  // Helper functions
  // ---------------------------------------------------------------------------

  // See: https://stackoverflow.com/questions/359788/how-to-execute-a-javascript-function-when-i-have-its-name-as-a-string
  //
  function executeFunctionByName(functionName, context /*, args */) {
    var args = Array.prototype.slice.call(arguments, 2);
    var namespaces = functionName.split('.');
    var func = namespaces.pop();
    for(var i = 0; i < namespaces.length; i++) {
      context = context[namespaces[i]];
    }
    return context[func].apply(context, args);
  }

  function isOdd(num) {
    var test = (num % 2).toString();
    return j1.stringToBoolean(test);
  }

  // ---------------------------------------------------------------------------
  // main object
  // ---------------------------------------------------------------------------
  return {

    // -------------------------------------------------------------------------
    // init()
    // -------------------------------------------------------------------------
    init: (options) => {

      // -----------------------------------------------------------------------
      // Default module settings
      // -----------------------------------------------------------------------
      var settings = $.extend({
        module_name: 'j1',
        generated:   '{{site.time}}'
      }, options);

      // create settings object from frontmatter options
      frontmatterOptions  = options != null ? $.extend({}, options) : {};

      // Load scroller module DEFAULTS|CONFIGs
      scrollerDefaults    = $.extend({}, {{scroller_defaults | replace: 'nil', 'null' | replace: '=>', ':' }});
      scrollerSettings    = $.extend({}, {{scroller_settings | replace: 'nil', 'null' | replace: '=>', ':' }});
      scrollerOptions     = $.extend(true, {}, scrollerDefaults, scrollerSettings);

      // settings for dynamic pages
      scrollDynamicPagesTopOnChange = frontmatterOptions.scrollDynamicPagesTopOnChange ? frontmatterOptions.scrollDynamicPagesTopOnChange : '{{template_config.scrollDynamicPagesTopOnChange}}';
      scrollDynamicPagesTopOnChange = j1.stringToBoolean(scrollDynamicPagesTopOnChange);

      // -----------------------------------------------------------------------
      // Global variable settings
      // -----------------------------------------------------------------------
      var logger              = log4javascript.getLogger('j1.init');
      var _this               = j1;
      var curr_state          = 'started';
      var gaCookies           = j1.findCookie('_ga');
      var themesOptions       = $.extend({}, {{themes_options | replace: '=>', ':' | replace: 'nil', '""' }});

      // current template version
      // template_version  = j1.getTemplateVersion();

      // -----------------------------------------------------------------------
      // status settings
      // save status into the adapter object for (later) global access
      // -----------------------------------------------------------------------
      j1['xhrDataState']      = {};
      j1['xhrDOMState']       = {};
      j1['pageMonitor']       = {
        eventNo:              0,
        pageType:             'unknown',
        pageBaseHeight:       0,
        currentPageHeight:    0,
        previousPageHeight:   0,
        currentGrowthRatio:   0,
        previousGrowthRatio:  0
      };

      // -----------------------------------------------------------------------
      // initialize|load user cookies
      // -----------------------------------------------------------------------
      user_session.created    = timestamp_now;
      user_session.timestamp  = timestamp_now;

      user_consent            = j1.readCookie(cookie_names.user_consent);

      user_session            = j1.existsCookie(cookie_names.user_session)
                                  ? j1.readCookie(cookie_names.user_session)
                                  : cookie_written = j1.writeCookie({
                                      name:     cookie_names.user_session,
                                      data:     user_session,
                                      secure:   secure,
                                      expires:  0
                                    });

      user_state              = j1.existsCookie(cookie_names.user_state)
                                  ? j1.readCookie(cookie_names.user_state)
                                  : cookie_written = j1.writeCookie({
                                      name:     cookie_names.user_state,
                                      data:     user_state,
                                      secure:   secure,
                                      expires:  365
                                    });

      user_translate          = j1.existsCookie(cookie_names.user_translate)
                                  ? j1.readCookie(cookie_names.user_translate)
                                  : cookie_written = j1.writeCookie({
                                      name:     cookie_names.user_translate,
                                      data:     user_translate,
                                      secure:   secure,
                                      expires:  365
                                    });

      chat_prompt             = j1.existsCookie(cookie_names.chat_prompt)
                                  ? j1.readCookie(cookie_names.chat_prompt)
                                  : cookie_written = j1.writeCookie({
                                      name:     cookie_names.chat_prompt,
                                      data:     chat_prompt,
                                      secure:   secure,
                                      expires:  365
                                    });

      search_prompt           = j1.existsCookie(cookie_names.search_prompt)
                                  ? j1.readCookie(cookie_names.search_prompt)
                                  : cookie_written = j1.writeCookie({
                                      name:     cookie_names.search_prompt,
                                      data:     search_prompt,
                                      secure:   secure,
                                      expires:  365
                                    });

      if (typeof user_state.template_version == 'undefined') {
        // add for compatibility reasons
        template_version_changed = true;
        user_state.template_version = template_version;
        logger.warn('\n' + 'template_version not found, set value to: ' +  template_version);
        cookie_written = j1.writeCookie({
          name:     cookie_names.user_state,
          data:     user_state,
          secure:   secure,
          expires:  365
        });
      } else if (user_state.template_version != template_version) {
        // update for changed template version
        template_previous_version = user_state.template_version;
        template_version_changed = true;
        user_state.template_version = template_version;
      } else {
        template_version_changed = false;
      }

      if (!user_consent.analysis || !user_consent.personalization)  {
        if (expireCookiesOnRequiredOnly) {
          // expire permanent cookies to session
          j1.expireCookie({ name: cookie_names.user_state });
          j1.expireCookie({ name: cookie_names.user_consent });
          j1.expireCookie({ name: cookie_names.user_translate });
        }
      }

      // logger.info('\n' + 'register monitors');
      // j1.registerMonitors();

      // -----------------------------------------------------------------------
      // APP mode
      // -----------------------------------------------------------------------
      //
      // detect middleware (mode 'app') and update user session cookie
      if (user_session.mode === 'app') {
        var url           = new liteURL(window.location.href);
        var ep_status     = baseUrl + '/status' + '?page=' + window.location.pathname;
        var detectTimeout =  50;

        baseUrl = url.origin;

        // See: https://stackoverflow.com/questions/3709597/wait-until-all-jquery-ajax-requests-are-done
        // wait all $ajax requests done
        $.when (
          $.ajax(ep_status)
        )
        .then((data) => {
          var logger                  = log4javascript.getLogger('j1');
          user_session                = j1.readCookie(cookie_names.user_session);
          user_session.mode           = 'app';
          user_session.requested_page = window.location.pathname;
          user_session.timestamp      = timestamp_now;
          user_session                = j1.mergeData(user_session, data);
          logText                     = '\n' + 'mode detected: ' + user_session.mode;

          logger.info(logText);
          logger.info('\n' + 'update user session cookie');
          logger.debug('\n' + 'write to cookie : ' + cookie_names.user_session);
          cookie_written = j1.writeCookie({
            name:     cookie_names.user_session,
            data:     user_session,
            secure:   secure,
            expires:  0
          });

          j1.setState(curr_state);
          logger.debug('\n' + 'state: ' + j1.getState());

          if (j1.authEnabled()) {
            if (user_session.authenticated === 'true') {
              // set signout
              logger.info('\n' + 'show signout icon');
              $('#navLinkSignInOut').attr('data-bs-target','#modalOmniSignOut');
              $('#iconSignInOut').removeClass('mdib-login').addClass('mdib-logout');
            } else {
              // set signin
              logger.info('\n' + 'show signin icon');
              $('#navLinkSignInOut').attr('data-bs-target','#modalOmniSignIn');
              $('#iconSignInOut').removeClass('mdib-logout').addClass('mdib-login');
            }
            logger.info('\n' + 'authentication detected as: ' + user_session.authenticated);
            $('#quickLinksSignInOutButton').css('display', 'block');
            logger.debug('\n' + 'met dependencies for: j1');
          } // END if (j1.authEnabled
        }) // END all $ajax requests done
        .catch((error) => {
          // jadams, 2018-08-31
          // TODO:  Check why a timeout is required
          setTimeout(() => {
            var logger                  = log4javascript.getLogger('j1');
            user_session                = j1.readCookie(cookie_names.user_session);
            user_session.mode           = 'web';
            user_session.requested_page = window.location.pathname;
            user_session.timestamp      = timestamp_now;
            logText                     = '\n' + 'mode detected: ' + user_session.mode;

            logger.info(logText);
            logger.debug('\n' + 'write to cookie : ' + cookie_names.user_session);
            cookie_written = j1.writeCookie({
              name:     cookie_names.user_session,
              data:     user_session,
              secure:   secure,
              expires:  0
            });

            // -----------------------------------------------------------------
            // load|initialize page resources for block elements
            // NOTE: asynchronous calls should be rewitten to xhrData
            // NOTE: Find $('#no_flicker').hide() conterpart in themes adapter
            // -----------------------------------------------------------------
            var dependencies_met_page_ready = setInterval (() => {
              var pageState       = $('#no_flicker').css("display");
              var pageVisible     = (pageState == 'block') ? true : false;
              var j1CoreFinished  = (j1.getState() == 'finished') ? true : false;
              var atticFinished   = (j1.adapter.attic.getState() == 'finished') ? true: false;

              if (j1CoreFinished && pageVisible && atticFinished) {
                startTimeModule = Date.now();

                banner_blocks   = document.querySelectorAll('[id^="banner"]').length;
                panel_blocks    = document.querySelectorAll('[id^="panel"]').length;
                footer_blocks   = document.querySelectorAll('[id^="footer"]').length;
                banners_exits   = (banner_blocks > 0) ? true : false;
                panels_exists   = (panel_blocks > 0)  ? true : false;
                footer_exists   = (footer_blocks > 0) ? true : false;

                logger.info('\n' + 'load block elements');

                if (banners_exits) {j1.initBanner(settings);}
                if (panels_exists) {j1.initPanel(settings)};
                if (footer_exists) {j1.initFooter(settings);}

                // process pages having banners or panels
                //
                if (banner_blocks || panel_blocks) {
                  var dependencies_met_blocks_ready = setInterval (() => {
                    // check the footer if HTML portion is loaded successfully
                    if (footer_exists) {
                      footer_state = j1.getXhrDataState('#{{footer_id}}');
                    } else {
                      // pages w/o footer
                      footer_state = 'success';
                    }

                    // check bannern if HTML content is loaded successfully
                    //
                    if (banners_exits) {
                      Object.entries(j1.xhrDataState).forEach ((entry) => {
                        const [key, value] = entry;
                        if (key.includes('banner')) {
                          banner_state = value;
                        }
                      });
                    } else {
                      // pages w/o banners
                      banner_state = 'success';
                    }

                    // check panels if HTML content is loaded successfully
                    //
                    if (panels_exists)  {
                      Object.entries(j1.xhrDataState).forEach ((entry) => {
                        const [key, value] = entry;
                        if (key.includes('panel')) {
                          panel_state = value;
                        }
                      });
                    } else {
                      // pages w/o panels
                      panel_state = 'success';
                    }

                    // show the content section if block content is available (CLS optimization)
                    //
                    if (banner_state == 'success' && panel_state == 'success' && footer_state == 'success') {
                      // show the content|footer
                      //
                      $('#no_flicker').show();
                      $('.{{footer}}').show();

                      clearInterval(dependencies_met_blocks_ready);
                    }
                  }, 10); // ENS dependencies_met_blocks_ready
                  // END if banner_blocks || panel_blocks
                } else {
                  // process pages w/o banners or panels
                  //
                  var dependencies_met_footer_block_ready = setInterval (() => {
                    // check the footer if HTML portion is loaded successfully
                    if (footer_exists) {
                      footer_state = j1.getXhrDataState('#{{footer_id}}');
                    } else {
                      // pages w/o footer
                      footer_state = 'success';
                    }

                    // show the content section if footer is available (CLS optimization)
                    //
                    if (footer_state == 'success') {
                      // show the content|footer
                      //
                      $('#no_flicker').show();
                      $('.{{footer}}').show();

                      clearInterval(dependencies_met_footer_block_ready);
                    } // END if footer
                  }, 10);
                } // END pages w/o banners or panels

                clearInterval(dependencies_met_page_ready);
              } // END if pageVisible
            }, 10); // END dependencies_met_page_ready

            j1.setState(curr_state);
            logger.debug('\n' + 'state: ' + j1.getState());
          }, detectTimeout);
        });
        // END app mode
      } else {
        // web mode
        state = 'started';
        logger.debug('\n' + 'state: ' + state);
        logger.info('\n' + 'page is being initialized');
      }

      // ---------------------------------------------------------------------
      // WEB mode
      // ---------------------------------------------------------------------
      if ( settings.scrollbar === 'false'  ) {
        $('body').addClass('hide-scrollbar');
        $('html').addClass('hide-scrollbar-moz');
      }

      logger.info('\n' + 'read user state from cookie');
      user_session = j1.readCookie(cookie_names.user_session);

      // process|update user state cookie
      themeName                 = user_session.theme_name;
      themeCss                  = user_session.theme_css;

      // -----------------------------------------------------------------------
      // Save last page access
      // see: https://stackoverflow.com/questions/3528324/how-to-get-the-previous-url-in-javascript
      // see: https://developer.mozilla.org/de/docs/Web/API/Window/history
      // -----------------------------------------------------------------------
      user_session.timestamp      = timestamp_now;
      referrer                    = new liteURL(document.referrer);
      current_page                = window.location.pathname;
      user_session.requested_page = current_page;
      user_session.previous_page  = referrer.search === '' ?
                                    (referrer.pathname === '' ? current_page : referrer.pathname) :
                                    (user_session.previous_page === '' || user_session.previous_page === 'na'
                                      ? '/'
                                      : user_session.previous_page
                                    );

      // calculate last 'pager' if any
      if (rePager.test(user_session.previous_page)) {
        last_pager                = user_session.previous_page;
        user_session.last_pager   = last_pager;
      } else {
        last_pager                = user_session.last_pager;
      }

      logger.info('\n' + 'update user session cookie');
      logger.debug('\n' + 'write to cookie : ' + cookie_names.user_session);
      cookie_written = j1.writeCookie({
        name:     cookie_names.user_session,
        data:     user_session,
        secure:   secure,
        expires:  0
      });

      // -----------------------------------------------------------------------
      // load|initialize page resources for block elements
      // NOTE: asynchronous calls should be rewitten to xhrData
      // NOTE: Find $('#no_flicker').hide() conterpart in themes adapter
      // -----------------------------------------------------------------------
      var dependencies_met_page_ready = setInterval (() => {
        var pageState       = $('#no_flicker').css("display");
        var pageVisible     = (pageState == 'block') ? true : false;
        var j1CoreFinished  = (j1.getState() == 'finished') ? true : false;
        var atticFinished   = (j1.adapter.attic.getState() == 'finished') ? true: false;

        if (pageVisible && atticFinished) {
          startTimeModule = Date.now();

          logger.info('\n' + 'page is being initialized');

          logger.info('\n' + 'register monitors');
          j1.registerMonitors();

          banner_blocks   = document.querySelectorAll('[id^="banner"]').length;
          panel_blocks    = document.querySelectorAll('[id^="panel"]').length;
          footer_blocks   = document.querySelectorAll('[id^="footer"]').length;
          banners_exits   = (banner_blocks > 0) ? true : false;
          panels_exists   = (panel_blocks > 0)  ? true : false;
          footer_exists   = (footer_blocks > 0) ? true : false;

          logger.info('\n' + 'load block elements');

          if (banners_exits) {j1.initBanner(settings);}
          if (panels_exists) {j1.initPanel(settings)};
          if (footer_exists) {j1.initFooter(settings);}

          // process pages having banners or panels
          //
          if (banner_blocks || panel_blocks) {
            var dependencies_met_blocks_ready = setInterval (() => {
              // check the footer if HTML portion is loaded successfully
              if (footer_exists) {
                footer_state = j1.getXhrDataState('#{{footer_id}}');
              } else {
                // pages w/o footer
                footer_state = 'success';
              }

              // check bannern if HTML content is loaded successfully
              //
              if (banners_exits) {
                Object.entries(j1.xhrDataState).forEach ((entry) => {
                  const [key, value] = entry;
                  if (key.includes('banner')) {
                    banner_state = value;
                  }
                });
              } else {
                // pages w/o banners
                banner_state = 'success';
              }

              // check panels if HTML content is loaded successfully
              //
              if (panels_exists)  {
                Object.entries(j1.xhrDataState).forEach ((entry) => {
                  const [key, value] = entry;
                  if (key.includes('panel')) {
                    panel_state = value;
                  }
                });
              } else {
                // pages w/o panels
                panel_state = 'success';
              }

              // show the content section if block content is available (CLS optimization)
              //
              if (banner_state == 'success' && panel_state == 'success' && footer_state == 'success') {

                // show the content|footer
                //
                $('#no_flicker').show();
                $('#content').show();
                $('.{{footer}}').show();

                clearInterval(dependencies_met_blocks_ready);
              }
            }, 10);

            clearInterval(dependencies_met_page_ready);
            // END if  banner_blocks || panel_blocks
          } else {
            // process pages w/o banners or panels
            //
            var dependencies_met_footer_block_ready = setInterval (() => {
              // check the footer if HTML portion is loaded successfully
              if (footer_exists) {
                footer_state = j1.getXhrDataState('#{{footer_id}}');
              } else {
                // pages w/o footer
                footer_state = 'success';
              }

              // show the content section if footer is available (CLS optimization)
              //
              if (footer_state == 'success') {

                // show the content|footer
                //
                $('#no_flicker').show();
                $('#content').show();
                $('.{{footer}}').show();

                clearInterval(dependencies_met_footer_block_ready);
              } // END  if footer
            }, 10); // END dependencies_met_footer_block_ready
          } // END pages w/o banners or panels

          endTimeModule = Date.now();
          logger.info('\n' + 'page finalized successfully');
          logger.info('\n' + 'page initializing time: ' + (endTimeModule-startTimeModule) + 'ms');

          clearInterval(dependencies_met_page_ready);
        } // END pageVisible
      }, 10); // END dependencies_met_page_ready

      state = 'running';
      logger.debug('\n' + 'state: ' + state);

      user_session.timestamp = timestamp_now;
      logger.debug('\n' + 'write to cookie : ' + cookie_names.user_session);
      cookie_written = j1.writeCookie({
        name:     cookie_names.user_session,
        data:     user_session,
        secure:   secure,
        expires:  0
      });

      // -----------------------------------------------------------------------
      // run additional helpers from j1.core
      // -----------------------------------------------------------------------
      j1.api.bsFormClearButton();

      // -----------------------------------------------------------------------
      // finalize current page
      // -----------------------------------------------------------------------
      //
      j1.finalizePage();
    }, // END init

    // -------------------------------------------------------------------------
    // initBanner()
    // AJAX fetcher to load and place all banner used for a page
    // -------------------------------------------------------------------------
    initBanner: (options) => {
      var logger        = log4javascript.getLogger('j1.initBanner');
      var banner        = [];
      var bannerOptions = [];
      var mod           = 'j1';

      {% comment %}
      Closure to pass additional data (e.g. #banner_id) to AJAX load callback
      See: http://stackoverflow.com/questions/939032/jquery-pass-more-parameters-into-callback
      -------------------------------------------------------------------------- {% endcomment %}
      var cb_load_closure = (banner_id) => {
        return (responseTxt, statusTxt, xhr) => {
          if (statusTxt ==  'success') {
            logger.debug('\n' + 'loading banner completed on id: ' + banner_id);
            j1.setXhrDataState(banner_id, statusTxt);
            j1.setXhrDomState(banner_id, statusTxt);
            logger.debug('\n' + 'XHR data loaded in the DOM: ' + banner_id);
          }
          if (statusTxt == 'error') {
            logText = '\n' + 'loading banner failed on id: '  +banner_id + ', error: ' + xhr.status + ': ' + xhr.statusText;
            logger.error(logText);
            j1.setXhrDataState(banner_id, statusTxt);
            j1.setXhrDomState(banner_id, statusTxt);

            state = 'failed';
            logger.error('\n' + 'state: ' + state);
          }
        };
      };

      {% comment %} Collect all banner id|s configured
      -------------------------------------------------------------------------- {% endcomment %}
      {% for items in banner_settings %}
        {% assign key   = items[0] %}
        {% assign value = items[1] %}

        {% if key == 'divider'    %}  {% assign banner_config  = value %} {% endif %}
        {% if key == 'teaser'     %}  {% assign banner_config  = value %} {% endif %}
        {% if key == 'image'      %}  {% assign banner_config  = value %} {% endif %}
        {% if key == 'parallax'   %}  {% assign banner_config  = value %} {% endif %}
        {% if key == 'exception'  %}  {% assign banner_config  = value %} {% endif %}

        {% for items in banner_config %}
          {% for banners in items %}

            {% for banner in banners %}
                {% for item in banner %}
                  {% assign key   = item[0] %}
                  {% assign value = item[1] %}

                  {% if key and debug %} item:value  {{key}}:{{value}} {% endif %}

                  {% if key == 'id' %}                 {% assign id                 = value %} {% endif %}
                  {% if key == 'enabled' %}            {% assign enabled            = value %} {% endif %}
                {% endfor %}
            {% endfor %}

            {% if id and enabled %}

            {% comment %} Register current banner
            -------------------------------------------------------------------- {% endcomment %}
            banner.push('{{id}}');
            {% endif %}

          {% endfor %}  {% comment %} END banners {% endcomment %}

          {% comment %} Reset (Liquid) element variables
          ---------------------------------------------------------------------- {% endcomment %}
          {% assign id                  = nil %}
          {% assign enabled             = nil %}
          {% assign banner_config       = nil %}

        {% endfor %}  {% comment %} END banner_config {% endcomment %}
      {% endfor %}  {% comment %} END banner_settings {% endcomment %}

      {% comment %} REGISTER exceptions container
      -------------------------------------------------------------------------- {% endcomment %}
      banner.push('exception_container');

      {% comment %} LOAD all banner registered
      -------------------------------------------------------------------------- {% endcomment %}
      if ( banner.length ) {
        for (var i in banner) {
          var id = '#' + banner[i];
          var selector = $(id);
          if (selector.length) {
            logText = '\n' + 'loading banner on id: ' +banner[i];
            logger.info(logText);
            var banner_data_path = '{{banner_data_path}} ' + id + '_content';
            selector.load(banner_data_path, cb_load_closure(id));
          } else {
            continue;
          }
        }
      }  else {
        logText = '\n' + 'no banner found in site';
        logger.debug(logText);

        return false;
      }

      return true;
    }, // END initBanner

    // -------------------------------------------------------------------------
    // initPanel()
    // AJAX fetcher to load and place all panel used for a page
    // -------------------------------------------------------------------------
    initPanel: (options) => {
      var logger = log4javascript.getLogger('j1.initPanel');
      var panel  = [];
      var mod    = 'j1';

      {% comment %} Closure to pass additional data (e.g. panel_id) to AJAX load callback
      See: http://stackoverflow.com/questions/939032/jquery-pass-more-parameters-into-callback
      -------------------------------------------------------------------------- {% endcomment %}

      {% comment %} NOTE
      strategy for MutationObserver callbacks to monitor DOM changes
      needs to be checked if multiple containers are changed in a row
      -------------------------------------------------------------------------- {% endcomment %}
      var cb_load_closure = (panel_id) => {
        return (responseTxt, statusTxt, xhr) => {
          if (statusTxt == 'success') {
            logger.debug('\n' + 'loading panel completed on id: ' + panel_id);
            j1.setXhrDataState(panel_id, statusTxt);
            j1.setXhrDomState(panel_id, statusTxt);
            logger.debug('\n' + 'XHR data loaded in the DOM: ' + panel_id);
          }
          if (statusTxt == 'error') {
            logText = '\n' + 'loading panel failed on id: ' + panel_id + ', error ' + xhr.status + ': ' + xhr.statusText;
            logger.error(logText);
            j1.setXhrDataState(panel_id, statusTxt);
            j1.setXhrDomState(panel_id, statusTxt);

            state = 'error';
            logger.error('\n' + 'state: ' + state);
          }
        };
      };

      {% comment %} Collect all panel id|s configured
      -------------------------------------------------------------------------- {% endcomment %}
      {% for items in panel_settings %}
        {% assign key   = items[0] %}
        {% assign value = items[1] %}

        {% if key == 'intro'     %}  {% assign panel_config  = value %} {% endif %}
        {% if key == 'plan'      %}  {% assign panel_config  = value %} {% endif %}
        {% if key == 'service'   %}  {% assign panel_config  = value %} {% endif %}
        {% if key == 'step'      %}  {% assign panel_config  = value %} {% endif %}
        {% if key == 'news'      %}  {% assign panel_config  = value %} {% endif %}
        {% if key == 'exception' %}  {% assign panel_config  = value %} {% endif %}

        {% for items in panel_config %}
          {% for panels in items %}

            {% for panel in panels %}
                {% for item in panel %}
                  {% assign key = item[0] %}
                  {% assign value = item[1] %}

                  {% if key and debug %} item:value  {{key}}:{{value}}  {% endif %}

                  {% if key == 'id' %}                 {% assign id                 = value %} {% endif %}
                  {% if key == 'enabled' %}            {% assign enabled            = value %} {% endif %}
                {% endfor %}
            {% endfor %}

      {% comment %} Register current panel
      -------------------------------------------------------------------------- {% endcomment %}
      {% if id and enabled %}
      panel.push('{{id}}');
      {% endif %}

      {% comment %} Reset (Liquid) element variables
      -------------------------------------------------------------------------- {% endcomment %}
      {% assign id           = nil %}
      {% assign enabled      = nil %}
      {% assign panel_config = nil %}

          {% endfor %}  {% comment %} END panels {% endcomment %}
        {% endfor %}  {% comment %} END panel_config {% endcomment %}
      {% endfor %}  {% comment %} END panel_settings {% endcomment %}

      if (panel.length) {
        for (var i in panel) {
          var id = '#' + panel[i];
          var selector = $(id);
          if ( selector.length ) {
            logText = '\n' + 'loading panel on id: ' +panel[i];
            logger.info(logText);
            var panel_data_path = '{{panel_data_path}} ' + id + '_content';
            selector.load(panel_data_path, cb_load_closure(id));
          } else {
            continue;
          }
        }
      } else {
        logText = '\n' + 'no panel found in site';
        logger.debug(logText);

        return false;
      }

      return true;
    }, // END initPanel

    // -------------------------------------------------------------------------
    // initFooter()
    // AJAX fetcher to load and place the footer used for a page
    // -------------------------------------------------------------------------
    initFooter: (options) => {
      var logger = log4javascript.getLogger('j1.initFooter');
      var mod    = 'j1';

      var cb_load_closure = (footer_id) => {
        return (responseTxt, statusTxt, xhr) => {
          if (statusTxt ==  'success') {
            logger.debug('\n' + 'footer loaded successfully on id: ' + footer_id);
            j1.setXhrDataState(footer_id, statusTxt);
            j1.setXhrDomState(footer_id, statusTxt);
            logger.debug('\n' + 'XHR data loaded in the DOM: ' + footer_id);
            logger.debug('\n' + 'initialization footer finished');
          }
          if (statusTxt == 'error') {
            logText = '\n' + 'loading footer failed on id: ' + footer_id + ', error ' + xhr.status + ': ' + xhr.statusText;
            logger.error(logText);
            j1.setXhrDataState(footer_id, statusTxt);
            j1.setXhrDomState(footer_id, statusTxt);

            // Set|Log status
            state = 'failed';
            logger.error('\n' + 'state: ' + state);
            logger.error('\n' + 'initialization footer failed');
          }
        };
      };

      logger.info('\n' + 'loading footer on id: {{footer_id}}');

      var id = '#' + '{{footer_id}}';
      var selector = $(id);
      if (selector.length) {
        var footer_data_path = '{{footer_data_path}} ' + id;
        selector.load(footer_data_path, cb_load_closure(id));
      } else {
        logger.debug('\n' + 'data not loaded');
        j1.setXhrDataState(id, 'not loaded');
        j1.setXhrDomState(id, 'pending');

        return false;
      }

      return true;
    }, // END initFooter

    // -------------------------------------------------------------------------
    // finalizePage
    // DISABLED: show the page after timeout of {{flickerTimeout}} ms
    // -------------------------------------------------------------------------
    // NOTE:
    //  jadams, 2019-08-21: for unknown reason, the user state data
    //  (read from cookie) seems not correct (or loaded too late).
    //  To make correct data sure for APP mode, a status request is done
    //  to load the current state from the middleware (skipped in WEB mode)
    // -------------------------------------------------------------------------
    finalizePage: (options) => {
      var logger              = log4javascript.getLogger('j1.finalizePage');
      var url                 = new liteURL(window.location.href);
      var baseUrl             = url.origin;
      var secure              = (url.protocol.includes('https')) ? true : false;
      var ep_status           = baseUrl + '/status' + '?page=' + window.location.pathname;
      var user_session        = j1.readCookie(cookie_names.user_session);
      var user_state          = j1.readCookie(cookie_names.user_state);
      var user_consent        = j1.readCookie(cookie_names.user_consent);
      var user_translate      = j1.readCookie(cookie_names.user_translate);
      var current_url         = new liteURL(window.location.href);
      var providerPermissions = {};
      var provider;
      var previous_page;
      var appDetected;
      var categoryAllowed;

      // provider APIs require user consent
      // -----------------------------------------------------------------------
      var meta_analytics        = $('meta[name=analytics]').attr('content');
      var analytics             = (meta_analytics === 'true') ? true: false;
      var meta_comments         = $('meta[name=comments]').attr('content');
      var comments              = (meta_comments === 'true') ? true: false;
      var meta_advertising      = $('meta[name=advertising]').attr('content');
      var advertising           = (meta_advertising === 'true') ? true: false;
      var meta_youtube          = $('meta[name=youtube]').attr('content');
      var youtube               = (meta_youtube === 'true') ? true: false;
      var meta_vimeo            = $('meta[name=vimeo]').attr('content');
      var vimeo                 = (meta_vimeo === 'true') ? true: false;

      // personalized content require user consent
      var meta_personalization  = $('meta[name=personalization]').attr('content');
      var personalization       = (meta_personalization === 'true') ? true: false;

      const cb = (list) => {
          list.getEntries().forEach ((entry) => {
              console.log(entry);
          });
      }

      // if personalized content detected, page requires user consent
      // -----------------------------------------------------------------------
      if (personalization && !user_consent.personalization) {
        // redirect to error page: blocked content
        window.location.href = '/444.html';
      }

      logger.info('\n' + 'finalize page');
      logText= '\n' + 'loading page partials: started';
      logger.info(logText);

      if (j1.appDetected()) {
        // ---------------------------------------------------------------------
        // APP mode
        // ---------------------------------------------------------------------
        logger.info('\n' + 'mode detected: app');

        $.when ($.ajax(ep_status))
        .then(function(data) {
          var logger = log4javascript.getLogger('j1.finalizePage');

          user_session = j1.mergeData(user_session, data);

          user_session.current_page = current_url.pathname;
          logger.debug('\n' + 'write to cookie : ' + cookie_names.user_session);
          cookie_written = j1.writeCookie({
            name:     cookie_names.user_session,
            data:     user_session,
            secure:   secure,
            expires:  0
          });

          providerPermissions = user_session.provider_permissions;
          categoryAllowed     = providerPermissions.includes(user_session.page_permission);

          // -------------------------------------------------------------------
          // check protected pages (applies for APP only)
          // make sure that protected pages are ALWAYS checked for permissions
          //
          if (
            j1.authEnabled() &&
            user_session.page_permission !== 'public' &&
            categoryAllowed === false
          ){
            // redirect to middleware|page_authentication
            if (data.authenticated === 'true') {
              var ep_post_authentication = baseUrl + '/post_authentication';
              window.location.href = ep_post_authentication;
          } else if (j1.authEnabled()) {
              var ep_page_validation = baseUrl + '/page_validation?page=' + window.location.pathname;
              window.location.href = ep_page_validation;
              return false;
            }
          }

          // enable (body) animation on page load if enabled
          if (bodyAnimation) {
            var body_animation_fadein  = '<style id="body_animation">';
            body_animation_fadein     += '  body {';
            body_animation_fadein     += '    animation: fadeInAnimation ease ' + bodyAnimationDuration + 's;';
            body_animation_fadein     += '    animation-iteration-count: 1;';
            body_animation_fadein     += '    animation-fill-mode: forwards;';
            body_animation_fadein     += '  }';
            body_animation_fadein     += '  @keyframes fadeInAnimation {';
            body_animation_fadein     += '    0% {';
            body_animation_fadein     += '    	opacity: 0;';
            body_animation_fadein     += '    }';
            body_animation_fadein     += '    100% {';
            body_animation_fadein     += '    	opacity: 1;';
            body_animation_fadein     += '    }';
            body_animation_fadein     += '  }';
            body_animation_fadein     += '</style>';
            $('head').append(body_animation_fadein);
          }

          // display the page loaded is managed by module "themes"
          // $('#no_flicker').css('display', 'block');
          // $('#no_flicker').show();

          // jadams, 2021-12-06: Check if access to cookies for this site failed.
          // Possibly, a third-party domain or an attacker tries to access it.
          if (checkCookies) {
            var j1Cookies = j1.findCookie('j1');
            if (!j1.existsCookie(cookie_names.user_state)) {
              logger.error('\n' + 'Access to cookie failed or cookie not found: ' + cookie_names.user_state);
              logger.info('\n' + 'j1 cookies found:' + j1Cookies.length);
              // redirect to error page: blocked content
              window.location.href = '/446.html';
            } else {
              logger.info('\n' + 'j1 cookies found:' + j1Cookies.length);
            }
          }

          // manage Dropcaps if translation is enabled|disabled
          // -----------------------------------------------------------------
          if (user_translate.translationEnabled) {
           logger.info('\n' + 'translation enabled: ' + user_translate.translationEnabled);
           logger.debug('\n' + 'skipped processing of dropcaps');
          } else {
           // initialize dropcaps
           logger.info('\n' + 'post processing: createDropCap');
           j1.api.createDropCap();
          }

          // TODO: should MOVED to Cookiebar ???
          // show|hide cookie icon
          if (j1.existsCookie(cookie_names.user_consent)) {
            // Display cookie icon
            logText = '\n' + 'show cookie icon';
            logger.info(logText);
            $('#quickLinksCookieButton').css('display', 'block');
          } else {
            logText = '\n' + 'hide cookie icon';
            logger.info(logText);
            // Display cookie icon
            $('#quickLinksCookieButton').css('display', 'none');
          }

          // TODO: should MOVED to ControlCenter Adapter ???
          // -----------------------------------------------------------------
          // show cc icon (currently NOT supported)
          // $('#quickLinksControlCenterButton').css('display', 'block');

          if (j1.authEnabled()) {
            if (user_session.authenticated === 'true') {
              // set signout
              logger.info('\n' + 'show signout icon');
              $('#navLinkSignInOut').attr('data-bs-target','#modalOmniSignOut');
              $('#iconSignInOut').removeClass('mdib-login').addClass('mdib-logout');
            } else {
              // set signin
              logger.info('\n' + 'show signin icon');
              $('#navLinkSignInOut').attr('data-bs-target','#modalOmniSignIn');
              $('#iconSignInOut').removeClass('mdib-logout').addClass('mdib-login');
            }
            logger.info('\n' + 'authentication detected as: ' + user_session.authenticated);
            $('#quickLinksSignInOutButton').css('display', 'block');
          }

          // TODO: should MOVED to themes ???
          // jadams, 2021-07-25: hide|show themes menu on cookie consent
          // (analysis|personalization) settings. BootSwatch is a 3rd party
          // is using e.g GA. Because NO control is possible on 3rd parties,
          // for GDPR compliance, themes feature may disabled on
          // privacy settings
          if (!user_consent.personalization)  {
            logger.debug('\n' + 'disable themes feature because of privacy settings');
            logger.debug('\n' + 'personalization not allowed, privacy settings for personalization: ' + user_consent.personalization);
            $("#themes_menu").hide();
          } else {
            $("#themes_menu").show();
          }

          // detect if a loaded page has been chenged
          if (user_session.previous_page !== user_session.current_page) {
            logText = '\n' + 'page change detected';
            logger.info(logText);
            logText = '\n' + 'previous page: ' + user_session.previous_page;
            logger.info(logText);
            logText = '\n' + 'current page: ' + user_session.current_page;
            logger.info(logText);
          }

          // update sidebar for changed theme data
          logger.info('\n' + 'update sidebar');
          user_state        = j1.readCookie(cookie_names.user_state);
          current_user_data = j1.mergeData(user_session, user_state);
          j1.api.navigator.updateSidebar(current_user_data);

          // initiate smooth scroller if page is ready and visible
          var dependencies_met_page_ready = setInterval (() => {
            var pageState       = $('#no_flicker').css("display");
            var pageVisible     = (pageState == 'block') ? true: false;
            var j1CoreFinished  = (j1.getState() == 'finished') ? true : false;
            var atticFinished   = (j1.adapter.attic.getState() == 'finished') ? true: false;

            if (j1CoreFinished && pageVisible && atticFinished) {
              setTimeout(() => {
                // scroll to an anchor in current page if given in URL
                j1.scrollToAnchor();
              }, {{template_config.page_on_load_timeout}});

              clearInterval(dependencies_met_page_ready);
            }
          }, 10);

          // set|log status
          state = 'finished';
          j1.setState(state);
          logText = '\n' + 'state: ' + state;
          logger.info(logText);
          logText = '\n' + 'page finalized successfully';
          logger.info(logText);

          endTimeModule = Date.now();
          logger.info('\n' + 'page initializing time: ' + (endTimeModule-startTimeModule) + 'ms');

        });
      } else {
        // ---------------------------------------------------------------------
        // WEB mode
        // ---------------------------------------------------------------------
        logger.info('\n' + 'state: finished');
        logger.info('\n' + 'page initialization: finished');

        // enable (body) animation on page load if enabled
        if (bodyAnimation) {
          var body_animation_fadein  = '<style id="body_animation">';
          body_animation_fadein     += '  body {';
          body_animation_fadein     += '    animation: fadeInAnimation ease ' + bodyAnimationDuration + 's;';
          body_animation_fadein     += '    animation-iteration-count: 1;';
          body_animation_fadein     += '    animation-fill-mode: forwards;';
          body_animation_fadein     += '  }';
          body_animation_fadein     += '  @keyframes fadeInAnimation {';
          body_animation_fadein     += '    0% {';
          body_animation_fadein     += '    	opacity: 0;';
          body_animation_fadein     += '    }';
          body_animation_fadein     += '    100% {';
          body_animation_fadein     += '    	opacity: 1;';
          body_animation_fadein     += '    }';
          body_animation_fadein     += '  }';
          body_animation_fadein     += '</style>';

          $('head').append(body_animation_fadein);
        }

        // display the page loaded is managed by module "themes"
        // $('#no_flicker').css('display', 'block');
        // $('#no_flicker').show();

        // jadams, 2021-12-06: Check if access to cookies for this site failed.
        // Possibly, a third-party domain or an attacker tries to access it.
        if (checkCookies) {
          var j1Cookies = j1.findCookie('j1');
          if (!j1.existsCookie(cookie_names.user_state)) {
            logger.error('\n' + 'Access to cookie failed or cookie not found: ' + cookie_names.user_state);
            logger.info('\n' + 'j1 cookies found:' + j1Cookies.length);
            // redirect to error page: blocked content
            window.location.href = '/446.html';
          } else {

            logger.info('\n' + 'j1 cookies found:' + j1Cookies.length);
          }
        }

        // jadams, 2021-11-19: test code for 'tapTarget' of 'materializeCss'
        // See:
        //  https://stackoverflow.com/questions/49422111/opening-tap-target-in-materialize-css-for-2-seconds
        // -------------------------------------------------------------------
        // $('#features').tapTarget();
        // $('#features').click(function(e) {
        //   logger.info('\n' + 'call default action');
        //   $('#features').tapTarget('open');
        // });

        // jadams, 2021-11-19: additional code for accordions (collapsible)
        // used e.g for the 'SERVICE Panel'
        // -------------------------------------------------------------------
        // Add minus icon for collapse element which is open by default
        $(".collapse.show").each(function(){
            $(this).prev(".card-header").addClass("highlight");
        });

        // Highlight open collapsed element
        $(".card-header .btn").click(function(){
            $(".card-header").not($(this).parents()).removeClass("highlight");
            $(this).parents(".card-header").toggleClass("highlight");
        });

        // manage Dropcaps if translation is enabled|disabled
        // -------------------------------------------------------------------
        if (user_translate.translationEnabled) {
          logger.info('\n' + 'translation enabled: ' + user_translate.translationEnabled);
          logger.debug('\n' + 'skipped processing of dropcaps');
        } else {
          // initialize dropcaps
          logger.info('\n' + 'post processing: createDropCap');
          j1.api.createDropCap();
        }

        logger.info('\n' + 'mode detected: web');
        logger.info('\n' + 'hide signin icon');
        $('#quickLinksSignInOutButton').css('display', 'none');

        user_session.current_page = current_url.pathname;
        logger.debug('\n' + 'write to cookie : ' + cookie_names.user_session);
        cookie_written = j1.writeCookie({
            name:     cookie_names.user_session,
            data:     user_session,
            secure:   secure,
            expires:  0
        });

        // TODO: should MOVED to ControlCenter Adapter ???
        // -----------------------------------------------------------------
        // show cc icon (currently NOT supported)
        // $('#quickLinksControlCenterButton').css('display', 'block');

        // TODO: should MOVED to Cookiebar ???
        // show|hide cookie icon
        if (j1.existsCookie(cookie_names.user_consent)) {
          // Display cookie icon
          logText = '\n' + 'show cookie icon';
          logger.info(logText);
          $('#quickLinksCookieButton').css('display', 'block');
        } else {
          logText = '\n' + 'hide cookie icon';
          logger.info(logText);
          // Display cookie icon
          $('#quickLinksCookieButton').css('display', 'none');
        }

        // TODO: should MOVED to themes ???
        // jadams, 2021-07-25: hide|show themes menu on cookie consent
        // (analysis|personalization) settings. BootSwatch is a 3rd party
        // is using e.g GA. Because NO control is possible on 3rd parties,
        // for GDPR compliance, themes feature may disabled on
        // privacy settings
        if (!user_consent.personalization) {
          logger.debug('\n' + 'disable themes feature because of privacy settings');
          logger.debug('\n' + 'personalization not allowed, privacy settings for personalization: ' + user_consent.personalization);
          $("#themes_menu").hide();
        } else {
          $("#themes_menu").show();
        }

        // detect if a loaded page has been chenged
        if (user_session.previous_page !== user_session.current_page) {
          logText = '\n' + 'page change detected';
          logger.info(logText);
          logText = '\n' + 'previous page: ' + user_session.previous_page;
          logger.info(logText);
          logText = '\n' + 'current page: ' + user_session.current_page;
          logger.info(logText);
        }

        // update sidebar for changed theme data
        logger.info('\n' + 'update sidebar');
        user_state        = j1.readCookie(cookie_names.user_state);

        if (template_version_changed) {
          if (typeof template_previous_version == 'undefined') template_previous_version = 'na';
          logger.warn('\n' + 'template version detected as changed');
          logger.warn('\n' + 'template version previous|current: ' +  template_previous_version + '|' + template_version);

          // Update the user_state cookie
          // TODO:  replace theme_version by template_version as they
          //        are alwas the same
          //        disable: user_state.theme_version = template_version;
          //
          user_state.template_version = template_version;
          cookie_written = j1.writeCookie({
          	name:     cookie_names.user_state,
          	data:     user_state,
          	secure:   secure,
          	expires:  365
          });
          logger.warn('\n' + 'template version updated to: ' +  template_version);
        } else {
          logger.info('\n' + 'template version detected: ' +  user_state.template_version);
        }

        // set current user data
        current_user_data = j1.mergeData(user_session, user_state);
        j1.api.navigator.updateSidebar(current_user_data);

        // initiate smooth scroller if page is ready and visible
        var dependencies_met_page_ready = setInterval (() => {
          var pageState      = $('#no_flicker').css("display");
          var pageVisible    = (pageState == 'block') ? true: false;
          var j1CoreFinished = (j1.getState() === 'finished') ? true : false;
          var atticFinished  = (j1.adapter.attic.getState() == 'finished') ? true: false;

          if (j1CoreFinished && pageVisible && atticFinished) {
            setTimeout(() => {
              // scroll to an anchor in current page if given in URL
              j1.scrollToAnchor();
            }, {{template_config.page_on_load_timeout}});

            clearInterval(dependencies_met_page_ready);
          } // END if pageVisible
        }, 10); // END dependencies_met_page_ready

        // set|log status
        state = 'finished';
        j1.setState(state);
        logText = '\n' + 'state: ' + state;
        logger.info(logText);
        logText = '\n' + 'page finalized successfully';
        logger.info(logText);

        endTimeModule = Date.now();
        logger.info('\n' + 'page initializing time: ' + (endTimeModule-startTimeModule) + 'ms');
      }
    }, // END finalizePage

    // -------------------------------------------------------------------------
    // mergeData()
    // merge two objects (properties) and returns the resulting object
    // see: https://stackoverflow.com/questions/43109229/merge-default-options-containing-object-with-json-object
    // TODO:  Improve comment, give synopsis and example
    // -------------------------------------------------------------------------
    mergeData: function () {
      var a = [].slice.call(arguments), o = a.shift();

      for(var i=0,l=a.length; i<l; i++){
        for(var p in a[i]){
          o[p] = a[i][p];
        }
      }
      return o;
    }, // END mergeData

    // -------------------------------------------------------------------------
    // getPrevPage()
    // Returns the last vistited page
    // -------------------------------------------------------------------------
    getPrevPage: () => {
      return previous_page;
    }, // END getPrevPage

    // -------------------------------------------------------------------------
    // getLanguage()
    // Returns the preferred language taken form window.navigator
    // See:
    // https://stackoverflow.com/questions/1043339/javascript-for-detecting-browser-language-preference
    // -------------------------------------------------------------------------
    getLanguage: () => {
      var language = navigator.languages ? navigator.languages[0] : (navigator.language || navigator.userLanguage);
    }, // END getLanguage

    // -------------------------------------------------------------------------
    // getTemplateVersion()
    // Returns the template version taken from site config (_config.yml)
    // -------------------------------------------------------------------------
    getTemplateVersion: () => {
      return '{{template_version}}';
    }, // END getTemplateVersion

    // -------------------------------------------------------------------------
    // getScrollOffset()
    // Calculate offset for a correct (smooth) scroll position
    // -------------------------------------------------------------------------
    getScrollOffset: (offsetCorrection) => {
      var $pagehead     = $('.attic');
      var $navbar       = $('#navigator_nav_navbar');
      var $adblock      = $('#adblock');
      var navbarType    = $navbar.hasClass('navbar-fixed') ? 'fixed' : 'scrolled';
      var fontSize      = $('body').css('font-size').replace('px','');

      var f             = parseInt(fontSize);
      var h             = $pagehead.length ? $pagehead.height() : 0;
      var n             = $navbar.length ? $navbar.height() : 0;
      var a             = $adblock.length ? $adblock.height() : 0;

      // Unclear why or what element cause the need of a correction
      // TODO: General revision of scrollOffset needed
      // NOTE: Disabled for now
      //
      // offsetCorrection  = navbarType == 'fixed' ? 10 : -25;

      scrollOffset      = navbarType == 'fixed'
                            ? -1*(n + a + f) + offsetCorrection
                            : -1*(n + a + f) + h + offsetCorrection;

      return scrollOffset;
    }, // END getScrollOffset

    // -------------------------------------------------------------------------
    // scrollTo()
    // Scrolls smooth to any anchor referenced by an page URL on
    // e.g. a page reload. Values e.g for delay are taken from
    // TOCCER module
    // NOTE: crollTo() is triggered by 'onDocumentHeigthChange'
    // -------------------------------------------------------------------------
    scrollTo: (offset) => {
      var logger          = log4javascript.getLogger('j1.scrollTo');
      var anchor          = window.location.href.split('#')[1];
      var anchor_id       = (typeof anchor !== 'undefined') && (anchor != '') ? '#' + anchor : false;
      var scrollDuration  = {{toccer_options.scrollSmoothDuration}};
      var scrollOffset    = offset; // j1.getScrollOffset();
      var isSlider        = false;
      var selector        = $(anchor_id);

      // skip invalid anchors|selectors
      //
      if (typeof anchor === 'undefined' || anchor.includes('slide') || anchor.includes('googtrans') || !$(selector).length) {
        return false;
      }

      // Check if the anchor is an slider/gallery element
      //
      if (typeof anchor !== 'undefined') {
        isSlider = anchor.includes('slide');
      }

      if (anchor_id && anchor_id !== '#' && !isSlider) {
        // scroll only, if an anchor is given with an URL
        selector = $(anchor_id);
        if (selector.length) {
          logger.info('\n' + 'scrollTo header: ' + anchor_id);
          j1.api.scrollSmooth.scroll(anchor_id, {
            duration:   scrollDuration,
            offset:     scrollOffset,
            callback:   false
          });
        } else {
          // scroll the page one pixel back and forth (trigger)
          // to get the right position for the Toccer and adjust the
          // Navigator to display the (tranparent) navbar correctly
          //
          $(window).scrollTop($(window).scrollTop()+1);
          $(window).scrollTop($(window).scrollTop()-1);
        }
      } else if (anchor_id === '#') {
        logger.info('\n' + 'bound click event to "#", suppress default action');
        $(window).scrollTop($(window).scrollTop()+1);
        $(window).scrollTop($(window).scrollTop()-1);

        return false;
      }
    }, // END scrollTo

    // -------------------------------------------------------------------------
    //  authEnabled()
    //  Returns the state of the authentication module
    // -------------------------------------------------------------------------
    authEnabled: () => {
      var logger      = log4javascript.getLogger('j1.authentication');
      var authEnabled = {{authentication_options.j1_auth.enabled}};

      return authEnabled;
    }, // END authEnabled

    // -------------------------------------------------------------------------
    //  appDetected()
    //  Returns true if a web session cookie exists
    // -------------------------------------------------------------------------
    appDetected: () => {
      var user_session;
      var cookieExists = j1.existsCookie(cookie_names.user_session);
      var detected = false;

      if (cookieExists) {
        user_session = j1.readCookie(cookie_names.user_session);
        detected     = user_session.mode === 'app' ? true : false;
      } else {
        // detected = 'unknown';
        detected = false;
      }

      return detected;
    }, // END appDetected

    // -------------------------------------------------------------------------
    // loadHTML()
    // Load HTML data asychronously using XHR|jQuery on an element (e.g. <div>)
    // specified by xhr_container_id, xhr_data_path (options)
    // -------------------------------------------------------------------------
    loadHTML: (options, mod, status) => {
      var logger            = log4javascript.getLogger('j1.loadHTML');
      var selector          = $('#' + options.xhr_container_id);
      var state             = status;
      var observer_options  = {
        attributes:     false,
        childList:      true,
        characterData:  false,
        subtree:        true
      };
      var observer;

      var cb_load_closure = (mod, id) => {
        return (responseTxt, statusTxt, xhr) => {
          if (statusTxt === 'success') {
            j1.setXhrDataState(id, statusTxt);
            j1.setXhrDomState(id, 'pending');

            logger.debug('\n' + 'data loaded successfully on id: ' +id);

            state = true;
          }
          if ( statusTxt === 'error' ) {
            // jadams, 2020-07-21: to be checked why id could be UNDEFINED
            if (typeof(id) != "undefined") {
              state = 'failed';
              logger.debug('\n' + 'set state for ' +mod+ ' to: ' + state);
              // jadams, 2020-07-21: intermediate state should DISABLED
              // executeFunctionByName(mod + '.setState', window, state);
              j1.setXhrDataState(id, statusTxt);
              j1.setXhrDomState(id, 'pending');
              logText = '\n' + 'loading data failed on id: ' +id+ ', error ' + xhr.status + ': ' + xhr.statusText;
              logger.error(logText);

              state = false;
            }
          }
        };
      };

      // see: https://stackoverflow.com/questions/20420577/detect-added-element-to-dom-with-mutation-observer
      //
      var html_data_path = options.xhr_data_path + ' #' + options.xhr_data_element;
      var id             = '#' + options.xhr_container_id;
      var container      = '#' + options.xhr_container_id + '_container';
      var $selector      = $(id);

      // NOTE: Unclear why some pages (e.g. about/site) affected (fam button).
      // All pages should have FRONTMATTER defaults (by _config.yml) setting
      // all relevant defaults.

      // failsafe - prevent XHR load errors
      if (options.xhr_data_element !== '') {
        logger.debug('\n' + 'XHR data element found: ' + options.xhr_data_element);
      } else  {
        logger.debug('\n' + 'no XHR data element found, loading data aborted');
        return;
      }

      if ($selector.length) {
        $selector.load(html_data_path, cb_load_closure( mod, id ));

        var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
        var xhrObserver = new MutationObserver (mutationHandler);
        var obsConfig = {
            childList: true,
            characterData: false,
            attributes: false,
            subtree: false };

        selector.each(function(){
            xhrObserver.observe(this, obsConfig);
        });

        function mutationHandler (mutationRecords) {
          mutationRecords.forEach ( function (mutation) {
            if (mutation.addedNodes.length) {
              logger.debug('\n' + 'XHR data loaded in the DOM: ' + id);
              j1.setXhrDomState(id, 'success');
            }
          });
        }
      } else {
        // jadams, 2020-07-21: To be clarified why a id is "undefined"
        // failsafe - prevent XHR load errors
        if (id !== '#undefined') {
          j1.setXhrDataState(id, 'not loaded');
          j1.setXhrDomState(id, 'not loaded')

          // jadams, 2020-07-21: intermediate state should DISABLED
          // executeFunctionByName(mod + '.setState', window, state);
          // state = false;
        }
      }

      return state;
    }, // END loadHTML

    // -------------------------------------------------------------------------
    // loadJS()
    // Load JS data asychronously using jQuery (XHR)
    // -------------------------------------------------------------------------
    loadJS: (options, mod, status) => {
      var logger  = log4javascript.getLogger('j1.loadJS');
      var state   = status;
      var logText;

      var cb_load_closure = function(mod, id) {
        return function (responseTxt, statusTxt, xhr) {
          var logger = log4javascript.getLogger('j1.loadJS');
          if ( statusTxt === 'success' ) {
            j1.setXhrDataState(id, statusTxt);

            logText = '\n' + 'data loaded successfully for: ' +id;
            logger.info(logText);

            state = true;
          }
          if ( statusTxt === 'error' ) {
            state = 'failed';
            logger.info('\n' + 'set state for ' +mod+ ' to: ' + state);
            j1.setXhrDataState(id, statusTxt);
            logText = '\n' + 'loading data failed for: ' +id+ ', error ' + xhr.status + ': ' + xhr.statusText;
            logger.error(logText);

            state = false;
          }
        };
      };

      $.ajax({
        url:      options.xhr_data_path,
        dataType: 'script',
        success:  cb_load_closure(mod, options.xhr_data_element)
      });

      return state;
    }, // END loadJS

    // -------------------------------------------------------------------------
    // removeRessource (Vanilla JS)
    // -------------------------------------------------------------------------
    removeRessource: (filename, filetype) => {
      // determine element type to create nodelist from
      var targetelement = (filetype === "js") ? "script" : (filetype === "css") ? "link" : "none";
      // determine corresponding attribute to test for
      var targetattr = (filetype === "js") ? "src" : (filetype === "css") ? "href" : "none";
      var allsuspects = document.getElementsByTagName(targetelement)

      // search backwards within nodelist for matching elements to remove
      // remove element by calling parentNode.removeChild()
      for (var i=allsuspects.length; i>=0; i--) {
        if (allsuspects[i] && allsuspects[i].getAttribute(targetattr)!=null && allsuspects[i].getAttribute(targetattr).indexOf(filename)!=-1)
            allsuspects[i].parentNode.removeChild(allsuspects[i])
      }
    }, // END removeRessource

    // -------------------------------------------------------------------------
    // subdomain()
    // Returns true|false if a subdomain is used for a given URL
    // -------------------------------------------------------------------------
    subdomain: (url) => {
      // See: https://snipplr.com/view/5449/check-if-a-url-contains-a-subdomain

      // IF THERE, REMOVE WHITE SPACE FROM BOTH ENDS
      url = url.replace(new RegExp(/^\s+/),""); // START
      url = url.replace(new RegExp(/\s+$/),""); // END

      // IF FOUND, CONVERT BACK SLASHES TO FORWARD SLASHES
      url = url.replace(new RegExp(/\\/g),"/");

      // IF THERE, REMOVES 'http://', 'https://' or 'ftp://' FROM THE START
      url = url.replace(new RegExp(/^http\:\/\/|^https\:\/\/|^ftp\:\/\//i),"");

      // IF THERE, REMOVES 'www.' FROM THE START OF THE STRING
      url = url.replace(new RegExp(/^www\./i),"");

      // REMOVE COMPLETE STRING FROM FIRST FORWARD SLASH ON
      url = url.replace(new RegExp(/\/(.*)/),"");

      // REMOVES '.??.??' OR '.???.??' FROM END - e.g. '.CO.UK', '.COM.AU'
      if (url.match(new RegExp(/\.[a-z]{2,3}\.[a-z]{2}$/i))) {
            url = url.replace(new RegExp(/\.[a-z]{2,3}\.[a-z]{2}$/i),"");

      // REMOVES '.??' or '.???' or '.????' FROM END - e.g. '.US', '.COM', '.INFO'
      } else if (url.match(new RegExp(/\.[a-z]{2,4}$/i))) {
            url = url.replace(new RegExp(/\.[a-z]{2,4}$/i),"");
      }

      // CHECK TO SEE IF THERE IS A DOT '.' LEFT IN THE STRING
      var isSubDomain = (url.match(new RegExp(/\./g))) ? true : false;

      return(isSubDomain);
    }, // END subdomain

    // -------------------------------------------------------------------------
    //  readCookie (Vanilla JS)
    // -------------------------------------------------------------------------
    readCookie: (name) => {
      var data;
      var data_json;
      var cookieExists = j1.existsCookie(name);

      if (cookieExists) {
        data_json = window.atob(Cookies.get(name));
        data      = JSON.parse(data_json);

        if (data) {
          return data;
        } else {
          return false;
        }
      } else {
        return false;
      }
    }, // END readCookie

    // -------------------------------------------------------------------------
    // writeCookie (Cookie lib)
    // Write 'data' to a cookie 'name'. If not exists, the cookie gets
    // created. Returns 'true' if cookie was written, otherwise 'false'.
    // -------------------------------------------------------------------------
    // NOTE:
    //    https://web.dev/samesite-cookies-explained/
    //    https://developer.mozilla.org/de/docs/Web/HTTP/Headers/Set-Cookie/SameSite
    //    https://www.smarketer.de/blog/chrome-update-80-cookies/
    // -------------------------------------------------------------------------
    // SESSION Cookies:
    // NOT putting an EXPIRES part in will create a session cookie.
    // -------------------------------------------------------------------------
    // REMOVING Cookies: Cookies get removed immediately, if the expires
    // part points to a PAST date (e.g. 01 Jan 1970 00:00:00 UTC).
    // -------------------------------------------------------------------------
    // MAX-AGE Cookies: To leave cookies for a specific time, set the expires
    // part into a FUTUTE date. FOR GDPR compliance, MAX-AGE is 365 days.
    // TODO:  Change attribute "Secure" to true, if HTTPS is used.
    //        Checks and config changes are to be done.
    // -------------------------------------------------------------------------
    // TODO: Handling of  attribute "SameSite".
    //    Config to use this attribute should be configurable
    //    (what config file?).
    //    Disabled use for now in general.
    //
    //    The SameSite attribute of the Set-Cookie HTTP response header
    //    allows you to declare if your cookie should be restricted to a
    //    first-party or same-site context. Cookies with SameSite=None
    //    must now also specify the Secure attribute (they require a secure
    //    context/HTTPS).
    // -------------------------------------------------------------------------
    writeCookie: (options /*name, data, [path, expires, domain, samesite, http_only, secure]*/) => {
      var date                  = new Date();
      var timestamp_now         = date.toISOString();
      var url                   = new liteURL(window.location.href);
      var baseUrl               = url.origin;;
      var hostname              = url.hostname;
      var auto_domain           = hostname.substring(hostname.lastIndexOf('.', hostname.lastIndexOf('.') - 1) + 1);
      var auto_secure           = (url.protocol.includes('https')) ? true : false;
      var stringifiedAttributes = '';
      var cookie_data           = {};
      var data_json;
      var data_encoded;

      var defaults = {
        path:         '{{cookie_options.path}}',
        expires:      '{{cookie_options.expires}}',
        domain:       ('{{cookie_options.domain}}' === 'false') ? false : '{{cookie_options.domain}}',
        samesite:     '{{cookie_options.same_site}}',
        http_only:    ('{{cookie_options.http_only}}' === 'true'),
        secure:       ('{{cookie_options.secure}}' === 'false') ? false : '{{cookie_options.secure}}'
      };
      var settings = $.extend(defaults, options);

      // Failsafe: if 'None' is given for samesite in non-secure environments
      // -----------------------------------------------------------------------
      if (settings.samesite === 'None' && !settings.secure) {
        settings.samesite = 'Lax';
      }

      cookie_data.timestamp = timestamp_now;

      if (j1.existsCookie(settings.name)) {
        cookie_data   = j1.readCookie(settings.name);
        cookie_data   = j1.mergeData(cookie_data, settings.data);
        data_json     = JSON.stringify( cookie_data );
        data_encoded  = window.btoa(data_json);
      } else {
        cookie_data   = settings.data;
        data_json     = JSON.stringify(settings.data);
        data_encoded  = window.btoa(data_json);
      }

      // collect the cookie attributes
      // -----------------------------------------------------------------------
      stringifiedAttributes += '; ' + 'Path=' + settings.path;

      if (settings.expires > 0) {
        date.setTime(date.getTime() + (settings.expires * 24 * 60 * 60 * 1000));
        stringifiedAttributes += '; ' + 'Expires=' + date.toUTCString();
      }

      stringifiedAttributes += '; ' + 'SameSite=' + settings.samesite;

      // set domain used by cookies
      if (settings.domain) {
        if (settings.domain === 'auto') {
          stringifiedAttributes += '; ' + 'Domain=' + auto_domain;
        } else {
          stringifiedAttributes += '; ' + 'Domain=' + settings.domain;
        }
      }

      // set secure attribute
      if (settings.secure) {
        if (settings.secure === 'auto') {
          stringifiedAttributes += '; ' + 'Secure=' + auto_secure;
        } else {
          stringifiedAttributes += '; ' + 'Secure=' + settings.secure;
        }
      }

      // write the cookie
      // -----------------------------------------------------------------------
      document.cookie = settings.name + '=' + data_encoded + stringifiedAttributes;

      if (j1.existsCookie(settings.name)) {
        return cookie_data;
      } else {
        return false;
      }
    }, // END writeCookie

    // -------------------------------------------------------------------------
    // findCookie (Vanilla JS)
    // Search for cookies (by name) in the page header that matches a given
    // (name) string. A cookie name can be given as full name, like 'j1.user.state',
    // or as a partial like 'j1'
    // Returns all names found as an array.
    // -------------------------------------------------------------------------
    // See: https://stackoverflow.com/questions/52287989/javascript-cookie-remove-or-delete-with-regex-regular-expression
    // -------------------------------------------------------------------------
    findCookie: (name) => {
      var rCookie=[];
      document.cookie.replace(new RegExp(name + '[^= ]*', 'g'), function(a){ rCookie.push(a.trim()); });

      return rCookie;
    }, // END findCookie

    // -------------------------------------------------------------------------
    // removeCookie (Vanilla JS)
    // -------------------------------------------------------------------------
    removeCookie: (options /*name, [path, domain]*/) => {
      var url                   = new liteURL(window.location.href);
      var baseUrl               = url.origin;;
      var hostname              = url.hostname;
      var auto_domain           = hostname.substring(hostname.lastIndexOf('.', hostname.lastIndexOf('.') - 1) + 1);
      var auto_secure           = (url.protocol.includes('https')) ? true : false;
      var stringifiedAttributes = '';

      var defaults = {
        path:         '{{cookie_options.path}}',
        expires:      'Thu, 01 Jan 1970 00:00:00 UTC',                          // clear cookies by settting the expiry date in the PAST
        domain:       ('{{cookie_options.domain}}' === 'false') ? false : '{{cookie_options.domain}}',
        samesite:     '{{cookie_options.same_site}}',
        http_only:    ('{{cookie_options.http_only}}' === 'true'),
        secure:       ('{{cookie_options.secure}}' === 'false') ? false : '{{cookie_options.secure}}'
      };
      var settings  = $.extend(defaults, options);

      // collect the cookie attributes
      // -----------------------------------------------------------------------
      stringifiedAttributes += '; ' + 'Path=' + settings.path;
      stringifiedAttributes += '; ' + 'SameSite=' + settings.samesite;
      stringifiedAttributes += '; ' + 'Expires=' + settings.expires;

      // set domain used by cookies
      if (settings.domain) {
        if (settings.domain === 'auto') {
          stringifiedAttributes += '; ' + 'Domain=' + auto_domain;
        } else if (typeof settings.domain === 'string') {
          stringifiedAttributes += '; ' + 'Domain=' + settings.domain;
        }
      }

      // set secure attribute
      if (settings.secure) {
        if (settings.secure === 'auto') {
          stringifiedAttributes += '; ' + 'Secure=' + auto_secure;
        } else {
          stringifiedAttributes += '; ' + 'Secure=' + settings.secure;
        }
      }

      // clear|remove the cookie if exists
      // -----------------------------------------------------------------------
      if (j1.findCookie(settings.name)) {
        document.cookie = settings.name + '=;' + stringifiedAttributes;
        return true;
      } else {
        return false;
      }
    }, // END removeCookie

    // -------------------------------------------------------------------------
    // expireCookie (Vanilla JS)
    // Expires given cookies by name except cookies set to httpOnly. For all
    // cookies the expiry date is REMOVED. This results in cookies are set
    // to 'session' for the expiry date. All session cookies are deleted
    // automatically by the browser if the last session (browser tab|window)
    // is closed.
    // -------------------------------------------------------------------------
    // expireCookie() returns 'true' if cookie is set successfully
    // (to session), otherwise 'false' (e.g. NOT found)
    // -------------------------------------------------------------------------
    // NOTE:
    // See: https://stackoverflow.com/questions/179355/clearing-all-cookies-with-javascript
    //
    // NOTE:
    // There is NO way you could get a trace of Path, Domain and other
    // attributes of cookies as they are only read by browsers and NOT shown
    // to JavaScript. For that reason, attributes needs to be set explicitly
    // to already KNOWN values.
    //
    // -------------------------------------------------------------------------
    expireCookie: (options /*name [,path, samesite, secure]*/) => {
      var url                   = new liteURL(window.location.href);
      var baseUrl               = url.origin;;
      var hostname              = url.hostname;
      var auto_domain           = hostname.substring(hostname.lastIndexOf('.', hostname.lastIndexOf('.') - 1) + 1);
      var auto_secure           = (url.protocol.includes('https')) ? true : false;
      var stringifiedAttributes = '';

      var defaults = {
        path:         '{{cookie_options.path}}',
        expires:      '{{cookie_options.expires}}',
        domain:       ('{{cookie_options.domain}}' === 'false') ? false : '{{cookie_options.domain}}',
        samesite:     '{{cookie_options.same_site}}',
        http_only:    ('{{cookie_options.http_only}}' === 'true'),
        secure:       ('{{cookie_options.secure}}' === 'false') ? false : '{{cookie_options.secure}}'
      };
      var settings  = $.extend(defaults, options);

      // collect the cookie attributes
      // -----------------------------------------------------------------------
      stringifiedAttributes += '; ' + 'Path=' + settings.path;
      stringifiedAttributes += '; ' + 'SameSite=' + settings.samesite;

      // set domain used by cookies
      if (settings.domain) {
        if (settings.domain === 'auto') {
          stringifiedAttributes += '; ' + 'Domain=' + auto_domain;
        } else if (typeof settings.domain == 'string') {
          if (settings.domain !== 'false') {
            stringifiedAttributes += '; ' + 'Domain=' + settings.domain;
          }
        }
      }

      // set secure attribute
      if (settings.secure) {
        if (settings.secure === 'auto') {
          stringifiedAttributes += '; ' + 'Secure=' + auto_secure;
        } else {
          stringifiedAttributes += '; ' + 'Secure=' + settings.secure;
        }
      }

      var dc      = document.cookie;                                          // all cookies in page
      var end     = dc.length;                                                // default to end of the string
      var prefix  = settings.name + '=';                                      // search string for the cookie name given
      var begin   = dc.indexOf('; ' + prefix);
      var content = '';

      // collect the cookie content
      // -----------------------------------------------------------------------

      // found, and not in the first position
      if (begin !== -1) {
        // exclude the "; "
        begin += 2;
      } else {
        // see if cookie is in first position
        begin = dc.indexOf(prefix);
        // not found at all or found as a portion of another cookie name
        if (begin === -1 || begin !== 0 ) return false;
      }

      // if ";" is found somewhere after the prefix position then "end" is
      // that position, otherwise it defaults to the end of the string
      if (dc.indexOf(';', begin) !== -1) {
        end = dc.indexOf(';', begin);
      }

      // write the cookie content, expire to session
      // -----------------------------------------------------------------------
      content = decodeURI(dc.substring(begin + prefix.length, end) ).replace(/"/g, '');
      document.cookie = settings.name + '=' + content + stringifiedAttributes;

      return true;
    }, // END expireCookie

    // -------------------------------------------------------------------------
    // existsCookie (Vanilla JS)
    // returns true if a cookie of given name exists
    // -------------------------------------------------------------------------
    existsCookie: (name) => {
      var dc            = document.cookie;
      var prefix        = name + '=';
      var begin         = dc.indexOf('; ' + prefix);
      var end           = dc.length;                                            // default to end of the string
      var cookieExists  = false;
      var cookieContent = '';

      // collect the cookie content
      // -----------------------------------------------------------------------

      // found, and not in first position
      if (begin !== -1) {
        // exclude the "; "
        begin += 2;
      } else {
        //see if cookie is in first position
        begin = dc.indexOf(prefix);
        // not found at all or found as a portion of another cookie name
        if (begin === -1 || begin !== 0 ) return false;
      }

      // if ";" is found somewhere after the prefix position then "end" is
      // that position, otherwise it defaults to the end of the string
      if (dc.indexOf(';', begin) !== -1) {
        end = dc.indexOf(';', begin);
      }

      // check if the cookie exists
      // -----------------------------------------------------------------------
      cookieContent = decodeURI(dc.substring(begin + prefix.length, end) ).replace(/"/g, '');
      cookieExists  = cookieContent.length ? true : false;

      return cookieExists;
    }, // END existsCookie

    // -------------------------------------------------------------------------
    // Resolve MACROs
    //
    // See:
    //  https://stackoverflow.com/questions/5376431/wildcards-in-jquery-selectors
    //  https://stackoverflow.com/questions/16400072/jquery-each-only-affects-last-element
    //  https://dzone.com/articles/why-does-javascript-loop-only-use-last-value
    //  https://stackoverflow.com/questions/179713/how-to-change-the-href-for-a-hyperlink-using-jquery
    //  https://stackoverflow.com/questions/5223/length-of-a-javascript-object
    // -------------------------------------------------------------------------
    resolveMacros: (user_data) => {
      var logger = log4javascript.getLogger('j1.resolveMacros');

      var sidebarLoaded = setInterval(() => {
        if ($('#sidebar_mmenu').length) {
          if (Object.keys(user_data).length) {
            $('[id^=macro-]').each(function() {

              $('#macro-provider').each(function() {
                var $this = $(this);
                var $html = $this.html();
                $this.html($html.replace('??provider', user_data.provider));
                this.href = this.href.replace(/.*\/??provider-site-url/, user_data.provider_site_url);
              });
              $('#macro-user-name').each(function() {
                var $this = $(this);
                var $html = $this.html();
                $this.html($html.replace('??user-name', user_data.user_name));
                this.href = this.href.replace(/.*\/??provider_member_url/, user_data.provider_member_url);
              });
              $('#macro-provider-permissions').each(function() {
                var $this = $(this);
                var $html = $this.html();
                $this.html($html.replace('??provider-permissions', user_data.provider_permissions));
                this.href = this.href.replace(/.*\/??provider_member_url/, user_data.provider_member_url);
              });
              $('#macro-provider-membership').each(function() {
                var $this = $(this);
                var $html = $this.html();
                $this.html($html.replace('??provider-membership', user_data.provider_membership));
                this.href = this.href.replace(/.*\/??provider_member_url/, user_data.provider_member_url);
              });
              $('#macro-cookie-state').each(function() {
                var $this = $(this);
                var $html = $this.html();
                $this.html($html.replace('??cookie-state', user_data.cookies_accepted));
                this.href = this.href.replace(/.*\/??provider_privacy_url/, user_data.provider_privacy_url);
              });
              $('#macro-theme-name').each(function() {
                var $this = $(this);
                var $html = $this.html();
                $this.html($html.replace('??theme-name', user_data.theme_name));
              });
              $('#macro-theme-author').each(function() {
                var $this = $(this);
                var $html = $this.html();
                $this.html($html.replace('??theme-author', user_data.theme_author));
                this.href = this.href.replace(/.*\/??theme-author-url/, user_data.theme_author_url);
              });
              $('#macro-theme-version').each(function() {
                var $this = $(this);
                var $html = $this.html();
                $this.html($html.replace('??theme-version', user_data.template_version));
              });

            });
            logger.debug('\n' + 'met dependencies for: sidebarLoaded');
            clearInterval(sidebarLoaded);
            return true;
          } else {
            logger.error('\n' + 'no user data provided');
            clearInterval(sidebarLoaded);
            return false;
          }
        }
      }, 10);
    }, // END resolveMacros

    // -------------------------------------------------------------------------
    // Update MACROs
    // Update the values, NOT the placeholders
    // -------------------------------------------------------------------------
    updateMacros: (user_data) => {
      var logger = log4javascript.getLogger('j1.updateMacros');

      var sidebarLoaded = setInterval(() => {
        if ($('#sidebar_mmenu').length) {

          if (Object.keys(user_data).length) {
            $('[id^=macro-]').each(function() {

              $('#macro-provider').each(function() {
                var $this = $(this);
                var $html = $this.html();
                $this.html($html.replace(/Provider:.*/, 'Provider: ' + user_data.provider));
                $('#macro-provider').attr('href', user_data.provider_site_url);
              });
              $('#macro-user-name').each(function() {
                var $this = $(this);
                var $html = $this.html();
                $this.html($html.replace(/User:.*/, 'User: ' + user_data.user_name));
                $('#macro-user-name').attr('href', user_data.provider_member_url);
              });
              $('#macro-provider-permissions').each(function() {
                var $this = $(this);
                var $html = $this.html();
                // $this.html($html.replace(/public|protected|private|blocked/, user_data.provider_permissions));
                $this.html($html.replace(/public.*|protected.*|private.*|blocked.*/, user_data.provider_permissions));
                $('#macro-provider-permissions').attr('href', user_data.provider_member_url);
              });
              $('#macro-provider-membership').each(function() {
                var $this = $(this);
                var $html = $this.html();
                $this.html($html.replace(/guest|member/, user_data.provider_membership));
                $('#macro-provider-membership').attr('href', user_data.provider_member_url);
              });
              $('#macro-cookie-state').each(function() {
                var $this = $(this);
                var $html = $this.html();
                $this.html($html.replace(/accepted|declined|pending/, user_data.cookies_accepted));
                $('#macro-cookie-state').attr('href', user_data.provider_privacy_url);
              });

            });
            logger.debug('\n' + 'met dependencies for: sidebarLoaded');
            clearInterval(sidebarLoaded);
            return true;
          } else {
            logger.error('\n' + 'no user data provided');
            clearInterval(sidebarLoaded);
            return false;
          }
        }
      }, 10);
    }, // END updateMacros

    // -------------------------------------------------------------------------
    // logger
    // Log a message
    // -------------------------------------------------------------------------
    logger: (logger, level, message) => {
      var logger = log4javascript.getLogger(logger);

      logger[level](message);

      return true;
    }, // END logger

    // -------------------------------------------------------------------------
    // getStyleValue:
    // Returns the value of a style from a css class definition
    // example: j1.getStyleValue('uno-primary', 'background-color')
    getStyleValue: (className, style) => {
      var elementId = 'test-' + className,
        testElement = document.getElementById(elementId),
        val;

      if (testElement === null) {
        testElement = document.createElement('div');
        testElement.className = className;
        testElement.style.display = 'none';
        document.body.appendChild(testElement);
      }
      val = $(testElement).css(style);
      document.body.removeChild(testElement);

      return val;
    }, // END getStyleValue

    // -------------------------------------------------------------------------
    // getStyleSheetLoaded:
    // NOTE:
    // EXAMPLE: getStyleSheetLoaded('bootstrap');
    // -------------------------------------------------------------------------
    getStyleSheetLoaded: (styleSheet) => {
      var sheets = document.styleSheets, stylesheet = sheets[(sheets.length - 1)];

      // find CSS file 'styleSheetName' in document
      for(var i in document.styleSheets) {
        if(sheets[i].href && sheets[i].href.indexOf(styleSheet) > -1) {
          return true;;
        }
      }
    }, // END getStyleSheetLoaded

    // -------------------------------------------------------------------------
    //  Returns the names of cookies used for J1 Theme
    // -------------------------------------------------------------------------
    getCookieNames: () => {
      return cookie_names;
    }, // END getCookieNames

    // -------------------------------------------------------------------------
    // Set dynamic styles
    // -------------------------------------------------------------------------
    // setCss: function () {
    //   var logger        = log4javascript.getLogger('j1.setCss');
    //   var bg_primary    = j1.getStyleValue('bg-primary', 'background-color');
    //   var bg_secondary  = j1.getStyleValue('bg-secondary', 'background-color');
    //
    //   logger.info('\n' + 'set color scheme for selected theme');
    //
    //   // globals
    //   // -----------------------------------------------------------------------
    //   $('head').append('<style>.g-bg-primary { background-color: ' +bg_primary+ ' !important; }</style>');
    //
    //   // mdi icons
    //   // -----------------------------------------------------------------------
    //   $('head').append('<style>.iconify-md-bg-primary { color: ' +bg_primary+ ' !important; }</style>');
    //   $('head').append('<style>.fa-md-bg-primary { color: ' +bg_primary+ ' !important; }</style>');
    //   $('head').append('<style>.fas-md-bg-primary { color: ' +bg_primary+ ' !important; }</style>');
    //   $('head').append('<style>.mdi-md-bg-primary { color: ' +bg_primary+ ' !important; }</style>');
    //
    //   // asciidoc
    //   // -----------------------------------------------------------------------
    //   var admonitionblock_note_color      = bg_primary;
    //   var admonitionblock_tip_color       = j1.getStyleValue('btn-success', 'background-color');
    //   var admonitionblock_important_color = j1.getStyleValue('btn-info', 'background-color');
    //   var admonitionblock_warning_color   = j1.getStyleValue('icon-warning', 'color');
    //   var admonitionblock_caution_color   = j1.getStyleValue('btn-danger', 'background-color');
    //
    //   $('head').append('<style>.icon-note { color: ' +admonitionblock_note_color+ ' !important; }</style>');
    //   $('head').append('<style>.icon-tip { color: ' +admonitionblock_tip_color+ ' !important; }</style>');
    //   $('head').append('<style>.icon-important { color: ' +admonitionblock_important_color+ ' !important; }</style>');
    //   $('head').append('<style>.icon-warning { color: ' +admonitionblock_warning_color+ ' !important; }</style>');
    //   $('head').append('<style>.icon-caution { color: ' +admonitionblock_caution_color+ ' !important; }</style>');
    //
    //   // bs base styles (2020-09-20: diabled. Taken for BS CSS code)
    //   // -----------------------------------------------------------------------
    //   // $('head').append('<style>code { color: ' +bg_secondary+ ' !important; }</style>');
    //
    //   // bs tool tips
    //   // -----------------------------------------------------------------------
    //   // $('head').append('<style>.tooltip-inner { background-color: ' +bg_primary+ ' !important; }</style>');
    //   // $('head').append('<style>.bs-tooltip-top .tooltip-arrow::before { border-top-color: ' +bg_primary+ ' !important; }</style>');
    //   // $('head').append('<style>.bs-tooltip-end .tooltip-arrow::before { border-right-color: ' +bg_primary+ ' !important; }</style>');
    //   // $('head').append('<style>.bs-tooltip-bottom .tooltip-arrow::before { border-bottom-color: ' +bg_primary+ ' !important; }</style>');
    //   // $('head').append('<style>.bs-tooltip-start .tooltip-arrow::before { border-left-color: ' +bg_primary+ ' !important; }</style>');
    //
    //   // asciidoc results viewer
    //   // -----------------------------------------------------------------------
    //   $('head').append('<style>.btn-viewer:hover { background-color: ' +bg_primary+ ' !important; }</style>');
    //
    //   // extended modals
    //   // -----------------------------------------------------------------------
    //   // var tabs_pills_link_color_active    = j1.setColorData('md_blue');         // j1.getStyleValue('btn-info', 'background-color');
    //   // var tabs_pills_link_color_hover     = j1.setColorData('md_gray_300');     // j1.getStyleValue('btn-secondary', 'background-color');
    //
    //   // var tabs_pills_link_color_active    = 'md-blue';
    //   // var tabs_pills_link_color_hover     = 'md-gray-300';
    //
    //   // nav module
    //   // -----------------------------------------------------------------------
    //   // $('head').append('<style>.nav-link:hover { background-color: ' +tabs_pills_link_color_hover+ ' !important; }</style>');
    //   // $('head').append('<style>.nav-link.active { background-color: ' +tabs_pills_link_color_active+ ' !important; }</style>');
    //
    //   return true;
    // },

    // -------------------------------------------------------------------------
    // setXhrDataState()
    // Set the final (loading) state of an element (partial) loaded via Xhr
    // -------------------------------------------------------------------------
    setXhrDataState: (obj, stat) => {
      j1.xhrDataState[obj] = stat;
    }, // END setXhrDataState

    // -------------------------------------------------------------------------
    // getXhrDataState()
    // Returns the final (loading) state of an element (partial) loaded via Xhr
    // -------------------------------------------------------------------------
    getXhrDataState: (obj) => {
      return j1.xhrDataState[obj];
    }, // END mergeData

    // -------------------------------------------------------------------------
    // setXhrDomState()
    // Set the state of an element loaded via Xhr that is
    // successfully added to the DOM
    // -------------------------------------------------------------------------
    setXhrDomState: (obj, stat) => {
      j1.xhrDOMState[obj] = stat;
    }, // END getXhrDataState

    // -------------------------------------------------------------------------
    // getXhrDataState()
    // Returns the state of an element loaded via Xhr that is
    // successfully added to the DOM
    // -------------------------------------------------------------------------
    getXhrDOMState: (obj) => {
      return j1.xhrDOMState[obj];
    }, // END getXhrDOMState

    // -------------------------------------------------------------------------
    // setMode()
    // Set the current mode of the site (web|app)
    // -------------------------------------------------------------------------
    setMode: (mod) => {
      mode = mod;
    }, // END setMode

    // -------------------------------------------------------------------------
    // getMode()
    // Returns the current mode of the site (web|app)
    // -------------------------------------------------------------------------
    getMode: () => {
      return mode;
    }, // END getMode

    // -------------------------------------------------------------------------
    // checkUserAgent()
    // Returns the name (UA) of the web browser
    // -------------------------------------------------------------------------
    checkUserAgent: () => {
      if (navigator.userAgent.search(ua_name) >= 0) {
        return true;
      } else {
        return false;
      }
    }, // END checkUserAgent

    // -------------------------------------------------------------------------
    // generateId()
    // Generate a unique (thread) id used by the logger
    // -------------------------------------------------------------------------
    generateId: (length) => {
     var result           = '';
     var characters       = 'abcdefghijklmnopqrstuvwxyz0123456789';
     var charactersLength = characters.length;

     for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
     }

     return result;
    }, // END generateId

    // -------------------------------------------------------------------------
    // getTrue()
    // Returns always true (for testing purposes)
    // -------------------------------------------------------------------------
    getTrue: () => {
      return true;
    }, // END getTrue

    // -------------------------------------------------------------------------
    // getFalse()
    // Returns always false (for testing purposes)
    // -------------------------------------------------------------------------
    getFalse: () => {
      return false;
    }, // END getFalse

    // -------------------------------------------------------------------------
    // goHome()
    // Redirect current page to the browser homepage
    // -------------------------------------------------------------------------
    goHome: () => {
      // most browsers
      if (typeof window.home == 'function') {
        window.home();
      } else if (document.all) {
        // for IE
        window.location.href = 'about:home';
      } else {
        window.location.href = 'about:blank';
      }
    }, // END goHome

    // -------------------------------------------------------------------------
    // goBack()
    // Redirect current page to last visited page (referrer)
    // -------------------------------------------------------------------------
    goBack: () => {
      // where visitor has come from
      window.location.href = document.referrer;
    }, // END goBack

    // -------------------------------------------------------------------------
    // scrollToAnchor()
    // Scroll to an anchor in current page if given in URL
    // TODO: Find a better solution for 'dynamic' pages to detect
    // the content if fully loaded instead using a timeout
    // -------------------------------------------------------------------------
    scrollToAnchor: () => {
      var logger = log4javascript.getLogger('j1.scrollToAnchor');
      var scrollOffset;

      var dependencies_met_page_displayed = setInterval (() => {
        var pageState      = $('#no_flicker').css("display");
        var pageVisible    = (pageState === 'block') ? true: false;
        var j1CoreFinished = (j1.getState() === 'finished') ? true : false;
        var pageMonitor    = (j1['pageMonitor'].pageType !== 'unknown') ? true : false;

        if (j1CoreFinished && pageVisible && pageMonitor) {

          // TODO: Check why a timeout is required to run the
          // smmoth scroller (j1.scrollTo)
          //
          if (j1['pageMonitor'].pageType === 'static') {
            // page type static
            setTimeout(() => {
              var headingUrl              = new URL(window.location.href);
              var headingHash             = headingUrl.hash;
              var headingId               = headingHash.replace(/#/g, '');
              var scrollOffsetCorrection  = -93;
              var scrollDuration          = 300;

              logger.debug('\n' + 'scrollToAnchor: scroll page of type: static');

              // scroll if headingId
              //
              if (headingHash === '') {
                logger.debug('\n' + 'scrollToAnchor: top position detected');
              } else {
                logger.debug('\n' + 'scrollToAnchor: scroll to headline by id: ' + headingHash);
                j1.api.scrollSmooth.scroll(headingHash, {
                  duration:   scrollDuration,
                  offset:     scrollOffsetCorrection,
                  callback:   false
                });
              }
            }, {{template_config.timeoutScrollStaticPages}});

            clearInterval(dependencies_met_page_displayed);
          } else if (j1['pageMonitor'].pageType === 'dynamic') {
            // page type dynamic
            setTimeout(() => {
              var headingArray           = j1.api.parseHeadings();            // collect all headings in page
              var headingUrl              = new URL(window.location.href);
              var headingHash             = headingUrl.hash;
              var headingId               = headingHash.replace(/#/g, '');
              var scrollTop               = 0
              var scrollOffset            = 0;
              var headlineNo              = 0;
              var countOnce               = true;
              var scrollOffset            = 0;
              var scrollOffsetCorrection  = 0;
//
//            var scrollOffsetCorrection  = -93;
//              var scrollDuration          = 300;

              logger.debug('\n' + 'scrollToAnchor: scroll page of type: dynamic');

              // collect top position for the active headline
              //
              if (headingArray !== null) {
                headingArray.forEach ((heading, index) => {

                    if (heading.offsetTop !== undefined && heading.id == headingId && countOnce) {
                      scrollOffset            = heading.offsetTop;
                      headlineNo              = ++index;

                      // jadams, 2023-10-27: !!! TEST !!!
                      // calculate scrollOffsetCorrection based on AVERAGE
                      // height of (number of) headlines
                      //
                      if (headlineNo === 1) {
                        scrollOffsetCorrection  = scrollOffset - (headlineNo * 89);
                      } else if (headlineNo <= 3) {
                        scrollOffsetCorrection = scrollOffset - (headlineNo * 30);
                      } else if (headlineNo > 3 && headlineNo <= 6) {
                        scrollOffsetCorrection = scrollOffset - (headlineNo * 18);
                      } else if (headlineNo > 6 && headlineNo <= 9) {
                        scrollOffsetCorrection = scrollOffset - (headlineNo * 14);
                      } else if (headlineNo > 9 && headlineNo <= 13) {
                        scrollOffsetCorrection = scrollOffset - (headlineNo * 34);
                      } else if (headlineNo > 13 && headlineNo <= 16) {
                        scrollOffsetCorrection = scrollOffset - (headlineNo * 22);
                      } else if (headlineNo > 16 && headlineNo <= 20) {
                        scrollOffsetCorrection = scrollOffset - (headlineNo * 26);
                      } else if (headlineNo > 20) {
                        scrollOffsetCorrection = scrollOffset - (headlineNo * 23);
                      }

                      countOnce = false;
                      scrollTop = Math.round(scrollOffsetCorrection);
                    } //  END if heading.offsetTop|heading.id|countOnce
                  } // END function(heading, index)
                ); // END forEach headingArray
              } // END if headingArray !== null

              // scroll to headline's top position
              //
              if (headingHash === '') {
                headingHash = '#';
                logger.debug('\n' + 'scrollToAnchor: top position detected');
              } else {
                logger.debug('\n' + 'scrollToAnchor: headline|no: ' + headingHash + '|' + headlineNo);

                // build-in scroller
                //
                window.scroll ({
                	top:       scrollTop,
                	left:      0,
                	behavior: 'smooth'
                });
              } // END if headingHash

            }, {{template_config.timeoutScrollDynamicPages}});

            clearInterval(dependencies_met_page_displayed);
          } else {
            // page type unknown (failsave fallback)
            setTimeout(() => {
              logger.debug('\n' + 'scrollToAnchor: scroll page of type: unknown');

              scrollOffset = scrollOffsetCorrection - scrollOffsetBase;
              j1.scrollTo(scrollOffset);
            }, {{template_config.page_on_load_timeout}} );

            clearInterval(dependencies_met_page_displayed);
          } // END if|else j1['pageMonitor'].pageType == 'dynamic'


        } // END if j1['pageMonitor'].pageType
      }, 10);
    }, // END scrollToAnchor

    // -------------------------------------------------------------------------
    // stringToBoolean()
    // convert a string to boolean
    // -------------------------------------------------------------------------
    stringToBoolean: (string) => {
      switch(string.toLowerCase().trim()) {
        case "true":
        case "yes":
        case "1":
          return true;
        case "false":
        case "no":
        case "0":
        case null:
          return false;
        default:
          return Boolean(string);
      }
    }, // END stringToBoolean

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
    registerLazyLoadCss: () => {

      console.log('register CSS files for lazy loading');

      // load MDI Light CSS
      //
      j1.lazyCss().observe({
        'src':        '/assets/theme/j1/core/css/icon-fonts/mdil.min.css',
        'selector':   '.mdil',
        'rootMargin': '150px 0px'
      });

      // load MDI Regular CSS
      //
      j1.lazyCss().observe({
        'src':        '/assets/theme/j1/core/css/icon-fonts/mdi.min.css',
        'selector':   '.mdi',
        'rootMargin': '150px 0px'
      });

      // load FA CSS
      //
      j1.lazyCss().observe({
        'src':        '/assets/theme/j1/core/css/icon-fonts/fontawesome.min.css',
        'selector':   '.fa',
        'rootMargin': '150px 0px'
      });

      // load rTable CSS
      //
      j1.lazyCss().observe({
        'src':        '/assets/theme/j1/modules/rtable/css/theme/uno/rtable.min.css',
        'selector':   '.rtable',
        'rootMargin': '150px 0px'
      });

      // load CountryFlags CSS
      //
      j1.lazyCss().observe({
        'src':        '/assets/theme/j1/core/country-flags/css/theme/uno.min.css',
        'selector':   '.flag-icon',
        'rootMargin': '150px 0px'
      });

    }, // END registerLazyLoadCss

    // -------------------------------------------------------------------------
    // registerMonitors()
    //
    // -------------------------------------------------------------------------
    registerMonitors: () => {
      const development = ('{{environment}}'.includes('prod')) ? false : true;
      var cumulated_cls = 0;
      var cumulated_lcp = 0;
      var cls;
      var lcp;

      {% comment %} generate code for performance monitor if 'enabled'
      ------------------------------------------------------------------------ {% endcomment %}
      {% if template_config.monitor.performance_observer %}

      // PerformanceObserver to monitor the 'LCP' of a page load
      // see: https://developer.mozilla.org/en-US/docs/Web/API/LargestContentfulPaint
      //
      const performanceObserverLCP = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();

        // logger API used for deveöopment only
        //
        if (development) {
          var logger = log4javascript.getLogger('j1.PerformanceObserver');
        }

        // Use the latest LCP candidate
        const lastEntry   = entries[entries.length - 1];
        var lastEntryText = JSON.stringify(lastEntry, null, 2);

        cumulated_lcp  += lastEntry.renderTime;
        var lcp_full    = cumulated_lcp/1000;
        lcp             = lcp_full.toFixed(3);

        var url         = lastEntry.url;
        var pathname    = url.replace( /^[a-zA-Z]{3,5}\:\/{2}[a-zA-Z0-9_.:-]+\//, '' );

        if (development && lastEntry.url !== '') {
          logger.debug('\n' + 'Largest Contentful Paint (LCP), url:', pathname);
        } else {
          console.debug(`Largest Contentful Paint (LCP), url: ${pathname}`);
        }

        if (development) {
          if (lcp > 2.5) {
            logger.warn('\n' + 'Largest Contentful Paint (LCP), cumulated:', lcp);
          } else {
            logger.info('\n' + 'Largest Contentful Paint (LCP), cumulated:', lcp);
          }
        } else {
          if (lcp > 2.5) {
            console.warn(`Largest Contentful Paint (LCP), cumulated: ${lcp}`);
          } else {
            console.debug(`Largest Contentful Paint (LCP), cumulated: ${lcp}`);
          }
        }

      }); // END performanceObserverLCP

      // PerformanceObserver to monitor the 'CLS' of a page load
      //
      const performanceObserverCLS = new PerformanceObserver(entryList => {
        var entries = entryList.getEntries() || [];

        // logger API used for deveöopment only
        //
        if (development) {
          var logger = log4javascript.getLogger('j1.PerformanceObserver');
        }

        entries.forEach ((entry) => {

          if (entry.sources) {

            // omit entries likely caused by user input
            if (!entry.hadRecentInput) {
              // cumulate values
              cumulated_cls += entry.value;
              cls            = cumulated_cls.toFixed(3);
            }

            for (const {node, currentRect, previousRect} of entry.sources) {
              var hasProperty = node.hasOwnProperty('firstElementChild');
              if (hasProperty == null) {
                hasProperty = false;
              }

              if (hasProperty) {
                var id = '';
                try {
                  id = node.firstElementChild.id;
                }
                catch(err) {
                  id = 'missing';
                }

                if (development && id !== 'missing' && id !== '' && cls > 0.01) {
                  if (cls > 0.1) {
                    logger.warn('\n' + 'Cumulative Layout Shift (CLS), entry id: ', id);
                    logger.warn('\n' + 'Cumulative Layout Shift (CLS): ', cls);
                  } else {
                    logger.info('\n' + 'Cumulative Layout Shift (CLS), entry id: ', id);
                    logger.info('\n' + 'Cumulative Layout Shift (CLS): ', cls);
                  }
                }
              } // END if typeof
            } // END for
          } // END if  entry.sources

        }); // END forEach entry

      }); // END performanceObserverCLS

      {% endif %}

      // ResizeObserver to monitor the changes on page height (dynamic pages)
      // see: https://stackoverflow.com/questions/14866775/detect-document-height-change
      //
      const resizeObserver = new ResizeObserver(entries => {
//      var scrollOffsetCorrection  = scrollerOptions.smoothscroll.offsetCorrection;
        const body                  = document.body,
              html                  = document.documentElement,
              scrollOffset          = scrollOffsetCorrection;

        // logger API used for deveöopment only
        //
        if (development) {
          var logger = log4javascript.getLogger('j1.ResizeObserver');
        }

        // get the page height from the DOM
        //
        var documentHeight = Math.max (
          body.scrollHeight,
          body.offsetHeight,
          html.clientHeight,
          html.scrollHeight,
          html.offsetHeight
        );

        if (j1['pageMonitor'] !== undefined && j1['pageMonitor'].eventNo !== undefined) {
          j1['pageMonitor'].eventNo += 1;
        }

        // skip first Observer event
        //
        if (j1['pageMonitor'] !== undefined && j1['pageMonitor'].eventNo !== undefined && j1['pageMonitor'].eventNo === 2) {
          // Set initial data from second event
          //
          j1['pageMonitor'].pageBaseHeight      = documentHeight;
          j1['pageMonitor'].currentPageHeight   = document.body.scrollHeight;
          j1['pageMonitor'].previousPageHeight  = document.body.scrollHeight;
          j1['pageMonitor'].previousGrowthRatio = 0.00;

          pageBaseHeight      = documentHeight;
          previousGrowthRatio = 100;
          growthRatio         = 0.00;

        } else {
          // collect 'pageHeight' from 'entries'
          //
          previousGrowthRatio = document.body.scrollHeight / pageBaseHeight * 100;
          growthRatio         = document.body.scrollHeight / pageBaseHeight * 100;

          if (j1['pageMonitor'] !== undefined) {
            for (const entry of entries) {
              pageBaseHeight = documentHeight;
              if (pageBaseHeight > 0) {
                // get the page height (rounded to int) from observer
                //
                pageHeight = Math.round(entry.contentRect.height);
                j1['pageMonitor'].currentPageHeight = pageHeight;

                // total growth ratio
                //
                pageGrowthRatio = pageHeight / pageBaseHeight * 100;
//              pageGrowthRatio = pageGrowthRatio.toFixed(2);

                j1['pageMonitor'].currentGrowthRatio = pageGrowthRatio;

//              growthRatio = ((pageGrowthRatio / previousGrowthRatio) - 1) * 100;
//                growthRatio = growthRatio.toFixed(2);
                if (growthRatio !== undefined && growthRatio > 0) {
                  growthRatio = growthRatio.toFixed(2);
                } else {
                  growthRatio = 0.00;
                }
                j1['pageMonitor'].growthRatio = growthRatio;
              }
            } // END for entries
          } else {
            pageBaseHeight      = document.body.scrollHeight;
            previousGrowthRatio = 100;
            growthRatio         = 0.00;
          } // END if j1['pageMonitor'] undefined


          if (j1['pageMonitor'] !== undefined) {
            // detect the 'page type'
            //
//          if (growthRatio >= 5) {
            if (growthRatio > 100) {
              j1['pageMonitor'].pageType = 'dynamic';

              if (development) {
                logger.debug('\n' + 'growthRatio: ' + j1['pageMonitor'].growthRatio + '%');
                logger.debug('\n' + 'page detected as: dynamic');
              }
            } else {
              // set the page type to 'static' if low growth detected
              //
              if (typeof j1['pageMonitor'].growthRatio != 'undefined' && j1['pageMonitor'].growthRatio == 0) {
                j1['pageMonitor'].pageType = 'static';
                if (development) {
                  logger.debug('\n' + 'growthRatio: ' + j1['pageMonitor'].growthRatio + '%');
                  logger.debug('\n' + 'page detected as: static');
                }
              }
            } // END if growthRatio
          } // END if j1['pageMonitor'] undefined

        } // END if j1['pageMonitor']

      }); // END resizeObserver

      // -----------------------------------------------------------------------
      // run all observers for page monitoring
      // -----------------------------------------------------------------------

      {% comment %} generate initializers for performance monitoring if 'enabled'
      ------------------------------------------------------------------------ {% endcomment %}
      {% if template_config.monitor.performance_observer %}
        // monitor 'LCP'
        //
        performanceObserverLCP.observe({
           type: 'largest-contentful-paint',
           buffered: true
        });

        // monitor 'CLS'
        //
        performanceObserverCLS.observe({
           type: 'layout-shift',
           buffered: true
        });

      {% endif %}

      // jadams, 2023-10-26: delay untion STATIC portion of a page is loaded
      //
      setTimeout(() => {
        resizeObserver.observe(
          document.querySelector('body')
        );
      }, 500);

      // initialize event handler for window/history/back on <ESC>
      //
      window.onkeyup = function (event) {
        if (event.keyCode == 27) window.history.back();
      };

      $("a[href*='#']:not([href='#'])").click(function() {
        if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
        var target = $(this.hash);
        target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
        if (target.length) {
          var offset                  = target.offset().top + scrollOffsetCorrection;
          $('html,body').animate({
            scrollTop: offset
          }, 1000);
          return false;
        }
      }
     });

    }, // END registerMonitors

    // -------------------------------------------------------------------------
    // int2float()
    // convert an integer to float using given precision (default: 2 decimals)
    // -------------------------------------------------------------------------
    int2float: (number, precision = 2) => {
      return number.toFixed(precision);
    },

    // -------------------------------------------------------------------------
    // getTimeLeft()
    // calulates the time left
    // -------------------------------------------------------------------------
    getTimeLeft: (endDate) => {
      // Get the current date and time
      const now = new Date();

      // Get the milliseconds of both dates
      const endTime     = endDate.getTime();
      const currentTime = now.getTime();

      // Calculate the difference in milliseconds
      const difference  = endTime - currentTime;

      // Check if the end date has passed (difference is negative)
      if (difference < 0) {
        return 'Time has passed!';
      }

      // Calculate remaining days using milliseconds in a day
      const daysLeft = Math.floor(difference / (1000 * 60 * 60 * 24));

      // Calculate remaining hours using milliseconds in an hour
      const hoursLeft = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

      // Calculate remaining minutes using milliseconds in a minute
      const minutesLeft = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

      // Calculate remaining seconds using milliseconds in a second
      const secondsLeft = Math.floor((difference % (1000 * 60)) / 1000);

      // Return a formatted string showing remaining time
      return `${daysLeft} days, ${hoursLeft} hours, ${minutesLeft} minutes, ${secondsLeft} seconds left`;

    }, // END getTimeLeft

    // -------------------------------------------------------------------------
    // getMessage()
    // get a log message from the log message catalog object
    // -------------------------------------------------------------------------
    getMessage: (level, message, property) => {
      var message = j1.messages[level][message]['message'][property];

      return message;
    }, // END getMessage

    // -------------------------------------------------------------------------
    // sendMessage()
    // -------------------------------------------------------------------------
    sendMessage: (sender, receiver, message) => {
      var logger        = log4javascript.getLogger('j1.sendMessage');
      // var json_message  = JSON.stringify(message, undefined, 2);             // multiline
      var json_message  = JSON.stringify(message);

      if (receiver === 'j1') {
        logText = '\n' + 'send message from ' + sender + ' to' + receiver + ': ' + json_message;
        logger.debug(logText);
        executeFunctionByName('j1' + '.messageHandler', window, sender, message);
      } else {
        logText = '\n' + 'send message from ' + sender + ' to ' + receiver + ': ' + json_message;
        logger.debug(logText);
        //executeFunctionByName('j1.' + receiver + '.messageHandler', window, sender, message)
        executeFunctionByName(receiver + '.messageHandler', window, sender, message);
      }
    }, // END sendMessage

    // -------------------------------------------------------------------------
    // messageHandler()
    // manage messages send from other J1 modules
    // -------------------------------------------------------------------------
    messageHandler: (sender, message) => {
      // var json_message  = JSON.stringify(message, undefined, 2);             // multiline
      var json_message  = JSON.stringify(message);

      logText = '\n' + 'received message from ' + sender + ': ' + json_message;
      logger.debug(logText);

      // -----------------------------------------------------------------------
      //  process commands|actions
      // -----------------------------------------------------------------------
      if ( message.type === 'command' && message.action === 'module_initialized' ) {
        _this.setState('finished');
        logger.info('\n' + message.text);
      }

      //
      // place handling of other command|action here
      //

      return true;
    }, // END messageHandler

    // -------------------------------------------------------------------------
    // setState()
    // det the current (processing) state of the module
    // -------------------------------------------------------------------------
    setState: (stat) => {
      state = stat;
    }, // END setState

    // -------------------------------------------------------------------------
    // getState()
    // returns the current (processing) state of the module
    // -------------------------------------------------------------------------
    getState: () => {
      return state;
    }, // END getState

    isValidCaption: (caption) => {
      return (typeof caption !== 'undefined' && caption.length > 0);
    },

    // @returns {jQuery} the image in the given entry
    //
    imgFromEntry: ($entry) => {
      var $img = $entry.find(this.settings.imgSelector);
      return $img.length === 0 ? null : $img;
    },

    addCaption: ($entry) => {
      var $image = this.imgFromEntry($entry);
      if ($image !== null && this.settings.captions) {
        var $imgCaption = this.captionFromEntry($entry);

        // create it if it doesn't exists
        if ($imgCaption === null) {
          var caption = $image.attr('alt');
          if (!this.isValidCaption(caption)) caption = $entry.attr('title');
          if (this.isValidCaption(caption)) { // Create only we found something
            $imgCaption = $('<div class="jg-caption">' + caption + '</div>');
            $entry.append($imgCaption);
            $entry.data('jg.createdCaption', true);
          }
        }

        // Create events
        //
        if ($imgCaption !== null) {
          if (!this.settings.cssAnimation) $imgCaption.stop().fadeTo(0, this.settings.captionSettings.nonVisibleOpacity);
          this.addCaptionEventsHandlers($entry);
        }
      } else {
        this.removeCaptionEventsHandlers($entry);
      }
    },

    // event handlers of the entry for the caption
    //
    addCaptionEventsHandlers: ($entry) => {
      var captionMouseEvents = $entry.data('jg.captionMouseEvents');
      if (typeof captionMouseEvents === 'undefined') {
        captionMouseEvents = {
          mouseenter: $.proxy(this.onEntryMouseEnterForCaption, this),
          mouseleave: $.proxy(this.onEntryMouseLeaveForCaption, this)
        };
        $entry.on('mouseenter', undefined, undefined, captionMouseEvents.mouseenter);
        $entry.on('mouseleave', undefined, undefined, captionMouseEvents.mouseleave);
        $entry.data('jg.captionMouseEvents', captionMouseEvents);
      }
    },

    // Remove event handlers of the entry for the caption
    //
    removeCaptionEventsHandlers: ($entry) => {
      var captionMouseEvents = $entry.data('jg.captionMouseEvents');
      if (typeof captionMouseEvents !== 'undefined') {
        $entry.off('mouseenter', undefined, captionMouseEvents.mouseenter);
        $entry.off('mouseleave', undefined, captionMouseEvents.mouseleave);
        $entry.removeData('jg.captionMouseEvents');
      }
    }

  }; // END main (return)
})(j1, window);

{%- endcapture -%}

{%- if production -%}
  {{ cache|minifyJS }}
{%- else -%}
  {{ cache|strip_empty_lines }}
{%- endif -%}

{%- assign cache = false -%}
