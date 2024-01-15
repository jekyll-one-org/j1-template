/*
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/modules/dropdowns/js/dropdowns.js
 # MODIFIED DROPDOWN JS from project Materialize
 # Provides JS Core funtions for the J1 DROPDOWNS Module
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
    */
   class Dropdowns extends Component {
     constructor(el, options) {
       super(Dropdowns, el, options);

       this.el.M_Dropdown = this;
       Dropdowns._dropdowns.push(this);

       this.id = this.getIdFromTrigger(el);
       this.dropdownEl = document.getElementById(this.id);
       this.$dropdownEl = $(this.dropdownEl);

       /**
        * Options for the dropdown
        * @member Dropdowns#options
        * @prop {String} [alignment='left'] - Edge which the dropdown is aligned to
        * @prop {Boolean} [autoFocus=true] - Automatically focus dropdown el for keyboard
        * @prop {Boolean} [constrainWidth=true] - Constrain width to width of the button
        * @prop {Element} container - Container element to attach dropdown to (optional)
        * @prop {Boolean} [coverTrigger=true] - Place dropdown over trigger
        * @prop {Boolean} [closeOnClick=true] - Close on click of dropdown item
        * @prop {Boolean} [hover=false] - Open dropdown on hover
        * @prop {Number} [inDuration=150] - Duration of open animation in ms
        * @prop {Number} [outDuration=250] - Duration of close animation in ms
        * @prop {Function} onOpenStart - Function called when dropdown starts opening
        * @prop {Function} onOpenEnd - Function called when dropdown finishes opening
        * @prop {Function} onCloseStart - Function called when dropdown starts closing
        * @prop {Function} onCloseEnd - Function called when dropdown finishes closing
        */
       this.options = $.extend({}, Dropdowns.defaults, options);

       /**
        * Describes open/close state of dropdown
        * @type {Boolean}
        */
       this.isOpen = false;

       /**
        * Describes if dropdown content is scrollable
        * @type {Boolean}
        */
       this.isScrollable = false;

       /**
        * Describes if touch moving on dropdown content
        * @type {Boolean}
        */
       this.isTouchMoving = false;

       this.focusedIndex = -1;
       this.filterQuery = [];

       this.keys = {
        TAB: 9,
        ENTER: 13,
        ESC: 27,
        ARROW_UP: 38,
        ARROW_DOWN: 40
      };

       // Move dropdown-content after dropdown-trigger
       if (!!this.options.container) {
         $(this.options.container).append(this.dropdownEl);
       } else {
         this.$el.after(this.dropdownEl);
       }

       this._makeDropdownFocusable();
       this._resetFilterQueryBound = this._resetFilterQuery.bind(this);
       this._handleDocumentClickBound = this._handleDocumentClick.bind(this);
       this._handleDocumentTouchmoveBound = this._handleDocumentTouchmove.bind(this);
       this._handleDropdownClickBound = this._handleDropdownClick.bind(this);
       this._handleDropdownKeydownBound = this._handleDropdownKeydown.bind(this);
       this._handleTriggerKeydownBound = this._handleTriggerKeydown.bind(this);
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
       let domElem = !!el.jquery ? el[0] : el;
       return domElem.M_Dropdown;
     }

     /**
      * Gets id of component from a trigger
      * @param {Element} trigger  trigger
      * @returns {string}
      */
     getIdFromTrigger (trigger) {
       var id = trigger.getAttribute('data-target');
       if (!id) {
         id = trigger.getAttribute('href');
         if (id) {
           id = id.slice(1);
         } else {
           id = '';
         }
       }
       return id;
     }

     // ---------------------------------------------------------------------------
     // executeFunctionByName()
     // execute a function by NAME (functionName) in a browser context
     // (e.g. window) the function is published
     // ---------------------------------------------------------------------------
     executeFunctionByName (functionName, context /*, args */) {
       var args = Array.prototype.slice.call(arguments, 2);
       var namespaces = functionName.split('.');
       var func = namespaces.pop();
       for(var i = 0; i < namespaces.length; i++) {
         context = context[namespaces[i]];
       }
       return context[func].apply(context, args);
     }

     checkPossibleAlignments (el, container, bounding, offset) {
       var canAlign = {
         top: true,
         right: true,
         bottom: true,
         left: true,
         spaceOnTop: null,
         spaceOnRight: null,
         spaceOnBottom: null,
         spaceOnLeft: null
       };

       var containerAllowsOverflow = getComputedStyle(container).overflow === 'visible';
       var containerRect = container.getBoundingClientRect();
       var containerHeight = Math.min(containerRect.height, window.innerHeight);
       var containerWidth = Math.min(containerRect.width, window.innerWidth);
       var elOffsetRect = el.getBoundingClientRect();

       var scrollLeft = container.scrollLeft;
       var scrollTop = container.scrollTop;

       var scrolledX = bounding.left - scrollLeft;
       var scrolledYTopEdge = bounding.top - scrollTop;
       var scrolledYBottomEdge = bounding.top + elOffsetRect.height - scrollTop;

       // Check for container and viewport for left
       canAlign.spaceOnRight = !containerAllowsOverflow ? containerWidth - (scrolledX + bounding.width) : window.innerWidth - (elOffsetRect.left + bounding.width);
       if (canAlign.spaceOnRight < 0) {
         canAlign.left = false;
       }

       // Check for container and viewport for Right
       canAlign.spaceOnLeft = !containerAllowsOverflow ? scrolledX - bounding.width + elOffsetRect.width : elOffsetRect.right - bounding.width;
       if (canAlign.spaceOnLeft < 0) {
         canAlign.right = false;
       }

       // Check for container and viewport for Top
       canAlign.spaceOnBottom = !containerAllowsOverflow ? containerHeight - (scrolledYTopEdge + bounding.height + offset) : window.innerHeight - (elOffsetRect.top + bounding.height + offset);
       if (canAlign.spaceOnBottom < 0) {
         canAlign.top = false;
       }

       // Check for container and viewport for Bottom
       canAlign.spaceOnTop = !containerAllowsOverflow ? scrolledYBottomEdge - (bounding.height - offset) : elOffsetRect.bottom - (bounding.height + offset);
       if (canAlign.spaceOnTop < 0) {
         canAlign.bottom = false;
       }

       return canAlign;
     }

     /**
      * Teardown component
      */
     destroy() {
       this._resetDropdownStyles();
       this._removeEventHandlers();
       Dropdowns._dropdowns.splice(Dropdowns._dropdowns.indexOf(this), 1);
       this.el.M_Dropdown = undefined;
     }

     /**
      * Setup Event Handlers
      */
     _setupEventHandlers() {
       // Trigger keydown handler
       this.el.addEventListener('keydown', this._handleTriggerKeydownBound);

       // Item click handler
       this.dropdownEl.addEventListener('click', this._handleDropdownClickBound);

       // Hover event handlers
       if (this.options.hover) {
         this._handleMouseEnterBound = this._handleMouseEnter.bind(this);
         this.el.addEventListener('mouseenter', this._handleMouseEnterBound);
         this._handleMouseLeaveBound = this._handleMouseLeave.bind(this);
         this.el.addEventListener('mouseleave', this._handleMouseLeaveBound);
         this.dropdownEl.addEventListener('mouseleave', this._handleMouseLeaveBound);

         // Click event handlers
       } else {
         this._handleClickBound = this._handleClick.bind(this);
         this.el.addEventListener('click', this._handleClickBound);
       }
     }

     /**
      * Remove Event Handlers
      */
     _removeEventHandlers() {
       this.el.removeEventListener('keydown', this._handleTriggerKeydownBound);
       this.dropdownEl.removeEventListener('click', this._handleDropdownClickBound);

       if (this.options.hover) {
         this.el.removeEventListener('mouseenter', this._handleMouseEnterBound);
         this.el.removeEventListener('mouseleave', this._handleMouseLeaveBound);
         this.dropdownEl.removeEventListener('mouseleave', this._handleMouseLeaveBound);
       } else {
         this.el.removeEventListener('click', this._handleClickBound);
       }
     }

     _setupTemporaryEventHandlers() {
       // Use capture phase event handler to prevent click
       document.body.addEventListener('click', this._handleDocumentClickBound, true);
       document.body.addEventListener('touchend', this._handleDocumentClickBound);
       document.body.addEventListener('touchmove', this._handleDocumentTouchmoveBound);
       this.dropdownEl.addEventListener('keydown', this._handleDropdownKeydownBound);
     }

     _removeTemporaryEventHandlers() {
       // Use capture phase event handler to prevent click
       document.body.removeEventListener('click', this._handleDocumentClickBound, true);
       document.body.removeEventListener('touchend', this._handleDocumentClickBound);
       document.body.removeEventListener('touchmove', this._handleDocumentTouchmoveBound);
       this.dropdownEl.removeEventListener('keydown', this._handleDropdownKeydownBound);
     }

     _handleClick(e) {
       e.preventDefault();
       this.open();
     }

     _handleMouseEnter() {
       this.open();
     }

     _handleMouseLeave(e) {
       let toEl = e.toElement || e.relatedTarget;
       let leaveToDropdownContent = !!$(toEl).closest('.dropdown-content').length;
       let leaveToActiveDropdownTrigger = false;

       let $closestTrigger = $(toEl).closest('.dropdowns');
       if (
         $closestTrigger.length &&
         !!$closestTrigger[0].M_Dropdown &&
         $closestTrigger[0].M_Dropdown.isOpen
       ) {
         leaveToActiveDropdownTrigger = true;
       }

       // Close hover dropdown if mouse did not leave to either active dropdown-trigger or dropdown-content
       if (!leaveToActiveDropdownTrigger && !leaveToDropdownContent) {
         this.close();
       }
     }

     _handleDocumentClick(e) {
       let $target = $(e.target);
       if (
         this.options.closeOnClick &&
         $target.closest('.dropdown-content').length &&
         !this.isTouchMoving
       ) {
         // isTouchMoving to check if scrolling on mobile.
         setTimeout(() => {
           this.close();
         }, 0);
       } else if (
         $target.closest('.dropdowns').length ||
         !$target.closest('.dropdown-content').length
       ) {
         setTimeout(() => {
           this.close();
         }, 0);
       }
       this.isTouchMoving = false;
     }

     _handleTriggerKeydown(e) {
       // ARROW DOWN OR ENTER WHEN SELECT IS CLOSED - open Dropdowns
       if ((e.which === this.keys.ARROW_DOWN || e.which === this.keys.ENTER) && !this.isOpen) {
         e.preventDefault();
         this.open();
       }
     }

     /**
      * Handle Document Touchmove
      * @param {Event} e
      */
     _handleDocumentTouchmove(e) {
       let $target = $(e.target);
       if ($target.closest('.dropdown-content').length) {
         this.isTouchMoving = true;
       }
     }

     /**
      * Handle Dropdowns Click
      * @param {Event} e
      */
     _handleDropdownClick(e) {

       // onItemClick callback (by reference)
       // if (typeof this.options.onItemClick === 'function') {
       //   let itemEl = $(e.target).closest('li')[0];
       //   this.options.onItemClick.call(this, itemEl);
       // }

       // onItemClick callback (by name)
       if (this.options.onItemClick !== 'false') {
         var _this  = this;
         // var itemEl = $(e.target).closest('li')[0];
         this.executeFunctionByName(this.options.onItemClick, window, _this);
       }
     }

     /**
      * Handle Dropdowns Keydown
      * @param {Event} e
      */
     _handleDropdownKeydown(e) {
       if (e.which === this.keys.TAB) {
         e.preventDefault();
         this.close();

         // Navigate down dropdown list
       } else if ((e.which === this.keys.ARROW_DOWN || e.which === this.keys.ARROW_UP) && this.isOpen) {
         e.preventDefault();
         let direction = e.which === this.keys.ARROW_DOWN ? 1 : -1;
         let newFocusedIndex = this.focusedIndex;
         let foundNewIndex = false;
         do {
           newFocusedIndex = newFocusedIndex + direction;

           if (
             !!this.dropdownEl.children[newFocusedIndex] &&
             this.dropdownEl.children[newFocusedIndex].tabIndex !== -1
           ) {
             foundNewIndex = true;
             break;
           }
         } while (newFocusedIndex < this.dropdownEl.children.length && newFocusedIndex >= 0);

         if (foundNewIndex) {
           this.focusedIndex = newFocusedIndex;
           this._focusFocusedItem();
         }

         // ENTER selects choice on focused item
       } else if (e.which === this.keys.ENTER && this.isOpen) {
         // Search for <a> and <button>
         let focusedElement = this.dropdownEl.children[this.focusedIndex];
         let $activatableElement = $(focusedElement)
           .find('a, button')
           .first();

         // Click a or button tag if exists, otherwise click li tag
         if (!!$activatableElement.length) {
           $activatableElement[0].click();
         } else if (!!focusedElement) {
           focusedElement.click();
         }

         // Close dropdown on ESC
       } else if (e.which === this.keys.ESC && this.isOpen) {
         e.preventDefault();
         this.close();
       }

       // CASE WHEN USER TYPE LETTERS
       let letter = String.fromCharCode(e.which).toLowerCase(),
         nonLetters = [9, 13, 27, 38, 40];
       if (letter && nonLetters.indexOf(e.which) === -1) {
         this.filterQuery.push(letter);

         let string = this.filterQuery.join(''),
           newOptionEl = $(this.dropdownEl)
             .find('li')
             .filter((el) => {
               return (
                 $(el)
                   .text()
                   .toLowerCase()
                   .indexOf(string) === 0
               );
             })[0];

         if (newOptionEl) {
           this.focusedIndex = $(newOptionEl).index();
           this._focusFocusedItem();
         }
       }

       this.filterTimeout = setTimeout(this._resetFilterQueryBound, 1000);
     }

     /**
      * Setup dropdown
      */
     _resetFilterQuery() {
       this.filterQuery = [];
     }

     _resetDropdownStyles() {
       this.$dropdownEl.css({
         display: '',
         width: '',
         height: '',
         left: '',
         top: '',
         'transform-origin': '',
         transform: '',
         opacity: ''
       });
     }

     _makeDropdownFocusable() {
       // Needed for arrow key navigation
       this.dropdownEl.tabIndex = 0;

       // Only set tabindex if it hasn't been set by user
       $(this.dropdownEl)
         .children()
         .each(function(el) {
           if (!el.getAttribute('tabindex')) {
             el.setAttribute('tabindex', 0);
           }
         });
     }

     _focusFocusedItem() {
       if (
         this.focusedIndex >= 0 &&
         this.focusedIndex < this.dropdownEl.children.length &&
         this.options.autoFocus
       ) {
         this.dropdownEl.children[this.focusedIndex].focus();
       }
     }

     _getDropdownPosition() {
       let offsetParentBRect = this.el.offsetParent.getBoundingClientRect();
       let triggerBRect = this.el.getBoundingClientRect();
       let dropdownBRect = this.dropdownEl.getBoundingClientRect();

       let idealHeight = dropdownBRect.height;
       let idealWidth = dropdownBRect.width;
       let idealXPos = triggerBRect.left - dropdownBRect.left;
       let idealYPos = triggerBRect.top - dropdownBRect.top;

       let dropdownBounds = {
         left: idealXPos,
         top: idealYPos,
         height: idealHeight,
         width: idealWidth
       };

       // Countainer here will be closest ancestor with overflow: hidden
       let closestOverflowParent = !!this.dropdownEl.offsetParent
         ? this.dropdownEl.offsetParent
         : this.dropdownEl.parentNode;

       let alignments = this.checkPossibleAlignments(
         this.el,
         closestOverflowParent,
         dropdownBounds,
         this.options.coverTrigger ? 0 : triggerBRect.height
       );

       let verticalAlignment = 'top';
       let horizontalAlignment = this.options.alignment;
       idealYPos += this.options.coverTrigger ? 0 : triggerBRect.height;

       // Reset isScrollable
       this.isScrollable = false;

       if (!alignments.top) {
         if (alignments.bottom) {
           verticalAlignment = 'bottom';
         } else {
           this.isScrollable = true;

           // Determine which side has most space and cutoff at correct height
           if (alignments.spaceOnTop > alignments.spaceOnBottom) {
             verticalAlignment = 'bottom';
             idealHeight += alignments.spaceOnTop;
             idealYPos -= alignments.spaceOnTop;
           } else {
             idealHeight += alignments.spaceOnBottom;
           }
         }
       }

       // If preferred horizontal alignment is possible
       if (!alignments[horizontalAlignment]) {
         let oppositeAlignment = horizontalAlignment === 'left' ? 'right' : 'left';
         if (alignments[oppositeAlignment]) {
           horizontalAlignment = oppositeAlignment;
         } else {
           // Determine which side has most space and cutoff at correct height
           if (alignments.spaceOnLeft > alignments.spaceOnRight) {
             horizontalAlignment = 'right';
             idealWidth += alignments.spaceOnLeft;
             idealXPos -= alignments.spaceOnLeft;
           } else {
             horizontalAlignment = 'left';
             idealWidth += alignments.spaceOnRight;
           }
         }
       }

       if (verticalAlignment === 'bottom') {
         idealYPos =
           idealYPos - dropdownBRect.height + (this.options.coverTrigger ? triggerBRect.height : 0);
       }
       if (horizontalAlignment === 'right') {
         idealXPos = idealXPos - dropdownBRect.width + triggerBRect.width;
       }
       return {
         x: idealXPos,
         y: idealYPos,
         verticalAlignment: verticalAlignment,
         horizontalAlignment: horizontalAlignment,
         height: idealHeight,
         width: idealWidth
       };
     }

     /**
      * Animate in dropdown
      */
     _animateIn() {
       anim.remove(this.dropdownEl);
       anim({
         targets: this.dropdownEl,
         opacity: {
           value: [0, 1],
           easing: 'easeOutQuad'
         },
         scaleX: [0.3, 1],
         scaleY: [0.3, 1],
         duration: this.options.inDuration,
         easing: 'easeOutQuint',
         complete: (anim) => {
           if (this.options.autoFocus) {
             this.dropdownEl.focus();
           }

           // onOpenEnd callback (by reference)
           if (typeof this.options.onOpenEnd === 'function') {
             this.options.onOpenEnd.call(this, this.el);
           }
         }
       });
     }

     /**
      * Animate out dropdown
      */
     _animateOut() {
       anim.remove(this.dropdownEl);
       anim({
         targets: this.dropdownEl,
         opacity: {
           value: 0,
           easing: 'easeOutQuint'
         },
         scaleX: 0.3,
         scaleY: 0.3,
         duration: this.options.outDuration,
         easing: 'easeOutQuint',
         complete: (anim) => {
           this._resetDropdownStyles();

           // onCloseEnd callback (by reference)
           if (typeof this.options.onCloseEnd === 'function') {
             this.options.onCloseEnd.call(this, this.el);
           }
         }
       });
     }

     /**
      * Place dropdown
      */
     _placeDropdown() {
       // Set width before calculating positionInfo
       let idealWidth = this.options.constrainWidth
         ? this.el.getBoundingClientRect().width
         : this.dropdownEl.getBoundingClientRect().width;
       this.dropdownEl.style.width = idealWidth + 'px';

       let positionInfo = this._getDropdownPosition();
       this.dropdownEl.style.left = positionInfo.x + 'px';
       this.dropdownEl.style.top = positionInfo.y + 'px';
       this.dropdownEl.style.height = positionInfo.height + 'px';
       this.dropdownEl.style.width = positionInfo.width + 'px';
       this.dropdownEl.style.transformOrigin = `${
         positionInfo.horizontalAlignment === 'left' ? '0' : '100%'
       } ${positionInfo.verticalAlignment === 'top' ? '0' : '100%'}`;
     }

     /**
      * Open Dropdowns
      */
     open() {
       if (this.isOpen) {
         return;
       }
       this.isOpen = true;

       // onOpen callback (by reference)
       // if (typeof this.options.onOpen === 'function') {
       //   this.options.onOpen.call(this, this.el);
       // }

       var _this      = this;
       var listItems  = '#' + _this.id + " li";
       var menuItems  = document.querySelectorAll(listItems);

       // Loop through each <li> element
       for (var i=0; i < menuItems.length; i++) {
         // adding a event listener, mark selected menuItem by class active
          menuItems[i].addEventListener('click', function(event) {
            event.preventDefault();
            for(var i=0; i < menuItems.length; i++) {
              if (menuItems[i].classList.contains('active')) {
                  menuItems[i].classList.remove('active');
              }
            }
            // add `active` to current clicked element
            this.classList.add('active');
          }, false);
       }

       // onOpen callback (ny name)
       var _this = this;
       if (this.options.onOpen) {
         this.executeFunctionByName(this.options.onOpen, window, _this);
       }

       // Reset styles
       this._resetDropdownStyles();
       this.dropdownEl.style.display = 'block';

       this._placeDropdown();
       this._animateIn();
       this._setupTemporaryEventHandlers();
     }

     /**
      * Close Dropdowns
      */
     close() {
       if (!this.isOpen) {
         return;
       }
       this.isOpen = false;
       this.focusedIndex = -1;

       // onClose callback (by reference)
       // if (typeof this.options.onClose === 'function') {
       //   this.options.onCloseStart.call(this, this.el);
       // }

       // onClose callback (by name)
       var _this = this;
       if (this.options.onClose) {
         this.executeFunctionByName(this.options.onClose, window, _this);
       }

       this._animateOut();
       this._removeTemporaryEventHandlers();

       if (this.options.autoFocus) {
         this.el.focus();
       }
     }

     /**
      * Recalculate dimensions
      */
     recalculateDimensions() {
       if (this.isOpen) {
         this.$dropdownEl.css({
           width: '',
           height: '',
           left: '',
           top: '',
           'transform-origin': ''
         });
         this._placeDropdown();
       }
     }
   }

   /**
    * @static
    * @memberof Dropdowns
    */
   Dropdowns._dropdowns = [];

  // jadams, 2020-10-10: moved to j1 name space
  //
  // M.FloatingActionButton = FloatingActionButton;
  j1.dropdowns = Dropdowns;

  // jadams, 2020-10-10: check how to transform to jQuery
  //

  // Check for jQuery
  //
  j1.jQueryLoaded = !!window.jQuery;

  if (j1.jQueryLoaded) {
    j1.initializeJqueryWrapper (
      Dropdowns,
      'dropdown',
      'M_Dropdown'
    );
  }

  //  jadams, 2020-10-10: TODO: check if anime could be a replacement
  //  for (huge) animate.css
// })($, j1.anime);
})(cash, j1.anime);
