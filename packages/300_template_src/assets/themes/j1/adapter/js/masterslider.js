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
 # J1 Template is licensed under the MIT License.
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
j1.adapter.masterslider = (function (j1, window) {

  {% comment %} Set global variables
  ------------------------------------------------------------------------------ {% endcomment %}
  var environment   = '{{environment}}';
  var moduleOptions = {};
  var sliders       = {};
  var slider        = {};
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
        module_name: 'j1.adapter.masterslider',
        generated:   '{{site.time}}'
      }, options);

      moduleOptions = $.extend({}, {{slider_defaults | replace: 'nil', 'null' | replace: '=>', ':' }});
      sliders       = $.extend({}, {{sliders | replace: 'nil', 'null' | replace: '=>', ':' }});

      // -----------------------------------------------------------------------
      // Global variable settings
      // -----------------------------------------------------------------------
      _this   = j1.adapter.masterslider;
      logger  = log4javascript.getLogger('j1.adapter.masterslider');

      _this.loadSliderHTML(sliders);
      _this.initializeSliders();

    }, // END init

    // -------------------------------------------------------------------------
    // loadSliderHTML()
    // ?????
    // -------------------------------------------------------------------------
    loadSliderHTML: function (sliders) {
      var numSliders = Object.keys(sliders).length;

      // var log_text = '\n' + 'Sliders are being loaded';
      // logger.info(log_text);

      console.log('number of sliders found: ' + numSliders);

      Object.keys(sliders).forEach(function(key) {
        if (sliders[key].enabled) {
          console.log('load slider id: ' + sliders[key].id);
        } else {
          numSliders--;
        }
      });

      console.log('number of sliders loaded: ' + numSliders);

    }, // END loadSliderHTML

    // -------------------------------------------------------------------------
    // initializeSliders()
    // ????
    // -------------------------------------------------------------------------
    initializeSliders: function () {
      var log_text;

      var dependencies_met_j1_finished = setInterval(function() {
        if (j1.getState() == 'finished') {

          // initialize state flag
          _this.setState('started');
          logger.debug('\n' + 'state: ' + _this.getState());
          logger.info('\n' + 'module is being initialized');

          log_text = '\n' + 'sliders are being initialized';
          logger.info(log_text);

          window.masterslider_instances = window.masterslider_instances || [];

          // Slider 1
          //--------------------------------------------------------------------
          var masterslider_1 = new MasterSlider();

          // masterslider_1.control('arrows', {
          //   autohide:             false,
          //   overVideo:            true
          // });

          // slider setup
          masterslider_1.setup('ms_00001', {
            width:                1200,
            height:               600,
            minHeight:            0,
            space:                0,
            start:                1,
            grabCursor:           true,
            swipe:                true,
            mouse:                true,
            keyboard:             false,
            layout:               'boxed',
            wheel:                false,
            autoplay:             false,
            instantStartLayers:   false,
            mobileBGVideo:        false,
            loop:                 false,
            shuffle:              false,
            preload:              0,
            heightLimit:          true,
            autoHeight:           false,
            smoothHeight:         true,
            endPause:             false,
            overPause:            true,
            fillMode:             'fill',
            centerControls:       true,
            startOnAppear:        false,
            layersMode:           'center',
            autofillTarget:       '',
            hideLayers:           false,
            fullscreenMargin:     0,
            speed:                20,
            dir:                  'h',
            responsive:           true,
            tabletWidth:          768,
            tabletHeight:         null,
            phoneWidth:           480,
            phoneHeight:          null,
            sizingReference:      window,
            parallaxMode:         'swipe',
            view:                 'basic'
          });
          window.masterslider_instances.push(masterslider_1);


          // Slider 2
          //--------------------------------------------------------------------
          var masterslider_2 = new MasterSlider();

          // slider controls
          // masterslider_2.control('arrows', {
          //   autohide:             false,
          //   overVideo:            true
          // });

          // slider setup
          masterslider_2.setup('ms_00002', {
            width:                1200,
            height:               600,
            minHeight:            0,
            space:                0,
            start:                1,
            grabCursor:           true,
            swipe:                true,
            mouse:                true,
            keyboard:             false,
            layout:               'fullwidth',
            wheel:                false,
            autoplay:             false,
            instantStartLayers:   false,
            mobileBGVideo:        false,
            loop:                 false,
            shuffle:              false,
            preload:              0,
            heightLimit:          true,
            autoHeight:           false,
            smoothHeight:         true,
            endPause:             false,
            overPause:            true,
            fillMode:             'fill',
            centerControls:       true,
            startOnAppear:        false,
            layersMode:           'center',
            autofillTarget:       '',
            hideLayers:           false,
            fullscreenMargin:     0,
            speed:                20,
            dir:                  'h',
            responsive:           true,
            tabletWidth:          768,
            tabletHeight:         null,
            phoneWidth:           480,
            phoneHeight:          null,
            sizingReference:      window,
            parallaxMode:         'swipe',
            view:                 'basic'
          });
          window.masterslider_instances.push(masterslider_2);


          // Slider 3
          //--------------------------------------------------------------------
          var masterslider_0003 = new MasterSlider();

    			// slider controls
    			// masterslider_0003.control(
          //   'arrows', {
          //     autohide:             true,
          //     overVideo:            true
          //   }
          // );

    			masterslider_0003.control(
            'slideinfo', {
              autohide:             false,
              overVideo:            true,
              dir:                  'h',
              align:                'bottom',
              inset:                false,
//            insertTo:             'section',
              margin:               -120
            }
          );

          // masterslider_0003.control(
          //   'bullets', {
          //     autohide:             true,
          //     overVideo:            true,
          //     dir:                  'h',
          //     hideUnder:            null,
          //     align:                "bottom",
          //     margin:               10
          //   }
          // );

    			// slider setup
    			masterslider_0003.setup("ms_00003", {
    				width:                  1200,
    				height:                 500,
    				minHeight:              0,
    				space:                  0,
    				start:                  1,
    				grabCursor:             true,
    				swipe:                  true,
    				mouse:                  true,
    				keyboard:               false,
    				layout:                 "boxed",
    				wheel:                  false,
    				autoplay:               false,
            instantStartLayers:     false,
    				mobileBGVideo:          false,
    				loop:                   true,
    				shuffle:                false,
    				preload:                0,
    				heightLimit:            true,
    				autoHeight:             false,
    				smoothHeight:           true,
    				endPause:               false,
    				overPause:              true,
    				fillMode:               "fill",
    				centerControls:         true,
    				startOnAppear:          false,
    				layersMode:             "center",
    				autofillTarget:         "",
    				hideLayers:             false,
    				fullscreenMargin:       0,
    				speed:                  20,
    				dir  :                  "h",
    				responsive:             true,
    				tabletWidth:            768,
    				tabletHeight:           null,
    				phoneWidth:             480,
    				phoneHeight:            null,
    				sizingReference :       window,
    				parallaxMode:           'swipe',
    				view :                  "basic",
            filters: {
                grayscale:          1,
                opacity:            0.5,
                brightness:         2
            }
    			});
    			window.masterslider_instances.push( masterslider_0003 );

          // Slider 4
          //--------------------------------------------------------------------
          var masterslider_00004 = new MasterSlider();

    			// slider controls
    			masterslider_00004.control(
            'arrows', {
              autohide:false,
              overVideo:true
          });
    			masterslider_00004.control(
            'bullets', {
              autohide:false,
              overVideo:true,
              dir:'h',
              align:'bottom',
              space:5,
              margin:10
          });
    			masterslider_00004.control(
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
    			masterslider_00004.control(
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
    			masterslider_00004.setup("ms_00004", {
            width:            890,
    				height:           480,
    				minHeight:        0,
    				space :            0,
    				start :            1,
    				grabCursor:       true,
    				swipe :            true,
    				mouse :            true,
    				keyboard :        false,
    				layout:            "boxed",
    				wheel :            false,
    				autoplay :        false,
            instantStartLayers:false,
    				mobileBGVideo:false,
    				loop  :            false,
    				shuffle  :        false,
    				preload  :        0,
    				heightLimit:      true,
    				autoHeight:       false,
    				smoothHeight:     true,
    				endPause :        false,
    				overPause:        true,
    				fillMode :        "fill",
    				centerControls  : false,
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
    				view  :            "basic"
    			});
    			window.masterslider_instances.push( masterslider_00004 );


          // Slider 5
          //--------------------------------------------------------------------
          var masterslider_00005 = new MasterSlider();

    			// slider controls
    			masterslider_00005.control('arrows', {
            autohide:false,
            overVideo:true
          });
    			masterslider_00005.control(
            'bullets', {
              autohide:false,
              overVideo:true,
              dir:'h',
              align:'bottom',
              space:5,
              margin:10
          });
    			masterslider_00005.control(
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

    			// slider setup
    			masterslider_00005.setup("ms_00005", {
    				width :            1200,
    				height:            530,
    				minHeight:        0,
    				space :            0,
    				start :            1,
    				grabCursor:       true,
    				swipe :            true,
    				mouse :            true,
    				keyboard :        false,
    				layout:            "boxed",
    				wheel :            false,
    				autoplay :        false,
            instantStartLayers:false,
    				mobileBGVideo:false,
    				loop  :            false,
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
    				view  :            "basic"
    			});
    			window.masterslider_instances.push( masterslider_00005 );


          // Slider 6
          //--------------------------------------------------------------------
          var masterslider_00006 = new MasterSlider();

    			// slider controls
    			// masterslider_00006.control(
          //   'arrows', {
          //     autohide:true,
          //     overVideo:true
          // });
    			masterslider_00006.control(
            'slideinfo', {
              autohide:       false,
              overVideo:      true,
              dir:            'h',
              align:          'bottom',
              inset:          false,
              margin:         -110
          });

    			// slider setup
    			masterslider_00006.setup("ms_00006", {
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
    			window.masterslider_instances.push( masterslider_00006 );


          // Slider 7
          //--------------------------------------------------------------------
          var masterslider_00007 = new MasterSlider();

    			// slider controls
    			masterslider_00007.control(
            'arrows', {
              autohide:true,
              overVideo:true
          });
    			masterslider_00007.control(
            'circletimer', {
              autohide:false,
              overVideo:true,
              color:'#FFFFFF',
              radius:4,
              stroke:9
          });
    			masterslider_00007.control(
            'slideinfo', {
              autohide:false,
              overVideo:true,
              dir:'h',
              align:'bottom',
              inset:false,
              margin:20
          });

    			// slider setup
    			masterslider_00007.setup("ms_00007", {
    				width :            700,
    				height:            350,
    				minHeight:        0,
    				space :            10,
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
    				view  :            "fadeFlow"
    			});
    			window.masterslider_instances.push( masterslider_00007 );


          // Slider 8
          //--------------------------------------------------------------------
          var masterslider_68e7 = new MasterSlider();

    			// slider controls
    			masterslider_68e7.control(
            'arrows', {
              autohide:             false,
              overVideo:            true
          });
    			masterslider_68e7.control(
            'bullets', {
              autohide:             true,
              overVideo:            true,
              dir:                  'h',
              align:                'bottom',
              space:                5,
              margin:               10
          });
    			// masterslider_68e7.control(
          //   'scrollbar', {
          //     autohide:             false,
          //     overVideo:            true,
          //     dir:                  'h',
          //     inset:                true,
          //     align:                'top',
          //     color:                '#3D3D3D',
          //     margin:               10,
          //     width:                4
          // });
    			masterslider_68e7.control(
            'slideinfo', {
              autohide:             false,
              overVideo:            true,
              dir:                  'v',
              align:                'right',
              inset:                false,
              margin:               0,
              size:                 280
          });

    			// slider setup
    			masterslider_68e7.setup("MS62a725da068e7", {
            width:                  890,
    				height:                 480,
    				minHeight:              0,
    				space:                  0,
    				start:                  1,
    				grabCursor:             true,
    				swipe:                  true,
    				mouse:                  true,
    				keyboard:               false,
    				layout:                 "boxed",
    				wheel:                  false,
    				autoplay:               false,
            instantStartLayers:     false,
    				mobileBGVideo:          false,
    				loop:                   false,
    				shuffle:                false,
    				preload:                0,
    				heightLimit:            true,
    				autoHeight:             false,
    				smoothHeight:           true,
    				endPause:               false,
    				overPause:              true,
    				fillMode:               "fit",                                      // "fill",
    				centerControls:         true,
    				startOnAppear:          false,
    				layersMode:             "center",
    				autofillTarget:         "",
    				hideLayers:             false,
    				fullscreenMargin:       0,
    				speed:                  20,
    				dir  :                  "h",
    				responsive:             true,
    				tabletWidth:            768,
    				tabletHeight:           null,
    				phoneWidth:             480,
    				phoneHeight:            null,
    				sizingReference :       window,
    				parallaxMode:           'swipe',
    				view :                  "basic"

    			});
    			window.masterslider_instances.push( masterslider_68e7 );


          // Slider 9
          //--------------------------------------------------------------------
          var masterslider_9f74 = new MasterSlider();

    			// slider controls
    			masterslider_9f74.control('arrows', {
            autohide:true,
            overVideo:true
          });
    			masterslider_9f74.control(
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
              margin:2,
              width:130,
              height:85,
              space:2,
              fillMode:'fill'
          });
    			masterslider_9f74.control(
            'scrollbar', {
              autohide:false,
              overVideo:true,
              dir:'v',
              inset:true,
              align:'right',
              color:'#3D3D3D',
              margin:2,
              width:4
          });
    			masterslider_9f74.control(
            'circletimer', {
              autohide:false,
              overVideo:true,
              color:'#FFFFFF',
              radius:4,
              stroke:9
          });

    			// slider setup
    			masterslider_9f74.setup("MS62a72e9c69f74", {
    				width :            752,
    				height:            409,
    				minHeight:        0,
    				space :            5,
    				start :            1,
    				grabCursor:       true,
    				swipe :            true,
    				mouse :            true,
    				keyboard :        false,
    				layout:            "boxed",
    				wheel :            false,
    				autoplay :        false,
            instantStartLayers:false,
    				mobileBGVideo:false,
    				loop  :            false,
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
    				dir   :            "v",
    				responsive:       true,
    				tabletWidth:      768,
    				tabletHeight:     null,
    				phoneWidth:       480,
    				phoneHeight:     null,
    				sizingReference : window,
    				parallaxMode:     'swipe',
    				view  :            "basic"
    			});
    			window.masterslider_instances.push( masterslider_9f74 );

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
