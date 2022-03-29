---
regenerate:                             true
---

{% capture cache %}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/nbinteract.js
 # Liquid template to adapt nbinteract-core JS API
 #
 # Product/Info:
 # https://jekyll.one
 # Copyright (C) 2022 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # For details, see https://jekyll.one
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
{% assign asset_path        = "/assets/themes/j1" %}

{% comment %} Process YML config data
================================================================================ {% endcomment %}

{% comment %} Set config files
-------------------------------------------------------------------------------- {% endcomment %}
{% assign template_config   = site.data.j1_config %}
{% assign blocks            = site.data.blocks %}
{% assign modules           = site.data.modules %}

{% comment %} Set config data
-------------------------------------------------------------------------------- {% endcomment %}
{% assign notebook_defaults = modules.defaults.notebooks.defaults %}
{% assign notebook_settings = modules.notebooks.settings %}

{% comment %} Set config options
-------------------------------------------------------------------------------- {% endcomment %}
{% assign notebook_options  = notebook_defaults | merge: notebook_settings %}

{% assign production = false %}
{% if environment == 'prod' or environment == 'production' %}
  {% assign production = true %}
{% endif %}

/*
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/nbinteract.js
 # J1 Adapter for nbinteract
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2022 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # For details, see https://jekyll.one
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
j1.adapter.nbinteract = (function (j1, window) {

  {% comment %} Set global variables
  ------------------------------------------------------------------------------ {% endcomment %}
  var environment     = '{{environment}}';
  var moduleOptions   = {};
  var moduleSettings  = {};
  var notebook;
  var _this;
  var interact;
  var logger;
  var logText;

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

      // -----------------------------------------------------------------------
      // Default module settings
      // -----------------------------------------------------------------------
      var settings = $.extend ({
        module_name: 'j1.adapter.nbinteract',
        generated:   '{{site.time}}'
      }, options);

      moduleOptions = $.extend({}, {{notebook_options | replace: 'nil', 'null' | replace: '=>', ':' }});
      var notebooks = moduleOptions.notebooks;

      // -----------------------------------------------------------------------
      // Global variable settings
      // -----------------------------------------------------------------------
      _this   = j1.adapter.nbinteract;
      logger  = log4javascript.getLogger('j1.adapter.nbinteract');

      // -----------------------------------------------------------------------
      // data loader
      // -----------------------------------------------------------------------
      notebooks.forEach (function (elm) {
        notebook = elm.notebook;
        var notebook_id = notebook.id;
        var $selector = $('#' + notebook_id);
        if ( $selector.length ) {
          _this.loadNotebookHTML ({
            xhr_container_id:   'odes_in_python',
            xhr_data_path:      '/assets/data/jupyter/notebooks',
            xhr_data:           'ODEs_In_Python.html'
          });
          _this.interactNotebook(notebook);
        }
        // if ( $selector.length ) {
        //   _this.interactNotebook(notebook);
        // }
      });

    }, // END init

    // -------------------------------------------------------------------------
    // generate_scrollers()
    // generate scrollers configured|enabled
    // -------------------------------------------------------------------------
    interactNotebook: function (options) {
      var notebook = options;

      logText = '\n' + 'notebook is being connected ...';
      logger.info(logText);

      var dependencies_met_j1_finished = setInterval(function() {
        if (j1.getState() == 'finished') {

          // initialize state flag
          _this.setState('started');
          logger.debug('\n' + 'state: ' + _this.getState());

          var log_text = '\n' + 'nbinteract is being initialized';
          logger.info(log_text);

          {% comment %} connect notebooks
          ---------------------------------------------------------------------- {% endcomment %}

          {% for item in notebook_options.notebooks %} {% if item.notebook.enabled %}

          {% assign notebook_id       = item.notebook.id %}
          {% assign notebook_spec     = item.notebook.spec %}
          {% assign notebook_baseUrl  = item.notebook.baseUrl %}
          {% assign notebook_provider = item.notebook.provider %}

          var $selector = $('#{{notebook_id}}');
          if ( $selector.length ) {
          var dependencies_met_nb_loaded = setInterval(function() {
            if ( j1.getXhrDOMState('#odes_in_python') == 'success' ) {
                // nbInteract initializer
                //
                var coreLogger = log4javascript.getLogger('nbinteract.core');
                interact = new NbInteract({
                  spec:     '{{notebook_spec}}',
                  baseUrl:  '{{notebook_baseUrl}}',
                  provider: '{{notebook_provider}}',
                  logger:   coreLogger,
                });

                interact.prepare();
                window.interact = interact;

                // MathJax initializer (MathJax currently NOT used)
                //
                // MathJax.Hub.Config({
                //     tex2jax: {
                //         inlineMath: [ ['$','$'], ["\\(","\\)"] ],
                //         displayMath: [ ['$$','$$'], ["\\[","\\]"] ],
                //         processEscapes: true,
                //         processEnvironments: true
                //     },
                //     // Center justify equations in code and markdown cells. Elsewhere
                //     // we use CSS to left justify single line equations in code cells.
                //     displayAlign: 'center',
                //     "HTML-CSS": {
                //         styles: {'.MathJax_Display': {"margin": 0}},
                //         linebreaks: { automatic: true }
                //     }
                // });

                _this.setState('finished');
                logger.debug('\n' + 'state: ' + _this.getState());
                logger.info('\n' + 'initializing module finished');
            } // END dependencies_met_nb_loaded
            clearInterval(dependencies_met_nb_loaded);
          }, 25);
          }
          // END notebook_id: {{ notebook_id }}
          {% endif %} {% endfor %}
            clearInterval(dependencies_met_j1_finished);
          } // END dependencies_met_j1_finished
      }, 25);
    },

    // -------------------------------------------------------------------------
    // loadNotebookHTML()
    // Load HTML data asychronously using XHR|jQuery on an element (e.g. <div>)
    // specified by xhr_container_id, xhr_data_path (options)
    // -------------------------------------------------------------------------
    loadNotebookHTML: function (options, mod, status) {
      var logger            = log4javascript.getLogger('j1.adapter.loadHTML');
      var selector          = $('#' + options.xhr_container_id);
      var state             = status;
      var observer_options  = {
        attributes:     false,
        childList:      true,
        characterData:  false,
        subtree:        true
      };
      var observer;
      var logText;

      var cb_load_closure = function(mod, id) {
        return function (responseTxt, statusTxt, xhr) {
          var logger = log4javascript.getLogger('j1.adapter.loadHTML');
          if ( statusTxt === 'success' ) {
            j1.setXhrDataState(id, statusTxt);
            j1.setXhrDomState(id, 'pending');

            $(id).find('button').replaceWith( function() {
              // $(this)[0].outerHTML = '???'
              return '<button class="btn btn-primary btn-raised js-nbinteract-widget"> Loading widgets ...</button>'
            });

            $(id).find('h1').replaceWith( function() {
              return '<h4 id="' + $(this)[0].id + '">' + $(this).text().slice(0,-1) + '</h4>';
            });

            logText = '\n' + 'data loaded successfully on id: ' + id;
            logger.info(logText);
            state = true;
          }
          if ( statusTxt === 'error' ) {
            // jadams, 2020-07-21: to be checked why id could be UNDEFINED
            if (typeof(id) != "undefined") {
              state = 'failed';
              logger.info('\n' + 'set state for ' +mod+ ' to: ' + state);
              // jadams, 2020-07-21: intermediate state should DISABLED
              // executeFunctionByName(mod + '.setState', window, state);
              j1.setXhrDataState(id, statusTxt);
              j1.setXhrDomState(id, 'pending');
              logText = '\n' + 'loading data failed on id: ' +id+ ', error ' + xhr.status + ': ' + xhr.statusText;
              logger.error(logText);
              state = false;
            }
          }
        };
      };

      // see: https://stackoverflow.com/questions/20420577/detect-added-element-to-dom-with-mutation-observer
      //
      var html_data_path  = options.xhr_data_path + '/' + options.xhr_data;
      var id              = '#' + options.xhr_container_id;
      var $selector       = $(id);

      // failsafe - prevent XHR load errors
      //
      if (options.xhr_data_element !== '') {
        logger.info('\n' + 'XHR data element found: ' + options.xhr_data_element);
      } else  {
        logger.debug('\n' + 'no XHR data element found, loading data aborted');
        return;
      }

      if ( $selector.length ) {
        $selector.load( html_data_path, cb_load_closure( mod, id ) );

        var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
        var xhrObserver = new MutationObserver (mutationHandler);
        var obsConfig = {
            childList: true,
            characterData: false,
            attributes: false,
            subtree: false };

        selector.each(function(){
            xhrObserver.observe(this, obsConfig);
        });

        function mutationHandler (mutationRecords) {
          mutationRecords.forEach ( function (mutation) {
            if (mutation.addedNodes.length) {
              logger.info('\n' + 'XHR data loaded in the DOM: ' + id);
              j1.setXhrDomState(id, 'success');
            }
          });
        }
      } else {
        // jadams, 2020-07-21: To be clarified why a id is "undefined"
        // failsafe - prevent XHR load errors
        if (id != '#undefined') {
          logText = '\n' + 'data not loaded on id:' + id;
          logger.debug(logText);
          j1.setXhrDataState(id, 'not loaded');
          j1.setXhrDomState(id, 'not loaded');
          // Set processing state to 'finished' to complete module load
          state = 'finished';
          logger.debug('\n' + 'state: ' + state);
          // jadams, 2020-07-21: intermediate state should DISABLED
          // executeFunctionByName(mod + '.setState', window, state);
          state = false;
        }
      }
      return state;
    },

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
