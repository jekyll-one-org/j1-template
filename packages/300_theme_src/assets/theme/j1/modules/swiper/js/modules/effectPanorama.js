/*
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/modules/swiper/js/modules/effectPanorama.js
 # J1 module for SwiperJS v11 (transition effect)
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

function EffectPanorama(_ref) {

    var {
        swiper,
        extendParams,
        on
    } = _ref;

    extendParams({
      panoramaEffect: {
        depth: 200,
        rotate: 30,
      },
    });

    on('beforeInit', () => {
      if (swiper.params.effect !== 'panorama') return;

      swiper.classNames.push(`${swiper.params.containerModifierClass}panorama`);
      swiper.classNames.push(`${swiper.params.containerModifierClass}3d`);
      const overwriteParams = {
        watchSlidesProgress: true,
      };
      Object.assign(swiper.params, overwriteParams);
      Object.assign(swiper.originalParams, overwriteParams);
    });

    on('progress', () => {
      if (swiper.params.effect !== 'panorama') return;

      const sizesGrid = swiper.slidesSizesGrid;
      const { depth = 200, rotate = 30 } = swiper.params.panoramaEffect;
      const angleRad = (rotate * Math.PI) / 180;
      const halfAngleRad = angleRad / 2;
      const angleModifier = 1 / (180 / rotate);

      for (let i = 0; i < swiper.slides.length; i += 1) {
        const slideEl = swiper.slides[i];
        const slideProgress = slideEl.progress;
        const slideSize = sizesGrid[i];
        const progressModifier = swiper.params.centeredSlides
          ? 0
          : (swiper.params.slidesPerView - 1) * 0.5;
        const modifiedProgress = slideProgress + progressModifier;
        const angleCos = 1 - Math.cos(modifiedProgress * angleModifier * Math.PI);
        const translateX = `${modifiedProgress * (slideSize / 3) * angleCos}px`;
        const rotateY = modifiedProgress * rotate;
        const radius = (slideSize * 0.5) / Math.sin(halfAngleRad);
        const translateZ = `${radius * angleCos - depth}px`;
        slideEl.style.transform =
          swiper.params.direction === 'horizontal'
            ? `translateX(${translateX}) translateZ(${translateZ}) rotateY(${rotateY}deg)`
            : `translateY(${translateX}) translateZ(${translateZ}) rotateX(${-rotateY}deg)`;
      }
    });

    on('setTransition', (s, duration) => {
      if (swiper.params.effect !== 'panorama') return;

      swiper.slides.forEach((slideEl) => {
        slideEl.style.transitionDuration = `${duration}ms`;
      });
    });

  } // END EffectPanorama