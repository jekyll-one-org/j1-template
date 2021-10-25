/*
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/modules/translator/js/translator.js
 # Provides JS Core functions|API for J1 Module Translator
 #
 #  Product/Info:
 #  http://jekyll.one
 #
 #  Copyright (C) 2021 Juergen Adams
 #
 #  J1 Template is licensed under MIT License.
 #  See: https://github.com/jekyll-one/J1 Template/blob/master/LICENSE
 # -----------------------------------------------------------------------------
*/
'use strict';

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

function Translator(props) {
  var logger                = log4javascript.getLogger('j1.core.translator');
  var dialogContainerID   = 'translator-modal';
  var self                  = this;
  var detailedSettingsShown = false;
  var url                   = new liteURL(window.location.href);
  var cookieSecure          = (url.protocol.includes('https')) ? true : false;
  var logText;
  var current_page;
  var whitelisted;
  var ddTranslationSourceLanguage;
  var navigator_language;
  var translation_language;

  // ---------------------------------------------------------------------------
  // var and propertiy settings
  // ---------------------------------------------------------------------------

  this.props = {
    contentURL:             '/assets/data/translator',                          // this URL must contain the dialog content (modals) in the needed languages
    cookieName:             'j1.user.state',                                    // the name of the User State Cookie (primary data)
    cookieConsentName:      'j1.user.consent',                                  // the name of the Cookie Consent Cookie (secondary data)
    cookieStorageDays:      365,                                                // the duration the cookie is stored on the client
    cookieSameSite:         'Strict',                                           // restrict consent cookie to first-party, do NOT send cookie to other domains
    cookieSecure:           false,
    translationEnabled:     false,
    translatorName:         'google',
    translationLanguage:    'auto',
    translateAllPages:      true,                                               // enable tranlation on all pages
    hideSuggestionBox:      true,                                               // disable suggestions on translated text
    hidePoweredBy:          true,                                               // disable label "Powered by Google"
    hideTopFrame:           true,                                               // disable the (google) translator frame
    dialogLanguage:         'content',                                          // language used for the consent dialog (modal)
    dialogLanguages:        ['en','de'],                                        // supported languages for the consent dialog (modal), defaults to first in array//
    dialogContainerID:      'translator-modal',                                 // container, the dialog modal is (dynamically) loaded
    xhrDataElement:         '',                                                 // container for the language-specific consent modal taken from /assets/data/cookieconsent.html
    postSelectionCallback:  undefined,                                          // callback function, called after the user has made his selection
  };

  // supported languages by Google Translate
  this.googleTranslatorLanguages = {
      'af':     { 'name': 'Afrikaans' },
      'sq':     { 'name': 'Albanian' },
      'ar':     { 'name': 'Arabic' },
      'hy':     { 'name': 'Armenian' },
      'az':     { 'name': 'Azerbaijani' },
      'eu':     { 'name': 'Basque' },
      'be':     { 'name': 'Belarusian' },
      'bn':     { 'name': 'Bengali' },
      'bg':     { 'name': 'Bulgarian' },
      'ca':     { 'name': 'Catalan' },
      'zh-CN':  { 'name': 'Chinese (Simplified)' },
      'zh-TW':  { 'name': 'Chinese (Traditional)' },
      'hr':     { 'name': 'Croatian' },
      'cs':     { 'name': 'Czech' },
      'da':     { 'name': 'Danish' },
      'nl':     { 'name': 'Dutch' },
      'eo':     { 'name': 'Esperanto' },
      'et':     { 'name': 'Estonian' },
      'tl':     { 'name': 'Filipino' },
      'fi':     { 'name': 'Finnish' },
      'fr':     { 'name': 'French' },
      'gl':     { 'name': 'Galician' },
      'ka':     { 'name': 'Georgian' },
      'de':     { 'name': 'German' },
      'el':     { 'name': 'Greek' },
      'gu':     { 'name': 'Gujarati' },
      'ht':     { 'name': 'Haitian Creole' },
      'iw':     { 'name': 'Hebrew' },
      'hi':     { 'name': 'Hindi' },
      'hu':     { 'name': 'Hungarian' },
      'is':     { 'name': 'Icelandic' },
      'id':     { 'name': 'Indonesian' },
      'ga':     { 'name': 'Irish' },
      'it':     { 'name': 'Italian' },
      'ja':     { 'name': 'Japanese' },
      'kn':     { 'name': 'Kannada' },
      'ko':     { 'name': 'Korean' },
      'la':     { 'name': 'Latin' },
      'lv':     { 'name': 'Latvian' },
      'lt':     { 'name': 'Lithuanian' },
      'mk':     { 'name': 'Macedonian' },
      'ms':     { 'name': 'Malay' },
      'mt':     { 'name': 'Maltese' },
      'no':     { 'name': 'Norwegian' },
      'fa':     { 'name': 'Persian' },
      'pl':     { 'name': 'Polish' },
      'pt':     { 'name': 'Portuguese' },
      'ro':     { 'name': 'Romanian' },
      'ru':     { 'name': 'Russian' },
      'sr':     { 'name': 'Serbian' },
      'sk':     { 'name': 'Slovak' },
      'sl':     { 'name': 'Slovenian' },
      'es':     { 'name': 'Spanish' },
      'sw':     { 'name': 'Swahili' },
      'sv':     { 'name': 'Swedish' },
      'ta':     { 'name': 'Tamil' },
      'te':     { 'name': 'Telugu' },
      'th':     { 'name': 'Thai' },
      'tr':     { 'name': 'Turkish' },
      'uk':     { 'name': 'Ukrainian' },
      'ur':     { 'name': 'Urdu' },
      'vi':     { 'name': 'Vietnamese' },
      'cy':     { 'name': 'Welsh' },
      'yi':     { 'name': 'Yiddish' }
  };

  // supported languages by Deepl Translate
  this.deeplTranslatorLanguages = {
      'bg':     { 'name': 'Bulgarian' },
      'cs':     { 'name': 'Czech' },
      'da':     { 'name': 'Danish' },
      'de':     { 'name': 'German' },
      'el':     { 'name': 'Greek' },
      'es':     { 'name': 'Spanish' },
      'en':     { 'name': 'English' },
      'en-us':  { 'name': 'English (American)' },
      'en-uk':  { 'name': 'English (British)' },
      'et':     { 'name': 'Estonian' },
      'ft':     { 'name': 'Finnish' },
      'fr':     { 'name': 'French' },
      'hu':     { 'name': 'Hungarian' },
      'it':     { 'name': 'Italian' },
      'ja':     { 'name': 'Japanese' },
      'lv':     { 'name': 'Latvian' },
      'lt':     { 'name': 'Lithuanian' },
      'nl':     { 'name': 'Dutch' },
      'af':     { 'name': 'Polish' },
      'pt':     { 'name': 'Portuguese' },
      'pt-pt':  { 'name': 'Portuguese (Portugal)' },
      'pt-br':  { 'name': 'Portuguese (Brazilian)' },
      'ro':     { 'name': 'Romanian' },
      'ru':     { 'name': 'Russian' },
      'sk':     { 'name': 'Slovak' },
      'sl':     { 'name': 'Slovenian' },
      'sv':     { 'name': 'Swedish' },
      'zh':     { 'name': 'Chinese' },
  };

  for (var property in props) {
    this.props[property] = props[property];
  }

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

  logger.info('\n' + 'initializing core module: started');
  logger.info('\n' + 'state: started');

  // ---------------------------------------------------------------------------
  // internal functions
  // ---------------------------------------------------------------------------

  // ---------------------------------------------------------------------------
  // manage cookies
  // ---------------------------------------------------------------------------
  var Cookie = {
    set: function (name, value, days, samesite, secure) {
      var value_encoded = window.btoa(value);
      var expires = '';
      if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = '; expires=' + date.toUTCString();
      }
      if (secure) {
        document.cookie = name + '=' + (value_encoded || '') + expires + '; Path=/; SameSite=' + samesite + '; ' + 'secure=' + secure + ';';
      } else {
        document.cookie = name + '=' + (value_encoded || '') + expires + '; Path=/; SameSite=' + samesite + ';';
      }
    },
    get: function (name) {
    var nameEQ = name + '=';
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

  // ---------------------------------------------------------------------------
  // manage events
  // ---------------------------------------------------------------------------
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
  // createMsDropdownFromJSON
  // Create a msDropdown select DYNAMICALLY from JSON data located in a file
  // specified by "url". The JSON file contaians mutiple msDropdown elements
  // selected by "elm". The base (empty) <div> container the msDropdown will
  // be created is specified by theID given by "selector".
  // ---------------------------------------------------------------------------
  function createMsDropdownFromJSON (options /* url, elm, selector */) {
    var _this       = this;
    var selectorID  = '#' + options.selector;

    $.ajax({
      url: options.url,
      dataType: 'json',
      success: function (data) {
        MsDropdown.make(selectorID, {
          byJson: {
            data: data[options.elm],
            name: options.selector,
//          size: 0,
//          selectedIndex: 0,
//          width: 450,
//          multiple: false
          },
          enableAutoFilter:false
        });

        // msDropdown = document.getElementById(options.selector).msDropdown;
        // msDropdown.selectedIndex  = 1;
        // $(selectorID).show();
        // msDropdown.on('close', function() {
        //   console.log(msDropdown.value)
        // });
      },
      error: function (jqXHR, textStatus, errorThrown) {
        logger.error('\n' + 'failed to retrieve JSON data from: ' + url);
      }
    });
  }

  function showDialog() {
    Events.documentReady(function () {

      self.modal = document.getElementById(self.props.dialogContainerID);
      if (!self.modal) {
        logger.info('\n' +  'load consent modal');
        self.modal = document.createElement('div');
        self.modal.id = self.props.dialogContainerID;
        self.modal.setAttribute('class', 'modal fade');
        self.modal.setAttribute('tabindex', '-1');
        self.modal.setAttribute('role', 'dialog');
        self.modal.setAttribute('aria-labelledby', dialogContainerID);
        document.body.append(self.modal);
        self.$modal = $(self.modal);

        if (self.props.postSelectionCallback) {
          self.$modal.on('hidden.bs.modal', function () {
            self.props.postSelectionCallback();
          });
        }

        // ---------------------------------------------------------------------
        // register additional events for the dialog (modal)
        // ---------------------------------------------------------------------

        // ---------------------------------------------------------------------
        // on 'shown'
        self.$modal.on('shown.bs.modal', function () {
          if (self.props.translationLanguage === 'auto') {
            navigator_language    = navigator.language || navigator.userLanguage;
            translation_language  = navigator_language.split('-')[0];
          }

          // $.when (
          //   createMsDropdownFromJSON({
          //     url:      '/assets/data/ms_select.json',
          //     elm:      'googleLanguages',
          //     selector: 'dropdowsJSON',
          //   })
          // )
          // .then(function(data) {
          //   $('#dropdowsJSON').show();
          //   var msDropdown = document.getElementById('dropdowsJSON').msDropdown;
          //   msDropdown.selectedIndex  = 1;
          //
          //   msDropdown.on('close', function() {
          //     console.log(msDropdown.value)
          //   });
          // });

          var msDropdownSourceLanguage = document.getElementById("translate-source-language").msDropdown;

          // msDropdownSourceLanguage.on('close', function() {
          //   var selectedLanguage  = msDropdownSourceLanguage.value.toLowerCase();
          //
          //   if (translation_language !== selectedLanguage) {
          //     settings = JSON.parse(Cookie.get(self.props.cookieName));
          //     settings.translationLanguage  = selectedLanguage;
          //     Cookie.set(self.props.cookieName, JSON.stringify(settings), self.props.cookieStorageDays, self.props.sameSite, self.props.secure);
          //
          //     logger.info('\n' + 'selected language: ' + selectedLanguage);
          //     return false;
          //   }
          // });

          // workaround: limit the height of the resulting list (UL)
          // of the 'dd' select
          // $('.ms-options').css('max-height', '10.5937rem');

          // jadams, 2021-10-18: added stop scrolling on the body,
          // if modal is OPEN
          $('body').addClass('stop-scrolling');

          // jadams, 2021-10-18: disable source language selection
          if (self.props.translationLanguage === 'auto') {
            msDropdownSourceLanguage.disabled = true;
            // msDropdownSourceLanguage.disabled = false;
          }

          // jadams, 2021-10-18: doesn't work for sizes > 1 !!!
          // get access to msDropdown elements (API)
          // set the size to limit the list
          // msDropdownSourceLanguage.size = 1;

        });

        // ---------------------------------------------------------------------
        // on 'hidden'
        self.$modal.on('hidden.bs.modal', function () {
          var msDropdownSourceLanguage = document.getElementById("translate-source-language").msDropdown;
          var selectedLanguage = msDropdownSourceLanguage.value.toLowerCase();
          var settings;

          if (translation_language !== selectedLanguage) {
            settings = JSON.parse(Cookie.get(self.props.cookieName));
            settings.translationLanguage  = selectedLanguage;
            Cookie.set(self.props.cookieName, JSON.stringify(settings), self.props.cookieStorageDays, self.props.sameSite, self.props.secure);

            logger.info('\n' + 'selected language: ' + selectedLanguage);
            return false;
          }
          $('body').removeClass('stop-scrolling');
        });

        // load dialog (modal content)
        //
        var templateUrl = self.props.contentURL + '/' + 'index.html';
        $.get(templateUrl)
        .done(function (data) {
          logger.info('\n' + 'loading consent modal: successfully');
          self.modal.innerHTML = data;
          self.modal.innerHTML = $('#' + self.props.xhrDataElement).eq(0).html();

          $(self.modal).modal({
            backdrop: 'static',
            keyboard: false
          });

          self.$buttonDoNotAgree = $('#translator-buttonDoNotAgree');
          self.$buttonAgree      = $('#translator-buttonAgree');
          self.$buttonSave       = $('#translator-buttonSave');
          self.$buttonAgreeAll   = $('#translator-buttonAgreeAll');

          logger.info('\n' + 'load/initialze options from cookie');
          updateButtons();
          updateOptionsFromCookie();

          $('#google-options').on('hide.bs.collapse', function () {
            detailedSettingsShown = false;
            updateButtons();
          }).on('show.bs.collapse', function () {
            detailedSettingsShown = true;
            updateButtons();
          });

          logger.info('\n' + 'initialze button event handler');

          self.$buttonDoNotAgree.click(function () {
            doNotAgree();
          });
          self.$buttonAgree.click(function () {
            agreeAll();
          });
          self.$buttonSave.click(function () {
            $('#google-options').collapse('hide');
            saveSettings();
            updateOptionsFromCookie();
          });
          self.$buttonAgreeAll.click(function () {
            $('#google-options').collapse('hide');
            agreeAll();
          });
        })
        .fail(function () {
          logger.error('\n' + 'loading translator dialog (modal): failed');
          logger.warn('\n' + 'probably no|wrong `contentURL` set');
        });
      } else {
        self.$modal.modal('show');
      }
    }.bind(this));
  }

  // ---------------------------------------------------------------------------
  // update all checkboxes in dialog (modal) from current cookie settings
  // ---------------------------------------------------------------------------
  function updateOptionsFromCookie() {
    var settings = self.getSettings();
    if (settings) {
      for (var setting in settings) {
        var $checkbox = self.$modal.find('#google-options .translator-option[data-name=' + setting + '] input[type="checkbox"]');
        $checkbox.prop('checked', settings[setting]);
      }
    }
  }

  // ---------------------------------------------------------------------------
  // toggle dialog (modal) buttons
  // ---------------------------------------------------------------------------
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

  // ---------------------------------------------------------------------------
  // collect current settings from checkboxes in dialog (modal)
  // ---------------------------------------------------------------------------
  function gatherOptions(setAllExceptNecessary) {
    var $options = self.$modal.find('#google-options .translator-option');
    var options = {};
    for (var i = 0; i < $options.length; i++) {
      var option = $options[i];
      var name = option.getAttribute('data-name');
      if (name === 'necessary') {
        options[name] = true;
      } else if (setAllExceptNecessary === undefined) {
        var $checkbox = $(option).find('input[type="checkbox"]');
        options[name] = $checkbox.prop('checked');
      } else {
        options[name] = !!setAllExceptNecessary;
      }
    }
    return options;
  }

  // ---------------------------------------------------------------------------
  // process current settings from checkboxes for `agreeAll`
  // ---------------------------------------------------------------------------
  function agreeAll() {
    var settings;
    var consentSettings = {};

    settings                        = gatherOptions();
    consentSettings                 = JSON.parse(Cookie.get(self.props.cookieConsentName));
    consentSettings.analysis        = settings.analysis;
    consentSettings.personalization = settings.personalization;

    Cookie.set(
      self.props.cookieConsentName,
      JSON.stringify(consentSettings),
      self.props.cookieStorageDays,
      self.props.sameSite,
      self.props.secure
    );
    Cookie.set(
      self.props.cookieName,
      JSON.stringify(gatherOptions(true)),
      self.props.cookieStorageDays,
      self.props.sameSite,
      self.props.secure
    );

    self.$modal.modal('hide');
  }

  // ---------------------------------------------------------------------------
  // process current settings from checkboxes for `doNotAgree`
  // ---------------------------------------------------------------------------
  function doNotAgree() {
    var settings = gatherOptions();

    settings.translationEnabled = false;
    Cookie.set(
      self.props.cookieName,
      JSON.stringify(settings),
      self.props.cookieStorageDays,
      self.props.sameSite,
      self.props.secure
    );
    self.$modal.modal('hide');
  }

  // ---------------------------------------------------------------------------
  // write current settings from checkboxes to cookie
  // ---------------------------------------------------------------------------
  function saveSettings() {
    var settings;
    var consentSettings = {};

    // update all cookies required for (google-)translation
    //
    settings                        = gatherOptions();
    consentSettings                 = JSON.parse(Cookie.get(self.props.cookieConsentName));
    consentSettings.analysis        = settings.analysis;
    consentSettings.personalization = settings.personalization;

    Cookie.set(
      self.props.cookieConsentName,
      JSON.stringify(consentSettings),
      self.props.cookieStorageDays,
      self.props.sameSite,
      self.props.secure
    );
    Cookie.set(
      self.props.cookieName,
      JSON.stringify(gatherOptions()),
      self.props.cookieStorageDays,
      self.props.sameSite,
      self.props.secure
    );
    self.$modal.modal('hide');
  }

  // ===========================================================================
  // API functions
  // ===========================================================================

  // ---------------------------------------------------------------------------
  // show the translator dialog (modal)
  // ---------------------------------------------------------------------------
  this.showDialog = function () {
    showDialog();
  }; // END showDialog

  // ---------------------------------------------------------------------------
  // collect settings from cookie
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

  logger.info('\n' + 'initializing core module finished');
  logger.info('\n' + 'state: finished');

} // END Translator
