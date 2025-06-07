/* TODO: needs to be updated for VJS V8
-------------------------------------------------------------------------------- */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('video.js')) :
  typeof define === 'function' && define.amd ? define(['video.js'], factory) :
  (global = global || self, global.videojsAspectRatioPanel = factory(global.videojs));
}(this, (function (videojs) { 'use strict';

  videojs = videojs && Object.prototype.hasOwnProperty.call(videojs, 'default') ? videojs['default'] : videojs;

  function _inheritsLoose(subClass, superClass) {
    subClass.prototype = Object.create(superClass.prototype);
    subClass.prototype.constructor = subClass;
    subClass.__proto__ = superClass;
  }

  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }

  var version = "0.0.1";

  var MenuButton = videojs.getComponent("MenuButton");

  var ResizerButton = /*#__PURE__*/function (_MenuButton) {
    _inheritsLoose(ResizerButton, _MenuButton);

    function ResizerButton(player, options) {
      var _this;

      _this = _MenuButton.call(this, player, {
        name: "ResizerButton"
      }) || this;
      MenuButton.apply(_assertThisInitialized(_this), arguments);

      _this.controlText(player.localize("Aspect Ratio"));

      return _this;
    }

    var _proto = ResizerButton.prototype;

    _proto.createEl = function createEl() {
      return videojs.dom.createEl("div", {
        className: "vjs-menu-button vjs-menu-button-popup vjs-control vjs-button"
      });
    };

    _proto.buildCSSClass = function buildCSSClass() {
      return MenuButton.prototype.buildCSSClass.call(this) + " vjs-icon-cog";
    };

    _proto.update = function update() {
      return MenuButton.prototype.update.call(this);
    };

    _proto.handleClick = function handleClick() {
      this.player().getChild("ResizerPanel").toggleClass("vjs-hidden");
    };

    return ResizerButton;
  }(MenuButton);

  var Component = videojs.getComponent("Component");

  var ResizerPanel = /*#__PURE__*/function (_Component) {
    _inheritsLoose(ResizerPanel, _Component);

    function ResizerPanel(player, options) {
      var _this;

      _this = _Component.call(this, player, options) || this;
      Component.apply(_assertThisInitialized(_this), arguments);
      _this.aspectRadio = "origin"; // origin, 4:3, 16:9, fill

      _this.percent = 100;
      _this.radioWidth = 1;
      _this.radioHeight = 1;
      _this.currentHeight = _this.player().currentHeight();
      _this.currentWidth = _this.player().currentWidth();

      var el = _this.el(); // 关闭


      el.childNodes[1].childNodes[1].onclick = function () {
        _this.toggleClass("vjs-hidden");
      }; // 窗口大小改变


      window.addEventListener("resize", function () {
        if (_this.currentHeight != _this.player().currentHeight() || _this.currentWidth != _this.player().currentWidth()) {
          _this.currentHeight = _this.player().currentHeight();
          _this.currentWidth = _this.player().currentWidth();

          _this.resize();
        }
      }); // 滑动条

      el.onmouseup = function () {
        el.onmousemove = null;
      };

      var scroll = el.childNodes[1].childNodes[5].childNodes[1].childNodes[3];

      _this.setScrollFunc(el, scroll, function (data) {
        _this.setPercent(data);
      }); // 播放下个视频时，应用参数


      _this.player().on("play", function () {
        _this.resize();
      }); // 比例选择


      var radiosDiv = el.childNodes[1].childNodes[5].childNodes[3].childNodes;
      var radios = [radiosDiv[1], radiosDiv[5], radiosDiv[9], radiosDiv[13]];
      var prev = "origin";

      for (var i = 0; i < radios.length; i++) {
        radios[i].onchange = function (event) {
          if (event.target.value !== prev) {
            prev = event.target.value;

            _this.setAspectRadio(event.target.value);
          }
        };
      } // 恢复默认


      var resetDiv = el.childNodes[1].childNodes[5].childNodes[5].childNodes[1];

      resetDiv.onclick = function (event) {
        radios[0].checked = true;

        _this.reset();
      };

      return _this;
    }

    var _proto = ResizerPanel.prototype;

    _proto.setAspectRadio = function setAspectRadio(radio) {
      switch (radio) {
        case "origin":
          this.aspectRadio = "origin";
          break;

        case "fill":
          this.aspectRadio = "fill";
          break;

        case "16:9":
          this.aspectRadio = "16:9";
          this.radioWidth = 16;
          this.radioHeight = 9;
          break;

        case "4:3":
          this.aspectRadio = "4:3";
          this.radioWidth = 4;
          this.radioHeight = 3;
          break;
      }

      this.resize();
    };

    _proto.setPercent = function setPercent(percent) {
      this.percent = percent;
      this.resize();
    };

    _proto.reset = function reset() {
      this.player().tech_.el().style.objectFit = "contain";
      this.aspectRadio = "origin";
      this.percent = 100;
      var scroll = this.el().childNodes[1].childNodes[5].childNodes[1].childNodes[3];
      scroll.childNodes[1].style.left = "255px";
      scroll.childNodes[3].style.width = "255px";
      this.resize();
    };

    _proto.resize = function resize() {
      if (this.aspectRadio != "origin") {
        this.player().tech_.el().style.objectFit = "fill";
      } else {
        this.player().tech_.el().style.objectFit = "contain";
      }

      if (this.aspectRadio == "origin" || this.aspectRadio == "fill") {
        var _w = this.currentWidth * (100 - this.percent) / 100 / 2;

        var _h = this.currentHeight * (100 - this.percent) / 100 / 2;

        this.setPadding(_w, _h);
        return;
      } // 计算播放器画面比例，如果小于目标，使用宽度作为计算标准，大于则使用高度
      // 4:3=1.333
      // 16:9=1.778


      var playerRadio = this.currentWidth / this.currentHeight; // 需要的高宽度

      var width = this.currentWidth;
      var height = width * this.radioHeight / this.radioWidth;

      if (playerRadio > this.radioWidth / this.radioHeight) {
        height = this.currentHeight;
        width = height * this.radioWidth / this.radioHeight;
      }

      var w = (this.currentWidth - width * this.percent / 100) / 2;
      var h = (this.currentHeight - height * this.percent / 100) / 2;
      this.setPadding(w, h); // console.log(playerRadio, this.radioWidth / this.radioHeight, width, height, w, h);
    };

    _proto.setPadding = function setPadding(w, h) {
      if (w < 0) {
        w = 0;
      }

      this.player().tech_.el().style.paddingLeft = w + "px";
      this.player().tech_.el().style.paddingRight = w + "px";

      if (h < 0) {
        h = 0;
      }

      this.player().tech_.el().style.paddingTop = h + "px";
      this.player().tech_.el().style.paddingBottom = h + "px";
    };

    _proto.setScrollFunc = function setScrollFunc(scrollDiv, scrollDom, callback) {
      var bar = scrollDom.childNodes[1];
      var mask = scrollDom.childNodes[3];
      var barleft = 0;

      bar.onmousedown = function (e) {
        var event = e || window.event;
        var leftVal = event.clientX - this.offsetLeft;
        var that = this;

        scrollDiv.onmousemove = function (e) {
          var event = e || window.event;
          barleft = event.clientX - leftVal;
          if (barleft < 0) barleft = 0;else if (barleft > 255) barleft = 255;
          mask.style.width = barleft + "px";
          that.style.left = barleft + "px";
          callback(parseInt(barleft / 255 * 100)); //防止选择内容--当拖动鼠标过快时候，弹起鼠标，bar也会移动，修复bug

          window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty();
        };
      };
    };

    _proto.createEl = function createEl() {
      return videojs.dom.createEl("div", {
        className: "vjs-resizer-modal vjs-hidden",
        innerHTML: "\n        <div class=\"vjs-resizer-modal-content\">\n        <span class=\"vjs-resizer-modal-close\">&times;</span>\n          <div class=\"vjs-resizer-modal-title\">Aspect Ratio</div>\n          <div class=\"vjs-resizer-wrap\">\n            <div class=\"vjs-resizer-size\">\n              <span class=\"size-title\">Size</span>\n              <div class=\"size-scroll\" id=\"size-scroll\">\n                <div class=\"size-scroll-bar\"></div>\n                <div class=\"size-scroll-mask\"></div>\n              </div>\n            </div>\n            <div class=\"radios\">\n              Ratio\n              <input type=\"radio\" name=\"radio\" id=\"origin\" value=\"origin\" checked >\n              <label for=\"origin\">Default</label>\n              <input type=\"radio\" name=\"radio\" id=\"4:3\" value=\"4:3\">\n              <label for=\"4:3\">4:3</label>\n              <input type=\"radio\" name=\"radio\" id=\"16:9\" value=\"16:9\">\n              <label for=\"16:9\">16:9</label>\n              <input type=\"radio\" name=\"radio\" id=\"fill\" value=\"fill\">\n              <label for=\"fill\">Full</label>\n            </div>\n            <ul style=\"clear:both\">\n                <li id=\"vjs-resizer-reset\">Reset</li>\n            </ul>\n          </div>\n        </div>\n        "
      });
    };

    return ResizerPanel;
  }(Component);

  var Plugin = videojs.getPlugin("plugin"); // Default options for the plugin.

  var defaults = {};
  /**
   * An advanced Video.js plugin. For more information on the API
   *
   * See: https://blog.videojs.com/feature-spotlight-advanced-plugins/
   */

  var AspectRatioPanel = /*#__PURE__*/function (_Plugin) {
    _inheritsLoose(AspectRatioPanel, _Plugin);

    /**
     * Create a AspectRatioPanel plugin instance.
     *
     * @param  {Player} player
     *         A Video.js Player instance.
     *
     * @param  {Object} [options]
     *         An optional options object.
     *
     *         While not a core part of the Video.js plugin architecture, a
     *         second argument of options is a convenient way to accept inputs
     *         from your plugin's caller.
     */
    function AspectRatioPanel(player, options) {
      var _this;

      // the parent class will add player under this.player
      _this = _Plugin.call(this, player) || this;
      _this.options = videojs.mergeOptions(defaults, options);

      _this.player.ready(function () {
        _this.player.addClass("vjs-aspect-ratio-panel");

        if (player.techName_ != "Html5") {
          return false;
        }

        player.on(["loadedmetadata"], function (e) {
          if (player.aspect_ratio_initialized == "undefined" || player.aspect_ratio_initialized == true) ; else {
            player.aspect_ratio_initialized = true;
            var controlBar = player.controlBar;
            var fullscreenToggle = controlBar.getChild("fullscreenToggle").el();
            controlBar.el().insertBefore(controlBar.addChild("ResizerButton").el(), fullscreenToggle);
            player.addChild("ResizerPanel");
          }
        });
      });

      videojs.registerComponent("ResizerButton", ResizerButton);
      videojs.registerComponent("ResizerPanel", ResizerPanel);
      return _this;
    }

    return AspectRatioPanel;
  }(Plugin); // Define default values for the plugin's `state` object here.


  AspectRatioPanel.defaultState = {}; // Include the version number.

  AspectRatioPanel.VERSION = version; // Register the plugin with video.js.

  videojs.registerPlugin("aspectRatioPanel", AspectRatioPanel);

  return AspectRatioPanel;

})));
