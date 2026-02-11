---
regenerate: true
---

{%- capture cache -%}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/adapter/js/skipad.js (9)
 # Liquid template to adapt the J1 SkipAd module
 #
 # Product/Info:
 # https://jekyll.one
 # Copyright (C) 2023-2025 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # For details, see: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 # -----------------------------------------------------------------------------
{% endcomment %}

{% comment %} Liquid procedures
-------------------------------------------------------------------------------- {% endcomment %}

{% comment %} Set global settings
-------------------------------------------------------------------------------- {% endcomment %}
{% assign environment = site.environment %}
{% assign asset_path = "/assets/theme/j1" %}

{% comment %} Process YML config data
================================================================================ {% endcomment %}

{% comment %} Set config files
-------------------------------------------------------------------------------- {% endcomment %}
{% assign template_config = site.data.j1_config %}
{% assign blocks = site.data.blocks %}
{% assign modules = site.data.modules %}

{% comment %} Set config data (settings only)
-------------------------------------------------------------------------------- {% endcomment %}
{% assign skipad_defaults = modules.defaults.skipad.defaults %}
{% assign skipad_settings = modules.skipad.settings %}

{% comment %} Set config options (settings only)
-------------------------------------------------------------------------------- {% endcomment %}
{% assign skipad_options = skipad_defaults | merge: skipad_settings %}

{% comment %} Detect prod mode
-------------------------------------------------------------------------------- {% endcomment %}
{% assign production = false %}
{% if environment == 'prod' or environment == 'production' %}
  {% assign production = true %}
{% endif %}


/*
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/adapter/js/skipad.js (9)
 # J1 Adapter for the J1 SkipAd module
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2023-2025 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # For details, see: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 # -----------------------------------------------------------------------------
 #  Adapter generated: {{site.time}}
 # -----------------------------------------------------------------------------
 #
*/

// -----------------------------------------------------------------------------
// ESLint shimming
// -----------------------------------------------------------------------------
/* eslint indent: "off" */
// -----------------------------------------------------------------------------

"use strict";

j1.adapter.skipad = ((j1, window) => {

  // ---------------------------------------------------------------------------
  // Constants
  // ---------------------------------------------------------------------------
  const MODULE_NAME         = 'j1.adapter.skipad';
  const MODULE_NAME_RUN     = 'j1.adapter.skipad.runner';
  const INIT_POLL_INTERVAL  = 10;
  const PASTE_DELAY         = 10;
  const VIDEO_START_DELAY   = 500;
  
  const YOUTUBE_PATTERNS = Object.freeze([
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/
  ]);

  const MESSAGES = Object.freeze({
    NO_CLIPBOARD_API:   'Clipboard API not available. Please use Ctrl+V.',
    CLIPBOARD_DENIED:   'Clipboard access failed. Please paste URL manually.',
    INVALID_URL:        'Invalid YouTube URL. Please check your input.',
    NO_URL:             'No URL entered.',
    VIDEO_EXISTS:       'Video|Player already exists.',
    LOADING_VIDEO:      'Loading video ad-free.'
  });

  const vjsStateEventMap = {
    'loadstart':        -1,
    'ended':             0,   // YT.PlayerState.ENDED
    'playing':           1,   // YT.PlayerState.PLAYING
    'pause':             2,   // YT.PlayerState.PAUSED
    'waiting':           3    // YT.PlayerState.BUFFERING
  };

  // claude - optimization chances: vjsStateEventNameMap uses array index lookup,
  // but YT state -1 (loadstart) would produce undefined via arr[-1]. Changed to
  // a plain object map for safe lookup of all states including negative values.
  const vjsStateEventNameMap = {
    '-1': 'loadstart',        // YT unstarted
     '0': 'ended',            // YT.PlayerState.ENDED
     '1': 'playing',          // YT.PlayerState.PLAYING
     '2': 'paused',           // YT.PlayerState.PAUSED
     '3': 'waiting'           // YT.PlayerState.BUFFERING    
  };

  // ---------------------------------------------------------------------------
  // Module variables
  // ---------------------------------------------------------------------------
  const isDev           = j1.env === "development" || j1.env === "dev";
  const environment     = '{{environment}}';
  const cookieNames     = j1.getCookieNames();
  const userState       = j1.readCookie(cookieNames.user_state);

  const container       = document.querySelector('.video-container');
  const containerHTML   = container.innerHTML;
  const overlay         = document.getElementById('emptyPlayerOverlay');
  const overlayHTML     = overlay.innerHTML;

  let moduleState       = 'not_started';
  let player            = null;
  let lastState         = null;
  let previousPlayerId  = null;

  let skipAdDefaults;
  let skipAdSettings;
  let skipAdOptions;

  let logger;

  // ---------------------------------------------------------------------------
  // Helper Functions
  // ---------------------------------------------------------------------------

  // claude - optimization chances: corrected JSDoc - parameter is a YT state
  // number, not a videoId string.
  /**
   * doPostOnPlaying - process AFTER (state change) 'playing'
   * @param {number} state - YouTube player state code
   */
   function doPostOnPlaying(state) {
      logger.debug(`post processing on state: ${vjsStateEventNameMap[state]}`);
      scrollToElement(document.getElementById("video_container"));
   }

  // claude - optimization chances: corrected JSDoc - parameter is a DOM element,
  // not a videoId. Removed redundant intermediate variable assignment.
  /**
   * scrollToElement - scroll to element's (vertical) top position
   * @param {HTMLElement} elm - Target DOM element to scroll to
   */
  function scrollToElement(elm) {
    const targetElmPosition = elm.offsetTop;
    const scrollOffset      = (window.innerWidth >= 720) ? -160 : -110;
    const position          = targetElmPosition + scrollOffset;

    logger.debug(`scroll page to vertical position: ${position}`);
    window.scrollTo(0, position);
  }

  // claude - optimization chances: corrected JSDoc - parameter is a length,
  // not a videoId.
  /**
   * generateId - generate a random alphanumeric ID string
   * @param {number} [length=11] - Desired ID length
   * @returns {string} - Generated ID
   */
  function generateId(length = 11) {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let id = '';
    for (let i = 0; i < length; i++) {
      id += chars[Math.floor(Math.random() * chars.length)];
    }
    return id;
  }

  // claude - optimization chances: corrected JSDoc - parameters are level,
  // module and message; not videoId.
  /**
   * consoleLog - formatted console output with timestamp and unique ID
   * @param {string} level   - Log level: 'INFO', 'WARN', or 'ERROR'
   * @param {string} module  - Source module identifier
   * @param {string} message - Log message text
   */  
  function consoleLog(level, module, message) {
    const timestamp = new Date().toISOString().slice(11, 23);
    const id        = generateId();
    
    switch (level) {

      case 'INFO':
        console.log(`[${timestamp}] [${id}] [${level}] [${module}] \n${message}`);
        break;
      case 'WARN':
        console.warn(`[${timestamp}] [${id}] [${level}] [${module}] \n${message}`);
        break;
      case 'ERROR':
        console.error(`[${timestamp}] [${id}] [${level}] [${module}] \n${message}`);
        break;
    }

  }

  /**
   * createVideoJsPlayer - create and initialize a VideoJS player for YouTube
   * @param {string} videoId        - YouTube video ID
   * @param {Object} [options={}]   - Player configuration options
   * @returns {Object|null}         - VideoJS player instance or null on failure
   */  
  function createVideoJsPlayer(videoId, options = {}) {

    // Initialize videoJS player
    if (!container) {
      consoleLog('ERROR', MODULE_NAME_RUN, `Container or overlay element not found`);
      return null;
    }

    // Dispose existing videoJS player before creating a new one
    if (player) {
      consoleLog('INFO', MODULE_NAME_RUN, `Disposing existing videoJS player: ${player.id_}`);
      player.dispose();
      player = null;
    }

    // Restore the container HTML (incl. overlay) so a fresh video element can be placed;
    // the overlay was removed from the DOM by replaceWith() on the previous call
    const overlayExists = document.getElementById('emptyPlayerOverlay');
    if (!overlayExists) {
      consoleLog('INFO', MODULE_NAME_RUN, `Restoring container and overlay for new video`);
      container.innerHTML = containerHTML;
    }

    // Re-query the overlay from the live DOM (the original const is stale after replaceWith)
    const currentOverlay = document.getElementById('emptyPlayerOverlay');
    if (!currentOverlay) {
      consoleLog('ERROR', MODULE_NAME_RUN, `Overlay element could not be restored`);
      return null;
    }

    // Create video element
    const video       = document.createElement('video');
    video.id          = videoId;
    video.className   = 'video-js vjs-theme-uno';
    video.controls    = true;
    video.width       = 640;
    video.height      = 360;
    video.poster      = `//img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

    video.setAttribute('aria-label', options.title || 'Video Player');

    // Replace overlay with video element (use live DOM reference, 
    // not stale module-level const)
    currentOverlay.replaceWith(video);

    // videoJS configuration
    const videoConfig = {
      fluid: true,
      techOrder: ['youtube', 'html5'],
      sources: [{
        type: 'video/youtube',
        src: `//youtu.be/${videoId}`
      }],
      controlBar: {
        pictureInPictureToggle: false,
        volumePanel: {
          inline: false
        }
      },
      // ...options.playerOptions
    };

    // Initialize videoJS player
    if (typeof videojs !== 'undefined') {
      player = videojs(videoId, videoConfig, function onPlayerReady() {
        consoleLog('INFO', MODULE_NAME_RUN, `videoJS player ready on ID: ${videoId}`);

        // Register listeners for the actual videoJS events that correspond
        // to YouTube player state changes, and forward them to onStateChange.
        if (options.onStateChange) {
          var vjsPlayer = this;

          Object.keys(vjsStateEventMap).forEach(function(eventName) {
            vjsPlayer.on(eventName, function() {
              options.onStateChange({ data: vjsStateEventMap[eventName] });
            });
          });
        }

        if (options.onReady) {
          options.onReady(this);
        }
      });
    }

    // Store the YouTube video ID (not the videoJS internal id)
    // for duplicate detection
    previousPlayerId = videoId;
    return player;
  }

  // ---------------------------------------------------------------------------
  // Helper Classes
  // ---------------------------------------------------------------------------

  /**
   * Input Wrapper Handler Module
   * Handles clipboard paste, input validation and URL processing
   */
  class InputWrapperHandler {
    constructor() {
      this.elements = this.cacheElements();
      this.init();
    }

    /**
     * Cache DOM elements
     * @private
     */
    cacheElements() {
      return {
        pasteButton: document.getElementById('pasteButton'),
        videoUrlInput: document.getElementById('videoUrl'),
        loadVideoButton: document.getElementById('loadVideo'),
        clearInputButton: document.getElementById('clearInput')  // claude - added clear button code
      };
    }

    /**
     * Initialize event listeners
     * @private
     */
    init() {
      const { pasteButton, videoUrlInput, loadVideoButton, clearInputButton } = this.elements;

      // Paste Button Click Event
      pasteButton.addEventListener('click', () => this.handlePasteClick());

      // Load Video Button Click Event
      loadVideoButton.addEventListener('click', () => this.handleLoadVideo());

      // claude - added clear button code
      // Clear Input Button Click Event
      clearInputButton.addEventListener('click', () => this.handleClearInput());

      // Input field events
      if (videoUrlInput) {
        videoUrlInput.addEventListener('paste', (e) => this.handleDirectPaste(e));
        videoUrlInput.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            this.handleLoadVideo();
          }
        });
      }
    }

    /**
     * Handle paste button click - read from clipboard
     * @async
     */
    async handlePasteClick() {
      try {
        if (!navigator.clipboard.readText) {
          consoleLog('WARN', MODULE_NAME_RUN, MESSAGES.NO_CLIPBOARD_API);
          alert(MESSAGES.NO_CLIPBOARD_API);
          return;
        }

        const text = await navigator.clipboard.readText();
        this.elements.videoUrlInput.value = text.trim();
        this.processUrl();
      } catch (err) {
        consoleLog('ERROR', MODULE_NAME_RUN, `Clipboard read error: ${err}`);
        alert(MESSAGES.CLIPBOARD_DENIED);
      }
    }

    // claude - added clear button code
        /**
         * Handle clear input button click - clear the URL input field
         */
        handleClearInput() {
          this.elements.videoUrlInput.value = '';
          this.elements.videoUrlInput.focus();
          consoleLog('INFO', MODULE_NAME_RUN, 'Input field cleared');
        }

    /**
     * Handle direct paste event in input field
     * @private
     */
    handleDirectPaste(event) {
      // Delay to allow value to be pasted first
      setTimeout(() => this.processUrl(), PASTE_DELAY);
    }

    /**
     * Handle load video button click
     */
    handleLoadVideo() {
      this.processUrl();
    }

    /**
     * Handle clear input button click - clear the URL input field
     */
    handleClearInput() {
      this.elements.videoUrlInput.value = '';
      this.elements.videoUrlInput.focus();
    }

    /**
     * Main function to process the URL
     * @private
     */
    processUrl() {
      const url = this.elements.videoUrlInput.value.trim();
      if (url === "") {
        consoleLog('WARN', MODULE_NAME_RUN, MESSAGES.NO_URL);
        // alert(MESSAGES.NO_URL);
        return;
      }

      const videoId = this.extractVideoId(url);
      // Check if videoJS player already exists
      if (previousPlayerId !== null && videoId === previousPlayerId) {
        consoleLog('WARN', MODULE_NAME_RUN, `videoJS player already exists on YouTube ID: ${videoId}`);
        // alert(MESSAGES.VIDEO_EXISTS);
        return;
      }

      // claude - optimization chances: the original condition `if ()` was empty
      // (always a SyntaxError in strict mode or truthy-falsy ambiguity). Fixed
      // to validate the extracted videoId before embedding.
      if (videoId) {
        consoleLog('INFO', MODULE_NAME_RUN, `Embedding YT video with ID: ${videoId}`);

        this.loadAdFreeVideo(videoId);
      } else {
        consoleLog('ERROR', MODULE_NAME_RUN, `Invalid YouTube URL. Please check your input.`);
        alert(MESSAGES.INVALID_URL);
      }

    }

    /**
     * Extract YouTube video ID from URL
     * @param {string} url - Input URL or video ID
     * @returns {string|null} - Extracted video ID or null if invalid
     * @private
     */
    extractVideoId(url) {
      for (const pattern of YOUTUBE_PATTERNS) {
        const match = url.match(pattern);
        if (match) {
          return match[1];
        }
      }
      return null;
    }

    /**
     * Load ad-free video
     * @param {string} videoId - YouTube video ID
     * @private
     */
    loadAdFreeVideo(videoId) {
      consoleLog('INFO', MODULE_NAME_RUN, `Loading video ad-free with ID: ${videoId}`);

      // Dispatch custom event for video load
      const event = new CustomEvent('videoLoad', {
        detail: { videoId },
        bubbles: true
      });

      document.dispatchEvent(event);

      // Embed video via adapter
      j1.adapter.skipad.embedRunVideo(videoId);
    }
  }

  // ---------------------------------------------------------------------------
  // Main Module
  // ---------------------------------------------------------------------------
  return {

    /**
     * Adapter initializer
     * @param {Object} options - Configuration options
     */
    init: (options) => {
      // Default module settings
      const settings = {
        module_name: MODULE_NAME,
        generated: '{{site.time}}',
//      ...options
      };

      // Initialize global variable settings
      logger          = log4javascript.getLogger(MODULE_NAME);

      skipAdDefaults = $.extend({}, {{skipad_defaults | replace: 'nil', 'null' | replace: '=>', ':' }});
      skipAdSettings = $.extend({}, {{skipad_settings | replace: 'nil', 'null' | replace: '=>', ':' }});
      skipAdOptions  = $.extend(true, {}, skipAdDefaults, skipAdSettings);

      // Module initializer with dependency checking
      const dependencies_met_page_ready = setInterval(() => {
        const pageState       = $('#content').css("display");
        const pageVisible     = pageState === 'block';
        const j1CoreFinished  = j1.getState() === 'finished';

        if (j1CoreFinished && pageVisible) {
          const startTimeModule = Date.now();

          j1.adapter.skipad.setState('started');
          logger.debug(`state: ${j1.adapter.skipad.getState()}`);
          logger.info('module initialization started');

          // Initialize InputWrapperHandler
          try {
            window.inputHandler = new InputWrapperHandler();

            // Export for module usage (if applicable)
            if (typeof module !== 'undefined' && module.exports) {
              module.exports = InputWrapperHandler;
            }
          } catch (error) {
            logger.error(`initializing InputWrapperHandler failed: ${error}`);
          }

          j1.adapter.skipad.setState('finished');
          logger.debug(`state: ${j1.adapter.skipad.getState()}`);
          logger.info('module initialization finished');

          const endTimeModule = Date.now();
          logger.info(`module initialization time: ${endTimeModule - startTimeModule}ms`);

          clearInterval(dependencies_met_page_ready);
        }
      }, INIT_POLL_INTERVAL);
    },

    /**
     * embedRunVideo - embed and run YouTube video (over videoJS)
     * @param {string} videoId - YouTube video ID
     */
    embedRunVideo: (videoId) => {
      logger = log4javascript.getLogger(MODULE_NAME_RUN);
      // claude - optimization chances: changed var to const since autoPlay is
      // never reassigned.
      const autoPlay = true;

      logger.debug(`embedding YT video with ID: ${videoId}`);

      // Reset lastState so state change events fire correctly
      // for the new player
      lastState = null;

      const vjsPlayer = createVideoJsPlayer(videoId, {
        title: 'Hazel Brugger · Immer noch wach',
        // general videoJS player events (onStateChange)
        onStateChange: (() => {
          // claude - optimization chances: changed var to let for block-scoped
          // mutable variables.
          let errorNumber = null;
          return (event) => {
            const state = event.data;

            if (state === lastState || errorNumber) {
              return;
            }

            // claude - optimization chances: collapsed switch cases that all
            // performed the identical logger.debug call into a single log
            // statement, with only the 'playing' case retaining its extra
            // doPostOnPlaying() call.
            const stateName = vjsStateEventNameMap[state] || (state < 0 ? 'loadstart' : String(state));
            logger.debug(`changed player to state: ${stateName}`);

            if (vjsStateEventNameMap[state] === 'playing') {
              doPostOnPlaying(state);
            }

            lastState = state;            
          };
        })(),
        // videoJS event player 'onReady'
        onReady: (player) => {
          logger.info('vjs player initialized and ready');

          if (autoPlay) {
            logger.info('vjs player started');

            // =================================================================
            // videoJS player settings
            // -----------------------------------------------------------------
            const vjsPlaybackRates  = skipAdOptions.videoJS.playbackRates.values;          

            // =================================================================
            // videoJS plugin settings
            // ----------------------------------------------------------------- 
            const piAutoCaption     = skipAdOptions.videoJS.plugins.autoCaption;
            const piHotKeys         = skipAdOptions.videoJS.plugins.hotKeys;
            const piSkipButtons     = skipAdOptions.videoJS.plugins.skipButtons;
            const piZoomButtons     = skipAdOptions.videoJS.plugins.zoomButtons;

            // customize the videoJS Player
            // -----------------------------------------------------------------
            logger.debug('customize vjs player (controls)');

            // apply player customization
            // -----------------------------------------------------------------
            const vjsPlayer = player;

            // add custom progressControlSilder
            // -----------------------------------------------------------------

            // create customControlContainer for progressControlSilder|time (display) elements
            const customProgressContainer = vjsPlayer.controlBar.addChild('Component', {
              el: videojs.dom.createEl('div', {
                className: 'vjs-theme-uno custom-progressbar-container'
              })
            });

            // move progressControlSlider into customControlContainer
            const progressControlSlider = vjsPlayer.controlBar.progressControl;
            if (progressControlSlider) {
              customProgressContainer.el().appendChild(progressControlSlider.el());
            }

            // time display
            // -----------------------------------------------------------------
            // move currentTimeDisplay BEFORE the progressControlSilder
            const currentTimeDisplay = vjsPlayer.controlBar.currentTimeDisplay;
            if (currentTimeDisplay) {
              customProgressContainer.el().insertBefore(currentTimeDisplay.el(), progressControlSlider.el());
            }

            // move the durationDisplay AFTER the progressControlSilder
            const durationDisplay = vjsPlayer.controlBar.durationDisplay;
            if (durationDisplay) {
              customProgressContainer.el().appendChild(durationDisplay.el());
            }

            // add|skip playbackRates
            // -----------------------------------------------------------------
            if (skipAdOptions.videoJS.playbackRates.enabled) {
              vjsPlayer.playbackRates(vjsPlaybackRates);
            }

            // add|skip skipButtons plugin
            // -----------------------------------------------------------------
            if (piSkipButtons.enabled) {
              // claude - optimization chances: replaced var with let to avoid
              // re-declaration via var inside the if-block below, which
              // shadowed the outer var and could cause confusion.
              let backwardIndex = piSkipButtons.backward;
              let forwardIndex  = piSkipButtons.forwardIndex;

              // property 'surroundPlayButton' takes precendence
              if (piSkipButtons.surroundPlayButton) {
                backwardIndex = 0;
                forwardIndex  = 1;
              }

              vjsPlayer.skipButtons({
                backwardIndex:  backwardIndex,
                forwardIndex:   forwardIndex,
                backward:       piSkipButtons.backward,
                forward:        piSkipButtons.forward,
              });
            }

            // claude - optimization chances: removed empty click event listener
            // that registered a no-op handler on every video load, leaking
            // listeners across replays.
            
            // (was: vjs_player.addEventListener('click', function(event) { }))
            // scroll page to the players top position
            // -------------------------------------------------------------
            // var vjs_player = document.getElementById(vjsPlayer.id_);
            // vjs_player.addEventListener('click', function(event) {
            //   // place code on 'click'
            // }); // END EventListener 'click'


            // start the (vjs) player (delayed)
            setTimeout(() => vjsPlayer.play(), VIDEO_START_DELAY);
          }
        }
      });
    },

    /**
     * Message handler for inter-module communication
     * @param {string} sender - Sender module identifier
     * @param {Object} message - Message object
     * @returns {boolean} - Success status
     */
    messageHandler: (sender, message) => {
      try {
        const jsonMessage = JSON.stringify(message, null, 2);
        logger.debug(`received message from ${sender}: ${jsonMessage}`);

        // Process commands/actions
        if (message.type === 'command' && message.action === 'module_initialized') {
          logger.info(message.text);
          // Add command handling logic here
        }

        // Add additional message handling here

        return true;
      } catch (error) {
        logger.error(`message handler error: ${error}`);
        return false;
      }
    },

    /**
     * Set the current processing state of the module
     * @param {string} state - New state value
     */
    setState: (state) => {
      moduleState = state;
    },

    /**
     * Get the current processing state of the module
     * @returns {string} - Current state
     */
    getState: () => moduleState
  };
})(j1, window);

{%- endcapture -%}

{%- if production -%}
  {{ cache|minifyJS }}
{%- else -%}
  {{ cache|strip_empty_lines }}
{%- endif -%}

{%- assign cache = false -%}
