---
regenerate:                             true
---

{% capture cache %}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/carousel.js
 # Liquid template to adapt J1 Carousel (Owl Carousel V1) Core functions
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2023 Juergen Adams
 #
 # J1 Theme is licensed under the MIT License.
 # See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE.md
 # -----------------------------------------------------------------------------
 # Test data:
 #  {{config | debug}}
 # -----------------------------------------------------------------------------
{% endcomment %}

{% comment %} Liquid procedures
-------------------------------------------------------------------------------- {% endcomment %}

{% comment %} Set global settings
-------------------------------------------------------------------------------- {% endcomment %}
{% assign environment         = site.environment %}
{% assign template_version    = site.version %}
{% assign slider_id           = '' %}

{% comment %} Process YML config data
================================================================================ {% endcomment %}

{% comment %} Set config files
-------------------------------------------------------------------------------- {% endcomment %}
{% assign template_config     = site.data.j1_config %}
{% assign apps                = site.data.apps %}
{% assign modules             = site.data.modules %}

{% comment %} Set config data
-------------------------------------------------------------------------------- {% endcomment %}

{% comment %}
--------------------------------------------------------------------------------
{% assign carousel_defaults   = apps.defaults.carousel.defaults %}
{% assign carousel_settings   = apps.carousel.settings %}
-------------------------------------------------------------------------------- {% endcomment %}

{% assign carousel_defaults   = modules.defaults.carousel.defaults %}
{% assign carousel_settings   = modules.carousel.settings %}

{% comment %} Set config options
-------------------------------------------------------------------------------- {% endcomment %}
{% assign carousel_options    = carousel_defaults | merge: carousel_settings %}

{% comment %} Detect prod mode
-------------------------------------------------------------------------------- {% endcomment %}
{% assign production = false %}
{% if environment == 'prod' or environment == 'production' %}
  {% assign production = true %}
{% endif %}


/*
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/carousel.js
 # JS Adapter for J1 Carousel (Owl Carousel V1)
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2023 Juergen Adams
 #
 # J1 Theme is licensed under the MIT License.
 # See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE.md
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
j1.adapter.carousel = (function (j1, window) {
  var environment   = '{{environment}}';
  var dragging      = false;
  var carouselDefaults;
  var carouselSettings;
  var carouselOptions;
  var _this;
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
      var settings = $.extend({
        module_name: 'j1.adapter.carousel',
        generated:   '{{site.time}}'
      }, options);

      // -----------------------------------------------------------------------
      // Global variable settings
      // -----------------------------------------------------------------------
      _this   = j1.adapter.carousel;
      logger  = log4javascript.getLogger('j1.adapter.carousel');

      // Load  module DEFAULTS|CONFIG
      carouselDefaults = $.extend({},   {{analytics_defaults | replace: 'nil', 'null' | replace: '=>', ':' }});
      carouselSettings = $.extend({},   {{analytics_settings | replace: 'nil', 'null' | replace: '=>', ':' }});
      carouselOptions  = $.extend(true, {}, carouselDefaults, carouselSettings);

      var dependencies_met_page_finished = setInterval(function() {
        var pageState     = $('#no_flicker').css("display");
        var pageVisible   = (pageState == 'block') ? true : false;
        var atticFinished = (j1.adapter.attic.getState() == 'finished') ? true: false;

//      if (j1.getState() == 'finished' && pageVisible) {
        if (j1.getState() == 'finished' && pageVisible && atticFinished) {

          _this.setState('started');
          logger.debug('\n' + 'state: ' + _this.getState());
          logger.info('\n' + 'module is being initialized');

          {% for item in carousel_options.carousel %}

            {% if item.show.enabled %}
              {% assign slider_id     = item.show.id %}
              {% assign slider_title  = item.show.title %}
              {% assign slider_type   = item.show.type %}
              {% assign parallax      = item.show.parallax %}
              {% assign padding       = item.show.padding %}
              {% assign text_color    = item.show.text_color %}
              {% assign font_size     = item.show.font_size %}
              {% assign font_weight   = item.show.font_weight %}
              {% assign background    = item.show.background %}
              {% assign darken        = item.show.darken %}
              {% assign gridify       = item.show.gridify %}
              {% assign lazyLoad      = item.show.lightbox %}

              // Create an Carousel INSTANCE if slider on id: {{slider_id}} exists
              if ($('#{{slider_id}}').length) {

                logText = '\n' + 'slider is being processed on id: #{{slider_id}}';
                logger.info(logText);
                _this.setState('processing');

                {% if item.show.slide_height != null %}
                  // Set slide_height: {{item.show.slide_height}}vh
                  {% assign slide_height  = item.show.slide_height %}
                  $('head').append('<style>.owl-carousel .item{height: {{slide_height}}vh;}</style>');
                {% endif %}

                {% if item.show.slide_space_between %}
                  {% assign slide_space = item.show.slide_space_between %}
                {% else %}
                  {% assign slide_space = 3 %}
                {% endif %}

                {% if item.show.slide_border %}
                  {% assign slide_border = "thumbnail" %}
                {% else %}
                  {% assign slide_border = "" %}
                {% endif %}

                // place HTML markup for the title
                {% if slider_title %}
                var slider_title = '<div class="slider-title">{{slider_title}}</div>';
                $('#{{slider_id}}').before(slider_title);
                {% endif %}

                // set space between the slides
                $('head').append('<style>.{{slider_id}}-item{margin: {{slide_space}}px;}</style>');

                // place additional text carousel styles (border/margin)
                {% unless parallax %} {% if slider_type == 'text' %}
                  $('head').append('<style>#{{slider_id}}{border-left: 3px solid #0072ff;}</style>');
                  // wait until carousel has been initialized
                  var dependency_met_owl_initialized = setInterval (function () {
                    if ($('#{{slider_id}} > .owl-wrapper-outer').length) {
                      {% if font_size %}
                      $('head').append('<style>#{{slider_id}}{font-size:{{font_size}}}</style>');
                      {% else %}
                      $('head').append('<style>#{{slider_id}}{font-size:1.5rem}</style>');
                      {% endif %}

                      {% if font_weight %}
                      $('head').append('<style>#{{slider_id}}{font-weight:{{font_weight}}}</style>');
                      {% else %}
                      $('head').append('<style>#{{slider_id}}{font-weight:400}</style>');
                      {% endif %}

                      $('#{{slider_id}} > .owl-wrapper-outer').addClass('ml-3');
                      clearInterval(dependency_met_owl_initialized);
                    }
                  }, 25); // END dependency_met_owl_initialized
                {% endif %} {% endunless %}

                // place additional parallax styles if enabled
                {% if parallax %}

                  {% if padding %}
                  $('head').append('<style>#{{slider_id}}{padding:{{padding}};position:relative}</style>');
                  {% else %}
                  $('head').append('<style>#{{slider_id}}{padding:50px 0 50px 25px;position:relative}</style>');
                  {% endif %}

                  {% if cover %}
                  $('head').append('<style>#{{slider_id}}{background-size: cover}</style>');
                  {% endif %}

                  {% if background %}
                  $('head').append('<style>#{{slider_id}}{background:url({{background}}) 50% 0 repeat fixed}</style>');
                  {% else %}
                  $('head').append('<style>#{{slider_id}}{background:url(/assets/images/quotes/default.png) 50% 0 repeat fixed}</style>');
                  {% endif %}

                  {% if darken %}
                  $('head').append('<style>#{{slider_id}}:after{top:0;left:0;width:100%;height:100%;content:" ";position:absolute;background:rgba(0,0,0,0.{{darken}})}</style>');
                  {% else %}
                  $('head').append('<style>#{{slider_id}}:after{top:0;left:0;width:100%;height:100%;content:" ";position:absolute;background:rgba(0,0,0,0.2)}</style>');
                  {% endif %}

                  {% if text_color %}
                  $('#{{slider_id}}').addClass('mdi-{{text_color}}');
                  {% else %}
                  $('#{{slider_id}}').addClass('mdi-md-grey-100');
                  {% endif %}

                  {% if font_size %}
                  $('head').append('<style>#{{slider_id}}{font-size:{{font_size}}}</style>');
                  {% else %}
                  $('head').append('<style>#{{slider_id}}{font-size:1.5rem}</style>');
                  {% endif %}

                  {% if font_weight %}
                  $('head').append('<style>#{{slider_id}}{font-weight:{{font_weight}}}</style>');
                  {% else %}
                  $('head').append('<style>#{{slider_id}}{font-weight:400}</style>');
                  {% endif %}

                  {% if gridify %}
                  $('head').append('<style>#{{slider_id}}:before{top:0;left:0;width:100%;height:100%;content:" ";position:absolute;background:url(/assets/images/modules/patterns/gridtile.png) repeat;}</style>');
                  {% endif %}

                {% endif %}

                // Initialize individual show parameters
                /* eslint-disable */
                $('#{{slider_id}}').owlCarousel({
                  {% for option in item.show.options %}
                  {{option[0] | json}}: {{option[1] | json}},
                  {% endfor %}
                  // Enable lazyLoad if lightbox is enabled
                  {% if item.show.lightbox %}
                  "lazyLoad": true,
                  {% endif %}
                  "jsonPath": {{carousel_options.xhr_data_path | json}},
                  "jsonSuccess": customDataSuccess_{{forloop.index}}
                });
                /* eslint-enable */

                // Initialize instance variable (for later access)
                j1['{{slider_id}}'] = $('#{{slider_id}}').data('owlCarousel');

                // custom show data functions (each slide show)
                function customDataSuccess_{{forloop.index}}(data){
                  var content = '';
                  for (var i in data['{{slider_id}}']) {

                    {% if slider_type == 'text' %}
                    var text        = data['{{slider_id}}'][i].text;
                    {% endif %}

                    var href        = data['{{slider_id}}'][i].href;

                    {% if slider_type == 'image' %}
                    var lb          = data['{{slider_id}}'][i].lb;
                    var lb_caption  = data['{{slider_id}}'][i].lb_caption;
                    var img         = data['{{slider_id}}'][i].img;
                    var alt         = data['{{slider_id}}'][i].alt;

                    // if lightbox is enabled (preference over href)
                    if (lb) {

                      if (lb_caption) {

                        content += '\t\t' + '<div class="item {{slider_id}}-item {{slide_border}}">'+ '\n';
                        content += '\t\t\t' + '<a href="' +img+ '" ' + 'data-lightbox="{{slider_id}}" data-title="' +lb_caption+ '">' + '\n';
                        content += '\t\t\t\t' + '<img class="lazyOwl" src="' +img+ '" alt="' +lb_caption+ '">' + '\n';
                        content += '\t\t\t' + ' </a>' + '\n';
                        if (href) {
                        content += '\t\t\t' + '<span id="{{slider_id}}_caption" class="text-start carousel-caption"><a class="md-grey-300 link-no-decoration" href="' +href+ '">' +lb_caption+ ' </a> </span>' + '\n';
                        } else {
                        content += '\t\t\t' + '<span id="{{slider_id}}_caption" class="text-start carousel-caption">' +lb_caption+ '</span>' + '\n';
                        }
                        content += '\t\t' + '</div>' + '\n';
                      } else {
                        // jadams, 2021-03-06: added link text (alt) for search engine optimization (SEO|Google)
                        // content += '<a class="item" href="' +img+ '" ' + 'data-lightbox="{{slider_id}}"> <img class="lazyOwl" data-src="' +img+ '" alt="' +alt+ '">' + ' </a>';
                        //
                        content += '<a class="item link-no-decoration" href="' + img + '" ';
                        content += 'data-lightbox="{{slider_id}}"> <img class="lazyOwl" data-src="' + img;
                        content += '" alt="' +alt+ '">' +alt+ ' </a>';
                      }
                    } else if (href) {
                        content += '<div class="item">' + '<img src="' +img+ '" alt="' +alt+ '">' + '</div>';
                    } else {
                        content += '<div class="item">' + '<img src="' +img+ '" alt="' +alt+ '">' + '</div>';
                    }
                    {% endif %}

                    {% if slider_type == 'text' %}
                    if (href) {
                      content += '<div class="item">' + '<p href=' +href+ '">' +text+ '</p>' + '</div>';
                    } else {
                      content += '<div class="item">' + '<p>' +text+ '</p>' + '</div>';
                    }
                    {% endif %}
                  }
                  $('#{{slider_id}}').html(content);

                  // jadams: managing captions should be adopted from
                  // JustifiedGallery as this simple solution does NOT work
                  // NOTE: Potentially the core of OwlCarousel has to be
                  // changed to manage captions natively
                  // -----------------------------------------------------------
                  // var captionID = '#{{slider_id}}_caption';
                  // $(captionID).hover(
                  //   function(e) {
                  //     $( this ).find( ".carousel-caption" ).show();
                  //     e.stopPropagation();
                  //   }, function(e) {
                  //     $( this ).find( ".carousel-caption" ).hide();
                  //     e.stopPropagation();
                  //   }
                  // );

                  _this.setState('processed');
                  logText = '\n' + 'processing slider finished on id: {{slider_id}}';
                  logger.info(logText);
                } // END customDataSuccess_{{forloop.index}}
              } // END if carousel exists
            {% endif %}
          {% endfor %}

          clearInterval(dependencies_met_page_finished);

          var dependencies_met_sliders_processed = setInterval(function() {
            if (_this.getState() == 'processed') {
              _this.setState('finished');
              logger.debug('\n' + 'state: ' + _this.getState());
              logger.info('\n' + 'initializing module finished');

              clearInterval(dependencies_met_sliders_processed);
            }
          }, 25); // END 'dependencies_met_sliders_processed'
        } // END if j1.getState 'finished'
      }, 25); // END 'dependencies_met_page_finished'
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
    }, // END getState

    // -----------------------------------------------------------------------
    //  Caption text animation (currently NOT used)
    // -----------------------------------------------------------------------

    // -------------------------------------------------------------------------
    // fadeIn()
    // Animation (caption): fadeIn
    // -------------------------------------------------------------------------
    fadeIn: function (id, options) {
      $(id + '.active .caption .fadeIn-1').stop().delay(options.delay)
      .animate({
        opacity:      options.opacity
      }, {
        duration:     options.duration,
        easing:       options.easing
      });
      $(id + '.active .caption .fadeIn-2').stop().delay(options.delay+200)
      .animate({
        opacity:      options.opacity
      }, {
        duration:     options.duration,
          easing:     options.easing
      });
      $(id + '.active .caption .fadeIn-3').stop().delay(options.delay+500)
      .animate({
        opacity:      options.opacity
      }, {
        duration:     options.duration,
        easing:       options.easing
      });
    },

    // -------------------------------------------------------------------------
    // fadeInUp()
    // Animation (caption): fadeInUp
    // -------------------------------------------------------------------------
    fadeInUp: function (id, options) {
      $(id + '.active .caption .fadeInUp-1')
      .stop()
      .delay(options.delay)
      .animate({
        opacity:      options.opacity,
        top:          options.top
      }, {
        duration:     options.duration,
        easing:       options.easing
      });
      $(id + '.active .caption .fadeInUp-2')
      .stop()
      .delay(options.delay+200)
      .animate({
        opacity:      options.opacity,
        top:          options.top
      }, {
        duration: 800,
        easing: 'easeOutCubic'
      });
      $(id + '.active .caption .fadeInUp-3')
      .stop()
      .delay(options.delay+500)
      .animate({
        opacity:      options.opacity,
        top:          options.top
      }, {
        duration:     options.duration,
        easing:       options.easing
      });
    },

    // -------------------------------------------------------------------------
    // fadeInRight()
    // Animation (caption): fadeInRight
    // -------------------------------------------------------------------------
    fadeInRight: function (id, options) {
      $(id + '.active .caption .fadeInRight-1')
      .stop()
      .delay(options.delay)
      .animate({
        opacity:      options.opacity,
        left:         options.left
      }, {
        duration:     options.duration,
        easing:       options.easing
      });
      $(id + '.active .caption .fadeInRight-2')
      .stop()
      .delay(options.delay+200)
      .animate({
        opacity:      options.opacity,
        left:         options.left
      }, {
        duration:     options.duration,
        easing:       options.easing
      });
      $(id + '.active .caption .fadeInRight-3')
      .stop()
      .delay(options.delay+500)
      .animate({
        opacity:      options.opacity,
        left:         options.left
      }, {
        duration:     options.duration,
        easing:       options.easing
      });
    },

    // -------------------------------------------------------------------------
    // fadeInDown()
    // Animation (caption): fadeInDown
    // -------------------------------------------------------------------------
    fadeInDown: function (id, options) {
      $('#item-1').backstretch();
      $(id + '.active .caption .fadeInDown-1')
      .stop()
      .delay(options.delay)
      .animate({
        opacity:      options.opacity,
        top:          options.top
      }, {
        duration:     options.duration,
        easing:       options.easing
      });
      $(id + '.active .caption .fadeInDown-2')
      .stop()
      .delay(options.delay+200)
      .animate({
        opacity:      options.opacity,
        top:          options.top
      }, {
        duration:     options.duration,
        easing:       options.easing
      });
      $(id + '.active .caption .fadeInDown-3')
      .stop()
      .delay(options.delay+500)
      .animate({
        opacity:      options.opacity,
        top:          options.top
      }, {
        duration:     options.duration,
        easing:       options.easing
      });
    },

    // -------------------------------------------------------------------------
    // fadeInLeft()
    // Animation (caption): fadeInLeft
    // -------------------------------------------------------------------------
    fadeInLeft: function (id, options) {
      $('#item-2').backstretch();
      $(id + '.active .caption .fadeInLeft-1')
      .stop()
      .delay(500)
      .animate({
        opacity:      options.opacity,
        top:          options.left
      }, {
        duration:     options.duration,
        easing:       options.easing
      });
      $(id + '.active .caption .fadeInLeft-2')
      .stop()
      .delay(700)
      .animate({
        opacity:      options.opacity,
        top:          options.left
      }, {
        duration:     options.duration,
        easing:       options.easing
      });
      $(id + '.active .caption .fadeInLeft-3')
      .stop()
      .delay(1000)
      .animate({
        opacity:      options.opacity,
        top:          options.left
      }, {
        duration:     options.duration,
        easing:       options.easing
      });
    },

    // -------------------------------------------------------------------------
    // fadeInReset()
    // Reset animation (caption): fadeIn
    // -------------------------------------------------------------------------
    fadeInReset: function (id, options) {
      if (!options.dragging) {
        $(id + '.caption .fadeIn-1,' +
          id + '.caption .fadeIn-2,' +
          id + '.caption .fadeIn-3')
        .stop()
        .delay(options.delay)
        .animate({
            opacity:  options.opacity
        }, {
            duration: options.duration,
            easing:   options.easing
        });
      } else {
        $(id + '.caption .fadeIn-1,' +
          id + '.caption .fadeIn-2,' +
          id + '.caption .fadeIn-3')
        .css({
            opacity:  options.opacity
        });
      }
    }, // END fadeOut

    // -------------------------------------------------------------------------
    // fadeInUpReset()
    // Reset animation (caption): fadeInUp
    // -------------------------------------------------------------------------
    fadeInUpReset: function (id, options) {
      if (!options.dragging) {
        $(id + '.caption .fadeInUp-1,' +
          id + '.caption .fadeInUp-2,' +
          id + '.caption .fadeInUp-3')
        .stop()
        .delay(options.delay)
        .animate({
            opacity:  options.opacity,
            top:      options.top
        }, {
          duration:   options.duration,
          easing:     options.easing
        });
      } else {
        $(id + '.caption .fadeInUp-1', +
          id + '.caption .fadeInUp-2,' +
          id + '.caption .fadeInUp-3')
        .css({
            opacity:  options.opacity,
            top:      options.top
        });
      }
    }, // END fadeInUpReset

    // -------------------------------------------------------------------------
    // fadeInRightReset()
    // Reset animation (caption): fadeInRight
    // -------------------------------------------------------------------------
    fadeInRightReset: function (id, options) {
      if (!options.dragging) {
        $(id + '.caption .fadeInRight-1,' +
          id + '.caption .fadeInRight-2,' +
          id + '.caption .fadeInRight-3')
        .stop()
        .delay(options.delay)
        .animate({
            opacity:  options.opacity,
            left:     options.left
        }, {
          duration:   options.duration,
          easing:     options.easing
        });
      } else {
        $(id + '.caption .fadeInRight-1,' +
          id + '.caption .fadeInRight-2,' +
          id + '.caption .fadeInRight-3')
        .css({
            opacity:  options.opacity,
            left:     options.left
        });
      }
    }, // END fadeInRightReset

    // -------------------------------------------------------------------------
    // fadeOutDown()
    // Reset animation (caption): fadeInDown
    // -------------------------------------------------------------------------
    fadeInDownReset: function (id, options) {
      if (!options.dragging) {
        $(id + '.caption .fadeInDown-1,' +
          id + '.caption .fadeInDown-2,' +
          id + '.caption .fadeInDown-3')
        .stop()
        .delay(options.delay)
        .animate({
            opacity:  options.opacity,
            top:      options.top
        }, {
            duration: options.duration,
            easing:   options.easing
        });
      } else {
        $(id + '.caption .fadeInDown-1,' +
          id + '.caption .fadeInDown-2,' +
          id + '.caption .fadeInDown-3')
        .css({
            opacity:  options.opacity,
            top:      options.transitionTypes
        });
      }
    }, // END fadeOutDown

    // -------------------------------------------------------------------------
    // fadeInLeftReset()
    // Reset animation (caption): fadeInLeft
    // -------------------------------------------------------------------------
    fadeInLeftReset: function (id, options) {
      if (!options.dragging) {
        $(id + '.caption .fadeInLeft-1,' +
          id + '.caption .fadeInLeft-2,' +
          id + '.caption .fadeInLeft-3')
        .stop()
        .delay(options.delay)
        .animate({
            opacity:  options.opacity,
            left:     options.left
        }, {
          duration:   options.duration,
          easing:     options.easing
        });
      } else {
        $(id + '.caption .fadeInLeft-1,' +
          id + '.caption .fadeInLeft-2,' +
          id + '.caption .fadeInLeft-3')
        .css({
            opacity:  options.opacity,
            left:     options.left
        });
      }
    }, // END fadeInLeftReset

  }; // END return

})(j1, window);

{% endcapture %}
{% if production %}
  {{ cache | minifyJS }}
{% else %}
  {{ cache | strip_empty_lines }}
{% endif %}
{% assign cache = nil %}
