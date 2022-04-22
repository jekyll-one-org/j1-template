/*
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/modules/deeplAPI/js/deeplAPI.js
 # J1 core module for deeplAPI
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2022 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # For details, see: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE.md
 # -----------------------------------------------------------------------------
 # NOTE: Based on https://github.com/jquery-boilerplate/jquery-boilerplate
 # See:  https://www.dotnetcurry.com/jquery/1069/authoring-jquery-plugins
 # -----------------------------------------------------------------------------
*/

// the semi-colon before function invocation is a SAFETY method against
// concatenated scripts and/or other plugins which may NOT be closed
// properly.
//
;(function($, window, document, undefined) {
  'use strict';

  // Create the defaults
  var pluginName = 'deeplAPI',
  defaults = {
    api:                  'free',                                             // free (default) | pro
    auth_key:             '',                                                 // API authorization key
    source_lang:          'auto',                                             // autodetection (default: auto)|supported language. Specifies the language for the input text.
    target_lang:          'DE',                                               // language to be tranlasted in.
    max_chars:            false,                                              // false (unlimited) or number. Number of chars from the source text passed for translation.
    split_sentences:      '1',                                                // enabled (1, default)|disabled (0)|nonewlines. Sets the translation engine to first split the input text into sentences.
    preserve_formatting:  '0',                                                // disabled (0, default)|enabled (1). Sets the translation engine to respect the original formatting.
    formality:            'default',                                          // default|more|less. Sets the translated text should lean towards formal or informal language.
    tag_handling:         false,                                              // false (value=0)|xml. Sets which kind of tags should be handled. If set, API is able to process structured XML content.
    outline_detection:    true,                                               // false (value=0) or true (NO value passed). Controls the automatic mechanism on XML tags for splitting. If disabled, all splitting_tags are to be specified.
    non_splitting_tags:   false,                                              // false or comma-separated list of XML tags. Disable automated splitting on the tags specified.
    splitting_tags:       false,                                              // false or comma-separated list of XML tags which always cause splitting.
    ignore_tags:          false,                                              // false or comma-separated list of XML tags that indicate text NOT to be translated.
    onInit:               function (){},                                      // callback after plugin has initialized.
    onBeforeTranslation:  function (){},                                      // callback before translation started.
    onAfterTranslation:   function (){}                                       // callback after translation finished.
  };

  // -------------------------------------------------------------------------
  // plugin constructor
  // create the jquery plugin
  // -------------------------------------------------------------------------
  function Plugin (element, options) {
    this.element            = element;
    this.settings           = $.extend( {}, defaults, options);
    this.settings.elementID = '#' + this.element.id;
    this.xhr                = new XMLHttpRequest();

    // call the plugin initializer
    this.init(this.settings);
  }

  // Avoid plugin prototype conflicts
  $.extend(Plugin.prototype, {
    // -----------------------------------------------------------------------
    // init()
    // initialize|run the translation
    // -----------------------------------------------------------------------
    init: function(options) {
      var _this    = this;
      var logger   = log4javascript.getLogger('deeplAPI.init');
      var data_url = '/assets/data/private.json';
      var settings = options;
      var auth_key;
      var encodedString;
      var encryptedString;
      var jsonObject;

      logger.info('\n' + 'initialize: started');

      // loading private data (auth key)
      $.ajax({
        url: data_url,
        dataType: 'text',
        success: function (data) {
          encodedString = atob(data);
          jsonObject    = JSON.parse(encodedString);
          auth_key      = jsonObject.translators.deepl.auth_key;
        },
        error: function (jqXHR, textStatus, errorThrown) {
          logger.error('\n' + 'failed to retrieve JSON data from: ' + data_url);
        }
      });

      // run the translation (if private data loaded)
      var dependencies_met_page_ready = setInterval (function () {
        if (typeof auth_key !== 'undefined' ) {
          settings.auth_key = auth_key;
          _this.translate(settings);
          logger.info('\n' + 'initialize: finished');
          logger.info('\n' + 'translate: started');
          clearInterval(dependencies_met_page_ready);
        }
      }, 25);
    },

    // decryptData: function (message = '', key = '', iv = '') {
    //   var test_key_32 = "2e35f242a46d67eeb74aabc37d5e5d05";
    //   var data = CryptoJS.AES.encrypt("Message", test_key_32); // Encryption Part
    //   var decrypted = CryptoJS.AES.decrypt(data, test_key_32).toString(CryptoJS.enc.Utf8);
    //
    //   // Decode the base64 data so we can separate iv and crypt text.
    //   var rawData = atob(message);
    //   var iv = rawData.substring(0,16);
    //   var crypttext = rawData.substring(16);
    //
    //   // Decrypt...
    //   var plaintextArray = CryptoJS.AES.decrypt(
    //     { ciphertext: CryptoJS.enc.Latin1.parse(crypttext) },
    //     CryptoJS.enc.Hex.parse(key),
    //     { iv: CryptoJS.enc.Latin1.parse(iv) }
    //   );
    //
    //   var decrypted = CryptoJS.enc.Latin1.stringify(plaintextArray);
    //   return decrypted;
    // },

    // -----------------------------------------------------------------------
    // prepareXHR
    // Prepare a XHR request according to DeepL API specification
    // for the required HTTP header settings
    // See: https://www.deepl.com/de/docs-api/simulator/
    // -----------------------------------------------------------------------
    // NOTE: "User-Agent" NOT used as the use is qualified UNSECURE
    // -----------------------------------------------------------------------
    prepareXHR: function (settings) {
      if (settings.api === 'free') {
        this.xhr.open("POST", "https://api-free.deepl.com/v2/translate", true);
      } else if (settings.api === 'pro') {
        this.xhr.open("POST", "https://api.deepl.com/v2/translate", true);
      } else {
        this.xhr.open("POST", "https://api-free.deepl.com/v2/translate", true);
      }
      // Set required header parameters
      this.xhr.setRequestHeader("Accept", "*/*");
      this.xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    },

    // -----------------------------------------------------------------------
    // prepareText
    // Prepare text function used to parse, or arrange text, designed as
    // a module. Currently it splits all text whenever a newline ("\n")
    // is met, so that it preserves the original layout of the text, which
    // would have otherwise been lost because of the way DeepL accepts
    // multiple sentences.
    // -----------------------------------------------------------------------
    prepareText: function (source_text) {
      return source_text.split("\n");
    },

    // -----------------------------------------------------------------------
    // translate
    // Translate text function which uses all the other modules, in order to
    // create a request, which is sent to the DeepL API to translate, and
    // then display the result, designed as a module.
    // -----------------------------------------------------------------------
    translate: function (settings) {
      const logger                  = log4javascript.getLogger('deeplAPI.translate');
      const READYSTATE_DONE         = 4;
      const STATUS_OK               = 200;
      const SUPPORTED_LANG          = ['BG', 'CS', 'DA', 'DE', 'EL', 'EN-GB', 'EN-US', 'EN', 'ES', 'ET', 'FI', 'FR', 'HU', 'IT', 'JA', 'LT', 'LV', 'NL', 'PL', 'PT-PT', 'PT-BR', 'PT', 'RO', 'RU', 'SK', 'SL', 'SV', 'ZH'];
      const ALLOWED_FORMALITY_LANG  = ['DE', 'FR', 'IT', 'ES', 'NL', 'PL', 'PT', 'PT-BR', 'RU'];
      const ALLOWED_TAG_HANDLING    = ['xml'];
      const TARGET_ELEMENT          = settings.targetElement;
      const TARGET_ELEMENT_EXISTS   = $(TARGET_ELEMENT).length;
      const ERROR_TEXT              = 'Translation failed.' + '\n' + 'Reason: ';
      const WARNING_TEXT            = 'Translation skipped.' + '\n' + 'Reason: ';

      var BASE_TARGET_ELEMENT;
      var ELEMENT_TYPE;
      var SOURCE_TEXT_FOUND;

      var API_RESPONSE              = {};
      API_RESPONSE['400']           = 'Bad request. Please check error message and your parameters.';
      API_RESPONSE['401']           = 'Authorization failed. Please supply a valid DeepL-Auth-Key.';
      API_RESPONSE['403']           = 'Forbidden. The access to the requested resource is denied, because of insufficient access rights.';
      API_RESPONSE['404']           = 'The requested resource could not be found.';
      API_RESPONSE['413']           = 'The request size exceeds the limit.';
      API_RESPONSE['415']           = 'The requested entries format specified in the Accept header is not supported.';
      API_RESPONSE['429']           = 'Too many requests. Please wait and resend your request.';
      API_RESPONSE['456']           = 'Quota exceeded. The maximum amount of glossaries has been reached.';
      API_RESPONSE['500']           = 'Internal server error';
      API_RESPONSE['503']           = 'Resource currently unavailable. Try again later.';
      API_RESPONSE['529']           = 'Too many requests. Please wait and resend your request.';

      var reason_text;
      var request                   = '';
      var element                   = '';
      var source_text               = '';
      var source_text_lines         = '';
      var source_lang;
      var target_lang;

      // check if passed HTML element or ID exists
      if (TARGET_ELEMENT_EXISTS) {
        BASE_TARGET_ELEMENT = (TARGET_ELEMENT.includes('.')||TARGET_ELEMENT.includes('#')) ? TARGET_ELEMENT.substring(1) : TARGET_ELEMENT;
        ELEMENT_TYPE        = $(TARGET_ELEMENT).get(0).nodeName;

        // Read the text to be translated from the given HTML element
        if (ELEMENT_TYPE === 'TEXTAREA') {
            source_text  = this.element.value;
        } else if (ELEMENT_TYPE === 'P') {
            element      = this.element;
            source_text  = $(TARGET_ELEMENT).text();
        }
        SOURCE_TEXT_FOUND = source_text.length;
      } else {
        logger.error('\n' + 'target element does not exists: ' + TARGET_ELEMENT);
        return false;
      }

      // limit the source text if required
      if (settings.max_char && source_text.length > settings.max_char ) {
        var source_text_limited = source_text.substring(0, settings.max_char -3);
        source_text = source_text_limited + ' ...';
        logger.info('\n' + 'limit for source text ' + '(max: ' + settings.max_char + ')' + ' reached: ' + source_text.length);
      }
      source_text_lines = this.prepareText(source_text);

      // prepare the XHR request for the API (free/pro) requested
      this.prepareXHR(settings);

      // Makes a request with every line, as a new text to translate
      var source_text_request = "";
      for(var i = 0; i < source_text_lines.length; i++) {
        source_text_request += "&text=" + source_text_lines[i];
      }

      this.xhr.onload = function () {
        if (this.readyState === READYSTATE_DONE) {
          if (this.status === STATUS_OK) {
            // JSON parse the response
            var result = JSON.parse(this.responseText);

            // recreate the response as one text to keep its original layout
            var translated_text = "";
            for(var i = 0; i < result.translations.length; i++) {
              translated_text += result.translations[i].text;
              translated_text += "\n";
            }
            logger.info('\n' + 'translation: finished');

            // update the HTM element (content) by the tranlation
            if (ELEMENT_TYPE === 'TEXTAREA') {
              $(TARGET_ELEMENT).val(translated_text);
            } else if (ELEMENT_TYPE === 'P') {
              $(TARGET_ELEMENT).text(translated_text);
            }
          } else {
            logger.error('\n' + 'API returned ' + this.status + ': ' + API_RESPONSE[this.status]);
          }
        }
      };

      // ---------------------------------------------------------------------
      // preflight (validity check) on given parameters
      // ---------------------------------------------------------------------

      // Check for SUPPORTED language by option source_lang|target_lang
      source_lang = this.settings.source_lang;
      target_lang = this.settings.target_lang;

      if (this.settings.source_lang !== 'auto') {
        this.settings.source_lang = (SUPPORTED_LANG.indexOf(this.settings.source_lang) > -1) ? this.settings.source_lang : false;
      }
      this.settings.target_lang = (SUPPORTED_LANG.indexOf(this.settings.target_lang) > -1) ? this.settings.target_lang : false;

      // stop processing if invalid language or NO AUTH key passed
      if (!this.settings.auth_key || !this.settings.source_lang || !this.settings.target_lang) {
        if (!this.settings.auth_key) {
          reason_text = 'NO AUTH key passed.';
          logger.error('\n' + 'invalid option found. ' + reason_text);
        }
        if (!this.settings.source_lang) {
          reason_text = 'WRONG source language passed: ' + source_lang;
          logger.error('\n' + 'invalid option found. ' + reason_text);
        }
        if (!this.settings.target_lang) {
          reason_text = 'WRONG target language passed: ' + target_lang;
          logger.error('\n' + 'invalid option found. ' + reason_text);
        }

        // update the HTML element (content) by an error text
        if (ELEMENT_TYPE === 'TEXTAREA') {
          $(TARGET_ELEMENT).val(ERROR_TEXT + reason_text);
        } else if (ELEMENT_TYPE === 'P') {
          $(TARGET_ELEMENT).text(ERROR_TEXT + reason_text);
        }
        return false;
      }

      if(!SOURCE_TEXT_FOUND) {
        reason_text = 'NO text found for translation';
        // update the HTML element (content) by an error text
        if (ELEMENT_TYPE === 'TEXTAREA') {
          $(TARGET_ELEMENT).val(WARNING_TEXT + reason_text);
        } else if (ELEMENT_TYPE === 'P') {
          $(TARGET_ELEMENT).text(WARNING_TEXT + reason_text);
        }
        logger.warn('\n' + 'no text found for translation');
        return false;
      }

      // Check for VALID language supported by option 'formality'
      if (this.settings.formality !== 'default' ) {
        if (!(ALLOWED_FORMALITY_LANG.indexOf(this.settings.target_lang) > -1)) {
          logger.warn('\n' + 'wrong language found for formality setting: ' + this.settings.target_lang);
        }
        this.settings.formality = (ALLOWED_FORMALITY_LANG.indexOf(this.settings.target_lang) > -1) ? this.settings.formality : 'default';
      }

      // Check for VALID tag handling and options
      if (this.settings.tag_handling) {
        var tag_handling = this.settings.tag_handling;
        // check for VALID method
        this.settings.tag_handling = (ALLOWED_TAG_HANDLING.indexOf(this.settings.tag_handling) > -1) ? this.settings.tag_handling : false;
        if (this.settings.tag_handling) {
          this.settings.non_splitting_tags = this.settings.non_splitting_tags ? encodeURIComponent(this.settings.non_splitting_tags) : false;
          this.settings.splitting_tags = this.settings.splitting_tags ? encodeURIComponent(this.settings.splitting_tags) : false;
          this.settings.ignore_tags = this.settings.ignore_tags ? encodeURIComponent(this.settings.ignore_tags) : false;
        } else {
          logger.error('\n' + 'invalid option found for tag handling : ' + tag_handling);
          logger.warn('\n' + 'disable option: ' + 'tag_handling');
          // reset to defaults if WRONG method detected
          if (this.settings.non_splitting_tags) {
            logger.warn('\n' + 'disable option: ' + this.settings.non_splitting_tags);
            this.settings.non_splitting_tags = false;
          }
          if (this.settings.splitting_tags) {
            logger.warn('\n' + 'disable option : ' + this.settings.splitting_tags);
            this.settings.splitting_tags = false;
          }
          if (this.settings.ignore_tags) {
            logger.warn('\n' + 'disable option: ' + this.settings.ignore_tags);
            this.settings.ignore_tags = false;
          }
        }
      } else {
        // reset tags to their defaults if NO tag_handling is enabled but settings passed
        if (this.settings.non_splitting_tags) {
          logger.warn('\n' + 'invalid option found: ' + this.settings.non_splitting_tags);
          this.settings.non_splitting_tags = false;
        }
        if (this.settings.splitting_tags) {
          logger.warn('\n' + 'invalid option found: ' + this.settings.splitting_tags);
          this.settings.splitting_tags = false;
        }
        if (this.settings.ignore_tags) {
          logger.warn('\n' + 'invalid option found: ' + this.settings.ignore_tags);
          this.settings.ignore_tags = false;
        }
      }

      // ---------------------------------------------------------------------
      // construct the API request body
      // ---------------------------------------------------------------------
      request =  "auth_key=" + this.settings.auth_key;
      request += (this.settings.source_lang !== 'auto' ) ? "&source_lang=" + this.settings.source_lang : '';
      request += "&target_lang=" + this.settings.target_lang;
      request += (this.settings.formality !== 'default' ) ? "&formality=" + this.settings.formality : '';
      request += (this.settings.split_sentences) ? "&split_sentences=" + this.settings.formality : '';
      request += (this.settings.tag_handling) ? "&tag_handling=" + this.settings.tag_handling : "&tag_handling=0";
      request += (this.settings.tag_handling && this.settings.non_splitting_tags) ? "&non_splitting_tags=" + this.settings.non_splitting_tags : '';
      request += (this.settings.tag_handling && this.settings.splitting_tags) ? "&splitting_tags=" + this.settings.splitting_tags : '';
      request += (this.settings.tag_handling && this.settings.ignore_tags) ? "&ignore_tags=" + this.settings.ignore_tags : '';
      request += source_text_request;

      // Send the constructed request to the API for translation
      this.xhr.send(request);
    } // END translate

  }); // END prototype

  // ---------------------------------------------------------------------------
  // plugin wrapper
  // A really lightweight plugin wrapper around the constructor,
  // wrapper around the constructor to prevent multiple instantiations
  // preventing against multiple instantiations and allowing any
  // public function (ie. a function whose name doesn't start
  // with an underscore) to be called via the jQuery plugin,
  // e.g. $(element).defaultPluginName('functionName', arg1, arg2)
  // ---------------------------------------------------------------------------
  $.fn[pluginName] = function ( options ) {
    var args = arguments;

    // Is the first parameter an object (options), or was omitted,
    // instantiate a new instance of the plugin.
    //
    if (options === undefined || typeof options === 'object') {
      return this.each(function () {
      // Only allow the plugin to be instantiated once,
      // so we check that the element has no plugin instantiation yet
      if (!$.data(this, 'plugin_' + pluginName)) {
        // if it has no instance, create a new one, pass options to the
        // plugin constructor, and store the plugin instance in the
        // elements jQuery data object.
        $.data(this, 'plugin_' + pluginName, new Plugin( this, options ));
      }
      });
    } else if (typeof options === 'string' && options[0] !== '_' && options !== 'init') {
      // If the first parameter is a string and it doesn't start
      // with an underscore or "contains" the `init`-function,
      // treat this as a call to a public method.

      // Cache the method call to make it possible to return a value
      var returns;

      this.each(function () {
        var instance = $.data(this, 'plugin_' + pluginName);

        // Tests that there's already a plugin-instance
        // and checks that the requested public method exists
        if (instance instanceof Plugin && typeof instance[options] === 'function') {
            // Call the method of our plugin instance,
            // and pass it the supplied arguments.
            returns = instance[options].apply( instance, Array.prototype.slice.call( args, 1 ) );
        }

        // Allow instances to be destroyed via the 'destroy' method
        if (options === 'destroy') {
            $.data(this, 'plugin_' + pluginName, null);
        }
      });

      // If the earlier cached method gives a value back return the value,
      // otherwise return "this" to preserve chainability.
      return returns !== undefined ? returns : this;
    }
  }; // END plugin wrapper

})(jQuery, window, document);
