---
regenerate:                             true
---

{% capture cache %}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/lunr.js
 # Liquid template to adapt Lunr for J1 Theme
 #
 # Product/Info:
 # https://jekyll.one
 # Copyright (C) 2023, 2024 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # For details, see: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE.md
 # -----------------------------------------------------------------------------
 # Test data:
 #  {{ liquid_var | debug }}
 # -----------------------------------------------------------------------------
{% endcomment %}

{% comment %} Liquid procedures
-------------------------------------------------------------------------------- {% endcomment %}

{% comment %} Process YML config data
================================================================================ {% endcomment %}

{% comment %} Set config files
-------------------------------------------------------------------------------- {% endcomment %}
{% assign template_config       = site.data.j1_config %}
{% assign blocks                = site.data.blocks %}
{% assign modules               = site.data.modules %}

{% comment %} Set config data
-------------------------------------------------------------------------------- {% endcomment %}
{% assign environment           = site.environment %}
{% assign template_version      = site.version %}

{% assign lunr_search_defaults  = modules.defaults.lunr.defaults %}
{% assign lunr_search_settings  = modules.lunr.settings %}

{% comment %} Set config options
-------------------------------------------------------------------------------- {% endcomment %}
{% assign lunr_search_options    = lunr_search_defaults | merge: lunr_search_settings %}
{% assign topsearch_options      = lunr_search_options.topsearch %}

{% comment %} Detect prod mode
-------------------------------------------------------------------------------- {% endcomment %}
{% assign production = false %}
{% if environment == 'prod' or environment == 'production' %}
  {% assign production = true %}
{% endif %}

/*
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/adapter/js/lunr.js
 # J1 Adapter for J1 Lunr
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2023, 2024 Juergen Adams
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
j1.adapter.lunr = (function (j1, window) {

  {% comment %} Set global variables
  ------------------------------------------------------------------------------ {% endcomment %}
  var searchHistorySelectWrapper = 'search_history_select_wrapper';

  var searchDefaults;
  var searchSettings;
  var searchOptions;
  var topSearchOptions;
  var selectList;
  var $slimSelect;
  var newItem;
  var itemExists;

  var cookie_names;
  var url;
  var baseUrl;
  var hostname;
  var auto_domain;
  var secure;

  var _this;
  var logger;
  var logText;
  var state;


  var textHistory;

  var search_prompt;
  var $searchHstoryWrapper;
  var searchHstoryWrapperID;
  var searchHistoryMax;
  var searchHstoryEnabled;
  var allowSearchHistoryDuplicates;
  var allowSearchHistoryUpdatesOnMax;

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

      // -----------------------------------------------------------------------
      // default module settings
      // -----------------------------------------------------------------------
      var settings = $.extend({
        module_name: 'j1.adapter.lunr',
        generated:   '{{site.time}}'
      }, options);

      // Load  module DEFAULTS|CONFIG
      searchDefaults    = $.extend({},   {{lunr_search_defaults | replace: 'nil', 'null' | replace: '=>', ':' }});
      searchSettings    = $.extend({},   {{lunr_search_settings | replace: 'nil', 'null' | replace: '=>', ':' }});
      searchOptions     = $.extend(true, {}, searchDefaults, searchSettings);
      topSearchOptions  = searchOptions.topsearch;

      // -----------------------------------------------------------------------
      // module variable settings
      // -----------------------------------------------------------------------
      _this   = j1.adapter.lunr;
      logger  = log4javascript.getLogger('j1.adapter.lunr');

      // -----------------------------------------------------------------------
      // top search variable settings
      // -----------------------------------------------------------------------
      cookie_names        = j1.getCookieNames();
      url                 = new liteURL(window.location.href);
      baseUrl             = url.origin;
      hostname            = url.hostname;
      auto_domain         = hostname.substring(hostname.lastIndexOf('.', hostname.lastIndexOf('.') - 1) + 1);
      secure              = (url.protocol.includes('https')) ? true : false;
      searchHstoryEnabled = (topSearchOptions.search_history_enabled === true) ? true : false;


      // -----------------------------------------------------------------------
      // lunr initializer
      // -----------------------------------------------------------------------
      var dependencies_met_j1_finished = setInterval (() => {
        var j1CoreFinished          = (j1.getState() === 'finished') ? true : false;
        var slimSelectFinished      = (j1.adapter.slimSelect.getState() === 'finished') ? true : false;
        var searchHstoryFromCookie  = (topSearchOptions.prompt_history_from_cookie === true) ? true : false;

        if (j1CoreFinished && slimSelectFinished) {

          // initialize state flag
          _this.setState('started');
          logger.debug('\n' + 'set module state to: ' + _this.getState());
          logger.info('\n' + 'initializing module: started');

          $(searchOptions.search_input).lunrSearch({
            index_file: searchOptions.index_file,
            results:    searchOptions.results,
            template:   searchOptions.template,
            titleMsg:   searchOptions.titleMsg,
            emptyMsg:   searchOptions.emptyMsg
          });

          _this.eventHandler();

          // initialize history array from cookie
          if (searchHstoryEnabled && searchHstoryFromCookie) {

            // limit the history
            searchHistoryMax                = topSearchOptions.search_history_max;

            // allow|reject duplicates for the history
            allowSearchHistoryDuplicates    = topSearchOptions.allow_history_duplicates;

            // allow|reject history updates if searchHistoryMax reached
            allowSearchHistoryUpdatesOnMax  = topSearchOptions.allow_history_updates_on_max;

            logger.debug('\n' + 'read prompt history from cookie');
            var data      = [];
            var option    = {};
            search_prompt = j1.existsCookie(cookie_names.search_prompt)
              ? j1.readCookie(cookie_names.search_prompt)
              : {};

            // convert search prompt object to array
            textHistory = Object.values(search_prompt);

            // remove duplicates from history
            if (!allowSearchHistoryDuplicates && textHistory.length > 1) {
              var textHistoryLenght = textHistory.length;
              var uniqueArray       = [...new Set(textHistory)];                // create a 'Set' from the history array to automatically remove duplicates

              textHistory = uniqueArray;
              if (textHistoryLenght > textHistory.length) {
                logger.debug('\n' + 'removed duplicates from history array: ' + (textHistoryLenght - textHistory.length) + ' element|s');
              }
            } // END if !allowHistoryDupicates

          } // END if searchHstoryEnabled

          _this.setState('finished');
          logger.debug('\n' + 'state: ' + _this.getState());
          logger.info('\n' + 'initializing module: finished');

          clearInterval(dependencies_met_j1_finished);
        } // END dependencies_met_j1_finished
      }, 10);

    }, // END init

    // -------------------------------------------------------------------------
    // eventHandler
    // -------------------------------------------------------------------------
    eventHandler: function () {
      const topSearchModalID      = '#' + 'searchModal';
      var data                    = [];
      var option                  = {};

      $(topSearchModalID).on('shown.bs.modal', () => {
        logger.debug('\n' + 'search modal shown');

        if (searchHstoryEnabled) {
          $searchHstoryWrapper    = document.getElementById(searchHistorySelectWrapper);
          searchHstoryWrapperID   = '#' + $searchHstoryWrapper.id;

          selectList              = document.getElementById('search_history');
          $slimSelect             = selectList.slim;

          // update|set slimSelect data elements
          textHistory.forEach(function(historyText) {
            option = {
              text: historyText,
              display: true,
              selected: false,
              disabled: false
            }
            data.push(option);
          }); // END forEach
          $slimSelect.setData(data);

          // display history container
          if (textHistory.length > 0) {
            logger.debug('\n' + 'show search history on id: ' + searchHstoryWrapperID);
            $(searchHstoryWrapperID).show();
          }
        }

      });

      // hide|clear results from top search
      $('#clear-topsearch').on('click', function() {
        $(this).addClass('d-none').prevAll(':input').val('');
        $('#search-results').hide();
        $('#search-results').html('');
      });

    }, // END eventHandler

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
