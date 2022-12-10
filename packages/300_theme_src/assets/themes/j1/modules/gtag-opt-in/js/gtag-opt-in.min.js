/*
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/modules/gtag-opt-in/js/gtag-opt-in.js
 # J1 module for Google Analytics OptIn
 #
 # Product/Info:
 # https://github.com/luciomartinez/gtag-opt-in
 #
 # Copyright (C) 2020 Lucio Martinez
 #
 # Google Analytics OptIn is licensed under the MIT License.
 # For details, see https://github.com/luciomartinez/gtag-opt-in/blob/main/LICENSE
 # -----------------------------------------------------------------------------
*/
!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports.GTagOptIn=t():e.GTagOptIn=t()}(window,(function(){return function(e){var t={};function n(r){if(t[r])return t[r].exports;var o=t[r]={i:r,l:!1,exports:{}};return e[r].call(o.exports,o,o.exports,n),o.l=!0,o.exports}return n.m=e,n.c=t,n.d=function(e,t,r){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:r})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)n.d(r,o,function(t){return e[t]}.bind(null,o));return r},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=0)}([function(e,t,n){"use strict";n.r(t),n.d(t,"register",(function(){return i})),n.d(t,"optIn",(function(){return f})),n.d(t,"optOut",(function(){return a}));let r=!1,o=void 0;const i=e=>{u(e),o=e},u=e=>{if(!e)throw new Error("gtag-opt-in: invalid value passed to `register` method. Make sure to use a valid Analytics ID.")},a=()=>{d(),window["ga-disable-"+o]=!0},f=()=>{d(),c(),window["ga-disable-"+o]=!1},d=()=>{if(!o)throw new Error("gtag-opt-in: no value found for Analytics ID. Make sure to register before by calling the `register` method.")},c=()=>{r||(l(),r=!0)},l=()=>{const e=s();p(e)},s=()=>(window.dataLayer=window.dataLayer||[],function(){dataLayer.push(arguments)}),p=e=>{e("js",new Date),e("config",o,{anonymize_ip:!0})}}])}));
