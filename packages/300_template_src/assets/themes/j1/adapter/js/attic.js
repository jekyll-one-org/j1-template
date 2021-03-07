---
regenerate:                             true
---

{% capture cache %}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/attic.js
 # Liquid template to adapt Backstretch Core functions for
 # all attics (top page headers)
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
{% assign environment           = site.environment %}
{% assign template_version      = site.version %}

{% comment %} Process YML config data
================================================================================ {% endcomment %}

{% comment %} Set config files
-------------------------------------------------------------------------------- {% endcomment %}
{% assign template_config       = site.data.j1_config %}
{% assign blocks                = site.data.blocks %}
{% assign modules               = site.data.modules %}

{% comment %} Set config data
-------------------------------------------------------------------------------- {% endcomment %}
{% assign attic_defaults       = modules.defaults.attics.defaults %}
{% assign attic_settings       = modules.attics.settings %}

{% comment %} Set config options
-------------------------------------------------------------------------------- {% endcomment %}
{% assign attic_options        = attic_defaults | merge: attic_settings %}

{% assign production = false %}
{% if environment == 'prod' or environment == 'production' %}
  {% assign production = true %}
{% endif %}

/*
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/attic.js
 # JS Adapter for J1 Master Header
 #
 # Product/Info:
 # https://jekyll.one
 # http://www.jquery-backstretch.com/
 #
 # Copyright (C) 2021 Juergen Adams
 # Copyright (C) 2012 Scott Robbin
 #
 # J1 Template is licensed under the MIT License.
 # For details, see https://jekyll.one
 # Backstretch is licensed under the MIT License.
 # For details, see https://github.com/jquery-backstretch/jquery-backstretch
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

{% comment %} Main
-------------------------------------------------------------------------------- {% endcomment %}
j1.adapter['attic'] = (function (j1, window) {

  {% comment %} Set global variables
  ------------------------------------------------------------------------------ {% endcomment %}
  var environment   = '{{environment}}';
  var moduleOptions = {};
  var _this;
  var logger;
  var logText;

  // ---------------------------------------------------------------------------
  // Main object
  // ---------------------------------------------------------------------------
  return {

    // -------------------------------------------------------------------------
    // Initializer
    // -------------------------------------------------------------------------
    init: function (options) {

      // -----------------------------------------------------------------------
      // globals
      // -----------------------------------------------------------------------
      _this   = j1.adapter.attic;
      logger  = log4javascript.getLogger('j1.adapter.attic');

      // initialize state flag
      _this.state = 'pending';

      // create seetings object from frontmatterOptions
      var frontmatterOptions = options != null ? $.extend({}, options) : {};

      // Save frontmatterOptions in the j1 namespace
      // to be used later by j1.template.init() to load the header
      _this['frontmatterOptions'] = frontmatterOptions;

      _this.setState('started');
      logger.info('state: ' + _this.getState());
      logger.info('module is being initialized');

      _this.loadHeader(frontmatterOptions);
    }, // END init

    // -------------------------------------------------------------------------
    // Initialize all header supported
    // -------------------------------------------------------------------------
    loadHeader: function () {

      var frontmatterOptions = _this.frontmatterOptions;

      {% comment %} Load data from header config (yaml data file)
      -------------------------------------------------------------------------- {% endcomment %}
      {% for item in attic_options.attics %}
        {% if item.attic.enabled %}

          {% assign attic_id = item.attic.id %}

          // Create the SPECIFIC header loader FUNCTION of type: {{attic_id}}
          function {{attic_id}} (atticOptions) {
            // Fire backstretch for all slides of the header on attic_id
            if ($('#{{attic_id}}').length) {
              $('#{{attic_id}}').backstretch(
                atticOptions.slides, {
                  debug:                          atticOptions.debug,
                  spinner:                        atticOptions.spinner,
                  alignX:                         atticOptions.alignX,
                  alignY:                         atticOptions.alignY,
                  scale:                          atticOptions.scale,
                  transition:                     atticOptions.transition,
                  transitionDuration:             atticOptions.transitionDuration,
                  animateFirst:                   atticOptions.animateFirst,
                  duration:                       atticOptions.duration,
                  paused:                         atticOptions.paused,
                  start:                          atticOptions.start,
                  preload:                        atticOptions.preload,
                  preloadSize:                    atticOptions.preloadSize,
                  bypassCss:                      atticOptions.bypassCss,
                  alwaysTestWindowResolution:     atticOptions.alwaysTestWindowResolution,
                  resolutionRefreshRate:          atticOptions.resolutionRefreshRate,
                  resolutionChangeRatioThreshold: atticOptions.transition,
                  isVideo:                        atticOptions.isVideo,
                  loop:                           atticOptions.loop,
                  mute:                           atticOptions.mute
              });
            }

            {% comment %} Add a spinner if configured
            -------------------------------------------------------------------- {% endcomment %}
            if (atticOptions.spinner) {
              $('.backstretch').addClass(atticOptions.spinner);
            }

            // Collect backstretch instance data for Backstretch callbacks
            var backstretch_instance_data = $('#{{attic_id}}').data('backstretch');

            {% comment %} Set the headerLoaded flag
            -------------------------------------------------------------------- {% endcomment %}
           $(window).on('backstretch.before', function (e, instance, index) {
              _this.setState('backstretch_before');
              logger.debug('state: ' + _this.getState());
            });

            {% comment %} Add a caption (c) or badge (b) if configured
            See: https://github.com/jquery-backstretch/jquery-backstretch/issues/194
            -------------------------------------------------------------------- {% endcomment %}
            $(window).on('backstretch.after', function (e, instance, index) {
              logText ='add caption text';
              _this.setState('backstretch_after');
              logger.debug('state: ' + status);
              logger.debug(logText);

              if (typeof atticOptions.slides[index].caption != 'undefined') {
                var cText = atticOptions.slides[index].caption.text;
                var cLink = atticOptions.slides[index].caption.href;

                if (cLink) {
                  $('.attic-caption').html('<a class="j1-masthead-caption-anchor" href="' +cLink+ '" target="_blank">'+cText+'</a>').show(); //.addClass('animated fadeInUp');
                } else {
                  $('.attic-caption').text(cText).show(); //.addClass('animated fadeInUp');
                }
              } else if (typeof atticOptions.slides[index].badge != 'undefined') {
                var bType   = atticOptions.slides[index].badge.type;
                var bAuthor = atticOptions.slides[index].badge.author;
                var bLink   = atticOptions.slides[index].badge.href;

                if (bType === 'unsplash') {
                  var badgeHTML = ''
                      + '<div class="attic__badge">'
                      + ' <a class="attic__badge_unsplash"'
                      + '  href="' +bLink+ '?utm_medium=referral&amp;utm_campaign=photographer-credit&amp;utm_content=creditBadge"'
                      + '  target="_blank"'
                      + '  rel="noopener noreferrer"'
                      + '  title="Free high-resolution photos from ' +bAuthor+ '">'
                      + '  <span class="attic__badge_unsplash_icon">'
                      + '    <svg xmlns="http://www.w3.org/2000/svg"'
                      + '	   class="attic__badge_unsplash_icon-size"'
                      + '      viewBox="0 0 32 32">'
                      + '      <title>search unsplash</title>'
                      + '      <path d="M10 9V0h12v9H10zm12 5h10v18H0V14h10v9h12v-9z"></path>'
                      + '    </svg>'
                      + '  </span>'
                      + '  <span class="attic__badge_unsplash_text">' +bAuthor+ '</span>'
                      + ' </a>'
                      + '</div>';

                  $('.attic-caption').html(badgeHTML).show();
                }
              }
              _this.setState('finished');
              logger.info('state: ' + _this.getState());
              logger.info('module initialized successfully');
            });

            {% comment %} Detect how show should run (only once|infinite loop)
            -------------------------------------------------------------------- {% endcomment %}
            {% if image_loop %}
            $(window).on('backstretch.before', function (e, instance, index) {
              _this.setState('backstretch_before_image_loop');
              logger.debug('state: ' + _this.getState());
              // remove class for the backstretch_intro background
              if (index === backstretch_instance_data.images.length -1) {
                $('.backstretch').removeClass(atticOptions.spinner);
              }
            });
            {% else %}
            $(window).on('backstretch.before', function (e, instance, index) {
              _this.setState('backstretch_before_image_once');
              logger.debug('state: ' + _this.getState());
              // Stop the slideshow after reached the last image
              if (index === backstretch_instance_data.images.length -1) {
                $('#{{attic_id}}').backstretch('pause');
                // remove class for the backstretch_intro background
                $('.backstretch').removeClass(atticOptions.spinner);
              }
            });
            {% endif %}

          } // END if attic_id exists

          // Initialize the header found in page
          if ($('#{{attic_id}}').length) {

          {% comment %} Load data from header config file
          ---------------------------------------------------------------------- {% endcomment %}

           {% comment %} NOTE:
           Unclear why title_size|tagline_size evaluated to 1 if NOT set
           --------------------------------------------------------------------- {% endcomment %}

            {% for item in attic_options.attics %}
              {% if item.attic.id == attic_id %}

                {% assign raised_level          = item.attic.raised_level %}
                {% assign r_text                = item.attic.r_text %}
                {% assign text_emphasis         = item.attic.text_emphasis %}
                {% assign padding_top           = item.attic.padding_top %}
                {% assign padding_bottom        = item.attic.padding_bottom %}
                {% assign margin_bottom         = item.attic.margin_bottom %}

                {% if item.attic.title.size != 1 %}
                {% assign title_size            = item.attic.title.size %}
                {% endif %}
                {% assign title_color           = item.attic.title.color %}
                {% assign title_animate         = item.attic.title.animate %}
                {% assign title_align           = item.attic.title.align %}

                {% if item.attic.tagline.size != 1 %}
                {% assign tagline_size          = item.attic.tagline.size %}
                {% endif %}
                {% assign tagline_color         = item.attic.tagline.color %}
                {% assign tagline_animate       = item.attic.tagline.animate %}
                {% assign tagline_align         = item.attic.tagline.align %}

                {% assign background_color_1    = item.attic.background_color.color_1 %}
                {% assign background_color_2    = item.attic.background_color.color_2 %}

                {% assign type                  = item.attic.image_header.type %}
                {% assign slides                = item.attic.image_header.slides %}
                {% assign opacity               = item.attic.image_header.opacity %}
                {% assign spinner               = item.attic.image_header.spinner %}
                {% assign alignX                = item.attic.image_header.alignX %}
                {% assign alignY                = item.attic.image_header.alignY %}
                {% assign scale                 = item.attic.image_header.scale %}
                {% assign animateFirst          = item.attic.image_header.animateFirst %}
                {% assign paused                = item.attic.image_header.paused %}
                {% assign start                 = item.attic.image_header.start %}
                {% assign preload               = item.attic.image_header.preload %}
                {% assign preloadSize           = item.attic.image_header.preloadSize %}
                {% assign bypassCss             = item.attic.image_header.bypassCss %}
                {% assign transition            = item.attic.image_header.transition %}
                {% assign duration              = item.attic.image_header.duration %}
                {% assign transitionDuration    = item.attic.image_header.transitionDuration %}
                {% assign animateFirst          = item.attic.image_header.animateFirst %}
                {% assign sound                 = item.attic.image_header.sound %}

                // Create and json object for HEADER options taken from
                // header config (YAML data file)
                /* eslint-disable */
                var atticOptions = {
                  {% if raised_level %}         "raised_level":           {{ raised_level | json }}, {% endif %}
                  {% if r_text %}               "r_text":                 {{ r_text | json }}, {% endif %}
                  {% if text_emphasis %}        "text_emphasis":          {{ text_emphasis | json }}, {% endif %}
                  {% if padding_top %}          "padding_top":            {{ padding_top | json }}, {% endif %}
                  {% if padding_bottom %}       "padding_bottom":         {{ padding_bottom | json }}, {% endif %}
                  {% if margin_bottom %}        "margin_bottom":          {{ margin_bottom | json }}, {% endif %}
                  {% if title_size %}           "title_size":             {{ title_size | json }}, {% endif %}
                  {% if title_color %}          "title_color":            {{ title_color | json }}, {% endif %}
                  {% if title_animate %}        "title_animate":          {{ title_animate | json }}, {% endif %}
                  {% if title_align %}          "title_align":            {{ title_align | json }}, {% endif %}
                  {% if tagline_size %}         "tagline_size":           {{ tagline_size | json }}, {% endif %}
                  {% if tagline_color %}        "tagline_color":          {{ tagline_color | json }}, {% endif %}
                  {% if tagline_animate %}      "tagline_animate":        {{ tagline_animate | json }}, {% endif %}
                  {% if tagline_align %}        "tagline_align":          {{ tagline_align | json }}, {% endif %}
                  {% if background_color_1 %}   "background_color_1":     {{ background_color_1 | json }}, {% endif %}
                  {% if background_color_2 %}   "background_color_2":     {{ background_color_2 | json }}, {% endif %}
                }
                /* eslint-enable */
                {% comment %} trans-script header|backstretch options
                ---------------------------------------------------------------- {% endcomment %}
                {% if type == 'video' %}
                  {% assign isVideo = true %}
                  {% if sound %} {% assign mute = false %} {% else %} {% assign mute = true %} {% endif %}
                  {% if loop %}  {% assign loop = true %}  {% else %} {% assign loop = true %} {% endif %}
                {% endif %}

                // Create an json object for BACKSTRETCH options taken from
                // header config (yaml data file)
                /* eslint-disable */
                var atticOptions = {
                  {% if spinner %}              "spinner":                {{ spinner | json }}, {% endif %}
                  {% if opacity %}              "opacity":                {{ opacity | json }}, {% endif %}
                  {% if slides %}               "slides":                 {{ slides | json }}, {% endif %}
                  {% if alignX %}               "alignX":                 {{ alignX | json }}, {% endif %}
                  {% if alignY %}               "alignY":                 {{ alignY | json }}, {% endif %}
                  {% if scale %}                "scale":                  {{ scale | json }}, {% endif %}
                  {% if animateFirst %}         "animateFirst":           {{ animateFirst | json }}, {% endif %}
                  {% if paused %}               "paused":                 {{ paused | json }}, {% endif %}
                  {% if start %}                "start":                  {{ start | json }}, {% endif %}
                  {% if preload %}              "preload":                {{ preload | json }}, {% endif %}
                  {% if preloadSize %}          "preloadSize":            {{ preloadSize | json }}, {% endif %}
                  {% if bypassCss %}            "bypassCss":              {{ bypassCss | json }}, {% endif %}
                  {% if transition %}           "transition":             {{ transition | json }}, {% endif %}
                  {% if isVideo %}              "isVideo":                {{ isVideo | json }}, {% endif %}
                  {% if mute %}                 "mute":                   {{ mute | json }}, {% endif %}
                  {% if loop %}                 "loop":                   {{ loop | json }}, {% endif %}
                  {% if transitionDuration %}   "transitionDuration":     {{ transitionDuration | json }}, {% endif %}
                  {% if duration %}             "duration":               {{ duration | json }}, {% endif %}
                }

                // Load  Attic DEFAULTS
                var attic_options = $.extend({}, {{attic_options | replace:'=>',':' }});

                // Merge|Overload  Attic DEFAULTS by individual settings
                // var atticOptions = j1.mergeData(attic_options, atticOptions);
                var atticOptions = j1.mergeData(atticOptions, attic_options);
                /* eslint-enable */
              {% else %}
                {% continue %}
              {% endif %} // ENDIF attic_id
            {% endfor %} // ENDFOR item in header_config.attics

            {% comment %} frontmatter takes precedence (over header options)
            -------------------------------------------------------------------- {% endcomment %}
            if (frontmatterOptions) {
              if (typeof frontmatterOptions.raised_level != 'undefined') { atticOptions.raised_level = frontmatterOptions.raised_level; }
              if (typeof frontmatterOptions.r_text != 'undefined') { atticOptions.r_text = frontmatterOptions.r_text; }
              if (typeof frontmatterOptions.text_emphasis != 'undefined') { atticOptions.text_emphasis = frontmatterOptions.text_emphasis; }
              if (typeof frontmatterOptions.padding_top != 'undefined') { atticOptions.padding_top = frontmatterOptions.padding_top; }
              if (typeof frontmatterOptions.padding_bottom != 'undefined') { atticOptions.padding_bottom = frontmatterOptions.padding_bottom; }
              if (typeof frontmatterOptions.margin_bottom != 'undefined') { atticOptions.margin_bottom = frontmatterOptions.margin_bottom; }

              if (typeof frontmatterOptions.title != 'undefined') {
                if (typeof frontmatterOptions.title.color != 'undefined') { atticOptions.title_color = frontmatterOptions.title.color; }
                if (typeof frontmatterOptions.title.size != 'undefined') { atticOptions.title_size = frontmatterOptions.title.size; }
                if (typeof frontmatterOptions.title.animate != 'undefined') { atticOptions.title_animate = frontmatterOptions.title.animate; }
                if (typeof frontmatterOptions.title.align != 'undefined') { atticOptions.title_align = frontmatterOptions.title.align; }
              }
              if (typeof frontmatterOptions.tagline != 'undefined') {
                if (typeof frontmatterOptions.tagline.color != 'undefined') { atticOptions.tagline_color = frontmatterOptions.tagline.color; }
                if (typeof frontmatterOptions.tagline.size != 'undefined') { atticOptions.tagline_size = frontmatterOptions.tagline.size; }
                if (typeof frontmatterOptions.tagline.animate != 'undefined') { atticOptions.tagline_animate = frontmatterOptions.tagline.animate; }
                if (typeof frontmatterOptions.tagline.align != 'undefined') { atticOptions.tagline_align = frontmatterOptions.tagline.align; }
              }
              if (typeof frontmatterOptions.background_color != 'undefined') {
                if (typeof frontmatterOptions.background_color.color_1 != 'undefined') { atticOptions.background_color_1 = frontmatterOptions.background_color.color_1; }
                if (typeof frontmatterOptions.background_color.color_2 != 'undefined') { atticOptions.background_color_2 = frontmatterOptions.background_color.color_1; }
              }
              if (typeof frontmatterOptions.spinner != 'undefined') { atticOptions.spinner = frontmatterOptions.spinner; }
              if (typeof frontmatterOptions.opacity != 'undefined') { atticOptions.opacity = frontmatterOptions.opacity; }
              if (typeof frontmatterOptions.alignX != 'undefined') { atticOptions.alignX = frontmatterOptions.alignX; }
              if (typeof frontmatterOptions.alignY != 'undefined') { atticOptions.alignY = frontmatterOptions.alignY; }
              if (typeof frontmatterOptions.scale != 'undefined') { atticOptions.scale = frontmatterOptions.scale; }
              if (typeof frontmatterOptions.start != 'undefined') { atticOptions.start = frontmatterOptions.start; }
              if (typeof frontmatterOptions.animateFirst != 'undefined') { atticOptions.animateFirst = frontmatterOptions.animateFirst; }
              if (typeof frontmatterOptions.preload != 'undefined') { atticOptions.preload = frontmatterOptions.preload; }
              if (typeof frontmatterOptions.preloadSize != 'undefined') { atticOptions.preloadSize = frontmatterOptions.preloadSize; }
              if (typeof frontmatterOptions.mute != 'undefined') { atticOptions.mute = frontmatterOptions.mute; }
              if (typeof frontmatterOptions.bypassCss != 'undefined') { atticOptions.bypassCss = frontmatterOptions.bypassCss; }
              if (typeof frontmatterOptions.isVideo != 'undefined') { atticOptions.isVideo = frontmatterOptions.isVideo; }
              if (typeof frontmatterOptions.loop != 'undefined') { atticOptions.loop = frontmatterOptions.loop; }
              if (typeof frontmatterOptions.paused != 'undefined') { atticOptions.paused = frontmatterOptions.paused; }
              if (typeof frontmatterOptions.transition != 'undefined') { atticOptions.transition = frontmatterOptions.transition; }
              if (typeof frontmatterOptions.duration != 'undefined') { atticOptions.duration = frontmatterOptions.duration; }
              if (typeof frontmatterOptions.transitionDuration != 'undefined') { atticOptions.transitionDuration = frontmatterOptions.transitionDuration; }
              if (typeof frontmatterOptions.slides != 'undefined') { atticOptions.slides = frontmatterOptions.slides; }
            }

            {% comment %} Resolve symbolic color names
            -------------------------------------------------------------------- {% endcomment %}
            // atticOptions.title_color         = j1.setColorData(atticOptions.title_color);
            // atticOptions.tagline_color       = j1.setColorData(atticOptions.tagline_color);
            // atticOptions.background_color_1  = j1.setColorData(atticOptions.background_color_1);
            // atticOptions.background_color_2  = j1.setColorData(atticOptions.background_color_2);

            atticOptions.title_color         = atticOptions.title_color;
            atticOptions.tagline_color       = atticOptions.tagline_color;
            atticOptions.background_color_1  = atticOptions.background_color_1;
            atticOptions.background_color_2  = atticOptions.background_color_2;

            {% comment %} Resolve symbolic font sizes names
            -------------------------------------------------------------------- {% endcomment %}
            // atticOptions.title_size          = j1.setFontSize(atticOptions.title_size);
            // atticOptions.tagline_size        = j1.setFontSize(atticOptions.tagline_size);

            atticOptions.title_size          = atticOptions.title_size;
            atticOptions.tagline_size        = atticOptions.tagline_size;

            {% comment %} Add header CSS classes
            -------------------------------------------------------------------- {% endcomment %}
            if (atticOptions.r_text == 'enabled') { $('#{{attic_id}}').addClass('r-text'); }

            var raised_level = 'raised-z' +atticOptions.raised_level;
            $('#{{attic_id}}').addClass(raised_level);
            $('#head-title').addClass(atticOptions.title_animate);
            $('#head-tagline').addClass(atticOptions.tagline_animate);

            var text_emphasis = 'text-emphasis-' +atticOptions.text_emphasis;
            $('#head-title-text').addClass(text_emphasis);
            $('#head-tagline-text').addClass(text_emphasis);

            {% comment %} Add header CSS styles to <HEAD>
            -------------------------------------------------------------------- {% endcomment %}
            var attic_style = '';

            // Initialze header background gradient
            attic_style += '<style> .attic { ';
            attic_style += 'background-image: -webkit-gradient(linear, left top, left bottom, from(' +atticOptions.background_color_1+ '), to(' +atticOptions.background_color_2+ ')) !important;';
            attic_style += 'background-image: -webkit-linear-gradient(top, ' +atticOptions.background_color_1+ ' 0%, ' +atticOptions.background_color_2+ ' 100%) !important;';
            attic_style += 'background-image: -o-linear-gradient(top, ' +atticOptions.background_color_1+ ' 0%, ' +atticOptions.background_color_2+ ' 100%) !important;';
            attic_style += 'background-image: linear-gradient(to bottom, ' +atticOptions.background_color_1+ ' 0%, ' +atticOptions.background_color_2+ ' 100%) !important;';
            attic_style += 'filter: progid:DXImageTransform.Microsoft.gradient(startColorstr="' +atticOptions.background_color_1+ '", endColorstr="' +atticOptions.background_color_2+ '", GradientType=0) !important;';
            attic_style += '} </style>';
            $('head').append(attic_style);

            // Initialze header sizes
            attic_style = '';
            attic_style = '<style> .attic { padding-top: ' +atticOptions.padding_top+ 'px; padding-bottom: ' +atticOptions.padding_bottom+ 'px; margin-bottom: ' +atticOptions.margin_bottom+ 'px; text-shadow: 0 1px 0 rgba(0,0,0,.1); </style>';

            $('head').append(attic_style);
            $('head').append('<style> .attic .head-title h2 { color: ' +atticOptions.title_color+ ';font-size: ' +atticOptions.title_size+ ' !important; text-align: ' +atticOptions.title_align+ ';} </style>');
            $('head').append('<style> .attic .head-tagline h3 { color: ' +atticOptions.tagline_color+ ';font-size: ' +atticOptions.tagline_size+ ' !important; text-align: ' +atticOptions.tagline_align+ '; } </style>');

            // Add opacity to all header images
            // See: https://tympanus.net/codrops/2013/11/07/css-overlay-techniques/
            var attic_opacity;

            attic_opacity = '<style> .backstretch-item { opacity: ' +atticOptions.opacity+ '; </style>';
            $('head').append(attic_opacity);

            _this.setState('initialized');
            logger.info('state: ' + _this.getState());

            {% comment %} Run the image header if any
            -------------------------------------------------------------------- {% endcomment %}
            if (typeof atticOptions.slides != 'undefined') {
              // Load the image header if the page is ready (visible)
              $(function() {
                // logger.debug('Load image header on: ' + {{attic_id}});
                logger.debug('Load image header');
                {{attic_id}}(atticOptions);
                _this.setState('completed');
                logger.info('state: ' + _this.getState());
              });
            }
          } // END if header id found in page
        {% endif %} // END if header enabled
      {% endfor %} // END for item in header_config.attics

      // NO header found in page
      if ($('#no_header').length) {
        _this.setState('completed');
        logger.info('state: ' + _this.getState());
        logger.warn('No header configured or found in page');
      }

      return true;
    }, // END loadHeader

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
        status = 'completed';
        logger.info(message.text);
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
