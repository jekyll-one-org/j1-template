---
regenerate:                             true
---

{% capture cache %}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/core/js/j1.js
 # Liquid template to initialize J1 Template Core functions
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
{% endcomment %}

{% comment %} Liquid procedures
------------------------------------------------------------------------------- {% endcomment %}

{% comment %} Set global settings
-------------------------------------------------------------------------------- {% endcomment %}
{% assign environment             = site.environment %}
{% assign template_version        = site.version %}

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
{% assign banner_config_defaults    = blocks.defaults.banner.defaults %}
{% assign banner_config_settings    = blocks.banner.settings %}
{% assign panel_config_defaults     = blocks.defaults.panel.defaults %}
{% assign panel_config_settings     = blocks.panel.settings %}
{% assign footer_config_defaults    = blocks.defaults.footer.defaults %}
{% assign toccer_defaults           = modules.defaults.toccer.defaults %}

{% assign themer_defaults           = modules.defaults.themer.defaults %}
{% assign themer_settings           = modules.themer.settings %}

{% assign tracking_enabled          = template_config.analytics.enabled %}
{% assign tracking_id               = template_config.analytics.google.tracking_id %}

{% assign authentication_defaults   = modules.defaults.authentication.defaults %}
{% assign authentication_settings   = modules.authentication.settings %}

{% comment %} Set config options
-------------------------------------------------------------------------------- {% endcomment %}
{% assign toccer_options            = toccer_defaults | merge: toccer_settings %}
{% assign themer_options            = themer_defaults| merge: themer_settings %}

{% assign authentication_options    = authentication_defaults | merge: authentication_settings %}

{% assign footer_id                 = footer_config_defaults.container-id %}
{% assign footer_data_path          = footer_config_defaults.data_path %}
{% assign banner_data_path          = banner_config_defaults.data_path %}
{% assign panel_data_path           = panel_config_defaults.data_path %}

{% assign themer_enabled            = modules.themer_options.enabled %}
{% assign themer_reloadPageOnChange = modules.themer_options.reloadPageOnChange %}
{% assign themer_hideOnReload       = modules.themer_options.hideOnReload %}
{% assign comment_provider          = template_config.comments.provider %}

{% comment %} Set variables
-------------------------------------------------------------------------------- {% endcomment %}
{% if comment_provider == 'disqus' %}
  {% assign site_id = template_config.comments.disqus.site_id %}
{% elsif comment_provider == 'hyvor' %}
  {% assign site_id = template_config.comments.hyvor.site_id %}
{% elsif comment_provider == 'commento' %}
  {% assign site_id = template_config.comments.commento.site_id %}
{% elsif comment_provider == 'just-comments' %}
  {% assign site_id = template_config.comments.just-comments.site_id %}
{% elsif comment_provider == 'facebook' %}
  {% assign site_id = template_config.comments.facebook.site_id %}
{% else %}
  {% assign site_id = false %}
{% endif %}

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

{% if language == "en" %}
  {% assign comments_headline = template_config.comments.comments_headline.en %}
{% endif %}

{% if language == "de" %}
  {% assign comments_headline = template_config.comments.comments_headline.de %}
{% endif %}

/*
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/j1_template.js
 # JS Adapter for J1 Template
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2021 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # For details, see https://jekyll.one
 # -----------------------------------------------------------------------------
 #  TODO:
 #
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
'use strict';

var j1 = (function () {

  // ---------------------------------------------------------------------------
  // globals
  // ---------------------------------------------------------------------------
  var rePager                   =  new RegExp('navigator|dateview|tagview|archive');
  var environment               = '{{environment}}';
  var moduleOptions             = {};
  var j1_runtime_data           = {};

  // Status information
  var state                     = 'not_started';
  var mode                      = 'not_detected';

  // Default tracking provider information
  var tracking_enabled          = ('{{tracking_enabled}}' === 'true') ? true: false;
  var tracking_id               = '{{tracking_id}}';
  var tracking_id_valid         = (tracking_id.includes('tracking-id')) ? false : true;

  // Default comment provider information
  var comment_provider          = '{{comment_provider}}';
  var site_id                   = '{{site_id}}';

  // Default translator settings (currently NOT supported)
  // var translation_enabled       = {{template_config.translation.enabled}};

  var current_user_data;
  var current_page;
  var previous_page;
  var last_pager;
  var last_pager_url;
  var app_detected;
  var user_session_detected;
  var cookie_written;

  // Theme information
  var themeName;
  var themeCss;
  var cssExtension              = (environment === 'production')
                                  ? '.min.css'
                                  : '.css'

   // Pathes of J1 data files
  var colors_data_path          = '{{template_config.colors_data_path}}';
  var font_size_data_path       = '{{template_config.font_size_data_path}}';
  var runtime_data_path         = '{{template_config.runtime_data_path}}';
  var message_catalog_data_path = '{{template_config.message_catalog_data_path}}';

  // Logger
  var logger;
  var logText;

  var _this;
  var settings;
  var json_data;
  var ep;
  var baseUrl;
  var referrer;

  // initial cookie settings
  var cookie_names = {
    'app_session':    '{{template_config.cookies.app_session}}',
    'user_session':   '{{template_config.cookies.user_session}}',
    'user_state':     '{{template_config.cookies.user_state}}',
    'user_consent':   '{{template_config.cookies.user_consent}}',
    'user_translate': '{{template_config.cookies.user_translate}}'
  };
  var user_session = {
    'mode':                 'web',
    'writer':               'j1.adapter',
    'locale':               navigator.language || navigator.userLanguage,
    'user_name':            '{{template_config.user.user_name}}',
    'provider':             '{{template_config.user.provider}}',
    'provider_membership':  '{{template_config.user.provider_membership}}',
    'provider_permissions': 'public,{{template_config.user.provider_permissions}}',
    'provider_site_url':    '{{template_config.user.provider_site_url}}',
    'provider_home_url':    '{{template_config.user.provider_home_url}}',
    'provider_blog_url':    '{{template_config.user.provider_blog_url}}',
    'provider_member_url':  '{{template_config.user.provider_member_url}}',
    'provider_privacy_url': '{{template_config.user.provider_privacy_url}}',
    'requested_page':       'na',
    'previous_page':        'na',
    'last_pager':           '/pages/public/blog/navigator/'
  };
  var user_state = {
    'writer':               'j1.adapter',
    'theme_name':           '',
    'theme_css':            '',
    'theme_author':         '',
    'theme_version':        '{{template_version}}',
    'session_active':       false,
    'google_translate':     'disabled',
    'translate_all_pages':  true,
    'translate_locale':     navigator.language || navigator.userLanguage,
    'last_session_ts':      ''
  };
  var user_consent = {};

  // ---------------------------------------------------------------------------
  // helper functions
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

  // ---------------------------------------------------------------------------
  // main object
  // ---------------------------------------------------------------------------
  return {

    // -------------------------------------------------------------------------
    // init()
    // -------------------------------------------------------------------------
    init: function (options) {

      // -----------------------------------------------------------------------
      // global var (function)
      // -----------------------------------------------------------------------
      var logger            = log4javascript.getLogger('j1.init');
      var url               = new liteURL(window.location.href);
      var baseUrl           = url.origin;
      var hostname          = url.hostname;
      var domain            = hostname.substring(hostname.lastIndexOf('.', hostname.lastIndexOf('.') - 1) + 1);
      var secure            = (url.protocol.includes('https')) ? true : false;
      var date              = new Date();
      var timestamp_now     = date.toISOString();
      var curr_state        = 'started';
      var gaCookies         = j1.findCookie('_ga');
      var j1Cookies         = j1.findCookie('j1');
      var themerOptions     = $.extend({}, {{themer_options | replace: '=>', ':' | replace: 'nil', '""' }});

      // -----------------------------------------------------------------------
      // options loader
      // -----------------------------------------------------------------------
      var settings = $.extend({
        foo: 'foo_option',
        bar: 'bar_option'
        },
        options
      );
      // -----------------------------------------------------------------------
      // status settings
      // save status into the adapter object for (later) global access
      // -----------------------------------------------------------------------
      j1['xhrDataState'] = {};
      j1['xhrDOMState']  = {};

      // -----------------------------------------------------------------------
      // update cookies if browser window get closed
      // see: https://stackoverflow.com/questions/3888902/detect-browser-or-tab-closing
      // -----------------------------------------------------------------------
      window.addEventListener('beforeunload', function (event) {
        var cookie_names              = j1.getCookieNames();
        var date                      = new Date();
        var timestamp_now             = date.toISOString();
        var user_state                = j1.readCookie(cookie_names.user_state);
        var user_consent              = j1.readCookie(cookie_names.user_consent);
        var ep_status;
        var url;
        var baseUrl;

        // final update of the user state cookie before browser page|tab
        // get closed
        if (user_state) {
          user_state.session_active     = false;
          user_state.last_session_ts    = timestamp_now;

          if (!user_consent.analysis || !user_consent.personalization)  {
            // rewrite consent|state cookies to session
            logger.debug('\n' + 'write to cookie : ' + cookie_names.user_consent);
            cookie_written = j1.writeCookie({
              name:     cookie_names.user_consent,
              data:     user_consent,
              samesite: 'Strict',
              secure:   secure,
              expires:  0
            });
            if (!cookie_written) {
              logger.error('\n' + 'failed to write cookie: ' + cookie_names.user_consent);
            }
            logger.debug('\n' + 'write to cookie : ' + cookie_names.user_state);
            cookie_written = j1.writeCookie({
              name:     cookie_names.user_state,
              data:     user_state,
              samesite: 'Strict',
              secure:   secure,
              expires:  0
            });
            if (!cookie_written) {
                logger.error('\n' + 'failed to write cookie: ' + cookie_names.user_consent);
            }
          } else {
            logger.debug('\n' + 'write to cookie : ' + cookie_names.user_state);
            cookie_written = j1.writeCookie({
              name:     cookie_names.user_state,
              data:     user_state,
              samesite: 'Strict',
              secure:   secure,
              expires:  365
            });
            if (!cookie_written) {
                logger.error('\n' + 'failed to write cookie: ' + cookie_names.user_state);
            }
          }
        } else {
          // jadams, 2021-07-11: on beforeunload, a user state cookie is expected
          logger.error('\n' + 'missing cookie detected: ' + cookie_names.user_state);
        }
      }); // END beforeunload

      // -----------------------------------------------------------------------
      // initialize|load user cookies
      // -----------------------------------------------------------------------
      user_session.created    = timestamp_now;
      user_session.timestamp  = timestamp_now;

      user_consent  = j1.readCookie(cookie_names.user_consent);
      user_session  =  j1.existsCookie(cookie_names.user_session)
                        ? j1.readCookie(cookie_names.user_session)
                        : cookie_written = j1.writeCookie({
                            name:     cookie_names.user_session,
                            data:     user_session,
                            samesite: 'Strict',
                            secure:   secure,
                            expires:  0
                          });
      if (!cookie_written) {
        logger.error('\n' + 'failed to write cookie: ' + cookie_names.user_session);
      }

      user_state    =  j1.existsCookie(cookie_names.user_state)
                        ? j1.readCookie(cookie_names.user_state)
                        : cookie_written = j1.writeCookie({
                            name:     cookie_names.user_state,
                            data:     user_state,
                            samesite: 'Strict',
                            secure:   secure,
                            expires:  365
                          });
      if (!cookie_written) {
        logger.error('\n' + 'failed to write cookie: ' + cookie_names.user_state);
      }

      // jadams, 2021-07-11: Found situation that user_state NOT initialized
      // correctly (user_state == false).
      // TODO: Check if/why user state (cookie NOT created?) NOT initialized
      // for what reason.
      if (!user_state) {
        logger.error('\n' + 'cookie not found: ' + cookie_names.user_state);
        logger.debug('\n' + 'j1 cookies found:' + j1Cookies.length);
        j1Cookies.forEach(item => console.log('j1.core.switcher: ' + item));
        logger.debug('\n' + 'ga cookies found:' + gaCookies.length);
        gaCookies.forEach(item => console.log('j1.core.switcher: ' + item));
        user_state = j1.readCookie(cookie_names.user_state);
        user_state.session_active = true;
      }

      if (!user_consent.analysis || !user_consent.personalization)  {
        // rewrite consent|state cookies to session
        logger.debug('\n' + 'write to cookie : ' + cookie_names.user_state);
        cookie_written = j1.writeCookie({
          name:     cookie_names.user_state,
          data:     user_state,
          samesite: 'Strict',
          secure:   secure,
          expires:  0
        });
        if (!cookie_written) {
          logger.error('\n' + 'failed to write cookie: ' + cookie_names.user_state);
        }
      } else {
        logger.debug('\n' + 'write to cookie : ' + cookie_names.user_state);
        cookie_written = j1.writeCookie({
          name:     cookie_names.user_state,
          data:     user_state,
          samesite: 'Strict',
          secure:   secure,
          expires:  365
        });
        if (!cookie_written) {
          logger.error('\n' + 'failed to write cookie: ' + cookie_names.user_state);
        }
      }

      // jadams, 2021-11-10: anchor links of type #void are used/managed
      // by the FAB module. No geneneraL use for NOW.
      // -----------------------------------------------------------------------
      // initialize event handler for smooth scroll on in-page anchors
      // $('a[href*=\\#]').on('click', function (event) {
      //   // ignore void links
      //   if (window.location.href.includes('#void')||this.href.includes('#void')) {
      //     return false;
      //   }
      //   // for external links, redirect to this page
      //   if (window.location.pathname !== this.pathname) {
      //     window.location.href = this.href;
      //   } else {
      //     // continue on in-page anchor
      //     var toccerScrollDuration  = 300;
      //     var toccerScrollOffset    = 10;
      //
      //     // calculate offset value for correct (smooth) scroll position
      //     //
      //     var $pagehead       = $('.attic');
      //     var $navbar         = $('nav.navbar');
      //     var $adblock        = $('#adblock');
      //     var navbarType      = $navbar.hasClass('navbar-fixed') ? 'fixed' : 'scrolled';
      //     var fontSize        = $('body').css('font-size').replace('px','');
      //     var start           = window.pageYOffset;
      //     var l               = parseInt(fontSize);
      //     var h               = $pagehead.length ? $pagehead.height() : 0;
      //     var n               = $navbar.length ? $navbar.height() : 0;
      //     var a               = $adblock.length ? $adblock.height() : 0;
      //     var scrollOffset    = navbarType == 'fixed' ? -1*(n + a + l) : -1*(h + n + a + l);
      //
      //     // TODO:  to be checked why this static offset (toccerScrollOffset)
      //     //        is needed
      //     scrollOffset        = scrollOffset + toccerScrollOffset;
      //
      //     logger.debug('\n' + 'scroll to anchor: ' + this.hash);
      //     $("html, body").animate({
      //       scrollTop: $($(this).attr("href")).offset().top + scrollOffset + "px"
      //     }, {
      //       duration: toccerScrollDuration,
      //       easing: "swing"
      //     });
      //     // disable bubble up the event
      //     return false;
      //   } // End in-page link
      // }); // END click event on anchors

      // initialize event handler for window/history/back on <ESC>
      // -----------------------------------------------------------------------
      window.onkeyup = function (event) {
        if (event.keyCode == 27) window.history.back();
      };

      // detect middleware (mode 'app') and update user session cookie
      // -----------------------------------------------------------------------
      if (user_session.mode === 'app') {
        var url           = new liteURL(window.location.href);
        var ep_status     = baseUrl + '/status' + '?page=' + window.location.pathname;
        var detectTimeout =  50;

        baseUrl = url.origin;

        // See: https://stackoverflow.com/questions/3709597/wait-until-all-jquery-ajax-requests-are-done
        $.when (
          $.ajax(ep_status)
        )
        .then(function(data) {
          var logger                  = log4javascript.getLogger('j1.init');
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
            samesite: 'Strict',
            secure:   secure,
            expires:  0
          });

          if (!cookie_written) {
            logger.error('\n' + 'failed to write cookie: ' + cookie_names.user_session);
          }

          j1.setState(curr_state);
          logger.info('\n' + 'state: ' + j1.getState());

          var dependencies_met_page_displayed = setInterval (function () {
            if (j1.getState() == 'finished') {
              if (j1.authEnabled()) {
                if (user_session.authenticated === 'true') {
                  // set signout
                  logger.info('\n' + 'show signout icon');
                  $('#navLinkSignInOut').attr('data-target','#modalOmniSignOut');
                  $('#iconSignInOut').removeClass('mdi-login').addClass('mdi-logout');
                } else {
                  // set signin
                  logger.info('\n' + 'show signin icon');
                  $('#navLinkSignInOut').attr('data-target','#modalOmniSignIn');
                  $('#iconSignInOut').removeClass('mdi-logout').addClass('mdi-login');
                }
                logger.info('\n' + 'authentication detected as: ' + user_session.authenticated);
                $('#quickLinksSignInOutButton').css('display', 'block');
                logger.info('\n' + 'met dependencies for: j1');
                clearInterval(dependencies_met_page_displayed);
              }
            }
          }, 25);
        })
        .catch(function(error) {
          // jadams, 2018-08-31: Why a hell a setTimeout is needed ???
          setTimeout (function() {
            var logger                  = log4javascript.getLogger('j1.init');
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
              samesite: 'Strict',
              secure:   secure,
              expires:  0
            });
            if (!cookie_written) {
                logger.error('\n' + 'failed to write cookie: ' + cookie_names.user_session);
            }

            j1.setState(curr_state);
            logger.info('\n' + 'state: ' + j1.getState());
          }, detectTimeout);
        });
      } else {
        // web mode
        state = 'started';
        logger.info('\n' + 'state: ' + state);
        logger.info('\n' + 'page is being initialized');
      }

      state = 'started';
      logger.info('\n' + 'state: ' + state);
      logger.info('\n' + 'page is being initialized');

      if ( settings.scrollbar === 'false'  ) {
        $('body').addClass('hide-scrollbar');
        $('html').addClass('hide-scrollbar-moz');
      }

      logger.info('\n' + 'read user state from cookie');
      user_session = j1.readCookie(cookie_names.user_session);

      // process|update user state cookie
      themeName                 = user_session.theme_name;
      themeCss                  = user_session.theme_css;

      // save last page access
      // see: https://stackoverflow.com/questions/3528324/how-to-get-the-previous-url-in-javascript
      // see: https://developer.mozilla.org/de/docs/Web/API/Window/history
      //
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
        samesite: 'Strict',
        secure:   secure,
        expires:  0
      });

      if (!cookie_written) {
        logger.error('\n' + 'failed to write cookie: ' + cookie_names.user_session);
      }

      // NOTE: asynchronous calls should be rewitten to xhrData
      // initialize page resources for blocks
      j1.initBanner(settings);
      j1.initPanel(settings);
      j1.initFooter(settings);

      state = 'running';
      logger.info('\n' + 'state: ' + state);
      // logger.info(logText);

      user_session.timestamp = timestamp_now;
      logger.debug('\n' + 'write to cookie : ' + cookie_names.user_session);
      cookie_written = j1.writeCookie({
        name:     cookie_names.user_session,
        data:     user_session,
        samesite: 'Strict',
        secure:   secure,
        expires:  0
      });
      if (!cookie_written) {
        logger.error('\n' + 'failed to write cookie: ' + cookie_names.user_session);
      }

      // -----------------------------------------------------------------------
      // additional BS helpers from j1.core
      // -----------------------------------------------------------------------
      j1.core.bsFormClearButton();

      // finalize and display page
      j1.displayPage();
    },
    // -------------------------------------------------------------------------
    // initBanner()
    // AJAX fetcher to load and place all banner used for a page
    // -------------------------------------------------------------------------
    initBanner: function (options) {
      var logger            = log4javascript.getLogger('j1.initBanner');
      var banner            = [];
      var bannerOptions     = [];
      var mod               = 'j1';
      var logText;

      {% comment %}
      Closure to pass additional data (e.g. #banner_id) to AJAX load callback
      See: http://stackoverflow.com/questions/939032/jquery-pass-more-parameters-into-callback
      -------------------------------------------------------------------------- {% endcomment %}
      var cb_load_closure = function(banner_id) {
        return function ( responseTxt, statusTxt, xhr ) {
          if ( statusTxt ==  'success' ) {
            var logger = log4javascript.getLogger('j1.adapter.xhrData');
            logText = '\n' + 'loading banner completed on id: ' +banner_id;
            logger.info(logText);
            j1.setXhrDataState(banner_id, statusTxt);
            j1.setXhrDomState(banner_id, statusTxt);
            logger.info('\n' + 'XHR data loaded in the DOM: ' + banner_id);
          }
          if ( statusTxt == 'error' ) {
            logText = '\n' + 'loading banner failed on id: ' +banner_id+ ', error: ' + xhr.status + ': ' + xhr.statusText;
            logger.error(logText);
            j1.setXhrDataState(banner_id, statusTxt);
            j1.setXhrDomState(banner_id, statusTxt);
            // Set|Log status
            state = 'failed';
            logger.error('\n' + 'state: ' + state);
          }
        };
      };

      {% comment %} Collect all banner id|s configured
      -------------------------------------------------------------------------- {% endcomment %}
      {% for items in banner_config_settings %}
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
                  {% assign key = item[0] %}
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
      {% endfor %}  {% comment %} END banner_config_settings {% endcomment %}

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
            var banner_data_path = '{{banner_data_path}} ' + id;
            selector.load(banner_data_path, cb_load_closure(id));
          }
        }
      }  else {
        logText = '\n' + 'no banner found in site';
        logger.warn(logText);
        return false;
      }
      return true;
    },
    // -------------------------------------------------------------------------
    // initPanel()
    // AJAX fetcher to load and place all panel used for a page
    // -------------------------------------------------------------------------
    // ToDo:
    initPanel: function ( options ) {
      var logger            = log4javascript.getLogger('j1.initPanel');
      var panel             = [];
      var mod               = 'j1';
      var logText;

      {% comment %} Closure to pass additional data (e.g. panel_id) to AJAX load callback
      See: http://stackoverflow.com/questions/939032/jquery-pass-more-parameters-into-callback
      -------------------------------------------------------------------------- {% endcomment %}

      {% comment %} NOTE
      strategy for MutationObserver callbacks to monitor DOM changes
      needs to be checked if multiple containers are chenaged in a row
      -------------------------------------------------------------------------- {% endcomment %}
      var cb_load_closure = function(panel_id) {
        return function ( responseTxt, statusTxt, xhr ) {
          var logger = log4javascript.getLogger('j1.adapter.xhrData');
          if ( statusTxt == 'success' ) {
            logText = '\n' + 'loading panel completed on id: ' +panel_id;
            logger.info(logText);
            j1.setXhrDataState(panel_id, statusTxt);
            j1.setXhrDomState(panel_id, statusTxt);
            logger.info('\n' + 'XHR data loaded in the DOM: ' + panel_id);
          }
          if ( statusTxt == 'error' ) {
            logText = '\n' + 'loading panel failed on id: ' +panel_id+ ', error ' + xhr.status + ': ' + xhr.statusText;
            logger.error(logText);
            j1.setXhrDataState(panel_id, statusTxt);
            j1.setXhrDomState(panel_id, statusTxt);
            // Set|Log status
            state = 'Error';
            logger.error('\n' + 'state: ' + state);
          }
        };
      };

      {% comment %} Collect all panel id|s configured
      -------------------------------------------------------------------------- {% endcomment %}
      {% for items in panel_config_settings %}
        {% assign key   = items[0] %}
        {% assign value = items[1] %}

        {% if key == 'intro'     %}  {% assign panel_config  = value %} {% endif %}
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
      {% endfor %}  {% comment %} END panel_config_settings {% endcomment %}

      if (panel.length) {
        for (var i in panel) {
          var id = '#' + panel[i];
          var selector = $(id);
          if ( selector.length ) {
            logText = '\n' + 'loading panel on id: ' +panel[i];
            logger.info(logText);
            var panel_data_path = '{{panel_data_path}} ' + id;
            selector.load(panel_data_path, cb_load_closure(id));
          }
        }
      } else {
        logText = '\n' + 'no panel found in site';
        logger.warn(logText);
        return false;
      }
      return true;
    },
    // -------------------------------------------------------------------------
    // initFooter()
    // AJAX fetcher to load and place the footer used for a page
    // -------------------------------------------------------------------------
    initFooter: function ( options ) {
      var logger            = log4javascript.getLogger('j1.initFooter');
      var mod               = 'j1';
      var logText;

      logText = '\n' + 'loading footer started';
      logger.info(logText);

      var cb_load_closure = function(footer_id) {
        return function ( responseTxt, statusTxt, xhr ) {
          var logger = log4javascript.getLogger('j1.adapter.xhrData');
          if ( statusTxt ==  'success' ) {
            logText = '\n' + 'footer loaded successfully on id: ' + footer_id;
            logger.info(logText);
            j1.setXhrDataState(footer_id, statusTxt);
            j1.setXhrDomState(footer_id, statusTxt);
            logger.info('\n' + 'XHR data loaded in the DOM: ' + footer_id);
            logText = '\n' + 'initialization finished';
            logger.info(logText);
          }
          if ( statusTxt == 'error' ) {
            logText = '\n' + 'loading footer failed on id: ' +footer_id+ ', error ' + xhr.status + ': ' + xhr.statusText;
            logger.error(logText);
            j1.setXhrDataState(footer_id, statusTxt);
            j1.setXhrDomState(footer_id, statusTxt);

            // Set|Log status
            state = 'failed';
            logger.error('\n' + 'state: ' + state);
            logText = '\n' + 'initialization finished';
            logger.info(logText);
          }
        };
      };

      var id = '#' + '{{footer_id}}';
      var selector = $(id);
      if ( selector.length ) {
        var footer_data_path = '{{footer_data_path}} ' + id;
        selector.load(footer_data_path, cb_load_closure(id));
      } else {
        logText = '\n' + 'data not loaded';
        logger.warn(logText);
        j1.setXhrDataState(id, 'not loaded');
        j1.setXhrDomState(id, 'pending');
        return false;
      }
      return true;
    },
    // -------------------------------------------------------------------------
    // displayPage
    // show the page after timeout of {{flickerTimeout}} ms
    // -------------------------------------------------------------------------
    // NOTE:
    //  jadams, 2019-08-21: for unknown reason, the user state data
    //  (read from cookie) seems not correct (or loaded too late).
    //  To make correct data sure for APP mode, a status request is done
    //  to load the current state from the middleware (skipped in WEB mode)
    // -------------------------------------------------------------------------
    displayPage: function (options) {
      var logger              = log4javascript.getLogger('j1.adapter.displayPage');
      var flickerTimeout      = {{template_config.flicker_timeout}};
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

      // if personalized content detected, page requires user consent
      if (personalization && !user_consent.personalization) {
        // redirect to error paged (blocked content)
        window.location.href = "/444.html";
      }

      logger.info('\n' + 'finalize page');
      j1.setCss();

      logText= '\n' + 'loading page partials: started';
      logger.info(logText);

      if (j1.appDetected()) { // app mode
        logger.info('\n' + 'mode detected: app');

        $.when ($.ajax(ep_status))
        .then(function(data) {
          var logger = log4javascript.getLogger('j1.displayPage');

          user_session = j1.mergeData(user_session, data);

          user_session.current_page = current_url.pathname;
          logger.debug('\n' + 'write to cookie : ' + cookie_names.user_session);
          cookie_written = j1.writeCookie({
            name:     cookie_names.user_session,
            data:     user_session,
            samesite: 'Strict',
            secure:   secure,
            expires:  0
          });
          if (!cookie_written) {
            logger.error('\n' + 'failed to write cookie: ' + cookie_names.user_session);
          }

          providerPermissions = user_session.provider_permissions;
          categoryAllowed     = providerPermissions.includes(user_session.page_permission);

          // check protected pages (applies for APP only)
          // make sure that protected pages are ALWAYS checked for permissions
          // -------------------------------------------------------------------
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

          // show the page delayed
          setTimeout (function() {
            // Manage providers for personalization OptIn/Out (Comments|Ads)
            if (!user_consent.personalization) {
              logger.warn('\n' + 'disable comment provider: ' + comment_provider);
              logger.warn('\n' + 'personalization not allowed, privacy settings for personalization: ' + user_consent.personalization);
              $('#leave-a-comment').remove();
              if (comment_provider === 'disqus') {
                $('#dsq-count-scr').remove();
                $('#disqus-thread').remove();
              }
              if (comment_provider === 'hyvor') {
                $('#hyvor-embed').remove();
                $('#hyvor-talk-view').remove();
              }
            } else {
              if (comments) {
                logger.info('\n' + 'enable comment provider: ' + comment_provider);
                $('#main-content').append('<h2 id="leave-a-comment" class="mt-4">{{comments_headline}}</h2>');
                if (comment_provider === 'disqus') {
                  logger.info('\n' + 'load comment provider code: ' + comment_provider);
                  $('#main-content').append('<div id="disqus_thread"></div>');
                  $('body').append('<script async id="dsq-count-scr" src="//' + site_id + '.disqus.com/count.js"></script>');
                  j1.loadJS({
                    xhr_data_path:    '/assets/data/' + comment_provider + '.js',
                    xhr_data_element: comment_provider
                  });
                }
                if (comment_provider === 'hyvor') {
                  $('body').append('<script> var HYVOR_TALK_WEBSITE = ' + site_id + '; var HYVOR_TALK_CONFIG = { url: false, id: false };');
                  $('#main-content').append('<div id="hyvor-talk-view"></div>');
                  $('body').append('<script async id="hyvor-embed" type="text/javascript" src="//talk.hyvor.com/web-api/embed.js"></script>');
                }
              }
            }

            // display page
           $('#no_flicker').css('display', 'block');

           // no dropcaps if translation enabled
           if (user_translate.translationEnabled) {
             logger.info('\n' + 'translation enabled: ' + user_translate.translationEnabled);
             logger.warn('\n' + 'skipped processing of dropcaps');
           } else {
             // initialize dropcaps
             logger.info('\n' + 'post processing: createDropCap');
             j1.core.createDropCap();
           }

             // add recommended title to hyvor iframe for SEO optimization (if loadad)
            if (comment_provider === 'hyvor') {
              var dependencies_met_load_finished = setInterval (function () {
                if ($('#hyvor-talk-view').children().length) {
                    $('#hyvor-talk-iframe').prop('title', 'Hyvor talk iframe');
                    clearInterval(dependencies_met_load_finished);
                }
              }, 25);
            }
            // NOTE: Placed tracking warning/info here because page may reloaded
            // after cookie consent selection
            if (user_consent.analysis) {
              logger.info('\n' + 'tracking allowed, privacy settings for analysis: ' + user_consent.analysis);
              if (tracking_enabled && !tracking_id_valid) {
                logger.error('\n' + 'tracking enabled, but invalid tracking id found: ' + tracking_id);
              } else if (tracking_enabled && tracking_id_valid) {
                logger.info('\n' + 'tracking enabled, tracking id found: ' + tracking_id);
              } else {
                logger.info('\n' + 'tracking disabled, tracking id found: ' + tracking_id);
              }
            } else {
              logger.warn('\n' + 'tracking not allowed, privacy settings for analysis: ' + user_consent.analysis);
            }

            // show|hide cookie icon (should MOVED to Cookiebar ???)
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

            // show|hide translator icon (currently NOT supported)
            // if (translation_enabled) {
            //   logger.info('\n' + 'translator detected: google');
            //   logger.info('\n' + 'initialize language selector');
            //   $('.goog-te-combo').addClass('form-control');
            // }

            // show cc icon (currently NOT supported)
            // $('#quickLinksControlCenterButton').css('display', 'block');

            if (j1.authEnabled()) {
              if (user_session.authenticated === 'true') {
                // set signout
                logger.info('\n' + 'show signout icon');
                $('#navLinkSignInOut').attr('data-target','#modalOmniSignOut');
                $('#iconSignInOut').removeClass('mdi-login').addClass('mdi-logout');
              } else {
                // set signin
                logger.info('\n' + 'show signin icon');
                $('#navLinkSignInOut').attr('data-target','#modalOmniSignIn');
                $('#iconSignInOut').removeClass('mdi-logout').addClass('mdi-login');
              }
              logger.info('\n' + 'authentication detected as: ' + user_session.authenticated);
              $('#quickLinksSignInOutButton').css('display', 'block');
            }

            // jadams, 2021-07-25: hide|show themes menu on cookie consent
            // (analysis|personalization) settings. BootSwatch is a 3rd party
            // is using e.g GA. Because NO control is possible on 3rd parties,
            // for GDPR compliance, themes feature may disabled on
            // privacy settings
            if (!user_consent.personalization)  {
              logger.warn('\n' + 'disable themes feature because of privacy settings');
              logger.warn('\n' + 'personalization not allowed, privacy settings for personalization: ' + user_consent.personalization);
              $("#themes_menu").hide();
            } else {
              $("#themes_menu").show();
            }

            // if the page requested contains an anchor element,
            // do a smooth scroll to
            j1.scrollTo();

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
            j1.core.navigator.updateSidebar(current_user_data);

            // Set|Log status
            state = 'finished';
            logText = '\n' + 'state: ' + state;
            logger.info(logText);
            logText = '\n' + 'page finalized successfully';
            logger.info(logText);
          }, flickerTimeout);
        });
      } else {
        // web mode
        setTimeout (function() {
          j1.setState('finished');
          logger.info('\n' + 'state: finished');
          logger.info('\n' + 'page initialization: finished');

          // Manage providers for personalization OptIn/Out (Comments|Ads)
          if (!user_consent.personalization) {
            logger.warn('\n' + 'disable comment provider: ' + comment_provider);
            logger.warn('\n' + 'personalization not allowed, privacy settings for personalization: ' + user_consent.personalization);
            $('#leave-a-comment').remove();
            if (comment_provider === 'disqus') {
              $('#dsq-count-scr').remove();
              $('#disqus-thread').remove();
            }
            if (comment_provider === 'hyvor') {
              $('#hyvor-embed').remove();
              $('#hyvor-talk-view').remove();
            }
          } else {
            if (comments) {
              logger.info('\n' + 'enable comment provider: ' + comment_provider);
              $('#main-content').append('<h2 id="leave-a-comment" class="mt-4">{{comments_headline}}</h2>');
              if (comment_provider === 'disqus') {
                logger.info('\n' + 'load comment provider code: ' + comment_provider);
                $('#main-content').append('<div id="disqus_thread"></div>');
                $('body').append('<script async id="dsq-count-scr" src="//' + site_id + '.disqus.com/count.js"></script>');
                j1.loadJS({
                  xhr_data_path:    '/assets/data/' + comment_provider + '.js',
                  xhr_data_element: comment_provider
                });
              }
              if (comment_provider === 'hyvor') {
                $('body').append('<script> var HYVOR_TALK_WEBSITE = ' + site_id + '; var HYVOR_TALK_CONFIG = { url: false, id: false };');
                $('#main-content').append('<div id="hyvor-talk-view"></div>');
                $('body').append('<script async id="hyvor-embed" type="text/javascript" src="//talk.hyvor.com/web-api/embed.js"></script>');
              }
            }
          }

          // display page
          $('#no_flicker').css('display', 'block');

          // Add minus icon for collapse element which is open by default
            $(".collapse.show").each(function(){
                $(this).prev(".card-header").addClass("highlight");
            });

            // Highlight open collapsed element
            $(".card-header .btn").click(function(){
                $(".card-header").not($(this).parents()).removeClass("highlight");
                $(this).parents(".card-header").toggleClass("highlight");
            });

            // no dropcaps if translation enabled
            if (user_translate.translationEnabled) {
              logger.info('\n' + 'translation enabled: ' + user_translate.translationEnabled);
              logger.warn('\n' + 'skipped processing of dropcaps');
            } else {
              // initialize dropcaps
              logger.info('\n' + 'post processing: createDropCap');
              j1.core.createDropCap();
            }

            // add recommended title to hyvor iframe for SEO optimization (if loadad)
           if (comment_provider === 'hyvor') {
             var dependencies_met_load_finished = setInterval (function () {
               if ($('#hyvor-talk-view').children().length) {
                 $('#hyvor-talk-iframe').prop('title', 'Hyvor talk iframe');
                 clearInterval(dependencies_met_load_finished);
               }
             }, 25);
           }
          // NOTE: Placed tracking warning/info here because page may reloaded
          // after cookie consent selection
          if (user_consent.analysis) {
            logger.info('\n' + 'tracking allowed, privacy settings for analysis: ' + user_consent.analysis);
            if (tracking_enabled && !tracking_id_valid) {
              logger.error('\n' + 'tracking enabled, but invalid tracking id found: ' + tracking_id);
            } else if (tracking_enabled && tracking_id_valid) {
              logger.info('\n' + 'tracking enabled, tracking id found: ' + tracking_id);
            } else {
              logger.info('\n' + 'tracking disabled, tracking id found: ' + tracking_id);
            }
          } else {
            logger.warn('\n' + 'tracking not allowed, privacy settings for analysis: ' + user_consent.analysis);
          }

          logger.info('\n' + 'mode detected: web');
          logger.info('\n' + 'hide signin icon');
          $('#quickLinksSignInOutButton').css('display', 'none');

          user_session.current_page = current_url.pathname;
          logger.debug('\n' + 'write to cookie : ' + cookie_names.user_session);
          cookie_written = j1.writeCookie({
              name:     cookie_names.user_session,
              data:     user_session,
              samesite: 'Strict',
              secure:   secure,
              expires:  0
          });
          if (!cookie_written) {
            logger.error('\n' + 'failed to write cookie: ' + cookie_names.user_session);
          }

          // show|hide translator icon (currently NOT supported)
          // if (translation_enabled) {
          //   logger.info('\n' + 'translator detected: google');
          //   logger.info('\n' + 'initialize language selector');
          //   $('.goog-te-combo').addClass('form-control');
          // }

          // show cc icon (currently NOT supported)
          // $('#quickLinksControlCenterButton').css('display', 'block');

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

          // jadams, 2021-07-25: hide|show themes menu on cookie consent
          // (analysis|personalization) settings. BootSwatch is a 3rd party
          // is using e.g GA. Because NO control is possible on 3rd parties,
          // for GDPR compliance, themes feature may disabled on
          // privacy settings
          if (!user_consent.personalization)  {
            logger.warn('\n' + 'disable themes feature because of privacy settings');
            logger.warn('\n' + 'personalization not allowed, privacy settings for personalization: ' + user_consent.personalization);
            $("#themes_menu").hide();
          } else {
            $("#themes_menu").show();
          }

          // If the page requested contains an anchor element,
          // do a smooth scroll
          j1.scrollTo();

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
          j1.core.navigator.updateSidebar(current_user_data);

          // set|log status
          state = 'finished';
          logText = '\n' + 'state: ' + state;
          logger.info(logText);
          logText = '\n' + 'page finalized successfully';
          logger.info(logText);
        }, flickerTimeout);
      }
    },
    // -------------------------------------------------------------------------
    // Helper functions
    // -------------------------------------------------------------------------

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
    },
    // -------------------------------------------------------------------------
    // getPrevPage()
    // Returns the last vistited page
    // -------------------------------------------------------------------------
    getPrevPage: function () {
      return previous_page;
    },
    // -------------------------------------------------------------------------
    // getLanguage()
    // Returns the preferred language taken form window.navigator
    // See:
    // https://stackoverflow.com/questions/1043339/javascript-for-detecting-browser-language-preference
    // -------------------------------------------------------------------------
    getLanguage: function () {
      var language = navigator.languages ? navigator.languages[0] : (navigator.language || navigator.userLanguage);
    },
    // -------------------------------------------------------------------------
    // getTemplateVersion()
    // Returns the template version taken from site config (_config.yml)
    // -------------------------------------------------------------------------
    getTemplateVersion: function () {
      return '{{template_version}}';
    },
    // -------------------------------------------------------------------------
    // scrollTo()
    // Scrolls smooth to any anchor referenced by an page URL on
    // e.g. a page reload. Values for delay|offset are taken from
    // TOCCER module
    // -------------------------------------------------------------------------
    scrollTo: function () {
      var anchor    = window.location.href.split('#')[1];
      var anchor_id = typeof anchor !== 'undefined' ? '#' + anchor : false;
      var isSlider  = false;
      var selector;

      if (typeof anchor === 'undefined') {
        return false;
      } else if (anchor.includes("googtrans")) {
        return false;
      }

      var logger        = log4javascript.getLogger('j1.scrollTo');

      var toccerScrollDuration = {{toccer_options.scrollSmoothDuration}};
      var toccerScrollOffset   = {{toccer_options.scrollSmoothOffset}};

      // calculate offset for correct (smooth) scroll position
      var $pagehead       = $('.attic');
      var $navbar         = $('nav.navbar');
      var $adblock        = $('#adblock');

      var navbarType      = $navbar.hasClass('navbar-fixed') ? 'fixed' : 'scrolled';
      var fontSize        = $('body').css('font-size').replace('px','');
      var start           = window.pageYOffset;

      var l               = parseInt(fontSize);

      var h               = $pagehead.length ? $pagehead.height() : 0;
      var n               = $navbar.length ? $navbar.height() : 0;
      var a               = $adblock.length ? $adblock.height() : 0;

      var scrollOffset    = navbarType == 'fixed' ? -1*(n + a + l) : -1*(h + n + a + l);

      // static offset, to be checked why this is needed
      scrollOffset        = scrollOffset + toccerScrollOffset;

      // Check if the anchor is an slider/gallery element
      if (typeof anchor !== 'undefined') {
        isSlider  = anchor.includes('slide');
      }

      if (anchor_id && anchor_id !== '#' && !isSlider) {
        // scroll only, if an anchor is given with URL
        selector = $(anchor_id);
        if (selector.length) {
          j1.core.scrollSmooth.scroll( anchor_id, {
            duration: toccerScrollDuration,
            offset: scrollOffset,
            callback: null
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
        logger.info('\n' + 'bound click event to "#void", suppress default action');
        $(window).scrollTop($(window).scrollTop()+1);
        $(window).scrollTop($(window).scrollTop()-1);
        return false;
      }
    },
    // -------------------------------------------------------------------------
    //  authEnabled()
    //  Returns the state of the authentication module
    // -------------------------------------------------------------------------
    authEnabled: function () {
      var logger      = log4javascript.getLogger('j1.authentication');
      var authEnabled = {{authentication_options.j1_auth.enabled}};

      return authEnabled;
    },
    // -------------------------------------------------------------------------
    //  appDetected()
    //  Returns true if a web session cookie exists
    // -------------------------------------------------------------------------
    appDetected: function () {
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
    },
    // -------------------------------------------------------------------------
    // loadHTML()
    // Load HTML data asychronously using XHR|jQuery on an element (e.g. <div>)
    // specified by xhr_container_id, xhr_data_path (options)
    // -------------------------------------------------------------------------
    loadHTML: function (options, mod, status) {
      var logger            = log4javascript.getLogger('j1.adapter.loadHTML');
      var selector          = $('#' + options.xhr_container_id);
      var state             = status;
      var observer_options  = {
        attributes:     false,
        childList:      true,
        characterData:  false,
        subtree:        true
      };
      var observer;
      var logText;

      var cb_load_closure = function(mod, id) {
        return function (responseTxt, statusTxt, xhr) {
          var logger = log4javascript.getLogger('j1.adapter.loadHTML');
          if ( statusTxt === 'success' ) {
            j1.setXhrDataState(id, statusTxt);
            j1.setXhrDomState(id, 'pending');

            logText = '\n' + 'data loaded successfully on id: ' +id;
            logger.info(logText);
            state = true;
          }
          if ( statusTxt === 'error' ) {
            // jadams, 2020-07-21: to be checked why id could be UNDEFINED
            if (typeof(id) != "undefined") {
              state = 'failed';
              logger.info('\n' + 'set state for ' +mod+ ' to: ' + state);
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
      var id        = '#' + options.xhr_container_id;
      var container = '#' + options.xhr_container_id + '_container';
      var $selector = $(id);

      // NOTE: Unclear why some pages (e.g. about/site) affected (fam button).
      // All pages should have FRONTMATTER defaults (by _config.yml) setting
      // all relevant defaults.

      // failsafe - prevent XHR load errors
      if (options.xhr_data_element !== '') {
        logger.info('\n' + 'XHR data element found: ' + options.xhr_data_element);
      } else  {
        logger.warn('\n' + 'no XHR data element found, loading data aborted');
        return;
      }

      if ( $selector.length ) {
        $selector.load( html_data_path, cb_load_closure( mod, id ) );

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
              logger.info('\n' + 'XHR data loaded in the DOM: ' + id);
              j1.setXhrDomState(id, 'success');
            }
          });
        }
      } else {
        // jadams, 2020-07-21: To be clarified why a id is "undefined"
        // failsafe - prevent XHR load errors
        if (id != '#undefined') {
          logText = '\n' + 'data not loaded on id:' + id;
          logger.warn(logText);
          j1.setXhrDataState(id, 'not loaded');
          j1.setXhrDomState(id, 'not loaded');
          // Set processing state to 'finished' to complete module load
          state = 'finished';
          logger.info('\n' + 'state: ' + state);
          // jadams, 2020-07-21: intermediate state should DISABLED
          // executeFunctionByName(mod + '.setState', window, state);
          state = false;
        }
      }
      return state;
    },
    // -------------------------------------------------------------------------
    // loadJS()
    // Load JS data asychronously using jQuery (XHR)
    // -------------------------------------------------------------------------
    loadJS: function (options, mod, status) {
      var logger  = log4javascript.getLogger('j1.adapter.loadJS');
      var state   = status;
      var logText;

      var cb_load_closure = function(mod, id) {
        return function (responseTxt, statusTxt, xhr) {
          var logger = log4javascript.getLogger('j1.adapter.loadJS');
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
    },
    // -------------------------------------------------------------------------
    // removeRessource (Vanilla JS)
    // -------------------------------------------------------------------------
    removeRessource: function (filename, filetype) {
      // determine element type to create nodelist from
      var targetelement=(filetype=="js")? "script" : (filetype=="css")? "link" : "none"
      // determine corresponding attribute to test for
      var targetattr=(filetype=="js")? "src" : (filetype=="css")? "href" : "none"
      var allsuspects=document.getElementsByTagName(targetelement)

      // search backwards within nodelist for matching elements to remove
      // remove element by calling parentNode.removeChild()
      for (var i=allsuspects.length; i>=0; i--) {
        if (allsuspects[i] && allsuspects[i].getAttribute(targetattr)!=null && allsuspects[i].getAttribute(targetattr).indexOf(filename)!=-1)
            allsuspects[i].parentNode.removeChild(allsuspects[i])
      }
    },
    // -------------------------------------------------------------------------
    //  readCookie (Vanilla JS)
    // -------------------------------------------------------------------------
    readCookie: function (name) {
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
    },
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
    // TODO:
    //    Change attribute "Secure" to true, if HTTPS is used.
    //    Checks and config changes are to be done.
    // -------------------------------------------------------------------------
    // TODO:
    //    Handling of  attribute "SameSite".
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
    writeCookie: function (options /*name, data, [path, expires, domain, samesite, http_only, secure]*/) {
      var date          = new Date();
      var timestamp_now = date.toISOString();
      var cookie_data   = {};
      var data_json;
      var data_encoded;
      var expires;
      var stringifiedAttributes = '';

      var defaults = {
          data: {},
          name: '',
          path: '/',
          expires: 0,
          domain: 'localhost',
          samesite: 'Strict',
          http_only: false,
          secure: false
      };

      var settings = $.extend(defaults, options);

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

      stringifiedAttributes += '; ' + 'path=' + settings.path;

      if (settings.expires > 0) {
        date.setTime(date.getTime() + (settings.expires * 24 * 60 * 60 * 1000));
        stringifiedAttributes += '; ' + 'expires=' + date.toUTCString();
      }

      stringifiedAttributes += '; ' + 'SameSite=' + settings.samesite;

      if (settings.secure) {
        stringifiedAttributes += '; ' + 'secure=' + settings.secure;
      }

      // write the cookie
//    document.cookie = settings.name + '=' + content + '; path=' + settings.path + '; domain=' + settings.domain + '; ' + 'SameSite=' + settings.samesite + '; secure';
      document.cookie = settings.name + '=' + data_encoded + stringifiedAttributes;

      if (j1.existsCookie(settings.name)) {
        return cookie_data;
      } else {
        return false;
      }

    },
    // -------------------------------------------------------------------------
    // findCookie (Vanilla JS)
    // Search for cookies (names) in the page header that matches a given
    // name. Cookie name can be give as full name, like 'j1.user.state', or
    // as a partial like 'j1'
    // Returns all names found as an array.
    // -------------------------------------------------------------------------
    // See: https://stackoverflow.com/questions/52287989/javascript-cookie-remove-or-delete-with-regex-regular-expression
    // -------------------------------------------------------------------------
    findCookie: function (name) {
      var rCookie=[];
      document.cookie.replace(new RegExp(name + '[^= ]*', 'g'), function(a){ rCookie.push(a.trim()); });

      return rCookie;
    },
    // -------------------------------------------------------------------------
    // removeCookie (Vanilla JS)
    // -------------------------------------------------------------------------
    removeCookie: function (options /*name, [path, domain]*/) {
      var cookieExists;
      var defaults = {
          domain: 'localhost',
          path: '/'
      };
      var settings = $.extend(defaults, options);

      if (j1.findCookie(settings.name)) {
        // clear cookie CONTENT and set expiry date in the PAST
        document.cookie = settings.name + '=; domain=' + settings.domain + '; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        return true;
      } else {
        return false;
      }
    },
    // -------------------------------------------------------------------------
    // expireCookie (Vanilla JS)
    // Expires given cookies by name except cookies set to httpOnly. For all
    // cookies the expiry date is REMOVED. This results in cookies are set
    // to 'session' for the expiry date. All session cookies are deleted
    // automatically by the browser if the last session (browser tab|window)
    // is closed.
    // -------------------------------------------------------------------------
    // expireCookie() returns 'true' if cookie is set successfully,
    // otherwise 'false' (e.g NOT found)
    // -------------------------------------------------------------------------
    // NOTE:
    // See: https://stackoverflow.com/questions/179355/clearing-all-cookies-with-javascript
    // NOTE:
    // There is NO way you could get a trace of Path, Domain and other
    // attributes of cookies as they are only read by browsers and NOT shown
    // to JavaScript. For that reason, attributes needs to be set explicitly.
    // -------------------------------------------------------------------------
    expireCookie: function (options /*name [,path, samesite, secure]*/) {
      var defaults = {
          path: '/',
          samesite: 'Strict',
          secure: false
      };
      var settings  = $.extend(defaults, options);

      var dc        = document.cookie;                                            // all cookies in page
      var end       = dc.length;                                                  // default to end of the string
      var prefix    = settings.name + '=';                                                 // search string for the cookie name given
      var begin     = dc.indexOf('; ' + prefix);
      var content   = '';

      // collect the cookie content
      //
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

      // expire cookie to session
      content = decodeURI(dc.substring(begin + prefix.length, end) ).replace(/"/g, '');
      if (settings.secure) {
        document.cookie = settings.name + '=' + content +'; path=' + settings.path + '; ' + 'SameSite=' + settings.samesite + '; secure';
      } else {
        document.cookie = settings.name + '=' + content +'; path=' + settings.path + '; ' + 'SameSite=' + settings.samesite;
      }

      return true;
    },
    // -------------------------------------------------------------------------
    // existsCookie (Vanilla JS)
    // returns true if a given cookie exists
    // -------------------------------------------------------------------------
    existsCookie: function (name) {
      var dc            = document.cookie;
      var prefix        = name + '=';
      var begin         = dc.indexOf('; ' + prefix);
      var end           = dc.length;                                            // default to end of the string
      var cookieExists  = false;
      var cookieContent = '';

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

      cookieContent = decodeURI(dc.substring(begin + prefix.length, end) ).replace(/"/g, '');
      cookieExists  = cookieContent.length ? true : false;

      return cookieExists;
    },
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
    resolveMacros: function (user_data) {
      var logger = log4javascript.getLogger('j1.resolveMacros');

      var sidebarLoaded = setInterval(function() {
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
                $this.html($html.replace('??theme-version', user_data.theme_version));
              });

            });
            logger.info('\n' + 'met dependencies for: sidebarLoaded');
            clearInterval(sidebarLoaded);
            return true;
          } else {
            logger.error('\n' + 'no user data provided');
            clearInterval(sidebarLoaded);
            return false;
          }
        }
      }, 25);
    },
    // -------------------------------------------------------------------------
    // Update MACROs
    // Update the values, NOT the placeholders
    // -------------------------------------------------------------------------
    updateMacros: function (user_data) {
      var logger = log4javascript.getLogger('j1.updateMacros');

      var sidebarLoaded = setInterval(function() {
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
            logger.info('\n' + 'met dependencies for: sidebarLoaded');
            clearInterval(sidebarLoaded);
            return true;
          } else {
            logger.error('\n' + 'no user data provided');
            clearInterval(sidebarLoaded);
            return false;
          }
        }
      }, 25);
    },
    // -------------------------------------------------------------------------
    // getMessage
    // Get a log message from the log message catalog object
    // -------------------------------------------------------------------------
    getMessage: function (level, message, property) {
      var message = j1.messages[level][message]['message'][property];

      return message;
    },
    // -------------------------------------------------------------------------
    // logger
    // Log a message
    // -------------------------------------------------------------------------
    logger: function (logger, level, message) {
      var logger = log4javascript.getLogger(logger);

      logger[level](message);

      return true;
    },
    // -------------------------------------------------------------------------
    // Send message
    // -------------------------------------------------------------------------
    sendMessage: function ( sender, receiver, message ) {
      var logger        = log4javascript.getLogger('j1.sendMessage');
      // var json_message  = JSON.stringify(message, undefined, 2);             // multiline
      var json_message  = JSON.stringify(message);

      if ( receiver === 'j1' ) {
        logText = '\n' + 'send message from ' + sender + ' to' + receiver + ': ' + json_message;
        logger.debug(logText);
        executeFunctionByName('j1' + '.messageHandler', window, sender, message);
      } else {
        logText = '\n' + 'send message from ' + sender + ' to ' + receiver + ': ' + json_message;
        logger.debug(logText);
        //executeFunctionByName('j1.' + receiver + '.messageHandler', window, sender, message)
        executeFunctionByName(receiver + '.messageHandler', window, sender, message);
      }

    },
    // -------------------------------------------------------------------------
    // messageHandler: MessageHandler for J1 CookieConsent module
    // Manage messages send from other J1 modules
    // -------------------------------------------------------------------------
    messageHandler: function ( sender, message ) {
      // var json_message  = JSON.stringify(message, undefined, 2);             // multiline
      var json_message  = JSON.stringify(message);

      logText = '\n' + 'received message from ' + sender + ': ' + json_message;
      logger.debug(logText);

      // -----------------------------------------------------------------------
      //  Process commands|actions
      // -----------------------------------------------------------------------
      if ( message.type === 'command' && message.action === 'module_initialized' ) {
        _this.setState('finished');
        logger.info('\n' + message.text);
      }

      //
      // Place handling of other command|action here
      //

      return true;
    },
    // -------------------------------------------------------------------------
    // getStyleValue:
    // Returns the value of a style from a css class definition
    // example: j1.getStyleValue('uno-primary', 'background-color')
    getStyleValue: function (className, style) {
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
    },
    // -------------------------------------------------------------------------
    // getStyleSheetLoaded:
    // NOTE:
    // EXAMPLE: getStyleSheetLoaded('bootstrap');
    //
    getStyleSheetLoaded: function (styleSheet) {
      // var styleSheet  = styleSheetName.toLowerCase() + '.css';
      var sheets      = document.styleSheets, stylesheet = sheets[(sheets.length - 1)];

      // find CSS file 'styleSheetName' in document
      for(var i in document.styleSheets) {
        if(sheets[i].href && sheets[i].href.indexOf(styleSheet) > -1) {
          return true;;
        }
      }
    },
    // -------------------------------------------------------------------------
    //  Returns the names of cookies used for J1 Template
    // -------------------------------------------------------------------------
    getCookieNames: function () {
      return cookie_names;
    },
    // -------------------------------------------------------------------------
    // Set dynamic styles
    // -------------------------------------------------------------------------
    setCss: function () {
      var logger        = log4javascript.getLogger('j1.setCss');
      var bg_primary    = j1.getStyleValue('bg-primary', 'background-color');
      var bg_secondary  = j1.getStyleValue('bg-secondary', 'background-color');

      logger.info('\n' + 'set color scheme for selected theme');

      // globals
      // -----------------------------------------------------------------------
      $('head').append('<style>.g-bg-primary { background-color: ' +bg_primary+ ' !important; }</style>');

      // mdi icons
      // -----------------------------------------------------------------------
      $('head').append('<style>.iconify-md-bg-primary { color: ' +bg_primary+ ' !important; }</style>');
      $('head').append('<style>.fa-md-bg-primary { color: ' +bg_primary+ ' !important; }</style>');
      $('head').append('<style>.fas-md-bg-primary { color: ' +bg_primary+ ' !important; }</style>');
      $('head').append('<style>.mdi-md-bg-primary { color: ' +bg_primary+ ' !important; }</style>');

      // asciidoc
      // -----------------------------------------------------------------------
      var admonitionblock_note_color      = bg_primary;
      var admonitionblock_tip_color       = j1.getStyleValue('btn-success', 'background-color');
      var admonitionblock_important_color = j1.getStyleValue('btn-info', 'background-color');
      var admonitionblock_warning_color   = j1.getStyleValue('icon-warning', 'color');
      var admonitionblock_caution_color   = j1.getStyleValue('btn-danger', 'background-color');

      $('head').append('<style>.icon-note { color: ' +admonitionblock_note_color+ ' !important; }</style>');
      $('head').append('<style>.icon-tip { color: ' +admonitionblock_tip_color+ ' !important; }</style>');
      $('head').append('<style>.icon-important { color: ' +admonitionblock_important_color+ ' !important; }</style>');
      $('head').append('<style>.icon-warning { color: ' +admonitionblock_warning_color+ ' !important; }</style>');
      $('head').append('<style>.icon-caution { color: ' +admonitionblock_caution_color+ ' !important; }</style>');

      // bs base styles (2020-09-20: diabled. Taken for BS CSS code)
      // -----------------------------------------------------------------------
      // $('head').append('<style>code { color: ' +bg_secondary+ ' !important; }</style>');

      // bs tool tips
      // -----------------------------------------------------------------------
      $('head').append('<style>.tooltip-inner { background-color: ' +bg_primary+ ' !important; }</style>');
//    $('head').append('<style>.tooltip-arrow { background-color: ' +bg_primary+ ' !important; }</style>');
      $('head').append('<style>.bs-tooltip-auto[x-placement^=bottom] .arrow::before, .bs-tooltip-bottom .arrow::before { border-bottom-color: ' +bg_primary+ ' !important; }</style>');

      // asciidoc results viewer
      // -----------------------------------------------------------------------
      $('head').append('<style>.btn-viewer:hover { background-color: ' +bg_primary+ ' !important; }</style>');

      // extended modals
      // -----------------------------------------------------------------------
      // var tabs_pills_link_color_active    = j1.setColorData('md_blue');         // j1.getStyleValue('btn-info', 'background-color');
      // var tabs_pills_link_color_hover     = j1.setColorData('md_gray_300');     // j1.getStyleValue('btn-secondary', 'background-color');

      // var tabs_pills_link_color_active    = 'mdi-blue';
      // var tabs_pills_link_color_hover     = 'mdi-gray-300';

      // nav module
      // -----------------------------------------------------------------------
      // $('head').append('<style>.nav-link:hover { background-color: ' +tabs_pills_link_color_hover+ ' !important; }</style>');
      // $('head').append('<style>.nav-link.active { background-color: ' +tabs_pills_link_color_active+ ' !important; }</style>');

      return true;
    },
    // -------------------------------------------------------------------------
    // setState()
    // Set the current (processing) state of the module
    // -------------------------------------------------------------------------
    setState: function (stat) {
      state = stat;
    },
    // -------------------------------------------------------------------------
    // getState()
    // Returns the current (processing) state of the module
    // -------------------------------------------------------------------------
    getState: function () {
      return state;
    },
    // -------------------------------------------------------------------------
    // setXhrDataState()
    // Set the final (loading) state of an element (partial) loaded via Xhr
    // -------------------------------------------------------------------------
    setXhrDataState: function (obj, stat) {
      j1.xhrDataState[obj] = stat;
    },
    // -------------------------------------------------------------------------
    // getXhrDataState()
    // Returns the final (loading) state of an element (partial) loaded via Xhr
    // -------------------------------------------------------------------------
    getXhrDataState: function (obj) {
      return j1.xhrDataState[obj];
    },
    // -------------------------------------------------------------------------
    // setXhrDomState()
    // Set the state of an element loaded via Xhr that is
    // successfully added to the DOM
    // -------------------------------------------------------------------------
    setXhrDomState: function (obj, stat) {
      j1.xhrDOMState[obj] = stat;
    },
    // -------------------------------------------------------------------------
    // getXhrDataState()
    // Returns the state of an element loaded via Xhr that is
    // successfully added to the DOM
    // -------------------------------------------------------------------------
    getXhrDOMState: function (obj) {
      return j1.xhrDOMState[obj];
    },
    // -------------------------------------------------------------------------
    // setMode()
    // Set the current mode of the site (web|app)
    // -------------------------------------------------------------------------
    setMode: function (mod) {
      mode = mod;
    },
    // -------------------------------------------------------------------------
    // getMode()
    // Returns the current mode of the site (web|app)
    // -------------------------------------------------------------------------
    getMode: function () {
      return mode;
    },
    // -------------------------------------------------------------------------
    // checkUserAgent()
    // Returns the name (UA) of the web browser
    // -------------------------------------------------------------------------
    checkUserAgent: function () {
      if (navigator.userAgent.search(ua_name) >= 0) {
        return true;
      } else {
        return false;
      }
    },
    // -------------------------------------------------------------------------
    // generateId()
    // Generate a unique (thread) id used by the logger
    // -------------------------------------------------------------------------
    generateId: function (length) {
     var result           = '';
     var characters       = 'abcdefghijklmnopqrstuvwxyz0123456789';
     var charactersLength = characters.length;
     for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
     }
     return result;
    },
    // -------------------------------------------------------------------------
    // getTrue()
    // Returns always true (for testing purposes)
    // -------------------------------------------------------------------------
    getTrue: function () {
      return true;
    },
    // -------------------------------------------------------------------------
    // getFalse()
    // Returns always false (for testing purposes)
    // -------------------------------------------------------------------------
    getFalse: function () {
      return false;
    },
    // -------------------------------------------------------------------------
    // goHome()
    // Redirect current page to the browser homepage
    // -------------------------------------------------------------------------
    goHome: function () {
      // most browsers
      if (typeof window.home == 'function') {
        window.home();
      } else if (document.all) {
        // for IE
        window.location.href = 'about:home';
      } else {
        window.location.href = 'about:blank';
      }
    },
    // -------------------------------------------------------------------------
    // goBack()
    // Redirect current page to last visited page (referrer)
    // -------------------------------------------------------------------------
    goBack: function () {
      // where visitor has come from
      window.location.href = document.referrer;
    }
  };
}) (j1, window);

{% comment %} NOTE: Unexpected token: punc (;) errors if compressed
--------------------------------------------------------------------------------
{% if production %}
  {{ cache | minifyJS }}
{% else %}
  {{ cache | strip_empty_lines }}
{% endif %}
{% assign cache = nil %}
-------------------------------------------------------------------------------- {% endcomment %}

{% endcapture %}
{% if production %}
  {{ cache | strip_empty_lines }}
{% else %}
  {{ cache | strip_empty_lines }}
{% endif %}
{% assign cache = nil %}
