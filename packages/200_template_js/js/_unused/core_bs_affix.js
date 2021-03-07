/*
 # -----------------------------------------------------------------------------
 #  ~/js/j1_template/core.js
 #  Provides an empty object for later loaded core objects
 #
 #  Product/Info:
 #  https://jekyll.one
 #  http://getbootstrap.com/
 #
 #  Copyright (C) 2021 Juergen Adams
 #
 #  J1 Template is licensed under MIT License.
 #  See: https://github.com/jekyll-one-org/J1 Template/blob/master/LICENSE
 # -----------------------------------------------------------------------------
*/
'use strict';

// -----------------------------------------------------------------------------
// ESLint shimming
// -----------------------------------------------------------------------------
/* eslint indent: "off"                                                       */
/* eslint no-unused-vars: "off"                                               */
/* eslint no-undef: "off"                                                     */
// -----------------------------------------------------------------------------

// module.exports = function core ( options ) {
/*!
 * J1 Core
 * Copyright (C) 2021 Juergen Adams
 * Licensed under MIT License.
 */
module.exports = (function (options) {

  // ---------------------------------------------------------------------------
  // Global variables
  // ---------------------------------------------------------------------------
  // var messageCatalog  = {};
  // var state;
  // var logger;
  // var logText;

  // ---------------------------------------------------------------------------
  // Default settings
  // ---------------------------------------------------------------------------
  var settings = $.extend({
    foo: 'foo_option',
    bar: 'bar_option'
  }, options );

  var state = 'loaded';

  // BS Affix not used (anymore)
  // ===========================================================================

  // ---------------------------------------------------------------------------
  // Affix based on Bootstrap affix.js (BS v3.3.7)
  // For details see: https://getbootstrap.com/docs/3.3/javascript/#affix
  // ---------------------------------------------------------------------------

  // AFFIX CLASS DEFINITION
  // ---------------------------------------------------------------------------
  // var Affix = function (element, options) {
  //   this.options = $.extend({}, Affix.DEFAULTS, options);
  //
  //   this.$target = $(this.options.target)
  //     .on('scroll.bs.affix.data-api', $.proxy(this.checkPosition, this))
  //     .on('click.bs.affix.data-api',  $.proxy(this.checkPositionWithEventLoop, this));
  //
  //   this.$element     = $(element);
  //   this.affixed      = null;
  //   this.unpin        = null;
  //   this.pinnedOffset = null;
  //
  //   this.checkPosition();
  // };
  //
  // Affix.VERSION  = '3.3.7';
  // Affix.RESET    = 'affix affix-top affix-bottom';
  // Affix.DEFAULTS = {
  //   offset: 0,
  //   target: window
  // };
  //
  // Affix.prototype.getState = function (scrollHeight, height, offsetTop, offsetBottom) {
  //   var scrollTop    = this.$target.scrollTop();
  //   var position     = this.$element.offset();
  //   var targetHeight = this.$target.height();
  //
  //   if (offsetTop !== null && this.affixed === 'top') { return scrollTop < offsetTop ? 'top' : false; }
  //
  //   if (this.affixed === 'bottom') {
  //     if (offsetTop !== null) { return (scrollTop + this.unpin <= position.top) ? false : 'bottom'; }
  //     return (scrollTop + targetHeight <= scrollHeight - offsetBottom) ? false : 'bottom';
  //   }
  //
  //   var initializing   = this.affixed === null;
  //   var colliderTop    = initializing ? scrollTop : position.top;
  //   var colliderHeight = initializing ? targetHeight : height;
  //
  //   if (offsetTop !== null && scrollTop <= offsetTop) { return 'top'; }
  //   if (offsetBottom !== null && (colliderTop + colliderHeight >= scrollHeight - offsetBottom)) { return 'bottom'; }
  //
  //   return false;
  // };
  //
  // Affix.prototype.getPinnedOffset = function () {
  //   if (this.pinnedOffset) { return this.pinnedOffset; }
  //   this.$element.removeClass(Affix.RESET).addClass('affix');
  //   var scrollTop = this.$target.scrollTop();
  //   var position  = this.$element.offset();
  //   return (this.pinnedOffset = position.top - scrollTop);
  // };
  //
  // Affix.prototype.checkPositionWithEventLoop = function () {
  //   setTimeout($.proxy(this.checkPosition, this), 1);
  // };
  //
  // Affix.prototype.checkPosition = function () {
  //   if (!this.$element.is(':visible')) { return; }
  //
  //   var height       = this.$element.height();
  //   var offset       = this.options.offset;
  //   var offsetTop    = offset.top;
  //   var offsetBottom = offset.bottom;
  //   var scrollHeight = Math.max($(document).height(), $(document.body).height());
  //
  //   if (typeof offset !== 'object') { offsetBottom = offsetTop = offset; }
  //   if (typeof offsetTop === 'function') { offsetTop    = offset.top(this.$element); }
  //   if (typeof offsetBottom === 'function') { offsetBottom = offset.bottom(this.$element); }
  //
  //   var affix = this.getState(scrollHeight, height, offsetTop, offsetBottom);
  //
  //   if (this.affixed !== affix) {
  //     if (this.unpin !== null) { this.$element.css('top', ''); }
  //
  //     var affixType = 'affix' + (affix ? '-' + affix : '');
  //     var e         = $.Event(affixType + '.bs.affix');
  //
  //     this.$element.trigger(e);
  //
  //     if (e.isDefaultPrevented()) { return; }
  //
  //     this.affixed = affix;
  //     this.unpin = affix === 'bottom' ? this.getPinnedOffset() : null;
  //
  //     this.$element
  //       .removeClass(Affix.RESET)
  //       .addClass(affixType)
  //       .trigger(affixType.replace('affix', 'affixed') + '.bs.affix');
  //   }
  //
  //   if (affix === 'bottom') {
  //     this.$element.offset({
  //       top: scrollHeight - height - offsetBottom
  //     });
  //   }
  // };
  //
  // // AFFIX PLUGIN DEFINITION
  // // ---------------------------------------------------------------------------
  // function Plugin(option) {
  //   return this.each(function () {
  //     var $this   = $(this);
  //     var data    = $this.data('bs.affix');
  //     var options = typeof option === 'object' && option;
  //
  //     if (!data) { $this.data('bs.affix', (data = new Affix(this, options))); }
  //     if (typeof option === 'string') { data[option](); }
  //   });
  // }
  // var old = $.fn.affix;
  //
  // $.fn.affix             = Plugin;
  // $.fn.affix.Constructor = Affix;
  //
  // // AFFIX NO CONFLICT
  // // ---------------------------------------------------------------------------
  // $.fn.affix.noConflict = function () {
  //   $.fn.affix = old;
  //   return this;
  // };
  //
  // // AFFIX DATA-API
  // // ---------------------------------------------------------------------------
  // $(window).on('load', function () {
  //   $('[data-spy="affix"]').each(function () {
  //     var $spy = $(this);
  //     var data = $spy.data();
  //
  //     data.offset = data.offset || {};
  //
  //     if (data.offsetBottom !== null) { data.offset.bottom = data.offsetBottom; }
  //     if (data.offsetTop    !== null) { data.offset.top    = data.offsetTop; }
  //
  //     Plugin.call($spy, data);
  //   });
  // });

  // ------------------------------------------------------------------------------
  // END BS Affix (unused)

  return {

    // -------------------------------------------------------------------------
    // _init_
    // Global initializer for the core object
    // -------------------------------------------------------------------------
    _init_: function (options) {

      //
      // Place handling of options here
      //

      return;
    },  // END _init_

    // -------------------------------------------------------------------------
    //  Returns the current (processing) state of the module
    // -------------------------------------------------------------------------
    getState: function () {
      return state;
    }, // END state

    // -------------------------------------------------------------------------
    // isMobile
    // Return true if the current platform is a mobile device
    // -------------------------------------------------------------------------
    isMobile: function (ua_name) {
      var mobile = false;
      (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw-(n|u)|c55\/|capi|ccwa|cdm|cell|chtm|cldc|cmd|co(mp|nd)|craw|da(it|ll|ng)|dbte|dcs|devi|dica|dmob|do(c|p)o|ds(12|d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(|_)|g1 u|g560|gene|gf5|gmo|go(\.w|od)|gr(ad|un)|haie|hcit|hd(m|p|t)|hei|hi(pt|ta)|hp( i|ip)|hsc|ht(c(| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i(20|go|ma)|i230|iac( ||\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|[a-w])|libw|lynx|m1w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|mcr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|([1-8]|c))|phil|pire|pl(ay|uc)|pn2|po(ck|rt|se)|prox|psio|ptg|qaa|qc(07|12|21|32|60|[2-7]|i)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h|oo|p)|sdk\/|se(c(|0|1)|47|mc|nd|ri)|sgh|shar|sie(|m)|sk0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h|v|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl|tdg|tel(i|m)|tim|tmo|to(pl|sh)|ts(70|m|m3|m5)|tx9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas|your|zeto|zte/i.test(a.substr(0,4))) mobile = true;})(navigator.userAgent||navigator.vendor||window.opera);
      return mobile;
    }, // END isMobile

    // -------------------------------------------------------------------------
    // Clear button for input fields (forms)
    // -------------------------------------------------------------------------
    bsFormClearButton: function () {
//    $('.position-relative :input').on('keydown focus', function() {
      $(':input').on('keydown focus change mouseover', function() {
        if ($(this).val().length > 0) {
          $(this).nextAll('.form-clear').removeClass('d-none');
        }
      }).on('keydown keyup blur', function() {
        if ($(this).val().length === 0) {
          $(this).nextAll('.form-clear').addClass('d-none');
        }
      });
      $('.form-clear').on('click', function() {
        $(this).addClass('d-none').prevAll(':input').val('');
        // hide|clear results from searcher module
        $('#jss-panel').hide();
        $('#jss-results').html('');
      });
    }

  }; // end return (object)

//})( jQuery, window );
})(); // END IFFE
