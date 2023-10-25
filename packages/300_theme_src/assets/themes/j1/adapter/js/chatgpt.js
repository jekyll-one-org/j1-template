---
regenerate:                             true
---

{% capture cache %}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/chatgpt.js
 # Liquid template to adapt the chatgpt module
 #
 # Product/Info:
 # https://jekyll.one
 # Copyright (C) 2023 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # For details, see: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE.md
 # -----------------------------------------------------------------------------
 # Test data:
 #  {{ liquid_var | debug }}
 #  chatgpt_options:  {{ chatgpt_options | debug }}
 # -----------------------------------------------------------------------------
{% endcomment %}

{% comment %} Liquid procedures
-------------------------------------------------------------------------------- {% endcomment %}

{% comment %} Set global settings
-------------------------------------------------------------------------------- {% endcomment %}
{% assign environment       = site.environment %}
{% assign asset_path        = "/assets/themes/j1" %}

{% comment %} Process YML config data
================================================================================ {% endcomment %}

{% comment %} Set config files
-------------------------------------------------------------------------------- {% endcomment %}
{% assign template_config    = site.data.j1_config %}
{% assign blocks             = site.data.blocks %}
{% assign modules            = site.data.modules %}

{% comment %} Set config data (settings only)
-------------------------------------------------------------------------------- {% endcomment %}
{% assign chatgpt_defaults = modules.defaults.chatgpt.defaults %}
{% assign chatgpt_settings = modules.chatgpt.settings %}

{% comment %} Set config options (settings only)
-------------------------------------------------------------------------------- {% endcomment %}
{% assign chatgpt_options  = chatgpt_defaults | merge: chatgpt_settings %}

{% comment %} Variables
-------------------------------------------------------------------------------- {% endcomment %}
{% assign chatgpt          = chatgpt_options.enabled %}
{% assign chatgpt_provider = chatgpt_options.provider %}

{% comment %} Detect prod mode
-------------------------------------------------------------------------------- {% endcomment %}
{% assign production = false %}
{% if environment == 'prod' or environment == 'production' %}
  {% assign production = true %}
{% endif %}

{% comment %} chatgpt_options:  {{ chatgpt_options | debug }} {% endcomment %}

/*
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/chatgpt.js
 # J1 Adapter for the chatgpt module
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2023 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # For details, see: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE.md
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
j1.adapter.chatgpt = (function (j1, window) {

{% comment %} Set global variables
-------------------------------------------------------------------------------- {% endcomment %}
var url               = new URL(window.location.href);
var hostname          = url.hostname;
var environment       = '{{environment}}';
var apiScript         = document.createElement('script');
var cookie_names      = j1.getCookieNames();
var date              = new Date();
var timestamp_now     = date.toISOString();
var skipHost          = false;
var state             = 'not_started';

var chatgptDefaults;
var chatgptSettings;
var chatgptOptions;
var chatbotID;
var chatbotWidget;
var validchatbotID;
var user_consent;
var apiExists;
var _this;
var logger;
var logText;

  // ---------------------------------------------------------------------------
  // Main object
  // ---------------------------------------------------------------------------
  return {

    // -------------------------------------------------------------------------
    // init()
    // adapter initializer
    // -------------------------------------------------------------------------
    init: function (options) {

      var dependencies_met_page_ready = setInterval (function (options) {
        var pageState   = $('#no_flicker').css("display");
        var pageVisible = (pageState == 'block') ? true: false;
        var atticFinished = (j1.adapter.attic.getState() == 'finished') ? true: false;

      if ( j1.getState() === 'finished' && pageVisible ) {
//    if ( j1.getState() === 'finished' && pageVisible && atticFinished) {
          {% if chatgpt %}

            // Load  module DEFAULTS|CONFIG
            chatgptDefaults = $.extend({}, {{chatgpt_defaults | replace: 'nil', 'null' | replace: '=>', ':' }});
            chatgptSettings = $.extend({}, {{chatgpt_settings | replace: 'nil', 'null' | replace: '=>', ':' }});
            chatgptOptions  = $.extend(true, {}, chatgptDefaults, chatgptSettings);

            // [INFO   ] [j1.adapter.chatgpt                    ] [ detected chatgpt provider (j1_config): {{chatgpt_provider}}} ]
            // [INFO   ] [j1.adapter.chatgpt                    ] [ start processing load region head, layout: {{page.layout}} ]
            {% case chatgpt_provider %}
            {% when "webwhiz" %}
            // [INFO   ] [j1.adapter.chatgpt                    ] [ place provider: WebWhiz ]
            chatbotID        = chatgptOptions.chatbotID;
            validchatbotID   = (chatbotID.includes('your')) ? false : true;

            // -----------------------------------------------------------------
            // Default module settings
            // -----------------------------------------------------------------
            var settings = $.extend({
              module_name: 'j1.adapter.chatgpt',
              generated:   '{{site.time}}'
            }, options);

            // -----------------------------------------------------------------
            // Global variable settings
            // -----------------------------------------------------------------
            _this = j1.adapter.chatgpt;
            logger = log4javascript.getLogger('j1.adapter.chatgpt');

            // initialize state flag
            _this.setState('started');
            logger.debug('\n' + 'state: ' + _this.getState());
            logger.info('\n' + 'module initializing: started');

//          apiExists = document.getElementById('__webwhizSdk__') === null ? false : true;
            user_consent = j1.readCookie(cookie_names.user_consent);
            if (user_consent.personalization) {
              if (validchatbotID) {
                logger.info('\n' + 'user consent on personalization: ' + user_consent.personalization);
              } else {
                logger.warn('\n' + 'invalid chatbotID detected: ' + chatbotID);
                logger.warn('\n' + 'module chatGPT: disabled');
                return;
              }
            } else {
              logger.info('\n' + 'user consent on personalization: ' + user_consent.personalization);
              logger.warn('\n' + 'disable Chatbot on ID: ' + chatbotID);
              return;
            }

            _this.setState('finished');

            logger.debug('\n' + 'state: ' + _this.getState());
            logger.info('\n' + 'module initializing: finished');
            clearInterval(dependencies_met_page_ready);


            {% comment %} Setup TutGPT
            -------------------------------------------------------------------- {% endcomment %}
            {% when "tutgpt" %}

            // [INFO   ] [j1.adapter.chatgpt                    ] [ place provider: WebWhiz ]
            chatbotID        = chatgptOptions.chatbotID;
            validchatbotID   = (chatbotID.includes('your')) ? false : true;

            // -----------------------------------------------------------------
            // Default module settings
            // -----------------------------------------------------------------
            var settings = $.extend({
              module_name: 'j1.adapter.chatgpt',
              generated:   '{{site.time}}'
            }, options);

            // -----------------------------------------------------------------
            // Global variable settings
            // -----------------------------------------------------------------
            _this = j1.adapter.chatgpt;
            logger = log4javascript.getLogger('j1.adapter.chatgpt');

            // initialize state flag
            _this.setState('started');
            logger.debug('\n' + 'state: ' + _this.getState());
            logger.info('\n' + 'module initializing: started');

            user_consent = j1.readCookie(cookie_names.user_consent);
            if (user_consent.personalization) {
              if (validchatbotID) {
                logger.info('\n' + 'user consent on personalization: ' + user_consent.personalization);
                logger.info('\n' + 'enable TutGPT on ID: ' + chatbotID);

                // create the chatbotWidget (Button container)
                //
                chatbotWidget = document.createElement("div");
                chatbotWidget.setAttribute("id", "chatbot-widget");
                document.body.appendChild(chatbotWidget);

                // create the chatbotAPI
                //
                apiScript.src   = "https://widget.tutgpt.com/chat.js";
                apiScript.async = true;
                apiScript.id    = "chatbot-api";
                apiScript.addEventListener("load", function (evt) {
//                evt.stopPropagation();

                  window.BotChat.init({
                    id: chatbotID,
                  });

                })

                setTimeout (function() {
                  logger.info('\n' + 'Initialize TutGPT API');

                  // add the chatbotAPI (delayed)
                  //
                  document.head.appendChild(apiScript);
                  logger.info('\n' + 'TutGPT API added in section: head');
                }, 3000);
              } else {
                logger.warn('\n' + 'invalid chatbotID detected: ' + chatbotID);
                logger.warn('\n' + 'module chatGPT: disabled');
              }
            } else {
              logger.info('\n' + 'user consent on personalization: ' + user_consent.personalization);
              logger.warn('\n' + 'disable TutGPT on ID: ' + chatbotID);
            }

            _this.setState('finished');
            logger.debug('\n' + 'state: ' + _this.getState());
            logger.info('\n' + 'module initializing: finished');
            clearInterval(dependencies_met_page_ready);


            {% comment %} Setup ChatBob
            -------------------------------------------------------------------- {% endcomment %}
            {% when "chatbob" %}
            // [INFO   ] [j1.adapter.chatgpt                    ] [ place provider: WebWhiz ]
            chatbotID        = chatgptOptions.chatbotID;
            validchatbotID   = (chatbotID.includes('your')) ? false : true;

            // -----------------------------------------------------------------
            // Default module settings
            // -----------------------------------------------------------------
            var settings = $.extend({
              module_name: 'j1.adapter.chatgpt',
              generated:   '{{site.time}}'
            }, options);

            // -----------------------------------------------------------------
            // Global variable settings
            // -----------------------------------------------------------------
            _this = j1.adapter.chatgpt;
            logger = log4javascript.getLogger('j1.adapter.chatgpt');

            // initialize state flag
            _this.setState('started');
            logger.debug('\n' + 'state: ' + _this.getState());
            logger.info('\n' + 'module initializing: started');

            apiExists = document.getElementById("{{chatbotID}}") === null ? false : true;
            user_consent  = j1.readCookie(cookie_names.user_consent);
            if (user_consent.personalization) {
              if (validchatbotID) {
                logger.info('\n' + 'user consent on personalization: ' + user_consent.personalization);
                logger.info('\n' + 'enable ChatBob on ID: ' + chatbotID);

                apiScript.async = true;
                apiScript.id    = chatbotID;
                apiScript.src   = 'https://www.chatbob.co/embed.js';

                document.head.appendChild(apiScript);

                logger.info('\n' + 'ChatBob API added in section: head');
              } else {
                logger.warn('\n' + 'invalid chatbotID detected: ' + chatbotID);
                logger.warn('\n' + 'module chatGPT: disabled');
              }
            } else {
              logger.info('\n' + 'user consent on personalization: ' + user_consent.personalization);
              logger.warn('\n' + 'disable ChatBob on ID: ' + chatbotID);
            }

            _this.setState('finished');
            logger.debug('\n' + 'state: ' + _this.getState());
            logger.info('\n' + 'module initializing: finished');
            clearInterval(dependencies_met_page_ready);


            {% comment %} Setup Custom Bot
            -------------------------------------------------------------------- {% endcomment %}
            {% when "custom" %}
            // [INFO   ] [j1.adapter.analytics                    ] [ place provider: Custom Provider ]

            {% endcase %}
            // [INFO   ] [j1.adapter.analytics                    ] [ end processing ]
          {% else %}
            logger = log4javascript.getLogger('j1.adapter.chatgpt');
            logger.info('\n' + 'ChatGPT: disabled');
            clearInterval(dependencies_met_page_ready);
          {% endif %}
        }
      }, 10);

      return;
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
