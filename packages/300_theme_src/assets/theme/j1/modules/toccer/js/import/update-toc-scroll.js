/*
 # -----------------------------------------------------------------------------
 # ~/js/tocbot/tocbot/import/update-toc-scroll.js
 # Updater for the scroller element used by tocbot
 # Tocbot v4.36.4
 #
 # Product/Info:
 # https://jekyll.one
 # https://tscanlin.github.io/tocbot
 # https://github.com/tscanlin/tocbot
 #
 # Copyright (C) 2016 Tim Scanlin
 # Copyright (C) 2023-2026 Juergen Adams
 #
 # Tocbot is licensed under the MIT License.
 # For details, https://github.com/tscanlin/tocbot/blob/master/LICENSE
 # J1 Theme is licensed under MIT License.
 # See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE 
 # -----------------------------------------------------------------------------
*/

// -----------------------------------------------------------------------------
// ESLint shimming
// -----------------------------------------------------------------------------
/* eslint indent: "off"                                                       */

export default function updateTocScroll(options) {
  const toc =
    options.tocScrollingWrapper ||
    options.tocElement ||
    document.querySelector(options.tocSelector);
  if (toc && toc.scrollHeight > toc.clientHeight) {
    const activeItem = toc.querySelector(`.${options.activeListItemClass}`);
    if (activeItem) {
      // Determine element top and bottom
      const eTop = activeItem.offsetTop;

      // Check if out of view
      // Above scroll view
      const scrollAmount = eTop - options.tocScrollOffset;
      toc.scrollTop = scrollAmount > 0 ? scrollAmount : 0;
    }
  }
}
