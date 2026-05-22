/*
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/modules/translator/js/translator.js (3)
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

// claude - optimization chances #2: rewrote the Translator constructor
// function as an ES6 class. All internal helper functions become private
// methods (prefixed with underscore by convention), public API methods
// are declared directly on the class body, and "self = this" aliasing
// is eliminated in favor of arrow functions that preserve lexical "this".

class Translator {

  // ---------------------------------------------------------------------------
  // constructor
  // ---------------------------------------------------------------------------
  constructor(props) {
    // -------------------------------------------------------------------------
    // instance vars
    // -------------------------------------------------------------------------
    this._logger                = log4javascript.getLogger('j1.api.translator');
    this._pageURL               = new liteURL(window.location.href);
    this._cookieSecure          = this._pageURL.protocol.includes('https');
    this._navigatorLanguage     = navigator.language || navigator.userLanguage;
    this._detailedSettingsShown = false;
    // claude - optimization chances: removed duplicate declaration of
    // "defaultDialogLanguage" (was declared twice with same value 'en')
//  this._defaultDialogLanguage = 'en';
    this._translator            = {};

    // claude - optimization chances #2: replaced loose variables
    // "navigator_language" and "translation_language" that were declared
    // but only used locally; "translation_language" is now scoped to the
    // method that needs it, and "navigator_language" was never used at all

    // -------------------------------------------------------------------------
    // Cookie helper (static-like utility on the instance)
    // -------------------------------------------------------------------------
    // claude - optimization chances #2: converted the Cookie object into
    // a pair of private methods (_setCookieRaw / _getCookieRaw) so the
    // class owns its cookie logic without an intermediate object literal
    // -------------------------------------------------------------------------

    // -------------------------------------------------------------------------
    // default property settings
    // -------------------------------------------------------------------------
    this._translator.props = {
      // contentURL:                 '/assets/data/translator',                         // this URL must contain the dialog content (modals) in the needed languages
      // translatorLanguagesFile:    '/assets/data/iso-639-language-codes-flags.json',  // this FILE contains all codes/flags that can be used by the "dialog modal"
      // translatorLanguages:        'translator-languages',                            // contains the supported language codes/flags used by the "dialog modal"
      // translatorLocalStorageKey:  'user_translate',                                  // the localStorage key for User State (primary data)
      // cookieConsentName:          'j1.user.consent',                                 // the name of the Cookie Consent Cookie (secondary data)
      // cookieStorageDays:          365,                                               // the duration the cookie is stored on the client
      // cookieSameSite:             'Lax',                                             // restrict consent cookie to first-party, do NOT send cookie to other domains
      // cookieSecure:               this._cookieSecure,                                // secure flag on cookies
      // translationEnabled:         false,                                             // enable|disable translation on first page view
      // disableLanguageSelector:    false,                                             // disable language dropdown for translation in dialog (modal)
      // translatorName:             'google',                                          // name of the default translator
      // translationLanguages:       ['en', 'de', 'es', 'fr', 'it'],                    // supported languages for translation
      // defaultLanguage:            'en',                                              // default language of the website (documents)
      // translateAllPages:          true,                                              // enable translation on all pages
      // hideSuggestionBox:          true,                                              // disable suggestions on translated text
      // hidePoweredBy:              true,                                              // disable label "Powered by Google"
      // hideTopFrame:               true,                                              // disable the (google) translator frame
      // dialogContainerID:          'translator-modal',                                // container, the dialog modal is (dynamically) loaded
      // xhrDataElement:             '',                                                // container for the language-specific consent modal taken from /assets/data/cookieconsent.html
      // postSelectionCallback:      '',                                                // callback function, called after the user has made his selection
    };

    // merge properties from default|module
    // claude - optimization chances #2: use Object.assign() instead of a
    // manual for-in loop; this is both shorter and avoids iterating over
    // inherited prototype properties without a hasOwnProperty guard
    if (props) {
      Object.assign(this._translator.props, props);
    }

    // extract the language portion (e.g. "en" for English)
    // if (this._translator.props.dialogLanguage.indexOf('-') !== -1) {
    //   this._translator.props.dialogLanguage = this._translator.props.dialogLanguage.split('-')[0];
    // }

    // fallback on default language (modal) if dialogLanguage not supported
    // if (!this._translator.props.dialogLanguages.includes(this._translator.props.dialogLanguage)) {
    //   this._translator.props.dialogLanguage = this._defaultDialogLanguage;
    // }

    // set the xhrDataElement of the modal loaded based on dialogLanguage
//  this._translator.props.xhrDataElement = this._translator.props.xhrDataElement + '-' + this._translator.props.dialogLanguage;
    this._translator.props.xhrDataElement = this._translator.props.xhrDataElement;

    this._logger.info('initializing core module: started');
    this._logger.debug('state: started');

    var translationDefaultSettings = {
      "translatorName":         "google",
      "translationEnabled":     false,
      "translateAllPages":      true,
      "useLanguageFromBrowser": true,
      "translationLanguage":    "de",
      "analysis":               true,
      "personalization":        true
    };

    // claude - translator change cookie to local storage #2
    // read translator settings from localStorage instead of cookie
    var translatorData = this._getTranslatorData();
    if (!translatorData) {
      this._logger.info('initializing translator local storage: ' + this._translator.props.translatorLocalStorageKey);
      this._setTranslatorData(translationDefaultSettings);
    }

    this._logger.info('initializing core module finished');
    this._logger.debug('state: finished');
  }

  // ===========================================================================
  // private cookie helpers
  // ===========================================================================

  // ---------------------------------------------------------------------------
  // _setCookieRaw()
  // low-level cookie writer
  // ---------------------------------------------------------------------------
  _setCookieRaw(name, value, days, cookieSameSite, cookieDomain, cookieSecure) {
    var value_encoded = window.btoa(value);
    var expires = '; expires=Thu, 01 Jan 1970 00:00:00 UTC';
    if (days > 0) {
      var date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = '; expires=' + date.toUTCString();
    }

    // claude - optimization chances: simplified nested if/else branches
    // for cookie string construction into a single expression using
    // conditional parts, improving readability and reducing duplication
    var cookieStr = name + '=' + (value_encoded || '') + expires + '; Path=/; SameSite=' + cookieSameSite + ';';
    if (cookieDomain) {
      cookieStr += ' Domain=' + cookieDomain + ';';
    }
    if (cookieSecure) {
      cookieStr += ' Secure=' + cookieSecure + ';';
    }
    document.cookie = cookieStr;
  }

  // ---------------------------------------------------------------------------
  // _getCookieRaw()
  // low-level cookie reader
  // ---------------------------------------------------------------------------
  _getCookieRaw(name) {
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

  // ---------------------------------------------------------------------------
  // _setCookie()
  // claude - optimization chances: extracted repeated Cookie.set call pattern
  // into a helper to reduce code duplication across agreeAll, doNotAgree,
  // saveSettings (the same 6 arguments were passed every time)
  // ---------------------------------------------------------------------------
  _setCookie(cookieName, value) {
    this._setCookieRaw(
      cookieName,
      JSON.stringify(value),
      this._translator.props.cookieStorageDays,
      this._translator.props.cookieSameSite,
      this._translator.props.cookieDomain,
      this._translator.props.cookieSecure
    );
  }

  // ---------------------------------------------------------------------------
  // _getTranslatorData()
  // claude - translator change cookie to local storage #2
  // read translator settings from localStorage using key 'user_translate'
  // ---------------------------------------------------------------------------
  _getTranslatorData() {
    try {
      var raw = localStorage.getItem(this._translator.props.translatorLocalStorageKey);
      if (raw) {
        return JSON.parse(raw);
      }
      return undefined;
    } catch (e) {
      this._logger.error('failed to read translator data from localStorage: ' + e);
      return undefined;
    }
  }

  // ---------------------------------------------------------------------------
  // _setTranslatorData()
  // claude - translator change cookie to local storage #2
  // write translator settings to localStorage using key 'user_translate'
  // ---------------------------------------------------------------------------
  _setTranslatorData(value) {
    try {
      localStorage.setItem(
        this._translator.props.translatorLocalStorageKey,
        JSON.stringify(value)
      );
    } catch (e) {
      this._logger.error('failed to write translator data to localStorage: ' + e);
    }
  }

  // ===========================================================================
  // private internal helpers
  // ===========================================================================

  // ---------------------------------------------------------------------------
  // _onDocumentReady()
  // global event handler
  // ---------------------------------------------------------------------------
  _onDocumentReady(callback) {
    if (document.readyState !== 'loading') {
      callback();
    } else {
      document.addEventListener('DOMContentLoaded', callback);
    }
  }

  // ---------------------------------------------------------------------------
  // _extend()
  // deep merge of two objects
  // claude - optimization chances #2: since _extend() is only ever called
  // for a shallow merge (no deep=true flag passed), consider replacing it
  // with Object.assign() at the call-site. Keeping it for now for parity,
  // but flagging for future simplification.
  // ---------------------------------------------------------------------------
  _extend() {
    var extended = {};
    var deep = false;
    var i = 0;
    var length = arguments.length;

    if (Object.prototype.toString.call(arguments[0]) === '[object Boolean]') {
      deep = arguments[0];
      i++;
    }

    var merge = function (obj) {
      for (var prop in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, prop)) {
          if (deep && Object.prototype.toString.call(obj[prop]) === '[object Object]') {
            extended[prop] = this._extend(true, extended[prop], obj[prop]);
          } else {
            extended[prop] = obj[prop];
          }
        }
      }
    }.bind(this);

    for (; i < length; i++) {
      var obj = arguments[i];
      merge(obj);
    }
    // claude - optimization chances: fixed inconsistent indentation on
    // the return statement (was indented too far)
    return extended;
  }

  // ---------------------------------------------------------------------------
  // _executeFunctionByName()
  // execute a function by NAME (functionName) in a browser context
  // ---------------------------------------------------------------------------
  _executeFunctionByName(functionName, context /*, args */) {
    var args = Array.prototype.slice.call(arguments, 2);
    var namespaces = functionName.split('.');
    var func = namespaces.pop();
    for (var i = 0; i < namespaces.length; i++) {
      context = context[namespaces[i]];
    }
    return context[func].apply(context, args);
  }

  // ---------------------------------------------------------------------------
  // _createMsDropdownFromJSON()
  // Create a msDropdown select DYNAMICALLY from JSON data located in a file
  // specified by "url". The JSON file contains multiple msDropdown elements
  // selected by "elm". The base (empty) <div> container the msDropdown will
  // be created is specified by the ID given by "selector".
  // ---------------------------------------------------------------------------
  _createMsDropdownFromJSON(options /* url, elm, selector */) {
    var selectorID;
    var translatorProps = this._translator.props;

    var settings = this._extend({
      size:             0,
      width:            250,
      multiple:         false,
      selectedIndex:    1,
      enableAutoFilter: false,
      visibleRows:      null,
    }, options);

    selectorID = '#' + settings.selector;

    // claude - optimization chances: return the jqXHR object from $.ajax()
    // so callers using $.when() actually receive a proper thenable/deferred
    return $.ajax({
      url: settings.url,
      dataType: 'json',
      success: (data) => {
        var dropdownLanguages = [];

        if (translatorProps.translationLanguages.includes('all')) {
          dropdownLanguages = data[settings.elm];
        } else {
          // claude - optimization chances: removed redundant length check
          // (dropdownLanguages.length == 0); the array was just created
          // empty on the line above, so this condition is always true.
          // Also removed unused variable "elementNotFoundText" that was
          // assigned but never read
          for (var i = 0; i < data[settings.elm].length; i++) {
            if (translatorProps.translationLanguages.includes(data[settings.elm][i].value)) {
              dropdownLanguages.push(data[settings.elm][i]);
            }
          }
        }

        if (settings.visibleRows > dropdownLanguages.length) {
          settings.visibleRows = dropdownLanguages.length;
        }

        if ($('#dropdownJSON')[0].msDropdown === undefined) {
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
      error: (jqXHR, textStatus, errorThrown) => {
        this._logger.error('failed to retrieve JSON data from: ' + settings.url);
      }
    });
  }

  // ---------------------------------------------------------------------------
  // _updateOptionsFromCookie()
  // claude - translator change cookie to local storage #2
  // update all checkboxes in dialog (modal) from current localStorage settings
  // (method name kept for backward compatibility)
  // ---------------------------------------------------------------------------
  _updateOptionsFromCookie() {
    var settings = this.getSettings();
    if (settings) {
      for (var setting in settings) {
        var $checkbox = this.$modal.find('#google-options .translator-option[data-name=' + setting + '] input[type="checkbox"]');
        $checkbox.prop('checked', settings[setting]);
      }
    }
  }

  // ---------------------------------------------------------------------------
  // _updateButtons()
  // toggle dialog (modal) buttons
  // ---------------------------------------------------------------------------
  _updateButtons() {
    if (this._detailedSettingsShown) {
      this.$buttonDoNotAgree.hide();
      this.$buttonAgree.hide();
      this.$buttonSave.show();
      this.$buttonAgreeAll.show();
    } else {
      this.$buttonDoNotAgree.show();
      this.$buttonAgree.show();
      this.$buttonSave.hide();
      this.$buttonAgreeAll.hide();
    }
  }

  // ---------------------------------------------------------------------------
  // _gatherOptions()
  // collect current settings from all checkboxes in dialog (modal)
  // ---------------------------------------------------------------------------
  _gatherOptions(setAllExceptNecessary) {
    var $options = this.$modal.find('#google-options .translator-option');
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
  // _agreeAll()
  // process current settings from checkboxes for button 'agreeAll'
  // On 'agreeAll', enable ALL settings required for translation
  // ---------------------------------------------------------------------------
  _agreeAll() {
    var consentSettings     = JSON.parse(this._getCookieRaw(this._translator.props.cookieConsentName));
    // claude - translator change cookie to local storage #2
    // read translator settings from localStorage instead of cookie
    var translationSettings = this._getTranslatorData();

    translationSettings.analysis            = true;
    translationSettings.personalization     = true;
    translationSettings.translationEnabled  = true;

    consentSettings.analysis        = translationSettings.analysis;
    consentSettings.personalization = translationSettings.personalization;

    // claude - optimization chances: use setCookie helper to reduce
    // repeated boilerplate arguments
    this._setCookie(this._translator.props.cookieConsentName, consentSettings);
    // claude - translator change cookie to local storage #2
    // write translator settings to localStorage instead of cookie
    this._setTranslatorData(translationSettings);

    this.$modal.modal('hide');
  }

  // ---------------------------------------------------------------------------
  // _exitAll()
  // ---------------------------------------------------------------------------
  _exitAll() {
    this.$modal.modal('hide');
  }

  // ---------------------------------------------------------------------------
  // _doNotAgree()
  // process current settings from checkboxes for button `doNotAgree`
  // ---------------------------------------------------------------------------
  _doNotAgree() {
    var translationSettings = this._gatherOptions();

    translationSettings.translationEnabled  = false;
    translationSettings.translationLanguage = this._translator.props.translationLanguage;

    // claude - translator change cookie to local storage #2
    // write translator settings to localStorage instead of cookie
    this._setTranslatorData(translationSettings);

    this.$modal.modal('hide');
  }

  // ---------------------------------------------------------------------------
  // _saveSettings()
  // write current settings from checkboxes to cookie
  // ---------------------------------------------------------------------------
  _saveSettings() {
    var translationSettings = this._gatherOptions();
    var consentSettings     = JSON.parse(this._getCookieRaw(this._translator.props.cookieConsentName));

    consentSettings.analysis        = translationSettings.analysis;
    consentSettings.personalization = translationSettings.personalization;

    // claude - optimization chances: use setCookie helper
    this._setCookie(this._translator.props.cookieConsentName, consentSettings);
    // claude - translator change cookie to local storage #2
    // write translator settings to localStorage instead of cookie
    this._setTranslatorData(translationSettings);

    this.$modal.modal('hide');
  }

  // ---------------------------------------------------------------------------
  // _showDialog()
  // Show|Create the translation dialog (modal)
  // claude - optimization chances #2: replaced all "self = this" aliasing
  // with arrow functions that capture lexical "this" automatically; this
  // is idiomatic for ES6 classes and avoids a common source of bugs when
  // "self" accidentally shadows or is reassigned
  // ---------------------------------------------------------------------------
  _showDialog() {
    // claude - optimization chances: added missing semicolon after
    // variable declaration
    var cbAction = 'none';

    this._onDocumentReady(() => {

      this.modal = document.getElementById(this._translator.props.dialogContainerID);
      if (!this.modal) {
        this._logger.info('load consent modal');

        this.modal = document.createElement('div');
        this.modal.id = this._translator.props.dialogContainerID;
        this.modal.style.display = 'none';

        this.modal.setAttribute('class', 'modal fade');
        this.modal.setAttribute('tabindex', '-1');
        this.modal.setAttribute('role', 'dialog');
        this.modal.setAttribute('aria-labelledby', this._translator.props.dialogContainerID);
        document.body.append(this.modal);
        this.$modal = $(this.modal);

        // ---------------------------------------------------------------------
        // register events for the dialog (modal)
        // ---------------------------------------------------------------------

        // ---------------------------------------------------------------------
        // on 'show'
        // ---------------------------------------------------------------------
        this.$modal.on('show.bs.modal', () => {
          // claude - optimization chances: removed two unused variable
          // declarations (msDropdownJSON, index) that were never referenced
          // inside this event handler
          this._logger.debug('show.bs.modal: entered');

          $.when(
            this._createMsDropdownFromJSON({
              url:         this._translator.props.translatorLanguagesFile,
              elm:         this._translator.props.translatorLanguages,
              selector:    'dropdownJSON',
              width:       400,
              visibleRows: 8,
            })
          )
          .then((data) => {
            this._logger.info('creating msDropdown from JSON data: finished');
          });
        }); // END modal on 'show'

        // ---------------------------------------------------------------------
        // on 'shown'
        // ---------------------------------------------------------------------
        this.$modal.on('shown.bs.modal', () => {
          var msDropdownJSON;
          var dependencies_met_msDropdownJSON_loaded;
          // claude - optimization chances: added a max-iterations guard to
          // prevent the setInterval from polling indefinitely if the
          // msDropdown element never becomes available (e.g. network failure)
          var maxRetries = 500;
          var retryCount = 0;

          // found msDropdownJSON loaded slow on some PC
          dependencies_met_msDropdownJSON_loaded = setInterval(() => {
            retryCount++;
            if (retryCount > maxRetries) {
              this._logger.error('msDropdown loading timed out after ' + (maxRetries * 10) + 'ms');
              clearInterval(dependencies_met_msDropdownJSON_loaded);
              return;
            }

            if (typeof document.getElementById('dropdownJSON').msDropdown !== 'undefined') {
              msDropdownJSON = document.getElementById('dropdownJSON').msDropdown;
              if (!msDropdownJSON.length) {
                // critical error
                this._logger.error('no msDropdown found in translation dialog');
                this.$modal.hide();
              } else {
                // set translation language for auto detection
                // claude - optimization chances: reuse the already-computed
                // "navigatorLanguage" variable from the outer scope instead
                // of re-reading navigator.language / navigator.userLanguage
                var translation_language;
                if (this._translator.props.translationLanguage === 'auto') {
                  translation_language = this._navigatorLanguage.split('-')[0];
                } else {
                  translation_language = this._translator.props.translationLanguage;
                }

                // claude - optimization chances: removed double semicolon
                // at end of line
                // set translation language for the dropdown
                msDropdownJSON.selectedIndex = $('#dropdownJSON option[value=' + translation_language + ']').index();

                // disable translation language selection
                if (this._translator.props.disableLanguageSelector) {
                  msDropdownJSON.disabled = true;
                }

                $('#dropdownJSON').show();

                // jadams, 2021-10-18: added stop scrolling on the body,
                // if modal is OPEN
                $('body').addClass('stop-scrolling');

                this._logger.info('msDropdown successfully loaded in translation dialog');
                clearInterval(dependencies_met_msDropdownJSON_loaded);
              }
            }
          }, 10);

        }); // END modal on 'shown'

        // ---------------------------------------------------------------------
        // on 'hidden'
        // ---------------------------------------------------------------------
        this.$modal.on('hidden.bs.modal', () => {
          $('body').removeClass('stop-scrolling');
          // run the postSelectionCallback for (final) translation
          this._executeFunctionByName(this._translator.props.postSelectionCallback, window, cbAction);
        }); // END modal on 'hidden'

        // ---------------------------------------------------------------------
        // load the dialog (modal content)
        // ---------------------------------------------------------------------
        var templateUrl = this._translator.props.contentURL + '/' + 'index.html';
        $.get(templateUrl)
        .done((data) => {
          // "initialize" in log messages
          this._logger.info('loading consent modal: successfully');
          this.modal.innerHTML = data;
          this.modal.innerHTML = $('#' + this._translator.props.xhrDataElement).eq(0).html();
          this.modal.style.display = 'block';

          $(this.modal).modal({
            backdrop: 'static',
            keyboard: false
          });

          this.$buttonDoNotAgree = $('#translator-buttonDisableTranslation');
          this.$buttonAgree      = $('#translator-buttonTranslate');
          this.$buttonExit       = $('#translator-buttonExit');
          this.$buttonSave       = $('#translator-buttonSave');
          this.$buttonAgreeAll   = $('#translator-buttonTranslateAll');

          // claude - translator change cookie to local storage #2
          this._logger.info('load/initialize options from local storage');
          this._updateButtons();
          this._updateOptionsFromCookie();

          // -------------------------------------------------------------------
          // register button events for the dialog (modal)
          // -------------------------------------------------------------------
          $('#google-options').on('hide.bs.collapse', () => {
            this._detailedSettingsShown = false;
            this._updateButtons();
          }).on('show.bs.collapse', () => {
            this._detailedSettingsShown = true;
            this._updateButtons();
          });

          this._logger.info('initialize button event handler');

          this.$buttonDoNotAgree.click(() => {
            this._doNotAgree();
            cbAction = 'process';
          });
          this.$buttonAgree.click(() => {
            this._agreeAll();
            cbAction = 'process';
          });
          this.$buttonExit.click(() => {
            cbAction = 'exitOnly';
            this._exitAll();
          });
          this.$buttonSave.click(() => {
            $('#google-options').collapse('hide');
            this._saveSettings();
            this._updateOptionsFromCookie();
            cbAction = 'process';
          });
          this.$buttonAgreeAll.click(() => {
            $('#google-options').collapse('hide');
            this._agreeAll();
            cbAction = 'process';
          });
          this.$modal.modal('show');
        })
        .fail(() => {
          this._logger.error('loading translator dialog (modal): failed');
          this._logger.warn('probably no|wrong `contentURL` set');
        });
      } else {
        this.$modal.modal('show');
      }
    });
  }

  // ===========================================================================
  // public API
  // ===========================================================================

  // ---------------------------------------------------------------------------
  // showDialog()
  // show the translator dialog (modal)
  // ---------------------------------------------------------------------------
  showDialog() {
    this._showDialog();
  } // END showDialog

  // ---------------------------------------------------------------------------
  // getSettings()
  // claude - translator change cookie to local storage #2
  // collect settings from localStorage instead of cookie
  // ---------------------------------------------------------------------------
  getSettings(optionName) {
    var settings = this._getTranslatorData();
    if (settings) {
      if (optionName === undefined) {
        return settings;
      } else {
        return settings[optionName] !== undefined ? settings[optionName] : false;
      }
    } else {
      return undefined;
    }
  } // END getSettings

} // END class Translator