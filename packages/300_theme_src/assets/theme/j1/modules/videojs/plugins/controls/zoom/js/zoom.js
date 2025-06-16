/*
 # -----------------------------------------------------------------------------
 # ~/assets/theme/j1/modules/videojs/js/plugins/controls/zoom/zoom.js
 # Provides the zoom plugin of version 1.2.0 for Video.js V8 and newer
 # See: https://github.com/theonlyducks/videojs-zoom
 #
 # Product/Info:
 # https://github.com/theonlyducks/videojs-zoom/blob/main/README.md
 # http://jekyll.one
 #
 # Copyright (C) 2023-2025 The Only Ducks
 # Copyright (C) 2023-2025 Juergen Adams
 #
 # Videojs Zoom is licensed under the MIT License.
 # See: https://github.com/theonlyducks/videojs-zoom/blob/main/LICENSE
 # J1 Theme is licensed under MIT License.
 # See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
 # -----------------------------------------------------------------------------
*/

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('video.js')) :
    typeof define === 'function' && define.amd ? define(['video.js'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global["@theonlyducks/videojs-zoom"] = factory(global.videojs));
})(this, (function (videojs) {
'use strict'

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }
    var videojs__default = /*#__PURE__*/_interopDefaultLegacy(videojs);

    const Button    = videojs.getComponent('Button');
    const Plugin    = videojs.getPlugin('plugin');
    const Component = videojs.getComponent('Component');

    const version   = '1.3.6';
    const ZOOM_SALT = 0.2;

    const DEFAULT_OPTIONS = {
        zoom:           1,
        moveX:          0,
        moveY:          0,
        flip:           "+",
        rotate:         0,
        showZoom:       true,
        showMove:       true,
        showRotate:     true,
        gestureHandler: false
    };

    class Observer {
        static _instance = null;

        constructor() {
            this._listeners = [];
        } // END constructor

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
    } // END class Observer

    class ZoomGesture extends Component {

        constructor(player, options) {
            super(player, options);
            this._enabled       = false;
            this._observer      = Observer.getInstance();
            this.pointers       = {};
            this.player         = player.el();
            this.state          = options.state;
            this.function       = new ZoomFunction(player, options);

            player.on("loadstart", () => {
                this.gesture();
            });

            this._observer.subscribe('plugin', state => {
                this._enabled = state.enabled;
            });
        } // END constructor

        // =====================================================================
        // methods
        // =====================================================================

        gesture() {
            this.player.addEventListener("pointerdown", event => {
                this.pointers[event.pointerId] = event;
            });

            this.player.addEventListener("pointerup", event => {
                delete this.pointers[event.pointerId];
                this.player.firstChild.style.pointerEvents = "";
            });

            this.player.addEventListener("pointerleave", event => {
                delete this.pointers[event.pointerId];
            });

            this.player.addEventListener("pointermove", event => {
                if (!this._enabled) return;
                if (!Object.keys(this.pointers).length) return;
                this.player.firstChild.style.pointerEvents = "none";
                const pointer   = this.pointers[event.pointerId];
                const moveX     = event.clientX - pointer.clientX;
                const moveY     = event.clientY - pointer.clientY;

                this.pointers[event.pointerId] = event;
                this.function.moveY(moveX);
                this.function.moveX(moveY);
            });

            this.player.addEventListener("wheel", event => {
                event.preventDefault();
                event.stopPropagation();
                if (!this._enabled) return;
                this.function.zoomHandler(-1e-2 * event.deltaY);
                this.function.moveY(0);
                this.function.moveX(0);
            });
        }

    } // END class ZoomGesture

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
        } // END constructor

        // =====================================================================
        // methods
        // =====================================================================

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

        moveX(salt) {
            const available = this._getMoveYAvailable();
            this.state.moveY = Math.max(-available, Math.min(available, this.state.moveY + salt));
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

        moveY(salt) {
            const available = this._getMoveXAvailable();
            this.state.moveX = Math.max(-available, Math.min(available, this.state.moveX + salt));
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

    } // END class ZoomFunction

    class ZoomModalContent {
        constructor() {
            this.content = null;
            this._createContent();
        } // END constructor

        // =====================================================================
        // methods
        // =====================================================================

        getContent() {
            return this.content;
        }

        _createContent() {
            const zoom = `
                <div class="vjs-zoom-buttons__container--row">
                    <button id="vjs-zoom-buttons__zoomIn" class="vjs-zoom-buttons__button">
                        <span class="vjs-zoom-icons">add</span>
                    </button>
                    <span class="vjs-zoom-buttons__space"></span>
                    <button id="vjs-zoom-buttons__zoomOut" class="vjs-zoom-buttons__button">
                        <span class="vjs-zoom-icons">remove</span>
                    </button>
                </div>
            `;

            const move = `
                <div class="vjs-zoom-buttons__container--row">
                    <span class="vjs-zoom-buttons__space"></span>
                    <button id="vjs-zoom-buttons__moveUp" class="vjs-zoom-buttons__button">
                        <span class="vjs-zoom-icons">arrow_drop_up</span>
                    </button>
                    <span class="vjs-zoom-buttons__space"></span>
                </div>
                <div class="vjs-zoom-buttons__container--row">
                    <button id="vjs-zoom-buttons__moveLeft" class="vjs-zoom-buttons__button">
                        <span class="vjs-zoom-icons">arrow_left</span>
                    </button>
                    <button id="vjs-zoom-buttons__reset" class="vjs-zoom-buttons__button">
                        <span class="vjs-zoom-icons">fiber_manual_record</span>
                    </button>
                    <button id="vjs-zoom-buttons__moveRight" class="vjs-zoom-buttons__button">
                        <span class="vjs-zoom-icons">arrow_right</span>
                    </button>
                </div>
                <div class="vjs-zoom-buttons__container--row">
                    <span class="vjs-zoom-buttons__space"></span>
                    <button id="vjs-zoom-buttons__moveDown" class="vjs-zoom-buttons__button">
                        <span class="vjs-zoom-icons">arrow_drop_down</span>
                    </button>
                    <span class="vjs-zoom-buttons__space"></span>
                </div>
            `;

            const rotate = `
                <div class="vjs-zoom-buttons__container--row">
                    <button id="vjs-zoom-buttons__rotate" class="vjs-zoom-buttons__button">
                        <span class="vjs-zoom-icons">rotate_left</span>
                    </button>
                    <span class="vjs-zoom-buttons__space"></span>
                    <button id="vjs-zoom-buttons__flip" class="vjs-zoom-buttons__button">
                        <span class="vjs-zoom-icons">swap_horiz</span>
                    </button>
                </div>
            `;

            var mergeOptions = (videojs.VERSION <= "7.10.0") ? videojs.mergeOptions : videojs.obj.merge
            var options  = mergeOptions(DEFAULT_OPTIONS, options);
            this.content = '';

            if (options.showZoom) {
                this.content += zoom;
            }

            if (options.showMove) {
                this.content += move;
            }

            if (options.showRotate) {
                this.content += rotate;
            }

        } // END _createContent

        _createContent_old() {
            this.content = `
                <div class="vjs-zoom-buttons__container--row">
                    <button id="vjs-zoom-buttons__zoomIn" class="vjs-zoom-buttons__button">
                        <span class="vjs-zoom-icons">add</span>
                    </button>
                    <span class="vjs-zoom-buttons__space"></span>
                    <button id="vjs-zoom-buttons__zoomOut" class="vjs-zoom-buttons__button">
                        <span class="vjs-zoom-icons">remove</span>
                    </button>
                </div>
                <div class="vjs-zoom-buttons__container--row">
                    <span class="vjs-zoom-buttons__space"></span>
                    <button id="vjs-zoom-buttons__moveUp" class="vjs-zoom-buttons__button">
                        <span class="vjs-zoom-icons">arrow_drop_up</span>
                    </button>
                    <span class="vjs-zoom-buttons__space"></span>
                </div>
                <div class="vjs-zoom-buttons__container--row">
                    <button id="vjs-zoom-buttons__moveLeft" class="vjs-zoom-buttons__button">
                        <span class="vjs-zoom-icons">arrow_left</span>
                    </button>
                    <button id="vjs-zoom-buttons__reset" class="vjs-zoom-buttons__button">
                        <span class="vjs-zoom-icons">fiber_manual_record</span>
                    </button>
                    <button id="vjs-zoom-buttons__moveRight" class="vjs-zoom-buttons__button">
                        <span class="vjs-zoom-icons">arrow_right</span>
                    </button>
                </div>
                <div class="vjs-zoom-buttons__container--row">
                    <span class="vjs-zoom-buttons__space"></span>
                    <button id="vjs-zoom-buttons__moveDown" class="vjs-zoom-buttons__button">
                        <span class="vjs-zoom-icons">arrow_drop_down</span>
                    </button>
                    <span class="vjs-zoom-buttons__space"></span>
                </div>
                <div class="vjs-zoom-buttons__container--row">
                    <button id="vjs-zoom-buttons__rotate" class="vjs-zoom-buttons__button">
                        <span class="vjs-zoom-icons">rotate_left</span>
                    </button>
                    <span class="vjs-zoom-buttons__space"></span>
                    <button id="vjs-zoom-buttons__flip" class="vjs-zoom-buttons__button">
                        <span class="vjs-zoom-icons">swap_horiz</span>
                    </button>
                </div>
            `;
      }

    } // END class ZoomModalContent

    class ZoomModal extends Component {
        constructor(player, options) {
            super(player, options);
            this.player     = player.el();
            this.plugin     = options.plugin;
            this.function   = new ZoomFunction(player, options);

            player.on('playing', () => {
                this.listeners();
            });
        } // END constructor

        // =====================================================================
        // methods
        // =====================================================================

        createEl() {
            const modal = videojs.dom.createEl('div', {
            className: 'vjs-zoom-buttons__container'
            });
            const content   = new ZoomModalContent();
            modal.innerHTML = content.getContent();

            return modal;
        }

        listeners() {
            var buttons = this.player.getElementsByClassName('vjs-zoom-buttons__button');
            buttons     = Array.from(buttons);

            buttons.map(button => {
            const [, action] = button.id.split('__');
            button.onclick = () => this.function[action]();
            });
        }

        toggle() {
            const [modal] = this.player.getElementsByClassName('vjs-zoom-buttons__container');
            modal.classList.toggle('open');

            this.plugin.listeners.click();
        }

        open() {
            const [modal] = this.player.getElementsByClassName('vjs-zoom-buttons__container');
            modal.classList.add('open');

            this.plugin.listeners.click();
        }

        close() {
            const [modal] = this.player.getElementsByClassName('vjs-zoom-buttons__container');
            modal.classList.remove('open');

            this.plugin.listeners.click();
        }

    } // END class ZoomModal

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
        } // END constructor

        // =====================================================================
        // methods
        // =====================================================================

        buildCSSClass() {
            return `vjs-zoom-buttons ${super.buildCSSClass()}`;
        }

        handleClick() {
            const modal = this.player().getChild('ZoomModal');
            videojs.log('[~Zoom Plugin] button handleClick');
            this.isOpen = !this.isOpen;
            modal.toggle();
        }

    } // END class ZoomButton

    class zoomButtons extends Plugin {
        constructor(player) {
            var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            super(player, options);
            videojs.log('[~Zoom Plugin] start ', options);
            this.player = player.el();

            this.listeners = {
                click:  () => {},
                change:     () => {}
            };

            // Use built-in merge function from Video.js v5.0+ or v4.4.0+
            // videojs.mergeOptions is deprecated in V8 and will be removed in V9
            var mergeOptions = (videojs.VERSION <= "7.10.0") ? videojs.mergeOptions : videojs.obj.merge;

            this.state = mergeOptions(DEFAULT_OPTIONS, options);
                this.player.style.overflow  = 'hidden';
                this.state.flip             = "+";
                this.state.moveCount        = Math.round((this.state.zoom - 1) / ZOOM_SALT);

                player.getChild('ControlBar').addChild('ZoomButton');

                player.addChild('ZoomModal', {
                    plugin: this,
                    state: this.state
                });

                player.addChild('ZoomGesture', {
                    plugin: this,
                    state: this.state
                });

                this._observer = Observer.getInstance();
                this._observer.notify("plugin", { enabled: this._enabled });
                this._setTransform();

            } // END constructor

        // =====================================================================
        // methods
        // =====================================================================

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
            const [modal] = this.player.getElementsByClassName('vjs-zoom-buttons__container');
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

    } // END class zoomButtons

    // register components|plugin
    //
    videojs.registerComponent('ZoomModal', ZoomModal);
    videojs.registerComponent('ZoomGesture', ZoomGesture);
    videojs.registerComponent('ZoomButton', ZoomButton);
    videojs.registerPlugin('zoomButtons', zoomButtons);

    return zoomButtons;
}));
