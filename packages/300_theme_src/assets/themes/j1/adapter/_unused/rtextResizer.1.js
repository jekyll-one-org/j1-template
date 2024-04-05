---
regenerate:                             true
---

{% capture cache %}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/rtextResizer.js
 # Liquid template to adapt rtextResizer functions (currently NOT used)
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2023, 2024 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # For details, see: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 # -----------------------------------------------------------------------------
 # Test data:
 #  {{ liquid_var | debug }}
 # -----------------------------------------------------------------------------
{% endcomment %}

{% comment %} Set global settings
-------------------------------------------------------------------------------- {% endcomment %}
{% assign environment                 = site.environment %}
{% assign template_name               = site.template.name %}

{% comment %} Liquid procedures
-------------------------------------------------------------------------------- {% endcomment %}

{% comment %} Process YML config data
================================================================================ {% endcomment %}

{% comment %} Set config files
-------------------------------------------------------------------------------- {% endcomment %}
{% assign data                        = site.data %}
{% assign apps                        = data.apps %}
{% assign blocks                      = data.blocks %}
{% assign builder                     = data.builder %}
{% assign layouts                     = data.layouts %}
{% assign modules                     = data.modules %}
{% assign pages                       = data.pages %}
{% assign tables                      = data.tables %}

{% comment %} Set config data
-------------------------------------------------------------------------------- {% endcomment %}

{% comment %} Set config options
-------------------------------------------------------------------------------- {% endcomment %}

{% comment %} Liquid var initialization
-------------------------------------------------------------------------------- {% endcomment %}

{% comment %} Detect prod mode
-------------------------------------------------------------------------------- {% endcomment %}
{% assign production = false %}
{% if environment == 'prod' or environment == 'production' %}
  {% assign production = true %}
{% endif %}

/*
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/rtextResizer.js
 # Liquid template to adapt rtextResizer functions
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2023, 2024 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # For details, see: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 # -----------------------------------------------------------------------------
 # Adapter generated: {{site.time}}
 # -----------------------------------------------------------------------------
*/

// -----------------------------------------------------------------------------
// ESLint shimming
// -----------------------------------------------------------------------------
/* eslint indent: "off"                                                       */
// -----------------------------------------------------------------------------
'use strict';
j1.adapter.rtextResizer = ((j1, window) => {

  {% comment %} Set global variables
  ------------------------------------------------------------------------------ {% endcomment %}
  var environment = '{{environment}}';
  var state       = 'not_started';

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
    // adapter initializer
    // -------------------------------------------------------------------------
    init: (options) => {

      // -----------------------------------------------------------------------
      // default module settings
      // -----------------------------------------------------------------------
      var settings = $.extend({
        module_name: 'j1.adapter.rtextResizer',
        generated:   '{{site.time}}'
      }, options);

      // -----------------------------------------------------------------------
      // global variable settings
      // -----------------------------------------------------------------------
      _this   = j1.adapter.rtextResizer;
      logger  = log4javascript.getLogger('j1.adapter.rtextResizer');

      // -----------------------------------------------------------------------
      // data loader (resizer UI)
      // -----------------------------------------------------------------------
      j1.loadHTML ({
        xhr_container_id:   'rtext_resizer_container',
        xhr_data_path:      '/assets/data/rtext_resizer/index.html',
        xhr_data_element:   'rtext_resizer_modal' },
        'j1.adapter.rtextResizer',
        'null'
      );

      // -----------------------------------------------------------------------
      // module initializer
      // -----------------------------------------------------------------------
      var dependencies_met_data_loaded = setInterval(() => {
        var pageState            = $('#content').css("display");
        var pageVisible          = (pageState === 'block') ? true : false;
        var j1CoreFinished       = (j1.getState() === 'finished') ? true : false;
        var rtextContainerLoaded = (j1.xhrDOMState['#rtext_resizer_container'] == 'success') ? true : false;

        if (rtextContainerLoaded) {
          startTimeModule = Date.now();

          _this.setState('started');
          logger.debug('\n' + 'state: ' + _this.getState());
          logger.info('\n' + 'module is being initialized');

          logger.info('\n' + 'initialize resizer ui');
          var $modalContainer = $('#rtext_resizer_modal');
          if ($modalContainer.length) {
            var environment     = '{{environment}}';
            var logger          = log4javascript.getLogger('j1.template.rtext-resizer');
            var $el             = $("main[class*='r-text']");
            var base_classes    = $("main[class*='r-text']").attr('class').replace(/r-text-[0-9]*/g, '');
            var r_text_default  = ' r-text-300';
            var r_text_larger   = ' r-text-400';
            var r_text_largest  = ' r-text-500';
            var cl;
            var value;

            $('input:checkbox[name="textsize-300"]').on('click', function (e) {
              e.stopPropagation();

              $('input:checkbox[name="textsize-400"]').prop('checked', false);
              $('input:checkbox[name="textsize-500"]').prop('checked', false);

              value = $(this).is(':checked');
              if (value == true) {
                cl = r_text_default;
              }
              $el.attr('class', base_classes + cl);

              if(environment === 'development') {
                logText = 'Changed textsize to: ' +cl;
                logger.info(logText);
              }
            }); // END textsize-300 on click

            $('input:checkbox[name="textsize-400"]').on('click', function (e) {
              e.stopPropagation();

              $('input:checkbox[name="textsize-300"]').prop('checked', false);
              $('input:checkbox[name="textsize-500"]').prop('checked', false);

              value = $(this).is(':checked');
              if (value == true) {
                cl = r_text_larger;
              }
              $el.attr('class', base_classes + cl);

              if(environment === 'development') {
                logText = 'Changed textsize to: ' +cl;
                logger.info(logText);
              }
            }); // END textsize-400 on click

            $('input:checkbox[name="textsize-500"]').on('click', function (e) {
              e.stopPropagation();

              $('input:checkbox[name="textsize-300"]').prop('checked', false);
              $('input:checkbox[name="textsize-400"]').prop('checked', false);

              value = $(this).is(':checked');
              if (value == true) {
                cl = r_text_largest;
              }
              $el.attr('class', base_classes + cl);

              if(environment === 'development') {
                logText = 'Changed textsize to: ' +cl;
                logger.info(logText);
              }
            }); // END textsize-500 on click
          } // END if $modalContainer

          _this.setState('finished');
          logger.debug('\n' + 'state: ' + _this.getState());
          logger.info('\n' + 'initializing module finished');

          endTimeModule = Date.now();
          logger.info('\n' + 'module initializing time: ' + (endTimeModule-startTimeModule) + 'ms');

          clearInterval(dependencies_met_data_loaded);
        } // END if rtextContainerLoaded
      }, 10); // END dependencies_met_data_loaded
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

{% endcapture %}
{% if production %}
  {{ cache | minifyJS }}
{% else %}
  {{ cache | strip_empty_lines }}
{% endif %}
{% assign cache = nil %}
