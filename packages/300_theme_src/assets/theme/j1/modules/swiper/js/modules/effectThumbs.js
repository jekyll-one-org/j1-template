/*
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/modules/swiper/js/modules/effectThumbs.js
 # J1 module for SwiperJS v11 (view)
 # -----------------------------------------------------------------------------
 #
 # Product/Info:
 # http://jekyll.one
 #
 # Copyright (C) 2025 Juergen Adams
 #
 # J1 Theme is licensed under MIT License.
 # See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 # -----------------------------------------------------------------------------
*/
"use strict";

function EffectThumbs(_ref) {

  var {
    swiper,
    extendParams,
    params,
    on
  } = _ref;

  // set (module) options
  const commonParams  = params.thumbs;
  const thumbSpeed    = commonParams.speed/2;
  const mainSpeed     = commonParams.speed;

  // ---------------------------------------------------------------------------
  // effect initializer
  // ---------------------------------------------------------------------------

  // main swiper
  //
  const mainSwiper    = document.querySelector(`#${commonParams.swiper_id}`);
  const mainSwiperEl  = mainSwiper.querySelector('.swiper');

  // create thmubs swiper (duplicate from main)
  //
  const swiperThumbEl = mainSwiperEl.cloneNode(true);
  swiperThumbEl.classList.add('thumbs-slider');
  mainSwiper.insertBefore(swiperThumbEl, mainSwiperEl);

  const swiperThumbSlides      = swiperThumbEl.querySelectorAll('.swiper-slide');
  const swiperThumbLastSlideEl = swiperThumbSlides[swiperThumbSlides.length - 1];

  if (commonParams.placement === 'bottom') {
    // place thumbs slider AFTER the main swiper (place at botton)
    // ---------------------------------------------------------------------
    mainSwiper.appendChild(swiperThumbEl);
    mainSwiperEl.classList.add('mb-1');
    swiperThumbEl.classList.add('thumbs-slider--bottom');
  } else if (commonParams.placement === 'top') {
    // place thumbs slider BEFORE the main swiper (place on top)
    // ---------------------------------------------------------------------
    swiperThumbEl
      .querySelector('.swiper-wrapper')
      .insertBefore(swiperThumbLastSlideEl, swiperThumbLastSlideEl[0]);

      mainSwiperEl.classList.add('mt-1');
      swiperThumbEl.classList.add('thumbs-slider--top');
  } else {
    // place thumbs at botton (default)
    // ---------------------------------------------------------------------
    mainSwiper.appendChild(swiperThumbEl);
    mainSwiperEl.classList.add('mb-1');
    swiperThumbEl.classList.add('thumbs-slider--bottom');
  }


  // ---------------------------------------------------------------------------
  // slider initializer
  // ---------------------------------------------------------------------------

  const thumbSlider = new Swiper(swiperThumbEl, {
    autoHeight:     commonParams.autoHeight,
    grabCursor:     commonParams.grabCursor,
    speed:          commonParams.speed * .5,
    spaceBetween:   commonParams.spaceBetween,
    slidesPerView:  commonParams.slidesPerView,
  });

  const mainSlider = new Swiper(mainSwiperEl, {
    grabCursor:     commonParams.grabCursor,
    speed:          commonParams.speed,
    thumbs: {
      swiper:       thumbSlider,
    },
  });


  // ---------------------------------------------------------------------------
  // events
  // ---------------------------------------------------------------------------   

  mainSlider.on('init', function (swiper) {
    if (commonParams.slideHeight !== 'auto') {
      swiper.slides.forEach(slide => { slide.style.height = `${commonParams.slideHeight}px`; });
    }
  });

  mainSlider.on('slideChangeTransitionStart', function (swiper) {
    thumbSlider.slideTo(swiper.activeIndex);
  });

  thumbSlider.on('transitionStart', function (swiper) {
    mainSlider.slideTo(swiper.activeIndex);
  });

} // END EffectThumbs
