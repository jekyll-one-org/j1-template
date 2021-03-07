/*
 # -----------------------------------------------------------------------------
 #  ~/js/adoc_result_viewer/view_results.js
 #  Provides JavaScript functions displaying results for Asciidoctor
 #
 #  Product/Info:
 #  https://jekyll.one
 #
 #  Copyright (C) 2021 Juergen Adams
 #
 #  J1 Template is licensed under MIT License.
 #  See: https://github.com/jekyll-one-org/J1 Template/blob/master/LICENSE
 #
 # -----------------------------------------------------------------------------
*/

// -----------------------------------------------------------------------------
// ESLint shimming
// -----------------------------------------------------------------------------
/* eslint indent: "off"                                                       */
/* global $                                                                   */
// -----------------------------------------------------------------------------

/*!
 * J1 ADoc ResultViewer
 * Copyright (C) 2021 Juergen Adams
 * Licensed under MIT License.
 */

var timeoutHandle;

function toggle_result_block(result_block) {
  window.clearTimeout(timeoutHandle);  // Clear the timeout object
  result_block.prev().toggleClass('stacked');
  result_block.toggle();
  // timeoutHandle = window.setTimeout(function () {
  //   result_block.hide();
  // }, 5000);
}

function insert_result_links() {
  $('.result').each(function(idx, node) {
    var result_block = $(node);
    var title_div = result_block.prev().find('.title');
    var view_result_link = $('<div class="view-result j1-viewer"><span class="btn-viewer j1-tooltip" data-toggle="tooltip" data-placement="left" title="toggle results" data-original-title="toggle results">View</span></div>');
    title_div.append(view_result_link);
    view_result_link.on('click', function(event) {
      event.preventDefault();
      toggle_result_block(result_block);
    });
  });
}

$(insert_result_links);
