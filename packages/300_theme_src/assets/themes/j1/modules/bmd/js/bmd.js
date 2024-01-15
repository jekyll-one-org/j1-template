/*
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/modules/bmd/js/bmd.js
 # Based on BootstrapMateialDesion (BMD) version 4.1.3 (BS@4)
 # BS@5 implementation for J1 Theme.
 #
 # Product/Info:
 # https://jekyll.one
 # https://github.com/mdbootstrap/bootstrap-material-design/tree/4.1.3
 #
 # Copyright (C) 2023, 2024 Juergen Adams
 # Copyright (C) 2015 Federico Zivolo and contributors
 #
 # J1 Template is licensed under the MIT License.
 # See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE.md
 # BootstrapMaterialDesign is licensed under the MIT License.
 # See: https://github.com/mdbootstrap/bootstrap-material-design/blob/4.1.3/LICENSE.md
 # -----------------------------------------------------------------------------
*/

// -----------------------------------------------------------------------------
// ESLint shimming
// -----------------------------------------------------------------------------
/* eslint indent: "off"                                                       */
// -----------------------------------------------------------------------------

(function (factory) {
  typeof define === 'function' && define.amd ? define(factory) :
  factory();
}((function () { 'use strict';

  function _inheritsLoose(subClass, superClass) {
    subClass.prototype = Object.create(superClass.prototype);
    subClass.prototype.constructor = subClass;
    subClass.__proto__ = superClass;
  }

  var Util = function () {
    /**
     * ------------------------------------------------------------------------
     * Private TransitionEnd Helpers
     * ------------------------------------------------------------------------
     */
    var transitionEnd = false;
    var _transitionEndSelector = "";
    var TransitionEndEvent = {
      WebkitTransition: "webkitTransitionEnd",
      MozTransition: "transitionend",
      OTransition: "oTransitionEnd otransitionend",
      transition: "transitionend"
    };

    function transitionEndTest() {
      if (window.QUnit) {
        return false;
      }

      var el = document.createElement("bmd");

      for (var name in TransitionEndEvent) {
        if (el.style[name] !== undefined) {
          return TransitionEndEvent[name]; // { end: TransitionEndEvent[name] }
        }
      }

      return false;
    }

    function setTransitionEndSupport() {
      transitionEnd = transitionEndTest(); // generate a concatenated transition end event selector

      for (var name in TransitionEndEvent) {
        _transitionEndSelector += " " + TransitionEndEvent[name];
      }
    }
    /**
     * --------------------------------------------------------------------------
     * Public Util Api
     * --------------------------------------------------------------------------
     */


    var Util = {
      transitionEndSupported: function transitionEndSupported() {
        return transitionEnd;
      },
      transitionEndSelector: function transitionEndSelector() {
        return _transitionEndSelector;
      },
      isChar: function isChar(event) {
        if (typeof event.which === "undefined") {
          return true;
        } else if (typeof event.which === "number" && event.which > 0) {
          return !event.ctrlKey && !event.metaKey && !event.altKey && event.which !== 8 && // backspace
          event.which !== 9 && // tab
          event.which !== 13 && // enter
          event.which !== 16 && // shift
          event.which !== 17 && // ctrl
          event.which !== 20 && // caps lock
          event.which !== 27 // escape
          ;
        }

        return false;
      },
      assert: function assert($element, invalidTest, message) {
        if (invalidTest) {
          if (!$element === undefined) {
            $element.css("border", "1px solid red");
          }

          console.error(message, $element); // eslint-disable-line no-console

          throw message;
        }
      },
      describe: function describe($element) {
        if ($element === undefined) {
          return "undefined";
        } else if ($element.length === 0) {
          return "(no matching elements)";
        }

        return $element[0].outerHTML.split(">")[0] + ">";
      }
    };
    setTransitionEndSupport();
    return Util;
  }(jQuery);

  var Base = function ($) {
    var ClassName = {
      BMD_FORM_GROUP: "bmd-form-group",
      IS_FILLED: "is-filled",
      IS_FOCUSED: "is-focused"
    };
    var Selector = {
      BMD_FORM_GROUP: "." + ClassName.BMD_FORM_GROUP
    };
    var Default = {};
    /**
     * ------------------------------------------------------------------------
     * Class Definition
     * ------------------------------------------------------------------------
     */

    var Base =
    /*#__PURE__*/
    function () {
      /**
       *
       * @param element
       * @param config
       * @param properties - anything that needs to be set as this[key] = value.  Works around the need to call `super` before using `this`
       */
      function Base($element, config, properties) {
        if (properties === void 0) {
          properties = {};
        }

        this.$element = $element;
        this.config = $.extend(true, {}, Default, config); // set properties for use in the constructor initialization

        for (var key in properties) {
          this[key] = properties[key];
        }
      }

      var _proto = Base.prototype;

      _proto.dispose = function dispose(dataKey) {
        this.$element.data(dataKey, null);
        this.$element = null;
        this.config = null;
      } // ------------------------------------------------------------------------
      // protected
      ;

      _proto.addFormGroupFocus = function addFormGroupFocus() {
        if (!this.$element.prop("disabled")) {
          this.$bmdFormGroup.addClass(ClassName.IS_FOCUSED);
        }
      };

      _proto.removeFormGroupFocus = function removeFormGroupFocus() {
        this.$bmdFormGroup.removeClass(ClassName.IS_FOCUSED);
      };

      _proto.removeIsFilled = function removeIsFilled() {
        this.$bmdFormGroup.removeClass(ClassName.IS_FILLED);
      };

      _proto.addIsFilled = function addIsFilled() {
        this.$bmdFormGroup.addClass(ClassName.IS_FILLED);
      } // Find bmd-form-group
      ;

      _proto.findMdbFormGroup = function findMdbFormGroup(raiseError) {
        if (raiseError === void 0) {
          raiseError = true;
        }

        var mfg = this.$element.closest(Selector.BMD_FORM_GROUP);

        if (mfg.length === 0 && raiseError) {
          $.error("Failed to find " + Selector.BMD_FORM_GROUP + " for " + Util.describe(this.$element));
        }

        return mfg;
      } // ------------------------------------------------------------------------
      // private
      // ------------------------------------------------------------------------
      // static
      ;

      return Base;
    }();

    return Base;
  }(jQuery);

  var BaseInput = function ($) {
    var ClassName = {
      FORM_GROUP: "form-group",
      BMD_FORM_GROUP: "bmd-form-group",
      BMD_LABEL: "bmd-label",
      BMD_LABEL_STATIC: "bmd-label-static",
      BMD_LABEL_PLACEHOLDER: "bmd-label-placeholder",
      BMD_LABEL_FLOATING: "bmd-label-floating",
      HAS_DANGER: "has-danger",
      IS_FILLED: "is-filled",
      IS_FOCUSED: "is-focused",
      INPUT_GROUP: "input-group"
    };
    var Selector = {
      FORM_GROUP: "." + ClassName.FORM_GROUP,
      BMD_FORM_GROUP: "." + ClassName.BMD_FORM_GROUP,
      BMD_LABEL_WILDCARD: "label[class^='" + ClassName.BMD_LABEL + "'], label[class*=' " + ClassName.BMD_LABEL + "']" // match any label variant if specified

    };
    var Default = {
      validate: false,
      formGroup: {
        required: false
      },
      bmdFormGroup: {
        template: "<span class='" + ClassName.BMD_FORM_GROUP + "'></span>",
        create: true,
        // create a wrapper if form-group not found
        required: true // not recommended to turn this off, only used for inline components

      },
      label: {
        required: false,
        // Prioritized find order for resolving the label to be used as an bmd-label if not specified in the markup
        //  - a function(thisComponent); or
        //  - a string selector used like $bmdFormGroup.find(selector)
        //
        // Note this only runs if $bmdFormGroup.find(Selector.BMD_LABEL_WILDCARD) fails to find a label (as authored in the markup)
        //
        selectors: [".form-control-label", // in the case of horizontal or inline forms, this will be marked
        "> label" // usual case for text inputs, first child.  Deeper would find toggle labels so don't do that.
        ],
        className: ClassName.BMD_LABEL_STATIC
      },
      requiredClasses: [],
      invalidComponentMatches: [],
      convertInputSizeVariations: true
    };
    var FormControlSizeMarkers = {
      "form-control-lg": "bmd-form-group-lg",
      "form-control-sm": "bmd-form-group-sm"
    };
    /**
     * ------------------------------------------------------------------------
     * Class Definition
     * ------------------------------------------------------------------------
     */

    var BaseInput =
    /*#__PURE__*/
    function (_Base) {
      _inheritsLoose(BaseInput, _Base);

      /**
       *
       * @param element
       * @param config
       * @param properties - anything that needs to be set as this[key] = value.  Works around the need to call `super` before using `this`
       */
      function BaseInput($element, config, properties) {
        var _this;

        if (properties === void 0) {
          properties = {};
        }

        _this = _Base.call(this, $element, $.extend(true, {}, Default, config), properties) || this; // Enforce no overlap between components to prevent side effects

        _this._rejectInvalidComponentMatches(); // Enforce expected structure (if any)


        _this.rejectWithoutRequiredStructure(); // Enforce required classes for a consistent rendering


        _this._rejectWithoutRequiredClasses(); // Resolve the form-group first, it will be used for bmd-form-group if possible
        //   note: different components have different rules


        _this.$formGroup = _this.findFormGroup(_this.config.formGroup.required); // Will add bmd-form-group to form-group or create an bmd-form-group
        //  Performance Note: for those forms that are really performance driven, create the markup with the .bmd-form-group to avoid
        //    rendering changes once added.

        _this.$bmdFormGroup = _this.resolveMdbFormGroup(); // Resolve and mark the bmdLabel if necessary as defined by the config

        _this.$bmdLabel = _this.resolveMdbLabel(); // Signal to the bmd-form-group that a form-control-* variation is being used

        _this.resolveMdbFormGroupSizing();

        _this.addFocusListener();

        _this.addChangeListener();

        if (_this.$element.val() != "") {
          _this.addIsFilled();
        }

        return _this;
      }

      var _proto = BaseInput.prototype;

      _proto.dispose = function dispose(dataKey) {
        _Base.prototype.dispose.call(this, dataKey);

        this.$bmdFormGroup = null;
        this.$formGroup = null;
      } // ------------------------------------------------------------------------
      // protected
      ;

      _proto.rejectWithoutRequiredStructure = function rejectWithoutRequiredStructure() {// implement
      };

      _proto.addFocusListener = function addFocusListener() {
        var _this2 = this;

        this.$element.on("focus", function () {
          _this2.addFormGroupFocus();
        }).on("blur", function () {
          _this2.removeFormGroupFocus();
        });
      };

      _proto.addChangeListener = function addChangeListener() {
        var _this3 = this;

        this.$element.on("keydown paste", function (event) {
          if (Util.isChar(event)) {
            _this3.addIsFilled();
          }
        }).on("keyup change", function () {
          // make sure empty is added back when there is a programmatic value change.
          //  NOTE: programmatic changing of value using $.val() must trigger the change event i.e. $.val('x').trigger('change')
          if (_this3.isEmpty()) {
            _this3.removeIsFilled();
          } else {
            _this3.addIsFilled();
          }

          if (_this3.config.validate) {
            // Validation events do not bubble, so they must be attached directly to the text: http://jsfiddle.net/PEpRM/1/
            //  Further, even the bind method is being caught, but since we are already calling #checkValidity here, just alter
            //  the form-group on change.
            //
            // NOTE: I'm not sure we should be intervening regarding validation, this seems better as a README and snippet of code.
            //        BUT, I've left it here for backwards compatibility.
            var isValid = typeof _this3.$element[0].checkValidity === "undefined" || _this3.$element[0].checkValidity();

            if (isValid) {
              _this3.removeHasDanger();
            } else {
              _this3.addHasDanger();
            }
          }
        });
      };

      _proto.addHasDanger = function addHasDanger() {
        this.$bmdFormGroup.addClass(ClassName.HAS_DANGER);
      };

      _proto.removeHasDanger = function removeHasDanger() {
        this.$bmdFormGroup.removeClass(ClassName.HAS_DANGER);
      };

      _proto.isEmpty = function isEmpty() {
        return this.$element.val() === null || this.$element.val() === undefined || this.$element.val() === "";
      } // Will add bmd-form-group to form-group or create a bmd-form-group if necessary
      ;

      _proto.resolveMdbFormGroup = function resolveMdbFormGroup() {
        var mfg = this.findMdbFormGroup(false);

        if (mfg === undefined || mfg.length === 0) {
          if (this.config.bmdFormGroup.create && (this.$formGroup === undefined || this.$formGroup.length === 0)) {
            // If a form-group doesn't exist (not recommended), take a guess and wrap the element (assuming no label).
            //  note: it's possible to make this smarter, but I need to see valid cases before adding any complexity.
            // this may be an input-group, wrap that instead
            if (this.outerElement().parent().hasClass(ClassName.INPUT_GROUP)) {
              this.outerElement().parent().wrap(this.config.bmdFormGroup.template);
            } else {
              this.outerElement().wrap(this.config.bmdFormGroup.template);
            }
          } else {
            // a form-group does exist, add our marker class to it
            this.$formGroup.addClass(ClassName.BMD_FORM_GROUP); // OLD: may want to implement this after all, see how the styling turns out, but using an existing form-group is less manipulation of the dom and therefore preferable
            // A form-group does exist, so add an bmd-form-group wrapping it's internal contents
            //fg.wrapInner(this.config.bmdFormGroup.template)
          }

          mfg = this.findMdbFormGroup(this.config.bmdFormGroup.required);
        }

        return mfg;
      } // Demarcation element (e.g. first child of a form-group)
      //  Subclasses such as file inputs may have different structures
      ;

      _proto.outerElement = function outerElement() {
        return this.$element;
      } // Will add bmd-label to bmd-form-group if not already specified
      ;

      _proto.resolveMdbLabel = function resolveMdbLabel() {
        var label = this.$bmdFormGroup.find(Selector.BMD_LABEL_WILDCARD);

        if (label === undefined || label.length === 0) {
          // we need to find it based on the configured selectors
          label = this.findMdbLabel(this.config.label.required);

          if (label === undefined || label.length === 0) ; else {
            // a candidate label was found, add the configured default class name
            label.addClass(this.config.label.className);
          }
        }

        return label;
      } // Find bmd-label variant based on the config selectors
      ;

      _proto.findMdbLabel = function findMdbLabel(raiseError) {
        if (raiseError === void 0) {
          raiseError = true;
        }

        var label = null; // use the specified selector order

        for (var _iterator = this.config.label.selectors, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
          var _ref;

          if (_isArray) {
            if (_i >= _iterator.length) break;
            _ref = _iterator[_i++];
          } else {
            _i = _iterator.next();
            if (_i.done) break;
            _ref = _i.value;
          }

          var selector = _ref;

          if ($.isFunction(selector)) {
            label = selector(this);
          } else {
            label = this.$bmdFormGroup.find(selector);
          }

          if (label !== undefined && label.length > 0) {
            break;
          }
        }

        if (label.length === 0 && raiseError) {
          $.error("Failed to find " + Selector.BMD_LABEL_WILDCARD + " within form-group for " + Util.describe(this.$element));
        }

        return label;
      } // Find bmd-form-group
      ;

      _proto.findFormGroup = function findFormGroup(raiseError) {
        if (raiseError === void 0) {
          raiseError = true;
        }

        var fg = this.$element.closest(Selector.FORM_GROUP);

        if (fg.length === 0 && raiseError) {
          $.error("Failed to find " + Selector.FORM_GROUP + " for " + Util.describe(this.$element));
        }

        return fg;
      } // Due to the interconnected nature of labels/inputs/help-blocks, signal the bmd-form-group-* size variation based on
      //  a found form-control-* size
      ;

      _proto.resolveMdbFormGroupSizing = function resolveMdbFormGroupSizing() {
        if (!this.config.convertInputSizeVariations) {
          return;
        } // Modification - Change text-sm/lg to form-group-sm/lg instead (preferred standard and simpler css/less variants)


        for (var inputSize in FormControlSizeMarkers) {
          if (this.$element.hasClass(inputSize)) {
            //this.$element.removeClass(inputSize)
            this.$bmdFormGroup.addClass(FormControlSizeMarkers[inputSize]);
          }
        }
      } // ------------------------------------------------------------------------
      // private
      ;

      _proto._rejectInvalidComponentMatches = function _rejectInvalidComponentMatches() {
        for (var _iterator2 = this.config.invalidComponentMatches, _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : _iterator2[Symbol.iterator]();;) {
          var _ref2;

          if (_isArray2) {
            if (_i2 >= _iterator2.length) break;
            _ref2 = _iterator2[_i2++];
          } else {
            _i2 = _iterator2.next();
            if (_i2.done) break;
            _ref2 = _i2.value;
          }

          var otherComponent = _ref2;
          otherComponent.rejectMatch(this.constructor.name, this.$element);
        }
      };

      _proto._rejectWithoutRequiredClasses = function _rejectWithoutRequiredClasses() {
        for (var _iterator3 = this.config.requiredClasses, _isArray3 = Array.isArray(_iterator3), _i3 = 0, _iterator3 = _isArray3 ? _iterator3 : _iterator3[Symbol.iterator]();;) {
          var _ref3;

          if (_isArray3) {
            if (_i3 >= _iterator3.length) break;
            _ref3 = _iterator3[_i3++];
          } else {
            _i3 = _iterator3.next();
            if (_i3.done) break;
            _ref3 = _i3.value;
          }

          var requiredClass = _ref3;

          if (requiredClass.indexOf("||") !== -1) {
            var oneOf = requiredClass.split("||");

            for (var _iterator4 = oneOf, _isArray4 = Array.isArray(_iterator4), _i4 = 0, _iterator4 = _isArray4 ? _iterator4 : _iterator4[Symbol.iterator]();;) {
              var _ref4;

              if (_isArray4) {
                if (_i4 >= _iterator4.length) break;
                _ref4 = _iterator4[_i4++];
              } else {
                _i4 = _iterator4.next();
                if (_i4.done) break;
                _ref4 = _i4.value;
              }

              var _requiredClass = _ref4;

              if (this.$element.hasClass(_requiredClass)) {
                break;
              }
            }
          } else if (this.$element.hasClass(requiredClass)) ;
        }
      } // ------------------------------------------------------------------------
      // static
      ;

      return BaseInput;
    }(Base);

    return BaseInput;
  }(jQuery);

  var BaseSelection = function ($) {
    /**
     * ------------------------------------------------------------------------
     * Constants
     * ------------------------------------------------------------------------
     */
    var Default = {
      label: {
        required: false // Prioritized find order for resolving the label to be used as an bmd-label if not specified in the markup
        //  - a function(thisComponent); or
        //  - a string selector used like $bmdFormGroup.find(selector)
        //
        // Note this only runs if $bmdFormGroup.find(Selector.BMD_LABEL_WILDCARD) fails to find a label (as authored in the markup)
        //
        //selectors: [
        //  `.form-control-label`, // in the case of horizontal or inline forms, this will be marked
        //  `> label` // usual case for text inputs
        //]

      }
    };
    var Selector = {
      LABEL: "label"
    };
    /**
     * ------------------------------------------------------------------------
     * Class Definition
     * ------------------------------------------------------------------------
     */

    var BaseSelection =
    /*#__PURE__*/
    function (_BaseInput) {
      _inheritsLoose(BaseSelection, _BaseInput);

      function BaseSelection($element, config, properties) {
        var _this;

        // properties = {inputType: checkbox, outerClass: checkbox-inline}
        // '.checkbox|switch|radio > label > input[type=checkbox|radio]'
        // '.${this.outerClass} > label > input[type=${this.inputType}]'
        _this = _BaseInput.call(this, $element, $.extend(true, {}, Default, config), properties) || this;

        _this.decorateMarkup();

        return _this;
      } // ------------------------------------------------------------------------
      // protected


      var _proto = BaseSelection.prototype;

      _proto.decorateMarkup = function decorateMarkup() {
        var $decorator = $(this.config.template);
        this.$element.after($decorator); // initialize ripples after decorator has been inserted into DOM

        if (this.config.ripples !== false) {
          $decorator.bmdRipples();
        }
      } // Demarcation element (e.g. first child of a form-group)
      ;

      _proto.outerElement = function outerElement() {
        // .checkbox|switch|radio > label > input[type=checkbox|radio]
        // label.checkbox-inline > input[type=checkbox|radio]
        // .${this.outerClass} > label > input[type=${this.inputType}]
        return this.$element.parent().closest("." + this.outerClass);
      };

      _proto.rejectWithoutRequiredStructure = function rejectWithoutRequiredStructure() {
        // '.checkbox|switch|radio > label > input[type=checkbox|radio]'
        // '.${this.outerClass} > label > input[type=${this.inputType}]'
        Util.assert(this.$element, !this.$element.parent().prop("tagName") === "label", this.constructor.name + "'s " + Util.describe(this.$element) + " parent element should be <label>.");
        Util.assert(this.$element, !this.outerElement().hasClass(this.outerClass), this.constructor.name + "'s " + Util.describe(this.$element) + " outer element should have class " + this.outerClass + ".");
      };

      _proto.addFocusListener = function addFocusListener() {
        var _this2 = this;

        // checkboxes didn't appear to bubble to the document, so we'll bind these directly
        this.$element.closest(Selector.LABEL).hover(function () {
          _this2.addFormGroupFocus();
        }, function () {
          _this2.removeFormGroupFocus();
        });
      };

      _proto.addChangeListener = function addChangeListener() {
        var _this3 = this;

        this.$element.change(function () {
          _this3.$element.blur();
        });
      } // ------------------------------------------------------------------------
      // private
      ;

      return BaseSelection;
    }(BaseInput);

    return BaseSelection;
  }(jQuery);

  var Checkbox = function ($) {
    /**
     * ------------------------------------------------------------------------
     * Constants
     * ------------------------------------------------------------------------
     */
    var NAME = "checkbox";
    var DATA_KEY = "bmd." + NAME;
    var JQUERY_NAME = "bmd" + (NAME.charAt(0).toUpperCase() + NAME.slice(1));
    var JQUERY_NO_CONFLICT = $.fn[JQUERY_NAME];
    var Default = {
      template: "<span class='checkbox-decorator'><span class='check'></span></span>"
    };
    /**
     * ------------------------------------------------------------------------
     * Class Definition
     * ------------------------------------------------------------------------
     */

    var Checkbox =
    /*#__PURE__*/
    function (_BaseSelection) {
      _inheritsLoose(Checkbox, _BaseSelection);

      function Checkbox($element, config, properties) {
        if (properties === void 0) {
          properties = {
            inputType: NAME,
            outerClass: NAME
          };
        }

        return _BaseSelection.call(this, $element, $.extend(true, //{invalidComponentMatches: [File, Radio, Text, Textarea, Select]},
        Default, config), properties) || this;
      }

      var _proto = Checkbox.prototype;

      _proto.dispose = function dispose(dataKey) {
        if (dataKey === void 0) {
          dataKey = DATA_KEY;
        }

        _BaseSelection.prototype.dispose.call(this, dataKey);
      };

      Checkbox.matches = function matches($element) {
        // '.checkbox > label > input[type=checkbox]'
        if ($element.attr("type") === "checkbox") {
          return true;
        }

        return false;
      };

      Checkbox.rejectMatch = function rejectMatch(component, $element) {
        Util.assert(this.$element, this.matches($element), component + " component element " + Util.describe($element) + " is invalid for type='checkbox'.");
      } // ------------------------------------------------------------------------
      // protected
      // ------------------------------------------------------------------------
      // protected
      // ------------------------------------------------------------------------
      // private
      // ------------------------------------------------------------------------
      // static
      ;

      Checkbox._jQueryInterface = function _jQueryInterface(config) {
        return this.each(function () {
          var $element = $(this);
          var data = $element.data(DATA_KEY);

          if (!data) {
            data = new Checkbox($element, config);
            $element.data(DATA_KEY, data);
          }
        });
      };

      return Checkbox;
    }(BaseSelection);
    /**
     * ------------------------------------------------------------------------
     * jQuery
     * ------------------------------------------------------------------------
     */


    $.fn[JQUERY_NAME] = Checkbox._jQueryInterface;
    $.fn[JQUERY_NAME].Constructor = Checkbox;

    $.fn[JQUERY_NAME].noConflict = function () {
      $.fn[JQUERY_NAME] = JQUERY_NO_CONFLICT;
      return Checkbox._jQueryInterface;
    };

    return Checkbox;
  }(jQuery);

  var Radio = function ($) {
    /**
     * ------------------------------------------------------------------------
     * Constants
     * ------------------------------------------------------------------------
     */
    var NAME = "radio";
    var DATA_KEY = "bmd." + NAME;
    var JQUERY_NAME = "bmd" + (NAME.charAt(0).toUpperCase() + NAME.slice(1));
    var JQUERY_NO_CONFLICT = $.fn[JQUERY_NAME];
    var Default = {
      template: "<span class='bmd-radio'></span>"
    };
    /**
     * ------------------------------------------------------------------------
     * Class Definition
     * ------------------------------------------------------------------------
     */

    var Radio =
    /*#__PURE__*/
    function (_BaseSelection) {
      _inheritsLoose(Radio, _BaseSelection);

      function Radio($element, config, properties) {
        if (properties === void 0) {
          properties = {
            inputType: NAME,
            outerClass: NAME
          };
        }

        return _BaseSelection.call(this, $element, $.extend(true, //{invalidComponentMatches: [Checkbox, File, Switch, Text]},
        Default, config), properties) || this;
      }

      var _proto = Radio.prototype;

      _proto.dispose = function dispose(dataKey) {
        if (dataKey === void 0) {
          dataKey = DATA_KEY;
        }

        _BaseSelection.prototype.dispose.call(this, dataKey);
      };

      Radio.matches = function matches($element) {
        // '.radio > label > input[type=radio]'
        if ($element.attr("type") === "radio") {
          return true;
        }

        return false;
      };

      Radio.rejectMatch = function rejectMatch(component, $element) {
        Util.assert(this.$element, this.matches($element), component + " component element " + Util.describe($element) + " is invalid for type='radio'.");
      } // ------------------------------------------------------------------------
      // protected
      //decorateMarkup() {
      //  this.$element.after(this.config.template)
      //}
      // ------------------------------------------------------------------------
      // private
      // ------------------------------------------------------------------------
      // static
      ;

      Radio._jQueryInterface = function _jQueryInterface(config) {
        return this.each(function () {
          var $element = $(this);
          var data = $element.data(DATA_KEY);

          if (!data) {
            data = new Radio($element, config);
            $element.data(DATA_KEY, data);
          }
        });
      };

      return Radio;
    }(BaseSelection);
    /**
     * ------------------------------------------------------------------------
     * jQuery
     * ------------------------------------------------------------------------
     */


    $.fn[JQUERY_NAME] = Radio._jQueryInterface;
    $.fn[JQUERY_NAME].Constructor = Radio;

    $.fn[JQUERY_NAME].noConflict = function () {
      $.fn[JQUERY_NAME] = JQUERY_NO_CONFLICT;
      return Radio._jQueryInterface;
    };

    return Radio;
  }(jQuery);

  var BaseFormControl = function ($) {
    /**
     * ------------------------------------------------------------------------
     * Constants
     * ------------------------------------------------------------------------
     */
    var Default = {
      requiredClasses: ["form-control"]
    };
    /**
     * ------------------------------------------------------------------------
     * Class Definition
     * ------------------------------------------------------------------------
     */

    var BaseFormControl =
    /*#__PURE__*/
    function (_BaseInput) {
      _inheritsLoose(BaseFormControl, _BaseInput);

      function BaseFormControl($element, config) {
        var _this;

        _this = _BaseInput.call(this, $element, $.extend(true, Default, config)) || this; // Initially mark as empty

        if (_this.isEmpty()) {
          _this.removeIsFilled();
        }

        return _this;
      }

      return BaseFormControl;
    }(BaseInput);

    return BaseFormControl;
  }(jQuery);

  var Select = function ($) {
    /**
     * ------------------------------------------------------------------------
     * Constants
     * ------------------------------------------------------------------------
     */
    var NAME = "select";
    var DATA_KEY = "bmd." + NAME;
    var JQUERY_NAME = "bmd" + (NAME.charAt(0).toUpperCase() + NAME.slice(1));
    var JQUERY_NO_CONFLICT = $.fn[JQUERY_NAME];
    var Default = {
      requiredClasses: ["form-control||custom-select"]
    };
    /**
     * ------------------------------------------------------------------------
     * Class Definition
     * ------------------------------------------------------------------------
     */

    var Select =
    /*#__PURE__*/
    function (_BaseFormControl) {
      _inheritsLoose(Select, _BaseFormControl);

      function Select($element, config) {
        var _this;

        _this = _BaseFormControl.call(this, $element, $.extend(true, //{invalidComponentMatches: [Checkbox, File, Radio, Switch, Text, Textarea]},
        Default, config)) || this; // floating labels will cover the options, so trigger them to be above (if used)

        _this.addIsFilled();

        return _this;
      }

      var _proto = Select.prototype;

      _proto.dispose = function dispose() {
        _BaseFormControl.prototype.dispose.call(this, DATA_KEY);
      };

      Select.matches = function matches($element) {
        if ($element.prop("tagName") === "select") {
          return true;
        }

        return false;
      };

      Select.rejectMatch = function rejectMatch(component, $element) {
        Util.assert(this.$element, this.matches($element), component + " component element " + Util.describe($element) + " is invalid for <select>.");
      } // ------------------------------------------------------------------------
      // protected
      // ------------------------------------------------------------------------
      // private
      // ------------------------------------------------------------------------
      // static
      ;

      Select._jQueryInterface = function _jQueryInterface(config) {
        return this.each(function () {
          var $element = $(this);
          var data = $element.data(DATA_KEY);

          if (!data) {
            data = new Select($element, config);
            $element.data(DATA_KEY, data);
          }
        });
      };

      return Select;
    }(BaseFormControl);
    /**
     * ------------------------------------------------------------------------
     * jQuery
     * ------------------------------------------------------------------------
     */


    $.fn[JQUERY_NAME] = Select._jQueryInterface;
    $.fn[JQUERY_NAME].Constructor = Select;

    $.fn[JQUERY_NAME].noConflict = function () {
      $.fn[JQUERY_NAME] = JQUERY_NO_CONFLICT;
      return Select._jQueryInterface;
    };

    return Select;
  }(jQuery);

  var Switch = function ($) {
    /**
     * ------------------------------------------------------------------------
     * Constants
     * ------------------------------------------------------------------------
     */
    var NAME = "switch";
    var DATA_KEY = "bmd." + NAME;
    var JQUERY_NAME = "bmd" + (NAME.charAt(0).toUpperCase() + NAME.slice(1));
    var JQUERY_NO_CONFLICT = $.fn[JQUERY_NAME];
    var Default = {
      template: "<span class='bmd-switch-track'></span>"
    };
    /**
     * ------------------------------------------------------------------------
     * Class Definition
     * ------------------------------------------------------------------------
     */

    var Switch =
    /*#__PURE__*/
    function (_Checkbox) {
      _inheritsLoose(Switch, _Checkbox);

      function Switch($element, config, properties) {
        if (properties === void 0) {
          properties = {
            inputType: "checkbox",
            outerClass: "switch"
          };
        }

        return _Checkbox.call(this, $element, $.extend(true, {}, Default, config), properties) || this; // selector: '.switch > label > input[type=checkbox]'
      }

      var _proto = Switch.prototype;

      _proto.dispose = function dispose() {
        _Checkbox.prototype.dispose.call(this, DATA_KEY);
      } // ------------------------------------------------------------------------
      // protected
      // ------------------------------------------------------------------------
      // private
      // ------------------------------------------------------------------------
      // static
      ;

      Switch._jQueryInterface = function _jQueryInterface(config) {
        return this.each(function () {
          var $element = $(this);
          var data = $element.data(DATA_KEY);

          if (!data) {
            data = new Switch($element, config);
            $element.data(DATA_KEY, data);
          }
        });
      };

      return Switch;
    }(Checkbox);
    /**
     * ------------------------------------------------------------------------
     * jQuery
     * ------------------------------------------------------------------------
     */


    $.fn[JQUERY_NAME] = Switch._jQueryInterface;
    $.fn[JQUERY_NAME].Constructor = Switch;

    $.fn[JQUERY_NAME].noConflict = function () {
      $.fn[JQUERY_NAME] = JQUERY_NO_CONFLICT;
      return Switch._jQueryInterface;
    };

    return Switch;
  }(jQuery);

  var Text = function ($) {
    /**
     * ------------------------------------------------------------------------
     * Constants
     * ------------------------------------------------------------------------
     */
    var NAME = "text";
    var DATA_KEY = "bmd." + NAME;
    var JQUERY_NAME = "bmd" + (NAME.charAt(0).toUpperCase() + NAME.slice(1));
    var JQUERY_NO_CONFLICT = $.fn[JQUERY_NAME];
    var Default = {};
    /**
     * ------------------------------------------------------------------------
     * Class Definition
     * ------------------------------------------------------------------------
     */

    var Text =
    /*#__PURE__*/
    function (_BaseFormControl) {
      _inheritsLoose(Text, _BaseFormControl);

      function Text($element, config) {
        return _BaseFormControl.call(this, $element, $.extend(true, //{invalidComponentMatches: [Checkbox, File, Radio, Switch, Select, Textarea]},
        Default, config)) || this;
      }

      var _proto = Text.prototype;

      _proto.dispose = function dispose(dataKey) {
        if (dataKey === void 0) {
          dataKey = DATA_KEY;
        }

        _BaseFormControl.prototype.dispose.call(this, dataKey);
      };

      Text.matches = function matches($element) {
        if ($element.attr("type") === "text") {
          return true;
        }

        return false;
      };

      Text.rejectMatch = function rejectMatch(component, $element) {
        Util.assert(this.$element, this.matches($element), component + " component element " + Util.describe($element) + " is invalid for type='text'.");
      } // ------------------------------------------------------------------------
      // protected
      // ------------------------------------------------------------------------
      // private
      // ------------------------------------------------------------------------
      // static
      ;

      Text._jQueryInterface = function _jQueryInterface(config) {
        return this.each(function () {
          var $element = $(this);
          var data = $element.data(DATA_KEY);

          if (!data) {
            data = new Text($element, config);
            $element.data(DATA_KEY, data);
          }
        });
      };

      return Text;
    }(BaseFormControl);
    /**
     * ------------------------------------------------------------------------
     * jQuery
     * ------------------------------------------------------------------------
     */


    $.fn[JQUERY_NAME] = Text._jQueryInterface;
    $.fn[JQUERY_NAME].Constructor = Text;

    $.fn[JQUERY_NAME].noConflict = function () {
      $.fn[JQUERY_NAME] = JQUERY_NO_CONFLICT;
      return Text._jQueryInterface;
    };

    return Text;
  }(jQuery);

  var Textarea = function ($) {
    /**
     * ------------------------------------------------------------------------
     * Constants
     * ------------------------------------------------------------------------
     */
    var NAME = "textarea";
    var DATA_KEY = "bmd." + NAME;
    var JQUERY_NAME = "bmd" + (NAME.charAt(0).toUpperCase() + NAME.slice(1));
    var JQUERY_NO_CONFLICT = $.fn[JQUERY_NAME];
    var Default = {};
    /**
     * ------------------------------------------------------------------------
     * Class Definition
     * ------------------------------------------------------------------------
     */

    var Textarea =
    /*#__PURE__*/
    function (_BaseFormControl) {
      _inheritsLoose(Textarea, _BaseFormControl);

      function Textarea($element, config) {
        return _BaseFormControl.call(this, $element, $.extend(true, //{invalidComponentMatches: [Checkbox, File, Radio, Text, Select, Switch]},
        Default, config)) || this;
      }

      var _proto = Textarea.prototype;

      _proto.dispose = function dispose() {
        _BaseFormControl.prototype.dispose.call(this, DATA_KEY);
      };

      Textarea.matches = function matches($element) {
        if ($element.prop("tagName") === "textarea") {
          return true;
        }

        return false;
      };

      Textarea.rejectMatch = function rejectMatch(component, $element) {
        Util.assert(this.$element, this.matches($element), component + " component element " + Util.describe($element) + " is invalid for <textarea>.");
      } // ------------------------------------------------------------------------
      // protected
      // ------------------------------------------------------------------------
      // private
      // ------------------------------------------------------------------------
      // static
      ;

      Textarea._jQueryInterface = function _jQueryInterface(config) {
        return this.each(function () {
          var $element = $(this);
          var data = $element.data(DATA_KEY);

          if (!data) {
            data = new Textarea($element, config);
            $element.data(DATA_KEY, data);
          }
        });
      };

      return Textarea;
    }(BaseFormControl);
    /**
     * ------------------------------------------------------------------------
     * jQuery
     * ------------------------------------------------------------------------
     */


    $.fn[JQUERY_NAME] = Textarea._jQueryInterface;
    $.fn[JQUERY_NAME].Constructor = Textarea;

    $.fn[JQUERY_NAME].noConflict = function () {
      $.fn[JQUERY_NAME] = JQUERY_NO_CONFLICT;
      return Textarea._jQueryInterface;
    };

    return Textarea;
  }(jQuery);

  var BaseLayout = function ($) {
    var ClassName = {
      CANVAS: "bmd-layout-canvas",
      CONTAINER: "bmd-layout-container",
      BACKDROP: "bmd-layout-backdrop"
    };
    var Selector = {
      CANVAS: "." + ClassName.CANVAS,
      CONTAINER: "." + ClassName.CONTAINER,
      BACKDROP: "." + ClassName.BACKDROP
    };
    var Default = {
      canvas: {
        create: true,
        required: true,
        template: "<div class=\"" + ClassName.CANVAS + "\"></div>"
      },
      backdrop: {
        create: true,
        required: true,
        template: "<div class=\"" + ClassName.BACKDROP + "\"></div>"
      }
    };
    /**
     * ------------------------------------------------------------------------
     * Class Definition
     * ------------------------------------------------------------------------
     */

    var BaseLayout =
    /*#__PURE__*/
    function (_Base) {
      _inheritsLoose(BaseLayout, _Base);

      function BaseLayout($element, config, properties) {
        var _this;

        if (properties === void 0) {
          properties = {};
        }

        _this = _Base.call(this, $element, $.extend(true, {}, Default, config), properties) || this;
        _this.$container = _this.findContainer(true);
        _this.$backdrop = _this.resolveBackdrop();

        _this.resolveCanvas();

        return _this;
      }

      var _proto = BaseLayout.prototype;

      _proto.dispose = function dispose(dataKey) {
        _Base.prototype.dispose.call(this, dataKey);

        this.$container = null;
        this.$backdrop = null;
      } // ------------------------------------------------------------------------
      // protected
      // Will wrap container in bmd-layout-canvas if necessary
      ;

      _proto.resolveCanvas = function resolveCanvas() {
        var bd = this.findCanvas(false);

        if (bd === undefined || bd.length === 0) {
          if (this.config.canvas.create) {
            this.$container.wrap(this.config.canvas.template);
          }

          bd = this.findCanvas(this.config.canvas.required);
        }

        return bd;
      } // Find closest bmd-layout-container based on the given context
      ;

      _proto.findCanvas = function findCanvas(raiseError, context) {
        if (raiseError === void 0) {
          raiseError = true;
        }

        if (context === void 0) {
          context = this.$container;
        }

        var canvas = context.closest(Selector.CANVAS);

        if (canvas.length === 0 && raiseError) {
          $.error("Failed to find " + Selector.CANVAS + " for " + Util.describe(context));
        }

        return canvas;
      } // Will add bmd-layout-backdrop to bmd-layout-container if necessary
      ;

      _proto.resolveBackdrop = function resolveBackdrop() {
        var bd = this.findBackdrop(false);

        if (bd === undefined || bd.length === 0) {
          if (this.config.backdrop.create) {
            this.$container.append(this.config.backdrop.template);
          }

          bd = this.findBackdrop(this.config.backdrop.required);
        }

        return bd;
      } // Find closest bmd-layout-container based on the given context
      ;

      _proto.findBackdrop = function findBackdrop(raiseError, context) {
        if (raiseError === void 0) {
          raiseError = true;
        }

        if (context === void 0) {
          context = this.$container;
        }

        var backdrop = context.find("> " + Selector.BACKDROP);

        if (backdrop.length === 0 && raiseError) {
          $.error("Failed to find " + Selector.BACKDROP + " for " + Util.describe(context));
        }

        return backdrop;
      } // Find closest bmd-layout-container based on the given context
      ;

      _proto.findContainer = function findContainer(raiseError, context) {
        if (raiseError === void 0) {
          raiseError = true;
        }

        if (context === void 0) {
          context = this.$element;
        }

        var container = context.closest(Selector.CONTAINER);

        if (container.length === 0 && raiseError) {
          $.error("Failed to find " + Selector.CONTAINER + " for " + Util.describe(context));
        }

        return container;
      } // ------------------------------------------------------------------------
      // private
      // ------------------------------------------------------------------------
      // static
      ;

      return BaseLayout;
    }(Base);

    return BaseLayout;
  }(jQuery);

  var Drawer = function ($) {
    /**
     * ------------------------------------------------------------------------
     * Constants
     * ------------------------------------------------------------------------
     */
    var NAME = "drawer";
    var DATA_KEY = "bmd." + NAME;
    var JQUERY_NAME = "bmd" + (NAME.charAt(0).toUpperCase() + NAME.slice(1));
    var JQUERY_NO_CONFLICT = $.fn[JQUERY_NAME];
    var Keycodes = {
      ESCAPE: 27 //ENTER: 13,
      //SPACE: 32

    };
    var ClassName = {
      IN: "in",
      DRAWER_IN: "bmd-drawer-in",
      DRAWER_OUT: "bmd-drawer-out",
      DRAWER: "bmd-layout-drawer",
      CONTAINER: "bmd-layout-container"
    };
    var Default = {
      focusSelector: "a, button, input"
    };
    /**
     * ------------------------------------------------------------------------
     * Class Definition
     * ------------------------------------------------------------------------
     */

    var Drawer =
    /*#__PURE__*/
    function (_BaseLayout) {
      _inheritsLoose(Drawer, _BaseLayout);

      // $element is expected to be the trigger
      //  i.e. <button class="btn bmd-btn-icon" for="search" data-bs-toggle="drawer" data-bs-target="#my-side-nav-drawer" aria-expanded="false" aria-controls="my-side-nav-drawer">
      function Drawer($element, config) {
        var _this;

        _this = _BaseLayout.call(this, $element, $.extend(true, {}, Default, config)) || this;
        _this.$toggles = $("[data-bs-toggle=\"drawer\"][href=\"#" + _this.$element[0].id + "\"], [data-bs-toggle=\"drawer\"][data-bs-target=\"#" + _this.$element[0].id + "\"]");

        _this._addAria(); // click or escape on the backdrop closes the drawer


        _this.$backdrop.keydown(function (ev) {
          if (ev.which === Keycodes.ESCAPE) {
            _this.hide();
          }
        }).click(function () {
          _this.hide();
        }); // escape on the drawer closes it


        _this.$element.keydown(function (ev) {
          if (ev.which === Keycodes.ESCAPE) {
            _this.hide();
          }
        }); // any toggle button clicks


        _this.$toggles.click(function () {
          _this.toggle();
        });

        return _this;
      }

      var _proto = Drawer.prototype;

      _proto.dispose = function dispose() {
        _BaseLayout.prototype.dispose.call(this, DATA_KEY);

        this.$toggles = null;
      };

      _proto.toggle = function toggle() {
        if (this._isOpen()) {
          this.hide();
        } else {
          this.show();
        }
      };

      _proto.show = function show() {
        if (this._isForcedClosed() || this._isOpen()) {
          return;
        }

        $(".bmd-layout-drawer").hide();
        this.$element.show();
        this.$toggles.attr("aria-expanded", true);
        this.$element.attr("aria-expanded", true);
        this.$element.attr("aria-hidden", false); // focus on the first focusable item

        var $focusOn = this.$element.find(this.config.focusSelector);

        if ($focusOn.length > 0) {
          $focusOn.first().focus();
        }

        this.$container.addClass(ClassName.DRAWER_IN); // backdrop is responsively styled based on bmd-drawer-overlay, therefore style is none of our concern, simply add the marker class and let the scss determine if it should be displayed or not.

        this.$backdrop.addClass(ClassName.IN);
      };

      _proto.hide = function hide() {
        if (!this._isOpen()) {
          return;
        }

        this.$toggles.attr("aria-expanded", false);
        this.$element.attr("aria-expanded", false);
        this.$element.attr("aria-hidden", true);
        this.$container.removeClass(ClassName.DRAWER_IN);
        this.$backdrop.removeClass(ClassName.IN);
      } // ------------------------------------------------------------------------
      // private
      ;

      _proto._isOpen = function _isOpen() {
        return this.$container.hasClass(ClassName.DRAWER_IN);
      };

      _proto._isForcedClosed = function _isForcedClosed() {
        return this.$container.hasClass(ClassName.DRAWER_OUT);
      };

      _proto._addAria = function _addAria() {
        var isOpen = this._isOpen();

        this.$element.attr("aria-expanded", isOpen);
        this.$element.attr("aria-hidden", isOpen);

        if (this.$toggles.length) {
          this.$toggles.attr("aria-expanded", isOpen);
        }
      } // ------------------------------------------------------------------------
      // static
      ;

      Drawer._jQueryInterface = function _jQueryInterface(config) {
        return this.each(function () {
          var $element = $(this);
          var data = $element.data(DATA_KEY);

          if (!data) {
            data = new Drawer($element, config);
            $element.data(DATA_KEY, data);
          }
        });
      };

      return Drawer;
    }(BaseLayout);
    /**
     * ------------------------------------------------------------------------
     * jQuery
     * ------------------------------------------------------------------------
     */


    $.fn[JQUERY_NAME] = Drawer._jQueryInterface;
    $.fn[JQUERY_NAME].Constructor = Drawer;

    $.fn[JQUERY_NAME].noConflict = function () {
      $.fn[JQUERY_NAME] = JQUERY_NO_CONFLICT;
      return Drawer._jQueryInterface;
    };

    return Drawer;
  }(jQuery);

  var Ripples = function ($) {
    /**
     * ------------------------------------------------------------------------
     * Constants
     * ------------------------------------------------------------------------
     */
    var NAME = "ripples";
    var DATA_KEY = "bmd." + NAME;
    var JQUERY_NAME = "bmd" + (NAME.charAt(0).toUpperCase() + NAME.slice(1));
    var JQUERY_NO_CONFLICT = $.fn[JQUERY_NAME];
    var ClassName = {
      CONTAINER: "ripple-container",
      DECORATOR: "ripple-decorator"
    };
    var Selector = {
      CONTAINER: "." + ClassName.CONTAINER,
      DECORATOR: "." + ClassName.DECORATOR //,

    };
    var Default = {
      container: {
        template: "<div class='" + ClassName.CONTAINER + "'></div>"
      },
      decorator: {
        template: "<div class='" + ClassName.DECORATOR + "'></div>"
      },
      trigger: {
        start: "mousedown touchstart",
        end: "mouseup mouseleave touchend"
      },
      touchUserAgentRegex: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i,
      duration: 500
    };
    /**
     * ------------------------------------------------------------------------
     * Class Definition
     * ------------------------------------------------------------------------
     */

    var Ripples =
    /*#__PURE__*/
    function () {
      function Ripples($element, config) {
        var _this = this;

        this.$element = $element; // console.log(`Adding ripples to ${Util.describe(this.$element)}`)  // eslint-disable-line no-console

        this.config = $.extend(true, {}, Default, config); // attach initial listener

        this.$element.on(this.config.trigger.start, function (event) {
          _this._onStartRipple(event);
        });
      }

      var _proto = Ripples.prototype;

      _proto.dispose = function dispose() {
        this.$element.data(DATA_KEY, null);
        this.$element = null;
        this.$container = null;
        this.$decorator = null;
        this.config = null;
      } // ------------------------------------------------------------------------
      // private
      ;

      _proto._onStartRipple = function _onStartRipple(event) {
        var _this2 = this;

        // Verify if the user is just touching on a device and return if so
        if (this._isTouch() && event.type === "mousedown") {
          return;
        } // Find or create the ripple container element


        this._findOrCreateContainer(); // Get relY and relX positions of the container element


        var relY = this._getRelY(event);

        var relX = this._getRelX(event); // If relY and/or relX are false, return the event


        if (!relY && !relX) {
          return;
        } // set the location and color each time (even if element is cached)


        this.$decorator.css({
          left: relX,
          top: relY,
          "background-color": this._getRipplesColor()
        }); // Make sure the ripple has the styles applied (ugly hack but it works)

        this._forceStyleApplication(); // Turn on the ripple animation


        this.rippleOn(); // Call the rippleEnd function when the transition 'on' ends

        setTimeout(function () {
          _this2.rippleEnd();
        }, this.config.duration); // Detect when the user leaves the element to cleanup if not already done?

        this.$element.on(this.config.trigger.end, function () {
          if (_this2.$decorator) {
            // guard against race condition/mouse attack
            _this2.$decorator.data("mousedown", "off");

            if (_this2.$decorator.data("animating") === "off") {
              _this2.rippleOut();
            }
          }
        });
      };

      _proto._findOrCreateContainer = function _findOrCreateContainer() {
        if (!this.$container || !this.$container.length > 0) {
          this.$element.append(this.config.container.template);
          this.$container = this.$element.find(Selector.CONTAINER);
        } // always add the rippleElement, it is always removed


        this.$container.append(this.config.decorator.template);
        this.$decorator = this.$container.find(Selector.DECORATOR);
      } // Make sure the ripple has the styles applied (ugly hack but it works)
      ;

      _proto._forceStyleApplication = function _forceStyleApplication() {
        return window.getComputedStyle(this.$decorator[0]).opacity;
      }
      /**
       * Get the relX
       */
      ;

      _proto._getRelX = function _getRelX(event) {
        var wrapperOffset = this.$container.offset();
        var result = null;

        if (!this._isTouch()) {
          // Get the mouse position relative to the ripple wrapper
          result = event.pageX - wrapperOffset.left;
        } else {
          // Make sure the user is using only one finger and then get the touch
          //  position relative to the ripple wrapper
          event = event.originalEvent;

          if (event.touches.length === 1) {
            result = event.touches[0].pageX - wrapperOffset.left;
          } else {
            result = false;
          }
        }

        return result;
      }
      /**
       * Get the relY
       */
      ;

      _proto._getRelY = function _getRelY(event) {
        var containerOffset = this.$container.offset();
        var result = null;

        if (!this._isTouch()) {
          /**
           * Get the mouse position relative to the ripple wrapper
           */
          result = event.pageY - containerOffset.top;
        } else {
          /**
           * Make sure the user is using only one finger and then get the touch
           * position relative to the ripple wrapper
           */
          event = event.originalEvent;

          if (event.touches.length === 1) {
            result = event.touches[0].pageY - containerOffset.top;
          } else {
            result = false;
          }
        }

        return result;
      }
      /**
       * Get the ripple color
       */
      ;

      _proto._getRipplesColor = function _getRipplesColor() {
        var color = this.$element.data("ripple-color") ? this.$element.data("ripple-color") : window.getComputedStyle(this.$element[0]).color;
        return color;
      }
      /**
       * Verify if the client is using a mobile device
       */
      ;

      _proto._isTouch = function _isTouch() {
        return this.config.touchUserAgentRegex.test(navigator.userAgent);
      }
      /**
       * End the animation of the ripple
       */
      ;

      _proto.rippleEnd = function rippleEnd() {
        if (this.$decorator) {
          // guard against race condition/mouse attack
          this.$decorator.data("animating", "off");

          if (this.$decorator.data("mousedown") === "off") {
            this.rippleOut(this.$decorator);
          }
        }
      }
      /**
       * Turn off the ripple effect
       */
      ;

      _proto.rippleOut = function rippleOut() {
        var _this3 = this;

        this.$decorator.off();

        if (Util.transitionEndSupported()) {
          this.$decorator.addClass("ripple-out");
        } else {
          this.$decorator.animate({
            opacity: 0
          }, 100, function () {
            _this3.$decorator.trigger("transitionend");
          });
        }

        this.$decorator.on(Util.transitionEndSelector(), function () {
          if (_this3.$decorator) {
            _this3.$decorator.remove();

            _this3.$decorator = null;
          }
        });
      }
      /**
       * Turn on the ripple effect
       */
      ;

      _proto.rippleOn = function rippleOn() {
        var _this4 = this;

        var size = this._getNewSize();

        if (Util.transitionEndSupported()) {
          this.$decorator.css({
            "-ms-transform": "scale(" + size + ")",
            "-moz-transform": "scale(" + size + ")",
            "-webkit-transform": "scale(" + size + ")",
            transform: "scale(" + size + ")"
          }).addClass("ripple-on").data("animating", "on").data("mousedown", "on");
        } else {
          this.$decorator.animate({
            width: Math.max(this.$element.outerWidth(), this.$element.outerHeight()) * 2,
            height: Math.max(this.$element.outerWidth(), this.$element.outerHeight()) * 2,
            "margin-left": Math.max(this.$element.outerWidth(), this.$element.outerHeight()) * -1,
            "margin-top": Math.max(this.$element.outerWidth(), this.$element.outerHeight()) * -1,
            opacity: 0.2
          }, this.config.duration, function () {
            _this4.$decorator.trigger("transitionend");
          });
        }
      }
      /**
       * Get the new size based on the element height/width and the ripple width
       */
      ;

      _proto._getNewSize = function _getNewSize() {
        return Math.max(this.$element.outerWidth(), this.$element.outerHeight()) / this.$decorator.outerWidth() * 2.5;
      } // ------------------------------------------------------------------------
      // static
      ;

      Ripples._jQueryInterface = function _jQueryInterface(config) {
        return this.each(function () {
          var $element = $(this);
          var data = $element.data(DATA_KEY);

          if (!data) {
            data = new Ripples($element, config);
            $element.data(DATA_KEY, data);
          }
        });
      };

      return Ripples;
    }();
    /**
     * ------------------------------------------------------------------------
     * jQuery
     * ------------------------------------------------------------------------
     */


    $.fn[JQUERY_NAME] = Ripples._jQueryInterface;
    $.fn[JQUERY_NAME].Constructor = Ripples;

    $.fn[JQUERY_NAME].noConflict = function () {
      $.fn[JQUERY_NAME] = JQUERY_NO_CONFLICT;
      return Ripples._jQueryInterface;
    };

    return Ripples;
  }(jQuery);

  var Autofill = function ($) {
    /**
     * ------------------------------------------------------------------------
     * Constants
     * ------------------------------------------------------------------------
     */
    var NAME = "autofill";
    var DATA_KEY = "bmd." + NAME;
    var JQUERY_NAME = "bmd" + (NAME.charAt(0).toUpperCase() + NAME.slice(1));
    var JQUERY_NO_CONFLICT = $.fn[JQUERY_NAME];
    var LAST_VALUE_DATA_KEY = "bmd.last_value";
    var Default = {};
    /**
     * ------------------------------------------------------------------------
     * Class Definition
     * ------------------------------------------------------------------------
     */

    var Autofill =
    /*#__PURE__*/
    function (_Base) {
      _inheritsLoose(Autofill, _Base);

      function Autofill($element, config) {
        var _this;

        _this = _Base.call(this, $element, $.extend(true, {}, Default, config)) || this;

        _this._watchLoading();

        _this._attachEventHandlers();

        return _this;
      }

      var _proto = Autofill.prototype;

      _proto.dispose = function dispose() {
        _Base.prototype.dispose.call(this, DATA_KEY);
      } // ------------------------------------------------------------------------
      // private
      ;

      _proto._watchLoading = function _watchLoading() {
        var _this2 = this;

        // After 10 seconds we are quite sure all the needed inputs are autofilled then we can stop checking them
        setTimeout(function () {
          clearInterval(_this2._onLoading);
        }, 10000);
      } // This part of code will detect autofill when the page is loading (username and password inputs for example)
      ;

      _proto._onLoading = function _onLoading() {
        setInterval(function () {
          $("input[type!=checkbox]").each(function (index, element) {
            var $element = $(element);
            var previousValue = $element.data(LAST_VALUE_DATA_KEY);

            if (previousValue === undefined) {
              previousValue = $element.attr("value");
            }

            if (previousValue === undefined) {
              previousValue = "";
            }

            var currentValue = $element.val();

            if (currentValue !== previousValue) {
              $element.trigger("change");
            }

            $element.data(LAST_VALUE_DATA_KEY, currentValue);
          });
        }, 100);
      };

      _proto._attachEventHandlers = function _attachEventHandlers() {
        // Listen on inputs of the focused form
        //  (because user can select from the autofill dropdown only when the input has focus)
        var focused = null;
        $(document).on("focus", "input", function (event) {
          var $inputs = $(event.currentTarget).closest("form").find("input").not("[type=file], [type=date]");
          focused = setInterval(function () {
            $inputs.each(function (index, element) {
              var $element = $(element);
              var previousValue = $element.data(LAST_VALUE_DATA_KEY);

              if (previousValue === undefined) {
                previousValue = $element.attr("value");
              }

              if (previousValue === undefined) {
                previousValue = "";
              }

              var currentValue = $element.val();

              if (currentValue !== previousValue) {
                $element.trigger("change");
              }

              $element.data(LAST_VALUE_DATA_KEY, currentValue);
            });
          }, 100);
        }).on("blur", ".form-group input", function () {
          clearInterval(focused);
        });
      } // ------------------------------------------------------------------------
      // static
      ;

      Autofill._jQueryInterface = function _jQueryInterface(config) {
        return this.each(function () {
          var $element = $(this);
          var data = $element.data(DATA_KEY);

          if (!data) {
            data = new Autofill($element, config);
            $element.data(DATA_KEY, data);
          }
        });
      };

      return Autofill;
    }(Base);
    /**
     * ------------------------------------------------------------------------
     * jQuery
     * ------------------------------------------------------------------------
     */


    $.fn[JQUERY_NAME] = Autofill._jQueryInterface;
    $.fn[JQUERY_NAME].Constructor = Autofill;

    $.fn[JQUERY_NAME].noConflict = function () {
      $.fn[JQUERY_NAME] = JQUERY_NO_CONFLICT;
      return Autofill._jQueryInterface;
    };

    return Autofill;
  }(jQuery);

  /* globals Popper */
  // Popper.Defaults.modifiers.computeStyle.gpuAcceleration = false

  /**
   * $.bmd(config) is a macro class to configure the components generally
   *  used in Material Design for Bootstrap.  You may pass overrides to the configurations
   *  which will be passed into each component, or you may omit use of this class and
   *  configure each component separately.
   */
  var BMD = function ($) {
    /**
     * ------------------------------------------------------------------------
     * Constants
     * ------------------------------------------------------------------------
     */
    var NAME = "bmd";
    var DATA_KEY = "bmd." + NAME;
    var JQUERY_NAME = NAME; // retain this full name since it is long enough not to conflict

    var JQUERY_NO_CONFLICT = $.fn[JQUERY_NAME];
    /**
     * Global configuration:
     *  The global configuration hash will be mixed in to each components' config.
     *    e.g. calling $.bmd({global: { validate: true } }) would pass `validate:true` to every component
     *
     *
     * Component configuration:
     *  - selector: may be a string or an array.  Any array will be joined with a comma to generate the selector
     *  - disable any component by defining it as false with an override. e.g. $.bmd({ autofill: false })
     *
     *  @see each individual component for more configuration settings.
     */

    var Default = {
      global: {
        validate: false,
        label: {
          className: "bmd-label-static" // default style of label to be used if not specified in the html markup

        }
      },
      // autofill: {
      //   selector: "body"
      // },
      checkbox: {
        selector: ".checkbox > label > input[type=checkbox]"
      },
      // checkboxInline: {
      //   selector: "label.checkbox-inline > input[type=checkbox]"
      // },
      // collapseInline: {
      //   selector: '.bmd-collapse-inline [data-bs-toggle="collapse"]'
      // },
      drawer: {
        selector: ".bmd-layout-drawer"
      },
      // file: {
      //   selector: "input[type=file]"
      // },
      radio: {
        selector: ".radio > label > input[type=radio]"
      },
      // radioInline: {
      //   selector: "label.radio-inline > input[type=radio]"
      // },
      ripples: {
        //selector: ['.btn:not(.btn-link):not(.ripple-none)'] // testing only
        selector: [".btn:not(.btn-link):not(.ripple-none)", ".card-image:not(.ripple-none)", ".navbar a:not(.ripple-none)", ".dropdown-menu a:not(.ripple-none)", ".nav-tabs a:not(.ripple-none)", ".pagination li:not(.active):not(.disabled) a:not(.ripple-none)", ".ripple" // generic marker class to add ripple to elements
        ]
      },
      select: {
        selector: ["select"]
      },
      "switch": {
        selector: ".switch > label > input[type=checkbox]"
      },
      text: {
        // omit inputs we have specialized components to handle - we need to match text, email, etc.  The easiest way to do this appears to be just omit the ones we don't want to match and let the rest fall through to this.
        selector: ["input:not([type=hidden]):not([type=checkbox]):not([type=radio]):not([type=file]):not([type=button]):not([type=submit]):not([type=reset])"]
      },
      textarea: {
        selector: ["textarea"]
      },
      arrive: true,
      // create an ordered component list for instantiation
      instantiation: ["ripples", "checkbox", //    "checkboxInline",
      //    "collapseInline",
      "drawer", //'file',
      "radio", //    "radioInline",
      "switch", "text", "textarea", "select", "autofill"]
    };
    /**
     * ------------------------------------------------------------------------
     * Class Definition
     * ------------------------------------------------------------------------
     */

    var BMD =
    /*#__PURE__*/
    function () {
      function BMD($element, config) {
        var _this = this;

        this.$element = $element;
        this.config = $.extend(true, {}, Default, config);
        var $document = $(document);

        var _loop = function _loop() {
          if (_isArray) {
            if (_i >= _iterator.length) return "break";
            _ref = _iterator[_i++];
          } else {
            _i = _iterator.next();
            if (_i.done) return "break";
            _ref = _i.value;
          }

          var component = _ref;
          // the component's config fragment is passed in directly, allowing users to override
          var componentConfig = _this.config[component]; // check to make sure component config is enabled (not `false`)

          if (componentConfig) {
            // assemble the selector as it may be an array
            var selector = _this._resolveSelector(componentConfig); // mix in global options


            componentConfig = $.extend(true, {}, _this.config.global, componentConfig); // create the jquery fn name e.g. 'bmdText' for 'text'

            var componentName = "" + (component.charAt(0).toUpperCase() + component.slice(1));
            var jqueryFn = "bmd" + componentName;

            try {
              // safely instantiate component on selector elements with config, report errors and move on.
              // console.debug(`instantiating: $('${selector}')[${jqueryFn}](${componentConfig})`) // eslint-disable-line no-console
              $(selector)[jqueryFn](componentConfig); // add to arrive if present and enabled

              if (document.arrive && _this.config.arrive) {
                $document.arrive(selector, function () {
                  // eslint-disable-line no-loop-func
                  $(this)[jqueryFn](componentConfig);
                });
              }
            } catch (e) {
              var message = "Failed to instantiate component: $('" + selector + "')[" + jqueryFn + "](" + componentConfig + ")";
              console.error(message, e, "\nSelected elements: ", $(selector)); // eslint-disable-line no-console

              throw e;
            }
          }
        };

        for (var _iterator = this.config.instantiation, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
          var _ref;

          var _ret = _loop();

          if (_ret === "break") break;
        }
      }

      var _proto = BMD.prototype;

      _proto.dispose = function dispose() {
        this.$element.data(DATA_KEY, null);
        this.$element = null;
        this.config = null;
      } // ------------------------------------------------------------------------
      // private
      ;

      _proto._resolveSelector = function _resolveSelector(componentConfig) {
        var selector = componentConfig.selector;

        if (Array.isArray(selector)) {
          selector = selector.join(", ");
        }

        return selector;
      } // ------------------------------------------------------------------------
      // static
      ;

      BMD._jQueryInterface = function _jQueryInterface(config) {
        return this.each(function () {
          var $element = $(this);
          var data = $element.data(DATA_KEY);

          if (!data) {
            data = new BMD($element, config);
            $element.data(DATA_KEY, data);
          }
        });
      };

      return BMD;
    }();
    /**
     * ------------------------------------------------------------------------
     * jQuery
     * ------------------------------------------------------------------------
     */


    $.fn[JQUERY_NAME] = BMD._jQueryInterface;
    $.fn[JQUERY_NAME].Constructor = BMD;

    $.fn[JQUERY_NAME].noConflict = function () {
      $.fn[JQUERY_NAME] = JQUERY_NO_CONFLICT;
      return BMD._jQueryInterface;
    };

    return BMD;
  }(jQuery);

})));
