/*
 # -----------------------------------------------------------------------------
 # ~/assets/themes/j1/modules/videojs/js/plugins/zoom.js
 # Provides the VideoJS (V8) plugin Zoom, Version 1.2.0
 # See: https://github.com/theonlyducks/videojs-zoom
 #
 # Product/Info:
 # https://github.com/theonlyducks/videojs-zoom/blob/main/README.md
 # http://jekyll.one
 #
 # Copyright (C) 2023, 2024 The Only Ducks
 # Copyright (C) 2023, 2024 Juergen Adams
 #
 # Videojs Zoom is licensed under the MIT License.
 # See: https://github.com/theonlyducks/videojs-zoom/blob/main/LICENSE
 # J1 Theme is licensed under MIT License.
 # See: https://github.com/jekyll-one/J1 Theme/blob/master/LICENSE
 # -----------------------------------------------------------------------------
*/

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('video.js')) :
	typeof define === 'function' && define.amd ? define(['video.js'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, global["@theonlyducks/videojs-zoom"] = factory(global.videojs));
})(this, (function (videojs) { 'use strict'

  const Button    = videojs.getComponent('Button');
  const Plugin    = videojs.getPlugin('plugin');
  const Component = videojs.getComponent('Component');

  const version   = '1.2.0';
	const ZOOM_SALT = 0.2;

	const DEFAULT_OPTIONS = {
	  zoom: 1,
	  moveX: 0,
	  moveY: 0,
	  flip: "+",
	  rotate: 0
	};

	class Observer {
	  static _instance = null;
	  constructor() {
	    this._listeners = [];
	  }
	  static getInstance() {
	    if (!Observer._instance) {
	      Observer._instance = new Observer();
	    }
	    return Observer._instance;
	  }
	  subscribe(event, callback) {
	    this._listeners.push({
	      event,
	      callback
	    });
	  }
	  notify(event, data) {
	    this._listeners.forEach(listener => {
	      if (listener.event === event) {
	        return listener.callback(data);
	      }
	    });
	  }
	}

	class ZoomFunction {
	  constructor(player, options) {
	    this.player = player.el();
	    this.plugin = options.plugin;
	    this.observer = Observer.getInstance();
	    player.on('playing', () => {
	      this._updateSalt();
	    });
	    this.observer.subscribe('change', state => {
	      this.state = {
	        ...state,
	        saltMoveX: 70,
	        saltMoveY: 70
	      };
	      this._updateSalt();
	    });
	  }

	  _updateSalt() {
	    this.state.saltMoveX = this.player.offsetWidth * ZOOM_SALT / 2;
	    this.state.saltMoveY = this.player.offsetHeight * ZOOM_SALT / 2;
	  }
	  _zoom() {
	    this.plugin.zoom(this.state.zoom);
	    this.plugin.listeners.change(this.state);
	  }
	  zoomIn() {
	    if (this.state.zoom >= 9.8) return;
	    this.state.moveCount++;
	    this.state.zoom += ZOOM_SALT;
	    this.plugin.zoom(this.state.zoom);
	    this.plugin.listeners.change(this.state);
	  }
	  zoomOut() {
	    if (this.state.zoom <= 1) return;
	    this.state.moveCount--;
	    this.state.zoom -= ZOOM_SALT;
	    this.plugin.zoom(this.state.zoom);
	    this.plugin.move(0, 0);
	    this.plugin.listeners.change(this.state);
	  }
	  _move() {
	    this.plugin.move(this.state.moveX, this.state.moveY);
	    this.plugin.listeners.change(this.state);
	  }
	  moveUp() {
	    const next = this.state.moveY + this.state.saltMoveY;
	    const available = this.state.moveCount * this.state.saltMoveY;
	    if (available < next) return;
	    this._updateSalt();
	    this.state.moveY += this.state.saltMoveY;
	    this._move();
	  }
	  moveDown() {
	    const next = this.state.moveY - this.state.saltMoveY;
	    const available = this.state.moveCount * this.state.saltMoveY;
	    if (-available > next) return;
	    this._updateSalt();
	    this.state.moveY -= this.state.saltMoveY;
	    this._move();
	  }
	  reset() {
	    this.state.zoom = 1;
	    this.state.moveX = 0;
	    this.state.moveY = 0;
	    this.state.rotate = 0;
	    this.state.moveCount = 0;
	    this.plugin.zoom(1);
	    this.plugin.flip("+");
	    this.plugin.rotate(0);
	    this.plugin.move(0, 0);
	    this.plugin.listeners.change(this.state);
	  }
	  moveLeft() {
	    const next = this.state.moveX + this.state.saltMoveX;
	    const available = this.state.moveCount * this.state.saltMoveX;
	    if (available < next) return;
	    this._updateSalt();
	    this.state.moveX += this.state.saltMoveX;
	    this._move();
	  }
	  moveRight() {
	    const next = this.state.moveX - this.state.saltMoveX;
	    const available = this.state.moveCount * this.state.saltMoveX;
	    if (-available > next) return;
	    this._updateSalt();
	    this.state.moveX -= this.state.saltMoveX;
	    this._move();
	  }
	  _rotate() {
	    this.plugin.rotate(this.state.rotate);
	    this.plugin.listeners.change(this.state);
	  }
	  rotate() {
	    this.state.rotate -= 90;
	    if (this.state.rotate === -360) {
	      this.state.rotate = 0;
	    }
	    this._rotate();
	  }
	  _flip() {
	    this.plugin.flip(this.state.flip);
	    this.plugin.listeners.change(this.state);
	  }
	  flip() {
	    this.state.flip = this.state.flip === "+" ? "-" : "+";
	    this._flip();
	  }
	}

	class ZoomModalContent {
	  constructor() {
	    this.content = null;
	    this._createContent();
	  }

	  getContent() {
	    return this.content;
	  }
	  _createContent() {
	    this.content = `
			<div class="vjs-zoom-duck__container--row">
				<button id="vjs-zoom-duck__zoomIn" class="vjs-zoom-duck__button">
					<span class="vjs-zoom-icons">add</span>
				</button>
				<span class="vjs-zoom-duck__space"></span>
				<button id="vjs-zoom-duck__zoomOut" class="vjs-zoom-duck__button">
					<span class="vjs-zoom-icons">remove</span>
				</button>
			</div>
			<div class="vjs-zoom-duck__container--row">
				<span class="vjs-zoom-duck__space"></span>
				<button id="vjs-zoom-duck__moveUp" class="vjs-zoom-duck__button">
					<span class="vjs-zoom-icons">arrow_drop_up</span>
				</button>
				<span class="vjs-zoom-duck__space"></span>
			</div>
			<div class="vjs-zoom-duck__container--row">
				<button id="vjs-zoom-duck__moveLeft" class="vjs-zoom-duck__button">
					<span class="vjs-zoom-icons">arrow_left</span>
				</button>
				<button id="vjs-zoom-duck__reset" class="vjs-zoom-duck__button">
					<span class="vjs-zoom-icons">fiber_manual_record</span>
				</button>
				<button id="vjs-zoom-duck__moveRight" class="vjs-zoom-duck__button">
					<span class="vjs-zoom-icons">arrow_right</span>
				</button>
			</div>
			<div class="vjs-zoom-duck__container--row">
				<span class="vjs-zoom-duck__space"></span>
				<button id="vjs-zoom-duck__moveDown" class="vjs-zoom-duck__button">
					<span class="vjs-zoom-icons">arrow_drop_down</span>
				</button>
				<span class="vjs-zoom-duck__space"></span>
			</div>
			<div class="vjs-zoom-duck__container--row">
				<button id="vjs-zoom-duck__rotate" class="vjs-zoom-duck__button">
					<span class="vjs-zoom-icons">rotate_left</span>
				</button>
				<span class="vjs-zoom-duck__space"></span>
				<button id="vjs-zoom-duck__flip" class="vjs-zoom-duck__button">
					<span class="vjs-zoom-icons">swap_horiz</span>
				</button>
			</div>
		`;
	  }
	}

	class ZoomModal extends Component {
	  constructor(player, options) {
	    super(player, options);
	    this.player = player.el();
	    this.plugin = options.plugin;
	    this.function = new ZoomFunction(player, options);
	    player.on('playing', () => {
	      this.listeners();
	    });
	  }

	  createEl() {
	    const modal = videojs.dom.createEl('div', {
	      className: 'vjs-zoom-duck__container'
	    });
	    const content = new ZoomModalContent();
	    modal.innerHTML = content.getContent();
	    return modal;
	  }
	  listeners() {
	    let buttons = this.player.getElementsByClassName('vjs-zoom-duck__button');
	    buttons = Array.from(buttons);
	    buttons.map(button => {
	      const [, action] = button.id.split('__');
	      button.onclick = () => this.function[action]();
	    });
	  }
	  toggle() {
	    const [modal] = this.player.getElementsByClassName('vjs-zoom-duck__container');
	    modal.classList.toggle('open');
	    this.plugin.listeners.click();
	  }
	  open() {
	    const [modal] = this.player.getElementsByClassName('vjs-zoom-duck__container');
	    modal.classList.add('open');
	    this.plugin.listeners.click();
	  }
	  close() {
	    const [modal] = this.player.getElementsByClassName('vjs-zoom-duck__container');
	    modal.classList.remove('open');
	    this.plugin.listeners.click();
	  }
	}

	class ZoomButton extends Button {
	  constructor(player, options) {
	    super(player, options);
	    this.isOpen = false;
	    player.on('useractive', () => {
	      if (!this.isOpen) return;
	      const modal = this.player().getChild('ZoomModal');
	      modal.open();
	    });
	    player.on('userinactive', () => {
	      if (!this.isOpen) return;
	      const modal = this.player().getChild('ZoomModal');
	      modal.close();
	    });
	  }

	  buildCSSClass() {
	    return `vjs-zoom-duck ${super.buildCSSClass()}`;
	  }
	  handleClick() {
	    const modal = this.player().getChild('ZoomModal');
	    videojs.log('[~Zoom Plugin] button handleClick');
	    this.isOpen = !this.isOpen;
	    modal.toggle();
	  }
	}

	class ZoomPlugin extends Plugin {
	  constructor(player) {
	    let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	    super(player, options);
	    videojs.log('[~Zoom Plugin] start ', options);
	    this.player = player.el();
	    this.listeners = {
	      click: () => {},
	      change: () => {}
	    };
	    this.player.style.overflow = 'hidden';
	    this.state = videojs.mergeOptions(DEFAULT_OPTIONS, options);
	    this.state.flip = "+";
	    this.state.moveCount = Math.round((this.state.zoom - 1) / ZOOM_SALT);
	    player.getChild('ControlBar').addChild('ZoomButton');
	    player.addChild('ZoomModal', {
	      plugin: this,
	      state: this.state
	    });
	    this._observer = Observer.getInstance();
	    this._setTransform();
	  }

	  zoom(value) {
	    if (value <= 0) {
	      throw new Error('Zoom value invalid');
	    }
	    this.state.zoom = value;
	    this.state.moveCount = Math.round((this.state.zoom - 1) / ZOOM_SALT);
	    this._setTransform();
	  }
	  rotate(value) {
	    this.state.rotate = value;
	    this._setTransform();
	  }
	  move(x, y) {
	    this.state.moveX = x;
	    this.state.moveY = y;
	    this._setTransform();
	  }
	  flip(signal) {
	    this.state.flip = signal;
	    this._setTransform();
	  }
	  toggle() {
	    const [modal] = this.player.getElementsByClassName('vjs-zoom-duck__container');
	    modal.classList.toggle('open');
	  }
	  listen(listener, callback) {
	    this.listeners[listener] = callback;
	  }
	  _notify() {
	    this._observer.notify('change', this.state);
	  }
	  _setTransform() {
	    const [video] = this.player.getElementsByTagName('video');
	    video.style.transform = `
			translate(${this.state.moveX}px, ${this.state.moveY}px)
			scale(${this.state.flip}${this.state.zoom}, ${this.state.zoom})
			rotate(${this.state.rotate}deg)
		`;
	    this._notify();
	  }
	}

	videojs.registerComponent('ZoomModal', ZoomModal);
	videojs.registerComponent('ZoomButton', ZoomButton);
	videojs.registerPlugin('zoomPlugin', ZoomPlugin);

	return ZoomPlugin;
}));
