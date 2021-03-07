// -----------------------------------------------------------------------------
// ESLint shimming
// -----------------------------------------------------------------------------
/* eslint indent: "off"                                                       */
/* eslint no-undef: "off"                                                     */
// -----------------------------------------------------------------------------
'use strict';
module.exports = {
  put: put,
  clear: clear,
  get: get,
  search: search,
  setOptions: setOptions
};

var FuzzySearchStrategy = require('./SearchStrategies/FuzzySearchStrategy');
var LiteralSearchStrategy = require('./SearchStrategies/LiteralSearchStrategy');

var data = [];
var opt = {};
opt.fuzzy = false;
opt.limit = 10;

/* jadams, 2017-07-09: added additional options J1 Template
  ------------------------------------------------------------- */
opt.searchStrategy = opt.fuzzy ? FuzzySearchStrategy : LiteralSearchStrategy;
// jadams, 2017-07-09: Added minSearchItemLen as an option
opt.minSearchItemLen = 4;
// jadams, 2017-07-09: Added resultsOutput as an option
opt.resultsOutput = document.getElementById('jss-panel');

function put (data) {
  if (isObject(data)) {
    return addObject(data);
  }
  if (isArray(data)) {
    return addArray(data);
  }
  return undefined;
}
function clear () {
  data.length = 0;
  return data;
}

function get () {
  return data;
}

function isObject (obj) { return !!obj && Object.prototype.toString.call(obj) === '[object Object]'; }
function isArray (obj) { return !!obj && Object.prototype.toString.call(obj) === '[object Array]'; }

function addObject (_data) {
  data.push(_data);
  return data;
}

function addArray (_data) {
  var added = [];
  for (var i = 0; i < _data.length; i++) {
    if (isObject(_data[i])) {
      added.push(addObject(_data[i]));
    }
  }
  return added;
}

/* jadams, 2017-07-09: search function modified
  ------------------------------------------------------------- */
function search(crit) {
  var n = crit.length;

  // jadams: Added|Evaluate minSearchItemLen
  if (n < opt.minSearchItemLen) {
    return [];
  }
  if (!crit) {
    return [];
    //return
  }
  return findMatches(data, crit, opt.searchStrategy, opt);
}

/* jadams, 2017-07-09: added additional options J1 Template
  ------------------------------------------------------------- */
function setOptions(_opt) {
  opt = _opt || {};

  opt.fuzzy = _opt.fuzzy || false;
  opt.limit = _opt.limit || 10;
  // jadams: Added minSearchItemLen as an option
  opt.minSearchItemLen = _opt.minSearchItemLen || 3;
  opt.searchStrategy = _opt.fuzzy ? FuzzySearchStrategy : LiteralSearchStrategy;
  // jadams: Added show|hide for resultsOutput as an option
  opt.resultsOutput = _opt.resultsOutput || 'jss-panel';
}

/*
function setOptions (_opt) {
  opt = _opt || {}

  opt.fuzzy = _opt.fuzzy || false
  opt.limit = _opt.limit || 10
  opt.searchStrategy = _opt.fuzzy ? FuzzySearchStrategy : LiteralSearchStrategy
}
*/

function findMatches (data, crit, strategy, opt) {
  var matches = [];
  for (var i = 0; i < data.length && matches.length < opt.limit; i++) {
    var match = findMatchesInObject(data[i], crit, strategy, opt);
    if (match) {
      matches.push(match);
    }
  }
  return matches;
}

function findMatchesInObject (obj, crit, strategy, opt) {
  for (var key in obj) {
    if (!isExcluded(obj[key], opt.exclude) && strategy.matches(obj[key], crit)) {
      return obj;
    }
  }
}

function isExcluded (term, excludedTerms) {
  var excluded = false;
  excludedTerms = excludedTerms || [];
  for (var i = 0; i < excludedTerms.length; i++) {
    var excludedTerm = excludedTerms[i];
    if (!excluded && new RegExp(term).test(excludedTerm)) {
      excluded = true;
    }
  }
  return excluded;
}
