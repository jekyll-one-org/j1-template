---
regenerate:                             true
---

{% capture cache %}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/speak2me.js
 # Liquid template to adapt the Speak2Me module
 #
 # Product/Info:
 # https://jekyll.one
 # Copyright (C) 2023 Juergen Adams
 #
 # J1 Theme is licensed under the MIT License.
 # For details, see: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE.md
 # -----------------------------------------------------------------------------
 # Test data:
 #  {{ liquid_var | debug }}
 #  speak2me_options:  {{ speak2me_options | debug }}
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
{% assign template_config    = site.data.j1_config %}
{% assign blocks             = site.data.blocks %}
{% assign modules            = site.data.modules %}

{% comment %} Set config data (settings only)
-------------------------------------------------------------------------------- {% endcomment %}
{% assign speak2me_defaults = modules.defaults.speak2me.defaults %}
{% assign speak2me_settings = modules.speak2me.settings %}

{% comment %} Set config options (settings only)
-------------------------------------------------------------------------------- {% endcomment %}
{% assign speak2me_options  = speak2me_defaults | merge: speak2me_settings %}

{% comment %} Variables
-------------------------------------------------------------------------------- {% endcomment %}
{% assign comments          = speak2me_options.enabled %}

{% comment %} Detect prod mode
-------------------------------------------------------------------------------- {% endcomment %}
{% assign production = false %}
{% if environment == 'prod' or environment == 'production' %}
  {% assign production = true %}
{% endif %}

/*
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/speak2me.js
 # J1 Adapter for the speak2me module
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2023 Juergen Adams
 #
 # J1 Theme is licensed under the MIT License.
 # For details, see: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE.md
 # -----------------------------------------------------------------------------
 # NOTE: Wave styles defind in /assets/data/panel.html, key 'wave'
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
j1.adapter.speak2me = (function (j1, window) {

{% comment %} Set global variables
-------------------------------------------------------------------------------- {% endcomment %}
var environment           = '{{environment}}';
var cookie_names          = j1.getCookieNames();
var user_state            = j1.readCookie(cookie_names.user_state);
var state                 = 'not_started';
var chrome                = /chrome/i.test( navigator.userAgent );
var edge                  = /Edg/i.test( navigator.userAgent );
var isChrome              = ((chrome) && (!edge));
var ttsDisabled           = false;
var user_session          = j1.readCookie('j1.user.session');
var chromeWorkaround      = {{speak2me_options.chromeWorkaround}};
var chromePauseWorkaround = {{speak2me_options.chromePauseWorkaround}};
var frontmatterOptions;
var speak2meDefaults;
var speak2meSettings;
var speak2meOptions;
var _this;
var logger;
var logText;

// -------------------------------------------------------------------------
// global event handler
// -------------------------------------------------------------------------
var Events = {
  documentReady: function (onDocumentReady) {
    if (document.readyState !== 'loading') {
      onDocumentReady();
    } else {
      document.addEventListener('DOMContentLoaded', onDocumentReady);
    }
  }
};

  // ---------------------------------------------------------------------------
  // Main object
  // ---------------------------------------------------------------------------
  return {

    // -------------------------------------------------------------------------
    // init()
    // adapter initializer
    // -------------------------------------------------------------------------
    init: function (options) {

      // -----------------------------------------------------------------------
      // Default module settings
      // -----------------------------------------------------------------------
      var settings = $.extend({
        module_name: 'j1.adapter.speak2me',
        generated:   '{{site.time}}'
      }, options);

      // -----------------------------------------------------------------------
      // Global variable settings
      // -----------------------------------------------------------------------

      // create settings object from frontmatter
      //
      frontmatterOptions  = options != null ? $.extend({}, options) : {};

      // create settings object from module options
      //
      speak2meDefaults = $.extend({}, {{speak2me_defaults | replace: 'nil', 'null' | replace: '=>', ':' }});
      speak2meSettings = $.extend({}, {{speak2me_settings | replace: 'nil', 'null' | replace: '=>', ':' }});
      speak2meOptions  = $.extend(true, {}, speak2meDefaults, speak2meSettings, frontmatterOptions);

      ttsDisabled      = (speak2meOptions.tts == "false") ? true : false;

      _this  = j1.adapter.speak2me;
      logger = log4javascript.getLogger('j1.adapter.speak2me');

      // -----------------------------------------------------------------------
      // initializer
      // -----------------------------------------------------------------------
      var dependencies_met_page_ready = setInterval (function (options) {
        var pageState     = $('#no_flicker').css("display");
        var pageVisible   = (pageState == 'block') ? true : false;
        var speak2meModal;
        var speak2mePause;

        if (j1.getState() === 'finished' && pageVisible) {

          // jadams
          // NOTE: coincident active speech synthesis in multiple
          // browser windows (tabs) does NOT work
          //
          // if (user_session.speech_synthesis_active === true) {
          //     return;
          // }

          _this.setState('started');
          logger.debug('\n' + 'state: ' + _this.getState());
          logger.info('\n' + 'module is being initialized');

          if (isChrome && chromeWorkaround) {
            var chromeWorkaroundRunner = setInterval(function () {
              if ($().speak2me('isSpeaking')) {
                $().speak2me('pause').speak2me('resume');
                logger.debug('\n' + 'speak: send pause-resumed');
              }
            }, 10000);
          }

          // Check for mobile browsers
          //
          if (navigator.userAgent.match(/(iPod|iPhone|iPad|Android)/)) {
            logger.warn('\n' + 'module is currently not supported on mobile devices');
            $('#quickLinksSpeakButton').hide();
            return;
          }

          // Check to see if the browser supports speech synthesis
          //
          if (!('speechSynthesis' in window)) {
            logger.warn('\n' + 'this browser does not support the Web Speech API.');
            $('#quickLinksSpeakButton').hide();
            return;
          };

          // If something is currently being spoken, ignore new voice
          // request. Otherwise it would be queued, which is doable if
          // someone wanted that, but not what I wanted.
          //
          if (window.speechSynthesis.speaking) {
              return
          };

          if (ttsDisabled) {
            logger.warn('\n' + 'tts detected: disabled');
            $('#quickLinksSpeakButton').hide();
          } else {
            speak2meModal    = document.createElement('div');
            speak2meModal.id = speak2meOptions.dialogContainerID;
            speak2meModal.style.display = 'none';

            speak2meModal.setAttribute('class', 'modal fade');
            speak2meModal.setAttribute('tabindex', '-1');
            speak2meModal.setAttribute('role', 'dialog');
            speak2meModal.setAttribute('aria-labelledby', speak2meOptions.dialogContainerID);
            document.body.append(speak2meModal);

            const pauseSpoken = document.createTextNode(' professionals a clean implementation for starting new projects. JekyllOne is open source, and the modules packed are also free to use.');
            speak2mePause     = document.createElement('pause');
            speak2mePause.id  = 'pauseSpoken'
            speak2mePause.style.display = 'none';
            speak2mePause.appendChild(pauseSpoken);
            document.body.append(speak2mePause);

            // -----------------------------------------------------------------
            // data loader
            // -----------------------------------------------------------------
            j1.loadHTML ({
              xhr_container_id:   'speak2me_container',
              xhr_data_path:      '/assets/data/speak2me/index.html',
              xhr_data_element:   'speak2me-modal-data' },
              'j1.adapter.rtextResizer',
              'null'
            );
          } // END if ttsDisabled

          // -------------------------------------------------------------------
          // on 'show'
          // -------------------------------------------------------------------
          $('#speak2me_container').on('show.bs.modal', function () {
            if (isChrome && chromeWorkaround) {
              logger.warn('\n' + 'chrome browser detected: pause|resume buttons disabled');
              $('#pause_button').hide();
              $('#resume_button').hide();
            }
            _this.create('#voiceSelector');
          }); // END modal on 'show'

          // -------------------------------------------------------------------
          // on 'shown'
          // -------------------------------------------------------------------
          // $('#speak2me_container').on('shown.bs.modal', function () {
          //     // do something here
          //     return;
          // }); // END modal on 'shown'

          _this.setState('finished');
          logger.debug('\n' + 'state: ' + _this.getState());
          logger.info('\n' + 'module initialization finished');

          clearInterval(dependencies_met_page_ready);
        }
      }, 10);

    }, // END init

    // -------------------------------------------------------------------------
    // create()
    // create a HTML select element for all (valid) voices found
    // -------------------------------------------------------------------------
    create: function (obj) {
      var isSelectEmpty = ($('#voiceSelect').length == 1) ? false: true;
      var numVoices;

      // create select element (#voiceSelect) if not already exist
      if (isSelectEmpty) {
        numVoices = $().speak2me('getVoices', obj, 'Select a voice');
      }
      // delete select element (#voiceSelect) if no valid voiuces found
      if (numVoices === 0) {
        $(obj).remove();
      }
    },

    // -------------------------------------------------------------------------
    // showDialog()
    // display the tts settings dialog
    // -------------------------------------------------------------------------
    showDialog: function () {
      logger.debug('\n' + "showDialog");

      $('#speak2me_container').modal({
        backdrop: 'static',
        keyboard: false
      });

      $('#speak2me_container').modal('show');
    },

    // -------------------------------------------------------------------------
    // update()
    // update the value to the right of the input sliders
    // -------------------------------------------------------------------------
    update: function (obj, value) {
      var n = parseFloat(value).toFixed(1)
      $(obj).parent().find('span').text(n);
    },

    // -------------------------------------------------------------------------
    // speak()
    // calls the 'speak' functiion of the screen reader
    // -------------------------------------------------------------------------
    speak: function (obj) {

      // Get the parameter values from the input sliders
      //
      var r = parseFloat(document.getElementById('rate').value);
      var p = parseFloat(document.getElementById('pitch').value);
      var v = parseFloat(document.getElementById('volume').value);

      // Note: Function calls can be perfromed individually or
      // chained together as demonstrated below
      //
      $(obj).speak2me('rate',r).speak2me('pitch', p).speak2me('volume', v);
      // $(obj).speak2me('ignore', 'h2','h3');
      var speaker = $(obj).speak2me('speak');
      $(".mdib-speaker").addClass("mdib-spin");

      // just for debugging completeness, no errors seem to be thrown though
      speaker.addEventListener('error', (event) => {
        console.log('speak2me error:', event);
      });
    },

    // -------------------------------------------------------------------------
    // pause()
    // Calls the 'pause' function of the screen reader
    // -------------------------------------------------------------------------
    pause: function () {
      $().speak2me('pause');
      if (chromePauseWorkaround) {
        chromePauseWorkaround = setInterval(function () {
            $().speak2me('resume');
            $('Pause').speak2me('speak');
            logger.debug('\n' + 'speak: send pause text');
            $().speak2me('pause');
        }, 1000);
      }
      $(".mdib-speaker").removeClass("mdib-spin");
    },

    // -------------------------------------------------------------------------
    // resume()
    // Calls the 'resume' function of the screen reader
    // -------------------------------------------------------------------------
    resume: function () {
      if (chromePauseWorkaround) {
        clearInterval(chromeWorkaroundRunner);
      }
      $().speak2me('resume');
      $(".mdib-speaker").addClass("mdib-spin");
    },

    // -------------------------------------------------------------------------
    // stop()
    // Calls the 'stop' function of the screen reader
    // -------------------------------------------------------------------------
    stop: function () {
      $().speak2me('stop');
      $(".mdib-speaker").removeClass("mdib-spin");
    },

    // -------------------------------------------------------------------------
    // messageHandler()
    // manage messages send from other J1 modules
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
