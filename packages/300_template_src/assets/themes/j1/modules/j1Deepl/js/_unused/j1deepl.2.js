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
	    type:               	'deepl',
			free_api: 						true,
			auth_key: 						'',
			text: 								'',
			source_lang:					'auto',
			target_lang: 					'DE',
			split_sentences:			false,
			preserve_formatting:	true,
			formality:						'default',
			tag_handling: 				'',
			non_splitting_tags: 	'',
			outline_detection:		'',
			splitting_tags:				'',
			ignore_tags:					'',
			onInit:               function (){},					                        		// callback after plugin has initialized
			onBeforeTranslation:  function (){},	                            				// callback before translation started
			onAfterTranslation:   function (){}																				// callback after translation finished
	};

	// DeeplLanguages = 'BG' | 'CS' | 'DA' | 'DE' | 'EL' | 'EN-GB' | 'EN-US' | 'EN' | 'ES' | 'ET' | 'FI' | 'FR' | 'HU' | 'IT' | 'JA' | 'LT' | 'LV' | 'NL' | 'PL' | 'PT-PT' | 'PT-BR' | 'PT' | 'RO' | 'RU' | 'SK' | 'SL' | 'SV' | 'ZH';

	// Plugin constructor
	function Plugin (element, options) {
		this.element            = element;
		this.settings           = $.extend( {}, defaults, options);
		this.settings.elementID = '#' + this.element["id"]
		this.xhr 								= new XMLHttpRequest()

		// call the initializer
		this.init(this.settings);
	}

	// Avoid Plugin.prototype conflicts
	$.extend(Plugin.prototype, {
		// -------------------------------------------------------------------------
		// init: initializer
		// -------------------------------------------------------------------------
		init: function(options) {
		  var logger = log4javascript.getLogger('j1translate');

			/*
				Authentication key given in the specifications.
			*/
			// var AUTH_KEY = "5652c0b9-adcf-7f2e-f6a2-3a577f700dc9:fx";
			var AUTH_KEY 						= "fe1c56dc-1342-9899-26db-c5d701791e2d:fx";
			var TAG_HANDLING 				= "xml";

			/*
				Since the specifications required for the website,
				to accept only English text, the source language is coded here,
				so that in the future, if required this could be easily changed.
			*/
			var SOURCE_LANG 				= "auto";

			/*
				According to XMLHttpRequest specifications, when the request is done,
				it returns a code ("4"), and when the status of the request is ok,
				it returns another code ("200");
			*/
			var READYSTATE_DONE     = 4;
			var STATUS_OK           = 200;

			logger.info('\n' + 'initializing plugin: started');
			logger.info('\n' + 'state: started');

			this.translate();

			logger.info('\n' + 'initializing plugin: finished');
			logger.info('\n' + 'state: finished');
		},
		// Setup function for creating a request, designed as a module,
		// according to DeepL API specifications.
		setup: function () {
			this.xhr.open("POST", "https://api-free.deepl.com/v2/translate", true);

			this.xhr.setRequestHeader("Accept", "*/*");
			this.xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
			// xhr.setRequestHeader("User-Agent", "DeepL API Implementation");
			// xhr.setRequestHeader("Content-Length", null);
		},

		// Prepare text function used to parse, or arrange text, designed as a module.
		// Currently it splits all text whenever a newline ("\n") is met,
		// so that it preserves the original layout of the text,
		// which would have otherwise been lost because of the way DeepL accepts multiple sentences.
		prepareText: function (original_text) {
			return original_text.split("\n");
		},
		// Translate text function which uses all the other modules, in order to create a request,
		//which is sent to the DeepL API to translate, and then display the result, designed as a module.
		translateText: function () {
			var READYSTATE_DONE     = 4;
			var STATUS_OK           = 200;
			// var target_language = document.getElementById("destination-language").value;
			// var original_text = document.getElementById("original-text").value;
			var target_language = 'DE';
			// var original_text = 'Translate text function which uses all the other modules, in order to create a request.';
			var original_text_lines;
			var original_text = this.element.value;

			this.setup();

			original_text_lines = this.prepareText(original_text);

			// Makes a request with every line, as a new text to translate.
			var request = "";
			for(var i = 0; i < original_text_lines.length; i++) {
				request += "&text=" + original_text_lines[i];
			}

			this.xhr.onload = function () {
				if (this.readyState === READYSTATE_DONE) {
					if (this.status === STATUS_OK) {
						// Uses JSON to parse the response.
						var result = JSON.parse(this.responseText);

						// Recreates the response as one text, which kept its original layout.
						var translated_text = "";
						for(var i = 0; i < result.translations.length; i++) {
							translated_text += result.translations[i].text;
							translated_text += "\n";
						}
						document.getElementById("translated-text").value = translated_text;
						// return false;
					}
				}
			};

			// Send the request to the server for translation.
			this.xhr.send("auth_key=" + this.settings.auth_key + request + "&source_lang=" + 'EN' + "&target_lang=" + target_language);
			// this.xhr.send("auth_key=" + this.auth_key + request + "&target_lang=" + target_language + "&tag_handling=xml&ignore_tags=em");
			// this.xhr.send("auth_key=" + AUTH_KEY + request + "&source_lang=" + SOURCE_LANG + "&target_lang=" + target_language + "tag_handling=" + TAG_HANDLING);
		},
		// -------------------------------------------------------------------------
		// deepl translator
		// -------------------------------------------------------------------------
		translate: function(options) {
			var logger = log4javascript.getLogger('j1translate');
			var _this  = this;

			/*
				Authentication key given in the specifications.
			*/
			// var AUTH_KEY = "5652c0b9-adcf-7f2e-f6a2-3a577f700dc9:fx";
			var AUTH_KEY 						= "fe1c56dc-1342-9899-26db-c5d701791e2d:fx";
			var TAG_HANDLING 				= "xml";

			/*
				Since the specifications required for the website,
				to accept only English text, the source language is coded here,
				so that in the future, if required this could be easily changed.
			*/
			var SOURCE_LANG 				= "auto";

			/*
				According to XMLHttpRequest specifications, when the request is done,
				it returns a code ("4"), and when the status of the request is ok,
				it returns another code ("200");
			*/
			var READYSTATE_DONE     = 4;
			var STATUS_OK           = 200;


			// Creates an xmlHttpRequest object as soon as the page has loaded.
			// var xhr                 = new XMLHttpRequest();

			logger.info('\n' + 'initializing plugin: finished');
			logger.info('\n' + 'state: finished');

			this.translateText();

		} //END translate

	}); // END prototype

	// wrapper around the constructor to prevent multiple instantiations
	// ---------------------------------------------------------------------------

	// A really lightweight plugin wrapper around the constructor,
	// preventing against multiple instantiations and allowing any
	// public function (ie. a function whose name doesn't start
	// with an underscore) to be called via the jQuery plugin,
	// e.g. $(element).defaultPluginName('functionName', arg1, arg2)
	$.fn[pluginName] = function ( options ) {
			var args = arguments;

			// Is the first parameter an object (options), or was omitted,
			// instantiate a new instance of the plugin.
			if (options === undefined || typeof options === 'object') {
				return this.each(function () {
					// Only allow the plugin to be instantiated once,
					// so we check that the element has no plugin instantiation yet
					if (!$.data(this, 'plugin_' + pluginName)) {

							// if it has no instance, create a new one,
							// pass options to our plugin constructor,
							// and store the plugin instance
							// in the elements jQuery data object.
							$.data(this, 'plugin_' + pluginName, new Plugin( this, options ));
					}
				});

			// If the first parameter is a string and it doesn't start
			// with an underscore or "contains" the `init`-function,
			// treat this as a call to a public method.
			} else if (typeof options === 'string' && options[0] !== '_' && options !== 'init') {

				// Cache the method call
				// to make it possible
				// to return a value
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

				// If the earlier cached method
				// gives a value back return the value,
				// otherwise return this to preserve chainability.
				return returns !== undefined ? returns : this;
			}
	};

})(jQuery, window, document);
