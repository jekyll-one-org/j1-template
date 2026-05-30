---
regenerate:                             true
---

{%- capture cache -%}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/adapter/js/gallery.js (7)
 # JS Adapter for the module J1 Gallery (justifiedGallery)
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2026 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 # -----------------------------------------------------------------------------
{% endcomment %}

{% comment %} Liquid procedures
-------------------------------------------------------------------------------- {% endcomment %}

{% comment %} Set global settings
-------------------------------------------------------------------------------- {% endcomment %}
{% assign environment       = site.environment %}
{% assign template_version  = site.version %}

{% comment %} Process YML config data
================================================================================ {% endcomment %}

{% comment %} Set config files
-------------------------------------------------------------------------------- {% endcomment %}
{% assign template_config   = site.data.j1_config %}
{% assign modules           = site.data.modules %}

{% comment %} Set config data
-------------------------------------------------------------------------------- {% endcomment %}

{% comment %} split J1 Gallery data #1
--------------------------------------------------------------------------------
   The single data file gallery.yml was split into two files, loaded here:

    - gallery_control  per-gallery configuration  (modules.gallery_control)
    - gallery_media    per-gallery media content  (modules.gallery_media)

   Modeled on the Masonry scaffold (masonry_control.yml, masonry_media.yml)
-------------------------------------------------------------------------------- {% endcomment %}
{% assign gallery_defaults  = modules.defaults.gallery.defaults %}
{% assign gallery_control   = modules.gallery_control.settings %}
{% assign gallery_media     = modules.gallery_media.settings %}

{% comment %} Set config options
-------------------------------------------------------------------------------- {% endcomment %}
{% comment %} split J1 Gallery data #1
  Deep-merge top-level config (defaults <- control <- playlist) for the
  top-level option keys. The per-gallery merge (config + content) is done
  ID-wise in initGallery below. Control + playlist galleries are sorted by
  `id` so each control config can be matched to its content by `id`.
-------------------------------------------------------------------------------- {% endcomment %}

{% comment %} split J1 Gallery data #2
--------------------------------------------------------------------------------
  CHAINED deep_merge to match the Masonry adapter exactly:

    masonry.js:  masonry_default | deep_merge: masonry_control | deep_merge: masonry_media

  The previous comma form (`deep_merge: gallery_control, gallery_media`) passes
  gallery_media as a stray second positional argument the deep_merge filter does
  not consume, dropping the media layer. Chaining applies defaults <- control
  <- media in order, identical to the per-gallery merge done in initGallery.
-------------------------------------------------------------------------------- {% endcomment %}
{% assign gallery_options   = gallery_defaults | deep_merge: gallery_control | deep_merge: gallery_media %}

{% assign controls_sorted   = gallery_control.galleries  | sort: 'id' %}
{% assign media_sorted      = gallery_media.galleries | sort: 'id' %}
{% assign galleries         = controls_sorted %}


{% comment %} Detect prod mode
-------------------------------------------------------------------------------- {% endcomment %}
{% assign production = false %}
{% if environment == 'prod' or environment == 'production' %}
  {% assign production = true %}
{% endif %}


/*
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/adapter/js/gallery.js (7)
 # JS Adapter for the module J1 Gallery (justifiedGallery)
 #
 # Product/Info:
 # https://jekyll.one
 # https://github.com/miromannino/Justified-Gallery
 #
 # Copyright (C) 2020 Miro Mannino
 # Copyright (C) 2026 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 # Justified Gallery is licensed under the MIT license
 # See: https://github.com/miromannino/Justified-Gallery/blob/master/LICENSE
 # -----------------------------------------------------------------------------
 # Adapter generated: {{site.time}}
 # -----------------------------------------------------------------------------
*/

// -----------------------------------------------------------------------------
// ESLint shimming
// -----------------------------------------------------------------------------
/* eslint indent: "off"                                                       */
// -----------------------------------------------------------------------------
"use strict";
j1.adapter.gallery = ((j1, window) => {

  const environment = '{{environment}}';
  const isDev       = (environment === "development" || environment === "dev") ? true : false;

  {% comment %} Global variables
  ------------------------------------------------------------------------------ {% endcomment %}
  
  var state         = 'not_started';
  var play_button   = '/assets/theme/j1/modules/lightGallery/css/themes/uno/icons/play-button.png';

  var url;
  var origin;
  var galleryDefaults;
  var gallerySettings;
  var galleryOptions;
  var galleries;

  var _this;
  var logger;
  var logText;

  // date|time
  var startTime;
  var endTime;
  var startTimeModule;
  var endTimeModule;
  var timeSeconds;

  // J1 Adapter optimizations #1
  // safety-timeout handle for the bounded page-ready poller below.
  //
  var dependenciesTimeout;

  // ---------------------------------------------------------------------------
  // helper functions
  // ---------------------------------------------------------------------------

  // ---------------------------------------------------------------------------
  // main
  // ---------------------------------------------------------------------------
  return {

    // -------------------------------------------------------------------------
    // adapter initializer
    // -------------------------------------------------------------------------
    init: (options) => {
      url    = new URL(window.location.href);
      origin = url.origin;

      // flag used for Chromium browser workaround
      j1['jg'] = {
        callback:   {},
      };

      // -----------------------------------------------------------------------
      // default module settings
      // -----------------------------------------------------------------------
      var settings = $.extend({
        module_name: 'j1.adapter.gallery',
        generated:   '{{site.time}}'
      }, options);

      // -----------------------------------------------------------------------
      // global variable settings
      // -----------------------------------------------------------------------
      _this  = j1.adapter.gallery;
      logger = log4javascript.getLogger('j1.adapter.gallery');

      // Load  module DEFAULTS|CONFIG
      // split J1 Gallery data #1
      // `gallery_settings` (modules.gallery.settings) was replaced by the
      // split control config (modules.gallery_control.settings). The runtime
      // only needs per-gallery `id` and `enabled` (used by loadGalleryHTML),
      // both of which live in the control file.
      //
      // split J1 Gallery data #2
      // Adopt the Masonry overload strategy on the JS side: deep-extend the
      // serialized sources in the SAME order the Liquid layer uses
      // (defaults <- control), then set `galleries` EXPLICITLY
      // to the control array — mirroring `masonryOptions.grids =
      // masonryPlayer.players;` in masonry.js. jQuery `$.extend(true, ...)`
      // merges arrays index-by-index rather than replacing them, so reading
      // the array straight off the control source avoids any accidental
      // element-wise blending and keeps the loadGalleryHTML(options, galleries)
      // contract (which only inspects `id` and `enabled`) intact.
      //
      galleryDefaults = $.extend({}, {{gallery_defaults | replace: 'nil', 'null' | replace: '=>', ':' }});
      gallerySettings = $.extend({}, {{gallery_control  | replace: 'nil', 'null' | replace: '=>', ':' }});
      galleryOptions  = $.extend(true, {}, galleryDefaults, gallerySettings);      
      galleries       = gallerySettings.galleries;

      // load HTML portion for all galleries configured
      _this.loadGalleryHTML(galleryOptions, galleries);

      // -----------------------------------------------------------------------
      // module initializer
      // -----------------------------------------------------------------------
      var dependency_met_page_ready = setInterval (() => {
        var pageState      = $('#content').css("display");
        var pageVisible    = (pageState === 'block') ? true : false;
        var j1CoreFinished = (j1.getState() === 'finished') ? true : false;

        if (j1CoreFinished && pageVisible) {
          startTimeModule = Date.now();

          // initialize state flag
          _this.setState('started');
          logger.debug('\n' + 'state: ' + _this.getState());
          logger.info('\n' + 'module is being initialized');

         // workaround to delay/wait for HTML loads are finished
          setTimeout(() => {
            _this.initGallery(galleryOptions);

            _this.setState('finished');
            logger.debug('\n' + 'state: ' + _this.getState());
            logger.info('\n' + 'module initialized successfully');

            endTimeModule = Date.now();
            logger.info('\n' + 'module initializing time: ' + (endTimeModule-startTimeModule) + 'ms');

          }, 500);

          clearInterval(dependency_met_page_ready);
          // J1 Adapter optimizations #1
          // clear safety timeout on the happy path
          //
          if (dependenciesTimeout) {
            clearTimeout(dependenciesTimeout);
            dependenciesTimeout = null;
          }
        } // END 'finished' && 'pageVisible'
      }, 10); // END dependency_met_page_ready

      // J1 Adapter optimizations #1
      // bound the page-ready poller. Previously, if `#content` never reached
      // `display: block` or j1.getState() never reached 'finished' (e.g. a
      // bug elsewhere in the boot sequence, an aborted navigation, an
      // extension hiding #content), this 10ms interval ran for the lifetime
      // of the tab. Cap it and log a warning so the failure mode is
      // visible in the console instead of silently burning CPU.
      //
      dependenciesTimeout = setTimeout(function () {
        if (dependency_met_page_ready) {
          clearInterval(dependency_met_page_ready);
          logger.warn('\n' + 'gallery init aborted: page-ready conditions not met within 5s');
        }
      }, 5000);
    }, // END init

    // -------------------------------------------------------------------------
    // Load AJAX data and initialize the jg gallery
    // -------------------------------------------------------------------------
    initGallery: (options) => {
      var xhrLoadState      = 'pending';
      var load_dependencies = {};
      var logger            = log4javascript.getLogger('j1.adapter.gallery.initialize');
      var dependency;

      _this.setState('running');
      logger.debug('\n' + 'state: ' + _this.getState());

      {% comment %} split J1 Gallery data #1
      --------------------------------------------------------------------------
        Iterate the ID-sorted control galleries. For each entry, look up the
        matching playlist entry by `id` and deep_merge the playlist content
        into the control config (gallery_defaults <- control <- playlist).
        The resulting `gallery` exposes the same keys as before, so the
        per-gallery JS generation below is unchanged.
      -------------------------------------------------------------------------- {% endcomment %}
      {% for gallery_item in galleries %}
        {% assign playlist_match = media_sorted | where: 'id', gallery_item.id | first %}
        {% if playlist_match %}
          {% assign gallery = gallery_defaults | deep_merge: gallery_item | deep_merge: playlist_match %}
        {% else %}
          {% assign gallery = gallery_defaults | deep_merge: gallery_item %}
        {% endif %}
        {% assign gallery_arg  = gallery %}

        // Debug gallery argument
        // ---------------------------------------------------------------------
        /* gallery: {{gallery_arg}}                                             */

        {% if gallery.enabled %}
          {% assign gallery_id = gallery.id %}

          var galleryID = document.getElementById("{{gallery_id}}");
          if ( galleryID !== null) {
            logger.info('\n' + 'found gallery in page on id: ' + '{{gallery_id}}');

            // create dynamic loader variable to setup the grid on id {{gallery_id}}
            dependency = 'dependencies_met_html_loaded_{{gallery_id}}';
            load_dependencies[dependency] = '';

            // initialize the gallery if HTML portion successfully loaded
            //
            load_dependencies['dependencies_met_html_loaded_{{gallery_id}}'] = setInterval (() => {
              // check if HTML portion of the gallery is loaded successfully
              xhrLoadState = j1.xhrDOMState['#{{gallery_id}}_parent'];
              if (xhrLoadState === 'success') {
                var $grid_{{gallery_id}} = $('#{{gallery_id}}');                  // used for later access

                logger.debug('\n' + 'dyn_loader, initialize gallery on id: ' + '{{gallery_id}}');

                j1.jg.callback.{{gallery_id}} = 'waiting';

                /* eslint-disable */
                $('#{{gallery_id}}').justifiedGallery({
                  {% for option in gallery.gallery_options %}
                  {% if option[0] contains "gutters" %}
                  {{'margins' | json}}: {{option[1] | json}},
                  {% continue %}
                  {% endif %}
                  {{option[0] | json}}: {{option[1] | json}},
                  {% endfor %}
                })
                .on('jg.complete', (evt) => {
                  evt.stopPropagation();

                  j1.jg.callback.{{gallery_id}} = 'successful';

                  // setup the lightbox
                  //
                  logger.debug('\n' + 'dyn_loader, callback "jg.complete" entered on id: ' + '{{gallery_id}}');
                  logger.debug('\n' + 'dyn_loader, initialize lightGallery on id: ' + '{{gallery_id}}');

                  var lg = document.getElementById("{{gallery_id}}");
                  lightGallery(lg, {
                    "plugins":    [{{gallery.lightGallery.plugins}}],
                    {% for option in gallery.lightGallery.options %}
                    {{option[0] | json}}: {{option[1] | json}},
                    {% endfor %}
                    "galleryId":  "{{gallery_id}}",
                    "selector":   ".lg-item",
                    {% if gallery.video == 'html5' and gallery.lightGallery.videojsOptions.enabled %}
                    "videojsOptions": {
                      {% for option in gallery.lightGallery.videojsOptions %}
                      {% if option[0] contains "enabled" %}
                      {% continue %}
                      {% endif %}
                      {{option[0] | json}}: {{option[1] | json}},
                      {% endfor %}
                    }
                    {% endif %}

                    {% if gallery.video == 'youtube' and gallery.lightGallery.playerParams.enabled %}
                    "youTubePlayerParams": {
                      {% for option in gallery.lightGallery.playerParams %}
                      {% if option[0] contains "enabled" %}
                      {% continue %}
                      {% endif %}
                      {{option[0] | json}}: {{option[1] | json}},
                      {% endfor %}
                      "origin": "origin"
                    },
                    {% endif %}

                    {% if gallery.video == 'youtube' and gallery.lightGallery.videojsOptions.enabled %}
                    "videojsOptions": {
                      {% for option in gallery.lightGallery.videojsOptions %}
                      {% if option[0] contains "enabled" %}
                      {% continue %}
                      {% endif %}
                      {{option[0] | json}}: {{option[1] | json}},
                      {% endfor %}
                    }
                    {% endif %}

                  }); // END lightGallery

                }); // END justifiedGallery on('jg.complete)
                /* eslint-enable */

                // workaround for Chromium brwosers if callback jg.complete
                // NOT fired
                //
                setTimeout(() => {
                  if (j1.jg.callback.{{gallery_id}} == 'waiting') {
                    logger.debug('\n' + 'dyn_loader, callback "jg.callback": ' + j1.jg.callback.{{gallery_id}})
                    logger.debug('\n' + 'dyn_loader, initialize lightGallery on id: ' + '{{gallery_id}}');

                    var lg = document.getElementById("{{gallery_id}}");
                    lightGallery(lg, {
                      "plugins":    [{{gallery.lightGallery.plugins}}],
                      {% for option in gallery.lightGallery.options %}
                      {{option[0] | json}}: {{option[1] | json}},
                      {% endfor %}
                      "galleryId":  "{{gallery_id}}",
                      "selector":   ".lg-item",
                      {% if gallery.video == 'html5' and gallery.lightGallery.videojsOptions.enabled %}
                      "videojsOptions": {
                        {% for option in gallery.lightGallery.videojsOptions %}
                        {% if option[0] contains "enabled" %}
                        {% continue %}
                        {% endif %}
                        {{option[0] | json}}: {{option[1] | json}},
                        {% endfor %}
                      }
                      {% endif %}

                      {% if gallery.video == 'youtube' and gallery.lightGallery.playerParams.enabled %}
                      "youTubePlayerParams": {
                        {% for option in gallery.lightGallery.playerParams %}
                        {% if option[0] contains "enabled" %}
                        {% continue %}
                        {% endif %}
                        {{option[0] | json}}: {{option[1] | json}},
                        {% endfor %}
                        "origin": "origin"
                      }
                      {% endif %}

                    }); // END lightGallery
                  } // END if j1.jg.callback
                }, 1000); // END timeout

                clearInterval(load_dependencies['dependencies_met_html_loaded_{{gallery_id}}']);
                // J1 Adapter optimizations #1
                // clear the per-gallery safety timeout on the happy path
                //
                if (load_dependencies['html_loaded_timeout_{{gallery_id}}']) {
                  clearTimeout(load_dependencies['html_loaded_timeout_{{gallery_id}}']);
                  load_dependencies['html_loaded_timeout_{{gallery_id}}'] = null;
                }
              } // END  if xhrLoadState === 'success'
            }, 10); // END dependencies_met_html_loaded

            // J1 Adapter optimizations #1
            // bound the per-gallery HTML-loaded poller. The condition
            // `j1.xhrDOMState[#{{gallery_id}}_parent] === 'success'` depends
            // on the AJAX fetch in loadGalleryHTML() completing. A 404, a
            // network error, or the placeholder DIV missing in the content
            // page would otherwise leave this 10ms interval running for
            // the lifetime of the tab — once per configured gallery, so
            // the cost compounds. Cap at 30s and log a warning that names
            // the gallery id so the failing fetch is debuggable.
            //
            load_dependencies['html_loaded_timeout_{{gallery_id}}'] = setTimeout(function () {
              if (load_dependencies['dependencies_met_html_loaded_{{gallery_id}}']) {
                clearInterval(load_dependencies['dependencies_met_html_loaded_{{gallery_id}}']);
                logger.warn('\n' + 'gallery init aborted for {{gallery_id}}: HTML did not load within 30s (xhrDOMState=' + j1.xhrDOMState['#{{gallery_id}}_parent'] + ')');
              }
            }, 30000);

          }

        {% endif %} // ENDIF gallery enabled
      {% endfor %}
    }, // END initGallery

    // -------------------------------------------------------------------------
    // loadGalleryHTML()
    // loads the HTML portion via AJAX for all galleries configured.
    // NOTE: Make sure the placeholder DIV is available in the content
    // page as generated using the Asciidoc extension gallery::
    // split J1 Gallery data #2
    // Signature aligned with masonry.js `loadGridHTML: (options, grid)`: the
    // gallery array is taken from the explicit `galleries` argument supplied
    // by init() (galleries) rather than re-read off `options`.
    // -------------------------------------------------------------------------
    loadGalleryHTML: (options, galleries) => {
      var numGalleries  = Object.keys(galleries).length;
      var active_grids  = numGalleries;
      var xhr_data_path = options.xhr_data_path + '/index.html';
      var xhr_container_id;

      isDev && console.debug('j1.adapter.gallery: number of galleries found: ' + active_grids);
      _this.setState('load_data');

      Object.keys(galleries).forEach((key) => {
        if (galleries[key].enabled) {
          xhr_container_id = galleries[key].id + '_parent';

          isDev && console.debug('j1.adapter.gallery: load HTML portion on gallery id: ' + galleries[key].id);
          j1.loadHTML({
            xhr_container_id: xhr_container_id,
            xhr_data_path:    xhr_data_path,
            xhr_data_element: galleries[key].id
          });
        } else {
          isDev && console.debug('j1.adapter.gallery: gallery found disabled on id: ' + galleries[key].id);
          active_grids--;
        }
      });

      isDev && console.debug('j1.adapter.gallery: galleries loaded in page enabled|all: ' + active_grids + '|' + numGalleries);
      _this.setState('data_loaded');
    }, // END loadGalleryHTML

    // -------------------------------------------------------------------------
    // messageHandler()
    // manage messages send from other J1 modules
    // -------------------------------------------------------------------------
    messageHandler: (sender, message) => {
      var json_message = JSON.stringify(message, undefined, 2);

      logText = 'received message from ' + sender + ': ' + json_message;
      logger.debug('\n' + logText);

      // -----------------------------------------------------------------------
      //  process commands|actions
      // -----------------------------------------------------------------------
      if (message.type === 'command' && message.action === 'module_initialized') {

        //
        // place handling of command|action here
        //

        logger.info('\n' + message.text);
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