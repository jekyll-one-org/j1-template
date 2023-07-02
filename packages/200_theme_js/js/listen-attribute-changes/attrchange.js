/*
 # -----------------------------------------------------------------------------
 # ~/200_theme_js/js/listen-attribute-changes/attrchange.js
 # A simple jQuery function that can add listeners on attribute change.
 #
 # Product/Info:
 # https://jekyll.one
 #
 # Copyright (C) 2013-2014 Selvakumar Arumugam
 # Copyright (C) 2023 Juergen Adams
 #
 # Attrchange is licensed under the MIT License.
 # See: https://github.com/meetselva/attrchange/blob/master/MIT-License.txt
 #
 # J1 Theme is licensed under the MIT License.
 # See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE.md
 # -----------------------------------------------------------------------------
*/
;(function($) {

	function isDOMAttrModifiedSupported() {
		var p = document.createElement('p');
		var flag = false;

		if (p.addEventListener) {
			p.addEventListener('DOMAttrModified', function() {
				flag = true
			}, false);
		} else if (p.attachEvent) {
			p.attachEvent('onDOMAttrModified', function() {
				flag = true
			});
		} else { return false; }
		p.setAttribute('id', 'target');
		return flag;
	}

	function checkAttributes(chkAttr, e) {
		if (chkAttr) {
			var attributes = this.data('attr-old-value');

			if (e.attributeName.indexOf('style') >= 0) {
				if (!attributes['style'])
					attributes['style'] = {}; //initialize
				var keys = e.attributeName.split('.');
				e.attributeName = keys[0];
				e.oldValue = attributes['style'][keys[1]]; //old value
				e.newValue = keys[1] + ':'
						+ this.prop("style")[$.camelCase(keys[1])]; //new value
				attributes['style'][keys[1]] = e.newValue;
			} else {
				e.oldValue = attributes[e.attributeName];
				e.newValue = this.attr(e.attributeName);
				attributes[e.attributeName] = e.newValue;
			}

			this.data('attr-old-value', attributes); //update the old value object
		}
	}

	//initialize Mutation Observer
	var MutationObserver = window.MutationObserver
			|| window.WebKitMutationObserver;

	$.fn.attrchange = function(a, b) {
		if (typeof a == 'object') {//core
			var cfg = {
				trackValues : false,
				callback : $.noop
			};
			//backward compatibility
			if (typeof a === "function") { cfg.callback = a; } else { $.extend(cfg, a); }

			if (cfg.trackValues) { //get attributes old value
				this.each(function(i, el) {
					var attributes = {};
					for ( var attr, i = 0, attrs = el.attributes, l = attrs.length; i < l; i++) {
						attr = attrs.item(i);
						attributes[attr.nodeName] = attr.value;
					}
					$(this).data('attr-old-value', attributes);
				});
			}

			if (MutationObserver) { //Modern Browsers supporting MutationObserver
				var mOptions = {
					subtree : false,
					attributes : true,
					attributeOldValue : cfg.trackValues
				};
				var observer = new MutationObserver(function(mutations) {
					mutations.forEach(function(e) {
						var _this = e.target;
						//get new value if trackValues is true
						if (cfg.trackValues) {
							e.newValue = $(_this).attr(e.attributeName);
						}
						if ($(_this).data('attrchange-status') === 'connected') { //execute if connected
							cfg.callback.call(_this, e);
						}
					});
				});

				return this.data('attrchange-method', 'Mutation Observer').data('attrchange-status', 'connected')
						.data('attrchange-obs', observer).each(function() {
							observer.observe(this, mOptions);
						});
			} else if (isDOMAttrModifiedSupported()) { //Opera
				//Good old Mutation Events
				return this.data('attrchange-method', 'DOMAttrModified').data('attrchange-status', 'connected').on('DOMAttrModified', function(event) {
					if (event.originalEvent) { event = event.originalEvent; }//jQuery normalization is not required
					event.attributeName = event.attrName; //property names to be consistent with MutationObserver
					event.oldValue = event.prevValue; //property names to be consistent with MutationObserver
					if ($(this).data('attrchange-status') === 'connected') { //disconnected logically
						cfg.callback.call(this, event);
					}
				});
			} else if ('onpropertychange' in document.body) { //works only in IE
				return this.data('attrchange-method', 'propertychange').data('attrchange-status', 'connected').on('propertychange', function(e) {
					e.attributeName = window.event.propertyName;
					//to set the attr old value
					checkAttributes.call($(this), cfg.trackValues, e);
					if ($(this).data('attrchange-status') === 'connected') { //disconnected logically
						cfg.callback.call(this, e);
					}
				});
			}
			return this;
		} else if (typeof a == 'string' && $.fn.attrchange.hasOwnProperty('extensions') &&
				$.fn.attrchange['extensions'].hasOwnProperty(a)) { //extensions/options
			return $.fn.attrchange['extensions'][a].call(this, b);
		}
	}

  $.fn.attrchange.extensions = { /*attrchange option/extension*/
  	disconnect: function (o) {
  		if (typeof o !== 'undefined' && o.isPhysicalDisconnect) {
  			return this.each(function() {
  				var attrchangeMethod = $(this).data('attrchange-method');
  				if (attrchangeMethod == 'propertychange' || attrchangeMethod == 'DOMAttrModified') {
  					$(this).off(attrchangeMethod);
  				} else if (attrchangeMethod == 'Mutation Observer') {
  					$(this).data('attrchange-obs').disconnect();
  				} else if (attrchangeMethod == 'polling') {
  					clearInterval($(this).data('attrchange-polling-timer'));
  				}
  			}).removeData(['attrchange-method', 'attrchange-status']);
  		} else { //logical disconnect
  			return this.data('attrchange-status', 'disconnected'); //set a flag that prevents triggering callback onattrchange
  		}
  	},
  	remove: function (o) {
  		return  $.fn.attrchange.extensions['disconnect'].call(this, {isPhysicalDisconnect: true});
  	},
  	getProperties: function (o) {
  		var attrchangeMethod = $(this).data('attrchange-method');
  		var pollInterval = $(this).data('attrchange-pollInterval');
  		return {
  			method: attrchangeMethod,
  			isPolling: (attrchangeMethod == 'polling'),
  			pollingInterval: (typeof pollInterval === 'undefined')?0:parseInt(pollInterval, 10),
  			status: (typeof attrchangeMethod === 'undefined')?'removed': $(this).data('attrchange-status')
  		}
  	},
  	reconnect: function (o) {//reconnect possible only when there is a logical disconnect
  		return this.data('attrchange-status', 'connected');
  	},
  	polling: function (o) {
  		if (o.hasOwnProperty('isComputedStyle') && o.isComputedStyle == 'true') { /* extensive and slow - polling to check on computed style properties */
  			return this.each(function(i, _this) {
  				if (!o.hasOwnProperty('properties') ||
  						Object.prototype.toString.call(o.properties) !== '[object Array]' ||
  							o.properties.length == 0) { return false; } //return if no properties found
  				var attributes = {}; //store computed properties
  				for (var i = 0; i < o.properties.length; i++) {
  					attributes[o.properties[i]] = $(this).css(o.properties[i]);
  				}
  				var _this = this;
  				$(this).data('attrchange-polling-timer', setInterval(function () {
  					var changes = {}, hasChanges = false; // attrName: { oldValue: xxx, newValue: yyy}
  					for (var comuptedVal, i = 0; i < o.properties.length; i++){
  						comuptedVal = $(_this).css(o.properties[i]);
  						if (attributes[o.properties[i]] !== comuptedVal) {
  							hasChanges = true;
  							changes[o.properties[i]] = {oldValue: attributes[o.properties[i]], newValue: comuptedVal};
  							attributes[o.properties[i]] = comuptedVal //add the attribute to the orig
  						}
  					}
  					if (hasChanges && $(_this).data('attrchange-status') === 'connected') { //disconnected logically
  						o.callback.call(_this, changes);
  					}
  				}, (o.pollInterval)?o.pollInterval: 1000)).data('attrchange-method', 'polling').data('attrchange-pollInterval', o.pollInterval).data('attrchange-status', 'connected');
  			});
  		} else {
  			return this.each(function(i, _this) { /* this one is programmatic polling */
  				var attributes = {};
  				for (var attr, i=0, attrs=_this.attributes, l=attrs.length; i<l; i++){
  					attr = attrs.item(i);
  					attributes[attr.nodeName] = attr.nodeValue;
  				}
  				$(_this).data('attrchange-polling-timer', setInterval(function () {
  					var changes = {}, hasChanges = false; // attrName: { oldValue: xxx, newValue: yyy}
  					for (var attr, i=0, attrs=_this.attributes, l=attrs.length; i<l; i++){
  						attr = attrs.item(i);
  						if (attributes.hasOwnProperty(attr.nodeName) &&
  								attributes[attr.nodeName] != attr.nodeValue) { //check the values
  							changes[attr.nodeName] = {oldValue: attributes[attr.nodeName], newValue: attr.nodeValue};
  							hasChanges = true;
  						} else if (!attributes.hasOwnProperty(attr.nodeName)) { //new attribute
  							changes[attr.nodeName] = {oldValue: '', newValue: attr.nodeValue};
  							hasChanges = true;
  						}
  						attributes[attr.nodeName] = attr.nodeValue; //add the attribute to the orig
  					}
  					if (hasChanges && $(_this).data('attrchange-status') === 'connected') { //disconnected logically
  						o.callback.call(_this, changes);
  					}
  				}, (o.pollInterval)?o.pollInterval: 1000)).data('attrchange-method', 'polling').data('attrchange-pollInterval', o.pollInterval).data('attrchange-status', 'connected');
  			});
  		}
  	}
  }

})(jQuery);
