---
regenerate:                             false
---

{% capture cache %}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/masterslider.js
 # Liquid template to adapt Averta MasterSlider Lite 2.85.13 (Feb 2022)
 #
 # Product/Info:
 # https://jekyll.one
 # Copyright (C) 2022 Juergen Adams
 #
 # J1 Theme is licensed under the MIT License.
 # For details, see: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE.md
 # -----------------------------------------------------------------------------
 # Test data:
 #  {{ liquid_var | debug }}
 # -----------------------------------------------------------------------------
{% endcomment %}

{% comment %} Liquid var initialization
-------------------------------------------------------------------------------- {% endcomment %}

{% comment %} Set config files
-------------------------------------------------------------------------------- {% endcomment %}
{% assign template_config     = site.data.j1_config %}
{% assign modules             = site.data.modules %}

{% comment %} Set config data
-------------------------------------------------------------------------------- {% endcomment %}
{% assign slider_defaults     = modules.defaults.masterslider.defaults %}
{% assign slider_settings     = modules.masterslider.settings %}

{% comment %} Set config options
-------------------------------------------------------------------------------- {% endcomment %}
{% assign sliders             = slider_settings.sliders %}

/*
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/masterslider.js
 # J1 Adapter for Averta MasterSlider Lite v2.50.0 (Aug 2016)
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2022 Juergen Adams
 #
 # J1 Theme is licensed under the MIT License.
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
j1.adapter.masterslider = (function (j1, window) {

  {% comment %} Set global variables
  ------------------------------------------------------------------------------ {% endcomment %}
  var environment   = '{{environment}}';
  var sliderOptions = {};
  var sliders       = {};
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

      j1.masterslider           = {};
      j1.masterslider.instances = [];

      // -----------------------------------------------------------------------
      // Default module settings
      // -----------------------------------------------------------------------
      var settings = $.extend({
        module_name: 'j1.adapter.masterslider',
        generated:   '{{site.time}}'
      }, options);

      sliderOptions = $.extend({}, {{slider_defaults | replace: 'nil', 'null' | replace: '=>', ':' }});
      sliders       = $.extend({}, {{sliders | replace: 'nil', 'null' | replace: '=>', ':' }});

      // -----------------------------------------------------------------------
      // Global variable settings
      // -----------------------------------------------------------------------
      _this   = j1.adapter.masterslider;
      logger  = log4javascript.getLogger('j1.adapter.masterslider');

      // initialize state flag
      _this.setState('started');
      logger.debug('\n' + 'state: ' + _this.getState());
      logger.info('\n' + 'module is being initialized');

      _this.loadSliderHTML(sliderOptions, sliders);
      _this.initializeSliders(sliderOptions, sliders, true /* save_config */);

    }, // END init

    // -------------------------------------------------------------------------
    // postActionSliders()
    // load all master sliders (HTML portion) dynanically configured
    // -------------------------------------------------------------------------
    postActionSliders: function (options, slider) {
      var settings  = $.extend(options, slider);
      var setup     = {};

      var i=0;
      Object.keys(slider).forEach(function(key) {
        i++;

        if (slider[key].enabled) {
          logger.info('\n' + 'run slider post actions');
          setup = $.extend(settings.options, slider[key].options);

          if (setup.layout == 'partialview') {
            window.setTimeout(function() {
              logger.info('\n' + 'modify layout partialview on id: ' + slider[key].id);
              // $('#' + slider[key].id).addClass('ms-layout-partialview');
              _this["masterslider_" + i].setup(slider[key].id, setup);
            }, 15000);
          } else {
            logger.debug('\n' + 'slider found disabled on id: ' + slider[key].id);
          }
        }
      });
    }, // END postActionSliders

    // -------------------------------------------------------------------------
    // loadSliderHTML()
    // load all master sliders (HTML portion) dynanically configured
    // and enabled (AJAX) from data file
    // NOTE: Make sure the placeholder is available in the content page
    // eg. using the asciidoc extension masterslider::
    // -------------------------------------------------------------------------
    loadSliderHTML: function (options, slider) {
      var numSliders          = Object.keys(slider).length;
      var xhr_data_path       = options.xhr_data_path + '/index.html';
      var xhr_container_id;

      console.debug('load HTML portion of all sliders configured found in page');
      console.debug('number of sliders found: ' + numSliders);

      _this.setState('load_data');

      Object.keys(slider).forEach(function(key) {
        if (slider[key].enabled) {
          console.debug('load HTML data on slider id: ' + slider[key].id);

          xhr_container_id = 'p_' + slider[key].id;
          j1.loadHTML({
            xhr_container_id: xhr_container_id,
            xhr_data_path:    xhr_data_path,
            xhr_data_element: sliders[key].id
          });
        } else {
          console.debug('slider found disabled on id: ' + slider[key].id);
          numSliders--;
        }
      });
      console.debug('number of sliders loaded found in page: ' + numSliders);
      _this.setState('data_loaded');
    }, // END loadSliderHTML

    // -------------------------------------------------------------------------
    // initializeSliders()
    // initialze all master sliders found in page
    // -------------------------------------------------------------------------
    initializeSliders: function (options, slider, save_config) {

      function setupControls(options, slider) {

        // Slider 1
        //--------------------------------------------------------------------
        // slider setup
        // _this.masterslider_1.setup('ms_00001', {
        //   width:                1200,
        //   height:               600,
        //   minHeight:            0,
        //   space:                0,
        //   start:                1,
        //   grabCursor:           true,
        //   swipe:                true,
        //   mouse:                true,
        //   keyboard:             false,
        //   layout:               'boxed',
        //   wheel:                false,
        //   autoplay:             false,
        //   instantStartLayers:   false,
        //   mobileBGVideo:        false,
        //   loop:                 false,
        //   shuffle:              false,
        //   preload:              0,
        //   heightLimit:          true,
        //   autoHeight:           false,
        //   smoothHeight:         true,
        //   endPause:             false,
        //   overPause:            true,
        //   fillMode:             'fill',
        //   centerControls:       true,
        //   startOnAppear:        false,
        //   layersMode:           'center',
        //   autofillTarget:       '',
        //   hideLayers:           false,
        //   fullscreenMargin:     0,
        //   speed:                20,
        //   dir:                  'h',
        //   responsive:           true,
        //   tabletWidth:          768,
        //   tabletHeight:         null,
        //   phoneWidth:           480,
        //   phoneHeight:          null,
        //   sizingReference:      window,
        //   parallaxMode:         'swipe',
        //   view:                 'basic'
        // });
        //
        // if (save_config) {
        //   // save slider config for later access
        //   j1.masterslider.instances.push(_this.masterslider_1);
        // }



        // Slider 2
        //--------------------------------------------------------------------
        // slider setup
        // _this.masterslider_2.setup('ms_00002', {
        //   width:                1200,
        //   height:               600,
        //   minHeight:            0,
        //   space:                0,
        //   start:                1,
        //   grabCursor:           true,
        //   swipe:                true,
        //   mouse:                true,
        //   keyboard:             false,
        //   layout:               'fullwidth',
        //   wheel:                false,
        //   autoplay:             false,
        //   instantStartLayers:   false,
        //   mobileBGVideo:        false,
        //   loop:                 false,
        //   shuffle:              false,
        //   preload:              0,
        //   heightLimit:          true,
        //   autoHeight:           false,
        //   smoothHeight:         true,
        //   endPause:             false,
        //   overPause:            true,
        //   fillMode:             'fill',
        //   centerControls:       true,
        //   startOnAppear:        false,
        //   layersMode:           'center',
        //   autofillTarget:       '',
        //   hideLayers:           false,
        //   fullscreenMargin:     0,
        //   speed:                20,
        //   dir:                  'h',
        //   responsive:           true,
        //   tabletWidth:          768,
        //   tabletHeight:         null,
        //   phoneWidth:           480,
        //   phoneHeight:          null,
        //   sizingReference:      window,
        //   parallaxMode:         'swipe',
        //   view:                 'basic'
        // });
        //
        // if (save_config) {
        //   // save slider config for later access
        //   j1.masterslider.instances.push(_this.masterslider_2);
        // }


        // Slider 3
        //--------------------------------------------------------------------
        // slider controls
        _this.masterslider_3.control(
          'slideinfo', {
            autohide:             false,
            overVideo:            true,
            dir:                  'h',
            align:                'bottom',
            inset:                false,
            margin:               -120
          }
        );

        // slider setup
        // _this.masterslider_3.setup("ms_00003", {
        // 	width:                  1200,
        // 	height:                 500,
        // 	minHeight:              0,
        // 	space:                  0,
        // 	start:                  1,
        // 	grabCursor:             true,
        // 	swipe:                  true,
        // 	mouse:                  true,
        // 	keyboard:               false,
        // 	layout:                 "boxed",
        // 	wheel:                  false,
        // 	autoplay:               false,
        //   instantStartLayers:     false,
        // 	mobileBGVideo:          false,
        // 	loop:                   true,
        // 	shuffle:                false,
        // 	preload:                0,
        // 	heightLimit:            true,
        // 	autoHeight:             false,
        // 	smoothHeight:           true,
        // 	endPause:               false,
        // 	overPause:              true,
        // 	fillMode:               "fill",
        // 	centerControls:         true,
        // 	startOnAppear:          false,
        // 	layersMode:             "center",
        // 	autofillTarget:         "",
        // 	hideLayers:             false,
        // 	fullscreenMargin:       0,
        // 	speed:                  20,
        // 	dir  :                  "h",
        // 	responsive:             true,
        // 	tabletWidth:            768,
        // 	tabletHeight:           null,
        // 	phoneWidth:             480,
        // 	phoneHeight:            null,
        // 	sizingReference :       window,
        // 	parallaxMode:           'swipe',
        // 	view :                  "basic",
        //   filters: {
        //       grayscale:          1,
        //       opacity:            0.5,
        //       brightness:         2
        //   }
        // });
        //
        // if (save_config) {
        //   // save slider config for later access
        //   j1.masterslider.instances.push(_this.masterslider_3);
        // }

        // Slider 4
        //--------------------------------------------------------------------
        // slider controls
        _this.masterslider_4.control(
          'arrows', {
            autohide:false,
            overVideo:true
        });
        _this.masterslider_4.control(
          'bullets', {
            autohide:false,
            overVideo:true,
            dir:'h',
            align:'bottom',
            space:5,
            margin:10
        });
        _this.masterslider_4.control(
          'thumblist', {
            autohide:false,
            overVideo:true,
            dir:'v',
            speed:17,
            inset:false,
            arrows:false,
            hover:false,
            customClass:'',
            align:'right',
            type:'thumbs',
            margin:1,
            width:100,
            height:80,
            space:1,
            fillMode:'fill'
        });
        _this.masterslider_4.control(
          'scrollbar',  {
            autohide:true,
            overVideo:true,
            dir:'h',
            inset:true,
            align:'top',
            color:'#404040',
            margin:10,
            width:4
        });

        // slider setup
        // _this.masterslider_4.setup("ms_00004", {
        //   width:            890,
        // 	height:           480,
        // 	minHeight:        0,
        // 	space :            0,
        // 	start :            1,
        // 	grabCursor:       true,
        // 	swipe :            true,
        // 	mouse :            true,
        // 	keyboard :        false,
        // 	layout:            "boxed",
        // 	wheel :            false,
        // 	autoplay :        false,
        //   instantStartLayers:false,
        // 	mobileBGVideo:false,
        // 	loop  :            false,
        // 	shuffle  :        false,
        // 	preload  :        0,
        // 	heightLimit:      true,
        // 	autoHeight:       false,
        // 	smoothHeight:     true,
        // 	endPause :        false,
        // 	overPause:        true,
        // 	fillMode :        "fill",
        // 	centerControls  : false,
        // 	startOnAppear   : false,
        // 	layersMode:       "center",
        // 	autofillTarget  : "",
        // 	hideLayers:       false,
        // 	fullscreenMargin: 0,
        // 	speed :            20,
        // 	dir   :            "h",
        // 	responsive:       true,
        // 	tabletWidth:      768,
        // 	tabletHeight:     null,
        // 	phoneWidth:       480,
        // 	phoneHeight:     null,
        // 	sizingReference : window,
        // 	parallaxMode:     'swipe',
        // 	view  :            "basic"
        // });
        //
        // if (save_config) {
        //   // save slider config for later access
        //   j1.masterslider.instances.push(_this.masterslider_4);
        // }

        // Slider 5
        //--------------------------------------------------------------------
        // slider controls
        _this.masterslider_5.control('arrows', {
          autohide:false,
          overVideo:true
        });
        _this.masterslider_5.control(
          'bullets', {
            autohide:false,
            overVideo:true,
            dir:'h',
            align:'bottom',
            space:5,
            margin:10
        });
        _this.masterslider_5.control(
          'thumblist', {
            autohide:false,
            overVideo:true,
            dir:'h',
            speed:17,
            inset:false,
            arrows:false,
            hover:false,
            customClass:'',
            align:'bottom',
            type:'thumbs',
            margin:5,
            width:140,
            height:80,
            space:5,
            fillMode:'fill'
        });

        // // slider setup
        // _this.masterslider_5.setup("ms_00005", {
        // 	width :            1200,
        // 	height:            530,
        // 	minHeight:        0,
        // 	space :            0,
        // 	start :            1,
        // 	grabCursor:       true,
        // 	swipe :            true,
        // 	mouse :            true,
        // 	keyboard :        false,
        // 	layout:            "boxed",
        // 	wheel :            false,
        // 	autoplay :        false,
        //   instantStartLayers:false,
        // 	mobileBGVideo:false,
        // 	loop  :            false,
        // 	shuffle  :        false,
        // 	preload  :        0,
        // 	heightLimit:      true,
        // 	autoHeight:       false,
        // 	smoothHeight:     true,
        // 	endPause :        false,
        // 	overPause:        true,
        // 	fillMode :        "fill",
        // 	centerControls  : true,
        // 	startOnAppear   : false,
        // 	layersMode:       "center",
        // 	autofillTarget  : "",
        // 	hideLayers:       false,
        // 	fullscreenMargin: 0,
        // 	speed :            20,
        // 	dir   :            "h",
        // 	responsive:       true,
        // 	tabletWidth:      768,
        // 	tabletHeight:     null,
        // 	phoneWidth:       480,
        // 	phoneHeight:     null,
        // 	sizingReference : window,
        // 	parallaxMode:     'swipe',
        // 	view  :            "basic"
        // });
        //
        // if (save_config) {
        //   // save slider config for later access
        //   j1.masterslider.instances.push(_this.masterslider_5);
        // }

        // Slider 6
        //--------------------------------------------------------------------
        // slider controls
        _this.masterslider_6.control(
          'slideinfo', {
            autohide:       false,
            overVideo:      true,
            dir:            'h',
            align:          'bottom',
            inset:          false,
            margin:         -110
        });

        // slider setup
        // _this.masterslider_6.setup("ms_00006", {
        // 	layout: "partialview"
        // });

        _this.masterslider_6.setup("ms_00006", {
          width :            450,
          height:            220,
          minHeight:        0,
          space :            0,
          start :            1,
          grabCursor:       true,
          swipe :            true,
          mouse :            true,
          keyboard :        false,
          layout:            "partialview",
          wheel :            false,
          autoplay :        false,
          instantStartLayers:false,
          mobileBGVideo:false,
          loop  :            true,
          shuffle  :        false,
          preload  :        0,
          heightLimit:      true,
          autoHeight:       false,
          smoothHeight:     true,
          endPause :        false,
          overPause:        true,
          fillMode :        "fill",
          centerControls  : true,
          startOnAppear   : false,
          layersMode:       "center",
          autofillTarget  : "",
          hideLayers:       false,
          fullscreenMargin: 0,
          speed :            20,
          dir   :            "h",
          responsive:       true,
          tabletWidth:      768,
          tabletHeight:     null,
          phoneWidth:       480,
          phoneHeight:     null,
          sizingReference : window,
          parallaxMode:     'swipe',
          view  :            "fadeBasic"
        });

        // if (save_config) {
        //   // save slider config for later access
        //   j1.masterslider.instances.push(_this.masterslider_6);
        // }


        // Slider 7
        //--------------------------------------------------------------------
        // slider controls
        _this.masterslider_7.control(
          'arrows', {
            autohide:true,
            overVideo:true
        });
        _this.masterslider_7.control(
          'circletimer', {
            autohide:false,
            overVideo:true,
            color:'#FFFFFF',
            radius:4,
            stroke:9
        });
        _this.masterslider_7.control(
          'slideinfo', {
            autohide:false,
            overVideo:true,
            dir:'h',
            align:'bottom',
            inset:false,
            margin:20
        });

        // slider setup
        // _this.masterslider_7.setup("ms_00007", {
        // 	width :            700,
        // 	height:            350,
        // 	minHeight:        0,
        // 	space :            10,
        // 	start :            1,
        // 	grabCursor:       true,
        // 	swipe :            true,
        // 	mouse :            true,
        // 	keyboard :        false,
        // 	layout:            "partialview",
        // 	wheel :            false,
        // 	autoplay :        false,
        //   instantStartLayers:false,
        // 	mobileBGVideo:false,
        // 	loop  :            true,
        // 	shuffle  :        false,
        // 	preload  :        0,
        // 	heightLimit:      true,
        // 	autoHeight:       false,
        // 	smoothHeight:     true,
        // 	endPause :        false,
        // 	overPause:        true,
        // 	fillMode :        "fill",
        // 	centerControls  : true,
        // 	startOnAppear   : false,
        // 	layersMode:       "center",
        // 	autofillTarget  : "",
        // 	hideLayers:       false,
        // 	fullscreenMargin: 0,
        // 	speed :            20,
        // 	dir   :            "h",
        // 	responsive:       true,
        // 	tabletWidth:      768,
        // 	tabletHeight:     null,
        // 	phoneWidth:       480,
        // 	phoneHeight:     null,
        // 	sizingReference : window,
        // 	parallaxMode:     'swipe',
        // 	view  :            "fadeFlow"
        // });
        //
        // if (save_config) {
        //   // save slider config for later access
        //   j1.masterslider.instances.push(_this.masterslider_7);
        // }

      } // END setupControls

      function setupSliders(options, slider, save_config) {

        // run slider setup
        var i=0;
        Object.keys(slider).forEach(function(key) {
          i++;
          if (slider[key].enabled) {
            logger.info('\n' + 'slider is being initialized on id: ' + slider[key].id);

            _this["masterslider_" + i] = new MasterSlider();

            setup = $.extend(settings.options, slider[key].options );
            _this["masterslider_" + i].setup(slider[key].id, setup);

            if (save_config) {
              // save slider config for later access
              j1.masterslider.instances.push(_this["masterslider_" + i]);
            }

            if (setup.layout == 'partialview') {
              $('#' + slider[key].id).addClass('ms-layout-partialview');
            }

          } else {
            logger.debug('\n' + 'slider found disabled on id: ' + slider[key].id);
            numSliders--;
          }
        });

      } // END setupSliders

      var settings  = $.extend(options, slider);
      var setup     = {};
      var log_text;

      var dependencies_met_j1_finished = setInterval(function() {
        if (_this.getState() == 'data_loaded' && j1.getState() == 'finished') {
          window.masterslider_instances = window.masterslider_instances || [];

          // initialize state flag
          _this.setState('initialize_sliders');
          logger.debug('\n' + 'state: ' + _this.getState());
          logger.info('\n' + 'module is being initialized');

          log_text = '\n' + 'sliders are being initialized';
          logger.info(log_text);

          setupControls(options, slider);
          setupSliders(options, slider, save_config);

          // _this.postActionSliders(sliderOptions, sliders);


          _this.setState('finished');
          logger.debug('\n' + 'state: ' + _this.getState());
          logger.info('\n' + 'initializing sliders finished');
          clearInterval(dependencies_met_j1_finished);
        } // END dependencies_met_j1_finished
      }, 25);

    }, // END initializeSliders

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
