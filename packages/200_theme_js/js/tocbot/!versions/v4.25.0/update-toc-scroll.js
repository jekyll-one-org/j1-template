/*
 # -----------------------------------------------------------------------------
 #  ~/js/tocbot/update-toc-scroll.js
 #  Tocbot v4.25.0 implementation for J1 Theme
 #
 #  Product/Info:
 #  https://jekyll.one
 #  https://tscanlin.github.io/tocbot
 #  https://github.com/tscanlin/tocbot
 #
 #  Copyright (C) 2023, 2024 Juergen Adams
 #  Copyright (C) 2016 - 2024 Tim Scanlin
 #
 #  J1 Theme is licensed under MIT License.
 #  See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE.md
 #  Tocbot is licensed under the MIT License.
 #  For details, https://github.com/tscanlin/tocbot/blob/master/LICENSE
 # -----------------------------------------------------------------------------
*/

// -----------------------------------------------------------------------------
// ESLint shimming
// -----------------------------------------------------------------------------
/* eslint no-var: "off"                                                       */
// -----------------------------------------------------------------------------

const SCROLL_LEEWAY = 30
module.exports = function updateTocScroll (options) {
  var toc = options.tocElement || document.querySelector(options.tocSelector)
  if (toc && toc.scrollHeight > toc.clientHeight) {
    var activeItem = toc.querySelector('.' + options.activeListItemClass)
    if (activeItem) {
      // Determine container top and bottom
      var cTop = toc.scrollTop
      var cBottom = cTop + toc.clientHeight

      // Determine element top and bottom
      var eTop = activeItem.offsetTop
      var eBottom = eTop + activeItem.clientHeight

      // Check if out of view
      // Above scroll view
      if (eTop < cTop + options.tocScrollOffset) {
        toc.scrollTop -= (cTop - eTop) + options.tocScrollOffset
      // Below scroll view
      } else if (eBottom > cBottom - options.tocScrollOffset - SCROLL_LEEWAY) {
        toc.scrollTop += (eBottom - cBottom) + options.tocScrollOffset + (2 * SCROLL_LEEWAY)
      }
    }
  }
}
