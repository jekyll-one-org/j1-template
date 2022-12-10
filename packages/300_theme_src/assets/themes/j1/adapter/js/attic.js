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
 # Copyright (C) 2022 Juergen Adams
 #
 # J1 Theme is licensed under the MIT License.
 # For details, see: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE.md
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

{% comment %} Detect prod mode
-------------------------------------------------------------------------------- {% endcomment %}
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
 # Copyright (C) 2022 Juergen Adams
 # Copyright (C) 2012 Scott Robbin
 #
 # J1 Theme is licensed under the MIT License.
 # For details, see: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE.md
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
j1.adapter.attic = (function (j1, window) {

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
      // Default module settings
      // -----------------------------------------------------------------------
      var settings = $.extend({
        module_name: 'j1.adapter.attic',
        generated:   '{{site.time}}'
      }, options);

      // -----------------------------------------------------------------------
      // Global variable settings
      // -----------------------------------------------------------------------
      _this   = j1.adapter.attic;
      logger  = log4javascript.getLogger('j1.adapter.attic');

      // initialize state flag
      _this.state = 'pending';

      // create settings object from frontmatter
      var frontmatterOptions  = options != null ? $.extend({}, options) : {};

      // create settings object from attic options
      var atticDefaults = $.extend({}, {{attic_defaults | replace: 'nil', 'null' | replace: '=>', ':' }});
      var atticSettings = $.extend({}, {{attic_settings | replace: 'nil', 'null' | replace: '=>', ':' }});

//    merge all attic options
      var atticOptions = $.extend({}, atticDefaults, atticSettings, frontmatterOptions);

      // Save frontmatterOptions and atticOptions in the j1 namespace
      // to be used later by j1.template.init() to load the header
      //
      _this['frontmatterOptions'] = frontmatterOptions;
      _this['atticOptions']       = atticOptions;

      _this.setState('started');
      logger.debug('\n' + 'state: ' + _this.getState());
      logger.info('\n' + 'module is being initialized');

      _this.loadHeader();

    }, // END init

    // -------------------------------------------------------------------------
    // Initialize all header supported
    // -------------------------------------------------------------------------
    loadHeader: function () {
      var frontmatterOptions  = _this.frontmatterOptions;
      // merge all attic options
      var atticOptions = $.extend({}, _this.atticOptions, _this.frontmatterOptions);


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

            // Add event for pauseOnHover
            //
            if (atticOptions.pauseOnHover) {
              $('#attic_home').hover (
                function() {
                  $('#{{attic_id}}').backstretch('pause'); },
                function() {
                  $('#{{attic_id}}').backstretch('resume'); }
              );
            }

            {% comment %} Set the headerLoaded flag (page NOT visible)
            -------------------------------------------------------------------- {% endcomment %}
           $(window).on('backstretch.before', function (e, instance, index) {
              var evt                 = e;
              var inst                = instance;
              var idx                 = index;
              var atticOptions        = _this.atticOptions;
              var textOverlayTitle    = instance.images[index].title
              var textOverlayTagline  = instance.images[index].tagline;
              var textOverlayHTML;

              // console.log('module attic - set state: backstretch_before');
              _this.setState('backstretch_before');

              if (index === backstretch_instance_data.images.length -1) {
                if (atticOptions.circuit == false) {
                  // Stop the slideshow after reached the last image
                  $('#{{attic_id}}').backstretch('pause');
                }
                // remove class for the backstretch_intro background
                $('.backstretch').removeClass(atticOptions.spinner);
              }

              // console.log('module attic - entered: backstretch.before');
              // console.log('module attic - apply: CSS filters');

              $('.backstretch').css('filter', 'sepia(1) brightness(0.9) contrast(0.6)');
              $('.backstretch').css('filter', 'grayscale(1) contrast(1) brightness(1)');

              // mute the overlay content while sliding
              $('.textOverlay').css('opacity', '0');

              // mute the badge while sliding
              $('.attic-caption').css('opacity', '0');

            }); // END on('backstretch.before')

            {% comment %} Add a caption (c) or badge (b) if configured
            See: https://github.com/jquery-backstretch/jquery-backstretch/issues/194
            -------------------------------------------------------------------- {% endcomment %}
            $(window).on('backstretch.after', function (e, instance, index) {
              var textOverlayTitle    = instance.images[index].title
              var textOverlayTagline  = instance.images[index].tagline;
              var atticOptions        = _this.atticOptions;
              var frontmatterOptions  = _this.frontmatterOptions;
              var textOverlayHTML;

              // apply DEFAULT settings for textOverlayTitle|textOverlayTagline
              // on the FIRST backstretch instance if title|tagline NOT set
              //
              if (index == 0) {
                if (typeof instance.images[index].title == 'undefined') {
                  textOverlayTitle    = frontmatterOptions.title;
                }
                if (typeof instance.images[index].tagline == 'undefined') {
                  textOverlayTagline  = frontmatterOptions.tagline;
                }
              }

              if (typeof instance.images[index].badge != 'undefined') {
                var bType               = instance.images[index].badge.type;
                var bAuthor             = instance.images[index].badge.author;
                var bLink               = instance.images[index].badge.href;
              }

              _this.setState('backstretch_after');

              if (typeof instance.images[index].caption != 'undefined') {
                var cText = instance.images[index].caption.text;
                var cLink = instance.images[index].caption.href;

                if (cLink) {
                  $('.attic-caption').html('<a class="j1-masthead-caption-anchor" href="' + cLink + '" target="_blank">'+cText+'</a>').show();
                } else {
                  $('.attic-caption').text(cText).show();
                }
              } else if (typeof instance.images[index].badge != 'undefined') {

                if (bType === 'unsplash') {
                  var badgeHTML = ''
                      + '<div class="attic__badge animate__animated animate__fadeIn animate__slower">'
                      + ' <a class="attic__badge_unsplash link-no-decoration"'
                      + '  href="' +bLink+ '?utm_medium=referral&amp;utm_campaign=photographer-credit&amp;utm_content=creditBadge"'
                      + '  target="_blank"'
                      + '  rel="noopener noreferrer"'
                      + '  title="Free high-resolution photos from ' +bAuthor+ '">'
                      + '  <span class="attic__badge_unsplash_icon">'
                      + '    <svg xmlns="http://www.w3.org/2000/svg"'
                      + '	   class="attic__badge_unsplash_icon-size"'
                      + '      viewBox="0 0 32 32">'
                      + '      <path d="M10 9V0h12v9H10zm12 5h10v18H0V14h10v9h12v-9z"></path>'
                      + '    </svg>'
                      + '  </span>'
                      + '  <span class="attic__badge_unsplash_text">' +bAuthor+ '</span>'
                      + ' </a>'
                      + '</div>';
                      $('.attic-caption').html(badgeHTML).hide();
                }
              }

              textOverlayHTML = ''
                + '<div id="head-title" class="head-title animate__animated ">'
                + '  <h2 id="head-title-text" class="notoc text-emphasis-stronger">' + textOverlayTitle + '</h2>'
                + '</div>'
                + '<div id="head-tagline" class="head-tagline animate__animated ">'
                + '  <h3 id="head-tagline-tagline" class="notoc">' + textOverlayTagline + '</h3>'
                + '</div>';
               $('.textOverlay').html(textOverlayHTML).hide();

              $('#head-title').addClass(atticOptions.title_animate);
              $('#head-title').addClass(atticOptions.title_animate_delay);
              $('#head-title').addClass(atticOptions.title_animate_duration);
              $('#head-tagline').addClass(atticOptions.tagline_animate);
              $('#head-tagline').addClass(atticOptions.tagline_animate_duration);

              $('.textOverlay').show();
              $('.textOverlay').css('opacity', '1');

              // jadams, 2022-08-19: show a badge only if defined
              //
              if (typeof instance.images[index].badge != 'undefined') {
                $('.attic-caption').show();
                $('.attic-caption').css('opacity', '1');
              }

              // jadams, 2022-08-09:
              // resize the (background-)image to make sure the 'attic'
              // container is changed in size (heigth) if title/tagline
              // expands 'multiline' on small viewports
              // e.g. on mobile devices
              //
              $('#{{attic_id}}').backstretch('resize');

              _this.setState('finished');
              logger.debug('\n' + 'state: ' + _this.getState());
              // logger.info('\n' + 'module initialized successfully');
            }); // END on('backstretch.after')

          } // END if attic_id exists

          // Initialize the header found in page
          if ($('#{{attic_id}}').length) {

            {% comment %} Load data from header config file
            -------------------------------------------------------------------- {% endcomment %}

             {% comment %} NOTE:
             Unclear why title_size|tagline_size evaluated to 1 if NOT set
             ------------------------------------------------------------------- {% endcomment %}

            {% for item in attic_options.attics %}
              {% if item.attic.id == attic_id %}

                {% assign raised_level          = item.attic.raised_level %}
                {% assign r_text                = item.attic.r_text %}
                {% assign text_emphasis         = item.attic.text_emphasis %}
                {% assign padding_top           = item.attic.padding_top %}
                {% assign padding_bottom        = item.attic.padding_bottom %}
                {% assign padding_bottom        = item.attic.padding_bottom %}
                {% assign margin_bottom         = item.attic.margin_bottom %}

                {% if item.attic.title.size != 1 %}
                {% assign title_size            = item.attic.title.size %}
                {% endif %}
                {% assign title_color           = item.attic.title.color %}
                {% assign title_animate         = item.attic.title.animate %}
                {% assign title_align           = item.attic.title.align %}

                {% assign background_color_1    = item.attic.background_color_1 %}
                {% assign background_color_2    = item.attic.background_color_2 %}

                {% assign type                  = item.attic.type %}
                {% assign slides                = item.attic.slides %}
                {% assign opacity               = item.attic.opacity %}
                {% assign spinner               = item.attic.spinner %}
                {% assign alignX                = item.attic.alignX %}
                {% assign alignY                = item.attic.alignY %}
                {% assign scale                 = item.attic.scale %}
                {% assign animateFirst          = item.attic.animateFirst %}
                {% assign paused                = item.attic.paused %}
                {% assign start                 = item.attic.start %}
                {% assign preload               = item.attic.preload %}
                {% assign preloadSize           = item.attic.preloadSize %}
                {% assign bypassCss             = item.attic.bypassCss %}
                {% assign transition            = item.attic.transition %}
                {% assign duration              = item.attic.duration %}
                {% assign transitionDuration    = item.attic.transitionDuration %}
                {% assign animateFirst          = item.attic.animateFirst %}
                {% assign sound                 = item.attic.sound %}

                // Create and json object for HEADER options taken from
                // header config (YAML data file)
                /* eslint-disable */
                var atticOptionsHeader = {
                  {% if opacity %}              "opacity":                {{ opacity | json }}, {% endif %}
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
                var atticOptionsBackstretch = {
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
                /* eslint-enable */

                // Merge|Overload Attic OPTIONS
                atticOptions = $.extend({}, atticOptions, atticOptionsHeader, atticOptionsBackstretch);

                // Overload Attic OPTIONS by settings from frontmatterOptions
                if (frontmatterOptions.background_color_1) atticOptions.background_color_1 = frontmatterOptions.background_color_1;
                if (frontmatterOptions.background_color_2) atticOptions.background_color_2 = frontmatterOptions.background_color_2;
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

            {% comment %} Add header CSS classes
            -------------------------------------------------------------------- {% endcomment %}
            if (atticOptions.r_text == 'enabled') { $('#{{attic_id}}').addClass('r-text'); }

            var raised_level = 'raised-z' +atticOptions.raised_level;
            $('#{{attic_id}}').addClass(raised_level);
            $('#head-title').addClass(atticOptions.title_animate);
            $('#head-title').addClass(atticOptions.title_animate_delay);
            $('#head-title').addClass(atticOptions.title_animate_duration);
            $('#head-tagline').addClass(atticOptions.tagline_animate);
            $('#head-tagline').addClass(atticOptions.tagline_animate_duration);

            var text_emphasis = 'text-emphasis-' +atticOptions.text_emphasis;
            $('#head-title-text').addClass(text_emphasis);
            $('#head-tagline-text').addClass(text_emphasis);

            // check if attic should be translated
            //
            if (atticOptions.notranslate) {
              $('#{{attic_id}}').addClass('notranslate');
            }

            {% comment %} Add header CSS styles to <HEAD>
            -------------------------------------------------------------------- {% endcomment %}
            var attic_style = '';

            // Initialze header background gradient
            attic_style += '<style> .attic { ';
            attic_style += 'background-image: -webkit-gradient(linear, left top, left bottom, from(' +atticOptions.background_color_1 + '), to(' +atticOptions.background_color_2+ ')) !important;';
            attic_style += 'background-image: -webkit-linear-gradient(top, ' +atticOptions.background_color_1 + ' 0%, ' +atticOptions.background_color_2 + ' 100%) !important;';
            attic_style += 'background-image: -o-linear-gradient(top, ' +atticOptions.background_color_1 + ' 0%, ' +atticOptions.background_color_2 + ' 100%) !important;';
            attic_style += 'background-image: linear-gradient(to bottom, ' +atticOptions.background_color_1 + ' 0%, ' +atticOptions.background_color_2 + ' 100%) !important;';
            attic_style += 'filter: progid:DXImageTransform.Microsoft.gradient(startColorstr="' +atticOptions.background_color_1 + '", endColorstr="' +atticOptions.background_color_2 + '", GradientType=0) !important;';
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
            logger.debug('\n' + 'state: ' + _this.getState());

            {% comment %} Run the image header if any
            -------------------------------------------------------------------- {% endcomment %}
            if (typeof atticOptions.slides != 'undefined') {
              // Load the image header if the page is ready (visible)
              $(function() {
                // logger.debug('\n' + 'Load image header on: ' + {{attic_id}});
                logger.debug('\n' + 'Load image header');
                {{attic_id}}(atticOptions);
                _this.setState('completed');
                logger.debug('\n' + 'state: ' + _this.getState());
              });
            }
          } // END if header id found in page
        {% endif %} // END if header enabled
      {% endfor %} // END for item in header_config.attics

      // NO header found in page
      if ($('#no_header').length) {
        _this.setState('completed');
        logger.debug('\n' + 'state: ' + _this.getState());
        logger.warn('\n' + 'no header configured or found in page');
      }

      return true;
    }, // END loadHeader

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
        status = 'completed';
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
