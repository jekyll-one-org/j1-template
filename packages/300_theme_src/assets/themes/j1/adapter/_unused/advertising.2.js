---
regenerate:                             true
---

{% capture cache %}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/advertising.js
 # Liquid template to adapt advertising plugin
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
 #  advertising_options:  {{ advertising_options | debug }}
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
{% assign template_config      = site.data.j1_config %}
{% assign blocks               = site.data.blocks %}
{% assign modules              = site.data.modules %}

{% comment %} Set config data (settings only)
-------------------------------------------------------------------------------- {% endcomment %}
{% assign cookie_defaults      = modules.defaults.cookies.defaults %}
{% assign cookie_settings      = modules.cookies.settings %}
{% assign advertising_defaults = modules.defaults.advertising.defaults %}
{% assign advertising_settings = modules.advertising.settings %}

{% comment %} Set config options (settings only)
-------------------------------------------------------------------------------- {% endcomment %}
{% assign cookie_options       = cookie_defaults | merge: cookie_settings %}
{% assign advertising_options  = advertising_defaults | merge: advertising_settings %}

{% comment %} Variables
-------------------------------------------------------------------------------- {% endcomment %}
{% assign advertising           = advertising_options.enabled %}
{% assign advertising_provider  = advertising_options.provider %}

{% comment %} Detect prod mode
-------------------------------------------------------------------------------- {% endcomment %}
{% assign production = false %}
{% if environment == 'prod' or environment == 'production' %}
  {% assign production = true %}
{% endif %}

/*
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/advertising.js
 # J1 Adapter for advertising
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2023 Juergen Adams
 #
 # J1 Theme is licensed under the MIT License.
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
j1.adapter.advertising = (function (j1, window) {

{% comment %} Set global variables
-------------------------------------------------------------------------------- {% endcomment %}
var environment             = '{{environment}}';
var date                    = new Date();
var timestamp_now           = date.toISOString();
var gasScript               = document.createElement('script');
var adInitializerScript     = document.createElement('script');
var advertisingDefaults;
var aadvertisingSettings;
var advertisingOptions;
var frontmatterOptions;
var autoHideOnUnfilled;
var addBorderOnUnfilled;
var checkTrackingProtection;
var showErrorPageOnBlocked;
var adInitializerScriptText;
var tracking_protection;
var url;
var baseUrl;
var hostname;
var cookie_names;
var user_consent;
var advertisingProvider;
var publisherID;
var validPublisherID;
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
        module_name: 'j1.adapter.advertising',
        generated:   '{{site.time}}'
      }, options);

      // -----------------------------------------------------------------------
      // Global variable settings
      // -----------------------------------------------------------------------
      cookie_names          = j1.getCookieNames();
      user_consent          = j1.readCookie(cookie_names.user_consent);
      url                   = new liteURL(window.location.href);
      hostname              = url.hostname;

      // create settings object from frontmatter
      frontmatterOptions      = options != null ? $.extend({}, options) : {};

      advertisingDefaults     = $.extend({},   {{advertising_defaults | replace: 'nil', 'null' | replace: '=>', ':' }});
      aadvertisingSettings    = $.extend({},   {{advertising_settings | replace: 'nil', 'null' | replace: '=>', ':' }});
      advertisingOptions      = $.extend(true, {}, advertisingDefaults, aadvertisingSettings);

      autoHideOnUnfilled      = advertisingOptions.google.autoHideOnUnfilled;
      addBorderOnUnfilled     = advertisingOptions.google.addBorderOnUnfilled;
      checkTrackingProtection = advertisingOptions.google.checkTrackingProtection;
      showErrorPageOnBlocked  = advertisingOptions.google.showErrorPageOnBlocked;

      var dependencies_met_page_ready = setInterval (function (options) {
        var pageState     = $('#no_flicker').css("display");
        var pageVisible   = (pageState == 'block') ? true: false;
        var atticFinished = (j1.adapter.attic.getState() == 'finished') ? true: false;

        if (j1.getState() === 'finished' && pageVisible && atticFinished) {
        {% if advertising %}

          {% case advertising_provider %}
          {% when "google" %}
          // [INFO   ] [j1.adapter.advertising                  ] [ place provider: Google Adsense ]

          _this = j1.adapter.advertising;
          logger = log4javascript.getLogger('j1.adapter.advertising.google');

          // initialize state flag
          _this.setState('started');
          logger.debug('\n' + 'state: ' + _this.getState());
          logger.info('\n' + 'module is being initialized');

          publisherID         = advertisingOptions.google.publisherID;
          advertisingProvider = 'Google Adsense';
          validPublisherID    = (publisherID.includes('your')) ? false : true;

          if (!validPublisherID) {
            logger.warn('\n' + 'invalid publisherID detected for Google Adsense (GAS): ' + publisherID);
            logger.info('\n' + 'skip initialization for provider: ' + advertisingProvider);
            return false;
          } else {
            logger.info('\n' + 'use publisherID for Google Adsense (GAS): ' + publisherID);
          }

          if (user_consent.personalization) {
            // place all ads configured for the page
            // NOTE: currently NOT implemented/used
            // -----------------------------------------------------------------
            // _this.place_ads();

            // add GAS API (Google Adsense) dynamically in head section
            // loaded async
            // -----------------------------------------------------------------
            logger.info('\n' + 'add Google Adsense (GAS) API in section: head');
            gasScript.async = true;
            gasScript.id    = 'gas-api';
            gasScript.src   = '//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
            gasScript.setAttribute('data-ad-client', publisherID);
            document.head.appendChild(gasScript);

            // setup monitor for state changes on all ads configured
            // ---------------------------------------------------------------
            logger.debug('\n' + 'setup monitoring');
            _this.monitor_ads();

            // run protection check
            // -------------------------------------------------------------------
            if (checkTrackingProtection) {
              logger.debug('\n' + 'run checks for tracking protection');

              _this.check_tracking_protection();
              var dependencies_met_tracking_check_ready = setInterval (function (options) {
                if (typeof tracking_protection !== 'undefined' ) {
                  var browser_tracking_feature = navigator.DoNotTrack;

                  if (!tracking_protection && !browser_tracking_feature) {
                    logText = '\n' + 'tracking protection: disabled';
                    logger.info(logText);
                  } else {
                    logText = '\n' + 'tracking protection: enabled';
                    logger.warn(logText);

                    if (showErrorPageOnBlocked) {
                      logger.error('\n' + 'redirect to error page (blocked content): HTML-447');
                      // redirect to error page: blocked content
                      window.location.href = '/447.html';
                    }
                  }
                }
                clearInterval(dependencies_met_tracking_check_ready);
              }, 25);
            } else {
              // no protection check enabled

              // setup monitor for state changes on all ads configured
              // ---------------------------------------------------------------
              logger.info('\n' + 'setup monitoring');
              _this.monitor_ads();

              _this.setState('finished');
              logger.debug('\n' + 'state: ' + _this.getState());
              logger.info('\n' + 'module initialized successfully');
              clearInterval(dependencies_met_tracking_check_ready);
            }

          } else {
            // manage GAD cookies if no consent is given|rejected
            // -----------------------------------------------------------------
            var gasCookies = j1.findCookie('__ga');
            logger.warn('\n' + 'consent on cookies disabled for personalization');
            logger.warn('\n' + 'initialization of module advertising skipped');

            // remove cookies on invalid GAS config or left from a previous
            // session/page view if they exists
            // ---------------------------------------------------------------------
            gasCookies.forEach(function (item) {
              // Remove cookies from Google Ads
              if (hostname == 'localhost') {
                j1.removeCookie({ name: item, domain: false, secure: false });
              } else {
                j1.removeCookie({ name: item, domain: '.' + hostname, secure: false });
              }
            });

            // manage tracking protection
            // -----------------------------------------------------------------
            if (checkTrackingProtection) {
              if (!user_consent.personalization) {
                logText = '\n' + 'consent on cookies disabled for personalization';
                logger.warn(logText);

                if (showErrorPageOnBlocked) {
                  logger.error('\n' + 'redirect to error page (blocked content): HTML-447');
                  // redirect to error page: blocked content
                  window.location.href = '/448.html';
                }
              }
            }

          } // END if user_consent.personalization

          {% when "custom" %}
          // [INFO   ] [j1.adapter.advertising                  ] [ place provider: Custom Provider ]
          {% endcase %}
          // [INFO   ] [j1.adapter.advertising                  ] [ end processing ]
          {% else %}
            var ads_found = document.getElementsByClassName('adsbygoogle').length;
            logger = log4javascript.getLogger('j1.adapter.advertising.google');
            logger.warn('\n' + 'found ads in page: #' + ads_found);
            logger.warn('\n' + 'no ads initialized, advertising disabled');
          {% endif %}

          clearInterval(dependencies_met_page_ready);
        }
      }, 25);

    return;
    }, // END init

    // -------------------------------------------------------------------------
    // monitor_ads()
    // monitor for state changes on the ad placed in pages (if any)
    //
    // NOTE: Check visibility state of the adSlot to prevent multiple
    // processing of the same slot
    // -------------------------------------------------------------------------
    monitor_ads: function () {
      var logger = log4javascript.getLogger('j1.adapter.advertising.monitor.ads');

      $('.adsbygoogle').attrchange({
        trackValues: true,
        callback: function (event) {
          if (event.newValue === 'unfilled') {
            var elm             = event.target.dataset;
            var adSlotIsVisible = $('.adsbygoogle').is(":visible");
            if (adSlotIsVisible) {
              logger.warn('\n' + 'found ad in state ' + event.newValue + ' on slot: ' + elm.adSlot);
              if (addBorderOnUnfilled) {
                $('.adsbygoogle').addClass('border--dotted');
              }

              if (autoHideOnUnfilled) {
                logger.info('\n' + ' hide ad for slot: ' + elm.adSlot);
                $('.adsbygoogle').hide();
              }
            }
          } else {
            // logger.info('\n' + 'found ad in state ' + event.newValue + ' on slot: ' + elm.adSlot);
          }
        }
      });
    },

    // -------------------------------------------------------------------------
    // check_tracking_protection()
    // detect if a user is using tracking protection
    // NOTE:
    // Firefox uses a list obtained from 'https://disconnect.me/trackerprotection'
    // for its tracking protection. The checker use an image loaded from a
    // domain that is on that list (facebook.com), and an image that will
    // exist (tracking pixel).
    //
    // See for more details:
    //  https://stackoverflow.com/questions/33959324/how-to-detect-if-a-user-is-using-tracking-protection-in-firefox-42
    // -------------------------------------------------------------------------
    check_tracking_protection: function () {
      var logger = log4javascript.getLogger('j1.adapter.advertising.monitor.tracking');

      logText = '\n' + 'check for trackingprotection';
      logger.info(logText);

      function checkTrackingProtection() {
        if (!checkTrackingProtection.promise) {
          checkTrackingProtection.promise = new Promise(function(resolve, reject) {

            var time = Date.now();
            var img = new Image();
            img.onload = resolve;
            img.onerror = function() {
              if ((Date.now() - time) < 50) {
                reject(new Error("Rejected."));
              } else {
                resolve(new Error("Takes too long."));
              }
            };
            img.src = '//www.facebook.com/tr/';
          }).then((result) => {
            tracking_protection = false;
          }).catch(e => {
            tracking_protection = true;
            logger.debug('\n' + 'detection details: ' + e);
          });
        }
      }
      checkTrackingProtection();
    }, // END check_tracking_protection

    // -------------------------------------------------------------------------
    // place_ads()
    // place ads configured|enabled
    // -------------------------------------------------------------------------
    place_ads: function () {

      logText = '\n' + 'ads are being placed';
      logger.info(logText);

      // START loadig ads

      // END place ads
    },

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