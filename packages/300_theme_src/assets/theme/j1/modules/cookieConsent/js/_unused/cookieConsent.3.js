/*
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/modules/cookieConsent/js/cookieConsent.js (3)
 # Provides JS Core for J1 Module BS Cookie Consent
 #
 #  Product/Info:
 #  https://shaack.com
 #  http://jekyll.one
 #
 #  Copyright (C) 2020 Stefan Haack
 #  Copyright (C) 2023-2026 Juergen Adams
 #
 #  bootstrap-cookie-banner is licensed under MIT License.
 #  See: https://github.com/shaack/bootstrap-cookie-banner/blob/master/LICENSE
 #  J1 Theme is licensed under MIT License.
 #  See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 # -----------------------------------------------------------------------------
 # TODO:
 #
 # -----------------------------------------------------------------------------
 # NOTE:
 #  BS Cookie Consent is a MODIFIED version of bootstrap-cookie-banner
 #  for the use with J1 Theme. This modified version cannot be used
 #  outside of J1 Theme!
 # -----------------------------------------------------------------------------
*/

// -----------------------------------------------------------------------------
// ESLint shimming
// -----------------------------------------------------------------------------
/* eslint indent: "off"                                                       */
/* eslint no-unused-vars: "off"                                               */
/* eslint no-undef: "off"                                                     */
/* eslint no-redeclare: "off"                                                 */
/* eslint indent: "off"                                                       */
/* eslint JSUnfilteredForInLoop: "off"                                        */
// -----------------------------------------------------------------------------

'use strict';
function CookieConsent(props) {
  var logger                = log4javascript.getLogger('j1.api.CookieConsent');
  var self                  = this;
  var detailedSettingsShown = false;
  var url                   = new liteURL(window.location.href);
  var cookieSecure          = (url.protocol.includes('https')) ? true : false;
  var dataChanged           = null;

  var logText;
  var current_page;
  var whitelisted;

  logger.debug('initializing core module: started');
  logger.debug('state: started');

  // default settings
  this.props = {
    autoShowDialog:         true,                                               // show dialog if NO consent cookie found
    contentURL:             '/assets/data/cookieconsent',                       // URL contain the consent dialogs (modals) for ALL supported languages
    postSelectionCallback:  '',                                                 // callback function, called after the user has made his selection
    whitelisted:            [],                                                 // pages NO consent modal dialog is issued
    xhrDataElement:         'consent-data',                                     // container for the consent dialog
    dialogContainerID:      'consent-modal'                                     // dialog modal
  };

  // merge property settings
  for (var property in props) {
    this.props[property] = props[property];
  }

  this.props.cookieSecure = cookieSecure;
  var Cookie = {
    set: (name, value, days, cookieSameSite, cookieDomain, cookieSecure) => {
      var value_encoded = window.btoa(value);
      var expires       = '; expires=Thu, 01 Jan 1970 00:00:00 UTC';

      if (days > 0) {
        var date = new Date();

        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
      }

      // TODO: cookie attriebutes should be 'stringified' as done
      // in j1.adapter.writeCookie()
      // NOTE: DISABLED attribute 'Domain' for now
      //------------------------------------------------------------------------

      if (cookieSecure) {
        if (cookieDomain) {
          document.cookie = name + "=" + (value_encoded || '') + expires + '; Path=/; SameSite=' + cookieSameSite + '; ' + 'Domain=' + cookieDomain + '; ' + 'Secure=' + cookieSecure + ';';
        } else {
          document.cookie = name + "=" + (value_encoded || '') + expires + '; Path=/; SameSite=' + cookieSameSite + '; ' + 'Secure=' + cookieSecure + ';';
        }
      } else {
        if (cookieDomain) {
          document.cookie = name + "=" + (value_encoded || '') + expires + '; Path=/; SameSite=' + cookieSameSite + ';' + 'Domain=' + cookieDomain + '; ';
        } else {
          document.cookie = name + "=" + (value_encoded || '') + expires + '; Path=/; SameSite=' + cookieSameSite + ';';
        }
      }

    },

    get: (name) => {
      var nameEQ = name + "=";
      var ca     = document.cookie.split(';');

      for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) === ' ') {
          c = c.substring(1, c.length);
        }

        if (c.indexOf(nameEQ) === 0) {
          var value_encoded = c.substring(nameEQ.length, c.length);
          var value         = window.atob(value_encoded);
          return value;
        }
      }

      return undefined;
    }
  };

  var Events = {
    documentReady: function (onDocumentReady) {
      if (document.readyState !== 'loading') {
        onDocumentReady();
      } else {
        document.addEventListener('DOMContentLoaded', onDocumentReady);
      }
    }
  };

  // ---------------------------------------------------------------------------
  // extend()
  // deep merge of two objects
  // ---------------------------------------------------------------------------
  function extend () {
    var extended = {};
    var deep = false;
    var i = 0;
    var length = arguments.length;

    // Check if a deep merge
    if ( Object.prototype.toString.call( arguments[0] ) === '[object Boolean]' ) {
        deep = arguments[0];
        i++;
    }

    // Merge the object into the extended object
    var merge = function (obj) {
        for ( var prop in obj ) {
            if ( Object.prototype.hasOwnProperty.call( obj, prop ) ) {
                // If deep merge and property is an object, merge properties
                if ( deep && Object.prototype.toString.call(obj[prop]) === '[object Object]' ) {
                    extended[prop] = extend( true, extended[prop], obj[prop] );
                } else {
                    extended[prop] = obj[prop];
                }
            }
        }
    };

    // Loop through each object and conduct a merge
    for ( ; i < length; i++ ) {
      var obj = arguments[i];
      merge(obj);
    }

    return extended;
  }

  // ---------------------------------------------------------------------------
  // executeFunctionByName()
  // execute a function by NAME (functionName) in a browser context
  // (e.g. window) the function is published
  // claude - pass options to a callback function #2
  // ---------------------------------------------------------------------------
  function executeFunctionByName (functionName, context, args) {
    var namespaces = functionName.split('.');
    var func = namespaces.pop();
    for(var i = 0; i < namespaces.length; i++) {
      context = context[namespaces[i]];
    }
    // apply() requires an array-like second argument; wrap non-array
    // values (e.g. a plain options object) in an array so they are
    // passed as the first argument of the called function
    if (args !== undefined && !Array.isArray(args)) {
      args = [args];
    }
    return context[func].apply(context, args);
  }

  function showDialog(options) {
    Events.documentReady(function () {

      self.modal = document.getElementById(self.props.dialogContainerID);
      if (!self.modal) {
        logger.info( 'load consent modal');

        self.modal = document.createElement("div");
        self.modal.id = self.props.dialogContainerID;
        self.modal.style.display = 'none';

        self.modal.setAttribute("class", "modal fade");
        self.modal.setAttribute("tabindex", "-1");
        self.modal.setAttribute("role", "dialog");
        self.modal.setAttribute("aria-labelledby", self.props.dialogContainerID);
        document.body.append(self.modal);
        self.$modal = $(self.modal);

        // ---------------------------------------------------------------------
        // register events for the dialog (modal)
        // ---------------------------------------------------------------------

        // ---------------------------------------------------------------------
        // on 'show'
        // ---------------------------------------------------------------------
        self.$modal.on('show.bs.modal', function () {
          // hide the menubar for the modal header
          // $('#navigator_nav_navbar').hide();
        }); // END modal on 'show'

        // ---------------------------------------------------------------------
        // on 'hidden'
        // ---------------------------------------------------------------------
        self.$modal.on('hidden.bs.modal', function () {
          // process settings after the user has made his selections
          // claude - pass options to a callback function #2
          //  executeFunctionByName(callbackName, context, options)
          executeFunctionByName (self.props.postSelectionCallback, window, {
            dataChanged: dataChanged
          });
        }); // END modal on 'hidden'

        // load modal content
        //
        var templateUrl = self.props.contentURL + '/' + 'index.html';
        $.get(templateUrl)
        .done(function (data) {
          logger.info('loading consent modal: successfully');

          // -------------------------------------------------------------
          // claude - J1 Bootstrap JS modifications #2
          //
          // Guard the modal initialization so that the Bootstrap Modal
          // constructor never runs against a `self.modal` that lacks a
          // `.modal-dialog` child.
          //
          // Background: Bootstrap 5's Modal constructor stores
          //   this._dialog = SelectorEngine.findOne('.modal-dialog',
          //                                         this._element)
          // once, at construction time. A later code path does
          //   SelectorEngine.findOne(SELECTOR_MODAL_BODY, this._dialog)
          // and throws when `_dialog` is null. In production builds the
          // following can leave the modal element empty:
          //   - the AJAX response is a 404/redirect page that does not
          //     contain the expected `#consent-data` wrapper;
          //   - the previous two-step assignment used a *document-wide*
          //     `$('#consent-data')` selector which can match the wrong
          //     node when a bundler duplicates or relocates ids;
          //   - the HTML compressor strips the `.modal-dialog` markup
          //     before the script ever sees it.
          //
          // Fix: parse the response in a detached container, extract
          // the wrapper's inner HTML directly from that container
          // (never from the live document), verify that a
          // `.modal-dialog` is actually present, inject only on
          // success, re-verify inside `self.modal`, and defer the
          // Bootstrap construction by one animation frame so any
          // synchronous DOM mutation in flight has a chance to settle
          // first. If any check fails we abort cleanly and log; the
          // user simply does not see the consent modal on this page
          // load, which is preferable to a hard JS error breaking the
          // site.
          // -------------------------------------------------------------
          var $parsed       = $('<div>').append($.parseHTML(data || '', document, false));
          var $xhrWrapper   = $parsed.find('#' + self.props.xhrDataElement).eq(0);
          var dialogMarkup  = $xhrWrapper.length ? $xhrWrapper.html() : '';

          if (!dialogMarkup) {
            logger.error('loading consent modal: response is empty or missing wrapper #' + self.props.xhrDataElement);
            logger.warn('check that `contentURL` (' + self.props.contentURL + ') resolves to the consent dialog data file');
            return;
          }

          if (dialogMarkup.indexOf('modal-dialog') === -1) {
            logger.error('loading consent modal: response does not contain a `.modal-dialog` element');
            logger.warn('the build pipeline (HTML minifier/bundler) may be stripping the dialog markup');
            return;
          }

          self.modal.innerHTML = dialogMarkup;

          // confirm the dialog node actually landed in `self.modal`
          // before handing it off to Bootstrap. Bootstrap reads
          // `.modal-dialog` from `self.modal` exactly once, in the
          // Modal constructor, so this is the last point at which we
          // can safely abort.
          if (!self.modal.querySelector('.modal-dialog')) {
            logger.error('loading consent modal: `.modal-dialog` not present in modal element after injection - aborting init');
            return;
          }

          self.modal.style.display = 'block';

          // ----------------------------------------------------------
          // claude - J1 Bootstrap JS modifications #2
          // Defer the Bootstrap init to the next animation frame.
          // This gives the browser one tick to finish parsing and
          // reflowing the freshly-injected markup before
          // `new Modal(...)` reads `_dialog`. Falls back to a
          // setTimeout on environments without rAF.
          // ----------------------------------------------------------
          var initBootstrapModal = function () {
            // paranoid re-check: another script could have wiped or
            // replaced the modal in the time since innerHTML
            // assignment (rare, but cheap to verify).
            if (!self.modal.querySelector('.modal-dialog')) {
              logger.error('loading consent modal: `.modal-dialog` disappeared before Bootstrap init - aborting');
              return;
            }

            $(self.modal).modal({
              backdrop: "static",
              keyboard: false
            });

            self.$buttonDoNotAgree  = $("#bccs-buttonDoNotAgree");
            self.$buttonAgree       = $("#bccs-buttonAgree");
            self.$buttonDoNothing   = $("#bccs-buttonDoNothing");
            self.$buttonSave        = $("#bccs-buttonSave");
            self.$buttonAgreeAll    = $("#bccs-buttonAgreeAll");

            logger.info('load/initialze options from cookie');

            updateButtons();
            updateOptionsFromCookie();

            $("#bccs-options").on("hide.bs.collapse", function () {
              detailedSettingsShown = false;
              updateButtons();
            }).on("show.bs.collapse", function () {
              detailedSettingsShown = true;
              updateButtons();
            });

            logger.info('initialze event handler');

            self.$buttonDoNotAgree.click(function () {
              dataChanged = true;
              doNotAgree();
            });
            self.$buttonAgree.click(function () {
              dataChanged = true;
              agreeAll();
            });
            self.$buttonSave.click(function () {
              dataChanged = true;
              $("#bccs-options").collapse('hide');
              saveSettings();
              updateOptionsFromCookie();
            });
            self.$buttonAgreeAll.click(function () {
              dataChanged = true;
              $("#bccs-options").collapse('hide');
              agreeAll();
              updateOptionsFromCookie();
            });
            self.$buttonDoNothing.click(function () {
              dataChanged = false;
              doNoting();
            });
            self.$modal.modal('show');
          };

          if (typeof window.requestAnimationFrame === 'function') {
            window.requestAnimationFrame(initBootstrapModal);
          } else {
            setTimeout(initBootstrapModal, 0);
          }
        })
        .fail(function () {
          logger.error('loading consent modal: failed');
          logger.warn('probably no `contentURL` set');
        });
      } else {
        self.$modal.modal('show');
      }
    }.bind(this));
  }

  function updateOptionsFromCookie() {
    var settings = self.getSettings();
    if (settings) {
      for (var setting in settings) {
        var $checkbox = self.$modal.find("#bccs-options .bccs-option[data-name='" + setting + "'] input[type='checkbox']");
        $checkbox.prop("checked", settings[setting]);
      }
    }
  }

  function updateButtons() {
    if (detailedSettingsShown) {
      self.$buttonDoNotAgree.hide();
      self.$buttonAgree.hide();
      self.$buttonSave.show();
      self.$buttonAgreeAll.show();
    } else {
      self.$buttonDoNotAgree.show();
      self.$buttonAgree.show();
      self.$buttonSave.hide();
      self.$buttonAgreeAll.hide();
    }
  }

  function gatherOptions(setAllExceptNecessary) {
    var $options = self.$modal.find("#bccs-options .bccs-option");
    var options = {};
    for (var i = 0; i < $options.length; i++) {
      var option = $options[i];
      var name = option.getAttribute("data-name");
      if (name === "necessary") {
        options[name] = true;
      } else if (setAllExceptNecessary === undefined) {
        var $checkbox = $(option).find("input[type='checkbox']");
        options[name] = $checkbox.prop("checked");
      } else {
        options[name] = !!setAllExceptNecessary;
      }
    }
    return options;
  }

  function agreeAll() {
    Cookie.set(
      self.props.cookieName,
      JSON.stringify(gatherOptions(true)),
      self.props.cookieStorageDays,
      self.props.cookieSameSite,
      self.props.cookieDomain,
      cookieSecure
    );
    self.$modal.modal('hide');
  }

  function doNotAgree() {
    // Remove consent cookie
    Cookie.set(
      self.props.cookieName,
      JSON.stringify(gatherOptions(false)),
      0,
      self.props.cookieSameSite,
      self.props.cookieDomain,
      cookieSecure
    );
    self.$modal.modal('hide');
    // redirect to error page: blocked site
    window.location.href = '/445.html';
  }

  function doNoting() {
    self.$modal.modal('hide');
  }

  function saveSettings() {
    Cookie.set(
      self.props.cookieName,
      JSON.stringify(gatherOptions()),
      self.props.cookieStorageDays,
      self.props.cookieSameSite,
      self.props.cookieDomain,
      cookieSecure
    );
    self.$modal.modal('hide');
  }

  // call consent dialog if no cookie found or cookie NOT accepted (except whitelisted pages)
  //
  whitelisted = (this.props.whitelisted.indexOf(window.location.pathname) > -1);

  var consentCookie = Cookie.get(this.props.cookieName);
  if ((consentCookie === undefined || consentCookie === "false") && this.props.autoShowDialog && !whitelisted) {
    showDialog();
  }

  // API functions
  // ---------------------------------------------------------------------------
  logger.debug('initializing core module finished');
  logger.debug('state: finished');

  // show the consent dialog (modal)
  // ---------------------------------------------------------------------------
  this.showDialog = function () {
    whitelisted  = (this.props.whitelisted.indexOf(window.location.pathname) > -1);
    if (!whitelisted) {
      showDialog();
    }
  };

  // collect settings from consent cookie
  // ---------------------------------------------------------------------------
  this.getSettings = function (optionName) {
    var cookie = Cookie.get(self.props.cookieName);
    if (cookie) {
      var settings = JSON.parse(Cookie.get(self.props.cookieName));
      if (optionName === undefined) {
          return settings;
      } else {
        if (settings) {
          return settings[optionName];
        } else {
          return false;
        }
      }
    } else {
      return undefined;
    }
  }; // END getSettings

} // END BootstrapCookieConsent