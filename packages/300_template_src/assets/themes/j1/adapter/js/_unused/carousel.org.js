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
 # Copyright (C) 2021 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # See: https://github.com/jekyll-one-org/J1 Template/blob/master/LICENSE
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

{% assign production = false %}
{% if environment == 'prod' or environment == 'production' %}
  {% assign production = true %}
{% endif %}


{% comment %} Process YML config data
================================================================================ {% endcomment %}

{% comment %} Set config files
-------------------------------------------------------------------------------- {% endcomment %}
{% assign template_config     = site.data.j1_config %}
{% assign apps                = site.data.apps %}

{% comment %} Set config data
-------------------------------------------------------------------------------- {% endcomment %}
{% assign carousel_defaults   = apps.defaults.carousel.defaults %}
{% assign carousel_settings   = apps.carousel.settings %}

{% comment %} Set config options
-------------------------------------------------------------------------------- {% endcomment %}
{% assign carousel_options    = carousel_defaults | merge: carousel_settings %}

/*
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/carousel.js
 # JS Adapter for J1 Carousel (Owl Carousel V1)
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2021 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # See: https://github.com/jekyll-one-org/J1 Template/blob/master/LICENSE
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

{% comment %} Main
--------------------------------------------------------------- {% endcomment %}
j1.adapter['carousel'] = (function (j1, window) {
  var environment   = '{{environment}}';
  var moduleOptions = {};
  var _this;
  var logger;
  var logText;
  var dragging      = false;

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
      // globals
      // -----------------------------------------------------------------------
      _this   = j1.adapter.carousel;
      logger  = log4javascript.getLogger('j1.adapter.carousel');

      // initialize state flag
      _this.state = 'pending';

      // -----------------------------------------------------------------------
      // Default module settings
      // -----------------------------------------------------------------------
      var settings = $.extend({
        module_name: 'j1.adapter.carousel',
        generated:   '{{site.time}}'
      }, options);

      {% comment %} Load module config from yml data
      -------------------------------------------------------------------------- {% endcomment %}
      // Load  module DEFAULTS|CONFIG
      /* eslint-disable */
      moduleOptions = $.extend({}, {{carousel_options | replace: '=>', ':' | replace: 'nil', '""'}});
      /* eslint-enable */

      if (typeof settings !== 'undefined') {
        moduleOptions = j1.mergeData(moduleOptions, settings);
      }

      _this.setState('started');
      logger.info('state: ' + _this.getState());
      logger.info('module is being initialized');

      var dependencies_met_page_finished = setInterval(function() {
        if (j1.getState() == 'finished') {

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

                {% if environment == 'development' %}
                  logText = 'slider is being initialized on id: #{{slider_id}}';
                  logger.info(logText);
                  _this.setState('running');
                  logger.info('state: ' + _this.getState());
                  logger.info('module is being initialized');
                {% endif %}

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
                        content += '\t\t\t' + '<span class="carousel-caption"><a href="' +href+ '">' +lb_caption+ ' </a> </span>' + '\n';
                        } else {
                        content += '\t\t\t' + '<span class="carousel-caption">' +lb_caption+ '</span>' + '\n';
                        }
                        content += '\t\t' + '</div>' + '\n';
                      } else {
                        // jadams, 2021-03-06: added link text (alt) for search engine optimization (SEO|Google)
                        // content += '<a class="item" href="' +img+ '" ' + 'data-lightbox="{{slider_id}}"> <img class="lazyOwl" data-src="' +img+ '" alt="' +alt+ '">' + ' </a>';
                        //
                        content += '<a class="item" href="' + img + '" ';
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
                  logText = 'initializing slider finished on id: {{slider_id}}';
                  logger.info(logText);
                } // END customDataSuccess_{{forloop.index}}
              } // END if carousel exists
            {% endif %}
          {% endfor %}
          clearInterval(dependencies_met_page_finished);
        }
        _this.setState('finished');
        logger.info('state: ' + _this.getState());
        logger.info('initializing module finished');
      }, 25); // END 'dependencies_met_adapter_finished'
    }, // END init

    // -------------------------------------------------------------------------
    // messageHandler: MessageHandler for J1 CookieConsent module
    // Manage messages send from other J1 modules
    // -------------------------------------------------------------------------
    messageHandler: function (sender, message) {
      var json_message = JSON.stringify(message, undefined, 2);

      logText = 'received message from ' + sender + ': ' + json_message;
      logger.debug(logText);

      // -----------------------------------------------------------------------
      //  Process commands|actions
      // -----------------------------------------------------------------------
      if (message.type === 'command' && message.action === 'module_initialized') {
        //
        // Place handling of command|action here
        //
        logger.info(message.text);
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
