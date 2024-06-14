/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 1922:
/***/ ((module) => {

"use strict";
/*
 # -----------------------------------------------------------------------------
 #  ~/js/adapter/adapter.js
 #  Provides an empty object for later loaded adapter objects
 #
 #  Product/Info:
 #  https://jekyll.one
 #
 #  Copyright (C) 2023, 2024 Juergen Adams
 #
 #  J1 Theme is licensed under MIT License.
 #  See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 # -----------------------------------------------------------------------------
*/

// -----------------------------------------------------------------------------
// ESLint shimming
// -----------------------------------------------------------------------------
/* eslint indent: "off"                                                       */
/* eslint no-unused-vars: "off"                                               */
/* eslint no-undef: "off"                                                     */
// -----------------------------------------------------------------------------



module.exports = function (j1, window) {
  return {
    // -------------------------------------------------------------------------
    // _init_
    // Global initializer for the adapter object
    // -------------------------------------------------------------------------
    _init_: function () {
      return;
    } // END _init_
  }; // END return
}(j1, window);

/***/ }),

/***/ 7784:
/***/ (() => {

/*
 # -----------------------------------------------------------------------------
 # ~/200_theme_js/js/adoc_result_viewer/view_results.js
 # Provides JavaScript functions displaying results for Asciidoctor
 # example block
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2023, 2024 Juergen Adams
 #
 # J1 Theme is licensed under MIT License.
 # See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 # -----------------------------------------------------------------------------
 # TODO: Improve lanuage settings
 # TODO: Improve auto-hide functionality for the results block
 # -----------------------------------------------------------------------------
*/

// -----------------------------------------------------------------------------
// ESLint shimming
// -----------------------------------------------------------------------------
/* eslint indent: "off"                                                       */
/* global $                                                                   */
// -----------------------------------------------------------------------------

var timeoutHandle;
// var language = 'de';
var language = document.documentElement.lang;
function toggle_result_block(result_block) {
  window.clearTimeout(timeoutHandle); // Clear the timeout object
  result_block.prev().toggleClass('stacked');
  result_block.toggle();

  // jadams: Improve auto-hide functionality for the results block
  //
  // timeoutHandle = window.setTimeout(function () {
  //   result_block.hide();
  // }, 5000);
}
function insert_result_links() {
  $('.result').each(function (idx, node) {
    var view_result_link;
    var result_block = $(node);
    var title_div = result_block.prev().find('.title');
    if (language == 'en') {
      view_result_link = $('<div class="j1-viewer"><span class="btn-viewer" data-bs-toggle="tooltip" data-bs-placement="left" title="toggle results" data-bs-original-title="toggle results">View</span></div>');
    } else if (language == 'de') {
      view_result_link = $('<div class="j1-viewer"><span class="btn-viewer" data-bs-toggle="tooltip" data-bs-placement="left" title="Anzeige umschalten" data-bs-original-title="toggle results">Anzeige</span></div>');
    } else {
      view_result_link = $('<div class="j1-viewer"><span class="btn-viewer" data-bs-toggle="tooltip" data-bs-placement="left" title="toggle results" data-bs-original-title="toggle results">View</span></div>');
    }
    title_div.append(view_result_link);
    $('.btn-viewer').tooltip();
    view_result_link.on('click', function (event) {
      event.preventDefault();
      toggle_result_block(result_block);
    });
  });
}
$(insert_result_links);

/***/ }),

/***/ 258:
/***/ ((module) => {

"use strict";
/*
 # -----------------------------------------------------------------------------
 # ~/200_theme_js/js/anime/anime.js
 # lightweight JavaScript animation library with a simple, yet powerful API.
 # v3.2.0
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2020 Julian Garnier
 # Copyright (C) 2023, 2024 Juergen Adams
 #
 # Anime is licensed under the MIT License.
 # See: https://github.com/juliangarnier/anime/blob/master/LICENSE.md
 #
 # J1 Template is licensed under the MIT License.
 # See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 # -----------------------------------------------------------------------------
*/


// Defaults
var defaultInstanceSettings = {
  update: null,
  begin: null,
  loopBegin: null,
  changeBegin: null,
  change: null,
  changeComplete: null,
  loopComplete: null,
  complete: null,
  loop: 1,
  direction: 'normal',
  autoplay: true,
  timelineOffset: 0
};
var defaultTweenSettings = {
  duration: 1000,
  delay: 0,
  endDelay: 0,
  easing: 'easeOutElastic(1, .5)',
  round: 0
};
var validTransforms = ['translateX', 'translateY', 'translateZ', 'rotate', 'rotateX', 'rotateY', 'rotateZ', 'scale', 'scaleX', 'scaleY', 'scaleZ', 'skew', 'skewX', 'skewY', 'perspective', 'matrix', 'matrix3d'];

// Caching

var cache = {
  CSS: {},
  springs: {}
};

// Utils

function minMax(val, min, max) {
  return Math.min(Math.max(val, min), max);
}
function stringContains(str, text) {
  return str.indexOf(text) > -1;
}
function applyArguments(func, args) {
  return func.apply(null, args);
}
var is = {
  arr: function (a) {
    return Array.isArray(a);
  },
  obj: function (a) {
    return stringContains(Object.prototype.toString.call(a), 'Object');
  },
  pth: function (a) {
    return is.obj(a) && a.hasOwnProperty('totalLength');
  },
  svg: function (a) {
    return a instanceof SVGElement;
  },
  inp: function (a) {
    return a instanceof HTMLInputElement;
  },
  dom: function (a) {
    return a.nodeType || is.svg(a);
  },
  str: function (a) {
    return typeof a === 'string';
  },
  fnc: function (a) {
    return typeof a === 'function';
  },
  und: function (a) {
    return typeof a === 'undefined';
  },
  hex: function (a) {
    return /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(a);
  },
  rgb: function (a) {
    return /^rgb/.test(a);
  },
  hsl: function (a) {
    return /^hsl/.test(a);
  },
  col: function (a) {
    return is.hex(a) || is.rgb(a) || is.hsl(a);
  },
  key: function (a) {
    return !defaultInstanceSettings.hasOwnProperty(a) && !defaultTweenSettings.hasOwnProperty(a) && a !== 'targets' && a !== 'keyframes';
  }
};

// Easings

function parseEasingParameters(string) {
  var match = /\(([^)]+)\)/.exec(string);
  return match ? match[1].split(',').map(function (p) {
    return parseFloat(p);
  }) : [];
}

// Spring solver inspired by Webkit Copyright © 2016 Apple Inc. All rights reserved. https://webkit.org/demos/spring/spring.js

function spring(string, duration) {
  var params = parseEasingParameters(string);
  var mass = minMax(is.und(params[0]) ? 1 : params[0], .1, 100);
  var stiffness = minMax(is.und(params[1]) ? 100 : params[1], .1, 100);
  var damping = minMax(is.und(params[2]) ? 10 : params[2], .1, 100);
  var velocity = minMax(is.und(params[3]) ? 0 : params[3], .1, 100);
  var w0 = Math.sqrt(stiffness / mass);
  var zeta = damping / (2 * Math.sqrt(stiffness * mass));
  var wd = zeta < 1 ? w0 * Math.sqrt(1 - zeta * zeta) : 0;
  var a = 1;
  var b = zeta < 1 ? (zeta * w0 + -velocity) / wd : -velocity + w0;
  function solver(t) {
    var progress = duration ? duration * t / 1000 : t;
    if (zeta < 1) {
      progress = Math.exp(-progress * zeta * w0) * (a * Math.cos(wd * progress) + b * Math.sin(wd * progress));
    } else {
      progress = (a + b * progress) * Math.exp(-progress * w0);
    }
    if (t === 0 || t === 1) {
      return t;
    }
    return 1 - progress;
  }
  function getDuration() {
    var cached = cache.springs[string];
    if (cached) {
      return cached;
    }
    var frame = 1 / 6;
    var elapsed = 0;
    var rest = 0;
    while (true) {
      elapsed += frame;
      if (solver(elapsed) === 1) {
        rest++;
        if (rest >= 16) {
          break;
        }
      } else {
        rest = 0;
      }
    }
    var duration = elapsed * frame * 1000;
    cache.springs[string] = duration;
    return duration;
  }
  return duration ? solver : getDuration;
}

// Basic steps easing implementation https://developer.mozilla.org/fr/docs/Web/CSS/transition-timing-function

function steps(steps) {
  if (steps === void 0) steps = 10;
  return function (t) {
    return Math.ceil(minMax(t, 0.000001, 1) * steps) * (1 / steps);
  };
}

// BezierEasing https://github.com/gre/bezier-easing

var bezier = function () {
  var kSplineTableSize = 11;
  var kSampleStepSize = 1.0 / (kSplineTableSize - 1.0);
  function A(aA1, aA2) {
    return 1.0 - 3.0 * aA2 + 3.0 * aA1;
  }
  function B(aA1, aA2) {
    return 3.0 * aA2 - 6.0 * aA1;
  }
  function C(aA1) {
    return 3.0 * aA1;
  }
  function calcBezier(aT, aA1, aA2) {
    return ((A(aA1, aA2) * aT + B(aA1, aA2)) * aT + C(aA1)) * aT;
  }
  function getSlope(aT, aA1, aA2) {
    return 3.0 * A(aA1, aA2) * aT * aT + 2.0 * B(aA1, aA2) * aT + C(aA1);
  }
  function binarySubdivide(aX, aA, aB, mX1, mX2) {
    var currentX,
      currentT,
      i = 0;
    do {
      currentT = aA + (aB - aA) / 2.0;
      currentX = calcBezier(currentT, mX1, mX2) - aX;
      if (currentX > 0.0) {
        aB = currentT;
      } else {
        aA = currentT;
      }
    } while (Math.abs(currentX) > 0.0000001 && ++i < 10);
    return currentT;
  }
  function newtonRaphsonIterate(aX, aGuessT, mX1, mX2) {
    for (var i = 0; i < 4; ++i) {
      var currentSlope = getSlope(aGuessT, mX1, mX2);
      if (currentSlope === 0.0) {
        return aGuessT;
      }
      var currentX = calcBezier(aGuessT, mX1, mX2) - aX;
      aGuessT -= currentX / currentSlope;
    }
    return aGuessT;
  }
  function bezier(mX1, mY1, mX2, mY2) {
    if (!(0 <= mX1 && mX1 <= 1 && 0 <= mX2 && mX2 <= 1)) {
      return;
    }
    var sampleValues = new Float32Array(kSplineTableSize);
    if (mX1 !== mY1 || mX2 !== mY2) {
      for (var i = 0; i < kSplineTableSize; ++i) {
        sampleValues[i] = calcBezier(i * kSampleStepSize, mX1, mX2);
      }
    }
    function getTForX(aX) {
      var intervalStart = 0;
      var currentSample = 1;
      var lastSample = kSplineTableSize - 1;
      for (; currentSample !== lastSample && sampleValues[currentSample] <= aX; ++currentSample) {
        intervalStart += kSampleStepSize;
      }
      --currentSample;
      var dist = (aX - sampleValues[currentSample]) / (sampleValues[currentSample + 1] - sampleValues[currentSample]);
      var guessForT = intervalStart + dist * kSampleStepSize;
      var initialSlope = getSlope(guessForT, mX1, mX2);
      if (initialSlope >= 0.001) {
        return newtonRaphsonIterate(aX, guessForT, mX1, mX2);
      } else if (initialSlope === 0.0) {
        return guessForT;
      } else {
        return binarySubdivide(aX, intervalStart, intervalStart + kSampleStepSize, mX1, mX2);
      }
    }
    return function (x) {
      if (mX1 === mY1 && mX2 === mY2) {
        return x;
      }
      if (x === 0 || x === 1) {
        return x;
      }
      return calcBezier(getTForX(x), mY1, mY2);
    };
  }
  return bezier;
}();
var penner = function () {
  // Based on jQuery UI's implemenation of easing equations from Robert Penner (http://www.robertpenner.com/easing)

  var eases = {
    linear: function () {
      return function (t) {
        return t;
      };
    }
  };
  var functionEasings = {
    Sine: function () {
      return function (t) {
        return 1 - Math.cos(t * Math.PI / 2);
      };
    },
    Circ: function () {
      return function (t) {
        return 1 - Math.sqrt(1 - t * t);
      };
    },
    Back: function () {
      return function (t) {
        return t * t * (3 * t - 2);
      };
    },
    Bounce: function () {
      return function (t) {
        var pow2,
          b = 4;
        while (t < ((pow2 = Math.pow(2, --b)) - 1) / 11) {}
        return 1 / Math.pow(4, 3 - b) - 7.5625 * Math.pow((pow2 * 3 - 2) / 22 - t, 2);
      };
    },
    Elastic: function (amplitude, period) {
      if (amplitude === void 0) amplitude = 1;
      if (period === void 0) period = .5;
      var a = minMax(amplitude, 1, 10);
      var p = minMax(period, .1, 2);
      return function (t) {
        return t === 0 || t === 1 ? t : -a * Math.pow(2, 10 * (t - 1)) * Math.sin((t - 1 - p / (Math.PI * 2) * Math.asin(1 / a)) * (Math.PI * 2) / p);
      };
    }
  };
  var baseEasings = ['Quad', 'Cubic', 'Quart', 'Quint', 'Expo'];
  baseEasings.forEach(function (name, i) {
    functionEasings[name] = function () {
      return function (t) {
        return Math.pow(t, i + 2);
      };
    };
  });
  Object.keys(functionEasings).forEach(function (name) {
    var easeIn = functionEasings[name];
    eases['easeIn' + name] = easeIn;
    eases['easeOut' + name] = function (a, b) {
      return function (t) {
        return 1 - easeIn(a, b)(1 - t);
      };
    };
    eases['easeInOut' + name] = function (a, b) {
      return function (t) {
        return t < 0.5 ? easeIn(a, b)(t * 2) / 2 : 1 - easeIn(a, b)(t * -2 + 2) / 2;
      };
    };
  });
  return eases;
}();
function parseEasings(easing, duration) {
  if (is.fnc(easing)) {
    return easing;
  }
  var name = easing.split('(')[0];
  var ease = penner[name];
  var args = parseEasingParameters(easing);
  switch (name) {
    case 'spring':
      return spring(easing, duration);
    case 'cubicBezier':
      return applyArguments(bezier, args);
    case 'steps':
      return applyArguments(steps, args);
    default:
      return applyArguments(ease, args);
  }
}

// Strings

function selectString(str) {
  try {
    var nodes = document.querySelectorAll(str);
    return nodes;
  } catch (e) {
    return;
  }
}

// Arrays

function filterArray(arr, callback) {
  var len = arr.length;
  var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
  var result = [];
  for (var i = 0; i < len; i++) {
    if (i in arr) {
      var val = arr[i];
      if (callback.call(thisArg, val, i, arr)) {
        result.push(val);
      }
    }
  }
  return result;
}
function flattenArray(arr) {
  return arr.reduce(function (a, b) {
    return a.concat(is.arr(b) ? flattenArray(b) : b);
  }, []);
}
function toArray(o) {
  if (is.arr(o)) {
    return o;
  }
  if (is.str(o)) {
    o = selectString(o) || o;
  }
  if (o instanceof NodeList || o instanceof HTMLCollection) {
    return [].slice.call(o);
  }
  return [o];
}
function arrayContains(arr, val) {
  return arr.some(function (a) {
    return a === val;
  });
}

// Objects

function cloneObject(o) {
  var clone = {};
  for (var p in o) {
    clone[p] = o[p];
  }
  return clone;
}
function replaceObjectProps(o1, o2) {
  var o = cloneObject(o1);
  for (var p in o1) {
    o[p] = o2.hasOwnProperty(p) ? o2[p] : o1[p];
  }
  return o;
}
function mergeObjects(o1, o2) {
  var o = cloneObject(o1);
  for (var p in o2) {
    o[p] = is.und(o1[p]) ? o2[p] : o1[p];
  }
  return o;
}

// Colors

function rgbToRgba(rgbValue) {
  var rgb = /rgb\((\d+,\s*[\d]+,\s*[\d]+)\)/g.exec(rgbValue);
  return rgb ? "rgba(" + rgb[1] + ",1)" : rgbValue;
}
function hexToRgba(hexValue) {
  var rgx = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  var hex = hexValue.replace(rgx, function (m, r, g, b) {
    return r + r + g + g + b + b;
  });
  var rgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  var r = parseInt(rgb[1], 16);
  var g = parseInt(rgb[2], 16);
  var b = parseInt(rgb[3], 16);
  return "rgba(" + r + "," + g + "," + b + ",1)";
}
function hslToRgba(hslValue) {
  var hsl = /hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/g.exec(hslValue) || /hsla\((\d+),\s*([\d.]+)%,\s*([\d.]+)%,\s*([\d.]+)\)/g.exec(hslValue);
  var h = parseInt(hsl[1], 10) / 360;
  var s = parseInt(hsl[2], 10) / 100;
  var l = parseInt(hsl[3], 10) / 100;
  var a = hsl[4] || 1;
  function hue2rgb(p, q, t) {
    if (t < 0) {
      t += 1;
    }
    if (t > 1) {
      t -= 1;
    }
    if (t < 1 / 6) {
      return p + (q - p) * 6 * t;
    }
    if (t < 1 / 2) {
      return q;
    }
    if (t < 2 / 3) {
      return p + (q - p) * (2 / 3 - t) * 6;
    }
    return p;
  }
  var r, g, b;
  if (s == 0) {
    r = g = b = l;
  } else {
    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return "rgba(" + r * 255 + "," + g * 255 + "," + b * 255 + "," + a + ")";
}
function colorToRgb(val) {
  if (is.rgb(val)) {
    return rgbToRgba(val);
  }
  if (is.hex(val)) {
    return hexToRgba(val);
  }
  if (is.hsl(val)) {
    return hslToRgba(val);
  }
}

// Units

function getUnit(val) {
  var split = /[+-]?\d*\.?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?(%|px|pt|em|rem|in|cm|mm|ex|ch|pc|vw|vh|vmin|vmax|deg|rad|turn)?$/.exec(val);
  if (split) {
    return split[1];
  }
}
function getTransformUnit(propName) {
  if (stringContains(propName, 'translate') || propName === 'perspective') {
    return 'px';
  }
  if (stringContains(propName, 'rotate') || stringContains(propName, 'skew')) {
    return 'deg';
  }
}

// Values

function getFunctionValue(val, animatable) {
  if (!is.fnc(val)) {
    return val;
  }
  return val(animatable.target, animatable.id, animatable.total);
}
function getAttribute(el, prop) {
  return el.getAttribute(prop);
}
function convertPxToUnit(el, value, unit) {
  var valueUnit = getUnit(value);
  if (arrayContains([unit, 'deg', 'rad', 'turn'], valueUnit)) {
    return value;
  }
  var cached = cache.CSS[value + unit];
  if (!is.und(cached)) {
    return cached;
  }
  var baseline = 100;
  var tempEl = document.createElement(el.tagName);
  var parentEl = el.parentNode && el.parentNode !== document ? el.parentNode : document.body;
  parentEl.appendChild(tempEl);
  tempEl.style.position = 'absolute';
  tempEl.style.width = baseline + unit;
  var factor = baseline / tempEl.offsetWidth;
  parentEl.removeChild(tempEl);
  var convertedUnit = factor * parseFloat(value);
  cache.CSS[value + unit] = convertedUnit;
  return convertedUnit;
}
function getCSSValue(el, prop, unit) {
  if (prop in el.style) {
    var uppercasePropName = prop.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    var value = el.style[prop] || getComputedStyle(el).getPropertyValue(uppercasePropName) || '0';
    return unit ? convertPxToUnit(el, value, unit) : value;
  }
}
function getAnimationType(el, prop) {
  if (is.dom(el) && !is.inp(el) && (getAttribute(el, prop) || is.svg(el) && el[prop])) {
    return 'attribute';
  }
  if (is.dom(el) && arrayContains(validTransforms, prop)) {
    return 'transform';
  }
  if (is.dom(el) && prop !== 'transform' && getCSSValue(el, prop)) {
    return 'css';
  }
  if (el[prop] != null) {
    return 'object';
  }
}
function getElementTransforms(el) {
  if (!is.dom(el)) {
    return;
  }
  var str = el.style.transform || '';
  var reg = /(\w+)\(([^)]*)\)/g;
  var transforms = new Map();
  var m;
  while (m = reg.exec(str)) {
    transforms.set(m[1], m[2]);
  }
  return transforms;
}
function getTransformValue(el, propName, animatable, unit) {
  var defaultVal = stringContains(propName, 'scale') ? 1 : 0 + getTransformUnit(propName);
  var value = getElementTransforms(el).get(propName) || defaultVal;
  if (animatable) {
    animatable.transforms.list.set(propName, value);
    animatable.transforms['last'] = propName;
  }
  return unit ? convertPxToUnit(el, value, unit) : value;
}
function getOriginalTargetValue(target, propName, unit, animatable) {
  switch (getAnimationType(target, propName)) {
    case 'transform':
      return getTransformValue(target, propName, animatable, unit);
    case 'css':
      return getCSSValue(target, propName, unit);
    case 'attribute':
      return getAttribute(target, propName);
    default:
      return target[propName] || 0;
  }
}
function getRelativeValue(to, from) {
  var operator = /^(\*=|\+=|-=)/.exec(to);
  if (!operator) {
    return to;
  }
  var u = getUnit(to) || 0;
  var x = parseFloat(from);
  var y = parseFloat(to.replace(operator[0], ''));
  switch (operator[0][0]) {
    case '+':
      return x + y + u;
    case '-':
      return x - y + u;
    case '*':
      return x * y + u;
  }
}
function validateValue(val, unit) {
  if (is.col(val)) {
    return colorToRgb(val);
  }
  if (/\s/g.test(val)) {
    return val;
  }
  var originalUnit = getUnit(val);
  var unitLess = originalUnit ? val.substr(0, val.length - originalUnit.length) : val;
  if (unit) {
    return unitLess + unit;
  }
  return unitLess;
}

// getTotalLength() equivalent for circle, rect, polyline, polygon and line shapes
// adapted from https://gist.github.com/SebLambla/3e0550c496c236709744

function getDistance(p1, p2) {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}
function getCircleLength(el) {
  return Math.PI * 2 * getAttribute(el, 'r');
}
function getRectLength(el) {
  return getAttribute(el, 'width') * 2 + getAttribute(el, 'height') * 2;
}
function getLineLength(el) {
  return getDistance({
    x: getAttribute(el, 'x1'),
    y: getAttribute(el, 'y1')
  }, {
    x: getAttribute(el, 'x2'),
    y: getAttribute(el, 'y2')
  });
}
function getPolylineLength(el) {
  var points = el.points;
  var totalLength = 0;
  var previousPos;
  for (var i = 0; i < points.numberOfItems; i++) {
    var currentPos = points.getItem(i);
    if (i > 0) {
      totalLength += getDistance(previousPos, currentPos);
    }
    previousPos = currentPos;
  }
  return totalLength;
}
function getPolygonLength(el) {
  var points = el.points;
  return getPolylineLength(el) + getDistance(points.getItem(points.numberOfItems - 1), points.getItem(0));
}

// Path animation

function getTotalLength(el) {
  if (el.getTotalLength) {
    return el.getTotalLength();
  }
  switch (el.tagName.toLowerCase()) {
    case 'circle':
      return getCircleLength(el);
    case 'rect':
      return getRectLength(el);
    case 'line':
      return getLineLength(el);
    case 'polyline':
      return getPolylineLength(el);
    case 'polygon':
      return getPolygonLength(el);
  }
}
function setDashoffset(el) {
  var pathLength = getTotalLength(el);
  el.setAttribute('stroke-dasharray', pathLength);
  return pathLength;
}

// Motion path

function getParentSvgEl(el) {
  var parentEl = el.parentNode;
  while (is.svg(parentEl)) {
    if (!is.svg(parentEl.parentNode)) {
      break;
    }
    parentEl = parentEl.parentNode;
  }
  return parentEl;
}
function getParentSvg(pathEl, svgData) {
  var svg = svgData || {};
  var parentSvgEl = svg.el || getParentSvgEl(pathEl);
  var rect = parentSvgEl.getBoundingClientRect();
  var viewBoxAttr = getAttribute(parentSvgEl, 'viewBox');
  var width = rect.width;
  var height = rect.height;
  var viewBox = svg.viewBox || (viewBoxAttr ? viewBoxAttr.split(' ') : [0, 0, width, height]);
  return {
    el: parentSvgEl,
    viewBox: viewBox,
    x: viewBox[0] / 1,
    y: viewBox[1] / 1,
    w: width / viewBox[2],
    h: height / viewBox[3]
  };
}
function getPath(path, percent) {
  var pathEl = is.str(path) ? selectString(path)[0] : path;
  var p = percent || 100;
  return function (property) {
    return {
      property: property,
      el: pathEl,
      svg: getParentSvg(pathEl),
      totalLength: getTotalLength(pathEl) * (p / 100)
    };
  };
}
function getPathProgress(path, progress) {
  function point(offset) {
    if (offset === void 0) offset = 0;
    var l = progress + offset >= 1 ? progress + offset : 0;
    return path.el.getPointAtLength(l);
  }
  var svg = getParentSvg(path.el, path.svg);
  var p = point();
  var p0 = point(-1);
  var p1 = point(+1);
  switch (path.property) {
    case 'x':
      return (p.x - svg.x) * svg.w;
    case 'y':
      return (p.y - svg.y) * svg.h;
    case 'angle':
      return Math.atan2(p1.y - p0.y, p1.x - p0.x) * 180 / Math.PI;
  }
}

// Decompose value

function decomposeValue(val, unit) {
  // const rgx = /-?\d*\.?\d+/g; // handles basic numbers
  // const rgx = /[+-]?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g; // handles exponents notation
  var rgx = /[+-]?\d*\.?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g; // handles exponents notation
  var value = validateValue(is.pth(val) ? val.totalLength : val, unit) + '';
  return {
    original: value,
    numbers: value.match(rgx) ? value.match(rgx).map(Number) : [0],
    strings: is.str(val) || unit ? value.split(rgx) : []
  };
}

// Animatables

function parseTargets(targets) {
  var targetsArray = targets ? flattenArray(is.arr(targets) ? targets.map(toArray) : toArray(targets)) : [];
  return filterArray(targetsArray, function (item, pos, self) {
    return self.indexOf(item) === pos;
  });
}
function getAnimatables(targets) {
  var parsed = parseTargets(targets);
  return parsed.map(function (t, i) {
    return {
      target: t,
      id: i,
      total: parsed.length,
      transforms: {
        list: getElementTransforms(t)
      }
    };
  });
}

// Properties

function normalizePropertyTweens(prop, tweenSettings) {
  var settings = cloneObject(tweenSettings);
  // Override duration if easing is a spring
  if (/^spring/.test(settings.easing)) {
    settings.duration = spring(settings.easing);
  }
  if (is.arr(prop)) {
    var l = prop.length;
    var isFromTo = l === 2 && !is.obj(prop[0]);
    if (!isFromTo) {
      // Duration divided by the number of tweens
      if (!is.fnc(tweenSettings.duration)) {
        settings.duration = tweenSettings.duration / l;
      }
    } else {
      // Transform [from, to] values shorthand to a valid tween value
      prop = {
        value: prop
      };
    }
  }
  var propArray = is.arr(prop) ? prop : [prop];
  return propArray.map(function (v, i) {
    var obj = is.obj(v) && !is.pth(v) ? v : {
      value: v
    };
    // Default delay value should only be applied to the first tween
    if (is.und(obj.delay)) {
      obj.delay = !i ? tweenSettings.delay : 0;
    }
    // Default endDelay value should only be applied to the last tween
    if (is.und(obj.endDelay)) {
      obj.endDelay = i === propArray.length - 1 ? tweenSettings.endDelay : 0;
    }
    return obj;
  }).map(function (k) {
    return mergeObjects(k, settings);
  });
}
function flattenKeyframes(keyframes) {
  var propertyNames = filterArray(flattenArray(keyframes.map(function (key) {
    return Object.keys(key);
  })), function (p) {
    return is.key(p);
  }).reduce(function (a, b) {
    if (a.indexOf(b) < 0) {
      a.push(b);
    }
    return a;
  }, []);
  var properties = {};
  var loop = function (i) {
    var propName = propertyNames[i];
    properties[propName] = keyframes.map(function (key) {
      var newKey = {};
      for (var p in key) {
        if (is.key(p)) {
          if (p == propName) {
            newKey.value = key[p];
          }
        } else {
          newKey[p] = key[p];
        }
      }
      return newKey;
    });
  };
  for (var i = 0; i < propertyNames.length; i++) loop(i);
  return properties;
}
function getProperties(tweenSettings, params) {
  var properties = [];
  var keyframes = params.keyframes;
  if (keyframes) {
    params = mergeObjects(flattenKeyframes(keyframes), params);
  }
  for (var p in params) {
    if (is.key(p)) {
      properties.push({
        name: p,
        tweens: normalizePropertyTweens(params[p], tweenSettings)
      });
    }
  }
  return properties;
}

// Tweens

function normalizeTweenValues(tween, animatable) {
  var t = {};
  for (var p in tween) {
    var value = getFunctionValue(tween[p], animatable);
    if (is.arr(value)) {
      value = value.map(function (v) {
        return getFunctionValue(v, animatable);
      });
      if (value.length === 1) {
        value = value[0];
      }
    }
    t[p] = value;
  }
  t.duration = parseFloat(t.duration);
  t.delay = parseFloat(t.delay);
  return t;
}
function normalizeTweens(prop, animatable) {
  var previousTween;
  return prop.tweens.map(function (t) {
    var tween = normalizeTweenValues(t, animatable);
    var tweenValue = tween.value;
    var to = is.arr(tweenValue) ? tweenValue[1] : tweenValue;
    var toUnit = getUnit(to);
    var originalValue = getOriginalTargetValue(animatable.target, prop.name, toUnit, animatable);
    var previousValue = previousTween ? previousTween.to.original : originalValue;
    var from = is.arr(tweenValue) ? tweenValue[0] : previousValue;
    var fromUnit = getUnit(from) || getUnit(originalValue);
    var unit = toUnit || fromUnit;
    if (is.und(to)) {
      to = previousValue;
    }
    tween.from = decomposeValue(from, unit);
    tween.to = decomposeValue(getRelativeValue(to, from), unit);
    tween.start = previousTween ? previousTween.end : 0;
    tween.end = tween.start + tween.delay + tween.duration + tween.endDelay;
    tween.easing = parseEasings(tween.easing, tween.duration);
    tween.isPath = is.pth(tweenValue);
    tween.isColor = is.col(tween.from.original);
    if (tween.isColor) {
      tween.round = 1;
    }
    previousTween = tween;
    return tween;
  });
}

// Tween progress

var setProgressValue = {
  css: function (t, p, v) {
    return t.style[p] = v;
  },
  attribute: function (t, p, v) {
    return t.setAttribute(p, v);
  },
  object: function (t, p, v) {
    return t[p] = v;
  },
  transform: function (t, p, v, transforms, manual) {
    transforms.list.set(p, v);
    if (p === transforms.last || manual) {
      var str = '';
      transforms.list.forEach(function (value, prop) {
        str += prop + "(" + value + ") ";
      });
      t.style.transform = str;
    }
  }
};

// Set Value helper

function setTargetsValue(targets, properties) {
  var animatables = getAnimatables(targets);
  animatables.forEach(function (animatable) {
    for (var property in properties) {
      var value = getFunctionValue(properties[property], animatable);
      var target = animatable.target;
      var valueUnit = getUnit(value);
      var originalValue = getOriginalTargetValue(target, property, valueUnit, animatable);
      var unit = valueUnit || getUnit(originalValue);
      var to = getRelativeValue(validateValue(value, unit), originalValue);
      var animType = getAnimationType(target, property);
      setProgressValue[animType](target, property, to, animatable.transforms, true);
    }
  });
}

// Animations

function createAnimation(animatable, prop) {
  var animType = getAnimationType(animatable.target, prop.name);
  if (animType) {
    var tweens = normalizeTweens(prop, animatable);
    var lastTween = tweens[tweens.length - 1];
    return {
      type: animType,
      property: prop.name,
      animatable: animatable,
      tweens: tweens,
      duration: lastTween.end,
      delay: tweens[0].delay,
      endDelay: lastTween.endDelay
    };
  }
}
function getAnimations(animatables, properties) {
  return filterArray(flattenArray(animatables.map(function (animatable) {
    return properties.map(function (prop) {
      return createAnimation(animatable, prop);
    });
  })), function (a) {
    return !is.und(a);
  });
}

// Create Instance

function getInstanceTimings(animations, tweenSettings) {
  var animLength = animations.length;
  var getTlOffset = function (anim) {
    return anim.timelineOffset ? anim.timelineOffset : 0;
  };
  var timings = {};
  timings.duration = animLength ? Math.max.apply(Math, animations.map(function (anim) {
    return getTlOffset(anim) + anim.duration;
  })) : tweenSettings.duration;
  timings.delay = animLength ? Math.min.apply(Math, animations.map(function (anim) {
    return getTlOffset(anim) + anim.delay;
  })) : tweenSettings.delay;
  timings.endDelay = animLength ? timings.duration - Math.max.apply(Math, animations.map(function (anim) {
    return getTlOffset(anim) + anim.duration - anim.endDelay;
  })) : tweenSettings.endDelay;
  return timings;
}
var instanceID = 0;
function createNewInstance(params) {
  var instanceSettings = replaceObjectProps(defaultInstanceSettings, params);
  var tweenSettings = replaceObjectProps(defaultTweenSettings, params);
  var properties = getProperties(tweenSettings, params);
  var animatables = getAnimatables(params.targets);
  var animations = getAnimations(animatables, properties);
  var timings = getInstanceTimings(animations, tweenSettings);
  var id = instanceID;
  instanceID++;
  return mergeObjects(instanceSettings, {
    id: id,
    children: [],
    animatables: animatables,
    animations: animations,
    duration: timings.duration,
    delay: timings.delay,
    endDelay: timings.endDelay
  });
}

// Core

var activeInstances = [];
var pausedInstances = [];
var raf;
var engine = function () {
  function play() {
    raf = requestAnimationFrame(step);
  }
  function step(t) {
    var activeInstancesLength = activeInstances.length;
    if (activeInstancesLength) {
      var i = 0;
      while (i < activeInstancesLength) {
        var activeInstance = activeInstances[i];
        if (!activeInstance.paused) {
          activeInstance.tick(t);
        } else {
          var instanceIndex = activeInstances.indexOf(activeInstance);
          if (instanceIndex > -1) {
            activeInstances.splice(instanceIndex, 1);
            activeInstancesLength = activeInstances.length;
          }
        }
        i++;
      }
      play();
    } else {
      raf = cancelAnimationFrame(raf);
    }
  }
  return play;
}();
function handleVisibilityChange() {
  if (document.hidden) {
    activeInstances.forEach(function (ins) {
      return ins.pause();
    });
    pausedInstances = activeInstances.slice(0);
    anime.running = activeInstances = [];
  } else {
    pausedInstances.forEach(function (ins) {
      return ins.play();
    });
  }
}
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', handleVisibilityChange);
}

// Public Instance

function anime(params) {
  if (params === void 0) params = {};
  var startTime = 0,
    lastTime = 0,
    now = 0;
  var children,
    childrenLength = 0;
  var resolve = null;
  function makePromise(instance) {
    var promise = window.Promise && new Promise(function (_resolve) {
      return resolve = _resolve;
    });
    instance.finished = promise;
    return promise;
  }
  var instance = createNewInstance(params);
  var promise = makePromise(instance);
  function toggleInstanceDirection() {
    var direction = instance.direction;
    if (direction !== 'alternate') {
      instance.direction = direction !== 'normal' ? 'normal' : 'reverse';
    }
    instance.reversed = !instance.reversed;
    children.forEach(function (child) {
      return child.reversed = instance.reversed;
    });
  }
  function adjustTime(time) {
    return instance.reversed ? instance.duration - time : time;
  }
  function resetTime() {
    startTime = 0;
    lastTime = adjustTime(instance.currentTime) * (1 / anime.speed);
  }
  function seekChild(time, child) {
    if (child) {
      child.seek(time - child.timelineOffset);
    }
  }
  function syncInstanceChildren(time) {
    if (!instance.reversePlayback) {
      for (var i = 0; i < childrenLength; i++) {
        seekChild(time, children[i]);
      }
    } else {
      for (var i$1 = childrenLength; i$1--;) {
        seekChild(time, children[i$1]);
      }
    }
  }
  function setAnimationsProgress(insTime) {
    var i = 0;
    var animations = instance.animations;
    var animationsLength = animations.length;
    while (i < animationsLength) {
      var anim = animations[i];
      var animatable = anim.animatable;
      var tweens = anim.tweens;
      var tweenLength = tweens.length - 1;
      var tween = tweens[tweenLength];
      // Only check for keyframes if there is more than one tween
      if (tweenLength) {
        tween = filterArray(tweens, function (t) {
          return insTime < t.end;
        })[0] || tween;
      }
      var elapsed = minMax(insTime - tween.start - tween.delay, 0, tween.duration) / tween.duration;
      var eased = isNaN(elapsed) ? 1 : tween.easing(elapsed);
      var strings = tween.to.strings;
      var round = tween.round;
      var numbers = [];
      var toNumbersLength = tween.to.numbers.length;
      var progress = void 0;
      for (var n = 0; n < toNumbersLength; n++) {
        var value = void 0;
        var toNumber = tween.to.numbers[n];
        var fromNumber = tween.from.numbers[n] || 0;
        if (!tween.isPath) {
          value = fromNumber + eased * (toNumber - fromNumber);
        } else {
          value = getPathProgress(tween.value, eased * toNumber);
        }
        if (round) {
          if (!(tween.isColor && n > 2)) {
            value = Math.round(value * round) / round;
          }
        }
        numbers.push(value);
      }
      // Manual Array.reduce for better performances
      var stringsLength = strings.length;
      if (!stringsLength) {
        progress = numbers[0];
      } else {
        progress = strings[0];
        for (var s = 0; s < stringsLength; s++) {
          var a = strings[s];
          var b = strings[s + 1];
          var n$1 = numbers[s];
          if (!isNaN(n$1)) {
            if (!b) {
              progress += n$1 + ' ';
            } else {
              progress += n$1 + b;
            }
          }
        }
      }
      setProgressValue[anim.type](animatable.target, anim.property, progress, animatable.transforms);
      anim.currentValue = progress;
      i++;
    }
  }
  function setCallback(cb) {
    if (instance[cb] && !instance.passThrough) {
      instance[cb](instance);
    }
  }
  function countIteration() {
    if (instance.remaining && instance.remaining !== true) {
      instance.remaining--;
    }
  }
  function setInstanceProgress(engineTime) {
    var insDuration = instance.duration;
    var insDelay = instance.delay;
    var insEndDelay = insDuration - instance.endDelay;
    var insTime = adjustTime(engineTime);
    instance.progress = minMax(insTime / insDuration * 100, 0, 100);
    instance.reversePlayback = insTime < instance.currentTime;
    if (children) {
      syncInstanceChildren(insTime);
    }
    if (!instance.began && instance.currentTime > 0) {
      instance.began = true;
      setCallback('begin');
    }
    if (!instance.loopBegan && instance.currentTime > 0) {
      instance.loopBegan = true;
      setCallback('loopBegin');
    }
    if (insTime <= insDelay && instance.currentTime !== 0) {
      setAnimationsProgress(0);
    }
    if (insTime >= insEndDelay && instance.currentTime !== insDuration || !insDuration) {
      setAnimationsProgress(insDuration);
    }
    if (insTime > insDelay && insTime < insEndDelay) {
      if (!instance.changeBegan) {
        instance.changeBegan = true;
        instance.changeCompleted = false;
        setCallback('changeBegin');
      }
      setCallback('change');
      setAnimationsProgress(insTime);
    } else {
      if (instance.changeBegan) {
        instance.changeCompleted = true;
        instance.changeBegan = false;
        setCallback('changeComplete');
      }
    }
    instance.currentTime = minMax(insTime, 0, insDuration);
    if (instance.began) {
      setCallback('update');
    }
    if (engineTime >= insDuration) {
      lastTime = 0;
      countIteration();
      if (!instance.remaining) {
        instance.paused = true;
        if (!instance.completed) {
          instance.completed = true;
          setCallback('loopComplete');
          setCallback('complete');
          if (!instance.passThrough && 'Promise' in window) {
            resolve();
            promise = makePromise(instance);
          }
        }
      } else {
        startTime = now;
        setCallback('loopComplete');
        instance.loopBegan = false;
        if (instance.direction === 'alternate') {
          toggleInstanceDirection();
        }
      }
    }
  }
  instance.reset = function () {
    var direction = instance.direction;
    instance.passThrough = false;
    instance.currentTime = 0;
    instance.progress = 0;
    instance.paused = true;
    instance.began = false;
    instance.loopBegan = false;
    instance.changeBegan = false;
    instance.completed = false;
    instance.changeCompleted = false;
    instance.reversePlayback = false;
    instance.reversed = direction === 'reverse';
    instance.remaining = instance.loop;
    children = instance.children;
    childrenLength = children.length;
    for (var i = childrenLength; i--;) {
      instance.children[i].reset();
    }
    if (instance.reversed && instance.loop !== true || direction === 'alternate' && instance.loop === 1) {
      instance.remaining++;
    }
    setAnimationsProgress(instance.reversed ? instance.duration : 0);
  };

  // Set Value helper

  instance.set = function (targets, properties) {
    setTargetsValue(targets, properties);
    return instance;
  };
  instance.tick = function (t) {
    now = t;
    if (!startTime) {
      startTime = now;
    }
    setInstanceProgress((now + (lastTime - startTime)) * anime.speed);
  };
  instance.seek = function (time) {
    setInstanceProgress(adjustTime(time));
  };
  instance.pause = function () {
    instance.paused = true;
    resetTime();
  };
  instance.play = function () {
    if (!instance.paused) {
      return;
    }
    if (instance.completed) {
      instance.reset();
    }
    instance.paused = false;
    activeInstances.push(instance);
    resetTime();
    if (!raf) {
      engine();
    }
  };
  instance.reverse = function () {
    toggleInstanceDirection();
    instance.completed = instance.reversed ? false : true;
    resetTime();
  };
  instance.restart = function () {
    instance.reset();
    instance.play();
  };
  instance.reset();
  if (instance.autoplay) {
    instance.play();
  }
  return instance;
}

// Remove targets from animation

function removeTargetsFromAnimations(targetsArray, animations) {
  for (var a = animations.length; a--;) {
    if (arrayContains(targetsArray, animations[a].animatable.target)) {
      animations.splice(a, 1);
    }
  }
}
function removeTargets(targets) {
  var targetsArray = parseTargets(targets);
  for (var i = activeInstances.length; i--;) {
    var instance = activeInstances[i];
    var animations = instance.animations;
    var children = instance.children;
    removeTargetsFromAnimations(targetsArray, animations);
    for (var c = children.length; c--;) {
      var child = children[c];
      var childAnimations = child.animations;
      removeTargetsFromAnimations(targetsArray, childAnimations);
      if (!childAnimations.length && !child.children.length) {
        children.splice(c, 1);
      }
    }
    if (!animations.length && !children.length) {
      instance.pause();
    }
  }
}

// Stagger helpers

function stagger(val, params) {
  if (params === void 0) params = {};
  var direction = params.direction || 'normal';
  var easing = params.easing ? parseEasings(params.easing) : null;
  var grid = params.grid;
  var axis = params.axis;
  var fromIndex = params.from || 0;
  var fromFirst = fromIndex === 'first';
  var fromCenter = fromIndex === 'center';
  var fromLast = fromIndex === 'last';
  var isRange = is.arr(val);
  var val1 = isRange ? parseFloat(val[0]) : parseFloat(val);
  var val2 = isRange ? parseFloat(val[1]) : 0;
  var unit = getUnit(isRange ? val[1] : val) || 0;
  var start = params.start || 0 + (isRange ? val1 : 0);
  var values = [];
  var maxValue = 0;
  return function (el, i, t) {
    if (fromFirst) {
      fromIndex = 0;
    }
    if (fromCenter) {
      fromIndex = (t - 1) / 2;
    }
    if (fromLast) {
      fromIndex = t - 1;
    }
    if (!values.length) {
      for (var index = 0; index < t; index++) {
        if (!grid) {
          values.push(Math.abs(fromIndex - index));
        } else {
          var fromX = !fromCenter ? fromIndex % grid[0] : (grid[0] - 1) / 2;
          var fromY = !fromCenter ? Math.floor(fromIndex / grid[0]) : (grid[1] - 1) / 2;
          var toX = index % grid[0];
          var toY = Math.floor(index / grid[0]);
          var distanceX = fromX - toX;
          var distanceY = fromY - toY;
          var value = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
          if (axis === 'x') {
            value = -distanceX;
          }
          if (axis === 'y') {
            value = -distanceY;
          }
          values.push(value);
        }
        maxValue = Math.max.apply(Math, values);
      }
      if (easing) {
        values = values.map(function (val) {
          return easing(val / maxValue) * maxValue;
        });
      }
      if (direction === 'reverse') {
        values = values.map(function (val) {
          return axis ? val < 0 ? val * -1 : -val : Math.abs(maxValue - val);
        });
      }
    }
    var spacing = isRange ? (val2 - val1) / maxValue : val1;
    return start + spacing * (Math.round(values[i] * 100) / 100) + unit;
  };
}

// Timeline

function timeline(params) {
  if (params === void 0) params = {};
  var tl = anime(params);
  tl.duration = 0;
  tl.add = function (instanceParams, timelineOffset) {
    var tlIndex = activeInstances.indexOf(tl);
    var children = tl.children;
    if (tlIndex > -1) {
      activeInstances.splice(tlIndex, 1);
    }
    function passThrough(ins) {
      ins.passThrough = true;
    }
    for (var i = 0; i < children.length; i++) {
      passThrough(children[i]);
    }
    var insParams = mergeObjects(instanceParams, replaceObjectProps(defaultTweenSettings, params));
    insParams.targets = insParams.targets || params.targets;
    var tlDuration = tl.duration;
    insParams.autoplay = false;
    insParams.direction = tl.direction;
    insParams.timelineOffset = is.und(timelineOffset) ? tlDuration : getRelativeValue(timelineOffset, tlDuration);
    passThrough(tl);
    tl.seek(insParams.timelineOffset);
    var ins = anime(insParams);
    passThrough(ins);
    children.push(ins);
    var timings = getInstanceTimings(children, params);
    tl.delay = timings.delay;
    tl.endDelay = timings.endDelay;
    tl.duration = timings.duration;
    tl.seek(0);
    tl.reset();
    if (tl.autoplay) {
      tl.play();
    }
    return tl;
  };
  return tl;
}
anime.version = '3.2.0';
anime.speed = 1;
anime.running = activeInstances;
anime.remove = removeTargets;
anime.get = getOriginalTargetValue;
anime.set = setTargetsValue;
anime.convertPx = convertPxToUnit;
anime.path = getPath;
anime.setDashoffset = setDashoffset;
anime.stagger = stagger;
anime.timeline = timeline;
anime.easing = parseEasings;
anime.penner = penner;
anime.random = function (min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
module.exports = anime;

/***/ }),

/***/ 1702:
/***/ ((module) => {

/*
 # -----------------------------------------------------------------------------
 #  ~/200_theme_js/js/asciidoctor/asciidoctor.js
 #  Provides JS functions to (dynamically) modify Asciidoctor HTML elements
 #
 #  Product/Info:
 #  http://jekyll.one
 #
 #  Copyright (C) 2023, 2024 Juergen Adams
 #
 #  J1 Theme is licensed under MIT License.
 #  See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 # -----------------------------------------------------------------------------
 #  NOTE:
 # -----------------------------------------------------------------------------
*/

// -----------------------------------------------------------------------------
// ESLint shimming
// -----------------------------------------------------------------------------
/* eslint no-unused-vars: "off"                                               */
/* eslint no-undef: "off"                                                     */
/* eslint no-redeclare: "off"                                                 */
/* global window                                                              */

// TODO:

// -----------------------------------------------------------------------------
// J1 Asciidoctor registered as "asciidoctor"
// -----------------------------------------------------------------------------
/*!
 * J1 Asciidoctor
 * Copyright (C) 2023, 2024 Juergen Adams
 * Licensed under MIT License.
 */
module.exports = function asciidoctor(options) {
  return {
    // -------------------------------------------------------------------------
    // module initializer
    // -------------------------------------------------------------------------
    init: function (options) {
      var moduleOptions = options;
      var logger = log4javascript.getLogger('j1.core.asciidoctor');
      var moduleDefaults = {
        dummyOption: false // placeholder
      };
      var options = $.extend(moduleDefaults, moduleOptions);
      logText = 'J1 Asciidoctor is being initialized';
      logger.info(logText);
      this.callouts();
    },
    // end initializer

    // -------------------------------------------------------------------------
    // manage callouts (HTML)
    // -------------------------------------------------------------------------
    // see: https://stackoverflow.com/questions/19393493/add-colgroup-for-each-table-column
    callouts: function (options) {
      var colgroupList = '';

      // If the colist does not have a <colgroup> structure
      //
      if ($('.colist > table > colgroup').length == 0) {
        colgroupList += '<!-- [INFO   ] [j1.core.asciidoctor      ] [ place a colgroup dynamically ] -->' + '\n';
        colgroupList += '<colgroup> <col style="width: 5%;"> <col style="width: 95%;"> </colgroup>';
        $(".colist > table").prepend(colgroupList);
      }
    },
    // end callouts

    // -------------------------------------------------------------------------
    // manage callouts (HTML)
    // -------------------------------------------------------------------------
    conums: function (options) {
      var dependencies_met_page_finished = setInterval(function () {
        if (j1.getState() == 'finished') {
          // If the colist does not have a <colgroup> structure
          if ($('.colist > table > colgroup').length == 0) {
            var colgroupList = '';
            colgroupList += '<colgroup> <col style="width: 5%;"> <col style="width: 95%;"> </colgroup>';
            $(".colist > table").prepend(colgroupList);
            clearInterval(dependencies_met_page_finished);
          }
        }
      });
    } // end conums
  }; // END return
}(jQuery);

/***/ }),

/***/ 7196:
/***/ (() => {

/*
 *  jQuery OwlCarousel v1.3.3
 *
 *  Copyright (C) 2013-2016 Bartosz Wojciechowski
 *  http://jekyll.one/owlcarousel/
 *
 *  Licensed under MIT
 *
 */

/*JS Lint helpers: */
/*global dragMove: false, dragEnd: false, $, jQuery, alert, window, document */
/*jslint nomen: true, continue:true */

(function ($, window, document) {
  var Carousel = {
    init: function (options, el) {
      var base = this;
      base.$elem = $(el);
      base.options = $.extend({}, $.fn.owlCarousel.options, base.$elem.data(), options);
      base.userOptions = options;
      base.loadContent();
    },
    loadContent: function () {
      var base = this,
        url;
      function getData(data) {
        var i,
          content = "";
        if (typeof base.options.jsonSuccess === "function") {
          base.options.jsonSuccess.apply(this, [data]);
        } else {
          for (i in data.owl) {
            if (data.owl.hasOwnProperty(i)) {
              content += data.owl[i].item;
            }
          }
          base.$elem.html(content);
        }
        base.logIn();
      }
      if (typeof base.options.beforeInit === "function") {
        base.options.beforeInit.apply(this, [base.$elem]);
      }
      if (typeof base.options.jsonPath === "string") {
        url = base.options.jsonPath;
        $.getJSON(url, getData);
      } else {
        base.logIn();
      }
    },
    logIn: function () {
      var base = this;
      base.$elem.data({
        "owl-originalStyles": base.$elem.attr("style"),
        "owl-originalClasses": base.$elem.attr("class")
      });
      base.$elem.css({
        opacity: 0
      });
      base.orignalItems = base.options.items;
      base.checkBrowser();
      base.wrapperWidth = 0;
      base.checkVisible = null;
      base.setVars();
    },
    setVars: function () {
      var base = this;
      if (base.$elem.children().length === 0) {
        return false;
      }
      base.baseClass();
      base.eventTypes();
      base.$userItems = base.$elem.children();
      base.itemsAmount = base.$userItems.length;
      base.wrapItems();
      base.$owlItems = base.$elem.find(".owl-item");
      base.$owlWrapper = base.$elem.find(".owl-wrapper");
      base.playDirection = "next";
      base.prevItem = 0;
      base.prevArr = [0];
      base.currentItem = 0;
      base.customEvents();
      base.onStartup();
    },
    onStartup: function () {
      var base = this;
      base.updateItems();
      base.calculateAll();
      base.buildControls();
      base.updateControls();
      base.response();
      base.moveEvents();
      base.stopOnHover();
      base.owlStatus();
      if (base.options.transitionStyle !== false) {
        base.transitionTypes(base.options.transitionStyle);
      }
      if (base.options.autoPlay === true) {
        base.options.autoPlay = 5000;
      }
      base.play();
      base.$elem.find(".owl-wrapper").css("display", "block");
      if (!base.$elem.is(":visible")) {
        base.watchVisibility();
      } else {
        base.$elem.css("opacity", 1);
      }
      base.onstartup = false;
      base.eachMoveUpdate();
      if (typeof base.options.afterInit === "function") {
        base.options.afterInit.apply(this, [base.$elem]);
      }
    },
    eachMoveUpdate: function () {
      var base = this;
      if (base.options.lazyLoad === true) {
        base.lazyLoad();
      }
      if (base.options.autoHeight === true) {
        base.autoHeight();
      }
      base.onVisibleItems();
      if (typeof base.options.afterAction === "function") {
        base.options.afterAction.apply(this, [base.$elem]);
      }
    },
    updateVars: function () {
      var base = this;
      if (typeof base.options.beforeUpdate === "function") {
        base.options.beforeUpdate.apply(this, [base.$elem]);
      }
      base.watchVisibility();
      base.updateItems();
      base.calculateAll();
      base.updatePosition();
      base.updateControls();
      base.eachMoveUpdate();
      if (typeof base.options.afterUpdate === "function") {
        base.options.afterUpdate.apply(this, [base.$elem]);
      }
    },
    reload: function () {
      var base = this;
      window.setTimeout(function () {
        base.updateVars();
      }, 0);
    },
    watchVisibility: function () {
      var base = this;
      if (base.$elem.is(":visible") === false) {
        base.$elem.css({
          opacity: 0
        });
        window.clearInterval(base.autoPlayInterval);
        window.clearInterval(base.checkVisible);
      } else {
        return false;
      }
      base.checkVisible = window.setInterval(function () {
        if (base.$elem.is(":visible")) {
          base.reload();
          base.$elem.animate({
            opacity: 1
          }, 200);
          window.clearInterval(base.checkVisible);
        }
      }, 500);
    },
    wrapItems: function () {
      var base = this;
      base.$userItems.wrapAll("<div class=\"owl-wrapper\">").wrap("<div class=\"owl-item\"></div>");
      base.$elem.find(".owl-wrapper").wrap("<div class=\"owl-wrapper-outer\">");
      base.wrapperOuter = base.$elem.find(".owl-wrapper-outer");
      base.$elem.css("display", "block");
    },
    baseClass: function () {
      var base = this,
        hasBaseClass = base.$elem.hasClass(base.options.baseClass),
        hasThemeClass = base.$elem.hasClass(base.options.theme);
      if (!hasBaseClass) {
        base.$elem.addClass(base.options.baseClass);
      }
      if (!hasThemeClass) {
        base.$elem.addClass(base.options.theme);
      }
    },
    updateItems: function () {
      var base = this,
        width,
        i;
      if (base.options.responsive === false) {
        return false;
      }
      if (base.options.singleItem === true) {
        base.options.items = base.orignalItems = 1;
        base.options.itemsCustom = false;
        base.options.itemsDesktop = false;
        base.options.itemsDesktopSmall = false;
        base.options.itemsTablet = false;
        base.options.itemsTabletSmall = false;
        base.options.itemsMobile = false;
        return false;
      }
      width = $(base.options.responsiveBaseWidth).width();
      if (width > (base.options.itemsDesktop[0] || base.orignalItems)) {
        base.options.items = base.orignalItems;
      }
      if (base.options.itemsCustom !== false) {
        //Reorder array by screen size
        base.options.itemsCustom.sort(function (a, b) {
          return a[0] - b[0];
        });
        for (i = 0; i < base.options.itemsCustom.length; i += 1) {
          if (base.options.itemsCustom[i][0] <= width) {
            base.options.items = base.options.itemsCustom[i][1];
          }
        }
      } else {
        if (width <= base.options.itemsDesktop[0] && base.options.itemsDesktop !== false) {
          base.options.items = base.options.itemsDesktop[1];
        }
        if (width <= base.options.itemsDesktopSmall[0] && base.options.itemsDesktopSmall !== false) {
          base.options.items = base.options.itemsDesktopSmall[1];
        }
        if (width <= base.options.itemsTablet[0] && base.options.itemsTablet !== false) {
          base.options.items = base.options.itemsTablet[1];
        }
        if (width <= base.options.itemsTabletSmall[0] && base.options.itemsTabletSmall !== false) {
          base.options.items = base.options.itemsTabletSmall[1];
        }
        if (width <= base.options.itemsMobile[0] && base.options.itemsMobile !== false) {
          base.options.items = base.options.itemsMobile[1];
        }
      }

      //if number of items is less than declared
      if (base.options.items > base.itemsAmount && base.options.itemsScaleUp === true) {
        base.options.items = base.itemsAmount;
      }
    },
    response: function () {
      var base = this,
        smallDelay,
        lastWindowWidth;
      if (base.options.responsive !== true) {
        return false;
      }
      lastWindowWidth = $(window).width();
      base.resizer = function () {
        if ($(window).width() !== lastWindowWidth) {
          if (base.options.autoPlay !== false) {
            window.clearInterval(base.autoPlayInterval);
          }
          window.clearTimeout(smallDelay);
          smallDelay = window.setTimeout(function () {
            lastWindowWidth = $(window).width();
            base.updateVars();
          }, base.options.responsiveRefreshRate);
        }
      };
      $(window).resize(base.resizer);
    },
    updatePosition: function () {
      var base = this;
      base.jumpTo(base.currentItem);
      if (base.options.autoPlay !== false) {
        base.checkAp();
      }
    },
    appendItemsSizes: function () {
      var base = this,
        roundPages = 0,
        lastItem = base.itemsAmount - base.options.items;
      base.$owlItems.each(function (index) {
        var $this = $(this);
        $this.css({
          "width": base.itemWidth
        }).data("owl-item", Number(index));
        if (index % base.options.items === 0 || index === lastItem) {
          if (!(index > lastItem)) {
            roundPages += 1;
          }
        }
        $this.data("owl-roundPages", roundPages);
      });
    },
    appendWrapperSizes: function () {
      var base = this,
        width = base.$owlItems.length * base.itemWidth;
      base.$owlWrapper.css({
        "width": width * 2,
        "left": 0
      });
      base.appendItemsSizes();
    },
    calculateAll: function () {
      var base = this;
      base.calculateWidth();
      base.appendWrapperSizes();
      base.loops();
      base.max();
    },
    calculateWidth: function () {
      var base = this;
      base.itemWidth = Math.round(base.$elem.width() / base.options.items);
    },
    max: function () {
      var base = this,
        maximum = (base.itemsAmount * base.itemWidth - base.options.items * base.itemWidth) * -1;
      if (base.options.items > base.itemsAmount) {
        base.maximumItem = 0;
        maximum = 0;
        base.maximumPixels = 0;
      } else {
        base.maximumItem = base.itemsAmount - base.options.items;
        base.maximumPixels = maximum;
      }
      return maximum;
    },
    min: function () {
      return 0;
    },
    loops: function () {
      var base = this,
        prev = 0,
        elWidth = 0,
        i,
        item,
        roundPageNum;
      base.positionsInArray = [0];
      base.pagesInArray = [];
      for (i = 0; i < base.itemsAmount; i += 1) {
        elWidth += base.itemWidth;
        base.positionsInArray.push(-elWidth);
        if (base.options.scrollPerPage === true) {
          item = $(base.$owlItems[i]);
          roundPageNum = item.data("owl-roundPages");
          if (roundPageNum !== prev) {
            base.pagesInArray[prev] = base.positionsInArray[i];
            prev = roundPageNum;
          }
        }
      }
    },
    buildControls: function () {
      var base = this;
      if (base.options.navigation === true || base.options.pagination === true) {
        base.owlControls = $("<div class=\"owl-controls\"/>").toggleClass("clickable", !base.browser.isTouch).appendTo(base.$elem);
      }
      if (base.options.pagination === true) {
        base.buildPagination();
      }
      if (base.options.navigation === true) {
        base.buildButtons();
      }
    },
    buildButtons: function () {
      var base = this,
        buttonsWrapper = $("<div class=\"owl-buttons\"/>");
      base.owlControls.append(buttonsWrapper);
      base.buttonPrev = $("<div/>", {
        "class": "owl-prev",
        "html": base.options.navigationText[0] || ""
      });
      base.buttonNext = $("<div/>", {
        "class": "owl-next",
        "html": base.options.navigationText[1] || ""
      });
      buttonsWrapper.append(base.buttonPrev).append(base.buttonNext);
      buttonsWrapper.on("touchstart.owlControls mousedown.owlControls", "div[class^=\"owl\"]", function (event) {
        event.preventDefault();
      });
      buttonsWrapper.on("touchend.owlControls mouseup.owlControls", "div[class^=\"owl\"]", function (event) {
        event.preventDefault();
        if ($(this).hasClass("owl-next")) {
          base.next();
        } else {
          base.prev();
        }
      });
    },
    buildPagination: function () {
      var base = this;
      base.paginationWrapper = $("<div class=\"owl-pagination\"/>");
      base.owlControls.append(base.paginationWrapper);
      base.paginationWrapper.on("touchend.owlControls mouseup.owlControls", ".owl-page", function (event) {
        event.preventDefault();
        if (Number($(this).data("owl-page")) !== base.currentItem) {
          base.goTo(Number($(this).data("owl-page")), true);
        }
      });
    },
    updatePagination: function () {
      var base = this,
        counter,
        lastPage,
        lastItem,
        i,
        paginationButton,
        paginationButtonInner;
      if (base.options.pagination === false) {
        return false;
      }
      base.paginationWrapper.html("");
      counter = 0;
      lastPage = base.itemsAmount - base.itemsAmount % base.options.items;
      for (i = 0; i < base.itemsAmount; i += 1) {
        if (i % base.options.items === 0) {
          counter += 1;
          if (lastPage === i) {
            lastItem = base.itemsAmount - base.options.items;
          }
          paginationButton = $("<div/>", {
            "class": "owl-page"
          });
          paginationButtonInner = $("<span></span>", {
            "text": base.options.paginationNumbers === true ? counter : "",
            "class": base.options.paginationNumbers === true ? "owl-numbers" : ""
          });
          paginationButton.append(paginationButtonInner);
          paginationButton.data("owl-page", lastPage === i ? lastItem : i);
          paginationButton.data("owl-roundPages", counter);
          base.paginationWrapper.append(paginationButton);
        }
      }
      base.checkPagination();
    },
    checkPagination: function () {
      var base = this;
      if (base.options.pagination === false) {
        return false;
      }
      base.paginationWrapper.find(".owl-page").each(function () {
        if ($(this).data("owl-roundPages") === $(base.$owlItems[base.currentItem]).data("owl-roundPages")) {
          base.paginationWrapper.find(".owl-page").removeClass("active");
          $(this).addClass("active");
        }
      });
    },
    checkNavigation: function () {
      var base = this;
      if (base.options.navigation === false) {
        return false;
      }
      if (base.options.rewindNav === false) {
        if (base.currentItem === 0 && base.maximumItem === 0) {
          base.buttonPrev.addClass("disabled");
          base.buttonNext.addClass("disabled");
        } else if (base.currentItem === 0 && base.maximumItem !== 0) {
          base.buttonPrev.addClass("disabled");
          base.buttonNext.removeClass("disabled");
        } else if (base.currentItem === base.maximumItem) {
          base.buttonPrev.removeClass("disabled");
          base.buttonNext.addClass("disabled");
        } else if (base.currentItem !== 0 && base.currentItem !== base.maximumItem) {
          base.buttonPrev.removeClass("disabled");
          base.buttonNext.removeClass("disabled");
        }
      }
    },
    updateControls: function () {
      var base = this;
      base.updatePagination();
      base.checkNavigation();
      if (base.owlControls) {
        if (base.options.items >= base.itemsAmount) {
          base.owlControls.hide();
        } else {
          base.owlControls.show();
        }
      }
    },
    destroyControls: function () {
      var base = this;
      if (base.owlControls) {
        base.owlControls.remove();
      }
    },
    next: function (speed) {
      var base = this;
      if (base.isTransition) {
        return false;
      }
      base.currentItem += base.options.scrollPerPage === true ? base.options.items : 1;
      if (base.currentItem > base.maximumItem + (base.options.scrollPerPage === true ? base.options.items - 1 : 0)) {
        if (base.options.rewindNav === true) {
          base.currentItem = 0;
          speed = "rewind";
        } else {
          base.currentItem = base.maximumItem;
          return false;
        }
      }
      base.goTo(base.currentItem, speed);
    },
    prev: function (speed) {
      var base = this;
      if (base.isTransition) {
        return false;
      }
      if (base.options.scrollPerPage === true && base.currentItem > 0 && base.currentItem < base.options.items) {
        base.currentItem = 0;
      } else {
        base.currentItem -= base.options.scrollPerPage === true ? base.options.items : 1;
      }
      if (base.currentItem < 0) {
        if (base.options.rewindNav === true) {
          base.currentItem = base.maximumItem;
          speed = "rewind";
        } else {
          base.currentItem = 0;
          return false;
        }
      }
      base.goTo(base.currentItem, speed);
    },
    goTo: function (position, speed, drag) {
      var base = this,
        goToPixel;
      if (base.isTransition) {
        return false;
      }
      if (typeof base.options.beforeMove === "function") {
        base.options.beforeMove.apply(this, [base.$elem]);
      }
      if (position >= base.maximumItem) {
        position = base.maximumItem;
      } else if (position <= 0) {
        position = 0;
      }
      base.currentItem = base.owl.currentItem = position;
      if (base.options.transitionStyle !== false && drag !== "drag" && base.options.items === 1 && base.browser.support3d === true) {
        base.swapSpeed(0);
        if (base.browser.support3d === true) {
          base.transition3d(base.positionsInArray[position]);
        } else {
          base.css2slide(base.positionsInArray[position], 1);
        }
        base.afterGo();
        base.singleItemTransition();
        return false;
      }
      goToPixel = base.positionsInArray[position];
      if (base.browser.support3d === true) {
        base.isCss3Finish = false;
        if (speed === true) {
          base.swapSpeed("paginationSpeed");
          window.setTimeout(function () {
            base.isCss3Finish = true;
          }, base.options.paginationSpeed);
        } else if (speed === "rewind") {
          base.swapSpeed(base.options.rewindSpeed);
          window.setTimeout(function () {
            base.isCss3Finish = true;
          }, base.options.rewindSpeed);
        } else {
          base.swapSpeed("slideSpeed");
          window.setTimeout(function () {
            base.isCss3Finish = true;
          }, base.options.slideSpeed);
        }
        base.transition3d(goToPixel);
      } else {
        if (speed === true) {
          base.css2slide(goToPixel, base.options.paginationSpeed);
        } else if (speed === "rewind") {
          base.css2slide(goToPixel, base.options.rewindSpeed);
        } else {
          base.css2slide(goToPixel, base.options.slideSpeed);
        }
      }
      base.afterGo();
    },
    jumpTo: function (position) {
      var base = this;
      if (typeof base.options.beforeMove === "function") {
        base.options.beforeMove.apply(this, [base.$elem]);
      }
      if (position >= base.maximumItem || position === -1) {
        position = base.maximumItem;
      } else if (position <= 0) {
        position = 0;
      }
      base.swapSpeed(0);
      if (base.browser.support3d === true) {
        base.transition3d(base.positionsInArray[position]);
      } else {
        base.css2slide(base.positionsInArray[position], 1);
      }
      base.currentItem = base.owl.currentItem = position;
      base.afterGo();
    },
    afterGo: function () {
      var base = this;
      base.prevArr.push(base.currentItem);
      base.prevItem = base.owl.prevItem = base.prevArr[base.prevArr.length - 2];
      base.prevArr.shift(0);
      if (base.prevItem !== base.currentItem) {
        base.checkPagination();
        base.checkNavigation();
        base.eachMoveUpdate();
        if (base.options.autoPlay !== false) {
          base.checkAp();
        }
      }
      if (typeof base.options.afterMove === "function" && base.prevItem !== base.currentItem) {
        base.options.afterMove.apply(this, [base.$elem]);
      }
    },
    stop: function () {
      var base = this;
      base.apStatus = "stop";
      window.clearInterval(base.autoPlayInterval);
    },
    checkAp: function () {
      var base = this;
      if (base.apStatus !== "stop") {
        base.play();
      }
    },
    play: function () {
      var base = this;
      base.apStatus = "play";
      if (base.options.autoPlay === false) {
        return false;
      }
      window.clearInterval(base.autoPlayInterval);
      base.autoPlayInterval = window.setInterval(function () {
        base.next(true);
      }, base.options.autoPlay);
    },
    swapSpeed: function (action) {
      var base = this;
      if (action === "slideSpeed") {
        base.$owlWrapper.css(base.addCssSpeed(base.options.slideSpeed));
      } else if (action === "paginationSpeed") {
        base.$owlWrapper.css(base.addCssSpeed(base.options.paginationSpeed));
      } else if (typeof action !== "string") {
        base.$owlWrapper.css(base.addCssSpeed(action));
      }
    },
    addCssSpeed: function (speed) {
      return {
        "-webkit-transition": "all " + speed + "ms ease",
        "-moz-transition": "all " + speed + "ms ease",
        "-o-transition": "all " + speed + "ms ease",
        "transition": "all " + speed + "ms ease"
      };
    },
    removeTransition: function () {
      return {
        "-webkit-transition": "",
        "-moz-transition": "",
        "-o-transition": "",
        "transition": ""
      };
    },
    doTranslate: function (pixels) {
      return {
        "-webkit-transform": "translate3d(" + pixels + "px, 0px, 0px)",
        "-moz-transform": "translate3d(" + pixels + "px, 0px, 0px)",
        "-o-transform": "translate3d(" + pixels + "px, 0px, 0px)",
        "-ms-transform": "translate3d(" + pixels + "px, 0px, 0px)",
        "transform": "translate3d(" + pixels + "px, 0px,0px)"
      };
    },
    transition3d: function (value) {
      var base = this;
      base.$owlWrapper.css(base.doTranslate(value));
    },
    css2move: function (value) {
      var base = this;
      base.$owlWrapper.css({
        "left": value
      });
    },
    css2slide: function (value, speed) {
      var base = this;
      base.isCssFinish = false;
      base.$owlWrapper.stop(true, true).animate({
        "left": value
      }, {
        duration: speed || base.options.slideSpeed,
        complete: function () {
          base.isCssFinish = true;
        }
      });
    },
    checkBrowser: function () {
      var base = this,
        translate3D = "translate3d(0px, 0px, 0px)",
        tempElem = document.createElement("div"),
        regex,
        asSupport,
        support3d,
        isTouch;
      tempElem.style.cssText = "  -moz-transform:" + translate3D + "; -ms-transform:" + translate3D + "; -o-transform:" + translate3D + "; -webkit-transform:" + translate3D + "; transform:" + translate3D;
      regex = /translate3d\(0px, 0px, 0px\)/g;
      asSupport = tempElem.style.cssText.match(regex);
      support3d = asSupport !== null && asSupport.length === 1;
      isTouch = "ontouchstart" in window || window.navigator.msMaxTouchPoints;
      base.browser = {
        "support3d": support3d,
        "isTouch": isTouch
      };
    },
    moveEvents: function () {
      var base = this;
      if (base.options.mouseDrag !== false || base.options.touchDrag !== false) {
        base.gestures();
        base.disabledEvents();
      }
    },
    eventTypes: function () {
      var base = this,
        types = ["s", "e", "x"];
      base.ev_types = {};
      if (base.options.mouseDrag === true && base.options.touchDrag === true) {
        types = ["touchstart.owl mousedown.owl", "touchmove.owl mousemove.owl", "touchend.owl touchcancel.owl mouseup.owl"];
      } else if (base.options.mouseDrag === false && base.options.touchDrag === true) {
        types = ["touchstart.owl", "touchmove.owl", "touchend.owl touchcancel.owl"];
      } else if (base.options.mouseDrag === true && base.options.touchDrag === false) {
        types = ["mousedown.owl", "mousemove.owl", "mouseup.owl"];
      }
      base.ev_types.start = types[0];
      base.ev_types.move = types[1];
      base.ev_types.end = types[2];
    },
    disabledEvents: function () {
      var base = this;
      base.$elem.on("dragstart.owl", function (event) {
        event.preventDefault();
      });
      base.$elem.on("mousedown.disableTextSelect", function (e) {
        return $(e.target).is('input, textarea, select, option');
      });
    },
    gestures: function () {
      /*jslint unparam: true*/
      var base = this,
        locals = {
          offsetX: 0,
          offsetY: 0,
          baseElWidth: 0,
          relativePos: 0,
          position: null,
          minSwipe: null,
          maxSwipe: null,
          sliding: null,
          dargging: null,
          targetElement: null
        };
      base.isCssFinish = true;
      function getTouches(event) {
        if (event.touches !== undefined) {
          return {
            x: event.touches[0].pageX,
            y: event.touches[0].pageY
          };
        }
        if (event.touches === undefined) {
          if (event.pageX !== undefined) {
            return {
              x: event.pageX,
              y: event.pageY
            };
          }
          if (event.pageX === undefined) {
            return {
              x: event.clientX,
              y: event.clientY
            };
          }
        }
      }
      function swapEvents(type) {
        if (type === "on") {
          $(document).on(base.ev_types.move, dragMove);
          $(document).on(base.ev_types.end, dragEnd);
        } else if (type === "off") {
          $(document).off(base.ev_types.move);
          $(document).off(base.ev_types.end);
        }
      }
      function dragStart(event) {
        var ev = event.originalEvent || event || window.event,
          position;
        if (ev.which === 3) {
          return false;
        }
        if (base.itemsAmount <= base.options.items) {
          return;
        }
        if (base.isCssFinish === false && !base.options.dragBeforeAnimFinish) {
          return false;
        }
        if (base.isCss3Finish === false && !base.options.dragBeforeAnimFinish) {
          return false;
        }
        if (base.options.autoPlay !== false) {
          window.clearInterval(base.autoPlayInterval);
        }
        if (base.browser.isTouch !== true && !base.$owlWrapper.hasClass("grabbing")) {
          base.$owlWrapper.addClass("grabbing");
        }
        base.newPosX = 0;
        base.newRelativeX = 0;
        $(this).css(base.removeTransition());
        position = $(this).position();
        locals.relativePos = position.left;
        locals.offsetX = getTouches(ev).x - position.left;
        locals.offsetY = getTouches(ev).y - position.top;
        swapEvents("on");
        locals.sliding = false;
        locals.targetElement = ev.target || ev.srcElement;
      }
      function dragMove(event) {
        var ev = event.originalEvent || event || window.event,
          minSwipe,
          maxSwipe;
        base.newPosX = getTouches(ev).x - locals.offsetX;
        base.newPosY = getTouches(ev).y - locals.offsetY;
        base.newRelativeX = base.newPosX - locals.relativePos;
        if (typeof base.options.startDragging === "function" && locals.dragging !== true && base.newRelativeX !== 0) {
          locals.dragging = true;
          base.options.startDragging.apply(base, [base.$elem]);
        }
        if ((base.newRelativeX > 8 || base.newRelativeX < -8) && base.browser.isTouch === true) {
          if (ev.preventDefault !== undefined) {
            ev.preventDefault();
          } else {
            ev.returnValue = false;
          }
          locals.sliding = true;
        }
        if ((base.newPosY > 10 || base.newPosY < -10) && locals.sliding === false) {
          $(document).off("touchmove.owl");
        }
        minSwipe = function () {
          return base.newRelativeX / 5;
        };
        maxSwipe = function () {
          return base.maximumPixels + base.newRelativeX / 5;
        };
        base.newPosX = Math.max(Math.min(base.newPosX, minSwipe()), maxSwipe());
        if (base.browser.support3d === true) {
          base.transition3d(base.newPosX);
        } else {
          base.css2move(base.newPosX);
        }
      }
      function dragEnd(event) {
        var ev = event.originalEvent || event || window.event,
          newPosition,
          handlers,
          owlStopEvent;
        ev.target = ev.target || ev.srcElement;
        locals.dragging = false;
        if (base.browser.isTouch !== true) {
          base.$owlWrapper.removeClass("grabbing");
        }
        if (base.newRelativeX < 0) {
          base.dragDirection = base.owl.dragDirection = "left";
        } else {
          base.dragDirection = base.owl.dragDirection = "right";
        }
        if (base.newRelativeX !== 0) {
          newPosition = base.getNewPosition();
          base.goTo(newPosition, false, "drag");
          if (locals.targetElement === ev.target && base.browser.isTouch !== true) {
            $(ev.target).on("click.disable", function (ev) {
              ev.stopImmediatePropagation();
              ev.stopPropagation();
              ev.preventDefault();
              $(ev.target).off("click.disable");
            });
            handlers = $._data(ev.target, "events").click;
            owlStopEvent = handlers.pop();
            handlers.splice(0, 0, owlStopEvent);
          }
        }
        swapEvents("off");
      }
      base.$elem.on(base.ev_types.start, ".owl-wrapper", dragStart);
    },
    getNewPosition: function () {
      var base = this,
        newPosition = base.closestItem();
      if (newPosition > base.maximumItem) {
        base.currentItem = base.maximumItem;
        newPosition = base.maximumItem;
      } else if (base.newPosX >= 0) {
        newPosition = 0;
        base.currentItem = 0;
      }
      return newPosition;
    },
    closestItem: function () {
      var base = this,
        array = base.options.scrollPerPage === true ? base.pagesInArray : base.positionsInArray,
        goal = base.newPosX,
        closest = null;
      $.each(array, function (i, v) {
        if (goal - base.itemWidth / 20 > array[i + 1] && goal - base.itemWidth / 20 < v && base.moveDirection() === "left") {
          closest = v;
          if (base.options.scrollPerPage === true) {
            base.currentItem = $.inArray(closest, base.positionsInArray);
          } else {
            base.currentItem = i;
          }
        } else if (goal + base.itemWidth / 20 < v && goal + base.itemWidth / 20 > (array[i + 1] || array[i] - base.itemWidth) && base.moveDirection() === "right") {
          if (base.options.scrollPerPage === true) {
            closest = array[i + 1] || array[array.length - 1];
            base.currentItem = $.inArray(closest, base.positionsInArray);
          } else {
            closest = array[i + 1];
            base.currentItem = i + 1;
          }
        }
      });
      return base.currentItem;
    },
    moveDirection: function () {
      var base = this,
        direction;
      if (base.newRelativeX < 0) {
        direction = "right";
        base.playDirection = "next";
      } else {
        direction = "left";
        base.playDirection = "prev";
      }
      return direction;
    },
    customEvents: function () {
      /*jslint unparam: true*/
      var base = this;
      base.$elem.on("owl.next", function () {
        base.next();
      });
      base.$elem.on("owl.prev", function () {
        base.prev();
      });
      base.$elem.on("owl.play", function (event, speed) {
        base.options.autoPlay = speed;
        base.play();
        base.hoverStatus = "play";
      });
      base.$elem.on("owl.stop", function () {
        base.stop();
        base.hoverStatus = "stop";
      });
      base.$elem.on("owl.goTo", function (event, item) {
        base.goTo(item);
      });
      base.$elem.on("owl.jumpTo", function (event, item) {
        base.jumpTo(item);
      });
    },
    stopOnHover: function () {
      var base = this;
      if (base.options.stopOnHover === true && base.browser.isTouch !== true && base.options.autoPlay !== false) {
        base.$elem.on("mouseover", function () {
          base.stop();
        });
        base.$elem.on("mouseout", function () {
          if (base.hoverStatus !== "stop") {
            base.play();
          }
        });
      }
    },
    lazyLoad: function () {
      var base = this,
        i,
        $item,
        itemNumber,
        $lazyImg,
        follow;
      if (base.options.lazyLoad === false) {
        return false;
      }
      for (i = 0; i < base.itemsAmount; i += 1) {
        $item = $(base.$owlItems[i]);
        if ($item.data("owl-loaded") === "loaded") {
          continue;
        }
        itemNumber = $item.data("owl-item");
        $lazyImg = $item.find(".lazyOwl");
        if (typeof $lazyImg.data("src") !== "string") {
          $item.data("owl-loaded", "loaded");
          continue;
        }
        if ($item.data("owl-loaded") === undefined) {
          $lazyImg.hide();
          $item.addClass("loading").data("owl-loaded", "checked");
        }
        if (base.options.lazyFollow === true) {
          follow = itemNumber >= base.currentItem;
        } else {
          follow = true;
        }
        if (follow && itemNumber < base.currentItem + base.options.items && $lazyImg.length) {
          $lazyImg.each(function () {
            base.lazyPreload($item, $(this));
          });
        }
      }
    },
    lazyPreload: function ($item, $lazyImg) {
      var base = this,
        iterations = 0,
        isBackgroundImg;
      if ($lazyImg.prop("tagName") === "DIV") {
        $lazyImg.css("background-image", "url(" + $lazyImg.data("src") + ")");
        isBackgroundImg = true;
      } else {
        $lazyImg[0].src = $lazyImg.data("src");
      }
      function showImage() {
        $item.data("owl-loaded", "loaded").removeClass("loading");
        $lazyImg.removeAttr("data-src");
        if (base.options.lazyEffect === "fade") {
          $lazyImg.fadeIn(400);
        } else {
          $lazyImg.show();
        }
        if (typeof base.options.afterLazyLoad === "function") {
          base.options.afterLazyLoad.apply(this, [base.$elem]);
        }
      }
      function checkLazyImage() {
        iterations += 1;
        if (base.completeImg($lazyImg.get(0)) || isBackgroundImg === true) {
          showImage();
        } else if (iterations <= 100) {
          //if image loads in less than 10 seconds
          window.setTimeout(checkLazyImage, 100);
        } else {
          showImage();
        }
      }
      checkLazyImage();
    },
    autoHeight: function () {
      var base = this,
        $currentimg = $(base.$owlItems[base.currentItem]).find("img"),
        iterations;
      function addHeight() {
        var $currentItem = $(base.$owlItems[base.currentItem]).height();
        base.wrapperOuter.css("height", $currentItem + "px");
        if (!base.wrapperOuter.hasClass("autoHeight")) {
          window.setTimeout(function () {
            base.wrapperOuter.addClass("autoHeight");
          }, 0);
        }
      }
      function checkImage() {
        iterations += 1;
        if (base.completeImg($currentimg.get(0))) {
          addHeight();
        } else if (iterations <= 100) {
          //if image loads in less than 10 seconds
          window.setTimeout(checkImage, 100);
        } else {
          base.wrapperOuter.css("height", ""); //Else remove height attribute
        }
      }
      if ($currentimg.get(0) !== undefined) {
        iterations = 0;
        checkImage();
      } else {
        addHeight();
      }
    },
    completeImg: function (img) {
      var naturalWidthType;
      if (!img.complete) {
        return false;
      }
      naturalWidthType = typeof img.naturalWidth;
      if (naturalWidthType !== "undefined" && img.naturalWidth === 0) {
        return false;
      }
      return true;
    },
    onVisibleItems: function () {
      var base = this,
        i;
      if (base.options.addClassActive === true) {
        base.$owlItems.removeClass("active");
      }
      base.visibleItems = [];
      for (i = base.currentItem; i < base.currentItem + base.options.items; i += 1) {
        base.visibleItems.push(i);
        if (base.options.addClassActive === true) {
          $(base.$owlItems[i]).addClass("active");
        }
      }
      base.owl.visibleItems = base.visibleItems;
    },
    transitionTypes: function (className) {
      var base = this;
      //Currently available: "fade", "backSlide", "goDown", "fadeUp"
      base.outClass = "owl-" + className + "-out";
      base.inClass = "owl-" + className + "-in";
    },
    singleItemTransition: function () {
      var base = this,
        outClass = base.outClass,
        inClass = base.inClass,
        $currentItem = base.$owlItems.eq(base.currentItem),
        $prevItem = base.$owlItems.eq(base.prevItem),
        prevPos = Math.abs(base.positionsInArray[base.currentItem]) + base.positionsInArray[base.prevItem],
        origin = Math.abs(base.positionsInArray[base.currentItem]) + base.itemWidth / 2,
        animEnd = 'webkitAnimationEnd oAnimationEnd MSAnimationEnd animationend';
      base.isTransition = true;
      base.$owlWrapper.addClass('owl-origin').css({
        "-webkit-transform-origin": origin + "px",
        "-moz-perspective-origin": origin + "px",
        "perspective-origin": origin + "px"
      });
      function transStyles(prevPos) {
        return {
          "position": "relative",
          "left": prevPos + "px"
        };
      }
      $prevItem.css(transStyles(prevPos, 10)).addClass(outClass).on(animEnd, function () {
        base.endPrev = true;
        $prevItem.off(animEnd);
        base.clearTransStyle($prevItem, outClass);
      });
      $currentItem.addClass(inClass).on(animEnd, function () {
        base.endCurrent = true;
        $currentItem.off(animEnd);
        base.clearTransStyle($currentItem, inClass);
      });
    },
    clearTransStyle: function (item, classToRemove) {
      var base = this;
      item.css({
        "position": "",
        "left": ""
      }).removeClass(classToRemove);
      if (base.endPrev && base.endCurrent) {
        base.$owlWrapper.removeClass('owl-origin');
        base.endPrev = false;
        base.endCurrent = false;
        base.isTransition = false;
      }
    },
    owlStatus: function () {
      var base = this;
      base.owl = {
        "userOptions": base.userOptions,
        "baseElement": base.$elem,
        "userItems": base.$userItems,
        "owlItems": base.$owlItems,
        "currentItem": base.currentItem,
        "prevItem": base.prevItem,
        "visibleItems": base.visibleItems,
        "isTouch": base.browser.isTouch,
        "browser": base.browser,
        "dragDirection": base.dragDirection
      };
    },
    clearEvents: function () {
      var base = this;
      base.$elem.off(".owl owl mousedown.disableTextSelect");
      $(document).off(".owl owl");
      $(window).off("resize", base.resizer);
    },
    unWrap: function () {
      var base = this;
      if (base.$elem.children().length !== 0) {
        base.$owlWrapper.unwrap();
        base.$userItems.unwrap().unwrap();
        if (base.owlControls) {
          base.owlControls.remove();
        }
      }
      base.clearEvents();
      base.$elem.attr({
        style: base.$elem.data("owl-originalStyles") || "",
        class: base.$elem.data("owl-originalClasses")
      });
    },
    destroy: function () {
      var base = this;
      base.stop();
      window.clearInterval(base.checkVisible);
      base.unWrap();
      base.$elem.removeData();
    },
    reinit: function (newOptions) {
      var base = this,
        options = $.extend({}, base.userOptions, newOptions);
      base.unWrap();
      base.init(options, base.$elem);
    },
    addItem: function (htmlString, targetPosition) {
      var base = this,
        position;
      if (!htmlString) {
        return false;
      }
      if (base.$elem.children().length === 0) {
        base.$elem.append(htmlString);
        base.setVars();
        return false;
      }
      base.unWrap();
      if (targetPosition === undefined || targetPosition === -1) {
        position = -1;
      } else {
        position = targetPosition;
      }
      if (position >= base.$userItems.length || position === -1) {
        base.$userItems.eq(-1).after(htmlString);
      } else {
        base.$userItems.eq(position).before(htmlString);
      }
      base.setVars();
    },
    removeItem: function (targetPosition) {
      var base = this,
        position;
      if (base.$elem.children().length === 0) {
        return false;
      }
      if (targetPosition === undefined || targetPosition === -1) {
        position = -1;
      } else {
        position = targetPosition;
      }
      base.unWrap();
      base.$userItems.eq(position).remove();
      base.setVars();
    }
  };
  $.fn.owlCarousel = function (options) {
    return this.each(function () {
      if ($(this).data("owl-init") === true) {
        return false;
      }
      $(this).data("owl-init", true);
      var carousel = Object.create(Carousel);
      carousel.init(options, this);
      $.data(this, "owlCarousel", carousel);
    });
  };
  $.fn.owlCarousel.options = {
    items: 5,
    itemsCustom: false,
    itemsDesktop: [1199, 4],
    itemsDesktopSmall: [979, 3],
    itemsTablet: [768, 2],
    itemsTabletSmall: false,
    itemsMobile: [479, 1],
    singleItem: false,
    itemsScaleUp: false,
    slideSpeed: 200,
    paginationSpeed: 800,
    rewindSpeed: 1000,
    autoPlay: false,
    stopOnHover: false,
    navigation: false,
    navigationText: ["prev", "next"],
    rewindNav: true,
    scrollPerPage: false,
    pagination: true,
    paginationNumbers: false,
    responsive: true,
    responsiveRefreshRate: 200,
    responsiveBaseWidth: window,
    baseClass: "owl-carousel",
    theme: "owl-theme",
    lazyLoad: false,
    lazyFollow: true,
    lazyEffect: "fade",
    autoHeight: false,
    jsonPath: false,
    jsonSuccess: false,
    dragBeforeAnimFinish: true,
    mouseDrag: true,
    touchDrag: true,
    addClassActive: false,
    transitionStyle: false,
    beforeUpdate: false,
    afterUpdate: false,
    beforeInit: false,
    afterInit: false,
    beforeMove: false,
    afterMove: false,
    afterAction: false,
    startDragging: false,
    afterLazyLoad: false
  };
})(jQuery, window, document);

/***/ }),

/***/ 7434:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/*
 # -----------------------------------------------------------------------------
 #  ~/js/j1_template/core.js
 #  Provides an empty object for later loaded core objects
 #
 #  Product/Info:
 #  https://jekyll.one
 #  http://getbootstrap.com/
 #
 #  Copyright (C) 2023, 2024 Juergen Adams
 #
 #  J1 Theme is licensed under MIT License.
 #  See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 # -----------------------------------------------------------------------------
*/


// -----------------------------------------------------------------------------
// ESLint shimming
// -----------------------------------------------------------------------------
/* eslint indent: "off"                                                       */
/* eslint no-unused-vars: "off"                                               */
/* eslint no-undef: "off"                                                     */
// -----------------------------------------------------------------------------

// module.exports = function core ( options ) {
/*!
 * J1 Core
 * Copyright (C) 2023, 2024 Juergen Adams
 * Licensed under MIT License.
 */
module.exports = function (options) {
  const defaultOptions = __webpack_require__(3739);
  const ParseContent = __webpack_require__(8482);
  const parseContent = ParseContent(defaultOptions);

  // ---------------------------------------------------------------------------
  // Global variables
  // ---------------------------------------------------------------------------
  // var messageCatalog  = {};
  // var state;
  // var logger;
  // var logText;

  // ---------------------------------------------------------------------------
  // Default settings
  // ---------------------------------------------------------------------------
  var settings = $.extend({
    foo: 'foo_option',
    bar: 'bar_option'
  }, options);
  var state = 'loaded';
  return {
    // -------------------------------------------------------------------------
    // _init_
    // Global initializer for the core object
    // -------------------------------------------------------------------------
    _init_: function (options) {
      //
      // Place handling of options here
      //

      return;
    },
    // END _init_

    // -------------------------------------------------------------------------
    //  Returns the current (processing) state of the module
    // -------------------------------------------------------------------------
    getState: function () {
      return state;
    },
    // END state

    // -------------------------------------------------------------------------
    // isMobile
    // Return true if the current platform is a mobile device
    // -------------------------------------------------------------------------
    isMobile: function (ua_name) {
      var mobile = false;
      (function (a) {
        if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw-(n|u)|c55\/|capi|ccwa|cdm|cell|chtm|cldc|cmd|co(mp|nd)|craw|da(it|ll|ng)|dbte|dcs|devi|dica|dmob|do(c|p)o|ds(12|d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(|_)|g1 u|g560|gene|gf5|gmo|go(\.w|od)|gr(ad|un)|haie|hcit|hd(m|p|t)|hei|hi(pt|ta)|hp( i|ip)|hsc|ht(c(| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i(20|go|ma)|i230|iac( ||\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|[a-w])|libw|lynx|m1w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|mcr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|([1-8]|c))|phil|pire|pl(ay|uc)|pn2|po(ck|rt|se)|prox|psio|ptg|qaa|qc(07|12|21|32|60|[2-7]|i)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h|oo|p)|sdk\/|se(c(|0|1)|47|mc|nd|ri)|sgh|shar|sie(|m)|sk0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h|v|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl|tdg|tel(i|m)|tim|tmo|to(pl|sh)|ts(70|m|m3|m5)|tx9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas|your|zeto|zte/i.test(a.substr(0, 4))) mobile = true;
      })(navigator.userAgent || navigator.vendor || window.opera);
      return mobile;
    },
    // END isMobile

    // -------------------------------------------------------------------------
    // Clear button for input fields (forms)
    // -------------------------------------------------------------------------
    bsFormClearButton: function () {
      //    $('.position-relative :input').on('keydown focus', function() {
      $(':input').on('keydown focus change mouseover', function () {
        if ($(this).val().length > 0) {
          $(this).nextAll('.form-clear').removeClass('d-none');
        }
      }).on('keydown keyup blur', function () {
        if ($(this).val().length === 0) {
          $(this).nextAll('.form-clear').addClass('d-none');
        }
      });

      // $('.form-clear').on('click', function() {
      //   $(this).addClass('d-none').prevAll(':input').val('');
      //   // hide|clear results from top search
      //   $('#search-results').hide();
      //   $('#search-results').html('');
      // });
    },
    // END bsFormClearButton

    // -------------------------------------------------------------------------
    // Initialize Backdrops on all <p> elements of class "dropcap"
    // -------------------------------------------------------------------------
    createDropCap: function () {
      // add class dropcap
      $('.paragraph.dropcap').children('p').addClass('dropcap');

      //
      if ($('p.dropcap').length) {
        $('p.dropcap').each(function () {
          var $p = $(this);
          var text = $.trim($p.text());
          var firstLetter = text[0];
          var marginalDropCap = '<span class="j1-dropcap">' + firstLetter + '</span>';
          $p.html(text.replace(firstLetter, marginalDropCap));
        });
      }
    },
    // END createDropCap

    // -------------------------------------------------------------------------
    // Initialize Backdrops on all <p> elements of class "dropcap"
    // -------------------------------------------------------------------------
    parseHeadings: function () {
      var headings = parseContent.selectHeadings('.js-toc-content', 'h2, h3, h4, h5, h6');
      return headings;
    } // END parseContent

    // parseContent.selectHeadings(
    //   defaultOptions.contentSelector,
    //   defaultOptions.headingSelector
    // );
  }; // end return (object)

  //})( jQuery, window );
}(); // END IFFE

/***/ }),

/***/ 3739:
/***/ ((module) => {

// -----------------------------------------------------------------------------
// ESLint shimming
// -----------------------------------------------------------------------------
/* eslint indent: "off"                                                       */
/* eslint no-undef: "off"                                                     */
/* eslint no-unused-vars: "off"                                               */
// -----------------------------------------------------------------------------

module.exports = {
  // Where to render the table of contents.
  tocSelector: '.js-toc',
  // Where to grab the headings to build the table of contents.
  contentSelector: '.js-toc-content',
  // Which headings to grab inside of the contentSelector element.
  headingSelector: 'h2, h3, h4, h5, h6',
  // Headings that match the ignoreSelector will be skipped.
  ignoreSelector: '.notoc',
  // For headings inside relative or absolute positioned containers within content
  hasInnerContainers: false,
  // Main class to add to links.
  linkClass: 'toc-link',
  // Extra classes to add to links.
  extraLinkClasses: '',
  // Class to add to active links,
  // the link corresponding to the top most heading on the page.
  activeLinkClass: 'is-active-link',
  // Main class to add to lists.
  listClass: 'toc-list',
  // Extra classes to add to lists.
  extraListClasses: '',
  // Class that gets added when a list should be collapsed.
  isCollapsedClass: 'is-collapsed',
  // Class that gets added when a list should be able
  // to be collapsed but isn't necessarily collapsed.
  collapsibleClass: 'is-collapsible',
  // Class to add to list items.
  listItemClass: 'toc-list-item',
  // Class to add to active list items.
  activeListItemClass: 'is-active-li',
  // How many heading levels should not be collapsed.
  // For example, number 6 will show everything since
  // there are only 6 heading levels and number 0 will collapse them all.
  // The sections that are hidden will open
  // and close as you scroll to headings within them.
  collapseDepth: 3,
  // Smooth scrolling enabled.
  scrollSmooth: true,
  // Smooth scroll duration.
  scrollSmoothDuration: 300,
  // Smooth scroll offset.
  scrollSmoothOffset: 0,
  // Callback for scroll end.
  scrollEndCallback: function (e) {},
  // Headings offset between the headings and the top of the document (this is meant for minor adjustments).
  headingsOffset: 1,
  // Timeout between events firing to make sure it's
  // not too rapid (for performance reasons).
  throttleTimeout: 150,
  // Element to add the positionFixedClass to.
  positionFixedSelector: null,
  // Fixed position class to add to make sidebar fixed after scrolling
  // down past the fixedSidebarOffset.
  positionFixedClass: 'is-position-fixed',
  // fixedSidebarOffset can be any number but by default is set
  // to auto which sets the fixedSidebarOffset to the sidebar
  // element's offsetTop from the top of the document on init.
  fixedSidebarOffset: 'auto',
  // includeHtml can be set to true to include the HTML markup from the
  // heading node instead of just including the textContent.
  includeHtml: false,
  // onclick function to apply to all links in toc. will be called with
  // the event as the first parameter, and this can be used to stop,
  // propagation, prevent default or perform action
  onClick: function (e) {},
  // orderedList can be set to false to generate unordered lists (ul)
  // instead of ordered lists (ol)
  orderedList: true,
  // If there is a fixed article scroll container, set to calculate titles' offset
  scrollContainer: null,
  // prevent ToC DOM rendering if it's already rendered by an external system
  skipRendering: false,
  // Optional callback to change heading labels.
  // For example it can be used to cut down and put ellipses on multiline headings you deem too long.
  // Called each time a heading is parsed. Expects a string in return, the modified label to display.
  // function (string) => string
  headingLabelCallback: false,
  // ignore headings that are hidden in DOM
  ignoreHiddenElements: false,
  // Optional callback to modify properties of parsed headings.
  // The heading element is passed in node parameter and information parsed by default parser is provided in obj parameter.
  // Function has to return the same or modified obj.
  // The heading will be excluded from TOC if nothing is returned.
  // function (object, HTMLElement) => object | void
  headingObjectCallback: null,
  // Set the base path, useful if you use a `base` tag in `head`.
  basePath: '',
  // Only takes affect when `tocSelector` is scrolling,
  // keep the toc scroll position in sync with the content.
  disableTocScrollSync: false
};

/***/ }),

/***/ 8482:
/***/ ((module) => {

/**
 * This file is responsible for parsing the content from the DOM and making
 * sure data is nested properly.
 *
 * @author Tim Scanlin
 */

// -----------------------------------------------------------------------------
// ESLint shimming
// -----------------------------------------------------------------------------
/* eslint indent: "off"                                                       */
/* eslint no-undef: "off"                                                     */
/* eslint semi: "off"                                                         */
// -----------------------------------------------------------------------------

module.exports = function parseContent(options) {
  var reduce = [].reduce;

  /**
   * Get the last item in an array and return a reference to it.
   * @param {Array} array
   * @return {Object}
   */
  function getLastItem(array) {
    return array[array.length - 1];
  }

  /**
   * Get heading level for a heading dom node.
   * @param {HTMLElement} heading
   * @return {Number}
   */
  function getHeadingLevel(heading) {
    return +heading.nodeName.split('H').join('');
  }

  /**
   * Get important properties from a heading element and store in a plain object.
   * @param {HTMLElement} heading
   * @return {Object}
   */
  function getHeadingObject(heading) {
    // each node is processed twice by this method because nestHeadingsArray() and addNode() calls it
    // first time heading is real DOM node element, second time it is obj
    // that is causing problem so I am processing only original DOM node
    if (!(heading instanceof window.HTMLElement)) return heading;
    if (options.ignoreHiddenElements && (!heading.offsetHeight || !heading.offsetParent)) {
      return null;
    }
    var obj = {
      id: heading.id,
      children: [],
      nodeName: heading.nodeName,
      headingLevel: getHeadingLevel(heading),
      textContent: options.headingLabelCallback ? String(options.headingLabelCallback(heading.textContent)) : heading.textContent.trim()
    };
    if (options.includeHtml) {
      obj.childNodes = heading.childNodes;
    }
    if (options.headingObjectCallback) {
      return options.headingObjectCallback(obj, heading);
    }
    return obj;
  }

  /**
   * Add a node to the nested array.
   * @param {Object} node
   * @param {Array} nest
   * @return {Array}
   */
  function addNode(node, nest) {
    var obj = getHeadingObject(node);
    var level = obj.headingLevel;
    var array = nest;
    var lastItem = getLastItem(array);
    var lastItemLevel = lastItem ? lastItem.headingLevel : 0;
    var counter = level - lastItemLevel;
    while (counter > 0) {
      lastItem = getLastItem(array);
      if (lastItem && lastItem.children !== undefined) {
        array = lastItem.children;
      }
      counter--;
    }
    if (level >= options.collapseDepth) {
      obj.isCollapsed = true;
    }
    array.push(obj);
    return array;
  }

  /**
   * Select headings in content area, exclude any selector in options.ignoreSelector
   * @param {String} contentSelector
   * @param {Array} headingSelector
   * @return {Array}
   */
  function selectHeadings(contentSelector, headingSelector) {
    var selectors = headingSelector;
    if (options.ignoreSelector) {
      selectors = headingSelector.split(',').map(function mapSelectors(selector) {
        return selector.trim() + ':not(' + options.ignoreSelector + ')';
      });
    }
    try {
      return document.querySelector(contentSelector).querySelectorAll(selectors);
    } catch (e) {
      console.warn('Element not found: ' + contentSelector); // eslint-disable-line
      return null;
    }
  }

  /**
   * Nest headings array into nested arrays with 'children' property.
   * @param {Array} headingsArray
   * @return {Object}
   */
  function nestHeadingsArray(headingsArray) {
    return reduce.call(headingsArray, function reducer(prev, curr) {
      var currentHeading = getHeadingObject(curr);
      if (currentHeading) {
        addNode(currentHeading, prev.nest);
      }
      return prev;
    }, {
      nest: []
    });
  }
  return {
    nestHeadingsArray: nestHeadingsArray,
    selectHeadings: selectHeadings
  };
};

/***/ }),

/***/ 3950:
/***/ ((module) => {

(function (f) {
  if (true) {
    module.exports = f();
  } else { var g; }
})(function () {
  var define, module, exports;
  return function () {
    function r(e, n, t) {
      function o(i, f) {
        if (!n[i]) {
          if (!e[i]) {
            var c = undefined;
            if (!f && c) return require(i, !0);
            if (u) return u(i, !0);
            var a = new Error("Cannot find module '" + i + "'");
            throw a.code = "MODULE_NOT_FOUND", a;
          }
          var p = n[i] = {
            exports: {}
          };
          e[i][0].call(p.exports, function (r) {
            var n = e[i][1][r];
            return o(n || r);
          }, p, p.exports, r, e, n, t);
        }
        return n[i].exports;
      }
      for (var u = undefined, i = 0; i < t.length; i++) o(t[i]);
      return o;
    }
    return r;
  }()({
    1: [function (require, module, exports) {
      /*
       * EJS Embedded JavaScript templates
       * Copyright 2112 Matthew Eernisse (mde@fleegix.org)
       *
       * Licensed under the Apache License, Version 2.0 (the "License");
       * you may not use this file except in compliance with the License.
       * You may obtain a copy of the License at
       *
       *         http://www.apache.org/licenses/LICENSE-2.0
       *
       * Unless required by applicable law or agreed to in writing, software
       * distributed under the License is distributed on an "AS IS" BASIS,
       * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
       * See the License for the specific language governing permissions and
       * limitations under the License.
       *
      */

      'use strict';

      /**
       * @file Embedded JavaScript templating engine. {@link http://ejs.co}
       * @author Matthew Eernisse <mde@fleegix.org>
       * @author Tiancheng "Timothy" Gu <timothygu99@gmail.com>
       * @project EJS
       * @license {@link http://www.apache.org/licenses/LICENSE-2.0 Apache License, Version 2.0}
       */

      /**
       * EJS internal functions.
       *
       * Technically this "module" lies in the same file as {@link module:ejs}, for
       * the sake of organization all the private functions re grouped into this
       * module.
       *
       * @module ejs-internal
       * @private
       */

      /**
       * Embedded JavaScript templating engine.
       *
       * @module ejs
       * @public
       */
      var fs = require('fs');
      var path = require('path');
      var utils = require('./utils');
      var scopeOptionWarned = false;
      /** @type {string} */
      var _VERSION_STRING = require('../package.json').version;
      var _DEFAULT_OPEN_DELIMITER = '<';
      var _DEFAULT_CLOSE_DELIMITER = '>';
      var _DEFAULT_DELIMITER = '%';
      var _DEFAULT_LOCALS_NAME = 'locals';
      var _NAME = 'ejs';
      var _REGEX_STRING = '(<%%|%%>|<%=|<%-|<%_|<%#|<%|%>|-%>|_%>)';
      var _OPTS_PASSABLE_WITH_DATA = ['delimiter', 'scope', 'context', 'debug', 'compileDebug', 'client', '_with', 'rmWhitespace', 'strict', 'filename', 'async'];
      // We don't allow 'cache' option to be passed in the data obj for
      // the normal `render` call, but this is where Express 2 & 3 put it
      // so we make an exception for `renderFile`
      var _OPTS_PASSABLE_WITH_DATA_EXPRESS = _OPTS_PASSABLE_WITH_DATA.concat('cache');
      var _BOM = /^\uFEFF/;
      var _JS_IDENTIFIER = /^[a-zA-Z_$][0-9a-zA-Z_$]*$/;

      /**
       * EJS template function cache. This can be a LRU object from lru-cache NPM
       * module. By default, it is {@link module:utils.cache}, a simple in-process
       * cache that grows continuously.
       *
       * @type {Cache}
       */

      exports.cache = utils.cache;

      /**
       * Custom file loader. Useful for template preprocessing or restricting access
       * to a certain part of the filesystem.
       *
       * @type {fileLoader}
       */

      exports.fileLoader = fs.readFileSync;

      /**
       * Name of the object containing the locals.
       *
       * This variable is overridden by {@link Options}`.localsName` if it is not
       * `undefined`.
       *
       * @type {String}
       * @public
       */

      exports.localsName = _DEFAULT_LOCALS_NAME;

      /**
       * Promise implementation -- defaults to the native implementation if available
       * This is mostly just for testability
       *
       * @type {PromiseConstructorLike}
       * @public
       */

      exports.promiseImpl = new Function('return this;')().Promise;

      /**
       * Get the path to the included file from the parent file path and the
       * specified path.
       *
       * @param {String}  name     specified path
       * @param {String}  filename parent file path
       * @param {Boolean} [isDir=false] whether the parent file path is a directory
       * @return {String}
       */
      exports.resolveInclude = function (name, filename, isDir) {
        var dirname = path.dirname;
        var extname = path.extname;
        var resolve = path.resolve;
        var includePath = resolve(isDir ? filename : dirname(filename), name);
        var ext = extname(name);
        if (!ext) {
          includePath += '.ejs';
        }
        return includePath;
      };

      /**
       * Try to resolve file path on multiple directories
       *
       * @param  {String}        name  specified path
       * @param  {Array<String>} paths list of possible parent directory paths
       * @return {String}
       */
      function resolvePaths(name, paths) {
        var filePath;
        if (paths.some(function (v) {
          filePath = exports.resolveInclude(name, v, true);
          return fs.existsSync(filePath);
        })) {
          return filePath;
        }
      }

      /**
       * Get the path to the included file by Options
       *
       * @param  {String}  path    specified path
       * @param  {Options} options compilation options
       * @return {String}
       */
      function getIncludePath(path, options) {
        var includePath;
        var filePath;
        var views = options.views;
        var match = /^[A-Za-z]+:\\|^\//.exec(path);

        // Abs path
        if (match && match.length) {
          path = path.replace(/^\/*/, '');
          if (Array.isArray(options.root)) {
            includePath = resolvePaths(path, options.root);
          } else {
            includePath = exports.resolveInclude(path, options.root || '/', true);
          }
        }
        // Relative paths
        else {
          // Look relative to a passed filename first
          if (options.filename) {
            filePath = exports.resolveInclude(path, options.filename);
            if (fs.existsSync(filePath)) {
              includePath = filePath;
            }
          }
          // Then look in any views directories
          if (!includePath && Array.isArray(views)) {
            includePath = resolvePaths(path, views);
          }
          if (!includePath && typeof options.includer !== 'function') {
            throw new Error('Could not find the include file "' + options.escapeFunction(path) + '"');
          }
        }
        return includePath;
      }

      /**
       * Get the template from a string or a file, either compiled on-the-fly or
       * read from cache (if enabled), and cache the template if needed.
       *
       * If `template` is not set, the file specified in `options.filename` will be
       * read.
       *
       * If `options.cache` is true, this function reads the file from
       * `options.filename` so it must be set prior to calling this function.
       *
       * @memberof module:ejs-internal
       * @param {Options} options   compilation options
       * @param {String} [template] template source
       * @return {(TemplateFunction|ClientFunction)}
       * Depending on the value of `options.client`, either type might be returned.
       * @static
       */

      function handleCache(options, template) {
        var func;
        var filename = options.filename;
        var hasTemplate = arguments.length > 1;
        if (options.cache) {
          if (!filename) {
            throw new Error('cache option requires a filename');
          }
          func = exports.cache.get(filename);
          if (func) {
            return func;
          }
          if (!hasTemplate) {
            template = fileLoader(filename).toString().replace(_BOM, '');
          }
        } else if (!hasTemplate) {
          // istanbul ignore if: should not happen at all
          if (!filename) {
            throw new Error('Internal EJS error: no file name or template ' + 'provided');
          }
          template = fileLoader(filename).toString().replace(_BOM, '');
        }
        func = exports.compile(template, options);
        if (options.cache) {
          exports.cache.set(filename, func);
        }
        return func;
      }

      /**
       * Try calling handleCache with the given options and data and call the
       * callback with the result. If an error occurs, call the callback with
       * the error. Used by renderFile().
       *
       * @memberof module:ejs-internal
       * @param {Options} options    compilation options
       * @param {Object} data        template data
       * @param {RenderFileCallback} cb callback
       * @static
       */

      function tryHandleCache(options, data, cb) {
        var result;
        if (!cb) {
          if (typeof exports.promiseImpl == 'function') {
            return new exports.promiseImpl(function (resolve, reject) {
              try {
                result = handleCache(options)(data);
                resolve(result);
              } catch (err) {
                reject(err);
              }
            });
          } else {
            throw new Error('Please provide a callback function');
          }
        } else {
          try {
            result = handleCache(options)(data);
          } catch (err) {
            return cb(err);
          }
          cb(null, result);
        }
      }

      /**
       * fileLoader is independent
       *
       * @param {String} filePath ejs file path.
       * @return {String} The contents of the specified file.
       * @static
       */

      function fileLoader(filePath) {
        return exports.fileLoader(filePath);
      }

      /**
       * Get the template function.
       *
       * If `options.cache` is `true`, then the template is cached.
       *
       * @memberof module:ejs-internal
       * @param {String}  path    path for the specified file
       * @param {Options} options compilation options
       * @return {(TemplateFunction|ClientFunction)}
       * Depending on the value of `options.client`, either type might be returned
       * @static
       */

      function includeFile(path, options) {
        var opts = utils.shallowCopy(utils.createNullProtoObjWherePossible(), options);
        opts.filename = getIncludePath(path, opts);
        if (typeof options.includer === 'function') {
          var includerResult = options.includer(path, opts.filename);
          if (includerResult) {
            if (includerResult.filename) {
              opts.filename = includerResult.filename;
            }
            if (includerResult.template) {
              return handleCache(opts, includerResult.template);
            }
          }
        }
        return handleCache(opts);
      }

      /**
       * Re-throw the given `err` in context to the `str` of ejs, `filename`, and
       * `lineno`.
       *
       * @implements {RethrowCallback}
       * @memberof module:ejs-internal
       * @param {Error}  err      Error object
       * @param {String} str      EJS source
       * @param {String} flnm     file name of the EJS file
       * @param {Number} lineno   line number of the error
       * @param {EscapeCallback} esc
       * @static
       */

      function rethrow(err, str, flnm, lineno, esc) {
        var lines = str.split('\n');
        var start = Math.max(lineno - 3, 0);
        var end = Math.min(lines.length, lineno + 3);
        var filename = esc(flnm);
        // Error context
        var context = lines.slice(start, end).map(function (line, i) {
          var curr = i + start + 1;
          return (curr == lineno ? ' >> ' : '    ') + curr + '| ' + line;
        }).join('\n');

        // Alter exception message
        err.path = filename;
        err.message = (filename || 'ejs') + ':' + lineno + '\n' + context + '\n\n' + err.message;
        throw err;
      }
      function stripSemi(str) {
        return str.replace(/;(\s*$)/, '$1');
      }

      /**
       * Compile the given `str` of ejs into a template function.
       *
       * @param {String}  template EJS template
       *
       * @param {Options} [opts] compilation options
       *
       * @return {(TemplateFunction|ClientFunction)}
       * Depending on the value of `opts.client`, either type might be returned.
       * Note that the return type of the function also depends on the value of `opts.async`.
       * @public
       */

      exports.compile = function compile(template, opts) {
        var templ;

        // v1 compat
        // 'scope' is 'context'
        // FIXME: Remove this in a future version
        if (opts && opts.scope) {
          if (!scopeOptionWarned) {
            console.warn('`scope` option is deprecated and will be removed in EJS 3');
            scopeOptionWarned = true;
          }
          if (!opts.context) {
            opts.context = opts.scope;
          }
          delete opts.scope;
        }
        templ = new Template(template, opts);
        return templ.compile();
      };

      /**
       * Render the given `template` of ejs.
       *
       * If you would like to include options but not data, you need to explicitly
       * call this function with `data` being an empty object or `null`.
       *
       * @param {String}   template EJS template
       * @param {Object}  [data={}] template data
       * @param {Options} [opts={}] compilation and rendering options
       * @return {(String|Promise<String>)}
       * Return value type depends on `opts.async`.
       * @public
       */

      exports.render = function (template, d, o) {
        var data = d || utils.createNullProtoObjWherePossible();
        var opts = o || utils.createNullProtoObjWherePossible();

        // No options object -- if there are optiony names
        // in the data, copy them to options
        if (arguments.length == 2) {
          utils.shallowCopyFromList(opts, data, _OPTS_PASSABLE_WITH_DATA);
        }
        return handleCache(opts, template)(data);
      };

      /**
       * Render an EJS file at the given `path` and callback `cb(err, str)`.
       *
       * If you would like to include options but not data, you need to explicitly
       * call this function with `data` being an empty object or `null`.
       *
       * @param {String}             path     path to the EJS file
       * @param {Object}            [data={}] template data
       * @param {Options}           [opts={}] compilation and rendering options
       * @param {RenderFileCallback} cb callback
       * @public
       */

      exports.renderFile = function () {
        var args = Array.prototype.slice.call(arguments);
        var filename = args.shift();
        var cb;
        var opts = {
          filename: filename
        };
        var data;
        var viewOpts;

        // Do we have a callback?
        if (typeof arguments[arguments.length - 1] == 'function') {
          cb = args.pop();
        }
        // Do we have data/opts?
        if (args.length) {
          // Should always have data obj
          data = args.shift();
          // Normal passed opts (data obj + opts obj)
          if (args.length) {
            // Use shallowCopy so we don't pollute passed in opts obj with new vals
            utils.shallowCopy(opts, args.pop());
          }
          // Special casing for Express (settings + opts-in-data)
          else {
            // Express 3 and 4
            if (data.settings) {
              // Pull a few things from known locations
              if (data.settings.views) {
                opts.views = data.settings.views;
              }
              if (data.settings['view cache']) {
                opts.cache = true;
              }
              // Undocumented after Express 2, but still usable, esp. for
              // items that are unsafe to be passed along with data, like `root`
              viewOpts = data.settings['view options'];
              if (viewOpts) {
                utils.shallowCopy(opts, viewOpts);
              }
            }
            // Express 2 and lower, values set in app.locals, or people who just
            // want to pass options in their data. NOTE: These values will override
            // anything previously set in settings  or settings['view options']
            utils.shallowCopyFromList(opts, data, _OPTS_PASSABLE_WITH_DATA_EXPRESS);
          }
          opts.filename = filename;
        } else {
          data = utils.createNullProtoObjWherePossible();
        }
        return tryHandleCache(opts, data, cb);
      };

      /**
       * Clear intermediate JavaScript cache. Calls {@link Cache#reset}.
       * @public
       */

      /**
       * EJS template class
       * @public
       */
      exports.Template = Template;
      exports.clearCache = function () {
        exports.cache.reset();
      };
      function Template(text, optsParam) {
        var opts = utils.hasOwnOnlyObject(optsParam);
        var options = utils.createNullProtoObjWherePossible();
        this.templateText = text;
        /** @type {string | null} */
        this.mode = null;
        this.truncate = false;
        this.currentLine = 1;
        this.source = '';
        options.client = opts.client || false;
        options.escapeFunction = opts.escape || opts.escapeFunction || utils.escapeXML;
        options.compileDebug = opts.compileDebug !== false;
        options.debug = !!opts.debug;
        options.filename = opts.filename;
        options.openDelimiter = opts.openDelimiter || exports.openDelimiter || _DEFAULT_OPEN_DELIMITER;
        options.closeDelimiter = opts.closeDelimiter || exports.closeDelimiter || _DEFAULT_CLOSE_DELIMITER;
        options.delimiter = opts.delimiter || exports.delimiter || _DEFAULT_DELIMITER;
        options.strict = opts.strict || false;
        options.context = opts.context;
        options.cache = opts.cache || false;
        options.rmWhitespace = opts.rmWhitespace;
        options.root = opts.root;
        options.includer = opts.includer;
        options.outputFunctionName = opts.outputFunctionName;
        options.localsName = opts.localsName || exports.localsName || _DEFAULT_LOCALS_NAME;
        options.views = opts.views;
        options.async = opts.async;
        options.destructuredLocals = opts.destructuredLocals;
        options.legacyInclude = typeof opts.legacyInclude != 'undefined' ? !!opts.legacyInclude : true;
        if (options.strict) {
          options._with = false;
        } else {
          options._with = typeof opts._with != 'undefined' ? opts._with : true;
        }
        this.opts = options;
        this.regex = this.createRegex();
      }
      Template.modes = {
        EVAL: 'eval',
        ESCAPED: 'escaped',
        RAW: 'raw',
        COMMENT: 'comment',
        LITERAL: 'literal'
      };
      Template.prototype = {
        createRegex: function () {
          var str = _REGEX_STRING;
          var delim = utils.escapeRegExpChars(this.opts.delimiter);
          var open = utils.escapeRegExpChars(this.opts.openDelimiter);
          var close = utils.escapeRegExpChars(this.opts.closeDelimiter);
          str = str.replace(/%/g, delim).replace(/</g, open).replace(/>/g, close);
          return new RegExp(str);
        },
        compile: function () {
          /** @type {string} */
          var src;
          /** @type {ClientFunction} */
          var fn;
          var opts = this.opts;
          var prepended = '';
          var appended = '';
          /** @type {EscapeCallback} */
          var escapeFn = opts.escapeFunction;
          /** @type {FunctionConstructor} */
          var ctor;
          /** @type {string} */
          var sanitizedFilename = opts.filename ? JSON.stringify(opts.filename) : 'undefined';
          if (!this.source) {
            this.generateSource();
            prepended += '  var __output = "";\n' + '  function __append(s) { if (s !== undefined && s !== null) __output += s }\n';
            if (opts.outputFunctionName) {
              if (!_JS_IDENTIFIER.test(opts.outputFunctionName)) {
                throw new Error('outputFunctionName is not a valid JS identifier.');
              }
              prepended += '  var ' + opts.outputFunctionName + ' = __append;' + '\n';
            }
            if (opts.localsName && !_JS_IDENTIFIER.test(opts.localsName)) {
              throw new Error('localsName is not a valid JS identifier.');
            }
            if (opts.destructuredLocals && opts.destructuredLocals.length) {
              var destructuring = '  var __locals = (' + opts.localsName + ' || {}),\n';
              for (var i = 0; i < opts.destructuredLocals.length; i++) {
                var name = opts.destructuredLocals[i];
                if (!_JS_IDENTIFIER.test(name)) {
                  throw new Error('destructuredLocals[' + i + '] is not a valid JS identifier.');
                }
                if (i > 0) {
                  destructuring += ',\n  ';
                }
                destructuring += name + ' = __locals.' + name;
              }
              prepended += destructuring + ';\n';
            }
            if (opts._with !== false) {
              prepended += '  with (' + opts.localsName + ' || {}) {' + '\n';
              appended += '  }' + '\n';
            }
            appended += '  return __output;' + '\n';
            this.source = prepended + this.source + appended;
          }
          if (opts.compileDebug) {
            src = 'var __line = 1' + '\n' + '  , __lines = ' + JSON.stringify(this.templateText) + '\n' + '  , __filename = ' + sanitizedFilename + ';' + '\n' + 'try {' + '\n' + this.source + '} catch (e) {' + '\n' + '  rethrow(e, __lines, __filename, __line, escapeFn);' + '\n' + '}' + '\n';
          } else {
            src = this.source;
          }
          if (opts.client) {
            src = 'escapeFn = escapeFn || ' + escapeFn.toString() + ';' + '\n' + src;
            if (opts.compileDebug) {
              src = 'rethrow = rethrow || ' + rethrow.toString() + ';' + '\n' + src;
            }
          }
          if (opts.strict) {
            src = '"use strict";\n' + src;
          }
          if (opts.debug) {
            console.log(src);
          }
          if (opts.compileDebug && opts.filename) {
            src = src + '\n' + '//# sourceURL=' + sanitizedFilename + '\n';
          }
          try {
            if (opts.async) {
              // Have to use generated function for this, since in envs without support,
              // it breaks in parsing
              try {
                ctor = new Function('return (async function(){}).constructor;')();
              } catch (e) {
                if (e instanceof SyntaxError) {
                  throw new Error('This environment does not support async/await');
                } else {
                  throw e;
                }
              }
            } else {
              ctor = Function;
            }
            fn = new ctor(opts.localsName + ', escapeFn, include, rethrow', src);
          } catch (e) {
            // istanbul ignore else
            if (e instanceof SyntaxError) {
              if (opts.filename) {
                e.message += ' in ' + opts.filename;
              }
              e.message += ' while compiling ejs\n\n';
              e.message += 'If the above error is not helpful, you may want to try EJS-Lint:\n';
              e.message += 'https://github.com/RyanZim/EJS-Lint';
              if (!opts.async) {
                e.message += '\n';
                e.message += 'Or, if you meant to create an async function, pass `async: true` as an option.';
              }
            }
            throw e;
          }

          // Return a callable function which will execute the function
          // created by the source-code, with the passed data as locals
          // Adds a local `include` function which allows full recursive include
          var returnedFn = opts.client ? fn : function anonymous(data) {
            var include = function (path, includeData) {
              var d = utils.shallowCopy(utils.createNullProtoObjWherePossible(), data);
              if (includeData) {
                d = utils.shallowCopy(d, includeData);
              }
              return includeFile(path, opts)(d);
            };
            return fn.apply(opts.context, [data || utils.createNullProtoObjWherePossible(), escapeFn, include, rethrow]);
          };
          if (opts.filename && typeof Object.defineProperty === 'function') {
            var filename = opts.filename;
            var basename = path.basename(filename, path.extname(filename));
            try {
              Object.defineProperty(returnedFn, 'name', {
                value: basename,
                writable: false,
                enumerable: false,
                configurable: true
              });
            } catch (e) {/* ignore */}
          }
          return returnedFn;
        },
        generateSource: function () {
          var opts = this.opts;
          if (opts.rmWhitespace) {
            // Have to use two separate replace here as `^` and `$` operators don't
            // work well with `\r` and empty lines don't work well with the `m` flag.
            this.templateText = this.templateText.replace(/[\r\n]+/g, '\n').replace(/^\s+|\s+$/gm, '');
          }

          // Slurp spaces and tabs before <%_ and after _%>
          this.templateText = this.templateText.replace(/[ \t]*<%_/gm, '<%_').replace(/_%>[ \t]*/gm, '_%>');
          var self = this;
          var matches = this.parseTemplateText();
          var d = this.opts.delimiter;
          var o = this.opts.openDelimiter;
          var c = this.opts.closeDelimiter;
          if (matches && matches.length) {
            matches.forEach(function (line, index) {
              var closing;
              // If this is an opening tag, check for closing tags
              // FIXME: May end up with some false positives here
              // Better to store modes as k/v with openDelimiter + delimiter as key
              // Then this can simply check against the map
              if (line.indexOf(o + d) === 0 // If it is a tag
              && line.indexOf(o + d + d) !== 0) {
                // and is not escaped
                closing = matches[index + 2];
                if (!(closing == d + c || closing == '-' + d + c || closing == '_' + d + c)) {
                  throw new Error('Could not find matching close tag for "' + line + '".');
                }
              }
              self.scanLine(line);
            });
          }
        },
        parseTemplateText: function () {
          var str = this.templateText;
          var pat = this.regex;
          var result = pat.exec(str);
          var arr = [];
          var firstPos;
          while (result) {
            firstPos = result.index;
            if (firstPos !== 0) {
              arr.push(str.substring(0, firstPos));
              str = str.slice(firstPos);
            }
            arr.push(result[0]);
            str = str.slice(result[0].length);
            result = pat.exec(str);
          }
          if (str) {
            arr.push(str);
          }
          return arr;
        },
        _addOutput: function (line) {
          if (this.truncate) {
            // Only replace single leading linebreak in the line after
            // -%> tag -- this is the single, trailing linebreak
            // after the tag that the truncation mode replaces
            // Handle Win / Unix / old Mac linebreaks -- do the \r\n
            // combo first in the regex-or
            line = line.replace(/^(?:\r\n|\r|\n)/, '');
            this.truncate = false;
          }
          if (!line) {
            return line;
          }

          // Preserve literal slashes
          line = line.replace(/\\/g, '\\\\');

          // Convert linebreaks
          line = line.replace(/\n/g, '\\n');
          line = line.replace(/\r/g, '\\r');

          // Escape double-quotes
          // - this will be the delimiter during execution
          line = line.replace(/"/g, '\\"');
          this.source += '    ; __append("' + line + '")' + '\n';
        },
        scanLine: function (line) {
          var self = this;
          var d = this.opts.delimiter;
          var o = this.opts.openDelimiter;
          var c = this.opts.closeDelimiter;
          var newLineCount = 0;
          newLineCount = line.split('\n').length - 1;
          switch (line) {
            case o + d:
            case o + d + '_':
              this.mode = Template.modes.EVAL;
              break;
            case o + d + '=':
              this.mode = Template.modes.ESCAPED;
              break;
            case o + d + '-':
              this.mode = Template.modes.RAW;
              break;
            case o + d + '#':
              this.mode = Template.modes.COMMENT;
              break;
            case o + d + d:
              this.mode = Template.modes.LITERAL;
              this.source += '    ; __append("' + line.replace(o + d + d, o + d) + '")' + '\n';
              break;
            case d + d + c:
              this.mode = Template.modes.LITERAL;
              this.source += '    ; __append("' + line.replace(d + d + c, d + c) + '")' + '\n';
              break;
            case d + c:
            case '-' + d + c:
            case '_' + d + c:
              if (this.mode == Template.modes.LITERAL) {
                this._addOutput(line);
              }
              this.mode = null;
              this.truncate = line.indexOf('-') === 0 || line.indexOf('_') === 0;
              break;
            default:
              // In script mode, depends on type of tag
              if (this.mode) {
                // If '//' is found without a line break, add a line break.
                switch (this.mode) {
                  case Template.modes.EVAL:
                  case Template.modes.ESCAPED:
                  case Template.modes.RAW:
                    if (line.lastIndexOf('//') > line.lastIndexOf('\n')) {
                      line += '\n';
                    }
                }
                switch (this.mode) {
                  // Just executing code
                  case Template.modes.EVAL:
                    this.source += '    ; ' + line + '\n';
                    break;
                  // Exec, esc, and output
                  case Template.modes.ESCAPED:
                    this.source += '    ; __append(escapeFn(' + stripSemi(line) + '))' + '\n';
                    break;
                  // Exec and output
                  case Template.modes.RAW:
                    this.source += '    ; __append(' + stripSemi(line) + ')' + '\n';
                    break;
                  case Template.modes.COMMENT:
                    // Do nothing
                    break;
                  // Literal <%% mode, append as raw output
                  case Template.modes.LITERAL:
                    this._addOutput(line);
                    break;
                }
              }
              // In string mode, just add the output
              else {
                this._addOutput(line);
              }
          }
          if (self.opts.compileDebug && newLineCount) {
            this.currentLine += newLineCount;
            this.source += '    ; __line = ' + this.currentLine + '\n';
          }
        }
      };

      /**
       * Escape characters reserved in XML.
       *
       * This is simply an export of {@link module:utils.escapeXML}.
       *
       * If `markup` is `undefined` or `null`, the empty string is returned.
       *
       * @param {String} markup Input string
       * @return {String} Escaped string
       * @public
       * @func
       * */
      exports.escapeXML = utils.escapeXML;

      /**
       * Express.js support.
       *
       * This is an alias for {@link module:ejs.renderFile}, in order to support
       * Express.js out-of-the-box.
       *
       * @func
       */

      exports.__express = exports.renderFile;

      /**
       * Version of EJS.
       *
       * @readonly
       * @type {String}
       * @public
       */

      exports.VERSION = _VERSION_STRING;

      /**
       * Name for detection of EJS.
       *
       * @readonly
       * @type {String}
       * @public
       */

      exports.name = _NAME;

      /* istanbul ignore if */
      if (typeof window != 'undefined') {
        window.ejs = exports;
      }
    }, {
      "../package.json": 6,
      "./utils": 2,
      "fs": 3,
      "path": 4
    }],
    2: [function (require, module, exports) {
      /*
       * EJS Embedded JavaScript templates
       * Copyright 2112 Matthew Eernisse (mde@fleegix.org)
       *
       * Licensed under the Apache License, Version 2.0 (the "License");
       * you may not use this file except in compliance with the License.
       * You may obtain a copy of the License at
       *
       *         http://www.apache.org/licenses/LICENSE-2.0
       *
       * Unless required by applicable law or agreed to in writing, software
       * distributed under the License is distributed on an "AS IS" BASIS,
       * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
       * See the License for the specific language governing permissions and
       * limitations under the License.
       *
      */

      /**
       * Private utility functions
       * @module utils
       * @private
       */

      'use strict';

      var regExpChars = /[|\\{}()[\]^$+*?.]/g;
      var hasOwnProperty = Object.prototype.hasOwnProperty;
      var hasOwn = function (obj, key) {
        return hasOwnProperty.apply(obj, [key]);
      };

      /**
       * Escape characters reserved in regular expressions.
       *
       * If `string` is `undefined` or `null`, the empty string is returned.
       *
       * @param {String} string Input string
       * @return {String} Escaped string
       * @static
       * @private
       */
      exports.escapeRegExpChars = function (string) {
        // istanbul ignore if
        if (!string) {
          return '';
        }
        return String(string).replace(regExpChars, '\\$&');
      };
      var _ENCODE_HTML_RULES = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&#34;',
        "'": '&#39;'
      };
      var _MATCH_HTML = /[&<>'"]/g;
      function encode_char(c) {
        return _ENCODE_HTML_RULES[c] || c;
      }

      /**
       * Stringified version of constants used by {@link module:utils.escapeXML}.
       *
       * It is used in the process of generating {@link ClientFunction}s.
       *
       * @readonly
       * @type {String}
       */

      var escapeFuncStr = 'var _ENCODE_HTML_RULES = {\n' + '      "&": "&amp;"\n' + '    , "<": "&lt;"\n' + '    , ">": "&gt;"\n' + '    , \'"\': "&#34;"\n' + '    , "\'": "&#39;"\n' + '    }\n' + '  , _MATCH_HTML = /[&<>\'"]/g;\n' + 'function encode_char(c) {\n' + '  return _ENCODE_HTML_RULES[c] || c;\n' + '};\n';

      /**
       * Escape characters reserved in XML.
       *
       * If `markup` is `undefined` or `null`, the empty string is returned.
       *
       * @implements {EscapeCallback}
       * @param {String} markup Input string
       * @return {String} Escaped string
       * @static
       * @private
       */

      exports.escapeXML = function (markup) {
        return markup == undefined ? '' : String(markup).replace(_MATCH_HTML, encode_char);
      };
      function escapeXMLToString() {
        return Function.prototype.toString.call(this) + ';\n' + escapeFuncStr;
      }
      try {
        if (typeof Object.defineProperty === 'function') {
          // If the Function prototype is frozen, the "toString" property is non-writable. This means that any objects which inherit this property
          // cannot have the property changed using an assignment. If using strict mode, attempting that will cause an error. If not using strict
          // mode, attempting that will be silently ignored.
          // However, we can still explicitly shadow the prototype's "toString" property by defining a new "toString" property on this object.
          Object.defineProperty(exports.escapeXML, 'toString', {
            value: escapeXMLToString
          });
        } else {
          // If Object.defineProperty() doesn't exist, attempt to shadow this property using the assignment operator.
          exports.escapeXML.toString = escapeXMLToString;
        }
      } catch (err) {
        console.warn('Unable to set escapeXML.toString (is the Function prototype frozen?)');
      }

      /**
       * Naive copy of properties from one object to another.
       * Does not recurse into non-scalar properties
       * Does not check to see if the property has a value before copying
       *
       * @param  {Object} to   Destination object
       * @param  {Object} from Source object
       * @return {Object}      Destination object
       * @static
       * @private
       */
      exports.shallowCopy = function (to, from) {
        from = from || {};
        if (to !== null && to !== undefined) {
          for (var p in from) {
            if (!hasOwn(from, p)) {
              continue;
            }
            if (p === '__proto__' || p === 'constructor') {
              continue;
            }
            to[p] = from[p];
          }
        }
        return to;
      };

      /**
       * Naive copy of a list of key names, from one object to another.
       * Only copies property if it is actually defined
       * Does not recurse into non-scalar properties
       *
       * @param  {Object} to   Destination object
       * @param  {Object} from Source object
       * @param  {Array} list List of properties to copy
       * @return {Object}      Destination object
       * @static
       * @private
       */
      exports.shallowCopyFromList = function (to, from, list) {
        list = list || [];
        from = from || {};
        if (to !== null && to !== undefined) {
          for (var i = 0; i < list.length; i++) {
            var p = list[i];
            if (typeof from[p] != 'undefined') {
              if (!hasOwn(from, p)) {
                continue;
              }
              if (p === '__proto__' || p === 'constructor') {
                continue;
              }
              to[p] = from[p];
            }
          }
        }
        return to;
      };

      /**
       * Simple in-process cache implementation. Does not implement limits of any
       * sort.
       *
       * @implements {Cache}
       * @static
       * @private
       */
      exports.cache = {
        _data: {},
        set: function (key, val) {
          this._data[key] = val;
        },
        get: function (key) {
          return this._data[key];
        },
        remove: function (key) {
          delete this._data[key];
        },
        reset: function () {
          this._data = {};
        }
      };

      /**
       * Transforms hyphen case variable into camel case.
       *
       * @param {String} string Hyphen case string
       * @return {String} Camel case string
       * @static
       * @private
       */
      exports.hyphenToCamel = function (str) {
        return str.replace(/-[a-z]/g, function (match) {
          return match[1].toUpperCase();
        });
      };

      /**
       * Returns a null-prototype object in runtimes that support it
       *
       * @return {Object} Object, prototype will be set to null where possible
       * @static
       * @private
       */
      exports.createNullProtoObjWherePossible = function () {
        if (typeof Object.create == 'function') {
          return function () {
            return Object.create(null);
          };
        }
        if (!({
          __proto__: null
        } instanceof Object)) {
          return function () {
            return {
              __proto__: null
            };
          };
        }
        // Not possible, just pass through
        return function () {
          return {};
        };
      }();
      exports.hasOwnOnlyObject = function (obj) {
        var o = exports.createNullProtoObjWherePossible();
        for (var p in obj) {
          if (hasOwn(obj, p)) {
            o[p] = obj[p];
          }
        }
        return o;
      };
    }, {}],
    3: [function (require, module, exports) {}, {}],
    4: [function (require, module, exports) {
      (function (process) {
        // .dirname, .basename, and .extname methods are extracted from Node.js v8.11.1,
        // backported and transplited with Babel, with backwards-compat fixes

        // Copyright Joyent, Inc. and other Node contributors.
        //
        // Permission is hereby granted, free of charge, to any person obtaining a
        // copy of this software and associated documentation files (the
        // "Software"), to deal in the Software without restriction, including
        // without limitation the rights to use, copy, modify, merge, publish,
        // distribute, sublicense, and/or sell copies of the Software, and to permit
        // persons to whom the Software is furnished to do so, subject to the
        // following conditions:
        //
        // The above copyright notice and this permission notice shall be included
        // in all copies or substantial portions of the Software.
        //
        // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
        // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
        // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
        // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
        // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
        // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
        // USE OR OTHER DEALINGS IN THE SOFTWARE.

        // resolves . and .. elements in a path array with directory names there
        // must be no slashes, empty elements, or device names (c:\) in the array
        // (so also no leading and trailing slashes - it does not distinguish
        // relative and absolute paths)
        function normalizeArray(parts, allowAboveRoot) {
          // if the path tries to go above the root, `up` ends up > 0
          var up = 0;
          for (var i = parts.length - 1; i >= 0; i--) {
            var last = parts[i];
            if (last === '.') {
              parts.splice(i, 1);
            } else if (last === '..') {
              parts.splice(i, 1);
              up++;
            } else if (up) {
              parts.splice(i, 1);
              up--;
            }
          }

          // if the path is allowed to go above the root, restore leading ..s
          if (allowAboveRoot) {
            for (; up--; up) {
              parts.unshift('..');
            }
          }
          return parts;
        }

        // path.resolve([from ...], to)
        // posix version
        exports.resolve = function () {
          var resolvedPath = '',
            resolvedAbsolute = false;
          for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
            var path = i >= 0 ? arguments[i] : process.cwd();

            // Skip empty and invalid entries
            if (typeof path !== 'string') {
              throw new TypeError('Arguments to path.resolve must be strings');
            } else if (!path) {
              continue;
            }
            resolvedPath = path + '/' + resolvedPath;
            resolvedAbsolute = path.charAt(0) === '/';
          }

          // At this point the path should be resolved to a full absolute path, but
          // handle relative paths to be safe (might happen when process.cwd() fails)

          // Normalize the path
          resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function (p) {
            return !!p;
          }), !resolvedAbsolute).join('/');
          return (resolvedAbsolute ? '/' : '') + resolvedPath || '.';
        };

        // path.normalize(path)
        // posix version
        exports.normalize = function (path) {
          var isAbsolute = exports.isAbsolute(path),
            trailingSlash = substr(path, -1) === '/';

          // Normalize the path
          path = normalizeArray(filter(path.split('/'), function (p) {
            return !!p;
          }), !isAbsolute).join('/');
          if (!path && !isAbsolute) {
            path = '.';
          }
          if (path && trailingSlash) {
            path += '/';
          }
          return (isAbsolute ? '/' : '') + path;
        };

        // posix version
        exports.isAbsolute = function (path) {
          return path.charAt(0) === '/';
        };

        // posix version
        exports.join = function () {
          var paths = Array.prototype.slice.call(arguments, 0);
          return exports.normalize(filter(paths, function (p, index) {
            if (typeof p !== 'string') {
              throw new TypeError('Arguments to path.join must be strings');
            }
            return p;
          }).join('/'));
        };

        // path.relative(from, to)
        // posix version
        exports.relative = function (from, to) {
          from = exports.resolve(from).substr(1);
          to = exports.resolve(to).substr(1);
          function trim(arr) {
            var start = 0;
            for (; start < arr.length; start++) {
              if (arr[start] !== '') break;
            }
            var end = arr.length - 1;
            for (; end >= 0; end--) {
              if (arr[end] !== '') break;
            }
            if (start > end) return [];
            return arr.slice(start, end - start + 1);
          }
          var fromParts = trim(from.split('/'));
          var toParts = trim(to.split('/'));
          var length = Math.min(fromParts.length, toParts.length);
          var samePartsLength = length;
          for (var i = 0; i < length; i++) {
            if (fromParts[i] !== toParts[i]) {
              samePartsLength = i;
              break;
            }
          }
          var outputParts = [];
          for (var i = samePartsLength; i < fromParts.length; i++) {
            outputParts.push('..');
          }
          outputParts = outputParts.concat(toParts.slice(samePartsLength));
          return outputParts.join('/');
        };
        exports.sep = '/';
        exports.delimiter = ':';
        exports.dirname = function (path) {
          if (typeof path !== 'string') path = path + '';
          if (path.length === 0) return '.';
          var code = path.charCodeAt(0);
          var hasRoot = code === 47 /*/*/;
          var end = -1;
          var matchedSlash = true;
          for (var i = path.length - 1; i >= 1; --i) {
            code = path.charCodeAt(i);
            if (code === 47 /*/*/) {
              if (!matchedSlash) {
                end = i;
                break;
              }
            } else {
              // We saw the first non-path separator
              matchedSlash = false;
            }
          }
          if (end === -1) return hasRoot ? '/' : '.';
          if (hasRoot && end === 1) {
            // return '//';
            // Backwards-compat fix:
            return '/';
          }
          return path.slice(0, end);
        };
        function basename(path) {
          if (typeof path !== 'string') path = path + '';
          var start = 0;
          var end = -1;
          var matchedSlash = true;
          var i;
          for (i = path.length - 1; i >= 0; --i) {
            if (path.charCodeAt(i) === 47 /*/*/) {
              // If we reached a path separator that was not part of a set of path
              // separators at the end of the string, stop now
              if (!matchedSlash) {
                start = i + 1;
                break;
              }
            } else if (end === -1) {
              // We saw the first non-path separator, mark this as the end of our
              // path component
              matchedSlash = false;
              end = i + 1;
            }
          }
          if (end === -1) return '';
          return path.slice(start, end);
        }

        // Uses a mixed approach for backwards-compatibility, as ext behavior changed
        // in new Node.js versions, so only basename() above is backported here
        exports.basename = function (path, ext) {
          var f = basename(path);
          if (ext && f.substr(-1 * ext.length) === ext) {
            f = f.substr(0, f.length - ext.length);
          }
          return f;
        };
        exports.extname = function (path) {
          if (typeof path !== 'string') path = path + '';
          var startDot = -1;
          var startPart = 0;
          var end = -1;
          var matchedSlash = true;
          // Track the state of characters (if any) we see before our first dot and
          // after any path separator we find
          var preDotState = 0;
          for (var i = path.length - 1; i >= 0; --i) {
            var code = path.charCodeAt(i);
            if (code === 47 /*/*/) {
              // If we reached a path separator that was not part of a set of path
              // separators at the end of the string, stop now
              if (!matchedSlash) {
                startPart = i + 1;
                break;
              }
              continue;
            }
            if (end === -1) {
              // We saw the first non-path separator, mark this as the end of our
              // extension
              matchedSlash = false;
              end = i + 1;
            }
            if (code === 46 /*.*/) {
              // If this is our first dot, mark it as the start of our extension
              if (startDot === -1) startDot = i;else if (preDotState !== 1) preDotState = 1;
            } else if (startDot !== -1) {
              // We saw a non-dot and non-path separator before our dot, so we should
              // have a good chance at having a non-empty extension
              preDotState = -1;
            }
          }
          if (startDot === -1 || end === -1 ||
          // We saw a non-dot character immediately before the dot
          preDotState === 0 ||
          // The (right-most) trimmed path component is exactly '..'
          preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
            return '';
          }
          return path.slice(startDot, end);
        };
        function filter(xs, f) {
          if (xs.filter) return xs.filter(f);
          var res = [];
          for (var i = 0; i < xs.length; i++) {
            if (f(xs[i], i, xs)) res.push(xs[i]);
          }
          return res;
        }

        // String.prototype.substr - negative index don't work in IE8
        var substr =  true ? function (str, start, len) {
          return str.substr(start, len);
        } : 0;
      }).call(this, require('_process'));
    }, {
      "_process": 5
    }],
    5: [function (require, module, exports) {
      // shim for using process in browser
      var process = module.exports = {};

      // cached from whatever global is present so that test runners that stub it
      // don't break things.  But we need to wrap it in a try catch in case it is
      // wrapped in strict mode code which doesn't define any globals.  It's inside a
      // function because try/catches deoptimize in certain engines.

      var cachedSetTimeout;
      var cachedClearTimeout;
      function defaultSetTimout() {
        throw new Error('setTimeout has not been defined');
      }
      function defaultClearTimeout() {
        throw new Error('clearTimeout has not been defined');
      }
      (function () {
        try {
          if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
          } else {
            cachedSetTimeout = defaultSetTimout;
          }
        } catch (e) {
          cachedSetTimeout = defaultSetTimout;
        }
        try {
          if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
          } else {
            cachedClearTimeout = defaultClearTimeout;
          }
        } catch (e) {
          cachedClearTimeout = defaultClearTimeout;
        }
      })();
      function runTimeout(fun) {
        if (cachedSetTimeout === setTimeout) {
          //normal enviroments in sane situations
          return setTimeout(fun, 0);
        }
        // if setTimeout wasn't available but was latter defined
        if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
          cachedSetTimeout = setTimeout;
          return setTimeout(fun, 0);
        }
        try {
          // when when somebody has screwed with setTimeout but no I.E. maddness
          return cachedSetTimeout(fun, 0);
        } catch (e) {
          try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
          } catch (e) {
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
          }
        }
      }
      function runClearTimeout(marker) {
        if (cachedClearTimeout === clearTimeout) {
          //normal enviroments in sane situations
          return clearTimeout(marker);
        }
        // if clearTimeout wasn't available but was latter defined
        if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
          cachedClearTimeout = clearTimeout;
          return clearTimeout(marker);
        }
        try {
          // when when somebody has screwed with setTimeout but no I.E. maddness
          return cachedClearTimeout(marker);
        } catch (e) {
          try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
          } catch (e) {
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
          }
        }
      }
      var queue = [];
      var draining = false;
      var currentQueue;
      var queueIndex = -1;
      function cleanUpNextTick() {
        if (!draining || !currentQueue) {
          return;
        }
        draining = false;
        if (currentQueue.length) {
          queue = currentQueue.concat(queue);
        } else {
          queueIndex = -1;
        }
        if (queue.length) {
          drainQueue();
        }
      }
      function drainQueue() {
        if (draining) {
          return;
        }
        var timeout = runTimeout(cleanUpNextTick);
        draining = true;
        var len = queue.length;
        while (len) {
          currentQueue = queue;
          queue = [];
          while (++queueIndex < len) {
            if (currentQueue) {
              currentQueue[queueIndex].run();
            }
          }
          queueIndex = -1;
          len = queue.length;
        }
        currentQueue = null;
        draining = false;
        runClearTimeout(timeout);
      }
      process.nextTick = function (fun) {
        var args = new Array(arguments.length - 1);
        if (arguments.length > 1) {
          for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
          }
        }
        queue.push(new Item(fun, args));
        if (queue.length === 1 && !draining) {
          runTimeout(drainQueue);
        }
      };

      // v8 likes predictible objects
      function Item(fun, array) {
        this.fun = fun;
        this.array = array;
      }
      Item.prototype.run = function () {
        this.fun.apply(null, this.array);
      };
      process.title = 'browser';
      process.browser = true;
      process.env = {};
      process.argv = [];
      process.version = ''; // empty string to avoid regexp issues
      process.versions = {};
      function noop() {}
      process.on = noop;
      process.addListener = noop;
      process.once = noop;
      process.off = noop;
      process.removeListener = noop;
      process.removeAllListeners = noop;
      process.emit = noop;
      process.prependListener = noop;
      process.prependOnceListener = noop;
      process.listeners = function (name) {
        return [];
      };
      process.binding = function (name) {
        throw new Error('process.binding is not supported');
      };
      process.cwd = function () {
        return '/';
      };
      process.chdir = function (dir) {
        throw new Error('process.chdir is not supported');
      };
      process.umask = function () {
        return 0;
      };
    }, {}],
    6: [function (require, module, exports) {
      module.exports = {
        "name": "ejs",
        "description": "Embedded JavaScript templates",
        "keywords": ["template", "engine", "ejs"],
        "version": "3.1.9",
        "author": "Matthew Eernisse <mde@fleegix.org> (http://fleegix.org)",
        "license": "Apache-2.0",
        "bin": {
          "ejs": "./bin/cli.js"
        },
        "main": "./lib/ejs.js",
        "jsdelivr": "ejs.min.js",
        "unpkg": "ejs.min.js",
        "repository": {
          "type": "git",
          "url": "git://github.com/mde/ejs.git"
        },
        "bugs": "https://github.com/mde/ejs/issues",
        "homepage": "https://github.com/mde/ejs",
        "dependencies": {
          "jake": "^10.8.5"
        },
        "devDependencies": {
          "browserify": "^16.5.1",
          "eslint": "^6.8.0",
          "git-directory-deploy": "^1.5.1",
          "jsdoc": "^4.0.2",
          "lru-cache": "^4.0.1",
          "mocha": "^10.2.0",
          "uglify-js": "^3.3.16"
        },
        "engines": {
          "node": ">=0.10.0"
        },
        "scripts": {
          "test": "npx jake test"
        }
      };
    }, {}]
  }, {}, [1])(1);
});

/***/ }),

/***/ 4338:
/***/ ((module) => {

/*
 # -----------------------------------------------------------------------------
 # ~/200_theme_js/js/lazyCss/lazyCss.js
 # CSS loader to speed up inital rendering
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2023, 2024 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 # -----------------------------------------------------------------------------
*/
module.exports = function lazyCSS() {
  let options = {};
  const observe = opt => {
    options = opt;

    // sessionStorage NOT used
    //
    // (('IntersectionObserver' in window && !sessionStorage[options.selector]) ? fnCssObserver : fnCssDomLink)();
    ('IntersectionObserver' in window ? fnCssObserver : doNothing)();
  };
  const doNothing = () => {
    observe = false;
  };
  const fnCssDomLink = () => {
    let link = document.createElement('link');
    let id = 'lazy' + options.selector;
    link.id = id.replace('.', '_');
    ;
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = options.src;
    document.head.appendChild(link);
  };
  const fnCssObserver = () => {
    let selectors = document.querySelectorAll(options.selector);
    let observer = new IntersectionObserver((entry, observer) => {
      if (entry[0].intersectionRatio > 0) {
        fnCssDomLink();
        sessionStorage[options.selector] = true;
        observer.disconnect();
      }
    }, {
      rootMargin: options.rootMargin
    });
    selectors.forEach(selector => {
      observer.observe(selector);
    });
  };
  return {
    observe
  };
};

/***/ }),

/***/ 8497:
/***/ (() => {

/*
 # -----------------------------------------------------------------------------
 # ~/200_theme_js/js/listen-attribute-changes/attrchange.js
 # A simple jQuery function that can add listeners on attribute change.
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2013-2014 Selvakumar Arumugam
 # Copyright (C) 2023, 2024 Juergen Adams
 #
 # Attrchange is licensed under the MIT License.
 # See: https://github.com/meetselva/attrchange/blob/master/MIT-License.txt
 #
 # J1 Template is licensed under the MIT License.
 # See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 # -----------------------------------------------------------------------------
*/
;
(function ($) {
  function isDOMAttrModifiedSupported() {
    var p = document.createElement('p');
    var flag = false;
    if (p.addEventListener) {
      p.addEventListener('DOMAttrModified', function () {
        flag = true;
      }, false);
    } else if (p.attachEvent) {
      p.attachEvent('onDOMAttrModified', function () {
        flag = true;
      });
    } else {
      return false;
    }
    p.setAttribute('id', 'target');
    return flag;
  }
  function checkAttributes(chkAttr, e) {
    if (chkAttr) {
      var attributes = this.data('attr-old-value');
      if (e.attributeName.indexOf('style') >= 0) {
        if (!attributes['style']) attributes['style'] = {}; //initialize
        var keys = e.attributeName.split('.');
        e.attributeName = keys[0];
        e.oldValue = attributes['style'][keys[1]]; //old value
        e.newValue = keys[1] + ':' + this.prop("style")[$.camelCase(keys[1])]; //new value
        attributes['style'][keys[1]] = e.newValue;
      } else {
        e.oldValue = attributes[e.attributeName];
        e.newValue = this.attr(e.attributeName);
        attributes[e.attributeName] = e.newValue;
      }
      this.data('attr-old-value', attributes); //update the old value object
    }
  }

  //initialize Mutation Observer
  var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
  $.fn.attrchange = function (a, b) {
    if (typeof a == 'object') {
      //core
      var cfg = {
        trackValues: false,
        callback: $.noop
      };
      //backward compatibility
      if (typeof a === "function") {
        cfg.callback = a;
      } else {
        $.extend(cfg, a);
      }
      if (cfg.trackValues) {
        //get attributes old value
        this.each(function (i, el) {
          var attributes = {};
          for (var attr, i = 0, attrs = el.attributes, l = attrs.length; i < l; i++) {
            attr = attrs.item(i);
            attributes[attr.nodeName] = attr.value;
          }
          $(this).data('attr-old-value', attributes);
        });
      }
      if (MutationObserver) {
        //Modern Browsers supporting MutationObserver
        var mOptions = {
          subtree: false,
          attributes: true,
          attributeOldValue: cfg.trackValues
        };
        var observer = new MutationObserver(function (mutations) {
          mutations.forEach(function (e) {
            var _this = e.target;
            //get new value if trackValues is true
            if (cfg.trackValues) {
              e.newValue = $(_this).attr(e.attributeName);
            }
            if ($(_this).data('attrchange-status') === 'connected') {
              //execute if connected
              cfg.callback.call(_this, e);
            }
          });
        });
        return this.data('attrchange-method', 'Mutation Observer').data('attrchange-status', 'connected').data('attrchange-obs', observer).each(function () {
          observer.observe(this, mOptions);
        });
      } else if (isDOMAttrModifiedSupported()) {
        //Opera
        //Good old Mutation Events
        return this.data('attrchange-method', 'DOMAttrModified').data('attrchange-status', 'connected').on('DOMAttrModified', function (event) {
          if (event.originalEvent) {
            event = event.originalEvent;
          } //jQuery normalization is not required
          event.attributeName = event.attrName; //property names to be consistent with MutationObserver
          event.oldValue = event.prevValue; //property names to be consistent with MutationObserver
          if ($(this).data('attrchange-status') === 'connected') {
            //disconnected logically
            cfg.callback.call(this, event);
          }
        });
      } else if ('onpropertychange' in document.body) {
        //works only in IE
        return this.data('attrchange-method', 'propertychange').data('attrchange-status', 'connected').on('propertychange', function (e) {
          e.attributeName = window.event.propertyName;
          //to set the attr old value
          checkAttributes.call($(this), cfg.trackValues, e);
          if ($(this).data('attrchange-status') === 'connected') {
            //disconnected logically
            cfg.callback.call(this, e);
          }
        });
      }
      return this;
    } else if (typeof a == 'string' && $.fn.attrchange.hasOwnProperty('extensions') && $.fn.attrchange['extensions'].hasOwnProperty(a)) {
      //extensions/options
      return $.fn.attrchange['extensions'][a].call(this, b);
    }
  };
  $.fn.attrchange.extensions = {
    /*attrchange option/extension*/
    disconnect: function (o) {
      if (typeof o !== 'undefined' && o.isPhysicalDisconnect) {
        return this.each(function () {
          var attrchangeMethod = $(this).data('attrchange-method');
          if (attrchangeMethod == 'propertychange' || attrchangeMethod == 'DOMAttrModified') {
            $(this).off(attrchangeMethod);
          } else if (attrchangeMethod == 'Mutation Observer') {
            $(this).data('attrchange-obs').disconnect();
          } else if (attrchangeMethod == 'polling') {
            clearInterval($(this).data('attrchange-polling-timer'));
          }
        }).removeData(['attrchange-method', 'attrchange-status']);
      } else {
        //logical disconnect
        return this.data('attrchange-status', 'disconnected'); //set a flag that prevents triggering callback onattrchange
      }
    },
    remove: function (o) {
      return $.fn.attrchange.extensions['disconnect'].call(this, {
        isPhysicalDisconnect: true
      });
    },
    getProperties: function (o) {
      var attrchangeMethod = $(this).data('attrchange-method');
      var pollInterval = $(this).data('attrchange-pollInterval');
      return {
        method: attrchangeMethod,
        isPolling: attrchangeMethod == 'polling',
        pollingInterval: typeof pollInterval === 'undefined' ? 0 : parseInt(pollInterval, 10),
        status: typeof attrchangeMethod === 'undefined' ? 'removed' : $(this).data('attrchange-status')
      };
    },
    reconnect: function (o) {
      //reconnect possible only when there is a logical disconnect
      return this.data('attrchange-status', 'connected');
    },
    polling: function (o) {
      if (o.hasOwnProperty('isComputedStyle') && o.isComputedStyle == 'true') {
        /* extensive and slow - polling to check on computed style properties */
        return this.each(function (i, _this) {
          if (!o.hasOwnProperty('properties') || Object.prototype.toString.call(o.properties) !== '[object Array]' || o.properties.length == 0) {
            return false;
          } //return if no properties found
          var attributes = {}; //store computed properties
          for (var i = 0; i < o.properties.length; i++) {
            attributes[o.properties[i]] = $(this).css(o.properties[i]);
          }
          var _this = this;
          $(this).data('attrchange-polling-timer', setInterval(function () {
            var changes = {},
              hasChanges = false; // attrName: { oldValue: xxx, newValue: yyy}
            for (var comuptedVal, i = 0; i < o.properties.length; i++) {
              comuptedVal = $(_this).css(o.properties[i]);
              if (attributes[o.properties[i]] !== comuptedVal) {
                hasChanges = true;
                changes[o.properties[i]] = {
                  oldValue: attributes[o.properties[i]],
                  newValue: comuptedVal
                };
                attributes[o.properties[i]] = comuptedVal; //add the attribute to the orig
              }
            }
            if (hasChanges && $(_this).data('attrchange-status') === 'connected') {
              //disconnected logically
              o.callback.call(_this, changes);
            }
          }, o.pollInterval ? o.pollInterval : 1000)).data('attrchange-method', 'polling').data('attrchange-pollInterval', o.pollInterval).data('attrchange-status', 'connected');
        });
      } else {
        return this.each(function (i, _this) {
          /* this one is programmatic polling */
          var attributes = {};
          for (var attr, i = 0, attrs = _this.attributes, l = attrs.length; i < l; i++) {
            attr = attrs.item(i);
            attributes[attr.nodeName] = attr.nodeValue;
          }
          $(_this).data('attrchange-polling-timer', setInterval(function () {
            var changes = {},
              hasChanges = false; // attrName: { oldValue: xxx, newValue: yyy}
            for (var attr, i = 0, attrs = _this.attributes, l = attrs.length; i < l; i++) {
              attr = attrs.item(i);
              if (attributes.hasOwnProperty(attr.nodeName) && attributes[attr.nodeName] != attr.nodeValue) {
                //check the values
                changes[attr.nodeName] = {
                  oldValue: attributes[attr.nodeName],
                  newValue: attr.nodeValue
                };
                hasChanges = true;
              } else if (!attributes.hasOwnProperty(attr.nodeName)) {
                //new attribute
                changes[attr.nodeName] = {
                  oldValue: '',
                  newValue: attr.nodeValue
                };
                hasChanges = true;
              }
              attributes[attr.nodeName] = attr.nodeValue; //add the attribute to the orig
            }
            if (hasChanges && $(_this).data('attrchange-status') === 'connected') {
              //disconnected logically
              o.callback.call(_this, changes);
            }
          }, o.pollInterval ? o.pollInterval : 1000)).data('attrchange-method', 'polling').data('attrchange-pollInterval', o.pollInterval).data('attrchange-status', 'connected');
        });
      }
    }
  };
})(jQuery);

/***/ }),

/***/ 4102:
/***/ ((module) => {

/*
 # -----------------------------------------------------------------------------
 #  ~/js/navigator/navigator.js
 #  Provides all JavaScript core functions for J1 Navigator
 #
 #  Product/Info:
 #  https://jekyll.one
 #  https://github.com/adamnurdin01/bootsnav
 #  http://corenav.anurdin.net/
 #
 #  Copyright (C) 2023, 2024 Juergen Adams
 #  Copyright (C) 2016 adamnurdin01
 #
 #  J1 Theme is licensed under MIT License.
 #  See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 #  Bootsnav is licensed under MIT License.
 #  See: https://github.com/adamnurdin01/navigator
 #
 # -----------------------------------------------------------------------------
 # NOTE:
 #  jadams, 2020-06-21:
 #    J1 Navigator needs a general revision on BS4 code and functionalities
 #    Current, only base function are tested with BS4 (was coded for BS3)
 # -----------------------------------------------------------------------------
*/

// -----------------------------------------------------------------------------
// ESLint shimming
// -----------------------------------------------------------------------------
/* eslint indent: "off"                                                       */
/* eslint no-unused-vars: "off"                                               */
/* eslint no-undef: "off"                                                     */
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// TODO: Height of dropdowns are to be limited in general

// -----------------------------------------------------------------------------
// Navigator core registered as 'j1.core.navigator'
// -----------------------------------------------------------------------------

module.exports = function navigator(options) {
  // ---------------------------------------------------------------------------
  // global vars
  // ---------------------------------------------------------------------------
  var cookie_names = j1.getCookieNames();
  var user_state = j1.readCookie(cookie_names.user_state);
  var message = {};
  var state;
  var logger;
  var logText;

  // -----------------------------------------------------------------------
  // default settings
  // -----------------------------------------------------------------------
  var settings = $.extend({
    foo: 'bar',
    bar: 'foo'
  }, options);

  // ---------------------------------------------------------------------------
  // main
  // ---------------------------------------------------------------------------
  return {
    // -------------------------------------------------------------------------
    // module initializer
    // -------------------------------------------------------------------------
    init: function (defaultOptions, menuOptions) {
      logger = log4javascript.getLogger('j1.navigator.core');
      logger.debug('\n' + 'initializing module: started');

      // -----------------------------------------------------------------------
      // Create a Wrapper for the nav system
      // -----------------------------------------------------------------------
      $('body').wrapInner('<div id="wrapper-inner" class="wrapper"></div>');
      this.manageDropdownMenu(defaultOptions, menuOptions);
      this.navbarSticky();
      this.eventHandler(defaultOptions); // jadams, 2021-07-03: initialize events early

      logger.debug('\n' + 'initializing module: finished');
      message.type = 'state';
      message.action = 'core_initialized';
      message.text = 'navigator core initialized';
      j1.sendMessage('j1.navigator.core', 'j1.adapter.navigator', message);
      return true;
    },
    // -------------------------------------------------------------------------
    // event handler
    // -------------------------------------------------------------------------
    eventHandler: function (options) {
      var defaultOptions = options;
      var $getNav = $('nav.navbar.navigator');
      var scrollDuration = 300;
      var page_link;
      var img_link;
      var classname;
      var nav_link;
      var anchor_id;
      var scrollOffset;
      var json_data;
      logger.debug('\n' + 'initializing eventHandler: started');

      // jadams: unused code (for now).: manages HTML5 server side events
      // for incoming messages from Git Server send e.g. on a 'pull request'
      // NOTE: used for ControlCenter (cc) functionality only !!!
      // -----------------------------------------------------------------------
      // const seeMe           = 'https://smee.io/wlNIFNiJN0GClm2';
      // const middleware      = 'localhost:5000/state';
      // const web_server_dev  = 'http://localhost:41000/status';
      // const utility_server  = 'http://localhost:41001/git?request=pull';
      // var sender            = seeMe;
      // var payload;

      // if (j1.checkUserAgent('IE') || j1.checkUserAgent('Edge')) {
      //   logger.warn('HTML5 server side events (SSE) not supported for: ' + userAgent);
      //   logger.warn('Middleware messages disabled');
      // } else {
      //   const middleware_status = new EventSource(sender);
      //
      //   // -----------------------------------------------------------------------
      //   // middleware event handler ( SSE currently NOT used)
      //   // -----------------------------------------------------------------------
      //   middleware_status.onmessage = (event) => {
      //     const payload = JSON.parse(event.data);
      //
      //     logger.debug('middleware: event received');
      //
      //     json_data = JSON.stringify(payload, undefined, 2);
      //     logText   = 'payload: ' + json_data;
      //     logger.debug(logText);
      //
      //     message.type    = 'command';
      //     message.action  = 'status';
      //     message.text    = payload;
      //     j1.sendMessage( 'j1.core.navigator', 'j1.adapter.navigator', message );
      //
      //     return true;
      //   }; // END event onMessage
      // }

      // bind click event to all plain '#' links to prevent default action
      // 'scroll-to-top'
      // See:
      //  https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault
      //  https://developer.mozilla.org/en-US/docs/Web/API/Event/stopPropagation
      //  https://stackoverflow.com/questions/134845/which-href-value-should-i-use-for-javascript-links-or-javascriptvoid0
      //
      $('a[href="#"]').click(function (e) {
        page_link = document.querySelector('[id="' + decodeURI(anchor_id).split('#').join('') + '"]') ? true : false;
        anchor_id = e.target.hash ? e.target.hash : false;
        classname = e.target.className ? e.target.className : '';
        nav_link = classname.includes('nav-');
        if (nav_link || !page_link) {
          logger.debug('\n' + 'click event on href "#" detected: prevent default action');
          e.preventDefault ? e.preventDefault() : e.returnValue = false;
        }
      });

      // -----------------------------------------------------------------------
      // In-page smooth scroll
      // -----------------------------------------------------------------------

      // bind click event to all headlines generated by AsciiDoctor
      // for smooth-scroll (in-page)
      // jadams,2022-06-10: unused code - smooth scrolling managed by
      // (page height) observer
      // -----------------------------------------------------------------------
      // $('.sect1, .sect2 .sect3, .sect4, .sect5, .sect6').on('click', function (e) {
      //   img_link     = (e.target.localName == 'img') ? true : false;
      //   page_link    = document.querySelector('[id="' + decodeURI(anchor_id).split('#').join('') + '"]') ? true : false;
      //   anchor_id    = e.target.hash ? e.target.hash : false;
      //   classname    = e.target.className ? e.target.className : '';
      //   nav_link     = typeof classname == 'string' ? classname.includes('nav-link') : false;                          // skip BS nav links
      //   scrollOffset = j1.getScrollOffset();
      //   anchorTop    = $(anchor_id).offset().top ? true : false;
      //
      //   if (anchor_id && anchor_id.includes('void')) anchor_id = false;
      //
      //   // skip scrolling if a click on an image detected
      //   if (img_link) {
      //     return true;
      //   }
      //
      //   if (anchor_id && !nav_link || page_link) {
      //     logger.debug('\n' + 'click event on headline detected: ' + anchor_id);
      //
      //     $('html, body').animate({
      //       scrollTop:  + scrollOffset
      //     }, scrollDuration);
      //     e.preventDefault ? e.preventDefault() : e.returnValue = false;
      //   }
      // });

      // bind click event to all HTML elements of class '.badge' (Bootstrap)
      // for smooth-scroll (in-page) to a '<div>' element
      // -----------------------------------------------------------------------
      $('.badge').on('click', function (e) {
        anchor_id = e.target.hash ? e.target.hash : false;
        scrollOffset = 100;
        if (anchor_id) {
          logger.debug('\n' + 'click event on badge detected: ' + anchor_id);
          $('html, body').animate({
            scrollTop: $(anchor_id).offset().top - scrollOffset // NOTE: diffeent scrollOffset
          }, scrollDuration);
          event.stopPropagation();
        }
      });

      // bind click event to all HTML elements of class '.badge-tag' (j1)
      // for smooth-scroll (in-page)
      $('.badge-tag').on('click', function (e) {
        anchor_id = e.target.hash ? e.target.hash : false;
        scrollOffset = j1.getScrollOffset();
        if (anchor_id) {
          logger.debug('\n' + 'click event on badge-tag detected: ' + anchor_id);
          $('html, body').animate({
            scrollTop: $(anchor_id).offset().top + scrollOffset
          }, scrollDuration);
          event.stopPropagation();
        }
      });

      // jadams: test code for jQuery plugin 'regex'
      // -----------------------------------------------------------------------
      // $('a:contains("?#")').click(function(e) {
      //   e.preventDefault ? e.preventDefault() : e.returnValue = false;
      //   logger.info('bound click event to "?#*", suppress default action');
      // });

      // -----------------------------------------------------------------------
      // Navbar Sticky
      // -----------------------------------------------------------------------
      var navSticky = $getNav.hasClass('navbar-sticky');
      if (navSticky) {
        // Wraped navigation
        $getNav.wrap('<div class=\'wrap-sticky\'></div>');
      }

      // -----------------------------------------------------------------------
      // Navbar Center
      // -----------------------------------------------------------------------
      if ($getNav.hasClass('brand-center')) {
        var postsArr = new Array();
        var index = $('nav.brand-center');
        var $postsList = index.find('ul.navbar-nav');

        //Create array of all posts in lists
        index.find('ul.navbar-nav > li').each(function () {
          postsArr.push($(this).html());
        });

        // Split the array at this point. The original array is altered.
        var firstList = postsArr.splice(0, Math.round(postsArr.length / 2));
        var secondList = postsArr;
        var ListHTML = '';
        var createHTML = function (list) {
          ListHTML = '';
          for (var i = 0; i < list.length; i++) {
            ListHTML += '<li>' + list[i] + '</li>';
          }
        };

        // Generate HTML for first list
        createHTML(firstList);
        $postsList.html(ListHTML);
        index.find('ul.nav').first().addClass('navbar-left');

        // Generate HTML for second list
        createHTML(secondList);
        //Create new list after original one
        $postsList.after('<ul class="nav navbar-nav"></ul>').next().html(ListHTML);
        index.find('ul.nav').last().addClass('navbar-right');

        // Wrap navigation menu
        index.find('ul.nav.navbar-left').wrap('<div class=\'col_half left\'></div>');
        index.find('ul.nav.navbar-right').wrap('<div class=\'col_half right\'></div>');

        // Selection Class
        index.find('ul.navbar-nav > li').each(function () {
          var dropDown = $('ul.dropdown-menu', this),
            megaMenu = $('ul.megamenu-content', this);
          dropDown.closest('li').addClass('dropdown');
          megaMenu.closest('li').addClass('megamenu-fw');
        });
      }

      // -----------------------------------------------------------------------
      // Menu Center
      // -----------------------------------------------------------------------
      if ($getNav.find('ul.nav').hasClass('navbar-center')) {
        $getNav.addClass('menu-center');
      }

      // -----------------------------------------------------------------------
      // Navbar Full
      // -----------------------------------------------------------------------
      if ($getNav.hasClass('navbar-full')) {
        // Add Class to body
        $('nav.navbar.navigator').find('ul.nav').wrap('<div class=\'wrap-full-menu\'></div>');
        $('.wrap-full-menu').wrap('<div class=\'nav-full\'></div>');
        $('ul.nav.navbar-nav').prepend('<li class=\'close-full-menu\'><a href=\'#\'><i class=\'mdi mdi-close\'></i></a></li>');
      } else if ($getNav.hasClass('navbar-mobile')) {
        $getNav.removeClass('no-full');
      } else {
        $getNav.addClass('no-full');
      }

      // -----------------------------------------------------------------------
      // Navbar Fixed
      // -----------------------------------------------------------------------
      if ($getNav.hasClass('no-background')) {
        $(window).on('scroll', function () {
          var navbarHeighth = $('nav.navbar').outerHeight();
          var scrollPos = $(window).scrollTop();
          if (scrollPos > navbarHeighth) {
            $('.navbar-fixed').removeClass('no-background');
          } else {
            $('.navbar-fixed').addClass('no-background');
          }
        });
      }
      if ($getNav.hasClass('navbar-transparent')) {
        $(window).on('scroll', function () {
          var navbarHeighth = $('nav.navbar').outerHeight();
          var scrollPos = $(window).scrollTop();
          if (scrollPos > navbarHeighth) {
            $('.navbar-fixed').removeClass('navbar-transparent');
            $('.navbar-fixed').addClass('navbar-scrolled');
          } else {
            $('.navbar-fixed').removeClass('navbar-scrolled');
            $('.navbar-fixed').addClass('navbar-transparent');
          }
        });
      }

      // -----------------------------------------------------------------------
      // Manage events for all quicklinks
      // https://stackoverflow.com/questions/178325/how-do-i-check-if-an-element-is-hidden-in-jquery
      // https://stackoverflow.com/questions/4770025/how-to-disable-scrolling-temporarily
      // https://stackoverflow.com/questions/5963669/whats-the-difference-between-event-stoppropagation-and-event-preventdefault
      // -----------------------------------------------------------------------
      $('.quicklink-nav').each(function () {
        // ---------------------------------------------------------------------
        // ThemeToggler
        //

        // -------------------------------------------------------------------
        // Event Mgmt from themeToggler SHOULD placed here
        // -------------------------------------------------------------------

        // ---------------------------------------------------------------------
        // QuickSearch
        //
        if ($('li.quicksearch')) {
          logger.debug('register OPEN event for QuickSearch');
          $('li.quicksearch > a', this).on('click', function (e) {
            logger.debug('manage search action OPEN');
            $('#searchModal').modal('show');
          });
        } // END QuickSearch

        // ---------------------------------------------------------------------
        // DocSearch dialog
        //
        if ($('li.documind')) {
          logger.debug('register SHOW event for J1 DocSearch');
          $('li.documind > a', this).on('click', function (e) {
            j1.adapter.docsearch.showDialog();
          });
        } // END DocSearch

        // ---------------------------------------------------------------------
        // Translator dialog
        //
        if ($('li.translate')) {
          logger.debug('register SHOW event for J1 Translator');
          $('li.translate > a', this).on('click', function (e) {
            j1.translator.showDialog();
          });
        } // END Translator

        // ---------------------------------------------------------------------
        // Speak2Me dialog
        //
        if ($('li.speak')) {
          logger.debug('register SHOW event for J1 Speak2Me');
          $('li.speak > a', this).on('click', function (e) {
            j1.adapter.speak2me.showDialog();
          });
        } // END Speak2Me

        // ---------------------------------------------------------------------
        // NBI Notebooks dialog
        //
        // if ($('li.nbi-notebooks')) {
        //   logger.debug('register SHOW event for J1 NBI');
        //   $('li.nbi-notebooks > a', this).on('click', function(e) {
        //     j1.adapter.nbinteract.showDialog();
        //   });
        // } // END NBI Notebooks

        // ---------------------------------------------------------------------
        // CookieConsent dialog
        //
        if ($('li.cookie-consent')) {
          logger.debug('register SHOW event for J1 CookieConsent');
          $('li.cookie-consent > a', this).on('click', function (e) {
            j1.cookieConsent.showDialog();
          });
        } // END CookieConsent
      }); // End manage events for all quicklinks

      logger.debug('\n' + 'initializing eventHandler: finished');
    },
    // END eventHandler

    // -------------------------------------------------------------------------
    // Manage the Menu Dropdowns for Desktop|Mobile
    // -------------------------------------------------------------------------
    manageDropdownMenu: function (defaultOptions, menuOptions) {
      var navDefaultOptions = defaultOptions;
      var navMenuOptions = menuOptions;
      var $getNav = $('nav.navbar.navigator');
      var $windowOrientation = window.matchMedia('(orientation: landscape)').matches ? 'landscape' : 'portrait';
      var $getWindow = $(window).width();
      var $getNavWidth = $('nav').width();
      var $getIn = $getNav.find('ul.nav').data('in');
      var $getOut = $getNav.find('ul.nav').data('out');
      var menuSelector = '#' + navMenuOptions.xhr_container_id + '.collapse';
      var quicklinksSelector = '#navigator_nav_quicklinks';
      var delayMenuOpen = navMenuOptions.delay_menu_open;
      var breakPoint;
      var $menu;
      var $dropDown;
      var timeoutHandle;

      // BS4 @media MAX breakpoints
      // NOTE: a media query is always a range
      // -----------------------------------------------------------------------
      var gridBreakpoint_lg = 992; // bs-breakpoint-lg
      var gridBreakpoint_md = 768; // bs-breakpoint-md
      var gridBreakpoint_sm = 576; // bs-breakpoint-sm

      // BS4 @media MIN breakpoints
      // -----------------------------------------------------------------------
      // NOTE: a media query is always a range
      // var gridBreakpoint_lg = 991;
      // var gridBreakpoint_md = 767;
      // var gridBreakpoint_sm = 575;

      // @media ranges
      // -----------------------------------------------------------------------
      var small_range = {
        min: '0em',
        max: '40em'
      }; /* 0, 640px */
      var medium_range = {
        min: '40.063em',
        max: '64em'
      }; /* 641px, 1024px */
      var large_range = {
        min: '64.063em',
        max: '90em'
      }; /* 1025px, 1440px */
      var xlarge_range = {
        min: '90.063em',
        max: '120em'
      }; /* 1441px, 1920px */
      var xxlarge_range = {
        min: '120.063em'
      }; /* 1921px */

      // jadams, 2019-05-01: Set Media Breakpoint for Desktop|Mobile Navigation
      if (navDefaultOptions.nav_bar.media_breakpoint === 'lg') {
        breakPoint = gridBreakpoint_lg;
      } else if (navDefaultOptions.nav_bar.media_breakpoint === 'md') {
        breakPoint = gridBreakpoint_md;
      } else if (navDefaultOptions.nav_bar.media_breakpoint === 'sm') {
        breakPoint = gridBreakpoint_sm;
      } else {
        breakPoint = gridBreakpoint_lg;
      }

      // -----------------------------------------------------------------------
      // Tablet or Mobile
      // NOTE:
      //    Managing the mobile menu is moved to MMenu Plugin
      //    Only base functions like QuickLinks are managed by
      //    J1 Navigator
      // -----------------------------------------------------------------------
      // MIN media breakpoint
      if ($getWindow <= breakPoint) {
        // Collapse Navbar (Desktop Navigation)
        $(menuSelector).addClass('navbar-collapse');
        $(menuSelector).removeClass('show');

        // Show QuicklinksBar
        $(quicklinksSelector).addClass('show');

        // -----------------------------------------------------------------------
        // Desktop Navigation does NOT work on physical devices like iPad|Pro
        // Config DISABLED
        //
        //    } else if ( $getWindow > breakPoint || $getWindow <= 1024 && $windowOrientation == 'portrait'  ) {
      } else if ($getWindow > breakPoint) {
        // -----------------------------------------------------------------------
        // Desktop
        // -----------------------------------------------------------------------
        $('#navigator_nav_quicklinks').removeClass('show');
        $('#desktop_menu').show();

        // jadams, 2021-03-05: manage dropdown menus
        // ---------------------------------------------------------------------

        $('.dropdown-menu > li').on('mouseenter', function () {
          if ($('body').hasClass('stop-scrolling')) {
            return false;
          } else {
            $('body').addClass('stop-scrolling');
          }
        });
        $('.dropdown-menu > li').on('mouseleave', function () {
          // stop scrolling if top search or any (mmenu) drawer is opened
          if ($('body').hasClass('stop-scrolling')) {
            $('body').removeClass('stop-scrolling');
          }
        });

        // limit the dropdown menu lenght if needed
        $('.dropdown-menu > li').hover(function () {
          var $container = $(this);
          var $list = $container.find('ul');

          // limit LAST menu ONLY
          if ($list.length == 1) {
            $list.addClass('scrollable-menu');
          }
        });

        // jadams, 2021-03-06: Enable|Show Desktop Menu|s
        //
        $(menuSelector).removeClass('navbar-collapse');
        $(menuSelector).addClass('show');

        // Open Desktop Menu|s on hover
        $('nav.navbar.navigator ul.nav').each(function () {
          $('a.dropdown-toggle', this).off('click');
          // $('a.dropdown-toggle', this).on('click', function (e) {
          //   // e.stopPropagation(); // don't bubble up the event
          // });

          $('.megamenu-fw', this).each(function () {
            $('.title', this).off('click');
            $('a.dropdown-toggle', this).off('click');
            $('.content').removeClass('animate__animated ');
          });
          $('.dropdown-menu', this).addClass('animate__animated ');
          $('li.dropdown', this).on('mouseenter', function (e) {
            $menu = $('.dropdown-menu', this).eq(0);
            $dropDown = $(this);
            $menu.removeClass($getOut);
            $menu.removeClass('open');
            $dropDown.addClass('open');

            // Create a timeout object to delay the dropdown menus to open
            timeoutHandle = window.setTimeout(function () {
              if ($dropDown.hasClass('open')) {
                $menu.stop().fadeIn().addClass($getIn);
                $menu.addClass('open');
                $dropDown.addClass('open');
              }
            }, delayMenuOpen);
            return true;
          });
          $('li.dropdown', this).on('mouseleave', function (e) {
            $menu = $('.dropdown-menu', this).eq(0);
            $dropDown = $(this);

            // Clear the timeout object for dropdown menus 'open'
            window.clearTimeout(timeoutHandle);
            $menu.removeClass($getIn);
            $menu.addClass($getOut);
            $menu.fadeOut('slow');
            $dropDown.removeClass('open');
            return true;
          });
        }); // END Desktop Menu
      } // end Desktop

      // -----------------------------------------------------------------------
      //  Fullscreen Menu
      // -----------------------------------------------------------------------
      if ($getNav.hasClass('navbar-full')) {
        var windowHeight = $(window).height(),
          windowWidth = $(window).width();
        $('.nav-full').css('height', windowHeight + 'px');
        $('.wrap-full-menu').css('height', windowHeight + 'px');
        $('.wrap-full-menu').css('width', windowWidth + 'px');
        $('.navbar-collapse').addClass('animate__animated ');
        $('.navbar-toggle').each(function () {
          var getId = $(this).data('target');
          $(this).off('click');
          $(this).on('click', function (e) {
            e.preventDefault();
            $(getId).removeClass($getOut);
            $(getId).addClass('in');
            $(getId).addClass($getIn);
            // e.stopPropagation(); // don't bubble up the event
            // return false;
          });
          $('li.close-full-menu').on('click', function (e) {
            e.preventDefault();
            $(getId).addClass($getOut);
            setTimeout(function () {
              $(getId).removeClass('in');
              $(getId).removeClass($getIn);
            }, 500);
            //e.stopPropagation(); // don't bubble up the event
            // return false;
          });
        });
      }
    },
    // end manageDropdownMenu

    // -------------------------------------------------------------------------
    // Sticky Navbar
    // -------------------------------------------------------------------------
    navbarSticky: function () {
      var $getNav = $('nav.navbar.navigator'),
        navSticky = $getNav.hasClass('navbar-sticky');
      if (navSticky) {
        // Set Height Navigation
        var $getHeight = $getNav.height();
        $('.wrap-sticky').height($getHeight);

        // Windown on scroll
        var getOffset = $('.wrap-sticky').offset().top;
        $(window).on('scroll', function () {
          var scrollTop = $(window).scrollTop();
          if (scrollTop > getOffset) {
            $getNav.addClass('sticked');
          } else {
            $getNav.removeClass('sticked');
          }
        });
      }
    },
    // end navbarSticky

    // -------------------------------------------------------------------------
    // updateSidebar
    // Note:
    // -------------------------------------------------------------------------
    updateSidebar: function (user_data) {
      var logger = log4javascript.getLogger('j1.core.navigator.updateSidebar');
      var json_message;

      //    json_message = JSON.stringify(user_data, undefined, 2);                   // multiline
      json_message = JSON.stringify(user_data);
      logText = 'user state data: ' + json_message;
      logger.debug(logText);

      // Replace Macro placeholders to values
      j1.resolveMacros(user_data);
      // Replace Macro values only
      j1.updateMacros(user_data);
      return true;
    } // END updateSidebar
  }; // end return (object)

  // }( j1, window, jQuery );
}(jQuery);

/***/ }),

/***/ 5150:
/***/ ((module) => {

"use strict";
/*
 # -----------------------------------------------------------------------------
 # ~/200_theme_js/js/scroll-smooth/scroll-smooth.js
 # Provides Javascript functions for smooth scrolling
 #
 # Product/Info:
 # http://jekyll.one
 #
 # J1 Template is licensed under the MIT License.
 # See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 # -----------------------------------------------------------------------------
*/


// -----------------------------------------------------------------------------
// ESLint shimming
// -----------------------------------------------------------------------------
/* eslint indent: "off"                                                       */
/* eslint no-unused-vars: "off"                                               */
/* eslint no-undef: "off"                                                     */
/* eslint no-redeclare: "off"                                                 */
/* eslint indent: "off"                                                       */
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// scrollSmooth core registered as "scrollSmooth"
// -----------------------------------------------------------------------------
module.exports = function scrollSmooth(options) {
  // Default settings
  var settings = $.extend({
    foo: 'foo_option',
    bar: 'bar_option'
  }, options);

  // -----------------------------------------------------------------------
  // Helper functions
  // -----------------------------------------------------------------------
  function stripHash(url) {
    return url.slice(0, url.lastIndexOf('#'));
  }
  function isCssSmoothScrollSupported() {
    return 'scrollBehavior' in document.documentElement.style;
  }
  return {
    // -------------------------------------------------------------------------
    // Initialize scrollSmooth
    // -------------------------------------------------------------------------
    scroll: function (target, options) {
      var logger;
      var logText;
      logger = log4javascript.getLogger('j1.core.scrollSmooth');

      // indicator|check currently NOT used
      // if (isCssSmoothScrollSupported()) { }

      logText = '\n' + 'run module scrollSmooth';
      logger.debug(logText);
      var duration = options.duration;
      var offset = options.offset;

      // var pageUrl = options.location.hash
      //   ? stripHash(options.location.href)
      //   : options.location.href;

      this.scrollTo(target, {
        duration: duration,
        offset: offset,
        callback: false
      });
    },
    // -------------------------------------------------------------------------
    // scrollTo
    // NOTE: Calculate the tgt (HTML heading element including the hash)
    // This makes ids that start with a number to work:
    //  '[id="' + decodeURI(target).split('#').join('') + '"]'
    // DecodeURI is usded for nonASCII hashes, they was encoded,
    // but id was not encoded, it lead to not finding the tgt element by id.
    // -------------------------------------------------------------------------
    scrollTo: function (target, options) {
      var start = window.pageYOffset;
      var opt = {
        duration: options.duration,
        offset: options.offset || 0,
        callback: options.callback,
        easing: options.easing || easeInOutQuad
      };

      // calculate the tgt (HTML heading element including the hash)
      var tgt = document.querySelector('[id="' + decodeURI(target).split('#').join('') + '"]');
      var distance = typeof target === 'string' ? opt.offset + (target ? tgt && tgt.getBoundingClientRect().top || 0 // handle non-existent links better.
      : -(document.documentElement.scrollTop || document.body.scrollTop)) : target;
      var duration = typeof opt.duration === 'function' ? opt.duration(distance) : opt.duration;
      var timeStart;
      var timeElapsed;
      requestAnimationFrame(function (time) {
        timeStart = time;
        loop(time);
      });
      function loop(time) {
        timeElapsed = time - timeStart;
        window.scrollTo(0, opt.easing(timeElapsed, start, distance, duration));
        if (timeElapsed < duration) {
          requestAnimationFrame(loop);
        } else {
          postPositioning();
        }
      }
      function postPositioning() {
        //  if configured
        if (typeof opt.callback === 'function') {
          opt.callback();
        }
      }

      // Robert Penner's easeInOutQuad - http://robertpenner.com/easing/
      function easeInOutQuad(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
      }
    } // END scrollTo
  }; // END return
}(jQuery);

/***/ }),

/***/ 6362:
/***/ ((module) => {

// -----------------------------------------------------------------------------
// ESLint shimming
// -----------------------------------------------------------------------------
/* eslint indent: "off"                                                       */
/* eslint no-undef: "off"                                                     */
/* eslint no-unused-vars: "off"                                               */
// -----------------------------------------------------------------------------

module.exports = {
  // Where to render the table of contents.
  tocSelector: '.js-toc',
  // Where to grab the headings to build the table of contents.
  contentSelector: '.js-toc-content',
  // Which headings to grab inside of the contentSelector element.
  headingSelector: 'h2, h3, h4, h5, h6',
  // Headings that match the ignoreSelector will be skipped.
  ignoreSelector: '.notoc',
  // For headings inside relative or absolute positioned containers within content
  hasInnerContainers: false,
  // Main class to add to links.
  linkClass: 'toc-link',
  // Extra classes to add to links.
  extraLinkClasses: '',
  // Class to add to active links,
  // the link corresponding to the top most heading on the page.
  activeLinkClass: 'is-active-link',
  // Main class to add to lists.
  listClass: 'toc-list',
  // Extra classes to add to lists.
  extraListClasses: '',
  // Class that gets added when a list should be collapsed.
  isCollapsedClass: 'is-collapsed',
  // Class that gets added when a list should be able
  // to be collapsed but isn't necessarily collapsed.
  collapsibleClass: 'is-collapsible',
  // Class to add to list items.
  listItemClass: 'toc-list-item',
  // Class to add to active list items.
  activeListItemClass: 'is-active-li',
  // How many heading levels should not be collapsed.
  // For example, number 6 will show everything since
  // there are only 6 heading levels and number 0 will collapse them all.
  // The sections that are hidden will open
  // and close as you scroll to headings within them.
  collapseDepth: 3,
  // Smooth scrolling enabled.
  scrollSmooth: true,
  // Smooth scroll duration.
  scrollSmoothDuration: 300,
  // Smooth scroll offset.
  scrollSmoothOffset: 0,
  // Callback for scroll end.
  scrollEndCallback: function (e) {},
  // Headings offset between the headings and the top of the document (this is meant for minor adjustments).
  headingsOffset: 1,
  // Timeout between events firing to make sure it's
  // not too rapid (for performance reasons).
  throttleTimeout: 150,
  // Element to add the positionFixedClass to.
  positionFixedSelector: null,
  // Fixed position class to add to make sidebar fixed after scrolling
  // down past the fixedSidebarOffset.
  positionFixedClass: 'is-position-fixed',
  // fixedSidebarOffset can be any number but by default is set
  // to auto which sets the fixedSidebarOffset to the sidebar
  // element's offsetTop from the top of the document on init.
  fixedSidebarOffset: 'auto',
  // includeHtml can be set to true to include the HTML markup from the
  // heading node instead of just including the textContent.
  includeHtml: false,
  // onclick function to apply to all links in toc. will be called with
  // the event as the first parameter, and this can be used to stop,
  // propagation, prevent default or perform action
  onClick: function (e) {},
  // orderedList can be set to false to generate unordered lists (ul)
  // instead of ordered lists (ol)
  orderedList: true,
  // If there is a fixed article scroll container, set to calculate titles' offset
  scrollContainer: null,
  // prevent ToC DOM rendering if it's already rendered by an external system
  skipRendering: false,
  // Optional callback to change heading labels.
  // For example it can be used to cut down and put ellipses on multiline headings you deem too long.
  // Called each time a heading is parsed. Expects a string in return, the modified label to display.
  // function (string) => string
  headingLabelCallback: false,
  // ignore headings that are hidden in DOM
  ignoreHiddenElements: false,
  // Optional callback to modify properties of parsed headings.
  // The heading element is passed in node parameter and information parsed by default parser is provided in obj parameter.
  // Function has to return the same or modified obj.
  // The heading will be excluded from TOC if nothing is returned.
  // function (object, HTMLElement) => object | void
  headingObjectCallback: null,
  // Set the base path, useful if you use a `base` tag in `head`.
  basePath: '',
  // Only takes affect when `tocSelector` is scrolling,
  // keep the toc scroll position in sync with the content.
  disableTocScrollSync: false
};

/***/ }),

/***/ 2435:
/***/ ((module) => {

/**
 * This file is responsible for parsing the content from the DOM and making
 * sure data is nested properly.
 *
 * @author Tim Scanlin
 */

// -----------------------------------------------------------------------------
// ESLint shimming
// -----------------------------------------------------------------------------
/* eslint indent: "off"                                                       */
/* eslint no-undef: "off"                                                     */
/* eslint semi: "off"                                                         */
// -----------------------------------------------------------------------------

module.exports = function parseContent(options) {
  var reduce = [].reduce;

  /**
   * Get the last item in an array and return a reference to it.
   * @param {Array} array
   * @return {Object}
   */
  function getLastItem(array) {
    return array[array.length - 1];
  }

  /**
   * Get heading level for a heading dom node.
   * @param {HTMLElement} heading
   * @return {Number}
   */
  function getHeadingLevel(heading) {
    return +heading.nodeName.split('H').join('');
  }

  /**
   * Get important properties from a heading element and store in a plain object.
   * @param {HTMLElement} heading
   * @return {Object}
   */
  function getHeadingObject(heading) {
    // each node is processed twice by this method because nestHeadingsArray() and addNode() calls it
    // first time heading is real DOM node element, second time it is obj
    // that is causing problem so I am processing only original DOM node
    if (!(heading instanceof window.HTMLElement)) return heading;
    if (options.ignoreHiddenElements && (!heading.offsetHeight || !heading.offsetParent)) {
      return null;
    }
    var obj = {
      id: heading.id,
      children: [],
      nodeName: heading.nodeName,
      headingLevel: getHeadingLevel(heading),
      textContent: options.headingLabelCallback ? String(options.headingLabelCallback(heading.textContent)) : heading.textContent.trim()
    };
    if (options.includeHtml) {
      obj.childNodes = heading.childNodes;
    }
    if (options.headingObjectCallback) {
      return options.headingObjectCallback(obj, heading);
    }
    return obj;
  }

  /**
   * Add a node to the nested array.
   * @param {Object} node
   * @param {Array} nest
   * @return {Array}
   */
  function addNode(node, nest) {
    var obj = getHeadingObject(node);
    var level = obj.headingLevel;
    var array = nest;
    var lastItem = getLastItem(array);
    var lastItemLevel = lastItem ? lastItem.headingLevel : 0;
    var counter = level - lastItemLevel;
    while (counter > 0) {
      lastItem = getLastItem(array);
      if (lastItem && lastItem.children !== undefined) {
        array = lastItem.children;
      }
      counter--;
    }
    if (level >= options.collapseDepth) {
      obj.isCollapsed = true;
    }
    array.push(obj);
    return array;
  }

  /**
   * Select headings in content area, exclude any selector in options.ignoreSelector
   * @param {String} contentSelector
   * @param {Array} headingSelector
   * @return {Array}
   */
  function selectHeadings(contentSelector, headingSelector) {
    var selectors = headingSelector;
    if (options.ignoreSelector) {
      selectors = headingSelector.split(',').map(function mapSelectors(selector) {
        return selector.trim() + ':not(' + options.ignoreSelector + ')';
      });
    }
    try {
      return document.querySelector(contentSelector).querySelectorAll(selectors);
    } catch (e) {
      console.warn('Element not found: ' + contentSelector); // eslint-disable-line
      return null;
    }
  }

  /**
   * Nest headings array into nested arrays with 'children' property.
   * @param {Array} headingsArray
   * @return {Object}
   */
  function nestHeadingsArray(headingsArray) {
    return reduce.call(headingsArray, function reducer(prev, curr) {
      var currentHeading = getHeadingObject(curr);
      if (currentHeading) {
        addNode(currentHeading, prev.nest);
      }
      return prev;
    }, {
      nest: []
    });
  }
  return {
    nestHeadingsArray: nestHeadingsArray,
    selectHeadings: selectHeadings
  };
};

/***/ }),

/***/ 544:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

/*
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/modules/speak2me/js/speak2me.js
 # speak2me v.1.0 implementation (based on Articulate.js) for J1 Theme
 #
 # Product/Info:
 # https://jekyll.one
 # https://github.com/acoti/articulate.js/tree/master
 #
 # Copyright (C) 2023, 2024 Juergen Adams
 # Copyright (C) 2017 Adam Coti
 #
 # J1 Template is licensed under the MIT License.
 # See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 # Articulate is licensed under the MIT License.
 # See: https://github.com/acoti/articulate.js/blob/master/LICENSE
 # -----------------------------------------------------------------------------
*/

/* Articulate.js (1.1.0). (C) 2017 Adam Coti.
  MIT @license: en.wikipedia.org/wiki/MIT_License
  See Github page at: https://github.com/acoti/articulate.js
  See Web site at: https://purefreedom.com/articulate/
*/

/* Further reading
  https://dev.to/jankapunkt/cross-browser-speech-synthesis-the-hard-way-and-the-easy-way-353
  https://github.com/jankapunkt/easy-speech
*/

(function ($) {
  'use strict';

  const defaultOptions = __webpack_require__(6362);
  const ParseContent = __webpack_require__(2435);
  const parseContent = ParseContent(defaultOptions);
  const scrollBehavior = 'smooth';
  const speechCycle = 10;
  const speechMonitorCycle = 10;
  const textSliceLength = 30;
  const minWords = 3;
  const pageScanCycle = 1000;
  const pageScanLines = 10000;
  const isFirefox = /Firefox/i.test(navigator.userAgent);
  const isEdge = /Edg/i.test(navigator.userAgent);
  const chrome = /chrome/i.test(navigator.userAgent);
  const isChrome = chrome && !isEdge;
  const voiceUserDefault = 'Google UK English Female';
  const voiceChromeDefault = 'Google US English';
  const ignoreProvider = 'Microsoft';
  const sourceLanguage = document.getElementsByTagName("html")[0].getAttribute("lang");
  var defaultLanguage = '';
  var navigatorLanguage = navigator.language || navigator.userLanguage;
  var currentTranslation = getCookie('googtrans');
  var scrollBlockOffset = 100;
  var customOptions = {};
  var myOptions = {};
  var ignoreTagsUser = new Array();
  var recognizeTagsUser = new Array();
  var replacements = new Array();
  var customTags = new Array();
  var voices = new Array();
  var headingsArray = [];
  var rateDefault = 0.9;
  var pitchDefault = 1;
  var volumeDefault = 0.9;
  var rate = rateDefault;
  var pitch = pitchDefault;
  var volume = volumeDefault;
  var pause_spoken = ' — ';
  var chunkCounter = 0;
  var userStoppedSpeaking = false;
  var chunkSpoken = false;
  var lastScrollPosition = false;
  var rateUserDefault;
  var pitchUserDefault;
  var volumeUserDefault;
  var currentLanguage;
  var voiceLanguageDefault;
  var chunkCounterMax;
  var user_session;
  var scanFinished;
  var voiceLanguageGoogleDefault = {
    'de-DE': 'Google Deutsch',
    //  'en-US':  'Google US English',
    'en-GB': 'Google UK English Female',
    'es-ES': 'Google español',
    'fr-FR': 'Google français',
    //  'hi-IN':  'Google हिन्दी',
    //  'id-ID':  'Google Bahasa Indonesia',
    'it-IT': 'Google italiano'
    //  'jp-JP':  'Google 日本語',
    //  'ko-KR':  'Google 한국의',
    //  'nl-NL':  'Google Nederlands',
    //  'pl-PL':  'Google polski',
    //  'pt-BR':  'Google português do Brasil',
    //  'pt-PT':  'Google português',
    //  'ru-RU':  'Google русский',
    //  'zh-CN':  'Google 普通话（中国大陆)',
  };
  var voiceLanguageMicrosoftDefault = {
    //  'sq-AL':  'Microsoft Anila Online (Natural) - Albanian (Albania)',
    //  'ar-EG':  'Microsoft Salma Online (Natural) - Arabic (Egypt)',
    //  'bg-BG':  'Microsoft Kalina Online (Natural) - Bulgarian (Bulgaria)',
    //  'zh-CN':  'Microsoft Xiaoxiao Online (Natural) - Chinese (Mainland)',
    //  'hr-HR':  'Microsoft Gabrijela Online (Natural) - Croatian (Croatia)',
    //  'cs-CZ':  'Microsoft Antonin Online (Natural) - Czech (Czech)',
    //  'da-DK':  'Microsoft Christel Online (Natural) - Danish (Denmark)',
    //  'nl-NL':  'Microsoft Colette Online (Natural) - Dutch (Netherlands)',
    'en-GB': 'Microsoft Libby Online (Natural) - English (United Kingdom)',
    //  'en-US':  'Microsoft Aria Online (Natural) - English (United States)',
    //  'et-EE':  'Microsoft Anu Online (Natural) - Estonian (Estonia)',
    'es-ES': 'Microsoft Elvira Online (Natural) - Spanish (Spain)',
    //  'fi-FI':  'Microsoft Noora Online (Natural) - Finnish (Finland)',
    'fr-FR': 'Microsoft Denise Online (Natural) - French (France)',
    //  'ka-GE':  'Microsoft Giorgi Online (Natural) - Georgian (Georgia)',
    'de-DE': 'Microsoft Katja Online (Natural) - German (Germany)',
    //  'el-GR':  'Microsoft Athina Online (Natural) - Greek (Greece)',
    //  'he-IL':  'Microsoft Avri Online (Natural) - Hebrew (Israel)',
    //  'hi-IN':  'Microsoft Madhur Online (Natural) - Hindi (India)',
    //  'hu-HU':  'Microsoft Noemi Online (Natural) - Hungarian (Hungary)',
    'it-IT': 'Microsoft Elsa Online (Natural) - Italian (Italy)'
    //  'pl-PL' : 'Microsoft Zofia Online (Natural) - Polish (Poland)',
    //  'ja-JP':  'Microsoft Nanami Online (Natural) - Japanese (Japan)',
  };
  var voiceLanguageFirefoxDefault = {
    'en-GB': 'Microsoft Hazel - English (United Kingdom)',
    //  'en-US':  'Microsoft Zira Desktop - English (United States)',
    'de-DE': 'Microsoft Katja - German (Germany)'
  };
  if (sourceLanguage == 'en') {
    defaultLanguage = sourceLanguage + '-' + 'GB';
  } else {
    defaultLanguage = sourceLanguage + '-' + sourceLanguage.toUpperCase();
  }

  // ---------------------------------------------------------------------------
  // Internal functions
  // ---------------------------------------------------------------------------

  // scan a page to get correct positions for scrolling and highlightning
  //
  function scanPage(options) {
    // see: https://stackoverflow.com/questions/3163615/how-to-scroll-an-html-page-to-a-given-anchor
    // see: https://stackoverflow.com/questions/22154129/how-to-make-setinterval-behave-more-in-sync-or-how-to-use-settimeout-instea
    var line = options.startLine;
    var lines;
    function scanSection(counter) {
      // jadams, 2023-09-28:
      // because of the current translation in progress, the length
      // of a page may change to higher or lower values (asian)
      //
      lines = Math.max(document.body.scrollHeight, document.body.offsetHeight, document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight);
      $('#content').attr("style", "opacity: .3");
      if (line < lines) {
        setTimeout(function () {
          counter++;
          line = line + pageScanLines;
          window.scrollTo({
            top: line,
            behavior: 'smooth'
          });
          scanSection(counter);
        }, pageScanCycle);
      } else {
        setTimeout(function () {
          scanFinished = true;
          $('#content').attr("style", "opacity: 1");

          // jadams, 2023-09-28:
          // do NOT scroll on stop if paused
          // disabled
          // -------------------------------------------------------------------
          // if (!myOptions.isPaused) {
          //   window.scrollTo({top: 0, behavior: 'smooth'});
          // }
        }, pageScanCycle);
      }
    }
    scanSection({
      startLine: 0
    });
  } // END scanPage

  // merge (configuration) objects
  //
  function extend() {
    var target = {};
    for (var i = 0; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  } // END  extend

  // get the conten of a Cookie (by its name)
  //
  function getCookie(name) {
    var nameEQ = name + '=';
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) === ' ') {
        c = c.substring(1, c.length);
      }
      if (c.indexOf(nameEQ) === 0) {
        var value = c.substring(nameEQ.length, c.length);
        return value;
      }
    }
    return undefined;
  } // END getCookie

  function voiceTag(prepend, append) {
    this.prepend = prepend;
    this.append = append;
  } // END  voiceTag

  function voiceObj(name, language) {
    this.name = name;
    this.language = language;
  } // END voiceObj

  // count the number of words in a string
  //
  function wordCount(str) {
    var count = 0;
    var words = str.split(" ");
    for (var i = 0; i < words.length; i++) {
      // inner loop -- do the count
      if (words[i] != "") {
        count += 1;
      }
    }
    return count;
  } // END  wordCount

  // This populates the "voices" array with objects that represent the
  // available voices in the current browser. Each object has two
  // properties: name and language.
  // NOTE: the array is loaded asynchronously.
  //
  function populateVoiceList() {
    let systemVoicesText = 'systemVoices START - ';
    var systemVoices = speechSynthesis.getVoices();
    for (var i = 0; i < systemVoices.length; i++) {
      voices.push(new voiceObj(systemVoices[i].name, systemVoices[i].lang));
      // Collect available voices as text (for reference)
      //
      if (systemVoices[i].lang.includes("en") || systemVoices[i].lang.includes("de-DE") || systemVoices[i].lang.includes("es-ES") || systemVoices[i].lang.includes("pl") || systemVoices[i].lang.includes("nl")) {
        systemVoicesText += systemVoices[i].lang.toString();
        systemVoicesText += ' : ';
        systemVoicesText += systemVoices[i].name.toString();
        systemVoicesText += '\n';
      }
    }
    systemVoicesText += " - systemVoices END.";
  } // END populateVoiceList

  populateVoiceList();
  if (typeof speechSynthesis !== 'undefined' && speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = populateVoiceList;
  }

  // After checking for compatability, define the utterance object and
  // then cancel the speech immediately even though nothing is yet spoken.
  // This is to fix a quirk in Windows Chrome.
  //
  if ('speechSynthesis' in window) {
    var speech = new SpeechSynthesisUtterance();
    window.speechSynthesis.cancel();
  }
  if (currentTranslation === undefined) {
    // currentLanguage = 'en-US'
    currentLanguage = defaultLanguage;
  } else {
    var translation = currentTranslation.split('/');
    if (translation[2] == 'en') {
      currentLanguage = 'en-GB';
    } else if (translation[2].includes('ar')) {
      currentLanguage = 'ar-EG';
    } else if (translation[2].includes('cs')) {
      currentLanguage = 'cs-CZ';
    } else if (translation[2].includes('da')) {
      currentLanguage = 'da-DK';
    } else if (translation[2].includes('en')) {
      currentLanguage = 'en-UK';
    } else if (translation[2].includes('et')) {
      currentLanguage = 'et-EE';
    } else if (translation[2].includes('ka')) {
      currentLanguage = 'ka-GE';
    } else if (translation[2].includes('el')) {
      currentLanguage = 'el-GR';
    } else if (translation[2].includes('iw')) {
      currentLanguage = 'he-IL';
    } else if (translation[2].includes('hi')) {
      currentLanguage = 'hi-IN';
    } else if (translation[2].includes('ja')) {
      currentLanguage = 'ja-JP';
    } else if (translation[2].includes('zh')) {
      currentLanguage = 'zh-CN';
    } else {
      currentLanguage = translation[2] + '-' + translation[2].toUpperCase();
    }
  }
  if (isChrome) {
    var voiceLanguageDefault = voiceLanguageGoogleDefault[currentLanguage];
  }
  if (isEdge) {
    var voiceLanguageDefault = voiceLanguageMicrosoftDefault[currentLanguage];
  }
  if (isFirefox) {
    var voiceLanguageDefault = voiceLanguageFirefoxDefault[currentLanguage];
  }

  // ---------------------------------------------------------------------------
  // Public functions (methods)
  // ---------------------------------------------------------------------------
  //
  var methods = {
    // main speak2me method.
    //
    speak: function (options) {
      var toSpeak = '';
      var voiceTags = new Array();
      var _this = this;
      var obj, processed, finished;
      var ignoreTags;
      scanFinished = false;
      myOptions = extend(options, defaultOptions, customOptions || {});

      // scan page to find correct positions for scrolling and highlightning
      //
      if (!myOptions.isPaused) {
        scanPage({
          startLine: 0
        });
      } else {
        scanFinished = true;
      }

      // Default values
      //
      voiceTags['a'] = new voiceTag('Link' + pause_spoken, '');
      voiceTags['q'] = new voiceTag(pause_spoken, '');
      voiceTags['ol'] = new voiceTag(pause_spoken, '');
      voiceTags['ul'] = new voiceTag(pause_spoken, '');
      voiceTags['dl'] = new voiceTag(pause_spoken, '');
      voiceTags['dt'] = new voiceTag(pause_spoken, '');
      voiceTags['img'] = new voiceTag('Image element' + pause_spoken, 'Element not spoken' + pause_spoken);
      voiceTags['table'] = new voiceTag('Table element' + pause_spoken, 'Element not spoken' + pause_spoken);
      voiceTags['card-header'] = new voiceTag(pause_spoken, '');
      voiceTags['.doc-example'] = new voiceTag('Example element' + pause_spoken, 'Element not spoken' + pause_spoken);
      voiceTags['.admonitionblock'] = new voiceTag('Attention element' + pause_spoken, pause_spoken);
      voiceTags['.listingblock'] = new voiceTag('Text element' + pause_spoken, 'Element not spoken' + pause_spoken);
      voiceTags['.gist'] = new voiceTag('Gist element' + pause_spoken, 'Element not spoken' + pause_spoken);
      voiceTags['.slider'] = new voiceTag('Slider element' + pause_spoken, 'Element not spoken' + pause_spoken);
      voiceTags['.modal'] = new voiceTag('Info element' + pause_spoken, 'Element not spoken' + pause_spoken);
      voiceTags['.masonry'] = new voiceTag('Masonry element' + pause_spoken, 'Element not spoken' + pause_spoken);
      voiceTags['.lightbox-block'] = new voiceTag('Lightbox element' + pause_spoken, 'Element not spoken' + pause_spoken);
      voiceTags['.gallery'] = new voiceTag('Gallery element' + pause_spoken, 'Element not spoken' + pause_spoken);
      voiceTags['.audioblock'] = new voiceTag('Audio element' + pause_spoken, 'Element not spoken' + pause_spoken);
      voiceTags['.videoblock'] = new voiceTag('Video element' + pause_spoken, 'Element not spoken' + pause_spoken);
      voiceTags['.videojs-player'] = new voiceTag('Video element' + pause_spoken, 'Element not spoken' + pause_spoken);
      voiceTags['.youtube-player'] = new voiceTag('Video element' + pause_spoken, 'Element not spoken' + pause_spoken);
      voiceTags['.dailymotion-player'] = new voiceTag('Video element' + pause_spoken, 'Element not spoken' + pause_spoken);
      voiceTags['.vimeo-player'] = new voiceTag('Video element' + pause_spoken, 'Element not spoken' + pause_spoken);
      voiceTags['.wistia-player'] = new voiceTag('Video element' + pause_spoken, 'Element not spoken' + pause_spoken);
      voiceTags['figure'] = new voiceTag('Figure element' + pause_spoken, 'Element not spoken' + pause_spoken);
      voiceTags['parallax-quoteblock'] = new voiceTag('', pause_spoken);
      voiceTags['blockquote'] = new voiceTag('', pause_spoken);
      voiceTags['quoteblock'] = new voiceTag('', pause_spoken);
      ignoreTags = ['audio', 'button', 'canvas', 'code', 'del', 'pre', 'dialog', 'embed', 'form', 'head', 'iframe', 'meter', 'nav', 'noscript', 'object', 'picture', 'script', 'select', 'style', 'textarea', 'video'];

      // TODO: NOT working for multiple 'tab' windows
      // dispayed in the same browser
      //
      // If something is currently being spoken, ignore new voice
      // request. Otherwise it would be queued, which is doable if
      // someone wanted that, but not what I wanted.
      //
      if (window.speechSynthesis.speaking) {
        return;
      }
      ;

      // TODO: coincident active speech synthesis in multiple
      // browser windows or tabs does NOT work
      //
      // user_session = j1.readCookie('j1.user.session');
      // if (user_session.speech_synthesis_active === true) {
      //     return
      // };

      // user_session.speech_synthesis_active  = true;
      // j1.writeCookie({
      //   name:     'user_session',
      //   data:     user_session,
      //   secure:   false,
      //   expires:  0
      // });

      // top-level function to prepare the HTML content of a page
      // and transform the resulting (speakable) text into chunks
      //
      var processSpeech = setInterval(function () {
        if (scanFinished) {
          // Cycle through all the elements in the original $
          // selector, process and clean them one at a time, and
          // continually append it to the variable "toSpeak".
          //
          _this.each(function () {
            obj = $(this).clone(); // clone the DOM node and its descendants of what the user wants spoken
            processed = processDOMelements(obj); // process and manipulate DOM tree of this clone
            processed = $(processed).html(); // convert the result of all that to a string
            finished = cleanDOMelements(processed); // do some text manipulation
            toSpeak = finished;
          });

          // Check if users have set their own rate/pitch/volume
          // defaults, otherwise use defaults
          //
          if (rateUserDefault !== undefined) {
            rate = rateUserDefault;
          } else {
            rate = rateDefault;
          }
          if (pitchUserDefault !== undefined) {
            pitch = pitchUserDefault;
          } else {
            pitch = pitchDefault;
          }
          if (volumeUserDefault !== undefined) {
            volume = volumeUserDefault;
          } else {
            volume = volumeDefault;
          }

          // create and configure the utterance object
          //
          speech = new SpeechSynthesisUtterance();
          speech.rate = rate;
          speech.pitch = pitch;
          speech.volume = volume;
          speech.voice = speechSynthesis.getVoices().filter(function (voice) {
            return voice.name == voiceLanguageDefault;
          })[0];
          speech.previousScrollPosition = 0;
          processTextChunks(speech, toSpeak);
          clearInterval(processSpeech);
        }
      }, speechCycle); // END processSpeech

      // create the chunks array from (speakable) text generated
      //
      function splitTextIntoChunks(text) {
        var chunks = [];

        // strip strange elements from text
        // unclear why a elements of ' >' is generated in text
        // may caused by a HTML tag
        //
        text = text.replace(/^\s+>/gm, '');
        text = text.replaceAll(' ..', '.');

        // cleanup text
        //
        text = text.replace(/(\r\n|\n|\r)/gm, '');
        text = text.replace(/\s+/gm, ' ');
        chunks = text.split('.');

        // 1st cleanup of chunks
        //
        chunks.forEach((chunk, index) => {
          chunks[index] = chunks[index].replace(/^\s+/g, '');
          chunks[index] = chunks[index].replaceAll('""', '');
        });

        // 2nd cleanup of chunks (delete chunks NOT speakable)
        //
        chunks.forEach((chunk, index) => {
          if (chunks[index].length > 0) {
            chunks[index] = chunks[index] + '. ';
          } else {
            // remove empty text element from chunks array
            //
            chunks.splice(index, 1);
          }
        });

        // 3rd cleanup of chunks (delete empty chunks)
        //
        chunks.forEach((chunk, index) => {
          if (chunks[index].length == 0) {
            // remove empty text element from chunks array
            chunks.splice(index, 1);
          }
        });

        // build the chunk OBJECT array
        //
        var chunkSet = [];
        chunks.forEach((chunk, index) => {
          var text = chunks[index];
          var sectionText = textSlice(text, textSliceLength, minWords);
          var $paragraph = $('#content').find("p:contains('" + sectionText + "')");
          var offset;
          if ($paragraph.length > 0) {
            offset = Math.round($paragraph[0].offsetTop);
          } else {
            offset = undefined;
            $paragraph = undefined;
          }
          chunkSet.push({
            text: text,
            offsetTop: offset,
            $paragraph: $paragraph
          });
        });

        // create the headings array
        //
        headingsArray = parseContent.selectHeadings(defaultOptions.contentSelector, defaultOptions.headingSelector);

        // parse the headingsArray to add missing offset values
        //
        chunkSet.forEach((chunk, index) => {
          var text;
          var innerText;
          if (chunk.offset === undefined) {
            // cleanup the spoken text for compare
            //
            text = chunk.text.replaceAll('. ', '');
            if (headingsArray !== null) {
              // see: https://stackoverflow.com/questions/29285897/difference-between-for-in-and-for-of-statements
              // for in loops over enumerable property names of an object
              // for of (new in ES6) does use an object-specific iterator
              // and loops over the values generated by that.
              // for (var node in headingsArray) {
              for (var node of headingsArray) {
                // cleanup the innerText for compare
                //
                innerText = node.innerText.replaceAll('?', '');
                innerText = node.innerText.replaceAll('!', '');
                innerText = node.innerText + pause_spoken;
                if (innerText == text) {
                  var headline = $('#' + node.id);
                  if (headline.length > 0) {
                    var offsetTop = headline.offset().top;
                    chunk.offsetTop = Math.round(offsetTop);
                    //                    console.debug('speak2me, text: ' + node.innerText + ', offsetTop: ' + chunk.offsetTop);
                  } else {
                    //                    console.warn('speak2me, text: ' + node.innerText + ', offsetTop not caclulated.');
                  } // END if headline.length
                } // END if innerText
              } // END for headingsArray
            } // END if headingsArray
          } // END if chunk.offset
        }); // END forEach chunkSet

        return chunkSet;
      }

      // create a slice of text used later to identify the
      // containing paragraph
      //
      function textSlice(text, slicelenght, wordsMin) {
        var startSubString = 0;
        var endSubString = startSubString + slicelenght;
        var subText = text.substr(startSubString, endSubString);
        var stringArray = subText.split(/(\s+)/);
        var words;

        // remove last two elements are a fraction of subText
        //
        stringArray.pop();
        stringArray.pop();

        // build the new string
        //
        subText = stringArray.join('');
        subText = subText.replaceAll('.', '');

        // at least wordsMin words are required
        //
        words = wordCount(subText);
        if (words < wordsMin) {
          console.debug('j1.core.speak2me: no search possible on this fraction of subText: ' + subText);
          console.debug('j1.core.speak2me: number of words found: ' + words + ' lower that words min: ' + wordsMin);
          return undefined;
        } else {
          return subText;
        }
      }

      // process chunks (to speak) sequentially
      //
      function processTextChunks(speaker, chunks) {
        const synth = window.speechSynthesis;

        // indicate active converter in the quicklinks bar
        //
        $('.mdib-speaker').addClass('mdib-spin');

        // listener to ENABLE highlightning and scrolling
        // on active spoken elements
        //
        speaker.addEventListener('start', event => {
          // scroll on ALL valid offsetTop for headings and paragraphs
          //
          if (speaker.offsetTop !== undefined) {
            // skip scrolling if offsetTop position is LOWER than expected
            //
            if (speaker.offsetTop >= speaker.previousScrollPosition) {
              window.scrollTo({
                top: speaker.offsetTop - scrollBlockOffset,
                behavior: scrollBehavior
              });
            }
          }

          // manage highlightning on currently spoken paragraph
          //
          if (speaker.$paragraph !== undefined) {
            speaker.$paragraph.addClass('speak-highlighted');
          }
        });

        // listener to STOP highlightning for already spoken
        // text elements and set next chunk to speak
        //
        speaker.addEventListener('end', function (event) {
          // workaround to detect offsetTop positions LOWER than expected
          //
          if (speaker.offsetTop !== undefined) {
            if (speaker.offsetTop >= speaker.previousScrollPosition) {
              speaker.previousScrollPosition = speaker.offsetTop;
            }
            lastScrollPosition = speaker.offsetTop - scrollBlockOffset;
          }

          // remove highlightning for the paragraph already spoken
          //
          if (speaker.$paragraph !== undefined) {
            speaker.$paragraph.removeClass('speak-highlighted');
          }
          chunkSpoken = false;
          chunkCounter++;
        });

        // loop to prepare ALL chunks to speak or STOP the voice output
        //
        var wasRunOnce = false;
        var speechMonitor = setInterval(function () {
          // check if all chunks (text) are spoken
          //
          if (chunkCounter == chunkCounterMax || userStoppedSpeaking) {
            chunkCounter = 0;
            userStoppedSpeaking = false;
            chunkSpoken = false;
            speaker.$paragraph !== undefined && speaker.$paragraph.removeClass('speak-highlighted');

            // jadams, 2023-09-28:
            // do NOT scroll on stop if paused
            // disabled
            // -----------------------------------------------------------------
            // if (!myOptions.isPaused) {
            //   window.scrollTo({top: 0, behavior: 'smooth'});
            // }

            // remove speak indication;
            $('.mdib-speaker').removeClass('mdib-spin');
            clearInterval(speechMonitor);
          } else {
            if (!wasRunOnce && myOptions.isPaused) {
              chunkCounter = myOptions.lastChunk;
              wasRunOnce = true;
            }

            // prepare speaker data and start the voice
            //
            speaker.text = chunks[chunkCounter].text;
            speaker.offsetTop = chunks[chunkCounter].offsetTop;
            speaker.$paragraph = chunks[chunkCounter].$paragraph;

            // speak current text line
            if (!chunkSpoken) {
              synth.speak(speaker);
              chunkSpoken = true;
            }
          }
        }, speechMonitorCycle); // END speechMonitor
      } // END processTextChunks

      // transform all configured DOM elements of a page that
      // can be spoken into plain text
      //
      function processDOMelements(clone) {
        var copy, title, title_element, content_type, content_element, content, appended, prepend;

        // Remove tags from the "ignoreTags" array because the
        // user called "speak2me('recognize')" and said he/she
        // doesn't want some tags un-spoken. Double negative there,
        // but it does make sense.
        //
        if (recognizeTagsUser.length > 0) {
          for (var prop in recognizeTagsUser) {
            var index = ignoreTags.indexOf(recognizeTagsUser[prop]);
            if (index > -1) {
              ignoreTags.splice(index, 1);
            }
          }
        }
        ;

        // Remove DOM objects listed in the "ignoreTags" array
        //
        for (var prop in ignoreTags) {
          $(clone).find(ignoreTags[prop]).addBack(ignoreTags[prop]).not('[data-speak2me-recognize]').each(function () {
            $(this).html('');
          });
        }
        ;

        // Remove DOM objects specified in the "ignoreTagsUser" array
        // Specified when calling "speak2me('ignore')".
        //
        if (ignoreTagsUser.length > 0) {
          for (var prop in ignoreTagsUser) {
            $(clone).find(ignoreTagsUser[prop]).addBack(ignoreTagsUser[prop]).not('[data-speak2me-recognize]').each(function () {
              $(this).html('');
            });
          }
          ;
        }
        ;

        // Remove DOM objects marked in the HTML code by "data-speak2me-ignore".
        //
        $(clone).find('[data-speak2me-ignore]').addBack('[data-speak2me-ignore]').each(function () {
          $(this).html('');
        });

        // Remove DOM objects in the HTML code mareked by class "speak2me-ignore".
        //
        $(clone).find('.speak2me-ignore').addBack('[data-speak2me-ignore]').each(function () {
          $(this).html('');
        });

        // Search for prepend data specified in the HTML code by "data-speak2me-prepend".
        //
        $(clone).find('[data-speak2me-prepend]').addBack('[data-speak2me-prepend]').each(function () {
          copy = $(this).data('speak2me-prepend');
          $(this).prepend(copy + ' ');
        });

        // Search for append data specified in the HTML code by "data-speak2me-append".
        //
        $(clone).find('[data-speak2me-append]').addBack('[data-speak2me-append]').each(function () {
          copy = $(this).data('speak2me-append');
          $(this).append(' ' + copy);
        });

        // Search for tags to prepend and append specified by the "voiceTags" array.
        //
        var count = 0;
        for (var tag in voiceTags) {
          $(clone).find(tag).each(function () {
            if (customTags[tag]) {
              $(this).prepend(customTags[tag].prepend + pause_spoken);
              $(this).append(customTags[tag].append + pause_spoken);
            } else {
              $(this).prepend(voiceTags[tag].prepend + pause_spoken);
              $(this).append(voiceTags[tag].append + pause_spoken);
            }
            ;
          });
        }
        ;

        // Search for <h1> through <h6> and <li> and <br> to add
        // a pause at the end of those tags. This is done
        // because these tags require a pause, but often don't
        // have a comma or period at the end of their text.
        //
        $(clone).find('h1,h2,h3,h4,h5,h6,p,li').addBack('h1,h2,h3,h4,h5,h6,p,li').each(function () {
          var text = $(this)[0].innerText;
          text.replace(/\s+/g, '\s');
          text = text + pause_spoken;
          $(this)[0].innerText = text;
        });

        // Search for <br> tags to add a pause at the end.
        $(clone).find('br').each(function () {
          $(this).append(pause_spoken);
        });

        // Search for <figure>, check for <figcaption>, insert
        // that text if exists and then remove the whole DOM object.
        //
        $(clone).find('figure').addBack('figure').each(function () {
          copy = $(this).find('figcaption').html();
          if (customTags['figure']) {
            prepend = customTags['figure'].prepend;
          } else {
            prepend = voiceTags['figure'].prepend;
          }
          if (copy != undefined && copy !== '') {
            $('<div>' + prepend + pause_spoken + copy + '</div>').insertBefore(this);
          }
          $(this).remove();
        });

        // Search for <image> tags, check for ALT attribute, and insert
        // text if exists and then dinally remove the DOM object.
        // NOTE: had to make adjustments for nesting in <picture> tags.
        //
        $(clone).find('img').addBack('img').each(function () {
          copy = $(this).attr('alt');
          var parent = $(this).parent();
          var parentName = parent.get(0).tagName;
          if (customTags['img']) {
            prepend = customTags['img'].prepend;
          } else {
            prepend = voiceTags['img'].prepend;
          }
          if (copy !== undefined && copy != '') {
            if (parentName == 'PICTURE') {
              var par;
              $('<div>' + prepend + pause_spoken + copy + pause_spoken + '</div>').insertBefore(parent);
            } else {
              $('<div>' + prepend + pause_spoken + copy + pause_spoken + '</div>').insertBefore(this);
            }
          }
          $(this).remove();
        });

        // TODO: identify why the text 'Follow the link' is
        // already placed on the anchor
        //
        $(clone).find('a').addBack('a').each(function () {
          var anchor = $(this);
          copy = anchor[0].innerText;
          prepend = voiceTags['a'].prepend;
          appended = voiceTags['a'].append;
          $('<div>' + copy + '</div>').insertBefore(this);
          $('<div>' + appended + '</div>').insertBefore(this);
          $(this).remove();
        });

        // Search for admonition block elements and extract the type and
        // content. Insert type and content and then remove the DOM object.
        //
        $(clone).find('.admonitionblock').addBack('.admonitionblock').each(function () {
          content_type = this.classList[1];
          content_element = $(this).find('.content');
          content = content_element[0].innerText;
          prepend = voiceTags['.admonitionblock'].prepend + content_type + '. ';
          appended = voiceTags['.admonitionblock'].append;
          if (content !== undefined && content != '') {
            $('<div>' + prepend + ' ' + content + '</div>').insertBefore(this);
            $('<div>' + appended + '</div>').insertBefore(this);
          }
          $(this).remove();
        });

        // Search for parallax quote block elements.
        //
        $(clone).find('.parallax-quoteblock').addBack('.parallax-quoteblock').each(function () {
          content_element = $(this).find('.quote-text');
          content = content_element[0].innerText + '' + pause_spoken;
          prepend = voiceTags['quoteblock'].prepend;
          appended = voiceTags['quoteblock'].append;
          if (content !== undefined && content != '') {
            $('<div>' + prepend + pause_spoken + content + '</div>').insertBefore(this);
            $('<div>' + appended + pause_spoken + '</div>').insertBefore(this);
          }
          $(this).remove();
        });

        // Search for quote block elements.
        //
        $(clone).find('.quoteblock').addBack('.quoteblock').each(function () {
          var attribution = $(this).find('.attribution');
          content_element = $(this).find('blockquote');
          content = content_element[0].innerText + '' + attribution[0].innerText;
          prepend = voiceTags['quoteblock'].prepend;
          appended = voiceTags['quoteblock'].append;
          if (content !== undefined && content != '') {
            $('<div>' + prepend + pause_spoken + content + '</div>').insertBefore(this);
            $('<div>' + appended + pause_spoken + '</div>').insertBefore(this);
          }
          $(this).remove();
        });

        // Search for <table> tags, check for <caption>, insert text
        // if exists and then remove the DOM object.
        //
        $(clone).find('table').addBack('table').each(function () {
          copy = $(this).find('caption').text();
          prepend = voiceTags['table'].prepend;
          appended = voiceTags['table'].append;
          if (copy !== undefined && copy != '') {
            $('<div>' + prepend + pause_spoken + copy + '</div>').insertBefore(this);
            $('<div>' + appended + pause_spoken + '</div>').insertBefore(this);
          } else {
            $('<div>' + prepend + pause_spoken + '</div>').insertBefore(this);
            $('<div>' + appended + pause_spoken + '</div>').insertBefore(this);
          }
          $(this).remove();
        });

        // Search for HTML5 audio players, check for the title and insert text
        // if exists and then remove the DOM object.
        //
        $(clone).find('.audioblock').addBack('.audioblock').each(function () {
          copy = $(this).find('.title').text();
          prepend = voiceTags['.audioblock'].prepend;
          appended = voiceTags['.audioblock'].append;
          if (copy !== undefined && copy != '') {
            $('<div>' + prepend + 'with the title, ' + copy + pause_spoken + '</div>').insertBefore(this);
            $('<div>' + appended + '</div>').insertBefore(this);
          } else {
            $('<div>' + prepend + '</div>').insertBefore(this);
            $('<div>' + appended + '</div>').insertBefore(this);
          }
          $(this).remove();
        });

        // Search for HTML5 video players, check for the title and insert text
        // if exists and then remove the DOM object.
        //
        $(clone).find('.videoblock').addBack('.videoblock').each(function () {
          copy = $(this).find('.title').text();
          prepend = voiceTags['.videoblock'].prepend;
          appended = voiceTags['.videoblock'].append;
          if (copy !== undefined && copy != '') {
            $('<div>' + prepend + 'with the title, ' + copy + pause_spoken + '</div>').insertBefore(this);
            $('<div>' + appended + '</div>').insertBefore(this);
          } else {
            $('<div>' + prepend + '</div>').insertBefore(this);
            $('<div>' + appended + '</div>').insertBefore(this);
          }
          $(this).remove();
        });

        // Search for VideoJS players, check for the title and insert text
        // if exists and then remove the DOM object.
        //
        $(clone).find('.videojs-player').addBack('.videojs-player').each(function () {
          copy = $(this).find('.video-title').text();
          prepend = voiceTags['.videojs-player'].prepend;
          appended = voiceTags['.videojs-player'].append;
          if (copy !== undefined && copy != '') {
            $('<div>' + prepend + 'with the title, ' + copy + pause_spoken + '</div>').insertBefore(this);
            $('<div>' + appended + '</div>').insertBefore(this);
          } else {
            $('<div>' + prepend + '</div>').insertBefore(this);
            $('<div>' + appended + '</div>').insertBefore(this);
          }
          $(this).remove();
        });

        // Search for YouTube players, check for the title and insert text
        // if exists and then remove the DOM object.
        //
        $(clone).find('.youtube-player').addBack('.youtube-player').each(function () {
          copy = $(this).find('.video-title').text();
          prepend = voiceTags['.youtube-player'].prepend;
          appended = voiceTags['.youtube-player'].append;
          if (copy !== undefined && copy != '') {
            $('<div>' + prepend + 'with the title, ' + copy + pause_spoken + '</div>').insertBefore(this);
            $('<div>' + appended + '</div>').insertBefore(this);
          } else {
            $('<div>' + prepend + '</div>').insertBefore(this);
            $('<div>' + appended + '</div>').insertBefore(this);
          }
          $(this).remove();
        });

        // Search for Dailymotion players, check for the title and insert text
        // if exists and then remove the DOM object.
        //
        $(clone).find('.dailymotion-player').addBack('.dailymotion-player').each(function () {
          copy = $(this).find('.video-title').text();
          prepend = voiceTags['.dailymotion-player'].prepend;
          appended = voiceTags['.dailymotion-player'].append;
          if (copy !== undefined && copy != '') {
            $('<div>' + prepend + 'with the title, ' + copy + pause_spoken + '</div>').insertBefore(this);
            $('<div>' + appended + '</div>').insertBefore(this);
          } else {
            $('<div>' + prepend + '</div>').insertBefore(this);
            $('<div>' + appended + '</div>').insertBefore(this);
          }
          $(this).remove();
        });

        // Search for Vimeo players, check for the title and insert text
        // if exists and then remove the DOM object.
        //
        $(clone).find('.vimeo-player').addBack('.vimeo-player').each(function () {
          copy = $(this).find('.video-title').text();
          prepend = voiceTags['.vimeo-player'].prepend;
          appended = voiceTags['.vimeo-player'].append;
          if (copy !== undefined && copy != '') {
            $('<div>' + prepend + 'with the title, ' + copy + pause_spoken + '</div>').insertBefore(this);
            $('<div>' + appended + '</div>').insertBefore(this);
          } else {
            $('<div>' + prepend + '</div>').insertBefore(this);
            $('<div>' + appended + '</div>').insertBefore(this);
          }
          $(this).remove();
        });

        // Search for Wistia players, check for the title and insert text
        // if exists and then remove the DOM object.
        //
        $(clone).find('.wistia-player').addBack('.wistia-player').each(function () {
          copy = $(this).find('.video-title').text();
          prepend = voiceTags['.wistia-player'].prepend;
          appended = voiceTags['.wistia-player'].append;
          if (copy !== undefined && copy != '') {
            $('<div>' + prepend + 'with the title, ' + copy + pause_spoken + '</div>').insertBefore(this);
            $('<div>' + appended + '</div>').insertBefore(this);
          } else {
            $('<div>' + prepend + '</div>').insertBefore(this);
            $('<div>' + appended + '</div>').insertBefore(this);
          }
          $(this).remove();
        });

        // Search for cards|header elements and then remove the DOM object.
        //
        $(clone).find('.card-header').addBack('card-header').each(function () {
          title_element = $(this).find('.card-title');
          prepend = voiceTags['card-header'].prepend;
          appended = voiceTags['card-header'].append;
          if (title_element.length) {
            title = title_element[0].innerText + pause_spoken;
          } else {
            title = '';
          }
          $('<div>' + prepend + pause_spoken + '</div>').insertBefore(this);
          $('<div>' + appended + pause_spoken + title + '</div>').insertBefore(this);
          $(title_element).remove();
        });

        // Search for doc-example elements and then remove the DOM object.
        //
        $(clone).find('.doc-example').addBack('.doc-example').each(function () {
          prepend = voiceTags['.doc-example'].prepend;
          appended = voiceTags['.doc-example'].append;
          $('<div>' + prepend + pause_spoken + '</div>').insertBefore(this);
          $('<div>' + appended + pause_spoken + '</div>').insertBefore(this);
          $(this).remove();
        });

        // Search for listing block elements, check for previous declared <div>
        // container that contains the title element and insert the
        // text if exists and then finally remove the DOM object.
        //
        $(clone).find('.listingblock').addBack('.listingblock').each(function () {
          title_element = $(this).find('.title');
          if (title_element.length) {
            copy = title_element[0].innerText;
          } else {
            copy = '';
          }
          prepend = voiceTags['.listingblock'].prepend;
          appended = voiceTags['.listingblock'].append;
          if (copy !== undefined && copy != '') {
            $('<div>' + prepend + ' with the title,' + copy + pause_spoken + '</div>').insertBefore(this);
            $('<div>' + appended + '</div>').insertBefore(this);
          } else {
            $('<div>' + prepend + pause_spoken + '</div>').insertBefore(this);
            $('<div>' + appended + pause_spoken + '</div>').insertBefore(this);
          }
          $(this).remove();
        });

        // Search for gist elements, check for previous declared <div>
        // container that contains the title element and insert the
        // text if exists and finally remove the DOM object.
        //
        $(clone).find('.gist').addBack('.gist').each(function () {
          if ($(this).prev()[0] !== undefined) {
            title = $(this).prev()[0].innerText;
            title_element = $(this).prev();
            // remove the title 'before' the DOM object deleted
            //
            $(title_element).remove();
          } else {
            title = '';
          }
          prepend = voiceTags['.gist'].prepend;
          appended = voiceTags['.gist'].append;
          if (title !== undefined && title != '') {
            $('<div>' + prepend + ' with the title, ' + title + pause_spoken + '</div>').insertBefore(this);
            $('<div>' + appended + '</div>').insertBefore(this);
          } else {
            $('<div>' + prepend + pause_spoken + '</div>').insertBefore(this);
            $('<div>' + appended + pause_spoken + '</div>').insertBefore(this);
          }
          $(this).remove();
        });

        // Search for BS modal elements, if exists remove the DOM object.
        //
        $(clone).find('.modal').addBack('.modal').each(function () {
          $(this).remove();
        });

        // Search for masonry elements, check for previous declared <div>
        // container that contains the title element and insert the
        // text if exists and finally remove the DOM object.
        //
        $(clone).find('.masonry').addBack('.masonry').each(function () {
          if ($(this).prev()[0] !== undefined) {
            title = $(this).prev()[0].innerText;
            title_element = $(this).prev();
            // remove the title 'before' the DOM object deleted
            //
            $(title_element).remove();
          } else {
            title = '';
          }
          prepend = voiceTags['.masonry'].prepend;
          appended = voiceTags['.masonry'].append;
          if (title !== undefined && title != '') {
            $('<div>' + prepend + ' with the title,' + title + pause_spoken + '</div>').insertBefore(this);
            $('<div>' + appended + '</div>').insertBefore(this);
          } else {
            $('<div>' + prepend + pause_spoken + '</div>').insertBefore(this);
            $('<div>' + appended + pause_spoken + '</div>').insertBefore(this);
          }
          $(this).remove();
        });

        // Search for slider elements, check for previous declared <div>
        // container that contains the title element and insert the
        // text if exists and finally remove the DOM object.
        //
        $(clone).find('.slider').addBack('.slider').each(function () {
          if ($(this).prev()[0] !== undefined) {
            title = $(this).prev()[0].innerText;
            title_element = $(this).prev();
            // remove the title 'before' the DOM object deleted
            //
            $(title_element).remove();
          } else {
            title = '';
          }
          prepend = voiceTags['.slider'].prepend;
          appended = voiceTags['.slider'].append;
          if (title !== undefined && title != '') {
            $('<div>' + prepend + ' with the title, ' + title + pause_spoken + '</div>').insertBefore(this);
            $('<div>' + appended + '</div>').insertBefore(this);
          } else {
            $('<div>' + prepend + pause_spoken + '</div>').insertBefore(this);
            $('<div>' + appended + pause_spoken + '</div>').insertBefore(this);
          }
          $(this).remove();
        });

        // Search for gallery elements, check for previous declared <div>
        // container that contains the title element and insert the
        // text if exists and finally remove the DOM object.
        //
        $(clone).find('.gallery').addBack('.gallery').each(function () {
          if ($(this).prev()[0] !== undefined) {
            title = $(this).prev()[0].innerText;
            title_element = $(this).prev();
            // remove the title BEFORE the DOM object gets deleted
            //
            $(title_element).remove();
          } else {
            title = '';
          }
          prepend = voiceTags['.gallery'].prepend;
          appended = voiceTags['.gallery'].append;
          if (title !== undefined && title != '') {
            prepend !== '' && $('<div>' + prepend + ' with the title ' + title + pause_spoken + '</div>').insertBefore(this);
            appended !== '' && $('<div>' + appended + '</div>').insertBefore(this);
          } else {
            prepend !== '' && $('<div>' + prepend + pause_spoken + '</div>').insertBefore(this);
            appended !== '' && $('<div>' + appended + pause_spoken + '</div>').insertBefore(this);
          }
          $(this).remove();
        });

        // Search for a lightbox blocks and extract the <caption> tag data,
        // insert the text if exists and finally remove the DOM object.
        //
        $(clone).find('.lightbox-block').addBack('.lightbox-block').each(function () {
          if ($(this).prev()[0] !== undefined) {
            title = $(this).prev()[0].innerText;
            title_element = $(this).prev();
            // remove the title 'before' the DOM object deleted
            //
            $(title_element).remove();
          } else {
            title = '';
          }
          prepend = voiceTags['.lightbox-block'].prepend;
          appended = voiceTags['.lightbox-block'].append;
          if (title !== undefined && title != '') {
            $('<div>' + prepend + ' with the title,' + title + pause_spoken + '</div>').insertBefore(this);
            $('<div>' + appended + '</div>').insertBefore(this);
          } else {
            $('<div>' + prepend + pause_spoken + '</div>').insertBefore(this);
            $('<div>' + appended + pause_spoken + '</div>').insertBefore(this);
          }
          $(this).remove();
        });

        // Search for DOM object to be replaced specified in
        // the HTML code by "data-speak2me-swap".
        //
        $(clone).find('[data-speak2me-swap]').addBack('[data-speak2me-swap]').each(function () {
          copy = $(this).data('speak2me-swap');
          $(this).text(copy);
        });

        // Search for DOM object to spelled out specified in
        // the HTML code by "data-speak2me-spell".
        //
        $(clone).find('[data-speak2me-spell]').addBack('[data-speak2me-spell]').each(function () {
          copy = $(this).text();
          copy = copy.split('').join(' ');
          $(this).text(copy);
        });
        return clone;
      }

      // run final cleanups on all DOM elements processed.
      //
      function cleanDOMelements(final) {
        var start, ended, speak, part1, part2, final;

        // Search for <speak2me> in comments, copy the text,
        // place it outside the comment, and then splice together
        // "final" string again, which omits the comment.
        //
        while (final.indexOf('<!-- <speak2me>') != -1) {
          start = final.indexOf('<!-- <speak2me>');
          ended = final.indexOf('</speak2me> -->', start);
          if (ended == -1) {
            break;
          }
          speak = final.substring(start + 17, ended);
          part1 = final.substring(0, start);
          part2 = final.substring(ended + 17);
          final = part1 + ' ' + speak + ' ' + part2;
        }
        ;

        // Strip out remaining comments.
        //
        final = final.replace(/<!--[\s\S]*?-->/g, '');

        // Strip out remaining HTML tags.
        //
        final = final.replace(/(<([^>]+)>)/ig, '');

        // Replace a string of characters with another as specified
        // by "speak2me('replace')".
        //
        var len = replacements.length;
        var i = 0;
        var old, rep;
        while (i < len) {
          old = replacements[i];
          old = old.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
          rep = replacements[i + 1] + ' ';
          var regexp = new RegExp(old, 'gi');
          var final = final.replace(regexp, rep);
          i = i + 2;
        }

        // Remove double quotes.
        //
        final = final.replaceAll('"', '');
        final = final.replaceAll('“', '');
        final = final.replaceAll('”', '');

        // Remove all colon ':' and replace by a dot.
        //
        final = final.replaceAll(':', '.');

        // Replace all strange '., ' by a pause.
        //
        final = final.replaceAll('., ', '. ');
        final = final.replaceAll(' , ', ', ');

        // Remove strange double pause elements.
        //
        final = final.replaceAll('. .', '');
        final = final.replaceAll(', .', '');
        final = final.replaceAll('  ,  ', '');

        // Replace empty lines.
        //
        final = final.replace(/^$/g, '\n');
        final = final.replace(/^\s+$/g, '\n');

        // Replace single full stops in line ' . ' or '. '.
        //
        final = final.replace(/\s+\.\s+/g, '\n');
        final = final.replace(/\s+\.\s+$/g, '\n');

        // Replace strange double full stops '..'.
        //
        final = final.replace(/\.\./g, '.');

        // Replace the abbreviations '.e.g.', 'E.g.' and 'etc.'.
        //
        final = final.replaceAll('e.g.', 'for example');
        final = final.replaceAll('E.g.', 'For example, ');
        final = final.replaceAll('etc.', 'and so on, ');

        // Replace language specific abbreviations.
        // NOTE: may required for some voices|languages (like Gewrman)
        //
        final = final.replaceAll('z. B.', 'zum Beispiel, ');

        // Remove question and exclamation (?|!) marks.
        //
        final = final.replace(/[\!\?]/g, '. ');

        // Replace em-dashes and double-dashes with a pause
        // since most voices doesn't do so when speaking.
        //
        final = final.replaceAll('—', pause_spoken);
        final = final.replaceAll('–', pause_spoken);
        final = final.replaceAll('--', pause_spoken);

        // When read from the DOM, a few special characters
        // (&amp; for example) display as their hex codes
        // rather than resolving into their actual character.
        //
        var txt = document.createElement('textarea');
        txt.innerHTML = final;
        final = txt.value;

        // Replace single word in line
        //
        final = final.replace(/^\s*(\b\w+\b)\s*$/gm, "$1. ");

        // Replace month year in line
        //
        final = final.replace(/^\s*(\b\w+\b\s*[0-9]{4})$/gm, "$1. ");

        // Replace multiple whitespaces
        //
        final = final.replace(/\s+/g, ' ');

        // split the final text in to chunks (sentences).
        //
        const textChunks = splitTextIntoChunks(final);
        chunkCounterMax = textChunks.length;
        return textChunks;
      }

      // return the Utterance object of the SpeechSynthesis API
      //
      return speech;
    },
    // END speak

    pause: function () {
      window.speechSynthesis.pause();
      return this;
    },
    // END pause

    resume: function () {
      window.speechSynthesis.resume();
      return this;
    },
    // END resume

    // jadams
    stop: function () {
      window.speechSynthesis.cancel();
      userStoppedSpeaking = true;

      // jadams, 2023-09-28;
      // do not work
      // -----------------------------------------------------------------------
      // NOTE: stopping coincident active speech synthesis
      // in multiple browser windows (tabs) does NOT work
      // -----------------------------------------------------------------------
      //    user_session.speech_synthesis_active = false;
      //    j1.writeCookie({
      //      name:     'user_session',
      //      data:     user_session,
      //      secure:   false,
      //      expires:  0
      //    });

      // return this;
    },
    // END stop

    enabled: function () {
      return 'speechSynthesis' in window;
    },
    // END enabled

    isSpeaking: function () {
      return window.speechSynthesis.speaking;
    },
    // END isSpeaking

    isSpoken: function () {
      if (window.speechSynthesis.speaking) {
        return chunkCounter;
      } else {
        return false;
      }
    },
    // END isSpoken

    isScrolled: function () {
      if (window.speechSynthesis.speaking) {
        return lastScrollPosition;
      } else {
        return false;
      }
    },
    // END isSpoken
    isPaused: function () {
      return window.speechSynthesis.paused;
    },
    // END isPaused

    rate: function () {
      var num = arguments[0];
      if (num >= 0.1 && num <= 10) {
        rateUserDefault = num;
      } else if (num === undefined) {
        rateUserDefault = void 0;
        rate = rateDefault;
      }
      return this;
    },
    // END rate

    pitch: function () {
      var num = arguments[0];
      if (num >= 0.1 && num <= 2) {
        pitchUserDefault = num;
      } else if (num === undefined) {
        pitchUserDefault = void 0;
        pitch = pitchDefault;
      }
      return this;
    },
    // END pitch

    volume: function () {
      var num = arguments[0];
      if (num >= 0 && num <= 1) {
        volumeUserDefault = num;
      } else if (num === undefined) {
        volumeUserDefault = void 0;
        volume = volumeDefault;
      }
      ;
      return this;
    },
    // END volume

    ignore: function () {
      var len = arguments.length;
      ignoreTagsUser.length = 0;
      while (len > 0) {
        len--;
        ignoreTagsUser.push(arguments[len]);
      }
      ;
      return this;
    },
    // END ignore

    recognize: function () {
      var len = arguments.length;
      recognizeTagsUser.length = 0;
      while (len > 0) {
        len--;
        recognizeTagsUser.push(arguments[len]);
      }
      return this;
    },
    // END recognize

    replace: function () {
      var len = arguments.length;
      replacements.length = 0;
      var i = 0;
      while (i < len) {
        replacements.push(arguments[i], arguments[i + 1]);
        i = i + 2;
        if (len - i == 1) {
          break;
        }
        ;
      }
      ;
      return this;
    },
    // END replace

    customize: function () {
      var len = arguments.length;
      if (len == 0) {
        customTags = [];
      }
      if (len == 2) {
        if (['img', 'table', 'figure'].indexOf(arguments[0]) == -1) {
          console.warn("When customizing, tag indicated must be either 'img', 'table', or 'figure'.");
          return;
        }
        customTags[arguments[0].toString()] = new voiceTag(arguments[1].toString());
      }
      if (len == 3) {
        if (['q', "ol", "ul", "blockquote"].indexOf(arguments[0]) == -1) {
          console.warn("When customizing, tag indicated must be either 'q', 'ol', 'ul' or 'blockquote'.");
          return;
        }
        customTags[arguments[0].toString()] = new voiceTag(arguments[1].toString(), arguments[2].toString());
      }
      return this;
    },
    // END customize

    getVoices: function () {
      // If no arguments, then the user has requested the array of
      // voices populated earlier.
      //
      if (arguments.length == 0) {
        return voices;
      }

      // If there's another argument, we'll assume it's a $
      // selector designating where to put the dropdown menu.
      // And if there's a third argument, that will be custom text
      // for the dropdown menu.
      // Then we'll create a dropdown menu with the voice names and,
      //in parenthesis, the language code.
      //
      var obj = $(arguments[0]);
      var selectionTxt = 'Choose a voice';
      if (arguments[1] !== undefined) {
        selectionTxt = arguments[1];
      }
      obj.append($("<select id='voiceSelect' name='voiceSelect'><option value='none'>" + selectionTxt + "</option></select>"));

      // jadams
      var skippedVoices = 0;
      for (var i = 0; i < voices.length; i++) {
        if (isChrome && voices[i].name.includes(ignoreProvider)) {
          skippedVoices++;
          continue;
        }
        if (isEdge && !voices[i].name.includes('Natural')) {
          skippedVoices++;
          continue;
        }
        var option = document.createElement('option');
        option.textContent = voices[i].name + ' (' + voices[i].language + ')';
        option.setAttribute('value', voices[i].name);

        // set used voice as 'selected'
        if (voiceLanguageDefault !== undefined) {
          if (voices[i].name === voiceLanguageDefault) {
            option.setAttribute('selected', 'selected');
          }
        } else {
          if (voices[i].name.includes(voiceUserDefault)) {
            //  option.setAttribute('selected', 'selected');
          }
        }
        option.setAttribute('data-speak2me-language', voices[i].language);
        obj.find('select').append(option);
      }
      return i - skippedVoices;
    },
    // END getVoiuces

    setVoice: function () {
      // The setVoice function has to have two attributes
      // if not, exit the function.
      //
      if (arguments.length < 2) {
        return this;
      }
      var requestedVoice, requestedLanguage;

      // User wants to change the voice directly. If that name indeed
      // exists, update the "voiceUserDefault" variable.
      //
      if (arguments[0] == 'name') {
        requestedVoice = arguments[1];
        for (var i = 0; i < voices.length; i++) {
          if (voices[i].name == requestedVoice) {
            voiceUserDefault = requestedVoice;
          }
        }
      }

      // User wants to change the voice by only specifying the
      // first two characters of the language code. Case insensitive.
      //
      if (arguments[0] == 'language') {
        requestedLanguage = arguments[1].toUpperCase();
        if (requestedLanguage.length == 2) {
          for (var i = 0; i < voices.length; i++) {
            if (voices[i].language.substring(0, 2).toUpperCase() == requestedLanguage) {
              voiceUserDefault = voices[i].name;
              break;
            }
          }
        } else {
          // User wants to change the voice by specifying the
          // complete language code.
          for (var i = 0; i < voices.length; i++) {
            if (voices[i].language == requestedLanguage) {
              voiceUserDefault = voices[i].name;
              break;
            }
          }
        }
      }
      return this;
    } // END setVoice
  }; // END public methods

  // main speak2me method
  //
  $.fn.speak2me = function (method) {
    if (methods[method]) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === 'object' || !method) {
      return methods.speak.apply(this, arguments);
    } else {
      $.error('Method ' + method + ' does not exist on $.speak2me');
    }
  }; // END main
})($);

/***/ }),

/***/ 7823:
/***/ ((module) => {

/**
 * This file is responsible for building the DOM and updating DOM state.
 *
 * @author Tim Scanlin
 */

// -----------------------------------------------------------------------------
// ESLint shimming
// -----------------------------------------------------------------------------
/* eslint indent: "off"                                                       */
/* eslint no-undef: "off"                                                     */
/* eslint semi: "off"                                                         */
// -----------------------------------------------------------------------------

/* eslint indent: "off"                                                       */
/* eslint no-undef: "off"                                                     */
/* eslint semi: "off"                                                         */
// -----------------------------------------------------------------------------

module.exports = function (options) {
  var forEach = [].forEach;
  var some = [].some;
  var body = document.body;
  var currentlyHighlighting = true;
  var SPACE_CHAR = ' ';

  /**
   * Create link and list elements.
   * @param {Object} d
   * @param {HTMLElement} container
   * @return {HTMLElement}
   */
  function createEl(d, container) {
    var link = container.appendChild(createLink(d));
    if (d.children.length) {
      var list = createList(d.isCollapsed);
      d.children.forEach(function (child) {
        createEl(child, list);
      });
      link.appendChild(list);
    }
  }

  /**
   * Render nested heading array data into a given selector.
   * @param {String} selector
   * @param {Array} data
   * @return {HTMLElement}
   */
  function render(selector, data) {
    var collapsed = false;
    var container = createList(collapsed);
    data.forEach(function (d) {
      createEl(d, container);
    });
    var parent = document.querySelector(selector);

    // Return if no parent is found.
    if (parent === null) {
      return;
    }

    // Remove existing child if it exists.
    if (parent.firstChild) {
      parent.removeChild(parent.firstChild);
    }

    // Just return the parent and don't append the list if no links are found.
    if (data.length === 0) {
      return parent;
    }

    // Append the Elements that have been created
    return parent.appendChild(container);
  }

  /**
   * Create link element.
   * @param {Object} data
   * @return {HTMLElement}
   */
  function createLink(data) {
    var item = document.createElement('li');
    var a = document.createElement('a');
    if (options.listItemClass) {
      item.setAttribute('class', options.listItemClass);
    }
    if (options.onClick) {
      a.onclick = options.onClick;
    }
    if (options.includeHtml && data.childNodes.length) {
      forEach.call(data.childNodes, function (node) {
        a.appendChild(node.cloneNode(true));
      });
    } else {
      // Default behavior.
      a.textContent = data.textContent;
    }
    a.setAttribute('href', options.basePath + '#' + data.id);
    a.setAttribute('class', options.linkClass + SPACE_CHAR + 'node-name--' + data.nodeName + SPACE_CHAR + options.extraLinkClasses);
    item.appendChild(a);
    return item;
  }

  /**
   * Create list element.
   * @param {Boolean} isCollapsed
   * @return {HTMLElement}
   */
  function createList(isCollapsed) {
    var listElement = options.orderedList ? 'ol' : 'ul';
    var list = document.createElement(listElement);
    var classes = options.listClass + SPACE_CHAR + options.extraListClasses;
    if (isCollapsed) {
      classes += SPACE_CHAR + options.collapsibleClass;
      classes += SPACE_CHAR + options.isCollapsedClass;
    }
    list.setAttribute('class', classes);
    return list;
  }

  /**
   * Update fixed sidebar class.
   * @return {HTMLElement}
   */
  function updateFixedSidebarClass() {
    if (options.scrollContainer && document.querySelector(options.scrollContainer)) {
      var top;
      top = document.querySelector(options.scrollContainer).scrollTop;
    } else {
      top = document.documentElement.scrollTop || body.scrollTop;
    }
    var posFixedEl = document.querySelector(options.positionFixedSelector);
    if (options.fixedSidebarOffset === 'auto') {
      options.fixedSidebarOffset = document.querySelector(options.tocSelector).offsetTop;
    }
    if (top > options.fixedSidebarOffset) {
      if (posFixedEl.className.indexOf(options.positionFixedClass) === -1) {
        posFixedEl.className += SPACE_CHAR + options.positionFixedClass;
      }
    } else {
      posFixedEl.className = posFixedEl.className.split(SPACE_CHAR + options.positionFixedClass).join('');
    }
  }

  /**
   * Get top position of heading
   * @param {HTMLElement}
   * @return {integer} position
   */
  function getHeadingTopPos(obj) {
    var position = 0;
    if (obj !== document.querySelector(options.contentSelector && obj != null)) {
      position = obj.offsetTop;
      if (options.hasInnerContainers) {
        position += getHeadingTopPos(obj.offsetParent);
      }
    }
    return position;
  }

  /**
   * Update TOC highlighting and collapsed groups
   */
  function updateToc(headingsArray) {
    // If a fixed content container was set
    if (options.scrollContainer && document.querySelector(options.scrollContainer)) {
      var top;
      top = document.querySelector(options.scrollContainer).scrollTop;
    } else {
      top = document.documentElement.scrollTop || body.scrollTop;
    }

    // Add fixed class at offset
    if (options.positionFixedSelector) {
      updateFixedSidebarClass();
    }

    // Get the most TOP heading currently visible on the page to
    // identify what element to be highlighted
    var headings = headingsArray;
    var topHeader;
    var headingTopPos;

    // Using some instead of each so that we can escape early
    if (currentlyHighlighting && document.querySelector(options.tocSelector) !== null && headings.length > 0) {
      some.call(headings, function (heading, i) {
        headingTopPos = getHeadingTopPos(heading);
        if (headingTopPos > top + options.headingsOffset + 10) {
          // Don't allow negative index value
          // var index = (i === 0) ? i : i - 1;
          // topHeader = headings[index];
          // jadams, index correction seems NOT needed
          topHeader = headings[i];
          return true;
        } else if (i === headings.length - 1) {
          // This allows scrolling for the last heading on the page
          topHeader = headings[headings.length - 1];
          return true;
        }
      });

      // Remove the active class from the other tocLinks.
      var tocLinks = document.querySelector(options.tocSelector).querySelectorAll('.' + options.linkClass);
      forEach.call(tocLinks, function (tocLink) {
        tocLink.className = tocLink.className.split(SPACE_CHAR + options.activeLinkClass).join('');
      });
      var tocLis = document.querySelector(options.tocSelector).querySelectorAll('.' + options.listItemClass);
      forEach.call(tocLis, function (tocLi) {
        tocLi.className = tocLi.className.split(SPACE_CHAR + options.activeListItemClass).join('');
      });

      // Add the active class to the active tocLink.
      var activeTocLink = document.querySelector(options.tocSelector).querySelector('.' + options.linkClass + '.node-name--' + topHeader.nodeName + '[href="' + options.basePath + '#' + topHeader.id.replace(/([ #;&,.+*~':"!^$[\]()=>|/@])/g, '\\$1') + '"]');
      if (activeTocLink.className.indexOf(options.activeLinkClass) === -1) {
        activeTocLink.className += SPACE_CHAR + options.activeLinkClass;
      }
      var li = activeTocLink.parentNode;
      if (li && li.className.indexOf(options.activeListItemClass) === -1) {
        li.className += SPACE_CHAR + options.activeListItemClass;
      }
      var tocLists = document.querySelector(options.tocSelector).querySelectorAll('.' + options.listClass + '.' + options.collapsibleClass);

      // Collapse the other collapsible lists.
      forEach.call(tocLists, function (list) {
        if (list.className.indexOf(options.isCollapsedClass) === -1) {
          list.className += SPACE_CHAR + options.isCollapsedClass;
        }
      });

      // Expand the active link's collapsible list and its sibling if applicable.
      if (activeTocLink.nextSibling && activeTocLink.nextSibling.className.indexOf(options.isCollapsedClass) !== -1) {
        activeTocLink.nextSibling.className = activeTocLink.nextSibling.className.split(SPACE_CHAR + options.isCollapsedClass).join('');
      }
      removeCollapsedFromParents(activeTocLink.parentNode.parentNode);
    }
  }

  /**
   * Remove collpased class from parent elements.
   * @param {HTMLElement} element
   * @return {HTMLElement}
   */
  function removeCollapsedFromParents(element) {
    if (element.className.indexOf(options.collapsibleClass) !== -1 && element.className.indexOf(options.isCollapsedClass) !== -1) {
      element.className = element.className.split(SPACE_CHAR + options.isCollapsedClass).join('');
      return removeCollapsedFromParents(element.parentNode.parentNode);
    }
    return element;
  }

  /**
   * Disable TOC Animation when a link is clicked.
   * @param {Event} event
   */
  function disableTocAnimation(event) {
    var target = event.target || event.srcElement;
    if (typeof target.className !== 'string' || target.className.indexOf(options.linkClass) === -1) {
      return;
    }
    // Bind to tocLink clicks to temporarily disable highlighting
    // while smoothScroll is animating.
    currentlyHighlighting = false;
  }

  /**
   * Enable TOC Animation.
   */
  function enableTocAnimation() {
    currentlyHighlighting = true;
  }
  return {
    enableTocAnimation: enableTocAnimation,
    disableTocAnimation: disableTocAnimation,
    render: render,
    updateToc: updateToc
  };
};

/***/ }),

/***/ 6287:
/***/ ((module) => {

// -----------------------------------------------------------------------------
// ESLint shimming
// -----------------------------------------------------------------------------
/* eslint indent: "off"                                                       */
/* eslint no-undef: "off"                                                     */
/* eslint no-unused-vars: "off"                                               */
// -----------------------------------------------------------------------------

module.exports = {
  // Where to render the table of contents.
  tocSelector: '.js-toc',
  // Where to grab the headings to build the table of contents.
  contentSelector: '.js-toc-content',
  // Which headings to grab inside of the contentSelector element.
  headingSelector: 'h1, h2, h3',
  // Headings that match the ignoreSelector will be skipped.
  ignoreSelector: '.js-toc-ignore',
  // For headings inside relative or absolute positioned containers within content
  hasInnerContainers: false,
  // Main class to add to links.
  linkClass: 'toc-link',
  // Extra classes to add to links.
  extraLinkClasses: '',
  // Class to add to active links,
  // the link corresponding to the top most heading on the page.
  activeLinkClass: 'is-active-link',
  // Main class to add to lists.
  listClass: 'toc-list',
  // Extra classes to add to lists.
  extraListClasses: '',
  // Class that gets added when a list should be collapsed.
  isCollapsedClass: 'is-collapsed',
  // Class that gets added when a list should be able
  // to be collapsed but isn't necessarily collapsed.
  collapsibleClass: 'is-collapsible',
  // Class to add to list items.
  listItemClass: 'toc-list-item',
  // Class to add to active list items.
  activeListItemClass: 'is-active-li',
  // How many heading levels should not be collapsed.
  // For example, number 6 will show everything since
  // there are only 6 heading levels and number 0 will collapse them all.
  // The sections that are hidden will open
  // and close as you scroll to headings within them.
  collapseDepth: 0,
  // Smooth scrolling enabled.
  scrollSmooth: true,
  // Smooth scroll duration.
  scrollSmoothDuration: 420,
  // Smooth scroll offset.
  scrollSmoothOffset: 0,
  // Callback for scroll end.
  scrollEndCallback: function (e) {},
  // Headings offset between the headings and the top of the document (this is meant for minor adjustments).
  headingsOffset: 1,
  // Timeout between events firing to make sure it's
  // not too rapid (for performance reasons).
  throttleTimeout: 50,
  // Element to add the positionFixedClass to.
  positionFixedSelector: null,
  // Fixed position class to add to make sidebar fixed after scrolling
  // down past the fixedSidebarOffset.
  positionFixedClass: 'is-position-fixed',
  // fixedSidebarOffset can be any number but by default is set
  // to auto which sets the fixedSidebarOffset to the sidebar
  // element's offsetTop from the top of the document on init.
  fixedSidebarOffset: 'auto',
  // includeHtml can be set to true to include the HTML markup from the
  // heading node instead of just including the textContent.
  includeHtml: false,
  // onclick function to apply to all links in toc. will be called with
  // the event as the first parameter, and this can be used to stop,
  // propagation, prevent default or perform action
  onClick: function (e) {},
  // orderedList can be set to false to generate unordered lists (ul)
  // instead of ordered lists (ol)
  orderedList: true,
  // If there is a fixed article scroll container, set to calculate titles' offset
  scrollContainer: null,
  // prevent ToC DOM rendering if it's already rendered by an external system
  skipRendering: false,
  // Optional callback to change heading labels.
  // For example it can be used to cut down and put ellipses on multiline headings you deem too long.
  // Called each time a heading is parsed. Expects a string in return, the modified label to display.
  // function (string) => string
  headingLabelCallback: false,
  // ignore headings that are hidden in DOM
  ignoreHiddenElements: false,
  // Optional callback to modify properties of parsed headings.
  // The heading element is passed in node parameter and information parsed by default parser is provided in obj parameter.
  // Function has to return the same or modified obj.
  // The heading will be excluded from TOC if nothing is returned.
  // function (object, HTMLElement) => object | void
  headingObjectCallback: null,
  // Set the base path, useful if you use a `base` tag in `head`.
  basePath: '',
  // Only takes affect when `tocSelector` is scrolling,
  // keep the toc scroll position in sync with the content.
  disableTocScrollSync: false
};

/***/ }),

/***/ 798:
/***/ ((module) => {

/**
 * This file is responsible for parsing the content from the DOM and making
 * sure data is nested properly.
 *
 * @author Tim Scanlin
 */

// -----------------------------------------------------------------------------
// ESLint shimming
// -----------------------------------------------------------------------------
/* eslint indent: "off"                                                       */
/* eslint no-undef: "off"                                                     */
/* eslint semi: "off"                                                         */
// -----------------------------------------------------------------------------

module.exports = function parseContent(options) {
  var reduce = [].reduce;

  /**
   * Get the last item in an array and return a reference to it.
   * @param {Array} array
   * @return {Object}
   */
  function getLastItem(array) {
    return array[array.length - 1];
  }

  /**
   * Get heading level for a heading dom node.
   * @param {HTMLElement} heading
   * @return {Number}
   */
  function getHeadingLevel(heading) {
    return +heading.nodeName.split('H').join('');
  }

  /**
   * Get important properties from a heading element and store in a plain object.
   * @param {HTMLElement} heading
   * @return {Object}
   */
  function getHeadingObject(heading) {
    // each node is processed twice by this method because nestHeadingsArray() and addNode() calls it
    // first time heading is real DOM node element, second time it is obj
    // that is causing problem so I am processing only original DOM node
    if (!(heading instanceof window.HTMLElement)) return heading;
    if (options.ignoreHiddenElements && (!heading.offsetHeight || !heading.offsetParent)) {
      return null;
    }
    var obj = {
      id: heading.id,
      children: [],
      nodeName: heading.nodeName,
      headingLevel: getHeadingLevel(heading),
      textContent: options.headingLabelCallback ? String(options.headingLabelCallback(heading.textContent)) : heading.textContent.trim()
    };
    if (options.includeHtml) {
      obj.childNodes = heading.childNodes;
    }
    if (options.headingObjectCallback) {
      return options.headingObjectCallback(obj, heading);
    }
    return obj;
  }

  /**
   * Add a node to the nested array.
   * @param {Object} node
   * @param {Array} nest
   * @return {Array}
   */
  function addNode(node, nest) {
    var obj = getHeadingObject(node);
    var level = obj.headingLevel;
    var array = nest;
    var lastItem = getLastItem(array);
    var lastItemLevel = lastItem ? lastItem.headingLevel : 0;
    var counter = level - lastItemLevel;
    while (counter > 0) {
      lastItem = getLastItem(array);
      if (lastItem && lastItem.children !== undefined) {
        array = lastItem.children;
      }
      counter--;
    }
    if (level >= options.collapseDepth) {
      obj.isCollapsed = true;
    }
    array.push(obj);
    return array;
  }

  /**
   * Select headings in content area, exclude any selector in options.ignoreSelector
   * @param {String} contentSelector
   * @param {Array} headingSelector
   * @return {Array}
   */
  function selectHeadings(contentSelector, headingSelector) {
    var selectors = headingSelector;
    if (options.ignoreSelector) {
      selectors = headingSelector.split(',').map(function mapSelectors(selector) {
        return selector.trim() + ':not(' + options.ignoreSelector + ')';
      });
    }
    try {
      return document.querySelector(contentSelector).querySelectorAll(selectors);
    } catch (e) {
      console.warn('Element not found: ' + contentSelector); // eslint-disable-line
      return null;
    }
  }

  /**
   * Nest headings array into nested arrays with 'children' property.
   * @param {Array} headingsArray
   * @return {Object}
   */
  function nestHeadingsArray(headingsArray) {
    return reduce.call(headingsArray, function reducer(prev, curr) {
      var currentHeading = getHeadingObject(curr);
      if (currentHeading) {
        addNode(currentHeading, prev.nest);
      }
      return prev;
    }, {
      nest: []
    });
  }
  return {
    nestHeadingsArray: nestHeadingsArray,
    selectHeadings: selectHeadings
  };
};

/***/ }),

/***/ 8508:
/***/ ((__unused_webpack_module, exports) => {

/*
 # -----------------------------------------------------------------------------
 #  ~/js/tocbot/scroll-smooth/index.js
 #  Scroll-Smooth (Tocbot v4.12.0) implementation for J1 Theme
 #
 #  Product/Info:
 #  https://jekyll.one
 #  https://tscanlin.github.io/tocbot
 #  https://github.com/tscanlin/tocbot
 #
 #  Copyright (C) 2023, 2024 Juergen Adams
 #  Copyright (C) 2016 Tim Scanlin
 #
 #  J1 Theme is licensed under MIT License.
 #  See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 #  Tocbot is licensed under the MIT License.
 #  For details, https://github.com/tscanlin/tocbot/blob/master/LICENSE
 # -----------------------------------------------------------------------------
*/

// -----------------------------------------------------------------------------
// ESLint shimming
// -----------------------------------------------------------------------------
/* eslint no-redeclare: "off"                                                 */
/* eslint no-undef: "off"                                                     */
/* eslint no-empty: "off"                                                     */
/* eslint semi: "off"                                                         */
// -----------------------------------------------------------------------------
/* globals location, requestAnimationFrame */

exports.initSmoothScrolling = initSmoothScrolling;
function initSmoothScrolling(options) {
  if (isCssSmoothSCrollSupported()) {}
  var duration = options.duration;
  var offset = options.offset;
  var pageUrl = location.hash ? stripHash(location.href) : location.href;
  delegatedLinkHijacking();
  function delegatedLinkHijacking() {
    document.body.addEventListener('click', onClick, false);
    function onClick(e) {
      if (!isInPageLink(e.target) || e.target.className.indexOf('no-smooth-scroll') > -1 || e.target.href.charAt(e.target.href.length - 2) === '#' && e.target.href.charAt(e.target.href.length - 1) === '!' || e.target.className.indexOf(options.linkClass) === -1) {
        return;
      }

      // Don't prevent default or hash doesn't change.
      // e.preventDefault()

      // fixing-skip-to-content-links
      // jump(e.target.hash, {
      //   duration: duration,
      //   offset: offset,
      //   callback: function () {
      //     setFocus(e.target.hash)
      //   }
      // })

      // jadams, 2021-11-13
      // fixing-skip-to-content-links, done by callback to focus(), seems
      // NOT longer required for current browsers
      jump(e.target.hash, {
        duration: duration,
        offset: offset,
        callback: false
      });
    }
  }
  function isInPageLink(n) {
    return n.tagName.toLowerCase() === 'a' && (n.hash.length > 0 || n.href.charAt(n.href.length - 1) === '#') && (stripHash(n.href) === pageUrl || stripHash(n.href) + '#' === pageUrl);
  }
  function stripHash(url) {
    return url.slice(0, url.lastIndexOf('#'));
  }
  function isCssSmoothSCrollSupported() {
    return 'scrollBehavior' in document.documentElement.style;
  }

  // Adapted from:
  // https://www.nczonline.net/blog/2013/01/15/fixing-skip-to-content-links/
  function setFocus(hash) {
    var element = document.getElementById(hash.substring(1));
    if (element) {
      if (!/^(?:a|select|input|button|textarea)$/i.test(element.tagName)) {
        element.tabIndex = -1;
      }
      element.focus();
    }
  }
}
function jump(target, options) {
  var start = window.pageYOffset;
  var opt = {
    duration: options.duration,
    offset: options.offset || 0,
    callback: options.callback,
    easing: options.easing || easeInOutQuad
  };
  // This makes ids that start with a number work: ('[id="' + decodeURI(target).split('#').join('') + '"]')
  // DecodeURI for nonASCII hashes, they was encoded, but id was not encoded, it lead to not finding the tgt element by id.
  // And this is for IE: document.body.scrollTop
  var tgt = document.querySelector('[id="' + decodeURI(target).split('#').join('') + '"]');
  var distance = typeof target === 'string' ? opt.offset + (target ? tgt && tgt.getBoundingClientRect().top || 0 // handle non-existent links better.
  : -(document.documentElement.scrollTop || document.body.scrollTop)) : target;
  var duration = typeof opt.duration === 'function' ? opt.duration(distance) : opt.duration;
  var timeStart;
  var timeElapsed;
  requestAnimationFrame(function (time) {
    timeStart = time;
    loop(time);
  });
  function loop(time) {
    timeElapsed = time - timeStart;
    window.scrollTo(0, opt.easing(timeElapsed, start, distance, duration));
    if (timeElapsed < duration) {
      requestAnimationFrame(loop);
    } else {
      end();
    }
  }
  function end() {
    // window.scrollTo(0, start + distance)

    // jadams, 2020-07-04: on (some?) mobile devices, the navbar
    // background is NOT switched (always?) correctly on a
    // page RELOAD.
    //
    // Solution: scroll the page one pixel back and forth (trigger)
    // to get the right position for the Toccer and adjust the
    // Navigator to display the (tranparent) navbar correctly based
    // on their onscroll events registered.
    //
    // $(window).scrollTop($(window).scrollTop()+1);
    // $(window).scrollTop($(window).scrollTop()-1);

    if (typeof opt.callback === 'function') {
      opt.callback();
    }
  }

  // Robert Penner's easeInOutQuad - http://robertpenner.com/easing/
  function easeInOutQuad(t, b, c, d) {
    t /= d / 2;
    if (t < 1) return c / 2 * t * t + b;
    t--;
    return -c / 2 * (t * (t - 2) - 1) + b;
  }
}

/***/ }),

/***/ 6562:
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*
 # -----------------------------------------------------------------------------
 #  ~/js/tocbot/tocbot.js
 #  Tocbot v4.12.0 implementation for J1 Theme
 #
 #  Product/Info:
 #  https://jekyll.one
 #  https://tscanlin.github.io/tocbot
 #  https://github.com/tscanlin/tocbot
 #
 #  Copyright (C) 2023, 2024 Juergen Adams
 #  Copyright (C) 2016 Tim Scanlin
 #
 #  J1 Theme is licensed under MIT License.
 #  See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 #  Tocbot is licensed under the MIT License.
 #  For details, https://github.com/tscanlin/tocbot/blob/master/LICENSE
 # -----------------------------------------------------------------------------
 #  rules:
 #    "eslint:tocbot": "eslint --ignore-path .eslintignore src/tocbot/js"
 # -----------------------------------------------------------------------------
*/

// -----------------------------------------------------------------------------
// ESLint shimming
// -----------------------------------------------------------------------------
/* eslint indent: "off"                                                       */
/* eslint no-undef: "off"                                                     */
/* eslint semi: "off"                                                         */
// -----------------------------------------------------------------------------

/**
 * Tocbot
 * Tocbot creates a toble of contents based on HTML headings on a page,
 * this allows users to easily jump to different sections of the document.
 * Tocbot was inspired by tocify (http://gregfranko.com/jquery.tocify.js/).
 * The main differences are that it works natively without any need for jquery or jquery UI).
 *
 * @author Tim Scanlin
 */

/* globals define */

(function (root, factory) {
  if (true) {
    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory(root)),
		__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
		(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
  } else {}
})(typeof __webpack_require__.g !== 'undefined' ? __webpack_require__.g : this.window || this.global, function (root) {
  'use strict';

  // Default options.
  var defaultOptions = __webpack_require__(6287);
  // Object to store current options.
  var options = {};
  // Object for public APIs.
  var tocbot = {};
  var BuildHtml = __webpack_require__(7823);
  var ParseContent = __webpack_require__(798);
  var updateTocScroll = __webpack_require__(9429);
  // Keep these variables at top scope once options are passed in.
  var buildHtml;
  var parseContent;

  // Just return if its not a browser.
  var supports = !!root && !!root.document && !!root.document.querySelector && !!root.addEventListener; // Feature test
  if (typeof window === 'undefined' && !supports) {
    return;
  }
  var headingsArray;

  // From: https://github.com/Raynos/xtend
  var hasOwnProperty = Object.prototype.hasOwnProperty;
  function extend() {
    var target = {};
    for (var i = 0; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  }

  // From: https://remysharp.com/2010/07/21/throttling-function-calls
  function throttle(fn, threshold, scope) {
    threshold || (threshold = 250);
    var last;
    var deferTimer;
    return function () {
      var context = scope || this;
      var now = +new Date();
      var args = arguments;
      if (last && now < last + threshold) {
        // hold on to it
        clearTimeout(deferTimer);
        deferTimer = setTimeout(function () {
          last = now;
          fn.apply(context, args);
        }, threshold);
      } else {
        last = now;
        fn.apply(context, args);
      }
    };
  }

  /**
   * Destroy tocbot.
   */
  tocbot.destroy = function () {
    if (!options.skipRendering) {
      // Clear HTML.
      try {
        document.querySelector(options.tocSelector).innerHTML = '';
      } catch (e) {
        console.warn('Element not found: ' + options.tocSelector); // eslint-disable-line
      }
    }

    // Remove event listeners.
    if (options.scrollContainer && document.querySelector(options.scrollContainer)) {
      document.querySelector(options.scrollContainer).removeEventListener('scroll', this._scrollListener, false);
      document.querySelector(options.scrollContainer).removeEventListener('resize', this._scrollListener, false);
      if (buildHtml) {
        document.querySelector(options.scrollContainer).removeEventListener('click', this._clickListener, false);
      }
    } else {
      document.removeEventListener('scroll', this._scrollListener, false);
      document.removeEventListener('resize', this._scrollListener, false);
      if (buildHtml) {
        document.removeEventListener('click', this._clickListener, false);
      }
    }
  };

  /**
   * Initialize tocbot.
   * @param {object} customOptions
   */
  tocbot.init = function (customOptions) {
    // feature test
    if (!supports) {
      return;
    }

    // Merge defaults with user options.
    // Set to options variable at the top.
    options = extend(defaultOptions, customOptions || {});
    this.options = options;
    this.state = {};

    // Init smooth scroll if enabled (default).
    if (options.scrollSmooth) {
      options.duration = options.scrollSmoothDuration;
      options.offset = options.scrollSmoothOffset;
      tocbot.scrollSmooth = (__webpack_require__(8508).initSmoothScrolling)(options);
    }

    // Pass options to these modules.
    buildHtml = BuildHtml(options);
    parseContent = ParseContent(options);

    // For testing purposes.
    this._buildHtml = buildHtml;
    this._parseContent = parseContent;

    // Destroy it if it exists first.
    tocbot.destroy();

    // Get headings array.
    headingsArray = parseContent.selectHeadings(options.contentSelector, options.headingSelector);
    // Return if no headings are found.
    if (headingsArray === null) {
      return;
    }

    // Build nested headings array.
    var nestedHeadingsObj = parseContent.nestHeadingsArray(headingsArray);
    var nestedHeadings = nestedHeadingsObj.nest;

    // Render.
    if (!options.skipRendering) {
      buildHtml.render(options.tocSelector, nestedHeadings);
    }

    // Update Sidebar and bind listeners.
    this._scrollListener = throttle(function (e) {
      buildHtml.updateToc(headingsArray);
      !options.disableTocScrollSync && updateTocScroll(options);
      var isTop = e && e.target && e.target.scrollingElement && e.target.scrollingElement.scrollTop === 0;
      if (e && (e.eventPhase === 0 || e.currentTarget === null) || isTop) {
        buildHtml.updateToc(headingsArray);
        if (options.scrollEndCallback) {
          options.scrollEndCallback(e);
        }
      }
    }, options.throttleTimeout);
    this._scrollListener();
    if (options.scrollContainer && document.querySelector(options.scrollContainer)) {
      document.querySelector(options.scrollContainer).addEventListener('scroll', this._scrollListener, false);
      document.querySelector(options.scrollContainer).addEventListener('resize', this._scrollListener, false);
    } else {
      document.addEventListener('scroll', this._scrollListener, false);
      document.addEventListener('resize', this._scrollListener, false);
    }

    // Bind click listeners to disable animation.
    var timeout = null;
    this._clickListener = throttle(function (event) {
      if (options.scrollSmooth) {
        buildHtml.disableTocAnimation(event);
      }
      buildHtml.updateToc(headingsArray);
      // Timeout to re-enable the animation.
      timeout && clearTimeout(timeout);
      timeout = setTimeout(function () {
        buildHtml.enableTocAnimation();
      }, options.scrollSmoothDuration);
    }, options.throttleTimeout);
    if (options.scrollContainer && document.querySelector(options.scrollContainer)) {
      document.querySelector(options.scrollContainer).addEventListener('click', this._clickListener, false);
    } else {
      document.addEventListener('click', this._clickListener, false);
    }
    return this;
  };

  /**
   * Refresh tocbot.
   */
  tocbot.refresh = function (customOptions) {
    tocbot.destroy();
    tocbot.init(customOptions || this.options);
  };

  // Make tocbot available globally.
  root.tocbot = tocbot;
  return tocbot;
});

/***/ }),

/***/ 9429:
/***/ ((module) => {

// -----------------------------------------------------------------------------
// ESLint shimming
// -----------------------------------------------------------------------------
/* eslint indent: "off"                                                       */
/* eslint no-undef: "off"                                                     */
/* eslint semi: "off"                                                         */
// -----------------------------------------------------------------------------

module.exports = function updateTocScroll(options) {
  var toc = document.querySelector(options.tocSelector);
  if (toc && toc.scrollHeight > toc.clientHeight) {
    var activeItem = toc.querySelector('.' + options.activeListItemClass);
    if (activeItem) {
      toc.scrollTop = activeItem.offsetTop;
    }
  }
};

/***/ }),

/***/ 2215:
/***/ ((module, exports, __webpack_require__) => {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
 * JavaScript Cookie v2.2.1
 * https://github.com/js-cookie/js-cookie
 *
 * Copyright 2006, 2015 Klaus Hartl & Fagner Brack
 * Released under the MIT license
 */
;(function (factory) {
	var registeredInModuleLoader;
	if (true) {
		!(__WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
		__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
		(__WEBPACK_AMD_DEFINE_FACTORY__.call(exports, __webpack_require__, exports, module)) :
		__WEBPACK_AMD_DEFINE_FACTORY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
		registeredInModuleLoader = true;
	}
	if (true) {
		module.exports = factory();
		registeredInModuleLoader = true;
	}
	if (!registeredInModuleLoader) {
		var OldCookies = window.Cookies;
		var api = window.Cookies = factory();
		api.noConflict = function () {
			window.Cookies = OldCookies;
			return api;
		};
	}
}(function () {
	function extend () {
		var i = 0;
		var result = {};
		for (; i < arguments.length; i++) {
			var attributes = arguments[ i ];
			for (var key in attributes) {
				result[key] = attributes[key];
			}
		}
		return result;
	}

	function decode (s) {
		return s.replace(/(%[0-9A-Z]{2})+/g, decodeURIComponent);
	}

	function init (converter) {
		function api() {}

		function set (key, value, attributes) {
			if (typeof document === 'undefined') {
				return;
			}

			attributes = extend({
				path: '/'
			}, api.defaults, attributes);

			if (typeof attributes.expires === 'number') {
				attributes.expires = new Date(new Date() * 1 + attributes.expires * 864e+5);
			}

			// We're using "expires" because "max-age" is not supported by IE
			attributes.expires = attributes.expires ? attributes.expires.toUTCString() : '';

			try {
				var result = JSON.stringify(value);
				if (/^[\{\[]/.test(result)) {
					value = result;
				}
			} catch (e) {}

			value = converter.write ?
				converter.write(value, key) :
				encodeURIComponent(String(value))
					.replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent);

			key = encodeURIComponent(String(key))
				.replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent)
				.replace(/[\(\)]/g, escape);

			var stringifiedAttributes = '';
			for (var attributeName in attributes) {
				if (!attributes[attributeName]) {
					continue;
				}
				stringifiedAttributes += '; ' + attributeName;
				if (attributes[attributeName] === true) {
					continue;
				}

				// Considers RFC 6265 section 5.2:
				// ...
				// 3.  If the remaining unparsed-attributes contains a %x3B (";")
				//     character:
				// Consume the characters of the unparsed-attributes up to,
				// not including, the first %x3B (";") character.
				// ...
				stringifiedAttributes += '=' + attributes[attributeName].split(';')[0];
			}

			return (document.cookie = key + '=' + value + stringifiedAttributes);
		}

		function get (key, json) {
			if (typeof document === 'undefined') {
				return;
			}

			var jar = {};
			// To prevent the for loop in the first place assign an empty array
			// in case there are no cookies at all.
			var cookies = document.cookie ? document.cookie.split('; ') : [];
			var i = 0;

			for (; i < cookies.length; i++) {
				var parts = cookies[i].split('=');
				var cookie = parts.slice(1).join('=');

				if (!json && cookie.charAt(0) === '"') {
					cookie = cookie.slice(1, -1);
				}

				try {
					var name = decode(parts[0]);
					cookie = (converter.read || converter)(cookie, name) ||
						decode(cookie);

					if (json) {
						try {
							cookie = JSON.parse(cookie);
						} catch (e) {}
					}

					jar[name] = cookie;

					if (key === name) {
						break;
					}
				} catch (e) {}
			}

			return key ? jar[key] : jar;
		}

		api.set = set;
		api.get = function (key) {
			return get(key, false /* read as raw */);
		};
		api.getJSON = function (key) {
			return get(key, true /* read as json */);
		};
		api.remove = function (key, attributes) {
			set(key, '', extend(attributes, {
				expires: -1
			}));
		};

		api.defaults = {};

		api.withConverter = init;

		return api;
	}

	return init(function () {});
}));


/***/ }),

/***/ 7210:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";



var loader = __webpack_require__(9243);
var dumper = __webpack_require__(4781);


function renamed(from, to) {
  return function () {
    throw new Error('Function yaml.' + from + ' is removed in js-yaml 4. ' +
      'Use yaml.' + to + ' instead, which is now safe by default.');
  };
}


module.exports.Type = __webpack_require__(5388);
module.exports.Schema = __webpack_require__(2119);
module.exports.FAILSAFE_SCHEMA = __webpack_require__(7759);
module.exports.JSON_SCHEMA = __webpack_require__(6184);
module.exports.CORE_SCHEMA = __webpack_require__(1769);
module.exports.DEFAULT_SCHEMA = __webpack_require__(5489);
module.exports.load                = loader.load;
module.exports.loadAll             = loader.loadAll;
module.exports.dump                = dumper.dump;
module.exports.YAMLException = __webpack_require__(1231);

// Re-export all types in case user wants to create custom schema
module.exports.types = {
  binary:    __webpack_require__(9342),
  float:     __webpack_require__(1461),
  map:       __webpack_require__(2369),
  null:      __webpack_require__(9198),
  pairs:     __webpack_require__(6942),
  set:       __webpack_require__(6663),
  timestamp: __webpack_require__(127),
  bool:      __webpack_require__(6199),
  int:       __webpack_require__(4466),
  merge:     __webpack_require__(1851),
  omap:      __webpack_require__(6946),
  seq:       __webpack_require__(8636),
  str:       __webpack_require__(7212)
};

// Removed functions from JS-YAML 3.0.x
module.exports.safeLoad            = renamed('safeLoad', 'load');
module.exports.safeLoadAll         = renamed('safeLoadAll', 'loadAll');
module.exports.safeDump            = renamed('safeDump', 'dump');


/***/ }),

/***/ 8433:
/***/ ((module) => {

"use strict";



function isNothing(subject) {
  return (typeof subject === 'undefined') || (subject === null);
}


function isObject(subject) {
  return (typeof subject === 'object') && (subject !== null);
}


function toArray(sequence) {
  if (Array.isArray(sequence)) return sequence;
  else if (isNothing(sequence)) return [];

  return [ sequence ];
}


function extend(target, source) {
  var index, length, key, sourceKeys;

  if (source) {
    sourceKeys = Object.keys(source);

    for (index = 0, length = sourceKeys.length; index < length; index += 1) {
      key = sourceKeys[index];
      target[key] = source[key];
    }
  }

  return target;
}


function repeat(string, count) {
  var result = '', cycle;

  for (cycle = 0; cycle < count; cycle += 1) {
    result += string;
  }

  return result;
}


function isNegativeZero(number) {
  return (number === 0) && (Number.NEGATIVE_INFINITY === 1 / number);
}


module.exports.isNothing      = isNothing;
module.exports.isObject       = isObject;
module.exports.toArray        = toArray;
module.exports.repeat         = repeat;
module.exports.isNegativeZero = isNegativeZero;
module.exports.extend         = extend;


/***/ }),

/***/ 4781:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


/*eslint-disable no-use-before-define*/

var common              = __webpack_require__(8433);
var YAMLException       = __webpack_require__(1231);
var DEFAULT_SCHEMA      = __webpack_require__(5489);

var _toString       = Object.prototype.toString;
var _hasOwnProperty = Object.prototype.hasOwnProperty;

var CHAR_BOM                  = 0xFEFF;
var CHAR_TAB                  = 0x09; /* Tab */
var CHAR_LINE_FEED            = 0x0A; /* LF */
var CHAR_CARRIAGE_RETURN      = 0x0D; /* CR */
var CHAR_SPACE                = 0x20; /* Space */
var CHAR_EXCLAMATION          = 0x21; /* ! */
var CHAR_DOUBLE_QUOTE         = 0x22; /* " */
var CHAR_SHARP                = 0x23; /* # */
var CHAR_PERCENT              = 0x25; /* % */
var CHAR_AMPERSAND            = 0x26; /* & */
var CHAR_SINGLE_QUOTE         = 0x27; /* ' */
var CHAR_ASTERISK             = 0x2A; /* * */
var CHAR_COMMA                = 0x2C; /* , */
var CHAR_MINUS                = 0x2D; /* - */
var CHAR_COLON                = 0x3A; /* : */
var CHAR_EQUALS               = 0x3D; /* = */
var CHAR_GREATER_THAN         = 0x3E; /* > */
var CHAR_QUESTION             = 0x3F; /* ? */
var CHAR_COMMERCIAL_AT        = 0x40; /* @ */
var CHAR_LEFT_SQUARE_BRACKET  = 0x5B; /* [ */
var CHAR_RIGHT_SQUARE_BRACKET = 0x5D; /* ] */
var CHAR_GRAVE_ACCENT         = 0x60; /* ` */
var CHAR_LEFT_CURLY_BRACKET   = 0x7B; /* { */
var CHAR_VERTICAL_LINE        = 0x7C; /* | */
var CHAR_RIGHT_CURLY_BRACKET  = 0x7D; /* } */

var ESCAPE_SEQUENCES = {};

ESCAPE_SEQUENCES[0x00]   = '\\0';
ESCAPE_SEQUENCES[0x07]   = '\\a';
ESCAPE_SEQUENCES[0x08]   = '\\b';
ESCAPE_SEQUENCES[0x09]   = '\\t';
ESCAPE_SEQUENCES[0x0A]   = '\\n';
ESCAPE_SEQUENCES[0x0B]   = '\\v';
ESCAPE_SEQUENCES[0x0C]   = '\\f';
ESCAPE_SEQUENCES[0x0D]   = '\\r';
ESCAPE_SEQUENCES[0x1B]   = '\\e';
ESCAPE_SEQUENCES[0x22]   = '\\"';
ESCAPE_SEQUENCES[0x5C]   = '\\\\';
ESCAPE_SEQUENCES[0x85]   = '\\N';
ESCAPE_SEQUENCES[0xA0]   = '\\_';
ESCAPE_SEQUENCES[0x2028] = '\\L';
ESCAPE_SEQUENCES[0x2029] = '\\P';

var DEPRECATED_BOOLEANS_SYNTAX = [
  'y', 'Y', 'yes', 'Yes', 'YES', 'on', 'On', 'ON',
  'n', 'N', 'no', 'No', 'NO', 'off', 'Off', 'OFF'
];

var DEPRECATED_BASE60_SYNTAX = /^[-+]?[0-9_]+(?::[0-9_]+)+(?:\.[0-9_]*)?$/;

function compileStyleMap(schema, map) {
  var result, keys, index, length, tag, style, type;

  if (map === null) return {};

  result = {};
  keys = Object.keys(map);

  for (index = 0, length = keys.length; index < length; index += 1) {
    tag = keys[index];
    style = String(map[tag]);

    if (tag.slice(0, 2) === '!!') {
      tag = 'tag:yaml.org,2002:' + tag.slice(2);
    }
    type = schema.compiledTypeMap['fallback'][tag];

    if (type && _hasOwnProperty.call(type.styleAliases, style)) {
      style = type.styleAliases[style];
    }

    result[tag] = style;
  }

  return result;
}

function encodeHex(character) {
  var string, handle, length;

  string = character.toString(16).toUpperCase();

  if (character <= 0xFF) {
    handle = 'x';
    length = 2;
  } else if (character <= 0xFFFF) {
    handle = 'u';
    length = 4;
  } else if (character <= 0xFFFFFFFF) {
    handle = 'U';
    length = 8;
  } else {
    throw new YAMLException('code point within a string may not be greater than 0xFFFFFFFF');
  }

  return '\\' + handle + common.repeat('0', length - string.length) + string;
}


var QUOTING_TYPE_SINGLE = 1,
    QUOTING_TYPE_DOUBLE = 2;

function State(options) {
  this.schema        = options['schema'] || DEFAULT_SCHEMA;
  this.indent        = Math.max(1, (options['indent'] || 2));
  this.noArrayIndent = options['noArrayIndent'] || false;
  this.skipInvalid   = options['skipInvalid'] || false;
  this.flowLevel     = (common.isNothing(options['flowLevel']) ? -1 : options['flowLevel']);
  this.styleMap      = compileStyleMap(this.schema, options['styles'] || null);
  this.sortKeys      = options['sortKeys'] || false;
  this.lineWidth     = options['lineWidth'] || 80;
  this.noRefs        = options['noRefs'] || false;
  this.noCompatMode  = options['noCompatMode'] || false;
  this.condenseFlow  = options['condenseFlow'] || false;
  this.quotingType   = options['quotingType'] === '"' ? QUOTING_TYPE_DOUBLE : QUOTING_TYPE_SINGLE;
  this.forceQuotes   = options['forceQuotes'] || false;
  this.replacer      = typeof options['replacer'] === 'function' ? options['replacer'] : null;

  this.implicitTypes = this.schema.compiledImplicit;
  this.explicitTypes = this.schema.compiledExplicit;

  this.tag = null;
  this.result = '';

  this.duplicates = [];
  this.usedDuplicates = null;
}

// Indents every line in a string. Empty lines (\n only) are not indented.
function indentString(string, spaces) {
  var ind = common.repeat(' ', spaces),
      position = 0,
      next = -1,
      result = '',
      line,
      length = string.length;

  while (position < length) {
    next = string.indexOf('\n', position);
    if (next === -1) {
      line = string.slice(position);
      position = length;
    } else {
      line = string.slice(position, next + 1);
      position = next + 1;
    }

    if (line.length && line !== '\n') result += ind;

    result += line;
  }

  return result;
}

function generateNextLine(state, level) {
  return '\n' + common.repeat(' ', state.indent * level);
}

function testImplicitResolving(state, str) {
  var index, length, type;

  for (index = 0, length = state.implicitTypes.length; index < length; index += 1) {
    type = state.implicitTypes[index];

    if (type.resolve(str)) {
      return true;
    }
  }

  return false;
}

// [33] s-white ::= s-space | s-tab
function isWhitespace(c) {
  return c === CHAR_SPACE || c === CHAR_TAB;
}

// Returns true if the character can be printed without escaping.
// From YAML 1.2: "any allowed characters known to be non-printable
// should also be escaped. [However,] This isn’t mandatory"
// Derived from nb-char - \t - #x85 - #xA0 - #x2028 - #x2029.
function isPrintable(c) {
  return  (0x00020 <= c && c <= 0x00007E)
      || ((0x000A1 <= c && c <= 0x00D7FF) && c !== 0x2028 && c !== 0x2029)
      || ((0x0E000 <= c && c <= 0x00FFFD) && c !== CHAR_BOM)
      ||  (0x10000 <= c && c <= 0x10FFFF);
}

// [34] ns-char ::= nb-char - s-white
// [27] nb-char ::= c-printable - b-char - c-byte-order-mark
// [26] b-char  ::= b-line-feed | b-carriage-return
// Including s-white (for some reason, examples doesn't match specs in this aspect)
// ns-char ::= c-printable - b-line-feed - b-carriage-return - c-byte-order-mark
function isNsCharOrWhitespace(c) {
  return isPrintable(c)
    && c !== CHAR_BOM
    // - b-char
    && c !== CHAR_CARRIAGE_RETURN
    && c !== CHAR_LINE_FEED;
}

// [127]  ns-plain-safe(c) ::= c = flow-out  ⇒ ns-plain-safe-out
//                             c = flow-in   ⇒ ns-plain-safe-in
//                             c = block-key ⇒ ns-plain-safe-out
//                             c = flow-key  ⇒ ns-plain-safe-in
// [128] ns-plain-safe-out ::= ns-char
// [129]  ns-plain-safe-in ::= ns-char - c-flow-indicator
// [130]  ns-plain-char(c) ::=  ( ns-plain-safe(c) - “:” - “#” )
//                            | ( /* An ns-char preceding */ “#” )
//                            | ( “:” /* Followed by an ns-plain-safe(c) */ )
function isPlainSafe(c, prev, inblock) {
  var cIsNsCharOrWhitespace = isNsCharOrWhitespace(c);
  var cIsNsChar = cIsNsCharOrWhitespace && !isWhitespace(c);
  return (
    // ns-plain-safe
    inblock ? // c = flow-in
      cIsNsCharOrWhitespace
      : cIsNsCharOrWhitespace
        // - c-flow-indicator
        && c !== CHAR_COMMA
        && c !== CHAR_LEFT_SQUARE_BRACKET
        && c !== CHAR_RIGHT_SQUARE_BRACKET
        && c !== CHAR_LEFT_CURLY_BRACKET
        && c !== CHAR_RIGHT_CURLY_BRACKET
  )
    // ns-plain-char
    && c !== CHAR_SHARP // false on '#'
    && !(prev === CHAR_COLON && !cIsNsChar) // false on ': '
    || (isNsCharOrWhitespace(prev) && !isWhitespace(prev) && c === CHAR_SHARP) // change to true on '[^ ]#'
    || (prev === CHAR_COLON && cIsNsChar); // change to true on ':[^ ]'
}

// Simplified test for values allowed as the first character in plain style.
function isPlainSafeFirst(c) {
  // Uses a subset of ns-char - c-indicator
  // where ns-char = nb-char - s-white.
  // No support of ( ( “?” | “:” | “-” ) /* Followed by an ns-plain-safe(c)) */ ) part
  return isPrintable(c) && c !== CHAR_BOM
    && !isWhitespace(c) // - s-white
    // - (c-indicator ::=
    // “-” | “?” | “:” | “,” | “[” | “]” | “{” | “}”
    && c !== CHAR_MINUS
    && c !== CHAR_QUESTION
    && c !== CHAR_COLON
    && c !== CHAR_COMMA
    && c !== CHAR_LEFT_SQUARE_BRACKET
    && c !== CHAR_RIGHT_SQUARE_BRACKET
    && c !== CHAR_LEFT_CURLY_BRACKET
    && c !== CHAR_RIGHT_CURLY_BRACKET
    // | “#” | “&” | “*” | “!” | “|” | “=” | “>” | “'” | “"”
    && c !== CHAR_SHARP
    && c !== CHAR_AMPERSAND
    && c !== CHAR_ASTERISK
    && c !== CHAR_EXCLAMATION
    && c !== CHAR_VERTICAL_LINE
    && c !== CHAR_EQUALS
    && c !== CHAR_GREATER_THAN
    && c !== CHAR_SINGLE_QUOTE
    && c !== CHAR_DOUBLE_QUOTE
    // | “%” | “@” | “`”)
    && c !== CHAR_PERCENT
    && c !== CHAR_COMMERCIAL_AT
    && c !== CHAR_GRAVE_ACCENT;
}

// Simplified test for values allowed as the last character in plain style.
function isPlainSafeLast(c) {
  // just not whitespace or colon, it will be checked to be plain character later
  return !isWhitespace(c) && c !== CHAR_COLON;
}

// Same as 'string'.codePointAt(pos), but works in older browsers.
function codePointAt(string, pos) {
  var first = string.charCodeAt(pos), second;
  if (first >= 0xD800 && first <= 0xDBFF && pos + 1 < string.length) {
    second = string.charCodeAt(pos + 1);
    if (second >= 0xDC00 && second <= 0xDFFF) {
      // https://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
      return (first - 0xD800) * 0x400 + second - 0xDC00 + 0x10000;
    }
  }
  return first;
}

// Determines whether block indentation indicator is required.
function needIndentIndicator(string) {
  var leadingSpaceRe = /^\n* /;
  return leadingSpaceRe.test(string);
}

var STYLE_PLAIN   = 1,
    STYLE_SINGLE  = 2,
    STYLE_LITERAL = 3,
    STYLE_FOLDED  = 4,
    STYLE_DOUBLE  = 5;

// Determines which scalar styles are possible and returns the preferred style.
// lineWidth = -1 => no limit.
// Pre-conditions: str.length > 0.
// Post-conditions:
//    STYLE_PLAIN or STYLE_SINGLE => no \n are in the string.
//    STYLE_LITERAL => no lines are suitable for folding (or lineWidth is -1).
//    STYLE_FOLDED => a line > lineWidth and can be folded (and lineWidth != -1).
function chooseScalarStyle(string, singleLineOnly, indentPerLevel, lineWidth,
  testAmbiguousType, quotingType, forceQuotes, inblock) {

  var i;
  var char = 0;
  var prevChar = null;
  var hasLineBreak = false;
  var hasFoldableLine = false; // only checked if shouldTrackWidth
  var shouldTrackWidth = lineWidth !== -1;
  var previousLineBreak = -1; // count the first line correctly
  var plain = isPlainSafeFirst(codePointAt(string, 0))
          && isPlainSafeLast(codePointAt(string, string.length - 1));

  if (singleLineOnly || forceQuotes) {
    // Case: no block styles.
    // Check for disallowed characters to rule out plain and single.
    for (i = 0; i < string.length; char >= 0x10000 ? i += 2 : i++) {
      char = codePointAt(string, i);
      if (!isPrintable(char)) {
        return STYLE_DOUBLE;
      }
      plain = plain && isPlainSafe(char, prevChar, inblock);
      prevChar = char;
    }
  } else {
    // Case: block styles permitted.
    for (i = 0; i < string.length; char >= 0x10000 ? i += 2 : i++) {
      char = codePointAt(string, i);
      if (char === CHAR_LINE_FEED) {
        hasLineBreak = true;
        // Check if any line can be folded.
        if (shouldTrackWidth) {
          hasFoldableLine = hasFoldableLine ||
            // Foldable line = too long, and not more-indented.
            (i - previousLineBreak - 1 > lineWidth &&
             string[previousLineBreak + 1] !== ' ');
          previousLineBreak = i;
        }
      } else if (!isPrintable(char)) {
        return STYLE_DOUBLE;
      }
      plain = plain && isPlainSafe(char, prevChar, inblock);
      prevChar = char;
    }
    // in case the end is missing a \n
    hasFoldableLine = hasFoldableLine || (shouldTrackWidth &&
      (i - previousLineBreak - 1 > lineWidth &&
       string[previousLineBreak + 1] !== ' '));
  }
  // Although every style can represent \n without escaping, prefer block styles
  // for multiline, since they're more readable and they don't add empty lines.
  // Also prefer folding a super-long line.
  if (!hasLineBreak && !hasFoldableLine) {
    // Strings interpretable as another type have to be quoted;
    // e.g. the string 'true' vs. the boolean true.
    if (plain && !forceQuotes && !testAmbiguousType(string)) {
      return STYLE_PLAIN;
    }
    return quotingType === QUOTING_TYPE_DOUBLE ? STYLE_DOUBLE : STYLE_SINGLE;
  }
  // Edge case: block indentation indicator can only have one digit.
  if (indentPerLevel > 9 && needIndentIndicator(string)) {
    return STYLE_DOUBLE;
  }
  // At this point we know block styles are valid.
  // Prefer literal style unless we want to fold.
  if (!forceQuotes) {
    return hasFoldableLine ? STYLE_FOLDED : STYLE_LITERAL;
  }
  return quotingType === QUOTING_TYPE_DOUBLE ? STYLE_DOUBLE : STYLE_SINGLE;
}

// Note: line breaking/folding is implemented for only the folded style.
// NB. We drop the last trailing newline (if any) of a returned block scalar
//  since the dumper adds its own newline. This always works:
//    • No ending newline => unaffected; already using strip "-" chomping.
//    • Ending newline    => removed then restored.
//  Importantly, this keeps the "+" chomp indicator from gaining an extra line.
function writeScalar(state, string, level, iskey, inblock) {
  state.dump = (function () {
    if (string.length === 0) {
      return state.quotingType === QUOTING_TYPE_DOUBLE ? '""' : "''";
    }
    if (!state.noCompatMode) {
      if (DEPRECATED_BOOLEANS_SYNTAX.indexOf(string) !== -1 || DEPRECATED_BASE60_SYNTAX.test(string)) {
        return state.quotingType === QUOTING_TYPE_DOUBLE ? ('"' + string + '"') : ("'" + string + "'");
      }
    }

    var indent = state.indent * Math.max(1, level); // no 0-indent scalars
    // As indentation gets deeper, let the width decrease monotonically
    // to the lower bound min(state.lineWidth, 40).
    // Note that this implies
    //  state.lineWidth ≤ 40 + state.indent: width is fixed at the lower bound.
    //  state.lineWidth > 40 + state.indent: width decreases until the lower bound.
    // This behaves better than a constant minimum width which disallows narrower options,
    // or an indent threshold which causes the width to suddenly increase.
    var lineWidth = state.lineWidth === -1
      ? -1 : Math.max(Math.min(state.lineWidth, 40), state.lineWidth - indent);

    // Without knowing if keys are implicit/explicit, assume implicit for safety.
    var singleLineOnly = iskey
      // No block styles in flow mode.
      || (state.flowLevel > -1 && level >= state.flowLevel);
    function testAmbiguity(string) {
      return testImplicitResolving(state, string);
    }

    switch (chooseScalarStyle(string, singleLineOnly, state.indent, lineWidth,
      testAmbiguity, state.quotingType, state.forceQuotes && !iskey, inblock)) {

      case STYLE_PLAIN:
        return string;
      case STYLE_SINGLE:
        return "'" + string.replace(/'/g, "''") + "'";
      case STYLE_LITERAL:
        return '|' + blockHeader(string, state.indent)
          + dropEndingNewline(indentString(string, indent));
      case STYLE_FOLDED:
        return '>' + blockHeader(string, state.indent)
          + dropEndingNewline(indentString(foldString(string, lineWidth), indent));
      case STYLE_DOUBLE:
        return '"' + escapeString(string, lineWidth) + '"';
      default:
        throw new YAMLException('impossible error: invalid scalar style');
    }
  }());
}

// Pre-conditions: string is valid for a block scalar, 1 <= indentPerLevel <= 9.
function blockHeader(string, indentPerLevel) {
  var indentIndicator = needIndentIndicator(string) ? String(indentPerLevel) : '';

  // note the special case: the string '\n' counts as a "trailing" empty line.
  var clip =          string[string.length - 1] === '\n';
  var keep = clip && (string[string.length - 2] === '\n' || string === '\n');
  var chomp = keep ? '+' : (clip ? '' : '-');

  return indentIndicator + chomp + '\n';
}

// (See the note for writeScalar.)
function dropEndingNewline(string) {
  return string[string.length - 1] === '\n' ? string.slice(0, -1) : string;
}

// Note: a long line without a suitable break point will exceed the width limit.
// Pre-conditions: every char in str isPrintable, str.length > 0, width > 0.
function foldString(string, width) {
  // In folded style, $k$ consecutive newlines output as $k+1$ newlines—
  // unless they're before or after a more-indented line, or at the very
  // beginning or end, in which case $k$ maps to $k$.
  // Therefore, parse each chunk as newline(s) followed by a content line.
  var lineRe = /(\n+)([^\n]*)/g;

  // first line (possibly an empty line)
  var result = (function () {
    var nextLF = string.indexOf('\n');
    nextLF = nextLF !== -1 ? nextLF : string.length;
    lineRe.lastIndex = nextLF;
    return foldLine(string.slice(0, nextLF), width);
  }());
  // If we haven't reached the first content line yet, don't add an extra \n.
  var prevMoreIndented = string[0] === '\n' || string[0] === ' ';
  var moreIndented;

  // rest of the lines
  var match;
  while ((match = lineRe.exec(string))) {
    var prefix = match[1], line = match[2];
    moreIndented = (line[0] === ' ');
    result += prefix
      + (!prevMoreIndented && !moreIndented && line !== ''
        ? '\n' : '')
      + foldLine(line, width);
    prevMoreIndented = moreIndented;
  }

  return result;
}

// Greedy line breaking.
// Picks the longest line under the limit each time,
// otherwise settles for the shortest line over the limit.
// NB. More-indented lines *cannot* be folded, as that would add an extra \n.
function foldLine(line, width) {
  if (line === '' || line[0] === ' ') return line;

  // Since a more-indented line adds a \n, breaks can't be followed by a space.
  var breakRe = / [^ ]/g; // note: the match index will always be <= length-2.
  var match;
  // start is an inclusive index. end, curr, and next are exclusive.
  var start = 0, end, curr = 0, next = 0;
  var result = '';

  // Invariants: 0 <= start <= length-1.
  //   0 <= curr <= next <= max(0, length-2). curr - start <= width.
  // Inside the loop:
  //   A match implies length >= 2, so curr and next are <= length-2.
  while ((match = breakRe.exec(line))) {
    next = match.index;
    // maintain invariant: curr - start <= width
    if (next - start > width) {
      end = (curr > start) ? curr : next; // derive end <= length-2
      result += '\n' + line.slice(start, end);
      // skip the space that was output as \n
      start = end + 1;                    // derive start <= length-1
    }
    curr = next;
  }

  // By the invariants, start <= length-1, so there is something left over.
  // It is either the whole string or a part starting from non-whitespace.
  result += '\n';
  // Insert a break if the remainder is too long and there is a break available.
  if (line.length - start > width && curr > start) {
    result += line.slice(start, curr) + '\n' + line.slice(curr + 1);
  } else {
    result += line.slice(start);
  }

  return result.slice(1); // drop extra \n joiner
}

// Escapes a double-quoted string.
function escapeString(string) {
  var result = '';
  var char = 0;
  var escapeSeq;

  for (var i = 0; i < string.length; char >= 0x10000 ? i += 2 : i++) {
    char = codePointAt(string, i);
    escapeSeq = ESCAPE_SEQUENCES[char];

    if (!escapeSeq && isPrintable(char)) {
      result += string[i];
      if (char >= 0x10000) result += string[i + 1];
    } else {
      result += escapeSeq || encodeHex(char);
    }
  }

  return result;
}

function writeFlowSequence(state, level, object) {
  var _result = '',
      _tag    = state.tag,
      index,
      length,
      value;

  for (index = 0, length = object.length; index < length; index += 1) {
    value = object[index];

    if (state.replacer) {
      value = state.replacer.call(object, String(index), value);
    }

    // Write only valid elements, put null instead of invalid elements.
    if (writeNode(state, level, value, false, false) ||
        (typeof value === 'undefined' &&
         writeNode(state, level, null, false, false))) {

      if (_result !== '') _result += ',' + (!state.condenseFlow ? ' ' : '');
      _result += state.dump;
    }
  }

  state.tag = _tag;
  state.dump = '[' + _result + ']';
}

function writeBlockSequence(state, level, object, compact) {
  var _result = '',
      _tag    = state.tag,
      index,
      length,
      value;

  for (index = 0, length = object.length; index < length; index += 1) {
    value = object[index];

    if (state.replacer) {
      value = state.replacer.call(object, String(index), value);
    }

    // Write only valid elements, put null instead of invalid elements.
    if (writeNode(state, level + 1, value, true, true, false, true) ||
        (typeof value === 'undefined' &&
         writeNode(state, level + 1, null, true, true, false, true))) {

      if (!compact || _result !== '') {
        _result += generateNextLine(state, level);
      }

      if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
        _result += '-';
      } else {
        _result += '- ';
      }

      _result += state.dump;
    }
  }

  state.tag = _tag;
  state.dump = _result || '[]'; // Empty sequence if no valid values.
}

function writeFlowMapping(state, level, object) {
  var _result       = '',
      _tag          = state.tag,
      objectKeyList = Object.keys(object),
      index,
      length,
      objectKey,
      objectValue,
      pairBuffer;

  for (index = 0, length = objectKeyList.length; index < length; index += 1) {

    pairBuffer = '';
    if (_result !== '') pairBuffer += ', ';

    if (state.condenseFlow) pairBuffer += '"';

    objectKey = objectKeyList[index];
    objectValue = object[objectKey];

    if (state.replacer) {
      objectValue = state.replacer.call(object, objectKey, objectValue);
    }

    if (!writeNode(state, level, objectKey, false, false)) {
      continue; // Skip this pair because of invalid key;
    }

    if (state.dump.length > 1024) pairBuffer += '? ';

    pairBuffer += state.dump + (state.condenseFlow ? '"' : '') + ':' + (state.condenseFlow ? '' : ' ');

    if (!writeNode(state, level, objectValue, false, false)) {
      continue; // Skip this pair because of invalid value.
    }

    pairBuffer += state.dump;

    // Both key and value are valid.
    _result += pairBuffer;
  }

  state.tag = _tag;
  state.dump = '{' + _result + '}';
}

function writeBlockMapping(state, level, object, compact) {
  var _result       = '',
      _tag          = state.tag,
      objectKeyList = Object.keys(object),
      index,
      length,
      objectKey,
      objectValue,
      explicitPair,
      pairBuffer;

  // Allow sorting keys so that the output file is deterministic
  if (state.sortKeys === true) {
    // Default sorting
    objectKeyList.sort();
  } else if (typeof state.sortKeys === 'function') {
    // Custom sort function
    objectKeyList.sort(state.sortKeys);
  } else if (state.sortKeys) {
    // Something is wrong
    throw new YAMLException('sortKeys must be a boolean or a function');
  }

  for (index = 0, length = objectKeyList.length; index < length; index += 1) {
    pairBuffer = '';

    if (!compact || _result !== '') {
      pairBuffer += generateNextLine(state, level);
    }

    objectKey = objectKeyList[index];
    objectValue = object[objectKey];

    if (state.replacer) {
      objectValue = state.replacer.call(object, objectKey, objectValue);
    }

    if (!writeNode(state, level + 1, objectKey, true, true, true)) {
      continue; // Skip this pair because of invalid key.
    }

    explicitPair = (state.tag !== null && state.tag !== '?') ||
                   (state.dump && state.dump.length > 1024);

    if (explicitPair) {
      if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
        pairBuffer += '?';
      } else {
        pairBuffer += '? ';
      }
    }

    pairBuffer += state.dump;

    if (explicitPair) {
      pairBuffer += generateNextLine(state, level);
    }

    if (!writeNode(state, level + 1, objectValue, true, explicitPair)) {
      continue; // Skip this pair because of invalid value.
    }

    if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
      pairBuffer += ':';
    } else {
      pairBuffer += ': ';
    }

    pairBuffer += state.dump;

    // Both key and value are valid.
    _result += pairBuffer;
  }

  state.tag = _tag;
  state.dump = _result || '{}'; // Empty mapping if no valid pairs.
}

function detectType(state, object, explicit) {
  var _result, typeList, index, length, type, style;

  typeList = explicit ? state.explicitTypes : state.implicitTypes;

  for (index = 0, length = typeList.length; index < length; index += 1) {
    type = typeList[index];

    if ((type.instanceOf  || type.predicate) &&
        (!type.instanceOf || ((typeof object === 'object') && (object instanceof type.instanceOf))) &&
        (!type.predicate  || type.predicate(object))) {

      if (explicit) {
        if (type.multi && type.representName) {
          state.tag = type.representName(object);
        } else {
          state.tag = type.tag;
        }
      } else {
        state.tag = '?';
      }

      if (type.represent) {
        style = state.styleMap[type.tag] || type.defaultStyle;

        if (_toString.call(type.represent) === '[object Function]') {
          _result = type.represent(object, style);
        } else if (_hasOwnProperty.call(type.represent, style)) {
          _result = type.represent[style](object, style);
        } else {
          throw new YAMLException('!<' + type.tag + '> tag resolver accepts not "' + style + '" style');
        }

        state.dump = _result;
      }

      return true;
    }
  }

  return false;
}

// Serializes `object` and writes it to global `result`.
// Returns true on success, or false on invalid object.
//
function writeNode(state, level, object, block, compact, iskey, isblockseq) {
  state.tag = null;
  state.dump = object;

  if (!detectType(state, object, false)) {
    detectType(state, object, true);
  }

  var type = _toString.call(state.dump);
  var inblock = block;
  var tagStr;

  if (block) {
    block = (state.flowLevel < 0 || state.flowLevel > level);
  }

  var objectOrArray = type === '[object Object]' || type === '[object Array]',
      duplicateIndex,
      duplicate;

  if (objectOrArray) {
    duplicateIndex = state.duplicates.indexOf(object);
    duplicate = duplicateIndex !== -1;
  }

  if ((state.tag !== null && state.tag !== '?') || duplicate || (state.indent !== 2 && level > 0)) {
    compact = false;
  }

  if (duplicate && state.usedDuplicates[duplicateIndex]) {
    state.dump = '*ref_' + duplicateIndex;
  } else {
    if (objectOrArray && duplicate && !state.usedDuplicates[duplicateIndex]) {
      state.usedDuplicates[duplicateIndex] = true;
    }
    if (type === '[object Object]') {
      if (block && (Object.keys(state.dump).length !== 0)) {
        writeBlockMapping(state, level, state.dump, compact);
        if (duplicate) {
          state.dump = '&ref_' + duplicateIndex + state.dump;
        }
      } else {
        writeFlowMapping(state, level, state.dump);
        if (duplicate) {
          state.dump = '&ref_' + duplicateIndex + ' ' + state.dump;
        }
      }
    } else if (type === '[object Array]') {
      if (block && (state.dump.length !== 0)) {
        if (state.noArrayIndent && !isblockseq && level > 0) {
          writeBlockSequence(state, level - 1, state.dump, compact);
        } else {
          writeBlockSequence(state, level, state.dump, compact);
        }
        if (duplicate) {
          state.dump = '&ref_' + duplicateIndex + state.dump;
        }
      } else {
        writeFlowSequence(state, level, state.dump);
        if (duplicate) {
          state.dump = '&ref_' + duplicateIndex + ' ' + state.dump;
        }
      }
    } else if (type === '[object String]') {
      if (state.tag !== '?') {
        writeScalar(state, state.dump, level, iskey, inblock);
      }
    } else if (type === '[object Undefined]') {
      return false;
    } else {
      if (state.skipInvalid) return false;
      throw new YAMLException('unacceptable kind of an object to dump ' + type);
    }

    if (state.tag !== null && state.tag !== '?') {
      // Need to encode all characters except those allowed by the spec:
      //
      // [35] ns-dec-digit    ::=  [#x30-#x39] /* 0-9 */
      // [36] ns-hex-digit    ::=  ns-dec-digit
      //                         | [#x41-#x46] /* A-F */ | [#x61-#x66] /* a-f */
      // [37] ns-ascii-letter ::=  [#x41-#x5A] /* A-Z */ | [#x61-#x7A] /* a-z */
      // [38] ns-word-char    ::=  ns-dec-digit | ns-ascii-letter | “-”
      // [39] ns-uri-char     ::=  “%” ns-hex-digit ns-hex-digit | ns-word-char | “#”
      //                         | “;” | “/” | “?” | “:” | “@” | “&” | “=” | “+” | “$” | “,”
      //                         | “_” | “.” | “!” | “~” | “*” | “'” | “(” | “)” | “[” | “]”
      //
      // Also need to encode '!' because it has special meaning (end of tag prefix).
      //
      tagStr = encodeURI(
        state.tag[0] === '!' ? state.tag.slice(1) : state.tag
      ).replace(/!/g, '%21');

      if (state.tag[0] === '!') {
        tagStr = '!' + tagStr;
      } else if (tagStr.slice(0, 18) === 'tag:yaml.org,2002:') {
        tagStr = '!!' + tagStr.slice(18);
      } else {
        tagStr = '!<' + tagStr + '>';
      }

      state.dump = tagStr + ' ' + state.dump;
    }
  }

  return true;
}

function getDuplicateReferences(object, state) {
  var objects = [],
      duplicatesIndexes = [],
      index,
      length;

  inspectNode(object, objects, duplicatesIndexes);

  for (index = 0, length = duplicatesIndexes.length; index < length; index += 1) {
    state.duplicates.push(objects[duplicatesIndexes[index]]);
  }
  state.usedDuplicates = new Array(length);
}

function inspectNode(object, objects, duplicatesIndexes) {
  var objectKeyList,
      index,
      length;

  if (object !== null && typeof object === 'object') {
    index = objects.indexOf(object);
    if (index !== -1) {
      if (duplicatesIndexes.indexOf(index) === -1) {
        duplicatesIndexes.push(index);
      }
    } else {
      objects.push(object);

      if (Array.isArray(object)) {
        for (index = 0, length = object.length; index < length; index += 1) {
          inspectNode(object[index], objects, duplicatesIndexes);
        }
      } else {
        objectKeyList = Object.keys(object);

        for (index = 0, length = objectKeyList.length; index < length; index += 1) {
          inspectNode(object[objectKeyList[index]], objects, duplicatesIndexes);
        }
      }
    }
  }
}

function dump(input, options) {
  options = options || {};

  var state = new State(options);

  if (!state.noRefs) getDuplicateReferences(input, state);

  var value = input;

  if (state.replacer) {
    value = state.replacer.call({ '': value }, '', value);
  }

  if (writeNode(state, 0, value, true, true)) return state.dump + '\n';

  return '';
}

module.exports.dump = dump;


/***/ }),

/***/ 1231:
/***/ ((module) => {

"use strict";
// YAML error class. http://stackoverflow.com/questions/8458984
//



function formatError(exception, compact) {
  var where = '', message = exception.reason || '(unknown reason)';

  if (!exception.mark) return message;

  if (exception.mark.name) {
    where += 'in "' + exception.mark.name + '" ';
  }

  where += '(' + (exception.mark.line + 1) + ':' + (exception.mark.column + 1) + ')';

  if (!compact && exception.mark.snippet) {
    where += '\n\n' + exception.mark.snippet;
  }

  return message + ' ' + where;
}


function YAMLException(reason, mark) {
  // Super constructor
  Error.call(this);

  this.name = 'YAMLException';
  this.reason = reason;
  this.mark = mark;
  this.message = formatError(this, false);

  // Include stack trace in error object
  if (Error.captureStackTrace) {
    // Chrome and NodeJS
    Error.captureStackTrace(this, this.constructor);
  } else {
    // FF, IE 10+ and Safari 6+. Fallback for others
    this.stack = (new Error()).stack || '';
  }
}


// Inherit from Error
YAMLException.prototype = Object.create(Error.prototype);
YAMLException.prototype.constructor = YAMLException;


YAMLException.prototype.toString = function toString(compact) {
  return this.name + ': ' + formatError(this, compact);
};


module.exports = YAMLException;


/***/ }),

/***/ 9243:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


/*eslint-disable max-len,no-use-before-define*/

var common              = __webpack_require__(8433);
var YAMLException       = __webpack_require__(1231);
var makeSnippet         = __webpack_require__(8083);
var DEFAULT_SCHEMA      = __webpack_require__(5489);


var _hasOwnProperty = Object.prototype.hasOwnProperty;


var CONTEXT_FLOW_IN   = 1;
var CONTEXT_FLOW_OUT  = 2;
var CONTEXT_BLOCK_IN  = 3;
var CONTEXT_BLOCK_OUT = 4;


var CHOMPING_CLIP  = 1;
var CHOMPING_STRIP = 2;
var CHOMPING_KEEP  = 3;


var PATTERN_NON_PRINTABLE         = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/;
var PATTERN_NON_ASCII_LINE_BREAKS = /[\x85\u2028\u2029]/;
var PATTERN_FLOW_INDICATORS       = /[,\[\]\{\}]/;
var PATTERN_TAG_HANDLE            = /^(?:!|!!|![a-z\-]+!)$/i;
var PATTERN_TAG_URI               = /^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;


function _class(obj) { return Object.prototype.toString.call(obj); }

function is_EOL(c) {
  return (c === 0x0A/* LF */) || (c === 0x0D/* CR */);
}

function is_WHITE_SPACE(c) {
  return (c === 0x09/* Tab */) || (c === 0x20/* Space */);
}

function is_WS_OR_EOL(c) {
  return (c === 0x09/* Tab */) ||
         (c === 0x20/* Space */) ||
         (c === 0x0A/* LF */) ||
         (c === 0x0D/* CR */);
}

function is_FLOW_INDICATOR(c) {
  return c === 0x2C/* , */ ||
         c === 0x5B/* [ */ ||
         c === 0x5D/* ] */ ||
         c === 0x7B/* { */ ||
         c === 0x7D/* } */;
}

function fromHexCode(c) {
  var lc;

  if ((0x30/* 0 */ <= c) && (c <= 0x39/* 9 */)) {
    return c - 0x30;
  }

  /*eslint-disable no-bitwise*/
  lc = c | 0x20;

  if ((0x61/* a */ <= lc) && (lc <= 0x66/* f */)) {
    return lc - 0x61 + 10;
  }

  return -1;
}

function escapedHexLen(c) {
  if (c === 0x78/* x */) { return 2; }
  if (c === 0x75/* u */) { return 4; }
  if (c === 0x55/* U */) { return 8; }
  return 0;
}

function fromDecimalCode(c) {
  if ((0x30/* 0 */ <= c) && (c <= 0x39/* 9 */)) {
    return c - 0x30;
  }

  return -1;
}

function simpleEscapeSequence(c) {
  /* eslint-disable indent */
  return (c === 0x30/* 0 */) ? '\x00' :
        (c === 0x61/* a */) ? '\x07' :
        (c === 0x62/* b */) ? '\x08' :
        (c === 0x74/* t */) ? '\x09' :
        (c === 0x09/* Tab */) ? '\x09' :
        (c === 0x6E/* n */) ? '\x0A' :
        (c === 0x76/* v */) ? '\x0B' :
        (c === 0x66/* f */) ? '\x0C' :
        (c === 0x72/* r */) ? '\x0D' :
        (c === 0x65/* e */) ? '\x1B' :
        (c === 0x20/* Space */) ? ' ' :
        (c === 0x22/* " */) ? '\x22' :
        (c === 0x2F/* / */) ? '/' :
        (c === 0x5C/* \ */) ? '\x5C' :
        (c === 0x4E/* N */) ? '\x85' :
        (c === 0x5F/* _ */) ? '\xA0' :
        (c === 0x4C/* L */) ? '\u2028' :
        (c === 0x50/* P */) ? '\u2029' : '';
}

function charFromCodepoint(c) {
  if (c <= 0xFFFF) {
    return String.fromCharCode(c);
  }
  // Encode UTF-16 surrogate pair
  // https://en.wikipedia.org/wiki/UTF-16#Code_points_U.2B010000_to_U.2B10FFFF
  return String.fromCharCode(
    ((c - 0x010000) >> 10) + 0xD800,
    ((c - 0x010000) & 0x03FF) + 0xDC00
  );
}

var simpleEscapeCheck = new Array(256); // integer, for fast access
var simpleEscapeMap = new Array(256);
for (var i = 0; i < 256; i++) {
  simpleEscapeCheck[i] = simpleEscapeSequence(i) ? 1 : 0;
  simpleEscapeMap[i] = simpleEscapeSequence(i);
}


function State(input, options) {
  this.input = input;

  this.filename  = options['filename']  || null;
  this.schema    = options['schema']    || DEFAULT_SCHEMA;
  this.onWarning = options['onWarning'] || null;
  // (Hidden) Remove? makes the loader to expect YAML 1.1 documents
  // if such documents have no explicit %YAML directive
  this.legacy    = options['legacy']    || false;

  this.json      = options['json']      || false;
  this.listener  = options['listener']  || null;

  this.implicitTypes = this.schema.compiledImplicit;
  this.typeMap       = this.schema.compiledTypeMap;

  this.length     = input.length;
  this.position   = 0;
  this.line       = 0;
  this.lineStart  = 0;
  this.lineIndent = 0;

  // position of first leading tab in the current line,
  // used to make sure there are no tabs in the indentation
  this.firstTabInLine = -1;

  this.documents = [];

  /*
  this.version;
  this.checkLineBreaks;
  this.tagMap;
  this.anchorMap;
  this.tag;
  this.anchor;
  this.kind;
  this.result;*/

}


function generateError(state, message) {
  var mark = {
    name:     state.filename,
    buffer:   state.input.slice(0, -1), // omit trailing \0
    position: state.position,
    line:     state.line,
    column:   state.position - state.lineStart
  };

  mark.snippet = makeSnippet(mark);

  return new YAMLException(message, mark);
}

function throwError(state, message) {
  throw generateError(state, message);
}

function throwWarning(state, message) {
  if (state.onWarning) {
    state.onWarning.call(null, generateError(state, message));
  }
}


var directiveHandlers = {

  YAML: function handleYamlDirective(state, name, args) {

    var match, major, minor;

    if (state.version !== null) {
      throwError(state, 'duplication of %YAML directive');
    }

    if (args.length !== 1) {
      throwError(state, 'YAML directive accepts exactly one argument');
    }

    match = /^([0-9]+)\.([0-9]+)$/.exec(args[0]);

    if (match === null) {
      throwError(state, 'ill-formed argument of the YAML directive');
    }

    major = parseInt(match[1], 10);
    minor = parseInt(match[2], 10);

    if (major !== 1) {
      throwError(state, 'unacceptable YAML version of the document');
    }

    state.version = args[0];
    state.checkLineBreaks = (minor < 2);

    if (minor !== 1 && minor !== 2) {
      throwWarning(state, 'unsupported YAML version of the document');
    }
  },

  TAG: function handleTagDirective(state, name, args) {

    var handle, prefix;

    if (args.length !== 2) {
      throwError(state, 'TAG directive accepts exactly two arguments');
    }

    handle = args[0];
    prefix = args[1];

    if (!PATTERN_TAG_HANDLE.test(handle)) {
      throwError(state, 'ill-formed tag handle (first argument) of the TAG directive');
    }

    if (_hasOwnProperty.call(state.tagMap, handle)) {
      throwError(state, 'there is a previously declared suffix for "' + handle + '" tag handle');
    }

    if (!PATTERN_TAG_URI.test(prefix)) {
      throwError(state, 'ill-formed tag prefix (second argument) of the TAG directive');
    }

    try {
      prefix = decodeURIComponent(prefix);
    } catch (err) {
      throwError(state, 'tag prefix is malformed: ' + prefix);
    }

    state.tagMap[handle] = prefix;
  }
};


function captureSegment(state, start, end, checkJson) {
  var _position, _length, _character, _result;

  if (start < end) {
    _result = state.input.slice(start, end);

    if (checkJson) {
      for (_position = 0, _length = _result.length; _position < _length; _position += 1) {
        _character = _result.charCodeAt(_position);
        if (!(_character === 0x09 ||
              (0x20 <= _character && _character <= 0x10FFFF))) {
          throwError(state, 'expected valid JSON character');
        }
      }
    } else if (PATTERN_NON_PRINTABLE.test(_result)) {
      throwError(state, 'the stream contains non-printable characters');
    }

    state.result += _result;
  }
}

function mergeMappings(state, destination, source, overridableKeys) {
  var sourceKeys, key, index, quantity;

  if (!common.isObject(source)) {
    throwError(state, 'cannot merge mappings; the provided source object is unacceptable');
  }

  sourceKeys = Object.keys(source);

  for (index = 0, quantity = sourceKeys.length; index < quantity; index += 1) {
    key = sourceKeys[index];

    if (!_hasOwnProperty.call(destination, key)) {
      destination[key] = source[key];
      overridableKeys[key] = true;
    }
  }
}

function storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode,
  startLine, startLineStart, startPos) {

  var index, quantity;

  // The output is a plain object here, so keys can only be strings.
  // We need to convert keyNode to a string, but doing so can hang the process
  // (deeply nested arrays that explode exponentially using aliases).
  if (Array.isArray(keyNode)) {
    keyNode = Array.prototype.slice.call(keyNode);

    for (index = 0, quantity = keyNode.length; index < quantity; index += 1) {
      if (Array.isArray(keyNode[index])) {
        throwError(state, 'nested arrays are not supported inside keys');
      }

      if (typeof keyNode === 'object' && _class(keyNode[index]) === '[object Object]') {
        keyNode[index] = '[object Object]';
      }
    }
  }

  // Avoid code execution in load() via toString property
  // (still use its own toString for arrays, timestamps,
  // and whatever user schema extensions happen to have @@toStringTag)
  if (typeof keyNode === 'object' && _class(keyNode) === '[object Object]') {
    keyNode = '[object Object]';
  }


  keyNode = String(keyNode);

  if (_result === null) {
    _result = {};
  }

  if (keyTag === 'tag:yaml.org,2002:merge') {
    if (Array.isArray(valueNode)) {
      for (index = 0, quantity = valueNode.length; index < quantity; index += 1) {
        mergeMappings(state, _result, valueNode[index], overridableKeys);
      }
    } else {
      mergeMappings(state, _result, valueNode, overridableKeys);
    }
  } else {
    if (!state.json &&
        !_hasOwnProperty.call(overridableKeys, keyNode) &&
        _hasOwnProperty.call(_result, keyNode)) {
      state.line = startLine || state.line;
      state.lineStart = startLineStart || state.lineStart;
      state.position = startPos || state.position;
      throwError(state, 'duplicated mapping key');
    }

    // used for this specific key only because Object.defineProperty is slow
    if (keyNode === '__proto__') {
      Object.defineProperty(_result, keyNode, {
        configurable: true,
        enumerable: true,
        writable: true,
        value: valueNode
      });
    } else {
      _result[keyNode] = valueNode;
    }
    delete overridableKeys[keyNode];
  }

  return _result;
}

function readLineBreak(state) {
  var ch;

  ch = state.input.charCodeAt(state.position);

  if (ch === 0x0A/* LF */) {
    state.position++;
  } else if (ch === 0x0D/* CR */) {
    state.position++;
    if (state.input.charCodeAt(state.position) === 0x0A/* LF */) {
      state.position++;
    }
  } else {
    throwError(state, 'a line break is expected');
  }

  state.line += 1;
  state.lineStart = state.position;
  state.firstTabInLine = -1;
}

function skipSeparationSpace(state, allowComments, checkIndent) {
  var lineBreaks = 0,
      ch = state.input.charCodeAt(state.position);

  while (ch !== 0) {
    while (is_WHITE_SPACE(ch)) {
      if (ch === 0x09/* Tab */ && state.firstTabInLine === -1) {
        state.firstTabInLine = state.position;
      }
      ch = state.input.charCodeAt(++state.position);
    }

    if (allowComments && ch === 0x23/* # */) {
      do {
        ch = state.input.charCodeAt(++state.position);
      } while (ch !== 0x0A/* LF */ && ch !== 0x0D/* CR */ && ch !== 0);
    }

    if (is_EOL(ch)) {
      readLineBreak(state);

      ch = state.input.charCodeAt(state.position);
      lineBreaks++;
      state.lineIndent = 0;

      while (ch === 0x20/* Space */) {
        state.lineIndent++;
        ch = state.input.charCodeAt(++state.position);
      }
    } else {
      break;
    }
  }

  if (checkIndent !== -1 && lineBreaks !== 0 && state.lineIndent < checkIndent) {
    throwWarning(state, 'deficient indentation');
  }

  return lineBreaks;
}

function testDocumentSeparator(state) {
  var _position = state.position,
      ch;

  ch = state.input.charCodeAt(_position);

  // Condition state.position === state.lineStart is tested
  // in parent on each call, for efficiency. No needs to test here again.
  if ((ch === 0x2D/* - */ || ch === 0x2E/* . */) &&
      ch === state.input.charCodeAt(_position + 1) &&
      ch === state.input.charCodeAt(_position + 2)) {

    _position += 3;

    ch = state.input.charCodeAt(_position);

    if (ch === 0 || is_WS_OR_EOL(ch)) {
      return true;
    }
  }

  return false;
}

function writeFoldedLines(state, count) {
  if (count === 1) {
    state.result += ' ';
  } else if (count > 1) {
    state.result += common.repeat('\n', count - 1);
  }
}


function readPlainScalar(state, nodeIndent, withinFlowCollection) {
  var preceding,
      following,
      captureStart,
      captureEnd,
      hasPendingContent,
      _line,
      _lineStart,
      _lineIndent,
      _kind = state.kind,
      _result = state.result,
      ch;

  ch = state.input.charCodeAt(state.position);

  if (is_WS_OR_EOL(ch)      ||
      is_FLOW_INDICATOR(ch) ||
      ch === 0x23/* # */    ||
      ch === 0x26/* & */    ||
      ch === 0x2A/* * */    ||
      ch === 0x21/* ! */    ||
      ch === 0x7C/* | */    ||
      ch === 0x3E/* > */    ||
      ch === 0x27/* ' */    ||
      ch === 0x22/* " */    ||
      ch === 0x25/* % */    ||
      ch === 0x40/* @ */    ||
      ch === 0x60/* ` */) {
    return false;
  }

  if (ch === 0x3F/* ? */ || ch === 0x2D/* - */) {
    following = state.input.charCodeAt(state.position + 1);

    if (is_WS_OR_EOL(following) ||
        withinFlowCollection && is_FLOW_INDICATOR(following)) {
      return false;
    }
  }

  state.kind = 'scalar';
  state.result = '';
  captureStart = captureEnd = state.position;
  hasPendingContent = false;

  while (ch !== 0) {
    if (ch === 0x3A/* : */) {
      following = state.input.charCodeAt(state.position + 1);

      if (is_WS_OR_EOL(following) ||
          withinFlowCollection && is_FLOW_INDICATOR(following)) {
        break;
      }

    } else if (ch === 0x23/* # */) {
      preceding = state.input.charCodeAt(state.position - 1);

      if (is_WS_OR_EOL(preceding)) {
        break;
      }

    } else if ((state.position === state.lineStart && testDocumentSeparator(state)) ||
               withinFlowCollection && is_FLOW_INDICATOR(ch)) {
      break;

    } else if (is_EOL(ch)) {
      _line = state.line;
      _lineStart = state.lineStart;
      _lineIndent = state.lineIndent;
      skipSeparationSpace(state, false, -1);

      if (state.lineIndent >= nodeIndent) {
        hasPendingContent = true;
        ch = state.input.charCodeAt(state.position);
        continue;
      } else {
        state.position = captureEnd;
        state.line = _line;
        state.lineStart = _lineStart;
        state.lineIndent = _lineIndent;
        break;
      }
    }

    if (hasPendingContent) {
      captureSegment(state, captureStart, captureEnd, false);
      writeFoldedLines(state, state.line - _line);
      captureStart = captureEnd = state.position;
      hasPendingContent = false;
    }

    if (!is_WHITE_SPACE(ch)) {
      captureEnd = state.position + 1;
    }

    ch = state.input.charCodeAt(++state.position);
  }

  captureSegment(state, captureStart, captureEnd, false);

  if (state.result) {
    return true;
  }

  state.kind = _kind;
  state.result = _result;
  return false;
}

function readSingleQuotedScalar(state, nodeIndent) {
  var ch,
      captureStart, captureEnd;

  ch = state.input.charCodeAt(state.position);

  if (ch !== 0x27/* ' */) {
    return false;
  }

  state.kind = 'scalar';
  state.result = '';
  state.position++;
  captureStart = captureEnd = state.position;

  while ((ch = state.input.charCodeAt(state.position)) !== 0) {
    if (ch === 0x27/* ' */) {
      captureSegment(state, captureStart, state.position, true);
      ch = state.input.charCodeAt(++state.position);

      if (ch === 0x27/* ' */) {
        captureStart = state.position;
        state.position++;
        captureEnd = state.position;
      } else {
        return true;
      }

    } else if (is_EOL(ch)) {
      captureSegment(state, captureStart, captureEnd, true);
      writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
      captureStart = captureEnd = state.position;

    } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
      throwError(state, 'unexpected end of the document within a single quoted scalar');

    } else {
      state.position++;
      captureEnd = state.position;
    }
  }

  throwError(state, 'unexpected end of the stream within a single quoted scalar');
}

function readDoubleQuotedScalar(state, nodeIndent) {
  var captureStart,
      captureEnd,
      hexLength,
      hexResult,
      tmp,
      ch;

  ch = state.input.charCodeAt(state.position);

  if (ch !== 0x22/* " */) {
    return false;
  }

  state.kind = 'scalar';
  state.result = '';
  state.position++;
  captureStart = captureEnd = state.position;

  while ((ch = state.input.charCodeAt(state.position)) !== 0) {
    if (ch === 0x22/* " */) {
      captureSegment(state, captureStart, state.position, true);
      state.position++;
      return true;

    } else if (ch === 0x5C/* \ */) {
      captureSegment(state, captureStart, state.position, true);
      ch = state.input.charCodeAt(++state.position);

      if (is_EOL(ch)) {
        skipSeparationSpace(state, false, nodeIndent);

        // TODO: rework to inline fn with no type cast?
      } else if (ch < 256 && simpleEscapeCheck[ch]) {
        state.result += simpleEscapeMap[ch];
        state.position++;

      } else if ((tmp = escapedHexLen(ch)) > 0) {
        hexLength = tmp;
        hexResult = 0;

        for (; hexLength > 0; hexLength--) {
          ch = state.input.charCodeAt(++state.position);

          if ((tmp = fromHexCode(ch)) >= 0) {
            hexResult = (hexResult << 4) + tmp;

          } else {
            throwError(state, 'expected hexadecimal character');
          }
        }

        state.result += charFromCodepoint(hexResult);

        state.position++;

      } else {
        throwError(state, 'unknown escape sequence');
      }

      captureStart = captureEnd = state.position;

    } else if (is_EOL(ch)) {
      captureSegment(state, captureStart, captureEnd, true);
      writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
      captureStart = captureEnd = state.position;

    } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
      throwError(state, 'unexpected end of the document within a double quoted scalar');

    } else {
      state.position++;
      captureEnd = state.position;
    }
  }

  throwError(state, 'unexpected end of the stream within a double quoted scalar');
}

function readFlowCollection(state, nodeIndent) {
  var readNext = true,
      _line,
      _lineStart,
      _pos,
      _tag     = state.tag,
      _result,
      _anchor  = state.anchor,
      following,
      terminator,
      isPair,
      isExplicitPair,
      isMapping,
      overridableKeys = Object.create(null),
      keyNode,
      keyTag,
      valueNode,
      ch;

  ch = state.input.charCodeAt(state.position);

  if (ch === 0x5B/* [ */) {
    terminator = 0x5D;/* ] */
    isMapping = false;
    _result = [];
  } else if (ch === 0x7B/* { */) {
    terminator = 0x7D;/* } */
    isMapping = true;
    _result = {};
  } else {
    return false;
  }

  if (state.anchor !== null) {
    state.anchorMap[state.anchor] = _result;
  }

  ch = state.input.charCodeAt(++state.position);

  while (ch !== 0) {
    skipSeparationSpace(state, true, nodeIndent);

    ch = state.input.charCodeAt(state.position);

    if (ch === terminator) {
      state.position++;
      state.tag = _tag;
      state.anchor = _anchor;
      state.kind = isMapping ? 'mapping' : 'sequence';
      state.result = _result;
      return true;
    } else if (!readNext) {
      throwError(state, 'missed comma between flow collection entries');
    } else if (ch === 0x2C/* , */) {
      // "flow collection entries can never be completely empty", as per YAML 1.2, section 7.4
      throwError(state, "expected the node content, but found ','");
    }

    keyTag = keyNode = valueNode = null;
    isPair = isExplicitPair = false;

    if (ch === 0x3F/* ? */) {
      following = state.input.charCodeAt(state.position + 1);

      if (is_WS_OR_EOL(following)) {
        isPair = isExplicitPair = true;
        state.position++;
        skipSeparationSpace(state, true, nodeIndent);
      }
    }

    _line = state.line; // Save the current line.
    _lineStart = state.lineStart;
    _pos = state.position;
    composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
    keyTag = state.tag;
    keyNode = state.result;
    skipSeparationSpace(state, true, nodeIndent);

    ch = state.input.charCodeAt(state.position);

    if ((isExplicitPair || state.line === _line) && ch === 0x3A/* : */) {
      isPair = true;
      ch = state.input.charCodeAt(++state.position);
      skipSeparationSpace(state, true, nodeIndent);
      composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
      valueNode = state.result;
    }

    if (isMapping) {
      storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, _line, _lineStart, _pos);
    } else if (isPair) {
      _result.push(storeMappingPair(state, null, overridableKeys, keyTag, keyNode, valueNode, _line, _lineStart, _pos));
    } else {
      _result.push(keyNode);
    }

    skipSeparationSpace(state, true, nodeIndent);

    ch = state.input.charCodeAt(state.position);

    if (ch === 0x2C/* , */) {
      readNext = true;
      ch = state.input.charCodeAt(++state.position);
    } else {
      readNext = false;
    }
  }

  throwError(state, 'unexpected end of the stream within a flow collection');
}

function readBlockScalar(state, nodeIndent) {
  var captureStart,
      folding,
      chomping       = CHOMPING_CLIP,
      didReadContent = false,
      detectedIndent = false,
      textIndent     = nodeIndent,
      emptyLines     = 0,
      atMoreIndented = false,
      tmp,
      ch;

  ch = state.input.charCodeAt(state.position);

  if (ch === 0x7C/* | */) {
    folding = false;
  } else if (ch === 0x3E/* > */) {
    folding = true;
  } else {
    return false;
  }

  state.kind = 'scalar';
  state.result = '';

  while (ch !== 0) {
    ch = state.input.charCodeAt(++state.position);

    if (ch === 0x2B/* + */ || ch === 0x2D/* - */) {
      if (CHOMPING_CLIP === chomping) {
        chomping = (ch === 0x2B/* + */) ? CHOMPING_KEEP : CHOMPING_STRIP;
      } else {
        throwError(state, 'repeat of a chomping mode identifier');
      }

    } else if ((tmp = fromDecimalCode(ch)) >= 0) {
      if (tmp === 0) {
        throwError(state, 'bad explicit indentation width of a block scalar; it cannot be less than one');
      } else if (!detectedIndent) {
        textIndent = nodeIndent + tmp - 1;
        detectedIndent = true;
      } else {
        throwError(state, 'repeat of an indentation width identifier');
      }

    } else {
      break;
    }
  }

  if (is_WHITE_SPACE(ch)) {
    do { ch = state.input.charCodeAt(++state.position); }
    while (is_WHITE_SPACE(ch));

    if (ch === 0x23/* # */) {
      do { ch = state.input.charCodeAt(++state.position); }
      while (!is_EOL(ch) && (ch !== 0));
    }
  }

  while (ch !== 0) {
    readLineBreak(state);
    state.lineIndent = 0;

    ch = state.input.charCodeAt(state.position);

    while ((!detectedIndent || state.lineIndent < textIndent) &&
           (ch === 0x20/* Space */)) {
      state.lineIndent++;
      ch = state.input.charCodeAt(++state.position);
    }

    if (!detectedIndent && state.lineIndent > textIndent) {
      textIndent = state.lineIndent;
    }

    if (is_EOL(ch)) {
      emptyLines++;
      continue;
    }

    // End of the scalar.
    if (state.lineIndent < textIndent) {

      // Perform the chomping.
      if (chomping === CHOMPING_KEEP) {
        state.result += common.repeat('\n', didReadContent ? 1 + emptyLines : emptyLines);
      } else if (chomping === CHOMPING_CLIP) {
        if (didReadContent) { // i.e. only if the scalar is not empty.
          state.result += '\n';
        }
      }

      // Break this `while` cycle and go to the funciton's epilogue.
      break;
    }

    // Folded style: use fancy rules to handle line breaks.
    if (folding) {

      // Lines starting with white space characters (more-indented lines) are not folded.
      if (is_WHITE_SPACE(ch)) {
        atMoreIndented = true;
        // except for the first content line (cf. Example 8.1)
        state.result += common.repeat('\n', didReadContent ? 1 + emptyLines : emptyLines);

      // End of more-indented block.
      } else if (atMoreIndented) {
        atMoreIndented = false;
        state.result += common.repeat('\n', emptyLines + 1);

      // Just one line break - perceive as the same line.
      } else if (emptyLines === 0) {
        if (didReadContent) { // i.e. only if we have already read some scalar content.
          state.result += ' ';
        }

      // Several line breaks - perceive as different lines.
      } else {
        state.result += common.repeat('\n', emptyLines);
      }

    // Literal style: just add exact number of line breaks between content lines.
    } else {
      // Keep all line breaks except the header line break.
      state.result += common.repeat('\n', didReadContent ? 1 + emptyLines : emptyLines);
    }

    didReadContent = true;
    detectedIndent = true;
    emptyLines = 0;
    captureStart = state.position;

    while (!is_EOL(ch) && (ch !== 0)) {
      ch = state.input.charCodeAt(++state.position);
    }

    captureSegment(state, captureStart, state.position, false);
  }

  return true;
}

function readBlockSequence(state, nodeIndent) {
  var _line,
      _tag      = state.tag,
      _anchor   = state.anchor,
      _result   = [],
      following,
      detected  = false,
      ch;

  // there is a leading tab before this token, so it can't be a block sequence/mapping;
  // it can still be flow sequence/mapping or a scalar
  if (state.firstTabInLine !== -1) return false;

  if (state.anchor !== null) {
    state.anchorMap[state.anchor] = _result;
  }

  ch = state.input.charCodeAt(state.position);

  while (ch !== 0) {
    if (state.firstTabInLine !== -1) {
      state.position = state.firstTabInLine;
      throwError(state, 'tab characters must not be used in indentation');
    }

    if (ch !== 0x2D/* - */) {
      break;
    }

    following = state.input.charCodeAt(state.position + 1);

    if (!is_WS_OR_EOL(following)) {
      break;
    }

    detected = true;
    state.position++;

    if (skipSeparationSpace(state, true, -1)) {
      if (state.lineIndent <= nodeIndent) {
        _result.push(null);
        ch = state.input.charCodeAt(state.position);
        continue;
      }
    }

    _line = state.line;
    composeNode(state, nodeIndent, CONTEXT_BLOCK_IN, false, true);
    _result.push(state.result);
    skipSeparationSpace(state, true, -1);

    ch = state.input.charCodeAt(state.position);

    if ((state.line === _line || state.lineIndent > nodeIndent) && (ch !== 0)) {
      throwError(state, 'bad indentation of a sequence entry');
    } else if (state.lineIndent < nodeIndent) {
      break;
    }
  }

  if (detected) {
    state.tag = _tag;
    state.anchor = _anchor;
    state.kind = 'sequence';
    state.result = _result;
    return true;
  }
  return false;
}

function readBlockMapping(state, nodeIndent, flowIndent) {
  var following,
      allowCompact,
      _line,
      _keyLine,
      _keyLineStart,
      _keyPos,
      _tag          = state.tag,
      _anchor       = state.anchor,
      _result       = {},
      overridableKeys = Object.create(null),
      keyTag        = null,
      keyNode       = null,
      valueNode     = null,
      atExplicitKey = false,
      detected      = false,
      ch;

  // there is a leading tab before this token, so it can't be a block sequence/mapping;
  // it can still be flow sequence/mapping or a scalar
  if (state.firstTabInLine !== -1) return false;

  if (state.anchor !== null) {
    state.anchorMap[state.anchor] = _result;
  }

  ch = state.input.charCodeAt(state.position);

  while (ch !== 0) {
    if (!atExplicitKey && state.firstTabInLine !== -1) {
      state.position = state.firstTabInLine;
      throwError(state, 'tab characters must not be used in indentation');
    }

    following = state.input.charCodeAt(state.position + 1);
    _line = state.line; // Save the current line.

    //
    // Explicit notation case. There are two separate blocks:
    // first for the key (denoted by "?") and second for the value (denoted by ":")
    //
    if ((ch === 0x3F/* ? */ || ch === 0x3A/* : */) && is_WS_OR_EOL(following)) {

      if (ch === 0x3F/* ? */) {
        if (atExplicitKey) {
          storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
          keyTag = keyNode = valueNode = null;
        }

        detected = true;
        atExplicitKey = true;
        allowCompact = true;

      } else if (atExplicitKey) {
        // i.e. 0x3A/* : */ === character after the explicit key.
        atExplicitKey = false;
        allowCompact = true;

      } else {
        throwError(state, 'incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line');
      }

      state.position += 1;
      ch = following;

    //
    // Implicit notation case. Flow-style node as the key first, then ":", and the value.
    //
    } else {
      _keyLine = state.line;
      _keyLineStart = state.lineStart;
      _keyPos = state.position;

      if (!composeNode(state, flowIndent, CONTEXT_FLOW_OUT, false, true)) {
        // Neither implicit nor explicit notation.
        // Reading is done. Go to the epilogue.
        break;
      }

      if (state.line === _line) {
        ch = state.input.charCodeAt(state.position);

        while (is_WHITE_SPACE(ch)) {
          ch = state.input.charCodeAt(++state.position);
        }

        if (ch === 0x3A/* : */) {
          ch = state.input.charCodeAt(++state.position);

          if (!is_WS_OR_EOL(ch)) {
            throwError(state, 'a whitespace character is expected after the key-value separator within a block mapping');
          }

          if (atExplicitKey) {
            storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
            keyTag = keyNode = valueNode = null;
          }

          detected = true;
          atExplicitKey = false;
          allowCompact = false;
          keyTag = state.tag;
          keyNode = state.result;

        } else if (detected) {
          throwError(state, 'can not read an implicit mapping pair; a colon is missed');

        } else {
          state.tag = _tag;
          state.anchor = _anchor;
          return true; // Keep the result of `composeNode`.
        }

      } else if (detected) {
        throwError(state, 'can not read a block mapping entry; a multiline key may not be an implicit key');

      } else {
        state.tag = _tag;
        state.anchor = _anchor;
        return true; // Keep the result of `composeNode`.
      }
    }

    //
    // Common reading code for both explicit and implicit notations.
    //
    if (state.line === _line || state.lineIndent > nodeIndent) {
      if (atExplicitKey) {
        _keyLine = state.line;
        _keyLineStart = state.lineStart;
        _keyPos = state.position;
      }

      if (composeNode(state, nodeIndent, CONTEXT_BLOCK_OUT, true, allowCompact)) {
        if (atExplicitKey) {
          keyNode = state.result;
        } else {
          valueNode = state.result;
        }
      }

      if (!atExplicitKey) {
        storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, _keyLine, _keyLineStart, _keyPos);
        keyTag = keyNode = valueNode = null;
      }

      skipSeparationSpace(state, true, -1);
      ch = state.input.charCodeAt(state.position);
    }

    if ((state.line === _line || state.lineIndent > nodeIndent) && (ch !== 0)) {
      throwError(state, 'bad indentation of a mapping entry');
    } else if (state.lineIndent < nodeIndent) {
      break;
    }
  }

  //
  // Epilogue.
  //

  // Special case: last mapping's node contains only the key in explicit notation.
  if (atExplicitKey) {
    storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
  }

  // Expose the resulting mapping.
  if (detected) {
    state.tag = _tag;
    state.anchor = _anchor;
    state.kind = 'mapping';
    state.result = _result;
  }

  return detected;
}

function readTagProperty(state) {
  var _position,
      isVerbatim = false,
      isNamed    = false,
      tagHandle,
      tagName,
      ch;

  ch = state.input.charCodeAt(state.position);

  if (ch !== 0x21/* ! */) return false;

  if (state.tag !== null) {
    throwError(state, 'duplication of a tag property');
  }

  ch = state.input.charCodeAt(++state.position);

  if (ch === 0x3C/* < */) {
    isVerbatim = true;
    ch = state.input.charCodeAt(++state.position);

  } else if (ch === 0x21/* ! */) {
    isNamed = true;
    tagHandle = '!!';
    ch = state.input.charCodeAt(++state.position);

  } else {
    tagHandle = '!';
  }

  _position = state.position;

  if (isVerbatim) {
    do { ch = state.input.charCodeAt(++state.position); }
    while (ch !== 0 && ch !== 0x3E/* > */);

    if (state.position < state.length) {
      tagName = state.input.slice(_position, state.position);
      ch = state.input.charCodeAt(++state.position);
    } else {
      throwError(state, 'unexpected end of the stream within a verbatim tag');
    }
  } else {
    while (ch !== 0 && !is_WS_OR_EOL(ch)) {

      if (ch === 0x21/* ! */) {
        if (!isNamed) {
          tagHandle = state.input.slice(_position - 1, state.position + 1);

          if (!PATTERN_TAG_HANDLE.test(tagHandle)) {
            throwError(state, 'named tag handle cannot contain such characters');
          }

          isNamed = true;
          _position = state.position + 1;
        } else {
          throwError(state, 'tag suffix cannot contain exclamation marks');
        }
      }

      ch = state.input.charCodeAt(++state.position);
    }

    tagName = state.input.slice(_position, state.position);

    if (PATTERN_FLOW_INDICATORS.test(tagName)) {
      throwError(state, 'tag suffix cannot contain flow indicator characters');
    }
  }

  if (tagName && !PATTERN_TAG_URI.test(tagName)) {
    throwError(state, 'tag name cannot contain such characters: ' + tagName);
  }

  try {
    tagName = decodeURIComponent(tagName);
  } catch (err) {
    throwError(state, 'tag name is malformed: ' + tagName);
  }

  if (isVerbatim) {
    state.tag = tagName;

  } else if (_hasOwnProperty.call(state.tagMap, tagHandle)) {
    state.tag = state.tagMap[tagHandle] + tagName;

  } else if (tagHandle === '!') {
    state.tag = '!' + tagName;

  } else if (tagHandle === '!!') {
    state.tag = 'tag:yaml.org,2002:' + tagName;

  } else {
    throwError(state, 'undeclared tag handle "' + tagHandle + '"');
  }

  return true;
}

function readAnchorProperty(state) {
  var _position,
      ch;

  ch = state.input.charCodeAt(state.position);

  if (ch !== 0x26/* & */) return false;

  if (state.anchor !== null) {
    throwError(state, 'duplication of an anchor property');
  }

  ch = state.input.charCodeAt(++state.position);
  _position = state.position;

  while (ch !== 0 && !is_WS_OR_EOL(ch) && !is_FLOW_INDICATOR(ch)) {
    ch = state.input.charCodeAt(++state.position);
  }

  if (state.position === _position) {
    throwError(state, 'name of an anchor node must contain at least one character');
  }

  state.anchor = state.input.slice(_position, state.position);
  return true;
}

function readAlias(state) {
  var _position, alias,
      ch;

  ch = state.input.charCodeAt(state.position);

  if (ch !== 0x2A/* * */) return false;

  ch = state.input.charCodeAt(++state.position);
  _position = state.position;

  while (ch !== 0 && !is_WS_OR_EOL(ch) && !is_FLOW_INDICATOR(ch)) {
    ch = state.input.charCodeAt(++state.position);
  }

  if (state.position === _position) {
    throwError(state, 'name of an alias node must contain at least one character');
  }

  alias = state.input.slice(_position, state.position);

  if (!_hasOwnProperty.call(state.anchorMap, alias)) {
    throwError(state, 'unidentified alias "' + alias + '"');
  }

  state.result = state.anchorMap[alias];
  skipSeparationSpace(state, true, -1);
  return true;
}

function composeNode(state, parentIndent, nodeContext, allowToSeek, allowCompact) {
  var allowBlockStyles,
      allowBlockScalars,
      allowBlockCollections,
      indentStatus = 1, // 1: this>parent, 0: this=parent, -1: this<parent
      atNewLine  = false,
      hasContent = false,
      typeIndex,
      typeQuantity,
      typeList,
      type,
      flowIndent,
      blockIndent;

  if (state.listener !== null) {
    state.listener('open', state);
  }

  state.tag    = null;
  state.anchor = null;
  state.kind   = null;
  state.result = null;

  allowBlockStyles = allowBlockScalars = allowBlockCollections =
    CONTEXT_BLOCK_OUT === nodeContext ||
    CONTEXT_BLOCK_IN  === nodeContext;

  if (allowToSeek) {
    if (skipSeparationSpace(state, true, -1)) {
      atNewLine = true;

      if (state.lineIndent > parentIndent) {
        indentStatus = 1;
      } else if (state.lineIndent === parentIndent) {
        indentStatus = 0;
      } else if (state.lineIndent < parentIndent) {
        indentStatus = -1;
      }
    }
  }

  if (indentStatus === 1) {
    while (readTagProperty(state) || readAnchorProperty(state)) {
      if (skipSeparationSpace(state, true, -1)) {
        atNewLine = true;
        allowBlockCollections = allowBlockStyles;

        if (state.lineIndent > parentIndent) {
          indentStatus = 1;
        } else if (state.lineIndent === parentIndent) {
          indentStatus = 0;
        } else if (state.lineIndent < parentIndent) {
          indentStatus = -1;
        }
      } else {
        allowBlockCollections = false;
      }
    }
  }

  if (allowBlockCollections) {
    allowBlockCollections = atNewLine || allowCompact;
  }

  if (indentStatus === 1 || CONTEXT_BLOCK_OUT === nodeContext) {
    if (CONTEXT_FLOW_IN === nodeContext || CONTEXT_FLOW_OUT === nodeContext) {
      flowIndent = parentIndent;
    } else {
      flowIndent = parentIndent + 1;
    }

    blockIndent = state.position - state.lineStart;

    if (indentStatus === 1) {
      if (allowBlockCollections &&
          (readBlockSequence(state, blockIndent) ||
           readBlockMapping(state, blockIndent, flowIndent)) ||
          readFlowCollection(state, flowIndent)) {
        hasContent = true;
      } else {
        if ((allowBlockScalars && readBlockScalar(state, flowIndent)) ||
            readSingleQuotedScalar(state, flowIndent) ||
            readDoubleQuotedScalar(state, flowIndent)) {
          hasContent = true;

        } else if (readAlias(state)) {
          hasContent = true;

          if (state.tag !== null || state.anchor !== null) {
            throwError(state, 'alias node should not have any properties');
          }

        } else if (readPlainScalar(state, flowIndent, CONTEXT_FLOW_IN === nodeContext)) {
          hasContent = true;

          if (state.tag === null) {
            state.tag = '?';
          }
        }

        if (state.anchor !== null) {
          state.anchorMap[state.anchor] = state.result;
        }
      }
    } else if (indentStatus === 0) {
      // Special case: block sequences are allowed to have same indentation level as the parent.
      // http://www.yaml.org/spec/1.2/spec.html#id2799784
      hasContent = allowBlockCollections && readBlockSequence(state, blockIndent);
    }
  }

  if (state.tag === null) {
    if (state.anchor !== null) {
      state.anchorMap[state.anchor] = state.result;
    }

  } else if (state.tag === '?') {
    // Implicit resolving is not allowed for non-scalar types, and '?'
    // non-specific tag is only automatically assigned to plain scalars.
    //
    // We only need to check kind conformity in case user explicitly assigns '?'
    // tag, for example like this: "!<?> [0]"
    //
    if (state.result !== null && state.kind !== 'scalar') {
      throwError(state, 'unacceptable node kind for !<?> tag; it should be "scalar", not "' + state.kind + '"');
    }

    for (typeIndex = 0, typeQuantity = state.implicitTypes.length; typeIndex < typeQuantity; typeIndex += 1) {
      type = state.implicitTypes[typeIndex];

      if (type.resolve(state.result)) { // `state.result` updated in resolver if matched
        state.result = type.construct(state.result);
        state.tag = type.tag;
        if (state.anchor !== null) {
          state.anchorMap[state.anchor] = state.result;
        }
        break;
      }
    }
  } else if (state.tag !== '!') {
    if (_hasOwnProperty.call(state.typeMap[state.kind || 'fallback'], state.tag)) {
      type = state.typeMap[state.kind || 'fallback'][state.tag];
    } else {
      // looking for multi type
      type = null;
      typeList = state.typeMap.multi[state.kind || 'fallback'];

      for (typeIndex = 0, typeQuantity = typeList.length; typeIndex < typeQuantity; typeIndex += 1) {
        if (state.tag.slice(0, typeList[typeIndex].tag.length) === typeList[typeIndex].tag) {
          type = typeList[typeIndex];
          break;
        }
      }
    }

    if (!type) {
      throwError(state, 'unknown tag !<' + state.tag + '>');
    }

    if (state.result !== null && type.kind !== state.kind) {
      throwError(state, 'unacceptable node kind for !<' + state.tag + '> tag; it should be "' + type.kind + '", not "' + state.kind + '"');
    }

    if (!type.resolve(state.result, state.tag)) { // `state.result` updated in resolver if matched
      throwError(state, 'cannot resolve a node with !<' + state.tag + '> explicit tag');
    } else {
      state.result = type.construct(state.result, state.tag);
      if (state.anchor !== null) {
        state.anchorMap[state.anchor] = state.result;
      }
    }
  }

  if (state.listener !== null) {
    state.listener('close', state);
  }
  return state.tag !== null ||  state.anchor !== null || hasContent;
}

function readDocument(state) {
  var documentStart = state.position,
      _position,
      directiveName,
      directiveArgs,
      hasDirectives = false,
      ch;

  state.version = null;
  state.checkLineBreaks = state.legacy;
  state.tagMap = Object.create(null);
  state.anchorMap = Object.create(null);

  while ((ch = state.input.charCodeAt(state.position)) !== 0) {
    skipSeparationSpace(state, true, -1);

    ch = state.input.charCodeAt(state.position);

    if (state.lineIndent > 0 || ch !== 0x25/* % */) {
      break;
    }

    hasDirectives = true;
    ch = state.input.charCodeAt(++state.position);
    _position = state.position;

    while (ch !== 0 && !is_WS_OR_EOL(ch)) {
      ch = state.input.charCodeAt(++state.position);
    }

    directiveName = state.input.slice(_position, state.position);
    directiveArgs = [];

    if (directiveName.length < 1) {
      throwError(state, 'directive name must not be less than one character in length');
    }

    while (ch !== 0) {
      while (is_WHITE_SPACE(ch)) {
        ch = state.input.charCodeAt(++state.position);
      }

      if (ch === 0x23/* # */) {
        do { ch = state.input.charCodeAt(++state.position); }
        while (ch !== 0 && !is_EOL(ch));
        break;
      }

      if (is_EOL(ch)) break;

      _position = state.position;

      while (ch !== 0 && !is_WS_OR_EOL(ch)) {
        ch = state.input.charCodeAt(++state.position);
      }

      directiveArgs.push(state.input.slice(_position, state.position));
    }

    if (ch !== 0) readLineBreak(state);

    if (_hasOwnProperty.call(directiveHandlers, directiveName)) {
      directiveHandlers[directiveName](state, directiveName, directiveArgs);
    } else {
      throwWarning(state, 'unknown document directive "' + directiveName + '"');
    }
  }

  skipSeparationSpace(state, true, -1);

  if (state.lineIndent === 0 &&
      state.input.charCodeAt(state.position)     === 0x2D/* - */ &&
      state.input.charCodeAt(state.position + 1) === 0x2D/* - */ &&
      state.input.charCodeAt(state.position + 2) === 0x2D/* - */) {
    state.position += 3;
    skipSeparationSpace(state, true, -1);

  } else if (hasDirectives) {
    throwError(state, 'directives end mark is expected');
  }

  composeNode(state, state.lineIndent - 1, CONTEXT_BLOCK_OUT, false, true);
  skipSeparationSpace(state, true, -1);

  if (state.checkLineBreaks &&
      PATTERN_NON_ASCII_LINE_BREAKS.test(state.input.slice(documentStart, state.position))) {
    throwWarning(state, 'non-ASCII line breaks are interpreted as content');
  }

  state.documents.push(state.result);

  if (state.position === state.lineStart && testDocumentSeparator(state)) {

    if (state.input.charCodeAt(state.position) === 0x2E/* . */) {
      state.position += 3;
      skipSeparationSpace(state, true, -1);
    }
    return;
  }

  if (state.position < (state.length - 1)) {
    throwError(state, 'end of the stream or a document separator is expected');
  } else {
    return;
  }
}


function loadDocuments(input, options) {
  input = String(input);
  options = options || {};

  if (input.length !== 0) {

    // Add tailing `\n` if not exists
    if (input.charCodeAt(input.length - 1) !== 0x0A/* LF */ &&
        input.charCodeAt(input.length - 1) !== 0x0D/* CR */) {
      input += '\n';
    }

    // Strip BOM
    if (input.charCodeAt(0) === 0xFEFF) {
      input = input.slice(1);
    }
  }

  var state = new State(input, options);

  var nullpos = input.indexOf('\0');

  if (nullpos !== -1) {
    state.position = nullpos;
    throwError(state, 'null byte is not allowed in input');
  }

  // Use 0 as string terminator. That significantly simplifies bounds check.
  state.input += '\0';

  while (state.input.charCodeAt(state.position) === 0x20/* Space */) {
    state.lineIndent += 1;
    state.position += 1;
  }

  while (state.position < (state.length - 1)) {
    readDocument(state);
  }

  return state.documents;
}


function loadAll(input, iterator, options) {
  if (iterator !== null && typeof iterator === 'object' && typeof options === 'undefined') {
    options = iterator;
    iterator = null;
  }

  var documents = loadDocuments(input, options);

  if (typeof iterator !== 'function') {
    return documents;
  }

  for (var index = 0, length = documents.length; index < length; index += 1) {
    iterator(documents[index]);
  }
}


function load(input, options) {
  var documents = loadDocuments(input, options);

  if (documents.length === 0) {
    /*eslint-disable no-undefined*/
    return undefined;
  } else if (documents.length === 1) {
    return documents[0];
  }
  throw new YAMLException('expected a single document in the stream, but found more');
}


module.exports.loadAll = loadAll;
module.exports.load    = load;


/***/ }),

/***/ 2119:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


/*eslint-disable max-len*/

var YAMLException = __webpack_require__(1231);
var Type          = __webpack_require__(5388);


function compileList(schema, name) {
  var result = [];

  schema[name].forEach(function (currentType) {
    var newIndex = result.length;

    result.forEach(function (previousType, previousIndex) {
      if (previousType.tag === currentType.tag &&
          previousType.kind === currentType.kind &&
          previousType.multi === currentType.multi) {

        newIndex = previousIndex;
      }
    });

    result[newIndex] = currentType;
  });

  return result;
}


function compileMap(/* lists... */) {
  var result = {
        scalar: {},
        sequence: {},
        mapping: {},
        fallback: {},
        multi: {
          scalar: [],
          sequence: [],
          mapping: [],
          fallback: []
        }
      }, index, length;

  function collectType(type) {
    if (type.multi) {
      result.multi[type.kind].push(type);
      result.multi['fallback'].push(type);
    } else {
      result[type.kind][type.tag] = result['fallback'][type.tag] = type;
    }
  }

  for (index = 0, length = arguments.length; index < length; index += 1) {
    arguments[index].forEach(collectType);
  }
  return result;
}


function Schema(definition) {
  return this.extend(definition);
}


Schema.prototype.extend = function extend(definition) {
  var implicit = [];
  var explicit = [];

  if (definition instanceof Type) {
    // Schema.extend(type)
    explicit.push(definition);

  } else if (Array.isArray(definition)) {
    // Schema.extend([ type1, type2, ... ])
    explicit = explicit.concat(definition);

  } else if (definition && (Array.isArray(definition.implicit) || Array.isArray(definition.explicit))) {
    // Schema.extend({ explicit: [ type1, type2, ... ], implicit: [ type1, type2, ... ] })
    if (definition.implicit) implicit = implicit.concat(definition.implicit);
    if (definition.explicit) explicit = explicit.concat(definition.explicit);

  } else {
    throw new YAMLException('Schema.extend argument should be a Type, [ Type ], ' +
      'or a schema definition ({ implicit: [...], explicit: [...] })');
  }

  implicit.forEach(function (type) {
    if (!(type instanceof Type)) {
      throw new YAMLException('Specified list of YAML types (or a single Type object) contains a non-Type object.');
    }

    if (type.loadKind && type.loadKind !== 'scalar') {
      throw new YAMLException('There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.');
    }

    if (type.multi) {
      throw new YAMLException('There is a multi type in the implicit list of a schema. Multi tags can only be listed as explicit.');
    }
  });

  explicit.forEach(function (type) {
    if (!(type instanceof Type)) {
      throw new YAMLException('Specified list of YAML types (or a single Type object) contains a non-Type object.');
    }
  });

  var result = Object.create(Schema.prototype);

  result.implicit = (this.implicit || []).concat(implicit);
  result.explicit = (this.explicit || []).concat(explicit);

  result.compiledImplicit = compileList(result, 'implicit');
  result.compiledExplicit = compileList(result, 'explicit');
  result.compiledTypeMap  = compileMap(result.compiledImplicit, result.compiledExplicit);

  return result;
};


module.exports = Schema;


/***/ }),

/***/ 1769:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// Standard YAML's Core schema.
// http://www.yaml.org/spec/1.2/spec.html#id2804923
//
// NOTE: JS-YAML does not support schema-specific tag resolution restrictions.
// So, Core schema has no distinctions from JSON schema is JS-YAML.





module.exports = __webpack_require__(6184);


/***/ }),

/***/ 5489:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// JS-YAML's default schema for `safeLoad` function.
// It is not described in the YAML specification.
//
// This schema is based on standard YAML's Core schema and includes most of
// extra types described at YAML tag repository. (http://yaml.org/type/)





module.exports = (__webpack_require__(1769).extend)({
  implicit: [
    __webpack_require__(127),
    __webpack_require__(1851)
  ],
  explicit: [
    __webpack_require__(9342),
    __webpack_require__(6946),
    __webpack_require__(6942),
    __webpack_require__(6663)
  ]
});


/***/ }),

/***/ 7759:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// Standard YAML's Failsafe schema.
// http://www.yaml.org/spec/1.2/spec.html#id2802346





var Schema = __webpack_require__(2119);


module.exports = new Schema({
  explicit: [
    __webpack_require__(7212),
    __webpack_require__(8636),
    __webpack_require__(2369)
  ]
});


/***/ }),

/***/ 6184:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// Standard YAML's JSON schema.
// http://www.yaml.org/spec/1.2/spec.html#id2803231
//
// NOTE: JS-YAML does not support schema-specific tag resolution restrictions.
// So, this schema is not such strict as defined in the YAML specification.
// It allows numbers in binary notaion, use `Null` and `NULL` as `null`, etc.





module.exports = (__webpack_require__(7759).extend)({
  implicit: [
    __webpack_require__(9198),
    __webpack_require__(6199),
    __webpack_require__(4466),
    __webpack_require__(1461)
  ]
});


/***/ }),

/***/ 8083:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";



var common = __webpack_require__(8433);


// get snippet for a single line, respecting maxLength
function getLine(buffer, lineStart, lineEnd, position, maxLineLength) {
  var head = '';
  var tail = '';
  var maxHalfLength = Math.floor(maxLineLength / 2) - 1;

  if (position - lineStart > maxHalfLength) {
    head = ' ... ';
    lineStart = position - maxHalfLength + head.length;
  }

  if (lineEnd - position > maxHalfLength) {
    tail = ' ...';
    lineEnd = position + maxHalfLength - tail.length;
  }

  return {
    str: head + buffer.slice(lineStart, lineEnd).replace(/\t/g, '→') + tail,
    pos: position - lineStart + head.length // relative position
  };
}


function padStart(string, max) {
  return common.repeat(' ', max - string.length) + string;
}


function makeSnippet(mark, options) {
  options = Object.create(options || null);

  if (!mark.buffer) return null;

  if (!options.maxLength) options.maxLength = 79;
  if (typeof options.indent      !== 'number') options.indent      = 1;
  if (typeof options.linesBefore !== 'number') options.linesBefore = 3;
  if (typeof options.linesAfter  !== 'number') options.linesAfter  = 2;

  var re = /\r?\n|\r|\0/g;
  var lineStarts = [ 0 ];
  var lineEnds = [];
  var match;
  var foundLineNo = -1;

  while ((match = re.exec(mark.buffer))) {
    lineEnds.push(match.index);
    lineStarts.push(match.index + match[0].length);

    if (mark.position <= match.index && foundLineNo < 0) {
      foundLineNo = lineStarts.length - 2;
    }
  }

  if (foundLineNo < 0) foundLineNo = lineStarts.length - 1;

  var result = '', i, line;
  var lineNoLength = Math.min(mark.line + options.linesAfter, lineEnds.length).toString().length;
  var maxLineLength = options.maxLength - (options.indent + lineNoLength + 3);

  for (i = 1; i <= options.linesBefore; i++) {
    if (foundLineNo - i < 0) break;
    line = getLine(
      mark.buffer,
      lineStarts[foundLineNo - i],
      lineEnds[foundLineNo - i],
      mark.position - (lineStarts[foundLineNo] - lineStarts[foundLineNo - i]),
      maxLineLength
    );
    result = common.repeat(' ', options.indent) + padStart((mark.line - i + 1).toString(), lineNoLength) +
      ' | ' + line.str + '\n' + result;
  }

  line = getLine(mark.buffer, lineStarts[foundLineNo], lineEnds[foundLineNo], mark.position, maxLineLength);
  result += common.repeat(' ', options.indent) + padStart((mark.line + 1).toString(), lineNoLength) +
    ' | ' + line.str + '\n';
  result += common.repeat('-', options.indent + lineNoLength + 3 + line.pos) + '^' + '\n';

  for (i = 1; i <= options.linesAfter; i++) {
    if (foundLineNo + i >= lineEnds.length) break;
    line = getLine(
      mark.buffer,
      lineStarts[foundLineNo + i],
      lineEnds[foundLineNo + i],
      mark.position - (lineStarts[foundLineNo] - lineStarts[foundLineNo + i]),
      maxLineLength
    );
    result += common.repeat(' ', options.indent) + padStart((mark.line + i + 1).toString(), lineNoLength) +
      ' | ' + line.str + '\n';
  }

  return result.replace(/\n$/, '');
}


module.exports = makeSnippet;


/***/ }),

/***/ 5388:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var YAMLException = __webpack_require__(1231);

var TYPE_CONSTRUCTOR_OPTIONS = [
  'kind',
  'multi',
  'resolve',
  'construct',
  'instanceOf',
  'predicate',
  'represent',
  'representName',
  'defaultStyle',
  'styleAliases'
];

var YAML_NODE_KINDS = [
  'scalar',
  'sequence',
  'mapping'
];

function compileStyleAliases(map) {
  var result = {};

  if (map !== null) {
    Object.keys(map).forEach(function (style) {
      map[style].forEach(function (alias) {
        result[String(alias)] = style;
      });
    });
  }

  return result;
}

function Type(tag, options) {
  options = options || {};

  Object.keys(options).forEach(function (name) {
    if (TYPE_CONSTRUCTOR_OPTIONS.indexOf(name) === -1) {
      throw new YAMLException('Unknown option "' + name + '" is met in definition of "' + tag + '" YAML type.');
    }
  });

  // TODO: Add tag format check.
  this.options       = options; // keep original options in case user wants to extend this type later
  this.tag           = tag;
  this.kind          = options['kind']          || null;
  this.resolve       = options['resolve']       || function () { return true; };
  this.construct     = options['construct']     || function (data) { return data; };
  this.instanceOf    = options['instanceOf']    || null;
  this.predicate     = options['predicate']     || null;
  this.represent     = options['represent']     || null;
  this.representName = options['representName'] || null;
  this.defaultStyle  = options['defaultStyle']  || null;
  this.multi         = options['multi']         || false;
  this.styleAliases  = compileStyleAliases(options['styleAliases'] || null);

  if (YAML_NODE_KINDS.indexOf(this.kind) === -1) {
    throw new YAMLException('Unknown kind "' + this.kind + '" is specified for "' + tag + '" YAML type.');
  }
}

module.exports = Type;


/***/ }),

/***/ 9342:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


/*eslint-disable no-bitwise*/


var Type = __webpack_require__(5388);


// [ 64, 65, 66 ] -> [ padding, CR, LF ]
var BASE64_MAP = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=\n\r';


function resolveYamlBinary(data) {
  if (data === null) return false;

  var code, idx, bitlen = 0, max = data.length, map = BASE64_MAP;

  // Convert one by one.
  for (idx = 0; idx < max; idx++) {
    code = map.indexOf(data.charAt(idx));

    // Skip CR/LF
    if (code > 64) continue;

    // Fail on illegal characters
    if (code < 0) return false;

    bitlen += 6;
  }

  // If there are any bits left, source was corrupted
  return (bitlen % 8) === 0;
}

function constructYamlBinary(data) {
  var idx, tailbits,
      input = data.replace(/[\r\n=]/g, ''), // remove CR/LF & padding to simplify scan
      max = input.length,
      map = BASE64_MAP,
      bits = 0,
      result = [];

  // Collect by 6*4 bits (3 bytes)

  for (idx = 0; idx < max; idx++) {
    if ((idx % 4 === 0) && idx) {
      result.push((bits >> 16) & 0xFF);
      result.push((bits >> 8) & 0xFF);
      result.push(bits & 0xFF);
    }

    bits = (bits << 6) | map.indexOf(input.charAt(idx));
  }

  // Dump tail

  tailbits = (max % 4) * 6;

  if (tailbits === 0) {
    result.push((bits >> 16) & 0xFF);
    result.push((bits >> 8) & 0xFF);
    result.push(bits & 0xFF);
  } else if (tailbits === 18) {
    result.push((bits >> 10) & 0xFF);
    result.push((bits >> 2) & 0xFF);
  } else if (tailbits === 12) {
    result.push((bits >> 4) & 0xFF);
  }

  return new Uint8Array(result);
}

function representYamlBinary(object /*, style*/) {
  var result = '', bits = 0, idx, tail,
      max = object.length,
      map = BASE64_MAP;

  // Convert every three bytes to 4 ASCII characters.

  for (idx = 0; idx < max; idx++) {
    if ((idx % 3 === 0) && idx) {
      result += map[(bits >> 18) & 0x3F];
      result += map[(bits >> 12) & 0x3F];
      result += map[(bits >> 6) & 0x3F];
      result += map[bits & 0x3F];
    }

    bits = (bits << 8) + object[idx];
  }

  // Dump tail

  tail = max % 3;

  if (tail === 0) {
    result += map[(bits >> 18) & 0x3F];
    result += map[(bits >> 12) & 0x3F];
    result += map[(bits >> 6) & 0x3F];
    result += map[bits & 0x3F];
  } else if (tail === 2) {
    result += map[(bits >> 10) & 0x3F];
    result += map[(bits >> 4) & 0x3F];
    result += map[(bits << 2) & 0x3F];
    result += map[64];
  } else if (tail === 1) {
    result += map[(bits >> 2) & 0x3F];
    result += map[(bits << 4) & 0x3F];
    result += map[64];
    result += map[64];
  }

  return result;
}

function isBinary(obj) {
  return Object.prototype.toString.call(obj) ===  '[object Uint8Array]';
}

module.exports = new Type('tag:yaml.org,2002:binary', {
  kind: 'scalar',
  resolve: resolveYamlBinary,
  construct: constructYamlBinary,
  predicate: isBinary,
  represent: representYamlBinary
});


/***/ }),

/***/ 6199:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var Type = __webpack_require__(5388);

function resolveYamlBoolean(data) {
  if (data === null) return false;

  var max = data.length;

  return (max === 4 && (data === 'true' || data === 'True' || data === 'TRUE')) ||
         (max === 5 && (data === 'false' || data === 'False' || data === 'FALSE'));
}

function constructYamlBoolean(data) {
  return data === 'true' ||
         data === 'True' ||
         data === 'TRUE';
}

function isBoolean(object) {
  return Object.prototype.toString.call(object) === '[object Boolean]';
}

module.exports = new Type('tag:yaml.org,2002:bool', {
  kind: 'scalar',
  resolve: resolveYamlBoolean,
  construct: constructYamlBoolean,
  predicate: isBoolean,
  represent: {
    lowercase: function (object) { return object ? 'true' : 'false'; },
    uppercase: function (object) { return object ? 'TRUE' : 'FALSE'; },
    camelcase: function (object) { return object ? 'True' : 'False'; }
  },
  defaultStyle: 'lowercase'
});


/***/ }),

/***/ 1461:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var common = __webpack_require__(8433);
var Type   = __webpack_require__(5388);

var YAML_FLOAT_PATTERN = new RegExp(
  // 2.5e4, 2.5 and integers
  '^(?:[-+]?(?:[0-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?' +
  // .2e4, .2
  // special case, seems not from spec
  '|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?' +
  // .inf
  '|[-+]?\\.(?:inf|Inf|INF)' +
  // .nan
  '|\\.(?:nan|NaN|NAN))$');

function resolveYamlFloat(data) {
  if (data === null) return false;

  if (!YAML_FLOAT_PATTERN.test(data) ||
      // Quick hack to not allow integers end with `_`
      // Probably should update regexp & check speed
      data[data.length - 1] === '_') {
    return false;
  }

  return true;
}

function constructYamlFloat(data) {
  var value, sign;

  value  = data.replace(/_/g, '').toLowerCase();
  sign   = value[0] === '-' ? -1 : 1;

  if ('+-'.indexOf(value[0]) >= 0) {
    value = value.slice(1);
  }

  if (value === '.inf') {
    return (sign === 1) ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;

  } else if (value === '.nan') {
    return NaN;
  }
  return sign * parseFloat(value, 10);
}


var SCIENTIFIC_WITHOUT_DOT = /^[-+]?[0-9]+e/;

function representYamlFloat(object, style) {
  var res;

  if (isNaN(object)) {
    switch (style) {
      case 'lowercase': return '.nan';
      case 'uppercase': return '.NAN';
      case 'camelcase': return '.NaN';
    }
  } else if (Number.POSITIVE_INFINITY === object) {
    switch (style) {
      case 'lowercase': return '.inf';
      case 'uppercase': return '.INF';
      case 'camelcase': return '.Inf';
    }
  } else if (Number.NEGATIVE_INFINITY === object) {
    switch (style) {
      case 'lowercase': return '-.inf';
      case 'uppercase': return '-.INF';
      case 'camelcase': return '-.Inf';
    }
  } else if (common.isNegativeZero(object)) {
    return '-0.0';
  }

  res = object.toString(10);

  // JS stringifier can build scientific format without dots: 5e-100,
  // while YAML requres dot: 5.e-100. Fix it with simple hack

  return SCIENTIFIC_WITHOUT_DOT.test(res) ? res.replace('e', '.e') : res;
}

function isFloat(object) {
  return (Object.prototype.toString.call(object) === '[object Number]') &&
         (object % 1 !== 0 || common.isNegativeZero(object));
}

module.exports = new Type('tag:yaml.org,2002:float', {
  kind: 'scalar',
  resolve: resolveYamlFloat,
  construct: constructYamlFloat,
  predicate: isFloat,
  represent: representYamlFloat,
  defaultStyle: 'lowercase'
});


/***/ }),

/***/ 4466:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var common = __webpack_require__(8433);
var Type   = __webpack_require__(5388);

function isHexCode(c) {
  return ((0x30/* 0 */ <= c) && (c <= 0x39/* 9 */)) ||
         ((0x41/* A */ <= c) && (c <= 0x46/* F */)) ||
         ((0x61/* a */ <= c) && (c <= 0x66/* f */));
}

function isOctCode(c) {
  return ((0x30/* 0 */ <= c) && (c <= 0x37/* 7 */));
}

function isDecCode(c) {
  return ((0x30/* 0 */ <= c) && (c <= 0x39/* 9 */));
}

function resolveYamlInteger(data) {
  if (data === null) return false;

  var max = data.length,
      index = 0,
      hasDigits = false,
      ch;

  if (!max) return false;

  ch = data[index];

  // sign
  if (ch === '-' || ch === '+') {
    ch = data[++index];
  }

  if (ch === '0') {
    // 0
    if (index + 1 === max) return true;
    ch = data[++index];

    // base 2, base 8, base 16

    if (ch === 'b') {
      // base 2
      index++;

      for (; index < max; index++) {
        ch = data[index];
        if (ch === '_') continue;
        if (ch !== '0' && ch !== '1') return false;
        hasDigits = true;
      }
      return hasDigits && ch !== '_';
    }


    if (ch === 'x') {
      // base 16
      index++;

      for (; index < max; index++) {
        ch = data[index];
        if (ch === '_') continue;
        if (!isHexCode(data.charCodeAt(index))) return false;
        hasDigits = true;
      }
      return hasDigits && ch !== '_';
    }


    if (ch === 'o') {
      // base 8
      index++;

      for (; index < max; index++) {
        ch = data[index];
        if (ch === '_') continue;
        if (!isOctCode(data.charCodeAt(index))) return false;
        hasDigits = true;
      }
      return hasDigits && ch !== '_';
    }
  }

  // base 10 (except 0)

  // value should not start with `_`;
  if (ch === '_') return false;

  for (; index < max; index++) {
    ch = data[index];
    if (ch === '_') continue;
    if (!isDecCode(data.charCodeAt(index))) {
      return false;
    }
    hasDigits = true;
  }

  // Should have digits and should not end with `_`
  if (!hasDigits || ch === '_') return false;

  return true;
}

function constructYamlInteger(data) {
  var value = data, sign = 1, ch;

  if (value.indexOf('_') !== -1) {
    value = value.replace(/_/g, '');
  }

  ch = value[0];

  if (ch === '-' || ch === '+') {
    if (ch === '-') sign = -1;
    value = value.slice(1);
    ch = value[0];
  }

  if (value === '0') return 0;

  if (ch === '0') {
    if (value[1] === 'b') return sign * parseInt(value.slice(2), 2);
    if (value[1] === 'x') return sign * parseInt(value.slice(2), 16);
    if (value[1] === 'o') return sign * parseInt(value.slice(2), 8);
  }

  return sign * parseInt(value, 10);
}

function isInteger(object) {
  return (Object.prototype.toString.call(object)) === '[object Number]' &&
         (object % 1 === 0 && !common.isNegativeZero(object));
}

module.exports = new Type('tag:yaml.org,2002:int', {
  kind: 'scalar',
  resolve: resolveYamlInteger,
  construct: constructYamlInteger,
  predicate: isInteger,
  represent: {
    binary:      function (obj) { return obj >= 0 ? '0b' + obj.toString(2) : '-0b' + obj.toString(2).slice(1); },
    octal:       function (obj) { return obj >= 0 ? '0o'  + obj.toString(8) : '-0o'  + obj.toString(8).slice(1); },
    decimal:     function (obj) { return obj.toString(10); },
    /* eslint-disable max-len */
    hexadecimal: function (obj) { return obj >= 0 ? '0x' + obj.toString(16).toUpperCase() :  '-0x' + obj.toString(16).toUpperCase().slice(1); }
  },
  defaultStyle: 'decimal',
  styleAliases: {
    binary:      [ 2,  'bin' ],
    octal:       [ 8,  'oct' ],
    decimal:     [ 10, 'dec' ],
    hexadecimal: [ 16, 'hex' ]
  }
});


/***/ }),

/***/ 2369:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var Type = __webpack_require__(5388);

module.exports = new Type('tag:yaml.org,2002:map', {
  kind: 'mapping',
  construct: function (data) { return data !== null ? data : {}; }
});


/***/ }),

/***/ 1851:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var Type = __webpack_require__(5388);

function resolveYamlMerge(data) {
  return data === '<<' || data === null;
}

module.exports = new Type('tag:yaml.org,2002:merge', {
  kind: 'scalar',
  resolve: resolveYamlMerge
});


/***/ }),

/***/ 9198:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var Type = __webpack_require__(5388);

function resolveYamlNull(data) {
  if (data === null) return true;

  var max = data.length;

  return (max === 1 && data === '~') ||
         (max === 4 && (data === 'null' || data === 'Null' || data === 'NULL'));
}

function constructYamlNull() {
  return null;
}

function isNull(object) {
  return object === null;
}

module.exports = new Type('tag:yaml.org,2002:null', {
  kind: 'scalar',
  resolve: resolveYamlNull,
  construct: constructYamlNull,
  predicate: isNull,
  represent: {
    canonical: function () { return '~';    },
    lowercase: function () { return 'null'; },
    uppercase: function () { return 'NULL'; },
    camelcase: function () { return 'Null'; },
    empty:     function () { return '';     }
  },
  defaultStyle: 'lowercase'
});


/***/ }),

/***/ 6946:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var Type = __webpack_require__(5388);

var _hasOwnProperty = Object.prototype.hasOwnProperty;
var _toString       = Object.prototype.toString;

function resolveYamlOmap(data) {
  if (data === null) return true;

  var objectKeys = [], index, length, pair, pairKey, pairHasKey,
      object = data;

  for (index = 0, length = object.length; index < length; index += 1) {
    pair = object[index];
    pairHasKey = false;

    if (_toString.call(pair) !== '[object Object]') return false;

    for (pairKey in pair) {
      if (_hasOwnProperty.call(pair, pairKey)) {
        if (!pairHasKey) pairHasKey = true;
        else return false;
      }
    }

    if (!pairHasKey) return false;

    if (objectKeys.indexOf(pairKey) === -1) objectKeys.push(pairKey);
    else return false;
  }

  return true;
}

function constructYamlOmap(data) {
  return data !== null ? data : [];
}

module.exports = new Type('tag:yaml.org,2002:omap', {
  kind: 'sequence',
  resolve: resolveYamlOmap,
  construct: constructYamlOmap
});


/***/ }),

/***/ 6942:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var Type = __webpack_require__(5388);

var _toString = Object.prototype.toString;

function resolveYamlPairs(data) {
  if (data === null) return true;

  var index, length, pair, keys, result,
      object = data;

  result = new Array(object.length);

  for (index = 0, length = object.length; index < length; index += 1) {
    pair = object[index];

    if (_toString.call(pair) !== '[object Object]') return false;

    keys = Object.keys(pair);

    if (keys.length !== 1) return false;

    result[index] = [ keys[0], pair[keys[0]] ];
  }

  return true;
}

function constructYamlPairs(data) {
  if (data === null) return [];

  var index, length, pair, keys, result,
      object = data;

  result = new Array(object.length);

  for (index = 0, length = object.length; index < length; index += 1) {
    pair = object[index];

    keys = Object.keys(pair);

    result[index] = [ keys[0], pair[keys[0]] ];
  }

  return result;
}

module.exports = new Type('tag:yaml.org,2002:pairs', {
  kind: 'sequence',
  resolve: resolveYamlPairs,
  construct: constructYamlPairs
});


/***/ }),

/***/ 8636:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var Type = __webpack_require__(5388);

module.exports = new Type('tag:yaml.org,2002:seq', {
  kind: 'sequence',
  construct: function (data) { return data !== null ? data : []; }
});


/***/ }),

/***/ 6663:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var Type = __webpack_require__(5388);

var _hasOwnProperty = Object.prototype.hasOwnProperty;

function resolveYamlSet(data) {
  if (data === null) return true;

  var key, object = data;

  for (key in object) {
    if (_hasOwnProperty.call(object, key)) {
      if (object[key] !== null) return false;
    }
  }

  return true;
}

function constructYamlSet(data) {
  return data !== null ? data : {};
}

module.exports = new Type('tag:yaml.org,2002:set', {
  kind: 'mapping',
  resolve: resolveYamlSet,
  construct: constructYamlSet
});


/***/ }),

/***/ 7212:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var Type = __webpack_require__(5388);

module.exports = new Type('tag:yaml.org,2002:str', {
  kind: 'scalar',
  construct: function (data) { return data !== null ? data : ''; }
});


/***/ }),

/***/ 127:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var Type = __webpack_require__(5388);

var YAML_DATE_REGEXP = new RegExp(
  '^([0-9][0-9][0-9][0-9])'          + // [1] year
  '-([0-9][0-9])'                    + // [2] month
  '-([0-9][0-9])$');                   // [3] day

var YAML_TIMESTAMP_REGEXP = new RegExp(
  '^([0-9][0-9][0-9][0-9])'          + // [1] year
  '-([0-9][0-9]?)'                   + // [2] month
  '-([0-9][0-9]?)'                   + // [3] day
  '(?:[Tt]|[ \\t]+)'                 + // ...
  '([0-9][0-9]?)'                    + // [4] hour
  ':([0-9][0-9])'                    + // [5] minute
  ':([0-9][0-9])'                    + // [6] second
  '(?:\\.([0-9]*))?'                 + // [7] fraction
  '(?:[ \\t]*(Z|([-+])([0-9][0-9]?)' + // [8] tz [9] tz_sign [10] tz_hour
  '(?::([0-9][0-9]))?))?$');           // [11] tz_minute

function resolveYamlTimestamp(data) {
  if (data === null) return false;
  if (YAML_DATE_REGEXP.exec(data) !== null) return true;
  if (YAML_TIMESTAMP_REGEXP.exec(data) !== null) return true;
  return false;
}

function constructYamlTimestamp(data) {
  var match, year, month, day, hour, minute, second, fraction = 0,
      delta = null, tz_hour, tz_minute, date;

  match = YAML_DATE_REGEXP.exec(data);
  if (match === null) match = YAML_TIMESTAMP_REGEXP.exec(data);

  if (match === null) throw new Error('Date resolve error');

  // match: [1] year [2] month [3] day

  year = +(match[1]);
  month = +(match[2]) - 1; // JS month starts with 0
  day = +(match[3]);

  if (!match[4]) { // no hour
    return new Date(Date.UTC(year, month, day));
  }

  // match: [4] hour [5] minute [6] second [7] fraction

  hour = +(match[4]);
  minute = +(match[5]);
  second = +(match[6]);

  if (match[7]) {
    fraction = match[7].slice(0, 3);
    while (fraction.length < 3) { // milli-seconds
      fraction += '0';
    }
    fraction = +fraction;
  }

  // match: [8] tz [9] tz_sign [10] tz_hour [11] tz_minute

  if (match[9]) {
    tz_hour = +(match[10]);
    tz_minute = +(match[11] || 0);
    delta = (tz_hour * 60 + tz_minute) * 60000; // delta in mili-seconds
    if (match[9] === '-') delta = -delta;
  }

  date = new Date(Date.UTC(year, month, day, hour, minute, second, fraction));

  if (delta) date.setTime(date.getTime() - delta);

  return date;
}

function representYamlTimestamp(object /*, style*/) {
  return object.toISOString();
}

module.exports = new Type('tag:yaml.org,2002:timestamp', {
  kind: 'scalar',
  resolve: resolveYamlTimestamp,
  construct: constructYamlTimestamp,
  instanceOf: Date,
  represent: representYamlTimestamp
});


/***/ }),

/***/ 3194:
/***/ (function(module, exports) {

/**
 * lite-url - Small, JS lib that uses regex for parsing a URL into it's component parts.
 * @version v1.0.5
 * @link https://github.com/sadams/lite-url
 * @license BSD-3-Clause
 */
(function(){"use strict";function r(r,n,t){var e=r.split(n),o=e.shift();return t(o,e.join(n))}function n(n){var t={hash:"",host:"",hostname:"",origin:"",pathname:"",protocol:"",search:"",password:"",username:"",port:""};return r(n,"#",function(n,e){e&&(t.hash=e?"#"+e:""),r(n,"?",function(n,e){e&&(t.search="?"+e),n&&r(n,"//",function(n,e){t.protocol=n,r(e,"/",function(n,e){t.pathname="/"+(e||""),(t.protocol||n)&&(t.origin=t.protocol+"//"+n),r(n,"@",function(n,e){if(e){var o=n.split(":");t.username=o[0],t.password=o[1]}else e=n;t.host=e,r(e,":",function(r,n){t.hostname=r,n&&(t.port=n)})})})})})}),t.href=t.origin+t.pathname+t.search+t.hash,t}function t(r){var n={},t=r.search;if(t){t=t.replace(new RegExp("\\?"),"");var e=t.split("&");for(var o in e)if(e.hasOwnProperty(o)&&e[o]){var i=e[o].split("=");n[i[0]]=i[1]}}return n}function e(r){var e=i[r];return"undefined"!=typeof e?e:(e=n(r),e.params=t(e),i[r]=e,e)}var o=this,i={};return e.changeQueryParser=function(r){t=r}, true?( true&&module.exports&&(exports=module.exports=e),exports.liteURL=e):0,e}).call(this);


/***/ }),

/***/ 6863:
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
 * Copyright 2015 Tim Down.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


(function(factory,root){if(true){!(__WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
		__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
		(__WEBPACK_AMD_DEFINE_FACTORY__.call(exports, __webpack_require__, exports, module)) :
		__WEBPACK_AMD_DEFINE_FACTORY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));}else {}})(function(){if(!Array.prototype.push){Array.prototype.push=function(){for(var i=0,len=arguments.length;i<len;i++){this[this.length]=arguments[i];}
return this.length;};}
if(!Array.prototype.shift){Array.prototype.shift=function(){if(this.length>0){var firstItem=this[0];for(var i=0,len=this.length-1;i<len;i++){this[i]=this[i+1];}
this.length=this.length-1;return firstItem;}};}
if(!Array.prototype.splice){Array.prototype.splice=function(startIndex,deleteCount){var itemsAfterDeleted=this.slice(startIndex+deleteCount);var itemsDeleted=this.slice(startIndex,startIndex+deleteCount);this.length=startIndex;var argumentsArray=[];for(var i=0,len=arguments.length;i<len;i++){argumentsArray[i]=arguments[i];}
var itemsToAppend=(argumentsArray.length>2)?itemsAfterDeleted=argumentsArray.slice(2).concat(itemsAfterDeleted):itemsAfterDeleted;for(i=0,len=itemsToAppend.length;i<len;i++){this.push(itemsToAppend[i]);}
return itemsDeleted;};}
function isUndefined(obj){return typeof obj=="undefined";}
function EventSupport(){}
EventSupport.prototype={eventTypes:[],eventListeners:{},setEventTypes:function(eventTypesParam){if(eventTypesParam instanceof Array){this.eventTypes=eventTypesParam;this.eventListeners={};for(var i=0,len=this.eventTypes.length;i<len;i++){this.eventListeners[this.eventTypes[i]]=[];}}else{handleError("log4javascript.EventSupport ["+this+"]: setEventTypes: eventTypes parameter must be an Array");}},addEventListener:function(eventType,listener){if(typeof listener=="function"){if(!array_contains(this.eventTypes,eventType)){handleError("log4javascript.EventSupport ["+this+"]: addEventListener: no event called '"+eventType+"'");}
this.eventListeners[eventType].push(listener);}else{handleError("log4javascript.EventSupport ["+this+"]: addEventListener: listener must be a function");}},removeEventListener:function(eventType,listener){if(typeof listener=="function"){if(!array_contains(this.eventTypes,eventType)){handleError("log4javascript.EventSupport ["+this+"]: removeEventListener: no event called '"+eventType+"'");}
array_remove(this.eventListeners[eventType],listener);}else{handleError("log4javascript.EventSupport ["+this+"]: removeEventListener: listener must be a function");}},dispatchEvent:function(eventType,eventArgs){if(array_contains(this.eventTypes,eventType)){var listeners=this.eventListeners[eventType];for(var i=0,len=listeners.length;i<len;i++){listeners[i](this,eventType,eventArgs);}}else{handleError("log4javascript.EventSupport ["+this+"]: dispatchEvent: no event called '"+eventType+"'");}}};var applicationStartDate=new Date();var uniqueId="log4javascript_"+applicationStartDate.getTime()+"_"+
Math.floor(Math.random()*100000000);var emptyFunction=function(){};var newLine="\r\n";var pageLoaded=false;function Log4JavaScript(){}
Log4JavaScript.prototype=new EventSupport();var log4javascript=new Log4JavaScript();log4javascript.version="1.4.13";log4javascript.edition="log4javascript";function toStr(obj){if(obj&&obj.toString){return obj.toString();}else{return String(obj);}}
function getExceptionMessage(ex){if(ex.message){return ex.message;}else if(ex.description){return ex.description;}else{return toStr(ex);}}
function getUrlFileName(url){var lastSlashIndex=Math.max(url.lastIndexOf("/"),url.lastIndexOf("\\"));return url.substr(lastSlashIndex+1);}
function getExceptionStringRep(ex){if(ex){var exStr="Exception: "+getExceptionMessage(ex);try{if(ex.lineNumber){exStr+=" on line number "+ex.lineNumber;}
if(ex.fileName){exStr+=" in file "+getUrlFileName(ex.fileName);}}catch(localEx){logLog.warn("Unable to obtain file and line information for error");}
if(showStackTraces&&ex.stack){exStr+=newLine+"Stack trace:"+newLine+ex.stack;}
return exStr;}
return null;}
function bool(obj){return Boolean(obj);}
function trim(str){return str.replace(/^\s+/,"").replace(/\s+$/,"");}
function splitIntoLines(text){var text2=text.replace(/\r\n/g,"\n").replace(/\r/g,"\n");return text2.split("\n");}
var urlEncode=(typeof window.encodeURIComponent!="undefined")?function(str){return encodeURIComponent(str);}:function(str){return escape(str).replace(/\+/g,"%2B").replace(/"/g,"%22").replace(/'/g,"%27").replace(/\//g,"%2F").replace(/=/g,"%3D");};function array_remove(arr,val){var index=-1;for(var i=0,len=arr.length;i<len;i++){if(arr[i]===val){index=i;break;}}
if(index>=0){arr.splice(index,1);return true;}else{return false;}}
function array_contains(arr,val){for(var i=0,len=arr.length;i<len;i++){if(arr[i]==val){return true;}}
return false;}
function extractBooleanFromParam(param,defaultValue){if(isUndefined(param)){return defaultValue;}else{return bool(param);}}
function extractStringFromParam(param,defaultValue){if(isUndefined(param)){return defaultValue;}else{return String(param);}}
function extractIntFromParam(param,defaultValue){if(isUndefined(param)){return defaultValue;}else{try{var value=parseInt(param,10);return isNaN(value)?defaultValue:value;}catch(ex){logLog.warn("Invalid int param "+param,ex);return defaultValue;}}}
function extractFunctionFromParam(param,defaultValue){if(typeof param=="function"){return param;}else{return defaultValue;}}
function isError(err){return(err instanceof Error);}
if(!Function.prototype.apply){Function.prototype.apply=function(obj,args){var methodName="__apply__";if(typeof obj[methodName]!="undefined"){methodName+=String(Math.random()).substr(2);}
obj[methodName]=this;var argsStrings=[];for(var i=0,len=args.length;i<len;i++){argsStrings[i]="args["+i+"]";}
var script="obj."+methodName+"("+argsStrings.join(",")+")";var returnValue=eval(script);delete obj[methodName];return returnValue;};}
if(!Function.prototype.call){Function.prototype.call=function(obj){var args=[];for(var i=1,len=arguments.length;i<len;i++){args[i-1]=arguments[i];}
return this.apply(obj,args);};}
var logLog={quietMode:false,debugMessages:[],setQuietMode:function(quietMode){this.quietMode=bool(quietMode);},numberOfErrors:0,alertAllErrors:false,setAlertAllErrors:function(alertAllErrors){this.alertAllErrors=alertAllErrors;},debug:function(message){this.debugMessages.push(message);},displayDebug:function(){alert(this.debugMessages.join(newLine));},warn:function(message,exception){},error:function(message,exception){if(++this.numberOfErrors==1||this.alertAllErrors){if(!this.quietMode){var alertMessage="log4javascript error: "+message;if(exception){alertMessage+=newLine+newLine+"Original error: "+getExceptionStringRep(exception);}
alert(alertMessage);}}}};log4javascript.logLog=logLog;log4javascript.setEventTypes(["load","error"]);function handleError(message,exception){logLog.error(message,exception);log4javascript.dispatchEvent("error",{"message":message,"exception":exception});}
log4javascript.handleError=handleError;var enabled=!((typeof log4javascript_disabled!="undefined")&&log4javascript_disabled);log4javascript.setEnabled=function(enable){enabled=bool(enable);};log4javascript.isEnabled=function(){return enabled;};var useTimeStampsInMilliseconds=true;log4javascript.setTimeStampsInMilliseconds=function(timeStampsInMilliseconds){useTimeStampsInMilliseconds=bool(timeStampsInMilliseconds);};log4javascript.isTimeStampsInMilliseconds=function(){return useTimeStampsInMilliseconds;};log4javascript.evalInScope=function(expr){return eval(expr);};var showStackTraces=false;log4javascript.setShowStackTraces=function(show){showStackTraces=bool(show);};var Level=function(level,name){this.level=level;this.name=name;};Level.prototype={toString:function(){return this.name;},equals:function(level){return this.level==level.level;},isGreaterOrEqual:function(level){return this.level>=level.level;}};Level.ALL=new Level(Number.MIN_VALUE,"ALL");Level.TRACE=new Level(10000,"TRACE");Level.DEBUG=new Level(20000,"DEBUG");Level.INFO=new Level(30000,"INFO");Level.WARN=new Level(40000,"WARN");Level.ERROR=new Level(50000,"ERROR");Level.FATAL=new Level(60000,"FATAL");Level.OFF=new Level(Number.MAX_VALUE,"OFF");log4javascript.Level=Level;function Timer(name,level){this.name=name;this.level=isUndefined(level)?Level.INFO:level;this.start=new Date();}
Timer.prototype.getElapsedTime=function(){return new Date().getTime()-this.start.getTime();};var anonymousLoggerName="[anonymous]";var defaultLoggerName="[default]";var nullLoggerName="[null]";var rootLoggerName="root";function Logger(name){this.name=name;this.parent=null;this.children=[];var appenders=[];var loggerLevel=null;var isRoot=(this.name===rootLoggerName);var isNull=(this.name===nullLoggerName);var appenderCache=null;var appenderCacheInvalidated=false;this.addChild=function(childLogger){this.children.push(childLogger);childLogger.parent=this;childLogger.invalidateAppenderCache();};var additive=true;this.getAdditivity=function(){return additive;};this.setAdditivity=function(additivity){var valueChanged=(additive!=additivity);additive=additivity;if(valueChanged){this.invalidateAppenderCache();}};this.addAppender=function(appender){if(isNull){handleError("Logger.addAppender: you may not add an appender to the null logger");}else{if(appender instanceof log4javascript.Appender){if(!array_contains(appenders,appender)){appenders.push(appender);appender.setAddedToLogger(this);this.invalidateAppenderCache();}}else{handleError("Logger.addAppender: appender supplied ('"+
toStr(appender)+"') is not a subclass of Appender");}}};this.removeAppender=function(appender){array_remove(appenders,appender);appender.setRemovedFromLogger(this);this.invalidateAppenderCache();};this.removeAllAppenders=function(){var appenderCount=appenders.length;if(appenderCount>0){for(var i=0;i<appenderCount;i++){appenders[i].setRemovedFromLogger(this);}
appenders.length=0;this.invalidateAppenderCache();}};this.getEffectiveAppenders=function(){if(appenderCache===null||appenderCacheInvalidated){var parentEffectiveAppenders=(isRoot||!this.getAdditivity())?[]:this.parent.getEffectiveAppenders();appenderCache=parentEffectiveAppenders.concat(appenders);appenderCacheInvalidated=false;}
return appenderCache;};this.invalidateAppenderCache=function(){appenderCacheInvalidated=true;for(var i=0,len=this.children.length;i<len;i++){this.children[i].invalidateAppenderCache();}};this.log=function(level,params){if(enabled&&level.isGreaterOrEqual(this.getEffectiveLevel())){var exception;var finalParamIndex=params.length-1;var lastParam=params[finalParamIndex];if(params.length>1&&isError(lastParam)){exception=lastParam;finalParamIndex--;}
var messages=[];for(var i=0;i<=finalParamIndex;i++){messages[i]=params[i];}
var loggingEvent=new LoggingEvent(this,new Date(),level,messages,exception);this.callAppenders(loggingEvent);}};this.callAppenders=function(loggingEvent){var effectiveAppenders=this.getEffectiveAppenders();for(var i=0,len=effectiveAppenders.length;i<len;i++){effectiveAppenders[i].doAppend(loggingEvent);}};this.setLevel=function(level){if(isRoot&&level===null){handleError("Logger.setLevel: you cannot set the level of the root logger to null");}else if(level instanceof Level){loggerLevel=level;}else{handleError("Logger.setLevel: level supplied to logger "+
this.name+" is not an instance of log4javascript.Level");}};this.getLevel=function(){return loggerLevel;};this.getEffectiveLevel=function(){for(var logger=this;logger!==null;logger=logger.parent){var level=logger.getLevel();if(level!==null){return level;}}};this.group=function(name,initiallyExpanded){if(enabled){var effectiveAppenders=this.getEffectiveAppenders();for(var i=0,len=effectiveAppenders.length;i<len;i++){effectiveAppenders[i].group(name,initiallyExpanded);}}};this.groupEnd=function(){if(enabled){var effectiveAppenders=this.getEffectiveAppenders();for(var i=0,len=effectiveAppenders.length;i<len;i++){effectiveAppenders[i].groupEnd();}}};var timers={};this.time=function(name,level){if(enabled){if(isUndefined(name)){handleError("Logger.time: a name for the timer must be supplied");}else if(level&&!(level instanceof Level)){handleError("Logger.time: level supplied to timer "+
name+" is not an instance of log4javascript.Level");}else{timers[name]=new Timer(name,level);}}};this.timeEnd=function(name){if(enabled){if(isUndefined(name)){handleError("Logger.timeEnd: a name for the timer must be supplied");}else if(timers[name]){var timer=timers[name];var milliseconds=timer.getElapsedTime();this.log(timer.level,["Timer "+toStr(name)+" completed in "+milliseconds+"ms"]);delete timers[name];}else{logLog.warn("Logger.timeEnd: no timer found with name "+name);}}};this.assert=function(expr){if(enabled&&!expr){var args=[];for(var i=1,len=arguments.length;i<len;i++){args.push(arguments[i]);}
args=(args.length>0)?args:["Assertion Failure"];args.push(newLine);args.push(expr);this.log(Level.ERROR,args);}};this.toString=function(){return"Logger["+this.name+"]";};}
Logger.prototype={trace:function(){this.log(Level.TRACE,arguments);},debug:function(){this.log(Level.DEBUG,arguments);},info:function(){this.log(Level.INFO,arguments);},warn:function(){this.log(Level.WARN,arguments);},error:function(){this.log(Level.ERROR,arguments);},fatal:function(){this.log(Level.FATAL,arguments);},isEnabledFor:function(level){return level.isGreaterOrEqual(this.getEffectiveLevel());},isTraceEnabled:function(){return this.isEnabledFor(Level.TRACE);},isDebugEnabled:function(){return this.isEnabledFor(Level.DEBUG);},isInfoEnabled:function(){return this.isEnabledFor(Level.INFO);},isWarnEnabled:function(){return this.isEnabledFor(Level.WARN);},isErrorEnabled:function(){return this.isEnabledFor(Level.ERROR);},isFatalEnabled:function(){return this.isEnabledFor(Level.FATAL);}};Logger.prototype.trace.isEntryPoint=true;Logger.prototype.debug.isEntryPoint=true;Logger.prototype.info.isEntryPoint=true;Logger.prototype.warn.isEntryPoint=true;Logger.prototype.error.isEntryPoint=true;Logger.prototype.fatal.isEntryPoint=true;var loggers={};var loggerNames=[];var ROOT_LOGGER_DEFAULT_LEVEL=Level.DEBUG;var rootLogger=new Logger(rootLoggerName);rootLogger.setLevel(ROOT_LOGGER_DEFAULT_LEVEL);log4javascript.getRootLogger=function(){return rootLogger;};log4javascript.getLogger=function(loggerName){if(typeof loggerName!="string"){loggerName=anonymousLoggerName;logLog.warn("log4javascript.getLogger: non-string logger name "+
toStr(loggerName)+" supplied, returning anonymous logger");}
if(loggerName==rootLoggerName){handleError("log4javascript.getLogger: root logger may not be obtained by name");}
if(!loggers[loggerName]){var logger=new Logger(loggerName);loggers[loggerName]=logger;loggerNames.push(loggerName);var lastDotIndex=loggerName.lastIndexOf(".");var parentLogger;if(lastDotIndex>-1){var parentLoggerName=loggerName.substring(0,lastDotIndex);parentLogger=log4javascript.getLogger(parentLoggerName);}else{parentLogger=rootLogger;}
parentLogger.addChild(logger);}
return loggers[loggerName];};var defaultLogger=null;log4javascript.getDefaultLogger=function(){if(!defaultLogger){defaultLogger=createDefaultLogger();}
return defaultLogger;};var nullLogger=null;log4javascript.getNullLogger=function(){if(!nullLogger){nullLogger=new Logger(nullLoggerName);nullLogger.setLevel(Level.OFF);}
return nullLogger;};log4javascript.resetConfiguration=function(){rootLogger.setLevel(ROOT_LOGGER_DEFAULT_LEVEL);loggers={};};var LoggingEvent=function(logger,timeStamp,level,messages,exception){this.logger=logger;this.timeStamp=timeStamp;this.timeStampInMilliseconds=timeStamp.getTime();this.timeStampInSeconds=Math.floor(this.timeStampInMilliseconds/1000);this.milliseconds=this.timeStamp.getMilliseconds();this.level=level;this.messages=messages;this.exception=exception;};LoggingEvent.prototype={getThrowableStrRep:function(){return this.exception?getExceptionStringRep(this.exception):"";},getCombinedMessages:function(){return(this.messages.length==1)?this.messages[0]:this.messages.join(newLine);},toString:function(){return"LoggingEvent["+this.level+"]";}};log4javascript.LoggingEvent=LoggingEvent;var Layout=function(){};Layout.prototype={defaults:{loggerKey:"logger",timeStampKey:"timestamp",millisecondsKey:"milliseconds",levelKey:"level",messageKey:"message",exceptionKey:"exception",urlKey:"url"},loggerKey:"logger",timeStampKey:"timestamp",millisecondsKey:"milliseconds",levelKey:"level",messageKey:"message",exceptionKey:"exception",urlKey:"url",batchHeader:"",batchFooter:"",batchSeparator:"",returnsPostData:false,overrideTimeStampsSetting:false,useTimeStampsInMilliseconds:null,format:function(){handleError("Layout.format: layout supplied has no format() method");},ignoresThrowable:function(){handleError("Layout.ignoresThrowable: layout supplied has no ignoresThrowable() method");},getContentType:function(){return"text/plain";},allowBatching:function(){return true;},setTimeStampsInMilliseconds:function(timeStampsInMilliseconds){this.overrideTimeStampsSetting=true;this.useTimeStampsInMilliseconds=bool(timeStampsInMilliseconds);},isTimeStampsInMilliseconds:function(){return this.overrideTimeStampsSetting?this.useTimeStampsInMilliseconds:useTimeStampsInMilliseconds;},getTimeStampValue:function(loggingEvent){return this.isTimeStampsInMilliseconds()?loggingEvent.timeStampInMilliseconds:loggingEvent.timeStampInSeconds;},getDataValues:function(loggingEvent,combineMessages){var dataValues=[[this.loggerKey,loggingEvent.logger.name],[this.timeStampKey,this.getTimeStampValue(loggingEvent)],[this.levelKey,loggingEvent.level.name],[this.urlKey,window.location.href],[this.messageKey,combineMessages?loggingEvent.getCombinedMessages():loggingEvent.messages]];if(!this.isTimeStampsInMilliseconds()){dataValues.push([this.millisecondsKey,loggingEvent.milliseconds]);}
if(loggingEvent.exception){dataValues.push([this.exceptionKey,getExceptionStringRep(loggingEvent.exception)]);}
if(this.hasCustomFields()){for(var i=0,len=this.customFields.length;i<len;i++){var val=this.customFields[i].value;if(typeof val==="function"){val=val(this,loggingEvent);}
dataValues.push([this.customFields[i].name,val]);}}
return dataValues;},setKeys:function(loggerKey,timeStampKey,levelKey,messageKey,exceptionKey,urlKey,millisecondsKey){this.loggerKey=extractStringFromParam(loggerKey,this.defaults.loggerKey);this.timeStampKey=extractStringFromParam(timeStampKey,this.defaults.timeStampKey);this.levelKey=extractStringFromParam(levelKey,this.defaults.levelKey);this.messageKey=extractStringFromParam(messageKey,this.defaults.messageKey);this.exceptionKey=extractStringFromParam(exceptionKey,this.defaults.exceptionKey);this.urlKey=extractStringFromParam(urlKey,this.defaults.urlKey);this.millisecondsKey=extractStringFromParam(millisecondsKey,this.defaults.millisecondsKey);},setCustomField:function(name,value){var fieldUpdated=false;for(var i=0,len=this.customFields.length;i<len;i++){if(this.customFields[i].name===name){this.customFields[i].value=value;fieldUpdated=true;}}
if(!fieldUpdated){this.customFields.push({"name":name,"value":value});}},hasCustomFields:function(){return(this.customFields.length>0);},formatWithException:function(loggingEvent){var formatted=this.format(loggingEvent);if(loggingEvent.exception&&this.ignoresThrowable()){formatted+=loggingEvent.getThrowableStrRep();}
return formatted;},toString:function(){handleError("Layout.toString: all layouts must override this method");}};log4javascript.Layout=Layout;var Appender=function(){};Appender.prototype=new EventSupport();Appender.prototype.layout=new PatternLayout();Appender.prototype.threshold=Level.ALL;Appender.prototype.loggers=[];Appender.prototype.doAppend=function(loggingEvent){if(enabled&&loggingEvent.level.level>=this.threshold.level){this.append(loggingEvent);}};Appender.prototype.append=function(loggingEvent){};Appender.prototype.setLayout=function(layout){if(layout instanceof Layout){this.layout=layout;}else{handleError("Appender.setLayout: layout supplied to "+
this.toString()+" is not a subclass of Layout");}};Appender.prototype.getLayout=function(){return this.layout;};Appender.prototype.setThreshold=function(threshold){if(threshold instanceof Level){this.threshold=threshold;}else{handleError("Appender.setThreshold: threshold supplied to "+
this.toString()+" is not a subclass of Level");}};Appender.prototype.getThreshold=function(){return this.threshold;};Appender.prototype.setAddedToLogger=function(logger){this.loggers.push(logger);};Appender.prototype.setRemovedFromLogger=function(logger){array_remove(this.loggers,logger);};Appender.prototype.group=emptyFunction;Appender.prototype.groupEnd=emptyFunction;Appender.prototype.toString=function(){handleError("Appender.toString: all appenders must override this method");};log4javascript.Appender=Appender;function SimpleLayout(){this.customFields=[];}
SimpleLayout.prototype=new Layout();SimpleLayout.prototype.format=function(loggingEvent){return loggingEvent.level.name+" - "+loggingEvent.getCombinedMessages();};SimpleLayout.prototype.ignoresThrowable=function(){return true;};SimpleLayout.prototype.toString=function(){return"SimpleLayout";};log4javascript.SimpleLayout=SimpleLayout;function NullLayout(){this.customFields=[];}
NullLayout.prototype=new Layout();NullLayout.prototype.format=function(loggingEvent){return loggingEvent.messages;};NullLayout.prototype.ignoresThrowable=function(){return true;};NullLayout.prototype.formatWithException=function(loggingEvent){var messages=loggingEvent.messages,ex=loggingEvent.exception;return ex?messages.concat([ex]):messages;};NullLayout.prototype.toString=function(){return"NullLayout";};log4javascript.NullLayout=NullLayout;function XmlLayout(combineMessages){this.combineMessages=extractBooleanFromParam(combineMessages,true);this.customFields=[];}
XmlLayout.prototype=new Layout();XmlLayout.prototype.isCombinedMessages=function(){return this.combineMessages;};XmlLayout.prototype.getContentType=function(){return"text/xml";};XmlLayout.prototype.escapeCdata=function(str){return str.replace(/\]\]>/,"]]>]]&gt;<![CDATA[");};XmlLayout.prototype.format=function(loggingEvent){var layout=this;var i,len;function formatMessage(message){message=(typeof message==="string")?message:toStr(message);return"<log4javascript:message><![CDATA["+
layout.escapeCdata(message)+"]]></log4javascript:message>";}
var str="<log4javascript:event logger=\""+loggingEvent.logger.name+"\" timestamp=\""+this.getTimeStampValue(loggingEvent)+"\"";if(!this.isTimeStampsInMilliseconds()){str+=" milliseconds=\""+loggingEvent.milliseconds+"\"";}
str+=" level=\""+loggingEvent.level.name+"\">"+newLine;if(this.combineMessages){str+=formatMessage(loggingEvent.getCombinedMessages());}else{str+="<log4javascript:messages>"+newLine;for(i=0,len=loggingEvent.messages.length;i<len;i++){str+=formatMessage(loggingEvent.messages[i])+newLine;}
str+="</log4javascript:messages>"+newLine;}
if(this.hasCustomFields()){for(i=0,len=this.customFields.length;i<len;i++){str+="<log4javascript:customfield name=\""+
this.customFields[i].name+"\"><![CDATA["+
this.customFields[i].value.toString()+"]]></log4javascript:customfield>"+newLine;}}
if(loggingEvent.exception){str+="<log4javascript:exception><![CDATA["+
getExceptionStringRep(loggingEvent.exception)+"]]></log4javascript:exception>"+newLine;}
str+="</log4javascript:event>"+newLine+newLine;return str;};XmlLayout.prototype.ignoresThrowable=function(){return false;};XmlLayout.prototype.toString=function(){return"XmlLayout";};log4javascript.XmlLayout=XmlLayout;function escapeNewLines(str){return str.replace(/\r\n|\r|\n/g,"\\r\\n");}
function JsonLayout(readable,combineMessages){this.readable=extractBooleanFromParam(readable,false);this.combineMessages=extractBooleanFromParam(combineMessages,true);this.batchHeader=this.readable?"["+newLine:"[";this.batchFooter=this.readable?"]"+newLine:"]";this.batchSeparator=this.readable?","+newLine:",";this.setKeys();this.colon=this.readable?": ":":";this.tab=this.readable?"\t":"";this.lineBreak=this.readable?newLine:"";this.customFields=[];}
JsonLayout.prototype=new Layout();JsonLayout.prototype.isReadable=function(){return this.readable;};JsonLayout.prototype.isCombinedMessages=function(){return this.combineMessages;};JsonLayout.prototype.format=function(loggingEvent){var layout=this;var dataValues=this.getDataValues(loggingEvent,this.combineMessages);var str="{"+this.lineBreak;var i,len;function formatValue(val,prefix,expand){var formattedValue;var valType=typeof val;if(val instanceof Date){formattedValue=String(val.getTime());}else if(expand&&(val instanceof Array)){formattedValue="["+layout.lineBreak;for(var i=0,len=val.length;i<len;i++){var childPrefix=prefix+layout.tab;formattedValue+=childPrefix+formatValue(val[i],childPrefix,false);if(i<val.length-1){formattedValue+=",";}
formattedValue+=layout.lineBreak;}
formattedValue+=prefix+"]";}else if(valType!=="number"&&valType!=="boolean"){formattedValue="\""+escapeNewLines(toStr(val).replace(/\"/g,"\\\""))+"\"";}else{formattedValue=val;}
return formattedValue;}
for(i=0,len=dataValues.length-1;i<=len;i++){str+=this.tab+"\""+dataValues[i][0]+"\""+this.colon+formatValue(dataValues[i][1],this.tab,true);if(i<len){str+=",";}
str+=this.lineBreak;}
str+="}"+this.lineBreak;return str;};JsonLayout.prototype.ignoresThrowable=function(){return false;};JsonLayout.prototype.toString=function(){return"JsonLayout";};JsonLayout.prototype.getContentType=function(){return"application/json";};log4javascript.JsonLayout=JsonLayout;function HttpPostDataLayout(){this.setKeys();this.customFields=[];this.returnsPostData=true;}
HttpPostDataLayout.prototype=new Layout();HttpPostDataLayout.prototype.allowBatching=function(){return false;};HttpPostDataLayout.prototype.format=function(loggingEvent){var dataValues=this.getDataValues(loggingEvent);var queryBits=[];for(var i=0,len=dataValues.length;i<len;i++){var val=(dataValues[i][1]instanceof Date)?String(dataValues[i][1].getTime()):dataValues[i][1];queryBits.push(urlEncode(dataValues[i][0])+"="+urlEncode(val));}
return queryBits.join("&");};HttpPostDataLayout.prototype.ignoresThrowable=function(loggingEvent){return false;};HttpPostDataLayout.prototype.toString=function(){return"HttpPostDataLayout";};log4javascript.HttpPostDataLayout=HttpPostDataLayout;function formatObjectExpansion(obj,depth,indentation){var objectsExpanded=[];function doFormat(obj,depth,indentation){var i,len,childDepth,childIndentation,childLines,expansion,childExpansion;if(!indentation){indentation="";}
function formatString(text){var lines=splitIntoLines(text);for(var j=1,jLen=lines.length;j<jLen;j++){lines[j]=indentation+lines[j];}
return lines.join(newLine);}
if(obj===null){return"null";}else if(typeof obj=="undefined"){return"undefined";}else if(typeof obj=="string"){return formatString(obj);}else if(typeof obj=="object"&&array_contains(objectsExpanded,obj)){try{expansion=toStr(obj);}catch(ex){expansion="Error formatting property. Details: "+getExceptionStringRep(ex);}
return expansion+" [already expanded]";}else if((obj instanceof Array)&&depth>0){objectsExpanded.push(obj);expansion="["+newLine;childDepth=depth-1;childIndentation=indentation+"  ";childLines=[];for(i=0,len=obj.length;i<len;i++){try{childExpansion=doFormat(obj[i],childDepth,childIndentation);childLines.push(childIndentation+childExpansion);}catch(ex){childLines.push(childIndentation+"Error formatting array member. Details: "+
getExceptionStringRep(ex)+"");}}
expansion+=childLines.join(","+newLine)+newLine+indentation+"]";return expansion;}else if(Object.prototype.toString.call(obj)=="[object Date]"){return obj.toString();}else if(typeof obj=="object"&&depth>0){objectsExpanded.push(obj);expansion="{"+newLine;childDepth=depth-1;childIndentation=indentation+"  ";childLines=[];for(i in obj){try{childExpansion=doFormat(obj[i],childDepth,childIndentation);childLines.push(childIndentation+i+": "+childExpansion);}catch(ex){childLines.push(childIndentation+i+": Error formatting property. Details: "+
getExceptionStringRep(ex));}}
expansion+=childLines.join(","+newLine)+newLine+indentation+"}";return expansion;}else{return formatString(toStr(obj));}}
return doFormat(obj,depth,indentation);}
var SimpleDateFormat;(function(){var regex=/('[^']*')|(G+|y+|M+|w+|W+|D+|d+|F+|E+|a+|H+|k+|K+|h+|m+|s+|S+|Z+)|([a-zA-Z]+)|([^a-zA-Z']+)/;var monthNames=["January","February","March","April","May","June","July","August","September","October","November","December"];var dayNames=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];var TEXT2=0,TEXT3=1,NUMBER=2,YEAR=3,MONTH=4,TIMEZONE=5;var types={G:TEXT2,y:YEAR,M:MONTH,w:NUMBER,W:NUMBER,D:NUMBER,d:NUMBER,F:NUMBER,E:TEXT3,a:TEXT2,H:NUMBER,k:NUMBER,K:NUMBER,h:NUMBER,m:NUMBER,s:NUMBER,S:NUMBER,Z:TIMEZONE};var ONE_DAY=24*60*60*1000;var ONE_WEEK=7*ONE_DAY;var DEFAULT_MINIMAL_DAYS_IN_FIRST_WEEK=1;var newDateAtMidnight=function(year,month,day){var d=new Date(year,month,day,0,0,0);d.setMilliseconds(0);return d;};Date.prototype.getDifference=function(date){return this.getTime()-date.getTime();};Date.prototype.isBefore=function(d){return this.getTime()<d.getTime();};Date.prototype.getUTCTime=function(){return Date.UTC(this.getFullYear(),this.getMonth(),this.getDate(),this.getHours(),this.getMinutes(),this.getSeconds(),this.getMilliseconds());};Date.prototype.getTimeSince=function(d){return this.getUTCTime()-d.getUTCTime();};Date.prototype.getPreviousSunday=function(){var midday=new Date(this.getFullYear(),this.getMonth(),this.getDate(),12,0,0);var previousSunday=new Date(midday.getTime()-this.getDay()*ONE_DAY);return newDateAtMidnight(previousSunday.getFullYear(),previousSunday.getMonth(),previousSunday.getDate());};Date.prototype.getWeekInYear=function(minimalDaysInFirstWeek){if(isUndefined(this.minimalDaysInFirstWeek)){minimalDaysInFirstWeek=DEFAULT_MINIMAL_DAYS_IN_FIRST_WEEK;}
var previousSunday=this.getPreviousSunday();var startOfYear=newDateAtMidnight(this.getFullYear(),0,1);var numberOfSundays=previousSunday.isBefore(startOfYear)?0:1+Math.floor(previousSunday.getTimeSince(startOfYear)/ONE_WEEK);var numberOfDaysInFirstWeek=7-startOfYear.getDay();var weekInYear=numberOfSundays;if(numberOfDaysInFirstWeek<minimalDaysInFirstWeek){weekInYear--;}
return weekInYear;};Date.prototype.getWeekInMonth=function(minimalDaysInFirstWeek){if(isUndefined(this.minimalDaysInFirstWeek)){minimalDaysInFirstWeek=DEFAULT_MINIMAL_DAYS_IN_FIRST_WEEK;}
var previousSunday=this.getPreviousSunday();var startOfMonth=newDateAtMidnight(this.getFullYear(),this.getMonth(),1);var numberOfSundays=previousSunday.isBefore(startOfMonth)?0:1+Math.floor(previousSunday.getTimeSince(startOfMonth)/ONE_WEEK);var numberOfDaysInFirstWeek=7-startOfMonth.getDay();var weekInMonth=numberOfSundays;if(numberOfDaysInFirstWeek>=minimalDaysInFirstWeek){weekInMonth++;}
return weekInMonth;};Date.prototype.getDayInYear=function(){var startOfYear=newDateAtMidnight(this.getFullYear(),0,1);return 1+Math.floor(this.getTimeSince(startOfYear)/ONE_DAY);};SimpleDateFormat=function(formatString){this.formatString=formatString;};SimpleDateFormat.prototype.setMinimalDaysInFirstWeek=function(days){this.minimalDaysInFirstWeek=days;};SimpleDateFormat.prototype.getMinimalDaysInFirstWeek=function(){return isUndefined(this.minimalDaysInFirstWeek)?DEFAULT_MINIMAL_DAYS_IN_FIRST_WEEK:this.minimalDaysInFirstWeek;};var padWithZeroes=function(str,len){while(str.length<len){str="0"+str;}
return str;};var formatText=function(data,numberOfLetters,minLength){return(numberOfLetters>=4)?data:data.substr(0,Math.max(minLength,numberOfLetters));};var formatNumber=function(data,numberOfLetters){var dataString=""+data;return padWithZeroes(dataString,numberOfLetters);};SimpleDateFormat.prototype.format=function(date){var formattedString="";var result;var searchString=this.formatString;while((result=regex.exec(searchString))){var quotedString=result[1];var patternLetters=result[2];var otherLetters=result[3];var otherCharacters=result[4];if(quotedString){if(quotedString=="''"){formattedString+="'";}else{formattedString+=quotedString.substring(1,quotedString.length-1);}}else if(otherLetters){}else if(otherCharacters){formattedString+=otherCharacters;}else if(patternLetters){var patternLetter=patternLetters.charAt(0);var numberOfLetters=patternLetters.length;var rawData="";switch(patternLetter){case"G":rawData="AD";break;case"y":rawData=date.getFullYear();break;case"M":rawData=date.getMonth();break;case"w":rawData=date.getWeekInYear(this.getMinimalDaysInFirstWeek());break;case"W":rawData=date.getWeekInMonth(this.getMinimalDaysInFirstWeek());break;case"D":rawData=date.getDayInYear();break;case"d":rawData=date.getDate();break;case"F":rawData=1+Math.floor((date.getDate()-1)/7);break;case"E":rawData=dayNames[date.getDay()];break;case"a":rawData=(date.getHours()>=12)?"PM":"AM";break;case"H":rawData=date.getHours();break;case"k":rawData=date.getHours()||24;break;case"K":rawData=date.getHours()%12;break;case"h":rawData=(date.getHours()%12)||12;break;case"m":rawData=date.getMinutes();break;case"s":rawData=date.getSeconds();break;case"S":rawData=date.getMilliseconds();break;case"Z":rawData=date.getTimezoneOffset();break;}
switch(types[patternLetter]){case TEXT2:formattedString+=formatText(rawData,numberOfLetters,2);break;case TEXT3:formattedString+=formatText(rawData,numberOfLetters,3);break;case NUMBER:formattedString+=formatNumber(rawData,numberOfLetters);break;case YEAR:if(numberOfLetters<=3){var dataString=""+rawData;formattedString+=dataString.substr(2,2);}else{formattedString+=formatNumber(rawData,numberOfLetters);}
break;case MONTH:if(numberOfLetters>=3){formattedString+=formatText(monthNames[rawData],numberOfLetters,numberOfLetters);}else{formattedString+=formatNumber(rawData+1,numberOfLetters);}
break;case TIMEZONE:var isPositive=(rawData>0);var prefix=isPositive?"-":"+";var absData=Math.abs(rawData);var hours=""+Math.floor(absData/60);hours=padWithZeroes(hours,2);var minutes=""+(absData%60);minutes=padWithZeroes(minutes,2);formattedString+=prefix+hours+minutes;break;}}
searchString=searchString.substr(result.index+result[0].length);}
return formattedString;};})();log4javascript.SimpleDateFormat=SimpleDateFormat;function PatternLayout(pattern){if(pattern){this.pattern=pattern;}else{this.pattern=PatternLayout.DEFAULT_CONVERSION_PATTERN;}
this.customFields=[];}
PatternLayout.TTCC_CONVERSION_PATTERN="%r %p %c - %m%n";PatternLayout.DEFAULT_CONVERSION_PATTERN="%m%n";PatternLayout.ISO8601_DATEFORMAT="yyyy-MM-dd HH:mm:ss,SSS";PatternLayout.DATETIME_DATEFORMAT="dd MMM yyyy HH:mm:ss,SSS";PatternLayout.ABSOLUTETIME_DATEFORMAT="HH:mm:ss,SSS";PatternLayout.prototype=new Layout();PatternLayout.prototype.format=function(loggingEvent){var regex=/%(-?[0-9]+)?(\.?[0-9]+)?([acdfmMnpr%])(\{([^\}]+)\})?|([^%]+)/;var formattedString="";var result;var searchString=this.pattern;while((result=regex.exec(searchString))){var matchedString=result[0];var padding=result[1];var truncation=result[2];var conversionCharacter=result[3];var specifier=result[5];var text=result[6];if(text){formattedString+=""+text;}else{var replacement="";switch(conversionCharacter){case"a":case"m":var depth=0;if(specifier){depth=parseInt(specifier,10);if(isNaN(depth)){handleError("PatternLayout.format: invalid specifier '"+
specifier+"' for conversion character '"+conversionCharacter+"' - should be a number");depth=0;}}
var messages=(conversionCharacter==="a")?loggingEvent.messages[0]:loggingEvent.messages;for(var i=0,len=messages.length;i<len;i++){if(i>0&&(replacement.charAt(replacement.length-1)!==" ")){replacement+=" ";}
if(depth===0){replacement+=messages[i];}else{replacement+=formatObjectExpansion(messages[i],depth);}}
break;case"c":var loggerName=loggingEvent.logger.name;if(specifier){var precision=parseInt(specifier,10);var loggerNameBits=loggingEvent.logger.name.split(".");if(precision>=loggerNameBits.length){replacement=loggerName;}else{replacement=loggerNameBits.slice(loggerNameBits.length-precision).join(".");}}else{replacement=loggerName;}
break;case"d":var dateFormat=PatternLayout.ISO8601_DATEFORMAT;if(specifier){dateFormat=specifier;if(dateFormat=="ISO8601"){dateFormat=PatternLayout.ISO8601_DATEFORMAT;}else if(dateFormat=="ABSOLUTE"){dateFormat=PatternLayout.ABSOLUTETIME_DATEFORMAT;}else if(dateFormat=="DATE"){dateFormat=PatternLayout.DATETIME_DATEFORMAT;}}
replacement=(new SimpleDateFormat(dateFormat)).format(loggingEvent.timeStamp);break;case"f":if(this.hasCustomFields()){var fieldIndex=0;if(specifier){fieldIndex=parseInt(specifier,10);if(isNaN(fieldIndex)){handleError("PatternLayout.format: invalid specifier '"+
specifier+"' for conversion character 'f' - should be a number");}else if(fieldIndex===0){handleError("PatternLayout.format: invalid specifier '"+
specifier+"' for conversion character 'f' - must be greater than zero");}else if(fieldIndex>this.customFields.length){handleError("PatternLayout.format: invalid specifier '"+
specifier+"' for conversion character 'f' - there aren't that many custom fields");}else{fieldIndex=fieldIndex-1;}}
var val=this.customFields[fieldIndex].value;if(typeof val=="function"){val=val(this,loggingEvent);}
replacement=val;}
break;case"n":replacement=newLine;break;case"p":replacement=loggingEvent.level.name;break;case"r":replacement=""+loggingEvent.timeStamp.getDifference(applicationStartDate);break;case"%":replacement="%";break;default:replacement=matchedString;break;}
var l;if(truncation){l=parseInt(truncation.substr(1),10);var strLen=replacement.length;if(l<strLen){replacement=replacement.substring(strLen-l,strLen);}}
if(padding){if(padding.charAt(0)=="-"){l=parseInt(padding.substr(1),10);while(replacement.length<l){replacement+=" ";}}else{l=parseInt(padding,10);while(replacement.length<l){replacement=" "+replacement;}}}
formattedString+=replacement;}
searchString=searchString.substr(result.index+result[0].length);}
return formattedString;};PatternLayout.prototype.ignoresThrowable=function(){return true;};PatternLayout.prototype.toString=function(){return"PatternLayout";};log4javascript.PatternLayout=PatternLayout;function AlertAppender(){}
AlertAppender.prototype=new Appender();AlertAppender.prototype.layout=new SimpleLayout();AlertAppender.prototype.append=function(loggingEvent){alert(this.getLayout().formatWithException(loggingEvent));};AlertAppender.prototype.toString=function(){return"AlertAppender";};log4javascript.AlertAppender=AlertAppender;function BrowserConsoleAppender(){}
BrowserConsoleAppender.prototype=new log4javascript.Appender();BrowserConsoleAppender.prototype.layout=new NullLayout();BrowserConsoleAppender.prototype.threshold=Level.DEBUG;BrowserConsoleAppender.prototype.append=function(loggingEvent){var appender=this;var getFormattedMessage=function(concatenate){var formattedMessage=appender.getLayout().formatWithException(loggingEvent);return(typeof formattedMessage=="string")?(concatenate?formattedMessage:[formattedMessage]):(concatenate?formattedMessage.join(" "):formattedMessage);};var console=window.console;if(console&&console.log){var consoleMethodName;if(console.debug&&Level.DEBUG.isGreaterOrEqual(loggingEvent.level)){consoleMethodName="debug";}else if(console.info&&Level.INFO.equals(loggingEvent.level)){consoleMethodName="info";}else if(console.warn&&Level.WARN.equals(loggingEvent.level)){consoleMethodName="warn";}else if(console.error&&loggingEvent.level.isGreaterOrEqual(Level.ERROR)){consoleMethodName="error";}else{consoleMethodName="log";}
if(typeof console[consoleMethodName].apply=="function"){console[consoleMethodName].apply(console,getFormattedMessage(false));}else{console[consoleMethodName](getFormattedMessage(true));}}else if((typeof opera!="undefined")&&opera.postError){opera.postError(getFormattedMessage(true));}};BrowserConsoleAppender.prototype.group=function(name){if(window.console&&window.console.group){window.console.group(name);}};BrowserConsoleAppender.prototype.groupEnd=function(){if(window.console&&window.console.groupEnd){window.console.groupEnd();}};BrowserConsoleAppender.prototype.toString=function(){return"BrowserConsoleAppender";};log4javascript.BrowserConsoleAppender=BrowserConsoleAppender;var xhrFactory=function(){return new XMLHttpRequest();};var xmlHttpFactories=[xhrFactory,function(){return new ActiveXObject("Msxml2.XMLHTTP");},function(){return new ActiveXObject("Microsoft.XMLHTTP");}];var withCredentialsSupported=false;var getXmlHttp=function(errorHandler){var xmlHttp=null,factory;for(var i=0,len=xmlHttpFactories.length;i<len;i++){factory=xmlHttpFactories[i];try{xmlHttp=factory();withCredentialsSupported=(factory==xhrFactory&&("withCredentials"in xmlHttp));getXmlHttp=factory;return xmlHttp;}catch(e){}}
if(errorHandler){errorHandler();}else{handleError("getXmlHttp: unable to obtain XMLHttpRequest object");}};function isHttpRequestSuccessful(xmlHttp){return isUndefined(xmlHttp.status)||xmlHttp.status===0||(xmlHttp.status>=200&&xmlHttp.status<300)||xmlHttp.status==1223;}
function AjaxAppender(url,withCredentials){var appender=this;var isSupported=true;if(!url){handleError("AjaxAppender: URL must be specified in constructor");isSupported=false;}
var timed=this.defaults.timed;var waitForResponse=this.defaults.waitForResponse;var batchSize=this.defaults.batchSize;var timerInterval=this.defaults.timerInterval;var requestSuccessCallback=this.defaults.requestSuccessCallback;var failCallback=this.defaults.failCallback;var postVarName=this.defaults.postVarName;var sendAllOnUnload=this.defaults.sendAllOnUnload;var contentType=this.defaults.contentType;var sessionId=null;var queuedLoggingEvents=[];var queuedRequests=[];var headers=[];var sending=false;var initialized=false;function checkCanConfigure(configOptionName){if(initialized){handleError("AjaxAppender: configuration option '"+
configOptionName+"' may not be set after the appender has been initialized");return false;}
return true;}
this.getSessionId=function(){return sessionId;};this.setSessionId=function(sessionIdParam){sessionId=extractStringFromParam(sessionIdParam,null);this.layout.setCustomField("sessionid",sessionId);};this.setLayout=function(layoutParam){if(checkCanConfigure("layout")){this.layout=layoutParam;if(sessionId!==null){this.setSessionId(sessionId);}}};this.isTimed=function(){return timed;};this.setTimed=function(timedParam){if(checkCanConfigure("timed")){timed=bool(timedParam);}};this.getTimerInterval=function(){return timerInterval;};this.setTimerInterval=function(timerIntervalParam){if(checkCanConfigure("timerInterval")){timerInterval=extractIntFromParam(timerIntervalParam,timerInterval);}};this.isWaitForResponse=function(){return waitForResponse;};this.setWaitForResponse=function(waitForResponseParam){if(checkCanConfigure("waitForResponse")){waitForResponse=bool(waitForResponseParam);}};this.getBatchSize=function(){return batchSize;};this.setBatchSize=function(batchSizeParam){if(checkCanConfigure("batchSize")){batchSize=extractIntFromParam(batchSizeParam,batchSize);}};this.isSendAllOnUnload=function(){return sendAllOnUnload;};this.setSendAllOnUnload=function(sendAllOnUnloadParam){if(checkCanConfigure("sendAllOnUnload")){sendAllOnUnload=extractBooleanFromParam(sendAllOnUnloadParam,sendAllOnUnload);}};this.setRequestSuccessCallback=function(requestSuccessCallbackParam){requestSuccessCallback=extractFunctionFromParam(requestSuccessCallbackParam,requestSuccessCallback);};this.setFailCallback=function(failCallbackParam){failCallback=extractFunctionFromParam(failCallbackParam,failCallback);};this.getPostVarName=function(){return postVarName;};this.setPostVarName=function(postVarNameParam){if(checkCanConfigure("postVarName")){postVarName=extractStringFromParam(postVarNameParam,postVarName);}};this.getHeaders=function(){return headers;};this.addHeader=function(name,value){if(name.toLowerCase()=="content-type"){contentType=value;}else{headers.push({name:name,value:value});}};function sendAll(){if(isSupported&&enabled){sending=true;var currentRequestBatch;if(waitForResponse){if(queuedRequests.length>0){currentRequestBatch=queuedRequests.shift();sendRequest(preparePostData(currentRequestBatch),sendAll);}else{sending=false;if(timed){scheduleSending();}}}else{while((currentRequestBatch=queuedRequests.shift())){sendRequest(preparePostData(currentRequestBatch));}
sending=false;if(timed){scheduleSending();}}}}
this.sendAll=sendAll;function sendAllRemaining(){var sendingAnything=false;if(isSupported&&enabled){var actualBatchSize=appender.getLayout().allowBatching()?batchSize:1;var currentLoggingEvent;var batchedLoggingEvents=[];while((currentLoggingEvent=queuedLoggingEvents.shift())){batchedLoggingEvents.push(currentLoggingEvent);if(queuedLoggingEvents.length>=actualBatchSize){queuedRequests.push(batchedLoggingEvents);batchedLoggingEvents=[];}}
if(batchedLoggingEvents.length>0){queuedRequests.push(batchedLoggingEvents);}
sendingAnything=(queuedRequests.length>0);waitForResponse=false;timed=false;sendAll();}
return sendingAnything;}
this.sendAllRemaining=sendAllRemaining;function preparePostData(batchedLoggingEvents){var formattedMessages=[];var currentLoggingEvent;var postData="";while((currentLoggingEvent=batchedLoggingEvents.shift())){formattedMessages.push(appender.getLayout().formatWithException(currentLoggingEvent));}
if(batchedLoggingEvents.length==1){postData=formattedMessages.join("");}else{postData=appender.getLayout().batchHeader+
formattedMessages.join(appender.getLayout().batchSeparator)+
appender.getLayout().batchFooter;}
if(contentType==appender.defaults.contentType){postData=appender.getLayout().returnsPostData?postData:urlEncode(postVarName)+"="+urlEncode(postData);if(postData.length>0){postData+="&";}
postData+="layout="+urlEncode(appender.getLayout().toString());}
return postData;}
function scheduleSending(){window.setTimeout(sendAll,timerInterval);}
function xmlHttpErrorHandler(){var msg="AjaxAppender: could not create XMLHttpRequest object. AjaxAppender disabled";handleError(msg);isSupported=false;if(failCallback){failCallback(msg);}}
function sendRequest(postData,successCallback){try{var xmlHttp=getXmlHttp(xmlHttpErrorHandler);if(isSupported){xmlHttp.onreadystatechange=function(){if(xmlHttp.readyState==4){if(isHttpRequestSuccessful(xmlHttp)){if(requestSuccessCallback){requestSuccessCallback(xmlHttp);}
if(successCallback){successCallback(xmlHttp);}}else{var msg="AjaxAppender.append: XMLHttpRequest request to URL "+
url+" returned status code "+xmlHttp.status;handleError(msg);if(failCallback){failCallback(msg);}}
xmlHttp.onreadystatechange=emptyFunction;xmlHttp=null;}};xmlHttp.open("POST",url,true);if(withCredentials&&withCredentialsSupported){xmlHttp.withCredentials=true;}
try{for(var i=0,header;header=headers[i++];){xmlHttp.setRequestHeader(header.name,header.value);}
xmlHttp.setRequestHeader("Content-Type",contentType);}catch(headerEx){var msg="AjaxAppender.append: your browser's XMLHttpRequest implementation"+" does not support setRequestHeader, therefore cannot post data. AjaxAppender disabled";handleError(msg);isSupported=false;if(failCallback){failCallback(msg);}
return;}
xmlHttp.send(postData);}}catch(ex){var errMsg="AjaxAppender.append: error sending log message to "+url;handleError(errMsg,ex);isSupported=false;if(failCallback){failCallback(errMsg+". Details: "+getExceptionStringRep(ex));}}}
this.append=function(loggingEvent){if(isSupported){if(!initialized){init();}
queuedLoggingEvents.push(loggingEvent);var actualBatchSize=this.getLayout().allowBatching()?batchSize:1;if(queuedLoggingEvents.length>=actualBatchSize){var currentLoggingEvent;var batchedLoggingEvents=[];while((currentLoggingEvent=queuedLoggingEvents.shift())){batchedLoggingEvents.push(currentLoggingEvent);}
queuedRequests.push(batchedLoggingEvents);if(!timed&&(!waitForResponse||(waitForResponse&&!sending))){sendAll();}}}};function init(){initialized=true;if(sendAllOnUnload){var oldBeforeUnload=window.onbeforeunload;window.onbeforeunload=function(){if(oldBeforeUnload){oldBeforeUnload();}
sendAllRemaining();};}
if(timed){scheduleSending();}}}
AjaxAppender.prototype=new Appender();AjaxAppender.prototype.defaults={waitForResponse:false,timed:false,timerInterval:1000,batchSize:1,sendAllOnUnload:false,requestSuccessCallback:null,failCallback:null,postVarName:"data",contentType:"application/x-www-form-urlencoded"};AjaxAppender.prototype.layout=new HttpPostDataLayout();AjaxAppender.prototype.toString=function(){return"AjaxAppender";};log4javascript.AjaxAppender=AjaxAppender;function setCookie(name,value,days,path){var expires;path=path?"; path="+path:"";if(days){var date=new Date();date.setTime(date.getTime()+(days*24*60*60*1000));expires="; expires="+date.toGMTString();}else{expires="";}
document.cookie=escape(name)+"="+escape(value)+expires+path;}
function getCookie(name){var nameEquals=escape(name)+"=";var ca=document.cookie.split(";");for(var i=0,len=ca.length;i<len;i++){var c=ca[i];while(c.charAt(0)===" "){c=c.substring(1,c.length);}
if(c.indexOf(nameEquals)===0){return unescape(c.substring(nameEquals.length,c.length));}}
return null;}
function getBaseUrl(){var scripts=document.getElementsByTagName("script");for(var i=0,len=scripts.length;i<len;++i){if(scripts[i].src.indexOf("log4javascript")!=-1){var lastSlash=scripts[i].src.lastIndexOf("/");return(lastSlash==-1)?"":scripts[i].src.substr(0,lastSlash+1);}}
return null;}
function isLoaded(win){try{return bool(win.loaded);}catch(ex){return false;}}
var ConsoleAppender;(function(){var getConsoleHtmlLines=function(){return['<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">','<html xmlns="http://www.w3.org/1999/xhtml" lang="en" xml:lang="en">','<head>','<title>log4javascript</title>','<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />','<!-- Make IE8 behave like IE7, having gone to all the trouble of making IE work -->','<meta http-equiv="X-UA-Compatible" content="IE=7" />','<script type="text/javascript">var isIe = false, isIePre7 = false;</script>','<!--[if IE]><script type="text/javascript">isIe = true</script><![endif]-->','<!--[if lt IE 7]><script type="text/javascript">isIePre7 = true</script><![endif]-->','<script type="text/javascript">','//<![CDATA[','var loggingEnabled=true;var logQueuedEventsTimer=null;var logEntries=[];var logEntriesAndSeparators=[];var logItems=[];var renderDelay=100;var unrenderedLogItemsExist=false;var rootGroup,currentGroup=null;var loaded=false;var currentLogItem=null;var logMainContainer;function copyProperties(obj,props){for(var i in props){obj[i]=props[i];}}','function LogItem(){}','LogItem.prototype={mainContainer:null,wrappedContainer:null,unwrappedContainer:null,group:null,appendToLog:function(){for(var i=0,len=this.elementContainers.length;i<len;i++){this.elementContainers[i].appendToLog();}','this.group.update();},doRemove:function(doUpdate,removeFromGroup){if(this.rendered){for(var i=0,len=this.elementContainers.length;i<len;i++){this.elementContainers[i].remove();}','this.unwrappedElementContainer=null;this.wrappedElementContainer=null;this.mainElementContainer=null;}','if(this.group&&removeFromGroup){this.group.removeChild(this,doUpdate);}','if(this===currentLogItem){currentLogItem=null;}},remove:function(doUpdate,removeFromGroup){this.doRemove(doUpdate,removeFromGroup);},render:function(){},accept:function(visitor){visitor.visit(this);},getUnwrappedDomContainer:function(){return this.group.unwrappedElementContainer.contentDiv;},getWrappedDomContainer:function(){return this.group.wrappedElementContainer.contentDiv;},getMainDomContainer:function(){return this.group.mainElementContainer.contentDiv;}};LogItem.serializedItemKeys={LOG_ENTRY:0,GROUP_START:1,GROUP_END:2};function LogItemContainerElement(){}','LogItemContainerElement.prototype={appendToLog:function(){var insertBeforeFirst=(newestAtTop&&this.containerDomNode.hasChildNodes());if(insertBeforeFirst){this.containerDomNode.insertBefore(this.mainDiv,this.containerDomNode.firstChild);}else{this.containerDomNode.appendChild(this.mainDiv);}}};function SeparatorElementContainer(containerDomNode){this.containerDomNode=containerDomNode;this.mainDiv=document.createElement("div");this.mainDiv.className="separator";this.mainDiv.innerHTML="&nbsp;";}','SeparatorElementContainer.prototype=new LogItemContainerElement();SeparatorElementContainer.prototype.remove=function(){this.mainDiv.parentNode.removeChild(this.mainDiv);this.mainDiv=null;};function Separator(){this.rendered=false;}','Separator.prototype=new LogItem();copyProperties(Separator.prototype,{render:function(){var containerDomNode=this.group.contentDiv;if(isIe){this.unwrappedElementContainer=new SeparatorElementContainer(this.getUnwrappedDomContainer());this.wrappedElementContainer=new SeparatorElementContainer(this.getWrappedDomContainer());this.elementContainers=[this.unwrappedElementContainer,this.wrappedElementContainer];}else{this.mainElementContainer=new SeparatorElementContainer(this.getMainDomContainer());this.elementContainers=[this.mainElementContainer];}','this.content=this.formattedMessage;this.rendered=true;}});function GroupElementContainer(group,containerDomNode,isRoot,isWrapped){this.group=group;this.containerDomNode=containerDomNode;this.isRoot=isRoot;this.isWrapped=isWrapped;this.expandable=false;if(this.isRoot){if(isIe){this.contentDiv=logMainContainer.appendChild(document.createElement("div"));this.contentDiv.id=this.isWrapped?"log_wrapped":"log_unwrapped";}else{this.contentDiv=logMainContainer;}}else{var groupElementContainer=this;this.mainDiv=document.createElement("div");this.mainDiv.className="group";this.headingDiv=this.mainDiv.appendChild(document.createElement("div"));this.headingDiv.className="groupheading";this.expander=this.headingDiv.appendChild(document.createElement("span"));this.expander.className="expander unselectable greyedout";this.expander.unselectable=true;var expanderText=this.group.expanded?"-":"+";this.expanderTextNode=this.expander.appendChild(document.createTextNode(expanderText));this.headingDiv.appendChild(document.createTextNode(" "+this.group.name));this.contentDiv=this.mainDiv.appendChild(document.createElement("div"));var contentCssClass=this.group.expanded?"expanded":"collapsed";this.contentDiv.className="groupcontent "+contentCssClass;this.expander.onclick=function(){if(groupElementContainer.group.expandable){groupElementContainer.group.toggleExpanded();}};}}','GroupElementContainer.prototype=new LogItemContainerElement();copyProperties(GroupElementContainer.prototype,{toggleExpanded:function(){if(!this.isRoot){var oldCssClass,newCssClass,expanderText;if(this.group.expanded){newCssClass="expanded";oldCssClass="collapsed";expanderText="-";}else{newCssClass="collapsed";oldCssClass="expanded";expanderText="+";}','replaceClass(this.contentDiv,newCssClass,oldCssClass);this.expanderTextNode.nodeValue=expanderText;}},remove:function(){if(!this.isRoot){this.headingDiv=null;this.expander.onclick=null;this.expander=null;this.expanderTextNode=null;this.contentDiv=null;this.containerDomNode=null;this.mainDiv.parentNode.removeChild(this.mainDiv);this.mainDiv=null;}},reverseChildren:function(){var node=null;var childDomNodes=[];while((node=this.contentDiv.firstChild)){this.contentDiv.removeChild(node);childDomNodes.push(node);}','while((node=childDomNodes.pop())){this.contentDiv.appendChild(node);}},update:function(){if(!this.isRoot){if(this.group.expandable){removeClass(this.expander,"greyedout");}else{addClass(this.expander,"greyedout");}}},clear:function(){if(this.isRoot){this.contentDiv.innerHTML="";}}});function Group(name,isRoot,initiallyExpanded){this.name=name;this.group=null;this.isRoot=isRoot;this.initiallyExpanded=initiallyExpanded;this.elementContainers=[];this.children=[];this.expanded=initiallyExpanded;this.rendered=false;this.expandable=false;}','Group.prototype=new LogItem();copyProperties(Group.prototype,{addChild:function(logItem){this.children.push(logItem);logItem.group=this;},render:function(){if(isIe){var unwrappedDomContainer,wrappedDomContainer;if(this.isRoot){unwrappedDomContainer=logMainContainer;wrappedDomContainer=logMainContainer;}else{unwrappedDomContainer=this.getUnwrappedDomContainer();wrappedDomContainer=this.getWrappedDomContainer();}','this.unwrappedElementContainer=new GroupElementContainer(this,unwrappedDomContainer,this.isRoot,false);this.wrappedElementContainer=new GroupElementContainer(this,wrappedDomContainer,this.isRoot,true);this.elementContainers=[this.unwrappedElementContainer,this.wrappedElementContainer];}else{var mainDomContainer=this.isRoot?logMainContainer:this.getMainDomContainer();this.mainElementContainer=new GroupElementContainer(this,mainDomContainer,this.isRoot,false);this.elementContainers=[this.mainElementContainer];}','this.rendered=true;},toggleExpanded:function(){this.expanded=!this.expanded;for(var i=0,len=this.elementContainers.length;i<len;i++){this.elementContainers[i].toggleExpanded();}},expand:function(){if(!this.expanded){this.toggleExpanded();}},accept:function(visitor){visitor.visitGroup(this);},reverseChildren:function(){if(this.rendered){for(var i=0,len=this.elementContainers.length;i<len;i++){this.elementContainers[i].reverseChildren();}}},update:function(){var previouslyExpandable=this.expandable;this.expandable=(this.children.length!==0);if(this.expandable!==previouslyExpandable){for(var i=0,len=this.elementContainers.length;i<len;i++){this.elementContainers[i].update();}}},flatten:function(){var visitor=new GroupFlattener();this.accept(visitor);return visitor.logEntriesAndSeparators;},removeChild:function(child,doUpdate){array_remove(this.children,child);child.group=null;if(doUpdate){this.update();}},remove:function(doUpdate,removeFromGroup){for(var i=0,len=this.children.length;i<len;i++){this.children[i].remove(false,false);}','this.children=[];this.update();if(this===currentGroup){currentGroup=this.group;}','this.doRemove(doUpdate,removeFromGroup);},serialize:function(items){items.push([LogItem.serializedItemKeys.GROUP_START,this.name]);for(var i=0,len=this.children.length;i<len;i++){this.children[i].serialize(items);}','if(this!==currentGroup){items.push([LogItem.serializedItemKeys.GROUP_END]);}},clear:function(){for(var i=0,len=this.elementContainers.length;i<len;i++){this.elementContainers[i].clear();}}});function LogEntryElementContainer(){}','LogEntryElementContainer.prototype=new LogItemContainerElement();copyProperties(LogEntryElementContainer.prototype,{remove:function(){this.doRemove();},doRemove:function(){this.mainDiv.parentNode.removeChild(this.mainDiv);this.mainDiv=null;this.contentElement=null;this.containerDomNode=null;},setContent:function(content,wrappedContent){if(content===this.formattedMessage){this.contentElement.innerHTML="";this.contentElement.appendChild(document.createTextNode(this.formattedMessage));}else{this.contentElement.innerHTML=content;}},setSearchMatch:function(isMatch){var oldCssClass=isMatch?"searchnonmatch":"searchmatch";var newCssClass=isMatch?"searchmatch":"searchnonmatch";replaceClass(this.mainDiv,newCssClass,oldCssClass);},clearSearch:function(){removeClass(this.mainDiv,"searchmatch");removeClass(this.mainDiv,"searchnonmatch");}});function LogEntryWrappedElementContainer(logEntry,containerDomNode){this.logEntry=logEntry;this.containerDomNode=containerDomNode;this.mainDiv=document.createElement("div");this.mainDiv.appendChild(document.createTextNode(this.logEntry.formattedMessage));this.mainDiv.className="logentry wrapped "+this.logEntry.level;this.contentElement=this.mainDiv;}','LogEntryWrappedElementContainer.prototype=new LogEntryElementContainer();LogEntryWrappedElementContainer.prototype.setContent=function(content,wrappedContent){if(content===this.formattedMessage){this.contentElement.innerHTML="";this.contentElement.appendChild(document.createTextNode(this.formattedMessage));}else{this.contentElement.innerHTML=wrappedContent;}};function LogEntryUnwrappedElementContainer(logEntry,containerDomNode){this.logEntry=logEntry;this.containerDomNode=containerDomNode;this.mainDiv=document.createElement("div");this.mainDiv.className="logentry unwrapped "+this.logEntry.level;this.pre=this.mainDiv.appendChild(document.createElement("pre"));this.pre.appendChild(document.createTextNode(this.logEntry.formattedMessage));this.pre.className="unwrapped";this.contentElement=this.pre;}','LogEntryUnwrappedElementContainer.prototype=new LogEntryElementContainer();LogEntryUnwrappedElementContainer.prototype.remove=function(){this.doRemove();this.pre=null;};function LogEntryMainElementContainer(logEntry,containerDomNode){this.logEntry=logEntry;this.containerDomNode=containerDomNode;this.mainDiv=document.createElement("div");this.mainDiv.className="logentry nonielogentry "+this.logEntry.level;this.contentElement=this.mainDiv.appendChild(document.createElement("span"));this.contentElement.appendChild(document.createTextNode(this.logEntry.formattedMessage));}','LogEntryMainElementContainer.prototype=new LogEntryElementContainer();function LogEntry(level,formattedMessage){this.level=level;this.formattedMessage=formattedMessage;this.rendered=false;}','LogEntry.prototype=new LogItem();copyProperties(LogEntry.prototype,{render:function(){var logEntry=this;var containerDomNode=this.group.contentDiv;if(isIe){this.formattedMessage=this.formattedMessage.replace(/\\r\\n/g,"\\r");this.unwrappedElementContainer=new LogEntryUnwrappedElementContainer(this,this.getUnwrappedDomContainer());this.wrappedElementContainer=new LogEntryWrappedElementContainer(this,this.getWrappedDomContainer());this.elementContainers=[this.unwrappedElementContainer,this.wrappedElementContainer];}else{this.mainElementContainer=new LogEntryMainElementContainer(this,this.getMainDomContainer());this.elementContainers=[this.mainElementContainer];}','this.content=this.formattedMessage;this.rendered=true;},setContent:function(content,wrappedContent){if(content!=this.content){if(isIe&&(content!==this.formattedMessage)){content=content.replace(/\\r\\n/g,"\\r");}','for(var i=0,len=this.elementContainers.length;i<len;i++){this.elementContainers[i].setContent(content,wrappedContent);}','this.content=content;}},getSearchMatches:function(){var matches=[];var i,len;if(isIe){var unwrappedEls=getElementsByClass(this.unwrappedElementContainer.mainDiv,"searchterm","span");var wrappedEls=getElementsByClass(this.wrappedElementContainer.mainDiv,"searchterm","span");for(i=0,len=unwrappedEls.length;i<len;i++){matches[i]=new Match(this.level,null,unwrappedEls[i],wrappedEls[i]);}}else{var els=getElementsByClass(this.mainElementContainer.mainDiv,"searchterm","span");for(i=0,len=els.length;i<len;i++){matches[i]=new Match(this.level,els[i]);}}','return matches;},setSearchMatch:function(isMatch){for(var i=0,len=this.elementContainers.length;i<len;i++){this.elementContainers[i].setSearchMatch(isMatch);}},clearSearch:function(){for(var i=0,len=this.elementContainers.length;i<len;i++){this.elementContainers[i].clearSearch();}},accept:function(visitor){visitor.visitLogEntry(this);},serialize:function(items){items.push([LogItem.serializedItemKeys.LOG_ENTRY,this.level,this.formattedMessage]);}});function LogItemVisitor(){}','LogItemVisitor.prototype={visit:function(logItem){},visitParent:function(logItem){if(logItem.group){logItem.group.accept(this);}},visitChildren:function(logItem){for(var i=0,len=logItem.children.length;i<len;i++){logItem.children[i].accept(this);}},visitLogEntry:function(logEntry){this.visit(logEntry);},visitSeparator:function(separator){this.visit(separator);},visitGroup:function(group){this.visit(group);}};function GroupFlattener(){this.logEntriesAndSeparators=[];}','GroupFlattener.prototype=new LogItemVisitor();GroupFlattener.prototype.visitGroup=function(group){this.visitChildren(group);};GroupFlattener.prototype.visitLogEntry=function(logEntry){this.logEntriesAndSeparators.push(logEntry);};GroupFlattener.prototype.visitSeparator=function(separator){this.logEntriesAndSeparators.push(separator);};window.onload=function(){if(location.search){var queryBits=unescape(location.search).substr(1).split("&"),nameValueBits;for(var i=0,len=queryBits.length;i<len;i++){nameValueBits=queryBits[i].split("=");if(nameValueBits[0]=="log4javascript_domain"){document.domain=nameValueBits[1];break;}}}','logMainContainer=$("log");if(isIePre7){addClass(logMainContainer,"oldIe");}','rootGroup=new Group("root",true);rootGroup.render();currentGroup=rootGroup;setCommandInputWidth();setLogContainerHeight();toggleLoggingEnabled();toggleSearchEnabled();toggleSearchFilter();toggleSearchHighlight();applyFilters();checkAllLevels();toggleWrap();toggleNewestAtTop();toggleScrollToLatest();renderQueuedLogItems();loaded=true;$("command").value="";$("command").autocomplete="off";$("command").onkeydown=function(evt){evt=getEvent(evt);if(evt.keyCode==10||evt.keyCode==13){evalCommandLine();stopPropagation(evt);}else if(evt.keyCode==27){this.value="";this.focus();}else if(evt.keyCode==38&&commandHistory.length>0){currentCommandIndex=Math.max(0,currentCommandIndex-1);this.value=commandHistory[currentCommandIndex];moveCaretToEnd(this);}else if(evt.keyCode==40&&commandHistory.length>0){currentCommandIndex=Math.min(commandHistory.length-1,currentCommandIndex+1);this.value=commandHistory[currentCommandIndex];moveCaretToEnd(this);}};$("command").onkeypress=function(evt){evt=getEvent(evt);if(evt.keyCode==38&&commandHistory.length>0&&evt.preventDefault){evt.preventDefault();}};$("command").onkeyup=function(evt){evt=getEvent(evt);if(evt.keyCode==27&&evt.preventDefault){evt.preventDefault();this.focus();}};document.onkeydown=function keyEventHandler(evt){evt=getEvent(evt);switch(evt.keyCode){case 69:if(evt.shiftKey&&(evt.ctrlKey||evt.metaKey)){evalLastCommand();cancelKeyEvent(evt);return false;}','break;case 75:if(evt.shiftKey&&(evt.ctrlKey||evt.metaKey)){focusSearch();cancelKeyEvent(evt);return false;}','break;case 40:case 76:if(evt.shiftKey&&(evt.ctrlKey||evt.metaKey)){focusCommandLine();cancelKeyEvent(evt);return false;}','break;}};setTimeout(setLogContainerHeight,20);setShowCommandLine(showCommandLine);doSearch();};window.onunload=function(){if(mainWindowExists()){appender.unload();}','appender=null;};function toggleLoggingEnabled(){setLoggingEnabled($("enableLogging").checked);}','function setLoggingEnabled(enable){loggingEnabled=enable;}','var appender=null;function setAppender(appenderParam){appender=appenderParam;}','function setShowCloseButton(showCloseButton){$("closeButton").style.display=showCloseButton?"inline":"none";}','function setShowHideButton(showHideButton){$("hideButton").style.display=showHideButton?"inline":"none";}','var newestAtTop=false;function LogItemContentReverser(){}','LogItemContentReverser.prototype=new LogItemVisitor();LogItemContentReverser.prototype.visitGroup=function(group){group.reverseChildren();this.visitChildren(group);};function setNewestAtTop(isNewestAtTop){var oldNewestAtTop=newestAtTop;var i,iLen,j,jLen;newestAtTop=Boolean(isNewestAtTop);if(oldNewestAtTop!=newestAtTop){var visitor=new LogItemContentReverser();rootGroup.accept(visitor);if(currentSearch){var currentMatch=currentSearch.matches[currentMatchIndex];var matchIndex=0;var matches=[];var actOnLogEntry=function(logEntry){var logEntryMatches=logEntry.getSearchMatches();for(j=0,jLen=logEntryMatches.length;j<jLen;j++){matches[matchIndex]=logEntryMatches[j];if(currentMatch&&logEntryMatches[j].equals(currentMatch)){currentMatchIndex=matchIndex;}','matchIndex++;}};if(newestAtTop){for(i=logEntries.length-1;i>=0;i--){actOnLogEntry(logEntries[i]);}}else{for(i=0,iLen=logEntries.length;i<iLen;i++){actOnLogEntry(logEntries[i]);}}','currentSearch.matches=matches;if(currentMatch){currentMatch.setCurrent();}}else if(scrollToLatest){doScrollToLatest();}}','$("newestAtTop").checked=isNewestAtTop;}','function toggleNewestAtTop(){var isNewestAtTop=$("newestAtTop").checked;setNewestAtTop(isNewestAtTop);}','var scrollToLatest=true;function setScrollToLatest(isScrollToLatest){scrollToLatest=isScrollToLatest;if(scrollToLatest){doScrollToLatest();}','$("scrollToLatest").checked=isScrollToLatest;}','function toggleScrollToLatest(){var isScrollToLatest=$("scrollToLatest").checked;setScrollToLatest(isScrollToLatest);}','function doScrollToLatest(){var l=logMainContainer;if(typeof l.scrollTop!="undefined"){if(newestAtTop){l.scrollTop=0;}else{var latestLogEntry=l.lastChild;if(latestLogEntry){l.scrollTop=l.scrollHeight;}}}}','var closeIfOpenerCloses=true;function setCloseIfOpenerCloses(isCloseIfOpenerCloses){closeIfOpenerCloses=isCloseIfOpenerCloses;}','var maxMessages=null;function setMaxMessages(max){maxMessages=max;pruneLogEntries();}','var showCommandLine=false;function setShowCommandLine(isShowCommandLine){showCommandLine=isShowCommandLine;if(loaded){$("commandLine").style.display=showCommandLine?"block":"none";setCommandInputWidth();setLogContainerHeight();}}','function focusCommandLine(){if(loaded){$("command").focus();}}','function focusSearch(){if(loaded){$("searchBox").focus();}}','function getLogItems(){var items=[];for(var i=0,len=logItems.length;i<len;i++){logItems[i].serialize(items);}','return items;}','function setLogItems(items){var loggingReallyEnabled=loggingEnabled;loggingEnabled=true;for(var i=0,len=items.length;i<len;i++){switch(items[i][0]){case LogItem.serializedItemKeys.LOG_ENTRY:log(items[i][1],items[i][2]);break;case LogItem.serializedItemKeys.GROUP_START:group(items[i][1]);break;case LogItem.serializedItemKeys.GROUP_END:groupEnd();break;}}','loggingEnabled=loggingReallyEnabled;}','function log(logLevel,formattedMessage){if(loggingEnabled){var logEntry=new LogEntry(logLevel,formattedMessage);logEntries.push(logEntry);logEntriesAndSeparators.push(logEntry);logItems.push(logEntry);currentGroup.addChild(logEntry);if(loaded){if(logQueuedEventsTimer!==null){clearTimeout(logQueuedEventsTimer);}','logQueuedEventsTimer=setTimeout(renderQueuedLogItems,renderDelay);unrenderedLogItemsExist=true;}}}','function renderQueuedLogItems(){logQueuedEventsTimer=null;var pruned=pruneLogEntries();var initiallyHasMatches=currentSearch?currentSearch.hasMatches():false;for(var i=0,len=logItems.length;i<len;i++){if(!logItems[i].rendered){logItems[i].render();logItems[i].appendToLog();if(currentSearch&&(logItems[i]instanceof LogEntry)){currentSearch.applyTo(logItems[i]);}}}','if(currentSearch){if(pruned){if(currentSearch.hasVisibleMatches()){if(currentMatchIndex===null){setCurrentMatchIndex(0);}','displayMatches();}else{displayNoMatches();}}else if(!initiallyHasMatches&&currentSearch.hasVisibleMatches()){setCurrentMatchIndex(0);displayMatches();}}','if(scrollToLatest){doScrollToLatest();}','unrenderedLogItemsExist=false;}','function pruneLogEntries(){if((maxMessages!==null)&&(logEntriesAndSeparators.length>maxMessages)){var numberToDelete=logEntriesAndSeparators.length-maxMessages;var prunedLogEntries=logEntriesAndSeparators.slice(0,numberToDelete);if(currentSearch){currentSearch.removeMatches(prunedLogEntries);}','var group;for(var i=0;i<numberToDelete;i++){group=logEntriesAndSeparators[i].group;array_remove(logItems,logEntriesAndSeparators[i]);array_remove(logEntries,logEntriesAndSeparators[i]);logEntriesAndSeparators[i].remove(true,true);if(group.children.length===0&&group!==currentGroup&&group!==rootGroup){array_remove(logItems,group);group.remove(true,true);}}','logEntriesAndSeparators=array_removeFromStart(logEntriesAndSeparators,numberToDelete);return true;}','return false;}','function group(name,startExpanded){if(loggingEnabled){initiallyExpanded=(typeof startExpanded==="undefined")?true:Boolean(startExpanded);var newGroup=new Group(name,false,initiallyExpanded);currentGroup.addChild(newGroup);currentGroup=newGroup;logItems.push(newGroup);if(loaded){if(logQueuedEventsTimer!==null){clearTimeout(logQueuedEventsTimer);}','logQueuedEventsTimer=setTimeout(renderQueuedLogItems,renderDelay);unrenderedLogItemsExist=true;}}}','function groupEnd(){currentGroup=(currentGroup===rootGroup)?rootGroup:currentGroup.group;}','function mainPageReloaded(){currentGroup=rootGroup;var separator=new Separator();logEntriesAndSeparators.push(separator);logItems.push(separator);currentGroup.addChild(separator);}','function closeWindow(){if(appender&&mainWindowExists()){appender.close(true);}else{window.close();}}','function hide(){if(appender&&mainWindowExists()){appender.hide();}}','var mainWindow=window;var windowId="log4javascriptConsoleWindow_"+new Date().getTime()+"_"+(""+Math.random()).substr(2);function setMainWindow(win){mainWindow=win;mainWindow[windowId]=window;if(opener&&closeIfOpenerCloses){pollOpener();}}','function pollOpener(){if(closeIfOpenerCloses){if(mainWindowExists()){setTimeout(pollOpener,500);}else{closeWindow();}}}','function mainWindowExists(){try{return(mainWindow&&!mainWindow.closed&&mainWindow[windowId]==window);}catch(ex){}','return false;}','var logLevels=["TRACE","DEBUG","INFO","WARN","ERROR","FATAL"];function getCheckBox(logLevel){return $("switch_"+logLevel);}','function getIeWrappedLogContainer(){return $("log_wrapped");}','function getIeUnwrappedLogContainer(){return $("log_unwrapped");}','function applyFilters(){for(var i=0;i<logLevels.length;i++){if(getCheckBox(logLevels[i]).checked){addClass(logMainContainer,logLevels[i]);}else{removeClass(logMainContainer,logLevels[i]);}}','updateSearchFromFilters();}','function toggleAllLevels(){var turnOn=$("switch_ALL").checked;for(var i=0;i<logLevels.length;i++){getCheckBox(logLevels[i]).checked=turnOn;if(turnOn){addClass(logMainContainer,logLevels[i]);}else{removeClass(logMainContainer,logLevels[i]);}}}','function checkAllLevels(){for(var i=0;i<logLevels.length;i++){if(!getCheckBox(logLevels[i]).checked){getCheckBox("ALL").checked=false;return;}}','getCheckBox("ALL").checked=true;}','function clearLog(){rootGroup.clear();currentGroup=rootGroup;logEntries=[];logItems=[];logEntriesAndSeparators=[];doSearch();}','function toggleWrap(){var enable=$("wrap").checked;if(enable){addClass(logMainContainer,"wrap");}else{removeClass(logMainContainer,"wrap");}','refreshCurrentMatch();}','var searchTimer=null;function scheduleSearch(){try{clearTimeout(searchTimer);}catch(ex){}','searchTimer=setTimeout(doSearch,500);}','function Search(searchTerm,isRegex,searchRegex,isCaseSensitive){this.searchTerm=searchTerm;this.isRegex=isRegex;this.searchRegex=searchRegex;this.isCaseSensitive=isCaseSensitive;this.matches=[];}','Search.prototype={hasMatches:function(){return this.matches.length>0;},hasVisibleMatches:function(){if(this.hasMatches()){for(var i=0;i<this.matches.length;i++){if(this.matches[i].isVisible()){return true;}}}','return false;},match:function(logEntry){var entryText=String(logEntry.formattedMessage);var matchesSearch=false;if(this.isRegex){matchesSearch=this.searchRegex.test(entryText);}else if(this.isCaseSensitive){matchesSearch=(entryText.indexOf(this.searchTerm)>-1);}else{matchesSearch=(entryText.toLowerCase().indexOf(this.searchTerm.toLowerCase())>-1);}','return matchesSearch;},getNextVisibleMatchIndex:function(){for(var i=currentMatchIndex+1;i<this.matches.length;i++){if(this.matches[i].isVisible()){return i;}}','for(i=0;i<=currentMatchIndex;i++){if(this.matches[i].isVisible()){return i;}}','return-1;},getPreviousVisibleMatchIndex:function(){for(var i=currentMatchIndex-1;i>=0;i--){if(this.matches[i].isVisible()){return i;}}','for(var i=this.matches.length-1;i>=currentMatchIndex;i--){if(this.matches[i].isVisible()){return i;}}','return-1;},applyTo:function(logEntry){var doesMatch=this.match(logEntry);if(doesMatch){logEntry.group.expand();logEntry.setSearchMatch(true);var logEntryContent;var wrappedLogEntryContent;var searchTermReplacementStartTag="<span class=\\\"searchterm\\\">";var searchTermReplacementEndTag="<"+"/span>";var preTagName=isIe?"pre":"span";var preStartTag="<"+preTagName+" class=\\\"pre\\\">";var preEndTag="<"+"/"+preTagName+">";var startIndex=0;var searchIndex,matchedText,textBeforeMatch;if(this.isRegex){var flags=this.isCaseSensitive?"g":"gi";var capturingRegex=new RegExp("("+this.searchRegex.source+")",flags);var rnd=(""+Math.random()).substr(2);var startToken="%%s"+rnd+"%%";var endToken="%%e"+rnd+"%%";logEntryContent=logEntry.formattedMessage.replace(capturingRegex,startToken+"$1"+endToken);logEntryContent=escapeHtml(logEntryContent);var result;var searchString=logEntryContent;logEntryContent="";wrappedLogEntryContent="";while((searchIndex=searchString.indexOf(startToken,startIndex))>-1){var endTokenIndex=searchString.indexOf(endToken,searchIndex);matchedText=searchString.substring(searchIndex+startToken.length,endTokenIndex);textBeforeMatch=searchString.substring(startIndex,searchIndex);logEntryContent+=preStartTag+textBeforeMatch+preEndTag;logEntryContent+=searchTermReplacementStartTag+preStartTag+matchedText+','preEndTag+searchTermReplacementEndTag;if(isIe){wrappedLogEntryContent+=textBeforeMatch+searchTermReplacementStartTag+','matchedText+searchTermReplacementEndTag;}','startIndex=endTokenIndex+endToken.length;}','logEntryContent+=preStartTag+searchString.substr(startIndex)+preEndTag;if(isIe){wrappedLogEntryContent+=searchString.substr(startIndex);}}else{logEntryContent="";wrappedLogEntryContent="";var searchTermReplacementLength=searchTermReplacementStartTag.length+','this.searchTerm.length+searchTermReplacementEndTag.length;var searchTermLength=this.searchTerm.length;var searchTermLowerCase=this.searchTerm.toLowerCase();var logTextLowerCase=logEntry.formattedMessage.toLowerCase();while((searchIndex=logTextLowerCase.indexOf(searchTermLowerCase,startIndex))>-1){matchedText=escapeHtml(logEntry.formattedMessage.substr(searchIndex,this.searchTerm.length));textBeforeMatch=escapeHtml(logEntry.formattedMessage.substring(startIndex,searchIndex));var searchTermReplacement=searchTermReplacementStartTag+','preStartTag+matchedText+preEndTag+searchTermReplacementEndTag;logEntryContent+=preStartTag+textBeforeMatch+preEndTag+searchTermReplacement;if(isIe){wrappedLogEntryContent+=textBeforeMatch+searchTermReplacementStartTag+','matchedText+searchTermReplacementEndTag;}','startIndex=searchIndex+searchTermLength;}','var textAfterLastMatch=escapeHtml(logEntry.formattedMessage.substr(startIndex));logEntryContent+=preStartTag+textAfterLastMatch+preEndTag;if(isIe){wrappedLogEntryContent+=textAfterLastMatch;}}','logEntry.setContent(logEntryContent,wrappedLogEntryContent);var logEntryMatches=logEntry.getSearchMatches();this.matches=this.matches.concat(logEntryMatches);}else{logEntry.setSearchMatch(false);logEntry.setContent(logEntry.formattedMessage,logEntry.formattedMessage);}','return doesMatch;},removeMatches:function(logEntries){var matchesToRemoveCount=0;var currentMatchRemoved=false;var matchesToRemove=[];var i,iLen,j,jLen;for(i=0,iLen=this.matches.length;i<iLen;i++){for(j=0,jLen=logEntries.length;j<jLen;j++){if(this.matches[i].belongsTo(logEntries[j])){matchesToRemove.push(this.matches[i]);if(i===currentMatchIndex){currentMatchRemoved=true;}}}}','var newMatch=currentMatchRemoved?null:this.matches[currentMatchIndex];if(currentMatchRemoved){for(i=currentMatchIndex,iLen=this.matches.length;i<iLen;i++){if(this.matches[i].isVisible()&&!array_contains(matchesToRemove,this.matches[i])){newMatch=this.matches[i];break;}}}','for(i=0,iLen=matchesToRemove.length;i<iLen;i++){array_remove(this.matches,matchesToRemove[i]);matchesToRemove[i].remove();}','if(this.hasVisibleMatches()){if(newMatch===null){setCurrentMatchIndex(0);}else{var newMatchIndex=0;for(i=0,iLen=this.matches.length;i<iLen;i++){if(newMatch===this.matches[i]){newMatchIndex=i;break;}}','setCurrentMatchIndex(newMatchIndex);}}else{currentMatchIndex=null;displayNoMatches();}}};function getPageOffsetTop(el,container){var currentEl=el;var y=0;while(currentEl&&currentEl!=container){y+=currentEl.offsetTop;currentEl=currentEl.offsetParent;}','return y;}','function scrollIntoView(el){var logContainer=logMainContainer;if(!$("wrap").checked){var logContainerLeft=logContainer.scrollLeft;var logContainerRight=logContainerLeft+logContainer.offsetWidth;var elLeft=el.offsetLeft;var elRight=elLeft+el.offsetWidth;if(elLeft<logContainerLeft||elRight>logContainerRight){logContainer.scrollLeft=elLeft-(logContainer.offsetWidth-el.offsetWidth)/2;}}','var logContainerTop=logContainer.scrollTop;var logContainerBottom=logContainerTop+logContainer.offsetHeight;var elTop=getPageOffsetTop(el)-getToolBarsHeight();var elBottom=elTop+el.offsetHeight;if(elTop<logContainerTop||elBottom>logContainerBottom){logContainer.scrollTop=elTop-(logContainer.offsetHeight-el.offsetHeight)/2;}}','function Match(logEntryLevel,spanInMainDiv,spanInUnwrappedPre,spanInWrappedDiv){this.logEntryLevel=logEntryLevel;this.spanInMainDiv=spanInMainDiv;if(isIe){this.spanInUnwrappedPre=spanInUnwrappedPre;this.spanInWrappedDiv=spanInWrappedDiv;}','this.mainSpan=isIe?spanInUnwrappedPre:spanInMainDiv;}','Match.prototype={equals:function(match){return this.mainSpan===match.mainSpan;},setCurrent:function(){if(isIe){addClass(this.spanInUnwrappedPre,"currentmatch");addClass(this.spanInWrappedDiv,"currentmatch");var elementToScroll=$("wrap").checked?this.spanInWrappedDiv:this.spanInUnwrappedPre;scrollIntoView(elementToScroll);}else{addClass(this.spanInMainDiv,"currentmatch");scrollIntoView(this.spanInMainDiv);}},belongsTo:function(logEntry){if(isIe){return isDescendant(this.spanInUnwrappedPre,logEntry.unwrappedPre);}else{return isDescendant(this.spanInMainDiv,logEntry.mainDiv);}},setNotCurrent:function(){if(isIe){removeClass(this.spanInUnwrappedPre,"currentmatch");removeClass(this.spanInWrappedDiv,"currentmatch");}else{removeClass(this.spanInMainDiv,"currentmatch");}},isOrphan:function(){return isOrphan(this.mainSpan);},isVisible:function(){return getCheckBox(this.logEntryLevel).checked;},remove:function(){if(isIe){this.spanInUnwrappedPre=null;this.spanInWrappedDiv=null;}else{this.spanInMainDiv=null;}}};var currentSearch=null;var currentMatchIndex=null;function doSearch(){var searchBox=$("searchBox");var searchTerm=searchBox.value;var isRegex=$("searchRegex").checked;var isCaseSensitive=$("searchCaseSensitive").checked;var i;if(searchTerm===""){$("searchReset").disabled=true;$("searchNav").style.display="none";removeClass(document.body,"searching");removeClass(searchBox,"hasmatches");removeClass(searchBox,"nomatches");for(i=0;i<logEntries.length;i++){logEntries[i].clearSearch();logEntries[i].setContent(logEntries[i].formattedMessage,logEntries[i].formattedMessage);}','currentSearch=null;setLogContainerHeight();}else{$("searchReset").disabled=false;$("searchNav").style.display="block";var searchRegex;var regexValid;if(isRegex){try{searchRegex=isCaseSensitive?new RegExp(searchTerm,"g"):new RegExp(searchTerm,"gi");regexValid=true;replaceClass(searchBox,"validregex","invalidregex");searchBox.title="Valid regex";}catch(ex){regexValid=false;replaceClass(searchBox,"invalidregex","validregex");searchBox.title="Invalid regex: "+(ex.message?ex.message:(ex.description?ex.description:"unknown error"));return;}}else{searchBox.title="";removeClass(searchBox,"validregex");removeClass(searchBox,"invalidregex");}','addClass(document.body,"searching");currentSearch=new Search(searchTerm,isRegex,searchRegex,isCaseSensitive);for(i=0;i<logEntries.length;i++){currentSearch.applyTo(logEntries[i]);}','setLogContainerHeight();if(currentSearch.hasVisibleMatches()){setCurrentMatchIndex(0);displayMatches();}else{displayNoMatches();}}}','function updateSearchFromFilters(){if(currentSearch){if(currentSearch.hasMatches()){if(currentMatchIndex===null){currentMatchIndex=0;}','var currentMatch=currentSearch.matches[currentMatchIndex];if(currentMatch.isVisible()){displayMatches();setCurrentMatchIndex(currentMatchIndex);}else{currentMatch.setNotCurrent();var nextVisibleMatchIndex=currentSearch.getNextVisibleMatchIndex();if(nextVisibleMatchIndex>-1){setCurrentMatchIndex(nextVisibleMatchIndex);displayMatches();}else{displayNoMatches();}}}else{displayNoMatches();}}}','function refreshCurrentMatch(){if(currentSearch&&currentSearch.hasVisibleMatches()){setCurrentMatchIndex(currentMatchIndex);}}','function displayMatches(){replaceClass($("searchBox"),"hasmatches","nomatches");$("searchBox").title=""+currentSearch.matches.length+" matches found";$("searchNav").style.display="block";setLogContainerHeight();}','function displayNoMatches(){replaceClass($("searchBox"),"nomatches","hasmatches");$("searchBox").title="No matches found";$("searchNav").style.display="none";setLogContainerHeight();}','function toggleSearchEnabled(enable){enable=(typeof enable=="undefined")?!$("searchDisable").checked:enable;$("searchBox").disabled=!enable;$("searchReset").disabled=!enable;$("searchRegex").disabled=!enable;$("searchNext").disabled=!enable;$("searchPrevious").disabled=!enable;$("searchCaseSensitive").disabled=!enable;$("searchNav").style.display=(enable&&($("searchBox").value!=="")&&currentSearch&&currentSearch.hasVisibleMatches())?"block":"none";if(enable){removeClass($("search"),"greyedout");addClass(document.body,"searching");if($("searchHighlight").checked){addClass(logMainContainer,"searchhighlight");}else{removeClass(logMainContainer,"searchhighlight");}','if($("searchFilter").checked){addClass(logMainContainer,"searchfilter");}else{removeClass(logMainContainer,"searchfilter");}','$("searchDisable").checked=!enable;}else{addClass($("search"),"greyedout");removeClass(document.body,"searching");removeClass(logMainContainer,"searchhighlight");removeClass(logMainContainer,"searchfilter");}','setLogContainerHeight();}','function toggleSearchFilter(){var enable=$("searchFilter").checked;if(enable){addClass(logMainContainer,"searchfilter");}else{removeClass(logMainContainer,"searchfilter");}','refreshCurrentMatch();}','function toggleSearchHighlight(){var enable=$("searchHighlight").checked;if(enable){addClass(logMainContainer,"searchhighlight");}else{removeClass(logMainContainer,"searchhighlight");}}','function clearSearch(){$("searchBox").value="";doSearch();}','function searchNext(){if(currentSearch!==null&&currentMatchIndex!==null){currentSearch.matches[currentMatchIndex].setNotCurrent();var nextMatchIndex=currentSearch.getNextVisibleMatchIndex();if(nextMatchIndex>currentMatchIndex||confirm("Reached the end of the page. Start from the top?")){setCurrentMatchIndex(nextMatchIndex);}}}','function searchPrevious(){if(currentSearch!==null&&currentMatchIndex!==null){currentSearch.matches[currentMatchIndex].setNotCurrent();var previousMatchIndex=currentSearch.getPreviousVisibleMatchIndex();if(previousMatchIndex<currentMatchIndex||confirm("Reached the start of the page. Continue from the bottom?")){setCurrentMatchIndex(previousMatchIndex);}}}','function setCurrentMatchIndex(index){currentMatchIndex=index;currentSearch.matches[currentMatchIndex].setCurrent();}','function addClass(el,cssClass){if(!hasClass(el,cssClass)){if(el.className){el.className+=" "+cssClass;}else{el.className=cssClass;}}}','function hasClass(el,cssClass){if(el.className){var classNames=el.className.split(" ");return array_contains(classNames,cssClass);}','return false;}','function removeClass(el,cssClass){if(hasClass(el,cssClass)){var existingClasses=el.className.split(" ");var newClasses=[];for(var i=0,len=existingClasses.length;i<len;i++){if(existingClasses[i]!=cssClass){newClasses[newClasses.length]=existingClasses[i];}}','el.className=newClasses.join(" ");}}','function replaceClass(el,newCssClass,oldCssClass){removeClass(el,oldCssClass);addClass(el,newCssClass);}','function getElementsByClass(el,cssClass,tagName){var elements=el.getElementsByTagName(tagName);var matches=[];for(var i=0,len=elements.length;i<len;i++){if(hasClass(elements[i],cssClass)){matches.push(elements[i]);}}','return matches;}','function $(id){return document.getElementById(id);}','function isDescendant(node,ancestorNode){while(node!=null){if(node===ancestorNode){return true;}','node=node.parentNode;}','return false;}','function isOrphan(node){var currentNode=node;while(currentNode){if(currentNode==document.body){return false;}','currentNode=currentNode.parentNode;}','return true;}','function escapeHtml(str){return str.replace(/&/g,"&amp;").replace(/[<]/g,"&lt;").replace(/>/g,"&gt;");}','function getWindowWidth(){if(window.innerWidth){return window.innerWidth;}else if(document.documentElement&&document.documentElement.clientWidth){return document.documentElement.clientWidth;}else if(document.body){return document.body.clientWidth;}','return 0;}','function getWindowHeight(){if(window.innerHeight){return window.innerHeight;}else if(document.documentElement&&document.documentElement.clientHeight){return document.documentElement.clientHeight;}else if(document.body){return document.body.clientHeight;}','return 0;}','function getToolBarsHeight(){return $("switches").offsetHeight;}','function getChromeHeight(){var height=getToolBarsHeight();if(showCommandLine){height+=$("commandLine").offsetHeight;}','return height;}','function setLogContainerHeight(){if(logMainContainer){var windowHeight=getWindowHeight();$("body").style.height=getWindowHeight()+"px";logMainContainer.style.height=""+','Math.max(0,windowHeight-getChromeHeight())+"px";}}','function setCommandInputWidth(){if(showCommandLine){$("command").style.width=""+Math.max(0,$("commandLineContainer").offsetWidth-','($("evaluateButton").offsetWidth+13))+"px";}}','window.onresize=function(){setCommandInputWidth();setLogContainerHeight();};if(!Array.prototype.push){Array.prototype.push=function(){for(var i=0,len=arguments.length;i<len;i++){this[this.length]=arguments[i];}','return this.length;};}','if(!Array.prototype.pop){Array.prototype.pop=function(){if(this.length>0){var val=this[this.length-1];this.length=this.length-1;return val;}};}','if(!Array.prototype.shift){Array.prototype.shift=function(){if(this.length>0){var firstItem=this[0];for(var i=0,len=this.length-1;i<len;i++){this[i]=this[i+1];}','this.length=this.length-1;return firstItem;}};}','if(!Array.prototype.splice){Array.prototype.splice=function(startIndex,deleteCount){var itemsAfterDeleted=this.slice(startIndex+deleteCount);var itemsDeleted=this.slice(startIndex,startIndex+deleteCount);this.length=startIndex;var argumentsArray=[];for(var i=0,len=arguments.length;i<len;i++){argumentsArray[i]=arguments[i];}','var itemsToAppend=(argumentsArray.length>2)?itemsAfterDeleted=argumentsArray.slice(2).concat(itemsAfterDeleted):itemsAfterDeleted;for(i=0,len=itemsToAppend.length;i<len;i++){this.push(itemsToAppend[i]);}','return itemsDeleted;};}','function array_remove(arr,val){var index=-1;for(var i=0,len=arr.length;i<len;i++){if(arr[i]===val){index=i;break;}}','if(index>=0){arr.splice(index,1);return index;}else{return false;}}','function array_removeFromStart(array,numberToRemove){if(Array.prototype.splice){array.splice(0,numberToRemove);}else{for(var i=numberToRemove,len=array.length;i<len;i++){array[i-numberToRemove]=array[i];}','array.length=array.length-numberToRemove;}','return array;}','function array_contains(arr,val){for(var i=0,len=arr.length;i<len;i++){if(arr[i]==val){return true;}}','return false;}','function getErrorMessage(ex){if(ex.message){return ex.message;}else if(ex.description){return ex.description;}','return""+ex;}','function moveCaretToEnd(input){if(input.setSelectionRange){input.focus();var length=input.value.length;input.setSelectionRange(length,length);}else if(input.createTextRange){var range=input.createTextRange();range.collapse(false);range.select();}','input.focus();}','function stopPropagation(evt){if(evt.stopPropagation){evt.stopPropagation();}else if(typeof evt.cancelBubble!="undefined"){evt.cancelBubble=true;}}','function getEvent(evt){return evt?evt:event;}','function getTarget(evt){return evt.target?evt.target:evt.srcElement;}','function getRelatedTarget(evt){if(evt.relatedTarget){return evt.relatedTarget;}else if(evt.srcElement){switch(evt.type){case"mouseover":return evt.fromElement;case"mouseout":return evt.toElement;default:return evt.srcElement;}}}','function cancelKeyEvent(evt){evt.returnValue=false;stopPropagation(evt);}','function evalCommandLine(){var expr=$("command").value;evalCommand(expr);$("command").value="";}','function evalLastCommand(){if(lastCommand!=null){evalCommand(lastCommand);}}','var lastCommand=null;var commandHistory=[];var currentCommandIndex=0;function evalCommand(expr){if(appender){appender.evalCommandAndAppend(expr);}else{var prefix=">>> "+expr+"\\r\\n";try{log("INFO",prefix+eval(expr));}catch(ex){log("ERROR",prefix+"Error: "+getErrorMessage(ex));}}','if(expr!=commandHistory[commandHistory.length-1]){commandHistory.push(expr);if(appender){appender.storeCommandHistory(commandHistory);}}','currentCommandIndex=(expr==commandHistory[currentCommandIndex])?currentCommandIndex+1:commandHistory.length;lastCommand=expr;}','//]]>','</script>','<style type="text/css">','body{background-color:white;color:black;padding:0;margin:0;font-family:tahoma,verdana,arial,helvetica,sans-serif;overflow:hidden}div#switchesContainer input{margin-bottom:0}div.toolbar{border-top:solid #ffffff 1px;border-bottom:solid #aca899 1px;background-color:#f1efe7;padding:3px 5px;font-size:68.75%}div.toolbar,div#search input{font-family:tahoma,verdana,arial,helvetica,sans-serif}div.toolbar input.button{padding:0 5px;font-size:100%}div.toolbar input.hidden{display:none}div#switches input#clearButton{margin-left:20px}div#levels label{font-weight:bold}div#levels label,div#options label{margin-right:5px}div#levels label#wrapLabel{font-weight:normal}div#search label{margin-right:10px}div#search label.searchboxlabel{margin-right:0}div#search input{font-size:100%}div#search input.validregex{color:green}div#search input.invalidregex{color:red}div#search input.nomatches{color:white;background-color:#ff6666}div#search input.nomatches{color:white;background-color:#ff6666}div#searchNav{display:none}div#commandLine{display:none}div#commandLine input#command{font-size:100%;font-family:Courier New,Courier}div#commandLine input#evaluateButton{}*.greyedout{color:gray !important;border-color:gray !important}*.greyedout *.alwaysenabled{color:black}*.unselectable{-khtml-user-select:none;-moz-user-select:none;user-select:none}div#log{font-family:Courier New,Courier;font-size:75%;width:100%;overflow:auto;clear:both;position:relative}div.group{border-color:#cccccc;border-style:solid;border-width:1px 0 1px 1px;overflow:visible}div.oldIe div.group,div.oldIe div.group *,div.oldIe *.logentry{height:1%}div.group div.groupheading span.expander{border:solid black 1px;font-family:Courier New,Courier;font-size:0.833em;background-color:#eeeeee;position:relative;top:-1px;color:black;padding:0 2px;cursor:pointer;cursor:hand;height:1%}div.group div.groupcontent{margin-left:10px;padding-bottom:2px;overflow:visible}div.group div.expanded{display:block}div.group div.collapsed{display:none}*.logentry{overflow:visible;display:none;white-space:pre}span.pre{white-space:pre}pre.unwrapped{display:inline !important}pre.unwrapped pre.pre,div.wrapped pre.pre{display:inline}div.wrapped pre.pre{white-space:normal}div.wrapped{display:none}body.searching *.logentry span.currentmatch{color:white !important;background-color:green !important}body.searching div.searchhighlight *.logentry span.searchterm{color:black;background-color:yellow}div.wrap *.logentry{white-space:normal !important;border-width:0 0 1px 0;border-color:#dddddd;border-style:dotted}div.wrap #log_wrapped,#log_unwrapped{display:block}div.wrap #log_unwrapped,#log_wrapped{display:none}div.wrap *.logentry span.pre{overflow:visible;white-space:normal}div.wrap *.logentry pre.unwrapped{display:none}div.wrap *.logentry span.wrapped{display:inline}div.searchfilter *.searchnonmatch{display:none !important}div#log *.TRACE,label#label_TRACE{color:#666666}div#log *.DEBUG,label#label_DEBUG{color:green}div#log *.INFO,label#label_INFO{color:#000099}div#log *.WARN,label#label_WARN{color:#999900}div#log *.ERROR,label#label_ERROR{color:red}div#log *.FATAL,label#label_FATAL{color:#660066}div.TRACE#log *.TRACE,div.DEBUG#log *.DEBUG,div.INFO#log *.INFO,div.WARN#log *.WARN,div.ERROR#log *.ERROR,div.FATAL#log *.FATAL{display:block}div#log div.separator{background-color:#cccccc;margin:5px 0;line-height:1px}','</style>','</head>','<body id="body">','<div id="switchesContainer">','<div id="switches">','<div id="levels" class="toolbar">','Filters:','<input type="checkbox" id="switch_TRACE" onclick="applyFilters(); checkAllLevels()" checked="checked" title="Show/hide trace messages" /><label for="switch_TRACE" id="label_TRACE">trace</label>','<input type="checkbox" id="switch_DEBUG" onclick="applyFilters(); checkAllLevels()" checked="checked" title="Show/hide debug messages" /><label for="switch_DEBUG" id="label_DEBUG">debug</label>','<input type="checkbox" id="switch_INFO" onclick="applyFilters(); checkAllLevels()" checked="checked" title="Show/hide info messages" /><label for="switch_INFO" id="label_INFO">info</label>','<input type="checkbox" id="switch_WARN" onclick="applyFilters(); checkAllLevels()" checked="checked" title="Show/hide warn messages" /><label for="switch_WARN" id="label_WARN">warn</label>','<input type="checkbox" id="switch_ERROR" onclick="applyFilters(); checkAllLevels()" checked="checked" title="Show/hide error messages" /><label for="switch_ERROR" id="label_ERROR">error</label>','<input type="checkbox" id="switch_FATAL" onclick="applyFilters(); checkAllLevels()" checked="checked" title="Show/hide fatal messages" /><label for="switch_FATAL" id="label_FATAL">fatal</label>','<input type="checkbox" id="switch_ALL" onclick="toggleAllLevels(); applyFilters()" checked="checked" title="Show/hide all messages" /><label for="switch_ALL" id="label_ALL">all</label>','</div>','<div id="search" class="toolbar">','<label for="searchBox" class="searchboxlabel">Search:</label> <input type="text" id="searchBox" onclick="toggleSearchEnabled(true)" onkeyup="scheduleSearch()" size="20" />','<input type="button" id="searchReset" disabled="disabled" value="Reset" onclick="clearSearch()" class="button" title="Reset the search" />','<input type="checkbox" id="searchRegex" onclick="doSearch()" title="If checked, search is treated as a regular expression" /><label for="searchRegex">Regex</label>','<input type="checkbox" id="searchCaseSensitive" onclick="doSearch()" title="If checked, search is case sensitive" /><label for="searchCaseSensitive">Match case</label>','<input type="checkbox" id="searchDisable" onclick="toggleSearchEnabled()" title="Enable/disable search" /><label for="searchDisable" class="alwaysenabled">Disable</label>','<div id="searchNav">','<input type="button" id="searchNext" disabled="disabled" value="Next" onclick="searchNext()" class="button" title="Go to the next matching log entry" />','<input type="button" id="searchPrevious" disabled="disabled" value="Previous" onclick="searchPrevious()" class="button" title="Go to the previous matching log entry" />','<input type="checkbox" id="searchFilter" onclick="toggleSearchFilter()" title="If checked, non-matching log entries are filtered out" /><label for="searchFilter">Filter</label>','<input type="checkbox" id="searchHighlight" onclick="toggleSearchHighlight()" title="Highlight matched search terms" /><label for="searchHighlight" class="alwaysenabled">Highlight all</label>','</div>','</div>','<div id="options" class="toolbar">','Options:','<input type="checkbox" id="enableLogging" onclick="toggleLoggingEnabled()" checked="checked" title="Enable/disable logging" /><label for="enableLogging" id="enableLoggingLabel">Log</label>','<input type="checkbox" id="wrap" onclick="toggleWrap()" title="Enable / disable word wrap" /><label for="wrap" id="wrapLabel">Wrap</label>','<input type="checkbox" id="newestAtTop" onclick="toggleNewestAtTop()" title="If checked, causes newest messages to appear at the top" /><label for="newestAtTop" id="newestAtTopLabel">Newest at the top</label>','<input type="checkbox" id="scrollToLatest" onclick="toggleScrollToLatest()" checked="checked" title="If checked, window automatically scrolls to a new message when it is added" /><label for="scrollToLatest" id="scrollToLatestLabel">Scroll to latest</label>','<input type="button" id="clearButton" value="Clear" onclick="clearLog()" class="button" title="Clear all log messages"  />','<input type="button" id="hideButton" value="Hide" onclick="hide()" class="hidden button" title="Hide the console" />','<input type="button" id="closeButton" value="Close" onclick="closeWindow()" class="hidden button" title="Close the window" />','</div>','</div>','</div>','<div id="log" class="TRACE DEBUG INFO WARN ERROR FATAL"></div>','<div id="commandLine" class="toolbar">','<div id="commandLineContainer">','<input type="text" id="command" title="Enter a JavaScript command here and hit return or press \'Evaluate\'" />','<input type="button" id="evaluateButton" value="Evaluate" class="button" title="Evaluate the command" onclick="evalCommandLine()" />','</div>','</div>','</body>','</html>',''];};var defaultCommandLineFunctions=[];ConsoleAppender=function(){};var consoleAppenderIdCounter=1;ConsoleAppender.prototype=new Appender();ConsoleAppender.prototype.create=function(inPage,container,lazyInit,initiallyMinimized,useDocumentWrite,width,height,focusConsoleWindow){var appender=this;var initialized=false;var consoleWindowCreated=false;var consoleWindowLoaded=false;var consoleClosed=false;var queuedLoggingEvents=[];var isSupported=true;var consoleAppenderId=consoleAppenderIdCounter++;initiallyMinimized=extractBooleanFromParam(initiallyMinimized,this.defaults.initiallyMinimized);lazyInit=extractBooleanFromParam(lazyInit,this.defaults.lazyInit);useDocumentWrite=extractBooleanFromParam(useDocumentWrite,this.defaults.useDocumentWrite);var newestMessageAtTop=this.defaults.newestMessageAtTop;var scrollToLatestMessage=this.defaults.scrollToLatestMessage;width=width?width:this.defaults.width;height=height?height:this.defaults.height;var maxMessages=this.defaults.maxMessages;var showCommandLine=this.defaults.showCommandLine;var commandLineObjectExpansionDepth=this.defaults.commandLineObjectExpansionDepth;var showHideButton=this.defaults.showHideButton;var showCloseButton=this.defaults.showCloseButton;this.setLayout(this.defaults.layout);var init,createWindow,safeToAppend,getConsoleWindow,open;var appenderName=inPage?"InPageAppender":"PopUpAppender";var checkCanConfigure=function(configOptionName){if(consoleWindowCreated){handleError(appenderName+": configuration option '"+configOptionName+"' may not be set after the appender has been initialized");return false;}
return true;};var consoleWindowExists=function(){return(consoleWindowLoaded&&isSupported&&!consoleClosed);};this.isNewestMessageAtTop=function(){return newestMessageAtTop;};this.setNewestMessageAtTop=function(newestMessageAtTopParam){newestMessageAtTop=bool(newestMessageAtTopParam);if(consoleWindowExists()){getConsoleWindow().setNewestAtTop(newestMessageAtTop);}};this.isScrollToLatestMessage=function(){return scrollToLatestMessage;};this.setScrollToLatestMessage=function(scrollToLatestMessageParam){scrollToLatestMessage=bool(scrollToLatestMessageParam);if(consoleWindowExists()){getConsoleWindow().setScrollToLatest(scrollToLatestMessage);}};this.getWidth=function(){return width;};this.setWidth=function(widthParam){if(checkCanConfigure("width")){width=extractStringFromParam(widthParam,width);}};this.getHeight=function(){return height;};this.setHeight=function(heightParam){if(checkCanConfigure("height")){height=extractStringFromParam(heightParam,height);}};this.getMaxMessages=function(){return maxMessages;};this.setMaxMessages=function(maxMessagesParam){maxMessages=extractIntFromParam(maxMessagesParam,maxMessages);if(consoleWindowExists()){getConsoleWindow().setMaxMessages(maxMessages);}};this.isShowCommandLine=function(){return showCommandLine;};this.setShowCommandLine=function(showCommandLineParam){showCommandLine=bool(showCommandLineParam);if(consoleWindowExists()){getConsoleWindow().setShowCommandLine(showCommandLine);}};this.isShowHideButton=function(){return showHideButton;};this.setShowHideButton=function(showHideButtonParam){showHideButton=bool(showHideButtonParam);if(consoleWindowExists()){getConsoleWindow().setShowHideButton(showHideButton);}};this.isShowCloseButton=function(){return showCloseButton;};this.setShowCloseButton=function(showCloseButtonParam){showCloseButton=bool(showCloseButtonParam);if(consoleWindowExists()){getConsoleWindow().setShowCloseButton(showCloseButton);}};this.getCommandLineObjectExpansionDepth=function(){return commandLineObjectExpansionDepth;};this.setCommandLineObjectExpansionDepth=function(commandLineObjectExpansionDepthParam){commandLineObjectExpansionDepth=extractIntFromParam(commandLineObjectExpansionDepthParam,commandLineObjectExpansionDepth);};var minimized=initiallyMinimized;this.isInitiallyMinimized=function(){return initiallyMinimized;};this.setInitiallyMinimized=function(initiallyMinimizedParam){if(checkCanConfigure("initiallyMinimized")){initiallyMinimized=bool(initiallyMinimizedParam);minimized=initiallyMinimized;}};this.isUseDocumentWrite=function(){return useDocumentWrite;};this.setUseDocumentWrite=function(useDocumentWriteParam){if(checkCanConfigure("useDocumentWrite")){useDocumentWrite=bool(useDocumentWriteParam);}};function QueuedLoggingEvent(loggingEvent,formattedMessage){this.loggingEvent=loggingEvent;this.levelName=loggingEvent.level.name;this.formattedMessage=formattedMessage;}
QueuedLoggingEvent.prototype.append=function(){getConsoleWindow().log(this.levelName,this.formattedMessage);};function QueuedGroup(name,initiallyExpanded){this.name=name;this.initiallyExpanded=initiallyExpanded;}
QueuedGroup.prototype.append=function(){getConsoleWindow().group(this.name,this.initiallyExpanded);};function QueuedGroupEnd(){}
QueuedGroupEnd.prototype.append=function(){getConsoleWindow().groupEnd();};var checkAndAppend=function(){safeToAppend();if(!initialized){init();}else if(consoleClosed&&reopenWhenClosed){createWindow();}
if(safeToAppend()){appendQueuedLoggingEvents();}};this.append=function(loggingEvent){if(isSupported){var formattedMessage=appender.getLayout().formatWithException(loggingEvent);queuedLoggingEvents.push(new QueuedLoggingEvent(loggingEvent,formattedMessage));checkAndAppend();}};this.group=function(name,initiallyExpanded){if(isSupported){queuedLoggingEvents.push(new QueuedGroup(name,initiallyExpanded));checkAndAppend();}};this.groupEnd=function(){if(isSupported){queuedLoggingEvents.push(new QueuedGroupEnd());checkAndAppend();}};var appendQueuedLoggingEvents=function(){while(queuedLoggingEvents.length>0){queuedLoggingEvents.shift().append();}
if(focusConsoleWindow){getConsoleWindow().focus();}};this.setAddedToLogger=function(logger){this.loggers.push(logger);if(enabled&&!lazyInit){init();}};this.clear=function(){if(consoleWindowExists()){getConsoleWindow().clearLog();}
queuedLoggingEvents.length=0;};this.focus=function(){if(consoleWindowExists()){getConsoleWindow().focus();}};this.focusCommandLine=function(){if(consoleWindowExists()){getConsoleWindow().focusCommandLine();}};this.focusSearch=function(){if(consoleWindowExists()){getConsoleWindow().focusSearch();}};var commandWindow=window;this.getCommandWindow=function(){return commandWindow;};this.setCommandWindow=function(commandWindowParam){commandWindow=commandWindowParam;};this.executeLastCommand=function(){if(consoleWindowExists()){getConsoleWindow().evalLastCommand();}};var commandLayout=new PatternLayout("%m");this.getCommandLayout=function(){return commandLayout;};this.setCommandLayout=function(commandLayoutParam){commandLayout=commandLayoutParam;};this.evalCommandAndAppend=function(expr){var commandReturnValue={appendResult:true,isError:false};var commandOutput="";try{var result,i;if(!commandWindow.eval&&commandWindow.execScript){commandWindow.execScript("null");}
var commandLineFunctionsHash={};for(i=0,len=commandLineFunctions.length;i<len;i++){commandLineFunctionsHash[commandLineFunctions[i][0]]=commandLineFunctions[i][1];}
var objectsToRestore=[];var addObjectToRestore=function(name){objectsToRestore.push([name,commandWindow[name]]);};addObjectToRestore("appender");commandWindow.appender=appender;addObjectToRestore("commandReturnValue");commandWindow.commandReturnValue=commandReturnValue;addObjectToRestore("commandLineFunctionsHash");commandWindow.commandLineFunctionsHash=commandLineFunctionsHash;var addFunctionToWindow=function(name){addObjectToRestore(name);commandWindow[name]=function(){return this.commandLineFunctionsHash[name](appender,arguments,commandReturnValue);};};for(i=0,len=commandLineFunctions.length;i<len;i++){addFunctionToWindow(commandLineFunctions[i][0]);}
if(commandWindow===window&&commandWindow.execScript){addObjectToRestore("evalExpr");addObjectToRestore("result");window.evalExpr=expr;commandWindow.execScript("window.result=eval(window.evalExpr);");result=window.result;}else{result=commandWindow.eval(expr);}
commandOutput=isUndefined(result)?result:formatObjectExpansion(result,commandLineObjectExpansionDepth);for(i=0,len=objectsToRestore.length;i<len;i++){commandWindow[objectsToRestore[i][0]]=objectsToRestore[i][1];}}catch(ex){commandOutput="Error evaluating command: "+getExceptionStringRep(ex);commandReturnValue.isError=true;}
if(commandReturnValue.appendResult){var message=">>> "+expr;if(!isUndefined(commandOutput)){message+=newLine+commandOutput;}
var level=commandReturnValue.isError?Level.ERROR:Level.INFO;var loggingEvent=new LoggingEvent(null,new Date(),level,[message],null);var mainLayout=this.getLayout();this.setLayout(commandLayout);this.append(loggingEvent);this.setLayout(mainLayout);}};var commandLineFunctions=defaultCommandLineFunctions.concat([]);this.addCommandLineFunction=function(functionName,commandLineFunction){commandLineFunctions.push([functionName,commandLineFunction]);};var commandHistoryCookieName="log4javascriptCommandHistory";this.storeCommandHistory=function(commandHistory){setCookie(commandHistoryCookieName,commandHistory.join(","));};var writeHtml=function(doc){var lines=getConsoleHtmlLines();doc.open();for(var i=0,len=lines.length;i<len;i++){doc.writeln(lines[i]);}
doc.close();};this.setEventTypes(["load","unload"]);var consoleWindowLoadHandler=function(){var win=getConsoleWindow();win.setAppender(appender);win.setNewestAtTop(newestMessageAtTop);win.setScrollToLatest(scrollToLatestMessage);win.setMaxMessages(maxMessages);win.setShowCommandLine(showCommandLine);win.setShowHideButton(showHideButton);win.setShowCloseButton(showCloseButton);win.setMainWindow(window);var storedValue=getCookie(commandHistoryCookieName);if(storedValue){win.commandHistory=storedValue.split(",");win.currentCommandIndex=win.commandHistory.length;}
appender.dispatchEvent("load",{"win":win});};this.unload=function(){logLog.debug("unload "+this+", caller: "+this.unload.caller);if(!consoleClosed){logLog.debug("really doing unload "+this);consoleClosed=true;consoleWindowLoaded=false;consoleWindowCreated=false;appender.dispatchEvent("unload",{});}};var pollConsoleWindow=function(windowTest,interval,successCallback,errorMessage){function doPoll(){try{if(consoleClosed){clearInterval(poll);}
if(windowTest(getConsoleWindow())){clearInterval(poll);successCallback();}}catch(ex){clearInterval(poll);isSupported=false;handleError(errorMessage,ex);}}
var poll=setInterval(doPoll,interval);};var getConsoleUrl=function(){var documentDomainSet=(document.domain!=location.hostname);return useDocumentWrite?"":getBaseUrl()+"console.html"+
(documentDomainSet?"?log4javascript_domain="+escape(document.domain):"");};if(inPage){var containerElement=null;var cssProperties=[];this.addCssProperty=function(name,value){if(checkCanConfigure("cssProperties")){cssProperties.push([name,value]);}};var windowCreationStarted=false;var iframeContainerDiv;var iframeId=uniqueId+"_InPageAppender_"+consoleAppenderId;this.hide=function(){if(initialized&&consoleWindowCreated){if(consoleWindowExists()){getConsoleWindow().$("command").blur();}
iframeContainerDiv.style.display="none";minimized=true;}};this.show=function(){if(initialized){if(consoleWindowCreated){iframeContainerDiv.style.display="block";this.setShowCommandLine(showCommandLine);minimized=false;}else if(!windowCreationStarted){createWindow(true);}}};this.isVisible=function(){return!minimized&&!consoleClosed;};this.close=function(fromButton){if(!consoleClosed&&(!fromButton||confirm("This will permanently remove the console from the page. No more messages will be logged. Do you wish to continue?"))){iframeContainerDiv.parentNode.removeChild(iframeContainerDiv);this.unload();}};open=function(){var initErrorMessage="InPageAppender.open: unable to create console iframe";function finalInit(){try{if(!initiallyMinimized){appender.show();}
consoleWindowLoadHandler();consoleWindowLoaded=true;appendQueuedLoggingEvents();}catch(ex){isSupported=false;handleError(initErrorMessage,ex);}}
function writeToDocument(){try{var windowTest=function(win){return isLoaded(win);};if(useDocumentWrite){writeHtml(getConsoleWindow().document);}
if(windowTest(getConsoleWindow())){finalInit();}else{pollConsoleWindow(windowTest,100,finalInit,initErrorMessage);}}catch(ex){isSupported=false;handleError(initErrorMessage,ex);}}
minimized=false;iframeContainerDiv=containerElement.appendChild(document.createElement("div"));iframeContainerDiv.style.width=width;iframeContainerDiv.style.height=height;iframeContainerDiv.style.border="solid gray 1px";for(var i=0,len=cssProperties.length;i<len;i++){iframeContainerDiv.style[cssProperties[i][0]]=cssProperties[i][1];}
var iframeSrc=useDocumentWrite?"":" src='"+getConsoleUrl()+"'";iframeContainerDiv.innerHTML="<iframe id='"+iframeId+"' name='"+iframeId+"' width='100%' height='100%' frameborder='0'"+iframeSrc+" scrolling='no'></iframe>";consoleClosed=false;var iframeDocumentExistsTest=function(win){try{return bool(win)&&bool(win.document);}catch(ex){return false;}};if(iframeDocumentExistsTest(getConsoleWindow())){writeToDocument();}else{pollConsoleWindow(iframeDocumentExistsTest,100,writeToDocument,initErrorMessage);}
consoleWindowCreated=true;};createWindow=function(show){if(show||!initiallyMinimized){var pageLoadHandler=function(){if(!container){containerElement=document.createElement("div");containerElement.style.position="fixed";containerElement.style.left="0";containerElement.style.right="0";containerElement.style.bottom="0";document.body.appendChild(containerElement);appender.addCssProperty("borderWidth","1px 0 0 0");appender.addCssProperty("zIndex",1000000);open();}else{try{var el=document.getElementById(container);if(el.nodeType==1){containerElement=el;}
open();}catch(ex){handleError("InPageAppender.init: invalid container element '"+container+"' supplied",ex);}}};if(pageLoaded&&container&&container.appendChild){containerElement=container;open();}else if(pageLoaded){pageLoadHandler();}else{log4javascript.addEventListener("load",pageLoadHandler);}
windowCreationStarted=true;}};init=function(){createWindow();initialized=true;};getConsoleWindow=function(){var iframe=window.frames[iframeId];if(iframe){return iframe;}};safeToAppend=function(){if(isSupported&&!consoleClosed){if(consoleWindowCreated&&!consoleWindowLoaded&&getConsoleWindow()&&isLoaded(getConsoleWindow())){consoleWindowLoaded=true;}
return consoleWindowLoaded;}
return false;};}else{var useOldPopUp=appender.defaults.useOldPopUp;var complainAboutPopUpBlocking=appender.defaults.complainAboutPopUpBlocking;var reopenWhenClosed=this.defaults.reopenWhenClosed;this.isUseOldPopUp=function(){return useOldPopUp;};this.setUseOldPopUp=function(useOldPopUpParam){if(checkCanConfigure("useOldPopUp")){useOldPopUp=bool(useOldPopUpParam);}};this.isComplainAboutPopUpBlocking=function(){return complainAboutPopUpBlocking;};this.setComplainAboutPopUpBlocking=function(complainAboutPopUpBlockingParam){if(checkCanConfigure("complainAboutPopUpBlocking")){complainAboutPopUpBlocking=bool(complainAboutPopUpBlockingParam);}};this.isFocusPopUp=function(){return focusConsoleWindow;};this.setFocusPopUp=function(focusPopUpParam){focusConsoleWindow=bool(focusPopUpParam);};this.isReopenWhenClosed=function(){return reopenWhenClosed;};this.setReopenWhenClosed=function(reopenWhenClosedParam){reopenWhenClosed=bool(reopenWhenClosedParam);};this.close=function(){logLog.debug("close "+this);try{popUp.close();this.unload();}catch(ex){}};this.hide=function(){logLog.debug("hide "+this);if(consoleWindowExists()){this.close();}};this.show=function(){logLog.debug("show "+this);if(!consoleWindowCreated){open();}};this.isVisible=function(){return safeToAppend();};var popUp;open=function(){var windowProperties="width="+width+",height="+height+",status,resizable";var frameInfo="";try{var frameEl=window.frameElement;if(frameEl){frameInfo="_"+frameEl.tagName+"_"+(frameEl.name||frameEl.id||"");}}catch(e){frameInfo="_inaccessibleParentFrame";}
var windowName="PopUp_"+location.host.replace(/[^a-z0-9]/gi,"_")+"_"+consoleAppenderId+frameInfo;if(!useOldPopUp||!useDocumentWrite){windowName=windowName+"_"+uniqueId;}
var checkPopUpClosed=function(win){if(consoleClosed){return true;}else{try{return bool(win)&&win.closed;}catch(ex){}}
return false;};var popUpClosedCallback=function(){if(!consoleClosed){appender.unload();}};function finalInit(){getConsoleWindow().setCloseIfOpenerCloses(!useOldPopUp||!useDocumentWrite);consoleWindowLoadHandler();consoleWindowLoaded=true;appendQueuedLoggingEvents();pollConsoleWindow(checkPopUpClosed,500,popUpClosedCallback,"PopUpAppender.checkPopUpClosed: error checking pop-up window");}
try{popUp=window.open(getConsoleUrl(),windowName,windowProperties);consoleClosed=false;consoleWindowCreated=true;if(popUp&&popUp.document){if(useDocumentWrite&&useOldPopUp&&isLoaded(popUp)){popUp.mainPageReloaded();finalInit();}else{if(useDocumentWrite){writeHtml(popUp.document);}
var popUpLoadedTest=function(win){return bool(win)&&isLoaded(win);};if(isLoaded(popUp)){finalInit();}else{pollConsoleWindow(popUpLoadedTest,100,finalInit,"PopUpAppender.init: unable to create console window");}}}else{isSupported=false;logLog.warn("PopUpAppender.init: pop-ups blocked, please unblock to use PopUpAppender");if(complainAboutPopUpBlocking){handleError("log4javascript: pop-up windows appear to be blocked. Please unblock them to use pop-up logging.");}}}catch(ex){handleError("PopUpAppender.init: error creating pop-up",ex);}};createWindow=function(){if(!initiallyMinimized){open();}};init=function(){createWindow();initialized=true;};getConsoleWindow=function(){return popUp;};safeToAppend=function(){if(isSupported&&!isUndefined(popUp)&&!consoleClosed){if(popUp.closed||(consoleWindowLoaded&&isUndefined(popUp.closed))){appender.unload();logLog.debug("PopUpAppender: pop-up closed");return false;}
if(!consoleWindowLoaded&&isLoaded(popUp)){consoleWindowLoaded=true;}}
return isSupported&&consoleWindowLoaded&&!consoleClosed;};}
this.getConsoleWindow=getConsoleWindow;};ConsoleAppender.addGlobalCommandLineFunction=function(functionName,commandLineFunction){defaultCommandLineFunctions.push([functionName,commandLineFunction]);};function PopUpAppender(lazyInit,initiallyMinimized,useDocumentWrite,width,height){this.create(false,null,lazyInit,initiallyMinimized,useDocumentWrite,width,height,this.defaults.focusPopUp);}
PopUpAppender.prototype=new ConsoleAppender();PopUpAppender.prototype.defaults={layout:new PatternLayout("%d{HH:mm:ss} %-5p - %m{1}%n"),initiallyMinimized:false,focusPopUp:false,lazyInit:true,useOldPopUp:true,complainAboutPopUpBlocking:true,newestMessageAtTop:false,scrollToLatestMessage:true,width:"600",height:"400",reopenWhenClosed:false,maxMessages:null,showCommandLine:true,commandLineObjectExpansionDepth:1,showHideButton:false,showCloseButton:true,useDocumentWrite:true};PopUpAppender.prototype.toString=function(){return"PopUpAppender";};log4javascript.PopUpAppender=PopUpAppender;function InPageAppender(container,lazyInit,initiallyMinimized,useDocumentWrite,width,height){this.create(true,container,lazyInit,initiallyMinimized,useDocumentWrite,width,height,false);}
InPageAppender.prototype=new ConsoleAppender();InPageAppender.prototype.defaults={layout:new PatternLayout("%d{HH:mm:ss} %-5p - %m{1}%n"),initiallyMinimized:false,lazyInit:true,newestMessageAtTop:false,scrollToLatestMessage:true,width:"100%",height:"220px",maxMessages:null,showCommandLine:true,commandLineObjectExpansionDepth:1,showHideButton:false,showCloseButton:false,showLogEntryDeleteButtons:true,useDocumentWrite:true};InPageAppender.prototype.toString=function(){return"InPageAppender";};log4javascript.InPageAppender=InPageAppender;log4javascript.InlineAppender=InPageAppender;})();function padWithSpaces(str,len){if(str.length<len){var spaces=[];var numberOfSpaces=Math.max(0,len-str.length);for(var i=0;i<numberOfSpaces;i++){spaces[i]=" ";}
str+=spaces.join("");}
return str;}
(function(){function dir(obj){var maxLen=0;for(var p in obj){maxLen=Math.max(toStr(p).length,maxLen);}
var propList=[];for(p in obj){var propNameStr="  "+padWithSpaces(toStr(p),maxLen+2);var propVal;try{propVal=splitIntoLines(toStr(obj[p])).join(padWithSpaces(newLine,maxLen+6));}catch(ex){propVal="[Error obtaining property. Details: "+getExceptionMessage(ex)+"]";}
propList.push(propNameStr+propVal);}
return propList.join(newLine);}
var nodeTypes={ELEMENT_NODE:1,ATTRIBUTE_NODE:2,TEXT_NODE:3,CDATA_SECTION_NODE:4,ENTITY_REFERENCE_NODE:5,ENTITY_NODE:6,PROCESSING_INSTRUCTION_NODE:7,COMMENT_NODE:8,DOCUMENT_NODE:9,DOCUMENT_TYPE_NODE:10,DOCUMENT_FRAGMENT_NODE:11,NOTATION_NODE:12};var preFormattedElements=["script","pre"];var emptyElements=["br","img","hr","param","link","area","input","col","base","meta"];var indentationUnit="  ";function getXhtml(rootNode,includeRootNode,indentation,startNewLine,preformatted){includeRootNode=(typeof includeRootNode=="undefined")?true:!!includeRootNode;if(typeof indentation!="string"){indentation="";}
startNewLine=!!startNewLine;preformatted=!!preformatted;var xhtml;function isWhitespace(node){return((node.nodeType==nodeTypes.TEXT_NODE)&&/^[ \t\r\n]*$/.test(node.nodeValue));}
function fixAttributeValue(attrValue){return attrValue.toString().replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;");}
function getStyleAttributeValue(el){var stylePairs=el.style.cssText.split(";");var styleValue="";for(var j=0,len=stylePairs.length;j<len;j++){var nameValueBits=stylePairs[j].split(":");var props=[];if(!/^\s*$/.test(nameValueBits[0])){props.push(trim(nameValueBits[0]).toLowerCase()+":"+trim(nameValueBits[1]));}
styleValue=props.join(";");}
return styleValue;}
function getNamespace(el){if(el.prefix){return el.prefix;}else if(el.outerHTML){var regex=new RegExp("<([^:]+):"+el.tagName+"[^>]*>","i");if(regex.test(el.outerHTML)){return RegExp.$1.toLowerCase();}}
return"";}
var lt="<";var gt=">";var i,len;if(includeRootNode&&rootNode.nodeType!=nodeTypes.DOCUMENT_FRAGMENT_NODE){switch(rootNode.nodeType){case nodeTypes.ELEMENT_NODE:var tagName=rootNode.tagName.toLowerCase();xhtml=startNewLine?newLine+indentation:"";xhtml+=lt;var prefix=getNamespace(rootNode);var hasPrefix=!!prefix;if(hasPrefix){xhtml+=prefix+":";}
xhtml+=tagName;for(i=0,len=rootNode.attributes.length;i<len;i++){var currentAttr=rootNode.attributes[i];if(!currentAttr.specified||currentAttr.nodeValue===null||currentAttr.nodeName.toLowerCase()==="style"||typeof currentAttr.nodeValue!=="string"||currentAttr.nodeName.indexOf("_moz")===0){continue;}
xhtml+=" "+currentAttr.nodeName.toLowerCase()+"=\"";xhtml+=fixAttributeValue(currentAttr.nodeValue);xhtml+="\"";}
if(rootNode.style.cssText){var styleValue=getStyleAttributeValue(rootNode);if(styleValue!==""){xhtml+=" style=\""+getStyleAttributeValue(rootNode)+"\"";}}
if(array_contains(emptyElements,tagName)||(hasPrefix&&!rootNode.hasChildNodes())){xhtml+="/"+gt;}else{xhtml+=gt;var childStartNewLine=!(rootNode.childNodes.length===1&&rootNode.childNodes[0].nodeType===nodeTypes.TEXT_NODE);var childPreformatted=array_contains(preFormattedElements,tagName);for(i=0,len=rootNode.childNodes.length;i<len;i++){xhtml+=getXhtml(rootNode.childNodes[i],true,indentation+indentationUnit,childStartNewLine,childPreformatted);}
var endTag=lt+"/"+tagName+gt;xhtml+=childStartNewLine?newLine+indentation+endTag:endTag;}
return xhtml;case nodeTypes.TEXT_NODE:if(isWhitespace(rootNode)){xhtml="";}else{if(preformatted){xhtml=rootNode.nodeValue;}else{var lines=splitIntoLines(trim(rootNode.nodeValue));var trimmedLines=[];for(i=0,len=lines.length;i<len;i++){trimmedLines[i]=trim(lines[i]);}
xhtml=trimmedLines.join(newLine+indentation);}
if(startNewLine){xhtml=newLine+indentation+xhtml;}}
return xhtml;case nodeTypes.CDATA_SECTION_NODE:return"<![CDA"+"TA["+rootNode.nodeValue+"]"+"]>"+newLine;case nodeTypes.DOCUMENT_NODE:xhtml="";for(i=0,len=rootNode.childNodes.length;i<len;i++){xhtml+=getXhtml(rootNode.childNodes[i],true,indentation);}
return xhtml;default:return"";}}else{xhtml="";for(i=0,len=rootNode.childNodes.length;i<len;i++){xhtml+=getXhtml(rootNode.childNodes[i],true,indentation+indentationUnit);}
return xhtml;}}
function createCommandLineFunctions(){ConsoleAppender.addGlobalCommandLineFunction("$",function(appender,args,returnValue){return document.getElementById(args[0]);});ConsoleAppender.addGlobalCommandLineFunction("dir",function(appender,args,returnValue){var lines=[];for(var i=0,len=args.length;i<len;i++){lines[i]=dir(args[i]);}
return lines.join(newLine+newLine);});ConsoleAppender.addGlobalCommandLineFunction("dirxml",function(appender,args,returnValue){var lines=[];for(var i=0,len=args.length;i<len;i++){lines[i]=getXhtml(args[i]);}
return lines.join(newLine+newLine);});ConsoleAppender.addGlobalCommandLineFunction("cd",function(appender,args,returnValue){var win,message;if(args.length===0||args[0]===""){win=window;message="Command line set to run in main window";}else{if(args[0].window==args[0]){win=args[0];message="Command line set to run in frame '"+args[0].name+"'";}else{win=window.frames[args[0]];if(win){message="Command line set to run in frame '"+args[0]+"'";}else{returnValue.isError=true;message="Frame '"+args[0]+"' does not exist";win=appender.getCommandWindow();}}}
appender.setCommandWindow(win);return message;});ConsoleAppender.addGlobalCommandLineFunction("clear",function(appender,args,returnValue){returnValue.appendResult=false;appender.clear();});ConsoleAppender.addGlobalCommandLineFunction("keys",function(appender,args,returnValue){var keys=[];for(var k in args[0]){keys.push(k);}
return keys;});ConsoleAppender.addGlobalCommandLineFunction("values",function(appender,args,returnValue){var values=[];for(var k in args[0]){try{values.push(args[0][k]);}catch(ex){logLog.warn("values(): Unable to obtain value for key "+k+". Details: "+getExceptionMessage(ex));}}
return values;});ConsoleAppender.addGlobalCommandLineFunction("expansionDepth",function(appender,args,returnValue){var expansionDepth=parseInt(args[0],10);if(isNaN(expansionDepth)||expansionDepth<0){returnValue.isError=true;return""+args[0]+" is not a valid expansion depth";}else{appender.setCommandLineObjectExpansionDepth(expansionDepth);return"Object expansion depth set to "+expansionDepth;}});}
function init(){createCommandLineFunctions();}
init();})();function createDefaultLogger(){var logger=log4javascript.getLogger(defaultLoggerName);var a=new log4javascript.PopUpAppender();logger.addAppender(a);return logger;}
log4javascript.setDocumentReady=function(){pageLoaded=true;log4javascript.dispatchEvent("load",{});};if(window.addEventListener){window.addEventListener("load",log4javascript.setDocumentReady,false);}else if(window.attachEvent){window.attachEvent("onload",log4javascript.setDocumentReady);}else{var oldOnload=window.onload;if(typeof window.onload!="function"){window.onload=log4javascript.setDocumentReady;}else{window.onload=function(evt){if(oldOnload){oldOnload(evt);}
log4javascript.setDocumentReady();};}}
return log4javascript;},this);


/***/ }),

/***/ 7503:
/***/ (function(module, exports, __webpack_require__) {

/* module decorator */ module = __webpack_require__.nmd(module);
var __WEBPACK_AMD_DEFINE_RESULT__;/*!
 * Platform.js v1.3.6
 * Copyright 2014-2020 Benjamin Tan
 * Copyright 2011-2013 John-David Dalton
 * Available under MIT license
 */
;(function() {
  'use strict';

  /** Used to determine if values are of the language type `Object`. */
  var objectTypes = {
    'function': true,
    'object': true
  };

  /** Used as a reference to the global object. */
  var root = (objectTypes[typeof window] && window) || this;

  /** Backup possible global object. */
  var oldRoot = root;

  /** Detect free variable `exports`. */
  var freeExports = objectTypes[typeof exports] && exports;

  /** Detect free variable `module`. */
  var freeModule = objectTypes["object"] && module && !module.nodeType && module;

  /** Detect free variable `global` from Node.js or Browserified code and use it as `root`. */
  var freeGlobal = freeExports && freeModule && typeof __webpack_require__.g == 'object' && __webpack_require__.g;
  if (freeGlobal && (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal || freeGlobal.self === freeGlobal)) {
    root = freeGlobal;
  }

  /**
   * Used as the maximum length of an array-like object.
   * See the [ES6 spec](http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength)
   * for more details.
   */
  var maxSafeInteger = Math.pow(2, 53) - 1;

  /** Regular expression to detect Opera. */
  var reOpera = /\bOpera/;

  /** Possible global object. */
  var thisBinding = this;

  /** Used for native method references. */
  var objectProto = Object.prototype;

  /** Used to check for own properties of an object. */
  var hasOwnProperty = objectProto.hasOwnProperty;

  /** Used to resolve the internal `[[Class]]` of values. */
  var toString = objectProto.toString;

  /*--------------------------------------------------------------------------*/

  /**
   * Capitalizes a string value.
   *
   * @private
   * @param {string} string The string to capitalize.
   * @returns {string} The capitalized string.
   */
  function capitalize(string) {
    string = String(string);
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  /**
   * A utility function to clean up the OS name.
   *
   * @private
   * @param {string} os The OS name to clean up.
   * @param {string} [pattern] A `RegExp` pattern matching the OS name.
   * @param {string} [label] A label for the OS.
   */
  function cleanupOS(os, pattern, label) {
    // Platform tokens are defined at:
    // http://msdn.microsoft.com/en-us/library/ms537503(VS.85).aspx
    // http://web.archive.org/web/20081122053950/http://msdn.microsoft.com/en-us/library/ms537503(VS.85).aspx
    var data = {
      '10.0': '10',
      '6.4':  '10 Technical Preview',
      '6.3':  '8.1',
      '6.2':  '8',
      '6.1':  'Server 2008 R2 / 7',
      '6.0':  'Server 2008 / Vista',
      '5.2':  'Server 2003 / XP 64-bit',
      '5.1':  'XP',
      '5.01': '2000 SP1',
      '5.0':  '2000',
      '4.0':  'NT',
      '4.90': 'ME'
    };
    // Detect Windows version from platform tokens.
    if (pattern && label && /^Win/i.test(os) && !/^Windows Phone /i.test(os) &&
        (data = data[/[\d.]+$/.exec(os)])) {
      os = 'Windows ' + data;
    }
    // Correct character case and cleanup string.
    os = String(os);

    if (pattern && label) {
      os = os.replace(RegExp(pattern, 'i'), label);
    }

    os = format(
      os.replace(/ ce$/i, ' CE')
        .replace(/\bhpw/i, 'web')
        .replace(/\bMacintosh\b/, 'Mac OS')
        .replace(/_PowerPC\b/i, ' OS')
        .replace(/\b(OS X) [^ \d]+/i, '$1')
        .replace(/\bMac (OS X)\b/, '$1')
        .replace(/\/(\d)/, ' $1')
        .replace(/_/g, '.')
        .replace(/(?: BePC|[ .]*fc[ \d.]+)$/i, '')
        .replace(/\bx86\.64\b/gi, 'x86_64')
        .replace(/\b(Windows Phone) OS\b/, '$1')
        .replace(/\b(Chrome OS \w+) [\d.]+\b/, '$1')
        .split(' on ')[0]
    );

    return os;
  }

  /**
   * An iteration utility for arrays and objects.
   *
   * @private
   * @param {Array|Object} object The object to iterate over.
   * @param {Function} callback The function called per iteration.
   */
  function each(object, callback) {
    var index = -1,
        length = object ? object.length : 0;

    if (typeof length == 'number' && length > -1 && length <= maxSafeInteger) {
      while (++index < length) {
        callback(object[index], index, object);
      }
    } else {
      forOwn(object, callback);
    }
  }

  /**
   * Trim and conditionally capitalize string values.
   *
   * @private
   * @param {string} string The string to format.
   * @returns {string} The formatted string.
   */
  function format(string) {
    string = trim(string);
    return /^(?:webOS|i(?:OS|P))/.test(string)
      ? string
      : capitalize(string);
  }

  /**
   * Iterates over an object's own properties, executing the `callback` for each.
   *
   * @private
   * @param {Object} object The object to iterate over.
   * @param {Function} callback The function executed per own property.
   */
  function forOwn(object, callback) {
    for (var key in object) {
      if (hasOwnProperty.call(object, key)) {
        callback(object[key], key, object);
      }
    }
  }

  /**
   * Gets the internal `[[Class]]` of a value.
   *
   * @private
   * @param {*} value The value.
   * @returns {string} The `[[Class]]`.
   */
  function getClassOf(value) {
    return value == null
      ? capitalize(value)
      : toString.call(value).slice(8, -1);
  }

  /**
   * Host objects can return type values that are different from their actual
   * data type. The objects we are concerned with usually return non-primitive
   * types of "object", "function", or "unknown".
   *
   * @private
   * @param {*} object The owner of the property.
   * @param {string} property The property to check.
   * @returns {boolean} Returns `true` if the property value is a non-primitive, else `false`.
   */
  function isHostType(object, property) {
    var type = object != null ? typeof object[property] : 'number';
    return !/^(?:boolean|number|string|undefined)$/.test(type) &&
      (type == 'object' ? !!object[property] : true);
  }

  /**
   * Prepares a string for use in a `RegExp` by making hyphens and spaces optional.
   *
   * @private
   * @param {string} string The string to qualify.
   * @returns {string} The qualified string.
   */
  function qualify(string) {
    return String(string).replace(/([ -])(?!$)/g, '$1?');
  }

  /**
   * A bare-bones `Array#reduce` like utility function.
   *
   * @private
   * @param {Array} array The array to iterate over.
   * @param {Function} callback The function called per iteration.
   * @returns {*} The accumulated result.
   */
  function reduce(array, callback) {
    var accumulator = null;
    each(array, function(value, index) {
      accumulator = callback(accumulator, value, index, array);
    });
    return accumulator;
  }

  /**
   * Removes leading and trailing whitespace from a string.
   *
   * @private
   * @param {string} string The string to trim.
   * @returns {string} The trimmed string.
   */
  function trim(string) {
    return String(string).replace(/^ +| +$/g, '');
  }

  /*--------------------------------------------------------------------------*/

  /**
   * Creates a new platform object.
   *
   * @memberOf platform
   * @param {Object|string} [ua=navigator.userAgent] The user agent string or
   *  context object.
   * @returns {Object} A platform object.
   */
  function parse(ua) {

    /** The environment context object. */
    var context = root;

    /** Used to flag when a custom context is provided. */
    var isCustomContext = ua && typeof ua == 'object' && getClassOf(ua) != 'String';

    // Juggle arguments.
    if (isCustomContext) {
      context = ua;
      ua = null;
    }

    /** Browser navigator object. */
    var nav = context.navigator || {};

    /** Browser user agent string. */
    var userAgent = nav.userAgent || '';

    ua || (ua = userAgent);

    /** Used to flag when `thisBinding` is the [ModuleScope]. */
    var isModuleScope = isCustomContext || thisBinding == oldRoot;

    /** Used to detect if browser is like Chrome. */
    var likeChrome = isCustomContext
      ? !!nav.likeChrome
      : /\bChrome\b/.test(ua) && !/internal|\n/i.test(toString.toString());

    /** Internal `[[Class]]` value shortcuts. */
    var objectClass = 'Object',
        airRuntimeClass = isCustomContext ? objectClass : 'ScriptBridgingProxyObject',
        enviroClass = isCustomContext ? objectClass : 'Environment',
        javaClass = (isCustomContext && context.java) ? 'JavaPackage' : getClassOf(context.java),
        phantomClass = isCustomContext ? objectClass : 'RuntimeObject';

    /** Detect Java environments. */
    var java = /\bJava/.test(javaClass) && context.java;

    /** Detect Rhino. */
    var rhino = java && getClassOf(context.environment) == enviroClass;

    /** A character to represent alpha. */
    var alpha = java ? 'a' : '\u03b1';

    /** A character to represent beta. */
    var beta = java ? 'b' : '\u03b2';

    /** Browser document object. */
    var doc = context.document || {};

    /**
     * Detect Opera browser (Presto-based).
     * http://www.howtocreate.co.uk/operaStuff/operaObject.html
     * http://dev.opera.com/articles/view/opera-mini-web-content-authoring-guidelines/#operamini
     */
    var opera = context.operamini || context.opera;

    /** Opera `[[Class]]`. */
    var operaClass = reOpera.test(operaClass = (isCustomContext && opera) ? opera['[[Class]]'] : getClassOf(opera))
      ? operaClass
      : (opera = null);

    /*------------------------------------------------------------------------*/

    /** Temporary variable used over the script's lifetime. */
    var data;

    /** The CPU architecture. */
    var arch = ua;

    /** Platform description array. */
    var description = [];

    /** Platform alpha/beta indicator. */
    var prerelease = null;

    /** A flag to indicate that environment features should be used to resolve the platform. */
    var useFeatures = ua == userAgent;

    /** The browser/environment version. */
    var version = useFeatures && opera && typeof opera.version == 'function' && opera.version();

    /** A flag to indicate if the OS ends with "/ Version" */
    var isSpecialCasedOS;

    /* Detectable layout engines (order is important). */
    var layout = getLayout([
      { 'label': 'EdgeHTML', 'pattern': 'Edge' },
      'Trident',
      { 'label': 'WebKit', 'pattern': 'AppleWebKit' },
      'iCab',
      'Presto',
      'NetFront',
      'Tasman',
      'KHTML',
      'Gecko'
    ]);

    /* Detectable browser names (order is important). */
    var name = getName([
      'Adobe AIR',
      'Arora',
      'Avant Browser',
      'Breach',
      'Camino',
      'Electron',
      'Epiphany',
      'Fennec',
      'Flock',
      'Galeon',
      'GreenBrowser',
      'iCab',
      'Iceweasel',
      'K-Meleon',
      'Konqueror',
      'Lunascape',
      'Maxthon',
      { 'label': 'Microsoft Edge', 'pattern': '(?:Edge|Edg|EdgA|EdgiOS)' },
      'Midori',
      'Nook Browser',
      'PaleMoon',
      'PhantomJS',
      'Raven',
      'Rekonq',
      'RockMelt',
      { 'label': 'Samsung Internet', 'pattern': 'SamsungBrowser' },
      'SeaMonkey',
      { 'label': 'Silk', 'pattern': '(?:Cloud9|Silk-Accelerated)' },
      'Sleipnir',
      'SlimBrowser',
      { 'label': 'SRWare Iron', 'pattern': 'Iron' },
      'Sunrise',
      'Swiftfox',
      'Vivaldi',
      'Waterfox',
      'WebPositive',
      { 'label': 'Yandex Browser', 'pattern': 'YaBrowser' },
      { 'label': 'UC Browser', 'pattern': 'UCBrowser' },
      'Opera Mini',
      { 'label': 'Opera Mini', 'pattern': 'OPiOS' },
      'Opera',
      { 'label': 'Opera', 'pattern': 'OPR' },
      'Chromium',
      'Chrome',
      { 'label': 'Chrome', 'pattern': '(?:HeadlessChrome)' },
      { 'label': 'Chrome Mobile', 'pattern': '(?:CriOS|CrMo)' },
      { 'label': 'Firefox', 'pattern': '(?:Firefox|Minefield)' },
      { 'label': 'Firefox for iOS', 'pattern': 'FxiOS' },
      { 'label': 'IE', 'pattern': 'IEMobile' },
      { 'label': 'IE', 'pattern': 'MSIE' },
      'Safari'
    ]);

    /* Detectable products (order is important). */
    var product = getProduct([
      { 'label': 'BlackBerry', 'pattern': 'BB10' },
      'BlackBerry',
      { 'label': 'Galaxy S', 'pattern': 'GT-I9000' },
      { 'label': 'Galaxy S2', 'pattern': 'GT-I9100' },
      { 'label': 'Galaxy S3', 'pattern': 'GT-I9300' },
      { 'label': 'Galaxy S4', 'pattern': 'GT-I9500' },
      { 'label': 'Galaxy S5', 'pattern': 'SM-G900' },
      { 'label': 'Galaxy S6', 'pattern': 'SM-G920' },
      { 'label': 'Galaxy S6 Edge', 'pattern': 'SM-G925' },
      { 'label': 'Galaxy S7', 'pattern': 'SM-G930' },
      { 'label': 'Galaxy S7 Edge', 'pattern': 'SM-G935' },
      'Google TV',
      'Lumia',
      'iPad',
      'iPod',
      'iPhone',
      'Kindle',
      { 'label': 'Kindle Fire', 'pattern': '(?:Cloud9|Silk-Accelerated)' },
      'Nexus',
      'Nook',
      'PlayBook',
      'PlayStation Vita',
      'PlayStation',
      'TouchPad',
      'Transformer',
      { 'label': 'Wii U', 'pattern': 'WiiU' },
      'Wii',
      'Xbox One',
      { 'label': 'Xbox 360', 'pattern': 'Xbox' },
      'Xoom'
    ]);

    /* Detectable manufacturers. */
    var manufacturer = getManufacturer({
      'Apple': { 'iPad': 1, 'iPhone': 1, 'iPod': 1 },
      'Alcatel': {},
      'Archos': {},
      'Amazon': { 'Kindle': 1, 'Kindle Fire': 1 },
      'Asus': { 'Transformer': 1 },
      'Barnes & Noble': { 'Nook': 1 },
      'BlackBerry': { 'PlayBook': 1 },
      'Google': { 'Google TV': 1, 'Nexus': 1 },
      'HP': { 'TouchPad': 1 },
      'HTC': {},
      'Huawei': {},
      'Lenovo': {},
      'LG': {},
      'Microsoft': { 'Xbox': 1, 'Xbox One': 1 },
      'Motorola': { 'Xoom': 1 },
      'Nintendo': { 'Wii U': 1,  'Wii': 1 },
      'Nokia': { 'Lumia': 1 },
      'Oppo': {},
      'Samsung': { 'Galaxy S': 1, 'Galaxy S2': 1, 'Galaxy S3': 1, 'Galaxy S4': 1 },
      'Sony': { 'PlayStation': 1, 'PlayStation Vita': 1 },
      'Xiaomi': { 'Mi': 1, 'Redmi': 1 }
    });

    /* Detectable operating systems (order is important). */
    var os = getOS([
      'Windows Phone',
      'KaiOS',
      'Android',
      'CentOS',
      { 'label': 'Chrome OS', 'pattern': 'CrOS' },
      'Debian',
      { 'label': 'DragonFly BSD', 'pattern': 'DragonFly' },
      'Fedora',
      'FreeBSD',
      'Gentoo',
      'Haiku',
      'Kubuntu',
      'Linux Mint',
      'OpenBSD',
      'Red Hat',
      'SuSE',
      'Ubuntu',
      'Xubuntu',
      'Cygwin',
      'Symbian OS',
      'hpwOS',
      'webOS ',
      'webOS',
      'Tablet OS',
      'Tizen',
      'Linux',
      'Mac OS X',
      'Macintosh',
      'Mac',
      'Windows 98;',
      'Windows '
    ]);

    /*------------------------------------------------------------------------*/

    /**
     * Picks the layout engine from an array of guesses.
     *
     * @private
     * @param {Array} guesses An array of guesses.
     * @returns {null|string} The detected layout engine.
     */
    function getLayout(guesses) {
      return reduce(guesses, function(result, guess) {
        return result || RegExp('\\b' + (
          guess.pattern || qualify(guess)
        ) + '\\b', 'i').exec(ua) && (guess.label || guess);
      });
    }

    /**
     * Picks the manufacturer from an array of guesses.
     *
     * @private
     * @param {Array} guesses An object of guesses.
     * @returns {null|string} The detected manufacturer.
     */
    function getManufacturer(guesses) {
      return reduce(guesses, function(result, value, key) {
        // Lookup the manufacturer by product or scan the UA for the manufacturer.
        return result || (
          value[product] ||
          value[/^[a-z]+(?: +[a-z]+\b)*/i.exec(product)] ||
          RegExp('\\b' + qualify(key) + '(?:\\b|\\w*\\d)', 'i').exec(ua)
        ) && key;
      });
    }

    /**
     * Picks the browser name from an array of guesses.
     *
     * @private
     * @param {Array} guesses An array of guesses.
     * @returns {null|string} The detected browser name.
     */
    function getName(guesses) {
      return reduce(guesses, function(result, guess) {
        return result || RegExp('\\b' + (
          guess.pattern || qualify(guess)
        ) + '\\b', 'i').exec(ua) && (guess.label || guess);
      });
    }

    /**
     * Picks the OS name from an array of guesses.
     *
     * @private
     * @param {Array} guesses An array of guesses.
     * @returns {null|string} The detected OS name.
     */
    function getOS(guesses) {
      return reduce(guesses, function(result, guess) {
        var pattern = guess.pattern || qualify(guess);
        if (!result && (result =
              RegExp('\\b' + pattern + '(?:/[\\d.]+|[ \\w.]*)', 'i').exec(ua)
            )) {
          result = cleanupOS(result, pattern, guess.label || guess);
        }
        return result;
      });
    }

    /**
     * Picks the product name from an array of guesses.
     *
     * @private
     * @param {Array} guesses An array of guesses.
     * @returns {null|string} The detected product name.
     */
    function getProduct(guesses) {
      return reduce(guesses, function(result, guess) {
        var pattern = guess.pattern || qualify(guess);
        if (!result && (result =
              RegExp('\\b' + pattern + ' *\\d+[.\\w_]*', 'i').exec(ua) ||
              RegExp('\\b' + pattern + ' *\\w+-[\\w]*', 'i').exec(ua) ||
              RegExp('\\b' + pattern + '(?:; *(?:[a-z]+[_-])?[a-z]+\\d+|[^ ();-]*)', 'i').exec(ua)
            )) {
          // Split by forward slash and append product version if needed.
          if ((result = String((guess.label && !RegExp(pattern, 'i').test(guess.label)) ? guess.label : result).split('/'))[1] && !/[\d.]+/.test(result[0])) {
            result[0] += ' ' + result[1];
          }
          // Correct character case and cleanup string.
          guess = guess.label || guess;
          result = format(result[0]
            .replace(RegExp(pattern, 'i'), guess)
            .replace(RegExp('; *(?:' + guess + '[_-])?', 'i'), ' ')
            .replace(RegExp('(' + guess + ')[-_.]?(\\w)', 'i'), '$1 $2'));
        }
        return result;
      });
    }

    /**
     * Resolves the version using an array of UA patterns.
     *
     * @private
     * @param {Array} patterns An array of UA patterns.
     * @returns {null|string} The detected version.
     */
    function getVersion(patterns) {
      return reduce(patterns, function(result, pattern) {
        return result || (RegExp(pattern +
          '(?:-[\\d.]+/|(?: for [\\w-]+)?[ /-])([\\d.]+[^ ();/_-]*)', 'i').exec(ua) || 0)[1] || null;
      });
    }

    /**
     * Returns `platform.description` when the platform object is coerced to a string.
     *
     * @name toString
     * @memberOf platform
     * @returns {string} Returns `platform.description` if available, else an empty string.
     */
    function toStringPlatform() {
      return this.description || '';
    }

    /*------------------------------------------------------------------------*/

    // Convert layout to an array so we can add extra details.
    layout && (layout = [layout]);

    // Detect Android products.
    // Browsers on Android devices typically provide their product IDS after "Android;"
    // up to "Build" or ") AppleWebKit".
    // Example:
    // "Mozilla/5.0 (Linux; Android 8.1.0; Moto G (5) Plus) AppleWebKit/537.36
    // (KHTML, like Gecko) Chrome/70.0.3538.80 Mobile Safari/537.36"
    if (/\bAndroid\b/.test(os) && !product &&
        (data = /\bAndroid[^;]*;(.*?)(?:Build|\) AppleWebKit)\b/i.exec(ua))) {
      product = trim(data[1])
        // Replace any language codes (eg. "en-US").
        .replace(/^[a-z]{2}-[a-z]{2};\s*/i, '')
        || null;
    }
    // Detect product names that contain their manufacturer's name.
    if (manufacturer && !product) {
      product = getProduct([manufacturer]);
    } else if (manufacturer && product) {
      product = product
        .replace(RegExp('^(' + qualify(manufacturer) + ')[-_.\\s]', 'i'), manufacturer + ' ')
        .replace(RegExp('^(' + qualify(manufacturer) + ')[-_.]?(\\w)', 'i'), manufacturer + ' $2');
    }
    // Clean up Google TV.
    if ((data = /\bGoogle TV\b/.exec(product))) {
      product = data[0];
    }
    // Detect simulators.
    if (/\bSimulator\b/i.test(ua)) {
      product = (product ? product + ' ' : '') + 'Simulator';
    }
    // Detect Opera Mini 8+ running in Turbo/Uncompressed mode on iOS.
    if (name == 'Opera Mini' && /\bOPiOS\b/.test(ua)) {
      description.push('running in Turbo/Uncompressed mode');
    }
    // Detect IE Mobile 11.
    if (name == 'IE' && /\blike iPhone OS\b/.test(ua)) {
      data = parse(ua.replace(/like iPhone OS/, ''));
      manufacturer = data.manufacturer;
      product = data.product;
    }
    // Detect iOS.
    else if (/^iP/.test(product)) {
      name || (name = 'Safari');
      os = 'iOS' + ((data = / OS ([\d_]+)/i.exec(ua))
        ? ' ' + data[1].replace(/_/g, '.')
        : '');
    }
    // Detect Kubuntu.
    else if (name == 'Konqueror' && /^Linux\b/i.test(os)) {
      os = 'Kubuntu';
    }
    // Detect Android browsers.
    else if ((manufacturer && manufacturer != 'Google' &&
        ((/Chrome/.test(name) && !/\bMobile Safari\b/i.test(ua)) || /\bVita\b/.test(product))) ||
        (/\bAndroid\b/.test(os) && /^Chrome/.test(name) && /\bVersion\//i.test(ua))) {
      name = 'Android Browser';
      os = /\bAndroid\b/.test(os) ? os : 'Android';
    }
    // Detect Silk desktop/accelerated modes.
    else if (name == 'Silk') {
      if (!/\bMobi/i.test(ua)) {
        os = 'Android';
        description.unshift('desktop mode');
      }
      if (/Accelerated *= *true/i.test(ua)) {
        description.unshift('accelerated');
      }
    }
    // Detect UC Browser speed mode.
    else if (name == 'UC Browser' && /\bUCWEB\b/.test(ua)) {
      description.push('speed mode');
    }
    // Detect PaleMoon identifying as Firefox.
    else if (name == 'PaleMoon' && (data = /\bFirefox\/([\d.]+)\b/.exec(ua))) {
      description.push('identifying as Firefox ' + data[1]);
    }
    // Detect Firefox OS and products running Firefox.
    else if (name == 'Firefox' && (data = /\b(Mobile|Tablet|TV)\b/i.exec(ua))) {
      os || (os = 'Firefox OS');
      product || (product = data[1]);
    }
    // Detect false positives for Firefox/Safari.
    else if (!name || (data = !/\bMinefield\b/i.test(ua) && /\b(?:Firefox|Safari)\b/.exec(name))) {
      // Escape the `/` for Firefox 1.
      if (name && !product && /[\/,]|^[^(]+?\)/.test(ua.slice(ua.indexOf(data + '/') + 8))) {
        // Clear name of false positives.
        name = null;
      }
      // Reassign a generic name.
      if ((data = product || manufacturer || os) &&
          (product || manufacturer || /\b(?:Android|Symbian OS|Tablet OS|webOS)\b/.test(os))) {
        name = /[a-z]+(?: Hat)?/i.exec(/\bAndroid\b/.test(os) ? os : data) + ' Browser';
      }
    }
    // Add Chrome version to description for Electron.
    else if (name == 'Electron' && (data = (/\bChrome\/([\d.]+)\b/.exec(ua) || 0)[1])) {
      description.push('Chromium ' + data);
    }
    // Detect non-Opera (Presto-based) versions (order is important).
    if (!version) {
      version = getVersion([
        '(?:Cloud9|CriOS|CrMo|Edge|Edg|EdgA|EdgiOS|FxiOS|HeadlessChrome|IEMobile|Iron|Opera ?Mini|OPiOS|OPR|Raven|SamsungBrowser|Silk(?!/[\\d.]+$)|UCBrowser|YaBrowser)',
        'Version',
        qualify(name),
        '(?:Firefox|Minefield|NetFront)'
      ]);
    }
    // Detect stubborn layout engines.
    if ((data =
          layout == 'iCab' && parseFloat(version) > 3 && 'WebKit' ||
          /\bOpera\b/.test(name) && (/\bOPR\b/.test(ua) ? 'Blink' : 'Presto') ||
          /\b(?:Midori|Nook|Safari)\b/i.test(ua) && !/^(?:Trident|EdgeHTML)$/.test(layout) && 'WebKit' ||
          !layout && /\bMSIE\b/i.test(ua) && (os == 'Mac OS' ? 'Tasman' : 'Trident') ||
          layout == 'WebKit' && /\bPlayStation\b(?! Vita\b)/i.test(name) && 'NetFront'
        )) {
      layout = [data];
    }
    // Detect Windows Phone 7 desktop mode.
    if (name == 'IE' && (data = (/; *(?:XBLWP|ZuneWP)(\d+)/i.exec(ua) || 0)[1])) {
      name += ' Mobile';
      os = 'Windows Phone ' + (/\+$/.test(data) ? data : data + '.x');
      description.unshift('desktop mode');
    }
    // Detect Windows Phone 8.x desktop mode.
    else if (/\bWPDesktop\b/i.test(ua)) {
      name = 'IE Mobile';
      os = 'Windows Phone 8.x';
      description.unshift('desktop mode');
      version || (version = (/\brv:([\d.]+)/.exec(ua) || 0)[1]);
    }
    // Detect IE 11 identifying as other browsers.
    else if (name != 'IE' && layout == 'Trident' && (data = /\brv:([\d.]+)/.exec(ua))) {
      if (name) {
        description.push('identifying as ' + name + (version ? ' ' + version : ''));
      }
      name = 'IE';
      version = data[1];
    }
    // Leverage environment features.
    if (useFeatures) {
      // Detect server-side environments.
      // Rhino has a global function while others have a global object.
      if (isHostType(context, 'global')) {
        if (java) {
          data = java.lang.System;
          arch = data.getProperty('os.arch');
          os = os || data.getProperty('os.name') + ' ' + data.getProperty('os.version');
        }
        if (rhino) {
          try {
            version = context.require('ringo/engine').version.join('.');
            name = 'RingoJS';
          } catch(e) {
            if ((data = context.system) && data.global.system == context.system) {
              name = 'Narwhal';
              os || (os = data[0].os || null);
            }
          }
          if (!name) {
            name = 'Rhino';
          }
        }
        else if (
          typeof context.process == 'object' && !context.process.browser &&
          (data = context.process)
        ) {
          if (typeof data.versions == 'object') {
            if (typeof data.versions.electron == 'string') {
              description.push('Node ' + data.versions.node);
              name = 'Electron';
              version = data.versions.electron;
            } else if (typeof data.versions.nw == 'string') {
              description.push('Chromium ' + version, 'Node ' + data.versions.node);
              name = 'NW.js';
              version = data.versions.nw;
            }
          }
          if (!name) {
            name = 'Node.js';
            arch = data.arch;
            os = data.platform;
            version = /[\d.]+/.exec(data.version);
            version = version ? version[0] : null;
          }
        }
      }
      // Detect Adobe AIR.
      else if (getClassOf((data = context.runtime)) == airRuntimeClass) {
        name = 'Adobe AIR';
        os = data.flash.system.Capabilities.os;
      }
      // Detect PhantomJS.
      else if (getClassOf((data = context.phantom)) == phantomClass) {
        name = 'PhantomJS';
        version = (data = data.version || null) && (data.major + '.' + data.minor + '.' + data.patch);
      }
      // Detect IE compatibility modes.
      else if (typeof doc.documentMode == 'number' && (data = /\bTrident\/(\d+)/i.exec(ua))) {
        // We're in compatibility mode when the Trident version + 4 doesn't
        // equal the document mode.
        version = [version, doc.documentMode];
        if ((data = +data[1] + 4) != version[1]) {
          description.push('IE ' + version[1] + ' mode');
          layout && (layout[1] = '');
          version[1] = data;
        }
        version = name == 'IE' ? String(version[1].toFixed(1)) : version[0];
      }
      // Detect IE 11 masking as other browsers.
      else if (typeof doc.documentMode == 'number' && /^(?:Chrome|Firefox)\b/.test(name)) {
        description.push('masking as ' + name + ' ' + version);
        name = 'IE';
        version = '11.0';
        layout = ['Trident'];
        os = 'Windows';
      }
      os = os && format(os);
    }
    // Detect prerelease phases.
    if (version && (data =
          /(?:[ab]|dp|pre|[ab]\d+pre)(?:\d+\+?)?$/i.exec(version) ||
          /(?:alpha|beta)(?: ?\d)?/i.exec(ua + ';' + (useFeatures && nav.appMinorVersion)) ||
          /\bMinefield\b/i.test(ua) && 'a'
        )) {
      prerelease = /b/i.test(data) ? 'beta' : 'alpha';
      version = version.replace(RegExp(data + '\\+?$'), '') +
        (prerelease == 'beta' ? beta : alpha) + (/\d+\+?/.exec(data) || '');
    }
    // Detect Firefox Mobile.
    if (name == 'Fennec' || name == 'Firefox' && /\b(?:Android|Firefox OS|KaiOS)\b/.test(os)) {
      name = 'Firefox Mobile';
    }
    // Obscure Maxthon's unreliable version.
    else if (name == 'Maxthon' && version) {
      version = version.replace(/\.[\d.]+/, '.x');
    }
    // Detect Xbox 360 and Xbox One.
    else if (/\bXbox\b/i.test(product)) {
      if (product == 'Xbox 360') {
        os = null;
      }
      if (product == 'Xbox 360' && /\bIEMobile\b/.test(ua)) {
        description.unshift('mobile mode');
      }
    }
    // Add mobile postfix.
    else if ((/^(?:Chrome|IE|Opera)$/.test(name) || name && !product && !/Browser|Mobi/.test(name)) &&
        (os == 'Windows CE' || /Mobi/i.test(ua))) {
      name += ' Mobile';
    }
    // Detect IE platform preview.
    else if (name == 'IE' && useFeatures) {
      try {
        if (context.external === null) {
          description.unshift('platform preview');
        }
      } catch(e) {
        description.unshift('embedded');
      }
    }
    // Detect BlackBerry OS version.
    // http://docs.blackberry.com/en/developers/deliverables/18169/HTTP_headers_sent_by_BB_Browser_1234911_11.jsp
    else if ((/\bBlackBerry\b/.test(product) || /\bBB10\b/.test(ua)) && (data =
          (RegExp(product.replace(/ +/g, ' *') + '/([.\\d]+)', 'i').exec(ua) || 0)[1] ||
          version
        )) {
      data = [data, /BB10/.test(ua)];
      os = (data[1] ? (product = null, manufacturer = 'BlackBerry') : 'Device Software') + ' ' + data[0];
      version = null;
    }
    // Detect Opera identifying/masking itself as another browser.
    // http://www.opera.com/support/kb/view/843/
    else if (this != forOwn && product != 'Wii' && (
          (useFeatures && opera) ||
          (/Opera/.test(name) && /\b(?:MSIE|Firefox)\b/i.test(ua)) ||
          (name == 'Firefox' && /\bOS X (?:\d+\.){2,}/.test(os)) ||
          (name == 'IE' && (
            (os && !/^Win/.test(os) && version > 5.5) ||
            /\bWindows XP\b/.test(os) && version > 8 ||
            version == 8 && !/\bTrident\b/.test(ua)
          ))
        ) && !reOpera.test((data = parse.call(forOwn, ua.replace(reOpera, '') + ';'))) && data.name) {
      // When "identifying", the UA contains both Opera and the other browser's name.
      data = 'ing as ' + data.name + ((data = data.version) ? ' ' + data : '');
      if (reOpera.test(name)) {
        if (/\bIE\b/.test(data) && os == 'Mac OS') {
          os = null;
        }
        data = 'identify' + data;
      }
      // When "masking", the UA contains only the other browser's name.
      else {
        data = 'mask' + data;
        if (operaClass) {
          name = format(operaClass.replace(/([a-z])([A-Z])/g, '$1 $2'));
        } else {
          name = 'Opera';
        }
        if (/\bIE\b/.test(data)) {
          os = null;
        }
        if (!useFeatures) {
          version = null;
        }
      }
      layout = ['Presto'];
      description.push(data);
    }
    // Detect WebKit Nightly and approximate Chrome/Safari versions.
    if ((data = (/\bAppleWebKit\/([\d.]+\+?)/i.exec(ua) || 0)[1])) {
      // Correct build number for numeric comparison.
      // (e.g. "532.5" becomes "532.05")
      data = [parseFloat(data.replace(/\.(\d)$/, '.0$1')), data];
      // Nightly builds are postfixed with a "+".
      if (name == 'Safari' && data[1].slice(-1) == '+') {
        name = 'WebKit Nightly';
        prerelease = 'alpha';
        version = data[1].slice(0, -1);
      }
      // Clear incorrect browser versions.
      else if (version == data[1] ||
          version == (data[2] = (/\bSafari\/([\d.]+\+?)/i.exec(ua) || 0)[1])) {
        version = null;
      }
      // Use the full Chrome version when available.
      data[1] = (/\b(?:Headless)?Chrome\/([\d.]+)/i.exec(ua) || 0)[1];
      // Detect Blink layout engine.
      if (data[0] == 537.36 && data[2] == 537.36 && parseFloat(data[1]) >= 28 && layout == 'WebKit') {
        layout = ['Blink'];
      }
      // Detect JavaScriptCore.
      // http://stackoverflow.com/questions/6768474/how-can-i-detect-which-javascript-engine-v8-or-jsc-is-used-at-runtime-in-androi
      if (!useFeatures || (!likeChrome && !data[1])) {
        layout && (layout[1] = 'like Safari');
        data = (data = data[0], data < 400 ? 1 : data < 500 ? 2 : data < 526 ? 3 : data < 533 ? 4 : data < 534 ? '4+' : data < 535 ? 5 : data < 537 ? 6 : data < 538 ? 7 : data < 601 ? 8 : data < 602 ? 9 : data < 604 ? 10 : data < 606 ? 11 : data < 608 ? 12 : '12');
      } else {
        layout && (layout[1] = 'like Chrome');
        data = data[1] || (data = data[0], data < 530 ? 1 : data < 532 ? 2 : data < 532.05 ? 3 : data < 533 ? 4 : data < 534.03 ? 5 : data < 534.07 ? 6 : data < 534.10 ? 7 : data < 534.13 ? 8 : data < 534.16 ? 9 : data < 534.24 ? 10 : data < 534.30 ? 11 : data < 535.01 ? 12 : data < 535.02 ? '13+' : data < 535.07 ? 15 : data < 535.11 ? 16 : data < 535.19 ? 17 : data < 536.05 ? 18 : data < 536.10 ? 19 : data < 537.01 ? 20 : data < 537.11 ? '21+' : data < 537.13 ? 23 : data < 537.18 ? 24 : data < 537.24 ? 25 : data < 537.36 ? 26 : layout != 'Blink' ? '27' : '28');
      }
      // Add the postfix of ".x" or "+" for approximate versions.
      layout && (layout[1] += ' ' + (data += typeof data == 'number' ? '.x' : /[.+]/.test(data) ? '' : '+'));
      // Obscure version for some Safari 1-2 releases.
      if (name == 'Safari' && (!version || parseInt(version) > 45)) {
        version = data;
      } else if (name == 'Chrome' && /\bHeadlessChrome/i.test(ua)) {
        description.unshift('headless');
      }
    }
    // Detect Opera desktop modes.
    if (name == 'Opera' &&  (data = /\bzbov|zvav$/.exec(os))) {
      name += ' ';
      description.unshift('desktop mode');
      if (data == 'zvav') {
        name += 'Mini';
        version = null;
      } else {
        name += 'Mobile';
      }
      os = os.replace(RegExp(' *' + data + '$'), '');
    }
    // Detect Chrome desktop mode.
    else if (name == 'Safari' && /\bChrome\b/.exec(layout && layout[1])) {
      description.unshift('desktop mode');
      name = 'Chrome Mobile';
      version = null;

      if (/\bOS X\b/.test(os)) {
        manufacturer = 'Apple';
        os = 'iOS 4.3+';
      } else {
        os = null;
      }
    }
    // Newer versions of SRWare Iron uses the Chrome tag to indicate its version number.
    else if (/\bSRWare Iron\b/.test(name) && !version) {
      version = getVersion('Chrome');
    }
    // Strip incorrect OS versions.
    if (version && version.indexOf((data = /[\d.]+$/.exec(os))) == 0 &&
        ua.indexOf('/' + data + '-') > -1) {
      os = trim(os.replace(data, ''));
    }
    // Ensure OS does not include the browser name.
    if (os && os.indexOf(name) != -1 && !RegExp(name + ' OS').test(os)) {
      os = os.replace(RegExp(' *' + qualify(name) + ' *'), '');
    }
    // Add layout engine.
    if (layout && !/\b(?:Avant|Nook)\b/.test(name) && (
        /Browser|Lunascape|Maxthon/.test(name) ||
        name != 'Safari' && /^iOS/.test(os) && /\bSafari\b/.test(layout[1]) ||
        /^(?:Adobe|Arora|Breach|Midori|Opera|Phantom|Rekonq|Rock|Samsung Internet|Sleipnir|SRWare Iron|Vivaldi|Web)/.test(name) && layout[1])) {
      // Don't add layout details to description if they are falsey.
      (data = layout[layout.length - 1]) && description.push(data);
    }
    // Combine contextual information.
    if (description.length) {
      description = ['(' + description.join('; ') + ')'];
    }
    // Append manufacturer to description.
    if (manufacturer && product && product.indexOf(manufacturer) < 0) {
      description.push('on ' + manufacturer);
    }
    // Append product to description.
    if (product) {
      description.push((/^on /.test(description[description.length - 1]) ? '' : 'on ') + product);
    }
    // Parse the OS into an object.
    if (os) {
      data = / ([\d.+]+)$/.exec(os);
      isSpecialCasedOS = data && os.charAt(os.length - data[0].length - 1) == '/';
      os = {
        'architecture': 32,
        'family': (data && !isSpecialCasedOS) ? os.replace(data[0], '') : os,
        'version': data ? data[1] : null,
        'toString': function() {
          var version = this.version;
          return this.family + ((version && !isSpecialCasedOS) ? ' ' + version : '') + (this.architecture == 64 ? ' 64-bit' : '');
        }
      };
    }
    // Add browser/OS architecture.
    if ((data = /\b(?:AMD|IA|Win|WOW|x86_|x)64\b/i.exec(arch)) && !/\bi686\b/i.test(arch)) {
      if (os) {
        os.architecture = 64;
        os.family = os.family.replace(RegExp(' *' + data), '');
      }
      if (
          name && (/\bWOW64\b/i.test(ua) ||
          (useFeatures && /\w(?:86|32)$/.test(nav.cpuClass || nav.platform) && !/\bWin64; x64\b/i.test(ua)))
      ) {
        description.unshift('32-bit');
      }
    }
    // Chrome 39 and above on OS X is always 64-bit.
    else if (
        os && /^OS X/.test(os.family) &&
        name == 'Chrome' && parseFloat(version) >= 39
    ) {
      os.architecture = 64;
    }

    ua || (ua = null);

    /*------------------------------------------------------------------------*/

    /**
     * The platform object.
     *
     * @name platform
     * @type Object
     */
    var platform = {};

    /**
     * The platform description.
     *
     * @memberOf platform
     * @type string|null
     */
    platform.description = ua;

    /**
     * The name of the browser's layout engine.
     *
     * The list of common layout engines include:
     * "Blink", "EdgeHTML", "Gecko", "Trident" and "WebKit"
     *
     * @memberOf platform
     * @type string|null
     */
    platform.layout = layout && layout[0];

    /**
     * The name of the product's manufacturer.
     *
     * The list of manufacturers include:
     * "Apple", "Archos", "Amazon", "Asus", "Barnes & Noble", "BlackBerry",
     * "Google", "HP", "HTC", "LG", "Microsoft", "Motorola", "Nintendo",
     * "Nokia", "Samsung" and "Sony"
     *
     * @memberOf platform
     * @type string|null
     */
    platform.manufacturer = manufacturer;

    /**
     * The name of the browser/environment.
     *
     * The list of common browser names include:
     * "Chrome", "Electron", "Firefox", "Firefox for iOS", "IE",
     * "Microsoft Edge", "PhantomJS", "Safari", "SeaMonkey", "Silk",
     * "Opera Mini" and "Opera"
     *
     * Mobile versions of some browsers have "Mobile" appended to their name:
     * eg. "Chrome Mobile", "Firefox Mobile", "IE Mobile" and "Opera Mobile"
     *
     * @memberOf platform
     * @type string|null
     */
    platform.name = name;

    /**
     * The alpha/beta release indicator.
     *
     * @memberOf platform
     * @type string|null
     */
    platform.prerelease = prerelease;

    /**
     * The name of the product hosting the browser.
     *
     * The list of common products include:
     *
     * "BlackBerry", "Galaxy S4", "Lumia", "iPad", "iPod", "iPhone", "Kindle",
     * "Kindle Fire", "Nexus", "Nook", "PlayBook", "TouchPad" and "Transformer"
     *
     * @memberOf platform
     * @type string|null
     */
    platform.product = product;

    /**
     * The browser's user agent string.
     *
     * @memberOf platform
     * @type string|null
     */
    platform.ua = ua;

    /**
     * The browser/environment version.
     *
     * @memberOf platform
     * @type string|null
     */
    platform.version = name && version;

    /**
     * The name of the operating system.
     *
     * @memberOf platform
     * @type Object
     */
    platform.os = os || {

      /**
       * The CPU architecture the OS is built for.
       *
       * @memberOf platform.os
       * @type number|null
       */
      'architecture': null,

      /**
       * The family of the OS.
       *
       * Common values include:
       * "Windows", "Windows Server 2008 R2 / 7", "Windows Server 2008 / Vista",
       * "Windows XP", "OS X", "Linux", "Ubuntu", "Debian", "Fedora", "Red Hat",
       * "SuSE", "Android", "iOS" and "Windows Phone"
       *
       * @memberOf platform.os
       * @type string|null
       */
      'family': null,

      /**
       * The version of the OS.
       *
       * @memberOf platform.os
       * @type string|null
       */
      'version': null,

      /**
       * Returns the OS string.
       *
       * @memberOf platform.os
       * @returns {string} The OS string.
       */
      'toString': function() { return 'null'; }
    };

    platform.parse = parse;
    platform.toString = toStringPlatform;

    if (platform.version) {
      description.unshift(version);
    }
    if (platform.name) {
      description.unshift(name);
    }
    if (os && name && !(os == String(os).split(' ')[0] && (os == name.split(' ')[0] || product))) {
      description.push(product ? '(' + os + ')' : 'on ' + os);
    }
    if (description.length) {
      platform.description = description.join(' ');
    }
    return platform;
  }

  /*--------------------------------------------------------------------------*/

  // Export platform.
  var platform = parse();

  // Some AMD build optimizers, like r.js, check for condition patterns like the following:
  if (true) {
    // Expose platform on the global object to prevent errors when platform is
    // loaded by a script tag in the presence of an AMD loader.
    // See http://requirejs.org/docs/errors.html#mismatch for more details.
    root.platform = platform;

    // Define as an anonymous module so platform can be aliased through path mapping.
    !(__WEBPACK_AMD_DEFINE_RESULT__ = (function() {
      return platform;
    }).call(exports, __webpack_require__, exports, module),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
  }
  // Check for `exports` after `define` in case a build optimizer adds an `exports` object.
  else {}
}.call(this));


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			loaded: false,
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/node module decorator */
/******/ 	(() => {
/******/ 		__webpack_require__.nmd = (module) => {
/******/ 			module.paths = [];
/******/ 			if (!module.children) module.children = [];
/******/ 			return module;
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*
 # -----------------------------------------------------------------------------
 #  ~/src/template.js
 #  J1 Theme Javascript Core library
 #
 #  Product/Info:
 #  https://jekyll.one
 #
 #  Copyright (C) 2023, 2024 Juergen Adams
 #
 #  J1 Template is licensed under the MIT License.
 #  See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 #
 # -----------------------------------------------------------------------------
*/

// -----------------------------------------------------------------------------
// ESLint shimming
// -----------------------------------------------------------------------------
/* eslint-disable no-unused-vars                                              */
/* global window                                                              */

// -----------------------------------------------------------------------------
// Import SASS sources for HMR
// -----------------------------------------------------------------------------
// import '../100_theme_css/scss/theme_uno/components/_footer.scss';
// import '../100_theme_css/theme_uno.css';  // <-- yes, also require (s)css. This is a Webpack thing

// Core Libraries - imported|required from NODE|NPM modules
// -----------------------------------------------------------------------------
//
// Following objects (framework modules) are *conditionaly* forced to be
// exposed for run-time to the global namespace (window) by WP config
// file (expose-loader):
//  jQuery
//  Popper  ('popper.js/dist/umd/popper', https://github.com/twbs/bootstrap/issues/23381)
// -----------------------------------------------------------------------------

// Core Utilities (moved to modules)
// -----------------------------------------------------------------------------
// Following objects (native node modules) are *explicitely* forced to be
// exposed for run-time to the global namespace (window).
// -----------------------------------------------------------------------------
window.Cookies = __webpack_require__(2215);
window.yaml = __webpack_require__(7210);
window.log4javascript = __webpack_require__(6863);
window.liteURL = __webpack_require__(3194);
window.platform = __webpack_require__(7503);

// Core Libraries - build|required from SOURCE
// -----------------------------------------------------------------------------

// Following source objects|modules are *explicitely* forced to be
// exposed for run-time to the global namespace (window).
// -----------------------------------------------------------------------------
// window.deeplTranslator               = require('./js/deepl-translator');     // J1 Module deeplAPI used instead
// window.j1.fab                        = require('./js/fab/fab.js');           // cannot used until NOT rewritten to jQuery

window.ejs = __webpack_require__(3950);
window.j1.adapter = __webpack_require__(1922);
window.j1.anime = __webpack_require__(258); // added for fab
window.j1.lazyCSS = __webpack_require__(4338);
window.j1.core = __webpack_require__(7434);
window.j1.core.parseContent = __webpack_require__(2435);
window.j1.core.navigator = __webpack_require__(4102);
window.j1.core.asciidoctor = __webpack_require__(1702);
window.j1.core.scrollSmooth = __webpack_require__(5150);

// Following source objects|modules are *implicetly* forced to be
// exposed for run-time to the global namespace (window).
// -----------------------------------------------------------------------------
// const J1Yaml                           = require('js-yaml');
// const J1jQueryExt                      = require('./js/jquery-extensions/jquery-regex.js');
// const J1ThemeSwitcher                  = require('./js/bs_theme_switcher/switcher.js');
// const J1MmenuLight                     = require('./js/mmenu-light/mmenu.js');

// const BootstrapJS                      = require('./node_modules/bootstrap/dist/js/bootstrap.js');

const J1Tocbot = __webpack_require__(6562);
const J1AttrChangeListener = __webpack_require__(8497);
const J1Speak2Me = __webpack_require__(544);
const J1SCarousel = __webpack_require__(7196);

// Passing log data over Internet|SeeMe (currently NOT used)
// -----------------------------------------------------------------------------
// window.j1.core.log4javascript        = require('./js/logger/client/webhook.js');

// BMD Libraries (moved to modules)
// -----------------------------------------------------------------------------
// window.bootstrapMaterialDesign       = require('./js/bmd/js/bmd.js');

// Github Webhooks (currently NOT used)
// -----------------------------------------------------------------------------
// window.j1.core.webhooks              = require('./js/webhooks/octokit/client.js');

// Test|Custom modules (currently NOT used)
// -----------------------------------------------------------------------------
// window.j1promiseTest                 = require('./js/custom/test_promises.js');
// window.j1Example                     = require('./js/custom/example_module.js');

// BS Libraries (moved to modules)
// -----------------------------------------------------------------------------
// Following source objects|modules are *implicetly* forced to be
// exposed for run-time to the global namespace (window).
// -----------------------------------------------------------------------------
// const Bootstrap                      = require('./js/bootstrap/bootstrap.js');
// const J1JekyllSearch                 = require('./js/jekyll_search/jekyll_search.js'); // Buffer Kack
// const J1Tocbot                       = require('./js/tocbot/tocbot.js');

// Backstretch (moved to modules)
// -----------------------------------------------------------------------------
// Following source objects|modules are *implicetly* forced to be
// exposed for run-time to the namespace of jQuery ($).
// -----------------------------------------------------------------------------
// const J1Attics                       = require('./js/backstretch/backstretch.js');

// Additional Vanilla JS helpers
// -----------------------------------------------------------------------------
const J1AdocResultViewer = __webpack_require__(7784);
// const MSIEPolyfills                  = require('./js/polyfills/ms-ie.js');

// HMR messages  (currently NOT used)
// -----------------------------------------------------------------------------
// if (module.hot) {
//   var logtext;
//   var stat;
//   var stat=module.hot.status();
//
//   logtext='[INFO ] [HMR                               ] [Hot Module Replacement enabled]';
//   console.log(logtext);
//   logtext='[INFO ] [HMR                               ] [Status: ' + stat + ']';
//   console.log(logtext);
//
//   module.hot.accept('./template.js', function() {
//     console.log('[HMR] Accepting the updated template.js module!');
//   });
//
//   module.hot.accept('../100_theme_css/theme_uno.scss', function () {
//     console.log('[HMR] Accepting the updated style.css module!');
//     require('../100_theme_css/theme_uno.scss')
//   })
//
// React to the current status...
// module.hot.addStatusHandler(status => {
//   stat=module.hot.status();
//   logtext='[INFO ] [HMR                               ] [Status: ' + stat + ']';
//   console.log(logtext);
// });
//}

// -----------------------------------------------------------------------------
// END
})();

/******/ })()
;