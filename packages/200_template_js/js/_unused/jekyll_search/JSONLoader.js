// -----------------------------------------------------------------------------
// ESLint shimming
// -----------------------------------------------------------------------------
/* eslint indent: "off"                                                       */
/* eslint no-undef: "off"                                                     */
// -----------------------------------------------------------------------------
'use strict';
module.exports = {
  load: load
};

// var yaml = require('js-yaml');                                                  // See: https://www.npmjs.com/package/js-yaml


function load (location, callback) {
  var xhr = getXHR();
  xhr.open('GET', location, true);
  xhr.onreadystatechange = createStateChangeListener(xhr, callback);
  xhr.send();
}

// J1 version using js-yaml to parse JSON data (search index)
// -----------------------------------------------------------------------------
// function createStateChangeListener (xhr, callback) {
//   return function () {
//     if (xhr.readyState === 4 && xhr.status === 200) {
//       try {
//           yaml.safeLoadAll(xhr.responseText, function (dataObj) {               // See: https://stackoverflow.com/questions/36973736/convert-yaml-to-json
//           //console.log(dataObj);
//           callback(null, dataObj);
//         });
//         /* jadams, 2019-03-10, moved data callback to YAML parser */
//         /* callback(null, JSON.parse(xhr.responseText)); */
//       } catch (e) {
//         callback(null, e);
//       }
//     }
//   };
// }

function createStateChangeListener (xhr, callback) {
  return function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      try {
        callback(null, JSON.parse(xhr.responseText));
      } catch (err) {
        callback(err, null);
      }
    }
  };
}

function getXHR () {
  return (window.XMLHttpRequest) ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
}
