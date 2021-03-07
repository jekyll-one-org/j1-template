/*
 # -----------------------------------------------------------------------------
 # ~/jekyll_search/jekyll_search.js
 # Simple Jekyll Search v1.1.5 implementation for J1 template
 #
 # Product/Info:
 # https://jekyll.one
 # https://github.com/christian-fei/Simple-Jekyll-Search
 #
 # Copyright (C) 2021 Juergen Adams
 # Copyright (C) 2015 Christian Fei
 #
 # J1 Template is licensed under MIT License.
 # See: https://github.com/jekyll-one-org/J1 Template/blob/master/LICENSE
 # SimpleJekyllSearch is licensed under MIT License.
 # See: https://github.com/christian-fei/Simple-Jekyll-Search
 # -----------------------------------------------------------------------------
*/

// -----------------------------------------------------------------------------
// ESLint shimming
// -----------------------------------------------------------------------------
/* eslint no-unused-vars: "off"                                               */
/* eslint indent: "off"                                                       */
/* eslint no-undef: "off"                                                     */
// -----------------------------------------------------------------------------
'use strict'
/*!
 * Simple Jekyll Search
 * 2015 Christian Fei
 * Licensed under MIT License.
 */

;(function (window, document) {
  // Global variables
  var message = {};

  var options = {
    searchInput:          null,
    resultsContainer:     null,
    results_output:       null,
    json:                 [],
    searchResultTemplate: '<li><a href="{url}" title="{desc}">{title}</a></li>',
    templateMiddleware:   function () {},
    noResultsText:        'No results found',
    limit:                10,
    fuzzy:                false,
    exclude:              []
  };

  var requiredOptions   = ['searchInput', 'resultsContainer', 'results_output', 'json'];
  var templater         = require('./Templater');
  var repository        = require('./Repository');
  var jsonLoader        = require('./JSONLoader');
  var optionsValidator  = require('./OptionsValidator')({ required: requiredOptions });
  var utils             = require('./utils');
  var logger;
  var logText;

  /*
    Public API
  */
  window.SimpleJekyllSearch = function SimpleJekyllSearch (_options) {
    logger = log4javascript.getLogger('j1.core.j1_searcher');
    logger.info('start initialization');

    var errors = optionsValidator.validate(_options);
    if (errors.length > 0) {
      logger.error('missing required options: ' + requiredOptions);
      // throwError('You must specify the following required options: ' + requiredOptions);
    }

    options = utils.merge(options, _options);

    templater.setOptions({
      template: options.searchResultTemplate,
      results_output: options.results_output,
      middleware: options.templateMiddleware
    });

    repository.setOptions({
      fuzzy: options.fuzzy,
      limit: options.limit
    });

    if (utils.isJSON(options.json)) {
      initWithJSON(options.json);
    } else {
      initWithURL(options.json);
    }

    // message.type    = 'command';
    // message.action  = 'module_initialized';
    // message.text    = 'Module initialized successfully';
    //j1.sendMessage( 'Searcher', 'SimpleJekyllSearch', message );

    // logger.info('initialization finished successfully');

    return true;
  };

  // for backwards compatibility
  window.SimpleJekyllSearch.init = window.SimpleJekyllSearch;

  if (typeof window.SimpleJekyllSearchInit === 'function') {
    window.SimpleJekyllSearchInit.call(this, window.SimpleJekyllSearch);
  }

  function initWithJSON (json) {
    repository.put(json);
    registerInput();
  }

  function initWithURL (url) {
    jsonLoader.load(url, function (err, json) {
      if (err) {
        logger.error('failed to get data at: ' + url);
        // throwError('failed to get JSON (' + url + ')');
      }
      initWithJSON(json);
    });
  }

  function emptyResultsContainer () {
    options.resultsContainer.innerHTML = '';
  }

  function appendToResultsContainer (text) {
    options.resultsContainer.innerHTML += text;
  }

  function registerInput () {
    options.searchInput.addEventListener('keyup', function (e) {
      var key = e.which;
      if (isWhitelistedKey(key)) {
        emptyResultsContainer();
        var query = e.target.value;
        if (isValidQuery(query)) {
          render(repository.search(query));
          // highlight the query (word) in description text
          // see: https://stackoverflow.com/questions/17232820/change-the-color-of-a-text-in-div-using-jquery-contains
          // see: https://stackoverflow.com/questions/187537/is-there-a-case-insensitive-jquery-contains-selector
          $('.result-group-item-text:contains(' +query+ ')').each(function () {
            var regex = new RegExp(query,'gi');
            $(this).html($(this).text().replace(regex, '<code style="color: red !important; font-weight: 700;font-size: 125% !important">' +query+ '</code>'));
          });
          // highlight the query (word) in (documents) tagline
          $('h6.result-item:contains(' +query+ ')').each(function () {
            var regex = new RegExp(query,'gi');
            $(this).html($(this).html().replace(regex, '&nbsp;<code style="color: red !important; font-weight: 700;font-size: 135% !important">' +query+ '</code>&nbsp;'));
          });
        }
      }
    });
  }

   /* jadams, 2017-07-09: added resultsOutput for J1 Searcher
      -------------------------------------------------------------------------- */
  function render (results) {
    if (results.length === 0) {
      var resultsOutput = document.getElementById(options.results_output);
      resultsOutput.style.display = 'none'; // to hide
      return appendToResultsContainer(options.noResultsText);
    }
    for (var i = 0; i < results.length; i++) {
      appendToResultsContainer(templater.compile(results[i]));
    }
  }

  function isValidQuery (query) {
    return query && query.length > 0;
  }

  function isWhitelistedKey (key) {
    return [13, 16, 20, 37, 38, 39, 40, 91].indexOf(key) === -1;
  }

  function throwError (message) {
    throw new Error('SimpleJekyllSearch --- ' + message);
  }

})(window, document);
