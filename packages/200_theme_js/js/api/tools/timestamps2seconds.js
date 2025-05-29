/*
 # -----------------------------------------------------------------------------
 #  ~/js/j1_template/api/api.js
 #  Provides an simple API for J1 Template projects
 #
 #  Product/Info:
 #  https://jekyll.one
 #  http://getbootstrap.com/
 #
 #  Copyright (C) 2023-2025 Juergen Adams
 #
 #  J1 Theme is licensed under MIT License.
 #  See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 # -----------------------------------------------------------------------------
*/

// -------------------------------------------------------------------------
// ts2sec(timestamp)
//
// converts a timestamp of hh:mm:ss into (absolute) seconds
// -------------------------------------------------------------------------
// TODO:
// Add support for timestamp w/o hours like mm:ss
// -------------------------------------------------------------------------
'use strict';

module.exports = function ts2sec (timestamp) {
    // split timestamp
    const parts = timestamp.split(':');

    // check timestamp format
    if (parts.length !== 3) {
    // return "invalid timestamp";
    return false;
    }

    // convert parts to integers
    const hours   = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    const seconds = parseInt(parts[2], 10);

    // check valid timestamp values
    if (isNaN(hours) || isNaN(minutes) || isNaN(seconds) ||
        hours   < 0 || hours   > 23 ||
        minutes < 0 || minutes > 59 ||
        seconds < 0 || seconds > 59) {
    return "invalid timestamp";
    }

    const totalSeconds = (hours * 3600) + (minutes * 60) + seconds;

    return totalSeconds;

    // module.exports = ts2sec(timestamp);
}( window, j1 ); 
// END ts2sec