/*
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/modules/cookieConsent/js/cookieConsent.js
 # Provides JS Core for J1 Module BS Cookie Consent
 #
 #  Product/Info:
 #  https://shaack.com
 #  http://jekyll.one
 #
 #  Copyright (C) 2020 Stefan Haack
 #  Copyright (C) 2023, 2024 Juergen Adams
 #
 #  bootstrap-cookie-banner is licensed under MIT License.
 #  See: https://github.com/shaack/bootstrap-cookie-banner/blob/master/LICENSE
 #  J1 Theme is licensed under MIT License.
 #  See: https://github.com/jekyll-one/J1 Theme/blob/master/LICENSE
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
  var logger                = log4javascript.getLogger('j1.core.CookieConsent');
  var self                  = this;
  var detailedSettingsShown = false;
  var url                   = new liteURL(window.location.href);
  var cookieSecure          = (url.protocol.includes('https')) ? true : false;
  var navigatorLanguage     = navigator.language || navigator.userLanguage;
  var defaultDialogLanguage = 'en';
  var logText;
  var current_page;
  var whitelisted;

  logger.debug('\n' + 'initializing core module: started');
  logger.debug('\n' + 'state: started');

  if (navigatorLanguage.indexOf("-") !== -1) {
    navigatorLanguage = navigatorLanguage.split("-")[0];
  }

  // default settings
  this.props = {
    autoShowDialog:         true,                                               // show dialog if NO consent cookie found
    dialogLanguage:         defaultDialogLanguage,                                  // language used for the consent dialog (modal)
    dialogLanguages:        ['en','de'],                                        // supported languages for the consent dialog (modal), defaults to first in array
    contentURL:             '/assets/data/cookieconsent',                       // URL contain the consent dialogs (modals) for ALL supported languages
    postSelectionCallback:  '',                                                 // callback function, called after the user has made his selection
    whitelisted:            [],                                                 // pages NO consent modal dialog is issued
    xhrDataElement:         'consent-data',                                     // src container for all language-specific consent dialogs (taken from contentURL)
    dialogContainerID:      'consent-modal'                                     // dest container, the dialog modal is loaded (dynamically)
  };

  // merge property settings
  for (var property in props) {
    this.props[property] = props[property];
  }

  if (this.props.dialogLanguage.indexOf("-") !== -1) {
    this.props.dialogLanguage = this.props.dialogLanguage.split("-")[0];
  }

  // fallback on default language (modal) if dialogLanguage not suppported
  if (!this.props.dialogLanguages.includes(this.props.dialogLanguage)) {
    this.props.dialogLanguage = defaultDialogLanguage;
  }

  // set modal by dialogLanguage that is loadad
  this.props.xhrDataElement = this.props.xhrDataElement + '-' + this.props.dialogLanguage;

  // set modal by dialogLanguage that is loadad
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
  // ---------------------------------------------------------------------------
  function executeFunctionByName (functionName, context /*, args */) {
    var args = Array.prototype.slice.call(arguments, 2);
    var namespaces = functionName.split('.');
    var func = namespaces.pop();
    for(var i = 0; i < namespaces.length; i++) {
      context = context[namespaces[i]];
    }
    return context[func].apply(context, args);
  }

  function showDialog(options) {
    Events.documentReady(function () {

      self.modal = document.getElementById(self.props.dialogContainerID);
      if (!self.modal) {
        logger.info('\n' +  'load consent modal');

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
          // if the modal is closed, show the menubar
          // $('#navigator_nav_navbar').show();
          // process settings after the user has made his selections
          executeFunctionByName (self.props.postSelectionCallback, window);
        }); // END modal on 'hidden'

        // load modal content
        //
        var templateUrl = self.props.contentURL + '/' + 'index.html';
        $.get(templateUrl)
        .done(function (data) {
          logger.info('\n' + 'loading consent modal: successfully');
          self.modal.innerHTML      = data;
          self.modal.innerHTML      = $('#' + self.props.xhrDataElement).eq(0).html();
          self.modal.style.display  = 'block';

          $(self.modal).modal({
            backdrop: "static",
            keyboard: false
          });

          self.$buttonDoNotAgree = $("#bccs-buttonDoNotAgree");
          self.$buttonAgree = $("#bccs-buttonAgree");
          self.$buttonSave = $("#bccs-buttonSave");
          self.$buttonAgreeAll = $("#bccs-buttonAgreeAll");

          logger.info('\n' + 'load/initialze options from cookie');

          updateButtons();
          updateOptionsFromCookie();

          $("#bccs-options").on("hide.bs.collapse", function () {
            detailedSettingsShown = false;
            updateButtons();
          }).on("show.bs.collapse", function () {
            detailedSettingsShown = true;
            updateButtons();
          });

          logger.info('\n' + 'initialze event handler');

          self.$buttonDoNotAgree.click(function () {
            doNotAgree();
          });
          self.$buttonAgree.click(function () {
            agreeAll();
          });
          self.$buttonSave.click(function () {
            $("#bccs-options").collapse('hide');
            saveSettings();
            updateOptionsFromCookie();
          });
          self.$buttonAgreeAll.click(function () {
            $("#bccs-options").collapse('hide');
            agreeAll();
            updateOptionsFromCookie();
          });

          self.$modal.modal('show');
        })
        .fail(function () {
          logger.error('\n' + 'loading consent modal: failed');
          logger.warn('\n' + 'probably no `contentURL` set');
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
  logger.debug('\n' + 'initializing core module finished');
  logger.debug('\n' + 'state: finished');

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
