---
regenerate:                             true
---

{%- capture cache -%}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/adapter/js/gallery.js (8)
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

{% comment %} claude - Fix J1 Gallery YAML data processing #1
 # -----------------------------------------------------------------------------
 # PER-GALLERY CONFIG INHERITANCE CHAIN (adapter)
 #
 #   gallery settings -> overload user settings -> overload default settings
 #
 # Effective settings for ONE gallery instance are now built as a DEEP merge
 # of the config layers (later layers overwrite earlier layers PER KEY,
 # missing keys fall through):
 #
 #   1. _data/modules/defaults/gallery.yml  (defaults ..............)  base
 #   2. _data/modules/gallery_control.yml   (settings, w/o galleries)  user
 #   3. _data/modules/gallery_control.yml   (settings.galleries[] ...)  gallery
 #
 # Media content (_data/modules/gallery_media.yml) is NOT part of the option
 # chain: its payload is per-gallery content (images|videos) merged ID-wise
 # into the Liquid var 'gallery' of initGallery(), not runtime options.
 #
 # ROOT CAUSE
 #
 #   Same defect as the one fixed for the AmplitudeJS adapter by the fix
 #   series "claude - Fix Amplitude YAML data processing":
 #
 #   • Liquid: BOTH merge sites used the SHALLOW 'merge' filter (although
 #     the surrounding comments already refer to deep_merge, and although
 #     gallery_control.yml was DE-DUPLICATED against the defaults by
 #     the prior series (split J1 Gallery data, fix 2) on exactly that
 #     assumption). A shallow
 #     merge replaces a top-level key INCLUDING its complete subtree, so
 #     every subtree a gallery touches loses ALL sibling default keys:
 #     e.g. jg_old_times sets lightGallery.plugins only and thereby drops
 #     lightGallery.options (licenseKey, download, alignThumbnails,
 #     animateThumb, autoplayFirstVideo) -> the generated lightGallery()
 #     call of that instance was rendered WITHOUT any of those options.
 #     Every video gallery lost the complete videojsOptions defaults
 #     (muted, preload, controls, controlBar.playbackRates, ...) the same
 #     way. The MORE galleries configured per page, the more instances hit
 #     it — each one differently, depending on the subtrees it touches.
 #   • Liquid: the USER layer (the GLOBAL keys of gallery_control.yml) was
 #     not part of the per-gallery chain at all (the chain started at the
 #     defaults and jumped straight to the gallery entry).
 #   • Liquid: gallery_options merged in gallery_media, whose 'galleries'
 #     array (media content ONLY) replaced the control 'galleries' array
 #     wholesale (arrays are replaced, not merged).
 #   • JS: galleryOptions was built with $.extend(true, ...), which merges
 #     ARRAYS INDEX-BY-INDEX instead of replacing them, and the per-gallery
 #     'enabled' state was read RAW off the control entry (no fallthrough
 #     to the user or default layer).
 #
 # Changes (all tagged "claude - Fix J1 Gallery YAML data processing #1"):
 #
 #   • Liquid: gallery_options — global chain built with deep_merge
 #     (defaults <- control/user); gallery_media is NOT merged any more.
 #   • Liquid: initGallery() — the per-gallery loop builds 'gallery' from
 #     the FULL chain gallery_options <- gallery_item <- playlist_match,
 #     using deep_merge at every step.
 #   • JS: _deepMerge(target, ...sources) — deep merge helper (plain
 #     objects merged recursively, ARRAYS REPLACE as a whole, scalars
 #     overload; same semantics as the AmplitudeJS adapter fix #1 and the
 #     J1 VideoPlayer adapter fix #48).
 #   • JS: _self() — module-scope helper resolving the module object
 #     independent of the init() state (_this || j1.adapter.gallery), used
 #     at all _deepMerge()|getInstanceOptions() call sites (AmplitudeJS
 #     adapter fix #2 hardening, ported).
 #   • JS: getInstanceOptions(galleryId) — public method returning the
 #     cached EFFECTIVE options object for ONE gallery instance (defaults
 #     <- user settings <- gallery entry). Exposed as
 #     j1.adapter.gallery.galleryInstanceOptions and
 #     j1.adapter.gallery.galleryOptions.
 #   • JS: init() — galleryOptions is built by _deepMerge() from the USER
 #     layer (control settings w/o the per-gallery array 'galleries').
 #   • JS: loadGalleryHTML() — the per-gallery 'enabled' gate is resolved
 #     from the EFFECTIVE chain by getInstanceOptions().
 #
 # NOTE: 'gallery_options' carries the control 'galleries' array along as a
 # top-level key, so the merged Liquid var 'gallery' exposes a (stray) key
 # 'gallery.galleries'. It is NEVER read downstream — same situation as
 # 'amplitude_options.players' in the AmplitudeJS adapter. On the JS side
 # the key is filtered out of the user layer explicitly.
 # ----------------------------------------------------------------------------- {% endcomment %}

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
  The previous comma form (`deep_merge: gallery_control, gallery_media`) passes
  gallery_media as a stray second positional argument the deep_merge filter does
  not consume, dropping the media layer. Chaining applies defaults <- control
  <- media in order, identical to the per-gallery merge done in initGallery.  
-------------------------------------------------------------------------------- {% endcomment %}

{% comment %} claude - Fix J1 Gallery YAML data processing #1
--------------------------------------------------------------------------------
  GLOBAL options: DEEP merge of the chain defaults <- control (user settings).

  Two defects of the former line are fixed here:

   1. 'merge' is the SHALLOW Liquid filter (see the note in the J1
      VideoPlayer adapter): ANY key set on a higher layer dropped ALL
      sibling default keys of that subtree. The chain needs 'deep_merge' —
      the filter the comments above already refer to and the one the
      Masonry adapter uses (masonry.js).
   2. The media file is NO LONGER merged in: its only payload is the
      per-gallery media content (settings.galleries[].images|videos). Its
      'galleries' array replaced the CONTROL 'galleries' array of
      gallery_options wholesale, leaving gallery_options.galleries without
      ANY per-gallery configuration. The media content is merged ID-wise
      in the initGallery() loop below.

  gallery_options is the USER-EFFECTIVE layer (defaults <- user settings)
  and the base of the per-gallery chain built in initGallery().

  Original (deprecated, preserved for reference):
  {% assign gallery_options   = gallery_defaults | merge: gallery_control | merge: gallery_media %}
-------------------------------------------------------------------------------- {% endcomment %}
{% assign gallery_options   = gallery_defaults | merge: gallery_control %}

{% assign controls_sorted   = gallery_control.galleries | sort: 'id' %}
{% assign media_sorted      = gallery_media.galleries   | sort: 'id' %}
{% assign galleries         = controls_sorted %}

{% comment %} Detect prod mode
-------------------------------------------------------------------------------- {% endcomment %}
{% assign production = false %}
{% if environment == 'prod' or environment == 'production' %}
  {% assign production = true %}
{% endif %}


/*
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/adapter/js/gallery.js (8)
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

  {% comment %} Set global constants
  ------------------------------------------------------------------------------ {% endcomment %}

  const MODULE_NAME     = 'j1.adapter.gallery';
  const CONSOLE_LOG_ID  = Math.random().toString(36).substring(2, 13);
  const env             = j1.getEnv();
  const isDev           = (env === 'dev') ? true : false;

  {% comment %} Global variables
  ------------------------------------------------------------------------------ {% endcomment %}
  
  var state             = 'not_started';
  var play_button       = '/assets/theme/j1/modules/lightGallery/css/themes/uno/icons/play-button.png';

  var url;
  var origin;
  var galleryDefaults;
  var gallerySettings;
  var galleryOptions;
  var galleries;

  // claude - Fix J1 Gallery YAML data processing #1
  // Per-instance options cache, keyed by galleryId. Each cache entry is the
  // deep merge of the inheritance chain:
  //   gallery settings -> overload user settings -> overload default settings
  // Populated lazily by getInstanceOptions().
  //
  var galleryInstanceOptions = {};

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

  // claude - Fix J1 Gallery YAML data processing #1
  // _self()
  // Resolves the module object independent of the init() state. The module
  // keeps its self-reference in the module-scoped var _this that is bound
  // INSIDE init() only. Any method called before|outside init() would fail
  // on _this being 'undefined'. Because init() and all module methods are
  // ARROW functions, 'this' is NOT bound to the module object and cannot be
  // used here. j1.adapter.gallery is assigned when the module IIFE returned,
  // so the fallback is valid at ANY runtime call (evaluated lazily, NOT at
  // module load time). Ported from the AmplitudeJS adapter (fix #2), where
  // an unbound _this crashed init() on EVERY page load.
  //
  var _self = () => (_this || j1.adapter.gallery);


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
        module_name:  MODULE_NAME,
        generated:    '{{site.time}}'
      }, options);

      // -----------------------------------------------------------------------
      // global variable settings
      // -----------------------------------------------------------------------
      _this  = j1.adapter.gallery;
      logger = log4javascript.getLogger(MODULE_NAME);

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

      {% comment %} claude - Fix J1 Gallery YAML data processing #1
      --------------------------------------------------------------------------
      Build the GLOBAL (module-level) options with the _deepMerge helper
      (chain: defaults <- user settings). The user layer are the GLOBAL keys
      of gallery_control.yml (settings w/o the per-gallery array
      'galleries'). $.extend(true, ...) merged ARRAYS INDEX-BY-INDEX instead
      of replacing them, so any array of the user layer was blended with the
      defaults element-wise. Reset + expose the PER-INSTANCE options cache
      so the module can read the effective per-gallery chain via
      j1.adapter.gallery.galleryInstanceOptions[galleryId] resp.
      j1.adapter.gallery.getInstanceOptions(galleryId).

      Original (deprecated, preserved for reference):
        galleryOptions  = $.extend(true, {}, galleryDefaults, gallerySettings);
      -------------------------------------------------------------------------- {% endcomment %}
      var galleryUserSettings = {};
      Object.keys(gallerySettings || {}).forEach((key) => {
        if (key !== 'galleries') { galleryUserSettings[key] = gallerySettings[key]; }
      });

      galleryOptions  = _self()._deepMerge({}, galleryDefaults, galleryUserSettings);
      galleries       = gallerySettings.galleries;

      // claude - Fix J1 Gallery YAML data processing #1
      // expose the global merged options (defaults <- user settings) and the
      // per-instance options cache for module use
      //
      galleryInstanceOptions              = {};
      _self()['galleryOptions']           = galleryOptions;
      _self()['galleryInstanceOptions']   = galleryInstanceOptions;

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

      {% comment %} claude - Fix J1 Gallery YAML data processing #1
      --------------------------------------------------------------------------
        Build the per-gallery EFFECTIVE settings from the FULL inheritance
        chain (later overloads earlier, PER KEY):

          1. gallery_defaults  defaults .. _data/modules/defaults/gallery.yml
          2. gallery_control   user ...... _data/modules/gallery_control.yml
                               (GLOBAL keys of settings, w/o 'galleries')
                               layers 1+2 are pre-merged as gallery_options
          3. gallery_item      gallery ... gallery_control.settings.galleries[]
          4. playlist_match    content ... gallery_media.settings.galleries[]
                               (images|videos, matched by id)

        The former chain (a) skipped the USER layer completely and (b) used
        the SHALLOW 'merge' filter, so a gallery that sets ONE key of a
        subtree lost ALL sibling defaults of that subtree. The per-gallery
        JS generated below reads exactly those subtrees:

          gallery.gallery_options    -> justifiedGallery() options
          gallery.lightGallery.*     -> lightGallery() options
          gallery.lightbox.*         -> lightbox gating

        so the generated init code differed PER INSTANCE depending on which
        subtrees a gallery touches. The keys read downstream are unchanged.

        Original (deprecated, preserved for reference). The if|else|endif
        frame of the loop is UNCHANGED, only the two assign statements are
        replaced:
          {% assign gallery = gallery_defaults  | merge: gallery_item | merge: playlist_match %}
          {% assign gallery = gallery_defaults  | merge: gallery_item %}
      -------------------------------------------------------------------------- {% endcomment %}
      {% for gallery_item in galleries %}
        {% assign playlist_match = media_sorted | where: 'id', gallery_item.id | first %}
        {% if playlist_match %}
          {% assign gallery = gallery_options   | merge: gallery_item | merge: playlist_match %}
        {% else %}
          {% assign gallery = gallery_options   | merge: gallery_item %}
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

      j1.consoleLog(isDev, 'DEBUG', CONSOLE_LOG_ID, MODULE_NAME, `number of galleries found: ${active_grids}`);
      _this.setState('load_data');

      Object.keys(galleries).forEach((key) => {
        // claude - Fix J1 Gallery YAML data processing #1
        // Resolve the 'enabled' state from the EFFECTIVE chain of THIS
        // instance (defaults <- user settings <- gallery entry) instead of
        // reading the RAW control entry. A gallery entry that omits
        // 'enabled' inherits the user setting resp. the default now.
        // Original (deprecated, preserved for reference):
        // if (galleries[key].enabled) {
        //
        var instanceOptions = _self().getInstanceOptions(galleries[key].id);
        var galleryEnabled  = instanceOptions.enabled;

        if (galleryEnabled) {
          xhr_container_id = galleries[key].id + '_parent';

          j1.consoleLog(isDev, 'DEBUG', CONSOLE_LOG_ID, MODULE_NAME, `load HTML portion on gallery id: ${galleries[key].id}`);
          j1.loadHTML({
            xhr_container_id: xhr_container_id,
            xhr_data_path:    xhr_data_path,
            xhr_data_element: galleries[key].id
          });
        } else {
          j1.consoleLog(isDev, 'DEBUG', CONSOLE_LOG_ID, MODULE_NAME, `gallery found disabled on id: ${galleries[key].id}`);
          active_grids--;
        }
      });

      j1.consoleLog(isDev, 'DEBUG', CONSOLE_LOG_ID, MODULE_NAME, `galleries loaded in page enabled|all: ${active_grids}|${numGalleries}`);
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
    // claude - Fix J1 Gallery YAML data processing #1
    // _deepMerge(target, ...sources)
    // Deep merge helper implementing the layer semantics of the config
    // inheritance chain (same semantics as the AmplitudeJS adapter fix #1
    // and the J1 VideoPlayer adapter fix #48):
    //
    //   • plain objects are merged RECURSIVELY (missing keys fall through
    //     to the lower layer, present keys overload it)
    //   • ARRAYS REPLACE the lower layer's value as a whole (copied via
    //     slice() so layers never share array references) — no index-wise
    //     merging as done by $.extend(true, ...)
    //   • scalars (string/number/boolean/null) overload the lower layer;
    //     'undefined' source values are skipped (key stays inherited)
    //
    // Sources are applied left to right: the LAST source wins.
    // -------------------------------------------------------------------------
    _deepMerge: (target, ...sources) => {
      var isPlainObject = function (v) {
        return (v !== null && typeof v === 'object' && !Array.isArray(v));
      };

      sources.forEach(function (source) {
        if (!isPlainObject(source)) { return; }
        Object.keys(source).forEach(function (key) {
          var srcVal = source[key];
          if (isPlainObject(srcVal)) {
            if (!isPlainObject(target[key])) { target[key] = {}; }
            _self()._deepMerge(target[key], srcVal);
          } else if (Array.isArray(srcVal)) {
            target[key] = srcVal.slice();
          } else if (srcVal !== undefined) {
            target[key] = srcVal;
          }
        });
      });

      return target;
    }, // END _deepMerge

    // -------------------------------------------------------------------------
    // claude - Fix J1 Gallery YAML data processing #1
    // getInstanceOptions(galleryId)
    // Returns the EFFECTIVE options for ONE gallery instance, built from the
    // config inheritance chain (later overloads earlier):
    //
    //   1. galleryDefaults        — _data/modules/defaults/gallery.yml
    //   2. user settings          — _data/modules/gallery_control.yml
    //                               (GLOBAL keys of settings, w/o 'galleries')
    //   3. gallery entry          — _data/modules/gallery_control.yml
    //                               (settings.galleries[], matched by id)
    //
    // All default keys are available on the result; keys present in the user
    // settings overload the defaults, keys present in the gallery entry
    // overload both. The gallery entry keys are applied at TOP scope: the
    // control entries use the SAME key layout as the defaults file
    // (gallery_options, lightbox, lightGallery, filters, ...). When no
    // control entry exists for the given id, the result equals the global
    // chain (defaults <- user settings).
    //
    // NOTE: media content (gallery_media.yml: images|videos) is NOT part of
    // the option chain. It is merged ID-wise into the Liquid var 'gallery'
    // of initGallery() and rendered into the HTML data file.
    //
    // Results are cached per galleryId and exposed on the adapter object as
    // j1.adapter.gallery.galleryInstanceOptions[galleryId].
    // -------------------------------------------------------------------------
    getInstanceOptions: (galleryId) => {
      // fast path: already resolved for this instance
      if (galleryInstanceOptions[galleryId]) {
        return galleryInstanceOptions[galleryId];
      }

      // user layer: all GLOBAL top-level keys of the control settings,
      // excluding the per-gallery array 'galleries'
      var userSettings = {};
      try {
        Object.keys(gallerySettings || {}).forEach((key) => {
          if (key !== 'galleries') { userSettings[key] = gallerySettings[key]; }
        });
      } catch (e) {
        // logger guarded: logger is assigned in init(); calls placed
        // before|without init() would throw a follow-up TypeError
        logger && logger.error('\n' + 'getInstanceOptions: user settings lookup failed [' + galleryId + ']: ' + e);
      }

      // resolve the gallery entry from the RAW control settings
      var galleryEntry = null;
      try {
        var entries = (gallerySettings && Array.isArray(gallerySettings.galleries))
          ? gallerySettings.galleries
          : [];
        for (var i = 0; i < entries.length; i++) {
          if (entries[i] && entries[i].id === galleryId) {
            galleryEntry = entries[i];
            break;
          }
        }
      } catch (e) {
        logger && logger.error('\n' + 'getInstanceOptions: control lookup failed [' + galleryId + ']: ' + e);
      }

      if (galleryEntry === null) {
        logger && logger.warn('\n' + 'getInstanceOptions: no control entry found [' + galleryId + '], instance falls back to defaults <- user settings');
      }

      // build the per-instance chain:
      // gallery settings -> overload user settings -> overload default settings
      var instanceOptions = _self()._deepMerge(
        {},
        galleryDefaults,
        userSettings,
        galleryEntry || {}
      );

      // cache + expose
      galleryInstanceOptions[galleryId]     = instanceOptions;
      _self()['galleryInstanceOptions']     = galleryInstanceOptions;

      j1.consoleLog(isDev, 'DEBUG', CONSOLE_LOG_ID, MODULE_NAME, `getInstanceOptions: per-instance options resolved [${galleryId}]`);
      return instanceOptions;
    }, // END getInstanceOptions

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