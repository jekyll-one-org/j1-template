---
regenerate:                             true
---

{% capture cache %}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/iframer.js
 # Liquid template to adapt module iFrameResizer
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2023, 2024 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # For details, see: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE.md
 # -----------------------------------------------------------------------------
{% endcomment %}

{% comment %} Liquid procedures
-------------------------------------------------------------------------------- {% endcomment %}

{% comment %} Set global settings
-------------------------------------------------------------------------------- {% endcomment %}
{% assign environment         = site.environment %}
{% assign template_version    = site.version %}

{% comment %} Process YML config data
================================================================================ {% endcomment %}

{% comment %} Set config files
-------------------------------------------------------------------------------- {% endcomment %}
{% assign template_config     = site.data.j1_config %}
{% assign blocks              = site.data.blocks %}
{% assign modules             = site.data.modules %}

{% comment %} Set config data
-------------------------------------------------------------------------------- {% endcomment %}
{% assign iframer_defaults    = modules.defaults.iframer.defaults %}
{% assign iframer_settings    = modules.iframer.settings %}

{% comment %} Set config options
-------------------------------------------------------------------------------- {% endcomment %}
{% assign iframer_options     = iframer_defaults | merge: iframer_settings %}

{% comment %} Detect prod mode
-------------------------------------------------------------------------------- {% endcomment %}
{% assign production = false %}
{% if environment == 'prod' or environment == 'production' %}
  {% assign production = true %}
{% endif %}

/*
 # -----------------------------------------------------------------------------
 #  ~/assets/themes/j1/adapter/js/iframer.js
 #  J1 Adapter for J1 Module iFramer
 #
 #  Product/Info:
 #  https://jekyll.one
 #  http://davidjbradshaw.github.io/iframe-resizer/
 #
 #  Copyright (C) 2023, 2024 Juergen Adams
 #  Copyright (C) 2013-2023  David J. Bradshaw
 #
 #  J1 Template is licensed under the MIT License.
 #  For details, see: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE.md
 #  iFrameResizer is licensed under under the MIT License.
 #  For details, see http://davidjbradshaw.github.io/iframe-resizer/
 #
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
j1.adapter.iframer = (function (j1, window) {

  {% comment %} Set global variables
  ------------------------------------------------------------------------------ {% endcomment %}
  var environment   = '{{environment}}';
  var state         = 'not_started';
  var iframerDefaults;
  var iframerSettings;
  var iframerOptions;
  var _this;
  var logger;
  var logText;
  var url;
  var origin;

  // ---------------------------------------------------------------------------
  // Helper functions
  // ---------------------------------------------------------------------------

  // ---------------------------------------------------------------------------
  // Main object
  // ---------------------------------------------------------------------------
  return {

    // -------------------------------------------------------------------------
    // Initializer
    // -------------------------------------------------------------------------
    init: function (options) {

      url     = new URL(window.location.href);
      origin  = url.origin;

      // -----------------------------------------------------------------------
      // Default module settings
      // -----------------------------------------------------------------------
      var settings = $.extend({
        module_name: 'j1.adapter.iframer',
        generated:   '{{site.time}}'
      }, options);

      // -----------------------------------------------------------------------
      // Global variable settings
      // -----------------------------------------------------------------------
      _this   = j1.adapter.iframer;
      logger  = log4javascript.getLogger('j1.adapter.iframer');

      // Load  module DEFAULTS|CONFIG
      iframerDefaults = $.extend({}, {{iframer_defaults | replace: 'nil', 'null' | replace: '=>', ':' }});
      iframerSettings = $.extend({}, {{iframer_settings | replace: 'nil', 'null' | replace: '=>', ':' }});
      iframerOptions  = $.extend(true, {}, iframerDefaults, iframerSettings);

      // load HTML portion for all grids
      console.debug('loading HTML portion for all iFrames configured');
      _this.loadIframeHTML(iframerOptions, iframerOptions.iframes);

      // initialize state flag
      _this.setState('started');
      logger.debug('\n' + 'state: ' + _this.getState());
      logger.info('\n' + 'module is being initialized');

      // -----------------------------------------------------------------------
      // initializer
      // -----------------------------------------------------------------------
      var dependencies_met_page_ready = setInterval(() => {
        var pageState      = $('#content').css("display");
        var pageVisible    = (pageState == 'block') ? true : false;
        var j1CoreFinished = (j1.getState() == 'finished') ? true : false;

        if (j1CoreFinished && pageVisible) {
          // initialize state flag
          _this.setState('started');
          logger.debug('\n' + 'state: ' + _this.getState());
          logger.info('\n' + 'module is being initialized');

          _this.initialize(iframerOptions);

          clearInterval(dependencies_met_page_ready);
        } // END j1CoreFinished && pageVisible
      }, 10);

    }, // END init

    // -----------------------------------------------------------------------
    // Load AJAX data and initialize the jg gallery
    // -----------------------------------------------------------------------
    initialize: function (options) {
      var iframerOptions    = options;
      var xhrLoadState      = 'pending';                                        // (initial) load state for the HTML portion of the slider
      var load_dependencies = {};
      var dependency;

      // logger = log4javascript.getLogger('j1.adapter.gallery');

      _this.setState('running');
      logger.debug('\n' + 'state: ' + _this.getState());

      {% for iframe in iframer_options.iframes %}

        {% if iframe.enabled %}
        {% assign iframe_id = iframe.id %}
        logger.info('\n' + 'found iframe on id: ' + '{{iframe_id}}');

          // create dynamic loader variable to setup the grid on id {{iframe_id}}
          dependency = 'dependencies_met_html_loaded_{{iframe_id}}';
          load_dependencies[dependency] = '';

          // initialize the iframe if HTML portion successfully loaded
          //
          load_dependencies['dependencies_met_html_loaded_{{iframe_id}}'] = setInterval(() => {
            // check if HTML portion of the iframe is loaded successfully
            xhrLoadState = j1.xhrDOMState['#{{iframe_id}}_parent'];
            if (xhrLoadState === 'success') {
              var $iframe_{{iframe_id}} = $('#{{iframe_id}}');                  // used for later access

              logger.info('\n' + 'dyn_loader, initialize iframe on id: ' + '{{iframe_id}}');

              // Inject contentWindow script into the docoment to be loaded
              // into an iframe element
              if ('{{iframe.inject_contentWindowScript}}' == 'true') {
                setTimeout(() => {
                  var iframe;
                  var iframeSelector;
                  var iframeDocument;
                  var contentWindowScript;

                  // create DOM selector
                  //
                  iframeSelector            = '{{iframe_id}}'
                  iframe                    = document.getElementById(iframeSelector);
                  iframeDocument            = iframe.contentDocument || iframe.contentWindow.document;

                  // create contentWindow script
                  //
                  contentWindowScript       = iframeDocument.createElement('script');
                  contentWindowScript.id    = 'contentWindowScript';
                  contentWindowScript.async = true;
                  contentWindowScript.src   = origin + '/assets/themes/j1/modules/iframeResizer/js/client/iframeResizer.contentWindow.min.js';

                  iframeDocument.head.appendChild(contentWindowScript);
                }, iframerOptions.delay_inject_contentWindowScript);
            } // END if iframerOptions.inject_contentWindowScript

            setTimeout(() => {
              /* eslint-disable */
              var $iframe_{{iframe_id}} = iFrameResize({
                {% for option in iframe.options %}
                  {{option[0]}}: {{option[1]}},
                {% endfor %}
                },
                '#{{iframe_id}}'
              )
              /* eslint-enable */
            }, {{iframer_options.delay_iframer}});

            clearInterval(load_dependencies['dependencies_met_html_loaded_{{iframe_id}}']);
          } // END  if xhrLoadState === 'success'

          }, 10); // END dependencies_met_html_loaded

        {% endif %} // ENDIF iframe enabled
      {% endfor %}

      _this.setState('finished');
      logger.debug('\n' + 'state: ' + _this.getState());
      logger.info('\n' + 'module initialized successfully');

    }, // END function initialize

    // -------------------------------------------------------------------------
    // loadIframeHTML()
    // loads the HTML portion via AJAX for all iFrames configured.
    // NOTE: Make sure the placeholder DIV is available in the content
    // page as generated using the Asciidoc extension iframe::
    // -------------------------------------------------------------------------
    loadIframeHTML: function (options, iframe) {
      var numIFrames  = Object.keys(iframe).length;
      var activeIFrames  = numIFrames;
      var xhr_data_path = options.xhr_data_path + '/index.html';
      var xhr_container_id;

      console.debug('number of iframes found: ' + activeIFrames);

      _this.setState('load_data');
      Object.keys(iframe).forEach(function(key) {
        if (iframe[key].enabled) {
          xhr_container_id = iframe[key].id + '_parent';

          console.debug('load HTML portion on iframe id: ' + iframe[key].id);
          j1.loadHTML({
            xhr_container_id: xhr_container_id,
            xhr_data_path:    xhr_data_path,
            xhr_data_element: iframe[key].id
          });
        } else {
          console.debug('iframe found disabled on id: ' + iframe[key].id);
          activeIFrames--;
        }
      });
      console.debug('iframes loaded in page enabled|all: ' + activeIFrames + '|' + numIFrames);
      _this.setState('data_loaded');
    }, // END loadIframeHTML

    // -------------------------------------------------------------------------
    // messageHandler: MessageHandler for J1 CookieConsent module
    // Manage messages send from other J1 modules
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
    // getState
    // Returns the current (processing) state of the module
    // -------------------------------------------------------------------------
    getState: function () {
      return j1.adapter.navigator.state;
    }, // END getState

    // -------------------------------------------------------------------------
    // setXhrState
    // Set the final (loading) state of an element (partial) loaded via Xhr
    // -------------------------------------------------------------------------
    setXhrState: function (obj, stat) {
      j1.adapter.navigator.xhrData[obj] = stat;
    }, // END setXhrState

    // -------------------------------------------------------------------------
    // getState
    // Returns the final (loading) state of an element (partial) loaded via Xhr
    // -------------------------------------------------------------------------
    getXhrState: function (obj) {
      return j1.adapter.navigator.xhrData[obj];
    } // END getXhrState

  }; // END return
})(j1, window);

{% endcapture %}
{% if production %}
  {{ cache | minifyJS }}
{% else %}
  {{ cache | strip_empty_lines }}
{% endif %}
{% assign cache = nil %}
