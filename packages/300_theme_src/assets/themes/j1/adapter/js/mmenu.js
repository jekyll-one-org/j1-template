---
regenerate: true
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
 # Copyright (C) 2023 Juergen Adams
 #
 # J1 Theme is licensed under the MIT License.
 # For details, see: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE.md
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
{% assign template_config               = site.data.template_settings %}
{% assign blocks                        = site.data.blocks %}
{% assign modules                       = site.data.modules %}

{% assign template_config               = site.data.template_settings %}
{% assign navigator_defaults            = modules.defaults.navigator.defaults %}
{% assign navigator_settings            = modules.navigator.settings %}
{% assign themer_defaults               = modules.defaults.themer.defaults %}
{% assign themer_settings               = modules.themer.settings %}

{% comment %} Set config data
-------------------------------------------------------------------------------- {% endcomment %}
{% assign nav_mmenu_defaults            = navigator_defaults.nav_mmenu %}
{% assign nav_mmenu_settings            = navigator_settings.nav_mmenu %}

{% comment %} Set config options
-------------------------------------------------------------------------------- {% endcomment %}
{% assign navigator_options             = navigator_defaults | merge: navigator_settings %}
{% assign themer_options                = themer_defaults | merge: themer_settings %}
{% assign nav_mmenu_options             = nav_mmenu_defaults | merge: nav_mmenu_settings %}
{% assign nav_mmenu_id                  = navigator_defaults.nav_mmenu.xhr_container_id %}
{% assign nav_navbar_media_breakpoint   = navigator_defaults.nav_bar.media_breakpoint %}
{% assign nav_mmenu_id                  = navigator_options.nav_mmenu.id %}

{% comment %} Detect prod mode
-------------------------------------------------------------------------------- {% endcomment %}
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
 # {{site.data.template_settings.theme_author_url}}
 #
 # Copyright (C) 2023 Juergen Adams
 #
 # J1 Theme is licensed under the MIT License.
 # For details, see {{site.data.template_settings.theme_author_url}}
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
j1.adapter.mmenu = (function (j1, window) {

  // ---------------------------------------------------------------------------
  // globals
  // ---------------------------------------------------------------------------
  var environment     = '{{environment}}';
  var dclFinished     = false;
  var moduleOptions   = {};
  var navMenuOptions  = {};
  var themerOptions   = {};
  var cookie_names    = j1.getCookieNames();
  var themerEnabled   = {{themer_options.enabled}};
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

      // -----------------------------------------------------------------------
      // Default module settings
      // -----------------------------------------------------------------------
      var settings  = $.extend({
        module_name: 'j1.adapter.mmenu',
        generated:   '{{site.time}}'
      }, options);

      // -----------------------------------------------------------------------
      // Global variable settings
      // -----------------------------------------------------------------------
      _this         = j1.adapter.mmenu;
      logger        = log4javascript.getLogger('j1.adapter.mmenu');

      // initialize state flag
      _this.setState('started');
      logger.debug('\n' + 'state: ' + _this.getState());
      logger.info('\n' + 'module is being initialized');

      // -----------------------------------------------------------------------
      // options loader
      // -----------------------------------------------------------------------
      /* eslint-disable */
      navMenuOptions = $.extend({}, {{nav_mmenu_options | replace: '=>', ':' }});
      themerOptions  = $.extend({}, {{themer_options | replace: '=>', ':' | replace: 'nil', '""' }});
      /* eslint-enable */
      var xhr_data_path;
      var menu_id;

      // save config settings into the mmenu object for global access
      //
      _this['navMenuOptions'] = navMenuOptions;

      // Load (individual) frontmatter options (currently NOT used)
      //
      if (options != null) { var frontmatterOptions = $.extend({}, options); }

      _this.setState('started');
      logger.debug('\n' + 'state: ' + _this.getState());
      logger.info('\n' + 'module is being initialized');
      _this.mmenuLoader(navMenuOptions);
    }, // END init

    // -------------------------------------------------------------------------
    // MMenu Loader
    // -------------------------------------------------------------------------
    mmenuLoader: function (mmOptions) {
      var menu_id;
      var xhr_data_path;

      _this.setState('loading');
      logger.info('\n' + 'status: ' + _this.getState());
      logger.info('\n' + 'load HTML data for navs and drawers');

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

      {% for item in nav_mmenu_options.menus %} {% if item.menu.enabled %}

      {% assign menu_id           = item.menu.xhr_container_id %}
      {% assign xhr_data_path     = item.menu.xhr_data_path %}
      {% assign xhr_data_element  = item.menu.xhr_data_element %}

      j1.loadHTML ({
        xhr_container_id:   '{{menu_id}}',
        xhr_data_path:      '{{xhr_data_path}}',
        xhr_data_element:   '{{xhr_data_element}}' },
        'j1.adapter.mmenu',
        {% if forloop.last %}'data_loaded'{% else %}'null'{% endif %}){% if forloop.last %};{% else %};{% endif %}

      {% endif %}
      {% capture id_list %}{{id_list}}{{menu_id}}{% if forloop.last %}{% else %},{% endif %} {% endcapture %}
      {% endfor %} // ENDFOR menus

      logger.info('\n' + 'initialize navs and drawers');
      _this.mmenuInitializer(mmOptions);
      _this.setState('finished');
      logger.debug('\n' + 'state: ' + _this.getState());
      logger.info('\n' + 'module initialized successfully');

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

        logger.info('\n' + 'mmenu is being initialized on id: {{menu_id}}');

        {% if item.menu.content.type == "navigation" %}
        // Create an mmenu instance of type NAVIGATION
        logger.info('\n' + 'found content type: NAVIGATION');
        // ---------------------------------------------------------------------
        // menu initializer (NAVIGATION)
        // ---------------------------------------------------------------------
        // NOTE: Run load check (j1.xhrDataState) before initialization
        //
        logger.info('\n' + 'initialize mmenu on id: #{{menu_id}}');
        var dependencies_met_{{menu_id}}_loaded = setInterval (function () {
          if (j1.xhrDataState['#{{menu_id}}'] == 'success' ) {
            logger.debug('\n' + 'met dependencies for: {{menu_id}}');
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
              position: mmOptions.mmenu_drawer.position,
              toggle_mode: false
            });

            const navigator_{{menu_id}} = mmenu_{{menu_id}}.navigation ({
              // navigator options
              selected:         mmOptions.mmenu_navigator.selected,
              slidingSubmenus:  mmOptions.mmenu_navigator.slidingSubmenus,
              title:            mmOptions.mmenu_navigator.title,
              theme:            mmOptions.mmenu_navigator.theme
            });

            // make sure the QL menu is shown, if mmenu is closed
            // by clicking the mmenu backdrop
            //
            $('.mm-ocd__backdrop').click(function() {
              $('#quicklinks').show();
              return false
            });

            // Toggle Bars (Hamburger) for the NavBar to open|close
            // the mmenu drawer
            //
            $('{{item.menu.content.button}}').each(function(e) {
              var $this = $(this);
              var clicked;

              $this.on('click', function(e) {
                const button_{{menu_id}} = this;
                e.preventDefault();
                // toggle mmenu open|clse
                clicked = $('body.mm-ocd-opened').length ? true : false;
                if (clicked) {
                  drawer_{{menu_id}}.close();
                  $('#quicklinks').show();
                  clicked = false;
                } else {
                  $('#quicklinks').hide();
                  drawer_{{menu_id}}.open();
                  clicked = true;
                }
              });
            });

            // jadams, 2020-09-30: loading the menues (themes) if enabled
            //
            if (themerEnabled) {
              // load REMOTE themes from Bootswatch API (localFeed EMPTY!)
              $('#remote_themes_mmenu').bootstrapThemeSwitcher({
                localFeed: '',
                bootswatchApiVersion: themerOptions.bootswatchApiVersion
              });
              // load LOCAL themes from JSON data
              $('#local_themes_mmenu').bootstrapThemeSwitcher({
                localFeed: themerOptions.localThemes
              });
            }

            $('#{{item.menu.content.id}}').show();
            logger.info('\n' + 'initializing mmenu finished on id: #{{menu_id}}');
            logger.debug('\n' + 'met dependencies for: {{menu_id}} loaded');
            clearInterval(dependencies_met_{{menu_id}}_loaded);
            $('#{{item.menu.content.id}}').show();
            logger.info('\n' + 'initializing mmenu finished on id: #{{menu_id}}');
          }; // END mmenu_loaded
        }, 5); // END dependencies_met_mmenu_loaded
        {% endif %} // ENDIF content_type: NAVIGATION

        {% if item.menu.content.type == "drawer" %}
          // Create an mmenu instance of type HTML
          logger.info('\n' + 'found content type: DRAWER');
          // -------------------------------------------------------------------
          // menu initializer (DRAWER)
          // -------------------------------------------------------------------
          // TODO: Check if Toggle button make sense/should be implemented
          // NOTE: Run load check (j1.xhrDataState) before initialization
          //
          logger.info('\n' + 'initialize mmenu on id: #{{menu_id}}');
          var dependencies_met_{{menu_id}}_loaded = setInterval (function () {
            if (j1.xhrDataState['#{{menu_id}}'] == 'success' &&
                $('{{item.menu.content.button}}').length) {
              logger.debug('\n' + 'met dependencies for: xhrData/{{menu_id}}');

              const menu_selector = document.querySelector('#{{menu_id}}');
              const mmenu_{{menu_id}} = new MmenuLight (
                menu_selector,
                '(max-width: ' + mmOptions.mmenu_plugin.max_width +'px)', {
                // plugin options
                node:             mmOptions.mmenu_plugin.node,
                mediaQuery:       mmOptions.mmenu_plugin.mediaQuery
              });

              const drawer_{{menu_id}} = mmenu_{{menu_id}}.offcanvas ({
                position: '{{item.menu.drawer.position}}'
              });

              // set an id on the drawer wrapper div for later use
              //
              drawer_{{menu_id}}.wrapper.id = 'drawer_{{menu_id}}';

              // monitor for state changes on the drawer
              //
              $('#drawer_{{menu_id}}').attrchange({
                trackValues: true,
                callback: function (event) {
                  logger.debug('\n' + 'hide|show the nav menu');
                  // switch off|on the (main) nav menu
                  $('#' + 'navigator_nav_navbar').toggle();
                  // $('#' + 'navbar-brand').toggle();
                  // $('#' + navMenuOptions.nav_main_menu).toggle();
                  // $('#' + navMenuOptions.nav_quicklinks).toggle();
                }
              });

              // button for the MMenu tocbar to open|close the toc drawer
              //
              $('{{item.menu.content.button}}').each(function(e) {
                var $this = $(this);
                $this.on('click', function(e) {
                  var button_{{menu_id}} = this;
                  var hasClass;

                  // check if the button should be activated
                  // e.g for TOC only if class js-toc-content is found
                  //
                  if ('{{item.menu.content.button_activated}}' != 'always') {
                    hasClass = $('main').hasClass('{{item.menu.content.button_activated}}');
                  } else {
                    hasClass = true;
                  }
                  if (hasClass) {
                    e.preventDefault();
                    drawer_{{menu_id}}.open();
                  } // END if hasclass
                });
              });
              logger.debug('\n' + 'met dependencies for: {{menu_id}} loaded');
              clearInterval(dependencies_met_{{menu_id}}_loaded);
              $('#{{item.menu.content.id}}').show();
          }; // END if menu_loaded
        }, 5); // END dependencies_met_mmenu_loaded
        logger.info('\n' + 'initializing mmenu finished on id: #{{menu_id}}');
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
      if (message.type === 'command' && message.action === 'status') {
        logger.info('\n' + 'messageHandler: received - ' + message.action);
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
