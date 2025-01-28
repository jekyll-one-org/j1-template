---
regenerate:                             true
---

{% capture cache %}

{% comment %}
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/adapter/js/lunr.js
 # Liquid template to adapt Lunr for J1 Theme
 #
 # Product/Info:
 # https://jekyll.one
 # Copyright (C) 2023-2025 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # For details, see: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
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
{% assign lunr_search_options   = lunr_search_defaults | merge: lunr_search_settings %}
{% assign topsearch_options     = lunr_search_options.topsearch %}

{% comment %} Detect prod mode
-------------------------------------------------------------------------------- {% endcomment %}
{% assign production = false %}
{% if environment == 'prod' or environment == 'production' %}
  {% assign production = true %}
{% endif %}

/*
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/adapter/js/lunr.js
 # J1 Adapter for J1 Lunr
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2023-2025 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # For details, see: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
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
j1.adapter.lunr = ((j1, window) => {

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

  var textHistory       = []; // Array to store the history of entered text
  var historyIndex      = -1; // Index to keep track of the current position in the history
  var search_prompt     = {};
  var queryInput;

  var $searchHstoryWrapper;
  var searchHstoryWrapperID;
  var searchHistoryMax;
  var searchHstoryEnabled;
  var allowSearchHistoryDuplicates;
  var allowSearchHistoryUpdatesOnMax;
  var searchHstoryFromCookie;

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
      // module initializer
      // -----------------------------------------------------------------------
      var dependencies_met_lunr_finished = setInterval (() => {
        var j1CoreFinished = (j1.getState() === 'finished') ? true : false;

        if (j1CoreFinished) {
          startTimeModule        = Date.now();
          searchHstoryFromCookie = (topSearchOptions.prompt_history_from_cookie === true) ? true : false;

          // get|clear queryInput element (prompt)
          queryInput        = document.getElementById('search-query');
          queryInput.value  = '';

          // initialize state flag
          _this.setState('started');
          logger.debug('\n' + 'set module state to: ' + _this.getState());
          logger.info('\n' + 'initializing module: started');

          logger.info('\n' + 'initializing search engine');
          $(searchOptions.search_input).lunrSearch({
            index_file: searchOptions.index_file,
            results:    searchOptions.results,
            template:   searchOptions.template,
            titleMsg:   searchOptions.titleMsg,
            emptyMsg:   searchOptions.emptyMsg
          });

          logger.info('\n' + 'initializing event handlers (search history)');
          _this.eventHandler();

          // initialize history array from cookie
          if (searchHstoryEnabled && searchHstoryFromCookie) {

            logger.info('\n' + 'initializing search history from cookie');

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
            textHistory = Object.values();

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

          endTimeModule = Date.now();
          logger.info('\n' + 'module initializing time: ' + (endTimeModule-startTimeModule) + 'ms');

          clearInterval(dependencies_met_lunr_finished);
        } // END j1CoreFinished
      }, 10); // END dependencies_met_lunr_finished
    }, // END init

    // -------------------------------------------------------------------------
    // eventHandler (topSearchModal)
    // -------------------------------------------------------------------------
    eventHandler: () => {
      const topSearchModalID = '#' + 'searchModal';
      var data               = [];
      var option             = {};

      $(topSearchModalID).on('shown.bs.modal', (e) => {
        logger.debug('\n' + 'search modal shown');

        if (searchHstoryEnabled) {
          $searchHstoryWrapper  = document.getElementById(searchHistorySelectWrapper);
          searchHstoryWrapperID = '#' + $searchHstoryWrapper.id;
          selectList            = document.getElementById('search_history');
          $slimSelect           = selectList.slim;

          var searchHistory = j1.existsCookie(cookie_names.)
            ? j1.readCookie(cookie_names.)
            : {};

          // set textHistory array
          textHistory = Object.values(searchHistory);

          // create|set current slimSelect data elements
          var index   = 1;
          var data    = [];
          var option  = {};
          var html;
          textHistory.forEach ((historyText) => {
            html    = '<span id="opt_' + geminiOptions.prompt_history_id + '_' + index + '" class="ss-option-delete">' + '<i class="mdib mdib-close mdib-16px ml-1 mr-2"></i></span>' + historyText;
            option  = {
              text:     historyText,
              html:     html,
              display:  true,
              selected: false,
              disabled: false
            }
            data.push(option);
            index++;
          }); // END forEach
          $slimSelect.setData(data);

          // display history container
          if (textHistory.length > 0) {
            logger.debug('\n' + 'show search history on id: ' + searchHstoryWrapperID);
            $(searchHstoryWrapperID).show();
          }
        } // END if searchHstoryEnabled
      }); // END on shown modal

      // on modal 'hidden' add search query to history
      $(topSearchModalID).on('hidden.bs.modal', (e) => {
        logger.debug('\n' + 'search modal hidden');
        if (searchHstoryEnabled) {
          var currentSearchQuery = $('#search-query').val();
          option = {
            text:     currentSearchQuery,
            display:  true,
            selected: false,
            disabled: false
          }
          data.push(option);
          $slimSelect.setData(data);
          // add current currentSearchQuery to history
        } // end if searchHstoryEnabled
      }); // END on hidden modal

      // add current search query to history
      $('#send-to-history').on('click', () => {
        var currentQuery = $('#search-query').val();





        if (searchHstoryFromCookie) {
          var searchHistory = j1.existsCookie(cookie_names.)
            ? j1.readCookie(cookie_names.search_prompt)
            : {};

          // set textHistory array
          textHistory = Object.values(searchHistory);
        } // END re-read current history from cookie

        // set initial prompt from input (input)
          prompt = queryInput.value.replace(/\s+$/g, '');
        }

        // check if current prompt alreay exists in history
        index = textHistory.indexOf(prompt);
        itemExists  = (index !== -1) ? true : false;
        if (itemExists) {
          logText = '\n' + `sendButton, prompt: "${prompt}"\n` + `already exists in history at index: ${index}`;
          logger.debug(logText);
        }

        // update history on promptHistoryMax
        if (textHistory.length === promptHistoryMax && allowPromptHistoryUpdatesOnMax && !itemExists && !historySet) {
          // place the CURRENT history element FIRST for replacement
          textHistory.reverse();
          if (queryInput.value.length > 0) {
            // cleanup input value for trailing whitespaces
            newItem = queryInput.value.replace(/\s+$/g, '');
          } else if (queryInput.value.length === 0) {
            // use default prompt
            newItem = defaultPrompt.replace(/\s+$/g, '');
            logger.debug('\n' + 'sendButton, use default prompt:\n' + newItem);
          }

          logger.debug('\n' + 'sendButton, update item in history:\n' + textHistory[0]);
          // replace FIRST history element by NEW item
          textHistory[0] = newItem;
          logger.debug('\n' + 'sendButton, add new item to history:\n' + textHistory[0]);

          historySet = true;
        } // END update history on promptHistoryMax

        // add new item to history
        if (textHistory.length < promptHistoryMax && !itemExists && !historySet) {
          if (queryInput.value.length > 0) {
            // cleanup input value for trailing whitespaces
            newItem = queryInput.value.replace(/\s+$/g, '');
          } else if (queryInput.value.length === 0) {
            // use default prompt
            newItem = defaultPrompt.replace(/\s+$/g, '');
            logger.debug('\n' + 'sendButton, use default prompt:\n' + newItem);
          }
          logger.debug('\n' + 'sendButton, add new item to history:\n' + newItem);
          textHistory.push(newItem);

          historySet = true;
        } // END add new item to history

        // failsafe, cleanup history
        if (textHistory.length > 0) {
          // cleanup|add selected value
          var p = 0;
          textHistory.forEach ((elm) => {
            prompt = elm.replace(/\s+$/g, '');
            textHistory[p] = prompt;
            p++;
          }); // END forEach
          logger.debug('\n' + 'sendButton, cleaned history for trailing whitespaces');
        } // END failsafe, cleanup history

        // remove duplicates from history
        if (textHistory.length > 1) {
          var textHistoryLenght = textHistory.length;
          var uniqueArray       = [...new Set(textHistory)];              // create a 'Set' from the history array to automatically remove duplicates

          textHistory = uniqueArray;
          if (textHistoryLenght > textHistory.length) {
            logger.debug('\n' + 'sendButton, removed duplicates from history array: ' + (textHistoryLenght - textHistory.length) + ' element|s');
          }
        } // END remove duplicates from history

        // create|set slimSelect data elements
        var index   = 1;
        var data    = [];
        var option  = {};
        var html;
        textHistory.forEach ((historyText) => {
          html    = '<span id="opt_' + geminiOptions.prompt_history_id + '_' + index + '" class="ss-option-delete">' + '<i class="mdib mdib-close mdib-16px ml-1 mr-2"></i></span>' + historyText;
          option  = {
            text:     historyText,
            html:     html,
            display:  true,
            selected: false,
            disabled: false
          }
          data.push(option);
          index++;
        }); // END forEach
        $slimSelect.setData(data);
        // END create|set slimSelect data elements

        // display history container
        if (textHistory.length > 0) {
          $("#prompt_history_container").show();
        }

        // write current history to cookie
        if (promptHistoryFromCookie) {
          logger.debug('\n' + 'sendButton, save prompt history to cookie');
          j1.removeCookie({
            name:   cookie_names.chat_prompt,
            domain: auto_domain,
            secure: secure
          });
          cookie_written = j1.writeCookie({
            name:   cookie_names.chat_prompt,
            data:   textHistory,
            secure: secure
          });
        } // END write current history to cookie
      } // END if promptHstoryEnabled









      }); // END on click

      // clear|hide input|search results
      $('#clear-topsearch').on('click', () => {
        $('#search-query').val('');
        $('#search-results').html('');
        $('#search-results').hide();
      }); // END on click

    }, // END eventHandler (topSearchModal)

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

{% endcapture %}
{% if production %}
  {{ cache | minifyJS }}
{% else %}
  {{ cache | strip_empty_lines }}
{% endif %}
{% assign cache = nil %}
