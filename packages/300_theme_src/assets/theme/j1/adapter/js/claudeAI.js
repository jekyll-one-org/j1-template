---
regenerate:                             true
---

{%- capture cache -%}

{% comment %}
 # -----------------------------------------------------------------------------
 # /assets/theme/j1/adapter/js/claudeAI.js (4)
 # Liquid template to adapt the claudeAi module
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
 #  claudeAi_options:  {{ claudeAi_options | debug }}
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
{% assign claudeAI_defaults    = modules.defaults.claudeAI.defaults %}
{% assign claudeAI_settings    = modules.claudeAI.settings %}

{% comment %} Set config options (settings only)
-------------------------------------------------------------------------------- {% endcomment %}
{% assign claudeAI_options     = claudeAI_defaults | merge: claudeAI_settings %}

{% comment %} Variables
-------------------------------------------------------------------------------- {% endcomment %}
{% assign comments            = claudeAI_options.enabled %}

{% comment %}
--------------------------------------------------------------------------------
 # claude - J1 claudeAI modifications #1
 # Resolve the Claude apiKey from the build-time environment variable
 # CLAUDE_API_KEY (exposed via _plugins/j1_env_vars.rb as site.j1_env.*).
 # Keeping the key out of YAML avoids committing it to version control.
 # NOTE: The key is still baked into the generated JS and visible to site
 # visitors via DevTools. For true secrecy, proxy requests through a
 # backend/serverless function that holds the key server-side.
-------------------------------------------------------------------------------- {% endcomment %}
{% assign claudeApiKey = '' %}
{% if site.j1_env and site.j1_env.CLAUDE_API_KEY %}
  {% assign claudeApiKey = site.j1_env.CLAUDE_API_KEY %}
{% endif %}

{% comment %} Detect prod mode
-------------------------------------------------------------------------------- {% endcomment %}
{% assign production = false %}
{% if environment == 'prod' or environment == 'production' %}
  {% assign production = true %}
{% endif %}


/*
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/adapter/js/claudeAI.js (4)
 # J1 Adapter for the claudeAI module
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
j1.adapter.claudeAI = ((j1, window) => {

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

  let claudeAiDefaults;
  let claudeAiSettings;
  let claudeAiOptions;

  let claudeAiHandler;

  let _this;
  let logger;
  let logText;

  // J1 Adapter optimizations #1
  // bound the page-ready poller. Previously, if `#content` never reached
  // `display: block` or j1.getState() never reached 'finished' (e.g. a
  // bug elsewhere in the boot sequence, an aborted navigation, an extension
  // hiding #content), this 10ms interval ran for the lifetime of the tab.
  // Cap it and log a warning so the failure mode is visible in the
  // console instead of silently burning CPU.
  //
  let dependenciesTimeout;

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
        module_name: 'j1.adapter.claudeAI',
        generated:   '{{site.time}}'
      }, options);

      // -----------------------------------------------------------------------
      // global variable settings
      // -----------------------------------------------------------------------

      // create settings object from module options
      claudeAiDefaults = $.extend({}, {{claudeAI_defaults | replace: 'nil', 'null' | replace: '=>', ':' }});
      claudeAiSettings = $.extend({}, {{claudeAI_settings | replace: 'nil', 'null' | replace: '=>', ':' }});
      claudeAiOptions  = $.extend(true, {}, claudeAiDefaults, claudeAiSettings);

      claudeAiOptions.isDev = isDev;

      _this           = j1.adapter.claudeAI;
      logger          = log4javascript.getLogger('j1.adapter.claudeAI');

      // -----------------------------------------------------------------------
      // module initializer
      // -----------------------------------------------------------------------
      var dependencies_met_page_ready = setInterval (() => {
        var pageState       = $('#content').css("display");
        var pageVisible     = (pageState === 'block') ? true : false;
        var j1CoreFinished  = (j1.getState() === 'finished') ? true : false;

        if (j1CoreFinished && pageVisible) {
          startTimeModule = Date.now();

          // claude - J1 claudeAI modifications #1
          // Inject apiKey from the build-time environment variable
          // CLAUDE_API_KEY so the secret never has to live in a YAML
          // config file. The value is resolved by Liquid from site.env file.
          // See: _plugins/load_env_vars.rb
          //
          claudeAiOptions.apiKey = '{{ claudeApiKey }}';

          if (!claudeAiOptions.apiKey) {
            // No hard failure here; the handler decides how to react to
            // a missing key. A warning is emitted so the misconfiguration
            // is easy to spot in DevTools.
             logger.warn('\n' + 'env var "CLAUDE_API_KEY" was not set at build time; apiKey is empty');
          } else {
            logger.warn('\n' + 'env var "CLAUDE_API_KEY" was set at build time. NOTE: the apiKey is exposed to the public');
          }

          _this.setState('started');
          logger.debug('\n' + `state: ${_this.getState()}`);
          logger.info('\n' + 'module is being initialized');

          // claude - J1 claudeAI modifications #1
          // Log apiKey availability (never log the value itself).
          logger.info('\n' + `apiKey loaded from environment: ${Boolean(claudeAiOptions.apiKey)}`);

          // clear the textarea initially
          const chatInput = document.getElementById('chatInput');
          if (chatInput) {
            chatInput.value = '';
          }

          // claude - limit KB size: initialize storage monitor from YAML config
          // if (claudeAiOptions.storage) {
          //   try {
          //     claudeAi.StorageMonitor.init({
          //       key:     claudeAiOptions.storage.key      || 'ai-agent',
          //       maxSize: claudeAiOptions.storage.maxSize  || 2048
          //     });
          //     logger.info('\n' + `storage monitor initialized: key="${claudeAiOptions.storage.key}", maxSize=${claudeAiOptions.storage.maxSize} KB`);
          //   } catch (error) {
          //     logger.warn('\n' + `storage monitor init failed: ${error}`);
          //   }
          // }

          // initialize claudeAiHandler
          logger.info('\n' + `claudeAiHandler enabled: ${claudeAiOptions.enabled}`);
          if (claudeAiOptions.enabled) {
            try {
              claudeAiHandler = new claudeAi.claudeAiHandler(claudeAiOptions);
            } catch (error) {
              logger.error('\n' + `initializing claudeAiHandler failed: ${error}`);
            }
          }

          _this.setState('finished');
          logger.debug('\n' + `state: ${_this.getState()}`);
          logger.info('\n' + 'initializing module finished');

          endTimeModule = Date.now();
          logger.info('\n' + `module initializing time: ${(endTimeModule-startTimeModule)} ms`);

          clearInterval(dependencies_met_page_ready);
          // J1 Adapter optimizations #1
          // clear the safety timeout on the happy path
          //
          if (dependenciesTimeout) {
            clearTimeout(dependenciesTimeout);
            dependenciesTimeout = null;
          }
        } // END pageVisible
      }, 10); // END dependencies_met_page_ready

      // J1 Adapter optimizations #1
      // safety bound paired with the 10ms poller above
      //
      dependenciesTimeout = setTimeout(function () {
        if (dependencies_met_page_ready) {
          clearInterval(dependencies_met_page_ready);
          logger.warn('\n' + 'claudeAI init aborted: page-ready conditions not met within 5s');
        }
      }, 5000);
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