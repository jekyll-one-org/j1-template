/*
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/modules/j1Deepl/js/j1deepl.js
 # J1 core module for j1Deepl
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2021 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # For details, see https://jekyll.one
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
    var pluginName = 'j1translate',
    defaults = {
        type:                   'deepl',
            free_api:                       true,
            auth_key:                       '',
            text:                               '',
            source_lang:                    'auto',
            target_lang:                    'DE',
            split_sentences:            false,
            preserve_formatting:    true,
            formality:                      'default',
            tag_handling:               '',
            non_splitting_tags:     '',
            outline_detection:      '',
            splitting_tags:             '',
            ignore_tags:                    '',
            onInit:               function (){},                                                    // callback after plugin has initialized
            onBeforeTranslation:  function (){},                                                // callback before translation started
            onAfterTranslation:   function (){}                                                                             // callback after translation finished
    };

    // -------------------------------------------------------------------------
    // plugin constructor
    // create the jquery plugin
    // -------------------------------------------------------------------------
    function Plugin (element, options) {
        this.element            = element;
        this.settings           = $.extend( {}, defaults, options);
        this.settings.elementID = '#' + this.element["id"]
        this.xhr                                = new XMLHttpRequest()

        // call the plugin initializer
        this.init(this.settings);
    }

    // Avoid Plugin.prototype conflicts
    $.extend(Plugin.prototype, {
        // -------------------------------------------------------------------------
        // init
        // initialize the plugin
        // -------------------------------------------------------------------------
        init: function(options) {
          var logger = log4javascript.getLogger('j1translate.init');

            logger.info('\n' + 'initializing plugin: started');
            logger.info('\n' + 'state: started');

            this.translate();

            logger.info('\n' + 'initializing plugin: finished');
            logger.info('\n' + 'state: finished');
        },
        // -------------------------------------------------------------------------
        // setup
        // Setup function for creating a request, designed as a module,
        // according to DeepL API specifications.
        // -------------------------------------------------------------------------
        setup: function () {
            this.xhr.open("POST", "https://api-free.deepl.com/v2/translate", true);
            this.xhr.setRequestHeader("Accept", "*/*");
            this.xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            // xhr.setRequestHeader("User-Agent", "DeepL API Implementation");
            // xhr.setRequestHeader("Content-Length", null);
        },
        // -------------------------------------------------------------------------
        // prepareText
        // Prepare text function used to parse, or arrange text, designed as
        // a module. Currently it splits all text whenever a newline ("\n") is met,
        // so that it preserves the original layout of the text, which would have
        // otherwise been lost because of the way DeepL accepts multiple sentences.
        // -------------------------------------------------------------------------
        prepareText: function (source_text) {
            return source_text.split("\n");
        },
        // -------------------------------------------------------------------------
        // translate
        // Translate text function which uses all the other modules, in order to
        // create a request, which is sent to the DeepL API to translate, and
        // then display the result, designed as a module.
        // -------------------------------------------------------------------------
        translate: function () {
            var logger                      = log4javascript.getLogger('j1translate.translate');
            var READYSTATE_DONE   = 4;
            var STATUS_OK         = 200;
            var source_text             = this.element.value;
            var source_text_lines   = this.prepareText(source_text);

            // create the XHR request
            this.setup();

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

                        // Recreate the response as one text, which kept its
                        // original layout
                        var translated_text = "";
                        for(var i = 0; i < result.translations.length; i++) {
                            translated_text += result.translations[i].text;
                            translated_text += "\n";
                        }
                        document.getElementById("translated-text").value = translated_text;
                    }
                }
            };

            // Send the constructed request to the API for translation
            if (this.settings.source_lang ==! 'auto' ) {
                this.xhr.send("auth_key=" + this.settings.auth_key + source_text_request + "&source_lang=" + this.settings.source_lang + "&target_lang=" + this.settings.target_lang + "&tag_handling=xml&ignore_tags=em");
            } else {
                this.xhr.send("auth_key=" + this.settings.auth_key + source_text_request + "&target_lang=" + this.settings.target_lang + "&tag_handling=xml&ignore_tags=em");
            }
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
