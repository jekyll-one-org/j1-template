---
regenerate:                             true
---

{%- capture cache -%}

{% comment %}
 # -----------------------------------------------------------------------------
 # /assets/theme/j1/adapter/js/aiAgent.js (1)
 # Liquid template to adapt the aiAgent module
 #
 # Product/Info:
 # https://jekyll.one
 # Copyright (C) 2026 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # For details, see: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 # -----------------------------------------------------------------------------
 # Test data:
 #  {{ liquid_var | debug }}
 #  aiAgent_options:  {{ aiAgent_options | debug }}
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
{% assign aiAgent_defaults    = modules.defaults.aiAgent.defaults %}
{% assign aiAgent_settings    = modules.aiAgent.settings %}

{% comment %} Set config options (settings only)
-------------------------------------------------------------------------------- {% endcomment %}
{% assign aiAgent_options     = aiAgent_defaults | merge: aiAgent_settings %}

{% comment %} Variables
-------------------------------------------------------------------------------- {% endcomment %}
{% assign comments            = aiAgent_options.enabled %}

{% comment %} Detect prod mode
-------------------------------------------------------------------------------- {% endcomment %}
{% assign production = false %}
{% if environment == 'prod' or environment == 'production' %}
  {% assign production = true %}
{% endif %}

/*
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/adapter/js/aiAgent.js (1)
 # J1 Adapter for the aiAgent module
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2026 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # For details, see: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 # -----------------------------------------------------------------------------
 # NOTE: Wave styles defind in /assets/data/panel.html, key 'wave'
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
j1.adapter.aiAgent = ((j1, window) => {

  // ---------------------------------------------------------------------------
  // Constants
  // ---------------------------------------------------------------------------

  const env   = '{{site.environment }}';
  const isDev = (env === "development" || env === "dev")
    ? true
    : false;

  // ---------------------------------------------------------------------------
  // Module variables
  // ---------------------------------------------------------------------------

  let state   = 'not_started';

  let aiAgentDefaults;
  let aiAgentSettings;
  let aiAgentOptions;

  let aiAgentHandler;

  let _this;
  let logger;
  let logText;

  // date|time
  let startTime;
  let endTime;
  let startTimeModule;
  let endTimeModule;
  let timeSeconds;

  // ---------------------------------------------------------------------------
  // main
  // ---------------------------------------------------------------------------
  return {

    // -------------------------------------------------------------------------
    // adapter initializer
    // -------------------------------------------------------------------------
    init: (options) => {

      // -----------------------------------------------------------------------
      // default module settings
      // -----------------------------------------------------------------------
      var settings = $.extend({
        module_name: 'j1.adapter.aiAgent',
        generated:   '{{site.time}}'
      }, options);

      // -----------------------------------------------------------------------
      // global variable settings
      // -----------------------------------------------------------------------

      // create settings object from module options
      aiAgentDefaults = $.extend({}, {{aiAgent_defaults | replace: 'nil', 'null' | replace: '=>', ':' }});
      aiAgentSettings = $.extend({}, {{aiAgent_settings | replace: 'nil', 'null' | replace: '=>', ':' }});
      aiAgentOptions  = $.extend(true, {}, aiAgentDefaults, aiAgentSettings);

      aiAgentOptions.isDev = isDev;

      _this           = j1.adapter.aiAgent;
      logger          = log4javascript.getLogger('j1.adapter.aiAgent');

      // -----------------------------------------------------------------------
      // module initializer
      // -----------------------------------------------------------------------
      var dependencies_met_page_ready = setInterval (() => {
        var pageState       = $('#content').css("display");
        var pageVisible     = (pageState === 'block') ? true : false;
        var j1CoreFinished  = (j1.getState() === 'finished') ? true : false;

        if (j1CoreFinished && pageVisible) {
          startTimeModule = Date.now();

          _this.setState('started');
          logger.debug('\n' + `state: ${_this.getState()}`);
          logger.info('\n' + 'module is being initialized');

          // clear the textarea initially
          const chatInput = document.getElementById('chatInput');
          if (chatInput) {
            chatInput.value = '';
          }

          // claude - limit KB size: initialize storage monitor from YAML config
          // if (aiAgentOptions.storage) {
          //   try {
          //     aiAgent.StorageMonitor.init({
          //       key:     aiAgentOptions.storage.key      || 'ai-agent',
          //       maxSize: aiAgentOptions.storage.maxSize  || 2048
          //     });
          //     logger.info('\n' + `storage monitor initialized: key="${aiAgentOptions.storage.key}", maxSize=${aiAgentOptions.storage.maxSize} KB`);
          //   } catch (error) {
          //     logger.warn('\n' + `storage monitor init failed: ${error}`);
          //   }
          // }

          // initialize aiAgentHandler
          logger.info('\n'+ `aiAgentHandler enabled: ${aiAgentOptions.enabled}`);
          if (aiAgentOptions.enabled) {
            try {
              aiAgentHandler = new aiAgent.aiAgentHandler(aiAgentOptions);
            } catch (error) {
              logger.error('\n'+ `initializing aiAgentHandler failed: ${error}`);
            }
          }

          _this.setState('finished');
          logger.debug('\n' + `state: ${_this.getState()}`);
          logger.info('\n' + 'initializing module finished');

          endTimeModule = Date.now();
          logger.info('\n' + `module initializing time: ${(endTimeModule-startTimeModule)} ms`);

          clearInterval(dependencies_met_page_ready);
        } // END pageVisible
      }, 10); // END dependencies_met_page_ready
    }, // END init

    // -------------------------------------------------------------------------
    // messageHandler()
    // manage messages send from other J1 modules
    // -------------------------------------------------------------------------
    messageHandler: (sender, message) => {
      var json_message = JSON.stringify(message, undefined, 2);

      logText = 'received message from ' + sender + ': ' + json_message;
      logger.debug(logText);

      // -----------------------------------------------------------------------
      //  process commands|actions
      // -----------------------------------------------------------------------
      if (message.type === 'command' && message.action === 'module_initialized') {

        //
        // place handling of command|action here
        //

        logger.info(message.text);
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
