/*
 # -----------------------------------------------------------------------------
 #  ~/assets/themes/j1/modules/cookiebar/js/cookiebar.js
 #  Provides Javascript functions for jQuery cookiebar
 #
 #  Product/Info:
 #  http://jekyll.one
 #  http://www.primebox.co.uk/projects/jquery-cookiebar/
 #
 #  Copyright (C) 2021 Juergen Adams
 #  Copyright (C) 2016 Ant Parsons (primebox.co.uk)
 #
 #  J1 Template is licensed under the MIT License.
 #  See: https://github.com/jekyll-one/J1 Template/blob/master/LICENSE
 #  cookiebar is licensed under Creative Commons Attribution 3.0 Unported License.
 #  See: http://creativecommons.org/licenses/by/3.0/
 #
 # -----------------------------------------------------------------------------
 #  NOTE:
 #  cb cookie disabled. Instead, j1 user state cookie is used.
 # -----------------------------------------------------------------------------
 #  TODO:
 #  Module needs to be rewritten to use j1 native BS modals.
 # -----------------------------------------------------------------------------
*/

// -----------------------------------------------------------------------------
// ESLint shimming
// -----------------------------------------------------------------------------
/* eslint no-unused-vars: "off"                                               */
/* eslint no-undef: "off"                                                     */
/* eslint no-redeclare: "off"                                                 */
/* global window                                                              */

// TODO:

// -----------------------------------------------------------------------------
// cookiebar plugin registered as 'cookieBar' (window|root)
// -----------------------------------------------------------------------------

(function ($) {

  $.cookieBar = function (opt,val) {

    var options             = $.extend(defaults,options);
    var logger              = log4javascript.getLogger('j1.cookiebar');
    var cookie_names        = j1.getCookieNames();
    const cookie_user_state = cookie_names.user_state;
    var user_state          = {};

    var defaults = {
      renewOnVisit:       false,                                                // Renew the cookie upon revisit to website
      forceShow:          false,                                                // Force cookiebar to show regardless of user cookie preference
      domain:             String(window.location.hostname),                     // Location of privacy policy
      referrer:           String(document.referrer)                             // Where visitor has come from
    };

    var options = $.extend(defaults,opt);

    var dependencies_met_page_ready = setInterval (function (options) {
      if ( j1.getState() == 'finished' ) {

        // Set|Detect J1 UserState
        user_state_detected = j1.existsCookie (cookie_user_state);
        if ( user_state_detected ) {
          logger.info('User state cookie found');
          user_state = j1.readCookie(cookie_user_state);
        } else {
          logger.error('User state NOT cookie found');
        }

        // Show cookie (consent) icon
        if (user_state.cookies_accepted == 'accepted') {
          // Display cookie (consent) icon
          $('#quickLinksCookieButton').css('display', 'block');
        }

        // Hide cookie (consent) icon
        if (user_state.cookies_accepted == 'pending' || user_state.cookies_accepted == 'declined' ) {
          // Display cookie (consent) icon
          $('#quickLinksCookieButton').css('display', 'none');
        }

        // Sets expiration date for cookie
        // var expireDate = new Date();
        // expireDate.setTime(expireDate.getTime()+(options.expireDays*86400000));
        // expireDate = expireDate.toGMTString();

        if (
//        options.forceShow ||
          user_state.cookies_accepted == 'pending' ||
          user_state.cookies_accepted == 'declined' ||
          user_state.cookies_accepted == '')
        {
          $('#topFullCookieConsent').modal('show');
        }
        clearInterval(dependencies_met_page_ready);
      }
    });
  };

  // -------------------------------------------------------------------------
  // eventHandler: EventHandler for J1 Cookie Consent
  // Manage button click events for all BS Modals
  // See: https://www.nickang.com/add-event-listener-for-loop-problem-in-javascript/
  // -------------------------------------------------------------------------
  $.cookieBar.eventHandler = function(options) {
    var logger              = log4javascript.getLogger('cookiebar.eventHandler');
    var current_page        = window.location.pathname;
    var modalButtons        = document.querySelectorAll('a.btn');
    var appDetected         = j1.appDetected();
    var deleteOnDecline     = options.deleteOnDecline;
    var deleteOnDecline     = true;
    var whitelistedPages    = options.whitelistedPages;
    var whitelistedPages    = [];
    var stopScrolling       = options.stopScrolling;
    var cookie_names        = j1.getCookieNames();
    const cookie_user_state = cookie_names.user_state;
    var user_state          = {};
    var cookie_consent      = j1.readCookie(cookie_user_state);
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
          cookie_consent = j1.readCookie(cookie_user_state);
          cookie_consent.cookies_accepted = 'accepted';

          // Update user state cookie

          // j1.writeCookie({
          //   name:    cookie_user_state,
          //   data:    cookie_consent,
          //   expires: cookie_consent.live_span
          // });

          j1.writeCookie({
            name:    cookie_user_state,
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
            j1.deleteCookie(cookie_user_state);
          }

          $('#quickLinksCookieButton').css('display', 'none');
          // Set route to home page if current page is NOT whitelisted
          if ( !whitelisted ) { j1.goHome(); }

          return false;
        }

        // revokeCookiesButton
        // -------------------------------------------------------------------
        if (this.id === 'revokeCookies') {
          logger.debug('user clicked revokeCookiesButton');

          current_page = window.location.pathname;
          whitelisted  = (whitelistedPages.indexOf(current_page) > -1);

          // Set consent state
          cookie_consent = j1.readCookie(cookie_user_state);
          cookie_consent.cookies_accepted = 'declined';

          // Update user state cookie

          // j1.writeCookie({
          //   name:    cookie_user_state,
          //   data:    cookie_consent,
          //   expires: cookie_consent.live_span
          // });

          j1.writeCookie({
            name:    cookie_user_state,
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
          if (!whitelisted) { j1.goHome(); }
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
  }; // END eventHandler

})( jQuery );
