---
regenerate:                             true
---

{% capture cache %}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/googleTranslator.js
 # Liquid template to create the Template Adapter for J1 googleTranslator
 #
 # Product/Info:
 # http://jekyll.one
 #
 # Copyright (C) 2021 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # For details, see https://jekyll.one
 # -----------------------------------------------------------------------------
 # Test data:
 #  {{ liquid_var | debug }}
 # -----------------------------------------------------------------------------
{% endcomment %}

{% comment %} Liquid var initialization
-------------------------------------------------------------------------------- {% endcomment %}

{% comment %} Set config files
-------------------------------------------------------------------------------- {% endcomment %}
{% assign environment         = site.environment %}
{% assign blocks              = site.data.blocks %}
{% assign modules             = site.data.modules %}
{% assign template_config     = site.data.j1_config %}

{% comment %} Set config data
-------------------------------------------------------------------------------- {% endcomment %}
{% assign translator_defaults = modules.defaults.google_translate.defaults %}
{% assign translator_settings = modules.google_translate.settings %}
{% assign tracking_enabled    = template_config.analytics.enabled %}


{% comment %} Set config options
-------------------------------------------------------------------------------- {% endcomment %}
{% assign translator_options     = translator_defaults | merge: translator_settings %}

{% assign production = false %}
{% if environment == 'prod' or environment == 'production' %}
  {% assign production = true %}
{% endif %}

/*
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/google_translate.js
 # JS Adapter for J1 google_translate
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
 #  Adapter generated: {{site.time}}
 # -----------------------------------------------------------------------------
*/

// -----------------------------------------------------------------------------
// ESLint shimming
// -----------------------------------------------------------------------------
/* eslint indent: "off"                                                       */
/* eslint quotes: "off"                                                       */
// -----------------------------------------------------------------------------
// https://github.com/EdwardBalaj/Simple-DeepL-API-Integration
// https://github.com/marghoobsuleman/ms-Dropdown
// https://www.marghoobsuleman.com/image-dropdown/help
// https://www.marghoobsuleman.com/image-dropdown/advanced-help
'use strict';

{% comment %} Main
-------------------------------------------------------------------------------- {% endcomment %}
j1.adapter['googleTranslator'] = (function (j1, window) {

  var environment       = '{{environment}}';
  var tracking_enabled  = ('{{tracking_enabled}}' === 'true') ? true: false;    // Analytics/GA enabled?
  var moduleOptions     = {};
  var _this;
  var $modal;
  var user_cookie;
  var logger;
  var url;
  var baseUrl;
  var hostname;
  var domain;
  var cookie_domain;
  var secure;
  var logText;
  var cookie_written;
  var modal_language;
  var navigator_language;
  var translation_language;
  var ddSourceLanguage;

  // ---------------------------------------------------------------------------
  // Helper functions
  // ---------------------------------------------------------------------------

  // ---------------------------------------------------------------------------
  // Main object
  // ---------------------------------------------------------------------------
  return {

    // -------------------------------------------------------------------------
    // Initializer
    // -------------------------------------------------------------------------
    init: function (options) {

      // -----------------------------------------------------------------------
      // globals
      // -----------------------------------------------------------------------
      _this                 = j1.adapter.googleTranslator;
      logger                = log4javascript.getLogger('j1.adapter.googleTranslator');
      url                   = new liteURL(window.location.href);
      baseUrl               = url.origin;
      hostname              = url.hostname;
      domain                = hostname.substring(hostname.lastIndexOf('.', hostname.lastIndexOf('.') - 1) + 1);
      secure                = (url.protocol.includes('https')) ? true : false;
      modal_language        = "{{site.language}}";
      navigator_language    = navigator.language || navigator.userLanguage;     // userLanguage for MS IE compatibility
      translation_language  = navigator_language.split('-')[0];

      // set domain used by cookies
      if(domain !== 'localhost') {
        cookie_domain = '.' + hostname;
      } else {
        cookie_domain = hostname;
      }

      // initialize state flag
      _this.state = 'pending';

      // -----------------------------------------------------------------------
      // Default module settings
      // -----------------------------------------------------------------------
      var settings = $.extend({
        module_name: 'j1.adapter.googleTranslator',
        generated:   '{{site.time}}'
      }, options);

      {% comment %} Load module config from yml data
      -------------------------------------------------------------------------- {% endcomment %}
      // Load  module DEFAULTS|CONFIG
      /* eslint-disable */
      moduleOptions = $.extend({}, {{translator_options | replace: '=>', ':' | replace: 'nil', '""'}});
      /* eslint-enable */

      if (typeof settings !== 'undefined') {
        moduleOptions = j1.mergeData(moduleOptions, settings);
      }

      // -----------------------------------------------------------------------
      // initializer
      // -----------------------------------------------------------------------
      var dependencies_met_page_ready = setInterval (function (options) {
        if ( j1.getState() === 'finished' ) {
          _this.setState('started');
          logger.info('\n' + 'state: ' + _this.getState());
          logger.info('\n' + 'module is being initialized');

          j1.googleTranslator = new googleTranslator({
            contentURL:             moduleOptions.contentURL,                   // dialog content (modals) for all supported languages
            cookieName:             moduleOptions.cookieName,                   // the name of the User State Cookie (primary data)
            cookieConsentName:      moduleOptions.cookieConsentName,            // the name of the Cookie Consent Cookie (secondary data)
            dialogContainerID:      moduleOptions.dialogContainerID,            // dest container, the dialog modal is loaded (dynamically)
            dialogLanguage:         moduleOptions.dialogLanguage,               // language for the dialog (modal)
            translationLanguage:    moduleOptions.translationLanguage,          // language for translation
            xhrDataElement:         moduleOptions.xhrDataElement,               // container for all language-specific dialogs (modals)
            postSelectionCallback:  function () {j1.adapter.googleTranslator.cbCookie()}
          });

          _this.setState('finished');
          logger.info('\n' + 'state: ' + _this.getState());
          logger.debug('\n' + 'module initialized successfully');
          clearInterval(dependencies_met_page_ready);
        }
      });
    }, // END init

    // -------------------------------------------------------------------------
    // messageHandler: MessageHandler for J1 google_translate module
    // Manage messages send from other J1 modules
    // -------------------------------------------------------------------------
    messageHandler: function (sender, message) {
      var json_message = JSON.stringify(message, undefined, 2);

      logText = '\n' + 'received message from ' + sender + ': ' + json_message;
      logger.debug(logText);

      // -----------------------------------------------------------------------
      //  Process commands|actions
      // -----------------------------------------------------------------------
      if (message.type === 'command' && message.action === 'module_initialized') {
        //
        // Place handling of command|action here
        //
        logger.info('\n' + message.text);
      }

      //
      // Place handling of other command|action here
      //

      return true;
    }, // END messageHandler

    // -------------------------------------------------------------------------
    // setState()
    // Sets the current (processing) state of the module
    // -------------------------------------------------------------------------
    setState: function (stat) {
      _this.state = stat;
    }, // END setState

    // -------------------------------------------------------------------------
    // getState()
    // Returns the current (processing) state of the module
    // -------------------------------------------------------------------------
    getState: function () {
      return _this.state;
    }, // END getState

    // -------------------------------------------------------------------------
    // cbCookie()
    // Called by google_translate module after the user has
    // made his selection (callback)
    // -------------------------------------------------------------------------
    cbCookie: function () {
      var cookie_names        = j1.getCookieNames();
      var user_state          = j1.readCookie(cookie_names.user_state);
      var user_consent        = j1.readCookie(cookie_names.user_consent);

      logger.info('\n' + 'entered post selection callback from google_translate');
      logger.debug('\n' + 'current values from cookie consent: ' + JSON.stringify(user_consent));
      logger.debug('\n' + 'current values from user state: ' + JSON.stringify(user_state));

    } // END cbCookie

  }; // END return
})(j1, window);

{% endcapture %}
{{ cache | strip_empty_lines }}
{% assign cache = nil %}
