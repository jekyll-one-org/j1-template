---
regenerate:                             true
---

{%- capture cache -%}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/adapter/js/skipad.js
 # Liquid template to adapt the J1 SkipAd module
 #
 # Product/Info:
 # https://jekyll.one
 # Copyright (C) 2023-2026 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # For details, see: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 # -----------------------------------------------------------------------------
 # Test data:
 #  {{ liquid_var | debug }}
 #  skipad_options:  {{ skipad_options | debug }}
 # -----------------------------------------------------------------------------
{% endcomment %}

{% comment %} Liquid procedures
-------------------------------------------------------------------------------- {% endcomment %}

{% comment %} Set global settings
-------------------------------------------------------------------------------- {% endcomment %}
{% assign environment         = site.environment %}
{% assign asset_path          = "/assets/theme/j1" %}

{% comment %} Process YML config data
================================================================================ {% endcomment %}

{% comment %} Set config files
-------------------------------------------------------------------------------- {% endcomment %}
{% assign template_config     = site.data.j1_config %}
{% assign blocks              = site.data.blocks %}
{% assign modules             = site.data.modules %}

{% comment %} Set config data (settings only)
-------------------------------------------------------------------------------- {% endcomment %}
{% assign skipad_defaults     = modules.defaults.skipad.defaults %}
{% assign skipad_settings     = modules.skipad.settings %}

{% comment %} Set config options (settings only)
-------------------------------------------------------------------------------- {% endcomment %}
{% assign skipad_options      = skipad_defaults | merge: skipad_settings %}

{% comment %} Variables
-------------------------------------------------------------------------------- {% endcomment %}
{% assign comments            = skipad_options.enabled %}

{% comment %} Detect prod mode
-------------------------------------------------------------------------------- {% endcomment %}
{% assign production = false %}
{% if environment == 'prod' or environment == 'production' %}
  {% assign production = true %}
{% endif %}


/*
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/adapter/js/skipad.js
 # J1 Adapter for the J1 SkipAd module
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2023-2026 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # For details, see: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 # -----------------------------------------------------------------------------
 # NOTE:
 # -----------------------------------------------------------------------------
 #  Adapter generated: {{site.time}}
 # -----------------------------------------------------------------------------
*/

// -----------------------------------------------------------------------------
// ESLint shimming
// -----------------------------------------------------------------------------
/* eslint indent: "off"                                                       */
// -----------------------------------------------------------------------------
//
"use strict";
j1.adapter.skipad = ((j1, window) => {

  const isDev = (j1.env === "development" || j1.env === "dev") ? true : false;

  {% comment %} Set global variables
  ------------------------------------------------------------------------------ {% endcomment %}
  var environment         = '{{environment}}';
  var cookie_names        = j1.getCookieNames();
  var user_state          = j1.readCookie(cookie_names.user_state);
  var viewport_width      = $(window).width();
  var state               = 'not_started';

  var skipAdDefaults;
  var skipAdSettings;
  var skipAdOptions;

  var _this;
  var logger;
  var logText;

  // date|time
  var startTime;
  var endTime;
  var startTimeModule;
  var endTimeModule;
  var timeSeconds;

  // ---------------------------------------------------------------------------
  // main
  // ---------------------------------------------------------------------------
  return {

    // -------------------------------------------------------------------------
    // adapter initializer
    // -------------------------------------------------------------------------
    init: (options) => {


      // =======================================================================
      // helper classes and functions
      // -----------------------------------------------------------------------

      /**
       * Input Wrapper Handler Module
       * Handles clipboard paste, input validation and URL processing
       */

      class InputWrapperHandler {
        constructor() {
          this.pasteButton = document.getElementById('pasteButton');
          this.videoUrlInput = document.getElementById('videoUrl');
          this.loadVideoButton = document.getElementById('loadVideo');
          
          this.init();
        }

        /**
         * Initialize event listeners
         */
        init() {
          // logger  = log4javascript.getLogger('j1.adapter.skipad.run');

          // Paste Button Click Event
          if (this.pasteButton) {
            this.pasteButton.addEventListener('click', () => this.handlePasteClick());
          }

          // Load Video Button Click Event
          if (this.loadVideoButton) {
            this.loadVideoButton.addEventListener('click', () => this.handleLoadVideo());
          }

          // Input Paste Event (Ctrl+V direkt im Input-Feld)
          if (this.videoUrlInput) {
            this.videoUrlInput.addEventListener('paste', (e) => this.handleDirectPaste(e));
            
            // Enter-Taste im Input-Feld
            this.videoUrlInput.addEventListener('keypress', (e) => {
              if (e.key === 'Enter') {
                this.handleLoadVideo();
              }
            });
          }
        }

        /**
         * Handle paste button click - read from clipboard
         */
        async handlePasteClick() {
          try {
            // Clipboard API verwenden (funktioniert in modernen Browsern)
            if (navigator.clipboard && navigator.clipboard.readText) {
              const text = await navigator.clipboard.readText();
              this.videoUrlInput.value = text.trim();
              this.runUrl();
            } else {
              // Fallback für ältere Browser
              console.warn('Clipboard API nicht verfügbar. Bitte Ctrl+V verwenden.');
              alert('Bitte verwenden Sie Ctrl+V oder fügen Sie die URL direkt ein.');
            }
          } catch (err) {
            console.error('Fehler beim Lesen der Zwischenablage:', err);
            alert('Zugriff auf Zwischenablage fehlgeschlagen. Bitte URL manuell einfügen.');
          }
        }

        /**
         * Handle direct paste event in input field
         */
        handleDirectPaste(event) {
          // Kleine Verzögerung, damit der Wert zuerst eingefügt wird
          setTimeout(() => {
            this.runUrl();
          }, 10);
        }

        /**
         * Handle load video button click
         */
        handleLoadVideo() {
          this.runUrl();
        }

        /**
         * Main function to process the URL
         */
        runUrl() {
          const url = this.videoUrlInput.value.trim();
          
          if (!url) {
            console.warn('Keine URL eingegeben');
            return;
          }

          // URL validieren und verarbeiten
          const processedUrl = this.processVideoUrl(url);
          
          if (processedUrl) {
            console.log('Verarbeitete URL:', processedUrl);
            // Hier die eigentliche Funktionalität implementieren
            this.loadAdFreeVideo(processedUrl);
          } else {
            alert('Ungültige YouTube-URL. Bitte überprüfen Sie die Eingabe.');
          }
        }

        /**
         * Process and validate YouTube URL
         * @param {string} url - Input URL or video ID
         * @returns {string|null} - Processed video ID or null if invalid
         */
        processVideoUrl(url) {
          // YouTube Video ID extrahieren
          let videoId = null;

          // Verschiedene YouTube URL-Formate unterstützen
          const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
            /^([a-zA-Z0-9_-]{11})$/, // Nur Video ID
            /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
            /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/
          ];

          for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) {
              videoId = match[1];
              break;
            }
          }

          return videoId;
        }

        /**
         * Load ad-free video (hier Ihre Implementierung)
         * @param {string} videoId - YouTube video ID
         */
        loadAdFreeVideo(videoId) {
          // logger.log('Lade werbungsfreies Video:', videoId);
          console.log('Lade werbungsfreies Video:', videoId);
          
          // Beispiel: Event dispatchen für weitere Verarbeitung
          const event = new CustomEvent('videoLoad', {
            detail: { videoId: videoId }
          });

          document.dispatchEvent(event);
            const evt = event;

            // HIER IHRE IMPLEMENTIERUNG
            // z.B. Video-Player laden, API-Call, etc.
            
            // Beispiel für mögliche Weiterverarbeitung:
            // window.location.href = `https://www.youtube-nocookie.com/embed/${videoId}`;
            // oder
            console.log('Embed video on id:', videoId);
            j1.adapter.skipad.embedYtVideo(videoId);

            // this.embedVideo(videoId);
        }
      }


      // -----------------------------------------------------------------------
      // default module settings
      // -----------------------------------------------------------------------
      var settings = $.extend({
        module_name: 'j1.adapter.skipad',
        generated:   '{{site.time}}'
      }, options);

      // -----------------------------------------------------------------------
      // global variable settings
      // -----------------------------------------------------------------------

      // create settings object from module options
      skipAdDefaults = $.extend({}, {{skipad_defaults | replace: 'nil', 'null' | replace: '=>', ':' }});
      skipAdSettings = $.extend({}, {{skipad_settings | replace: 'nil', 'null' | replace: '=>', ':' }});
      skipAdOptions  = $.extend(true, {}, skipAdDefaults, skipAdSettings);

      _this          = j1.adapter.skipad;
      logger         = log4javascript.getLogger('j1.adapter.skipad');

      // -----------------------------------------------------------------------
      // module initializer
      // -----------------------------------------------------------------------
      var dependencies_met_page_ready = setInterval (() => {
        var pageState       = $('#content').css("display");
        var pageVisible     = (pageState === 'block') ? true : false;
        var j1CoreFinished  = (j1.getState() === 'finished') ? true : false;
        // var atticFinished   = (j1.adapter.attic.getState() == 'finished') ? true : false;

        if (j1CoreFinished && pageVisible) {
          startTimeModule = Date.now();

          _this.setState('started');
          logger.debug('state: ' + _this.getState());
          logger.info('module is being initialized');


          // Module initialisieren wenn DOM geladen ist
          window.inputHandler = new InputWrapperHandler();

          // Export für Module-Verwendung
          if (typeof module !== 'undefined' && module.exports) {
            module.exports = InputWrapperHandler;
          }

          _this.setState('finished');
          logger.debug('state: ' + _this.getState());
          logger.info('initializing module finished');

          endTimeModule = Date.now();
          logger.info('module initializing time: ' + (endTimeModule-startTimeModule) + 'ms');

          clearInterval(dependencies_met_page_ready);
        } // END pageVisible
      }, 10); // END dependencies_met_page_ready
    }, // END init

    // -------------------------------------------------------------------------
    // embedYtVideo()
    // ???
    // -------------------------------------------------------------------------
    embedYtVideo: (videoId) => {

      logger.info('embedd yt video on ID:', videoId);

    },

    // -------------------------------------------------------------------------
    // messageHandler()
    // manage messages send from other J1 modules
    // -------------------------------------------------------------------------
    messageHandler: (sender, message) => {
      var json_message = JSON.stringify(message, undefined, 2);

      logText = 'received message from ' + sender + ': ' + json_message;
      logger.debug(logText);

      // -----------------------------------------------------------------------
      //  process commands|actions
      // -----------------------------------------------------------------------
      if (message.type === 'command' && message.action === 'module_initialized') {

        //
        // place handling of command|action here
        //

        logger.info(message.text);
      }

      //
      // place handling of other command|action here
      //

      return true;
    }, // END messageHandler

    // -------------------------------------------------------------------------
    // setState()
    // sets the current (processing) state of the module
    // -------------------------------------------------------------------------
    setState: (stat) => {
      _this.state = stat;
    }, // END setState

    // -------------------------------------------------------------------------
    // getState()
    // Returns the current (processing) state of the module
    // -------------------------------------------------------------------------
    getState: () => {
      return _this.state;
    } // END getState

  }; // END main (return)
})(j1, window);

{%- endcapture -%}

{%- if production -%}
  {{ cache|minifyJS }}
{%- else -%}
  {{ cache|strip_empty_lines }}
{%- endif -%}

{%- assign cache = false -%}
