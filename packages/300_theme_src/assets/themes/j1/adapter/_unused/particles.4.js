---
regenerate:                             true
---

{%- capture cache %}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/particles.js
 # Liquid template to adapt the particles module
 #
 # Product/Info:
 # https://jekyll.one
 # Copyright (C) 2023 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # For details, see: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE.md
 # -----------------------------------------------------------------------------
 # Test data:
 #  {{ liquid_var | debug }}
 #  particles_options:  {{ particles_options | debug }}
 # -----------------------------------------------------------------------------
{% endcomment %}

{% comment %} Liquid procedures
-------------------------------------------------------------------------------- {% endcomment %}

{% comment %} Set global settings
-------------------------------------------------------------------------------- {% endcomment %}
{% assign environment       = site.environment %}
{% assign asset_path        = '/assets/themes/j1' %}

{% comment %} Process YML config data
================================================================================ {% endcomment %}

{% comment %} Set config files
-------------------------------------------------------------------------------- {% endcomment %}
{% assign template_config    = site.data.j1_config %}
{% assign blocks             = site.data.blocks %}
{% assign modules            = site.data.modules %}

{% comment %} Set config data (settings only)
-------------------------------------------------------------------------------- {% endcomment %}
{% assign particles_defaults = modules.defaults.particles.defaults %}
{% assign particles_settings = modules.particles.settings %}

{% comment %} Set config options (settings only)
-------------------------------------------------------------------------------- {% endcomment %}
{% assign particles_options  = particles_defaults | merge: particles_settings %}

{% comment %} Variables
-------------------------------------------------------------------------------- {% endcomment %}
{% assign comments          = particles_options.enabled %}

{% comment %} Detect prod mode
-------------------------------------------------------------------------------- {% endcomment %}
{% assign production = false %}
{% if environment == 'prod' or environment == 'production' %}
  {% assign production = true %}
{% endif %}

/*
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/particles.js
 # J1 Adapter for the particles module
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2023 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # For details, see: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE.md
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
j1.adapter.particles = (function (j1, window) {

{% comment %} Set global variables
-------------------------------------------------------------------------------- {% endcomment %}
var environment     = '{{environment}}';
var cookie_names    = j1.getCookieNames();
var _this;
var logger;
var logText;

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
        module_name: 'j1.adapter.particles',
        generated:   '{{site.time}}'
      }, options);

      // -----------------------------------------------------------------------
      // Global variable settings
      // -----------------------------------------------------------------------

      // create settings object from frontmatter
      var frontmatterOptions  = options != null ? $.extend({}, options) : {};

      // create settings object from module options
      var particleDefaults = $.extend({}, {{particles_defaults | replace: 'nil', 'null' | replace: '=>', ':' }});
      var particleSettings = $.extend({}, {{particles_settings | replace: 'nil', 'null' | replace: '=>', ':' }});

      // merge all options
      var particleOptions = $.extend({}, particleDefaults, particleSettings, frontmatterOptions);

      _this  = j1.adapter.particles;
      logger = log4javascript.getLogger('j1.adapter.particles');

      // -----------------------------------------------------------------------
      // initializer
      // -----------------------------------------------------------------------
      var dependencies_met_page_ready = setInterval (function (options) {

        if ( j1.getState() === 'finished' ) {
          var obj;
          var data;
          var allConfigs;
          var particlesJSON;
          var objParticles;
          var particleID;
          var particleContainer;
          var dataUrl = particleDefaults['xhr_data_path'];

          _this.setState('started');
          logger.debug('\n' + 'state: ' + _this.getState());
          logger.info('\n' + 'module is being initialized')

          {% for item in particles_settings.particles %}
            {% if item.particle.enabled %}

              {% assign particle_id     = item.particle.id %}
              {% assign canvas_selector = item.particle.canvas_selector %}

              particleID          = '{{ item.particle.id }}';
              particleContainer   = '{{ item.particle.canvas_selector }}';
              $(particleContainer).attr('id', particleID);

              var dependencies_met_attic_ready = setInterval (function (options) {
                if ($('#' + particleID).length != 0) {
                  logger.info('\n' + 'container found: ' + '#' + particleID);

                  // load particles config from yaml data file (dataUrl)
                  $.get(dataUrl)
                  .done(function (data) {
                    allConfigs = yaml.loadAll(data, 'utf8');

                    {% for item in particles_settings.particles %}
                      {% if item.particle.enabled %}

                      {% assign particle_id = item.particle.id %}
                      particleID = '{{ particle_id }}';

                      if (particleID == 'snowflake') {
                        // pass the data >>object<<
                        objParticles = allConfigs[0][particleID][0];
                        particlesJS(particleID, objParticles);
                      }

                    {% endif %}
                  {% endfor %}
                  })
                  .fail(function () {
                    logger.error('\n' + 'loading data: failed');
                  });

                } else {
                  logger.warn('\n' + 'container id not found: ' + '#' + particleID);
                }
                clearInterval(dependencies_met_attic_ready);
              }, 25);
            {% endif %}
          {% endfor %}

          clearInterval(dependencies_met_page_ready);
        }
      }, 25);

    }, // END init

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

{% endcapture -%}
{%- if production -%}
  {{ cache | minifyJS }}
{%- else -%}
  {{ cache | strip_empty_lines }}
{%- endif- %}
{% assign cache = nil %}
