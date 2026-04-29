/*
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/modules/photoswipe/js/photoswipe-caption-plugin.js (1)
 # PhotoSwipe Dynamic Caption plugin 1.2.7 by Dmytro Semenov 
 # UMD version to be used with webbrowsers
 # -----------------------------------------------------------------------------
 #
 # Product/Info:
 # https://github.com/dimsemenov/photoswipe-dynamic-caption-plugin

 # Copyright (C) 2021 Dmitry Semenov
 #
 # PhotoSwipe is licensed under the MIT License.
 # See: https://github.com/dimsemenov/photoswipe-dynamic-caption-plugin/blob/main/LICENSE
 # -----------------------------------------------------------------------------
*/

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.PhotoSwipeDynamicCaption = factory());
  })(this, (function () { 'use strict';
   
    const defaultOptions = {
      captionContent: '.pswp-caption-content',
      type: 'auto',
      horizontalEdgeThreshold: 20,
      mobileCaptionOverlapRatio: 0.3,
      mobileLayoutBreakpoint: 600,
      verticallyCenterImage: false
    };
  
    class PhotoSwipeDynamicCaption {
      constructor(lightbox, options) {
        this.options = {
          ...defaultOptions,
          ...options
        };
  
        this.lightbox = lightbox;
  
        this.lightbox.on('init', () => {
          this.pswp = this.lightbox.pswp;
          this.initCaption();
        });
      }
  
      initCaption() {
        const { pswp } = this;
  
        pswp.on('change', () => {
          // make sure caption is displayed after slides are switched
          this.showCaption(this.pswp.currSlide);
        });
  
        pswp.on('calcSlideSize', (e) => this.onCalcSlideSize(e));
  
        pswp.on('slideDestroy', (e) => {
          if (e.slide.dynamicCaption) {
            // claude - PhotoSwipe optimization chances
            // Clear any pending fade timeout BEFORE removing the
            // element. Otherwise a hide/show toggle that happened just
            // before destroy would still fire its 50ms / 400ms callback
            // afterwards, mutating .style on a detached node and
            // keeping the captured `slide` reference alive longer than
            // necessary.
            if (e.slide.captionFadeTimeout) {
              clearTimeout(e.slide.captionFadeTimeout);
              delete e.slide.captionFadeTimeout;
            }
            if (e.slide.dynamicCaption.element) {
              e.slide.dynamicCaption.element.remove();
            }
            delete e.slide.dynamicCaption;
          }
        });
  
        // hide caption if zoomed
        // claude - PhotoSwipe optimization chances
        // The original handler ran every property write on every
        // zoom/pan tick (often >60Hz on high-refresh trackpads). The
        // optimised version:
        //   1. Returns early using a single inverted guard.
        //   2. Caches the previous "zoomed in vs at-initial" state on
        //      the slide so hide/show/adjustPanArea only fire when the
        //      boundary is actually crossed (those calls each do class
        //      toggles or scratch-pad swaps that aren't free).
        //   3. Caches the last applied translateY so we skip the
        //      `el.style.transform = ...` write when the value would
        //      not change.
        pswp.on('zoomPanUpdate', ({ slide }) => {
          if (!pswp.opener.isOpen || !slide.dynamicCaption) {
            return;
          }

          const dc = slide.dynamicCaption;
          const isZoomedIn = slide.currZoomLevel > slide.zoomLevels.initial;

          if (dc._wasZoomedIn !== isZoomedIn) {
            dc._wasZoomedIn = isZoomedIn;
            if (isZoomedIn) {
              this.hideCaption(slide);
            } else {
              this.showCaption(slide);
            }
            // Pan-area swap is only meaningful when the zoom boundary
            // is crossed; running it every frame inside the same state
            // was a no-op pair of property reads/writes.
            this.adjustPanArea(slide, slide.currZoomLevel);
          }

          // Move caption on vertical drag. When zoomed in we pin
          // offset to 0; otherwise mirror the user's pan so the
          // caption stays attached to the bottom edge of the image.
          if (dc.element) {
            let captionYOffset = 0;
            if (!isZoomedIn) {
              const shiftedAmount = slide.pan.y - slide.bounds.center.y;
              if (Math.abs(shiftedAmount) > 1) {
                captionYOffset = shiftedAmount;
              }
            }

            if (dc._lastYOffset !== captionYOffset) {
              dc._lastYOffset = captionYOffset;
              this.setCaptionYOffset(dc.element, captionYOffset);
            }
          }
        });
  
        pswp.on('beforeZoomTo', (e) => {
          this.adjustPanArea(pswp.currSlide, e.destZoomLevel);
        });
  
        // Stop default action of tap when tapping on the caption
        pswp.on('tapAction', (e) => {
          if (e.originalEvent.target.closest('.pswp__dynamic-caption')) {
            e.preventDefault();
          }
        });
      }
  
      adjustPanArea(slide, zoomLevel) {
        if (slide.dynamicCaption && slide.dynamicCaption.adjustedPanAreaSize) {
          if (zoomLevel > slide.zoomLevels.initial) {
            slide.panAreaSize.x = slide.dynamicCaption.originalPanAreaSize.x;
            slide.panAreaSize.y = slide.dynamicCaption.originalPanAreaSize.y;
          } else {
            // Restore panAreaSize after we zoom back to initial position
            slide.panAreaSize.x = slide.dynamicCaption.adjustedPanAreaSize.x;
            slide.panAreaSize.y = slide.dynamicCaption.adjustedPanAreaSize.y;
          }
        }
      }
  
      useMobileLayout() {
        const { mobileLayoutBreakpoint } = this.options;
  
        if (typeof mobileLayoutBreakpoint === 'function') {
          return mobileLayoutBreakpoint.call(this);
        } else if (typeof mobileLayoutBreakpoint === 'number') {
          if (window.innerWidth < mobileLayoutBreakpoint) {
            return true;
          }
        }
        
        return false;
      }
  
      hideCaption(slide) {
        if (slide.dynamicCaption && !slide.dynamicCaption.hidden) {
          const captionElement = slide.dynamicCaption.element;
  
          if (!captionElement) {
            return;
          }
  
          slide.dynamicCaption.hidden = true;
          captionElement.classList.add('pswp__dynamic-caption--faded');
  
          // Disable caption visibility with the delay, so it's not interactable 
          if (slide.captionFadeTimeout) {
            clearTimeout(slide.captionFadeTimeout);
          }
          slide.captionFadeTimeout = setTimeout(() => {
            captionElement.style.visibility = 'hidden';
            delete slide.captionFadeTimeout;
          }, 400);
        }
      }
  
      setCaptionYOffset(el, y) {
        // claude - PhotoSwipe optimization chances
        // Single property write; callers are responsible for
        // de-duplicating identical values (see zoomPanUpdate handler).
        el.style.transform = `translateY(${y}px)`;
      }
  
      showCaption(slide) {
        if (slide.dynamicCaption && slide.dynamicCaption.hidden) {
          const captionElement = slide.dynamicCaption.element;
  
          if (!captionElement) {
            return;
          }
  
          slide.dynamicCaption.hidden = false;
          captionElement.style.visibility = 'visible';
          
          // claude - PhotoSwipe optimization chances
          // The 50ms timeout exists so the browser commits the
          // visibility:visible style in its own frame BEFORE the
          // opacity transition kicks in (otherwise the element flashes
          // straight to opaque on some engines). Clearing any pending
          // hide-timeout above is what prevents the previously
          // scheduled visibility:hidden from clobbering us mid-fade.
          clearTimeout(slide.captionFadeTimeout);
          slide.captionFadeTimeout = setTimeout(() => {
            captionElement.classList.remove('pswp__dynamic-caption--faded');
            delete slide.captionFadeTimeout;
          }, 50);
        }
      }
  
      setCaptionPosition(captionEl, x, y) {
        const isOnHorizontalEdge = (x <= this.options.horizontalEdgeThreshold);
        captionEl.classList[
          isOnHorizontalEdge ? 'add' : 'remove'
        ]('pswp__dynamic-caption--on-hor-edge');
  
        captionEl.style.left = x + 'px';
        captionEl.style.top = y + 'px';
      }
  
      setCaptionWidth(captionEl, width) {
        if (!width) {
          captionEl.style.removeProperty('width');
        } else {
          captionEl.style.width = width + 'px';
        }
      }
  
      setCaptionType(captionEl, type) {
        const prevType = captionEl.dataset.pswpCaptionType;
        if (type !== prevType) {
          captionEl.classList.add('pswp__dynamic-caption--' + type);
          captionEl.classList.remove('pswp__dynamic-caption--' + prevType);
          captionEl.dataset.pswpCaptionType = type;
        }
      }
  
      updateCaptionPosition(slide) {
        if (!slide.dynamicCaption || !slide.dynamicCaption.type || !slide.dynamicCaption.element) {
          return;
        }
  
        // claude - PhotoSwipe optimization chances
        // Cache the element reference; the original re-read
        // `slide.dynamicCaption.element` up to four times per call.
        const captionEl = slide.dynamicCaption.element;
        const type      = slide.dynamicCaption.type;
  
        if (type === 'mobile') {
          this.setCaptionType(captionEl, type);
          captionEl.style.removeProperty('left');
          captionEl.style.removeProperty('top');
          this.setCaptionWidth(captionEl, false);
          return;
        }
  
        // claude - PhotoSwipe optimization chances
        // Hoist the shared image-size and centre values out of the
        // type-specific branches so each branch only does the work it
        // needs (no duplicated multiplications, no repeated
        // bounds.center lookups).
        const zoomLevel  = slide.zoomLevels.initial;
        const imageWidth = Math.ceil(slide.width  * zoomLevel);
        const center     = slide.bounds.center;
  
        this.setCaptionType(captionEl, type);
        if (type === 'aside') {
          this.setCaptionPosition(
            captionEl,
            center.x + imageWidth,
            center.y
          );
          this.setCaptionWidth(captionEl, false);
        } else if (type === 'below') {
          const imageHeight = Math.ceil(slide.height * zoomLevel);
          this.setCaptionPosition(
            captionEl,
            center.x,
            center.y + imageHeight
          );
          this.setCaptionWidth(captionEl, imageWidth);
        }
      }
  
      onCalcSlideSize(e) {
        const { slide } = e;
        let captionSize;
        let useMobileVersion;
  
        if (!slide.dynamicCaption) {
          slide.dynamicCaption = {
            element: undefined,
            type: false,
            hidden: false
          };
  
          const captionHTML = this.getCaptionHTML(slide);
  
          if (!captionHTML) {
            return;
          }
  
          slide.dynamicCaption.element = document.createElement('div');
          slide.dynamicCaption.element.className = 'pswp__dynamic-caption pswp__hide-on-close';
          slide.dynamicCaption.element.innerHTML = captionHTML;
  
          this.pswp.dispatch('dynamicCaptionUpdateHTML', { 
            captionElement: slide.dynamicCaption.element,
            slide
          });
  
          slide.holderElement.appendChild(slide.dynamicCaption.element);
        }
  
        // claude - PhotoSwipe optimization chances
        // Cache the element reference once; used multiple times below.
        const captionEl = slide.dynamicCaption.element;
        if (!captionEl) {
          return;
        }
  
        this.storeOriginalPanAreaSize(slide);
  
        slide.bounds.update(slide.zoomLevels.initial);
        
        if (this.useMobileLayout()) {
          slide.dynamicCaption.type = 'mobile';
          useMobileVersion = true;
        } else if (this.options.type === 'auto') {
          // claude - PhotoSwipe optimization chances
          // Flattened the nested if/else into a single chain; same
          // semantics, one fewer level of indentation.
          slide.dynamicCaption.type =
            (slide.bounds.center.x > slide.bounds.center.y) ? 'aside' : 'below';
        } else {
          slide.dynamicCaption.type = this.options.type;
        }
  
        const imageWidth  = Math.ceil(slide.width  * slide.zoomLevels.initial);
        const imageHeight = Math.ceil(slide.height * slide.zoomLevels.initial);
  
        this.setCaptionType(captionEl, slide.dynamicCaption.type);
  
        if (slide.dynamicCaption.type === 'aside') {
          this.setCaptionWidth(captionEl, false);
          captionSize = this.measureCaptionSize(captionEl, e.slide);
  
          const captionWidth      = captionSize.x;
          const horizontalEnding  = imageWidth + slide.bounds.center.x;
          const horizontalLeftover = (slide.panAreaSize.x - horizontalEnding);
  
          if (horizontalLeftover <= captionWidth) {
            slide.panAreaSize.x -= captionWidth;
            this.recalculateZoomLevelAndBounds(slide);
          }
        } else if (slide.dynamicCaption.type === 'below' || useMobileVersion) {
          this.setCaptionWidth(
            captionEl,
            useMobileVersion ? this.pswp.viewportSize.x : imageWidth
          );
  
          captionSize = this.measureCaptionSize(captionEl, e.slide);
          const captionHeight = captionSize.y;
  
          if (this.options.verticallyCenterImage) {
            slide.panAreaSize.y -= captionHeight;
            this.recalculateZoomLevelAndBounds(slide);
          } else {
            // Lift the image up by (at most) the caption height so the
            // caption can dock below it without overlap.
            const verticalEnding   = imageHeight + slide.bounds.center.y;
            const verticalLeftover = slide.panAreaSize.y - verticalEnding;
            const initialPanAreaHeight = slide.panAreaSize.y;
  
            if (verticalLeftover <= captionHeight) {
              // Reduce the pan area to give the caption breathing room
              // (capped so a tall caption can't shrink the image off-
              // screen).
              slide.panAreaSize.y -= Math.min((captionHeight - verticalLeftover) * 2, captionHeight);
              this.recalculateZoomLevelAndBounds(slide);
  
              const maxPositionX = slide.panAreaSize.x * this.options.mobileCaptionOverlapRatio / 2;
  
              // On mobile, if the image is already too horizontally
              // off-centre we'd rather let the caption overlap than
              // shrink the image further -- restore the original
              // pan-area height and recompute.
              if (useMobileVersion && slide.bounds.center.x > maxPositionX) {
                slide.panAreaSize.y = initialPanAreaHeight;
                this.recalculateZoomLevelAndBounds(slide);
              }
            }
          }
        }
        // claude - PhotoSwipe optimization chances
        // Removed the original empty `else ;` branch -- it was a dead
        // no-op left over from the original minifier output and only
        // added noise.
  
        this.storeAdjustedPanAreaSize(slide);
        this.updateCaptionPosition(slide);
      }
  
      measureCaptionSize(captionEl, slide) {
        const rect = captionEl.getBoundingClientRect();
        const event = this.pswp.dispatch('dynamicCaptionMeasureSize', {
          captionEl,
          slide,
          captionSize: {
            x: rect.width,
            y: rect.height
          }
        });
        return event.captionSize;
      }
  
      recalculateZoomLevelAndBounds(slide) {
        slide.zoomLevels.update(slide.width, slide.height, slide.panAreaSize);
        slide.bounds.update(slide.zoomLevels.initial);
      }
  
      storeAdjustedPanAreaSize(slide) {
        if (slide.dynamicCaption) {
          if (!slide.dynamicCaption.adjustedPanAreaSize) {
            slide.dynamicCaption.adjustedPanAreaSize = {};
          }
          slide.dynamicCaption.adjustedPanAreaSize.x = slide.panAreaSize.x;
          slide.dynamicCaption.adjustedPanAreaSize.y = slide.panAreaSize.y;
        }
      }
  
      storeOriginalPanAreaSize(slide) {
        if (slide.dynamicCaption) {
          if (!slide.dynamicCaption.originalPanAreaSize) {
            slide.dynamicCaption.originalPanAreaSize = {};
          }
          slide.dynamicCaption.originalPanAreaSize.x = slide.panAreaSize.x;
          slide.dynamicCaption.originalPanAreaSize.y = slide.panAreaSize.y;
        }
      }
  
      getCaptionHTML(slide) {
        if (typeof this.options.captionContent === 'function') {
          return this.options.captionContent.call(this, slide);
        }
  
        const currSlideElement = slide.data.element;
        let captionHTML = '';
        if (currSlideElement) {
          const hiddenCaption = currSlideElement.querySelector(this.options.captionContent);
          if (hiddenCaption) {
            // get caption from element with class pswp-caption-content
            captionHTML = hiddenCaption.innerHTML;
          } else {
            const img = currSlideElement.querySelector('img');
            if (img) {
              // get caption from alt attribute
              captionHTML = img.getAttribute('alt');
            }
          }
        }
        return captionHTML;
      }
    }
  
    return PhotoSwipeDynamicCaption;
  
  }));
  