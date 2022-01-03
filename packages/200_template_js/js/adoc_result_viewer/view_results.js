/*
 # -----------------------------------------------------------------------------
 # ~/js/adoc_result_viewer/view_results.js
 # Provides JavaScript functions displaying results for Asciidoctor
 # example block
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2021 Juergen Adams
 #
 # J1 Template is licensed under MIT License.
 # See: https://github.com/jekyll-one-org/J1 Template/blob/master/LICENSE
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
  window.clearTimeout(timeoutHandle);  // Clear the timeout object
  result_block.prev().toggleClass('stacked');
  result_block.toggle();

  // jadams: Improve auto-hide functionality for the results block
  //
  // timeoutHandle = window.setTimeout(function () {
  //   result_block.hide();
  // }, 5000);
}

function insert_result_links() {
  $('.result').each(function(idx, node) {
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

    view_result_link.on('click', function(event) {
      event.preventDefault();
      toggle_result_block(result_block);
    });
  });
}

$(insert_result_links);
