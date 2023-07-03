/*
 # -----------------------------------------------------------------------------
 # ~/200_theme_js/js/lazyCss/lazyCss.js
 # CSS loader to speed up inital rendering
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2023 Juergen Adams
 #
 # J1 Theme is licensed under the MIT License.
 # See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE.md
 # -----------------------------------------------------------------------------
*/
module.exports = function lazyCSS () {
  let options = {};

  const observe = (o) => {
      options = o;
      (('IntersectionObserver' in window && !sessionStorage[options.selector]) ? fnCssObserver : fnCssDomLink)();
  }

  const fnCssDomLink = () => {
      let link = document.createElement('link');
      link.rel = 'stylesheet';
      link.type = 'text/css';
      link.href = options.src;
      document.head.appendChild(link);
  }

  const fnCssObserver = () => {
      let fas = document.querySelectorAll(options.selector);
      let observer = new IntersectionObserver((entry, observer) => {
          if (entry[0].intersectionRatio > 0) {
              fnCssDomLink();
              sessionStorage[options.selector] = true;
              observer.disconnect();
          }
      }, { rootMargin: options.rootMargin });
      fas.forEach(fa => {
          observer.observe(fa);
      });
  }

  return { observe };
}
