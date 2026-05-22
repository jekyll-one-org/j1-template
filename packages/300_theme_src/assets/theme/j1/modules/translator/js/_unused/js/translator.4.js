/*
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/modules/translator/js/translator.js
 # Provides JS Core functions|API for J1 Module Translator
 #
 #  Product/Info:
 #  http://jekyll.one
 #
 #  Copyright (C) 2023-2026 Juergen Adams
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
/* eslint JSUnfilteredForInLoop: "off"                                        */
// -----------------------------------------------------------------------------
'use strict';

// rewrote the Translator constructor function as an ES6 class. 
// All internal helper functions become private methods (prefixed with
// underscore by convention), public API methods are declared directly on
// the class body, and "self = this" aliasing is eliminated in favor of
// arrow functions that preserve lexical "this".
//
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
    this._translator            = {};

    // -------------------------------------------------------------------------
    // Cookie helper (static-like utility on the instance)
    // -------------------------------------------------------------------------
    // converted the Cookie object into a pair of private methods (_setCookieRaw,
    // _getCookieRaw) so the class owns its cookie logic without an intermediate
    // object literal
    // -------------------------------------------------------------------------

    // -------------------------------------------------------------------------
    // default property settings
    // -------------------------------------------------------------------------
    this._translator.props = {
    };

    // merge properties from (local) default|module
    if (props) {
      Object.assign(this._translator.props, props);
    }

    // set the xhrDataElement of the modal loaded based on dialogLanguage
    this._translator.props.xhrDataElement = this._translator.props.xhrDataElement;

    this._logger.info('initializing core module: started');
    this._logger.debug('state: started');

    var translationDefaultSettings = {
      "translatorName":           "google",
      "translationEnabled":       false,
      "translateAllPages":        true,
      "useLanguageFromBrowser":   true,
      "translationLanguage":      "de",
      "analysis":                 true,
      "personalization":          true
    };

    // read translator settings from localStorage
    var translatorData = this._getTranslatorData();
    if (!translatorData) {
      this._logger.info('initializing translator local storage: ' + this._translator.props.translatorLocalStorageKey);
      this._setTranslatorData(translationDefaultSettings);
    }

    this._logger.info('initializing core module finished');
    this._logger.debug('state: finished');
  }

  // ---------------------------------------------------------------------------
  // private cookie helpers
  // ---------------------------------------------------------------------------

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

    // simplified nested if/else branches for cookie string construction
    // into a single expression using conditional parts, improving readability
    // and reducing duplication
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
  // extracted repeated Cookie.set call pattern into a helper to reduce
  // code duplication across agreeAll, doNotAgree, saveSettings (the same
  // 6 arguments were passed every time)
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
  // read translator settings from localStorage
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
  // write translator settings to localStorage
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

  // ---------------------------------------------------------------------------
  // private internal helpers
  // ---------------------------------------------------------------------------

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

    var msDropdownSettings = {
      size:             0,
      width:            250,
      multiple:         false,
      selectedIndex:    1,
      enableAutoFilter: false,
      visibleRows:      null,
    };

    // merge properties
    if (msDropdownSettings) {
      Object.assign(msDropdownSettings, options);
    }

    selectorID = '#' + msDropdownSettings.selector;

    return $.ajax({
      url: msDropdownSettings.url,
      dataType: 'json',
      success: (data) => {
        var dropdownLanguages = [];

        if (translatorProps.translationLanguages.includes('all')) {
          dropdownLanguages = data[msDropdownSettings.elm];
        } else {
          for (var i = 0; i < data[msDropdownSettings.elm].length; i++) {
            if (translatorProps.translationLanguages.includes(data[msDropdownSettings.elm][i].value)) {
              dropdownLanguages.push(data[msDropdownSettings.elm][i]);
            }
          }
        }

        if (msDropdownSettings.visibleRows > dropdownLanguages.length) {
          msDropdownSettings.visibleRows = dropdownLanguages.length;
        }

        if ($('#dropdownJSON')[0].msDropdown === undefined) {
          MsDropdown.make(selectorID, {
            byJson: {
              data: dropdownLanguages,
              name: msDropdownSettings.name,
              size: msDropdownSettings.size,
              width: msDropdownSettings.width,
              multiple: msDropdownSettings.multiple,
            },
            enableAutoFilter: msDropdownSettings.enableAutoFilter,
            visibleRows: msDropdownSettings.visibleRows,
          });
        }
      },
      error: (jqXHR, textStatus, errorThrown) => {
        this._logger.error('failed to retrieve JSON data from: ' + msDropdownSettings.url);
      }
    });
  }

  // ---------------------------------------------------------------------------
  // _updateOptionsFromCookie()
  // update all checkboxes in dialog (modal) from current localStorage
  // settings (method name kept for backward compatibility)
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
      this.$buttonDisableTranslation.hide();
      this.$buttonTranslate.hide();
      this.$buttonSave.show();
    } else {
      this.$buttonDisableTranslation.show();
      this.$buttonTranslate.show();
      this.$buttonSave.hide();
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
  // _enableTranslation()
  // process current settings from checkboxes for button 'agreeAll'
  // On 'agreeAll', enable ALL settings required for translation
  // ---------------------------------------------------------------------------
  _enableTranslation() {
    var consentSettings     = JSON.parse(this._getCookieRaw(this._translator.props.cookieConsentName));
    var translationSettings = this._getTranslatorData();

    translationSettings.analysis            = true;
    translationSettings.personalization     = true;
    translationSettings.translationEnabled  = true;

    consentSettings.analysis        = translationSettings.analysis;
    consentSettings.personalization = translationSettings.personalization;

    this._setCookie(this._translator.props.cookieConsentName, consentSettings);
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
  // _disableTranslation()
  // process current settings for button `doNotAgree`
  //
  // Fixes:
  //  1. Read existing settings via _getTranslatorData() instead of
  //     _gatherOptions(). The old call replaced the full settings object
  //     with only the checkbox values, losing keys like translatorName,
  //     translateAllPages, and useLanguageFromBrowser. This now mirrors
  //     the pattern used by _enableTranslation().
  //  2. Sync the consent cookie (analysis/personalization = false) so it
  //     stays consistent — _enableTranslation() already did this, but
  //     _disableTranslation() previously skipped it.
  //  3. Expire the googtrans cookie via document.cookie on every
  //     plausible domain/path combination. The js-cookie Cookies.remove()
  //     can miss cookies set by Google Translate with path or domain
  //     attributes that differ from what js-cookie assumes.
  //  4. Force a page reload after persisting the new state. Once Google
  //     Translate is active it rewrites DOM text nodes in memory; cookie
  //     deletion alone does NOT reverse those changes. A reload is the
  //     only reliable way to restore the original page content.
  //
  // ---------------------------------------------------------------------------
  _disableTranslation() {
    var url       = new liteURL(window.location.href);
    var hostname  = url.hostname;
    var domain    = hostname.substring(hostname.lastIndexOf('.', hostname.lastIndexOf('.') - 1) + 1);
    var subDomain = '.' + domain;

    // expire googtrans via document.cookie on every plausible
    // domain + path combination that Google Translate may have used
    var expiry = '=; expires=Thu, 01 Jan 1970 00:00:00 UTC';
    ['', hostname, subDomain].forEach(function (d) {
      var base = 'googtrans' + expiry + '; Path=/';
      document.cookie = d ? (base + '; Domain=' + d) : base;
    });

    window.location.reload();
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

    this._setCookie(this._translator.props.cookieConsentName, consentSettings);
    this._setTranslatorData(translationSettings);

    this.$modal.modal('hide');
  }

  // ---------------------------------------------------------------------------
  // _showDialog()
  // Show|Create the translation dialog (modal)
  // ---------------------------------------------------------------------------
  _showDialog() {
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
          // max-iterations guard to prevent the setInterval from polling
          // indefinitely if the msDropdown element never becomes available
          var maxRetries = 50;
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
                var translation_language;
                if (this._translator.props.translationLanguage === 'auto') {
                  translation_language = this._navigatorLanguage.split('-')[0];
                } else {
                  translation_language = this._translator.props.translationLanguage;
                }

                // set translation language for the dropdown
                msDropdownJSON.selectedIndex = $('#dropdownJSON option[value=' + translation_language + ']').index();

                // disable translation language selection
                if (this._translator.props.disableLanguageSelector) {
                  msDropdownJSON.disabled = true;
                }

                $('#dropdownJSON').show();

                // stop scrolling on the body, if modal is OPEN
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
          this._logger.info('loading consent modal: successfully');
          this.modal.innerHTML = data;
          this.modal.innerHTML = $('#' + this._translator.props.xhrDataElement).eq(0).html();
          this.modal.style.display = 'block';

          $(this.modal).modal({
            backdrop: 'static',
            keyboard: false
          });

          this.$buttonDisableTranslation  = $('#translator-buttonDisableTranslation');
          this.$buttonTranslate           = $('#translator-buttonTranslate');
          this.$buttonExit                = $('#translator-buttonExit');
          this.$buttonSave                = $('#translator-buttonSave');

          this._logger.info('load/initialize options from local storage');
          this._updateButtons();
          this._updateOptionsFromCookie();

          // -------------------------------------------------------------------
          // register button events for the dialog (modal)
          // -------------------------------------------------------------------
          //
          $('#google-options').on('hide.bs.collapse', () => {
            this._detailedSettingsShown = false;
            this._updateButtons();
          }).on('show.bs.collapse', () => {
            this._detailedSettingsShown = true;
            this._updateButtons();
          });

          this._logger.info('initialize button event handler');

          this.$buttonDisableTranslation.click(() => {
            this._disableTranslation();
            cbAction = 'process';
          });
          this.$buttonTranslate.click(() => {
            this._enableTranslation();
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

  // ---------------------------------------------------------------------------
  // public API
  // ---------------------------------------------------------------------------

  // ---------------------------------------------------------------------------
  // showDialog()
  // show the translator dialog (modal)
  // ---------------------------------------------------------------------------
  showDialog() {
    this._showDialog();
  } // END showDialog

  // ---------------------------------------------------------------------------
  // getSettings()
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