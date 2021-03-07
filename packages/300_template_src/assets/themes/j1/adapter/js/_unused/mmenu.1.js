---
regenerate:                             false
---

{% capture cache %}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/mmenu.js
 # Liquid template to adapt Mmenu-Light Core functions
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
 # NOTE:
 #
 # JSON pretty print
 # Example: var str = JSON.stringify(obj, null, 2); // spacing level = 2
 # See: https://stackoverflow.com/questions/4810841/how-can-i-pretty-print-json-using-javascript
 # -----------------------------------------------------------------------------
{% endcomment %}

{% comment %} Liquid procedures
-------------------------------------------------------------------------------- {% endcomment %}
{% capture select_color %}themes/{{site.template.name}}/procedures/global/select_color.proc{% endcapture %}

{% comment %} Set global settings
-------------------------------------------------------------------------------- {% endcomment %}
{% assign environment                   = site.environment %}
{% assign brand_image_height            = site.brand.image_height %}

{% comment %} Process YML config data
================================================================================ {% endcomment %}

{% comment %} Set config files
{% assign auth_manager_config           = site.j1_auth %}
-------------------------------------------------------------------------------- {% endcomment %}
{% assign template_config               = site.data.j1_config %}
{% assign blocks                        = site.data.blocks %}
{% assign modules                       = site.data.modules %}

{% assign template_config               = site.data.j1_config %}
{% assign navigator_defaults            = site.data.modules.defaults.navigator.defaults %}
{% assign navigator_settings            = site.data.modules.navigator.settings %}

{% comment %} Set config data
-------------------------------------------------------------------------------- {% endcomment %}
{% assign nav_mmenu_defaults            = navigator_defaults.nav_mmenu %}
{% assign nav_mmenu_settings            = navigator_settings.nav_mmenu %}

{% comment %} Set config options
-------------------------------------------------------------------------------- {% endcomment %}
{% assign navigator_options             = navigator_defaults | merge: navigator_settings %}
{% assign nav_mmenu_options             = nav_mmenu_defaults | merge: nav_mmenu_settings %}
{% assign nav_mmenu_id                  = navigator_defaults.nav_mmenu.xhr_container_id %}
{% assign nav_navbar_media_breakpoint   = navigator_defaults.nav_bar.media_breakpoint %}
{% assign nav_mmenu_id                  = navigator_options.nav_mmenu.id %}

{% assign production = false %}
{% if environment == 'prod' or environment == 'production' %}
  {% assign production = true %}
{% endif %}

/*
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/mmenu.js
 # JS Adapter for J1 MobileMenu (MMenu Light)
 #
 # Product/Info:
 # {{site.data.j1_config.theme_author_url}}
 #
 # Copyright (C) 2021 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # For details, see {{site.data.j1_config.theme_author_url}}
 # -----------------------------------------------------------------------------
 # NOTE: For AJAX (XHR) loads see
 #  https://stackoverflow.com/questions/3709597/wait-until-all-jquery-ajax-requests-are-done
 # -----------------------------------------------------------------------------
 # NOTE: For getStyleValue helper see
 #  https://stackoverflow.com/questions/16965515/how-to-get-a-style-attribute-from-a-css-class-by-javascript-jquery
 # -----------------------------------------------------------------------------
 # Adapter generated: {{site.time}}
 # -----------------------------------------------------------------------------
*/

// -----------------------------------------------------------------------------
// ESLint shimming
// -----------------------------------------------------------------------------
/* eslint indent: "off"                                                       */
// -----------------------------------------------------------------------------
'use strict';

j1.adapter['mmenu'] = (function (j1, window) {

  // ---------------------------------------------------------------------------
  // globals
  // ---------------------------------------------------------------------------
  var environment         = '{{environment}}';
  var dclFinished         = false;
  var moduleOptions       = {};
  var cookie_names        = j1.getCookieNames();
  var user_state;
  var user_session;
  var user_data;
  var _this;
  var logger;
  var logText;

  // ---------------------------------------------------------------------------
  // helper functions
  // ---------------------------------------------------------------------------

  // ---------------------------------------------------------------------------
  // main object
  // ---------------------------------------------------------------------------
  return {

    // -------------------------------------------------------------------------
    // module initializer
    // -------------------------------------------------------------------------
    init: function (options) {
      // initialize state flag
      j1.adapter.mmenu.state = 'pending';

      // -----------------------------------------------------------------------
      // defaults
      // -----------------------------------------------------------------------
      var settings  = $.extend({
        module_name: 'j1.adapter.mmenu',
        generated:   '{{site.time}}'
      }, options);

      // -----------------------------------------------------------------------
      // globals
      // -----------------------------------------------------------------------
      _this         = j1.adapter.mmenu;
      logger        = log4javascript.getLogger('j1.adapter.mmenu');

      // -----------------------------------------------------------------------
      // options loader
      // -----------------------------------------------------------------------
      /* eslint-disable */
      var navMenuOptions = $.extend({}, {{nav_mmenu_options | replace: '=>', ':' }});
      /* eslint-enable */
      var xhr_data_path;
      var menu_id;

      // save config settings into the mmenu object for global access
      //
      j1.adapter.mmenu['navMenuOptions'] = navMenuOptions;

      // Load (individual) frontmatter options (currently NOT used)
      //
      if (options != null) { var frontmatterOptions = $.extend({}, options); }

      _this.setState('started');
      logger.info('state: ' + _this.getState());
      logger.info('module is being initialized');

      var dependencies_met_page_loaded = setInterval(function() {
        if ( j1.getState() == 'finished' ) {
          logger.info('dependencies of module met');
          j1.adapter.mmenu.mmenuLoader(navMenuOptions);
          clearInterval(dependencies_met_page_loaded);
        }
      }, 25);
    }, // END init

    // -------------------------------------------------------------------------
    // MMenu Loader
    // -------------------------------------------------------------------------
    mmenuLoader: function (mmOptions) {
      var menu_id;
      var xhr_data_path;

      _this.setState('loading');
      logger.info('status: ' + _this.getState());
      logger.info('load HTML data for navs and drawers');

      {% assign id_list = "" %}

      // -----------------------------------------------------------------------
      // Load HTML data (AJAX)
      // -----------------------------------------------------------------------
      // jadams, 202-06-24: Promise (chain) if $.when seems NOT to work correctly.
      // It semms a chain using .then will be a better solution to make it sure
      // that the last Deferred set the state to 'data_loaded'.
      // Found the final state randomly set to 'null' what prevent the module
      // to run mmenuInitializer.
      // Workaround: Set 'data_loaded' to be returned by all Deferred in
      // the chain.
      // See: https://stackoverflow.com/questions/5436327/jquery-deferreds-and-promises-then-vs-done
      //
      {% comment %} Modify chain
      --------------------------------------------------------------------------
        {% if forloop.last %}'data_loaded'{% else %}'null'{% endif %}){% if forloop.last %}{% else %},{% endif %}
      to
        {% if forloop.last %}'data_loaded'{% else %}'data_loaded'{% endif %}){% if forloop.last %}{% else %},{% endif %}
      -------------------------------------------------------------------------- {% endcomment %}
      $.when (
      {% for item in nav_mmenu_options.menus %} {% if item.menu.enabled %}
      {% assign menu_id       = item.menu.xhr_container_id %}
      {% assign xhr_data_path = item.menu.xhr_data_path %}

        j1.xhrData (
          'j1.adapter.mmenu', {
          xhr_container_id: '{{menu_id}}',
          xhr_data_path:    '{{xhr_data_path}}' },
          {% if forloop.last %}'null'{% else %}'null'{% endif %}){% if forloop.last %}{% else %},{% endif %}

      {% endif %}
      {% capture id_list %}{{id_list}}{{menu_id}}{% if forloop.last %}{% else %},{% endif %} {% endcapture %}
      {% endfor %} // ENDFOR menus
      ).done (function ({{id_list}}) {
        // ---------------------------------------------------------------------
        // Initialize MMenu Navs and Drawers
        // ---------------------------------------------------------------------
        // Make sure that Load HTML data (AJAX) is finished
        setTimeout (function() {
          _this.setState('data_loaded');
        }, 300);

        var dependencies_met_mmenu_initialized = setInterval (function () {
          if (_this.getState() === 'data_loaded') {
            logger.info('load HTML data (AJAX): finished');
            _this.setState('processing');
            logger.info('status: ' + _this.getState());
            logger.info('initialize navs and drawers');
            j1.adapter.mmenu.mmenuInitializer(mmOptions);
            clearInterval(dependencies_met_mmenu_initialized);
          }
        }, 25); // END dependencies_met_mmenu_loaded

        var dependencies_met_all_menu_loaded = setInterval (function () {
          if ( $('#menu_mmenu').length && $('#sidebar_mmenu').length && $('#toc_mmenu').length ) {
            _this.setState('finished');
            logger.info('status: ' + _this.getState());
            clearInterval(dependencies_met_all_menu_loaded);
          }
        }, 25); // END dependencies_met_all_menu_loaded
      }); // END done
    }, // END dataLoader

    // -------------------------------------------------------------------------
    // MMenu Initializer
    // -------------------------------------------------------------------------
    mmenuInitializer: function (mmOptions) {
      var menu_id;
      var xhr_data_path;

      {% for item in nav_mmenu_options.menus %} {% if item.menu.enabled %}

      {% assign menu_id = item.menu.xhr_container_id %}
      menu_id           = '{{menu_id}}';
      xhr_data_path     = '{{item.menu.xhr_data_path}}';

      // Create an mmenu instance if id exists: {{menu_id}}
      if ($('#{{menu_id}}').length) {

        logger.info('mmenu is being initialized on id: {{menu_id}}');

        {% if item.menu.content.type == "navigation" %}
        // Create an mmenu instance of type NAVIGATION
        logger.info('found content type: NAVIGATION');
        // ---------------------------------------------------------------------
        // menu initializer (NAVIGATION)
        // ---------------------------------------------------------------------
        logger.info('initialize mmenu on id: #{{menu_id}}');
        var dependencies_met_{{menu_id}}_loaded = setInterval (function () {
          if ({{menu_id}}) {
            const menu_selector = document.querySelector('#{{menu_id}}');
            const mmenu_{{menu_id}} = new MmenuLight (
              menu_selector,
              '(max-width: ' + mmOptions.mmenu_plugin.max_width +'px)', {
              // plugin options
              node:             mmOptions.mmenu_plugin.node,
              mediaQuery:       mmOptions.mmenu_plugin.mediaQuery
            });

            const drawer_{{menu_id}} = mmenu_{{menu_id}}.offcanvas ({
              // drawer options
              position: mmOptions.mmenu_drawer.position
            });

            const navigator_{{menu_id}} = mmenu_{{menu_id}}.navigation ({
              // navigator options
              selected:         mmOptions.mmenu_navigator.selected,
              slidingSubmenus:  mmOptions.mmenu_navigator.slidingSubmenus,
              title:            mmOptions.mmenu_navigator.title,
              theme:            mmOptions.mmenu_navigator.theme
            });

            // Toggle Bars (Hamburger) for the NavBar to open|close
            // the mmenu drawer
            $('{{item.menu.content.button}}').each(function(e) {
              var $this = $(this);

              $this.on('click', function(e){
                const button_{{menu_id}} = this;

                // TODO: Animated toggle button
                //
                // $('{{item.menu.content.toggler}}').toggleClass('fadeIn');
                // $('{{item.menu.content.toggler}}').toggleClass('rotateIn')

                // $('.mdi', this).toggleClass('mdi-menu');
                // $('.mdi', this).toggleClass('mdi-close');

                e.preventDefault();

                // (toggler_{{menu_id}}.t = !toggler_{{menu_id}}.t)
                //   ? drawer_{{menu_id}}.open()
                //   : drawer_{{menu_id}}.close();

                drawer_{{menu_id}}.open();
              });
            });
            clearInterval(dependencies_met_{{menu_id}}_loaded);
            $('#{{item.menu.content.id}}').show();
            logger.info('initializing mmenu finished on id: #{{menu_id}}');
          }; // END mmenu_loaded
        }, 25); // END dependencies_met_mmenu_loaded
        {% endif %} // ENDIF content_type: NAVIGATION

        {% if item.menu.content.type == "drawer" %}
          // Create an mmenu instance of type HTML
          logger.info('found content type: DRAWER');
          // -------------------------------------------------------------------
          // menu initializer (DRAWER)
          // -------------------------------------------------------------------
          logger.info('initialize mmenu on id: #{{menu_id}}');
          var dependencies_met_{{menu_id}}_loaded = setInterval (function () {
            if ({{menu_id}}) {
              const menu_selector = document.querySelector('#{{menu_id}}');

              const mmenu_{{menu_id}} = new MmenuLight (
                menu_selector,
                '(max-width: ' + mmOptions.mmenu_plugin.max_width +'px)', {
                // plugin options
                node:             mmOptions.mmenu_plugin.node,
                mediaQuery:       mmOptions.mmenu_plugin.mediaQuery
              });

              const drawer_{{menu_id}} = mmenu_{{menu_id}}.offcanvas ({
                // drawer options
                position: '{{item.menu.drawer.position}}'
              });

              // button for the MMenu tocbar to open|close the toc drawer
              $('{{item.menu.content.button}}').each(function(e) {
                var $this = $(this);

                $this.on('click', function(e) {
                  var button_{{menu_id}} = this;
                  var hasClass;

                  // check if the button should be activated
                  // e.g for TOC only if clas js-toc-content is found
                  //
                  if ('{{item.menu.content.button_activated}}' != 'always') {
                    hasClass = $('main').hasClass('{{item.menu.content.button_activated}}');
                  } else {
                    hasClass = true;
                  }
                  if (hasClass) {
                    // Toggle button animation
                    //$('{{item.menu.content.toggler}}').toggleClass('{{item.menu.content.toggler_animation}}')

                    e.preventDefault();

                    // (toggler_{{menu_id}}.t = !toggler_{{menu_id}}.t)
                    //   ? drawer_{{menu_id}}.open()
                    //   : drawer_{{menu_id}}.close();

                    drawer_{{menu_id}}.open();
                  } // END if hasclass
                });
              });
              clearInterval(dependencies_met_{{menu_id}}_loaded);
              $('#{{item.menu.content.id}}').show();
          }; // END if menu_loaded
        }, 25); // END dependencies_met_mmenu_loaded
        logger.info('initializing mmenu finished on id: #{{menu_id}}');
        {% endif %} // ENDIF content_type: DRAWER
        } // END menus|drawers
      {% endif %} // ENDIF menu enabled
      {% endfor %} // ENDFOR menus
    }, // END mmenuInitializer

    // -------------------------------------------------------------------------
    // messageHandler
    // Manage messages (paylods) send from other J1 modules
    // -------------------------------------------------------------------------
    messageHandler: function (sender, message) {
      // var json_message = JSON.stringify(message, undefined, 2);              // multiline
      var json_message = JSON.stringify(message);

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
      if (message.type === 'command' && message.action === 'status') {
        logger.info('messageHandler: received - ' + message.action);
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
      j1.adapter.mmenu.state = stat;
    }, // END setState

    // -------------------------------------------------------------------------
    // getState
    // Returns the current (processing) state of the module
    // -------------------------------------------------------------------------
    getState: function () {
      return j1.adapter.mmenu.state;
    } // END state

  }; // END return
})(j1, window);

{% endcapture %}
{% if production %}
  {{ cache | minifyJS }}
{% else %}
  {{ cache | strip_empty_lines }}
{% endif %}
{% assign cache = nil %}
