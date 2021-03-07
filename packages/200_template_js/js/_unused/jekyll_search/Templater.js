// -----------------------------------------------------------------------------
// ESLint shimming
// -----------------------------------------------------------------------------
/* eslint indent: "off"                                                       */
/* eslint no-undef: "off"                                                     */
// -----------------------------------------------------------------------------
'use strict';
module.exports = {
  compile: compile,

  setOptions: setOptions
};

var options = {};
options.pattern = /\{(.*?)\}/g;
options.template = '';
options.middleware = function () {};

// jadams, 2020-07-11: added resultsOutput option
function setOptions (_options) {
  options.pattern = _options.pattern || options.pattern;
  options.template = _options.template || options.template;
  options.results_output = _options.results_output;
  if (typeof _options.middleware === 'function') {
    options.middleware = _options.middleware;
  }
}

/* jadams, 2017-07-09: Added resultsOutput for J1 Searcher
  ------------------------------------------------------------- */
function compile(data) {
  var tags;

  return options.template.replace(options.pattern, function(match, prop) {
    var value = options.middleware(prop, data[prop], options.template);
    var resultsOutput = document.getElementById(options.results_output);
    resultsOutput.style.display = 'none'; // to hide
    if (value !== undefined) {
      return value;
    }
    // jadams: show the results container
    resultsOutput.style.display = 'block';
    // jadams: beautify tags string for results output
    if ( prop == 'tags' ) {
      tags = data[prop].replace(/\s+/g, '');
      data[prop] = tags.replace(/,/g, ' · ');
    }
    return data[prop] || match;
  });
}

/*
function compile (data) {
  return options.template.replace(options.pattern, function (match, prop) {
    var value = options.middleware(prop, data[prop], options.template)
    if (value !== undefined) {
      return value
    }
    return data[prop] || match
  })
}
*/
