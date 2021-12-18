/*
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/modules/advertising/js/google/adInitializer.js
 # JS helper for Google Adsense to initialze all units in a page
 #
 #  Product/Info:
 #  http://jekyll.one
 #
 #  Copyright (C) 2021 Juergen Adams
 #
 #  J1 Template is licensed under MIT License.
 #  See: https://github.com/jekyll-one/J1 Template/blob/master/LICENSE
 # -----------------------------------------------------------------------------
*/

$(document).ready(function() {
  var logger    = log4javascript.getLogger('j1.core.advertising.google');
  var ads_found = document.getElementsByClassName('adsbygoogle').length;

  var dependencies_met_page_ready = setInterval (function (options) {
    if (j1.getState() === 'finished') {
      logger.info('\n' + 'initialize all ads in page: #' + ads_found);
      [].forEach.call(document.querySelectorAll('.adsbygoogle'), function() {
        (adsbygoogle = window.adsbygoogle || []).push({});
      });
      clearInterval(dependencies_met_page_ready);
    }
  }, 25);
});
