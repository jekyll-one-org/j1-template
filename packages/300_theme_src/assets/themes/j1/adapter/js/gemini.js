---
regenerate:                             true
---

{% capture cache %}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/gemini.js
 # Liquid template to adapt the Google Gemini API module
 #
 # Product/Info:
 # https://jekyll.one
 # Copyright (C) 2023, 2024 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # For details, see: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE.md
 # -----------------------------------------------------------------------------
 # Test data:
 #  {{ liquid_var | debug }}
 #  gemini_options:  {{ gemini_options | debug }}
 # -----------------------------------------------------------------------------
{% endcomment %}

{% comment %} Liquid procedures
-------------------------------------------------------------------------------- {% endcomment %}

{% comment %} Set global settings
-------------------------------------------------------------------------------- {% endcomment %}
{% assign environment         = site.environment %}
{% assign asset_path          = "/assets/themes/j1" %}

{% comment %} Process YML config data
================================================================================ {% endcomment %}

{% comment %} Set config files
-------------------------------------------------------------------------------- {% endcomment %}
{% assign template_config       = site.data.j1_config %}
{% assign blocks                = site.data.blocks %}
{% assign modules               = site.data.modules %}

{% comment %} Set config data (settings only)
-------------------------------------------------------------------------------- {% endcomment %}
{% assign slim_select_defaults  = modules.defaults.slim_select.defaults %}
{% assign slim_select_settings  = modules.slim_select.settings %}
{% assign gemini_defaults       = modules.defaults.gemini.defaults %}
{% assign gemini_settings       = modules.gemini.settings %}

{% comment %} Set config options (settings only)
-------------------------------------------------------------------------------- {% endcomment %}
{% assign slim_select_options   = slim_select_defaults | merge: slim_select_settings %}
{% assign gemini_options        = gemini_defaults | merge: gemini_settings %}

{% comment %} Variables
-------------------------------------------------------------------------------- {% endcomment %}
{% assign comments              = gemini_options.enabled %}

{% comment %} Detect prod mode
-------------------------------------------------------------------------------- {% endcomment %}
{% assign production = false %}
{% if environment == 'prod' or environment == 'production' %}
  {% assign production = true %}
{% endif %}

/*
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/gemini.js
 # J1 Adapter for the Google Gemini API module
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2023, 2024 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # For details, see: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE.md
 # -----------------------------------------------------------------------------
 # NOTE:
 # -----------------------------------------------------------------------------
 #  Adapter generated: {{site.time}}
 # -----------------------------------------------------------------------------
*/

// -----------------------------------------------------------------------------
// ESLint shimming
// -----------------------------------------------------------------------------
/* eslint indent: "off"                                                       */
// -----------------------------------------------------------------------------
'use strict';
j1.adapter.gemini = (function (j1, window) {

{% comment %} Set global variables
-------------------------------------------------------------------------------- {% endcomment %}
var environment       = '{{environment}}';
var state             = 'not_started';
var leafletScript     = document.createElement('script');
var geocoderScript    = document.createElement('script');
var safetySettings    = [];
var generationConfig  = {} ;
var genAIError        = false;
var genAIErrorType    = '';
var response          = '';
var modal_error_text  = '';
var modulesLoaded     = false;
var textHistory       = []; // Array to store the history of entered text
var historyIndex      = -1; // Index to keep track of the current position in the history
var chat_prompt       = {};

var url;
var baseUrl;
var cookie_names;
var cookie_written;
var hostname;
var auto_domain;
var check_cookie_option_domain;
var cookie_domain;
var secure;

var gemini_model;
var apiKey;
var validApiKey;
var maxHistory;
var allowHistoryDuplicates;
var genAI;
var result;
var _this;
var logger;
var logText;
var HarmCategory, HarmBlockThreshold; // values taken from API

// -----------------------------------------------------------------------
// Module variable settings
// -----------------------------------------------------------------------

// create settings object from module options
//
var slimSelectDefaults  = $.extend({}, {{slim_select_defaults | replace: 'nil', 'null' | replace: '=>', ':' }});
var slimSelectSettings  = $.extend({}, {{slim_select_settings | replace: 'nil', 'null' | replace: '=>', ':' }});
var slimSelectOptions   = $.extend(true, {}, slimSelectDefaults, slimSelectSettings);

var geminiDefaults      = $.extend({}, {{gemini_defaults | replace: 'nil', 'null' | replace: '=>', ':' }});
var geminiSettings      = $.extend({}, {{gemini_settings | replace: 'nil', 'null' | replace: '=>', ':' }});
var geminiOptions       = $.extend(true, {}, geminiDefaults, geminiSettings);

const defaultPrompt     = geminiOptions.prompt.default;
const httpError400      = geminiOptions.errors.http400;
const httpError500      = geminiOptions.errors.http500;

// -----------------------------------------------------------------------------
// Helper functions
// -----------------------------------------------------------------------------

  // Log the geolocation position
  function showPosition(position) {
     var latitude = position.coords.latitude;
     var longitude = position.coords.longitude;
     console.debug("Detected geocode (lat:long): " + latitude + ':' + longitude);
  } //END function showPosition

  function locateCountry(position) {
    const latitude  = position.coords.latitude;
    const longitude = position.coords.longitude;

    // Reverse geocode to find the country
    fetch(`//nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`)
    .then(response => response.json())
    .then(data => {
      const country = '<b>' + data.address.country;
      const city    = data.address.city;
      $("#modal_error").html(modal_error_text + '<br>' + country);
    })
    .catch(error => {
      console.warn('Error:', error);
    });
  } //END function locateCountry

  function geoFindMe() {

    function success(position) {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      locateCountry(position);
    } //END function success

    function error() {
      logger.warn('\n' + 'Unable to retrieve the location');
    } //END function error

    if (!navigator.geolocation) {
      logger.warn('\n' + 'Geolocation API is not supported by the browser');
    } else {
      navigator.geolocation.getCurrentPosition(success, error);
    }
  } //END function geoFindMe

  async function runner() {
    let input = document.getElementById("name");

    // For text-only input, use the selected model
    const model = genAI.getGenerativeModel({
      model: gemini_model,
      safetySettings,
      generationConfig
    });

    var prompt = $('textarea#prompt').val();
    if (prompt.length == 0) {
      prompt = defaultPrompt;
      document.getElementById('prompt').value = prompt;
    }

    try {
      result = await model.generateContent(prompt);
    } catch (e) {
      var error = e.toString();
        if (error.includes("400")) {
          genAIErrorType = 400;
          modal_error_text = httpError400;
          $("#modal_error").html(modal_error_text);
          logger.warn('\n' + 'Location is not supported');
        } else if (error.includes("50")) {
          genAIErrorType = 500;
          modal_error_text = httpError500;
          $("#modal_error").html(modal_error_text);
          logger.warn('\n' + 'Service currently not available');
        }
        genAIError = true;
    } finally {
        if (!genAIError) {
          try {
            response  = await result.response;
          } catch (e) {
            logger.warn('\n' + e);
          } finally {
            $("#spinner").hide();

            // Evaluate|Process feedback returned from API
            var candidateRatings = geminiOptions.api_options.candidateRatings;
            var responseText     = '';
            var safetyRatings;
            var safetyRating;
            var safetyCategory;
            var ratingCategory;
            var ratingProbability;
            var responseFinishReason;

            if (response.promptFeedback !== undefined) {
              safetyRatings         = response.promptFeedback.safetyRatings;
              responseFinishReason  = response.promptFeedback.blockReason;
              if (responseFinishReason == 'SAFETY') {
                safetyRatings.forEach(rating => {
                  if (rating.probability !== undefined && rating.probability !== 'NEGLIGIBLE' && rating.probability !== 'LOW') {
                    if (rating.category !== undefined) {
                      ratingCategory    = rating.category;
                      ratingProbability = rating.probability;
                    }
                  }
                });
                if (ratingCategory !== undefined && ratingCategory !== '' && ratingProbability !== undefined && ratingProbability !== '') {
                  logger.warn('\n' + 'Security issue detected, reason: ' + ratingCategory + ' = ' + ratingProbability);
                }
                var ratingCategoryText    = ratingCategory.replace("HARM_CATEGORY_", '').toLowerCase();
                var ratingProbabilityText = ratingProbability.toLowerCase();
                responseText = 'Response disabled due to security reasons (<b>' + ratingCategoryText + ': ' + ratingProbabilityText + '</b>). Please modify your prompt.';
              }
              if (response.text !== undefined && response.text.length > 0) {
                responseText = response.text;
              }
            }

            if (response.candidates !== undefined) {
              safetyRatings         = response.candidates[0].safetyRatings;
              responseFinishReason  = response.candidates[0].finishReason;

              if (responseFinishReason == 'STOP') {
                for (const [key, value] of Object.entries(candidateRatings)) {
                  safetyRatings.forEach(rating => {
                    if (rating == 'HARM_CATEGORY_DANGEROUS_CONTENT' || rating.category == 'HARM_CATEGORY_HARASSMENT' || rating.category == 'HARM_CATEGORY_HATE_SPEECH' || rating.category == 'HARM_CATEGORY_SEXUALLY_EXPLICIT') {
                      if (rating.probability !== "NEGLIGIBLE") {
                        if (candidateRatings.HARM_CATEGORY_DANGEROUS_CONTENT == "BLOCK_NONE") {
                          safetyCategory  = rating.category;
                          safetyRating    = candidateRatings.HARM_CATEGORY_DANGEROUS_CONTENT;
                          responseText    = response.candidates[0].content.parts[0].text;
                        }
                        if (candidateRatings.HARM_CATEGORY_HARASSMENT == "BLOCK_NONE") {
                          safetyCategory  = rating.category;
                          safetyRating    = candidateRatings.HARM_CATEGORY_HARASSMENT;
                          responseText    = response.candidates[0].content.parts[0].text;
                        }
                        if (candidateRatings.HARM_CATEGORY_HATE_SPEECH == "BLOCK_NONE") {
                          safetyCategory  = rating.category;
                          safetyRating    = candidateRatings.HARM_CATEGORY_HATE_SPEECH;
                          responseText    = response.candidates[0].content.parts[0].text;
                        }
                        if (candidateRatings.HARM_CATEGORY_SEXUALLY_EXPLICIT == "BLOCK_NONE") {
                          safetyCategory  = rating.category;
                          safetyRating    = candidateRatings.HARM_CATEGORY_SEXUALLY_EXPLICIT;
                          responseText = response.candidates[0].content.parts[0].text;
                        }
                      } else {
                        responseText = response.candidates[0].content.parts[0].text;
                      } //END if rating.probability
                    } //END if rating.category
                  }); //END forEach
                } //END for

                if (safetyCategory !== undefined) {
                  logger.debug('\n' + safetyCategory + ': ' + safetyRating);
                }
              } //END responseFinishReason STOP

              if (response.candidates[0].finishReason == 'MAX_TOKENS') {
                responseText = 'Response disabled due to model settings (<b>maxOutputTokens: ' + geminiOptions.api_options.generationConfig.maxOutputTokens + '</b>). You need to increase your settings to get full response.';
              } //END responseFinishReason MAX_TOKENS

              if (response.candidates[0].finishReason == 'SAFETY') {
                responseText = 'Response disabled due to security reasons. You need to <b>change your prompt</b> to get proper results.';
                  console.warn('Response disabled due to security reasons');
              } //END responseFinishReason SAFETY

              if (response.candidates[0].finishReason == 'RECITATION') {
                responseText = 'Response flagged "RECITATION". Resposne currently not supported';
                console.warn('finishReason "RECITATION" currently not supported');
              } //END responseFinishReason RECITATION

              if (response.candidates[0].finishReason == 'OTHER') {
                responseText = 'Response disabled due to unknown reasons.';
                console.warn('Response disabled due to unknown reasons');
              } //END responseFinishReason OTHER

            } //END if response.candidates

            if (responseText.length > 0) {
              // Set|Show UI elements
              if (responseText.length < geminiOptions.api_options.responseLengthMin) {
                logger.warn('\n' + 'Response generated too short: <' + geminiOptions.api_options.responseLengthMin + ' characters');
                document.getElementById('md_result').innerHTML = 'Response generated too short (less than ' + geminiOptions.api_options.responseLengthMin + ' characters). Please re-run the generation for better results';
              } else {
                document.getElementById('md_result').innerHTML = marked.parse(responseText);
              }
              $("#result").show();
              $("#response").show();
            } //END responseText length
          } //END finally
        } else {
          if (geminiOptions.detectGeoLocation) {
            geoFindMe();
          }
          $("#spinner").hide();
          setTimeout(() => {
            $('#errorModal').modal('show');
          }, 1000);
       } //END else
    } //END finally
  } //END async function runner()

  // ---------------------------------------------------------------------------
  // Main object
  // ---------------------------------------------------------------------------
  return {

    // -------------------------------------------------------------------------
    // init()
    // adapter initializer
    // -------------------------------------------------------------------------
    init: function (options) {
      var logStartOnce = false;

      // -----------------------------------------------------------------------
      // Default module settings
      // -----------------------------------------------------------------------
      var settings = $.extend({
        module_name: 'j1.adapter.gemini',
        generated:   '{{site.time}}'
      }, options);

      // -----------------------------------------------------------------------
      // Module variable settings
      // -----------------------------------------------------------------------
      _this         = j1.adapter.gemini;
      logger        = log4javascript.getLogger('j1.adapter.gemini');
      cookie_names  = j1.getCookieNames();
      url           = new liteURL(window.location.href);
      baseUrl       = url.origin;
      hostname      = url.hostname;
      auto_domain   = hostname.substring(hostname.lastIndexOf('.', hostname.lastIndexOf('.') - 1) + 1);
      secure        = (url.protocol.includes('https')) ? true : false;

      // Module loader
      _this.loadModules();

      // UI loader
      _this.loadUI();

      // Module initializer
      var dependencies_met_page_ready = setInterval(() => {
        var pageState           = $('#content').css("display");
        var pageVisible         = (pageState == 'block') ? true : false;
        var j1CoreFinished      = (j1.getState() == 'finished') ? true : false;
        var slimSelectFinished  = (j1.adapter.slimSelect.getState() == 'finished') ? true : false;
        var uiLoaded            = (j1.xhrDOMState['#gemini_ui'] == 'success') ? true : false;

        if (!logStartOnce) {
          _this.setState('started');
          logger.info('\n' + 'set module state to: ' + _this.getState());
          logger.info('\n' + 'module is being initialized');
          logStartOnce = true;
        }

        if (j1CoreFinished && pageVisible && slimSelectFinished && uiLoaded && modulesLoaded) {

          // Initialize|Hide UI Components
          $("#gemini_ui_container").show();
          $("#spinner").hide();
          $("#response").hide();

          // Initialize|Empty the prompt (textarea)
          document.getElementById('prompt').value = '';

          if (!validApiKey) {
            logger.warn('\n' + 'Invalid API key detected: ' + apiKey);
            $("#send").hide();
            $("#reset").hide();
          }

          // Get the textarea element
          const textarea = document.getElementById(geminiOptions.prompt_id);

          // Get SlimSelect object for the history (placed ny slimSelect adapter)
          const selectList  = document.getElementById('prompt_history');
//        const selectList  = document.getElementById(geminiOptions.prompt_history_id);
          const $slimSelect = selectList.slim;

          // limit the history array length
          maxHistory             = geminiOptions.max_history;
          allowHistoryDuplicates = geminiOptions.allow_history_duplicates;

          _this.slim_select_eventHandler();

          // Initialize the textHistory array from cookie
          if (geminiOptions.read_prompt_history_from_cookie) {
            var data    = [];
            var option  = {};
            chat_prompt = j1.existsCookie(cookie_names.chat_prompt)
              ? j1.readCookie(cookie_names.chat_prompt)
              : {};
            // convert the chat_prompt object to array textHistory
            textHistory = Object.values(chat_prompt);

            // Remove duplicates from the history array
            if (!allowHistoryDuplicates && textHistory.length > 1) {
              // Create a 'Set' from the history array to automatically remove duplicates
              var uniqueArray = [...new Set(textHistory)];
              textHistory = uniqueArray;
            } // END if allowHistoryDupicates

            textHistory.forEach(function(optionText) {
              option = {
                text: optionText,
                display: true,
                selected: false,
                disabled: false
              }
              data.push(option);
            }); // END forEach

            // Update the history select
            $slimSelect.setData(data);

            // Display history select container
            if (textHistory.length > 0) {
              $("#list-container").show();
            }
          }

          // Send request to generate results
          const sendButton = document.getElementById('{{gemini_options.buttons.generate.id}}');
          sendButton.addEventListener('click', (event) => {

            // Prevent default actions
            event.preventDefault();

            // Initialize the textHistory array
            if (geminiOptions.read_prompt_history_from_cookie) {
              chat_prompt = j1.existsCookie(cookie_names.chat_prompt)
                ? j1.readCookie(cookie_names.chat_prompt)
                : {};
              // convert the chat_prompt object to array textHistory
              textHistory = Object.values(chat_prompt);
            }

            // Update the history array
            if (textarea.value.length > 0 && textHistory.length < maxHistory) {
              // Add the current value of the textarea to the history array
              textHistory.push(textarea.value);
            } else if (textarea.value.length > 0 && textHistory.length == maxHistory) {
              // Replace the oldest history element by current prompt
              textHistory[0] = textarea.value;
            } else if (textarea.value.length == 0 && textHistory.length == maxHistory) {
              // Replace the oldest history element by defaultPrompt prompt
              textHistory[0] = defaultPrompt;
            } else if (textarea.value.length == 0 && textHistory.length < maxHistory) {
              // Add the default prompt
              textHistory.push(defaultPrompt);
            } //END if textarea length

            // Remove duplicates from the history array
            if (!allowHistoryDuplicates && textHistory.length > 1) {
              // Create a 'Set' from the history array to automatically remove duplicates
              var uniqueArray = [...new Set(textHistory)];
              textHistory = uniqueArray;
            } // END if allowHistoryDupicates

            // Loop through the history array to create data elements
            data    = [];
            option  = {};
            textHistory.forEach(function(optionText) {
              option = {
                text: optionText
              }
              data.push(option);
            }); // END forEach

            // Update the history select
            $slimSelect.setData(data);

            // Display history select container
            if (textHistory.length > 0) {
              $("#list-container").show();
            }

            if (geminiOptions.save_prompt_history_to_cookie) {
              cookie_written = j1.writeCookie({
                name:     cookie_names.chat_prompt,
                data:     textHistory,
                secure:   secure
              });
            }

            // Display history select container
            if (textHistory.length > 0) {
              $("#list-container").show();
            }

            // Clear UI elements
            document.getElementById('md_result').innerHTML = '';
            $("#result").hide();
            $("#spinner").show();

            // Call the Gemini API for processing
            runner();
          }); //END sendButton (click)

          // Clear input form|spinner|responses
          const resetButton = document.getElementById('{{gemini_options.buttons.reset.id}}');
          resetButton.addEventListener('click', (event) => {
            // Prevent default actions
            event.preventDefault();

            document.getElementById("prompt").value   = '';
            document.getElementById("response").value = '';
            $("#spinner").hide();
            $("#response").hide();
          }); //END resetButton (click)

          // Clear history|cookie
          const clearButton = document.getElementById('{{gemini_options.buttons.clear.id}}');
          clearButton.addEventListener('click', (event) => {
            // Prevent default actions
            event.preventDefault();

            textHistory = [];
            if (geminiOptions.save_prompt_history_to_cookie) {
              j1.removeCookie({
                name:     cookie_names.chat_prompt,
                domain:   auto_domain,
                secure:   secure
              });

              cookie_written = j1.writeCookie({
                name:     cookie_names.chat_prompt,
                data:     {},
                secure:   secure
              });
            }

            $("#list-container").hide();
          }); //END clearButton (click)

          _this.setState('finished');
          logger.debug('\n' + 'state: ' + _this.getState());
          logger.info('\n' + 'module initialized successfully');

          clearInterval(dependencies_met_page_ready);
        }
      }, 10);

    }, // END init

    // -------------------------------------------------------------------------
    // loadModules()
    // Module loader
    // -------------------------------------------------------------------------
    loadModules: function () {

      if (geminiOptions.detect_geo_location) {
        leafletScript.async   = true;
        leafletScript.type    = "script";
        leafletScript.id      = 'leaflet-api';
        leafletScript.src     = '//unpkg.com/leaflet/dist/leaflet.js'
        document.head.appendChild(leafletScript);

        geocoderScript.async  = true;
        geocoderScript.type   = "script";
        geocoderScript.id     = 'geocoder-api';
        geocoderScript.src    = '//unpkg.com/leaflet-control-geocoder/dist/Control.Geocoder.js'
        document.head.appendChild(geocoderScript);
      }

      // https://github.com/google/generative-ai-js/blob/main/docs/reference/generative-ai.md
      import('//esm.run/@google/generative-ai')
        .then((module) => {
          // Module is imported successfully
          apiKey             = geminiOptions.api_options.apiKey;
          validApiKey        = (apiKey.includes('your-')) ? false : true;
          genAI              = new module.GoogleGenerativeAI(apiKey);
          HarmCategory       = module.HarmCategory;
          HarmBlockThreshold = module.HarmBlockThreshold;
          gemini_model       = geminiOptions.api_options.model;

          generationConfig = {
            candidateCount:   geminiOptions.api_options.generationConfig.candidateCount,
            maxOutputTokens:  geminiOptions.api_options.generationConfig.maxOutputTokens,
            temperature:      geminiOptions.api_options.generationConfig.temperature,
            topK:             geminiOptions.api_options.generationConfig.topK,
            topP:             geminiOptions.api_options.generationConfig.topP
          };

          safetySettings = [
            {
              category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
              threshold: geminiOptions.api_options.safetyRatings.HARM_CATEGORY_DANGEROUS_CONTENT
            },
            {
              category: HarmCategory.HARM_CATEGORY_HARASSMENT,
              threshold: geminiOptions.api_options.safetyRatings.HARM_CATEGORY_HARASSMENT
            },
            {
              category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
              threshold: geminiOptions.api_options.safetyRatings.HARM_CATEGORY_HATE_SPEECH
            },
            {
              category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
              threshold: geminiOptions.api_options.safetyRatings.HARM_CATEGORY_SEXUALLY_EXPLICIT
            }
          ];

          console.debug('gemini: Importing module: successful');
          modulesLoaded = true;
        })
        .catch((error) => {
          // An error occurred during module import
          console.warn('gemini: Importing module failed: ', error);
        });
    }, // END loadModules

    // -------------------------------------------------------------------------
    // loadUI()
    // UI loader
    // -------------------------------------------------------------------------
    loadUI: function () {
      j1.loadHTML ({
          xhr_container_id: geminiOptions.xhr_container_id,
          xhr_data_path:    geminiOptions.xhr_data_path,
          xhr_data_element: geminiOptions.xhr_data_element
        },
        'j1.adapter.gemini',
        'null'
      );

      var dependencies_met_data_loaded = setInterval(function() {
        if (j1.xhrDOMState['#gemini_ui'] == 'success') {
          console.debug('gemini: Loading UI: successful');
          clearInterval(dependencies_met_data_loaded);
        } // END if xhrDOMState
      }, 10);

    }, // END loadUI

    slim_select_eventHandler: function () {
      var select  = document.getElementById(geminiOptions.prompt_history_id);
      var $select = select.slim;
      var value;

      // $select.events.beforeOpen = () => {
      //   var values = $select.getSelected();
      //   var data = $select.getData();
      //   $select.setData(data[0].selected = false);
      //   console.log('slimSelect: before open');
      // },

      $select.events.afterOpen = () => {
        var data = $select.getData();
        $select.setData(data[0].selected = false);
        console.log('slimSelect: after open');
      },

      $select.events.afterClose = () => {
        // Get|Set selected value from history
        value = $select.getSelected();
        $select.setSelected(value);
        $select.close();

        document.getElementById('prompt').value = value;
      }
    }, //END slim_select_eventHandler()

    // -------------------------------------------------------------------------
    // messageHandler()
    // manage messages send from other J1 modules
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
    } // END getState

  }; // END return
})(j1, window);

{% endcapture %}
{% if production %}
  {{ cache | minifyJS }}
{% else %}
  {{ cache | strip_empty_lines }}
{% endif %}
{% assign cache = nil %}
