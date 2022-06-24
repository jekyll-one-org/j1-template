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
 # For details, see: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE.md
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
{% assign nbinteract_defaults = modules.defaults.nbinteract.defaults %}
{% assign nbinteract_settings = modules.nbinteract.settings %}

{% comment %} Set config options
-------------------------------------------------------------------------------- {% endcomment %}
{% assign nbinteract_options  = nbinteract_defaults | merge: nbinteract_settings %}

{% assign production = false %}
{% if environment == 'prod' or environment == 'production' %}
  {% assign production = true %}
{% endif %}

/*
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/nbinteract.js
 # J1 Adapter for j1-nbinteract
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2022 Juergen Adams
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
j1.adapter.nbinteract = (function (j1, window) {

  {% comment %} Set global variables
  ------------------------------------------------------------------------------ {% endcomment %}
  var environment     = '{{environment}}';
  var moduleOptions   = {};
  var moduleSettings  = {};
  var message         = {};
  var flags            = {
    checkURL:   false
  };
  var spinnerOpts     = {                                                       // (default) options for a spinner
    lines:      13,                                                             // number of lines to draw
    length:     38,                                                             // length of each line
    width:      17,                                                             // line thickness
    radius:     45,                                                             // radius of the inner circle
    scale:      2,                                                              // scales overall size of the spinner
    corners:    1,                                                              // corner roundness (0..1)
    speed:      0.5,                                                            // rounds per second
    rotate:     0,                                                              // rotation offset
    animation: 'spinner-line-fade-more',                                        // CSS animation name for the lines: spinner-line-fade-quick | spinner-line-shrink | spinner-line-fade-more
    direction:  1,                                                              // 1: clockwise, -1: counterclockwise
    color:      '#424242',                                                      // CSS color or array of colors: orange (EF6C00) | blue (1565C0) | gray (424242)
    fadeColor:  'transparent',                                                  // CSS color or array of colors
    top:        '70%',                                                          // top position relative to parent
    left:       '50%',                                                          // left position relative to parent
    shadow:     '0 0 1px transparent',                                          // box-shadow for the lines
    zIndex:     2000000000,                                                     // z-index (defaults to 2e9)
    className:  'spinner',                                                      // CSS class assined to the spinner
    position:   'fixed',                                                        // element positioning:  absolute|fixed
  };

  var nbActions = {
    "resetLocalStorage":        true
  };

  var spinnerStarted = false;                                                   // switch to indicate a started spinner
  var nbiContentModalInfoID       = 'nbiModalInfoBody';                         // ID of the content (messages) for the INFO modal
  var nbiContentModalSuccessID    = 'nbiModalSuccessBody';                      // ID of the content (messages) for the SUCCESS modal
  var nbiContentModalErrorID      = 'nbiModalErrorBody';                        // ID of the content (messages) for the SUCCESS modal
  var nbiModalTopInfo             = '#' + 'nbiModalTopInfo';                    // ID of the TopInfo modal
  var nbiModalTRInfo              = '#' + 'nbiModalTRInfo';                     // ID of the TRInfo modal
  var nbiModalSuccessID           = '#' + 'nbiModalTRSuccess';                  // ID of the SUCCESS modal
  var nbiModalErrorID             = '#' + 'nbiModalTLDanger';                   // ID of the ERROR modal
  var nbinteract_prepared         = false;                                      // switch to indicate if ???
  var nbiModalSuccessMessagesID   = 'nbiModalSuccessMessages';                  // UL contalner SUCCESS messages
  var nbiModalErrorMessagesID     = 'nbiModalErrorMessages';                    // UL contalner ERROR messages
  var nbiCellsRendered = false;                                                  // flag indicates if all widgets in page are rendered
  var nbiShowMessages;                                                          // switch to show NBI messages
  var nbiIndicateNbiActivity;                                                   // switch to show a spinner while NBI is being initialized
  var nbiModalAutoClose;                                                        // switch to auto-close nbi message modals
  var nbiModalAutoCloseDelay;                                                   // delay auto-close nbi message modals
  var nbiInitTimeout;                                                           // delay indicate NBI failed
  var nbiInitMathJax;                                                           // Load and run MathJax at runtime
  var textbooks;                                                                // ALL notebokks enabled
  var textbook;                                                                 // current textbook (processed)
  var target;                                                                   // target container for the (activity) spinner
  var spinner;                                                                  // the (activity) spinner
  var nbiModal;
  var _this;
  var interact;
  var logger;
  var coreLogger;
  var logText;
  var widgetCells;
  var widgetCellsRendered;
  var nbiNotebookReady;
  var Events;

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
      // global event handler
      // -----------------------------------------------------------------------
      Events = {
        documentReady: function (onDocumentReady) {
          if (document.readyState !== 'loading') {
            onDocumentReady();
          } else {
            document.addEventListener('DOMContentLoaded', onDocumentReady);
          }
        }
      };

      // -----------------------------------------------------------------------
      // Default module settings
      // -----------------------------------------------------------------------
      var settings = $.extend ({
        module_name: 'j1.adapter.nbinteract',
        generated:   '{{site.time}}'
      }, options);

      moduleOptions = $.extend({}, {{nbinteract_options | replace: 'nil', 'null' | replace: '=>', ':' }});

      // -----------------------------------------------------------------------
      // Global variable settings
      // -----------------------------------------------------------------------
      _this                   = j1.adapter.nbinteract;
      logger                  = log4javascript.getLogger('j1.adapter.nbinteract');
      nbiModalAutoClose       = moduleOptions.nbi_messages_auto_close;
      nbiModalAutoCloseDelay  = moduleOptions.nbi_messages_auto_close_delay;
      nbiInitTimeout          = moduleOptions.nbi_init_timeout;
      nbiShowMessages         = moduleOptions.show_nbi_messages;
      nbiIndicateNbiActivity  = moduleOptions.indicate_nbi_activity;
      nbiInitMathJax          = moduleOptions.nbi_init_mathjax;
      nbiNotebookReady        = moduleOptions.notebook_ready;

      // -----------------------------------------------------------------------
      // load|configure Mathjax
      // -----------------------------------------------------------------------
      if (nbiInitMathJax) {
        _this.initMathJax();
      }
      // -----------------------------------------------------------------------
      // load|configure NBI dialog (modal)
      // -----------------------------------------------------------------------
      _this.loadDialog(moduleOptions);

      // -----------------------------------------------------------------------
      // load all modals (HTML portion) used by NBI
      // -----------------------------------------------------------------------
      _this.loadNbiModals();

      // -----------------------------------------------------------------------
      // load all textbooks (HTML portion) configured|enabled
      // -----------------------------------------------------------------------
      _this.loadNbiTextbooks(moduleOptions);

      // -----------------------------------------------------------------------
      // run a spinner to indicate activity of 'nbInteract' if enabled
      // -----------------------------------------------------------------------
      $(document).ready(function() {
        if (nbiIndicateNbiActivity && !spinnerStarted) {
          spinnerStarted = true;
          target  = document.getElementById('content');
          spinner = new Spinner(spinnerOpts).spin(target);
        }

      });

      // -----------------------------------------------------------------------
      // register callbacks (actions) for all modals used
      // -----------------------------------------------------------------------
      if (nbiShowMessages) {
        _this.registerNbiModalsCB();
      }

      // -----------------------------------------------------------------------
      // interactNbiTextbooks()
      // connect to the configured BinderHub instance to create a
      // Jupyter kernel if required
      // -----------------------------------------------------------------------
      _this.interactNbiTextbooks(moduleOptions);

      // toggle hide|show the FAB button, if to wait on 'last_widget' rendered
      //
      if (nbiNotebookReady == 'last_widget') {
        var dependencies_met_page_rendered = setInterval(function() {
          if (nbiCellsRendered) {
            $('.fab-btn').show();
            clearInterval(dependencies_met_page_rendered);
          } else {
            $('.fab-btn').hide();
          }
        }, 25);  // END interval dependencies_met_page_rendered
      }

    }, // END init

    // -------------------------------------------------------------------------
    // initMathJax()
    // load|configure MathJax at runtime
    // See: https://docs.mathjax.org/en/v2.7-latest/options/preprocessors/tex2jax.html
    // -------------------------------------------------------------------------
    initMathJax: function () {
      var scriptMathjax       = document.createElement('script');
      var scriptMathjaxConfig = document.createElement('script');

      // Loading MathJax from a CDN
      //
      scriptMathjax.setAttribute('src','//cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.5/latest.js?config=TeX-AMS_HTML');

      // create/load MathJax configuration settings
      //
      scriptMathjaxConfig.setAttribute('type','text/x-mathjax-config');
      scriptMathjaxConfig.innerHTML = `
        MathJax.Hub.Config({
            tex2jax: {
              // inlineMath, displayMath
              // ---------------------------------------------------------------
              // TeX 'delimiters'. By default, the tex2jax preprocessor
              // definesthe LaTeX math delimiters, which are \(...\) for
              // 'in-line' math, and \[...\] for 'displayed' equations.
              // It also defines the TeX delimiters $$...$$ for displayed
              // equations, but it does not define $...$ as in-line math
              // delimiters. That is because dollar signs appear too often
              // in non-mathematical settings, which could cause some text
              // to be treated as mathematics unexpectedly. For example,
              // with single-dollar delimiters, 'the cost is $2.50' for the
              // first one, and '$2.00' for each additional one would cause
              // the phrase '2.50 for the first one' to be treated as
              // mathematics since it falls between dollar signs. For this
              // reason, if you want to use single-dollars for in-line math
              // mode, you must enable that explicitly.
              //
              inlineMath: [ ['$','$'], ["\\(","\\)  "] ],
              displayMath: [ ['$$','$$'], ["\\[","\\]"] ],

              // processEscapes
              // ---------------------------------------------------------------
              // When 'processEscapes' set to true, you may use \$ to
              // representa literal dollar sign, rather than using it as
              // a math delimiter. When false, \$ will not be altered,
              // and the dollar sign may be considered part of a math
              // delimiter. Typically this is set to 'true' if you enable
              // the $ ... $ in-line delimiters, so you can type \$ and
              // tex2jax will convert it to a regular dollar sign in the
              // rendered document.
              //
              processEscapes: true,

              // processEnvironments
              // ---------------------------------------------------------------
              // When 'processEnvironments' true, tex2jax looks not only
              // for the in-line and display math delimiters, but also for
              // LaTeX environments (\begin{something}...\end{something})
              // and marks them forprocessing by MathJax. When false, LaTeX
              // environments will not be processed outside of math mode.
              //
              processEnvironments: false,

              // skipTags
              // ---------------------------------------------------------------
              // The array 'skipTags' lists the names of the tags whose
              // contents should NOT be processed by tex2jax.
              //
              skipTags: ["script","noscript","style","textarea","pre","code"],

              // processClass, ignoreClass
              // ---------------------------------------------------------------
              // These are the (CSS) classes name used to mark elements whose
              // contents should or should NOT be processed by tex2jax.
              //
              processClass: "mathjax",
              ignoreClass: "nomathjax"
            },

            // displayAlign
            // -----------------------------------------------------------------
            // Align (displayMath) equations left-sided in code and all
            // markdown cells.
            //
            displayAlign: 'left',

            // preview
            // -----------------------------------------------------------------
            // Controls whether tex2jax inserts 'MathJax_Preview' spans to
            // make a preview available, and what preview to use, when it
            // locates in-line or display mathematics in the page. The default
            // is 'TeX', which means use the TeX code as the preview (which
            // will be visible until it is processed by MathJax). Set to
            // 'none' to prevent previews from being inserted.
            //
            preview: "TeX",

            // CommonHTML, HTML-CSS, and SVG output processors
            // -----------------------------------------------------------------
            // The CommonHTML, HTML-CSS, and SVG output processors implement
            // most of the MathML3 automatic line-breaking specification.
            // Since line-breaking takes extra processing and so can slow
            // down the mathematical output, it is off by default
            //
            CommonHTML: { linebreaks: { automatic: false } },
            "HTML-CSS": { linebreaks: { automatic: false } },
                   SVG: { linebreaks: { automatic: false } }
        });

        // Use Jax renderer 'CommonHTML' for default
        //
        MathJax.Hub.Register.StartupHook("End Jax",function () {
          var BROWSER = MathJax.Hub.Browser;
          var jax = "CommonHTML";
          if (BROWSER.hasMathPlayer) jax = "NativeMML";
          return MathJax.Hub.setRenderer(jax);
        });

        // Register a message MessageHook
        // ---------------------------------------------------------------------
        // MathJax.Hub.Register.MessageHook("New Math", function (message) {
        //   var script = MathJax.Hub.getJaxFor(message[1]).SourceElement();
        //   var j1_message = {};
        //   j1_message.type    = 'command';
        //   j1_message.action  = 'mathjax';
        //   j1_message.text    = message[1];
        //   this.j1.sendMessage('MathJax.Hub.MessageHook', 'j1.adapter.nbinteract', j1_message);
        //   // console.error('nbinteract, Hub - New Math: ' + message[1]);
        // });

        // ---------------------------------------------------------------------
        // END config
      `;

      // add Mathjax resources
      //
      document.head.appendChild(scriptMathjax);
      document.head.appendChild(scriptMathjaxConfig);

      return;
    }, // END intMathjax

    // -------------------------------------------------------------------------
    // loadNbiTextbooks()
    // load the HTML portion for all textbooks configured (enabled)
    // -------------------------------------------------------------------------
    loadNbiTextbooks: function (settings) {
      var textbooks = settings.textbooks;

      textbooks.forEach (function (elm) {
        if (elm.textbook.enabled) {
          textbook = elm.textbook;

          var textbook_id = textbook.id;
          var $selector = $('#' + textbook_id);

          // load the HTML portion for the textbook
          //
          if ($selector.length) {
            _this.loadTextbookHTML ({
              xhr_container_id:   textbook.id,
              xhr_data:           textbook.xhr_data,
              xhr_data_path:      textbook.xhr_data_path,
              use_mathjax:        textbook.use_mathjax,
              translate_mathjax:  textbook.translate_mathjax,
              altair_cleanups:    textbook.altair_cleanups,
              buttonStyles:       settings.button_styles,
            });
          }
        }
      });
    },

    // -------------------------------------------------------------------------
    // interactNbiTextbooks()
    // connect to the configured BinderHub instance to create a
    // Jupyter kernel if required. A BinderHub instance in created
    // on a per textbook basis but trigeered only done once,
    // controlled by nbinteract_prepared.
    // -------------------------------------------------------------------------
    interactNbiTextbooks: function (options) {
      var state;
      //  collect (preferred) Binder references
      //
      var preferredBaseUrl  = options.baseUrls.preferred;
      var myBaseUrl         = options.baseUrls[preferredBaseUrl];
      var preferredProvider = options.providers.preferred;
      var myProviderId      = options.providers[preferredProvider].provider_id;
      var myProviderSpec    = options.providers[preferredProvider].provider_spec;

      // initialize state flag
      _this.setState('started');
      logger.debug('\n' + 'state: ' + _this.getState());

      // check if the Binder Service is available
      //
      _this.checkURL(myBaseUrl, flags);

      var log_text = '\n' + 'nbinteract is being initialized';
      logger.info(log_text);

      var dependencies_met_binder_responsive = setInterval(function() {
        state = _this.getState();
        if (state == 'finished_checks') {
          clearInterval(dependencies_met_binder_responsive);
          if (flags.checkURL) {
            {% comment %} initialize nbinteract per textbook
            {% assign textbook_spec     = item.textbook.spec %}
            {% assign textbook_baseUrl  = item.textbook.baseUrl %}
            {% assign textbook_provider = item.textbook.provider %}
            -------------------------------------------------------------------------- {% endcomment %}
            {% for item in nbinteract_options.textbooks %} {% if item.textbook.enabled %}
            {% assign textbook_id       = item.textbook.id %}

            if ($('#{{textbook_id}}').length) {
              var dependencies_met_nb_loaded = setInterval(function() {
                if ($('#{{textbook_id}}').attr('data-nb-textbook') == 'loaded') {

                  var nbiButtonsFound = document.querySelectorAll('.js-nbinteract-widget').length
                  if (nbiIndicateNbiActivity && nbiButtonsFound == 1) {
                    var log_text = '\n' + 'localized textbook found, skip NBI initialization for: {{textbook_id}}';
                    logger.warn(log_text);
                    spinner.stop();
                  }

                  if(!nbinteract_prepared && nbiButtonsFound > 1) {
                    logText = '\n' + 'jupyter kernel is being generated ...';
                    logger.info(logText);

                    // create nbInteract (core) instance
                    //
                    coreLogger = log4javascript.getLogger('nbinteract.core');
                    interact = new NbInteract({
                      baseUrl:  myBaseUrl,
                      provider: myProviderId,
                      spec:     myProviderSpec,
                      logger:   coreLogger,
                      j1API:    j1,
                    });

                    // generate a jupyter kernel via BinderHub
                    interact.prepare();
                    nbinteract_prepared = true;

                    // issue an error if the NBI (init) button never removed by
                    // nbInteract-core (util or manager)
                    // TODO:  The 'timeout' condition should be replaced
                    //        state-based triggered from nbInteract-core.
                    //
                    window.setTimeout(function() {
                      var nbiButtonState = _this.getNbiButtonState();
                      if (nbiButtonState) {
                        // button NOT removed
                        logger.warn('NBI initialialization failed on textbook: {{textbook_id}}');
                        spinner.stop();
                        // hide the info modal
                        $(nbiModalSuccessID).modal('hide');

                        // show the error modal
                        $(nbiModalSuccessID).on('hidden.bs.modal', function () {
                          if ($(nbiModalErrorID).is(':hidden')) {
                            var messageErrorUL = document.getElementById(nbiModalErrorMessagesID);
                            _this.appendModalMessage(messageErrorUL, 'NBI initialialization failed for textbook: {{textbook_id}}')
                            $(nbiModalErrorID).modal('show');

                            // auto-close the error modal
                            if (nbiModalAutoClose) {
                              window.setTimeout(function() {
                                $(nbiModalErrorID).modal('hide');
                              }, nbiModalAutoCloseDelay);
                            }
                          }
                        });
                      } else {
                        // button removed
                        logger.info('NBI initialized successfully.');
                      }
                    }, nbiInitTimeout);

                  }

                  clearInterval(dependencies_met_nb_loaded);
                } // END dependencies_met_nb_loaded
              }, 25);
              return;
            }
            // END textbook_id: {{ textbook_id }}
            {% endif %} {% endfor %}
          } else {
            spinner.stop();
            var modaBodyText = `
              The <i>Binder Service</i> is currently not available or is overloaded.
              All interactive components on the page are <b>not</b> available.
              You can reload the page or re-open later again.
            `;
            logger.error('\n', 'Binder access: failed');
            if ($(nbiModalTRInfo).is(':hidden')) {
              document.getElementById('nbiModalTRInfoBody').innerHTML = modaBodyText;
              $(nbiModalTRInfo).modal('show');
            }
            clearInterval(dependencies_met_binder_responsive);
          }

        }
      }, 25);  // END dependencies_met_binder_responsive

    },

    // -------------------------------------------------------------------------
    // loadTextbookHTML()
    // Load HTML data asychronously using XHR|jQuery on an element
    // (e.g. <div>) specified by xhr_container_id, xhr_data_path
    // -------------------------------------------------------------------------
    loadTextbookHTML: function (options) {
      var html_data_path      = options.xhr_data_path + '/' + options.xhr_data;
      var id                  = options.xhr_container_id;
      var mathjaxEnabled      = options.use_mathjax ? options.use_mathjax : false;
      var mathjaxTranslate    = options.translate_mathjax ? options.translate_mathjax : false;
      var cleanupAltair       = options.altair_cleanups ? options.altair_cleanups : false;
      var isPageRendered      = false;
      var $selector           = $('#' + id);
      var allID;
      var allMathJaxSpan;
      var allMathJaxElement;
      var logText;

      var cb_load_closure = function(id, mathjaxFlag) {
        return function (responseTxt, statusTxt, xhr) {
          var logger = log4javascript.getLogger('j1.adapter.loadHTML');

          if (statusTxt === 'success') {
            j1.setXhrDataState(id, statusTxt);
            j1.setXhrDomState(id, 'pending');

            // set data attribute to indicate HTML data loaded
            //
            $selector.attr('data-nb-textbook', 'loaded');

            // run HTML cleanups
            //
            $selector.find('button').replaceWith( function() {
              return '<button class="' + options.buttonStyles + ' js-nbinteract-widget"> Loading widgets ...</button>';
            });

            // enable MathJax for the (current) J1 Textbook container
            // processed if enabled for the (containing) textbook
            //
            var currentTextbook = document.getElementById(id);
            if (mathjaxFlag) {
              currentTextbook.classList.add('mathjax');
            } else {
              currentTextbook.classList.add('nomathjax');
            }

            // ------------------------------------------------------------------
            // see: https://www.codingexercises.com/replace-all-instances-of-css-class-in-vanilla-js
            // see: https://wiki.thishtml.org/wiki/JavaScript/Operatoren/Rest-_oder_Spread-Operator
            // ------------------------------------------------------------------

            // disable (Google) translation for all HTML 'output_wrapper' elements
            //
            var output_wrapper = document.getElementsByClassName('output_wrapper');
            [...output_wrapper].forEach(function(x) {
              if (!x.className.includes('notranslate')) {
                x.className += ' notranslate';
              }
            });

            // make all output_wrapper cells "responsive" (especially for tables)
            //
            var output_wrapper = document.getElementsByClassName('output_wrapper');
            [...output_wrapper].forEach(function(x) {
              if (!x.className.includes('cell-responsive')) {
                x.className += ' cell-responsive';
              }
            });

            // cleanups for Altair for all HTML 'output_wrapper' elements
            //
            if (cleanupAltair) {

              var reUnderscores = new RegExp(/_/, 'g');
              var reMultipleSpaces = new RegExp(/\s+/, 'g');
              var reMultipleSpacesStart = new RegExp(/^\s+/, 'g');
              var reMultipleSpacesEnd = new RegExp(/\s+$/, 'g');
              var reSkipWords = new RegExp(/vgsid|bla/, 'g');
              var reDuplicateWords = new RegExp(/(\b\S.+\b)(?=.*\1)/, 'g');
              var content;
              var newContent;
              var newContentWritten = false;
              var isWidget;
              var outputDiv;
              var childNodes;
              var clientHeight;
              var lastWidget = false;

              // check/wait for ALL Altair widgets in the page are rendered (by JS)
              // if rendering finished, flag 'isPageRendered' is set to 'true'
              //
              allID = document.querySelectorAll('*[id^="altair-viz"]');
              for (var l = 0; l < allID.length; l++) {
                outputDiv = document.getElementById(allID[l].id);
                var dependencies_met_page_rendered = setInterval(function() {
                  lastWidget = (l == allID.length) ? true : false;
                  if (outputDiv.clientHeight && lastWidget && !isPageRendered) {
                    isPageRendered = true;
                    logger.debug('\n' + 'last widget rendered ' + outputDiv.id + ' : ' + outputDiv.clientHeight);
                    clearInterval(dependencies_met_page_rendered);
                  }
                }, 25);  // END interval
              } // END for all ID

              var dependencies_met_widgets_updated = setInterval(function() {
                if (isPageRendered) {
                  for (var item of allID) {
                  	outputDiv = document.getElementById(item.id);
                    logger.debug('\n' + 'processing widget on id: ' + item.id);

                  	childNodes = outputDiv.getElementsByClassName('vega-bind-name');
                  	if (childNodes.length) {
                  		for (var i = 0; i < childNodes.length; i++) {
                  		  content = childNodes[i].innerHTML;
                  		  newContent = content.replace(reUnderscores, ' ');
                  		  newContent  = newContent.replace(reDuplicateWords, '');
                  		  newContent  = newContent.replace(reSkipWords, '');
                  		  newContent  = newContent.replace(reMultipleSpaces, ' ');
                  		  newContent  = newContent.replace(reMultipleSpacesStart, '');
                  		  newContent  = newContent.replace(reMultipleSpacesEnd, '');
                  		  childNodes[i].innerHTML = newContent;
                  		  newContentWritten = true;
                  		} // END for
                  	} // END if childNodes.length
                  } // END for
                  logger.debug('\n' + 'all widgets updated');

                  clearInterval(dependencies_met_widgets_updated);
                }
              }, 25);  // END interval
            } // END if cleanup Altair

            // disable MathJax for all HTML 'output_wrapper' elements
            //
            [...output_wrapper].forEach(function(x) {
              if (x.className.includes('nomathjax')) {
                x.className += ' nomathjax';
              }
            });

            // make all 'image' elements responsive (BS@4)
            //
            var images = document.getElementsByTagName('img');;
            [...images].forEach(function(x) {
              if (!x.className.includes('img-fluid')) {
                x.className += ' img-fluid';
              }
            });

            // disable for now
            //
            mathjaxTranslate = true

            // disable translation on MathJax containers
            // -----------------------------------------------------------------
            if (mathjaxEnabled && !mathjaxTranslate) {

              var dependencies_met_mathjax_available = setInterval(function() {
                // document.getElementsByClassName('MJXc-display');
                // document.querySelectorAll('*[id^="MathJax-Element"]');
                // allMathJaxSpan = document.querySelectorAll('*[id^="MathJax-Element"]');
                // allMathJaxSpan = document.querySelectorAll('*[id^="MathJax-Element-"]');
                // allMathJaxSpan = document.getElementsByClassName('mjx-chtml');
                allMathJaxSpan = document.querySelectorAll('*[id$="-Frame"]');

                if (allMathJaxSpan.length) {
                  // var lastElm = document.getElementById(allMathJaxSpan[allMathJaxSpan.length-1].id);
                  var dependencies_met_mathjax_rendered = setInterval(function() {
                    // var isProcessing = lastElm.classList.contains('MathJax_Processing');
                    var mj_state = j1.adapter.nbinteract.getState()
                    if (mj_state == 'mathjax_finished') {
                      allMathJaxSpan = document.querySelectorAll('*[id$="-Frame"]');
                      for (var l = 0; l < allMathJaxSpan.length; l++) {
                        // outputDiv = document.getElementById(allMathJaxSpan[l].id);
                        outputDiv = allMathJaxSpan[l];
                        logger.error('\n' + 'element: ' + outputDiv.id  );
                        // outputDiv.classList.remove('MJXc-processing');
                        outputDiv.classList.add('notranslate');
                      }
                      clearInterval(dependencies_met_mathjax_rendered);
                    }
                  }, 25);  // END interval dependencies_met_mathjax_rendered
                  clearInterval(dependencies_met_mathjax_available);
                };
              }, 25);  // END interval dependencies_met_mathjax_available

            } // END // disable translation on MathJax

            // rewrite headlines in textbook HTML, add an id used by toccer
            //
            $selector.find('h1').replaceWith( function() {
              // return '<h1 id="' + $(this)[0].id.replace(/\$/g, '') + '">' + $(this).text().slice(0,-1) + '</h1>';
              return '<h1 id="' + $(this)[0].id + '">' + $(this).text().slice(0,-1) + '</h1>';
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

            $selector.find('h5').replaceWith( function() {
              return '<h5 id="' + $(this)[0].id + '">' + $(this).text().slice(0,-1) + '</h5>';
            });

            logText = '\n' + 'data loaded successfully on id: ' + id;
            logger.info(logText);
          }

          if (statusTxt === 'error') {
            // jadams, 2020-07-21: to be checked why id could be UNDEFINED
            if (typeof(id) != "undefined") {
              var state = 'failed';
              if (nbiIndicateNbiActivity) {
                spinner.stop();
              }
              // logger.info('\n' + 'set state for ' + mod + ' to: ' + state);
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

      if ($selector.length) {
        $selector.load( html_data_path, cb_load_closure(id, mathjaxEnabled));
      }

      return;
    },

    // -------------------------------------------------------------------------
    // registerNbiModalsCB()
    // regsiter callbacks for all (NBI) modals used
    // -------------------------------------------------------------------------
    registerNbiModalsCB: function () {

      // auto-scroll to the END of the SUCCESS messages
      // see: https://stackoverflow.com/questions/7303948/how-to-auto-scroll-to-end-of-div-when-data-is-added
      //
      window.setInterval(function() {
        var contentModalSuccess = document.getElementById(nbiContentModalSuccessID);
        contentModalSuccess.scrollTop = contentModalSuccess.scrollHeight;
      }, 500);

      // remove all INFO messages on modal CLOSED
      //
      $('#nbiModalTopInfo').on('hidden.bs.modal', function () {
        var ul = document.getElementById(nbiModalInfoMessagesID);
        var listLength = ul.children.length;

        if (listLength) {
          logger.debug('modal closed nbiModalTopInfo: remove all messages');
          _this.removeModalMessages(nbiModalInfoMessagesID);
        }
      });
      // remove all SUCCESS messages on modal CLOSED
      //
      $('#nbiModalTRSuccess').on('hidden.bs.modal', function () {
        var ul = document.getElementById(nbiModalSuccessMessagesID);
        var listLength = ul.children.length;

        if (listLength) {
          logger.debug('modal closed nbiModalTRSuccess: remove all messages');
          _this.removeModalMessages(nbiModalSuccessMessagesID);
        }
      });
      // remove all ERROR messages on modal CLOSED
      //
      $('#nbiModalTLDanger').on('hidden.bs.modal', function () {
        var ul = document.getElementById(nbiModalErrorMessagesID);
        var listLength = ul.children.length;

        if (listLength) {
          logger.debug('modal closed nbiModalTLDanger: remove all messages');
          _this.removeModalMessages(nbiModalErrorMessagesID);
        }
        if (nbiIndicateNbiActivity) {
          spinner.stop();
        }
      });
    },

    // -------------------------------------------------------------------------
    // loadNbiModals()
    // Load HTML data for all (NBI) modals used
    // -------------------------------------------------------------------------
    loadNbiModals: function () {

      const nbiModalTopInfo = `
        <div id="nbiModalTopInfo"
          class="modal fade top"
          tabindex="-1"
          role="dialog"
          aria-labelledby="myModalLabel" aria-hidden="true"
          data-keyboard="false"
          data-backdrop="static">
          <div class="modal-dialog modal-frame modal-top modal-notify modal-info" role="document">
            <!-- Icon -->
            <div class="text-center">
              <i class="mdi mdi-10x mdi-progress-clock mdi-spin md-green mb-1"></i>
            </div>
            <!-- Content -->
            <div class="modal-content">
              <!-- Body -->
              <div id="nbiModalInfoBody" class="modal-body">
                <div>
                  <ul id="nbiModalInfoMessages"></ul>
                </div>
                <!-- Footer -->
                <div class="modal-footer justify-content-center">
                  <a type="button" class="btn btn-primary" data-bs-dismiss="modal">OK, thanks</a>
                </div>
              </div>
            </div>
            <!-- END Content -->
          </div>
        </div>
      `

      const nbiModalTRInfo = `
        <div id="nbiModalTRInfo"
          class="modal fade right"
          tabindex="-1"
          role="dialog"
          aria-labelledby="myModalLabel" aria-hidden="true"
          data-bs-keyboard="false"
          data-bs-backdrop="static">
          <div class="modal-dialog modal-dialog-scrollable modal-side-2x modal-top-right modal-notify modal-success" role="document">
            <!-- Content -->
            <div class="modal-content">
              <!-- Header -->
              <div class="modal-header">
                <p class="lead">Information</p>
                <button type="button" class="close" data-bs-dismiss="modal" aria-label="Close">
                  <i class="mdi mdi-close mdi-dark mdi-48px"></i>
                </button>
              </div>
              <!-- Icon -->
              <div class="text-center">
                <i class="mdi mdi-10x mdi-information-variant mdi-spin md-green mb-1"></i>
              </div>
              <!-- Body -->
              <div id="nbiModalTRInfoBody" class="modal-body">
                <div>
                  <p> Placeholder </p>
                </div>
              </div>
              <!-- Footer -->
              <div class="modal-footer justify-content-center">
                <a type="button" class="btn btn-primary" data-bs-dismiss="modal">OK, thanks</a>
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
          data-bs-keyboard="false"
          data-bs-backdrop="static">
          <div class="modal-dialog modal-dialog-scrollable modal-side-2x modal-top-right modal-notify modal-success" role="document">
            <!-- Content -->
            <div class="modal-content">
              <!-- Header -->
              <div class="modal-header">
                <p class="lead">NBI - Information</p>
                <button type="button" class="close" data-bs-dismiss="modal" aria-label="Close">
                  <i class="mdi mdi-close mdi-dark mdi-48px"></i>
                </button>
              </div>
              <!-- Icon -->
              <div class="text-center">
                <i class="mdi mdi-10x mdi-loading mdi-spin md-green mb-1"></i>
              </div>
              <!-- Body -->
              <div id="nbiModalSuccessBody" class="modal-body">
                <div>
                  <p> Initializing your Binder. This may take a while ...</p>
                  <ul id="nbiModalSuccessMessages"></ul>
                </div>
              </div>
              <!-- Footer -->
              <div class="modal-footer justify-content-center">
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
          data-bs-keyboard="false"
          data-bs-backdrop="static">
          <div class="modal-dialog modal-side-2x modal-top-left modal-notify modal-danger" role="document">
            <!-- Content -->
            <div id="nbiModalErrorBody" class="modal-content">
              <!--Header-->
              <div class="modal-header">
                <p class="lead">NBI - Error</p>
                <button type="button" class="close" data-bs-dismiss="modal" aria-label="Close">
                  <i class="mdi mdi-close mdi-dark mdi-48px"></i>
                </button>
              </div>
              <!-- Icon -->
              <div class="text-center">
                <i class="mdi mdi-10x mdi-alert md-red mb-1"></i>
              </div>
              <!-- Body -->
              <div id="nbiModalErrorBody" class="modal-body">
                <p> Initializing NbInteract failed:</p>
                <div>
                  <ul id="nbiModalErrorMessages"></ul>
                </div>
              </div>
              <!-- Footer -->
              <div class="modal-footer justify-content-center">
                <a type="button" class="btn btn-primary" data-bs-dismiss="modal">OK, thanks</a>
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
      nbiModal.id             = 'nbi-modal-info';
      nbiModal.className      = 'nbi-modal';
      nbiModal.innerHTML      = nbiModalTRInfo;
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
      var json_message      = JSON.stringify(message, undefined, 2);
      var messageSuccessUL  = document.getElementById(nbiModalSuccessMessagesID);
      var messageErrorUL    = document.getElementById(nbiModalErrorMessagesID);
      var isUpdated = false;
      var message;

      logText = '\n' + 'received message from ' + sender + ': ' + json_message;
      logger.debug(logText);

      // -----------------------------------------------------------------------
      //  Process commands|actions
      // -----------------------------------------------------------------------

      // -----------------------------------------------------------------------
      //  command|nbi_init_started
      // -----------------------------------------------------------------------
      if (message.type === 'command' && message.action === 'nbi_init_started') {

        if (nbiShowMessages) {
          if (nbiModalAutoClose) {
            window.setTimeout(function() {
               $(nbiModalSuccessID).modal('hide');
            }, nbiModalAutoCloseDelay);
          }
        }

        if (nbiNotebookReady == 'first_widget') {
          if (nbiIndicateNbiActivity) spinner.stop();
          $('.fab-btn').show();
        }

        widgetCells = document.querySelectorAll('.output_widget_view').length;
        var dependencies_met_page_rendered = setInterval(function() {
          widgetCellsRendered = document.querySelectorAll('.widget-vbox').length;
          if (widgetCellsRendered >= widgetCells) {
            logger.info('\n' + 'widgets rendered in page (interactive|total) : ' + widgetCells + '|' + widgetCellsRendered);
            nbiCellsRendered = true;
            if (nbiIndicateNbiActivity) spinner.stop();
            _this.setState('finished');
            logger.debug('\n' + 'state: ' + _this.getState());
            logger.info('\n' + 'initializing module finished');

            clearInterval(dependencies_met_page_rendered);
          }
        }, 25);  // END interval dependencies_met_page_rendered

        // ---------------------------------------------------------------------
        // show the quicklinks icon
        // ---------------------------------------------------------------------
        $('#quickLinksNotebookseButton').show();

      } // END message command/nbi_init_started

      // -----------------------------------------------------------------------
      //  command|mathjax
      // -----------------------------------------------------------------------
      if (message.type === 'command' && message.action === 'mathjax') {
        logger.error('\n' + 'New Math, ID: ' + message.text);

        // Register a MathJax callback if page is FULLY rendered
        // TODO: Dosn't for now tha way !!!
        // MathJax.Hub.Startup.signal.Interest(function (message) {
        //   logger.error("Startup: " + message)
        //   if (message.contains('End')) {
        //     logger.error("Startup: " + message)
        //   }
        // });

        var dependencies_met_mathjax_rendered = setInterval(function() {
          var elm = document.getElementById('MathJax-Element-6' + '-Frame');
          var isProcessing = (elm.classList.contains('MJXc-processing') || elm.classList.contains('MJXc-processed')) ? true : false;
          if (!isProcessing && !isUpdated) {
            isUpdated = true;
            elm.classList.add('notranslate');
            logger.error('\n' + 'New Math, ID: ' + message.text);
            //clearInterval(dependencies_met_mathjax_rendered);
          }
          clearInterval(dependencies_met_mathjax_rendered);
        }, 25);  // END interval dependencies_met_mathjax_rendered

      } // END message command/mathjax

      // -----------------------------------------------------------------------
      // command|info
      // TODO:  count messages contain 'Pulling image'.
      //        Potentially a enless loop
      // -----------------------------------------------------------------------
      if (message.type === 'command' && message.action === 'info') {
//      var reMessageTS         = new RegExp('/(?:[1-9]\d{3}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1\d|2[0-8])|(?:0[13-9]|1[0-2])-(?:29|30)|(?:0[13578]|1[02])-31)|(?:[1-9]\d(?:0[48]|[2468][048]|[13579][26])|(?:[2468][048]|[13579][26])00)-02-29)T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d{1,9})?(?:Z|[+-][01]\d:[0-5]\d)/');
        var messageTS;

        // widget render info messages for logging
        //
        if (message.text.includes('Displaying widget') || message.text.includes('First widget')) {
          logger.debug('\n' + message.text);
        }

        // remove timestamp|loglevel from message if exists
        //
        messageTS = message.text.split('] ')[1];
        if (messageTS) {
          message.text = messageTS;
        }

        _this.appendModalMessage(messageSuccessUL, message.text)
        logger.debug('\n' + message.text);

        // show the info modal
        //
        if (nbiShowMessages) {
          if ($(nbiModalSuccessID).is(':hidden')) {
            $(nbiModalSuccessID).modal('show');
          }
        }

      } // END message command/info

      // -----------------------------------------------------------------------
      //  command|error
      // -----------------------------------------------------------------------
      if (message.type === 'command' && message.action === 'error') {
        var messageTS;

        if (message.text.includes('Too many users') ||
            message.text.includes('Insufficent nodes') ||
            message.text.includes('ImagePullBackOff') ||
            message.text.includes('kernel failed') ||
            message.text.includes('failed to connect')
        ) {
          var modaBodyText = `
            The <i>Binder Service</i> seems currently not available or is overloaded.
            All interactive components on the page are <b>not</b> available.
            You can reload the page now to re-connect or re-open it at a later time.
          `;
          logger.error('\n', 'Binder access failed: ' + message.text);

          if ($(nbiModalTRInfo).is(':hidden')) {
            document.getElementById('nbiModalTRInfoBody').innerHTML = modaBodyText;
            $(nbiModalTRInfo).modal('show');
          }

          return;
        }

        // remove timestamp|loglevel from message if exists
        //
        messageTS = message.text.split('] ')[1];
        if (messageTS) {
          message.text = messageTS;
        }

        _this.appendModalMessage(messageErrorUL, message.text)
        logger.error('\n' + message.text);

        // stop the (progress) spinner
        //
        if (moduleOptions.indicate_nbi_activity) {
          spinner.stop();
        }

        if (nbiShowMessages) {
          // hide the info modal if shown
          //
          $(nbiModalSuccessID).on('shown.bs.modal', function () {
            $(nbiModalSuccessID).modal('hide');
          });

          // hide the info modal uncondionally (need ???)
          //
          $(nbiModalSuccessID).modal('hide');

          // show the error modal
          //
          $(nbiModalSuccessID).on('hidden.bs.modal', function () {
            if ($(nbiModalErrorID).is(':hidden')) {
              $(nbiModalErrorID).modal('show');

              // auto-close the error modal
              //
              if (nbiModalAutoClose) {
                window.setTimeout(function() {
                  $(nbiModalErrorID).modal('hide');
                }, nbiModalAutoCloseDelay);
              }
            }
          });
        }

        if (nbiIndicateNbiActivity) {
          spinner.stop();
        }

      } // END message command/error

      return true;
    }, // END messageHandler

    // -------------------------------------------------------------------------
    // getNbiButtonsState()
    // Gets the current (processing) state of NBI widget buttons
    // -------------------------------------------------------------------------
    getNbiButtonState: function () {
      var state;
      var cellButtons = document.querySelectorAll('.js-nbinteract-widget')
      if (cellButtons.length) {
        state = true;
      } else {
        state = false;
      }

      return state;
     }, // END getNbiButtonsState

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
    // checkURL()
    // Returns the current (processing) state of the module
    // -------------------------------------------------------------------------
    checkURL: function (uri, flags) {
      _this.setState('process_checks');
      if (uri.includes('localhost')) {
        _this.setState('finished_checks');
        flags.checkURL = true;
        return true;
      } else {
        $.get(uri).done(function (e) {
          _this.setState('finished_checks');
          flags.checkURL = true;
          return true;
        }).fail(function (e) {
          _this.setState('finished_checks');
          flags.checkURL = false;
        });
      }
    }, // END checkURL

    // -------------------------------------------------------------------------
    // loadDialog()
    // Loads the NBI dialog (modal)
    // -------------------------------------------------------------------------
    loadDialog: function (options) {
      Events.documentReady(function () {

        _this.modal = document.getElementById(options.dialogContainerID);
        if (!_this.modal) {
          logger.info('\n' +  'load consent modal');

          _this.modal = document.createElement('div');
          _this.modal.id = options.dialogContainerID;
          _this.modal.style.display = 'none';

          _this.modal.setAttribute('class', 'modal fade');
          _this.modal.setAttribute('tabindex', '-1');
          _this.modal.setAttribute('role', 'dialog');
          _this.modal.setAttribute('aria-labelledby', options.dialogContainerID);
          document.body.append(_this.modal);
          _this.$modal = $(_this.modal);

          // -------------------------------------------------------------------
          // load|initialize the dialog (modal content)
          // -------------------------------------------------------------------
          var templateUrl = options.contentURL + '/' + 'index.html';
          $.get(templateUrl)
          .done(function (data) {
            // load ALL modals HTML
            _this.modal.innerHTML = data;
            // select only the requested modal
            _this.modal.innerHTML = $('#' + options.xhrDataElement).eq(0).html();

            // set dialog type to 'modal'
            //
            $(_this.modal).modal({
              backdrop: 'static',
              keyboard: false
            });

            // register all button links
            //
            _this.$buttonDoNotAgree = $('#nbi-buttonDoNotAgree');
            _this.$buttonAgree      = $('#nbi-buttonAgree');
            _this.$buttonSave       = $('#nbi-buttonSave');
            _this.$buttonAgreeAll   = $('#nbi-buttonAgreeAll');

            // register all actions
            //
            _this.registerActions();

            // register button event handler
            //
            _this.$buttonDoNotAgree.click(function () {
              _this.doNotAgree();
            });

            _this.$buttonAgree.click(function () {
              _this.agreeAll();
            });
          })
          .fail(function () {
            logger.error('\n' + 'loading nbi dialog (modal): failed');
            logger.warn('\n' + 'probably no|wrong `contentURL` set');
          });
        }
      }.bind(_this));
    },  // END loadDialog

    // -------------------------------------------------------------------------
    // showDialog()
    // Show the NBI dialog (modal)
    // -------------------------------------------------------------------------
    showDialog: function () {
      this.$modal.modal('show');
    },  // END showDialog

    // -------------------------------------------------------------------------
    // registerActions()
    // register actions to run
    // -------------------------------------------------------------------------
    registerActions: function () {

      $('input:checkbox[name="checkboxClearLocalStorage"]').on('click', function (e) {
        nbActions.resetLocalStorage = $(this).is(':checked');
        logText = '\n' + 'action ClearLocalStorage changed to: ' + value;
        logger.info(logText);

        e.stopPropagation();
      });

    },  // END registerActions

    // -------------------------------------------------------------------------
    // doNotAgree()
    // action to run ...
    // -------------------------------------------------------------------------
    doNotAgree: function (elmID, msg) {
      _this.$modal.modal('hide');
    },  // END doNotAgree

    // -------------------------------------------------------------------------
    // agreeAll()
    // caction to run ...
    // -------------------------------------------------------------------------
    agreeAll: function (elmID, msg) {

      if (nbActions.resetLocalStorage) {
        logText = '\n' + 'run action: "Clear Binder Settings"';
        logger.info(logText);
        localStorage.removeItem('serverParams');
        localStorage.removeItem('kernelId');
      }

      _this.$modal.modal('hide');
      location.reload(true);
    },  // END agreeAll

    // -------------------------------------------------------------------------
    // appendModalMessage()
    // Appends a message to given (NBI) modal
    // -------------------------------------------------------------------------
    appendModalMessage: function (elmID, msg) {
      var li = document.createElement('li');

        li.setAttribute('class','item');
        elmID.appendChild(li);
        li.innerHTML = li.innerHTML + msg;
    },  // END appendModalMessage

    // -------------------------------------------------------------------------
    // removeModalMessages()
    // Remove (clear) all modal messages if a given (NBI) modal
    // -------------------------------------------------------------------------
    removeModalMessages: function (elmID) {
      var ul = document.getElementById(elmID);
      var listLength = ul.children.length;

      if (listLength) {
        for (var i = 0; i < listLength; i++) {
          ul.removeChild(ul.children[0]);
        }
      }
    }  // END removeModalMessages

  }; // END return
})(j1, window);

{% endcapture %}
{% if production %}
  {{ cache | minifyJS }}
{% else %}
  {{ cache | strip_empty_lines }}
{% endif %}
{% assign cache = nil %}
