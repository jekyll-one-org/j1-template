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
var maxRetries        = 3;
var logStartOnce      = false;

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
var retryCount;

var latitude;
var longitude;
var country;
var city;

var newItem;
var itemExists;

var selectList;
var $slimSelect;
var textarea;
var promptHistoryMax;
var promptHstoryEnabled;
var promptHistoryFromCookie;
var allowPromptHistoryDuplicates;
var allowPromptHistoryUpdatesOnMax;

var _this;
var logger;
var logText;

var index;
var html;

// values taken from API
var HarmCategory, HarmBlockThreshold;

// date|time
var startTime;
var endTime;
var startTimeModule;
var endTimeModule;
var timeSeconds;

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

  function addHistoryEventListeners(slimSelectData) {
    // process all (slim) data elements
    index = 1;
    slimSelectData.forEach( () => {
      var span             = 'opt_prompt_history_' + index;
      var spanElement      = document.getElementById(span);

      var dependencies_met_span_ready = setInterval (() => {
        var spanElementReady = (($(spanElement).length) !== 0) ? true : false;
        if (spanElementReady) {
//        spanElement.onclick = spanElementEventListener;
          spanElement.addEventListener('click', spanElementEventListener);
          // index++;

          clearInterval(dependencies_met_span_ready);
        }
      }, 10);

      index++;
    }); // END forEach data
  } // END addHistoryEventListeners

  function spanElementEventListener(event) {
    var optionText  = event.currentTarget.nextSibling.data;
    var logger      = log4javascript.getLogger('j1.adapter.gemini');
    var slimData    = $slimSelect.getData();
    var textHistory = [];
    var chatHistory = j1.existsCookie(cookie_names.chat_prompt)
      ? j1.readCookie(cookie_names.chat_prompt)
      : {};
    var foundItem;
    var newHistory;
    var newData;

    // suppress default actions|bubble up
    event.preventDefault();
    event.stopPropagation();

    // update slimSelect data
    foundItem = -1;
    for (let i = 0; i < slimData.length; i++) {
      if (slimData[i].text === optionText) {
        foundItem = i;
        break;
      }
    }

    if (foundItem !== -1) {
      delete slimData[foundItem];

      // create new reindexed data object
      newData = Object.values(slimData);
      // update the select
      $slimSelect.setData(newData);
    }

    // update prompt history data
    foundItem = -1;
    // convert chat prompt object to array
    textHistory = Object.values(chatHistory);
    for (let i = 0; i < textHistory.length; i++) {
      if (textHistory[i] === optionText) {
        foundItem = i;
        break;
      }
    }

    if (foundItem !== -1) {
      delete textHistory[foundItem];

      // create new reindexed data object
      newHistory = Object.values(textHistory);

      // remove duplicates from history
      if (newHistory.length > 1 && !allowPromptHistoryDuplicates) {
        // create a 'Set' from the history array to automatically remove duplicates
        var uniqueArray       = [...new Set(newHistory)];
        newHistory = Object.values(uniqueArray);
      } // END if allowHistoryDupicates

      // update the prompt history
      if (promptHistoryFromCookie) {
        logger.debug('\n' + 'save prompt history to cookie');
        j1.removeCookie({
          name:   cookie_names.chat_prompt,
          domain: auto_domain,
          secure: secure
        });

        if (newHistory.length > 0) {
          cookie_written = j1.writeCookie({
            name:   cookie_names.chat_prompt,
            data:   newHistory,
            secure: secure
          });
        } else {
          cookie_written = j1.writeCookie({
            name:   cookie_names.chat_prompt,
            data:   {},
            secure: secure
          });
          console.log('j1.adapter.gemini' + '\n' + 'hide prompt history on last element deleted');
          $("#prompt_history_container").hide();
        } // END if length
      } // END if promptHistoryFromCookie
    }

    // TODO: check why re-adding of events is required
    addHistoryEventListeners(slimData);
    setTimeout(() => {
      addHistoryEventListeners(slimData);
    }, 500);

    // if (slimData.length) {
    //   // setTimeout(() => {
    //   //   addHistoryEventListeners(slimData);
    //   // }, 500);
    // }

    console.log('j1.adapter.gemini' + '\n' + 'option deleted: ' + optionText);
    $slimSelect.close();
  } // END  spanElementEventListener

  // Log the geolocation position
  function showPosition(position) {
     latitude = position.coords.latitude;
     longitude = position.coords.longitude;
     console.debug("Detected geocode (lat:long): " + latitude + ':' + longitude);
  } // END function showPosition

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
  } // END function locateCountry

  function geoFindMe() {

    function success(position) {
      latitude = position.coords.latitude;
      longitude = position.coords.longitude;

      locateCountry(position);
    } // END function success

    function error() {
      logger.warn('\n' + 'Unable to retrieve the location');
    } // END function error

    if (!navigator.geolocation) {
      logger.warn('\n' + 'Geolocation API is not supported by the browser');
    } else {
      navigator.geolocation.getCurrentPosition(success, error);
    }
  } // END function geoFindMe

  async function runner() {
    var input = document.getElementById("name");

    // For text-only input, use the selected model
    const model = genAI.getGenerativeModel({
      model: gemini_model,
      safetySettings,
      generationConfig
    });

    var prompt = $('textarea#prompt').val();
    if (prompt.length === 0) {
      // use default prompt
      prompt = defaultPrompt.replace(/\s+$/g, '');
      logger.debug('\n' + 'use default prompt: ' + prompt);
      document.getElementById('prompt').value = prompt;
    }

    // run a request
    startTime   = Date.now();
    retryCount  = 1;
    while (retryCount <= maxRetries) {
      try {
        logger.info('\n' + 'processing started: #' + retryCount + '|' + maxRetries);
        result = await model.generateContent(prompt);

        // exit the loop on success
        break;
      } catch (e) {
        var error = e.toString();
        if (error.includes('400')) {
          genAIErrorType   = 400;
          modal_error_text = httpError400;
          if (geminiOptions.detect_geo_location) {
            geoFindMe();
            $("#modal_error").html(modal_error_text);
          } else {
            $("#modal_error").html(modal_error_text);
            logger.warn('\n' + 'location not supported');
          }
        } else if (error.includes('50')) {
          genAIErrorType   = 500;
          modal_error_text = httpError500;
          $("#modal_error").html(modal_error_text);
          logger.warn('\n' + 'service not available');
        }
        genAIError = true;
      } finally {
          if (!genAIError) {
            try {
              logger.debug('\n' + 'collecting results ...');
              response = await result.response;
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
                if (responseFinishReason === 'SAFETY') {
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

                if (responseFinishReason === 'STOP') {
                  for (const [key, value] of Object.entries(candidateRatings)) {
                    safetyRatings.forEach(rating => {
                      if (rating === 'HARM_CATEGORY_DANGEROUS_CONTENT' || rating.category === 'HARM_CATEGORY_HARASSMENT' || rating.category === 'HARM_CATEGORY_HATE_SPEECH' || rating.category === 'HARM_CATEGORY_SEXUALLY_EXPLICIT') {
                        if (rating.probability !== "NEGLIGIBLE") {
                          if (candidateRatings.HARM_CATEGORY_DANGEROUS_CONTENT === "BLOCK_NONE") {
                            safetyCategory  = rating.category;
                            safetyRating    = candidateRatings.HARM_CATEGORY_DANGEROUS_CONTENT;
                            responseText    = response.candidates[0].content.parts[0].text;
                          }
                          if (candidateRatings.HARM_CATEGORY_HARASSMENT === "BLOCK_NONE") {
                            safetyCategory  = rating.category;
                            safetyRating    = candidateRatings.HARM_CATEGORY_HARASSMENT;
                            responseText    = response.candidates[0].content.parts[0].text;
                          }
                          if (candidateRatings.HARM_CATEGORY_HATE_SPEECH === "BLOCK_NONE") {
                            safetyCategory  = rating.category;
                            safetyRating    = candidateRatings.HARM_CATEGORY_HATE_SPEECH;
                            responseText    = response.candidates[0].content.parts[0].text;
                          }
                          if (candidateRatings.HARM_CATEGORY_SEXUALLY_EXPLICIT === "BLOCK_NONE") {
                            safetyCategory  = rating.category;
                            safetyRating    = candidateRatings.HARM_CATEGORY_SEXUALLY_EXPLICIT;
                            responseText = response.candidates[0].content.parts[0].text;
                          }
                        } else {
                          responseText = response.candidates[0].content.parts[0].text;
                        } // END if rating.probability
                      } // END if rating.category
                    }); // END forEach
                  } // END for

                  if (safetyCategory !== undefined) {
                    logger.debug('\n' + safetyCategory + ': ' + safetyRating);
                  }
                } // END responseFinishReason STOP

                if (response.candidates[0].finishReason === 'MAX_TOKENS') {
                  responseText = 'Response disabled due to model settings (<b>maxOutputTokens: ' + geminiOptions.api_options.generationConfig.maxOutputTokens + '</b>). You need to increase your settings to get full response.';
                } // END responseFinishReason MAX_TOKENS

                if (response.candidates[0].finishReason === 'SAFETY') {
                  responseText = 'Response disabled due to security reasons. You need to <b>change your prompt</b> to get proper results.';
                    console.warn('Response disabled due to security reasons');
                } // END responseFinishReason SAFETY

                if (response.candidates[0].finishReason === 'RECITATION') {
                  responseText = 'Response flagged "RECITATION". Resposne currently not supported';
                  console.warn('finishReason "RECITATION" currently not supported');
                } // END responseFinishReason RECITATION

                if (response.candidates[0].finishReason === 'OTHER') {
                  responseText = 'Response disabled due to unknown reasons.';
                  console.warn('Response disabled due to unknown reasons');
                } // END responseFinishReason OTHER

              } // END if response.candidates

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
              } // END responseText length
            } // END finally
          } else {
            if (retryCount === 3) {
              logger.info('\n' + 'requests failed after max retries: ' + maxRetries);

              $("#spinner").hide();
              if (geminiOptions.detectGeoLocation) {
                geoFindMe();
              }
              setTimeout (() => {
                $('#confirmError').modal('show');
              }, 1000);
            }
            // increment retry counter
            retryCount++;
         } // END else
      } // END finally
    } // END while (retry)

    endTime = Date.now();
    logger.info('\n' + 'processing finished: #' + --retryCount + '|' + maxRetries);
    logger.info('\n' + 'total execution time: ' + (endTime-startTime) + 'ms');

  } // END async function runner()

  // ---------------------------------------------------------------------------
  // Main object
  // ---------------------------------------------------------------------------
  return {

    // -------------------------------------------------------------------------
    // init()
    // adapter initializer
    // -------------------------------------------------------------------------
    init: (options) => {

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
      promptHstoryEnabled     = geminiOptions.prompt_history_enabled;
      promptHistoryFromCookie = geminiOptions.prompt_history_from_cookie;

      var data;
      var option;

      // module loader
      _this.loadModules();

      // ui loader
      _this.loadUI();

      // -----------------------------------------------------------------------
      // initializer
      // -----------------------------------------------------------------------
      var dependencies_met_page_ready = setInterval (() => {
        var pageState           = $('#content').css("display");
        var pageVisible         = (pageState === 'block') ? true : false;
        var j1CoreFinished      = (j1.getState() === 'finished') ? true : false;
        var slimSelectFinished  = (j1.adapter.slimSelect.getState() === 'finished') ? true : false;
        var uiLoaded            = (j1.xhrDOMState['#gemini_ui'] === 'success') ? true : false;

        // check page ready state
        if (j1CoreFinished && pageVisible && slimSelectFinished && uiLoaded && modulesLoaded) {

          startTimeModule = Date.now();
          _this.setState('started');
          logger.debug('\n' + 'set module state to: ' + _this.getState());
          logger.info('\n' + 'initializing module: started');

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

          var dependencies_met_select_ready = setInterval(() => {
            var selectState         = $('#container_prompt_history_select_wrapper').length;
            var selectReady         = (selectState > 0) ? true : false;

            if (selectReady) {
              logger.info('\n' + 'initializing select data');

              // initialize history array from cookie
              if (promptHstoryEnabled && promptHistoryFromCookie) {
                // get slimSelect object for the history (placed by slimSelect adapter)
                // selectList                      = document.getElementById('prompt_history');
                $slimSelect                     =  j1.adapter.slimSelect.select[geminiOptions.prompt_history_id];

                // limit the prompt history
                promptHistoryMax                = geminiOptions.prompt_history_max;

                // allow|reject duplicates for the history
                allowPromptHistoryDuplicates    = geminiOptions.allow_prompt_history_duplicates;

                // allow|reject history updates if promptHistoryMax reached
                allowPromptHistoryUpdatesOnMax  = geminiOptions.allow_prompt_history_updates_on_max;

                logger.debug('\n' + 'read prompt history from cookie');
                var data    = [];
                var option  = {};
                chat_prompt = j1.existsCookie(cookie_names.chat_prompt)
                  ? j1.readCookie(cookie_names.chat_prompt)
                  : {};

                // convert chat prompt object to array
                textHistory = Object.values(chat_prompt);

                // remove duplicates from history
                if (!allowPromptHistoryDuplicates && textHistory.length > 1) {
                  var textHistoryLenght = textHistory.length;
                  var uniqueArray       = [...new Set(textHistory)];                // create a 'Set' from the history array to automatically remove duplicates

                  textHistory = uniqueArray;
                  if (textHistoryLenght > textHistory.length) {
                    logger.debug('\n' + 'removed duplicates from history array: ' + (textHistoryLenght - textHistory.length) + ' element|s');
                  }
                } // END if !allowHistoryDupicates

                // update|set slimSelect data elements
                index   = 1;
                data    = [];
                option  = {};
                textHistory.forEach((historyText) => {
                  html    = '<span id="opt_' + geminiOptions.prompt_history_id + '_' + index + '" class="ss-option-delete">' + '<i class="mdib mdib-close mdib-16px ml-1 mr-2"></i></span>' + historyText;

                  option = {
                    text:     historyText,
                    html:     html,
                    display:  true,
                    selected: false,
                    disabled: false
                  }

                  data.push(option);
                  index++
                }); // END forEach
                $slimSelect.setData(data);

                // -------------------------------------------------------------
                // CREATE history event handlers
                // -------------------------------------------------------------
                if (data.length) {
                  addHistoryEventListeners(data);
                }

                // display history container
                if (textHistory.length > 0) {
                  $("#prompt_history_container").show();
                }

                // -------------------------------------------------------------
                // sliemSelect event handlers
                // -------------------------------------------------------------
                //
                _this.slim_select_eventHandler();

              } else {
                // disable|hide clear history button
                $("#clear").hide();
              } // if promptHstoryEnabled

              clearInterval(dependencies_met_select_ready);
            } // END if modules loaded
          }, 10);

          // -------------------------------------------------------------------
          // button event handlers
          // -------------------------------------------------------------------
          //

          // send request to generate results
          const sendButton = document.getElementById('{{gemini_options.buttons.generate.id}}');
          sendButton.addEventListener('click', (event) => {
            // suppress default actions|bubble up
            event.preventDefault();
            event.stopPropagation();

            if (promptHstoryEnabled) {
              var historySet = false;

              if (textarea.value.length === 0) {
                // use default prompt
                prompt = defaultPrompt.replace(/\s+$/g, '');
                logger.debug('\n' + 'use default prompt: ' + prompt);
              } else {
                prompt = textarea.value.replace(/\s+$/g, '');
              }

              // check if current prompt alreay exists in history
              index = textHistory.indexOf(prompt);
              itemExists  = (index !== -1) ? true : false;
              if (itemExists) {
                logText = '\n' + `prompt: "${prompt}"\n` + `already exists in history at index: ${index}`;
                logger.debug(logText);
              }

              // update history on promptHistoryMax
              if (textHistory.length === promptHistoryMax && allowPromptHistoryUpdatesOnMax && !itemExists && !historySet) {
                // place the CURRENT history element FIRST for replacement
                textHistory.reverse();
                if (textarea.value.length > 0) {
                  // cleanup textarea value for trailing whitespaces
                  newItem = textarea.value.replace(/\s+$/g, '');
                } else if (textarea.value.length === 0) {
                  // use default prompt
                  newItem = defaultPrompt.replace(/\s+$/g, '');
                  logger.debug('\n' + 'use default prompt: ' + newItem);
                }

                logger.debug('\n' + 'update item in history: ' +  textHistory[0]);
                // replace FIRST history element by NEW item
                textHistory[0] = newItem;
                logger.debug('\n' + 'add new item to history: ' + textHistory[0]);

                historySet = true;
              }

              // add new item to history
              if (textHistory.length < promptHistoryMax && !itemExists && !historySet) {
                if (textarea.value.length > 0) {
                  // cleanup textarea value for trailing whitespaces
                  newItem = textarea.value.replace(/\s+$/g, '');
                } else if (textarea.value.length === 0) {
                  // use default prompt
                  newItem = defaultPrompt.replace(/\s+$/g, '');
                  logger.debug('\n' + 'use default prompt: ' + newItem);
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
              if (textHistory.length > 1 && !allowPromptHistoryDuplicates) {
                var textHistoryLenght = textHistory.length;
                var uniqueArray       = [...new Set(textHistory)];              // create a 'Set' from the history array to automatically remove duplicates

                textHistory = uniqueArray;
                if (textHistoryLenght > textHistory.length) {
                  logger.debug('\n' + 'removed duplicates from history array: ' + (textHistoryLenght - textHistory.length) + ' element|s');
                }
              } // END if allowHistoryDupicates

              // create|set slimSelect data elements
              index   = 1;
              data    = [];
              option  = {};
              textHistory.forEach ((historyText) => {
                html    = '<span id="opt_' + geminiOptions.prompt_history_id + '_' + index + '" class="ss-option-delete">' + '<i class="mdib mdib-close mdib-16px ml-1 mr-2"></i></span>' + historyText;

                option  = {
                  text:     historyText,
                  html:     html,
                  display:  true,
                  selected: false,
                  disabled: false
                }
                data.push(option);
                index++;
              }); // END forEach
              $slimSelect.setData(data);

              // ---------------------------------------------------------------
              // UPDATE history event handlers
              // ---------------------------------------------------------------
              if (data.length) {
                addHistoryEventListeners(data);
              }

              // display history container
              if (textHistory.length > 0) {
                $("#prompt_history_container").show();
              }

              // write current history to cookie
              if (promptHistoryFromCookie) {
                logger.debug('\n' + 'save prompt history to cookie');
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
          }); // END sendButton (click)

          // Clear input prompt and the spinner|responses
          const resetButton = document.getElementById('{{gemini_options.buttons.reset.id}}');
          resetButton.addEventListener('click', (event) => {
            // suppress default actions|bubble up
            event.preventDefault();
            event.stopPropagation();

            document.getElementById("prompt").value   = '';
            document.getElementById("response").value = '';
            $("#spinner").hide();
            $("#response").hide();
          }); // END resetButton (click)

          // Clear history|cookie
          const clearButton = document.getElementById('{{gemini_options.buttons.clear.id}}');
          clearButton.addEventListener('click', (event) => {
            // suppress default actions|bubble up
            event.preventDefault();
            event.stopPropagation();

            logStartOnce = false;
            $('#clearHistory').modal('show');

            const confirmClearHistory = document.getElementById('clearHistory');
            const accecptClearHistory = document.getElementById('accecptClearHistory');
            const dismissClearHistory = document.getElementById('dismissClearHistory');

            accecptClearHistory.addEventListener('click', (event) => {
              logStartOnce = false;

              // suppress bubble up|default actions
              event.preventDefault();

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

            // skip clear history
            dismissClearHistory.addEventListener('click', (event) => {
              // suppress default actions|bubble up
              event.preventDefault();
              event.stopPropagation();

              logger.debug('\n' + 'skipped clearHistory');
            }); // END dismissClearHistoryButton (click)

          }); // END clearButton (click)

          _this.setState('finished');
          logger.debug('\n' + 'state: ' + _this.getState());
          logger.info('\n' + 'initializing module: finished');

          endTimeModule = Date.now();
          logger.info('\n' + 'module initializing time: ' + (endTimeModule-startTimeModule) + 'ms');

          clearInterval(dependencies_met_page_ready);
        }
      }, 10);

    }, // END init

    // -------------------------------------------------------------------------
    // loadModules()
    // Module loader
    // -------------------------------------------------------------------------
    loadModules: () => {

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
    loadUI: () => {
      j1.loadHTML ({
          xhr_container_id: geminiOptions.xhr_container_id,
          xhr_data_path:    geminiOptions.xhr_data_path,
          xhr_data_element: geminiOptions.xhr_data_element
        },
        'j1.adapter.gemini',
        'null'
      );

      var dependencies_met_data_loaded = setInterval(function() {
        if (j1.xhrDOMState['#gemini_ui'] === 'success') {
          logger.debug('\n' + 'Loading UI: successful');

          clearInterval(dependencies_met_data_loaded);
        } // END if xhrDOMState
      }, 10);

    }, // END loadUI

    slim_select_eventHandler: () => {
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

      $select.events.beforeClose = (e) => {
        // handle click events from deletion span
        // get|set selected value
        slimValues = $select.getSelected();

        // failsafe on empty selection (clear prompt)
        if (slimValues.length === 0) {
          logger.debug('\n' + 'selection from history: empty');
          document.getElementById('prompt').value = '';
        }

      }, // END event beforeClose

      $select.events.afterClose = () => {
        // get|set selected value
        slimValues = $select.getSelected();

        //make sure an item was selected
        if (slimValues.length > 0) {
          // cleanup|add selected value
//        prompt = slimValues[0].replace(/\s+$/g, '');
          prompt = slimValues[0];
          document.getElementById('prompt').value = prompt;
          logger.debug('\n' + 'selection from history: ' + prompt);
        }
        // failsafe on empty selection (clear prompt)
        if (slimValues.length === 0) {
          logger.debug('\n' + 'selection from history: empty');
          document.getElementById('prompt').value = '';
        }

        // $select.close();
      }, // END event afterClose

      $select.events.addable = (value) => {
        // return false or null if you do NOT want to allow value to be submitted
        if (value === 'bad') {
          return false
        } else {
          // Return the value string
          return value // Optional - value alteration // ex: value.toLowerCase()
        } // END if value
      } // END event addable
    }, // END slim_select_eventHandler()

    // -------------------------------------------------------------------------
    // int2float()
    // convert an integer to float using given precision (default: 2 decimals)
    // -------------------------------------------------------------------------
    int2float: (number, precision=2) => {
      return number.toFixed(precision);
    },

    // -------------------------------------------------------------------------
    // getTimeLeft()
    // calulates the time left
    // -------------------------------------------------------------------------
    getTimeLeft: (endDate) => {
      // Get the current date and time
      const now = new Date();

      // Get the milliseconds of both dates
      const endTime = endDate.getTime();
      const currentTime = now.getTime();

      // Calculate the difference in milliseconds
      const difference = endTime - currentTime;

      // Check if the end date has passed (difference is negative)
      if (difference < 0) {
        return 'Time has passed!';
      }

      // Calculate remaining days using milliseconds in a day
      const daysLeft = Math.floor(difference / (1000 * 60 * 60 * 24));

      // Calculate remaining hours using milliseconds in an hour
      const hoursLeft = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

      // Calculate remaining minutes using milliseconds in a minute
      const minutesLeft = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

      // Calculate remaining seconds using milliseconds in a second
      const secondsLeft = Math.floor((difference % (1000 * 60)) / 1000);

      // Return a formatted string showing remaining time
      return `${daysLeft} days, ${hoursLeft} hours, ${minutesLeft} minutes, ${secondsLeft} seconds left`;
    }, // END getTimeLeft

    // -------------------------------------------------------------------------
    // deleteSlimOption()
    // delete an option from SlimSelect
    // -------------------------------------------------------------------------
    deleteSlimOption: (slimSelect, optionValue) => {
      // Find the option to delete
      var optionToDelete = document.querySelector('#mySelect option[value="' + optionValue + '"]');

      // Remove the option from the select
      optionToDelete.remove();

      // Update SlimSelect
      slimSelect.render();
    },

    // -------------------------------------------------------------------------
    // messageHandler()
    // manage messages send from other J1 modules
    // -------------------------------------------------------------------------
    messageHandler: (sender, message) => {
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
    setState: (stat) => {
      _this.state = stat;
    }, // END setState

    // -------------------------------------------------------------------------
    // getState()
    // Returns the current (processing) state of the module
    // -------------------------------------------------------------------------
    getState: () => {
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
