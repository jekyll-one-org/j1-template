---
regenerate: true
---

{%- capture cache -%}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/adapter/js/videoPlayer.js
 # Liquid template to adapt the J1 VideoPlayer module
 #
 # Product/Info:
 # https://jekyll.one
 # Copyright (C) 2026 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # For details, see: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 #
 # claude - change skipAd API to local files #1
 # Renamed module from skipAd → videoPlayer.
 # Replaced YouTube player tech (videojs-youtube plugin + all YT-specific
 # parameters) with the video.js native HTML5 tech so that local and remote
 # MP4 / WebM / Ogv files can be played without any third-party dependency.
 #
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
{% assign videoplayer_defaults = modules.defaults.videoPlayer.defaults %}
{% assign videoplayer_settings = modules.videoPlayer.settings %}

{% comment %} Set config options (settings only)
-------------------------------------------------------------------------------- {% endcomment %}
{% assign videoplayer_options = videoplayer_defaults | merge: videoplayer_settings %}

{% comment %} Detect prod mode
-------------------------------------------------------------------------------- {% endcomment %}
{% assign production = false %}
{% if environment == 'prod' or environment == 'production' %}
  {% assign production = true %}
{% endif %}


/*
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/adapter/js/videoPlayer.js
 # J1 Adapter for the J1 VideoPlayer module
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2026 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # For details, see: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 #
 # claude - change skipAd API to local files #1
 # Renamed module from skipAd → videoPlayer.
 # Replaced YouTube player tech (videojs-youtube plugin + all YT-specific
 # parameters) with the video.js native HTML5 tech so that local and remote
 # MP4 / WebM / Ogv files can be played without any third-party dependency.
 #
 # -----------------------------------------------------------------------------
 #  Adapter generated: {{site.time}}
 # -----------------------------------------------------------------------------
 #
*/

// -----------------------------------------------------------------------------
// ESLint shimming
// eslint-disable-next-line
/* global $, j1, window, document, videojs */
// -----------------------------------------------------------------------------
'use strict';
 
// -----------------------------------------------------------------------------
// VideoPlayer module definition
// -----------------------------------------------------------------------------
j1.adapter.videoPlayer = ( function (j1, window) {
 
  // ---------------------------------------------------------------------------
  // Global variables
  // ---------------------------------------------------------------------------
  var environment     = '{{environment}}';
  var cookie_names    = j1.getCookieNames();
  var user_state      = j1.readCookie(cookie_names.user_state);
  var state           = 'null';
 
  var videoPlayerDefaults;
  var videoPlayerSettings;
  var videoPlayerOptions;
 
  var players         = {};   // registry: id → videojs player instance
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
  // Main object
  // ---------------------------------------------------------------------------
  return {
 
    // -------------------------------------------------------------------------
    // init()
    // Module initialiser
    // -------------------------------------------------------------------------
    init: function () {

      // Run initializer
      _this  = j1.adapter.videoPlayer;
      logger = log4javascript.getLogger('j1.adapter.videoPlayer');

      videoPlayerDefaults = $.extend({}, {{videoplayer_defaults | replace: 'nil', 'null' | replace: '=>', ':' }});
      videoPlayerSettings = $.extend({}, {{videoplayer_settings | replace: 'nil', 'null' | replace: '=>', ':' }});
      videoPlayerOptions  = $.extend(true, {}, videoPlayerDefaults, videoPlayerSettings);

      // saved for later use (??? module)
      j1.adapter.videoPlayer.videoPlayerOptions = videoPlayerOptions;
      j1.adapter.videoPlayer.videoData          = {};

      var dependencies_met_page_ready = setInterval (() => {
        var pageState       = $('#content').css("display");
        var pageVisible     = (pageState === 'block') ? true : false;
        var j1CoreFinished  = (j1.getState() === 'finished') ? true : false;

        if (j1CoreFinished && pageVisible) {
          startTimeModule = Date.now();

          // Set module state
          _this.setState('started');
          logger.debug('\n' + 'state: ' + _this.getState());
          logger.info('\n' + 'module is being initialized');

          _this.initialize( videoPlayerOptions );

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
    // initialize()
    // -------------------------------------------------------------------------
    initialize: function ( options ) {
 
      var vjsOptions = options.videoJS;
      var playerCfg  = (vjsOptions.players && vjsOptions.players.native)
                       ? vjsOptions.players.native
                       : {};
 
      // Collect all video containers on the page
      $('[data-videoplayer]').each( function () {
 
        var $container  = $(this);
        var videoId     = $container.attr('id');
        var sources     = _this.buildSources($container, playerCfg);
 
        if ( !videoId ) {
          logger.warn('\n' + 'skipping video container without id attribute');
          return;
        }
 
        if ( !sources.length ) {
          logger.warn('\n' + 'no valid sources found for player: ' + videoId);
          return;
        }
 
        // Build video.js constructor options
        // claude - change skipAd API to local files #1
        // All options are now driven by the native HTML5 tech.
        // YouTube-specific parameters (techOrder: ['youtube'], youtube plugin
        // options object) have been completely removed.
        var vjsInit = {
          controls:       playerCfg.controls   !== undefined ? playerCfg.controls   : true,
          autoplay:       playerCfg.autoplay   !== undefined ? playerCfg.autoplay   : false,
          preload:        playerCfg.preload    || 'auto',
          fluid:          playerCfg.fluid      !== undefined ? playerCfg.fluid      : true,
          fill:           playerCfg.fill       !== undefined ? playerCfg.fill       : false,
          responsive:     playerCfg.responsive !== undefined ? playerCfg.responsive : true,
          playsinline:    playerCfg.playsinline !== undefined ? playerCfg.playsinline : true,
          poster:         _this.resolvePoster($container, playerCfg),
          sources:        sources,
          // techOrder explicitly set to html5 only - no YouTube tech
          // claude - change skipAd API to local files #1
          techOrder:      ['html5'],
          playbackRates:  vjsOptions.playbackRates.enabled
                            ? vjsOptions.playbackRates.values
                            : []
        };
 
        // Apply start / end time via mediainfo if configured
        if ( playerCfg.start ) {
          var startTime = $container.data('start');
          if ( startTime !== undefined ) {
            vjsInit.startTime = parseFloat(startTime);
          }
        }
 
        logger.debug('\n' + 'initializing native player: ' + videoId);
 
        // Create the video.js player instance using the native HTML5 tech
        var player = videojs(videoId, vjsInit);
        players[videoId] = player;
 
        // Wire up plugins
        _this.initPlugins(player, options);
 
        // Wire up events
        _this.bindEvents(player, videoId, playerCfg);
 
        // Auto-start behaviour (mirrors original autoStart setting)
        if ( vjsOptions.autoStart ) {
          player.ready( function () {
            // Honours the 'autoplay' option; manual play() is only called
            // when autoplay is not already handled by the browser.
            if ( !playerCfg.autoplay ) {
              player.play().catch( function (err) {
                logger.warn('\n' + 'autoStart play() was prevented: ' + err.message);
              });
            }
          });
        }
 
      }); // END each data-videoplayer
 
      _this.setState('finished');
      logger.debug('\n' + 'state: ' + _this.getState());
      logger.info('\n' + 'module initialization finished');
 
    }, // END initialize
 
    // -------------------------------------------------------------------------
    // buildSources()
    // Reads data-src-* attributes from the container element and assembles
    // the video.js sources array in the priority order defined by sourceOrder.
    //
    // claude - change skipAd API to local files #1
    // Replaces the single YouTube URL approach with a multi-source array so
    // that local or remote MP4 / WebM / Ogv files are handled natively.
    //
    // Expected data attributes on the container element:
    //   data-src-mp4  = "/assets/video/my-video.mp4"
    //   data-src-webm = "/assets/video/my-video.webm"   (optional)
    //   data-src-ogv  = "/assets/video/my-video.ogv"    (optional)
    // -------------------------------------------------------------------------
    buildSources: function ( $container, playerCfg ) {
 
      var mimeMap = {
        mp4:  'video/mp4',
        webm: 'video/webm',
        ogv:  'video/ogg'
      };
 
      var order   = (playerCfg.sourceOrder && playerCfg.sourceOrder.length)
                    ? playerCfg.sourceOrder
                    : ['mp4', 'webm', 'ogv'];
 
      var sources = [];
 
      order.forEach( function (ext) {
        var url = $container.data('src-' + ext);
        if ( url ) {
          sources.push({ src: url, type: mimeMap[ext] || ('video/' + ext) });
        }
      });
 
      // Fallback: single data-src attribute with automatic type detection
      if ( !sources.length ) {
        var fallbackSrc = $container.data('src');
        if ( fallbackSrc ) {
          var ext = fallbackSrc.split('?')[0].split('.').pop().toLowerCase();
          sources.push({ src: fallbackSrc, type: mimeMap[ext] || 'video/mp4' });
        }
      }
 
      return sources;
    }, // END buildSources
 
    // -------------------------------------------------------------------------
    // resolvePoster()
    // Returns the poster image URL for the player.
    // Prefers data-poster on the element, falls back to config defaults.
    //
    // claude - change skipAd API to local files #1
    // Removed YouTube maxresdefault.jpg thumbnail logic; poster is now a
    // plain local path attribute or the configured default_poster.
    // -------------------------------------------------------------------------
    resolvePoster: function ( $container, playerCfg ) {
 
      var dataPoster = $container.data('poster');
      if ( dataPoster ) { return dataPoster; }
 
      // Config-level poster filename relative to the video source location
      if ( playerCfg.poster ) {
        var src = $container.data('src-mp4') || $container.data('src');
        if ( src ) {
          var base = src.substring(0, src.lastIndexOf('/') + 1);
          return base + playerCfg.poster;
        }
      }
 
      return playerCfg.default_poster || '';
    }, // END resolvePoster
 
    // -------------------------------------------------------------------------
    // initPlugins()
    // Wire up optional video.js plugins based on merged config.
    // The plugin API (skipButtons, hotKeys, zoomButtons, autoCaption) is
    // unchanged from the original skipAd implementation.
    // -------------------------------------------------------------------------
    initPlugins: function ( player, options ) {
 
      var plugins = options.videoJS.plugins;
 
      // skipButtons plugin
      if ( plugins.skipButtons && plugins.skipButtons.enabled ) {
        if ( typeof player.skipButtons === 'function' ) {
          player.skipButtons({
            forward:            plugins.skipButtons.forward,
            backward:           plugins.skipButtons.backward,
            forwardIndex:       plugins.skipButtons.forwardIndex,
            backwardIndex:      plugins.skipButtons.backwardIndex,
            surroundPlayButton: plugins.skipButtons.surroundPlayButton
          });
        } else {
          logger.warn('\n' + 'skipButtons plugin not available');
        }
      }
 
      // hotKeys plugin
      if ( plugins.hotKeys && plugins.hotKeys.enabled ) {
        if ( typeof player.hotKeys === 'function' ) {
          player.hotKeys({
            seekStep:                   plugins.hotKeys.seekStep,
            volumeStep:                 plugins.hotKeys.volumeStep,
            alwaysCaptureHotkeys:       plugins.hotKeys.alwaysCaptureHotkeys,
            captureDocumentHotkeys:     plugins.hotKeys.captureDocumentHotkeys,
            enableFullscreen:           plugins.hotKeys.enableFullscreen,
            enableHoverScroll:          plugins.hotKeys.enableHoverScroll,
            enableInactiveFocus:        plugins.hotKeys.enableInactiveFocus,
            enableJogStyle:             plugins.hotKeys.enableJogStyle,
            enableMute:                 plugins.hotKeys.enableMute,
            enableModifiersForNumbers:  plugins.hotKeys.enableModifiersForNumbers,
            enableNumbers:              plugins.hotKeys.enableNumbers,
            enableVolumeScroll:         plugins.hotKeys.enableVolumeScroll,
            skipInitialFocus:           plugins.hotKeys.skipInitialFocus
          });
        } else {
          logger.warn('\n' + 'hotKeys plugin not available');
        }
      }
 
      // zoomButtons plugin
      if ( plugins.zoomButtons && plugins.zoomButtons.enabled ) {
        if ( typeof player.zoomButtons === 'function' ) {
          player.zoomButtons({
            moveX:   plugins.zoomButtons.moveX,
            moveY:   plugins.zoomButtons.moveY,
            rotate:  plugins.zoomButtons.rotate,
            zoom:    plugins.zoomButtons.zoom
          });
        } else {
          logger.warn('\n' + 'zoomButtons plugin not available');
        }
      }
 
      // autoCaption plugin
      if ( plugins.autoCaption && plugins.autoCaption.enabled ) {
        if ( typeof player.autoCaption === 'function' ) {
          player.autoCaption();
        } else {
          logger.warn('\n' + 'autoCaption plugin not available');
        }
      }
 
    }, // END initPlugins
 
    // -------------------------------------------------------------------------
    // bindEvents()
    // Attach video.js player event listeners.
    // -------------------------------------------------------------------------
    bindEvents: function ( player, videoId, playerCfg ) {
 
      player.on('ready', function () {
        logger.debug('\n' + 'player ready: ' + videoId);
      });
 
      player.on('play', function () {
        logger.debug('\n' + 'player play: ' + videoId);
      });
 
      player.on('ended', function () {
        logger.debug('\n' + 'player ended: ' + videoId);
        // Honour end-time trimming if the player has a configured end point
        var endTime = $(player.el()).closest('[data-videoplayer]').data('end');
        if ( endTime !== undefined && playerCfg.end ) {
          player.currentTime(0);
          player.pause();
        }
      });
 
      player.on('error', function () {
        var err = player.error();
        logger.error('\n' + 'player error [' + videoId + ']: '
          + (err ? err.code + ' - ' + err.message : 'unknown'));
      });
 
      // Enforce end-time trimming during playback
      if ( playerCfg.end ) {
        player.on('timeupdate', function () {
          var $el   = $(player.el()).closest('[data-videoplayer]');
          var end   = parseFloat($el.data('end'));
          if ( !isNaN(end) && player.currentTime() >= end ) {
            player.pause();
            player.currentTime(end);
          }
        });
      }
 
    }, // END bindEvents
 
    // -------------------------------------------------------------------------
    // getPlayer()
    // Returns a registered player instance by element id.
    // -------------------------------------------------------------------------
    getPlayer: function ( videoId ) {
      return players[videoId] || null;
    },
 
    // -------------------------------------------------------------------------
    // destroyPlayer()
    // Disposes a player and removes it from the registry.
    // -------------------------------------------------------------------------
    destroyPlayer: function ( videoId ) {
      var player = players[videoId];
      if ( player ) {
        player.dispose();
        delete players[videoId];
        logger.info('\n' + 'player disposed: ' + videoId);
      }
    },
 
    // -------------------------------------------------------------------------
    // State management (unchanged from original module pattern)
    // -------------------------------------------------------------------------
    setState: function ( state ) {
      _this.state = state;
    },
 
    getState: function () {
      return _this.state;
    }
 
  }; // END return
 
})( j1, window );

{%- endcapture -%}

{%- if production -%}
  {{ cache|minifyJS }}
{%- else -%}
  {{ cache|strip_empty_lines }}
{%- endif -%}

{%- assign cache = false -%}
