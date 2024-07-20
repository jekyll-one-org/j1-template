---
regenerate:                             true
---

{%- capture cache -%}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/adapter/js/gallery.js
 # Liquid template to create the J1 Adapter for J1 Gallery
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2023, 2024 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 # -----------------------------------------------------------------------------
{% endcomment %}

{% comment %} Liquid procedures
-------------------------------------------------------------------------------- {% endcomment %}

{% comment %} Set global settings
-------------------------------------------------------------------------------- {% endcomment %}
{% assign environment           = site.environment %}
{% assign template_version      = site.version %}

{% comment %} Process YML config data
================================================================================ {% endcomment %}

{% comment %} Set config files
-------------------------------------------------------------------------------- {% endcomment %}
{% assign template_config       = site.data.j1_config %}
{% assign apps                  = site.data.apps %}
{% assign modules               = site.data.modules %}

{% comment %} Set config data
-------------------------------------------------------------------------------- {% endcomment %}
{% assign gallery_defaults      = modules.defaults.gallery.defaults %}
{% assign gallery_settings      = modules.gallery.settings %}

{% comment %} Set config options
-------------------------------------------------------------------------------- {% endcomment %}
{% assign gallery_options       = gallery_defaults | merge: gallery_settings %}

{% comment %} Detect prod mode
-------------------------------------------------------------------------------- {% endcomment %}
{% assign production = false %}
{% if environment == 'prod' or environment == 'production' %}
  {% assign production = true %}
{% endif %}

/*
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/adapter/js/gallery.js
 # JS Adapter for J1 Gallery
 #
 # Product/Info:
 # https://jekyll.one
 # https://github.com/miromannino/Justified-Gallery
 #
 # Copyright (C) 2020 Miro Mannino
 # Copyright (C) 2023 Sachin Neravath
 # Copyright (C) 2023, 2024 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 # Justified Gallery is licensed under the MIT license
 # See: https://github.com/miromannino/Justified-Gallery/blob/master/LICENSE
 # lightGallery is licensed under the GPLv3 license
 # See: https://github.com/sachinchoolur/lightGallery/blob/master/LICENSE
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

  {% comment %} Global variables
  ------------------------------------------------------------------------------ {% endcomment %}
  var environment   = '{{environment}}';
  var state         = 'not_started';
  var play_button   = '/assets/theme/j1/modules/lightGallery/css/themes/uno/icons/play-button.png';

  var url;
  var origin;
  var galleryDefaults;
  var gallerySettings;
  var galleryOptions;
  var frontmatterOptions;

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

      // create settings object from frontmatter (page settings)
      frontmatterOptions = options != null ? $.extend({}, options) : {};

      // Load  module DEFAULTS|CONFIG
      galleryDefaults = $.extend({}, {{gallery_defaults | replace: 'nil', 'null' | replace: '=>', ':' }});
      gallerySettings = $.extend({}, {{gallery_settings | replace: 'nil', 'null' | replace: '=>', ':' }});
      galleryOptions  = $.extend(true, {}, galleryDefaults, gallerySettings, frontmatterOptions);

      // load HTML portion for all grids
      console.debug('loading HTML portion for all galleries configured');
      _this.loadGalleryHTML(galleryOptions, galleryOptions.galleries);

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

          _this.initialize(galleryOptions);
          _this.setState('finished');

          logger.debug('\n' + 'state: ' + _this.getState());
          logger.info('\n' + 'module initialized successfully');

          endTimeModule = Date.now();
          logger.info('\n' + 'module initializing time: ' + (endTimeModule-startTimeModule) + 'ms');

          clearInterval(dependency_met_page_ready);
        } // END 'finished' && 'pageVisible'
      }, 10); // END dependency_met_page_ready
    }, // END init

    // -----------------------------------------------------------------------
    // Load AJAX data and initialize the jg gallery
    // -----------------------------------------------------------------------
    initialize: (options) => {
      var xhrLoadState      = 'pending';                                        // (initial) load state for the HTML portion of the slider
      var load_dependencies = {};
      var dependency;

      logger = log4javascript.getLogger('j1.adapter.gallery');

      _this.setState('running');
      logger.debug('\n' + 'state: ' + _this.getState());

      {% for gallery in gallery_options.galleries %}

        {% if gallery.enabled %}
        {% assign gallery_id = gallery.id %}
        logger.info('\n' + 'found gallery on id: ' + '{{gallery_id}}');

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
                  }
                  {% endif %}

                  {% if gallery.video == 'vimeo' and gallery.lightGallery.playerParams.enabled %}
                  "vimeoPlayerParams": {
                    {% for option in gallery.lightGallery.playerParams %}
                    {% if option[0] contains "enabled" %}
                    {% continue %}
                    {% endif %}
                    {{option[0] | json}}: {{option[1] | json}},
                    {% endfor %}
                  }
                  {% endif %}

                  {% if gallery.video == 'dailymotion' and gallery.lightGallery.playerParams.enabled %}
                  "dailymotionPlayerParams": {
                    {% for option in gallery.lightGallery.playerParams %}
                    {% if option[0] contains "enabled" %}
                    {% continue %}
                    {% endif %}
                    {{option[0] | json}}: {{option[1] | json}},
                    {% endfor %}
                  }
                  {% endif %}

                  {% if gallery.video == 'wistia' and gallery.lightGallery.playerParams.enabled %}
                  "wistiaPlayerParams": {
                    {% for option in gallery.lightGallery.playerParams %}
                    {% if option[0] contains "enabled" %}
                    {% continue %}
                    {% endif %}
                    {{option[0] | json}}: {{option[1] | json}},
                    {% endfor %}
                  }
                  {% endif %}

                  {% if gallery.video == 'tiktok' and gallery.lightGallery.playerParams.enabled %}
                  "tiktokPlayerParams": {
                    {% for option in gallery.lightGallery.playerParams %}
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

                    {% if gallery.video == 'vimeo' and gallery.lightGallery.playerParams.enabled %}
                    "vimeoPlayerParams": {
                      {% for option in gallery.lightGallery.playerParams %}
                      {% if option[0] contains "enabled" %}
                      {% continue %}
                      {% endif %}
                      {{option[0] | json}}: {{option[1] | json}},
                      {% endfor %}
                    }
                    {% endif %}

                    {% if gallery.video == 'dailymotion' and gallery.lightGallery.playerParams.enabled %}
                    "dailymotionPlayerParams": {
                      {% for option in gallery.lightGallery.playerParams %}
                      {% if option[0] contains "enabled" %}
                      {% continue %}
                      {% endif %}
                      {{option[0] | json}}: {{option[1] | json}},
                      {% endfor %}
                    }
                    {% endif %}

                    {% if gallery.video == 'wistia' and gallery.lightGallery.playerParams.enabled %}
                    "wistiaPlayerParams": {
                      {% for option in gallery.lightGallery.playerParams %}
                      {% if option[0] contains "enabled" %}
                      {% continue %}
                      {% endif %}
                      {{option[0] | json}}: {{option[1] | json}},
                      {% endfor %}
                    }
                    {% endif %}

                  }); // END lightGallery
                } // END if j1.jg.callback
              }, 1000); // END timeout

              clearInterval(load_dependencies['dependencies_met_html_loaded_{{gallery_id}}']);
            } // END  if xhrLoadState === 'success'
          }, 10); // END dependencies_met_html_loaded

        {% endif %} // ENDIF gallery enabled
      {% endfor %}
    }, // END initialize

    // -------------------------------------------------------------------------
    // loadGalleryHTML()
    // loads the HTML portion via AJAX for all galleries configured.
    // NOTE: Make sure the placeholder DIV is available in the content
    // page as generated using the Asciidoc extension gallery::
    // -------------------------------------------------------------------------
    loadGalleryHTML: (options, gallery) => {
      var numGalleries  = Object.keys(gallery).length;
      var active_grids  = numGalleries;
      var xhr_data_path = options.xhr_data_path + '/index.html';
      var xhr_container_id;

      console.debug('number of galleries found: ' + active_grids);

      _this.setState('load_data');
      Object.keys(gallery).forEach((key) => {
        if (gallery[key].enabled) {
          xhr_container_id = gallery[key].id + '_parent';

          console.debug('load HTML portion on gallery id: ' + gallery[key].id);
          j1.loadHTML({
            xhr_container_id: xhr_container_id,
            xhr_data_path:    xhr_data_path,
            xhr_data_element: gallery[key].id
          });
        } else {
          console.debug('gallery found disabled on id: ' + gallery[key].id);
          active_grids--;
        }
      });
      console.debug('galleries loaded in page enabled|all: ' + active_grids + '|' + numGalleries);
      _this.setState('data_loaded');
    }, // END loadGalleryHTML

    // -------------------------------------------------------------------------
    // messageHandler()
    // manage messages send from other J1 modules
    // -------------------------------------------------------------------------
    messageHandler: (sender, message) => {
      var json_message = JSON.stringify(message, undefined, 2);

      logText = '\n' + 'received message from ' + sender + ': ' + json_message;
      logger.debug(logText);

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
