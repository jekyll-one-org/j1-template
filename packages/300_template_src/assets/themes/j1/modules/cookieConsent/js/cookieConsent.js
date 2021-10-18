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
 #  Copyright (C) 2021 Juergen Adams
 #
 #  bootstrap-cookie-banner is licensed under MIT License.
 #  See: https://github.com/shaack/bootstrap-cookie-banner/blob/master/LICENSE
 #  J1 Template is licensed under MIT License.
 #  See: https://github.com/jekyll-one/J1 Template/blob/master/LICENSE
 # -----------------------------------------------------------------------------
 # TODO:
 #
 # -----------------------------------------------------------------------------
 # NOTE:
 #  BS Cookie Consent is a MODIFIED version of bootstrap-cookie-banner
 #  for the use with J1 Template. This modified version cannot be used
 #  outside of J1 Template!
 # -----------------------------------------------------------------------------
*/
//'use strict';

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

function BootstrapCookieConsent(props) {
  var logger                = log4javascript.getLogger('j1.core.bsCookieConsent');
  var self                  = this;
  var detailedSettingsShown = false;
  var url                   = new liteURL(window.location.href);
  var cookieSecure          = (url.protocol.includes('https')) ? true : false;
  var logText;
  var current_page;
  var whitelisted;

  logger.info('\n' + 'initializing core module: started');
  logger.info('\n' + 'state: started');

  // default settings
  this.props = {
    autoShowDialog:         true,                                               // show dialog if NO consent cookie found
    dialogLanguage:         'content',                                          // language used for the consent dialog (modal)
    dialogLanguages:        ['en','de'],                                        // supported languages for the consent dialog (modal), defaults to first in array
    contentURL:             '/assets/data/cookieconsent',                       // URL contain the consent dialogs (modals) for ALL supported languages
    cookieName:             'j1.user.translate',                                // name of the cookie, in which the configuration is stored
    cookieStorageDays:      365,                                                // duration the configuration cookie is stored on the client
    postSelectionCallback:  undefined,                                          // callback function, called after the user has made his selection
    whitelisted:            [],                                                 // pages NO consent modal dialog is issued
    xhrDataElement:         'consent-data',                                     // src container for all language-specific consent dialogs (taken from contentURL)
    dialogContainerID:      'consent-modal',                                    // dest container, the dialog modal is loaded (dynamically)
    cookieSameSite:         'Strict',                                           // restrict the consent cookie to first-party (do NOT send cookie to other domains)
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
    this.props.dialogLanguage = this.props.dialogLanguages[0];
  }

  // set modal by dialogLanguage that is loadad
  this.props.xhrDataElement = this.props.xhrDataElement + '-' + this.props.dialogLanguage;

  // set modal by dialogLanguage that is loadad
  this.props.cookieSecure = cookieSecure;

  var Cookie = {
    set: function (name, value, days, cookieSameSite, cookieSecure) {
      var value_encoded = window.btoa(value);
      var expires = "";
      if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
      }
      if (cookieSecure) {
        document.cookie = name + "=" + (value_encoded || '') + expires + '; Path=/; cookieSameSite=' + cookieSameSite + '; ' + 'cookieSecure=' + cookieSecure + ';';
      } else {
        document.cookie = name + "=" + (value_encoded || '') + expires + '; Path=/; cookieSameSite=' + cookieSameSite + ';';
      }
    },
    get: function (name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
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

  function showDialog(options) {
    Events.documentReady(function () {

      self.modal = document.getElementById(self.props.dialogContainerID);
      if (!self.modal) {
        logger.info('\n' +  'load consent modal');
        self.modal = document.createElement("div");
        self.modal.id = self.props.dialogContainerID;
        self.modal.setAttribute("class", "modal fade");
        self.modal.setAttribute("tabindex", "-1");
        self.modal.setAttribute("role", "dialog");
        self.modal.setAttribute("aria-labelledby", self.props.dialogContainerID);
        document.body.append(self.modal);
        self.$modal = $(self.modal);

        if (self.props.postSelectionCallback) {
          self.$modal.on("hidden.bs.modal", function () {
            self.props.postSelectionCallback();
          });
        }

        // load modal content
        //
        var templateUrl = self.props.contentURL + '/' + 'index.html';
        $.get(templateUrl)
        .done(function (data) {
          logger.info('\n' + 'loading consent modal: successfully');
          self.modal.innerHTML = data;
          self.modal.innerHTML = $('#' + self.props.xhrDataElement).eq(0).html();

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
    Cookie.set(self.props.cookieName, JSON.stringify(gatherOptions(true)), self.props.cookieStorageDays, self.props.cookieSameSite, self.props.cookieSecure);
    self.$modal.modal('hide');
  }

  function doNotAgree() {
    Cookie.set(self.props.cookieName, JSON.stringify(gatherOptions(false)), self.props.cookieStorageDays, self.props.cookieSameSite, self.props.cookieSecure);

    // jadams, 2021-07-15: all cookies NOT longer supported by j1.expireCookie
    // TODO: Create loop over all cookies found in page
    //
    // logger.warn('expire all cookies');
    // j1.expireCookie('all');

    self.$modal.modal('hide');
    j1.goHome();
  }

  function saveSettings() {
    Cookie.set(self.props.cookieName, JSON.stringify(gatherOptions()), self.props.cookieStorageDays, self.props.cookieSameSite, self.props.cookieSecure);
    self.$modal.modal('hide');
  }

  // call consent dialog if no cookie found (except pages whitelisted)
  //
  whitelisted  = (this.props.whitelisted.indexOf(window.location.pathname) > -1);
  if (Cookie.get(this.props.cookieName) === undefined && this.props.autoShowDialog && !whitelisted) {
    showDialog();
  }

  // API functions
  // ---------------------------------------------------------------------------

  logger.info('\n' + 'initializing core module finished');
  logger.info('\n' + 'state: finished');

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
