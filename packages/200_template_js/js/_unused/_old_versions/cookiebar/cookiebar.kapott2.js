/*
 # -----------------------------------------------------------------------------
 #  ~/js/cookiebar/cookiebar.js
 #  Provides Javascript functions for jQuery cookiebar
 #
 #  Product/Info:
 #  http://jekyll.one
 #  http://www.primebox.co.uk/projects/jquery-cookiebar/
 #
 #  Copyright (C) 2021 Juergen Adams
 #  Copyright (C) 2016 Ant Parsons (primebox.co.uk)
 #
 #  J1 Template is licensed under MIT License.
 #  See: https://github.com/jekyll-one-org/J1 Template/blob/master/LICENSE
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


// TODO:

// -----------------------------------------------------------------------------
// cookiebar plugin registered as 'cookieBar' (window|root)
// -----------------------------------------------------------------------------

module.exports = ( function ($) {

  $.cookieBar = function (options, val) {

    if (options=='cookies') {
      var doReturn = 'cookies';
    } else if (options=='set') {
      var doReturn = 'set';
    } else {
      var doReturn = false;
    }

    var defaults = {
      message:              'We use cookies to track usage and preferences.', //Message displayed on bar
      acceptButton:         true, //Set to true to show accept/enable button
      acceptText:           'I Understand', //Text on accept/enable button
      acceptFunction:       function(cookieValue){if(cookieValue!='enabled' && cookieValue!='accepted') window.location = window.location.href;}, //Function to run after accept
      declineButton:        false, //Set to true to show decline/disable button
      declineText:          'Disable Cookies', //Text on decline/disable button
      declineFunction:      function(cookieValue){if(cookieValue=='enabled' || cookieValue=='accepted') window.location = window.location.href;}, //Function to run after decline
      policyButton:         false, //Set to true to show Privacy Policy button
      policyText:           'Privacy Policy', //Text on Privacy Policy button
      policyURL:            '/privacy-policy/', //URL of Privacy Policy
      autoEnable:           true, //Set to true for cookies to be accepted automatically. Banner still shows
      renewOnVisit:         false, //Renew the cookie upon revisit to website
      forceShow:            false, //Force cookiebar to show regardless of user cookie preference
    };

    var options             = $.extend(defaults, options);
    var logger              = log4javascript.getLogger('j1.Cookiebar.core');
    var user_state          = {};
    var user_state_detected = {};
    var pageChanged;
    var current_page;
    var whitelisted;

    //pageChanged = j1.hasPageChanged( user_state );

    user_state_detected     = j1.existsCookie ( 'j1.user.state' );
    user_state              = j1.getUserStateFromCookie();

    if ( user_state_detected ) {
      logger.info('preFlight: Read User state cookie');
      user_state = j1.getUserStateFromCookie();
      logger.info('preFlight: Found cookie consent: ' + user_state.cookies_accepted);
    } else {
      logger.error('preFlight: User state cookie NOT found');
    }

    if ( user_state.cookies_accepted == 'accepted' ) {
      logger.info('preFlight: User accepted cookies');
      //pageChanged = j1.hasPageChanged( user_state );
      j1.resolveMacros( user_state );
      j1.updateMacros( user_state );
      $('#cookie-state').css('display', 'block'); // display cookie icon
      logger.info('preFlight: Cookie processing finished');
      return true;
    } else if ( user_state.cookies_accepted == 'declined' ) {
      // Check if cookie consent should shown
      //user_state = j1.getUserStateFromCookie();
      current_page = window.location.pathname;
      // whitelisted = $.inArray(current_page, options.whitelisted_pages) > -1;
      whitelisted = (options.whitelisted_pages.indexOf(current_page) > -1);
      if ( whitelisted ) {
        // Update sidebar|quicklinks
        j1.resolveMacros( user_state );
        j1.updateMacros( user_state );
        // Hide cookie icon
        $('#cookie-state').css('display', 'none');
        return false;
        }
    } else if ( user_state.cookies_accepted == 'pending' ) {
        // Check if cookie consent should shown
        //user_state = j1.getUserStateFromCookie();
        current_page = window.location.pathname;
        // whitelisted = $.inArray(current_page, options.whitelisted_pages) > -1;
        whitelisted = (options.whitelisted_pages.indexOf(current_page) > -1);
        if ( whitelisted ) {
          // Update sidebar|quicklinks
          j1.resolveMacros( user_state );
          j1.updateMacros( user_state );
          // Hide cookie icon
          $('#cookie-state').css('display', 'none');
          //return false;
        }

        logger.info('Enable cookie consent');
        // Update user state cookie
        cookieValue = 'enabled';
        user_state.cookies_accepted = cookieValue;
        user_state.status           = 'pending';
        j1.setUserStateCookie( user_state );
        j1.resolveMacros( user_state );
        j1.updateMacros( user_state );
    }

    if (doReturn == 'cookies') {
      //Returns true if cookies are enabled, false otherwise
      if (cookieValue == 'enabled' || cookieValue == 'accepted') {
        return true;
      } else {
        return false;
      }
    } else if (doReturn == 'set' && (val == 'accepted' || val == 'declined')) {
      // Update user state
      user_state.cookies_accepted  = val;

      if (val == 'accepted') {
        j1.setUserStateCookie( user_state );
        return true;
      } else {
        j1.setUserStateCookie( user_state );
        return false;
      }
    } else {
      // Manage cookie consent dialog if arguments met and page is available (j1.state == finished)
      // jadams, 2019-03-24: Added "stop-scrolling"
      if (options.forceShow || cookieValue == 'enabled' || cookieValue == '') {
        var pageLoaded = setInterval(function() {
          if ( j1.state() === 'finished' ) {
            // Check if cookie consent dialog should shown
            user_state   = j1.getUserStateFromCookie();
            current_page = window.location.pathname;

            // Skip cookie consent for pages whitelisted if cookies are "DECLINED"
            // -----------------------------------------------------------------
            // whitelisted  = $.inArray(current_page, options.whitelisted_pages) > -1;
            whitelisted = (options.whitelisted_pages.indexOf(current_page) > -1);
            if ( user_state.cookies_accepted == 'declined' && whitelisted ) {
              // Update user state
              user_state.status = 'pending';
              j1.resolveMacros( user_state );
              j1.updateMacros( user_state );
              return;
            }

            // Display cookie consent dialog
            // -----------------------------------------------------------------
            $('#topFullCookieConsent').modal('show');
            if (options.stopScrolling) { $('body').addClass('stop-scrolling'); }

            // Manage button click events
            // -----------------------------------------------------------------
            $('a.btn').click(function(e) {
              user_state       = j1.getUserStateFromCookie();
              user_state_empty = jQuery.isEmptyObject(user_state);

              //e.stopPropagation();
              //e.preventDefault();

              // Modal topFullCookieConsent
              // ---------------------------------------------------------------
              if (this.id === 'policyButton') {
                logger.info('User clicked policyButton');
                // toggle|display cookie policy
                $('#cookiePolicyInfo').toggle( 'fast', function() {
                  // toggle container classes
                  $('#modal-footer').toggleClass('modal-footer-hidden modal-footer-show');
                });
              }
              if (this.id === 'acceptButton') {

                logger.info('User clicked acceptButton');

                // Update user state cookie
                user_state.cookies_accepted = 'accepted';
                user_state.status           = 'active';
                j1.setUserStateCookie( user_state );

                // Update sidebar|Cookies
                j1.resolveMacros( user_state );
                j1.updateMacros( user_state );
                $('#cookie-state').css('display', 'block'); // display cookie icon
                //return;
              }
              if (this.id === 'declineButton') {
                current_page = window.location.pathname;
                // whitelisted  = $.inArray(current_page, options.whitelisted_pages) > -1;
                whitelisted = (options.whitelisted_pages.indexOf(current_page) > -1);

                logger.info('User clicked declineButton');

                // Update user state cookie
                user_state.cookies_accepted = 'declined';
                user_state.status           = 'pending';
                j1.setUserStateCookie( user_state );
                // Update sidebar|Cookies
                j1.resolveMacros( user_state );
                j1.updateMacros( user_state );

                // Hide cookie icon
                $('#cookie-state').css('display', 'none');
                // Set route to home page if current page is NOT whitelisted
                if ( !whitelisted ) { window.location.href = '/'; }
              }

              // Modal cookieRevokeCentralDanger
              // ---------------------------------------------------------------
              if (this.id === 'revokeCookies') {
                current_page = window.location.pathname;
                // whitelisted  = $.inArray(current_page, options.whitelisted_pages) > -1;
                whitelisted = (options.whitelisted_pages.indexOf(current_page) > -1);

                logger.info('User clicked revokeCookiesButton');

                // Update user state cookie
                user_state.cookies_accepted = 'declined';
                user_state.status           = 'pending';
                j1.setUserStateCookie( user_state );

                // Update toggle button (if available)
                $('.toggle-button').toggleClass('mdi-toggle-switch-off mdi-toggle-switch');

                // Update sidebar|Cookies
                j1.resolveMacros( user_state );
                j1.updateMacros( user_state );
                // Hide cookie icon
                $('#cookie-state').css('display', 'none');
                // Set route to home page if current page is NOT whitelisted
                if ( !whitelisted ) { window.location.href = '/'; }
              }
              if (this.id === 'remainCookies') {
                logger.info('User clicked remainCookiesButton');
                return;
              }

              // Re-enable page scrolling if cookie consent modal gets "closed"
              $('#topFullCookieConsent').on('hide.bs.modal', function() {
                logger.info('User closed topFullCookieConsent');
                $('body').removeClass('stop-scrolling');
              });

            }); // END manage button click envents
            // clear interval checking
            clearInterval(pageLoaded);
          } // END Manage cookie consent dialog
        }, 50); // END setInterval

      } // endif
    } // endif-else
  }; // END cookiebar

})(jQuery);
