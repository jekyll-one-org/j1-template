---
regenerate:                             true
---

{%- capture cache -%}

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
{% assign template_config        = site.data.j1_config %}
{% assign blocks                 = site.data.blocks %}
{% assign modules                = site.data.modules %}

{% comment %} Set config data
-------------------------------------------------------------------------------- {% endcomment %}
{% assign environment            = site.environment %}
{% assign template_version       = site.version %}

{% assign lunr_search_defaults   = modules.defaults.lunr.defaults %}
{% assign lunr_search_settings   = modules.lunr.settings %}

{% comment %} Set config options
-------------------------------------------------------------------------------- {% endcomment %}
{% assign lunr_search_options    = lunr_search_defaults | merge: lunr_search_settings %}
{% assign topsearch_options      = lunr_search_options.topsearch %}
{% assign search_history_enabled = topsearch_options.search_history_enabled %}

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
"use strict";
j1.adapter.lunr = ((j1, window) => {

  {% comment %} Set global variables
  ------------------------------------------------------------------------------ {% endcomment %}
  var searchHistorySelectWrapper = 'search_history_select_wrapper';

  var searchDefaults;
  var searchSettings;
  var searchOptions;
  var topSearchOptions;
  var select;
  var $slimSelect;
  var newItem;
  var itemExists;

  var url;
  var baseUrl;
  var hostname;
  var auto_domain;
  var secure;

  var cookie_names;
  var cookie_written;

  var _this;
  var logger;
  var logText;
  var state;

  var textHistory       = []; // Array to store the history of entered text
  var historyIndex      = -1; // Index to keep track of the current position in the history
  var searchHistory     = {};
  var queryInput;

  var $searchHstoryWrapper;
  var searchHstoryWrapperID;
  var searchHistoryMax;
  var searchHistoryEnabled;
  var allowSearchHistoryDuplicates;
  var allowSearchHistoryUpdatesOnMax;
  var searchHistoryFromCookie;

  var eventListenersReady;

  // date|time
  var startTime;
  var endTime;
  var startTimeModule;
  var endTimeModule;
  var timeSeconds;

  // ---------------------------------------------------------------------------
  // helper functions
  // ---------------------------------------------------------------------------

  function addSearchHistoryEventListeners(slimSelectData) {
    var index = 1;
    slimSelectData.forEach (() => {
      var span        = 'opt_search_history_' + index;
      var spanElement = document.getElementById(span);

      var dependencies_met_span_ready = setInterval (() => {
        var spanElementReady = (($(spanElement).length) !== 0) ? true : false;
        if (spanElementReady) {
          logger.debug('\n' + 'add eventListener to: ' + span);
          spanElement.addEventListener('click', spanElementEventListener);

          clearInterval(dependencies_met_span_ready);
        }
      }, 10);
      index++;
    }); // END forEach data
  } // END addSearchHistoryEventListeners

  function spanElementEventListener(event) {
    var optionText    = event.currentTarget.nextSibling.data;
    var slimData      = $slimSelect.getData();
    var textHistory   = [];
    var searchHistory = j1.existsCookie(cookie_names.search_prompt)
      ? j1.readCookie(cookie_names.search_prompt)
      : {};
    var foundItem;
    var newHistory;
    var newData;

    // suppress default actions|bubble up
    event.preventDefault();
    event.stopPropagation();

    // update slimSelect data
    foundItem = -1;
    for (var i = 0; i < slimData.length; i++) {
      if (slimData[i].text === optionText) {
        foundItem = i;
        break;
      }
    }

    if (foundItem !== -1) {
      delete slimData[foundItem];

      // create new reindexed data object
      newData = Object.values(slimData);
      // update the select
      $slimSelect.setData(newData);
    }

    // update search history data
    foundItem = -1;
    // convert searchHistory object to array
    textHistory = Object.values(searchHistory);
    for (var i = 0; i < textHistory.length; i++) {
      if (textHistory[i] === optionText) {
        foundItem = i;
        break;
      }
    }

    if (foundItem !== -1) {
      delete textHistory[foundItem];

      // create new reindexed data object
      newHistory = Object.values(textHistory);

      // remove duplicates from history
      if (newHistory.length > 1) {
        // create a 'Set' from the history array to automatically remove duplicates
        var uniqueArray = [...new Set(newHistory)];
        newHistory      = Object.values(uniqueArray);
      } // END if allowHistoryDupicates

      // update searchHistory
      if (searchHistoryFromCookie) {
        logger.debug('\n' + 'save search history to cookie');

        // remove BEFORE write
        j1.removeCookie({ name: cookie_names.search_prompt });

        if (newHistory.length > 0) {
          cookie_written = j1.writeCookie({
            name:   cookie_names.search_prompt,
            data:   newHistory,
            secure: secure
          });
        } else {
          cookie_written = j1.writeCookie({
            name:   cookie_names.search_prompt,
            data:   {},
            secure: secure
          });
          logger.info('\n' + 'spanElementEventListener, hide prompt history on last element');
          $("#search_history_select_wrapper").hide();
        } // END if length
      } // END if searchHistoryFromCookie
    }

    logger.info('\n' + 'spanElementEventListener, option deleted:\n' + optionText);

    // close currently required to re-add history prompt events on next beforeOpen
    $slimSelect.close();
  } // END  spanElementEventListener

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
      cookie_names            = j1.getCookieNames();
      url                     = new liteURL(window.location.href);
      baseUrl                 = url.origin;
      hostname                = url.hostname;
      auto_domain             = hostname.substring(hostname.lastIndexOf('.', hostname.lastIndexOf('.') - 1) + 1);
      secure                  = (url.protocol.includes('https')) ? true : false;
      searchHistoryEnabled    = (topSearchOptions.search_history_enabled === true) ? true : false;
      searchHistoryFromCookie = (topSearchOptions.search_history_from_cookie === true) ? true : false;

      {% if search_history_enabled %}
      // -----------------------------------------------------------------------
      // select initializer
      // -----------------------------------------------------------------------
      var dependencies_met_select_ready = setInterval(() => {
        var slimSelectFinished = (Object.keys(j1.adapter.slimSelect.select).length) ? true : false;

        if (slimSelectFinished) {
          logger.debug('\n' + 'initializing select data');

          // initialize history array from cookie
          if (searchHistoryEnabled && searchHistoryFromCookie) {

            select      = document.getElementById('search_history');
            $slimSelect = select.slim;

            // limit the prompt history
            searchHistoryMax               = topSearchOptions.search_history_max;

            // allow|reject history updates if promptHistoryMax reached
            allowSearchHistoryUpdatesOnMax = topSearchOptions.allow_history_updates_on_max;

            logger.debug('\n' + 'read search history from cookie');
            var data    = [];
            var option  = {};
            searchHistory = j1.existsCookie(cookie_names.search_prompt)
              ? j1.readCookie(cookie_names.search_prompt)
              : {};

            // convert searchHistory object to array
            textHistory = Object.values(searchHistory);

            // remove duplicates from history
            if (textHistory.length > 1) {
              var textHistoryLenght = textHistory.length;
              var uniqueArray       = [...new Set(textHistory)];                // create a 'Set' from the history array to automatically remove duplicates

              textHistory = uniqueArray;
              if (textHistoryLenght > textHistory.length) {
                logger.debug('\n' + 'removed duplicates from history array: ' + (textHistoryLenght - textHistory.length) + ' element|s');
              }
            } // END if !allowHistoryDupicates

            // update|set slimSelect data elements
            var index   = 1;
            var data    = [];
            var option  = {};
            var html;
            textHistory.forEach((historyText) => {
              html   = '<span id="opt_' + topSearchOptions.search_history_id + '_' + index + '" class="ss-option-delete">' + '<i class="mdib mdib-close mdib-16px ml-1 mr-2"></i></span>' + historyText;
              option = {
                text:     historyText,
                html:     html,
                display:  true,
                selected: false,
                disabled: false
              }
              data.push(option);
              index++
            }); // END forEach
            $slimSelect.setData(data);

            // -------------------------------------------------------------
            // setup Slim select eventHandlers
            // -------------------------------------------------------------
            //
            _this.setupSlimSelectEventHandlers();

          } // if promptHistoryEnabled

          clearInterval(dependencies_met_select_ready);
        } // END selectReady
      }, 10); // END dependencies_met_select_ready
      {% endif %}

      // -----------------------------------------------------------------------
      // module initializer
      // -----------------------------------------------------------------------
      var dependencies_met_lunr_finished = setInterval (() => {
        var j1CoreFinished     = (j1.getState() === 'finished') ? true : false;
//      var slimSelectFinished = (Object.keys(j1.adapter.slimSelect.select).length) ? true : false;

        if (j1CoreFinished) {
          startTimeModule   = Date.now();

          // get|clear queryInput element (prompt)
          queryInput        = document.getElementById('search-query');
          queryInput.value  = '';

          // initialize state flag
          _this.setState('started');
          logger.debug('\n' + 'set module state to: ' + _this.getState());
          logger.info('\n' + 'initializing module: started');

          logger.info('\n' + 'initializing search engine');
          $(searchOptions.search_input).lunrSearch({
            index_file:     searchOptions.index_file,
            results:        searchOptions.results,
            template:       searchOptions.template,
            titleMsg:       searchOptions.titleMsg,
            emptyMsg:       searchOptions.emptyMsg,
            {% if search_history_enabled %}
            onResultShown:  function () {
              $('#send-to-history').show();
            }
            {% endif %}
          });

          logger.info('\n' + 'initializing UI event handlers (modal)');
          _this.uiEventHandler();

          {% if search_history_enabled %}
          // initialize history array from cookie
          if (searchHistoryEnabled && searchHistoryFromCookie) {

            logger.info('\n' + 'initializing search history from cookie');

            // limit the history
            searchHistoryMax                = topSearchOptions.search_history_max;

            // allow|reject duplicates for the history
            allowSearchHistoryDuplicates    = topSearchOptions.allow_history_duplicates;

            // allow|reject history updates if searchHistoryMax reached
            allowSearchHistoryUpdatesOnMax  = topSearchOptions.allow_history_updates_on_max;

            logger.debug('\n' + 'read search history from cookie');
            var data      = [];
            var option    = {};
            searchHistory = j1.existsCookie(cookie_names.search_prompt)
              ? j1.readCookie(cookie_names.search_prompt)
              : {};

            // convert search prompt object to array
            textHistory = Object.values(searchHistory);

            // hide|show history container
            if (textHistory.length) {
              $("#search_history_select_wrapper").show();
            } else {
              $("#search_history_select_wrapper").hide();
            }

            // remove duplicates from history
            if (!allowSearchHistoryDuplicates && textHistory.length > 1) {
              var textHistoryLenght = textHistory.length;
              var uniqueArray       = [...new Set(textHistory)];                // create a 'Set' from the history array to automatically remove duplicates

              textHistory = uniqueArray;
              if (textHistoryLenght > textHistory.length) {
                logger.debug('\n' + 'removed duplicates from history array: ' + (textHistoryLenght - textHistory.length) + ' element|s');
              }
            } // END if !allowHistoryDupicates
          } // END if searchHistoryEnabled
          {% endif %}

          _this.setState('finished');
          logger.debug('\n' + 'state: ' + _this.getState());
          logger.info('\n' + 'initializing module: finished');

          endTimeModule = Date.now();
          logger.info('\n' + 'module initializing time: ' + (endTimeModule-startTimeModule) + 'ms');

          clearInterval(dependencies_met_lunr_finished);
        } // END j1CoreFinished && slimSelectFinished
      }, 10); // END dependencies_met_lunr_finished
    }, // END init

    // -------------------------------------------------------------------------
    // uiEventHandler (topSearchModal)
    // -------------------------------------------------------------------------
    uiEventHandler: () => {
      const topSearchModalID = '#' + 'searchModal';
      const searchIput       = document.querySelector('input');
      var data               = [];
      var option             = {};

      // input event
      searchIput.addEventListener("input", (event) => {
        var prompt                = event.target.value;
        var clearTopSearchState   = $('#clear-topsearch').css("display");
        var clearTopSearchHidden  = (clearTopSearchState === 'block') ? false : true;

        if (prompt.length >= 3) {
          if (clearTopSearchHidden) {
            $('#clear-topsearch').show();
          }
        } // END if prompt min length reached
      });

      // on modal 'shown'
      $(topSearchModalID).on('shown.bs.modal', (e) => {
        logger.debug('\n' + 'search modal shown');

        {% if search_history_enabled %}
        if (searchHistoryEnabled) {
          $searchHstoryWrapper  = document.getElementById(searchHistorySelectWrapper);
          searchHstoryWrapperID = '#' + $searchHstoryWrapper.id;
          select                = document.getElementById('search_history');
          $slimSelect           = select.slim;

          var searchHistory = j1.existsCookie(cookie_names.search_prompt)
            ? j1.readCookie(cookie_names.search_prompt)
            : {};

          // set textHistory array
          textHistory = Object.values(searchHistory);

          // create|set current slimSelect data elements
          var index   = 1;
          var data    = [];
          var option  = {};
          var html;
          textHistory.forEach ((historyText) => {
            html    = '<span id="opt_' + topSearchOptions.search_history_id + '_' + index + '" class="ss-option-delete">' + '<i class="mdib mdib-close mdib-16px ml-1 mr-2"></i></span>' + historyText;
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
        } // END if searchHistoryEnabled
        {% endif %}
      }); // END on shown modal

      {% if search_history_enabled %}
      // on modal 'hidden'
      $(topSearchModalID).on('hidden.bs.modal', (e) => {
        logger.debug('\n' + 'search modal hidden');

        if (searchHistoryEnabled) {
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
        } // end if searchHistoryEnabled
      }); // END on hidden modal
      {% endif %}

      {% if search_history_enabled %}
      // add current search query to history
      $('#send-to-history').on('click', () => {
        // suppress default actions|bubble up
        event.preventDefault();
        event.stopPropagation();

        var currentQuery = $('#search-query').val();
        var historySet   = false;

        if (searchHistoryFromCookie) {
          var searchHistory = j1.existsCookie(cookie_names.search_prompt)
            ? j1.readCookie(cookie_names.search_prompt)
            : {};

          // set textHistory array
          textHistory = Object.values(searchHistory);
        } // END re-read current history from cookie

        // set initial prompt from input (input)
        prompt = queryInput.value.replace(/\s+$/g, '');

        // check if current prompt alreay exists in history
        index = textHistory.indexOf(prompt);
        itemExists  = (index !== -1) ? true : false;
        if (itemExists) {
          logText = '\n' + `sendButton, prompt: "${prompt}"\n` + `already exists in history at index: ${index}`;
          logger.debug(logText);
        }

        // update history on searchHistoryMax
        if (textHistory.length === searchHistoryMax && allowSearchHistoryUpdatesOnMax && !itemExists && !historySet) {
          // place the CURRENT history element FIRST for replacement
          textHistory.reverse();
          if (queryInput.value.length > 0) {
            // cleanup input value for trailing whitespaces
            newItem = queryInput.value.replace(/\s+$/g, '');
          }

          logger.debug('\n' + 'sendButton, update item in history:\n' + textHistory[0]);
          // replace FIRST history element by NEW item
          textHistory[0] = newItem;
          logger.debug('\n' + 'sendButton, add new item to history:\n' + textHistory[0]);

          historySet = true;
        } // END update history on searchHistoryMax

        // add new item to history
        if (textHistory.length < searchHistoryMax && !itemExists && !historySet) {
          if (queryInput.value.length > 0) {
            // cleanup input value for trailing whitespaces
            newItem = queryInput.value.replace(/\s+$/g, '');
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
            if (elm.length) {
              prompt = elm.replace(/\s+$/g, '');
              textHistory[p] = prompt;
            }
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
          html    = '<span id="opt_' + topSearchOptions.search_history_id + '_' + index + '" class="ss-option-delete">' + '<i class="mdib mdib-close mdib-16px ml-1 mr-2"></i></span>' + historyText;
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
          $("#search_history_select_wrapper").show();
        }

        // write current history to cookie
        if (searchHistoryFromCookie) {
          logger.debug('\n' + 'sendButton, save prompt history to cookie');

          // remove BEFORE write
          j1.removeCookie({ name: cookie_names.search_prompt });
          cookie_written = j1.writeCookie({
            name:   cookie_names.search_prompt,
            data:   textHistory,
            secure: secure
          });
        } // END write current history to cookie
      }); // END on click
      {% endif %}

      // clear|hide input|search results
      $('#clear-topsearch').on('click', () => {
        // suppress default actions|bubble up
        event.preventDefault();
        event.stopPropagation();

        $('#search-query').val('');
        $('#search-results').html('');
        $('#search-results').hide();
        $('#send-to-history').hide();
        $('#clear-topsearch').hide();
      }); // END on click
    }, // END uiEventHandler (topSearchModal)

    {% if search_history_enabled %}
    // -------------------------------------------------------------------------
    // setupSlimSelectEventHandlers()
    // set all used select events
    // see: https://slimselectjs.com/
    // -------------------------------------------------------------------------
    setupSlimSelectEventHandlers: () => {
      var select      = document.getElementById('search_history');
      var $slimSelect = select.slim;
      var slimValues;
      var data;
      var prompt;

      $slimSelect.events.beforeOpen = (e) => {
        // get all options
        const slimValues   = $slimSelect.getData();
        eventListenersReady = false;

        logger.debug('\n' + 'slimSelect.beforeOpen, processing: started');

        // re-read searchHistory from cookie for initial values
        if (searchHistoryFromCookie) {
          var searchHistory = j1.existsCookie(cookie_names.search_prompt)
            ? j1.readCookie(cookie_names.search_prompt)
            : {};

          // set textHistory array
          textHistory = Object.values(searchHistory);

          // create|set slimSelect data elements
          var index   = 1;
          var data    = [];
          var option  = {};
          var html;
          textHistory.forEach ((historyText) => {
            html    = '<span id="opt_' + topSearchOptions.search_history_id + '_' + index + '" class="ss-option-delete">' + '<i class="mdib mdib-close mdib-16px ml-1 mr-2"></i></span>' + historyText;
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

        } // END re-read current history from cookie

        // set searchHistory EventListeners (for option deletion)
        if (slimValues.length) {
          logger.debug('\n' + 'slimSelect.beforeOpen, number of eventListeners to process: #' + slimValues.length);
          addSearchHistoryEventListeners(slimValues);
        }

        // wait until searchHistory eventListener|s is|are placed
        var listenerIndex = 1;
        slimValues.forEach( () => {
          var span             = 'opt_prompt_history_' + listenerIndex;
          var spanElement      = document.getElementById(span);
          var dependencies_met_listeners_ready = setInterval (() => {
            var spanElementReady = (($(spanElement).length) !== 0) ? true : false;
            if (spanElementReady) {
              if (listenerIndex === slimValues.length) {
                eventListenersReady = true;
                logger.debug('\n' + 'slimSelect.beforeOpen, all eventListeners ready');
              } // END if listenerIndex
            } // END if spanElementReady
            if (!eventListenersReady) {
              listenerIndex++;
            } else {
              clearInterval(dependencies_met_listeners_ready);
            }
          }, 10);
        }); // END forEach data

        var dependencies_beforeOpen_met_ready = setInterval (() => {
          if (eventListenersReady) {
            logger.debug('\n' + 'slimSelect.beforeOpen, processing: finished');

            clearInterval(dependencies_beforeOpen_met_ready);
          }
        }, 10);
      } // END event beforeOpen

      $slimSelect.events.afterClose = (e) => {
        // get selected value (NOTE: one||no selection possible)
        const slimValue = $slimSelect.getSelected();

        // set prompt on selection
        if (slimValue.length) {
          prompt = slimValue[0];
          document.getElementById('search-query').value = prompt;
          $('#clear-topsearch').show();

          logger.debug('\n' + 'slimSelect.afterClose, selection from history: ' + prompt);
        } else {
          document.getElementById('search-query').value = '';
          $('#search-results').html('');
          $('#search-results').hide();
          $('#send-to-history').hide();
          $('#clear-topsearch').hide();

          logger.debug('\n' + 'slimSelect.afterClose, selection from history: empty');
        }

        // remove selection from select
        $slimSelect.setSelected('', false);
      } // END event afterClose

    }, // END setupSlimSelectEventHandlers()
    {% endif %}

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
