(window, document, jQuery),
function ($, window) {
  "use strict";
  window.MSOverlayLayerController = function () {
    MSLayerController.apply(this, arguments)
  }, MSOverlayLayerController.extend(MSLayerController);
  var p = MSOverlayLayerController.prototype,
    _super = MSLayerController.prototype;
  p.addLayer = function (layer) {
    var showOnSlides = layer.$element.data("show-on"),
      hideOnSlides = layer.$element.data("hide-on");
    hideOnSlides && (layer.hideOnSlides = hideOnSlides.replace(/\s+/g, "").split(",")), showOnSlides && (layer.showOnSlides = showOnSlides.replace(/\s+/g, "").split(",")), _super.addLayer.apply(this, arguments)
  }, p.create = function () {
    _super.create.apply(this, arguments), this.slider.api.addEventListener(MSSliderEvent.CHANGE_START, this.checkLayers.bind(this))
  }, p.checkLayers = function () {
    if (this.ready)
      for (var i = 0; i !== this.layersCount; ++i) {
        var layer = this.layers[i];
        layer.waitForAction || (this._checkForShow(layer) ? layer.start() : layer.hide())
      }
  }, p._enableParallaxEffect = function () {
    this.slider.view.$element.on("mousemove", {
      that: this
    }, this._mouseParallaxMove).on("mouseleave", {
      that: this
    }, this._resetParalax)
  }, p._disableParallaxEffect = function () {
    this.slider.view.$element.off("mousemove", this._mouseParallaxMove).off("mouseleave", this._resetParalax)
  }, p._startLayers = function () {
    for (var i = 0; i !== this.layersCount; ++i) {
      var layer = this.layers[i];
      this._checkForShow(layer) && !layer.waitForAction && layer.start()
    }
  }, p._checkForShow = function (layer) {
    var slideId = this.slider.api.currentSlide.id,
      layerHideOn = layer.hideOnSlides,
      layerShowOn = layer.showOnSlides;
    return layerShowOn ? !!slideId && -1 !== layerShowOn.indexOf(slideId) : !slideId || !layerHideOn || layerHideOn.length && -1 === layerHideOn.indexOf(slideId)
  }
}(jQuery, window, document),

function ($, window) {
  "use strict";
  window.MSOverlayLayers = function (slider) {
    this.slider = slider
  };
  var p = MSOverlayLayers.prototype;
  p.setupLayerController = function () {
    this.layerController = new MSOverlayLayerController(this), this.slider.api.addEventListener(MSSliderEvent.RESIZE, this.setSize.bind(this)), this.slider.api.addEventListener(MSSliderEvent.CHANGE_START, this.setSize.bind(this)), this.setSize()
  }, p.setSize = function () {
    this.__width = this.$element.width(), this.__height = this.$element.height(), this.layerController.setSize(this.__width, this.__height)
  }, p.create = function () {
    this.layerController.create(), this.layerController.loadLayers(this._onLayersLoad), this.layerController.prepareToShow(), window.pointerEventsPolyfill && window.pointerEventsPolyfill({
      selector: "#" + this.slider.$element.attr("id") + " .ms-overlay-layers",
      forcePolyfill: !1
    })
  }, p.getHeight = function () {
    return this.slider.api.currentSlide.getHeight()
  }, p.destroy = function () {
    this.layerController.destroy()
  }, p._onLayersLoad = function () {
    this.ready = !0, this.selected = !0, this.layersLoaded = !0, this.setSize(), this.layerController.showLayers()
  }
}(jQuery, window, document),

function ($) {
  window.MSLayerEffects = {};
  var installed, _fade = {
    opacity: 0
  };
  MSLayerEffects.setup = function () {
    if (!installed) {
      installed = !0;
      var st = MSLayerEffects,
        transform_css = window._jcsspfx + "Transform",
        transform_orig_css = window._jcsspfx + "TransformOrigin",
        o = $.browser.opera;
      _2d = window._css2d && window._cssanim && !o, st.defaultValues = {
        left: 0,
        top: 0,
        opacity: isMSIE("<=9") ? 1 : "",
        right: 0,
        bottom: 0
      }, st.defaultValues[transform_css] = "", st.rf = 1, st.presetEffParams = {
        random: "30|300",
        "long": 300,
        "short": 30,
        "false": !1,
        "true": !0,
        tl: "top left",
        bl: "bottom left",
        tr: "top right",
        br: "bottom right",
        rt: "top right",
        lb: "bottom left",
        lt: "top left",
        rb: "bottom right",
        t: "top",
        b: "bottom",
        r: "right",
        l: "left",
        c: "center"
      }, st.fade = function () {
        return _fade
      }, st.left = _2d ? function (dist, fade) {
        var r = fade === !1 ? {} : {
          opacity: 0
        };
        return r[transform_css] = "translateX(" + -dist * st.rf + "px)", r
      } : function (dist, fade) {
        var r = fade === !1 ? {} : {
          opacity: 0
        };
        return r.left = -dist * st.rf + "px", r
      }, st.right = _2d ? function (dist, fade) {
        var r = fade === !1 ? {} : {
          opacity: 0
        };
        return r[transform_css] = "translateX(" + dist * st.rf + "px)", r
      } : function (dist, fade) {
        var r = fade === !1 ? {} : {
          opacity: 0
        };
        return r.left = dist * st.rf + "px", r
      }, st.top = _2d ? function (dist, fade) {
        var r = fade === !1 ? {} : {
          opacity: 0
        };
        return r[transform_css] = "translateY(" + -dist * st.rf + "px)", r
      } : function (dist, fade) {
        var r = fade === !1 ? {} : {
          opacity: 0
        };
        return r.top = -dist * st.rf + "px", r
      }, st.bottom = _2d ? function (dist, fade) {
        var r = fade === !1 ? {} : {
          opacity: 0
        };
        return r[transform_css] = "translateY(" + dist * st.rf + "px)", r
      } : function (dist, fade) {
        var r = fade === !1 ? {} : {
          opacity: 0
        };
        return r.top = dist * st.rf + "px", r
      }, st.from = _2d ? function (leftdis, topdis, fade) {
        var r = fade === !1 ? {} : {
          opacity: 0
        };
        return r[transform_css] = "translateX(" + leftdis * st.rf + "px) translateY(" + topdis * st.rf + "px)", r
      } : function (leftdis, topdis, fade) {
        var r = fade === !1 ? {} : {
          opacity: 0
        };
        return r.top = topdis * st.rf + "px", r.left = leftdis * st.rf + "px", r
      }, st.rotate = _2d ? function (deg, orig) {
        var r = {
          opacity: 0
        };
        return r[transform_css] = " rotate(" + deg + "deg)", orig && (r[transform_orig_css] = orig), r
      } : function () {
        return _fade
      }, st.rotateleft = _2d ? function (deg, dist, orig, fade) {
        var r = st.left(dist, fade);
        return r[transform_css] += " rotate(" + deg + "deg)", orig && (r[transform_orig_css] = orig), r
      } : function (deg, dist, orig, fade) {
        return st.left(dist, fade)
      }, st.rotateright = _2d ? function (deg, dist, orig, fade) {
        var r = st.right(dist, fade);
        return r[transform_css] += " rotate(" + deg + "deg)", orig && (r[transform_orig_css] = orig), r
      } : function (deg, dist, orig, fade) {
        return st.right(dist, fade)
      }, st.rotatetop = _2d ? function (deg, dist, orig, fade) {
        var r = st.top(dist, fade);
        return r[transform_css] += " rotate(" + deg + "deg)", orig && (r[transform_orig_css] = orig), r
      } : function (deg, dist, orig, fade) {
        return st.top(dist, fade)
      }, st.rotatebottom = _2d ? function (deg, dist, orig, fade) {
        var r = st.bottom(dist, fade);
        return r[transform_css] += " rotate(" + deg + "deg)", orig && (r[transform_orig_css] = orig), r
      } : function (deg, dist, orig, fade) {
        return st.bottom(dist, fade)
      }, st.rotatefrom = _2d ? function (deg, leftdis, topdis, orig, fade) {
        var r = st.from(leftdis, topdis, fade);
        return r[transform_css] += " rotate(" + deg + "deg)", orig && (r[transform_orig_css] = orig), r
      } : function (deg, leftdis, topdis, orig, fade) {
        return st.from(leftdis, topdis, fade)
      }, st.skewleft = _2d ? function (deg, dist, fade) {
        var r = st.left(dist, fade);
        return r[transform_css] += " skewX(" + deg + "deg)", r
      } : function (deg, dist, fade) {
        return st.left(dist, fade)
      }, st.skewright = _2d ? function (deg, dist, fade) {
        var r = st.right(dist, fade);
        return r[transform_css] += " skewX(" + -deg + "deg)", r
      } : function (deg, dist, fade) {
        return st.right(dist, fade)
      }, st.skewtop = _2d ? function (deg, dist, fade) {
        var r = st.top(dist, fade);
        return r[transform_css] += " skewY(" + deg + "deg)", r
      } : function (deg, dist, fade) {
        return st.top(dist, fade)
      }, st.skewbottom = _2d ? function (deg, dist, fade) {
        var r = st.bottom(dist, fade);
        return r[transform_css] += " skewY(" + -deg + "deg)", r
      } : function (deg, dist, fade) {
        return st.bottom(dist, fade)
      }, st.scale = _2d ? function (x, y, orig, fade) {
        var r = fade === !1 ? {} : {
          opacity: 0
        };
        return r[transform_css] = " scaleX(" + x + ") scaleY(" + y + ")", orig && (r[transform_orig_css] = orig), r
      } : function (x, y, orig, fade) {
        return fade === !1 ? {} : {
          opacity: 0
        }
      }, st.scaleleft = _2d ? function (x, y, dist, orig, fade) {
        var r = st.left(dist, fade);
        return r[transform_css] = " scaleX(" + x + ") scaleY(" + y + ")", orig && (r[transform_orig_css] = orig), r
      } : function (x, y, dist, orig, fade) {
        return st.left(dist, fade)
      }, st.scaleright = _2d ? function (x, y, dist, orig, fade) {
        var r = st.right(dist, fade);
        return r[transform_css] = " scaleX(" + x + ") scaleY(" + y + ")", orig && (r[transform_orig_css] = orig), r
      } : function (x, y, dist, orig, fade) {
        return st.right(dist, fade)
      }, st.scaletop = _2d ? function (x, y, dist, orig, fade) {
        var r = st.top(dist, fade);
        return r[transform_css] = " scaleX(" + x + ") scaleY(" + y + ")", orig && (r[transform_orig_css] = orig), r
      } : function (x, y, dist, orig, fade) {
        return st.top(dist, fade)
      }, st.scalebottom = _2d ? function (x, y, dist, orig, fade) {
        var r = st.bottom(dist, fade);
        return r[transform_css] = " scaleX(" + x + ") scaleY(" + y + ")", orig && (r[transform_orig_css] = orig), r
      } : function (x, y, dist, orig, fade) {
        return st.bottom(dist, fade)
      }, st.scalefrom = _2d ? function (x, y, leftdis, topdis, orig, fade) {
        var r = st.from(leftdis, topdis, fade);
        return r[transform_css] += " scaleX(" + x + ") scaleY(" + y + ")", orig && (r[transform_orig_css] = orig), r
      } : function (x, y, leftdis, topdis, orig, fade) {
        return st.from(leftdis, topdis, fade)
      }, st.rotatescale = _2d ? function (deg, x, y, orig, fade) {
        var r = st.scale(x, y, orig, fade);
        return r[transform_css] += " rotate(" + deg + "deg)", orig && (r[transform_orig_css] = orig), r
      } : function (deg, x, y, orig, fade) {
        return st.scale(x, y, orig, fade)
      }, st.front = window._css3d ? function (dist, fade) {
        var r = fade === !1 ? {} : {
          opacity: 0
        };
        return r[transform_css] = "perspective(2000px) translate3d(0 , 0 ," + dist + "px ) rotate(0.001deg)", r
      } : function () {
        return _fade
      }, st.back = window._css3d ? function (dist, fade) {
        var r = fade === !1 ? {} : {
          opacity: 0
        };
        return r[transform_css] = "perspective(2000px) translate3d(0 , 0 ," + -dist + "px ) rotate(0.001deg)", r
      } : function () {
        return _fade
      }, st.rotatefront = window._css3d ? function (deg, dist, orig, fade) {
        var r = fade === !1 ? {} : {
          opacity: 0
        };
        return r[transform_css] = "perspective(2000px) translate3d(0 , 0 ," + dist + "px ) rotate(" + (deg || .001) + "deg)", orig && (r[transform_orig_css] = orig), r
      } : function () {
        return _fade
      }, st.rotateback = window._css3d ? function (deg, dist, orig, fade) {
        var r = fade === !1 ? {} : {
          opacity: 0
        };
        return r[transform_css] = "perspective(2000px) translate3d(0 , 0 ," + -dist + "px ) rotate(" + (deg || .001) + "deg)", orig && (r[transform_orig_css] = orig), r
      } : function () {
        return _fade
      }, st.rotate3dleft = window._css3d ? function (x, y, z, dist, orig, fade) {
        var r = st.left(dist, fade);
        return r[transform_css] += (x ? " rotateX(" + x + "deg)" : " ") + (y ? " rotateY(" + y + "deg)" : "") + (z ? " rotateZ(" + z + "deg)" : ""), orig && (r[transform_orig_css] = orig), r
      } : function (x, y, z, dist, orig, fade) {
        return st.left(dist, fade)
      }, st.rotate3dright = window._css3d ? function (x, y, z, dist, orig, fade) {
        var r = st.right(dist, fade);
        return r[transform_css] += (x ? " rotateX(" + x + "deg)" : " ") + (y ? " rotateY(" + y + "deg)" : "") + (z ? " rotateZ(" + z + "deg)" : ""), orig && (r[transform_orig_css] = orig), r
      } : function (x, y, z, dist, orig, fade) {
        return st.right(dist, fade)
      }, st.rotate3dtop = window._css3d ? function (x, y, z, dist, orig, fade) {
        var r = st.top(dist, fade);
        return r[transform_css] += (x ? " rotateX(" + x + "deg)" : " ") + (y ? " rotateY(" + y + "deg)" : "") + (z ? " rotateZ(" + z + "deg)" : ""), orig && (r[transform_orig_css] = orig), r
      } : function (x, y, z, dist, orig, fade) {
        return st.top(dist, fade)
      }, st.rotate3dbottom = window._css3d ? function (x, y, z, dist, orig, fade) {
        var r = st.bottom(dist, fade);
        return r[transform_css] += (x ? " rotateX(" + x + "deg)" : " ") + (y ? " rotateY(" + y + "deg)" : "") + (z ? " rotateZ(" + z + "deg)" : ""), orig && (r[transform_orig_css] = orig), r
      } : function (x, y, z, dist, orig, fade) {
        return st.bottom(dist, fade)
      }, st.rotate3dfront = window._css3d ? function (x, y, z, dist, orig, fade) {
        var r = st.front(dist, fade);
        return r[transform_css] += (x ? " rotateX(" + x + "deg)" : " ") + (y ? " rotateY(" + y + "deg)" : "") + (z ? " rotateZ(" + z + "deg)" : ""), orig && (r[transform_orig_css] = orig), r
      } : function (x, y, z, dist, orig, fade) {
        return st.front(dist, fade)
      }, st.rotate3dback = window._css3d ? function (x, y, z, dist, orig, fade) {
        var r = st.back(dist, fade);
        return r[transform_css] += (x ? " rotateX(" + x + "deg)" : " ") + (y ? " rotateY(" + y + "deg)" : "") + (z ? " rotateZ(" + z + "deg)" : ""), orig && (r[transform_orig_css] = orig), r
      } : function (x, y, z, dist, orig, fade) {
        return st.back(dist, fade)
      }, st.t = window._css3d ? function (fade, tx, ty, tz, r, rx, ry, rz, scx, scy, skx, sky, ox, oy, oz) {
        var _r = fade === !1 ? {} : {
            opacity: 0
          },
          transform = "perspective(2000px) ";
        "n" !== tx && (transform += "translateX(" + tx * st.rf + "px) "), "n" !== ty && (transform += "translateY(" + ty * st.rf + "px) "), "n" !== tz && (transform += "translateZ(" + tz * st.rf + "px) "), "n" !== r && (transform += "rotate(" + r + "deg) "), "n" !== rx && (transform += "rotateX(" + rx + "deg) "), "n" !== ry && (transform += "rotateY(" + ry + "deg) "), "n" !== rz && (transform += "rotateZ(" + rz + "deg) "), "n" !== skx && (transform += "skewX(" + skx + "deg) "), "n" !== sky && (transform += "skewY(" + sky + "deg) "), "n" !== scx && (transform += "scaleX(" + scx + ") "), "n" !== scy && (transform += "scaleY(" + scy + ")"), _r[transform_css] = transform;
        var trans_origin = "";
        return trans_origin += "n" !== ox ? ox + "% " : "50% ", trans_origin += "n" !== oy ? oy + "% " : "50% ", trans_origin += "n" !== oz ? oz + "px" : "", _r[transform_orig_css] = trans_origin, _r
      } : function (fade, tx, ty, tz, r) {
        var r = fade === !1 ? {} : {
          opacity: 0
        };
        return "n" !== tx && (r.left = tx * st.rf + "px"), "n" !== ty && (r.top = ty * st.rf + "px"), r
      }
    }
  }
}(jQuery),

function ($) {
  window.MSLayerElement = function () {
    this.start_anim = {
      name: "fade",
      duration: 1e3,
      ease: "linear",
      delay: 0
    }, this.end_anim = {
      duration: 1e3,
      ease: "linear"
    }, this.type = "text", this.resizable = !0, this.minWidth = -1, this.isVisible = !0, this.__cssConfig = ["margin-top", "padding-top", "margin-bottom", "padding-left", "margin-right", "padding-right", "margin-left", "padding-bottom", "font-size", "line-height", "width", "left", "right", "top", "bottom"], this.baseStyle = {}
  };

  var p = MSLayerElement.prototype;
  p.setStartAnim = function (anim) {
    $.extend(this.start_anim, anim), $.extend(this.start_anim, this._parseEff(this.start_anim.name)), this.$element.css("visibility", "hidden")
  }, p.setEndAnim = function (anim) {
    $.extend(this.end_anim, anim)
  }, p.create = function () {
    if (this.$element.css("display", "none"), this.resizable = this.$element.data("resize") !== !1, this.fixed = this.$element.data("fixed") === !0, void 0 !== this.$element.data("widthlimit") && (this.minWidth = this.$element.data("widthlimit")), this.end_anim.name || (this.end_anim.name = this.start_anim.name), this.end_anim.time && (this.autoHide = !0), this.staticLayer = "static" === this.$element.data("position"), this.fixedLayer = "fixed" === this.$element.data("position"), this.layersCont = this.controller.$layers, this.staticLayer && this.$element.css("display", "").css("visibility", ""), void 0 !== this.$element.data("action")) {
      var slideController = this.slide.slider.slideController;
      this.$element.on(this.$element.data("action-event") || "click", function (event) {
        slideController.runAction($(this).data("action")), event.preventDefault()
      }).addClass("ms-action-layer")
    }
    $.extend(this.end_anim, this._parseEff(this.end_anim.name)), this.slider = this.slide.slider, this.masked && (this.$mask = $("<div></div>").addClass("ms-layer-mask"), this.link ? (this.link.wrap(this.$mask), this.$mask = this.link.parent()) : (this.$element.wrap(this.$mask), this.$mask = this.$element.parent()), this.maskWidth && this.$mask.width(this.maskWidth), this.maskHeight && (this.$mask.height(this.maskHeight), -1 === this.__cssConfig.indexOf("height") && this.__cssConfig.push("height")));
    var layerOrigin = this.layerOrigin = this.$element.data("origin");
    if (layerOrigin) {
      var vOrigin = layerOrigin.charAt(0),
        hOrigin = layerOrigin.charAt(1),
        offsetX = this.$element.data("offset-x"),
        offsetY = this.$element.data("offset-y"),
        layerEle = this.masked ? this.$mask[0] : this.$element[0];
      switch (void 0 === offsetY && (offsetY = 0), vOrigin) {
        case "t":
          layerEle.style.top = offsetY + "px";
          break;
        case "b":
          layerEle.style.bottom = offsetY + "px";
          break;
        case "m":
          layerEle.style.top = offsetY + "px", this.middleAlign = !0
      }
      switch (void 0 === offsetX && (offsetX = 0), hOrigin) {
        case "l":
          layerEle.style.left = offsetX + "px";
          break;
        case "r":
          layerEle.style.right = offsetX + "px";
          break;
        case "c":
          layerEle.style.left = offsetX + "px", this.centerAlign = !0
      }
    }
    this.parallax = this.$element.data("parallax"), null != this.parallax && (this.parallax /= 100, this.$parallaxElement = $("<div></div>").addClass("ms-parallax-layer"), this.masked ? (this.$mask.wrap(this.$parallaxElement), this.$parallaxElement = this.$mask.parent()) : this.link ? (this.link.wrap(this.$parallaxElement), this.$parallaxElement = this.link.parent()) : (this.$element.wrap(this.$parallaxElement), this.$parallaxElement = this.$element.parent()), this._lastParaX = 0, this._lastParaY = 0, this._paraX = 0, this._paraY = 0, this.alignedToBot = this.layerOrigin && -1 !== this.layerOrigin.indexOf("b"), this.alignedToBot && this.$parallaxElement.css("bottom", 0), this.parallaxRender = window._css3d ? this._parallaxCSS3DRenderer : window._css2d ? this._parallaxCSS2DRenderer : this._parallax2DRenderer, "swipe" !== this.slider.options.parallaxMode && averta.Ticker.add(this.parallaxRender, this)), $.removeDataAttrs(this.$element, ["data-src"])
  }, p.init = function () {
    this.initialized = !0;
    var value;
    this.$element.css("visibility", "");
    for (var i = 0, l = this.__cssConfig.length; l > i; i++) {
      var key = this.__cssConfig[i];
      if (this._isPosition(key) && this.masked) value = this.$mask.css(key);
      else if ("text" !== this.type || "width" !== key || this.masked || this.maskWidth) {
        value = this.$element.css(key);
        var isSize = "width" === key || "height" === key;
        isSize && this.masked && (this.maskWidth && "width" === key ? value = this.maskWidth + "px" : this.maskHeight && "height" === key && (value = this.maskHeight + "px")), isSize && "0px" === value && (value = this.$element.data(key) + "px")
      } else value = this.$element[0].style.width;
      this.layerOrigin && ("top" === key && -1 === this.layerOrigin.indexOf("t") && -1 === this.layerOrigin.indexOf("m") || "bottom" === key && -1 === this.layerOrigin.indexOf("b") || "left" === key && -1 === this.layerOrigin.indexOf("l") && -1 === this.layerOrigin.indexOf("c") || "right" === key && -1 === this.layerOrigin.indexOf("r")) || "auto" != value && "" != value && "normal" != value && (this.baseStyle[key] = parseInt(value))
    }
    this.middleAlign && (this.baseHeight = this.$element.outerHeight(!1)), this.centerAlign && (this.baseWidth = this.$element.outerWidth(!1))
  }, p.locate = function () {
    if (this.slide.ready) {
      var factor, isPosition, isSize, width = parseFloat(this.layersCont.css("width")),
        height = parseFloat(this.layersCont.css("height"));
      !this.staticLayer && "none" === this.$element.css("display") && this.isVisible && this.$element.css("display", "").css("visibility", "hidden"), this.staticLayer && this.$element.addClass("ms-hover-active"), factor = this.resizeFactor = width / this.slide.slider.options.width;
      var $layerEle = this.masked ? this.$mask : this.$element;
      for (var key in this.baseStyle) isPosition = this._isPosition(key), isSize = "width" === key || "height" === key, factor = this.fixed && isPosition ? 1 : this.resizeFactor, (this.resizable || isPosition) && ("top" === key && this.middleAlign ? ($layerEle[0].style.top = "0px", this.baseHeight = $layerEle.outerHeight(!1), $layerEle[0].style.top = this.baseStyle.top * factor + (height - this.baseHeight) / 2 + "px") : "left" === key && this.centerAlign ? ($layerEle[0].style.left = "0px", this.baseWidth = $layerEle.outerWidth(!1), $layerEle[0].style.left = this.baseStyle.left * factor + (width - this.baseWidth) / 2 + "px") : isPosition && this.masked ? $layerEle[0].style[key] = this.baseStyle[key] * factor + "px" : isSize && ("width" === key && this.maskWidth || "height" === key && this.maskHeight) ? $layerEle[0].style[key] = this.baseStyle[key] * factor + "px" : this.$element.css(key, this.baseStyle[key] * factor + "px"));
      this.visible(this.minWidth < width)
    }
  }, p.start = function () {
    if (!this.isShowing && !this.staticLayer) {
      this.isShowing = !0, this.$element.removeClass("ms-hover-active");
      var key, base;
      MSLayerEffects.rf = this.resizeFactor;
      var effect_css = MSLayerEffects[this.start_anim.eff_name].apply(null, this._parseEffParams(this.start_anim.eff_params)),
        start_css_eff = {};
      for (key in effect_css) this._checkPosKey(key, effect_css) || (null != MSLayerEffects.defaultValues[key] && (start_css_eff[key] = MSLayerEffects.defaultValues[key]), key in this.baseStyle && (base = this.baseStyle[key], this.middleAlign && "top" === key && (base += (parseInt(this.layersCont.height()) - this.$element.outerHeight(!1)) / 2), this.centerAlign && "left" === key && (base += (parseInt(this.layersCont.width()) - this.$element.outerWidth(!1)) / 2), effect_css[key] = base + parseFloat(effect_css[key]) + "px", start_css_eff[key] = base + "px"), this.$element.css(key, effect_css[key]));
      var that = this;
      clearTimeout(this.to), clearTimeout(this.clHide), this.to = setTimeout(function () {
        that.$element.css("visibility", ""), that._playAnimation(that.start_anim, start_css_eff)
      }, that.start_anim.delay || .01), this.clTo = setTimeout(function () {
        that.show_cl = !0, that.$element.addClass("ms-hover-active")
      }, (this.start_anim.delay || .01) + this.start_anim.duration + 1), this.autoHide && (clearTimeout(this.hto), this.hto = setTimeout(function () {
        that.hide()
      }, that.end_anim.time))
    }
  }, p.hide = function () {
    if (!this.staticLayer) {
      this.$element.removeClass("ms-hover-active"), this.isShowing = !1;
      var effect_css = MSLayerEffects[this.end_anim.eff_name].apply(null, this._parseEffParams(this.end_anim.eff_params));
      for (key in effect_css) this._checkPosKey(key, effect_css) || (key === window._jcsspfx + "TransformOrigin" && this.$element.css(key, effect_css[key]), key in this.baseStyle && (effect_css[key] = this.baseStyle[key] + parseFloat(effect_css[key]) + "px"));
      this._playAnimation(this.end_anim, effect_css), clearTimeout(this.clHide), 0 === effect_css.opacity && (this.clHide = setTimeout(function () {
        this.$element.css("visibility", "hidden")
      }.bind(this), this.end_anim.duration + 1)), clearTimeout(this.to), clearTimeout(this.hto), clearTimeout(this.clTo)
    }
  }, p.reset = function () {
    this.staticLayer || (this.isShowing = !1, this.$element[0].style.display = "none", this.$element.css("opacity", ""), this.$element[0].style.transitionDuration = "", this.show_tween && this.show_tween.stop(!0), clearTimeout(this.to), clearTimeout(this.hto))
  }, p.destroy = function () {
    this.reset(), this.$element.remove()
  }, p.visible = function (value) {
    this.isVisible != value && (this.isVisible = value, this.$element.css("display", value ? "" : "none"))
  }, p.moveParallax = function (x, y, fast) {
    this._paraX = x, this._paraY = y, fast && (this._lastParaX = x, this._lastParaY = y, this.parallaxRender())
  }, p._playAnimation = function (animation, css) {
    var options = {};
    animation.ease && (options.ease = animation.ease), options.transProperty = window._csspfx + "transform,opacity", this.show_tween && this.show_tween.stop(!0), this.show_tween = CTween.animate(this.$element, animation.duration, css, options)
  }, p._randomParam = function (value) {
    var min = Number(value.slice(0, value.indexOf("|"))),
      max = Number(value.slice(value.indexOf("|") + 1));
    return min + Math.random() * (max - min)
  }, p._parseEff = function (eff_name) {
    var eff_params = [];
    if (-1 !== eff_name.indexOf("(")) {
      var value, temp = eff_name.slice(0, eff_name.indexOf("(")).toLowerCase();
      eff_params = eff_name.slice(eff_name.indexOf("(") + 1, -1).replace(/\"|\'|\s/g, "").split(","), eff_name = temp;
      for (var i = 0, l = eff_params.length; l > i; ++i) value = eff_params[i], value in MSLayerEffects.presetEffParams && (value = MSLayerEffects.presetEffParams[value]), eff_params[i] = value
    }
    return {
      eff_name: eff_name,
      eff_params: eff_params
    }
  }, p._parseEffParams = function (params) {
    for (var eff_params = [], i = 0, l = params.length; l > i; ++i) {
      var value = params[i];
      "string" == typeof value && -1 !== value.indexOf("|") && (value = this._randomParam(value)), eff_params[i] = value
    }
    return eff_params
  }, p._checkPosKey = function (key, style) {
    return "left" === key && !(key in this.baseStyle) && "right" in this.baseStyle ? (style.right = -parseInt(style.left) + "px", delete style.left, !0) : "top" === key && !(key in this.baseStyle) && "bottom" in this.baseStyle ? (style.bottom = -parseInt(style.top) + "px", delete style.top, !0) : !1
  }, p._isPosition = function (key) {
    return "top" === key || "left" === key || "bottom" === key || "right" === key
  }, p._parallaxCalc = function () {
    var x_def = this._paraX - this._lastParaX,
      y_def = this._paraY - this._lastParaY;
    this._lastParaX += x_def / 12, this._lastParaY += y_def / 12, Math.abs(x_def) < .019 && (this._lastParaX = this._paraX), Math.abs(y_def) < .019 && (this._lastParaY = this._paraY)
  }, p._parallaxCSS3DRenderer = function () {
    this._parallaxCalc(), this.$parallaxElement[0].style[window._jcsspfx + "Transform"] = "translateX(" + this._lastParaX * this.parallax + "px) translateY(" + this._lastParaY * this.parallax + "px) translateZ(0)"
  }, p._parallaxCSS2DRenderer = function () {
    this._parallaxCalc(), this.$parallaxElement[0].style[window._jcsspfx + "Transform"] = "translateX(" + this._lastParaX * this.parallax + "px) translateY(" + this._lastParaY * this.parallax + "px)"
  }, p._parallax2DRenderer = function () {
    this._parallaxCalc(), this.alignedToBot ? this.$parallaxElement[0].style.bottom = this._lastParaY * this.parallax + "px" : this.$parallaxElement[0].style.top = this._lastParaY * this.parallax + "px", this.$parallaxElement[0].style.left = this._lastParaX * this.parallax + "px"
  }
}(jQuery),

function ($) {
  window.MSImageLayerElement = function () {
    MSLayerElement.call(this), this.needPreload = !0, this.__cssConfig = ["width", "height", "margin-top", "padding-top", "margin-bottom", "padding-left", "margin-right", "padding-right", "margin-left", "padding-bottom", "left", "right", "top", "bottom"], this.type = "image"
  }, MSImageLayerElement.extend(MSLayerElement);
  var p = MSImageLayerElement.prototype,
    _super = MSLayerElement.prototype;
  p.create = function () {
    if (this.link) {
      var p = this.$element.parent();
      p.append(this.link), this.link.append(this.$element), this.link.removeClass("ms-layer"), this.$element.addClass("ms-layer"), p = null
    }
    if (_super.create.call(this), void 0 != this.$element.data("src")) this.img_src = this.$element.data("src"), this.$element.removeAttr("data-src");
    else {
      var that = this;
      this.$element.on("load", function () {
        that.controller.preloadCount--, 0 === that.controller.preloadCount && that.controller._onlayersReady()
      }).each($.jqLoadFix)
    }
    $.browser.msie && this.$element.on("dragstart", function (event) {
      event.preventDefault()
    })
  }, p.loadImage = function () {
    var that = this;
    this.$element.preloadImg(this.img_src, function () {
      that.controller.preloadCount--, 0 === that.controller.preloadCount && that.controller._onlayersReady()
    })
  }
}(jQuery),

function ($) {
  window.MSVideoLayerElement = function () {
    MSLayerElement.call(this), this.__cssConfig.push("height"), this.type = "video"
  }, MSVideoLayerElement.extend(MSLayerElement);
  var p = MSVideoLayerElement.prototype,
    _super = MSLayerElement.prototype;
  p.__playVideo = function () {
    this.img && CTween.fadeOut(this.img, 500, 2), CTween.fadeOut(this.video_btn, 500, 2), this.video_frame.attr("src", "about:blank").css("display", "block"), -1 == this.video_url.indexOf("?") && (this.video_url += "?"), this.video_frame.attr("src", this.video_url + "&autoplay=1")
  }, p.start = function () {
    _super.start.call(this), this.$element.data("autoplay") && this.__playVideo()
  }, p.reset = function () {
    return _super.reset.call(this), (this.needPreload || this.$element.data("btn")) && (this.video_btn.css("opacity", 1).css("display", "block"), this.video_frame.attr("src", "about:blank").css("display", "none")), this.needPreload ? void this.img.css("opacity", 1).css("display", "block") : void this.video_frame.attr("src", this.video_url)
  }, p.create = function () {
    _super.create.call(this), this.video_frame = this.$element.find("iframe").css({
      width: "100%",
      height: "100%"
    }), this.video_url = this.video_frame.attr("src");
    var has_img = 0 != this.$element.has("img").length;
    if (has_img || this.$element.data("btn")) {
      this.video_frame.attr("src", "about:blank").css("display", "none");
      var that = this;
      if (this.video_btn = $("<div></div>").appendTo(this.$element).addClass("ms-video-btn").click(function () {
          that.__playVideo()
        }), has_img) {
        if (this.needPreload = !0, this.img = this.$element.find("img:first").addClass("ms-video-img"), void 0 !== this.img.data("src")) this.img_src = this.img.data("src"), this.img.removeAttr("data-src");
        else {
          var that = this;
          this.img.attr("src", this.img_src).on("load", function () {
            that.controller.preloadCount--, 0 === that.controller.preloadCount && that.controller._onlayersReady()
          }).each($.jqLoadFix)
        }
        $.browser.msie && this.img.on("dragstart", function (event) {
          event.preventDefault()
        })
      }
    }
  }, p.loadImage = function () {
    var that = this;
    this.img.preloadImg(this.img_src, function () {
      that.controller.preloadCount--, 0 === that.controller.preloadCount && that.controller._onlayersReady()
    })
  }
}(jQuery),

function ($) {
  "use strict";
  window.MSHotspotLayer = function () {
    MSLayerElement.call(this), this.__cssConfig = ["margin-top", "padding-top", "margin-bottom", "padding-left", "margin-right", "padding-right", "margin-left", "padding-bottom", "left", "right", "top", "bottom"], this.ease = "Expo", this.hide_start = !0, this.type = "hotspot"
  }, MSHotspotLayer.extend(MSLayerElement);
  var p = MSHotspotLayer.prototype,
    _super = MSLayerElement.prototype;
  p._showTT = function () {
    this.show_cl && (clearTimeout(this.hto), this._tween && this._tween.stop(!0), this.hide_start && (this.align = this._orgAlign, this._locateTT(), this.tt.css({
      display: "block"
    }), this._tween = CTween.animate(this.tt, 900, this.to, {
      ease: "easeOut" + this.ease
    }), this.hide_start = !1))
  }, p._hideTT = function () {
    if (this.show_cl) {
      this._tween && this._tween.stop(!0);
      var that = this;
      clearTimeout(this.hto), this.hto = setTimeout(function () {
        that.hide_start = !0, that._tween = CTween.animate(that.tt, 900, that.from, {
          ease: "easeOut" + that.ease,
          complete: function () {
            that.tt.css("display", "none")
          }
        })
      }, 200)
    }
  }, p._updateClassName = function (name) {
    this._lastClass && this.tt.removeClass(this._lastClass), this.tt.addClass(name), this._lastClass = name
  }, p._alignPolicy = function () {
    {
      var w = (this.tt.outerHeight(!1), Math.max(this.tt.outerWidth(!1), parseInt(this.tt.css("max-width")))),
        ww = window.innerWidth;
      window.innerHeight
    }
    switch (this.align) {
      case "top":
        if (this.base_t < 0) return "bottom";
        break;
      case "right":
        if (this.base_l + w > ww || this.base_t < 0) return "bottom";
        break;
      case "left":
        if (this.base_l < 0 || this.base_t < 0) return "bottom"
    }
    return null
  }, p._locateTT = function () {
    var os = this.$element.offset(),
      os2 = this.slide.slider.$element.offset(),
      dist = 50,
      space = 15;
    this.pos_x = os.left - os2.left - this.slide.slider.$element.scrollLeft(), this.pos_y = os.top - os2.top - this.slide.slider.$element.scrollTop(), this.from = {
      opacity: 0
    }, this.to = {
      opacity: 1
    }, this._updateClassName("ms-tooltip-" + this.align), this.tt_arrow.css("margin-left", "");
    var arrow_w = 15,
      arrow_h = 15;
    switch (this.align) {
      case "top":
        var w = Math.min(this.tt.outerWidth(!1), parseInt(this.tt.css("max-width")));
        this.base_t = this.pos_y - this.tt.outerHeight(!1) - arrow_h - space, this.base_l = this.pos_x - w / 2, this.base_l + w > window.innerWidth && (this.tt_arrow.css("margin-left", -arrow_w / 2 + this.base_l + w - window.innerWidth + "px"), this.base_l = window.innerWidth - w), this.base_l < 0 && (this.base_l = 0, this.tt_arrow.css("margin-left", -arrow_w / 2 + this.pos_x - this.tt.outerWidth(!1) / 2 + "px")), window._css3d ? (this.from[window._jcsspfx + "Transform"] = "translateY(-" + dist + "px)", this.to[window._jcsspfx + "Transform"] = "") : (this.from.top = this.base_t - dist + "px", this.to.top = this.base_t + "px");
        break;
      case "bottom":
        var w = Math.min(this.tt.outerWidth(!1), parseInt(this.tt.css("max-width")));
        this.base_t = this.pos_y + arrow_h + space, this.base_l = this.pos_x - w / 2, this.base_l + w > window.innerWidth && (this.tt_arrow.css("margin-left", -arrow_w / 2 + this.base_l + w - window.innerWidth + "px"), this.base_l = window.innerWidth - w), this.base_l < 0 && (this.base_l = 0, this.tt_arrow.css("margin-left", -arrow_w / 2 + this.pos_x - this.tt.outerWidth(!1) / 2 + "px")), window._css3d ? (this.from[window._jcsspfx + "Transform"] = "translateY(" + dist + "px)", this.to[window._jcsspfx + "Transform"] = "") : (this.from.top = this.base_t + dist + "px", this.to.top = this.base_t + "px");
        break;
      case "right":
        this.base_l = this.pos_x + arrow_w + space, this.base_t = this.pos_y - this.tt.outerHeight(!1) / 2, window._css3d ? (this.from[window._jcsspfx + "Transform"] = "translateX(" + dist + "px)", this.to[window._jcsspfx + "Transform"] = "") : (this.from.left = this.base_l + dist + "px", this.to.left = this.base_l + "px");
        break;
      case "left":
        this.base_l = this.pos_x - arrow_w - this.tt.outerWidth(!1) - space, this.base_t = this.pos_y - this.tt.outerHeight(!1) / 2, window._css3d ? (this.from[window._jcsspfx + "Transform"] = "translateX(-" + dist + "px)", this.to[window._jcsspfx + "Transform"] = "") : (this.from.left = this.base_l - dist + "px", this.to.left = this.base_l + "px")
    }
    var policyAlign = this._alignPolicy();
    return null !== policyAlign ? (this.align = policyAlign, void this._locateTT()) : (this.tt.css("top", parseInt(this.base_t) + "px").css("left", parseInt(this.base_l) + "px"), void this.tt.css(this.from))
  }, p.start = function () {
    _super.start.call(this), this.tt.appendTo(this.slide.slider.$element), this.tt.css("display", "none")
  }, p.reset = function () {
    _super.reset.call(this), this.tt.detach()
  }, p.create = function () {
    var that = this;
    this._orgAlign = this.align = void 0 !== this.$element.data("align") ? this.$element.data("align") : "top", this.data = this.$element.html(), this.$element.html("").on("mouseenter", function () {
      that._showTT()
    }).on("mouseleave", function () {
      that._hideTT()
    }), this.point = $('<div><div class="ms-point-center"></div><div class="ms-point-border"></div></div>').addClass("ms-tooltip-point").appendTo(this.$element);
    var link = this.$element.data("link"),
      target = this.$element.data("target");
    link && this.point.on("click", function () {
      window.open(link, target || "_self")
    }), this.tt = $("<div></div>").addClass("ms-tooltip").css("display", "hidden").css("opacity", 0), void 0 !== this.$element.data("width") && this.tt.css("width", this.$element.data("width")).css("max-width", this.$element.data("width")), this.tt_arrow = $("<div></div>").addClass("ms-tooltip-arrow").appendTo(this.tt), this._updateClassName("ms-tooltip-" + this.align), this.ttcont = $("<div></div>").addClass("ms-tooltip-cont").html(this.data).appendTo(this.tt), this.$element.data("stay-hover") === !0 && this.tt.on("mouseenter", function () {
      that.hide_start || (clearTimeout(that.hto), that._tween.stop(!0), that._showTT())
    }).on("mouseleave", function () {
      that._hideTT()
    }), _super.create.call(this)
  }
}(jQuery),

function () {
  window.MSButtonLayer = function () {
    MSLayerElement.call(this), this.type = "button"
  }, MSButtonLayer.extend(MSLayerElement);
  var p = MSButtonLayer.prototype,
    _super = MSLayerElement.prototype,
    positionKies = ["top", "left", "bottom", "right"];
  p.create = function () {
    _super.create.call(this), this.$element.wrap('<div class="ms-btn-container"></div>').css("position", "relative"), this.$container = this.$element.parent()
  }, p.locate = function () {
    _super.locate.call(this);
    for (var key, tempValue, i = 0; 4 > i; i++) key = positionKies[i], key in this.baseStyle && (tempValue = this.$element.css(key), this.$element.css(key, ""), this.$container.css(key, tempValue));
    this.$container.width(this.$element.outerWidth(!0)).height(this.$element.outerHeight(!0))
  }
}

(jQuery), window.MSSliderEvent = function (type) {
    this.type = type
  },
  MSSliderEvent.CHANGE_START = "ms_changestart", MSSliderEvent.CHANGE_END = "ms_changeend", MSSliderEvent.WAITING = "ms_waiting", MSSliderEvent.AUTOPLAY_CHANGE = "ms_autoplaychange", MSSliderEvent.VIDEO_PLAY = "ms_videoPlay", MSSliderEvent.VIDEO_CLOSE = "ms_videoclose", MSSliderEvent.INIT = "ms_init", MSSliderEvent.HARD_UPDATE = "ms_hard_update", MSSliderEvent.RESIZE = "ms_resize", MSSliderEvent.RESERVED_SPACE_CHANGE = "ms_rsc", MSSliderEvent.DESTROY = "ms_destroy",
  function (window, document, $) {
    "use strict";
    window.MSSlide = function () {
      this.$element = null, this.$loading = $("<div></div>").addClass("ms-slide-loading"), this.view = null, this.index = -1, this.__width = 0, this.__height = 0, this.fillMode = "fill", this.selected = !1, this.pselected = !1, this.autoAppend = !0, this.isSleeping = !0, this.moz = $.browser.mozilla
    };
    var p = MSSlide.prototype;
    p.onSwipeStart = function () {
      this.link && (this.linkdis = !0), this.video && (this.videodis = !0)
    }, p.onSwipeMove = function (e) {
      var move = Math.max(Math.abs(e.data.distanceX), Math.abs(e.data.distanceY));
      this.swipeMoved = move > 4
    }, p.onSwipeCancel = function () {
      return this.swipeMoved ? void(this.swipeMoved = !1) : (this.link && (this.linkdis = !1), void(this.video && (this.videodis = !1)))
    }, p.setupLayerController = function () {
      this.hasLayers = !0, this.layerController = new MSLayerController(this)
    }, p.assetsLoaded = function () {
      this.ready = !0, this.slider.api._startTimer(), (this.selected || this.pselected && this.slider.options.instantStartLayers) && (this.hasLayers && this.layerController.showLayers(), this.vinit && (this.bgvideo.play(), this.autoPauseBgVid || (this.bgvideo.currentTime = 0))), this.isSleeping || this.setupBG(), CTween.fadeOut(this.$loading, 300, !0), (0 === this.slider.options.preload || "all" === this.slider.options.preload) && this.index < this.view.slideList.length - 1 ? this.view.slideList[this.index + 1].loadImages() : "all" === this.slider.options.preload && this.index === this.view.slideList.length - 1 && this.slider._removeLoading()
    }, p.setBG = function (img) {
      this.hasBG = !0;
      var that = this;
      this.$imgcont = $("<div></div>").addClass("ms-slide-bgcont"), this.$element.append(this.$loading).append(this.$imgcont), this.$bg_img = $(img).css("visibility", "hidden"), this.$imgcont.append(this.$bg_img), this.bgAligner = new MSAligner(that.fillMode, that.$imgcont, that.$bg_img), this.bgAligner.widthOnly = this.slider.options.autoHeight, that.slider.options.autoHeight && (that.pselected || that.selected) && that.slider.setHeight(that.slider.options.height), void 0 !== this.$bg_img.data("src") ? (this.bg_src = this.$bg_img.data("src"), this.$bg_img.removeAttr("data-src")) : this.$bg_img.one("load", function (event) {
        that._onBGLoad(event)
      }).each($.jqLoadFix)
    }, p.setupBG = function () {
      !this.initBG && this.bgLoaded && (this.initBG = !0, this.$bg_img.css("visibility", ""), this.bgWidth = this.bgNatrualWidth || this.$bg_img.width(), this.bgHeight = this.bgNatrualHeight || this.$bg_img.height(), CTween.fadeIn(this.$imgcont, 300), this.slider.options.autoHeight && this.$imgcont.height(this.bgHeight * this.ratio), this.bgAligner.init(this.bgWidth, this.bgHeight), this.setSize(this.__width, this.__height), this.slider.options.autoHeight && (this.pselected || this.selected) && this.slider.setHeight(this.getHeight()))
    }, p.loadImages = function () {
      if (!this.ls) {
        if (this.ls = !0, this.bgvideo && this.bgvideo.load(), this.hasBG && this.bg_src) {
          var that = this;
          this.$bg_img.preloadImg(this.bg_src, function (event) {
            that._onBGLoad(event)
          })
        }
        this.hasLayers && this.layerController.loadLayers(this._onLayersLoad), this.hasBG || this.hasLayers || this.assetsLoaded()
      }
    }, p._onLayersLoad = function () {
      this.layersLoaded = !0, (!this.hasBG || this.bgLoaded) && this.assetsLoaded()
    }, p._onBGLoad = function (event) {
      this.bgNatrualWidth = event.width, this.bgNatrualHeight = event.height, this.bgLoaded = !0, $.browser.msie && this.$bg_img.on("dragstart", function (event) {
        event.preventDefault()
      }), (!this.hasLayers || this.layerController.ready) && this.assetsLoaded()
    }, p.setBGVideo = function ($video) {
      if ($video[0].play) {
        if (window._mobile && !this.slider.options.mobileBGVideo) return void $video.remove();
        this.bgvideo = $video[0];
        var that = this;
        $video.addClass("ms-slide-bgvideo"), $video.data("loop") !== !1 && this.bgvideo.addEventListener("ended", function () {
          that.bgvideo.play()
        }), $video.data("mute") !== !1 && (this.bgvideo.muted = !0), $video.data("autopause") === !0 && (this.autoPauseBgVid = !0), this.bgvideo_fillmode = $video.data("fill-mode") || "fill", "none" !== this.bgvideo_fillmode && (this.bgVideoAligner = new MSAligner(this.bgvideo_fillmode, this.$element, $video), this.bgvideo.addEventListener("loadedmetadata", function () {
          that.vinit || (that.vinit = !0, that.video_aspect = that.bgVideoAligner.baseHeight / that.bgVideoAligner.baseWidth, that.bgVideoAligner.init(that.bgvideo.videoWidth, that.bgvideo.videoHeight), that._alignBGVideo(), CTween.fadeIn($(that.bgvideo), 200), that.selected && that.bgvideo.play())
        })), $video.css("opacity", 0), this.$bgvideocont = $("<div></div>").addClass("ms-slide-bgvideocont").append($video), this.hasBG ? this.$imgcont.before(this.$bgvideocont) : this.$bgvideocont.appendTo(this.$element)
      }
    }, p._alignBGVideo = function () {
      this.bgvideo_fillmode && "none" !== this.bgvideo_fillmode && this.bgVideoAligner.align()
    }, p.setSize = function (width, height, hard) {
      this.__width = width, this.slider.options.autoHeight && (this.bgLoaded ? (this.ratio = this.__width / this.bgWidth, height = Math.floor(this.ratio * this.bgHeight), this.$imgcont.height(height)) : (this.ratio = width / this.slider.options.width, height = this.slider.options.height * this.ratio)), this.__height = height, this.$element.width(width).height(height), this.hasBG && this.bgLoaded && this.bgAligner.align(), this._alignBGVideo(), this.hasLayers && this.layerController.setSize(width, height, hard)
    }, p.getHeight = function () {
      return this.hasBG && this.bgLoaded ? this.bgHeight * this.ratio : Math.max(this.$element[0].clientHeight, this.slider.options.height * this.ratio)
    }, p.__playVideo = function () {
      this.vplayed || this.videodis || (this.vplayed = !0, this.slider.api.paused || (this.slider.api.pause(), this.roc = !0), this.vcbtn.css("display", ""), CTween.fadeOut(this.vpbtn, 500, !1), CTween.fadeIn(this.vcbtn, 500), CTween.fadeIn(this.vframe, 500), this.vframe.css("display", "block").attr("src", this.video + "&autoplay=1"), this.view.$element.addClass("ms-def-cursor"), this.moz && this.view.$element.css("perspective", "none"), this.view.swipeControl && this.view.swipeControl.disable(), this.slider.slideController.dispatchEvent(new MSSliderEvent(MSSliderEvent.VIDEO_PLAY)))
    }, p.__closeVideo = function () {
      if (this.vplayed) {
        this.vplayed = !1, this.roc && this.slider.api.resume();
        var that = this;
        CTween.fadeIn(this.vpbtn, 500), CTween.animate(this.vcbtn, 500, {
          opacity: 0
        }, {
          complete: function () {
            that.vcbtn.css("display", "none")
          }
        }), CTween.animate(this.vframe, 500, {
          opacity: 0
        }, {
          complete: function () {
            that.vframe.attr("src", "about:blank").css("display", "none")
          }
        }), this.moz && this.view.$element.css("perspective", ""), this.view.swipeControl && this.view.swipeControl.enable(), this.view.$element.removeClass("ms-def-cursor"), this.slider.slideController.dispatchEvent(new MSSliderEvent(MSSliderEvent.VIDEO_CLOSE))
      }
    }, p.create = function () {
      var that = this;
      this.hasLayers && this.layerController.create(), this.link && this.link.addClass("ms-slide-link").html("").click(function (e) {
        that.linkdis && e.preventDefault()
      }), this.video && (-1 === this.video.indexOf("?") && (this.video += "?"), this.vframe = $("<iframe></iframe>").addClass("ms-slide-video").css({
        width: "100%",
        height: "100%",
        display: "none"
      }).attr("src", "about:blank").attr("allowfullscreen", "true").appendTo(this.$element), this.vpbtn = $("<div></div>").addClass("ms-slide-vpbtn").click(function () {
        that.__playVideo()
      }).appendTo(this.$element), this.vcbtn = $("<div></div>").addClass("ms-slide-vcbtn").click(function () {
        that.__closeVideo()
      }).appendTo(this.$element).css("display", "none"), window._touch && this.vcbtn.removeClass("ms-slide-vcbtn").addClass("ms-slide-vcbtn-mobile").append('<div class="ms-vcbtn-txt">Close video</div>').appendTo(this.view.$element.parent())), !this.slider.options.autoHeight && this.hasBG && (this.$imgcont.css("height", "100%"), ("center" === this.fillMode || "stretch" === this.fillMode) && (this.fillMode = "fill")), this.slider.options.autoHeight && this.$element.addClass("ms-slide-auto-height"), this.sleep(!0)
    }, p.destroy = function () {
      this.hasLayers && (this.layerController.destroy(), this.layerController = null), this.$element.remove(), this.$element = null
    }, p.prepareToSelect = function () {
      this.pselected || this.selected || (this.pselected = !0, (this.link || this.video) && (this.view.addEventListener(MSViewEvents.SWIPE_START, this.onSwipeStart, this), this.view.addEventListener(MSViewEvents.SWIPE_MOVE, this.onSwipeMove, this), this.view.addEventListener(MSViewEvents.SWIPE_CANCEL, this.onSwipeCancel, this), this.linkdis = !1, this.swipeMoved = !1), this.loadImages(), this.hasLayers && this.layerController.prepareToShow(), this.ready && (this.bgvideo && this.bgvideo.play(), this.hasLayers && this.slider.options.instantStartLayers && this.layerController.showLayers()), this.moz && this.$element.css("margin-top", ""))
    }, p.select = function () {
      this.selected || (this.selected = !0, this.pselected = !1, this.$element.addClass("ms-sl-selected"), this.hasLayers && (this.slider.options.autoHeight && this.layerController.updateHeight(), this.slider.options.instantStartLayers || this.layerController.showLayers()), this.ready && this.bgvideo && this.bgvideo.play(), this.videoAutoPlay && (this.videodis = !1, this.vpbtn.trigger("click")))
    }, p.unselect = function () {
      this.pselected = !1, this.moz && this.$element.css("margin-top", "0.1px"), (this.link || this.video) && (this.view.removeEventListener(MSViewEvents.SWIPE_START, this.onSwipeStart, this), this.view.removeEventListener(MSViewEvents.SWIPE_MOVE, this.onSwipeMove, this), this.view.removeEventListener(MSViewEvents.SWIPE_CANCEL, this.onSwipeCancel, this)), this.bgvideo && (this.bgvideo.pause(), !this.autoPauseBgVid && this.vinit && (this.bgvideo.currentTime = 0)), this.hasLayers && this.layerController.hideLayers(), this.selected && (this.selected = !1, this.$element.removeClass("ms-sl-selected"), this.video && this.vplayed && (this.__closeVideo(), this.roc = !1))
    }, p.sleep = function (force) {
      (!this.isSleeping || force) && (this.isSleeping = !0, this.autoAppend && this.$element.detach(), this.hasLayers && this.layerController.onSlideSleep())
    }, p.wakeup = function () {
      this.isSleeping && (this.isSleeping = !1, this.autoAppend && this.view.$slideCont.append(this.$element), this.moz && this.$element.css("margin-top", "0.1px"), this.setupBG(), this.hasBG && this.bgAligner.align(), this.hasLayers && this.layerController.onSlideWakeup())
    }
  }
