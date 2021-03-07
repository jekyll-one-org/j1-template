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
// See: https://github.com/xLs51/Twemoji-Picker/blob/master/js/twemoji-picker.js

;(function($, window, undefined) {
    'use strict';
    // emoji database shortend !!!
    var emoji = [
        {'name': 'smile', 'value': '&#x1f604', 'category': 'people', 'base64': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEgAAABICAMAAABiM0N1AAAAilBMVEUAAAD/zE3/zE3/zE3/zE3/zE3/zE3/zE3/zE3/zE3/zE3/zE3/zE3/zE3/zE3ZqjqfeB15VgpmRQD1xEiWbxjisz+MZxPGmTCDXg7su0OziSfPojWpgCK8kSvs6N/Z0b+zooCWf1CDaDB5XCD18+/////i3M+8ro+MdECfi2BwURDGuZ/Pxa9wTQX63lTUAAAAD3RSTlMAEFCAv8//ADCPYO/fIK8hQ7nBAAACWklEQVR4AdTMYVLEIAwG0E0g3zZJy/2P68yKiq10gfzyHeA9/hXilAWV5MT07Hs8OzYVXIhuk5EJOsTGI0qOG55oLLIdb+w2EB0ZA/LxLmLHEOf7SDFMbyIqmFCoF5FgilAbrT91ukYF08pfkWKBXiPGEj5Hh2OJH6coY1H+HRmWWRvRjmU7NVFCQGoiR4D/RIYQ+44EIfIVbQjaaqQI0hoJguQzIoTRK2KE8StKOPtoxmyW3ISBIOwLVXEuklogQNggCMb4h/d/vaXkxAgPg52ESuU77GEOXVjaHk2PkApQUvB1+j+5o37VMX4Sa7ZOnLsjZ50oPFEJXw+JvNC8phUClObrIQtCBjMMX18XSvFCytdXhfy1pP5eROovab3OCmUqnX2gytg6FdqA/1Qo+nudaMEiCXUSRYucWmRmWp0BULEtck4jL2ysABgdmpa0EYknmTnYo/Dk/u/RHkyGJzJsI6Sx4TcgjS04bf1nQhFp/l6orFzdgOVH7apyLrSnzxFGmvY00lVn53pP0z9w7lx1p5G2mQt9ow+kwsjl9IYLELo2WniyJaZv4mibl1v7vjBEFPBcK16nusJThEMEHWsUHtTlskxZ44GiY40ftGiH7G8t+VG3PuyQdNAKTynDRO/u3S+R7u56TGTTCTHDaIKPSAK/MuNxig9IufE4tK7EW2RoVz5CyM919uuhxmIVy4YaErOKASxDwccsqqRjMMSa6KxHUWGwgBFsFOXDcSIHzBhkwofj9bgurFHwKGMFietbLRC2X2lsv2TZfu2z/SLKs8VqjOFfCH0ByBm6fDeZrjYAAAAASUVORK5CYII='},
        {'name': 'smiley', 'value': '&#x1f603', 'category': 'people', 'base64': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEgAAABICAMAAABiM0N1AAAAilBMVEUAAAD/zE3/zE3/zE3/zE3/zE3/zE3/zE3/zE3/zE3/zE3/zE3/zE3/zE3/zE2pgCJmRQDsu0OfeB31xEjGmTCDXg7isz/Zqjp5VgqWbxiziSfPojWMZxO8kSvs6N/Z0b+zooCWf1CDaDB5XCD18+/////i3M+8ro+MdECfi2BwURDGuZ/Pxa9wTQVrjtwGAAAAD3RSTlMAEFCAv8//ADCPYO/fIK8hQ7nBAAACaElEQVR4AeTU627DIAzF8RrwWYAkpbf3f9VJjJXUE54rPk37fz3VT73Fpz8VOR8YLQ7e0ce402hYIgMyjsubUGIM4mSHyGcoZU82KK2A3poM0BZgKGy/QS7DVHY6FGEuKhDtgL2dRhAx3opJQCZHkSS04+12Ccnv+VzKGb3xEn9C7vXVQhouTkJb7uOl1C5oaUveBBTQu5baFS11Ca9QQu9WWje01CUdIVrRu5fWHS11WekAefn+5SfQFn+A8nF4lNYDLX3JHUo4Vp4BsCzpCfEcxN/QgjkIS4PiLBQbxLMQf0GEWQhUIWf6kdXFVcib/nbq4isULA+CvoQKseXR1BeukH4sbIuA7IdNh+ynVofsx1+H7P1DiDEdf7Zi9jkKwlAQT0x2s/qPA0VaSoXCIuIH97/eUgyJ7FhkN/0dYEI1897Me2GRVH6+R8iILTIzrXAGV5nOI59GlOtMATCCTLthDzgOZq+PciSSjqPemwMc5JMNDTb8ARpsT7+2+J/QBw3/UagobVXDy3dly2IutOV1hIG6OQ205dnabqTuHlh7LtvTQFPPhb54QSoMXE5vuGBAPb+MVnaM6Zv8NPWvf233IkTkGLmWfp3yipF8FiIo1ig8qIrXMkWFB2oWazhoJZjobg096tZhIuGg5djREnR09t5OIu3dOhVekTtPGE2xipTCKMXjBCtIOB5zYI/hhwy7WaoQ8Xqd7XKp0VhEU6nx1qy8h5c+99csVhIZPGSCdJarqDQAY6S3ivrLcRr3mNHHKVW1lXVdaqMwooyWXNfDHxDCnzTCH1mCnX0CHKKYMKex9QQW+gEqvLzO7u7P1gAAAABJRU5ErkJggg=='},
    ];

    $.TwemojiPicker = function(element, options) {
        this.$el = $(element);
        this._init(options);
    };

    $.TwemojiPicker.defaults = {
        init: null,
        size: 25,
        icon: 'grinning',
        iconSize: 25,
        height: 100,
        width: null,
        category: ['smile', 'cherry-blossom', 'video-game', 'oncoming-automobile', 'symbols'],
        categorySize: 20,
        pickerPosition: null,
        pickerHeight: 150,
        pickerWidth: null,
        placeholder: '',
    };

    $.TwemojiPicker.prototype = {
        _init : function(options) {
            this.options = $.extend(true, {}, $.TwemojiPicker.defaults, options);
            this._initPicker();
            this._initCategory();
            this._initTwemoji();
            this._initText();
            this._initStyle();
            this._initEvents();
        },

        _initPicker : function() {
            this.$wrapper = this.$el.wrap('<div class="twemoji-wrap"></div>').parent();
            this.$wrapper.append('<div class="twemoji-textarea" contentEditable="true" placeholder="' + this.options.placeholder + '"></div>');
            this.$wrapper.append('<div class="twemoji-textarea-duplicate"></div>');
            this.$wrapper.append('<div class="twemoji-icon-picker">' + this.imageFromName(this.options.icon) + '</div>');
            this.$wrapper.append('<div class="twemoji-picker"></div>');

            this.$el.hide();
            this.$textarea          = this.$wrapper.find('.twemoji-textarea');
            this.$textareaDuplicate = this.$wrapper.find('.twemoji-textarea-duplicate').hide();
            this.$iconPicker        = this.$wrapper.find('.twemoji-icon-picker img');
            this.$picker            = this.$wrapper.find('.twemoji-picker').hide();
        },

        _initCategory : function() {
            var self = this;

            var category      = this.options.category;
            this.categoryName = ['people', 'nature', 'object', 'place', 'symbol'];

            this.$picker.append('<div class="twemoji-picker-category"></div>');
            this.$pickerCategory = this.$picker.find('.twemoji-picker-category');

            $.each(this.categoryName, function(i, c) {
                self.$pickerCategory.append('<span data-category="' + c + '">' + self.imageFromName(category[i]) + '</span>');
            });

            this.$pickerCategory.append('<div class="close">&times;</div>');
            this.$pickerCategory.find('span:first').addClass('active');
        },

        _initTwemoji : function() {
            var self = this;

            $.each(this.categoryName, function(i, c) {
                self.$picker.append('<div class="twemoji-list ' + c + '"></div>');

                $.each(emoji, function(j, e) {
                    if (e.category === c) self.$wrapper.find('.twemoji-picker .' + c).append('<span><img class="emoji" draggable="false" src="' + e.base64 + '" alt="' + e.value + '"></span>');
                });
            });

            this.$twemojiList = this.$picker.find('.twemoji-list');
            this.$twemojiList.not(':first').hide();
        },

        _initText : function() {
            if(this.options.init) {
                var text  = this.options.init;
                var regex = /:([\w-]+):/g;
                var items;

                while (items = regex.exec(text)) {
                    text = text.replace(items[0], this.imageFromName(items[1], true));
                }

                this.$textarea.html(text);
                this.copyTextArea(this.$textarea.html());
            }
        },

        _initStyle : function() {
            this.$wrapper.css({
                width:  this.options.width  ? this.options.width  : '100%',
                height: this.options.height ? this.options.height : '',
            });

            this.$wrapper.find('img').css({
                width:  this.options.size,
                height: this.options.size,
            });

            this.$iconPicker.css({
                width:  this.options.iconSize,
                height: this.options.iconSize,
            });

            this.$pickerCategory.find('img').css({
                width:  this.options.categorySize,
                height: this.options.categorySize,
            });

            this.$twemojiList.css({
                width:  this.options.pickerWidth ? this.options.pickerWidth : '100%',
                height: this.options.pickerHeight,
            });

            this.$picker.css({
                width: this.options.pickerWidth              ? this.options.pickerWidth                 : '100%',
                top:   this.options.pickerPosition === 'top' ? '-' + this.$picker.outerHeight()  + 'px' : '',
            });
        },

        _initEvents : function() {
            var self = this;

            this.$textarea.on('keyup', function() {
                self.copyTextArea($(this).html());
            });

            this.$iconPicker.on('click', function() {
                if (!self.openedPicker) self.openPicker();
                else                    self.closePicker();
            });

            this.$pickerCategory.find('span').on('click', function() {
                var category = $(this).data('category');
                self.openCategory($(this), category);
            });

            this.$pickerCategory.find('.close').on('click', function() {
                if (self.openedPicker) self.closePicker();
            });

            this.$twemojiList.find('img').on('click', function() {
                self.copyTwemoji($(this));
            });
        },

        openPicker : function() {
            this.$picker.show();
            this.openedPicker = true;
        },

        closePicker : function() {
            this.$picker.hide();
            this.openedPicker = false;
        },

        openCategory : function(element, category) {
            this.$pickerCategory.find('span').removeClass('active');
            element.addClass('active');

            this.$twemojiList.not('.twemoji-picker .' + category).hide();
            this.$twemojiList.filter('.twemoji-picker .' + category).show();
        },

        copyTwemoji : function(twemoji) {
            var alt = twemoji.attr('alt');
            var src = twemoji.attr('src');

            this.$textarea.focus();
            this.pasteAtCursor('<img class="emoji" src="' + src + '" alt="' + alt + '" width="' + this.options.size + '" height="' + this.options.size + '">');
            this.copyTextArea(this.$textarea.html());
        },

        copyTextArea : function(value) {
            var container = this.$textareaDuplicate.html(value);
            container.find('img').replaceWith(function() { return this.alt; })

            var content = container.html();
            this.$el.text(content);
        },

        imageFromName : function(value, init) {
            var res = $.grep(emoji, function(e) { return e.name == value; });

            if (init) return '<img class="emoji" src="' + res[0].base64 + '" alt="' + res[0].value + '" width="' + this.options.size + '" height="' + this.options.size + '">';
            return '<img class="emoji" draggable="false" src="' + res[0].base64 + '" alt="' + value + '">';
        },

        pasteAtCursor : function(text) {
            var sel, range;

            if (window.getSelection) {
                sel = window.getSelection();

                if (sel.getRangeAt && sel.rangeCount) {
                    range = sel.getRangeAt(0);
                    range.deleteContents();

                    var el       = document.createElement('div');
                    el.innerHTML = text;

                    var frag = document.createDocumentFragment(), node, lastNode;

                    while((node = el.firstChild)) {
                        lastNode = frag.appendChild(node);
                    }

                    range.insertNode(frag);

                    if (lastNode) {
                        range = range.cloneRange();
                        range.setStartAfter(lastNode);
                        range.collapse(true);
                        sel.removeAllRanges();
                        sel.addRange(range);
                    }
                }
            } else if (document.selection && document.selection.type != 'Control') {
                document.selection.createRange().pasteHTML(text);
            }
        }
    };

    $.fn.twemojiPicker = function(options) {
        var instance = $.data(this, 'twemojiPicker');

        this.each(function() {
            instance ? instance._init() : instance = $.data(this, 'twemojiPicker', new $.TwemojiPicker(this, options));
        });

        return instance;
    };

})(jQuery, window);
