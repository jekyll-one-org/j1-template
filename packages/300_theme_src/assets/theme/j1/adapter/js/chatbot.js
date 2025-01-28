---
regenerate:                             true
---

{%- capture cache -%}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/adapter/js/chatbot.js
 # Liquid template to adapt the Chat module
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
 #  chat_options:  {{ chat_options | debug }}
 # -----------------------------------------------------------------------------
{% endcomment %}

{% comment %} Liquid procedures
-------------------------------------------------------------------------------- {% endcomment %}

{% comment %} Set global settings
-------------------------------------------------------------------------------- {% endcomment %}
{% assign environment     = site.environment %}
{% assign asset_path      = "/assets/theme/j1" %}

{% comment %} Process YML config data
================================================================================ {% endcomment %}

{% comment %} Set config files
-------------------------------------------------------------------------------- {% endcomment %}
{% assign template_config = site.data.j1_config %}
{% assign blocks          = site.data.blocks %}
{% assign modules         = site.data.modules %}

{% comment %} Set config data (settings only)
-------------------------------------------------------------------------------- {% endcomment %}
{% assign chat_defaults   = modules.defaults.chatbots.defaults %}
{% assign chat_settings   = modules.chatbots.settings %}

{% comment %} Set config options (settings only)
-------------------------------------------------------------------------------- {% endcomment %}
{% assign chat_options    = chat_defaults | merge: chat_settings %}

{% comment %} Variables
-------------------------------------------------------------------------------- {% endcomment %}
{% assign chat_enabled    = chat_options.enabled %}
{% assign chat_provider   = chat_options.provider %}

{% comment %} Detect prod mode
-------------------------------------------------------------------------------- {% endcomment %}
{% assign production = false %}
{% if environment == 'prod' or environment == 'production' %}
  {% assign production = true %}
{% endif %}

{% comment %} chat_options:  {{ chat_options | debug }} {% endcomment %}

/*
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/adapter/js/chat.js
 # J1 Adapter for the Chat module
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2023-2025 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # For details, see: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 # -----------------------------------------------------------------------------
 #  Adapter generated: {{site.time}}
 # -----------------------------------------------------------------------------
*/

// -----------------------------------------------------------------------------
// ESLint shimming
// -----------------------------------------------------------------------------
/* eslint indent: "off"                                                       */
// -----------------------------------------------------------------------------
"use strict";
j1.adapter.chatbot = ((j1, window) => {

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

var chatDefaults;
var chatSettings;
var chatOptions;
var chatbot;
var chatbotID;
var chatBotWidget;
var validChatbot;
var validChatbotID;
var user_consent;
var apiExists;

var _this;
var logger;
var logText;

// date|time
var startTime;
var endTime;
var startTimeModule;
var endTimeModule;
var timeSeconds;

  // ---------------------------------------------------------------------------
  // main
  // ---------------------------------------------------------------------------
  return {

    // -------------------------------------------------------------------------
    // init()
    // adapter initializer
    // -------------------------------------------------------------------------
    init: (options) => {

      // -----------------------------------------------------------------------
      // adapter initializer
      // -----------------------------------------------------------------------
      var dependencies_met_page_ready = setInterval (() => {
        var pageState      = $('#content').css("display");
        var pageVisible    = (pageState === 'block') ? true: false;
        var j1CoreFinished = (j1.getState() === 'finished') ? true : false;

        if (j1CoreFinished && pageVisible) {
          startTimeModule = Date.now();

          {% if chat_enabled %}

            // Load  module DEFAULTS|CONFIG
            //
            chatDefaults = $.extend({}, {{chat_defaults | replace: 'nil', 'null' | replace: '=>', ':' }});
            chatSettings = $.extend({}, {{chat_settings | replace: 'nil', 'null' | replace: '=>', ':' }});
            chatOptions  = $.extend(true, {}, chatDefaults, chatSettings);

            // -----------------------------------------------------------------
            // global variable settings
            // -----------------------------------------------------------------
            _this   = j1.adapter.chatbot;
            logger  = log4javascript.getLogger('j1.adapter.chatbot');

            chatbot        = chatOptions.provider;
            chatbotID      = chatOptions.chatbotID;
            validChatbot   = (chatbot.includes('your')) ? false : true;
            validChatbotID = (chatbotID.includes('your')) ? false : true;

            if (validChatbot) {
              logger.info('\n' + 'chatbot detected: ' + chatbot);
            } else {
              logger.info('\n' + 'invalid chatbot detected: ' + chatbot);
              logger.warn('\n' + 'module chat: disabled');
              clearInterval(dependencies_met_page_ready);
            }

            // -----------------------------------------------------------------
            // default module settings
            // -----------------------------------------------------------------
            var settings = $.extend({
              module_name: 'j1.adapter.chatbot',
              generated:   '{{site.time}}'
            }, options);

            // -----------------------------------------------------------------
            // module initializer
            // -----------------------------------------------------------------

            // [INFO   ] [j1.adapter.chatbot                 ] [ detected chat provider (j1_config): {{chat_provider}}} ]
            // [INFO   ] [j1.adapter.chatbot                 ] [ start processing load region head, layout: {{page.layout}} ]
            {% case chat_provider %}
            {% when "webwhiz" %}
            // [INFO   ] [j1.adapter.chatbot                 ] [ place provider: WebWhiz ]

            // initialize state flag
            _this.setState('started');
            logger.debug('\n' + 'state: ' + _this.getState());
            logger.info('\n' + 'module initializing: started');

            user_consent = j1.readCookie(cookie_names.user_consent);
            if (user_consent.personalization) {
              logger.info('\n' + 'user consent on personalization: ' + user_consent.personalization);
              if (validChatbotID) {
                logger.info('\n' + 'chatbotID detected: ' + chatbotID);
              } else {
                logger.warn('\n' + 'invalid chatbotID detected: ' + chatbotID);
                logger.warn('\n' + 'module chat: disabled');
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

            endTimeModule = Date.now();
            logger.info('\n' + 'module initializing time: ' + (endTimeModule-startTimeModule) + 'ms');

            clearInterval(dependencies_met_page_ready);

            {% comment %} Setup VivoChat
            -------------------------------------------------------------------- {% endcomment %}
            {% when "vivochat" %}
            // [INFO   ] [j1.adapter.chatbot                 ] [ place provider: VivoChat ]

            // initialize state flag
            _this.setState('started');
            logger.debug('\n' + 'state: ' + _this.getState());
            logger.info('\n' + 'module initializing: started');

            apiExists     = document.getElementById("{{chatbotID}}") === null ? false : true;
            user_consent  = j1.readCookie(cookie_names.user_consent);
            if (user_consent.personalization) {
              logger.info('\n' + 'user consent on personalization: ' + user_consent.personalization);

              if (validChatbotID) {
                logger.info('\n' + 'enable VivoChat on ID: ' + chatbotID);

                setTimeout(() => {
                  logger.info('\n' + 'set fab button position');
                  $('.fab-btn').css('bottom', '5rem');
                }, 1000);

                apiScript.id    = 'VivoChat';
                apiScript.async = true;
                apiScript.src   = 'https://www.vivochat.ai/dist/widget.js';
                apiScript.setAttribute("vivochat-bot-id", chatbotID);

                document.head.appendChild(apiScript);

                logger.info('\n' + 'VivoChat API added in section: head');
              } else {
                logger.warn('\n' + 'invalid chatbotID detected: ' + chatbotID);
                logger.warn('\n' + 'module chat: disabled');
              }
            } else {
              logger.info('\n' + 'user consent on personalization: ' + user_consent.personalization);
              logger.warn('\n' + 'disable VivoChat on ID: ' + chatbotID);
            }

            _this.setState('finished');
            logger.debug('\n' + 'state: ' + _this.getState());
            logger.info('\n' + 'module initializing: finished');

            endTimeModule = Date.now();
            logger.info('\n' + 'module initializing time: ' + (endTimeModule-startTimeModule) + 'ms');

            clearInterval(dependencies_met_page_ready);

            {% comment %} Setup TutGPT
            -------------------------------------------------------------------- {% endcomment %}
            {% when "tutgpt" %}
            // [INFO   ] [j1.adapter.chatbot                 ] [ place provider: TutGPT ]

            // initialize state flag
            _this.setState('started');
            logger.debug('\n' + 'state: ' + _this.getState());
            logger.info('\n' + 'module initializing: started');

            setTimeout(() => {
              logger.info('\n' + 'set fab button position');
              $('.fab-btn').css('bottom', '5rem');
            }, 1000);

            user_consent = j1.readCookie(cookie_names.user_consent);
            if (user_consent.personalization) {
              logger.info('\n' + 'user consent on personalization: ' + user_consent.personalization);
              if (validChatbotID) {
                logger.info('\n' + 'enable TutGPT on ID: ' + chatbotID);

                // create the chatBotWidget (Button container)
                //
                chatBotWidget = document.createElement("div");
                chatBotWidget.setAttribute("id", "chatbot-widget");
                document.body.appendChild(chatBotWidget);

                // create the chatbotAPI
                //
               apiScript.src   = "https://widget.tutgpt.com/chat.js";
               apiScript.async = true;
               apiScript.id    = "chatbot-api";

                apiScript.addEventListener("load", (evt) => {
                  BotChat.init({
                    id: chatbotID,
                  });
                })

                setTimeout(() => {
                  logger.info('\n' + 'Initialize TutGPT API');
                  // add the chatbotAPI to run the Bot (delayed)
                  //
                  document.head.appendChild(apiScript);
                  logger.info('\n' + 'TutGPT API added in section: head');
                }, 3000);

              } else {
                logger.warn('\n' + 'invalid chatbotID detected: ' + chatbotID);
                logger.warn('\n' + 'module chat: disabled');
              }
            } else {
              logger.info('\n' + 'user consent on personalization: ' + user_consent.personalization);
              logger.warn('\n' + 'disable TutGPT on ID: ' + chatbotID);
            }

            _this.setState('finished');
            logger.debug('\n' + 'state: ' + _this.getState());
            logger.info('\n' + 'module initializing: finished');

            endTimeModule = Date.now();
            logger.info('\n' + 'module initializing time: ' + (endTimeModule-startTimeModule) + 'ms');

            clearInterval(dependencies_met_page_ready);

            {% comment %} Setup ChatBob
            -------------------------------------------------------------------- {% endcomment %}
            {% when "chatbob" %}
            // [INFO   ] [j1.adapter.chatbot                 ] [ place provider: ChatBob ]

            // initialize state flag
            _this.setState('started');
            logger.debug('\n' + 'state: ' + _this.getState());
            logger.info('\n' + 'module initializing: started');

            setTimeout(() => {
              logger.info('\n' + 'set fab button position');
              $('.fab-btn').css('bottom', '5rem');
            }, 1000);

            apiExists     = document.getElementById("{{chatbotID}}") === null ? false : true;
            user_consent  = j1.readCookie(cookie_names.user_consent);

            if (user_consent.personalization) {
              logger.info('\n' + 'user consent on personalization: ' + user_consent.personalization);
              if (validChatbotID) {
                logger.info('\n' + 'enable ChatBob on ID: ' + chatbotID);

                apiScript.async = true;
                apiScript.id    = chatbotID;
                apiScript.src   = 'https://www.chatbob.co/embed.js';

                document.head.appendChild(apiScript);

                logger.info('\n' + 'ChatBob API added in section: head');
              } else {
                logger.warn('\n' + 'invalid chatbotID detected: ' + chatbotID);
                logger.warn('\n' + 'module chat: disabled');
              }
            } else {
              logger.info('\n' + 'user consent on personalization: ' + user_consent.personalization);
              logger.warn('\n' + 'disable ChatBob on ID: ' + chatbotID);
            }

            _this.setState('finished');
            logger.debug('\n' + 'state: ' + _this.getState());
            logger.info('\n' + 'module initializing: finished');

            endTimeModule = Date.now();
            logger.info('\n' + 'module initializing time: ' + (endTimeModule-startTimeModule) + 'ms');

            clearInterval(dependencies_met_page_ready);

            {% comment %} Setup WebWhiz
            -------------------------------------------------------------------- {% endcomment %}
            {% when "webwhiz" %}
            // [INFO   ] [j1.adapter.chat                    ] [ place provider: WebWhiz ]

            // initialize state flag
            _this.setState('started');
            logger.debug('\n' + 'state: ' + _this.getState());
            logger.info('\n' + 'module initializing: started');

            setTimeout(() => {
              logger.info('\n' + 'set fab button position');
              $('.fab-btn').css('bottom', '5rem');
            }, 1000);

            apiExists     = document.getElementById("{{chatbotID}}") === null ? false : true;
            user_consent  = j1.readCookie(cookie_names.user_consent);

            if (user_consent.personalization) {
              logger.info('\n' + 'user consent on personalization: ' + user_consent.personalization);
              if (validChatbotID) {
                logger.info('\n' + 'enable WebWhiz on ID: ' + chatbotID);

                apiScript.id    = '__webwhizSdk__';
                apiScript.src   = 'https://widget.webwhiz.ai/webwhiz-sdk.js';
                apiScript.setAttribute("data-chatbot-id", chatbotID);

                document.head.appendChild(apiScript);

                logger.info('\n' + 'WebWhiz API added in section: head');
              } else {
                logger.warn('\n' + 'invalid chatbotID detected: ' + chatbotID);
                logger.warn('\n' + 'module chat: disabled');
              }
            } else {
              logger.info('\n' + 'user consent on personalization: ' + user_consent.personalization);
              logger.warn('\n' + 'disable WebWhiz on ID: ' + chatbotID);
            }

            _this.setState('finished');
            logger.debug('\n' + 'state: ' + _this.getState());
            logger.info('\n' + 'module initializing: finished');

            endTimeModule = Date.now();
            logger.info('\n' + 'module initializing time: ' + (endTimeModule-startTimeModule) + 'ms');

            clearInterval(dependencies_met_page_ready);

            {% comment %} Setup Custom Bot
            -------------------------------------------------------------------- {% endcomment %}
            {% when "custom" %}
            // [INFO   ] [j1.adapter.analytics                    ] [ place provider: Custom Provider ]

            {% endcase %}
            // [INFO   ] [j1.adapter.analytics                    ] [ end processing ]
          {% else %}
            logger = log4javascript.getLogger('j1.adapter.chatbot');
            logger.info('\n' + 'chatbot: disabled');

            endTimeModule = Date.now();
            logger.info('\n' + 'module initializing time: ' + (endTimeModule-startTimeModule) + 'ms');

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
    messageHandler: (sender, message) => {
      var json_message = JSON.stringify(message, undefined, 2);

      logText = '\n' + 'received message from ' + sender + ': ' + json_message;
      logger.debug(logText);

      // -----------------------------------------------------------------------
      //  process commands|actions
      // -----------------------------------------------------------------------
      if (message.type === 'command' && message.action === 'module_initialized') {

        //
        // place handling of command|action here
        //

        logger.info('\n' + message.text);
      }

      //
      // place handling of other command|action here
      //

      return true;
    }, // END messageHandler

    // -------------------------------------------------------------------------
    // setState()
    // sets the current (processing) state of the module
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

  }; // END main (return)
})(j1, window);

{%- endcapture -%}

{%- if production -%}
  {{ cache|minifyJS }}
{%- else -%}
  {{ cache|strip_empty_lines }}
{%- endif -%}

{%- assign cache = false -%}
