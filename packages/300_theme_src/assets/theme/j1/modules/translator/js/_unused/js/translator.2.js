/*
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/modules/translator/js/translator.js (2)
 # Provides JS Core functions|API for J1 Module Translator
 #
 #  Product/Info:
 #  http://jekyll.one
 #
 #  Copyright (C) 2026 Juergen Adams
 #
 #  J1 Theme is licensed under MIT License.
 #  See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 # -----------------------------------------------------------------------------
*/

// -----------------------------------------------------------------------------
// ESLint shimming
// -----------------------------------------------------------------------------
/* eslint indent: "off"                                                       */
/* eslint no-unused-vars: "off"                                               */
/* eslint no-undef: "off"                                                     */
/* eslint no-redeclare: "off"                                                 */
// claude - optimization chances: removed duplicate ESLint directive for
// "indent" that appeared twice in the original
/* eslint JSUnfilteredForInLoop: "off"                                        */
// -----------------------------------------------------------------------------

'use strict';
function Translator(props) {
  // ---------------------------------------------------------------------------
  // global vars
  // ---------------------------------------------------------------------------
  var self                  = this;
  var logger                = log4javascript.getLogger('j1.api.translator');
  var pageURL               = new liteURL(window.location.href);
  var cookieSecure          = (pageURL.protocol.includes('https')) ? true : false;
  var navigatorLanguage     = navigator.language || navigator.userLanguage;
  var detailedSettingsShown = false;
  // claude - optimization chances: removed duplicate declaration of
  // "defaultDialogLanguage" (was declared twice with same value 'en')
  var defaultDialogLanguage = 'en';
  var translator            = {};
  var navigator_language;
  var translation_language;

  // ---------------------------------------------------------------------------
  // Cookie()
  // manage cookies
  // ---------------------------------------------------------------------------
  var Cookie = {
    set: function (name, value, days, cookieSameSite, cookieDomain, cookieSecure) {
      var value_encoded = window.btoa(value);
      var expires = '; expires=Thu, 01 Jan 1970 00:00:00 UTC';
      if (days>0) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
      }

      // claude - optimization chances: simplified nested if/else branches
      // for cookie string construction into a single expression using
      // conditional parts, improving readability and reducing duplication
      var cookieStr = name + "=" + (value_encoded || '') + expires + '; Path=/; SameSite=' + cookieSameSite + ';';
      if (cookieDomain) {
        cookieStr += ' Domain=' + cookieDomain + ';';
      }
      if (cookieSecure) {
        cookieStr += ' Secure=' + cookieSecure + ';';
      }
      document.cookie = cookieStr;
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
  // default property settings
  // ---------------------------------------------------------------------------
  translator.props = {
    contentURL:              '/assets/data/translator',                         // this URL must contain the dialog content (modals) in the needed languages
    translatorLanguagesFile: '/assets/data/iso-639-language-codes-flags.json',  // this FILE contains all codes/flags that can be used by the "dialog modal"
    // claude - optimization chances: fixed typo "supprted" -> "supported"
    translatorLanguages:     'translator-languages',                            // contains the supported language codes/flags used by the "dialog modal"
    cookieName:              'j1.user.state',                                   // the name of the User State Cookie (primary data)
    cookieConsentName:       'j1.user.consent',                                 // the name of the Cookie Consent Cookie (secondary data)
    cookieStorageDays:       365,                                               // the duration the cookie is stored on the client
    cookieSameSite:          'Lax',                                             // restrict consent cookie to first-party, do NOT send cookie to other domains
    cookieSecure:            cookieSecure,                                      // secure flag on cookies
    translationEnabled:      false,                                             // enable|disable translation on first page view
    disableLanguageSelector: false,                                             // disable language dropdown for translation in dialog (modal)
    translatorName:          'google',                                          // name of the default translator
    translationLanguages:    'all',                                             // supported languages for translation
    translationLanguage:     'auto',                                            // language used for translation
    // claude - optimization chances: fixed typo "tranlation" -> "translation"
    translateAllPages:       true,                                              // enable translation on all pages
    hideSuggestionBox:       true,                                              // disable suggestions on translated text
    hidePoweredBy:           true,                                              // disable label "Powered by Google"
    hideTopFrame:            true,                                              // disable the (google) translator frame
    dialogLanguage:          'auto',                                            // language used for the consent dialog (modal)
    dialogLanguages:         ['en', 'de'],                                      // supported languages for the consent dialog (modal), defaults to first in array
    dialogContainerID:       'translator-modal',                                // container, the dialog modal is (dynamically) loaded
    xhrDataElement:          '',                                                // container for the language-specific consent modal taken from /assets/data/cookieconsent.html
    postSelectionCallback:   '',                                                // callback function, called after the user has made his selection
  };

  // merge properties from default|module
  for (var property in props) {
    translator.props[property] = props[property];
  }

  // extract the language portion (e.g. "en" for English)
  if (translator.props.dialogLanguage.indexOf("-") !== -1) {
    translator.props.dialogLanguage = translator.props.dialogLanguage.split("-")[0];
  }

  // claude - optimization chances: fixed typo "suppported" -> "supported"
  // fallback on default language (modal) if dialogLanguage not supported
  if (!translator.props.dialogLanguages.includes(translator.props.dialogLanguage)) {
    translator.props.dialogLanguage = defaultDialogLanguage;
  }

  // set the xhrDataElement of the modal loaded based on dialogLanguage
  translator.props.xhrDataElement = translator.props.xhrDataElement + '-' + translator.props.dialogLanguage;

  logger.info('initializing core module: started');
  logger.debug('state: started');

  var translationDefaultSettings = {
    "translatorName":         "google",
    "translationEnabled":     false,
    "translateAllPages":      true,
    "useLanguageFromBrowser": true,
    "translationLanguage":    "de",
    "analysis":               true,
    "personalization":        true
  };

  var translatorCookie = Cookie.get(translator.props.cookieName);
  if (!translatorCookie) {
    logger.info('initializing translator cookie: ' + translator.props.cookieName);
    // enable and write all settings required for translation (translation cookie)
    Cookie.set(
      translator.props.cookieName,
      JSON.stringify(translationDefaultSettings),
      translator.props.cookieStorageDays,
      translator.props.cookieSameSite,
      translator.props.cookieDomain,
      translator.props.cookieSecure
    );
  }

  // ---------------------------------------------------------------------------
  // internal helper functions
  // ---------------------------------------------------------------------------

  // ---------------------------------------------------------------------------
  // setCookie()
  // claude - optimization chances: extracted repeated Cookie.set call pattern
  // into a helper to reduce code duplication across agreeAll, doNotAgree,
  // saveSettings (the same 6 arguments were passed every time)
  // ---------------------------------------------------------------------------
  function setCookie(cookieName, value) {
    Cookie.set(
      cookieName,
      JSON.stringify(value),
      translator.props.cookieStorageDays,
      translator.props.cookieSameSite,
      translator.props.cookieDomain,
      translator.props.cookieSecure
    );
  }

  // ---------------------------------------------------------------------------
  // global event handler
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
    // claude - optimization chances: fixed inconsistent indentation on
    // the return statement (was indented too far)
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

  // ---------------------------------------------------------------------------
  // createMsDropdownFromJSON()
  // Create a msDropdown select DYNAMICALLY from JSON data located in a file
  // specified by "url". The JSON file contains multiple msDropdown elements
  // selected by "elm". The base (empty) <div> container the msDropdown will
  // be created is specified by the ID given by "selector".
  // claude - optimization chances: fixed typos "contaians" -> "contains"
  // and "theID" -> "the ID" in the comment block
  // ---------------------------------------------------------------------------
  function createMsDropdownFromJSON (options /* url, elm, selector */) {
    var selectorID;

    // -----------------------------------------------------------------------
    // Merge values from defaults|options
    // -----------------------------------------------------------------------
    var settings = extend ({
      size:   0,
      width:  250,
      multiple: false,
      selectedIndex: 1,
      enableAutoFilter: false,
      visibleRows: null,
    }, options);

    selectorID = '#' + settings.selector;

    // claude - optimization chances: return the jqXHR object from $.ajax()
    // so callers using $.when() actually receive a proper thenable/deferred
    return $.ajax({
      url: settings.url,
      dataType: 'json',
      success: function (data) {
        var dropdownLanguages = [];

        // collect translation languages
        if (translator.props.translationLanguages.includes('all')) {
          dropdownLanguages = data[settings.elm];
        } else {
          // claude - optimization chances: removed redundant length check
          // (dropdownLanguages.length == 0); the array was just created
          // empty on the line above, so this condition is always true.
          // Also removed unused variable "elementNotFoundText" that was
          // assigned but never read
          for (var i = 0; i < data[settings.elm].length; i++) {
            if (translator.props.translationLanguages.includes(data[settings.elm][i].value)) {
              dropdownLanguages.push(data[settings.elm][i]);
            }
          }
        }

        // correct rows of the dropdown if required
        if (settings.visibleRows > dropdownLanguages.length) {
          settings.visibleRows = dropdownLanguages.length;
        }

        // prevent multiple dropdowns created
        if ($('#dropdownJSON')[0].msDropdown === undefined) {
          // create the dropdown
          MsDropdown.make(selectorID, {
            byJson: {
              data: dropdownLanguages,
              name: settings.name,
              size: settings.size,
              width: settings.width,
              multiple: settings.multiple,
            },
            enableAutoFilter: settings.enableAutoFilter,
            visibleRows: settings.visibleRows,
          });
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        logger.error('failed to retrieve JSON data from: ' + settings.url);
      }
    });
  }

  // ---------------------------------------------------------------------------
  // showDialog
  // Show|Create the translation dialog (modal)
  // ---------------------------------------------------------------------------
  function showDialog() {
    // claude - optimization chances: added missing semicolon after
    // variable declaration
    var cbAction = 'none';
    Events.documentReady(function () {

      self.modal = document.getElementById(translator.props.dialogContainerID);
      if (!self.modal) {
        logger.info( 'load consent modal');

        self.modal = document.createElement('div');
        self.modal.id = translator.props.dialogContainerID;
        self.modal.style.display = 'none';

        self.modal.setAttribute('class', 'modal fade');
        self.modal.setAttribute('tabindex', '-1');
        self.modal.setAttribute('role', 'dialog');
        self.modal.setAttribute('aria-labelledby', translator.props.dialogContainerID);
        document.body.append(self.modal);
        self.$modal = $(self.modal);

        // ---------------------------------------------------------------------
        // register events for the dialog (modal)
        // ---------------------------------------------------------------------

        // ---------------------------------------------------------------------
        // on 'show'
        // ---------------------------------------------------------------------
        self.$modal.on('show.bs.modal', function () {
          // claude - optimization chances: removed two unused variable
          // declarations (msDropdownJSON, index) that were never referenced
          // inside this event handler
          logger.debug('show.bs.modal: entered');

          // create msDropdown from JSON data
          $.when (
            createMsDropdownFromJSON({
              url:                translator.props.translatorLanguagesFile,
              elm:                translator.props.translatorLanguages,
              selector:           'dropdownJSON',
              width:              400,
              visibleRows:        8,
            })
          )
          .then(function(data) {
            logger.info('creating msDropdown from JSON data: finished');
          });
        }); // END modal on 'show'

        // ---------------------------------------------------------------------
        // on 'shown'
        // ---------------------------------------------------------------------
        self.$modal.on('shown.bs.modal', function () {
          var msDropdownJSON;
          var dependencies_met_msDropdownJSON_loaded;
          // claude - optimization chances: added a max-iterations guard to
          // prevent the setInterval from polling indefinitely if the
          // msDropdown element never becomes available (e.g. network failure)
          var maxRetries = 500;
          var retryCount = 0;

          // found msDropdownJSON loaded slow on some PC
          dependencies_met_msDropdownJSON_loaded = setInterval (function () {
            retryCount++;
            if (retryCount > maxRetries) {
              logger.error('msDropdown loading timed out after ' + (maxRetries * 10) + 'ms');
              clearInterval(dependencies_met_msDropdownJSON_loaded);
              return;
            }

            if (typeof document.getElementById('dropdownJSON').msDropdown !== 'undefined') {
              msDropdownJSON = document.getElementById('dropdownJSON').msDropdown;
              if (!msDropdownJSON.length) {
              	// critical error
              	logger.error('no msDropdown found in translation dialog');
              	self.$modal.hide();
              } else {
              	// set translation language for auto detection
                // claude - optimization chances: reuse the already-computed
                // "navigatorLanguage" variable from the outer scope instead
                // of re-reading navigator.language / navigator.userLanguage
              	if (translator.props.translationLanguage === 'auto') {
              	  translation_language = navigatorLanguage.split('-')[0];
              	} else {
              	  translation_language = translator.props.translationLanguage;
              	}

                // claude - optimization chances: removed double semicolon
                // at end of line
              	// set translation language for the dropdown
              	msDropdownJSON.selectedIndex = $('#dropdownJSON option[value=' +  translation_language + ']').index();

              	// disable translation language selection
              	if (translator.props.disableLanguageSelector) {
              	  msDropdownJSON.disabled = true;
              	}

              	$('#dropdownJSON').show();

              	// jadams, 2021-10-18: added stop scrolling on the body,
              	// if modal is OPEN
              	$('body').addClass('stop-scrolling');

                logger.info('msDropdown successfully loaded in translation dialog');
                clearInterval(dependencies_met_msDropdownJSON_loaded);
              }
            }
          }, 10);

        }); // END modal on 'shown'

        // ---------------------------------------------------------------------
        // on 'hidden'
        // ---------------------------------------------------------------------
        self.$modal.on('hidden.bs.modal', function () {
          $('body').removeClass('stop-scrolling');
          // run the postSelectionCallback for (final) translation
          executeFunctionByName (translator.props.postSelectionCallback, window, cbAction);
        }); // END modal on 'hidden'

        // ---------------------------------------------------------------------
        // load the dialog (modal content)
        // ---------------------------------------------------------------------
        var templateUrl = translator.props.contentURL + '/' + 'index.html';
        $.get(templateUrl)
        .done(function (data) {
          logger.info('loading consent modal: successfully');
          self.modal.innerHTML = data;
          self.modal.innerHTML = $('#' + translator.props.xhrDataElement).eq(0).html();
          self.modal.style.display  = 'block';

          $(self.modal).modal({
            backdrop: 'static',
            keyboard: false
          });

          self.$buttonDoNotAgree = $('#translator-buttonDisableTranslation');
          self.$buttonAgree      = $('#translator-buttonTranslate');
          self.$buttonExit       = $('#translator-buttonExit');
          self.$buttonSave       = $('#translator-buttonSave');
          self.$buttonAgreeAll   = $('#translator-buttonTranslateAll');

          // claude - optimization chances: fixed typo "initialze" ->
          // "initialize" in log messages
          logger.info('load/initialize options from cookie');
          updateButtons();
          updateOptionsFromCookie();

          // -------------------------------------------------------------------
          // register button events for the dialog (modal)
          // -------------------------------------------------------------------
          $('#google-options').on('hide.bs.collapse', function () {
            detailedSettingsShown = false;
            updateButtons();
          }).on('show.bs.collapse', function () {
            detailedSettingsShown = true;
            updateButtons();
          });

          logger.info('initialize button event handler');

          self.$buttonDoNotAgree.click(function () {
            doNotAgree();
            cbAction = 'process';
          });
          self.$buttonAgree.click(function () {
            agreeAll();
            cbAction = 'process';
          });
          self.$buttonExit.click(function () {
            cbAction = 'exitOnly';
            exitAll();
          });
          self.$buttonSave.click(function () {
            $('#google-options').collapse('hide');
            saveSettings();
            updateOptionsFromCookie();
            cbAction = 'process';
          });
          self.$buttonAgreeAll.click(function () {
            $('#google-options').collapse('hide');
            agreeAll();
            cbAction = 'process';
          });
          self.$modal.modal('show');
        })
        .fail(function () {
          logger.error('loading translator dialog (modal): failed');
          logger.warn('probably no|wrong `contentURL` set');
        });
      } else {
        self.$modal.modal('show');
      }
    }.bind(this));
  }

  // ---------------------------------------------------------------------------
  // updateOptionsFromCookie()
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
  // updateButtons()
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
  // gatherOptions()
  // collect current settings from all checkboxes in dialog (modal)
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
  // agreeAll()
  // process current settings from checkboxes for button 'agreeAll'
  // On 'agreeAll', enable ALL settings required for translation
  // ---------------------------------------------------------------------------
  function agreeAll() {
    var consentSettings     = JSON.parse(Cookie.get(translator.props.cookieConsentName));
    var translationSettings = JSON.parse(Cookie.get(translator.props.cookieName));

    // enable all settings required for translation
    translationSettings.analysis = true;
    translationSettings.personalization = true;
    translationSettings.translationEnabled = true;

    // overload user consent settings (consent cookie)
    consentSettings.analysis        = translationSettings.analysis;
    consentSettings.personalization = translationSettings.personalization;

    // claude - optimization chances: use setCookie helper to reduce
    // repeated boilerplate arguments
    setCookie(translator.props.cookieConsentName, consentSettings);
    setCookie(translator.props.cookieName, translationSettings);

    self.$modal.modal('hide');
  }

  function exitAll() {
    self.$modal.modal('hide');
  }

  // ---------------------------------------------------------------------------
  // doNotAgree()
  // process current settings from checkboxes for button `doNotAgree`
  // ---------------------------------------------------------------------------
  function doNotAgree() {
    var translationSettings = gatherOptions();

    // disable all settings required for translation (translation cookie)
    translationSettings.translationEnabled = false;

    // claude - optimization chances: use setCookie helper
    setCookie(translator.props.cookieName, translationSettings);

    self.$modal.modal('hide');
  }

  // ---------------------------------------------------------------------------
  // saveSettings()
  // write current settings from checkboxes to cookie
  // ---------------------------------------------------------------------------
  function saveSettings() {
    var translationSettings = gatherOptions();
    var consentSettings     = JSON.parse(Cookie.get(translator.props.cookieConsentName));

    // update all cookies required for (google-)translation
    consentSettings.analysis        = translationSettings.analysis;
    consentSettings.personalization = translationSettings.personalization;

    // claude - optimization chances: use setCookie helper
    setCookie(translator.props.cookieConsentName, consentSettings);
    setCookie(translator.props.cookieName, translationSettings);

    self.$modal.modal('hide');
  }

  // ===========================================================================
  // API functions
  // ===========================================================================

  // ---------------------------------------------------------------------------
  // showDialog()
  // show the translator dialog (modal)
  // ---------------------------------------------------------------------------
  this.showDialog = function () {
    showDialog();
  }; // END showDialog

  // ---------------------------------------------------------------------------
  // getSettings()
  // collect settings from cookie
  // ---------------------------------------------------------------------------
  this.getSettings = function (optionName) {
    var cookie = Cookie.get(translator.props.cookieName);
    if (cookie) {
      // claude - optimization chances: reuse the already-retrieved "cookie"
      // variable instead of calling Cookie.get() a second time with the
      // same name
      var settings = JSON.parse(cookie);
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

  logger.info('initializing core module finished');
  logger.debug('state: finished');

} // END Translator