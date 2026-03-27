---
regenerate:                             true
---

{% capture cache %}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/adapter/js/gemini.js
 # Liquid template to adapt the Google Gemini API module
 #
 # Product/Info:
 # https://jekyll.one
 # Copyright (C) 2023-2025 Juergen Adams
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
{% assign asset_path          = "/assets/theme/j1" %}

{% comment %} Process YML config data
================================================================================ {% endcomment %}

{% comment %} Set config files
-------------------------------------------------------------------------------- {% endcomment %}
{% assign template_config     = site.data.j1_config %}
{% assign blocks              = site.data.blocks %}
{% assign modules             = site.data.modules %}

{% comment %} Set config data (settings only)
-------------------------------------------------------------------------------- {% endcomment %}
{% assign gemini_defaults     = modules.defaults.gemini.defaults %}
{% assign gemini_settings     = modules.gemini.settings %}

{% comment %} Set config options (settings only)
-------------------------------------------------------------------------------- {% endcomment %}
{% assign gemini_options      = gemini_defaults | merge: gemini_settings %}

{% comment %} Variables
-------------------------------------------------------------------------------- {% endcomment %}
{% assign comments            = gemini_options.enabled %}

{% comment %} Detect prod mode
-------------------------------------------------------------------------------- {% endcomment %}
{% assign production = false %}
{% if environment == 'prod' or environment == 'production' %}
  {% assign production = true %}
{% endif %}

/*
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/adapter/js/gemini.js
 # J1 Adapter for the Google Gemini API module
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2023-2025 Juergen Adams
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
const defaultPrompt   = 'Please provide tips on how using the prompt for a chat bot';
const httpError400    = 'Location is not supported: ';
const httpError500    = 'Service currently not available: ';

var environment       = '{{environment}}';
var state             = 'not_started';
var leafletScript     = document.createElement('script');
var geocoderScript    = document.createElement('script');
var safetySettings    = [];
var genAIError        = false;
var genAIErrorType    = '';
var response          = '';
var modal_error_text  = '';
var moduleLoaded      = false;
var moduleLoaded      = false;

var apiKey;
var validApiKey;
var genAI;
var geminiDefaults;
var geminiSettings;
var geminiOptions;
var frontmatterOptions;
var result;
var _this;
var logger;
var logText;
var HarmCategory, HarmBlockThreshold;

  // ---------------------------------------------------------------------------
  // Helper functions
  // ---------------------------------------------------------------------------

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
      console.error('Error:', error);
    });
  } //END function locateCountry

  function geoFindMe() {

    function success(position) {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      locateCountry(position);
    } //END function success

    function error() {
      console.warn("Unable to retrieve the location");
    } //END function error

    if (!navigator.geolocation) {
      console.warn("Geolocation API is not supported by the browser");
    } else {
      navigator.geolocation.getCurrentPosition(success, error);
    }
  } //END function geoFindMe

  async function runner() {
    let input = document.getElementById("name");

    // For text-only input, use the gemini-pro model
    const model = genAI.getGenerativeModel({
      model: "gemini-pro",
      safetySettings
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
          console.warn(httpError400);
        } else if (error.includes("50")) {
          genAIErrorType = 500;
          modal_error_text = httpError500;
          console.warn(httpError500);
        }
        genAIError = true;
    } finally {
        if (!genAIError) {
          try {
              response = await result.response;
          } catch (e) {
              console.warn(e);
          } finally {
            $("#spinner").hide();

            // Process/Evaluate promptFeedback
            //
            var safetyReasons     = false;
            var reasonDetails     = '';
            var ratingCategory    = '';
            var ratingProbability = '';
            var responseText      = '';
            var candidateRatings  = [];
            var promptFeedbackResponse;
            var candidateFeedbackResponse;
            var safetyRatingResponse;
            var safetyRatings;


            if (response.promptFeedback !== undefined) {
              safetyRatings             = response.promptFeedback.safetyRatings;
//            promptFeedbackResponse    = response.promptFeedback.safetyRatings;
              if (response.text !== undefined && response.text.length > 0) {
                responseText = response.text;
              }
            }

            if (response.candidates !== undefined) {
              safetyRatings    = response.candidates[0].safetyRatings;
              candidateRatings = geminiOptions.candidateRatings;

              if (response.candidates[0].finishReason !== undefined) {
                if (response.candidates[0].finishReason == 'STOP') {
                  for (const [key, value] of Object.entries(candidateRatings)) {
                    safetyRatings.forEach(rating => {
                      if (rating.category == 'HARM_CATEGORY_DANGEROUS_CONTENT' || rating.category == 'HARM_CATEGORY_HARASSMENT' || rating.category == 'HARM_CATEGORY_HATE_SPEECH' || rating.category == 'HARM_CATEGORY_SEXUALLY_EXPLICIT') {
                        if (rating.probability !== "NEGLIGIBLE") {
                          if (candidateRatings.HARM_CATEGORY_DANGEROUS_CONTENT == "BLOCK_NONE") {
                            responseText = response.candidates[0].content.parts[0].text;
                          }
                          if (candidateRatings.HARM_CATEGORY_HARASSMENT == "BLOCK_NONE") {
                            responseText = response.candidates[0].content.parts[0].text;
                          }
                          if (candidateRatings.HARM_CATEGORY_HATE_SPEECH == "BLOCK_NONE") {
                            responseText = response.candidates[0].content.parts[0].text;
                          }
                          if (candidateRatings.HARM_CATEGORY_SEXUALLY_EXPLICIT == "BLOCK_NONE") {
                            responseText = response.candidates[0].content.parts[0].text;
                            logger.debug('\n' + 'HARM_CATEGORY_SEXUALLY_EXPLICIT: ' + candidateRatings.HARM_CATEGORY_SEXUALLY_EXPLICIT);
                            break;
                            // console.debug(`${key}: ${value}`);
                          }
                        } //END if rating.probability
                      } //END if rating.category
                    }); //END forEach
                  } //END for
                } //END if inishReason 'STOP'
                if (response.candidates[0].finishReason == 'SAFETY') {
                  responseText = 'Bullabü';
                }
              } //END if finishReason
            }

            if (safetyRatings.length > 0) {
                safetyRatings.forEach(rating => {
                  // jadams, 2024-02-25: workaround!!!
                  if (rating.probability != 'NEGLIGIBLE' && rating.probability != 'LOW' && rating.probability != 'MEDIUM') {
                    reasonDetails    += rating.category + ': ' + rating.probability + '<br>';
                    safetyReasons     = true;
                    ratingCategory    = '<b>' + rating.category + '</b>';
                    ratingCategory    = ratingCategory.replaceAll('HARM_CATEGORY_', '');
                    ratingProbability = '<b>' + rating.probability + '</b>.';
                  }
                });
                if (safetyReasons) {
                  console.warn('Processing returned feedback exception.');
                }

            } //END if promptFeedback

            // Process/Evaluate candidates
            //
            if (response.candidates !== undefined  && response.candidates.length > 0) {
               var candidates = response.candidates[0];
               if (candidates.safetyRatings.length > 0 && candidates.finishReason == 'SAFETY') {
                 candidates.safetyRatings.forEach(rating => {
                   // jadams, 2024-02-25: workaround!!!
                   if (rating.probability != 'NEGLIGIBLE' && rating.probability != 'LOW' && rating.probability != 'MEDIUM') {
                     reasonDetails    += rating.category + ': ' + rating.probability + '<br>';
                     safetyReasons     = true;
                     ratingCategory    = '<b>' + rating.category + '</b>';
                     ratingCategory    = ratingCategory.replaceAll('HARM_CATEGORY_', '');
                     ratingProbability = '<b>' + rating.probability + '</b>.';
                   }
                   console.warn('Processing issues. Reason: ' + reasonDetails);
                 });
                 if (safetyReasons) {
                   console.warn('Processing stopped. Reason: feedback exception.');
                   reasonDetails = reasonDetails.replaceAll('HARM_CATEGORY_', '');
                 }
             }
           } //END if

           // Generate responses
           //
           // if (response.text.length > 0) {
           //   responseText = response.text();
           // } else if (response.candidates !== undefined  && response.candidates.length > 0 && response.candidates[0].content !== undefined) {
           //   responseText = response.candidates[0].content.parts[0].text;
           // }
           //
           // if (responseText.length == 0 && safetyReasons) {
           //    responseText  = 'The KI-Model could not create a valid response because of an feedback exception ' + ratingCategory + ' <br>in level ' + ratingProbability;
           //    responseText += ' '
           //    responseText += 'You may <b>re-run</b> the generation for a valid response.'
           //    document.getElementById('md_result').innerHTML = marked.parse(responseText);
           //    $("#response").show();
           // }
           //
           // if (responseText.length > 0 && safetyReasons) {
           //   responseText  = 'The KI-Model could not create a valid response because of an feedback exception ' + ratingCategory + ' <br>in level ' + ratingProbability;
           //   responseText += ' '
           //   responseText += 'You may <b>re-run</b> the generation for a valid response.'
           //   document.getElementById('md_result').innerHTML = marked.parse(responseText);
           //   $("#response").show();
           // }

           // if (responseText.length > 0 && !safetyReasons) {
           //    document.getElementById('md_result').innerHTML = marked.parse(responseText);
           //    $("#response").show();
           // }

           if (responseText.length > 0) {
              document.getElementById('md_result').innerHTML = marked.parse(responseText);
              $("#response").show();
           }

          } //END finally
        } else {
           geoFindMe();
           console.warn('Processing failed.');
           $("#spinner").hide();
           setTimeout (function() {
             $('#errorModal').modal('show');
          }, 500);

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

      // [INFO   ] [j1.adapter.comments                    ] [ detected comments provider (j1_config): {{comments_provider}}} ]
      // [INFO   ] [j1.adapter.comments                    ] [ start processing load region head, layout: {{page.layout}} ]

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

      // create settings object from frontmatter
      frontmatterOptions  = options != null ? $.extend({}, options) : {};

      // create settings object from module options
      geminiDefaults = $.extend({}, {{gemini_defaults | replace: 'nil', 'null' | replace: '=>', ':' }});
      geminiSettings = $.extend({}, {{gemini_settings | replace: 'nil', 'null' | replace: '=>', ':' }});
      geminiOptions  = $.extend(true, {}, geminiDefaults, geminiSettings, frontmatterOptions);

      _this  = j1.adapter.gemini;
      logger = log4javascript.getLogger('j1.adapter.gemini');

      // Module loader
      _this.loadModules();

      // UI loader
      _this.loadUI();

      // Module initializer
      var dependencies_met_page_ready = setInterval (function (options) {
        var pageState     = $('#no_flicker').css("display");
        var pageVisible   = (pageState == 'block') ? true : false;
        var uiLoaded      = (j1.xhrDOMState['#gemini_ui'] == 'success') ? true : false;

        if (!logStartOnce) {
          _this.setState('started');
          logger.info('\n' + 'set module state to: ' + _this.getState());
          logger.info('\n' + 'module is being initialized');
          logStartOnce = true;
        }

        if (j1.getState() === 'finished' && pageVisible && moduleLoaded && uiLoaded) {

          // Initialize|Hide UI Components
          $("#spinner").hide();
          $("#response").hide();

          // Initialize|Empty the prompt (textarea)
          document.getElementById('prompt').value = '';

          if (!validApiKey) {
            logger.warn('\n' + 'Invalid API key detected: ' + apiKey);
            $("#send").hide();
            $("#reset").hide();
          }

          const sendButton = document.getElementById('send');
          sendButton.addEventListener('click', (event) => {
            // Prevent default actions
            event.preventDefault();
            $("#spinner").show();

            // Run main processing
            runner();
          }); //END sendButton (click)

          // Clear input form|spinner|responses
          const resetButton = document.getElementById('reset');
          resetButton.addEventListener('click', (event) => {
            // Prevent default actions
            event.preventDefault();
            document.getElementById("prompt").value   = '';
            document.getElementById("response").value = '';
            $("#spinner").hide();
            $("#response").hide();
          }); //END resetButton (click)

          _this.setState('finished');
          logger.debug('\n' + 'state: ' + _this.getState());
          logger.info('\n' + 'module initialized successfully');

          clearInterval(dependencies_met_page_ready);
        }
      }, 10);

    }, // END init

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
    }, // END getState

    // -------------------------------------------------------------------------
    // loadModules()
    // Module loader
    // -------------------------------------------------------------------------
    loadModules: function () {

      if (geminiOptions.detectGeoLocation) {
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

      import('//esm.run/@google/generative-ai')
        .then((module) => {
          // Module is imported successfully
          apiKey             = geminiOptions.apiKey;
          validApiKey        = (apiKey.includes('your-')) ? false : true;
          genAI              = new module.GoogleGenerativeAI(apiKey);
          HarmCategory       = module.HarmCategory;
          HarmBlockThreshold = module.HarmBlockThreshold;

          safetySettings = [
            {
              category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
              threshold: geminiOptions.safetyRatings.HARM_CATEGORY_DANGEROUS_CONTENT
            },
            {
              category: HarmCategory.HARM_CATEGORY_HARASSMENT,
              threshold: geminiOptions.safetyRatings.HARM_CATEGORY_HARASSMENT
            },
            {
              category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
              threshold: geminiOptions.safetyRatings.HARM_CATEGORY_HATE_SPEECH
            },
            {
              category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
              threshold: geminiOptions.safetyRatings.HARM_CATEGORY_SEXUALLY_EXPLICIT
            }
          ];

          console.debug('gemini: Importing module: successful');
          moduleLoaded = true;
        })
        .catch((error) => {
          // An error occurred during module import
          console.error('gemini: Importing module failed: ', error);
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

    } // END loadUI

  }; // END return
})(j1, window);

{% endcapture %}
{% if production %}
  {{ cache | minifyJS }}
{% else %}
  {{ cache | strip_empty_lines }}
{% endif %}
{% assign cache = nil %}
