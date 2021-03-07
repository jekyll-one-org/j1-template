/*
 # -----------------------------------------------------------------------------
 #  ~/js/cookie_consent/consent.js
 #  Provides Javascript functions for J1 Cookie Consent module
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
// Cookie Consent plugin registered as "cookieConsent"
// -----------------------------------------------------------------------------

module.exports = ( function ($) {

  $.cookieConsent = function (options, val) {

    var defaults = {
      autoEnable:           true,   // Set to true for cookies to be accepted automatically
      renewOnVisit:         false,  // Renew the cookie upon revisit to website
      forceShow:            false,  // Force cookie consent to show regardless of user cookie preference
    };

    // // Manage button click events for all modals
    // // See: https://www.nickang.com/add-event-listener-for-loop-problem-in-javascript/
    // var modalsLoaded = setInterval(function() {
    //   if ( j1.cookieConsent.state() === 'finished' ) {
    //     var current_page = window.location.pathname;
    //     var modalButtons = document.querySelectorAll('a.btn');
    //     var user_state   = j1.getUserStateFromCookie();
    //     var app_detected = j1.existsCookie ( 'j1.web.session' );
    //
    //     if ( app_detected ) { web_session_state = j1.getWebSessionCookie(); }
    //
    //     // Manage button click events for modal "topFullCookieConsent"
    //     // ---------------------------------------------------------------------
    //     $(document).on('shown.bs.modal','#topFullCookieConsent', function (e) {
    //       //e.stopPropagation();
    //
    //       user_state = j1.getUserStateFromCookie();
    //       if ( app_detected ) {
    //         web_session_state = j1.getWebSessionCookie();
    //       }
    //
    //       if (options.stopScrolling) { $('body').addClass('stop-scrolling'); }
    //
    //       modalButtons.forEach(function(button, index) {
    //         button.addEventListener('click', function(e) {
    //           //e.stopPropagation();
    //
    //           // policyButton
    //           // ---------------------------------------------------------------
    //           if (this.id === 'policyButton') {
    //             logger.info('User clicked policyButton');
    //             // toggle|display cookie policy
    //             $('#cookiePolicyInfo').toggle( 'fast', function() {
    //               // toggle container classes
    //               $('#modal-footer').toggleClass('modal-footer-hidden modal-footer-show');
    //             });
    //           }
    //           // acceptButton
    //           // ---------------------------------------------------------------
    //           if (this.id === 'acceptButton') {
    //             logger.info('User clicked acceptButton');
    //
    //             // Update user state|web session cookie
    //             user_state.cookies_accepted     = 'accepted';
    //             user_state.status               = 'active';
    //             user_state.provider_permissions = 'public'; //default
    //
    //             if ( app_detected ) {
    //               web_session_state = j1.getWebSessionCookie();
    //               user_state.provider_permissions    = web_session_state.provider_permissions;  // overwritten by middleware
    //               web_session_state.cookies_accepted = user_state.cookies_accepted; // update cookie state
    //               web_session_state.writer = 'web';
    //               j1.setWebSessionCookie( web_session_state );
    //               json_data = JSON.stringify( web_session_state );
    //               logger.info( 'WebSession data: ' + json_data );
    //             }
    //             j1.setUserStateCookie( user_state );
    //
    //             // Update sidebar|Cookies
    //             j1.replaceMacros( user_state );
    //
    //             // Show signin|cookie icon
    //             if ( j1.Navigator.appDetected() && j1.Navigator.authClientEnabled() ) { $('#quickLinksSignInOutButton').css('display', 'block'); }
    //             $('#quickLinksCookieButton').css('display', 'block'); // display cookie icon
    //             return true;
    //             current_page = window.location.pathname;
    //             window.location.href = current_page;
    //           }
    //           // declineButton
    //           // ---------------------------------------------------------------
    //           if (this.id === 'declineButton') {
    //             logger.info('User clicked declineButton');
    //
    //             current_page = window.location.pathname;
    //             whitelisted  = (options.whitelisted_pages.indexOf(current_page) > -1);
    //
    //             // Update user state|web session cookie
    //             user_state.cookies_accepted     = 'declined';
    //             user_state.status               = 'pending';
    //             user_state.provider_permissions = 'whitelisted';  // whitelisted pages only
    //
    //             if ( app_detected ) {
    //               web_session_state.cookies_accepted     = user_state.cookies_accepted;  // update cookie state
    //               web_session_state.provider_permissions = user_state.provider_permissions  // update permissions
    //               web_session_state.writer = 'web';
    //               j1.setWebSessionCookie( web_session_state );
    //               json_data = JSON.stringify( web_session_state );
    //               logger.info( 'WebSession data: ' + json_data );
    //             }
    //             j1.setUserStateCookie( user_state );
    //
    //             // Update sidebar|Cookies
    //             j1.replaceMacros( user_state );
    //
    //             // Hide signin|cookie icon
    //             if ( j1.Navigator.appDetected() && j1.Navigator.authClientEnabled() ) { $('#quickLinksSignInOutButton').css('display', 'none'); }
    //             $('#quickLinksCookieButton').css('display', 'none');
    //             // Set route to home page if current page is NOT whitelisted
    //             if ( !whitelisted ) { window.location.href = '/'; }
    //           }
    //         });
    //       });
    //     });
    //
    //     // Manage button click events for modal "cookieRevokeCentralDanger"
    //     // -----------------------------------------------------------------
    //     $(document).on('shown.bs.modal','#cookieRevokeCentralDanger', function (e) {
    //       //e.stopPropagation();
    //
    //       modalButtons.forEach(function(button, index) {
    //         button.addEventListener('click', function(e) {
    //           //e.stopPropagation();
    //
    //           // revokeCookiesButton
    //           // ---------------------------------------------------------------
    //           if (this.id === 'revokeCookies') {
    //             logger.info('User clicked revokeCookiesButton');
    //
    //             current_page = window.location.pathname;
    //             whitelisted  = (options.whitelisted_pages.indexOf(current_page) > -1);
    //
    //             // Update user state|web session cookie
    //             user_state.status               = 'pending';
    //             user_state.cookies_accepted     = 'declined';
    //             user_state.provider_permissions = 'whitelisted';
    //
    //             if ( app_detected ) {
    //               web_session_state                       = j1.getWebSessionCookie();
    //               web_session_state.cookies_accepted      = user_state.cookies_accepted;
    //               web_session_state.provider_permissions  = user_state.provider_permissions;
    //               if ( web_session_state.authenticated === 'true' ) {
    //                 user_state.provider_membership        = web_session_state.provider_membership;
    //               } else {
    //                 user_state.provider_membership        = "guest";
    //               }
    //               web_session_state.writer = 'web';
    //               j1.setWebSessionCookie( web_session_state );
    //               json_data = JSON.stringify( web_session_state );
    //               logger.info( 'WebSession data: ' + json_data );
    //             }
    //             j1.setUserStateCookie( user_state );
    //
    //             // Update sidebar|Cookies
    //             j1.replaceMacros( user_state );
    //
    //             // Hide signin|cookie icon
    //             if ( j1.Navigator.appDetected() && j1.Navigator.authClientEnabled() ) { $('#quickLinksSignInOutButton').css('display', 'none'); }
    //             $('#quickLinksCookieButton').css('display', 'none');
    //             // Set route to home page if current page is NOT whitelisted
    //             if ( !whitelisted ) { window.location.href = '/'; }
    //           }
    //           // remainCookiesButton
    //           // ---------------------------------------------------------------
    //           if (this.id === 'remainCookies') {
    //             logger.info('User clicked remainCookiesButton');
    //             return;
    //           }
    //         });
    //       });
    //     });
    //
    //     // Manage post events on modal "topFullCookieConsent"
    //     // ---------------------------------------------------------------------
    //     $(document).on('hide.bs.modal','#topFullCookieConsent', function (e) {
    //       //e.stopPropagation();
    //       logger.info('User closed topFullCookieConsent');
    //
    //       user_state   = j1.getUserStateFromCookie();
    //       app_detected = j1.existsCookie ( 'j1.web.session' );
    //       if ( app_detected ) { web_session_state = j1.getWebSessionCookie(); }
    //       $('body').removeClass('stop-scrolling');
    //     });
    //     // Manage post events on modal "cookieRevokeCentralDanger"
    //     // ---------------------------------------------------------------------
    //     $(document).on('hidden.bs.modal','#cookieRevokeCentralDanger', function (e) {
    //       //e.stopPropagation();
    //       logger.info('User closed cookieRevokeCentralDanger');
    //     });
    //
    //     // clear interval checking
    //     clearInterval(modalsLoaded);
    //   } // END Manage cookie consent dialog
    // }, 50); // END setInterval

    var options           = $.extend(defaults, options);
    var logger            = log4javascript.getLogger('j1.cookieConsent.core');
    var user_state        = {};
    var web_session_state = {};
    var app_detected      = j1.existsCookie ( 'j1.web.session' );
    var current_page;
    var whitelisted;

    user_state_detected   = j1.existsCookie ( 'j1.user.state' );

    if ( user_state_detected ) {
      logger.info('Read User state cookie');
      user_state = j1.getUserStateFromCookie();
      logger.info('Found cookie consent: ' + user_state.cookies_accepted);
    } else {
      logger.error('User state cookie missing');
    }

    // Skip cookie consent dialog if Cookies already accepted
    // -------------------------------------------------------------------------
    if ( user_state.cookies_accepted == 'accepted' ) {
      logger.info('User accepted cookies');

      user_state.status                     = 'active';

      if ( app_detected ) {
        web_session_state                   = j1.getWebSessionCookie();
        web_session_state.cookies_accepted  = user_state.cookies_accepted;
        user_state.provider_permissions     = web_session_state.provider_permissions;
        if ( web_session_state.authenticated === 'false' ) {
          user_state.provider_membership    = "guest"; } else {
          user_state.provider_membership    = web_session_state.provider_membership;
        }
        web_session_state.writer = 'web';
        j1.setWebSessionCookie( web_session_state );
        json_data = JSON.stringify( web_session_state );
        logger.info( 'WebSession data: ' + json_data );
      }

      // Update sidebar|quicklinks
      j1.replaceMacros( user_state );

      $('#quickLinksCookieButton').css('display', 'block'); // display cookie icon
      logger.info('Continue on requested page');
      return true;
    } else {
      current_page = window.location.pathname;
      whitelisted  = (options.whitelisted_pages.indexOf(current_page) > -1);

      // Skip cookie consent dialog if page whitelisted
      // -----------------------------------------------------------------------
      if ( whitelisted && user_state.cookies_accepted == 'declined' ) {

        // Update sidebar|quicklinks
        user_state.status               = 'pending';
        user_state.provider_permissions = 'whitelisted';

        if ( app_detected ) {
          web_session_state                   = j1.getWebSessionCookie();
          web_session_state.cookies_accepted  = user_state.cookies_accepted;
          if ( web_session_state.authenticated === 'false' ) {
            user_state.provider_membership    = "guest"; } else {
            user_state.provider_membership    = web_session_state.provider_membership;
          }
          web_session_state.writer = 'web';
          j1.setWebSessionCookie( web_session_state );
          json_data = JSON.stringify( web_session_state );
          logger.info( 'WebSession data: ' + json_data );
        }

        j1.setUserStateCookie( user_state );
        j1.replaceMacros( user_state );

        // Hide cookie icon
        $('#quickLinksCookieButton').css('display', 'none');
        logger.info('Page whitelisted. Do nothing');
        logger.info('Continue on requested page');
        return;
      }
      logger.info('Enable cookie consent');

      // Display cookie consent dialog
      // -----------------------------------------------------------------------
      logger.info('Present cookie consent');
      var pageLoaded = setInterval(function() {
        if ( j1.cookieConsent.state() === 'finished' ) {
          $('#topFullCookieConsent').modal('show');
          // clear interval checking
          clearInterval(pageLoaded);
        } // END
      }, 50); // END setInterval
    } // END else (cookie consent shown)

  }; // END cookieConsent

})(jQuery);
