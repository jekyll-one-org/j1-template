---
regenerate:                             true
---
{% capture cache %}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/bootstrap_gallery.js
 # Liquid template to adapt Bootstrap Gallery Core functions
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2021 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # For details, see https://jekyll.one
 # -----------------------------------------------------------------------------
 # Test data:
 #  {{ liquid_var | debug }}
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
{% assign apps              = site.data.apps %}

{% comment %} Set config data
-------------------------------------------------------------------------------- {% endcomment %}
{% assign gallery_defaults  = apps.defaults.bootstrap_gallery.defaults %}
{% assign gallery_settings  = apps.bootstrap_gallery.settings %}

{% comment %} Set config options
-------------------------------------------------------------------------------- {% endcomment %}
{% assign gallery_options   = gallery_defaults | merge: gallery_settings %}

/*
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/bootstrap_gallery.js
 # JS Adapter for LightGallery
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2021 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # For details, see https://jekyll.one
 # -----------------------------------------------------------------------------
 #  Adapter generated: {{site.time}}
 # -----------------------------------------------------------------------------
*/
'use strict';

{% comment %} Main
-------------------------------------------------------------------------------- {% endcomment %}
//j1.BsGallery = (function (j1, window) {
j1.adapter['bs_gallery'] = (function (j1, window) {

  {% comment %} Set global variables
  ------------------------------------------------------------------------------ {% endcomment %}
  var environment   = '{{environment}}';
  var moduleOptions = {};
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
      // initialize state flag
      j1.adapter.bs_gallery.state = 'pending';

      // -----------------------------------------------------------------------
      // Default module settings
      // -----------------------------------------------------------------------
      var settings = $.extend({
        module_name: 'j1.adapter.bs_gallery',
        generated:   '{{site.time}}'
      }, options);

      {% comment %} Set global variables
      -------------------------------------------------------------------------- {% endcomment %}
      _this   = j1.adapter.bs_gallery;
      logger  = log4javascript.getLogger('j1.adapter.bs_gallery');

      {% comment %} Load module config from yml data
      -------------------------------------------------------------------------- {% endcomment %}
      // Load  module DEFAULTS|CONFIG
      //
      // moduleOptions = $.extend({}, {{jekyll_search_options | replace: '=>', ':' | replace: 'nil', '""'}});
      //
      // if (typeof settings !== 'undefined') {
      //   moduleOptions = j1.mergeData(moduleOptions, settings);
      // }

      _this.setState('started');
      logger.info('state: ' + _this.getState());
      logger.info('module is being initialized');

      _this.initialize();

      return true;
    }, // END init

    // -------------------------------------------------------------------------
    // Load AJAX data and initialize the gallery
    // -------------------------------------------------------------------------
    initialize: function () {

      logger = log4javascript.getLogger("j1.adapter.bs_gallery.init");

      {% for item in gallery_options.galleries %}
        {% if item.gallery.enabled %}

          {% comment %} Set (<DIV>|<UL>) container id for the placement of HTML markup {% endcomment %}
          {% assign container_id  = item.gallery.id %}
          {% capture gallery_id %}{{item.gallery.id}}_ul{% endcapture %}
          {% capture bs_gallery_class %}bsg_{{item.gallery.id}}{% endcapture %}

          {% comment %} Initialize J1 base gallery options {% endcomment %}
          {% assign css_classes     = item.gallery.css_classes %}
          {% assign gallery_title   = item.gallery.title %}
          {% assign gallery_type    = item.gallery.type %}
          {% assign thumb_items     = item.gallery.thumb_items %}
          {% assign thumb_spacing   = item.gallery.thumb_spacing %}
          {% assign thumb_bordered  = item.gallery.thumb_bordered %}
          {% assign thumb_animate   = item.gallery.thumb_animate %}

          {% comment %} // Calculate BS grid size for the thumbnails {% endcomment %}
          {% assign column_width_md  = 12 | divided_by:thumb_items %}

          // Create an gallery instance if {{ container_id }} exists
          if ($('#{{ container_id }}').length) {

            logText = 'gallery is being initialized on id: #{{container_id}}';
            _this.setState('running');
            logger.info('state: ' + _this.getState());
            logger.info(logText);

            // Place HTML markup for the title
            {% if gallery_title %}
            var gallery_title = '<div class="bs-gallery-title">{{gallery_title}}</div>';
            $('#{{ container_id }}').before(gallery_title);
            {% endif %}

            $('#{{ container_id }}').addClass("lightgallery ");

            {% if thumb_animate %}
            // Add animation
            $('#{{ container_id }}').addClass("lg-animate");
            // $('#{{ container_id }}').removeClass("lg-animate");
            {% endif %}

            // Calculate individual CSS styles for gallery thumbnails
            var style = '';
            style += '<style> \n';
                style += 'a.lg-thumbnail-{{container_id}}{margin-left: {{thumb_spacing}}px;margin-bottom: {{thumb_spacing}}px;} \n';
                {% if thumb_bordered %}
                style += 'a.lg-thumbnail-{{container_id}}:hover,a.lg-thumbnail-{{container_id}}:focus,a.lg-thumbnail-{{container_id}}.active{border-color:#204a87} \n';
                style += '.lg-thumbnail-{{container_id}}>img,.lg-thumbnail-{{container_id}} a>img{display:block;max-width:100%;height:auto} \n';
                style += '.img-lg-thumbnail-{{container_id}}{padding:4px;line-height:1.42857143;background-color:#fff;border:1px solid #ddd;border-radius:2px;-webkit-transition:all .2s ease-in-out;-o-transition:all .2s ease-in-out;transition:all .2s ease-in-out;display:inline-block;max-width:100%;height:auto} \n';
                style += '.lg-thumbnail-{{container_id}}{display:block;padding:4px;margin-bottom:20px;line-height:1.42857143;background-color:#fff;border:1px solid #ddd;border-radius:2px;-webkit-transition:border .2s ease-in-out;-o-transition:border .2s ease-in-out;transition:border .2s ease-in-out} \n';
                style += '.lg-thumbnail-{{container_id}}>img,.lg-thumbnail-{{container_id}} a>img{margin-left:auto;margin-right:auto} \n';
                {% endif %}
                style += '</style> \n';
            $('head').append(style);

            {% if gallery_type == "image" %}
            // Collect image gallery data from data file (xhr_data_path)
            $.getJSON('{{gallery_options.xhr_data_path}}', function (data) {
              var content = '';
              //content += '<ul id="{{ gallery_id }}" class="row {{ css_classes }} bs-gallery-gutter list-unstyled">' + '\n';
              content += '<ul id="{{ gallery_id }}" class="row bs-gallery {{ css_classes }} bs-gallery-gutter list-unstyled">' + '\n';

              for (var i in data["{{item.gallery.id}}"]) {
                var img       = data["{{item.gallery.id}}"][i].img;
                var caption   = data["{{item.gallery.id}}"][i].caption;

                content +=  '<li class="col-xs-6 col-sm-4 col-md-{{column_width_md}}" ' +
                                'data-src="' +img+ '" ' +
                                'data-sub-html="' +caption+ '">' +
                              {% if thumb_bordered %}
                              '<a href="#" class="lg-thumbnail-{{container_id}}">' +
                              {% else %}
                              '<a href="#" class="lg-thumbnail lg-thumbnail-{{container_id}}">' +
                              {% endif %}
                                '<img class="img-fluid j1-lg-magnifier" src="' +img+ '">' +
                              '</a>' +
                            '</li>'
              } // END for
              content += '</ul> </div> </div>';
            {% elsif gallery_type == "video-html5" or gallery_type == "video-online" %}

            var play_button = '/assets/themes/j1/modules/lightGallery/css/themes/icons/play-button.png';

            // Collect html5 video gallery data from data file (xhr_data_path)
            $.getJSON('{{gallery_options.xhr_data_path}}', function (data) {

              {% if gallery_type == "video-html5" %}
              var hidden_video_div = '';
              for (var i in data["{{item.gallery.id}}"]) {
                var video        = data["{{item.gallery.id}}"][i].video_path + '/' + data["{{item.gallery.id}}"][i].video;
                var poster       = data["{{item.gallery.id}}"][i].image_path + '/' + data["{{item.gallery.id}}"][i].poster;
                var caption      = data["{{item.gallery.id}}"][i].captions_lightbox;
                var video_id     = data["{{item.gallery.id}}"][i].video_id;
                var video_type   = video.substr(video.lastIndexOf('.') + 1);
                hidden_video_div += '<div style="display:none;" id="' +video_id+ '">' + '\n';
                hidden_video_div += '  <video class="lg-video-object lg-html5 video-js vjs-default-skin"' + '\n';
                hidden_video_div += '         poster="' +poster+ '" controls="" preload="none">' + '\n';
                hidden_video_div += '    <source src="' +video+ '" type="video/' +video_type+ '">' + '\n';
                hidden_video_div += '    Your browser does not support HTML5 video.' + '\n';
                hidden_video_div += '  </video>' + '\n';
                hidden_video_div += '</div>' + '\n';
              }
              $('#{{ container_id }}').before(hidden_video_div);
              {% endif %}

              //var content = '<ul id="{{ gallery_id }}" class="row {{ css_classes }} bs-gallery-gutter list-unstyled">' + '\n';
              var content = '<ul id="{{ gallery_id }}" class="{{bs_gallery_class}} row {{ css_classes }} bs-gallery-gutter list-unstyled">' + '\n';
              for (var i in data["{{item.gallery.id}}"]) {
               {% if gallery_type == "video-html5" %}
                var video_id = data["{{item.gallery.id}}"][i].video_id;
               {% endif %}
               {% if gallery_type == "video-online" %}
                var video    = data["{{item.gallery.id}}"][i].video;
               {% endif %}
                var poster   = data["{{item.gallery.id}}"][i].image_path + '/' + data["{{item.gallery.id}}"][i].poster;
                var caption  = data["{{item.gallery.id}}"][i].captions_lightbox;

                //content += '  <li class="col-xs-6 col-sm-4 col-md-{{column_width_md}}" ' + '\n';
                //content += '  <li class="lightgallery"' + '\n';
                content += '  <li class="lightgallery col-xs-6 col-sm-4 col-md-{{column_width_md}}"' + '\n';
                content += '    data-sub-html="' +caption+ '" ' + '\n';
                content += '    data-poster="' +poster+ '" ' + '\n';
               {% if gallery_type == "video-html5" %}
                content += '    data-html="#' +video_id+ '">' + '\n';
               {% endif %}
               {% if gallery_type == "video-online" %}
                content += '    data-src="' +video+ '">' + '\n';
               {% endif %}
               {% if thumb_bordered %}
                content += '    <a href="#" class="lg-thumbnail-{{container_id}}">' + '\n';
               {% else %}
                content += '    <a href="#" class="lg-thumbnail lg-thumbnail-{{container_id}}">' + '\n';
               {% endif %}
                content += '      <img class="img-gallery" src="' +poster+ '">' + '\n';
                content += '      <img class="img-overlay" src="' +play_button+ '">' + '\n';
                content += '    </a>' + '\n';
                content += '  </li>' + '\n';
              }
              content += '</ul>';
            {% endif %}
                // Place HTML markup
                $("#{{ container_id }}").html(content);
                // Initialize|Run the gallery using individual gallery options
                $("#{{ gallery_id }}").lightGallery({
                  {% for option in item.gallery.options %}
                  {{ option[0] | json }}: {{ option[1] | json }},
                  {% endfor %}
                });

                //Run bsGallery (delayed: {{ show_delay }} ms)
                setTimeout(function() {
                  // Hide HTML markup while bsGallery is rendering
                  //$("#{{ gallery_id }}").hide();
                  $('ul.{{bs_gallery_class}}').bsGallery({
                    "classes" : "col-md-{{column_width_md}}",
                    "hasModal" : false
                  });
                  //$("#{{ gallery_id }}").show();
                }, {{ show_delay }});

                // Initialize instance variable of lightGallery  (for later access)
                j1["{{gallery_id}}"] = $('#{{ gallery_id }}').data('lightGallery');
                logText = 'initializing gallery finished on id: #{{container_id}}';
                _this.setState('finished');
                logger.info('state: ' + _this.getState());
                logger.info(logText);
            });
          } //end gallery
        {% endif %} {% comment %} end if enabled {% endcomment %}
      {% endfor %}

      return true;
    }, // END initialize

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
    // setState
    // Set the current (processing) state of the module
    // -------------------------------------------------------------------------
    setState: function (stat) {
      j1.adapter.bs_gallery.state = stat;
    }, // END setState

    // -------------------------------------------------------------------------
    // getState
    // Returns the current (processing) state of the module
    // -------------------------------------------------------------------------
    getState: function () {
      return j1.adapter.bs_gallery.state;
    } // END state

  }; // END return
})(j1, window);

{% endcapture %}
{{ cache | strip_empty_lines }}
{% assign cache = nil %}
