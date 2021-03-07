/*
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/modules/twemoji/js/picker/twemoji-picker.js
 # Twemoji-Picker v2017-06-03 implementation for J1 template
 #
 # Product/Info:
 # https://jekyll.one
 # https://github.com/xLs51/Twemoji-Picker
 #
 # Copyright (C) 2021 Juergen Adams
 # Copyright (C) 2015 xLs51
 #
 # J1 Template is licensed under the MIT License.
 # See: https://github.com/jekyll-one-org/J1 Template/blob/master/LICENSE
 # Twemoji-Picker is licensed under under the MIT License.
 # For details, https://github.com/xLs51/Twemoji-Picker
 # -----------------------------------------------------------------------------
*/
(function ($, window, undefined) {
  var b = 150;
  var d = {};
  var twa_database = "/assets/data/twa_v1.json";

  $.TwemojiPicker = function (element, options) {
    var h = this;
    $.when(this._loadDatabase()).done(function (e) {
      h.$el = $(element);
      h._init(options)
    })
  };
  $.TwemojiPicker.defaults = {
    init: null,
    size: 25,
    icon: "grinning",
    iconSize: 25,
    height: 100,
    width: null,
    category: ["smile", "cherry-blossom", "video-game", "oncoming-automobile", "symbols"],
    categorySize: 20,
    pickerPosition: null,
    pickerHeight: 150,
    pickerWidth: null,
    placeholder: "",
  };
  $.TwemojiPicker.prototype = {
    _init: function (h) {
      this.options = $.extend(true, {}, $.TwemojiPicker.defaults, h);
      this._initPicker();
      this._initCategory();
      this._initTwemoji();
      this._initText();
      this._initStyle();
      this._initEvents()
    },
    _loadDatabase: function f() {
      return $.ajax({
        url: twa_database,
        success: function (h) {
          if (typeof h == "string") {
            d = JSON.parse(h)
          }
          if (typeof h == "object") {
            d = h
          }
        }
      })
    },
    _initPicker: function () {
      var h = this;
      h.$id = "#" + h.$el["0"].id;
      h.$pickerHeigth = h.options.height.replace("px", "");
      h.$pickerHeigth = Number(h.$pickerHeigth);
      h.$wrapper = h.$el.wrap('<div class="twemoji-wrap"></div>').parent();
      h.$wrapper.append('<div class="twemoji-textarea" contentEditable="true" placeholder="' + h.options.placeholder + '"></div>');
      h.$wrapper.append('<div class="twemoji-textarea-duplicate"></div>');
      h.$wrapper.append('<div class="twemoji-icon-picker"><span id="open-group" class="mr-2" style="width: 2rem; height: 2rem;"><button type="button" name="open-group" class="btn btn-raised btn-flex btn-primary mr-2"><i class="toggle-button mdi mdi-lg mr-1 mdi-toggle-switch-off"></i> Picker <div class="ripple-container"></div></button></span><span id="clear-textarea" style="width: 2rem; height: 2rem;"><button type="button" name="clear-textarea" class="btn btn-raised btn-flex btn-primary"><i class="mdi mdi-close mdi-lg mr-1"></i> Clear </button></span></div>');
      h.$wrapper.append('<div class="twemoji-picker"></div>');
      h.$el.hide();
      h.$textarea = h.$wrapper.find(".twemoji-textarea");
      h.$textareaDuplicate = h.$wrapper.find(".twemoji-textarea-duplicate").hide();
      h.$iconPicker = h.$wrapper.find("#open-group");
      h.$clearTextarea = h.$wrapper.find("#clear-textarea");
      h.$picker = h.$wrapper.find(".twemoji-picker").hide()
    },
    _initCategory: function () {
      var h = this;
      var i = this.options.category;
      this.categoryName = ["people", "nature", "object", "place", "symbol"];
      this.$picker.append('<div class="twemoji-picker-category"></div>');
      this.$pickerCategory = this.$picker.find(".twemoji-picker-category");
      $.each(this.categoryName, function (j, k) {
        h.$pickerCategory.append('<span data-category="' + k + '">' + h.imageFromName(i[j]) + "</span>")
      });
      this.$pickerCategory.find("span:first").addClass("active")
    },
    _initTwemoji: function () {
      var h = this;
      $.each(this.categoryName, function (j, k) {
        h.$picker.append('<div class="twemoji-list ' + k + '"></div>');
        $.each(d, function (i, l) {
          if (l.category === k) {
            h.$wrapper.find(".twemoji-picker ." + k).append('<span><img class="emoji" draggable="false" src="' + l.base64 + '" alt="' + l.value + '" title="' + l.name + '"></span>')
          }
        })
      });
      this.$twemojiList = this.$picker.find(".twemoji-list");
      this.$twemojiList.not(":first").hide()
    },
    _initText: function () {
      if (this.options.init) {
        var j = this.options.init;
        var i = /:([\w-]+):/g;
        var h;
        while (h == i.exec(j)) {
          j = j.replace(h[0], this.imageFromName(h[1], true))
        }
        this.$textarea.html(j);
        this.copyTextArea(this.$textarea.html())
      }
    },
    _initStyle: function () {
      this.$wrapper.css({
        width: this.options.width ? this.options.width : "100%",
        height: this.options.height ? this.options.height : "",
      });
      this.$wrapper.find("img").css({
        width: this.options.size,
        height: this.options.size,
      });
      this.$iconPicker.css({
        width: this.options.iconSize,
        height: this.options.iconSize,
      });
      this.$pickerCategory.find("img").css({
        width: this.options.categorySize,
        height: this.options.categorySize,
      });
      this.$twemojiList.css({
        width: this.options.pickerWidth ? this.options.pickerWidth : "100%",
        height: this.options.pickerHeight,
      });
      this.$picker.css({
        width: this.options.pickerWidth ? this.options.pickerWidth : "100%",
        top: this.options.pickerPosition === "top" ? "-" + this.$picker.outerHeight() + "px" : "",
      })
    },
    _initEvents: function () {
      var h = this;
      this.$textarea.on("keyup", function () {
        h.copyTextArea($(this).html())
      });
      this.$iconPicker.on("click", function () {
        var i = $(".twemoji-picker").height() + b;
        $("#picker").height(i);
        $(".toggle-button").toggleClass("mdi-toggle-switch-off mdi-toggle-switch");
        if (!h.openedPicker) {
          h.openPicker()
        } else {
          h.closePicker();
          $("#picker").height(h.$pickerHeigth)
        }
      });
      this.$clearTextarea.on("click", function () {
        h.copyTextArea("");
        $(h.$id).val("");
        $(".twemoji-textarea > .emoji-span").remove()
      });
      this.$pickerCategory.find("span").on("click", function () {
        var i = $(this).data("category");
        h.openCategory($(this), i)
      });
      this.$pickerCategory.find(".close").on("click", function () {
        if (h.openedPicker) {
          h.closePicker()
        }
      });
      this.$twemojiList.find("img").on("click", function () {
        h.copyTwemoji($(this))
      })
    },
    copyText: function (text) {
        var copyFrom = document.createElement('textarea');
        copyFrom.setAttribute("style", "position:fixed;opacity:0;top:100px;left:100px;");
        copyFrom.value = text;
        document.body.appendChild(copyFrom);
        copyFrom.select();
        document.execCommand('copy');
        var copied = document.createElement('div');
        copied.setAttribute('class', 'copied');
        copied.appendChild(document.createTextNode('Copied to Clipboard'));
        document.body.appendChild(copied);
        setTimeout(function () {
            document.body.removeChild(copyFrom);
            document.body.removeChild(copied);
        }, 1500);
    },
    openPicker: function () {
      this.$picker.show();
      this.openedPicker = true
    },
    closePicker: function () {
      this.$picker.hide();
      this.openedPicker = false
    },
    openCategory: function (h, i) {
      this.$pickerCategory.find("span").removeClass("active");
      h.addClass("active");
      this.$twemojiList.not(".twemoji-picker ." + i).hide();
      this.$twemojiList.filter(".twemoji-picker ." + i).show()
    },
    copyTwemoji: function (l) {
      var i = l.attr("alt");
      var k = l.attr("src");
      var j = l.attr("title");
      var h = "emoji:" + j + "[]";
      this.copyText(h);
      this.$textarea.focus();
      this.pasteAtCursor('<span class="emoji-span"><img class="emoji" src="' + k + '" title="' + j + '" alt="' + i + '" width="' + this.options.size + '" height="' + this.options.size + '"> ' + h + "</span> ");
      this.copyTextArea(this.$textarea.html())
    },
    copyTextArea: function (j) {
      var h = this.$textareaDuplicate.html(j);
      h.find("img").replaceWith(function () {
        return this.alt
      });
      var i = h.html();
      this.$el.text(i)
    },
    imageFromName: function (i, j) {
      var h = $.grep(d, function (k) {
        return k.name == i
      });
      if (j) {
        return '<img class="emoji" src="' + h[0].base64 + '" alt="' + h[0].value + '" width="' + this.options.size + '" height="' + this.options.size + '">'
      }
      return '<img class="emoji" draggable="false" src="' + h[0].base64 + '" alt="' + i + '">'
    },
    pasteAtCursor: function (m) {
      var l, h;
      if (window.getSelection) {
        l = window.getSelection();
        if (l.getRangeAt && l.rangeCount) {
          h = l.getRangeAt(0);
          h.deleteContents();
          var i = document.createElement("div");
          i.innerHTML = m;
          var n = document.createDocumentFragment(),
            k, j;
          while ((k = i.firstChild)) {
            j = n.appendChild(k)
          }
          h.insertNode(n);
          if (j) {
            h = h.cloneRange();
            h.setStartAfter(j);
            h.collapse(true);
            l.removeAllRanges();
            l.addRange(h)
          }
        }
      } else {
        if (document.selection && document.selection.type != "Control") {
          document.selection.createRange().pasteHTML(m)
        }
      }
    }
  };
  $.fn.twemojiPicker = function (i) {
    var h = $.data(this, "twemojiPicker");
    this.each(function () {
      h ? h._init() : h = $.data(this, "twemojiPicker", new $.TwemojiPicker(this, i))
    });
    return h
  }
})(jQuery, window);
