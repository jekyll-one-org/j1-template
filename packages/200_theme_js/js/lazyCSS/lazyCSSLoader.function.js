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

module.exports = function lazyCSSLoader () {
"use strict";

  let options = {};

  const observe = (opt) => {
    options = opt;

    // sessionStorage NOT used
    //
    // (('IntersectionObserver' in window && !sessionStorage[options.selector]) ? fnCssObserver : fnCssDomLink)();
    (('IntersectionObserver' in window) ? fnCssObserver : doNothing) ();
  }

  const doNothing = () => {
    observe = false;
  }

  const fnCssDomLink = () => {
      let link = document.createElement('link');
      let id = 'lazy' + options.selector;
      link.id = id.replace('.', '_');;
      link.rel = 'stylesheet';
      link.type = 'text/css';
      link.href = options.src;
      document.head.appendChild(link);
  }

  const fnCssObserver = () => {
      let selectors = document.querySelectorAll(options.selector);
      let observer = new IntersectionObserver((entry, observer) => {
          if (entry[0].intersectionRatio > 0) {
              fnCssDomLink();
              sessionStorage[options.selector] = true;
              observer.disconnect();
          }
      }, { rootMargin: options.rootMargin });
      selectors.forEach(selector => {
          observer.observe(selector);
      });
  }

  return { observe };
}
