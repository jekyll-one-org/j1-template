---
regenerate:                             true
---

{% capture cache %}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/particles.js
 # Liquid template to adapt the particles module
 #
 # Product/Info:
 # https://jekyll.one
 # Copyright (C) 2023 Juergen Adams
 #
 # J1 Theme is licensed under the MIT License.
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
 # J1 Theme is licensed under the MIT License.
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
  // helper functions
  // ---------------------------------------------------------------------------

  function executeParticles(containerID, json_data) {

    {% assign particle_default = particles_defaults.json_data %}

    {% for item in particles_settings.particles %}
      {% if item.particle.enabled %}

        {% assign particle_id               = item.particle.id %}
        {% assign particle_item             = item.particle.json_data %}
        {% assign item_particles            = item.particle.json_data.particles %}

        // particle_id:                   {{ particle_id }}
        // particle_default:              {{ particle_default }}
        // particle_item:                 {{ particle_item }}
        // item_particles:                {{ item_particles }}

        var defaultParticles  = $.extend({}, {{particle_default | replace: 'nil', 'null' | replace: '=>', ':' }});
        var itemParticles     = $.extend({}, {{particle_item | replace: 'nil', 'null' | replace: '=>', ':' }});
//      var itemParticles     = $.extend({}, {{item_particles | replace: 'nil', 'null' | replace: '=>', ':' }});
//      var particlesOptions  = $.extend({}, defaultParticles, itemParticles );
//      var strJSON           = JSON.stringify(particlesOptions, null, 2);
//      var strJSON           = JSON.stringify(itemParticles, null, 2);
//      var itemParticlesJSON;

        var particlesOptions;
        var particlesOptionsJSON;
        var particlesOptionsOBJECT;

        particlesOptions      = $.extend({}, defaultParticles, itemParticles);
        particlesOptionsJSON  = JSON.stringify(particlesOptions);
        particlesOptionsOBJECT = JSON.parse(particlesOptionsJSON);

        // particlesOptionsJSON
        //
        // {"particles":{"number":{"value":150,"density":{"enable":true,"value_area":800}},"color":{"value":"#ffffff"},"shape":{"type":"image","stroke":{"width":0,"color":"#000000"},"polygon":{"nb_sides":5},"image":{"src":"/assets/themes/j1/modules/particles/css/images/snowflake-1.png","width":100,"height":100}},"opacity":{"value":0.5,"random":true,"anim":{"enable":false,"speed":1,"opacity_min":0.1,"sync":false}},"size":{"value":10,"random":true,"anim":{"enable":false,"speed":40,"size_min":0.1,"sync":false}},"line_linked":{"enable":false,"distance":500,"color":"#ffffff","opacity":0.4,"width":2},"move":{"enable":true,"speed":1.5,"direction":"bottom","random":false,"straight":false,"out_mode":"out","bounce":false,"attract":{"enable":false,"rotateX":600,"rotateY":1200}}},"interactivity":{"detect_on":"canvas","events":{"onhover":{"enable":false,"mode":"bubble"},"onclick":{"enable":false,"mode":"repulse"},"resize":true},"modes":{"grab":{"distance":400,"line_linked":{"opacity":0.5}},"bubble":{"distance":400,"size":4,"duration":0.3,"opacity":0.5,"speed":3},"repulse":{"distance":200,"duration":0.4},"push":{"particles_nb":4},"remove":{"particles_nb":2}}},"retina_detect":true}


        // {"particles":{"number":{"value":150,"density":{"enable":true,"value_area":800}},"color":{"value":"#ffffff"},"shape":{"type":"image","stroke":{"width":0,"color":"#000000"},"polygon":{"nb_sides":5},"image":{"src":"/assets/themes/j1/modules/particles/css/images/snowflake-1.png","width":100,"height":100}},"opacity":{"value":0.5,"random":true,"anim":{"enable":false,"speed":1,"opacity_min":0.1,"sync":false}},"size":{"value":10,"random":true,"anim":{"enable":false,"speed":40,"size_min":0.1,"sync":false}},"line_linked":{"enable":false,"distance":500,"color":"#ffffff","opacity":0.4,"width":2},"move":{"enable":true,"speed":1.5,"direction":"bottom","random":false,"straight":false,"out_mode":"out","bounce":false,"attract":{"enable":false,"rotateX":600,"rotateY":1200}}}}


        // particlesJSON     = '"particles": ';
        // particlesJSON    += itemParticlesJSON;
        // particlesJSON    += '';

        // particlesJS(containerID, {
        //   particlesJSON
        // });

        // particlesJS(containerID, particlesOptionsOBJECT);
        // particlesJS(containerID, particlesOptionsJSON);

        particlesJS(containerID, {
          "particles":{"number":{"value":150,"density":{"enable":true,"value_area":800}},"color":{"value":"#ffffff"},"shape":{"type":"image","stroke":{"width":0,"color":"#000000"},"polygon":{"nb_sides":5},"image":{"src":"/assets/themes/j1/modules/particles/css/images/snowflake-1.png","width":100,"height":100}},"opacity":{"value":0.5,"random":true,"anim":{"enable":false,"speed":1,"opacity_min":0.1,"sync":false}},"size":{"value":10,"random":true,"anim":{"enable":false,"speed":40,"size_min":0.1,"sync":false}},"line_linked":{"enable":false,"distance":500,"color":"#ffffff","opacity":0.4,"width":2},"move":{"enable":true,"speed":1.5,"direction":"bottom","random":false,"straight":false,"out_mode":"out","bounce":false,"attract":{"enable":false,"rotateX":600,"rotateY":1200}}},"interactivity":{"detect_on":"canvas","events":{"onhover":{"enable":false,"mode":"bubble"},"onclick":{"enable":false,"mode":"repulse"},"resize":true},"modes":{"grab":{"distance":400,"line_linked":{"opacity":0.5}},"bubble":{"distance":400,"size":4,"duration":0.3,"opacity":0.5,"speed":3},"repulse":{"distance":200,"duration":0.4},"push":{"particles_nb":4},"remove":{"particles_nb":2}}},"retina_detect":true
        });

        {% comment %} load default particle options
        ------------------------------------------------------------------------ {% endcomment %}
        {% assign percent_position    = particles_defaults.percentPosition %}
        {% assign horizontal_order    = particles_defaults.horizontalOrder %}
        {% assign origin_left         = particles_defaults.originLeft %}
        {% assign origin_top          = particles_defaults.originTop %}
        {% assign init_layout         = particles_defaults.initLayout %}
        {% assign transition_duration = particles_defaults.transitionDuration %}
        {% assign stagger_duration    = particles_defaults.stagger %}
        {% assign gutter_size         = particles_defaults.gutter %}

        {% comment %} overload defaults by particle element options
        ------------------------------------------------------------------------ {% endcomment %}
        {% if item.particle.percentPosition %}      {% assign percent_position    = item.particle.percentPosition %}    {% endif %}
        {% if item.particle.horizontalOrder %}      {% assign horizontal_order    = item.particle.horizontalOrder %}    {% endif %}
        {% if item.particle.originLeft %}           {% assign origin_left         = item.particle.originLeft %}         {% endif %}
        {% if item.particle.originTop %}            {% assign origin_top          = item.particle.originTop %}          {% endif %}
        {% if item.particle.initLayout %}           {% assign init_layout         = item.particle.initLayout %}         {% endif %}
        {% if item.particle.transitionDuration %}   {% assign transition_duration = item.particle.transitionDuration %} {% endif %}
        {% if item.particle.stagger %}              {% assign stagger_duration    = item.particle.stagger %}            {% endif %}
        {% if item.particle.gutter %}               {% assign gutter_size         = item.particle.gutter %}             {% endif %}

      {% endif %} // ENDIF particle enabled
    {% endfor %}

  }

  // ---------------------------------------------------------------------------
  // Main object
  // ---------------------------------------------------------------------------
  return {

    // -------------------------------------------------------------------------
    // init()
    // adapter initializer
    // -------------------------------------------------------------------------
    init: function (options) {

      // [INFO   ] [j1.adapter.comments                    ] [ detected comments provider (j1_config): {{comments_provider}}} ]
      // [INFO   ] [j1.adapter.comments                    ] [ start processing load region head, layout: {{page.layout}} ]

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
      var waveDefaults = $.extend({}, {{particles_defaults | replace: 'nil', 'null' | replace: '=>', ':' }});
      var particlesettings = $.extend({}, {{particles_settings | replace: 'nil', 'null' | replace: '=>', ':' }});

      // merge all comment options
      var waveOptions = $.extend({}, waveDefaults, particlesettings, frontmatterOptions);

      _this  = j1.adapter.particles;
      logger = log4javascript.getLogger('j1.adapter.particles');

      // -----------------------------------------------------------------------
      // initializer
      // -----------------------------------------------------------------------
      var dependencies_met_page_ready = setInterval (function (options) {

        if ( j1.getState() === 'finished' ) {

//        var containerID = 'snowflake';
          var dataUrl     = '/assets/data/particles.yml';
          var obj;
          var data;
          var allConfigs;
          var particlesJSON;
          var objParticles;
          var containerID;

          _this.setState('started');
          logger.debug('\n' + 'state: ' + _this.getState());
          logger.info('\n' + 'module is being initialized')


          {% for item in particles_settings.particles %}
            {% if item.particle.enabled %}

          {% assign container_id = item.particle.id %}
          containerID = '{{container_id}}';
          $('.backstretch').attr('id', containerID);

            {% endif %}
          {% endfor %}



          var dependencies_met_attic_ready = setInterval (function (options) {
            if ($('#' + containerID).length != 0) {
              logger.info('\n' + 'container found: ' + '#' + containerID);

              // load particles config from yaml data file (dataUrl)
              $.get(dataUrl)
              .done(function (data) {
                  allConfigs = yaml.loadAll(data, 'utf8');

                {% for item in particles_settings.particles %}
                  {% if item.particle.enabled %}

                  {% assign particle_id = item.particle.id %}
                  containerID = '{{ particle_id }}';


                  if (containerID == 'snowflake') {
                    // pass the data >>object<<
                    objParticles = allConfigs[0][containerID][0];
                    particlesJS(containerID, objParticles);
                  }

                {% endif %}
              {% endfor %}
              })
              .fail(function () {
                logger.error('\n' + 'loading data: failed');
              });

            } else {
              logger.warn('\n' + 'container id not found: ' + '#' + containerID);
            }
            clearInterval(dependencies_met_attic_ready);
          }, 25);
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

{% endcapture %}
{% if production %}
  {{ cache | minifyJS }}
{% else %}
  {{ cache | strip_empty_lines }}
{% endif %}
{% assign cache = nil %}
