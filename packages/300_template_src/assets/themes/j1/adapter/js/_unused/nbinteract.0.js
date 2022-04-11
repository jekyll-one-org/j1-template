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
  var message         = {};
  var spinnerOpts     = {
    lines: 13,                                                                  // The number of lines to draw
    length: 38,                                                                 // The length of each line
    width: 17,                                                                  // The line thickness
    radius: 45,                                                                 // The radius of the inner circle
    scale: 2,                                                                   // Scales overall size of the spinner
    corners: 1,                                                                 // Corner roundness (0..1)
    speed: 0.5,                                                                 // Rounds per second
    rotate: 0,                                                                  // The rotation offset
    animation: 'spinner-line-fade-more',                                        // The CSS animation name for the lines: spinner-line-fade-quick | spinner-line-shrink | spinner-line-fade-more
    direction: 1,                                                               // 1: clockwise, -1: counterclockwise
    color: '#424242',                                                           // CSS color or array of colors: orange (EF6C00) | blue (1565C0) | gray (424242)
    fadeColor: 'transparent',                                                   // CSS color or array of colors
    top: '80%',                                                                 // Top position relative to parent
    left: '50%',                                                                // Left position relative to parent
    shadow: '0 0 1px transparent',                                              // Box-shadow for the lines
    zIndex: 2000000000,                                                         // The z-index (defaults to 2e9)
    className: 'spinner',                                                       // The CSS class to assign to the spinner
    position: 'fixed',                                                          // Element positioning:  absolute | fixed
  };
  var nbiModalCloseDelay = 1500;                                                // delay modal auto close for 1500 milliseconds
  var notebooks;
  var notebook;
  var target;
  var spinner;
  var nbiModal;
  var _this;
  var interact;
  var logger;
  var coreLogger;
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
      notebooks     = moduleOptions.notebooks;

      // -----------------------------------------------------------------------
      // Global variable settings
      // -----------------------------------------------------------------------
      _this   = j1.adapter.nbinteract;
      logger  = log4javascript.getLogger('j1.adapter.nbinteract');

      // -----------------------------------------------------------------------
      // load HTML data for all modals used by nbInteract
      // -----------------------------------------------------------------------
      _this.loadNbiModals();

      // -----------------------------------------------------------------------
      // load HTML data for the notebooks and run nbInteract to enable
      // interactive inputs
      // -----------------------------------------------------------------------
      notebooks.forEach (function (elm) {
        if (elm.notebook.enabled) {
          notebook = elm.notebook;
          var notebook_id = notebook.id;
          var $selector = $('#' + notebook_id);

          // load the HTML portion for the notebook
          //
          if ( $selector.length ) {
            _this.loadNotebookHTML ({
              xhr_container_id:   notebook.id,
              xhr_data_path:      notebook.xhr_data_path,
              xhr_data:           notebook.xhr_data,
              setHeadings:        moduleOptions.heading,
              buttonStyles:       moduleOptions.button_styles,
            });
          }
        }
      });
      // conntect to BinderHub
      //
      .interactNotebook(notebook);

    }, // END init

    // -------------------------------------------------------------------------
    // interactNotebook()
    // connect to the configured BinderHub instance to create a
    // Jupyter kernel if required
    // -------------------------------------------------------------------------
    interactNotebook: function (options) {
      var notebook = options;

      // initialize state flag
      _this.setState('started');
      logger.debug('\n' + 'state: ' + _this.getState());

      var log_text = '\n' + 'nbinteract is being initialized';
      logger.info(log_text);

      {% comment %} connect notebooks
      -------------------------------------------------------------------------- {% endcomment %}
      {% for item in notebook_options.notebooks %} {% if item.notebook.enabled %}

      {% assign notebook_id       = item.notebook.id %}
      {% assign notebook_spec     = item.notebook.spec %}
      {% assign notebook_baseUrl  = item.notebook.baseUrl %}
      {% assign notebook_provider = item.notebook.provider %}

      if ( $('#{{notebook_id}}').length ) {
        var dependencies_met_nb_loaded = setInterval(function() {
          if ( $('#{{notebook_id}}').attr('data-nb-notebook') == 'loaded' ) {
            logText = '\n' + 'notebook is being connected ...';
            logger.info(logText);

            // create nbInteract (core) instance
            //
            coreLogger = log4javascript.getLogger('nbinteract.core');
            interact = new NbInteract({
              spec:     '{{notebook_spec}}',
              baseUrl:  '{{notebook_baseUrl}}',
              provider: '{{notebook_provider}}',
              logger:   coreLogger,
              j1API:    j1,
            });
            // initialize nbInteract (core) instance
            //
            interact.prepare();

            _this.setState('finished');
            logger.debug('\n' + 'state: ' + _this.getState());
            logger.info('\n' + 'initializing module finished');

            clearInterval(dependencies_met_nb_loaded);
          } // END dependencies_met_nb_loaded
        }, 25);
        return;
      }
      // END notebook_id: {{ notebook_id }}
      {% endif %} {% endfor %}
    },

    // -------------------------------------------------------------------------
    // loadNotebookHTML()
    // Load HTML data asychronously using XHR|jQuery on an element
    // (e.g. <div>) specified by xhr_container_id, xhr_data_path
    // -------------------------------------------------------------------------
    loadNotebookHTML: function (options, mod, status) {
      var html_data_path    = options.xhr_data_path + '/' + options.xhr_data;
      var id                = options.xhr_container_id;
      var $selector         = $('#' + id);
      var state             = status;
      var logText;

      var cb_load_closure = function(mod, id) {
        return function (responseTxt, statusTxt, xhr) {
          var logger = log4javascript.getLogger('j1.adapter.loadHTML');
          if ( statusTxt === 'success' ) {
            j1.setXhrDataState(id, statusTxt);
            j1.setXhrDomState(id, 'pending');

            // set data attribute to indicate HTML data loaded
            //
            $selector.attr('data-nb-notebook', 'loaded');

            // run HTML cleanups
            //
            $selector.find('button').replaceWith( function() {
              // $(this)[0].outerHTML = '???'
              // return '<button class="' + options.buttonStyles + ' js-nbinteract-widget hidden"> Loading widgets ...</button>'
              return '<button class="' + options.buttonStyles + ' js-nbinteract-widget"> Loading widgets ...</button>'
            });

            // disable translation (Google) for ALL input
            // see: https://www.codingexercises.com/replace-all-instances-of-css-class-in-vanilla-js
            //
            var input_area = document.getElementsByClassName('input_area');
            [...input_area].forEach(x => x.className += " notranslate");

            $selector.find('h1').replaceWith( function() {
              return '<' + options.setHeadings + ' id="' + $(this)[0].id + '">' + $(this).text().slice(0,-1) + '</' + options.heading + '>';
            });

            $selector.find('h2').replaceWith( function() {
              return '<h2 id="' + $(this)[0].id + '">' + $(this).text().slice(0,-1) + '</h2>';
            });

            $selector.find('h3').replaceWith( function() {
              return '<h3 id="' + $(this)[0].id + '">' + $(this).text().slice(0,-1) + '</h3>';
            });

            $selector.find('h4').replaceWith( function() {
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
              logger.info('\n' + 'set state for ' + mod + ' to: ' + state);
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

      // failsafe - prevent XHR load errors
      //
      if (options.xhr_data !== '') {
        logger.info('\n' + 'HTML data file found: ' + options.xhr_data);
      } else  {
        logger.warning('\n' + 'no HTML data file found, loading data aborted');
        return;
      }

      if ( $selector.length ) {
        $selector.load( html_data_path, cb_load_closure( mod, id ) );

        // observe DOM changes to detect if cell buttons removed
        // by nbinterct
        var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
        var xhrObserver = new MutationObserver (mutationHandler);
        var obsConfig = {
          childList: true,
          characterData: false,
          attributes: false,
          subtree: true
        };

        $selector.each(function(){
          xhrObserver.observe(this, obsConfig);
        });

        function mutationHandler (mutationRecords) {
          mutationRecords.forEach (function (mutation) {
            if (mutation.removedNodes.length) {
              var removedNodeClass = mutation.removedNodes[0].className;
              if (typeof removedNodeClass !== 'undefined' && removedNodeClass !== '' && removedNodeClass.includes('btn-primary')) {
                // removed cell buttons indicate that all 'nbinteract'
                // API functions has successfully finished
                xhrObserver.disconnect();
                spinner.stop();
                $('#nbiModalTopInfo').modal('hide');
                logger.info('\n' + 'cell button removed from the DOM');
                logger.info('\n' + 'processing the notebook (nbinteract) finished');
                logger.debug('\n' + 'found removedNodeClass: ' + removedNodeClass);
              }
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
          state = false;
        }
      }
      return state;
    },

    // -------------------------------------------------------------------------
    // loadNbiModals()
    // Load HTML data for all modals used
    // -------------------------------------------------------------------------
    loadNbiModals: function (options, mod, status) {

      const nbiModalTopInfo = `
        <div id="nbiModalTopInfo"
          class="modal fade top"
          tabindex="-1"
          role="dialog"
          aria-labelledby="myModalLabel" aria-hidden="true"
          data-keyboard="false"
          data-backdrop="static">
          <div class="modal-dialog modal-frame modal-top modal-notify modal-info" role="document">
            <!-- Content -->
            <div class="modal-content">
              <!-- Body -->
              <div class="modal-body">
                <div class="row px-4">
                  <p id="nbiModalTopInfoMessage" class="pt-1 pr-2">Placeholder ..</p>
                </div>
                <div class="row px-4">
                  <a type="button" class="btn btn-primary" data-bs-dismiss="modal">Close</a>
                </div>
              </div>
            </div>
            <!-- END Content -->
          </div>
        </div>
      `
      const nbiModalTRSuccess = `
        <div id="nbiModalTRSuccess"
          class="modal fade right"
          tabindex="-1"
          role="dialog"
          aria-labelledby="myModalLabel" aria-hidden="true"
          data-keyboard="false"
          data-backdrop="static">
          <div class="modal-dialog modal-side modal-top-right modal-notify modal-success" role="document">
            <!-- Content -->
            <div class="modal-content">
              <!--Header-->
              <div class="modal-header">
                <p class="lead">Progress Info</p>
                <button type="button" class="close" data-bs-dismiss="modal" aria-label="Close">
                  <i class="mdi mdi-close mdi-dark mdi-48px"></i>
                </button>
              </div>
              <!-- Body -->
              <div class="modal-body">
                <div class="text-center">
                  <i class="mdi mdi-8x mdi-progress-clock md-green mb-1"></i>
                  <p id="nbiModalTRSuccessMessage">Placeholder ..</p>
                </div>
              </div>
              <!-- Footer -->
              <div class="modal-footer justify-content-center">
                <!-- a type="button" class="btn btn-primary" data-bs-dismiss="modal">OK</a -->
                <a type="button" class="btn btn-primary" data-bs-dismiss="modal">OK, thanks</a>
              </div>
            </div>
            <!-- END Content -->
          </div>
        </div>
      `
      const nbiModalTLDanger = `
        <div id="nbiModalTLDanger"
          class="modal fade left"
          tabindex="-1"
          role="dialog"
          aria-labelledby="myModalLabel" aria-hidden="true"
          data-keyboard="false"
          data-backdrop="static">
          <div class="modal-dialog modal-side modal-top-right modal-notify modal-danger" role="document">
            <!-- Content -->
            <div class="modal-content">
              <!--Header-->
              <div class="modal-header">
                <p class="lead">Error</p>
                <button type="button" class="close" data-bs-dismiss="modal" aria-label="Close">
                  <i class="mdi mdi-close mdi-dark mdi-48px"></i>
                </button>
              </div>
              <!-- Body -->
              <div class="modal-body">
                <div class="text-center">
                  <i class="mdi mdi-10x mdi-alert md-red mb-1"></i>
                  <p id="nbiModalTRFailedMessage">Placeholder ..</p>
                </div>
              </div>
              <!-- Footer -->
              <div class="modal-footer justify-content-center">
                <a type="button" class="btn btn-primary mr-2">Yes, please</a>
                <a type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">No, thanks</a>
              </div>
            </div>
            <!-- END Content -->
          </div>
        </div>
      `
      nbiModal                = document.createElement('div');
      nbiModal.id             = 'nbi-modal-info';
      nbiModal.className      = 'nbi-modal';
      nbiModal.innerHTML      = nbiModalTopInfo;
      document.body.appendChild(nbiModal);

      nbiModal                = document.createElement('div');
      nbiModal.id             = 'nbi-modal-success';
      nbiModal.className      = 'nbi-modal';
      nbiModal.innerHTML      = nbiModalTRSuccess;
      document.body.appendChild(nbiModal);

      nbiModal                = document.createElement('div');
      nbiModal.id             = 'nbi-modal-danger';
      nbiModal.className      = 'nbi-modal';
      nbiModal.innerHTML      = nbiModalTLDanger;
      document.body.appendChild(nbiModal);

    },

    // -------------------------------------------------------------------------
    // messageHandler()
    // Manage messages send from other J1 modules
    // -------------------------------------------------------------------------
    messageHandler: function (sender, message) {
      var json_message  = JSON.stringify(message, undefined, 2);
      var message;

      logText = '\n' + 'received message from ' + sender + ': ' + json_message;
      logger.debug(logText);

      // -----------------------------------------------------------------------
      //  Process commands|actions
      // -----------------------------------------------------------------------
      if (message.type === 'command' && message.action === 'run') {
        logger.warn('\n' + message.text);

        // run a spinner to indicate activity of 'nbInteract'
        target  = document.getElementById('content');
        spinner = new Spinner(spinnerOpts).spin(target);

        // // set message text in modal
        // message           = document.getElementById('nbiModalTopInfoMessage');
        // // message.innerHTML = message.text;
        // message.innerHTML = 'Initializing nbinteract - this may take a while to finish  ...';
        //
        // // show info modal
        // $('#nbiModalTopInfo').modal('show');

        // set message text in modal
        message           = document.getElementById('nbiModalTRSuccessMessage');
        // message.innerHTML = message.text;
        message.innerHTML = 'Initializing nbinteract<br> This may take a while to finish  ...';

        // show info modal
        $('#nbiModalTRSuccess').modal('show');
      }

      if (message.type === 'command' && message.action === 'finished') {
        // hide info modal (make sure modal is shown)
        $('#nbiModalTRSuccess').on('shown.bs.modal', function () {
          window.setTimeout(function(){
             $('#nbiModalTRSuccess').modal('hide');
          }, nbiModalCloseDelay);
        });
      }

      if (message.type === 'command' && message.action === 'startKernelfailed') {
        logger.error('\n' + message.text);
        $('#nbiModalTopInfo').on('shown.bs.modal', function () {
          $('#nbiModalTopInfo').modal('hide');
        });
        // set message text in modal
        message = document.getElementById('nbiModalTLDangerMessage');
        // message.innerHTML = message.text;
        message.innerHTML = 'Initializing nbinteract: initialization of the kernel failed';
        $('#nbiModalTLDanger').modal('show');
      }

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
