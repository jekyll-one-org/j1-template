/*
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/modules/fam/js/fam.js
 # MODIFIED FAM JS from project Materialize
 # Provides JS Core funtions for the J1 FAM Module (Floating Button Menu)
 #
 # Product/Info:
 # https://jekyll.one
 # https://github.com/Dogfalo/materialize
 #
 # Copyright (C) 2023, 2024 Juergen Adams
 #
 # J1 Template is licensed under the MIT License.
 # See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE.md
 # -----------------------------------------------------------------------------
 # TODO:
 # jadams, 2020-10-11: module needs to be rewitten to PURE jQuery
 # -----------------------------------------------------------------------------
*/
'use strict';

// -----------------------------------------------------------------------------
// ESLint shimming
// -----------------------------------------------------------------------------
/* eslint indent: "off"                                                       */
/* eslint no-unused-vars: "off"                                               */
/* eslint no-undef: "off"                                                     */
/* eslint no-redeclare: "off"                                                 */
/* eslint indent: "off"                                                       */
// -----------------------------------------------------------------------------

(function($, anim) {

  var _defaults = {
    direction: 'top',
    hoverEnabled: true,
    toolbarEnabled: false
  };

  $.fn.reverse = [].reverse;

  // jadams, 2020-10-10, added class from main (materialize.js)
  //
  class Component {

    constructor(classDef, el, options) {
      // Display error if el is valid HTML Element
      if (!(el instanceof Element)) {
        console.error(Error(el + ' is not an HTML Element'));
      }

      // If exists, destroy and reinitialize in child
      var ins = classDef.getInstance(el);
      if (!!ins) {
        ins.destroy();
      }

      this.el = el;
      this.$el = cash(el);
    }

    /**
     * Initializes components
     * @param {class} classDef
     * @param {Element | NodeList | jQuery} els
     * @param {Object} options
     */
    static init(classDef, els, options) {
      var instances = null;
      if (els instanceof Element) {
        instances = new classDef(els, options);
      } else if (!!els && (els.jquery || els.cash || els instanceof NodeList)) {
        var instancesArr = [];
        for (var i = 0; i < els.length; i++) {
          instancesArr.push(new classDef(els[i], options));
        }
        instances = instancesArr;
      }
      return instances;
    }
  }

/**
 * Initialize jQuery wrapper for plugin
 * @param {Class} plugin  javascript class
 * @param {string} pluginName  jQuery plugin name
 * @param {string} classRef  Class reference name
 */
  j1.initializeJqueryWrapper = function (plugin, pluginName, classRef) {
    jQuery.fn[pluginName] = function (methodOrOptions) {
      // Call plugin method if valid method name is passed in
      if (plugin.prototype[methodOrOptions]) {
        var params = Array.prototype.slice.call(arguments, 1);

        // Getter methods
        if (methodOrOptions.slice(0, 3) === 'get') {
          var instance = this.first()[0][classRef];
          return instance[methodOrOptions].apply(instance, params);
        }

        // Void methods
        return this.each(function () {
          var instance = this[classRef];
          instance[methodOrOptions].apply(instance, params);
        });

        // Initialize plugin if options or no argument is passed in
      } else if (typeof methodOrOptions === 'object' || !methodOrOptions) {
        plugin.init(this, arguments[0]);
        return this;
      }

      // Return error if an unrecognized  method name is passed in
      jQuery.error("Method " + methodOrOptions + " does not exist on jQuery." + pluginName);
    };
  };

  /**
   * @class
   *
   */
  class FloatingActionButton extends Component {
    /**
     * Construct FloatingActionButton instance
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    constructor(el, options) {
      super(FloatingActionButton, el, options);
      this.el.M_FloatingActionButton = this;

      /**
       * Options for the fab
       * @member FloatingActionButton#options
       * @prop {Boolean} [direction] - Direction fab menu opens
       * @prop {Boolean} [hoverEnabled=true] - Enable hover vs click
       * @prop {Boolean} [toolbarEnabled=false] - Enable toolbar transition
       */
      this.options = $.extend({}, FloatingActionButton.defaults, options);

      this.isOpen               = false;
      this.$anchor              = this.$el.children('a').first();
      this.$menu                = this.$el.children('ul').first();
      this.$floatingBtns        = this.$el.find('ul .btn-fab-floating');
      this.$floatingBtnsReverse = this.$el.find('ul .btn-fab-floating').reverse();
      this.offsetY = 0;
      this.offsetX = 0;

      this.$el.addClass(`direction-${this.options.direction}`);
      if (this.options.direction === 'top') {
        this.offsetY = 40;
      } else if (this.options.direction === 'right') {
        this.offsetX = -40;
      } else if (this.options.direction === 'bottom') {
        this.offsetY = -40;
      } else {
        this.offsetX = 40;
      }
      this._setupEventHandlers();
    }

    static get defaults() {
      return _defaults;
    }

    static init(els, options) {
      return super.init(this, els, options);
    }

    /**
     * Get Instance
     */
    static getInstance(el) {
      var domElem = !!el.jquery ? el[0] : el;
      return domElem.M_FloatingActionButton;
    }

    /**
     * Teardown component
     */
    destroy() {
      this._removeEventHandlers();
      this.el.M_FloatingActionButton = undefined;
    }

    /**
     * Setup Event Handlers
     */
    _setupEventHandlers() {
      this._handleFABClickBound   = this._handleFABClick.bind(this);
      this._handleOpenBound       = this.open.bind(this);
      this._handleCloseBound      = this.close.bind(this);

      if (this.options.hoverEnabled && !this.options.toolbarEnabled) {
        this.el.addEventListener('mouseenter', this._handleOpenBound);
        this.el.addEventListener('mouseleave', this._handleCloseBound);
      } else {
        this.el.addEventListener('click', this._handleFABClickBound);
      }
    }

    /**
     * Remove Event Handlers
     */
    _removeEventHandlers() {
      if (this.options.hoverEnabled && !this.options.toolbarEnabled) {
        this.el.removeEventListener('mouseenter', this._handleOpenBound);
        this.el.removeEventListener('mouseleave', this._handleCloseBound);
      } else {
        this.el.removeEventListener('click', this._handleFABClickBound);
      }
    }

    /**
     * Handle FAB Click
     */
    _handleFABClick() {
      if (this.isOpen) {
        this.close();
      } else {
        this.open();
      }
    }

    /**
     * Handle Document Click
     * @param {Event} e
     */
    _handleDocumentClick(e) {
      if (!$(e.target).closest(this.$menu).length) {
        this.close();
      }
    }

    /**
     * Open FAB
     */
    open() {
      if (this.isOpen) {
        return;
      }

      if (this.options.toolbarEnabled) {
        this._animateInToolbar();
      } else {
        this._animateInFAB();
      }
      this.isOpen = true;
    }

    /**
     * Close FAB
     */
    close() {
      if (!this.isOpen) {
        return;
      }

      if (this.options.toolbarEnabled) {
        window.removeEventListener('scroll', this._handleCloseBound, true);
        document.body.removeEventListener('click', this._handleDocumentClickBound, true);
        this._animateOutToolbar();
      } else {
        this._animateOutFAB();
      }
      this.isOpen = false;
    }

    /**
     * Classic FAB Menu open
     */
    _animateInFAB() {
      this.$el.addClass('active');

      var time = 0;
      this.$floatingBtnsReverse.each((el) => {
        anim({
          targets: el,
          opacity: 1,
          scale: [0.4, 1],
          translateY: [this.offsetY, 0],
          translateX: [this.offsetX, 0],
          duration: 275,
          delay: time,
          easing: 'easeInOutQuad'
        });
        time += 40;
      });
    }

    /**
     * Classic FAB Menu close
     */
    _animateOutFAB() {
      this.$floatingBtnsReverse.each((el) => {
        anim.remove(el);
        anim({
          targets: el,
          opacity: 0,
          scale: 0.4,
          translateY: this.offsetY,
          translateX: this.offsetX,
          duration: 175,
          easing: 'easeOutQuad',
          complete: () => {
            this.$el.removeClass('active');
          }
        });
      });
    }

    /**
     * Toolbar transition Menu open
     */
    _animateInToolbar() {
      var scaleFactor;
      var windowWidth     = window.innerWidth;
      var windowHeight    = window.innerHeight;
      var btnRect         = this.el.getBoundingClientRect();
      var backdrop        = $('<div class="fam-btn-backdrop"></div>');
      var fabColor        = this.$anchor.css('background-color');

      this.$anchor.append(backdrop);

      this.offsetX    = btnRect.left - windowWidth / 2 + btnRect.width / 2;
      this.offsetY    = windowHeight - btnRect.bottom;
      scaleFactor     = windowWidth / backdrop[0].clientWidth;
      this.btnBottom  = btnRect.bottom;
      this.btnLeft    = btnRect.left;
      this.btnWidth   = btnRect.width;

      // Set initial state
      this.$el.addClass('active');
      this.$el.css({
        'text-align': 'center',
        width: '100%',
        bottom: 0,
        left: 0,
        transform: 'translateX(' + this.offsetX + 'px)',
        transition: 'none'
      });
      this.$anchor.css({
        transform: 'translateY(' + -this.offsetY + 'px)',
        transition: 'none'
      });
      backdrop.css({
        'background-color': fabColor
      });

      setTimeout(() => {
        this.$el.css({
          transform: '',
          transition:
            'transform .2s cubic-bezier(0.550, 0.085, 0.680, 0.530), background-color 0s linear .2s'
        });
        this.$anchor.css({
          overflow: 'visible',
          transform: '',
          transition: 'transform .2s'
        });

        setTimeout(() => {
          this.$el.css({
            overflow: 'hidden',
            'background-color': fabColor
          });
          backdrop.css({
            transform: 'scale(' + scaleFactor + ')',
            transition: 'transform .2s cubic-bezier(0.550, 0.055, 0.675, 0.190)'
          });
          this.$menu
            .children('li')
            .children('a')
            .css({
              opacity: 1
            });

          // Scroll to close
          this._handleDocumentClickBound = this._handleDocumentClick.bind(this);
          window.addEventListener('scroll', this._handleCloseBound, true);
          document.body.addEventListener('click', this._handleDocumentClickBound, true);
        }, 100);
      }, 0);
    }

    /**
     * Toolbar transition Menu close
     */
    _animateOutToolbar() {
      var windowWidth   = window.innerWidth;
      var windowHeight  = window.innerHeight;
      var backdrop      = this.$el.find('.fam-btn-backdrop');
      var fabColor      = this.$anchor.css('background-color');

      this.offsetX      = this.btnLeft - windowWidth / 2 + this.btnWidth / 2;
      this.offsetY      = windowHeight - this.btnBottom;

      // Hide backdrop
      this.$el.removeClass('active');
      this.$el.css({
        'background-color': 'transparent',
        transition: 'none'
      });
      this.$anchor.css({
        transition: 'none'
      });
      backdrop.css({
        transform: 'scale(0)',
        'background-color': fabColor
      });
      this.$menu
        .children('li')
        .children('a')
        .css({
          opacity: ''
        });

      setTimeout(() => {
        backdrop.remove();

        // Set initial state.
        this.$el.css({
          'text-align': '',
          width: '',
          bottom: '',
          left: '',
          overflow: '',
          'background-color': '',
          transform: 'translate3d(' + -this.offsetX + 'px,0,0)'
        });
        this.$anchor.css({
          overflow: '',
          transform: 'translate3d(0,' + this.offsetY + 'px,0)'
        });

        setTimeout(() => {
          this.$el.css({
            transform: 'translate3d(0,0,0)',
            transition: 'transform .2s'
          });
          this.$anchor.css({
            transform: 'translate3d(0,0,0)',
            transition: 'transform .2s cubic-bezier(0.550, 0.055, 0.675, 0.190)'
          });
        }, 20);
      }, 200);
    }
  }

  // jadams, 2020-10-10: moved to j1 name space
  //
  // M.FloatingActionButton = FloatingActionButton;
  j1.fab = FloatingActionButton;

  // jadams, 2020-10-10: check how to transform to jQuery
  //

  // Check for jQuery
  //
  j1.jQueryLoaded = !!window.jQuery;

  if (j1.jQueryLoaded) {
    j1.initializeJqueryWrapper (
      FloatingActionButton,
      'floatingActionButton',
      'M_FloatingActionButton'
    );
  }

  //  jadams, 2020-10-10: TODO: check if anime could be a replacement
  //  for (huge) animate.css
// })($, j1.anime);
})(cash, j1.anime);
