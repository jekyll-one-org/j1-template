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
module.exports = function cookie_consent ( options ) {

  // Global variables
  var message           = {};
  var j1_cookie_names   = j1.getCookieNames();

  var cookie_consent    = {
    'cookies_accepted': 'pending'
  };

  return {

    // -------------------------------------------------------------------------
    // Initialize cookieConsent core
    // -------------------------------------------------------------------------
    init: function ( options ) {
      var logger          = log4javascript.getLogger('j1.core.cookie_consent');
      var state           = 'not started';
      var current_consent = j1.getCookieConsent();
      var options;
      var logText;

      var defaults = {
        autoEnable:   true,   // Set to true for cookies to be accepted automatically
        renewOnVisit: false,  // Renew the cookie upon revisit to website
        forceShow:    false,  // Force cookie consent to show regardless of user cookie preference
      };
      options                   = $.extend(defaults, options);

      if ( current_consent ) {
        cookie_consent = current_consent;
        logger.info('Found cookie consent: ' + current_consent.cookies_accepted);
      } else {
        logger.info('User state cookie missing. Initialize cookie');
        j1.setCookieConsent( cookie_consent );
      }

      var cookiesAccepted           = cookie_consent.cookies_accepted === 'accepted' ? true : false;
      var cookiesPending            = cookie_consent.cookies_accepted === 'pending' ? true : false;
      var cookiesDeclined           = cookie_consent.cookies_accepted === 'declined' ? true : false;
      var current_page              = window.location.pathname;
      var whitelisted               = (options.whitelistedPages.indexOf(current_page) > -1);

      // Skip cookie consent dialog if Cookies already accepted
      // -------------------------------------------------------------------------
      if ( cookiesAccepted ) {
        logger.info('User accepted on cookies');

        // // Set consent state
        // cookie_consent.cookies_accepted = 'accepted';
        //
        // logger.info('Update cookie consent');
        // j1.setCookieConsent( cookie_consent );

        // display cookie icon
        $('#quickLinksCookieButton').css('display', 'block');
        logger.info('Continue on requested page: ' + current_page);
        return;
      } else if ( cookiesDeclined ) {

        logger.info('User declined on cookies');
        // Set consent state
        cookie_consent.status = 'declined';

        logger.info('Update cookie consent');
        j1.setCookieConsent( cookie_consent );

        // Hide cookie icon
        $('#quickLinksCookieButton').css('display', 'none');
        // Skip cookie consent dialog if page whitelisted
        // ---------------------------------------------------------------------
        if ( whitelisted ) {

          logger.info('Page whitelisted. Do nothing');
          logger.info('Continue on requested page: ' + current_page);

          return;
        } // END if whitelisted
      } // END else 'declined'

      if ( cookiesPending ) {
        // Set consent state
        cookie_consent.status = 'pending';

        logger.info('First visit detected. State: pending');

        if ( options.showConsentOnPending ) {
          logger.info('First visit detected. Enable cookie consent');
        } else {
          if ( whitelisted ) {
            // Hide cookie icon
            $('#quickLinksCookieButton').css('display', 'none');
            logger.info('First visit detected. Skip cookie consent');
            logger.info('Page whitelisted. Do nothing');
            logger.info('Continue on requested page: ' + current_page);
            return;
          } // END if whitelisted
        }
      }

      // Display cookie consent dialog
      // -----------------------------------------------------------------------
      var pageLoaded = setInterval(function() {
        if ( j1.adapter.cookie_consent.state() === 'finished' && j1.state() === 'finished' ) {
          logger.info('Present cookie consent');
          $('#topFullCookieConsent').modal('show');
          // clear interval checking
          clearInterval(pageLoaded);
        } // END
      }, 50); // END setInterval

      message.type    = 'command'
      message.action  = 'module_initialized'
      message.text    = 'Module initialized successfully'
      j1.sendMessage( 'j1.core.cookie_consent', 'j1.adapter.cookie_consent', message );

      return;
    }, // END init

    // -------------------------------------------------------------------------
    // messageHandler: MessageHandler for J1 NAV module
    // Manage messages (paylods) send from other J1 modules
    // -------------------------------------------------------------------------
    messageHandler: function ( sender, message ) {
      var json_message = JSON.stringify(message, undefined, 2);

      logText = 'Received message from ' + sender + ': ' + json_message;
      logger.debug(logText);

      // -----------------------------------------------------------------------
      //  Process commands|actions
      // -----------------------------------------------------------------------
      if ( message.type === 'command' && message.action === 'module_initialized' ) {
        this.setState('finished');
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
    setState: function ( stat ) {
      state = stat;
    }, // END setState

    // -------------------------------------------------------------------------
    //  Returns the current (processing) state of the module
    // -------------------------------------------------------------------------
    getState: function () {
      return state;
    } // END state

  }; // END return
}(j1, window);
