'use strict';

/*
* @Author:              Django Wong
* @Date:                2017-05-17 01:09:22
* @Last Modified by:    Django Wong
* @Last Modified time:  2017-05-17 03:46:01
* @File Name:           videojs-next-button.js
*/

(function (videojs) {
	var Button = videojs.getComponent('Button');

	var NextButton = videojs.extend(Button, {
		constructor: function constructor(player, options) {
			Button.apply(this, arguments);
			this.next = options.next;
		},
		buildCSSClass: function buildCSSClass() {
			return 'vjs-next-button vjs-icon-next vjs-button vjs-control';
		},
		update: function update(next) {
			this.next = next;
			return this;
		},
		handleClick: function handleClick() {
			var next = this.next;
			switch (true) {
				case typeof next === 'function':
					this.next();
					break;
				case typeof next === 'string':
					window.location.href = this.next;
					break;
				default:
					break;
			}
			this.player().trigger('on-next-button-click', next);
		}
	});

	videojs.registerComponent('NextButton', NextButton);
})(videojs);
