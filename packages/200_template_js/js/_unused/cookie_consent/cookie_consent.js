/*
 # -----------------------------------------------------------------------------
 #  ~/js/cookie_consent/consent.js
 #  Provides Javascript core functions for J1 Cookie Consent module
 #  v2019-07-24
 #
 #  Product/Info:
 #  http://jekyll.one
 #
 #  Copyright (C) 2021 Juergen Adams
 #
 #  J1 Template is licensed under MIT License.
 #  See: https://github.com/jekyll-one-org/J1 Template/blob/master/LICENSE
 # -----------------------------------------------------------------------------
 #  NOTE:
 # -----------------------------------------------------------------------------
 #  TODO:
 # -----------------------------------------------------------------------------
*/

// -----------------------------------------------------------------------------
// ESLint shimming
// -----------------------------------------------------------------------------
/* eslint no-unused-vars: "off"                                               */
/* eslint no-undef: "off"                                                     */
/* eslint no-redeclare: "off"                                                 */
// -----------------------------------------------------------------------------


// -----------------------------------------------------------------------------
// Cookie Consent core registered as "cookieConsent"
// -----------------------------------------------------------------------------
module.exports = function cookie_consent (options) {

  // Global variables
  var logger                      = log4javascript.getLogger('j1.core.cookie-consent');
  var cookie_names                = j1.getCookieNames();
  const user_state_name           = cookie_names.user_state;
  const cookie_user_session_name  = cookie_names.user_session;
  var message                     = {};
  var user_session                = {};
  var user_state                  = {};
  var cookie_consent              = {};
  var current_user_data           = {};
  var logText;

  var cookie_consent = {
    'cookies_accepted': 'pending'
  };

  return {

    // -------------------------------------------------------------------------
    // Initialize cookie consent core
    // -------------------------------------------------------------------------
    init: function (options) {
      var cookies_accepted      = 'pending';
      var cookie_consent_exists = j1.existsCookie(user_state_name);
      var epoch                 = Math.floor(Date.now()/1000);
      var timestamp_now         = moment.unix(epoch).format('YYYY-MM-DD HH:mm:ss');

      var defaults = {
        autoEnable:   true,   // Set to true for cookies to be accepted automatically
        renewOnVisit: false,  // Renew the cookie upon revisit to website
        forceShow:    false,  // Force cookie consent to show regardless of user cookie preference
      };
      var settings = $.extend(defaults, options);

      if (cookie_consent_exists) {
        cookie_consent            = j1.readCookie(user_state_name);
        cookie_consent.timestamp  = timestamp_now;
        logger.info('cookie consent found: ' + cookie_consent.cookies_accepted);

        // Recalculate retention (days) for cookie consent
        var a    = moment(cookie_consent.created);
        var b    = moment(timestamp_now);
        var diff = a.diff(b, 'days');

        if (diff > 0) {
          cookie_consent.days_left = cookie_consent.days_left - diff;
        }
      } else {
        logger.info('cookie consent not found, initialize cookie');
        cookie_consent.created          = timestamp_now;
        cookie_consent.timestamp        = timestamp_now;
        cookie_consent.live_span        = 365;
        cookie_consent.days_left        = cookie_consent.live_span;
        cookie_consent.cookies_accepted = cookies_accepted;
        cookie_consent.whitelistedPages = settings.whitelistedPages;
      }

      // Update user state cookie

      // j1.writeCookie({
      //   name:    user_state_name,
      //   data:    cookie_consent,
      //   expires: cookie_consent.live_span
      // });

      j1.writeCookie({
        name:    user_state_name,
        data:    cookie_consent,
        expires: 365
      });

      var cookiesAccepted           = cookie_consent.cookies_accepted === 'accepted' ? true : false;
      var cookiesPending            = cookie_consent.cookies_accepted === 'pending' ? true : false;
      var cookiesDeclined           = cookie_consent.cookies_accepted === 'declined' ? true : false;
      var current_page              = window.location.pathname;
      var whitelisted               = (settings.whitelistedPages.indexOf(current_page) > -1);

      // Skip cookie consent dialog if Cookies already accepted
      // -------------------------------------------------------------------------
      if (cookiesAccepted) {
        logger.info('user accepted on cookies');

        // update sidebar for changed consent|theme data
        logger.info('update sidebar');
        user_state        = j1.readCookie(cookie_names.user_state);
        user_session      = j1.readCookie(cookie_names.user_session);
        current_user_data = j1.mergeData(user_session, user_state);
        j1.core.navigator.updateSidebar(current_user_data);

        // Display cookie (consent) icon
        $('#quickLinksCookieButton').css('display', 'block');
        logger.info('continue on requested page: ' + current_page);
        return;
      } else if (cookiesDeclined) {
        logger.info('user declined on cookies');

        // Skip cookie consent dialog if page whitelisted
        // ---------------------------------------------------------------------
        if (whitelisted) {
          logger.info('update user state cookie');

          // Update user state cookie

          // j1.writeCookie({
          //   name:    user_state_name,
          //   data:    cookie_consent,
          //   expires: cookie_consent.live_span
          // });

          j1.writeCookie({
            name:    user_state_name,
            data:    cookie_consent,
            expires: 365
          });

          // update sidebar for changed consent|theme data
          logger.info('update sidebar');
          user_state        = j1.readCookie(cookie_names.user_state);
          user_session      = j1.readCookie(cookie_names.user_session);
          current_user_data = j1.mergeData(user_session, user_state);
          j1.core.navigator.updateSidebar(current_user_data);

          // Hide cookie (consent) icon
          $('#quickLinksCookieButton').css('display', 'none');
          logger.info('page whitelisted, do nothing');
          logger.info('continue on requested page: ' + current_page);

          return;
        } // END if whitelisted
      } // END else if 'declined'

      // First visit, cookies are 'pending'
      if (cookiesPending) {
        logger.info('first visit detected, state: ' + cookie_consent.cookies_accepted);

        // update sidebar for changed consent|theme data
        logger.info('update sidebar');
        user_state        = j1.readCookie(cookie_names.user_state);
        user_session      = j1.readCookie(cookie_names.user_session);
        current_user_data = j1.mergeData(user_session, user_state);
        j1.core.navigator.updateSidebar(current_user_data);

        // Show cookie consent if configured for all pages
        if (settings.showConsentOnPending) {
          logger.info('first visit detected, enable cookie consent');
        } else {
          // Skip cookie consent if whitelisted
          if (whitelisted) {
            // Hide cookie (consent) icon
            $('#quickLinksCookieButton').css('display', 'none');
            logger.info('page whitelisted, do nothing');
            logger.info('continue on requested page: ' + current_page);

            return;
          } // END if whitelisted
        }
      }

      // Display cookie consent dialog
      // -----------------------------------------------------------------------
      var pageLoaded = setInterval(function() {
        if ( j1.adapter.cookie_consent.getState() === 'finished' && j1.getState() === 'finished' ) {
          logger.info('present cookie consent');
          $('#topFullCookieConsent').modal('show');
          // clear interval checking
          clearInterval(pageLoaded);
        } // END
      }, 50); // END setInterval

      message.type    = 'command';
      message.action  = 'module_initialized';
      message.text    = 'Module initialized successfully';
      j1.sendMessage( 'j1.core.cookie_consent', 'j1.adapter.cookie_consent', message );

      return;
    }, // END init


    // -------------------------------------------------------------------------
    // eventHandler: EventHandler for J1 Cookie Consent
    // Manage button click events for all BS Modals
    // See: https://www.nickang.com/add-event-listener-for-loop-problem-in-javascript/
    // -------------------------------------------------------------------------
    eventHandler: function (options) {
      var logger            = log4javascript.getLogger('j1.core.cookie-consent.eventHandler');
      var current_page      = window.location.pathname;
      var modalButtons      = document.querySelectorAll('a.btn');
      var appDetected       = j1.appDetected();
      // f() j1.authEnabled UNKNOWN with j1 adapter
      // var authClientEnabled = j1.authEnabled();
      var deleteOnDecline   = options.deleteOnDecline;
      var whitelistedPages  = options.whitelistedPages;
      var stopScrolling     = options.stopScrolling;
      var whitelisted;
      var json_data;


      logText = 'register button click events';
      logger.debug(logText);

      modalButtons.forEach(function(button, index) {
        button.addEventListener('click', function(e) {

          // CookieConsent policyButton
          // -------------------------------------------------------------------
          if (this.id === 'policyButton') {
            logger.debug('user clicked policyButton');
            // toggle|display cookie policy
            $('#cookiePolicyInfo').toggle( 'fast', function() {
              // toggle container classes
              $('#modal-footer').toggleClass('modal-footer-hidden modal-footer-show');
            });

            // return false behaves like preventDefault() to block
            // further event propagation (bubble up)
            return false;
          }

          // CookieConsent acceptButton
          // -------------------------------------------------------------------
          if (this.id === 'acceptButton') {
            logger.debug('user clicked acceptButton');

            // Set consent state
            cookie_consent = j1.readCookie(user_state_name);
            cookie_consent.cookies_accepted = 'accepted';

            // Update user state cookie

            // j1.writeCookie({
            //   name:    user_state_name,
            //   data:    cookie_consent,
            //   expires: cookie_consent.live_span
            // });

            j1.writeCookie({
              name:    user_state_name,
              data:    cookie_consent,
              expires: 365
            });

            // update sidebar for changed consent|theme data
            logger.info('update sidebar');
            user_state        = j1.readCookie(cookie_names.user_state);
            user_session      = j1.readCookie(cookie_names.user_session);
            current_user_data = j1.mergeData(user_session, user_state);
            j1.core.navigator.updateSidebar(current_user_data);

            // Display cookie icon
            $('#quickLinksCookieButton').css('display', 'block');

            return false;
          }

          // CookieConsent declineButton
          // -------------------------------------------------------------------
          if (this.id === 'declineButton') {
            logger.debug('user clicked declineButton');

            // Set consent state|current_page
            cookie_consent.cookies_accepted = 'declined';
            current_page = window.location.pathname;
            whitelisted  = (whitelistedPages.indexOf(current_page) > -1);

            // update sidebar for changed consent|theme data
            logger.info('update sidebar');
            user_state        = j1.readCookie(cookie_names.user_state);
            user_session      = j1.readCookie(cookie_names.user_session);
            current_user_data = j1.mergeData(user_session, user_state);
            j1.core.navigator.updateSidebar(current_user_data);

            if (deleteOnDecline) {
              // Delete cookies
              logger.warn('delete all cookies');
              j1.deleteCookie(user_state_name);
            }

            $('#quickLinksCookieButton').css('display', 'none');
            // Set route to home page if current page is NOT whitelisted
            if ( !whitelisted ) { window.location.href = '/'; }

            return false;
          }

          // revokeCookiesButton
          // -------------------------------------------------------------------
          if (this.id === 'revokeCookies') {
            logger.debug('user clicked revokeCookiesButton');

            current_page = window.location.pathname;
            whitelisted  = (whitelistedPages.indexOf(current_page) > -1);

            // Set consent state
            cookie_consent = j1.readCookie(user_state_name);
            cookie_consent.cookies_accepted = 'declined';

            // Update user state cookie

            // j1.writeCookie({
            //   name:    user_state_name,
            //   data:    cookie_consent,
            //   expires: cookie_consent.live_span
            // });

            j1.writeCookie({
              name:    user_state_name,
              data:    cookie_consent,
              expires: 365
            });

            // update sidebar for changed consent|theme data
            logger.info('update sidebar');
            user_state        = j1.readCookie(cookie_names.user_state);
            user_session      = j1.readCookie(cookie_names.user_session);
            current_user_data = j1.mergeData(user_session, user_state);
            j1.core.navigator.updateSidebar(current_user_data);

            // Hide cookie icon
            $('#quickLinksCookieButton').css('display', 'none');

            // Set route to home page if current page is NOT whitelisted
            if (!whitelisted) { window.location.href = '/'; }
          }

          // remainCookiesButton
          // -------------------------------------------------------------------
          if (this.id === 'remainCookies') {
            logger.debug('user clicked remainCookiesButton');
            return false;
          }
        });
      });

      // Register pre/post events for modal cookieRevokeCentralDanger
      // -----------------------------------------------------------------------
      $(document).on('shown.bs.modal','#cookieRevokeCentralDanger', function () {
        logger.debug('user opened modal: cookieRevokeCentralDanger');
      });

      $(document).on('hide.bs.modal','#cookieRevokeCentralDanger', function () {
        logger.debug('user closed cookieRevokeCentralDanger');
      });

      // Register pre/post events for modal topFullCookieConsent
      // -----------------------------------------------------------------------
      $(document).on('shown.bs.modal','#topFullCookieConsent', function () {
        if ( stopScrolling ) { $('body').addClass('stop-scrolling'); }
        //
        // place action here
        //
      });

      $(document).on('hide.bs.modal','#topFullCookieConsent', function () {
        logger.debug('user closed modal: topFullCookieConsent');
        $('body').removeClass('stop-scrolling');
      });

      logText = 'events registered';
      logger.debug(logText);

      return true;
    }, // END eventHandler


    // -------------------------------------------------------------------------
    // messageHandler: MessageHandler for J1 NAV module
    // Manage messages (paylods) send from other J1 modules
    // -------------------------------------------------------------------------
    messageHandler: function (sender, message) {
      var json_message = JSON.stringify(message, undefined, 2);

      logText = 'received message from ' + sender + ': ' + json_message;
      logger.debug(logText);

      // -----------------------------------------------------------------------
      //  Process commands|actions
      // -----------------------------------------------------------------------
      if ( message.type === 'command' && message.action === 'module_initialized' ) {
        //
        // Place handling of command|action here
        //
        logger.info(message.text);
      }

      //
      // Place handling of other command|action here
      //

      return true;
    }, // END messageHandler

    // -------------------------------------------------------------------------
    //  Set the current (processing) state of the module
    // -------------------------------------------------------------------------
    setState: function (stat) {
      j1.adapter.cookie_consent.state = stat;
    }, // END setState

    // -------------------------------------------------------------------------
    //  Returns the current (processing) state of the module
    // -------------------------------------------------------------------------
    getState: function () {
      return j1.adapter.cookie_consent.state;
    } // END state

  }; // END return
}(j1, window);
