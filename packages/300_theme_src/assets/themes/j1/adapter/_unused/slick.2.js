---
regenerate:                             true
---

{% capture cache %}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/slick.js
 # Liquid template to create the Template Adapter for J1 Slick
 #
 # Product/Info:
 # http://jekyll.one
 #
 # Copyright (C) 2023 Juergen Adams
 #
 # J1 Theme is licensed under the MIT License.
 # For details, see: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE.md
 # -----------------------------------------------------------------------------
 # Test data:
 #  {{ liquid_var | debug }}
 # cookie_options: {{ cookie_options | debug }}
 # -----------------------------------------------------------------------------
{% endcomment %}

{% comment %} Liquid var initialization
-------------------------------------------------------------------------------- {% endcomment %}

{% comment %} Set config files
-------------------------------------------------------------------------------- {% endcomment %}
{% assign environment         = site.environment %}
{% assign blocks              = site.data.blocks %}
{% assign modules             = site.data.modules %}
{% assign template_config     = site.data.j1_config %}

{% comment %} Set config data
-------------------------------------------------------------------------------- {% endcomment %}
{% assign slick_defaults      = modules.defaults.slick.defaults %}
{% assign slick_settings      = modules.slick.settings %}

{% comment %} Set config options
-------------------------------------------------------------------------------- {% endcomment %}

{% comment %} Set variables
-------------------------------------------------------------------------------- {% endcomment %}

{% comment %} Detect prod mode
-------------------------------------------------------------------------------- {% endcomment %}
{% assign production = false %}
{% if environment == 'prod' or environment == 'production' %}
  {% assign production = true %}
{% endif %}

/*
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/slick.js
 # JS Adapter for J1 Slick
 #
 #  Product/Info:
 #  http://jekyll.one
 #
 #  Copyright (C) 2023 Juergen Adams
 #
 #  J1 Theme is licensed under MIT License.
 #  See: https://github.com/jekyll-one/J1 Theme/blob/master/LICENSE
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
'use strict';
j1.adapter.slick = (function (j1, window) {
  var environment               = '{{environment}}';
  var responsiveSettings        = [];
//var sliderResponsiveSettings  = '[' + '\n';
  var _this;
  var logger;
  var logText;
  var slickDefaults;
  var slickSettings;
  var slickOptions;
  var sliderOptions;
  var sliderSettings;
  var sliderResponsiveSettings = [];

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
      var load_dependencies             = {};                                   // dynamic variable
      var xhrLoadState                  = 'pending';                            // (initial) load state for the HTML portion of the slider
      var sliderResponsiveSettingsOBJ   = {};                                   // initial object for responsive settings
      var dependency;
      var sliderResponsiveSettingsYAML;
      var sliderResponsiveSettingsSTRING

      // -----------------------------------------------------------------------
      // Default module settings
      // -----------------------------------------------------------------------
      var settings  = $.extend({
        module_name: 'j1.adapter.cookieConsent',
        generated:   '{{site.time}}'
      }, options);

      // Load  module DEFAULTS|CONFIG
      slickDefaults = $.extend({}, {{slick_defaults | replace: 'nil', 'null' | replace: '=>', ':' }});
      slickSettings = $.extend({}, {{slick_settings | replace: 'nil', 'null' | replace: '=>', ':' }});
      slickOptions  = $.extend(true, {}, slickDefaults, slickSettings);

      // -----------------------------------------------------------------------
      // Global variable settings
      // -----------------------------------------------------------------------
      _this         = j1.adapter.slick;
      logger        = log4javascript.getLogger('j1.adapter.slick');

      _this.setState('started');
      logger.debug('\n' + 'state: ' + _this.getState());
      logger.info('\n' + 'module is being initialized');

      // load HTML portion for all sliders
      console.debug('loading HTML portion for all Slick sliders configured');
      _this.loadSliderHTML(slickOptions, slickOptions.sliders);
      // _this.eventManager();

      // -----------------------------------------------------------------------
      // initializer
      // -----------------------------------------------------------------------
      var dependencies_met_page_ready = setInterval (function (options) {
        var pageState   = $('#no_flicker').css("display");
        var pageVisible = (pageState == 'block') ? true: false;

        if ( j1.getState() === 'finished' && pageVisible ) {

          {% for slider in slick_settings.sliders %} {% if slider.enabled %}
          logger.info('\n' + 'slider is being initialized on id: ' + '{{slider.id}}');

          {% if slider.options.responsive %}
          logger.info('\n' + 'collect responsive settings for slider on id: ' + '{{slider.id}}');
          // collect breakpoint settings from slider config
          responsiveSettings = $.extend({}, {{slider.responsive | replace: 'nil', 'null' | replace: '=>', ':' }});
          // generate slider breakpoint settings as YAML data structure
          sliderResponsiveSettings  = '[' ;
          for (const [obj_key, obj_value] of Object.entries(responsiveSettings)) {
            var length = Object.keys(obj_value.settings).length;
            var count = 0;
            for (const [key, value] of Object.entries(obj_value.settings)) {
              count++;
              if (key == 'breakOn' && count == 1) {
                sliderResponsiveSettings += '  {' ;
                sliderResponsiveSettings += '    breakpoint: ' + value + ',' ;
                sliderResponsiveSettings += '    settings: {' ;
              } else {
                sliderResponsiveSettings += '      ' + key + ': ' + value + ',' ;
              }
              // close current breakpoint element
              if (count == length) {
                sliderResponsiveSettings += '    }' ;
                sliderResponsiveSettings += '  },' ;
              }
            }
          } // End generate breakpoint YAML elements

          // close breakpoint YAML data
          sliderResponsiveSettings += ']';
          {% endif %}

          // create dynamic loader variable|s
          dependency = 'dependencies_met_html_loaded_{{slider.id}}';
          load_dependencies[dependency] = '';

          // initialize slider if HTML portion successfully loaded
          load_dependencies['dependencies_met_html_loaded_{{slider.id}}'] = setInterval (function (options) {
            // check if HTML portion of the slider is loaded successfully (loadSliderHTML)
            xhrLoadState = j1.xhrDOMState['#{{slider.id}}_parent'];
            if ( xhrLoadState === 'success' ) {

              // collect general slider settings
              sliderOptions  = $.extend({}, {{slider.options | replace: 'nil', 'null' | replace: '=>', ':' }});
              sliderSettings = $.extend(true, {}, slickDefaults, sliderOptions );

              // convert slider responsive settings to object (sliderResponsiveSettingsOBJ)
              sliderResponsiveSettingsYAML    = yaml.loadAll(sliderResponsiveSettings, 'utf8');
              sliderResponsiveSettingsOBJ     = sliderResponsiveSettingsYAML[0];
              sliderResponsiveSettingsSTRING  = JSON.stringify(sliderResponsiveSettingsOBJ, null, 4);

              logger.debug('\n' + 'responsive settings on id #{{slider.id}}: ' + '\n' + sliderResponsiveSettingsSTRING);

              // add required space ABOVE the slider
              // if (sliderSettings.arrows) {
              //   $('#{{slider.id}}_parent').addClass('slick-arrows');
              // }

              $('.{{slider.selector}}').on('init', function(event, slick) {
                logger.info('\n' + 'slider initialized on id: {{slider.id}}');
                if ({{slider.lightbox.enabled}}) {
                  logger.info('\n' + 'initialize lightbox on id: {{slider.id}}');
                  $('#{{slider.id}}').slickLightbox({
                    src:            '{{slider.lightbox.src}}',
                    itemSelector:   '{{slider.lightbox.itemSelector}}'
                  });
                }
              });

              logger.info('\n' + 'slider is being setup on id: ' + '{{slider.id}}');
              // setup the slider
              $('.{{slider.selector}}').slick({
                accessibility:              sliderSettings.accessibility,
                adaptiveHeight:             sliderSettings.adaptiveHeight,
                arrows:                     sliderSettings.arrows,
                autoplay:                   sliderSettings.autoplay,
                autoplaySpeed:              sliderSettings.autoplaySpeed,
                centerMode:                 sliderSettings.centerMode,
                centerPadding:              sliderSettings.centerPadding,
                cssEase:                    sliderSettings.cssEase,
                dots:                       sliderSettings.dots,
                dotsClass:                  sliderSettings.dotsClass,
                draggable:                  sliderSettings.draggable,
                easing:                     sliderSettings.easing,
                edgeFriction:               sliderSettings.edgeFriction,
                fade:                       sliderSettings.fade,
                focusOnSelect:              sliderSettings.focusOnSelect,
                focusOnChange:              sliderSettings.focusOnChange,
                infinite:                   sliderSettings.infinite,
                initialSlide:               sliderSettings.initialSlide,
                lazyLoad:                   sliderSettings.lazyLoad,
                mobileFirst:                sliderSettings.mobileFirst,
                pauseOnDotsHover:           sliderSettings.pauseOnDotsHover,
                pauseOnFocus:               sliderSettings.pauseOnFocus,
                pauseOnHover:               sliderSettings.pauseOnHover,
                respondTo:                  sliderSettings.respondTo,
                rows:                       sliderSettings.rows,
                rtl:                        sliderSettings.rtl,
                slide:                      sliderSettings.slide,
                slidesPerRow:               sliderSettings.slidesPerRow,
                slidesToScroll:             sliderSettings.slidesToScroll,
                slidesToShow:               sliderSettings.slidesToShow,
                speed:                      sliderSettings.speed,
                swipe:                      sliderSettings.swipe,
                swipeToSlide:               sliderSettings.swipeToSlide,
                touchMove:                  sliderSettings.touchMove,
                touchThreshold:             sliderSettings.touchThreshold,
                useCSS:                     sliderSettings.useCSS,
                useTransform:               sliderSettings.useTransform,
                variableWidth:              sliderSettings.variableWidth,
                vertical:                   sliderSettings.vertical,
                verticalSwiping:            sliderSettings.verticalSwiping,
                waitForAnimate:             sliderSettings.waitForAnimate,
                zIndex:                     sliderSettings.zIndex,
                responsive:                 sliderResponsiveSettingsOBJ
              });
              clearInterval(load_dependencies['dependencies_met_html_loaded_{{slider.id}}']);
            }
          }, 25); // END
          {% endif %} {% endfor %} // ENDFOR (all) sliders

          _this.setState('finished');
          logger.debug('\n' + 'state: ' + _this.getState());
          logger.info('\n' + 'module initialization finished');

          clearInterval(dependencies_met_page_ready);

        }
      }, 25);

    }, // END init

    // -------------------------------------------------------------------------
    // eventManager()
    // load all master sliders (HTML portion) dynanically configured
    // and enabled (AJAX) from data file
    // NOTE: Make sure the placeholder is available in the content page
    // eg. using the asciidoc extension masterslider::
    // -------------------------------------------------------------------------
    eventManager: function () {

      // window.onload = function() {
      //   var $buttons = $(":button");
      //   if ($buttons.length) {
      //     $.each( $buttons, function(index, value) {
      //       if (value.className.includes('slick-prev')) {
      //         logger.info('\n' + 'button found on load: ' + index + ': ' + value.offsetParent.id );
      //       }
      //     });
      //   }
      // };

      window.addEventListener('resize', function(event) {

        setTimeout (function() {
          var $buttons      = $(':button');
          var $slider       = $('.slider-parent');

          if ($slider.length) {
            $.each( $slider, function(index, value) {
              var slider_button = false;

              if ($buttons.length) {
                $.each( $buttons, function(index, value) {
                  if (value.className.includes('slick-prev')) {
                    // logger.info('\n' + 'button found on resize: ' + index + ': ' + value.offsetParent.id );
                    slider_button = true;
                  }
                });
              }

//            if (value.className.includes('slick-arrows') && slider_button) {
              if (slider_button) {
                logger.info('\n' + 'slider with button found on resize for id: ' + value.id);
                $('#' + value.id).addClass('slick-arrows');
              } else {
                logger.info('\n' + 'remove class on resize for id: ' + value.id);
                $('#' + value.id).removeClass('slick-arrows');
              }
            });
          }

          // if ($buttons.length) {
          //   $.each( $buttons, function(index, value) {
          //     if (value.className.includes('slick-prev')) {
          //       logger.info('\n' + 'button found on resize: ' + index + ': ' + value.offsetParent.id );
          //     }
          //   });
          // }

        }, 1000);
      });
    },

    // -------------------------------------------------------------------------
    // loadSliderHTML()
    // load all master sliders (HTML portion) dynanically configured
    // and enabled (AJAX) from data file
    // NOTE: Make sure the placeholder is available in the content page
    // eg. using the asciidoc extension masterslider::
    // -------------------------------------------------------------------------
    loadSliderHTML: function (options, slider) {
      var numSliders      = Object.keys(slider).length;
      var active_sliders  = numSliders;
      var xhr_data_path   = options.xhr_data_path + '/index.html';
      var xhr_container_id;

      // console.debug('load HTML portion of all sliders configured found in page');
      console.debug('number of Slick sliders found: ' + numSliders);

      _this.setState('load_data');
      Object.keys(slider).forEach(function(key) {
        if (slider[key].enabled) {
          console.debug('load HTML data on Slick slider id: ' + slider[key].id);

          xhr_container_id = slider[key].id + '_parent';
          j1.loadHTML({
            xhr_container_id: xhr_container_id,
            xhr_data_path:    xhr_data_path,
            xhr_data_element: slider[key].id
          });
        } else {
          console.debug('Slick slider found disabled on id: ' + slider[key].id);
          active_sliders--;
        }
      });
      console.debug('Slick sliders loaded in page enabled|all: ' + active_sliders + '|' + numSliders);
      _this.setState('data_loaded');
    }, // END loadSliderHTML

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
    }, // END getState

  }; // END return
})(j1, window);

{% endcapture %}
{{ cache | strip_empty_lines }}
{% assign cache = nil %}
