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
 # For details, see: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
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
 # For details, see: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
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
var genAI;
var result;

var latitude;
var longitude;
var country;
var city;

var selectList;
var $slimSelect;
var textarea;
var maxHistory;
var promptHstoryEnabled;
var promptHistoryFromCookie;
var allowHistoryDuplicates;
var allowHistoryUpdatesOnMax;

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
     latitude = position.coords.latitude;
     longitude = position.coords.longitude;
     console.debug("Detected geocode (lat:long): " + latitude + ':' + longitude);
  } //END function showPosition

  function locateCountry(position) {
    latitude  = position.coords.latitude;
    longitude = position.coords.longitude;

    // Reverse geocode to find the country
    fetch(`//nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`)
    .then(response => response.json())
    .then(data => {
      country = data.address.country;
      city    = data.address.city;
      $("#modal_error").html(modal_error_text + '<br>' + '<b>' + country + '</b>');
      logger.warn('\n' + 'Location is not supported: ' + country + ':' + city);
    })
    .catch(error => {
      console.warn('Error:', error);
    });
  } //END function locateCountry

  function geoFindMe() {

    function success(position) {
      latitude = position.coords.latitude;
      longitude = position.coords.longitude;

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
    var input = document.getElementById("name");

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

    let retryCount    = 0;
    const maxRetries  = 3;  // Set the maximum number of retries
    while (retryCount < maxRetries) {
      try {
        result = await model.generateContent(prompt);
        break;  // Exit the loop on success
      } catch (e) {
        retryCount++;  // Increment retry count
        var error = e.toString();
          if (error.includes("400")) {
            genAIErrorType   = 400;
            // modal_error_text = '<br>' + httpError400;
            modal_error_text = httpError400;

            if (geminiOptions.detect_geo_location) {
              geoFindMe();
              $("#modal_error").html(modal_error_text);
            } else {
              $("#modal_error").html(modal_error_text);
              logger.warn('\n' + 'Gemini API: location is not supported');
            }
          } else if (error.includes("50")) {
            genAIErrorType   = 500;
            modal_error_text = httpError500;
            $("#modal_error").html(modal_error_text);
            logger.warn('\n' + 'Gemini API: service currently not available');
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
              $('#confirmError').modal('show');
            }, 1000);
         } // END else
      } // END finally
    } // END while (retry)

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
      // default module settings
      // -----------------------------------------------------------------------
      var settings = $.extend({
        module_name: 'j1.adapter.gemini',
        generated:   '{{site.time}}'
      }, options);

      // -----------------------------------------------------------------------
      // module variable settings
      // -----------------------------------------------------------------------
      _this                   = j1.adapter.gemini;
      logger                  = log4javascript.getLogger('j1.adapter.gemini');
      cookie_names            = j1.getCookieNames();
      url                     = new liteURL(window.location.href);
      baseUrl                 = url.origin;
      hostname                = url.hostname;
      auto_domain             = hostname.substring(hostname.lastIndexOf('.', hostname.lastIndexOf('.') - 1) + 1);
      secure                  = (url.protocol.includes('https')) ? true : false;
      promptHstoryEnabled     = geminiOptions.history_enabled;
      promptHistoryFromCookie = geminiOptions.use_prompt_history_from_cookie;
      var newItem;
      var itemExists;

      // module loader
      _this.loadModules();

      // ui loader
      _this.loadUI();

      // -----------------------------------------------------------------------
      // initializer
      // -----------------------------------------------------------------------
      var dependencies_met_page_ready = setInterval (() => {
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

        // check page ready state
        if (j1CoreFinished && pageVisible && slimSelectFinished && uiLoaded && modulesLoaded) {

          if (!validApiKey) {
            logger.warn('\n' + 'Invalid API key detected: ' + apiKey);
            logger.debug('\n' + 'disable|hide all UI buttons');
            // disable all UI buttons
            $("#send").hide();
            $("#reset").hide();
            $("#clear").hide();
          }

          // initialize|hide Chatbot UI
          $("#gemini_ui_container").show();
          $("#spinner").hide();
          $("#response").hide();

          // get|clear textarea element (prompt)
          textarea        = document.getElementById(geminiOptions.prompt_id);
          textarea.value  = '';

          // initialize history array from cookie
          if (promptHstoryEnabled && promptHistoryFromCookie) {

            // get slimSelect object for the history (placed by slimSelect adapter)
            selectList                = document.getElementById('prompt_history');
            $slimSelect               = selectList.slim;

            // limit the history
            maxHistory                = geminiOptions.max_prompt_history;

            // allow|reject duplicates for the history
            allowHistoryDuplicates    = geminiOptions.allow_prompt_history_duplicates;

            // allow|reject history updates if maxHistory reached
            allowHistoryUpdatesOnMax  = geminiOptions.allow_prompt_history_updates_on_max;

            logger.debug('\n' + 'read prompt history from cookie');
            var data    = [];
            var option  = {};
            chat_prompt = j1.existsCookie(cookie_names.chat_prompt)
              ? j1.readCookie(cookie_names.chat_prompt)
              : {};

            // convert chat prompt object to array
            textHistory = Object.values(chat_prompt);

            // remove duplicates from history
            if (!allowHistoryDuplicates && textHistory.length > 1) {
              var textHistoryLenght = textHistory.length;
              var uniqueArray       = [...new Set(textHistory)];                // create a 'Set' from the history array to automatically remove duplicates

              textHistory = uniqueArray;
              if (textHistoryLenght > textHistory.length) {
                logger.debug('\n' + 'removed duplicates from history array: ' + (textHistoryLenght - textHistory.length) + ' element|s');
              }
            } // END if !allowHistoryDupicates

            // update|set slimSelect data elements
            data   = [];
            option = {};
            textHistory.forEach(function(historyText) {
              option = {
                text: historyText,
                display: true,
                selected: false,
                disabled: false
              }
              data.push(option);
            }); // END forEach
            $slimSelect.setData(data);

            // display history container
            if (textHistory.length > 0) {
              $("#prompt_history_container").show();
            }

            // -----------------------------------------------------------------
            // sliemSelect event handlers
            // -----------------------------------------------------------------
            //
            _this.slim_select_eventHandler();

          } else {
            $("#clear").hide();
          } // if promptHstoryEnabled

          // -------------------------------------------------------------------
          // button event handlers
          // -------------------------------------------------------------------
          //
          // send request to generate results
          const sendButton = document.getElementById('{{gemini_options.buttons.generate.id}}');
          sendButton.addEventListener('click', (event) => {
            // jadams, 2023-03-13: unclear why consttants are required to set again
            // const selectList  = document.getElementById('prompt_history');
            // const $slimSelect = selectList.slim

            if (promptHstoryEnabled) {
              var historySet = false;

              // check if current prompt alreay exists in history
              const index = textHistory.indexOf(textarea.value);
              itemExists  = (index !== -1) ? true : false;
              if (itemExists) {
                logger.debug('\n' + `prompt: ${textarea.value}\nexists already in history at index: ${index}`);
              }

              // update history on maxHistory
              if (textHistory.length == maxHistory && allowHistoryUpdatesOnMax && !itemExists && !historySet) {
                // place the CURRENT history element FIRST for replacement
                textHistory.reverse();
                if (textarea.value.length > 0) {
                  newItem = textarea.value;
                } else if (textarea.value.length == 0) {
                  newItem = defaultPrompt;
                }
                logger.debug('\n' + 'update item in history: ' +  newItem);
                // replace FIRST history element by NEW item
                textHistory[0] = newItem;
                // textHistory.push(newItem);
                historySet = true;
              }

              // add new item to history
              if (textHistory.length < maxHistory && !itemExists && !historySet) {
                if (textarea.value.length > 0) {
                  // add current (prompt) value to history
                  newItem = textarea.value;
                } else if (textarea.value.length == 0) {
                  // add default prompt
                  newItem = defaultPrompt;
                }
                logger.debug('\n' + 'add new item to history: ' + newItem);
                textHistory.push(newItem);
                historySet = true;
              }

              // failsafe, cleanup history
              if (textHistory.length > 0) {
                // cleanup|add selected value
                var p = 0;
                textHistory.forEach (function (elm) {
                  prompt = elm.replace(/\s+$/g, '');
                  textHistory[p] = prompt;
                  p++;
                }); // END forEach
                logger.debug('\n' + 'cleaned history for trailing whitespaces');
              }

              // remove duplicates from history
              if (textHistory.length > 1 && !allowHistoryDuplicates) {
                var textHistoryLenght = textHistory.length;
                var uniqueArray       = [...new Set(textHistory)];              // create a 'Set' from the history array to automatically remove duplicates

                textHistory = uniqueArray;
                if (textHistoryLenght > textHistory.length) {
                  logger.debug('\n' + 'removed duplicates from history array: ' + (textHistoryLenght - textHistory.length) + ' element|s');
                }
              } // END if allowHistoryDupicates

              // create|set slimSelect data elements
              data   = [];
              option = {};
              textHistory.forEach(function(historyText) {
                option = {
                  text: historyText,
                  display: true,
                  selected: false,
                  disabled: false
                }
                data.push(option);
              }); // END forEach
              $slimSelect.setData(data);

              // display history container
              if (textHistory.length > 0) {
                $("#prompt_history_container").show();
              }

              // write current history to cookie
              logger.debug('\n' + 'save prompt history to cookie');
              if (promptHistoryFromCookie) {
                cookie_written = j1.writeCookie({
                  name:   cookie_names.chat_prompt,
                  data:   textHistory,
                  secure: secure
                });
              }
            }

            // clear results
            document.getElementById('md_result').innerHTML = '';
            $("#result").hide();
            $("#spinner").show();

            // call Gemini API for processing
            runner();
          }); //END sendButton (click)

          // Clear input prompt and the spinner|responses
          const resetButton = document.getElementById('{{gemini_options.buttons.reset.id}}');
          resetButton.addEventListener('click', (event) => {

            // prevent default actions
            // event.preventDefault();

            document.getElementById("prompt").value   = '';
            document.getElementById("response").value = '';
            $("#spinner").hide();
            $("#response").hide();
          }); //END resetButton (click)

          // Clear history|cookie
          const clearButton = document.getElementById('{{gemini_options.buttons.clear.id}}');
          clearButton.addEventListener('click', (event) => {
            logStartOnce = false;

            $('#clearHistory').modal('show');

            const confirmClearHistory = document.getElementById('clearHistory');
            const accecptClearHistory = document.getElementById('accecptClearHistory');
            const dismissClearHistory = document.getElementById('dismissClearHistory');

            accecptClearHistory.addEventListener('click', (event) => {
              logStartOnce = false;

              // clear history
              if (!logStartOnce) {
                logger.warn('\n' + 'perform clearHistory');
                logStartOnce = true;
              }

              // write empty history to cookie
              textHistory = [];
              if (promptHistoryFromCookie) {
                j1.removeCookie({
                  name:   cookie_names.chat_prompt,
                  domain: auto_domain,
                  secure: secure
                });

                cookie_written = j1.writeCookie({
                  name:     cookie_names.chat_prompt,
                  data:     {},
                  secure:   secure
                });
              }

              $("#prompt_history_container").hide();
            }); // END accecptClearHistory(click)

            dismissClearHistory.addEventListener('click', (event) => {
              logStartOnce = false;

              // skip clear history
              if (!logStartOnce) {
                logger.debug('\n' + 'skipped clearHistory');
                logStartOnce = true;
              }

            }); // END dismissClearHistoryButton (click)

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
          logger             = log4javascript.getLogger('j1.adapter.gemini');
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

          logger.debug('\n' + 'Importing Gemini module: successful');
          modulesLoaded = true;
        })
        .catch((error) => {
          logger = log4javascript.getLogger('j1.adapter.gemini');
          // An error occurred during module import
          logger.warn('\n' + 'Importing Gemini module failed: ' + error);
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
          logger.debug('\n' + 'Loading UI: successful');

          clearInterval(dependencies_met_data_loaded);
        } // END if xhrDOMState
      }, 10);

    }, // END loadUI

    slim_select_eventHandler: function () {
      // See: https://slimselectjs.com/
      //
      var select  = document.getElementById(geminiOptions.prompt_history_id);
      var $select = select.slim;
      var slimValues;
      var data;
      var prompt;

      // $select.events.beforeOpen = () => {
      //   values = $select.getSelected();
      //   data = $select.getData();
      //   $select.setData(data[0].selected = false);
      //   console.log('slimSelect: before open');
      // },

      // $select.events.afterOpen = () => {
      //   data  = $select.getData();
      //   value = $select.getSelected();
      //   $select.setSelected(value);
      //   $select.setSelected(value, false);  // To not trigger the afterChange callback
      //   // console.log('slimSelect: after open');
      // },

      // $select.events.addable = (value) => {
      //   // return false or null if you do not want to allow value to be submitted
      //   if (value === 'bad') {return false}
      //
      //   // Return the value string
      //   return value // Optional - value alteration // ex: value.toLowerCase()
      //
      //   // Optional - Return a valid data object.
      //   // See methods/setData for list of valid options
      //   return {
      //     text: value,
      //     value: value.toLowerCase()
      //   }
      // },

      $select.events.beforeClose = () => {
        // get|set selected value
        slimValues = $select.getSelected();

        // failsafe on empty selection (clear prompt)
        if (slimValues.length == 0) {
          logger.debug('\n' + 'selection from history: empty');
          document.getElementById('prompt').value = '';
        }
      },

      $select.events.afterClose = () => {
        // get|set selected value
        slimValues = $select.getSelected();

        //make sure an item was selected
        if (slimValues.length > 0) {
          // cleanup|add selected value
          prompt = slimValues[0].replace(/\s+$/g, '');
          document.getElementById('prompt').value = prompt;
          logger.debug('\n' + 'selection from history: ' + prompt);
        }

        $select.close();
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
