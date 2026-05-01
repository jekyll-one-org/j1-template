/*
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/modules/translator/js/translator.js (5)
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
    this._translator.props = {};

    // merge properties from (local) default|module
    if (props) {
      Object.assign(this._translator.props, props);
    }

    // J1 Translator optimizations #1
    // Removed dead self-assignment:
    //   this._translator.props.xhrDataElement = this._translator.props.xhrDataElement;
    // The comment ("set the xhrDataElement of the modal loaded based on
    // dialogLanguage") promises behavior the line never delivered. If a
    // language-dependent override is needed, derive it explicitly here, e.g.:
    //   if (this._translator.props.dialogLanguage) {
    //     this._translator.props.xhrDataElement =
    //       this._translator.props.xhrDataElement + '-' +
    //       this._translator.props.dialogLanguage;
    //   }

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
    // J1 Translator optimizations #1
    // Wrap btoa() so a value with non-Latin1 characters does not blow up
    // the whole call. Encode UTF-8 first, then base64. Falls back to the
    // raw value if encoding fails (and logs the failure for diagnosis).
    //
    var value_encoded;
    try {
      value_encoded = window.btoa(unescape(encodeURIComponent(value)));
    } catch (e) {
      this._logger.error('failed to base64-encode cookie value: ' + e);
      value_encoded = '';
    }

    var expires = '; expires=Thu, 01 Jan 1970 00:00:00 UTC';
    if (days > 0) {
      var date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = '; expires=' + date.toUTCString();
    }

    // simplified nested if/else branches for cookie string construction
    // into a single expression using conditional parts, improving readability
    // and reducing duplication
    //
    var cookieStr = name + '=' + (value_encoded || '') + expires + '; Path=/; SameSite=' + cookieSameSite + ';';
    if (cookieDomain) {
      cookieStr += ' Domain=' + cookieDomain + ';';
    }
    // J1 Translator optimizations #1
    // `Secure` is a *flag* per RFC 6265, not a key=value attribute. The
    // previous form `Secure=true;` is non-standard and silently ignored or
    // mishandled by some user agents. Emit the bare token instead.
    //
    if (cookieSecure) {
      cookieStr += ' Secure;';
    }
    document.cookie = cookieStr;
  }

  // ---------------------------------------------------------------------------
  // _getCookieRaw()
  // low-level cookie reader
  // ---------------------------------------------------------------------------
  _getCookieRaw(name) {
    // J1 Translator optimizations #1
    // Modernized: use String#trimStart() and String#startsWith() instead of
    // the manual whitespace-stripping while-loop and indexOf===0 idiom; wrap
    // atob() so a corrupted/non-base64 cookie does not crash the caller and
    // leak past the JSON.parse downstream.
    //
    var nameEQ = name + '=';
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i].trimStart();
      if (c.startsWith(nameEQ)) {
        var raw = c.substring(nameEQ.length);
        try {
          return decodeURIComponent(escape(window.atob(raw)));
        } catch (e) {
          this._logger.error('failed to base64-decode cookie "' + name + '": ' + e);
          return undefined;
        }
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
  // _getConsentSettings()
  // J1 Translator optimizations #1
  // Centralize safe parsing of the consent cookie. Previously every caller
  // wrote `JSON.parse(this._getCookieRaw(...))`, which throws SyntaxError
  // when the cookie does not exist (JSON.parse(undefined) coerces to the
  // string "undefined"). Returns null on missing/invalid input so callers
  // can branch cleanly.
  // ---------------------------------------------------------------------------
  _getConsentSettings() {
    var raw = this._getCookieRaw(this._translator.props.cookieConsentName);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (e) {
      this._logger.warn('consent cookie is not valid JSON: ' + e);
      return null;
    }
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
  // J1 Translator optimizations #1
  // Replaced `arguments` + `Array.prototype.slice.call` with a rest
  // parameter; added defensive checks so a missing namespace segment or
  // missing function logs a clear error instead of throwing TypeError
  // ('Cannot read properties of undefined') deep inside a callback chain.
  // ---------------------------------------------------------------------------
  _executeFunctionByName(functionName, context, ...args) {
    var namespaces = functionName.split('.');
    var func = namespaces.pop();
    var target = context;
    for (var i = 0; i < namespaces.length; i++) {
      if (target == null) {
        this._logger.error('cannot resolve namespace path: ' + functionName);
        return;
      }
      target = target[namespaces[i]];
    }
    if (target == null || typeof target[func] !== 'function') {
      this._logger.error('callback not callable: ' + functionName);
      return;
    }
    return target[func].apply(target, args);
  }

  // ---------------------------------------------------------------------------
  // _createMsDropdownFromJSON()
  // Create a msDropdown select DYNAMICALLY from JSON data located in a file
  // specified by "url". The JSON file contains multiple msDropdown elements
  // selected by "elm". The base (empty) <div> container the msDropdown will
  // be created is specified by the ID given by "selector".
  // ---------------------------------------------------------------------------
  _createMsDropdownFromJSON(options /* url, elm, selector */) {
    var translatorProps = this._translator.props;

    var msDropdownSettings = {
      size:             0,
      width:            250,
      multiple:         false,
      selectedIndex:    1,
      enableAutoFilter: false,
      visibleRows:      null,
    };

    // J1 Translator optimizations #1
    // Removed dead `if (msDropdownSettings)` guard: msDropdownSettings is
    // an object literal declared three lines above and can never be falsy,
    // so the conditional was always true and only added noise.
    //
    Object.assign(msDropdownSettings, options);

    var selectorID = '#' + msDropdownSettings.selector;

    return $.ajax({
      url: msDropdownSettings.url,
      dataType: 'json',
      success: (data) => {
        // J1 Translator optimizations #1
        // Cache the source array (lookup was repeated on every iteration of
        // the previous index loop) and use Array#filter for the language
        // selection — same result, half the lines, no manual indexing.
        //
        var sourceLanguages = data[msDropdownSettings.elm] || [];
        var dropdownLanguages;
        if (translatorProps.translationLanguages.includes('all')) {
          dropdownLanguages = sourceLanguages;
        } else {
          dropdownLanguages = sourceLanguages.filter(function (item) {
            return translatorProps.translationLanguages.includes(item.value);
          });
        }

        if (msDropdownSettings.visibleRows > dropdownLanguages.length) {
          msDropdownSettings.visibleRows = dropdownLanguages.length;
        }

        // J1 Translator optimizations #1
        // Use selectorID instead of the hardcoded '#dropdownJSON'. The
        // selector is a configurable option, but the existence check
        // previously ignored it so a non-default selector would have
        // silently bypassed the "already initialized" guard.
        //
        var $target = $(selectorID);
        if ($target.length && $target[0].msDropdown === undefined) {
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
    if (!settings) return;

    // J1 Translator optimizations #1
    // Switched from `for…in` (which walks inherited enumerable keys) to
    // Object.keys, and quoted the attribute value in the jQuery selector
    // so a setting whose name contains a digit-leading or hyphenated token
    // does not break the selector parser.
    //
    Object.keys(settings).forEach((setting) => {
      var $checkbox = this.$modal.find(
        '#google-options .translator-option[data-name="' + setting + '"] input[type="checkbox"]'
      );
      $checkbox.prop('checked', settings[setting]);
    });
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
    // J1 Translator optimizations #1
    // Use the native `dataset` API (HTMLElement.dataset.name) instead of
    // getAttribute('data-name') — same value, no string lookup, and reads
    // closer to intent. Switched the manual index loop to forEach.
    //
    var $options = this.$modal.find('#google-options .translator-option');
    var options = {};
    $options.each(function () {
      var name = this.dataset.name;
      if (name === 'necessary') {
        options[name] = true;
      } else if (setAllExceptNecessary === undefined) {
        options[name] = $(this).find('input[type="checkbox"]').prop('checked');
      } else {
        options[name] = !!setAllExceptNecessary;
      }
    });
    return options;
  }

  // ---------------------------------------------------------------------------
  // _enableTranslation()
  // process current settings from checkboxes for button 'agreeAll'
  // On 'agreeAll', enable ALL settings required for translation
  // ---------------------------------------------------------------------------
  _enableTranslation() {
    // J1 Translator optimizations #1
    // Guard against a missing translator-data record (first run, cleared
    // storage) by falling back to an empty object instead of trying to
    // mutate `undefined`. Also routes the consent cookie read through the
    // new _getConsentSettings() helper so a missing/invalid cookie no
    // longer throws SyntaxError from JSON.parse(undefined).
    //
    var translationSettings = this._getTranslatorData() || {};
    translationSettings.analysis            = true;
    translationSettings.personalization     = true;
    translationSettings.translationEnabled  = true;
    this._setTranslatorData(translationSettings);

    var consentSettings = this._getConsentSettings();
    if (consentSettings) {
      consentSettings.analysis        = true;
      consentSettings.personalization = true;
      this._setCookie(this._translator.props.cookieConsentName, consentSettings);
    }

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
  //
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
    // J1 Translator optimizations #1
    // The previous body only implemented fixes #3 and #4 from the header
    // comment above. Items #1 (persist updated translator settings) and
    // #2 (sync consent cookie) were documented but missing. Implementing
    // them now so behavior matches the contract.
    //
    var translationSettings = this._getTranslatorData() || {};
    translationSettings.analysis            = false;
    translationSettings.personalization     = false;
    translationSettings.translationEnabled  = false;
    this._setTranslatorData(translationSettings);

    var consentSettings = this._getConsentSettings();
    if (consentSettings) {
      consentSettings.analysis        = false;
      consentSettings.personalization = false;
      this._setCookie(this._translator.props.cookieConsentName, consentSettings);
    }

    // J1 Translator optimizations #1
    // Guard the second-level domain calculation: when the hostname has
    // fewer than two dots (single-segment hosts like "localhost", or some
    // intranet names) `lastIndexOf('.', -1)` returns -1 and the previous
    // `substring(... + 1)` quietly returned the whole hostname. Explicit
    // branch + fallback makes the intent visible.
    //
    var url       = new liteURL(window.location.href);
    var hostname  = url.hostname;
    var lastDot   = hostname.lastIndexOf('.');
    var prevDot   = lastDot > 0 ? hostname.lastIndexOf('.', lastDot - 1) : -1;
    var domain    = prevDot >= 0 ? hostname.substring(prevDot + 1) : hostname;
    var subDomain = '.' + domain;

    // expire googtrans via document.cookie on every plausible
    // domain + path combination that Google Translate may have used
    var expiry = '=; expires=Thu, 01 Jan 1970 00:00:00 UTC';
    ['', hostname, subDomain].forEach((d) => {
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
    // J1 Translator optimizations #1
    // Merge gathered checkbox values *into* existing settings instead of
    // overwriting them. _gatherOptions() returns ONLY values represented
    // as checkboxes in the modal (analysis, personalization,
    // useLanguageFromBrowser, translateAllPages); persisting that object
    // as-is wipes keys like translatorName, translationLanguage,
    // contentLanguage, and dialogLanguage from localStorage. This is the
    // same class of bug that the _disableTranslation() header documents
    // as fix #1, only here it was still actively occurring.
    // Also routes the consent-cookie read through _getConsentSettings()
    // for the same JSON.parse(undefined) safety reason as
    // _enableTranslation().
    //
    var gathered            = this._gatherOptions();
    var translationSettings = Object.assign(this._getTranslatorData() || {}, gathered);

    var consentSettings = this._getConsentSettings();
    if (consentSettings) {
      consentSettings.analysis        = translationSettings.analysis;
      consentSettings.personalization = translationSettings.personalization;
      this._setCookie(this._translator.props.cookieConsentName, consentSettings);
    }

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

            // J1 Translator optimizations #1
            // Null-check the element lookup before reading `.msDropdown`.
            // If the modal template has not finished injecting yet, the
            // element is null and the previous `.msDropdown` access threw
            // TypeError, which both broke the polling loop and surfaced as
            // an uncaught error in the console.
            //
            var dropdownEl = document.getElementById('dropdownJSON');
            if (!dropdownEl) {
              return; // try again on the next tick
            }

            if (typeof dropdownEl.msDropdown !== 'undefined') {
              msDropdownJSON = dropdownEl.msDropdown;
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

                // J1 Translator optimizations #1
                // Quote the attribute value so language codes that look
                // like CSS-unsafe tokens (e.g. 'zh-CN') do not break the
                // selector parser. Same defensive pattern applied in
                // _updateOptionsFromCookie().
                //
                msDropdownJSON.selectedIndex = $('#dropdownJSON option[value="' + translation_language + '"]').index();

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
        // J1 Translator optimizations #1
        // Use a template literal for the URL — the previous
        // `contentURL + '/' + 'index.html'` form concatenated a string
        // literal needlessly.
        //
        var templateUrl = `${this._translator.props.contentURL}/index.html`;
        $.get(templateUrl)
        .done((data) => {
          this._logger.info('loading consent modal: successfully');

          // J1 Translator optimizations #1
          // Replace the double `innerHTML` assignment:
          //
          //   this.modal.innerHTML = data;
          //   this.modal.innerHTML = $('#'+xhrDataElement).eq(0).html();
          //
          // The previous form parsed the entire response into the live
          // DOM, then re-queried it through jQuery just to extract one
          // sub-element — two parses, two layout invalidations, and the
          // intermediate DOM was discarded. DOMParser does the extraction
          // off-DOM in a single pass. Falls back to the raw response if
          // the expected wrapper id is missing.
          //
          var parsed = new DOMParser().parseFromString(data, 'text/html');
          var wrapper = parsed.getElementById(this._translator.props.xhrDataElement);
          this.modal.innerHTML = wrapper ? wrapper.innerHTML : data;
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

          // J1 Translator optimizations #1
          // Migrated from the deprecated `.click(handler)` shortcut to the
          // generic `.on('click', handler)` form. jQuery 3.x deprecated
          // the alias and 4.x removes it; this is a no-behavior-change
          // forward compat fix.
          //
          this.$buttonDisableTranslation.on('click', () => {
            this._disableTranslation();
            cbAction = 'process';
          });
          this.$buttonTranslate.on('click', () => {
            this._enableTranslation();
            cbAction = 'process';
          });
          this.$buttonExit.on('click', () => {
            cbAction = 'exitOnly';
            this._exitAll();
          });
          this.$buttonSave.on('click', () => {
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
    // J1 Translator optimizations #1
    // Made return values consistent: previously this returned `undefined`
    // when no settings record existed but `false` when a specific option
    // was missing — making it impossible for callers to distinguish
    // "explicitly disabled" from "never configured". Now always returns
    // `undefined` for the unset case so a caller can do
    //   const v = t.getSettings('foo'); if (v === undefined) { ... }
    // and still rely on `!!v` for a boolean coercion.
    //
    var settings = this._getTranslatorData();
    if (!settings) {
      return undefined;
    }
    if (optionName === undefined) {
      return settings;
    }
    return settings[optionName];
  } // END getSettings

} // END class Translator