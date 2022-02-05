---
regenerate:                             true
---

{% capture cache %}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/justifiedGalleryCustomizer.js
 # Liquid template to adapt Gallery Customizer JS functions
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2022 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # For details, see https://jekyll.one
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
{% assign jf_gallery_defaults         = apps.defaults.justifiedGallery.defaults %}
{% assign jf_gallery_settings         = apps.justifiedGallery.settings %}
{% assign gallery_customizer_defaults = apps.defaults.justifiedGalleryCustomizer.defaults %}
{% assign gallery_customizer_settings = apps.justifiedGalleryCustomizer.settings %}

{% comment %} Set config options
-------------------------------------------------------------------------------- {% endcomment %}
{% assign gallery_options             = jf_gallery_defaults | merge: jf_gallery_settings %}
{% assign customizer_options          = gallery_customizer_defaults | merge: gallery_customizer_settings %}

{% comment %} Liquid var initialization
-------------------------------------------------------------------------------- {% endcomment %}
{% assign customizer_title            = customizer_options.title %}
{% assign gallery_rowHeight           = customizer_options.gallery_settings.rowHeight %}

{% assign production = false %}
{% if environment == 'prod' or environment == 'production' %}
  {% assign production = true %}
{% endif %}

/*
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/justifiedGalleryCustomizer.js
 # J1 Adapter for Gallery Customizer
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2022 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # For details, see https://jekyll.one
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
j1.adapter.justifiedGalleryCustomizer = (function (j1, window) {

  {% comment %} Set global variables
  ------------------------------------------------------------------------------ {% endcomment %}
  var environment       = '{{environment}}';
  var galleryOptions    = {};
  var customizerOptions = {};
  var _this;
  var logger;
  var logText;

  // ---------------------------------------------------------------------------
  // Main object
  // ---------------------------------------------------------------------------
  return {

    // -------------------------------------------------------------------------
    // initializer
    // -------------------------------------------------------------------------
    init: function (options) {

      // -----------------------------------------------------------------------
      // Default module settings
      // -----------------------------------------------------------------------
      var settings = $.extend({
        module_name: 'j1.adapter.justifiedGalleryCustomizer',
        generated:   '{{site.time}}'
      }, options);

      // -----------------------------------------------------------------------
      // Global variable settings
      // -----------------------------------------------------------------------
      _this   = j1.adapter.justifiedGalleryCustomizer;
      logger  = log4javascript.getLogger('j1.adapter.justifiedGalleryCustomizer');

      // initialize state flag
      _this.setState('started');
      logger.info('\n' + 'state: ' + _this.getState());
      logger.info('\n' + 'module is being initialized');

      {% comment %} Load gallery config from yml data
      -------------------------------------------------------------------------- {% endcomment %}
      /* eslint-disable */
      galleryOptions    = $.extend({}, {{gallery_options | replace: '=>', ':' | replace: 'nil', '""'}});
      customizerOptions = $.extend({}, {{customizer_options | replace: '=>', ':' | replace: 'nil', '""'}});
      /* eslint-enable */

      // -----------------------------------------------------------------------
      // data loader
      // -----------------------------------------------------------------------
      j1.loadHTML ({
        xhr_container_id:   customizerOptions.xhr_container_id,
        xhr_data_path:      customizerOptions.xhr_data_path,
        xhr_data_element:   customizerOptions.xhr_data_element },
        'j1.adapter.gallery_customizer',
        'null'
      );

      // -----------------------------------------------------------------------
      // initializer
      // -----------------------------------------------------------------------
      var dependencies_met_data_loaded = setInterval(function() {
        if (j1.xhrDOMState['#customizer'] == 'success') {
          var galleryId       = '#jg_customizer';
          var $formId         = $('#jg-customizer-form');
          var $instance       = $('#jg_customizer');
          var kbdDelay        = 750;
          var imageHeightMin  = 100;

          logger.info('\n' + 'loading customizer finished on id: #' + customizerOptions.xhr_container_id);

          // -------------------------------------------------------------------
          // load gallery data
          j1.adapter.justifiedGallery.initialize(galleryOptions);

          logger.info('\n' + 'initialize customizer ui|forms');

          if ($formId.length) {
            var timerid;

            $('input[name="rowHeight"]').on('input', function (e) {
              var value = $(this).val();

              if (value < imageHeightMin) { return false; }

              if($(this).data('lastval') != value){
                  $(this).data('lastval', value);
                  clearTimeout(timerid);
                  //change action
                  timerid = setTimeout(function() {
                    $instance.justifiedGallery({rowHeight: value});
                    if (environment === 'development') {
                      logText = '\n' + 'gallery on ID ' +galleryId+ ' changed rowHeight to: ' +value;
                      logger.info(logText);
                    }
                  }, kbdDelay);
              };
              e.stopPropagation();
            });

            $('input[name="rowHeightMax"]').on('input', function (e) {
              var value = $(this).val();

              if($(this).data('lastval') != value){
                  $(this).data('lastval', value);
                  clearTimeout(timerid);
                  //change action
                  timerid = setTimeout(function() {
                    $instance.justifiedGallery({maxRowHeight: value});
                    if(environment === 'development') {
                      logText = '\n' + 'gallery on ID ' +galleryId+ ' changed maxRowHeight to: ' +value;
                      logger.info(logText);
                    }
                  }, kbdDelay);
              };
              e.stopPropagation();
            });

            $('input[name="margins"]').on('input', function (e) {
              var value = $(this).val();

              if($(this).data('lastval') != value){
                  $(this).data('lastval', value);
                  clearTimeout(timerid);
                  //change action
                  timerid = setTimeout(function() {
                    $instance.justifiedGallery({margins: value});
                    if(environment === 'development') {
                      logText = '\n' + 'gallery on ID ' +galleryId+ ' changed margins to: ' +value;
                      logger.info(logText);
                    }
                  }, kbdDelay);
              };
              e.stopPropagation();
            });

            $('input[name="border"]').on('input', function (e) {
              var value = $(this).val();

              if($(this).data('lastval') != value){
                  $(this).data('lastval', value);
                  clearTimeout(timerid);
                  //change action
                  timerid = setTimeout(function() {
                    $instance.justifiedGallery({border: value});
                    if(environment === 'development') {
                      logText = '\n' + 'gallery on ID ' +galleryId+ ' changed padding to: ' +value;
                      logger.info(logText);
                    }
                  }, kbdDelay);
              };
              e.stopPropagation();
            });

            $('input:checkbox[name="captions"]').on('click', function (e) {
              var value = $(this).is(':checked');

              $instance.justifiedGallery({captions: value});
              if(environment === 'development') {
                logText = '\n' + 'gallery on ID ' +galleryId+ ' changed captions to: ' +value;
                logger.info(logText);
              }
              e.stopPropagation();
            });

            $('input:checkbox[name="random"]').on('click', function (e) {
              var value = $(this).is(':checked');

              $instance.justifiedGallery({randomize: value});
              if(environment === 'development') {
                logText = '\n' + 'gallery on ID ' +galleryId+ ' changed randomize to: ' +value;
                logger.info(logText);
              }
              e.stopPropagation();
            });

            $('input:checkbox[name="justify_last_row"]').on('click', function (e) {
              var value = $(this).is(':checked');

              if (value == true) {
                value = 'justify';
                $instance.justifiedGallery({lastRow: value});
              } else {
                value = 'nojustify';
                $instance.justifiedGallery({lastRow: value});
              }
              if(environment === 'development') {
                logText = '\n' + 'gallery on ID ' +galleryId+ ' changed lastRow to: ' +value;
                logger.info(logText);
              }
              e.stopPropagation();
            });

            $('input:checkbox[name="hide_last_row"]').on('click', function (e) {
              var value = $(this).is(':checked');

              if (value == true) {
                value = 'hide';
                $instance.justifiedGallery({lastRow: value});
              } else {
                value = 'nojustify';
                $instance.justifiedGallery({lastRow: value});
              }
              if(environment === 'development') {
                logText = '\n' + 'gallery on ID ' +galleryId+ ' changed lastRow to: ' +value;
                logger.info(logText);
              }
              e.stopPropagation();
            });

            $('#jg-customizer-form button[name="reset-defaults"]').on('click', function (e) {

              $('#rowHeight').val(customizerOptions.gallery_settings.rowHeight);
              $('#rowHeightMax').val(customizerOptions.gallery_settings.maxRowHeight);
              $('#margins').val(customizerOptions.gallery_settings.margins);
              $('#border').val(customizerOptions.gallery_settings.border);
              $('input:checkbox[name="captions"]').val('on').filter('[value="on"]').prop('checked', customizerOptions.gallery_settings.captions);
              $('input:checkbox[name="random"]').val('off').filter('[value="off"]').prop('checked', customizerOptions.gallery_settings.randomize);
              $('input:checkbox[name="justify_last_row"]').val('on').filter('[value="on"]').prop('checked', customizerOptions.gallery_settings.justifyLastRow);
              $('input:checkbox[name="hide_last_row"]').val('off').filter('[value="off"]').prop('checked', customizerOptions.gallery_settings.hideLastRow);

              $instance.justifiedGallery({
                rowHeight:          customizerOptions.gallery_settings.rowHeight,
                maxRowHeight:       customizerOptions.gallery_settings.maxRowHeight,
                lastRow:            customizerOptions.gallery_settings.lastRow,
                margins:            customizerOptions.gallery_settings.margins,
                border:             customizerOptions.gallery_settings.border,
                randomize:          customizerOptions.gallery_settings.randomize,
                sort:               customizerOptions.gallery_settings.sort,
                refreshTime:        customizerOptions.gallery_settings.refreshTime,
                refreshSensitivity: customizerOptions.gallery_settings.refreshSensitivity,
                justifyThreshold:   customizerOptions.gallery_settings.justifyThreshold,
                captions:           customizerOptions.gallery_settings.captions
              });

              if(environment === 'development') {
                logText = '\n' + 'gallery on ID ' +galleryId+ ' reset to default values';
                logger.info(logText);
              }
              e.stopPropagation();
            });

          } // END form events

          // See: https://jsfiddle.net/prathviraj080/vbbbw46a/1/
          $('button.drawer-toggler').click(function(){
            $('button.drawer-toggler span.mdi').toggleClass('mdi-menu mdi-close');
          });
          $('button.drawer-toggler').click(function(){
            $('button.drawer-toggler').toggleClass('fadeIn rotateIn');
          });

          _this.setState('finished');
          logger.info('\n' + 'state: ' + _this.getState());
          logger.info('\n' + 'initializing module finished');
          logger.info('\n' + 'met dependencies for: loadHTML');
          clearInterval(dependencies_met_data_loaded);
        } // END dependencies_met_data_loaded
      }, 25);
    }, // END init

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
