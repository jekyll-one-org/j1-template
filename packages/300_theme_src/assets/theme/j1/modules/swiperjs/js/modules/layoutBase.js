/*
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/modules/swiper/js/modules/layoutBase.js
 # J1 Module for SwiperJS v11 (layout)
 # -----------------------------------------------------------------------------
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2025 Juergen Adams
 #
 # J1 Theme is licensed under MIT License.
 # See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 # -----------------------------------------------------------------------------
*/
"use strict";
function LayoutBase(_ref) {
  var {
    swiper,
    extendParams,
    params,
    on
  } = _ref;

  var renderBullet;

  // Fix J1 Swiper YAML data processing #3
  // ---------------------------------------------------------------------------
  // Inject the numbered renderBullet onto the LIVE pagination params
  // (swiper.params.pagination — the object the built-in Pagination module
  // actually reads when it renders the bullets). This is done in the
  // 'beforeInit' hook so it runs AFTER the params are finalized and BEFORE
  // Pagination renders on 'init', independent of any module-arg reference or
  // ordering assumptions. The Base swiper is created BY the adapter, so a
  // hook onto that instance is the correct (and only) place a passive layout
  // module can influence its pagination.
  //
  // TYPO (pre-existing, kept on purpose): the flag is misspelled 'nunbered'
  // in BOTH the YAML (defaults + swiper_control) AND the JS. It is honoured
  // as-is here so this fix works with the shipped config unchanged; the
  // correct spelling 'numbered' is ALSO accepted so a later YAML typo-fix
  // cannot silently disable numbering again. Renaming 'nunbered' -> 'numbered'
  // across YAML + all layout modules is best done as a separate change.
  //
  // NOTE (adapter): the guard in swiper.js that emits the layout module,
  //   {% if swiper_layout != 'Base' or swiper_layout != 'Parallax' %}
  //   modules: [Layout{{swiper_layout}}],
  //   {% endif %}
  // is ALWAYS true (a value cannot be both 'Base' and 'Parallax'), so
  // 'modules: [LayoutBase]' is in fact always emitted — which is what makes
  // this module run at all. That condition is left UNCHANGED here on purpose:
  // "fixing" it to 'and' would stop emitting LayoutBase for the Base layout
  // and disable numbering entirely.
  // ---------------------------------------------------------------------------
  //
  on('beforeInit', function () {
    var pagination = swiper.params.pagination;

    if (pagination && pagination.enabled && pagination.numbered) {
      renderBullet = (index, className) => { return `<span class="${className}"> ${++index} </span>`; };
      pagination.renderBullet = renderBullet;
    }
  });

} // END LayoutBase