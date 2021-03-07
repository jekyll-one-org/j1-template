/*
 # -----------------------------------------------------------------------------
 #  ~/js/cookie_consent/consent.js
 #  Provides Javascript core functions for J1 Cookie Consent module
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
// Cookie Consent core registered as "cookieConsent"
// -----------------------------------------------------------------------------
cookieConsent = (function (j1, window) {

  return {

    // -------------------------------------------------------------------------
    // Initialize cookieConsent core
    // -------------------------------------------------------------------------
    init: function ( options ) {

      var state = 'not started';
      var logger;
      var logText;

      var defaults = {
        autoEnable:           true,   // Set to true for cookies to be accepted automatically
        renewOnVisit:         false,  // Renew the cookie upon revisit to website
        forceShow:            false,  // Force cookie consent to show regardless of user cookie preference
      };

      var options             = $.extend(defaults, options);
      var appDetected         = j1.existsCookie ( 'j1.web.session' );
      var user_state_detected = j1.existsCookie ( 'j1.user.state' );
      var authClientEnabled   = j1.Navigator.authClientEnabled();
      var user_state          = {};
      var web_session_state   = {};
      var current_page;
      var whitelisted;

      logger = log4javascript.getLogger('j1.cookieConsent.core');

      if ( user_state_detected ) {
        logger.info('Read User state cookie');
        user_state = j1.getUserStateFromCookie();
        logger.info('Found cookie consent: ' + user_state.cookies_accepted);
      } else {
        logger.error('User state cookie missing');
      }

      // Skip cookie consent dialog if Cookies already 'accepted'
      // -----------------------------------------------------------------------
      if ( user_state.cookies_accepted == 'accepted' ) {
        logger.info('User accepted cookies');

        // Update user state|web session cookie
        user_state.status               = 'active';
        user_state.provider_permissions = 'public'; //default
        user_state.provider_membership  = "guest";  //default

        if ( appDetected ) {
          web_session_state                  = j1.getWebSessionCookie();
          web_session_state.cookies_accepted = user_state.cookies_accepted;

          // Overload middleware settings
          if ( authClientEnabled && web_session_state.authenticated === 'false' ) {
            web_session_state.provider_permissions = user_state.provider_permissions;
            web_session_state.provider_membership  = user_state.provider_membership;
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
      } // END if 'accepted'

      // Check whitelisted pages if Cookies 'declined'
      // -----------------------------------------------------------------------
      if ( user_state.cookies_accepted == 'declined' ) {
        current_page = window.location.pathname;
        whitelisted  = (options.whitelisted_pages.indexOf(current_page) > -1);

        // Skip cookie consent dialog if page whitelisted
        // ---------------------------------------------------------------------
        if ( whitelisted ) {
          // Update sidebar|quicklinks
          user_state.status               = 'pending';
          user_state.provider_permissions = 'whitelisted';
          user_state.provider_membership  = "guest";        //default

          if ( appDetected  ) {
            web_session_state                   = j1.getWebSessionCookie();
            web_session_state.cookies_accepted  = user_state.cookies_accepted;

            // Overload middleware settings
            if ( authClientEnabled && web_session_state.authenticated === 'false' ) {
              web_session_state.provider_permissions = user_state.provider_permissions;
              web_session_state.provider_membership  = user_state.provider_membership;
            } else if ( authClientEnabled && web_session_state.authenticated === 'true' ) {
              web_session_state.provider_permissions = user_state.provider_permissions;
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
        } // END if whitelisted
      } else {
        logger.info('Display cookie consent');

        // Display cookie consent dialog
        // ---------------------------------------------------------------------
        logger.info('Present cookie consent');
        var pageLoaded = setInterval(function() {
          if ( j1.cookieConsent.state() === 'finished' ) {
            $('#topFullCookieConsent').modal('show');
            // clear interval checking
            clearInterval(pageLoaded);
          } // END
        }, 50); // END setInterval
      } // END else if 'declined'

    }, // END init

    // -------------------------------------------------------------------------
    //  returns the current (processing) state of the module
    // -------------------------------------------------------------------------
    state: function () {
      return state;
    }

  }; // END return
})(j1, window);
