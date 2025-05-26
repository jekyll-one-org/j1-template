---
regenerate:                             true
---

{%- capture cache -%}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/adapter/js/rouge.js
 # Liquid template to adapt J1 Highlighter (Rouge)
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
 # -----------------------------------------------------------------------------
{% endcomment %}

{% comment %} Liquid procedures
-------------------------------------------------------------------------------- {% endcomment %}

{% comment %} Set global settings
-------------------------------------------------------------------------------- {% endcomment %}
{% assign environment       = site.environment %}
{% assign template_version  = site.version %}
{% assign asset_path        = "/assets/theme/j1" %}

{% comment %} Process YML config data
================================================================================ {% endcomment %}

{% comment %} Set config files
-------------------------------------------------------------------------------- {% endcomment %}
{% assign template_config   = site.data.j1_config %}

{% comment %} Detect prod mode
-------------------------------------------------------------------------------- {% endcomment %}
{% assign production = false %}
{% if environment == 'prod' or environment == 'production' %}
  {% assign production = true %}
{% endif %}

/*
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/adapter/js/rouge.js
 # J1 Adapter for rouge
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2023-2025 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # For details, see: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 # -----------------------------------------------------------------------------
 # Note:
 #  https://github.com/jirutka/asciidoctor-rouge/issues/9
 # -----------------------------------------------------------------------------
 #  Adapter generated: {{site.time}}
 # -----------------------------------------------------------------------------
*/

// -----------------------------------------------------------------------------
// ESLint shimming
// -----------------------------------------------------------------------------
/* eslint indent: "off"                                                       */
/* eslint quotes: "off"                                                       */
// -----------------------------------------------------------------------------
"use strict";
j1.adapter.rouge = ((j1, window) => {

  {% comment %} Set global variables
  ------------------------------------------------------------------------------ {% endcomment %}
  var environment             = '{{environment}}';
  var moduleOptions           = {};
  var user_state              = {};
  var cookie_names            = j1.getCookieNames();
  var cookie_user_state_name  = cookie_names.user_state;
  var state                   = 'not_started';

  var user_state_detected;
  var themeCss;
  var darkTheme;

  var _this;
  var logger;
  var logText;

  // date|time
  var startTime;
  var endTime;
  var startTimeModule;
  var endTimeModule;
  var timeSeconds;

  var templateOptions = $.extend({}, {{template_config | replace: 'nil', 'null' | replace: '=>', ':' }});

  // ---------------------------------------------------------------------------
  // helper functions
  // ---------------------------------------------------------------------------

  // ---------------------------------------------------------------------------
  // main
  // ---------------------------------------------------------------------------
  return {

    // -------------------------------------------------------------------------
    // helper functions
    // -------------------------------------------------------------------------

    // -------------------------------------------------------------------------
    // adapter initializer
    // -------------------------------------------------------------------------
    init: (options) => {

      // -----------------------------------------------------------------------
      // default module settings
      // -----------------------------------------------------------------------
      var settings = $.extend({
        module_name: 'j1.adapter.rouge',
        generated:   '{{site.time}}'
      }, options);

      // -----------------------------------------------------------------------
      // global variable settings
      // -----------------------------------------------------------------------
      _this   = j1.adapter.rouge;
      logger  = log4javascript.getLogger('j1.adapter.rouge');

      // -----------------------------------------------------------------------
      // module initializer
      // -----------------------------------------------------------------------
      var dependency_met_page_ready = setInterval(() => {
        var pageState      = $('#content').css("display");
        var pageVisible    = (pageState === 'block') ? true : false;
        var j1CoreFinished = (j1.getState() === 'finished') ? true : false;

        if (j1CoreFinished && pageVisible) {
          startTimeModule = Date.now();

          _this.setState('started');
          logger.debug('set module state to: ' + _this.getState());
          logger.info('initializing module: started');

          // Detect|Set J1 UserState
          user_state_detected = j1.existsCookie(cookie_user_state_name);
          if (user_state_detected) {
            user_state  = j1.readCookie(cookie_user_state_name);
            themeCss    = user_state.theme_css;
            darkTheme   = themeCss.includes('dark') ||
                          themeCss.includes('cyborg') ||
                          themeCss.includes('darkly') ||
                          themeCss.includes('slate') ||
                          themeCss.includes('superhero');
          } else {
            log_text = 'user_state cookie not found';
            logger.warn(log_text);
          }

          $('.dropdown-menu a').click(() => {
            $('#selected-theme').html('Current selection: <div class="md-gray-900 mt-1 p-2" style="background-color: #BDBDBD; font-weight: 700;">' +$(this).text() + '</div>');
          });

          // disable (Google) translation for all highlight HTML elements
          // used for rouge
          // see: https://www.codingexercises.com/replace-all-instances-of-css-class-in-vanilla-js
          //
          var highlight = document.getElementsByClassName('highlight');
          [...highlight].forEach((x) => {
           if (!x.className.includes('notranslate')) {
             x.className += " notranslate"
           }
          });

          _this.setState('finished');
          logger.debug('state: ' + _this.getState());
          logger.info('initializing module: finished');

          endTimeModule = Date.now();
          logger.info('module initializing time: ' + (endTimeModule-startTimeModule) + 'ms');

          clearInterval(dependency_met_page_ready);
        } // END if pageVisible
      }, 10); // END dependency_met_page_ready

      var dependencies_met_rouge_finished = setInterval(() => {
        var moduleFinished = (j1.adapter.rouge.getState() === 'finished') ? true : false;

        if (moduleFinished) {
          if (darkTheme) {
            j1.adapter.rouge.reaplyStyles(templateOptions.rouge.theme_dark);
          } else {
            j1.adapter.rouge.reaplyStyles(templateOptions.rouge.theme_light);
          }

          clearInterval(dependencies_met_rouge_finished);
        } //  END if darkTheme
      }, 10); // END dependencies_met_rouge_finished
    }, // END init

    // -------------------------------------------------------------------------
    // reaplyStyles()
    // load|apply new rouge theme
    // -------------------------------------------------------------------------
    reaplyStyles: (themename) => {
      _this.removeAllRougeStyles();
      _this.addStyle(themename);
      return true;
    },

    // -------------------------------------------------------------------------
    // removeAllRougeStyles()
    // remove existing rouge theme CSS (from section <head>)
    // -------------------------------------------------------------------------
    removeAllRougeStyles: () => {
      $('link[rel=stylesheet][href*="/assets/theme/j1/modules/rouge"]').remove();
    },

    // -------------------------------------------------------------------------
    // addStyle()
    // add rouge theme CSS (to section <head>)
    // -------------------------------------------------------------------------
    addStyle: (themename) => {
      $('<link>').attr('rel','stylesheet')
      .attr('type','text/css')
      .attr('href','/assets/theme/j1/modules/rouge/css/' +themename+ '/theme.min.css')
      .appendTo('head');
    },

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
