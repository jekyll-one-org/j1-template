/*
 # -----------------------------------------------------------------------------
 #  ~/js/cookieconsent/cookieconsent.js
 #  Provides Javascript core functions for BS Cookie Consent
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
 #  NOTE:
 #  BS Cookie Consent is an modified version of bootstrap-cookie-banner
 #  for the with J1 Template
 # -----------------------------------------------------------------------------
 #  TODO:
 #
 # -----------------------------------------------------------------------------
*/

// -----------------------------------------------------------------------------
// ESLint shimming
// -----------------------------------------------------------------------------
/* eslint no-unused-vars: "off"                                               */
/* eslint no-undef: "off"                                                     */
/* eslint no-redeclare: "off"                                                 */
/* global window                                                              */

/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/bootstrap-cookie-banner
 * License: MIT, see file 'LICENSE'
 */

module.exports = function BootstrapCookieConsent(options) {

      var logText;
  //  var logger                = log4javascript.getLogger('j1.core.bsCookieConsent');
      var modalId               = "bccs-modal"
      var self                  = this
      var detailedSettingsShown = false

      this.options = {
          autoShowDialog: true,                   // disable autoShowModal on the privacy policy and legal notice pages, to make these pages readable
          lang: navigator.language,               // the language, in which the modal is shown
          languages: ["en", "de"],                // supported languages (in ./content/), defaults to first in array
          contentURL: "./content",                // this URL must contain the dialogs content in the needed languages
          cookieName: "j1.user.consent",          // the name of the cookie in which the configuration is stored as JSON
          cookieStorageDays: 365,                 // the duration the cookie configuration is stored on the client
          postSelectionCallback: undefined        // callback function, called after the user has made his selection
      }

      for (var property in options) {
          // noinspection JSUnfilteredForInLoop
          this.options[property] = options[property]
      }
      this.lang = this.options.lang
      if (this.lang.indexOf("-") !== -1) {
          this.lang = this.lang.split("-")[0]
      }
      if (!this.options.languages.includes(this.lang)) {
          this.lang = this.options.languages[0] // fallback
      }

      var Cookie = {
          set: function (name, value, days) {
              var expires = ""
              if (days) {
                  var date = new Date()
                  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000))
                  expires = "; expires=" + date.toUTCString()
              }
              document.cookie = name + "=" + (value || "") + expires + "; Path=/; SameSite=Strict;"
          },
          get: function (name) {
              var nameEQ = name + "="
              var ca = document.cookie.split(';')
              for (var i = 0; i < ca.length; i++) {
                  var c = ca[i]
                  while (c.charAt(0) === ' ') {
                      c = c.substring(1, c.length)
                  }
                  if (c.indexOf(nameEQ) === 0) {
                      return c.substring(nameEQ.length, c.length)
                  }
              }
              return undefined
          }
      }

      var Events = {
          documentReady: function (onDocumentReady) {
              if (document.readyState !== 'loading') {
                  onDocumentReady()
              } else {
                  document.addEventListener('DOMContentLoaded', onDocumentReady)
              }
          }
      }

      function init() {
        return this.cookieConsent
      }

      function showDialog() {
          Events.documentReady(function () {
              this.modal = document.getElementById(modalId)
              if (!self.modal) {
                  self.modal = document.createElement("div")
                  self.modal.id = modalId
                  self.modal.setAttribute("class", "modal fade")
                  self.modal.setAttribute("tabindex", "-1")
                  self.modal.setAttribute("role", "dialog")
                  self.modal.setAttribute("aria-labelledby", modalId)
                  document.body.append(self.modal)
                  self.$modal = $(self.modal)
                  if (self.options.postSelectionCallback) {
                      self.$modal.on("hidden.bs.modal", function () {
                          self.options.postSelectionCallback()
                      })
                  }
                  // load content
                  var templateUrl = self.options.contentURL + "/" + self.lang + ".html"
                  $.get(templateUrl)
                      .done(function (data) {
                          self.modal.innerHTML = data
                          $(self.modal).modal({
                              backdrop: "static",
                              keyboard: false
                          })
                          self.$buttonDoNotAgree = $("#bccs-buttonDoNotAgree")
                          self.$buttonAgree = $("#bccs-buttonAgree")
                          self.$buttonSave = $("#bccs-buttonSave")
                          self.$buttonAgreeAll = $("#bccs-buttonAgreeAll")
                          updateButtons()
                          updateOptionsFromCookie()
                          $("#bccs-options").on("hide.bs.collapse", function () {
                              detailedSettingsShown = false
                              updateButtons()
                          }).on("show.bs.collapse", function () {
                              detailedSettingsShown = true
                              updateButtons()
                          })
                          self.$buttonDoNotAgree.click(function () {
                              doNotAgree()
                          })
                          self.$buttonAgree.click(function () {
                              agreeAll()
                          })
                          self.$buttonSave.click(function () {
                              saveSettings()
                          })
                          self.$buttonAgreeAll.click(function () {
                              agreeAll()
                          })
                      })
                      .fail(function () {
                          console.error("You probably need to set `contentURL` in the options")
                          console.error("see documentation at https://github.com/shaack/bootstrap-cookie-banner")
                      })
              } else {
                  self.$modal.modal("show")
              }
          }.bind(this))

          // logText = 'initializing finished';
          // logger.info(logText);
      }

      function updateOptionsFromCookie() {
          var settings = self.getSettings()
          if (settings) {
              for (var setting in settings) {
                  var $checkbox = self.$modal.find("#bccs-options .bccs-option[data-name='" + setting + "'] input[type='checkbox']")
                  // noinspection JSUnfilteredForInLoop
                  $checkbox.prop("checked", settings[setting])
              }
          }
      }

      function updateButtons() {
          if (detailedSettingsShown) {
              self.$buttonDoNotAgree.hide()
              self.$buttonAgree.hide()
              self.$buttonSave.show()
              self.$buttonAgreeAll.show()
          } else {
              self.$buttonDoNotAgree.show()
              self.$buttonAgree.show()
              self.$buttonSave.hide()
              self.$buttonAgreeAll.hide()
          }
      }

      function gatherOptions(setAllExceptNecessary) {
          var $options = self.$modal.find("#bccs-options .bccs-option")
          var options = {}
          for (var i = 0; i < $options.length; i++) {
              var option = $options[i]
              var name = option.getAttribute("data-name")
              if (name === "necessary") {
                  options[name] = true
              } else if (setAllExceptNecessary === undefined) {
                  var $checkbox = $(option).find("input[type='checkbox']")
                  options[name] = $checkbox.prop("checked")
              } else {
                  options[name] = !!setAllExceptNecessary
              }
          }
          return options
      }

      function agreeAll() {
          Cookie.set(self.options.cookieName, JSON.stringify(gatherOptions(true)), self.options.cookieStorageDays)
          self.$modal.modal("hide")
      }

      function doNotAgree() {
          Cookie.set(self.options.cookieName, JSON.stringify(gatherOptions(false)), self.options.cookieStorageDays)
  //      logger.warn('delete cookie consent');
          j1.deleteCookie("j1.cookie.consent");
          self.$modal.modal("hide")
          j1.goHome();
  //      window.home();
  //      location.href = "about:home";
      }

      function saveSettings() {
          Cookie.set(self.options.cookieName, JSON.stringify(gatherOptions()), self.options.cookieStorageDays)
          self.$modal.modal("hide")
      }

      // init

      if (Cookie.get(this.options.cookieName) === undefined && this.options.autoShowDialog) {
          showDialog()
      }

      // API

      this.showDialog = function () {
          showDialog()
      }
      this.getSettings = function (optionName) {
          var cookie = Cookie.get(self.options.cookieName)
          if (cookie) {
              var settings = JSON.parse(Cookie.get(self.options.cookieName))
              if (optionName === undefined) {
                  return settings
              } else {
                  if (settings) {
                      return settings[optionName]
                  } else {
                      return false
                  }
              }
          } else {
              return undefined
          }
      }

}(jQuery, window);
